// src/components/games-hero/gamesRail.ts
import * as THREE from "three";

export interface CameraState {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
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

export interface MissileState {
  progress: number; // 0 to 1 along flight path
  active: boolean;
}

export interface DetonationState {
  detonated: boolean;
  age: number; // seconds or normalized progress since detonation
  fireballScale: number;
  shockwaveRadius: number;
  shockwaveOpacity: number;
}

/**
 * Parses ?debug=p=... from window.location if present.
 * Supports e.g. ?debug=p=0.10, ?debug=p=0.42, ?debug=p=0.72 or ?debug=0.42
 */
export function getDebugScrollProgress(): number | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const debugVal = params.get("debug");
  if (!debugVal) return null;

  if (debugVal.startsWith("p=")) {
    const parsed = parseFloat(debugVal.replace("p=", ""));
    if (!isNaN(parsed)) return Math.max(0, Math.min(1, parsed));
  }
  const directNum = parseFloat(debugVal);
  if (!isNaN(directNum)) return Math.max(0, Math.min(1, directNum));
  return null;
}

/**
 * Calculates camera kinematics, rack-focus, and focal planes for scroll progress p in [0, 1].
 */
export function evaluateCameraRail(p: number, timeSeconds: number = 0): CameraState {
  const clampedP = Math.max(0, Math.min(1, p));

  const position = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  let fov = 34;
  let dofFocusDistance = 37.0; // Distance to distant breached wall & SUVs
  let backgroundBokeh = 0.0;
  let foregroundBlur = 0.0;
  let lensRefractionZoom = 1.0;
  let lensContrastBoost = 0.0;
  let cameraShake = 0.0;

  if (clampedP <= 0.22) {
    // Beat 1 (p = 0.00 - 0.22): The Beach Standoff
    const t = clampedP / 0.22;
    position.set(
      THREE.MathUtils.lerp(0.0, 0.02, t),
      THREE.MathUtils.lerp(1.65, 1.63, t),
      THREE.MathUtils.lerp(6.0, 5.98, t)
    );
    lookAt.set(0.0, 1.8, -31.0);
    fov = 34.0;
    dofFocusDistance = 37.0;
    backgroundBokeh = 0.0;
    foregroundBlur = 0.0;
  } else if (clampedP <= 0.52) {
    // Beat 2 (p = 0.22 - 0.52): Eyeglasses Descend & Macro Rack-Focus
    const t = (clampedP - 0.22) / 0.30;
    // Smooth easing
    const easeT = THREE.MathUtils.smoothstep(t, 0.0, 1.0);

    position.set(
      THREE.MathUtils.lerp(0.02, 0.04, easeT),
      THREE.MathUtils.lerp(1.63, 1.62, easeT),
      THREE.MathUtils.lerp(5.98, 5.95, easeT)
    );
    lookAt.set(
      THREE.MathUtils.lerp(0.0, 0.02, easeT),
      THREE.MathUtils.lerp(1.8, 1.65, easeT),
      THREE.MathUtils.lerp(-31.0, -28.0, easeT)
    );
    fov = THREE.MathUtils.lerp(34.0, 32.0, easeT);

    // Rack focus from distant wall down to foreground glasses (1.30m)
    // Starting rack at p ~ 0.25, reaching full macro sharpness by p = 0.42
    const rackT = THREE.MathUtils.smoothstep(clampedP, 0.24, 0.44);
    dofFocusDistance = THREE.MathUtils.lerp(37.0, 1.30, rackT);
    backgroundBokeh = THREE.MathUtils.lerp(0.0, 6.5, rackT);
    foregroundBlur = 0.0;
  } else if (clampedP <= 0.85) {
    // Beat 3 (p = 0.52 - 0.85): Reverse Rack-Focus, Missiles & Dual-Lens Explosions
    const t = (clampedP - 0.52) / 0.33;
    const easeT = THREE.MathUtils.smoothstep(t, 0.0, 1.0);

    position.set(
      THREE.MathUtils.lerp(0.04, 0.02, easeT),
      THREE.MathUtils.lerp(1.62, 1.60, easeT),
      THREE.MathUtils.lerp(5.95, 5.85, easeT)
    );
    lookAt.set(
      THREE.MathUtils.lerp(0.02, 0.0, easeT),
      THREE.MathUtils.lerp(1.65, 1.75, easeT),
      -31.0
    );
    fov = 33.0;

    // Reverse focus snap from foreground (1.30m) back to distant SUVs (37.0m) between p = 0.52 -> 0.62
    const snapT = THREE.MathUtils.smoothstep(clampedP, 0.52, 0.62);
    dofFocusDistance = THREE.MathUtils.lerp(1.30, 37.0, snapT);
    backgroundBokeh = THREE.MathUtils.lerp(6.5, 0.0, snapT);
    // Foregound blurs out as camera focuses on distant explosions
    foregroundBlur = THREE.MathUtils.lerp(0.0, 5.0, snapT);

    // Lens refraction & contrast boost inside the glasses apertures
    lensRefractionZoom = THREE.MathUtils.lerp(1.0, 1.08, snapT);
    lensContrastBoost = THREE.MathUtils.lerp(0.0, 0.15, snapT);

    // Camera shake impulse during detonations (around p = 0.64 - 0.74)
    if (clampedP >= 0.64 && clampedP <= 0.78) {
      const shakeEnv = 1.0 - Math.abs((clampedP - 0.69) / 0.07);
      cameraShake = Math.max(0, shakeEnv) * 0.022;
      const freq = timeSeconds * 42.0;
      position.x += Math.sin(freq) * cameraShake;
      position.y += Math.cos(freq * 1.3) * cameraShake * 0.8;
    }
  } else {
    // Beat 4 (p = 0.85 - 1.00): Lens Portal Push-Through to NYT Games Hub
    const t = (clampedP - 0.85) / 0.15;
    const easeT = THREE.MathUtils.smoothstep(t, 0.0, 1.0);

    // Camera pushes straight through the center/left eyeglass lens (into z = 4.35m)
    position.set(
      THREE.MathUtils.lerp(0.02, -0.04, easeT),
      THREE.MathUtils.lerp(1.60, 1.56, easeT),
      THREE.MathUtils.lerp(5.85, 4.35, easeT)
    );
    lookAt.set(-0.04, 1.56, -31.0);
    fov = THREE.MathUtils.lerp(33.0, 38.0, easeT);
    dofFocusDistance = 2.0;
    backgroundBokeh = THREE.MathUtils.lerp(0.0, 8.0, easeT);
    foregroundBlur = THREE.MathUtils.lerp(5.0, 8.0, easeT);
  }

  return {
    position,
    lookAt,
    fov,
    dofFocusDistance,
    backgroundBokeh,
    foregroundBlur,
    lensRefractionZoom,
    lensContrastBoost,
    cameraShake,
  };
}

