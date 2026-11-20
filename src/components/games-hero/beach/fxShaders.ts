/**
 * GLSL for the blast effects. All outputs are premultiplied linear HDR (blend ONE, ONE_MINUS_SRC_ALPHA):
 * fire emission rides on top of the occluding body in one pass. Fog follows the scene's THREE.Fog/FogExp2
 * (fogged towards fogColor·alpha so emission fades with distance, not glows through it). Tone mapping and
 * output colour space only apply when drawing straight to the canvas, as with built-in materials.
 */

const NOISE = /* glsl */ `
  float fxHash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  float fxNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(fxHash(i), fxHash(i + vec3(1, 0, 0)), f.x), mix(fxHash(i + vec3(0, 1, 0)), fxHash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(fxHash(i + vec3(0, 0, 1)), fxHash(i + vec3(1, 0, 1)), f.x), mix(fxHash(i + vec3(0, 1, 1)), fxHash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float fxFbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * fxNoise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v / 0.9375;
  }
`;

const FOG_FACTOR = /* glsl */ `
  float fxFogFactor() {
    #ifdef USE_FOG
      #ifdef FOG_EXP2
        return 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
      #else
        return smoothstep(fogNear, fogFar, vFogDepth);
      #endif
    #else
      return 0.0;
    #endif
  }
`;

/** Premultiplied HDR → fog → (canvas only) tone map + colour space, kept premultiplied. */
const FINISH = /* glsl */ `
  vec4 fxFinish(vec3 premultiplied, float alpha) {
    #ifdef USE_FOG
      premultiplied = mix(premultiplied, fogColor * alpha, fxFogFactor());
    #endif
    float a = max(alpha, 1e-4);
    gl_FragColor = vec4(premultiplied / a, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    return vec4(gl_FragColor.rgb * alpha, alpha);
  }
`;

const BLACKBODY = /* glsl */ `
  // Tanner Helland's fit, sRGB-encoded, decoded to linear; max channel 1.
  vec3 fxBlackbody(float kelvin) {
    float t = clamp(kelvin, 1000.0, 12000.0) / 100.0;
    float r = t <= 66.0 ? 1.0 : clamp(1.292936 * pow(t - 60.0, -0.1332047), 0.0, 1.0);
    float g = t <= 66.0 ? clamp(0.3900816 * log(t) - 0.6318414, 0.0, 1.0) : clamp(1.1298909 * pow(t - 60.0, -0.0755148), 0.0, 1.0);
    float b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : clamp(0.5432068 * log(t - 10.0) - 1.1962541, 0.0, 1.0));
    return pow(vec3(r, g, b), vec3(2.2));
  }
`;

