/**
 * designSearch.ts
 * 
 * Exhaustive D4 fundamental-domain search across all 3^10 = 59,049 candidate configurations (§PRD Side Kolams §4).
 * Filters by loop count (<= 2), dot wrapping (arcsPerDot >= 2), crossing counts (18..34),
 * and alternating weave parity solvability.
 * Generates docs/kolam-candidates.svg contact sheet of the top 24 candidates (both 0 deg and 45 deg).
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  TileType,
  Grid8x8,
  expandFundamentalDomain,
  traceGridNetwork,
  meetsHardFilters,
  scoreCandidate,
  TracedNetwork,
  terminalCoords,
} from './tileGrammar';
import { solveAlternatingWeave, CrossingAssignment } from './overUnder';

export interface EvaluatedCandidate {
  id: number;
  config: TileType[];
  configStr: string;
  grid: Grid8x8;
  network: TracedNetwork;
  assignment: CrossingAssignment;
  score: number;
}

const TILES: TileType[] = ['A', 'B', 'X'];

/**
 * Converts integer index in 0..59048 to a 10-tile fundamental domain configuration.
 */
export function indexToConfig(index: number): TileType[] {
  const config: TileType[] = [];
  let n = index;
  for (let i = 0; i < 10; i++) {
    const rem = n % 3;
    config.push(TILES[rem]);
    n = Math.floor(n / 3);
  }
  return config;
}

/**
 * Searches the full 3^10 design space and returns sorted evaluated candidates.
 */
export function runDesignSearch(): EvaluatedCandidate[] {
  const TOTAL_CANDIDATES = 59049;
  const candidates: EvaluatedCandidate[] = [];

  for (let idx = 0; idx < TOTAL_CANDIDATES; idx++) {
    const config = indexToConfig(idx);
    const grid = expandFundamentalDomain(config);
    const network = traceGridNetwork(grid);

    if (!meetsHardFilters(network)) {
      continue;
    }

    const assignment = solveAlternatingWeave(grid, network);
    if (!assignment.isValid) {
      continue;
    }

    const score = scoreCandidate(grid, network);

    candidates.push({
      id: idx,
      config,
      configStr: config.join(''),
      grid,
      network,
      assignment,
      score,
    });
  }

  // Sort descending by score, then by crossings proximity to 26, then by loop count = 1
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.network.loops.length !== b.network.loops.length) {
      return a.network.loops.length - b.network.loops.length;
    }
    const distA = Math.abs(a.network.crossingsCount - 26);
    const distB = Math.abs(b.network.crossingsCount - 26);
    return distA - distB;
  });

  return candidates;
}

/**
 * Generates an SVG path string for a candidate's weave.
 * Renders dots, under-passes with gaps, and over-passes.
 */
