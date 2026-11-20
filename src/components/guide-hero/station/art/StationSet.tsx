"use client";

// Art-pass station set (behind isHeroCinematicEnabled("guide")). Lighting hierarchy:
// key = sodium lamps under the canopy and the warm window (sources in frame), fill = dim
// cool blue-hour sky, rim = cool light from the station mouth. The board hangs in the hall
// against a luminous sky and throws a warm pool onto the wet far platform.
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { createPortal, useThree } from "@react-three/fiber";
import { applyInstanceTransforms, jitterTransforms, type Transform } from "@/gl/art/geometry";
import { createSurfaceMaterial } from "@/gl/art/surface";
import { HazeLayer } from "@/gl/art/Atmosphere";
import { ContactShadows, type ContactSpot } from "@/gl/art/ContactShadow";
import { BakedEnvironment } from "@/gl/BakedEnvironment";
import { useDisposeOnUnmount } from "@/gl/dispose";
import {
  buildCanopy,
  buildCanopyColumn,
  buildGableWall,
  buildHallColumn,
  buildHallRoof,
  buildHallTruss,
  buildLampBulbs,
  buildPlatformEdges,
  buildPlatformSlabs,
  buildTactileStrip,
  buildTrackBed,
} from "./architecture";
import { buildCoach } from "./coach";
import {
  createCoachMaterial,
  createIronworkMaterial,
  createSkyMaterial,
  createTactileMaterial,
  createWetPlatformMaterial,
  withBrick,
} from "./materials";
import { CANOPY, COACH, HALL, PLATFORM, SODIUM_LAMPS, SODIUM_LAMP_Y, SODIUM_LAMP_Z } from "./layout";
import { Crowd } from "./Crowd";
import { RainField, SplashRings } from "./RainField";

export const STATION_ART_FOG = "#4e4452";
const SODIUM = "#ffaa52";

function useInstances(ref: React.RefObject<THREE.InstancedMesh | null>, transforms: Transform[]) {
  useEffect(() => {
    if (ref.current) applyInstanceTransforms(ref.current, transforms);
  }, [ref, transforms]);
}

/** Lightformers baked once to PMREM: sky, mouth glow, sodium strips, the lit board. */
function StationEnvironment() {
  return (
    <BakedEnvironment resolution={128}>
      <mesh position={[0, 40, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshBasicMaterial color={[0.45, 0.32, 0.30]} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 10, -40]}>
        <planeGeometry args={[90, 30]} />
        <meshBasicMaterial color={[1.4, 0.8, 0.45]} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 6, 40]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[90, 20]} />
        <meshBasicMaterial color={[0.35, 0.26, 0.26]} side={THREE.DoubleSide} />
      </mesh>
      {SODIUM_LAMPS.map((l) => (
        <mesh key={l.x} position={[l.x, SODIUM_LAMP_Y + 0.1, SODIUM_LAMP_Z]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.6, 16]} />
          <meshBasicMaterial color={[1.6, 0.8, 0.28]} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 14, -6]}>
        <planeGeometry args={[14, 5]} />
        <meshBasicMaterial color={[0.9, 0.78, 0.6]} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshBasicMaterial color={[0.06, 0.045, 0.04]} side={THREE.DoubleSide} />
      </mesh>
    </BakedEnvironment>
  );
}

export function StationLights() {
  const boardSpot = useRef<THREE.SpotLight>(null);
  const boardTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0, -4.5);
    return o;
  }, []);
  useEffect(() => {
    if (boardSpot.current) boardSpot.current.target = boardTarget;
  }, [boardTarget]);

  return (
    <>
      <hemisphereLight args={["#e0b090", "#5a4a50", 1.5]} userData={{ gradeRole: "fill" }} />
      <directionalLight position={[-8, 20, -24]} intensity={1.4} color="#ffc8a0" userData={{ gradeRole: "rim" }} />
      <directionalLight position={[6, 4, 14]} intensity={1.3} color="#ffbe8a" />
      <directionalLight position={[-14, 6, -24]} intensity={1.6} color="#ffb070" userData={{ gradeRole: "key" }} />
      {SODIUM_LAMPS.filter((l) => l.lit).map((l) => (
        <pointLight
          key={l.x}
          position={[l.x, SODIUM_LAMP_Y - 0.08, SODIUM_LAMP_Z]}
          intensity={48}
          color={SODIUM}
          decay={2}
          userData={{ gradeRole: "key" }}
        />
      ))}
      {/* The board's spill onto the wet far platform below it. */}
      <primitive object={boardTarget} />
      <spotLight ref={boardSpot} position={[0, 10.2, -5.2]} intensity={420} angle={0.75} penumbra={1} decay={2} color="#ffd8a8" />
    </>
  );
}

/** Warm spill from the hero window onto the platform; rides with the train. */
export function WindowSpill() {
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0, 2.6);
    return o;
  }, []);
  useEffect(() => {
    if (spot.current) spot.current.target = target;
  }, [target]);
  return (
    <>
      <primitive object={target} />
      <spotLight ref={spot} position={[0, 1.85, -1.1]} intensity={40} angle={0.62} penumbra={0.85} decay={2} color="#ffb35c" />
    </>
  );
}

