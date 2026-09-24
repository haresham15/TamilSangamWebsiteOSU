"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// ---------------------------------------------------------------------------
// Procedural Textures for Leo / Naa Ready Factory
// ---------------------------------------------------------------------------

function createLeoBackWallTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Dark Weathered Factory Concrete Base
  ctx.fillStyle = "#121114";
  ctx.fillRect(0, 0, 2048, 1024);

  // Subtle brick pattern in background
  ctx.strokeStyle = "rgba(45, 38, 48, 0.4)";
  ctx.lineWidth = 1.5;
  const rowHeight = 28;
  const colWidth = 72;
  for (let y = 0; y < 1024; y += rowHeight) {
    const offset = (Math.floor(y / rowHeight) % 2) * (colWidth / 2);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
    for (let x = offset; x < 2048; x += colWidth) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rowHeight);
      ctx.stroke();
    }
  }

  // Grimy grunge and soot streaks
  for (let i = 0; i < 40; i++) {
    const sx = Math.random() * 2048;
    const grad = ctx.createLinearGradient(sx, 0, sx + (Math.random() - 0.5) * 60, 1024);
    grad.addColorStop(0, "rgba(8, 7, 10, 0.8)");
    grad.addColorStop(0.5, "rgba(25, 20, 18, 0.3)");
    grad.addColorStop(1, "rgba(10, 9, 12, 0.9)");
    ctx.fillStyle = grad;
    ctx.fillRect(sx, 0, 30 + Math.random() * 80, 1024);
  }

  // Rust drips from roof line
  for (let i = 0; i < 60; i++) {
    const rx = Math.random() * 2048;
    const rlen = 60 + Math.random() * 320;
    const rgrad = ctx.createLinearGradient(rx, 0, rx, rlen);
    rgrad.addColorStop(0, "rgba(160, 65, 20, 0.6)");
    rgrad.addColorStop(0.7, "rgba(90, 35, 12, 0.2)");
    rgrad.addColorStop(1, "transparent");
    ctx.fillStyle = rgrad;
    ctx.fillRect(rx, 0, 4 + Math.random() * 10, rlen);
  }

  // 2. Central Massive Leo Roaring Lion Emblem & Stencil Art
  const cx = 1024;
  const cy = 460;

  // Stenciled Roaring Lion Profile Silhouette
  ctx.save();
  ctx.fillStyle = "rgba(235, 180, 50, 0.22)";
  ctx.beginPath();
  // Lion head stylized outline
  ctx.arc(cx, cy - 40, 140, 0, Math.PI * 2);
  ctx.fill();

  // Lion Mane rays
  ctx.strokeStyle = "rgba(240, 185, 55, 0.28)";
  ctx.lineWidth = 6;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 140, cy - 40 + Math.sin(a) * 140);
    ctx.lineTo(cx + Math.cos(a) * 210, cy - 40 + Math.sin(a) * 210);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Stencil Typography: "LEO", "BLOODY SWEET", "NAA READY"
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Massive "LEO" Headline Stencil
  ctx.font = "900 130px 'Arial Black', sans-serif";
  ctx.fillStyle = "rgba(255, 215, 90, 0.35)";
  ctx.fillText("L E O", cx, cy - 50);

  // "BLOODY SWEET" Stamped in bold distress
  ctx.font = "bold 44px 'Courier New', monospace";
  ctx.fillStyle = "rgba(220, 45, 45, 0.55)";
  ctx.fillText("— BLOODY SWEET —", cx, cy + 50);

  // Bilingual "நான் ரெடி · NAA READY" Banner
  ctx.font = "bold 52px sans-serif";
  ctx.fillStyle = "rgba(255, 230, 160, 0.6)";
  ctx.fillText("நான் ரெடி  ·  NAA READY", cx, cy + 130);

  // Industrial Sub-text
  ctx.font = "bold 22px 'Courier New', monospace";
  ctx.fillStyle = "rgba(85, 204, 162, 0.65)";
  ctx.fillText("[ TAMIL SANGAM · HEAVY INDUSTRIAL UNIT 01 · COLUMBUS, OH ]", cx, cy + 200);

  // Factory Warning Hazard Banner across the bottom of the wall
  const hazardY = 960;
  const stripeW = 40;
  for (let x = 0; x < 2048; x += stripeW * 2) {
    ctx.fillStyle = "rgba(220, 160, 20, 0.45)";
    ctx.beginPath();
    ctx.moveTo(x, hazardY);
    ctx.lineTo(x + stripeW, hazardY);
    ctx.lineTo(x + stripeW * 2, 1024);
    ctx.lineTo(x + stripeW, 1024);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(15, 15, 18, 0.7)";
    ctx.beginPath();
    ctx.moveTo(x + stripeW, hazardY);
    ctx.lineTo(x + stripeW * 2, hazardY);
    ctx.lineTo(x + stripeW * 3, 1024);
    ctx.lineTo(x + stripeW * 2, 1024);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createFloorTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Weathered factory floor slab
  ctx.fillStyle = "#111014";
  ctx.fillRect(0, 0, 1024, 1024);

  // Large expansion joints (grid)
  ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 512, 512);
  ctx.strokeRect(512, 0, 512, 512);
  ctx.strokeRect(0, 512, 512, 512);
  ctx.strokeRect(512, 512, 512, 512);

  // Concrete speckling & oil stains
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const val = 15 + Math.floor(Math.random() * 25);
    ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Dark oil puddles
  for (let i = 0; i < 15; i++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    const r = 20 + Math.random() * 70;
    const pgrad = ctx.createRadialGradient(px, py, 5, px, py, r);
    pgrad.addColorStop(0, "rgba(5, 4, 6, 0.8)");
    pgrad.addColorStop(0.7, "rgba(10, 8, 12, 0.4)");
    pgrad.addColorStop(1, "transparent");
    ctx.fillStyle = pgrad;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

function createCrateTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Wood planks base
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(0, 0, 512, 512);

  // Planks
  const plankH = 512 / 6;
  ctx.strokeStyle = "#1a120b";
  ctx.lineWidth = 4;
  for (let i = 0; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * plankH);
    ctx.lineTo(512, i * plankH);
    ctx.stroke();
  }

  // Diagonal cross brace frame
  ctx.strokeStyle = "rgba(45, 30, 18, 0.9)";
  ctx.lineWidth = 28;
  ctx.strokeRect(14, 14, 484, 484);
  ctx.beginPath();
  ctx.moveTo(28, 28);
  ctx.lineTo(484, 484);
  ctx.stroke();

  // Stencil text
  ctx.save();
  ctx.fillStyle = "rgba(220, 190, 130, 0.75)";
  ctx.font = "bold 28px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("LEO DASS CO.", 256, 230);
  ctx.font = "bold 18px 'Courier New', monospace";
  ctx.fillText("ORDNANCE LOT #07", 256, 270);
  ctx.fillText("COLUMBUS · 2026", 256, 300);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// ---------------------------------------------------------------------------
