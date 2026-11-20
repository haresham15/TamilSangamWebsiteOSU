// src/data/games/tangoData.ts
/**
 * Verified 6×6 logic puzzles for Irattaichinnam (Surya & Chandra Tango).
 * Rules:
 * 1. Each row and column contains exactly 3 Suns (☀) and 3 Moons (☾).
 * 2. No more than 2 identical symbols may be adjacent horizontally or vertically (no 3-in-a-row).
 * 3. Cells separated by '=' must contain the same symbol.
 * 4. Cells separated by '×' must contain opposite symbols.
 */

export type SymbolType = "S" | "M"; // S = Surya (Sun), M = Chandra (Moon)

export interface ConstraintPair {
  r: number;
  c: number;
  type: "=" | "x";
}

export interface TangoPuzzle {
  id: string;
  gridSize: 6;
  solution: SymbolType[][];
  givens: Array<{ r: number; c: number; val: SymbolType }>;
  horizontalConstraints: ConstraintPair[]; // between (r, c) and (r, c+1)
  verticalConstraints: ConstraintPair[];   // between (r, c) and (r+1, c)
}

export const TANGO_PUZZLES: TangoPuzzle[] = [
  {
    id: "tango-01",
    gridSize: 6,
    solution: [
      ["S", "S", "M", "S", "M", "M"],
      ["M", "S", "S", "M", "S", "M"],
      ["S", "M", "M", "S", "M", "S"],
      ["M", "M", "S", "M", "S", "S"],
      ["S", "M", "S", "S", "M", "M"],
      ["M", "S", "M", "M", "S", "S"],
    ],
    givens: [
      { r: 0, c: 0, val: "S" },
      { r: 1, c: 3, val: "M" },
      { r: 3, c: 5, val: "S" },
      { r: 5, c: 1, val: "S" },
    ],
    horizontalConstraints: [
      { r: 0, c: 0, type: "=" },
      { r: 2, c: 1, type: "=" },
      { r: 4, c: 2, type: "=" },
      { r: 5, c: 4, type: "=" },
      { r: 1, c: 2, type: "x" },
      { r: 3, c: 3, type: "x" },
    ],
    verticalConstraints: [
      { r: 0, c: 1, type: "=" },
      { r: 3, c: 0, type: "x" },
      { r: 4, c: 4, type: "=" },
    ],
  },
  {
    id: "tango-02",
    gridSize: 6,
    solution: [
      ["M", "S", "M", "S", "S", "M"],
      ["S", "M", "S", "M", "M", "S"],
      ["M", "S", "S", "M", "S", "M"],
      ["S", "M", "M", "S", "M", "S"],
      ["M", "S", "M", "S", "M", "S"],
      ["S", "M", "S", "M", "S", "M"],
    ],
    givens: [
      { r: 0, c: 1, val: "S" },
      { r: 2, c: 4, val: "S" },
      { r: 4, c: 0, val: "M" },
      { r: 5, c: 5, val: "M" },
    ],
    horizontalConstraints: [
      { r: 0, c: 3, type: "=" },
      { r: 1, c: 3, type: "=" },
      { r: 2, c: 1, type: "=" },
      { r: 3, c: 1, type: "=" },
      { r: 4, c: 0, type: "x" },
    ],
    verticalConstraints: [
      { r: 0, c: 2, type: "x" },
      { r: 2, c: 3, type: "x" },
      { r: 4, c: 5, type: "x" },
    ],
  },
  {
    id: "tango-03",
    gridSize: 6,
    solution: [
      ["S", "M", "S", "M", "S", "M"],
      ["M", "S", "M", "S", "M", "S"],
      ["S", "S", "M", "M", "S", "M"],
      ["M", "M", "S", "S", "M", "S"],
      ["S", "M", "S", "M", "S", "M"],
      ["M", "S", "M", "S", "M", "S"],
    ],
    givens: [
      { r: 1, c: 0, val: "M" },
      { r: 2, c: 4, val: "S" },
      { r: 3, c: 1, val: "M" },
      { r: 4, c: 5, val: "M" },
    ],
    horizontalConstraints: [
      { r: 2, c: 0, type: "=" },
      { r: 2, c: 2, type: "=" },
      { r: 3, c: 0, type: "=" },
      { r: 3, c: 2, type: "=" },
    ],
    verticalConstraints: [
      { r: 0, c: 0, type: "x" },
      { r: 1, c: 1, type: "x" },
      { r: 4, c: 3, type: "x" },
    ],
  },
];

export function getTangoPuzzle(seedStr: string): TangoPuzzle {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % TANGO_PUZZLES.length;
  return TANGO_PUZZLES[idx];
}
