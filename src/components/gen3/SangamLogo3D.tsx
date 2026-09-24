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
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  // Load the minted gold & bronze medallion texture
  const logoTexture = useTexture("/coin-face.svg", (texture) => {
    if (texture instanceof THREE.Texture) {
      texture.anisotropy = 16;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.center.set(0.5, 0.5);
      // Standard 1:1 mapping on CircleGeometry ensures TAMIL is at top, right-side-up, and horizontal!
      texture.repeat.set(1, 1);
      texture.rotation = 0;
    }
  });

  // Procedural brushed medal bump texture
  const bumpTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createBrushedCoinTexture();
  }, []);

  // Physical materials with rich metallic sheen and brushed bump texture
  const {
    faceMaterial,
    edgeMaterial,
    rimBezelMaterial,
    orbitalRing1Material,
    orbitalRing2Material,
  } = useMemo(() => {
    const face = new THREE.MeshPhysicalMaterial({
      color: "#ffffff", // Pure white multiplier so SVG gold and bronze colors render with full fidelity
      roughness: 0.18,
      metalness: 0.85,
      clearcoat: 0.92,
      clearcoatRoughness: 0.1,
      map: logoTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.025,
      emissive: new THREE.Color("#4a2c0c"), // Rich warm temple gold ambient glow (zero purple)
      emissiveIntensity: 0.22,
      reflectivity: 0.95,
    });

    const edge = new THREE.MeshPhysicalMaterial({
      color: "#995815", // Warm burnished gold-bronze rim (harmonizes with Leo sodium vapor)
      roughness: 0.2,
      metalness: 0.95,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
    });

    const bezel = new THREE.MeshPhysicalMaterial({
      color: "#f59e0b", // Temple Gold
      roughness: 0.14,
      metalness: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });

    const ring1 = new THREE.MeshPhysicalMaterial({
      color: "#f59e0b", // Temple Gold
      emissive: new THREE.Color("#663c00"),
      emissiveIntensity: 0.35,
      roughness: 0.14,
      metalness: 0.98,
      clearcoat: 1.0,
    });

    const ring2 = new THREE.MeshPhysicalMaterial({
      color: "#d97706", // Burnished Bronze Gold (Warm harmony with Leo factory)
      emissive: new THREE.Color("#4a2400"),
      emissiveIntensity: 0.3,
      roughness: 0.16,
      metalness: 0.96,
      clearcoat: 1.0,
    });

    return {
      faceMaterial: face,
      edgeMaterial: edge,
      rimBezelMaterial: bezel,
      orbitalRing1Material: ring1,
      orbitalRing2Material: ring2,
    };
  }, [logoTexture, bumpTexture]);

  // Dispose materials and bump texture on unmount
  useEffect(() => {
    return () => {
      bumpTexture?.dispose();
      faceMaterial.dispose();
      edgeMaterial.dispose();
      rimBezelMaterial.dispose();
      orbitalRing1Material.dispose();
      orbitalRing2Material.dispose();
    };
  }, [bumpTexture, faceMaterial, edgeMaterial, rimBezelMaterial, orbitalRing1Material, orbitalRing2Material]);

  // Setup spotlight target
  useEffect(() => {
    if (spotlightRef.current && targetRef.current) {
      spotlightRef.current.target = targetRef.current;
    }
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Gentle floating levitation centered at Y = 3.65m (bottom of coin at 1.15m, hovering well clear of the platform)
      groupRef.current.position.y = 3.65 + Math.sin(time * 1.5) * 0.12;
      
      // Majestic horizontal coin spin around vertical Y-axis (stays upright)
      groupRef.current.rotation.y += delta * 0.45;
      
      // Subtle natural wobble on X
      groupRef.current.rotation.x = Math.sin(time * 0.8) * 0.05;
    }

    // Independent smooth celestial orbit for the outer rings (encircling the coin equatorially high above the ground)
    if (ring1Ref.current) {
      ring1Ref.current.position.y = 3.65 + Math.sin(time * 1.5) * 0.12;
      ring1Ref.current.rotation.y += delta * 0.25;
      ring1Ref.current.rotation.x = Math.sin(time * 0.5) * 0.16 + 0.28;
      ring1Ref.current.rotation.z = Math.cos(time * 0.4) * 0.12;
    }

    if (ring2Ref.current) {
      ring2Ref.current.position.y = 3.65 + Math.sin(time * 1.5) * 0.12;
      ring2Ref.current.rotation.y -= delta * 0.2;
      ring2Ref.current.rotation.x = Math.cos(time * 0.45) * 0.18 - 0.26;
      ring2Ref.current.rotation.z = Math.sin(time * 0.38) * 0.15 + 0.12;
    }
  });

  return (
    <>
      {/* 1. Dedicated High-Intensity Theatrical Overhead Spotlight */}
      <spotLight
        ref={spotlightRef}
        position={[0, 10.8, 0.5]}
        intensity={95}
        color="#FFF8E7"
        angle={0.38}
        penumbra={0.3}
        distance={24}
        decay={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0002}
      />

      {/* Target anchor directly at coin center */}
      <object3D ref={targetRef} position={[0, 3.65, 0]} />

      {/* 2. Direct Key & Rim Lights Focused On The Medallion */}
      {/* Overhead Downward Fill directly bathing the coin crown */}
      <pointLight
        position={[0, 7.2, 0]}
        intensity={26}
        color="#FFE8B5"
        distance={12}
        decay={1.2}
      />

      {/* Front Key Light focused directly on coin face */}
      <pointLight
        position={[0, 4.4, 4.6]}
        intensity={36}
        color="#FFF5DE"
        distance={16}
        decay={1.2}
      />

      {/* Back Key Light illuminating reverse face */}
      <pointLight
        position={[0, 4.4, -4.6]}
        intensity={30}
        color="#FFE8C2"
        distance={16}
        decay={1.2}
      />

      {/* Left Rim Light (Warm Amber specular gleam) */}
      <pointLight
        position={[-4.5, 3.65, 0]}
        intensity={14}
        color="#FFB347"
        distance={12}
        decay={1.5}
      />

      {/* Right Rim Light (Warm Temple Gold specular gleam) */}
      <pointLight
        position={[4.5, 3.65, 0]}
        intensity={16}
        color="#F59E0B"
        distance={12}
        decay={1.5}
      />

      {/* 3. Outer Celestial Orbital Rings: Precessing gracefully around the coin equatorially */}
      <group ref={ring1Ref} position={[0, 3.65, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[3.35, 0.04, 24, 256]} />
          <primitive object={orbitalRing1Material} attach="material" />
        </mesh>
      </group>

      <group ref={ring2Ref} position={[0, 3.65, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[3.85, 0.034, 24, 256]} />
          <primitive object={orbitalRing2Material} attach="material" />
        </mesh>
      </group>

      {/* 4. Floating Medallion Group */}
      <group ref={groupRef} position={[0, 3.65, 0]}>
        {/* Main Medallion Cylinder Rim: 256 radial segments & 12 height segments for an ultra-smooth edge */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.5, 2.5, 0.36, 256, 12]} />
          <primitive object={edgeMaterial} attach="material" />
        </mesh>

        {/* Front Face: Planar CircleGeometry ensures zero UV distortion, perfect horizontal alignment and right-side-up text */}
        <mesh position={[0, 0, 0.181]} castShadow receiveShadow>
          <circleGeometry args={[2.48, 128]} />
          <primitive object={faceMaterial} attach="material" />
        </mesh>

        {/* Back Face: Planar CircleGeometry rotated 180 deg around Y so it is also right-side-up and horizontal */}
        <mesh position={[0, 0, -0.181]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
          <circleGeometry args={[2.48, 128]} />
          <primitive object={faceMaterial} attach="material" />
        </mesh>

        {/* Decorative Temple Gold Beveled Fillet Rings rounding off the cylinder edges */}
        {/* Front face beveled edge (coplanar with front face at z = 0.18) */}
        <mesh position={[0, 0, 0.18]}>
          <torusGeometry args={[2.485, 0.03, 32, 256]} />
          <primitive object={rimBezelMaterial} attach="material" />
        </mesh>

        {/* Back face beveled edge (coplanar with back face at z = -0.18) */}
        <mesh position={[0, 0, -0.18]}>
          <torusGeometry args={[2.485, 0.03, 32, 256]} />
          <primitive object={rimBezelMaterial} attach="material" />
        </mesh>
      </group>
    </>
  );
}

