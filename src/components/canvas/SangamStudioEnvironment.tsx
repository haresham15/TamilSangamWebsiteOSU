"use client";

import React from "react";
import { Environment, Lightformer } from "@react-three/drei";

export function SangamStudioEnvironment() {
  return (
    <Environment frames={1} resolution={256}>
      {/* Warm Ivory Key Strip (-X) */}
      <Lightformer
        form="rect"
        intensity={3.5}
        color="#FFF8EB"
        scale={[8, 5, 1]}
        position={[-5, 3, 5]}
        target={[0, 0, 0]}
      />
      {/* High-Contrast Terracotta/Gold Rim Strip (+X, Crucial for right-edge definition on 'அ' and rings) */}
      <Lightformer
        form="rect"
        intensity={4.8}
        color="#C85A32"
        scale={[6, 8, 1]}
        position={[6, 2, -2]}
        target={[0, 0, 0]}
      />
      {/* Antique Brass Overhead Fill (+Y) */}
      <Lightformer
        form="ring"
        intensity={2.4}
        color="#D4AF37"
        scale={10}
        position={[0, 8, 0]}
        target={[0, 0, 0]}
      />
      {/* Warm Espresso Floor Bounce (-Y) */}
      <Lightformer
        form="rect"
        intensity={1.4}
        color="#3A2618"
        scale={[12, 4, 1]}
        position={[0, -6, 2]}
        target={[0, 0, 0]}
      />
    </Environment>
  );
}
