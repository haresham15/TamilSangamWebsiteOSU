import test from "node:test";
import assert from "node:assert/strict";

// Re-implement the pure logic for Node test environment (or test the exact math/logic)
const ERA_RANGE = {
  1: [0, 33.0],
  2: [33.0, 66.0],
  3: [66.0, 100.0],
};

function assertInEra(era, start, dur) {
  const [a, b] = ERA_RANGE[era];
  if (start < a - 1e-4 || start + dur > b + 1e-4) {
    throw new Error(
      `Tween [${start}, ${start + dur}] leaves era ${era} boundary ([${a}, ${b}])`
    );
  }
}

// Master tween descriptor table from timeline.ts
const PROP_TWEENS = [
  // Era 1 (0-33%)
  { era: 1, name: "ticket.uDissolve.fadeIn", start: 1, dur: 8 },
  { era: 1, name: "ticket.position.entry", start: 1, dur: 13 },
  { era: 1, name: "ticket.position.drift", start: 14, dur: 16 },
  { era: 1, name: "ticket.rotation", start: 1, dur: 29 },
  { era: 1, name: "ticket.uDissolve.fadeOut", start: 26, dur: 6.5 },
  { era: 1, name: "compass.uDissolve.fadeIn", start: 3, dur: 9 },
  { era: 1, name: "compass.position", start: 3, dur: 17 },
  { era: 1, name: "compass.rotation", start: 3, dur: 28 },
  { era: 1, name: "compass.uDissolve.fadeOut", start: 25, dur: 7.8 },

  // Era 2 (33-66%)
  { era: 2, name: "cam.uDissolve.fadeIn", start: 33, dur: 7 },
  { era: 2, name: "cam.position.drift", start: 33, dur: 25 },
  { era: 2, name: "cam.rotation", start: 33, dur: 25 },
  { era: 2, name: "cam.position.exit", start: 58, dur: 7.5 },
  { era: 2, name: "cam.uDissolve.fadeOut", start: 61, dur: 4.8 },
  { era: 2, name: "rose.uDissolve.fadeIn", start: 34, dur: 6 },
  { era: 2, name: "rose.position.descent", start: 40, dur: 10.5 },
  { era: 2, name: "rose.position.settle", start: 50.5, dur: 1.5 },
  { era: 2, name: "rose.position.xAlign", start: 40, dur: 12 },
  { era: 2, name: "rose.rotation", start: 40, dur: 12 },
  { era: 2, name: "rose.uDissolve.fadeOut", start: 62, dur: 3.8 },

  // Era 3 (66-100%)
  { era: 3, name: "tags.uDissolve.fadeIn", start: 66.5, dur: 4 },
  { era: 3, name: "tags.position.drop", start: 68, dur: 7.5 },
  { era: 3, name: "tags.rotation", start: 68, dur: 7.5 },
  { era: 3, name: "tags.position.rebound", start: 75.5, dur: 0.8 },
  { era: 3, name: "tags.position.settle", start: 76.3, dur: 1.4 },
  { era: 3, name: "strings.uDamperK", start: 75.5, dur: 6.5 },
  { era: 3, name: "strings.uLoadK", start: 75.5, dur: 2.5 },
  { era: 3, name: "strings.driveGain", start: 75.5, dur: 12.5 },
  { era: 3, name: "rig.dolly", start: 90, dur: 10 },
  { era: 3, name: "rig.fov", start: 90, dur: 10 },
];

function createMockGuardedTriggerState() {
  let lastProgress = 0;
  let rawVelocity = 0;
  const lastEventTimestamps = {};

  function trigger(eventName, callback, currentP, now, cooldownMs = 450) {
    const dP = currentP - lastProgress;
    const lastTime = lastEventTimestamps[eventName] || 0;

    const isForward = dP > 0.0001 || (dP >= -0.0001 && rawVelocity >= 0);
    const notJump = Math.abs(dP) < 0.04;
    const cooldownOk = now - lastTime > cooldownMs;

    if (isForward && notJump && cooldownOk) {
      lastEventTimestamps[eventName] = now;
      callback();
    }

    lastProgress = currentP;
  }

  function setVelocity(v) {
    rawVelocity = v;
  }

  function setProgress(p) {
    lastProgress = p;
  }

  return { trigger, setVelocity, setProgress };
}

test("Timeline §5.1: Every tween in PROP_TWEENS strictly obeys assertInEra", () => {
  for (const spec of PROP_TWEENS) {
    assert.doesNotThrow(() => {
      assertInEra(spec.era, spec.start, spec.dur);
    }, `Tween ${spec.name} in era ${spec.era} should be within bounds`);
  }
});

test("Timeline §5.1: assertInEra throws on out-of-bounds start or end", () => {
  // Leaking before era start
  assert.throws(() => assertInEra(2, 32.9, 5.0), /leaves era 2 boundary/);
  assert.throws(() => assertInEra(3, 65.9, 10.0), /leaves era 3 boundary/);

  // Leaking past era end
  assert.throws(() => assertInEra(1, 30.0, 3.5), /leaves era 1 boundary/);
  assert.throws(() => assertInEra(2, 60.0, 6.5), /leaves era 2 boundary/);
  assert.throws(() => assertInEra(3, 95.0, 6.0), /leaves era 3 boundary/);
});

