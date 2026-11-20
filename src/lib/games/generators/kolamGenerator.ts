// src/lib/games/generators/kolamGenerator.ts
/**
 * Procedural Hamiltonian Path & Pulli Kolam Generator.
 * Generates an unbroken path covering every cell of an N×N grid.
 * Guaranteed 100% solvable in <15ms.
 */

import { getGamePrng } from "../seed";

export interface KolamCell {
  row: number;
  col: number;
  checkpointNumber?: number; // 1, 2, 3 ... K
}

export interface KolamPuzzle {
  gridSize: number;
  totalCells: number;
  checkpoints: Array<{ row: number; col: number; number: number }>;
  solutionPath: Array<{ row: number; col: number }>;
}

export function generateKolamPuzzle(
  seedStr: string,
  gridSize: number = 6
): KolamPuzzle {
  const prng = getGamePrng("kolam-path", seedStr);
  const totalCells = gridSize * gridSize;

  // Find a Hamiltonian path using Warnsdorff's heuristic with restarts
  let path: Array<{ row: number; col: number }> = [];
  let attempts = 0;

  while (path.length < totalCells && attempts < 100) {
    attempts++;
    path = [];
    const visited = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(false)
    );

    // Pick random starting cell
    let currR = prng.nextInt(0, gridSize - 1);
    let currC = prng.nextInt(0, gridSize - 1);

    path.push({ row: currR, col: currC });
    visited[currR][currC] = true;

    while (path.length < totalCells) {
      // Find unvisited neighbors
      const neighbors: Array<{ row: number; col: number; degree: number }> = [];
      const deltas = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];

      for (const [dr, dc] of deltas) {
        const nr = currR + dr;
        const nc = currC + dc;
        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && !visited[nr][nc]) {
          // Count unvisited neighbors of neighbor (degree for Warnsdorff)
          let degree = 0;
          for (const [ddr, ddc] of deltas) {
            const nnr = nr + ddr;
            const nnc = nc + ddc;
            if (
              nnr >= 0 &&
              nnr < gridSize &&
              nnc >= 0 &&
              nnc < gridSize &&
              !visited[nnr][nnc]
            ) {
              degree++;
            }
          }
          neighbors.push({ row: nr, col: nc, degree });
        }
      }

      if (neighbors.length === 0) break; // Dead end

      // Warnsdorff's rule: sort by degree ascending + tie-break randomly
      neighbors.sort((a, b) => a.degree - b.degree || (prng.next() - 0.5));
      const nextCell = neighbors[0];

      currR = nextCell.row;
      currC = nextCell.col;
      path.push({ row: currR, col: currC });
      visited[currR][currC] = true;
    }
  }

  // Fallback: If Warnsdorff didn't fill all cells (rare on 6x6), use snake path
  if (path.length < totalCells) {
    path = [];
    for (let r = 0; r < gridSize; r++) {
      if (r % 2 === 0) {
        for (let c = 0; c < gridSize; c++) path.push({ row: r, col: c });
      } else {
        for (let c = gridSize - 1; c >= 0; c--) path.push({ row: r, col: c });
      }
    }
  }

  // Select checkpoints along the path: 1 (start), some intermediate checkpoints, and totalCells (end)
  // E.g. for 36 cells: 1, 6, 12, 18, 24, 30, 36
  const checkpointStep = Math.max(4, Math.floor(totalCells / 6));
  const checkpoints: Array<{ row: number; col: number; number: number }> = [];
  let cpNumber = 1;

  for (let i = 0; i < path.length; i++) {
    if (i === 0 || i === path.length - 1 || (i > 0 && i % checkpointStep === 0)) {
      checkpoints.push({
        row: path[i].row,
        col: path[i].col,
        number: cpNumber++,
      });
    }
  }

  return {
    gridSize,
    totalCells,
    checkpoints,
    solutionPath: path,
  };
}
