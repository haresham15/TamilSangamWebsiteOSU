"use client";

// Ground for the art pass: flagstone path with worn arrises and mossy joints, stone kerbs,
// a grass verge, soft contact shadows under everything that stands on the ground, and
// fallen leaves gathered along the kerbs and pier bases (one instanced draw).
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { chamferedBox, mergeParts, seeded } from "@/gl/art/geometry";
import { createSurfaceMaterial, withSurfaceDetail } from "@/gl/art/surface";
import { ContactShadows, type ContactSpot } from "@/gl/art/ContactShadow";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { createLeafAtlasTexture } from "../leafAtlas";
import { withFlagstones, withGrass } from "./ground";
import { PIER_X } from "./masonry";
import { PERIMETER_PIERS, WALL_SEGMENTS, TREES } from "./layout";

const PATH = { half: 3.6, zNear: 14, zFar: -32 } as const;
const PATH_LEN = PATH.zNear - PATH.zFar;
const PATH_MID = (PATH.zNear + PATH.zFar) / 2;

const FALLEN = ["#8a6a2e", "#a7752f", "#6f5a2a", "#9c8a3a", "#5f6b2a", "#b5852f", "#7b4a22"].map((c) => new THREE.Color(c));

function fallenLeafTransforms(count: number) {
  const rand = seeded(41);
  const out: { position: [number, number, number]; yaw: number; tilt: number; scale: number; color: THREE.Color }[] = [];
  for (let i = 0; i < count; i++) {
    const r = rand();
    let x: number;
    let z: number;
    if (r < 0.62) {
      // Drifts against the kerbs, thicker near the gate.
      const side = rand() < 0.5 ? -1 : 1;
      z = 12 - Math.pow(rand(), 1.7) * 34;
      x = side * (PATH.half - 0.05 - Math.pow(rand(), 2.2) * 0.9);
    } else if (r < 0.82) {
      // Heaps at the pier bases and against the threshold.
      const side = rand() < 0.5 ? -1 : 1;
      x = side * (PIER_X - 0.9 + rand() * 0.7);
      z = 0.35 + rand() * 1.4;
    } else {
      // Strays across the path.
      x = (rand() - 0.5) * PATH.half * 1.7;
      z = 10 - rand() * 26;
    }
    out.push({
      position: [x, 0.012 + i * 0.00004, z],
      yaw: rand() * Math.PI * 2,
      tilt: (rand() - 0.5) * 0.5,
      scale: 0.15 + rand() * 0.12,
      color: FALLEN[Math.floor(rand() * FALLEN.length)].clone().multiplyScalar(0.8 + rand() * 0.35),
    });
  }
  return out;
}

const DUMMY = new THREE.Object3D();

