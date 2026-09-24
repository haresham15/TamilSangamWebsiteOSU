"use client";

import React, { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export interface LightingProps {
  keyLightMeshRef: React.RefObject<THREE.Mesh | null>;
  keyLightPointLightRef?: React.RefObject<THREE.PointLight | null>;
}

/**
 * Lighting:
 * Key rim light + ambient fill + Layer-1 bloom source mesh.
 * Restated parameters per §7 of Master PRD:
 * - ambientLight: intensity: 0.06, color: "#2a1206"
 * - pointLight: position: [0, 3.4, -2.5], color: "#FFD37A", intensity: 18, distance: 14, decay: 2
 * - bloom source mesh: position: [0, 3.4, -2.5], sphereGeometry [0.35, 16, 16], color: "#FFD37A", toneMapped: false, layers: 1
 */
export function Lighting({
  keyLightMeshRef,
  keyLightPointLightRef,
}: LightingProps) {
  const { camera } = useThree();

  useEffect(() => {
    // Enable layer 1 on the camera so the bloom source mesh is rendered cleanly
    camera.layers.enable(1);
    if (keyLightMeshRef.current) {
      keyLightMeshRef.current.layers.set(1);
    }
    if (keyLightPointLightRef?.current) {
      keyLightPointLightRef.current.layers.set(1);
    }
  }, [camera, keyLightMeshRef, keyLightPointLightRef]);

  return (
    <>
      {/* 1. Deep amber ambient fill */}
      <ambientLight intensity={0.06} color="#2a1206" />

      {/* 2. Key rim light directly behind/above subject's head */}
      <pointLight
        ref={keyLightPointLightRef}
        position={[0, 3.4, -2.5]}
        color="#FFD37A"
        intensity={18}
        distance={14}
        decay={2}
      />

      {/* 3. Small visible bloom source geometry on Layer 1 */}
      <mesh
        ref={keyLightMeshRef}
        position={[0, 3.4, -2.5]}
      >
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#FFD37A" toneMapped={false} />
      </mesh>
    </>
  );
}
