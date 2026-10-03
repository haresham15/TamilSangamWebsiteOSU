"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * CampusProps (§5 Items 3, 4, 5, 12)
 *
 * 1. Mortarboard + rolled diploma with purple & mint tassel perched naturally on left pillar finial
 * 2. Fabric Bunting Pennant Garland suspended gracefully across gate transom
 * 3. Vintage Raleigh/Hercules style campus roadster bicycle parked on kickstand by the left curb
 * 4. Distant campus rooftop water tank silhouette with morning birds in distant fog
 * Strictly outside keep-out volume [X: -3.8 to 3.8, Y: 0 to 5.5, Z: -0.5 to 3.75].
 */
export function CampusProps() {
  // 1. Mortarboard & Diploma Materials
  const capBlackMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#18181A",
        roughness: 0.85,
        metalness: 0.05,
      }),
    []
  );

  const parchmentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FAF5E6", // Aged rolled diploma scroll
        roughness: 0.7,
        metalness: 0.0,
      }),
    []
  );

  const ribbonRedMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#8B1E1E", // Silk crimson ribbon
        roughness: 0.4,
        metalness: 0.1,
      }),
    []
  );

  const tasselMintMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#55CCA2", // Club mint token
        roughness: 0.5,
        metalness: 0.1,
      }),
    []
  );

  const tasselPurpleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#6B3BA7", // Club purple token
        roughness: 0.5,
        metalness: 0.1,
      }),
    []
  );

  // 2. Vintage Bicycle Materials (Collegiate Racing Green & Polished Chrome)
  const bikeFrameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1E3B33", // Vintage British racing green
        roughness: 0.35,
        metalness: 0.65,
      }),
    []
  );

  const rubberTireMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1A1A1A", // Vulcanized black rubber
        roughness: 0.92,
        metalness: 0.05,
      }),
    []
  );

  const bikeChromeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#E2E8F0", // Polished silver chrome
        roughness: 0.18,
        metalness: 0.95,
      }),
    []
  );

  const leatherSaddleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#4A2E1B", // Saddle brown leather
        roughness: 0.65,
        metalness: 0.08,
      }),
    []
  );

  const ropeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C49A45", // Natural golden jute twine
        roughness: 0.8,
        metalness: 0.1,
      }),
    []
  );

  // 3. Distant Silhouette Material
  const silhouetteMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#B4A998",
        fog: true,
      }),
    []
  );

  // 4. Bunting Pennant Materials (Flat 2D cloth flags)
  const buntingMaterials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: "#6B3BA7", roughness: 0.65, side: THREE.DoubleSide }), // Purple
      new THREE.MeshStandardMaterial({ color: "#55CCA2", roughness: 0.65, side: THREE.DoubleSide }), // Mint
      new THREE.MeshStandardMaterial({ color: "#C49A45", roughness: 0.65, side: THREE.DoubleSide }), // Gold
      new THREE.MeshStandardMaterial({ color: "#8B261E", roughness: 0.65, side: THREE.DoubleSide }), // Terracotta
    ],
    []
  );

  // Pennant Triangle Geometry (Base at top, apex pointing down)
  const pennantGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const w = 0.13;
    const h = 0.16;
    const positions = new Float32Array([
      -w / 2, 0, 0,
      w / 2, 0, 0,
      0, -h, 0,
    ]);
    const uvs = new Float32Array([0, 1, 1, 1, 0.5, 0]);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  }, []);

  React.useEffect(() => {
    return () => {
      capBlackMaterial.dispose();
      parchmentMaterial.dispose();
      ribbonRedMaterial.dispose();
      tasselMintMaterial.dispose();
      tasselPurpleMaterial.dispose();
      bikeFrameMaterial.dispose();
      rubberTireMaterial.dispose();
      bikeChromeMaterial.dispose();
      leatherSaddleMaterial.dispose();
      ropeMaterial.dispose();
      silhouetteMaterial.dispose();
      buntingMaterials.forEach((m) => m.dispose());
      pennantGeometry.dispose();
    };
  }, [
    capBlackMaterial,
    parchmentMaterial,
    ribbonRedMaterial,
    tasselMintMaterial,
    tasselPurpleMaterial,
    bikeFrameMaterial,
    rubberTireMaterial,
    bikeChromeMaterial,
    leatherSaddleMaterial,
    ropeMaterial,
    silhouetteMaterial,
    buntingMaterials,
    pennantGeometry,
  ]);

  // Two symmetrical festive swags flanking the central bronze plaque (leaving plaque 100% unobstructed)
  const leftCatenaryPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 5;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = -3.25 + t * 1.30;
      const u = t * 2 - 1;
      const sagY = 5.38 + 0.18 * (u * u);
      pts.push(new THREE.Vector3(x, sagY, 0.18));
    }
    return pts;
  }, []);

  const rightCatenaryPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 5;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = 1.95 + t * 1.30;
      const u = t * 2 - 1;
      const sagY = 5.38 + 0.18 * (u * u);
      pts.push(new THREE.Vector3(x, sagY, 0.18));
    }
    return pts;
  }, []);

  const swags = useMemo(() => [leftCatenaryPoints, rightCatenaryPoints], [leftCatenaryPoints, rightCatenaryPoints]);

  return (
    <group>
      {/* =================================================================== */}
      {/* 1. Mortarboard + Scroll on Left Pillar Finial (§5 Item 4)           */}
      {/* Pillar ball finial top is at y = 5.91, x = -3.85, z = 0             */}
      {/* =================================================================== */}
      <group position={[-3.85, 5.91, 0.02]} rotation={[-0.08, 0.32, 0.06]}>
        {/* Skull Cap Base */}
        <mesh position={[0, 0.03, 0]} material={capBlackMaterial}>
          <cylinderGeometry args={[0.15, 0.18, 0.07, 16]} />
        </mesh>
        {/* Square Mortarboard */}
        <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} material={capBlackMaterial} castShadow>
          <boxGeometry args={[0.48, 0.48, 0.016]} />
        </mesh>
        {/* Center Button */}
        <mesh position={[0, 0.085, 0]} material={capBlackMaterial}>
          <sphereGeometry args={[0.018, 12, 12]} />
        </mesh>
        {/* Draped Silk Tassels (Mint & Purple) */}
        <mesh position={[0.16, 0.01, 0.18]} rotation={[0.3, 0, -0.4]} material={tasselMintMaterial}>
          <cylinderGeometry args={[0.008, 0.02, 0.18, 12]} />
        </mesh>
        <mesh position={[0.17, 0.01, 0.19]} rotation={[0.3, 0, -0.4]} material={tasselPurpleMaterial}>
          <cylinderGeometry args={[0.008, 0.02, 0.18, 12]} />
        </mesh>

        {/* Rolled Diploma Parchment tied with Crimson Ribbon */}
        <group position={[-0.10, 0.10, -0.06]} rotation={[0.1, 0.75, -0.15]}>
          <mesh material={parchmentMaterial} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.38, 16]} />
          </mesh>
          {/* Ribbon Tie */}
          <mesh material={ribbonRedMaterial}>
            <cylinderGeometry args={[0.032, 0.032, 0.04, 16]} />
          </mesh>
        </group>
      </group>

      {/* =================================================================== */}
      {/* 2. Fabric Bunting Pennant Garlands flanking Upper Gateway (§5 Item 5) */}
      {/* Suspended in twin swags flanking the central bronze plaque          */}
      {/* =================================================================== */}
      <group>
        {swags.map((pts, swagIdx) => (
          <group key={`swag-${swagIdx}`}>
            {/* Connecting Twine */}
            {pts.slice(0, -1).map((pt, i) => {
              const nextPt = pts[i + 1];
              const midX = (pt.x + nextPt.x) / 2;
              const midY = (pt.y + nextPt.y) / 2;
              const midZ = (pt.z + nextPt.z) / 2;
              const dx = nextPt.x - pt.x;
              const dy = nextPt.y - pt.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);
              return (
                <mesh
                  key={`string-${swagIdx}-${i}`}
                  position={[midX, midY, midZ]}
                  rotation={[0, 0, angle]}
                  material={ropeMaterial}
                >
                  <cylinderGeometry args={[0.005, 0.005, len, 6]} />
                </mesh>
              );
            })}

            {/* Flat Cloth Pennants hanging DOWN from the twine */}
            {pts.slice(1, -1).map((pt, idx) => {
              const mat = buntingMaterials[(swagIdx * 2 + idx) % buntingMaterials.length];
              const windFlutter = 0.12 * Math.sin(idx * 1.8 + swagIdx);
              return (
                <mesh
                  key={`pennant-${swagIdx}-${idx}`}
                  position={[pt.x, pt.y, pt.z]}
                  rotation={[windFlutter, 0, 0]}
                  geometry={pennantGeometry}
                  material={mat}
                  castShadow
                />
              );
            })}
          </group>
        ))}
      </group>

      {/* =================================================================== */}
      {/* 3. Vintage Campus Roadster Bicycle on Kickstand (§5 Item 12)       */}
      {/* Location: x = -5.40, y = 0, z = 0.3 (by the left curb)              */}
      {/* Complete architectural geometry: Wheels, spokes, frame, fork,       */}
      {/* handlebars, leather saddle, pedals & kickstand                      */}
      {/* =================================================================== */}
      <group position={[-5.40, 0, 0.3]} rotation={[0, 0.22, 0.08]}>
        {/* --- REAR WHEEL (Axle at x = -0.51, y = 0.35) --- */}
        <group position={[-0.51, 0.35, 0]}>
          {/* Tire */}
          <mesh material={rubberTireMaterial} castShadow>
            <torusGeometry args={[0.35, 0.024, 12, 32]} />
          </mesh>
          {/* Metal Rim */}
          <mesh material={bikeChromeMaterial}>
            <torusGeometry args={[0.33, 0.012, 8, 32]} />
          </mesh>
          {/* Hub */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={bikeChromeMaterial}>
            <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
          </mesh>
          {/* Wheel Spokes (4 double-ended crossing cylinders) */}
          {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((ang, i) => (
            <mesh key={`spoke-r-${i}`} rotation={[0, 0, ang]} material={bikeChromeMaterial}>
              <cylinderGeometry args={[0.003, 0.003, 0.66, 4]} />
            </mesh>
          ))}
          {/* Rear Cog / Sprocket */}
          <mesh position={[0, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]} material={bikeChromeMaterial}>
            <cylinderGeometry args={[0.04, 0.04, 0.008, 16]} />
          </mesh>
        </group>

        {/* --- FRONT WHEEL (Axle at x = 0.51, y = 0.35) --- */}
        <group position={[0.51, 0.35, 0]}>
          {/* Tire */}
          <mesh material={rubberTireMaterial} castShadow>
            <torusGeometry args={[0.35, 0.024, 12, 32]} />
          </mesh>
          {/* Metal Rim */}
          <mesh material={bikeChromeMaterial}>
            <torusGeometry args={[0.33, 0.012, 8, 32]} />
          </mesh>
          {/* Hub */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={bikeChromeMaterial}>
            <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
          </mesh>
          {/* Wheel Spokes */}
          {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((ang, i) => (
            <mesh key={`spoke-f-${i}`} rotation={[0, 0, ang]} material={bikeChromeMaterial}>
              <cylinderGeometry args={[0.003, 0.003, 0.66, 4]} />
            </mesh>
          ))}
        </group>

        {/* --- BOTTOM BRACKET & CRANKSET (x = -0.06, y = 0.28) --- */}
        <group position={[-0.06, 0.28, 0]}>
          {/* BB Shell */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={bikeFrameMaterial}>
            <cylinderGeometry args={[0.024, 0.024, 0.08, 12]} />
          </mesh>
          {/* Chrome Chainring */}
          <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]} material={bikeChromeMaterial}>
            <cylinderGeometry args={[0.075, 0.075, 0.008, 24]} />
          </mesh>
          {/* Crank Arms & Pedals */}
          <mesh position={[0.06, 0.06, 0.05]} rotation={[0, 0, Math.PI / 4]} material={bikeChromeMaterial}>
            <boxGeometry args={[0.14, 0.015, 0.012]} />
          </mesh>
          <mesh position={[0.11, 0.11, 0.065]} material={rubberTireMaterial}>
            <boxGeometry args={[0.05, 0.02, 0.06]} />
          </mesh>
          <mesh position={[-0.06, -0.06, -0.05]} rotation={[0, 0, Math.PI / 4]} material={bikeChromeMaterial}>
            <boxGeometry args={[0.14, 0.015, 0.012]} />
          </mesh>
          <mesh position={[-0.11, -0.11, -0.065]} material={rubberTireMaterial}>
            <boxGeometry args={[0.05, 0.02, 0.06]} />
          </mesh>
        </group>

        {/* --- DIAMOND FRAME TUBES (Collegiate Racing Green) --- */}
        {/* 1. Seat Tube: BB (-0.06, 0.28) to Seat Lug (-0.20, 0.76) */}
        <mesh position={[-0.13, 0.52, 0]} rotation={[0, 0, -0.28]} material={bikeFrameMaterial} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.50, 12]} />
        </mesh>

        {/* 2. Top Tube: Seat Lug (-0.20, 0.76) to Head Tube Top (0.36, 0.86) */}
        <mesh position={[0.08, 0.81, 0]} rotation={[0, 0, 0.18]} material={bikeFrameMaterial} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.57, 12]} />
        </mesh>

        {/* 3. Down Tube: Head Tube Bot (0.40, 0.68) to BB (-0.06, 0.28) */}
        <mesh position={[0.17, 0.48, 0]} rotation={[0, 0, 0.85]} material={bikeFrameMaterial} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.61, 12]} />
        </mesh>

        {/* 4. Head Tube: between (0.40, 0.68) and (0.36, 0.86) */}
        <mesh position={[0.38, 0.77, 0]} rotation={[0, 0, -0.22]} material={bikeFrameMaterial}>
          <cylinderGeometry args={[0.022, 0.022, 0.19, 12]} />
        </mesh>

        {/* 5. Twin Seat Stays: Seat Lug (-0.20, 0.76) to Rear Axle (-0.51, 0.35, +/-0.035) */}
        <mesh position={[-0.355, 0.555, 0.035]} rotation={[0, 0, -0.64]} material={bikeFrameMaterial} castShadow>
          <cylinderGeometry args={[0.010, 0.010, 0.51, 8]} />
        </mesh>
        <mesh position={[-0.355, 0.555, -0.035]} rotation={[0, 0, -0.64]} material={bikeFrameMaterial} castShadow>
          <cylinderGeometry args={[0.010, 0.010, 0.51, 8]} />
        </mesh>

        {/* 6. Twin Chain Stays: BB (-0.06, 0.28) to Rear Axle (-0.51, 0.35, +/-0.035) */}
        <mesh position={[-0.285, 0.315, 0.035]} rotation={[0, 0, 0.16]} material={bikeFrameMaterial} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.46, 8]} />
        </mesh>
        <mesh position={[-0.285, 0.315, -0.035]} rotation={[0, 0, 0.16]} material={bikeFrameMaterial} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.46, 8]} />
        </mesh>

        {/* 7. Twin Front Fork Blades: Head Tube Bot (0.40, 0.68) to Front Axle (0.51, 0.35, +/-0.035) */}
        <mesh position={[0.455, 0.515, 0.035]} rotation={[0, 0, 0.32]} material={bikeChromeMaterial} castShadow>
          <cylinderGeometry args={[0.013, 0.010, 0.36, 8]} />
        </mesh>
        <mesh position={[0.455, 0.515, -0.035]} rotation={[0, 0, 0.32]} material={bikeChromeMaterial} castShadow>
          <cylinderGeometry args={[0.013, 0.010, 0.36, 8]} />
        </mesh>

        {/* --- SADDLE & SEAT POST --- */}
        {/* Chrome Seat Post */}
        <mesh position={[-0.21, 0.81, 0]} material={bikeChromeMaterial}>
          <cylinderGeometry args={[0.014, 0.014, 0.12, 12]} />
        </mesh>
        {/* Brooks-Style Leather Saddle */}
        <group position={[-0.21, 0.87, 0]} rotation={[0, 0, 0.05]}>
          {/* Main Leather Top */}
          <mesh material={leatherSaddleMaterial} castShadow>
            <boxGeometry args={[0.24, 0.045, 0.16]} />
          </mesh>
          {/* Saddle Nose */}
          <mesh position={[0.10, -0.01, 0]} material={leatherSaddleMaterial}>
            <boxGeometry args={[0.08, 0.035, 0.06]} />
          </mesh>
        </group>

        {/* --- HANDLEBARS & STEM --- */}
        {/* Stem Quill */}
        <mesh position={[0.36, 0.92, 0]} material={bikeChromeMaterial}>
          <cylinderGeometry args={[0.014, 0.014, 0.12, 12]} />
        </mesh>
        {/* Forward Extension */}
        <mesh position={[0.41, 0.96, 0]} rotation={[0, 0, Math.PI / 2]} material={bikeChromeMaterial}>
          <cylinderGeometry args={[0.013, 0.013, 0.09, 12]} />
        </mesh>
        {/* Swept-Back Handlebars */}
        <mesh position={[0.43, 0.96, 0]} rotation={[Math.PI / 2, 0, 0]} material={bikeChromeMaterial}>
          <cylinderGeometry args={[0.012, 0.012, 0.46, 12]} />
        </mesh>
        {/* Rubber Grips */}
        {[-0.20, 0.20].map((zGrip, i) => (
          <mesh key={`grip-${i}`} position={[0.43, 0.96, zGrip]} rotation={[Math.PI / 2, 0, 0]} material={rubberTireMaterial}>
            <cylinderGeometry args={[0.016, 0.016, 0.09, 12]} />
          </mesh>
        ))}
        {/* Vintage Chrome Bell on Left Bar */}
        <mesh position={[0.42, 0.985, 0.14]} material={bikeChromeMaterial}>
          <sphereGeometry args={[0.022, 12, 12]} />
        </mesh>

        {/* --- REAR CARRIER RACK --- */}
        <mesh position={[-0.42, 0.68, 0]} material={bikeChromeMaterial}>
          <boxGeometry args={[0.28, 0.015, 0.14]} />
        </mesh>
        <mesh position={[-0.42, 0.52, 0.05]} rotation={[0, 0, 0.2]} material={bikeChromeMaterial}>
          <cylinderGeometry args={[0.006, 0.006, 0.34, 6]} />
        </mesh>
        <mesh position={[-0.42, 0.52, -0.05]} rotation={[0, 0, 0.2]} material={bikeChromeMaterial}>
          <cylinderGeometry args={[0.006, 0.006, 0.34, 6]} />
        </mesh>

        {/* --- KICKSTAND LEANING TO PAVEMENT --- */}
        <mesh position={[-0.06, 0.14, -0.08]} rotation={[0.45, 0, 0]} material={capBlackMaterial}>
          <cylinderGeometry args={[0.008, 0.008, 0.30, 8]} />
        </mesh>
      </group>

      {/* =================================================================== */}
      {/* 4. Distant Campus Rooftop Water Tank & Birds (§5 Item 3)            */}
      {/* Location: x = -16, y = 8.5, z = -35 (far in morning fog haze)        */}
      {/* =================================================================== */}
      <group position={[-16, 8.5, -35]}>
        {/* Trestle Steel Frame Legs */}
        {[-1.2, 1.2].map((tx, txi) =>
          [-1.2, 1.2].map((tz, tzi) => (
            <mesh key={`${txi}-${tzi}`} position={[tx, -1.8, tz]} material={silhouetteMaterial}>
              <cylinderGeometry args={[0.08, 0.08, 3.6, 8]} />
            </mesh>
          ))
        )}
        {/* Water Tank Cylinder */}
        <mesh position={[0, 1.2, 0]} material={silhouetteMaterial}>
          <cylinderGeometry args={[1.8, 1.8, 2.6, 24]} />
        </mesh>
        {/* Conical Roof */}
        <mesh position={[0, 2.9, 0]} material={silhouetteMaterial}>
          <coneGeometry args={[2.0, 0.9, 24]} />
        </mesh>
        {/* 2 Distant Morning Birds perched on railing */}
        <group position={[-1.2, 2.7, 1.2]} rotation={[0, 0.6, 0]}>
          <mesh material={silhouetteMaterial}>
            <sphereGeometry args={[0.10, 8, 8]} />
          </mesh>
        </group>
        <group position={[1.4, 2.7, 0.8]} rotation={[0, -0.8, 0]}>
          <mesh material={silhouetteMaterial}>
            <sphereGeometry args={[0.09, 8, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
