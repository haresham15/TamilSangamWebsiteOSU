/**
 * Lightweight deterministic 1D & 2D Perlin / Simplex style noise for WebGL motion & flicker.
 * Free of external library drift, runs in ~0.001ms.
 */

function fract(x: number): number {
  return x - Math.floor(x);
}

function hash11(p: number): number {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

function hash21(x: number, y: number): number {
  let p3x = fract(x * 0.1031);
  let p3y = fract(y * 0.1031);
  let p3z = fract(x * 0.1031);
  const d = p3x * (p3y + 33.33) + p3y * (p3z + 33.33) + p3z * (p3x + 33.33);
  p3x += d;
  p3y += d;
  p3z += d;
  return fract((p3x + p3y) * p3z);
}

/**
 * Smooth 1D Value Noise in [-1, 1].
 */
export function noise1D(x: number): number {
  const i = Math.floor(x);
  const f = fract(x);
  const u = f * f * (3.0 - 2.0 * f); // Smoothstep interpolation
  return (hash11(i) * (1.0 - u) + hash11(i + 1.0) * u) * 2.0 - 1.0;
}

/**
 * Smooth 2D Value Noise in [0, 1].
 */
export function noise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = fract(x);
  const fy = fract(y);

  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);

  const n00 = hash21(ix, iy);
  const n10 = hash21(ix + 1, iy);
  const n01 = hash21(ix, iy + 1);
  const n11 = hash21(ix + 1, iy + 1);

  const nx0 = n00 * (1 - ux) + n10 * ux;
  const nx1 = n01 * (1 - ux) + n11 * ux;

  return nx0 * (1 - uy) + nx1 * uy;
}
