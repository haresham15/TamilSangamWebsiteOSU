/**
 * Fretboard Highway - 12-TET Fret & Neck Kinematics
 *
 * True equal temperament (12-TET) fret math on a 24-fret neck:
 * s_n = L * (1 - 2^(-n/12))
 * Units: Scene Units (su). World coordinate z = -s.
 */

export const SCALE_LENGTH = 100.0; // su (L)
export const TOTAL_FRETS = 24;
export const MAX_JOURNEY_S = 75.0; // Fret 24 sits at L * (1 - 2^(-24/12)) = 75.0 su

export interface FretData {
  fretNumber: number; // 1 to 24
  s: number;          // distance from nut in su (0 < s <= 75.0)
  z: number;          // world z position (-s)
  progress: number;   // normalized journey fraction s / 75.0
  width: number;      // neck width at this fret
  isLandmark: boolean;
  landmarkType?: "single" | "double" | "era-boundary";
}

export interface InlayData {
  fretNumber: number; // target fret (e.g. 3, 5, 7, 9, 12, 15, 17, 19, 21, 24)
  s: number;          // midpoint between fret n-1 and fret n
  z: number;          // world z position (-s)
  xOffsets: number[]; // [0] for single, [-spacing, +spacing] for double
  isDouble: boolean;
}

/**
 * Returns exact distance from nut in su for fret n
 */
export function getFretS(n: number, L = SCALE_LENGTH): number {
  return L * (1.0 - Math.pow(2.0, -n / 12.0));
}

/**
 * Neck width W(s) tapering from 6.0 at nut to 7.3 at fret 24
 */
export function getNeckWidth(s: number): number {
  return 6.0 + 1.3 * (s / 75.0);
}

/**
 * String spacing at distance s along the neck
 */
export function getStringSpacing(s: number): number {
  return 0.9 + 0.2 * (s / 75.0);
}

/**
 * String height above fretboard surface
 */
export function getStringHeight(s: number): number {
  return 0.12 + 0.0045 * s;
}

/**
 * Camera travel along neck: linear in s (0 to 75 su)
 */
export function getCameraS(progress: number): number {
  return MAX_JOURNEY_S * Math.min(Math.max(progress, 0.0), 1.0);
}

/**
 * Compute all 24 frets with exact geometry data
 */
export function computeAllFrets(L = SCALE_LENGTH): FretData[] {
  const frets: FretData[] = [];
  for (let n = 1; n <= TOTAL_FRETS; n++) {
    const s = getFretS(n, L);
    const progress = s / MAX_JOURNEY_S;
    const width = getNeckWidth(s);
    const isEra2Start = n === 5;
    const isEra3Start = n === 12;
    const isDoubleDot = n === 12 || n === 24;
    const isSingleDot = [3, 5, 7, 9, 15, 17, 19, 21].includes(n);

    frets.push({
      fretNumber: n,
      s,
      z: -s,
      progress,
      width,
      isLandmark: isSingleDot || isDoubleDot,
      landmarkType: isDoubleDot
        ? "double"
        : isEra2Start || isEra3Start
        ? "era-boundary"
        : isSingleDot
        ? "single"
        : undefined,
    });
  }
  return frets;
}

/**
 * Compute mother-of-pearl fretboard inlays
 * Discs sit at midpoints between fret n-1 and fret n
 */
export function computeAllInlays(L = SCALE_LENGTH): InlayData[] {
  const inlays: InlayData[] = [];
  const dotFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

  for (const n of dotFrets) {
    const sPrev = n === 1 ? 0.0 : getFretS(n - 1, L);
    const sCurr = getFretS(n, L);
    const sMid = (sPrev + sCurr) / 2.0;
    const spacing = getStringSpacing(sMid);

    if (n === 12 || n === 24) {
      inlays.push({
        fretNumber: n,
        s: sMid,
        z: -sMid,
        xOffsets: [-spacing * 1.05, spacing * 1.05],
        isDouble: true,
      });
    } else {
      inlays.push({
        fretNumber: n,
        s: sMid,
        z: -sMid,
        xOffsets: [0.0],
        isDouble: false,
      });
    }
  }

  return inlays;
}