/** Camera-facing ellipse sprites for fire, smoke and dust, depth-sorted in one draw. */
export const spriteVertex = /* glsl */ `
  attribute vec4 aCenter; // xyz, seed
  attribute vec4 aShape;  // half-extent x, half-extent y, optical depth, kind (0 smoke, 1 fire, 2 dust)
  attribute vec4 aHeat;   // emission gain, peak kelvin, under-glow, age
  varying vec2 vUv;
  varying vec4 vShape;
  varying vec4 vHeat;
  varying float vSeed;
  varying float vWorldY;
  #include <fog_pars_vertex>
  void main() {
    vUv = position.xy * 2.0;
    vShape = aShape;
    vHeat = aHeat;
    vSeed = aCenter.w;
    vec4 mvPosition = modelViewMatrix * vec4(aCenter.xyz, 1.0);
    mvPosition.xy += vUv * aShape.xy;
    // The hero camera is level, so view-space y offsets are world-y offsets.
    vWorldY = aCenter.y + vUv.y * aShape.y;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

export const spriteFragment = /* glsl */ `
  uniform float uPhase;
  uniform vec3 uSunView;
  uniform vec3 uSunRadiance;
  uniform vec3 uAmbient;
  varying vec2 vUv;
  varying vec4 vShape;
  varying vec4 vHeat;
  varying float vSeed;
  varying float vWorldY;
  #include <fog_pars_fragment>
  ${NOISE}
  ${FOG_FACTOR}
  ${FINISH}
  ${BLACKBODY}
  void main() {
    float r2 = dot(vUv, vUv);
    if (r2 >= 1.0) discard;
    float kind = vShape.w;
    float angle = vSeed * 6.2831;
    mat2 spin = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
    vec2 q = spin * vUv;
    float fire = step(0.5, kind) * step(kind, 1.5);
    // Fire boils faster and finer than soot; dust is broad and soft.
    float scale = kind > 1.5 ? 1.1 : mix(2.0, 3.4, fire);
    vec3 np = vec3(q * scale, vSeed * 17.0 + uPhase * mix(1.0, 1.8, fire));
    vec3 warp = vec3(fxFbm(np + vec3(0.0, uPhase * 0.6, 0.0)), fxFbm(np + vec3(5.2, 1.3, 2.8)), 0.0);
    float n = fxFbm(np + 1.6 * (warp - 0.5));
    // Fine grain so neighbouring lobes break into billows instead of reading as smooth balls.
    float grain = fxNoise(np * 3.3 + warp * 2.0);
    float r = sqrt(r2);
    // py: radial falloff .15→.49 of the unit cube; the noise erodes the silhouette into lobes.
    float falloff = 1.0 - smoothstep(0.22, 0.97, r + (n - 0.5) * 0.75 + (grain - 0.5) * 0.3);
    float contrast = clamp((n - mix(0.30, 0.36, fire)) / 0.30, 0.0, 1.0);
    float thickness = sqrt(1.0 - r2);
    float depth = vShape.z * mix(0.35 + 0.65 * contrast, 0.3 + 0.7 * contrast, fire) * falloff * thickness;
    float alpha = 1.0 - exp(-depth);
    // Soft contact with the sand instead of a hard clip line.
    alpha *= smoothstep(0.0, 0.6, vWorldY);
    if (alpha < 0.003) discard;

    // Fake sphere normal bent by the noise, wrapped sun + sky ambient.
    vec3 normal = normalize(vec3(vUv * 0.85 + (warp.xy - 0.5) * 0.9, thickness + 0.25));
    float sun = clamp(dot(normal, uSunView) * 0.6 + 0.4, 0.0, 1.0) * mix(0.7, 1.0, grain);
    float sky = 0.55 + 0.45 * normal.y;
    vec3 albedo = kind > 1.5 ? vec3(0.42, 0.31, 0.19) : (fire > 0.5 ? vec3(0.32, 0.18, 0.04) : vec3(0.095, 0.075, 0.058));
    // Self-shadowing: dense cores are darker away from the sun.
    // Dense soot self-shadows hard: only the sunward rim keeps direct light.
    float shadow = mix(1.0, mix(0.55, 0.18, step(kind, 0.5)), contrast * (1.0 - sun * sun));
    vec3 lit = albedo * (uSunRadiance * sun * sun * mix(0.6, 1.0, step(0.5, kind)) + uAmbient * sky * mix(0.6, 1.0, fire)) * mix(shadow, 1.0, fire) * mix(1.0, 0.25, fire);
    // Under-glow from the fire below the soot (smoke and dust only).
    lit += (1.0 - fire) * vHeat.z * vec3(1.0, 0.36, 0.08) * clamp(0.6 - vUv.y * 0.5, 0.0, 1.0) * (0.4 + 0.6 * contrast);
    vec3 color = lit * alpha;
    if (fire > 0.5) {
      // py: emission ∝ density · contrast^8, temperature 1600 K → peak K over the noise .40→.65.
      // Billboards cannot integrate along the ray, so the body glows from the (saturated) mean and the
      // noise peaks carry the white-hot flecks.
      float hot = clamp((n + (grain - 0.5) * 0.3 - 0.5) / 0.2, 0.0, 1.0);
      float core = 1.0 - smoothstep(0.0, 0.95, r);
      float heat = vHeat.x;
      vec3 body = fxBlackbody(mix(1550.0, 2100.0, contrast * sqrt(min(heat, 1.0)))) * 1.35 * sqrt(heat) * (0.55 + 0.45 * contrast);
      vec3 flecks = fxBlackbody(mix(2600.0, vHeat.y, hot)) * 6.0 * heat * pow(hot, 2.5) * (0.35 + 0.65 * core);
      color += (body * (0.75 + 0.5 * grain) + flecks) * sqrt(falloff) * smoothstep(0.0, 0.3, alpha);
    }
    gl_FragColor = fxFinish(color, alpha);
  }
