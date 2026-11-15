// src/engine/qualityGovernor.ts
/**
 * Adaptive quality (measured, not guessed).
 *
 * Fed one timestamp per rendered frame from masterTick while the frame governor is at
 * level 2 (active scroll/animation). Judges p95 frame interval over 2 s windows:
 *   - two consecutive windows over 1.2× budget → step down one level
 *   - four consecutive windows (8 s) under 0.75× budget → step back up
 * Levels: 0 full · 1 render scale −25% + 4 bloom mips · 2 DPR cap 1.25 · 3 hero Tier-B feature set.
 * Never drops to Tier C mid-session (static fallback is decided by TierProvider/Lite only).
 *
 * CPU-bound windows (long tasks fill ≥25% of the window) do not step down: lowering
 * resolution cannot help a busy main thread and only costs sharpness. Long-task data
 * comes from PerformanceObserver('longtask') where supported (Chromium); elsewhere every
 * slow window is treated as GPU-bound.
 */

export type QualityLevel = 0 | 1 | 2 | 3;

const WINDOW_MS = 2000;
const DOWN_WINDOWS = 2;
const UP_WINDOWS = 4;
const SPIKE_MS = 200; // compile hitches / tab resumes are not steady-state cost
const CPU_BOUND_SHARE = 0.25;

let level: QualityLevel = 0;
let budgetMs = 1000 / 60;
let lastFrame = 0;
let windowStart = 0;
let intervals: number[] = [];
let overCount = 0;
let underCount = 0;
let pinned: QualityLevel | null = null;
let longTaskMs = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setLevel(next: QualityLevel) {
  if (next === level) return;
  level = next;
  emit();
}

export const qualityGovernor = {
  /** Called once per rendered frame. `active` = frame governor effective level 2. */
  frame(nowMs: number, active: boolean) {
    if (!active || pinned !== null) {
      // Idle gap: start a fresh window when activity resumes.
      lastFrame = 0;
      windowStart = 0;
      intervals = [];
      longTaskMs = 0;
      return;
    }
    if (lastFrame !== 0) {
      const dt = nowMs - lastFrame;
      if (dt > 0 && dt < SPIKE_MS) intervals.push(dt);
    }
    lastFrame = nowMs;
    if (windowStart === 0) windowStart = nowMs;
    if (nowMs - windowStart < WINDOW_MS) return;

    const windowMs = nowMs - windowStart;
    windowStart = nowMs;
    const cpuBound = longTaskMs / windowMs >= CPU_BOUND_SHARE;
    longTaskMs = 0;
    if (intervals.length < 20) {
      intervals = [];
      return;
    }
    intervals.sort((a, b) => a - b);
    const p95 = intervals[Math.floor((intervals.length - 1) * 0.95)];
    intervals = [];

    if (p95 > budgetMs * 1.2 && cpuBound) {
      // Main thread is the bottleneck; resolution changes would not help.
      overCount = 0;
      underCount = 0;
    } else if (p95 > budgetMs * 1.2) {
      underCount = 0;
      if (++overCount >= DOWN_WINDOWS && level < 3) {
        overCount = 0;
        setLevel((level + 1) as QualityLevel);
      }
    } else if (p95 < budgetMs * 0.75) {
      overCount = 0;
      if (++underCount >= UP_WINDOWS && level > 0) {
        underCount = 0;
        setLevel((level - 1) as QualityLevel);
      }
    } else {
      overCount = 0;
      underCount = 0;
    }
  },

  /** Main-thread long-task time (ms) observed since the window started. */
  recordLongTask(ms: number) {
    longTaskMs += ms;
  },

  setBudgetMs(ms: number) {
    budgetMs = ms;
  },

  getLevel(): QualityLevel {
    return pinned ?? level;
  },

  /** Debug/test override (`?quality=0..3`); null releases the pin. */
  pin(next: QualityLevel | null) {
    pinned = next;
    emit();
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  reset() {
    level = 0;
    lastFrame = 0;
    windowStart = 0;
    intervals = [];
    overCount = 0;
    underCount = 0;
    longTaskMs = 0;
    emit();
  },
};

/** Grade target scale relative to device pixels. */
export function renderScaleFor(q: QualityLevel): number {
  return q >= 1 ? 0.75 : 1;
}

export function bloomMipsFor(q: QualityLevel): number {
  return q >= 1 ? 4 : 5;
}

export function dprCapFor(q: QualityLevel, tierCap: number): number {
  return q >= 2 ? Math.min(1.25, tierCap) : tierCap;
}

if (typeof window !== "undefined") {
  try {
    const q = new URLSearchParams(window.location.search).get("quality");
    if (q === "0" || q === "1" || q === "2" || q === "3") qualityGovernor.pin(Number(q) as QualityLevel);
  } catch {
    // non-standard environments
  }
  const coarse = window.matchMedia?.("(pointer: coarse)").matches;
  qualityGovernor.setBudgetMs(coarse ? 1000 / 30 : 1000 / 60);
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) qualityGovernor.recordLongTask(entry.duration);
    }).observe({ type: "longtask", buffered: false });
  } catch {
    // longtask unsupported (Safari/Firefox): every slow window counts as GPU-bound
  }
  (window as unknown as { __quality?: typeof qualityGovernor }).__quality = qualityGovernor;
}
