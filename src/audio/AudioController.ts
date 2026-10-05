// src/audio/AudioController.ts
"use client";

export type SoundId = "thud" | "clack" | "toggle" | "shutter";

export interface PlayOpts {
  gain?: number;
  pan?: number;
  rate?: number;
  inMs?: number;
}

const MAX_VOICES = 24;

/**
 * Seeded pseudo-random number generator for deterministic clack generation (§4.3)
 */
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generates an authentic mechanical Solari split-flap clack AudioBuffer (§4.2)
 * Recipe:
 *   20 ms buffer: white noise * exp(-380t) + 180 Hz sine * exp(-260t)
 */
function makeClackBuffer(ctx: AudioContext, seed: number): AudioBuffer {
  const rand = seededRandom(seed);
  const durationSec = 0.02; // 20 ms
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const noise = (rand() * 2 - 1) * Math.exp(-380 * t);
    const sine = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-260 * t);
    data[i] = noise * 0.7 + sine * 0.3;
  }

  return buffer;
}

/**
 * AudioController (§4.1, §4.3)
 * Exactly ONE audio context for the entire application:
 * - Lazy client initialization; suspended until explicit user gesture
 * - Master gain = 0 until user opts in via nav sound toggle
 * - Hardware mastering chain: voice -> masterGain -> DynamicsCompressor -> destination
 * - Deterministic synthesis (zero external audio file dependencies)
 * - Automatic suspension on visibilitychange (tab backgrounding)
 */
export class AudioController {
  private ctx?: AudioContext;
  private master?: GainNode;
  private comp?: DynamicsCompressorNode;
  private clacks: AudioBuffer[] = [];
  private voices = 0;

  public enabled = false;
  public unlocked = false;