// 3D Prop Components
// ---------------------------------------------------------------------------

// Sledgehammer (Vijay's signature weapon)
function Sledgehammer({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wooden handle with tape grip */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.05, 1.8, 16]} />
        <meshStandardMaterial color="#4a2e18" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Blackened grip tape wrap */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.6, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Heavy Steel Sledge Head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[0.42, 0.26, 0.26]} />
        <meshStandardMaterial color="#2d2d32" roughness={0.35} metalness={0.9} />
      </mesh>
      {/* Beveled strike faces */}
      <mesh position={[0.22, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.04, 16]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.25} metalness={0.95} />
      </mesh>
      <mesh position={[-0.22, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.04, 16]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.25} metalness={0.95} />
      </mesh>
    </group>
  );
}

// Curved Aruval / Machete Blade
function Machete({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wooden grip handle */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.5, 16]} />
        <meshStandardMaterial color="#2c1a0e" roughness={0.65} metalness={0.1} />
      </mesh>
      {/* Brass bolster ring */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.05, 16]} />
        <meshStandardMaterial color="#c59b27" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Heavy curved steel blade */}
      <mesh position={[0.06, 1.15, 0]} castShadow>
        <boxGeometry args={[0.12, 1.2, 0.018]} />
        <meshStandardMaterial color="#d4d4dc" roughness={0.2} metalness={0.96} />
      </mesh>
      {/* Sickle curved tip */}
      <mesh position={[0.12, 1.75, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <boxGeometry args={[0.11, 0.35, 0.018]} />
        <meshStandardMaterial color="#d4d4dc" roughness={0.2} metalness={0.96} />
      </mesh>
    </group>
  );
}

