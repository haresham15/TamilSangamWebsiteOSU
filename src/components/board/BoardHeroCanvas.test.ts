import { describe, it, expect } from "vitest";
import { CINEMATIC_V2_FLAGS } from "@/config/heroCinematicFlags";
import { createCinemaCameraDamper, smootherstep } from "@/lib/cinemaCameraDamper";
import { proceduralPbrMaps } from "@/lib/proceduralPbrMaps";
import * as THREE from "three";

describe("BoardHeroCanvas Cinematic Elevation", () => {
  it("exports 'board' key in CINEMATIC_V2_FLAGS as enabled", () => {
    expect("board" in CINEMATIC_V2_FLAGS).toBe(true);
    expect(CINEMATIC_V2_FLAGS.board).toBe(true);
  });

  it("evaluates smootherstep continuity and monotonicity for board colonnade progression", () => {
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

  it("verifies crane camera damper stability along colonnade corridor", () => {
    const damper = createCinemaCameraDamper({
      lambdaPos: 6.0,
      lambdaLook: 9.8,
      breathingAmplitude: 0.003,
      breathingRoll: 0.002,
    });

    const initPos = new THREE.Vector3(0, 2.22, 30);
    const initLook = new THREE.Vector3(0, 1.38, 22);
    damper.init(initPos, initLook, 0);

    const targetPos = new THREE.Vector3(0.1, 1.62, 5.2);
    const targetLook = new THREE.Vector3(0.05, 1.62, -3.3);

    let result = { position: initPos, lookAt: initLook, roll: 0, smoothProgress: 0 };
    for (let f = 0; f < 60; f++) {
      result = damper.update(targetPos, targetLook, 1.0, 1 / 60);
    }

    // Camera should smoothly move from Z=30 towards Z=5.2
    expect(result.position.z).toBeLessThan(30);
    expect(result.position.z).toBeGreaterThan(5.0);
    expect(result.lookAt.z).toBeLessThan(result.position.z);
  });

  it("silences breathing and rolls cleanly under reduced motion", () => {
    const damper = createCinemaCameraDamper({
      lambdaPos: 6.0,
      lambdaLook: 9.8,
      breathingAmplitude: 0.003,
      breathingRoll: 0.002,
      enableBreathing: true,
    });

    const pos = new THREE.Vector3(0, 2.22, 30);
    const lookAt = new THREE.Vector3(0, 1.62, 22);
    damper.init(pos, lookAt, 0);

    const res = damper.update(pos, lookAt, 0, 1 / 60, {
      isReducedMotion: true,
      additionalRoll: 0.05,
    });

    expect(res.roll).toBe(0);
  });

  it("allocates and releases procedural PBR textures for the board corridor floor and crown", () => {
    const graniteNormal = proceduralPbrMaps.getGraniteNormal("test-board-granite", 64, 64);
    expect(graniteNormal).toBeInstanceOf(THREE.DataTexture);
    expect(graniteNormal.image.width).toBe(64);
    expect(graniteNormal.image.height).toBe(64);

    const goldNormal = proceduralPbrMaps.getBrushedMetalNormal("test-chola-gold", 64, 64);
    expect(goldNormal).toBeInstanceOf(THREE.DataTexture);

    const floorRough = proceduralPbrMaps.getNoiseRoughness("test-board-rough", 64, 64, 0.1, 0.3);
    expect(floorRough).toBeInstanceOf(THREE.DataTexture);

    // Release cleanly
    proceduralPbrMaps.release("test-board-granite");
    proceduralPbrMaps.release("test-chola-gold");
    proceduralPbrMaps.release("test-board-rough");
  });
});
