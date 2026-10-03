"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getLeatheretteTexture, getLcdScreenTexture } from "./cameraTexture";
import { patchDissolveMaterial, type DissolveUniforms } from "./dissolveShader";
import { getSharedHeroRefs } from "./types";

/**
 * Creates Camera Body materials and shared dissolve uniforms factory outside React render (§6).
 */
export function createCameraMaterials(): {
  bodyMat: THREE.MeshStandardMaterial;
  gripMat: THREE.MeshStandardMaterial;
  dialMat: THREE.MeshStandardMaterial;
  goldRingMat: THREE.MeshStandardMaterial;
  barrelMat: THREE.MeshStandardMaterial;
  ribMat: THREE.MeshStandardMaterial;
  glassMat: THREE.MeshPhysicalMaterial;
  lcdMat: THREE.MeshStandardMaterial;
  shutterMat: THREE.MeshStandardMaterial;
  uniforms: DissolveUniforms;
} {
  const uniforms: DissolveUniforms = {
    uDissolve: { value: 1.0 },
    uEdgeColor: { value: new THREE.Color("#FFB84D") },
    uEdgeWidth: { value: 0.09 },
    uNoiseScale: { value: 2.0 },
  };

  const bodyMat = new THREE.MeshStandardMaterial({
    color: "#383C46",
    metalness: 0.42,
    roughness: 0.38,
    envMapIntensity: 1.4,
  });

  const gripMat = new THREE.MeshStandardMaterial({
    map: getLeatheretteTexture(),
    bumpMap: getLeatheretteTexture(),
    bumpScale: 0.04,
    color: "#1C1D22",
    metalness: 0.08,
    roughness: 0.88,
  });

  const dialMat = new THREE.MeshStandardMaterial({
    color: "#464A56",
    metalness: 0.85,
    roughness: 0.25,
  });

  const goldRingMat = new THREE.MeshStandardMaterial({
    color: "#F0C050",
    emissive: new THREE.Color("#D4AF37"),
    emissiveIntensity: 0.2,
    metalness: 0.95,
    roughness: 0.18,
    envMapIntensity: 1.8,
  });

  const barrelMat = new THREE.MeshStandardMaterial({
    color: "#282B33",
    metalness: 0.55,
    roughness: 0.32,
  });

  const ribMat = new THREE.MeshStandardMaterial({
    color: "#141518",
    metalness: 0.05,
    roughness: 0.92,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: "#0E2832",
    metalness: 0.1,
    roughness: 0.04,
    transmission: 0.35,
    thickness: 0.4,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.9,
    side: THREE.DoubleSide,
  });

  const lcdMat = new THREE.MeshStandardMaterial({
    map: getLcdScreenTexture(),
    emissive: new THREE.Color("#FFFFFF"),
    emissiveMap: getLcdScreenTexture(),
    emissiveIntensity: 0.45,
    metalness: 0.15,
    roughness: 0.25,
    side: THREE.DoubleSide,
  });

  const shutterMat = new THREE.MeshStandardMaterial({
    color: "#E2E5EE",
    metalness: 0.95,
    roughness: 0.2,
  });

  // Patch all materials with simplex noise dissolve
  patchDissolveMaterial(bodyMat, uniforms);
  patchDissolveMaterial(gripMat, uniforms);
  patchDissolveMaterial(dialMat, uniforms);
  patchDissolveMaterial(goldRingMat, uniforms);
  patchDissolveMaterial(barrelMat, uniforms);
  patchDissolveMaterial(ribMat, uniforms);
  patchDissolveMaterial(glassMat as unknown as THREE.MeshStandardMaterial, uniforms);
  patchDissolveMaterial(lcdMat, uniforms);
  patchDissolveMaterial(shutterMat, uniforms);

  return {
    bodyMat,
    gripMat,
    dialMat,
    goldRingMat,
    barrelMat,
    ribMat,
    glassMat,
    lcdMat,
    shutterMat,
    uniforms,
  };
}

/**
 * Procedural Generic Mirrorless Camera Body (Era 2: 33–66%, Phase 5)
 *
 * Implements:
 * - Magnesium alloy chassis with textured leatherette handgrip
 * - Stepped multi-stage lens barrel with Sangam gold accent ring
 * - Anti-reflective optical glass front element with physical transmission & clearcoat
 * - Electronic viewfinder (EVF) hump and top dials (Mode dial, shutter release, exposure comp)
 * - Rear 512x320 monitor screen with authentic telemetry HUD
 * - Procedural 3D noise dissolve with amber edge burn (#FFB84D)
 */