export function renderCandidateSvg(
  cand: EvaluatedCandidate,
  boxSize = 280,
  rotated45 = false
): string {
  const d = boxSize / 11; // spacing so 9 dots + boundary fits boxSize
  const originX = boxSize / 2;
  const originY = boxSize / 2;

  // Dot lattice coordinates (0..8) mapped to SVG coordinates centered at (originX, originY)
  // Grid bounds: 0 to 8, center is 4.0
  const toSvg = (gx: number, gy: number): [number, number] => {
    const lx = (gx - 4.0) * d;
    const ly = (gy - 4.0) * d; // In SVG, Y increases down, in math Y up. We'll flip Y for standard orientation.
    if (!rotated45) {
      return [originX + lx, originY - ly];
    }
    // Rotate 45 deg: x' = (x - y) / sqrt(2), y' = (x + y) / sqrt(2)
    const cos45 = Math.SQRT1_2;
    const sin45 = Math.SQRT1_2;
    const rx = lx * cos45 - (-ly) * sin45;
    const ry = lx * sin45 + (-ly) * cos45;
    return [originX + rx, originY + ry];
  };

  const svgParts: string[] = [];

  // Group wrapper with optional rotation
  svgParts.push(`<g class="kolam-cell">`);

  // 1. Draw Pulli Dots (9x9 = 81 dots)
  svgParts.push(`<g class="pulli-dots" fill="#E6DBFF" opacity="0.85">`);
  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      const [sx, sy] = toSvg(x, y);
      svgParts.push(`<circle cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" r="${(d * 0.075).toFixed(2)}" />`);
    }
  }
  svgParts.push(`</g>`);

  // 2. Draw Weave Lines
  // Under-strand pass: stroke #7C4DDB, width 0.11 d
  // Over-strand pass: stroke #7C4DDB, width 0.11 d, with gap mask or drawn on top
  const strokeW = (d * 0.11).toFixed(2);
  const gapW = (d * 0.22).toFixed(2);

  // We trace all segments.
  // There are two categories: non-crossing segments (or under crossings), and over crossings!
  const underPaths: string[] = [];
  const gapPaths: string[] = [];
  const overPaths: string[] = [];

  for (const seg of cand.network.segments) {
    if (seg.type === 'corner_wrap') {
      // 3/4 circle around corner dot outside
      const [_cx, _cy] = seg.centerDot;
      const [p1x, p1y] = toSvg(terminalCoords(seg.from).x, terminalCoords(seg.from).y);
      const [p2x, p2y] = toSvg(terminalCoords(seg.to).x, terminalCoords(seg.to).y);
      // Construct arc via SVG arc command
      // Corner radius = 0.5 * d
      const r = (d * 0.5).toFixed(2);
      // In SVG: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
      // Corner wrap is 270 deg (large-arc = 1)
      underPaths.push(`M ${p1x.toFixed(2)} ${p1y.toFixed(2)} A ${r} ${r} 0 1 1 ${p2x.toFixed(2)} ${p2y.toFixed(2)}`);
    } else if (seg.type === 'border_wrap') {
      // Semicircle around boundary dot outside (180 deg)
      const [p1x, p1y] = toSvg(terminalCoords(seg.from).x, terminalCoords(seg.from).y);
      const [p2x, p2y] = toSvg(terminalCoords(seg.to).x, terminalCoords(seg.to).y);
      const r = (d * 0.5).toFixed(2);
      // Semicircle: large-arc = 0
      // Determine sweep direction relative to outside
      underPaths.push(`M ${p1x.toFixed(2)} ${p1y.toFixed(2)} A ${r} ${r} 0 0 1 ${p2x.toFixed(2)} ${p2y.toFixed(2)}`);
    } else if (seg.type === 'arc_cw' || seg.type === 'arc_ccw') {
      // Quarter-circle inside cell (90 deg)
      const [p1x, p1y] = toSvg(terminalCoords(seg.from).x, terminalCoords(seg.from).y);
      const [p2x, p2y] = toSvg(terminalCoords(seg.to).x, terminalCoords(seg.to).y);
      const r = (d * 0.5).toFixed(2);
      underPaths.push(`M ${p1x.toFixed(2)} ${p1y.toFixed(2)} A ${r} ${r} 0 0 1 ${p2x.toFixed(2)} ${p2y.toFixed(2)}`);
    } else if (seg.type === 'straight' && seg.cell) {
      // Straight crossing inside cell
      const [ci, cj] = seg.cell;
      const cellKey = `${ci},${cj}`;
      const isHorizontal = seg.crossingAxis === 'H';
      const hIsOver = cand.assignment.horizontalIsOver.get(cellKey) ?? true;
      const isThisPassOver = isHorizontal ? hIsOver : !hIsOver;

      const [p1x, p1y] = toSvg(terminalCoords(seg.from).x, terminalCoords(seg.from).y);
      const [p2x, p2y] = toSvg(terminalCoords(seg.to).x, terminalCoords(seg.to).y);
      const lineStr = `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)}`;

      if (isThisPassOver) {
        // Gap for under strand behind it
        gapPaths.push(lineStr);
        overPaths.push(lineStr);
      } else {
        underPaths.push(lineStr);
      }
    }
  }

  // Render Under-paths
  svgParts.push(`<g class="under-strands" stroke="#7C4DDB" stroke-width="${strokeW}" fill="none" stroke-linecap="round">`);
  for (const p of underPaths) {
    svgParts.push(`<path d="${p}" />`);
  }
  svgParts.push(`</g>`);

  // Render Gaps (cutout mask using background dark color #050201)
  if (gapPaths.length > 0) {
    svgParts.push(`<g class="crossing-gaps" stroke="#050201" stroke-width="${gapW}" fill="none" stroke-linecap="butt">`);
    for (const p of gapPaths) {
      svgParts.push(`<path d="${p}" />`);
    }
    svgParts.push(`</g>`);
  }

  // Render Over-paths
  if (overPaths.length > 0) {
    svgParts.push(`<g class="over-strands" stroke="#7C4DDB" stroke-width="${strokeW}" fill="none" stroke-linecap="round">`);
    for (const p of overPaths) {
      svgParts.push(`<path d="${p}" />`);
    }
    svgParts.push(`</g>`);
  }

  svgParts.push(`</g>`);
  return svgParts.join('\n');
}

/**
 * Builds the complete contact sheet SVG containing top 24 candidates (both 0 deg and 45 deg).
 */
