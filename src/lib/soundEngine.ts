// Web Audio API Procedural Synthesizer for Tamil Sangam UI sounds and Solkattu rhythm engine

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;

  constructor() {
    // Initialized lazily on first user interaction
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // 1. Soft Temple Bell / Metal Tick
  public playTempleBell(freq: number = 880) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, ctx.currentTime + 1.2);

    // Harmonic overtone
    const oscHarmonic = ctx.createOscillator();
    oscHarmonic.type = "sine";
    oscHarmonic.frequency.setValueAtTime(freq * 2.76, ctx.currentTime);

    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(0.2, ctx.currentTime);
    harmGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc.connect(gain);
    oscHarmonic.connect(harmGain);
    harmGain.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    oscHarmonic.start();
    osc.stop(ctx.currentTime + 1.6);
    oscHarmonic.stop(ctx.currentTime + 1.6);
  }

  // 2. Parai / Thavil Deep Resonant Thump
  public playParaiThump(pitch: number = 75) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch * 2.4, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  // 3. Crisp Wood / Reed Click (Button & Micro-interaction)
  public playWoodClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  // 4. Rice Flour / Kolam Scratch Sound (Soft noise burst)
  public playFlourChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200 + Math.random() * 400, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  // 5. Solkattu Syllables Synthesizer
  public playSolkattuSyllable(syllable: string) {
    if (this.isMuted) return;
    const s = syllable.toLowerCase();

    switch (s) {
      case "ta":
      case "த":
        this.playDrumTone(160, 0.08, "sine");
        break;
      case "ka":
      case "க":
        this.playWoodClick();
        break;
      case "di":
      case "தி":
        this.playDrumTone(220, 0.1, "triangle");
        break;
      case "mi":
      case "மி":
        this.playDrumTone(280, 0.07, "sine");
        break;
      case "ki":
      case "கி":
        this.playDrumTone(380, 0.05, "triangle");
        break;
      case "thom":
      case "தொம்":
        this.playParaiThump(60);
        break;
      case "nam":
      case "நம்":
        this.playTempleBell(440);
        break;
      default:
        this.playDrumTone(200, 0.08, "triangle");
    }
  }

  private playDrumTone(freq: number, duration: number, type: OscillatorType) {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + duration * 0.5);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  // 6. Authentic Plucked Acoustic Guitar String Synthesizer
  public playAcousticString(stringIndex: number, strength: number = 0.5) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const GUITAR_FREQS = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
    const DECAY_TIMES = [2.6, 2.4, 2.1, 1.8, 1.6, 1.4];

    const idx = Math.min(5, Math.max(0, stringIndex));
    const baseFreq = GUITAR_FREQS[idx];
    const decay = DECAY_TIMES[idx];
    const s = Math.min(1.0, Math.max(0.1, strength));
    const now = ctx.currentTime;

    // Filter for brightness based on pluck strength
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(baseFreq * 2 + s * 4500, now);
    filter.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + decay * 0.4);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.22 * s, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    // Fundamental + 2nd, 3rd, 4th harmonics
    const harmonics = [
      { mult: 1.0, gain: 0.7 },
      { mult: 2.0, gain: 0.35 },
      { mult: 3.0, gain: 0.18 },
      { mult: 4.0, gain: 0.08 },
    ];

    harmonics.forEach(({ mult, gain: hGain }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(baseFreq * mult, now);

      g.gain.setValueAtTime(hGain, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + decay * (1 / Math.sqrt(mult)));

      osc.connect(g);
      g.connect(filter);
      osc.start(now);
      osc.stop(now + decay + 0.05);
    });

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
  }
}

export const soundEngine = new SoundEngine();
