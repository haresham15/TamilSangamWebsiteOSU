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
  isMoving: isMovingProp,
  settleShake: settleShakeProp,
  onMovingChange,
  onSettleShake,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  fogEnabled = true,
}: BoardRootProps) {
  const groupRef = useRef<THREE.Group>(null);
  const originalFogValues = useRef(new Map<THREE.Material, boolean>());
  const appliedRef = useRef(false);

  const [internalMoving, setInternalMoving] = React.useState(false);
  const [internalShake, setInternalShake] = React.useState(0);
  const isMoving = isMovingProp ?? internalMoving;
  const settleShake = settleShakeProp ?? internalShake;

  const handleMovingChange = (moving: boolean) => {
    setInternalMoving(moving);
    onMovingChange?.(moving);
  };
  const handleSettleShake = (shake: number) => {
    setInternalShake(shake);
    onSettleShake?.(shake);
  };

  const applyFogPolicy = () => {
    if (appliedRef.current) return;
    const group = groupRef.current;
    if (!group) return;

    let meshCount = 0;
    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      meshCount++;
      const mat = object.material;
      if (!mat) return;
      if (Array.isArray(mat)) {
        for (let i = 0; i < mat.length; i++) {
          const m = mat[i] as THREE.Material & { fog: boolean };
          if (!originalFogValues.current.has(m)) {
            originalFogValues.current.set(m, m.fog);
          }
          if (m.fog !== fogEnabled) {
            m.fog = fogEnabled;
            m.needsUpdate = true;
          }
        }
      } else {
        const m = mat as THREE.Material & { fog: boolean };
        if (!originalFogValues.current.has(m)) {
          originalFogValues.current.set(m, m.fog);
        }
        if (m.fog !== fogEnabled) {
          m.fog = fogEnabled;
          m.needsUpdate = true;
        }
      }
    });

    if (meshCount > 10) {
      appliedRef.current = true;
    }
  };

  useFrame(applyFogPolicy);

  useEffect(() => {
    appliedRef.current = false;
  }, [fogEnabled]);

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
        onMovingChange={handleMovingChange}
        onSettleShake={handleSettleShake}
      />
    </group>
  );
}

export default BoardRoot;
