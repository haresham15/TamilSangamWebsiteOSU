/**
 * SideKolam.tsx
 * 
 * Authentic, Detailed, Static Side Kolams (Home Hero Flanks).
 * Phase 2 & 3: High-precision 3D tube geometry, pulli dot lattice, over/under gaps,
 * perimeter apex beads, soft radial halo, and flour speckle field (§PRD Side Kolams).
 * 
 * - Kolam L (Left Flank): Approved Sibling Candidate #1 (ID 46815)
 * - Kolam R (Right Flank): Approved Sibling Candidate #2 (ID 46895)
 * - Matrix auto-update disabled (100% world-static, scrolls away with camera descent).
 * - Fades smoothly to alpha 0 between p = 0.20 and 0.38.
 */

"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import {
  expandFundamentalDomain,
  traceGridNetwork,
  DOT_GRID_SIZE,
} from "./tileGrammar";
import { solveAlternatingWeave } from "./overUnder";
import { buildKolamMesh, gridToLocal } from "./buildCurve";
import { KOLAM_L_DESIGN, KOLAM_R_DESIGN, ApprovedDesign } from "./designs";
import { heroScrollProgress, heroDirectorState } from "@/engine/heroScrollStore";

export interface SideKolamProps {
  design: ApprovedDesign;
  side: "left" | "right";
  isMobile?: boolean;
  phase2FlatColor?: boolean;
}

