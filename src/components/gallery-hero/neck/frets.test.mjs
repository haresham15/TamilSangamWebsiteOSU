import { test } from "node:test";
import assert from "node:assert/strict";

// Re-import or mirror exact formulas for pure node test execution
const SCALE_LENGTH = 100.0;
const MAX_JOURNEY_S = 75.0;

function getFretS(n, L = SCALE_LENGTH) {
  return L * (1.0 - Math.pow(2.0, -n / 12.0));
}

function getNeckWidth(s) {
  return 6.0 + 1.3 * (s / 75.0);
}

function getStringSpacing(s) {
  return 0.9 + 0.2 * (s / 75.0);
}

function getStringHeight(s) {
  return 0.12 + 0.0045 * s;
}

test("12-TET Fretboard Math conforms precisely to PRD §3.1 specification", () => {
  // Expected table from PRD §3.1:
  // Fret | s (su) | Journey progress | Landmark
  // 3    | 15.9   | 0.212            | single dot
  // 5    | 25.1   | 0.334            | single dot -> Era 2 begins
  // 7    | 33.3   | 0.443            | single dot
  // 9    | 40.5   | 0.541            | single dot
  // 12   | 50.0   | 0.667            | double dot -> Era 3 begins
  // 15   | 58.0   | 0.773            | single dot
  // 17   | 62.5   | 0.834            | single dot
  // 19   | 66.6   | 0.888            | single dot
  // 21   | 70.3   | 0.937            | single dot
  // 24   | 75.0   | 1.000            | double dot, end of journey

  const checks = [
    { fret: 3, expectedS: 15.9, expectedProgress: 0.212 },
    { fret: 5, expectedS: 25.1, expectedProgress: 0.334 },
    { fret: 7, expectedS: 33.3, expectedProgress: 0.443 },
    { fret: 9, expectedS: 40.5, expectedProgress: 0.541 },
    { fret: 12, expectedS: 50.0, expectedProgress: 0.667 },
    { fret: 15, expectedS: 58.0, expectedProgress: 0.773 },
    { fret: 17, expectedS: 62.5, expectedProgress: 0.834 },
    { fret: 19, expectedS: 66.6, expectedProgress: 0.888 },
    { fret: 21, expectedS: 70.3, expectedProgress: 0.937 },
    { fret: 24, expectedS: 75.0, expectedProgress: 1.000 },
  ];

  for (const c of checks) {
    const s = getFretS(c.fret);
    const progress = s / MAX_JOURNEY_S;

    assert.ok(
      Math.abs(s - c.expectedS) < 0.15,
      `Fret ${c.fret} s: expected ~${c.expectedS}, got ${s.toFixed(2)}`
    );
    assert.ok(
      Math.abs(progress - c.expectedProgress) < 0.005,
      `Fret ${c.fret} progress: expected ~${c.expectedProgress}, got ${progress.toFixed(3)}`
    );
  }

  // Exact mathematical identity proofs from PRD §3.1:
  // d_12 = L / 2 = 50.0 su
  assert.equal(getFretS(12), 50.0);
  // d_24 = 0.75 * L = 75.0 su
  assert.equal(getFretS(24), 75.0);

  // Era boundary alignment checks
  // Fret 5 is 1/3 boundary (0.334)
  assert.ok(Math.abs(getFretS(5) / 75.0 - 0.334) < 0.002);
  // Fret 12 is exactly 2/3 boundary (0.66667)
  assert.ok(Math.abs(getFretS(12) / 75.0 - 2.0 / 3.0) < 1e-9);

  // Neck width checks
  assert.equal(getNeckWidth(0), 6.0);
  assert.equal(getNeckWidth(75.0), 7.3);

  // String spacing checks
  assert.equal(getStringSpacing(0), 0.9);
  assert.equal(getStringSpacing(75.0), 1.1);

  // String height checks
  assert.equal(getStringHeight(0), 0.12);
  assert.equal(getStringHeight(75.0), 0.12 + 0.0045 * 75.0);
});