/** Hero coach (open window) + two glazed neighbours, which ride inside the train group. */
export function ArtCoaches() {
  const res = useMemo(() => {
    const hero = buildCoach({ hero: true, seed: 3 });
    const neighbour = buildCoach({ hero: false, seed: 11 });
    const body = createCoachMaterial();
    const glass = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: true });
    return { hero, neighbour, body, glass };
  }, []);
  useDisposeOnUnmount(res.hero.body, res.hero.glass, res.neighbour.body, res.neighbour.glass, res.body, res.glass);

  const transforms = useMemo<Transform[]>(() => [{ position: [-(COACH.length + 1.5), 0, 0] }, { position: [COACH.length + 1.5, 0, 0] }], []);
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const glassRef = useRef<THREE.InstancedMesh>(null);
  useInstances(bodyRef, transforms);
  useInstances(glassRef, transforms);

  return (
    <group name="ArtCoaches">
      <mesh geometry={res.hero.body} material={res.body} name="HeroCoachBody" />
      <mesh geometry={res.hero.glass} material={res.glass} name="HeroCoachGlass" />
      <instancedMesh ref={bodyRef} args={[res.neighbour.body, res.body, 2]} name="NeighbourCoachBody" />
      <instancedMesh ref={glassRef} args={[res.neighbour.glass, res.glass, 2]} name="NeighbourCoachGlass" />
    </group>
  );
}

function PlatformSet() {
  const res = useMemo(() => {
    return {
      slabs: buildPlatformSlabs(),
      edges: buildPlatformEdges(),
      track: buildTrackBed(),
      tactile: buildTactileStrip(),
      wet: createWetPlatformMaterial(),
      edgeMat: createIronworkMaterial(),
      ballast: createSurfaceMaterial("stone", { color: "#1a1a1c", roughness: 0.6 }, { scale: 9, albedoVariation: 0.35, bump: 0.004, grimeAmount: 0 }),
      tactileMat: createTactileMaterial(),
    };
  }, []);
  useDisposeOnUnmount(res.slabs, res.edges, res.track, res.tactile, res.wet, res.edgeMat, res.ballast, res.tactileMat);

  return (
    <group name="StationPlatforms">
      <mesh geometry={res.slabs} material={res.wet} name="WetPlatformSlabs" />
      <mesh geometry={res.edges} material={res.edgeMat} name="PlatformEdges" />
      <mesh geometry={res.track} material={res.ballast} name="TrackBed" />
      <mesh geometry={res.tactile} material={res.tactileMat} name="TactileStrip" />
    </group>
  );
}

function CanopySet() {
  const res = useMemo(() => {
    const ironwork = createIronworkMaterial();
    const castIron = createIronworkMaterial();
    castIron.vertexColors = false;
    castIron.color.set("#26312d");
    return {
      canopy: buildCanopy(),
      column: buildCanopyColumn(),
      bulbs: buildLampBulbs(),
      ironwork,
      castIron,
      bulbMat: new THREE.MeshBasicMaterial({ color: new THREE.Color(SODIUM).multiplyScalar(7) }),
    };
  }, []);
  useDisposeOnUnmount(res.canopy, res.column, res.bulbs, res.ironwork, res.castIron, res.bulbMat);
  const columns = useMemo<Transform[]>(
    () => jitterTransforms(CANOPY.columnX.map((x) => ({ position: [x, 0, CANOPY.columnZ] as [number, number, number] })), { seed: 5, yaw: 0.4 }),
    []
  );
  const colRef = useRef<THREE.InstancedMesh>(null);
  useInstances(colRef, columns);

  return (
    <group name="StationCanopy">
      <mesh geometry={res.canopy} material={res.ironwork} name="CanopyIronwork" />
      <instancedMesh ref={colRef} args={[res.column, res.castIron, columns.length]} name="CanopyColumns" />
      <mesh geometry={res.bulbs} material={res.bulbMat} name="SodiumBulbs" />
    </group>
  );
}

