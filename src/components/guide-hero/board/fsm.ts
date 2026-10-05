"use client";

import { N } from "./atlas";
import { audio } from "@/audio/AudioController";
import { scheduleImpact } from "@/audio/impactBus";

export const IDLE = 0;
export const FLAPPING = 1;

export interface CellState {
  count: number;
  cols: number;
  rows: number;
  cur: Uint8Array;
  nxt: Uint8Array;
  target: Uint8Array;
  phase: Uint8Array;     // 0 = IDLE, 1 = FLAPPING
  t0: Float64Array;      // start time of current flip step in ms
  dur: Float32Array;     // duration of current flip step in ms
  armedAt: Float64Array; // scheduled start time including stagger delay
  angle: Float32Array;   // current hinge angle in radians
  last: Uint8Array;      // 1 if this step reaches target, 0 otherwise
  seed: Float32Array;    // per-cell jitter [0..1]
}

export interface FsmConfig {
  stepDurMs?: number;        // default 112ms (±10% jitter)
  lastStepDurMs?: number;    // default 138ms
  colStaggerMs?: number;     // default 14ms
  rowStaggerMs?: number;     // default 36ms
  maxFlipsK?: number;        // default 7 (skip-ahead cap)
  reducedMotion?: boolean;
}

/**
 * Creates an allocated CellState container.
 */
export function createCellState(maxCells: number, cols: number, rows: number): CellState {
  const seed = new Float32Array(maxCells);
  for (let i = 0; i < maxCells; i++) {
    seed[i] = Math.random();
  }

  return {
    count: cols * rows,
    cols,
    rows,
    cur: new Uint8Array(maxCells),
    nxt: new Uint8Array(maxCells),
    target: new Uint8Array(maxCells),
    phase: new Uint8Array(maxCells),
    t0: new Float64Array(maxCells),
    dur: new Float32Array(maxCells),
    armedAt: new Float64Array(maxCells),
    angle: new Float32Array(maxCells),
    last: new Uint8Array(maxCells),
    seed,
  };
}

/**
 * Computes next glyph on drum with skip-ahead cap K (PRD §5.1).
 * Guarantees at most K steps from cur to target.
 */
export function nextGlyph(cur: number, target: number, K: number = 7): number {
  if (cur === target) return target;
  const dist = (target - cur + N) % N;
  if (dist <= K) {
    return (cur + 1) % N;
  }
  // Skip ahead so at most K flips remain
  return (target - K + 1 + N) % N;
}

/**
 * Gravity acceleration fall with rigid stop rebound (PRD §5.2).
 * Continuous at u = 0.7 and u = 1.0 (both equal Math.PI).
 */
export function hingeAngle(u: number, last: boolean): number {
  const FALL = 0.7;
  const clampedU = Math.max(0, Math.min(1, u));
  if (clampedU < FALL) {
    const x = clampedU / FALL;
    return Math.PI * x * x; // accelerates under gravity (0 -> PI)
  }
  const s = (clampedU - FALL) / (1 - FALL); // rebound off the rigid stop
  return Math.PI - (last ? 0.16 : 0.08) * Math.sin(Math.PI * s) * (1 - s);
}

/**
 * Computes stagger delay based on column and row coordinates (PRD §5.3).
 */
export function delayFor(idx: number, cols: number, cfg: FsmConfig): number {
  const c = idx % cols;
  const r = Math.floor(idx / cols);
  const colStagger = cfg.colStaggerMs ?? 14;
  const rowStagger = cfg.rowStaggerMs ?? 36;
  return c * colStagger + r * rowStagger;
}

/**
 * Initiates a flip step on cell i (PRD §5.1).
 */
export function beginStep(s: CellState, i: number, now: number, target: number, cfg: FsmConfig) {
  const K = cfg.maxFlipsK ?? 7;
  const nxt = nextGlyph(s.cur[i], target, K);
  s.nxt[i] = nxt;
  const isLast = nxt === target;
  s.last[i] = isLast ? 1 : 0;
  s.phase[i] = FLAPPING;
  s.t0[i] = now;

  // Jitter ±10% based on pre-seeded randomness
  const jitter = 0.9 + 0.2 * s.seed[i];
  const baseDur = isLast ? (cfg.lastStepDurMs ?? 138) : (cfg.stepDurMs ?? 112);
  s.dur[i] = baseDur * jitter;
  s.angle[i] = 0;

  // Pre-schedule sample-accurate mechanical clack at rigid impact stop (u = 0.7) (§4.5)
  if (typeof window !== "undefined") {
    const impactAtMs = performance.now() + s.dur[i] * 0.7;
    const col = i % s.cols;
    const pan = s.cols > 1 ? (col / (s.cols - 1)) * 2 - 1 : 0;
    scheduleImpact(audio, impactAtMs, pan);
  }
}

/**
 * Per-cell state machine ticker (PRD §5.1).
 * Pure, unit-testable, with an injectable clock.
 * Returns true if any cell is currently moving.
 */
export function tick(s: CellState, now: number, target: Uint8Array, cfg: FsmConfig = {}): boolean {
  if (cfg.reducedMotion) {
    let moved = false;
    for (let i = 0; i < s.count; i++) {
      if (s.cur[i] !== target[i] || s.angle[i] !== 0) {
        s.cur[i] = target[i];
        s.nxt[i] = target[i];
        s.angle[i] = 0;
        s.phase[i] = IDLE;
        s.armedAt[i] = 0;
        moved = true;
      }
    }
    return moved;
  }

  let moving = false;
  for (let i = 0; i < s.count; i++) {
    const curTarget = target[i];

    if (s.phase[i] === IDLE) {
      if (s.cur[i] !== curTarget) {
        if (s.armedAt[i] === 0) {
          s.armedAt[i] = now + delayFor(i, s.cols, cfg);
        }
        if (now >= s.armedAt[i]) {
          beginStep(s, i, now, curTarget, cfg);
        }
        moving = true;
      }
      continue;
    }

    // Cell is in FLAPPING phase
    const dur = Math.max(1, s.dur[i]);
    const u = (now - s.t0[i]) / dur;

    if (u >= 1) {
      // Commit: swap glyphs and reset flap in the same frame
      s.cur[i] = s.nxt[i];
      s.angle[i] = 0;
      s.phase[i] = IDLE;
      s.armedAt[i] = 0;

      if (s.cur[i] !== curTarget) {
        // Chain next flip with no gap
        beginStep(s, i, now, curTarget, cfg);
        moving = true;
      }
    } else {
      s.angle[i] = hingeAngle(u, s.last[i] === 1);
      moving = true;
    }
  }

  return moving;
}
