"use client";

import { useEffect, useMemo } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { BlastFxSystem, type BlastQuality } from "./blastFxSystem";

export interface BlastFXProps {
  /** Scroll progress 0..1, read every frame (never pass p as a per-frame prop). */
  progressRef: RefObject<number>;
  /** 0 best (q0), 1 Tier B, 2 mobile. Fixed at mount: changing it rebuilds the effect. */
  quality: BlastQuality;
}

/**
 * Missiles, contrails, fireballs, soot, dust, shockwave, debris and the blast point light.
 * Draws: volumes 1, contrails 1, puffs 1 (q0/q1), missiles 1, debris 1, shockwave 1 — only while visible.
 */
export function BlastFX({ progressRef, quality }: BlastFXProps) {
  const system = useMemo(() => new BlastFxSystem(quality), [quality]);
  useEffect(() => () => system.dispose(), [system]);

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    // State is a pure function of p; dt only guards against a clock running backwards.
    if (dt < 0) return;
    const p = progressRef.current;
    system.update(Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 0, camera);
  });

  return <primitive object={system.root} />;
}

export default BlastFX;
