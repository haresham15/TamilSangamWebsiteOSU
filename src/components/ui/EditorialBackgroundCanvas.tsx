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
 * 1. 5-Tier Ledger Hairlines (6%, 28%, 50%, 72%, 94%)
 * 2. Subtle Pulli Dot Matrix masked away from body copy
 * 3. 3 Monumental Rotating Ghost Kolams & Tamil Glyph Watermarks (அ, ழ, ம்)
 * 4. Cursor-Reactive Warm Hearth Dapple Lighting
 * 5. Heavy Khadi Cotton-Rag Paper Tooth
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

    let rect = container.getBoundingClientRect();
    let isRectDirty = false;
    const markRectDirty = () => {
      isRectDirty = true;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
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
      if (reducedMotion || isLiteMode) return;
      const y = window.scrollY;
      const deg = (y * 0.025) % 360;
      const dash = (y * 0.08) % 400;
      container.style.setProperty("--kolam-rot", `${deg}deg`);
      container.style.setProperty("--kolam-rot-rev", `${-deg * 0.85}deg`);
      container.style.setProperty("--kolam-dash", `${dash}`);
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

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", markRectDirty, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", markRectDirty);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, isLiteMode]);

  const isEspresso = variant === "espresso";
  const hairlineColor = isEspresso ? "rgba(250, 246, 240, 0.06)" : "rgba(22, 18, 16, 0.045)";
  const dotColor = isEspresso ? "rgba(212, 175, 55, 0.09)" : "rgba(200, 90, 50, 0.085)";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-editorial-canvas="true"
      className={`pointer-events-none select-none absolute inset-0 z-0 overflow-hidden editorial-background-canvas ${className}`.trim()}
    >
      {/* =========================================================================
          1. WARM HEARTH CURSOR & AMBIENT DAPPLE LIGHTING
          ========================================================================= */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: isEspresso
            ? `radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 30%), rgba(212, 175, 55, 0.085), rgba(200, 90, 50, 0.035) 45%, transparent 75%),
               radial-gradient(900px ellipse at 85% 15%, rgba(212, 175, 55, 0.06), transparent 70%),
               radial-gradient(900px ellipse at 15% 85%, rgba(200, 90, 50, 0.05), transparent 70%)`
            : `radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 30%), rgba(212, 175, 55, 0.065), rgba(200, 90, 50, 0.03) 45%, transparent 75%),
               radial-gradient(900px ellipse at 85% 15%, rgba(255, 184, 77, 0.045), transparent 70%),
               radial-gradient(900px ellipse at 15% 85%, rgba(200, 90, 50, 0.04), transparent 70%)`,
        }}
      />

      {/* =========================================================================
          2. ARCHITECTURAL PULLI GRID (5 LEDGER HAIRLINES)
          Aligned with container grid at 6%, 28%, 50%, 72%, 94%
          ========================================================================= */}
      <div className="absolute inset-0">
        {[6, 28, 50, 72, 94].map((pos) => (
          <div
            key={pos}
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${pos}%`,
              backgroundColor: hairlineColor,
            }}
          />
        ))}
      </div>

      {/* =========================================================================
          3. PULLI DOT MATRIX (48px × 48px) WITH RADIAL MASK
          Soft along margins & section seams; fades to 0% behind body text
          ========================================================================= */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${dotColor} 1.25px, transparent 1.25px)`,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 25%, black 85%), linear-gradient(to right, black 0%, transparent 18%, transparent 82%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 25%, black 85%), linear-gradient(to right, black 0%, transparent 18%, transparent 82%, black 100%)",
        }}
      />

      {/* =========================================================================
          4. SCROLL-LINKED GHOST SIKKU KOLAMS & CLASSICAL TAMIL WATERMARKS
          ========================================================================= */}
      {showKolamWatermarks && !isLiteMode && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Kolam 1 (Top Left Margin) */}
          <div
            className="absolute top-[8%] -left-36 sm:-left-48 w-[560px] h-[560px] transition-transform duration-100 ease-out will-change-transform opacity-60"
            style={{
              transform: "rotate(var(--kolam-rot, 0deg))",
            }}
          >
            <SikkuKolamSvg />
          </div>

          {/* Monumental Tamil Glyph 1: "அ" (Akaram - The Primordial Letter) */}
          <span
            lang="ta"
            className="absolute top-[14%] right-[5%] font-serif font-light text-[18rem] md:text-[24rem] leading-none select-none pointer-events-none opacity-[0.045] text-transparent"
            style={{
              WebkitTextStroke: isEspresso ? "1.5px rgba(212, 175, 55, 0.4)" : "1.5px rgba(200, 90, 50, 0.45)",
            }}
          >
            அ
          </span>

          {/* Kolam 2 (Middle Right Margin) */}
          <div
            className="absolute top-[42%] -right-36 sm:-right-48 w-[560px] h-[560px] transition-transform duration-100 ease-out will-change-transform opacity-50"
            style={{
              transform: "rotate(var(--kolam-rot-rev, 0deg))",
            }}
          >
            <SikkuKolamSvg />
          </div>

          {/* Monumental Tamil Glyph 2: "ழ" (Zha - The Soul of Tamil) */}
          <span
            lang="ta"
            className="absolute top-[48%] left-[4%] font-serif font-light text-[18rem] md:text-[24rem] leading-none select-none pointer-events-none opacity-[0.045] text-transparent"
            style={{
              WebkitTextStroke: isEspresso ? "1.5px rgba(212, 175, 55, 0.4)" : "1.5px rgba(200, 90, 50, 0.45)",
            }}
          >
            ழ
          </span>

          {/* Kolam 3 (Lower Left Margin) */}
          <div
            className="absolute top-[76%] -left-36 sm:-left-48 w-[560px] h-[560px] transition-transform duration-100 ease-out will-change-transform opacity-50"
            style={{
              transform: "rotate(var(--kolam-rot, 0deg))",
            }}
          >
            <SikkuKolamSvg />
          </div>

          {/* Monumental Tamil Glyph 3: "ம்" (Om / Pure Consonant Cadence) */}
          <span
            lang="ta"
            className="absolute top-[82%] right-[5%] font-serif font-light text-[18rem] md:text-[24rem] leading-none select-none pointer-events-none opacity-[0.04] text-transparent"
            style={{
              WebkitTextStroke: isEspresso ? "1.5px rgba(212, 175, 55, 0.4)" : "1.5px rgba(200, 90, 50, 0.45)",
            }}
          >
            ம்
          </span>
        </div>
      )}

      {/* =========================================================================
          5. KHADI COTTON-RAG TACTILE PAPER GRAIN
          ========================================================================= */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.024] pointer-events-none mix-blend-multiply">
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
      className="w-full h-full text-[#C85A32]"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.85"
      aria-hidden="true"
    >
      <circle cx="280" cy="280" r="260" strokeDasharray="4 6" opacity="0.6" />
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
