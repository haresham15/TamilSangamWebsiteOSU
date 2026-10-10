"use client";

import React, { useRef, useEffect, useMemo, useSyncExternalStore } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, View, Text3D, Center, Environment, Lightformer } from "@react-three/drei";
import { useLiteMode } from "@/context/LiteModeContext";
import { useTier } from "@/components/providers/TierProvider";
import { SceneRegistrar } from "@/director/wireframe";
import { heroScrollProgress, heroDirectorState } from "@/engine/heroScrollStore";
import { governor } from "@/engine/governor";
import { evalCamera, STRAND_COUNT, WREATH_CY, WREATH_R_IN } from "./flowMath";
import {
  generatePulliLattice,
  generateStrandWaypoints,
  buildResampledStrand,
  buildStaticKolamMeshes,
  buildCompositePath,
  buildPathTextureBundle,
  PulliDotLattice,
} from "./pathBuilder";
import { createPeelConveyorMaterial } from "./peelConveyorShader";
import { TraditionalSideKolams } from "./TraditionalSideKolams";

/**
 * Camera Vertical Truck Glide (§PRD 5.2)
 * Glides downward from y = 0 to y = -1.2 * Hv, with camZ 12 -> 11.2 and pitch -4 deg -> 0 deg.
 */
function HeroTruckCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useSafeFrame((state) => {
    const p = heroDirectorState.scrubActive
      ? heroDirectorState.scrubProgress
      : heroScrollProgress.current;

    const { camY, camZ, pitchDeg } = evalCamera(p);
    state.camera.position.set(0, camY, camZ);
    state.camera.rotation.set(pitchDeg * (Math.PI / 180), 0, 0);
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 12]} fov={35} />;
}

/**
 * Shared Safe Frame Hook enforcing Safeguard 2 (Delta Clamping)
 */
function useSafeFrame(callback: (state: any, safeDelta: number) => void) {
  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    callback(state, safeDelta);
  });
}

/**
 * Quintic C2-continuous smootherstep: 6x^5 - 15x^4 + 10x^3
 */
function smootherstep(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

/**
 * Kolam Shader Material Patched via onBeforeCompile (§MASTER DIRECTIVE)
 * Retains complete Three.js PBR pipeline, HDR bloom emissive response, and fog.
 * Injects:
 * - Travelling light wave pulses along the continuous threads
 * - Draw-on emergence transition factor
 * - Diagnostic Wireframe Companion for Director's Viewport (§6.3)
 */
/**
 * Kolam Gold Shader Material Patched via onBeforeCompile (§PRD 8.2)
 * Retains complete Three.js PBR pipeline, HDR bloom emissive response, and fog.
 * Injects:
 * - Subtle travelling light pulse wave along the continuous woven threads
 */
function createSymmetricKolamMaterial() {
  const customMaterial = new THREE.MeshStandardMaterial({
    color: "#FFB84D",
    metalness: 0.55,
    roughness: 0.22,
    emissive: "#FF9E1B",
    emissiveIntensity: 0.20,
  });
  customMaterial.defines = { USE_UV: "" };

  customMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uScroll = { value: 0 };
    shader.fragmentShader = `
      uniform float uTime;
      uniform float uScroll;
      ${shader.fragmentShader}
    `.replace(
      `#include <emissivemap_fragment>`,
      `#include <emissivemap_fragment>
       // Subtle travelling light pulse along the woven threads
       float pulse = sin(vUv.x * 24.0 - uTime * 2.0);
       float glow = smoothstep(0.65, 1.0, pulse) * 0.35;
       totalEmissiveRadiance += vec3(1.0, 0.72, 0.25) * glow;
      `
    );
    customMaterial.userData.shader = shader;
  };

  // Diagnostic wireframe material variant (§6.3)
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x00ff41,
    wireframe: true,
    toneMapped: false,
  });

  return { material: customMaterial, wireMaterial: wireMat };
}

/**
 * Stationary Grounded Pulli Points (§PRD 5.1 & 5.4)
 * Small warm gold dots of the Pulli grid stay completely stationary in 3D world space.
 * Extended vertically to cover y in [+0.6 Hv, -1.9 Hv] (~+4.54 to -14.38).
 */
