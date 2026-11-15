"use client";

import React, { Suspense, useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PerspectiveCamera, Sky } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { SceneView as View } from "@/components/canvas/SceneView";
import { useWarmup } from "@/components/gl/useWarmup";
import { useLocale } from "@/context/LocaleContext";
import { CampusGate } from "./CampusGate";
import { GateLettering } from "./GateLettering";
import { ShadowLatticeDecal } from "./ShadowLatticeDecal";
import { MorningVolumetrics } from "./MorningVolumetrics";
import { LeafDrift } from "./LeafDrift";
import { CraneCameraRig } from "./CraneCameraRig";
import { WhiteoutFinale } from "./WhiteoutFinale";
import { MorningEnvironment } from "./env/MorningEnvironment";
import { MorningKeyLight } from "./env/MorningKeyLight";
import { MorningLightShafts } from "./env/MorningLightShafts";
import { FOG_COLOR, FOG_DENSITY, SUN_POS } from "./env/sun";

import { JoinMaterialsManager, type IronVariant } from "./JoinMaterialsManager";
import { MorningCampusVignette } from "./vignette/MorningCampusVignette";
import { NanbanQuadEnvironment } from "./NanbanQuadEnvironment";
import { soundEngine } from "@/lib/soundEngine";
import { useRenderMode } from "@/components/providers/useRenderMode";
import { useShadowUpdates } from "@/gl/shadows";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function JoinSceneWarmup() {
  useWarmup("join-morning-gates");
  return null;
}

/**
 * Replaces drei <BakeShadows>, which froze the shadow map after the first frame even though
 * the lattice leaves swing open. Re-renders shadows only while the gate is moving.
 */
function GateShadowUpdates({ gateProgressRef }: { gateProgressRef: React.RefObject<number> }) {
  const invalidate = useShadowUpdates({ mode: "onChange" });
  const last = useRef(-1);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const g = gateProgressRef.current ?? 0;
    if (Math.abs(g - last.current) > 1e-4) {
      last.current = g;
      invalidate();
    }
  }, 1.4);
  return null;
}

/**
 * drei <Sky> is a <primitive>, which R3F never disposes; each visit leaked its box
 * geometry and shader material. Same props, freed on unmount.
 */
function MorningSky() {
  const ref = useRef<THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial>>(null);
  useEffect(() => {
    const sky = ref.current;
    return () => {
      sky?.geometry.dispose();
      sky?.material.dispose();
    };
  }, []);
  return (
    <Sky
      ref={ref}
      distance={450000}
      sunPosition={SUN_POS}
      turbidity={7}
      rayleigh={1.5}
      mieCoefficient={0.008}
      mieDirectionalG={0.82}
    />
  );
}

/** Tier C / Lite / reduced motion: a rendered still of the scene (PRD §5 static courtyard view). */
function JoinStaticPoster({ locale }: { locale: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/join/join-hero-poster.webp"
      alt={
        locale === "ta"
          ? "காலை வெளிச்சத்தில் திறக்கும் இரும்பு வளாக வாயில்கள்"
          : "Wrought-iron campus gates opening onto a sunlit morning courtyard"
      }
      className="absolute inset-0 h-full w-full object-cover"
      decoding="async"
    />
  );
}

