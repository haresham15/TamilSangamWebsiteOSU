"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface WhiteoutFinaleProps {
  scrollProgressRef: React.RefObject<number>;
}

export function WhiteoutFinale({ scrollProgressRef }: WhiteoutFinaleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const p = scrollProgressRef.current ?? 0;
    const camera = state.camera;

    // Billboard placed right in front of camera lens
    if (meshRef.current) {
      meshRef.current.position.copy(camera.position);
      // Offset slightly along camera's forward vector
      const forward = new THREE.Vector3(0, 0, -0.6);
      forward.applyQuaternion(camera.quaternion);
      meshRef.current.position.add(forward);
      meshRef.current.quaternion.copy(camera.quaternion);
    }

    // Finale bloom from p = 0.84 to p = 0.98
    let opacity = 0;
    if (p > 0.82) {
      opacity = Math.min((p - 0.82) / 0.16, 1.0);
    }

    if (materialRef.current) {
      materialRef.current.opacity = opacity;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4, 4]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#FFF3DC" // Exact PRD fadeColor token
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
