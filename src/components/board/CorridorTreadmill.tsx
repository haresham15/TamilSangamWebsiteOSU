"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { TapestryPortrait } from "./TapestryPortrait";
import { useStaticBatch } from "@/gl/useStaticBatch";
import { CURRENT_BOARD } from "@/data/board";
import { useBoardHeroStore } from "@/store/boardHeroStore";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { noise1D } from "./noise";
import { chamferedBox, flutedShaft, latheProfile, mergeParts } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";
import { createSurfaceMaterial, withSurfaceDetail, type SurfaceDetailOptions } from "@/gl/art/surface";
import { ContactShadows, type ContactSpot } from "@/gl/art/ContactShadow";
import { useDisposeOnUnmount } from "@/gl/dispose";
import {
  LAMP_PHASE,
  createFlameGeometry,
  createFlameMaterial,
  createFloorPoolGeometry,
  createFloorPoolMaterial,
  createFloorReflection,
  createLampLightUniforms,
  createSconceGeometry,
  sconceFlamePosition,
  sconceLightPosition,
  sconceYaw,
  petalGeometry,
  withLampLight,
  withSlabs,
  type LampLightUniforms,
} from "./boardArt";
import { TapestryBanners } from "./TapestryBanners";
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
  transforms: { position: Vec3; rotation?: Vec3; scale?: Vec3 }[]
) {
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    transforms.forEach(({ position, rotation, scale }, i) => {
      DUMMY.position.set(...position);
      DUMMY.rotation.set(...(rotation ?? [0, 0, 0]));
      DUMMY.scale.set(...(scale ?? [1, 1, 1]));
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
  transforms: { position: Vec3; rotation?: Vec3; scale?: Vec3 }[];
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

function LegacyCorridorLamps({ cinematic }: { cinematic: boolean }) {
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

/**
 * Art-pass lamps: every sconce is one turned-brass geometry (one instanced draw), every
 * flame one camera-facing billboard (one instanced draw). Light: the two lamps nearest the
 * camera get the real point lights; the other twelve are lit by the shared fake lamp light
 * patched into the stone, floor and silk materials (`withLampLight`), which skips the two
 * real ones so nothing is lit twice.
 */
function ArtCorridorLamps({ lampLight }: { lampLight: LampLightUniforms }) {
  const lamps = useMemo(() => lampPositions(), []);

  const sconce = useMemo(() => {
    const geometry = createSconceGeometry();
    const material = createSurfaceMaterial("agedBrass", {}, { cavity: true, space: "local" });
    const transforms = lamps.map((l, i) => ({ position: l, rotation: [0, sconceYaw(i), 0] as Vec3 }));
    return { geometry, material, transforms };
  }, [lamps]);

  const flame = useMemo(() => {
    const geometry = createFlameGeometry(lamps.map((_, i) => LAMP_PHASE(i)));
    const material = createFlameMaterial({ halo: 0.42, glow: 0.2 });
    const transforms = lamps.map((l, i) => ({ position: sconceFlamePosition(l, i) }));
    return { geometry, material, transforms };
  }, [lamps]);
  const pool = useMemo(() => {
    const geometry = createFloorPoolGeometry(lamps.map((_, i) => LAMP_PHASE(i)));
    const material = createFloorPoolMaterial({ intensity: 0.11 });
    // Centred under the flame, nudged into the aisle, longer along the colonnade.
    const transforms = lamps.map((l, i) => {
      const f = sconceFlamePosition(l, i);
      const s = i % 2 === 0 ? 1 : -1;
      return { position: [f[0] + s * 0.25, 0.02, f[2]] as Vec3, scale: [2.4, 1, 3.0] as Vec3 };
    });
    return { geometry, material, transforms };
  }, [lamps]);
  // Mirror streaks in the polished floor: every flame, the finale ring and its altar lamps.
  const reflection = useMemo(
    () =>
      createFloorReflection(
        [
          ...lamps.map((l, i) => ({
            position: sconceLightPosition(l, i),
            width: 0.22,
            color: "#ff9a48",
            strength: 0.5,
            phase: LAMP_PHASE(i),
          })),
          { position: [0, 2.1, 0] as Vec3, width: 1.5, color: "#ffb45a", strength: 0.32 },
          { position: [-1.72, 1.67, 0.62] as Vec3, width: 0.45, color: "#ff9a48", strength: 0.45, phase: 0.7 },
          { position: [1.72, 1.67, 0.62] as Vec3, width: 0.45, color: "#ff9a48", strength: 0.45, phase: 2.4 },
        ],
        { intensity: 1 }
      ),
    [lamps]
  );
  useDisposeOnUnmount(
    sconce.geometry,
    sconce.material,
    flame.geometry,
    flame.material,
    pool.geometry,
    pool.material,
    reflection.geometry,
    reflection.material
  );

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
    pool.material.uniforms.uTime.value = time;
    reflection.material.uniforms.uTime.value = time;
    lampLight.uLampTime.value = time;

    const pair = nearestLampPair(state.camera.position.z);
    const lights = [lightA.current, lightB.current];
    pair.forEach((lampIndex, k) => {
      const light = lights[k];
      if (!light || lampIndex < 0) return;
      if (lastPair.current[k] !== lampIndex) {
        light.position.set(...sconceLightPosition(lamps[lampIndex], lampIndex));
        lastPair.current[k] = lampIndex;
      }
      const n = noise1D(time * 4.2 + LAMP_PHASE(lampIndex) * 17.3);
      light.intensity = (0.85 + 0.35 * n) * lampLight.uLampIntensity.value;
      light.color.setRGB(1.0, 0.56 + 0.06 * n, 0.24);
    });
    lampLight.uLampSkip.value.set(pair[0], pair[1]);
  });

  return (
    <group>
      <InstancedPart geometry={sconce.geometry} material={sconce.material} transforms={sconce.transforms} />
      <InstancedPart geometry={flame.geometry} material={flame.material} transforms={flame.transforms} />
      <InstancedPart geometry={pool.geometry} material={pool.material} transforms={pool.transforms} />
      {/* Placed in the vertex shader from the camera, so the CPU bounds mean nothing. */}
      <instancedMesh args={[reflection.geometry, reflection.material, reflection.count]} frustumCulled={false} renderOrder={2} />
      <pointLight ref={lightA} color="#FF9E44" intensity={lampLight.uLampIntensity.value} distance={7} decay={2} />
      <pointLight ref={lightB} color="#FF9E44" intensity={lampLight.uLampIntensity.value} distance={7} decay={2} />
    </group>
  );
}

/**
 * Outer wall of the side aisle (art pass): moulded base, cornice and a framed niche
 * (devakoshta) under a torana arch, centred between two pillars. Built for the left wall
 * (aisle face toward +x) and instanced with a half-turn for the right.
 */
function createOuterWall() {
  const arch = new THREE.TorusGeometry(0.42, 0.045, 8, 28, Math.PI);
  arch.rotateY(Math.PI / 2);
  return bakeVertexAO(
    mergeParts([
      { geometry: chamferedBox(0.3, 4.4, UNIT_LENGTH, 0.02), position: [-0.15, 0.2, 0] },
      { geometry: chamferedBox(0.2, 0.36, UNIT_LENGTH, 0.03), position: [0.06, -1.82, 0] },
      { geometry: chamferedBox(0.12, 0.12, UNIT_LENGTH, 0.025), position: [0.04, -1.58, 0] },
      { geometry: chamferedBox(0.3, 0.18, UNIT_LENGTH, 0.035), position: [0.12, 2.0, 0] },
      { geometry: chamferedBox(0.18, 0.1, UNIT_LENGTH, 0.025), position: [0.07, 1.86, 0] },
      { geometry: chamferedBox(0.14, 3.3, 0.36, 0.025), position: [0.06, 0.15, 1.75] },
      { geometry: chamferedBox(0.14, 3.3, 0.36, 0.025), position: [0.06, 0.15, -1.75] },
      { geometry: chamferedBox(0.1, 1.9, 0.14, 0.02), position: [0.05, 0.1, 0.56] },
      { geometry: chamferedBox(0.1, 1.9, 0.14, 0.02), position: [0.05, 0.1, -0.56] },
      { geometry: chamferedBox(0.17, 0.14, 1.36, 0.025), position: [0.08, 1.12, 0] },
      { geometry: chamferedBox(0.2, 0.12, 1.36, 0.025), position: [0.09, -0.92, 0] },
      { geometry: arch, position: [0.08, 1.2, 0] },
    ]),
    {
      ground: { y: -2.0, height: 0.55, strength: 0.75 },
      bands: [{ y: -1.64, width: 0.06, strength: 0.6 }, { y: 1.8, width: 0.08, strength: 0.7 }],
      smooth: 2,
    }
  );
}

/** Corridor lamp grid for the 4-lamp light path: two lamps per unit at segmentZ(unit). */
const LAMP_GRID = { z0: segmentZ(0), step: UNIT_LENGTH };

// ---------------------------------------------------------------------------
// Architecture
// ---------------------------------------------------------------------------

type Geometries = Record<ArchGeometryKey, THREE.BufferGeometry>;
type Materials = Record<ArchMaterialKey, THREE.Material>;

function createArchitecture(
  cinematic: boolean,
  lampLight: LampLightUniforms | null
): { geometries: Geometries; materials: Materials } {
  // Carved-stone silhouettes instead of raw primitives: stepped chamfered plinth, fluted
  // shaft with turned base and necking, cushion capital under a chamfered abacus, stepped
  // corbel. Each pillar part is still ONE merged geometry → one instanced draw, and carries
  // baked crease/edge data (aCavity) for the stone material's grime and worn arrises.
  const plinth = bakeVertexAO(
    mergeParts([
      { geometry: chamferedBox(0.74, 0.34, 0.74, 0.03), position: [0, -0.13, 0] },
      { geometry: chamferedBox(0.64, 0.14, 0.64, 0.025), position: [0, 0.11, 0] },
      { geometry: chamferedBox(0.56, 0.12, 0.56, 0.03), position: [0, 0.24, 0] },
    ]),
    { ground: { y: -0.3, height: 0.22, strength: 0.75 }, bands: [{ y: 0.04, width: 0.05, strength: 0.7 }, { y: 0.18, width: 0.05, strength: 0.7 }] }
  );
  const shaft = bakeVertexAO(
    mergeParts([
      { geometry: flutedShaft({ radiusBottom: 0.25, radiusTop: 0.215, height: 2.5, flutes: 12, depth: 0.034, radialSegments: 72, heightSegments: 8 }), position: [0, -0.02, 0] },
      // Turned base moulding (torus + scotia) and necking rings under the capital.
      { geometry: latheProfile([[0.3, 0], [0.31, 0.03], [0.3, 0.07], [0.265, 0.1], [0.255, 0.13], [0.275, 0.16], [0.255, 0.19]], { radialSegments: 28, smooth: true, samples: 16 }), position: [0, -1.4, 0] },
      { geometry: latheProfile([[0.215, 0], [0.24, 0.025], [0.215, 0.05], [0.222, 0.075], [0.25, 0.1], [0.222, 0.125], [0.23, 0.17]], { radialSegments: 28, smooth: true, samples: 16 }), position: [0, 1.23, 0] },
    ]),
    { bands: [{ y: -1.24, width: 0.1, strength: 0.7 }, { y: 1.24, width: 0.1, strength: 0.6 }, { y: 1.4, width: 0.12, strength: 0.75 }], smooth: 2 }
  );
  const capitalPetals = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const g = petalGeometry(1.25, 0.35);
    g.rotateX(1.05);
    return { geometry: g, position: [Math.sin(a) * 0.29, 0.02, Math.cos(a) * 0.29] as Vec3, rotation: [0, a, 0] as Vec3 };
  });
  const capital = bakeVertexAO(
    mergeParts([
      {
        geometry: latheProfile(
          [[0.22, 0], [0.25, 0.012], [0.3, 0.03], [0.36, 0.06], [0.385, 0.085], [0.37, 0.11], [0.32, 0.125], [0.28, 0.13], [0.3, 0.14], [0.4, 0.16], [0.46, 0.175]],
          { radialSegments: 32, smooth: true, samples: 22 }
        ),
        position: [0, -0.16, 0],
      },
      ...capitalPetals,
      { geometry: chamferedBox(1.0, 0.07, 1.0, 0.02), position: [0, 0.055, 0] },
    ]),
    { bands: [{ y: -0.03, width: 0.04, strength: 0.8 }, { y: 0.02, width: 0.03, strength: 0.7 }], smooth: 2 }
  );
  // Profile in x (across the aisle) and y: flat top, three stepped rolls down each end.
  const potika = new THREE.Shape();
  potika.moveTo(-0.55, 0.16);
  potika.lineTo(0.55, 0.16);
  potika.lineTo(0.55, 0.07);
  potika.quadraticCurveTo(0.55, 0.02, 0.48, 0.02);
  potika.lineTo(0.4, 0.02);
  potika.quadraticCurveTo(0.4, -0.04, 0.33, -0.04);
  potika.lineTo(0.26, -0.04);
  potika.quadraticCurveTo(0.26, -0.1, 0.19, -0.1);
  potika.lineTo(0.12, -0.1);
  potika.lineTo(0.12, -0.16);
  potika.lineTo(-0.12, -0.16);
  potika.lineTo(-0.12, -0.1);
  potika.lineTo(-0.19, -0.1);
  potika.quadraticCurveTo(-0.26, -0.1, -0.26, -0.04);
  potika.lineTo(-0.33, -0.04);
  potika.quadraticCurveTo(-0.4, -0.04, -0.4, 0.02);
  potika.lineTo(-0.48, 0.02);
  potika.quadraticCurveTo(-0.55, 0.02, -0.55, 0.07);
  potika.closePath();
  const bracketGeo = new THREE.ExtrudeGeometry(potika, {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 6,
  });
  bracketGeo.translate(0, 0, -0.25);
  bracketGeo.computeVertexNormals();
  const bracket = bakeVertexAO(bracketGeo, { cavity: 1.4, bands: [{ y: 0.02, width: 0.03, strength: 0.6 }, { y: -0.04, width: 0.03, strength: 0.6 }] });
  const geometries: Geometries = {
    floor: new THREE.BoxGeometry(AISLE_WIDTH + 2.4, 0.3, UNIT_LENGTH),
    inlay: new THREE.BoxGeometry(AISLE_WIDTH - 0.8, 0.01, UNIT_LENGTH - 0.1),
    groove: new THREE.BoxGeometry(AISLE_WIDTH - 0.7, 0.005, 0.03),
    plinth,
    shaft,
    capital,
    bracket,
    crossBeam: bakeVertexAO(chamferedBox(AISLE_WIDTH + 0.8, 0.45, 0.7, 0.035)),
    ceiling: new THREE.BoxGeometry(AISLE_WIDTH + 2.0, 0.3, UNIT_LENGTH),
    joist: bakeVertexAO(chamferedBox(0.5, 0.35, UNIT_LENGTH, 0.03)),
    opening: cinematic ? createOuterWall() : new THREE.BoxGeometry(0.1, 3.2, UNIT_LENGTH - 0.4),
  };

  // Stone: mottled, grime gathering toward the floor and in the carving, pale worn arrises.
  // Grime range is world-space, so it sits on the plinths and lower shafts only.
  const stone = (color: string, detail: SurfaceDetailOptions = {}) =>
    cinematic
      ? createSurfaceMaterial("stone", { color }, { cavity: true, grimeTo: 1.6, ...detail })
      : new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.2 });
  const floor = cinematic
    ? new THREE.MeshStandardMaterial({ color: "#5c4634", roughness: 0.2, metalness: 0.05, envMapIntensity: 0.3 })
    : new THREE.MeshStandardMaterial({ color: "#120E0C", roughness: 0.18, metalness: 0.45 });
  const inlay = cinematic
    ? new THREE.MeshStandardMaterial({ color: "#6a4f38", roughness: 0.16, metalness: 0.05, envMapIntensity: 0.3 })
    : new THREE.MeshStandardMaterial({ color: "#1A1412", roughness: 0.15, metalness: 0.5 });
  if (cinematic) {
    // Polished granite floor: glossy, with the mirror broken into worn and dull patches.
    // (No tiled normal map: at this gloss it aliased into gold glitter.)
    withSurfaceDetail(floor, { scale: 0.9, albedoVariation: 0.22, roughnessVariation: 0.1, bump: 0 });
    withSurfaceDetail(inlay, { scale: 1.3, albedoVariation: 0.2, roughnessVariation: 0.08, bump: 0 });
  }
  const materials: Materials = {
    floor,
    inlay,
    darkGroove: new THREE.MeshBasicMaterial({ color: "#1a110a" }),
    plinth: stone("#5a4130"),
    shaft: cinematic
      ? createSurfaceMaterial("stone", { color: "#7a583d", roughness: 0.66 }, { cavity: true, grimeTo: 1.6, scale: 7, wearAmount: 0.7 })
      : stone("#6e4f38", { scale: 7 }),
    capital: stone("#7a573c"),
    corbel: stone("#604431"),
    crossBeam: stone(cinematic ? "#6e4e36" : "#553b28", { scale: 3.5, grimeAmount: 0 }),
    ceiling: cinematic
      ? createSurfaceMaterial("stone", { color: "#6a5040" }, { scale: 2.5, grimeAmount: 0, wearAmount: 0.3 })
      : new THREE.MeshStandardMaterial({ color: "#2d1d12", roughness: 0.92, metalness: 0.1 }),
    joist: stone(cinematic ? "#6a4c36" : "#44301f", { scale: 3.5, grimeAmount: 0 }),
    opening: cinematic ? stone("#4a3628", { scale: 4, grimeTo: 1.0 }) : new THREE.MeshBasicMaterial({ color: "#1a110a" }),
  };
  // Every lamp pools light on the stone, floor and ceiling near it (see boardArt.withLampLight).
  if (lampLight) {
    for (const key of Object.keys(materials) as ArchMaterialKey[]) {
      const m = materials[key];
      if (m instanceof THREE.MeshStandardMaterial) withLampLight(m, lampLight, LAMP_GRID);
    }
    withSlabs(floor as THREE.MeshStandardMaterial);
  }
  return { geometries, materials };
}