function GroundedPulliPoints({ lattice }: { lattice: PulliDotLattice }) {
  const dotsRef = useRef<THREE.InstancedMesh>(null);
  const totalCount = lattice.dotCount * 2;

  const dotGeo = useMemo(() => new THREE.SphereGeometry(0.026, 10, 8), []);
  const dotMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: "#FFF4D0",
      emissive: "#FFC526",
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.6,
    });

    const uniforms = {
      uP: { value: 0 },
      uCenter: { value: new THREE.Vector2(0, WREATH_CY) },
      uTextRadius: { value: 1.15 * WREATH_R_IN },
    };
    mat.userData.uniforms = uniforms;

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uP = uniforms.uP;
      shader.uniforms.uCenter = uniforms.uCenter;
      shader.uniforms.uTextRadius = uniforms.uTextRadius;

      shader.vertexShader = `
        varying vec2 vDotPos;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
         #ifdef USE_INSTANCING
           vDotPos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xy;
         #else
           vDotPos = position.xy;
         #endif
        `
      );

      shader.fragmentShader = `
        uniform float uP;
        uniform vec2 uCenter;
        uniform float uTextRadius;
        varying vec2 vDotPos;
        ${shader.fragmentShader}
      `.replace(
        `#include <emissivemap_fragment>`,
        `#include <emissivemap_fragment>
         // PRD §8.4: Fade dot alpha/emissive inside radius 1.15 * R_in around C once wreath forms
         float dotDist = length(vDotPos - uCenter);
         float kuralFormT = smoothstep(0.42, 0.60, uP);
         float insideVoid = 1.0 - smoothstep(uTextRadius * 0.70, uTextRadius, dotDist);
         float dimFactor = mix(1.0, 0.12, kuralFormT * insideVoid);

         // Soft glow pulse following peel front down the lattice
         float peelFrontY = mix(4.5, -9.08, smoothstep(0.04, 0.60, uP));
         float peelDist = abs(vDotPos.y - peelFrontY);
         float pulse = exp(-peelDist * peelDist / 1.4) * (1.0 - kuralFormT * 0.85);

         diffuseColor.rgb *= dimFactor;
         totalEmissiveRadiance *= dimFactor;
         totalEmissiveRadiance += vec3(1.0, 0.75, 0.3) * pulse * 0.35;
        `
      );
    };

    return mat;
  }, []);

  const dotWireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x00ff41,
        wireframe: true,
        toneMapped: false,
      }),
    []
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!dotsRef.current) return;
    let idx = 0;
    // Left hemisphere pulli dots
    for (let i = 0; i < lattice.dotCount; i++) {
      dummy.position.set(
        lattice.leftDots[i * 3],
        lattice.leftDots[i * 3 + 1],
        lattice.leftDots[i * 3 + 2]
      );
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      dotsRef.current.setMatrixAt(idx++, dummy.matrix);
    }
    // Right hemisphere pulli dots
    for (let i = 0; i < lattice.dotCount; i++) {
      dummy.position.set(
        lattice.rightDots[i * 3],
        lattice.rightDots[i * 3 + 1],
        lattice.rightDots[i * 3 + 2]
      );
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      dotsRef.current.setMatrixAt(idx++, dummy.matrix);
    }
    dotsRef.current.instanceMatrix.needsUpdate = true;
  }, [lattice, dummy]);

  useSafeFrame(() => {
    if (dotsRef.current) {
      dotsRef.current.visible = heroDirectorState.dotsVisible;
    }
    const p = heroDirectorState.scrubActive
      ? heroDirectorState.scrubProgress
      : heroScrollProgress.current;
    if (dotMat.userData.uniforms) {
      dotMat.userData.uniforms.uP.value = p;
    }
  });

  return (
    <instancedMesh
      ref={dotsRef}
      args={[dotGeo, dotMat, totalCount]}
      userData={{ wireMaterial: dotWireMat }}
      position={[0, 0, 0]}
    />
  );
}

