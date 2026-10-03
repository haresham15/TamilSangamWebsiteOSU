"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { heroState } from "./state";
import { getCameraS } from "./neck/fretMath";
import { getSharedHeroRefs } from "./props/types";

interface CameraRigProps {
  propRigRef?: React.RefObject<THREE.Group | null>;
  children?: React.ReactNode;
}

/**
 * CameraRig (§3.5)
 *
 * - FOV 35° long-lens compression, eye height y = 2.6 above fretboard.
 * - Pitched ~9° down at look target 14.0 su ahead at y = 0.3.
 * - Handheld micro-sway: ±0.04 su breath (0.07 Hz) + 1.5° roll.
 * - Moves linearly along neck axis: z = -s_cam(p) = -75.0 * p.
 * - Controls the PropRig group (centered 14.0 su ahead of camera).
 * - Reacts to Era 3 finale extra dolly (+2.5 su) and fov narrowing (35° -> 30°).
 */
export function CameraRig({ propRigRef, children }: CameraRigProps) {
  const currentLookAt = useRef(new THREE.Vector3(0, 0.3, -14.0));
  const targetLookAt = useMemo(() => new THREE.Vector3(0, 0.3, -14.0), []);

  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
  }, []);

  useFrame((state) => {
    const cam = state.camera;
    if (!cam) return;

    const heroRefs = getSharedHeroRefs();
    const dolly = heroRefs.rig.dolly.value;
    const targetFov = heroRefs.rig.fov.value;

    if (cam instanceof THREE.PerspectiveCamera && Math.abs(cam.fov - targetFov) > 0.01) {
      cam.fov = targetFov;
      cam.updateProjectionMatrix();
    }

    const p = heroState.progress;
    const sCam = getCameraS(p);

    // Natural breath sway (off if prefersReducedMotion)
    const time = state.clock.getElapsedTime();
    const breath = prefersReducedMotion.current
      ? 0.0
      : Math.sin(time * 0.44) * 0.035;
    const roll = prefersReducedMotion.current
      ? 0.0
      : Math.sin(time * 0.28) * 0.012; // ~0.7° roll

    // Camera world position: follows neck axis along negative Z, plus extra dolly
    cam.position.set(0.0, 2.6 + breath, -sCam - dolly);
    cam.rotation.z = roll;

    // Look target 14 su ahead on the neck at y = 0.3
    const sTarget = sCam + 14.0;
    targetLookAt.set(0.0, 0.3, -sTarget);

    currentLookAt.current.lerp(targetLookAt, 0.15);
    cam.lookAt(currentLookAt.current);

    // Update PropRig position (anchored 14 su ahead of camera)
    if (propRigRef && propRigRef.current) {
      propRigRef.current.position.set(0.0, 0.0, -sTarget);
    }
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0.0, 2.6, 0.0]}
        fov={35}
        near={0.1}
        far={400}
      />
      {children}
    </>
  );
}
