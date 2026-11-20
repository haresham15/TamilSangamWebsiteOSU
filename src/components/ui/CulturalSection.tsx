"use client";

import React from "react";
import { KorvaiDivider, LotusDivider } from "./CulturalDividers";

export interface CulturalSectionProps {
  variant?: "ivory" | "sandstone" | "sangam-deep" | "peacock-deep";
  divider?: "korvai" | "lotus" | "none";
  id?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * CulturalSection Primitive (PRD §6.1)
 * Enforces the alternating Courtyard Cadence across multi-section pages.
 * Automatically maps:
 * - Surface backgrounds (--bg-ivory, --bg-sandstone, --bg-sangam-deep, --bg-peacock-deep)
 * - Tactile texture overlays (.texture-khadi for light; .texture-silk for dark)
 * - High-contrast text ink variables (--ink-earth, --ink-umber, --ink-alabaster, --ink-sand)
 * - Cultural border seams (<KorvaiDivider> or <LotusDivider>)
 */
export function CulturalSection({
  variant = "ivory",
  divider = "none",
  id,
  className = "",
  children,
}: CulturalSectionProps) {
  const isLight = variant === "ivory" || variant === "sandstone";

  const surfaceClasses = {
    ivory: "bg-[#FAF6F0] text-[#261A14]",
    sandstone: "bg-[#F0E6D6] text-[#261A14]",
    "sangam-deep": "bg-[#1C122B] text-[#FAF5ED]",
    "peacock-deep": "bg-[#102830] text-[#FAF5ED]",
  }[variant];

  const textureClass = isLight ? "texture-khadi" : "texture-silk";

  return (
    <section
      id={id}
      data-surface-variant={variant}
      className={`relative w-full transition-colors duration-200 ${surfaceClasses} ${textureClass} ${className}`.trim()}
    >
      {/* Top Seam Divider */}
      {divider === "korvai" && (
        <div className="w-full">
          <KorvaiDivider tone={isLight ? "bronze" : "gold"} />
        </div>
      )}
      {divider === "lotus" && (
        <div className="w-full">
          <LotusDivider tone={variant === "sangam-deep" || variant === "peacock-deep" ? "dark" : "sandstone"} />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </section>
  );
}
