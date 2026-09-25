"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface SunDiscProps {
  scrollProgress?: number;
  bloomBoost?: number;
}

/**
 * §6: Sun Disc & Lighting (Corrected)
 * - Separate scene illumination from bloom sources.
 * - PointLight: modest, tuned against ACES exposure (color: #FF7A3C, intensity: 4, decay: 2).
 * - Visual Sun Disc: circle mesh on bloom layer (layers.enable(1)) with #FFE0A8.
 * - Anamorphic Streak: horizontally-stretched additive plane on bloom layer (layers.enable(1))
 *   scale [14, 0.15, 1], producing distinct anamorphic flare streaks, not just a round blob.
 */
export function SunDisc({ scrollProgress = 0, bloomBoost = 1.0 }: SunDiscProps) {
  const sunDiscRef = useRef<THREE.Mesh>(null);
  const streakRef = useRef<THREE.Mesh>(null);
  const secondaryStreakRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const p = scrollProgress;

    // Subtle atmospheric shimmer / breathing on flare opacity
    const shimmer = 0.5 + Math.sin(t * 1.5) * 0.05;

    // Finale buildup: at p > 0.85, flare expands and brightens (§11)
    let finaleMult = bloomBoost;
    if (p > 0.85) {
      const finaleProgress = (p - 0.85) / 0.15;
      finaleMult *= 1.0 + finaleProgress * 2.5;
    }

    if (streakRef.current) {
      const mat = streakRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1.0, shimmer * 0.6 * finaleMult);
      streakRef.current.scale.x = 14 * (1.0 + (finaleMult - 1.0) * 0.5);
    }

    if (secondaryStreakRef.current) {
      const mat = secondaryStreakRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(0.6, shimmer * 0.3 * finaleMult);
    }

    if (pointLightRef.current) {
      pointLightRef.current.intensity = 4.0 * (1.0 + (finaleMult - 1.0) * 0.4);
    }
  });

  return (
    <group position={[0, 2, -10]}>
      {/* 1. Scene Illumination PointLight (Modest, ACES-tuned, NOT directly blooming) */}
      <pointLight
        ref={pointLightRef}
        color="#FF7A3C"
        intensity={4}
        decay={2}
        distance={40}
      />

      {/* 2. Visual Sun Disc (Bloom source on layer 1) */}
      <mesh
        ref={sunDiscRef}
        position={[0, 0, 0]}
        onUpdate={(self) => self.layers.enable(1)}
      >
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial
          color="#FFE0A8"
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Primary Anamorphic Lens Flare Streak (Horizontally stretched, bloom layer) */}
      <mesh
        ref={streakRef}
        position={[0, 0, 0.02]}
        scale={[14, 0.15, 1]}
        onUpdate={(self) => self.layers.enable(1)}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#FFE0A8"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Secondary Soft Flare Wing (Slightly taller, lower opacity) */}
      <mesh
        ref={secondaryStreakRef}
        position={[0, 0, 0.03]}
        scale={[22, 0.45, 1]}
        onUpdate={(self) => self.layers.enable(1)}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#FF9D5C"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* 5. Warm Sunset Corona Halo */}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[2.8, 32]} />
        <meshBasicMaterial
          color="#C4511F"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
