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
  const pulliOuterColor = isDarkHero ? "#2BB5A8" : "#C79347";
  const pulliCenterColor = isDarkHero ? "#C79347" : "#2BB5A8";
  const threadColor = isDarkHero ? "#FAF5ED" : "#FAF5ED";

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu (Sikku Kolam)"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      className={`group relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border transition-[border-color,background-color,box-shadow] duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2BB5A8] ${
        isOpen
          ? isDarkHero
            ? "border-[#C79347]/40 bg-[#C79347]/20 text-[#FAF5ED] shadow-[0_0_12px_rgba(199,147,71,0.3)]"
            : "border-[rgba(212,163,106,0.35)] bg-[#1C122B] text-[#C79347] shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
          : isDarkHero
          ? "border-[rgba(212,163,106,0.35)] bg-[#1C122B]/70 hover:border-[#C79347]/60 hover:bg-[#25173B]/80 text-[#FAF5ED]"
          : "border-[rgba(212,163,106,0.3)] bg-[#271A3C]/90 hover:border-[#C79347]/50 hover:bg-[#352254] text-[#FAF5ED]"
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
