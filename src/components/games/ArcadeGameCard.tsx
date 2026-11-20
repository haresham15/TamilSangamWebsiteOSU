// src/components/games/ArcadeGameCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Play, Clock, Sparkles, X, Info, Landmark } from "lucide-react";
import { getDailyGameRecord, type ArcadeGameMeta } from "@/lib/games/storage";
import { getDailyDateString } from "@/lib/games/seed";
import {
  KolamKnotGlyph,
  CholaCrownGlyph,
  SunMoonGlyph,
  TamilNumeralGlyph,
  QuordleGridGlyph,
  PinpointTargetGlyph,
  HoneycombGlyph,
  CrosswordGridGlyph,
  StrandsPathGlyph,
  DistrictMapGlyph,
  SoundwaveGlyph,
  MovieFilmGlyph,
} from "./ArcadeGlyphs";

interface ArcadeGameCardProps {
  meta: ArcadeGameMeta;
}

export function ArcadeGameCard({ meta }: ArcadeGameCardProps) {
  const dailyDate = getDailyDateString();
  const [record, setRecord] = useState(() =>
    getDailyGameRecord(meta.slug, dailyDate)
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    setRecord(getDailyGameRecord(meta.slug, dailyDate));
  }, [meta.slug, dailyDate]);

  const renderGlyph = () => {
    const props = { className: "w-6 h-6 text-[#C79347]" };
    switch (meta.slug) {
      case "kolam-path":
        return <KolamKnotGlyph {...props} />;
      case "arasigal":
        return <CholaCrownGlyph {...props} />;
      case "irattaichinnam":
        return <SunMoonGlyph {...props} />;
      case "en-puthir":
        return <TamilNumeralGlyph {...props} />;
      case "naanku-sorkal":
        return <QuordleGridGlyph {...props} />;
      case "thodarbu":
        return <PinpointTargetGlyph {...props} />;
      case "ezhuthu-theni":
        return <HoneycombGlyph {...props} />;
      case "kurukkezhuthu":
        return <CrosswordGridGlyph {...props} />;
      case "sol-vettai":
        return <StrandsPathGlyph {...props} />;
      case "oor-kandupidi":
        return <DistrictMapGlyph {...props} />;
      case "paadal-kandupidi":
        return <SoundwaveGlyph {...props} />;
      case "padam-kandupidi":
        return <MovieFilmGlyph {...props} />;
      default:
        return <KolamKnotGlyph {...props} />;
    }
  };

  const isSolved = record.status === "won";
  const isInProgress = record.status === "in_progress";

  const formatTimer = (sec?: number) => {
    if (!sec) return "";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const showInfoOverlay = isHovered || isPinned;

  return (
    <div
      className="relative block h-full group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/games/${meta.slug}`} className="block h-full outline-hidden">
        <motion.article
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className={`relative h-full min-h-[350px] rounded-2xl bg-[#271A3C] border-2 p-5 flex flex-col justify-between shadow-lg transition-all duration-200 text-[#FAF5ED] overflow-hidden ${
            isSolved
              ? "border-[#10B981]/40 shadow-[0_4px_20px_rgba(16,185,129,0.08)]"
              : "border-[rgba(212,163,106,0.24)] hover:border-[#C79347]/70 hover:shadow-[0_8px_25px_rgba(199,147,71,0.12)]"
          }`}
        >
          {/* Top Row: Glyph & Status Badge & Info Trigger */}
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(212,163,106,0.2)]">
              <div className="p-2.5 rounded-xl bg-[#1C122B] border border-[rgba(212,163,106,0.3)] shadow-inner">
                {renderGlyph()}
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile / Direct Blueprint Pin Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPinned((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono text-[#C79347] bg-[#1C122B] border border-[rgba(212,163,106,0.35)] hover:border-[#C79347] hover:bg-[#C79347]/15 transition-colors"
                  title="Hover or click for Original vs Tamil comparison"
                  aria-label="Show original game and Tamil adaptation info"
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#C79347]" />
                  <span>Info ✦</span>
                </button>

                {/* Status Pill */}
                {isSolved ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#10B981]/20 border border-[#10B981]/50 text-[#34D399]">
                    <Check className="w-3 h-3" />
                    <span>
                      SOLVED {record.solveTimeSeconds ? `· ${formatTimer(record.solveTimeSeconds)}` : ""}
                    </span>
                  </span>
                ) : isInProgress ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F59E0B]/20 border border-[#F59E0B]/50 text-[#FBBF24]">
                    <Clock className="w-3 h-3" />
                    <span>IN PROGRESS</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#1C122B] border border-[#C79347]/40 text-[#C79347] group-hover:bg-[#C79347] group-hover:text-[#1C122B] transition-colors">
                    <Play className="w-3 h-3 fill-current" />
                    <span>PLAY</span>
                  </span>
                )}
              </div>
            </div>

            {/* Eyebrow: Duration & Tag */}
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#CBBBA8] mb-1">
              <span>{meta.estimatedMinutes} MINS</span>
              <span>·</span>
              <span className="text-[#C79347] font-bold">{meta.tagEn}</span>
            </div>

            {/* Titles */}
            <h4 className="text-xl font-serif font-medium text-[#FAF5ED] group-hover:text-[#C79347] transition-colors flex items-baseline gap-2">
              <span>{meta.titleEn}</span>
              <span
                lang="ta"
                className="text-xs font-sans text-[#D4A36A] font-normal"
                style={{ letterSpacing: 0 }}
              >
                {meta.titleTa}
              </span>
            </h4>

            {/* Description */}
            <p className="text-xs text-[#CBBBA8] mt-1.5 leading-relaxed font-sans line-clamp-2">
              {meta.description}
            </p>

            {/* Quick Inspiration Strip on resting card */}
            <div className="mt-4 pt-2.5 border-t border-[rgba(212,163,106,0.15)] flex items-center justify-between text-[10px] font-mono text-[#CBBBA8]/80">
              <span className="truncate">
                <span className="text-[#CBBBA8]/50">Orig:</span>{" "}
                <span className="text-[#D4A36A] font-medium">{meta.originalGame}</span>
              </span>
              <span className="text-[#C79347] font-medium flex items-center gap-1 shrink-0 ml-1">
                <span>Hover for info</span>
                <ArrowRight className="w-2.5 h-2.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>

          {/* Footer Link Action */}
          <div className="mt-4 pt-3 border-t border-[rgba(212,163,106,0.2)] flex items-center justify-between text-xs font-mono text-[#C79347]">
            <span className="group-hover:underline">Play Daily Drop</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.article>
      </Link>

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
            className="absolute inset-0 z-30 rounded-2xl bg-[#180E27]/98 backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between border-2 border-[#C79347] shadow-[0_16px_40px_rgba(0,0,0,0.65)] text-[#FAF5ED]"
          >
            {/* Overlay Header */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[rgba(212,163,106,0.25)] text-xs font-mono">
                <div className="flex items-center gap-1.5 text-[#C79347] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">Game Blueprint</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#CBBBA8]/70 hidden sm:inline">
                    {meta.estimatedMinutes}m
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
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
              <div className="rounded-xl bg-[#140C20]/80 border border-[rgba(212,163,106,0.2)] p-2.5 sm:p-3 mb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#CBBBA8]/80 font-bold flex items-center gap-1.5">
                    <Landmark className="w-3 h-3 text-[#D4A36A]" />
                    <span>Original Game</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#D4A36A] font-semibold">
                    {meta.originalGame}
                  </span>
                </div>
                <div className="text-xs font-serif font-medium text-[#FAF5ED] mb-0.5">
                  {meta.originalGameSubtitle}
                </div>
                <p className="text-[11px] text-[#CBBBA8] leading-relaxed font-sans line-clamp-2">
                  {meta.originalGameDescription}
                </p>
              </div>

              {/* Altered Tamil Cultural Adaptation */}
              <div className="rounded-xl bg-[#25173B]/90 border border-[#2BB5A8]/30 p-2.5 sm:p-3 shadow-inner">
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
                    {meta.tagTa}
                  </span>
                </div>
                <div className="text-xs font-serif font-medium text-[#FAF5ED] mb-0.5">
                  {meta.alteredTamilVersion}
                </div>
                <p className="text-[11px] text-[#E0D7C9] leading-relaxed font-sans line-clamp-3">
                  {meta.alteredTamilTwist}
                </p>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-2.5 border-t border-[rgba(212,163,106,0.25)] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#CBBBA8]">
                Deterministic Daily Drop
              </span>
              <Link
                href={`/games/${meta.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C79347] to-[#D4A36A] text-[#1C122B] text-xs font-mono font-bold uppercase tracking-wider hover:brightness-110 shadow transition-all"
              >
                <span>Play Drop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
