// src/gallery/ramp.test.ts
import assert from "node:assert/strict";
import {
  solvePeak,
  makeRamp,
  calculateCameraS,
  RAMP,
  ERA2_P0,
  ERA2_P1,
  ERA2_DELTA_P,
} from "./ramp";

console.log("=== Running Phase 3 Kinematic Speed Ramp Tests (§5.4) ===");

// 1. Solve Peak P verification
const P = solvePeak(RAMP);
console.log(`1. Solved Peak P = ${P.toFixed(4)} (Expected: 1.6 - 1.8)`);
assert(P >= 1.6 && P <= 1.8, `P must be between 1.6 and 1.8, got ${P}`);

// 2. Ramp instance creation
const ramp = makeRamp(RAMP);
assert.equal(ramp.P, P);

// 3. Boundary displacement F(0) = 0, F(1) = 1 within 1e-4
const disp0 = ramp.disp(0);
const disp1 = ramp.disp(1);
console.log(`2. Displacement Boundaries: disp(0) = ${disp0.toFixed(6)}, disp(1) = ${disp1.toFixed(6)}`);
assert(Math.abs(disp0) < 1e-4, `disp(0) must be ~0, got ${disp0}`);
assert(Math.abs(disp1 - 1.0) < 1e-4, `disp(1) must be ~1, got ${disp1}`);

// 4. Monotonicity of displacement
let prevDisp = -1;
let isMonotonic = true;
for (let i = 0; i <= 200; i++) {
  const x = i / 200;
  const d = ramp.disp(x);
  if (d < prevDisp) {
    isMonotonic = false;
    break;
  }
  prevDisp = d;
}
assert(isMonotonic, "Displacement disp(x) must be strictly monotonic non-decreasing");
console.log("3. Monotonicity: PASS (disp(x) monotonically increases from 0 to 1)");

// 5. Speed profile continuity and bounds: v(0) = 1.0, v(1) = 1.0, 0.15 <= v <= 2.0
const v0 = ramp.speed(0);
const v1 = ramp.speed(1);
console.log(`4. Boundary Speed Continuity: v(0) = ${v0.toFixed(4)}, v(1) = ${v1.toFixed(4)}`);
assert(Math.abs(v0 - 1.0) < 1e-4, `v(0) must be 1.0, got ${v0}`);
assert(Math.abs(v1 - 1.0) < 1e-4, `v(1) must be 1.0, got ${v1}`);

let minSpeed = Infinity;
let maxSpeed = -Infinity;
for (let i = 0; i <= 200; i++) {
  const s = ramp.speed(i / 200);
  if (s < minSpeed) minSpeed = s;
  if (s > maxSpeed) maxSpeed = s;
}
console.log(`5. Speed Bounds: min = ${minSpeed.toFixed(4)} >= 0.15, max = ${maxSpeed.toFixed(4)} <= 2.0`);
assert(minSpeed >= 0.15, `min speed must be >= 0.15, got ${minSpeed}`);
assert(maxSpeed <= 2.0, `max speed must be <= 2.0, got ${maxSpeed}`);

// 6. Brake span check: brake in x is 0.06 -> scroll delta = 0.06 * ERA2_DELTA_P = ~0.0199 <= 0.02
const brakeScrollDelta = RAMP.brake * ERA2_DELTA_P;
console.log(`6. Brake Duration in Scroll Space: Δp = ${brakeScrollDelta.toFixed(4)} <= 0.02`);
assert(brakeScrollDelta <= 0.0205, `Brake duration in scroll space must be <= ~0.02, got ${brakeScrollDelta}`);

// 7. Landmark preservation: Fret 5 (p = 0.3345) and Fret 12 (p = 0.6667)
const sFret5 = 25.0846; // 100 * (1 - 2^(-5/12))
const sFret12 = 50.0;   // 100 * (1 - 2^(-12/12))
const atFret5 = calculateCameraS(ERA2_P0, { fret5S: sFret5, fret12S: sFret12 });
const atFret12 = calculateCameraS(ERA2_P1, { fret5S: sFret5, fret12S: sFret12 });

console.log(`7. Landmark Fret 5: s = ${atFret5.s.toFixed(4)} (Expected: ${sFret5.toFixed(4)}, Δ = ${Math.abs(atFret5.s - sFret5).toFixed(6)})`);
console.log(`   Landmark Fret 12: s = ${atFret12.s.toFixed(4)} (Expected: ${sFret12.toFixed(4)}, Δ = ${Math.abs(atFret12.s - sFret12).toFixed(6)})`);
assert(Math.abs(atFret5.s - sFret5) < 0.01, "Fret 5 distance must match fret table within 0.01 su");
assert(Math.abs(atFret12.s - sFret12) < 0.01, "Fret 12 distance must match fret table within 0.01 su");

// 8. Reduced Motion test returns linear mapping
const reducedP = 0.52;
const reducedRes = calculateCameraS(reducedP, { reducedMotion: true, maxS: 75.0 });
const expectedLinear = 0.52 * 75.0; // 39.0
console.log(`8. Reduced Motion Linear Fallback: s = ${reducedRes.s.toFixed(4)} (Expected: ${expectedLinear.toFixed(4)})`);
assert(Math.abs(reducedRes.s - expectedLinear) < 1e-4, "Reduced motion must return strict linear s");
assert.equal(reducedRes.speed, 1.0, "Reduced motion speed must always be 1.0");

console.log("=== All Kinematic Speed Ramp Tests Passed Cleanly ===");
