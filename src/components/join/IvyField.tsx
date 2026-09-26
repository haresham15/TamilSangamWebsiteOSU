"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface IvyClusterProps {
  pillarX: number;
}

function PillarIvy({ pillarX }: IvyClusterProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 38;

  // Generate deterministic cluster positions clinging to pillar corners
  const { matrices, colors } = useMemo(() => {
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const tempMatrix = new THREE.Matrix4();
    const tempPos = new THREE.Vector3();
    const tempRot = new THREE.Euler();
    const tempScale = new THREE.Vector3();
    const tempQuat = new THREE.Quaternion();

    const ivyColors = [
      new THREE.Color("#2a4c24"),
      new THREE.Color("#375e2f"),
      new THREE.Color("#1f3b1b"),
      new THREE.Color("#4a743e"),
    ];

    for (let i = 0; i < count; i++) {
      // Cling along outer and inner corners of pillar
      const angle = (i * 0.72) % (Math.PI * 2);
      const pillarRadius = 0.58 + (i % 3) * 0.04;
      const x = pillarX + Math.cos(angle) * pillarRadius;
      const z = Math.sin(angle) * pillarRadius;
      const y = 0.3 + (i / count) * 4.2 + (Math.sin(i * 1.7) * 0.2);

      tempPos.set(x, y, z);
      // Billboard normal pointing outward from pillar
      tempRot.set(
        (Math.sin(i * 3.1) - 0.5) * 0.4,
        -angle + Math.PI / 2,
        (Math.cos(i * 2.3) - 0.5) * 0.4
      );
      tempQuat.setFromEuler(tempRot);

      const s = 0.22 + (i % 4) * 0.06;
      tempScale.set(s, s * 1.3, s);

      tempMatrix.compose(tempPos, tempQuat, tempScale);
      mats.push(tempMatrix.clone());
      cols.push(ivyColors[i % ivyColors.length]);
    }

    return { matrices: mats, colors: cols };
  }, [pillarX, count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    // Gentle campus breeze sway
    meshRef.current.rotation.y = Math.sin(time * 0.6 + pillarX) * 0.02;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <planeGeometry args={[0.5, 0.45]} />
      <meshStandardMaterial
        color="#32592b"
        roughness={0.72}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

export function IvyField() {
  return (
    <group position={[0, 0, 0]}>
      <PillarIvy pillarX={-3.85} />
      <PillarIvy pillarX={3.85} />
    </group>
  );
}
