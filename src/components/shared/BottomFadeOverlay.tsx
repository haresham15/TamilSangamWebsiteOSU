"use client";

import React from "react";

export interface BottomFadeOverlayProps {
  /** The 3D scene's designated bottom-edge handoff color (§3) */
  fadeColor: string;
  /** Height percentage of the canvas container to fade (default: 26%) */
  heightPct?: number;
  /** Optional extra classes */
  className?: string;
}

/**
 * BottomFadeOverlay
 * 
 * Screen-space in-canvas bottom fade (§1).
 * Pins the bottom of the canvas container to a fixed, known, scroll-invariant color
 * before it ever reaches the canvas boundary.
 * 
 * Reaches 100% solid flat fadeColor before the bottom row of pixels (at 80%),
 * guaranteeing that the handoff point is completely independent of 3D camera rotation,
 * dynamic lights, or crowd animations.
 */
export function BottomFadeOverlay({
  fadeColor,
  heightPct = 26,
  className = "",
}: BottomFadeOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={`bottom-fade-overlay pointer-events-none absolute inset-x-0 bottom-0 select-none z-10 ${className}`}
      style={{
        height: `${heightPct}%`,
        background: `linear-gradient(to bottom, transparent 0%, ${fadeColor} 80%, ${fadeColor} 100%)`,
      }}
    />
  );
}
