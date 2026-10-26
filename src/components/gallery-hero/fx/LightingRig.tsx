"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { heroState } from "../state";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";

/**
 * LightingRig: Rathnavelu 35mm Golden-Hour Cinematic Lighting
 * 
 * - Golden-Hour Directional Key Light at [-2.5, 4.0, 3.5] with soft contact shadows
 * - Soft Twilight Sky & Warm Earth Bounce Hemisphere Light
 * - Subtle Anamorphic Rim / Halo Light highlighting the bronze string edges
 * - Guaranteed ZERO muddy grey fog washout and ZERO flat maroon background stomping
 */

export function LightingRig() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const targetReverie = heroState.easterEggActive ? 1.0 : 0.0;

    if (keyLightRef.current) {
      // Warm golden key light with subtle Easter Egg swell
      const baseIntensity = 3.4;
      const targetInt = baseIntensity + targetReverie * 1.2;
      keyLightRef.current.intensity = THREE.MathUtils.damp(
        keyLightRef.current.intensity,
        targetInt,
        4.0,
        dt
      );
    }

    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = THREE.MathUtils.damp(
        hemiLightRef.current.intensity,
        0.75 + targetReverie * 0.25,
        4.0,
        dt
      );
    }

    // Keep scene fog very gentle so it never causes grey washout
    if (state.scene.fog && state.scene.fog instanceof THREE.FogExp2) {
      state.scene.fog.density = 0.0018;
      state.scene.fog.color.set("#0B0E1A");
    }
  });

  const isCinematic = isHeroCinematicEnabled("gallery");

  return (
    <group name="cinematic-lighting-rig">
      {/* 1. Golden-Hour Directional Key Light */}
      <directionalLight
        ref={keyLightRef}
        position={[-2.5, 4.0, 3.5]}
        color="#FFA84D"
        intensity={3.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0001}
        shadow-normalBias={isCinematic ? 0.02 : 0}
      />

      {/* 2. Soft Twilight Sky / Warm Ground Bounce Hemisphere Light */}
      <hemisphereLight
        ref={hemiLightRef}
        color="#FFE0B2"
        groundColor="#1A0D08"
        intensity={0.75}
      />

      {/* 3. Subtle Anamorphic Rim / Halo Light */}
      <directionalLight
        ref={rimLightRef}
        position={[3.0, 2.0, -12.0]}
        color="#FFD180"
        intensity={0.85}
      />

      {/* 4. Cinematic Soundhole Chamber Glow & Coastal Twilight Fill */}
      {isCinematic && (
        <>
          <pointLight
            position={[0, -0.2, -2.4]}
            color="#FF9933"
            intensity={1.8}
            distance={3.8}
            decay={2}
          />
          <directionalLight
            position={[-3.0, -1.5, 0.0]}
            color="#1E122A"
            intensity={0.4}
          />
        </>
      )}
    </group>
  );
}

export default LightingRig;
