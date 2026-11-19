"use client";

// Everything behind and beside the gate for the art pass: brick perimeter piers and walls
// with iron railings, the tree avenue (trunks merged, canopies as one instanced draw), a
// foreground branch for depth, and the heritage hall softened by morning haze.
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { applyInstanceTransforms, chamferedBox, latheProfile, mergeParts, type Part } from "@/gl/art/geometry";
import { createSurfaceMaterial, withSurfaceDetail } from "@/gl/art/surface";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { SUN_DIR } from "../env/sun";
import { createIronMaterial } from "./ArtGate";
import { buildCanopyCards, buildTrunks, createCanopyDepthMaterial, createCanopyMaterial, createLeafClusterTexture, taperedTube } from "./foliage";
import { buildHall } from "./hall";
import { buildBrickPierBody, buildPierTrim, withBrickCourses } from "./masonry";
import { canopiesFor, FOREGROUND_BRANCH, foregroundCanopies, PERIMETER_PIERS, TREES, WALL_SEGMENTS } from "./layout";

const WALL_H = 0.95;
const HALL_Z = -38;

function buildRailings(quality: number) {
  const parts: Part[] = [];
  const y0 = WALL_H + 0.1;
  const h = 1.15;
  for (const [x0, x1] of WALL_SEGMENTS) {
    const len = x1 - x0 - 0.1;
    const cx = (x0 + x1) / 2;
    parts.push({ geometry: chamferedBox(len, 0.04, 0.04, 0.005), position: [cx, y0 + 0.12, 0] });
    parts.push({ geometry: chamferedBox(len, 0.04, 0.04, 0.005), position: [cx, y0 + h - 0.12, 0] });
    const n = Math.floor(len / 0.15);
    for (let i = 0; i <= n; i++) {
      const x = x0 + 0.05 + (len * i) / n;
      parts.push({ geometry: new THREE.CylinderGeometry(0.011, 0.011, h, quality > 0 ? 5 : 6, 1, true), position: [x, y0 + h / 2, 0] });
      // Coarse spear: at railing scale the turned profile costs ~400 triangles for nothing.
      parts.push({ geometry: latheProfile([[0.012, 0], [0.022, 0.035], [0.008, 0.08], [0, 0.12]], { radialSegments: 6 }), position: [x, y0 + h, 0] });
    }
  }
  return mergeParts(parts);
}

function buildWalls() {
  const body: Part[] = [];
  const coping: Part[] = [];
  for (const [x0, x1] of WALL_SEGMENTS) {
    const len = x1 - x0;
    const cx = (x0 + x1) / 2;
    body.push({ geometry: chamferedBox(len, WALL_H - 0.25, 0.4, 0.01), position: [cx, 0.25 + (WALL_H - 0.25) / 2, 0] });
    coping.push({ geometry: chamferedBox(len, 0.25, 0.46, 0.02), position: [cx, 0.125, 0] });
    coping.push({ geometry: chamferedBox(len + 0.02, 0.1, 0.52, 0.02), position: [cx, WALL_H + 0.05, 0] });
  }
  return { body: mergeParts(body), coping: mergeParts(coping) };
}

