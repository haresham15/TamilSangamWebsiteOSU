"use client";

import React, { useRef, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { useLiteMode } from "@/context/LiteModeContext";

export interface EditorialBackgroundCanvasProps {
  className?: string;
  variant?: "light" | "espresso";
  showKolamWatermarks?: boolean;
}

/**
 * EditorialBackgroundCanvas
 * "The Living Chola Monograph & Pulli Architectural Background System"
 * 
 * 1. Cursor-reactive warm hearth dapple light
 * 2. One scroll-rotated sikku kolam in a corner, masked away from body copy
 * 3. Khadi cotton-rag paper grain
 * (Ledger rails, dot matrix and glyph walls were retired: they read as a CAD canvas.)
 * 
 * Zero React re-renders on scroll / mousemove (driven via RAF + CSS custom properties).
 */
export function EditorialBackgroundCanvas({
  className = "",
  variant = "light",
  showKolamWatermarks = true,
}: EditorialBackgroundCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { isLiteMode } = useLiteMode();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    let targetX = 50;
    let targetY = 30;
    let currentX = 50;
    let currentY = 30;
    let isLoopRunning = false;
    let visible = false;

    let rect = container.getBoundingClientRect();
    let isRectDirty = false;
    const markRectDirty = () => {
      isRectDirty = true;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!visible || e.pointerType === "touch") return;
      if (isRectDirty) {
        rect = container.getBoundingClientRect();
        isRectDirty = false;
      }
      if (rect.height <= 0 || rect.width <= 0) return;
      targetX = ((e.clientX - rect.left) / rect.width) * 100;
      targetY = ((e.clientY - rect.top) / rect.height) * 100;

      if (!isLoopRunning) {
        isLoopRunning = true;
        rafId = requestAnimationFrame(updateLoop);
      }
    };

    const onScroll = () => {
      markRectDirty();
    };

    const updateLoop = () => {
      // Smooth lerp for ambient hearth dapple cursor light
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      container.style.setProperty("--mouse-x", `${currentX.toFixed(2)}%`);
      container.style.setProperty("--mouse-y", `${currentY.toFixed(2)}%`);

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafId = requestAnimationFrame(updateLoop);
      } else {
        isLoopRunning = false;
      }
    };

    // Offscreen inherited variables otherwise restyle every descendant during hero scrolling.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) onScroll();
      else {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = null;
        isLoopRunning = false;
      }
    }, { rootMargin: "100px 0px" });
    observer.observe(container);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", markRectDirty, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", markRectDirty);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, isLiteMode]);

  const isEspresso = variant === "espresso";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-editorial-canvas="true"
      className={`pointer-events-none select-none absolute inset-0 z-0 overflow-hidden editorial-background-canvas ${className}`.trim()}
    >
      {/* 1. Warm hearth dapple light (zari + a whisper of Sangam purple). No grids, rails or dot matrices. */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(700px circle at var(--mouse-x, 50%) var(--mouse-y, 30%), rgba(199, 147, 71, ${isEspresso ? 0.1 : 0.07}), rgba(91, 44, 134, 0.05) 50%, transparent 72%)`,
        }}
      />

      {/* 2. Classical Moola Kolam (Corner Stone Watermark) — stationary, anchored to top-left margin */}
      {showKolamWatermarks && !isLiteMode && (
        <div
          className={`absolute -left-16 -top-16 h-[360px] w-[360px] pointer-events-none select-none ${
            isEspresso ? "text-accent-zari opacity-[0.06]" : "text-accent-bronze opacity-[0.05]"
          }`}
          style={{
            maskImage: "radial-gradient(circle at top left, black 25%, transparent 68%)",
            WebkitMaskImage: "radial-gradient(circle at top left, black 25%, transparent 68%)",
          }}
        >
          <SikkuKolamSvg />
        </div>
      )}

      {/* 3. Khadi cotton-rag paper grain */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-[0.024] mix-blend-multiply">
        <filter id="khadi-monograph-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#khadi-monograph-grain)" />
      </svg>
    </div>
  );
}

/**
 * Sacred 8-Fold Sikku Kolam / Lotus Mandala SVG
 * Ultra-delicate 0.75px stroke geometry designed for classical Chola editorial watermarks.
 */
function SikkuKolamSvg() {
  return (
    <svg
      viewBox="0 0 560 560"
      className="w-full h-full text-current"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      aria-hidden="true"
    >
      <circle cx="280" cy="280" r="260" strokeDasharray="4 6" opacity="0.75" />
      <circle cx="280" cy="280" r="220" />
      <circle cx="280" cy="280" r="160" />
      <circle cx="280" cy="280" r="90" strokeDasharray="3 5" />
      <circle cx="280" cy="280" r="30" />

      {/* 8 Interlaced Radial Petal Loops */}
      <path
        d="M 280 20 C 340 120, 440 220, 540 280 C 440 340, 340 440, 280 540 C 220 440, 120 340, 20 280 C 120 220, 220 120, 280 20 Z"
        strokeLinecap="round"
      />
      <path
        d="M 464 96 C 410 200, 360 360, 464 464 C 360 410, 200 360, 96 464 C 150 360, 200 200, 96 96 C 200 150, 360 200, 464 96 Z"
        strokeLinecap="round"
      />

      {/* 8 Sikku Dot-Enclosure Rings */}
      <circle cx="280" cy="120" r="28" />
      <circle cx="393" cy="167" r="28" />
      <circle cx="440" cy="280" r="28" />
      <circle cx="393" cy="393" r="28" />
      <circle cx="280" cy="440" r="28" />
      <circle cx="167" cy="393" r="28" />
      <circle cx="120" cy="280" r="28" />
      <circle cx="167" cy="167" r="28" />

      {/* Micro Pulli Diamond Nucleus */}
      <circle cx="280" cy="280" r="2.5" fill="currentColor" />
      <circle cx="280" cy="265" r="2" fill="currentColor" />
      <circle cx="280" cy="295" r="2" fill="currentColor" />
      <circle cx="265" cy="280" r="2" fill="currentColor" />
      <circle cx="295" cy="280" r="2" fill="currentColor" />
    </svg>
  );
}

export default EditorialBackgroundCanvas;
