"use client";

import React, { useMemo, useEffect } from "react";
import * as THREE from "three";
import { getRosewoodTexture } from "./rosewoodTexture";
import { getNeckWidth } from "./fretMath";

/**
 * Fretboard Component (§3.1 & §3.2)
 *
 * Tapered, radiused rosewood neck extending from s = -2 to s = 100 (world z = 2 to -100).
 * Top has a gentle 12" radius camber (center elevated by ~0.04 su).
 * Procedural grain CanvasTexture with roughness 0.85 ± 0.08.
 */
export function Fretboard() {
  const rosewoodTex = useMemo(() => getRosewoodTexture(), []);

  // Construct radiused, tapered fretboard geometry
  const geometry = useMemo(() => {
    const sStart = -2.0;
    const sEnd = 102.0;
    const lengthSegments = 120;
    const widthSegments = 16;

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let j = 0; j <= lengthSegments; j++) {
      const v = j / lengthSegments;
      const s = sStart + v * (sEnd - sStart);
      const z = -s;
      const width = getNeckWidth(s);
      const halfWidth = width / 2.0;

      for (let i = 0; i <= widthSegments; i++) {
        const u = i / widthSegments;
        const xNormalized = (u - 0.5) * 2.0; // -1 to 1
        const x = xNormalized * halfWidth;

        // Subtle 12" camber profile: dome curvature peaking at x = 0
        const yRadius = 0.04 * (1.0 - xNormalized * xNormalized);

        positions.push(x, yRadius, z);

        // Approximate upward-tilted normal with camber
        const nx = -xNormalized * 0.15;
        const ny = 1.0;
        const nz = 0.0;
        const len = Math.hypot(nx, ny, nz);
        normals.push(nx / len, ny / len, nz / len);

        // UV coordinates: stretched along length (v)
        uvs.push(v * 4.0, u);
      }
    }

    // Grid triangles
    const stride = widthSegments + 1;
    for (let j = 0; j < lengthSegments; j++) {
      for (let i = 0; i < widthSegments; i++) {
        const a = j * stride + i;
        const b = (j + 1) * stride + i;
        const c = (j + 1) * stride + (i + 1);
        const d = j * stride + (i + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  // Cream neck binding along sides
  const leftBindingGeo = useMemo(() => new THREE.BoxGeometry(0.08, 0.22, 104.0), []);
  const rightBindingGeo = useMemo(() => new THREE.BoxGeometry(0.08, 0.22, 104.0), []);

  useEffect(() => {
    return () => {
      leftBindingGeo.dispose();
      rightBindingGeo.dispose();
    };
  }, [leftBindingGeo, rightBindingGeo]);

  return (
    <group>
      {/* 1. Main Tapered Rosewood Fingerboard */}
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          map={rosewoodTex}
          roughness={0.85}
          metalness={0.05}
          envMapIntensity={1.2}
          color="#2a1710"
        />
      </mesh>

      {/* 2. Side Bindings (Ivory Strip) */}
      <mesh
        geometry={leftBindingGeo}
        position={[-3.3, -0.06, -50.0]}
        rotation={[0, 0.007, 0]}
      >
        <meshStandardMaterial
          color="#f4eee0"
          roughness={0.4}
          metalness={0.1}
          envMapIntensity={0.8}
        />
      </mesh>
      <mesh
        geometry={rightBindingGeo}
        position={[3.3, -0.06, -50.0]}
        rotation={[0, -0.007, 0]}
      >
        <meshStandardMaterial
          color="#f4eee0"
          roughness={0.4}
          metalness={0.1}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* 3. Bone Nut at s = 0 (z = 0) */}
      <mesh position={[0.0, 0.14, 0.0]} castShadow>
        <boxGeometry args={[6.05, 0.26, 0.45]} />
        <meshStandardMaterial
          color="#FFF8E7"
          roughness={0.3}
          metalness={0.05}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* 4. Acoustic Bridge Block at s = 100 (z = -100) */}
      <mesh position={[0.0, 0.18, -100.0]} castShadow>
        <boxGeometry args={[7.8, 0.42, 3.2]} />
        <meshStandardMaterial
          color="#180e0a"
          roughness={0.7}
          metalness={0.2}
          envMapIntensity={1.4}
        />
      </mesh>
    </group>
  );
}
