"use client";
/* eslint-disable react-compiler/react-compiler */

import React, { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitFlapBoard, SplitFlapBoardHandle } from "./SplitFlapBoard";
import { useFaqStore } from "@/store/faqStore";
import { Clock, Train, Terminal, Search } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Deterministic pseudo-random number generator to ensure render purity and stability
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// ---------------------------------------------------------------------------
// 1. DUST MOTES (§6: 100 additive points drifting upward)
// ---------------------------------------------------------------------------
function DustMotes({ count = 100 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, initialSpeeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (pseudoRandom(i * 4 + 1) - 0.5) * 22;
      pos[i * 3 + 1] = (pseudoRandom(i * 4 + 2) - 0.5) * 10;
      pos[i * 3 + 2] = (pseudoRandom(i * 4 + 3) - 0.5) * 14 + 4;
      speeds[i] = 0.05 + pseudoRandom(i * 4 + 4) * 0.12;
    }
    return [pos, speeds];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += initialSpeeds[i] * delta * 1.5;
      // Wrap when floating past top of platform
      if (array[i * 3 + 1] > 6.0) {
        array[i * 3 + 1] = -4.0;
        array[i * 3] = (pseudoRandom(i * 17 + 13) - 0.5) * 22;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#FFE0B2"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
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
  searchQuery = "",
}: HeroSplitFlapCanvasProps) {
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const boardHandleRef = useRef<SplitFlapBoardHandle | null>(null);
  const hasTriggeredBootRef = useRef(false);

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
  const [timeStr, setTimeStr] = useState<string>("18:45:00 EST");

  // Read active Zustand properties for HUD and accessible shadow DOM
  const scrollProgress = useFaqStore((s) => s.scrollProgress);
  const bootState = useFaqStore((s) => s.bootState);
  const idleCountdown = useFaqStore((s) => s.idleCountdown);
  const activeTeaser = useFaqStore((s) => s.activeTeaser);
  const activeQuestion = useFaqStore((s) => s.activeQuestion);
  const fps = useFaqStore((s) => s.fps);

  // Synchronized camera & scene values (§1 Table)
  const camStateRef = useRef({
    x: 0,
    y: 2.4,
    z: 13,
    fov: 40,
    fog: 0.024,
    lampEmissive: 0.0,
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

  // Live Railway Clock in header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " EST"
      );
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
          scrub: 0.5,
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

      // p: 0.00 -> 0.20: Overhead lamps flicker on (emissive 0->1), camera (0, 2.4, 13) -> (0, 2.0, 10)
      tl.to(
        target,
        {
          x: 0,
          y: 2.0,
          z: 10,
          fov: 39,
          fog: 0.026,
          lampEmissive: 1.0,
          duration: 0.2,
          ease: "none",
        },
        0
      );

      // p: 0.20 -> 0.35: Camera approaches platform (0, 1.8, 8), fov 40, fog 0.027
      tl.to(
        target,
        {
          x: 0,
          y: 1.8,
          z: 8,
          fov: 40,
          fog: 0.027,
          duration: 0.15,
          ease: "none",
        },
        0.2
      );

      // p: 0.35 -> 0.65: Boot wave completes — camera (0, 1.7, 6.5), fov 41, fog 0.028
      tl.to(
        target,
        {
          x: 0,
          y: 1.7,
          z: 6.5,
          fov: 41,
          fog: 0.028,
          duration: 0.3,
          ease: "none",
        },
        0.35
      );

      // p: 0.65 -> 0.85: Camera holds; sharp focus on board face (0, 1.6, 5.6), fov 42
      tl.to(
        target,
        {
          x: 0,
          y: 1.6,
          z: 5.6,
          fov: 42,
          fog: 0.028,
          duration: 0.2,
          ease: "none",
        },
        0.65
      );

      // p: 0.85 -> 1.00: Pin releases to (0, 1.6, 5.4) -> idle "live" mode begins
      tl.to(
        target,
        {
          x: 0,
          y: 1.6,
          z: 5.4,
          fov: 42,
          fog: 0.028,
          duration: 0.15,
          ease: "none",
        },
        0.85
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

  return (
    <div
      ref={pinWrapperRef}
      className={`relative w-full ${
        reducedMotion ? "h-[85dvh]" : "h-[230vh]" // 100dvh sticky viewport + 130vh pinned scroll length
      }`}
    >
      <div
        ref={stickyContainerRef}
        className="sticky top-0 z-10 w-full h-[100dvh] overflow-hidden bg-[#070504] border-b border-[#261d15] shadow-2xl flex flex-col justify-between"
      >
        {/* ========================================================================= */}
        {/* 1. TOP RAILWAY STATION HUD (Alaipayuthey Vintage Station Atmosphere)      */}
        {/* ========================================================================= */}
        <div className="relative z-20 w-full pt-16 sm:pt-20 px-4 sm:px-8 pb-3 bg-gradient-to-b from-[#0a0705] via-[#0d0a08]/95 to-[#0d0a08]/80 backdrop-blur-md border-b border-[#231b14] flex flex-wrap items-center justify-between gap-3 text-xs font-mono tracking-wider text-[#d4af37]">
          {/* Left: Station Identity */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#231a12] border border-[#4a3b2c] text-[#f59e0b] shadow-inner">
              <Train className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-[#faf5ed] uppercase tracking-widest text-[11px] sm:text-xs">
                SOUTHERN RAILWAY · தெற்கு இரயில்வே
              </span>
              <span className="hidden sm:inline-block ml-2 text-[#9a8670]">
                [ MAS CHENNAI CENTRAL ⇄ COLUMBUS HUB ]
              </span>
            </div>
          </div>

          {/* Center: Search & Filter Input (§5: Real visible keyboard-focusable input) */}
          <div className="flex-1 max-w-xs sm:max-w-md mx-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-[#f59e0b] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  if (onSearchChange) onSearchChange(e.target.value);
                  useFaqStore.getState().setSearchQuery(e.target.value);
                }}
                placeholder="Search guide & FAQs..."
                aria-label="Filter Sangam FAQ & User Guide"
                className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-[#140e0a] border border-[#423122] rounded-md text-[#fef3c7] placeholder-[#8a7662] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-colors"
              />
            </div>
          </div>

          {/* Right: Station Platform Status & Live Clock */}
          <div className="flex items-center gap-3 text-[#e6c280]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#17110c] border border-[#3b2a1a]">
              <Clock className="w-3 h-3 text-[#f59e0b]" />
              <span className="font-bold tracking-widest">{timeStr}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#17110c] border border-[#3b2a1a]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#a89985]">PLATFORM 04 : ON TIME</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. R3F 3D VIEWPORT WITH PHYSICAL CAMERA & ATMOSPHERE                      */}
        {/* ========================================================================= */}
        <div className="relative flex-1 w-full h-full">
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 2.4, 13], fov: 40 }}
            frameloop={inView ? "always" : "demand"}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              toneMappingExposure: 1.3,
            }}
            shadows={{ type: THREE.PCFShadowMap }}
          >
            {/* FogExp2 configured per §1 Table (density 0.024 -> 0.028) */}
            <fogExp2 attach="fog" args={["#0c0907", 0.024]} />

            {/* Atmosphere Lighting */}
            <ambientLight intensity={1.2} color="#3d2c1e" />
            <directionalLight
              position={[0, 6, 8]}
              intensity={4.5}
              color="#FFF4DE"
              castShadow
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
                  if (useFaqStore.getState().scrollProgress >= 0.35 && !hasTriggeredBootRef.current) {
                    hasTriggeredBootRef.current = true;
                    handle.triggerBootSequence();
                  }
                }}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          </Canvas>

          {/* Bottom Vignette Gradient to dissolve 3D floor into DOM content */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#070504] via-[#070504]/70 to-transparent" />
        </div>

        {/* ========================================================================= */}
        {/* 3. ?debug=1 ENGINEERING HUD (§8 Verification)                             */}
        {/* ========================================================================= */}
        {debugActive && (
          <div className="absolute top-24 left-6 z-30 p-3 rounded-lg bg-[#0e0a07]/90 border border-[#f59e0b]/40 backdrop-blur-md font-mono text-[11px] text-[#fef3c7] shadow-2xl flex flex-col gap-1.5 pointer-events-none">
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
                className={`font-bold uppercase ${
                  bootState === "settled"
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
