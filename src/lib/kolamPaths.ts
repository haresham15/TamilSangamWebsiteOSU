/**
 * Parametric Kolam Math & SVG Path Generators
 * 
 * Provides mathematically grounded, authentic cubic Bézier curves for:
 * 1. The Events Winding River (viewBox: 0 0 1200 2400)
 * 2. Traditional 3x3 Pulli (Dot Grid) Sikku Kolam loop ornaments
 * 3. Traditional 5x5 Pulli Kolam star & petal geometries
 * 4. Architectural corner ornaments with traditional Kolam knotwork
 */

export const KOLAM_RIVER_VIEWBOX = "0 0 1200 2400";

/**
 * Pre-computed high-fidelity cubic Bezier path for The Gatherings River.
 * Coordinates are mapped to a 1200 x 2400 viewBox, starting at (600, 0)
 * and undulating with organic, fluid Kolam-river kinematics down to (600, 2400).
 */
export const KOLAM_RIVER_PATH = 
  "M 600 0 " +
  "C 220 200, 140 450, 360 700 " +
  "C 580 950, 1080 1100, 880 1350 " +
  "C 680 1600, 120 1760, 320 2020 " +
  "C 500 2240, 1020 2220, 600 2400";

/**
 * Secondary braided harmonic stream flowing parallel to the primary river.
 */
export const KOLAM_RIVER_BRAID_PATH =
  "M 600 0 " +
  "C 980 200, 1060 450, 840 700 " +
  "C 620 950, 120 1100, 320 1350 " +
  "C 520 1600, 1080 1760, 880 2020 " +
  "C 700 2240, 180 2220, 600 2400";

/**
 * Parametric generator for a custom-dimensioned winding Kolam river path.
 */
export function generateKolamRiverPath(
  width = 1200,
  height = 2400,
  waves = 4,
  amplitude = 380
): string {
  const midX = width / 2;
  const stepY = height / waves;
  let d = `M ${midX} 0`;

  for (let i = 0; i < waves; i++) {
    const yStart = i * stepY;
    const yEnd = (i + 1) * stepY;
    const dir = i % 2 === 0 ? -1 : 1;
    const cp1x = midX + dir * amplitude;
    const cp1y = yStart + stepY * 0.35;
    const cp2x = midX + dir * (amplitude * 0.8);
    const cp2y = yStart + stepY * 0.75;
    const endX = i === waves - 1 ? midX : midX + (dir * amplitude * 0.15);
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${endX.toFixed(1)} ${yEnd.toFixed(1)}`;
  }

  return d;
}

/**
 * Traditional 3x3 Pulli (Dot) Sikku Kolam (viewBox: 0 0 100 100).
 * Continuous closed loop weaving around 9 grid dots.
 */
export const PULLI_DOTS_3X3 = [
  { x: 25, y: 25 }, { x: 50, y: 25 }, { x: 75, y: 25 },
  { x: 25, y: 50 }, { x: 50, y: 50 }, { x: 75, y: 50 },
  { x: 25, y: 75 }, { x: 50, y: 75 }, { x: 75, y: 75 },
];

export const PULLI_KOLAM_3X3_PATH = 
  "M 50 10 " +
  "C 70 10, 90 30, 90 50 " +
  "C 90 70, 70 90, 50 90 " +
  "C 30 90, 10 70, 10 50 " +
  "C 10 30, 30 10, 50 10 Z " +
  "M 50 20 " +
  "C 35 20, 20 35, 20 50 " +
  "C 20 65, 35 80, 50 80 " +
  "C 65 80, 80 65, 80 50 " +
  "C 80 35, 65 20, 50 20 Z " +
  "M 25 25 Q 50 50 75 25 Q 50 50 75 75 Q 50 50 25 75 Q 50 50 25 25";

/**
 * Traditional 5x5 Pulli Kolam (viewBox: 0 0 200 200).
 * Four-fold rotational symmetry Sikku knot weaving around 25 grid dots.
 */
export const PULLI_DOTS_5X5 = (() => {
  const dots: { x: number; y: number }[] = [];
  const coords = [30, 65, 100, 135, 170];
  for (const y of coords) {
    for (const x of coords) {
      dots.push({ x, y });
    }
  }
  return dots;
})();

export const PULLI_KOLAM_5X5_PATH =
  "M 100 20 " +
  "C 140 20, 180 60, 180 100 " +
  "C 180 140, 140 180, 100 180 " +
  "C 60 180, 20 140, 20 100 " +
  "C 20 60, 60 20, 100 20 Z " +
  "M 100 40 " +
  "C 120 60, 140 80, 160 100 " +
  "C 140 120, 120 140, 100 160 " +
  "C 80 140, 60 120, 40 100 " +
  "C 60 80, 80 60, 100 40 Z " +
  "M 65 65 C 100 80, 100 80, 135 65 C 120 100, 120 100, 135 135 C 100 120, 100 120, 65 135 C 80 100, 80 100, 65 65 Z";

/**
 * Specimen corner ornaments (viewBox: 0 0 40 40).
 * Top-left corner knot bracket with registration lines and traditional petal flare.
 */
export const KOLAM_CORNER_TL = 
  "M 0 18 L 0 0 L 18 0 " +
  "M 0 0 L 10 10 " +
  "M 4 14 C 8 8, 14 8, 14 4";

export const KOLAM_CORNER_TR = 
  "M 22 0 L 40 0 L 40 18 " +
  "M 40 0 L 30 10 " +
  "M 36 14 C 32 8, 26 8, 26 4";

export const KOLAM_CORNER_BL = 
  "M 0 22 L 0 40 L 18 40 " +
  "M 0 40 L 10 30 " +
  "M 4 26 C 8 32, 14 32, 14 36";

export const KOLAM_CORNER_BR = 
  "M 40 22 L 40 40 L 22 40 " +
  "M 40 40 L 30 30 " +
  "M 36 26 C 32 32, 26 32, 26 36";
