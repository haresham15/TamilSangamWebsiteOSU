"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function SceneLighting() {
  const godLightRef = useRef<THREE.DirectionalLight>(null);
  const sweepSpot1Ref = useRef<THREE.SpotLight>(null);
  const sweepSpot2Ref = useRef<THREE.SpotLight>(null);

  // Cinematic floor sweep targets moving smoothly across the arena floor
  const sweepTarget1Ref = useRef<THREE.Object3D>(null);
  const sweepTarget2Ref = useRef<THREE.Object3D>(null);

  useEffect(() => {
    if (sweepSpot1Ref.current && sweepTarget1Ref.current) {
      sweepSpot1Ref.current.target = sweepTarget1Ref.current;
    }
    if (sweepSpot2Ref.current && sweepTarget2Ref.current) {
      sweepSpot2Ref.current.target = sweepTarget2Ref.current;
    }
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (godLightRef.current) {
      godLightRef.current.position.x = Math.sin(time * 0.35) * 1.5;
      godLightRef.current.intensity = 4.2 + Math.sin(time * 1.2) * 0.4;
    }

    // Sweep 1: Glides in smooth Lissajous figure across left & right wings
    if (sweepTarget1Ref.current) {
      sweepTarget1Ref.current.position.x = Math.sin(time * 0.45) * 9.2;
      sweepTarget1Ref.current.position.z = Math.cos(time * 0.35) * 5.2 - 2.5;
      sweepTarget1Ref.current.position.y = 0;
    }

    // Sweep 2: Counter-sweeps the rear amphitheater and corner bays
    if (sweepTarget2Ref.current) {
      sweepTarget2Ref.current.position.x = -Math.sin(time * 0.38) * 8.8;
      sweepTarget2Ref.current.position.z = -Math.cos(time * 0.28) * 4.8 - 3.5;
      sweepTarget2Ref.current.position.y = 0;
    }
  });

  return (
    <>
      {/* Moving sweep targets for the floor searchlights */}
      <object3D ref={sweepTarget1Ref} />
      <object3D ref={sweepTarget2Ref} />

      {/* Deep, moody ambient fill to keep the scene cinematic */}
      <ambientLight intensity={0.18} color="#161018" />
      <hemisphereLight args={["#201610", "#030202", 0.18]} />

      {/* Primary God Light (Festival Arena Amber Sodium Vapor Flood) illuminating upper wall & architecture */}
      <directionalLight
        ref={godLightRef}
        position={[0, 6.5, -8]}
        intensity={4.2}
        color="#FFA216"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-near={0.1}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
      />

      {/* Focused Hero SpotLight on Central Coin and Turntable Platform */}
      <spotLight
        position={[0, 8.0, 1.5]}
        intensity={18.0}
        color="#FFE6B0"
        angle={0.52}
        penumbra={0.7}
        distance={22}
        decay={1.4}
      />

      {/* Primary Cinematic Sweeping Floor SpotLight (Amber Moving Head) */}
      <spotLight
        ref={sweepSpot1Ref}
        position={[-4, 11.5, -1.0]}
        intensity={34.0}
        color="#FFA618"
        angle={0.65}
        penumbra={0.78}
        distance={28}
        decay={1.3}
      />

      {/* Secondary Counter-Sweeping Floor SpotLight (Warm Golden Moving Head) */}
      <spotLight
        ref={sweepSpot2Ref}
        position={[4, 11.5, -1.0]}
        intensity={28.0}
        color="#FFBD38"
        angle={0.62}
        penumbra={0.8}
        distance={28}
        decay={1.3}
      />

      {/* Warm Sodium Rim on Back Wall & Catwalk */}
      <spotLight
        position={[6, 3, -6]}
        intensity={3.8}
        color="#FF9F1C"
        distance={22}
        angle={0.75}
        penumbra={0.6}
      />

      {/* Subtle Front Fill so the coin stencils pop crisply */}
      <pointLight position={[0, 2.5, 5]} intensity={1.2} color="#FFE0B2" distance={12} decay={2.0} />
    </>
  );
}
