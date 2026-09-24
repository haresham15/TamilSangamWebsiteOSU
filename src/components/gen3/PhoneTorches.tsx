"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { seededRandom } from "@/lib/prng";

export function PhoneTorches({ count = 300 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const [positions, phases] = useMemo(() => {
    const pos = [];
    const ph = [];
    for (let i = 0; i < count; i++) {
      // Crowd shape: an arc or stadium seating behind the camera view
      const angle = (seededRandom(i * 4 + 1) - 0.5) * Math.PI * 1.5;
      const radius = 4 + seededRandom(i * 4 + 2) * 15;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius - 2; // Offset center
      const y = (radius - 4) * 0.3 + seededRandom(i * 4 + 3) * 0.5; // Stadium slope
      
      pos.push(new THREE.Vector3(x, y, z));
      ph.push(seededRandom(i * 4 + 4) * Math.PI * 2);
    }
    return [pos, ph];
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const p = positions[i];
      const phase = phases[i];
      
      // Sway like people holding phones at a concert
      const swayX = Math.sin(time * 2.0 + phase) * 0.1;
      const swayY = Math.cos(time * 3.0 + phase) * 0.05;
      
      dummy.position.set(p.x + swayX, p.y + swayY, p.z);
      
      // Scale pulse to simulate shimmering lights
      const scale = 0.8 + Math.sin(time * 5.0 + phase) * 0.2;
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
