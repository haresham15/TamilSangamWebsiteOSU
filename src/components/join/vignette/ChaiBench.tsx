"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * ChaiBench (§5 Item 1 & 14)
 *
 * Location: x = +7.26 (+1.1W), z = +3.96 (+0.6W), y = 0
 * 3 chai tumblers in brass davaras + 1 empty 4th tumbler with tag "வாங்க நண்பா"
 * + Buckeye nut resting on bench armrest.
 * Strictly outside keep-out volume [X: -3.8 to 3.8, Y: 0 to 5.5, Z: -0.5 to 3.75].
 */
export function ChaiBench() {
  // 1. Bench Materials
  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#724828", // Rich warm teak wood slats
        roughness: 0.62,
        metalness: 0.05,
      }),
    []
  );

  const ironLegMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#181818",
        roughness: 0.45,
        metalness: 0.8,
      }),
    []
  );

  // 2. Tumbler & Davara Metals
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#E5B83B", // Glowing temple brass
        roughness: 0.22,
        metalness: 0.95,
      }),
    []
  );

  const steelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#F1F5F9", // Bright polished stainless steel
        roughness: 0.16,
        metalness: 0.98,
      }),
    []
  );

  const buckeyeNutMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3B1E08", // Glossy mahogany buckeye shell
        roughness: 0.25,
        metalness: 0.1,
      }),
    []
  );

  const buckeyeEyeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D2B48C", // Tan circular eye spot
        roughness: 0.65,
        metalness: 0.0,
      }),
    []
  );

  // 3. Tag Canvas Texture ("வாங்க நண்பா")
  const tagTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Kraft paper background
    ctx.fillStyle = "#D7B58D";
    ctx.fillRect(0, 0, 256, 128);

    // Subtle kraft paper border
    ctx.strokeStyle = "#8C6239";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 120);

    // Tamil text
    ctx.fillStyle = "#2D1A0E";
    ctx.font = "bold 26px var(--font-tamil, 'Mukta Malar', sans-serif)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("வாங்க நண்பா", 128, 52);

    ctx.font = "italic 16px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#5A381E";
    ctx.fillText("Join Us • OSU TS", 128, 92);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const tagMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: tagTexture ?? undefined,
        roughness: 0.8,
        metalness: 0.05,
        side: THREE.DoubleSide,
      }),
    [tagTexture]
  );

  React.useEffect(() => {
    return () => {
      woodMaterial.dispose();
      ironLegMaterial.dispose();
      brassMaterial.dispose();
      steelMaterial.dispose();
      buckeyeNutMaterial.dispose();
      buckeyeEyeMaterial.dispose();
      tagTexture?.dispose();
      tagMaterial.dispose();
    };
  }, [
    woodMaterial,
    ironLegMaterial,
    brassMaterial,
    steelMaterial,
    buckeyeNutMaterial,
    buckeyeEyeMaterial,
    tagTexture,
    tagMaterial,
  ]);

  return (
    <group position={[4.85, 0, 1.4]} rotation={[0, -1.45, 0]}>
      {/* Bench Cast-Iron Legs */}
      <mesh position={[-1.2, 0.42, 0]} material={ironLegMaterial} castShadow>
        <boxGeometry args={[0.08, 0.84, 0.7]} />
      </mesh>
      <mesh position={[1.2, 0.42, 0]} material={ironLegMaterial} castShadow>
        <boxGeometry args={[0.08, 0.84, 0.7]} />
      </mesh>

      {/* Bench Armrests */}
      <mesh position={[-1.2, 0.75, 0]} material={ironLegMaterial}>
        <boxGeometry args={[0.1, 0.06, 0.76]} />
      </mesh>
      <mesh position={[1.2, 0.75, 0]} material={ironLegMaterial}>
        <boxGeometry args={[0.1, 0.06, 0.76]} />
      </mesh>

      {/* Ohio Buckeye Nut resting on left armrest (§5 Item 14) */}
      <group position={[-1.2, 0.82, 0.15]} rotation={[0.2, 0.4, 0]}>
        <mesh material={buckeyeNutMaterial} castShadow>
          <sphereGeometry args={[0.055, 16, 16]} />
        </mesh>
        <mesh position={[0, 0.025, 0.035]} rotation={[0.4, 0, 0]} material={buckeyeEyeMaterial}>
          <circleGeometry args={[0.032, 16]} />
        </mesh>
      </group>

      {/* Bench Seat Slats */}
      {[-0.22, -0.07, 0.08, 0.23].map((zPos, idx) => (
        <mesh key={idx} position={[0, 0.48, zPos]} material={woodMaterial} castShadow receiveShadow>
          <boxGeometry args={[2.55, 0.04, 0.12]} />
        </mesh>
      ))}

      {/* Bench Backrest Slats */}
      {[0.65, 0.82, 0.99].map((yPos, idx) => (
        <mesh key={idx} position={[0, yPos, -0.32]} material={woodMaterial} castShadow>
          <boxGeometry args={[2.55, 0.12, 0.04]} />
        </mesh>
      ))}

      {/* ================================================================= */}
      {/* 4 Chai Tumblers in Davaras (§5 Item 1)                            */}
      {/* Three full tumblers (for the three friends), 4th empty with tag   */}
      {/* ================================================================= */}
      {[-0.65, -0.25, 0.15].map((xOffset, idx) => (
        <group key={idx} position={[xOffset, 0.50, 0.05]}>
          {/* Davara Saucer Cup */}
          <mesh material={brassMaterial} castShadow>
            <cylinderGeometry args={[0.12, 0.085, 0.065, 24]} />
          </mesh>
          {/* Chai Tumbler */}
          <mesh position={[0, 0.085, 0]} material={steelMaterial} castShadow>
            <cylinderGeometry args={[0.078, 0.058, 0.155, 24]} />
          </mesh>
          {/* Warm Chai Liquid Inside */}
          <mesh position={[0, 0.15, 0]}>
            <circleGeometry args={[0.072, 24]} />
            <meshStandardMaterial color="#8B4513" roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* 4th Empty Tumbler on the right waiting for the new student */}
      <group position={[0.65, 0.50, 0.05]}>
        {/* Davara */}
        <mesh material={brassMaterial} castShadow>
          <cylinderGeometry args={[0.12, 0.085, 0.065, 24]} />
        </mesh>
        {/* Empty Tumbler */}
        <mesh position={[0, 0.085, 0]} material={steelMaterial} castShadow>
          <cylinderGeometry args={[0.078, 0.058, 0.155, 24]} />
        </mesh>
        {/* Luggage Tag with twine: "வாங்க நண்பா" standing upright facing camera */}
        <group position={[0.10, 0.14, 0.08]} rotation={[0.2, -0.35, 0.08]}>
          <mesh material={tagMaterial} castShadow>
            <planeGeometry args={[0.20, 0.10]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
