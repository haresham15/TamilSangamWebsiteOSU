// src/components/games-hero/beach/beachLayout.ts
/**
 * Beach compound layout, ported from the offline Blender scene (scripts/render-games-hybrid.py,
 * the source of truth for the Games hero plates and posters). Pure data: no three.js imports,
 * so tests and node scripts can read it directly.
 *
 * Units are metres in three.js world space (Y up, camera locked at (0, 1.65, 6) looking down −Z).
 * The Python `xyz()` helper only swaps axes for Blender, so its tuples are already three.js
 * coordinates and are copied here unchanged. Box sizes are full extents [x, y, z].
 */

export type Vec3 = readonly [number, number, number];
export type RGB = readonly [number, number, number];

// --- Light and sky (py:240-252) -------------------------------------------------------------

/** Sun light position; the light shines from here toward the origin. */
export const SUN_POSITION: Vec3 = [12, 24, 14];
/** Blender sun strength. Blender renders a facing white diffuse surface at 1.0 per unit; three's
 *  Lambert divides by π, so the three.js DirectionalLight intensity is SUN_STRENGTH × π. */
export const SUN_STRENGTH = 2.5;
/** Nishita sky sun (radians). It sits up and to the left of the view, so the sky glows on the left. */
export const SKY_SUN = { elevation: 0.68, rotation: -1.0 } as const;
/** Plate view transform: Blender AgX at −0.7 EV. */
export const VIEW_EXPOSURE_EV = -0.7;

// --- Ground and sea (py:288-290) --------------------------------------------------------------

export const GROUND = { center: [0, -0.18, -40] as Vec3, size: [280, 0.35, 240] as Vec3 } as const;
export const OCEAN = { center: [-140, -0.06, -180] as Vec3, size: [220, 0.12, 160] as Vec3 } as const;
/** Top surface heights derived from the boxes above. */
export const GROUND_TOP = GROUND.center[1] + GROUND.size[1] / 2;
export const OCEAN_TOP = OCEAN.center[1] + OCEAN.size[1] / 2;

// --- Compound wall and breaches (py:291-299) ------------------------------------------------

export const WALL = {
  z: -35,
  height: 2.45,
  depth: 0.75,
  bevel: 0.06,
  /** Centre x and width of each standing segment. */
  segments: [
    { x: -6.29, width: 6.42 },
    { x: 0.48, width: 3.92 },
    { x: 24.52, width: 40.96 },
  ],
} as const;

/** Breach centres (the gaps between wall segments). Missiles target the SUVs in front of them. */
export const BREACH_XS = [-2.28, 3.24] as const;

/** Broken masonry stacked up each breach edge: 9 stones per side. */
export const BREACH_MASONRY = {
  perSide: 9,
  offset: 0.78,
  offsetJitter: [-0.12, 0.07] as const,
  y0: 0.2,
  step: 0.24,
  size: [0.35, 0.18, 0.8] as Vec3,
  bevel: 0.025,
  /** ± roll (radians) about z. */
  roll: 0.14,
} as const;

/** Contact rubble around each breach: 22 pieces. */
export const BREACH_RUBBLE = {
  count: 22,
  spreadX: 1.5,
  z: -34,
  spreadZ: 1.8,
  y: 0.08,
  width: [0.12, 0.38] as const,
  height: 0.15,
  depth: 0.24,
  bevel: 0.02,
} as const;

// --- Left retaining wall and iron fence (py:300-308) ----------------------------------------

export const RETAINING_WALL = {
  center: [-24.8, 0.55, -35] as Vec3,
  size: [30.6, 1.1, 0.8] as Vec3,
  bevel: 0.05,
  coping: { center: [-24.8, 1.13, -35] as Vec3, size: [30.6, 0.12, 0.98] as Vec3, bevel: 0.025 },
} as const;

export const FENCE = {
  z: -35,
  /** One picket per metre, x = -40 … -9 (Python range(-40, -8); picketTo is exclusive). */
  picketFrom: -40,
  picketTo: -8,
  picketY: [1.1, 3.1] as const,
  picketRadius: 0.022,
  rails: { ys: [1.4, 2.7] as const, from: -40, to: -9, radius: 0.035 },
  piers: {
    xs: [-38, -31, -24, -17, -10] as const,
    y: 1.27,
    size: [0.32, 2.54, 0.46] as Vec3,
    bevel: 0.035,
    coping: { y: 2.57, size: [0.44, 0.12, 0.56] as Vec3, bevel: 0.025 },
  },
} as const;

export function fencePicketXs(): number[] {
  const xs: number[] = [];
  for (let x = FENCE.picketFrom; x < FENCE.picketTo; x++) xs.push(x);
  return xs;
}

// --- SUVs (py:311-332) ------------------------------------------------------------------------

/** Three unbranded SUVs parked nose-to-camera in front of the wall; they are the missile targets. */
export const SUV_XS = [-4.06, 0.43, 4.92] as const;
export const SUV_Z = -31;
/** Missile impact point on each SUV (missilePath endpoint). */
export const SUV_TARGET_Y = 1.2;

