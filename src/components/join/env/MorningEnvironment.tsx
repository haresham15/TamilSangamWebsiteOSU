"use client";

import React from "react";
import { Lightformer } from "@react-three/drei";
import { BakedEnvironment } from "@/gl/BakedEnvironment";
import { SUN_POS } from "./sun";

interface MorningEnvironmentProps {
  resolution?: number;
  /** "art": dimmer sky/bounce/front fill so the sun key has contrast (art pass). */
  variant?: "legacy" | "art";
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
export function MorningEnvironment({ resolution = 256, variant = "legacy" }: MorningEnvironmentProps) {
  const art = variant === "art";
  return (
    <BakedEnvironment resolution={resolution}>
      {/* Sun softbox, back-right */}
      <Lightformer
        form="rect"
        intensity={art ? 5 : 6}
        color={art ? "#ffd69a" : "#FFF3D6"}
        scale={[14, 10, 1]}
        position={SUN_POS}
        target={[0, 0, 0]}
      />
      {/* Cool sky dome overhead */}
      <Lightformer
        form="ring"
        intensity={art ? 0.55 : 1.4}
        color={art ? "#c4bce3" : "#BFD9F2"}
        scale={30}
        position={[0, 24, 0]}
        target={[0, 0, 0]}
      />
      {/* Warm ground bounce */}
      <Lightformer
        form="rect"
        intensity={art ? 0.3 : 0.9}
        color={art ? "#e8c890" : "#E8D9B8"}
        scale={[30, 30, 1]}
        rotation-x={-Math.PI / 2}
        position={[0, -2, 0]}
      />
      {/* Soft front fill so camera-facing stone is not mud */}
      <Lightformer
        form="rect"
        intensity={art ? 0.22 : 1.1}
        color="#FFF8EE"
        scale={[20, 8, 1]}
        position={[0, 4, 18]}
        target={[0, 2, 0]}
      />
    </BakedEnvironment>
  );
}
