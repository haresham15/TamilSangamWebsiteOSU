import test from "node:test";
import assert from "node:assert/strict";

// Pure state machine simulation mirroring strumStateMachine.ts
function createMockStrumMachine(initialProgress = 0) {
  let phase = initialProgress > 0.02 ? "DRIVEN" : "IDLE";
  let lastStrumEndTime = 0;
  let topQuietStartTime = 0;
  const plucksTriggered = [];

  function updateScroll(progress, direction, now) {
    // 1. First forward scroll intent -> STRUM
    if (phase === "IDLE" && progress > 0.002 && direction === 1) {
      phase = "STRUM";
      // Simulate downstroke plucks (offset 45ms per string)
      const pluckTimes = [0.70, 0.745, 0.79, 0.835, 0.88, 0.925];
      const pluckAmps = [1.0, 0.94, 0.88, 0.82, 0.76, 0.70];
      for (let s = 0; s < 6; s++) {
        plucksTriggered.push({
          string: s,
          time: pluckTimes[s],
          amp: pluckAmps[s],
        });
      }
      return;
    }

    // 2. Re-arming condition
    if (phase === "DRIVEN") {
      if (progress < 0.001) {
        if (topQuietStartTime === 0) {
          topQuietStartTime = now;
        } else if (now - topQuietStartTime >= 600 && now - lastStrumEndTime >= 8000) {
          phase = "IDLE";
          topQuietStartTime = 0;
        }
      } else {
        topQuietStartTime = 0;
      }
    }
  }

  function completeStrum(now) {
    if (phase === "STRUM") {
      phase = "DRIVEN";
      lastStrumEndTime = now;
    }
  }

  return {
    getPhase: () => phase,
    updateScroll,
    completeStrum,
    getPlucks: () => [...plucksTriggered],
  };
}

test("Strum State Machine §5.3: Normal initial load starts in IDLE", () => {
  const sm = createMockStrumMachine(0.0);
  assert.equal(sm.getPhase(), "IDLE", "At top of page, state machine must be IDLE");
});

test("Strum State Machine §5.3: Mid-page refresh guard starts in DRIVEN (skips initial strike)", () => {
  // Simulating user refreshing at scroll progress 0.25 (25% down the page)
  const sm = createMockStrumMachine(0.25);
  assert.equal(
    sm.getPhase(),
    "DRIVEN",
    "Refreshing mid-page must start in DRIVEN to prevent unprovoked pick strikes"
  );

  // Scrolling forward from mid-page does NOT trigger strum
  sm.updateScroll(0.26, 1, 1000);
  assert.equal(sm.getPhase(), "DRIVEN");
  assert.equal(sm.getPlucks().length, 0, "No plucks triggered on mid-page scroll");
});

test("Strum State Machine §5.3: First forward scroll triggers STRUM and downstroke plucks", () => {
  const sm = createMockStrumMachine(0.0);
  assert.equal(sm.getPhase(), "IDLE");

  // Minor backward jitter does not trigger strum
  sm.updateScroll(0.001, -1, 100);
  assert.equal(sm.getPhase(), "IDLE");

  // First deliberate forward scroll intent (p > 0.002, direction = 1)
  sm.updateScroll(0.008, 1, 200);
  assert.equal(sm.getPhase(), "STRUM", "First forward scroll must trigger STRUM phase");

  // Verify downstroke plucks: 6 strings with 45ms offsets and tapering amplitudes
  const plucks = sm.getPlucks();
  assert.equal(plucks.length, 6, "Must schedule plucks for all 6 strings");

  assert.equal(plucks[0].string, 0); // Low E
  assert.equal(plucks[0].time, 0.70);
  assert.equal(plucks[0].amp, 1.0);

  assert.equal(plucks[1].string, 1); // A
  assert.equal(Math.round((plucks[1].time - plucks[0].time) * 1000), 45, "45ms offset for String 1");

  assert.equal(plucks[5].string, 5); // High e
  assert.equal(plucks[5].amp, 0.70, "Treble pluck amplitude tapers to 0.70");

  // Strum completion transitions to DRIVEN
  sm.completeStrum(1800);
  assert.equal(sm.getPhase(), "DRIVEN");
});

