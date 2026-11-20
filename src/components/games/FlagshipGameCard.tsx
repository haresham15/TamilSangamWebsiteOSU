// src/components/games/FlagshipGameCard.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, X, Landmark } from "lucide-react";

export interface FlagshipGameCardProps {
  gameKey: "sollu" | "thodarpu" | "aazham";
  titleEn: string;
  titleTa: string;
  eyebrowEn: string;
  badgeText: string;
  accentColor: string;
  hoverBorderColor: string;
  description: string;
  thumbnail: React.ReactNode;
  actionText: string;
  originalGame: string;
  originalGameSubtitle: string;
  originalGameDescription: string;
  alteredTamilVersion: string;
  alteredTamilTwist: string;
  onSelect: () => void;
}

export function FlagshipGameCard({
  titleEn,
  titleTa,
  eyebrowEn,
  badgeText,
  accentColor,
  hoverBorderColor,
  description,
  thumbnail,
  actionText,
  originalGame,
  originalGameSubtitle,
  originalGameDescription,
  alteredTamilVersion,
  alteredTamilTwist,
  onSelect,
}: FlagshipGameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const showInfoOverlay = isHovered || isPinned;

  return (
    <div
      className="relative block h-full group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.article
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        onClick={onSelect}
        className={`cursor-pointer relative h-full min-h-[400px] bg-[#271A3C] rounded-2xl border-2 border-[rgba(212,163,106,0.24)] p-5 flex flex-col justify-between shadow-lg transition-all duration-200 text-[#FAF5ED] overflow-hidden ${hoverBorderColor}`}
      >
        <div>
          {/* Top Bar: Eyebrow, Badge, Info Trigger */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(212,163,106,0.2)]">
            <span
              className="font-mono text-xs uppercase tracking-wider font-semibold"
              style={{ color: accentColor }}
            >
              {eyebrowEn}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPinned((prev) => !prev);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-[#C79347] bg-[#1C122B] border border-[rgba(212,163,106,0.35)] hover:border-[#C79347] hover:bg-[#C79347]/15 transition-colors"
                title="Hover or tap for Original vs Tamil comparison"
                aria-label="Show original game and Tamil adaptation info"
              >
                <Sparkles className="w-2.5 h-2.5 text-[#C79347]" />
                <span>Info ✦</span>
              </button>

              <span
                className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
                style={{ color: accentColor, borderColor: `${accentColor}40` }}
              >
                {badgeText}
              </span>
            </div>
          </div>

          {/* Titles */}
          <h4 className="font-serif text-2xl text-[#FAF5ED] font-medium tracking-tight mb-1 flex items-baseline gap-2">
            <span>{titleEn}</span>
            <span className="text-white/40">·</span>
            <span
              lang="ta"
              style={{ color: accentColor, letterSpacing: 0 }}
              className="font-sans font-normal text-xl"
            >
              {titleTa}
            </span>
          </h4>

          {/* Description */}
          <p className="font-sans text-xs text-[#CBBBA8] leading-relaxed mb-3 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Thumbnail Preview Area */}
        <div className="my-1">{thumbnail}</div>

        {/* Resting Blueprint Hint Bar */}
        <div>
          <div className="mt-3 pt-2.5 border-t border-[rgba(212,163,106,0.15)] flex items-center justify-between text-[10px] font-mono text-[#CBBBA8]/80">
            <span className="truncate">
              <span className="text-[#CBBBA8]/50">Orig:</span>{" "}
              <span className="text-[#D4A36A] font-medium">{originalGame}</span>
            </span>
            <span className="text-[#C79347] font-medium flex items-center gap-1 shrink-0 ml-1">
              <span>Hover for info</span>
              <ArrowRight className="w-2.5 h-2.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Bottom Action */}
          <div
            className="mt-3 pt-3 border-t border-[rgba(212,163,106,0.2)] flex items-center justify-between text-xs font-mono font-semibold"
            style={{ color: accentColor }}
          >
            <span className="group-hover:underline">{actionText}</span>
            <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.article>

      {/* ------------------------------------------------------------------ */}
      {/* QUICK LITTLE INFO CARD OVERLAY (HOVER & FOCUS & TOUCH PIN)          */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {showInfoOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-30 rounded-2xl bg-[#180E27]/98 backdrop-blur-md p-5 flex flex-col justify-between border-2 border-[#C79347] shadow-[0_16px_40px_rgba(0,0,0,0.65)] text-[#FAF5ED]"
            onClick={(e) => {
              // If user clicks on the overlay, launch the game!
              onSelect();
            }}
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[rgba(212,163,106,0.25)] text-xs font-mono">
                <div className="flex items-center gap-1.5 text-[#C79347] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">Game Blueprint</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                    style={{ color: accentColor, backgroundColor: `${accentColor}15` }}
                  >
                    Flagship
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPinned(false);
                      setIsHovered(false);
                    }}
                    className="p-1 rounded-md text-[#CBBBA8] hover:text-[#FAF5ED] hover:bg-white/10 transition-colors"
                    aria-label="Close info card"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Original Mainstream Game Inspiration */}
              <div className="rounded-xl bg-[#140C20]/80 border border-[rgba(212,163,106,0.2)] p-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#CBBBA8]/80 font-bold flex items-center gap-1.5">
                    <Landmark className="w-3 h-3 text-[#D4A36A]" />
                    <span>Original Game</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#D4A36A] font-semibold">
                    {originalGame}
                  </span>
                </div>
                <div className="text-xs font-serif font-medium text-[#FAF5ED] mb-0.5">
                  {originalGameSubtitle}
                </div>
                <p className="text-[11px] text-[#CBBBA8] leading-relaxed font-sans line-clamp-2">
                  {originalGameDescription}
                </p>
              </div>

              {/* Altered Tamil Cultural Transformation */}
              <div className="rounded-xl bg-[#25173B]/90 border border-[#2BB5A8]/30 p-3 shadow-inner">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#2BB5A8] font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#2BB5A8]" />
                    <span>Tamil Adaptation</span>
                  </span>
                  <span
                    lang="ta"
                    className="text-[11px] font-sans text-[#2BB5A8]"
                    style={{ letterSpacing: 0 }}
                  >
                    {titleTa}
                  </span>
                </div>
                <div className="text-xs font-serif font-medium text-[#FAF5ED] mb-0.5">
                  {alteredTamilVersion}
                </div>
                <p className="text-[11px] text-[#E0D7C9] leading-relaxed font-sans line-clamp-3">
                  {alteredTamilTwist}
                </p>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-3 border-t border-[rgba(212,163,106,0.25)] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#CBBBA8]">
                Biweekly Cultural Edition
              </span>
              <button
                type="button"
                onClick={onSelect}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#C79347] to-[#D4A36A] text-[#1C122B] text-xs font-mono font-bold uppercase tracking-wider hover:brightness-110 shadow transition-all"
              >
                <span>{actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
