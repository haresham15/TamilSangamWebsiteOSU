"use client";

// Events hero, art pass: the Leo factory concert as a steel hall at night. One sodium lamp
// array behind the stage is the key and the only shadow caster; the performer stands in
// silhouette on a riveted steel drum, the crowd fills the floor as layered silhouettes
// with phone torches defocused into bokeh, spark gerbs fire from the deck, and haze holds
// the light so the planes separate. Light hierarchy: backlight (key/rim) ≫ stage top
// light > two sweeping heads > cool fill.
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { BakedEnvironment } from "@/gl/BakedEnvironment";
import { useShadowUpdates } from "@/gl/shadows";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { ContactShadows, type ContactSpot } from "@/gl/art/ContactShadow";
import { DustMotes, HazeLayer, LightShaft } from "@/gl/art/Atmosphere";
import type { Vec3 } from "@/gl/art/geometry";
import { Performer } from "../Performer";
import { PhoneTorches, type TorchSpot } from "../PhoneTorches";
import { Backlight } from "./Backlight";
import { ArenaCrowd } from "./ArenaCrowd";
import { SparkFountains } from "./SparkFountains";
import { HangingEmblem } from "./HangingEmblem";
import {
  BACKLIGHT,
  BAY_Z,
  COLUMN_X,
  DECK_Y,
  EMBLEM_POS,
  LAMP_TILT,
  STAGE_RADIUS,
  TRUSS_LAMPS,
  TRUSS_Y,
  TRUSS_Z,
  buildHotSeam,
  buildStageDrum,
  buildSteelwork,
  buildWalls,
  layoutCrowd,
} from "./forgeGeometry";
import {
  createFloorMaterial,
  createHotSeamMaterial,
  createLensMaterial,
  createSteelMaterial,
  createWallMaterial,
  createWallTexture,
} from "./forgeMaterials";

export type ForgeQuality = 0 | 1 | 2;

// Back corners of the deck: the fountains rise beside the performer, above the crowd's heads.
const GERBS: Vec3[] = [
  [-2.0, DECK_Y, -1.1],
  [2.0, DECK_Y, -1.1],
];

/** One moving head on the truss: a narrow spot and its visible beam, swept together. */
function SweepingBeam({ source, phase }: { source: Vec3; phase: number }) {
  const group = useRef<THREE.Group>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, -9, 0);
    return o;
  }, []);
  const time = useRef(phase * 10);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    time.current += dt;
    const g = group.current;
    if (!g) return;
    const t = time.current;
    g.rotation.z = Math.sign(source[0]) * (0.32 + 0.26 * Math.sin(t * 0.37 + phase));
    g.rotation.x = -0.55 + 0.16 * Math.sin(t * 0.29 + phase * 2.0);
    if (spot.current && spot.current.target !== target) spot.current.target = target;
  });
  return (
    <group ref={group} position={source}>
      <primitive object={target} />
      <spotLight ref={spot} color="#ffb45e" intensity={70} angle={0.12} penumbra={0.65} decay={2} />
      <LightShaft from={[0, 0, 0]} to={[0, -9, 0]} width={0.26} spread={4.6} color="#ffb060" intensity={0.32} />
    </group>
  );
}

