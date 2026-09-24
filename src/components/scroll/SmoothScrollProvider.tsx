"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SmoothScrollContextValue {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

let activeLenis: Lenis | null = null;
const lenisListeners = new Set<() => void>();
const subscribeLenis = (cb: () => void) => {
  lenisListeners.add(cb);
  return () => lenisListeners.delete(cb);
};
export const getLenisSnapshot = () => activeLenis;

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisInstance = React.useSyncExternalStore(
    subscribeLenis,
    getLenisSnapshot,
    () => null
  );

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis instance
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.0,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    });

    activeLenis = lenis;
    lenisListeners.forEach((cb) => cb());

    if (typeof window !== "undefined") {
      window.__lenis = lenis;
    }

    // Sync ScrollTrigger on Lenis scroll event
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis tick via GSAP ticker
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      activeLenis = null;
      lenisListeners.forEach((cb) => cb());
      if (typeof window !== "undefined") {
        delete window.__lenis;
      }
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
