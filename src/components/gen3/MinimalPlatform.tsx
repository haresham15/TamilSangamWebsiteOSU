"use client";

import React from "react";
import * as THREE from "three";

export function MinimalPlatform() {
  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Industrial Octagonal Steel Platform Base */}
      <mesh position={[0, 0.08, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.2, 3.4, 0.16, 8]} />
        <meshStandardMaterial
          color="#1e1e24"
          roughness={0.4}
          metalness={0.85}
        />
      </mesh>
      {/* Metallic Step Rim */}
      <mesh position={[0, 0.165, 0]}>
        <cylinderGeometry args={[3.0, 3.0, 0.02, 32]} />
        <meshStandardMaterial
          color="#2a2530"
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>
      {/* Center Medallion Receiver Pad with Specular Sheen */}
      <mesh position={[0, 0.175, 0]}>
        <cylinderGeometry args={[2.6, 2.6, 0.01, 32]} />
        <meshStandardMaterial
          color="#18151f"
          roughness={0.2}
          metalness={0.95}
        />
      </mesh>
    </group>
  );
}
