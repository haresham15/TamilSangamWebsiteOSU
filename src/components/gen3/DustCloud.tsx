"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function DustCloud({ count = 200 }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, phases, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const sp = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Localized around the light shaft
      pos[i * 3 + 0] = (Math.random() - 0.5) * 8; // x
      pos[i * 3 + 1] = Math.random() * 12;        // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 3; // z
      
      ph[i] = Math.random() * Math.PI * 2;
      sp[i] = 0.1 + Math.random() * 0.3;
    }
    return [pos, ph, sp];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttribute = pointsRef.current.geometry.attributes.position;
    const posArray = posAttribute.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] += speeds[i] * delta; // move up
      posArray[i * 3 + 0] += Math.sin(state.clock.elapsedTime * 0.5 + phases[i]) * delta * 0.2; // sway x
      
      // loop back to bottom
      if (posArray[i * 3 + 1] > 12) {
        posArray[i * 3 + 1] = 0;
      }
    }
    posAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffcc88"
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
