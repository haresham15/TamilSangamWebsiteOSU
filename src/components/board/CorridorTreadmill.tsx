"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { OilLamp } from "./OilLamp";
import { TapestryPortrait } from "./TapestryPortrait";
import { CURRENT_BOARD } from "@/data/board";
import { useBoardHeroStore } from "@/store/boardHeroStore";

// Corridor Dimensions
export const UNIT_LENGTH = 5.0; // 5 meters per modular arch/pillar unit
export const POOL_SIZE = 7;     // 7 recycled instances
export const AISLE_WIDTH = 3.8; // 3.8m wide stone aisle between pillars
export const PILLAR_HEIGHT = 4.2;

interface SharedAssets {
  geometries: {
    floor: THREE.BoxGeometry;
    inlay: THREE.BoxGeometry;
    groove: THREE.BoxGeometry;
    plinth: THREE.BoxGeometry;
    shaft: THREE.CylinderGeometry;
    capital: THREE.BoxGeometry;
    bracket: THREE.BoxGeometry;
    crossBeam: THREE.BoxGeometry;
    ceiling: THREE.BoxGeometry;
    joist: THREE.BoxGeometry;
    opening: THREE.BoxGeometry;
  };
  materials: {
    floor: THREE.MeshStandardMaterial;
    inlay: THREE.MeshStandardMaterial;
    darkGroove: THREE.MeshBasicMaterial;
    plinth: THREE.MeshStandardMaterial;
    shaft: THREE.MeshStandardMaterial;
    capital: THREE.MeshStandardMaterial;
    corbel: THREE.MeshStandardMaterial;
    crossBeam: THREE.MeshStandardMaterial;
    ceiling: THREE.MeshStandardMaterial;
    joist: THREE.MeshStandardMaterial;
    opening: THREE.MeshBasicMaterial;
  };
}

interface CorridorSegmentProps {
  unitIndex: number;
  nearestLampIndices: Set<number>;
  sharedAssets: SharedAssets;
}

/**
 * Procedural Dravidian / Chola Stone Architecture Unit (§1, §3).
 * Symmetrical archway span, octagonal fluted pillars, lotus capitals,
 * stone slab paving, and ceiling lintels in warm torch-lit sandstone (#6B4A32).
 * All meshes draw from a shared memoized geometry and material pool to eliminate allocations.
 */
