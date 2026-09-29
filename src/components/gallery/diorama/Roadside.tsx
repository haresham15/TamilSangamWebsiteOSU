"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { galleryScrollState } from "../galleryStore";

const SILHOUETTE_VERTEX = /* glsl */ `
  attribute float aScale;
  attribute float aType; // 0.0 = palm, 1.0 = utility pole
  varying vec2 vUv;
  varying float vType;

  void main() {
    vUv = uv;
    vType = aType;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

const SILHOUETTE_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  varying float vType;

  void main() {
    float x = vUv.x - 0.5; // -0.5 to +0.5
    float y = vUv.y;       // 0.0 at base, 1.0 at crown

    float alpha = 0.0;

    if (vType < 0.5) {
      // 1. Authentic Coastal Coconut Palm Silhouette
      // Naturally curved, tapered trunk leaning slightly right (+x) toward the road
      float trunkLean = sin(y * 1.8) * 0.06;
      float trunkWidth = mix(0.038, 0.016, y / 0.75);
      float trunk = step(abs(x - trunkLean), trunkWidth) * step(y, 0.76);

      // Gracefully drooping coconut frond canopy
      vec2 crownCenter = vec2(trunkLean, 0.76);
      vec2 frondVec = vec2(x - crownCenter.x, y - crownCenter.y);
      float dist = length(vec2(frondVec.x * 1.35, frondVec.y * 1.8));
      float angle = atan(frondVec.y, frondVec.x);

      // Multi-frequency drooping fronds
      float frondProfile = 0.28 + 0.12 * sin(angle * 9.0) + 0.06 * cos(angle * 17.0);
      float canopy = step(dist, frondProfile) * step(0.68, y);

      alpha = max(trunk, canopy);
    } else {
      // 2. Coastal Highway Utility Pole with Insulators
      // Main wooden mast
      float mast = step(abs(x), 0.016) * step(y, 0.94);
      // Double crossbars
      float crossbar1 = step(abs(x), 0.24) * step(abs(y - 0.88), 0.012);
      float crossbar2 = step(abs(x), 0.18) * step(abs(y - 0.81), 0.010);
      // Insulator pegs
      float pegLeft = step(abs(x + 0.2), 0.012) * step(abs(y - 0.895), 0.015);
      float pegRight = step(abs(x - 0.2), 0.012) * step(abs(y - 0.895), 0.015);

      alpha = max(max(max(mast, crossbar1), crossbar2), max(pegLeft, pegRight));
    }

    if (alpha < 0.5) discard;

    // Silhouette Base #0d0709
    vec3 baseCol = vec3(0.047, 0.024, 0.031);

    // Warm Golden-Orange Rim highlight along the sunward edge (facing +x)
    float rim = smoothstep(-0.05, 0.22, x) * 0.42;
    vec3 rimCol = vec3(0.95, 0.48, 0.22); // Solar amber rim

    vec3 finalCol = mix(baseCol, rimCol, rim);

    gl_FragColor = vec4(finalCol, 1.0);
  }
`;

const INSTANCE_COUNT = 36;

export function Roadside() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const zPositions = useRef<Float32Array>(new Float32Array(INSTANCE_COUNT));

  const geometry = useMemo(() => new THREE.PlaneGeometry(6.5, 14.0), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SILHOUETTE_VERTEX,
        fragmentShader: SILHOUETTE_FRAGMENT,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    []
  );

  const initialTransforms = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const types = new Float32Array(INSTANCE_COUNT);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < INSTANCE_COUNT; i++) {
      // Spaced 8m to 16m apart along the left road verge (x ≈ -5.2 to -7.5)
      const z = -10 - i * 9.5;
      const x = -5.4 - (i % 3) * 0.75;
      const scale = 0.8 + ((i * 7) % 5) * 0.1; // 0.8 to 1.2
      const isPole = i % 4 === 0 ? 1.0 : 0.0;

      zPositions.current[i] = z;
      types[i] = isPole;

      dummy.position.set(x, scale * 6.5, z);
      dummy.scale.set(scale, scale, 1);
      dummy.rotation.set(0, 0, (Math.sin(i * 1.5) * 0.04));
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }

    return { matrices, types };
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    initialTransforms.matrices.forEach((mat, idx) => {
      meshRef.current?.setMatrixAt(idx, mat);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material, initialTransforms]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const speed = 1.2 + Math.min(2.8, Math.abs(galleryScrollState.velocity) * 0.003);
    const dummy = new THREE.Object3D();

    let needsUpdate = false;
    for (let i = 0; i < INSTANCE_COUNT; i++) {
      // Advance toward camera
      zPositions.current[i] += delta * speed * 2.0;

      // Recycle when behind camera
      if (zPositions.current[i] > 10.0) {
        zPositions.current[i] = -340.0 + (zPositions.current[i] - 10.0);
        needsUpdate = true;
      }

      meshRef.current.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
      dummy.position.z = zPositions.current[i];
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, INSTANCE_COUNT]}
      position={[0, 0, 0]}
    />
  );
}
