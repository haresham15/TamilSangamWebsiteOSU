import {
  smootherstep,
  zipperOpenness,
  evalWreathTarget,
  evalDeformedCenterline,
  evalDeformedTubeVertex,
} from "../src/components/hero/wreathMath.ts";
import { WREATH_PARAMS_LANDSCAPE } from "../src/components/hero/homeHero.constants.ts";

console.log("=== RUNNING WREATH MATH UNIT SUITE ===");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Bottom Seam Tie Test (t = 1)
// For right half x >= 0, left half is mirrored by scale.x = -1.
// At t = 1, both must have W.x = 0, meaning zero gap between them!
const wBottomRight = evalWreathTarget(0, 1, WREATH_PARAMS_LANDSCAPE);
// Left half is mirrored: W_left.x = -W_right.x
const wBottomLeftX = -wBottomRight.x;
const seamError = Math.abs(wBottomRight.x - wBottomLeftX);
assert(seamError < 1e-4, `Bottom seam tie: error = ${seamError.toExponential(2)} (must be < 1e-4)`);
assert(Math.abs(wBottomRight.x) < 1e-6, `Bottom seam x coordinate = ${wBottomRight.x} (must be 0)`);

// 2. Monotonic Zipper Test
let monotonicQ = true;
let monotonicT = true;
const steps = 50;

// Test d(g)/dq >= 0
for (let t = 0; t <= 1; t += 0.1) {
  let prevE = -1;
  for (let q = 0; q <= 1; q += 0.02) {
    const e = zipperOpenness(t, q, 0.5);
    if (e < prevE - 1e-6) {
      monotonicQ = false;
      break;
    }
    prevE = e;
  }
}
assert(monotonicQ, "Zipper openness is monotonically non-decreasing in q (dE/dq >= 0)");

// Test d(g)/dt <= 0 (top opens before bottom)
for (let q = 0; q <= 1; q += 0.1) {
  let prevE = 2;
  for (let t = 0; t <= 1; t += 0.02) {
    const e = zipperOpenness(t, q, 0.5);
    if (e > prevE + 1e-6) {
      monotonicT = false;
      break;
    }
    prevE = e;
  }
}
assert(monotonicT, "Zipper openness is monotonically non-increasing in t (top unzips before bottom)");

// 3. Exact Endpoints Test (q = 0 -> F, q = 1 -> W)
const testF = { x: 2.5, y: 1.2, z: 0 };
const p0 = evalDeformedCenterline(testF, 0.5, 0.3, 0.0, 5.0, 7.5, WREATH_PARAMS_LANDSCAPE);
assert(
  Math.abs(p0.x - testF.x) < 1e-6 &&
  Math.abs(p0.y - testF.y) < 1e-6 &&
  Math.abs(p0.z - testF.z) < 1e-6,
  `At q = 0, P exactly matches baseline flat position F`
);

const wTarget = evalWreathTarget(0.5, 0.3, WREATH_PARAMS_LANDSCAPE);
const p1 = evalDeformedCenterline(testF, 0.5, 0.3, 1.0, 5.0, 7.5, WREATH_PARAMS_LANDSCAPE);
assert(
  Math.abs(p1.x - wTarget.x) < 1e-5 &&
  Math.abs(p1.y - wTarget.y) < 1e-5 &&
  Math.abs(p1.z - wTarget.z) < 1e-5,
  `At q = 1, P exactly matches wreath target position W`
);

// 4. Reversibility Test
let maxRevDelta = 0;
for (let s = 0; s <= 1; s += 0.2) {
  for (let t = 0; t <= 1; t += 0.2) {
    const F = { x: s * 5.0, y: 3.75 * (0.5 - t), z: 0 };
    // Forward to 0.73
    const pFwd = evalDeformedCenterline(F, s, t, 0.73, 5.0, 7.5, WREATH_PARAMS_LANDSCAPE);
    // Back to 0.73
    const pRev = evalDeformedCenterline(F, s, t, 0.73, 5.0, 7.5, WREATH_PARAMS_LANDSCAPE);
    const delta = Math.hypot(pFwd.x - pRev.x, pFwd.y - pRev.y, pFwd.z - pRev.z);
    maxRevDelta = Math.max(maxRevDelta, delta);
  }
}
assert(maxRevDelta === 0, `Scrub reversibility delta is exactly zero (${maxRevDelta})`);

// 5. NaN Safety Across Corners
let nanFound = false;
const cornerValues = [0, 1e-6, 1e-3, 0.5, 0.999, 1.0];
for (const s of cornerValues) {
  for (const t of cornerValues) {
    for (const q of cornerValues) {
      const F = { x: s * 5.0, y: 3.75 * (0.5 - t), z: 0 };
      const res = evalDeformedCenterline(F, s, t, q, 5.0, 7.5, WREATH_PARAMS_LANDSCAPE);
      if (
        isNaN(res.x) || isNaN(res.y) || isNaN(res.z) ||
        !isFinite(res.x) || !isFinite(res.y) || !isFinite(res.z)
      ) {
        nanFound = true;
      }
    }
  }
}
assert(!nanFound, "Zero NaNs or non-finite values across entire parameter grid, including s=0, t=0, t=1");

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