export function CorridorTreadmill() {
  const [cinematic] = React.useState(() => isHeroCinematicEnabled("board"));
  // One set of fake-lamp uniforms shared by every lit corridor material and the banners.
  const lampLight = useMemo(
    () =>
      cinematic
        ? createLampLightUniforms(lampPositions().map((l, i) => sconceLightPosition(l, i)), { intensity: 2.4, range: 5.5 })
        : null,
    [cinematic]
  );
  const arch = useMemo(() => createArchitecture(cinematic, lampLight), [cinematic, lampLight]);
  const placements = useMemo(
    () =>
      ARCH_PARTS.map((part) =>
        partPositions(part).map((position) => ({
          position,
          // The outer wall is built facing +x; the right-hand copy turns to face the aisle.
          rotation: part.geometry === "opening" && position[0] > 0 ? ([0, Math.PI, 0] as Vec3) : undefined,
        }))
      ),
    []
  );

  // Soft grounding under each plinth so the pillars sit on the floor instead of floating.
  const plinthShadows = useMemo<ContactSpot[]>(
    () =>
      partPositions(ARCH_PARTS.find((p) => p.geometry === "plinth")!).map(([x, , z]) => ({
        position: [x, 0.012, z],
        size: [1.35, 1.35],
        opacity: 0.8,
      })),
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
  useStaticBatch(bannersRef, [], !cinematic);

  useEffect(
    () => () => {
      Object.values(arch.geometries).forEach((g) => g.dispose());
      Object.values(arch.materials).forEach((m) => m.dispose());
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
          // Art pass: the only shadow light is the narrow crown spot, whose cone holds just the
          // crown, so the colonnade stays out of the shadow pass (it was ~100k extra triangles).
          castShadow={part.castShadow && !cinematic}
          receiveShadow={part.receiveShadow}
        />
      ))}

      {cinematic && <ContactShadows spots={plinthShadows} softness={0.8} />}

      {lampLight ? <ArtCorridorLamps lampLight={lampLight} /> : <LegacyCorridorLamps cinematic={cinematic} />}

      {/* Silk tapestry banners: one per unit, alternating aisle sides (unchanged placement). */}
      {lampLight ? (
        <TapestryBanners lampLight={lampLight} />
      ) : (
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
      )}
    </group>
  );
}
