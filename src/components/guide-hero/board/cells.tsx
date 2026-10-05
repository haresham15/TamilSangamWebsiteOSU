"use client";

import React, { useMemo, useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { makeAtlas, charToGlyph } from "./atlas";
import { createCellGeometry } from "./cellGeometry";
import { createCellMaterial } from "./cellMaterial";
import { createCellState, tick, CellState, FsmConfig } from "./fsm";
import { layoutBoard } from "./layout";
import { useGuideStore } from "../store/guideStore";
import { governor } from "@/engine/governor";

export const MAX_CELLS = 150; // Desktop: 30 cols x 5 rows

declare global {
  interface Window {
    __guideBoard?: {
      setText: (text: string, options?: { instant?: boolean }) => void;
      retarget: (chars: string[], options?: { instant?: boolean }) => void;
      getState: () => { isMoving: boolean; chars: string[] };
    };
  }
}

interface CellsProps {
  cols?: number; // 30 (desktop), 24 (tablet), 14 (phone)
  rows?: number; // 5 (desktop), 6 (tablet), 9 (phone)
  showAtlasDebug?: boolean;
  onMovingChange?: (moving: boolean) => void;
  onSettleShake?: (shake: number) => void;
}


/**
 * Phase 3 Instanced Flap Cells with Full Kinematics & Audio (PRD §4, §5)
 * 1 InstancedMesh, 1 draw call, per-cell FSM driving vertex hinge rotations.
 */
export function FlapCells({
  cols = 30,
  rows = 5,
  onMovingChange,
  onSettleShake,
}: CellsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [atlas, setAtlas] = useState<THREE.CanvasTexture | null>(null);
  const { invalidate } = useThree();

  // 1. Instanced Attributes buffers (Allocated for 150 instances, PRD §4.3)
  const { aCurArray, aNxtArray, aAngleArray, aSeedArray } = useMemo(() => {
    const cur = new Float32Array(MAX_CELLS);
    const nxt = new Float32Array(MAX_CELLS);
    const ang = new Float32Array(MAX_CELLS);
    const seed = new Float32Array(MAX_CELLS);

    for (let i = 0; i < MAX_CELLS; i++) {
      cur[i] = 0;
      nxt[i] = 0;
      ang[i] = 0.0;
      seed[i] = ((i * 9301 + 49297) % 233280) / 233280;
    }
    return {
      aCurArray: cur,
      aNxtArray: nxt,
      aAngleArray: ang,
      aSeedArray: seed,
    };
  }, []);

  // 2. Single merged cell geometry with attached instanced attributes
  const { geometry, aCurAttr, aNxtAttr, aAngleAttr, aSeedAttr } = useMemo(() => {
    const geom = createCellGeometry();
    const curAttr = new THREE.InstancedBufferAttribute(aCurArray, 1);
    const nxtAttr = new THREE.InstancedBufferAttribute(aNxtArray, 1);
    const angleAttr = new THREE.InstancedBufferAttribute(aAngleArray, 1);
    const seedAttr = new THREE.InstancedBufferAttribute(aSeedArray, 1);

    curAttr.setUsage(THREE.DynamicDrawUsage);
    nxtAttr.setUsage(THREE.DynamicDrawUsage);
    angleAttr.setUsage(THREE.DynamicDrawUsage);
    seedAttr.setUsage(THREE.DynamicDrawUsage);

    geom.setAttribute("aCur", curAttr);
    geom.setAttribute("aNxt", nxtAttr);
    geom.setAttribute("aAngle", angleAttr);
    geom.setAttribute("aSeed", seedAttr);

    return {
      geometry: geom,
      aCurAttr: curAttr,
      aNxtAttr: nxtAttr,
      aAngleAttr: angleAttr,
      aSeedAttr: seedAttr,
    };
  }, [aCurArray, aNxtArray, aAngleArray, aSeedArray]);

  // 3. Load Texture Atlas on mount
  useEffect(() => {
    let active = true;
    makeAtlas().then((tex) => {
      if (active) {
        setAtlas(tex);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // 4. Patched Material
  const material = useMemo(() => {
    if (!atlas) {
      return new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.6,
      });
    }
    return createCellMaterial(atlas);
  }, [atlas]);

  // 5. Kinematics State Machine Ref (PRD §5.1)
  const fsmStateRef = useRef<CellState>(createCellState(MAX_CELLS, cols, rows));
  const targetArrayRef = useRef<Uint8Array>(new Uint8Array(MAX_CELLS));
  const isMovingRef = useRef<boolean>(false);
  const shakeValRef = useRef<number>(0);
  const currentCharsRef = useRef<string[]>(new Array(MAX_CELLS).fill(" "));

  // Reduced motion preference
  const isReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // 6. Retargeting Helper
  const setBoardTarget = useCallback(
    (chars: string[], instant = false) => {
      currentCharsRef.current = chars;
      const count = cols * rows;
      const fsm = fsmStateRef.current;
      const targetArr = targetArrayRef.current;

      for (let i = 0; i < count; i++) {
        const glyphIdx = charToGlyph(chars[i] || " ");
        targetArr[i] = glyphIdx;
        if (instant || isReducedMotion) {
          fsm.cur[i] = glyphIdx;
          fsm.nxt[i] = glyphIdx;
          fsm.angle[i] = 0;
          fsm.phase[i] = 0;
          fsm.armedAt[i] = 0;
          aCurArray[i] = glyphIdx;
          aNxtArray[i] = glyphIdx;
          aAngleArray[i] = 0;
        }
      }

      if (instant || isReducedMotion) {
        aCurAttr.needsUpdate = true;
        aNxtAttr.needsUpdate = true;
        aAngleAttr.needsUpdate = true;
        isMovingRef.current = false;
        onMovingChange?.(false);
      } else {
        isMovingRef.current = true;
        onMovingChange?.(true);
        governor.request("guide-board", 2);
      }
      invalidate();
    },
    [cols, rows, isReducedMotion, aCurArray, aNxtArray, aAngleArray, aCurAttr, aNxtAttr, aAngleAttr, onMovingChange, invalidate]
  );

  // 7. Expose window.__guideBoard for Playwright / debugging (PRD §10)
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.__guideBoard = {
      setText: (text: string, options) => {
        const clean = text.toUpperCase().replace(/[^ A-Z0-9.,?!'\-&/:+()$]/g, " ");
        const chars = new Array(cols * rows).fill(" ");
        for (let i = 0; i < Math.min(chars.length, clean.length); i++) {
          chars[i] = clean[i];
        }
        setBoardTarget(chars, options?.instant ?? false);
      },
      retarget: (chars: string[], options) => {
        setBoardTarget(chars, options?.instant ?? false);
      },
      getState: () => ({
        isMoving: isMovingRef.current,
        chars: currentCharsRef.current,
      }),
    };

    return () => {
      delete window.__guideBoard;
    };
  }, [cols, rows, setBoardTarget]);

  // 8. Grid Positioning & Initial Population
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const count = cols * rows;
    mesh.count = count;

    // Synchronize FSM geometry metadata
    fsmStateRef.current.count = count;
    fsmStateRef.current.cols = cols;
    fsmStateRef.current.rows = rows;

    const pitchX = 0.70;
    const pitchY = 1.04;
    const totalW = cols * pitchX;
    const totalH = rows * pitchY;

    const dummy = new THREE.Object3D();
    const activeItem = useGuideStore.getState().activeItem;
    const initialChars = layoutBoard(activeItem, cols, rows);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const x = -totalW / 2 + (c + 0.5) * pitchX;
        const y = totalH / 2 - (r + 0.5) * pitchY;

        dummy.position.set(x, y, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    aSeedAttr.needsUpdate = true;

    // Set initial target chars
    setBoardTarget(initialChars, true);
  }, [
    cols,
    rows,
    atlas,
    material,
    setBoardTarget,
    aSeedAttr,
  ]);

  // 8b. Subscribe to guideStore for bidirectional bridge (PRD §7)
  useEffect(() => {
    let lastSeq = useGuideStore.getState().seq;

    const unsub = useGuideStore.subscribe((state) => {
      if (state.seq !== lastSeq) {
        lastSeq = state.seq;
        const chars = layoutBoard(state.activeItem, cols, rows);
        setBoardTarget(chars, false);
      }
    });

    return unsub;
  }, [cols, rows, setBoardTarget]);

  // 9. Frame Kinematics Loop (PRD §5.1, §5.2, §5.3)
  useFrame(() => {
    const fsm = fsmStateRef.current;
    const targetArr = targetArrayRef.current;
    const now = performance.now();

    const cfg: FsmConfig = {
      reducedMotion: isReducedMotion,
    };

    const moving = tick(fsm, now, targetArr, cfg);

    if (moving || isMovingRef.current) {
      let anyCellMoving = false;
      const count = cols * rows;

      for (let i = 0; i < count; i++) {
        aCurArray[i] = fsm.cur[i];
        aNxtArray[i] = fsm.nxt[i];
        aAngleArray[i] = fsm.angle[i];

        if (fsm.phase[i] === 1) {
          anyCellMoving = true;
        }
      }

      aCurAttr.needsUpdate = true;
      aNxtAttr.needsUpdate = true;
      aAngleAttr.needsUpdate = true;

      // Detect transition from moving to settled
      if (isMovingRef.current && !anyCellMoving) {
        isMovingRef.current = false;
        onMovingChange?.(false);
        // Settle shake impulse: 0.012 su decaying over 120ms (PRD §5.3)
        if (!isReducedMotion) {
          shakeValRef.current = 0.012;
        } else {
          governor.request("guide-board", 1);
        }
      } else if (!isMovingRef.current && anyCellMoving) {
        isMovingRef.current = true;
        onMovingChange?.(true);
        governor.request("guide-board", 2);
      }

      invalidate();
    }

    // Process Settle Shake Decay (PRD §5.3)
    if (shakeValRef.current > 0.0002) {
      shakeValRef.current *= 0.82; // exponential 120ms decay
      onSettleShake?.(shakeValRef.current);
      governor.request("guide-board", 2);
      invalidate();
    } else if (shakeValRef.current !== 0) {
      shakeValRef.current = 0;
      onSettleShake?.(0);
      governor.request("guide-board", 1);
      invalidate();
    }
  });

  // 10. Clean disposal on unmount only
  useEffect(() => {
    return () => {
      governor.request("guide-board", 0);
      geometry.dispose();
      material.dispose();
      atlas?.dispose();
    };
  }, [geometry, material, atlas]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_CELLS]}
      receiveShadow
    />
  );
}
export default FlapCells;
