"use client";
/* eslint-disable react-compiler/react-compiler */

import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { CampusGate } from "./CampusGate";
import { GateLettering } from "./GateLettering";
import { IvyField } from "./IvyField";
import { ShadowLatticeDecal } from "./ShadowLatticeDecal";
import { MorningVolumetrics } from "./MorningVolumetrics";
import { LeafDrift } from "./LeafDrift";
import { CraneCameraRig } from "./CraneCameraRig";
import { WhiteoutFinale } from "./WhiteoutFinale";
import { BottomFadeOverlay } from "@/components/shared/BottomFadeOverlay";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function JoinHeroCanvas() {
  const { locale } = useLocale();
  const { playClick } = useAudio();

  const pinWrapperRef = useRef<HTMLDivElement>(null);

  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Synchronized scroll kinematics
  const scrollProgressRef = useRef(0);
  const gateProgressRef = useRef(0);

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

  // GSAP ScrollTrigger 120vh Pinning Timeline (§0 PRD Mandate: max 120vh pin length)
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
        end: "+=120%",
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          scrollProgressRef.current = p;

          // Gate swing kinematics:
          // Closed from p = 0 to 0.18
          // Smoothly swings open from p = 0.18 to 0.72
          // Fully open (1.0) by p = 0.75, giving 15% clearance margin before p = 0.90 threshold pass
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
    playClick();
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
      } overflow-hidden bg-[#0c0806]`}
      style={{ minHeight: "100dvh" }}
    >
      {/* ================================================================= */}
      {/* 1. PERSISTENT SKIP LINK & RUNNING HEADER CONSOLE (p=0 to p=1)      */}
      {/* ================================================================= */}
      <div className="absolute top-20 sm:top-24 left-0 right-0 z-30 px-3 sm:px-6 pointer-events-none">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 pointer-events-auto">
            {/* Live Gateway Emblem */}
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#140b08]/90 border border-[#55CCA2]/60 shadow-[2px_2px_0px_#250d38] backdrop-blur-md shrink min-w-0">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#55CCA2] animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#FDF4DC] truncate">
                {locale === "ta" ? "நண்பன் வாயில் · 2026–2027" : "Nanban Arch · 2026–2027"}
              </span>
            </div>

            {/* Persistent Conversion "Join Now ↓" Skip Link */}
            <a
              id="hero-skip-link"
              href="#membership-form"
              onClick={handleSkipToForm}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-[#55CCA2] text-[#160d26] text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_#250d38] hover:bg-[#6ee7b7] active:translate-x-0.5 active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white transition-all cursor-pointer shrink-0 min-h-[44px]"
            >
              <span>{locale === "ta" ? "இப்போதே இணையுங்கள் ↓" : "Join Now ↓"}</span>
              <span className="text-[10px] opacity-75 font-body hidden md:inline">
                {locale === "ta" ? "(படிவம்)" : "(Skip)"}
              </span>
            </a>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. R3F 3D VIEWPORT WITH CAMPUS ARCH, GATES & MORNING FLARE        */}
        {/* ================================================================= */}
        <div className="relative w-full h-full">
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 2.4, 12.2], fov: 44 }}
            frameloop={inView ? "always" : "demand"}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              toneMappingExposure: 1.35,
            }}
            shadows={{ type: THREE.PCFShadowMap }}
          >
            {/* Dawn atmospheric sky background */}
            <color attach="background" args={["#1c0f0a"]} />
            {/* Atmospheric distance fog */}
            <fogExp2 attach="fog" args={["#1f100a", 0.018]} />

            {/* Front Morning Key Sunlight illuminating the front ironwork and brick */}
            <directionalLight
              position={[4, 7, 11]}
              intensity={4.8}
              color="#FFF6E5"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />

            {/* Back Sunrise Rim Light beaming through the iron filigree from behind */}
            <directionalLight
              position={[0, 6, -9]}
              intensity={4.2}
              color="#FFAF5E"
            />

            {/* Ambient Morning Fill */}
            <ambientLight intensity={2.0} color="#5a3d2e" />

            {/* Overhead Pillar Lantern Glows */}
            <pointLight position={[-3.85, 5.6, 0.4]} intensity={2.5} color="#FFB566" distance={9} decay={2} />
            <pointLight position={[3.85, 5.6, 0.4]} intensity={2.5} color="#FFB566" distance={9} decay={2} />
            {/* Walkway Ground Bounce */}
            <pointLight position={[0, 0.5, 4]} intensity={1.2} color="#D6A56E" distance={10} decay={2} />

            {/* Scroll-driven Crane Camera Kinematics */}
            <CraneCameraRig scrollProgressRef={scrollProgressRef} />

            <Suspense fallback={null}>
              {/* Stone Walkway & Dynamic Gate Shadow Lattice */}
              <ShadowLatticeDecal gateProgressRef={gateProgressRef} />

              {/* Collegiate Brick Pillars & Swinging Lattice Leaves */}
              <CampusGate gateProgressRef={gateProgressRef} />

              {/* Parametric "TAMIL SANGAM" Bronze Arch Lettering */}
              <GateLettering />

              {/* Clustered Ivy Vines climbing Pillars */}
              <IvyField />

              {/* Volumetric Morning Sunbeams pouring through Gateway */}
              <MorningVolumetrics gateProgressRef={gateProgressRef} />

              {/* 120 Drifting Autumn Campus Leaves */}
              <LeafDrift count={120} />

              {/* Finale Sunrise Bloom into #FFF3DC */}
              <WhiteoutFinale scrollProgressRef={scrollProgressRef} />
            </Suspense>
          </Canvas>

          {/* =============================================================== */}
          {/* 3. SITE-WIDE BOTTOM FADE OVERLAY (Part 1 of Hero Transition)     */}
          {/* =============================================================== */}
          <BottomFadeOverlay heightPct={16} fadeColor="#FFF3DC" />
        </div>

        {/* Scroll Indicator Prompt (fades on scroll) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-1.5 opacity-80 text-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#2d1c14] bg-[#FFF3DC]/90 px-3 py-1 border border-[#2d1c14]/30 font-bold shadow-sm">
            {locale === "ta" ? "வாயில் திறக்க கீழே உருட்டவும்" : "Scroll to open campus gates"}
          </span>
          <span className="text-xs text-[#2d1c14] animate-bounce">↓</span>
        </div>
      </div>
  );
}
