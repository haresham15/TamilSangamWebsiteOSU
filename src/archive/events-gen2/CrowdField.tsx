"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { loadTextureWithFallback } from "./textureLoaderWithFallback";
import { debugStore } from "./debugState";

interface CrowdLayerConfig {
  count: number;
  texturePath: string;
  minScale: number;
  maxScale: number;
  baseWidth: number;
  baseHeight: number;
  color: string;
  generatePositions: (count: number) => { x: number; y: number; z: number; scale: number }[];
}

// Deterministic PRNG to prevent re-render instance jitter
function pseudoRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * CrowdField:
 * 3-layer instanced crowd billboard system per §6 of Master PRD.
 * - Near layer: 10 instances (foreground, heavy DOF bokeh blur)
 * - Mid layer: 25 instances (midground stage perimeter)
 * - Far layer: 50 instances (deep background mass, fog-occluded)
 * Single draw call per layer for optimal 60fps performance.
 */
export function CrowdField({ isMobile = false }: { isMobile?: boolean }) {
  const nearTex = useMemo(() => loadTextureWithFallback("/events/crowd-atlas-near.png", "crowd-near"), []);
  const midTex = useMemo(() => loadTextureWithFallback("/events/crowd-atlas-mid.png", "crowd-mid"), []);
  const farTex = useMemo(() => loadTextureWithFallback("/events/crowd-atlas-far.png", "crowd-far"), []);


  const nearCount = isMobile ? 6 : 10;
  const midCount = isMobile ? 14 : 25;
  const farCount = isMobile ? 25 : 50;

  useEffect(() => {
    debugStore.setCrowdInstances(nearCount + midCount + farCount);
  }, [nearCount, midCount, farCount]);

  const nearMeshRef = useRef<THREE.InstancedMesh>(null);
  const midMeshRef = useRef<THREE.InstancedMesh>(null);
  const farMeshRef = useRef<THREE.InstancedMesh>(null);

  // Near Layer Setup: 8-12 instances, z in [3.5, 6.5], x in [-3.5, 3.5]
  const nearLayerConfig: CrowdLayerConfig = useMemo(() => ({
    count: nearCount,
    texturePath: "/events/crowd-atlas-near.png",
    minScale: 1.1,
    maxScale: 1.4,
    baseWidth: 1.4,
    baseHeight: 2.4,
    color: "#050302",
    generatePositions: (count) => {
      const rand = pseudoRand(101);
      const positions = [];
      for (let i = 0; i < count; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const x = side * (0.9 + rand() * 2.5);
        const z = 3.6 + rand() * 2.8;
        const scale = 1.0 + rand() * 0.35;
        positions.push({ x, y: 0, z, scale });
      }
      return positions;
    },
  }), [nearCount]);

  // Mid Layer Setup: 20-30 instances, z in [-1.0, 3.5], x in [-6.0, 6.0]
  const midLayerConfig: CrowdLayerConfig = useMemo(() => ({
    count: midCount,
    texturePath: "/events/crowd-atlas-mid.png",
    minScale: 0.85,
    maxScale: 1.15,
    baseWidth: 1.2,
    baseHeight: 2.0,
    color: "#070403",
    generatePositions: (count) => {
      const rand = pseudoRand(202);
      const positions = [];
      for (let i = 0; i < count; i++) {
        const angle = rand() * Math.PI * 2;
        const radius = 2.4 + rand() * 3.8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * (radius * 0.6) + 1.2;
        // Keep clear central viewing corridor
        if (Math.abs(x) < 1.0 && z > 1.0 && z < 4.0) {
          continue;
        }
        const scale = 0.85 + rand() * 0.3;
        positions.push({ x, y: 0, z, scale });
      }
      return positions;
    },
  }), [midCount]);

  // Far Layer Setup: 40-60 instances, deep background stadium mass
  const farLayerConfig: CrowdLayerConfig = useMemo(() => ({
    count: farCount,
    texturePath: "/events/crowd-atlas-far.png",
    minScale: 0.7,
    maxScale: 1.0,
    baseWidth: 1.1,
    baseHeight: 1.8,
    color: "#090503",
    generatePositions: (count) => {
      const rand = pseudoRand(303);
      const positions = [];
      for (let i = 0; i < count; i++) {
        const x = (rand() - 0.5) * 22;
        const z = -2.0 - rand() * 7.5;
        const scale = 0.7 + rand() * 0.3;
        positions.push({ x, y: 0, z, scale });
      }
      return positions;
    },
  }), [farCount]);

  useEffect(() => {
    // Populate instance matrices on mount
    const updateMesh = (
      meshRef: React.RefObject<THREE.InstancedMesh | null>,
      config: CrowdLayerConfig
    ) => {
      if (!meshRef.current) return;
      const dummy = new THREE.Object3D();
      const instances = config.generatePositions(config.count);
      instances.forEach((inst, i) => {
        dummy.position.set(inst.x, inst.y, inst.z);
        dummy.scale.set(inst.scale, inst.scale, 1);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    };

    updateMesh(nearMeshRef, nearLayerConfig);
    updateMesh(midMeshRef, midLayerConfig);
    updateMesh(farMeshRef, farLayerConfig);
  }, [nearLayerConfig, midLayerConfig, farLayerConfig]);

  // Geometries with translated pivots
  const nearGeom = useMemo(() => {
    const g = new THREE.PlaneGeometry(nearLayerConfig.baseWidth, nearLayerConfig.baseHeight);
    g.translate(0, nearLayerConfig.baseHeight / 2, 0);
    return g;
  }, [nearLayerConfig]);

  const midGeom = useMemo(() => {
    const g = new THREE.PlaneGeometry(midLayerConfig.baseWidth, midLayerConfig.baseHeight);
    g.translate(0, midLayerConfig.baseHeight / 2, 0);
    return g;
  }, [midLayerConfig]);

  const farGeom = useMemo(() => {
    const g = new THREE.PlaneGeometry(farLayerConfig.baseWidth, farLayerConfig.baseHeight);
    g.translate(0, farLayerConfig.baseHeight / 2, 0);
    return g;
  }, [farLayerConfig]);

  const nearMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: nearTex || undefined,
      transparent: true,
      alphaTest: 0.4,
      toneMapped: false,
      color: new THREE.Color("#050302"),
      depthWrite: true,
    });
  }, [nearTex]);

  const midMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: midTex || undefined,
      transparent: true,
      alphaTest: 0.4,
      toneMapped: false,
      color: new THREE.Color("#070403"),
      depthWrite: true,
    });
  }, [midTex]);

  const farMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: farTex || undefined,
      transparent: true,
      alphaTest: 0.4,
      toneMapped: false,
      color: new THREE.Color("#090503"),
      depthWrite: true,
    });
  }, [farTex]);

  return (
    <group name="crowd-field-3-layers">
      {/* 1. Near Foreground Layer (heavy DOF bokeh) */}
      <instancedMesh
        ref={nearMeshRef}
        args={[nearGeom, nearMat, nearLayerConfig.count]}
        renderOrder={2}
      />

      {/* 2. Mid Layer (stage perimeter) */}
      <instancedMesh
        ref={midMeshRef}
        args={[midGeom, midMat, midLayerConfig.count]}
        renderOrder={1}
      />

      {/* 3. Far Layer (fog-occluded background arena) */}
      <instancedMesh
        ref={farMeshRef}
        args={[farGeom, farMat, farLayerConfig.count]}
        renderOrder={0}
      />
    </group>
  );
}
