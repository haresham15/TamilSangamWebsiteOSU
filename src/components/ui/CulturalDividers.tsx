"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface KorvaiDividerProps {
  className?: string;
  tone?: "light-to-dark" | "dark-to-light" | "gold" | "bronze";
}

/**
 * KorvaiDivider (Kanchipuram Temple Peak & Zari Border Seam)
 * A refined 4px-6px double-hairline antique zari rule with repeating miniature
 * temple-peak triangles (rekku) in #C79347 / #9A6B3E.
 * Replaces generic 1px lines and sci-fi crosshairs at band seams (PRD §4.1).
 */
export function KorvaiDivider({
  className = "",
  tone = "gold",
}: KorvaiDividerProps) {
  const reduced = useReducedMotion();

  const zariColor = tone === "bronze" ? "#9A6B3E" : "#C79347";

  return (
    <div
      aria-hidden="true"
      data-korvai-divider="true"
      className={`relative w-full py-2 flex flex-col items-center justify-center select-none overflow-hidden ${className}`.trim()}
    >
      {/* Top Zari Hairline */}
      <motion.div
        className="w-full h-px bg-gradient-to-r from-transparent via-[rgba(199,147,71,0.45)] to-transparent"
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Repeating Miniature Temple-Peak Triangles (Rekku Pattern) */}
      <div className="w-full max-w-5xl my-1 flex items-center justify-center gap-2 sm:gap-3 opacity-70">
        <svg
          viewBox="0 0 400 12"
          className="w-full h-2.5 text-[#C79347]"
          fill="none"
          preserveAspectRatio="none"
        >
          <pattern
            id="korvai-rekku"
            x="0"
            y="0"
            width="20"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            {/* Miniature temple peak triangle */}
            <path
              d="M0 12 L10 2 L20 12 Z"
              fill={zariColor}
              fillOpacity="0.35"
            />
            {/* Central temple spire dot */}
            <circle cx="10" cy="2" r="1" fill={zariColor} fillOpacity="0.75" />
          </pattern>
          <rect width="100%" height="12" fill="url(#korvai-rekku)" />
        </svg>
      </div>

      {/* Bottom Zari Hairline */}
      <motion.div
        className="w-full h-px bg-gradient-to-r from-transparent via-[rgba(199,147,71,0.35)] to-transparent"
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
      />
    </div>
  );
}

export interface LotusDividerProps {
  className?: string;
  tone?: "light" | "sandstone" | "dark";
}

/**
 * LotusDivider (Intra-Section Cultural Flourish)
 * Centered delicate 16px hand-drawn Pulli Kolam knot / Lotus flourish flanked
 * by tapered bronze-to-transparent hairline strokes (PRD §4.1).
 */
export function LotusDivider({
  className = "",
  tone = "sandstone",
}: LotusDividerProps) {
  const reduced = useReducedMotion();

  const strokeColor =
    tone === "dark"
      ? "from-transparent via-[rgba(212,163,106,0.35)] to-transparent"
      : "from-transparent via-[rgba(154,107,62,0.35)] to-transparent";

  const motifColor =
    tone === "dark"
      ? "text-[#D4A36A] drop-shadow-[0_0_8px_rgba(212,163,106,0.4)]"
      : "text-[#9A6B3E] drop-shadow-[0_1px_3px_rgba(91,44,134,0.12)]";

  return (
    <div
      aria-hidden="true"
      data-lotus-divider="true"
      className={`relative w-full py-8 sm:py-12 flex items-center justify-center select-none overflow-hidden ${className}`.trim()}
    >
      {/* Tapered hairline left */}
      <motion.div
        className={`h-px flex-1 bg-gradient-to-r ${strokeColor} origin-right`}
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Centered Cultural Kolam Knot / Lotus Flourish */}
      <div className={`mx-4 sm:mx-6 shrink-0 flex items-center justify-center ${motifColor}`}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
        >
          {/* 4-petal central lotus diamond */}
          <path
            d="M12 2 C13 7 17 11 22 12 C17 13 13 17 12 22 C11 17 7 13 2 12 C7 11 11 7 12 2 Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Inner 4-dot Pulli constellation */}
          <circle cx="12" cy="7" r="1" fill="currentColor" />
          <circle cx="17" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="17" r="1" fill="currentColor" />
          <circle cx="7" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Tapered hairline right */}
      <motion.div
        className={`h-px flex-1 bg-gradient-to-l ${strokeColor} origin-left`}
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
