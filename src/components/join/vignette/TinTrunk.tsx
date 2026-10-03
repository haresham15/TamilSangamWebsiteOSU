"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * TinTrunk (§5 Item 10 & 9)
 *
 * Location: x = -5.94 (-0.9W), z = +5.94 (+0.9W), y = 0
 * Painted vintage collegiate tin trunk with:
 * - Bound cotton bedding roll tied with leather luggage straps
 * - 3-tier stainless steel tiffin carrier (lunch box)
 * Strictly outside keep-out volume [X: -3.8 to 3.8, Y: 0 to 5.5, Z: -0.5 to 3.75].
 */
export function TinTrunk() {
  const trunkMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1B3B4B", // Vintage painted cobalt-teal tin trunk
        roughness: 0.42,
        metalness: 0.35,
      }),
    []
  );

  const brassTrimMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D4AF37",
        roughness: 0.3,
        metalness: 0.88,
      }),
    []
  );

  const beddingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D6CCA8", // Khaki canvas bedding roll
        roughness: 0.88,
        metalness: 0.02,
      }),
    []
  );

  const leatherStrapMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#5C3A21", // Brown leather luggage belt
        roughness: 0.6,
        metalness: 0.1,
      }),
    []
  );

  const tiffinMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#F1F5F9", // Bright polished stainless steel
        roughness: 0.18,
        metalness: 0.95,
      }),
    []
  );

  React.useEffect(() => {
    return () => {
      trunkMaterial.dispose();
      brassTrimMaterial.dispose();
      beddingMaterial.dispose();
      leatherStrapMaterial.dispose();
      tiffinMaterial.dispose();
    };
  }, [
    trunkMaterial,
    brassTrimMaterial,
    beddingMaterial,
    leatherStrapMaterial,
    tiffinMaterial,
  ]);

  return (
    <group position={[-5.35, 0, 1.2]} rotation={[0, 0.22, 0]}>
      {/* 1. Main Tin Trunk Box */}
      <mesh position={[0, 0.36, 0]} material={trunkMaterial} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.72, 0.78]} />
      </mesh>

      {/* Trunk Lid Rim */}
      <mesh position={[0, 0.72, 0]} material={trunkMaterial} castShadow>
        <boxGeometry args={[1.38, 0.08, 0.81]} />
      </mesh>

      {/* Brass Corner Protectors & Latches */}
      {[-0.66, 0.66].map((x, xi) =>
        [-0.38, 0.38].map((z, zi) => (
          <mesh key={`${xi}-${zi}`} position={[x, 0.36, z]} material={brassTrimMaterial}>
            <boxGeometry args={[0.08, 0.68, 0.08]} />
          </mesh>
        ))
      )}

      {/* Center Brass Latch */}
      <mesh position={[0, 0.66, 0.40]} material={brassTrimMaterial}>
        <boxGeometry args={[0.14, 0.12, 0.04]} />
      </mesh>

      {/* Side Handles */}
      <mesh position={[-0.69, 0.42, 0]} material={brassTrimMaterial}>
        <boxGeometry args={[0.04, 0.08, 0.22]} />
      </mesh>
      <mesh position={[0.69, 0.42, 0]} material={brassTrimMaterial}>
        <boxGeometry args={[0.04, 0.08, 0.22]} />
      </mesh>

      {/* =================================================================== */}
      {/* 2. Rolled Cotton Bedding Roll strapped to trunk                     */}
      {/* =================================================================== */}
      <group position={[-0.15, 0.92, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={beddingMaterial} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.92, 24]} />
        </mesh>
        {/* Leather Straps wrapping the roll */}
        {[-0.26, 0.26].map((yOffset, i) => (
          <mesh key={i} position={[0, yOffset, 0]} material={leatherStrapMaterial}>
            <cylinderGeometry args={[0.168, 0.168, 0.045, 24]} />
          </mesh>
        ))}
      </group>

      {/* =================================================================== */}
      {/* 3. Three-Tier Stainless Steel Tiffin Carrier (§5 Item 9)             */}
      {/* =================================================================== */}
      <group position={[0.42, 0.76, 0.12]}>
        {/* Tier 1 */}
        <mesh position={[0, 0.06, 0]} material={tiffinMaterial} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.11, 24]} />
        </mesh>
        {/* Tier 2 */}
        <mesh position={[0, 0.18, 0]} material={tiffinMaterial} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.11, 24]} />
        </mesh>
        {/* Tier 3 */}
        <mesh position={[0, 0.30, 0]} material={tiffinMaterial} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.11, 24]} />
        </mesh>
        {/* Top Handle Frame */}
        <mesh position={[0, 0.40, 0]} material={tiffinMaterial}>
          <boxGeometry args={[0.24, 0.03, 0.04]} />
        </mesh>
        <mesh position={[-0.11, 0.22, 0]} material={tiffinMaterial}>
          <boxGeometry args={[0.02, 0.36, 0.02]} />
        </mesh>
        <mesh position={[0.11, 0.22, 0]} material={tiffinMaterial}>
          <boxGeometry args={[0.02, 0.36, 0.02]} />
        </mesh>
      </group>
    </group>
  );
}
