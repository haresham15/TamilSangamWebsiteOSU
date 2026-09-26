"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function LeafDrift({ count = 120 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Per-instance physics parameters
  const leafData = useMemo(() => {
    const data = [];
    const colors = [
      new THREE.Color("#aa381e"), // Buckeye scarlet
      new THREE.Color("#d4881e"), // Autumn amber gold
      new THREE.Color("#823e16"), // Russet bronze
      new THREE.Color("#bf6228"), // Golden maple
    ];

    for (let i = 0; i < count; i++) {
      data.push({
        x: (pseudoRandom(i * 5 + 1) - 0.5) * 14,
        y: pseudoRandom(i * 5 + 2) * 5.5 + 0.2,
        z: (pseudoRandom(i * 5 + 3) - 0.5) * 16 + 2,
        speedY: 0.25 + pseudoRandom(i * 5 + 4) * 0.45,
        speedX: 0.15 + pseudoRandom(i * 5 + 5) * 0.3,
        rotSpeed: 0.8 + pseudoRandom(i * 5 + 6) * 1.6,
        phase: pseudoRandom(i * 5 + 7) * Math.PI * 2,
        scale: 0.08 + pseudoRandom(i * 5 + 8) * 0.07,
        color: colors[i % colors.length],
      });
    }
    return data;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const leaf = leafData[i];

      // Update position with gentle downward drift and swaying
      leaf.y -= leaf.speedY * delta;
      leaf.x += Math.sin(time * 1.8 + leaf.phase) * delta * leaf.speedX;
      leaf.z += Math.cos(time * 1.2 + leaf.phase) * delta * 0.2;

      // Wrap when touching ground
      if (leaf.y < 0.02) {
        leaf.y = 5.6;
        leaf.x = (pseudoRandom(i * 9 + time) - 0.5) * 14;
      }

      dummy.position.set(leaf.x, leaf.y, leaf.z);
      // Tumbling rotation
      dummy.rotation.set(
        time * leaf.rotSpeed + leaf.phase,
        Math.sin(time * 0.8 + leaf.phase) * 2,
        time * leaf.rotSpeed * 0.7
      );
      dummy.scale.set(leaf.scale, leaf.scale * 1.4, leaf.scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Set initial colors
  useMemo(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      meshRef.current.setColorAt(i, leafData[i].color);
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [count, leafData]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
    >
      {/* Curved autumn leaf shape */}
      <planeGeometry args={[1, 1, 2, 2]} />
      <meshStandardMaterial
        roughness={0.65}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}
