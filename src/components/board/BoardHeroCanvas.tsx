"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CraneCameraRig } from "./CraneCameraRig";
import { CorridorTreadmill } from "./CorridorTreadmill";
import { EmblemFinale } from "./EmblemFinale";
import { PostFX } from "./PostFX";
import { useBoardHeroStore } from "@/store/boardHeroStore";
import { Crown, Sparkles, Terminal } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface BoardHeroCanvasProps {
  onFinaleComplete?: () => void;
}

export function BoardHeroCanvas({ onFinaleComplete }: BoardHeroCanvasProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const goldOverlayRef = useRef<HTMLDivElement>(null);

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
  const [localProgress, setLocalProgress] = useState(() => (reducedMotion ? 1.0 : 0));

  // Store diagnostics for ?debug=1 HUD
  const scrollProgress = useBoardHeroStore((s) => s.scrollProgress);
  const cameraZ = useBoardHeroStore((s) => s.cameraZ);
  const fogDensity = useBoardHeroStore((s) => s.fogDensity);
  const recycledCount = useBoardHeroStore((s) => s.recycledCount);
  const activeRealLights = useBoardHeroStore((s) => s.activeRealLights);
  const finaleFired = useBoardHeroStore((s) => s.finaleFired);
  const fps = useBoardHeroStore((s) => s.fps);

  // Sync debugMode and listen to prefers-reduced-motion changes
  useEffect(() => {
    if (debugActive) {
      useBoardHeroStore.getState().setDebugMode(true);
    }
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [debugActive]);

  // IntersectionObserver to set frameloop="demand" when hero leaves viewport (§9)
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // §6: GSAP ScrollTrigger Pinned Timeline (Pins sectionRef with +=1600 scroll distance)
  useEffect(() => {
    if (reducedMotion || !sectionRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=1600",
        pin: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          setLocalProgress(p);
          useBoardHeroStore.getState().setScrollProgress(p);

          // If user scrolls back up into corridor, smoothly restore canvas opacity & reset gold flash
          if (p < 0.85) {
            if (goldOverlayRef.current) {
              gsap.to(goldOverlayRef.current, { opacity: 0, duration: 0.25, overwrite: "auto" });
            }
            if (canvasContainerRef.current) {
              gsap.to(canvasContainerRef.current, { opacity: 1, duration: 0.25, overwrite: "auto" });
            }
          }
        },
      });

      ScrollTrigger.refresh();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    }, sectionRef);

    return () => {
      ctx.revert();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    };
  }, [reducedMotion]);

  // Handle Finale Golden Dissolve (§7)
  const handleFinaleTriggered = () => {
    if (!goldOverlayRef.current || !canvasContainerRef.current) return;

    // 1. Full-screen gold flash (0 -> 0.85 over 0.25s)
    gsap.to(goldOverlayRef.current, {
      opacity: 0.85,
      duration: 0.25,
      ease: "power2.inOut",
      onComplete: () => {
        // 2. Crossfade canvas container to 0.15 over 0.35s
        gsap.to(canvasContainerRef.current, {
          opacity: 0.15,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            if (onFinaleComplete) {
              onFinaleComplete();
            }
          },
        });
      },
    });
  };

  return (
    <div
      ref={sectionRef}
      className={`relative w-full ${
        reducedMotion ? "h-[85dvh]" : "h-[100dvh]"
      } overflow-hidden bg-[#120A06] border-b border-[#3d2714] shadow-2xl flex flex-col justify-between`}
      style={{ minHeight: "100dvh" }}
    >
      <div
        ref={canvasContainerRef}
        className="relative w-full h-full flex flex-col justify-between"
      >
        {/* ========================================================================= */}
        {/* 1. TOP CHOLA DARBAR SENATE HUD (Alaipayuthey / PS-1 Classical Motif)      */}
        {/* ========================================================================= */}
        <div className="relative z-20 w-full pt-16 sm:pt-20 px-4 sm:px-8 pb-3 bg-gradient-to-b from-[#1c1008] via-[#1c1008]/95 to-[#1c1008]/75 backdrop-blur-md border-b border-[#3d2714] flex flex-wrap items-center justify-between gap-3 text-xs font-mono tracking-wider text-[#D4AF37]">
          {/* Left: Chola Imperial Senate Crest */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#2a170d] border border-[#6b4a32] text-[#D4AF37] shadow-inner">
              <Crown className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-[#faf5ed] uppercase tracking-widest text-[11px] sm:text-xs">
                CHOLA DARBAR · சோழர் தர்பார்
              </span>
              <span className="hidden sm:inline-block ml-2 text-[#a89078]">
                [ 2026–2027 EXECUTIVE SENATE COUNCIL ]
              </span>
            </div>
          </div>

          {/* Center: Scroll Crane Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-[#22130a] border border-[#4d321d] text-[#e0b968]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[11px] font-mono uppercase tracking-widest">
              {scrollProgress >= 0.95
                ? "ENTERING SANCTUM · REACHING IMPERIAL EMBLEM"
                : "SCROLL TO CRANE THROUGH STONE MANDAPAM"}
            </span>
          </div>

          {/* Right: Cultural Motto */}
          <div className="flex items-center gap-3 text-[#d4af37]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#24140b] border border-[#52361f]">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-bold font-tamil text-[11px]">யாதும் ஊரே யாவரும் கேளீர்</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. R3F 3D VIEWPORT WITH PHYSICAL CAMERA & ATMOSPHERE                      */}
        {/* ========================================================================= */}
        <div className="relative flex-1 w-full h-full">
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 1.6, 30], fov: 32 }}
            frameloop={inView ? "always" : "demand"}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.0,
            }}
            shadows
          >
            {/* World-Space FogExp2 per §2 & §5 Table */}
            <fogExp2 attach="fog" args={["#1C120A", 0.045]} />

            {/* Ambient & Rim Lighting (Moody torchlight balance, max 0.6 luminance) */}
            <ambientLight intensity={0.45} color="#40281b" />
            <directionalLight
              position={[0, 8, 10]}
              intensity={1.2}
              color="#FFE8C2"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />

            {/* Crane Camera Rig with spring-lag inertia (§6) */}
            <CraneCameraRig scrollProgress={reducedMotion ? 1.0 : localProgress} />

            {/* 3D Modular Corridor Treadmill (§3) */}
            <Suspense fallback={null}>
              <CorridorTreadmill />
            </Suspense>

            {/* Chola Imperial Tiger Emblem Finale at z = 0 (§7) */}
            <EmblemFinale
              scrollProgress={reducedMotion ? 1.0 : localProgress}
              onFinaleTriggered={handleFinaleTriggered}
            />

            {/* Post-Processing Effects (§8) */}
            <PostFX />
          </Canvas>

          {/* Additive Gold Finale Flash Overlay (§7) */}
          <div
            ref={goldOverlayRef}
            className="pointer-events-none absolute inset-0 bg-[#D4AF37] opacity-0 transition-opacity duration-200"
          />

          {/* Bottom Vignette Gradient to dissolve floor into DOM */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#120A06] via-[#120A06]/70 to-transparent" />
        </div>

        {/* ========================================================================= */}
        {/* 3. ?debug=1 ENGINEERING HUD (§9 Verification)                             */}
        {/* ========================================================================= */}
        {debugActive && (
          <div className="absolute top-24 left-6 z-30 p-3 rounded-lg bg-[#140b06]/92 border border-[#D4AF37]/40 backdrop-blur-md font-mono text-[11px] text-[#fef3c7] shadow-2xl flex flex-col gap-1.5 pointer-events-none">
            <div className="flex items-center gap-2 pb-1 border-b border-[#3d2714] text-[#D4AF37] font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>CHOLA DARBAR CINEMATIC CRANE HUD</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a89078]">Scroll Progress (p):</span>
              <span className="font-bold text-[#38bdf8]">{scrollProgress.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a89078]">Camera Position Z:</span>
              <span className="font-bold text-[#e0b968]">{cameraZ.toFixed(2)}m</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a89078]">FogExp2 Density:</span>
              <span className="font-bold text-emerald-400">{fogDensity.toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a89078]">Treadmill Recycles:</span>
              <span className="font-bold text-amber-400">{recycledCount}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a89078]">Active Real Lights:</span>
              <span className="font-bold text-amber-300">{activeRealLights} / 3</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#a89078]">Finale Fired:</span>
              <span
                className={`font-bold uppercase ${
                  finaleFired ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                {finaleFired ? "TRUE" : "FALSE"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#3d2714]">
              <span className="text-[#a89078]">Render FPS:</span>
              <span className="font-bold text-emerald-400">{fps}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. ACCESSIBILITY (A11y) SCREEN READER SHADOW DOM (§9)                     */}
        {/* ========================================================================= */}
        <div className="sr-only" aria-live="polite">
          <h2>Ponniyin Selvan Chola Darbar — Executive Board Colonnade</h2>
          <p>
            A stone mandapam corridor honoring the executive committee officers of Ohio State Tamil Sangam.
            Scroll advances down the grand hall toward the royal Chola tiger emblem, leading directly to the
            committee roster below.
          </p>
        </div>
      </div>
    </div>
  );
}
