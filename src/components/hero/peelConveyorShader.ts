import * as THREE from "three";
import { PathTextureBundle, TUBE_RADIUS_BASE } from "./pathBuilder";
import { WORLD_HV } from "./flowMath";

export interface ConveyorShaderUniforms {
  uPath: { value: THREE.DataTexture | null };
  uSMin: { value: number[] };
  uSMax: { value: number[] };
  uDs: { value: number[] };
  uL: { value: number[] };
  uF: { value: number[] };
  uP0: { value: number[] };
  uDP: { value: number };
  uP: { value: number };
  uR0: { value: number };
  uTime: { value: number };
  uZBias: { value: number };
  uH: { value: number };
  uActive: { value: number };
}

/**
 * Creates the GPU Conveyor Shader Material for Peel & Flow (§PRD 8.1 & 8.2)
 * Displaces static tube geometry vertices along composite path Pi_k(s)
 * based on analytic rope feed s = f_k(p) - a.
 * Constructs zero-twist camera-aligned frames (R = (0, 0, 1)) that never twist.
 */
export function createPeelConveyorMaterial(
  bundle: PathTextureBundle,
  zBias: number
): { material: THREE.MeshStandardMaterial; wireMaterial: THREE.MeshBasicMaterial; uniforms: ConveyorShaderUniforms } {
  const customMaterial = new THREE.MeshStandardMaterial({
    color: "#A6F0CF",
    metalness: 0.55,
    roughness: 0.22,
    emissive: "#FF9E1B",
    emissiveIntensity: 0.20,
    side: THREE.DoubleSide,
  });
  customMaterial.defines = { USE_UV: "" };

  const uniforms: ConveyorShaderUniforms = {
    uPath: { value: bundle.texture },
    uSMin: { value: bundle.sMin },
    uSMax: { value: bundle.sMax },
    uDs: { value: bundle.ds },
    uL: { value: bundle.L },
    uF: { value: bundle.F },
    uP0: { value: bundle.p0 },
    uDP: { value: bundle.dP },
    uP: { value: 0 },
    uR0: { value: TUBE_RADIUS_BASE },
    uTime: { value: 0 },
    uZBias: { value: zBias },
    uH: { value: 0.02 },
    uActive: { value: 1.0 },
  };

  customMaterial.onBeforeCompile = (shader) => {
    // Attach uniforms
    Object.assign(shader.uniforms, uniforms);

    // 1. Vertex Shader Injection
    shader.vertexShader = `
      uniform sampler2D uPath;
      uniform float uSMin[7];
      uniform float uSMax[7];
      uniform float uDs[7];
      uniform float uL[7];
      uniform float uF[7];
      uniform float uP0[7];
      uniform float uDP;
      uniform float uP;
      uniform float uR0;
      uniform float uTime;
      uniform float uZBias;
      uniform float uH;
      uniform float uActive;

      attribute float aStrand;
      attribute float aA;
      attribute float aOmega;

      float getSMin(int k) {
        if (k == 0) return uSMin[0]; if (k == 1) return uSMin[1]; if (k == 2) return uSMin[2];
        if (k == 3) return uSMin[3]; if (k == 4) return uSMin[4]; if (k == 5) return uSMin[5];
        return uSMin[6];
      }
      float getSMax(int k) {
        if (k == 0) return uSMax[0]; if (k == 1) return uSMax[1]; if (k == 2) return uSMax[2];
        if (k == 3) return uSMax[3]; if (k == 4) return uSMax[4]; if (k == 5) return uSMax[5];
        return uSMax[6];
      }
      float getL(int k) {
        if (k == 0) return uL[0]; if (k == 1) return uL[1]; if (k == 2) return uL[2];
        if (k == 3) return uL[3]; if (k == 4) return uL[4]; if (k == 5) return uL[5];
        return uL[6];
      }
      float getF(int k) {
        if (k == 0) return uF[0]; if (k == 1) return uF[1]; if (k == 2) return uF[2];
        if (k == 3) return uF[3]; if (k == 4) return uF[4]; if (k == 5) return uF[5];
        return uF[6];
      }
      float getP0(int k) {
        if (k == 0) return uP0[0]; if (k == 1) return uP0[1]; if (k == 2) return uP0[2];
        if (k == 3) return uP0[3]; if (k == 4) return uP0[4]; if (k == 5) return uP0[5];
        return uP0[6];
      }

      // PRD §8.1: Fetch interpolated path point from float path texture
      vec3 fetchPath(int k, float s) {
        float sMin = getSMin(k);
        float sMax = getSMax(k);
        float sClamped = clamp(s, sMin, sMax);
        float u = (sClamped - sMin) / max(0.0001, sMax - sMin);
        float v = (float(k) + 0.5) / 7.0;

        // Manual linear interpolation across adjacent texels
        float xPos = u * 4095.0;
        float col0 = floor(xPos);
        float col1 = min(4095.0, col0 + 1.0);
        float frac = xPos - col0;

        vec3 p0 = texture2D(uPath, vec2((col0 + 0.5) / 4096.0, v)).xyz;
        vec3 p1 = texture2D(uPath, vec2((col1 + 0.5) / 4096.0, v)).xyz;
        return mix(p0, p1, frac);
      }

      // PRD §7.3: Arrival settle ripple
      float easeSettle(float x) {
        float c = clamp(x, 0.0, 1.0);
        float s = c * c * c * (c * (c * 6.0 - 15.0) + 10.0);
        if (x > 0.9) {
          float dx = x - 0.9;
          s += 0.012 * sin(18.0 * dx) * exp(-7.0 * dx);
        }
        return s;
      }

      varying float vDistHead;

      // PRD §6.3: Calligraphic needle tapering at head and tail (Recipe A)
      float evalTaper(float a, float L) {
        float headTaper = smoothstep(0.0, 0.14 * L, a);
        float tailTaper = smoothstep(0.0, 0.14 * L, max(0.0, L - a));
        return headTaper * tailTaper;
      }

      // PRD §7.4: Peel-lift of the tail out of plane
      vec3 calcPeelLift(float a, float sTail, float L) {
        float ell = 0.18 * ${WORLD_HV.toFixed(3)};
        float Ax = 0.10 * ${WORLD_HV.toFixed(3)};
        float Az = 0.07 * ${WORLD_HV.toFixed(3)};

        float distFromTail = max(0.0, L - a);
        float wRaw = clamp(1.0 - distFromTail / ell, 0.0, 1.0);
        float w = wRaw * wRaw;

        float g = smoothstep(-ell, -0.02, sTail) * (1.0 - smoothstep(0.0, 0.12, sTail));
        if (w <= 0.0 || g <= 0.0) return vec3(0.0);

        float factor = w * g;
        // Curls outward (+X) and toward camera (+Z)
        return vec3(factor * Ax, 0.0, factor * Az);
      }

      ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `
      #include <begin_vertex>
      vDistHead = aA;
      if (uActive > 0.5) {
        int k = int(aStrand + 0.5);
        float p0Val = getP0(k);
        float fVal = getF(k);
        float lVal = getL(k);

        float x = clamp((uP - p0Val) / uDP, 0.0, 1.0);
        float f = fVal * easeSettle(x);
        float s = f - aA;

        vec3 C0 = fetchPath(k, s);
        vec3 C1 = fetchPath(k, s + uH);
        vec3 C2 = fetchPath(k, s - uH);
        vec3 T = normalize(C1 - C2);

        // PRD §8.2: Camera-aligned zero-twist frame
        vec3 R = vec3(0.0, 0.0, 1.0);
        vec3 N = R - dot(R, T) * T;
        N = (length(N) < 1e-3) ? vec3(1.0, 0.0, 0.0) : normalize(N);
        vec3 B = cross(T, N);

        float rho = uR0 * evalTaper(aA, lVal);
        float sTail = f - lVal;
        vec3 lift = calcPeelLift(aA, sTail, lVal);

        // PRD §7.5: Small ambient ripple traveling with the thread
        float rippleZ = 0.005 * ${WORLD_HV.toFixed(3)} * sin(aA * 2.5 - uTime * 3.0) * smoothstep(0.0, 0.5 * lVal, aA);

        vec3 P = C0 + lift + vec3(0.0, 0.0, rippleZ + uZBias);
        vec3 normalOffset = cos(aOmega) * N + sin(aOmega) * B;
        transformed = P + rho * normalOffset;
      }
      `
    ).replace(
      `#include <beginnormal_vertex>`,
      `
      #include <beginnormal_vertex>
      if (uActive > 0.5) {
        int k = int(aStrand + 0.5);
        float p0Val = getP0(k);
        float fVal = getF(k);

        float x = clamp((uP - p0Val) / uDP, 0.0, 1.0);
        float f = fVal * easeSettle(x);
        float s = f - aA;

        vec3 C1 = fetchPath(k, s + uH);
        vec3 C2 = fetchPath(k, s - uH);
        vec3 T = normalize(C1 - C2);

        vec3 R = vec3(0.0, 0.0, 1.0);
        vec3 N = R - dot(R, T) * T;
        N = (length(N) < 1e-3) ? vec3(1.0, 0.0, 0.0) : normalize(N);
        vec3 B = cross(T, N);

        objectNormal = cos(aOmega) * N + sin(aOmega) * B;
      }
      `
    );

    // 2. Fragment Shader Injection: Travelling light pulses along woven threads
    shader.fragmentShader = `
      uniform float uTime;
      uniform float uP;
      varying float vDistHead;
      ${shader.fragmentShader}
    `.replace(
      `#include <emissivemap_fragment>`,
      `
      #include <emissivemap_fragment>
      // Traveling golden energy pulse along curve parameter
      float pulse = pow(0.5 + 0.5 * sin(vUv.x * 18.0 - uTime * 3.2 - uP * 12.0), 6.0);
      vec3 pulseCol = mix(vec3(1.0, 0.72, 0.25), vec3(1.0, 0.94, 0.78), pulse * 0.65);
      totalEmissiveRadiance += pulseCol * (pulse * 0.65);

      // PRD §7.6: Tapered tip highlight / terminal glow at strand heads
      float tipHighlight = (1.0 - smoothstep(0.0, 0.40, vDistHead)) * 0.45;
      totalEmissiveRadiance += vec3(1.0, 0.82, 0.35) * tipHighlight;

      // Cinematic Schlick Fresnel edge sheen on thread contours
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(0.0, dot(normalize(vNormal), viewDir)), 3.0);
      totalEmissiveRadiance += vec3(0.98, 0.72, 0.28) * (fresnel * 0.35);
      `
    );

    customMaterial.userData.shader = shader;
  };

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff41,
    wireframe: true,
    toneMapped: false,
  });

  return { material: customMaterial, wireMaterial, uniforms };
}

