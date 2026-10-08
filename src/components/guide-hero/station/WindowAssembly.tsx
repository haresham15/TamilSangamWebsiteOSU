"use client";

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { guideStationPalette } from "./palette";
import { SdfSilhouette } from "./SdfSilhouette";

function createCompartmentGradient() {
  const width = 128;
  const height = 128;
  const pixels = new Uint8Array(width * height * 4);
  const centre = new THREE.Color(guideStationPalette.practicalWarm);
  const edge = new THREE.Color(guideStationPalette.windowFalloff);
  const shade = new THREE.Color(guideStationPalette.boardInk);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dx = x / (width - 1) - 0.5;
      const dy = y / (height - 1) - 0.52;
      const vignette = Math.min(1, Math.hypot(dx * 1.45, dy * 1.12) * 1.35);
      const color = centre.clone().lerp(edge, vignette * 0.54).lerp(shade, Math.max(0, vignette - 0.5) * 0.5);
      const index = (y * width + x) * 4;
      pixels[index] = Math.round(color.r * 255);
      pixels[index + 1] = Math.round(color.g * 255);
      pixels[index + 2] = Math.round(color.b * 255);
      pixels[index + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function Curtain() {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const shape = useMemo(() => {
    const curtain = new THREE.Shape();
    curtain.moveTo(-1.86, 1.03);
    curtain.lineTo(-0.9, 1.03);
    curtain.bezierCurveTo(-1.1, 0.45, -0.7, 0.08, -1.0, -0.38);
    curtain.bezierCurveTo(-1.3, -0.78, -0.84, -1.05, -1.18, -1.05);
    curtain.lineTo(-1.86, -1.05);
    curtain.closePath();
    return curtain;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t * 3.2) * 0.035 + Math.sin(t * 7.1) * 0.012;
    meshRef.current.position.x = Math.sin(t * 2.8) * 0.01;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0.06]} renderOrder={22}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial color={guideStationPalette.coachBand} transparent opacity={0.68} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

interface WindowAssemblyProps {
  progress: number;
  getProgress?: () => number;
}

/** Z-ordered, original window vignette. The people are analytic SDF placeholders. */
export function WindowAssembly({ progress, getProgress }: WindowAssemblyProps) {
  const gradient = useMemo(() => createCompartmentGradient(), []);
  const spillMaterial = React.useRef<THREE.MeshBasicMaterial>(null);
  const spillOpacity = Math.min(0.28, Math.max(0, (progress - 0.08) * 1.4));

  useEffect(() => {
    return () => gradient.dispose();
  }, [gradient]);

  useFrame(() => {
    if (!spillMaterial.current || !getProgress) return;
    const nextOpacity = Math.min(0.28, Math.max(0, (getProgress() - 0.08) * 1.4));
    spillMaterial.current.opacity = nextOpacity;
  });

  return (
    <group name="WindowAssembly" position={[-0.3, 2.25, 0.5]}>
      <mesh position={[0, 0, 0]} renderOrder={10}>
        <planeGeometry args={[4.15, 2.35]} />
        <meshBasicMaterial map={gradient} toneMapped={false} />
      </mesh>
      <mesh position={[-0.88, -0.56, 0.018]} renderOrder={12}>
        <boxGeometry args={[1.05, 0.48, 0.08]} />
        <meshStandardMaterial color={guideStationPalette.boardInk} metalness={0.22} roughness={0.78} />
      </mesh>
      <mesh position={[1.15, -0.55, 0.018]} renderOrder={12}>
        <boxGeometry args={[0.92, 0.5, 0.08]} />
        <meshStandardMaterial color={guideStationPalette.boardInk} metalness={0.22} roughness={0.78} />
      </mesh>
      <group position={[0.85, 0.46, 0.025]} rotation={[0, 0, 0.16]} renderOrder={13}>
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((rotation) => (
          <mesh key={rotation} rotation={[0, 0, rotation]} position={[0.2, 0, 0]}>
            <boxGeometry args={[0.5, 0.035, 0.025]} />
            <meshBasicMaterial color={guideStationPalette.boardInk} transparent opacity={0.62} />
          </mesh>
        ))}
      </group>
      <SdfSilhouette kind="woman" position={[-0.72, -0.08, 0.05]} scale={0.9} />
      <Curtain />
      <mesh position={[0, 0, 0.08]} renderOrder={23}>
        <planeGeometry args={[4.03, 2.23]} />
        <meshBasicMaterial color={guideStationPalette.practicalCool} transparent opacity={0.08} depthWrite={false} />
      </mesh>
      {[-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75].map((y) => (
        <mesh key={y} position={[0, y, 0.1]} rotation={[0, 0, Math.PI / 2]} renderOrder={24}>
          <cylinderGeometry args={[0.012, 0.012, 4.05, 10]} />
          <meshStandardMaterial color={guideStationPalette.boardInk} metalness={0.78} roughness={0.22} />
        </mesh>
      ))}
      <SdfSilhouette kind="man" position={[0.86, -0.06, 0.125]} scale={0.94} />
      {[
        { position: [0, 1.15, 0.14] as THREE.Vector3Tuple, size: [4.35, 0.12, 0.1] as [number, number, number] },
        { position: [0, -1.15, 0.14] as THREE.Vector3Tuple, size: [4.35, 0.12, 0.1] as [number, number, number] },
        { position: [-2.12, 0, 0.14] as THREE.Vector3Tuple, size: [0.12, 2.38, 0.1] as [number, number, number] },
        { position: [2.12, 0, 0.14] as THREE.Vector3Tuple, size: [0.12, 2.38, 0.1] as [number, number, number] },
      ].map(({ position, size }) => (
        <mesh key={position.join(":")} position={position} renderOrder={26}>
          <boxGeometry args={size} />
          <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.58} roughness={0.28} />
        </mesh>
      ))}
      <mesh position={[0, -2.23, 0.01]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={8}>
        <planeGeometry args={[6.8, 3.3]} />
        <meshBasicMaterial ref={spillMaterial} color={guideStationPalette.windowFalloff} transparent opacity={spillOpacity} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default WindowAssembly;
