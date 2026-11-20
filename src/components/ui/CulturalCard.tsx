"use client";

import React from "react";

export interface CulturalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "parchment" | "pathirikai";
  topStripe?: "purple" | "teal" | "zari" | "kumkum" | "none";
  className?: string;
  children: React.ReactNode;
}

/**
 * CulturalCard Primitive (PRD §6.2)
 * Tactile cultural framing for cards and containers across the platform:
 * - Light: Crisp #FFFFFF paper, 1px solid #DFD1BE border, warm elevation shadow.
 * - Parchment: #F7EFE2 palm-leaf inset for tips and highlights.
 * - Dark: Velvet silk purple #271A3C with subtle antique zari border.
 * - Pathirikai: Dual-stroke invitation framing with inset zari line and corner flourishes.
 */
export function CulturalCard({
  variant = "light",
  topStripe = "none",
  className = "",
  children,
  ...props
}: CulturalCardProps) {
  const variantClasses = {
    light:
      "bg-white border border-[#DFD1BE] text-[#261A14] shadow-[0_6px_24px_rgba(38,26,20,0.06)] hover:border-[#9A6B3E]/60 hover:shadow-[0_10px_30px_rgba(91,44,134,0.09)] transition-all",
    parchment:
      "bg-[#F7EFE2] border border-[#E3D4C0] text-[#261A14] shadow-[0_4px_16px_rgba(38,26,20,0.04)] hover:border-[#9A6B3E]/50 transition-all",
    dark:
      "bg-[#271A3C] border border-[rgba(212,163,106,0.25)] text-[#FAF5ED] shadow-[0_12px_32px_rgba(10,6,18,0.35)] hover:border-[rgba(212,163,106,0.55)] transition-all",
    pathirikai:
      "bg-[#1C122B] border border-[#C79347]/50 text-[#FAF5ED] shadow-[0_16px_48px_rgba(0,0,0,0.4)] card-pathirikai relative transition-all",
  }[variant];

  const stripeClasses = {
    purple: "border-t-[3px] border-t-[#5B2C86]",
    teal: "border-t-[3px] border-t-[#0F766E]",
    zari: "border-t-[3px] border-t-[#C79347]",
    kumkum: "border-t-[3px] border-t-[#B84A39]",
    none: "",
  }[topStripe];

  return (
    <div
      data-cultural-card="true"
      data-variant={variant}
      className={`rounded-2xl relative overflow-hidden ${variantClasses} ${stripeClasses} ${className}`.trim()}
      {...props}
    >
      {/* Small corner Pathirikai stationery flourishes for featured cards */}
      {variant === "pathirikai" && (
        <>
          <span
            aria-hidden="true"
            className="absolute top-2 left-2 text-[#C79347]/40 text-[10px] select-none font-serif leading-none"
          >
            ❖
          </span>
          <span
            aria-hidden="true"
            className="absolute top-2 right-2 text-[#C79347]/40 text-[10px] select-none font-serif leading-none"
          >
            ❖
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-2 text-[#C79347]/40 text-[10px] select-none font-serif leading-none"
          >
            ❖
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-2 right-2 text-[#C79347]/40 text-[10px] select-none font-serif leading-none"
          >
            ❖
          </span>
        </>
      )}

      {children}
    </div>
  );
}
