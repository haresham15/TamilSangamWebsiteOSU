// src/components/games/GamesHub.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  HelpCircle,
  X,
  Calendar,
  Grid,
  Layers,
  Lock,
  Share2,
  Check,
  Clock,
} from "lucide-react";
import { SolluWordle } from "./SolluWordle";
import { ThodarpuConnections } from "./ThodarpuConnections";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { SOLLU_MONTHLY_EDITIONS } from "@/data/gamesData";
import {
  isEditionUnlocked,
  getUnlockCountdown,
  getEditionSolvedCount,
  getAllTimeEditionsCompleted,
} from "@/lib/gamesStorage";

export function GamesHub() {
  const [selectedEdition, setSelectedEdition] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ed = params.get("edition");
      if (ed && (ed === "2026-10" || ed === "2026-11" || ed === "2026-12")) {
        if (isEditionUnlocked(ed)) return ed;
      }
    }
    return "2026-10";
  });
  const [activeTab, setActiveTab] = useState<"sollu" | "thodarpu">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const game = params.get("game");
      if (game === "sollu" || game === "thodarpu") return game;
    }
    return "sollu";
  });
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [copiedHub, setCopiedHub] = useState<boolean>(false);

  // Sync state update on solve
  const [solvedVersion, setSolvedVersion] = useState<number>(0);
  const handleGameSolved = () => {
    setSolvedVersion((v) => v + 1);
  };

  useModalScrollLock(isHelpOpen, () => setIsHelpOpen(false));

  const currentEditionMeta = SOLLU_MONTHLY_EDITIONS[selectedEdition] || SOLLU_MONTHLY_EDITIONS["2026-10"];
  const isUnlocked = isEditionUnlocked(selectedEdition);
  const countdown = getUnlockCountdown(selectedEdition);
  const thisMonthSolved = getEditionSolvedCount(selectedEdition);
  const allTimeCompleted = getAllTimeEditionsCompleted();

  const handleShareHub = () => {
    const url = "https://tamil-sangam-website-osu.vercel.app/games";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`Play The Sangam Arcade — Monthly Tamil Puzzles at Ohio State! 🕶️💥\n${url}`).then(() => {
        setCopiedHub(true);
        setTimeout(() => setCopiedHub(false), 2400);
      });
    }
  };

  return (
    <section id="games-hub" className="w-full bg-[#FAF6F0] text-[#161210] py-16 sm:py-24 px-4 sm:px-8 border-t border-[#D4AF37]/40 outline-hidden">
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
                {currentEditionMeta.monthEn} {currentEditionMeta.year} ·{" "}
                <span lang="ta" className="font-tamil font-semibold">
                  {currentEditionMeta.monthTa}
                </span>{" "}
                · EDITION NO. {selectedEdition === "2026-10" ? "01" : selectedEdition === "2026-11" ? "02" : "03"}
              </span>
            </div>

            {/* Edition Switcher Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#161210]/50">Edition:</span>
              <div className="flex items-center gap-1 bg-[#F2EAE0] p-1 rounded-lg border border-[#161210]/20">
                {(["2026-10", "2026-11", "2026-12"] as const).map((edId) => {
                  const meta = SOLLU_MONTHLY_EDITIONS[edId];
                  const unlocked = isEditionUnlocked(edId);
                  const isSelected = selectedEdition === edId;

                  return (
                    <button
                      key={edId}
                      onClick={() => setSelectedEdition(edId)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                        isSelected
                          ? "bg-[#161210] text-[#FAF6F0] shadow-xs"
                          : "text-[#161210]/70 hover:text-[#161210]"
                      }`}
                    >
                      {!unlocked && <Lock className="size-3 text-[#C85A32]" />}
                      <span>{meta.monthEn.slice(0, 3)}</span>
                      {edId === "2026-10" && <span className="text-[10px] text-emerald-500 font-bold">●</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player Monthly Completion Ledger (D-14) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[#C85A32] font-bold">
                <Trophy className="size-4" />
                <span>{thisMonthSolved}/2 SOLVED THIS MONTH</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[#D4AF37] font-bold">
                <span>{allTimeCompleted} COMPLETED ALL-TIME</span>
              </div>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center gap-1 text-[#161210]/60 hover:text-[#161210] transition-colors"
                title="How to Play"
              >
                <HelpCircle className="size-4" />
                <span className="hidden sm:inline">Rules</span>
              </button>
              <button
                onClick={handleShareHub}
                className="flex items-center gap-1 text-[#161210]/60 hover:text-[#C85A32] transition-colors"
                title="Share Arcade"
              >
                {copiedHub ? <Check className="size-4 text-emerald-500" /> : <Share2 className="size-4" />}
                <span className="hidden sm:inline">{copiedHub ? "Copied!" : "Share Hub"}</span>
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
              Solve, uncover authentic cultural roots, and share spoiler-free grids!
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
        {/* 3. ACTIVE GAME PLAYING ARENA / LOCKED TEASER                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="w-full bg-[#FAF6F0] min-h-[520px] flex items-center justify-center">
          {isUnlocked ? (
            activeTab === "sollu" ? (
              <SolluWordle
                key={`sollu-${selectedEdition}-${solvedVersion}`}
                editionKey={selectedEdition}
                onSolved={handleGameSolved}
              />
            ) : (
              <ThodarpuConnections
                key={`thodarpu-${selectedEdition}-${solvedVersion}`}
                editionKey={selectedEdition}
                onSolved={handleGameSolved}
              />
            )
          ) : (
            /* Locked Edition Teaser (D-14) */
            <div className="w-full max-w-md mx-auto p-8 bg-[#F2EAE0] rounded-2xl border-2 border-[#D4AF37]/50 shadow-xl text-center">
              <div className="size-14 mx-auto mb-4 rounded-full bg-[#161210] text-[#D4AF37] flex items-center justify-center shadow-md">
                <Lock className="size-7" />
              </div>

              <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold block mb-1">
                LOCKED EDITION · எதிர்காலப் புதிர்
              </span>

              <h3 className="font-serif text-2xl font-bold text-[#161210] mb-2">
                {currentEditionMeta.monthEn} {currentEditionMeta.year} Edition
              </h3>

              <p lang="ta" className="font-tamil text-base text-[#161210]/80 mb-4 font-semibold">
                {currentEditionMeta.monthTa} மாதம்
              </p>

              <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FAF6F0] rounded-xl border border-[#161210]/15 mb-6 text-sm font-mono text-[#161210]">
                <Clock className="size-4 text-[#D4AF37]" />
                <span>
                  Unlocks in {countdown.days}d {countdown.hours}h (Nov 1, 00:00 EDT)
                </span>
              </div>

              <p className="text-xs text-[#161210]/70 mb-6 font-sans leading-relaxed">
                New puzzles unlock at midnight on the 1st of each month. In local development or preview environments, append <code className="bg-[#161210]/10 px-1.5 py-0.5 rounded text-[11px]">?unlock=all</code> to test all editions.
              </p>

              <button
                onClick={() => setSelectedEdition("2026-10")}
                className="w-full py-2.5 px-4 bg-[#161210] hover:bg-[#C85A32] text-[#FAF6F0] rounded-xl font-bold text-xs tracking-wider uppercase transition-colors shadow-md"
              >
                Play October Launch Edition
              </button>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 4. HOW TO PLAY MODAL                                             */}
        {/* ---------------------------------------------------------------- */}
        <AnimatePresence>
          {isHelpOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161210]/80 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FAF6F0] border-2 border-[#161210] text-[#161210] max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="absolute top-5 right-5 text-[#161210]/50 hover:text-[#161210] transition-colors"
                >
                  <X className="size-5" />
                </button>

                <h3 className="font-serif text-2xl font-bold mb-1">How to Play The Sangam Arcade</h3>
                <p className="font-tamil text-sm text-[#C85A32] font-semibold mb-6">விதிமுறைகள் மற்றும் வழிகாட்டி</p>

                <div className="space-y-6 text-xs sm:text-sm font-sans leading-relaxed text-[#161210]/85">
                  <div className="border-b border-[#161210]/15 pb-4">
                    <h4 className="font-bold text-sm text-[#161210] mb-2 flex items-center gap-1.5">
                      <Grid className="size-4 text-[#C85A32]" />
                      <span>01 Sollu (சொல்லு) · The Monthly Wordle</span>
                    </h4>
                    <p className="mb-2">
                      Guess the secret 5-letter Tanglish word or variable-length Tamil Akshara word in 6 attempts.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li><strong className="text-[#2E6F4E]">Green (🟩):</strong> Letter is in the word and in the correct spot.</li>
                      <li><strong className="text-[#D49B27]">Yellow (🟨):</strong> Letter is in the word but in the wrong spot.</li>
                      <li><strong className="text-[#3A332E]">Gray (⬛):</strong> Letter is not in the word in any spot.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#161210] mb-2 flex items-center gap-1.5">
                      <Layers className="size-4 text-[#3B4978]" />
                      <span>02 Thodarpu (தொடர்பு) · The Cultural Connections</span>
                    </h4>
                    <p className="mb-2">
                      Find 4 groups of 4 culturally connected tiles without making 4 mistakes.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Select 4 tiles and press <strong>Submit · சரிபார்</strong>.</li>
                      <li>Categories range in difficulty from <strong>Straightforward 🟨</strong>, <strong>Medium 🟩</strong>, <strong>Challenging 🟧</strong>, to <strong>Tricky 🟦</strong>.</li>
                      <li>Turn on <strong>Cultural Hints</strong> for non-spoiler definitions of classical instruments, dishes, and cinema lore.</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[#161210]/15 flex justify-end">
                  <button
                    onClick={() => setIsHelpOpen(false)}
                    className="px-6 py-2.5 bg-[#161210] hover:bg-[#C85A32] text-[#FAF6F0] rounded-xl text-xs font-bold font-mono transition-colors shadow-md"
                  >
                    Got It · தொடங்குக
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
