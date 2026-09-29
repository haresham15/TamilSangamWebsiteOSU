/**
 * High-performance Pluck Event Bus and String Energy Model for Vaaranam Aayiram Hero
 * Source of truth: docs/gallery-hero-prd.md (Section 5.3)
 */

export type PluckListener = (stringIndex: number, strength: number, worldX?: number) => void;

class PluckBus {
  private listeners: Set<PluckListener> = new Set();

  // Six strings: 0 (thickest bass E) to 5 (thinnest treble E)
  public energies: Float32Array = new Float32Array(6);

  // Time constants τ: Bass settles in 3.2s, treble in 1.8s
  public tau: number[] = [3.2, 2.9, 2.6, 2.3, 2.0, 1.8];

  // Visual frequencies (4 - 10 Hz) for clear non-aliased 60fps reading
  public freqs: number[] = [4.2, 5.2, 6.4, 7.6, 8.8, 10.0];

  // Max displacement amplitudes in meters
  public maxAmps: number[] = [0.08, 0.072, 0.065, 0.058, 0.052, 0.045];

  private lastStrumTime: number = 0;

  public subscribe(fn: PluckListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public pluck(stringIndex: number, strength: number = 0.5, worldX?: number) {
    if (stringIndex < 0 || stringIndex >= 6) return;
    const clampedStrength = Math.min(1.0, Math.max(0.1, strength));

    // e = min(1, e + strength)
    this.energies[stringIndex] = Math.min(1.0, this.energies[stringIndex] + clampedStrength);

    this.listeners.forEach((fn) => fn(stringIndex, clampedStrength, worldX));
  }

  public update(delta: number) {
    const safeDelta = Math.min(delta, 0.1);
    for (let i = 0; i < 6; i++) {
      if (this.energies[i] > 0.001) {
        // e *= exp(-dt / τ)
        this.energies[i] *= Math.exp(-safeDelta / this.tau[i]);
      } else {
        this.energies[i] = 0;
      }
    }
  }

  // Handle scroll velocity strum triggers
  public handleScrollVelocity(velocity: number, now: number) {
    const absV = Math.abs(velocity);
    if (absV > 250 && now - this.lastStrumTime > 120) {
      this.lastStrumTime = now;
      const strength = Math.min(1.0, Math.max(0.15, absV / 2500.0));
      const scrollingDown = velocity > 0;

      // Strum across 6 strings with 35ms staggered delays
      for (let i = 0; i < 6; i++) {
        const stringIdx = scrollingDown ? i : 5 - i;
        const delay = i * 35;
        setTimeout(() => {
          this.pluck(stringIdx, strength);
        }, delay);
      }
    }
  }

  // Play opening gentle arpeggio beat on load
  public playIntroArpeggio() {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.pluck(i, 0.38);
      }, 350 + i * 45);
    }
  }
}

export const pluckBus = new PluckBus();

if (typeof window !== "undefined") {
  (window as unknown as { __pluckBus: PluckBus }).__pluckBus = pluckBus;
}
