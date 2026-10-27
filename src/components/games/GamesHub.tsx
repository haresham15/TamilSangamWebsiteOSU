// src/components/games/GamesHub.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  X,
  Calendar,
  Share2,
  Check,
  Clock,
  Lock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SolluWordle } from "./SolluWordle";
import { ThodarpuConnections } from "./ThodarpuConnections";
import { SolluThumbnail } from "./SolluThumbnail";
import { ThodarpuThumbnail } from "./ThodarpuThumbnail";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { SOLLU_MONTHLY_EDITIONS } from "@/data/gamesData";
import {
  isEditionUnlocked,
  getUnlockCountdown,
  getEditionSolvedCount,
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

  const [activeGame, setActiveGame] = useState<"sollu" | "thodarpu" | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const game = params.get("game");
      if (game === "sollu" || game === "thodarpu") return game;
    }
    return null;
  });

  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [copiedHub, setCopiedHub] = useState<boolean>(false);
  const [solvedVersion, setSolvedVersion] = useState<number>(0);

  const handleGameSolved = () => {
    setSolvedVersion((v) => v + 1);
  };

  useModalScrollLock(isHelpOpen, () => setIsHelpOpen(false));

  const currentEditionMeta = SOLLU_MONTHLY_EDITIONS[selectedEdition] || SOLLU_MONTHLY_EDITIONS["2026-10"];
  const isUnlocked = isEditionUnlocked(selectedEdition);
  const countdown = getUnlockCountdown(selectedEdition);

  // Sync selected game with URL query param without full reload
  const selectGame = useCallback((game: "sollu" | "thodarpu" | null) => {
    setActiveGame(game);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (game) {
        url.searchParams.set("game", game);
      } else {
        url.searchParams.delete("game");
      }
      window.history.replaceState(null, "", url.toString());

      // Scroll smoothly to games hub surface if returning or launching
      const el = document.getElementById("arcade");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

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
    <section id="games-hub" className="w-full bg-[#FAF6F0] text-[#161210] py-12 sm:py-20 px-4 sm:px-8 border-t border-[#D4AF37]/30 outline-hidden">
      <div className="max-w-5xl mx-auto">
        {/* ---------------------------------------------------------------- */}
        {/* 1. CLEAN EDITORIAL MASTHEAD (DECLUTTERED)                         */}
        {/* ---------------------------------------------------------------- */}
        <header className="border-b-2 border-[#161210] pb-6 mb-10 select-none">
          {/* Top Line: Date & Minimal Actions */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#161210]/15 text-xs font-mono uppercase tracking-widest text-[#161210]/70">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-[#C85A32]" />
              <span className="font-bold">
                {currentEditionMeta.monthEn} {currentEditionMeta.year} ·{" "}
                <span lang="ta" className="font-tamil font-semibold">
                  {currentEditionMeta.monthTa}
                </span>{" "}
                · EDITION 01
              </span>
            </div>

            <div className="flex items-center gap-5 text-xs font-sans">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center gap-1.5 text-[#161210]/75 hover:text-[#C85A32] font-semibold transition-colors"
              >
                <HelpCircle className="size-3.5 text-[#C85A32]" />
                <span>Rules · வழிகாட்டி</span>
              </button>

              <button
                onClick={handleShareHub}
                className="flex items-center gap-1.5 text-[#161210]/75 hover:text-[#C85A32] font-semibold transition-colors"
              >
                {copiedHub ? <Check className="size-3.5 text-emerald-600" /> : <Share2 className="size-3.5" />}
                <span>{copiedHub ? "Copied Link!" : "Share · பகிர்"}</span>
              </button>
            </div>
          </div>

          {/* Central Newspaper Masthead Title */}
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
            <p className="font-sans text-xs sm:text-sm text-[#161210]/75 max-w-xl mx-auto leading-relaxed">
              New York Times-grade monthly cultural puzzles rooted in Tamil heritage, cinema, and campus life.
            </p>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* 2. CONDITIONAL VIEW: CARDS CATALOG VS FOCUSED GAME ARENA          */}
        {/* ---------------------------------------------------------------- */}
        {activeGame === null ? (
          /* ============================================================== */
          /* 2A. MASSIVE GAMES CARDS EXHIBITION                             */
          /* ============================================================== */
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {/* CARD 1: 01 SOLLU · சொல்லு */}
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={() => selectGame("sollu")}
                className="cursor-pointer group relative bg-[#F5EFEB] rounded-2xl border-2 border-[#161210]/15 hover:border-[#D4AF37] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300"
              >
                {/* Top Meta Bar */}
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#161210]/15">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#C85A32]">
                      01 · THE CULTURAL WORDLE
                    </span>
                    <span className="font-mono text-[11px] text-[#161210]/55 uppercase tracking-wider">
                      DAILY & MONTHLY
                    </span>
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl text-[#161210] font-normal tracking-tight mb-1">
                    Sollu · <span lang="ta" className="font-tamil font-semibold text-[#C85A32]">சொல்லு</span>
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#161210]/75 leading-relaxed mb-6">
                    Guess the secret 5-letter cultural word in 6 attempts. Featuring Tanglish cinema and classical Tamil Akshara editions.
                  </p>
                </div>

                {/* Massive Bespoke Thumbnail */}
                <div className="my-2">
                  <SolluThumbnail />
                </div>

                {/* Bottom Specifications & Direct Action Button */}
                <div className="mt-6 pt-5 border-t border-[#161210]/15 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#161210]/65 uppercase tracking-wider">
                    <span>6 ATTEMPTS</span>
                    <span>•</span>
                    <span>TANGLISH & AKSHARA</span>
                    <span>•</span>
                    <span>SPOILER-FREE</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectGame("sollu");
                    }}
                    aria-label="01 Sollu · சொல்லு"
                    className="w-full py-4 px-6 bg-[#161210] group-hover:bg-[#C85A32] text-[#FAF6F0] rounded-xl font-bold font-sans text-sm tracking-wide transition-colors duration-200 flex items-center justify-between shadow-sm focus:outline-hidden focus:ring-2 focus:ring-[#C85A32]"
                  >
                    <span className="font-bold flex items-center gap-2">
                      <span>01 Sollu</span>
                      <span className="opacity-70 font-normal">· Play Wordle</span>
                    </span>
                    <span className="font-tamil font-medium text-xs opacity-90 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>சொல்லு விளையாடு</span>
                      <ArrowRight className="size-3.5" />
                    </span>
                  </button>
                </div>
              </motion.article>

              {/* CARD 2: 02 THODARPU · தொடர்பு */}
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={() => selectGame("thodarpu")}
                className="cursor-pointer group relative bg-[#F5EFEB] rounded-2xl border-2 border-[#161210]/15 hover:border-[#D4AF37] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300"
              >
                {/* Top Meta Bar */}
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#161210]/15">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#3B4978]">
                      02 · CULTURAL CONNECTIONS
                    </span>
                    <span className="font-mono text-[11px] text-[#161210]/55 uppercase tracking-wider">
                      MONTHLY EDITION
                    </span>
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl text-[#161210] font-normal tracking-tight mb-1">
                    Thodarpu · <span lang="ta" className="font-tamil font-semibold text-[#3B4978]">தொடர்பு</span>
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#161210]/75 leading-relaxed mb-6">
                    Find four groups of four culturally connected items. Test your depth across cinema lore, Carnatic ragas, and traditions.
                  </p>
                </div>

                {/* Massive Bespoke Thumbnail */}
                <div className="my-2">
                  <ThodarpuThumbnail />
                </div>

                {/* Bottom Specifications & Direct Action Button */}
                <div className="mt-6 pt-5 border-t border-[#161210]/15 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#161210]/65 uppercase tracking-wider">
                    <span>16 TILES</span>
                    <span>•</span>
                    <span>4 GROUPS OF 4</span>
                    <span>•</span>
                    <span>4 MISTAKES MAX</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectGame("thodarpu");
                    }}
                    aria-label="02 Thodarpu · தொடர்பு"
                    className="w-full py-4 px-6 bg-[#161210] group-hover:bg-[#C85A32] text-[#FAF6F0] rounded-xl font-bold font-sans text-sm tracking-wide transition-colors duration-200 flex items-center justify-between shadow-sm focus:outline-hidden focus:ring-2 focus:ring-[#C85A32]"
                  >
                    <span className="font-bold flex items-center gap-2">
                      <span>02 Thodarpu</span>
                      <span className="opacity-70 font-normal">· Play Connections</span>
                    </span>
                    <span className="font-tamil font-medium text-xs opacity-90 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>தொடர்பு விளையாடு</span>
                      <ArrowRight className="size-3.5" />
                    </span>
                  </button>
                </div>
              </motion.article>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* 2B. FOCUSED ACTIVE GAME ARENA                                  */
          /* ============================================================== */
          <div className="w-full">
            {/* Elegant Back Navigation Bar */}
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#161210]/15 select-none">
              <button
                onClick={() => selectGame(null)}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#161210]/75 hover:text-[#C85A32] transition-colors py-2 px-3.5 rounded-lg hover:bg-[#F2EAE0] border border-transparent hover:border-[#161210]/15"
              >
                <ArrowLeft className="size-4" />
                <span>All Games · அனைத்து புதிர்கள்</span>
              </button>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="font-bold text-[#161210]">
                  {activeGame === "sollu" ? "01 Sollu (சொல்லு)" : "02 Thodarpu (தொடர்பு)"}
                </span>
                <span className="text-[#161210]/30 hidden sm:inline">|</span>
                <button
                  onClick={() => selectGame(activeGame === "sollu" ? "thodarpu" : "sollu")}
                  className="hidden sm:inline-flex items-center gap-1 text-[#161210]/65 hover:text-[#C85A32] font-semibold transition-colors"
                >
                  <span>Switch to {activeGame === "sollu" ? "02 Thodarpu" : "01 Sollu"}</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>

            {/* Active Game Component Canvas */}
            <div className="w-full bg-[#FAF6F0] min-h-[520px] flex items-center justify-center">
              {isUnlocked ? (
                activeGame === "sollu" ? (
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
                /* Locked Edition Teaser */
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
                      Unlocks in {countdown.days}d {countdown.hours}h
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedEdition("2026-10")}
                    className="w-full py-3 px-4 bg-[#161210] hover:bg-[#C85A32] text-[#FAF6F0] rounded-xl font-bold text-xs tracking-wider uppercase transition-colors shadow-md"
                  >
                    Play October Launch Edition
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* 3. HOW TO PLAY MODAL                                             */}
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
                    <h4 className="font-bold text-sm text-[#161210] mb-2">
                      01 Sollu (சொல்லு) · The Cultural Wordle
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
                    <h4 className="font-bold text-sm text-[#161210] mb-2">
                      02 Thodarpu (தொடர்பு) · Cultural Connections
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
