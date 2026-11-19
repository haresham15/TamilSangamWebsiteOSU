// World layout of the art-pass station set (metres, +x right, +y up, +z toward the F1 camera).
// The coach window axis stays at the origin so guideRail.ts and the window assembly are unchanged.

/** Near platform: top at y = 0, coping edge at the track side. */
export const PLATFORM = {
  edgeZ: 0.45,
  copingDepth: 0.5,
  tactileZ: [1.05, 1.38] as const,
  farZ: 26,
  halfLength: 40,
  /** Far (island) platform beneath the board, across the tracks. */
  farEdgeZ: -5.2,
  farBackZ: -18,
  trackY: -1.15,
} as const;

/** Umbrella canopy over the near platform. Columns avoid x = 0 so the window shot stays clear. */
export const CANOPY = {
  columnX: [-22.5, -13.5, -4.5, 4.5, 13.5, 22.5] as const,
  columnZ: 5.4,
  eaveY: 5.25,
  ridgeY: 5.7,
  nearZ: 1.75,
  farZ: 9.05,
  halfLength: 26,
} as const;

/** Sodium lamps hung from the canopy on the track side. Only the inner pair are real lights. */
export const SODIUM_LAMPS = [
  { x: -10.5, lit: false },
  { x: -3.2, lit: true },
  { x: 3.2, lit: true },
  { x: 10.5, lit: false },
] as const;
export const SODIUM_LAMP_Y = 4.05;
export const SODIUM_LAMP_Z = 2.6;

/** Hall: arched trusses spanning both platforms, gable wall with the station mouth behind the board. */
export const HALL = {
  trussZ: [-14, -6.5, 2.4, 11] as const,
  halfSpan: 22,
  springY: 14,
  apexY: 26,
  gableZ: -19,
  mouthHalfWidth: 13,
  mouthSpringY: 9,
} as const;

export const COACH = {
  length: 22,
  wallFrontZ: 0.21,
  backZ: -2.9,
  wallBottomY: 0.85,
  wallTopY: 2.7,
  heroWindow: { x: 0, y: 1.65, w: 1.38, h: 0.94 },
  sideWindowX: [-5.8, -2.55, 2.55, 5.8] as const,
  sideWindow: { y: 1.65, w: 1.18, h: 0.78 },
  doorX: [-9.6, 9.6] as const,
} as const;
