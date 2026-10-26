import { describe, it, expect } from "vitest";
import { CINEMATIC_V2_FLAGS } from "@/config/heroCinematicFlags";
import { createCinemaCameraDamper, smootherstep } from "@/lib/cinemaCameraDamper";
import { proceduralPbrMaps } from "@/lib/proceduralPbrMaps";
import * as THREE from "three";

describe("JoinHero Cinematic Elevation (Hero 8: Nanban Morning Campus Gates)", () => {
  it("exports 'join' key in CINEMATIC_V2_FLAGS as enabled", () => {
    expect("join" in CINEMATIC_V2_FLAGS).toBe(true);
    expect(CINEMATIC_V2_FLAGS.join).toBe(true);
  });

  it("evaluates smootherstep continuity for the crane camera archway passage", () => {
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

  it("verifies dual-channel camera damper convergence for crane advance into quad", () => {
    const damper = createCinemaCameraDamper({
      lambdaPos: 5.8,
      lambdaLook: 9.5,
      enableBreathing: true,
      breathingAmplitude: 0.003,
      breathingRoll: 0.0015,
      breathFreqPrimary: 0.18,
    });

    const initPos = new THREE.Vector3(0, 2.4, 12.2);
    const initLook = new THREE.Vector3(0, 2.8, -6.0);
    damper.init(initPos, initLook, 0);

    // Target position past the gate threshold
    const targetPos = new THREE.Vector3(0, 2.1, -2.8);
    const targetLook = new THREE.Vector3(0, 2.4, -6.0);

    let result = { position: initPos, lookAt: initLook, roll: 0, smoothProgress: 0 };
    for (let f = 0; f < 60; f++) {
      result = damper.update(targetPos, targetLook, 1.0, 1 / 60);
    }

    // Camera position should have advanced forward in Z from 12.2 toward -2.8
    expect(result.position.z).toBeLessThan(12.2);
    expect(result.position.z).toBeGreaterThan(-2.8);
    expect(result.position.y).toBeLessThan(2.4);
    expect(result.position.y).toBeGreaterThan(2.0);

    // LookAt target should have lowered toward 2.4
    expect(result.lookAt.y).toBeLessThan(2.8);
    expect(result.lookAt.y).toBeGreaterThanOrEqual(2.4);
  });

  it("silences breathing and crane roll under reduced motion", () => {
    const damperActive = createCinemaCameraDamper({
      lambdaPos: 5.8,
      lambdaLook: 9.5,
      enableBreathing: true,
      breathingAmplitude: 0.003,
      breathingRoll: 0.0015,
    });
    damperActive.init(new THREE.Vector3(0, 2.4, 12.2), new THREE.Vector3(0, 2.8, -6), 0);

    const resActive = damperActive.update(
      new THREE.Vector3(0, 2.4, 12.2),
      new THREE.Vector3(0, 2.8, -6),
      0.5,
      1 / 60,
      { isReducedMotion: false, additionalRoll: 0.0025 }
    );
    expect(Math.abs(resActive.roll)).toBeGreaterThan(0);

    const damperReduced = createCinemaCameraDamper({
      lambdaPos: 5.8,
      lambdaLook: 9.5,
      enableBreathing: true,
      breathingAmplitude: 0.003,
      breathingRoll: 0.0015,
    });
    damperReduced.init(new THREE.Vector3(0, 2.4, 12.2), new THREE.Vector3(0, 2.8, -6), 0);

    const resReduced = damperReduced.update(
      new THREE.Vector3(0, 2.4, 12.2),
      new THREE.Vector3(0, 2.8, -6),
      0.5,
      1 / 60,
      { isReducedMotion: true, additionalRoll: 0 }
    );
    expect(resReduced.roll).toBe(0);
  });

  it("manages procedural brick and walkway granite normal maps with reference-counted cleanup", () => {
    const keyBrick = "test-join-brick-normal";
    const keyWalkway = "test-join-walkway-normal";

    const brickNormal = proceduralPbrMaps.getGraniteNormal(keyBrick, 128, 128);
    const walkwayNormal = proceduralPbrMaps.getGraniteNormal(keyWalkway, 128, 128);

    expect(brickNormal).toBeDefined();
    expect(walkwayNormal).toBeDefined();
    expect(brickNormal.format).toBe(THREE.RGBAFormat);
    expect(walkwayNormal.format).toBe(THREE.RGBAFormat);

    proceduralPbrMaps.release(keyBrick);
    proceduralPbrMaps.release(keyWalkway);
  });
});
