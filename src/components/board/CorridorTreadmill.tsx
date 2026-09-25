import { useRef, useState } from "react";
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

interface CorridorSegmentProps {
  unitIndex: number;
  nearestLampIndices: Set<number>;
}

/**
 * Procedural Dravidian / Chola Stone Architecture Unit (§1, §3).
 * Symmetrical archway span, octagonal fluted pillars, lotus capitals,
 * stone slab paving, and ceiling lintels in warm torch-lit sandstone (#6B4A32).
 */
function CholaModularSegment({
  unitIndex,
  nearestLampIndices,
}: CorridorSegmentProps) {
  const halfAisle = AISLE_WIDTH / 2;

  // Board member assigned to this segment
  const memberLeft = CURRENT_BOARD[(unitIndex * 2) % CURRENT_BOARD.length];
  const memberRight = CURRENT_BOARD[(unitIndex * 2 + 1) % CURRENT_BOARD.length];

  const lampIndexLeft = unitIndex * 2;
  const lampIndexRight = unitIndex * 2 + 1;

  const isLeftLampReal = nearestLampIndices.has(lampIndexLeft);
  const isRightLampReal = nearestLampIndices.has(lampIndexRight);

  return (
    <group>
      {/* ========================================================================= */}
      {/* 1. FLOOR & SEAMED FLAGSTONE SLABS (Sandstone #2B1D14)                     */}
      {/* ========================================================================= */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[AISLE_WIDTH + 2.4, 0.3, UNIT_LENGTH]} />
        <meshStandardMaterial
          color="#38251a"
          roughness={0.9}
          metalness={0.15}
        />
      </mesh>

      {/* Center Pathway Worn Flagstone Inlay */}
      <mesh position={[0, 0.005, 0]} receiveShadow>
        <boxGeometry args={[AISLE_WIDTH - 0.8, 0.01, UNIT_LENGTH - 0.1]} />
        <meshStandardMaterial
          color="#422c1e"
          roughness={0.82}
          metalness={0.2}
        />
      </mesh>

      {/* Flagstone Tile Cross Grooves */}
      {[-1.8, -0.6, 0.6, 1.8].map((z, i) => (
        <mesh key={i} position={[0, 0.012, z]}>
          <boxGeometry args={[AISLE_WIDTH - 0.7, 0.005, 0.03]} />
          <meshBasicMaterial color="#1a110a" />
        </mesh>
      ))}

      {/* ========================================================================= */}
      {/* 2. LEFT & RIGHT CARVED STONE PILLARS (Dravidian Mandapam Colonnade)       */}
      {/* ========================================================================= */}
      {/* LEFT PILLAR */}
      <group position={[-halfAisle, 0, 0]}>
        {/* Square Plinth Base (Upapitha) */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.6, 0.7]} />
          <meshStandardMaterial color="#4d3524" roughness={0.88} metalness={0.25} />
        </mesh>
        {/* Octagonal Fluted Shaft (Kambam) */}
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.28, 2.8, 8]} />
          <meshStandardMaterial color="#5e412c" roughness={0.85} metalness={0.2} />
        </mesh>
        {/* Carved Lotus Capital (Palagai & Kumbham) */}
        <mesh position={[0, 3.5, 0]} castShadow>
          <boxGeometry args={[0.85, 0.2, 0.85]} />
          <meshStandardMaterial color="#6b4a32" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Corbel Bracket (Bodegai) */}
        <mesh position={[0.2, 3.75, 0]} castShadow>
          <boxGeometry args={[0.45, 0.3, 0.6]} />
          <meshStandardMaterial color="#543a27" roughness={0.8} metalness={0.25} />
        </mesh>

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
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.6, 0.7]} />
          <meshStandardMaterial color="#4d3524" roughness={0.88} metalness={0.25} />
        </mesh>
        {/* Octagonal Fluted Shaft */}
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.28, 2.8, 8]} />
          <meshStandardMaterial color="#5e412c" roughness={0.85} metalness={0.2} />
        </mesh>
        {/* Carved Lotus Capital */}
        <mesh position={[0, 3.5, 0]} castShadow>
          <boxGeometry args={[0.85, 0.2, 0.85]} />
          <meshStandardMaterial color="#6b4a32" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Corbel Bracket */}
        <mesh position={[-0.2, 3.75, 0]} castShadow>
          <boxGeometry args={[0.45, 0.3, 0.6]} />
          <meshStandardMaterial color="#543a27" roughness={0.8} metalness={0.25} />
        </mesh>

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
      <mesh position={[0, PILLAR_HEIGHT - 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[AISLE_WIDTH + 0.8, 0.45, 0.7]} />
        <meshStandardMaterial color="#4a3321" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Carved Stone Vault Ceiling Slabs */}
      <mesh position={[0, PILLAR_HEIGHT + 0.3, 0]} receiveShadow>
        <boxGeometry args={[AISLE_WIDTH + 2.0, 0.3, UNIT_LENGTH]} />
        <meshStandardMaterial color="#2d1d12" roughness={0.92} metalness={0.1} />
      </mesh>

      {/* Longitudinal Archway Side Joists */}
      <mesh position={[-halfAisle, PILLAR_HEIGHT - 0.1, 0]}>
        <boxGeometry args={[0.5, 0.35, UNIT_LENGTH]} />
        <meshStandardMaterial color="#3d281a" roughness={0.88} />
      </mesh>
      <mesh position={[halfAisle, PILLAR_HEIGHT - 0.1, 0]}>
        <boxGeometry args={[0.5, 0.35, UNIT_LENGTH]} />
        <meshStandardMaterial color="#3d281a" roughness={0.88} />
      </mesh>

      {/* Outer Colonnade Openings (Distant Dusk Sky Aperture) */}
      <mesh position={[-halfAisle - 1.2, 2.0, 0]}>
        <boxGeometry args={[0.1, 3.2, UNIT_LENGTH - 0.4]} />
        <meshBasicMaterial color="#1a110a" />
      </mesh>
      <mesh position={[halfAisle + 1.2, 2.0, 0]}>
        <boxGeometry args={[0.1, 3.2, UNIT_LENGTH - 0.4]} />
        <meshBasicMaterial color="#1a110a" />
      </mesh>
    </group>
  );
}

