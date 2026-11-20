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
import { AazhamGame } from "./aazham/AazhamGame";
import { SolluThumbnail } from "./SolluThumbnail";
import { ThodarpuThumbnail } from "./ThodarpuThumbnail";
import { AazhamThumbnail } from "./AazhamThumbnail";
import { DailyGauntletStrip } from "./DailyGauntletStrip";
import { ArcadeGameCard } from "./ArcadeGameCard";
import { ARCADE_GAMES_CATALOG } from "@/lib/games/storage";
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

  const [activeGame, setActiveGame] = useState<"sollu" | "thodarpu" | "aazham" | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const game = params.get("game");
      if (game === "sollu" || game === "thodarpu" || game === "aazham") return game;
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
  const selectGame = useCallback((game: "sollu" | "thodarpu" | "aazham" | null) => {
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
        .writeText(`Play The Sangam Arcade — Biweekly Tamil Puzzles at Ohio State ✦\n${url}`)
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
        <header className="border-b-2 border-[rgba(212,163,106,0.25)] pb-6 mb-8 select-none">
          {/* Top Line: Cadence Badge, Edition Dates & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[rgba(212,163,106,0.2)] text-xs font-mono uppercase tracking-widest text-[#CBBBA8]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#271A3C] border border-[rgba(212,163,106,0.3)] text-[#C79347] text-[11px] font-bold">
                <Sparkles className="size-3 text-[#C79347]" />
                <span>BIWEEKLY CADENCE · இருவாரப் புதிர்</span>
              </span>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FAF5ED]">
                <Calendar className="size-3.5 text-[#C79347]" />
                <span>
                  {currentEditionMeta.editionNo} · {currentEditionMeta.periodEn}
                </span>
                <span lang="ta" className="font-tamil text-[#C79347] text-xs">
                  ({currentEditionMeta.periodTa})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs font-sans">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center gap-1.5 text-[#CBBBA8] hover:text-[#C79347] font-semibold transition-colors"
              >
                <HelpCircle className="size-3.5 text-[#C79347]" />
                <span>Rules · வழிகாட்டி</span>
              </button>

              <button
                onClick={handleShareHub}
                className="flex items-center gap-1.5 text-[#CBBBA8] hover:text-[#C79347] font-semibold transition-colors"
              >
                {copiedHub ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5 text-[#C79347]" />}
                <span>{copiedHub ? "Copied Link!" : "Share · பகிர்"}</span>
              </button>
            </div>
          </div>

          {/* Central Newspaper Masthead Title */}
          <div className="pt-6 text-center">
            <h2 className="font-serif text-4xl sm:text-6xl font-normal text-[#FAF5ED] tracking-tight mb-2">
              The Sangam Arcade
            </h2>
            <p
              lang="ta"
              className="font-tamil text-xl sm:text-2xl text-[#C79347] font-medium tracking-wide mb-3"
            >
              களஞ்சியம் · இருவாரத் தமிழ்ப் புதிர்கள்
            </p>
            <p className="font-sans text-xs sm:text-sm text-[#CBBBA8] max-w-xl mx-auto leading-relaxed">
              New York Times-grade biweekly cultural puzzles rooted in Tamil heritage, cinema, and campus life. New editions release on the 1st and 15th of every month.
            </p>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* 2. BIWEEKLY EDITION NAVIGATION BAR                               */}
        {/* ---------------------------------------------------------------- */}
        <nav aria-label="Biweekly Editions" className="mb-8">
          <div className="flex items-center justify-between pb-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#CBBBA8]">
              <span className="font-bold text-[#C79347]">SELECT EDITION</span>
              <span>·</span>
              <span>பதிப்பைத் தேர்ந்தெடுக்கவும்</span>
            </div>

            {nextUnlock && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#C79347]">
                <Clock className="size-3" />
                <span>Next drop in {nextUnlock.days}d {nextUnlock.hours}h</span>
              </div>
            )}
          </div>

          {/* Horizontal Scrollable Edition Strip */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[rgba(212,163,106,0.3)]">
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
                      ? "bg-[#5B2C86] border-[#C79347] text-[#FAF5ED] shadow-[0_0_15px_rgba(199,147,71,0.2)]"
                      : unlocked
                      ? "bg-[#271A3C] border-[rgba(212,163,106,0.24)] hover:border-[#C79347]/60 text-[#CBBBA8] hover:text-[#FAF5ED]"
                      : "bg-[#1C122B]/50 border-[rgba(212,163,106,0.15)] text-[#CBBBA8]/40 hover:border-[rgba(212,163,106,0.35)]"
                  }`}
                >
                  {/* Status Indicator */}
                  {solved ? (
                    <Check className="size-3.5 text-emerald-400 shrink-0" />
                  ) : isLive ? (
                    <span className="relative flex size-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C79347] opacity-75" />
                      <span className="relative inline-flex rounded-full size-2 bg-[#C79347]" />
                    </span>
                  ) : !unlocked ? (
                    <Lock className="size-3 text-[#CBBBA8]/40 shrink-0" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-[#CBBBA8]/40 shrink-0" />
                  )}

                  {/* Edition Tag & Dates */}
                  <div className="text-left leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">{meta.editionNo}</span>
                      {isLive && (
                        <span className="text-[9px] px-1 rounded bg-[#C79347]/20 text-[#C79347] font-bold">
                          LIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#CBBBA8]/70 block whitespace-nowrap">
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
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#271A3C] border border-[rgba(212,163,106,0.24)] mb-6 text-xs font-mono text-[#FAF5ED]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#C79347]">
                  {currentEditionMeta.editionNo}: {currentEditionMeta.periodEn}
                </span>
                <span className="text-white/40 hidden sm:inline">|</span>
                <span lang="ta" className="font-tamil text-[#CBBBA8] hidden sm:inline">
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
                    <span className="inline-flex items-center gap-1.5 text-[#C79347] font-bold">
                      <Flame className="size-3.5 text-[#C79347]" />
                      <span>Current Biweekly Window</span>
                    </span>
                  ) : (
                    <span className="text-[#CBBBA8]">Archive Edition</span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-[#CBBBA8]/60">
                    <Lock className="size-3" />
                    <span>Locked (Unlocks in {countdown.days}d {countdown.hours}h)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Daily Gauntlet Completion Strip */}
            <DailyGauntletStrip />

            {/* ============================================================== */}
            {/* CATEGORY 1: LOGIC & GEOMETRY · தர்க்கம் & வடிவியல்               */}
            {/* ============================================================== */}
            <div className="mb-14">
              <div className="flex items-baseline justify-between pb-3 mb-6 border-b border-[rgba(212,163,106,0.2)]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C79347] font-bold block mb-1">
                    SECTION 01 · தர்க்க விளையாட்டுகள்
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#FAF5ED]">
                    Logic & Geometry
                    <span lang="ta" className="text-sm sm:text-base font-sans text-[#D4A36A] font-normal ml-2" style={{ letterSpacing: 0 }}>
                      (புதிர் & கணிதம்)
                    </span>
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#CBBBA8]/70 hidden sm:inline">
                  Deterministic Daily Grids
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {ARCADE_GAMES_CATALOG.filter((g) => g.category === "logic").map((game) => (
                  <ArcadeGameCard key={game.slug} meta={game} />
                ))}
              </div>
            </div>

            {/* ============================================================== */}
            {/* CATEGORY 2: WORDS & CULTURE · சொல் & பண்பாடு                   */}
            {/* ============================================================== */}
            <div className="mb-14">
              <div className="flex items-baseline justify-between pb-3 mb-6 border-b border-[rgba(212,163,106,0.2)]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C79347] font-bold block mb-1">
                    SECTION 02 · சொல் புதிர்கள்
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#FAF5ED]">
                    Words & Culture
                    <span lang="ta" className="text-sm sm:text-base font-sans text-[#D4A36A] font-normal ml-2" style={{ letterSpacing: 0 }}>
                      (சொல் & பண்பாடு)
                    </span>
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#CBBBA8]/70 hidden sm:inline">
                  Tamil & Tanglish Lexicon
                </span>
              </div>

              {/* Biweekly Flagship Originals (Sollu, Thodarbu, Aazham) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* CARD 1: 01 SOLLU · சொல்லு */}
                <motion.article
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  onClick={() => selectGame("sollu")}
                  className="cursor-pointer group relative bg-[#271A3C] rounded-2xl border-2 border-[rgba(212,163,106,0.24)] hover:border-[#C79347] p-5 flex flex-col justify-between shadow-lg transition-all duration-200 text-[#FAF5ED]"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(212,163,106,0.2)]">
                      <span className="font-mono text-xs uppercase tracking-wider text-[#C79347]">
                        The Cultural Wordle
                      </span>
                      <span className="font-mono text-[10px] text-[#C79347] font-bold px-2 py-0.5 rounded-full bg-[#C79347]/15 border border-[#C79347]/30">
                        BIWEEKLY
                      </span>
                    </div>

                    <h4 className="font-serif text-2xl text-[#FAF5ED] font-medium tracking-tight mb-1">
                      Sollu · <span lang="ta" className="text-[#C79347]" style={{ letterSpacing: 0 }}>சொல்லு</span>
                    </h4>
                    <p className="font-sans text-xs text-[#CBBBA8] leading-relaxed mb-3">
                      Guess the secret 5-letter cultural word in 6 attempts. Featuring Tanglish cinema and classical Tamil Akshara editions.
                    </p>
                  </div>

                  <div className="my-1">
                    <SolluThumbnail />
                  </div>

                  <div className="mt-4 pt-3 border-t border-[rgba(212,163,106,0.2)] flex items-center justify-between text-xs font-mono text-[#C79347]">
                    <span>Play Edition {currentEditionMeta.editionNo}</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.article>

                {/* CARD 2: 02 THODARPU CONNECTIONS · தொடர்பு */}
                <motion.article
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  onClick={() => selectGame("thodarpu")}
                  className="cursor-pointer group relative bg-[#271A3C] rounded-2xl border-2 border-[rgba(212,163,106,0.24)] hover:border-[#2BB5A8] p-5 flex flex-col justify-between shadow-lg transition-all duration-200 text-[#FAF5ED]"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(212,163,106,0.2)]">
                      <span className="font-mono text-xs uppercase tracking-wider text-[#2BB5A8]">
                        Cultural Connections
                      </span>
                      <span className="font-mono text-[10px] text-[#2BB5A8] font-bold px-2 py-0.5 rounded-full bg-[#2BB5A8]/15 border border-[#2BB5A8]/30">
                        BIWEEKLY
                      </span>
                    </div>

                    <h4 className="font-serif text-2xl text-[#FAF5ED] font-medium tracking-tight mb-1">
                      Thodarbu · <span lang="ta" className="text-[#2BB5A8]" style={{ letterSpacing: 0 }}>தொடர்பு</span>
                    </h4>
                    <p className="font-sans text-xs text-[#CBBBA8] leading-relaxed mb-3">
                      Find four groups of four culturally connected items across cinema lore, Carnatic ragas, and traditions.
                    </p>
                  </div>

                  <div className="my-1">
                    <ThodarpuThumbnail />
                  </div>

                  <div className="mt-4 pt-3 border-t border-[rgba(212,163,106,0.2)] flex items-center justify-between text-xs font-mono text-[#2BB5A8]">
                    <span>Play Edition {currentEditionMeta.editionNo}</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.article>

                {/* CARD 3: 03 AAZHAM · ஆழம் */}
                <motion.article
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  onClick={() => selectGame("aazham")}
                  className="cursor-pointer group relative bg-[#271A3C] rounded-2xl border-2 border-[rgba(212,163,106,0.24)] hover:border-[#C79347] p-5 flex flex-col justify-between shadow-lg transition-all duration-200 text-[#FAF5ED]"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(212,163,106,0.2)]">
                      <span className="font-mono text-xs uppercase tracking-wider text-[#C79347]">
                        Rarest-Answer Trivia
                      </span>
                      <span className="font-mono text-[10px] text-[#C79347] font-bold px-2 py-0.5 rounded-full bg-[#C79347]/15 border border-[#C79347]/30">
                        7,000m DIVE
                      </span>
                    </div>

                    <h4 className="font-serif text-2xl text-[#FAF5ED] font-medium tracking-tight mb-1">
                      Aazham · <span lang="ta" className="text-[#C79347]" style={{ letterSpacing: 0 }}>ஆழம்</span>
                    </h4>
                    <p className="font-sans text-xs text-[#CBBBA8] leading-relaxed mb-3">
                      7 cultural prompts under 25s. The rarest answer sinks you deeper toward the ancient Kumari Kandam seabed.
                    </p>
                  </div>

                  <div className="my-1">
                    <AazhamThumbnail />
                  </div>

                  <div className="mt-4 pt-3 border-t border-[rgba(212,163,106,0.2)] flex items-center justify-between text-xs font-mono text-[#C79347]">
                    <span>Dive 7,000m</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.article>
              </div>

              {/* Daily Word Puzzles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {ARCADE_GAMES_CATALOG.filter((g) => g.category === "words").map((game) => (
                  <ArcadeGameCard key={game.slug} meta={game} />
                ))}
              </div>
            </div>

            {/* ============================================================== */}
            {/* CATEGORY 3: KOLLYWOOD & GEOGRAPHY · திரை & நிலவியல்            */}
            {/* ============================================================== */}
            <div className="mb-10">
              <div className="flex items-baseline justify-between pb-3 mb-6 border-b border-[rgba(125,96,166,0.3)]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#A6F0CF] font-bold block mb-1">
                    SECTION 03 · சினிமா & நிலவியல்
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#F4F0FA]">
                    Kollywood & Geography
                    <span lang="ta" className="text-sm sm:text-base font-sans text-[#E5B869] font-normal ml-2" style={{ letterSpacing: 0 }}>
                      (திரை & தமிழகம்)
                    </span>
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#C4B7D7]/70 hidden sm:inline">
                  38 Districts & Kollywood Classics
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {ARCADE_GAMES_CATALOG.filter((g) => g.category === "kollywood").map((game) => (
                  <ArcadeGameCard key={game.slug} meta={game} />
                ))}
              </div>
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
                  {activeGame === "sollu"
                    ? "01 Sollu (சொல்லு)"
                    : activeGame === "thodarpu"
                    ? "02 Thodarpu (தொடர்பு)"
                    : "03 Aazham (ஆழம்)"}
                  <span className="text-[#A6F0CF] ml-2">[{currentEditionMeta.editionNo}]</span>
                </span>
                <span className="text-[#F4F0FA]/30 hidden sm:inline">|</span>
                <button
                  onClick={() =>
                    selectGame(
                      activeGame === "sollu"
                        ? "thodarpu"
                        : activeGame === "thodarpu"
                        ? "aazham"
                        : "sollu"
                    )
                  }
                  className="hidden sm:inline-flex items-center gap-1 text-[#F4F0FA]/65 hover:text-[#A6F0CF] font-semibold transition-colors"
                >
                  <span>
                    Next:{" "}
                    {activeGame === "sollu"
                      ? "02 Thodarpu"
                      : activeGame === "thodarpu"
                      ? "03 Aazham"
                      : "01 Sollu"}
                  </span>
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
                ) : activeGame === "thodarpu" ? (
                  <ThodarpuConnections
                    key={`thodarpu-${selectedEdition}-${solvedVersion}`}
                    editionKey={selectedEdition}
                    onSolved={handleGameSolved}
                  />
                ) : (
                  <AazhamGame
                    key={`aazham-${selectedEdition}-${solvedVersion}`}
                    editionId={selectedEdition}
                    onSolved={handleGameSolved}
                    onBackToArcade={() => selectGame(null)}
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

                  <div className="border-b border-[rgba(125,96,166,0.25)] pb-4">
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

                  <div>
                    <h4 className="font-bold text-sm text-[#A6F0CF] mb-2">
                      03 Aazham (ஆழம்) · Rarest-Answer Trivia
                    </h4>
                    <p className="mb-2">
                      Answer 7 cultural prompts under a 25-second countdown. The rarer your valid answer, the deeper you sink toward Kumari Kandam (up to 7,000 meters).
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li><strong className="text-amber-400">Over-Smart Trap (15pt):</strong> Avoid the second most obvious answer everyone tries to be sneaky with!</li>
                      <li><strong className="text-indigo-300">The Deep (60pt) & Sunken City (85pt):</strong> Rewards deep cultural literacy and regional Tamil heritage.</li>
                      <li><strong className="text-[#A6F0CF]">Valampuri Pearl (100pt):</strong> Flawless deep cuts that plunge you +1,000 meters toward the seabed.</li>
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
