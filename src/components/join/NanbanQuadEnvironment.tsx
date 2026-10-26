import React, { useMemo, useEffect } from "react";
import * as THREE from "three";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { proceduralPbrMaps } from "@/lib/proceduralPbrMaps";

/**
 * NanbanQuadEnvironment:
 * Complete Nanban / OSU Oval Collegiate Campus Quad surrounding and extending behind
 * the historic wrought-iron gates (z = 0 to z = -45m):
 *
 * 1. Flanking Collegiate Perimeter Walls & Lantern Pillars (x = -16m to +16m)
 * 2. Tree-Lined Campus Promenade & Manicured Quad Lawns (z = -1.5m to -45m)
 * 3. Colonnade of Golden-Hour Autumn Trees with Overhead Foliage Canopy
 * 4. Architectural Collegiate Heritage Hall & Clock-Tower Rotunda Silhouette (z = -38m)
 * 5. Warm Post-Lanterns & Cast-Iron Avenue Lamps
 */
export function NanbanQuadEnvironment() {
  const isCinematic = isHeroCinematicEnabled("join");

  const textures = useMemo(() => {
    if (!isCinematic) return null;
    const brickNormal = proceduralPbrMaps.getGraniteNormal("join-quad-brick-normal", 256, 256);
    const brickRough = proceduralPbrMaps.getNoiseRoughness("join-quad-brick-rough", 256, 256, 0.78, 0.94);
    const limestoneRough = proceduralPbrMaps.getNoiseRoughness("join-quad-limestone-rough", 256, 256, 0.65, 0.82);
    return { brickNormal, brickRough, limestoneRough };
  }, [isCinematic]);

  useEffect(() => {
    return () => {
      if (isCinematic) {
        proceduralPbrMaps.release("join-quad-brick-normal");
        proceduralPbrMaps.release("join-quad-brick-rough");
        proceduralPbrMaps.release("join-quad-limestone-rough");
      }
    };
  }, [isCinematic]);

  // 1. Shared Materials
  const materials = useMemo(() => {
    const brick = new THREE.MeshStandardMaterial({
      color: "#6b2318",
      roughness: 0.88,
      metalness: 0.05,
      normalMap: textures?.brickNormal,
      roughnessMap: textures?.brickRough,
    });

    const limestone = new THREE.MeshStandardMaterial({
      color: "#cfc4b0",
      roughness: 0.75,
      metalness: 0.12,
      roughnessMap: textures?.limestoneRough,
    });

    const iron = new THREE.MeshStandardMaterial({
      color: "#181412",
      roughness: 0.32,
      metalness: 0.88,
    });

    const brassPlaque = new THREE.MeshStandardMaterial({
      color: "#B38738",
      roughness: 0.35,
      metalness: 0.82,
    });

    const lawn = new THREE.MeshStandardMaterial({
      color: "#283822",
      roughness: 0.92,
      metalness: 0.02,
    });

    const treeTrunk = new THREE.MeshStandardMaterial({
      color: "#261C16",
      roughness: 0.9,
      metalness: 0.05,
    });

    const foliageGreen = new THREE.MeshStandardMaterial({
      color: "#3F5220",
      roughness: 0.85,
      metalness: 0.0,
      transparent: true,
      opacity: 0.92,
    });

    const foliageGold = new THREE.MeshStandardMaterial({
      color: "#C87D32",
      roughness: 0.82,
      metalness: 0.0,
      transparent: true,
      opacity: 0.9,
    });

    const foliageAmber = new THREE.MeshStandardMaterial({
      color: "#E8A848",
      roughness: 0.8,
      metalness: 0.0,
      transparent: true,
      opacity: 0.88,
    });

    const lanternGlass = new THREE.MeshBasicMaterial({
      color: "#FFB84D",
      transparent: true,
      opacity: 0.85,
    });

    const windowGlow = new THREE.MeshBasicMaterial({
      color: "#FFB84D",
      transparent: true,
      opacity: 0.42,
    });

    const copperDome = new THREE.MeshStandardMaterial({
      color: "#4A6B5D",
      roughness: 0.65,
      metalness: 0.4,
    });

    const morningMist = new THREE.MeshBasicMaterial({
      color: "#FFF3DB",
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return {
      brick,
      limestone,
      iron,
      brassPlaque,
      lawn,
      treeTrunk,
      foliageGreen,
      foliageGold,
      foliageAmber,
      lanternGlass,
      windowGlow,
      copperDome,
      morningMist,
    };
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [materials]);

  // Tree colonnade coordinates: 4 pairs flanking the promenade
  const treeRows = [-7.0, -15.0, -23.0, -31.0];

  return (
    <group name="NanbanCollegiateQuad">
      {/* ================================================================= */}
      {/* 1. LANTERNS ATOP MAIN PILLARS & HISTORIC CHAPTER PLAQUE           */}
      {/* ================================================================= */}
      {/* Left Pillar Lantern (x = -3.85, y = 5.65, z = 0) */}
      <group position={[-3.85, 5.75, 0]} name="LeftPillarLantern">
        {/* Lantern Base / Finial Mount */}
        <mesh position={[0, -0.05, 0]} material={materials.iron} castShadow>
          <cylinderGeometry args={[0.22, 0.28, 0.15, 6]} />
        </mesh>
        {/* Amber Glowing Glass Enclosure */}
        <mesh position={[0, 0.28, 0]} material={materials.lanternGlass}>
          <cylinderGeometry args={[0.22, 0.16, 0.45, 6]} />
        </mesh>
        {/* Wrought Iron Lantern Cap / Spire */}
        <mesh position={[0, 0.58, 0]} material={materials.iron} castShadow>
          <coneGeometry args={[0.28, 0.26, 6]} />
        </mesh>
        {/* Warm Sodium Glow Light */}
        <pointLight
          position={[0, 0.28, 0]}
          color="#FFB84D"
          intensity={35}
          distance={10}
          decay={2}
        />
        {/* Additive Bloom Halo */}
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshBasicMaterial
            color="#FFB84D"
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Right Pillar Lantern (x = +3.85, y = 5.65, z = 0) */}
      <group position={[3.85, 5.75, 0]} name="RightPillarLantern">
        <mesh position={[0, -0.05, 0]} material={materials.iron} castShadow>
          <cylinderGeometry args={[0.22, 0.28, 0.15, 6]} />
        </mesh>
        <mesh position={[0, 0.28, 0]} material={materials.lanternGlass}>
          <cylinderGeometry args={[0.22, 0.16, 0.45, 6]} />
        </mesh>
        <mesh position={[0, 0.58, 0]} material={materials.iron} castShadow>
          <coneGeometry args={[0.28, 0.26, 6]} />
        </mesh>
        <pointLight
          position={[0, 0.28, 0]}
          color="#FFB84D"
          intensity={35}
          distance={10}
          decay={2}
        />
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshBasicMaterial
            color="#FFB84D"
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Left Pillar Bronze Chapter Dedication Plaque (z = +0.58m, facing approaching student) */}
      <group position={[-3.85, 2.35, 0.58]} name="ChapterDedicationPlaque">
        {/* Carved Limestone Backplate */}
        <mesh material={materials.limestone} castShadow>
          <boxGeometry args={[0.92, 0.58, 0.05]} />
        </mesh>
        {/* Cast Bronze Inset Plate */}
        <mesh position={[0, 0, 0.03]} material={materials.brassPlaque}>
          <boxGeometry args={[0.82, 0.48, 0.02]} />
        </mesh>
        {/* Embossed Raised Border Rim */}
        <mesh position={[0, 0, 0.042]} material={materials.iron}>
          <boxGeometry args={[0.84, 0.50, 0.008]} />
        </mesh>
      </group>

      {/* ================================================================= */}
      {/* 2. FLANKING COLLEGIATE PERIMETER WALLS (x = -3.85 to -18m & +3.85 to +18m) */}
      {/* ================================================================= */}
      {/* Left Perimeter Fence & Brick Piers */}
      {[-7.2, -10.6, -14.0, -17.4].map((px, i) => (
        <group key={`left-pier-${i}`} position={[px, 0, 0]}>
          {/* Brick Pier */}
          <mesh position={[0, 1.45, 0]} material={materials.brick} castShadow receiveShadow>
            <boxGeometry args={[0.8, 2.9, 0.8]} />
          </mesh>
          {/* Limestone Pier Cap */}
          <mesh position={[0, 2.95, 0]} material={materials.limestone} castShadow>
            <boxGeometry args={[0.95, 0.18, 0.95]} />
          </mesh>
          <mesh position={[0, 3.12, 0]} material={materials.limestone} castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
          </mesh>
        </group>
      ))}

      {/* Right Perimeter Fence & Brick Piers */}
      {[7.2, 10.6, 14.0, 17.4].map((px, i) => (
        <group key={`right-pier-${i}`} position={[px, 0, 0]}>
          <mesh position={[0, 1.45, 0]} material={materials.brick} castShadow receiveShadow>
            <boxGeometry args={[0.8, 2.9, 0.8]} />
          </mesh>
          <mesh position={[0, 2.95, 0]} material={materials.limestone} castShadow>
            <boxGeometry args={[0.95, 0.18, 0.95]} />
          </mesh>
          <mesh position={[0, 3.12, 0]} material={materials.limestone} castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
          </mesh>
        </group>
      ))}

      {/* Dwarf Limestone Base Walls spanning between piers */}
      {/* Left Wall Base */}
      <mesh position={[-11.0, 0.55, 0]} material={materials.limestone} castShadow receiveShadow>
        <boxGeometry args={[14.2, 1.1, 0.42]} />
      </mesh>
      {/* Right Wall Base */}
      <mesh position={[11.0, 0.55, 0]} material={materials.limestone} castShadow receiveShadow>
        <boxGeometry args={[14.2, 1.1, 0.42]} />
      </mesh>

      {/* Wrought Iron Railing Bays atop the dwarf wall */}
      {/* Left Railings */}
      <group position={[-11.0, 1.85, 0]}>
        <mesh position={[0, 0.65, 0]} material={materials.iron}>
          <boxGeometry args={[14.0, 0.05, 0.05]} />
        </mesh>
        <mesh position={[0, -0.65, 0]} material={materials.iron}>
          <boxGeometry args={[14.0, 0.05, 0.05]} />
        </mesh>
        {Array.from({ length: 42 }).map((_, j) => (
          <mesh key={j} position={[-6.8 + j * 0.33, 0, 0]} material={materials.iron}>
            <cylinderGeometry args={[0.015, 0.015, 1.35, 8]} />
          </mesh>
        ))}
      </group>

      {/* Right Railings */}
      <group position={[11.0, 1.85, 0]}>
        <mesh position={[0, 0.65, 0]} material={materials.iron}>
          <boxGeometry args={[14.0, 0.05, 0.05]} />
        </mesh>
        <mesh position={[0, -0.65, 0]} material={materials.iron}>
          <boxGeometry args={[14.0, 0.05, 0.05]} />
        </mesh>
        {Array.from({ length: 42 }).map((_, j) => (
          <mesh key={j} position={[-6.8 + j * 0.33, 0, 0]} material={materials.iron}>
            <cylinderGeometry args={[0.015, 0.015, 1.35, 8]} />
          </mesh>
        ))}
      </group>

      {/* ================================================================= */}
      {/* 3. MANICURED QUAD LAWNS BEYOND THE GATES (z = -1.5m to -45m)     */}
      {/* ================================================================= */}
      {/* Left Quad Lawn */}
      <mesh position={[-16.0, -0.04, -22.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.lawn}>
        <planeGeometry args={[24.0, 48.0]} />
      </mesh>
      {/* Right Quad Lawn */}
      <mesh position={[16.0, -0.04, -22.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials.lawn}>
        <planeGeometry args={[24.0, 48.0]} />
      </mesh>

      {/* ================================================================= */}
      {/* 4. COLONNADE OF GOLDEN-HOUR CAMPUS TREES (z = -7m to -31m)        */}
      {/* ================================================================= */}
      {treeRows.map((tz, i) => (
        <group key={`trees-${i}`}>
          {/* Left Tree */}
          <group position={[-6.2, 0, tz]}>
            {/* Dark Organic Trunk */}
            <mesh position={[0, 2.8, 0]} material={materials.treeTrunk} castShadow>
              <cylinderGeometry args={[0.22, 0.42, 5.6, 10]} />
            </mesh>
            {/* Main Arching Branch extending over promenade */}
            <mesh position={[0.7, 4.6, 0]} rotation={[0, 0, -0.55]} material={materials.treeTrunk}>
              <cylinderGeometry args={[0.14, 0.20, 2.2, 8]} />
            </mesh>
            {/* Multi-layered Backlit Autumn Foliage Clusters */}
            <mesh position={[0.4, 5.8, 0]} material={materials.foliageGreen} castShadow>
              <sphereGeometry args={[2.2, 12, 12]} />
            </mesh>
            <mesh position={[-0.8, 5.2, 0.6]} material={materials.foliageGold} castShadow>
              <sphereGeometry args={[1.8, 12, 12]} />
            </mesh>
            <mesh position={[1.2, 6.4, -0.5]} material={materials.foliageAmber} castShadow>
              <sphereGeometry args={[1.6, 12, 12]} />
            </mesh>
          </group>

          {/* Right Tree */}
          <group position={[6.2, 0, tz]}>
            <mesh position={[0, 2.8, 0]} material={materials.treeTrunk} castShadow>
              <cylinderGeometry args={[0.22, 0.42, 5.6, 10]} />
            </mesh>
            <mesh position={[-0.7, 4.6, 0]} rotation={[0, 0, 0.55]} material={materials.treeTrunk}>
              <cylinderGeometry args={[0.14, 0.20, 2.2, 8]} />
            </mesh>
            <mesh position={[-0.4, 5.8, 0]} material={materials.foliageGreen} castShadow>
              <sphereGeometry args={[2.2, 12, 12]} />
            </mesh>
            <mesh position={[0.8, 5.2, 0.6]} material={materials.foliageGold} castShadow>
              <sphereGeometry args={[1.8, 12, 12]} />
            </mesh>
            <mesh position={[-1.2, 6.4, -0.5]} material={materials.foliageAmber} castShadow>
              <sphereGeometry args={[1.6, 12, 12]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Cast-Iron Campus Avenue Lamp Posts */}
      <group position={[-3.8, 0, -13.0]} name="AvenueLampLeft">
        <mesh position={[0, 1.8, 0]} material={materials.iron}>
          <cylinderGeometry args={[0.08, 0.14, 3.6, 10]} />
        </mesh>
        <mesh position={[0, 3.65, 0]} material={materials.lanternGlass}>
          <cylinderGeometry args={[0.16, 0.12, 0.35, 6]} />
        </mesh>
        <mesh position={[0, 3.9, 0]} material={materials.iron}>
          <coneGeometry args={[0.22, 0.22, 6]} />
        </mesh>
        <pointLight position={[0, 3.65, 0]} color="#FFB84D" intensity={22} distance={8} decay={2} />
      </group>

      <group position={[3.8, 0, -23.0]} name="AvenueLampRight">
        <mesh position={[0, 1.8, 0]} material={materials.iron}>
          <cylinderGeometry args={[0.08, 0.14, 3.6, 10]} />
        </mesh>
        <mesh position={[0, 3.65, 0]} material={materials.lanternGlass}>
          <cylinderGeometry args={[0.16, 0.12, 0.35, 6]} />
        </mesh>
        <mesh position={[0, 3.9, 0]} material={materials.iron}>
          <coneGeometry args={[0.22, 0.22, 6]} />
        </mesh>
        <pointLight position={[0, 3.65, 0]} color="#FFB84D" intensity={22} distance={8} decay={2} />
      </group>

      {/* ================================================================= */}
      {/* 5. COLLEGIATE HERITAGE HALL & CLOCK-TOWER ROTUNDA (z = -38m)      */}
      {/* ================================================================= */}
      <group position={[0, 0, -38.0]} name="HeritageHallFocalAxis">
        {/* Main Building Base / Central Hall Portico */}
        <mesh position={[0, 4.0, 0]} material={materials.brick} castShadow receiveShadow>
          <boxGeometry args={[44.0, 8.0, 9.0]} />
        </mesh>

        {/* Limestone Base Foundation Skirt */}
        <mesh position={[0, 0.6, 0.1]} material={materials.limestone}>
          <boxGeometry args={[44.5, 1.2, 9.2]} />
        </mesh>

        {/* Central Entrance Portico Arch & Colonnade Columns */}
        <group position={[0, 3.5, 4.6]}>
          <mesh material={materials.limestone} castShadow>
            <boxGeometry args={[8.8, 7.0, 1.2]} />
          </mesh>
          {/* Grand Collegiate Arch cutout */}
          <mesh position={[0, -0.6, 0.1]} material={materials.windowGlow}>
            <planeGeometry args={[3.6, 4.8]} />
          </mesh>
          {/* Symmetrical Entrance Columns */}
          {[-3.2, -1.1, 1.1, 3.2].map((cx, i) => (
            <mesh key={i} position={[cx, -0.2, 0.7]} material={materials.limestone}>
              <cylinderGeometry args={[0.28, 0.34, 5.6, 12]} />
            </mesh>
          ))}
          {/* Triangular Portico Pediment */}
          <mesh position={[0, 4.2, 0]} rotation={[0, 0, Math.PI / 4]} material={materials.limestone}>
            <boxGeometry args={[4.2, 4.2, 1.4]} />
          </mesh>
        </group>

        {/* Two Rows of Arched Windows Glowing with Morning Light */}
        {[-18, -14, -10, -6, 6, 10, 14, 18].map((wx, i) => (
          <group key={`win-${i}`} position={[wx, 0, 4.52]}>
            {/* Ground floor window */}
            <mesh position={[0, 2.6, 0]} material={materials.windowGlow}>
              <planeGeometry args={[1.5, 2.4]} />
            </mesh>
            {/* Second floor arched window */}
            <mesh position={[0, 5.6, 0]} material={materials.windowGlow}>
              <planeGeometry args={[1.5, 2.2]} />
            </mesh>
            <mesh position={[0, 6.7, 0]} material={materials.limestone}>
              <cylinderGeometry args={[0.78, 0.78, 0.15, 12, 1, false, 0, Math.PI]} />
            </mesh>
          </group>
        ))}

        {/* Grand Clock Tower Rising at Center */}
        <group position={[0, 8.0, 0]}>
          {/* Lower Tower Tier */}
          <mesh position={[0, 3.0, 0]} material={materials.brick} castShadow>
            <boxGeometry args={[7.2, 6.0, 7.2]} />
          </mesh>
          <mesh position={[0, 6.1, 0]} material={materials.limestone}>
            <boxGeometry args={[7.8, 0.4, 7.8]} />
          </mesh>

          {/* Clock Dial Tier */}
          <mesh position={[0, 8.2, 0]} material={materials.brick} castShadow>
            <boxGeometry args={[6.2, 4.0, 6.2]} />
          </mesh>
          {/* Illuminated Clock Faces (Front and sides) */}
          <mesh position={[0, 8.2, 3.12]} material={materials.windowGlow}>
            <circleGeometry args={[1.2, 24]} />
          </mesh>
          <mesh position={[-3.12, 8.2, 0]} rotation={[0, -Math.PI / 2, 0]} material={materials.windowGlow}>
            <circleGeometry args={[1.2, 24]} />
          </mesh>
          <mesh position={[3.12, 8.2, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.windowGlow}>
            <circleGeometry args={[1.2, 24]} />
          </mesh>

          {/* Open Belfry Arched Colonnade */}
          <group position={[0, 11.2, 0]}>
            <mesh material={materials.limestone}>
              <boxGeometry args={[5.4, 2.4, 5.4]} />
            </mesh>
            {/* Four Arched Openings */}
            <mesh position={[0, 0, 2.72]} material={materials.windowGlow}>
              <planeGeometry args={[1.8, 2.0]} />
            </mesh>
          </group>

          {/* Indo-Saracenic / Orton Hall Copper Rotunda Dome */}
          <mesh position={[0, 13.8, 0]} material={materials.copperDome} castShadow>
            <sphereGeometry args={[2.8, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          {/* Finial Spire */}
          <mesh position={[0, 17.0, 0]} material={materials.brassPlaque}>
            <cylinderGeometry args={[0.04, 0.12, 1.6, 8]} />
          </mesh>
        </group>

        {/* Soft Golden Morning Mist Layer Wrapping Base of Building */}
        <mesh position={[0, 1.8, 5.8]}>
          <planeGeometry args={[52.0, 5.0]} />
          <meshBasicMaterial
            color="#FFF4DC"
            transparent
            opacity={0.24}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

export default NanbanQuadEnvironment;