function HallSet() {
  const res = useMemo(() => {
    const steel = createSurfaceMaterial("plaster", { color: "#1c2126", roughness: 0.62, metalness: 0.35 }, { scale: 3, albedoVariation: 0.18, bump: 0, cavityStrength: 0, grimeAmount: 0, wearAmount: 0 });
    const castIron = createIronworkMaterial();
    castIron.vertexColors = false;
    castIron.color.set("#232c2a");
    const brick = withBrick(createSurfaceMaterial(
      "stone",
      { color: "#5a3428", roughness: 0.82 },
      { scale: 2.5, albedoVariation: 0.22, tint: "#7a4a36", tintAmount: 0.35, bump: 0, cavity: true, cavityStrength: 0.7, grimeAmount: 0.5, grimeFrom: -1, grimeTo: 4 }
    ));
    const skyGeo = new THREE.PlaneGeometry(240, 120);
    return {
      truss: buildHallTruss(),
      column: buildHallColumn(),
      roof: buildHallRoof(),
      gable: buildGableWall(),
      steel,
      castIron,
      brick,
      sky: createSkyMaterial(),
      skyGeo,
    };
  }, []);
  useDisposeOnUnmount(res.truss, res.column, res.roof, res.gable, res.steel, res.castIron, res.brick, res.sky, res.skyGeo);

  const trusses = useMemo<Transform[]>(() => HALL.trussZ.map((z) => ({ position: [0, 0, z] as [number, number, number] })), []);
  const hallColumns = useMemo<Transform[]>(
    () => HALL.trussZ.flatMap((z) => [-1, 1].map((s) => ({ position: [s * HALL.halfSpan, 0, z] as [number, number, number] }))),
    []
  );
  const trussRef = useRef<THREE.InstancedMesh>(null);
  const colRef = useRef<THREE.InstancedMesh>(null);
  useInstances(trussRef, trusses);
  useInstances(colRef, hallColumns);

  return (
    <group name="StationHall">
      <instancedMesh ref={trussRef} args={[res.truss, res.steel, trusses.length]} name="HallTrusses" />
      <instancedMesh ref={colRef} args={[res.column, res.castIron, hallColumns.length]} name="HallColumns" />
      <mesh geometry={res.roof} material={res.steel} name="HallRoof" />
      <mesh geometry={res.gable} material={res.brick} name="GableWall" />
      <mesh geometry={res.skyGeo} material={res.sky} position={[0, 30, -75]} renderOrder={-1} name="BlueHourSky" />
    </group>
  );
}

const CONTACT_SPOTS: ContactSpot[] = [
  ...CANOPY.columnX.map((x) => ({ position: [x, 0, CANOPY.columnZ] as [number, number, number], size: [0.9, 0.9] as [number, number], opacity: 0.75 })),
  ...HALL.trussZ.flatMap((z) => [-1, 1].map((s) => ({ position: [s * HALL.halfSpan, 0, z] as [number, number, number], size: [1.8, 1.8] as [number, number], opacity: 0.7 }))),
  { position: [-10, 0, 4.7], size: [3.4, 1.0], opacity: 0.6 },
  { position: [8.2, 0, 6.6], size: [3.4, 1.0], opacity: 0.6 },
  // Under the coach overhang along the coping.
  { position: [0, 0, PLATFORM.edgeZ + 0.25], size: [80, 0.6], opacity: 0.55 },
];

export interface StationArtSetProps {
  rainCount: number;
  crowdCount: number;
  animate: boolean;
  getWindowX: () => number;
  getDensity: () => number;
}

/**
 * Compiles its children's shaders with renderer.compileAsync (KHR_parallel_shader_compile)
 * while they sit in a detached group, then attaches them. Without this, the first frame
 * compiled every set program synchronously: a 10 s+ main-thread stall on ANGLE/D3D.
 * Children render through a portal, so anything that needs the real scene (environment,
 * lights) must stay outside.
 */
function DeferredCompile({ children }: { children: React.ReactNode }) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const holder = useMemo(() => new THREE.Group(), []);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    const id = requestAnimationFrame(() => {
      gl.compileAsync(holder, camera, scene)
        .catch(() => undefined)
        .then(() => {
          if (live) setReady(true);
        });
    });
    return () => {
      live = false;
      cancelAnimationFrame(id);
    };
  }, [gl, camera, scene, holder]);
  return (
    <>
      {createPortal(children, holder)}
      {ready && <primitive object={holder} />}
    </>
  );
}

/** Static set + atmosphere. The coaches live in the train group (see ArtCoaches). */
export function StationArtSet({ rainCount, crowdCount, animate, getWindowX, getDensity }: StationArtSetProps) {
  return (
    <>
      <StationEnvironment />
      <StationLights />
      <DeferredCompile>
      <PlatformSet />
      <CanopySet />
      <HallSet />
      <ContactShadows spots={CONTACT_SPOTS} />
      <Crowd count={crowdCount} fogColor={STATION_ART_FOG} animate={animate} />
      {animate && <RainField count={rainCount} getWindowX={getWindowX} getDensity={getDensity} />}
      {animate && rainCount > 0 && <SplashRings getWindowX={getWindowX} />}

      {/* Air: blue mist over the tracks, sodium halos, luminous haze behind the board. */}
      <HazeLayer position={[0, 2.6, -3.6]} size={[60, 7]} color="#3d6890" intensity={0.05} />
      {SODIUM_LAMPS.filter((l) => l.lit).map((l) => (
        <HazeLayer key={l.x} position={[l.x, SODIUM_LAMP_Y - 0.2, SODIUM_LAMP_Z + 0.4]} size={[3.2, 2.2]} color="#ff9a48" intensity={0.07} />
      ))}
      <HazeLayer position={[0, 14, -13]} size={[44, 22]} color="#4e7aa6" intensity={0.09} />
      <HazeLayer position={[0, 3.5, -12]} size={[56, 9]} color="#3a5c80" intensity={0.06} />
      <HazeLayer position={[0, 19, 2]} rotation={[0.5, 0, 0]} size={[44, 14]} color="#2c4766" intensity={0.035} />
      </DeferredCompile>
    </>
  );
}
