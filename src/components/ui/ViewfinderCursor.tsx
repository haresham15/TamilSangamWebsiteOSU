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

    document.documentElement.classList.add("has-custom-cursor");

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isVisible = false;
    let rafId = 0;

    const ensureTick = () => {
      if (!rafId && isVisible && !document.hidden) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      // Update center dot synchronously on hardware pointer event (zero frame lag)
      if (dotPosRef.current) {
        dotPosRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }

      const target = e.target as HTMLElement | null;
      const isInput = Boolean(target?.closest("input, textarea, [contenteditable]"));

      if (isInput) {
        // Yield to native OS text I-beam cursor
        isVisible = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
        if (ringPosRef.current) ringPosRef.current.style.opacity = "0";
        if (dotPosRef.current) dotPosRef.current.style.opacity = "0";
        return;
      }

      if (!isVisible) {
        currentX = targetX;
        currentY = targetY;
        isVisible = true;
        if (ringPosRef.current) {
          ringPosRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
        }
      }
      if (ringPosRef.current) ringPosRef.current.style.opacity = "1";
      if (dotPosRef.current) dotPosRef.current.style.opacity = "1";

      // Contextual hover detection via e.target.closest(...)
      const isCard = Boolean(
        target?.closest("[data-cursor='view'], .gallery-card, [data-lightbox-trigger], [data-dossier-photo]")
      );
      const isInteractive = Boolean(
        target?.closest("a, button, select, [role='button'], [tabindex='0']")
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

      ensureTick();
    };

    const onPointerLeaveWindow = () => {
      isVisible = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (ringPosRef.current) ringPosRef.current.style.opacity = "0";
      if (dotPosRef.current) dotPosRef.current.style.opacity = "0";
    };

    const tick = () => {
      rafId = 0;
      if (!isVisible || document.hidden) return;

      const dx = targetX - currentX;
      const dy = targetY - currentY;

      if (Math.abs(dx) < 0.08 && Math.abs(dy) < 0.08) {
        currentX = targetX;
        currentY = targetY;
        if (ringPosRef.current) {
          ringPosRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
        }
        return;
      }

      // Smooth frame-independent lerp for trailing terracotta ring
      currentX += dx * 0.22;
      currentY += dy * 0.22;

      if (ringPosRef.current) {
        ringPosRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    const onVisibilityChange = () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else {
        ensureTick();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeaveWindow);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeaveWindow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (rafId) cancelAnimationFrame(rafId);
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
        <div className="-translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#C79347]" />
      </div>

      {/* 2. Trailing Follower Ring (Physical Smooth Lerp) */}
      <div
        ref={ringPosRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform opacity-0 select-none"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        <div
          ref={ringVisualRef}
          data-state="default"
          className="cursor-visual rounded-full flex items-center justify-center text-center transition-[background-color,border-color,opacity,transform] duration-200 ease-out"
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
        .cursor-visual {
          width: 72px;
          height: 72px;
        }
        .cursor-visual[data-state="default"] {
          transform: translate3d(-50%, -50%, 0) scale(0.472);
          border: 3px solid rgba(199, 147, 71, 0.7);
          background-color: rgba(199, 147, 71, 0.05);
        }
        .cursor-visual[data-state="interactive"] {
          transform: translate3d(-50%, -50%, 0) scale(0.667);
          border: 2.25px solid rgba(43, 181, 168, 0.9);
          background-color: rgba(43, 181, 168, 0.12);
        }
        .cursor-visual[data-state="card"] {
          transform: translate3d(-50%, -50%, 0) scale(1);
          border: 1.5px solid rgba(184, 74, 57, 0.95);
          background-color: rgba(28, 18, 43, 0.88);
          backdrop-filter: blur(4px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
        }
      `}</style>
    </>,
    document.body
  );
}
