// src/components/games-hero/GamesHeroCanvas.tsx
"use client";

import React, { Suspense, useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneView as View } from "@/components/canvas/SceneView";
import { governor } from "@/engine/governor";
import { SceneRegistrar } from "@/director/wireframe";
import { useWarmup } from "@/components/gl/useWarmup";
import { BeachCompoundScene } from "./BeachCompoundScene";
import { EyeglassHandRig } from "./EyeglassHandRig";
import { MissilePyroSystem } from "./MissilePyroSystem";
import {
  evaluateCameraRail,
  getDebugScrollProgress,
} from "./gamesRail";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function GamesHeroWarmup() {
  useWarmup("games-beach-blast");
  return null;
}

/**
 * Animated Camera Controller driven by single master tick & scroll progress
 */
function GamesHeroCamera({ scrollP }: { scrollP: number }) {
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const rail = evaluateCameraRail(scrollP, time);
    const camera = state.camera as THREE.PerspectiveCamera;

    camera.position.copy(rail.position);
    camera.lookAt(rail.lookAt);
    if (camera.fov !== rail.fov) {
      camera.fov = rail.fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

export function GamesHeroCanvas() {
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  const [reducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  // Debug scroll override (?debug=p=0.10, ?debug=p=0.42, ?debug=p=0.72)
  const debugProgress = useMemo(() => getDebugScrollProgress(), []);
  const [scrollP, setScrollP] = useState<number>(debugProgress ?? (reducedMotion ? 0.72 : 0));
  const scrollRef = useRef<number>(debugProgress ?? (reducedMotion ? 0.72 : 0));

  // IntersectionObserver for frameloop culling
  useEffect(() => {
    if (!pinWrapperRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        inViewRef.current = entry.isIntersecting;
        governor.request("games-hero", inViewRef.current ? 2 : 0);
      },
      { threshold: 0.05 }
    );
    observer.observe(pinWrapperRef.current);

    return () => {
      observer.disconnect();
      governor.request("games-hero", 0);
    };
  }, []);

  // GSAP ScrollTrigger Pinned Runway
  useEffect(() => {
    if (debugProgress !== null || reducedMotion || !pinWrapperRef.current) {
      return;
    }

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const runwayEnd = isMobile ? "+=160%" : "+=240%";

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinWrapperRef.current,
        start: "top top",
        end: runwayEnd,
        pin: true,
        pinSpacing: true,
        scrub: true,
        invalidateOnRefresh: true,
        anticipatePin: 0,
        onUpdate: (self) => {
          const p = self.progress;
          scrollRef.current = p;
          setScrollP(p);

          governor.request("games-hero", inViewRef.current ? 2 : 0);

          // Exit HUD and skip link smoothly as we push through into games hub
          if (hudRef.current) {
            const exit = Math.max(0, Math.min(1, (p - 0.75) / 0.15));
            hudRef.current.style.opacity = String(1 - exit);
            hudRef.current.style.transform = `translateY(${exit * 20}px)`;
            hudRef.current.style.pointerEvents = exit >= 1 ? "none" : "auto";
          }
        },
      });
    });

    return () => ctx.revert();
  }, [debugProgress, reducedMotion]);

  // Expose global window handle for automated Playwright / DevTools testing
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as {
        __gamesHero?: {
          setProgress: (p: number) => void;
          getProgress: () => number;
        };
      }).__gamesHero = {
        setProgress: (p: number) => {
          const clamped = Math.max(0, Math.min(1, p));
          scrollRef.current = clamped;
          setScrollP(clamped);
        },
        getProgress: () => scrollRef.current,
      };
    }
  }, []);

  // Compute active beat title
  const currentBeat = useMemo(() => {
    if (scrollP < 0.22) return { num: "01", en: "Coastal Standoff", ta: "களக்கரை நிலை" };
    if (scrollP < 0.52) return { num: "02", en: "Eyeglasses Rack-Focus", ta: "கண்ணாடி நுண்காட்சி" };
    if (scrollP < 0.85) return { num: "03", en: "Triple Missile Barrage", ta: "முத்தூதுத் தாக்குதல்" };
    return { num: "04", en: "The Sangam Arcade", ta: "களஞ்சியம் நோக்கிய வழி" };
  }, [scrollP]);

  return (
    <div
      ref={pinWrapperRef}
      data-hero-canvas="games"
      className="relative w-screen h-dvh overflow-hidden select-none bg-transparent"
    >
      {/* 3D WebGL Canvas Layer mounted in persistent GlobalCanvas */}
      <View index={2} className="absolute inset-0 w-full h-full pointer-events-auto">
        <Suspense fallback={null}>
          <GamesHeroWarmup />
          <SceneRegistrar />
          <PerspectiveCamera makeDefault position={[0, 1.65, 6.0]} fov={34} near={0.1} far={300} />
          <color attach="background" args={["#4DB6CE"]} />
          <GamesHeroCamera scrollP={scrollP} />

          {/* Beat 1: The Beach Compound & SUVs */}
          <BeachCompoundScene
            scrollP={scrollP}
            backgroundBokeh={scrollP >= 0.22 && scrollP <= 0.52 ? (scrollP - 0.22) / 0.3 * 6.5 : 0}
          />

          {/* Beat 2 & 3: Descending Eyeglasses, Hand, and Rack-Focus */}
          <EyeglassHandRig
            scrollP={scrollP}
            foregroundBlur={scrollP >= 0.52 ? Math.min(5.0, (scrollP - 0.52) / 0.1 * 5.0) : 0}
          />

          {/* Beat 3: Incoming Missiles & Dual-Lens Explosions */}
          <MissilePyroSystem scrollP={scrollP} />
        </Suspense>
      </View>

      {/* Cinematic Vignette Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(18, 14, 12, 0.42) 100%)",
          opacity: scrollP >= 0.85 ? Math.max(0, 1 - (scrollP - 0.85) / 0.1) : 1,
        }}
      />

      {/* Subtle Anamorphic Letterbox Bars (Top & Bottom) for 2.39:1 Kollywood Cinema Feel */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-4 sm:h-6 bg-[#161210]/60 z-20 backdrop-blur-xs" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 sm:h-6 bg-[#161210]/60 z-20 backdrop-blur-xs" />

      {/* Bottom HUD: Sequence Controller & Quick Skip */}
      <div
        ref={hudRef}
        className="absolute bottom-8 left-0 right-0 z-30 px-6 sm:px-12 flex items-center justify-between pointer-events-auto text-[#FAF6F0]"
      >
        {/* Left: Cinematic Sequence Beat Pill */}
        <div className="flex items-center gap-3 bg-[#161210]/75 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-xl">
          <span className="size-2 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="font-mono text-xs tracking-widest text-[#D4AF37] uppercase font-bold">
            BEAT {currentBeat.num}
          </span>
          <span className="text-white/40 text-xs">/</span>
          <span className="text-xs sm:text-sm font-sans font-medium text-white/90">
            {currentBeat.en}
          </span>
          <span lang="ta" className="hidden sm:inline font-tamil text-xs text-white/60">
            ({currentBeat.ta})
          </span>
        </div>

        {/* Right: Quick Skip to Games Hub Anchor */}
        <a
          ref={skipLinkRef}
          href="#games-hub"
          onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById("games-hub");
            if (target) {
              target.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="group flex items-center gap-2 bg-[#161210]/80 hover:bg-[#D4AF37] hover:text-[#161210] transition-colors duration-200 px-4 py-2 rounded-full border border-white/20 shadow-xl text-xs sm:text-sm font-medium backdrop-blur-md"
        >
          <span>Skip to Arcade</span>
          <span lang="ta" className="hidden sm:inline font-tamil text-xs opacity-75">
            (களஞ்சியம்)
          </span>
          <span className="text-sm transition-transform duration-200 group-hover:translate-y-0.5">
            ↓
          </span>
        </a>
      </div>
    </div>
  );
}
