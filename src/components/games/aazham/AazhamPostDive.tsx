// src/components/games/aazham/AazhamPostDive.tsx
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
  Award,
  BookOpen,
} from "lucide-react";
import {
  type AazhamDiveEdition,
  type AazhamTier,
  AAZHAM_TIER_META,
  getAazhamRank,
} from "@/data/aazhamData";
import type { AazhamRoundResult } from "@/lib/aazhamStorage";

interface AazhamPostDiveProps {
  edition: AazhamDiveEdition;
  roundResults: AazhamRoundResult[];
  onPlayAgain: () => void;
}

export function AazhamPostDive({
  edition,
  roundResults,
  onPlayAgain,
}: AazhamPostDiveProps) {
  const [copied, setCopied] = useState(false);

  // Compute final score and depth
  const totalDepth = roundResults.reduce((acc, r) => acc + r.depthMeters, 0);
  const totalPoints = totalDepth / 10;
  const rank = getAazhamRank(totalDepth);

  // Valampuri counts
  const valampuriCount = roundResults.filter((r) => r.tier === 100).length;
  const trapsHit = roundResults.filter((r) => r.trapTriggered || r.tier === 15).length;

  // Generate shareable text
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
Valampuri Pearls: ${valampuriCount} | Traps: ${trapsHit}

Dive into the Sangam Trench:
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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 text-[#F4F0FA]">
      {/* 1. HERO RANK & DEPTH BANNER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-radial from-[#25173B] via-[#140C20] to-[#0A0710] p-6 sm:p-8 border-2 border-[#A6F0CF]/40 shadow-2xl text-center"
      >
        <div lang="ta" className="absolute top-0 right-0 p-8 opacity-10 font-tamil text-8xl pointer-events-none select-none text-[#A6F0CF]">
          ஆழம்
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#140C20] border border-[#A6F0CF]/40 text-[#A6F0CF] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Compass className="size-3.5" />
            <span>Descent Completed · {edition.titleEn}</span>
          </span>

          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#F4F0FA] tracking-tight">
            {totalDepth.toLocaleString()}
            <span className="text-xl sm:text-2xl text-[#A6F0CF] font-sans font-normal ml-1">
              meters
            </span>
            <span className="text-xs sm:text-sm text-[#F4F0FA]/50 font-mono ml-2 block sm:inline">
              ({totalPoints} / 700 pts)
            </span>
          </h2>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-lg sm:text-xl font-medium text-[#A6F0CF]">
              {rank.titleEn}
            </span>
            <span className="text-[#F4F0FA]/40">·</span>
            <span
              lang="ta"
              className="font-tamil text-base sm:text-lg text-[#C4B7D7]"
            >
              {rank.titleTa}
            </span>
          </div>

          <p className="max-w-xl text-xs sm:text-sm text-[#F4F0FA]/75 font-sans mt-2 leading-relaxed">
            {rank.loreEn}
          </p>

          {/* Quick Stats Pill Strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <span className="px-3 py-1 rounded-lg bg-[#140C20] border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="size-3 text-[#A6F0CF]" />
              <span>Valampuri (100pt): {valampuriCount}</span>
            </span>

            <span className="px-3 py-1 rounded-lg bg-[#140C20] border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="size-3 text-amber-400" />
              <span>Traps Hit: {trapsHit}</span>
            </span>

            <span className="px-3 py-1 rounded-lg bg-[#140C20] border border-[rgba(125,96,166,0.4)] text-[#C4B7D7] flex items-center gap-1.5">
              <Award className="size-3 text-[#A6F0CF]" />
              <span>Accuracy: {roundResults.filter((r) => r.tier > 0).length} / 7</span>
            </span>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A6F0CF] text-[#140C20] hover:bg-[#86e8b8] font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(166,240,207,0.25)]"
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  <span>Dossier Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="size-4" />
                  <span>Share Dive Results</span>
                </>
              )}
            </button>

            <button
              onClick={onPlayAgain}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25173B] hover:bg-[#341F52] border border-[rgba(125,96,166,0.4)] text-[#F4F0FA] font-mono font-bold text-xs uppercase tracking-wider transition-all"
            >
              <RotateCcw className="size-4 text-[#A6F0CF]" />
              <span>Retry Dive</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. THE SUNKEN ARCHIVES DOSSIER (EDUCATIONAL BREAKDOWN) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[rgba(125,96,166,0.3)]">
          <h3 className="text-lg font-serif font-normal text-[#F4F0FA] flex items-center gap-2">
            <BookOpen className="size-4 text-[#A6F0CF]" />
            <span>
              The Sunken Archive Dossier ·{" "}
              <span lang="ta" className="font-tamil text-sm text-[#C4B7D7]">
                ஏழு வினாக்களின் விரிவு
              </span>
            </span>
          </h3>
          <span className="text-xs font-mono text-[#A6F0CF]">
            Round Analysis & Cultural Lore
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {edition.prompts.map((prompt, idx) => {
            const result = roundResults[idx];
            const tierMeta = result && result.tier > 0 ? AAZHAM_TIER_META[result.tier as AazhamTier] : null;

            // Obvious & Trap entities
            const trapEntity = prompt.answers.find((a) => a.tier === 15);
            // High tier deep cuts you could have guessed
            const rareCuts = prompt.answers.filter((a) => a.tier >= 85).slice(0, 2);

            return (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl bg-[#140C20]/80 border border-[rgba(125,96,166,0.3)] p-4 sm:p-5 flex flex-col gap-3"
              >
                {/* Prompt Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded-md bg-[#25173B] text-[10px] font-mono text-[#A6F0CF] font-bold">
                      Round 0{prompt.order}
                    </span>
                    <span className="text-xs font-mono text-[#C4B7D7] uppercase tracking-wider">
                      {prompt.category}
                    </span>
                  </div>

                  {tierMeta ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${tierMeta.bgStyle} ${tierMeta.borderColor}`}
                        style={{ color: tierMeta.textColor }}
                      >
                        {tierMeta.nameEn} (+{tierMeta.depthMeters}m)
                      </span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-950/60 border border-red-500/40 text-red-300">
                      Timeout (0m)
                    </span>
                  )}
                </div>

                <div className="text-sm font-sans font-medium text-[#F4F0FA]">
                  {prompt.titleEn}
                  <span
                    lang="ta"
                    className="block font-tamil text-xs text-[#C4B7D7] mt-0.5"
                  >
                    {prompt.titleTa}
                  </span>
                </div>

                {/* User's Guessed Outcome */}
                <div className="p-3 rounded-lg bg-[#25173B]/50 border border-[rgba(125,96,166,0.25)] text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[#F4F0FA]/50 mr-2">Your Answer:</span>
                    <span className="font-bold text-[#F4F0FA]">
                      {result?.userGuess || "No answer recorded"}
                    </span>
                    {result?.matchedDisplayNameTa && (
                      <span
                        lang="ta"
                        className="font-tamil text-[#A6F0CF] ml-2"
                      >
                        ({result.matchedDisplayNameTa})
                      </span>
                    )}
                  </div>

                  {result?.trapTriggered && (
                    <span className="text-amber-300 flex items-center gap-1 font-bold">
                      <AlertTriangle className="size-3" />
                      <span>Fell into the Over-Smart Trap!</span>
                    </span>
                  )}
                </div>

                {/* Cultural blurb if available */}
                {result?.culturalBlurb && (
                  <div className="text-xs font-sans text-emerald-200/90 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20 leading-relaxed">
                    <span className="font-bold text-[#A6F0CF] mr-1">Cultural Note:</span>
                    {result.culturalBlurb}
                  </div>
                )}

                {/* Obvious Trap vs Missed Deep Cuts Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  <div className="p-2 rounded-md bg-[#181126] border border-[rgba(125,96,166,0.2)]">
                    <span className="text-amber-400 font-bold block mb-0.5">
                      The Obvious Trap (15pt):
                    </span>
                    <span className="text-[#F4F0FA]/80">
                      {prompt.trapAnswer}
                      {trapEntity?.trapWarning && (
                        <span className="block text-[10px] text-[#C4B7D7] italic mt-0.5">
                          &ldquo;{trapEntity.trapWarning}&rdquo;
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="p-2 rounded-md bg-[#181126] border border-[rgba(125,96,166,0.2)]">
                    <span className="text-[#A6F0CF] font-bold block mb-0.5">
                      Valampuri Deep Cuts (85–100pt):
                    </span>
                    <div className="flex flex-col gap-0.5 text-[#F4F0FA]/80">
                      {rareCuts.map((cut) => (
                        <span key={cut.id}>
                          • {cut.displayEn} ({cut.tier}pt)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
