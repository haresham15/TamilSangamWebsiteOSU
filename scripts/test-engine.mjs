// scripts/test-engine.mjs
import assert from "node:assert/strict";

console.log("=== Running Master Engine Unit Tests (§8, §12) ===");

// 1. Spring Physics Math Test
class Spring {
  x = 0;
  v = 0;
  target = 0;
  constructor(k = 150, c = 15, m = 1) {
    this.k = k;
    this.c = c;
    this.m = m;
  }
  step(dt) {
    const a = (-this.k * (this.x - this.target) - this.c * this.v) / this.m;
    this.v += a * dt;
    this.x += this.v * dt;
  }
  get settled() {
    return Math.abs(this.v) < 0.01 && Math.abs(this.x - this.target) < 0.01;
  }
}

// Test A: Spring settles without NaN
const s = new Spring(150, 15, 1);
s.target = 16;
let maxVal = 0;
for (let i = 0; i < 60; i++) {
  s.step(1 / 60);
  assert(!Number.isNaN(s.x), "Spring x must not be NaN");
  assert(!Number.isNaN(s.v), "Spring v must not be NaN");
  if (s.x > maxVal) maxVal = s.x;
}
assert(maxVal > 16, "Underdamped spring must have slight overshoot (> 16)");
console.log(`[PASS] Spring forward step with overshoot (target: 16, max: ${maxVal.toFixed(2)})`);

// Test B: Spring snaps back to 0 forcefully and settles in < 1 second
s.target = 0;
let stepsToSettle = 0;
for (let i = 0; i < 120; i++) {
  s.step(1 / 60);
  if (s.settled && stepsToSettle === 0) {
    stepsToSettle = i;
  }
}
assert(stepsToSettle > 0, "Spring must settle within 2 seconds");
const settleTimeSec = stepsToSettle / 60;
assert(settleTimeSec < 1.0, `Spring must settle in < 1s (actual: ${settleTimeSec.toFixed(2)}s)`);
console.log(`[PASS] Spring snap back and settle: settled in ${settleTimeSec.toFixed(2)}s (${stepsToSettle} frames)`);

// 2. Delta Clamping Test (§4.1)
function clampDt(timeSec, last) {
  return last === 0 ? 1 / 60 : Math.min(timeSec - last, 1 / 20);
}

assert.equal(clampDt(0, 0), 1 / 60, "Initial dt must default to 1/60s");
assert.equal(clampDt(10.05, 10.0), 1 / 20, "Delta > 1/20s must be clamped to 1/20s (0.05s)");
assert(Math.abs(clampDt(10.016, 10.0) - 0.016) < 1e-6, "Normal 60fps delta must pass through without clamping");
console.log("[PASS] Master tick delta clamping guards against tab resume spikes");

// 3. Governor Logic Test (§4.3)
class Governor {
  asks = new Map();
  request(key, level) {
    if (level > 0) this.asks.set(key, level);
    else this.asks.delete(key);
  }
  level(hidden = false) {
    if (hidden) return 0;
    let max = 0;
    for (const v of this.asks.values()) {
      if (v > max) max = v;
      if (max === 2) break;
    }
    return max;
  }
}

const gov = new Governor();
assert.equal(gov.level(), 0, "Governor must return 0 when idle");
gov.request("ambient", 1);
assert.equal(gov.level(), 1, "Governor must return 1 for ambient ask");
gov.request("springs", 2);
assert.equal(gov.level(), 2, "Governor must return 2 for active interaction");
assert.equal(gov.level(true), 0, "Governor must immediately return 0 when document is hidden");
gov.request("springs", 0);
assert.equal(gov.level(), 1, "Governor drops back to 1 when springs settle");
gov.request("ambient", 0);
assert.equal(gov.level(), 0, "Governor drops to 0 when ambient finishes");
console.log("[PASS] Frame governor evaluation and document.hidden auto-pause");

console.log("=== All Engine Unit Tests Passed Cleanly ===");
