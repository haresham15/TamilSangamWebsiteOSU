// src/audio/AudioController.ts
"use client";

export type SoundId = "thud" | "clack" | "toggle" | "shutter" | "whoosh" | "swish" | "chime";

export interface PlayOpts {
  gain?: number;
  pan?: number;
  rate?: number;
  inMs?: number;
}

const MAX_VOICES = 24;

/**
 * Seeded pseudo-random number generator for deterministic buffer generation
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
 * Generates an authentic, warm acoustic wooden tile flap AudioBuffer
 * Replaces harsh Solari split-flap metal clatter with comforting Teak/Rosewood acoustic physics:
 * - 32 ms buffer: warm 440Hz body + 720Hz acoustic wood tap
 * - Smooth attack to prevent transient clipping
 */
function makeClackBuffer(ctx: AudioContext, seed: number): AudioBuffer {
  const rand = seededRandom(seed);
  const durationSec = 0.032; // 32 ms
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const attack = t < 0.002 ? t / 0.002 : 1.0;
    const woodBody = Math.sin(2 * Math.PI * (440 + 80 * Math.exp(-200 * t)) * t) * Math.exp(-110 * t);
    const woodTap = Math.sin(2 * Math.PI * 720 * t) * Math.exp(-220 * t);
    const softFriction = (rand() * 2 - 1) * Math.exp(-320 * t) * 0.15;
    data[i] = attack * (woodBody * 0.55 + woodTap * 0.35 + softFriction);
  }

  return buffer;
}

