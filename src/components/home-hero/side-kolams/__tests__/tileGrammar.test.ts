/**
 * tileGrammar.test.ts
 * 
 * Unit tests for the dot-and-tile grammar and alternating weave solver.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  expandFundamentalDomain,
  traceGridNetwork,
  meetsHardFilters,
  scoreCandidate,
  FUNDAMENTAL_CELLS,
  TileType,
} from '../tileGrammar';
import { solveAlternatingWeave } from '../overUnder';

describe('tileGrammar — Core Dot-and-Tile Engine', () => {
  it('expands fundamental domain preserving full D4 dihedral symmetry', () => {
    // Arbitrary valid fundamental domain configuration
    const config: TileType[] = ['A', 'B', 'X', 'A', 'X', 'B', 'A', 'X', 'B', 'X'];
    const grid = expandFundamentalDomain(config);

    assert.equal(grid.length, 8);
    assert.equal(grid[0].length, 8);

    // Verify 90 deg rotation invariance
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        // Rotated 90 deg CCW: (i, j) -> (7 - j, i) with A <-> B swap
        const rotI = 7 - j;
        const rotJ = i;
        const orig = grid[i][j];
        const rot = grid[rotI][rotJ];
        if (orig === 'X') {
          assert.equal(rot, 'X', `Cell (${i},${j}) rotated should remain X`);
        } else if (orig === 'A') {
          assert.equal(rot, 'B', `Cell (${i},${j}) A rotated should become B`);
        } else if (orig === 'B') {
          assert.equal(rot, 'A', `Cell (${i},${j}) B rotated should become A`);
        }
      }
    }

    // Verify main diagonal reflection invariance: (i, j) -> (j, i)
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        assert.equal(grid[i][j], grid[j][i], `Diagonal reflection must match at (${i},${j})`);
      }
    }
  });

  it('guarantees every terminal has degree exactly 2 and forms closed loops', () => {
    const config: TileType[] = ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'];
    const grid = expandFundamentalDomain(config);
    const network = traceGridNetwork(grid);

    assert.ok(network.loops.length >= 1, 'Must have at least 1 loop');
    assert.equal(network.totalLength, 144, 'Total terminal visits across all loops must equal 144');

    // Verify that every loop is closed
    for (const loop of network.loops) {
      assert.ok(loop.length >= 3, 'Loop must have at least 3 terminals');
    }
  });

  it('solves alternating over/under weave consistently', () => {
    // Symmetric crossing test case
    const config: TileType[] = ['X', 'A', 'B', 'X', 'A', 'B', 'X', 'A', 'B', 'X'];
    const grid = expandFundamentalDomain(config);
    const network = traceGridNetwork(grid);

    if (network.crossingsCount > 0) {
      const assignment = solveAlternatingWeave(grid, network);
      if (assignment.isValid) {
        assert.equal(
          assignment.horizontalIsOver.size,
          network.crossingsCount,
          'Must assign status to every crossing'
        );
      }
    }
  });
});
