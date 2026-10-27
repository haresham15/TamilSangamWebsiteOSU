// src/components/games-hero/compositor/LayeredFocusCompositor.ts
import * as THREE from "three";

export const fullscreenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const blurFragment = /* glsl */ `
  #include <packing>
  uniform sampler2D uSource;
  uniform sampler2D uDepth;
  uniform vec2 uRadius;
  uniform float uTaps;
  uniform float uBackground;
  uniform float uHighlightBoost;
  varying vec2 vUv;

  void main() {
    float radiusScale = 1.0;
    if (uBackground > 0.5) {
      float depth = texture2D(uDepth, vUv).x;
      float distanceToCamera = -perspectiveDepthToViewZ(depth, 1.0, 400.0);
      radiusScale = 0.8 + 0.4 * (1.0 - smoothstep(8.0, 60.0, distanceToCamera));
    }

    vec4 sum = vec4(0.0);
    float totalWeight = 0.0;
    for (int i = 0; i < 32; i++) {
      if (float(i) >= uTaps) break;
      float radius = sqrt((float(i) + 0.5) / uTaps);
      float angle = float(i) * 2.39996323; // Golden angle Vogel disc (137.508 deg)
      vec2 sampleUv = vUv + vec2(cos(angle), sin(angle)) * radius * uRadius * radiusScale;
      vec4 sampleColor = texture2D(uSource, clamp(sampleUv, 0.0, 1.0));
      float luma = dot(sampleColor.rgb, vec3(0.2126, 0.7152, 0.0722));
      // Cinema 35mm bokeh: sample weighting with highlight bloom and subtle iris edge ring
      float irisRing = 1.0 + 0.22 * smoothstep(0.65, 0.98, radius);
      float weight = (1.0 + uHighlightBoost * 2.5 * smoothstep(0.75, 1.2, luma)) * irisRing;
      sum += sampleColor * weight;
      totalWeight += weight;
    }
    // Shared premultiplied alpha: eliminates dark halos around defocused foreground rims
    gl_FragColor = sum / totalWeight;
  }
`;

export const compositeFragment = /* glsl */ `
  uniform sampler2D uBackground;
  uniform sampler2D uForeground;
  uniform sampler2D uLensMask;
  uniform float uLensPop;
  uniform vec2 uTexel;
  uniform float uFxaa;
  varying vec2 vUv;

  vec3 compositeAt(vec2 uv) {
    vec3 background = texture2D(uBackground, uv).rgb;
    vec4 foreground = texture2D(uForeground, uv);
    float lens = texture2D(uLensMask, uv).r * uLensPop;

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
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export interface LayeredFocusTargets {
  hdr: boolean;
  background: THREE.WebGLRenderTarget;
  foreground: THREE.WebGLRenderTarget;
  mask: THREE.WebGLRenderTarget;
  backgroundBlur: THREE.WebGLRenderTarget;
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

  const makeTarget = (depthBuffer = false) =>
    new THREE.WebGLRenderTarget(1, 1, {
      type,
      depthBuffer,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

  const background = makeTarget(true);
  background.depthTexture = new THREE.DepthTexture(1, 1, THREE.UnsignedIntType);

  const foreground = makeTarget(true);
  foreground.samples = tier === "A" ? Math.min(4, gl.capabilities.maxSamples) : 0;

  const mask = makeTarget();
  const backgroundBlur = makeTarget();
  const foregroundBlur = makeTarget();
  const maskBlur = makeTarget();

  const geometry = new THREE.PlaneGeometry(2, 2);
  const maskMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

  const blurMaterial = new THREE.ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: blurFragment,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      uSource: { value: background.texture },
      uDepth: { value: background.depthTexture },
      uRadius: { value: new THREE.Vector2() },
      uTaps: { value: 32 },
      uBackground: { value: 0 },
      uHighlightBoost: { value: 0 },
    },
  });

  const compositeMaterial = new THREE.ShaderMaterial({
    vertexShader: fullscreenVertex,
    fragmentShader: compositeFragment,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uBackground: { value: background.texture },
      uForeground: { value: foreground.texture },
      uLensMask: { value: mask.texture },
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
    background,
    foreground,
    mask,
    backgroundBlur,
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
  targets.background.dispose();
  targets.background.depthTexture?.dispose();
  targets.foreground.dispose();
  targets.mask.dispose();
  targets.backgroundBlur.dispose();
  targets.foregroundBlur.dispose();
  targets.maskBlur.dispose();
  targets.geometry.dispose();
  targets.maskMaterial.dispose();
  targets.blurMaterial.dispose();
  targets.compositeMaterial.dispose();
}
