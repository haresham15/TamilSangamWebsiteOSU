"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

interface DaturaCauldronProps {
  position?: [number, number, number];
  scale?: number | [number, number, number];
}

/**
 * DaturaCauldron: Procedural 3D industrial vat & elevated wooden platform
 * Reconstructed from the "Naa Ready" (Leo 2023) stadium reference footage.
 *
 * Specifications:
 * - Inner Table: radiusTop: 1.8, radiusBottom: 1.8, height: 0.2 (y: 0.95 -> surface y: 1.05)
 * - Material: Rich wood/metal texture with roughness: 0.8 and bumpScale: 0.02
 * - Outer Cauldron: Wraps tightly around R_out = 12.0 crowd boundary (radiusTop: 12.8, height: 4.5)
 */
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

let cachedWoodTextures: { woodTexture: THREE.CanvasTexture | null; woodBumpMap: THREE.CanvasTexture | null } | null = null;

function getProceduralWoodTextures(): { woodTexture: THREE.CanvasTexture | null; woodBumpMap: THREE.CanvasTexture | null } {
  if (cachedWoodTextures) return cachedWoodTextures;
  if (typeof document === "undefined") {
    return { woodTexture: null, woodBumpMap: null };
  }
  const rand = seededRandom(42);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { woodTexture: null, woodBumpMap: null };

  // Dark rustic timber base
  ctx.fillStyle = "#221307";
  ctx.fillRect(0, 0, 512, 512);

  // Radial growth rings & planks
  for (let r = 20; r < 360; r += 16) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(42, 24, 10, 0.4)";
    ctx.lineWidth = 3 + Math.sin(r) * 2;
    ctx.stroke();
  }

  // High-frequency wood grain lines & micro-scratches
  for (let i = 0; i < 400; i++) {
    const y = rand() * 512;
    ctx.fillStyle = rand() > 0.5 ? "rgba(10, 6, 2, 0.35)" : "rgba(65, 38, 16, 0.25)";
    ctx.fillRect(0, y, 512, 1 + rand() * 2);
  }

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;

  // Bump canvas
  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext("2d");
  if (bCtx) {
    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 800; i++) {
      const x = rand() * 512;
      const y = rand() * 512;
      bCtx.fillStyle = rand() > 0.5 ? "#ffffff" : "#000000";
      bCtx.fillRect(x, y, 2 + rand() * 8, 1);
    }
  }
  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;

  cachedWoodTextures = { woodTexture: diffuse, woodBumpMap: bump };
  return cachedWoodTextures;
}

