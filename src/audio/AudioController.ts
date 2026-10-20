// src/audio/AudioController.ts
"use client";

import { soundEngine } from "@/lib/soundEngine";

export type SoundId = "thud" | "clack" | "toggle" | "shutter" | "whoosh" | "swish" | "chime";

export interface PlayOpts {
  gain?: number;
  pan?: number;
  rate?: number;
  inMs?: number;
}

/**
 * AudioController
 * Unified facade delegating 100% of audio events to the Master Warmth Bus in SoundEngine.
 * Eliminates duplicate AudioContext instantiations and guarantees zero raw destination routing.
 */
export class AudioController {
  public enabled = false;
  public unlocked = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved =
          localStorage.getItem("sound") ??
          localStorage.getItem("sangam_sound_enabled");
        this.enabled = saved === "1" || saved === "true";
      } catch {
        // Ignore private browsing storage restrictions
      }
    }
  }

  /**
   * Unlock AudioContext on user gesture
   */
  public unlock() {
    this.unlocked = true;
    soundEngine.unlock();
  }

  /**
   * Set user opt-in sound preference
   */
  public setEnabled(on: boolean, _volume = 0.4) {
    this.enabled = on;
    soundEngine.setMuted(!on);

    try {
      localStorage.setItem("sound", on ? "1" : "0");
      localStorage.setItem("sangam_sound_enabled", on ? "true" : "false");
    } catch {
      // Ignore private browsing storage errors
    }
  }

  /**
   * Calculates audio clock time for sample-accurate scheduling
   */
  public when(inMs = 0): number {
    const ctx = soundEngine.getContext();
    if (!ctx) return 0;
    return ctx.currentTime + Math.max(0, inMs) / 1000;
  }

  /**
   * Main dispatch for synthesized audio events routed through Master Warmth Bus
   */
  public play(id: SoundId, o: PlayOpts = {}) {
    if (!this.enabled || soundEngine.getMuted()) {
      return;
    }

    const delayMs = o.inMs ?? 0;
    const trigger = () => {
      switch (id) {
        case "thud":
          soundEngine.playParaiThump(o.gain ? o.gain * 85 : 75);
          break;
        case "clack":
          soundEngine.playFlapFlutter(o.pan ?? 0, o.rate ?? 1.0);
          break;
        case "toggle":
          soundEngine.playMicroTap();
          break;
        case "shutter":
          soundEngine.playWhoosh(o.gain ?? 0.45);
          break;
        case "whoosh":
          soundEngine.playWhoosh(o.gain ?? 0.5);
          break;
        case "swish":
          soundEngine.playSilkSwish(o.gain ?? 0.35);
          break;
        case "chime":
          soundEngine.playTempleChime();
          break;
      }
    };

    if (delayMs > 0) {
      setTimeout(trigger, delayMs);
    } else {
      trigger();
    }
  }

  /**
   * Diagnostic Telemetry
   */
  public getMetrics() {
    const ctx = soundEngine.getContext();
    return {
      state: ctx ? ctx.state : "uninstantiated",
      unlocked: this.unlocked,
      enabled: this.enabled,
      activeVoices: 0,
      sampleRate: ctx ? ctx.sampleRate : 0,
      baseLatency: ctx?.baseLatency ?? 0,
      outputLatency: (ctx as unknown as { outputLatency?: number })?.outputLatency ?? 0,
    };
  }
}

export const audio = new AudioController();
