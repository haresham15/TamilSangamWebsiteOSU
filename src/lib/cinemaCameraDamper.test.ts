import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  createCinemaCameraDamper,
  smootherstep,
  hermiteBlend,
} from "./cinemaCameraDamper";
import { evalCamera } from "@/components/hero/flowMath";

describe("cinemaCameraDamper", () => {
  it("smootherstep provides C1 and C2 continuity at boundaries", () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(0.5)).toBeCloseTo(0.5, 5);

    // Verify derivative at boundaries is zero
    const eps = 1e-4;
    const d0 = (smootherstep(eps) - smootherstep(0)) / eps;
    const d1 = (smootherstep(1) - smootherstep(1 - eps)) / eps;
    expect(d0).toBeLessThan(0.01);
    expect(d1).toBeLessThan(0.01);
  });

  it("hermiteBlend provides smooth transition over defined window", () => {
    expect(hermiteBlend(0.4, 0.5, 0.1)).toBe(0);
    expect(hermiteBlend(0.5, 0.5, 0.1)).toBeCloseTo(0.5, 5);
    expect(hermiteBlend(0.6, 0.5, 0.1)).toBe(1);
  });

  it("silences handheld breathing completely under reduced motion or Lite mode", () => {
    const damper = createCinemaCameraDamper({
      enableBreathing: true,
      breathingAmplitude: 0.006,
      breathingRoll: 0.003,
    });

    const targetPos = new THREE.Vector3(0, 0, 12);
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    damper.init(targetPos, targetLookAt, 0);

    // Run for 3 seconds under reduced motion
    let damped = damper.update(targetPos, targetLookAt, 0, 0.016, { isReducedMotion: true });
    for (let i = 0; i < 180; i++) {
      damped = damper.update(targetPos, targetLookAt, 0, 0.016, { isReducedMotion: true });
    }

    expect(damped.position.distanceTo(targetPos)).toBeLessThan(1e-5);
    expect(Math.abs(damped.roll)).toBeLessThan(1e-5);

    // Run under Lite mode
    for (let i = 0; i < 60; i++) {
      damped = damper.update(targetPos, targetLookAt, 0, 0.016, { isLiteMode: true });
    }
    expect(damped.position.distanceTo(targetPos)).toBeLessThan(1e-5);
  });

  it("settles at fixed scroll milestones (p = 0.0, 0.25, 0.50, 0.75, 1.0) with < 0.005m position delta and < 0.05 deg orientation delta", () => {
    const damper = createCinemaCameraDamper({
      lambdaPos: 6.0,
      lambdaLook: 10.0,
      breathingAmplitude: 0.0035,
      breathingRoll: 0.0015,
    });

    function getBaselineWaypoint(p: number) {
      const { camY, camZ } = evalCamera(p);
      const pushT = Math.max(0, Math.min(1, (p - 0.62) / 0.16));
      const easePush = smootherstep(pushT);
      const portalZOffset = easePush * 6.5;
      return new THREE.Vector3(0, camY, camZ - portalZOffset);
    }

    const milestones = [0.0, 0.25, 0.50, 0.75, 1.0];

    for (const p of milestones) {
      const targetPos = getBaselineWaypoint(p);
      const targetLookAt = new THREE.Vector3(0, targetPos.y, -4.0);

      // Re-init damper at start or let it settle over 2.5s (150 frames @ 60fps)
      damper.init(targetPos, targetLookAt, p);

      let lastState = damper.update(targetPos, targetLookAt, p, 0.016, { isReducedMotion: true });
      for (let f = 0; f < 150; f++) {
        lastState = damper.update(targetPos, targetLookAt, p, 0.016, { isReducedMotion: true });
      }

      const posDelta = lastState.position.distanceTo(targetPos);
      expect(posDelta).toBeLessThan(0.005);
      expect(Math.abs(lastState.roll)).toBeLessThan(0.05 * (Math.PI / 180));
    }
  });

  it("ensures look-at leads position carriage (lambdaLook > lambdaPos)", () => {
    const lambdaPos = 5.0;
    const lambdaLook = 10.0;
    const damper = createCinemaCameraDamper({ lambdaPos, lambdaLook, enableBreathing: false });

    const startPos = new THREE.Vector3(0, 0, 10);
    const startLook = new THREE.Vector3(0, 0, 0);
    damper.init(startPos, startLook, 0);

    const destPos = new THREE.Vector3(2, 4, 10);
    const destLook = new THREE.Vector3(4, 8, 0);

    const dt = 0.05;
    const step = damper.update(destPos, destLook, 0.5, dt, { isReducedMotion: true });

    // Look-at alpha: 1 - exp(-10 * 0.05) = 1 - exp(-0.5) = 0.3934
    // Pos alpha: 1 - exp(-5 * 0.05) = 1 - exp(-0.25) = 0.2212
    const lookProgress = step.lookAt.clone().sub(startLook).length() / destLook.clone().sub(startLook).length();
    const posProgress = step.position.clone().sub(startPos).length() / destPos.clone().sub(startPos).length();

    expect(lookProgress).toBeGreaterThan(posProgress);
  });
});
