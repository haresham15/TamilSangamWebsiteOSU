"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { guideStationPalette } from "./palette";

const RAIN_COUNT = 96;
const BOKEH_COUNT = 16;

/** Static Phase 2 cone-confined drizzle; Phase 3 may animate the same instanced rig on the master tick. */
export function RainStreaks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const bokehRef = useRef<THREE.InstancedMesh>(null);
  const transforms = useMemo(() => {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const scale = new THREE.Vector3();

    return Array.from({ length: RAIN_COUNT }, (_, index) => {
      const lane = ((index * 37) % 97) / 97 - 0.5;
      const depth = ((index * 53) % 89) / 89;
      position.set(lane * (3.2 - depth * 1.8), 3.25 - depth * 2.05, 0.78 + (index % 4) * 0.035);
      rotation.set(0, 0, 0.13 + ((index % 5) - 2) * 0.015);
      scale.set(0.014, 0.28 + (index % 7) * 0.045, 0.014);
      matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
      return matrix;
    });
  }, []);
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
    const mesh = meshRef.current;
    if (!mesh) return;
    transforms.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  }, [transforms]);
  useLayoutEffect(() => {
    const mesh = bokehRef.current;
    if (!mesh) return;
    bokehTransforms.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  }, [bokehTransforms]);

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
