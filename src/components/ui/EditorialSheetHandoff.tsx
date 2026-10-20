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
}: EditorialSheetHandoffProps) {
  return (
    <section
      id={id}
      data-editorial-sheet="true"
      className={`relative z-20 w-full bg-[#FAF6F0] text-[#161210] -mt-[10vh] md:-mt-[12vh] rounded-t-[28px] shadow-[0_-24px_60px_rgba(18,13,11,0.45)] border-t border-[#D4AF37]/35 ${overflowClass} ${className}`.trim()}
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
