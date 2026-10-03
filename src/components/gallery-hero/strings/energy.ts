/**
 * Fretboard Highway - String Energy Model (§3.4)
 *
 * Integrates scroll velocity from ScrollTrigger into per-string kinetic energy
 * with fast attack and natural acoustic exponential ring-out.
 */

import { GUITAR_STRINGS } from "./stringMath";

export class StringEnergyModel {
  public vSmooth = 0.0;
  public energy: Float32Array = new Float32Array(6);
  public pluckT: Float32Array = new Float32Array([-1, -1, -1, -1, -1, -1]);
  public pluckAmp: Float32Array = new Float32Array(6);

  public damperK = 0.0;
  public damperPos = 70.625; // Matches anchorAt(3, 0.755).s (§5.2)
  public loadK = 0.0;
  public loadPos = 70.625;   // Matches anchorAt(3, 0.755).s (§5.2)
  public driveGain = 1.0;

  private readonly gains: number[];

  constructor() {
    this.gains = GUITAR_STRINGS.map((s) => s.gain);
  }

  /**
   * Per-frame energy integration
   * @param dt - Delta time in seconds
   * @param vRaw - Raw scroll velocity in px/s
   * @param damperK - Active damper strength (0..1)
   */
  public update(dt: number, vRaw: number, damperK = 0.0): void {
    this.damperK = damperK;

    // Smoothed velocity: vSmooth += (vRaw - vSmooth) * (1 - exp(-dt / 0.08))
    const alphaV = 1.0 - Math.exp(-Math.min(dt, 0.1) / 0.08);
    this.vSmooth += (vRaw - this.vSmooth) * alphaV;

    // Saturating drive curve (knee at ~2500 px/s)
    const drive = (1.0 - Math.exp(-Math.abs(this.vSmooth) / 2500.0)) * this.driveGain;

    for (let i = 0; i < 6; i++) {
      const target = drive * this.gains[i] * (1.0 - this.damperK);
      // Fast attack (tau = 0.05s), slow ring-out (tau = 0.55s, shortened when damped)
      const tau = target > this.energy[i] ? 0.05 : Math.max(0.08, 0.55 - 0.35 * this.damperK);
      const alphaE = 1.0 - Math.exp(-Math.min(dt, 0.1) / tau);
      this.energy[i] += (target - this.energy[i]) * alphaE;

      // Advance pluck timer if active
      if (this.pluckT[i] >= 0.0) {
        this.pluckT[i] += dt;
        // Expire after 3.2 seconds
        if (this.pluckT[i] > 3.2) {
          this.pluckT[i] = -1.0;
          this.pluckAmp[i] = 0.0;
        }
      }
    }
  }

  /**
   * Triggers a pluck on a specific string
   * @param stringIndex - 0 to 5
   * @param amp - Initial amplitude (0..1)
   */
  public triggerPluck(stringIndex: number, amp = 0.85): void {
    if (stringIndex >= 0 && stringIndex < 6) {
      this.pluckT[stringIndex] = 0.0;
      this.pluckAmp[stringIndex] = amp;
    }
  }

  /**
   * Triggers a downstroke sweep across all six strings
   * Staggered by 45ms per string (§5.3)
   */
  public triggerAllPlucks(baseAmp = 0.9): void {
    for (let i = 0; i < 6; i++) {
      const delayMs = i * 45;
      const amp = baseAmp * (1.0 - i * 0.05);
      if (delayMs === 0) {
        this.triggerPluck(0, amp);
      } else {
        setTimeout(() => {
          this.triggerPluck(i, amp);
        }, delayMs);
      }
    }
  }

  /**
   * Resets all vibration energy to stillness
   */
  public reset(): void {
    this.vSmooth = 0.0;
    this.energy.fill(0);
    this.pluckT.fill(-1);
    this.pluckAmp.fill(0);
    this.damperK = 0.0;
    this.loadK = 0.0;
    this.driveGain = 1.0;
  }
}
