// src/components/guide-hero/board/audio.ts
"use client";

import { soundEngine } from "@/lib/soundEngine";

/**
 * Mechanical Split-Flap Impact Audio Trigger
 * Routes through the Master Warmth Bus in SoundEngine with felt-damped rosewood physics.
 */
export function playFlapClick(_volume = 0.15, pitchMultiplier = 1.0) {
  try {
    if (soundEngine.getMuted()) return;
    soundEngine.playFlapFlutter(0, pitchMultiplier);
  } catch {
    // Silent fail if AudioContext is blocked by browser policy
  }
}
