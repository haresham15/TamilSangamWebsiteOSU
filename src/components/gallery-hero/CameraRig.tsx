"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { heroState, registerCameraSnapHandler, unregisterCameraSnapHandler, triggerHeroPluck } from "./state";
import { useTier } from "@/components/providers/TierProvider";
import { useLiteMode } from "@/context/LiteModeContext";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { createCinemaCameraDamper, smootherstep } from "@/lib/cinemaCameraDamper";

/**
 * LAYER 5: 3-ACT SHALLOW-ANGLE 85MM MACRO CAMERA SPLINE (CatmullRomCurve3)
 * 
 * - Act I (p = 0.00 -> 0.28): Intimate oblique macro angle ([-1.8, 0.75, 4.8], lookAt [0.15, 0.1, -1.2], FOV 34°)
 * - Act II (p = 0.28 -> 0.78): Cinema rail parallel to strings (pos -> [0.9, 0.4, -3.5], lookAt -> [-0.2, 0.0, -7.5])
 *   with subtle ±2° cinema Dutch roll. Plucks Vaaranam Aayiram D-Major9 arpeggio across scroll thresholds.
 * - Act III (p = 0.78 -> 1.00): Rosette resonance close-up with seamless EditorialSheetHandoff
 * - Cinematic elevation: dual-channel cinema damper, Hermite smootherstep, dynamic FOV & micro-breathing.
 */

const SCROLL_PLUCK_THRESHOLDS = [0.20, 0.32, 0.44, 0.56, 0.68, 0.78];

