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
    <div className="w-full mb-10 p-5 sm:p-6 rounded-3xl bg-[#271A3C] border-2 border-[#C79347]/40 shadow-xl text-[#FAF5ED]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Gauntlet Title & Segmented Arc */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1C122B] border border-[#C79347]/40 text-[#C79347] flex items-center justify-center shrink-0 shadow-sm">
            {isGauntletComplete ? (
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
            ) : (
              <Trophy className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C79347] font-bold">
                DAILY GAUNTLET
              </span>
              <span className="text-[10px] font-mono text-[#CBBBA8]/60">·</span>
              <span lang="ta" className="text-xs text-[#D4A36A]" style={{ letterSpacing: 0 }}>
                தினசரி களஞ்சியம்
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-medium text-[#FAF5ED] mt-0.5">
              {solvedCount} of {totalGames} Solved Today
            </h3>
          </div>
        </div>

        {/* Middle: Progress Bar with 12 Segments */}
        <div className="w-full md:w-64 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#CBBBA8]">Gauntlet Completion</span>
            <span className="text-[#C79347] font-bold">{pct}%</span>
          </div>

          <div className="grid grid-cols-12 gap-1 h-2 rounded-full overflow-hidden bg-[#1C122B]">
            {Array.from({ length: totalGames }).map((_, idx) => (
              <div
                key={idx}
                className={`h-full transition-all duration-300 ${
                  idx < solvedCount
                    ? "bg-[#C79347] shadow-[0_0_8px_#C79347]"
                    : "bg-[#1C122B]/60"
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
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0F766E] text-[#FAF5ED] font-medium text-xs font-mono uppercase tracking-wider hover:bg-[#0B5C56] transition-all shadow-xs group"
            >
              <span>Play Next: {nextGameMeta.titleEn}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#FAF5ED] text-xs font-mono font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>All 12 Solved! Daily Master</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
