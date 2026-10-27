// src/engine/masterTick.ts
import type Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { governor } from "./governor";
import { rendererAdvance, getRendererClock } from "./renderer";
import { heroScrollProgress } from "./heroScrollStore";

/**
 * Master Clock & Ticker (§4.1)
 * One callback, explicit execution order:
 * 1) Lenis scroll update
 * 2) ScrollTrigger explicit synchronization
 * 3) Scroll state publication
 * 3.5) Critical exponential damping of hero scroll progress
 * 4) Subsystem updates (ordered by System.order: springs, parallax, image planes, camera rigs)
 * 5) Governor evaluation and R3F advance()
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
let lastRenderTime = 0;
let lastSyncedClock: unknown = null;
let lastScrollActiveTime = 0;
let masterSimTime = 0;

export function resetMasterClock() {
  last = 0;
  lastRenderTime = 0;
  lastSyncedClock = null;
  lastScrollActiveTime = 0;
  masterSimTime = 0;
}

export function masterTick(timeSec: number, lenis: Lenis | null) {
  // Delta clamp (dt <= 1/30 s) to guard against any lag spikes or tab switch pauses (§4.1)
  const rawDt = last === 0 ? 1 / 60 : timeSec - last;
  last = timeSec;
  const dt = Math.max(0.0005, Math.min(rawDt, 1 / 30));
  masterSimTime += dt;

  // 1) Smooth scroll step driven with synchronized monotonic clamped time (ms)
  if (lenis) {
    lenis.raf(masterSimTime * 1000);
  } else if (typeof window !== "undefined") {
    // Synchronize ScrollTrigger with window scroll when Lenis is not active
    ScrollTrigger.update();
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

  // 2.5) Critical exponential damping of hero scroll progress (prevents mouse-wheel notch jitter)
  const heroDiff = heroScrollProgress.target - heroScrollProgress.current;
  const isHeroDamping = Math.abs(heroDiff) > 0.00005;
  if (isHeroDamping) {
    const heroDampFactor = 1 - Math.exp(-22 * dt);
    heroScrollProgress.current += heroDiff * heroDampFactor;
  } else {
    heroScrollProgress.current = heroScrollProgress.target;
  }

  // 3) Update subsystems in explicit order with clamped monotonic time
  for (let i = 0; i < systems.length; i++) {
    systems[i].step(dt, masterSimTime);
  }

  // 4) Governor-controlled render
  const baseLevel = governor.level();
  if (baseLevel === 0) {
    return; // Completely paused / idle: no WebGL work
  }

  // Maintain full 60fps rendering during active scroll and throughout inertia settling (1000ms window)
  const isVelocityActive = Math.abs(scroll.velocity) > 0.005;
  const now = performance.now();
  if (isVelocityActive || isHeroDamping) {
    lastScrollActiveTime = now;
  }
  const isRecentlyActive = now - lastScrollActiveTime < 1000;
  const effectiveLevel = (isVelocityActive || isHeroDamping || isRecentlyActive) ? 2 : baseLevel;

  // Ambient rendering follows elapsed time, independent of monitor refresh rate.
  if (effectiveLevel === 1) {
    const interval = 1000 / 30;
    if (lastRenderTime === 0) lastRenderTime = now - interval;
    const elapsed = now - lastRenderTime;
    if (elapsed + 0.0001 < interval) return;
    lastRenderTime += Math.floor((elapsed + 0.0001) / interval) * interval;
  } else {
    lastRenderTime = now;
  }

  // Prime a new R3F clock before its first manual advance to avoid a first-frame spike.
  const r3fClock = getRendererClock();
  if (r3fClock && r3fClock !== lastSyncedClock) {
    lastSyncedClock = r3fClock;
    r3fClock.elapsedTime = masterSimTime;
  }

  rendererAdvance(masterSimTime, true);
}