`;

/** Contrail ribbon: CPU-expanded camera-facing strip; aSide −1..1 across, aAlong in metres. */
export const ribbonVertex = /* glsl */ `
  attribute float aSide;
  attribute float aAlong;
  attribute float aDensity;
  varying float vSide;
  varying float vAlong;
  varying float vDensity;
  #include <fog_pars_vertex>
  void main() {
    vSide = aSide;
    vAlong = aAlong;
    vDensity = aDensity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

export const ribbonFragment = /* glsl */ `
  uniform float uPhase;
  uniform vec3 uSunRadiance;
  uniform vec3 uAmbient;
  varying float vSide;
  varying float vAlong;
  varying float vDensity;
  #include <fog_pars_fragment>
  ${NOISE}
  ${FOG_FACTOR}
  ${FINISH}
  void main() {
    float chord = sqrt(max(0.0, 1.0 - vSide * vSide));
    // py: aged vapour, noise scale 3.6 along the tube, density 4.5 × residue.
    float n = fxFbm(vec3(vAlong * 1.2, vSide * 1.4, uPhase * 0.25));
    float density = vDensity * smoothstep(0.25, 0.75, n);
    float alpha = (1.0 - exp(-density * chord)) * 0.85;
    if (alpha < 0.003) discard;
    vec3 albedo = vec3(0.84, 0.86, 0.82);
    vec3 color = albedo * (uSunRadiance * 0.22 + uAmbient * 0.42);
    gl_FragColor = fxFinish(color * alpha, alpha);
  }
`;

/** Contrail puffs: instanced camera-facing soft blobs along the trail. */
export const puffVertex = /* glsl */ `
  attribute vec4 aPuff; // xyz, radius
  attribute vec2 aPuffMeta; // density, seed
  varying vec2 vUv;
  varying vec2 vMeta;
  #include <fog_pars_vertex>
  void main() {
    vUv = position.xy * 2.0;
    vMeta = aPuffMeta;
    vec4 mvPosition = modelViewMatrix * vec4(aPuff.xyz, 1.0);
    mvPosition.xy += vUv * aPuff.w;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

export const puffFragment = /* glsl */ `
  uniform vec3 uSunRadiance;
  uniform vec3 uAmbient;
  varying vec2 vUv;
  varying vec2 vMeta;
  #include <fog_pars_fragment>
  ${NOISE}
  ${FOG_FACTOR}
  ${FINISH}
  void main() {
    float r2 = dot(vUv, vUv);
    if (r2 >= 1.0) discard;
    float n = fxFbm(vec3(vUv * 1.7, vMeta.y * 13.0));
    float shape = 1.0 - smoothstep(0.2, 1.0, sqrt(r2) + (n - 0.5) * 0.6);
    float alpha = (1.0 - exp(-vMeta.x * shape * sqrt(1.0 - r2))) * 0.9;
    if (alpha < 0.003) discard;
    float sun = 0.55 + 0.45 * clamp(vUv.y * 0.7 + 0.5, 0.0, 1.0);
    vec3 color = vec3(0.84, 0.86, 0.82) * (uSunRadiance * 0.22 * sun + uAmbient * 0.42);
    gl_FragColor = fxFinish(color * alpha, alpha);
  }
`;

/** Ground shockwave: an open cylinder band of low dust, eroded around its circumference. */
export const shockVertex = /* glsl */ `
  attribute vec4 aShock; // centre x, centre z, radius, height
  attribute vec2 aShockMeta; // density, seed
  varying vec2 vUv;
  varying vec2 vMeta;
  varying vec3 vNormalW;
  varying vec2 vMetres;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vMetres = vec2(uv.x * 6.2832 * aShock.z, uv.y * aShock.w);
    vMeta = aShockMeta;
    vec3 world = vec3(aShock.x + position.x * aShock.z, position.y * aShock.w, aShock.y + position.z * aShock.z);
    vNormalW = normalize(vec3(position.x, 0.0, position.z));
    vec4 mvPosition = viewMatrix * vec4(world, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

export const shockFragment = /* glsl */ `
  uniform vec3 uSunWorld;
  uniform vec3 uSunRadiance;
  uniform vec3 uAmbient;
  uniform float uPhase;
  varying vec2 vUv;
  varying vec2 vMeta;
  varying vec3 vNormalW;
  varying vec2 vMetres;
  #include <fog_pars_fragment>
  ${NOISE}
  ${FOG_FACTOR}
  ${FINISH}
  void main() {
    float n = fxFbm(vec3(vMetres.x * 0.45, vMetres.y * 0.9, vMeta.y * 9.0 + uPhase * 0.5));
    float profile = (1.0 - smoothstep(0.15, 1.0, vUv.y + (n - 0.5) * 0.6)) * smoothstep(0.0, 0.08, vUv.y);
    float alpha = (1.0 - exp(-vMeta.x * profile * smoothstep(0.25, 0.7, n) * 3.0));
    if (alpha < 0.003) discard;
    float sun = clamp(dot(vNormalW, uSunWorld) * 0.5 + 0.5, 0.0, 1.0);
    vec3 color = vec3(0.42, 0.31, 0.19) * (uSunRadiance * sun + uAmbient * 0.8);
    gl_FragColor = fxFinish(color * alpha, alpha);
  }
`;
