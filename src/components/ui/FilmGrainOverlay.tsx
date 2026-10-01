"use client";

import React, { memo } from "react";

/**
 * Global 35mm Film Grain & Atmospheric Texture Overlay
 * Replaces the flat, sterile "plastic web" aesthetic with analog film grain.
 * Uses a zero-layout, hardware-accelerated SVG feTurbulence filter with mix-blend-mode.
 * Respects prefers-reduced-motion unconditionally.
 */
export const FilmGrainOverlay = memo(function FilmGrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] select-none overflow-hidden"
    >
      {/* 35mm Grain Noise Layer */}
      <svg
        className="film-grain-svg absolute inset-0 h-full w-full opacity-[0.045] mix-blend-overlay contrast-125 dark:opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="film-grain-filter" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
            seed="2"
          />
          <feColorMatrix
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 1 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain-filter)" />
      </svg>

      {/* Subtle Cinematic Vignette along screen perimeter */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_65%,rgba(7,5,4,0.35)_100%)] pointer-events-none" />
    </div>
  );
});
