/**
 * buildCurve.test.ts
 * 
 * Unit tests for high-precision curve sampling, Laplacian smoothing,
 * parallel transport frames, and 3D tube geometry generation (§PRD Side Kolams §5.2).
 */

import { test, describe } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  gridToLocal,
  sampleSegment,
  smoothClosedCurve,
  buildParallelTransportTube,
  buildKolamMesh,
} from '../buildCurve';
import {
  expandFundamentalDomain,
  traceGridNetwork,
  ArcSegment,
  hTerminalId,
  vTerminalId,
} from '../tileGrammar';
import { solveAlternatingWeave } from '../overUnder';
import { KOLAM_L_DESIGN, KOLAM_R_DESIGN } from '../designs';

describe('buildCurve — 3D Geometry and Parallel Transport Engine', () => {
  test('gridToLocal maps coordinates accurately with and without 45° rotation', () => {
    const d = 1.0;
    // Center (4, 4) should map to (0, 0)
    const [c0x, c0y] = gridToLocal(4.0, 4.0, d, false);
    assert.ok(Math.abs(c0x) < 1e-6);
    assert.ok(Math.abs(c0y) < 1e-6);

    const [r0x, r0y] = gridToLocal(4.0, 4.0, d, true);
    assert.ok(Math.abs(r0x) < 1e-6);
    assert.ok(Math.abs(r0y) < 1e-6);

    // Coordinate (5, 4) in unrotated space is (1, 0)
    const [u1x, u1y] = gridToLocal(5.0, 4.0, d, false);
    assert.ok(Math.abs(u1x - 1.0) < 1e-6);
    assert.ok(Math.abs(u1y - 0.0) < 1e-6);
  });

  test('sampleSegment generates valid, non-empty polylines without NaN', () => {
    const d = 1.0;
    const ds = 0.04;

    const straightSeg: ArcSegment = {
      from: hTerminalId(3, 4),
      to: hTerminalId(3, 3),
      centerDot: [3, 3],
      type: 'straight',
    };
    const straightPts = sampleSegment(straightSeg, d, ds, true);
    assert.ok(straightPts.length >= 4);
    for (const [x, y] of straightPts) {
      assert.ok(!isNaN(x) && !isNaN(y));
    }

    const arcSeg: ArcSegment = {
      from: hTerminalId(0, 1),
      to: vTerminalId(0, 0),
      centerDot: [0, 1],
      type: 'arc_ccw',
    };
    const arcPts = sampleSegment(arcSeg, d, ds, true);
    assert.ok(arcPts.length >= 6);
    for (const [x, y] of arcPts) {
      assert.ok(!isNaN(x) && !isNaN(y));
    }
  });

  test('smoothClosedCurve preserves closed loop topology and removes sharp jumps', () => {
    // Generate a square with sharp 90-degree corners
    const square: [number, number][] = [
      [0, 0], [1, 0], [2, 0],
      [2, 1], [2, 2],
      [1, 2], [0, 2],
      [0, 1],
    ];

    const smoothed = smoothClosedCurve(square, 2, 0.25);
    assert.equal(smoothed.length, square.length);

    // Corner at (2, 2) should round inward slightly
    const origCorner = square[4];
    const smoothCorner = smoothed[4];
    assert.ok(smoothCorner[0] < origCorner[0]);
    assert.ok(smoothCorner[1] < origCorner[1]);
  });

  test('buildParallelTransportTube creates valid BufferGeometry with normals and bounding sphere', () => {
    const points = [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0.1 },
      { x: 2, y: 1, z: 0 },
      { x: 2, y: 2, z: -0.1 },
    ];

    const geo = buildParallelTransportTube(points, 0.05, 8, false);
    assert.ok(geo.getAttribute('position'));
    assert.ok(geo.getAttribute('normal'));
    assert.ok(geo.getIndex());
    assert.ok((geo.getIndex()?.count || 0) > 0);
    assert.ok(geo.boundingSphere !== null);
  });

  test('buildKolamMesh generates valid geometries for Kolam L and Kolam R within triangle budget', () => {
    const d = 0.035; // typical viewport metric size

    // Test Kolam L
    const gridL = expandFundamentalDomain(KOLAM_L_DESIGN.config);
    const netL = traceGridNetwork(gridL);
    const assignL = solveAlternatingWeave(gridL, netL);
    assert.ok(assignL.isValid, 'Kolam L weave must be valid');

    const meshBundleL = buildKolamMesh(gridL, netL, assignL, d, true, true);
    assert.ok(meshBundleL.mainTubeGeometry);
    assert.ok(meshBundleL.totalTriangles > 0);
    assert.ok(
      meshBundleL.totalTriangles <= 25000,
      `Kolam L triangle count ${meshBundleL.totalTriangles} exceeds 25,000 budget`
    );
    assert.equal(meshBundleL.apexBeadPositions.length, 16, 'Kolam L must have 16 perimeter apex beads');

    // Test Kolam R
    const gridR = expandFundamentalDomain(KOLAM_R_DESIGN.config);
    const netR = traceGridNetwork(gridR);
    const assignR = solveAlternatingWeave(gridR, netR);
    assert.ok(assignR.isValid, 'Kolam R weave must be valid');

    const meshBundleR = buildKolamMesh(gridR, netR, assignR, d, true, true);
    assert.ok(meshBundleR.mainTubeGeometry);
    assert.ok(meshBundleR.totalTriangles > 0);
    assert.ok(
      meshBundleR.totalTriangles <= 25000,
      `Kolam R triangle count ${meshBundleR.totalTriangles} exceeds 25,000 budget`
    );
    assert.equal(meshBundleR.apexBeadPositions.length, 16, 'Kolam R must have 16 perimeter apex beads');
  });
});
