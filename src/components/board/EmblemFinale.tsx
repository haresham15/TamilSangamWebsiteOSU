"use client";

import React, { useRef, useEffect, useMemo, useState, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useBoardHeroStore } from "@/store/boardHeroStore";
import { FinaleLamps, OilLamp } from "./OilLamp";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { chamferedBox, latheProfile, mergeParts, type Part, type Vec3 } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";
import { createSurfaceMaterial } from "@/gl/art/surface";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { createLampLightUniforms, withLampLight } from "./boardArt";

const HALO_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const HALO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(1.0 - smoothstep(0.0, 1.0, d), 2.0);
    gl_FragColor = vec4(uColor, a * uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
// Same colour and peak opacity as the old flat plane; module-scope uniforms hold no GPU resources.
const haloUniforms = { uColor: { value: new THREE.Color("#F4F0FA") }, uOpacity: { value: 0.35 } };
const artHaloUniforms = { uColor: { value: new THREE.Color("#ffc47a") }, uOpacity: { value: 0.16 } };

/** Group-local origin of the finale (world y offset 1.8). */
const FINALE_Y = 1.8;
const ALTAR_TOP = -1.05;
const ALTAR_LAMPS: [number, number, number][] = [
  [-1.72, ALTAR_TOP, 0.62],
  [1.72, ALTAR_TOP, 0.62],
];

function petal(size: number, thickness = 0.3) {
  const g = latheProfile(
    [[0, 0], [0.022, 0.012], [0.03, 0.04], [0.023, 0.07], [0.009, 0.094], [0, 0.106]].map(
      ([r, y]) => [r * size, y * size] as [number, number]
    ),
    { radialSegments: 10, smooth: true, samples: 12 }
  );
  g.scale(1, 1, thickness);
  return g;
}

/** Sanctum masonry: back wall, niche pilasters, lintel and cornice, three-step altar. One draw. */
function createSanctumStone() {
  const parts: Part[] = [
    { geometry: chamferedBox(5.6, 5.4, 0.5, 0.03), position: [0, 0.6, -0.78] },
    { geometry: chamferedBox(0.36, 3.5, 0.32, 0.03), position: [-2.0, 0.05, -0.42] },
    { geometry: chamferedBox(0.36, 3.5, 0.32, 0.03), position: [2.0, 0.05, -0.42] },
    { geometry: chamferedBox(0.52, 0.16, 0.42, 0.025), position: [-2.0, 1.86, -0.4] },
    { geometry: chamferedBox(0.52, 0.16, 0.42, 0.025), position: [2.0, 1.86, -0.4] },
    { geometry: chamferedBox(4.6, 0.3, 0.46, 0.035), position: [0, 2.09, -0.38] },
    { geometry: chamferedBox(4.9, 0.14, 0.58, 0.03), position: [0, 2.31, -0.34] },
    { geometry: chamferedBox(4.3, 0.32, 1.9, 0.035), position: [0, -1.64, 0.3] },
    { geometry: chamferedBox(4.38, 0.07, 1.98, 0.02), position: [0, -1.47, 0.3] },
    { geometry: chamferedBox(3.8, 0.24, 1.6, 0.03), position: [0, -1.31, 0.28] },
    { geometry: chamferedBox(3.4, 0.08, 1.42, 0.02), position: [0, ALTAR_TOP - 0.04, 0.26] },
  ];
  return bakeVertexAO(mergeParts(parts), {
    ground: { y: -1.8, height: 0.4, strength: 0.7 },
    bands: [
      { y: -1.48, width: 0.05, strength: 0.6 },
      { y: -1.19, width: 0.05, strength: 0.6 },
      { y: 1.94, width: 0.08, strength: 0.7 },
    ],
    smooth: 2,
  });
}

/** Prabha (flame-fringed aureole) standing on a lotus base: the frame of the emblem. One draw. */
function createAureole() {
  const parts: Part[] = [
    { geometry: new THREE.TorusGeometry(1.3, 0.07, 14, 120), position: [0, 0.3, 0] },
    { geometry: new THREE.TorusGeometry(1.19, 0.028, 8, 120), position: [0, 0.3, 0.02] },
    { geometry: new THREE.TorusGeometry(1.41, 0.022, 8, 120), position: [0, 0.3, -0.02] },
  ];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    if (Math.abs(Math.cos(a) + 1) < 0.12) continue; // base stays open where it meets the lotus
    parts.push({
      geometry: petal(2.2 + (i % 2) * 0.8, 0.35),
      position: [Math.sin(a) * 1.4, 0.3 + Math.cos(a) * 1.4, -0.01],
      rotation: [0, 0, -a],
    });
  }
  const lotus = latheProfile([[0, 0], [0.32, 0], [0.36, 0.04], [0.3, 0.09], [0.16, 0.12], [0, 0.12]], { radialSegments: 32 });
  parts.push({ geometry: lotus, position: [0, ALTAR_TOP, 0] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const g = petal(2.4, 0.3);
    g.rotateX(0.9);
    parts.push({ geometry: g, position: [Math.sin(a) * 0.3, ALTAR_TOP + 0.06, Math.cos(a) * 0.3], rotation: [0, a, 0] });
  }
  return bakeVertexAO(mergeParts(parts), { cavity: 1.3, edges: 1.1 });
}

/** The emblem: turned gold medallion with stepped rings, a lotus in relief and a beaded rim. */
function createMedallion() {
  const disc = latheProfile(
    [
      [0, 0], [1.12, 0], [1.15, 0.03], [1.12, 0.07], [1.0, 0.08], [0.98, 0.05], [0.8, 0.05], [0.78, 0.09],
      [0.74, 0.1], [0.7, 0.07], [0.45, 0.07], [0.42, 0.12], [0.3, 0.16], [0.18, 0.19], [0.08, 0.2], [0, 0.21],
    ],
    { radialSegments: 96 }
  );
  disc.rotateX(Math.PI / 2);
  const parts: Part[] = [{ geometry: disc }];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    parts.push({ geometry: petal(2.6, 0.45), position: [Math.sin(a) * 0.44, Math.cos(a) * 0.44, 0.07], rotation: [0, 0, -a] });
    const b = a + Math.PI / 8;
    parts.push({ geometry: petal(1.8, 0.45), position: [Math.sin(b) * 0.45, Math.cos(b) * 0.45, 0.065], rotation: [0, 0, -b] });
  }
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    parts.push({ geometry: new THREE.SphereGeometry(0.026, 8, 6), position: [Math.sin(a) * 1.07, Math.cos(a) * 1.07, 0.075] });
  }
  return bakeVertexAO(mergeParts(parts), { cavity: 1.4, edges: 1.2 });
}

