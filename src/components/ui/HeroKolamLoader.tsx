// src/components/ui/HeroKolamLoader.tsx
"use client";

import React from "react";
import { KolamLoader } from "./KolamLoader";

interface HeroKolamLoaderProps {
  route: string;
  minHeight?: string;
  className?: string;
}

/**
 * HeroKolamLoader
 * Rendered during dynamic chunk downloading and initial hero WebGL setup.
 * Replaces the blank brown/espresso boxes with a unique 25-pulli Sikku Kolam
 * that weaves in the center of the hero stage.
 */
export function HeroKolamLoader({
  route,
  minHeight = "100dvh",
  className = "",
}: HeroKolamLoaderProps) {
  return (
    <div
      data-hero-loader="true"
      className={`relative w-full flex items-center justify-center bg-[#140F0D] text-[#FAF7F2] select-none overflow-hidden ${className}`}
      style={{ minHeight }}
      aria-label="Loading cultural stage"
    >
      {/* Background Vignette & Ambient Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(37, 24, 18, 0.4) 0%, #140F0D 85%)",
        }}
      />

      <KolamLoader route={route} size={110} />
    </div>
  );
}

export default HeroKolamLoader;
