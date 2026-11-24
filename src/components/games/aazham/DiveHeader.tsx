// src/components/games/aazham/DiveHeader.tsx
"use client";

import React, { useMemo } from "react";
import { ArrowLeft, Volume2, VolumeX, Compass } from "lucide-react";
import { type AazhamRoundResult } from "@/lib/aazhamStorage";
import { AAZHAM_TIER_META, type AazhamTier } from "@/data/aazhamData";

interface DiveHeaderProps {
  currentDepth: number; // 0 to 7000
  currentRoundIdx: number; // 0 to 6
  roundResults: AazhamRoundResult[];
  isMuted: boolean;
  onToggleMute: () => void;
  onBackToArcade?: () => void;
  editionNo?: string;
}

export function DiveHeader({
  currentDepth,
  currentRoundIdx,
  roundResults,
  isMuted,
  onToggleMute,
  onBackToArcade,
  editionNo = "01",
}: DiveHeaderProps) {
  // Determine active zone telemetry by depth
  const zone = useMemo(() => {
    if (currentDepth >= 5800) {
      return {
        en: "KUMARI ABYSS · OCEAN FLOOR",
        ta: "குமரி ஆழி அகழி",
        accent: "#00F5D4",
      };
    }
    if (currentDepth >= 4200) {
      return {
        en: "KAPATAPURAM SANCTUARY",
        ta: "கபாடபுரம் ஆழ்கடல் தளம்",
        accent: "#2DD4BF",
      };
    }
    if (currentDepth >= 2200) {
      return {
        en: "SUNKEN POOMPUHAR ARCHIVES",
        ta: "பூம்புகார் மூழ்கிய களஞ்சியம்",
        accent: "#DFB968",
      };
    }
    if (currentDepth >= 900) {
      return {
        en: "TWILIGHT REEF · CORAL SHELF",
        ta: "பவளப் பாறை அந்தி மண்டலம்",
        accent: "#38BDF8",
      };
    }
    return {
      en: "BAY OF BENGAL · SUNLIT SURFACE",
      ta: "வங்கக்கடல் · கதிரொளிப் பரப்பு",
      accent: "#5EEAD4",
    };
  }, [currentDepth]);

  return (
    <header className="relative z-20 w-full h-14 px-4 sm:px-6 flex items-center justify-between border-b border-white/[0.08] bg-[#02080C]/70 backdrop-blur-md select-none text-xs font-mono">
      {/* 1. LEFT ZONE TELEMETRY & BACK BUTTON */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {onBackToArcade && (
          <button
            onClick={onBackToArcade}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-colors shrink-0"
            aria-label="Return to Arcade catalog"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline uppercase tracking-wider text-[10px]">
              Arcade
            </span>
          </button>
        )}

        <div className="flex flex-col min-w-0 leading-tight">
          <div className="flex items-center gap-2">
            <span
              className="size-1.5 rounded-full shrink-0"
              style={{ backgroundColor: zone.accent }}
            />
            <span className="font-bold text-white tracking-wider truncate">
              {zone.en}
            </span>
            <span className="text-white/30 hidden lg:inline">|</span>
            <span
              lang="ta"
              className="font-tamil text-white/60 hidden lg:inline text-[11px] truncate"
            >
              {zone.ta}
            </span>
          </div>
          <span className="text-[10px] text-white/40 tracking-widest hidden sm:inline">
            13.08°N · 80.27°E ◆ DIVE {editionNo}
          </span>
        </div>
      </div>

      {/* 2. CENTER 7-ROUND STATUS PEARLS */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-3">
        {Array.from({ length: 7 }).map((_, i) => {
          const result = roundResults[i];
          const isCurrent = i === currentRoundIdx && !result;
          const isDone = Boolean(result);

          let dotBg = "bg-white/15";
          let dotBorder = "border-white/20";

          if (isDone) {
            if (result.tier === 0) {
              dotBg = "bg-rose-500/80";
              dotBorder = "border-rose-400";
            } else {
              const meta = AAZHAM_TIER_META[result.tier as AazhamTier];
              dotBg = meta ? meta.bgStyle : "bg-[#DFB968]";
              dotBorder = meta ? meta.borderColor : "border-[#DFB968]";
            }
          }

          return (
            <div
              key={i}
              className="relative flex items-center justify-center"
              title={`Round 0${i + 1}${result ? `: +${result.depthMeters}m` : ""}`}
            >
              <div
                className={`size-2.5 sm:size-3 rounded-full border transition-all duration-300 ${dotBg} ${dotBorder} ${
                  isCurrent ? "ring-2 ring-white/60 scale-110" : ""
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* 3. RIGHT ODOMETER DEPTH & SOUND TOGGLE */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-baseline gap-1 bg-black/40 border border-white/10 px-3 py-1 rounded-md text-white font-mono shadow-inner">
          <span className="text-[10px] text-white/40 uppercase tracking-wider mr-1 hidden sm:inline">
            DEPTH
          </span>
          <span
            className="text-sm sm:text-base font-bold tabular-nums tracking-wider text-[#5EEAD4]"
            style={{
              textShadow: "0 0 10px rgba(94,234,212,0.35)",
            }}
          >
            {currentDepth.toString().padStart(4, "0")}
            <span className="text-xs text-white/50 ml-0.5">m</span>
          </span>
          <span className="text-[10px] text-white/30 hidden sm:inline">
            / 7,000m
          </span>
        </div>

        <button
          onClick={onToggleMute}
          className="p-1.5 rounded-lg border border-white/10 hover:border-white/30 text-white/60 hover:text-white transition-colors"
          aria-label={isMuted ? "Unmute sound" : "Mute sound"}
        >
          {isMuted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4 text-[#5EEAD4]" />
          )}
        </button>
      </div>
    </header>
  );
}