/**
 * Calculates position, rotation, and visibility of the foreground hand and eyeglasses.
 */
export function evaluateForegroundRig(p: number): ForegroundRigState {
  const clampedP = Math.max(0, Math.min(1, p));
  const position = new THREE.Vector3();
  const rotation = new THREE.Euler(0.08, -0.22, -0.323, "YXZ"); // -18.5° z tilt
  let opacity = 0.0;

  if (clampedP < 0.20) {
    // Hidden above upper-right viewport before entering
    position.set(0.65, 2.8, 4.65);
    opacity = 0.0;
  } else if (clampedP <= 0.42) {
    // Descending from upper-right [0.55, 2.45, 4.65] to locked hero pose [0.02, 1.56, 4.65]
    const t = (clampedP - 0.20) / 0.22;
    const easeT = THREE.MathUtils.smoothstep(t, 0.0, 1.0);

    position.set(
      THREE.MathUtils.lerp(0.55, 0.02, easeT),
      THREE.MathUtils.lerp(2.45, 1.56, easeT),
      4.65
    );
    // Subtle rotation settling into -18.5°
    rotation.set(
      THREE.MathUtils.lerp(0.02, 0.08, easeT),
      THREE.MathUtils.lerp(-0.35, -0.22, easeT),
      THREE.MathUtils.lerp(-0.45, -0.323, easeT),
      "YXZ"
    );
    opacity = THREE.MathUtils.smoothstep(clampedP, 0.20, 0.26);
  } else if (clampedP <= 0.85) {
    // Locked in hero pose with subtle anticipation breathing tremor
    const breath = Math.sin((clampedP - 0.42) * 25.0) * 0.002;
    position.set(0.02 + breath, 1.56, 4.65);
    rotation.set(0.08, -0.22, -0.323, "YXZ");
    opacity = 1.0;
  } else {
    // Pushing through: scale up / fade out as camera passes through
    const t = (clampedP - 0.85) / 0.15;
    position.set(0.02, 1.56, 4.65);
    rotation.set(0.08, -0.22, -0.323, "YXZ");
    opacity = Math.max(0, 1.0 - t * 1.5);
  }

  return { position, rotation, opacity };
}

/**
 * Calculates missile flight progress and detonation triggers.
 */
export function evaluateMissilesAndPyro(p: number) {
  const clampedP = Math.max(0, Math.min(1, p));

  // Missiles streak between p = 0.54 and p = 0.64
  let missileProgress = 0.0;
  let missilesActive = false;
  if (clampedP >= 0.54 && clampedP <= 0.65) {
    missilesActive = true;
    missileProgress = (clampedP - 0.54) / 0.10; // reaches 1.0 at p = 0.64
  } else if (clampedP > 0.65) {
    missileProgress = 1.0;
    missilesActive = false;
  }

  // Detonation erupts at p = 0.64 and burns through p = 0.88
  const detonated = clampedP >= 0.64;
  let detonationProgress = 0.0;
  let fireballScale = 0.0;
  let shockwaveRadius = 0.0;
  let shockwaveOpacity = 0.0;

  if (detonated) {
    detonationProgress = Math.min(1.0, (clampedP - 0.64) / 0.22);
    // Rapid initial expansion, gentle lingering billow
    const expand = Math.sin(detonationProgress * Math.PI * 0.5);
    fireballScale = THREE.MathUtils.lerp(0.1, 1.0, expand);

    // Shockwave expands across the sand floor
    shockwaveRadius = detonationProgress * 36.0;
    shockwaveOpacity = Math.max(0, 0.75 * (1.0 - detonationProgress));
  }

  return {
    missilesActive,
    missileProgress: Math.min(1.0, Math.max(0.0, missileProgress)),
    detonated,
    detonationProgress,
    fireballScale,
    shockwaveRadius,
    shockwaveOpacity,
  };
}
