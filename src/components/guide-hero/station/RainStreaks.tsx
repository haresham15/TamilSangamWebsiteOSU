"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { guideStationPalette } from "./palette";

const RAIN_COUNT = 96;
const BOKEH_COUNT = 16;

/** Animated cone-confined drizzle on the master tick; zero steady-state allocations. */
export function RainStreaks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const bokehRef = useRef<THREE.InstancedMesh>(null);

  const rainData = useMemo(() => {
    return Array.from({ length: RAIN_COUNT }, (_, index) => {
      const lane = ((index * 37) % 97) / 97 - 0.5;
      const depth = ((index * 53) % 89) / 89;
      const x = lane * (3.2 - depth * 1.8);
      const y = 3.25 - depth * 2.05;
      const z = 0.78 + (index % 4) * 0.035;
      const rotZ = 0.13 + ((index % 5) - 2) * 0.015;
      const scaleX = 0.014;
      const scaleY = 0.28 + (index % 7) * 0.045;
      const scaleZ = 0.014;
      const speed = 3.8 + (index % 5) * 0.6;
      return { x, y, z, rotZ, scaleX, scaleY, scaleZ, speed, currentY: y };
    });
  }, []);

  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempRot = useMemo(() => new THREE.Euler(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);

  const bokehTransforms = useMemo(() => {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    return Array.from({ length: BOKEH_COUNT }, (_, index) => {
      position.set((((index * 19) % 31) / 31 - 0.5) * 3.5, 1.35 + ((index * 11) % 19) / 19 * 1.8, 0.83);
      const size = 0.025 + (index % 4) * 0.012;
      scale.setScalar(size);
      matrix.compose(position, new THREE.Quaternion(), scale);
      return matrix;
    });
  }, []);

  useLayoutEffect(() => {
    const mesh = bokehRef.current;
    if (!mesh) return;
    bokehTransforms.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  }, [bokehTransforms]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(Math.max(delta, 0), 0.05);
    for (let i = 0; i < RAIN_COUNT; i++) {
      const d = rainData[i];
      d.currentY -= d.speed * dt;
      if (d.currentY < 0.6) {
        d.currentY += 2.8;
      }
      tempPos.set(d.x, d.currentY, d.z);
      tempRot.set(0, 0, d.rotZ);
      tempQuat.setFromEuler(tempRot);
      tempScale.set(d.scaleX, d.scaleY, d.scaleZ);
      tempMatrix.compose(tempPos, tempQuat, tempScale);
      mesh.setMatrixAt(i, tempMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, RAIN_COUNT]} name="WindowConeDrizzle" frustumCulled>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={guideStationPalette.practicalWarm} transparent opacity={0.16} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={bokehRef} args={[undefined, undefined, BOKEH_COUNT]} name="WindowRainBokeh" frustumCulled>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color={guideStationPalette.practicalWarm} transparent opacity={0.2} depthWrite={false} />
      </instancedMesh>
    </>
  );
}

export default RainStreaks;
