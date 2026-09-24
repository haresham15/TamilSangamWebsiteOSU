"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useScrollProgress } from "@/components/scroll/useScrollProgress";

interface Keyframe {
  p: number;
  pos: [number, number, number];
  fov: number;
  fog: number;
  lookY: number;
}

const KEYFRAMES: Keyframe[] = [
  { p: 0.00, pos: [0, 14.0, 22.0], fov: 32, fog: 0.018, lookY: 1.2 },
  { p: 0.15, pos: [0, 9.0, 16.0],  fov: 34, fog: 0.020, lookY: 1.6 },
  { p: 0.55, pos: [0, 3.2, 9.0],   fov: 40, fog: 0.026, lookY: 2.6 },
  { p: 0.75, pos: [0, 1.7, 6.0],   fov: 44, fog: 0.030, lookY: 3.2 },
  { p: 0.90, pos: [0, 1.6, 4.2],   fov: 46, fog: 0.032, lookY: 3.6 },
  { p: 1.00, pos: [0, 1.6, 3.8],   fov: 46, fog: 0.032, lookY: 3.6 },
];

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function interpolateKeyframes(progress: number) {
  const clampedP = Math.max(0, Math.min(1, progress));

  // Find surrounding keyframes
  let i = 0;
  while (i < KEYFRAMES.length - 1 && KEYFRAMES[i + 1].p <= clampedP) {
    i++;
  }

  if (i >= KEYFRAMES.length - 1) {
    const kf = KEYFRAMES[KEYFRAMES.length - 1];
    return {
      x: kf.pos[0],
      y: kf.pos[1],
      z: kf.pos[2],
      fov: kf.fov,
      fog: kf.fog,
      lookY: kf.lookY,
    };
  }

  const kfA = KEYFRAMES[i];
  const kfB = KEYFRAMES[i + 1];

  const segRange = kfB.p - kfA.p;
  const segProgress = segRange > 0 ? (clampedP - kfA.p) / segRange : 0;
  const t = easeInOutCubic(segProgress);

  return {
    x: THREE.MathUtils.lerp(kfA.pos[0], kfB.pos[0], t),
    y: THREE.MathUtils.lerp(kfA.pos[1], kfB.pos[1], t),
    z: THREE.MathUtils.lerp(kfA.pos[2], kfB.pos[2], t),
    fov: THREE.MathUtils.lerp(kfA.fov, kfB.fov, segProgress),
    fog: THREE.MathUtils.lerp(kfA.fog, kfB.fog, segProgress),
    lookY: THREE.MathUtils.lerp(kfA.lookY, kfB.lookY, t),
  };
}

/**
 * CameraRig:
 * GSAP/ScrollTrigger-driven crane-to-eye-level dolly-zoom choreography.
 * Restated parameters per §5 of Master PRD:
 * - p = 0.00: pos(0, 14, 22), fov: 32, fog: 0.018 (Crane shot)
 * - p = 0.15: pos(0, 9, 16),  fov: 34, fog: 0.020 (Begin descent)
 * - p = 0.55: pos(0, 3.2, 9), fov: 40, fog: 0.026 (Near eye-level)
 * - p = 0.75: pos(0, 1.7, 6), fov: 44, fog: 0.030 (Eye-level hold)
 * - p = 0.90: pos(0, 1.6, 4.2), fov: 46, fog: 0.032 (Tight push on raised hand)
 *
 * Runs strictly via useFrame reading the ref store to prevent 60fps React re-renders.
 */
export function CameraRig() {
  const { camera, scene } = useThree();
  const scrollStore = useScrollProgress();

  useFrame(() => {
    const p = scrollStore.current;
    const { x, y, z, fov, fog, lookY } = interpolateKeyframes(p);

    camera.position.set(x, y, z);

    if ("fov" in camera) {
      const persCamera = camera as THREE.PerspectiveCamera;
      // eslint-disable-next-line react-hooks/immutability
      persCamera.fov = fov;
      persCamera.updateProjectionMatrix();
    }

    camera.lookAt(0, lookY, 0);

    if (scene.fog && "density" in scene.fog) {
      // eslint-disable-next-line react-hooks/immutability
      (scene.fog as THREE.FogExp2).density = fog;
    }
  });

  return null;
}
