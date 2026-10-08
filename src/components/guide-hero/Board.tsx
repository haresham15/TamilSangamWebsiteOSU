"use client";

import React, { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GuideEnvironment } from "./board/environment";
import { BoardRoot } from "./BoardRoot";

import { scroll } from "@/engine/masterTick";

export interface BoardProps {
  boardWidth?: number;
  boardHeight?: number;
  cols?: number;
  rows?: number;
  isMoving?: boolean;
  settleShake?: number;
  keyLightIntensity?: number;
  recedeScale?: number;
  recedeTilt?: number;
}

/**
 * CameraFitter (PRD §3.3)
 * Dynamically computes distance d from the board's bounding box and the container's aspect:
 * d = max(boardH/2 / tan(vFov/2), boardW/2 / (tan(vFov/2) * aspect)) * 1.08
 */
function CameraFitter({
  boardWidth = 21.0,
  boardHeight = 5.2,
}: {
  boardWidth: number;
  boardHeight: number;
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!("fov" in camera)) return;
    const persCam = camera as THREE.PerspectiveCamera;

    const aspect = size.width / Math.max(1, size.height);
    const vFovRad = (persCam.fov * Math.PI) / 180;

    // Chassis bounds with margins
    const totalW = boardWidth + 1.8;
    const totalH = boardHeight + 2.4;

    const distH = totalH / 2 / Math.tan(vFovRad / 2);
    const distW = totalW / 2 / (Math.tan(vFovRad / 2) * aspect);
    const d = Math.max(distH, distW) * 1.08;

    persCam.position.set(0, 0.4, d);
    persCam.lookAt(0, 0.4, 0);
    persCam.updateProjectionMatrix();
  }, [camera, size.width, size.height, boardWidth, boardHeight]);

  return null;
}

/**
 * R3F Departure Board Scene Composition (PRD §3, §4)
 */
export default function Board({
  boardWidth = 21.0,
  boardHeight = 5.2,
  cols = 30,
  rows = 5,
  isMoving = false,
  settleShake = 0,
  keyLightIntensity = 2.0,
  recedeScale: _recedeScale = 1.0,
  recedeTilt: _recedeTilt = 0,
}: BoardProps) {
  const [movingState, setMovingState] = useState(isMoving);
  const [shakeState, setShakeState] = useState(settleShake);
  const sceneGroupRef = useRef<THREE.Group>(null);

  // Smooth scroll recede interpolation driven by masterTick scroll (PRD §8)
  useFrame(() => {
    if (sceneGroupRef.current && typeof window !== "undefined") {
      const p = Math.max(0, Math.min(1, scroll.y / (window.innerHeight * 0.7)));
      const t = p < 0.15 ? 0 : Math.min(1, (p - 0.15) / 0.45);
      const computedScale = 1.0 - 0.1 * t;
      const computedTilt = -0.1047 * t; // -6 degrees in radians
      sceneGroupRef.current.scale.setScalar(computedScale);
      sceneGroupRef.current.rotation.x = computedTilt;
    }
  });

  return (
    <>
      {/* 1. Procedural Overcast Station Environment & Cool Key Light */}
      <GuideEnvironment keyLightIntensity={keyLightIntensity} />

      {/* 2. Responsive Camera Auto-Fitter */}
      <CameraFitter boardWidth={boardWidth} boardHeight={boardHeight} />

      {/* 3. Station Board Scene Group (Subject to Scroll Recede) */}
      <group ref={sceneGroupRef} position={[0, 0, 0]}>
        <BoardRoot
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          cols={cols}
          rows={rows}
          isMoving={movingState}
          settleShake={shakeState}
          onMovingChange={setMovingState}
          onSettleShake={setShakeState}
          fogEnabled
        />
      </group>
    </>
  );
}
