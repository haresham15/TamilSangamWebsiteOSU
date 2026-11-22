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
 * Seamlessly matches the page canvas background with zero contrasting borders or boxes.
 */
export function HeroKolamLoader({
  route,
  minHeight = "100dvh",
  className = "",
}: HeroKolamLoaderProps) {
  return (
    <div
      data-hero-loader="true"
      className={`relative w-full flex items-center justify-center bg-[var(--color-bg,#140C20)] text-[#FAF5ED] select-none overflow-hidden ${className}`}
      style={{ minHeight }}
      aria-label="Loading cultural stage"
    >
      {/* Soft Ambient Courtyard Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 900px 500px at 50% 50%, rgba(199, 147, 71, 0.08) 0%, rgba(43, 181, 168, 0.03) 45%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      <KolamLoader route={route} size={130} />
    </div>
  );
}

export default HeroKolamLoader;
