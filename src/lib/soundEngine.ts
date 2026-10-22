// src/lib/soundEngine.ts
"use client";

/**
 * Warm Hearth & Carnatic Acoustic Sound Engine
 * Physically modeled, culturally grounded Web Audio DSP architecture
 * for Ohio State Tamil Sangam.
 * 
 * Features:
 * - Master Warmth & Wooden Hall Bus (75Hz HPF -> 1750Hz Silk LPF -> Convolver -> Soft Knee Limiter -> MasterGain -> Destination)
 * - Raga Mohanam Tuning System (D3 Shruti Box tonic in Just Intonation)
 * - Soft-attack anti-click envelope invariant (>= 12ms–35ms linear ramp)
 * - Breathing Acoustic Tambura / Shruti Drone
 * - Soft Mridangam / Kanjira Finger-Tap + Ascending Raga Mohanam Harmonic for Five Pillars & Officers
 * - Acoustic Veena / Guitar 3-Partial Pluck & Vaaranam Aayiram Chord Strum
 * - Felt-Damped Rosewood Solari Split-Flap Flutter
 * - Warm Cotton-Rag Cardstock Archive Brush
 * - Bronze Kovil Mani Temple Bell Harmonic Shimmer
 * - Whisper-Soft Bamboo / Wood Micro-Tap
 */

// ============================================================================
// SPEC 2: CARNATIC RAGA MOHANAM TUNING SYSTEM (JUST INTONATION)
// Tonic: D3 = 146.83 Hz. Ratios: 1/1, 9/8, 5/4, 3/2, 5/3, 2/1
// ============================================================================
export const RAGA_MOHANAM_HZ = {
  Sa_low: 146.83, // D3  (1/1 - Warm Tonic Drone)
  Pa_low: 220.25, // A3  (3/2 - Fifth Drone)
  Sa: 293.66,     // D4  (1/1 - Pillar 01: Aatam)
  Ri2: 330.37,    // E4  (9/8 - Pillar 02: Paatam)
  Ga3: 367.08,    // F#4 (5/4 - Pillar 03: Kondatam)
  Pa: 440.49,     // A4  (3/2 - Pillar 04: Santhippum)
  Dha2: 489.43,   // B4  (5/3 - Pillar 05: Katral)
  Sa_hi: 587.33,  // D5  (2/1 - Resolution / Chime)
} as const;

export const MOHANAM_ASCENDING_SCALE = [
  RAGA_MOHANAM_HZ.Sa,
  RAGA_MOHANAM_HZ.Ri2,
  RAGA_MOHANAM_HZ.Ga3,
  RAGA_MOHANAM_HZ.Pa,
  RAGA_MOHANAM_HZ.Dha2,
  RAGA_MOHANAM_HZ.Sa_hi,
];

