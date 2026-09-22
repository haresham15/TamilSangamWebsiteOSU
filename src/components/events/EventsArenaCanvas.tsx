"use client";

import React, { useRef, useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  DepthOfField,
} from "@react-three/postprocessing";
import { DaturaCauldron } from "./DaturaCauldron";
import { CrowdInstancedSimulation } from "./CrowdInstancedSimulation";
import { ArenaLightingEnvironment } from "./ArenaLightingEnvironment";
import {
  CinematicSilhouette,
  CinematicSilhouetteHandle,
} from "./CinematicSilhouette";
import { HeroEventPedestalCard } from "./HeroEventPedestalCard";
import { useArenaScrollTimeline } from "./useArenaScrollTimeline";
import { ArrowDown, Sparkles } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface ArenaSceneProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  isTransitioning: boolean;
  godLightIntensity: number;
  onTriggerTransition: () => void;
  onTransitionComplete: () => void;
  onProgress?: (progress: number) => void;
}

/**
 * ArenaScene:
 * Master 3D scene holding the industrial cauldron, 8,000 dense dancers,
 * the extruded high-fidelity silhouette with shoulder pivot, and The God Light.
 */
function ArenaScene({
  containerRef,
  isMobile,
  isTransitioning,
  godLightIntensity,
  onTriggerTransition,
  onTransitionComplete,
  onProgress,
}: ArenaSceneProps) {
  // GSAP ScrollTrigger camera crane & Z-axis push-through transition
  useArenaScrollTimeline({
    triggerRef: containerRef,
    isMobile,
    isTransitioning,
    onProgress,
    onTransitionComplete,
  });

  const { scene, camera } = useThree();
  useEffect(() => {
    // Bind debug objects to window for console manipulation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__THREE_SCENE__ = scene;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__THREE_CAMERA__ = camera;
  }, [scene, camera]);

  const [isActorHovered, setIsActorHovered] = useState(false);
  const silhouetteRef = useRef<CinematicSilhouetteHandle>(null);

  const handleActorClick = () => {
    silhouetteRef.current?.triggerArmRoll();
    onTriggerTransition();
  };

  return (
    <>
      {/* 1. Volumetric lighting, The God Light (z: -2.0, y: 2.2), and 350 floating embers */}
      <ArenaLightingEnvironment
        isMobile={isMobile}
        godLightIntensity={godLightIntensity}
      />

      {/* 2. Outer industrial vat cauldron + inner elevated wooden platform (r: 1.8m, h: 0.2m) */}
      <DaturaCauldron />

      {/* 3. 8,000 procedural crowd instances packed tightly into R_in: 2.2m to R_out: 12.0m */}
      <CrowdInstancedSimulation isMobile={isMobile} />

      {/* 4. High-Fidelity Extruded SVG Silhouette with GSAP Shoulder Pivot Joint */}
      <CinematicSilhouette
        ref={silhouetteRef}
        isHovered={isActorHovered}
        onHoverChange={setIsActorHovered}
        onClick={handleActorClick}
        isMobile={isMobile}
      />

      {/* 5. Diegetic UI: Industrial Event Card physically suspended above the table */}
      <HeroEventPedestalCard
        position={[0, 2.5, -1.5]}
        isMobile={isMobile}
      />

      {/* 6. Post-Processing Stack: Blinding Bloom, Vignette, and Subtle DepthOfField */}
      <EffectComposer multisampling={0} enableNormalPass={false}>
        {/* Blinding Bloom Pass: Bleeds the God Light over the edges of the silhouette */}
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.1}
        />
        {/* Vignette: Focuses viewer's eye strictly on the central backlit hero */}
        <Vignette darkness={0.65} offset={0.3} />
        {/* Subtle Depth-of-Field: Softens distant crowd boundaries without blurring hero */}
        {!isMobile && (
          <DepthOfField
            focusDistance={0.035}
            focalLength={0.05}
            bokehScale={2.5}
            height={480}
          />
        )}
      </EffectComposer>
    </>
  );
}

const subscribeResize = (callback: () => void) => {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};

const getIsMobileSnapshot = () => {
  return (
    window.innerWidth <= 768 ||
    window.matchMedia("(hover: none)").matches
  );
};

/**
 * EventsArenaCanvas:
 * Master WebGL canvas wrapper, pinned scroll crane, and cinematic blowout transition.
 */