/**
 * Peel & Flow Kolam Mesh — GPU Conveyor (§PRD 6, 7 & 8)
 * Renders the 7 authentic dot-woven strands per half with zero-twist camera-aligned frames.
 * Displaces vertices dynamically along composite path Pi_k(s) based on analytic feed s = f_k(p) - a.
 * At p = 0.00, renders the pristine stationary weave.
 * As p advances, lines peel exclusively at the top seam (V-notch) and flow downward into the wreath.
 */
function PeelAndFlowKolamMesh({ isMobile, tier }: { isMobile: boolean; tier: string }) {
  const { lattice, rightGeometry, rightConveyor, leftConveyor } = useMemo(() => {
    const lattice = generatePulliLattice(isMobile);
    const strands = [];
    const compositePaths = [];

    for (let k = 0; k < STRAND_COUNT; k++) {
      const waypoints = generateStrandWaypoints(k, STRAND_COUNT);
      const strand = buildResampledStrand(waypoints, k, 0.02);
      strands.push(strand);
      compositePaths.push(buildCompositePath(strand, k, 0.02));
    }

    const bundle = buildPathTextureBundle(compositePaths, 4096);

    const radialSegs = tier === "A" ? 10 : 8;
    const dsTube = tier === "A" ? 0.045 : 0.07;
    const { rightGeometry } = buildStaticKolamMeshes(
      strands,
      radialSegs,
      dsTube,
      0.024
    );

    const rightConveyor = createPeelConveyorMaterial(bundle, +0.03);
    const leftConveyor = createPeelConveyorMaterial(bundle, -0.03);

    return { lattice, rightGeometry, rightConveyor, leftConveyor };
  }, [isMobile, tier]);

  // Hot loop execution (clamped delta)
  useSafeFrame((state) => {
    const time = state.clock.elapsedTime;
    const speedMult = heroDirectorState.speedMultiplier;
    const p = heroDirectorState.scrubActive
      ? heroDirectorState.scrubProgress
      : heroScrollProgress.current;

    rightConveyor.uniforms.uTime.value = time * speedMult;
    rightConveyor.uniforms.uP.value = p;

    leftConveyor.uniforms.uTime.value = time * speedMult;
    leftConveyor.uniforms.uP.value = p;
  });

  return (
    <>
      {/* Grounded Stationary Pulli Dots Lattice */}
      <GroundedPulliPoints lattice={lattice} />

      {/* Symmetric Dot-Woven Kolam Halves Driven by GPU Conveyor */}
      <group name="PeelAndFlowKolamContainer" position={[0, 0, 0]}>
        <mesh
          name="RightHalf"
          geometry={rightGeometry}
          material={rightConveyor.material}
          userData={{ wireMaterial: rightConveyor.wireMaterial }}
          scale={[1, 1, 1]}
          castShadow
          receiveShadow
        />
        <mesh
          name="LeftHalf"
          geometry={rightGeometry}
          material={leftConveyor.material}
          userData={{ wireMaterial: leftConveyor.wireMaterial }}
          scale={[-1, 1, 1]}
          castShadow
          receiveShadow
        />
      </group>
    </>
  );
}

/**
 * 3D Golden "அ" Emblem Component (§MASTER DIRECTIVE)
 * High-fidelity single-glyph Tamil letter "அ" from Mukta Malar font,
 * suspended stationary at [0, 0, 0] inside the protected central void.
 * - Stays completely stagnant at its coordinates without shrinking or flying away.
 * - Fades out its opacity smoothly between scrollProgress 0.00 -> 0.35.
 */