// ---------------------------------------------------------------------------
// Rice-powder look (cinematic path). Same conveyor maths as above; the line is drawn as a
// low granular ridge lying on the threshold stone instead of a round glossy tube.
// ---------------------------------------------------------------------------

/** World z of the threshold stone. The powder ridge, dabs and skirt all sit on it. */
export const THRESHOLD_FLOOR_Z = -0.04;

/** Uniforms shared by every powder material of one half (ridge, shadow depth, skirt). */
export interface PowderUniforms extends ConveyorShaderUniforms {
  uTexW: { value: number };
  uFloorZ: { value: number };
  uZCompress: { value: number };
  uGlow: { value: number };
  uLightTravel: { value: THREE.Vector2 };
  uSkirtOpacity: { value: number };
  uPointScale: { value: number };
  uDepthDim: { value: THREE.Vector3 };
}

export interface PowderConveyor {
  material: THREE.MeshStandardMaterial;
  depthMaterial: THREE.MeshDepthMaterial;
  skirtMaterial: THREE.ShaderMaterial;
  grainMaterial: THREE.ShaderMaterial;
  wireMaterial: THREE.MeshBasicMaterial;
  uniforms: PowderUniforms;
}

/** Scalar uniforms shared by both halves, so one write per frame updates every material. */
export interface PowderSharedUniforms {
  uP: { value: number };
  uTime: { value: number };
  uGlow: { value: number };
  uLightTravel: { value: THREE.Vector2 };
  uSkirtOpacity: { value: number };
  /** Grain point size scale: world size x framebuffer height / (2 tan(fov/2)). */
  uPointScale: { value: number };
  /** Depth falloff: (start distance, end distance, strength). */
  uDepthDim: { value: THREE.Vector3 };
}

