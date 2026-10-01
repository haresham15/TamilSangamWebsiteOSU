"use client";

import React, { memo } from "react";

interface HeritageTextureOverlayProps {
  /** Texture variant: 'kanjeevaram' (woven silk micro-texture) or 'sandstone' (aged architectural grain) */
  variant?: "kanjeevaram" | "sandstone";
  /** Opacity level (0.01 to 0.08, default: 0.035) */
  opacity?: number;
  /** Blend mode (default: 'overlay' or 'soft-light') */
  blendMode?: "overlay" | "soft-light" | "screen" | "multiply";
  className?: string;
}

/**
 * HeritageTextureOverlay (Tactile Heritage Textures)
 * Mimics Kanjeevaram woven silk warp-weft grain or aged Dravidian sandstone.
 * Rendered using a hardware-accelerated SVG turbulence filter with zero image HTTP overhead.
 */
export const HeritageTextureOverlay = memo(function HeritageTextureOverlay({
  variant = "kanjeevaram",
  opacity = 0.038,
  blendMode = "overlay",
  className = "",
}: HeritageTextureOverlayProps) {
  // Variant parameters for procedural grain
  const baseFrequency = variant === "kanjeevaram" ? "0.85 0.72" : "0.55 0.65";
  const numOctaves = variant === "kanjeevaram" ? "3" : "4";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-10 w-full h-full overflow-hidden ${className}`}
      style={{
        opacity,
        mixBlendMode: blendMode,
      }}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <filter id={`heritage-grain-${variant}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFrequency}
              numOctaves={numOctaves}
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
            />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          filter={`url(#heritage-grain-${variant})`}
          fill="#faf5ed"
        />
      </svg>
    </div>
  );
});
