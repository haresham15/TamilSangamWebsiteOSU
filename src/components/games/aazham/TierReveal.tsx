// src/components/games/aazham/TierReveal.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, AlertTriangle, Sparkles, Anchor } from "lucide-react";
import { AAZHAM_TIER_META, type AazhamTier } from "@/data/aazhamData";
import { type AazhamRoundResult } from "@/lib/aazhamStorage";

interface TierRevealProps {
  result: AazhamRoundResult | null;
  sampleAnswers?: { common: string; deepCut: string };
}

export function TierReveal({ result, sampleAnswers }: TierRevealProps) {
  if (!result) return null;

  const isTimeout = result.tier === 0;
  const tierMeta = !isTimeout ? AAZHAM_TIER_META[result.tier as AazhamTier] : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full rounded-xl p-5 sm:p-6 backdrop-blur-md border shadow-2xl flex flex-col items-center text-center select-none ${
        result.tier === 100
          ? "bg-[#00F5D4]/15 border-[#00F5D4]/80 shadow-[0_0_30px_rgba(0,245,212,0.25)]"
          : result.tier === 85
          ? "bg-[#DFB968]/15 border-[#DFB968]/70 shadow-[0_0_25px_rgba(223,185,104,0.2)]"
          : result.tier === 15
          ? "bg-amber-950/60 border-amber-500/70 text-amber-200"
          : !isTimeout
          ? "bg-[#041D29]/70 border-[#38BDF8]/40 text-white"
          : "bg-rose-950/60 border-rose-500/50 text-rose-200"
      }`}
    >
      {!isTimeout && tierMeta ? (
        <>
          {/* Top Stamp Label */}
          <div className="flex items-center gap-2 mb-2 font-mono text-[11px] uppercase tracking-widest font-bold">
            {result.tier === 100 ? (
              <span className="flex items-center gap-1.5 text-[#00F5D4] drop-shadow-[0_0_8px_#00F5D4]">
                <Sparkles className="size-3.5" />
                <span>VALAMPURI PEARL · KODI-IL ONNU (+1,000m)</span>
              </span>
            ) : result.tier === 15 ? (
              <span className="flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="size-3.5" />
                <span>TOO CLEVER · EVERYONE PICKED THIS (+150m)</span>
              </span>
            ) : (
              <span className="text-[#5EEAD4] flex items-center gap-1.5">
                <Compass className="size-3.5" />
                <span>
                  {tierMeta.nameEn} · {tierMeta.nameTa} (+{tierMeta.depthMeters}m)
                </span>
              </span>
            )}
          </div>

          {/* Canonical Answer & Tamil Script */}
          <div className="text-2xl sm:text-3xl md:text-4xl font-serif text-white tracking-tight flex flex-wrap items-baseline justify-center gap-2.5">
            <span className="font-medium text-[#F4F7F5]">
              {result.matchedDisplayNameEn || result.userGuess}
            </span>
            {result.matchedDisplayNameTa && (
              <span
                lang="ta"
                className="font-tamil font-normal text-xl sm:text-2xl text-[#DFB968]"
              >
                {result.matchedDisplayNameTa}
              </span>
            )}
          </div>

          {/* Educational Cultural Blurb if present */}
          {result.culturalBlurb && (
            <p className="max-w-md text-xs font-sans text-white/80 mt-2 leading-relaxed">
              <span className="text-[#DFB968] font-bold mr-1">Archive Note:</span>
              {result.culturalBlurb}
            </p>
          )}

          {/* Plunge Status Line */}
          <div className="mt-3.5 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#5EEAD4]/80">
            <span className="inline-block size-1.5 rounded-full bg-[#5EEAD4] animate-ping" />
            <span>Sinking {tierMeta.depthMeters} meters deeper into the trench...</span>
          </div>
        </>
      ) : (
        <>
          {/* Timeout Fallback */}
          <div className="flex items-center gap-1.5 text-rose-400 font-mono text-[11px] uppercase tracking-widest font-bold mb-1">
            <Anchor className="size-3.5" />
            <span>SURFACED · TIME EXPIRED (+0m)</span>
          </div>

          <h4 className="text-lg sm:text-xl font-serif text-white/90">
            No valid answer locked before the 25-second buzzer.
          </h4>

          {sampleAnswers && (
            <p className="text-xs font-mono text-white/60 mt-1.5">
              Examples: Common: <span className="text-white/90">{sampleAnswers.common}</span> · Deep Cut:{" "}
              <span className="text-[#DFB968]">{sampleAnswers.deepCut}</span>
            </p>
          )}

          <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-white/40">
            Continuing dive...
          </div>
        </>
      )}
    </motion.div>
  );
}
