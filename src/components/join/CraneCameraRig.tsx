"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { createCinemaCameraDamper, smootherstep } from "@/lib/cinemaCameraDamper";

interface CraneCameraRigProps {
  scrollProgressRef: React.RefObject<number>;
  /** Extra look-at height at the top of the scroll, eased out by p = 0.35 (art pass framing). */
  lookLift?: number;
  /**
   * Widen the vertical FOV on narrow (portrait) screens so the gate and its arch lettering
   * keep at least ±MIN_HALF_WIDTH_DEG horizontally (art pass).
   */
  fitWidth?: boolean;
}

const MIN_HALF_WIDTH_DEG = 16;
const MAX_FIT_FOV = 62;

/** Vertical FOV (deg) needed to show ±MIN_HALF_WIDTH_DEG horizontally at this aspect. */
export function fovForWidth(aspect: number) {
  const half = THREE.MathUtils.degToRad(MIN_HALF_WIDTH_DEG);
  return Math.min(MAX_FIT_FOV, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(half) / Math.max(aspect, 0.1))));
}

export function CraneCameraRig({ scrollProgressRef, lookLift = 0, fitWidth = false }: CraneCameraRigProps) {
  const isCinematic = isHeroCinematicEnabled("join");
  const damperRef = useRef(
    createCinemaCameraDamper({
      lambdaPos: 5.8,
      lambdaLook: 9.5,
      enableBreathing: true,
      breathingAmplitude: 0.003,
      breathingRoll: 0.0015,
      breathFreqPrimary: 0.18,
    })
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
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

    if (lookLift !== 0) {
      const fade = Math.min(Math.max(p / 0.35, 0), 1);
      targetLookY += lookLift * (1 - fade * fade * (3 - 2 * fade));
    }

    if (!isCinematic) {
      // Baseline frame-rate independent damped inertia (§1.3)
      camera.position.x = 0;
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 4.8, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 4.8, dt);
      camera.lookAt(0, targetLookY, -6);

      if ("fov" in camera) {
        const persCamera = camera as THREE.PerspectiveCamera;
        const baseFov = THREE.MathUtils.lerp(42, 46, p);
        const targetFov = fitWidth ? Math.max(baseFov, fovForWidth(persCamera.aspect)) : baseFov;
        persCamera.fov = THREE.MathUtils.damp(persCamera.fov, targetFov, 4.0, dt);
        persCamera.updateProjectionMatrix();
      }
      return;
    }

    // Elevated Dual-Channel Cinematic Damper with Hermite Smootherstep & Crane Roll Bank
    const smoothP = smootherstep(Math.min(1, Math.max(0, p)));
    const isReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Crane roll banking during the gate swing phase (p=0.25 to 0.75)
    let craneRoll = 0;
    if (p > 0.25 && p < 0.75) {
      const gateT = (p - 0.25) / 0.5;
      craneRoll = Math.sin(gateT * Math.PI) * 0.0025;
    }

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    const targetLook = new THREE.Vector3(0, targetLookY, -6);

    const dampResult = damperRef.current.update(
      targetPos,
      targetLook,
      smoothP,
      dt,
      {
        isReducedMotion: isReduced,
        additionalRoll: craneRoll,
      }
    );

    camera.position.copy(dampResult.position);
    camera.lookAt(dampResult.lookAt);
    camera.rotation.z = dampResult.roll;

    if ("fov" in camera) {
      const persCamera = camera as THREE.PerspectiveCamera;
      const baseFov = THREE.MathUtils.lerp(42, 46, smoothP);
      const targetFov = fitWidth ? Math.max(baseFov, fovForWidth(persCamera.aspect)) : baseFov;
      persCamera.fov = THREE.MathUtils.damp(persCamera.fov, targetFov, 4.5, dt);
      persCamera.updateProjectionMatrix();
    }
  });

  return null;
}
