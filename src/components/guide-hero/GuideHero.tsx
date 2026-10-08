"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useLiteMode } from "@/context/LiteModeContext";
import { useTier } from "@/components/providers/TierProvider";
import { getActiveLenis } from "@/components/providers/MotionProvider";
import { AtlasDebugOverlay } from "./board/AtlasDebugOverlay";
import { useGuideStore } from "./store/guideStore";
import { GuideHeroPoster } from "./GuideHeroPoster";
import type { RankedFaq } from "@/lib/faq-engagement/contracts";

const BoardView = dynamic(() => import("./BoardView"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface-hero-guide" aria-hidden="true" />,
});

interface GuideHeroProps {
  id?: string;
  activeTitle?: string;
  isMoving?: boolean;
  showAtlasDebug?: boolean;
  initialPopularRanking?: RankedFaq[];
}

/** Scroll-pinned station sequence with a semantic DOM title and a canvas-only atmosphere layer. */
export function GuideHero({
  id = "guide-station-hero",
  activeTitle = "SANGAM JUNCTION · FAQ DEPARTURE BOARD",
  initialPopularRanking,
}: GuideHeroProps) {
  const { isLiteMode } = useLiteMode();
  const tier = useTier();
  const sectionRef = useRef<HTMLElement>(null);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [showSkip, setShowSkip] = React.useState(false);
  const activeItem = useGuideStore((state) => state.activeItem);
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

  useEffect(() => {
    if (isFallback) return;
    const timeout = window.setTimeout(() => setShowSkip(true), 2_000);
    return () => window.clearTimeout(timeout);
  }, [isFallback]);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isPast = entry.boundingClientRect.top < 0 && entry.intersectionRatio < 0.4;
        useGuideStore.getState().setIsPastHero(isPast);
      },
      { threshold: [0, 0.4, 1] }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const windowWidth = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => (typeof window !== "undefined" ? window.innerWidth : 1200),
    () => 1200
  );

  const board = React.useMemo(() => {
    if (windowWidth < 640) return { boardWidth: 14 * 0.7, boardHeight: 9 * 1.04, cols: 14, rows: 9 };
    if (windowWidth < 1024) return { boardWidth: 24 * 0.7, boardHeight: 6 * 1.04, cols: 24, rows: 6 };
    return { boardWidth: 30 * 0.7, boardHeight: 5 * 1.04, cols: 30, rows: 5 };
  }, [windowWidth]);

  const skipStationSequence = () => {
    const section = sectionRef.current;
    if (!section) return;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const target = section.getBoundingClientRect().top + window.scrollY + window.innerHeight * (mobile ? 2.8 : 3.4) * 0.92;
    const lenis = getActiveLenis();
    if (lenis) {
      lenis.scrollTo(target, { immediate: reduceMotion, duration: reduceMotion ? undefined : 0.65 });
    } else {
      window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  return (
    <section ref={sectionRef} id={id} aria-label="FAQ Departure Board" className={`relative w-full select-none bg-transparent ${isFallback ? "min-h-[100dvh]" : "min-h-[280dvh] md:min-h-[340dvh]"}`}>
      <div className="sticky top-0 h-[100dvh] min-h-[480px] overflow-hidden">
        <p aria-live="polite" className="sr-only">
          {useGuideStore.getState().source === "station" ? `Most asked: ${liveTitle}` : `Showing: ${liveTitle}`}
        </p>
        <div className="absolute inset-0 z-0 h-full w-full" aria-hidden="true">
          <GuideHeroPoster fallback={isFallback} title={liveTitle} status={useGuideStore.getState().source === "station" ? "MOST ASKED" : "FAQ DEPARTURE"} />
          {!isFallback && <BoardView sequenceElement={sectionRef} {...board} />}
        </div>
        <div className="guide-station-handoff pointer-events-none absolute inset-0 z-10 h-full w-full" />
        {!isFallback && <AtlasDebugOverlay />}
        {!isFallback && (
          <button type="button" onClick={skipStationSequence} className={`guide-station-skip absolute left-5 top-24 z-20 min-h-12 px-4 font-mono text-xs tracking-[0.14em] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${showSkip ? "guide-station-skip--visible" : ""}`}>
            Skip station sequence
          </button>
        )}
      </div>
    </section>
  );
}

export default GuideHero;