/**
 * §3: Corridor Treadmill Manager
 * Recycles a fixed pool of modular units relative to camera Z.
 * Keeps draw calls flat and memory bounded.
 */
export function CorridorTreadmill() {
  const segmentGroupRefs = useRef<(THREE.Group | null)[]>([]);

  // Internal Z offsets for each recycled segment in the pool
  const zOffsetsRef = useRef<Float32Array>(
    new Float32Array(Array.from({ length: POOL_SIZE }, (_, i) => 30 - i * UNIT_LENGTH))
  );

  // Set of lamp indices that are currently granted real PointLights (max 2-3)
  const [nearestLampIndices, setNearestLampIndices] = useState<Set<number>>(new Set([0, 1]));
  const lastUpdatedZRef = useRef(30);

  useFrame((state) => {
    const camZ = state.camera.position.z;
    const offsets = zOffsetsRef.current;

    // Check each unit: if behind camera by more than 1 unit length, recycle to the front
    let didRecycle = false;
    for (let i = 0; i < POOL_SIZE; i++) {
      if (offsets[i] > camZ + UNIT_LENGTH * 1.2) {
        // Find minimum (furthest front) Z in current pool
        let minZ = offsets[0];
        for (let j = 1; j < POOL_SIZE; j++) {
          if (offsets[j] < minZ) minZ = offsets[j];
        }
        offsets[i] = minZ - UNIT_LENGTH;
        didRecycle = true;
      }

      const grp = segmentGroupRefs.current[i];
      if (grp) {
        grp.position.z = offsets[i];
      }
    }

    if (didRecycle) {
      useBoardHeroStore.getState().incrementRecycledCount();
    }

    // Dynamic light assignment: find the closest 2-3 lamps to camera Z
    if (Math.abs(camZ - lastUpdatedZRef.current) > 1.2) {
      lastUpdatedZRef.current = camZ;

      // Calculate distances for all lamps
      const lampDistances: { index: number; dist: number }[] = [];
      for (let i = 0; i < POOL_SIZE; i++) {
        const segZ = offsets[i];
        const dist = Math.abs(segZ - camZ);
        lampDistances.push({ index: i * 2, dist });
        lampDistances.push({ index: i * 2 + 1, dist });
      }

      lampDistances.sort((a, b) => a.dist - b.dist);

      // Pick the top 2 lamps
      const activeSet = new Set<number>([lampDistances[0].index, lampDistances[1].index]);
      setNearestLampIndices(activeSet);
      useBoardHeroStore.getState().setActiveRealLights(activeSet.size);
    }
  });

  return (
    <group>
      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            segmentGroupRefs.current[i] = el;
          }}
          position={[0, 0, 30 - i * UNIT_LENGTH]}
        >
          <CholaModularSegment
            unitIndex={i}
            nearestLampIndices={nearestLampIndices}
          />
        </group>
      ))}
    </group>
  );
}
