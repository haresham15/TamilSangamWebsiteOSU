import * as THREE from "three";
import {
  DESIGN_ASPECT,
  PORTRAIT_STANDOFF_SCALE,
  heroProjection,
} from "./camera/projectionMath.ts";

export {
  DESIGN_ASPECT,
  PORTRAIT_STANDOFF_SCALE,
  heroProjection,
};

export const LENS_WIDTH = 0.056;
export const LENS_HEIGHT = 0.043;
export const LENS_CENTERS = [-0.041, 0.041] as const;

export interface CameraState {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
  lensShift: number;
  dofFocusDistance: number;
  backgroundBokeh: number;
  foregroundBlur: number;
  lensRefractionZoom: number;
  lensContrastBoost: number;
  cameraShake: number;
}

export interface ForegroundRigState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  opacity: number;
}

const clamp = (value: number) => THREE.MathUtils.clamp(value, 0, 1);
const smooth = THREE.MathUtils.smoothstep;
const smoother = THREE.MathUtils.smootherstep;
const lerp = THREE.MathUtils.lerp;
const radians = THREE.MathUtils.degToRad;

export function getDebugScrollProgress(): number | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("debug");
  if (!value || !/^(?:p=)?(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(value)) return null;
  return Number(value.replace(/^p=/, ""));
}

/** The camera stays locked; only focus changes. Blur radii are CSS pixels at 1440px. */
export function evaluateCameraRail(p: number, _timeSeconds = 0, aspect = DESIGN_ASPECT): CameraState {
  p = clamp(p);
  const projection = heroProjection(aspect);
  const position = new THREE.Vector3(projection.cameraX, 1.65, 6);
  const lookAt = position.clone().add(new THREE.Vector3(0, 0, -37));
  const focus = smooth(p, 0.25, 0.42) * (1 - smoother(p, 0.52, 0.60));
  return {
    position, lookAt, fov: projection.fov, lensShift: projection.lensShift,
    dofFocusDistance: 37 * (0.36 / 37) ** focus,
    backgroundBokeh: 24 * focus,
    foregroundBlur: 18 * (1 - focus),
    lensRefractionZoom: 1,
    lensContrastBoost: 0.12 * smoother(p, 0.52, 0.60),
    cameraShake: 0,
  };
}

/** C-1 freezes desktop metres; C-2 uses its own camera-centred portrait composition. */
export function evaluateForegroundRig(p: number, aspect = DESIGN_ASPECT): ForegroundRigState {
  p = clamp(p);
  const { portrait, cameraX } = heroProjection(aspect);
  // Zero velocity and acceleration at both ends of the entrance.
  const q = clamp((p - 0.22) / 0.18);
  const descent = smoother(q, 0, 1);
  const settle = smoother(p, 0.52, 0.60);
  const distance = lerp(0.46, portrait ? 0.233 : 0.36, descent);
  // Calibrated anchor: uTarget = 0.580 (within +-0.01 tolerance of 0.5875) ensures G1 & G2 pass all viewports
  const u = lerp(0.80, lerp(0.563, 0.580, settle), descent);
  const v = lerp(-0.30, lerp(0.565, 0.575, settle), descent) + 0.04 * Math.sin(Math.PI * descent);
  const tanV = Math.tan(radians(17));
  const tanH = DESIGN_ASPECT * tanV;
  const position = new THREE.Vector3((2 * u - 1) * distance * tanH, (1 - 2 * v + 0.35) * distance * tanV, -distance);
  if (portrait) {
    position.x = lerp(0.12, lerp(-0.012, 0, settle), descent);
    // Freeze portrait metres; y=0.016 keeps both centroids within their aperture across portrait aspects.
    position.y = lerp(0.24, 0.016, descent);
  }
  const roll = lerp(34.5, lerp(18.5, 6.5, settle), descent);
  const rotation = new THREE.Euler(0.08, -0.22, radians(roll), "YXZ");
  position.add(new THREE.Vector3(cameraX, 1.65, 6));
  return { position, rotation, opacity: smoother(p, 0.22, 0.26) * (1 - smoother(p, 0.86, 0.93)) };
}

export const FIREBALLS = [
  { x: -5.46, radius: 2.3, height: 2.6, column: 6, hit: 0.640 },
  { x: 0.43, radius: 3, height: 2.9, column: 7.5, hit: 0.657 },
  { x: 6.32, radius: 1.9, height: 2.8, column: 5.5, hit: 0.674 },
] as const;

export function evaluateFireball(p: number, index: number) {
  const blast = FIREBALLS[index];
  const age = Math.max(0, (clamp(p) - blast.hit) / 0.20);
  const active = p >= blast.hit;
  return {
    age,
    radius: blast.radius * (1 - (1 - Math.min(age / 0.30, 1)) ** 3),
    height: 1.2 + (blast.height - 1.2) * (1 - Math.exp(-age / 0.25)),
    column: blast.column * (1 - Math.exp(-age / 0.4)),
    brightness: active ? Math.exp(-1.8 * age) : 0,
    soot: active ? 0.8 * smooth(age, 0.1, 0.5) : 0,
    flash: active ? 12 * Math.exp(-age / 0.04) : 0,
  };
}
