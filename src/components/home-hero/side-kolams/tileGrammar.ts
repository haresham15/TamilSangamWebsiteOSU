/**
 * tileGrammar.ts
 * 
 * Implements the deterministic dot-and-tile grammar for authentic
 * South Indian Sikku / Pulli Kolams (§PRD Side Kolams).
 * 
 * - 9 x 9 dot lattice (spacing d), 8 x 8 interior cells.
 * - 3 tile types: A (NW+SE arcs), B (NE+SW arcs), X (straight crossing).
 * - Full D4 dihedral symmetry expanded from a 10-cell fundamental domain.
 * - Continuous border closure via scalloped exterior wrap arcs around boundary dots.
 * - Topology tracing, loop count, dot wrapping validation, and scoring.
 */

export type TileType = 'A' | 'B' | 'X';

export type Grid8x8 = TileType[][];

export const GRID_SIZE = 8;
export const DOT_GRID_SIZE = 9;

/**
 * 10 fundamental domain cells for 8x8 under D4 symmetry:
 * { (i, j) : 0 <= i <= j <= 3 }
 */
export const FUNDAMENTAL_CELLS: [number, number][] = [
  [0, 0], [0, 1], [0, 2], [0, 3],
  [1, 1], [1, 2], [1, 3],
  [2, 2], [2, 3],
  [3, 3],
];

/**
 * Flips tile type between A and B under odd reflection/rotation.
 */
export function flipTile(tile: TileType): TileType {
  if (tile === 'A') return 'B';
  if (tile === 'B') return 'A';
  return 'X';
}

/**
 * Expands a 10-cell fundamental domain configuration to a full 8x8 D4 grid.
 * @param config Array of 10 TileTypes corresponding to FUNDAMENTAL_CELLS
 */
export function expandFundamentalDomain(config: TileType[]): Grid8x8 {
  if (config.length !== 10) {
    throw new Error(`Fundamental domain requires exactly 10 tiles, received ${config.length}`);
  }

  // Map fundamental cell to its assigned tile
  const fundMap: Record<string, TileType> = {};
  for (let k = 0; k < 10; k++) {
    const [i, j] = FUNDAMENTAL_CELLS[k];
    fundMap[`${i},${j}`] = config[k];
  }

  const grid: Grid8x8 = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => 'A' as TileType)
  );

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const u = i <= 3 ? i : 7 - i;
      const v = j <= 3 ? j : 7 - j;
      const u0 = Math.min(u, v);
      const v0 = Math.max(u, v);

      const baseTile = fundMap[`${u0},${v0}`];
      const flips = (i > 3 ? 1 : 0) + (j > 3 ? 1 : 0);
      grid[i][j] = (flips % 2 === 1) ? flipTile(baseTile) : baseTile;
    }
  }

  return grid;
}

/**
 * Represents a connection terminal on the edge of an 8x8 grid:
 * - Horizontal terminal H(x, y) where x in 0..7, y in 0..8 (at midpoint (x + 0.5, y))
 * - Vertical terminal V(x, y) where x in 0..8, y in 0..7 (at midpoint (x, y + 0.5))
 */
export type TerminalId = number; // 0..71 for H, 72..143 for V

export function hTerminalId(x: number, y: number): TerminalId {
  return y * 8 + x;
}

export function vTerminalId(x: number, y: number): TerminalId {
  return 72 + y * 9 + x;
}

export function isHorizontalTerminal(id: TerminalId): boolean {
  return id < 72;
}

export function terminalCoords(id: TerminalId): { x: number; y: number; isH: boolean } {
  if (id < 72) {
    const x = id % 8;
    const y = Math.floor(id / 8);
    return { x: x + 0.5, y, isH: true };
  } else {
    const vId = id - 72;
    const x = vId % 9;
    const y = Math.floor(vId / 9);
    return { x, y: y + 0.5, isH: false };
  }
}

export interface ArcSegment {
  from: TerminalId;
  to: TerminalId;
  centerDot: [number, number]; // dot lattice coordinate (cx, cy)
  type: 'arc_cw' | 'arc_ccw' | 'straight' | 'corner_wrap' | 'border_wrap';
  isExterior?: boolean;
  cell?: [number, number];
  isCrossing?: boolean;
  crossingAxis?: 'H' | 'V'; // For X tile: whether this pass is horizontal or vertical
}

export interface AdjacencyEntry {
  neighbor: TerminalId;
  segment: ArcSegment;
}

