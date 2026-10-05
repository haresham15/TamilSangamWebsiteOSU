"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { Environment, Lightformer } from "@react-three/drei";

interface GuideEnvironmentProps {
  keyLightIntensity?: number; // default 2.0, dimmed to 1.2 on scroll (PRD §8)
}

/**
 * Procedural Overcast Station Environment & Cool Key Lighting (PRD §3.1)
 * Replaces warm tungsten bulbs with diffuse, overcast sky and cold ground bounce.
 */
export function GuideEnvironment({ keyLightIntensity = 2.0 }: GuideEnvironmentProps) {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      {/* 1. Procedural Overcast Environment (3 Custom Lightformers, no CDN downloads) */}
      <Environment resolution={256} frames={1} background={false}>
        {/* Overcast sky dome: broad, cool-white diffuse ceiling */}
        <Lightformer
          form="ring"
          intensity={2.2}
          color="#DDE8F2"
          scale={34}
          position={[0, 20, 0]}
          target={[0, 0, 0]}
        />
        {/* Front fill: soft cool reflection across the board face */}
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#C9D3DC"
          scale={[40, 20, 1]}
          position={[0, 3, 16]}
          target={[0, 2, 0]}
        />
        {/* Cold ground bounce: subtle upward reflection from station platform */}
        <Lightformer
          form="rect"
          intensity={0.4}
          color="#9AA4AE"
          scale={[40, 40, 1]}
          rotation-x={-Math.PI / 2}
          position={[0, -4, 0]}
        />
      </Environment>

      {/* 2. Key Light: Gap in the Overcast Cloud (Cool White #E6F0FA, castShadow) */}
      <directionalLight
        ref={lightRef}
        position={[0, 10, 3.5]}
        intensity={keyLightIntensity}
        color="#E6F0FA"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={25}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />

      {/* 3. Subtle Ambient Light for deep shadow clarity */}
      <ambientLight intensity={0.42} color="#CBD5E1" />
    </>
  );
}
