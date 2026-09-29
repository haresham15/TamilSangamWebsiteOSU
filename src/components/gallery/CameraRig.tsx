"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { galleryScrollState } from "./galleryStore";
import { HERO_CONSTANTS, getHeroTimelineValues } from "./heroTimeline";

export function CameraRig() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const lookTargetRef = useRef(new THREE.Vector3(10.0, 4.5, -380));
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (!cameraRef.current) return;
    const time = state.clock.getElapsedTime();

    // 1. Handheld Camera Simplex Micro-Sway (±0.4° roll, ±0.02m position noise)
    const swayX = Math.sin(time * 0.9) * 0.015 + Math.cos(time * 1.7) * 0.008;
    const swayY = Math.cos(time * 0.8) * 0.012 + Math.sin(time * 1.5) * 0.006;
    const swayRoll = (Math.sin(time * 0.65) * 0.006 + Math.cos(time * 1.2) * 0.003); // in radians (~0.35°)

    // 2. Eased Pointer Parallax (±0.6° deflection)
    const parallaxX = pointer.x * 0.45;
    const parallaxY = pointer.y * 0.25;

    // 3. Scroll timeline camera position (PRD Section 5.6: master timeline curves)
    const p = galleryScrollState.progress;
    const timeline = getHeroTimelineValues(p);

    // Apply combined transform
    cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, parallaxX + swayX, 0.08);
    cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, timeline.cameraY + parallaxY + swayY, 0.08);
    cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, timeline.cameraZ, 0.1);

    // Subtle anamorphic roll
    cameraRef.current.rotation.z = swayRoll;

    // Look at setting sun horizon point (Z = -380)
    lookTargetRef.current.set(16.0 + parallaxX * 2.0, 7.0 + parallaxY * 1.5, -380);
    cameraRef.current.lookAt(lookTargetRef.current);

    if (Math.abs(cameraRef.current.fov - timeline.fov) > 0.02) {
      cameraRef.current.fov = timeline.fov;
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, HERO_CONSTANTS.cameraEyeHeight, 0]}
      fov={HERO_CONSTANTS.baseFov}
      near={0.1}
      far={600}
    />
  );
}
