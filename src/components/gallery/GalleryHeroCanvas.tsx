"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CoastalCyclorama } from "./CoastalCyclorama";
import { SunDisc } from "./SunDisc";
import { AcousticStrings } from "./AcousticStrings";
import { MemoryStream } from "./MemoryStream";
import { AcousticCameraRig } from "./AcousticCameraRig";
import { WhiteoutFinale } from "./WhiteoutFinale";
import { PostFX } from "./PostFX";
import { useScrollPluck } from "./useScrollPluck";
import { useGalleryHeroStore } from "@/store/galleryHeroStore";
import { Music, Camera, Terminal, Compass } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface GalleryHeroCanvasProps {
  onFinaleComplete?: () => void;
}

/**
 * Inner 3D Scene to host R3F hooks (useScrollPluck, useFrame, camera rig)
 */
function GalleryScene({
  scrollProgress,
  onFinaleTrigger,
  reducedMotion,
}: {
  scrollProgress: number;
  onFinaleTrigger: () => void;
  reducedMotion: boolean;
}) {
  // §8: Scroll velocity to damped string amplitude hook
  const amplitudeRef = useScrollPluck();

  return (
    <>
      {/* 1. Camera Rig with Idle Motion & Finale Dolly (§10) */}
      <AcousticCameraRig scrollProgress={scrollProgress} />

      {/* 2. Coastal Cyclorama (Partial-arc cylinder, texture UV panned) (§5) */}
      <CoastalCyclorama speedMultiplier={reducedMotion ? 0 : 1.0} />

      {/* 3. Setting Sun & Flare Streaks (§6) */}
      <SunDisc scrollProgress={scrollProgress} />

      {/* 4. Acoustic Guitar Strings (Corrected Mode Shape Shader) (§7) */}
      <AcousticStrings
        amplitudeRef={reducedMotion ? undefined : amplitudeRef}
        amplitude={reducedMotion ? 0 : undefined}
      />

      {/* 5. Memory Stream (Event-driven polaroid release + rigid drift) (§9) */}
      <MemoryStream
        amplitudeRef={amplitudeRef}
        reducedMotion={reducedMotion}
      />

      {/* 6. Finale Trigger (§11) */}
      <WhiteoutFinale
        scrollProgress={scrollProgress}
        onFinaleTrigger={onFinaleTrigger}
      />

      {/* 7. Selective Post-Processing (Bloom on layer 1 only, Vignette, Film Grain) (§8) */}
      <PostFX />
    </>
  );
}

/**
 * §4: Master Gallery Hero Canvas
 * - 150vh pinned ScrollTrigger timeline (100dvh + 150vh = 250vh wrapper).
 * - Background matched to fog (#FF9D5C) for seamless horizon blending.
 * - Warm whiteout overlay (#FFF6E8) on finale.
 * - ?debug=1 HUD telemetry and prefers-reduced-motion compliance.
 */
