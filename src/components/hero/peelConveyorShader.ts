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
    color: "#FFB84D",
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

      // PRD §6.3: Tube tapering at both head and tail
      float evalTaper(float a, float L) {
        float taperDist = 0.15 * L;
        float dHead = a;
        float dTail = max(0.0, L - a);
        float factor = 1.0;
        if (dHead < taperDist) {
          factor = 0.35 + 0.65 * (dHead / taperDist);
        } else if (dTail < taperDist) {
          factor = 0.35 + 0.65 * (dTail / taperDist);
        }
        return factor;
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
      varying float vDistHead;
      ${shader.fragmentShader}
    `.replace(
      `#include <emissivemap_fragment>`,
      `
      #include <emissivemap_fragment>
      float pulse = sin(vUv.x * 24.0 - uTime * 2.0);
      float glow = smoothstep(0.65, 1.0, pulse) * 0.35;
      totalEmissiveRadiance += vec3(1.0, 0.72, 0.25) * glow;

      // PRD §7.6: Tapered tip highlight / terminal glow at strand heads
      float tipHighlight = (1.0 - smoothstep(0.0, 0.40, vDistHead)) * 0.45;
      totalEmissiveRadiance += vec3(1.0, 0.82, 0.35) * tipHighlight;
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
