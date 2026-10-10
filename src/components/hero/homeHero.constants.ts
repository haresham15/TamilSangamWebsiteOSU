/**
 * Home Hero: "Peel & Flow" Architecture Constants (§PRD Home Hero)
 * 
 * Single source of truth for:
 * 1. Pinned stage duration D (420dvh desktop, 360dvh mobile)
 * 2. Overlap layout formulas (Monolith margin-top = -100dvh, ACT3_START = 1 - 100/D_vh)
 * 3. 3-Act Scroll progression milestones
 * 4. 3D World space layout and viewport calibration
 */

import { WORLD_HV, WREATH_CY, WREATH_R_IN, WREATH_BAND_WIDTH, WREATH_GAP_RAD, WREATH_CROSS_RAD, STRAND_COUNT } from "./flowMath";
export { WREATH_CROSS_RAD };

export const HERO_D_VH = {
  desktop: 420,
  mobile: 360,
} as const;

/**
 * Calculates ACT3_START based on pinned duration D:
 * ACT3_START = 1 - 100 / D_vh (e.g. D = 420 -> 0.762, D = 360 -> 0.722)
 */
export function getAct3Start(isMobile: boolean): number {
  const d = isMobile ? HERO_D_VH.mobile : HERO_D_VH.desktop;
  return 1 - 100 / d;
}

export const HERO_TIMING = {
  // Act I: Kolam symmetry hold & ambient shimmer
  IDLE_HOLD_END: 0.04,

  // Act I -> II: Peel & Flow unravelling
  FLOW_START: 0.04,
  FLOW_END: 0.62,

  // Act II: Thirukkural Tier Reveals
  KURAL_TAMIL_START: 0.54,
  KURAL_TAMIL_END: 0.58,
  KURAL_ENG_START: 0.58,
  KURAL_ENG_END: 0.62,
  KURAL_CAPTION_START: 0.62,
  KURAL_CAPTION_END: 0.66,

  // Act II Dwell: Sacred reading pause inside formed wreath cradle
  DWELL_START: 0.66,
} as const;

/**
 * Standard Monolith negative top margin:
 * Monolith margin-top = -100dvh (always)
 */
export const MONOLITH_MARGIN_TOP_VH = -100;

export interface WreathParams {
  rIn: number;
  rOut: number;
  eps: number;
  phiGap: number;
  delta: number;
  ax: number;
  az: number;
  zTip: number;
  zBelly: number;
  kw: number;
  fOut: number;
}

export const WREATH_PARAMS_LANDSCAPE: WreathParams = {
  rIn: 2.27,
  rOut: 4.24,
  eps: 1.0,
  phiGap: 0.2443,
  delta: 0.5,
  ax: 0.22,
  az: 0.35,
  zTip: 0.40,
  zBelly: 0.50,
  kw: 0.55,
  fOut: 0.70,
};

export const WREATH_PARAMS_PORTRAIT: WreathParams = {
  rIn: 1.95,
  rOut: 3.65,
  eps: 1.45,
  phiGap: 0.2443,
  delta: 0.5,
  ax: 0.16,
  az: 0.30,
  zTip: 0.30,
  zBelly: 0.40,
  kw: 0.50,
  fOut: 0.75,
};

export {
  WORLD_HV,
  WREATH_CY,
  WREATH_R_IN,
  WREATH_BAND_WIDTH,
  WREATH_GAP_RAD,
  STRAND_COUNT,
};
