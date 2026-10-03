"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface SunDiscProps {
  scrollProgress?: number;
  bloomBoost?: number;
}

/**
 * §6: Sun Disc & Lighting (Corrected & Memory Managed)
 * - Separate scene illumination from bloom sources.
 * - PointLight: modest, tuned against ACES exposure (color: #FF7A3C, intensity: 4, decay: 2).
 * - Visual Sun Disc: circle mesh on bloom layer (layers.enable(1)) with #FFE0A8.
 * - Anamorphic Streak: horizontally-stretched additive plane on bloom layer (layers.enable(1))
 *   scale [14, 0.15, 1], producing distinct anamorphic flare streaks, not just a round blob.
 * - Complete unmount lifecycle disposal for all geometries and materials.
 */
export function SunDisc({ scrollProgress = 0, bloomBoost = 1.0 }: SunDiscProps) {
  const streakRef = useRef<THREE.Mesh>(null);
  const secondaryStreakRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  // Memoized shared geometries and materials
  const sunGeo = useMemo(() => new THREE.CircleGeometry(1.2, 32), []);
  const sunMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#FFE0A8",
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  const streakGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const streakMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#FFE0A8",
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        depthWrite: false,
      }),
    []
  );

  const secondaryStreakMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#FF9D5C",
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        depthWrite: false,
      }),
    []
  );

  const haloGeo = useMemo(() => new THREE.CircleGeometry(2.8, 32), []);
  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#C4511F",
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        depthWrite: false,
      }),
    []
  );

  // Complete unmount lifecycle disposal
  useEffect(() => {
    return () => {
      sunGeo.dispose();
      sunMat.dispose();
      streakGeo.dispose();
      streakMat.dispose();
      secondaryStreakMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
    };
  }, [sunGeo, sunMat, streakGeo, streakMat, secondaryStreakMat, haloGeo, haloMat]);

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
      (streakRef.current.material as THREE.Material).opacity = Math.min(1.0, shimmer * 0.6 * finaleMult);
      streakRef.current.scale.x = 14 * (1.0 + (finaleMult - 1.0) * 0.5);
    }

    if (secondaryStreakRef.current) {
      (secondaryStreakRef.current.material as THREE.Material).opacity = Math.min(0.6, shimmer * 0.3 * finaleMult);
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
        geometry={sunGeo}
        material={sunMat}
        position={[0, 0, 0]}
        onUpdate={(self) => self.layers.enable(1)}
      />

      {/* 3. Primary Anamorphic Lens Flare Streak (Horizontally stretched, bloom layer) */}
      <mesh
        ref={streakRef}
        geometry={streakGeo}
        material={streakMat}
        position={[0, 0, 0.02]}
        scale={[14, 0.15, 1]}
        onUpdate={(self) => self.layers.enable(1)}
      />

      {/* 4. Secondary Soft Flare Wing (Slightly taller, lower opacity) */}
      <mesh
        ref={secondaryStreakRef}
        geometry={streakGeo}
        material={secondaryStreakMat}
        position={[0, 0, 0.03]}
        scale={[22, 0.45, 1]}
        onUpdate={(self) => self.layers.enable(1)}
      />

      {/* 5. Warm Sunset Corona Halo */}
      <mesh
        geometry={haloGeo}
        material={haloMat}
        position={[0, 0, -0.01]}
      />
    </group>
  );
}
