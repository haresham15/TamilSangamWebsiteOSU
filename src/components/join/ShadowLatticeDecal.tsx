"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface ShadowLatticeDecalProps {
  gateProgressRef: React.RefObject<number>;
}

export function ShadowLatticeDecal({ gateProgressRef }: ShadowLatticeDecalProps) {
  const leftShadowRef = useRef<THREE.Group>(null);
  const rightShadowRef = useRef<THREE.Group>(null);

  // Walkway dimensions
  const stonePavingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d0c5b0", // Warm campus limestone paving
        roughness: 0.92,
        metalness: 0.05,
      }),
    []
  );

  const shadowBarMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#281e18", // Dark morning shadow
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      }),
    []
  );

  useFrame(() => {
    const p = gateProgressRef.current ?? 0;
    const maxAngle = Math.PI * 0.44;
    const currentAngle = p * maxAngle;

    // As gates open, the projected shadows on the stone floor part down the center
    if (leftShadowRef.current) {
      leftShadowRef.current.rotation.y = -currentAngle;
      // Slight shadow fade as light floods in
      leftShadowRef.current.position.z = Math.sin(currentAngle) * 1.2;
    }
    if (rightShadowRef.current) {
      rightShadowRef.current.rotation.y = currentAngle;
      rightShadowRef.current.position.z = Math.sin(currentAngle) * 1.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Campus Limestone Walkway Slab */}
      <mesh
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={stonePavingMaterial}
        receiveShadow
      >
        <planeGeometry args={[14, 28]} />
      </mesh>

      {/* Stone curb borders flanking the path */}
      <mesh position={[-5.2, 0.08, 0]} material={stonePavingMaterial}>
        <boxGeometry args={[0.4, 0.22, 28]} />
      </mesh>
      <mesh position={[5.2, 0.08, 0]} material={stonePavingMaterial}>
        <boxGeometry args={[0.4, 0.22, 28]} />
      </mesh>

      {/* 2. Projected Dynamic Iron Lattice Floor Shadows (Pivoting with gates) */}
      {/* Left Gate Floor Shadow Grid */}
      <group ref={leftShadowRef} position={[-3.3, 0.015, 0]}>
        <group position={[1.7, 0, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Symmetrical shadow lattice lines projected onto stone */}
          {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
            <mesh key={`v-${i}`} position={[x, 0, 0]} material={shadowBarMaterial}>
              <planeGeometry args={[0.06, 3.2]} />
            </mesh>
          ))}
          {[-1.2, -0.6, 0, 0.6, 1.2].map((y, i) => (
            <mesh key={`h-${i}`} position={[0, y, 0]} material={shadowBarMaterial}>
              <planeGeometry args={[2.8, 0.06]} />
            </mesh>
          ))}
          {/* Diagonal lattice diamond cross-hatching */}
          {[-0.8, -0.3, 0.3, 0.8].map((x, i) => (
            <mesh
              key={`d1-${i}`}
              position={[x, 0, 0]}
              rotation={[0, 0, Math.PI / 4]}
              material={shadowBarMaterial}
            >
              <planeGeometry args={[0.04, 2.4]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Right Gate Floor Shadow Grid */}
      <group ref={rightShadowRef} position={[3.3, 0.015, 0]}>
        <group position={[-1.7, 0, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Symmetrical shadow lattice lines projected onto stone */}
          {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
            <mesh key={`v-${i}`} position={[x, 0, 0]} material={shadowBarMaterial}>
              <planeGeometry args={[0.06, 3.2]} />
            </mesh>
          ))}
          {[-1.2, -0.6, 0, 0.6, 1.2].map((y, i) => (
            <mesh key={`h-${i}`} position={[0, y, 0]} material={shadowBarMaterial}>
              <planeGeometry args={[2.8, 0.06]} />
            </mesh>
          ))}
          {/* Diagonal lattice diamond cross-hatching */}
          {[-0.8, -0.3, 0.3, 0.8].map((x, i) => (
            <mesh
              key={`d2-${i}`}
              position={[x, 0, 0]}
              rotation={[0, 0, -Math.PI / 4]}
              material={shadowBarMaterial}
            >
              <planeGeometry args={[0.04, 2.4]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
