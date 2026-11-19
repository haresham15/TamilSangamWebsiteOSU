// src/components/games/aazham/DiveResults.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Share2,
  Check,
  RotateCcw,
  Sparkles,
  Compass,
  AlertTriangle,
  ArrowLeft,
  Anchor,
} from "lucide-react";
import {
  type AazhamDiveEdition,
  type AazhamTier,
  AAZHAM_TIER_META,
  getAazhamRank,
} from "@/data/aazhamData";
import { type AazhamRoundResult } from "@/lib/aazhamStorage";

interface DiveResultsProps {
  edition: AazhamDiveEdition;
  roundResults: AazhamRoundResult[];
  onPlayAgain: () => void;
  onBackToArcade?: () => void;
}

export function DiveResults({
  edition,
  roundResults,
  onPlayAgain,
  onBackToArcade,
}: DiveResultsProps) {
  const [copied, setCopied] = useState(false);

  const totalDepth = roundResults.reduce((acc, r) => acc + r.depthMeters, 0);
  const totalPoints = Math.round(totalDepth / 10);
  const rank = getAazhamRank(totalDepth);

  const valampuriCount = roundResults.filter((r) => r.tier === 100).length;
  const trapsHit = roundResults.filter((r) => r.trapTriggered || r.tier === 15).length;

  const generateShareText = () => {
    const tierEmojis: Record<number, string> = {
      10: "🌊", // Surface
      15: "🧠", // Trap
      30: "🐟", // Swimmer
      60: "🐚", // Deep
      85: "🏛️", // Poompuhar
      100: "💎", // Valampuri
      0: "⏱️", // Timeout
    };

    const emojis = roundResults.map((r) => tierEmojis[r.tier] || "❓").join(" ");

    return `🌊 AAZHAM (ஆழம்) · Dive #${edition.editionNo}
Final Depth: ${totalDepth.toLocaleString()}m / 7,000m (${rank.titleEn} · ${rank.titleTa})
${emojis}
Valampuri: ${valampuriCount} 💎 | Traps: ${trapsHit} 🧠

Descend the Sangam Trench:
https://tamil-sangam-website-osu.vercel.app/games?game=aazham&edition=${edition.id}`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Clipboard error fallback
      }
    }
  };

  return (
    <div className="relative z-30 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 min-h-[calc(100dvh-56px)] flex flex-col gap-8 select-none text-[#F4F7F5]">
      {/* 1. HERO BATHYMETRIC DEPTH PLAQUE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl bg-[#020B10]/75 backdrop-blur-md border border-white/[0.12] p-6 sm:p-8 shadow-2xl text-center"
      >
        {/* Subtle Watermark Glyph */}
        <div
          lang="ta"
          className="absolute -top-6 -right-6 font-tamil text-[11rem] opacity-[0.035] pointer-events-none select-none text-[#5EEAD4]"
        >
          ஆழம்
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-[0.24em] text-[#DFB968]">
            <Compass className="size-3.5" />
            <span>Descent Log Completed ◆ {edition.titleEn}</span>
          </div>

          {/* Odometer Depth Readout */}
          <h1 className="text-4xl sm:text-6xl font-serif font-normal text-[#F4F7F5] tracking-tight">
            <span
              className="tabular-nums font-mono text-[#5EEAD4] font-bold"
              style={{ textShadow: "0 0 20px rgba(94,234,212,0.4)" }}
            >
              {totalDepth.toLocaleString()}
            </span>
            <span className="text-2xl sm:text-3xl font-serif text-white/60 ml-2">
              meters
            </span>
            <span className="text-xs sm:text-sm font-mono text-white/40 ml-3 block sm:inline">
              ({totalPoints} / 700 pts)
            </span>
          </h1>

          {/* Maritime Rank Badge */}
          <div className="mt-3 flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl font-serif text-[#DFB968]">
              {rank.titleEn}
            </span>
            <span className="text-white/30">·</span>
            <span
              lang="ta"
              className="font-tamil text-lg sm:text-xl text-[#A7C7C9]"
            >
              {rank.titleTa}
            </span>
          </div>

          <p className="max-w-xl text-xs sm:text-sm font-sans text-white/70 mt-2 leading-relaxed">
            {rank.loreEn}
          </p>

          {/* Miniature Dive Profile Chart (7 Drops) */}
          <div className="w-full max-w-md mt-6 pt-5 border-t border-white/[0.08] flex items-end justify-between h-20 px-4">
            {roundResults.map((r, i) => {
              const heightPercent = Math.max(8, (r.depthMeters / 1000) * 100);
              const meta = r.tier > 0 ? AAZHAM_TIER_META[r.tier as AazhamTier] : null;
              const barColor = meta ? meta.badgeColor : "#F43F5E";

              return (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-[9px] font-mono text-white/40">
                    +{r.depthMeters}m
                  </span>
                  <div
                    className="w-4 rounded-t-xs transition-all duration-500"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: barColor,
                      boxShadow: `0 0 8px ${barColor}55`,
                    }}
                  />
                  <span className="text-[9px] font-mono text-white/50">
                    0{i + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <span className="px-3 py-1 rounded-md bg-black/40 border border-[#00F5D4]/40 text-[#00F5D4] flex items-center gap-1.5">
              <Sparkles className="size-3" />
              <span>Valampuri (100pt): {valampuriCount}</span>
            </span>

            <span className="px-3 py-1 rounded-md bg-black/40 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="size-3 text-amber-400" />
              <span>Traps Hit: {trapsHit}</span>
            </span>

            <span className="px-3 py-1 rounded-md bg-black/40 border border-white/15 text-white/70 flex items-center gap-1.5">
              <Anchor className="size-3 text-[#DFB968]" />
              <span>Success: {roundResults.filter((r) => r.tier > 0).length} / 7</span>
            </span>
          </div>

          {/* Actions */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#5EEAD4] text-[#02080C] hover:bg-[#4dd2bd] font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(94,234,212,0.3)] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  <span>Dossier Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="size-4" />
                  <span>Share Dive Card</span>
                </>
              )}
            </button>

            <button
              onClick={onPlayAgain}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <RotateCcw className="size-4 text-[#DFB968]" />
              <span>Dive Again</span>
            </button>

            {onBackToArcade && (
              <button
                onClick={onBackToArcade}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-transparent text-white/60 hover:text-white font-mono text-xs uppercase tracking-wider transition-all"
              >
                <ArrowLeft className="size-3.5" />
                <span>Return to Arcade</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. 7-ROUND DIVE LOG & CULTURAL EXPANSION */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] font-mono text-xs text-white/50">
          <span className="uppercase tracking-widest text-[#DFB968] font-bold">
            BATHYMETRIC DIVE LOG ◆ ஏழு சுற்றுகளின் முடிவு
          </span>
          <span>7 PROMPTS AUDITED</span>
        </div>

        <div className="flex flex-col gap-3">
          {edition.prompts.map((prompt, idx) => {
            const result = roundResults[idx];
            const isTimeout = !result || result.tier === 0;
            const tierMeta = !isTimeout ? AAZHAM_TIER_META[result.tier as AazhamTier] : null;

            const trapEntity = prompt.answers.find((a) => a.tier === 15);
            const deepCuts = prompt.answers.filter((a) => a.tier >= 85).slice(0, 2);

            return (
              <div
                key={prompt.id}
                className="rounded-xl bg-[#020B10]/60 border border-white/[0.08] p-4 sm:p-5 flex flex-col gap-3"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[#DFB968] font-bold">
                      0{prompt.order}
                    </span>
                    <span className="text-white/40 uppercase tracking-widest text-[10px]">
                      {prompt.category}
                    </span>
                  </div>

                  {tierMeta ? (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border"
                      style={{
                        backgroundColor: `${tierMeta.badgeColor}22`,
                        borderColor: `${tierMeta.badgeColor}66`,
                        color: tierMeta.badgeColor,
                      }}
                    >
                      {tierMeta.nameEn} (+{tierMeta.depthMeters}m)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-950/60 border border-rose-500/40 text-rose-300">
                      Timeout (0m)
                    </span>
                  )}
                </div>

                {/* Prompt Title */}
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-normal text-white">
                    {prompt.titleEn}
                  </h3>
                  <p
                    lang="ta"
                    className="font-tamil text-xs sm:text-sm text-[#A7C7C9] mt-0.5"
                  >
                    {prompt.titleTa}
                  </p>
                </div>

                {/* Answer Lock Row */}
                <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06] text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-white/40 mr-2">Your Answer:</span>
                    <span className="font-bold text-white">
                      {result?.userGuess || "No entry recorded"}
                    </span>
                    {result?.matchedDisplayNameTa && (
                      <span
                        lang="ta"
                        className="font-tamil text-[#DFB968] ml-2"
                      >
                        ({result.matchedDisplayNameTa})
                      </span>
                    )}
                  </div>

                  {result?.trapTriggered && (
                    <span className="text-amber-400 flex items-center gap-1 font-bold">
                      <AlertTriangle className="size-3" />
                      <span>Fell into the Over-Smart Trap!</span>
                    </span>
                  )}
                </div>

                {/* Educational Blurb */}
                {result?.culturalBlurb && (
                  <div className="text-xs font-sans text-white/80 bg-[#5EEAD4]/[0.06] p-2.5 rounded-lg border border-[#5EEAD4]/20 leading-relaxed">
                    <span className="font-bold text-[#5EEAD4] mr-1">Cultural Lore:</span>
                    {result.culturalBlurb}
                  </div>
                )}

                {/* Obvious Trap vs Valampuri Deep Cuts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  <div className="p-2 rounded-md bg-black/25 border border-white/[0.05]">
                    <span className="text-amber-400 font-bold block mb-0.5">
                      The Obvious Trap (15pt):
                    </span>
                    <span className="text-white/80">
                      {prompt.trapAnswer}
                      {trapEntity?.trapWarning && (
                        <span className="block text-[10px] text-white/40 italic mt-0.5">
                          &ldquo;{trapEntity.trapWarning}&rdquo;
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="p-2 rounded-md bg-black/25 border border-white/[0.05]">
                    <span className="text-[#5EEAD4] font-bold block mb-0.5">
                      Valampuri Deep Cuts (85–100pt):
                    </span>
                    <div className="flex flex-col gap-0.5 text-white/80">
                      {deepCuts.map((cut) => (
                        <span key={cut.id}>
                          • {cut.displayEn} ({cut.tier}pt)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
