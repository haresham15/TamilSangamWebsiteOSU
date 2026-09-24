"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface ArenaLightingEnvironmentProps {
  isMobile?: boolean;
  godLightIntensity?: number;
}

/**
 * ArenaLightingEnvironment:
 * Cinematic lighting, stadium backlight (The God Light), and floating embers.
 * Directly reconstructed from the high-contrast backlighting of the "Naa Ready" reference image.
 */
// Deterministic floating embers generator
function generateEmbersData(emberCount: number) {
  let seed = 777;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const pos = new Float32Array(emberCount * 3);
  const vels = new Float32Array(emberCount * 3);
  const data = new Float32Array(emberCount * 2); // [radius, angle]

  for (let i = 0; i < emberCount; i++) {
    const r = 0.5 + rand() * 5.5;
    const theta = rand() * Math.PI * 2;
    const y = rand() * 6.0;

    pos[i * 3 + 0] = Math.cos(theta) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(theta) * r;

    vels[i * 3 + 0] = (rand() - 0.5) * 0.15;
    vels[i * 3 + 1] = 0.35 + rand() * 0.55; // Upward drift
    vels[i * 3 + 2] = (rand() - 0.5) * 0.15;

    data[i * 2 + 0] = r;
    data[i * 2 + 1] = theta;
  }

  return {
    emberPositions: pos,
    emberVelocities: vels,
    emberOriginalData: data,
  };
}

const embersCache: Record<number, ReturnType<typeof generateEmbersData>> = {};
function getEmbersData(emberCount: number) {
  if (!embersCache[emberCount]) {
    embersCache[emberCount] = generateEmbersData(emberCount);
  }
  return embersCache[emberCount];
}