export function SideKolam({
  design,
  side,
  isMobile = false,
  phase2FlatColor = false,
}: SideKolamProps) {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const dotsInstancedRef = useRef<THREE.InstancedMesh>(null);
  const beadsInstancedRef = useRef<THREE.InstancedMesh>(null);
  const haloMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const specklesMatRef = useRef<THREE.PointsMaterial>(null);

  // Authentic size: 9x9 lattice spans ~12.5 * d across diagonal lobes.
  // d = 0.225 yields ~2.80 world units diameter, exactly matching previous traditional side kolams.
  const d = 0.225;
  const Wv = viewport.width;

  // Stationary world placement in the open space on the flanks (§PRD §5.1)
  // Central weave spans |x| <= 3.5, dots <= 4.8.
  // x = ±5.4, y = 0.20, z = -0.15 restores the authentic flank coordinates.
  const posX = useMemo(() => {
    const xBase = Math.max(5.4, Math.min(7.0, (Wv / 2) - 1.5));
    return side === "left" ? -xBase : xBase;
  }, [side, Wv]);

  const position = useMemo((): [number, number, number] => {
    return [posX, 0.20, -0.15];
  }, [posX]);

  // Build static geometries once on CPU
  const { mainTubeGeometry, apexBeadPositions } = useMemo(() => {
    const grid = expandFundamentalDomain(design.config);
    const network = traceGridNetwork(grid);
    const assignment = solveAlternatingWeave(grid, network);
    return buildKolamMesh(grid, network, assignment, d, true, false);
  }, [design.config, d]);

  // Setup Pulli dots instances (81 dots per kolam, sphere radius 0.07 * d)
  const dotSphereGeo = useMemo(() => {
    return new THREE.SphereGeometry(0.07 * d, 12, 8);
  }, [d]);

  // Setup Apex beads instances (16 perimeter beads per kolam, sphere radius 0.045 * d)
  const beadSphereGeo = useMemo(() => {
    return new THREE.SphereGeometry(0.045 * d, 10, 8);
  }, [d]);

  // Setup soft radial halo gradient texture
  const haloTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(107, 63, 208, 0.22)");
      grad.addColorStop(0.35, "rgba(58, 27, 122, 0.10)");
      grad.addColorStop(0.70, "rgba(30, 10, 65, 0.03)");
      grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Setup static flour speckles geometry (72 deterministic particles around perimeter)
  const specklesGeo = useMemo(() => {
    let s = side === "left" ? 42815 : 42895;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    const count = 72;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = rnd() * Math.PI * 2;
      const r = (5.4 + rnd() * 1.3) * d;
      positions[i * 3 + 0] = Math.cos(angle) * r + (rnd() - 0.5) * 0.15 * d;
      positions[i * 3 + 1] = Math.sin(angle) * r + (rnd() - 0.5) * 0.15 * d;
      positions[i * 3 + 2] = (rnd() - 0.5) * 0.02 * d;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [d, side]);

  // Clean up geometries on unmount / d change
  useEffect(() => {
    return () => {
      dotSphereGeo.dispose();
      beadSphereGeo.dispose();
      specklesGeo.dispose();
      mainTubeGeometry.dispose();
      if (haloTexture) haloTexture.dispose();
    };
  }, [dotSphereGeo, beadSphereGeo, specklesGeo, mainTubeGeometry, haloTexture]);

  // Populate 81 Pulli dot instances
  useEffect(() => {
    if (!dotsInstancedRef.current) return;
    const inst = dotsInstancedRef.current;
    const dummy = new THREE.Object3D();

    let idx = 0;
    for (let gx = 0; gx < DOT_GRID_SIZE; gx++) {
      for (let gy = 0; gy < DOT_GRID_SIZE; gy++) {
        const [lx, ly] = gridToLocal(gx, gy, d, true);
        dummy.position.set(lx, ly, 0);
        dummy.updateMatrix();
        inst.setMatrixAt(idx++, dummy.matrix);
      }
    }
    inst.instanceMatrix.needsUpdate = true;
  }, [d]);

  // Populate 16 Apex bead instances
  useEffect(() => {
    if (!beadsInstancedRef.current || apexBeadPositions.length === 0) return;
    const inst = beadsInstancedRef.current;
    const dummy = new THREE.Object3D();

    for (let idx = 0; idx < apexBeadPositions.length; idx++) {
      const [bx, by, bz] = apexBeadPositions[idx];
      dummy.position.set(bx, by, bz);
      dummy.updateMatrix();
      inst.setMatrixAt(idx, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  }, [apexBeadPositions, d]);

  // Scroll fade uniform: fades smoothly to alpha 0 between p = 0.20 and 0.38 (§5.1)
  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const p = heroDirectorState.scrubActive
      ? heroDirectorState.scrubProgress
      : heroScrollProgress.current;

    let alpha = 1.0;
    if (p >= 0.20) {
      alpha = 1.0 - THREE.MathUtils.clamp((p - 0.20) / (0.38 - 0.20), 0, 1);
    }

    if (materialRef.current) {
      materialRef.current.opacity = alpha;
      materialRef.current.transparent = alpha < 0.999;
    }
    if (dotsInstancedRef.current && (dotsInstancedRef.current.material as THREE.Material)) {
      const dotMat = dotsInstancedRef.current.material as THREE.MeshStandardMaterial;
      dotMat.opacity = alpha * 0.85;
      dotMat.transparent = alpha < 0.999;
    }
    if (beadsInstancedRef.current && (beadsInstancedRef.current.material as THREE.Material)) {
      const beadMat = beadsInstancedRef.current.material as THREE.MeshStandardMaterial;
      beadMat.opacity = alpha * 0.90;
      beadMat.transparent = alpha < 0.999;
    }
    if (haloMatRef.current) {
      haloMatRef.current.opacity = alpha * 0.70;
      haloMatRef.current.transparent = true;
    }
    if (specklesMatRef.current) {
      specklesMatRef.current.opacity = alpha * 0.32;
      specklesMatRef.current.transparent = true;
    }
  });

  // Guard: Hide on mobile or narrow viewports to avoid crowding the central weave
  if (isMobile || Wv < 11.5) {
    return null;
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Soft Radial Ambient Halo Disc (Z = -0.08) */}
      {haloTexture && (
        <mesh position={[0, 0, -0.08]}>
          <planeGeometry args={[13.5 * d, 13.5 * d]} />
          <meshBasicMaterial
            ref={haloMatRef}
            map={haloTexture}
            transparent
            opacity={0.70}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Static Flour Speckles Dust Ring */}
      <points geometry={specklesGeo}>
        <pointsMaterial
          ref={specklesMatRef}
          color="#D4C2FC"
          size={0.022 * d}
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Main Weave Tube Mesh (Z ≈ 0, over/under ±0.055d) */}
      <mesh geometry={mainTubeGeometry}>
        {phase2FlatColor ? (
          <meshBasicMaterial
            ref={materialRef as any}
            color="#8A5CE6"
            transparent
            opacity={1.0}
          />
        ) : (
          <meshStandardMaterial
            ref={materialRef}
            color="#7C4DDB"
            emissive="#6B3FD0"
            emissiveIntensity={0.36}
            roughness={0.38}
            metalness={0.22}
            envMapIntensity={0.65}
            transparent
            opacity={1.0}
          />
        )}
      </mesh>

      {/* Pulli Dot Lattice (81 instances, radius 0.07d) */}
      <instancedMesh
        ref={dotsInstancedRef}
        args={[dotSphereGeo, undefined as any, 81]}
      >
        <meshStandardMaterial
          color="#E6DBFF"
          emissive="#D4C2FC"
          emissiveIntensity={0.45}
          roughness={0.4}
          metalness={0.1}
        />
      </instancedMesh>

      {/* Perimeter Apex Beads (16 instances, radius 0.045d) */}
      {apexBeadPositions.length > 0 && (
        <instancedMesh
          ref={beadsInstancedRef}
          args={[beadSphereGeo, undefined as any, apexBeadPositions.length]}
        >
          <meshStandardMaterial
            color="#E6DBFF"
            emissive="#D4C2FC"
            emissiveIntensity={0.50}
            roughness={0.35}
            metalness={0.15}
          />
        </instancedMesh>
      )}
    </group>
  );
}

/**
 * SideKolamsGroup: Mounts Kolam L and Kolam R flanking the hero center.
 */
export function SideKolamsGroup({
  isMobile = false,
  phase2FlatColor = false,
}: {
  isMobile?: boolean;
  phase2FlatColor?: boolean;
}) {
  const { viewport } = useThree();
  const Wv = viewport.width;

  if (isMobile || Wv < 11.5) {
    return null;
  }

  return (
    <group name="side-kolams-group">
      <SideKolam
        design={KOLAM_L_DESIGN}
        side="left"
        isMobile={isMobile}
        phase2FlatColor={phase2FlatColor}
      />
      <SideKolam
        design={KOLAM_R_DESIGN}
        side="right"
        isMobile={isMobile}
        phase2FlatColor={phase2FlatColor}
      />
    </group>
  );
}
