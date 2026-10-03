"use client";

import React from "react";
import { Environment, Lightformer } from "@react-three/drei";
import { SUN_POS } from "./sun";

interface MorningEnvironmentProps {
  resolution?: number;
}

/**
 * Procedural Morning Environment Light (§3.3)
 * Completely offline / no network fetch.
 * Uses 4 physically mapped Lightformers to establish:
 * 1. Warm sun softbox back-right (drives rim and metallic highlights)
 * 2. Cool sky dome overhead (fills upward-facing stone and iron surfaces)
 * 3. Warm ground bounce (simulates limestone path reflection)
 * 4. Soft front fill (prevents camera-facing limestone pillars from turning dark/muddy)
 */
export function MorningEnvironment({ resolution = 256 }: MorningEnvironmentProps) {
  return (
    <Environment resolution={resolution} frames={1} background={false}>
      {/* Sun softbox, back-right */}
      <Lightformer
        form="rect"
        intensity={6}
        color="#FFF3D6"
        scale={[14, 10, 1]}
        position={SUN_POS}
        target={[0, 0, 0]}
      />
      {/* Cool sky dome overhead */}
      <Lightformer
        form="ring"
        intensity={1.4}
        color="#BFD9F2"
        scale={30}
        position={[0, 24, 0]}
        target={[0, 0, 0]}
      />
      {/* Warm ground bounce */}
      <Lightformer
        form="rect"
        intensity={0.9}
        color="#E8D9B8"
        scale={[30, 30, 1]}
        rotation-x={-Math.PI / 2}
        position={[0, -2, 0]}
      />
      {/* Soft front fill so camera-facing stone is not mud */}
      <Lightformer
        form="rect"
        intensity={1.1}
        color="#FFF8EE"
        scale={[20, 8, 1]}
        position={[0, 4, 18]}
        target={[0, 2, 0]}
      />
    </Environment>
  );
}
