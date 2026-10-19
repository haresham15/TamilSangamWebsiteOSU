"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function MinimalPlatform() {
  const turntableRef = useRef<THREE.Group>(null);
  const ringGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (turntableRef.current) {
      turntableRef.current.rotation.y += dt * 0.12;
    }
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y -= dt * 0.08;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy Obsidian Stone Base Plinth (Dark Warm Charcoal) */}
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.8, 4.1, 0.12, 48]} />
        <meshPhysicalMaterial
          color="#14110F"
          roughness={0.55}
          metalness={0.25}
          clearcoat={0.3}
          clearcoatRoughness={0.25}
        />
      </mesh>

      {/* 2. Stepped Brushed Chola Brass Outer Bezel Rim */}
      <mesh position={[0, 0.14, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.6, 3.65, 0.05, 48]} />
        <meshPhysicalMaterial
          color="#D4AF37"
          emissive="#2A1808"
          emissiveIntensity={0.18}
          metalness={0.92}
          roughness={0.22}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* 3. Rotating Turntable Stage Deck with Inlaid Glowing Kolam Rings */}
      <group ref={turntableRef} position={[0, 0.17, 0]}>
        {/* Main Stage Turntable Deck (Brushed Obsidian & Brass) */}
        <mesh receiveShadow>
          <cylinderGeometry args={[3.45, 3.45, 0.02, 64]} />
          <meshPhysicalMaterial
            color="#161210"
            roughness={0.32}
            metalness={0.82}
            clearcoat={0.8}
            clearcoatRoughness={0.14}
            envMapIntensity={1.8}
          />
        </mesh>

        {/* Outer Inlaid Brass Ring */}
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.28, 64]} />
          <meshPhysicalMaterial
            color="#D4AF37"
            emissive="#3D2005"
            emissiveIntensity={0.35}
            metalness={0.95}
            roughness={0.18}
          />
        </mesh>

        {/* Mid Emissive Kolam Ring */}
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.3, 2.36, 64]} />
          <meshPhysicalMaterial
            color="#D4AF37"
            emissive="#D4AF37"
            emissiveIntensity={0.45}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Counter-rotating Inner Emissive Sacred Kolam Core */}
        <group ref={ringGroupRef}>
          <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.35, 1.4, 48]} />
            <meshPhysicalMaterial
              color="#D4AF37"
              emissive="#FFB84D"
              emissiveIntensity={0.6}
              metalness={0.95}
              roughness={0.15}
            />
          </mesh>
          <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 0.74, 32]} />
            <meshPhysicalMaterial
              color="#D4AF37"
              emissive="#FFB84D"
              emissiveIntensity={0.5}
              metalness={0.95}
              roughness={0.15}
            />
          </mesh>
        </group>

        {/* Subtle Decorative Kolam Radial Ticks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh
              key={deg}
              position={[Math.cos(rad) * 2.8, 0.013, Math.sin(rad) * 2.8]}
              rotation={[0, -rad, 0]}
            >
              <boxGeometry args={[0.24, 0.005, 0.03]} />
              <meshBasicMaterial color="#D4AF37" toneMapped={false} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