  private ensure(): AudioContext {
    if (this.ctx) return this.ctx;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    const ctx = new AudioContextClass({ latencyHint: "interactive" });
    this.ctx = ctx;

    // Master Gain (silent until user explicitly opts in)
    const master = ctx.createGain();
    master.gain.value = 0;
    this.master = master;

    // Hardware Mastering Dynamics Compressor (-24 dB threshold, 12:1 ratio)
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -24;
    comp.ratio.value = 12;
    comp.attack.value = 0.003;
    comp.release.value = 0.12;
    this.comp = comp;

    master.connect(comp);
    comp.connect(ctx.destination);

    // Pre-bake 8 deterministic clack variants
    this.clacks = Array.from({ length: 8 }, (_, i) =>
      makeClackBuffer(ctx, 1234 + i * 77)
    );

    // Tab visibility handling (§4.7)
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          ctx.suspend().catch(() => {});
        } else if (this.enabled) {
          ctx.resume().catch(() => {});
        }
      });
    }

    return ctx;
  }

  /**
   * Unlock AudioContext on user gesture (§4.4)
   * Must be called synchronously inside a pointerdown/keydown/touchend handler.
   */
  public unlock() {
    const c = this.ensure();
    this.unlocked = true;
    if (c.state !== "running") {
      void c.resume();
    }
  }

  /**
   * Set user opt-in sound preference (§4.1)
   */
  public setEnabled(on: boolean, volume = 0.35) {
    const c = this.ensure();
    this.enabled = on;

    if (on && c.state !== "running") {
      void c.resume();
    }

    if (this.master) {
      this.master.gain.setTargetAtTime(on ? volume : 0, c.currentTime, 0.03);
    }

    try {
      localStorage.setItem("sound", on ? "1" : "0");
      localStorage.setItem("sangam_sound_enabled", on ? "true" : "false");
    } catch {
      // Ignore private browsing storage errors
    }
  }

  /**
   * Calculates audio clock time for sample-accurate scheduling (§4.3)
   */
  public when(inMs = 0): number {
    if (!this.ctx) return 0;
    return this.ctx.currentTime + Math.max(0, inMs) / 1000;
  }

  /**
   * Main dispatch for synthesized audio events (§4.2)
   */
  public play(id: SoundId, o: PlayOpts = {}) {
    // Early return: zero audio nodes allocated while muted or over voice cap
    if (
      !this.enabled ||
      !this.ctx ||
      this.ctx.state !== "running" ||
      this.voices >= MAX_VOICES
    ) {
      return;
    }

    const t = this.when(o.inMs);
    this.voices++;
    const done = () => {
      this.voices = Math.max(0, this.voices - 1);
    };

    if (id === "thud") {
      this.playThud(t, o.gain ?? 0.9, done);
    } else if (id === "clack") {
      this.playClack(t, o, done);
    } else if (id === "toggle") {
      this.playToggle(t, done);
    } else if (id === "shutter") {
      this.playShutter(t, done);
    } else {
      done();
    }
  }

  /**
   * Synthesized Amplifier Thud (P0 CTA Hover - §4.2)
   * Sine sweeping 95 -> 42 Hz over 90 ms, 4 ms attack, 160 ms decay, low-pass 220 Hz Q 0.7
   * plus a 12 ms low-passed noise tick for the mechanical relay.
   */
  private playThud(t: number, gainLevel: number, done: () => void) {
    if (!this.ctx || !this.master) return done();

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const lpf = ctx.createBiquadFilter();

    lpf.type = "lowpass";
    lpf.frequency.setValueAtTime(220, t);
    lpf.Q.setValueAtTime(0.7, t);

    osc.type = "sine";
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.09);

    // 4 ms attack, 160 ms exponential decay
    oscGain.gain.setValueAtTime(0.0001, t);
    oscGain.gain.linearRampToValueAtTime(gainLevel * 0.45, t + 0.004);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

    osc.connect(oscGain);
    oscGain.connect(lpf);
    lpf.connect(this.master);

    // 12 ms relay click noise
    const noiseLen = Math.floor(ctx.sampleRate * 0.012);
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const nData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      nData[i] = (Math.random() * 2 - 1) * Math.exp(-200 * (i / ctx.sampleRate));
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

    noiseSrc.connect(noiseGain);
    noiseGain.connect(lpf);

    osc.start(t);
    noiseSrc.start(t);
    osc.stop(t + 0.18);
    noiseSrc.stop(t + 0.014);

    osc.onended = () => done();
  }

  /**
   * Synthesized Flap Clack (P0 Guide Board - §4.2)
   * 20 ms buffer, band-pass 2.8 - 4.2 kHz Q 3, pan by column, playback-rate jitter
   */
  private playClack(t: number, o: PlayOpts, done: () => void) {
    if (!this.ctx || !this.master || this.clacks.length === 0) return done();

    const ctx = this.ctx;
    const bufIdx = Math.floor(Math.random() * this.clacks.length);
    const src = ctx.createBufferSource();
    src.buffer = this.clacks[bufIdx];
    src.playbackRate.setValueAtTime(o.rate ?? 1.0, t);

    // Bandpass filter 2.8 - 4.2 kHz
    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.setValueAtTime(2800 + Math.random() * 1400, t);
    bpf.Q.setValueAtTime(3.0, t);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(o.gain ?? 0.5, t);

    // Stereo Panner (if supported)
    if (typeof ctx.createStereoPanner === "function" && o.pan !== undefined) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, o.pan)), t);
      src.connect(bpf);
      bpf.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(this.master);
    } else {
      src.connect(bpf);
      bpf.connect(gainNode);
      gainNode.connect(this.master);
    }

    src.start(t);
    src.stop(t + 0.03);
    src.onended = () => done();
  }

  /**
   * Diagnostic / Nav Toggle Click (P1 - §4.2)
   * 6 ms square wave at 1.8 kHz, tiny gain
   */
  private playToggle(t: number, done: () => void) {
    if (!this.ctx || !this.master) return done();

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(1800, t);

    gainNode.gain.setValueAtTime(0.08, t);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.006);

    osc.connect(gainNode);
    gainNode.connect(this.master);

    osc.start(t);
    osc.stop(t + 0.007);
    osc.onended = () => done();
  }

  /**
   * Route/Boot Shutter Swell (P2 - §4.2)
   * 400 ms filtered noise swell
   */
  private playShutter(t: number, done: () => void) {
    if (!this.ctx || !this.master) return done();

    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * 0.4);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = Math.random() * 2 - 1;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.setValueAtTime(400, t);
    bpf.frequency.exponentialRampToValueAtTime(1400, t + 0.4);
    bpf.Q.setValueAtTime(2.0, t);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, t);
    gainNode.gain.linearRampToValueAtTime(0.15, t + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    src.connect(bpf);
    bpf.connect(gainNode);
    gainNode.connect(this.master);

    src.start(t);
    src.stop(t + 0.42);
    src.onended = () => done();
  }

  /**
   * Diagnostic Telemetry (§4.8)
   */
  public getMetrics() {
    return {
      state: this.ctx ? this.ctx.state : "uninstantiated",
      unlocked: this.unlocked,
      enabled: this.enabled,
      activeVoices: this.voices,
      sampleRate: this.ctx ? this.ctx.sampleRate : 0,
      baseLatency: this.ctx?.baseLatency ?? 0,
      outputLatency: (this.ctx as unknown as { outputLatency?: number })?.outputLatency ?? 0,
    };
  }
}

export const audio = new AudioController();
