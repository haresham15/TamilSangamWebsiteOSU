// src/gallery/ramp.ts
/**
 * Kinematic Scroll Speed Ramp Solver for Era 2 (PRD v2 §5.2)
 *
 * Reconciles fret landmarks (Fret 5 at p = 0.3345, Fret 12 at p = 0.6667)
 * with the dramatic deceleration for the Rose Contact event at p = 0.52 (x_c = 0.558).
 *
 * Solves peak velocity P numerically via bisection such that mean(v) = 1.0,
 * guaranteeing continuous boundary speeds (1.0) and exact fret distance preservation.
 */

const sm = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export interface Ramp {
  upEnd: number;     // end of acceleration ramp
  contact: number;   // rose contact coordinate (x_c = 0.558)
  brake: number;     // brake lead-in duration (0.06 in local x ~= 0.02 in scroll p)
  crawl: number;     // crawl speed during contact (0.18)
  crawlEnd: number;  // end of crawl hold (0.72)
}

export const RAMP: Ramp = {
  upEnd: 0.30,
  contact: 0.558,
  brake: 0.06,
  crawl: 0.18,
  crawlEnd: 0.72,
};

// Era 2 scroll progress boundaries
export const ERA2_P0 = 0.3345;
export const ERA2_P1 = 0.6667;
export const ERA2_DELTA_P = ERA2_P1 - ERA2_P0; // 0.3322

/**
 * Instantaneous velocity profile v(x) normalized to baseline speed = 1.0
 */
export const v = (x: number, P: number, q: Ramp = RAMP): number => {
  if (x < q.upEnd) {
    return 1 + (P - 1) * sm(0, q.upEnd, x);
  }
  if (x < q.contact - q.brake) {
    return P;
  }
  if (x < q.contact) {
    return P + (q.crawl - P) * sm(q.contact - q.brake, q.contact, x);
  }
  if (x < q.crawlEnd) {
    return q.crawl;
  }
  return q.crawl + (1 - q.crawl) * sm(q.crawlEnd, 1, x);
};

/**
 * Computes mean speed over local domain [0, 1] for a candidate peak P
 */
export const meanSpeed = (P: number, q: Ramp = RAMP, n = 2048): number => {
  let s = 0;
  for (let i = 0; i < n; i++) {
    s += v((i + 0.5) / n, P, q) / n;
  }
  return s;
};

/**
 * Solves peak velocity P via bisection such that meanSpeed(P) == 1.0
 */
export function solvePeak(q: Ramp = RAMP): number {
  let lo = 1.0;
  let hi = 3.0;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (meanSpeed(m, q) < 1.0) {
      lo = m;
    } else {
      hi = m;
    }
  }
  return (lo + hi) / 2;
}

export interface RampInstance {
  P: number;
  disp: (x: number) => number;
  speed: (x: number) => number;
}

/**
 * Precomputes cumulative displacement F(x) table with linear interpolation
 */
export function makeRamp(q: Ramp = RAMP, N = 1024): RampInstance {
  const P = solvePeak(q);
  const F = new Float32Array(N + 1);
  for (let i = 1; i <= N; i++) {
    F[i] = F[i - 1] + v((i - 0.5) / N, P, q) / N;
  }
  const norm = F[N];

  const disp = (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const t = x * N;
    const i = Math.floor(t);
    const f = t - i;
    const f0 = F[i];
    const f1 = F[Math.min(i + 1, N)];
    return (f0 * (1 - f) + f1 * f) / norm;
  };

  return {
    P,
    disp,
    speed: (x: number) => v(Math.min(1, Math.max(0, x)), P, q),
  };
}

// Global cached ramp instance
export const defaultRamp = makeRamp();

/**
 * Calculates camera distance along neck in scene units (su)
 * Supports reduced-motion fallback (strict linear mapping).
 */
export function calculateCameraS(
  progress: number,
  options: {
    reducedMotion?: boolean;
    fret5S?: number;
    fret12S?: number;
    maxS?: number;
  } = {}
): { s: number; speed: number } {
  const p = Math.min(Math.max(progress, 0.0), 1.0);
  const maxS = options.maxS ?? 75.0; // Fret 24
  const s0 = options.fret5S ?? 25.0846; // Fret 5 (100 * (1 - 2^(-5/12)))
  const s1 = options.fret12S ?? 50.0;    // Fret 12 (100 * (1 - 2^(-12/12)))

  if (options.reducedMotion) {
    return { s: p * maxS, speed: 1.0 };
  }

  // Era 1 (Nut to Fret 5)
  if (p < ERA2_P0) {
    const fraction = p / ERA2_P0;
    return { s: fraction * s0, speed: 1.0 };
  }

  // Era 2 (Fret 5 to Fret 12 with speed ramp)
  if (p <= ERA2_P1) {
    const x = (p - ERA2_P0) / ERA2_DELTA_P;
    const dispVal = defaultRamp.disp(x);
    const speedVal = defaultRamp.speed(x);
    return {
      s: s0 + (s1 - s0) * dispVal,
      speed: speedVal,
    };
  }

  // Era 3 (Fret 12 to Fret 24)
  const fraction = (p - ERA2_P1) / (1.0 - ERA2_P1);
  return { s: s1 + (maxS - s1) * fraction, speed: 1.0 };
}
