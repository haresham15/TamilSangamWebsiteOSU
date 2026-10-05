// src/components/ui/BootSlate.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { useTierContext } from "@/components/providers/TierProvider";
import { getActiveLenis } from "@/components/providers/MotionProvider";
import { useBootStore } from "@/engine/bootStore";

/**
 * BootSlate (§6)
 * - First page load of the session only (sessionStorage)
 * - Tier A only; skips for Tier B, Tier C, in-app webviews, reduced-motion, and save-data
 * - Hard 3s timeout cap; visible Skip button
 * - Sets #app-root to inert and pauses Lenis while visible
 * - Honest monotonic progress readout (00.00%) with neutral copy
 */
export function BootSlate() {
  const { tier, isInAppBrowser } = useTierContext();
  const [shouldRender, setShouldRender] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const releasedRef = useRef(false);

  // Check gating conditions (§6.1)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const alreadyShown = sessionStorage.getItem("sangam_boot_shown");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    const saveData = connection?.saveData;

    // Run only if ALL conditions are true (§6.1)
    if (alreadyShown || tier !== "A" || isInAppBrowser || prefersReducedMotion || saveData) {
      return;
    }

    requestAnimationFrame(() => {
      setShouldRender(true);
    });
    useBootStore.getState().setBootActive(true);

    // Freeze interaction on DOM (#app-root) and smooth scroll (§6.4)
    const appRoot = document.getElementById("app-root");
    if (appRoot) {
      appRoot.setAttribute("inert", "");
    }
    const lenis = getActiveLenis();
    if (lenis) {
      lenis.stop();
    }
  }, [tier, isInAppBrowser]);

  // Release function with cleanup (§6.4)
  const release = useCallback(() => {
    if (releasedRef.current) return;
    releasedRef.current = true;
    setIsDismissing(true);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("sangam_boot_shown", "true");
    }

    // Unfreeze interaction
    const appRoot = document.getElementById("app-root");
    if (appRoot) {
      appRoot.removeAttribute("inert");
    }
    const lenis = getActiveLenis();
    if (lenis) {
      lenis.start();
    }

    useBootStore.getState().setBootActive(false);

    // Animate shutter open (§6.5)
    const top = topPanelRef.current;
    const bottom = bottomPanelRef.current;
    const seam = seamRef.current;

    if (top && bottom) {
      const tl = gsap.timeline({
        defaults: { ease: "power4.inOut", duration: 0.85 },
        onComplete: () => {
          setShouldRender(false);
        },
      });

      if (seam) {
        tl.to(seam, { scaleX: 0, opacity: 0, duration: 0.25, ease: "power2.in" }, 0);
      }
      tl.to(top, { yPercent: -100 }, 0.05)
        .to(bottom, { yPercent: 100 }, 0.05);
    } else {
      setShouldRender(false);
    }
  }, []);

  // Progress simulation & 3s hard cap (§6.1, §6.2)
  useEffect(() => {
    if (!shouldRender || releasedRef.current) return;

    const startTime = performance.now();
    let animId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      // Interpolate progress toward 100% over max 2.2 seconds
      const simulated = Math.min(100, (elapsed / 2200) * 100);
      const storeProgress = useBootStore.getState().progress;
      const combined = Math.max(simulated, storeProgress);

      setDisplayProgress((prev) => Math.min(100, Math.max(prev, combined)));

      if (elapsed >= 2500 || combined >= 100) {
        setDisplayProgress(100);
        // Brief pause at 100% before shutter release
        setTimeout(release, 150);
        return;
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    // Hard 3-second safety cap (§6.1)
    const safetyCapTimer = setTimeout(() => {
      setDisplayProgress(100);
      release();
    }, 3000);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(safetyCapTimer);
    };
  }, [shouldRender, release]);

  if (!shouldRender) {
    return null;
  }

  const formattedProgress = displayProgress.toFixed(2).padStart(5, "0");

  return (
    <>
      {/* Fallback for noscript environments */}
      <noscript>
        <style>{`#boot-slate-root { display: none !important; }`}</style>
      </noscript>

      <div
        id="boot-slate-root"
        ref={containerRef}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        role="status"
        aria-live="polite"
        aria-label="Loading application"
      >
        {/* Top Shutter Half */}
        <div
          ref={topPanelRef}
          className="absolute top-0 left-0 w-full h-1/2 bg-[#0a0412] will-change-transform border-b border-[var(--sangam-gold)]/20 flex flex-col justify-end items-center"
        />

        {/* Center Seam */}
        <div
          ref={seamRef}
          className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--sangam-gold)]/50 to-transparent -translate-y-1/2 z-20 pointer-events-none"
        />

        {/* Bottom Shutter Half */}
        <div
          ref={bottomPanelRef}
          className="absolute bottom-0 left-0 w-full h-1/2 bg-[#0a0412] will-change-transform border-t border-[var(--sangam-gold)]/20 flex flex-col justify-start items-center"
        />

        {/* Centered Slate Content */}
        <div
          className={`relative z-30 flex flex-col items-center justify-center text-center px-6 transition-opacity duration-300 ${
            isDismissing ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Subtle Emblem / Monogram */}
          <div className="w-12 h-12 mb-6 rounded-full border border-[var(--sangam-gold)]/40 flex items-center justify-center bg-[var(--sangam-gold)]/5">
            <span className="font-serif font-bold text-sm tracking-widest text-[var(--sangam-gold)]">
              TS
            </span>
          </div>

          {/* Club Identity (Strictly Neutral Copy, §6.2) */}
          <h1 className="text-sm uppercase tracking-[0.25em] font-mono text-[var(--text-muted)] mb-1">
            OSU Tamil Sangam
          </h1>
          <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]/60 font-mono mb-8">
            The Ohio State University
          </p>

          {/* Tabular Monospace Percentage Readout (§6.2) */}
          <div
            className="text-4xl sm:text-5xl font-mono font-bold text-[var(--sangam-gold)] tracking-wider"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formattedProgress}%
          </div>

          {/* Progress Bar Track */}
          <div className="w-48 sm:w-64 h-[2px] bg-white/10 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-[var(--sangam-gold)] transition-all duration-75 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          {/* Visible Skip Button (§6.1) */}
          <button
            type="button"
            onClick={release}
            className="mt-8 px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] hover:text-white border border-white/20 hover:border-[var(--sangam-gold)]/60 rounded transition-colors"
          >
            Skip Intro
          </button>
        </div>
      </div>
    </>
  );
}

export default BootSlate;
