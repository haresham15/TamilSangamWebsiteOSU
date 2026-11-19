// src/components/games/aazham/DiveStage.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type AazhamPrompt } from "@/data/aazhamData";
import { SonarInput } from "./SonarInput";
import { TierReveal } from "./TierReveal";
import { type AazhamRoundResult } from "@/lib/aazhamStorage";

interface DiveStageProps {
  prompt: AazhamPrompt;
  roundIndex: number; // 0 to 6
  timeLeft: number;
  disabled: boolean;
  currentResult: AazhamRoundResult | null;
  onGuessSubmit: (guess: string) => boolean;
  onKeystroke?: () => void;
  accentColor?: string;
  isPlunging?: boolean;
}

export function DiveStage({
  prompt,
  roundIndex,
  timeLeft,
  disabled,
  currentResult,
  onGuessSubmit,
  onKeystroke,
  accentColor = "#5EEAD4",
  isPlunging = false,
}: DiveStageProps) {
  const roundNum = roundIndex + 1;
  const roundPad = roundNum.toString().padStart(2, "0");

  // Category Tamil translation
  const categoryTaMap: Record<string, string> = {
    kollywood: "திரைக்களம்",
    food: "உணவுப் பண்பாடு",
    geography: "நிலவியல்",
    culture: "பண்பாடு",
    language: "செம்மொழி",
    history: "வரலாறு",
    music: "இசை",
  };
  const categoryTa = categoryTaMap[prompt.category] || "பண்பாடு";

  return (
    <div className="relative z-30 w-full max-w-[780px] mx-auto px-4 sm:px-6 flex flex-col items-center justify-center min-h-[calc(100dvh-56px)] pb-12 select-none">
      {/* 1. GIANT BACKGROUND WATERMARK NUMERAL (4% OPACITY) */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 -translate-y-1/2 left-2 sm:left-6 font-serif text-[10rem] sm:text-[14rem] font-bold text-white/[0.038] pointer-events-none select-none leading-none tracking-tighter"
      >
        {roundPad}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={prompt.id}
          initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
          animate={
            isPlunging
              ? { opacity: 0, y: -44, filter: "blur(8px)" }
              : { opacity: 1, y: 0, filter: "blur(0px)" }
          }
          exit={{ opacity: 0, y: -44, filter: "blur(8px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center text-center"
        >
          {/* 2. RAZOR-THIN EDITORIAL EYEBROW (NO PURPLE PILL!) */}
          <div className="flex items-center gap-2.5 mb-4 text-xs font-mono uppercase tracking-[0.24em] text-white/60">
            <span className="font-bold text-[#DFB968]">{roundPad} / 07</span>
            <span className="text-[#DFB968] text-[9px]">◆</span>
            <span className="tracking-[0.22em]">
              {prompt.category} ·{" "}
              <span lang="ta" className="font-tamil normal-case tracking-normal text-white/50">
                {categoryTa}
              </span>
            </span>
          </div>

          {/* 3. EDITORIAL PROMPT DISPLAY HEADING */}
          <h2 className="font-cormorant text-[clamp(1.9rem,3.6vw,3.25rem)] font-normal text-[#F4F7F5] leading-[1.14] tracking-[-0.02em] max-w-2xl text-balance mb-3">
            {prompt.titleEn}
          </h2>

          {/* 4. TAMIL PROMPT SUBTITLE */}
          <p
            lang="ta"
            className="font-noto-serif-tamil text-[clamp(1.05rem,1.5vw,1.3rem)] font-normal text-[#A7C7C9] leading-[1.7] max-w-xl text-balance mb-8"
          >
            {prompt.titleTa}
          </p>

          {/* 5. SONAR INPUT CONSOLE OR TIER REVEAL */}
          <div className="w-full max-w-[620px]">
            {currentResult ? (
              <TierReveal
                result={currentResult}
                sampleAnswers={{
                  common: prompt.obviousAnswer,
                  deepCut: prompt.answers.find((a) => a.tier >= 85)?.displayEn || "",
                }}
              />
            ) : (
              <SonarInput
                roundNum={roundNum}
                disabled={disabled}
                timeLeft={timeLeft}
                onGuessSubmit={onGuessSubmit}
                onKeystroke={onKeystroke}
                accentColor={accentColor}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