function CholaModularSegment({
  unitIndex,
  nearestLampIndices,
  sharedAssets,
}: CorridorSegmentProps) {
  const halfAisle = AISLE_WIDTH / 2;

  // Board member assigned to this segment
  const memberLeft = CURRENT_BOARD[(unitIndex * 2) % CURRENT_BOARD.length];
  const memberRight = CURRENT_BOARD[(unitIndex * 2 + 1) % CURRENT_BOARD.length];

  const lampIndexLeft = unitIndex * 2;
  const lampIndexRight = unitIndex * 2 + 1;

  const isLeftLampReal = nearestLampIndices.has(lampIndexLeft);
  const isRightLampReal = nearestLampIndices.has(lampIndexRight);

  const { geometries, materials } = sharedAssets;

  return (
    <group>
      {/* ========================================================================= */}
      {/* 1. FLOOR & SEAMED FLAGSTONE SLABS (Sandstone #2B1D14)                     */}
      {/* ========================================================================= */}
      <mesh
        position={[0, -0.15, 0]}
        receiveShadow
        geometry={geometries.floor}
        material={materials.floor}
      />

      {/* Center Pathway Worn Flagstone Inlay */}
      <mesh
        position={[0, 0.005, 0]}
        receiveShadow
        geometry={geometries.inlay}
        material={materials.inlay}
      />

      {/* Flagstone Tile Cross Grooves */}
      {[-1.8, -0.6, 0.6, 1.8].map((z, i) => (
        <mesh
          key={i}
          position={[0, 0.012, z]}
          geometry={geometries.groove}
          material={materials.darkGroove}
        />
      ))}

      {/* ========================================================================= */}
      {/* 2. LEFT & RIGHT CARVED STONE PILLARS (Dravidian Mandapam Colonnade)       */}
      {/* ========================================================================= */}
      {/* LEFT PILLAR */}
      <group position={[-halfAisle, 0, 0]}>
        {/* Square Plinth Base (Upapitha) */}
        <mesh
          position={[0, 0.3, 0]}
          castShadow
          receiveShadow
          geometry={geometries.plinth}
          material={materials.plinth}
        />
        {/* Octagonal Fluted Shaft (Kambam) */}
        <mesh
          position={[0, 2.0, 0]}
          castShadow
          receiveShadow
          geometry={geometries.shaft}
          material={materials.shaft}
        />
        {/* Carved Lotus Capital (Palagai & Kumbham) */}
        <mesh
          position={[0, 3.5, 0]}
          castShadow
          geometry={geometries.capital}
          material={materials.capital}
        />
        {/* Corbel Bracket (Bodegai) */}
        <mesh
          position={[0.2, 3.75, 0]}
          castShadow
          geometry={geometries.bracket}
          material={materials.corbel}
        />

        {/* Oil Lamp Mounted on Inside Face of Left Pillar */}
        <OilLamp
          position={[0.36, 1.9, 0]}
          phaseOffset={unitIndex * 1.3}
          isRealLight={isLeftLampReal}
        />

        {/* Silk Tapestry Banner hanging between left pillars */}
        {unitIndex % 2 === 0 && (
          <TapestryPortrait
            member={memberLeft}
            position={[0.2, 2.1, -1.8]}
            rotation={[0, 0.15, 0]}
            isLeftAisle={true}
          />
        )}
      </group>

      {/* RIGHT PILLAR */}
      <group position={[halfAisle, 0, 0]}>
        {/* Square Plinth Base */}
        <mesh
          position={[0, 0.3, 0]}
          castShadow
          receiveShadow
          geometry={geometries.plinth}
          material={materials.plinth}
        />
        {/* Octagonal Fluted Shaft */}
        <mesh
          position={[0, 2.0, 0]}
          castShadow
          receiveShadow
          geometry={geometries.shaft}
          material={materials.shaft}
        />
        {/* Carved Lotus Capital */}
        <mesh
          position={[0, 3.5, 0]}
          castShadow
          geometry={geometries.capital}
          material={materials.capital}
        />
        {/* Corbel Bracket */}
        <mesh
          position={[-0.2, 3.75, 0]}
          castShadow
          geometry={geometries.bracket}
          material={materials.corbel}
        />

        {/* Oil Lamp Mounted on Inside Face of Right Pillar */}
        <OilLamp
          position={[-0.36, 1.9, 0]}
          phaseOffset={unitIndex * 1.3 + 3.14}
          isRealLight={isRightLampReal}
        />

        {/* Silk Tapestry Banner hanging between right pillars */}
        {unitIndex % 2 === 1 && (
          <TapestryPortrait
            member={memberRight}
            position={[-0.2, 2.1, -1.8]}
            rotation={[0, -0.15, 0]}
            isLeftAisle={false}
          />
        )}
      </group>

      {/* ========================================================================= */}
      {/* 3. ARCHWAY LINTEL & VAULTED CEILING SPAN (#6B4A32)                        */}
      {/* ========================================================================= */}
      {/* Heavy Cross Beam Spanning Aisle */}
      <mesh
        position={[0, PILLAR_HEIGHT - 0.2, 0]}
        castShadow
        receiveShadow
        geometry={geometries.crossBeam}
        material={materials.crossBeam}
      />

      {/* Carved Stone Vault Ceiling Slabs */}
      <mesh
        position={[0, PILLAR_HEIGHT + 0.3, 0]}
        receiveShadow
        geometry={geometries.ceiling}
        material={materials.ceiling}
      />

      {/* Longitudinal Archway Side Joists */}
      <mesh
        position={[-halfAisle, PILLAR_HEIGHT - 0.1, 0]}
        geometry={geometries.joist}
        material={materials.joist}
      />
      <mesh
        position={[halfAisle, PILLAR_HEIGHT - 0.1, 0]}
        geometry={geometries.joist}
        material={materials.joist}
      />

      {/* Outer Colonnade Openings (Distant Dusk Sky Aperture) */}
      <mesh
        position={[-halfAisle - 1.2, 2.0, 0]}
        geometry={geometries.opening}
        material={materials.opening}
      />
      <mesh
        position={[halfAisle + 1.2, 2.0, 0]}
        geometry={geometries.opening}
        material={materials.opening}
      />
    </group>
  );
}

/**
 * §3: Corridor Treadmill Manager
 * Recycles a fixed pool of modular units relative to camera Z.
 * Keeps draw calls flat and memory bounded.
 */