export function EventsArenaCanvas() {
  const router = useRouter();
  const { locale } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useSyncExternalStore(
    subscribeResize,
    getIsMobileSnapshot,
    () => false
  );
  const [isNearGround, setIsNearGround] = useState(false);
  const scrollProgressRef = useRef(0);

  const handleProgress = React.useCallback((progress: number) => {
    scrollProgressRef.current = progress;
    const reached = progress >= 0.85;
    setIsNearGround((prev) => (prev !== reached ? reached : prev));
  }, []);

  // Transition & God Light Blowout state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [godLightIntensity, setGodLightIntensity] = useState(200);
  const [blowoutOpacity, setBlowoutOpacity] = useState(0);

  // Trigger cinematic push-through transition
  const handleTriggerTransition = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // 1. Spike God Light intensity from 1500 up to 12000 over 700ms
    const startIntensity = 200;
    const targetIntensity = 1500;
    const startTime = performance.now();
    const duration = 750;

    const animateLight = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const easeProgress = Math.pow(progress, 3); // Exponential ramp
      setGodLightIntensity(
        startIntensity + (targetIntensity - startIntensity) * easeProgress
      );
      setBlowoutOpacity(Math.min(1.0, easeProgress * 1.3));

      if (progress < 1.0) {
        requestAnimationFrame(animateLight);
      }
    };
    requestAnimationFrame(animateLight);
  };

  const handleTransitionComplete = () => {
    router.push("/events/pattas-tappas-diwali-2026");
  };

  const scrollToGround = () => {
    if (scrollProgressRef.current >= 0.85) {
      handleTriggerTransition();
    } else {
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.scrollTo(3100, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 3100, behavior: "smooth" });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300vh] bg-[#080402] select-none text-left"
    >
      {/* 1. Fullscreen Pinned Three.js Canvas */}
      <div className="sticky top-0 w-full h-[100dvh] overflow-hidden">
        <Canvas
          dpr={[1, isMobile ? 1.5 : 2]}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            toneMappingExposure: 1.15,
          }}
        >
          <color attach="background" args={['#050200']} />
          <fogExp2 attach="fog" args={["#1A0F05", 0.04]} />
          <ArenaScene
            containerRef={containerRef}
            isMobile={isMobile}
            isTransitioning={isTransitioning}
            godLightIntensity={godLightIntensity}
            onTriggerTransition={handleTriggerTransition}
            onTransitionComplete={handleTransitionComplete}
            onProgress={handleProgress}
          />
        </Canvas>
      </div>


      {/* 3. Bottom HUD Status & Quick Action Controls */}
      <div className="absolute bottom-6 sm:bottom-8 left-4 right-20 sm:left-8 sm:right-52 z-20 flex items-center justify-between pointer-events-auto">
        {/* Left Status Pill */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#0e0703]/90 border border-[#92400e]/70 text-[11px] font-mono text-amber-300/90 backdrop-blur-md shadow-[4px_4px_0px_#080402]">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
          <span>
            {locale === "ta"
              ? "கீழே உருட்டவும் · கதாநாயகனைத் தொடவும்"
              : "Scroll down to descend · Hover character to aim · Click to enter"}
          </span>
        </div>

        {/* Right Jump / Explore Button */}
        <button
          type="button"
          onClick={scrollToGround}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-[#1c0c04]/90 hover:bg-[#2b1406] border border-[#F59E0B] text-[#F59E0B] text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md transition-all shadow-[4px_4px_0px_#92400e] cursor-pointer"
        >
          <span>
            {isNearGround
              ? locale === "ta"
                ? "அரங்கிற்குள் நுழைக"
                : "Enter Flagship Event"
              : locale === "ta"
              ? "மேடைக்குச் செல்லவும்"
              : "Descend to Platform"}
          </span>
          {isNearGround ? (
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] animate-spin" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          )}
        </button>
      </div>

      {/* 4. Fullscreen Amber/White Blowout Flash Overlay on Z-Axis Transition */}
      <div
        className="fixed inset-0 z-50 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: blowoutOpacity,
          background:
            "radial-gradient(circle at 50% 50%, #FFFDF0 0%, #FFB703 40%, #D97706 70%, #140A03 100%)",
        }}
      />
    </div>
  );
}