export function ArenaLightingEnvironment({
  isMobile = false,
  godLightIntensity = 1500,
}: ArenaLightingEnvironmentProps) {
  // Common target for spotlights centered on the elevated table
  const centralTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0, 1.5, 0);
    return obj;
  }, []);



  // Perimeter pyre spotlight positions: (±13, 12, ±13)
  const pyrePositions = useMemo<[number, number, number][]>(() => {
    return [
      [-13, 12, -13],
      [13, 12, -13],
      [-13, 12, 13],
      [13, 12, 13],
    ];
  }, []);

  // Subtle flicker effect on pyre lights to simulate burning factory flames
  const pyreRefs = useRef<(THREE.SpotLight | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    pyreRefs.current.forEach((light, i) => {
      if (light) {
        const flicker =
          Math.sin(t * 8.0 + i * 2.1) * Math.cos(t * 5.3 + i * 1.7);
        light.intensity = 1100 + flicker * 150;
      }
    });
  });

  // 6 PointLights arrayed above the crowd annulus (r = 7.0m, y = 4.0m)
  const crowdLightPositions = useMemo<[number, number, number][]>(() => {
    const r = 7.0;
    return [0, 1, 2, 3, 4, 5].map((i) => {
      const angle = (i * Math.PI * 2) / 6;
      return [
        Math.cos(angle) * r,
        4.0,
        Math.sin(angle) * r,
      ] as [number, number, number];
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Stage Backdrop Banner ("Naa Ready" Typography, Radial Spokes & Lion Emblems)
  // Reconstructed directly from the iconic Leo concert stage reference footage
  // ---------------------------------------------------------------------------
  const [stageBackdropTexture, setStageBackdropTexture] = React.useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load("/media/leo_backdrop.png", (tex) => {
      tex.generateMipmaps = true;
      setStageBackdropTexture(tex);
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Floating Embers System (350 Glowing Sparks Drifting Slowly Upward)
  // ---------------------------------------------------------------------------
  const emberCount = isMobile ? 150 : 350;
  const emberPointsRef = useRef<THREE.Points>(null);

  const { emberPositions, emberVelocities, emberOriginalData } = useMemo(
    () => getEmbersData(emberCount),
    [emberCount]
  );

  const sparkTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    if (!emberPointsRef.current) return;
    const posAttr = emberPointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < emberCount; i++) {
      // Upward drift
      array[i * 3 + 1] += emberVelocities[i * 3 + 1] * delta;

      // Gentle orbital swirl based on elapsed time and initial offset
      const initialAngle = emberOriginalData[i * 2 + 1];
      const angle = initialAngle + time * 0.2;
      const r = emberOriginalData[i * 2 + 0];
      array[i * 3 + 0] = Math.cos(angle) * r;
      array[i * 3 + 2] = Math.sin(angle) * r;

      // Reset when drifting above y: 6.5
      if (array[i * 3 + 1] > 6.5) {
        array[i * 3 + 1] = 0.2 + (Math.sin(i + angle) * 0.2 + 0.2);
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <>
      {/* Declarative spotlight tracking anchor */}
      <primitive object={centralTarget} />

      {/* 1. Fiery Deep Atmospheric Ambient Fill (Subtle to preserve deep silhouette contrast) */}
      <ambientLight color="#FF7700" intensity={0.25} />

      {/* 2. Warm Horizon Hemisphere Light */}
      <hemisphereLight
        color="#FFAA00"
        groundColor="#080402"
        intensity={0.2}
      />

      {/* 2.5 Diegetic Character Backlight (Creates cinematic bloom on alpha planes) */}
      <pointLight
        position={[0, 1.05, -0.5]}
        color="#FF7700"
        intensity={150}
        distance={8}
      />

      {/* 3. THE GOD LIGHT: Blinding intense backlight placed directly behind the silhouette */}
      {/* Position: (0, 2.0, -2.0), Color: #FFF5E1, Intensity: 1500 (Spikes on click) */}
      <pointLight
        position={[0, 2.0, -2.0]}
        color="#FFF5E1"
        intensity={godLightIntensity}
        distance={15}
        decay={2}
      />

      {/* God Light Focused Forward Cone targeting the silhouette */}
      <spotLight
        position={[0, 2.1, -2.2]}
        target={centralTarget}
        color="#FFF2D6"
        intensity={godLightIntensity * 0.75}
        angle={Math.PI / 3.4}
        penumbra={0.7}
        distance={15}
        decay={2}
      />

      {/* Concert Stage Halo & Searchlight Core (Matching Reference Image Stage Truss Arc) */}
      <group position={[0, 2.35, -2.05]}>
        {/* Core blinding searchlight aperture behind character's neck/shoulders */}
        <mesh>
          <circleGeometry args={[0.28, 32]} />
          <meshBasicMaterial
            color="#FFFDF5"
            transparent
            opacity={0.98}
          />
        </mesh>
        {/* Inner radiant flare ring */}
        <mesh position={[0, 0, -0.01]}>
          <ringGeometry args={[0.26, 0.95, 32]} />
          <meshBasicMaterial
            color="#FFB703"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Outer stadium arch halo glow */}
        <mesh position={[0, 0, -0.02]}>
          <ringGeometry args={[0.92, 2.2, 32]} />
          <meshBasicMaterial
            color="#D97706"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 12 Radiating Stage Truss Light Beams (Spokes from center flare) */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((idx) => {
          const angle = (idx * Math.PI) / 11; // 180-degree upper hemisphere fan
          return (
            <mesh
              key={`spoke-${idx}`}
              position={[Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, -0.03]}
              rotation={[0, 0, angle - Math.PI / 2]}
            >
              <planeGeometry args={[0.04, 1.8]} />
              <meshBasicMaterial
                color="#F59E0B"
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>

      {/* 4. Concert Stage Backdrop Banner ("Naa Ready" + Sunburst + Lion Emblems) */}
      {stageBackdropTexture && (
        <mesh position={[0, 2.75, -2.5]}>
          <planeGeometry args={[8.0, 4.0]} />
          <meshBasicMaterial
            map={stageBackdropTexture}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* 5. Overhead Key Light (Top edge rim definition) */}
      <spotLight
        position={[0, 16, 0]}
        target={centralTarget}
        color="#FFD180"
        intensity={isMobile ? 300 : 450}
        angle={Math.PI / 4.8}
        penumbra={0.65}
        decay={1.8}
        distance={30}
      />

      {/* 5. Four Perimeter Industrial Pyre Spotlights */}
      {pyrePositions.map((pos, idx) => (
        <spotLight
          key={`pyre-${idx}`}
          ref={(el) => {
            pyreRefs.current[idx] = el;
          }}
          position={pos}
          target={centralTarget}
          color="#FF8C00"
          intensity={1100}
          angle={Math.PI / 4.2}
          penumbra={0.7}
          decay={1.5}
          distance={45}
        />
      ))}

      {/* 6. Array of 6 PointLights hovering above the crowd annulus */}
      {crowdLightPositions.map((pos, idx) => (
        <pointLight
          key={`crowd-rim-${idx}`}
          position={pos}
          color="#FFAA00"
          intensity={80}
          distance={16}
          decay={1.6}
        />
      ))}

      {/* 7. Floating Embers Particle System (350 Glowing Orange Sparks) */}
      <points ref={emberPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[emberPositions, 3]}
          />
        </bufferGeometry>
        {sparkTexture && (
          <pointsMaterial
            size={0.05}
            color="#FFAA00"
            transparent={true}
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            map={sparkTexture}
          />
        )}
      </points>
    </>
  );
}
