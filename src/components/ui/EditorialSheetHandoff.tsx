"use client";

import React from "react";

export interface EditorialSheetHandoffProps {
  children: React.ReactNode;
  id?: string;
  badge?: string;
  sublabel?: string;
  className?: string;
  overflowClass?: string;
}

/**
 * EditorialSheetHandoff
 * AWWWARDS SOTD Architectural Sheet Over-Scroll Container.
 * Glides up physically over the pinned 3D hero stage (p = 0.84 -> 1.00)
 * with a 28px rounded top corner, warm ambient shadow, 1px brass hairline rule,
 * and a tactile architectural registration bezel.
 */
export function EditorialSheetHandoff({
  children,
  id,
  badge: _badge = "EDITORIAL ARCHIVES",
  sublabel: _sublabel = "COLUMBUS, OH",
  className = "",
  overflowClass = "overflow-x-clip",
}: EditorialSheetHandoffProps) {
  return (
    <section
      id={id}
      data-editorial-sheet="true"
      className={`relative z-20 w-full bg-[#FAF7F2] text-[#161210] -mt-[10vh] md:-mt-[12vh] rounded-t-[28px] shadow-[0_-24px_60px_rgba(18,13,11,0.45)] border-t border-[#D4AF37]/35 ${overflowClass} ${className}`}
    >
      {children}
    </section>
  );
}
