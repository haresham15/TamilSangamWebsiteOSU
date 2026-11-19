"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PerspectiveCamera, Environment } from "@react-three/drei";
import { SceneView as View } from "@/components/canvas/SceneView";
import { CraneCameraRig } from "./CraneCameraRig";
import { CorridorTreadmill } from "./CorridorTreadmill";
import { EmblemFinale } from "./EmblemFinale";
import { useBoardHeroStore } from "@/store/boardHeroStore";
import { CholaCrown3D } from "./CholaCrown3D";
import { CholaCrownArt } from "./CholaCrownArt";
import { DustMotes, HazeLayer } from "@/gl/art/Atmosphere";
import { Terminal } from "lucide-react";
import { createBespokeEnvironmentTexture } from "@/components/shared/createCustomEnvironment";
import { useWarmup } from "@/components/gl/useWarmup";

import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { useRenderMode } from "@/components/providers/useRenderMode";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function BoardSceneWarmup() {
  useWarmup("board-corridor");
  return null;
}

interface BoardHeroCanvasProps {
  onFinaleComplete?: () => void;
  bezel?: React.ReactNode;
}

export function BoardHeroCanvas({ onFinaleComplete, bezel }: BoardHeroCanvasProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const goldOverlayRef = useRef<HTMLDivElement>(null);
  const [isCinematic] = useState(() => isHeroCinematicEnabled("board"));
  // One quality source; Tier C / Lite / reduced motion render the static poster (no canvas).
  const { mode, qualityLevel } = useRenderMode();
  const reducedMotion = mode === "static";

  // Bespoke scene-matched environment reflections (§1.1b PRD Mandate)
  const bespokeEnv = React.useMemo(() => createBespokeEnvironmentTexture("chola-darbar"), []);
  useEffect(() => {
    return () => {
      bespokeEnv?.dispose();
    };
  }, [bespokeEnv]);
  const [debugActive] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("debug") === "1";
    }
    return false;
  });
  const localProgress = useRef(reducedMotion ? 1.0 : 0);


  // Sync debugMode (frame requests + offscreen culling are owned by SceneView).
  useEffect(() => {
    useBoardHeroStore.getState().setDebugMode(debugActive);
    return () => useBoardHeroStore.getState().setDebugMode(false);
  }, [debugActive]);

  // §6: GSAP ScrollTrigger Pinned Timeline (Pins sectionRef with +=1600 scroll distance)
  useEffect(() => {
    if (reducedMotion || !sectionRef.current) {
      if (reducedMotion) localProgress.current = 1;
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=1600",
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          localProgress.current = p;
          if (debugActive) useBoardHeroStore.getState().setScrollProgress(p);

          // If user scrolls back up into corridor, smoothly restore canvas opacity & reset gold flash
          if (p < 0.96) {
            if (goldOverlayRef.current) {
              gsap.killTweensOf(goldOverlayRef.current);
              gsap.to(goldOverlayRef.current, { opacity: 0, duration: 0.2, overwrite: "auto" });
            }
            if (canvasContainerRef.current) {
              gsap.killTweensOf(canvasContainerRef.current);
              gsap.to(canvasContainerRef.current, { opacity: 1, duration: 0.2, overwrite: "auto" });
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
  }, [reducedMotion, debugActive]);

  // Handle Finale
  const handleFinaleTriggered = () => {
    if (onFinaleComplete) {
      onFinaleComplete();
    }
  };

  return (
    <div
      ref={sectionRef}
      className={`relative w-full ${
        reducedMotion ? "h-[85dvh]" : "h-[100dvh]"
      } overflow-hidden bg-transparent flex flex-col justify-between`}
      style={{ minHeight: "100dvh" }}
    >
      <div
        ref={canvasContainerRef}
        className="relative w-full h-full flex flex-col justify-between"
      >
        {/* ========================================================================= */}
        {/* R3F 3D VIEWPORT WITH PHYSICAL CAMERA & ATMOSPHERE (Clean Cinematic Scene) */}
        {/* ========================================================================= */}
        <div className="relative flex-1 w-full h-full">
          {reducedMotion ? (
            // PRD §5: reduced motion = static throne-room snapshot at the crown reveal.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/board/board-hero-poster.webp"
              alt="Chola Darbar (சோழர் அவை): a lamp-lit granite colonnade hung with silk banners of the executive committee, a jewelled gold Chola crown on a lotus pedestal in the foreground"
              className="absolute inset-0 h-full w-full object-cover"
              width={1600}
              height={900}
              decoding="async"
            />
          ) : (
          <View
            className="w-full h-full pointer-events-auto"
            index={2}
            grade={{ hero: "board", profile: "darbar-torch" }}
          >
            <BoardSceneWarmup />
            <PerspectiveCamera makeDefault position={[0, 2.22, 30]} fov={32} near={0.05} far={100} />
            <color attach="background" args={["#120A06"]} />
            {/* World-Space FogExp2 per §2 & §5 Table */}
            <fogExp2 attach="fog" args={["#1C120A", 0.045]} />

            {/* Bespoke Scene-Matched Chola Darbar Environment Map */}
            {bespokeEnv && <Environment map={bespokeEnv} background={false} />}

            {isCinematic ? (
              <>
                {/* Light hierarchy: lamp pools (fake + two real lights, CorridorTreadmill) are the
                    key; a faint cool fill keeps the shadows from going flat black; one warm spot
                    from above picks out the crown; the crown adds its own rim at the reveal. */}
                <hemisphereLight args={["#6a6496", "#4a2c18", 0.42]} userData={{ gradeRole: "fill" }} />
                <spotLight
                  position={[0.5, 6.2, 25.4]}
                  target-position={[0, 0.55, 23.5]}
                  angle={0.2}
                  penumbra={0.7}
                  intensity={30}
                  color="#ffc890"
                  castShadow
                  shadow-mapSize-width={512}
                  shadow-mapSize-height={512}
                  shadow-bias={-0.0002}
                  shadow-normalBias={0.02}
                  userData={{ gradeRole: "key" }}
                />
                {/* Air: haze sheets at three depths separate the colonnade into planes. */}
                <HazeLayer position={[0, 1.3, 21.5]} size={[5, 3]} color="#c98a52" intensity={0.05} />
                <HazeLayer position={[0, 1.6, 15]} size={[7, 4]} color="#c08850" intensity={0.055} />
                <HazeLayer position={[0, 1.8, 10]} size={[7, 4.4]} color="#c08850" intensity={0.06} />
                <HazeLayer position={[0, 1.9, 6.5]} size={[7, 4.8]} color="#d0925a" intensity={0.07} />
                <HazeLayer position={[0, 2.0, 4.2]} size={[7, 5]} color="#e0a060" intensity={0.075} />
                <HazeLayer position={[0, 2.2, 1.6]} size={[6, 4.4]} color="#ffb870" intensity={0.05} />
                <DustMotes
                  position={[0, 2.0, 15]}
                  size={[3.6, 3.6, 30]}
                  count={qualityLevel === 0 && mode === "A" ? 520 : 260}
                  color="#ffd2a0"
                  intensity={0.5}
                  pointSize={30}
                  drift={[0.01, 0.02, 0.0]}
                />
                {/* Embers: fewer, larger, warmer, rising from the lamps' height. */}
                <DustMotes
                  position={[0, 2.2, 15]}
                  size={[3.4, 3.2, 30]}
                  count={qualityLevel === 0 && mode === "A" ? 140 : 70}
                  color="#ffb066"
                  intensity={0.75}
                  pointSize={34}
                  drift={[0.0, 0.11, 0.0]}
                  seed={21}
                />
              </>
            ) : (
              <>
                <ambientLight intensity={0.45} color="#40281b" />
                <directionalLight
                  position={[0, 8, 10]}
                  intensity={1.2}
                  color="#A6F0CF"
                  castShadow
                  shadow-mapSize-width={512}
                  shadow-mapSize-height={512}
                />
              </>
            )}

            {/* Shadows update every frame: the instanced colonnade makes the shadow pass a
                handful of draws, and the swaying tapestries need live shadows (BakeShadows
                froze them). */}

            {/* Crane Camera Rig with spring-lag inertia (§6) */}
            <CraneCameraRig scrollProgress={localProgress} reducedMotion={reducedMotion} />

            {/* Floating Imperial Chola Crown placed lower near stone floor so camera glides above it (z = 23.5) */}
            {isCinematic ? (
              <CholaCrownArt position={[0, 0.65, 23.5]} scale={0.88} />
            ) : (
              <CholaCrown3D position={[0, 0.65, 23.5]} scale={0.88} />
            )}

            {/* 3D Modular Corridor Treadmill (§3) */}
            <Suspense fallback={null}>
              <CorridorTreadmill />
            </Suspense>

            {/* Chola Imperial Tiger Emblem Finale at z = 0 (§7) */}
            <EmblemFinale
              scrollProgress={localProgress}
              onFinaleTriggered={handleFinaleTriggered}
            />
          </View>
          )}

          {/* Optical Post-Processing: CSS Vignette Overlay (§1, Spike S3) */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(20,10,5,0.45)_100%)]" />

          {/* Bottom Vignette Gradient to dissolve floor into DOM */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#120A06] via-[#120A06]/35 to-transparent z-10" />
        </div>

        {/* ========================================================================= */}
        {/* 3. ?debug=1 ENGINEERING HUD (§9 Verification)                             */}
        {/* ========================================================================= */}
        {debugActive && <BoardDiagnostics />}

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
      <div className="absolute inset-x-0 bottom-0 z-20">{bezel}</div>
    </div>
  );
}

function BoardDiagnostics() {
  // Store diagnostics for ?debug=1 HUD
  const scrollProgress = useBoardHeroStore((s) => s.scrollProgress);
  const cameraZ = useBoardHeroStore((s) => s.cameraZ);
  const fogDensity = useBoardHeroStore((s) => s.fogDensity);
  const recycledCount = useBoardHeroStore((s) => s.recycledCount);
  const activeRealLights = useBoardHeroStore((s) => s.activeRealLights);
  const finaleFired = useBoardHeroStore((s) => s.finaleFired);
  const fps = useBoardHeroStore((s) => s.fps);

  return (
  <div className="absolute top-24 left-6 z-30 p-3 rounded-none bg-[#140b06]/92 border border-[#A6F0CF]/35 backdrop-blur-md font-mono text-[11px] text-[#fef3c7] shadow-[4px_4px_0px_#250d38] flex flex-col gap-1.5 pointer-events-none">
    <div className="flex items-center gap-2 pb-1 border-b border-[#3d2714] text-[#A6F0CF] font-bold">
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
  );
}
