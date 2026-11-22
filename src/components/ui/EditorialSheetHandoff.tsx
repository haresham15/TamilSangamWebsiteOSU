"use client";

import React from "react";
import { EditorialBackgroundCanvas } from "@/components/ui/EditorialBackgroundCanvas";
import { ThresholdSeam } from "@/components/ui/ThresholdSeam";

export type SeamMode = "full" | "knot" | "none";

export function resolveSeamVariant(seam: SeamMode | undefined, overlapHero: boolean): SeamMode {
  return seam ?? (overlapHero ? "full" : "knot");
}

export interface EditorialSheetHandoffProps {
  children: React.ReactNode;
  id?: string;
  badge?: string;
  sublabel?: string;
  className?: string;
  overflowClass?: string;
  showBackgroundCanvas?: boolean;
  backgroundCanvasVariant?: "light" | "espresso";
  overlapHero?: boolean;
  surface?: "sandstone" | "ivory" | "sangam-deep" | "peacock-deep";
  seam?: SeamMode;
}

/**
 * EditorialSheetHandoff
 * AWWWARDS SOTD Architectural Sheet Over-Scroll Container.
 * Glides up physically over the pinned 3D hero stage (p = 0.84 -> 1.00)
 * with a 28px rounded top corner, warm ambient shadow, 1px antique zari rule,
 * and the tactile Living Chola Monograph & Pulli Architectural Background System.
 */
export function EditorialSheetHandoff({
  children,
  id,
  badge: _badge = "EDITORIAL ARCHIVES",
  sublabel: _sublabel = "COLUMBUS, OH",
  className = "",
  overflowClass = "overflow-x-clip",
  showBackgroundCanvas = true,
  backgroundCanvasVariant,
  overlapHero = true,
  surface = "sangam-deep",
  seam,
}: EditorialSheetHandoffProps) {
  const seamMode = resolveSeamVariant(seam, overlapHero);
  const hasSeam = seamMode !== "none";
  const overlapStyles = overlapHero
    ? `-mt-[10vh] md:-mt-[12vh] rounded-t-[28px] shadow-[0_-8px_36px_rgba(0,0,0,0.35),0_-24px_60px_rgba(28,18,43,0.65)]${hasSeam ? "" : " border-t border-accent-zari/50"}`
    : `mt-0 shadow-[0_-4px_24px_rgba(0,0,0,0.25)]${hasSeam ? "" : " border-t border-accent-zari/35"}`;

  const surfaceClasses = {
    sandstone: "bg-bg-sandstone text-ink-earth texture-khadi",
    ivory: "bg-bg-ivory text-ink-earth texture-khadi",
    "sangam-deep": "bg-bg-sangam-deep text-ink-alabaster texture-silk",
    "peacock-deep": "bg-bg-peacock-deep text-ink-alabaster texture-silk",
  }[surface];

  return (
    <section
      id={id}
      data-editorial-sheet="true"
      className={`relative z-20 w-full ${surfaceClasses} ${overlapStyles} ${overflowClass} ${className}`.trim()}
    >
      {hasSeam && <ThresholdSeam surface={surface} variant={seamMode === "knot" ? "knot" : "full"} />}

      {/* Living Chola Monograph & Pulli Background Layer */}
      {showBackgroundCanvas && (
        <EditorialBackgroundCanvas
          variant={backgroundCanvasVariant ?? (surface === "sangam-deep" || surface === "peacock-deep" ? "espresso" : "light")}
        />
      )}

      {/* Foreground Content Layer */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </section>
  );
}

export default EditorialSheetHandoff;