export function JoinHeroCanvas({ tier: propTier }: { tier?: "A" | "B" | "C" } = {}) {
  const { locale } = useLocale();

  const pinWrapperRef = useRef<HTMLDivElement>(null);

  // One quality source (TierProvider + Lite + reduced motion + adaptive governor).
  const { mode } = useRenderMode();
  const isStatic = mode === "static";
  const reducedMotion = isStatic;

  // Narrow screens keep the lighter Tier B scene (mobile GPUs), as before.
  const tier: "A" | "B" | "C" = useMemo(() => {
    if (isStatic) return "C";
    if (propTier) return propTier;
    if (mode === "B") return "B";
    if (typeof window !== "undefined" && window.innerWidth < 768) return "B";
    return "A";
  }, [propTier, mode, isStatic]);

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
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const hasChimedGatesRef = useRef(false);

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

  // Frame requests and offscreen culling are owned by SceneView (governor + IntersectionObserver).

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
        scrub: true, // Direct 1:1 read of Lenis
        invalidateOnRefresh: true,
        anticipatePin: 0, // 0 eliminates initial pin twitch
        onUpdate: (self) => {
          const p = self.progress;
          scrollProgressRef.current = p;

          // Strict Hero HUD Exit Window (p = 0.70 -> 0.78):
          if (skipLinkRef.current) {
            const exit = Math.max(0, Math.min(1, (p - 0.70) / 0.08));
            skipLinkRef.current.style.opacity = String(1 - exit);
            skipLinkRef.current.style.transform = `translateY(${-20 * exit}px)`;
            skipLinkRef.current.style.pointerEvents = exit >= 1 ? "none" : "auto";
          }

          // Dissolve dark radial vignette overlay during threshold pass (p = 0.65 -> 0.85)
          // to eliminate any brown smudge under the navbar or over the incoming #140C20 sheet
          if (vignetteRef.current) {
            const vigFade = Math.max(0, Math.min(1, (p - 0.65) / 0.20));
            vignetteRef.current.style.opacity = String(1 - vigFade);
          }

          // Gate swing kinematics:
          // Closed from p = 0 to 0.18
          // Smoothly swings open from p = 0.18 to 0.72
          // Fully open (1.0) by p = 0.75, giving clearance margin before threshold pass
          if (p < 0.18) {
            gateProgressRef.current = 0;
            if (p < 0.12) {
              hasChimedGatesRef.current = false;
            }
          } else if (p >= 0.72) {
            gateProgressRef.current = 1.0;
          } else {
            if (!hasChimedGatesRef.current) {
              hasChimedGatesRef.current = true;
              soundEngine.playTempleChime();
            }
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

    return () => {
      ctx.revert();
    };
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
      } overflow-hidden bg-transparent`}
      style={{ minHeight: "100dvh" }}
    >
      {/* ================================================================= */}
      {/* 1. PERSISTENT SKIP LINK & RUNNING HEADER CONSOLE (p=0 to p=1)      */}
      {/* ================================================================= */}
      <div className="absolute top-20 sm:top-24 left-0 right-0 z-30 px-3 sm:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 pointer-events-auto">
          {/* Persistent Conversion "Join Now ↓" Skip Link (Warm Hearth Glass Pill) */}
          <a
            ref={skipLinkRef}
            id="hero-skip-link"
            href="#membership-form"
            onClick={handleSkipToForm}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#140C20]/85 text-[#F4F0FA] border border-[#A6F0CF]/35 backdrop-blur-md rounded-full text-xs font-mono tracking-wider hover:border-[#A6F0CF] hover:bg-[#140C20] transition-all will-change-[transform,opacity] cursor-pointer shrink-0 min-h-[44px] shadow-lg"
          >
            <span>{locale === "ta" ? "இப்போதே இணையுங்கள் ↓" : "Skip to Guestbook ↓"}</span>
            <span className="text-[10px] text-[#A6F0CF] font-body hidden md:inline">
              {locale === "ta" ? "(படிவம்)" : "(Form)"}
            </span>
          </a>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. R3F 3D VIEWPORT WITH PBR ENVIRONMENT, GATES & POST-PROCESSING   */}
      {/* ================================================================= */}
      <div className="relative w-full h-full">
        {isStatic ? (
          <JoinStaticPoster locale={locale} />
        ) : (
        // Ungraded by design: Join's high-key art is tuned for per-material tone mapping.
        // Through GradePass its additive shafts/haze sum in linear and veil the scene
        // (measured: luma mean 146 → 161, contrast std 74.6 → 66.5 even with bloom limited
        // to highlights), and its own CSS vignette already fades at the threshold pass.
        <View className="w-full h-full pointer-events-auto" index={2}>
          <JoinSceneWarmup />
          <PerspectiveCamera makeDefault position={[0, 2.4, 12.2]} fov={44} near={0.05} far={100} />

          {/* Seamless matching canvas background & fog (§3.2) */}
          <color attach="background" args={[FOG_COLOR]} />
          <fogExp2 attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />

          {/* Custom Morning Gradient Sky Dome (§3.2) */}
          <MorningSky />

          {/* Procedural 4-Lightformer Environment (§3.3) */}
          <MorningEnvironment />

          {/* Key Directional Light & Tight Shadow Frustum (§3.4) */}
          <MorningKeyLight tier={tier} />

          {/* Morning Sunbeam Light Shafts aligned to -SUN_DIR (§3.5) */}
          <MorningLightShafts enabled={tier === "A" && !reducedMotion} reducedMotion={reducedMotion} />

          {/* Scroll-driven Crane Camera Kinematics */}
          <CraneCameraRig scrollProgressRef={scrollProgressRef} />

          <Suspense fallback={null}>
            <GateShadowUpdates gateProgressRef={gateProgressRef} />
            {/* Phase 3 PBR Materials: Limestone Pillars & Iron Variant A/B */}
            <JoinMaterialsManager ironVariant={ironVariant} pillarMaterialMode="limestone" />

            {/* Stone Walkway & Dynamic Gate Shadow Lattice */}
            <ShadowLatticeDecal />

            {/* Collegiate Brick Pillars & Swinging Lattice Leaves (PBR Materials & Bump Maps) */}
            <CampusGate gateProgressRef={gateProgressRef} />

            {/* Nanban Collegiate Perimeter Walls, Tree Colonnade & Distant Heritage Hall */}
            <NanbanQuadEnvironment />

            {/* Parametric "TAMIL SANGAM" Bronze Arch Lettering */}
            <GateLettering />

            {/* Volumetric Morning Sunbeams pouring through Gateway */}
            <MorningVolumetrics gateProgressRef={gateProgressRef} />

            {/* Phase 5 Vignette: Chai Bench, Blackboard, Tin Trunk, Mortarboard & Campus Props (§5) */}
            <MorningCampusVignette tier={tier} />

            {/* Ohio Buckeye Leaves & Jasmine Petals with Backlight Translucency (§0 Items 7 & 8) */}
            <LeafDrift tier={tier} reducedMotion={reducedMotion} />

            {/* Finale Sunrise Bloom */}
            <WhiteoutFinale scrollProgressRef={scrollProgressRef} gateProgressRef={gateProgressRef} />
          </Suspense>
        </View>
        )}

        {/* Optical Post-Processing: CSS Vignette Overlay (§1, Spike S3) */}
        <div
          ref={vignetteRef}
          className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(20,10,5,0.45)_100%)] transition-opacity will-change-[opacity]"
        />
      </div>
    </div>
  );
}
