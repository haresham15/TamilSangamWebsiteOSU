"use client";

import React, { memo } from "react";

interface WatermarkGlyphProps {
  /** The Tamil glyph or string to render in massive architectural scale (e.g. "தமிழ்", "சங்கம்", "அகம்") */
  text: string;
  /** Positioning mode and alignment */
  className?: string;
  /** Opacity override (defaults to 0.04) */
  opacity?: number;
  /** Horizontal alignment: 'left' | 'center' | 'right' */
  align?: "left" | "center" | "right";
  /** Optional position shorthand (e.g. 'center', 'top-left', 'top-right', 'bottom-left', 'bottom-right') */
  position?: "left" | "center" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | string;
  /** Color theme for dark vs light page backgrounds */
  theme?: "dark" | "light";
}

/**
 * WatermarkGlyph (Bilingual Brutalism Architecture)
 * Injects massive structural Tamil typography across background grids.
 * Eradicates empty dead space with cultural authority and epigraphic depth.
 */
export const WatermarkGlyph = memo(function WatermarkGlyph({
  text,
  className = "",
  opacity = 0.04,
  align,
  position,
  theme = "dark",
}: WatermarkGlyphProps) {
  const resolvedAlign =
    align ||
    (position?.includes("left")
      ? "left"
      : position?.includes("right")
      ? "right"
      : "center");

  const alignClass =
    resolvedAlign === "left"
      ? "left-0 text-left -translate-x-6"
      : resolvedAlign === "right"
      ? "right-0 text-right translate-x-6"
      : "left-1/2 -translate-x-1/2 text-center";

  const verticalClass =
    position === "top-right" || position === "top-left"
      ? "top-[25%] -translate-y-1/2"
      : position === "bottom-right" || position === "bottom-left"
      ? "top-[75%] -translate-y-1/2"
      : "top-1/2 -translate-y-1/2";

  const colorClass =
    theme === "light"
      ? "text-[#250d38]"
      : "text-white mix-blend-plus-lighter";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 select-none overflow-hidden z-0 ${verticalClass} ${alignClass} ${className}`}
    >
      <span
        lang="ta"
        style={{ letterSpacing: 0, opacity }}
        className={`font-tamil font-black text-[22vw] sm:text-[18vw] lg:text-[16vw] leading-none whitespace-nowrap tracking-tight block ${colorClass}`}
      >
        {text}
      </span>
    </div>
  );
});

