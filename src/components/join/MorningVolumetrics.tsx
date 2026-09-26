"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface MorningVolumetricsProps {
  gateProgressRef: React.RefObject<number>;
}

// Procedural soft radial glow canvas texture for the morning sun disk
function createRadialGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255, 248, 220, 1.0)");
    gradient.addColorStop(0.25, "rgba(255, 230, 170, 0.75)");
    gradient.addColorStop(0.55, "rgba(255, 200, 120, 0.35)");
    gradient.addColorStop(0.85, "rgba(255, 175, 80, 0.10)");
    gradient.addColorStop(1, "rgba(255, 160, 60, 0.0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  return texture;
}

export function MorningVolumetrics({ gateProgressRef }: MorningVolumetricsProps) {
  const shaftGroupRef = useRef<THREE.Group>(null);
  const sunDiskRef = useRef<THREE.Mesh>(null);

  // Soft glow texture
  const glowTexture = useMemo(() => {
    if (typeof window !== "undefined") {
      return createRadialGlowTexture();
    }
    return null;
  }, []);

  const sunGlowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [glowTexture]
  );

  const beamMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#FFE4A8", // Golden morning light
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  useFrame((state) => {
    const p = gateProgressRef.current ?? 0;
    const time = state.clock.getElapsedTime();

    // Subtle atmospheric shimmer
    const shimmer = 1.0 + Math.sin(time * 1.4) * 0.04;

    // As gates open (p = 0.2 to 0.75), sunbeams expand in intensity and width
    const openFactor = Math.min(Math.max((p - 0.18) / 0.54, 0), 1);
    const targetOpacity = (0.05 + openFactor * 0.18) * shimmer;

    beamMaterial.opacity = targetOpacity;

    if (shaftGroupRef.current) {
      const scaleX = 1.0 + openFactor * 0.6;
      shaftGroupRef.current.scale.set(scaleX, 1.0, 1.0);
    }

    if (sunDiskRef.current) {
      const pulse = 1.0 + Math.sin(time * 0.8) * 0.03 + openFactor * 0.4;
      sunDiskRef.current.scale.set(pulse, pulse, 1.0);
    }
  });

  return (
    <group position={[0, 4.4, -9]}>
      {/* 1. Soft Morning Sun Orb behind archway */}
      <mesh ref={sunDiskRef} position={[0, 0.4, 0]} material={sunGlowMaterial}>
        <planeGeometry args={[7.5, 7.5]} />
      </mesh>

      {/* 2. Soft Dawn Volumetric Light Rays angling down through the gateway */}
      <group ref={shaftGroupRef} position={[0, -0.6, 2]}>
        {/* Fan of soft downward morning beams */}
        {[-2.4, -1.2, 0, 1.2, 2.4].map((xOffset, i) => (
          <mesh
            key={i}
            position={[xOffset * 0.8, -1.2, 3.5]}
            rotation={[Math.PI * 0.46, (xOffset * Math.PI) / 36, 0]}
            material={beamMaterial}
          >
            <cylinderGeometry args={[0.15, 1.2, 7.5, 12, 1, true]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
