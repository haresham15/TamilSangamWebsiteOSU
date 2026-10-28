// src/components/ui/KolamLoader.tsx
"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface KolamLoaderProps {
  size?: number;
  route?: string;
  chapterBadge?: string;
  titleEn?: string;
  titleTa?: string;
  fullScreen?: boolean;
  className?: string;
  isExpanding?: boolean;
}

// 5-Pulli Matrix (Auspicious Tamil household entrance Brahmamudi Kolam)
const PULLIS = [
  { x: 60, y: 60, r: 2.5, center: true }, // Sacred Bindu Center
  { x: 60, y: 34, r: 1.8 },               // North
  { x: 86, y: 60, r: 1.8 },               // East
  { x: 60, y: 86, r: 1.8 },               // South
  { x: 34, y: 60, r: 1.8 },               // West
];

export const ROUTE_INFO_MAP: Record<
  string,
  { titleEn: string; titleTa: string }
> = {
  "/": {
    titleEn: "The Hearth",
    titleTa: "முகப்பு · கோலம்",
  },
  "/events": {
    titleEn: "Events & Festivals",
    titleTa: "நிகழ்வுகள்",
  },
  "/about": {
    titleEn: "About & Heritage",
    titleTa: "அறிமுகம் · வரலாறு",
  },
  "/board": {
    titleEn: "Executive Board",
    titleTa: "நிர்வாக அவை",
  },
  "/gallery": {
    titleEn: "Photo Vault",
    titleTa: "நினைவலைகள்",
  },
  "/games": {
    titleEn: "Sangam Arcade",
    titleTa: "அரங்கம்",
  },
  "/guide": {
    titleEn: "Student Guide",
    titleTa: "வழிகாட்டி",
  },
  "/suggestions": {
    titleEn: "Ideas Hearth",
    titleTa: "கருத்துக்களம்",
  },
  "/join": {
    titleEn: "Join Sangam",
    titleTa: "உறுப்பினர் பதிவு",
  },
};

export const KolamLoader: React.FC<KolamLoaderProps> = ({
  size = 110,
  route,
  titleEn,
  titleTa,
  fullScreen = false,
  className = "",
  isExpanding = false,
}) => {
  const reducedMotion = useReducedMotion();

  const cleanRoute = (route || "").split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const meta = ROUTE_INFO_MAP[cleanRoute] || {
    titleEn: "Tamil Sangam",
    titleTa: "தமிழ்ச்சங்கம்",
  };

  const english = titleEn || meta.titleEn;
  const tamil = titleTa || meta.titleTa;

  const content = (
    <div
      className={`flex flex-col items-center justify-center select-none text-center px-4 transition-all duration-200 ${
        isExpanding ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* Fast, lightweight Kolam Motif */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 120 120"
          width={size}
          height={size}
          className="overflow-visible"
          aria-hidden="true"
        >
          {/* Subtle Outer Guideline Ring (slow rotation) */}
          <circle
            cx="60"
            cy="60"
            r="53"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="0.75"
            strokeDasharray="3 5"
            opacity="0.32"
            style={
              reducedMotion
                ? undefined
                : {
                    animation: "kolamRotateSlow 20s linear infinite",
                    transformOrigin: "60px 60px",
                  }
            }
          />

          {/* Pulli Dot Lattice */}
          {PULLIS.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill={p.center ? "#FFE8A3" : "#D4AF37"}
              opacity={p.center ? 1 : 0.85}
            />
          ))}

          {/* Continuous 4-Petal Sikku Knotwork (Brahmamudi) */}
          <motion.path
            d="
              M 60 16
              C 76 16, 78 40, 64 52
              C 76 38, 104 40, 104 60
              C 104 80, 76 82, 64 68
              C 78 80, 76 104, 60 104
              C 44 104, 42 80, 56 68
              C 44 82, 16 80, 16 60
              C 16 40, 44 38, 56 52
              C 42 40, 44 16, 60 16 Z
            "
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />

          {/* Inner Accent Diamond Weave */}
          <circle
            cx="60"
            cy="60"
            r="16"
            fill="none"
            stroke="#55CCA2"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Clean, minimalist typography */}
      <div className="mt-2.5 flex flex-col items-center">
        <span className="font-serif text-sm tracking-wider text-[#FAF7F2]/90">
          {english}
        </span>
        <span lang="ta" className="font-tamil text-xs text-[#D4AF37]/80 mt-0.5">
          {tamil}
        </span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-[9990] flex items-center justify-center bg-[#140F0D] text-[#FAF7F2] overflow-hidden ${className}`}
        aria-live="polite"
        aria-busy="true"
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-[#140F0D] text-[#FAF7F2] min-h-[220px] ${className}`}
      aria-live="polite"
      aria-busy="true"
    >
      {content}
    </div>
  );
};

export default KolamLoader;

