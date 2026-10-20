// src/audio/impactBus.ts
"use client";

import { soundEngine } from "@/lib/soundEngine";
import { audio, AudioController } from "./AudioController";

const buckets = new Map<number, { n: number; pan: number }>();

/**
 * scheduleImpact (SPEC 3 Voice 4)
 * Batches mechanical flap impacts that land inside the same 20 ms window
 * into a single acoustic voice with square-root gain scaling, column stereo panning,
 * and deterministic playback-rate jitter.
 * 
 * Flushes via queueMicrotask after the tick's synchronous cell loop completes.
 */
export function scheduleImpact(
  _a: AudioController = audio,
  atMs: number,
  pan: number
) {
  // Key represents a 20 ms quantization bucket (SPEC 3 Voice 4)
  const key = Math.round(atMs / 20);
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
      const avgPan = g.n > 0 ? g.pan / g.n : 0;
      const rateJitter = 0.92 + Math.random() * 0.16;

      if (delayMs > 0) {
        setTimeout(() => {
          soundEngine.playFlapFlutter(avgPan, rateJitter);
        }, delayMs);
      } else {
        soundEngine.playFlapFlutter(avgPan, rateJitter);
      }
    });
  }
}
