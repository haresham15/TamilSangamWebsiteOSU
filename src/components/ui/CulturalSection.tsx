"use client";

import React from "react";
import { KorvaiDivider, LotusDivider } from "./CulturalDividers";

export type CulturalSurface = "ivory" | "sandstone" | "sangam-deep" | "peacock-deep";

export interface CulturalSectionProps {
  variant?: CulturalSurface;
  divider?: "korvai" | "lotus" | "none";
  id?: string;
  className?: string;
  /** Optional decorative layer (e.g. kolam) rendered behind content, masked away from the text column. */
  backdrop?: React.ReactNode;
  "aria-labelledby"?: string;
  children: React.ReactNode;
}

export const isDarkSurface = (v: CulturalSurface) => v === "sangam-deep" || v === "peacock-deep";

const SURFACE: Record<CulturalSurface, string> = {
  ivory: "bg-bg-ivory text-ink-earth",
  sandstone: "bg-bg-sandstone text-ink-earth",
  "sangam-deep": "bg-bg-sangam-deep text-ink-alabaster",
  "peacock-deep": "bg-bg-peacock-deep text-ink-alabaster",
};

/**
 * CulturalSection — the one band primitive for non-hero content.
 * Sets the surface, grain texture, and scoped ink variables that children can read:
 *   --section-ink, --section-muted, --section-border, --section-eyebrow, --section-accent
 */
export function CulturalSection({
  variant = "ivory",
  divider = "none",
  id,
  className = "",
  backdrop,
  children,
  ...rest
}: CulturalSectionProps) {
  const dark = isDarkSurface(variant);

  return (
    <section
      id={id}
      aria-labelledby={rest["aria-labelledby"]}
      data-surface-variant={variant}
      className={`cultural-band relative w-full ${SURFACE[variant]} ${dark ? "texture-silk" : "texture-khadi"} ${className}`.trim()}
    >
      {divider === "korvai" && <KorvaiDivider tone={dark ? "gold" : "bronze"} />}
      {divider === "lotus" && <LotusDivider tone={dark ? "dark" : "sandstone"} />}

      {backdrop && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,transparent_35%,black_80%)]"
        >
          {backdrop}
        </div>
      )}

      <div className="relative z-10 w-full">{children}</div>
    </section>
  );
}
