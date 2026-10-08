"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BoardRoot } from "../BoardRoot";
import { GUIDE_BOARD_WORLD_POSITION, sampleGuideRail } from "./guideRail";
import { GUIDE_STATION_FOG_DENSITY, guideStationPalette } from "./palette";
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

function StationCamera({ getProgress, getTargetProgress }: { getProgress: () => number; getTargetProgress: () => number }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useFrame(({ clock }) => {
    const camera = cameraRef.current;
    if (!camera) return;
    const frame = sampleGuideRail(getProgress());
    const drift = reduceMotion ? 0 : Math.sin(clock.elapsedTime * 1.88) * frame.handheldAmplitude;
    camera.position.set(frame.position[0] + drift, frame.position[1] + drift * 0.35, frame.position[2]);
    camera.fov = frame.fov;
    camera.updateProjectionMatrix();
    target.set(frame.lookAt[0] + drift * 0.2, frame.lookAt[1], frame.lookAt[2]);
    camera.lookAt(target);
    camera.rotateZ(reduceMotion ? frame.roll : frame.roll + drift * 0.08);
    camera.updateMatrixWorld();

    if (typeof window !== "undefined") {
      window.__guideStationCamera = {
        progress: frame.progress,
        targetProgress: getTargetProgress(),
        position: [camera.position.x, camera.position.y, camera.position.z],
        lookAt: [target.x, target.y, target.z],
      };
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault near={0.1} far={100} />;
}

function StationBoard({ getProgress, board }: { getProgress: () => number; board?: StationSceneProps["board"] }) {
  const revealRef = useRef<THREE.Group>(null);
  const mostAskedRevealed = useRef(false);
  const carouselTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => {
    if (carouselTimeout.current) clearTimeout(carouselTimeout.current);
  }, []);

  useFrame(() => {
    const group = revealRef.current;
    if (!group) return;
    const progress = getProgress();
    group.visible = progress >= 0.62;
    if (progress < 0.82 || mostAskedRevealed.current) return;
    mostAskedRevealed.current = true;
    useGuideStore.getState().revealMostAsked();
    carouselTimeout.current = setTimeout(() => useGuideStore.getState().advancePopularCarousel(), 12_000);
  });

  return (
    <group ref={revealRef} name="StationBoardReveal">
      <BoardRoot
        boardWidth={board?.boardWidth}
        boardHeight={board?.boardHeight}
        cols={board?.cols}
        rows={board?.rows}
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

function Coach({ position, dimmed = false }: { position: THREE.Vector3Tuple; dimmed?: boolean }) {
  const bodyColor = dimmed ? guideStationPalette.haze : guideStationPalette.coach;
  const roofColor = dimmed ? guideStationPalette.hazeBright : guideStationPalette.coachEdge;
  const windowPositions = [-5.9, -3.1, -0.3, 2.5, 5.3].filter((x) => dimmed || x !== -0.3);

  return (
    <group position={position} name={dimmed ? "NeighbourCoach" : "HeroCoach"}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[22, 1.44, 0.82]} />
        <meshStandardMaterial color={bodyColor} metalness={0.35} roughness={0.54} />
      </mesh>
      <mesh position={[-5.55, 2.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[10.9, 1.62, 0.82]} />
        <meshStandardMaterial color={bodyColor} metalness={0.35} roughness={0.64} />
      </mesh>
      <mesh position={[5.55, 2.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[10.9, 1.62, 0.82]} />
        <meshStandardMaterial color={bodyColor} metalness={0.35} roughness={0.64} />
      </mesh>
      <mesh position={[0, 3.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[22, 0.24, 0.86]} />
        <meshStandardMaterial color={roofColor} metalness={0.46} roughness={0.42} />
      </mesh>
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.84, 0.84, 22, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={roofColor} metalness={0.42} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.2, 0.44]}>
        <boxGeometry args={[21.6, 0.2, 0.04]} />
        <meshStandardMaterial color={guideStationPalette.coachBand} metalness={0.2} roughness={0.68} />
      </mesh>
      {windowPositions.map((x) => (
        <group key={x} position={[x, 2.3, 0.455]}>
          <mesh>
            <boxGeometry args={[2.14, 1.24, 0.06]} />
            <meshStandardMaterial color={guideStationPalette.boardInk} metalness={0.34} roughness={0.48} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[1.82, 0.93, 0.025]} />
            <meshStandardMaterial color={guideStationPalette.haze} metalness={0.55} roughness={0.24} />
          </mesh>
        </group>
      ))}
      <mesh position={[-8.4, 1.9, 0.46]}>
        <boxGeometry args={[1.1, 1.55, 0.05]} />
        <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.5} roughness={0.38} />
      </mesh>
      <mesh position={[8.4, 1.9, 0.46]}>
        <boxGeometry args={[1.1, 1.55, 0.05]} />
        <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.5} roughness={0.38} />
      </mesh>
      {[-10.1, -7.3, -4.5, -1.7, 1.7, 4.5, 7.3, 10.1].map((x) => (
        <mesh key={x} position={[x, 1.9, 0.5]}>
          <boxGeometry args={[0.08, 1.52, 0.04]} />
          <meshStandardMaterial color={guideStationPalette.boardInk} metalness={0.62} roughness={0.52} />
        </mesh>
      ))}
      {[-7, 7].map((x) => (
        <group key={x} position={[x, -0.08, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.88, 0.88, 0.24, 20]} />
            <meshStandardMaterial color={guideStationPalette.boardInk} metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.14]}>
            <cylinderGeometry args={[0.38, 0.38, 0.03, 16]} />
            <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.78} roughness={0.28} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[18, 0.22, 0.56]} />
        <meshStandardMaterial color={guideStationPalette.boardInk} metalness={0.68} roughness={0.38} />
      </mesh>
      {[-11.2, 11.2].map((x) => (
        <mesh key={x} position={[x, 0.15, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.86, 12]} />
          <meshStandardMaterial color={guideStationPalette.boardInk} metalness={0.68} roughness={0.44} />
        </mesh>
      ))}
    </group>
  );
}

