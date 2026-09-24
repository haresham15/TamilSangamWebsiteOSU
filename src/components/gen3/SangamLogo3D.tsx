"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

function createBrushedCoinTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  
  if (ctx) {
    // Neutral base
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);
    
    const cx = size / 2;
    const cy = size / 2;
    
    // Concentric brushed circular micro-grooves (like a minted bronze medal)
    for (let r = 8; r < size / 2 - 2; r += 2) {
      const val = 120 + Math.floor(Math.sin(r * 0.8) * 28 + (Math.random() - 0.5) * 22);
      ctx.strokeStyle = `rgb(${val}, ${val}, ${val})`;
      ctx.lineWidth = 1 + Math.random() * 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Subtle stippling for authentic metal grain
    for (let i = 0; i < 3500; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (size / 2 - 12);
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const lum = Math.floor(Math.random() * 50 + 105);
      ctx.fillStyle = `rgb(${lum}, ${lum}, ${lum})`;
      ctx.fillRect(x, y, 1.2, 1.2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 16;
  return texture;
}

export function SangamLogo3D() {
  const groupRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  // Load the SVG texture
  const logoTexture = useTexture("/logo.svg");
  
  useEffect(() => {
    logoTexture.anisotropy = 16;
    logoTexture.colorSpace = THREE.SRGBColorSpace;
    logoTexture.minFilter = THREE.LinearMipmapLinearFilter;
    logoTexture.magFilter = THREE.LinearFilter;
    logoTexture.center.set(0.5, 0.5);
    logoTexture.rotation = Math.PI / 2;
  }, [logoTexture]);

  // Procedural brushed medal bump texture
  const bumpTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createBrushedCoinTexture();
  }, []);

  // Physical materials with rich metallic sheen and brushed bump texture
  const { faceMaterial, edgeMaterial, rimBezelMaterial } = useMemo(() => {
    const face = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.22,
      metalness: 0.82,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      map: logoTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.045,
      reflectivity: 0.9,
    });

    const edge = new THREE.MeshPhysicalMaterial({
      color: "#250d38",
      roughness: 0.35,
      metalness: 0.95,
      clearcoat: 0.6,
    });

    const bezel = new THREE.MeshPhysicalMaterial({
      color: "#f59e0b", // Temple Gold
      roughness: 0.2,
      metalness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    return { faceMaterial: face, edgeMaterial: edge, rimBezelMaterial: bezel };
  }, [logoTexture, bumpTexture]);

  // Setup spotlight target
  useEffect(() => {
    if (spotlightRef.current && targetRef.current) {
      spotlightRef.current.target = targetRef.current;
    }
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle floating levitation
      groupRef.current.position.y = 2.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.12;
      
      // Majestic horizontal coin spin around the vertical Y-axis (stays upright!)
      groupRef.current.rotation.y += delta * 0.45;
      
      // Subtle natural wobble on X
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
    }
  });

  return (
    <>
      {/* 1. Dedicated Overhead Theatrical Spotlight Illuminating ONLY the Coin */}
      <spotLight
        ref={spotlightRef}
        position={[0, 8.8, 0.2]}
        intensity={32}
        color="#FFF8E7"
        angle={0.34}
        penumbra={0.45}
        distance={18}
        decay={1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />

      {/* Target anchor directly at coin center */}
      <object3D ref={targetRef} position={[0, 2.5, 0]} />

      {/* Volumetric Overhead Downward Light Beam Shaft */}
      <mesh position={[0, 5.65, 0.1]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 2.7, 6.3, 32, 1, true]} />
        <meshBasicMaterial
          color="#FFE9B8"
          transparent
          opacity={0.14}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Circular Spotlight Pool on Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[2.8, 32]} />
        <meshBasicMaterial
          color="#FFDFA0"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Floating Medallion Group */}
      <group ref={groupRef} position={[0, 2.5, 0]}>
        {/* Main Medallion Mesh */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.5, 2.5, 0.4, 128]} />
          <primitive object={edgeMaterial} attach="material-0" />
          <primitive object={faceMaterial} attach="material-1" />
          <primitive object={faceMaterial} attach="material-2" />
        </mesh>

        {/* Decorative Temple Gold Beveled Rim Rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.205]}>
          <torusGeometry args={[2.51, 0.05, 16, 128]} />
          <primitive object={rimBezelMaterial} attach="material" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.205]}>
          <torusGeometry args={[2.51, 0.05, 16, 128]} />
          <primitive object={rimBezelMaterial} attach="material" />
        </mesh>
      </group>
    </>
  );
}
