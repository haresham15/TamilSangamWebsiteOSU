// src/components/games-hero/compositor/LayeredFocusCompositor.ts
import * as THREE from "three";

export const fullscreenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const FOCUS_GAUSSIAN_WEIGHTS = [0.2270270270, 0.1945945946, 0.1216216216, 0.0540540541, 0.0162162162] as const;

export const blurFragment = /* glsl */ `
  uniform sampler2D uSource;
  uniform vec2 uRadius;
  varying vec2 vUv;

  void main() {
    vec4 sum = texture2D(uSource, vUv) * ${FOCUS_GAUSSIAN_WEIGHTS[0]};
    ${FOCUS_GAUSSIAN_WEIGHTS.slice(1).map((weight, index) => `sum += (
      texture2D(uSource, clamp(vUv + uRadius * ${((index + 1) / 4).toFixed(2)}, 0.0, 1.0)) +
      texture2D(uSource, clamp(vUv - uRadius * ${((index + 1) / 4).toFixed(2)}, 0.0, 1.0))) * ${weight};`).join("\n    ")}
    // Positive normalized weights preserve premultiplied RGBA without introducing halos.
    gl_FragColor = sum;
  }
`;

export const compositeFragment = /* glsl */ `
  #include <tonemapping_pars_fragment>
  uniform sampler2D uBackground;
  uniform sampler2D uForeground;
  uniform sampler2D uLensMask;
  uniform float uForegroundOpacity;
  uniform float uLensPop;
  uniform vec2 uTexel;
  uniform float uFxaa;
  varying vec2 vUv;

  vec3 compositeAt(vec2 uv) {
    vec3 background = texture2D(uBackground, uv).rgb;
    vec4 foreground = texture2D(uForeground, uv);
    // Render targets contain scene-linear premultiplied foreground; grade straight color once.
    foreground.rgb = foreground.a > 0.00001
      ? ACESFilmicToneMapping(foreground.rgb / foreground.a) * foreground.a : vec3(0.0);
    foreground *= uForegroundOpacity;
    float lens = texture2D(uLensMask, uv).r * uLensPop * uForegroundOpacity;

    // +12% micro-contrast & subtle golden sunlit pop inside the lens apertures
    vec3 lensColor = max((background - 0.18) * 1.12 + 0.18, 0.0);
    lensColor *= vec3(1.015, 1.005, 0.99);
    background = mix(background, lensColor, lens);

    // Premultiplied alpha over-composite
    return foreground.rgb + background * (1.0 - foreground.a);
  }

  void main() {
    vec3 color = compositeAt(vUv);
    if (uFxaa > 0.5) {
      vec3 luma = vec3(0.299, 0.587, 0.114);
      float center = dot(color, luma);
      float nw = dot(compositeAt(vUv + uTexel * vec2(-1.0, 1.0)), luma);
      float ne = dot(compositeAt(vUv + uTexel), luma);
      float sw = dot(compositeAt(vUv - uTexel), luma);
      float se = dot(compositeAt(vUv + uTexel * vec2(1.0, -1.0)), luma);
      float lo = min(center, min(min(nw, ne), min(sw, se)));
      float hi = max(center, max(max(nw, ne), max(sw, se)));
      vec2 direction = vec2(-((nw + ne) - (sw + se)), (nw + sw) - (ne + se));
      float reduction = max((nw + ne + sw + se) * 0.03125, 0.0078125);
      direction = clamp(direction / (min(abs(direction.x), abs(direction.y)) + reduction), -8.0, 8.0) * uTexel;
      vec3 a = 0.5 * (compositeAt(vUv - direction / 6.0) + compositeAt(vUv + direction / 6.0));
      vec3 b = a * 0.5 + 0.25 * (compositeAt(vUv - direction * 0.5) + compositeAt(vUv + direction * 0.5));
      float resultLuma = dot(b, luma);
      color = resultLuma < lo || resultLuma > hi ? a : b;
    }
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export interface LayeredFocusTargets {
  hdr: boolean;
  foreground: THREE.WebGLRenderTarget;
  mask: THREE.WebGLRenderTarget;
  foregroundBlur: THREE.WebGLRenderTarget;
  maskBlur: THREE.WebGLRenderTarget;
  geometry: THREE.BufferGeometry;
  maskMaterial: THREE.MeshBasicMaterial;
  blurMaterial: THREE.ShaderMaterial;
  compositeMaterial: THREE.ShaderMaterial;
  passScene: THREE.Scene;
  passCamera: THREE.Camera;
}

export function createLayeredFocusTargets(
  gl: THREE.WebGLRenderer,
  tier: "A" | "B" | "C" = "A"
): LayeredFocusTargets {
  const hdr = gl.extensions.has("EXT_color_buffer_float");
  const type = hdr ? THREE.HalfFloatType : THREE.UnsignedByteType;

  const makeTarget = (depthBuffer = false, targetType = type) =>
    new THREE.WebGLRenderTarget(1, 1, {
      type: targetType,
      depthBuffer,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

  const foreground = makeTarget(true);
  foreground.samples = tier === "C" ? 0 : Math.min(2, gl.capabilities.maxSamples);

  const mask = makeTarget(false, THREE.UnsignedByteType);
  const foregroundBlur = makeTarget();
  const maskBlur = makeTarget(false, THREE.UnsignedByteType);

  const geometry = new THREE.PlaneGeometry(2, 2);
  const maskMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

  const blurMaterial = new THREE.ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: blurFragment,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      uSource: { value: foreground.texture },
      uRadius: { value: new THREE.Vector2() },
    },
  });

  const compositeMaterial = new THREE.ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: compositeFragment,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      toneMappingExposure: { value: gl.toneMappingExposure },
      uBackground: { value: null },
      uForeground: { value: foreground.texture },
      uLensMask: { value: mask.texture },
      uForegroundOpacity: { value: 0 },
      uLensPop: { value: 0 },
      uTexel: { value: new THREE.Vector2(1, 1) },
      uFxaa: { value: foreground.samples > 0 ? 0 : 1 },
    },
  });

  const passScene = new THREE.Scene();
  const passQuad = new THREE.Mesh(geometry, blurMaterial);
  passQuad.frustumCulled = false;
  passScene.add(passQuad);

  const passCamera = new THREE.Camera();

  return {
    hdr,
    foreground,
    mask,
    foregroundBlur,
    maskBlur,
    geometry,
    maskMaterial,
    blurMaterial,
    compositeMaterial,
    passScene,
    passCamera,
  };
}

export function disposeLayeredFocusTargets(targets: LayeredFocusTargets): void {
  targets.foreground.dispose();
  targets.mask.dispose();
  targets.foregroundBlur.dispose();
  targets.maskBlur.dispose();
  targets.geometry.dispose();
  targets.maskMaterial.dispose();
  targets.blurMaterial.dispose();
  targets.compositeMaterial.dispose();
}
