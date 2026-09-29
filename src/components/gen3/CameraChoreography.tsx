"use client";

import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getScrollProgress } from "./useScrollCinematic";
import { PerspectiveCamera } from "@react-three/drei";

// ---------------------------------------------------------------------------
// Cinematic Leo Factory Camera Flight Trajectory
// Continuous Catmull-Rom Spline with C^1 differential continuity eliminates
// all velocity spikes, piecewise hitching, and discrete scroll twitches.
// ---------------------------------------------------------------------------

const CAM_POINTS = [
  new THREE.Vector3(0.0, 13.5, 21.8),   // p = 0.0: High elevated crane POV overlooking the sodium arena
  new THREE.Vector3(1.35, 10.6, 21.2),  // p = 0.30: Graceful cinematic sweep to the right, descending
  new THREE.Vector3(-0.95, 8.2, 20.7),  // p = 0.62: Counter-swing across center to the left, descending
  new THREE.Vector3(0.30, 6.7, 20.45),  // p = 0.85: Gentle deceleration and re-centering
  new THREE.Vector3(0.0, 6.0, 20.4),    // p = 1.0: Precise turntable hero lock
];

const LOOK_POINTS = [
  new THREE.Vector3(0, 3.5, 0),         // p = 0.0: Framing the full vertical arena
  new THREE.Vector3(0, 3.35, 0),        // p = 0.30
  new THREE.Vector3(0, 3.2, 0),         // p = 0.62
  new THREE.Vector3(0, 3.05, 0),        // p = 0.85
  new THREE.Vector3(0, 3.0, 0),         // p = 1.0: Locked onto the spinning medallion
];

const START_FOV = 40;
const END_FOV = 38;

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function CameraChoreography() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const currentProgress = useRef(0);
  const targetPos = useRef(new THREE.Vector3().copy(CAM_POINTS[0]));
  const targetLook = useRef(new THREE.Vector3().copy(LOOK_POINTS[0]));
  const { size } = useThree();

  // Pre-construct Catmull-Rom splines for zero-garbage evaluation per frame
  const posCurve = useMemo(
    () => new THREE.CatmullRomCurve3(CAM_POINTS, false, "centripetal", 0.5),
    []
  );
  const lookCurve = useMemo(
    () => new THREE.CatmullRomCurve3(LOOK_POINTS, false, "centripetal", 0.5),
    []
  );

  useFrame((_, delta) => {
    if (!cameraRef.current) return;

    // 1. Fetch raw progress from GSAP ScrollTrigger
    const rawProgress = getScrollProgress();
    const clampedProgress = Math.min(1.0, Math.max(0.0, rawProgress));

    // 2. Exponential damp progress to absorb any micro frame timing variations
    const safeDelta = Math.min(Math.max(delta, 0.001), 0.1);
    currentProgress.current = THREE.MathUtils.damp(
      currentProgress.current,
      clampedProgress,
      12.0,
      safeDelta
    );

    // 3. Evaluate single global easing curve
    const smoothP = easeInOutCubic(currentProgress.current);

    // 4. Sample continuous 3D Catmull-Rom trajectory (C^1 continuous velocity)
    posCurve.getPoint(smoothP, targetPos.current);
    lookCurve.getPoint(smoothP, targetLook.current);
    const targetFov = THREE.MathUtils.lerp(START_FOV, END_FOV, smoothP);

    // 5. Responsive portrait phone adaptation
    const isPortrait = size.width < size.height;
    if (isPortrait) {
      targetPos.current.x = 0; // Lock lateral swing on narrow screens
      targetPos.current.z = targetPos.current.z * 1.36; // Step back for phone aspect ratio
      targetPos.current.y = Math.min(12.5, targetPos.current.y * 0.94);
      targetLook.current.y = 3.3;
    }

    // 6. Direct application: smooth trajectory already completely eliminates jitter
    cameraRef.current.position.copy(targetPos.current);
    cameraRef.current.lookAt(targetLook.current);

    // 7. Update projection matrix only when FOV actually changes
    const finalFov = targetFov * (isPortrait ? 1.15 : 1.0);
    if (Math.abs(cameraRef.current.fov - finalFov) > 0.02) {
      cameraRef.current.fov = finalFov;
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 13.5, 21.8]}
      fov={40}
      near={0.1}
      far={100}
    />
  );
}

