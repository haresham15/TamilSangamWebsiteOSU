// scripts/verify-frame-parity.mjs
import assert from "node:assert/strict";
import {
  heroProjection,
  projectWorldToScreen,
  DESIGN_ASPECT,
} from "../src/components/games-hero/camera/projectionMath.ts";

console.log("Verifying Hero 1 Reference Frame Parity (Gate D-01, D-09)...");

const optics = heroProjection(DESIGN_ASPECT);

const LANDMARKS = [
  {
    name: "Wall base at left corner",
    world: { x: -9.5, y: 0.0, z: -35.0 },
    ref: { u: 0.352, v: 0.739 },
    maxDeltaU: 0.015,
    maxDeltaV: 0.020,
  },
  {
    name: "Wall top",
    world: { x: -9.5, y: 2.45, z: -35.0 },
    ref: { v: 0.648 },
    maxDeltaV: 0.020,
  },
  {
    name: "Left SUV centre",
    world: { x: -4.06, y: 1.15, z: -31.0 },
    ref: { u: 0.425 },
    maxDeltaU: 0.015,
  },
  {
    name: "Centre SUV centre",
    world: { x: +0.43, y: 1.15, z: -31.0 },
    ref: { u: 0.508 },
    maxDeltaU: 0.015,
  },
  {
    name: "Right SUV centre",
    world: { x: +4.92, y: 1.15, z: -31.0 },
    ref: { u: 0.591 },
    maxDeltaU: 0.015,
  },
  {
    name: "Left breach hole",
    world: { x: -2.28, y: 1.2, z: -35.0 },
    ref: { u: 0.462 },
    maxDeltaU: 0.015,
  },
  {
    name: "Right breach hole",
    world: { x: +3.24, y: 1.2, z: -35.0 },
    ref: { u: 0.554 },
    maxDeltaU: 0.015,
  },
  {
    name: "Lone coconut palm crown top",
    world: { x: -7.3, y: 7.9, z: -38.0 },
    ref: { u: 0.386, v: 0.443 },
    maxDeltaU: 0.015,
    maxDeltaV: 0.020,
  },
  {
    name: "Marble statue base",
    world: { x: +12.1, y: 0.0, z: -19.7 },
    ref: { u: 0.822, v: 0.780 },
    maxDeltaU: 0.015,
    maxDeltaV: 0.020,
  },
  {
    name: "Marble statue top",
    world: { x: +12.1, y: 3.1, z: -19.7 },
    ref: { v: 0.580 },
    maxDeltaV: 0.020,
  },
  {
    name: "Cream umbrella canopy",
    world: { x: +20.0, y: 2.6, z: -30.0 },
    ref: { u: 0.883, v: 0.640 },
    maxDeltaU: 0.015,
    maxDeltaV: 0.020,
  },
  {
    name: "Fence pier 1 (near)",
    world: { x: -9.5, y: 3.0, z: -16.6 },
    ref: { v: 0.578 },
    maxDeltaV: 0.020,
  },
  {
    name: "Fence pier 3 (corner)",
    world: { x: -9.5, y: 3.0, z: -35.0 },
    ref: { v: 0.621 },
    maxDeltaV: 0.020,
  },
];

let allPassed = true;

for (const lm of LANDMARKS) {
  const projected = projectWorldToScreen(lm.world, optics);

  if (lm.ref.u !== undefined) {
    const deltaU = Math.abs(projected.u - lm.ref.u);
    assert.ok(
      deltaU <= lm.maxDeltaU,
      `Landmark "${lm.name}" u projection failed: projected ${projected.u.toFixed(4)}, expected ${lm.ref.u}, delta ${deltaU.toFixed(4)} > ${lm.maxDeltaU}`
    );
  }

  if (lm.ref.v !== undefined) {
    const deltaV = Math.abs(projected.v - lm.ref.v);
    assert.ok(
      deltaV <= lm.maxDeltaV,
      `Landmark "${lm.name}" v projection failed: projected ${projected.v.toFixed(4)}, expected ${lm.ref.v}, delta ${deltaV.toFixed(4)} > ${lm.maxDeltaV}`
    );
  }

  console.log(
    `PASS: ${lm.name.padEnd(30)} -> u: ${projected.u.toFixed(3)}, v: ${projected.v.toFixed(3)}`
  );
}

console.log("ALL 10+ REFERENCE FRAME LANDMARKS MATCH WITHIN GATED TOLERANCE!");
