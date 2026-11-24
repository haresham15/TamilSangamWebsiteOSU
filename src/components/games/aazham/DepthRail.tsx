// src/components/games/aazham/DepthRail.tsx
"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { type AazhamRoundResult } from "@/lib/aazhamStorage";
import { AAZHAM_TIER_META, type AazhamTier } from "@/data/aazhamData";

interface DepthRailProps {
  currentDepth: number; // 0 to 7000
  roundResults: AazhamRoundResult[];
}

const MILESTONES = [
  { depth: 0, label: "0m", stratum: "SURFACE" },
  { depth: 1000, label: "1k", stratum: "REEF" },
  { depth: 2500, label: "2.5k", stratum: "POOMPUHAR" },
  { depth: 4500, label: "4.5k", stratum: "KAPATA" },
  { depth: 7000, label: "7k", stratum: "ABYSS" },
];

export function DepthRail({ currentDepth, roundResults }: DepthRailProps) {
  const depthFraction = Math.max(0, Math.min(1, currentDepth / 7000));

  // Cumulative depth coordinates for round pins
  const pinData = useMemo(() => {
    let runningDepth = 0;
    return roundResults.map((r, i) => {
      runningDepth += r.depthMeters;
      const frac = runningDepth / 7000;
      const meta = r.tier > 0 ? AAZHAM_TIER_META[r.tier as AazhamTier] : null;
      return {
        roundNum: i + 1,
        depth: runningDepth,
        fraction: frac,
        color: meta ? meta.badgeColor : "#F43F5E",
        tier: r.tier,
      };
    });
  }, [roundResults]);

  return (
    <>
      {/* =================================================================== */}
      {/* DESKTOP VERTICAL DEPTH RULER (>= 768px, 68px width)                 */}
      {/* =================================================================== */}
      <aside
        aria-label="Bathymetric Depth Rail"
        className="hidden md:flex absolute top-14 left-0 bottom-0 w-[68px] z-20 flex-col items-center border-r border-white/[0.08] bg-[#02080C]/40 backdrop-blur-sm select-none"
      >
        {/* Ruler Track Container */}
        <div className="relative w-full h-full pt-4 pb-6 flex flex-col items-center">
          {/* Vertical Center Axis Line */}
          <div className="absolute top-4 bottom-6 right-2 w-[1px] bg-white/[0.12]" />

          {/* Tick Marks (28 intervals of 250m = 7000m) */}
          <div className="relative w-full h-full">
            {Array.from({ length: 29 }).map((_, i) => {
              const depth = i * 250;
              const topPercent = (depth / 7000) * 100;
              const isMajor = depth % 1000 === 0 || depth === 2500 || depth === 4500 || depth === 7000;
              const isPassed = currentDepth >= depth;

              return (
                <div
                  key={depth}
                  className="absolute right-0 flex items-center justify-end pr-2"
                  style={{ top: `${topPercent}%` }}
                >
                  {/* Milestone Label */}
                  {isMajor && (
                    <span
                      className={`text-[9px] font-mono tabular-nums tracking-tighter mr-2 transition-colors ${
                        isPassed ? "text-[#DFB968] font-bold" : "text-white/30"
                      }`}
                    >
                      {depth === 0 ? "0m" : `${depth / 1000}k`}
                    </span>
                  )}

                  {/* Tick Line */}
                  <div
                    className={`h-[1px] transition-colors ${
                      isMajor
                        ? isPassed
                          ? "w-2.5 bg-[#DFB968]"
                          : "w-2.5 bg-white/40"
                        : "w-1.5 bg-white/15"
                    }`}
                  />
                </div>
              );
            })}

            {/* Submerged Strata Callouts on Rail */}
            {MILESTONES.map((m) => {
              const topPercent = (m.depth / 7000) * 100;
              const isPassed = currentDepth >= m.depth;

              return (
                <div
                  key={m.stratum}
                  className="absolute left-1.5 -translate-y-1/2 flex items-center pointer-events-none"
                  style={{ top: `${topPercent}%` }}
                >
                  <span
                    className={`text-[7.5px] font-mono uppercase tracking-widest writing-vertical rotate-180 transition-colors ${
                      isPassed ? "text-[#5EEAD4] font-semibold" : "text-white/20"
                    }`}
                    style={{ writingMode: "vertical-rl" }}
                  >
                    {m.stratum}
                  </span>
                </div>
              );
            })}

            {/* Dropped Round Milestone Pins */}
            {pinData.map((pin) => (
              <div
                key={pin.roundNum}
                className="absolute right-1 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                style={{ top: `${pin.fraction * 100}%` }}
              >
                <div
                  className="size-1.5 rounded-full border border-black/40"
                  style={{
                    backgroundColor: pin.color,
                    boxShadow: `0 0 6px ${pin.color}`,
                  }}
                  title={`Round 0${pin.roundNum} at ${pin.depth}m`}
                />
              </div>
            ))}

            {/* LIVE DIVER POSITION NEEDLE */}
            <motion.div
              animate={{
                top: `${depthFraction * 100}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 80,
                damping: 20,
              }}
              className="absolute right-0 -translate-y-1/2 flex items-center z-30 pointer-events-none"
            >
              {/* Luminous Diver Pointer Tag */}
              <div className="flex items-center">
                <div className="size-2 rounded-full bg-[#5EEAD4] border border-white shadow-[0_0_8px_#5EEAD4]" />
                <div className="w-4 h-[1.5px] bg-[#5EEAD4]" />
              </div>
            </motion.div>
          </div>
        </div>
      </aside>

      {/* =================================================================== */}
      {/* MOBILE HORIZONTAL DEPTH TICKER (< 768px, 24px height)               */}
      {/* =================================================================== */}
      <div
        aria-label="Mobile Depth Ticker"
        className="md:hidden relative z-20 w-full h-6 px-4 bg-[#02080C]/80 border-b border-white/[0.08] flex items-center select-none text-[10px] font-mono text-white/50"
      >
        <span className="text-[9px] uppercase tracking-wider text-[#DFB968] font-bold mr-2 shrink-0">
          SURFACE
        </span>

        {/* Progress Bar Track */}
        <div className="relative flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${depthFraction * 100}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="h-full bg-linear-to-r from-[#5EEAD4] via-[#DFB968] to-[#00F5D4]"
          />
        </div>

        <span className="text-[9px] uppercase tracking-wider text-[#00F5D4] font-bold ml-2 shrink-0">
          7k ABYSS
        </span>
      </div>
    </>
  );
}