/**
 * AudioController
 * Exactly ONE audio context for the entire application:
 * - Lazy client initialization; suspended until explicit user gesture
 * - Master gain managed dynamically via user preference
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

    // Master Gain (silent until user explicitly opts in or unmuted)
    const master = ctx.createGain();
    master.gain.value = 0;
    this.master = master;

    // Hardware Mastering Dynamics Compressor (Comforting mastering: -16 dB threshold, soft knee, 4:1 ratio)
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 16;
    comp.ratio.value = 4;
    comp.attack.value = 0.005;
    comp.release.value = 0.14;
    this.comp = comp;

    master.connect(comp);
    comp.connect(ctx.destination);

    // Pre-bake 8 deterministic acoustic wood clack variants
    this.clacks = Array.from({ length: 8 }, (_, i) =>
      makeClackBuffer(ctx, 1234 + i * 77)
    );

    // Tab visibility handling
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
   * Unlock AudioContext on user gesture
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
   * Set user opt-in sound preference
   */
  public setEnabled(on: boolean, volume = 0.4) {
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
   * Calculates audio clock time for sample-accurate scheduling
   */
  public when(inMs = 0): number {
    if (!this.ctx) return 0;
    return this.ctx.currentTime + Math.max(0, inMs) / 1000;
  }

  /**
   * Main dispatch for synthesized audio events
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
      this.playThud(t, o.gain ?? 0.8, done);
    } else if (id === "clack") {
      this.playClack(t, o, done);
    } else if (id === "toggle") {
      this.playToggle(t, done);
    } else if (id === "shutter") {
      this.playShutter(t, done);
    } else if (id === "whoosh") {
      this.playWhoosh(t, o.gain ?? 0.6, done);
    } else if (id === "swish") {
      this.playSwish(t, o.gain ?? 0.35, done);
    } else if (id === "chime") {
      this.playChime(t, done);
    } else {
      done();
    }
  }

  /**
   * Comforting Hearth / Mridangam Bass Thud
   * Smooth 85 -> 48 Hz pitch glide with rounded attack and soft lowpass 140 Hz
   */
  private playThud(t: number, gainLevel: number, done: () => void) {
    if (!this.ctx || !this.master) return done();

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const lpf = ctx.createBiquadFilter();

    lpf.type = "lowpass";
    lpf.frequency.setValueAtTime(140, t);
    lpf.Q.setValueAtTime(1.1, t);

    osc.type = "sine";
    osc.frequency.setValueAtTime(85, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.11);

    // 5 ms gentle attack, 180 ms exponential decay
    oscGain.gain.setValueAtTime(0.0001, t);
    oscGain.gain.linearRampToValueAtTime(gainLevel * 0.45, t + 0.005);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    osc.connect(oscGain);
    oscGain.connect(lpf);
    lpf.connect(this.master);

    osc.start(t);
    osc.stop(t + 0.20);
    osc.onended = () => done();
  }

  /**
   * Warm Acoustic Wooden Tile Flap (Guide Board)
   * Bandpass 480 - 750 Hz (comforting wooden range, removing harsh 3kHz buzz)
   */
  private playClack(t: number, o: PlayOpts, done: () => void) {
    if (!this.ctx || !this.master || this.clacks.length === 0) return done();

    const ctx = this.ctx;
    const bufIdx = Math.floor(Math.random() * this.clacks.length);
    const src = ctx.createBufferSource();
    src.buffer = this.clacks[bufIdx];
    src.playbackRate.setValueAtTime(o.rate ?? 1.0, t);

    // Warm wooden bandpass (520 - 780 Hz) instead of harsh 3500 Hz
    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.setValueAtTime(520 + Math.random() * 260, t);
    bpf.Q.setValueAtTime(1.4, t);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(o.gain ?? 0.45, t);

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
    src.stop(t + 0.04);
    src.onended = () => done();
  }

  /**
   * Comforting Nav / Diagnostic Toggle (Gentle Marimba / Bamboo Ping)
   * Replaces harsh 1800 Hz square wave with 528 Hz pure harmonic bell ping
   */
  private playToggle(t: number, done: () => void) {
    if (!this.ctx || !this.master) return done();

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(528, t);
    osc.frequency.exponentialRampToValueAtTime(512, t + 0.06);

    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.linearRampToValueAtTime(0.12, t + 0.003);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

    osc.connect(gainNode);
    gainNode.connect(this.master);

    osc.start(t);
    osc.stop(t + 0.08);
    osc.onended = () => done();
  }

  /**
   * Cinematic Route / Boot Shutter Swell
   * Low-mid resonant whoosh swell (180 Hz -> 680 Hz -> 220 Hz)
   */
  private playShutter(t: number, done: () => void) {
    this.playWhoosh(t, 0.55, done);
  }

  /**
   * Cinematic Sound Whoosh
   * Atmospheric low-mid air sweep for animations and view transitions
   */
  private playWhoosh(t: number, gainLevel: number, done: () => void) {
    if (!this.ctx || !this.master) return done();

    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * 0.42);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);

    let pink = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      pink = 0.95 * pink + 0.05 * white;
      d[i] = pink;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.setValueAtTime(160, t);
    bpf.frequency.exponentialRampToValueAtTime(720, t + 0.20);
    bpf.frequency.exponentialRampToValueAtTime(220, t + 0.42);
    bpf.Q.setValueAtTime(1.8, t);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, t);
    gainNode.gain.linearRampToValueAtTime(gainLevel * 0.4, t + 0.18);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    // Warm sub rumble for cinematic heft
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(80, t);
    sub.frequency.exponentialRampToValueAtTime(120, t + 0.18);
    sub.frequency.exponentialRampToValueAtTime(60, t + 0.42);

    subGain.gain.setValueAtTime(0.001, t);
    subGain.gain.linearRampToValueAtTime(gainLevel * 0.25, t + 0.18);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    src.connect(bpf);
    bpf.connect(gainNode);
    gainNode.connect(this.master);

    sub.connect(subGain);
    subGain.connect(this.master);

    src.start(t);
    sub.start(t);
    src.stop(t + 0.44);
    sub.stop(t + 0.44);

    src.onended = () => done();
  }

  /**
   * Kanchipuram Silk Swish (Pillar hovers and drawer flips)
   */
  private playSwish(t: number, gainLevel: number, done: () => void) {
    if (!this.ctx || !this.master) return done();

    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * 0.20);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);

    let pink = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      pink = 0.9 * pink + 0.1 * white;
      d[i] = pink;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.setValueAtTime(380, t);
    bpf.frequency.exponentialRampToValueAtTime(980, t + 0.10);
    bpf.frequency.exponentialRampToValueAtTime(450, t + 0.20);
    bpf.Q.setValueAtTime(1.5, t);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, t);
    gainNode.gain.linearRampToValueAtTime(gainLevel * 0.35, t + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.20);

    src.connect(bpf);
    bpf.connect(gainNode);
    gainNode.connect(this.master);

    src.start(t);
    src.stop(t + 0.22);
    src.onended = () => done();
  }

  /**
   * Meditative Bronze Chime
   */
  private playChime(t: number, done: () => void) {
    if (!this.ctx || !this.master) return done();

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(432, t);

    gainNode.gain.setValueAtTime(0.001, t);
    gainNode.gain.linearRampToValueAtTime(0.18, t + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    osc.connect(gainNode);
    gainNode.connect(this.master);

    osc.start(t);
    osc.stop(t + 1.25);
    osc.onended = () => done();
  }

  /**
   * Diagnostic Telemetry
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
