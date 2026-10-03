import test from "node:test";
import assert from "node:assert/strict";

const GUITAR_STRINGS = [
  { index: 0, note: "E2", fundamentalHz: 2.00, isWound: true, radius: 0.090, gain: 1.0, phase: 0.0 },
  { index: 1, note: "A2", fundamentalHz: 2.67, isWound: true, radius: 0.075, gain: 0.95, phase: 1.12 },
  { index: 2, note: "D3", fundamentalHz: 3.56, isWound: true, radius: 0.060, gain: 0.90, phase: 2.34 },
  { index: 3, note: "G3", fundamentalHz: 4.76, isWound: false, radius: 0.045, gain: 0.80, phase: 3.45 },
  { index: 4, note: "B3", fundamentalHz: 5.99, isWound: false, radius: 0.035, gain: 0.70, phase: 4.56 },
  { index: 5, note: "E4", fundamentalHz: 8.00, isWound: false, radius: 0.028, gain: 0.60, phase: 5.67 },
];

function smoothstep(edge0, edge1, x) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0.0), 1.0);
  return t * t * (3.0 - 2.0 * t);
}

function stringY(stringIndex, s, t, state = {}) {
  const spec = GUITAR_STRINGS[stringIndex] || GUITAR_STRINGS[0];
  const uL = state.scaleLength ?? 100.0;
  const uMaxAmp = state.maxAmp ?? 0.55;
  const uPluckX = state.pluckX ?? 0.15;
  const uDamperPos = state.damperPos ?? -1.0;
  const uDamperK = state.damperK ?? 0.0;
  const uLoadPos = state.loadPos ?? 75.5;
  const uLoadK = state.loadK ?? 0.0;
  const uLoadDepth = state.loadDepth ?? 0.35;
  const aEnergy = state.energy ?? 0.0;
  const aPluckT = state.pluckT ?? -1.0;
  const aPluckAmp = state.pluckAmp ?? 0.0;
  const aFreq = spec.fundamentalHz;
  const aPhase = spec.phase;

  const u = Math.min(Math.max(s / uL, 0.0), 1.0);
  let y = 0.0;

  // 1) Driven standing wave (scroll energy). Weights per harmonic.
  if (aEnergy > 0.0001) {
    let driven = 0.0;
    for (let n = 1; n <= 3; n++) {
      const fn = n;
      const wn = n === 1 ? 1.0 : n === 2 ? 0.35 : 0.15;
      driven +=
        wn *
        Math.sin(Math.PI * fn * u) *
        Math.sin(2.0 * Math.PI * aFreq * fn * t + aPhase * fn);
    }
    y += driven * aEnergy;
  }

  // 2) Plucked component: decaying modes
  if (aPluckT >= 0.0) {
    let pluck = 0.0;
    for (let n = 1; n <= 3; n++) {
      const fn = n;
      const a = Math.sin(Math.PI * fn * uPluckX) / (fn * fn);
      const w = 2.0 * Math.PI * aFreq * fn;
      const decay = Math.exp(-aPluckT * (1.6 + 0.9 * (fn - 1.0)));
      pluck += aPluckAmp * a * Math.sin(Math.PI * fn * u) * Math.sin(w * aPluckT) * decay;
    }
    y += pluck;
  }

  // 3) Damper: tags pin the string where they touch it
  if (uDamperPos >= 0.0 && uDamperK > 0.0) {
    const dd = Math.abs(s - uDamperPos);
    const ss = smoothstep(0.0, 14.0, dd);
    const factor = (1.0 - uDamperK) + ss * uDamperK;
    y *= factor;
  }

  // 4) Static load: the string sags under the tags
  if (uLoadK > 0.0) {
    const dist = (s - uLoadPos) / 2.2;
    y -= uLoadDepth * uLoadK * Math.exp(-dist * dist);
  }

  return y * uMaxAmp;
}

class TestEnergyModel {
  constructor() {
    this.vSmooth = 0.0;
    this.energy = new Float32Array(6);
    this.gains = [1.0, 0.95, 0.90, 0.80, 0.70, 0.60];
  }

  update(dt, vRaw, damperK = 0.0) {
    const alphaV = 1.0 - Math.exp(-Math.min(dt, 0.1) / 0.08);
    this.vSmooth += (vRaw - this.vSmooth) * alphaV;
    const drive = 1.0 - Math.exp(-Math.abs(this.vSmooth) / 2500.0);

    for (let i = 0; i < 6; i++) {
      const target = drive * this.gains[i] * (1.0 - damperK);
      const tau = target > this.energy[i] ? 0.05 : Math.max(0.08, 0.55 - 0.35 * damperK);
      const alphaE = 1.0 - Math.exp(-Math.min(dt, 0.1) / tau);
      this.energy[i] += (target - this.energy[i]) * alphaE;
    }
  }
}

