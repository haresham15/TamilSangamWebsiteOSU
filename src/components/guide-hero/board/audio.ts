"use client";

/**
 * Web Audio API Synthesized Split-Flap Mechanical Clack (PRD §5)
 * Procedurally generates the authentic acoustic impact of a Solari flap striking the rigid stop.
 * Features rate-limiting, voice throttling, pitch jitter, and graceful silent fallbacks.
 */

import { soundEngine } from "@/lib/soundEngine";

let audioCtx: AudioContext | null = null;
let lastClickTime = 0;
const MIN_CLICK_INTERVAL_SEC = 0.008; // Max ~125 clicks/sec to avoid clipping

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    // Attempt resume on interaction
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a procedural mechanical flap click sound.
 * @param volume Master gain multiplier [0..1]
 * @param pitchMultiplier Variance around center resonant frequency
 */
export function playFlapClick(volume = 0.15, pitchMultiplier = 1.0) {
  try {
    if (soundEngine.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== "running") return;

    const now = ctx.currentTime;
    if (now - lastClickTime < MIN_CLICK_INTERVAL_SEC) {
      return; // Density throttle
    }
    lastClickTime = now;

    // 1. Noise Burst Buffer (5ms of white noise)
    const bufferSize = Math.floor(ctx.sampleRate * 0.006); // 6ms
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // 2. Resonant Bandpass Filter (metallic impact body around 2.8kHz - 3.4kHz)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    const centerFreq = (3000 + (Math.random() - 0.5) * 400) * pitchMultiplier;
    bandpass.frequency.setValueAtTime(centerFreq, now);
    bandpass.Q.setValueAtTime(4.5, now);

    // 3. Transient Click Impulse (800Hz damped ping)
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(820 * pitchMultiplier, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.007);

    // 4. Envelopes
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.007);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(volume * 0.45, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.005);

    // Master bus
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);

    whiteNoise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(masterGain);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    masterGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.008);

    osc.start(now);
    osc.stop(now + 0.008);
  } catch {
    // Silent fail if AudioContext is blocked by browser policy
  }
}
