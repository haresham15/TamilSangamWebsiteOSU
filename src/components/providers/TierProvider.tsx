"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Tier = "A" | "B" | "C";

interface TierContextValue {
  tier: Tier;
  isLite: boolean;
  isInAppBrowser: boolean;
  setTier: (tier: Tier) => void;
}

const TierContext = createContext<TierContextValue>({
  tier: "A",
  isLite: false,
  isInAppBrowser: false,
  setTier: () => {},
});

export const useTier = () => useContext(TierContext).tier;
export const useTierContext = () => useContext(TierContext);

export function TierProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTierState] = useState<Tier>("A");
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const frameId = requestAnimationFrame(() => {
      const ua = navigator.userAgent || "";
      // Detect Instagram, TikTok, Facebook in-app webviews (§2)
      const inApp = /Instagram|FBAN|FBAV|musical_ly|BytedanceWebview|TikTok/i.test(ua);
      setIsInAppBrowser(inApp);

      // Reduced motion or Save-Data preference
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      const saveData = connection?.saveData;

      // Check manual override
      const saved = localStorage.getItem("sangam_tier");
      if (saved === "A" || saved === "B" || saved === "C") {
        setTierState(saved as Tier);
        return;
      }

      if (prefersReducedMotion || saveData) {
        setTierState("C");
      } else if (inApp) {
        setTierState("B");
      } else {
        // Check WebGL2 availability
        try {
          const canvas = document.createElement("canvas");
          const gl2 = canvas.getContext("webgl2");
          if (!gl2) {
            setTierState("C");
            return;
          }
        } catch {
          setTierState("C");
          return;
        }
        setTierState("A");
      }
    });

    // Context loss handler switch to Tier C
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn("[TierProvider] WebGL Context Lost - degrading to Tier C (Lite)");
      setTierState("C");
    };

    window.addEventListener("webglcontextlost", handleContextLost);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("webglcontextlost", handleContextLost);
    };
  }, []);

  const setTier = useCallback((newTier: Tier) => {
    setTierState(newTier);
    if (typeof window !== "undefined") {
      localStorage.setItem("sangam_tier", newTier);
    }
  }, []);

  const isLite = tier === "C";

  return (
    <TierContext.Provider value={{ tier, isLite, isInAppBrowser, setTier }}>
      {children}
    </TierContext.Provider>
  );
}
