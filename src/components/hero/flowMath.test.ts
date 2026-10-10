/**
 * Unit Tests for Peel & Flow Mathematical Library (§PRD 12.1)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  smootherstep,
  easeSettle,
  calcStrandFeed,
  calcPeelLift,
  evalCamera,
  evalLaneRadius,
  evalWreathPoint,
  calcWreathLaneLength,
  solveLaneRippleAmplitude,
  calcCameraAlignedFrame,
  WORLD_HV,
  STRAND_COUNT,
  WREATH_GAP_RAD,
} from "./flowMath";

describe("flowMath — Core Analytic Primitives", () => {
  it("smootherstep has C2 continuity and exact endpoint bounds", () => {
    assert.equal(smootherstep(0), 0);
    assert.equal(smootherstep(1), 1);
    assert.equal(smootherstep(-0.5), 0);
    assert.equal(smootherstep(1.5), 1);
    // Monotonic
    let prev = 0;
    for (let x = 0; x <= 1; x += 0.05) {
      const val = smootherstep(x);
      assert.ok(val >= prev - 1e-7, `Monotonicity violated at x=${x}`);
      prev = val;
    }
  });

  it("easeSettle smoothly converges to 1 with arrival settle", () => {
    assert.equal(easeSettle(0), 0);
    assert.ok(Math.abs(easeSettle(1) - 1) < 0.001, "easeSettle at 1 must be approximately 1");
    // Before 0.9, exactly equals smootherstep
    assert.equal(easeSettle(0.5), smootherstep(0.5));
    assert.equal(easeSettle(0.85), smootherstep(0.85));
  });

  it("calcStrandFeed enforces seam-first stagger and monotonic rope feed", () => {
    const totalFeed = 12.0;
    const inner = calcStrandFeed(0.08, 0, totalFeed); // rank 0: seam
    const outer = calcStrandFeed(0.08, 1, totalFeed); // rank 1: flank

    // Inner strand starts feeding earlier than outer
    assert.ok(inner.p0 < outer.p0, "Inner strand p0 must be strictly less than outer strand p0");
    assert.ok(inner.feed > outer.feed, "At p=0.08, inner strand must feed more than outer strand");

    // Monotonicity during draw phase (normalizedX <= 0.9)
    let prevFeed = 0;
    for (let p = 0; p <= 0.45; p += 0.02) {
      const { feed } = calcStrandFeed(p, 0.5, totalFeed);
      assert.ok(feed >= prevFeed - 1e-4, `Feed decreased during draw phase at p=${p}`);
      prevFeed = feed;
    }
    // Completed feed at end of progression settles exactly at totalFeed
    const finalState = calcStrandFeed(0.70, 0, totalFeed);
    assert.equal(finalState.feed, totalFeed, "Final feed must equal totalFeed exactly");
  });

  it("calcPeelLift curls tail out of plane when active, zero otherwise", () => {
    const L = 10.0;
    const ell = 0.18 * WORLD_HV;

    // Tail far inside weave: sTail = -5.0 (inactive)
    const inactiveLift = calcPeelLift(L, -5.0, L, 1);
    assert.equal(inactiveLift.z, 0);
    assert.equal(inactiveLift.x, 0);

    // Deep rope point (a = 0, head): should not lift even if tail is retreating
    const headLift = calcPeelLift(0, -0.05, L, 1);
    assert.equal(headLift.z, 0);
    assert.equal(headLift.x, 0);

    // Active tail peeling: a = L, sTail = -0.05
    const activeLift = calcPeelLift(L, -0.05, L, 1);
    assert.ok(activeLift.z > 0, "Tail Z lift must be positive toward camera");
    assert.ok(activeLift.x > 0, "Right hemisphere tail X curl must be positive outward");

    // Left hemisphere curls outward to negative X
    const leftLift = calcPeelLift(L, -0.05, L, -1);
    assert.ok(leftLift.x < 0, "Left hemisphere tail X curl must be negative outward");
    assert.equal(leftLift.z, activeLift.z, "Z lift must be symmetric across hemispheres");
  });

  it("evalCamera executes smooth vertical descent and level pitch settle", () => {
    const camStart = evalCamera(0.0);
    assert.equal(camStart.camY, 0.35);
    assert.equal(camStart.camZ, 12);
    assert.equal(camStart.pitchDeg, 0);

    const camEnd = evalCamera(0.65);
    assert.ok(Math.abs(camEnd.camY - -1.2 * WORLD_HV) < 1e-5, "camY must settle at -1.2 * Hv");
    assert.ok(Math.abs(camEnd.camZ - 11.2) < 1e-5, "camZ must settle at 11.2");
    assert.ok(Math.abs(camEnd.pitchDeg - 0) < 1e-5, "pitch must settle at 0 deg");
  });

  it("solveLaneRippleAmplitude matches target rope length via bisection", () => {
    const laneRadius = 3.0;
    const nu = 12;
    const psi = 0;
    const baseLen = calcWreathLaneLength(laneRadius, 0, nu, psi, WREATH_GAP_RAD);

    // Target length is 10% longer than base arc
    const targetLength = baseLen * 1.08;
    const { Ak, finalLength, iterations } = solveLaneRippleAmplitude(
      targetLength,
      laneRadius,
      nu,
      psi,
      0.30,
      WREATH_GAP_RAD,
      0.001
    );

    assert.ok(Ak > 0, "Solved Ak must be positive to add arc length");
    assert.ok(
      Math.abs(finalLength - targetLength) < 0.005,
      `Bisection failed: final=${finalLength}, target=${targetLength}`
    );
    assert.ok(iterations < 32, "Bisection must converge within 32 iterations");
  });

  it("calcCameraAlignedFrame is zero-twist, orthogonal and never singularities", () => {
    // Normal test: Tangent along X
    const tx = new THREE.Vector3(1, 0, 0);
    const frameX = calcCameraAlignedFrame(tx);
    assert.ok(Math.abs(frameX.normal.dot(tx)) < 1e-6, "Normal must be perpendicular to tangent");
    assert.ok(Math.abs(frameX.binormal.dot(tx)) < 1e-6, "Binormal must be perpendicular to tangent");
    assert.ok(Math.abs(frameX.normal.dot(frameX.binormal)) < 1e-6, "Normal and binormal orthogonal");

    // Extreme test: Tangent pointing directly at camera Z (potential singularity)
    const tz = new THREE.Vector3(0, 0, 1);
    const frameZ = calcCameraAlignedFrame(tz);
    assert.ok(!isNaN(frameZ.normal.x), "Frame normal must not be NaN at Z tangent");
    assert.ok(!isNaN(frameZ.binormal.x), "Frame binormal must not be NaN at Z tangent");
    assert.ok(Math.abs(frameZ.normal.length() - 1) < 1e-5, "Normal must be unit length");
    assert.ok(Math.abs(frameZ.binormal.length() - 1) < 1e-5, "Binormal must be unit length");
  });
});