function WetPlatform() {
  return (
    <group name="WetPlatform">
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[72, 40]} />
        <meshStandardMaterial color={guideStationPalette.platform} metalness={0.28} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.012, 2.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[72, 0.18]} />
        <meshBasicMaterial color={guideStationPalette.platformEdge} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.018, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 4]} />
        <meshBasicMaterial color={guideStationPalette.windowFalloff} transparent opacity={0.1} depthWrite={false} />
      </mesh>
      {[-18, -6, 7, 19].map((x) => (
        <mesh key={x} position={[x, 0.02, 3.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7, 2.2]} />
          <meshBasicMaterial color={guideStationPalette.hazeBright} transparent opacity={0.08} depthWrite={false} />
        </mesh>
      ))}
      <mesh position={[-12, 0.48, 5]}>
        <boxGeometry args={[4.4, 0.34, 0.48]} />
        <meshStandardMaterial color={guideStationPalette.boardInk} metalness={0.55} roughness={0.34} />
      </mesh>
      {[-13.7, -10.3].map((x) => (
        <mesh key={x} position={[x, 0.8, 5]}>
          <boxGeometry args={[0.22, 0.72, 0.22]} />
          <meshStandardMaterial color={guideStationPalette.boardInk} metalness={0.56} roughness={0.36} />
        </mesh>
      ))}
    </group>
  );
}

