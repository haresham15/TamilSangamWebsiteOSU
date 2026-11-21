// src/components/ui/KolamLoader.tsx
"use client";

import React, { useState, useEffect } from "react";
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
  { id: "center", x: 60, y: 60, r: 2.8, threshold: 0, center: true }, // Sacred Bindu Center
  { id: "north", x: 60, y: 34, r: 2.0, threshold: 22 },               // North
  { id: "east", x: 86, y: 60, r: 2.0, threshold: 46 },                // East
  { id: "south", x: 60, y: 86, r: 2.0, threshold: 70 },               // South
  { id: "west", x: 34, y: 60, r: 2.0, threshold: 88 },                // West
];

export const ROUTE_INFO_MAP: Record<
  string,
  { titleEn: string; titleTa: string; subtitleEn: string }
> = {
  "/": {
    titleEn: "The Hearth",
    titleTa: "முகப்பு · கோலம்",
    subtitleEn: "Entering the Courtyard",
  },
  "/events": {
    titleEn: "Events & Festivals",
    titleTa: "நிகழ்வுகள்",
    subtitleEn: "Gathering the Calendar",
  },
  "/about": {
    titleEn: "About & Heritage",
    titleTa: "அறிமுகம் · வரலாறு",
    subtitleEn: "Unfolding the History",
  },
  "/board": {
    titleEn: "Executive Board",
    titleTa: "நிர்வாக அவை",
    subtitleEn: "Calling the Assembly",
  },
  "/gallery": {
    titleEn: "Photo Vaults",
    titleTa: "புகைப்படங்கள்",
    subtitleEn: "Opening the Archives",
  },
  "/games": {
    titleEn: "Sangam Arcade",
    titleTa: "அரங்கம்",
    subtitleEn: "Preparing Daily Words",
  },
  "/dance": {
    titleEn: "Dance Space",
    titleTa: "நடன அரங்கம்",
    subtitleEn: "Setting the Stage",
  },
  "/guide": {
    titleEn: "Student Guide",
    titleTa: "வழிகாட்டி",
    subtitleEn: "Mapping Columbus",
  },
  "/suggestions": {
    titleEn: "Ideas Hearth",
    titleTa: "கருத்துக்களம்",
    subtitleEn: "Opening the Floor",
  },
  "/join": {
    titleEn: "Join Sangam",
    titleTa: "உறுப்பினர் பதிவு",
    subtitleEn: "Preparing Registration",
  },
  "/links": {
    titleEn: "Linktree & Hub",
    titleTa: "இணைப்புகள்",
    subtitleEn: "Connecting Links",
  },
  "/faq": {
    titleEn: "Questions & Answers",
    titleTa: "கேள்வி-பதில்",
    subtitleEn: "Indexing Insights",
  },
};

