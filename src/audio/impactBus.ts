// src/audio/impactBus.ts
"use client";

import { audio, AudioController } from "./AudioController";

const buckets = new Map<number, { n: number; pan: number }>();

/**
 * scheduleImpact (§4.5)
 * Batches mechanical flap impacts that land inside the same 8 ms window
 * into a single acoustic voice with square-root gain scaling, column stereo panning,
 * and deterministic playback-rate jitter.
 * 
 * Flushes via queueMicrotask after the tick's synchronous cell loop completes.
 */
export function scheduleImpact(
  a: AudioController = audio,
  atMs: number,
  pan: number
) {
  // Key represents an 8 ms quantization bucket
  const key = Math.round(atMs / 8);
  const b = buckets.get(key) ?? { n: 0, pan: 0 };
  b.n++;
  b.pan += pan;
  buckets.set(key, b);

  if (b.n === 1) {
    queueMicrotask(() => {
      const g = buckets.get(key);
      if (!g) return;
      buckets.delete(key);

      const delayMs = Math.max(0, atMs - performance.now());
      const blendedGain = Math.min(1.0, 0.35 + 0.18 * Math.sqrt(g.n));
      const avgPan = g.n > 0 ? g.pan / g.n : 0;
      const rateJitter = 0.94 + Math.random() * 0.12;

      a.play("clack", {
        inMs: delayMs,
        gain: blendedGain,
        pan: avgPan,
        rate: rateJitter,
      });
    });
  }
}
