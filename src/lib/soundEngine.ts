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
}

export const soundEngine = new SoundEngine();
