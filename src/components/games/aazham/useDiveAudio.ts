// src/components/games/aazham/useDiveAudio.ts
"use client";

import { useRef, useCallback, useState, useEffect } from "react";

export function useDiveAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize or resume audio context on user gesture
  const getContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        ctxRef.current = new AudioCtx();
      }
    }
    if (ctxRef.current && ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // 1. Keystroke / Sonar Micro-Tick
  const playSonarTick = useCallback(() => {
    if (isMuted) return;
    const ctx = getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.04);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(3.5, ctx.currentTime);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.045);
  }, [getContext, isMuted]);

  // 2. Rejected Answer (Hollow Muted Thud)
  const playRejectThud = useCallback(() => {
    if (isMuted) return;
    const ctx = getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.17);
  }, [getContext, isMuted]);

  // 3. Accepted Lock-In Sound (Calibrated by Tier)
  const playTierLockIn = useCallback(
    (tier: number) => {
      if (isMuted) return;
      const ctx = getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (tier === 100) {
        // Valampuri Pearl: Dual-tone crystalline bell + sub-bass ocean swell
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = "sine";
        sub.frequency.setValueAtTime(65.4, now); // C2
        sub.frequency.exponentialRampToValueAtTime(43.6, now + 0.8);
        subGain.gain.setValueAtTime(0.25, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start(now);
        sub.stop(now + 0.9);

        // Chime harmonics (Raga Mohanam high Sa + Pa)
        [587.33, 880.0, 1174.66, 1760.0].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(0.12 / (idx + 1), now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + idx * 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + 1.3 + idx * 0.1);
        });
      } else if (tier === 85) {
        // Poompuhar Chola Gold Chime
        [440.49, 587.33, 880.0].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.14 / (idx + 1), now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + 0.95);
        });
      } else if (tier === 15) {
        // Puthisaali Trap: Cheeky double-blip
        [220.0, 293.66].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18 + idx * 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + 0.2 + idx * 0.08);
        });
      } else {
        // Standard Ascending Mohanam Note (Tiers 10, 30, 60)
        const freqMap: Record<number, number> = {
          10: 293.66, // Sa
          30: 367.08, // Ga
          60: 440.49, // Pa
        };
        const freq = freqMap[tier] || 330.0;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
      }
    },
    [getContext, isMuted]
  );

  // 4. Hydrodynamic Plunge Rush (Proportional to points dropped)
  const playPlungeRush = useCallback(
    (strength: number = 0.5) => {
      if (isMuted) return;
      const ctx = getContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(
        450 + strength * 250,
        ctx.currentTime + 0.25
      );
      filter.frequency.exponentialRampToValueAtTime(
        90,
        ctx.currentTime + 0.6
      );

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(
        0.08 * strength,
        ctx.currentTime + 0.2
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.6);
    },
    [getContext, isMuted]
  );

  return {
    isMuted,
    toggleMute,
    playSonarTick,
    playRejectThud,
    playTierLockIn,
    playPlungeRush,
  };
}
