"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BoardRoot } from "../BoardRoot";
import {
  GUIDE_BOARD_WORLD_POSITION,
  sampleGuideRail,
} from "./guideRail";
import {
  GUIDE_STATION_FOG_DENSITY,
  guideStationPalette,
} from "./palette";
import { RainStreaks } from "./RainStreaks";
import { WindowAssembly } from "./WindowAssembly";
import { useGuideStore } from "../store/guideStore";

interface StationSceneProps {
  progress?: number;
  getProgress?: () => number;
  getTargetProgress?: () => number;
  board?: {
    boardWidth?: number;
    boardHeight?: number;
    cols?: number;
    rows?: number;
  };
}

/**
 * Cinematic camera rig: samples guideRail.ts with critical damping (λ = 6)
 * and decaying handheld drift (PRD §6.1).
 * Initialized at calibrated F1 coordinates: (0.25, 1.48, 3.55) -> lookAt (-0.15, 1.52, 0.0).
 */
function StationCamera({
  getProgress,
  getTargetProgress,
}: {
  getProgress: () => number;
  getTargetProgress: () => number;
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const currentPos = useRef(new THREE.Vector3(0.25, 1.48, 3.55));
  const currentLookAt = useRef(new THREE.Vector3(-0.15, 1.52, 0.0));
  const targetLookAt = useMemo(() => new THREE.Vector3(), []);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { size } = useThree();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const simTime = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    simTime.current += dt;
    const camera = cameraRef.current;
    if (!camera) return;

    const p = getProgress();
    const aspect = size.width / Math.max(1, size.height);
    const frame = sampleGuideRail(p, aspect);

    // Handheld micro-drift (amplitude decays as camera rises to the board)
    const driftAmp = reduceMotion ? 0 : frame.handheldAmplitude;
    const driftX = Math.sin(simTime.current * 1.8) * driftAmp;
    const driftY = Math.cos(simTime.current * 1.4) * driftAmp * 0.4;

    // Critically damped following (λ ≈ 6)
    const dampLambda = 6.0;
    const lerpFactor = 1.0 - Math.exp(-dampLambda * dt);

    const destX = frame.position[0] + driftX;
    const destY = frame.position[1] + driftY;
    const destZ = frame.position[2];

    currentPos.current.x += (destX - currentPos.current.x) * lerpFactor;
    currentPos.current.y += (destY - currentPos.current.y) * lerpFactor;
    currentPos.current.z += (destZ - currentPos.current.z) * lerpFactor;

    camera.position.copy(currentPos.current);

    const destLookX = frame.lookAt[0] + driftX * 0.2;
    const destLookY = frame.lookAt[1];
    const destLookZ = frame.lookAt[2];

    currentLookAt.current.x += (destLookX - currentLookAt.current.x) * lerpFactor;
    currentLookAt.current.y += (destLookY - currentLookAt.current.y) * lerpFactor;
    currentLookAt.current.z += (destLookZ - currentLookAt.current.z) * lerpFactor;

    targetLookAt.copy(currentLookAt.current);
    camera.lookAt(targetLookAt);

    if (Math.abs(camera.fov - frame.fov) > 0.01) {
      camera.fov += (frame.fov - camera.fov) * lerpFactor;
      camera.updateProjectionMatrix();
    }

    if (frame.roll !== 0) {
      camera.rotateZ(frame.roll);
    }
    camera.updateMatrixWorld();

    if (typeof window !== "undefined" && window.__guideStationCamera) {
      window.__guideStationCamera.progress = frame.progress;
      window.__guideStationCamera.targetProgress = getTargetProgress();
      window.__guideStationCamera.position[0] = camera.position.x;
      window.__guideStationCamera.position[1] = camera.position.y;
      window.__guideStationCamera.position[2] = camera.position.z;
      window.__guideStationCamera.lookAt[0] = targetLookAt.x;
      window.__guideStationCamera.lookAt[1] = targetLookAt.y;
      window.__guideStationCamera.lookAt[2] = targetLookAt.z;
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault near={0.1} far={120} />;
}

/**
 * Split-flap departure board suspended at (0, 14, -6) from rafters at y = 21m.
 * Fog is explicitly disabled on all board materials to ensure razor-sharp legibility (PRD §5.4 & §6.4).
 */
function StationBoard({
  getProgress,
  board,
}: {
  getProgress: () => number;
  board?: StationSceneProps["board"];
}) {
  const revealRef = useRef<THREE.Group>(null);
  const mostAskedRevealed = useRef(false);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const group = revealRef.current;
    if (!group) return;

    const p = getProgress();
    // Board enters frame at p >= 0.50
    group.visible = p >= 0.48;

    // Board cascade triggers once at p >= 0.82 (idempotent, PRD §7.6)
    if (p >= 0.82 && !mostAskedRevealed.current) {
      mostAskedRevealed.current = true;
      useGuideStore.getState().revealMostAsked();
    }
  });

  return (
    <group ref={revealRef} name="StationBoardReveal">
      {/* 4 clean vertical suspension rods connecting board top edge (y = 17.5m) to rafters (y = 21.8m) */}
      {[-5.5, -2.0, 2.0, 5.5].map((x) => (
        <mesh key={x} position={[x, 19.65, GUIDE_BOARD_WORLD_POSITION[2]]}>
          <cylinderGeometry args={[0.04, 0.04, 4.3, 12]} />
          <meshBasicMaterial color="#1A1C20" fog={false} />
        </mesh>
      ))}

      {/* Two warm up-lights washing the underside and face of the board */}
      <pointLight
        position={[-3.5, 10.5, GUIDE_BOARD_WORLD_POSITION[2] + 2.5]}
        intensity={180}
        color={guideStationPalette.practicalWarm}
        decay={2}
      />
      <pointLight
        position={[3.5, 10.5, GUIDE_BOARD_WORLD_POSITION[2] + 2.5]}
        intensity={180}
        color={guideStationPalette.practicalWarm}
        decay={2}
      />

      {/* The protected split-flap board root */}
      <BoardRoot
        boardWidth={board?.boardWidth ?? 14}
        boardHeight={board?.boardHeight ?? 7}
        cols={board?.cols ?? 22}
        rows={board?.rows ?? 8}
        position={[
          GUIDE_BOARD_WORLD_POSITION[0],
          GUIDE_BOARD_WORLD_POSITION[1],
          GUIDE_BOARD_WORLD_POSITION[2],
        ]}
        fogEnabled={false}
      />
    </group>
  );
}