/**
 * Art-pass sanctum: a lit sacred object rather than a disc. Draws: stone 1, aureole 1,
 * medallion 1, halo 1, lamp bodies 1, lamp flames 1.
 */
function SanctumArt({
  emblemMeshRef,
  ringMeshRef,
  backLightRef,
}: {
  emblemMeshRef: RefObject<THREE.Mesh | null>;
  ringMeshRef: RefObject<THREE.Mesh | null>;
  backLightRef: RefObject<THREE.PointLight | null>;
}) {
  const assets = useMemo(() => {
    // The altar lamps light the stone and metal around them (fake light, world space).
    const lampLight = createLampLightUniforms(
      ALTAR_LAMPS.map(([x, y, z]) => [x, y + FINALE_Y + 0.92, z] as Vec3),
      { intensity: 2.2, range: 5 }
    );
    const stone = withLampLight(createSurfaceMaterial("stone", { color: "#5a4030" }, { cavity: true, grimeTo: 1.4 }), lampLight);
    const bronze = withLampLight(
      createSurfaceMaterial(
        "bronze",
        { color: "#6a4a26", emissive: "#5a3a10", emissiveIntensity: 0.35, envMapIntensity: 1.2 },
        { cavity: true, space: "local", scale: 9 }
      ),
      lampLight
    );
    const gold = withLampLight(
      createSurfaceMaterial(
        "bronze",
        { color: "#c8913a", roughness: 0.28, emissive: "#7a4a12", emissiveIntensity: 0.25, envMapIntensity: 1.5 },
        { cavity: true, space: "local", scale: 12, tintAmount: 0.15, wearColor: "#f6d488", wearAmount: 0.8, wearRoughness: -0.15 }
      ),
      lampLight
    );
    return {
      lampLight,
      stone,
      bronze,
      gold,
      stoneGeo: createSanctumStone(),
      aureoleGeo: createAureole(),
      medallionGeo: createMedallion(),
    };
  }, []);
  useDisposeOnUnmount(assets.stone, assets.bronze, assets.gold, assets.stoneGeo, assets.aureoleGeo, assets.medallionGeo);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    assets.lampLight.uLampTime.value = clock.elapsedTime;
  });

  return (
    <group position={[0, FINALE_Y, 0]}>
      <mesh geometry={assets.stoneGeo} material={assets.stone} receiveShadow />
      <mesh ref={ringMeshRef} geometry={assets.aureoleGeo} material={assets.bronze} />
      <mesh ref={emblemMeshRef} geometry={assets.medallionGeo} material={assets.gold} position={[0, 0.3, -0.06]} />
      <mesh position={[0, 0.3, -0.45]}>
        <planeGeometry args={[4.6, 4.6]} />
        <shaderMaterial
          vertexShader={HALO_VERT}
          fragmentShader={HALO_FRAG}
          uniforms={artHaloUniforms}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <FinaleLamps positions={ALTAR_LAMPS} />
      <pointLight ref={backLightRef} position={[0, 0.9, 1.6]} color="#FFCC66" intensity={3.5} distance={9.0} decay={2.0} />
    </group>
  );
}