test("String Physics & CPU Mirror conforms to PRD §3.3 & §3.4 specification", async (t) => {
  await t.test("Guitar strings have exact 6-string specification", () => {
    assert.equal(GUITAR_STRINGS.length, 6);
    assert.equal(GUITAR_STRINGS[0].note, "E2");
    assert.equal(GUITAR_STRINGS[0].fundamentalHz, 2.00);
    assert.equal(GUITAR_STRINGS[0].isWound, true);
    assert.equal(GUITAR_STRINGS[0].radius, 0.090);

    assert.equal(GUITAR_STRINGS[5].note, "E4");
    assert.equal(GUITAR_STRINGS[5].fundamentalHz, 8.00);
    assert.equal(GUITAR_STRINGS[5].isWound, false);
    assert.equal(GUITAR_STRINGS[5].radius, 0.028);
  });

  await t.test("Rest state returns exactly 0.0 displacement across entire length", () => {
    for (let i = 0; i < 6; i++) {
      for (let s = 0; s <= 100; s += 10) {
        const y = stringY(i, s, 0.0, { energy: 0.0, pluckT: -1.0 });
        assert.equal(y, 0.0);
      }
    }
  });

  await t.test("Displacement under maximum energy is bounded by harmonic sum (1.50 * uMaxAmp)", () => {
    const maxAmp = 0.55;
    const theoreticalMax = 1.50 * maxAmp; // sum of harmonic weights: 1.0 + 0.35 + 0.15 = 1.50
    for (let s = 1; s < 100; s += 5) {
      for (let tSec = 0; tSec < 2.0; tSec += 0.05) {
        const y = stringY(0, s, tSec, { energy: 1.0, maxAmp });
        assert.ok(
          Math.abs(y) <= theoreticalMax + 1e-6,
          `Displacement ${y} exceeds theoretical max ${theoreticalMax} at s=${s}, t=${tSec}`
        );
      }
    }
  });

  await t.test("Pluck decays exponentially over time", () => {
    const s = 15.0; // Near 0.15 pluck point
    const amp0 = Math.abs(stringY(0, s, 0.1, { pluckT: 0.1, pluckAmp: 1.0, energy: 0.0 }));
    const ampLater = Math.abs(stringY(0, s, 2.5, { pluckT: 2.5, pluckAmp: 1.0, energy: 0.0 }));
    assert.ok(amp0 > 0.0, "Initial pluck amplitude should be non-zero");
    assert.ok(ampLater < amp0 * 0.15, "Pluck amplitude at 2.5s should decay by at least 85%");
  });

  await t.test("Damper pins the string at contact s when damperK = 1.0", () => {
    const damperPos = 75.5;
    // Test at a time where undamped vibration is non-zero
    const yUndamped = Math.abs(stringY(0, damperPos, 0.125, { energy: 1.0 }));
    const yDamped = stringY(0, damperPos, 0.125, {
      energy: 1.0,
      damperPos,
      damperK: 1.0,
    });
    assert.ok(yUndamped > 0.01, `Undamped string should have displacement, got ${yUndamped}`);
    assert.ok(Math.abs(yDamped) < 1e-6, `Damped string at contact point must be pinned to 0, got ${yDamped}`);
  });

  await t.test("Static load sags string by exact depth (-uLoadDepth * uMaxAmp)", () => {
    const loadPos = 75.5;
    const loadDepth = 0.35;
    const maxAmp = 0.55;
    const expectedSag = -loadDepth * maxAmp; // -0.1925 su
    const y = stringY(0, loadPos, 0.0, {
      energy: 0.0,
      loadPos,
      loadK: 1.0,
      loadDepth,
      maxAmp,
    });
    assert.ok(
      Math.abs(y - expectedSag) < 1e-5,
      `Expected sag ${expectedSag}, got ${y}`
    );
  });

  await t.test("Energy model responds to scroll velocity and decays when stopped", () => {
    const model = new TestEnergyModel();
    // Simulate scrolling at 3000 px/s for 15 frames
    for (let frame = 0; frame < 15; frame++) {
      model.update(0.016, 3000);
    }
    assert.ok(model.energy[0] > 0.3, `Energy should increase with scroll velocity, got ${model.energy[0]}`);

    // Simulate stopping scroll for 120 frames (~2 seconds)
    for (let frame = 0; frame < 120; frame++) {
      model.update(0.016, 0);
    }
    assert.ok(model.energy[0] < 0.05, `Energy should decay naturally to stillness, got ${model.energy[0]}`);
  });
});
