"use client";
/* eslint-disable react-compiler/react-compiler */

import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useLocale } from "@/context/LocaleContext";
import { CampusGate } from "./CampusGate";
import { GateLettering } from "./GateLettering";
import { IvyField } from "./IvyField";
import { ShadowLatticeDecal } from "./ShadowLatticeDecal";
import { MorningVolumetrics } from "./MorningVolumetrics";
import { LeafDrift } from "./LeafDrift";
import { CraneCameraRig } from "./CraneCameraRig";
import { WhiteoutFinale } from "./WhiteoutFinale";
import { createBespokeEnvironmentTexture } from "@/components/shared/createCustomEnvironment";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function JoinHeroCanvas() {
  const { locale } = useLocale();

  const pinWrapperRef = useRef<HTMLDivElement>(null);

  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Synchronized scroll kinematics
  const scrollProgressRef = useRef(0);
  const gateProgressRef = useRef(0);

  // Bespoke scene-matched environment map (§1.1b PRD Mandate)
  const bespokeEnv = React.useMemo(() => createBespokeEnvironmentTexture("dawn-nanban"), []);
  useEffect(() => {
    return () => {
      bespokeEnv?.dispose();
    };
  }, [bespokeEnv]);

  // Listen to prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
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
        scrub: 0.8,
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
      } overflow-hidden bg-[#050201]`}
      style={{ minHeight: "100dvh" }}
    >
      {/* ================================================================= */}
      {/* 1. PERSISTENT SKIP LINK & RUNNING HEADER CONSOLE (p=0 to p=1)      */}
      {/* ================================================================= */}
      <div className="absolute top-20 sm:top-24 left-0 right-0 z-30 px-3 sm:px-6 pointer-events-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 pointer-events-auto">
          {/* Live Gateway Emblem */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#140b08]/85 border border-amber-500/30 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md shrink min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#55CCA2] animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-amber-200 truncate">
              {locale === "ta" ? "நண்பன் வாயில் · 2026–2027" : "Nanban Campus Arch · 2026–2027"}
            </span>
          </div>

          {/* Persistent Conversion "Join Now ↓" Skip Link */}
          <a
            id="hero-skip-link"
            href="#membership-form"
            onClick={handleSkipToForm}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#55CCA2] text-[#050201] text-xs font-mono font-bold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(85,204,162,0.35)] hover:bg-[#6ee7b7] active:translate-x-0.5 active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white transition-all cursor-pointer shrink-0 min-h-[44px]"
          >
            <span>{locale === "ta" ? "இப்போதே இணையுங்கள் ↓" : "Join Now ↓"}</span>
            <span className="text-[10px] opacity-75 font-body hidden md:inline">
              {locale === "ta" ? "(படிவம்)" : "(Skip intro)"}
            </span>
          </a>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. R3F 3D VIEWPORT WITH PBR ENVIRONMENT, GATES & POST-PROCESSING   */}
      {/* ================================================================= */}
      <div className="relative w-full h-full">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 2.4, 12.2], fov: 44 }}
          frameloop={inView ? "always" : "demand"}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15,
          }}
          shadows={{ type: THREE.PCFShadowMap }}
        >
          {/* Dawn atmospheric sky background */}
          <color attach="background" args={["#0c0705"]} />
          {/* Volumetric distance fog */}
          <fogExp2 attach="fog" args={["#160e0b", 0.022]} />

          {/* Bespoke Scene-Matched Dawn Environment Map (§1.1b PRD Mandate) */}
          {bespokeEnv && <Environment map={bespokeEnv} background={false} />}

          {/* The Golden Hour Sun with High-Res Soft PCF Shadows */}
          <directionalLight
            position={[10, 15, 10]}
            intensity={2.8}
            color="#FFF8E7"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-12}
            shadow-camera-right={12}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
            shadow-camera-near={0.5}
            shadow-camera-far={45}
            shadow-bias={-0.0001}
          />

          {/* Back Sunrise Rim Light beaming through the iron filigree from behind */}
          <directionalLight
            position={[0, 6, -9]}
            intensity={3.2}
            color="#FFAF5E"
          />

          {/* Secondary ambient fill */}
          <directionalLight
            position={[-8, 6, -8]}
            intensity={0.4}
            color="#ffaa66"
          />

          {/* Overhead Pillar Lantern Glows */}
          <pointLight position={[-3.85, 5.6, 0.4]} intensity={2.0} color="#FFB566" distance={9} decay={2} />
          <pointLight position={[3.85, 5.6, 0.4]} intensity={2.0} color="#FFB566" distance={9} decay={2} />

          {/* Scroll-driven Crane Camera Kinematics */}
          <CraneCameraRig scrollProgressRef={scrollProgressRef} />

          <Suspense fallback={null}>
            {/* Stone Walkway & Dynamic Gate Shadow Lattice */}
            <ShadowLatticeDecal gateProgressRef={gateProgressRef} />

            {/* Collegiate Brick Pillars & Swinging Lattice Leaves (PBR Materials & Bump Maps) */}
            <CampusGate gateProgressRef={gateProgressRef} />

            {/* Parametric "TAMIL SANGAM" Bronze Arch Lettering */}
            <GateLettering />

            {/* Clustered Ivy Vines climbing Pillars */}
            <IvyField />

            {/* Volumetric Morning Sunbeams pouring through Gateway */}
            <MorningVolumetrics gateProgressRef={gateProgressRef} />

            {/* 120 Drifting Autumn Campus Leaves */}
            <LeafDrift count={120} />

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

      {/* Scroll Indicator Prompt (fades on scroll) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-1.5 opacity-80 text-center">
        <span className="text-[11px] font-mono uppercase tracking-widest text-amber-200 bg-[#160e0a]/80 px-3 py-1 border border-amber-500/30 rounded-full font-medium shadow-sm backdrop-blur-sm">
          {locale === "ta" ? "வாயில் வழியாக நுழைய கீழே உருட்டவும்" : "Scroll to step through the gates"}
        </span>
        <span className="text-xs text-amber-300 animate-bounce">↓</span>
      </div>
    </div>
  );
}
