/**
 * Missile and blast kinematics for the real-time Games beach, ported from the Blender source of truth
 * (`scripts/render-games-hybrid.py`: trail_controls/trail_point, fence dust, smoke/fire lobes, debris, shockwave).
 * Everything is a pure function of scroll progress `p`, so reverse scrolling reproduces the same frame.
 * Coordinates are three.js world metres (y up); the Python script uses the same convention before `xyz()`.
 * Random draws use a seeded PRNG in the script's draw order; values differ from Python's Mersenne Twister
 * but follow the same distributions.
 */
import { seeded } from "@/gl/art/geometry";
import { FIREBALLS } from "../gamesRail";

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export const BLAST_COUNT = 3;
/** Each missile hits an SUV; the fireball sits at the impact x from FIREBALLS (a wider spread). */
export const MISSILE_TARGET_X = [-4.06, 0.43, 4.92] as const;
export const MISSILE_TARGET_Y = 1.2;
export const MISSILE_TARGET_Z = -31;
export const MISSILE_ENTER = [0.540, 0.546, 0.552] as const;
export const MISSILE_APPROACH_POWER = 1.4;
/** Contrail opacity decay after impact: exp(-(p - hit) * 5). */
export const TRAIL_RESIDUE_RATE = 5.0;
export const TRAIL_SAMPLES = 96;
/** Contrail tube radius (m) before the radius profile and post-impact widening. */
export const TRAIL_RADIUS = 0.095;
/** Post-impact widening reaches +60% at this p. */
export const TRAIL_WIDEN_END = 0.85;
/** Blast age normalisation: age = (p - hit) / BLAST_AGE_SPAN. */
export const BLAST_AGE_SPAN = 0.2;
export const SMOKE_LOBES_PER_BLAST = 9;
/** The script has 9 fire spheres; billboards need more, smaller sprites (q0 count). */
export const FIRE_SPRITES_PER_BLAST = 22;
export const DEBRIS_PER_BLAST = 14;
export const FENCE_DUST_COUNT = 12;
/** Seconds of debris flight per unit p, and shockwave seconds per unit p. */
export const DEBRIS_TIME_SCALE = 18;
export const SHOCK_TIME_SCALE = 8;
export const GRAVITY_HALF = 4.9;
export const DEBRIS_ORIGIN_Y = 0.3;
export const DEBRIS_FLOOR_Y = 0.08;

const TAN_V = Math.tan((17 * Math.PI) / 180);
const ASPECT = 2.39;

