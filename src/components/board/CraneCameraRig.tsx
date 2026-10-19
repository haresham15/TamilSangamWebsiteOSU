"use client";

import { useRef, useMemo, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useBoardHeroStore } from "@/store/boardHeroStore";

import { createHeroKineticsTracker } from "@/lib/heroKinetics";

interface CraneCameraRigProps {
  scrollProgress: RefObject<number>;
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * §6: Crane Camera Rig with Spring Inertia & Processional Look-At Weave
 * - Processional camera look-at weave acknowledges alternating left/right officer banners.
 * - Dynamic FOV expansion (32° -> 44°).
 * - Synchronizes FogExp2 density per the PRD depth-cueing schedule.
 */
export function CraneCameraRig({ scrollProgress }: CraneCameraRigProps) {
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const fpsRef = useRef({ frames: 0, lastTime: 0 });
  const kineticsRef = useRef(createHeroKineticsTracker(7.5, 5.0, 4.0));

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const { camera, scene } = state;
    const rawP = Math.min(1.0, Math.max(0.0, scrollProgress.current));
    const kinetics = kineticsRef.current.update(rawP, state.pointer, dt);
    const p = kinetics.smoothProgress;
    const easedP = easeInOutCubic(p);

    // Keep store synchronized for banner cloth velocity tracking
    useBoardHeroStore.getState().setScrollProgress(p);

    // 1. Compute physical crane target position framing the Chola centerpiece and lamps
    const targetZ = THREE.MathUtils.lerp(30, 5.2, easedP);
    const swayX = Math.sin(p * 6.0) * 0.12 + kinetics.smoothPointerX * 0.35;

    // Camera cranes from an elevated 2.22m vantage point to glide above the Chola crown
    // before settling to 1.62m eye-level colonnade cruise once through the entrance
    const craneDescend = p < 0.28 ? Math.pow(p / 0.28, 1.5) : 1.0;
    const baseY = THREE.MathUtils.lerp(2.22, 1.62, craneDescend);
    const swayY = baseY + Math.sin(p * 4.0) * 0.025 - kinetics.smoothPointerY * 0.18;
    targetPos.set(swayX, swayY, targetZ);

    // 2. Spring-follow crane inertia (frame-rate independent damping, clamped alpha in [0, 1])
    const safeDelta = Math.max(dt, 0.001);
    const alpha = Math.min(1.0, Math.max(0.0, 1 - Math.exp(-6.0 * safeDelta)));
    camera.position.lerp(targetPos, alpha);

    // 3. Dynamic FOV push (32° -> 44°)
    if ("fov" in camera) {
      const persCamera = camera as THREE.PerspectiveCamera;
      persCamera.fov = THREE.MathUtils.lerp(32, 44, p);
      persCamera.updateProjectionMatrix();
    }

    // 4. Dignified Processional Camera Look-At Weave
    // Smoothly sweeps across left and right banners as camera dollies down the corridor
    const lookWeaveX = Math.sin(p * Math.PI * 3.0) * 0.35 + kinetics.smoothPointerX * 0.2;
    const lookY = p < 0.28 ? THREE.MathUtils.lerp(1.38, 1.65, p / 0.28) : 1.65;
    camera.lookAt(lookWeaveX, lookY, targetPos.z - 8.0);
    camera.rotation.z = kinetics.velocityBank * 0.4;

    // 5. Scroll-driven FogExp2 density schedule (§5 Table)
    let targetFog = 0.045;
    if (p < 0.45) {
      targetFog = THREE.MathUtils.lerp(0.045, 0.032, p / 0.45);
    } else if (p < 0.92) {
      targetFog = THREE.MathUtils.lerp(0.032, 0.020, (p - 0.45) / 0.47);
    } else {
      targetFog = THREE.MathUtils.lerp(0.020, 0.015, (p - 0.92) / 0.08);
    }

    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = targetFog;
    }

    // 6. Update diagnostics in store
    const store = useBoardHeroStore.getState();
    // Diagnostics are sampled only when visible, leaving camera motion imperative.
    if (!store.debugMode) return;
    fpsRef.current.frames++;
    const now = performance.now();
    if (fpsRef.current.lastTime === 0) {
      fpsRef.current.lastTime = now;
    } else if (now - fpsRef.current.lastTime >= 1000) {
      const currentFps = Math.round(
        (fpsRef.current.frames * 1000) / (now - fpsRef.current.lastTime)
      );
      store.setFps(currentFps);
      store.setCameraZ(Math.max(0.8, Math.min(30.0, camera.position.z)));
      store.setFogDensity(targetFog);
      fpsRef.current.frames = 0;
      fpsRef.current.lastTime = now;
    }
  });

  return null;
}
