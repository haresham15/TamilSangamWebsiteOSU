"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * BlackboardEasel (§5 Item 2)
 *
 * Location: x = -7.92 (-1.2W), z = +3.30 (+0.5W), y = 0
 * Wooden artist/lecture easel with chalked slate blackboard:
 * - "ALL IS WELL"
 * - "வாங்க நண்பா"
 * - "Next meeting: Sun 5PM @ Ohio Union"
 * Strictly outside keep-out volume [X: -3.8 to 3.8, Y: 0 to 5.5, Z: -0.5 to 3.75].
 */
export function BlackboardEasel() {
  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#5C3A21", // Cedar easel frame
        roughness: 0.8,
        metalness: 0.05,
      }),
    []
  );

  // Procedural Chalkboard Texture
  const chalkTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Dark slate chalkboard background with chalk dust smear
    ctx.fillStyle = "#1E2722";
    ctx.fillRect(0, 0, 512, 512);

    // Chalk eraser smudges (deterministic)
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
      const rand1 = Math.abs(Math.sin(i * 12.9898 + 78.233));
      const rand2 = Math.abs(Math.cos(i * 43.123 + 19.456));
      const y = (rand1 - Math.floor(rand1)) * 512;
      const h = 10 + (rand2 - Math.floor(rand2)) * 30;
      ctx.fillRect(0, y, 512, h);
    }

    // Wooden border frame
    ctx.strokeStyle = "#4A2E1B";
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 498, 498);

    // Chalk heading
    ctx.fillStyle = "#F5F3E9";
    ctx.font = "bold 38px 'Anek Tamil', 'Halant', serif";
    ctx.textAlign = "center";
    ctx.fillText("ALL IS WELL", 256, 110);

    // Tamil greeting
    ctx.font = "bold 32px var(--font-tamil, 'Mukta Malar', sans-serif)";
    ctx.fillStyle = "#EAE6D2";
    ctx.fillText("வாங்க நண்பா", 256, 175);

    // Separator line
    ctx.strokeStyle = "rgba(245, 243, 233, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 210);
    ctx.lineTo(412, 210);
    ctx.stroke();

    // Meeting details
    ctx.font = "20px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#D6E5D8";
    ctx.fillText("Next Meeting:", 256, 260);

    ctx.font = "bold 22px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Sunday 5:00 PM", 256, 300);
    ctx.font = "18px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#BFD2C4";
    ctx.fillText("@ Ohio Union • Interfaith Rm", 256, 335);

    // Little chalk gear-train doodle (nod to engineering & windmill in film)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(256, 410, 26, 0, Math.PI * 2);
    ctx.stroke();

    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const gx = 256 + Math.cos(a) * 32;
      const gy = 410 + Math.sin(a) * 32;
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(gx - 3, gy - 3, 6, 6);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const boardMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: chalkTexture ?? undefined,
        roughness: 0.92,
        metalness: 0.05,
      }),
    [chalkTexture]
  );

  React.useEffect(() => {
    return () => {
      woodMaterial.dispose();
      chalkTexture?.dispose();
      boardMaterial.dispose();
    };
  }, [woodMaterial, chalkTexture, boardMaterial]);

  return (
    <group position={[-4.85, 0, 2.3]} rotation={[0, 0.32, 0]}>
      {/* Easel Tripod Legs */}
      {/* Front Left Leg */}
      <mesh position={[-0.45, 1.1, 0.18]} rotation={[0.15, 0, -0.12]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.06, 2.3, 0.06]} />
      </mesh>
      {/* Front Right Leg */}
      <mesh position={[0.45, 1.1, 0.18]} rotation={[0.15, 0, 0.12]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.06, 2.3, 0.06]} />
      </mesh>
      {/* Back Support Strut */}
      <mesh position={[0, 1.1, -0.55]} rotation={[-0.32, 0, 0]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.05, 2.3, 0.05]} />
      </mesh>

      {/* Horizontal Board Resting Rail */}
      <mesh position={[0, 0.9, 0.28]} material={woodMaterial} castShadow>
        <boxGeometry args={[1.4, 0.05, 0.1]} />
      </mesh>

      {/* Blackboard Slate */}
      <mesh position={[0, 1.48, 0.22]} rotation={[-0.15, 0, 0]} material={boardMaterial} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.1, 0.04]} />
      </mesh>
    </group>
  );
}