/** Source design curves, reprojected into the locked camera (u, v in 0..1, v down). */
export const TRAIL_CONTROLS: readonly (readonly (readonly [number, number])[])[] = [
  [[0.004, 0.115], [0.108, 0.225], [0.204, 0.344], [0.301, 0.474], [0.366, 0.578], [0.425, 0.655]],
  [[0.004, 0.415], [0.108, 0.488], [0.204, 0.560], [0.300, 0.628], [0.400, 0.680], [0.508, 0.725]],
  [[0.930, 0.095], [0.839, 0.230], [0.758, 0.353], [0.677, 0.475], [0.620, 0.560], [0.591, 0.610]],
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const deCasteljau = new Float64Array(12);
const FINAL_OFFSET = TRAIL_CONTROLS.map((controls, index) => {
  const [u, v] = controls[controls.length - 1];
  return {
    x: MISSILE_TARGET_X[index] - (2 * u - 1) * 37 * TAN_V * ASPECT,
    y: MISSILE_TARGET_Y - (1.65 + (1.35 - 2 * v) * 37 * TAN_V),
    z: 0,
  };
});

/** World position of missile `index` at curve parameter t ∈ [0, 1]; t = 1 lands on (targetX, 1.2, -31). */
export function trailPoint<T extends Vec3Like>(index: number, t: number, out: T): T {
  const controls = TRAIL_CONTROLS[index];
  const n = controls.length;
  for (let i = 0; i < n; i++) {
    deCasteljau[i * 2] = controls[i][0];
    deCasteljau[i * 2 + 1] = controls[i][1];
  }
  for (let level = n - 1; level > 0; level--) {
    for (let i = 0; i < level; i++) {
      deCasteljau[i * 2] += (deCasteljau[i * 2 + 2] - deCasteljau[i * 2]) * t;
      deCasteljau[i * 2 + 1] += (deCasteljau[i * 2 + 3] - deCasteljau[i * 2 + 1]) * t;
    }
  }
  const u = deCasteljau[0];
  const v = deCasteljau[1];
  const z = -58 + 27 * t;
  const d = 6 - z;
  const offset = FINAL_OFFSET[index];
  const tt = t * t;
  out.x = (2 * u - 1) * d * TAN_V * ASPECT + offset.x * tt;
  out.y = 1.65 + (1.35 - 2 * v) * d * TAN_V + offset.y * tt;
  out.z = z;
  return out;
}

export const blastHit = (index: number) => FIREBALLS[index].hit;

/** Curve parameter of the missile head: ((p - enter) / (hit - enter))^1.4, clamped. */
export function missileApproach(p: number, index: number): number {
  const enter = MISSILE_ENTER[index];
  return clamp01((p - enter) / (blastHit(index) - enter)) ** MISSILE_APPROACH_POWER;
}

/** p at which the head passes curve parameter t (inverse of missileApproach). */
export function missilePassP(t: number, index: number): number {
  const enter = MISSILE_ENTER[index];
  return enter + (blastHit(index) - enter) * clamp01(t) ** (1 / MISSILE_APPROACH_POWER);
}

export const missileVisible = (p: number, index: number) => p >= MISSILE_ENTER[index] && p < blastHit(index);
export const trailVisible = (p: number, index: number) => p >= MISSILE_ENTER[index];

/** Contrail density multiplier; 1 until impact, then exp decay. */
export function trailResidue(p: number, index: number): number {
  return Math.exp(-Math.max(0, p - blastHit(index)) * TRAIL_RESIDUE_RATE);
}

/** Contrail widening after impact (1 → 1.6 by p = .85). */
export function trailWidthScale(p: number, index: number): number {
  const hit = blastHit(index);
  return 1 + 0.6 * clamp01((p - hit) / (TRAIL_WIDEN_END - hit));
}

/** Per-sample tube radius taper along the trail (j in 0..TRAIL_SAMPLES-1). */
export function trailRadiusProfile(j: number): number {
  return 0.12 + 0.88 * Math.sin((Math.PI * (j + 0.5)) / TRAIL_SAMPLES) ** 0.35;
}

export function blastAge(p: number, index: number): number {
  return Math.max(0, (p - blastHit(index)) / BLAST_AGE_SPAN);
}

/** Cubic ease-out growth over the first 0.3 of age. */
export function blastGrow(age: number): number {
  return 1 - (1 - Math.min(age / 0.3, 1)) ** 3;
}

export interface LobeSeed {
  ox: number;
  oy: number;
  oz: number;
  factor: number;
}

export interface DebrisSeed {
  size: Vec3Like;
  velocity: Vec3Like;
  spin: Vec3Like;
}

const uniform = (rng: () => number, a: number, b: number) => a + (b - a) * rng();

function buildBlastSeeds(index: number) {
  const rng = seeded(900 + index);
  const smoke: LobeSeed[] = [];
  for (let j = 0; j < SMOKE_LOBES_PER_BLAST; j++) {
    const ox = uniform(rng, -0.4, 0.4);
    const oz = uniform(rng, -0.3, 0.3);
    smoke.push({ ox, oy: 0.7 + j * 0.24, oz, factor: uniform(rng, 0.28, 0.53) });
  }
  const fire: LobeSeed[] = [];
  const fireLobe = (r: () => number) => {
    const ox = uniform(r, -0.45, 0.45);
    const oy = uniform(r, 0.1, 1.4);
    const oz = uniform(r, -0.35, 0.35);
    fire.push({ ox, oy, oz, factor: uniform(r, 0.25, 0.48) });
  };
  for (let j = 0; j < 9; j++) fireLobe(rng);
  const debris: DebrisSeed[] = [];
  for (let j = 0; j < DEBRIS_PER_BLAST; j++) {
    const size = { x: uniform(rng, 0.08, 0.22), y: uniform(rng, 0.08, 0.2), z: uniform(rng, 0.08, 0.26) };
    const velocity = { x: uniform(rng, -4, 4), y: uniform(rng, 4, 9), z: uniform(rng, -3, 3) };
    debris.push({ size, velocity, spin: { x: rng(), y: rng(), z: rng() } });
  }
  // Extra billboard lobes beyond the script's nine come from their own stream.
  const extra = seeded(1900 + index);
  for (let j = 9; j < FIRE_SPRITES_PER_BLAST; j++) fireLobe(extra);
  return { smoke, fire, debris };
}

export const BLAST_SEEDS = [0, 1, 2].map(buildBlastSeeds);

export interface LobeState extends Vec3Like {
  /** Radii in metres: horizontal, vertical, depth. */
  rx: number;
  ry: number;
  rz: number;
  visible: boolean;
}

export const createLobeState = (): LobeState => ({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, visible: false });

/** Smoke lobe j of blast `index` (py: rise ∝ height, grows 1 + .3·age, sits at z -32). */
export function smokeLobe(p: number, index: number, j: number, out: LobeState): LobeState {
  const { x, radius } = FIREBALLS[index];
  const s = BLAST_SEEDS[index].smoke[j];
  const age = blastAge(p, index);
  const grow = blastGrow(age);
  const rise = age * 2.6 * Math.max(0, (s.oy - 0.7) / 2.0);
  out.visible = p >= blastHit(index);
  out.x = x + s.ox * radius * grow;
  out.y = 0.4 + rise + s.oy * radius * grow;
  out.z = -32 + s.oz * radius * grow;
  const size = Math.max(0.002, radius * grow * s.factor * (1 + age * 0.3));
  out.rx = size;
  out.ry = size * 1.3;
  out.rz = size * 0.85;
  return out;
}

/** Fire lobe j (py: bloom pulse at age .35, spread ×1.4 sideways, shrinks to 16%, sits at z -30). */
export function fireLobe(p: number, index: number, j: number, out: LobeState): LobeState {
  const { x, radius } = FIREBALLS[index];
  const s = BLAST_SEEDS[index].fire[j];
  const age = blastAge(p, index);
  const grow = blastGrow(age);
  const bloom = 1 + 0.8 * Math.exp(-(((age - 0.35) / 0.3) ** 2));
  out.visible = p >= blastHit(index);
  out.x = x + s.ox * bloom * 1.4 * radius * grow;
  out.y = 0.4 + age * 0.5 + 1 + s.oy * radius * grow;
  out.z = -30 + s.oz * radius * grow;
  const size = 2 * Math.max(0.002, radius * grow * s.factor * Math.max(0.16, 1 - age * 0.45));
  out.rx = size * bloom;
  out.ry = size * 1.15;
  out.rz = size * 0.85;
  return out;
}

/** Expanding ground dust ellipsoid at the blast base (py dust_obj). */
export function groundDust(p: number, index: number, out: LobeState): LobeState {
  const age = blastAge(p, index);
  out.visible = p >= blastHit(index);
  out.x = FIREBALLS[index].x;
  out.y = 0.3;
  out.z = -31;
  out.rx = Math.max(0.01, age * 6);
  out.ry = Math.max(0.01, 0.35 + age * 0.4);
  out.rz = Math.max(0.01, age * 3.5);
  return out;
}

export const FENCE_DUST = (() => {
  const rng = seeded(9071);
  return Array.from({ length: FENCE_DUST_COUNT }, (_, j) => ({
    x: -9.5,
    y: 0.18,
    z: -34 + (j * 24) / 11,
    onset: 0.646 + j * 0.002,
    factor: uniform(rng, 0.65, 1.25),
  }));
})();
export const FENCE_DUST_SPAN = 0.154;

/** Fence-base dust puff j; returns its density (0 when hidden). */
export function fenceDust(p: number, j: number, out: LobeState): number {
  const puff = FENCE_DUST[j];
  const age = Math.max(0, (p - puff.onset) / FENCE_DUST_SPAN);
  out.visible = p >= puff.onset && age < 1;
  out.x = puff.x;
  out.y = puff.y;
  out.z = puff.z;
  out.rx = puff.factor * (0.2 + age * 2.4);
  out.ry = puff.factor * (0.16 + Math.sin(Math.min(1, age) * Math.PI) * 0.45);
  out.rz = puff.factor * (0.3 + age * 1.3);
  return out.visible ? 0.9 * Math.max(0, 1 - age) ** 1.3 : 0;
}

export interface ShockState {
  visible: boolean;
  seconds: number;
  /** Torus major radius (m); the tube is 0.25 × radius wide. */
  radius: number;
  /** Tube half-height (m). */
  halfHeight: number;
}

export const createShockState = (): ShockState => ({ visible: false, seconds: 0, radius: 0, halfHeight: 0 });

/** Ground shockwave torus at (x, .15, -31): radius 9 m per second, flattening as it spreads. */
export function shockwave(p: number, index: number, out: ShockState): ShockState {
  const seconds = Math.max(0, (p - blastHit(index)) * SHOCK_TIME_SCALE);
  out.visible = p >= blastHit(index);
  out.seconds = seconds;
  out.radius = Math.max(0.01, seconds * 9);
  out.halfHeight = 0.25 * Math.max(0.05, 0.6 / (1 + seconds * 3));
  return out;
}

/** Time for a fragment launched from y .3 at vy to fall to .08. */
export function debrisLanding(vy: number): number {
  const drop = DEBRIS_ORIGIN_Y - DEBRIS_FLOOR_Y;
  return (vy + Math.sqrt(vy * vy + 4 * GRAVITY_HALF * drop)) / (2 * GRAVITY_HALF);
}

/** Ballistic fragment j of blast `index`: writes position and Euler rotation; returns flight seconds. */
export function debrisState(p: number, index: number, j: number, position: Vec3Like, rotation: Vec3Like): number {
  const seed = BLAST_SEEDS[index].debris[j];
  const seconds = Math.max(0, (p - blastHit(index)) * DEBRIS_TIME_SCALE);
  const flight = Math.min(seconds, debrisLanding(seed.velocity.y));
  position.x = FIREBALLS[index].x + seed.velocity.x * flight;
  position.y = Math.max(DEBRIS_FLOOR_Y, DEBRIS_ORIGIN_Y + seed.velocity.y * flight - GRAVITY_HALF * flight * flight);
  position.z = -31 + seed.velocity.z * flight;
  rotation.x = seed.spin.x * flight * 7;
  rotation.y = seed.spin.y * flight * 7;
  rotation.z = seed.spin.z * flight * 7;
  return flight;
}
