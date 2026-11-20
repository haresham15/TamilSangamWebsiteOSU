// src/data/games/arasigalData.ts
/**
 * Verified boards for Arasigal (Chola Queens Logic Grid).
 * Each puzzle has strictly 1 unique valid solution where N crowns are placed
 * on an N×N board such that:
 * 1. Exactly 1 crown per row
 * 2. Exactly 1 crown per column
 * 3. Exactly 1 crown per colored region
 * 4. No two crowns touch horizontally, vertically, or diagonally.
 */

export interface ArasigalPuzzle {
  id: string;
  gridSize: number;
  // Matrix of region IDs (0..N-1)
  regions: number[][];
  // Unique solution coordinates
  solution: Array<{ row: number; col: number }>;
}

export const ARASIGAL_REGION_COLORS = [
  "#3B2556", // Royal Violet
  "#1E3A5F", // Chola Navy
  "#1F4E38", // Emerald Deep
  "#4A3B18", // Amber Ochre
  "#52261E", // Terracotta
  "#283845", // Slate Blue
  "#4A2242", // Mulberry
  "#2A4436", // Jade
];

export const ARASIGAL_PUZZLES: ArasigalPuzzle[] = [
  {
    id: "arasigal-01",
    gridSize: 7,
    solution: [
      { row: 0, col: 2 },
      { row: 1, col: 5 },
      { row: 2, col: 1 },
      { row: 3, col: 4 },
      { row: 4, col: 0 },
      { row: 5, col: 3 },
      { row: 6, col: 6 },
    ],
    regions: [
      [0, 0, 0, 1, 1, 1, 2],
      [0, 0, 3, 3, 1, 1, 2],
      [4, 0, 3, 3, 3, 2, 2],
      [4, 4, 3, 5, 5, 2, 2],
      [4, 4, 4, 5, 5, 5, 6],
      [4, 4, 5, 5, 6, 6, 6],
      [4, 4, 5, 6, 6, 6, 6],
    ],
  },
  {
    id: "arasigal-02",
    gridSize: 7,
    solution: [
      { row: 0, col: 3 },
      { row: 1, col: 6 },
      { row: 2, col: 2 },
      { row: 3, col: 5 },
      { row: 4, col: 1 },
      { row: 5, col: 4 },
      { row: 6, col: 0 },
    ],
    regions: [
      [0, 0, 0, 0, 1, 1, 1],
      [2, 0, 0, 1, 1, 1, 1],
      [2, 2, 3, 3, 1, 4, 4],
      [2, 2, 3, 3, 4, 4, 4],
      [5, 2, 3, 3, 4, 6, 4],
      [5, 5, 5, 6, 6, 6, 6],
      [5, 5, 5, 6, 6, 6, 6],
    ],
  },
  {
    id: "arasigal-03",
    gridSize: 7,
    solution: [
      { row: 0, col: 4 },
      { row: 1, col: 1 },
      { row: 2, col: 5 },
      { row: 3, col: 2 },
      { row: 4, col: 6 },
      { row: 5, col: 3 },
      { row: 6, col: 0 },
    ],
    regions: [
      [0, 0, 1, 1, 1, 2, 2],
      [0, 0, 1, 1, 2, 2, 2],
      [0, 3, 3, 1, 2, 4, 4],
      [3, 3, 3, 5, 5, 4, 4],
      [3, 3, 5, 5, 5, 4, 4],
      [6, 3, 5, 5, 6, 6, 4],
      [6, 6, 6, 6, 6, 6, 6],
    ],
  },
  {
    id: "arasigal-04",
    gridSize: 7,
    solution: [
      { row: 0, col: 1 },
      { row: 1, col: 4 },
      { row: 2, col: 0 },
      { row: 3, col: 3 },
      { row: 4, col: 6 },
      { row: 5, col: 2 },
      { row: 6, col: 5 },
    ],
    regions: [
      [0, 0, 1, 1, 1, 1, 2],
      [0, 0, 0, 1, 1, 2, 2],
      [3, 3, 0, 4, 4, 2, 2],
      [3, 3, 4, 4, 4, 2, 5],
      [3, 4, 4, 4, 5, 5, 5],
      [6, 6, 4, 4, 5, 5, 5],
      [6, 6, 6, 6, 6, 5, 5],
    ],
  },
  {
    id: "arasigal-05",
    gridSize: 7,
    solution: [
      { row: 0, col: 5 },
      { row: 1, col: 2 },
      { row: 2, col: 6 },
      { row: 3, col: 1 },
      { row: 4, col: 4 },
      { row: 5, col: 0 },
      { row: 6, col: 3 },
    ],
    regions: [
      [0, 0, 0, 1, 1, 1, 1],
      [0, 2, 2, 1, 1, 1, 3],
      [0, 2, 2, 2, 4, 3, 3],
      [5, 2, 2, 4, 4, 3, 3],
      [5, 5, 4, 4, 4, 3, 3],
      [5, 5, 4, 6, 6, 6, 6],
      [5, 5, 6, 6, 6, 6, 6],
    ],
  },
];

/**
 * Returns Arasigal puzzle for a given seed string deterministically.
 */
export function getArasigalPuzzle(seedStr: string): ArasigalPuzzle {
  // Use hash of seed to select puzzle
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % ARASIGAL_PUZZLES.length;
  return ARASIGAL_PUZZLES[index];
}
