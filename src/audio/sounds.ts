// src/audio/sounds.ts
"use client";

import { soundEngine } from "@/lib/soundEngine";

const elementCooldowns = new Map<string, number>();
let lastPillarTime = 0;
let lastShuffleTime = 0;
let lastWhooshTime = 0;
let lastSwishTime = 0;

/**
 * Breathing Acoustic Tambura / Shruti Drone loop for Global Audio toggle.
 */
export function playHearthAmbience() {
  soundEngine.startAmbientDrone();
}

export function stopHearthAmbience() {
  soundEngine.stopAmbientDrone();
}

/**
 * Soft Mridangam / Kanjira Finger-Tap + Ascending Raga Mohanam Harmonic (SPEC 3 Voice 2)
 * For Five Pillars and Executive Board sweeps.
 */
export function playPillarHover(elementKey: string | number = "pillar-global") {
  if (typeof window === "undefined") return;
  if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;

  const now = performance.now();
  const last = typeof elementKey === "string" ? (elementCooldowns.get(elementKey) ?? 0) : 0;
  if (now - last < 100) return;
  if (now - lastPillarTime < 50) return;

  if (typeof elementKey === "string") {
    elementCooldowns.set(elementKey, now);
  }
  lastPillarTime = now;

  soundEngine.playPillarHover(elementKey);
}

/**
 * Tactile Warm Cotton-Rag Cardstock Brush (SPEC 3 Voice 5)
 * For SHUFFLE ARCHIVE & photo filter clicks.
 */
export function playArchiveShuffle() {
  if (typeof window === "undefined") return;
  const now = performance.now();
  if (now - lastShuffleTime < 180) return;
  lastShuffleTime = now;

  soundEngine.playArchiveBrush();
}

/**
 * Soft Bronze Kovil Mani (Temple Bell) Harmonic Shimmer (SPEC 3 Voice 6)
 */
export function playKuralChime() {
  soundEngine.playTempleChime();
}

/**
 * Parai / Thavil Deep Resonant Thump for CTA hover
 */
export function playCtaThud(elementKey = "global-cta") {
  if (typeof window === "undefined") return;
  const isFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  if (!isFinePointer) return;

  const now = performance.now();
  const lastElementTime = elementCooldowns.get(elementKey) ?? 0;
  if (now - lastElementTime < 350) return;
  elementCooldowns.set(elementKey, now);

  soundEngine.playParaiThump(75);
}

export function playToggleTick() {
  soundEngine.playMicroTap();
}

export function playShutterSwell() {
  soundEngine.playWhoosh(0.45);
}

export function playCinematicWhoosh(gain = 0.5) {
  if (typeof window === "undefined") return;
  const now = performance.now();
  if (now - lastWhooshTime < 200) return;
  lastWhooshTime = now;

  soundEngine.playWhoosh(gain);
}

export function playSilkSwish(gain = 0.35) {
  if (typeof window === "undefined") return;
  const now = performance.now();
  if (now - lastSwishTime < 70) return;
  lastSwishTime = now;

  soundEngine.playSilkSwish(gain);
}
