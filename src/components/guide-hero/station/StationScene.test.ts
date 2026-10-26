import { describe, it, expect } from "vitest";
import { CINEMATIC_V2_FLAGS } from "@/config/heroCinematicFlags";
import { createCinemaCameraDamper, smootherstep } from "@/lib/cinemaCameraDamper";
import { proceduralPbrMaps } from "@/lib/proceduralPbrMaps";
import * as THREE from "three";

describe("GuideHero Cinematic Elevation (Hero 6: Alaipayuthey Blue-Hour Station)", () => {
  it("exports 'guide' key in CINEMATIC_V2_FLAGS as enabled", () => {
    expect("guide" in CINEMATIC_V2_FLAGS).toBe(true);
    expect(CINEMATIC_V2_FLAGS.guide).toBe(true);
  });

  it("evaluates smootherstep continuity for the station departure vertical ascent", () => {
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

  it("verifies camera damper stability along the calibrated guide rail ascent", () => {
    const damper = createCinemaCameraDamper({
      lambdaPos: 6.2,
      lambdaLook: 9.5,
      breathingAmplitude: 0.002,
      breathingRoll: 0.0015,
      enableBreathing: true,
    });

    const initPos = new THREE.Vector3(0.25, 1.48, 3.55);
    const initLook = new THREE.Vector3(-0.15, 1.52, 0.0);
    damper.init(initPos, initLook, 0);

    const targetPos = new THREE.Vector3(0.0, 14.0, 5.0);
    const targetLook = new THREE.Vector3(0.0, 14.0, -6.0);

    let result = { position: initPos, lookAt: initLook, roll: 0, smoothProgress: 0 };
    for (let f = 0; f < 60; f++) {
      result = damper.update(targetPos, targetLook, 1.0, 1 / 60);
    }

    // Camera should smoothly ascend from Y=1.48 towards Y=14.0
    expect(result.position.y).toBeGreaterThan(1.48);
    expect(result.position.y).toBeLessThan(14.0);
  });

  it("silences breathing and rolls cleanly under reduced motion", () => {
    const damper = createCinemaCameraDamper({
      lambdaPos: 6.2,
      lambdaLook: 9.5,
      breathingAmplitude: 0.002,
      breathingRoll: 0.0015,
      enableBreathing: true,
    });
    damper.init(new THREE.Vector3(0.25, 1.48, 3.55), new THREE.Vector3(0, 1.5, 0), 0);

    const resActive = damper.update(
      new THREE.Vector3(0.25, 1.48, 3.55),
      new THREE.Vector3(0, 1.5, 0),
      0.5,
      1 / 60,
      { isReducedMotion: false, additionalRoll: 0.02 }
    );
    expect(Math.abs(resActive.roll)).toBeGreaterThan(0);

    const damperReduced = createCinemaCameraDamper({
      lambdaPos: 6.2,
      lambdaLook: 9.5,
      breathingAmplitude: 0.002,
      breathingRoll: 0.0015,
      enableBreathing: true,
    });
    damperReduced.init(new THREE.Vector3(0.25, 1.48, 3.55), new THREE.Vector3(0, 1.5, 0), 0);

    const resReduced = damperReduced.update(
      new THREE.Vector3(0.25, 1.48, 3.55),
      new THREE.Vector3(0, 1.5, 0),
      0.5,
      1 / 60,
      { isReducedMotion: true, additionalRoll: 0.05 }
    );
    expect(resReduced.roll).toBe(0);
  });

  it("allocates and releases procedural PBR textures for wet platform and ICF coach", () => {
    const platNormalKey = "test-guide-platform-normal";
    const platNormal = proceduralPbrMaps.getGraniteNormal(platNormalKey, 64, 64);
    expect(platNormal).toBeInstanceOf(THREE.DataTexture);

    const coachNormalKey = "test-guide-coach-normal";
    const coachNormal = proceduralPbrMaps.getBrushedMetalNormal(coachNormalKey, 64, 64);
    expect(coachNormal).toBeInstanceOf(THREE.DataTexture);

    proceduralPbrMaps.release(platNormalKey);
    proceduralPbrMaps.release(coachNormalKey);
  });
});
