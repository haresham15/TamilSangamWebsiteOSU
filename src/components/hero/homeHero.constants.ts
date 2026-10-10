/**
 * Home Hero v3: "The Wreath Split" Architecture Constants
 * Single source of truth for all scroll dimensions, timing thresholds,
 * and layout overlap formulas (§PRD 5.3).
 */

export const HERO_D_VH = {
  desktop: 300,
  mobile: 260,
} as const;

export const HERO_TIMING = {
  // Act I: Emblem Hold & Kolam Pulse
  ACT1_HOLD_END: 0.08,

  // Act II: Wreath Unzip & Thirukkural Reveal
  ACT2_START: 0.08,
  ACT2_END: 0.50,
  ACT2_SPAN: 0.42, // (0.50 - 0.08)

  // Act II: Thirukkural Tier Reveals (relative to local q in [0, 1])
  KURAL_TIER1_START: 0.55,
  KURAL_TIER1_END: 0.70,
  KURAL_TIER2_START: 0.70,
  KURAL_TIER2_END: 0.85,
  KURAL_TIER3_START: 0.85,
  KURAL_TIER3_END: 1.00,

  // Emblem Exit (relative to local q in [0, 1])
  EMBLEM_EXIT_END: 0.60,

  // Act II Dwell: Reading pause with wreath formed
  ACT2_DWELL_END: 0.62,

  // Act III: Monolith Slate 1:1 Curtain Rise
  ACT3_START: 0.62,
  ACT3_COVER_COMPLETE: 0.953,
  ACT3_SETTLE: 1.00,
} as const;

/**
 * Calculates the exact negative top margin for the Monolith section.
 * Natural 1:1 scroll moves the Monolith top edge into the viewport bottom
 * at p = ACT3_START (0.62), fully covering the pinned 100dvh stage at p = 0.953.
 * Formula: margin-top = -(1 - ACT3_START) * D
 */
export function getMonolithMarginVh(isMobile: boolean): number {
  const d = isMobile ? HERO_D_VH.mobile : HERO_D_VH.desktop;
  return -((1 - HERO_TIMING.ACT3_START) * d); // -(1 - 0.62) * 300 = -114dvh
}

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
  rIn: 2.27,      // 0.30 * Hv (Hv approx 7.57 at dist 12, FOV 35)
  rOut: 4.24,     // 0.56 * Hv
  eps: 1.0,       // circular in landscape
  phiGap: 0.2443, // 14 deg gap at top (radians)
  delta: 0.5,     // zipper top-to-bottom stagger spread
  ax: 0.22,       // mid-pose X push
  az: 0.35,       // mid-pose Z push
  zTip: 0.40,     // tips curl toward camera (+Z)
  zBelly: 0.50,   // belly bows back (-Z)
  kw: 0.55,       // tube radius compression factor
  fOut: 0.70,     // outer line fade factor
};

export const WREATH_PARAMS_PORTRAIT: WreathParams = {
  rIn: 1.95,
  rOut: 3.65,
  eps: 1.45,      // elliptical extension for tall mobile screens
  phiGap: 0.2443,
  delta: 0.5,
  ax: 0.16,
  az: 0.30,
  zTip: 0.30,
  zBelly: 0.40,
  kw: 0.50,
  fOut: 0.75,
};