// 55-Gallon Steel Oil Barrel
function OilBarrel({
  position,
  rotation = [0, 0, 0],
  color = "#203a43",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.48, 1.7, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Reinforcing structural barrel rings */}
      <mesh position={[0, 0.45, 0]}>
        <torusGeometry args={[0.485, 0.02, 12, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <torusGeometry args={[0.485, 0.02, 12, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.8} />
      </mesh>
    </group>
  );
}

// Slatted Military Ordnance Crate
function WoodCrate({
  position,
  rotation = [0, 0, 0],
  texture,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  texture: THREE.CanvasTexture | null;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[1.3, 1.1, 1.3]} />
      <meshStandardMaterial
        color="#ffffff"
        map={texture || undefined}
        roughness={0.75}
        metalness={0.1}
      />
    </mesh>
  );
}

// Hanging Industrial Steel Chain with Hook
function HangingChain({
  position,
  length = 6,
}: {
  position: [number, number, number];
  length?: number;
}) {
  return (
    <group position={position}>
      {/* Vertical chain rod representation */}
      <mesh position={[0, -length / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.035, length, 12]} />
        <meshStandardMaterial color="#404048" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Forged steel hook at bottom */}
      <mesh position={[0, -length - 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.15, 0.035, 12, 24, Math.PI * 1.4]} />
        <meshStandardMaterial color="#2d2d35" roughness={0.25} metalness={0.95} />
      </mesh>
    </group>
  );
}

// Industrial Steel I-Beam Column
function IBeamColumn({
  position,
  height = 18,
}: {
  position: [number, number, number];
  height?: number;
}) {
  return (
    <group position={position}>
      {/* Web */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.08, height, 0.5]} />
        <meshStandardMaterial color="#252428" roughness={0.5} metalness={0.85} />
      </mesh>
      {/* Front Flange */}
      <mesh position={[0.2, height / 2, 0]}>
        <boxGeometry args={[0.08, height, 0.12]} />
        <meshStandardMaterial color="#302f35" roughness={0.45} metalness={0.9} />
      </mesh>
      {/* Back Flange */}
      <mesh position={[-0.2, height / 2, 0]}>
        <boxGeometry args={[0.08, height, 0.12]} />
        <meshStandardMaterial color="#302f35" roughness={0.45} metalness={0.9} />
      </mesh>
    </group>
  );
}

// Overhead Industrial Warehouse Pendant Lamp
function IndustrialPendantLamp({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Drop Cord */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 2.4, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Enamel Shade Shade */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.55, 0.35, 24, 1, true]} />
        <meshStandardMaterial color="#1e222d" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Glowing Tungsten Bulb */}
      <mesh position={[0, -0.08, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#FFB84D" />
      </mesh>
      <pointLight color="#FFA834" intensity={2.8} distance={10} decay={1.5} position={[0, -0.2, 0]} />
    </group>
  );
}

