"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { guideStationPalette } from "./palette";

const RAIN_COUNT = 480;

/**
 * Procedural cinematic drizzle: streaks only catch light in the window
 * and overhead station lamp cones (PRD §5.4).
 */
export function RainStreaks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const rainData = useMemo(() => {
    return Array.from({ length: RAIN_COUNT }, (_, index) => {
      // Concentrate streaks in front of the coach and platform (x: -5 to +5, z: 0.2 to 5.0)
      const x = (((index * 37) % 100) / 100 - 0.5) * 8.0;
      const y = 0.5 + (((index * 53) % 100) / 100) * 5.0;
      const z = 0.4 + (((index * 79) % 100) / 100) * 4.6;
      const rotZ = -0.06 + (((index % 7) - 3) * 0.01); // Subtle wind angle
      const speed = 5.5 + (index % 5) * 0.4;
      return { x, y, z, rotZ, speed, currentY: y };
    });
  }, []);

  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempRot = useMemo(() => new THREE.Euler(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);
  const colorArray = useMemo(() => new Float32Array(RAIN_COUNT * 3), []);

  // Compute instanced colors: alpha / brightness depends on proximity to window light cone
  const lightConeOrigin = useMemo(() => new THREE.Vector3(0, 1.7, 0.0), []);

  useFrame((_, delta) => {
    if (reduceMotion) return;
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const mesh = meshRef.current;
    if (!mesh) return;

    for (let i = 0; i < RAIN_COUNT; i++) {
      const d = rainData[i];
      d.currentY -= d.speed * dt;
      if (d.currentY < 0.1) {
        d.currentY += 5.2;
      }

      // Check distance to window light cone
      const dx = d.x - lightConeOrigin.x;
      const dy = d.currentY - lightConeOrigin.y;
      const dz = d.z - lightConeOrigin.z;

      // Inside warm window light cone: z > 0, angle within light spread
      const distFromConeAxis = Math.hypot(dx, dy * 1.5);
      const coneRadiusAtZ = 0.5 + dz * 0.65;
      const inWindowCone = dz > 0 && distFromConeAxis < coneRadiusAtZ;

      // Brightness: warm golden when catching window light, faint cool blue elsewhere
      let r = 0.15, g = 0.22, b = 0.30; // Ambient cool
      let scaleY = 0.22;

      if (inWindowCone) {
        const intensity = Math.max(0, 1.0 - distFromConeAxis / coneRadiusAtZ);
        r = 1.0 * intensity + 0.15 * (1 - intensity);
        g = 0.72 * intensity + 0.22 * (1 - intensity);
        b = 0.35 * intensity + 0.30 * (1 - intensity);
        scaleY = 0.28 + intensity * 0.12;
      }

      colorArray[i * 3] = r;
      colorArray[i * 3 + 1] = g;
      colorArray[i * 3 + 2] = b;

      tempPos.set(d.x, d.currentY, d.z);
      tempRot.set(0, 0, d.rotZ);
      tempQuat.setFromEuler(tempRot);
      tempScale.set(0.0018, scaleY, 0.0018);
      tempMatrix.compose(tempPos, tempQuat, tempScale);
      mesh.setMatrixAt(i, tempMatrix);
    }

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (reduceMotion) {
    return null;
  }

  return (
    <group name="DrizzleAndShafts">
      {/* Soft volumetric warm light shaft emerging from window onto the platform */}
      <mesh position={[0, 1.2, 1.5]} rotation={[Math.PI / 2 + 0.2, 0, 0]} renderOrder={6}>
        <cylinderGeometry args={[0.55, 1.6, 2.8, 16, 1, true]} />
        <meshBasicMaterial
          color={guideStationPalette.windowGlow}
          transparent
          opacity={0.035}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Instanced thin rain streaks catching light */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, RAIN_COUNT]}
        name="LightMaskedDrizzle"
        frustumCulled={false}
        renderOrder={12}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}

export default RainStreaks;
