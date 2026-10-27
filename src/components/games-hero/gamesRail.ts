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

export const LENS_WIDTH = 0.058;
export const LENS_HEIGHT = 0.042;
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
const cubic = (q: number) => q < 0.5 ? 4 * q ** 3 : 1 - (-2 * q + 2) ** 3 / 2;

export function getDebugScrollProgress(): number | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("debug");
  if (!value || !/^(?:p=)?(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(value)) return null;
  return Number(value.replace(/^p=/, ""));
}

/** Locked, level camera until the final 28 metre portal rail. Blur radii are CSS pixels at 1440px. */
export function evaluateCameraRail(p: number, timeSeconds = 0, aspect = DESIGN_ASPECT): CameraState {
  p = clamp(p);
  const projection = heroProjection(aspect);
  const q = clamp((p - 0.85) / 0.12);
  const travel = q < 0.5 ? 2 * q * q : 1 - (-2 * q + 2) ** 2 / 2;
  const position = new THREE.Vector3(lerp(projection.cameraX, 0.43, travel), 1.65, 6 - 28 * travel);
  const lookAt = position.clone().add(new THREE.Vector3(0, 0, -37));
  const shakeAge = p - 0.64;
  const impulse = shakeAge >= 0 && shakeAge <= 0.03
    ? Math.exp(-shakeAge / 0.01) * Math.sin(shakeAge / 0.03 * 10 * Math.PI)
    : 0;
  // Background orientation only: the foreground camera never inherits this impulse.
  lookAt.x += Math.tan(radians(0.16) * impulse) * 37;
  lookAt.y += Math.tan(radians(0.12) * impulse) * 37;
  if (timeSeconds > 0 && p < 0.85) {
    lookAt.x += Math.sin(timeSeconds * 0.15 * Math.PI * 2) * 0.001 * 37 * projection.tanH;
    lookAt.y += Math.sin(timeSeconds * 0.15 * Math.PI * 2 * 0.8) * 0.001 * 37 * projection.tanV;
  }
  const focus = smooth(p, 0.25, 0.42) * (1 - smoother(p, 0.52, 0.60));
  return {
    position, lookAt, fov: projection.fov, lensShift: projection.lensShift,
    dofFocusDistance: 37 * (0.36 / 37) ** focus,
    backgroundBokeh: 24 * focus,
    foregroundBlur: p >= 0.935 ? 0 : 18 * smoother(p, 0.52, 0.64) + 8 * smoother(p, 0.85, 0.93),
    lensRefractionZoom: 1,
    lensContrastBoost: 0.12 * smoother(p, 0.52, 0.60),
    cameraShake: impulse,
  };
}

/** C-1 freezes desktop metres; C-2 uses its own camera-centred portrait composition. */
export function evaluateForegroundRig(p: number, aspect = DESIGN_ASPECT): ForegroundRigState {
  p = clamp(p);
  const { portrait, cameraX } = heroProjection(aspect);
  const q = clamp((p - 0.22) / 0.20);
  const descent = (1 - (1 + 6 * q) * Math.exp(-6 * q)) / (1 - 7 * Math.exp(-6));
  const settle = smoother(p, 0.52, 0.60);
  const distance = lerp(0.46, portrait ? 0.243 : 0.36, descent);
  // Hero 7 permits ±0.01 calibration; -0.005 keeps G2 inside the rim at aspect 3.0.
  const u = lerp(0.82, lerp(0.563, 0.5825, settle), descent);
  const v = lerp(-0.14, lerp(0.565, 0.575, settle), descent) + 0.04 * Math.sin(Math.PI * q);
  const tanV = Math.tan(radians(17));
  const tanH = DESIGN_ASPECT * tanV;
  const position = new THREE.Vector3((2 * u - 1) * distance * tanH, (1 - 2 * v + 0.35) * distance * tanV, -distance);
  if (portrait) {
    position.x = lerp(0.12, lerp(-0.012, 0, settle), descent);
    // Freeze portrait metres too; y=0.016 keeps both centroids within their aperture across portrait aspects.
    position.y = lerp(0.24, 0.016, descent);
  }
  let roll = lerp(31, lerp(18.5, 6.5, settle), descent);
  if (p >= 0.49 && p <= 0.54) {
    const tremor = (p - 0.49) / 0.05;
    roll += 2 * Math.sin(8 * Math.PI * tremor) * Math.sin(Math.PI * tremor);
  }
  const rotation = new THREE.Euler(0.08, -0.22, radians(roll), "YXZ");
  if (p > 0.85) {
    const portal = cubic(clamp((p - 0.85) / 0.08));
    const flatten = smoother(clamp((p - 0.85) / 0.08), 0, 0.7);
    const d = (portrait ? 0.243 : 0.36) * (0.034 / (portrait ? 0.243 : 0.36)) ** portal;
    rotation.set(0.08 * (1 - flatten), -0.22 * (1 - flatten), radians(6.5) * (1 - flatten), "YXZ");
    const left = new THREE.Vector3(LENS_CENTERS[0], 0, 0).applyEuler(rotation);
    const projection = heroProjection(portrait ? aspect : DESIGN_ASPECT);
    const centreY = -projection.lensShift * d * projection.tanV;
    position.x = lerp(position.x, -left.x, portal);
    position.y = lerp(position.y, centreY - left.y, portal);
    position.z = -d - left.z;
  }
  position.add(new THREE.Vector3(cameraX, 1.65, 6));
  return { position, rotation, opacity: p >= 0.22 && p < 0.935 ? 1 : 0 };
}

export const FIREBALLS = [
  { x: -5.46, radius: 2.3, height: 2.6, column: 6, hit: 0.640 },
  { x: 0.43, radius: 3, height: 2.9, column: 7.5, hit: 0.646 },
  { x: 6.32, radius: 1.9, height: 2.8, column: 5.5, hit: 0.652 },
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
