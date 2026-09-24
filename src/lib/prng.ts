/**
 * Deterministic, pure pseudo-random number generator (Mulberry32).
 * Guarantees idempotent calculations within useMemo and render cycles,
 * satisfying React 19 compiler purity rules and reproducible layout physics.
 */
export function seededRandom(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