function GoldenTamilEmblem({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const introStartRef = useRef<number | null>(null);

  const emblemWireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x00ff41,
        wireframe: true,
        toneMapped: false,
      }),
    []
  );

  useSafeFrame((state, safeDelta) => {
    const time = state.clock.elapsedTime;
    if (introStartRef.current === null) {
      introStartRef.current = time;
    }
    const startTime = introStartRef.current ?? time;
    const elapsed = time - startTime;

    if (groupRef.current) {
      // Intro emergence: from z = -8 to z = 0 over 1.8s
      let introZ = 0;
      if (elapsed < 2.4) {
        const introT = THREE.MathUtils.clamp((elapsed - 0.6) / 1.8, 0, 1);
        introZ = THREE.MathUtils.lerp(-8, 0, THREE.MathUtils.smoothstep(introT, 0, 1));
      }

      // World-static with micro-motion (A <= 0.04, tilt <= 3 deg, §PRD 5.1 & 5.3)
      // NO z-recede, NO fade. Leaves the frame purely because the camera descends.
      const floatY = Math.sin(time * 1.05) * 0.03;
      const wobbleY = Math.sin(time * 0.75) * 0.02;
      const tiltX = Math.sin(time * 0.50) * 0.015;

      groupRef.current.position.set(0, floatY, introZ);
      groupRef.current.rotation.set(tiltX, wobbleY, 0);

      if (materialRef.current) {
        materialRef.current.opacity = 1.0;
        materialRef.current.transparent = false;
      }
    }
  });

  const letterSize = isMobile ? 1.4 : 1.85;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Center>
        <Text3D
          font="/fonts/mukta-malar-tamil.json"
          size={letterSize}
          height={0.32}
          curveSegments={64}
          bevelEnabled
          bevelSize={0.018}
          bevelThickness={0.032}
          bevelSegments={16}
          rotation={[0, 0, 0]}
          userData={{ wireMaterial: emblemWireMat }}
          castShadow
          receiveShadow
        >
          அ
          <meshPhysicalMaterial
            ref={materialRef}
            color="#f59e0b"
            emissive="#4a2c0c"
            emissiveIntensity={0.28}
            metalness={0.94}
            roughness={0.16}
            clearcoat={1.0}
            clearcoatRoughness={0.08}
            reflectivity={0.95}
            envMapIntensity={2.0}
          />
        </Text3D>
      </Center>
    </group>
  );
}

/**
 * Dust Motes Atmospheric Layer (§PRD 6.4)
 * Subtle golden dust particles drifting in the ambient void.
 */
function DustMotes({ isMobile, tier }: { isMobile: boolean; tier: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = tier === "A" ? (isMobile ? 60 : 120) : (isMobile ? 30 : 60);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.8 + Math.random() * 3.5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    return pos;
  }, [count]);

  useSafeFrame((_, safeDelta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z += 0.04 * safeDelta;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#FFD074"
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function DigitalKolamHero() {
  const { isLiteMode } = useLiteMode();
  const tier = useTier();
  const isWebglEnabled = !isLiteMode && tier !== "C";

  const isMobile = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => (typeof window !== "undefined" ? window.innerWidth < 768 : false),
    () => false
  );

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isWebglEnabled) return;
    governor.request("home-hero", 2);
    return () => {
      governor.request("home-hero", 0);
    };
  }, [isWebglEnabled]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
      {mounted && isWebglEnabled && (
        <View className="w-full h-full pointer-events-auto" index={2}>
          <SceneRegistrar />
          <color attach="background" args={["#050201"]} />
          <fogExp2 attach="fog" args={["#050201", 0.03]} />
          <HeroTruckCamera />

          {/* Local Lightformer Environment rendered once (frames={1}, zero CDN dependency) */}
          <Environment frames={1} resolution={256} background={false}>
            {/* Upper-left warm softbox */}
            <Lightformer
              form="rect"
              intensity={4.0}
              color="#FFD9A0"
              position={[-6, 6, 4]}
              scale={[10, 10, 1]}
            />
            {/* Right narrow cool strip rim light */}
            <Lightformer
              form="rect"
              intensity={1.5}
              color="#9FD6FF"
              position={[6, 2, 3]}
              scale={[2, 12, 1]}
            />
            {/* Low warm kicker flare */}
            <Lightformer
              form="rect"
              intensity={2.2}
              color="#FFB84D"
              position={[0, -5, 3]}
              scale={[12, 3, 1]}
            />
          </Environment>

          {/* Studio Key & Ambient Lighting */}
          <ambientLight intensity={0.8} color="#2a1a08" />
          <directionalLight position={[5, 8, 5]} intensity={3.0} color="#FFF8E7" castShadow />
          <directionalLight position={[-5, 4, 4]} intensity={1.8} color="#FFE8B5" />
          <pointLight position={[0, 0, 4.0]} intensity={4.5} color="#FFF5DE" distance={16} />
          <pointLight position={[0, -2, 2.0]} intensity={3.0} color="#FFB84D" distance={12} />

          {/* Ambient Floating Dust Motes */}
          <DustMotes isMobile={isMobile} tier={tier} />

          {/* Peel & Flow Kolam Halves (§PRD Home Hero) */}
          <PeelAndFlowKolamMesh isMobile={isMobile} tier={tier} />

          {/* Traditional Royal Purple Stationary Flanking Kolams */}
          <TraditionalSideKolams isMobile={isMobile} tier={tier} />

          {/* Golden "அ" Emblem in Protected Central Void (R >= 2.05) */}
          <GoldenTamilEmblem isMobile={isMobile} />
        </View>
      )}

      {/* Tier C / Lite Mode / reduced-motion SVG Fallback (§PRD 10) */}
      {mounted && !isWebglEnabled && (
        <StaticKolamFallback isMobile={isMobile} />
      )}
    </div>
  );
}