export function DaturaCauldron({
  position = [0, 0, 0],
  scale = 1,
}: DaturaCauldronProps) {
  // 1. Procedural High-Fidelity Timber Grain & Bump Maps
  const { woodTexture, woodBumpMap } = useMemo(() => {
    return getProceduralWoodTextures();
  }, []);

  // Industrial Cast Iron Material for the Outer Cauldron Vat
  const ironMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1A0F05",
        roughness: 0.9,
        metalness: 0.6,
        side: THREE.DoubleSide,
      }),
    []
  );

  // Rich Tactile Wood/Metal Material for the Standing Platform
  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2E1A0C",
        map: woodTexture,
        bumpMap: woodBumpMap,
        bumpScale: 0.02,
        roughness: 0.8,
        metalness: 0.25,
      }),
    [woodTexture, woodBumpMap]
  );

  // Oxidized Brass Rivet & Trim Material
  const brassTrimMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D97706",
        roughness: 0.45,
        metalness: 0.8,
      }),
    []
  );

  // 4 Table leg positions placed along circumference (radius 1.35m at 90 deg offsets)
  const legRadius = 1.35;
  const legHeight = 0.85;
  const legY = legHeight / 2; // resting on ground y=0 up to tabletop bottom y=0.85
  const legPositions = useMemo(() => {
    return [0, 1, 2, 3].map((i) => {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      return [
        Math.cos(angle) * legRadius,
        legY,
        Math.sin(angle) * legRadius,
      ] as [number, number, number];
    });
  }, [legY]);

  // Procedural perimeter rivets around the outer cauldron rim lip (radius: 12.8)
  const rivetCount = 48;
  const rivets = useMemo(() => {
    return Array.from({ length: rivetCount }).map((_, i) => {
      const angle = (i / rivetCount) * Math.PI * 2;
      const r = 12.88;
      return [
        Math.cos(angle) * r,
        2.25,
        Math.sin(angle) * r,
      ] as [number, number, number];
    });
  }, []);

  return (
    <group position={position} scale={scale}>
      {/* ===================================================================
          1. OUTER INDUSTRIAL VAT (WRAPPED TIGHTLY AROUND R_out = 12.0m)
          =================================================================== */}
      <group name="datura-vat-cauldron">
        {/* Outer Rim Sloped Cylinder: radiusTop 12.8, radiusBottom 12.2, height 4.5 */}
        <mesh
          position={[0, 0, 0]}
          material={ironMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry
            args={[12.8, 12.2, 4.5, 64, 1, true]}
          />
        </mesh>

        {/* Vat Bottom Floor Plate (y: -2.25, radius: 12.2) */}
        <mesh
          position={[0, -2.25, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={ironMaterial}
          receiveShadow
        >
          <circleGeometry args={[12.2, 64]} />
        </mesh>

        {/* Outer Heavy Rim Lip: Torus radius 12.8, tube 0.38 at y: 2.25 */}
        <mesh
          position={[0, 2.25, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={ironMaterial}
          castShadow
          receiveShadow
        >
          <torusGeometry args={[12.8, 0.38, 16, 64]} />
        </mesh>

        {/* Reinforcement Base Ring Lip: Torus radius 12.2, tube 0.28 at y: -2.25 */}
        <mesh
          position={[0, -2.25, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={ironMaterial}
          receiveShadow
        >
          <torusGeometry args={[12.2, 0.28, 16, 64]} />
        </mesh>

        {/* Left Forged Vat Handle: x: -13.1, y: 1.6, z: 0 */}
        <mesh
          position={[-13.1, 1.6, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={ironMaterial}
          castShadow
        >
          <torusGeometry args={[1.3, 0.2, 16, 32, Math.PI]} />
        </mesh>

        {/* Right Forged Vat Handle: x: +13.1, y: 1.6, z: 0 */}
        <mesh
          position={[13.1, 1.6, 0]}
          rotation={[0, 0, -Math.PI / 2]}
          material={ironMaterial}
          castShadow
        >
          <torusGeometry args={[1.3, 0.2, 16, 32, Math.PI]} />
        </mesh>

        {/* Perimeter Industrial Rivets around Outer Rim */}
        <group name="rim-rivets">
          {rivets.map((pos, idx) => (
            <mesh
              key={idx}
              position={pos}
              material={brassTrimMaterial}
            >
              <sphereGeometry args={[0.075, 8, 8]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ===================================================================
          2. INNER ELEVATED TABLE (RADIUS 1.8m, HEIGHT 0.2m, SURFACE Y: 1.05m)
          =================================================================== */}
      <group name="inner-vijay-platform" position={[0, 0, 0]}>
        {/* Tabletop Cylinder: radiusTop 1.8, radiusBottom 1.8, height 0.2 at y: 0.95 */}
        <mesh
          position={[0, 0.95, 0]}
          material={woodMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[1.8, 1.8, 0.2, 48]} />
        </mesh>

        {/* Tabletop Machined Brass Rim Lip */}
        <mesh
          position={[0, 0.95, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={brassTrimMaterial}
        >
          <torusGeometry args={[1.8, 0.045, 16, 48]} />
        </mesh>

        {/* 4 Heavy Braced Timber Pillar Legs */}
        {legPositions.map((pos, idx) => (
          <group key={idx} position={pos}>
            <mesh material={woodMaterial} castShadow receiveShadow>
              <cylinderGeometry args={[0.08, 0.1, legHeight, 16]} />
            </mesh>
            {/* Cast Iron Foot Bracket at ground */}
            <mesh
              position={[0, -legHeight / 2 + 0.04, 0]}
              material={ironMaterial}
            >
              <cylinderGeometry args={[0.12, 0.14, 0.08, 16]} />
            </mesh>
            {/* Top Collar Bracket below tabletop */}
            <mesh
              position={[0, legHeight / 2 - 0.04, 0]}
              material={brassTrimMaterial}
            >
              <cylinderGeometry args={[0.12, 0.11, 0.08, 16]} />
            </mesh>
          </group>
        ))}

        {/* Center Support Cross Bracing between legs */}
        <mesh position={[0, 0.45, 0]} material={ironMaterial} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.5, 8]} />
        </mesh>
        <mesh
          position={[0, 0.45, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={ironMaterial}
          castShadow
        >
          <cylinderGeometry args={[0.06, 0.06, 2.5, 8]} />
        </mesh>
      </group>
    </group>
  );
}
