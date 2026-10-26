import { describe, it, expect } from "vitest";
import { CINEMATIC_V2_FLAGS } from "@/config/heroCinematicFlags";
import { createCinemaCameraDamper, smootherstep } from "@/lib/cinemaCameraDamper";
import { proceduralPbrMaps } from "@/lib/proceduralPbrMaps";
import * as THREE from "three";

describe("GalleryHero Cinematic Elevation (Hero 5: Vaaranam Aayiram Kodachrome)", () => {
  it("exports 'gallery' key in CINEMATIC_V2_FLAGS as enabled", () => {
    expect("gallery" in CINEMATIC_V2_FLAGS).toBe(true);
    expect(CINEMATIC_V2_FLAGS.gallery).toBe(true);
  });

  it("evaluates smootherstep continuity for fretboard macro-to-rail zoom", () => {
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

  it("verifies camera damper stability along the fretboard speaking length", () => {
    const damper = createCinemaCameraDamper({
      lambdaPos: 5.8,
      lambdaLook: 9.5,
      breathingAmplitude: 0.003,
      breathingRoll: 0.002,
    });

    const initPos = new THREE.Vector3(0.0, 1.45, 6.2);
    const initLook = new THREE.Vector3(0.0, 0.42, 2.5);
    damper.init(initPos, initLook, 0);

    const targetPos = new THREE.Vector3(0.2, 0.85, -4.8);
    const targetLook = new THREE.Vector3(0.0, 0.12, -7.5);

    let result = { position: initPos, lookAt: initLook, roll: 0, smoothProgress: 0 };
    for (let f = 0; f < 60; f++) {
      result = damper.update(targetPos, targetLook, 1.0, 1 / 60);
    }

    // Camera should smoothly track from Z=6.2 towards Z=-4.8
    expect(result.position.z).toBeLessThan(6.2);
    expect(result.position.z).toBeGreaterThan(-5.0);
    expect(result.lookAt.z).toBeLessThan(result.position.z);
  });

  it("silences breathing and rolls cleanly under reduced motion", () => {
    const damper = createCinemaCameraDamper({
      lambdaPos: 5.8,
      lambdaLook: 9.5,
      breathingAmplitude: 0.003,
      breathingRoll: 0.002,
      enableBreathing: true,
    });

    damper.init(new THREE.Vector3(0, 1, 5), new THREE.Vector3(0, 0, 0), 0);

    const resActive = damper.update(
      new THREE.Vector3(0, 1, 5),
      new THREE.Vector3(0, 0, 0),
      0.5,
      1 / 60,
      { isReducedMotion: false, additionalRoll: 0.02 }
    );
    expect(Math.abs(resActive.roll)).toBeGreaterThan(0);

    const damperReduced = createCinemaCameraDamper({
      lambdaPos: 5.8,
      lambdaLook: 9.5,
      breathingAmplitude: 0.003,
      breathingRoll: 0.002,
      enableBreathing: true,
    });
    damperReduced.init(new THREE.Vector3(0, 1, 5), new THREE.Vector3(0, 0, 0), 0);

    // Reduced motion -> roll strictly clamped to 0
    const resReduced = damperReduced.update(
      new THREE.Vector3(0, 1, 5),
      new THREE.Vector3(0, 0, 0),
      0.5,
      1 / 60,
      { isReducedMotion: true, additionalRoll: 0.05 }
    );
    expect(resReduced.roll).toBe(0);
  });

  it("manages reference-counted procedural PBR maps for ebony and slide mounts", () => {
    const normalKey = "test-gallery-ebony-normal";
    const tex1 = proceduralPbrMaps.getBrushedMetalNormal(normalKey, 128, 128);
    expect(tex1).toBeDefined();

    const tex2 = proceduralPbrMaps.getBrushedMetalNormal(normalKey, 128, 128);
    expect(tex2).toBe(tex1); // Cached reference

    proceduralPbrMaps.release(normalKey);
    proceduralPbrMaps.release(normalKey);
  });
});
