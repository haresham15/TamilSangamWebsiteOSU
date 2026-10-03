/**
 * Fretboard Highway - String Physics & CPU Mirror (§3.3, §7.4)
 *
 * Exact CPU mirror of the vertex displacement shader.
 * Guarantees zero drift between GPU rendering and CPU-driven prop contact math.
 */

export interface GuitarStringSpec {
  index: number;
  note: string;
  name: string;
  radius: number; // su
  isWound: boolean;
  fundamentalHz: number; // Visual fundamental f1 in Hz (scaled by 0.02427)
  gain: number; // STRING_GAIN: [1.0, 0.95, 0.9, 0.8, 0.7, 0.6]
  phase: number;
}

export const GUITAR_STRINGS: GuitarStringSpec[] = [
  { index: 0, note: "E2", name: "Low E", radius: 0.090, isWound: true, fundamentalHz: 2.00, gain: 1.0, phase: 0.0 },
  { index: 1, note: "A2", name: "A", radius: 0.075, isWound: true, fundamentalHz: 2.67, gain: 0.95, phase: 1.12 },
  { index: 2, note: "D3", name: "D", radius: 0.060, isWound: true, fundamentalHz: 3.56, gain: 0.90, phase: 2.34 },
  { index: 3, note: "G3", name: "G", radius: 0.045, isWound: false, fundamentalHz: 4.76, gain: 0.80, phase: 3.45 },
  { index: 4, note: "B3", name: "B", radius: 0.035, isWound: false, fundamentalHz: 5.99, gain: 0.70, phase: 4.56 },
  { index: 5, note: "E4", name: "High e", radius: 0.028, isWound: false, fundamentalHz: 8.00, gain: 0.60, phase: 5.67 },
];

export interface StringPhysicsState {
  energy: number; // aEnergy (0..1)
  pluckT: number; // aPluckT (seconds since pluck, < 0 if inactive)
  pluckAmp: number; // aPluckAmp (0..1)
  pluckX: number; // uPluckX (pluck point as fraction of L, default 0.15)
  damperPos: number; // uDamperPos (s along neck, < 0 if none)
  damperK: number; // uDamperK (0..1)
  loadPos: number; // uLoadPos (s along neck)
  loadK: number; // uLoadK (0..1)
  loadDepth: number; // uLoadDepth (0.35 su)
  maxAmp: number; // uMaxAmp (0.55 su)
  scaleLength: number; // uL (100.0 su)
}

/**
 * Standard GLSL smoothstep implementation in CPU
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0.0), 1.0);
  return t * t * (3.0 - 2.0 * t);
}

/**
 * Computes exact vertical string displacement at distance s and time t.
 * Matches GLSL vertex displacement formula in §3.3 bit-for-bit.
 *
 * @param stringIndex - 0 (Low E) to 5 (High e)
 * @param s - Distance along neck in scene units (0 <= s <= 100)
 * @param t - Continuous time in seconds
 * @param state - Current physics uniforms & instance attributes
 * @returns Vertical displacement in scene units
 */
export function stringY(
  stringIndex: number,
  s: number,
  t: number,
  state: Partial<StringPhysicsState> = {}
): number {
  const spec = GUITAR_STRINGS[stringIndex] || GUITAR_STRINGS[0];
  const uL = state.scaleLength ?? 100.0;
  const uMaxAmp = state.maxAmp ?? 0.55;
  const uPluckX = state.pluckX ?? 0.15;
  const uDamperPos = state.damperPos ?? -1.0;
  const uDamperK = state.damperK ?? 0.0;
  const uLoadPos = state.loadPos ?? 75.5;
  const uLoadK = state.loadK ?? 0.0;
  const uLoadDepth = state.loadDepth ?? 0.35;
  const aEnergy = state.energy ?? 0.0;
  const aPluckT = state.pluckT ?? -1.0;
  const aPluckAmp = state.pluckAmp ?? 0.0;
  const aFreq = spec.fundamentalHz;
  const aPhase = spec.phase;

  const u = Math.min(Math.max(s / uL, 0.0), 1.0);
  let y = 0.0;

  // 1) Driven standing wave (scroll energy). Weights per harmonic.
  if (aEnergy > 0.0001) {
    let driven = 0.0;
    for (let n = 1; n <= 3; n++) {
      const fn = n;
      const wn = n === 1 ? 1.0 : n === 2 ? 0.35 : 0.15;
      driven +=
        wn *
        Math.sin(Math.PI * fn * u) *
        Math.sin(2.0 * Math.PI * aFreq * fn * t + aPhase * fn);
    }
    y += driven * aEnergy;
  }

  // 2) Plucked component: decaying modes, weights ~ sin(n*pi*xp) / n^2
  if (aPluckT >= 0.0) {
    let pluck = 0.0;
    for (let n = 1; n <= 3; n++) {
      const fn = n;
      const a = Math.sin(Math.PI * fn * uPluckX) / (fn * fn);
      const w = 2.0 * Math.PI * aFreq * fn;
      const decay = Math.exp(-aPluckT * (1.6 + 0.9 * (fn - 1.0)));
      pluck += aPluckAmp * a * Math.sin(Math.PI * fn * u) * Math.sin(w * aPluckT) * decay;
    }
    y += pluck;
  }

  // 3) Damper: tags pin the string where they touch it
  if (uDamperPos >= 0.0 && uDamperK > 0.0) {
    const dd = Math.abs(s - uDamperPos);
    const ss = smoothstep(0.0, 14.0, dd);
    // GLSL: mix(1.0, ss, uDamperK)
    const factor = (1.0 - uDamperK) + ss * uDamperK;
    y *= factor;
  }

  // 4) Static load: the string sags under the tags
  if (uLoadK > 0.0) {
    const dist = (s - uLoadPos) / 2.2;
    y -= uLoadDepth * uLoadK * Math.exp(-dist * dist);
  }

  return y * uMaxAmp;
}
