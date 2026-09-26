"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLiteMode } from "@/context/LiteModeContext";

interface SmoothScrollContextValue {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

let activeLenis: Lenis | null = null;
const lenisListeners = new Set<() => void>();
export const subscribeLenis = (cb: () => void) => {
  lenisListeners.add(cb);
  return () => lenisListeners.delete(cb);
};
export const getLenisSnapshot = () => activeLenis;

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { isLiteMode } = useLiteMode();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  const lenisInstance = React.useSyncExternalStore(
    subscribeLenis,
    getLenisSnapshot,
    () => null
  );

  useEffect(() => {
    // Respect lite mode and reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isLiteMode || prefersReducedMotion) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis with high-performance responsive deceleration
    const lenis = new Lenis({
      duration: 0.82,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: false, // Don't fight native touch momentum scrolling (Phase 6 mandate)
      touchMultiplier: 1.25,
      wheelMultiplier: 1.15,
      autoRaf: false,
    });

    lenisRef.current = lenis;
    activeLenis = lenis;
    lenisListeners.forEach((cb) => cb());

    if (typeof window !== "undefined") {
      window.__lenis = lenis;
    }

    // Sync ScrollTrigger with Lenis scroll
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis tick via GSAP ticker for synchronized 60-120fps frame updates
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    // Smooth frame delta spikes so micro-hiccups never cause violent scroll jumps
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      activeLenis = null;
      lenisListeners.forEach((cb) => cb());
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

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

