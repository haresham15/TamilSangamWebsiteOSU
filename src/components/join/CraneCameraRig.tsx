"use client";

import React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface CraneCameraRigProps {
  scrollProgressRef: React.RefObject<number>;
}

export function CraneCameraRig({ scrollProgressRef }: CraneCameraRigProps) {
  useFrame((state, delta) => {
    const p = scrollProgressRef.current ?? 0;
    const camera = state.camera;

    // Kinematic Camera Track (§1.3 PRD Mandate: Gates finish open at p=0.75, final 25% is threshold & handoff)
    let targetZ = 12.2;
    let targetY = 2.4;
    let targetLookY = 2.8;

    if (p <= 0.25) {
      // Phase 1: Slow crane advance toward closed arch
      const t = p / 0.25;
      targetZ = THREE.MathUtils.lerp(12.2, 7.5, t);
      targetY = THREE.MathUtils.lerp(2.4, 2.3, t);
      targetLookY = THREE.MathUtils.lerp(2.8, 2.9, t);
    } else if (p <= 0.75) {
      // Phase 2: Gates swing open, camera glides toward open portal
      const t = (p - 0.25) / 0.5;
      targetZ = THREE.MathUtils.lerp(7.5, 2.0, t);
      targetY = THREE.MathUtils.lerp(2.3, 2.2, t);
      targetLookY = THREE.MathUtils.lerp(2.9, 2.6, t);
    } else {
      // Phase 3: Passing threshold with clearance margin and entering campus (gate motion complete)
      const t = (p - 0.75) / 0.25;
      targetZ = THREE.MathUtils.lerp(2.0, -2.8, t);
      targetY = THREE.MathUtils.lerp(2.2, 2.1, t);
      targetLookY = THREE.MathUtils.lerp(2.6, 2.4, t);
    }

    // Frame-rate independent damped inertia (§1.3)
    const smoothDelta = Math.min(delta, 0.1);
    camera.position.x = 0;
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 4.8, smoothDelta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 4.8, smoothDelta);

    camera.lookAt(0, targetLookY, -6);

    if ("fov" in camera) {
      const targetFov = THREE.MathUtils.lerp(42, 46, p);
      const persCamera = camera as THREE.PerspectiveCamera;
      persCamera.fov = THREE.MathUtils.damp(persCamera.fov, targetFov, 4.0, smoothDelta);
      persCamera.updateProjectionMatrix();
    }
  });

  return null;
}
