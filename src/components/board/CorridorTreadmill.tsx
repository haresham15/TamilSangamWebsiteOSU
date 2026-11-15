"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { TapestryPortrait } from "./TapestryPortrait";
import { useStaticBatch } from "@/gl/useStaticBatch";
import { CURRENT_BOARD } from "@/data/board";
import { useBoardHeroStore } from "@/store/boardHeroStore";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { proceduralPbrMaps } from "@/lib/proceduralPbrMaps";
import { noise1D } from "./noise";
import {
  AISLE_WIDTH,
  ARCH_PARTS,
  POOL_SIZE,
  UNIT_LENGTH,
  lampPositions,
  nearestLampPair,
  partPositions,
  segmentZ,
  type ArchGeometryKey,
  type ArchMaterialKey,
  type Vec3,
} from "./corridorLayout";

export { AISLE_WIDTH, PILLAR_HEIGHT, POOL_SIZE, UNIT_LENGTH } from "./corridorLayout";

/**
 * §3 Chola corridor, instanced.
 *
 * The colonnade units never move (the crane camera does), so every architectural part is
 * one InstancedMesh across all units, and every lamp part is one InstancedMesh across all
 * 14 lamps. Before: ~250 draws plus 16 point lights (an unconditional "glow core" light per
 * lamp). Now: 11 architecture + 6 lamp-body + 1 flame draw, and exactly two real point
 * lights that follow the nearest lamps, which is the PRD's own cap (§5: real lights 2–3).
 */

const DUMMY = new THREE.Object3D();

function useInstancedPlacement(
  ref: React.RefObject<THREE.InstancedMesh | null>,
  transforms: { position: Vec3; rotation?: Vec3 }[]
) {
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    transforms.forEach(({ position, rotation }, i) => {
      DUMMY.position.set(...position);
      DUMMY.rotation.set(...(rotation ?? [0, 0, 0]));
      DUMMY.scale.setScalar(1);
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [ref, transforms]);
}

function InstancedPart({
  geometry,
  material,
  transforms,
  castShadow,
  receiveShadow,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  transforms: { position: Vec3; rotation?: Vec3 }[];
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useInstancedPlacement(ref, transforms);
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, transforms.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}

// ---------------------------------------------------------------------------
// Lamps (Chola kuthuvilakku wall sconces), same parts and offsets as OilLamp.
// ---------------------------------------------------------------------------

const LAMP_PARTS: {
  key: string;
  geometry: () => THREE.BufferGeometry;
  material: () => THREE.Material;
  offset: Vec3;
  rotation?: Vec3;
}[] = [
  { key: "plate", geometry: () => new THREE.BoxGeometry(0.24, 0.45, 0.08), material: () => new THREE.MeshStandardMaterial({ color: "#2d1e15", roughness: 0.85, metalness: 0.6 }), offset: [0, 0, -0.22] },
  { key: "arm", geometry: () => new THREE.CylinderGeometry(0.035, 0.045, 0.28, 8), material: () => new THREE.MeshStandardMaterial({ color: "#4a331f", roughness: 0.7, metalness: 0.75 }), offset: [0, -0.08, -0.1] },
  { key: "vessel", geometry: () => new THREE.CylinderGeometry(0.18, 0.09, 0.12, 16), material: () => new THREE.MeshStandardMaterial({ color: "#5c3f25", roughness: 0.6, metalness: 0.8 }), offset: [0, 0, 0] },
  { key: "base", geometry: () => new THREE.CylinderGeometry(0.12, 0.16, 0.06, 16), material: () => new THREE.MeshStandardMaterial({ color: "#3b2614", roughness: 0.7, metalness: 0.85 }), offset: [0, -0.06, 0] },
  { key: "oil", geometry: () => new THREE.CircleGeometry(0.16, 16), material: () => new THREE.MeshStandardMaterial({ color: "#1f140a", roughness: 0.15, metalness: 0.4 }), offset: [0, 0.05, 0], rotation: [-Math.PI / 2, 0, 0] },
  { key: "wick", geometry: () => new THREE.CylinderGeometry(0.015, 0.015, 0.06, 8), material: () => new THREE.MeshStandardMaterial({ color: "#1a1208", roughness: 0.9 }), offset: [0, 0.08, 0.04] },
];

const LAMP_PHASE = (lampIndex: number) => Math.floor(lampIndex / 2) * 1.3 + (lampIndex % 2) * 3.14;

// Flicker identical to OilLamp's CPU noise1D, evaluated per instance on the GPU.
const FLAME_VERT = /* glsl */ `
  attribute float aPhase;
  varying vec2 vUv;
  varying float vPhase;
  void main() {
    vUv = uv;
    vPhase = aPhase;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

const FLAME_FRAG = /* glsl */ `
  varying vec2 vUv;
  varying float vPhase;
  uniform float uTime;
  uniform float uCinematic;

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }
  float noise1D(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash11(i), hash11(i + 1.0), u) * 2.0 - 1.0;
  }

  void main() {
    float intensity = (0.85 + 0.35 * noise1D(uTime * 4.2 + vPhase * 17.3)) * 1.5;
    float windFlutter = uCinematic > 0.5 ? sin(uTime * 14.0 + vUv.y * 7.0 + vPhase * 3.0) * 0.035 * (1.0 - vUv.y) : 0.0;
    vec2 centeredUv = (vUv - vec2(0.5, 0.28)) + vec2(windFlutter, 0.0);
    float radial = smoothstep(0.48, 0.0, length(centeredUv * vec2(1.5, 0.88)));
    float verticalFade = pow(1.0 - clamp(vUv.y, 0.0, 1.0), 1.6);
    float flicker = 0.92 + 0.08 * sin(uTime * 13.0 + vPhase) * cos(uTime * 7.3);
    vec3 flameCol = mix(vec3(0.78, 0.35, 0.19), vec3(1.0, 0.88, 0.55), radial);
    gl_FragColor = vec4(flameCol * flicker, radial * verticalFade * intensity);
  }
