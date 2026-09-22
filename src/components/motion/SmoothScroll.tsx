"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLiteMode } from "@/context/LiteModeContext";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { isLiteMode } = useLiteMode();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect lite mode and reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isLiteMode || prefersReducedMotion) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis with friction parameters mandated in PRD
    const lenis = new Lenis({
      lerp: 0.05,
      smoothWheel: true,
      syncTouch: false, // Don't fight native iOS/Android momentum scrolling (Phase 6 mandate)
      autoRaf: false,
    });
    lenisRef.current = lenis;
    if (typeof window !== "undefined") {
      (window as any).__lenis = lenis;
    }

    // Sync ScrollTrigger with Lenis scroll
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis tick via GSAP ticker for synchronized 60fps frame updates
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    // Smooth recovery if frames drop during asset load or heavy GPU shaders
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== "undefined") {
        delete (window as any).__lenis;
      }
    };
  }, [isLiteMode]);

  return <>{children}</>;
}
