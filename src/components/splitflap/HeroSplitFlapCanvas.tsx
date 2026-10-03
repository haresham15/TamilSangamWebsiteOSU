"use client";

import React, { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitFlapBoard, SplitFlapBoardHandle } from "./SplitFlapBoard";
import { useFaqStore } from "@/store/faqStore";
import { Terminal } from "lucide-react";
import { Environment, BakeShadows } from "@react-three/drei";
import { createBespokeEnvironmentTexture } from "@/components/shared/createCustomEnvironment";
import { useLiteMode } from "@/context/LiteModeContext";
import { SplitFlapLiteHero } from "./SplitFlapLiteHero";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Deterministic pseudo-random number generator to ensure render purity and stability
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const dustMotesVertexShader = `
uniform float uTime;
attribute float aSpeed;
attribute float aSeed;
varying float vAlpha;

void main() {
  vec3 pos = position;
  // GPU-driven upward drift with periodic modulo wrap
  float yOffset = mod(pos.y + uTime * aSpeed * 1.5 + 4.0, 10.0) - 4.0;
  pos.y = yOffset;
  pos.x += sin(uTime * 0.8 + aSeed) * 0.15;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = (45.0 / -mvPosition.z);
  vAlpha = smoothstep(-4.0, -2.0, pos.y) * smoothstep(6.0, 4.0, pos.y) * 0.35;
}
`;

const dustMotesFragmentShader = `
varying float vAlpha;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;
  float strength = pow(1.0 - (dist * 2.0), 1.5);
  gl_FragColor = vec4(vec3(1.0, 0.88, 0.7), strength * vAlpha);
}
`;