export const VAARANAM_6_STRINGS_HZ = [
  RAGA_MOHANAM_HZ.Sa_low, // 146.83 Hz (D3)
  RAGA_MOHANAM_HZ.Pa_low, // 220.25 Hz (A3)
  RAGA_MOHANAM_HZ.Sa,     // 293.66 Hz (D4)
  RAGA_MOHANAM_HZ.Ga3,    // 367.08 Hz (F#4)
  RAGA_MOHANAM_HZ.Pa,     // 440.49 Hz (A4)
  RAGA_MOHANAM_HZ.Sa_hi,  // 587.33 Hz (D5)
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;

  // Master Warmth Bus Nodes
  private masterInput: GainNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private warmthFilter: BiquadFilterNode | null = null;
  private dryGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private wetGain: GainNode | null = null;
  private busSum: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private woodenImpulseBuffer: AudioBuffer | null = null;

  // Ambient Tambura Drone Nodes
  private tamburaNodes: {
    oscRoot: OscillatorNode;
    oscFifth: OscillatorNode;
    oscSub: OscillatorNode;
    lfo: OscillatorNode;
    lpf: BiquadFilterNode;
    gain: GainNode;
  } | null = null;

  // Throttle state timestamps
  private lastFlapTime = 0;
  private lastTapTime = 0;
  private lastPillarTime = 0;
  private lastBrushTime = 0;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved =
          localStorage.getItem("sound") ??
          localStorage.getItem("sangam_sound_enabled");
        if (saved !== null) {
          this.isMuted = !(saved === "1" || saved === "true");
        }
      } catch {
        // Ignore storage exceptions in private windows
      }
    }
  }

  /**
   * Lazy AudioContext getter and master bus initialiser.
   * Ensures single hardware audio context with zero redundant instantiations.
   */
  public getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      this.ctx = new AudioContextClass({ latencyHint: "interactive" });
      this.initMasterBus(this.ctx);
    }
    if (this.ctx.state === "suspended" && !this.isMuted) {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMasterInput(): GainNode | null {
    if (!this.masterInput) {
      this.getContext();
    }
    return this.masterInput;
  }

  /**
   * Unlock AudioContext synchronously inside user touch/click/key gesture
   */
  public unlock() {
    const ctx = this.getContext();
    if (ctx && ctx.state !== "running") {
      void ctx.resume();
    }
  }

  /**
   * Procedural Warm Wooden Room Impulse
   * Generates a 0.55s low-passed (900 Hz) pink noise decay simulating
   * an intimate acoustic wooden courtyard or Muttram.
   */
  private renderWoodenRoomImpulse(ctx: AudioContext, durationSec = 0.55): AudioBuffer {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * durationSec);
    const buffer = ctx.createBuffer(2, length, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    let pinkL = 0;
    let pinkR = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const decay = Math.exp(-t * 7.2);
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;
      // 900Hz low-pass filter approximation on pink noise
      pinkL = 0.82 * pinkL + 0.18 * whiteL;
      pinkR = 0.82 * pinkR + 0.18 * whiteR;
      left[i] = pinkL * decay;
      right[i] = pinkR * decay;
    }
    return buffer;
  }

  /**
   * SPEC 1: Master Warmth & Wooden Hall Bus
   * Master Chain: InputNode -> HighPass (75Hz rumble cut) -> LowPass Warmth Filter (1750Hz, Q=0.65)
   *               -> Dry/Wet Convolver Split (82% Dry + 18% Warm 0.55s Wooden Room Impulse)
   *               -> DynamicsCompressorNode (Soft Knee Limiter) -> MasterGain (0.18 max ceiling) -> destination
   */
  private initMasterBus(ctx: AudioContext) {
    if (this.masterInput) return;

    this.woodenImpulseBuffer = this.renderWoodenRoomImpulse(ctx, 0.55);

    // 1. Input Node
    this.masterInput = ctx.createGain();
    this.masterInput.gain.setValueAtTime(1.0, ctx.currentTime);

    // 2. HighPass Filter (75Hz rumble cut)
    this.highpassFilter = ctx.createBiquadFilter();
    this.highpassFilter.type = "highpass";
    this.highpassFilter.frequency.setValueAtTime(75, ctx.currentTime);
    this.highpassFilter.Q.setValueAtTime(0.707, ctx.currentTime);

    // 3. LowPass Warmth Filter (1750Hz, Q=0.65) - Rolls off piercing upper-mids
    this.warmthFilter = ctx.createBiquadFilter();
    this.warmthFilter.type = "lowpass";
    this.warmthFilter.frequency.setValueAtTime(1750, ctx.currentTime);
    this.warmthFilter.Q.setValueAtTime(0.65, ctx.currentTime);

    // 4. Dry/Wet Convolver Split
    this.dryGain = ctx.createGain();
    this.dryGain.gain.setValueAtTime(0.82, ctx.currentTime);

    this.convolver = ctx.createConvolver();
    this.convolver.buffer = this.woodenImpulseBuffer;

    this.wetGain = ctx.createGain();
    this.wetGain.gain.setValueAtTime(0.18, ctx.currentTime);

    this.busSum = ctx.createGain();
    this.busSum.gain.setValueAtTime(1.0, ctx.currentTime);

    // 5. DynamicsCompressor (Soft Knee Limiter)
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-14, ctx.currentTime);
    this.compressor.knee.setValueAtTime(20, ctx.currentTime);
    this.compressor.ratio.setValueAtTime(3.5, ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.008, ctx.currentTime);
    this.compressor.release.setValueAtTime(0.12, ctx.currentTime);

    // 6. MasterGain (0.75 ceiling when unmuted, 0.0001 when muted)
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0001 : 0.75, ctx.currentTime);

    // Wire Chain:
    this.masterInput.connect(this.highpassFilter);
    this.highpassFilter.connect(this.warmthFilter);

    // Dry path
    this.warmthFilter.connect(this.dryGain);
    this.dryGain.connect(this.busSum);

    // Wet path (Convolver)
    this.warmthFilter.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.wetGain.connect(this.busSum);

    // Limiter -> Master -> Destination
    this.busSum.connect(this.compressor);
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    // Lifecycle handlers
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          ctx.suspend().catch(() => {});
        } else if (!this.isMuted) {
          ctx.resume().catch(() => {});
        }
      });
    }

    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", (e) => {
        if (e.matches) {
          this.stopAmbientDrone();
        } else if (!this.isMuted) {
          this.startAmbientDrone();
        }
      });
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    const ctx = this.getContext();
    if (ctx) {
      if (ctx.state === "suspended" && !muted) {
        ctx.resume().catch(() => {});
      }
      if (this.masterGain) {
        const now = ctx.currentTime;
        const target = muted ? 0.0001 : 0.75;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(target, now + 0.04);
      }
    }
    if (muted) {
      this.stopAmbientDrone();
    } else {
      this.startAmbientDrone();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public isAudioMuted(): boolean {
    return this.isMuted;
  }

  public startTamburaDrone() {
    this.startAmbientDrone();
  }

  public stopTamburaDrone() {
    this.stopAmbientDrone();
  }

  // ============================================================================
  // SPEC 3 VOICE 1: GLOBAL AMBIENCE (WARM TAMBURA / SHRUTI BREATH)
  // Two softly detuned sine/triangle oscillators at Sa_low and Pa_low + sub-octave fundamental.
  // Dedicated LPF cutoff breathes slowly between 260 Hz and 480 Hz via 0.09 Hz sine LFO.
  // ============================================================================
  public startAmbientDrone() {
    if (this.isMuted || this.tamburaNodes) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterInput) return;
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.0001, now);
    droneGain.gain.linearRampToValueAtTime(0.065, now + 1.8);

    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.setValueAtTime(370, now);
    lpf.Q.setValueAtTime(0.65, now);

    // LFO: 0.09 Hz sine modulating cutoff between 260 Hz and 480 Hz
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.09, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(110, now);
    lfo.connect(lfoGain);
    lfoGain.connect(lpf.frequency);

    // Sa_low: 146.83 Hz (D3)
    const oscRoot = ctx.createOscillator();
    oscRoot.type = "sine";
    oscRoot.frequency.setValueAtTime(RAGA_MOHANAM_HZ.Sa_low, now);
    const gRoot = ctx.createGain();
    gRoot.gain.setValueAtTime(0.0001, now);
    gRoot.gain.linearRampToValueAtTime(0.48, now + 0.1);

    // Pa_low: 220.25 Hz (A3) with gentle warmth
    const oscFifth = ctx.createOscillator();
    oscFifth.type = "triangle";
    oscFifth.frequency.setValueAtTime(RAGA_MOHANAM_HZ.Pa_low, now);
    oscFifth.detune.setValueAtTime(2.2, now);
    const gFifth = ctx.createGain();
    gFifth.gain.setValueAtTime(0.0001, now);
    gFifth.gain.linearRampToValueAtTime(0.28, now + 0.1);

    // Sub-octave warmth fundamental (73.42 Hz)
    const oscSub = ctx.createOscillator();
    oscSub.type = "sine";
    oscSub.frequency.setValueAtTime(73.42, now);
    const gSub = ctx.createGain();
    gSub.gain.setValueAtTime(0.0001, now);
    gSub.gain.linearRampToValueAtTime(0.32, now + 0.1);

    oscRoot.connect(gRoot);
    gRoot.connect(lpf);
    oscFifth.connect(gFifth);
    gFifth.connect(lpf);
    oscSub.connect(gSub);
    gSub.connect(lpf);

    lpf.connect(droneGain);
    droneGain.connect(this.masterInput);

    oscRoot.start(now);
    oscFifth.start(now);
    oscSub.start(now);
    lfo.start(now);

    this.tamburaNodes = { oscRoot, oscFifth, oscSub, lfo, lpf, gain: droneGain };
  }

  public stopAmbientDrone() {
    if (!this.tamburaNodes) return;
    const ctx = this.getContext();
    if (ctx && this.tamburaNodes) {
      const now = ctx.currentTime;
      this.tamburaNodes.gain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      const nodes = this.tamburaNodes;
      setTimeout(() => {
        try {
          nodes.oscRoot.stop();
          nodes.oscFifth.stop();
          nodes.oscSub.stop();
          nodes.lfo.stop();
          nodes.oscRoot.disconnect();
          nodes.oscFifth.disconnect();
          nodes.oscSub.disconnect();
          nodes.lfo.disconnect();
          nodes.lpf.disconnect();
          nodes.gain.disconnect();
        } catch {}
      }, 900);
    }
    this.tamburaNodes = null;
  }

  // ============================================================================
  // SPEC 3 VOICE 2: FIVE PILLARS & EXECUTIVE BOARD HOVERS
  // Soft Mridangam / Kanjira Finger-Tap (Layer A) + Ascending Raga Mohanam Harmonic (Layer B)
  // Sweeping down Pillars 01-05 literally plays an ascending arohanam phrase.
  // ============================================================================
  public playPillarHover(indexOrKey: number | string = 0) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterInput) return;

    const now = ctx.currentTime;
    if (performance.now() - this.lastPillarTime < 60) return;
    this.lastPillarTime = performance.now();

    let idx = 0;
    if (typeof indexOrKey === "number") {
      idx = Math.max(0, Math.floor(indexOrKey));
    } else {
      const match = indexOrKey.match(/\d+/);
      if (match) idx = Math.max(0, parseInt(match[0], 10) - 1);
    }

    const overtoneFreq = MOHANAM_ASCENDING_SCALE[idx % MOHANAM_ASCENDING_SCALE.length];

    // Layer A (Warm Clay/Wood Body Tap: 165 -> 78 Hz, 14ms attack, 85ms decay, LPF 420 Hz)
    const oscA = ctx.createOscillator();
    const gainA = ctx.createGain();
    const lpfA = ctx.createBiquadFilter();

    lpfA.type = "lowpass";
    lpfA.frequency.setValueAtTime(420, now);

    oscA.type = "sine";
    oscA.frequency.setValueAtTime(165, now);
    oscA.frequency.exponentialRampToValueAtTime(78, now + 0.045);

    gainA.gain.setValueAtTime(0.0001, now);
    gainA.gain.linearRampToValueAtTime(0.18, now + 0.014);
    gainA.gain.exponentialRampToValueAtTime(0.0001, now + 0.099);

    oscA.connect(gainA);
    gainA.connect(lpfA);
    lpfA.connect(this.masterInput);

    // Layer B (Raga Mohanam Melodic Whisper: gain 0.14, 25ms attack, 320ms decay)
    const oscB = ctx.createOscillator();
    const gainB = ctx.createGain();

    oscB.type = "sine";
    oscB.frequency.setValueAtTime(overtoneFreq, now);

    gainB.gain.setValueAtTime(0.0001, now);
    gainB.gain.linearRampToValueAtTime(0.14, now + 0.025);
    gainB.gain.exponentialRampToValueAtTime(0.0001, now + 0.345);

    oscB.connect(gainB);
    gainB.connect(this.masterInput);

    oscA.start(now);
    oscB.start(now);
    oscA.stop(now + 0.11);
    oscB.stop(now + 0.36);
  }

  // ============================================================================
  // SPEC 3 VOICE 3: GALLERY HERO (/gallery - VAARANAM AAYIRAM 6 STRINGS & EASTER EGG)
  // Acoustic Veena / Guitar 3-Partial Pluck with Soundboard Thump
  // ============================================================================
  public playAcousticString(stringIndex: number, strength: number = 0.5) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterInput) return;

    const idx = Math.min(5, Math.max(0, stringIndex));
    const baseFreq = VAARANAM_6_STRINGS_HZ[idx];
    const s = Math.min(1.0, Math.max(0.15, strength));
    const now = ctx.currentTime;

    // 1. Fundamental (1f, sine, gain: 0.22 * s, attack 15ms, decay 1.1s)
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(baseFreq, now);

    g1.gain.setValueAtTime(0.0001, now);
    g1.gain.linearRampToValueAtTime(0.22 * s, now + 0.015);
    g1.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

    osc1.connect(g1);
    g1.connect(this.masterInput);

    // 2. Octave (2f, triangle low-passed at 1100Hz, gain: 0.10 * s, attack 12ms, decay 0.45s)
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    const lpf2 = ctx.createBiquadFilter();
    lpf2.type = "lowpass";
    lpf2.frequency.setValueAtTime(1100, now);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(baseFreq * 2.0, now);

    g2.gain.setValueAtTime(0.0001, now);
    g2.gain.linearRampToValueAtTime(0.10 * s, now + 0.012);
    g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc2.connect(g2);
    g2.connect(lpf2);
    lpf2.connect(this.masterInput);

    // 3. Fifth/Body (3f, sine, gain: 0.04 * s, attack 10ms, decay 0.20s)
    const osc3 = ctx.createOscillator();
    const g3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(baseFreq * 3.0, now);

    g3.gain.setValueAtTime(0.0001, now);
    g3.gain.linearRampToValueAtTime(0.04 * s, now + 0.010);
    g3.gain.exponentialRampToValueAtTime(0.0001, now + 0.20);

    osc3.connect(g3);
    g3.connect(this.masterInput);

    // 4. Soundboard Resonance Thump (110Hz, gain: 0.08 * s, 18ms)
    const oscThump = ctx.createOscillator();
    const gThump = ctx.createGain();
    oscThump.type = "sine";
    oscThump.frequency.setValueAtTime(110, now);

    gThump.gain.setValueAtTime(0.0001, now);
    gThump.gain.linearRampToValueAtTime(0.08 * s, now + 0.005);
    gThump.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    oscThump.connect(gThump);
    gThump.connect(this.masterInput);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    oscThump.start(now);

    osc1.stop(now + 1.15);
    osc2.stop(now + 0.50);
    osc3.stop(now + 0.25);
    oscThump.stop(now + 0.025);
  }

  public playAcousticMajor7ChordSwell() {
    this.playVaaranamChord();
  }

  /**
   * Vaaranam Aayiram Nostalgic Acoustic Chord Reverie
   * Arpeggiates strings 0 -> 5 with 65ms human strum stagger and 2.4s warm acoustic decay.
   */
  public playVaaranamChord() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterInput) return;

    for (let idx = 0; idx < 6; idx++) {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const baseFreq = VAARANAM_6_STRINGS_HZ[idx];
        const decay = 2.4 - idx * 0.15;

        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const g = ctx.createGain();
        const lpf = ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq, now);

        oscHarmonic.type = "triangle";
        oscHarmonic.frequency.setValueAtTime(baseFreq * 2.0, now);

        lpf.type = "lowpass";
        lpf.frequency.setValueAtTime(1200, now);

        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.16, now + 0.020);
        g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(lpf);
        oscHarmonic.connect(lpf);
        lpf.connect(g);
        g.connect(this.masterInput!);

        osc.start(now);
        oscHarmonic.start(now);
        osc.stop(now + decay + 0.05);
        oscHarmonic.stop(now + decay + 0.05);
      }, idx * 65);
    }
  }

  // ============================================================================
  // SPEC 3 VOICE 4: GUIDE SPLIT-FLAP DEPARTURE BOARD
  // Soft Felt-Damped Rosewood Solari Flutter:
  // 16ms pink-noise buffer through warm Wooden Resonator bandpass (460 Hz ± 12%, Q=2.2)
  // + 95 Hz muted felt-stop thump at ultra-low gain (0.022).
  // ============================================================================
  public playFlapFlutter(pan: number = 0, rate: number = 1.0) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterInput) return;

    const now = ctx.currentTime;
    if (performance.now() - this.lastFlapTime < 18) return;
    this.lastFlapTime = performance.now();

    // 1. 16ms pink noise buffer
    const len = Math.floor(ctx.sampleRate * 0.016);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let pink = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      pink = 0.86 * pink + 0.14 * white;
      data[i] = pink;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.setValueAtTime(Math.max(0.7, Math.min(1.4, rate)), now);

    // 2. Warm Wooden Resonator Bandpass (460 Hz ± 12% jitter, Q = 2.2)
    const jitter = (Math.random() - 0.5) * 2 * 0.12;
    const centerFreq = 460 * (1 + jitter);
    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.setValueAtTime(centerFreq, now);
    bpf.Q.setValueAtTime(2.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.085, now + 0.004);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

    // 3. 95 Hz muted felt-stop thump
    const feltOsc = ctx.createOscillator();
    const feltGain = ctx.createGain();
    feltOsc.type = "sine";
    feltOsc.frequency.setValueAtTime(95, now);
    feltOsc.frequency.exponentialRampToValueAtTime(45, now + 0.020);

    feltGain.gain.setValueAtTime(0.0001, now);
    feltGain.gain.linearRampToValueAtTime(0.070, now + 0.004);
    feltGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.020);

    // Stereo Panning
    let destNode: AudioNode = this.masterInput;
    if (typeof ctx.createStereoPanner === "function" && pan !== 0) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
      panner.connect(this.masterInput);
      destNode = panner;
    }

    src.connect(bpf);
    bpf.connect(noiseGain);
    noiseGain.connect(destNode);

    feltOsc.connect(feltGain);
    feltGain.connect(destNode);

    src.start(now);
    feltOsc.start(now);
    src.stop(now + 0.020);
    feltOsc.stop(now + 0.025);
  }

  // ============================================================================
  // SPEC 3 VOICE 5: ARCHIVE SHUFFLE ("SHUFFLE ARCHIVE" & GALLERY FILTERS)
  // Warm Cotton-Rag Cardstock Brush:
  // 130ms pink-noise buffer filtered through smooth bandpass sweeping 280 -> 520 -> 310 Hz
  // with soft bell-curve envelope (35ms attack, 95ms release, gain 0.12).
  // ============================================================================
  public playArchiveBrush() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterInput) return;

    const now = ctx.currentTime;
    if (performance.now() - this.lastBrushTime < 180) return;
    this.lastBrushTime = performance.now();

    const len = Math.floor(ctx.sampleRate * 0.13);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let pink = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      pink = 0.90 * pink + 0.10 * white;
      data[i] = pink;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.setValueAtTime(280, now);
    bpf.frequency.exponentialRampToValueAtTime(520, now + 0.05);
    bpf.frequency.exponentialRampToValueAtTime(310, now + 0.13);
    bpf.Q.setValueAtTime(1.4, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(this.masterInput);

    src.start(now);
    src.stop(now + 0.135);
  }

  // ============================================================================
  // SPEC 3 VOICE 6: HOME THIRUKKURAL 81 & JOIN CAMPUS GATES
  // Soft Bronze Kovil Mani (Temple Bell) Harmonic Shimmer:
  // Sa_hi (587.33 Hz, gain 0.18, 40ms attack, 2.2s decay)
  // + Pa (440.49 Hz, gain 0.12, 1.8s decay)
  // + Upper shimmer partial (1174.66 Hz, LPF 1350 Hz, gain 0.05, 0.9s decay).
  // ============================================================================
  public playTempleChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterInput) return;

    const now = ctx.currentTime;

    // 1. Sa_hi (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(RAGA_MOHANAM_HZ.Sa_hi, now);

    g1.gain.setValueAtTime(0.0001, now);
    g1.gain.linearRampToValueAtTime(0.18, now + 0.040);
    g1.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    osc1.connect(g1);
    g1.connect(this.masterInput);

    // 2. Pa (440.49 Hz)
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(RAGA_MOHANAM_HZ.Pa, now);

    g2.gain.setValueAtTime(0.0001, now);
    g2.gain.linearRampToValueAtTime(0.12, now + 0.035);
    g2.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc2.connect(g2);
    g2.connect(this.masterInput);

    // 3. Upper shimmer partial (1174.66 Hz, low-passed at 1350 Hz)
    const osc3 = ctx.createOscillator();
    const g3 = ctx.createGain();
    const lpf3 = ctx.createBiquadFilter();
    lpf3.type = "lowpass";
    lpf3.frequency.setValueAtTime(1350, now);

    osc3.type = "sine";
    osc3.frequency.setValueAtTime(1174.66, now);

    g3.gain.setValueAtTime(0.0001, now);
    g3.gain.linearRampToValueAtTime(0.05, now + 0.025);
    g3.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    osc3.connect(lpf3);
    lpf3.connect(g3);
    g3.connect(this.masterInput);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + 2.25);
    osc2.stop(now + 1.85);
    osc3.stop(now + 0.95);
  }

  // ============================================================================
  // SPEC 3 VOICE 7: NAVBAR, COMMAND PALETTE (⌘K) & BUTTON MICRO-TAPS
  // Whisper-Soft Bamboo/Wood Micro-Tap: 28ms sine drop (240 -> 130 Hz, 10ms soft attack, gain 0.14)
  // ============================================================================
  public playMicroTap() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterInput) return;

    const now = ctx.currentTime;
    if (performance.now() - this.lastTapTime < 50) return;
    this.lastTapTime = performance.now();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.028);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.010);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    osc.connect(gain);
    gain.connect(this.masterInput);

    osc.start(now);
    osc.stop(now + 0.032);
  }

  // Backward compatibility alias for micro-tap
  public playWoodClick() {
    this.playMicroTap();
  }

  // Backward compatibility alias for temple bell / chime
  public playTempleBell(_freq?: number) {
    this.playTempleChime();
  }

  // Backward compatibility alias for marimba / pillar hover
  public playMarimbaTransient(freq?: number) {
    this.playPillarHover(freq ?? 0);
  }

  // Backward compatibility alias for card slide / archive brush
  public playCardSlideSwoosh(_volume?: number) {
    this.playArchiveBrush();
  }

  // Parai / Thavil Deep Resonant Thump (Smooth rounded skin drum)
  public playParaiThump(pitch: number = 75) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterInput) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lpf = ctx.createBiquadFilter();

    lpf.type = "lowpass";
    lpf.frequency.setValueAtTime(160, now);

    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch * 1.4, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(45, pitch * 0.7), now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc.connect(gain);
    gain.connect(lpf);
    lpf.connect(this.masterInput);

    osc.start(now);
    osc.stop(now + 0.30);
  }

  // Rice Flour / Kolam Scratch (Soft whisper chime)
  public playFlourChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterInput) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(RAGA_MOHANAM_HZ.Sa_hi, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.10, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterInput);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Cinematic Sound Whoosh
  public playWhoosh(volume: number = 0.5) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterInput) return;

    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.35);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);

    let pink = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      pink = 0.94 * pink + 0.06 * white;
      d[i] = pink;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.setValueAtTime(160, now);
    bpf.frequency.exponentialRampToValueAtTime(620, now + 0.16);
    bpf.frequency.exponentialRampToValueAtTime(200, now + 0.35);
    bpf.Q.setValueAtTime(1.6, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume * 0.18, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(this.masterInput);

    src.start(now);
    src.stop(now + 0.36);
  }

  // Kanchipuram Silk Swish
  public playSilkSwish(volume: number = 0.35) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterInput) return;

    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.18);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);

    let pink = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      pink = 0.91 * pink + 0.09 * white;
      d[i] = pink;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.setValueAtTime(320, now);
    bpf.frequency.exponentialRampToValueAtTime(820, now + 0.09);
    bpf.frequency.exponentialRampToValueAtTime(380, now + 0.18);
    bpf.Q.setValueAtTime(1.4, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume * 0.14, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(this.masterInput);

    src.start(now);
    src.stop(now + 0.19);
  }

  // Solkattu Syllables Synthesizer
  public playSolkattuSyllable(syllable: string) {
    if (this.isMuted) return;
    const s = syllable.toLowerCase();

    switch (s) {
      case "ta":
      case "த":
        this.playPillarHover(0);
        break;
      case "ka":
      case "க":
        this.playMicroTap();
        break;
      case "di":
      case "தி":
        this.playPillarHover(1);
        break;
      case "mi":
      case "மி":
        this.playPillarHover(2);
        break;
      case "ki":
      case "கி":
        this.playPillarHover(3);
        break;
      case "thom":
      case "தொம்":
        this.playParaiThump(60);
        break;
      case "nam":
      case "நம்":
        this.playTempleChime();
        break;
      default:
        this.playPillarHover(4);
    }
  }
}

export const soundEngine = new SoundEngine();

if (typeof window !== "undefined") {
  (window as unknown as { __soundEngine?: SoundEngine }).__soundEngine = soundEngine;
}