`;

function CorridorLamps({ cinematic }: { cinematic: boolean }) {
  const lamps = useMemo(() => lampPositions(), []);

  const parts = useMemo(
    () =>
      LAMP_PARTS.map((p) => ({
        key: p.key,
        geometry: p.geometry(),
        material: p.material(),
        transforms: lamps.map((l) => ({
          position: [l[0] + p.offset[0], l[1] + p.offset[1], l[2] + p.offset[2]] as Vec3,
          rotation: p.rotation,
        })),
      })),
    [lamps]
  );

  const flame = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(0.22, 0.36);
    const phases = new Float32Array(lamps.length * 2);
    lamps.forEach((_, i) => {
      phases[i * 2] = LAMP_PHASE(i);
      phases[i * 2 + 1] = LAMP_PHASE(i);
    });
    geometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: FLAME_VERT,
      fragmentShader: FLAME_FRAG,
      uniforms: { uTime: { value: 0 }, uCinematic: { value: cinematic ? 1 : 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    // Two crossed billboards per lamp (0° and 90° about Y), as in OilLamp.
    const transforms = lamps.flatMap((l) => {
      const position: Vec3 = [l[0], l[1] + 0.24, l[2] + 0.04];
      return [{ position }, { position, rotation: [0, Math.PI / 2, 0] as Vec3 }];
    });
    return { geometry, material, transforms };
  }, [lamps, cinematic]);

  useEffect(
    () => () => {
      for (const p of parts) {
        p.geometry.dispose();
        p.material.dispose();
      }
      flame.geometry.dispose();
      flame.material.dispose();
    },
    [parts, flame]
  );

  // Two real lights that follow the nearest lamp pair; flicker matches the flame shader.
  const lightA = useRef<THREE.PointLight>(null);
  const lightB = useRef<THREE.PointLight>(null);
  const lastPair = useRef<[number, number]>([-1, -1]);

  useEffect(() => {
    useBoardHeroStore.getState().setActiveRealLights(2);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const time = state.clock.elapsedTime;
    flame.material.uniforms.uTime.value = time;

    const pair = nearestLampPair(state.camera.position.z);
    const lights = [lightA.current, lightB.current];
    pair.forEach((lampIndex, k) => {
      const light = lights[k];
      if (!light || lampIndex < 0) return;
      if (lastPair.current[k] !== lampIndex) {
        const l = lamps[lampIndex];
        light.position.set(l[0], l[1] + 0.25, l[2] + 0.15);
        lastPair.current[k] = lampIndex;
      }
      const n = noise1D(time * 4.2 + LAMP_PHASE(lampIndex) * 17.3);
      light.intensity = (0.85 + 0.35 * n) * 2.8;
      if (cinematic) light.color.setRGB(1.0, 0.6 + 0.08 * n, 0.24);
    });
  });

  return (
    <group>
      {parts.map((p) => (
        <InstancedPart key={p.key} geometry={p.geometry} material={p.material} transforms={p.transforms} />
      ))}
      <InstancedPart geometry={flame.geometry} material={flame.material} transforms={flame.transforms} />
      <pointLight ref={lightA} color="#FF9E44" intensity={2.8} distance={8} decay={2} />
      <pointLight ref={lightB} color="#FF9E44" intensity={2.8} distance={8} decay={2} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Architecture
// ---------------------------------------------------------------------------

type Geometries = Record<ArchGeometryKey, THREE.BufferGeometry>;
type Materials = Record<ArchMaterialKey, THREE.Material>;

function createArchitecture(cinematic: boolean): { geometries: Geometries; materials: Materials } {
  const geometries: Geometries = {
    floor: new THREE.BoxGeometry(AISLE_WIDTH + 2.4, 0.3, UNIT_LENGTH),
    inlay: new THREE.BoxGeometry(AISLE_WIDTH - 0.8, 0.01, UNIT_LENGTH - 0.1),
    groove: new THREE.BoxGeometry(AISLE_WIDTH - 0.7, 0.005, 0.03),
    plinth: new THREE.BoxGeometry(0.7, 0.6, 0.7),
    shaft: new THREE.CylinderGeometry(0.26, 0.28, 2.8, 8),
    capital: new THREE.BoxGeometry(0.85, 0.2, 0.85),
    bracket: new THREE.BoxGeometry(0.45, 0.3, 0.6),
    crossBeam: new THREE.BoxGeometry(AISLE_WIDTH + 0.8, 0.45, 0.7),
    ceiling: new THREE.BoxGeometry(AISLE_WIDTH + 2.0, 0.3, UNIT_LENGTH),
    joist: new THREE.BoxGeometry(0.5, 0.35, UNIT_LENGTH),
    opening: new THREE.BoxGeometry(0.1, 3.2, UNIT_LENGTH - 0.4),
  };
  const floor = new THREE.MeshStandardMaterial({ color: "#120E0C", roughness: 0.18, metalness: 0.45 });
  const inlay = new THREE.MeshStandardMaterial({ color: "#1A1412", roughness: 0.15, metalness: 0.5 });
  const plinth = new THREE.MeshStandardMaterial({ color: "#4d3524", roughness: 0.88, metalness: 0.25 });
  const shaft = new THREE.MeshStandardMaterial({ color: "#5e412c", roughness: 0.85, metalness: 0.2 });
  const materials: Materials = {
    floor,
    inlay,
    darkGroove: new THREE.MeshBasicMaterial({ color: "#1a110a" }),
    plinth,
    shaft,
    capital: new THREE.MeshStandardMaterial({ color: "#6b4a32", roughness: 0.8, metalness: 0.3 }),
    corbel: new THREE.MeshStandardMaterial({ color: "#543a27", roughness: 0.8, metalness: 0.25 }),
    crossBeam: new THREE.MeshStandardMaterial({ color: "#4a3321", roughness: 0.85, metalness: 0.2 }),
    ceiling: new THREE.MeshStandardMaterial({ color: "#2d1d12", roughness: 0.92, metalness: 0.1 }),
    joist: new THREE.MeshStandardMaterial({ color: "#3d281a", roughness: 0.88 }),
    opening: new THREE.MeshBasicMaterial({ color: "#1a110a" }),
  };

  if (cinematic) {
    const graniteNormal = proceduralPbrMaps.getGraniteNormal("board-corridor-granite", 256, 256);
    const floorRough = proceduralPbrMaps.getNoiseRoughness("board-corridor-rough", 256, 256, 0.14, 0.32);
    floor.normalMap = graniteNormal;
    floor.roughnessMap = floorRough;
    floor.normalScale = new THREE.Vector2(0.35, 0.35);
    inlay.normalMap = graniteNormal;
    inlay.roughnessMap = floorRough;
    inlay.normalScale = new THREE.Vector2(0.25, 0.25);
    plinth.normalMap = graniteNormal;
    plinth.normalScale = new THREE.Vector2(0.2, 0.2);
    shaft.normalMap = graniteNormal;
    shaft.normalScale = new THREE.Vector2(0.15, 0.15);
  }
  return { geometries, materials };
}

export function CorridorTreadmill() {
  const [cinematic] = React.useState(() => isHeroCinematicEnabled("board"));
  const arch = useMemo(() => createArchitecture(cinematic), [cinematic]);
  const placements = useMemo(
    () => ARCH_PARTS.map((part) => partPositions(part).map((position) => ({ position }))),
    []
  );

  // One shared set of banner trim materials → all 7 banners' rods/finials/cords batch
  // into 3 draws (cloth meshes keep their own portrait material and stay separate).
  const trimMaterials = useMemo(
    () => ({
      rod: new THREE.MeshStandardMaterial({ color: "#8A6D1C", roughness: 0.4, metalness: 0.85 }),
      finial: new THREE.MeshStandardMaterial({ color: "#A6F0CF", roughness: 0.3, metalness: 0.9 }),
      cord: new THREE.MeshBasicMaterial({ color: "#3d2714" }),
    }),
    []
  );
  useEffect(() => () => Object.values(trimMaterials).forEach((m) => m.dispose()), [trimMaterials]);
  const bannersRef = useRef<THREE.Group>(null);
  useStaticBatch(bannersRef);

  useEffect(
    () => () => {
      Object.values(arch.geometries).forEach((g) => g.dispose());
      Object.values(arch.materials).forEach((m) => m.dispose());
      if (cinematic) {
        proceduralPbrMaps.release("board-corridor-granite");
        proceduralPbrMaps.release("board-corridor-rough");
      }
    },
    [arch, cinematic]
  );

  return (
    <group>
      {ARCH_PARTS.map((part, i) => (
        <InstancedPart
          key={part.geometry}
          geometry={arch.geometries[part.geometry]}
          material={arch.materials[part.material]}
          transforms={placements[i]}
          castShadow={part.castShadow}
          receiveShadow={part.receiveShadow}
        />
      ))}

      <CorridorLamps cinematic={cinematic} />

      {/* Silk tapestry banners: one per unit, alternating aisle sides (unchanged placement). */}
      <group ref={bannersRef}>
      {Array.from({ length: POOL_SIZE }, (_, unit) => {
        const isLeft = unit % 2 === 0;
        const member = CURRENT_BOARD[(unit * 2 + (isLeft ? 0 : 1)) % CURRENT_BOARD.length];
        const x = isLeft ? -AISLE_WIDTH / 2 + 0.2 : AISLE_WIDTH / 2 - 0.2;
        return (
          <TapestryPortrait
            key={unit}
            member={member}
            position={[x, 2.1, segmentZ(unit) - 1.8]}
            rotation={[0, isLeft ? 0.15 : -0.15, 0]}
            isLeftAisle={isLeft}
            trimMaterials={trimMaterials}
          />
        );
      })}
      </group>
    </group>
  );
}