export function CampusBackdrop({ tier = "A", quality = 0 }: { tier?: "A" | "B" | "C"; quality?: number }) {
  const pierBodies = useRef<THREE.InstancedMesh>(null);
  const pierTrims = useRef<THREE.InstancedMesh>(null);
  const cardsPerTree = tier === "A" && quality === 0 ? 115 : 55;

  const geometries = useMemo(() => {
    const walls = buildWalls();
    const branch = taperedTube(FOREGROUND_BRANCH.map((p) => new THREE.Vector3(...p)), 0.16, 0.025, 14, 7);
    // A few twigs off the foreground branch.
    const twigs: Part[] = [
      { geometry: taperedTube([new THREE.Vector3(-5.4, 5.5, 9.5), new THREE.Vector3(-5.0, 5.0, 9.7), new THREE.Vector3(-4.6, 4.7, 9.9)], 0.04, 0.01, 6, 5) },
      { geometry: taperedTube([new THREE.Vector3(-3.6, 4.65, 9.2), new THREE.Vector3(-3.3, 4.3, 9.0), new THREE.Vector3(-3.0, 4.1, 8.9)], 0.035, 0.008, 6, 5) },
    ];
    return {
      pierBody: buildBrickPierBody(),
      pierTrim: buildPierTrim(),
      wallBody: walls.body,
      wallCoping: walls.coping,
      railings: buildRailings(quality),
      trunks: buildTrunks(TREES, [{ geometry: branch }, ...twigs]),
      canopy: buildCanopyCards([...canopiesFor(TREES, cardsPerTree), ...foregroundCanopies(tier === "A" ? 26 : 16)]),
      hall: buildHall(),
    };
  }, [quality, cardsPerTree, tier]);

  const clusterTex = useMemo(() => createLeafClusterTexture(), []);

  const materials = useMemo(() => {
    const brick = withBrickCourses(
      withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#ad5838", roughness: 0.9 }), {
        scale: 2.5,
        albedoVariation: 0.16,
        tint: "#8c3f26",
        tintAmount: 0.35,
        roughnessVariation: 0.06,
        bump: 0.002,
        grimeColor: "#3a3324",
        grimeAmount: 0.45,
        grimeFrom: 0,
        grimeTo: 0.9,
      })
    );
    const limestone = createSurfaceMaterial("stone", { color: "#d6c5a2" }, { scale: 3, tint: "#efdcb4", tintAmount: 0.3, grimeColor: "#3f4630", grimeAmount: 0.45, grimeFrom: 0, grimeTo: 0.6 });
    return {
      brick,
      limestone,
      iron: createIronMaterial("world"),
      bark: withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#3b3027", roughness: 0.95 }), {
        scale: 6,
        albedoVariation: 0.35,
        tint: "#59604a",
        tintAmount: 0.35,
        bump: 0.012,
        grimeAmount: 0,
      }),
      canopy: clusterTex ? createCanopyMaterial(clusterTex, SUN_DIR) : null,
      canopyDepth: clusterTex ? createCanopyDepthMaterial(clusterTex) : null,
      hallBrick: withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#ae6042", roughness: 0.9 }), { scale: 0.8, albedoVariation: 0.12, tint: "#8f4a30", tintAmount: 0.3, bump: 0 }),
      hallStone: withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#e4d6b6", roughness: 0.85 }), { scale: 1.2, albedoVariation: 0.1, bump: 0 }),
      glass: new THREE.MeshStandardMaterial({ color: "#2d3946", roughness: 0.12, metalness: 0.7 }),
      slate: withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#4b5059", roughness: 0.72 }), { scale: 1.5, albedoVariation: 0.12, bump: 0 }),
      copper: withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#5d8a78", roughness: 0.6, metalness: 0.35 }), { scale: 2, albedoVariation: 0.2, tint: "#3d5a4c", tintAmount: 0.4, bump: 0 }),
      dark: new THREE.MeshStandardMaterial({ color: "#1c1714", roughness: 0.9 }),
      wood: withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#4a2a1a", roughness: 0.55 }), { scale: 4, albedoVariation: 0.2, bump: 0 }),
    };
  }, [clusterTex]);
  useDisposeOnUnmount(materials, clusterTex);
  useEffect(
    () => () => {
      const { hall, ...rest } = geometries;
      Object.values(rest).forEach((g) => g.dispose());
      Object.values(hall).forEach((g) => g.dispose());
    },
    [geometries]
  );

  useEffect(() => {
    const transforms = PERIMETER_PIERS.map((x) => ({ position: [x, 0, 0] as [number, number, number] }));
    if (pierBodies.current) applyInstanceTransforms(pierBodies.current, transforms);
    if (pierTrims.current) applyInstanceTransforms(pierTrims.current, transforms);
  }, [geometries]);

  const { hall } = geometries;
  return (
    <group name="CampusBackdrop">
      <instancedMesh ref={pierBodies} args={[geometries.pierBody, materials.brick, PERIMETER_PIERS.length]} castShadow receiveShadow />
      <instancedMesh ref={pierTrims} args={[geometries.pierTrim, materials.limestone, PERIMETER_PIERS.length]} castShadow receiveShadow />
      <mesh geometry={geometries.wallBody} material={materials.brick} castShadow receiveShadow />
      <mesh geometry={geometries.wallCoping} material={materials.limestone} castShadow receiveShadow />
      <mesh geometry={geometries.railings} material={materials.iron} castShadow />

      <mesh geometry={geometries.trunks} material={materials.bark} castShadow receiveShadow />
      {materials.canopy && materials.canopyDepth && (
        <mesh geometry={geometries.canopy} material={materials.canopy} customDepthMaterial={materials.canopyDepth} castShadow />
      )}

      <group position={[0, 0, HALL_Z]} name="HeritageHall">
        <mesh geometry={hall.brick} material={materials.hallBrick} />
        <mesh geometry={hall.stone} material={materials.hallStone} />
        <mesh geometry={hall.glass} material={materials.glass} />
        <mesh geometry={hall.slate} material={materials.slate} />
        <mesh geometry={hall.copper} material={materials.copper} />
        <mesh geometry={hall.dark} material={materials.dark} />
        <mesh geometry={hall.wood} material={materials.wood} />
      </group>
    </group>
  );
}
