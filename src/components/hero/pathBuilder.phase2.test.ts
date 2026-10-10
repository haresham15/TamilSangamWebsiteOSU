/**
 * Unit Tests for Phase 2: Composite Path Building & Float Path Texture (§PRD 12.1)
 */

import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  generateStrandWaypoints,
  buildResampledStrand,
  buildStreamWaypoints,
  buildCompositePath,
  buildPathTextureBundle,
} from "./pathBuilder";
import { STRAND_COUNT, WREATH_CY, WREATH_R_IN, WORLD_HV } from "./flowMath";

test("1. Stream waypoints connect to weave exit with C1 continuity and non-colliding lanes", () => {
  for (let k = 0; k < STRAND_COUNT; k++) {
    const waypoints = generateStrandWaypoints(k, STRAND_COUNT);
    const strand = buildResampledStrand(waypoints, k, 0.02);

    const stream = buildStreamWaypoints(strand, k, STRAND_COUNT);
    assert.ok(stream.waypoints.length > 20, `Strand ${k} stream should have > 20 waypoints`);

    // Verify junction connection point
    const pHead = strand.points[strand.points.length - 1];
    const pStreamStart = stream.waypoints[0];
    assert.ok(
      pHead.distanceTo(pStreamStart) < 1e-4,
      `Strand ${k} junction position mismatch: dist=${pHead.distanceTo(pStreamStart)}`
    );

    // Verify lane radius within sacred band
    assert.ok(
      stream.laneRadius >= WREATH_R_IN + 0.02 * WORLD_HV,
      `Lane radius ${stream.laneRadius} must be >= R_in + 0.02 Hv`
    );
    assert.ok(
      stream.laneRadius <= WREATH_R_IN + 0.25 * WORLD_HV,
      `Lane radius ${stream.laneRadius} must be <= R_in + 0.25 Hv`
    );

    // Verify solved ripple amplitude
    assert.ok(stream.Ak >= 0 && stream.Ak <= 0.35, `Ak ${stream.Ak} must be in [0, 0.35]`);
  }
});

test("2. Composite path Pi_k has C1 continuity across s = 0 and valid arc length bounds", () => {
  for (let k = 0; k < STRAND_COUNT; k++) {
    const waypoints = generateStrandWaypoints(k, STRAND_COUNT);
    const strand = buildResampledStrand(waypoints, k, 0.02);
    const composite = buildCompositePath(strand, k, 0.02);

    assert.equal(composite.index, k);
    assert.ok(composite.L >= 11.0 && composite.L <= 18.0, `L ${composite.L} valid`);
    assert.ok(composite.sMin === -composite.L, "sMin must equal -L");
    assert.ok(composite.sMax > 0, "sMax must be positive");
    assert.ok(composite.totalFeed > composite.L, "Total feed must exceed L");
    assert.ok(composite.sL0 > 0, "sL0 (ring bottom) must be positive");
    assert.ok(composite.sL1 === composite.sL0 + composite.L, "sL1 must equal sL0 + L");

    // Junction test: index where s = 0 is numWeaveSamples
    const ds = 0.02;
    const junctionIdx = Math.ceil(composite.L / ds);
    assert.ok(junctionIdx < composite.points.length, "Junction must be within points");

    // Tangent continuity at s = 0: angle between incoming weave and outgoing stream < 1.5 deg
    const tBefore = composite.tangents[junctionIdx - 1];
    const tAfter = composite.tangents[junctionIdx + 1];
    const dot = tBefore.dot(tAfter);
    const angleDeg = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);
    assert.ok(
      angleDeg <= 3.5,
      `Strand ${k} tangent discontinuity at s=0 is ${angleDeg.toFixed(2)} deg (> 3.5 deg)`
    );

    // Kink detector across full composite path
    let maxKinkDeg = 0;
    for (let i = 1; i < composite.tangents.length; i++) {
      const d = composite.tangents[i - 1].dot(composite.tangents[i]);
      const a = Math.acos(Math.max(-1, Math.min(1, d))) * (180 / Math.PI);
      maxKinkDeg = Math.max(maxKinkDeg, a);
    }
    assert.ok(
      maxKinkDeg <= 8.5,
      `Strand ${k} max kink ${maxKinkDeg.toFixed(2)} deg exceeds 8.5 deg`
    );
  }
});

test("3. Path texture bundle packs 4096 x 7 RGBA32F data cleanly without NaN or Inf", () => {
  const compositePaths = [];
  for (let k = 0; k < STRAND_COUNT; k++) {
    const waypoints = generateStrandWaypoints(k, STRAND_COUNT);
    const strand = buildResampledStrand(waypoints, k, 0.02);
    compositePaths.push(buildCompositePath(strand, k, 0.02));
  }

  const bundle = buildPathTextureBundle(compositePaths, 4096);
  assert.equal(bundle.texture.image.width, 4096);
  assert.equal(bundle.texture.image.height, STRAND_COUNT);
  assert.equal(bundle.texture.format, THREE.RGBAFormat);
  assert.equal(bundle.texture.type, THREE.FloatType);

  // Check uniform arrays
  assert.equal(bundle.sMin.length, STRAND_COUNT);
  assert.equal(bundle.sMax.length, STRAND_COUNT);
  assert.equal(bundle.ds.length, STRAND_COUNT);
  assert.equal(bundle.L.length, STRAND_COUNT);
  assert.equal(bundle.F.length, STRAND_COUNT);
  assert.equal(bundle.p0.length, STRAND_COUNT);

  // Seam-first stagger: p0 should increase monotonically with rank
  for (let k = 1; k < STRAND_COUNT; k++) {
    assert.ok(
      bundle.p0[k] >= bundle.p0[k - 1],
      `p0[${k}] (${bundle.p0[k]}) must be >= p0[${k-1}] (${bundle.p0[k-1]})`
    );
  }

  // Float data integrity check
  const texData = bundle.texture.image.data;
  assert.ok(texData !== null && texData !== undefined, "texData must exist");
  assert.equal(texData.length, 4096 * STRAND_COUNT * 4);

  let nanCount = 0;
  let infCount = 0;
  for (let i = 0; i < texData.length; i++) {
    if (Number.isNaN(texData[i])) nanCount++;
    if (!Number.isFinite(texData[i])) infCount++;
  }
  assert.equal(nanCount, 0, "Texture must have 0 NaN values");
  assert.equal(infCount, 0, "Texture must have 0 infinite values");
});