/**
 * Static Kolam Fallback Component (§PRD 10)
 * High-fidelity 2D vector composition rendered when WebGL is unavailable,
 * disabled by Lite Mode, or when the user prefers reduced motion.
 */
function StaticKolamFallback({ isMobile }: { isMobile: boolean }) {
  const dots: { x: number; y: number }[] = [];
  const rings = [180, 225, 270, 315, 360, 405];
  rings.forEach((r, ringIdx) => {
    const count = 16 + ringIdx * 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      dots.push({
        x: Math.round(Math.cos(angle) * r),
        y: Math.round(Math.sin(angle) * r),
      });
    }
  });

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#050201] overflow-hidden select-none pointer-events-none">
      <svg
        viewBox="-480 -480 960 960"
        className="w-full h-full max-w-[900px] max-h-[900px] object-contain opacity-90"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="goldFallbackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="80%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <radialGradient id="voidVignette" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#050201" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#050201" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#050201" stopOpacity="0" />
          </radialGradient>
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Central Void Shadow */}
        <circle cx="0" cy="0" r="170" fill="url(#voidVignette)" />

        {/* Pulli Dots Lattice */}
        <g fill="#FFB84D" opacity="0.45">
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r="2.5" />
          ))}
        </g>

        {/* Sikku Concentric Braided Loops */}
        <g fill="none" stroke="#F1E9D2" strokeWidth="2.8" opacity="0.82" strokeLinecap="round">
          {/* Inner Laurel Loop */}
          <path d="M 0,-185 C 100,-185 185,-100 185,0 C 185,100 100,185 0,185 C -100,185 -185,100 -185,0 C -185,-100 -100,-185 0,-185 Z" />

          {/* Undulating Sikku Braids */}
          <path d="M 0,-240 C 70,-260 140,-210 200,-160 C 260,-110 280,-40 270,30 C 260,100 200,160 140,210 C 80,260 0,270 0,270 C 0,270 -80,260 -140,210 C -200,160 -260,100 -270,30 C -280,-40 -260,-110 -200,-160 C -140,-210 -70,-260 0,-240 Z" />
          <path d="M 0,-310 C 100,-330 200,-270 280,-200 C 350,-130 370,-30 350,60 C 330,150 250,230 170,290 C 90,340 0,350 0,350 C 0,350 -90,340 -170,290 C -250,230 -330,150 -350,60 C -370,-30 -350,-130 -280,-200 C -200,-270 -100,-330 0,-310 Z" />
          <path d="M 0,-380 C 120,-410 250,-330 350,-240 C 430,-150 450,-30 420,80 C 390,190 290,290 190,360 C 90,420 0,430 0,430 C 0,430 -90,420 -190,360 C -290,290 -390,190 -420,80 C -450,-30 -430,-150 -350,-240 C -250,-330 -120,-410 0,-380 Z" />
        </g>
      </svg>
    </div>
  );
}
export default DigitalKolamHero;
