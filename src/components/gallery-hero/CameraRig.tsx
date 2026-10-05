// src/components/gallery-hero/CameraRig.tsx
"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { heroState, registerCameraSnapHandler, unregisterCameraSnapHandler } from "./state";
import { getCameraS, getCameraSpeed } from "./neck/fretMath";
import { defaultRamp } from "@/gallery/ramp";
import { getSharedHeroRefs } from "./props/types";

import { useTier } from "@/components/providers/TierProvider";

interface CameraRigProps {
  propRigRef?: React.RefObject<THREE.Group | null>;
  children?: React.ReactNode;
}

const MAX_CAMERA_WORLD_SPEED = 90.0; // su/s (§5.3 rate limiter)
const MAX_FOV_SLEW_RATE = 40.0; // deg/s rate limit

/**
 * CameraRig (§3.5, PRD v2 §5.3, §7)
 *
 * - Base FOV 35° long-lens compression, eye height y = 2.6 above fretboard.
 * - Dynamic kinematic FOV widening:
 *   - Tier A: up to +10° max (35° -> 45°)
 *   - Tier B: up to +6° max (35° -> 41°)
 *   - Tier C: 0° (constant 35°)
 * - Asymmetric critically damped spring: omega = 6 rad/s widening, 16 rad/s settling.
 * - Camera world speed limiter: capped at 90 su/s on extreme wheel gestures.
 * - Pitched down at look target 14.0 su ahead at y = 0.3.
 * - Handheld micro-sway: +-0.04 su breath (0.07 Hz) + 1.5° roll (off for reduced motion).
 * - Deterministic capture support: setProgress snaps spring and speed limiter.
 */
export function CameraRig({ propRigRef, children }: CameraRigProps) {
  const tier = useTier();
  const currentLookAt = useRef(new THREE.Vector3(0, 0.3, -14.0));
  const targetLookAt = useMemo(() => new THREE.Vector3(0, 0.3, -14.0), []);

  const prefersReducedMotion = useRef(false);

  // Kinematic state for smooth tracking and limiting
  const sCurrent = useRef<number>(0);
  const fovCurrent = useRef<number>(35.0);
  const fovVelocity = useRef<number>(0.0);
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }

    // Register snap handler for deterministic screenshot / capture tooling (§5.3)
    const handleSnap = (p: number) => {
      const redMotion = prefersReducedMotion.current || tier === "C";
      const targetS = getCameraS(p, redMotion);
      sCurrent.current = targetS;
      fovCurrent.current = 35.0;
      fovVelocity.current = 0.0;
    };

    registerCameraSnapHandler(handleSnap);
    return () => {
      unregisterCameraSnapHandler();
    };
  }, [tier]);

  useFrame((state, delta) => {
    const cam = state.camera;
    if (!cam) return;

    const safeDelta = Math.min(Math.max(delta, 0), 0.05);
    const p = heroState.progress;
    const isReduced = prefersReducedMotion.current || tier === "C";

    // 1. Compute target distance along neck with kinematic speed ramp
    const sTarget = getCameraS(p, isReduced);
    const instantaneousSpeed = getCameraSpeed(p, isReduced);

    if (!initialized.current) {
      sCurrent.current = sTarget;
      fovCurrent.current = 35.0;
      initialized.current = true;
    }

    // 2. Camera World Speed Limiter (cap at 90 su/s)
    const sDiff = sTarget - sCurrent.current;
    if (isReduced || Math.abs(sDiff) < 0.05) {
      sCurrent.current = sTarget;
    } else {
      const maxStep = MAX_CAMERA_WORLD_SPEED * safeDelta;
      const step = Math.sign(sDiff) * Math.min(Math.abs(sDiff), maxStep);
      sCurrent.current += step;
    }

    const sCam = sCurrent.current;

    // 3. Dynamic Warp FOV & Asymmetric Spring (§5.3, §7)
    // Target FOV: 35 + maxBoost * clamp((speed - 1) / (P - 1), 0, 1)
    let targetFov = 35.0;
    const maxBoost = tier === "B" ? 6.0 : 10.0; // Tier A: <= +10°, Tier B: <= +6°

    if (!isReduced) {
      const speedNormalized = Math.max(0, Math.min(1, (instantaneousSpeed - 1.0) / (defaultRamp.P - 1.0)));
      targetFov = 35.0 + maxBoost * speedNormalized;

      // Also blend with shared hero rig props (e.g. Era 3 finale narrowing)
      const heroRefs = getSharedHeroRefs();
      if (heroRefs.rig.fov.value !== 35.0) {
        targetFov = heroRefs.rig.fov.value;
      }

      // Asymmetric spring: omega = 6.0 widening, 16.0 settling
      const omega = targetFov > fovCurrent.current ? 6.0 : 16.0;
      const k = omega * omega;
      const c = 2.0 * omega; // critical damping

      const accel = -k * (fovCurrent.current - targetFov) - c * fovVelocity.current;
      fovVelocity.current += accel * safeDelta;

      // Rate limit: <= 40 deg/s
      fovVelocity.current = Math.max(-MAX_FOV_SLEW_RATE, Math.min(MAX_FOV_SLEW_RATE, fovVelocity.current));
      fovCurrent.current += fovVelocity.current * safeDelta;
    } else {
      fovCurrent.current = 35.0;
      fovVelocity.current = 0.0;
    }

    if (cam instanceof THREE.PerspectiveCamera) {
      if (Math.abs(cam.fov - fovCurrent.current) > 0.01) {
        cam.fov = fovCurrent.current;
        cam.updateProjectionMatrix();
      }
    }

    // 4. Natural breath sway (off if prefersReducedMotion)
    const time = state.clock.getElapsedTime();
    const breath = isReduced ? 0.0 : Math.sin(time * 0.44) * 0.035;
    const roll = isReduced ? 0.0 : Math.sin(time * 0.28) * 0.012; // ~0.7° roll

    const heroRefs = getSharedHeroRefs();
    const dolly = heroRefs.rig.dolly.value;

    // 5. Camera world position: follows neck axis along negative Z, plus extra dolly
    cam.position.set(0.0, 2.6 + breath, -sCam - dolly);
    cam.rotation.z = roll;

    // 6. Look target 14 su ahead on the neck at y = 0.3
    const sLookAhead = sCam + 14.0;
    targetLookAt.set(0.0, 0.3, -sLookAhead);

    currentLookAt.current.lerp(targetLookAt, Math.min(1.0, 9.0 * safeDelta));
    cam.lookAt(currentLookAt.current);

    // 7. Update PropRig position (anchored 14 su ahead of camera)
    if (propRigRef && propRigRef.current) {
      propRigRef.current.position.set(0.0, 0.0, -sLookAhead);
    }
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0.0, 2.6, 0.0]}
        fov={35}
        near={0.01}
        far={250}
      />
      {children}
    </>
  );
}
export default CameraRig;
