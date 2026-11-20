"use client";

import React from "react";
import { EditorialBackgroundCanvas } from "@/components/ui/EditorialBackgroundCanvas";

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
  surface?: "sandstone" | "ivory" | "sangam-deep";
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
  backgroundCanvasVariant = "light",
  overlapHero = true,
  surface = "sangam-deep",
}: EditorialSheetHandoffProps) {
  const overlapStyles = overlapHero
    ? "-mt-[10vh] md:-mt-[12vh] rounded-t-[28px] shadow-[0_-8px_36px_rgba(0,0,0,0.35),0_-24px_60px_rgba(28,18,43,0.65)] border-t border-[#C79347]/50"
    : "mt-0 border-t border-[#C79347]/35 shadow-[0_-4px_24px_rgba(0,0,0,0.25)]";

  const surfaceClasses =
    surface === "sandstone"
      ? "bg-[#F0E6D6] text-[#261A14]"
      : surface === "ivory"
      ? "bg-[#FAF6F0] text-[#261A14]"
      : "bg-[#1C122B] text-[#FAF5ED]";

  return (
    <section
      id={id}
      data-editorial-sheet="true"
      className={`relative z-20 w-full ${surfaceClasses} ${overlapStyles} ${overflowClass} ${className}`.trim()}
    >
      {/* Living Chola Monograph & Pulli Background Layer */}
      {showBackgroundCanvas && (
        <EditorialBackgroundCanvas variant={backgroundCanvasVariant} />
      )}

      {/* Foreground Content Layer */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </section>
  );
}

export default EditorialSheetHandoff;
