// src/gl/shadows.ts
"use client";

import { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

export type ShadowUpdateMode = "static" | "onChange" | "everyN";

interface ShadowUpdateOptions {
  mode: ShadowUpdateMode;
  /** everyN: re-render shadow maps every N rendered frames. */
  n?: number;
  /** Frame priority; must run before the View renders (drei View/GradePass use the View index). */
  priority?: number;
}

/**
 * Replaces drei <BakeShadows>, which froze shadows for the whole shared renderer even
 * under moving casters. Shadow maps re-render only when asked:
 *  - static:   a few frames after mount (geometry settles), then never
 *  - onChange: call the returned `invalidate()` when a caster moves (gate swing, pillar recycle)
 *  - everyN:   every N frames (Tier B moving casters)
 * Restores shadowMap.autoUpdate on unmount.
 */
export function useShadowUpdates({ mode, n = 2, priority = 1.5 }: ShadowUpdateOptions) {
  const gl = useThree((s) => s.gl);
  const pending = useRef(3); // warm-up frames: materials/geometry may still be uploading
  const frame = useRef(0);

  useEffect(() => {
    const previous = gl.shadowMap.autoUpdate;
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    return () => {
      gl.shadowMap.autoUpdate = previous;
      gl.shadowMap.needsUpdate = true;
    };
  }, [gl]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    frame.current++;
    if (pending.current > 0) {
      pending.current--;
      gl.shadowMap.needsUpdate = true;
    } else if (mode === "everyN" && frame.current % Math.max(1, n) === 0) {
      gl.shadowMap.needsUpdate = true;
    }
  }, priority);

  return useCallback(() => {
    pending.current = Math.max(pending.current, 1);
  }, []);
}
