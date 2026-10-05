"use client";

import React, { useMemo, useRef, useLayoutEffect, useEffect } from "react";
import * as THREE from "three";
import { computeAllFrets, TOTAL_FRETS } from "./fretMath";

/**
 * Frets Component (§3.1)
 *
 * 24 true 12-TET frets rendered using a single InstancedMesh (1 draw call).
 * Cylinder radius ~0.08, half-buried into rosewood, metalness 1.0, roughness 0.2, color #C9C9C4.
 */
export function Frets() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const frets = useMemo(() => computeAllFrets(), []);

  // Base fret wire cylinder: radius 0.08, length 1.0 (scaled per-instance to W(s) + 0.2)
  const cylinderGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 16);
    // Rotate so cylinder points along X axis
    geo.rotateZ(Math.PI / 2.0);
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C9C9C4",
        metalness: 1.0,
        roughness: 0.22,
        envMapIntensity: 1.6,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    []
  );

  useEffect(() => {
    return () => {
      cylinderGeo.dispose();
      material.dispose();
    };
  }, [cylinderGeo, material]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();

    frets.forEach((fret, i) => {
      const fretLength = fret.width + 0.24;
      // Position at world coordinate (x=0, y=0.04, z=-s)
      dummy.position.set(0.0, 0.04, fret.z);
      dummy.rotation.set(0.0, 0.0, 0.0);
      dummy.scale.set(fretLength, 1.0, 1.0);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [frets]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[cylinderGeo, material, TOTAL_FRETS]}
      castShadow
      receiveShadow
    />
  );
}