export function CameraRig({
  propRigRef,
  children,
}: {
  propRigRef?: React.RefObject<THREE.Group | null>;
  children?: React.ReactNode;
}) {
  const tier = useTier();
  const { isLiteMode } = useLiteMode();
  const prefersReducedMotion = useRef(false);

  const damperRef = useRef(
    createCinemaCameraDamper({
      lambdaPos: 5.8,
      lambdaLook: 9.5,
      breathingAmplitude: 0.003,
      breathingRoll: 0.002,
      breathFreqPrimary: 0.26,
      breathFreqSecondary: 1.12,
    })
  );

  // Single-damped scroll progress (lambda = 4.2)
  const smoothP = useRef<number>(0.0);
  const initialized = useRef(false);
  const lastCrossedThreshold = useRef<number>(-1);

  // 1. Camera Position Spline (3-Act Oblique Cinema Rail)
  const cameraPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.8, 0.75, 4.8),  // Act I start: intimate oblique macro
      new THREE.Vector3(-1.0, 0.65, 2.2),  // Act I -> II transition
      new THREE.Vector3(-0.1, 0.52, -0.2), // Act II corridor mid
      new THREE.Vector3(0.7, 0.42, -2.4),  // Act II corridor lower
      new THREE.Vector3(0.9, 0.40, -3.5),  // Act II end: parallel rail
      new THREE.Vector3(0.45, 0.30, -2.2), // Act III: close-up on glowing rosette
    ]);
  }, []);

  // 2. Camera LookAt Target Spline
  const lookAtPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.15, 0.10, -1.2), // Act I: looking diagonally across strings
      new THREE.Vector3(0.10, 0.08, -2.8), // Act I -> II: looking over soundhole
      new THREE.Vector3(0.00, 0.05, -4.5), // Act II: corridor depth
      new THREE.Vector3(-0.12, 0.02, -6.2),// Act II: towards bridge
      new THREE.Vector3(-0.20, 0.00, -7.5),// Act II end: horizon sweep
      new THREE.Vector3(0.00, -0.05, -2.4),// Act III: center of Mother-of-Pearl Rosette
    ]);
  }, []);

  const currentLookAt = useRef(new THREE.Vector3(0.15, 0.10, -1.2));
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempLook = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }

    // Register snap handler for deterministic screenshot / capture tooling
    const handleSnap = (p: number) => {
      smoothP.current = p;
      lastCrossedThreshold.current = -1;
    };

    registerCameraSnapHandler(handleSnap);
    return () => {
      unregisterCameraSnapHandler();
    };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const cam = state.camera;
    if (!cam) return;

    const targetP = heroState.progress;
    const isReduced = prefersReducedMotion.current || tier === "C";

    if (!initialized.current) {
      smoothP.current = targetP;
      initialized.current = true;
    }

    const isCinematic = isHeroCinematicEnabled("gallery");

    if (!isCinematic) {
      // Baseline single-damper scroll physics (100% rollback preserved)
      if (isReduced) {
        smoothP.current = targetP;
      } else {
        smoothP.current = THREE.MathUtils.damp(smoothP.current, targetP, 4.2, dt);
      }

      const p = Math.min(1.0, Math.max(0.0, smoothP.current));

      // Scroll threshold automatic arpeggio pluck trigger
      SCROLL_PLUCK_THRESHOLDS.forEach((thresh, i) => {
        if (p >= thresh && lastCrossedThreshold.current < i) {
          lastCrossedThreshold.current = i;
          triggerHeroPluck(i, 0.75);
        }
      });
      if (p < 0.15) {
        lastCrossedThreshold.current = -1;
      }

      // Evaluate position and lookAt on splines
      cameraPath.getPointAt(p, tempPos);
      lookAtPath.getPointAt(p, tempLook);

      // Subtle handheld breath sway and Dutch cinema roll
      const t = state.clock.getElapsedTime();
      const breath = isReduced ? 0.0 : Math.sin(t * 0.44) * 0.025;
      const roll = isReduced
        ? 0.0
        : Math.sin(p * Math.PI) * 0.035 + Math.sin(t * 0.28) * 0.008; // ±2° Dutch roll

      cam.position.set(tempPos.x, tempPos.y + breath, tempPos.z);
      currentLookAt.current.lerp(tempLook, Math.min(1.0, 10.0 * dt));
      cam.lookAt(currentLookAt.current);
      if (!isReduced && roll !== 0) {
        cam.rotateZ(roll);
      }
    } else {
      // Cinematic elevation: Hermite smootherstep + dual-channel exponential damper
      const rawP = Math.min(1.0, Math.max(0.0, targetP));
      const smoothedP = smootherstep(rawP);

      SCROLL_PLUCK_THRESHOLDS.forEach((thresh, i) => {
        if (smoothedP >= thresh && lastCrossedThreshold.current < i) {
          lastCrossedThreshold.current = i;
          triggerHeroPluck(i, 0.75);
        }
      });
      if (smoothedP < 0.15) {
        lastCrossedThreshold.current = -1;
      }

      cameraPath.getPointAt(smoothedP, tempPos);
      lookAtPath.getPointAt(smoothedP, tempLook);

      const targetRoll = isReduced ? 0.0 : Math.sin(smoothedP * Math.PI) * 0.035;
      const damped = damperRef.current.update(tempPos, tempLook, smoothedP, dt, {
        isReducedMotion: isReduced,
        isLiteMode,
        additionalRoll: targetRoll,
      });

      cam.position.copy(damped.position);
      currentLookAt.current.copy(damped.lookAt);
      cam.lookAt(damped.lookAt);
      if (!isReduced && damped.roll !== 0) {
        cam.rotation.z = damped.roll;
      }

      // Dynamic FOV expansion: 34° macro -> 42° mid rail -> 32° close-up
      if ("fov" in cam) {
        const persCam = cam as THREE.PerspectiveCamera;
        const targetFov = smoothedP < 0.5
          ? THREE.MathUtils.lerp(34, 42, smoothedP / 0.5)
          : THREE.MathUtils.lerp(42, 32, (smoothedP - 0.5) / 0.5);
        persCam.fov = targetFov;
        persCam.updateProjectionMatrix();
      }
    }

    // Prop rig position update
    if (propRigRef && propRigRef.current) {
      propRigRef.current.position.copy(currentLookAt.current);
    }
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[-1.8, 0.75, 4.8]}
        fov={34} // 85mm long-lens macro cinema compression
        near={0.01}
        far={350}
      />
      {children}
    </>
  );
}

export default CameraRig;
