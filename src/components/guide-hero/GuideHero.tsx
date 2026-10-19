"use client";

import React, { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useLiteMode } from "@/context/LiteModeContext";
import { useTier } from "@/components/providers/TierProvider";
import { useGuideStore } from "./store/guideStore";
import { GuideHeroPoster } from "./GuideHeroPoster";
import type { RankedFaq } from "@/lib/faq-engagement/contracts";
import { getGuideStationProgress } from "./station/useGuideStationTimeline";

const BoardView = dynamic(() => import("./BoardView"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0A0F14]" aria-hidden="true" />,
});

interface GuideHeroProps {
  id?: string;
  activeTitle?: string;
  isMoving?: boolean;
  showAtlasDebug?: boolean;
  initialPopularRanking?: RankedFaq[];
}

/**
 * Scroll-pinned station sequence with a semantic DOM title and a canvas-only atmosphere layer.
 * Sticky 100dvh viewport locked across 340vh desktop / 280vh mobile scroll runway (PRD §4 & §16).
 */
export function GuideHero({
  id = "guide-station-hero",
  activeTitle = "SANGAM JUNCTION · FAQ DEPARTURE BOARD",
  initialPopularRanking,
}: GuideHeroProps) {
  const { isLiteMode } = useLiteMode();
  const tier = useTier();
  const runwayRef = useRef<HTMLElement>(null);
  const stickyViewportRef = useRef<HTMLDivElement>(null);
  const handoffGradientRef = useRef<HTMLDivElement>(null);

  const [reduceMotion, setReduceMotion] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      } catch {}
    }
    return false;
  });
  const activeItem = useGuideStore((state) => state.activeItem);
  const source = useGuideStore((state) => state.source);
  const liveTitle = activeItem?.text || activeTitle;
  const isFallback = isLiteMode || tier === "C" || reduceMotion;

  useEffect(() => {
    let active = true;
    if (initialPopularRanking && initialPopularRanking.length > 0) {
      useGuideStore.getState().setPopularRanking(initialPopularRanking);
    }
    void fetch("/api/faq/popular")
      .then((response) => (response.ok ? response.json() : undefined))
      .then((payload: { ranked?: RankedFaq[] } | undefined) => {
        if (active && Array.isArray(payload?.ranked)) useGuideStore.getState().setPopularRanking(payload.ranked);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [initialPopularRanking]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const ctaRef = useRef<HTMLButtonElement>(null);

  // Fade out Skip CTA between p = 0.70 and 0.78
  useEffect(() => {
    let frameId: number;
    const checkHandoff = () => {
      const p = getGuideStationProgress();
      if (ctaRef.current) {
        const exit = Math.max(0, Math.min(1, (p - 0.70) / 0.08));
        ctaRef.current.style.opacity = String(1 - exit);
        ctaRef.current.style.transform = `translateY(${-16 * exit}px)`;
        ctaRef.current.style.pointerEvents = exit >= 1 ? "none" : "auto";
      }
      frameId = requestAnimationFrame(checkHandoff);
    };
    frameId = requestAnimationFrame(checkHandoff);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const element = runwayRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isPast = entry.boundingClientRect.top < 0 && entry.intersectionRatio < 0.2;
        useGuideStore.getState().setIsPastHero(isPast);
      },
      { threshold: [0, 0.2, 1] }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleSkipToBoard = useCallback(() => {
    const runway = runwayRef.current;
    if (!runway) return;
    // Scroll directly to board arrival (p = 0.90)
    const top = runway.offsetTop + (runway.offsetHeight - window.innerHeight) * 0.90;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const breakpoint = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => {
      if (typeof window === "undefined") return "lg";
      if (window.innerWidth < 640) return "sm";
      if (window.innerWidth < 1024) return "md";
      return "lg";
    },
    () => "lg"
  );

  const board = React.useMemo(() => {
    if (breakpoint === "sm") return { boardWidth: 14 * 0.7, boardHeight: 9 * 1.04, cols: 14, rows: 9 };
    if (breakpoint === "md") return { boardWidth: 24 * 0.7, boardHeight: 6 * 1.04, cols: 24, rows: 6 };
    return { boardWidth: 30 * 0.7, boardHeight: 5 * 1.04, cols: 30, rows: 5 };
  }, [breakpoint]);

  return (
    <section
      ref={runwayRef}
      id={id}
      aria-label="Sangam Junction Departure Board Introduction"
      className="relative w-full h-[340vh] max-md:h-[280vh] bg-transparent select-none"
      suppressHydrationWarning
    >
      {/* Sticky 100dvh viewport that stays locked for the entire 340vh runway */}
      <div
        ref={stickyViewportRef}
        className="sticky top-0 left-0 h-dvh w-full overflow-hidden bg-transparent"
      >
        <p aria-live="polite" className="sr-only">
          {source === "station" ? `Most asked: ${liveTitle}` : `Showing: ${liveTitle}`}
        </p>

        {/* Immediate Frame-0 Dark Blue-Hour Poster (Prevents white flash on load) */}
        <GuideHeroPoster
          fallback={isFallback}
          title={liveTitle}
          status={source === "station" ? "MOST ASKED" : "FAQ DEPARTURE"}
        />

        {/* Tracked 3D View scene */}
        {!isFallback && <BoardView sequenceElement={runwayRef} {...board} />}

        {/* Accessible Skip Intro Control (48x48px min target, visible on focus & dwell) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex justify-between items-end px-8">
          <button
            ref={ctaRef}
            type="button"
            onClick={handleSkipToBoard}
            className="pointer-events-auto min-h-12 px-5 py-2.5 rounded-full bg-[#0A0F14]/85 text-[#f1e9d2] border border-[#f1e9d2]/20 backdrop-blur-md text-xs uppercase tracking-widest hover:border-[#FFB84D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB84D] transition-transform will-change-[transform,opacity]"
          >
            Skip to Board ↓
          </button>
        </div>
      </div>
    </section>
  );
}

export default GuideHero;
