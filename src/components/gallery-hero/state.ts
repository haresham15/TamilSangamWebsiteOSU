import type * as THREE from "three";
import { getCameraS } from "./neck/fretMath";
import { triggerDustBurst } from "./props/types";

export type MotionTier = "A" | "B" | "C";

export interface HeroState {
  progress: number;
  smoothedProgress: number;
  rawVelocity: number;
  smoothedVelocity: number;
  cameraS: number;
  currentFret: number;
  currentEra: 1 | 2 | 3;
  tier: MotionTier;
  debugActive: boolean;
  fps: number;
  drawCalls: number;
  triangles: number;
  stringEnergies: number[];
  stringsDamperK: number;
  lastScrollTime: number;
  easterEggActive: boolean;
  easterEggUnlockedAt: number;
}

export const heroState: HeroState = {
  progress: 0.0,
  smoothedProgress: 0.0,
  rawVelocity: 0.0,
  smoothedVelocity: 0.0,
  cameraS: 0.0,
  currentFret: 1,
  currentEra: 1,
  tier: "A",
  debugActive: false,
  fps: 60,
  drawCalls: 0,
  triangles: 0,
  stringEnergies: [0, 0, 0, 0, 0, 0],
  stringsDamperK: 0.0,
  lastScrollTime: 0,
  easterEggActive: false,
  easterEggUnlockedAt: 0,
};

export const pluckedStringsSet = new Set<number>();
const easterEggListeners = new Set<(active: boolean) => void>();

export function subscribeEasterEgg(cb: (active: boolean) => void) {
  easterEggListeners.add(cb);
  return () => {
    easterEggListeners.delete(cb);
  };
}

import { soundEngine } from "@/lib/soundEngine";

export function triggerEasterEgg() {
  if (heroState.easterEggActive) return;
  heroState.easterEggActive = true;
  heroState.easterEggUnlockedAt = Date.now();
  easterEggListeners.forEach((fn) => fn(true));

  // Trigger 6-string golden arpeggio cascade
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      pluckHandler?.(i, 0.9 - i * 0.05);
    }, i * 65);
  }

  // Play warm acoustic Major 7th / Add9 guitar chord swell
  soundEngine.playAcousticMajor7ChordSwell();

  // Auto-reset after 6 seconds so user can experience it again
  setTimeout(() => {
    heroState.easterEggActive = false;
    pluckedStringsSet.clear();
    easterEggListeners.forEach((fn) => fn(false));
  }, 6000);
}

export function recordStringPluck(stringIndex: number) {
  pluckedStringsSet.add(stringIndex);
  if (pluckedStringsSet.size >= 6) {
    triggerEasterEgg();
  }
}

let timelineSetter: ((p: number) => void) | null = null;
let cameraSnapHandler: ((p: number) => void) | null = null;

export function registerTimelineProgressSetter(setter: (p: number) => void) {
  timelineSetter = setter;
}

export function unregisterTimelineProgressSetter() {
  timelineSetter = null;
}

export function registerCameraSnapHandler(handler: (p: number) => void) {
  cameraSnapHandler = handler;
}

export function unregisterCameraSnapHandler() {
  cameraSnapHandler = null;
}

/**
 * Programmatic progress setter.
 * Updates mutable state, seeks master timeline, and snaps camera rig.
 */
export function setHeroProgress(p: number) {
  const clamped = Math.min(Math.max(p, 0.0), 1.0);
  heroState.progress = clamped;
  heroState.cameraS = getCameraS(clamped);
  cameraSnapHandler?.(clamped);

  // Era mapping:
  // 0.00 - 0.334: Era 1 (Nut to Fret 5)
  // 0.334 - 0.667: Era 2 (Fret 5 to Fret 12)
  // 0.667 - 1.000: Era 3 (Fret 12 to Fret 24)
  if (clamped < 0.334) {
    heroState.currentEra = 1;
  } else if (clamped < 0.667) {
    heroState.currentEra = 2;
  } else {
    heroState.currentEra = 3;
  }

  // Fret approximate indicator: -12 * log2(1 - s/100)
  const s = heroState.cameraS;
  if (s <= 0) {
    heroState.currentFret = 0;
  } else {
    const n = -12.0 * Math.log2(Math.max(0.01, 1.0 - s / 100.0));
    heroState.currentFret = Math.min(24, Math.max(1, Math.round(n)));
  }

  if (timelineSetter) {
    timelineSetter(clamped);
  }
}

let pluckHandler: ((index: number, amp?: number) => void) | null = null;
let allPlucksHandler: ((baseAmp?: number) => void) | null = null;

export function registerPluckHandlers(
  onPluck: (index: number, amp?: number) => void,
  onAllPlucks: (baseAmp?: number) => void
) {
  pluckHandler = onPluck;
  allPlucksHandler = onAllPlucks;
}

export function triggerHeroPluck(index: number, amp?: number) {
  pluckHandler?.(index, amp);
}

export function triggerHeroAllPlucks(baseAmp?: number) {
  allPlucksHandler?.(baseAmp);
}

// Window test hook for automated verification (§9)
if (typeof window !== "undefined") {
  (window as unknown as { __galleryHero: unknown }).__galleryHero = {
    setProgress: (p: number) => setHeroProgress(p),
    getState: () => ({ ...heroState }),
    setTier: (tier: MotionTier) => {
      heroState.tier = tier;
    },
    triggerPluck: (i: number, amp?: number) => triggerHeroPluck(i, amp),
    triggerAllPlucks: (baseAmp?: number) => triggerHeroAllPlucks(baseAmp),
    triggerDustBurst: (origin?: THREE.Vector3) => triggerDustBurst(origin),
    refresh: () => {},
  };
}
