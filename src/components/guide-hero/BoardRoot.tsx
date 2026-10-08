"use client";

import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GuideChassis } from "./board/chassis";
import { FlapCells } from "./board/cells";

export interface BoardRootProps {
  boardWidth?: number;
  boardHeight?: number;
  cols?: number;
  rows?: number;
  isMoving?: boolean;
  settleShake?: number;
  onMovingChange?: (moving: boolean) => void;
  onSettleShake?: (shake: number) => void;
  position?: THREE.Vector3Tuple;
  scale?: number | THREE.Vector3Tuple;
  /** Keeps the preserved engine mounted while its station reveal is held. */
  visible?: boolean;
  /** The station scene keeps the board crisp against its atmospheric fog. */
  fogEnabled?: boolean;
}

/**
 * The only adaptable seam around the protected split-flap engine.
 *
 * The chassis, atlas, cell geometry, cell material, FSM, audio, and store
 * remain composed exactly as before. Station scenes may only place this root
 * and set its fog policy.
 */
export function BoardRoot({
  boardWidth = 21,
  boardHeight = 5.2,
  cols = 30,
  rows = 5,
  isMoving = false,
  settleShake = 0,
  onMovingChange,
  onSettleShake,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  fogEnabled = true,
}: BoardRootProps) {
  const groupRef = useRef<THREE.Group>(null);
  const originalFogValues = useRef(new Map<THREE.Material, boolean>());

  const applyFogPolicy = () => {
    const group = groupRef.current;
    if (!group) return;

    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        const fogMaterial = material as THREE.Material & { fog: boolean };
        if (!originalFogValues.current.has(material)) {
          originalFogValues.current.set(material, fogMaterial.fog);
        }
        if (fogMaterial.fog !== fogEnabled) {
          fogMaterial.fog = fogEnabled;
          material.needsUpdate = true;
        }
      }
    });
  };

  // Flap materials are created after the atlas resolves, so the policy is
  // applied through the shared render clock until every material is observed.
  useFrame(applyFogPolicy);

  useEffect(() => {
    const fogValues = originalFogValues.current;
    return () => {
      for (const [material, originalFog] of fogValues) {
        (material as THREE.Material & { fog: boolean }).fog = originalFog;
        material.needsUpdate = true;
      }
      fogValues.clear();
    };
  }, []);

  return (
    <group ref={groupRef} name="BoardRoot" position={position} scale={scale} visible={visible}>
      <GuideChassis
        boardWidth={boardWidth}
        boardHeight={boardHeight}
        isMoving={isMoving}
        settleShake={settleShake}
      />
      <FlapCells
        cols={cols}
        rows={rows}
        onMovingChange={onMovingChange}
        onSettleShake={onSettleShake}
      />
    </group>
  );
}

export default BoardRoot;
