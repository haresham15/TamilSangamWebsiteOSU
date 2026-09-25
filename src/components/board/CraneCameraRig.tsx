import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useBoardHeroStore } from "@/store/boardHeroStore";

interface CraneCameraRigProps {
  scrollProgress: number;
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * §6: Crane Camera Rig with Spring Inertia
 * - Instead of locked 1:1 dolly, actual camera position spring-lerps toward
 *   target with frame-rate independent damping to simulate physical crane arm weight.
 * - Dynamic FOV expansion (32° -> 44°).
 * - Synchronizes FogExp2 density per the PRD depth-cueing schedule.
 */
export function CraneCameraRig({ scrollProgress }: CraneCameraRigProps) {
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const fpsRef = useRef({ frames: 0, lastTime: 0 });

  useFrame((state, delta) => {
    const { camera, scene } = state;
    const p = Math.min(1.0, Math.max(0.0, scrollProgress));
    const easedP = easeInOutCubic(p);

    // 1. Compute physical crane target position with subtle handheld sway (§6)
    const targetZ = THREE.MathUtils.lerp(30, 0.8, easedP);
    const swayX = Math.sin(p * 6.0) * 0.15;
    const swayY = 1.6 + Math.sin(p * 4.0) * 0.03;
    targetPos.set(swayX, swayY, targetZ);

    // 2. Spring-follow crane inertia (frame-rate independent damping, clamped alpha in [0, 1])
    const safeDelta = Math.min(Math.max(delta, 0.001), 0.1);
    const alpha = Math.min(1.0, Math.max(0.0, 1 - Math.exp(-6.0 * safeDelta)));
    camera.position.lerp(targetPos, alpha);

    // 3. Dynamic FOV push (32° -> 44°)
    if ("fov" in camera) {
      const persCamera = camera as THREE.PerspectiveCamera;
      persCamera.fov = THREE.MathUtils.lerp(32, 44, p);
      persCamera.updateProjectionMatrix();
    }

    // 4. Look ahead along the center aisle toward the emblem
    camera.lookAt(0, 1.7, targetPos.z - 8.0);

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
    store.setCameraZ(Math.max(0.8, Math.min(30.0, camera.position.z)));
    store.setFogDensity(targetFog);

    // 7. FPS tracking
    fpsRef.current.frames++;
    const now = performance.now();
    if (fpsRef.current.lastTime === 0) {
      fpsRef.current.lastTime = now;
    } else if (now - fpsRef.current.lastTime >= 1000) {
      const currentFps = Math.round(
        (fpsRef.current.frames * 1000) / (now - fpsRef.current.lastTime)
      );
      store.setFps(currentFps);
      fpsRef.current.frames = 0;
      fpsRef.current.lastTime = now;
    }
  });

  return null;
}
