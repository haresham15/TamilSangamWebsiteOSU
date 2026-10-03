import * as THREE from "three";
import gsap from "gsap";
import { globalStringEnergy } from "../strings/Strings";

export type StrumPhase = "IDLE" | "STRUM" | "DRIVEN";

export interface PickTransform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  opacity: number;
}

export interface StrumFrameState {
  visible: boolean;
  lead: PickTransform;
  ghost1: PickTransform;
  ghost2: PickTransform;
}

let phase: StrumPhase = "IDLE";
let lastStrumEndTime = 0;
let topQuietStartTime = 0;
let strumTimeline: gsap.core.Timeline | null = null;

// History buffer for motion blur ghost echoes (2–3 frames back)
const history: Array<{ pos: THREE.Vector3; rot: THREE.Euler; opacity: number }> = [];

export const currentStrumState: StrumFrameState = {
  visible: false,
  lead: {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    opacity: 0,
  },
  ghost1: {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    opacity: 0,
  },
  ghost2: {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    opacity: 0,
  },
};

/**
 * CatmullRom 3D Spline Path across camera lens down into strings (§5.3).
 */
const pickSpline = new THREE.CatmullRomCurve3([
  new THREE.Vector3(3.8, 3.6, 2.0),     // t = 0.0s: Off-screen top-right
  new THREE.Vector3(1.6, 2.7, -0.6),    // t = 0.3s: Sweeping over camera lens
  new THREE.Vector3(0.4, 1.8, -3.2),    // t = 0.5s: Descending toward fretboard
  new THREE.Vector3(-0.45, 0.52, -7.0), // t = 0.7s: Striking Low E string
  new THREE.Vector3(0.55, 0.46, -7.2),  // t = 0.95s: Striking High E string (downstroke complete)
  new THREE.Vector3(-1.8, -0.8, -11.0), // t = 1.25s: Follow-through swoop down
  new THREE.Vector3(-3.2, -2.4, -16.0), // t = 1.6s: Off-screen exit
]);

/**
 * Initializes strum state machine.
 * Mid-page refresh guard: if page mounts at scroll > 0.02, start directly in DRIVEN.
 */
export function initStrumStateMachine(initialProgress: number): void {
  if (initialProgress > 0.02) {
    phase = "DRIVEN";
  } else {
    phase = "IDLE";
  }
}

export function getStrumPhase(): StrumPhase {
  return phase;
}

/**
 * Triggers the 1.6-second time-based Strum animation sequence (§5.3).
 */
export function triggerStrumSequence(onComplete?: () => void): void {
  if (phase === "STRUM") return;
  phase = "STRUM";
  currentStrumState.visible = true;

  if (strumTimeline) {
    strumTimeline.kill();
  }

  const track = { t: 0, opacity: 0 };
  const targetPos = new THREE.Vector3();

  // Downstroke pluck trigger times: offset by 45ms per string (0.045s)
  const pluckTimes = [0.70, 0.745, 0.79, 0.835, 0.88, 0.925];
  const pluckAmps = [1.0, 0.94, 0.88, 0.82, 0.76, 0.70];
  const stringPlucked = [false, false, false, false, false, false];

  strumTimeline = gsap.timeline({
    onUpdate: () => {
      const u = track.t; // [0, 1]
      pickSpline.getPoint(u, targetPos);

      // Lead pick transform
      currentStrumState.lead.position.copy(targetPos);
      currentStrumState.lead.rotation.set(
        0.3 + Math.sin(u * Math.PI) * 0.4,
        -0.4 + u * 0.8,
        -0.8 + u * 1.6
      );
      currentStrumState.lead.opacity = track.opacity;

      // Update history buffer for 2-3 motion blur echoes
      history.unshift({
        pos: currentStrumState.lead.position.clone(),
        rot: currentStrumState.lead.rotation.clone(),
        opacity: currentStrumState.lead.opacity,
      });
      if (history.length > 8) {
        history.pop();
      }

      // Ghost 1 (lag ~2 frames)
      if (history.length > 2) {
        currentStrumState.ghost1.position.copy(history[2].pos);
        currentStrumState.ghost1.rotation.copy(history[2].rot);
        currentStrumState.ghost1.opacity = history[2].opacity * 0.45;
      }
      // Ghost 2 (lag ~4 frames)
      if (history.length > 4) {
        currentStrumState.ghost2.position.copy(history[4].pos);
        currentStrumState.ghost2.rotation.copy(history[4].rot);
        currentStrumState.ghost2.opacity = history[4].opacity * 0.22;
      }

      // Check downstroke string crossings
      const timeInSec = u * 1.6;
      for (let s = 0; s < 6; s++) {
        if (!stringPlucked[s] && timeInSec >= pluckTimes[s]) {
          stringPlucked[s] = true;
          globalStringEnergy.triggerPluck(s, pluckAmps[s]);
        }
      }
    },
    onComplete: () => {
      phase = "DRIVEN";
      currentStrumState.visible = false;
      lastStrumEndTime = performance.now();
      history.length = 0;
      if (onComplete) onComplete();
    },
  });

  // Time-based animation over 1.6 seconds
  strumTimeline.to(track, { opacity: 1.0, duration: 0.25, ease: "power1.out" }, 0);
  strumTimeline.to(track, { t: 1.0, duration: 1.6, ease: "power1.inOut" }, 0);
  strumTimeline.to(track, { opacity: 0.0, duration: 0.35, ease: "power2.in" }, 1.25);
}

/**
 * Called by ScrollTrigger onUpdate to manage state transitions (§5.3).
 */
export function updateStrumScrollIntent(progress: number, direction: number): void {
  const now = performance.now();

  // 1. First forward scroll intent -> STRUM
  if (phase === "IDLE" && progress > 0.002 && direction === 1) {
    triggerStrumSequence();
    return;
  }

  // 2. Re-arming condition:
  // Back at top (p < 0.001), quiet >= 600ms, and cooldown >= 8000ms
  if (phase === "DRIVEN") {
    if (progress < 0.001) {
      if (topQuietStartTime === 0) {
        topQuietStartTime = now;
      } else if (now - topQuietStartTime >= 600 && now - lastStrumEndTime >= 8000) {
        // Re-armed to IDLE
        phase = "IDLE";
        topQuietStartTime = 0;
      }
    } else {
      topQuietStartTime = 0;
    }
  }
}