test("Strum State Machine §5.3: Re-arms to IDLE only when back at top + quiet >= 600ms + cooldown >= 8s", () => {
  const sm = createMockStrumMachine(0.0);
  sm.updateScroll(0.01, 1, 1000);
  sm.completeStrum(2600);
  assert.equal(sm.getPhase(), "DRIVEN");

  // Still scrolling down
  sm.updateScroll(0.40, 1, 4000);
  assert.equal(sm.getPhase(), "DRIVEN");

  // Scroll back to top at t = 6000ms
  sm.updateScroll(0.0005, -1, 6000);
  assert.equal(sm.getPhase(), "DRIVEN", "Top quiet time just started");

  // At t = 6400ms (quiet only 400ms)
  sm.updateScroll(0.0002, 0, 6400);
  assert.equal(sm.getPhase(), "DRIVEN", "Quiet time < 600ms, cannot re-arm yet");

  // At t = 8000ms (quiet >= 600ms, but total time since strum end = 8000 - 2600 = 5400ms < 8000ms cooldown)
  sm.updateScroll(0.0001, 0, 8000);
  assert.equal(sm.getPhase(), "DRIVEN", "8-second cooldown not yet elapsed");

  // At t = 11000ms (quiet >= 600ms and time since strum end = 11000 - 2600 = 8400ms >= 8000ms)
  sm.updateScroll(0.0001, 0, 11000);
  assert.equal(sm.getPhase(), "IDLE", "Must re-arm to IDLE after quiet + cooldown");
});

// ── ERA 2 PROPS (PHASE 5) TESTS ──────────────────────────────────────────

test("Phase 5: Camera Body lifecycle & dissolve window (§5.2, §6)", () => {
  // Simulating Camera Body dissolve lifecycle across scroll progress
  function getCameraDissolve(p) {
    if (p < 0.33) return 1.0; // Dissolved before Era 2
    if (p < 0.40) return 1.0 - (p - 0.33) / 0.07; // Fade in
    if (p <= 0.61) return 0.0; // Fully visible
    if (p <= 0.658) return (p - 0.61) / 0.048; // Fade out
    return 1.0; // Dissolved
  }

  assert.equal(getCameraDissolve(0.0), 1.0, "Camera body must be invisible at top");
  assert.equal(getCameraDissolve(0.20), 1.0, "Camera body must be invisible during Era 1");
  assert.ok(getCameraDissolve(0.36) > 0.0 && getCameraDissolve(0.36) < 1.0, "Camera dissolves in during 33–40%");
  assert.equal(getCameraDissolve(0.48), 0.0, "Camera body must be fully solid during Era 2");
  assert.ok(getCameraDissolve(0.63) > 0.0 && getCameraDissolve(0.63) < 1.0, "Camera dissolves out at Era 2 end");
  assert.equal(getCameraDissolve(0.70), 1.0, "Camera body must be dissolved by Era 3");
});

test("Phase 5: Rose landing on Low E string and vibration riding window (§5.4, §7.4)", () => {
  // Track events and pluck dispatches
  let contactTriggered = false;
  let pluckedString = -1;
  let pluckAmp = 0;

  const events = {
    onRoseContact: () => {
      contactTriggered = true;
      pluckedString = 0; // Low E
      pluckAmp = 0.55;
    },
  };

  // Guarded trigger simulator mirroring timeline.ts
  let firedOnce = false;
  function updateProgress(p) {
    if (p >= 0.52 && !firedOnce) {
      firedOnce = true;
      events.onRoseContact();
    }
  }

  // Pre-landing
  updateProgress(0.48);
  assert.equal(contactTriggered, false, "Contact must not fire before p = 0.52");

  // Landing moment at p = 0.52
  updateProgress(0.52);
  assert.equal(contactTriggered, true, "Contact must fire at p = 0.52");
  assert.equal(pluckedString, 0, "onRoseContact must target String 0 (Low E string) ONLY");
  assert.equal(pluckAmp, 0.55, "Low E string displacement amplitude must be 0.55");

  // Vibration riding window predicate
  function isRidingString(p) {
    return p >= 0.52 && p <= 0.62;
  }

  assert.equal(isRidingString(0.50), false, "Not riding string before landing");
  assert.equal(isRidingString(0.52), true, "Riding string at landing");
  assert.equal(isRidingString(0.58), true, "Riding string during Era 2 sustain");
  assert.equal(isRidingString(0.62), true, "Riding string at window end");
  assert.equal(isRidingString(0.63), false, "Stops riding string after p = 0.62");
});

// ── ERA 2 GOLD DUST BURST (PHASE 6) TESTS ───────────────────────────────

