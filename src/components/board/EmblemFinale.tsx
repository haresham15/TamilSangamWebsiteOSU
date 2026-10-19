"use client";

import React, { useRef, useEffect, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useBoardHeroStore } from "@/store/boardHeroStore";
import { OilLamp } from "./OilLamp";

interface EmblemFinaleProps {
  scrollProgress: RefObject<number>;
  onFinaleTriggered?: () => void;
}

/**
 * §7: Finale — Chola Tiger Emblem Bloom & Golden Crossfade
 * - The sacred royal tiger emblem sits at the climax of the corridor (z = 0.0).
 * - Sits on bloom layer (layers.enable(1)) as designated bloom source.
 * - At p >= 0.98, ramps emissive from 1.0 -> 3.5, triggering the golden dissolve into DOM roster.
 */
export function EmblemFinale({ scrollProgress, onFinaleTriggered }: EmblemFinaleProps) {
  const emblemMeshRef = useRef<THREE.Mesh>(null);
  const ringMeshRef = useRef<THREE.Mesh>(null);
  const backLightRef = useRef<THREE.PointLight>(null);
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (emblemMeshRef.current) {
      emblemMeshRef.current.layers.enable(1);
    }
    if (ringMeshRef.current) {
      ringMeshRef.current.layers.enable(1);
    }
  }, []);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const p = scrollProgress.current;

    // Check trigger threshold (§7: at p=1.0)
    if (p >= 0.98 && !hasFiredRef.current) {
      hasFiredRef.current = true;
      useBoardHeroStore.getState().setFinaleFired(true);

      if (emblemMeshRef.current && ringMeshRef.current && backLightRef.current) {
        const mat = emblemMeshRef.current.material as THREE.MeshStandardMaterial;
        const ringMat = ringMeshRef.current.material as THREE.MeshStandardMaterial;
        const light = backLightRef.current;

        // Refined warm golden bloom: emissive gently elevates from 0.4 -> 0.95
        gsap.to(mat, {
          emissiveIntensity: 0.95,
          duration: 0.35,
          ease: "power2.out",
        });
        gsap.to(ringMat, {
          emissiveIntensity: 0.95,
          duration: 0.35,
          ease: "power2.out",
        });
        gsap.to(light, {
          intensity: 6.5,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            if (onFinaleTriggered) {
              onFinaleTriggered();
            }
          },
        });
      } else if (onFinaleTriggered) {
        onFinaleTriggered();
      }
    } else if (p < 0.96 && hasFiredRef.current) {
      // Reset when user scrolls back up into corridor
      hasFiredRef.current = false;
      useBoardHeroStore.getState().setFinaleFired(false);

      if (emblemMeshRef.current && ringMeshRef.current && backLightRef.current) {
        const mat = emblemMeshRef.current.material as THREE.MeshStandardMaterial;
        const ringMat = ringMeshRef.current.material as THREE.MeshStandardMaterial;
        gsap.killTweensOf([mat, ringMat, backLightRef.current]);
        mat.emissiveIntensity = 0.25;
        ringMat.emissiveIntensity = 0.35;
        backLightRef.current.intensity = 3.5;
      }
    }
  });

  return (
    <group position={[0, 1.8, 0]}>
      {/* ========================================================================= */}
      {/* 1. CHOLA SANCTUM DAIS & STONE ARCHWAY RECESS                              */}
      {/* ========================================================================= */}
      {/* Back Wall of Sanctum */}
      <mesh position={[0, 0.4, -0.6]} receiveShadow>
        <boxGeometry args={[5.2, 5.0, 0.4]} />
        <meshStandardMaterial color="#21150e" roughness={0.92} metalness={0.15} />
      </mesh>

      {/* Raised Ceremonial Altar Plinth */}
      <mesh position={[0, -1.5, 0.2]} receiveShadow>
        <boxGeometry args={[3.8, 0.6, 1.4]} />
        <meshStandardMaterial color="#38251a" roughness={0.85} metalness={0.25} />
      </mesh>
      <mesh position={[0, -1.1, 0.2]} receiveShadow>
        <boxGeometry args={[3.2, 0.2, 1.2]} />
        <meshStandardMaterial color="#4a3324" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Flanking Sanctum Brass Lamps */}
      <OilLamp position={[-1.6, -0.8, 0.5]} isRealLight={true} phaseOffset={0.7} />
      <OilLamp position={[1.6, -0.8, 0.5]} isRealLight={true} phaseOffset={2.4} />

      {/* ========================================================================= */}
      {/* 2. CHOLA TIGER EMBLEM MEDALLION & ARCHITECTURAL TORANA                   */}
      {/* ========================================================================= */}
      {/* Heavy Embossed Bronze Disc */}
      <mesh position={[0, 0.3, -0.1]}>
        <cylinderGeometry args={[1.35, 1.35, 0.12, 32]} />
        <meshStandardMaterial color="#2d1d11" roughness={0.7} metalness={0.8} />
      </mesh>

      {/* Brushed 24K Gold Aureole Ring */}
      <mesh ref={ringMeshRef} position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.3, 0.08, 16, 48]} />
        <meshStandardMaterial
          color="#D4AF37"
          emissive="#523B0F"
          emissiveIntensity={0.35}
          roughness={0.22}
          metalness={0.92}
        />
      </mesh>

      {/* Imperial Tiger Emblem Face Disc */}
      <mesh ref={emblemMeshRef} position={[0, 0.3, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.22, 1.22, 0.04, 32]} />
        <meshStandardMaterial
          color="#D4AF37"
          emissive="#523B0F"
          emissiveIntensity={0.25}
          roughness={0.26}
          metalness={0.94}
        />
      </mesh>

      {/* Backlit Golden Morning Bloom Plane for Smooth Page Melt */}
      <mesh position={[0, 0.3, -0.2]}>
        <planeGeometry args={[4.2, 4.2]} />
        <meshBasicMaterial
          color="#FFF8EB"
          transparent={true}
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Warm Golden Key Light */}
      <pointLight
        ref={backLightRef}
        position={[0, 0.4, 0.4]}
        color="#FFCC44"
        intensity={3.5}
        distance={12.0}
        decay={2.0}
      />
    </group>
  );
}