/** Offline SUV parts, relative to (x, 0, z). Front faces +z (toward the camera). */
export const SUV = {
  body: { center: [0, 0.93, 0] as Vec3, size: [2.18, 0.78, 4.3] as Vec3, bevel: 0.18 },
  bonnet: { center: [0, 1.2, 1.22] as Vec3, size: [2.1, 0.23, 1.55] as Vec3, bevel: 0.1 },
  cabin: { center: [0, 1.71, -0.3] as Vec3, size: [1.88, 0.85, 2.4] as Vec3, bevel: 0.16 },
  windscreen: { center: [0, 1.77, 0.92] as Vec3, size: [1.63, 0.54, 0.035] as Vec3 },
  sideGlass: { x: 0.95, y: 1.76, z: -0.2, size: [0.025, 0.52, 1.85] as Vec3 },
  mirror: { x: 1.15, y: 1.59, z: 0.65, size: [0.25, 0.16, 0.28] as Vec3 },
  wheel: { x: 1.03, y: 0.47, zs: [-1.3, 1.3] as const, majorRadius: 0.34, minorRadius: 0.13 },
  hub: { x: 1.16, radius: 0.24 },
  headlamp: { x: 0.73, y: 1.02, z: 2.16, size: [0.4, 0.2, 0.04] as Vec3 },
  bumper: { center: [0, 0.63, 2.2] as Vec3, size: [2.25, 0.2, 0.2] as Vec3 },
  grille: { x0: -0.5, step: 0.14, bars: 8, y: 0.95, z: 2.18, size: [0.055, 0.22, 0.03] as Vec3 },
  roofRails: { x: 0.7, y: 2.19, z: [-1.2, 0.65] as const, radius: 0.035 },
} as const;

// --- Palms (py:335-367) -----------------------------------------------------------------------

/** Curved coconut palms: base (x, z), crown height and the offline seed. */
export const PALMS = [
  { x: -7.3, z: -38, height: 7.9, seed: 1 },
  { x: 9, z: -40, height: 8.4, seed: 2 },
  { x: 15, z: -42, height: 7.5, seed: 3 },
  { x: 18, z: -46, height: 9, seed: 4 },
  { x: -14, z: -50, height: 6.8, seed: 5 },
] as const;

export const PALM_TRUNK = {
  /** Trunk polyline offsets from the base, as fractions of height for y. */
  mid: { dx: -0.25, yFrac: 0.5, dz: 0.1 },
  top: { dx: 0.1, dz: 0 },
  radius: 0.14,
} as const;

export const PALM_FROND = {
  count: 15,
  angleJitter: 0.12,
  extent: [1.8, 3.0] as const,
  /** Rachis samples (py: 25) and leaflet pairs per frond (py: 23). */
  samples: 25,
  leaflets: 23,
  arch: 0.55,
  droop: 1.4,
  spread: 0.52,
  spreadJitter: [0.8, 1.2] as const,
  leafletDrop: [0.2, 0.34] as const,
  bendLift: 0.035,
  leafletHalfWidth: 0.035,
  rachisRadius: 0.018,
} as const;

// --- Garden props (py:368-373) ----------------------------------------------------------------

export const FOUNTAIN = {
  x: 12.1,
  z: -19.7,
  plinth: { y: 0.4, size: [1.5, 0.8, 1.5] as Vec3, bevel: 0.08 },
  /** Carved stone discs: height and horizontal radius; each is 0.18 m tall (sphere scale y). */
  stones: [
    { y: 0.95, r: 0.85 },
    { y: 1.5, r: 0.32 },
    { y: 2, r: 0.65 },
    { y: 2.4, r: 0.15 },
  ],
  stoneHalfHeight: 0.18,
} as const;

export const PARASOL = {
  x: 14,
  z: -20,
  poleHeight: 3,
  poleRadius: 0.055,
  canopy: { y: 3, radius: 1.6, depth: 0.6, segments: 32 },
} as const;

// --- Fence-base dust onsets (py:491-496, consumed by BlastFX) ---------------------------------

export const FENCE_DUST = {
  x: -9.5,
  y: 0.18,
  z0: -34,
  span: 24,
  count: 12,
  onset0: 0.646,
  onsetStep: 0.002,
  life: 0.154,
  seed: 9071,
} as const;

export function fenceDustOnset(index: number) {
  return FENCE_DUST.onset0 + index * FENCE_DUST.onsetStep;
}

// --- Palette: Blender Principled values (linear RGB, roughness, metallic) (py:279-373) --------

export interface PaletteEntry {
  color: RGB;
  roughness: number;
  metalness: number;
}

export const PALETTE = {
  ironRubber: { color: [0.018, 0.023, 0.02], roughness: 0.9, metalness: 0 },
  olive: { color: [0.058, 0.071, 0.052], roughness: 0.36, metalness: 0.55 },
  glass: { color: [0.04, 0.065, 0.075], roughness: 0.15, metalness: 0.45 },
  chrome: { color: [0.35, 0.37, 0.36], roughness: 0.24, metalness: 0.9 },
  limestone: { color: [0.6, 0.56, 0.43], roughness: 0.8, metalness: 0 },
  frond: { color: [0.055, 0.12, 0.036], roughness: 0.64, metalness: 0 },
  bark: { color: [0.15, 0.1, 0.055], roughness: 0.9, metalness: 0 },
  ocean: { color: [0.08, 0.27, 0.34], roughness: 0.18, metalness: 0.15 },
  canvas: { color: [0.72, 0.65, 0.5], roughness: 0.92, metalness: 0 },
} as const satisfies Record<string, PaletteEntry>;
