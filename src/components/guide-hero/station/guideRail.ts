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

/** The complete Phase 3 rail source of truth; all station camera values are keyed to p ∈ [0, 1]. */
export const GUIDE_RAIL_KEYFRAMES: readonly GuideRailKeyframe[] = [
  {
    progress: 0,
    position: [0.2, 1.55, 5.6],
    lookAt: [-0.25, 1.7, 0],
    fov: 32,
    roll: 0,
    focusTarget: [-0.25, 1.7, 0.4],
    exposure: 1,
    bloom: 0.9,
    drizzle: 0.35,
    godRays: 0.2,
    handheldAmplitude: 0.012,
    departureOffset: 0,
  },
  {
    progress: 0.14,
    position: [0.1, 1.6, 5],
    lookAt: [-0.2, 1.7, 0],
    fov: 31,
    roll: -0.002,
    focusTarget: [0.15, 1.6, -0.7],
    exposure: 1,
    bloom: 0.9,
    drizzle: 0.35,
    godRays: 0.2,
    handheldAmplitude: 0.011,
    departureOffset: 0,
  },
  {
    progress: 0.45,
    position: [4.8, 6.2, 19.5],
    lookAt: [0, 2.2, -0.8],
    fov: 34,
    roll: 0.002,
    focusTarget: [0, 2.2, -0.8],
    exposure: 1.1,
    bloom: 0.7,
    drizzle: 0.3,
    godRays: 0.3,
    handheldAmplitude: 0.007,
    departureOffset: 0,
  },
  {
    progress: 0.65,
    position: [2.5, 8.4, 20.5],
    lookAt: [0, 24, -5.5],
    fov: 35,
    roll: 0,
    focusTarget: [0, 24, -5.5],
    exposure: 1.2,
    bloom: 0.55,
    drizzle: 0.25,
    godRays: 0.45,
    handheldAmplitude: 0.004,
    departureOffset: 0,
  },
  {
    progress: 0.8,
    position: [0, 6.5, 17],
    lookAt: [0, 12, -6],
    fov: 36,
    roll: 0,
    focusTarget: GUIDE_BOARD_WORLD_POSITION,
    exposure: 1.3,
    bloom: 0.45,
    drizzle: 0.2,
    godRays: 0.6,
    handheldAmplitude: 0.0025,
    departureOffset: 0.08,
  },
  {
    progress: 0.9,
    position: [0, 6.8, 17.5],
    lookAt: [0, 13, -6],
    fov: 36,
    roll: 0,
    focusTarget: GUIDE_BOARD_WORLD_POSITION,
    exposure: 1.25,
    bloom: 0.35,
    drizzle: 0.15,
    godRays: 0.4,
    handheldAmplitude: 0.002,
    departureOffset: 0.08,
  },
  {
    progress: 1,
    position: [0, 6.8, 17.5],
    lookAt: [0, 13, -6],
    fov: 36,
    roll: 0,
    focusTarget: GUIDE_BOARD_WORLD_POSITION,
    exposure: 1.25,
    bloom: 0.35,
    drizzle: 0,
    godRays: 0.35,
    handheldAmplitude: 0,
    departureOffset: 0.08,
  },
] as const;

const positionCurves = GUIDE_RAIL_KEYFRAMES.slice(0, -1).map((_, index) => {
  const previous = GUIDE_RAIL_KEYFRAMES[Math.max(0, index - 1)].position;
  const current = GUIDE_RAIL_KEYFRAMES[index].position;
  const next = GUIDE_RAIL_KEYFRAMES[index + 1].position;
  const following = GUIDE_RAIL_KEYFRAMES[Math.min(GUIDE_RAIL_KEYFRAMES.length - 1, index + 2)].position;
  return new THREE.CatmullRomCurve3(
    [previous, current, next, following].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "centripetal"
  );
});

const lookAtCurves = GUIDE_RAIL_KEYFRAMES.slice(0, -1).map((_, index) => {
  const previous = GUIDE_RAIL_KEYFRAMES[Math.max(0, index - 1)].lookAt;
  const current = GUIDE_RAIL_KEYFRAMES[index].lookAt;
  const next = GUIDE_RAIL_KEYFRAMES[index + 1].lookAt;
  const following = GUIDE_RAIL_KEYFRAMES[Math.min(GUIDE_RAIL_KEYFRAMES.length - 1, index + 2)].lookAt;
  return new THREE.CatmullRomCurve3(
    [previous, current, next, following].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "centripetal"
  );
});

const focusCurves = GUIDE_RAIL_KEYFRAMES.slice(0, -1).map((_, index) => {
  const previous = GUIDE_RAIL_KEYFRAMES[Math.max(0, index - 1)].focusTarget;
  const current = GUIDE_RAIL_KEYFRAMES[index].focusTarget;
  const next = GUIDE_RAIL_KEYFRAMES[index + 1].focusTarget;
  const following = GUIDE_RAIL_KEYFRAMES[Math.min(GUIDE_RAIL_KEYFRAMES.length - 1, index + 2)].focusTarget;
  return new THREE.CatmullRomCurve3(
    [previous, current, next, following].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "centripetal"
  );
});

function clampProgress(progress: number) {
  return Math.min(1, Math.max(0, progress));
}

function findSegment(progress: number) {
  const index = GUIDE_RAIL_KEYFRAMES.findIndex((frame) => frame.progress >= progress);
  return Math.max(0, Math.min(positionCurves.length - 1, index - 1));
}

function sampleNumber(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function toTuple(vector: THREE.Vector3): GuideVec3 {
  return [vector.x, vector.y, vector.z];
}

/** Catmull-Rom position/look-at/focus rails with scalar values sampled over the same progress segments. */
export function sampleGuideRail(progress: number): GuideRailFrame {
  const p = clampProgress(progress);
  const segmentIndex = findSegment(p);
  const from = GUIDE_RAIL_KEYFRAMES[segmentIndex];
  const to = GUIDE_RAIL_KEYFRAMES[segmentIndex + 1];
  const amount = to.progress === from.progress ? 0 : (p - from.progress) / (to.progress - from.progress);
  const curveAmount = (1 + amount) / 3;

  return {
    progress: p,
    position: toTuple(positionCurves[segmentIndex].getPoint(curveAmount)),
    lookAt: toTuple(lookAtCurves[segmentIndex].getPoint(curveAmount)),
    focusTarget: toTuple(focusCurves[segmentIndex].getPoint(curveAmount)),
    fov: sampleNumber(from.fov, to.fov, amount),
    roll: sampleNumber(from.roll, to.roll, amount),
    exposure: sampleNumber(from.exposure, to.exposure, amount),
    bloom: sampleNumber(from.bloom, to.bloom, amount),
    drizzle: sampleNumber(from.drizzle, to.drizzle, amount),
    godRays: sampleNumber(from.godRays, to.godRays, amount),
    handheldAmplitude: sampleNumber(from.handheldAmplitude, to.handheldAmplitude, amount),
    departureOffset: sampleNumber(from.departureOffset, to.departureOffset, amount),
  };
}
