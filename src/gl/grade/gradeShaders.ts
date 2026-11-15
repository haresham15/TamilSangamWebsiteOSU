// src/gl/grade/gradeShaders.ts
// GLSL3 sources for GradePass. RawShaderMaterial: three injects nothing, so tone mapping,
// output transfer and alpha handling below are the only conversions applied.

export const FULLSCREEN_VERT = /* glsl */ `
in vec3 position;
out vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

/** 13-tap downsample (Jimenez 2014). First pass applies the soft-knee threshold and Karis average. */
export const DOWNSAMPLE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tSrc;
uniform vec2 uTexel;
uniform float uThreshold;
uniform float uKnee;
uniform bool uPrefilter;
in vec2 vUv;
out vec4 outColor;

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

vec3 prefilter(vec3 c) {
  float l = luma(c);
  float soft = clamp(l - uThreshold + uKnee, 0.0, 2.0 * uKnee);
  soft = soft * soft / (4.0 * uKnee + 1e-4);
  float contrib = max(soft, l - uThreshold) / max(l, 1e-4);
  return c * contrib;
}

vec3 karis(vec3 a, vec3 b, vec3 c, vec3 d) {
  float wa = 1.0 / (1.0 + luma(a));
  float wb = 1.0 / (1.0 + luma(b));
  float wc = 1.0 / (1.0 + luma(c));
  float wd = 1.0 / (1.0 + luma(d));
  return (a * wa + b * wb + c * wc + d * wd) / (wa + wb + wc + wd);
}

void main() {
  vec2 t = uTexel;
  vec3 A = texture(tSrc, vUv + t * vec2(-2.0, -2.0)).rgb;
  vec3 B = texture(tSrc, vUv + t * vec2( 0.0, -2.0)).rgb;
  vec3 C = texture(tSrc, vUv + t * vec2( 2.0, -2.0)).rgb;
  vec3 D = texture(tSrc, vUv + t * vec2(-1.0, -1.0)).rgb;
  vec3 E = texture(tSrc, vUv).rgb;
  vec3 F = texture(tSrc, vUv + t * vec2( 1.0, -1.0)).rgb;
  vec3 G = texture(tSrc, vUv + t * vec2(-2.0,  0.0)).rgb;
  vec3 H = texture(tSrc, vUv + t * vec2( 2.0,  0.0)).rgb;
  vec3 I = texture(tSrc, vUv + t * vec2(-1.0,  1.0)).rgb;
  vec3 J = texture(tSrc, vUv + t * vec2( 1.0,  1.0)).rgb;
  vec3 K = texture(tSrc, vUv + t * vec2(-2.0,  2.0)).rgb;
  vec3 L = texture(tSrc, vUv + t * vec2( 0.0,  2.0)).rgb;
  vec3 M = texture(tSrc, vUv + t * vec2( 2.0,  2.0)).rgb;

  vec3 color;
  if (uPrefilter) {
    // Karis average per 2×2 block suppresses single-pixel fireflies (specular sparks).
    color = karis(D, F, I, J) * 0.5
          + karis(A, B, G, E) * 0.125
          + karis(B, C, E, H) * 0.125
          + karis(G, E, K, L) * 0.125
          + karis(E, H, L, M) * 0.125;
    color = prefilter(color);
  } else {
    color = (D + F + I + J) * 0.125
          + (A + B + G + E) * 0.03125
          + (B + C + E + H) * 0.03125
          + (G + E + K + L) * 0.03125
          + (E + H + L + M) * 0.03125;
  }
  outColor = vec4(max(color, 0.0), 1.0);
}`;

/** 3×3 tent upsample; blended additively into the next-larger mip. */
export const UPSAMPLE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tSrc;
uniform vec2 uTexel;
uniform float uRadius;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec2 t = uTexel * uRadius;
  vec3 c = texture(tSrc, vUv + vec2(-t.x, -t.y)).rgb
         + texture(tSrc, vUv + vec2( 0.0, -t.y)).rgb * 2.0
         + texture(tSrc, vUv + vec2( t.x, -t.y)).rgb
         + texture(tSrc, vUv + vec2(-t.x,  0.0)).rgb * 2.0
         + texture(tSrc, vUv).rgb * 4.0
         + texture(tSrc, vUv + vec2( t.x,  0.0)).rgb * 2.0
         + texture(tSrc, vUv + vec2(-t.x,  t.y)).rgb
         + texture(tSrc, vUv + vec2( 0.0,  t.y)).rgb * 2.0
         + texture(tSrc, vUv + vec2( t.x,  t.y)).rgb;
  outColor = vec4(c / 16.0, 1.0);
}`;

const TONEMAP_GLSL = /* glsl */ `
vec3 RRTAndODTFit(vec3 v) {
  vec3 a = v * (v + 0.0245786) - 0.000090537;
  vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
  return a / b;
}
// three.js ACESFilmicToneMapping (r186), exposure applied by the caller.
vec3 acesFilmic(vec3 color) {
  const mat3 ACESInputMat = mat3(
    vec3(0.59719, 0.07600, 0.02840),
    vec3(0.35458, 0.90834, 0.13383),
    vec3(0.04823, 0.01566, 0.83777));
  const mat3 ACESOutputMat = mat3(
    vec3( 1.60475, -0.10208, -0.00327),
    vec3(-0.53108,  1.10813, -0.07276),
    vec3(-0.07367, -0.00605,  1.07602));
  color /= 0.6;
  color = ACESInputMat * color;
  color = RRTAndODTFit(color);
  color = ACESOutputMat * color;
  return clamp(color, 0.0, 1.0);
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
  vec3( 1.6605, -0.1246, -0.0182),
  vec3(-0.5876,  1.1329, -0.1006),
  vec3(-0.0728, -0.0083,  1.1187));
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
  vec3(0.6274, 0.0691, 0.0164),
  vec3(0.3293, 0.9195, 0.0880),
  vec3(0.0433, 0.0113, 0.8956));
