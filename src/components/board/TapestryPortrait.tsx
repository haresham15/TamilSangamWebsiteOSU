"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { BoardMember } from "@/data/board";
import { noise1D } from "./noise";

interface TapestryPortraitProps {
  member: BoardMember;
  position: [number, number, number];
  rotation?: [number, number, number];
  isLeftAisle?: boolean;
}

/**
 * Generates an authentic Kanchipuram / Chola Darbar Royal Silk Tapestry Texture.
 * Bakes deep maroon silk (#6B1420), ornate 24K gold filigree borders (#C9A227),
 * the member's portrait, and bilingual cultural typography.
 */
function createTapestryTexture(member: BoardMember): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const width = 512;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Deep Maroon / Crimson Raw Silk Ground (#6B1420)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, "#4a0b14");
  bgGrad.addColorStop(0.3, "#6b1420");
  bgGrad.addColorStop(0.8, "#521019");
  bgGrad.addColorStop(1, "#36080d");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Silk fabric subtle vertical weft threads
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 1;
  for (let x = 6; x < width; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // 2. Ornate 24K Gold Zari Border (#C9A227)
  const borderWidth = 28;
  ctx.strokeStyle = "#C9A227";
  ctx.lineWidth = 4;
  ctx.strokeRect(borderWidth, borderWidth, width - borderWidth * 2, height - borderWidth * 2);

  // Secondary inner filigree line
  ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(borderWidth + 8, borderWidth + 8, width - (borderWidth + 8) * 2, height - (borderWidth + 8) * 2);

  // Corner Dravidian temple motifs
  const drawCornerKalasam = (cx: number, cy: number) => {
    ctx.save();
    ctx.fillStyle = "#D4AF37";
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8A6D1C";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };
  drawCornerKalasam(borderWidth + 4, borderWidth + 4);
  drawCornerKalasam(width - borderWidth - 4, borderWidth + 4);
  drawCornerKalasam(borderWidth + 4, height - borderWidth - 4);
  drawCornerKalasam(width - borderWidth - 4, height - borderWidth - 4);

  // 3. Top Header: Chola Dynasty Sun Crest & Tiger Glyph
  ctx.textAlign = "center";
  ctx.fillStyle = "#D4AF37";
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillText("✦ CHOLA DARBAR · சோழர் அவை ✦", width / 2, 75);

  ctx.fillStyle = "rgba(201, 162, 39, 0.75)";
  ctx.font = "12px monospace";
  ctx.fillText(`EXECUTIVE COMMITTEE · ${member.term}`, width / 2, 100);

  // 4. Portrait Framing Medallion (Center)
  const photoCenterX = width / 2;
  const photoCenterY = 320;
  const photoRadius = 145;

  // Gold beaded medallion ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoRadius + 6, 0, Math.PI * 2);
  ctx.fillStyle = "#1e060a";
  ctx.fill();
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 5;
  ctx.stroke();

  // Medallion inner glow
  const medalGrad = ctx.createRadialGradient(
    photoCenterX,
    photoCenterY,
    10,
    photoCenterX,
    photoCenterY,
    photoRadius
  );
  medalGrad.addColorStop(0, "#3d0b13");
  medalGrad.addColorStop(1, "#180407");
  ctx.fillStyle = medalGrad;
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
  ctx.fill();

  // Royal Chola Tiger Crest Silhouette inside medallion
  ctx.fillStyle = "#D4AF37";
  ctx.font = "bold 88px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("🐅", photoCenterX, photoCenterY - 10);

  // Subtle name initial watermark behind tiger
  ctx.fillStyle = "rgba(212, 175, 55, 0.25)";
  ctx.font = "bold 64px 'Anek Tamil', serif";
  ctx.fillText(member.nameEn.charAt(0), photoCenterX, photoCenterY + 70);
  ctx.restore();

  // 5. Bilingual Typography Roster Lockup
  ctx.textAlign = "center";

  // English Name (Bold Display Serif)
  ctx.fillStyle = "#FFF6E5";
  ctx.font = "bold 32px 'Anek Tamil', 'Halant', serif";
  ctx.fillText(member.nameEn, width / 2, 530);

  // Tamil Name
  ctx.fillStyle = "#F5C242";
  ctx.font = "bold 26px 'Mukta Malar', sans-serif";
  ctx.fillText(member.nameTa, width / 2, 575);

  // Role Pill
  const roleText = `${member.roleEn.toUpperCase()} · ${member.roleTa}`;
  ctx.font = "bold 15px monospace";
  const pillW = Math.min(width - 80, ctx.measureText(roleText).width + 36);
  ctx.fillStyle = "rgba(20, 4, 7, 0.85)";
  ctx.strokeStyle = "#C9A227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(width / 2 - pillW / 2, 615, pillW, 36, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FFE7A3";
  ctx.fillText(roleText, width / 2, 638);

  // Committee Department
  ctx.fillStyle = "rgba(255, 235, 195, 0.7)";
  ctx.font = "14px 'Mukta Malar', sans-serif";
  const words = member.committeeEn.split(" ");
  if (words.length > 3) {
    const line1 = words.slice(0, 3).join(" ");
    const line2 = words.slice(3).join(" ");
    ctx.fillText(line1, width / 2, 685);
    ctx.fillText(line2, width / 2, 708);
  } else {
    ctx.fillText(member.committeeEn, width / 2, 690);
  }

  // Quote / Chola Motto
  ctx.fillStyle = "#D4AF37";
  ctx.font = "italic 13px 'Mukta Malar', serif";
  ctx.fillText(`“${member.quote}”`, width / 2, 760);

  // Hanging tassel fringe at bottom
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(borderWidth, height - borderWidth - 20);
  ctx.lineTo(width - borderWidth, height - borderWidth - 20);
  ctx.stroke();

  for (let t = borderWidth + 10; t < width - borderWidth; t += 20) {
    ctx.beginPath();
    ctx.moveTo(t, height - borderWidth - 20);
    ctx.lineTo(t, height - borderWidth + 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(t, height - borderWidth + 14, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#F5C242";
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  return texture;
}

/**
 * §4: Physical Cloth Wind Shader Plane per Board Member
 * Features layered sine ripple vertex displacement modulated by an organic gust envelope.
 */
export function TapestryPortrait({
  member,
  position,
  rotation = [0, 0, 0],
  isLeftAisle = false,
}: TapestryPortraitProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniformsRef = useRef<{
    uTime: { value: number };
    uGustIntensity: { value: number };
  }>({
    uTime: { value: 0 },
    uGustIntensity: { value: 0.3 },
  });

  const texture = useMemo(() => createTapestryTexture(member), [member]);

  const tapestryMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.75,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniformsRef.current.uTime;
      shader.uniforms.uGustIntensity = uniformsRef.current.uGustIntensity;

      // Inject uniforms
      shader.vertexShader =
        `
        uniform float uTime;
        uniform float uGustIntensity;
        ` + shader.vertexShader;

      // Inject exact §4 GLSL cloth wind equation
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>

        // Ripples travel down the fabric from top rod
        float heightPhase = position.y * 0.8;
        float wave1 = sin(uTime * 1.1 + heightPhase) * 0.035;
        float wave2 = sin(uTime * 2.3 + heightPhase * 1.7 + 1.5) * 0.018;
        float sway = (wave1 + wave2) * uGustIntensity;

        // Pinned at rod (top y = +1.0), free sway at bottom (y = -1.0)
        float pinFactor = smoothstep(1.0, 0.0, (position.y + 1.0) / 2.0);
        transformed.x += sway * pinFactor;
        transformed.z += sway * 0.4 * pinFactor;
        `
      );
    };

    return mat;
  }, [texture]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    uniformsRef.current.uTime.value = time;

    // Modulate gust intensity via slow Perlin/simplex noise drift (§4: uTime * 0.15)
    const gustEnvelope = 0.32 + 0.25 * noise1D(time * 0.15 + (isLeftAisle ? 1.4 : 5.8));
    uniformsRef.current.uGustIntensity.value = Math.max(0.1, gustEnvelope);
  });

  return (
    <group position={position} rotation={rotation}>
      {/* ========================================================================= */}
      {/* 1. HORIZONTAL BRASS SUSPENSION ROD & FINIALS                              */}
      {/* ========================================================================= */}
      <mesh position={[0, 1.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 1.4, 12]} />
        <meshStandardMaterial color="#8A6D1C" roughness={0.4} metalness={0.85} />
      </mesh>
      {/* Left Finial */}
      <mesh position={[-0.72, 1.08, 0]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Right Finial */}
      <mesh position={[0.72, 1.08, 0]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Hanging Support Cords */}
      <mesh position={[-0.5, 1.35, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.55, 8]} />
        <meshBasicMaterial color="#3d2714" />
      </mesh>
      <mesh position={[0.5, 1.35, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.55, 8]} />
        <meshBasicMaterial color="#3d2714" />
      </mesh>

      {/* ========================================================================= */}
      {/* 2. CLOTH WIND SHADER PLANE (50x50 Subdivisions for Fluid Waves)           */}
      {/* ========================================================================= */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        material={tapestryMaterial}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[1.2, 2.1, 48, 48]} />
      </mesh>
    </group>
  );
}
