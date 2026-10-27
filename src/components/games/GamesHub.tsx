// src/components/games/GamesHub.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Trophy,
  HelpCircle,
  X,
  Calendar,
  Grid,
  Layers,
} from "lucide-react";
import { SolluWordle } from "./SolluWordle";
import { ThodarpuConnections } from "./ThodarpuConnections";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { SOLLU_MONTHLY_EDITIONS } from "@/data/gamesData";

export function GamesHub() {
  const [selectedEdition, setSelectedEdition] = useState<string>("2026-10");
  const [activeTab, setActiveTab] = useState<"sollu" | "thodarpu">("sollu");
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Player Stats persisted in localStorage
  const [streak] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ts_games_streak");
      if (saved) return parseInt(saved, 10);
    }
    return 1;
  });
  const [solvedCount, setSolvedCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ts_games_solved");
      if (saved) return parseInt(saved, 10);
    }
    return 0;
  });

  const handleGameSolved = () => {
    setSolvedCount((prev) => {
      const next = prev + 1;
      if (typeof window !== "undefined") {
        localStorage.setItem("ts_games_solved", String(next));
      }
      return next;
    });
  };

  useModalScrollLock(isHelpOpen, () => setIsHelpOpen(false));

  const currentEditionMeta = SOLLU_MONTHLY_EDITIONS[selectedEdition] || SOLLU_MONTHLY_EDITIONS["2026-10"];

  return (
    <section id="games-hub" className="w-full bg-[#FAF6F0] text-[#161210] py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        {/* ---------------------------------------------------------------- */}
        {/* 1. NEWSPAPER-GRADE EDITORIAL MASTHEAD                            */}
        {/* ---------------------------------------------------------------- */}
        <header className="border-b-2 border-[#161210] pb-6 mb-8 select-none">
          {/* Top Bar: Date, Edition Dropdown & Player Ledger */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#161210]/20 text-xs font-mono uppercase tracking-wider text-[#161210]/75">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-[#C85A32]" />
              <span className="font-bold">
                {currentEditionMeta.monthEn} {currentEditionMeta.year} EDITION ·{" "}
                <span lang="ta" className="font-tamil font-semibold">
                  {currentEditionMeta.monthTa} மாதம்
                </span>{" "}
                · NO. 01
              </span>
            </div>

            {/* Edition Switcher Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#161210]/50">Archive:</span>
              <select
                value={selectedEdition}
                onChange={(e) => setSelectedEdition(e.target.value)}
                className="bg-[#F2EAE0] border border-[#161210]/20 rounded-md px-2.5 py-1 text-xs font-mono font-semibold text-[#161210] cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#D4AF37]"
              >
                <option value="2026-10">October 2026 (ஐப்பசி)</option>
                <option value="2026-11">November 2026 (கார்த்திகை)</option>
                <option value="2026-12">December 2026 (மார்கழி)</option>
              </select>
            </div>

            {/* Player Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[#C85A32] font-bold">
                <Flame className="size-4 fill-current" />
                <span>{streak} STREAK</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold">
                <Trophy className="size-4" />
                <span>{solvedCount}/6 SOLVED</span>
              </div>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center gap-1 text-[#161210]/60 hover:text-[#161210] transition-colors"
                title="How to Play"
              >
                <HelpCircle className="size-4" />
                <span className="hidden sm:inline">Rules</span>
              </button>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="pt-6 text-center">
            <h2 className="font-serif text-4xl sm:text-6xl font-normal text-[#161210] tracking-tight mb-2">
              The Sangam Arcade
            </h2>
            <p
              lang="ta"
              className="font-tamil text-xl sm:text-2xl text-[#C85A32] font-medium tracking-wide mb-3"
            >
              களஞ்சியம் · தமிழ்ச் சங்கப் புதிர்கள்
            </p>
            <p className="font-sans text-xs sm:text-sm text-[#161210]/70 max-w-xl mx-auto leading-relaxed">
              New York Times-grade monthly cultural puzzles for Buckeyes, students, and Tamil cinema enthusiasts.
              Solve, learn the cultural roots, and share your spoiler-free grids!
            </p>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* 2. DUAL-GAME MODE SELECTOR TABS                                  */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex justify-center mb-10 select-none">
          <div className="grid grid-cols-2 max-w-md w-full p-1 bg-[#F2EAE0] rounded-2xl border border-[#161210]/15 shadow-inner">
            <button
              onClick={() => setActiveTab("sollu")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-bold text-xs sm:text-sm transition-all ${
                activeTab === "sollu"
                  ? "bg-[#161210] text-[#FAF6F0] shadow-md"
                  : "text-[#161210]/70 hover:text-[#161210]"
              }`}
            >
              <Grid className="size-4" />
              <span>01 Sollu · சொல்லு</span>
            </button>

            <button
              onClick={() => setActiveTab("thodarpu")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-bold text-xs sm:text-sm transition-all ${
                activeTab === "thodarpu"
                  ? "bg-[#161210] text-[#FAF6F0] shadow-md"
                  : "text-[#161210]/70 hover:text-[#161210]"
              }`}
            >
              <Layers className="size-4" />
              <span>02 Thodarpu · தொடர்பு</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 3. ACTIVE GAME PLAYING ARENA                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="w-full bg-[#FAF6F0] min-h-[520px] flex items-center justify-center">
          {activeTab === "sollu" ? (
            <SolluWordle
              key={`sollu-${selectedEdition}`}
              editionKey={selectedEdition}
              onSolved={handleGameSolved}
            />
          ) : (
            <ThodarpuConnections
              key={`thodarpu-${selectedEdition}`}
              editionKey={selectedEdition}
              onSolved={handleGameSolved}
            />
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 4. HOW TO PLAY MODAL                                             */}
        {/* ---------------------------------------------------------------- */}
        <AnimatePresence>
          {isHelpOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161210]/80 backdrop-blur-xs select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="bg-[#FAF6F0] text-[#161210] max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-[#D4AF37]/50 relative"
              >
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#F2EAE0] transition-colors"
                >
                  <X className="size-5" />
                </button>

                <h3 className="font-serif text-2xl font-bold mb-1">How to Play · விதிகள்</h3>
                <p className="text-xs font-mono text-[#C85A32] mb-6">THE SANGAM ARCADE GUIDE</p>

                <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-[#161210]/85 font-sans max-h-[60vh] overflow-y-auto pr-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#161210] mb-1 flex items-center gap-1.5">
                      <Grid className="size-4 text-[#C85A32]" />
                      <span>Sollu · சொல்லு (Wordle)</span>
                    </h4>
                    <p className="mb-2">
                      Guess the monthly secret word in 6 tries. Words connect to Ohio State campus life, Tamil cinema, food, or literature.
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-center gap-2">
                        <span className="size-4 rounded bg-[#2E6F4E] text-[#FAF6F0] font-bold flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                        <span><strong>Green:</strong> Letter is in the word and in the correct spot.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-4 rounded bg-[#D49B27] text-[#161210] font-bold flex items-center justify-center text-[10px]">
                          •
                        </span>
                        <span><strong>Yellow:</strong> Letter is in the word but in the wrong spot.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-4 rounded bg-[#3A332E] text-[#FAF6F0] font-bold flex items-center justify-center text-[10px]">
                          ✕
                        </span>
                        <span><strong>Charcoal:</strong> Letter is not in the word.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-[#161210]/15">
                    <h4 className="font-bold text-sm text-[#161210] mb-1 flex items-center gap-1.5">
                      <Layers className="size-4 text-[#D4AF37]" />
                      <span>Thodarpu · தொடர்பு (Connections)</span>
                    </h4>
                    <p className="mb-2">
                      Find 4 groups of 4 items that share a common cultural or campus thread. You get 4 chances to make mistakes.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-[#E8B94F]/30 border border-[#E8B94F]">
                        <span className="font-bold">🟨 Straightforward:</span> Common daily items or foods.
                      </div>
                      <div className="p-2 rounded bg-[#3D7A5A]/30 border border-[#3D7A5A]">
                        <span className="font-bold">🟩 Medium:</span> Film, music, or campus landmarks.
                      </div>
                      <div className="p-2 rounded bg-[#C85A32]/30 border border-[#C85A32]">
                        <span className="font-bold">🟧 Challenging:</span> Classical history or instruments.
                      </div>
                      <div className="p-2 rounded bg-[#3B4978]/30 border border-[#3B4978]">
                        <span className="font-bold">🟦 Tricky / Wordplay:</span> Campus puns or shared prefixes.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#161210]/15 flex justify-end">
                  <button
                    onClick={() => setIsHelpOpen(false)}
                    className="px-5 py-2 rounded-full bg-[#161210] hover:bg-[#C85A32] text-[#FAF6F0] text-xs font-bold transition-colors"
                  >
                    Got It! (புரிந்தது)
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