export function ForgeArena({ quality }: { quality: ForgeQuality }) {
  const geometries = useMemo(
    () => ({
      steel: buildSteelwork(quality),
      drum: buildStageDrum(quality),
      seam: buildHotSeam(),
      walls: buildWalls(),
      floor: new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI / 2),
      lens: new THREE.CircleGeometry(0.17, 24).rotateX(Math.PI / 2),
    }),
    [quality]
  );
  const wallTexture = useMemo(() => createWallTexture(quality === 0 ? 1024 : 512), [quality]);
  const materials = useMemo(
    () => ({
      steel: createSteelMaterial(),
      floor: createFloorMaterial(),
      wall: createWallMaterial(wallTexture, quality === 0 ? 8 : 4),
      seam: createHotSeamMaterial(),
      lens: createLensMaterial(),
    }),
    [wallTexture, quality]
  );
  useDisposeOnUnmount(geometries, materials, wallTexture);

  const crowd = useMemo(() => layoutCrowd(quality === 0 ? 0.85 : quality === 1 ? 0.75 : 0.6), [quality]);
  const torches = useMemo<TorchSpot[]>(() => {
    const spots: TorchSpot[] = [];
    crowd.forEach((s, i) => {
      // Roughly one in five holds a phone up, at raised-hand height.
      const h = Math.sin(i * 12.9898 + s.phase * 78.233) * 43758.5453;
      const r = h - Math.floor(h);
      if (r < 0.12) spots.push({ x: s.x + (r - 0.06) * 3, y: (1.95 + r * 2.5) * s.scale, z: s.z });
    });
    return spots;
  }, [crowd]);

  const contactSpots = useMemo<ContactSpot[]>(() => {
    const spots: ContactSpot[] = [{ position: [0, 0, 0], size: [(STAGE_RADIUS + 0.6) * 2.2, (STAGE_RADIUS + 0.6) * 2.2], opacity: 0.75 }];
    for (const z of BAY_Z) for (const x of [-COLUMN_X, COLUMN_X]) spots.push({ position: [x, 0, z], size: [1.3, 1.1], opacity: 0.7 });
    for (const sx of [-1, 1]) spots.push({ position: [BACKLIGHT[0] + sx * 2.07, 0, BACKLIGHT[2] - 0.2], size: [1.1, 1.0], opacity: 0.7 });
    // The performer's feet on the deck, and a dark footprint under every member of the crowd.
    spots.push({ position: [0, DECK_Y, 0], size: [0.95, 0.85], opacity: 0.9 });
    // One soft pool per three people (they overlap anyway); every-member decals cost real overdraw.
    crowd.forEach((s, i) => {
      if (i % 3 === 0) spots.push({ position: [s.x, 0, s.z], size: [1.6 * s.scale, 1.1 * s.scale], opacity: 0.55 });
    });
    return spots;
  }, [crowd]);

  // One caster (the backlight). Moving casters are small, so refresh every few frames.
  useShadowUpdates({ mode: "everyN", n: quality === 0 ? 3 : 5 });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    materials.seam.uniforms.uTime.value += dt;
  });

  const shadowMapSize = quality === 0 ? 1024 : 512;

  return (
    <>
      <color attach="background" args={["#090605"]} />
      <fogExp2 attach="fog" args={["#140c07", 0.028]} />

      {/* Environment: what the metal reflects. The hot array behind, a dim cool roof. */}
      <BakedEnvironment resolution={64}>
        <mesh position={[0, 3, -8]}>
          <circleGeometry args={[2.4, 24]} />
          <meshBasicMaterial color={[5, 2.4, 0.9]} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 14, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshBasicMaterial color={[0.05, 0.065, 0.09]} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 1.5, 12]}>
          <planeGeometry args={[20, 3]} />
          <meshBasicMaterial color={[0.12, 0.06, 0.03]} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </BakedEnvironment>

      {/* Light hierarchy */}
      <hemisphereLight args={["#2f3c55", "#140a05", 0.16]} userData={{ gradeRole: "fill" }} />
      <Backlight shadowMapSize={shadowMapSize} />
      <spotLight
        position={[0, TRUSS_Y - 0.6, TRUSS_Z + 0.3]}
        target-position={[0, DECK_Y, 0]}
        color="#ffcf90"
        intensity={30}
        angle={0.36}
        penumbra={0.85}
        decay={2}
        userData={{ gradeRole: "rim" }}
      />
      {quality < 2 && <SweepingBeam source={[-4.9, TRUSS_Y - 0.3, TRUSS_Z]} phase={0} />}
      {quality < 2 && <SweepingBeam source={[4.9, TRUSS_Y - 0.3, TRUSS_Z]} phase={1.7} />}

      {/* Hall */}
      <mesh geometry={geometries.floor} material={materials.floor} receiveShadow />
      <mesh geometry={geometries.walls} material={materials.wall} />
      {/* The hall steel only receives: its shadows fell off-frame and cost a full pass. */}
      <mesh geometry={geometries.steel} material={materials.steel} receiveShadow />
      <ContactShadows spots={contactSpots} softness={0.8} />

      {/* Stage */}
      <mesh geometry={geometries.drum} material={materials.steel} castShadow receiveShadow />
      <mesh geometry={geometries.seam} material={materials.seam} />
      {TRUSS_LAMPS.map((p, i) => (
        <mesh key={i} geometry={geometries.lens} material={materials.lens} position={p} rotation={[LAMP_TILT, 0, 0]} />
      ))}
      <Backlit />
      <HangingEmblem position={EMBLEM_POS} spotFrom={[0, TRUSS_Y - 0.2, TRUSS_Z - 0.4]} />

      {/* Audience */}
      <ArenaCrowd slots={crowd} />
      <PhoneTorches spots={torches} />
      <SparkFountains emitters={GERBS} perEmitter={quality === 0 ? 320 : quality === 1 ? 200 : 120} />

      {/* Air: haze holding the backlight, smoke under the roof, a low layer over the crowd. */}
      {/* Kit layers output colour·a with alpha a (≈ intensity² on screen), so values look high. */}
      <HazeLayer position={[BACKLIGHT[0], BACKLIGHT[1], BACKLIGHT[2] + 0.9]} size={[12, 8]} color="#ff9a44" intensity={0.34} />
      <HazeLayer position={[0, 8.6, -6.5]} size={[28, 9]} color="#b8662c" intensity={0.3} />
      {/* Lit air over the stage and crowd: fills the mid frame the beams cut through. */}
      <HazeLayer position={[0, 4.8, -1.2]} size={[24, 8]} color="#a85c28" intensity={0.26} />
      <HazeLayer position={[0, 2.6, 3.0]} size={[22, 4.5]} color="#a05a26" intensity={0.16} />
      <DustMotes position={[0, 3.2, -1]} size={[8, 5.5, 7]} count={quality === 0 ? 380 : 180} color="#ffcf96" intensity={0.55} pointSize={22} drift={[0.015, 0.03, 0]} />
      {TRUSS_LAMPS.filter((_, i) => quality === 0 || i === 1 || i === 2).map(([x, y, z], i) => (
        <LightShaft key={i} from={[x, y - 0.05, z]} to={[x * 0.3, DECK_Y, -0.3]} width={0.42} spread={3.6} color="#ffc27a" intensity={0.3} />
      ))}
    </>
  );
}

/** The performer, dark, with the backlight catching the outline. */
function Backlit() {
  return (
    <Performer
      position={[0, DECK_Y, 0]}
      backlit={{ color: "#ffb15c", lightPosition: BACKLIGHT, strength: 3.2 }}
    />
  );
}
