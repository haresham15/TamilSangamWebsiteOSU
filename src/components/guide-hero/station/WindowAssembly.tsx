"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { guideStationPalette } from "./palette";
import { SdfSilhouette } from "./SdfSilhouette";

function createVignetteBackdropTexture() {
  const width = 256;
  const height = 256;
  const pixels = new Uint8Array(width * height * 4);

  // HDR core [2.8, 1.85, 0.65] (represented in sRGB canvas)
  const core = new THREE.Color("#FFB84D");
  const amber = new THREE.Color("#FF8A2A");
  const edge = new THREE.Color("#2A1208");

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x / (width - 1) - 0.5) * 1.5;
      const dy = (y / (height - 1) - 0.5) * 1.3;
      const dist = Math.min(1.0, Math.hypot(dx, dy) * 1.3);

      const color = core.clone().lerp(amber, dist * 0.6).lerp(edge, Math.max(0, dist - 0.3) * 1.4);
      const index = (y * width + x) * 4;
      pixels[index] = Math.round(color.r * 255);
      pixels[index + 1] = Math.round(color.g * 255);
      pixels[index + 2] = Math.round(color.b * 255);
      pixels[index + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

interface WindowAssemblyProps {
  progress?: number;
  getProgress?: () => number;
}

/**
 * The 8-Layer Z-Ordered Window Assembly (PRD §3.5 & §5.2).
 * Centered around (0, 1.7, 0) with a 1.0m × 0.75m opening.
 */
export function WindowAssembly({ progress = 0, getProgress }: WindowAssemblyProps) {
  const readProgress = useMemo(() => getProgress ?? (() => progress), [getProgress, progress]);

  const backdropTexture = useMemo(() => createVignetteBackdropTexture(), []);
  useEffect(() => {
    return () => backdropTexture.dispose();
  }, [backdropTexture]);

  // Fan rotation & curtain wave references
  const fanRef = useRef<THREE.Group>(null);
  const curtainMeshRef = useRef<THREE.Mesh>(null);
  const barsMeshRef = useRef<THREE.InstancedMesh>(null);
  const spillMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Set up the 7 horizontal iron bars
  const barTransforms = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const mat = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const rot = new THREE.Euler(0, 0, Math.PI / 2);
    const quat = new THREE.Quaternion().setFromEuler(rot);
    const scale = new THREE.Vector3(1, 1, 1);

    // 7 horizontal bars from y = 1.40 to y = 2.00 (pitch 0.10m), z = +0.04
    for (let i = 0; i < 7; i++) {
      const y = 1.40 + i * 0.10;
      pos.set(0, y, 0.04);
      mat.compose(pos, quat, scale);
      matrices.push(mat.clone());
    }
    return matrices;
  }, []);

  useEffect(() => {
    const mesh = barsMeshRef.current;
    if (!mesh) return;
    barTransforms.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  }, [barTransforms]);

  // Animation loop: fan rotation, curtain flutter, and platform spill opacity
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;

    // Slow rotating ceiling fan
    if (fanRef.current) {
      fanRef.current.rotation.y += dt * 1.5;
    }

    // Curtain gentle fluttering
    if (curtainMeshRef.current) {
      const time = clock.elapsedTime;
      const geom = curtainMeshRef.current.geometry as THREE.PlaneGeometry;
      const posAttr = geom.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const u = geom.attributes.uv.getX(i);
        const v = geom.attributes.uv.getY(i);
        // Only flutter the free edge (left edge of the curtain, u < 0.7)
        const wave = Math.sin(time * 3.0 + v * 5.0) * (1.0 - u) * 0.015;
        posAttr.setZ(i, wave);
      }
      posAttr.needsUpdate = true;
    }

    // Platform spill fade based on scroll progress
    if (spillMaterialRef.current) {
      const p = readProgress();
      // Fully visible from p = 0 to 0.45, then gently softens
      const opacity = Math.min(0.42, Math.max(0.12, 0.42 - p * 0.3));
      spillMaterialRef.current.opacity = opacity;
    }
  });

  return (
    <group name="WindowAssembly">
      {/* =========================================================================
          LAYER 1 (z = -2.4): Vignetted warm emissive compartment backdrop plane
          HDR core [2.8, 1.85, 0.65] -> amber -> dark warm edge, fog: false
          ========================================================================= */}
      <mesh position={[0, 1.7, -2.4]} renderOrder={1}>
        <planeGeometry args={[3.2, 2.2]} />
        <meshBasicMaterial map={backdropTexture} fog={false} toneMapped={false} />
      </mesh>

      {/* Compartment practical point light (PRD §5.4: ~80 cd, decay 2, no shadows) */}
      <pointLight
        position={[0.3, 2.3, -1.5]}
        intensity={80}
        decay={2}
        color={guideStationPalette.windowGlow}
      />

      {/* =========================================================================
          LAYER 2 (z = -1.5): Compartment interior silhouettes
          - Seat-back profile behind woman
          - Overhead luggage rack
          - Ceiling fan (rotating)
          - Emissive ceiling tube strip
          ========================================================================= */}
      <group position={[0, 0, -1.5]} name="CompartmentInterior">
        {/* Seat-back profile */}
        <mesh position={[0.42, 1.45, 0]} renderOrder={2}>
          <boxGeometry args={[0.55, 0.65, 0.08]} />
          <meshBasicMaterial color="#0A090D" fog={false} />
        </mesh>
        {/* Overhead luggage rack */}
        <mesh position={[0, 2.25, 0]} renderOrder={2}>
          <boxGeometry args={[2.4, 0.06, 0.35]} />
          <meshBasicMaterial color="#121015" fog={false} />
        </mesh>
        {/* Slow rotating ceiling fan */}
        <group ref={fanRef} position={[0, 2.22, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
            <meshBasicMaterial color="#0A090D" fog={false} />
          </mesh>
          {[-0.35, 0, 0.35].map((angle, i) => (
            <mesh key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]} position={[0, -0.01, 0]}>
              <boxGeometry args={[0.45, 0.01, 0.08]} />
              <meshBasicMaterial color="#0A090D" fog={false} />
            </mesh>
          ))}
        </group>
        {/* Emissive ceiling tube light strip */}
        <mesh position={[0.3, 2.28, 0]}>
          <boxGeometry args={[0.85, 0.03, 0.05]} />
          <meshBasicMaterial color="#FFF5DC" fog={false} toneMapped={false} />
        </mesh>
      </group>

      {/* =========================================================================
          LAYER 3 (z = -0.7): Woman SDF plane
          Seated at x = +0.15, y = 1.6, facing -x (left towards window), fog = false
          ========================================================================= */}
      <SdfSilhouette
        kind="woman"
        position={[0.15, 1.68, -0.7]}
        scale={0.92}
        fog={false}
      />

      {/* =========================================================================
          LAYER 4 (z = -0.2): Vertex-wave cloth curtain
          Partly drawn on right edge of window, fluttering gently
          ========================================================================= */}
      <mesh
        ref={curtainMeshRef}
        position={[0.42, 1.72, -0.2]}
        renderOrder={3}
      >
        <planeGeometry args={[0.22, 0.72, 8, 12]} />
        <meshStandardMaterial
          color="#8A5A36"
          roughness={0.7}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* =========================================================================
          LAYER 5 (z = +0.02): Glass additive reflection quad & raindrop trails
          Faint cool blue platform reflection + sliding micro-droplets & anamorphic streak
          ========================================================================= */}
      <mesh position={[0, 1.7, 0.02]} renderOrder={10}>
        <planeGeometry args={[1.02, 0.76]} />
        <meshBasicMaterial
          color={guideStationPalette.practicalCool}
          transparent
          opacity={0.09}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Horizontal anamorphic lens streak: warm amber with subtle teal highlight */}
      <mesh position={[0.08, 1.7, 0.022]} renderOrder={11}>
        <planeGeometry args={[1.35, 0.028]} />
        <meshBasicMaterial
          color="#FFB84D"
          transparent
          opacity={0.34}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.08, 1.7, 0.023]} renderOrder={11}>
        <planeGeometry args={[0.75, 0.012]} />
        <meshBasicMaterial
          color="#55CCA2"
          transparent
          opacity={0.42}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* =========================================================================
          LAYER 6 (z = +0.04): 7 horizontal iron window bars
          Instanced cylinders, r = 0.009m, pitch 0.10m, dark iron with warm specular
          ========================================================================= */}
      <instancedMesh
        ref={barsMeshRef}
        args={[undefined, undefined, 7]}
        name="WindowBars"
        renderOrder={15}
      >
        <cylinderGeometry args={[0.009, 0.009, 1.04, 16]} />
        <meshStandardMaterial
          color="#14181D"
          metalness={0.85}
          roughness={0.25}
        />
      </instancedMesh>

      {/* =========================================================================
          LAYER 7 (z = +0.06): Beveled metal window frame, rivets & half-raised shutter
          Frame around the 1.0m × 0.75m cutout
          ========================================================================= */}
      <group position={[0, 1.7, 0.06]} name="WindowFrameAssembly">
        {/* Top frame bar */}
        <mesh position={[0, 0.385, 0]}>
          <boxGeometry args={[1.08, 0.06, 0.04]} />
          <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.65} roughness={0.35} />
        </mesh>
        {/* Bottom frame sill */}
        <mesh position={[0, -0.385, 0]}>
          <boxGeometry args={[1.12, 0.06, 0.06]} />
          <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Left frame upright */}
        <mesh position={[-0.51, 0, 0]}>
          <boxGeometry args={[0.06, 0.78, 0.04]} />
          <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.65} roughness={0.35} />
        </mesh>
        {/* Right frame upright */}
        <mesh position={[0.51, 0, 0]}>
          <boxGeometry args={[0.06, 0.78, 0.04]} />
          <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.65} roughness={0.35} />
        </mesh>
        {/* Half-raised metal shutter at top of window */}
        <mesh position={[0, 0.31, -0.015]}>
          <boxGeometry args={[0.98, 0.14, 0.02]} />
          <meshStandardMaterial color="#101720" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* =========================================================================
          LAYER 8 (z = +0.8): Man SDF plane on the platform
          At x = -0.95, y = 1.65, three-quarter profile facing +x, fog = true
          ========================================================================= */}
      <SdfSilhouette
        kind="man"
        position={[-0.85, 1.25, 0.8]}
        scale={0.95}
        fog={true}
      />

      {/* =========================================================================
          STRIPED WINDOW LIGHT SPILL POOL ON WET PLATFORM (z = +1.0 to +3.8)
          Warm #FFB35C window light projected onto the platform with 7 bar shadow stripes
          ========================================================================= */}
      <group position={[0, 0.012, 2.4]} rotation={[-Math.PI / 2, 0, 0]} name="WindowSpillPool">
        <mesh>
          <planeGeometry args={[2.2, 2.8]} />
          <meshBasicMaterial
            ref={spillMaterialRef}
            color={guideStationPalette.windowGlow}
            transparent
            opacity={0.36}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        {/* 7 Bar shadow stripes projecting onto the wet platform */}
        {[-0.9, -0.6, -0.3, 0.0, 0.3, 0.6, 0.9].map((dy, i) => (
          <mesh key={i} position={[0, dy, 0.002]}>
            <planeGeometry args={[2.0, 0.06]} />
            <meshBasicMaterial
              color="#0A0F14"
              transparent
              opacity={0.32}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default WindowAssembly;
