"use client";

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { generateProceduralKolam } from "@/lib/kolamMath";

export function MinimalPlatform() {
  const kolam = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.strokeStyle = "#FAF7F2";
    context.lineWidth = 3;
    context.lineCap = "round";
    for (const path of generateProceduralKolam("Tamil Sangam", 256, 256, 230)) {
      context.beginPath();
      path.forEach((point, index) => index === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y));
      context.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => kolam?.dispose(), [kolam]);
  return (
    <group position={[0, 0, 0]}>
      {kolam && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 8]}>
          <planeGeometry args={[5, 5]} />
          <meshBasicMaterial map={kolam} transparent opacity={0.85} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {/* Heavy Industrial Octagonal Steel Platform Base */}
      <mesh position={[0, 0.08, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.2, 3.4, 0.16, 8]} />
        <meshStandardMaterial
          color="#1e1e24"
          roughness={0.4}
          metalness={0.85}
        />
      </mesh>
      {/* Metallic Step Rim */}
      <mesh position={[0, 0.165, 0]}>
        <cylinderGeometry args={[3.0, 3.0, 0.02, 32]} />
        <meshStandardMaterial
          color="#2a2530"
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>
      {/* Center Medallion Receiver Pad with Specular Sheen */}
      <mesh position={[0, 0.175, 0]}>
        <cylinderGeometry args={[2.6, 2.6, 0.01, 32]} />
        <meshStandardMaterial
          color="#18151f"
          roughness={0.2}
          metalness={0.95}
        />
      </mesh>
    </group>
  );
}
