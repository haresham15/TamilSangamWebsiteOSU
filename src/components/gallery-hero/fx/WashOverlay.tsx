"use client";

import React from "react";

interface WashOverlayProps {
  progress: number;
}

/**
 * WashOverlay (§4, §5.2, Phase 8)
 *
 * Implements the cinematic solar whiteout dissolve and vault hand-off:
 * - Begins at p = 0.88, reaches full solar peak at p = 0.96, and settles into solid #FFFDF8 at p >= 0.99.
 * - Anamorphic horizontal solar streak with mint (#55CCA2) and solar gold (#FFB84D) accents.
 * - Seamlessly dissolves 3D WebGL fretboard highway into the DOM gallery vault.
 * - Fully reversible: scrolling backward unwinds the wash cleanly with zero visual artifacts.
 */
export function WashOverlay({ progress }: WashOverlayProps) {
  // 1. Normalized wash progress in [0, 1] across p in [0.88, 1.00]
  const pWash = Math.max(0, Math.min(1.0, (progress - 0.88) / 0.12));

  // Cubic ease-in curve for natural optical bloom wash
  const alpha = Math.pow(pWash, 2.0);

  // Peak flash intensity around p = 0.95 - 0.97
  const flashIntensity = Math.sin(pWash * Math.PI);

  // Anamorphic horizontal streak scale (expands from 0.1 to 1.8)
  const streakScaleX = 0.2 + pWash * 1.6;
  const streakOpacity = Math.max(0, Math.min(1.0, flashIntensity * 1.4));

  if (progress < 0.87) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 overflow-hidden transition-colors duration-75"
      style={{
        backgroundColor: `rgba(255, 253, 248, ${alpha})`,
      }}
      aria-hidden="true"
    >
      {/* 1. Core Solar Radial Bloom Halo */}
      <div
        className="absolute inset-0 transition-opacity duration-100"
        style={{
          opacity: flashIntensity,
          background:
            "radial-gradient(circle at 50% 55%, rgba(255, 255, 255, 1) 0%, rgba(254, 243, 199, 0.9) 35%, rgba(245, 158, 11, 0.45) 65%, rgba(255, 253, 248, 0) 100%)",
        }}
      />

      {/* 2. Anamorphic Horizontal Solar Streak (Mint #55CCA2 + Solar Gold #FFB84D) */}
      <div
        className="absolute top-[55%] left-0 right-0 h-[3px] -translate-y-1/2 blur-[1.5px] transition-transform duration-75 origin-center"
        style={{
          opacity: streakOpacity,
          transform: `scaleX(${streakScaleX})`,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(85, 204, 162, 0.6) 25%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 184, 77, 0.7) 75%, transparent 100%)",
        }}
      />

      {/* 3. Secondary Diffuse Lens Glare Bar */}
      <div
        className="absolute top-[55%] left-[10%] right-[10%] h-[18px] -translate-y-1/2 blur-[8px] transition-transform duration-75"
        style={{
          opacity: streakOpacity * 0.75,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(85, 204, 162, 0.3) 30%, rgba(255, 255, 255, 0.8) 50%, rgba(245, 158, 11, 0.4) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}
