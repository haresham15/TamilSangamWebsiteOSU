import * as THREE from "three";

export type GuideVec3 = readonly [number, number, number];

export interface GuideRailKeyframe {
  progress: number;
  position: GuideVec3;
  lookAt: GuideVec3;
  fov: number;
  roll: number;
  focusTarget: GuideVec3;
  exposure: number;
  bloom: number;
  drizzle: number;
  godRays: number;
  handheldAmplitude: number;
  departureOffset: number;
}

export interface GuideRailFrame extends Omit<GuideRailKeyframe, "progress"> {
  progress: number;
}

export const GUIDE_BOARD_WORLD_POSITION: GuideVec3 = [0, 14, -6];
export const GUIDE_STATION_TIME_OF_DAY = "pre-dawn" as const;
export const GUIDE_HERO_SCROLL_VH = { desktop: 340, mobile: 280 } as const;

/**
 * The calibrated CatmullRom crane rail keyframes strictly adhering to PRD §6.2.
 * All curves are keyed to progress p ∈ [0, 1].
 */
export const GUIDE_RAIL_KEYFRAMES: readonly GuideRailKeyframe[] = [
  {
    progress: 0.0,
    position: [0.25, 1.48, 3.55],
    lookAt: [-0.15, 1.52, 0.0],
    fov: 30,
    roll: 0,
    focusTarget: [-0.15, 1.52, 0.4],
    exposure: 1,
    bloom: 0.85,
    drizzle: 0.35,
    godRays: 0.15,
    handheldAmplitude: 0.008,
    departureOffset: 0,
  },
  {
    progress: 0.14,
    position: [0.15, 1.52, 3.25],
    lookAt: [-0.08, 1.58, -0.2],
    fov: 29,
    roll: -0.002,
    focusTarget: [0.18, 1.63, -0.35],
    exposure: 1,
    bloom: 0.85,
    drizzle: 0.35,
    godRays: 0.18,
    handheldAmplitude: 0.007,
    departureOffset: 0,
  },
  {
    progress: 0.30,
    position: [1.4, 2.3, 7.5],
    lookAt: [0.0, 2.1, 0.0],
    fov: 33,
    roll: 0.001,
    focusTarget: [0, 2.0, 0],
    exposure: 1.05,
    bloom: 0.8,
    drizzle: 0.32,
    godRays: 0.25,
    handheldAmplitude: 0.006,
    departureOffset: 0,
  },
  {
    progress: 0.50,
    position: [2.8, 3.5, 12.2],
    lookAt: [0.0, 3.2, 0.0],
    fov: 34,
    roll: 0.002,
    focusTarget: [0, 2.5, 0],
    exposure: 1.1,
    bloom: 0.7,
    drizzle: 0.3,
    godRays: 0.3,
    handheldAmplitude: 0.005,
    departureOffset: 0.25,
  },
  {
    progress: 0.70,
    position: [1.4, 5.2, 15.0],
    lookAt: [0.0, 8.8, -3.0],
    fov: 35,
    roll: 0,
    focusTarget: [0, 10, -4],
    exposure: 1.2,
    bloom: 0.55,
    drizzle: 0.25,
    godRays: 0.45,
    handheldAmplitude: 0.003,
    departureOffset: 0.7,
  },
  {
    progress: 0.82,
    position: [0.5, 6.2, 16.5],
    lookAt: [0.0, 11.5, -5.0],
    fov: 35.5,
    roll: 0,
    focusTarget: GUIDE_BOARD_WORLD_POSITION,
    exposure: 1.25,
    bloom: 0.45,
    drizzle: 0.2,
    godRays: 0.5,
    handheldAmplitude: 0.002,
    departureOffset: 1.0,
  },
  {
    progress: 0.90,
    position: [0.0, 6.8, 17.5],
    lookAt: [0.0, 13.0, -6.0],
    fov: 36,
    roll: 0,
    focusTarget: GUIDE_BOARD_WORLD_POSITION,
    exposure: 1.25,
    bloom: 0.35,
    drizzle: 0.15,
    godRays: 0.4,
    handheldAmplitude: 0.0015,
    departureOffset: 1.0,
  },
  {
    progress: 1.0,
    position: [0.0, 6.8, 17.5],
    lookAt: [0.0, 13.0, -6.0],
    fov: 36,
    roll: 0,
    focusTarget: GUIDE_BOARD_WORLD_POSITION,
    exposure: 1.25,
    bloom: 0.35,
    drizzle: 0,
    godRays: 0.35,
    handheldAmplitude: 0,
    departureOffset: 1.0,
  },
] as const;

