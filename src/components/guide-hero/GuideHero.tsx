"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useLiteMode } from "@/context/LiteModeContext";

// Lazy-load BoardView without SSR (One Canvas, Drei View)
const BoardView = dynamic(() => import("./BoardView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#070504]">
      <div className="flex items-center gap-3 px-4 py-2 border border-[#55CCA2]/30 bg-[#160d20] text-xs font-mono text-[#55CCA2]">
        <span className="w-2 h-2 rounded-full bg-[#55CCA2] animate-pulse" />
        <span>CONNECTING TO SANGAM JUNCTION · PLATFORM 1...</span>
      </div>
    </div>
  ),
});

import { AtlasDebugOverlay } from "./board/AtlasDebugOverlay";
import { useGuideStore } from "./store/guideStore";

interface GuideHeroProps {
  id?: string;
  activeTitle?: string;
  isMoving?: boolean;
  showAtlasDebug?: boolean;
}

/**
 * GuideHero (PRD §3.3, §7, §8)
 * Full responsive hero container in 70svh with gradient overlay handoff to DOM,
 * accessible screen reader live region, and GSAP scroll recede choreography.
 */
export function GuideHero({
  id = "alaipayuthey-splitflap-hero",
  activeTitle = "SANGAM JUNCTION · FAQ DEPARTURE BOARD",
  isMoving = false,
}: GuideHeroProps) {
  const { isLiteMode } = useLiteMode();
  const sectionRef = useRef<HTMLElement>(null);

  // Active item from store for screen reader live announcements (PRD §1, §7)
  const activeItem = useGuideStore((s) => s.activeItem);
  const liveTitle = activeItem?.text || activeTitle;

  // Track scroll departure of hero section via observer to avoid per-scroll-tick React re-renders
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isPast = entry.boundingClientRect.top < 0 && entry.intersectionRatio < 0.4;
        useGuideStore.getState().setIsPastHero(isPast);
      },
      { threshold: [0, 0.4, 1.0] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Responsive grid configuration (PRD §6.3)
  const windowWidth = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => (typeof window !== "undefined" ? window.innerWidth : 1200),
    () => 1200
  );

  const { boardWidth, boardHeight, cols, rows } = React.useMemo(() => {
    if (windowWidth < 640) {
      // Phone: 14 cols x 9 rows (pitch 0.70 x 1.04)
      return { boardWidth: 14 * 0.7, boardHeight: 9 * 1.04, cols: 14, rows: 9 };
    }
    if (windowWidth < 1024) {
      // Tablet: 24 cols x 6 rows
      return { boardWidth: 24 * 0.7, boardHeight: 6 * 1.04, cols: 24, rows: 6 };
    }
    // Desktop: 30 cols x 5 rows
    return { boardWidth: 30 * 0.7, boardHeight: 5 * 1.04, cols: 30, rows: 5 };
  }, [windowWidth]);

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-label="FAQ Departure Board"
      className="relative w-full h-[70svh] min-h-[480px] max-h-[750px] bg-transparent overflow-hidden select-none"
    >
      {/* 1. Accessible Screen Reader Live Region (PRD §1, §7) */}
      <p aria-live="polite" className="sr-only">
        Showing: {liveTitle}
      </p>

      {/* 2. 3D WebGL Canvas Layer (aria-hidden by design) */}
      <div className="absolute inset-0 z-0 w-full h-full" aria-hidden="true">
        {!isLiteMode && (
          <BoardView
            boardWidth={boardWidth}
            boardHeight={boardHeight}
            cols={cols}
            rows={rows}
            isMoving={isMoving}
          />
        )}
      </div>

      {/* 3. Gradient Overlay Handoff to Page Background (PRD §3.3) */}
      {/* Fades seamlessly from overcast platform night to ivory/page background */}
      <div
        className="absolute inset-0 z-10 pointer-events-none w-full h-full"
        style={{
          background:
            "linear-gradient(to bottom, transparent 82%, rgba(7, 5, 4, 0.4) 92%, var(--color-surface-base, #FAF6EE) 100%)",
        }}
      />
      {/* 4. Phase 2 Atlas Debug Overlay (PRD §4.2, Phase 2 Gate) */}
      <AtlasDebugOverlay />
    </section>
  );
}
export default GuideHero;
