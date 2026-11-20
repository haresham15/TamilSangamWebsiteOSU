// src/components/games/ArcadeGameCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Play, Clock } from "lucide-react";
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

  return (
    <Link href={`/games/${meta.slug}`} className="block h-full group">
      <motion.article
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className={`h-full rounded-2xl bg-[#271A3C] border-2 p-5 flex flex-col justify-between shadow-lg transition-all duration-200 text-[#FAF5ED] ${
          isSolved
            ? "border-[#10B981]/40 shadow-[0_4px_20px_rgba(16,185,129,0.08)]"
            : "border-[rgba(212,163,106,0.24)] hover:border-[#C79347]/70 hover:shadow-[0_8px_25px_rgba(199,147,71,0.12)]"
        }`}
      >
        <div>
          {/* Top Row: Glyph & Status Badge */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(212,163,106,0.2)]">
            <div className="p-2.5 rounded-xl bg-[#1C122B] border border-[rgba(212,163,106,0.3)] shadow-inner">
              {renderGlyph()}
            </div>

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
        </div>

        {/* Footer Link Action */}
        <div className="mt-4 pt-3 border-t border-[rgba(212,163,106,0.2)] flex items-center justify-between text-xs font-mono text-[#C79347]">
          <span className="group-hover:underline">Play Daily Drop</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.article>
    </Link>
  );
}
