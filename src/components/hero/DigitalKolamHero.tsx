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
import { buildSymmetricKolamHalves } from "./kolamGeometry";

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
function createSymmetricKolamMaterial() {
  const uniforms = {
    uTime: { value: 0 },
    uDraw: { value: 0 },
  };

  const mat = new THREE.MeshStandardMaterial({
    color: "#F6EED8",
    emissive: new THREE.Color("#FFD270"),
    emissiveIntensity: 0.50,
    roughness: 0.30,
    metalness: 0.18,
    fog: true,
  });

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = `
      uniform float uDraw;
      attribute float aArc;
      varying float vArc;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>
      vArc = aArc;
      float drawFactor = uDraw >= 1.0 ? 1.0 : smoothstep(aArc, aArc + 0.08, uDraw);
      transformed = position * drawFactor;
      `
    );

    shader.fragmentShader = `
      uniform float uTime;
      varying float vArc;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      `
      #include <emissivemap_fragment>
      // Slow travelling light pulses along the continuous threads
      float wave = sin(vArc * 6.283185 * 3.5 - uTime * 1.1) * 0.5 + 0.5;
      float crest = smoothstep(0.90, 1.0, wave);
      vec3 crestColor = vec3(1.0, 0.74, 0.32); // Temple amber gold
      totalEmissiveRadiance *= (1.0 + 1.25 * crest);
      totalEmissiveRadiance = mix(totalEmissiveRadiance, crestColor * 2.2, crest * 0.65);
      `
    );
  };

  // Diagnostic wireframe material variant (§6.3)
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x00ff41,
    wireframe: true,
    toneMapped: false,
  });

  wireMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `
      uniform float uDraw;
      attribute float aArc;
      varying float vArc;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>
      vArc = aArc;
      float drawFactor = uDraw >= 1.0 ? 1.0 : smoothstep(aArc, aArc + 0.08, uDraw);
      transformed = position * drawFactor;
      `
    );
  };

  return { material: mat, wireMaterial: wireMat, uniforms };
}

/**
 * Top-Severed Peeling Wreath Component (§MASTER DIRECTIVE)
 * Two symmetrical halves (Left and Right) that mate flush at scrollProgress = 0 with zero seam.
 * Rigged with double hinges at the bottom-center base [0, -5, 0] with mesh offset [0, 5, 0].
 * As scroll advances:
 * 1. Immediately disconnects exclusively at the top seam.
 * 2. Left hinge rotates z to -Math.PI * 0.55; Right hinge rotates z to +Math.PI * 0.55.
 * 3. Meshes bend downward (position.y -= scrollProgress * 3) and curve outward to form the Wreath cradle.
 * 4. Master Kolam group translates upward on Y from 0 to 9.2 (cinematic downward camera pan illusion).
 */
function TopSeveredKolamHeroMesh({ isMobile, tier }: { isMobile: boolean; tier: string }) {
  const masterKolamGroupRef = useRef<THREE.Group>(null);
  const leftHingeRef = useRef<THREE.Group>(null);
  const rightHingeRef = useRef<THREE.Group>(null);
  const leftMeshOffsetRef = useRef<THREE.Group>(null);
  const rightMeshOffsetRef = useRef<THREE.Group>(null);

  const leftDotsRef = useRef<THREE.InstancedMesh>(null);
  const rightDotsRef = useRef<THREE.InstancedMesh>(null);

  const introStartTimeRef = useRef<number | null>(null);

  const radialSegments = tier === "A" ? 10 : 8;
  const data = useMemo(
    () => buildSymmetricKolamHalves(isMobile, radialSegments),
    [isMobile, radialSegments]
  );

  const { material, wireMaterial, uniforms } = useMemo(
    () => createSymmetricKolamMaterial(),
    []
  );

  // Instanced sphere dot materials
  const dotGeo = useMemo(() => new THREE.SphereGeometry(0.026, 10, 8), []);
  const dotMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FFF4D0",
        emissive: "#FFC526",
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.6,
      }),
    []
  );

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

  // Initialize initial dot matrices
  useEffect(() => {
    if (leftDotsRef.current && rightDotsRef.current) {
      // Left dots
      for (let i = 0; i < data.leftDotCount; i++) {
        const x = data.leftPulliPositions[i * 3];
        const y = data.leftPulliPositions[i * 3 + 1];
        const z = data.leftPulliPositions[i * 3 + 2];
        dummy.position.set(x, y, z);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        leftDotsRef.current.setMatrixAt(i, dummy.matrix);
      }
      leftDotsRef.current.instanceMatrix.needsUpdate = true;

      // Right dots
      for (let i = 0; i < data.rightDotCount; i++) {
        const x = data.rightPulliPositions[i * 3];
        const y = data.rightPulliPositions[i * 3 + 1];
        const z = data.rightPulliPositions[i * 3 + 2];
        dummy.position.set(x, y, z);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        rightDotsRef.current.setMatrixAt(i, dummy.matrix);
      }
      rightDotsRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [data, dummy]);

  // Hot loop execution (Safe Delta clamped)
  useSafeFrame((state, safeDelta) => {
    const time = state.clock.elapsedTime;
    if (introStartTimeRef.current === null) {
      introStartTimeRef.current = time;
    }
    const startTime = introStartTimeRef.current ?? time;
    const elapsedSinceIntro = time - startTime;

    // 1. Draw-on intro factor (0 -> 1 over 2.4s)
    const targetDraw = Math.min(1.05, elapsedSinceIntro / 2.4);
    uniforms.uDraw.value = THREE.MathUtils.lerp(uniforms.uDraw.value, targetDraw, 0.15);

    // 2. Pulse waves with Director speed multiplier
    const speedMult = heroDirectorState.speedMultiplier;
    uniforms.uTime.value = time * speedMult;

    // 3. Scroll progress (Director override if active, else live page scroll)
    const p = heroDirectorState.scrubActive
      ? heroDirectorState.scrubProgress
      : heroScrollProgress.current;

    // Act II progression: 0.00 -> 0.50 drives complete unravelling and wreath cradle
    const q = THREE.MathUtils.clamp(p / 0.50, 0, 1);
    const s = smootherstep(q);

    // =========================================================================
    // PHASE 2, ITEM 1: UNLINKING THE TOP SEAM (DOUBLE-HINGE TRANSFORMATIONS)
    // =========================================================================
    // Left Hinge (pivots outward to left)
    // Left Hinge (pivots outward to left)
    if (leftHingeRef.current) {
      // Outward base movement as top unlinks
      leftHingeRef.current.position.x = -1.4 * s;
      leftHingeRef.current.position.y = -5.0 + 0.35 * s;

      // Rotation: Z rolls from 0 to +Math.PI * 0.55 (peeling the left tip outward and downward)
      leftHingeRef.current.rotation.z = Math.PI * 0.55 * s;
      // 3D tactile depth roll: tips curl slightly toward camera and flare outward
      leftHingeRef.current.rotation.y = -0.28 * Math.sin(Math.PI * s);
      leftHingeRef.current.rotation.x = -0.16 * s;
    }

    // Right Hinge (pivots outward to right)
    if (rightHingeRef.current) {
      // Outward base movement as top unlinks
      rightHingeRef.current.position.x = 1.4 * s;
      rightHingeRef.current.position.y = -5.0 + 0.35 * s;

      // Rotation: Z rolls from 0 to -Math.PI * 0.55 (peeling the right tip outward and downward)
      rightHingeRef.current.rotation.z = -Math.PI * 0.55 * s;
      // 3D tactile depth roll
      rightHingeRef.current.rotation.y = 0.28 * Math.sin(Math.PI * s);
      rightHingeRef.current.rotation.x = -0.16 * s;
    }

    // =========================================================================
    // PHASE 2, ITEM 2: THE BEND (SIMULATED SPLINE UNROLL & MESH OFFSET)
    // =========================================================================
    // Translate meshes downward relative to hinges (position.y -= scrollProgress * 3)
    const meshOffsetY = 5.0 - q * 3.0; // Dropping top corners down into the wreath cradle
    const stretchX = 1.0 + 0.32 * Math.sin(Math.PI * s) + 0.12 * s;
    const scaleZ = 1.0 + 0.35 * s;
    const scaleY = 1.0 - 0.08 * s;

    if (leftMeshOffsetRef.current) {
      leftMeshOffsetRef.current.position.y = meshOffsetY;
      leftMeshOffsetRef.current.scale.set(stretchX, scaleY, scaleZ);
    }

    if (rightMeshOffsetRef.current) {
      rightMeshOffsetRef.current.position.y = meshOffsetY;
      rightMeshOffsetRef.current.scale.set(stretchX, scaleY, scaleZ);
    }

    // =========================================================================
    // PHASE 2, ITEM 3: CAMERA PAN (PARENT WEBGL SCENE TRANSLATION)
    // =========================================================================
    // Master Kolam group translates on Y: 0 -> 3.2, aligning the unrolled wreath
    // at the bottom edge of the screen (Y ≈ -3.3 to -1.8) cradling Thirukkural 81
    if (masterKolamGroupRef.current) {
      masterKolamGroupRef.current.position.y = THREE.MathUtils.lerp(0, 3.2, s);

      // Subtle breathing rotation during Act I idle (when closed at p = 0)
      if (p < 0.02) {
        masterKolamGroupRef.current.rotation.z = Math.sin(time * 0.35) * 0.015;
      } else {
        masterKolamGroupRef.current.rotation.z = 0;
      }
    }

    // Dots visibility & draw scaling
    const drawFactor = uniforms.uDraw.value;
    const dotScale = Math.max(0.001, (1.0 - 0.25 * s) * drawFactor);

    if (leftDotsRef.current) {
      leftDotsRef.current.visible = heroDirectorState.dotsVisible;
    }
    if (rightDotsRef.current) {
      rightDotsRef.current.visible = heroDirectorState.dotsVisible;
    }
  });

  return (
    <group ref={masterKolamGroupRef} name="MasterKolamContainer" position={[0, 0, 0]}>
      {/* =======================================================================
          LEFT HALF HINGE: Pivot at bottom-center base [0, -5, 0]
          ======================================================================= */}
      <group ref={leftHingeRef} name="LeftHinge" position={[0, -5, 0]}>
        <group ref={leftMeshOffsetRef} name="LeftMeshOffset" position={[0, 5, 0]}>
          {/* Left Kolam Tube Mesh */}
          <mesh
            geometry={data.leftGeometry}
            material={material}
            userData={{ wireMaterial }}
            castShadow
            receiveShadow
          />
          {/* Left Pulli Dots */}
          <instancedMesh
            ref={leftDotsRef}
            args={[dotGeo, dotMat, data.leftDotCount]}
            userData={{ wireMaterial: dotWireMat }}
          />
        </group>
      </group>

      {/* =======================================================================
          RIGHT HALF HINGE: Pivot at bottom-center base [0, -5, 0]
          ======================================================================= */}
      <group ref={rightHingeRef} name="RightHinge" position={[0, -5, 0]}>
        <group ref={rightMeshOffsetRef} name="RightMeshOffset" position={[0, 5, 0]}>
          {/* Right Kolam Tube Mesh */}
          <mesh
            geometry={data.rightGeometry}
            material={material}
            userData={{ wireMaterial }}
            castShadow
            receiveShadow
          />
          {/* Right Pulli Dots */}
          <instancedMesh
            ref={rightDotsRef}
            args={[dotGeo, dotMat, data.rightDotCount]}
            userData={{ wireMaterial: dotWireMat }}
          />
        </group>
      </group>
    </group>
  );
}

/**
 * 3D Golden "அ" Emblem Component (§MASTER DIRECTIVE)
 * High-fidelity single-glyph Tamil letter "அ" from Mukta Malar font,
 * suspended at [0, 0, 0] inside the protected central void (R >= 2.05).
 * At scrollProgress 0.0 -> 0.38: translates z from 0 -> -30 and dissolves opacity to 0.
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

    const p = heroDirectorState.scrubActive
      ? heroDirectorState.scrubProgress
      : heroScrollProgress.current;

    // Kinematics: Exits cleanly over scrollProgress 0.0 -> 0.38
    const tExit = THREE.MathUtils.clamp(p / 0.38, 0, 1);
    const sExit = THREE.MathUtils.smoothstep(tExit, 0, 1);

    if (groupRef.current) {
      // Intro emergence: from z = -8 to z = 0 over 1.8s
      let introZ = 0;
      if (elapsed < 2.4) {
        const introT = THREE.MathUtils.clamp((elapsed - 0.6) / 1.8, 0, 1);
        introZ = THREE.MathUtils.lerp(-8, 0, THREE.MathUtils.smoothstep(introT, 0, 1));
      }

      // Idle float (damped as emblem exits)
      const floatFactor = 1.0 - sExit;
      const floatY = Math.sin(time * 1.05) * 0.08 * floatFactor;
      const wobbleY = Math.sin(time * 0.75) * 0.07 * floatFactor; // ±4 deg wobble
      const tiltX = Math.sin(time * 0.50) * 0.03 * floatFactor;

      // Scroll recession: deep into fog to z = -30 (§MASTER DIRECTIVE)
      const scrollZ = THREE.MathUtils.lerp(0, -30, sExit * sExit);

      groupRef.current.position.set(0, floatY, introZ + scrollZ);
      groupRef.current.rotation.set(tiltX, wobbleY, 0);

      // Material dissolve to 0 opacity
      if (materialRef.current) {
        materialRef.current.opacity = 1.0 - sExit;
        materialRef.current.transparent = true;
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
          <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={35} />

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

          {/* Top-Severed Peeling Wreath Kolam Halves (§MASTER DIRECTIVE) */}
          <TopSeveredKolamHeroMesh isMobile={isMobile} tier={tier} />

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
