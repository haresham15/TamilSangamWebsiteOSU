"use client";

import React, { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { computeAllInlays } from "./fretMath";

/**
 * Inlays Component (§3.1)
 *
 * Traditional mother-of-pearl position marker inlays.
 * Single dots at frets 3, 5, 7, 9, 15, 17, 19, 21.
 * Double dots at octave landmarks 12 (Era 3 boundary) and 24 (End of journey).
 * Rendered using InstancedMesh with MeshPhysicalMaterial (iridescence 0.6, roughness 0.25).
 */
export function Inlays() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const inlays = useMemo(() => computeAllInlays(), []);

  // Total dot instances: 8 singles + 2 doubles (4 dots) = 12
  const totalDots = useMemo(() => {
    return inlays.reduce((acc, curr) => acc + curr.xOffsets.length, 0);
  }, [inlays]);

  const discGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.24, 0.24, 0.02, 24);
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#F6F2E8",
        roughness: 0.25,
        metalness: 0.1,
        iridescence: 0.65,
        iridescenceIOR: 1.35,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.5,
      }),
    []
  );

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    let instanceIndex = 0;

    for (const inlay of inlays) {
      for (const x of inlay.xOffsets) {
        // Discs sit flush on the fretboard surface
        dummy.position.set(x, 0.045, inlay.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();

        meshRef.current.setMatrixAt(instanceIndex, dummy.matrix);
        instanceIndex++;
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [inlays]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[discGeo, material, totalDots]}
      receiveShadow
    />
  );
}