// Centripetal Catmull-Rom splines for smooth, overshoot-free camera motion
const positionSpline = new THREE.CatmullRomCurve3(
  GUIDE_RAIL_KEYFRAMES.map((kf) => new THREE.Vector3(...kf.position)),
  false,
  "centripetal"
);

const lookAtSpline = new THREE.CatmullRomCurve3(
  GUIDE_RAIL_KEYFRAMES.map((kf) => new THREE.Vector3(...kf.lookAt)),
  false,
  "centripetal"
);

const focusSpline = new THREE.CatmullRomCurve3(
  GUIDE_RAIL_KEYFRAMES.map((kf) => new THREE.Vector3(...kf.focusTarget)),
  false,
  "centripetal"
);

function clampProgress(progress: number) {
  return Math.min(1, Math.max(0, progress));
}

function findSegment(p: number) {
  for (let i = 0; i < GUIDE_RAIL_KEYFRAMES.length - 1; i++) {
    if (p <= GUIDE_RAIL_KEYFRAMES[i + 1].progress) {
      return i;
    }
  }
  return GUIDE_RAIL_KEYFRAMES.length - 2;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const tempPos = new THREE.Vector3();
const tempLookAt = new THREE.Vector3();
const tempFocus = new THREE.Vector3();

let cachedProgress = -1;
let cachedFrame: GuideRailFrame | null = null;

/**
 * Samples the crane camera rail at scroll progress p ∈ [0, 1].
 */
export function sampleGuideRail(progress: number, aspect = 1.6): GuideRailFrame {
  const p = clampProgress(progress);
  if (cachedFrame && Math.abs(p - cachedProgress) < 0.0001) {
    return cachedFrame;
  }

  // Sample CatmullRom spline
  positionSpline.getPoint(p, tempPos);
  lookAtSpline.getPoint(p, tempLookAt);
  focusSpline.getPoint(p, tempFocus);

  // Linear interpolation of scalar properties between keyframes
  const segIndex = findSegment(p);
  const from = GUIDE_RAIL_KEYFRAMES[segIndex];
  const to = GUIDE_RAIL_KEYFRAMES[segIndex + 1];
  const span = to.progress - from.progress;
  const t = span <= 0 ? 0 : (p - from.progress) / span;

  // Aspect-aware distance adjustment for mobile portrait (aspect < 0.7)
  const posX = tempPos.x;
  const posY = tempPos.y;
  let posZ = tempPos.z;
  let fov = lerp(from.fov, to.fov, t);

  if (aspect < 0.7 && p < 0.3) {
    // Back up camera slightly and widen FOV so both figures stay in vertical frame
    const mobileFactor = (1.0 - p / 0.3);
    posZ += 3.2 * mobileFactor;
    fov += 6.0 * mobileFactor;
  }

  cachedProgress = p;
  cachedFrame = {
    progress: p,
    position: [posX, posY, posZ],
    lookAt: [tempLookAt.x, tempLookAt.y, tempLookAt.z],
    focusTarget: [tempFocus.x, tempFocus.y, tempFocus.z],
    fov,
    roll: lerp(from.roll, to.roll, t),
    exposure: lerp(from.exposure, to.exposure, t),
    bloom: lerp(from.bloom, to.bloom, t),
    drizzle: lerp(from.drizzle, to.drizzle, t),
    godRays: lerp(from.godRays, to.godRays, t),
    handheldAmplitude: lerp(from.handheldAmplitude, to.handheldAmplitude, t),
    departureOffset: lerp(from.departureOffset, to.departureOffset, t),
  };

  return cachedFrame;
}
