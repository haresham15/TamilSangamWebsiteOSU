"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * ViewfinderCursor
 * Unbreakable, 60fps-locked trailing terracotta cursor follower.
 * 
 * Strict Performance Invariants:
 * 1. Zero React re-renders on pointer move (no useState).
 * 2. Strictly separated position nodes (pure RAF translate3d, ZERO CSS transitions on transform)
 *    and visual nodes (CSS transitions exclusively for width, height, colors, and opacity).
 * 3. Bound directly to window with { passive: true } to prevent swallowing pointer events across Drei/WebGL canvases.
 * 4. Rendered directly into document.body via createPortal to evade any overflow/stacking context clipping.
 */
export function ViewfinderCursor() {
  const [mounted, setMounted] = useState(false);
  const ringPosRef = useRef<HTMLDivElement>(null);
  const ringVisualRef = useRef<HTMLDivElement>(null);
  const dotPosRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFinePointer || isReducedMotion) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isVisible = false;
    let rafId = 0;

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) {
        currentX = targetX;
        currentY = targetY;
        isVisible = true;
        if (ringPosRef.current) ringPosRef.current.style.opacity = "1";
        if (dotPosRef.current) dotPosRef.current.style.opacity = "1";
      }

      // Contextual hover detection via e.target.closest(...)
      const target = e.target as HTMLElement | null;
      const isCard = Boolean(
        target?.closest("[data-cursor='view'], .gallery-card, [data-lightbox-trigger], [data-dossier-photo]")
      );
      const isInteractive = Boolean(
        target?.closest("a, button, input, textarea, select, [role='button'], [tabindex='0']")
      );

      // Update state attribute directly on inner visual DOM node (ZERO React setState)
      if (ringVisualRef.current) {
        const nextState = isCard ? "card" : isInteractive ? "interactive" : "default";
        if (ringVisualRef.current.dataset.state !== nextState) {
          ringVisualRef.current.dataset.state = nextState;
        }
      }

      if (labelRef.current) {
        labelRef.current.style.opacity = isCard ? "1" : "0";
      }
    };

    const onPointerLeaveWindow = () => {
      isVisible = false;
      if (ringPosRef.current) ringPosRef.current.style.opacity = "0";
      if (dotPosRef.current) dotPosRef.current.style.opacity = "0";
    };

    const tick = () => {
      // Smooth frame-independent lerp for trailing terracotta ring
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;

      if (dotPosRef.current) {
        dotPosRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }
      if (ringPosRef.current) {
        ringPosRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeaveWindow);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeaveWindow);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* 1. Sharp Center Dot (Zero Lag) */}
      <div
        ref={dotPosRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform opacity-0 select-none"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        <div className="-translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#B85C38]" />
      </div>

      {/* 2. Trailing Terracotta Follower Ring (Physical Smooth Lerp) */}
      <div
        ref={ringPosRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform opacity-0 select-none"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        <div
          ref={ringVisualRef}
          data-state="default"
          className="cursor-visual -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-center transition-[width,height,background-color,border-color,opacity,transform] duration-200 ease-out"
        >
          <span
            ref={labelRef}
            className="text-center font-mono text-[9px] uppercase tracking-wider text-white opacity-0 transition-opacity duration-150 leading-tight select-none pointer-events-none"
          >
            VIEW<br />
            <span lang="ta" className="font-tamil text-[10px] tracking-normal">
              பார்
            </span>
          </span>
        </div>
      </div>

      {/* Styles for the inner visual node based on data-state */}
      <style jsx>{`
        .cursor-visual[data-state="default"] {
          width: 34px;
          height: 34px;
          border: 1.5px solid rgba(184, 92, 56, 0.7);
          background-color: rgba(184, 92, 56, 0.04);
        }
        .cursor-visual[data-state="interactive"] {
          width: 48px;
          height: 48px;
          border: 1.5px solid rgba(229, 169, 60, 0.9);
          background-color: rgba(184, 92, 56, 0.15);
        }
        .cursor-visual[data-state="card"] {
          width: 72px;
          height: 72px;
          border: 1.5px solid rgba(212, 175, 55, 0.95);
          background-color: rgba(22, 18, 16, 0.88);
          backdrop-filter: blur(4px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
        }
      `}</style>
    </>,
    document.body
  );
}