/**
 * Authentic Indian Railways ICF Blue Passenger Coach (#1B334B Prussian Blue-Teal).
 * Features:
 * - Skirt at y = 0.35m
 * - Corrugated waist ribs below window (y = 0.85m to 1.15m)
 * - Dual cream-ochre livery pinstripes (#C8B898)
 * - Hero window cutout (1.38m × 0.94m) centered at (0, 1.65, 0)
 * - Softly frosted, dimly lit sleeper neighbor windows with mini bars and louvers
 */
function CoachBody({ dimmed = false }: { dimmed?: boolean }) {
  const bodyColor = dimmed ? guideStationPalette.haze : guideStationPalette.coach;
  const roofColor = dimmed ? guideStationPalette.hazeBright : guideStationPalette.coachEdge;
  const edgeColor = guideStationPalette.coachEdge;

  return (
    <group name={dimmed ? "NeighbourCoachBody" : "HeroCoachBody"}>
      {/* Lower coach skirt / underframe beam (y: 0.35m to 0.85m) */}
      <mesh position={[0, 0.60, 0]} castShadow receiveShadow>
        <boxGeometry args={[22, 0.50, 0.42]} />
        <meshStandardMaterial color={bodyColor} metalness={0.35} roughness={0.45} />
      </mesh>

      {/* Corrugated horizontal ribs below window (y: 0.85m to 1.15m) */}
      {[-0.08, 0.0, 0.08].map((dy) => (
        <mesh key={dy} position={[0, 1.0 + dy, 0.22]}>
          <boxGeometry args={[22, 0.035, 0.02]} />
          <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.45} />
        </mesh>
      ))}

      {/* Dual cream-ochre livery pinstripes running across coach (y: 1.16m and 1.22m) */}
      <mesh position={[0, 1.16, 0.22]}>
        <boxGeometry args={[21.9, 0.025, 0.02]} />
        <meshStandardMaterial color={guideStationPalette.coachBand} metalness={0.15} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.22, 0.22]}>
        <boxGeometry args={[21.9, 0.025, 0.02]} />
        <meshStandardMaterial color={guideStationPalette.coachBand} metalness={0.15} roughness={0.6} />
      </mesh>

      {/* Left coach wall panel (x: -11m to -0.69m, y: 0.85m to 2.70m) */}
      <mesh position={[-5.845, 1.775, 0]} castShadow receiveShadow>
        <boxGeometry args={[10.31, 1.85, 0.42]} />
        <meshStandardMaterial color={bodyColor} metalness={0.35} roughness={0.45} />
      </mesh>

      {/* Right coach wall panel (x: +0.69m to +11m, y: 0.85m to 2.70m) */}
      <mesh position={[5.845, 1.775, 0]} castShadow receiveShadow>
        <boxGeometry args={[10.31, 1.85, 0.42]} />
        <meshStandardMaterial color={bodyColor} metalness={0.35} roughness={0.45} />
      </mesh>

      {/* Wall panel below the hero window (x: -0.69m to +0.69m, y: 0.85m to 1.18m) */}
      <mesh position={[0, 1.015, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.38, 0.33, 0.42]} />
        <meshStandardMaterial color={bodyColor} metalness={0.35} roughness={0.45} />
      </mesh>

      {/* Wall panel above the hero window (x: -0.69m to +0.69m, y: 2.12m to 2.70m) */}
      <mesh position={[0, 2.41, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.38, 0.58, 0.42]} />
        <meshStandardMaterial color={bodyColor} metalness={0.35} roughness={0.45} />
      </mesh>

      {/* Corrugated ribs above window (y: 2.22m and 2.36m) */}
      {[-0.07, 0.07].map((dy) => (
        <mesh key={dy} position={[0, 2.29 + dy, 0.22]}>
          <boxGeometry args={[22, 0.035, 0.02]} />
          <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.45} />
        </mesh>
      ))}

      {/* Upper cream livery pinstripe (y = 2.48m) */}
      <mesh position={[0, 2.48, 0.22]}>
        <boxGeometry args={[21.9, 0.025, 0.02]} />
        <meshStandardMaterial color={guideStationPalette.coachBand} metalness={0.15} roughness={0.6} />
      </mesh>

      {/* Neighboring Compartment Windows on the coach */}
      {[-2.55, -5.8, 2.55, 5.8].map((x) => (
        <group key={x} position={[x, 1.65, 0.215]}>
          {/* Aluminum & steel frame */}
          <mesh>
            <boxGeometry args={[1.28, 0.88, 0.04]} />
            <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.75} roughness={0.32} />
          </mesh>
          {/* Dimly lit, softly frosted sleeper window glass with warm tungsten glow */}
          <mesh position={[0, 0, 0.015]}>
            <boxGeometry args={[1.18, 0.78, 0.01]} />
            <meshStandardMaterial
              color="#C87A38"
              emissive="#C87A38"
              emissiveIntensity={0.32}
              roughness={0.25}
              metalness={0.2}
            />
          </mesh>
          {/* Miniature horizontal safety bars */}
          {[-0.22, -0.07, 0.08, 0.23].map((by) => (
            <mesh key={by} position={[0, by, 0.028]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.006, 0.006, 1.18, 8]} />
              <meshStandardMaterial color="#14181D" metalness={0.85} roughness={0.25} />
            </mesh>
          ))}
          {/* Semi-frosted upper shutter louvers */}
          <mesh position={[0, 0.28, 0.025]}>
            <boxGeometry args={[1.18, 0.18, 0.015]} />
            <meshStandardMaterial color="#101720" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Warm point light spilling from left neighbor window at x = -2.55 */}
          {x === -2.55 && (
            <pointLight position={[0, 0, 0.2]} intensity={25} distance={3.5} color="#C87A38" decay={2} />
          )}
        </group>
      ))}

      {/* Curved roof arch (y: 2.7m to 3.4m) */}
      <mesh position={[0, 2.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[22, 0.3, 0.46]} />
        <meshStandardMaterial color={roofColor} metalness={0.45} roughness={0.45} />
      </mesh>
      <mesh position={[0, 3.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.75, 0.75, 22, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={roofColor} metalness={0.45} roughness={0.45} />
      </mesh>

      {/* Recessed vestibule doors at ends with handrails */}
      {[-8.5, 8.5].map((x) => (
        <group key={x} position={[x, 1.45, 0.22]}>
          <mesh>
            <boxGeometry args={[0.9, 1.7, 0.04]} />
            <meshStandardMaterial color="#101720" metalness={0.7} roughness={0.35} />
          </mesh>
          {[-0.48, 0.48].map((dx) => (
            <mesh key={dx} position={[dx, 0, 0.06]}>
              <cylinderGeometry args={[0.015, 0.015, 1.4, 8]} />
              <meshStandardMaterial color={edgeColor} metalness={0.85} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Underframe bogies, wheels, and couplers */}
      {[-6.5, 6.5].map((x) => (
        <group key={x} position={[x, 0.15, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.8, 16]} />
            <meshStandardMaterial color="#0C0C0E" metalness={0.8} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.05, 0.2]}>
            <boxGeometry args={[1.8, 0.18, 0.1]} />
            <meshStandardMaterial color="#14181D" metalness={0.75} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Wet concrete station platform at y = 0.
 * Features dark wet concrete surface, yellow tactile line at z = 0.45m, and cast-iron bench.
 */
function WetPlatform() {
  return (
    <group name="WetPlatform">
      {/* Platform slab at y = 0.0m */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 12]} receiveShadow>
        <planeGeometry args={[75, 30]} />
        <meshStandardMaterial
          color={guideStationPalette.platform}
          metalness={0.35}
          roughness={0.20}
        />
      </mesh>

      {/* Yellow tactile safety line at track edge (z = 0.45m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.45]}>
        <planeGeometry args={[75, 0.14]} />
        <meshBasicMaterial color={guideStationPalette.platformEdge} toneMapped={false} />
      </mesh>

      {/* Cast-iron station bench at x = -10, z = 4.5 */}
      <group position={[-10, 0.45, 4.5]} name="StationBench">
        <mesh castShadow>
          <boxGeometry args={[2.8, 0.08, 0.55]} />
          <meshStandardMaterial color="#121820" metalness={0.65} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.35, -0.24]} castShadow>
          <boxGeometry args={[2.8, 0.6, 0.06]} />
          <meshStandardMaterial color="#121820" metalness={0.65} roughness={0.35} />
        </mesh>
        {[-1.2, 1.2].map((x) => (
          <mesh key={x} position={[x, -0.22, 0]}>
            <boxGeometry args={[0.08, 0.44, 0.45]} />
            <meshStandardMaterial color="#0C0C0E" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/**
 * Grand iron station rafters & roof trusses elevated to y >= 22m (PRD §5.5).
 */
function HallRafters() {
  const trussX = [-18, -12, 12, 18];

  return (
    <group name="StationHallRafters">
      {trussX.map((x) => (
        <group key={x} position={[x, 0, -5.8]}>
          {/* Angled steel truss chords elevated high to y = 24.5m */}
          <mesh position={[0, 24.5, 0]} rotation={[0, 0, -0.55]}>
            <boxGeometry args={[0.2, 10, 0.25]} />
            <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 24.5, 0]} rotation={[0, 0, 0.55]}>
            <boxGeometry args={[0.2, 10, 0.25]} />
            <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.8} roughness={0.3} />
          </mesh>
          {/* High horizontal cross-tie beam at y = 22.2m */}
          <mesh position={[0, 22.2, 0]}>
            <boxGeometry args={[11, 0.24, 0.26]} />
            <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.8} roughness={0.3} />
          </mesh>
          {/* High hanging sodium practical lamp at y = 21.6m */}
          <mesh position={[0, 21.6, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshBasicMaterial color={guideStationPalette.practicalWarm} toneMapped={false} />
          </mesh>
          <pointLight
            position={[0, 21.4, 0]}
            intensity={55}
            distance={24}
            color={guideStationPalette.practicalWarm}
            decay={2}
          />
        </group>
      ))}

      {/* Cast-iron supporting columns at station sides */}
      {[-18, 18].map((x) => (
        <mesh key={x} position={[x, 10.75, -5.8]}>
          <cylinderGeometry args={[0.28, 0.38, 21.5, 16]} />
          <meshStandardMaterial color="#101720" metalness={0.75} roughness={0.35} />
        </mesh>
      ))}

      {/* Bilingual Station Nameboard high on the rafters at y = 25.2m */}
      <group position={[0, 25.2, -5.8]} name="StationNameboard">
        <mesh>
          <boxGeometry args={[8.5, 1.4, 0.12]} />
          <meshStandardMaterial color="#0A1017" metalness={0.65} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <planeGeometry args={[8.2, 1.2]} />
          <meshBasicMaterial color="#FFB84D" transparent opacity={0.18} />
        </mesh>
      </group>

      {/* Staggered soft diagonal roof light shafts positioned safely behind/above board */}
      {[-6.5, 0.0, 6.5].map((x, i) => (
        <mesh
          key={i}
          position={[x, 20.0 + i * 1.5, -9.5 + i * 1.0]}
          rotation={[0.42, 0, -0.32]}
          renderOrder={4}
        >
          <planeGeometry args={[5.0, 16]} />
          <meshBasicMaterial
            color="#FFB84D"
            transparent
            opacity={0.016}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Luminous teal-blue skylight haze behind the departure board at (0, 14, -10).
 * Guarantees razor-sharp silhouette contrast at F5 and F6 (PRD §5.5).
 */
function LuminousHaze() {
  return (
    <group name="LuminousHaze">
      {/* Sky opening haze directly behind the board */}
      <mesh position={[0, 14, -10]}>
        <planeGeometry args={[36, 18]} />
        <meshBasicMaterial
          color={guideStationPalette.hazeBright}
          transparent
          opacity={0.65}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      {/* Deeper blue-hour atmosphere fill */}
      <mesh position={[0, 10, -16]}>
        <planeGeometry args={[72, 26]} />
        <meshBasicMaterial
          color={guideStationPalette.haze}
          transparent
          opacity={0.55}
          depthWrite={false}
          fog={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Train set consisting of Hero Coach (with window assembly) and Neighbour Coach.
 * During departure beat (p from 0.35 to 0.85), the train translates along -x,
 * while the platform man remains standing alone.
 */
function TrainSet({ getProgress }: { getProgress: () => number }) {
  const trainRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0 || !trainRef.current) return;
    const p = getProgress();
    const frame = sampleGuideRail(p);
    // Smoothly slide coach left along -x during departure
    trainRef.current.position.x = -frame.departureOffset * 22.0;
  });

  return (
    <group ref={trainRef} name="StationTrainSet">
      {/* Hero Coach with Window Assembly */}
      <CoachBody />
      <WindowAssembly getProgress={getProgress} />

      {/* Neighbour coach linked on track (vanishing into mist along track) */}
      <group position={[23.5, 0, 0]}>
        <CoachBody dimmed />
      </group>
      <group position={[-23.5, 0, 0]}>
        <CoachBody dimmed />
      </group>
    </group>
  );
}

/**
 * The complete Guide Hero v3 "Station Sequence" 3D Scene.
 */
export function StationScene({
  progress = 0,
  getProgress,
  getTargetProgress,
  board,
}: StationSceneProps) {
  const readProgress = useMemo(() => getProgress ?? (() => progress), [getProgress, progress]);
  const readTargetProgress = useMemo(
    () => getTargetProgress ?? readProgress,
    [getTargetProgress, readProgress]
  );

  return (
    <>
      {/* Dark blue-hour background and global atmosphere fog */}
      <color attach="background" args={[guideStationPalette.fog]} />
      <fogExp2 attach="fog" args={[guideStationPalette.fog, GUIDE_STATION_FOG_DENSITY]} />

      {/* Cinematic camera rig sampling calibrated guideRail.ts */}
      <StationCamera getProgress={readProgress} getTargetProgress={readTargetProgress} />

      {/* Dedicated Blue-Hour Lighting Rig: Illuminates +z coach face and wet platform */}
      <hemisphereLight args={[guideStationPalette.rim, guideStationPalette.fog, 0.55]} />
      <directionalLight position={[2.0, 6.0, 5.0]} intensity={1.8} color="#6CA6D8" />
      <directionalLight position={[-6.0, 10.0, 8.0]} intensity={0.65} color={guideStationPalette.rim} />

      {/* Overhead Platform Mercury-Vapor / Blue-Hour Lamps */}
      {[-3.2, 3.2].map((x) => (
        <group key={x} position={[x, 4.0, 3.5]} name={`PlatformLamp_${x}`}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.22, 0.36, 0.22, 16, 1, true]} />
            <meshStandardMaterial color="#1A2836" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#7CB8F8" toneMapped={false} />
          </mesh>
          <pointLight color="#5B9BD5" intensity={55} distance={14} decay={1.8} />
        </group>
      ))}

      {/* Scene Elements */}
      <WetPlatform />
      <TrainSet getProgress={readProgress} />
      <RainStreaks />
      <HallRafters />
      <LuminousHaze />
      <StationBoard getProgress={readProgress} board={board} />
    </>
  );
}

export default StationScene;
