import { describe, it, expect } from "vitest";
import { CINEMATIC_V2_FLAGS } from "@/config/heroCinematicFlags";
import { createCinemaCameraDamper, smootherstep } from "@/lib/cinemaCameraDamper";
import { proceduralPbrMaps } from "@/lib/proceduralPbrMaps";
import * as THREE from "three";

describe("SuggestionsHero Cinematic Elevation (Hero 7: Kaththi Blueprint War Room)", () => {
  it("exports 'suggestions' key in CINEMATIC_V2_FLAGS as enabled", () => {
    expect("suggestions" in CINEMATIC_V2_FLAGS).toBe(true);
    expect(CINEMATIC_V2_FLAGS.suggestions).toBe(true);
  });

  it("evaluates smootherstep continuity for the Ohio Stadium construction elevation", () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(0.5)).toBeCloseTo(0.5, 4);

    let prev = 0;
    for (let t = 0.05; t <= 1.0; t += 0.05) {
      const cur = smootherstep(t);
      expect(cur).toBeGreaterThanOrEqual(prev);
      prev = cur;
    }
  });

  it("verifies dual-channel camera damper convergence for axonometric CAD sweep", () => {
    const damper = createCinemaCameraDamper({
      lambdaPos: 5.5,
      lambdaLook: 9.0,
      enableBreathing: true,
      breathingAmplitude: 0.002,
      breathingRoll: 0.001,
      breathFreqPrimary: 0.14,
    });

    const initPos = new THREE.Vector3(16.0, 13.5, 18.5);
    const initLook = new THREE.Vector3(0.0, 1.4, -1.2);
    damper.init(initPos, initLook, 0);

    // Target elevated vantage point
    const targetPos = new THREE.Vector3(14.8, 14.5, 17.2);
    const targetLook = new THREE.Vector3(0.0, 2.0, -1.5);

    let result = { position: initPos, lookAt: initLook, roll: 0, smoothProgress: 0 };
    for (let f = 0; f < 60; f++) {
      result = damper.update(targetPos, targetLook, 1.0, 1 / 60);
    }

    // Camera position should have smoothly damped toward targetPos
    expect(result.position.x).toBeLessThan(16.0);
    expect(result.position.x).toBeGreaterThan(14.5);
    expect(result.position.y).toBeGreaterThan(13.5);
    expect(result.position.y).toBeLessThanOrEqual(14.6);
    expect(result.position.z).toBeLessThan(18.5);
    expect(result.position.z).toBeGreaterThan(17.0);

    // LookAt target should have elevated toward 2.0
    expect(result.lookAt.y).toBeGreaterThan(1.4);
    expect(result.lookAt.y).toBeLessThanOrEqual(2.0);
  });

  it("silences breathing and rolls cleanly under reduced motion", () => {
    const damperActive = createCinemaCameraDamper({
      lambdaPos: 5.5,
      lambdaLook: 9.0,
      enableBreathing: true,
      breathingAmplitude: 0.002,
    });
    damperActive.init(new THREE.Vector3(16.0, 13.5, 18.5), new THREE.Vector3(0, 1.4, -1.2), 0);

    const resActive = damperActive.update(
      new THREE.Vector3(16.0, 13.5, 18.5),
      new THREE.Vector3(0, 1.4, -1.2),
      0.5,
      1 / 60,
      { isReducedMotion: false, additionalRoll: 0.03 }
    );
    expect(Math.abs(resActive.roll)).toBeGreaterThan(0);

    const damperReduced = createCinemaCameraDamper({
      lambdaPos: 5.5,
      lambdaLook: 9.0,
      enableBreathing: true,
      breathingAmplitude: 0.002,
    });
    damperReduced.init(new THREE.Vector3(16.0, 13.5, 18.5), new THREE.Vector3(0, 1.4, -1.2), 0);

    const resReduced = damperReduced.update(
      new THREE.Vector3(16.0, 13.5, 18.5),
      new THREE.Vector3(0, 1.4, -1.2),
      0.5,
      1 / 60,
      { isReducedMotion: true, additionalRoll: 0 }
    );
    expect(resReduced.roll).toBe(0);
  });

  it("manages procedural brushed brass and paper roughness maps with reference-counted cleanup", () => {
    const keyNormal = "test-suggestions-brass-normal";
    const keyRough = "test-suggestions-paper-rough";

    const normalMap = proceduralPbrMaps.getBrushedMetalNormal(keyNormal, 128, 128);
    const roughMap = proceduralPbrMaps.getNoiseRoughness(keyRough, 128, 128, 0.2, 0.4);

    expect(normalMap).toBeDefined();
    expect(roughMap).toBeDefined();
    expect(normalMap.format).toBe(THREE.RGBAFormat);
    expect(normalMap.colorSpace).toBe(THREE.LinearSRGBColorSpace);

    proceduralPbrMaps.release(keyNormal);
    proceduralPbrMaps.release(keyRough);
  });
});
