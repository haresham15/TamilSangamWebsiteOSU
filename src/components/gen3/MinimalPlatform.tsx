"use client";
import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getScrollProgress } from "./useScrollCinematic";
import { createHeroKineticsTracker } from "@/lib/heroKinetics";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { proceduralPbrMaps } from "@/lib/proceduralPbrMaps";

const DECK_NORMAL_SCALE = new THREE.Vector2(0.3, 0.3);
const PLINTH_NORMAL_SCALE = new THREE.Vector2(0.4, 0.4);
const BRASS_NORMAL_SCALE = new THREE.Vector2(0.35, 0.35);

export function MinimalPlatform() {
  const turntableRef = useRef<THREE.Group>(null);
  const ringGroupRef = useRef<THREE.Group>(null);
  const deckShaderRef = useRef<THREE.WebGLProgramParametersWithUniforms | null>(null);
  const kineticsRef = useRef(createHeroKineticsTracker(8.0, 5.0, 4.0));
  const elapsed = useRef(0);

  const cinematic = isHeroCinematicEnabled("events");

  // PBR Texture Maps for elevated turntable and plinth
  const pbrMaps = useMemo(() => {
    if (!cinematic) return null;
    return {
      deckRough: proceduralPbrMaps.getNoiseRoughness("events-turntable-rough", 256, 256, 0.18, 0.38),
      deckNormal: proceduralPbrMaps.getBrushedMetalNormal("events-turntable-normal", 256, 256),
      plinthNormal: proceduralPbrMaps.getGraniteNormal("events-plinth-granite", 256, 256),
      brassRough: proceduralPbrMaps.getNoiseRoughness("events-brass-rough", 256, 256, 0.12, 0.24),
      brassNormal: proceduralPbrMaps.getBrushedMetalNormal("events-brass-normal", 256, 256),
    };
  }, [cinematic]);

  useEffect(() => {
    return () => {
      if (cinematic) {
        proceduralPbrMaps.release("events-turntable-rough");
        proceduralPbrMaps.release("events-turntable-normal");
        proceduralPbrMaps.release("events-plinth-granite");
        proceduralPbrMaps.release("events-brass-rough");
        proceduralPbrMaps.release("events-brass-normal");
      }
    };
  }, [cinematic]);

  const deckMaterial = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: "#161210",
      roughness: cinematic ? 0.28 : 0.32,
      metalness: cinematic ? 0.88 : 0.82,
      clearcoat: cinematic ? 0.95 : 0.8,
      clearcoatRoughness: cinematic ? 0.1 : 0.14,
      envMapIntensity: cinematic ? 2.2 : 1.8,
      roughnessMap: pbrMaps?.deckRough ?? null,
      normalMap: pbrMaps?.deckNormal ?? null,
      normalScale: cinematic && pbrMaps ? DECK_NORMAL_SCALE : undefined,
    });
    mat.defines = { USE_UV: "" };

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uScrollVelocity = { value: 0 };

      shader.fragmentShader = `
        uniform float uTime;
        uniform float uScrollVelocity;
        ${shader.fragmentShader}
      `.replace(
        `#include <emissivemap_fragment>`,
        `
        #include <emissivemap_fragment>
        // Acoustic bass-ripple shader: concentric gold emissive rings pulsing outward
        float distFromCenter = length(vUv - vec2(0.5));
        float wave = sin(distFromCenter * 36.0 - uTime * 4.5 - abs(uScrollVelocity) * 8.0);
        float ripple = smoothstep(0.4, 0.96, wave) * smoothstep(0.5, 0.08, distFromCenter);
        totalEmissiveRadiance += vec3(0.83, 0.69, 0.22) * ripple * 0.75;
        `
      );
      deckShaderRef.current = shader;
    };

    return mat;
  }, [cinematic, pbrMaps]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    elapsed.current += dt;

    if (turntableRef.current) {
      turntableRef.current.rotation.y += dt * 0.12;
    }
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y -= dt * 0.08;
    }

    const rawP = getScrollProgress();
    const kinetics = kineticsRef.current.update(rawP, undefined, dt);

    if (deckShaderRef.current) {
      deckShaderRef.current.uniforms.uTime.value = elapsed.current;
      deckShaderRef.current.uniforms.uScrollVelocity.value = kinetics.smoothVelocity;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy Obsidian Stone Base Plinth (Dark Warm Charcoal) */}
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.8, 4.1, 0.12, 48]} />
        <meshPhysicalMaterial
          color="#14110F"
          roughness={cinematic ? 0.62 : 0.55}
          metalness={0.25}
          clearcoat={0.3}
          clearcoatRoughness={0.25}
          normalMap={pbrMaps?.plinthNormal ?? null}
          normalScale={cinematic && pbrMaps ? PLINTH_NORMAL_SCALE : undefined}
        />
      </mesh>

      {/* 2. Stepped Brushed Chola Brass Outer Bezel Rim */}
      <mesh position={[0, 0.14, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.6, 3.65, 0.05, 48]} />
        <meshPhysicalMaterial
          color="#D4AF37"
          emissive="#2A1808"
          emissiveIntensity={cinematic ? 0.22 : 0.18}
          metalness={cinematic ? 0.95 : 0.92}
          roughness={cinematic ? 0.18 : 0.22}
          clearcoat={cinematic ? 0.8 : 0.6}
          clearcoatRoughness={0.16}
          envMapIntensity={cinematic ? 2.5 : 2.0}
          roughnessMap={pbrMaps?.brassRough ?? null}
          normalMap={pbrMaps?.brassNormal ?? null}
          normalScale={cinematic && pbrMaps ? BRASS_NORMAL_SCALE : undefined}
        />
      </mesh>

      {/* 3. Rotating Turntable Stage Deck with Inlaid Glowing Kolam Rings */}
      <group ref={turntableRef} position={[0, 0.17, 0]}>
        {/* Main Stage Turntable Deck (Brushed Obsidian & Brass) with Acoustic Bass-Ripples */}
        <mesh receiveShadow material={deckMaterial}>
          <cylinderGeometry args={[3.45, 3.45, 0.02, 64]} />
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
