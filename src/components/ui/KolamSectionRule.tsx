"use client";

import React from "react";
import { motion } from "framer-motion";

export interface KolamSectionRuleProps {
  className?: string;
  variant?: "light" | "sandstone" | "espresso";
  tone?: "light" | "sandstone" | "espresso";
  ornament?: React.ReactNode;
}

/**
 * KolamSectionRule
 * Architectural section seam divider.
 * 1px hairline that expands outward from the center, interrupted at the center axis
 * by a delicate 14px brass/terracotta 4-dot Pulli diamond ornament (❖).
 */
export function KolamSectionRule({
  className = "",
  variant,
  tone = "light",
  ornament,
}: KolamSectionRuleProps) {
  const activeTone = variant || tone;
  const isEspresso = activeTone === "espresso";
  const isSandstone = activeTone === "sandstone";

  const lineColor = isEspresso
    ? "from-transparent via-[#D4AF37]/35 to-transparent"
    : isSandstone
    ? "from-transparent via-[#B85C38]/25 to-transparent"
    : "from-transparent via-hearth-espresso/15 to-transparent";

  const ornamentColor = isEspresso
    ? "text-[#D4AF37]"
    : isSandstone
    ? "text-[#B85C38]"
    : "text-[#B85C38]/80";

  return (
    <div
      aria-hidden="true"
      data-kolam-rule="true"
      className={`relative w-full py-8 sm:py-12 flex items-center justify-center select-none overflow-hidden kolam-section-rule ${className}`.trim()}
    >
      {/* Expanding Hairline Left */}
      <motion.div
        className={`h-px flex-1 bg-gradient-to-r ${lineColor} origin-right motion-reduce:transform-none!`}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Center Pulli Diamond Ornament */}
      <div className={`mx-4 sm:mx-6 shrink-0 flex items-center justify-center ${ornamentColor}`}>
        {ornament || <PulliDiamondSvg />}
      </div>

      {/* Expanding Hairline Right */}
      <motion.div
        className={`h-px flex-1 bg-gradient-to-l ${lineColor} origin-left motion-reduce:transform-none!`}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/**
 * Traditional 4-Dot Pulli Diamond SVG (14px × 14px)
 */
function PulliDiamondSvg() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="w-3.5 h-3.5"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* 4 Outer Pulli Cardinal Dots */}
      <circle cx="10" cy="2.5" r="1.5" />
      <circle cx="17.5" cy="10" r="1.5" />
      <circle cx="10" cy="17.5" r="1.5" />
      <circle cx="2.5" cy="10" r="1.5" />

      {/* Central Diamond Rhombus */}
      <path
        d="M 10 5.5 L 14.5 10 L 10 14.5 L 5.5 10 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="10" cy="10" r="1.2" />
    </svg>
  );
}

export default KolamSectionRule;