export const KolamLoader: React.FC<KolamLoaderProps> = ({
  size = 120,
  route,
  titleEn,
  titleTa,
  fullScreen = false,
  className = "",
  isExpanding = false,
}) => {
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(14);

  // Smooth progressive animation ticker simulating realistic resource resolution
  useEffect(() => {
    let current = 14;
    const interval = setInterval(() => {
      const remaining = 98 - current;
      if (remaining > 0.4) {
        // Natural deceleration curve: brisk initial progression, steady glide towards 98%
        const step = Math.max(0.65, remaining * 0.08);
        current = Math.min(98, current + step);
        setProgress(Math.round(current));
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  const cleanRoute = (route || "").split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const meta = ROUTE_INFO_MAP[cleanRoute] || {
    titleEn: "Tamil Sangam",
    titleTa: "தமிழ்ச்சங்கம்",
    subtitleEn: "Entering Sanctuary",
  };

  const english = titleEn || meta.titleEn;
  const tamil = titleTa || meta.titleTa;
  const normalizedProgress = progress / 100;

  const content = (
    <div
      className={`relative z-10 flex flex-col items-center justify-center select-none text-center px-4 transition-all duration-300 ${
        isExpanding ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* 1. Progress-Driven Kolam Weaving Motif */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 120 120"
          width={size}
          height={size}
          className="overflow-visible"
          aria-hidden="true"
        >
          {/* Subtle Outer Guideline Ring (slow gentle rotation) */}
          <circle
            cx="60"
            cy="60"
            r="53"
            fill="none"
            stroke="#C79347"
            strokeWidth="0.75"
            strokeDasharray="3 5"
            opacity="0.3"
            style={
              reducedMotion
                ? undefined
                : {
                    animation: "spin 24s linear infinite",
                    transformOrigin: "60px 60px",
                  }
            }
          />

          {/* Inner Accent Ring with Soft Teal Glow */}
          <circle
            cx="60"
            cy="60"
            r="16"
            fill="none"
            stroke="#2BB5A8"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.5"
            style={
              reducedMotion
                ? undefined
                : {
                    animation: "spin 12s linear infinite reverse",
                    transformOrigin: "60px 60px",
                  }
            }
          />

          {/* 5-Pulli Dot Lattice: Illuminates in sequence as Kolam ribbon reaches each quadrant */}
          {PULLIS.map((p) => {
            const isReached = progress >= p.threshold;
            return (
              <g key={p.id}>
                {isReached && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.r + 2.5}
                    fill={p.center ? "rgba(199, 147, 71, 0.2)" : "rgba(43, 181, 168, 0.2)"}
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.r}
                  fill={
                    p.center
                      ? "#C79347"
                      : isReached
                      ? "#2BB5A8"
                      : "rgba(203, 187, 168, 0.35)"
                  }
                  style={{
                    transition: "fill 0.3s ease, transform 0.3s ease",
                  }}
                />
              </g>
            );
          })}

          {/* Continuous Sacred 4-Petal Sikku Knotwork (Brahmamudi Loop) */}
          {/* pathLength is dynamically bound to loading progress: thread physically weaves! */}
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
            stroke="#C79347"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: "drop-shadow(0 0 6px rgba(199, 147, 71, 0.45))",
            }}
            initial={reducedMotion ? false : { pathLength: 0.14 }}
            animate={
              reducedMotion
                ? { pathLength: 1 }
                : { pathLength: Math.min(1, Math.max(0.14, normalizedProgress)) }
            }
            transition={{ ease: "easeOut", duration: 0.18 }}
          />
        </svg>
      </div>

      {/* 2. Bilingual Editorial Header */}
      <div className="mt-4 flex flex-col items-center">
        <h2 className="font-serif text-base sm:text-lg tracking-wider text-[#FAF5ED] font-medium leading-tight">
          {english}
        </h2>
        <span
          lang="ta"
          style={{ letterSpacing: 0 }}
          className="font-tamil text-xs sm:text-sm text-[#C79347] font-medium mt-1 leading-none"
        >
          {tamil}
        </span>
      </div>

      {/* 3. Sleek Ceremonial Progress Bar & Telemetry */}
      <div className="mt-5 flex flex-col items-center w-52 sm:w-60">
        {/* Track Container */}
        <div className="w-full h-[2.5px] rounded-full bg-white/10 overflow-hidden relative border border-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#C79347] via-[#2BB5A8] to-[#C79347] shadow-[0_0_12px_rgba(199,147,71,0.6)]"
            initial={{ width: "14%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.15 }}
          />
        </div>

        {/* Status Label & Percentage Readout */}
        <div className="flex items-center justify-between w-full mt-2 font-mono text-[10px] tracking-wider text-[#CBBBA8]/80">
          <span className="uppercase text-[#2BB5A8] tracking-[0.16em] font-medium">
            {meta.subtitleEn}
          </span>
          <span className="font-semibold text-[#FAF5ED] tabular-nums font-mono">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-[9990] flex items-center justify-center bg-[#1C122B] text-[#FAF5ED] overflow-hidden ${className}`}
        aria-live="polite"
        aria-busy="true"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Warm Ambient Courtyard Light Bloom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 700px 450px at 50% 50%, rgba(199, 147, 71, 0.08) 0%, rgba(43, 181, 168, 0.04) 45%, transparent 75%)",
          }}
          aria-hidden="true"
        />
        {content}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-[#1C122B] text-[#FAF5ED] min-h-[260px] py-12 ${className}`}
      aria-live="polite"
      aria-busy="true"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Warm Ambient Light Bloom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(199, 147, 71, 0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      {content}
    </div>
  );
};

export default KolamLoader;
