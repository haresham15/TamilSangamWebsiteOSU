"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SceneRoot } from "./SceneRoot";
import { HeroOverlay } from "./HeroOverlay";
import { setGalleryScrollTelemetry } from "./galleryStore";
import { HERO_CONSTANTS, getHeroTimelineValues } from "./heroTimeline";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { HeroMemory } from "@/data/gallery-hero";

interface GalleryHeroCanvasProps {
  onFinaleComplete?: () => void;
  onSelectMemory?: (memory: HeroMemory) => void;
}

export function GalleryHeroCanvas({ onFinaleComplete, onSelectMemory }: GalleryHeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);

  const [inView, setInView] = useState(true);
  const [reducedMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  // 1. IntersectionObserver to pause WebGL rendering when hero leaves viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.02 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Master GSAP ScrollTrigger timeline across 600vh with pin: true
  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=3600", // ~500vh scroll runway
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: HERO_CONSTANTS.scrubDamping,
        onUpdate: (self) => {
          const p = self.progress;
          const v = self.getVelocity();
          setGalleryScrollTelemetry(p, v);

          const timeline = getHeroTimelineValues(p);

          // Finale Warm Ivory Wash Ramp (p ∈ [0.80, 0.94])
          if (washRef.current) {
            washRef.current.style.opacity = String(timeline.washOpacity);
          }
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
  }, [reducedMotion, onFinaleComplete]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100svh] overflow-hidden bg-[#FFFDF8]"
      style={{
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
      }}
    >
      {/* WebGL Canvas with alpha: true */}
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        <SceneRoot onSelect={onSelectMemory} />
      </Canvas>

      {/* Bottom overlay gradient blending agent */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#FFFDF8] via-[#FFFDF8]/80 to-transparent pointer-events-none z-10" />

      {/* Diegetic Bilingual Overlay UI */}
      <HeroOverlay />

      {/* Finale Golden-Ivory Washout Overlay */}
      <div
        ref={washRef}
        className="absolute inset-0 bg-[#fff4d6] pointer-events-none z-30 transition-opacity duration-150"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
