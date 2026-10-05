"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTier } from "./TierProvider";
import { masterTick } from "@/engine/masterTick";

interface MotionContextValue {
  lenis: Lenis | null;
}

const MotionContext = createContext<MotionContextValue>({ lenis: null });

export const useLenis = () => useContext(MotionContext).lenis;

// Global ref for direct imperative access
let activeLenis: Lenis | null = null;
export const getActiveLenis = () => activeLenis;

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const tier = useTier();
  const pathname = usePathname();
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.history.scrollRestoration = "manual";
    gsap.registerPlugin(ScrollTrigger);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Tier C or reduced motion mounts NO Lenis (§2, §4.1)
    if (tier === "C" || reduce) {
      lenisRef.current = null;
      activeLenis = null;
      requestAnimationFrame(() => setLenisInstance(null));
      return;
    }

    // Initialize Lenis strictly without autoRaf (§4.1)
    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      syncTouch: false, // Keep native touch momentum scrolling on iOS and mobile
      anchors: true,
      allowNestedScroll: true,
    });

    lenisRef.current = lenis;
    activeLenis = lenis;
    requestAnimationFrame(() => setLenisInstance(lenis));
    window.__lenis = lenis;

    // Synchronize ScrollTrigger updates with Lenis scroll emissions (§4.1)
    lenis.on("scroll", ScrollTrigger.update);

    // Single master tick callback driving both Lenis and R3F (§4.1)
    const tick = (timeSec: number) => {
      masterTick(timeSec, lenis);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0); // Kept with delta clamp in masterTick (§0.6)

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      activeLenis = null;
      setLenisInstance(null);
      delete window.__lenis;
    };
  }, [tier]);

  // Route-change scroll reset, resize, and ScrollTrigger refresh (§4.4)
  useEffect(() => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }

    let isMounted = true;
    (async () => {
      if (typeof document !== "undefined" && document.fonts) {
        try {
          await document.fonts.ready;
        } catch {
          // ignore font load errors
        }
      }
      if (!isMounted) return;
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    })();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  return (
    <MotionContext.Provider value={{ lenis: lenisInstance }}>
      {children}
    </MotionContext.Provider>
  );
}