export function createPowderSharedUniforms(): PowderSharedUniforms {
  return {
    uP: { value: 0 },
    uTime: { value: 0 },
    uGlow: { value: 1 },
    // Direction the key light travels across the stone (xy, normalised): upper-left → lower-right.
    uLightTravel: { value: new THREE.Vector2(0.76, -0.65) },
    uSkirtOpacity: { value: 1 },
    uPointScale: { value: 30 },
    uDepthDim: { value: new THREE.Vector3(12, 20, 0.5) },
  };
}

const HV = WORLD_HV.toFixed(3);

const POWDER_VERT_PARS = /* glsl */ `
  uniform sampler2D uPath;
  uniform float uSMin[7];
  uniform float uSMax[7];
  uniform float uL[7];
  uniform float uF[7];
  uniform float uP0[7];
  uniform float uDP;
  uniform float uP;
  uniform float uR0;
  uniform float uTime;
  uniform float uZBias;
  uniform float uH;
  uniform float uTexW;
  uniform float uFloorZ;
  uniform float uZCompress;

  attribute float aStrand;
  attribute float aA;
  attribute float aOmega;

  vec3 pwFetch(int k, float s) {
    float sMin = uSMin[k];
    float sMax = uSMax[k];
    float u = (clamp(s, sMin, sMax) - sMin) / max(0.0001, sMax - sMin);
    float v = (float(k) + 0.5) / 7.0;
    float xPos = u * (uTexW - 1.0);
    float col0 = floor(xPos);
    float col1 = min(uTexW - 1.0, col0 + 1.0);
    vec3 p0 = texture2D(uPath, vec2((col0 + 0.5) / uTexW, v)).xyz;
    vec3 p1 = texture2D(uPath, vec2((col1 + 0.5) / uTexW, v)).xyz;
    return mix(p0, p1, xPos - col0);
  }

  float pwEaseSettle(float x) {
    float c = clamp(x, 0.0, 1.0);
    float s = c * c * c * (c * (c * 6.0 - 15.0) + 10.0);
    if (x > 0.9) {
      float dx = x - 0.9;
      s += 0.012 * sin(18.0 * dx) * exp(-7.0 * dx);
    }
    return s;
  }

  // Rope sample on the stone. P: centreline at the ridge base. N: out of the stone
  // (camera-aligned frame), B: across the line. lift: 0 on the stone, 1 peeled off.
  // front: 1 at the tail of a strand that is being pulled (the peel front).
  void pwEvalAt(float ra, float rs, out vec3 P, out vec3 N, out vec3 B, out float rho, out float lift, out float front) {
    int k = int(rs + 0.5);
    float L = uL[k];
    float x = clamp((uP - uP0[k]) / uDP, 0.0, 1.0);
    float f = uF[k] * pwEaseSettle(x);
    float s = f - ra;

    vec3 C0 = pwFetch(k, s);
    vec3 T = normalize(pwFetch(k, s + uH) - pwFetch(k, s - uH) + vec3(1e-6, 0.0, 0.0));
    vec3 R = vec3(0.0, 0.0, 1.0);
    N = R - dot(R, T) * T;
    N = (length(N) < 1e-3) ? vec3(1.0, 0.0, 0.0) : normalize(N);
    B = cross(T, N);

    // Short taper at both ends: a hand-poured line ends quickly.
    float headT = smoothstep(0.0, 0.07 * L, ra);
    float tailT = smoothstep(0.0, 0.07 * L, max(0.0, L - ra));
    rho = uR0 * mix(0.35, 1.0, headT * tailT);

    // PRD §7.4 peel-lift (same maths as the tube shader), as a 0–1 factor.
    float ell = 0.18 * ${HV};
    float wRaw = clamp(1.0 - max(0.0, L - ra) / ell, 0.0, 1.0);
    float sTail = f - L;
    float g = smoothstep(-ell, -0.02, sTail) * (1.0 - smoothstep(0.0, 0.12, sTail));
    float peel = wRaw * wRaw * g;

    // The tail of a strand that is moving curls up off the stone: the visible peel front.
    float moving = smoothstep(0.0, 0.04, x) * (1.0 - smoothstep(0.92, 1.0, x));
    float tailW = 1.0 - smoothstep(0.0, 0.85, max(0.0, L - ra));
    float curl = tailW * tailW * moving;
    front = tailW * moving;

    lift = clamp(max(peel, curl), 0.0, 1.0);

    vec3 liftOffset = vec3(peel * 0.10 * ${HV} + curl * 0.04, 0.0, peel * 0.07 * ${HV} + curl * 0.20);
    // Ambient ripple only where the thread is off the stone; powder on the floor stays still.
    float ripple = 0.005 * ${HV} * sin(ra * 2.5 - uTime * 3.0) * lift;

    P = vec3(C0.xy, uFloorZ + 0.004 + (C0.z + uZBias) * uZCompress) + liftOffset + vec3(0.0, 0.0, ripple);
  }

  void pwEval(out vec3 P, out vec3 N, out vec3 B, out float rho, out float lift, out float front) {
    pwEvalAt(aA, aStrand, P, N, B, rho, lift, front);
  }

  // Ridge cross-section: a wide, low mound with a buried flat base; rounder when lifted.
  vec3 pwRidge(vec3 P, vec3 N, vec3 B, float rho, float lift, out vec3 nrm, out float side) {
    float seed = aStrand * 7.31 + uZBias * 113.0;
    float wn = 0.5 * sin(aA * 6.3 + seed) + 0.3 * sin(aA * 15.7 + seed * 2.1) + 0.2 * sin(aA * 37.9 + seed * 3.7);
    float hn = 0.5 * sin(aA * 9.1 + seed * 1.3) + 0.5 * sin(aA * 23.3 + seed * 0.7);
    // Pinch points where the fingers tightened, then a fuller release after each.
    float pinch = smoothstep(0.8, 1.0, sin(aA * 1.9 + seed * 1.7));
    float swell = smoothstep(0.75, 1.0, sin(aA * 1.9 + seed * 1.7 - 0.9));
    float wHalf = rho * mix((1.7 + 0.42 * wn) * (1.0 - 0.5 * pinch + 0.22 * swell), 1.0, lift);
    float hTop = rho * mix((0.72 + 0.22 * hn) * (1.0 - 0.35 * pinch + 0.2 * swell), 0.9, lift);
    float hBot = rho * mix(0.20, 0.9, lift);
    float c = cos(aOmega);
    float s = sin(aOmega);
    float hz = c >= 0.0 ? hTop : hBot;
    // Flattened shading: a low pile of powder, not a rounded rope.
    nrm = normalize(mix(normalize((s / wHalf) * B + (c / hz) * N), N, 0.15 * (1.0 - lift)));
    side = s;
    return P + s * wHalf * B + c * hz * N;
  }
`;

