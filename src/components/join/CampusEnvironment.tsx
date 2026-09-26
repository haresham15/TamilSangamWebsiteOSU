"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { Environment } from "@react-three/drei";

/**
 * CampusEnvironment (Phase 2):
 * Establishes physically based global illumination before adding gate geometry:
 * 1. Tone mapping: ACESFilmicToneMapping (configured on Canvas gl)
 * 2. HDRI Reflections: @react-three/drei <Environment preset="dawn" background={false} />
 * 3. Golden Hour Sun: Directional light (#FFF8E7, intensity 2.5) with 2048x2048 PCF soft shadows
 * 4. Volumetric Atmosphere: FogExp2 (#1A1311, 0.025) for cinematic depth-of-field
 * 5. Ground Receiver: PBR ground plane to catch soft shadows and ground the scene
 */
export function CampusEnvironment() {
  const sunLightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      {/* Volumetric Morning Atmosphere */}
      <fogExp2 attach="fog" args={["#1A1311", 0.025]} />
      <color attach="background" args={["#050201"]} />

      {/* Photorealistic Dawn HDRI environment for physical metallic reflections */}
      <Environment preset="dawn" background={false} />

      {/* The Golden Hour Sun */}
      <directionalLight
        ref={sunLightRef}
        color="#FFF8E7"
        intensity={2.5}
        position={[10, 15, 10]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-bias={-0.0001}
      />

      {/* Secondary fill light to soften dark shadows */}
      <directionalLight
        color="#ffaa66"
        intensity={0.4}
        position={[-8, 6, -8]}
      />

      {/* Calibration ground receiver for physically grounded shadows */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color="#0f0907"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </>
  );
}
