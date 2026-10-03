"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface MorningVolumetricsProps {
  gateProgressRef: React.RefObject<number>;
}

export function MorningVolumetrics({ gateProgressRef }: MorningVolumetricsProps) {
  const shaftGroupRef = useRef<THREE.Group>(null);
  const beamMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const p = gateProgressRef.current ?? 0;
    const time = state.clock.getElapsedTime();

    // Subtle atmospheric shimmer
    const shimmer = 1.0 + Math.sin(time * 1.4) * 0.04;

    // As gates open (p = 0.2 to 0.75), sunbeams expand in intensity and width
    const openFactor = Math.min(Math.max((p - 0.18) / 0.54, 0), 1);
    const targetOpacity = (0.05 + openFactor * 0.18) * shimmer;

    if (beamMaterialRef.current) {
      beamMaterialRef.current.opacity = targetOpacity;
    }

    if (shaftGroupRef.current) {
      const scaleX = 1.0 + openFactor * 0.6;
      shaftGroupRef.current.scale.set(scaleX, 1.0, 1.0);
    }
  });

  return (
    <group position={[0, 4.4, -9]}>
      {/* Soft Dawn Volumetric Light Rays angling down through the gateway */}
      <group ref={shaftGroupRef} position={[0, -0.6, 2]}>
        {/* Fan of soft downward morning beams */}
        {[-2.4, -1.2, 0, 1.2, 2.4].map((xOffset, i) => (
          <mesh
            key={i}
            position={[xOffset * 0.8, -1.2, 3.5]}
            rotation={[Math.PI * 0.46, (xOffset * Math.PI) / 36, 0]}
          >
            <meshBasicMaterial
              ref={beamMaterialRef}
              color="#FFE4A8" // Golden morning light
              transparent
              opacity={0.06}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
            <cylinderGeometry args={[0.15, 1.2, 7.5, 12, 1, true]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