const POWDER_FRAG_NOISE = /* glsl */ `
  float pwHash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float pwNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(pwHash(i), pwHash(i + vec2(1.0, 0.0)), f.x), mix(pwHash(i + vec2(0.0, 1.0)), pwHash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
`;

const SKIRT_VERT = /* glsl */ `
  #include <common>
  ${POWDER_VERT_PARS}
  #include <fog_pars_vertex>
  uniform vec2 uLightTravel;
  varying float vSkV;
  varying float vSkLift;
  varying float vSkShadow;
  varying vec2 vSkGrain;
  void main() {
    vec3 P, N, B; float rho, lift, front;
    pwEval(P, N, B, rho, lift, front);
    float v = uv.y * 2.0 - 1.0;
    vec2 across = normalize(B.xy + vec2(1e-5, 0.0));
    float spread = rho * (4.2 + 2.5 * lift);
    vec3 pos = vec3(P.xy + across * v * spread, uFloorZ + 0.0015);
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vec2 acrossW = normalize((modelMatrix * vec4(across, 0.0, 0.0)).xy + vec2(1e-5, 0.0));
    vSkShadow = dot(acrossW, uLightTravel);
    vSkV = v;
    vSkLift = lift;
    vSkGrain = vec2(aA, v * spread);
    vec4 mvPosition = viewMatrix * worldPos;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const SKIRT_FRAG = /* glsl */ `
  #include <common>
  #include <fog_pars_fragment>
  ${POWDER_FRAG_NOISE}
  uniform float uSkirtOpacity;
  varying float vSkV;
  varying float vSkLift;
  varying float vSkShadow;
  varying vec2 vSkGrain;
  void main() {
    float t = abs(vSkV);
    // Contact shadow: dark core beside the ridge, pushed to the side away from the key.
    float d = abs(vSkV - 0.32 * vSkShadow);
    float dark = 1.0 - smoothstep(0.08, 0.62, d);
    dark = dark * dark * 0.8;
    // Loose grains knocked off the line.
    vec2 gp = vSkGrain * 150.0;
    vec2 cell = floor(gp);
    float h = pwHash(cell);
    vec2 off = vec2(pwHash(cell + 7.1), pwHash(cell + 3.3)) - 0.5;
    float r = length(fract(gp) - 0.5 - off * 0.5);
    float grainAA = clamp(1.0 - length(fwidth(gp)) * 0.55, 0.0, 1.0);
    float speck = step(0.78, h) * (1.0 - smoothstep(0.18, 0.32, r)) * grainAA;
    speck *= 1.0 - smoothstep(0.25, 0.95, t);
    // A thin film of powder hugging the line.
    float film = (1.0 - smoothstep(0.15, 0.6, t)) * 0.34 * (0.5 + 0.9 * pwNoise(gp * 0.12));
    float aPow = clamp(speck * 0.85 + film, 0.0, 1.0);
    float alpha = aPow + dark * (1.0 - aPow);
    vec3 powder = vec3(0.46, 0.42, 0.36);
    vec3 col = powder * aPow / max(alpha, 1e-3);
    gl_FragColor = vec4(col, alpha * (1.0 - vSkLift) * uSkirtOpacity);
    #include <fog_fragment>
  }
