"use client";

import React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface CraneCameraRigProps {
  scrollProgressRef: React.RefObject<number>;
}

export function CraneCameraRig({ scrollProgressRef }: CraneCameraRigProps) {
  useFrame((state) => {
    const p = scrollProgressRef.current ?? 0;
    const camera = state.camera;

    // Kinematic Camera Track:
    // p = 0.0 -> z = 10.5 (approaching exterior)
    // p = 0.75 -> z = 1.8 (gate already 100% open, clear threshold)
    // p = 0.85 -> z = 0.0 (passing through the gate opening)
    // p = 1.0 -> z = -2.8 (inside campus, bathed in dawn sunlight)

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
      // Phase 3: Passing threshold with clearance margin and entering campus
      const t = (p - 0.75) / 0.25;
      targetZ = THREE.MathUtils.lerp(2.0, -2.8, t);
      targetY = THREE.MathUtils.lerp(2.2, 2.1, t);
      targetLookY = THREE.MathUtils.lerp(2.6, 2.4, t);
    }

    // Subtle gentle crane glide (smooth interpolation)
    camera.position.x = 0;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.12);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.12);

    camera.lookAt(0, targetLookY, -6);

    if ("fov" in camera) {
      const targetFov = THREE.MathUtils.lerp(42, 46, p);
      (camera as THREE.PerspectiveCamera).fov = targetFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