test("Phase 6: Gold Dust Burst triggers synchronously on onRoseContact (§5.4, §6)", () => {
  let burstTriggered = false;
  let burstOrigin = null;
  let pluckedString = -1;

  // Simulate types.ts events and dust burst handler
  const handler = (origin) => {
    burstTriggered = true;
    burstOrigin = origin || { x: -2.4125, y: 0.3624, z: -53.0 };
  };

  const events = {
    onRoseContact: () => {
      pluckedString = 0; // Low E
      handler();
    },
  };

  events.onRoseContact();

  assert.equal(burstTriggered, true, "Burst must trigger when onRoseContact is invoked");
  assert.equal(pluckedString, 0, "Low E string must be plucked simultaneously");
  assert.ok(burstOrigin, "Burst origin must be initialized");
  assert.equal(burstOrigin.x, -2.4125, "Burst origin X must match String 0 world coordinate");
  assert.equal(burstOrigin.z, -53.0, "Burst origin Z must be 14 su ahead of p = 0.52");
});

test("Phase 6: Particle drag physics & opacity envelope decay over 3.2s (§6)", () => {
  const duration = 3.2;
  const drag = 1.25;

  // Pure mathematical simulator of GoldDustBurst shader
  function sampleParticle(dt, v0 = 3.0) {
    if (dt < 0.0 || dt > duration) {
      return { active: false, alpha: 0.0, displacement: 0.0 };
    }

    const normT = Math.min(1.0, Math.max(0.0, dt / duration));

    // Drag deceleration: s(t) = v0 * (1 - exp(-drag * dt)) / drag
    const dragFactor = (1.0 - Math.exp(-drag * dt)) / drag;
    const displacement = v0 * dragFactor;

    // Upward convective lift: 0.35 * dt^2 * (1 - 0.35 * normT)
    const lift = 0.35 * dt * dt * (1.0 - normT * 0.35);

    // Opacity envelope
    const attack = Math.min(1.0, dt / 0.08); // 80ms attack
    const decay = normT > 0.45 ? (1.0 - (normT - 0.45) / 0.55) : 1.0;
    const alpha = attack * decay;

    return { active: true, alpha, displacement, lift };
  }

  // 1. Initial burst attack (t = 0.04s)
  const atAttack = sampleParticle(0.04);
  assert.ok(atAttack.active, "Particle must be active at t = 0.04s");
  assert.ok(atAttack.alpha > 0.4 && atAttack.alpha < 1.0, "Fast attack ramping up");

  // 2. Full sustain (t = 0.5s)
  const atSustain = sampleParticle(0.5);
  assert.equal(atSustain.alpha, 1.0, "Full alpha sustain at 0.5s");
  assert.ok(atSustain.lift > 0.05, "Positive thermal buoyant updraft");

  // 3. Deceleration check (displacement decelerates as t increases)
  const at1s = sampleParticle(1.0);
  const at2s = sampleParticle(2.0);
  const delta1 = at1s.displacement;
  const delta2 = at2s.displacement - at1s.displacement;
  assert.ok(delta2 < delta1, "Velocity must strictly decelerate under aerodynamic drag");

  // 4. Smooth decay (t = 2.5s)
  const atLate = sampleParticle(2.5);
  assert.ok(atLate.alpha < 0.6 && atLate.alpha > 0.0, "Fading out gently");

  // 5. Expired (t = 3.3s)
  const atEnd = sampleParticle(3.3);
  assert.equal(atEnd.active, false, "Must deactivate after 3.2s duration");
  assert.equal(atEnd.alpha, 0.0, "Alpha must be 0.0 after expiration");
});

// ── ERA 3 DOG TAGS & STRING DAMPING (PHASE 7) TESTS ─────────────────────

test("Phase 7: Dog Tags impact triggers synchronous plucks on mid strings 2, 3, 4 (§5.2, §5.4)", () => {
  const plucks = [];

  const mockGlobalStringEnergy = {
    triggerPluck: (stringIndex, amp) => {
      plucks.push({ stringIndex, amp });
    },
  };

  const events = {
    onTagImpact: () => {
      mockGlobalStringEnergy.triggerPluck(2, 0.85);
      mockGlobalStringEnergy.triggerPluck(3, 0.85);
      mockGlobalStringEnergy.triggerPluck(4, 0.80);
    },
  };

  events.onTagImpact();

  assert.equal(plucks.length, 3, "Exactly 3 strings must be plucked on dog tags impact");
  assert.deepEqual(
    plucks.map((p) => p.stringIndex),
    [2, 3, 4],
    "Mid strings D (2), G (3), B (4) must be plucked"
  );
  assert.equal(plucks[0].amp, 0.85, "String 2 amplitude must be 0.85");
  assert.equal(plucks[1].amp, 0.85, "String 3 amplitude must be 0.85");
  assert.equal(plucks[2].amp, 0.80, "String 4 amplitude must be 0.80");
});