export function CorridorTreadmill() {
  // Memoized shared geometries & materials pool (shared across all 7 segments)
  const sharedAssets = useMemo<SharedAssets>(() => {
    return {
      geometries: {
        floor: new THREE.BoxGeometry(AISLE_WIDTH + 2.4, 0.3, UNIT_LENGTH),
        inlay: new THREE.BoxGeometry(AISLE_WIDTH - 0.8, 0.01, UNIT_LENGTH - 0.1),
        groove: new THREE.BoxGeometry(AISLE_WIDTH - 0.7, 0.005, 0.03),
        plinth: new THREE.BoxGeometry(0.7, 0.6, 0.7),
        shaft: new THREE.CylinderGeometry(0.26, 0.28, 2.8, 8),
        capital: new THREE.BoxGeometry(0.85, 0.2, 0.85),
        bracket: new THREE.BoxGeometry(0.45, 0.3, 0.6),
        crossBeam: new THREE.BoxGeometry(AISLE_WIDTH + 0.8, 0.45, 0.7),
        ceiling: new THREE.BoxGeometry(AISLE_WIDTH + 2.0, 0.3, UNIT_LENGTH),
        joist: new THREE.BoxGeometry(0.5, 0.35, UNIT_LENGTH),
        opening: new THREE.BoxGeometry(0.1, 3.2, UNIT_LENGTH - 0.4),
      },
      materials: {
        floor: new THREE.MeshStandardMaterial({
          color: "#38251a",
          roughness: 0.9,
          metalness: 0.15,
        }),
        inlay: new THREE.MeshStandardMaterial({
          color: "#422c1e",
          roughness: 0.82,
          metalness: 0.2,
        }),
        darkGroove: new THREE.MeshBasicMaterial({ color: "#1a110a" }),
        plinth: new THREE.MeshStandardMaterial({
          color: "#4d3524",
          roughness: 0.88,
          metalness: 0.25,
        }),
        shaft: new THREE.MeshStandardMaterial({
          color: "#5e412c",
          roughness: 0.85,
          metalness: 0.2,
        }),
        capital: new THREE.MeshStandardMaterial({
          color: "#6b4a32",
          roughness: 0.8,
          metalness: 0.3,
        }),
        corbel: new THREE.MeshStandardMaterial({
          color: "#543a27",
          roughness: 0.8,
          metalness: 0.25,
        }),
        crossBeam: new THREE.MeshStandardMaterial({
          color: "#4a3321",
          roughness: 0.85,
          metalness: 0.2,
        }),
        ceiling: new THREE.MeshStandardMaterial({
          color: "#2d1d12",
          roughness: 0.92,
          metalness: 0.1,
        }),
        joist: new THREE.MeshStandardMaterial({
          color: "#3d281a",
          roughness: 0.88,
        }),
        opening: new THREE.MeshBasicMaterial({ color: "#1a110a" }),
      },
    };
  }, []);

  // Complete unmount lifecycle disposal for shared assets
  useEffect(() => {
    return () => {
      Object.values(sharedAssets.geometries).forEach((g) => g.dispose());
      Object.values(sharedAssets.materials).forEach((m) => m.dispose());
    };
  }, [sharedAssets]);

  // Internal Z positions for each segment in the colonnade (Z = 30 to Z = 0)
  const segmentPositions = useMemo(
    () => Array.from({ length: POOL_SIZE }, (_, i) => 30 - i * UNIT_LENGTH),
    []
  );

  // Set of lamp indices that are currently granted real PointLights (max 2-3)
  const [nearestLampIndices, setNearestLampIndices] = useState<Set<number>>(new Set([0, 1]));
  const nearestLampIndicesRef = useRef<Set<number>>(new Set([0, 1]));
  const lastUpdatedZRef = useRef(30);

  useFrame((state) => {
    const camZ = state.camera.position.z;

    // Dynamic light assignment: find the closest active lamps to camera Z (fully reversible)
    if (Math.abs(camZ - lastUpdatedZRef.current) > 0.8) {
      lastUpdatedZRef.current = camZ;

      // Calculate distances for all lamps relative to camera Z
      const lampDistances: { index: number; dist: number }[] = [];
      for (let i = 0; i < POOL_SIZE; i++) {
        const segZ = segmentPositions[i];
        // Give lamps slightly in front of the camera natural priority over lamps passed behind
        const zDiff = segZ - camZ;
        const dist = zDiff > 1.5 ? Math.abs(zDiff) + 6.0 : Math.abs(zDiff);
        lampDistances.push({ index: i * 2, dist });
        lampDistances.push({ index: i * 2 + 1, dist });
      }

      lampDistances.sort((a, b) => a.dist - b.dist);

      const top0 = lampDistances[0].index;
      const top1 = lampDistances[1].index;

      const current = nearestLampIndicesRef.current;
      if (!current.has(top0) || !current.has(top1)) {
        const nextSet = new Set<number>([top0, top1]);
        nearestLampIndicesRef.current = nextSet;
        setNearestLampIndices(nextSet);
        useBoardHeroStore.getState().setActiveRealLights(nextSet.size);
      }
    }
  });

  return (
    <group>
      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        <group key={i} position={[0, 0, 30 - i * UNIT_LENGTH]}>
          <CholaModularSegment
            unitIndex={i}
            nearestLampIndices={nearestLampIndices}
            sharedAssets={sharedAssets}
          />
        </group>
      ))}
    </group>
  );
}
