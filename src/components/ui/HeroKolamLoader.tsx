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
 * Replaces blank boxes with a progress-driven sacred Sikku Kolam that weaves
 * in real-time in the center of the hero stage.
 */
export function HeroKolamLoader({
  route,
  minHeight = "100dvh",
  className = "",
}: HeroKolamLoaderProps) {
  return (
    <div
      data-hero-loader="true"
      className={`relative w-full flex items-center justify-center bg-[#1C122B] text-[#FAF5ED] select-none overflow-hidden ${className}`}
      style={{ minHeight }}
      aria-label="Loading cultural stage"
    >
      {/* Ambient Courtyard Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 900px 500px at 50% 50%, rgba(199, 147, 71, 0.09) 0%, rgba(43, 181, 168, 0.04) 45%, #1C122B 85%)",
        }}
        aria-hidden="true"
      />

      <KolamLoader route={route} size={130} />
    </div>
  );
}

export default HeroKolamLoader;