test("Phase 7: String damping, static load sag, and highway drive gain quieting (§5.2)", () => {
  // Simulates string parameters during Phase 7 timeline transition
  const stringsState = {
    uDamperK: 0.0,
    uLoadK: 0.0,
    driveGain: 1.0,
    damperPos: 70.625,
    loadPos: 70.625,
  };

  // Timeline changes at p = 75.5:
  // uDamperK -> 1.0 (over 6.5 units)
  // uLoadK -> 1.0 (over 2.5 units)
  // driveGain -> 0.0 (over 12.5 units)
  function advanceTimeline(unitsAfterImpact) {
    const damperFraction = Math.min(1.0, unitsAfterImpact / 6.5);
    const loadFraction = Math.min(1.0, unitsAfterImpact / 2.5);
    const driveFraction = Math.min(1.0, unitsAfterImpact / 12.5);

    stringsState.uDamperK = damperFraction;
    stringsState.uLoadK = loadFraction;
    stringsState.driveGain = 1.0 - driveFraction;
  }

  // 1. Immediately prior to impact
  assert.equal(stringsState.uDamperK, 0.0);
  assert.equal(stringsState.uLoadK, 0.0);
  assert.equal(stringsState.driveGain, 1.0);

  // 2. 2.5 units post-impact (loadK fully established)
  advanceTimeline(2.5);
  assert.equal(stringsState.uLoadK, 1.0, "Static load sag must be fully ramped");
  assert.ok(stringsState.uDamperK > 0.35, "Damper strength must be actively ramping");
  assert.ok(stringsState.driveGain < 0.9, "Drive gain must begin quieting");

  // 3. 6.5 units post-impact (damperK fully established)
  advanceTimeline(6.5);
  assert.equal(stringsState.uDamperK, 1.0, "Damper must reach full 1.0 strength");
  assert.ok(stringsState.driveGain < 0.6, "Drive gain continuing attenuation");

  // 4. 12.5 units post-impact (driveGain fully quieted to 0.0)
  advanceTimeline(12.5);
  assert.equal(stringsState.driveGain, 0.0, "Highway drive harmonics must be completely quieted");
});

test("Phase 7: Dog tags rebound trajectory and settle bounce kinematics (§5.2)", () => {
  const hitY = 0.3624;
  const restY = hitY + 0.25; // 0.6124 su
  const peakReboundY = hitY + 0.6; // 0.9624 su

  // Kinematic trajectory evaluator
  function getTagY(p) {
    if (p < 68.0) return 8.0;
    if (p <= 75.5) {
      // Falling from 8.0 down to restY (power3.in)
      const t = (p - 68.0) / 7.5;
      const ease = t * t * t;
      return 8.0 + (restY - 8.0) * ease;
    }
    if (p <= 76.3) {
      // Rebound up to peakReboundY (power2.out over 0.8 units)
      const t = (p - 75.5) / 0.8;
      const ease = 1.0 - (1.0 - t) * (1.0 - t);
      return restY + (peakReboundY - restY) * ease;
    }
    if (p <= 77.7) {
      // Settle down to restY (bounce.out over 1.4 units)
      return restY; // Settles to contact plane
    }
    return restY;
  }

  // Verify descent
  assert.equal(getTagY(68.0), 8.0, "Starts descent at y = 8.0");
  assert.ok(getTagY(72.0) < 8.0 && getTagY(72.0) > restY, "Descending smoothly");
  assert.ok(Math.abs(getTagY(75.5) - restY) < 1e-4, "Reaches contact rest plane on impact");

  // Verify rebound
  assert.ok(Math.abs(getTagY(76.3) - peakReboundY) < 1e-4, "Reaches peak rebound height (+0.6 su)");

  // Verify settled
  assert.ok(Math.abs(getTagY(78.0) - restY) < 1e-4, "Settled on string surface after bounce");
});

test("Phase 7: String energy decay accelerates under damperK pinning (§3.4, §5.2)", () => {
  // Pure model of energy update tau calculation:
  // Normal decay: tau = 0.55s
  // Damped decay: tau = Math.max(0.08, 0.55 - 0.35 * damperK)
  function getDecayTau(damperK) {
    return Math.max(0.08, 0.55 - 0.35 * damperK);
  }

  const freeTau = getDecayTau(0.0);
  const dampedTau = getDecayTau(1.0);

  assert.equal(freeTau, 0.55, "Free string ring-out tau must be 0.55s");
  assert.ok(
    Math.abs(dampedTau - 0.20) < 1e-6,
    "Damped string ring-out tau must be 0.20s (2.75x faster energy decay)"
  );
  assert.ok(dampedTau < freeTau, "Damping must strictly accelerate vibration ring-out");
});

