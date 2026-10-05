// src/engine/masterTick.ts
import type Lenis from "lenis";
import { governor } from "./governor";
import { rendererAdvance, getRendererClock } from "./renderer";

/**
 * Master Clock & Ticker (§4.1)
 * One callback, explicit execution order:
 * 1) Lenis scroll update (triggers ScrollTrigger.update)
 * 2) Scroll state publication
 * 3) Subsystem updates (ordered by System.order: springs, parallax, image planes, camera rigs)
 * 4) Governor evaluation and R3F advance()
 */

export interface ScrollState {
  y: number;
  velocity: number;
  direction: number;
  progress: number;
}

export const scroll: ScrollState = {
  y: 0,
  velocity: 0,
  direction: 0,
  progress: 0,
};

export interface System {
  order: number;
  step: (dt: number, timeSec: number) => void;
}

const systems: System[] = [];

export function registerSystem(s: System): () => void {
  systems.push(s);
  systems.sort((a, b) => a.order - b.order);
  return () => unregisterSystem(s);
}

export function unregisterSystem(s: System) {
  const idx = systems.indexOf(s);
  if (idx !== -1) {
    systems.splice(idx, 1);
  }
}

let last = 0;
let frame = 0;
let renderTimeSec = 0;
let lastSyncedClock: unknown = null;

export function resetMasterClock() {
  last = 0;
  frame = 0;
  renderTimeSec = 0;
  lastSyncedClock = null;
}

export function masterTick(timeSec: number, lenis: Lenis | null) {
  // Delta clamp (dt <= 1/20 s) to guard against backgrounded tab lag-smoothing spikes (§4.1)
  const dt = last === 0 ? 1 / 60 : Math.min(timeSec - last, 1 / 20);
  last = timeSec;

  // 1) Smooth scroll step (emits 'scroll' -> ScrollTrigger.update)
  if (lenis) {
    lenis.raf(timeSec * 1000);
  }

  // 2) Publish scroll state
  if (typeof window !== "undefined") {
    const currentY = lenis ? lenis.scroll : window.scrollY;
    const computedVel = dt > 0 ? (currentY - scroll.y) / dt : 0;
    scroll.velocity = lenis ? lenis.velocity : computedVel;
    scroll.y = currentY;
    scroll.direction = lenis ? lenis.direction : (computedVel >= 0 ? 1 : -1);
    scroll.progress = lenis ? lenis.progress : 0;
  }

  // 3) Update subsystems in explicit order
  for (let i = 0; i < systems.length; i++) {
    systems[i].step(dt, timeSec);
  }

  // 4) Governor-controlled render
  const baseLevel = governor.level();
  if (baseLevel === 0) {
    return; // Completely paused / idle: no WebGL work
  }

  // Active scroll or scrubbing automatically elevates to Level 2 (every tick)
  // to prevent 30Hz/60Hz alternating frame stutter during scroll
  const isScrolling = Math.abs(scroll.velocity) > 0.01;
  const effectiveLevel = isScrolling ? 2 : baseLevel;

  // 1 = ~30 fps ambient (skip every other frame, only when completely at rest)
  if (effectiveLevel === 1 && (++frame & 1) !== 0) {
    return;
  }

  // Synchronize render time with active R3F clock to eliminate first-frame or remount spikes
  const r3fClock = getRendererClock();
  if (r3fClock && r3fClock !== lastSyncedClock) {
    lastSyncedClock = r3fClock;
    renderTimeSec = 0;
    r3fClock.elapsedTime = 0;
  }

  // Accumulate clamped delta in seconds for R3F advance.
  // In R3F frameloop="never", advance(timestamp) computes:
  //   delta = timestamp - clock.elapsedTime
  //   clock.elapsedTime = timestamp
  // Passing milliseconds (like performance.now()) causes delta to be ~16.6 instead of ~0.016,
  // making all useFrame lerps explode and all shaders cycle at 1000x speed.
  // By passing renderTimeSec (seconds, strictly advancing by dt <= 0.05), R3F receives the exact frame delta.
  renderTimeSec += dt;
  rendererAdvance(renderTimeSec, true);
}
