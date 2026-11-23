// src/components/ui/KolamLoader.tsx
"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";

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
  { id: "center", x: 60, y: 60, r: 2.8, center: true }, // Sacred Bindu Center
  { id: "north", x: 60, y: 34, r: 2.0, center: false }, // North
  { id: "east", x: 86, y: 60, r: 2.0, center: false },  // East
  { id: "south", x: 60, y: 86, r: 2.0, center: false }, // South
  { id: "west", x: 34, y: 60, r: 2.0, center: false },  // West
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

  const cleanRoute = (route || "").split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const meta = ROUTE_INFO_MAP[cleanRoute] || {
    titleEn: "Tamil Sangam",
    titleTa: "தமிழ்ச்சங்கம்",
    subtitleEn: "Entering Sanctuary",
  };

  const english = titleEn || meta.titleEn;
  const tamil = titleTa || meta.titleTa;

  const content = (
    <div
      className={`relative z-10 flex flex-col items-center justify-center select-none text-center px-4 max-w-full transition-all duration-300 ${
        isExpanding ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* 1. GPU-Accelerated Kolam Weaving Motif (Runs off main JS thread: never freezes or hitches) */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size, maxWidth: "70vw", maxHeight: "70vw" }}
      >
        <svg
          viewBox="0 0 120 120"
          width={size}
          height={size}
          className="overflow-visible w-full h-full"
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

          {/* 5-Pulli Dot Lattice: Center Bindu + 4 Directional Dots */}
          {PULLIS.map((p) => (
            <g key={p.id}>
              {p.center ? (
                <>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.r + 2.5}
                    fill="rgba(199, 147, 71, 0.25)"
                    className={reducedMotion ? "" : "animate-pulse"}
                  />
                  <circle cx={p.x} cy={p.y} r={p.r} fill="#C79347" />
                </>
              ) : (
                <>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.r + 1.8}
                    fill="rgba(43, 181, 168, 0.2)"
                    className={reducedMotion ? "" : "animate-pulse"}
                  />
                  <circle cx={p.x} cy={p.y} r={p.r} fill="#2BB5A8" />
                </>
              )}
            </g>
          ))}

          {/* Base Ghost Path: Outlines the sacred knotwork geometry */}
          <path
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
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.22"
          />

          {/* Continuous Sacred 4-Petal Sikku Knotwork (Brahmamudi Loop) */}
          {/* Hardware-accelerated CSS stroke-dash flow: butter smooth at 60fps on GPU thread */}
          <path
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
            pathLength={100}
            fill="none"
            stroke="#C79347"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: "drop-shadow(0 0 6px rgba(199, 147, 71, 0.45))",
              strokeDasharray: reducedMotion ? "none" : "45 55",
              strokeDashoffset: 0,
              animation: reducedMotion ? "none" : "kolamWeaveFlow 2.8s linear infinite",
            }}
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

            {/* 3. Pure Ceremonial Breathing Status (Zero artificial progress bars or percentages) */}
      <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[11px] tracking-widest text-[#CBBBA8]/75">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full bg-[#2BB5A8] shadow-[0_0_8px_#2BB5A8] ${
            reducedMotion ? "" : "animate-pulse"
          }`}
          aria-hidden="true"
        />
        <span className="uppercase text-[#2BB5A8] tracking-[0.18em] font-medium">
          {meta.subtitleEn}
        </span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-[9990] flex items-center justify-center bg-[var(--color-bg,#140C20)] text-[#FAF5ED] overflow-hidden select-none ${className}`}
        aria-live="polite"
        aria-busy="true"
        role="progressbar"
      >
        {/* Soft Ambient Courtyard Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 700px 450px at 50% 50%, rgba(199, 147, 71, 0.08) 0%, rgba(43, 181, 168, 0.03) 45%, transparent 75%)",
          }}
          aria-hidden="true"
        />
        {content}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full flex items-center justify-center bg-transparent text-[#FAF5ED] py-6 select-none ${className}`}
      aria-live="polite"
      aria-busy="true"
      role="progressbar"
    >
      {content}
    </div>
  );
};

export default KolamLoader;
