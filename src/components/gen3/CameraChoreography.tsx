"use client";

import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getScrollProgress } from "./useScrollCinematic";
import { PerspectiveCamera } from "@react-three/drei";

// Define the camera scroll choreography keyframes
// Keeps the coin comfortably framed without zooming in too close or panning down awkwardly
const keyframes = [
  { p: 0.0, pos: new THREE.Vector3(0, 7.8, 14.0), target: new THREE.Vector3(0, 2.5, 0), fov: 38 },
  { p: 0.3, pos: new THREE.Vector3(1.4, 5.8, 11.5), target: new THREE.Vector3(0, 2.5, 0), fov: 38 },
  { p: 0.6, pos: new THREE.Vector3(-0.8, 4.4, 9.8), target: new THREE.Vector3(0, 2.5, 0), fov: 39 },
  { p: 0.85, pos: new THREE.Vector3(0.4, 3.4, 8.6), target: new THREE.Vector3(0, 2.5, 0), fov: 39 },
  { p: 1.0, pos: new THREE.Vector3(0, 2.9, 8.0), target: new THREE.Vector3(0, 2.5, 0), fov: 40 },
];

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function lerpVector(v1: THREE.Vector3, v2: THREE.Vector3, alpha: number): THREE.Vector3 {
  return new THREE.Vector3().copy(v1).lerp(v2, alpha);
}

function lerp(start: number, end: number, alpha: number): number {
  return start + (end - start) * alpha;
}

export function CameraChoreography() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const targetPos = useRef(new THREE.Vector3());
  const lookPos = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!cameraRef.current) return;
    const progress = getScrollProgress();

    // Find current segment
    let startFrame = keyframes[0];
    let endFrame = keyframes[keyframes.length - 1];
    let localAlpha = 1;

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (progress >= keyframes[i].p && progress <= keyframes[i + 1].p) {
        startFrame = keyframes[i];
        endFrame = keyframes[i + 1];
        const range = endFrame.p - startFrame.p;
        // Apply easeInOutCubic to the local segment alpha
        localAlpha = easeInOutCubic((progress - startFrame.p) / range);
        break;
      }
    }

    if (progress >= 1.0) {
      localAlpha = 1;
      startFrame = keyframes[keyframes.length - 2];
      endFrame = keyframes[keyframes.length - 1];
    } else if (progress <= 0.0) {
      localAlpha = 0;
      startFrame = keyframes[0];
      endFrame = keyframes[1];
    }

    // Interpolate position and look target
    targetPos.current.lerpVectors(startFrame.pos, endFrame.pos, localAlpha);
    lookPos.current.lerpVectors(startFrame.target, endFrame.target, localAlpha);
    const targetFov = lerp(startFrame.fov, endFrame.fov, localAlpha);

    // Apply to camera
    cameraRef.current.position.copy(targetPos.current);
    cameraRef.current.lookAt(lookPos.current);
    cameraRef.current.fov = targetFov;
    cameraRef.current.updateProjectionMatrix();
  });
  
  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 12, 18]}
      fov={34}
      near={0.1}
      far={100}
    />
  );
}
