"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PerspectiveCamera } from "@react-three/drei";
import { leoKinematics } from "@/store/leoHeroStore";
import { getScrollProgress } from "./useScrollCinematic";
import { createCinemaCameraDamper } from "@/lib/cinemaCameraDamper";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { useReducedMotion } from "framer-motion";
import { useLiteMode } from "@/context/LiteModeContext";

/**
 * LeoCameraRig (§Phase 1 Directive & Cinematic V2 Elevation)
 * 
 * Frame-rate-independent dual-channel camera damper with Technocrane Dutch-roll banking,
 * harmonic organic micro-breathing, and strict reduced-motion/Lite silencing.
 * When `isHeroCinematicEnabled("events")` is false, gracefully preserves exact baseline.
 */
export function LeoCameraRig() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const currentLookAt = useRef(new THREE.Vector3(0, 3.5, 0));
  const { set } = useThree();
  const reducedMotion = useReducedMotion();
  const { isLiteMode } = useLiteMode();

  const damperRef = useRef(
    createCinemaCameraDamper({
      lambdaPos: 5.8,
      lambdaLook: 9.5,
      breathingAmplitude: 0.0035,
      breathingRoll: 0.0018,
    })
  );

  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current });
      damperRef.current.init(
        new THREE.Vector3(0.0, 13.5, 21.8),
        new THREE.Vector3(0.0, 3.5, 0.0),
        getScrollProgress()
      );
    }
  }, [set]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const cam = cameraRef.current || state.camera;
    if (!cam) return;

    const cinematic = isHeroCinematicEnabled("events");
    const rawP = getScrollProgress();

    if (cinematic) {
      // Elevated Cinematic V2: Dual-channel damper + Technocrane Dutch-roll banking (±0.022 rad)
      const roll = Math.sin(rawP * Math.PI * 2) * 0.022;
      const result = damperRef.current.update(
        leoKinematics.targetPosition,
        leoKinematics.targetLookAt,
        rawP,
        dt,
        {
          isReducedMotion: !!reducedMotion,
          isLiteMode,
          additionalRoll: roll,
        }
      );

      cam.position.copy(result.position);
      cam.lookAt(result.lookAt);
      cam.rotation.z = result.roll;
    } else {
      // Baseline Shock-Absorber Lerp (§Phase 1)
      const dampFactor = 1.0 - Math.exp(-8.0 * dt);
      cam.position.lerp(leoKinematics.targetPosition, dampFactor);
      currentLookAt.current.lerp(leoKinematics.targetLookAt, dampFactor);
      cam.lookAt(currentLookAt.current);

      const roll = Math.sin(rawP * Math.PI * 2) * 0.018;
      cam.rotation.z += roll;
    }
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
