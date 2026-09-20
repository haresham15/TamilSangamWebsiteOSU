// Kolam Mathematical Geometry, Symmetry Transformations, and Knot Generation

export interface Point {
  x: number;
  y: number;
}

export interface KolamDot {
  id: string;
  x: number;
  y: number;
  row: number;
  col: number;
}

export interface KolamStroke {
  points: Point[];
  color: string;
  width: number;
}

// 1. Generate Square or Diamond Dot Lattice
export function generateSquareLattice(size: number, spacing: number, originX: number, originY: number): KolamDot[] {
  const dots: KolamDot[] = [];
  const offset = ((size - 1) * spacing) / 2;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      dots.push({
        id: `dot-${r}-${c}`,
        row: r,
        col: c,
        x: originX - offset + c * spacing,
        y: originY - offset + r * spacing,
      });
    }
  }
  return dots;
}

// 2. Generate Diamond (Idukku Pulli) Lattice (e.g., 7 to 1 dots)
export function generateDiamondLattice(centerCount: number, spacing: number, originX: number, originY: number): KolamDot[] {
  const dots: KolamDot[] = [];
  const steps = Math.floor(centerCount / 2);

  let idCounter = 0;
  for (let r = -steps; r <= steps; r++) {
    const rowDots = centerCount - Math.abs(r) * 2;
    const y = originY + r * spacing;
    const rowOffset = ((rowDots - 1) * spacing) / 2;

    for (let c = 0; c < rowDots; c++) {
      const x = originX - rowOffset + c * spacing;
      dots.push({
        id: `d-dot-${idCounter++}`,
        row: r + steps,
        col: c,
        x,
        y,
      });
    }
  }
  return dots;
}

// 3. Apply Radial Symmetry (4-fold and 8-fold)
export function applySymmetry(
  points: Point[],
  centerX: number,
  centerY: number,
  folds: 1 | 2 | 4 | 8
): Point[][] {
  if (folds === 1) return [points];

  const results: Point[][] = [];
  const angles = folds === 2 ? [0, Math.PI] : folds === 4 ? [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2] : [
    0,
    Math.PI / 4,
    Math.PI / 2,
    (3 * Math.PI) / 4,
    Math.PI,
    (5 * Math.PI) / 4,
    (3 * Math.PI) / 2,
    (7 * Math.PI) / 4,
  ];

  for (const theta of angles) {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    const rotated = points.map((p) => {
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      return {
        x: centerX + (dx * cos - dy * sin),
        y: centerY + (dx * sin + dy * cos),
      };
    });

    results.push(rotated);
  }

  return results;
}

// 4. Procedural Knot Generator Seeded From a Name
export function generateProceduralKolam(name: string, centerX: number, centerY: number, radius: number): Point[][] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash) || 42;

  const folds: 4 | 8 = seed % 2 === 0 ? 8 : 4;
  const petals = (seed % 4) + 3;
  const basePoints: Point[] = [];

  const stepCount = 24;
  for (let i = 0; i <= stepCount; i++) {
    const t = (i / stepCount) * (Math.PI / (folds / 2));
    // Parametric looped curve around dots (Chikku / Sikku kolam loop style)
    const r = radius * (0.35 + 0.45 * Math.sin(t * petals) + 0.2 * Math.cos(t * 2));
    const x = centerX + r * Math.cos(t);
    const y = centerY + r * Math.sin(t);
    basePoints.push({ x, y });
  }

  return applySymmetry(basePoints, centerX, centerY, folds);
}
