// src/components/ui/CinematicBootCurtain.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ROUTE_INFO_MAP } from "@/components/ui/KolamLoader";
import { getSceneIdForPath } from "@/components/providers/TransitionProvider";
import { waitForSceneReady } from "@/engine/bootStore";

// Global in-memory boot tracker to prevent re-curtaining on soft client route hops
let hasClientBootCompleted = false;

// 5-Pulli Sacred Matrix
const PULLIS = [
  { id: "center", x: 60, y: 60, r: 2.8, center: true },
  { id: "north", x: 60, y: 34, r: 2.0, center: false },
  { id: "east", x: 86, y: 60, r: 2.0, center: false },
  { id: "south", x: 60, y: 86, r: 2.0, center: false },
  { id: "west", x: 34, y: 60, r: 2.0, center: false },
];

/**
 * CinematicBootCurtain
 *
 * Full-screen root curtain rendered in the initial SSR HTML.
 * Ensures the user sees the sacred Tamil Sangam Hearth loader from Frame 0.
 * Eliminates all content flashes, mid-scroll jumping, and element pop-ins.
 * Animates on the GPU compositor thread (can never freeze or get stuck),
 * breathes with dignity, and cinematically dissolves into the fully ready page.
 */
export function CinematicBootCurtain() {
  const pathname = usePathname();
  const [curtainState, setCurtainState] = useState<"visible" | "unveiling" | "hidden">("visible");
  const overlayRef = useRef<HTMLDivElement>(null);
  const hasUnveiledRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { __ts_curtain_mounted?: boolean }).__ts_curtain_mounted = true;
    }

    const alreadyBooted =
      hasUnveiledRef.current ||
      hasClientBootCompleted ||
      (typeof window !== "undefined" && Boolean((window as unknown as { __ts_booted?: boolean }).__ts_booted));

    if (alreadyBooted) {
      setCurtainState("hidden");
      return;
    }

    let isMounted = true;
    let hideTimer: number | null = null;
    const sceneId = getSceneIdForPath(pathname);

    // Hold scroll without toggling overflow:hidden (eliminates scrollbar-width CLS)
    if (typeof window !== "undefined") {
      window.__lenis?.stop();
    }
    const blockEvent = (e: Event) => {
      if (e.cancelable) e.preventDefault();
    };
    const overlayEl = overlayRef.current;
    overlayEl?.addEventListener("wheel", blockEvent, { passive: false });
    overlayEl?.addEventListener("touchmove", blockEvent, { passive: false });

    const unlockScroll = () => {
      overlayEl?.removeEventListener("wheel", blockEvent);
      overlayEl?.removeEventListener("touchmove", blockEvent);
      if (typeof document !== "undefined") {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
      if (typeof window !== "undefined") {
        window.__lenis?.start();
      }
    };

    // 1. Minimum ceremonial breathing duration (700ms) for respectful, dignified bootup
    const minDwell = new Promise((resolve) => setTimeout(resolve, 700));

    // 2. Document fonts readiness gate: eliminates FOUC and font snapping before reveal
    const fontsReady =
      typeof document !== "undefined" && document.fonts
        ? document.fonts.ready.catch(() => true)
        : Promise.resolve(true);

    // 3. Scene readiness wait: waits up to 2.3s for above-the-fold 3D shaders/models to compile
    const sceneReady = sceneId ? waitForSceneReady(sceneId, 2300) : Promise.resolve(true);

    // 4. Combined readiness requirement
    const pageReady = Promise.all([minDwell, fontsReady, sceneReady]);

    // 5. Hard safety timeout (2500ms after mount) so slow networks never get stuck on the veil
    const safetyTimeout = new Promise((resolve) => setTimeout(resolve, 2500));

    Promise.race([pageReady, safetyTimeout]).then(() => {
      if (!isMounted || hasUnveiledRef.current) return;
      hasUnveiledRef.current = true;

      // Cleanly unlock document & Lenis scroll immediately upon reveal
      unlockScroll();

      // 1. Begin smooth, GPU-composited veil dissolution
      setCurtainState("unveiling");

      // 2. Mark global boot complete & unmount AFTER the 800ms dissolve completes
      hideTimer = window.setTimeout(() => {
        hasClientBootCompleted = true;
        if (typeof window !== "undefined") {
          (window as unknown as { __ts_booted?: boolean }).__ts_booted = true;
        }
        if (isMounted) {
          setCurtainState("hidden");
        }
      }, 850);
    });

    return () => {
      isMounted = false;
      if (hideTimer !== null) window.clearTimeout(hideTimer);
      unlockScroll();
    };
  }, [pathname]);

  if (curtainState === "hidden") {
    return null;
  }

  const cleanRoute = (pathname || "").split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const meta = ROUTE_INFO_MAP[cleanRoute] || {
    titleEn: "Tamil Sangam",
    titleTa: "தமிழ்ச்சங்கம்",
    subtitleEn: "Entering Sanctuary",
  };

  const isUnveiling = curtainState === "unveiling";

  return (
    <div
      ref={overlayRef}
      id="app-boot-curtain"
      aria-label="Loading cultural stage"
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[99999] bg-[#140C20] flex flex-col items-center justify-center text-[#FAF5ED] select-none overflow-hidden touch-none overscroll-none will-change-[opacity,transform] transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        isUnveiling
          ? "opacity-0 scale-[1.02] pointer-events-none"
          : "opacity-100 scale-100 pointer-events-auto"
      }`}
    >
      {/* Soft Ambient Courtyard Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 900px 520px at 50% 50%, rgba(199, 147, 71, 0.12) 0%, rgba(43, 181, 168, 0.05) 45%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      {/* Main Loader Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-full">
        {/* GPU-Accelerated Sikku Kolam (Brahmamudi Loop) with Breathing Glow */}
        <div
          className="relative flex items-center justify-center kolam-breathing-group"
          style={{ width: 140, height: 140, maxWidth: "70vw", maxHeight: "70vw" }}
        >
          <svg
            viewBox="0 0 120 120"
            width={140}
            height={140}
            className="overflow-visible w-full h-full"
            aria-hidden="true"
          >
            {/* Subtle Outer Guideline Ring (slow gentle rotation) */}
            <circle
              cx="60"
              cy="60"
              r="53"
              fill="none"
              stroke="#C79347"
              strokeWidth="0.75"
              strokeDasharray="3 5"
              opacity="0.32"
              style={{
                animation: "spin 24s linear infinite",
                transformOrigin: "60px 60px",
              }}
            />

            {/* Inner Accent Ring with Soft Teal Glow */}
            <circle
              cx="60"
              cy="60"
              r="16"
              fill="none"
              stroke="#2BB5A8"
              strokeWidth="1"
              strokeDasharray="2 3"
              opacity="0.55"
              style={{
                animation: "spin 12s linear infinite reverse",
                transformOrigin: "60px 60px",
              }}
            />

            {/* 5-Pulli Dot Lattice: Center Bindu + 4 Directional Dots */}
            {PULLIS.map((p) => (
              <g key={p.id}>
                {p.center ? (
                  <>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={p.r + 3.0}
                      fill="rgba(199, 147, 71, 0.28)"
                    />
                    <circle cx={p.x} cy={p.y} r={p.r} fill="#C79347" />
                  </>
                ) : (
                  <>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={p.r + 2.0}
                      fill="rgba(43, 181, 168, 0.22)"
                    />
                    <circle cx={p.x} cy={p.y} r={p.r} fill="#2BB5A8" />
                  </>
                )}
              </g>
            ))}

            {/* Base Ghost Path */}
            <path
              d="
                M 60 16
                C 76 16, 78 40, 64 52
                C 76 38, 104 40, 104 60
                C 104 80, 76 82, 64 68
                C 78 80, 76 104, 60 104
                C 44 104, 42 80, 56 68
                C 44 82, 16 80, 16 60
                C 16 40, 44 38, 56 52
                C 42 40, 44 16, 60 16 Z
              "
              fill="none"
              stroke="#C79347"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.22"
            />

            {/* Continuous Sacred 4-Petal Sikku Knotwork (Brahmamudi Loop) */}
            <path
              d="
                M 60 16
                C 76 16, 78 40, 64 52
                C 76 38, 104 40, 104 60
                C 104 80, 76 82, 64 68
                C 78 80, 76 104, 60 104
                C 44 104, 42 80, 56 68
                C 44 82, 16 80, 16 60
                C 16 40, 44 38, 56 52
                C 42 40, 44 16, 60 16 Z
              "
              pathLength={100}
              fill="none"
              stroke="#C79347"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="kolam-weave-flow"
              style={{
                filter: "drop-shadow(0 0 8px rgba(199, 147, 71, 0.6))",
              }}
            />
          </svg>
        </div>

        {/* Bilingual Editorial Inscription */}
        <div className="mt-5 flex flex-col items-center justify-center">
          <h2 className="h-7 flex items-center font-serif text-lg sm:text-xl tracking-wider text-[#FAF5ED] font-medium leading-none">
            {meta.titleEn}
          </h2>
          <span
            lang="ta"
            style={{ letterSpacing: 0 }}
            className="h-6 flex items-center font-tamil text-sm sm:text-base text-[#C79347] font-medium mt-1 leading-none"
          >
            {meta.titleTa}
          </span>
        </div>

        {/* Pure Ceremonial Static Status Marker */}
        <div className="mt-4 h-5 flex items-center justify-center gap-2 font-mono text-[11px] tracking-widest text-[#CBBBA8]/80">
          <span
            className="inline-block w-2 h-2 rounded-full bg-[#2BB5A8] shadow-[0_0_8px_rgba(43,181,168,0.5)]"
            aria-hidden="true"
          />
          <span className="uppercase text-[#2BB5A8] tracking-[0.2em] font-medium">
            {meta.subtitleEn}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CinematicBootCurtain;