export function buildContactSheetSvg(topCandidates: EvaluatedCandidate[]): string {
  const top24 = topCandidates.slice(0, 24);
  const cardW = 320;
  const cardH = 380;
  const cols = 4;
  const rows = Math.ceil(top24.length / cols);

  // We show two sections: Section 1 = 45 deg Diamond Presentation; Section 2 = 0 deg Upright Presentation
  const sectionH = rows * cardH + 120;
  const totalW = cols * cardW + 80;
  const totalH = sectionH * 2 + 100;

  const svg: string[] = [];
  svg.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  svg.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" style="background-color: #050201; font-family: monospace;">`);

  svg.push(`<defs>`);
  svg.push(`  <style>`);
  svg.push(`    .title { fill: #FFB84D; font-size: 24px; font-weight: bold; }`);
  svg.push(`    .subtitle { fill: #DDD6FE; font-size: 13px; }`);
  svg.push(`    .card-title { fill: #FFB84D; font-size: 14px; font-weight: bold; }`);
  svg.push(`    .card-meta { fill: #A78BFA; font-size: 11px; }`);
  svg.push(`    .card-box { fill: #0e0717; stroke: #3b1d66; stroke-width: 1.5; rx: 8; }`);
  svg.push(`  </style>`);
  svg.push(`</defs>`);

  // SECTION 1: 45° Diamond Presentation (Default Recommended)
  svg.push(`<text x="40" y="55" class="title">Authentic Sikku Kolam Candidates — 45° Staggered Diamond Presentation</text>`);
  svg.push(`<text x="40" y="80" class="subtitle">Top 24 D4 Symmetric Candidates · 9x9 Dot Lattice · Alternating Weave · Continuous Closed Loops</text>`);

  for (let idx = 0; idx < top24.length; idx++) {
    const cand = top24[idx];
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = 40 + col * cardW;
    const y = 110 + row * cardH;

    svg.push(`<g transform="translate(${x}, ${y})">`);
    svg.push(`  <rect width="${cardW - 20}" height="${cardH - 20}" class="card-box" />`);
    svg.push(`  <text x="15" y="28" class="card-title">Candidate #${idx + 1} (ID: ${cand.id})</text>`);
    svg.push(`  <text x="15" y="46" class="card-meta">Loops: ${cand.network.loops.length} | Crossings: ${cand.network.crossingsCount} | Score: ${cand.score}</text>`);
    svg.push(`  <text x="15" y="62" class="card-meta">Code: [${cand.configStr}]</text>`);

    // Kolam preview inside card
    svg.push(`  <g transform="translate(${(cardW - 20 - 260) / 2}, 75)">`);
    svg.push(renderCandidateSvg(cand, 260, true));
    svg.push(`  </g>`);
    svg.push(`</g>`);
  }

  // SECTION 2: 0° Upright Presentation
  const sec2Y = sectionH + 60;
  svg.push(`<text x="40" y="${sec2Y + 40}" class="title">Authentic Sikku Kolam Candidates — 0° Upright Presentation</text>`);
  svg.push(`<text x="40" y="${sec2Y + 65}" class="subtitle">Same Top 24 Candidates in Standard Orthogonal Alignment for Geometric Inspection</text>`);

  for (let idx = 0; idx < top24.length; idx++) {
    const cand = top24[idx];
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = 40 + col * cardW;
    const y = sec2Y + 95 + row * cardH;

    svg.push(`<g transform="translate(${x}, ${y})">`);
    svg.push(`  <rect width="${cardW - 20}" height="${cardH - 20}" class="card-box" />`);
    svg.push(`  <text x="15" y="28" class="card-title">Candidate #${idx + 1} (ID: ${cand.id})</text>`);
    svg.push(`  <text x="15" y="46" class="card-meta">Loops: ${cand.network.loops.length} | Crossings: ${cand.network.crossingsCount} | Score: ${cand.score}</text>`);
    svg.push(`  <text x="15" y="62" class="card-meta">Code: [${cand.configStr}]</text>`);

    // Kolam preview inside card
    svg.push(`  <g transform="translate(${(cardW - 20 - 260) / 2}, 75)">`);
    svg.push(renderCandidateSvg(cand, 260, false));
    svg.push(`  </g>`);
    svg.push(`</g>`);
  }

  svg.push(`</svg>`);
  return svg.join('\n');
}

// Standalone execution entry point
if (require.main === module || process.argv[1]?.endsWith('designSearch.ts')) {
  console.log('Starting exhaustive D4 fundamental-domain search across 59,049 candidates...');
  const t0 = Date.now();
  const candidates = runDesignSearch();
  const elapsed = Date.now() - t0;

  console.log(`Search completed in ${elapsed} ms.`);
  console.log(`Found ${candidates.length} candidates meeting all hard filters and alternating weave solvability!`);

  if (candidates.length > 0) {
    const top24 = candidates.slice(0, 24);
    console.log('\nTop 5 Candidates summary:');
    top24.slice(0, 5).forEach((c, idx) => {
      console.log(`Rank #${idx + 1}: ID ${c.id} | Loops: ${c.network.loops.length} | Crossings: ${c.network.crossingsCount} | Score: ${c.score} | Config: ${c.configStr}`);
    });

    const svgContent = buildContactSheetSvg(candidates);
    const outPath = path.resolve(process.cwd(), 'docs/kolam-candidates.svg');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, svgContent, 'utf-8');
    console.log(`\nGenerated contact sheet SVG saved to: ${outPath}`);
  }
}
