// src/audio/sounds.ts
"use client";

import { audio } from "./AudioController";

const elementCooldowns = new Map<string, number>();
let globalThudTimes: number[] = [];

/**
 * Plays a synthesized amplifier thud on CTA pointer hover (§4.6).
 * 
 * Rules:
 * - Fine pointers only (matchMedia "(pointer: fine) and (hover: hover)")
 * - Per-element cooldown of 400 ms
 * - Global rate-limit of 3 thuds per second
 * - Respects master mute state
 */
export function playCtaThud(elementKey = "global-cta") {
  if (typeof window === "undefined") return;

  // Strict check: pointer must be mouse/trackpad, not touch
  const isFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  if (!isFinePointer) return;

  const now = performance.now();

  // 1. Per-element 400 ms cooldown
  const lastElementTime = elementCooldowns.get(elementKey) ?? 0;
  if (now - lastElementTime < 400) {
    return;
  }

  // 2. Global limit: max 3 per second
  globalThudTimes = globalThudTimes.filter((t) => now - t < 1000);
  if (globalThudTimes.length >= 3) {
    return;
  }

  elementCooldowns.set(elementKey, now);
  globalThudTimes.push(now);

  audio.play("thud", { gain: 0.85 });
}

export function playToggleTick() {
  audio.play("toggle");
}

export function playShutterSwell() {
  audio.play("shutter");
}
