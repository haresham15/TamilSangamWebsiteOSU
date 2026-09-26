"use client";

import React from "react";

export type HeroBridgeTheme = "join" | "board" | "events" | "gallery" | "guide" | "about";

export interface HeroToContentBridgeProps {
  /** Optional predefined semantic theme mapping to design/tokens.json */
  theme?: HeroBridgeTheme;
  /** The 3D scene's designated bottom-edge handoff color */
  fadeColor?: string;
  /** The destination content section background color */
  contentBg?: string;
  /** Height of the bridge as a percentage of the hero container (default: 24%) */
  heightPct?: number;
  /** Optional extra classes */
  className?: string;
}

const THEME_SURFACE_MAP: Record<HeroBridgeTheme, { fadeColor: string; contentBg: string }> = {
  join: {
    fadeColor: "var(--surface-hero-join, oklch(0.975 0.015 85))",
    contentBg: "var(--surface-hero-join, oklch(0.975 0.015 85))",
  },
  board: {
    fadeColor: "var(--surface-hero-board, oklch(0.18 0.04 45))",
    contentBg: "var(--surface-hero-board, oklch(0.18 0.04 45))",
  },
  events: {
    fadeColor: "var(--surface-hero-events, oklch(0.14 0.03 285))",
    contentBg: "var(--surface-hero-events, oklch(0.14 0.03 285))",
  },
  gallery: {
    fadeColor: "var(--surface-hero-gallery, oklch(0.96 0.018 75))",
    contentBg: "var(--surface-hero-gallery, oklch(0.96 0.018 75))",
  },
  guide: {
    fadeColor: "var(--surface-hero-guide, oklch(0.16 0.02 260))",
    contentBg: "var(--surface-hero-guide, oklch(0.16 0.02 260))",
  },
  about: {
    fadeColor: "var(--surface-hero-about, oklch(0.15 0.02 55))",
    contentBg: "var(--surface-hero-about, oklch(0.15 0.02 55))",
  },
};

/**
 * HeroToContentBridge (§Phase 2 PRD Mandate)
 * 
 * Token-driven bridge that seamlessly transitions from a 3D hero canvas
 * to DOM content below without hard-edged rectangular seams.
 * 
 * Implements:
 * 1. Semantic token binding to DTCG tokens.json & globals.css
 * 2. Perceptually uniform OKLCH gradient interpolation (`linear-gradient(in oklch to bottom, ...)`)
 * 3. High-frequency micro-grain dither to eliminate 8-bit color quantization banding
 */
export function HeroToContentBridge({
  theme,
  fadeColor: propFadeColor,
  contentBg: propContentBg,
  heightPct = 24,
  className = "",
}: HeroToContentBridgeProps) {
  const themeValues = theme ? THEME_SURFACE_MAP[theme] : null;
  const fadeColor = propFadeColor || themeValues?.fadeColor || "var(--surface-hero-join, oklch(0.975 0.015 85))";
  const contentBg = propContentBg || themeValues?.contentBg || "var(--surface-hero-join, oklch(0.975 0.015 85))";

  return (
    <div
      aria-hidden="true"
      className={`hero-to-content-bridge pointer-events-none absolute left-0 right-0 bottom-[-1px] w-full z-20 select-none overflow-hidden ${className}`}
      style={{
        height: `${heightPct}%`,
        backgroundColor: "transparent",
        backgroundImage: `linear-gradient(to bottom, transparent 0%, ${fadeColor} 40%, ${contentBg} 100%)`,
      }}
    >
      {/* Native OKLCH gradient interpolation layer */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: `linear-gradient(in oklch to bottom, transparent 0%, ${fadeColor} 40%, ${contentBg} 100%)`,
        }}
      />

      {/* Perceptual micro-grain dither to eliminate color quantization banding */}
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