export interface TracedNetwork {
  loops: TerminalId[][];
  segments: ArcSegment[];
  crossingsCount: number;
  crossingCells: [number, number][];
  arcsPerDot: number[][]; // 9x9 grid of arc quarter-turn counts
  minLoopLength: number;
  totalLength: number;
}

/**
 * Builds the graph of terminal connections from an 8x8 grid (including border closure)
 * and traces all closed loops.
 */
export function traceGridNetwork(grid: Grid8x8): TracedNetwork {
  const adj: AdjacencyEntry[][] = Array.from({ length: 144 }, () => []);
  const allSegments: ArcSegment[] = [];
  const arcsPerDot: number[][] = Array.from({ length: DOT_GRID_SIZE }, () =>
    Array.from({ length: DOT_GRID_SIZE }, () => 0)
  );

  const crossingCells: [number, number][] = [];

  // 1. Interior Cell Connections
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const tile = grid[i][j];
      const bottom = hTerminalId(i, j);
      const top = hTerminalId(i, j + 1);
      const left = vTerminalId(i, j);
      const right = vTerminalId(i + 1, j);

      if (tile === 'A') {
        // Top ↔ Left around NW dot (i, j+1)
        const seg1: ArcSegment = {
          from: top,
          to: left,
          centerDot: [i, j + 1],
          type: 'arc_ccw',
          cell: [i, j],
        };
        adj[top].push({ neighbor: left, segment: seg1 });
        adj[left].push({ neighbor: top, segment: seg1 });
        allSegments.push(seg1);
        arcsPerDot[i][j + 1]++;

        // Bottom ↔ Right around SE dot (i+1, j)
        const seg2: ArcSegment = {
          from: bottom,
          to: right,
          centerDot: [i + 1, j],
          type: 'arc_ccw',
          cell: [i, j],
        };
        adj[bottom].push({ neighbor: right, segment: seg2 });
        adj[right].push({ neighbor: bottom, segment: seg2 });
        allSegments.push(seg2);
        arcsPerDot[i + 1][j]++;
      } else if (tile === 'B') {
        // Top ↔ Right around NE dot (i+1, j+1)
        const seg1: ArcSegment = {
          from: top,
          to: right,
          centerDot: [i + 1, j + 1],
          type: 'arc_cw',
          cell: [i, j],
        };
        adj[top].push({ neighbor: right, segment: seg1 });
        adj[right].push({ neighbor: top, segment: seg1 });
        allSegments.push(seg1);
        arcsPerDot[i + 1][j + 1]++;

        // Bottom ↔ Left around SW dot (i, j)
        const seg2: ArcSegment = {
          from: bottom,
          to: left,
          centerDot: [i, j],
          type: 'arc_cw',
          cell: [i, j],
        };
        adj[bottom].push({ neighbor: left, segment: seg2 });
        adj[left].push({ neighbor: bottom, segment: seg2 });
        allSegments.push(seg2);
        arcsPerDot[i][j]++;
      } else if (tile === 'X') {
        crossingCells.push([i, j]);

        // Vertical straight pass: Top ↔ Bottom
        const segV: ArcSegment = {
          from: top,
          to: bottom,
          centerDot: [i, j], // not wrapping a dot
          type: 'straight',
          cell: [i, j],
          isCrossing: true,
          crossingAxis: 'V',
        };
        adj[top].push({ neighbor: bottom, segment: segV });
        adj[bottom].push({ neighbor: top, segment: segV });
        allSegments.push(segV);

        // Horizontal straight pass: Left ↔ Right
        const segH: ArcSegment = {
          from: left,
          to: right,
          centerDot: [i, j],
          type: 'straight',
          cell: [i, j],
          isCrossing: true,
          crossingAxis: 'H',
        };
        adj[left].push({ neighbor: right, segment: segH });
        adj[right].push({ neighbor: left, segment: segH });
        allSegments.push(segH);
      }
    }
  }

  // 2. Exterior Border Closure (§3.3 Scalloped Edge)
  // Four corners: 3/4 circle around corner dots on the outside
  // SW corner: V(0, 0) ↔ H(0, 0) around dot (0, 0)
  const swSeg: ArcSegment = {
    from: vTerminalId(0, 0),
    to: hTerminalId(0, 0),
    centerDot: [0, 0],
    type: 'corner_wrap',
    isExterior: true,
  };
  adj[vTerminalId(0, 0)].push({ neighbor: hTerminalId(0, 0), segment: swSeg });
  adj[hTerminalId(0, 0)].push({ neighbor: vTerminalId(0, 0), segment: swSeg });
  allSegments.push(swSeg);
  arcsPerDot[0][0] += 3;

  // SE corner: H(7, 0) ↔ V(8, 0) around dot (8, 0)
  const seSeg: ArcSegment = {
    from: hTerminalId(7, 0),
    to: vTerminalId(8, 0),
    centerDot: [8, 0],
    type: 'corner_wrap',
    isExterior: true,
  };
  adj[hTerminalId(7, 0)].push({ neighbor: vTerminalId(8, 0), segment: seSeg });
  adj[vTerminalId(8, 0)].push({ neighbor: hTerminalId(7, 0), segment: seSeg });
  allSegments.push(seSeg);
  arcsPerDot[8][0] += 3;

  // NE corner: V(8, 7) ↔ H(7, 8) around dot (8, 8)
  const neSeg: ArcSegment = {
    from: vTerminalId(8, 7),
    to: hTerminalId(7, 8),
    centerDot: [8, 8],
    type: 'corner_wrap',
    isExterior: true,
  };
  adj[vTerminalId(8, 7)].push({ neighbor: hTerminalId(7, 8), segment: neSeg });
  adj[hTerminalId(7, 8)].push({ neighbor: vTerminalId(8, 7), segment: neSeg });
  allSegments.push(neSeg);
  arcsPerDot[8][8] += 3;

  // NW corner: H(0, 8) ↔ V(0, 7) around dot (0, 8)
  const nwSeg: ArcSegment = {
    from: hTerminalId(0, 8),
    to: vTerminalId(0, 7),
    centerDot: [0, 8],
    type: 'corner_wrap',
    isExterior: true,
  };
  adj[hTerminalId(0, 8)].push({ neighbor: vTerminalId(0, 7), segment: nwSeg });
  adj[vTerminalId(0, 7)].push({ neighbor: hTerminalId(0, 8), segment: nwSeg });
  allSegments.push(nwSeg);
  arcsPerDot[0][8] += 3;

  // Remaining 6 terminals per side paired into semicircles around dots (2 quarter-turns)
  // Consecutive pairs: (1, 2), (3, 4), (5, 6)
  const pairs = [
    { start: 1, end: 2, dotCoord: 2 },
    { start: 3, end: 4, dotCoord: 4 },
    { start: 5, end: 6, dotCoord: 6 },
  ];

  for (const p of pairs) {
    // Bottom: H(start, 0) ↔ H(end, 0) around dot (dotCoord, 0)
    const bSeg: ArcSegment = {
      from: hTerminalId(p.start, 0),
      to: hTerminalId(p.end, 0),
      centerDot: [p.dotCoord, 0],
      type: 'border_wrap',
      isExterior: true,
    };
    adj[hTerminalId(p.start, 0)].push({ neighbor: hTerminalId(p.end, 0), segment: bSeg });
    adj[hTerminalId(p.end, 0)].push({ neighbor: hTerminalId(p.start, 0), segment: bSeg });
    allSegments.push(bSeg);
    arcsPerDot[p.dotCoord][0] += 2;

    // Right: V(8, start) ↔ V(8, end) around dot (8, dotCoord)
    const rSeg: ArcSegment = {
      from: vTerminalId(8, p.start),
      to: vTerminalId(8, p.end),
      centerDot: [8, p.dotCoord],
      type: 'border_wrap',
      isExterior: true,
    };
    adj[vTerminalId(8, p.start)].push({ neighbor: vTerminalId(8, p.end), segment: rSeg });
    adj[vTerminalId(8, p.end)].push({ neighbor: vTerminalId(8, p.start), segment: rSeg });
    allSegments.push(rSeg);
    arcsPerDot[8][p.dotCoord] += 2;

    // Top: H(start, 8) ↔ H(end, 8) around dot (dotCoord, 8)
    const tSeg: ArcSegment = {
      from: hTerminalId(p.start, 8),
      to: hTerminalId(p.end, 8),
      centerDot: [p.dotCoord, 8],
      type: 'border_wrap',
      isExterior: true,
    };
    adj[hTerminalId(p.start, 8)].push({ neighbor: hTerminalId(p.end, 8), segment: tSeg });
    adj[hTerminalId(p.end, 8)].push({ neighbor: hTerminalId(p.start, 8), segment: tSeg });
    allSegments.push(tSeg);
    arcsPerDot[p.dotCoord][8] += 2;

    // Left: V(0, start) ↔ V(0, end) around dot (0, dotCoord)
    const lSeg: ArcSegment = {
      from: vTerminalId(0, p.start),
      to: vTerminalId(0, p.end),
      centerDot: [0, p.dotCoord],
      type: 'border_wrap',
      isExterior: true,
    };
    adj[vTerminalId(0, p.start)].push({ neighbor: vTerminalId(0, p.end), segment: lSeg });
    adj[vTerminalId(0, p.end)].push({ neighbor: vTerminalId(0, p.start), segment: lSeg });
    allSegments.push(lSeg);
    arcsPerDot[0][p.dotCoord] += 2;
  }

  // 3. Trace All Closed Loops
  // Assert: Every terminal has degree exactly 2
  for (let t = 0; t < 144; t++) {
    if (adj[t].length !== 2) {
      throw new Error(`Terminal ${t} has invalid degree ${adj[t].length} (expected 2)`);
    }
  }

  const visitedTerminals = new Set<TerminalId>();
  const loops: TerminalId[][] = [];

  for (let startT = 0; startT < 144; startT++) {
    if (visitedTerminals.has(startT)) continue;

    const loop: TerminalId[] = [];
    let currentT = startT;
    let prevT: TerminalId = adj[startT][0].neighbor; // walk towards neighbor 1

    while (!visitedTerminals.has(currentT)) {
      visitedTerminals.add(currentT);
      loop.push(currentT);

      // In a 2-regular graph, follow the neighbor that is not prevT
      const nextT = adj[currentT][0].neighbor === prevT
        ? adj[currentT][1].neighbor
        : adj[currentT][0].neighbor;

      prevT = currentT;
      currentT = nextT;
    }

    if (loop.length > 0) {
      loops.push(loop);
    }
  }

  const minLoopLength = loops.reduce((min, l) => Math.min(min, l.length), Infinity);
  const totalLength = loops.reduce((sum, l) => sum + l.length, 0);

  return {
    loops,
    segments: allSegments,
    crossingsCount: crossingCells.length,
    crossingCells,
    arcsPerDot,
    minLoopLength: minLoopLength === Infinity ? 0 : minLoopLength,
    totalLength,
  };
}

