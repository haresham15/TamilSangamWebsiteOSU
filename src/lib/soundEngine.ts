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

  // 1. Soothing Temple Bronze Bell / Singing Bowl Chime (432Hz meditative scale)
  public playTempleBell(freq: number = 432) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.995, now + 1.6);

    // Harmonic warm overtone (2.0x fundamental)
    const oscHarmonic = ctx.createOscillator();
    oscHarmonic.type = "sine";
    oscHarmonic.frequency.setValueAtTime(freq * 2.0, now);

    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(0.0001, now);
    harmGain.gain.linearRampToValueAtTime(0.12, now + 0.005);
    harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    // Soft low-pass filter for velvety warmth
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.setValueAtTime(2400, now);

    osc.connect(gain);
    oscHarmonic.connect(harmGain);
    harmGain.connect(gain);
    gain.connect(lpf);
    lpf.connect(ctx.destination);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + 1.85);
    oscHarmonic.stop(now + 1.85);
  }

  // 2. Parai / Thavil Deep Resonant Thump (Smooth rounded skin drum)
  public playParaiThump(pitch: number = 75) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lpf = ctx.createBiquadFilter();

    lpf.type = "lowpass";
    lpf.frequency.setValueAtTime(160, now);

    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch * 1.8, now);
    osc.frequency.exponentialRampToValueAtTime(pitch, now + 0.06);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(lpf);
    lpf.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // 3. Comforting Rosewood / Palagai Wood Tap (Replaces harsh square wave)
  public playWoodClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const oscBody = ctx.createOscillator();
    const oscSnap = ctx.createOscillator();
    const gainBody = ctx.createGain();
    const gainSnap = ctx.createGain();
    const masterGain = ctx.createGain();
    const lpf = ctx.createBiquadFilter();

    lpf.type = "lowpass";
    lpf.frequency.setValueAtTime(1400, now);

    // Warm wooden fundamental (480Hz -> 420Hz)
    oscBody.type = "sine";
    oscBody.frequency.setValueAtTime(480, now);
    oscBody.frequency.exponentialRampToValueAtTime(420, now + 0.03);

    gainBody.gain.setValueAtTime(0.0001, now);
    gainBody.gain.linearRampToValueAtTime(0.24, now + 0.002);
    gainBody.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

    // Subtle wooden snap overtone (960Hz)
    oscSnap.type = "triangle";
    oscSnap.frequency.setValueAtTime(960, now);
    oscSnap.frequency.exponentialRampToValueAtTime(640, now + 0.015);

    gainSnap.gain.setValueAtTime(0.0001, now);
    gainSnap.gain.linearRampToValueAtTime(0.08, now + 0.0015);
    gainSnap.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    masterGain.gain.setValueAtTime(0.8, now);

    oscBody.connect(gainBody);
    oscSnap.connect(gainSnap);
    gainBody.connect(masterGain);
    gainSnap.connect(masterGain);
    masterGain.connect(lpf);
    lpf.connect(ctx.destination);

    oscBody.start(now);
    oscSnap.start(now);
    oscBody.stop(now + 0.045);
    oscSnap.stop(now + 0.025);
  }

  // 4. Rice Flour / Kolam Scratch Sound (Soft, comforting whisper)
  public playFlourChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(840 + Math.random() * 200, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // 4b. Cinematic Sound Whoosh
  public playWhoosh(volume: number = 0.5) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.42);
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
    bpf.frequency.exponentialRampToValueAtTime(700, now + 0.2);
    bpf.frequency.exponentialRampToValueAtTime(220, now + 0.42);
    bpf.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume * 0.45, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    // Warm sub rumble
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(80, now);
    sub.frequency.exponentialRampToValueAtTime(110, now + 0.18);
    sub.frequency.exponentialRampToValueAtTime(60, now + 0.42);

    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(volume * 0.28, now + 0.18);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(ctx.destination);

    sub.connect(subGain);
    subGain.connect(ctx.destination);

    src.start(now);
    sub.start(now);
    src.stop(now + 0.44);
    sub.stop(now + 0.44);
  }

  // 4c. Kanchipuram Silk Swish
  public playSilkSwish(volume: number = 0.35) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.22);
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
    bpf.frequency.setValueAtTime(360, now);
    bpf.frequency.exponentialRampToValueAtTime(950, now + 0.11);
    bpf.frequency.exponentialRampToValueAtTime(420, now + 0.22);
    bpf.Q.setValueAtTime(1.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(ctx.destination);

    src.start(now);
    src.stop(now + 0.23);
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
