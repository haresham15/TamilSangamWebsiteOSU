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
  uniform float uClamp;
  varying vec2 vUv;

  // Out-of-focus HDR specks (blast rim light on a fingertip) otherwise print each sparse tap as a dot.
  vec4 tap(vec2 uv) {
    vec4 s = texture2D(uSource, clamp(uv, 0.0, 1.0));
    if (uClamp > 0.0) s.rgb = min(s.rgb, vec3(uClamp * s.a));
    return s;
  }

  void main() {
    vec4 sum = tap(vUv) * ${FOCUS_GAUSSIAN_WEIGHTS[0]};
    ${FOCUS_GAUSSIAN_WEIGHTS.slice(1).map((weight, index) => `sum += (
      tap(vUv + uRadius * ${((index + 1) / 4).toFixed(2)}) +
      tap(vUv - uRadius * ${((index + 1) / 4).toFixed(2)})) * ${weight};`).join("\n    ")}
    // Positive normalized weights preserve premultiplied RGBA without introducing halos.
    gl_FragColor = sum;
  }
`;

export const compositeFragment = /* glsl */ `
  #include <tonemapping_pars_fragment>
  uniform sampler2D uBackground;
  // 1 = scene-linear HDR background (the live beach) graded here with gamesAgX; 0 = display-referred texture.
  uniform float uBackgroundLinear;
  uniform sampler2D uForeground;
  uniform sampler2D uLensMask;
  uniform float uForegroundOpacity;
  uniform float uLensPop;
  uniform vec2 uTexel;
  uniform float uFxaa;
  uniform float uAspect;
  uniform float uTextureAspect;
  uniform float uBgCenterX;
  // Cinematic look (0 = legacy ACES foreground, no plate treatment).
  uniform float uLook;
  uniform float uLookPower;
  uniform float uGrain;
  uniform float uGrainSeed;
  uniform vec4 uHeat[3];
  uniform float uHeatPhase;
  uniform vec3 uSkyReflection;
  uniform float uFgSoft;
  varying vec2 vUv;

  float gamesHash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float gamesNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(gamesHash(i), gamesHash(i + vec2(1.0, 0.0)), f.x),
      mix(gamesHash(i + vec2(0.0, 1.0)), gamesHash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  // Blender's AgX (the offline renders' view transform) with a log-space power standing in for its
  // "Medium High Contrast" look; one transform for the live beach, skin and acetate.
  vec3 gamesAgX(vec3 color) {
    const mat3 inset = mat3(
      vec3(0.856627153315983, 0.137318972929847, 0.11189821299995),
      vec3(0.0951212405381588, 0.761241990602591, 0.0767994186031903),
      vec3(0.0482516061458583, 0.101439036467562, 0.811302368396859));
    const mat3 outset = mat3(
      vec3(1.1271005818144368, -0.1413297634984383, -0.14132976349843826),
      vec3(-0.11060664309660323, 1.157823702216272, -0.11060664309660294),
      vec3(-0.016493938717834573, -0.016493938717834257, 1.2519364065950405));
    const float minEv = -12.47393;
    const float maxEv = 4.026069;
    color *= toneMappingExposure;
    color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
    color = inset * color;
    color = clamp((log2(max(color, 1e-10)) - minEv) / (maxEv - minEv), 0.0, 1.0);
    color = agxDefaultContrastApprox(color);
    color = pow(max(color, 0.0), vec3(uLookPower));
    color = outset * color;
    color = pow(max(vec3(0.0), color), vec3(2.2));
    color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
    return clamp(color, 0.0, 1.0);
  }

  // Heat haze above each blast: a scroll-driven refraction of the background, never a blur.
  vec2 heatOffset(vec2 bgUv) {
    vec2 offset = vec2(0.0);
    for (int i = 0; i < 3; i++) {
      vec4 heat = uHeat[i];
      if (heat.w <= 0.0) continue;
      float dx = (bgUv.x - heat.x) / heat.z;
      float rise = bgUv.y - heat.y;
      float column = exp(-dx * dx * 1.6) * smoothstep(-0.03, 0.04, rise) * (1.0 - smoothstep(0.10, 0.34, rise));
      if (column <= 0.001) continue;
      vec2 q = vec2(bgUv.x * 70.0, bgUv.y * 26.0 - uHeatPhase - float(i) * 3.1);
      vec2 wobble = vec2(gamesNoise(q), gamesNoise(q + vec2(17.3, 5.9))) - 0.5;
      offset += wobble * column * heat.w;
    }
    return offset * vec2(0.0058, 0.0036);
  }

  vec3 compositeAt(vec2 uv) {
    vec2 bgUv = uv;
    if (uTextureAspect > 0.0 && uAspect > 0.0) {
      if (uAspect < uTextureAspect) {
        float scaleX = uAspect / uTextureAspect;
        bgUv.x = clamp((uv.x - 0.5) * scaleX + uBgCenterX, 0.0, 1.0);
      } else {
        float scaleY = uTextureAspect / uAspect;
        bgUv.y = clamp((uv.y - 0.5) * scaleY + 0.5, 0.0, 1.0);
      }
    }
    if (uLook > 0.5) bgUv = clamp(bgUv + heatOffset(bgUv), 0.0, 1.0);
    float lensRaw = texture2D(uLensMask, uv).r * uForegroundOpacity;
    vec3 background = texture2D(uBackground, bgUv).rgb;
    if (uBackgroundLinear > 0.5) background = gamesAgX(background);
    vec4 foreground = texture2D(uForeground, uv);
    if (uLook > 0.5 && uFgSoft > 0.0) {
      // A touch of optical softness on the in-focus layer so the hand sits in the same lens as the beach.
      vec2 o = uTexel * uFgSoft;
      foreground = foreground * 0.4 + 0.15 * (texture2D(uForeground, uv + vec2(o.x, o.y)) + texture2D(uForeground, uv - vec2(o.x, o.y))
        + texture2D(uForeground, uv + vec2(o.x, -o.y)) + texture2D(uForeground, uv - vec2(o.x, -o.y)));
    }
    // Render targets contain scene-linear premultiplied foreground; grade straight color once.
    if (foreground.a > 0.00001) {
      vec3 straight = foreground.rgb / foreground.a;
      vec3 graded = uLook > 0.5 ? gamesAgX(straight) : ACESFilmicToneMapping(straight);
      foreground.rgb = graded * foreground.a;
    } else {
      foreground.rgb = vec3(0.0);
    }
    foreground *= uForegroundOpacity;
    float lens = lensRaw * uLensPop;

    // +12% micro-contrast & subtle golden sunlit pop inside the lens apertures
    vec3 lensColor = max((background - 0.18) * 1.12 + 0.18, 0.0);
    lensColor *= vec3(1.015, 1.005, 0.99);
    background = mix(background, lensColor, lens);
    if (uLook > 0.5 && lensRaw > 0.002) {
      // Coated glass: a faint reflection of the sky, brighter toward the top of the frame.
      // (Edge refraction from the quarter-resolution aperture mask stair-stepped the background; left out.)
      vec3 sky = mix(uSkyReflection * 0.82, uSkyReflection * 1.08, smoothstep(0.2, 0.95, uv.y));
      float sheen = (0.08 + 0.07 * smoothstep(0.35, 1.0, uv.y)) * lensRaw;
      background = mix(background, sky, sheen);
    }

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
    if (uLook > 0.5) {
      // One shared, display-referred grain over both layers: peak ±uGrain, densest in midtones.
      // Reseeded from scroll progress, so a paused frame stays still.
      vec2 cell = floor(gl_FragCoord.xy / 1.3) + uGrainSeed * 37.0;
      float grain = gamesHash(cell) + gamesHash(cell + 71.7) - 1.0;
      float luma = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
      gl_FragColor.rgb += grain * uGrain * (0.45 + 2.2 * luma * (1.0 - luma));
    }
  }
`;

export interface LayeredFocusTargets {
  hdr: boolean;
  /** Live beach, scene-linear HDR (HalfFloat when float colour buffers are renderable), with depth. */
  background: THREE.WebGLRenderTarget;
  /** Reduced-resolution ping-pong pair for the separable background bokeh (result lands in backgroundBlur). */
  backgroundBlur: THREE.WebGLRenderTarget;
  backgroundBlurScratch: THREE.WebGLRenderTarget;
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
  tier: "A" | "B" | "C" = "A",
  /** MSAA samples for the background layer (0 → the composite runs FXAA instead). */
  backgroundSamples = 0
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

  const background = makeTarget(true);
  background.samples = Math.min(backgroundSamples, gl.capabilities.maxSamples);
  const backgroundBlur = makeTarget();
  const backgroundBlurScratch = makeTarget();

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
      uClamp: { value: 0 },
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
      uBackground: { value: background.texture },
      uBackgroundLinear: { value: 1 },
      uForeground: { value: foreground.texture },
      uLensMask: { value: mask.texture },
      uForegroundOpacity: { value: 0 },
      uLensPop: { value: 0 },
      uTexel: { value: new THREE.Vector2(1, 1) },
      uFxaa: { value: foreground.samples > 0 && background.samples > 0 ? 0 : 1 },
      uAspect: { value: 2.39 },
      uTextureAspect: { value: 2.39 },
      uBgCenterX: { value: 0.5 },
      uLook: { value: 0 },
      uLookPower: { value: 1 },
      uGrain: { value: 0 },
      uGrainSeed: { value: 0 },
      uHeat: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] },
      uHeatPhase: { value: 0 },
      uSkyReflection: { value: new THREE.Color() },
      uFgSoft: { value: 0 },
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
    backgroundBlur,
    backgroundBlurScratch,
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
  targets.background.dispose();
  targets.backgroundBlur.dispose();
  targets.backgroundBlurScratch.dispose();
  targets.foreground.dispose();
  targets.mask.dispose();
  targets.foregroundBlur.dispose();
  targets.maskBlur.dispose();
  targets.geometry.dispose();
  targets.maskMaterial.dispose();
  targets.blurMaterial.dispose();
  targets.compositeMaterial.dispose();
}
