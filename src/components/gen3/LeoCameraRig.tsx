"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PerspectiveCamera } from "@react-three/drei";
import { leoKinematics } from "@/store/leoHeroStore";

/**
 * LeoCameraRig (§Phase 1 Directive)
 * 
 * Shock-absorber camera rig that decouples the scroll engine from the camera.
 * Rather than setting camera.position directly from scroll frames, it reads
 * leoKinematics.targetPosition and interpolates with a 4.5 * delta dampening factor.
 */
export function LeoCameraRig() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const currentLookAt = useRef(new THREE.Vector3(0, 3.5, 0));
  const { set } = useThree();

  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current });
    }
  }, [set]);

  useFrame((state, delta) => {
    const cam = cameraRef.current || state.camera;
    if (!cam) return;

    // 1. Calculate shock-absorber dampening factor per Phase 1 specification
    // Clamp delta to prevent overshooting on tab-switches or severe frame drops
    const safeDelta = Math.min(Math.max(delta, 0.001), 0.1);
    const dampFactor = Math.min(1.0, 4.5 * safeDelta);

    // 2. Smoothly glide camera position toward targetPosition without allocations
    cam.position.lerp(leoKinematics.targetPosition, dampFactor);

    // 3. Smoothly interpolate lookAt vector for buttery smooth panning
    currentLookAt.current.lerp(leoKinematics.targetLookAt, dampFactor);
    cam.lookAt(currentLookAt.current);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0.0, 13.5, 21.8]}
      fov={40}
      near={0.1}
      far={100}
    />
  );
}

export default LeoCameraRig;
