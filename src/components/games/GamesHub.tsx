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
import { FlagshipGameCard } from "./FlagshipGameCard";
import { ARCADE_GAMES_CATALOG } from "@/lib/games/storage";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { Eyebrow } from "@/components/muttram/Eyebrow";
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
    <section id="games-hub" className="w-full bg-bg-sangam-deep text-ink-alabaster outline-hidden">
      {/* ---------------------------------------------------------------- */}
      {/* 1. SANDSTONE MASTHEAD BAND: bridges the warm hero into the arcade */}
      {/* ---------------------------------------------------------------- */}
      <div className="texture-khadi border-b border-accent-zari/35 bg-bg-sandstone px-4 pt-12 pb-10 text-ink-earth sm:px-8 sm:pt-20 sm:pb-12">
        <div className="mx-auto max-w-5xl">
          <header aria-labelledby="games-masthead-title" className="mb-8 border-b border-border-warm pb-8">
            {/* Status strip: cadence, edition dates & actions */}
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border-warm pb-3">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <Eyebrow tamil="இருவாரப் புதிர்">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="size-3" aria-hidden="true" />
                    Biweekly cadence
                  </span>
                </Eyebrow>

                <div className="flex flex-wrap items-center gap-x-1.5 font-sans text-sm font-semibold text-ink-earth">
                  <Calendar className="size-3.5 text-brand-purple" aria-hidden="true" />
                  <span>
                    {currentEditionMeta.editionNo} · {currentEditionMeta.periodEn}
                  </span>
                  <span lang="ta" className="font-tamil text-sm font-normal leading-[1.6] text-ink-umber">
                    ({currentEditionMeta.periodTa})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 font-sans text-sm">
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="inline-flex min-h-12 items-center gap-1.5 rounded-full px-3 font-semibold text-brand-teal underline-offset-4 transition-colors hover:text-brand-teal-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                >
                  <HelpCircle className="size-4" aria-hidden="true" />
                  <span>
                    Rules · <span lang="ta">வழிகாட்டி</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShareHub}
                  className="inline-flex min-h-12 items-center gap-1.5 rounded-full px-3 font-semibold text-brand-teal underline-offset-4 transition-colors hover:text-brand-teal-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                >
                  {copiedHub ? <Check className="size-4" aria-hidden="true" /> : <Share2 className="size-4" aria-hidden="true" />}
                  <span aria-live="polite">
                    {copiedHub ? "Copied link!" : <>Share · <span lang="ta">பகிர்</span></>}
                  </span>
                </button>
              </div>
            </div>

            {/* Masthead title */}
            <div className="pt-8">
              <h2
                id="games-masthead-title"
                className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-ink-earth sm:text-6xl"
              >
                The Sangam Arcade
              </h2>
              <p lang="ta" className="mt-2 font-tamil text-xl leading-[1.6] text-brand-purple sm:text-2xl">
                களஞ்சியம் · இருவாரத் தமிழ்ப் புதிர்கள்
              </p>
              <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-ink-umber sm:text-base">
                Biweekly cultural puzzles rooted in Tamil heritage, cinema, and campus life. New editions release on the 1st and 15th of every month.
              </p>
            </div>
          </header>

          {/* ---------------------------------------------------------------- */}
          {/* 2. BIWEEKLY EDITION NAVIGATION BAR                               */}
          {/* ---------------------------------------------------------------- */}
          <nav aria-label="Biweekly Editions">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <Eyebrow tamil="பதிப்பைத் தேர்ந்தெடுக்கவும்">Select edition</Eyebrow>

              {nextUnlock && (
                <div className="hidden items-center gap-1.5 font-sans text-xs font-medium text-ink-umber sm:flex">
                  <Clock className="size-3.5 text-brand-purple" aria-hidden="true" />
                  {/* Clock-derived text differs between the static prerender and the client; that drift is expected. */}
                  <span suppressHydrationWarning>Next drop in {nextUnlock.days}d {nextUnlock.hours}h</span>
                </div>
              )}
            </div>

            {/* Horizontal scrollable edition strip */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
              {BIWEEKLY_EDITION_IDS.map((edId) => {
                const meta = SOLLU_BIWEEKLY_EDITIONS[edId];
                const unlocked = isEditionUnlocked(edId);
                const isSelected = selectedEdition === edId;
                const isLive = edId === currentLiveId;
                const solved = isEditionComplete(edId);

                return (
                  <button
                    key={edId}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectEdition(edId)}
                    className={`group relative flex min-h-12 shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 font-sans text-xs transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sandstone ${
                      isSelected
                        ? "border-brand-purple bg-brand-purple text-ink-alabaster shadow-[0_6px_18px_rgba(91,44,134,0.18)]"
                        : unlocked
                        ? "border-border-warm bg-surface-card-light text-ink-umber hover:border-brand-purple/50 hover:text-ink-earth"
                        : "border-dashed border-border-warm bg-surface-card-parchment text-ink-umber hover:border-brand-purple/40"
                    }`}
                  >
                    {/* Status indicator */}
                    {solved ? (
                      <Check className={`size-3.5 shrink-0 ${isSelected ? "text-ink-alabaster" : "text-brand-teal"}`} aria-label="Solved" />
                    ) : isLive ? (
                      <span className="relative flex size-2 shrink-0" aria-hidden="true">
                        <span className="size-2 rounded-full bg-accent-zari" />
                      </span>
                    ) : !unlocked ? (
                      <Lock className="size-3 shrink-0" aria-label="Locked" />
                    ) : (
                      <span className="size-1.5 shrink-0 rounded-full bg-accent-bronze/50" aria-hidden="true" />
                    )}

                    {/* Edition tag & dates */}
                    <div className="text-left leading-tight">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{meta.editionNo}</span>
                        {isLive && (
                          <span
                            className={`rounded px-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                              isSelected ? "bg-ink-alabaster/15 text-ink-alabaster" : "bg-brand-purple-soft text-brand-purple"
                            }`}
                          >
                            Live
                          </span>
                        )}
                      </div>
                      <span className={`block whitespace-nowrap text-[11px] ${isSelected ? "text-ink-alabaster/80" : "text-ink-umber"}`}>
                        {meta.periodEn.split(",")[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      <div className="mx-auto box-content max-w-5xl px-4 py-12 sm:px-8 sm:py-16">

        {/* ---------------------------------------------------------------- */}
        {/* 3. CONDITIONAL VIEW: CARDS CATALOG VS FOCUSED GAME ARENA          */}
        {/* ---------------------------------------------------------------- */}
        {activeGame === null ? (
          /* ============================================================== */
          /* 3A. MASSIVE GAMES CARDS EXHIBITION                             */
          /* ============================================================== */
          <div className="w-full">
            {/* Edition Context Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-card-dark border border-border-zari-muted mb-6 text-xs font-mono text-ink-alabaster">
              <div className="flex items-center gap-2">
                <span className="font-bold text-accent-zari">
                  {currentEditionMeta.editionNo}: {currentEditionMeta.periodEn}
                </span>
                <span className="text-ink-sand/40 hidden sm:inline" aria-hidden="true">|</span>
                <span lang="ta" className="font-tamil text-ink-sand hidden sm:inline">
                  {currentEditionMeta.periodTa}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {isUnlocked ? (
                  isSelectedComplete ? (
                    <span className="inline-flex items-center gap-1 text-brand-teal-dark font-bold">
                      <Check className="size-3.5" />
                      <span>Edition Solved!</span>
                    </span>
                  ) : isCurrentLive ? (
                    <span className="inline-flex items-center gap-1.5 text-accent-zari font-bold">
                      <Flame className="size-3.5 text-accent-zari" />
                      <span>Current Biweekly Window</span>
                    </span>
                  ) : (
                    <span className="text-ink-sand">Archive Edition</span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-ink-sand/80">
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
                <FlagshipGameCard
                  gameKey="sollu"
                  titleEn="Sollu"
                  titleTa="சொல்லு"
                  eyebrowEn="The Cultural Wordle"
                  badgeText="BIWEEKLY"
                  accentColor="#C79347"
                  hoverBorderColor="hover:border-[#C79347]"
                  description="Guess the secret 5-letter cultural word in 6 attempts. Featuring Tanglish cinema and classical Tamil Akshara editions."
                  thumbnail={<SolluThumbnail />}
                  actionText={`Play Edition ${currentEditionMeta.editionNo}`}
                  originalGame="Wordle"
                  originalGameSubtitle="Daily 5-Letter Secret Word"
                  originalGameDescription="Guess a hidden 5-letter English word in 6 attempts with color-coded tile feedback."
                  alteredTamilVersion="Tanglish & Akshara Tamil Wordle (சொல்லு)"
                  alteredTamilTwist="Dual-mode engine: Tanglish colloquial cinema edition and authentic Tamil Akshara Uyirmei mode decomposing compound characters by grapheme clusters."
                  onSelect={() => selectGame("sollu")}
                />

                {/* CARD 2: 02 THODARPU CONNECTIONS · தொடர்பு */}
                <FlagshipGameCard
                  gameKey="thodarpu"
                  titleEn="Thodarbu"
                  titleTa="தொடர்பு"
                  eyebrowEn="Cultural Connections"
                  badgeText="BIWEEKLY"
                  accentColor="#2BB5A8"
                  hoverBorderColor="hover:border-[#2BB5A8]"
                  description="Find four groups of four culturally connected items across cinema lore, Carnatic ragas, and traditions."
                  thumbnail={<ThodarpuThumbnail />}
                  actionText={`Play Edition ${currentEditionMeta.editionNo}`}
                  originalGame="NYT Connections"
                  originalGameSubtitle="4 Groups of 4 Items"
                  originalGameDescription="Identify four distinct groups of four related items with tricky multi-meaning overlaps."
                  alteredTamilVersion="Cultural 4×4 Connections (பண்பாட்டுத் தொடர்பு)"
                  alteredTamilTwist="Sort 16 cultural cards across Carnatic music ragas, Chola temple architecture, Mani Ratnam cinema, and Tamil Nadu festivals with clever cultural red herrings."
                  onSelect={() => selectGame("thodarpu")}
                />

                {/* CARD 3: 03 AAZHAM · ஆழம் */}
                <FlagshipGameCard
                  gameKey="aazham"
                  titleEn="Aazham"
                  titleTa="ஆழம்"
                  eyebrowEn="Rarest-Answer Trivia"
                  badgeText="7,000m DIVE"
                  accentColor="#C79347"
                  hoverBorderColor="hover:border-[#C79347]"
                  description="7 cultural prompts under 25s. The rarest answer sinks you deeper toward the ancient Kumari Kandam seabed."
                  thumbnail={<AazhamThumbnail />}
                  actionText="Dive 7,000m"
                  originalGame="Rarest-Answer Trivia"
                  originalGameSubtitle="Pointless / Obscure Knowledge"
                  originalGameDescription="Name the least commonly known valid answer from a category to achieve the lowest possible score."
                  alteredTamilVersion="7,000m Deep Cultural Seabed Dive (ஆழம்)"
                  alteredTamilTwist="Rapid 25-second rounds where rarer authentic Tamil cultural answers propel your submarine deeper past Mariana depths toward the sunken continent of Kumari Kandam."
                  onSelect={() => selectGame("aazham")}
                />
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
