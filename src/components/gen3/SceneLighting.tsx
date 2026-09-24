"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function SceneLighting() {
  const godLightRef = useRef<THREE.DirectionalLight>(null);

  // Smooth majestic breathing for the god light
  useFrame(({ clock }) => {
    if (godLightRef.current) {
      const time = clock.getElapsedTime();
      godLightRef.current.position.x = Math.sin(time * 0.4) * 1.5;
      // Smooth majestic pulse without frantic strobing
      godLightRef.current.intensity = 6.0 + Math.sin(time * 1.5) * 0.5;
    }
  });

  return (
    <>
      {/* Ambient Fill - Keep dark for high contrast */}
      <ambientLight intensity={0.5} color="#2A1B1D" />
      <hemisphereLight args={["#ffaa00", "#050200", 1.0]} />

      {/* Primary God Light (Naa Ready Sodium Vapor Flood) */}
      <directionalLight
        ref={godLightRef}
        position={[0, 5, -8]}
        intensity={8.0}
        color="#FFAA00" // Intense Amber/Orange
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-near={0.1}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />
      
      {/* Secondary Rim Light (Teal/Blue contrast) */}
      <spotLight position={[5, 2, -5]} intensity={6.0} color="#55CCA2" distance={20} angle={0.8} penumbra={0.5} />
      
      {/* Subtle Front Fill so overhead spotlight dominates the coin */}
      <pointLight position={[0, 3, 6]} intensity={1.2} color="#FFD1A9" distance={12} decay={1.8} />
    </>
  );
}
