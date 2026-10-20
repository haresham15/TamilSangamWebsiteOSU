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
  badge = "EDITORIAL ARCHIVES",
  sublabel = "COLUMBUS, OH",
  className = "",
  overflowClass = "overflow-x-clip",
}: EditorialSheetHandoffProps) {
  return (
    <section
      id={id}
      data-editorial-sheet="true"
      className={`relative z-20 w-full bg-[#FAF7F2] text-[#161210] -mt-[10vh] md:-mt-[12vh] rounded-t-[28px] shadow-[0_-24px_60px_rgba(18,13,11,0.45)] border-t border-[#D4AF37]/35 ${overflowClass} ${className}`}
    >
      {/* Architectural Bezel Header with Precision Registration Marks */}
      <div className="w-full border-b border-[#161210]/10 px-6 sm:px-12 py-3 flex items-center justify-between text-[10px] font-mono tracking-widest text-[#B85C38] uppercase select-none bg-[#F4EFE6]/80 backdrop-blur-xs rounded-t-[28px]">
        <span className="flex items-center gap-1.5 opacity-70">
          <span className="text-xs font-bold leading-none">+</span>
          <span className="hidden sm:inline">OSU TAMIL SANGAM</span>
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161210]/5 border border-[#161210]/10 font-bold tracking-widest text-[#161210]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B85C38] inline-block animate-pulse" />
          <span>{badge}</span>
        </span>
        <span className="flex items-center gap-1.5 opacity-70">
          <span className="hidden sm:inline">{sublabel}</span>
          <span className="text-xs font-bold leading-none">+</span>
        </span>
      </div>

      {children}
    </section>
  );
}
