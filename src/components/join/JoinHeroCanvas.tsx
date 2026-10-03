"use client";

import React, { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BakeShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useLocale } from "@/context/LocaleContext";
import { CampusGate } from "./CampusGate";
import { GateLettering } from "./GateLettering";
import { ShadowLatticeDecal } from "./ShadowLatticeDecal";
import { MorningVolumetrics } from "./MorningVolumetrics";
import { LeafDrift } from "./LeafDrift";
import { CraneCameraRig } from "./CraneCameraRig";
import { WhiteoutFinale } from "./WhiteoutFinale";
import { MorningSkyDome } from "./env/MorningSkyDome";
import { MorningEnvironment } from "./env/MorningEnvironment";
import { MorningKeyLight } from "./env/MorningKeyLight";
import { MorningLightShafts } from "./env/MorningLightShafts";
import { FOG_COLOR, FOG_DENSITY } from "./env/sun";

import { JoinMaterialsManager, type IronVariant } from "./JoinMaterialsManager";
import { MorningCampusVignette } from "./vignette/MorningCampusVignette";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function JoinHeroCanvas({ tier: propTier }: { tier?: "A" | "B" | "C" } = {}) {
  const { locale } = useLocale();

  const pinWrapperRef = useRef<HTMLDivElement>(null);

  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() => 
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );

  // Auto-detect tier B on mobile touch screens if not explicitly specified
  const tier: "A" | "B" | "C" = useMemo(() => {
    if (reducedMotion) return "C";
    if (propTier) return propTier;
    if (typeof window !== "undefined" && window.innerWidth < 768) return "B";
    return "A";
  }, [propTier, reducedMotion]);

  const [ironVariant, setIronVariant] = useState<IronVariant>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const iron = params.get("iron")?.toLowerCase();
      if (iron === "a") return "a";
    }
    return "b";
  });

  // Synchronized scroll kinematics
  const scrollProgressRef = useRef(0);
  const gateProgressRef = useRef(0);

  // Dev test helper for deterministic Playwright captures (§8)
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as {
        __joinHero?: {
          setGateProgress: (p: number) => void;
          getState: () => {
            scrollProgress: number;
            gateProgress: number;
            ironVariant: IronVariant;
            tier: "A" | "B" | "C";
          };
          setIronVariant: (v: IronVariant) => void;
        };
      }).__joinHero = {
        setGateProgress: (p: number) => {
          const clamped = Math.min(Math.max(p, 0), 1);
          gateProgressRef.current = clamped;
          const approxScrollP = 0.18 + clamped * 0.54;
          scrollProgressRef.current = approxScrollP;
        },
        getState: () => ({
          scrollProgress: scrollProgressRef.current,
          gateProgress: gateProgressRef.current,
          ironVariant,
          tier,
        }),
        setIronVariant: (v: IronVariant) => setIronVariant(v),
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as unknown as { __joinHero?: unknown }).__joinHero;
      }
    };
  }, [ironVariant, tier]);

  // Listen to prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // IntersectionObserver for frameloop culling
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

  // GSAP ScrollTrigger Pinned Timeline: Scrolls smoothly into and through the gates
  useEffect(() => {
    if (reducedMotion || !pinWrapperRef.current) {
      if (reducedMotion) {
        scrollProgressRef.current = 0.85;
        gateProgressRef.current = 1.0;
      }
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinWrapperRef.current,
        start: "top top",
        end: "+=130%",
        pin: true,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          scrollProgressRef.current = p;

          // Gate swing kinematics:
          // Closed from p = 0 to 0.18
          // Smoothly swings open from p = 0.18 to 0.72
          // Fully open (1.0) by p = 0.75, giving clearance margin before threshold pass
          if (p < 0.18) {
            gateProgressRef.current = 0;
          } else if (p >= 0.72) {
            gateProgressRef.current = 1.0;
          } else {
            // Cubic smooth easing for natural iron inertia
            const rawT = (p - 0.18) / 0.54;
            gateProgressRef.current = rawT * rawT * (3 - 2 * rawT);
          }
        },
      });

      ScrollTrigger.refresh();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    }, pinWrapperRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const handleSkipToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("membership-form");
    if (target) {
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      target.focus({ preventScroll: true });
    }
  };

  return (
    <div
      ref={pinWrapperRef}
      className={`relative w-full ${
        reducedMotion ? "h-[85dvh]" : "h-[100dvh]"
      } overflow-hidden bg-[#F4EEDD]`}
      style={{ minHeight: "100dvh" }}
    >
      {/* ================================================================= */}
      {/* 1. PERSISTENT SKIP LINK & RUNNING HEADER CONSOLE (p=0 to p=1)      */}
      {/* ================================================================= */}
      <div className="absolute top-20 sm:top-24 left-0 right-0 z-30 px-3 sm:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 pointer-events-auto">
          {/* Persistent Conversion "Join Now ↓" Skip Link (High WCAG contrast against cream morning sky) */}
          <a
            id="hero-skip-link"
            href="#membership-form"
            onClick={handleSkipToForm}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#55CCA2] text-[#050201] text-xs font-mono font-bold uppercase tracking-wider rounded-none border-2 border-[#141414] shadow-[3px_3px_0px_#141414] hover:bg-[#6ee7b7] hover:shadow-[4px_4px_0px_#141414] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#141414] focus:outline-none focus:ring-2 focus:ring-[#141414] transition-[background-color,box-shadow,transform] duration-150 cursor-pointer shrink-0 min-h-[44px]"
          >
            <span>{locale === "ta" ? "இப்போதே இணையுங்கள் ↓" : "Join Now ↓"}</span>
            <span className="text-[10px] opacity-75 font-body hidden md:inline">
              {locale === "ta" ? "(படிவம்)" : "(Skip intro)"}
            </span>
          </a>

          {/* Iron PBR Variant Switcher (Phase 3: §4 & §8) */}
          <div className="flex items-center gap-1.5 bg-[#141414]/90 backdrop-blur-md px-2.5 py-1 border border-[#C49A45]/50 text-xs font-mono text-[#F4EEDD] shadow-sm">
            <span className="text-white/60 text-[10px] uppercase tracking-wider hidden sm:inline">Iron PBR:</span>
            <button
              type="button"
              onClick={() => setIronVariant("a")}
              className={`px-2 py-0.5 transition-colors cursor-pointer text-[11px] ${
                ironVariant === "a" ? "bg-[#C49A45] text-black font-bold" : "text-white/70 hover:text-white"
              }`}
            >
              Var A (Specular)
            </button>
            <button
              type="button"
              onClick={() => setIronVariant("b")}
              className={`px-2 py-0.5 transition-colors cursor-pointer text-[11px] ${
                ironVariant === "b" ? "bg-[#C49A45] text-black font-bold" : "text-white/70 hover:text-white"
              }`}
            >
              Var B (Matte)
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. R3F 3D VIEWPORT WITH PBR ENVIRONMENT, GATES & POST-PROCESSING   */}
      {/* ================================================================= */}
      <div className="relative w-full h-full">
        <Canvas
          dpr={[1, Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1)]}
          camera={{ position: [0, 2.4, 12.2], fov: 44 }}
          frameloop={inView ? "always" : "demand"}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.9,
          }}
          shadows={tier !== "C" ? { type: THREE.PCFShadowMap } : false}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (event) => {
              event.preventDefault();
              console.warn("[JoinHeroCanvas] WebGL context lost. Attempting restore...");
            });
            gl.domElement.addEventListener("webglcontextrestored", () => {
              console.info("[JoinHeroCanvas] WebGL context restored.");
            });
          }}
        >
          {/* Seamless matching canvas background & fog (§3.2) */}
          <color attach="background" args={[FOG_COLOR]} />
          <fogExp2 attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />

          {/* Custom Morning Gradient Sky Dome (§3.2) */}
          <MorningSkyDome />

          {/* Procedural 4-Lightformer Environment (§3.3) */}
          <MorningEnvironment />

          {/* Key Directional Light & Tight Shadow Frustum (§3.4) */}
          <MorningKeyLight tier={tier} />

          {/* Morning Sunbeam Light Shafts aligned to -SUN_DIR (§3.5) */}
          <MorningLightShafts enabled={tier === "A" && !reducedMotion} reducedMotion={reducedMotion} />

          {/* Scroll-driven Crane Camera Kinematics */}
          <CraneCameraRig scrollProgressRef={scrollProgressRef} />

          <Suspense fallback={null}>
            <BakeShadows />
            {/* Phase 3 PBR Materials: Limestone Pillars & Iron Variant A/B */}
            <JoinMaterialsManager ironVariant={ironVariant} pillarMaterialMode="limestone" />

            {/* Stone Walkway & Dynamic Gate Shadow Lattice */}
            <ShadowLatticeDecal />

            {/* Collegiate Brick Pillars & Swinging Lattice Leaves (PBR Materials & Bump Maps) */}
            <CampusGate gateProgressRef={gateProgressRef} />

            {/* Parametric "TAMIL SANGAM" Bronze Arch Lettering */}
            <GateLettering />

            {/* Volumetric Morning Sunbeams pouring through Gateway */}
            <MorningVolumetrics gateProgressRef={gateProgressRef} />

            {/* Phase 5 Vignette: Chai Bench, Blackboard, Tin Trunk, Mortarboard & Campus Props (§5) */}
            <MorningCampusVignette tier={tier} />

            {/* Ohio Buckeye Leaves & Jasmine Petals with Backlight Translucency (§0 Items 7 & 8) */}
            <LeafDrift tier={tier} reducedMotion={reducedMotion} />

            {/* Finale Sunrise Bloom */}
            <WhiteoutFinale scrollProgressRef={scrollProgressRef} />

            {/* Optical Post-Processing: Vignette & Edge Bloom */}
            <EffectComposer>
              <Vignette offset={0.3} darkness={0.6} />
              <Bloom luminanceThreshold={0.88} intensity={0.4} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