/** Grass-blade alpha card: tapered blades rising from the bottom edge, grey-level tone. */
function createGrassTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const rand = seeded(77);
  for (let i = 0; i < 26; i++) {
    const x = 10 + rand() * 108;
    const h = 50 + rand() * 76;
    const lean = (rand() - 0.5) * 34;
    const w = 3 + rand() * 4;
    const g = Math.round(205 + rand() * 50);
    const grad = ctx.createLinearGradient(0, 128, 0, 128 - h);
    grad.addColorStop(0, `rgb(${Math.round(g * 0.8)},${Math.round(g * 0.8)},${Math.round(g * 0.8)})`);
    grad.addColorStop(1, `rgb(${g},${g},${g})`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x - w, 128);
    ctx.quadraticCurveTo(x + lean * 0.3, 128 - h * 0.6, x + lean, 128 - h);
    ctx.quadraticCurveTo(x + lean * 0.3 + w * 0.4, 128 - h * 0.6, x + w, 128);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Two crossed cards, base at y = 0, normals straight up so tufts shade like the lawn. */
function createTuftGeometry() {
  const a = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
  const b = a.clone().rotateY(Math.PI / 2);
  const g = mergeParts([{ geometry: a }, { geometry: b }]);
  const n = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
  return g;
}

const GRASS_TONES = ["#7c9a44", "#8aa24c", "#70903d", "#98a755", "#7a9442", "#a39a52", "#6b8a3a"].map((c) => new THREE.Color(c));

function tuftTransforms(count: number) {
  const rand = seeded(53);
  const out: { position: [number, number, number]; yaw: number; sx: number; sy: number; color: THREE.Color }[] = [];
  for (let i = 0; i < count; i++) {
    const side = rand() < 0.5 ? -1 : 1;
    // Most tufts close to the camera and the kerbs, where the eye lands.
    const z = 13 - Math.pow(rand(), 1.6) * 27;
    const edge = rand() < 0.45;
    const x = side * (edge ? PATH.half + 0.32 + rand() * 0.5 : PATH.half + 0.35 + Math.pow(rand(), 1.3) * 9);
    if (Math.abs(z) < 0.45 && Math.abs(x) > 4.3) continue; // inside the wall footing
    out.push({
      position: [x, -0.02, z],
      yaw: rand() * Math.PI,
      sx: 0.4 + rand() * 0.45,
      sy: 0.12 + rand() * 0.16,
      color: GRASS_TONES[Math.floor(rand() * GRASS_TONES.length)].clone().multiplyScalar(0.85 + rand() * 0.3),
    });
  }
  return out;
}

export function PavedApproach({ tier = "A" }: { tier?: "A" | "B" | "C" }) {
  const leafCount = tier === "A" ? 340 : 150;
  const leavesRef = useRef<THREE.InstancedMesh>(null);
  const tuftsRef = useRef<THREE.InstancedMesh>(null);
  const tufts = useMemo(() => tuftTransforms(tier === "A" ? 5200 : 2000), [tier]);

  const geometries = useMemo(() => {
    const leaf = new THREE.PlaneGeometry(1, 1);
    leaf.rotateX(-Math.PI / 2);
    // Buckeye half of the shared leaf atlas.
    const uv = leaf.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 0.5);
    return {
      lawn: new THREE.PlaneGeometry(90, 90).rotateX(-Math.PI / 2),
      path: new THREE.PlaneGeometry(PATH.half * 2, PATH_LEN).rotateX(-Math.PI / 2),
      kerb: chamferedBox(0.28, 0.14, PATH_LEN, 0.03),
      leaf,
      tuft: createTuftGeometry(),
    };
  }, []);

  const atlas = useMemo(() => createLeafAtlasTexture({ blossom: true }), []);
  const grassTex = useMemo(() => createGrassTexture(), []);

  const materials = useMemo(
    () => ({
      lawn: withGrass(
        withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#62792f", roughness: 0.96 }), {
          scale: 1.1,
          albedoVariation: 0.4,
          tint: "#b8a64c",
          tintAmount: 0.45,
          roughnessVariation: 0.03,
          bump: 0.006,
        })
      ),
      path: withFlagstones(
        withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#d2c19f", roughness: 0.86 }), {
          scale: 2.2,
          albedoVariation: 0.14,
          tint: "#c4ad84",
          tintAmount: 0.3,
          roughnessVariation: 0.1,
          bump: 0.002,
        }),
        { pathHalf: PATH.half }
      ),
      kerb: createSurfaceMaterial("stone", { color: "#b3a78f" }, { scale: 3, grimeColor: "#3b4128", grimeAmount: 0.5, grimeFrom: 0, grimeTo: 0.2, tintAmount: 0.2 }),
      leaf: new THREE.MeshStandardMaterial({ map: atlas, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.85 }),
      tuft: new THREE.MeshStandardMaterial({ map: grassTex, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.95 }),
    }),
    [atlas, grassTex]
  );
  useDisposeOnUnmount(geometries, materials, atlas, grassTex);

  useEffect(() => {
    const mesh = tuftsRef.current;
    if (!mesh) return;
    tufts.forEach((t, i) => {
      DUMMY.position.set(...t.position);
      DUMMY.rotation.set(0, t.yaw, 0);
      DUMMY.scale.set(t.sx, t.sy, t.sx);
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);
      mesh.setColorAt(i, t.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [tufts]);

  const spots = useMemo<ContactSpot[]>(
    () => [
      ...[-PIER_X, PIER_X].map((x) => ({ position: [x, 0, 0] as [number, number, number], size: [2.1, 2.0] as [number, number], opacity: 0.8 })),
      ...PERIMETER_PIERS.map((x) => ({ position: [x, 0, 0] as [number, number, number], size: [1.3, 1.3] as [number, number], opacity: 0.7 })),
      ...WALL_SEGMENTS.map(([x0, x1]) => ({ position: [(x0 + x1) / 2, 0, 0] as [number, number, number], size: [x1 - x0 + 0.3, 0.95] as [number, number], opacity: 0.6 })),
      ...TREES.map((t) => ({ position: [t.position[0], 0, t.position[2]] as [number, number, number], size: [1.8, 1.8] as [number, number], opacity: 0.55 })),
      { position: [0, 0, 0.05], size: [7.0, 0.8], opacity: 0.55 },
      // The bicycle leaning on the wall (CampusProps).
      { position: [-5.4, 0, 0.3], size: [1.5, 0.42], rotation: 0.22, opacity: 0.6 },
    ],
    []
  );

  const leaves = useMemo(() => fallenLeafTransforms(leafCount), [leafCount]);
  useEffect(() => {
    const mesh = leavesRef.current;
    if (!mesh) return;
    leaves.forEach((l, i) => {
      DUMMY.position.set(...l.position);
      DUMMY.rotation.set(l.tilt, l.yaw, l.tilt * 0.6);
      DUMMY.scale.setScalar(l.scale);
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);
      mesh.setColorAt(i, l.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [leaves]);

  return (
    <group name="PavedApproach">
      <mesh geometry={geometries.lawn} material={materials.lawn} position={[0, -0.02, -12]} receiveShadow />
      <mesh geometry={geometries.path} material={materials.path} position={[0, 0.004, PATH_MID]} receiveShadow />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geometries.kerb} material={materials.kerb} position={[s * (PATH.half + 0.12), 0.05, PATH_MID]} receiveShadow />
      ))}
      <ContactShadows spots={spots} softness={0.85} />
      {grassTex && <instancedMesh key={tufts.length} ref={tuftsRef} args={[geometries.tuft, materials.tuft, tufts.length]} receiveShadow />}
      {atlas && <instancedMesh ref={leavesRef} args={[geometries.leaf, materials.leaf, leafCount]} receiveShadow />}
    </group>
  );
}