function HallRafters() {
  const trusses = [-16, -8, 0, 8, 16];
  return (
    <group name="StationHall">
      {trusses.map((x) => (
        <group key={x} position={[x, 0, -5]}>
          <mesh position={[0, 10.5, 0]} rotation={[0, 0, -0.62]} castShadow>
            <boxGeometry args={[0.13, 13, 0.18]} />
            <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.78} roughness={0.28} />
          </mesh>
          <mesh position={[0, 10.5, 0]} rotation={[0, 0, 0.62]} castShadow>
            <boxGeometry args={[0.13, 13, 0.18]} />
            <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.78} roughness={0.28} />
          </mesh>
          <mesh position={[0, 15.8, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <boxGeometry args={[8.1, 0.2, 0.22]} />
            <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.78} roughness={0.28} />
          </mesh>
          <mesh position={[0, 8.2, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial
              color={guideStationPalette.practicalWarm}
              emissive={guideStationPalette.practicalWarm}
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      {[-16, 16].map((x) => (
        <mesh key={x} position={[x, 5.5, -5]} castShadow>
          <boxGeometry args={[0.5, 11, 0.5]} />
          <meshStandardMaterial color={guideStationPalette.boardInk} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function FarStation() {
  return (
    <group name="FarStation">
      <mesh position={[0, 5.5, -19]}>
        <planeGeometry args={[68, 18]} />
        <meshBasicMaterial color={guideStationPalette.haze} transparent opacity={0.52} depthWrite={false} fog={false} />
      </mesh>
      <mesh position={[0, 6, -18.85]}>
        <planeGeometry args={[47, 8]} />
        <meshBasicMaterial color={guideStationPalette.coach} transparent opacity={0.7} depthWrite={false} fog={false} />
      </mesh>
      {[-18, -12, -6, 0, 6, 12, 18].map((x) => (
        <mesh key={x} position={[x, 8, -18.7]}>
          <planeGeometry args={[0.44, 5.6]} />
          <meshBasicMaterial color={guideStationPalette.coachEdge} transparent opacity={0.32} depthWrite={false} fog={false} />
        </mesh>
      ))}
      <mesh position={[13, 2.1, -17.9]}>
        <planeGeometry args={[7, 1.4]} />
        <meshBasicMaterial color={guideStationPalette.windowFalloff} transparent opacity={0.24} depthWrite={false} fog={false} />
      </mesh>
    </group>
  );
}

function LuminousHaze() {
  return (
    <group name="LuminousHaze">
      <mesh position={[0, 14, -12]}>
        <planeGeometry args={[34, 21]} />
        <meshBasicMaterial
          color={guideStationPalette.hazeBright}
          transparent
          opacity={0.58}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 7, -17]}>
        <planeGeometry args={[64, 16]} />
        <meshBasicMaterial
          color={guideStationPalette.haze}
          transparent
          opacity={0.62}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      {[-13, 13].map((x) => (
        <mesh key={x} position={[x, 3.8, -10]}>
          <planeGeometry args={[5.5, 3.2]} />
          <meshBasicMaterial color={guideStationPalette.coach} transparent opacity={0.55} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function BoardHangers() {
  return (
    <group name="BoardHangers">
      {[-6, -2, 2, 6].map((x) => (
        <mesh key={x} position={[x, 18, GUIDE_BOARD_WORLD_POSITION[2]]}>
          <cylinderGeometry args={[0.045, 0.045, 8, 12]} />
          <meshStandardMaterial color={guideStationPalette.boardInk} metalness={0.75} roughness={0.32} />
        </mesh>
      ))}
    </group>
  );
}

/** Pre-dawn station scene; the Phase 3 camera rig samples its rail through the shared render clock. */
export function StationScene({ progress = 0, getProgress, getTargetProgress, board }: StationSceneProps) {
  const readProgress = useMemo(() => getProgress ?? (() => progress), [getProgress, progress]);
  const readTargetProgress = useMemo(() => getTargetProgress ?? readProgress, [getTargetProgress, readProgress]);

  return (
    <>
      <color attach="background" args={[guideStationPalette.fog]} />
      <fogExp2 attach="fog" args={[guideStationPalette.fog, GUIDE_STATION_FOG_DENSITY]} />
      <StationCamera getProgress={readProgress} getTargetProgress={readTargetProgress} />
      <hemisphereLight args={[guideStationPalette.rim, guideStationPalette.fog, 0.35]} />
      <directionalLight position={[-8, 15, 8]} intensity={0.8} color={guideStationPalette.rim} />
      <pointLight position={[0.3, 2.3, -1.5]} intensity={80} decay={2} color={guideStationPalette.windowGlow} />
      <spotLight
        position={[0, 7, 2]}
        rotation={[-0.68, 0, 0]}
        intensity={120}
        angle={0.7}
        penumbra={0.8}
        color={guideStationPalette.windowGlow}
      />
      <WetPlatform />
      <Coach position={[0, 0, 0]} />
      <Coach position={[0, 0, -4]} dimmed />
      <Coach position={[0, 0, -8]} dimmed />
      <WindowAssembly progress={readProgress()} getProgress={readProgress} />
      <RainStreaks />
      <HallRafters />
      <LuminousHaze />
      <FarStation />
      <BoardHangers />
      <StationBoard getProgress={readProgress} board={board} />
    </>
  );
}

export default StationScene;
