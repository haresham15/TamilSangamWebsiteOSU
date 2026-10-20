// src/utils/audioLayer.ts
"use client";

import { soundEngine } from "@/lib/soundEngine";

/**
 * AudioLayer
 * Clean compatibility shim that directs all legacy calls directly into
 * the Master Warmth Bus in SoundEngine. Eliminates multiple audio contexts.
 */
class AudioLayer {
  public playWarmWoodClick() {
    soundEngine.playMicroTap();
  }

  public playTapeClack(_volume = 0.5) {
    soundEngine.playMicroTap();
  }

  public playSubBassThud(_volume = 0.75) {
    soundEngine.playParaiThump(75);
  }

  public playCinematicWhoosh(volume = 0.55, _playbackRate = 1.0) {
    soundEngine.playWhoosh(volume);
  }

  public playSilkSwish(volume = 0.35) {
    soundEngine.playSilkSwish(volume);
  }

  public setMuted(muted: boolean) {
    soundEngine.setMuted(muted);
  }

  public getMuted(): boolean {
    return soundEngine.getMuted();
  }
}

// Global Singleton
export const audioLayer = new AudioLayer();