// Drifting Forge Sparks & Embers
function FactorySparks({ count = 120 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, speeds, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      spd[i] = 0.8 + Math.random() * 1.5;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, speeds: spd, phases: ph };
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Rise upward
      array[i * 3 + 1] += speeds[i] * delta;
      // Drift sideways
      array[i * 3] += Math.sin(array[i * 3 + 1] * 2.0 + phases[i]) * 0.015;

      // Loop back to ground when reaching ceiling
      if (array[i * 3 + 1] > 9.0) {
        array[i * 3 + 1] = 0.1;
        array[i * 3] = (Math.random() - 0.5) * 16;
        array[i * 3 + 2] = (Math.random() - 0.5) * 14;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#FFA500"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Main Leo Factory Environment Assembler
// ---------------------------------------------------------------------------

export function LeoFactoryEnvironment() {
  const backWallTexture = useMemo(() => createLeoBackWallTexture(), []);
  const floorTexture = useMemo(() => createFloorTexture(), []);
  const crateTexture = useMemo(() => createCrateTexture(), []);

  return (
    <group name="leo-factory-environment">
      {/* 1. Large Factory Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[38, 38]} />
        <meshStandardMaterial
          map={floorTexture || undefined}
          color="#222026"
          roughness={0.45}
          metalness={0.25}
        />
      </mesh>

      {/* 2. Enclosed Back Wall with Leo Stencil Mural & Corrugated Iron */}
      <mesh position={[0, 8.5, -12]} receiveShadow>
        <planeGeometry args={[36, 18]} />
        <meshStandardMaterial
          map={backWallTexture || undefined}
          color="#ffffff"
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Structural I-Beams on Back Wall */}
      <IBeamColumn position={[-14, 0, -11.9]} />
      <IBeamColumn position={[-7, 0, -11.9]} />
      <IBeamColumn position={[7, 0, -11.9]} />
      <IBeamColumn position={[14, 0, -11.9]} />

      {/* Horizontal Structural Catwalk Girder */}
      <mesh position={[0, 6.2, -11.7]}>
        <boxGeometry args={[36, 0.35, 0.4]} />
        <meshStandardMaterial color="#2d2c32" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* 3. Left Wall with Factory Windows & Amber Flood */}
      <mesh position={[-16, 8.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[32, 18]} />
        <meshStandardMaterial color="#1a1820" roughness={0.8} metalness={0.15} />
      </mesh>
      {/* Factory Window 1 (Left) */}
      <group position={[-15.8, 5.5, -4]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[5, 4]} />
          <meshBasicMaterial color="#FF9922" transparent opacity={0.3} />
        </mesh>
        <pointLight color="#FF9500" intensity={4.5} distance={16} decay={1.4} />
      </group>
      {/* Factory Window 2 (Left) */}
      <group position={[-15.8, 5.5, 4]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[5, 4]} />
          <meshBasicMaterial color="#FF9922" transparent opacity={0.3} />
        </mesh>
        <pointLight color="#FF9500" intensity={4.5} distance={16} decay={1.4} />
      </group>

      {/* 4. Right Wall */}
      <mesh position={[16, 8.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[32, 18]} />
        <meshStandardMaterial color="#1a1820" roughness={0.8} metalness={0.15} />
      </mesh>

      {/* 5. Overhead Roof Trusses across Ceiling */}
      {[-8, -2, 4, 10].map((zPos, idx) => (
        <group key={idx} position={[0, 12.5, zPos]}>
          {/* Main Cross Beam */}
          <mesh>
            <boxGeometry args={[34, 0.4, 0.4]} />
            <meshStandardMaterial color="#2a2830" roughness={0.5} metalness={0.85} />
          </mesh>
          {/* Angled Lattice Rafters */}
          <mesh position={[-8, 1.2, 0]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[10, 0.15, 0.15]} />
            <meshStandardMaterial color="#201f25" roughness={0.6} metalness={0.8} />
          </mesh>
          <mesh position={[8, 1.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <boxGeometry args={[10, 0.15, 0.15]} />
            <meshStandardMaterial color="#201f25" roughness={0.6} metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 6. Hanging Factory Pendant Cage Lamps */}
      <IndustrialPendantLamp position={[-4.5, 7.5, -3.5]} />
      <IndustrialPendantLamp position={[4.5, 7.5, -3.5]} />
      <IndustrialPendantLamp position={[-4.5, 7.5, 3.5]} />
      <IndustrialPendantLamp position={[4.5, 7.5, 3.5]} />

      {/* 7. Hanging Chains from Rafters */}
      <HangingChain position={[-3.8, 12, -3.0]} length={6.5} />
      <HangingChain position={[4.2, 12, -4.5]} length={7.2} />
      <HangingChain position={[5.0, 12, 2.5]} length={5.8} />

      {/* 8. Weapons & Props Flanking the Medallion */}
      {/* Sledgehammer #1: Leaning against barrel cluster on left */}
      <Sledgehammer position={[-3.2, 0, 1.4]} rotation={[0.2, 0.4, 0.22]} />

      {/* Sledgehammer #2: Resting on right crate */}
      <Sledgehammer position={[3.6, 0.65, -0.6]} rotation={[Math.PI / 2, 0, -0.4]} />

      {/* Machete #1: Stuck upright into heavy timber chopping block */}
      <group position={[-2.8, 0, -1.8]}>
        {/* Timber block */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.4, 0.7, 16]} />
          <meshStandardMaterial color="#301f14" roughness={0.85} />
        </mesh>
        {/* Machete embedded in block */}
        <Machete position={[0, 0.3, 0]} rotation={[0.08, 0.2, 0.05]} />
      </group>

      {/* Machete #2: Wall mounted on weapon rack at left wall */}
      <Machete position={[-15.6, 3.5, -1.5]} rotation={[0, Math.PI / 2, Math.PI / 3]} />
      <Machete position={[-15.6, 3.5, 0.5]} rotation={[0, Math.PI / 2, -Math.PI / 3]} />

      {/* Oil Barrels Cluster (Left) */}
      <OilBarrel position={[-4.2, 0, -1.2]} color="#1b3a4b" />
      <OilBarrel position={[-3.7, 0, -2.5]} color="#5a2214" />
      <OilBarrel position={[-4.8, 0, 0.8]} color="#2d3338" />

      {/* Oil Barrels (Right) */}
      <OilBarrel position={[4.5, 0, -1.5]} color="#5a2214" />
      <OilBarrel position={[4.1, 0, -2.8]} color="#1b3a4b" />

      {/* Wooden Ordnance Crates */}
      <WoodCrate position={[3.6, 0.55, -0.8]} texture={crateTexture} />
      <WoodCrate position={[4.8, 0.55, 0.6]} texture={crateTexture} />
      <WoodCrate position={[-4.6, 0.55, 2.2]} rotation={[0, 0.35, 0]} texture={crateTexture} />

      {/* 9. Upward Drifting Naa Ready Forge Sparks & Embers */}
      <FactorySparks count={140} />
    </group>
  );
}
