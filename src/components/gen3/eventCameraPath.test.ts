import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { updateEventCamera, EVENT_CAMERA_STOPS } from "./eventCameraPath";
import { createCinemaCameraDamper } from "@/lib/cinemaCameraDamper";

describe("Hero 2 (Events) Camera Path & Damper Parity", () => {
  it("preserves exact waypoint parity across all 5 stops between baseline and cinematic mode", () => {
    const posBaseline = new THREE.Vector3();
    const lookBaseline = new THREE.Vector3();
    const posCinematic = new THREE.Vector3();
    const lookCinematic = new THREE.Vector3();

    for (const stop of EVENT_CAMERA_STOPS) {
      updateEventCamera(stop.p, false, posBaseline, lookBaseline, false);
      updateEventCamera(stop.p, false, posCinematic, lookCinematic, true);

      // Position delta must be < 0.0001m
      expect(posBaseline.distanceTo(posCinematic)).toBeLessThan(0.0001);
      // LookAt Y delta must be < 0.0001m
      expect(Math.abs(lookBaseline.y - lookCinematic.y)).toBeLessThan(0.0001);

      // Exact match to stop definition
      expect(posCinematic.x).toBeCloseTo(stop.position[0], 3);
      expect(posCinematic.y).toBeCloseTo(stop.position[1], 3);
      expect(posCinematic.z).toBeCloseTo(stop.position[2], 3);
      expect(lookCinematic.y).toBeCloseTo(stop.lookY, 3);
    }
  });

  it("converges to waypoint with delta < 0.005m after settling", () => {
    const damper = createCinemaCameraDamper({ lambdaPos: 5.8, lambdaLook: 9.5, enableBreathing: false });
    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3();

    // Start at stop 0
    updateEventCamera(0, false, targetPos, targetLook, true);
    damper.init(targetPos, targetLook, 0);

    // Jump scroll to stop 2 (p = 0.62)
    updateEventCamera(0.62, false, targetPos, targetLook, true);

    // Simulate 2.5 seconds at 60fps
    let result = { position: new THREE.Vector3(), lookAt: new THREE.Vector3() };
    for (let i = 0; i < 150; i++) {
      result = damper.update(targetPos, targetLook, 0.62, 1 / 60, { isReducedMotion: true });
    }

    // Must be converged within 0.005m
    const distance = result.position.distanceTo(targetPos);
    expect(distance).toBeLessThan(0.005);
  });

  it("silences Technocrane Dutch-roll when isReducedMotion is true", () => {
    const damper = createCinemaCameraDamper({ lambdaPos: 5.8, lambdaLook: 9.5 });
    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3();
    updateEventCamera(0.3, false, targetPos, targetLook, true);
    damper.init(targetPos, targetLook, 0.3);

    const roll = Math.sin(0.3 * Math.PI * 2) * 0.022;

    let normalResult = { position: new THREE.Vector3(), lookAt: new THREE.Vector3(), roll: 0, smoothProgress: 0 };
    for (let i = 0; i < 15; i++) {
      normalResult = damper.update(targetPos, targetLook, 0.3, 1 / 60, {
        isReducedMotion: false,
        additionalRoll: roll,
      });
    }
    expect(Math.abs(normalResult.roll)).toBeGreaterThan(0.01);

    const reducedDamper = createCinemaCameraDamper({ lambdaPos: 5.8, lambdaLook: 9.5 });
    reducedDamper.init(targetPos, targetLook, 0.3);
    const reducedResult = reducedDamper.update(targetPos, targetLook, 0.3, 1 / 60, {
      isReducedMotion: true,
      additionalRoll: roll,
    });
    expect(reducedResult.roll).toBe(0);
  });
});