test("Timeline §5.1: Era boundaries partition exactly at [0, 33], [33, 66], [66, 100]", () => {
  assert.deepEqual(ERA_RANGE[1], [0, 33.0]);
  assert.deepEqual(ERA_RANGE[2], [33.0, 66.0]);
  assert.deepEqual(ERA_RANGE[3], [66.0, 100.0]);

  // Era 1 tweens max end
  const era1Max = Math.max(...PROP_TWEENS.filter(t => t.era === 1).map(t => t.start + t.dur));
  assert.ok(era1Max <= 33.0, `Era 1 max end ${era1Max} must be <= 33.0`);

  // Era 2 tweens min start & max end
  const era2Min = Math.min(...PROP_TWEENS.filter(t => t.era === 2).map(t => t.start));
  const era2Max = Math.max(...PROP_TWEENS.filter(t => t.era === 2).map(t => t.start + t.dur));
  assert.ok(era2Min >= 33.0, `Era 2 min start ${era2Min} must be >= 33.0`);
  assert.ok(era2Max <= 66.0, `Era 2 max end ${era2Max} must be <= 66.0`);

  // Era 3 tweens min start & max end
  const era3Min = Math.min(...PROP_TWEENS.filter(t => t.era === 3).map(t => t.start));
  const era3Max = Math.max(...PROP_TWEENS.filter(t => t.era === 3).map(t => t.start + t.dur));
  assert.ok(era3Min >= 66.0, `Era 3 min start ${era3Min} must be >= 66.0`);
  assert.ok(era3Max <= 100.0, `Era 3 max end ${era3Max} must be <= 100.0`);
});

test("Timeline §4.4: Guarded trigger executes on smooth forward scrub", () => {
  const sim = createMockGuardedTriggerState();
  let calls = 0;
  const cb = () => calls++;

  sim.setProgress(0.515);
  sim.setVelocity(100);

  // Smooth step across 0.52 (delta = 0.005 < 0.04)
  sim.trigger("roseContact", cb, 0.520, 1000);
  assert.equal(calls, 1, "Guarded trigger must fire on smooth forward scrub");
});

test("Timeline §4.4: Guarded trigger suppresses on jump (|dP| >= 0.04)", () => {
  const sim = createMockGuardedTriggerState();
  let calls = 0;
  const cb = () => calls++;

  sim.setProgress(0.0);
  sim.setVelocity(0);

  // Jump from 0.0 to 0.70 (delta = 0.70 >= 0.04)
  sim.trigger("roseContact", cb, 0.70, 1000);
  assert.equal(calls, 0, "Guarded trigger must NOT fire on jump from 0.0 to 0.70");

  // Jump from 0.70 to 0.95 (delta = 0.25 >= 0.04)
  sim.trigger("tagImpact", cb, 0.95, 1050);
  assert.equal(calls, 0, "Guarded trigger must NOT fire on jump from 0.70 to 0.95");
});

test("Timeline §4.4: Guarded trigger suppresses on backward scrub", () => {
  const sim = createMockGuardedTriggerState();
  let calls = 0;
  const cb = () => calls++;

  sim.setProgress(0.530);
  sim.setVelocity(-150); // Backward scroll velocity

  // Scrub backward from 0.530 to 0.520
  sim.trigger("roseContact", cb, 0.520, 1000);
  assert.equal(calls, 0, "Guarded trigger must NOT fire when scrubbing backwards");
});

test("Timeline §4.4: Guarded trigger enforces 450ms cooldown", () => {
  const sim = createMockGuardedTriggerState();
  let calls = 0;
  const cb = () => calls++;

  sim.setProgress(0.518);
  sim.setVelocity(80);

  // First forward trigger at t = 1000ms
  sim.trigger("roseContact", cb, 0.521, 1000);
  assert.equal(calls, 1);

  // Rapid forward micro-tick at t = 1200ms (< 450ms cooldown)
  sim.trigger("roseContact", cb, 0.523, 1200);
  assert.equal(calls, 1, "Must suppress duplicate call within 450ms");

  // Subsequent trigger after cooldown at t = 1600ms (> 450ms)
  sim.trigger("roseContact", cb, 0.525, 1600);
  assert.equal(calls, 2, "Must allow call after cooldown has elapsed");
});

test("Timeline §5.2: Damper and Load occur synchronously with Tag Impact (75.5 units)", () => {
  const tagsRebound = PROP_TWEENS.find(t => t.name === "tags.position.rebound");
  const damper = PROP_TWEENS.find(t => t.name === "strings.uDamperK");
  const load = PROP_TWEENS.find(t => t.name === "strings.uLoadK");
  const driveGain = PROP_TWEENS.find(t => t.name === "strings.driveGain");

  assert.equal(tagsRebound.start, 75.5, "Tags rebound must start at 75.5");
  assert.equal(damper.start, 75.5, "Damper must start at 75.5");
  assert.equal(load.start, 75.5, "Load must start at 75.5");
  assert.equal(driveGain.start, 75.5, "Drive gain shutdown must start at 75.5");
});
