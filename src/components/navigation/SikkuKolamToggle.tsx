"use client";

import React from "react";
import { motion } from "framer-motion";

interface SikkuKolamToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  isDarkHero?: boolean;
}

export const KOLAM_PATHS = {
  // Loop 1: Vertical/Diagonal ribbon
  loopA_woven:
    "M 16 16 C 10 10, 10 4, 16 4 C 22 4, 22 10, 16 16 C 10 22, 10 28, 16 28 C 22 28, 22 22, 16 16 Z",
  loopA_unraveled:
    "M 16 16 C 12 12, 9 9, 9 9 C 9 9, 12 12, 16 16 C 20 20, 23 23, 23 23 C 23 23, 20 20, 16 16 Z",

  // Loop 2: Horizontal/Counter-Diagonal ribbon
  loopB_woven:
    "M 16 16 C 10 22, 4 22, 4 16 C 4 10, 10 10, 16 16 C 22 22, 28 22, 28 16 C 28 10, 22 10, 16 16 Z",
  loopB_unraveled:
    "M 16 16 C 12 20, 9 23, 9 23 C 9 23, 12 20, 16 16 C 20 12, 23 9, 23 9 C 23 9, 20 12, 16 16 Z",
};

export const PULLI_DOTS = [
  { id: "top", closed: { cx: 16, cy: 8.5 }, open: { cx: 16, cy: 6 } },
  { id: "bottom", closed: { cx: 16, cy: 23.5 }, open: { cx: 16, cy: 26 } },
  { id: "left", closed: { cx: 8.5, cy: 16 }, open: { cx: 6, cy: 16 } },
  { id: "right", closed: { cx: 23.5, cy: 16 }, open: { cx: 26, cy: 16 } },
];

export const SikkuKolamToggle: React.FC<SikkuKolamToggleProps> = ({
  isOpen,
  onToggle,
  className = "",
  isDarkHero = false,
}) => {
  const pulliOuterColor = isDarkHero ? "#D4AF37" : "#B8866B";
  const pulliCenterColor = isDarkHero ? "#E5A93C" : "#8C4A27";
  const threadColor = isDarkHero ? "#FAF7F2" : "#232120";

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu (Sikku Kolam)"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      className={`group relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-300 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] ${
        isOpen
          ? isDarkHero
            ? "border-[#D4AF37]/50 bg-[#D4AF37]/20 text-[#FAF7F2] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
            : "border-[#D8B8A6] bg-[#F5EBE4] text-[#8C4A27] shadow-[0_2px_8px_rgba(184,92,56,0.18)]"
          : isDarkHero
          ? "border-white/15 bg-white/10 hover:border-[#D4AF37]/60 hover:bg-white/15 text-[#FAF7F2]"
          : "border-[#E2DBD0] bg-[#F2EFE9]/90 hover:border-[#D4AF37]/60 hover:bg-[#EAE5DC] text-[#232120]"
      } ${className}`}
    >
      <motion.svg
        viewBox="0 0 32 32"
        className="h-6 w-6 sm:h-7 sm:w-7 overflow-visible pointer-events-none"
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
      >
        {/* Outer 4 Pulli (Grid Dots) */}
        {PULLI_DOTS.map((dot) => (
          <motion.circle
            key={dot.id}
            r={1.3}
            fill={pulliOuterColor}
            initial={false}
            animate={{
              cx: isOpen ? dot.open.cx : dot.closed.cx,
              cy: isOpen ? dot.open.cy : dot.closed.cy,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          />
        ))}

        {/* Center Pulli Dot (Fades out when knot unravels) */}
        <motion.circle
          cx={16}
          cy={16}
          r={1.4}
          fill={pulliCenterColor}
          initial={false}
          animate={{
            scale: isOpen ? 0 : 1,
            opacity: isOpen ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Continuous Neli Thread A (Vertical/Diagonal ribbon) */}
        <motion.path
          fill="none"
          stroke={threadColor}
          strokeWidth={1.65}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            d: isOpen ? KOLAM_PATHS.loopA_unraveled : KOLAM_PATHS.loopA_woven,
          }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
        />

        {/* Continuous Neli Thread B (Horizontal/Counter-Diagonal ribbon) */}
        <motion.path
          fill="none"
          stroke={threadColor}
          strokeWidth={1.65}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            d: isOpen ? KOLAM_PATHS.loopB_unraveled : KOLAM_PATHS.loopB_woven,
          }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
        />
      </motion.svg>
    </motion.button>
  );
};
