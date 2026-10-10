/**
 * Unit Tests for Rest-State Kolam Strand & Lattice Generator (§PRD 12.1)
 */

import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  generatePulliLattice,
  generateStrandWaypoints,
  buildResampledStrand,
  buildStaticKolamMeshes,
  WEAVE_VOID_RADIUS,
} from "./pathBuilder";
import { STRAND_COUNT } from "./flowMath";

test("1. Pulli lattice generation covers vertical range and respects seam/void", () => {
  const lattice = generatePulliLattice(false);
  assert.ok(lattice.dotCount > 100, "Should generate > 100 dots");
  assert.equal(lattice.rightDots.length, lattice.dotCount * 3);
  assert.equal(lattice.leftDots.length, lattice.dotCount * 3);

  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < lattice.dotCount; i++) {
    const rx = lattice.rightDots[i * 3 + 0];
    const ry = lattice.rightDots[i * 3 + 1];
    const lx = lattice.leftDots[i * 3 + 0];
    const ly = lattice.leftDots[i * 3 + 1];

    minY = Math.min(minY, ry);
    maxY = Math.max(maxY, ry);

    // Seam separation
    assert.ok(rx >= 0.199, `Right dot at x=${rx} violates seam separation`);
    assert.equal(lx, -rx, "Left dot X must be exact mirror of Right dot X");
    assert.equal(ly, ry, "Left dot Y must equal Right dot Y");

    // Central void in weave zone
    if (ry >= -4.5 && ry <= 4.5) {
      const dist = Math.hypot(rx, ry);
      assert.ok(
        dist >= WEAVE_VOID_RADIUS - 0.05,
        `Dot at (${rx}, ${ry}) penetrates central void (dist=${dist})`
      );
    }
  }

  assert.ok(maxY >= 4.0, `Max Y (${maxY}) should reach >= 4.0`);
  assert.ok(minY <= -13.0, `Min Y (${minY}) should reach <= -13.0`);
});

test("2. Strand waypoints and resampled C2 splines are smooth, continuous, and kink-free", () => {
  // PRD §3 & §12.1: Turning angle per sample <= 8 deg
  const maxAllowedTurningAngleRad = 8 * (Math.PI / 180) + 1e-4;

  for (let k = 0; k < STRAND_COUNT; k++) {
    const waypoints = generateStrandWaypoints(k, STRAND_COUNT);
    assert.ok(waypoints.length >= 40, `Strand ${k} should have >= 40 waypoints`);

    const strand = buildResampledStrand(waypoints, k, 0.02);
    assert.ok(
      strand.length >= 11.0 && strand.length <= 18.0,
      `Strand ${k} length ${strand.length} must be in [11.0, 18.0]`
    );
    assert.ok(strand.points.length > 500, `Strand ${k} should have > 500 points`);

    // Verify max turning angle between consecutive samples is <= 6 deg (kink test)
    let maxAngleDeg = 0;
    for (let i = 1; i < strand.tangents.length; i++) {
      const dot = strand.tangents[i - 1].dot(strand.tangents[i]);
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
      maxAngleDeg = Math.max(maxAngleDeg, angle * (180 / Math.PI));
      assert.ok(
        angle <= maxAllowedTurningAngleRad,
        `Strand ${k} sample ${i} turning angle ${angle * (180 / Math.PI)} deg exceeds 6 deg`
      );
    }

    // Verify central void clearance at y around 0
    for (const pt of strand.points) {
      if (Math.abs(pt.y) < 1.0) {
        const dist = Math.hypot(pt.x, pt.y);
        assert.ok(
          dist >= WEAVE_VOID_RADIUS - 0.05,
          `Strand ${k} penetrates void at (${pt.x}, ${pt.y}) dist=${dist}`
        );
      }
    }
  }
});

test("3. Static tube geometry builds correctly with zero twist and perfect mirroring", () => {
  const strands = [];
  for (let k = 0; k < STRAND_COUNT; k++) {
    const waypoints = generateStrandWaypoints(k, STRAND_COUNT);
    strands.push(buildResampledStrand(waypoints, k, 0.02));
  }

  const { rightGeometry, leftGeometry } = buildStaticKolamMeshes(strands, 10, 0.07);

  assert.ok(rightGeometry.getAttribute("position"), "Right geometry must have position");
  assert.ok(rightGeometry.getAttribute("normal"), "Right geometry must have normal");
  assert.ok(rightGeometry.getAttribute("aStrand"), "Right geometry must have aStrand");
  assert.ok(rightGeometry.getAttribute("aA"), "Right geometry must have aA");
  assert.ok(rightGeometry.getIndex(), "Right geometry must have index");

  const rPos = rightGeometry.getAttribute("position");
  const lPos = leftGeometry.getAttribute("position");
  assert.equal(rPos.count, lPos.count, "Vertex counts must match");

  // Verify reflection
  for (let i = 0; i < rPos.count; i += 100) {
    const rx = rPos.getX(i);
    const ry = rPos.getY(i);
    const rz = rPos.getZ(i);

    const lx = lPos.getX(i);
    const ly = lPos.getY(i);
    const lz = lPos.getZ(i);

    assert.ok(Math.abs(lx - (-rx)) < 1e-4, `Mirror X mismatch at vertex ${i}`);
    assert.ok(Math.abs(ly - ry) < 1e-4, `Mirror Y mismatch at vertex ${i}`);
    assert.ok(Math.abs(lz - rz) < 1e-4, `Mirror Z mismatch at vertex ${i}`);
  }
});
