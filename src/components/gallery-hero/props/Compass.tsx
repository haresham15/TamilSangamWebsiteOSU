"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { patchDissolveMaterial, type DissolveUniforms } from "./dissolveShader";
import { getSharedHeroRefs } from "./types";

/**
 * Creates Compass materials and uniforms factory outside React render (§6).
 */
export function createCompassMaterials(): {
  brassMat: THREE.MeshStandardMaterial;
  steelMat: THREE.MeshStandardMaterial;
  uniforms: DissolveUniforms;
} {
  const uniforms: DissolveUniforms = {
    uDissolve: { value: 1.0 },
    uEdgeColor: { value: new THREE.Color("#FFB84D") },
    uEdgeWidth: { value: 0.09 },
    uNoiseScale: { value: 2.2 },
  };

  const brassMat = new THREE.MeshStandardMaterial({
    color: "#D4AF37",
    metalness: 0.95,
    roughness: 0.25,
    envMapIntensity: 1.6,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: "#E2E6EE",
    metalness: 0.98,
    roughness: 0.18,
    envMapIntensity: 1.8,
  });

  patchDissolveMaterial(brassMat, uniforms);
  patchDissolveMaterial(steelMat, uniforms);

  return { brassMat, steelMat, uniforms };
}

/**
 * Procedural Brass Drafting Compass (§6, Phase 4)
 *
 * Implements:
 * - Two hinged brass legs with knee joints
 * - Central threaded adjustment spindle with knurled thumbwheel
 * - Hardened steel needle and pencil clamp tips
 * - PBR polished brass (#D4AF37) with procedural 3D noise dissolve
 */
export function Compass() {
  const heroRefs = getSharedHeroRefs();
  const groupRef = useRef<THREE.Group>(null);

  // Materials and uniforms created via stable factory
  const { brassMat, steelMat, uniforms } = useMemo(() => createCompassMaterials(), []);
  const uniformsRef = useRef(uniforms);

  useEffect(() => {
    return () => {
      brassMat.dispose();
      steelMat.dispose();
    };
  }, [brassMat, steelMat]);

  // Per-frame dissolve sync
  useFrame(() => {
    const dVal = heroRefs.compass.uDissolve.value;
    uniformsRef.current.uDissolve.value = dVal;

    if (groupRef.current) {
      groupRef.current.visible = dVal < 0.999;
    }
  });

  return (
    <primitive object={heroRefs.compass.group} name="prop-compass">
      <group ref={groupRef} scale={[0.85, 0.85, 0.85]}>
        {/* 1. Top Handle & Pivot Hinge Knuckle */}
        <mesh position={[0, 1.45, 0]} material={brassMat} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.5, 16]} />
        </mesh>
        <mesh position={[0, 1.15, 0]} material={brassMat} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.24, 20]} />
        </mesh>
        {/* Cross Hinge Pivot Bolt */}
        <mesh position={[0, 1.15, 0]} rotation={[0, 0, Math.PI / 2]} material={steelMat} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.38, 16]} />
        </mesh>

        {/* 2. Left Leg (Needle Leg) - Angled ~9 degrees */}
        <group position={[-0.1, 1.05, 0]} rotation={[0, 0, 0.16]}>
          {/* Upper brass thigh */}
          <mesh position={[0, -0.65, 0]} material={brassMat} castShadow>
            <cylinderGeometry args={[0.09, 0.06, 1.3, 16]} />
          </mesh>
          {/* Knee joint */}
          <mesh position={[0, -1.35, 0]} material={brassMat} castShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
          </mesh>
          {/* Lower tapered shank */}
          <mesh position={[0, -1.95, 0]} material={brassMat} castShadow>
            <cylinderGeometry args={[0.06, 0.03, 1.1, 16]} />
          </mesh>
          {/* Hardened steel needle tip */}
          <mesh position={[0, -2.65, 0]} material={steelMat} castShadow>
            <coneGeometry args={[0.03, 0.45, 16]} />
          </mesh>
        </group>

        {/* 3. Right Leg (Scriber / Lead Leg) - Angled ~-9 degrees */}
        <group position={[0.1, 1.05, 0]} rotation={[0, 0, -0.16]}>
          {/* Upper brass thigh */}
          <mesh position={[0, -0.65, 0]} material={brassMat} castShadow>
            <cylinderGeometry args={[0.09, 0.06, 1.3, 16]} />
          </mesh>
          {/* Knee joint */}
          <mesh position={[0, -1.35, 0]} material={brassMat} castShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
          </mesh>
          {/* Lower tapered shank */}
          <mesh position={[0, -1.95, 0]} material={brassMat} castShadow>
            <cylinderGeometry args={[0.06, 0.045, 1.1, 16]} />
          </mesh>
          {/* Lead clamp block & graphite tip */}
          <mesh position={[0, -2.55, 0]} material={brassMat} castShadow>
            <boxGeometry args={[0.12, 0.22, 0.12]} />
          </mesh>
          <mesh position={[0, -2.78, 0]} material={steelMat} castShadow>
            <cylinderGeometry args={[0.025, 0.005, 0.32, 12]} />
          </mesh>
        </group>

        {/* 4. Central Threaded Spindle Rod & Adjustment Thumbwheel */}
        <group position={[0, 0.2, 0]}>
          {/* Horizontal threaded rod */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={steelMat} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.72, 16]} />
          </mesh>
          {/* Knurled brass thumbwheel disc */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={brassMat} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.06, 24]} />
          </mesh>
        </group>
      </group>
    </primitive>
  );
}
