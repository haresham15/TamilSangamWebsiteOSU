// src/components/games/DailyGauntletStrip.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Flame, ArrowRight, CheckCircle2 } from "lucide-react";
import { getDailyGauntletSummary, ARCADE_GAMES_CATALOG, type ArcadeGameSlug } from "@/lib/games/storage";
import { getDailyDateString } from "@/lib/games/seed";

export function DailyGauntletStrip() {
  const [summary, setSummary] = useState(() => getDailyGauntletSummary());
  const dailyDate = getDailyDateString();

  useEffect(() => {
    setSummary(getDailyGauntletSummary(dailyDate));
    // Listen for storage changes across tabs or game completions
    const handleStorage = () => {
      setSummary(getDailyGauntletSummary(dailyDate));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [dailyDate]);

  const { totalGames, solvedCount, isGauntletComplete, nextUnplayedSlug } = summary;
  const pct = Math.round((solvedCount / totalGames) * 100);

  const nextGameMeta = nextUnplayedSlug
    ? ARCADE_GAMES_CATALOG.find((g) => g.slug === nextUnplayedSlug)
    : null;

  return (
    <div className="w-full mb-10 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#1B112B] via-[#201533] to-[#1B112B] border-2 border-[rgba(166,240,207,0.35)] shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Gauntlet Title & Segmented Arc */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#25173B] border border-[rgba(166,240,207,0.4)] text-[#A6F0CF] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(166,240,207,0.15)]">
            {isGauntletComplete ? (
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
            ) : (
              <Trophy className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A6F0CF] font-bold">
                DAILY GAUNTLET
              </span>
              <span className="text-[10px] font-mono text-[#C4B7D7]/60">·</span>
              <span lang="ta" className="text-xs text-[#E5B869]" style={{ letterSpacing: 0 }}>
                தினசரி களஞ்சியம்
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-medium text-[#F4F0FA] mt-0.5">
              {solvedCount} of {totalGames} Solved Today
            </h3>
          </div>
        </div>

        {/* Middle: Progress Bar with 12 Segments */}
        <div className="w-full md:w-64 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#C4B7D7]">Gauntlet Completion</span>
            <span className="text-[#A6F0CF] font-bold">{pct}%</span>
          </div>

          <div className="grid grid-cols-12 gap-1 h-2 rounded-full overflow-hidden bg-[#140C20]">
            {Array.from({ length: totalGames }).map((_, idx) => (
              <div
                key={idx}
                className={`h-full transition-all duration-300 ${
                  idx < solvedCount
                    ? "bg-[#A6F0CF] shadow-[0_0_8px_#A6F0CF]"
                    : "bg-[#25173B]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: Quick Action Button */}
        <div className="shrink-0 w-full md:w-auto">
          {nextGameMeta ? (
            <Link
              href={`/games/${nextGameMeta.slug}`}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#A6F0CF] text-[#140C20] font-medium text-xs font-mono uppercase tracking-wider hover:bg-[#bbf4dc] transition-all shadow-[0_0_20px_rgba(166,240,207,0.2)] group"
            >
              <span>Play Next: {nextGameMeta.titleEn}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#A6F0CF] text-xs font-mono font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>All 12 Solved! Daily Master</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
