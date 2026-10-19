"use client";
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface MorningVolumetricsProps {
  gateProgressRef: React.RefObject<number>;
}

export function MorningVolumetrics({ gateProgressRef }: MorningVolumetricsProps) {
  const shaftGroupRef = useRef<THREE.Group>(null);
  const beamMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const motesRef = useRef<THREE.Points>(null);

  // 80 slow-drifting golden dust/pollen motes catching morning light
  const moteCount = 80;
  const motePositions = useMemo(() => {
    const arr = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      // Clustered along the gateway threshold
      arr[i * 3] = (Math.sin(i * 12.9898) * 0.5) * 6.0;
      arr[i * 3 + 1] = 0.5 + Math.abs(Math.sin(i * 78.233)) * 4.0;
      arr[i * 3 + 2] = -4.0 + Math.abs(Math.sin(i * 45.164)) * 7.0;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const p = gateProgressRef.current ?? 0;
    const time = state.clock.getElapsedTime();

    // Atmospheric golden morning shimmer
    const shimmer = 1.0 + Math.sin(time * 1.5) * 0.05;

    // As gates part (p = 0.22 -> 0.85), sunbeams widen exponentially through the gap
    const openFactor = Math.min(Math.max((p - 0.22) / 0.63, 0), 1);
    const targetOpacity = (0.04 + openFactor * 0.26) * shimmer;

    if (beamMaterialRef.current) {
      beamMaterialRef.current.opacity = targetOpacity;
    }

    if (shaftGroupRef.current) {
      // Fan spread width expands as the iron doors part
      const scaleX = 0.5 + openFactor * 1.8;
      shaftGroupRef.current.scale.set(scaleX, 1.0, 1.0 + openFactor * 0.4);
    }

    // Drift golden pollen motes forward toward the camera as light pours through
    if (motesRef.current) {
      const posAttr = motesRef.current.geometry.attributes.position;
      for (let i = 0; i < moteCount; i++) {
        let z = posAttr.getZ(i) + dt * (0.35 + openFactor * 0.45);
        const y = posAttr.getY(i) + Math.sin(time * 0.8 + i) * 0.003;
        if (z > 4.5) z = -5.5;
        posAttr.setZ(i, z);
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 4.4, -9]}>
      {/* Volumetric Morning Sunbeam Fan widening as gates part */}
      <group ref={shaftGroupRef} position={[0, -0.6, 2]}>
        {[-2.4, -1.2, 0, 1.2, 2.4].map((xOffset, i) => (
          <mesh
            key={i}
            position={[xOffset * 0.85, -1.2, 3.5]}
            rotation={[Math.PI * 0.46, (xOffset * Math.PI) / 34, 0]}
          >
            <meshBasicMaterial
              ref={beamMaterialRef}
              color="#FFE4A8"
              transparent
              opacity={0.06}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
            <cylinderGeometry args={[0.12, 1.35, 8.0, 12, 1, true]} />
          </mesh>
        ))}
      </group>

      {/* Floating golden pollen motes drifting through the opened gateway */}
      <points ref={motesRef} position={[0, -1.0, 3.0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[motePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#FFD074"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