// ---------------------------------------------------------------------------
// 1. DUST MOTES (GPU Vertex Shader with 0 CPU array mutations per frame)
// ---------------------------------------------------------------------------
function DustMotes({ count = 100 }: { count?: number }) {
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (pseudoRandom(i * 4 + 1) - 0.5) * 22;
      pos[i * 3 + 1] = (pseudoRandom(i * 4 + 2) - 0.5) * 10;
      pos[i * 3 + 2] = (pseudoRandom(i * 4 + 3) - 0.5) * 14 + 4;
      speeds[i] = 0.05 + pseudoRandom(i * 4 + 4) * 0.12;
      seeds[i] = pseudoRandom(i * 4 + 5) * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: dustMotesVertexShader,
      fragmentShader: dustMotesFragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    if (pointsRef.current) {
      (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

// ---------------------------------------------------------------------------
// 2. OVERHEAD TUNGSTEN HANGING LAMPS (§6)
// ---------------------------------------------------------------------------
interface OverheadLampProps {
  position: [number, number, number];
  camStateRef: React.RefObject<{ lampEmissive: number }>;
}

function OverheadLamp({ position, camStateRef }: OverheadLampProps) {
  const bulbRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    if (bulbRef.current) {
      // Confine bloom to bulb mesh layer (§6)
      bulbRef.current.layers.enable(1);
    }
  }, []);

  useFrame(() => {
    const camState = camStateRef.current;
    if (!camState) return;
    if (bulbRef.current && bulbRef.current.material) {
      (bulbRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        camState.lampEmissive * 3.6;
    }
    if (lightRef.current) {
      lightRef.current.intensity = camState.lampEmissive * 2.8;
    }
  });

  return (
    <group position={position}>
      {/* Hanging Cable */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 3.6, 8]} />
        <meshBasicMaterial color="#1a1410" />
      </mesh>

      {/* Industrial Lamp Shade */}
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.65, 0.35, 16, 1, true]} />
        <meshStandardMaterial
          color="#1e1814"
          roughness={0.8}
          metalness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Warm Tungsten Bulb */}
      <mesh ref={bulbRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial
          color="#FFF0D4"
          emissive="#FF9E40"
          emissiveIntensity={0}
          roughness={0.2}
        />
      </mesh>

      {/* Warm Downward Spotlight */}
      <pointLight
        ref={lightRef}
        position={[0, -0.2, 0]}
        color="#FFB870"
        intensity={0}
        distance={14}
        decay={2}
      />
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. STATION PLATFORM BACKDROP GEOMETRY (§6: Soft unlit edges, no hard bloom)
// ---------------------------------------------------------------------------
function StationPlatformBackdrop() {
  return (
    <group position={[0, 0, 0]}>
      {/* Platform Floor Slab */}
      <mesh position={[0, -4.2, 0]} receiveShadow>
        <boxGeometry args={[34, 0.5, 24]} />
        <meshStandardMaterial color="#0e0b09" roughness={0.9} metalness={0.2} />
      </mesh>

      {/* Station Platform Edge Yellow Warning Line */}
      <mesh position={[0, -3.94, 6]}>
        <boxGeometry args={[34, 0.02, 0.25]} />
        <meshBasicMaterial color="#d97706" toneMapped={false} />
      </mesh>

      {/* 4 Heavy Steel Structural Columns */}
      {[-12, -4, 4, 12].map((x, i) => (
        <mesh key={i} position={[x, 1, -2]}>
          <cylinderGeometry args={[0.22, 0.26, 10, 16]} />
          <meshBasicMaterial color="#070504" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. CAMERA CHOREOGRAPHY & FOG SYNCHRONIZER (§1 Table)
// ---------------------------------------------------------------------------
interface CameraChoreographyProps {
  camStateRef: React.RefObject<{
    x: number;
    y: number;
    z: number;
    fov: number;
    fog: number;
    lampEmissive: number;
  }>;
}

function CameraChoreography({ camStateRef }: CameraChoreographyProps) {
  const fpsRef = useRef({ frames: 0, lastTime: 0 });

  useFrame((state) => {
    const camState = camStateRef.current;
    if (!camState) return;
    const camera = state.camera;
    const scene = state.scene;

    // 1. Camera kinematics & target tracking
    camera.position.set(camState.x, camState.y, camState.z);
    camera.lookAt(0, 0.4, 0);

    if ("fov" in camera) {
      (camera as THREE.PerspectiveCamera).fov = camState.fov;
      camera.updateProjectionMatrix();
    }

    // 2. Fog density synchronization
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = camState.fog;
    }

    if (typeof window !== "undefined") {
      (window as Window & { __THREE_DEBUG__?: unknown }).__THREE_DEBUG__ = { camera, scene, camState };
    }

    // 3. FPS tracking for ?debug=1 HUD
    fpsRef.current.frames++;
    const now = performance.now();
    if (fpsRef.current.lastTime === 0) {
      fpsRef.current.lastTime = now;
    } else if (now - fpsRef.current.lastTime >= 1000) {
      const currentFps = Math.round(
        (fpsRef.current.frames * 1000) / (now - fpsRef.current.lastTime)
      );
      useFaqStore.getState().setFps(currentFps);
      fpsRef.current.frames = 0;
      fpsRef.current.lastTime = now;
    }
  });

  return null;
}

// ---------------------------------------------------------------------------
// 5. MAIN HERO SPLIT-FLAP CANVAS WRAPPER (130vh Pinned Section)
// ---------------------------------------------------------------------------
interface HeroSplitFlapCanvasProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export function HeroSplitFlapCanvas({
  onSearchChange,
}: HeroSplitFlapCanvasProps) {
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const boardHandleRef = useRef<SplitFlapBoardHandle | null>(null);
  const hasTriggeredBootRef = useRef(false);

  const { isLiteMode } = useLiteMode();
  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });
  const [debugActive] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("debug") === "1";
    }
    return false;
  });

  // Bespoke scene-matched environment reflections (§1.1b PRD Mandate)
  const bespokeEnv = useMemo(() => createBespokeEnvironmentTexture("transit-solari"), []);
  useEffect(() => {
    return () => {
      bespokeEnv?.dispose();
    };
  }, [bespokeEnv]);

  // Read active Zustand properties for HUD and accessible shadow DOM
  const scrollProgress = useFaqStore((s) => s.scrollProgress);
  const bootState = useFaqStore((s) => s.bootState);
  const idleCountdown = useFaqStore((s) => s.idleCountdown);
  const activeTeaser = useFaqStore((s) => s.activeTeaser);
  const activeQuestion = useFaqStore((s) => s.activeQuestion);
  const fps = useFaqStore((s) => s.fps);

  // Synchronized camera & scene values (§1 Table: starts in crisp focus, recedes on scroll)
  const camStateRef = useRef({
    x: 0,
    y: 1.6,
    z: 5.8,
    fov: 42,
    fog: 0.026,
    lampEmissive: 1.0,
  });

  // Sync debugMode and listen to prefers-reduced-motion changes
  useEffect(() => {
    if (debugActive) {
      useFaqStore.getState().setDebugMode(true);
    }
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [debugActive]);

  // Live Railway Clock in header & on the physical 3D board
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " EST";

      if (boardHandleRef.current) {
        boardHandleRef.current.updateLiveClock(formattedTime);
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // IntersectionObserver to set frameloop="demand" when hero leaves viewport (§8)
  useEffect(() => {
    if (!pinWrapperRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(pinWrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // §1: GSAP ScrollTrigger 130vh Pinned Timeline
  useEffect(() => {
    if (reducedMotion || !pinWrapperRef.current || !stickyContainerRef.current) {
      if (reducedMotion) {
        camStateRef.current = {
          x: 0,
          y: 1.6,
          z: 5.4,
          fov: 42,
          fog: 0.028,
          lampEmissive: 1.0,
        };
        useFaqStore.getState().setBootState("settled");
      }
      return;
    }

    const ctx = gsap.context(() => {
      const target = camStateRef.current;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinWrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: stickyContainerRef.current,
          pinSpacing: false,
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            useFaqStore.getState().setScrollProgress(p);

            // §1 & §3: Trigger boot wave between p = 0.35 and 0.65
            if (p >= 0.35 && !hasTriggeredBootRef.current) {
              if (boardHandleRef.current) {
                hasTriggeredBootRef.current = true;
                boardHandleRef.current.triggerBootSequence();
              }
            }
          },
        },
      });

      // Phase 3a: 0.00 -> 0.15: Idle hold — full clear board face (0, 1.6, 5.8), fov 42, warm lamps active
      tl.to(
        target,
        {
          x: 0,
          y: 1.6,
          z: 5.8,
          fov: 42,
          fog: 0.026,
          lampEmissive: 1.0,
          duration: 0.15,
          ease: "none",
        },
        0
      );

      // Phase 3b: 0.15 -> 0.70: Cinematic recede / scale-down — camera pulls back (0, 2.8, 9.8), fov 36, fog 0.028
      tl.to(
        target,
        {
          x: 0,
          y: 2.8,
          z: 9.8,
          fov: 36,
          fog: 0.028,
          lampEmissive: 1.0,
          duration: 0.55,
          ease: "power1.inOut",
        },
        0.15
      );

      // Phase 3c: 0.70 -> 1.00: Settle into wide station perspective as scroll approaches content bridge (0, 3.2, 11.2)
      tl.to(
        target,
        {
          x: 0,
          y: 3.2,
          z: 11.2,
          fov: 34,
          fog: 0.030,
          lampEmissive: 1.0,
          duration: 0.30,
          ease: "none",
        },
        0.70
      );

      ScrollTrigger.refresh();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    });

    return () => {
      ctx.revert();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    };
  }, [reducedMotion]);

  // Early return for Tier C / Lite Mode (§9)
  if (isLiteMode) {
    return (
      <div id="alaipayuthey-splitflap-hero" className="w-full">
        <SplitFlapLiteHero onSearchFocus={() => onSearchChange?.("")} />
      </div>
    );
  }

  return (
    <div
      ref={pinWrapperRef}
      className={`relative w-full ${reducedMotion ? "h-[85dvh]" : "h-[200vh]" // 100dvh sticky viewport + 100vh pinned scroll length
        }`}
    >
      <div
        ref={stickyContainerRef}
        className="sticky top-0 z-10 w-full h-[100dvh] overflow-hidden bg-[#070504] flex flex-col justify-between"
      >
        {/* ========================================================================= */}
        {/* R3F 3D VIEWPORT WITH PHYSICAL CAMERA & ATMOSPHERE (Clean Cinematic Scene) */}
        {/* ========================================================================= */}
        <div
          className="relative flex-1 w-full h-full"
          aria-hidden="true"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
          }}
        >
          <Canvas
            dpr={[1, Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1)]}
            camera={{ position: [0, 1.6, 5.8], fov: 42 }}
            frameloop={inView ? "always" : "demand"}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15,
            }}
            shadows={{ type: THREE.PCFShadowMap }}
          >
            <BakeShadows />
            {/* FogExp2 configured per §1 Table (density 0.024 -> 0.028) */}
            <fogExp2 attach="fog" args={["#0c0907", 0.026]} />

            {/* Bespoke Scene-Matched Transit Solari Environment Map */}
            {bespokeEnv && <Environment map={bespokeEnv} background={false} />}

            {/* INTENTIONAL: This page's lighting is fixed, NOT driven by the global
                tinai/time-of-day system. The platform atmosphere is a signature hero.
                Do not "fix" it to match the global system. — PRD §3.1 */}
            <ambientLight intensity={1.2} color="#3d2c1e" />
            <directionalLight
              position={[0, 6, 8]}
              intensity={4.5}
              color="#FFF4DE"
              castShadow={fps >= 30 || fps === 0}
              shadow-mapSize-width={512}
              shadow-mapSize-height={512}
            />
            <pointLight position={[-8, 2, 4]} intensity={2.2} color="#FFAA44" distance={16} decay={2} />
            <pointLight position={[8, 2, 4]} intensity={2.2} color="#FFAA44" distance={16} decay={2} />

            {/* Camera kinematics controller */}
            <CameraChoreography camStateRef={camStateRef} />

            {/* Overhead Tungsten Lamps (§6) */}
            {[-9, -3, 3, 9].map((x, i) => (
              <OverheadLamp
                key={i}
                position={[x, 3.8, 2.0]}
                camStateRef={camStateRef}
              />
            ))}

            {/* Atmospheric Dust Motes (§6) */}
            <DustMotes count={100} />

            {/* Platform Floor & Columns (§6) */}
            <StationPlatformBackdrop />

            {/* 500 Physical Split-Flap Character Matrix */}
            <Suspense fallback={null}>
              <SplitFlapBoard
                onHandleReady={(handle) => {
                  boardHandleRef.current = handle;
                  if (!hasTriggeredBootRef.current) {
                    hasTriggeredBootRef.current = true;
                    if (reducedMotion) {
                      handle.setSettledImmediately();
                    } else {
                      setTimeout(() => {
                        handle.triggerBootSequence();
                      }, 350);
                    }
                  }
                }}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          </Canvas>

          {/* Bottom overlay gradient blending agent */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070504] via-[#070504]/80 to-transparent z-10" />
        </div>

        {/* ========================================================================= */}
        {/* 3. ?debug=1 ENGINEERING HUD (§8 Verification)                             */}
        {/* ========================================================================= */}
        {debugActive && (
          <div className="absolute top-24 left-6 z-30 p-3 rounded-none bg-[#0e0a07]/90 border border-[#f59e0b]/40 backdrop-blur-md font-mono text-[11px] text-[#fef3c7] shadow-[4px_4px_0px_#261d15] flex flex-col gap-1.5 pointer-events-none">
            <div className="flex items-center gap-2 pb-1 border-b border-[#3b2b1d] text-[#f59e0b] font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>SPLIT-FLAP KINEMATIC ENGINE HUD</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a89985]">Scroll Progress (p):</span>
              <span className="font-bold text-[#38bdf8]">{scrollProgress.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a89985]">Boot State:</span>
              <span
                className={`font-bold uppercase ${bootState === "settled"
                    ? "text-emerald-400"
                    : bootState === "playing"
                      ? "text-amber-400"
                      : "text-zinc-400"
                  }`}
              >
                {bootState}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a89985]">Idle Timer Countdown:</span>
              <span className="font-bold text-amber-300">{idleCountdown}s</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a89985]">Render FPS:</span>
              <span className="font-bold text-emerald-400">{fps}</span>
            </div>
            <div className="pt-1 border-t border-[#3b2b1d] text-[10px] text-[#8c7866] truncate max-w-xs">
              Teaser: {activeTeaser || "NONE"}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. ACCESSIBILITY (A11y) & KEYBOARD SCREEN READER DOM SHADOW (§7)          */}
        {/* ========================================================================= */}
        <div className="sr-only" aria-live="polite">
          <h2>Alaipayuthey Mechanical Split-Flap Railway Departure Board</h2>
          <dl>
            <dt>Current Active Topic / Question:</dt>
            <dd>{activeQuestion}</dd>
            <dt>Board Dispatch Teaser:</dt>
            <dd>{activeTeaser}</dd>
            <dt>Engine Status:</dt>
            <dd>{bootState === "settled" ? "Live departure board settled" : "Powering on"}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default HeroSplitFlapCanvas;
