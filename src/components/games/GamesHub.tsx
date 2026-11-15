// src/components/games/GamesHub.tsx
"use client";

import React, { useState, useCallback, useMemo } from "react";
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
  Flame,
} from "lucide-react";
import { SolluWordle } from "./SolluWordle";
import { ThodarpuConnections } from "./ThodarpuConnections";
import { SolluThumbnail } from "./SolluThumbnail";
import { ThodarpuThumbnail } from "./ThodarpuThumbnail";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import {
  SOLLU_BIWEEKLY_EDITIONS,
  BIWEEKLY_EDITION_IDS,
  type SolluEdition,
} from "@/data/gamesData";
import {
  isEditionUnlocked,
  getUnlockCountdown,
  getCurrentBiweeklyEditionId,
  getNextBiweeklyUnlock,
  isEditionComplete,
  getEditionSolvedCount,
  normalizeEditionId,
} from "@/lib/gamesStorage";

export function GamesHub() {
  const currentLiveId = useMemo(() => getCurrentBiweeklyEditionId(), []);

  const [selectedEdition, setSelectedEdition] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ed = params.get("edition");
      if (ed) {
        const norm = normalizeEditionId(ed);
        if (SOLLU_BIWEEKLY_EDITIONS[norm]) return norm;
      }
    }
    return currentLiveId;
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

  const currentEditionMeta: SolluEdition =
    SOLLU_BIWEEKLY_EDITIONS[selectedEdition] || SOLLU_BIWEEKLY_EDITIONS[currentLiveId];
  const liveEditionMeta: SolluEdition =
    SOLLU_BIWEEKLY_EDITIONS[currentLiveId] || SOLLU_BIWEEKLY_EDITIONS["2026-10-A"];

  const isUnlocked = isEditionUnlocked(selectedEdition);
  const countdown = getUnlockCountdown(selectedEdition);
  const nextUnlock = getNextBiweeklyUnlock();
  const isSelectedComplete = isEditionComplete(selectedEdition);
  const isCurrentLive = selectedEdition === currentLiveId;

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

  // Switch edition and update URL
  const selectEdition = useCallback((edId: string) => {
    setSelectedEdition(edId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("edition", edId);
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  const handleShareHub = () => {
    const url = "https://tamil-sangam-website-osu.vercel.app/games";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(`Play The Sangam Arcade — Biweekly Tamil Puzzles at Ohio State! 🕶️💥\n${url}`)
        .then(() => {
          setCopiedHub(true);
          setTimeout(() => setCopiedHub(false), 2400);
        });
    }
  };

  return (
    <section id="games-hub" className="w-full bg-[#140C20] text-[#F4F0FA] py-12 sm:py-20 px-4 sm:px-8 border-t border-[#A6F0CF]/35 outline-hidden">
      <div className="max-w-5xl mx-auto">
        {/* ---------------------------------------------------------------- */}
        {/* 1. EDITORIAL MASTHEAD WITH BIWEEKLY CADENCE                      */}
        {/* ---------------------------------------------------------------- */}
        <header className="border-b-2 border-[rgba(125,96,166,0.25)] pb-6 mb-8 select-none">
          {/* Top Line: Cadence Badge, Edition Dates & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[rgba(125,96,166,0.25)] text-xs font-mono uppercase tracking-widest text-[#F4F0FA]/70">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#25173B] border border-[rgba(125,96,166,0.4)] text-[#A6F0CF] text-[11px] font-bold">
                <Sparkles className="size-3 text-[#A6F0CF]" />
                <span>BIWEEKLY CADENCE · இருவாரப் புதிர்</span>
              </span>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F4F0FA]">
                <Calendar className="size-3.5 text-[#A6F0CF]" />
                <span>
                  {currentEditionMeta.editionNo} · {currentEditionMeta.periodEn}
                </span>
                <span lang="ta" className="font-tamil text-[#A6F0CF] text-xs">
                  ({currentEditionMeta.periodTa})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs font-sans">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center gap-1.5 text-[#F4F0FA]/75 hover:text-[#A6F0CF] font-semibold transition-colors"
              >
                <HelpCircle className="size-3.5 text-[#A6F0CF]" />
                <span>Rules · வழிகாட்டி</span>
              </button>

              <button
                onClick={handleShareHub}
                className="flex items-center gap-1.5 text-[#F4F0FA]/75 hover:text-[#A6F0CF] font-semibold transition-colors"
              >
                {copiedHub ? <Check className="size-3.5 text-emerald-600" /> : <Share2 className="size-3.5" />}
                <span>{copiedHub ? "Copied Link!" : "Share · பகிர்"}</span>
              </button>
            </div>
          </div>

          {/* Central Newspaper Masthead Title */}
          <div className="pt-6 text-center">
            <h2 className="font-serif text-4xl sm:text-6xl font-normal text-[#F4F0FA] tracking-tight mb-2">
              The Sangam Arcade
            </h2>
            <p
              lang="ta"
              className="font-tamil text-xl sm:text-2xl text-[#A6F0CF] font-medium tracking-wide mb-3"
            >
              களஞ்சியம் · இருவாரத் தமிழ்ப் புதிர்கள்
            </p>
            <p className="font-sans text-xs sm:text-sm text-[#F4F0FA]/75 max-w-xl mx-auto leading-relaxed">
              New York Times-grade biweekly cultural puzzles rooted in Tamil heritage, cinema, and campus life. New editions release on the 1st and 15th of every month.
            </p>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* 2. BIWEEKLY EDITION NAVIGATION BAR                               */}
        {/* ---------------------------------------------------------------- */}
        <nav aria-label="Biweekly Editions" className="mb-8">
          <div className="flex items-center justify-between pb-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F4F0FA]/70">
              <span className="font-bold text-[#A6F0CF]">SELECT EDITION</span>
              <span>·</span>
              <span>பதிப்பைத் தேர்ந்தெடுக்கவும்</span>
            </div>

            {nextUnlock && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#A6F0CF]">
                <Clock className="size-3" />
                <span>Next drop in {nextUnlock.days}d {nextUnlock.hours}h</span>
              </div>
            )}
          </div>

          {/* Horizontal Scrollable Edition Strip */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[rgba(125,96,166,0.3)]">
            {BIWEEKLY_EDITION_IDS.map((edId) => {
              const meta = SOLLU_BIWEEKLY_EDITIONS[edId];
              const unlocked = isEditionUnlocked(edId);
              const isSelected = selectedEdition === edId;
              const isLive = edId === currentLiveId;
              const solved = isEditionComplete(edId);

              return (
                <button
                  key={edId}
                  onClick={() => selectEdition(edId)}
                  className={`group relative shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-200 border ${
                    isSelected
                      ? "bg-[#25173B] border-[#A6F0CF] text-[#F4F0FA] shadow-[0_0_15px_rgba(166,240,207,0.12)]"
                      : unlocked
                      ? "bg-[#140C20] border-[rgba(125,96,166,0.3)] hover:border-[#A6F0CF]/60 text-[#F4F0FA]/75 hover:text-[#F4F0FA]"
                      : "bg-[#140C20]/50 border-[rgba(125,96,166,0.15)] text-[#F4F0FA]/40 hover:border-[rgba(125,96,166,0.35)]"
                  }`}
                >
                  {/* Status Indicator */}
                  {solved ? (
                    <Check className="size-3.5 text-emerald-400 shrink-0" />
                  ) : isLive ? (
                    <span className="relative flex size-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A6F0CF] opacity-75" />
                      <span className="relative inline-flex rounded-full size-2 bg-[#A6F0CF]" />
                    </span>
                  ) : !unlocked ? (
                    <Lock className="size-3 text-[#F4F0FA]/40 shrink-0" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-[#C4B7D7]/40 shrink-0" />
                  )}

                  {/* Edition Tag & Dates */}
                  <div className="text-left leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">{meta.editionNo}</span>
                      {isLive && (
                        <span className="text-[9px] px-1 rounded bg-[#A6F0CF]/20 text-[#A6F0CF] font-bold">
                          LIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#F4F0FA]/60 block whitespace-nowrap">
                      {meta.periodEn.split(",")[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ---------------------------------------------------------------- */}
        {/* 3. CONDITIONAL VIEW: CARDS CATALOG VS FOCUSED GAME ARENA          */}
        {/* ---------------------------------------------------------------- */}
        {activeGame === null ? (
          /* ============================================================== */
          /* 3A. MASSIVE GAMES CARDS EXHIBITION                             */
          /* ============================================================== */
          <div className="w-full">
            {/* Edition Context Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#25173B]/70 border border-[rgba(125,96,166,0.35)] mb-6 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#A6F0CF]">
                  {currentEditionMeta.editionNo}: {currentEditionMeta.periodEn}
                </span>
                <span className="text-[#F4F0FA]/40 hidden sm:inline">|</span>
                <span lang="ta" className="font-tamil text-[#C4B7D7] hidden sm:inline">
                  {currentEditionMeta.periodTa}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {isUnlocked ? (
                  isSelectedComplete ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                      <Check className="size-3.5" />
                      <span>Edition Solved!</span>
                    </span>
                  ) : isCurrentLive ? (
                    <span className="inline-flex items-center gap-1.5 text-[#A6F0CF] font-bold">
                      <Flame className="size-3.5 text-[#A6F0CF]" />
                      <span>Current Biweekly Window</span>
                    </span>
                  ) : (
                    <span className="text-[#C4B7D7]">Archive Edition</span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-[#F4F0FA]/60">
                    <Lock className="size-3" />
                    <span>Locked (Unlocks in {countdown.days}d {countdown.hours}h)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {/* CARD 1: 01 SOLLU · சொல்லு */}
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={() => selectGame("sollu")}
                className="cursor-pointer group relative bg-[#140C20] rounded-2xl border-2 border-[rgba(125,96,166,0.25)] hover:border-[#A6F0CF] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300"
              >
                {/* Editorial Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(125,96,166,0.25)]">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#A6F0CF]">
                      The Cultural Wordle
                    </span>
                    <span className="font-mono text-[11px] text-[#F4F0FA]/55 uppercase tracking-wider">
                      Biweekly Edition
                    </span>
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl text-[#F4F0FA] font-normal tracking-tight mb-2">
                    Sollu · <span lang="ta" className="font-tamil font-semibold text-[#A6F0CF]">சொல்லு</span>
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#F4F0FA]/75 leading-relaxed mb-4">
                    Guess the secret 5-letter cultural word in 6 attempts. Featuring Tanglish cinema and classical Tamil Akshara editions.
                  </p>
                </div>

                {/* Bespoke Thumbnail */}
                <div className="my-2">
                  <SolluThumbnail />
                </div>

                {/* Editorial Action Footer */}
                <div className="mt-6 pt-4 border-t border-[rgba(125,96,166,0.25)] flex items-center justify-between text-sm font-sans font-medium text-[#F4F0FA]">
                  <span className="flex items-center gap-1.5 group-hover:text-[#A6F0CF] transition-colors">
                    <span>Play Sollu</span>
                    <span lang="ta" className="font-tamil text-xs text-[#A6F0CF]">(சொல்லு)</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-[#A6F0CF] group-hover:translate-x-1 transition-transform">
                    <span>Start Game</span>
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                </div>
              </motion.article>

              {/* CARD 2: 02 THODARPU · தொடர்பு */}
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={() => selectGame("thodarpu")}
                className="cursor-pointer group relative bg-[#140C20] rounded-2xl border-2 border-[rgba(125,96,166,0.25)] hover:border-[#A6F0CF] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300"
              >
                {/* Editorial Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(125,96,166,0.25)]">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#4FD6E0]">
                      Cultural Connections
                    </span>
                    <span className="font-mono text-[11px] text-[#F4F0FA]/55 uppercase tracking-wider">
                      Biweekly Edition
                    </span>
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl text-[#F4F0FA] font-normal tracking-tight mb-2">
                    Thodarpu · <span lang="ta" className="font-tamil font-semibold text-[#4FD6E0]">தொடர்பு</span>
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#F4F0FA]/75 leading-relaxed mb-4">
                    Find four groups of four culturally connected items across cinema lore, Carnatic ragas, and traditions.
                  </p>
                </div>

                {/* Bespoke Thumbnail */}
                <div className="my-2">
                  <ThodarpuThumbnail />
                </div>

                {/* Editorial Action Footer */}
                <div className="mt-6 pt-4 border-t border-[rgba(125,96,166,0.25)] flex items-center justify-between text-sm font-sans font-medium text-[#F4F0FA]">
                  <span className="flex items-center gap-1.5 group-hover:text-[#4FD6E0] transition-colors">
                    <span>Play Thodarpu</span>
                    <span lang="ta" className="font-tamil text-xs text-[#4FD6E0]">(தொடர்பு)</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-[#4FD6E0] group-hover:translate-x-1 transition-transform">
                    <span>Start Game</span>
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                </div>
              </motion.article>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* 3B. FOCUSED ACTIVE GAME ARENA                                  */
          /* ============================================================== */
          <div className="w-full">
            {/* Elegant Back Navigation Bar */}
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-[rgba(125,96,166,0.25)] select-none">
              <button
                onClick={() => selectGame(null)}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#F4F0FA]/75 hover:text-[#A6F0CF] transition-colors py-2 px-3.5 rounded-lg hover:bg-[#25173B] border border-transparent hover:border-[rgba(125,96,166,0.25)]"
              >
                <ArrowLeft className="size-4" />
                <span>All Games · அனைத்து புதிர்கள்</span>
              </button>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="font-bold text-[#F4F0FA]">
                  {activeGame === "sollu" ? "01 Sollu (சொல்லு)" : "02 Thodarpu (தொடர்பு)"}
                  <span className="text-[#A6F0CF] ml-2">[{currentEditionMeta.editionNo}]</span>
                </span>
                <span className="text-[#F4F0FA]/30 hidden sm:inline">|</span>
                <button
                  onClick={() => selectGame(activeGame === "sollu" ? "thodarpu" : "sollu")}
                  className="hidden sm:inline-flex items-center gap-1 text-[#F4F0FA]/65 hover:text-[#A6F0CF] font-semibold transition-colors"
                >
                  <span>Switch to {activeGame === "sollu" ? "02 Thodarpu" : "01 Sollu"}</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>

            {/* Active Game Component Canvas */}
            <div className="w-full bg-[#140C20] min-h-[520px] flex items-center justify-center">
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
                /* Locked Edition Teaser with Biweekly Countdown */
                <div className="w-full max-w-md mx-auto p-8 bg-[#25173B] rounded-2xl border-2 border-[#A6F0CF]/35 shadow-xl text-center">
                  <div className="size-14 mx-auto mb-4 rounded-full bg-[#140C20] text-[#A6F0CF] flex items-center justify-center shadow-md">
                    <Lock className="size-7" />
                  </div>

                  <span className="font-mono text-xs uppercase tracking-widest text-[#A6F0CF] font-bold block mb-1">
                    LOCKED BIWEEKLY EDITION · எதிர்காலப் புதிர்
                  </span>

                  <h3 className="font-serif text-2xl font-bold text-[#F4F0FA] mb-1">
                    {currentEditionMeta.editionNo} · {currentEditionMeta.periodEn}
                  </h3>

                  <p lang="ta" className="font-tamil text-base text-[#F4F0FA]/80 mb-4 font-semibold">
                    {currentEditionMeta.periodTa}
                  </p>

                  <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#140C20] rounded-xl border border-[rgba(125,96,166,0.25)] mb-6 text-sm font-mono text-[#F4F0FA]">
                    <Clock className="size-4 text-[#A6F0CF]" />
                    <span>
                      Unlocks in {countdown.days}d {countdown.hours}h
                    </span>
                  </div>

                  <button
                    onClick={() => selectEdition(currentLiveId)}
                    className="w-full py-3 px-4 bg-[#140C20] hover:bg-[#A6F0CF] hover:text-[#140C20] text-[#F4F0FA] rounded-xl font-bold text-xs tracking-wider uppercase transition-colors shadow-md"
                  >
                    Play Current Biweekly Edition ({liveEditionMeta.editionNo})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* 4. HOW TO PLAY MODAL                                             */}
        {/* ---------------------------------------------------------------- */}
        <AnimatePresence>
          {isHelpOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#140C20]/80 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#140C20] border-2 border-[rgba(125,96,166,0.25)] text-[#F4F0FA] max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="absolute top-5 right-5 text-[#F4F0FA]/50 hover:text-[#F4F0FA] transition-colors"
                >
                  <X className="size-5" />
                </button>

                <h3 className="font-serif text-2xl font-bold mb-1">How to Play The Sangam Arcade</h3>
                <p className="font-tamil text-sm text-[#A6F0CF] font-semibold mb-6">விதிமுறைகள் மற்றும் வழிகாட்டி</p>

                <div className="space-y-6 text-xs sm:text-sm font-sans leading-relaxed text-[#F4F0FA]/85">
                  <div className="border-b border-[rgba(125,96,166,0.25)] pb-4">
                    <h4 className="font-bold text-sm text-[#A6F0CF] mb-1">
                      Biweekly Release Schedule · இருவார அட்டவணை
                    </h4>
                    <p className="text-xs text-[#F4F0FA]/80">
                      A brand-new edition of Sollu and Thodarpu drops twice every month (on the <strong>1st</strong> and <strong>15th</strong> at 00:00 midnight). You can freely replay previous editions from the archive bar above.
                    </p>
                  </div>

                  <div className="border-b border-[rgba(125,96,166,0.25)] pb-4">
                    <h4 className="font-bold text-sm text-[#F4F0FA] mb-2">
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
                    <h4 className="font-bold text-sm text-[#F4F0FA] mb-2">
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

                <div className="mt-8 pt-4 border-t border-[rgba(125,96,166,0.25)] flex justify-end">
                  <button
                    onClick={() => setIsHelpOpen(false)}
                    className="px-6 py-2.5 bg-[#140C20] hover:bg-[#A6F0CF] hover:text-[#140C20] text-[#F4F0FA] rounded-xl text-xs font-bold font-mono transition-colors shadow-md"
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
