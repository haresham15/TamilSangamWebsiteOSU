import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGalleryHeroStore } from "@/store/galleryHeroStore";

interface AcousticCameraRigProps {
  scrollProgress: number;
}

/**
 * §10: Camera Rig with Idle Motion & Finale Dolly
 * - p = 0.00–0.85: Camera holds near origin (z: 4.5), gentle idle bob (y += sin(t*0.3)*0.04),
 *   subtle parallax x-drift (±0.15), FOV breathes 36 <-> 38 slowly. Ambient life, not locked!
 * - p = 0.85–1.00: Finale dolly into the setting sun disc at z = -10; FOV narrows to 30°.
 * - Synchronizes FogExp2 density ('#FF9D5C') with sea haze & finale whiteout.
 */
export function AcousticCameraRig({ scrollProgress }: AcousticCameraRigProps) {
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const fpsRef = useRef({ frames: 0, lastTime: 0 });

  useFrame((state, delta) => {
    const { camera, scene } = state;
    const t = state.clock.getElapsedTime();
    const p = Math.min(1.0, Math.max(0.0, scrollProgress));

    // 1. Compute Camera Position
    let targetX = 0;
    let targetY = 1.6;
    let targetZ = 4.5;
    let targetFov = 37;

    if (p <= 0.85) {
      // Idle range: gentle breathing and subtle parallax
      const idleBob = Math.sin(t * 0.3) * 0.04;
      const parallaxX = (p - 0.42) * 0.3; // ±0.15 margin
      targetX = parallaxX;
      targetY = 1.6 + idleBob;
      targetZ = 4.5 - p * 0.6; // Slight slow drift forward
      targetFov = 37 + Math.sin(t * 0.5) * 1.0;
    } else {
      // Finale dolly range (0.85 -> 1.00): push toward sun at z = -10
      const dollyP = (p - 0.85) / 0.15;
      const easedDolly = dollyP * dollyP * (3 - 2 * dollyP); // smoothstep
      targetX = THREE.MathUtils.lerp(0, 0, easedDolly);
      targetY = THREE.MathUtils.lerp(1.6, 2.0, easedDolly);
      targetZ = THREE.MathUtils.lerp(4.0, -7.5, easedDolly); // Close to sun at -10
      targetFov = THREE.MathUtils.lerp(37, 30, easedDolly);
    }

    targetPos.set(targetX, targetY, targetZ);

    // Spring-follow damping for physical inertia (§6 & §10)
    const damping = 1 - Math.pow(0.001, delta);
    camera.position.lerp(targetPos, damping * 4.0);

    if ("fov" in camera) {
      const persCamera = camera as THREE.PerspectiveCamera;
      persCamera.fov = targetFov;
      persCamera.updateProjectionMatrix();
    }

    // Look toward the setting sun on the horizon
    const lookTargetZ = p > 0.85 ? -10.0 : -10.0;
    camera.lookAt(0, 2.0, lookTargetZ);

    // 2. Fog Density Scheduling (#FF9D5C)
    let fogDensity = 0.024;
    if (p > 0.85) {
      const dollyP = (p - 0.85) / 0.15;
      fogDensity = THREE.MathUtils.lerp(0.024, 0.065, dollyP);
    }
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = fogDensity;
    }

    // 3. FPS Tracker
    fpsRef.current.frames++;
    const now = performance.now();
    if (fpsRef.current.lastTime === 0) {
      fpsRef.current.lastTime = now;
    } else if (now - fpsRef.current.lastTime >= 1000) {
      const currentFps = Math.round(
        (fpsRef.current.frames * 1000) / (now - fpsRef.current.lastTime)
      );
      useGalleryHeroStore.getState().setFps(currentFps);
      fpsRef.current.frames = 0;
      fpsRef.current.lastTime = now;
    }
  });

  return null;
}