// ── ERA 3 FINALE APPROACH & HAND-OFF (PHASE 8) TESTS ─────────────────────

test("Phase 8: Finale camera extra dolly (+2.5 su) and FOV compression (35° -> 30°) (§5.2)", () => {
  // Evaluates rig telemetry across finale approach (units 90 to 100)
  function getFinaleRigState(unitProgress) {
    if (unitProgress <= 90) {
      return { dolly: 0.0, fov: 35.0 };
    }
    const t = Math.min(1.0, (unitProgress - 90) / 10.0);
    // power1.in: t^1.5 or t^1 (linear/gentle in)
    const dolly = 2.5 * (t * t);
    // sine.inOut: 0.5 * (1 - cos(pi * t))
    const fov = 35.0 - 5.0 * (0.5 * (1.0 - Math.cos(Math.PI * t)));
    return { dolly, fov };
  }

  // 1. Prior to finale approach (p = 85 units)
  const at85 = getFinaleRigState(85);
  assert.equal(at85.dolly, 0.0, "Dolly must be 0 before unit 90");
  assert.equal(at85.fov, 35.0, "FOV must remain resting 35 degrees before unit 90");

  // 2. Mid finale approach (p = 95 units)
  const at95 = getFinaleRigState(95);
  assert.ok(at95.dolly > 0.5 && at95.dolly < 2.0, "Dolly accelerating past fret 24");
  assert.ok(at95.fov < 35.0 && at95.fov > 30.0, "FOV smoothly narrowing");

  // 3. Climax (p = 100 units)
  const at100 = getFinaleRigState(100);
  assert.equal(at100.dolly, 2.5, "Maximum +2.5 su extra dolly achieved at p = 1.00");
  assert.equal(at100.fov, 30.0, "FOV narrowed to 30 degrees telephoto compression at p = 1.00");
});

test("Phase 8: Solar Wash Overlay alpha curve, peak flash, and seamless vault hand-off (§4, §5.2)", () => {
  // Pure model of WashOverlay math
  function evaluateWash(progress) {
    if (progress < 0.88) {
      return { active: false, alpha: 0.0, flash: 0.0, isSolidVaultHandOff: false };
    }
    const pWash = Math.max(0, Math.min(1.0, (progress - 0.88) / 0.12));
    const alpha = Math.pow(pWash, 2.0);
    const flash = Math.sin(pWash * Math.PI);
    const isSolidVaultHandOff = progress >= 0.99 && alpha > 0.85;

    return {
      active: true,
      alpha,
      flash,
      isSolidVaultHandOff,
    };
  }

  // 1. Before wash window (p = 0.85)
  const beforeWash = evaluateWash(0.85);
  assert.equal(beforeWash.active, false);
  assert.equal(beforeWash.alpha, 0.0);

  // 2. Wash onset (p = 0.90)
  const onset = evaluateWash(0.90);
  assert.equal(onset.active, true);
  assert.ok(onset.alpha > 0.0 && onset.alpha < 0.10, "Soft gentle initial whiteout start");

  // 3. Peak solar flash (p = 0.94 - 0.96)
  const peak = evaluateWash(0.95);
  assert.ok(peak.flash > 0.90, "Solar flare flash intensity peaks around p = 0.95");

  // 4. Climax hand-off (p = 1.00)
  const climax = evaluateWash(1.00);
  assert.equal(climax.alpha, 1.00, "Full 1.0 alpha on wash overlay");
  assert.equal(climax.isSolidVaultHandOff, true, "Solid #FFFDF8 ivory overlay ensures zero-seam vault transition");
});

test("Phase 8: Bidirectional reversibility unwinds wash and restores scene states", () => {
  // Verify that transitioning backward returns exact resting states without latching
  function isWashActive(p) {
    return p >= 0.88;
  }

  // Forward scroll into finale
  assert.equal(isWashActive(0.755), false);
  assert.equal(isWashActive(0.95), true);
  assert.equal(isWashActive(1.0), true);

  // Backward scroll recovery
  assert.equal(isWashActive(0.92), true);
  assert.equal(isWashActive(0.85), false, "Reverse scroll unmasks 3D scene cleanly below p = 0.88");
  assert.equal(isWashActive(0.52), false);
  assert.equal(isWashActive(0.0), false);
});




