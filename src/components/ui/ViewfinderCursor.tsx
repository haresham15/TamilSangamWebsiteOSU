// src/components/ui/ViewfinderCursor.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * FLOATING TAMIL "அ" (A) CURSOR
 * Replaces the technical viewfinder crosshair with a floating, organic Tamil letter 'அ'.
 * - 60fps tracking driven by GSAP quickTo without React state lag.
 * - Dynamic color inversion via mix-blend-difference ensuring high contrast over light & dark sections.
 * - Gentle ambient floating sine wave drift.
 * - Interactive focus expansion & tactile spring compression on click/hover.
 * - Graceful degradation: completely disabled on touch devices ((hover: none)).
 */
export function ViewfinderCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glyphRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Disable custom cursor on touch/mobile devices
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch) return;

    const container = containerRef.current;
    const glyph = glyphRef.current;
    const dot = dotRef.current;
    if (!container || !glyph) return;

    // GSAP quickTo kinematics for buttery 60fps cursor positioning
    const xTo = gsap.quickTo(container, "x", { duration: 0.1, ease: "power3" });
    const yTo = gsap.quickTo(container, "y", { duration: 0.1, ease: "power3" });

    // Subtle organic floating float animation on the Tamil letter
    const floatTween = gsap.to(glyph, {
      y: -4,
      rotation: 3,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    let isFocused = false;

    const onPointerMove = (e: PointerEvent) => {
      if (!isVisible) setIsVisible(true);
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onPointerDown = () => {
      gsap.to(glyph, {
        scale: 0.85,
        duration: 0.1,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onPointerUp = () => {
      gsap.to(glyph, {
        scale: isFocused ? 1.4 : 1,
        duration: 0.25,
        ease: "back.out(2)",
        overwrite: "auto",
      });
    };

    const onPointerOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'a, button, input, select, textarea, [role="button"], [data-cursor="bracket"], .dossier-ribbon, [data-plane-item], .cursor-pointer'
      );

      if (interactive && !isFocused) {
        isFocused = true;
        // Focus state: Floating letter expands and tilts with magnetic presence
        gsap.to(glyph, {
          scale: 1.4,
          rotation: -8,
          duration: 0.22,
          ease: "power2.out",
          overwrite: "auto",
        });
        if (dot) {
          gsap.to(dot, {
            scale: 1.8,
            duration: 0.2,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      } else if (!interactive && isFocused) {
        isFocused = false;
        // Resting state: Gentle floating letter
        gsap.to(glyph, {
          scale: 1,
          rotation: 0,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
        });
        if (dot) {
          gsap.to(dot, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      }
    };

    const onPointerLeaveWindow = () => {
      setIsVisible(false);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("mouseover", onPointerOver, { passive: true });
    document.addEventListener("mouseleave", onPointerLeaveWindow);

    return () => {
      floatTween.kill();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("mouseover", onPointerOver);
      document.removeEventListener("mouseleave", onPointerLeaveWindow);
    };
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 999999,
        mixBlendMode: "difference",
        transform: "translate(-50%, -50%)",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.15s ease-out",
      }}
      className="hidden md:flex items-center justify-center select-none"
    >
      {/* Precision Focal Point Dot at pointer center */}
      <div
        ref={dotRef}
        className="w-1.5 h-1.5 rounded-full bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_4px_white]"
      />

      {/* Floating Tamil "அ" Letter */}
      <div
        ref={glyphRef}
        lang="ta"
        style={{ letterSpacing: 0 }}
        className="relative -top-3.5 -right-3 text-[22px] sm:text-[25px] font-noto-serif-tamil font-bold text-white leading-none select-none drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]"
      >
        அ
      </div>
    </div>
  );
}
