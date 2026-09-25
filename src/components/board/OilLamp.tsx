"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { noise1D } from "./noise";

interface OilLampProps {
  position: [number, number, number];
  phaseOffset?: number;
  isRealLight?: boolean;
}

/**
 * Traditional Chola Kuthuvilakku Stone/Brass Wall Sconce Lamp (§2, §5).
 * - Flame core sits on bloom layer (layers.set(1) / layers.enable(1)) as designated bloom source.
 * - Noise-driven organic flicker with per-instance phase offset (never synchronized).
 * - Real PointLight is only active when `isRealLight` is true (capped at 2-3 scene-wide).
 */
export function OilLamp({
  position,
  phaseOffset = 0,
  isRealLight = false,
}: OilLampProps) {
  const flameMeshRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const lightTargetRef = useRef<{ baseIntensity: number }>({ baseIntensity: 2.4 });

  useEffect(() => {
    if (flameMeshRef.current) {
      // Confine bloom to flame mesh only (§5, §8)
      flameMeshRef.current.layers.enable(1);
    }
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    // Smooth noise-driven flicker with per-lamp phase offset
    const n = noise1D(time * 4.2 + phaseOffset * 17.3);
    const flicker = 0.85 + 0.35 * n; // [0.5, 1.2]

    // 1. Update flame billboard emissive intensity
    if (flameMeshRef.current && flameMeshRef.current.material) {
      const mat = flameMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = flicker * 2.8;
      // Subtle organic micro-scale wobble
      const wobble = 1.0 + 0.08 * noise1D(time * 6.0 + phaseOffset);
      flameMeshRef.current.scale.set(wobble, wobble * 1.15, wobble);
    }

    // 2. Update real PointLight intensity if active
    if (isRealLight && pointLightRef.current) {
      pointLightRef.current.intensity = flicker * lightTargetRef.current.baseIntensity;
    }
  });

  return (
    <group position={position}>
      {/* ========================================================================= */}
      {/* 1. CARVED WALL BRACKET & BRASS OIL DISH (Dravidian Kuthuvilakku Sconce)   */}
      {/* ========================================================================= */}
      {/* Wall Mounting Plate */}
      <mesh position={[0, 0, -0.22]}>
        <boxGeometry args={[0.24, 0.45, 0.08]} />
        <meshStandardMaterial color="#2d1e15" roughness={0.85} metalness={0.6} />
      </mesh>

      {/* Ornate Curved Cast-Bronze Arm */}
      <mesh position={[0, -0.08, -0.1]}>
        <cylinderGeometry args={[0.035, 0.045, 0.28, 8]} />
        <meshStandardMaterial color="#4a331f" roughness={0.7} metalness={0.75} />
      </mesh>

      {/* Multi-Tiered Oil Vessel (Agal / Kuthuvilakku Base) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.09, 0.12, 16]} />
        <meshStandardMaterial color="#5c3f25" roughness={0.6} metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.06, 16]} />
        <meshStandardMaterial color="#3b2614" roughness={0.7} metalness={0.85} />
      </mesh>

      {/* Dark Pool of Sesame / Ghee Oil inside Dish */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 16]} />
        <meshStandardMaterial color="#1f140a" roughness={0.15} metalness={0.4} />
      </mesh>

      {/* Cotton Wick Spindle */}
      <mesh position={[0, 0.08, 0.04]}>
        <cylinderGeometry args={[0.015, 0.015, 0.06, 8]} />
        <meshStandardMaterial color="#1a1208" roughness={0.9} />
      </mesh>

      {/* ========================================================================= */}
      {/* 2. TEARDROP FLAME MESH (Selective Bloom Layer Source)                      */}
      {/* ========================================================================= */}
      <mesh ref={flameMeshRef} position={[0, 0.18, 0.04]}>
        <coneGeometry args={[0.07, 0.24, 16]} />
        <meshStandardMaterial
          color="#FFD37A"
          emissive="#FF9A3C"
          emissiveIntensity={2.5}
          roughness={0.1}
          toneMapped={false}
        />
      </mesh>

      {/* Subtle Inner Glow Core */}
      <mesh position={[0, 0.14, 0.04]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color="#FFF5DB" toneMapped={false} />
      </mesh>

      {/* ========================================================================= */}
      {/* 3. CONDITIONAL REAL POINTLIGHT (Max 2-3 Active Scene-Wide per §5)          */}
      {/* ========================================================================= */}
      {isRealLight && (
        <pointLight
          ref={pointLightRef}
          position={[0, 0.25, 0.15]}
          color="#FF9A3C"
          intensity={2.4}
          distance={9.0}
          decay={2.0}
          castShadow
          shadow-bias={-0.001}
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
        />
      )}
    </group>
  );
}
