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
  const [tier, setTierState] = useState<Tier>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sangam_tier");
        if (saved === "A" || saved === "B") return saved;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "C";
      } catch {}
    }
    return "A";
  });
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let contextLost = false;
    let webglAvailable: boolean | undefined;
    const selectTier = () => {
      const ua = navigator.userAgent || "";
      // Detect Instagram, TikTok, Facebook in-app webviews (§2)
      const inApp = /Instagram|FBAN|FBAV|musical_ly|BytedanceWebview|TikTok/i.test(ua);
      setIsInAppBrowser(inApp);

      // Reduced motion or Save-Data preference
      const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      const saveData = connection?.saveData;

      if (motionQuery.matches || saveData || contextLost) {
        setTierState("C");
        return;
      }

      // Probe once per mount; check WebGL2 support safely without emitting webglcontextlost
      if (webglAvailable === undefined) {
        try {
          const canvas = document.createElement("canvas");
          const gl2 = canvas.getContext("webgl2");
          webglAvailable = Boolean(gl2);
        } catch {
          webglAvailable = false;
        }
      }
      if (!webglAvailable) {
        setTierState("C");
        return;
      }

      // Check manual override
      const saved = localStorage.getItem("sangam_tier");
      if (saved === "A" || saved === "B") {
        setTierState(saved);
        return;
      }

      setTierState(inApp ? "B" : "A");
    };

    selectTier();
    motionQuery.addEventListener("change", selectTier);

    // Context loss handler switch to Tier C only for the active application canvas inside #gl-root
    const handleContextLost = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target || !target.closest?.("#gl-root")) {
        return;
      }
      e.preventDefault();
      contextLost = true;
      console.warn("[TierProvider] WebGL Context Lost on #gl-root - degrading to Tier C (Lite)");
      setTierState("C");
    };

    window.addEventListener("webglcontextlost", handleContextLost, true);
    return () => {
      motionQuery.removeEventListener("change", selectTier);
      window.removeEventListener("webglcontextlost", handleContextLost, true);
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