`;

const GRAIN_VERT = /* glsl */ `
  #include <common>
  ${POWDER_VERT_PARS}
  #include <fog_pars_vertex>
  attribute vec4 aSeed; // x: spawn depth along the tail, y: lateral side, z: phase, w: size/speed
  uniform float uPointScale;
  varying float vGrAlpha;
  varying float vGrShade;
  void main() {
    int k = int(aStrand + 0.5);
    float L = uL[k];
    float age = fract(uTime * (0.45 + 0.5 * aSeed.w) + aSeed.z);
    // Spawn on the lifted tail, land on the vacated path just behind it.
    vec3 P0, N0, B0; float r0, l0, f0;
    pwEvalAt(L - aSeed.x * 0.25, aStrand, P0, N0, B0, r0, l0, f0);
    vec3 P1, N1, B1; float r1, l1, f1;
    pwEvalAt(L + 0.05 + age * (0.2 + 0.35 * aSeed.x), aStrand, P1, N1, B1, r1, l1, f1);
    float e = age * age * (3.0 - 2.0 * age);
    vec3 pos;
    pos.xy = mix(P0.xy, P1.xy, e) + normalize(B1.xy + vec2(1e-5, 0.0)) * aSeed.y * (0.012 + 0.08 * age);
    pos.z = mix(P0.z, uFloorZ + 0.004, min(1.0, age * age * 1.7));
    float vis = f0 * smoothstep(0.0, 0.06, age) * (1.0 - smoothstep(0.7, 1.0, age));
    vGrAlpha = vis;
    vGrShade = 0.8 + 0.25 * aSeed.w;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = vis > 0.001 ? max(1.0, uPointScale * (0.6 + 0.8 * aSeed.w) / -mvPosition.z) : 0.0;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const GRAIN_FRAG = /* glsl */ `
  #include <common>
  #include <fog_pars_fragment>
  varying float vGrAlpha;
  varying float vGrShade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = (1.0 - smoothstep(0.22, 0.5, d)) * vGrAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(0.74, 0.71, 0.64) * vGrShade, a);
    #include <fog_fragment>
  }
`;

/** Grains shed from each strand's lifting tail: one point draw per half. */
export function createShedGrainGeometry(strands: number, perStrand: number, seed = 5): THREE.BufferGeometry {
  let state = seed >>> 0;
  const rand = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const n = strands * perStrand;
  const strand = new Float32Array(n);
  const seeds = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    strand[i] = Math.floor(i / perStrand);
    seeds[i * 4] = rand();
    seeds[i * 4 + 1] = rand() * 2 - 1;
    seeds[i * 4 + 2] = rand();
    seeds[i * 4 + 3] = rand();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geometry.setAttribute("aStrand", new THREE.BufferAttribute(strand, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  return geometry;
}

/**
 * Rice-powder conveyor: a matte granular ridge on the stone. Returns the lit material, a
 * matching depth material (so the shadow map sees the displaced, peeling line instead of
 * the static rest geometry) and the contact/scatter skirt drawn on the stone under it.
 */
export function createPowderConveyorMaterial(
  bundle: PathTextureBundle,
  zBias: number,
  shared: PowderSharedUniforms
): PowderConveyor {
  const uniforms: PowderUniforms = {
    uPath: { value: bundle.texture },
    uSMin: { value: bundle.sMin },
    uSMax: { value: bundle.sMax },
    uDs: { value: bundle.ds },
    uL: { value: bundle.L },
    uF: { value: bundle.F },
    uP0: { value: bundle.p0 },
    uDP: { value: bundle.dP },
    uP: shared.uP,
    uR0: { value: TUBE_RADIUS_BASE },
    uTime: shared.uTime,
    uZBias: { value: zBias },
    uH: { value: 0.02 },
    uActive: { value: 1.0 },
    uTexW: { value: bundle.texture.image.width },
    uFloorZ: { value: THRESHOLD_FLOOR_Z },
    uZCompress: { value: 0.12 },
    uGlow: shared.uGlow,
    uLightTravel: shared.uLightTravel,
    uSkirtOpacity: shared.uSkirtOpacity,
    uPointScale: shared.uPointScale,
    uDepthDim: shared.uDepthDim,
  };

  // Lit ridge
  const material = new THREE.MeshStandardMaterial({
    color: "#ece9e1",
    roughness: 0.93,
    metalness: 0.0,
    envMapIntensity: 0.35,
  });
  material.shadowSide = THREE.DoubleSide;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        ${POWDER_VERT_PARS}
        varying float vPwSide;
        varying float vPwLift;
        varying float vPwFront;
        varying vec2 vPwGrain;`
      )
      .replace(
        "#include <beginnormal_vertex>",
        `vec3 pwP, pwN, pwB; float pwRho, pwLift, pwFront;
        pwEval(pwP, pwN, pwB, pwRho, pwLift, pwFront);
        vec3 pwNrm; float pwSide;
        vec3 pwPos = pwRidge(pwP, pwN, pwB, pwRho, pwLift, pwNrm, pwSide);
        vec3 objectNormal = pwNrm;
        vPwSide = pwSide;
        vPwLift = pwLift;
        vPwFront = pwFront;
        // Grain coordinates travel with the rope: (along, across) in world units.
        vPwGrain = vec2(aA, pwSide * pwRho * 1.7);`
      )
      .replace("#include <begin_vertex>", "vec3 transformed = pwPos;");

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        ${POWDER_FRAG_NOISE}
        uniform float uTime;
        uniform float uGlow;
        uniform vec3 uDepthDim;
        varying float vPwSide;
        varying float vPwLift;
        varying float vPwFront;
        varying vec2 vPwGrain;
        float pwGrainH;`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          // Two grain scales: ~2 px clumps and ~1 px grains at desktop distance.
          vec2 gp = vPwGrain * 62.0;
          float n1 = pwNoise(gp);
          float n2 = pwNoise(gp * 2.3 + 17.3);
          // Fade the fine scale where a pixel covers several grains (distance shimmer).
          float gFade = 1.0 - smoothstep(0.8, 2.0, length(fwidth(gp * 2.3)));
          float grainV = mix(n1, n1 * 0.55 + n2 * 0.45, gFade);
          pwGrainH = grainV;
          // Density varies along the line, as from a hand releasing powder unevenly.
          float clump = pwNoise(vec2(vPwGrain.x * 9.0, vPwSide * 0.7) + 5.1) * 0.65 + pwNoise(vec2(vPwGrain.x * 23.0, 2.0)) * 0.35;
          // Porosity: solid core, stippled fringe where stone shows between grains.
          float edge = abs(vPwSide);
          float porosity = smoothstep(0.2, 1.0, edge);
          float threshold = porosity * 0.95 - 0.08 + (1.0 - clump) * 0.18;
          if (vPwLift < 0.5 && grainV < threshold) discard;
          diffuseColor.rgb *= (0.72 + 0.42 * grainV) * (0.86 + 0.2 * clump);
          // The peel front warms to turmeric-gold as it lifts (glow is added in emissive below).
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95, 0.62, 0.22), vPwFront * vPwFront * 0.7);
          // Thinner powder toward the fringe.
          diffuseColor.rgb *= mix(0.62, 1.0, smoothstep(0.95, 0.3, edge));
        }`
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor + (pwGrainH - 0.5) * 0.08, 0.6, 1.0);`
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        {
          // Granular micro-relief from the same grain field.
          float h = pwGrainH * 0.0045;
          vec3 dpx = dFdx(-vViewPosition);
          vec3 dpy = dFdy(-vViewPosition);
          vec3 r1 = cross(dpy, normal);
          vec3 r2 = cross(normal, dpx);
          float det = dot(dpx, r1);
          vec3 grad = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2);
          normal = normalize(abs(det) * normal - grad);
        }`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          // Gold glow lives only on the peel front, pulsing along the rope.
          float pulse = 0.62 + 0.38 * sin(uTime * 2.6 - vPwGrain.x * 5.0);
          totalEmissiveRadiance += vec3(1.0, 0.66, 0.24) * (vPwFront * vPwFront) * pulse * 1.35 * uGlow;
        }`
      )
      .replace("#include <opaque_fragment>", `
        // Depth falloff across the tilted stone (no DoF in the grade): far things sink into the dark.
        outgoingLight *= 1.0 - uDepthDim.z * smoothstep(uDepthDim.x, uDepthDim.y, length(vViewPosition));
        #include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => "home-powder-ridge-v1";

  // Shadow depth with the same displacement
  const depthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  depthMaterial.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${POWDER_VERT_PARS}`)
      .replace(
        "#include <begin_vertex>",
        `vec3 pwP, pwN, pwB; float pwRho, pwLift, pwFront;
        pwEval(pwP, pwN, pwB, pwRho, pwLift, pwFront);
        vec3 pwNrm; float pwSide;
        vec3 transformed = pwRidge(pwP, pwN, pwB, pwRho, pwLift, pwNrm, pwSide);`
      );
  };
  depthMaterial.customProgramCacheKey = () => "home-powder-depth-v1";

  // Skirt: contact darkening and loose powder on the stone
  const skirtMaterial = new THREE.ShaderMaterial({
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...uniforms },
    vertexShader: SKIRT_VERT,
    fragmentShader: SKIRT_FRAG,
    transparent: true,
    depthWrite: false,
    fog: true,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
  });

  const grainMaterial = new THREE.ShaderMaterial({
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...uniforms },
    vertexShader: GRAIN_VERT,
    fragmentShader: GRAIN_FRAG,
    transparent: true,
    depthWrite: false,
    fog: true,
  });

  const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff41, wireframe: true, toneMapped: false });

  return { material, depthMaterial, skirtMaterial, grainMaterial, wireMaterial, uniforms };
}
