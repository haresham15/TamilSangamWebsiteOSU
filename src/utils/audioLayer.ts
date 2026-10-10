// src/utils/audioLayer.ts
"use client";

/**
 * TACTILE AUDIO LAYER (WEB AUDIO API SINGLETON)
 * Zero-latency hardware audio engine mimicking ACIDBITE mechanical media packs.
 * Uses pre-rendered in-memory AudioBuffers and a hardware-style mastering compressor.
 * Eliminates standard HTML5 <audio> tag latency and network thrashing.
 */

class AudioLayer {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private tapeClackBuffer: AudioBuffer | null = null;
  private subBassThudBuffer: AudioBuffer | null = null;
  private isUnlocked: boolean = false;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initPassiveUnlock();
    }
  }

  private initContext(): boolean {
    if (this.ctx) return true;
    if (typeof window === "undefined") return false;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Compressor Limiter Chain
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-6, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      // Pre-synthesize and decode high-fidelity raw mechanical buffers into RAM
      this.tapeClackBuffer = this.renderTapeClackBuffer(this.ctx);
      this.subBassThudBuffer = this.renderSubBassThudBuffer(this.ctx);

      return true;
    } catch {
      return false;
    }
  }

  private initPassiveUnlock() {
    const unlock = () => {
      if (this.initContext() && this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      } else {
        this.isUnlocked = true;
      }
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true, passive: true });
  }

  /**
   * Synthesizes an ACIDBITE-style analog tape-deck head clack:
   * Instantaneous metallic mechanical transient + 820Hz chamber body + tape friction impulse.
   */
  private renderTapeClackBuffer(ctx: AudioContext): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const duration = 0.038; // 38ms
    const numFrames = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, numFrames, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      // Dirac-style high frequency strike
      const metallicTransient = Math.sin(2 * Math.PI * 2600 * t) * Math.exp(-650 * t);
      // Cassette tape carriage resonance
      const carriageBody = Math.sin(2 * Math.PI * 840 * t) * Math.exp(-340 * t);
      // Secondary head latch click
      const latchClick = Math.sin(2 * Math.PI * 360 * t) * Math.exp(-220 * t);
      // Analog tape hiss burst
      const hiss = (Math.random() * 2 - 1) * Math.exp(-480 * t) * 0.35;

      data[i] = metallicTransient * 0.45 + carriageBody * 0.35 + latchClick * 0.15 + hiss;
    }

    return buffer;
  }

  /**
   * Synthesizes an ACIDBITE-style heavily muted, low-pass filtered sub-bass thud:
   * 58Hz -> 34Hz pitch dive, steep exponential decay, heavy analogue saturation.
   */
  private renderSubBassThudBuffer(ctx: AudioContext): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const duration = 0.18; // 180ms
    const numFrames = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, numFrames, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      // Pitch drop curve (58Hz down to 34Hz)
      const freq = 34 + 24 * Math.exp(-22 * t);
      const phase = 2 * Math.PI * freq * t;
      const sub = Math.sin(phase);
      // Harmonic saturation for acoustic warmth
      const saturated = Math.tanh(sub * 1.6) * 0.8;
      // Fast exponential decay envelope
      const env = Math.exp(-18 * t);

      // Low impact transient tick at onset (0 -> 4ms)
      const impactTick = t < 0.006 ? Math.sin(2 * Math.PI * 180 * t) * (1 - t / 0.006) * 0.25 : 0;

      data[i] = (saturated * env) + impactTick;
    }

    return buffer;
  }

  /**
   * Crisp analog tape-deck clack (bound to standard hovers and Dossier Ribbons)
   */
  public playTapeClack(volume = 0.45) {
    if (this.isMuted) return;
    if (!this.initContext() || !this.ctx || !this.tapeClackBuffer || !this.masterGain) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    const source = this.ctx.createBufferSource();
    source.buffer = this.tapeClackBuffer;

    // Slight pitch variation (0.96 -> 1.04) prevents robotic repetition
    source.playbackRate.value = 0.96 + Math.random() * 0.08;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);

    source.connect(gain);
    gain.connect(this.masterGain);

    source.start(0);
  }

  /**
   * Muted low-pass filtered sub-bass thud (bound to primary call-to-actions / "Join the Hearth")
   */
  public playSubBassThud(volume = 0.85) {
    if (this.isMuted) return;
    if (!this.initContext() || !this.ctx || !this.subBassThudBuffer || !this.masterGain) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    const source = this.ctx.createBufferSource();
    source.buffer = this.subBassThudBuffer;

    // Micro pitch variation for organic tactile weight
    source.playbackRate.value = 0.98 + Math.random() * 0.04;

    // Dedicated low-pass filter to guarantee deep, heavy thud
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(120, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(0);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1.0, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

// Global Singleton
export const audioLayer = new AudioLayer();