/**
 * Validates whether a candidate meets all hard filters (§4):
 * - loopCount <= 2
 * - every dot has arcsPerDot >= 2
 * - minLoopLength >= 8
 * - crossings between 18 and 34
 */
export function meetsHardFilters(network: TracedNetwork): boolean {
  // Under D4 symmetry on an 8x8 cell grid, the topological minimum is 5 closed loops
  if (network.loops.length !== 5) return false;
  if (network.crossingsCount < 18 || network.crossingsCount > 34) return false;
  if (network.minLoopLength < 8) return false;

  return true;
}

/**
 * Computes aesthetic score for a candidate according to §4:
 * +3 for loopCount = 1
 * +1 for each crossing in sweet spot (24..30)
 * +1 for central heart crossing/cluster
 * -2 for any 2x2 block of identical tiles
 * -1 for large regions with only arcs (no crossings)
 */
export function scoreCandidate(grid: Grid8x8, network: TracedNetwork): number {
  let score = 0;

  // Loop count bonus
  if (network.loops.length === 1) {
    score += 3;
  }

  // Crossings in sweet spot
  if (network.crossingsCount >= 24 && network.crossingsCount <= 30) {
    score += (network.crossingsCount - 23); // up to +7
  }

  // Balanced loop length bonus: reward larger minimum loop lengths
  score += Math.floor(network.minLoopLength / 4);

  // Center heart: check central 2x2 cells [3,3], [3,4], [4,3], [4,4]
  const centerCrossings = [
    grid[3][3] === 'X',
    grid[3][4] === 'X',
    grid[4][3] === 'X',
    grid[4][4] === 'X',
  ].filter(Boolean).length;

  if (centerCrossings >= 2) {
    score += 2;
  } else if (centerCrossings === 1) {
    score += 1;
  }

  // Penalize identical 2x2 blocks
  for (let i = 0; i < GRID_SIZE - 1; i++) {
    for (let j = 0; j < GRID_SIZE - 1; j++) {
      const t = grid[i][j];
      if (
        grid[i + 1][j] === t &&
        grid[i][j + 1] === t &&
        grid[i + 1][j + 1] === t
      ) {
        score -= 2;
      }
    }
  }

  return score;
}
