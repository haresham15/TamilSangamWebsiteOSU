"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

interface CampusGateProps {
  gateProgressRef: React.RefObject<number>;
}

export function CampusGate({ gateProgressRef }: CampusGateProps) {
  const leftHingeRef = useRef<THREE.Group>(null);
  const rightHingeRef = useRef<THREE.Group>(null);

  // Load straight-alpha matched leaf textures
  const leftTexture = useTexture("/join/lattice-leaf-left.png");
  const rightTexture = useTexture("/join/lattice-leaf-right.png");

  useMemo(() => {
    [leftTexture, rightTexture].forEach((tex) => {
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    });
  }, [leftTexture, rightTexture]);

  // Leaf dimensions
  const leafWidth = 3.3;
  const leafHeight = 4.4;

  // Hinge offset geometry so origin (0,0,0) sits at the hinge edge
  const leftLeafGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(leafWidth, leafHeight, 1, 1);
    // Center of plane is at +leafWidth/2, so x=0 is the left hinge
    geo.translate(leafWidth / 2, 0, 0);
    return geo;
  }, [leafWidth, leafHeight]);

  const rightLeafGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(leafWidth, leafHeight, 1, 1);
    // Center of plane is at -leafWidth/2, so x=0 is the right hinge
    geo.translate(-leafWidth / 2, 0, 0);
    return geo;
  }, [leafWidth, leafHeight]);

  // Parametric arch curve spanning from left to right pillar cap
  const archCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 48;
    const radius = 5.2;
    const centerY = 1.4;
    const maxTheta = 0.765;
    for (let i = 0; i <= segments; i++) {
      const theta = -maxTheta + (i / segments) * (maxTheta * 2);
      points.push(
        new THREE.Vector3(
          radius * Math.sin(theta),
          centerY + radius * Math.cos(theta),
          0
        )
      );
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  useFrame(() => {
    const p = gateProgressRef.current ?? 0;
    const maxAngle = Math.PI * 0.44; // ~79 degrees open
    const currentAngle = p * maxAngle;

    if (leftHingeRef.current) {
      // Left gate swings inward
      leftHingeRef.current.rotation.y = -currentAngle;
    }
    if (rightHingeRef.current) {
      // Right gate swings inward
      rightHingeRef.current.rotation.y = currentAngle;
    }
  });

  const ironMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#221c18",
        roughness: 0.35,
        metalness: 0.85,
      }),
    []
  );

  const leftLatticeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: leftTexture,
        transparent: true,
        alphaTest: 0.08,
        depthWrite: true,
        side: THREE.DoubleSide,
        roughness: 0.38,
        metalness: 0.78,
      }),
    [leftTexture]
  );

  const rightLatticeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: rightTexture,
        transparent: true,
        alphaTest: 0.08,
        depthWrite: true,
        side: THREE.DoubleSide,
        roughness: 0.38,
        metalness: 0.78,
      }),
    [rightTexture]
  );

  const brickMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#5c241c", // Collegiate Ohio red brick
        roughness: 0.88,
        metalness: 0.08,
      }),
    []
  );

  const stoneCapMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d4cbba", // Ohio limestone cap
        roughness: 0.78,
        metalness: 0.12,
      }),
    []
  );

  return (
    <group position={[0, 0, 0]}>
      {/* =================================================================== */}
      {/* 1. BRICK PILLARS (Collegiate Red Brick with Limestone Finials)     */}
      {/* =================================================================== */}
      {/* Left Pillar */}
      <group position={[-3.85, 2.6, 0]}>
        <mesh material={brickMaterial} castShadow receiveShadow>
          <boxGeometry args={[1.1, 5.2, 1.1]} />
        </mesh>
        <mesh position={[0, -2.5, 0]} material={stoneCapMaterial} receiveShadow>
          <boxGeometry args={[1.3, 0.4, 1.3]} />
        </mesh>
        <mesh position={[0, 0.4, 0]} material={stoneCapMaterial}>
          <boxGeometry args={[1.18, 0.15, 1.18]} />
        </mesh>
        <mesh position={[0, 2.65, 0]} material={stoneCapMaterial} castShadow>
          <boxGeometry args={[1.35, 0.3, 1.35]} />
        </mesh>
        <mesh position={[0, 3.05, 0]} material={stoneCapMaterial} castShadow>
          <sphereGeometry args={[0.26, 24, 24]} />
        </mesh>
      </group>

      {/* Right Pillar */}
      <group position={[3.85, 2.6, 0]}>
        <mesh material={brickMaterial} castShadow receiveShadow>
          <boxGeometry args={[1.1, 5.2, 1.1]} />
        </mesh>
        <mesh position={[0, -2.5, 0]} material={stoneCapMaterial} receiveShadow>
          <boxGeometry args={[1.3, 0.4, 1.3]} />
        </mesh>
        <mesh position={[0, 0.4, 0]} material={stoneCapMaterial}>
          <boxGeometry args={[1.18, 0.15, 1.18]} />
        </mesh>
        <mesh position={[0, 2.65, 0]} material={stoneCapMaterial} castShadow>
          <boxGeometry args={[1.35, 0.3, 1.35]} />
        </mesh>
        <mesh position={[0, 3.05, 0]} material={stoneCapMaterial} castShadow>
          <sphereGeometry args={[0.26, 24, 24]} />
        </mesh>
      </group>

      {/* =================================================================== */}
      {/* 2. OVERHEAD TRANSOM & WROUGHT IRON ARCH                             */}
      {/* =================================================================== */}
      <group position={[0, 0, 0]}>
        {/* Horizontal Tie Beam spanning between pillars */}
        <mesh position={[0, 5.15, 0]} material={ironMaterial} castShadow>
          <boxGeometry args={[7.7, 0.12, 0.12]} />
        </mesh>
        {/* Upper Arch Curve Tube */}
        <mesh material={ironMaterial} castShadow>
          <tubeGeometry args={[archCurve, 48, 0.055, 8, false]} />
        </mesh>
        {/* Spandrel Decorative Vertical Bars */}
        {[-3.0, -2.4, -1.8, -1.2, -0.6, 0.6, 1.2, 1.8, 2.4, 3.0].map((x, i) => {
          const topY = 1.4 + Math.sqrt(Math.max(0, 5.2 * 5.2 - x * x));
          const botY = 5.15;
          const h = Math.max(0.1, topY - botY);
          const midY = (topY + botY) / 2;
          return (
            <mesh key={i} position={[x, midY, 0]} material={ironMaterial}>
              <cylinderGeometry args={[0.02, 0.02, h, 8]} />
            </mesh>
          );
        })}
      </group>

      {/* =================================================================== */}
      {/* 3. TWIN SWINGING GATE LEAVES (With Ornate Lattice Alpha Cutouts)   */}
      {/* =================================================================== */}
      {/* Left Gate Leaf (Hinged at left pillar edge x = -3.3) */}
      <group ref={leftHingeRef} position={[-3.3, 2.3, 0]}>
        {/* Ornate Lattice Cutout Plane */}
        <mesh geometry={leftLeafGeo} material={leftLatticeMaterial} castShadow receiveShadow />

        {/* Perimeter Open Tubular Frame (Top, Bottom, Hinge, Meeting Stile) */}
        {/* Hinge Stile (at x = 0) */}
        <mesh position={[0, 0, 0]} material={ironMaterial}>
          <cylinderGeometry args={[0.045, 0.045, leafHeight, 12]} />
        </mesh>
        {/* Meeting Stile (at x = leafWidth) */}
        <mesh position={[leafWidth, 0, 0]} material={ironMaterial}>
          <cylinderGeometry args={[0.04, 0.04, leafHeight, 12]} />
        </mesh>
        {/* Top Rail (at y = leafHeight/2) */}
        <mesh position={[leafWidth / 2, leafHeight / 2, 0]} rotation={[0, 0, Math.PI / 2]} material={ironMaterial}>
          <cylinderGeometry args={[0.04, 0.04, leafWidth, 12]} />
        </mesh>
        {/* Bottom Rail (at y = -leafHeight/2) */}
        <mesh position={[leafWidth / 2, -leafHeight / 2, 0]} rotation={[0, 0, Math.PI / 2]} material={ironMaterial}>
          <cylinderGeometry args={[0.045, 0.045, leafWidth, 12]} />
        </mesh>
        {/* Mid Rail */}
        <mesh position={[leafWidth / 2, -0.4, 0]} rotation={[0, 0, Math.PI / 2]} material={ironMaterial}>
          <cylinderGeometry args={[0.03, 0.03, leafWidth, 8]} />
        </mesh>

        {/* Spear Finials along top rail */}
        {[0.3, 0.8, 1.3, 1.8, 2.3, 2.8].map((x, i) => (
          <mesh key={i} position={[x, leafHeight / 2 + 0.16, 0]} material={ironMaterial}>
            <coneGeometry args={[0.04, 0.28, 8]} />
          </mesh>
        ))}
      </group>

      {/* Right Gate Leaf (Hinged at right pillar edge x = +3.3) */}
      <group ref={rightHingeRef} position={[3.3, 2.3, 0]}>
        {/* Ornate Lattice Cutout Plane */}
        <mesh geometry={rightLeafGeo} material={rightLatticeMaterial} castShadow receiveShadow />

        {/* Perimeter Open Tubular Frame */}
        {/* Hinge Stile (at x = 0) */}
        <mesh position={[0, 0, 0]} material={ironMaterial}>
          <cylinderGeometry args={[0.045, 0.045, leafHeight, 12]} />
        </mesh>
        {/* Meeting Stile (at x = -leafWidth) */}
        <mesh position={[-leafWidth, 0, 0]} material={ironMaterial}>
          <cylinderGeometry args={[0.04, 0.04, leafHeight, 12]} />
        </mesh>
        {/* Top Rail (at y = leafHeight/2) */}
        <mesh position={[-leafWidth / 2, leafHeight / 2, 0]} rotation={[0, 0, Math.PI / 2]} material={ironMaterial}>
          <cylinderGeometry args={[0.04, 0.04, leafWidth, 12]} />
        </mesh>
        {/* Bottom Rail (at y = -leafHeight/2) */}
        <mesh position={[-leafWidth / 2, -leafHeight / 2, 0]} rotation={[0, 0, Math.PI / 2]} material={ironMaterial}>
          <cylinderGeometry args={[0.045, 0.045, leafWidth, 12]} />
        </mesh>
        {/* Mid Rail */}
        <mesh position={[-leafWidth / 2, -0.4, 0]} rotation={[0, 0, Math.PI / 2]} material={ironMaterial}>
          <cylinderGeometry args={[0.03, 0.03, leafWidth, 8]} />
        </mesh>

        {/* Spear Finials along top rail */}
        {[-0.3, -0.8, -1.3, -1.8, -2.3, -2.8].map((x, i) => (
          <mesh key={i} position={[x, leafHeight / 2 + 0.16, 0]} material={ironMaterial}>
            <coneGeometry args={[0.04, 0.28, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
