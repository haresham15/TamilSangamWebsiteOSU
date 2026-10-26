import { describe, it, expect } from "vitest";
import { CINEMATIC_V2_FLAGS } from "@/config/heroCinematicFlags";
import { createCinemaCameraDamper, smootherstep } from "@/lib/cinemaCameraDamper";
import * as THREE from "three";

describe("GopuramZScroll Hero Cinematic Elevation", () => {
  it("exports 'about' key in CINEMATIC_V2_FLAGS", () => {
    expect("about" in CINEMATIC_V2_FLAGS).toBe(true);
  });

  it("evaluates smootherstep continuity across detents", () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(0.5)).toBeCloseTo(0.5, 4);

    // Monotonicity check
    let prev = 0;
    for (let t = 0.05; t <= 1.0; t += 0.05) {
      const cur = smootherstep(t);
      expect(cur).toBeGreaterThanOrEqual(prev);
      prev = cur;
    }
  });

  it("verifies cinema camera damper stability on Gopuram ascent corridor", () => {
    const damper = createCinemaCameraDamper({
      lambdaPos: 6.2,
      lambdaLook: 10.5,
      breathingAmplitude: 0.003,
      breathingRoll: 0.0015,
    });

    const pos = new THREE.Vector3(0, 0, 12);
    const lookAt = new THREE.Vector3(0, 0.35, -2);
    damper.init(pos, lookAt, 0);

    const targetPos = new THREE.Vector3(-2, 0.15, -88);
    const targetLookAt = new THREE.Vector3(-0.9, 0.5, -102);

    // Step 60 frames
    let result = { position: pos, lookAt: lookAt, roll: 0, smoothProgress: 0 };
    for (let f = 0; f < 60; f++) {
      result = damper.update(targetPos, targetLookAt, 1.0, 1 / 60);
    }

    // Camera should smoothly converge toward target Z (-88)
    expect(result.position.z).toBeLessThan(0);
    expect(result.position.z).toBeGreaterThan(-88);
    expect(result.lookAt.z).toBeLessThan(result.position.z);
  });

  it("silences breathing and roll under reduced motion", () => {
    const damper = createCinemaCameraDamper({
      lambdaPos: 6.2,
      lambdaLook: 10.5,
      breathingAmplitude: 0.003,
      breathingRoll: 0.0015,
      enableBreathing: true,
    });

    const pos = new THREE.Vector3(0, 0, 12);
    const lookAt = new THREE.Vector3(0, 0.35, -2);
    damper.init(pos, lookAt, 0);

    const targetPos = new THREE.Vector3(0, 0, 12);
    const targetLookAt = new THREE.Vector3(0, 0.35, -2);

    const result = damper.update(targetPos, targetLookAt, 0, 1 / 60, {
      isReducedMotion: true,
      additionalRoll: 0.02,
    });

    // In reduced motion, roll should be damped toward 0, not additionalRoll
    expect(result.roll).toBe(0);
  });
});
