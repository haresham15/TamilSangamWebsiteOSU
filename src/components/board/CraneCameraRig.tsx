"use client";

import { useRef, useMemo, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useBoardHeroStore } from "@/store/boardHeroStore";

import { createHeroKineticsTracker } from "@/lib/heroKinetics";

import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { createCinemaCameraDamper } from "@/lib/cinemaCameraDamper";
import { useTier } from "@/components/providers/TierProvider";
import { useLiteMode } from "@/context/LiteModeContext";

interface CraneCameraRigProps {
  scrollProgress: RefObject<number>;
  reducedMotion?: boolean;
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function smootherstep(t: number): number {
  return t <= 0 ? 0 : t >= 1 ? 1 : t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * §6: Crane Camera Rig with Spring Inertia & Processional Look-At Weave
 * - Processional camera look-at weave acknowledges alternating left/right officer banners.
 * - Dynamic FOV expansion (32° -> 44°).
 * - Synchronizes FogExp2 density per the PRD depth-cueing schedule.
 * - Cinematic elevation: dual-channel cinema damper, Hermite smootherstep, and micro-breathing.
 */
export function CraneCameraRig({ scrollProgress, reducedMotion: reducedMotionProp }: CraneCameraRigProps) {
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const fpsRef = useRef({ frames: 0, lastTime: 0 });
  const kineticsRef = useRef(createHeroKineticsTracker(4.2, 5.0, 4.0));
  const tier = useTier();
  const { isLiteMode } = useLiteMode();

  const damperRef = useRef(
    createCinemaCameraDamper({
      lambdaPos: 6.0,
      lambdaLook: 9.8,
      breathingAmplitude: 0.003,
      breathingRoll: 0.002,
      breathFreqPrimary: 0.25,
      breathFreqSecondary: 1.05,
    })
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const { camera, scene } = state;
    const rawP = Math.min(1.0, Math.max(0.0, scrollProgress.current));
    const kinetics = kineticsRef.current.update(rawP, state.pointer, dt);
    const p = kinetics.smoothProgress;
    const isCinematic = isHeroCinematicEnabled("board");

    // Keep store synchronized for banner cloth velocity tracking
    useBoardHeroStore.getState().setScrollProgress(p);

    const aspectScale = state.viewport.aspect < 1.2 ? 1.2 / Math.max(state.viewport.aspect, 0.5) : 1.0;

    if (!isCinematic) {
      // Baseline crane camera logic (100% rollback preserved)
      const easedP = easeInOutCubic(p);
      const targetZ = THREE.MathUtils.lerp(30 * aspectScale, 5.2 * aspectScale, easedP);
      const swayX = Math.sin(p * 6.0) * 0.12 + kinetics.smoothPointerX * 0.35;

      const craneDescend = p < 0.28 ? Math.pow(p / 0.28, 1.5) : 1.0;
      const baseY = THREE.MathUtils.lerp(2.22, 1.62, craneDescend);
      const swayY = baseY + Math.sin(p * 4.0) * 0.025 - kinetics.smoothPointerY * 0.18;
      targetPos.set(swayX, swayY, targetZ);

      const safeDelta = Math.max(dt, 0.001);
      const alpha = Math.min(1.0, Math.max(0.0, 1 - Math.exp(-6.0 * safeDelta)));
      camera.position.lerp(targetPos, alpha);

      if ("fov" in camera) {
        const persCamera = camera as THREE.PerspectiveCamera;
        persCamera.fov = THREE.MathUtils.lerp(32, 44, p);
        persCamera.updateProjectionMatrix();
      }

      const lookWeaveX = Math.sin(p * Math.PI * 3.0) * 0.35 + kinetics.smoothPointerX * 0.2;
      const lookY = p < 0.28 ? THREE.MathUtils.lerp(1.38, 1.65, p / 0.28) : 1.65;
      camera.lookAt(lookWeaveX, lookY, targetPos.z - 8.0);
      camera.rotation.z = kinetics.velocityBank * 0.4;
    } else {
      // Cinematic elevation: Hermite smootherstep + dual-channel exponential damper
      const smoothedP = smootherstep(p);
      const targetZ = THREE.MathUtils.lerp(30 * aspectScale, 5.2 * aspectScale, smoothedP);
      const swayX = Math.sin(p * 6.0) * 0.10 + kinetics.smoothPointerX * 0.28;

      const craneDescend = p < 0.28 ? Math.pow(p / 0.28, 1.5) : 1.0;
      const baseY = THREE.MathUtils.lerp(2.22, 1.62, craneDescend);
      const swayY = baseY + Math.sin(p * 4.0) * 0.02 - kinetics.smoothPointerY * 0.14;
      targetPos.set(swayX, swayY, targetZ);

      // Dignified processional look-at sweep with leading carriage focusing ahead on colonnade
      const lookWeaveX = Math.sin(p * Math.PI * 3.0) * 0.28 + kinetics.smoothPointerX * 0.18;
      const lookY = p < 0.28 ? THREE.MathUtils.lerp(1.38, 1.62, p / 0.28) : 1.62;
      const lookZ = targetZ - 8.5;
      lookTarget.set(lookWeaveX, lookY, lookZ);

      const isReduced = reducedMotionProp ?? (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      const damped = damperRef.current.update(
        targetPos,
        lookTarget,
        smoothedP,
        dt,
        {
          isReducedMotion: isReduced || tier === "C",
          isLiteMode,
          additionalRoll: kinetics.velocityBank * 0.35,
        }
      );

      camera.position.copy(damped.position);
      camera.lookAt(damped.lookAt);
      camera.rotation.z = damped.roll;

      if ("fov" in camera) {
        const persCamera = camera as THREE.PerspectiveCamera;
        persCamera.fov = THREE.MathUtils.lerp(32, 44, smoothedP);
        persCamera.updateProjectionMatrix();
      }
    }

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
