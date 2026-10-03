"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export type IronVariant = "a" | "b";

interface JoinMaterialsManagerProps {
  ironVariant?: IronVariant;
  pillarMaterialMode?: "limestone" | "brick";
}

/**
 * JoinMaterialsManager (Phase 3: Materials — §4)
 *
 * Ground truth PBR materials applied dynamically without violating
 * the frozen CampusGate.tsx contract:
 * - Stone pillars: Limestone PBR set (#E8E4D9, roughness ~0.9, normal map, 1k)
 * - Iron Variant A: metalness 0.9, roughness 0.25, color #1A1A1A
 * - Iron Variant B (recommended): color #141414, metalness 0.35, roughness 0.42, clearcoat 0.3, clearcoatRoughness 0.4
 * - Brass fixtures: metalness 1.0, roughness 0.3
 */
export function JoinMaterialsManager({
  ironVariant = "b",
  pillarMaterialMode = "limestone",
}: JoinMaterialsManagerProps) {
  const { scene } = useThree();

  // Load PBR textures from public/textures/join/ via TextureLoader in useMemo
  const limestoneDiffuse = useMemo(() => {
    const tex = new THREE.TextureLoader().load("/textures/join/limestone_diffuse.png");
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.5, 4);
    tex.anisotropy = 8;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const limestoneNormal = useMemo(() => {
    const tex = new THREE.TextureLoader().load("/textures/join/limestone_normal.png");
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.5, 4);
    tex.anisotropy = 8;
    return tex;
  }, []);

  const limestoneRoughness = useMemo(() => {
    const tex = new THREE.TextureLoader().load("/textures/join/limestone_roughness.png");
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.5, 4);
    tex.anisotropy = 8;
    return tex;
  }, []);

  // Limestone PBR Material
  const limestoneMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#E8E4D9",
      map: limestoneDiffuse,
      normalMap: limestoneNormal,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: limestoneRoughness,
      roughness: 0.9,
      metalness: 0.05,
    });
  }, [limestoneDiffuse, limestoneNormal, limestoneRoughness]);

  // Iron Variant A: High-metal specular iron
  const ironMatA = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#1A1A1A",
      metalness: 0.9,
      roughness: 0.25,
    });
  }, []);

  // Iron Variant B (Recommended): Matte architectural iron with clearcoat
  const ironMatB = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#141414",
      metalness: 0.35,
      roughness: 0.42,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
    });
  }, []);

  // Track original materials so we can restore on unmount if needed
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());

  useEffect(() => {
    const originalMap = originalMaterialsRef.current;
    const targetIronMat = ironVariant === "a" ? ironMatA : ironMatB;

    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;

      const mat = obj.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | undefined;
      if (!mat) return;

      // Remember original material if not stored yet
      if (!originalMap.has(obj)) {
        originalMap.set(obj, obj.material);
      }

      // 1. Identify Pillar Meshes (Brick body meshes)
      if (
        pillarMaterialMode === "limestone" &&
        obj.geometry instanceof THREE.BoxGeometry &&
        obj.geometry.parameters.width === 1.1 &&
        obj.geometry.parameters.height === 5.2
      ) {
        obj.material = limestoneMaterial;
        obj.castShadow = true;
        obj.receiveShadow = true;
      }

      // 2. Identify Pillar Stone Caps & Finials
      if (
        pillarMaterialMode === "limestone" &&
        ((obj.geometry instanceof THREE.BoxGeometry &&
          (obj.geometry.parameters.height === 0.4 ||
            obj.geometry.parameters.height === 0.15 ||
            obj.geometry.parameters.height === 0.3)) ||
          obj.geometry instanceof THREE.SphereGeometry)
      ) {
        obj.material = limestoneMaterial;
      }

      // 3. Identify Iron Transom, Arch, and Bars
      if (
        (obj.geometry instanceof THREE.TubeGeometry ||
          (obj.geometry instanceof THREE.BoxGeometry &&
            obj.geometry.parameters.width === 7.7) ||
          (obj.geometry instanceof THREE.BoxGeometry &&
            obj.geometry.parameters.width === 0.05 &&
            obj.geometry.parameters.depth === 0.05))
      ) {
        obj.material = targetIronMat;
        obj.castShadow = true;
      }

      // 4. Identify Lattice Leaf Alpha Planes
      if (
        obj.geometry instanceof THREE.PlaneGeometry &&
        obj.geometry.parameters.width === 3.3 &&
        obj.geometry.parameters.height === 4.4
      ) {
        // Adjust lattice material PBR properties to match selected variant
        if (ironVariant === "a") {
          mat.color.set("#1A1A1A");
          mat.metalness = 0.9;
          mat.roughness = 0.25;
        } else {
          mat.color.set("#141414");
          mat.metalness = 0.35;
          mat.roughness = 0.42;
        }
        mat.needsUpdate = true;
      }
    });

    return () => {
      // Cleanup materials created here
    };
  }, [ironVariant, pillarMaterialMode, limestoneMaterial, ironMatA, ironMatB, scene]);

  useEffect(() => {
    return () => {
      limestoneMaterial.dispose();
      ironMatA.dispose();
      ironMatB.dispose();
    };
  }, [limestoneMaterial, ironMatA, ironMatB]);

  return null;
}
