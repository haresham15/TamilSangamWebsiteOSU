/**
 * overUnder.ts
 * 
 * Implements the BFS parity solver for the alternating weave (§3.5 & §4).
 * Determines which strand is OVER (+Z) and which is UNDER (-Z) at each crossing,
 * asserting that along every strand, consecutive crossings alternate.
 */

import { Grid8x8, TracedNetwork, hTerminalId, vTerminalId } from './tileGrammar';

export interface CrossingAssignment {
  // Map of "i,j" -> true if horizontal strand is OVER, false if vertical strand is OVER
  horizontalIsOver: Map<string, boolean>;
  isValid: boolean;
}

interface CrossingEncounter {
  cellKey: string;
  axis: 'H' | 'V'; // 'H' for left-right, 'V' for bottom-top
}

/**
 * Solves the alternating weave for a traced network.
 * Returns the assignment of horizontalIsOver for each X cell, or isValid: false if unsatisfiable.
 */
export function solveAlternatingWeave(grid: Grid8x8, network: TracedNetwork): CrossingAssignment {
  const result: CrossingAssignment = {
    horizontalIsOver: new Map(),
    isValid: true,
  };

  if (network.crossingsCount === 0) {
    return result;
  }

  // Build list of crossing encounters along each loop
  const loopEncounters: CrossingEncounter[][] = [];

  for (const loop of network.loops) {
    const encounters: CrossingEncounter[] = [];
    const n = loop.length;

    for (let k = 0; k < n; k++) {
      const fromT = loop[k];
      const toT = loop[(k + 1) % n];

      // Check if this transition corresponds to a crossing
      // Horizontal crossing pass: V(i, j) ↔ V(i+1, j)
      // Vertical crossing pass: H(i, j) ↔ H(i, j+1)
      if (fromT >= 72 && toT >= 72) {
        // Both are vertical terminals
        const v1 = fromT - 72;
        const v2 = toT - 72;
        const x1 = v1 % 9;
        const y1 = Math.floor(v1 / 9);
        const x2 = v2 % 9;
        const y2 = Math.floor(v2 / 9);

        if (y1 === y2 && Math.abs(x1 - x2) === 1) {
          const i = Math.min(x1, x2);
          const j = y1;
          if (grid[i][j] === 'X') {
            encounters.push({ cellKey: `${i},${j}`, axis: 'H' });
          }
        }
      } else if (fromT < 72 && toT < 72) {
        // Both are horizontal terminals
        const x1 = fromT % 8;
        const y1 = Math.floor(fromT / 8);
        const x2 = toT % 8;
        const y2 = Math.floor(toT / 8);

        if (x1 === x2 && Math.abs(y1 - y2) === 1) {
          const i = x1;
          const j = Math.min(y1, y2);
          if (grid[i][j] === 'X') {
            encounters.push({ cellKey: `${i},${j}`, axis: 'V' });
          }
        }
      }
    }

    loopEncounters.push(encounters);
  }

  // Check alternating parity condition on each loop:
  // Each loop must have an even number of crossings to alternate cleanly
  for (const encounters of loopEncounters) {
    if (encounters.length > 0 && encounters.length % 2 !== 0) {
      result.isValid = false;
      return result;
    }
  }

  // Build constraints graph between crossings:
  // Node = cellKey
  // Variable H(cellKey) in {+1, -1} where +1 = horizontal pass is OVER, -1 = horizontal pass is UNDER.
  // Strand pass status:
  // - If axis is 'H': status = +H(cellKey)
  // - If axis is 'V': status = -H(cellKey)
  // Alternation along loop: status(p+1) = -status(p)
  // Therefore: sign(p+1) * H(p+1) = - (sign(p) * H(p))
  // => H(p+1) = - (sign(p) / sign(p+1)) * H(p) = relativeRatio * H(p)
  interface Constraint {
    neighbor: string;
    ratio: number; // +1 or -1
  }

  const adj = new Map<string, Constraint[]>();
  for (const [i, j] of network.crossingCells) {
    adj.set(`${i},${j}`, []);
  }

  for (const encounters of loopEncounters) {
    const m = encounters.length;
    for (let p = 0; p < m; p++) {
      const e1 = encounters[p];
      const e2 = encounters[(p + 1) % m];

      const sign1 = e1.axis === 'H' ? 1 : -1;
      const sign2 = e2.axis === 'H' ? 1 : -1;
      const ratio = - (sign1 * sign2); // H(e2) = ratio * H(e1)

      adj.get(e1.cellKey)?.push({ neighbor: e2.cellKey, ratio });
      adj.get(e2.cellKey)?.push({ neighbor: e1.cellKey, ratio });
    }
  }

  // BFS parity solver
  const assignment = new Map<string, number>();

  for (const [i, j] of network.crossingCells) {
    const key = `${i},${j}`;
    if (assignment.has(key)) continue;

    // Start component with H(key) = +1
    assignment.set(key, 1);
    const queue = [key];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const currVal = assignment.get(curr)!;
      const neighbors = adj.get(curr) || [];

      for (const edge of neighbors) {
        const expectedVal = currVal * edge.ratio;
        if (assignment.has(edge.neighbor)) {
          if (assignment.get(edge.neighbor) !== expectedVal) {
            // Parity contradiction!
            result.isValid = false;
            return result;
          }
        } else {
          assignment.set(edge.neighbor, expectedVal);
          queue.push(edge.neighbor);
        }
      }
    }
  }

  // Fill in final boolean map
  for (const [key, val] of assignment.entries()) {
    result.horizontalIsOver.set(key, val === 1);
  }

  result.isValid = true;
  return result;
}