vec3 agxDefaultContrastApprox(vec3 x) {
  vec3 x2 = x * x;
  vec3 x4 = x2 * x2;
  return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232;
}
// three.js AgXToneMapping (r186), exposure applied by the caller.
vec3 agx(vec3 color) {
  const mat3 AgXInsetMatrix = mat3(
    vec3(0.856627153315983, 0.137318972929847, 0.11189821299995),
    vec3(0.0951212405381588, 0.761241990602591, 0.0767994186031903),
    vec3(0.0482516061458583, 0.101439036467562, 0.811302368396859));
  const mat3 AgXOutsetMatrix = mat3(
    vec3( 1.1271005818144368, -0.1413297634984383, -0.14132976349843826),
    vec3(-0.11060664309660323, 1.157823702216272, -0.11060664309660294),
    vec3(-0.016493938717834573, -0.016493938717834257, 1.2519364065950405));
  const float AgxMinEv = -12.47393;
  const float AgxMaxEv = 4.026069;
  color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
  color = AgXInsetMatrix * color;
  color = max(color, 1e-10);
  color = log2(color);
  color = (color - AgxMinEv) / (AgxMaxEv - AgxMinEv);
  color = clamp(color, 0.0, 1.0);
  color = agxDefaultContrastApprox(color);
  color = AgXOutsetMatrix * color;
  color = pow(max(vec3(0.0), color), vec3(2.2));
  color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
  return clamp(color, 0.0, 1.0);
}
vec3 srgbOETF(vec3 c) {
  return mix(c * 12.92, pow(c, vec3(0.41666)) * 1.055 - 0.055, step(0.0031308, c));
}`;

const NOISE_GLSL = /* glsl */ `
// Interleaved gradient noise: cheap, temporally stable per seed.
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}`;

/**
 * Composite: linear HDR scene (premultiplied) + bloom → exposure → ACES/AgX → sRGB OETF →
 * 33³ LUT mix → vignette (postprocessing DEFAULT technique) → midtone grain at 24 Hz →
 * ±0.5/255 dither → premultiplied output.
 */
export const COMPOSITE_FRAG = /* glsl */ `
precision highp float;
precision highp sampler3D;
uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler3D tLut;
uniform bool uBloomOn;
uniform float uBloomIntensity;
uniform float uExposure;
uniform int uToneMap;
uniform float uLutSize;
uniform float uLutOpacity;
uniform float uVigOffset;
uniform float uVigDarkness;
uniform float uGrain;
uniform float uGrainSeed;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 outColor;
${TONEMAP_GLSL}
${NOISE_GLSL}
void main() {
  vec4 s = texture(tScene, vUv);
  vec3 bloom = uBloomOn ? texture(tBloom, vUv).rgb * uBloomIntensity : vec3(0.0);
  vec3 lin = s.rgb + bloom;
  float a = clamp(s.a + dot(bloom, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
  if (a < 1e-4) { outColor = vec4(0.0); return; }
  vec3 c = (lin / a) * uExposure;

  c = uToneMap == 1 ? agx(c) : acesFilmic(c);
  c = srgbOETF(c);

  vec3 lutCoord = c * ((uLutSize - 1.0) / uLutSize) + 0.5 / uLutSize;
  c = mix(c, texture(tLut, lutCoord).rgb, uLutOpacity);

  float d = distance(vUv, vec2(0.5));
  c *= smoothstep(0.8, uVigOffset * 0.799, d * (uVigDarkness + uVigOffset));

  // Zero-mean film grain weighted to midtones: blacks stay page-black (seam with the
  // DOM background), whites stay clean. Screen-blend grain lifted #050201 to grey.
  vec2 px = vUv * uResolution;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float w = smoothstep(0.02, 0.25, l) * (1.0 - smoothstep(0.75, 1.0, l));
  c += (hash12(px + uGrainSeed * 61.7) - 0.5) * uGrain * w;

  c += (ign(px + uGrainSeed) - 0.5) / 255.0;
  outColor = vec4(clamp(c, 0.0, 1.0) * a, a);
}`;

/**
 * Tier B overlay: vignette only, drawn over drei's normal render with blend
 * (ONE, ONE_MINUS_SRC_ALPHA) → result = dst · f. Grain needs a signed, luminance-weighted
 * offset that fixed-function blending cannot express without lifting blacks, so it is
 * full-grade only.
 */
export const OVERLAY_FRAG = /* glsl */ `
precision highp float;
uniform float uVigOffset;
uniform float uVigDarkness;
in vec2 vUv;
out vec4 outColor;
void main() {
  float d = distance(vUv, vec2(0.5));
  float f = smoothstep(0.8, uVigOffset * 0.799, d * (uVigDarkness + uVigOffset));
  outColor = vec4(0.0, 0.0, 0.0, 1.0 - f);
}`;
