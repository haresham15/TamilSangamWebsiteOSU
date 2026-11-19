"use client";

// Art-pass gate: dressed limestone piers, forged iron leaves (one merged draw each) on the
// same hinge timing as the legacy CampusGate, the fixed overthrow, threshold stone and the
// pier's bronze plate.
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { chamferedBox } from "@/gl/art/geometry";
import { applyInstanceTransforms } from "@/gl/art/geometry";
import { createSurfaceMaterial, withSurfaceDetail } from "@/gl/art/surface";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { buildGateLeaf, buildOverthrow, mirrorX, LEAF_BASE_Y, LEAF_WIDTH } from "./ironwork";
import { buildGatePier, buildPierPlaque, PIER_X } from "./masonry";

/** Painted wrought iron: near-black semi-gloss paint, rust blooming low and in patches. */
export function createIronMaterial(space: "world" | "local") {
  return withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#1a1817", roughness: 0.46, metalness: 0.3 }), {
    scale: 9,
    albedoVariation: 0.3,
    tint: "#7a3f1e",
    tintAmount: 0.32,
    roughnessVariation: 0.16,
    bump: 0.0012,
    grimeColor: "#5a321a",
    grimeAmount: 0.6,
    grimeFrom: 0,
    grimeTo: 0.65,
    space,
  });
}

// Same mechanical timing as CampusGate (right leaf leads, settle bounce at the end).
const MAX_ANGLE = Math.PI * 0.44;
const easeDoor = (t: number) => {
  const s = t * t * (3 - 2 * t);
  const bounce = t > 0.85 ? Math.sin(((t - 0.85) / 0.15) * Math.PI) * 0.026 : 0;
  return s + bounce;
};

export function ArtGate({ gateProgressRef, quality = 0 }: { gateProgressRef: React.RefObject<number>; quality?: number }) {
  const leftHinge = useRef<THREE.Group>(null);
  const rightHinge = useRef<THREE.Group>(null);
  const piersRef = useRef<THREE.InstancedMesh>(null);

  const geometries = useMemo(
    () => ({
      leftLeaf: buildGateLeaf({ quality, lock: true }),
      rightLeaf: mirrorX(buildGateLeaf({ quality })),
      overthrow: buildOverthrow({ quality }),
      pier: buildGatePier(5),
      plaque: buildPierPlaque(),
      threshold: chamferedBox(6.72, 0.08, 0.6, 0.02),
    }),
    [quality]
  );

  const materials = useMemo(
    () => ({
      ironLeaf: createIronMaterial("local"),
      ironFixed: createIronMaterial("world"),
      limestone: createSurfaceMaterial(
        "stone",
        { color: "#d8c8a4", roughness: 0.84 },
        {
          cavity: true,
          scale: 3.6,
          albedoVariation: 0.16,
          tint: "#f0dfb8",
          tintAmount: 0.3,
          wearColor: "#e9dec6",
          wearAmount: 0.45,
          cavityColor: "#2a2318",
          cavityStrength: 0.7,
          // Rising damp: a green-grey stain fading up the plinth.
          grimeColor: "#3f4630",
          grimeAmount: 0.55,
          grimeFrom: 0,
          grimeTo: 1.5,
        }
      ),
      bronze: createSurfaceMaterial("bronze", { color: "#6a4b28" }),
      granite: createSurfaceMaterial("stone", { color: "#7d776d", roughness: 0.7 }, { scale: 6, albedoVariation: 0.22, tintAmount: 0.1, grimeAmount: 0.3, grimeTo: 0.1 }),
    }),
    []
  );
  useDisposeOnUnmount(geometries, materials);

  useEffect(() => {
    const mesh = piersRef.current;
    if (!mesh) return;
    applyInstanceTransforms(mesh, [
      { position: [-PIER_X, 0, 0] },
      { position: [PIER_X, 0, 0], rotation: [0, Math.PI, 0] },
    ]);
  }, [geometries.pier]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = gateProgressRef.current ?? 0;
    const pRight = Math.max(0, Math.min(1, (p - 0.22) / 0.6));
    const pLeft = Math.max(0, Math.min(1, (p - 0.26) / 0.59));
    if (leftHinge.current) {
      leftHinge.current.rotation.y = THREE.MathUtils.damp(leftHinge.current.rotation.y, -easeDoor(pLeft) * MAX_ANGLE, 8, dt);
    }
    if (rightHinge.current) {
      rightHinge.current.rotation.y = THREE.MathUtils.damp(rightHinge.current.rotation.y, easeDoor(pRight) * MAX_ANGLE, 8, dt);
    }
  });

  return (
    <group name="ArtGate">
      <instancedMesh ref={piersRef} args={[geometries.pier, materials.limestone, 2]} castShadow receiveShadow />
      <mesh geometry={geometries.plaque} material={materials.bronze} position={[-PIER_X, 2.35, 0.565]} castShadow />
      <mesh geometry={geometries.overthrow} material={materials.ironFixed} castShadow />
      <mesh geometry={geometries.threshold} material={materials.granite} position={[0, 0.04, 0]} receiveShadow />

      <group ref={leftHinge} position={[-LEAF_WIDTH, LEAF_BASE_Y, 0]}>
        <mesh geometry={geometries.leftLeaf} material={materials.ironLeaf} castShadow receiveShadow />
      </group>
      <group ref={rightHinge} position={[LEAF_WIDTH, LEAF_BASE_Y, 0]}>
        <mesh geometry={geometries.rightLeaf} material={materials.ironLeaf} castShadow receiveShadow />
      </group>
    </group>
  );
}