export function GalleryHeroCanvas({ onFinaleComplete }: GalleryHeroCanvasProps) {
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const whiteoutOverlayRef = useRef<HTMLDivElement>(null);

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

  // Store metrics for ?debug=1 HUD
  const scrollProgress = useGalleryHeroStore((s) => s.scrollProgress);
  const smoothedVelocity = useGalleryHeroStore((s) => s.smoothedVelocity);
  const currentAmplitude = useGalleryHeroStore((s) => s.currentAmplitude);
  const activePolaroidsCount = useGalleryHeroStore((s) => s.activePolaroidsCount);
  const cooldownTimer = useGalleryHeroStore((s) => s.cooldownTimer);
  const finaleFired = useGalleryHeroStore((s) => s.finaleFired);
  const isPlucking = useGalleryHeroStore((s) => s.isPlucking);
  const fps = useGalleryHeroStore((s) => s.fps);

  // Sync debugMode and listen to prefers-reduced-motion changes
  useEffect(() => {
    if (debugActive) {
      useGalleryHeroStore.getState().setDebugMode(true);
    }
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [debugActive]);

  // IntersectionObserver to set frameloop="demand" when hero leaves viewport (§12)
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

  // §10: GSAP ScrollTrigger 150vh Pinned Timeline
  useEffect(() => {
    if (reducedMotion || !pinWrapperRef.current || !stickyContainerRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinWrapperRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: stickyContainerRef.current,
        pinSpacing: false,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          setLocalProgress(p);
          useGalleryHeroStore.getState().setScrollProgress(p);
        },
      });

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

  // Handle Finale Whiteout Dissolve (§11)
  const handleFinaleTriggered = () => {
    if (!whiteoutOverlayRef.current || !stickyContainerRef.current) return;

    // 1. Dedicated full-screen overlay quad fades 0 -> 1 opacity (#FFF6E8) over 0.35s
    gsap.to(whiteoutOverlayRef.current, {
      opacity: 1.0,
      duration: 0.35,
      ease: "power2.inOut",
      onComplete: () => {
        // 2. Crossfade canvas container to 0 over 0.4s
        gsap.to(stickyContainerRef.current, {
          opacity: 0,
          duration: 0.4,
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
      ref={pinWrapperRef}
      className={`relative w-full ${
        reducedMotion ? "h-[85dvh]" : "h-[250vh]" // 100dvh viewport + 150vh pinned scroll length (§10)
      }`}
    >
      <div
        ref={stickyContainerRef}
        className="sticky top-0 z-10 w-full h-[100dvh] overflow-hidden bg-[#FF9D5C] border-b border-[#C4511F]/30 shadow-2xl flex flex-col justify-between"
      >
        {/* ========================================================================= */}
        {/* 1. TOP VAARANAM AAYIRAM ECR CONSOLE HUD                                   */}
        {/* ========================================================================= */}
        <div className="relative z-20 w-full pt-16 sm:pt-20 px-4 sm:px-8 pb-3 bg-gradient-to-b from-[#2A1005]/95 via-[#2A1005]/80 to-transparent backdrop-blur-sm border-b border-[#C4511F]/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono tracking-wider text-[#FFE0A8]">
          {/* Left: Acoustic Hero Identity */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#541B0B] border border-[#C4511F] text-[#FFE0A8] shadow-inner">
              <Music className="w-4 h-4 text-[#FFE0A8]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#FFF6E8] tracking-widest uppercase">
                  ECR ACOUSTIC ARCHIVE
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C4511F]/40 border border-[#C4511F]/60 text-[#FFE0A8]">
                  EAST COAST ROAD
                </span>
              </div>
              <p className="text-[11px] text-[#FF9D5C] font-tamil font-normal">
                வாரணம் ஆயிரம் · நினைவுகளின் கடற்கரைச் சங்கமம்
              </p>
            </div>
          </div>

          {/* Center: Live Pluck Velocity & Harmonic Amplitude Indicator */}
          <div className="hidden md:flex items-center gap-4 bg-[#1F0A05]/85 px-4 py-1.5 rounded-full border border-[#C4511F]/40 text-[11px]">
            <span className="text-[#FF9D5C] uppercase flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#FFE0A8]" />
              <span>Velocity Pluck:</span>
            </span>
            <div className="w-28 h-2.5 bg-[#3B1408] rounded-full overflow-hidden border border-[#C4511F]/40 relative">
              <div
                className="h-full bg-gradient-to-r from-[#C4511F] via-[#FF9D5C] to-[#FFE0A8] transition-all duration-75"
                style={{ width: `${Math.min(100, (currentAmplitude / 0.26) * 100)}%` }}
              />
            </div>
            <span
              className={`font-bold transition-colors ${
                isPlucking ? "text-[#FFF6E8] animate-pulse" : "text-[#FF9D5C]"
              }`}
            >
              {isPlucking ? "PLUCKING · DRIFTING" : "STRINGS AT REST"}
            </span>
          </div>

          {/* Right: Interaction Cue */}
          <div className="flex items-center gap-2 text-[#FFE0A8]">
            <Camera className="w-4 h-4 text-[#FF9D5C]" />
            <span className="hidden sm:inline uppercase text-[11px] tracking-widest text-[#FF9D5C]">
              SCROLL SPEED PLUCKS STRINGS
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. 3D R3F CANVAS CONTAINER                                                */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 z-0">
          <Canvas
            frameloop={inView ? "always" : "demand"}
            gl={{
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.05,
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
            onCreated={({ scene, gl }) => {
              // FogExp2 color matching canvas background (#FF9D5C) per §2 & §3
              scene.fog = new THREE.FogExp2("#FF9D5C", 0.024);
              gl.outputColorSpace = THREE.SRGBColorSpace;
            }}
          >
            <Suspense fallback={null}>
              <GalleryScene
                scrollProgress={localProgress}
                onFinaleTrigger={handleFinaleTriggered}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM CINEMATIC OVERLAY & MEMORY VAPOR                                */}
        {/* ========================================================================= */}
        <div className="relative z-20 w-full px-4 sm:px-8 py-4 bg-gradient-to-t from-[#1F0A05]/90 via-[#1F0A05]/50 to-transparent flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#FFE0A8]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFE0A8] animate-ping" />
            <span className="tracking-widest uppercase text-[11px]">
              6 STRINGS · HARMONIC RESONANCE · 8 POLAROID MEMORIES
            </span>
          </div>
          <div className="text-[11px] text-[#FF9D5C] hidden sm:block">
            DOLBY GOLDEN HOUR · ECR CHENNAI 2025–26
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. WHITEOUT FINALE QUAD OVERLAY (#FFF6E8) (§11)                           */}
        {/* ========================================================================= */}
        <div
          ref={whiteoutOverlayRef}
          className="absolute inset-0 z-30 pointer-events-none opacity-0 bg-[#FFF6E8]"
          style={{ mixBlendMode: "screen" }}
        />

        {/* ========================================================================= */}
        {/* 5. ?debug=1 TELEMETRY HUD (§12)                                           */}
        {/* ========================================================================= */}
        {debugActive && (
          <div
            data-debug-hud="true"
            className="absolute top-24 right-4 z-40 p-3 bg-[#1F0A05]/95 border border-[#C4511F] text-[#FFE0A8] font-mono text-[11px] rounded shadow-2xl space-y-1.5 backdrop-blur-md max-w-xs pointer-events-none"
          >
            <div className="flex items-center justify-between border-b border-[#C4511F]/50 pb-1 font-bold text-[#FFF6E8]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#FFE0A8]" />
                VAARANAM ACOUSTIC HUD
              </span>
              <span className="text-[10px] px-1 py-0.2 bg-[#541B0B] text-[#FFE0A8] rounded">
                DEBUG=1
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px]">
              <div>
                <span className="text-[#FF9D5C]">Scroll Progress (p):</span>{" "}
                <span className="text-[#FFF6E8] font-bold">
                  {scrollProgress.toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-[#FF9D5C]">Render FPS:</span>{" "}
                <span className="text-[#FFE0A8] font-bold">{fps}</span>
              </div>
              <div>
                <span className="text-[#FF9D5C]">Velocity (v):</span>{" "}
                <span className="text-[#FFF6E8]">{smoothedVelocity.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#FF9D5C]">Amplitude (A):</span>{" "}
                <span className="text-[#FFE0A8]">{currentAmplitude.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-[#FF9D5C]">Active Polaroids:</span>{" "}
                <span className="text-[#FFF6E8]">{activePolaroidsCount} / 8</span>
              </div>
              <div>
                <span className="text-[#FF9D5C]">Cooldown:</span>{" "}
                <span className="text-[#FFE0A8]">{cooldownTimer.toFixed(2)}s</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-[#C4511F]/30 flex items-center justify-between">
                <span className="text-[#FF9D5C]">Finale Fired:</span>
                <span
                  className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                    finaleFired
                      ? "bg-green-950 text-green-300 border border-green-700"
                      : "bg-[#3B1408] text-[#FF9D5C]"
                  }`}
                >
                  {finaleFired ? "TRUE" : "FALSE"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Screen-reader accessible transcript (§12) */}
        <div className="sr-only">
          <h2>ECR Vaaranam Aayiram 6-String Acoustic Guitar Hero</h2>
          <p>
            An interactive 3D acoustic sunset coastal guitar scene. As you scroll, 6 guitar
            strings vibrate dynamically, releasing collegiate polaroid photo memories of
            Ohio State Tamil Sangam events drifting along the coastal road toward the setting sun.
          </p>
        </div>
      </div>
    </div>
  );
}