interface EmblemFinaleProps {
  scrollProgress: RefObject<number>;
  onFinaleTriggered?: () => void;
}

/**
 * §7: Finale — Chola Tiger Emblem Bloom & Golden Crossfade
 * - The sacred royal tiger emblem sits at the climax of the corridor (z = 0.0).
 * - Sits on bloom layer (layers.enable(1)) as designated bloom source.
 * - At p >= 0.98, ramps emissive from 1.0 -> 3.5, triggering the golden dissolve into DOM roster.
 */
export function EmblemFinale({ scrollProgress, onFinaleTriggered }: EmblemFinaleProps) {
  const emblemMeshRef = useRef<THREE.Mesh>(null);
  const ringMeshRef = useRef<THREE.Mesh>(null);
  const backLightRef = useRef<THREE.PointLight>(null);
  const hasFiredRef = useRef(false);
  const [cinematic] = useState(() => isHeroCinematicEnabled("board"));

  useEffect(() => {
    if (emblemMeshRef.current) {
      emblemMeshRef.current.layers.enable(1);
    }
    if (ringMeshRef.current) {
      ringMeshRef.current.layers.enable(1);
    }
  }, []);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const p = scrollProgress.current;

    // Check trigger threshold (§7: at p=1.0)
    if (p >= 0.98 && !hasFiredRef.current) {
      hasFiredRef.current = true;
      useBoardHeroStore.getState().setFinaleFired(true);

      if (emblemMeshRef.current && ringMeshRef.current && backLightRef.current) {
        const mat = emblemMeshRef.current.material as THREE.MeshStandardMaterial;
        const ringMat = ringMeshRef.current.material as THREE.MeshStandardMaterial;
        const light = backLightRef.current;

        // Refined warm golden bloom: emissive gently elevates from 0.4 -> 0.95
        gsap.to(mat, {
          emissiveIntensity: 0.95,
          duration: 0.35,
          ease: "power2.out",
        });
        gsap.to(ringMat, {
          emissiveIntensity: 0.95,
          duration: 0.35,
          ease: "power2.out",
        });
        gsap.to(light, {
          intensity: 6.5,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            if (onFinaleTriggered) {
              onFinaleTriggered();
            }
          },
        });
      } else if (onFinaleTriggered) {
        onFinaleTriggered();
      }
    } else if (p < 0.96 && hasFiredRef.current) {
      // Reset when user scrolls back up into corridor
      hasFiredRef.current = false;
      useBoardHeroStore.getState().setFinaleFired(false);

      if (emblemMeshRef.current && ringMeshRef.current && backLightRef.current) {
        const mat = emblemMeshRef.current.material as THREE.MeshStandardMaterial;
        const ringMat = ringMeshRef.current.material as THREE.MeshStandardMaterial;
        gsap.killTweensOf([mat, ringMat, backLightRef.current]);
        mat.emissiveIntensity = 0.25;
        ringMat.emissiveIntensity = 0.35;
        backLightRef.current.intensity = 3.5;
      }
    }
  });

  if (cinematic) {
    return <SanctumArt emblemMeshRef={emblemMeshRef} ringMeshRef={ringMeshRef} backLightRef={backLightRef} />;
  }

  return (
    <group position={[0, 1.8, 0]}>
      {/* ========================================================================= */}
      {/* 1. CHOLA SANCTUM DAIS & STONE ARCHWAY RECESS                              */}
      {/* ========================================================================= */}
      {/* Back Wall of Sanctum */}
      <mesh position={[0, 0.4, -0.6]} receiveShadow>
        <boxGeometry args={[5.2, 5.0, 0.4]} />
        <meshStandardMaterial color="#21150e" roughness={0.92} metalness={0.15} />
      </mesh>

      {/* Raised Ceremonial Altar Plinth */}
      <mesh position={[0, -1.5, 0.2]} receiveShadow>
        <boxGeometry args={[3.8, 0.6, 1.4]} />
        <meshStandardMaterial color="#38251a" roughness={0.85} metalness={0.25} />
      </mesh>
      <mesh position={[0, -1.1, 0.2]} receiveShadow>
        <boxGeometry args={[3.2, 0.2, 1.2]} />
        <meshStandardMaterial color="#4a3324" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Flanking Sanctum Brass Lamps */}
      <OilLamp position={[-1.6, -0.8, 0.5]} isRealLight={true} phaseOffset={0.7} />
      <OilLamp position={[1.6, -0.8, 0.5]} isRealLight={true} phaseOffset={2.4} />

      {/* ========================================================================= */}
      {/* 2. CHOLA TIGER EMBLEM MEDALLION & ARCHITECTURAL TORANA                   */}
      {/* ========================================================================= */}
      {/* Heavy Embossed Bronze Disc */}
      <mesh position={[0, 0.3, -0.1]}>
        <cylinderGeometry args={[1.35, 1.35, 0.12, 32]} />
        <meshStandardMaterial color="#2d1d11" roughness={0.7} metalness={0.8} />
      </mesh>

      {/* Brushed 24K Gold Aureole Ring */}
      <mesh ref={ringMeshRef} position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.3, 0.08, 16, 48]} />
        <meshStandardMaterial
          color="#A6F0CF"
          emissive="#523B0F"
          emissiveIntensity={0.35}
          roughness={0.22}
          metalness={0.92}
        />
      </mesh>

      {/* Imperial Tiger Emblem Face Disc */}
      <mesh ref={emblemMeshRef} position={[0, 0.3, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.22, 1.22, 0.04, 32]} />
        <meshStandardMaterial
          color="#A6F0CF"
          emissive="#523B0F"
          emissiveIntensity={0.25}
          roughness={0.26}
          metalness={0.94}
        />
      </mesh>

      {/* Backlit Golden Morning Bloom halo for Smooth Page Melt. Radial falloff: the
          previous flat additive plane read as a pale square card behind the emblem. */}
      <mesh position={[0, 0.3, -0.2]}>
        <planeGeometry args={[4.2, 4.2]} />
        <shaderMaterial
          vertexShader={HALO_VERT}
          fragmentShader={HALO_FRAG}
          uniforms={haloUniforms}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Warm Golden Key Light */}
      <pointLight
        ref={backLightRef}
        position={[0, 0.4, 0.4]}
        color="#FFCC44"
        intensity={3.5}
        distance={12.0}
        decay={2.0}
      />
    </group>
  );
}