export function CameraBody() {
  const heroRefs = getSharedHeroRefs();
  const groupRef = useRef<THREE.Group>(null);

  // Materials and uniforms created via stable factory
  const {
    bodyMat,
    gripMat,
    dialMat,
    goldRingMat,
    barrelMat,
    ribMat,
    glassMat,
    lcdMat,
    shutterMat,
    uniforms,
  } = useMemo(() => createCameraMaterials(), []);
  const uniformsRef = useRef(uniforms);

  // Geometries for procedural assembly
  const geometries = useMemo(() => {
    return {
      chassis: new THREE.BoxGeometry(2.1, 1.35, 0.8),
      grip: new THREE.BoxGeometry(0.55, 1.3, 0.45),
      evf: new THREE.BoxGeometry(0.7, 0.38, 0.75),
      hotshoe: new THREE.BoxGeometry(0.32, 0.06, 0.35),
      modeDial: new THREE.CylinderGeometry(0.2, 0.2, 0.16, 24),
      exposureDial: new THREE.CylinderGeometry(0.18, 0.18, 0.12, 24),
      shutterCollar: new THREE.CylinderGeometry(0.14, 0.16, 0.12, 20),
      shutterButton: new THREE.CylinderGeometry(0.1, 0.1, 0.06, 20),
      // Stepped Lens Barrel
      mountFlange: new THREE.CylinderGeometry(0.58, 0.58, 0.08, 32),
      barrelStage1: new THREE.CylinderGeometry(0.52, 0.54, 0.35, 32),
      zoomRibRing: new THREE.CylinderGeometry(0.536, 0.536, 0.26, 32),
      goldRing: new THREE.CylinderGeometry(0.528, 0.528, 0.035, 32),
      barrelStage2: new THREE.CylinderGeometry(0.52, 0.52, 0.3, 32),
      lensGlass: new THREE.CircleGeometry(0.47, 32),
      // Rear LCD Screen
      lcdBezel: new THREE.BoxGeometry(1.35, 0.9, 0.02),
      lcdScreen: new THREE.PlaneGeometry(1.28, 0.82),
      rearDial: new THREE.CylinderGeometry(0.18, 0.18, 0.04, 20),
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((geo) => geo.dispose());
      bodyMat.dispose();
      gripMat.dispose();
      dialMat.dispose();
      goldRingMat.dispose();
      barrelMat.dispose();
      ribMat.dispose();
      glassMat.dispose();
      lcdMat.dispose();
      shutterMat.dispose();
    };
  }, [
    geometries,
    bodyMat,
    gripMat,
    dialMat,
    goldRingMat,
    barrelMat,
    ribMat,
    glassMat,
    lcdMat,
    shutterMat,
  ]);

  // Per-frame dissolve sync
  useFrame(() => {
    const dVal = heroRefs.cam.uDissolve.value;
    uniformsRef.current.uDissolve.value = dVal;

    // Visibility cull when completely dissolved
    if (groupRef.current) {
      groupRef.current.visible = dVal < 0.999;
    }
  });

  return (
    <primitive object={heroRefs.cam.group} name="prop-camera">
      <group ref={groupRef}>
        {/* 1. Main Magnesium Alloy Chassis */}
        <mesh
          geometry={geometries.chassis}
          material={bodyMat}
          castShadow
          receiveShadow
        />

        {/* 2. Ergonomic Leatherette Grip */}
        <mesh
          geometry={geometries.grip}
          material={gripMat}
          position={[0.82, -0.02, 0.38]}
          castShadow
          receiveShadow
        />

        {/* 3. Electronic Viewfinder (EVF) Hump & Hotshoe */}
        <mesh
          geometry={geometries.evf}
          material={bodyMat}
          position={[-0.1, 0.82, -0.02]}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={geometries.hotshoe}
          material={dialMat}
          position={[-0.1, 1.04, -0.02]}
          castShadow
        />

        {/* 4. Top Controls: Mode Dial & Exposure Comp Dial */}
        <mesh
          geometry={geometries.modeDial}
          material={dialMat}
          position={[0.58, 0.75, -0.12]}
          castShadow
        />
        <mesh
          geometry={geometries.exposureDial}
          material={dialMat}
          position={[0.96, 0.73, -0.12]}
          castShadow
        />

        {/* 5. Shutter Release Button & Collar */}
        <mesh
          geometry={geometries.shutterCollar}
          material={dialMat}
          position={[0.82, 0.73, 0.28]}
          castShadow
        />
        <mesh
          geometry={geometries.shutterButton}
          material={shutterMat}
          position={[0.82, 0.8, 0.28]}
          castShadow
        />

        {/* 6. Multi-Stage Stepped Lens Barrel */}
        <group position={[-0.1, 0.0, 0.0]}>
          {/* Mount Flange */}
          <mesh
            geometry={geometries.mountFlange}
            material={barrelMat}
            position={[0, 0, 0.44]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          />
          {/* Barrel Base */}
          <mesh
            geometry={geometries.barrelStage1}
            material={barrelMat}
            position={[0, 0, 0.65]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          />
          {/* Ribbed Zoom/Focus Ring */}
          <mesh
            geometry={geometries.zoomRibRing}
            material={ribMat}
            position={[0, 0, 0.95]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          />
          {/* Sangam Gold Accent Ring */}
          <mesh
            geometry={geometries.goldRing}
            material={goldRingMat}
            position={[0, 0, 1.1]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          />
          {/* Barrel Front Stage */}
          <mesh
            geometry={geometries.barrelStage2}
            material={barrelMat}
            position={[0, 0, 1.28]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          />
          {/* Optical Glass Front Element */}
          <mesh
            geometry={geometries.lensGlass}
            material={glassMat}
            position={[0, 0, 1.435]}
            castShadow
          />
        </group>

        {/* 7. Rear LCD Screen & Telemetry Monitor */}
        <mesh
          geometry={geometries.lcdBezel}
          material={dialMat}
          position={[-0.15, -0.05, -0.41]}
        />
        <mesh
          geometry={geometries.lcdScreen}
          material={lcdMat}
          position={[-0.15, -0.05, -0.422]}
          rotation={[0, Math.PI, 0]}
        />
        <mesh
          geometry={geometries.rearDial}
          material={dialMat}
          position={[0.8, -0.1, -0.41]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>
    </primitive>
  );
}
