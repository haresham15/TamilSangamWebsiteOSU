"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLiteMode } from "@/context/LiteModeContext";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { isLiteMode } = useLiteMode();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect lite mode and reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isLiteMode || prefersReducedMotion) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis with responsive friction parameters (lerp: 0.1 for crisp, butter-smooth feel)
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.0,
      smoothWheel: true,
      syncTouch: false, // Don't fight native touch momentum scrolling (Phase 6 mandate)
      autoRaf: false,
    });
    lenisRef.current = lenis;
    if (typeof window !== "undefined") {
      window.__lenis = lenis;
    }

    // Sync ScrollTrigger with Lenis scroll
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis tick via GSAP ticker for synchronized 60fps frame updates
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    // Crucial: lagSmoothing(0) ensures GSAP ticker delta adjustments do not cause Lenis jumps or stutter
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== "undefined") {
        delete window.__lenis;
      }
    };
  }, [isLiteMode]);

  // Route change handler: reset scroll position, resize Lenis, and refresh ScrollTrigger
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      lenisRef.current.resize();
    } else {
      window.scrollTo(0, 0);
    }

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
      if (lenisRef.current) {
        lenisRef.current.resize();
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [pathname]);

  return <>{children}</>;
}
