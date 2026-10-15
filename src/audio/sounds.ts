// src/audio/sounds.ts
"use client";

import { audio } from "./AudioController";
import { audioLayer } from "@/utils/audioLayer";

const elementCooldowns = new Map<string, number>();
let globalThudTimes: number[] = [];
let lastWhooshTime = 0;
let lastSwishTime = 0;

// ─── Hearth Ambience Loop ────────────────────────────────────────────────────
// Singleton drone: tambura-style low detuned oscillator pair + vinyl noise
let hearthCtx: AudioContext | null = null;
let hearthGain: GainNode | null = null;
let hearthRunning = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const W = window as unknown as { webkitAudioContext?: typeof AudioContext };
  const Cls = window.AudioContext ?? W.webkitAudioContext;
  if (!Cls) return null;
  if (!hearthCtx) hearthCtx = new Cls({ latencyHint: "playback" });
  return hearthCtx;
}

/**
 * Seamless tambura/veena drone loop for the Global Audio toggle.
 * Synthesized: two detuned sine oscillators (root + 5th) + gentle vinyl noise.
 * Gain is low-passed at <900 Hz so high frequencies never fatigue.
 *
 * Call once on audio-enable; it runs until stopHearthAmbience().
 */
export function playHearthAmbience() {
  if (hearthRunning) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.8);
  hearthGain = master;

  // Low-pass at 900 Hz (warm, meditative, non-fatiguing)
  const lpf = ctx.createBiquadFilter();
  lpf.type = "lowpass";
  lpf.frequency.value = 900;
  lpf.Q.value = 0.7;

  // Tambura root: 110 Hz (A2)
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = 110;
  const g1 = ctx.createGain(); g1.gain.value = 0.55;

  // Perfect 5th: 165 Hz (E3)
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 165;
  // Slow detune oscillation for living warmth (±3 cents over 7 seconds)
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 1 / 7;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 3;
  lfo.connect(lfoGain);
  lfoGain.connect(osc2.detune);
  const g2 = ctx.createGain(); g2.gain.value = 0.32;

  // Vinyl warmth: subtle pink noise band at 80-300 Hz
  const noiseLen = Math.floor(ctx.sampleRate * 2.5);
  const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  let pink = 0;
  for (let i = 0; i < noiseLen; i++) {
    pink = 0.98 * pink + 0.02 * (Math.random() * 2 - 1);
    nd[i] = pink * 0.4;
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuf;
  noiseSource.loop = true;
  const noiseLpf = ctx.createBiquadFilter();
  noiseLpf.type = "lowpass";
  noiseLpf.frequency.value = 300;
  const noiseGain = ctx.createGain(); noiseGain.gain.value = 0.04;

  osc1.connect(g1); g1.connect(lpf);
  osc2.connect(g2); g2.connect(lpf);
  noiseSource.connect(noiseLpf); noiseLpf.connect(noiseGain); noiseGain.connect(lpf);
  lpf.connect(master);
  master.connect(ctx.destination);

  osc1.start(); osc2.start(); lfo.start(); noiseSource.start();
  hearthRunning = true;
}

export function stopHearthAmbience() {
  if (!hearthRunning || !hearthGain || !hearthCtx) return;
  const ctx = hearthCtx;
  hearthGain.gain.setTargetAtTime(0, ctx.currentTime, 0.8);
  hearthRunning = false;
}

// ─── Pillar Hover Tap ────────────────────────────────────────────────────────
let lastPillarTime = 0;

/**
 * Soft mridangam rim tap for Five Pillars and Officer Board sweeps.
 * Pitched down ~4 semitones from the standard thud (70 Hz root).
 * Volume: 15% of master. Per-element 150 ms cooldown.
 */
export function playPillarHover(elementKey = "pillar-global") {
  if (typeof window === "undefined") return;
  if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;
  const now = performance.now();
  const last = elementCooldowns.get(elementKey) ?? 0;
  if (now - last < 150) return;
  if (now - lastPillarTime < 60) return;
  elementCooldowns.set(elementKey, now);
  lastPillarTime = now;
  // Mridangam rim: lower pitch, softer than cta thud
  audio.play("thud", { gain: 0.15, rate: 0.82 });
}

// ─── Archive Shuffle Cardstock ───────────────────────────────────────────────
let lastShuffleTime = 0;

/**
 * Tactile heavy cardstock/polaroid slide for SHUFFLE ARCHIVE & filter clicks.
 * 180 ms foley: bandpass noise burst mimicking thick paper slide.
 */
export function playArchiveShuffle() {
  if (typeof window === "undefined") return;
  const now = performance.now();
  if (now - lastShuffleTime < 300) return;
  lastShuffleTime = now;
  // Map to swish (bandpass noise) at slightly higher gain and slower sweep
  audio.play("swish", { gain: 0.55 });
  audioLayer.playSilkSwish(0.45);
}

// ─── Kural Chime ─────────────────────────────────────────────────────────────

/**
 * 600 ms bronze temple-bell harmonic shimmer.
 * Triggered on bilingual script toggle and 3-Act hero scroll completion.
 */
export function playKuralChime() {
  audio.play("chime");
}

/**
 * Plays a comforting hearth thud on CTA pointer hover (§4.6).
 * 
 * Rules:
 * - Fine pointers only (matchMedia "(pointer: fine) and (hover: hover)")
 * - Per-element cooldown of 400 ms
 * - Global rate-limit of 3 thuds per second
 * - Respects master mute state
 */
export function playCtaThud(elementKey = "global-cta") {
  if (typeof window === "undefined") return;

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

  audio.play("thud", { gain: 0.8 });
}

export function playToggleTick() {
  audio.play("toggle");
}

export function playShutterSwell() {
  audio.play("shutter");
}

/**
 * Plays a cinematic sound whoosh for animations, card reveals, and hero scrolls.
 * Cooldown guarded to prevent voice stacking.
 */
export function playCinematicWhoosh(gain = 0.55) {
  if (typeof window === "undefined") return;
  const now = performance.now();
  if (now - lastWhooshTime < 250) return;
  lastWhooshTime = now;

  audio.play("whoosh", { gain });
  audioLayer.playCinematicWhoosh(gain);
}

/**
 * Plays a delicate silk swish for hover reveals and tab changes.
 */
export function playSilkSwish(gain = 0.35) {
  if (typeof window === "undefined") return;
  const now = performance.now();
  if (now - lastSwishTime < 80) return;
  lastSwishTime = now;

  audio.play("swish", { gain });
  audioLayer.playSilkSwish(gain);
}
