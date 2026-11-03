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
}

/**
 * EditorialSheetHandoff
 * AWWWARDS SOTD Architectural Sheet Over-Scroll Container.
 * Glides up physically over the pinned 3D hero stage (p = 0.84 -> 1.00)
 * with a 28px rounded top corner, warm ambient shadow, 1px brass hairline rule,
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
}: EditorialSheetHandoffProps) {
  const overlapStyles = overlapHero
    ? "-mt-[10vh] md:-mt-[12vh] rounded-t-[28px] shadow-[0_-8px_36px_rgba(166,240,207,0.14),0_-24px_60px_rgba(18,13,11,0.55)] border-t border-[#A6F0CF]/50"
    : "mt-0 border-t border-[#A6F0CF]/35 shadow-[0_-4px_24px_rgba(166,240,207,0.08)]";

  return (
    <section
      id={id}
      data-editorial-sheet="true"
      className={`relative z-20 w-full bg-[#140C20] text-[#F4F0FA] ${overlapStyles} ${overflowClass} ${className}`.trim()}
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
