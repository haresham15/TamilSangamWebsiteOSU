"use client";

import React from "react";

export interface HeroToContentBridgeProps {
  /** The 3D scene's designated bottom-edge handoff color (§3) */
  fadeColor: string;
  /** The destination content section background color (§4) */
  contentBg: string;
  /** Height of the bridge as a percentage of the hero container (default: 22%) */
  heightPct?: number;
  /** Optional extra classes */
  className?: string;
}

/**
 * HeroToContentBridge
 * 
 * Token-driven bridge that seamlessly transitions from a 3D hero canvas
 * to DOM content below without hard-edged rectangular seams.
 * 
 * Implements:
 * 1. Overlapping screen-space gradient (starts transparent, hits fadeColor at 35%, resolves to contentBg at 100%)
 * 2. Perceptually uniform Oklab gradient interpolation with multi-stop sRGB fallback
 * 3. High-frequency micro-grain dither to eliminate 8-bit color quantization banding
 */
export function HeroToContentBridge({
  fadeColor,
  contentBg,
  heightPct = 22,
  className = "",
}: HeroToContentBridgeProps) {
  return (
    <div
      aria-hidden="true"
      className={`hero-to-content-bridge pointer-events-none absolute left-0 right-0 bottom-[-1px] w-full z-20 select-none overflow-hidden ${className}`}
      style={{
        height: `${heightPct}%`,
        // 1. Standard multi-stop sRGB fallback
        backgroundColor: "transparent",
        backgroundImage: `linear-gradient(to bottom, transparent 0%, ${fadeColor} 35%, ${contentBg} 100%)`,
      }}
    >
      {/* 2. Modern perceptual Oklab color-space gradient layer (progressive enhancement) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: `linear-gradient(in oklab to bottom, transparent 0%, ${fadeColor} 35%, ${contentBg} 100%)`,
        }}
      />

      {/* 3. Perceptual grain / dither overlay to eradicate 8-bit banding across wide contrast spans (§2c) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "160px 160px",
        }}
      />
    </div>
  );
}
