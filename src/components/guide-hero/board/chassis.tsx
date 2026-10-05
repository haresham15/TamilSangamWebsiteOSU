"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import * as THREE from "three";

interface ChassisProps {
  boardWidth?: number;  // cell area width (e.g. 21.0 su for desktop)
  boardHeight?: number; // cell area height (e.g. 5.2 su for desktop)
  isMoving?: boolean;   // true while flipping -> amber lamp, settled -> green lamp
  settleShake?: number; // subtle translation offset on word lock
}

/**
 * Creates a high-res painted enamel sign texture via Canvas 2D (PRD §3.2).
 * Strictly renders authentic Tamil script with canvas shaping after fonts are loaded.
 */
function createHeaderSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Deep matte black enamel surface
  ctx.fillStyle = "#0c0a0d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle enamel border line
  ctx.strokeStyle = "#251d2e";
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

  // Left Section: SANGAM JUNCTION · PLATFORM 1
  ctx.fillStyle = "#8a7b99";
  ctx.font = "bold 44px 'Azeret Mono', 'Space Mono', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("SANGAM JUNCTION  ·  PLATFORM 1", 48, 128);

  // Right Section: GUIDE · வழிகாட்டி
  ctx.fillStyle = "#F5F5F7";
  ctx.font = "bold 56px 'Azeret Mono', 'Space Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText("GUIDE  ·  ", canvas.width - 340, 128);

  // Render Tamil with Mukta Malar / Tamil fallback
  ctx.fillStyle = "#55CCA2"; // Mint Teal heritage accent
  ctx.font = "bold 54px 'Mukta Malar', 'Anek Tamil', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("வழிகாட்டி", canvas.width - 330, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Powder-Coated Dielectric Chassis (PRD §3.2)
 * Houses the split-flap cell matrix with real bevels, header sign, and status LED.
 */
export function GuideChassis({
  boardWidth = 21.0,
  boardHeight = 5.2,
  isMoving = false,
  settleShake = 0,
}: ChassisProps) {
  const [signTexture, setSignTexture] = useState<THREE.CanvasTexture | null>(null);
  const lampRef = useRef<THREE.Mesh>(null);

  // Load fonts first, then render painted sign
  useEffect(() => {
    let active = true;
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        if (!active) return;
        setSignTexture(createHeaderSignTexture());
      });
    } else {
      requestAnimationFrame(() => {
        if (!active) return;
        setSignTexture(createHeaderSignTexture());
      });
    }
    return () => {
      active = false;
    };
  }, []);

  // Dispose texture on unmount
  useEffect(() => {
    return () => {
      if (signTexture) signTexture.dispose();
    };
  }, [signTexture]);

  // Derived dimensions with physical margins
  const bezelMarginX = 0.8;
  const bezelMarginBottom = 0.7;
  const headerHeight = 1.3;
  const bezelMarginTop = 0.6;

  const totalWidth = boardWidth + bezelMarginX * 2;
  const totalHeight = boardHeight + headerHeight + bezelMarginBottom + bezelMarginTop;
  const chassisDepth = 0.5;
  const recessDepth = 0.16;

  // Powder-coat dielectric material: metalness 0.2, roughness 0.8 (PRD §0, §3.2)
  const chassisMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0A0A0B",
        metalness: 0.2,
        roughness: 0.8,
      }),
    []
  );

  const bezelTrimMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#16131a",
        metalness: 0.35,
        roughness: 0.65,
      }),
    []
  );

  // Cleanup materials
  useEffect(() => {
    return () => {
      chassisMaterial.dispose();
      bezelTrimMaterial.dispose();
    };
  }, [chassisMaterial, bezelTrimMaterial]);

  // Status Lamp Color: Amber (#FFB000) while moving, Green (#3DDC84) when settled
  const lampColor = isMoving ? "#FFB000" : "#3DDC84";
  const lampEmissive = isMoving ? "#FFB000" : "#3DDC84";

  // Center alignment: cell region is centered around [0, -headerHeight/2, 0]
  const chassisCenterY = headerHeight / 2;

  return (
    <group position={[0, settleShake, 0]}>
      {/* 1. Main Backplate & Recessed Cabinet */}
      <mesh
        position={[0, chassisCenterY, -chassisDepth / 2 - recessDepth]}
        material={chassisMaterial}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[totalWidth, totalHeight, chassisDepth]} />
      </mesh>

      {/* 2. Top Header Sign Plaque (Painted Canvas Enamel Sign) */}
      <mesh
        position={[0, boardHeight / 2 + headerHeight / 2 + 0.1, -recessDepth + 0.02]}
        receiveShadow
      >
        <planeGeometry args={[boardWidth, headerHeight - 0.2]} />
        {signTexture ? (
          <meshBasicMaterial map={signTexture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#0c0a0d" roughness={0.9} />
        )}
      </mesh>

      {/* 3. Status LED Lamp (Amber flipping / Green settled, PRD §3.2, §5.4) */}
      <group position={[boardWidth / 2 - 0.4, boardHeight / 2 + headerHeight / 2 + 0.1, -recessDepth + 0.05]}>
        {/* Bezel housing */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.16, 0.08, 24]} />
          <meshStandardMaterial color="#1a1420" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Emissive Lamp Disc */}
        <mesh ref={lampRef} position={[0, 0, 0.04]}>
          <circleGeometry args={[0.09, 24]} />
          <meshStandardMaterial
            color={lampColor}
            emissive={lampEmissive}
            emissiveIntensity={1.8}
            roughness={0.2}
            toneMapped={false}
          />
        </mesh>
        {/* Subtle local glow point light */}
        <pointLight
          color={lampColor}
          intensity={0.65}
          distance={2.5}
          decay={2}
          position={[0, 0, 0.15]}
        />
      </group>

      {/* 4. Outer Bezel Frame with Highlight Chamfers */}
      {/* Left Bezel Pillar */}
      <mesh
        position={[-totalWidth / 2 + bezelMarginX / 2, chassisCenterY, 0]}
        material={bezelTrimMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[bezelMarginX, totalHeight, recessDepth * 2]} />
      </mesh>

      {/* Right Bezel Pillar */}
      <mesh
        position={[totalWidth / 2 - bezelMarginX / 2, chassisCenterY, 0]}
        material={bezelTrimMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[bezelMarginX, totalHeight, recessDepth * 2]} />
      </mesh>

      {/* Top Bezel Crown */}
      <mesh
        position={[0, totalHeight / 2 + chassisCenterY - bezelMarginTop / 2, 0]}
        material={bezelTrimMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[totalWidth, bezelMarginTop, recessDepth * 2]} />
      </mesh>

      {/* Bottom Bezel Sill */}
      <mesh
        position={[0, -totalHeight / 2 + chassisCenterY + bezelMarginBottom / 2, 0]}
        material={bezelTrimMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[totalWidth, bezelMarginBottom, recessDepth * 2]} />
      </mesh>

      {/* Divider Bar between Header Sign and Flap Cells */}
      <mesh
        position={[0, boardHeight / 2 + 0.02, 0]}
        material={bezelTrimMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[boardWidth + 0.2, 0.14, recessDepth * 1.5]} />
      </mesh>

      {/* 5. Roof Hanger Rods extending into the shed ceiling (PRD §3.2) */}
      {[-boardWidth / 3, boardWidth / 3].map((x, idx) => (
        <mesh
          key={idx}
          position={[x, totalHeight / 2 + chassisCenterY + 2.5, -0.1]}
          castShadow
        >
          <cylinderGeometry args={[0.035, 0.035, 5, 12]} />
          <meshStandardMaterial color="#1a1420" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
