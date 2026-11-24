// src/components/games/SolluWordle.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Lightbulb,
  BarChart2,
  Share2,
  Sparkles,
  Flame,
  Trophy,
  X,
} from "lucide-react";
import { soundEngine } from "@/lib/soundEngine";
import { speakTamil, isSpeechSupported, stopTamilSpeech } from "@/lib/tamilSpeech";
import {
  SOLLU_BIWEEKLY_EDITIONS,
  SOLLU_MONTHLY_EDITIONS,
  TANG_ENGLISH_VALID_DICTIONARY,
  splitTamilAksharas,
  type SolluEdition,
} from "@/data/gamesData";
import {
  getArcadeStorage,
  saveArcadeStorage,
  getSolluStats,
  recordSolluGameResult,
  type SolluStats,
} from "@/lib/gamesStorage";
import { SITE_CONFIG } from "@/data/siteConfig";

interface SolluWordleProps {
  editionKey: string; // e.g. "2026-10-A", "2027-01-A", "2026-10"
  onSolved?: () => void;
}

type TileStatus = "correct" | "present" | "absent" | "empty";

const VICTORY_APPRAISALS: Record<number, { ta: string; en: string }> = {
  1: { ta: "ஒரு நொடியில்!", en: "First-Try Legend!" },
  2: { ta: "அசாத்திய புத்திசாலி!", en: "Pure Genius!" },
  3: { ta: "அருமை!", en: "Magnificent Play!" },
  4: { ta: "கெத்து!", en: "Solid & Stylish!" },
  5: { ta: "அப்பாடா தப்பிச்சீங்க!", en: "Clutch Save!" },
  6: { ta: "கடைசி வினாடி வெற்றி!", en: "Buzzer Beater!" },
};

export function SolluWordle({ editionKey, onSolved }: SolluWordleProps) {
  const edition: SolluEdition = useMemo(() => {
    return (
      SOLLU_BIWEEKLY_EDITIONS[editionKey] ||
      SOLLU_MONTHLY_EDITIONS[editionKey] ||
      SOLLU_BIWEEKLY_EDITIONS["2026-10-A"]
    );
  }, [editionKey]);

  // Mode: "tanglish" (3-7 letter Roman letters) vs "tamil" (Tamil script Aksharas)
  const [mode, setMode] = useState<"tanglish" | "tamil">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const m = params.get("mode");
      if (m === "tanglish" || m === "tamil") return m;
    }
    const store = getArcadeStorage();
    return store.preferences.solluMode || "tanglish";
  });

  // Target word & tokens
  const targetWord = useMemo(() => {
    return mode === "tanglish" ? edition.tanglishWord.toUpperCase() : edition.tamilWord;
  }, [mode, edition]);

  const targetTokens = useMemo(() => {
    return mode === "tanglish" ? targetWord.split("") : splitTamilAksharas(targetWord);
  }, [mode, targetWord]);

  const wordLength = targetTokens.length;
  const maxGuesses = 6;

  // Load initial guesses from storage if available
  const [guesses, setGuesses] = useState<string[]>(() => {
    const store = getArcadeStorage();
    const saved = store.sollu[`${editionKey}:${mode}`];
    return saved ? saved.guesses.map((g) => g.join("")) : [];
  });
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(() => {
    const store = getArcadeStorage();
    const saved = store.sollu[`${editionKey}:${mode}`];
    return saved?.status === "won" ? "won" : saved?.status === "lost" ? "lost" : "playing";
  });

  const [shakeRow, setShakeRow] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [isHintOpen, setIsHintOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [stats, setStats] = useState<SolluStats>(() => getSolluStats());

  const handleModeChange = (newMode: "tanglish" | "tamil") => {
    if (newMode === mode) return;
    setMode(newMode);
    const store = getArcadeStorage();
    store.preferences.solluMode = newMode;
    const saved = store.sollu[`${editionKey}:${newMode}`];
    setGuesses(saved ? saved.guesses.map((g) => g.join("")) : []);
    setCurrentGuess("");
    setGameStatus(saved?.status === "won" ? "won" : saved?.status === "lost" ? "lost" : "playing");
    setErrorMessage(null);
    setCopiedShare(false);
    saveArcadeStorage(store);
  };

  // Tokenize an arbitrary guess string
  const getTokens = useCallback(
    (word: string) => {
      return mode === "tanglish" ? word.split("") : splitTamilAksharas(word);
    },
    [mode]
  );

  // Evaluate letter statuses for a guess
  const evaluateGuess = useCallback(
    (guess: string): TileStatus[] => {
      const gTokens = getTokens(guess);
      const statuses: TileStatus[] = new Array(wordLength).fill("absent");
      const targetRemaining: (string | null)[] = [...targetTokens];

      // Pass 1: find correct matches (green)
      for (let i = 0; i < wordLength; i++) {
        if (gTokens[i] === targetTokens[i]) {
          statuses[i] = "correct";
          targetRemaining[i] = null;
        }
      }

      // Pass 2: find present matches (yellow)
      for (let i = 0; i < wordLength; i++) {
        if (statuses[i] === "correct") continue;
        const foundIdx = targetRemaining.indexOf(gTokens[i]);
        if (foundIdx !== -1) {
          statuses[i] = "present";
          targetRemaining[foundIdx] = null;
        }
      }

      return statuses;
    },
    [getTokens, targetTokens, wordLength]
  );

  // Keyboard letter statuses
  const keyboardLetterStatuses = useMemo(() => {
    const map: Record<string, TileStatus> = {};
    for (const g of guesses) {
      const gTokens = getTokens(g);
      const statuses = evaluateGuess(g);
      for (let i = 0; i < gTokens.length; i++) {
        const char = gTokens[i];
        const status = statuses[i];
        if (status === "correct") {
          map[char] = "correct";
        } else if (status === "present" && map[char] !== "correct") {
          map[char] = "present";
        } else if (status === "absent" && !map[char]) {
          map[char] = "absent";
        }
      }
    }
    return map;
  }, [guesses, getTokens, evaluateGuess]);

  // Handle letter entry
  const handleKey = useCallback(
    (char: string) => {
      if (gameStatus !== "playing") return;

      const currentTokens = getTokens(currentGuess);
      if (currentTokens.length < wordLength) {
        soundEngine.playFlapFlutter(0, 1.2);
        setCurrentGuess((prev) => prev + char);
      }
    },
    [gameStatus, currentGuess, getTokens, wordLength]
  );

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (gameStatus !== "playing") return;
    const currentTokens = getTokens(currentGuess);
    if (currentTokens.length > 0) {
      soundEngine.playFlapFlutter(0, 0.85);
      const remaining = currentTokens.slice(0, -1).join("");
      setCurrentGuess(remaining);
    }
  }, [gameStatus, currentGuess, getTokens]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (gameStatus !== "playing") return;

    const currentTokens = getTokens(currentGuess);
    if (currentTokens.length !== wordLength) {
      setShakeRow(true);
      soundEngine.playParaiThump(70);
      setErrorMessage(
        mode === "tanglish"
          ? `இன்னும் ${wordLength - currentTokens.length} எழுத்து தேவை · ${wordLength} letters needed`
          : `இன்னும் ${wordLength - currentTokens.length} எழுத்து தேவை · ${wordLength} எழுத்துக்கள் தேவை`
      );
      setTimeout(() => setShakeRow(false), 500);
      return;
    }

    // Tanglish dictionary check
    if (mode === "tanglish") {
      const upper = currentGuess.toUpperCase();
      if (!TANG_ENGLISH_VALID_DICTIONARY.has(upper) && upper !== targetWord) {
        setShakeRow(true);
        soundEngine.playParaiThump(80);
        setErrorMessage("அடடே! சொல்லகராதியில் இல்லை · Not in word list");
        setTimeout(() => setShakeRow(false), 600);
        return;
      }
    }

    // Check duplicate guess
    if (guesses.includes(currentGuess)) {
      setShakeRow(true);
      soundEngine.playParaiThump(75);
      setErrorMessage("ஏற்கனவே சொல்லியாச்சு! · Already guessed!");
      setTimeout(() => setShakeRow(false), 500);
      return;
    }

    // Play ascending Raga Mohanam sound for row reveal
    for (let i = 0; i < wordLength; i++) {
      setTimeout(() => {
        soundEngine.playPillarHover(i);
      }, i * 110);
    }

    const nextGuesses = [...guesses, currentGuess];
    setGuesses(nextGuesses);
    setCurrentGuess("");
    setErrorMessage(null);

    const isWon = currentGuess === targetWord;
    const isLost = !isWon && nextGuesses.length >= maxGuesses;
    const status = isWon ? "won" : isLost ? "lost" : "in_progress";

    const store = getArcadeStorage();
    store.sollu[`${editionKey}:${mode}`] = {
      guesses: nextGuesses.map((g) => getTokens(g)),
      status,
      completedAt: isWon || isLost ? new Date().toISOString() : undefined,
    };
    saveArcadeStorage(store);

    // Win condition
    if (isWon) {
      setGameStatus("won");
      const updatedStats = recordSolluGameResult(true, nextGuesses.length);
      setStats(updatedStats);
      setTimeout(() => {
        soundEngine.playTempleChime();
        onSolved?.();
      }, wordLength * 110 + 200);
      return;
    }

    // Loss condition
    if (isLost) {
      setGameStatus("lost");
      const updatedStats = recordSolluGameResult(false, nextGuesses.length);
      setStats(updatedStats);
    }
  }, [
    gameStatus,
    currentGuess,
    getTokens,
    wordLength,
    mode,
    targetWord,
    guesses,
    maxGuesses,
    editionKey,
    onSolved,
  ]);

  // Physical keyboard listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (mode === "tanglish") {
        if (/^[a-zA-Z]$/.test(e.key)) {
          handleKey(e.key.toUpperCase());
        } else if (e.key === "Backspace") {
          handleBackspace();
        } else if (e.key === "Enter") {
          handleSubmit();
        }
      } else {
        if (e.key === "Backspace") {
          handleBackspace();
        } else if (e.key === "Enter") {
          handleSubmit();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, handleKey, handleBackspace, handleSubmit]);

  // Build spoiler-free share text
  const buildShareText = useCallback(
    (format: "whatsapp" | "generic"): string => {
      const rows = guesses.map((g) => {
        const statuses = evaluateGuess(g);
        return statuses
          .map((s) => {
            if (s === "correct") return "🟩";
            if (s === "present") return "🟨";
            return "⬛";
          })
          .join("");
      });

      const score = gameStatus === "won" ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`;
      const modeLabel = mode === "tanglish" ? "Tanglish" : "தமிழ்";
      const appraisal =
        gameStatus === "won"
          ? VICTORY_APPRAISALS[guesses.length]?.ta || "வெற்றி!"
          : "அடுத்த முறை!";

      if (format === "whatsapp") {
        return `*சொல்லு · Sollu ${edition.editionNo}* (${modeLabel} · ${edition.periodEn || edition.monthEn})\n*${appraisal}* · மதிப்பெண்: ${score}\n\n${rows.join(
          "\n"
        )}\n\nவிளையாட: https://tamil-sangam-website-osu.vercel.app/games`;
      }

      return `OSU Tamil Sangam · Sollu ${edition.editionNo} (${edition.periodEn || edition.monthEn} · ${modeLabel}) ✦\n${appraisal} · Score: ${score}\n\n${rows.join(
        "\n"
      )}\n\nPlay: https://tamil-sangam-website-osu.vercel.app/games`;
    },
    [guesses, evaluateGuess, gameStatus, maxGuesses, mode, edition]
  );

  // Copy share grid to clipboard
  const copyShareGrid = () => {
    const text = buildShareText("generic");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2400);
      });
    }
  };

  // Direct 1-tap WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = buildShareText("whatsapp");
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Audio pronunciation
  const handleListenPronunciation = () => {
    if (isPlayingAudio) {
      stopTamilSpeech();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    speakTamil(edition.tamilWord, {
      playChime: true,
      rate: 0.82,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  // English QWERTY keyboard layout
  const qwertyRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
  ];

  const tileSizeClass =
    wordLength <= 3
      ? "size-14 sm:size-17 text-2xl sm:text-3xl"
      : wordLength === 4
      ? "size-13 sm:size-16 text-xl sm:text-2xl"
      : wordLength === 5
      ? "size-12 sm:size-15 text-xl sm:text-2xl"
      : wordLength === 6
      ? "size-10 sm:size-13 text-lg sm:text-xl"
      : "size-9 sm:size-12 text-base sm:text-lg";

  const winAppraisal = gameStatus === "won" ? VICTORY_APPRAISALS[guesses.length] : null;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {/* Top Utility Controls Bar: Mode Switcher, Clue Button, Stats Button */}
      <div className="w-full flex items-center justify-between gap-2 mb-4">
        {/* Mode Switcher Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#1C122B] rounded-xl border border-[#C79347]/30 shadow-xs">
          <button
            onClick={() => handleModeChange("tanglish")}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              mode === "tanglish"
                ? "bg-[#271A3C] text-[#2BB5A8] shadow-xs border border-[#2BB5A8]/30 font-bold"
                : "text-[#CBBBA8] hover:text-[#FAF5ED]"
            }`}
          >
            Tanglish ({edition.tanglishWord.length}L)
          </button>
          <button
            onClick={() => handleModeChange("tamil")}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              mode === "tamil"
                ? "bg-[#271A3C] text-[#2BB5A8] shadow-xs border border-[#2BB5A8]/30 font-bold"
                : "text-[#CBBBA8] hover:text-[#FAF5ED]"
            }`}
          >
            <span lang="ta" className="font-tamil">
              தமிழ்
            </span>{" "}
            ({edition.aksharaCount} எழுத்து)
          </button>
        </div>

        {/* Action Pills: Cultural Clue & Player Stats */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsHintOpen((prev) => !prev)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isHintOpen
                ? "bg-[#D49B27]/20 border-[#D49B27] text-[#D49B27]"
                : "bg-[#25173B] border-[rgba(125,96,166,0.3)] text-[#F4F0FA]/80 hover:text-[#D49B27] hover:border-[#D49B27]/50"
            }`}
            title="Cultural Clue · குறிப்பு"
          >
            <Lightbulb className="size-3.5" />
            <span className="hidden sm:inline">குறிப்பு ·</span>
            <span>Clue</span>
          </button>

          <button
            onClick={() => setIsStatsOpen((prev) => !prev)}
            className={`flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isStatsOpen
                ? "bg-[#A6F0CF]/20 border-[#A6F0CF] text-[#A6F0CF]"
                : "bg-[#25173B] border-[rgba(125,96,166,0.3)] text-[#F4F0FA]/80 hover:text-[#A6F0CF] hover:border-[#A6F0CF]/50"
            }`}
            title="Statistics · புள்ளிவிவரங்கள்"
          >
            <BarChart2 className="size-3.5" />
            <span className="hidden sm:inline">Stats</span>
          </button>
        </div>
      </div>

      {/* Expandable Cultural Clue Card */}
      <AnimatePresence>
        {isHintOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            className="w-full overflow-hidden mb-4"
          >
            <div className="p-3.5 rounded-xl bg-[#25173B]/90 border border-[#D49B27]/50 shadow-md">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D49B27] font-bold flex items-center gap-1">
                  <Lightbulb className="size-3 text-[#D49B27]" />
                  CULTURAL HINT · சொல்லின் குறிப்பு
                </span>
                <button
                  onClick={() => setIsHintOpen(false)}
                  className="text-[#F4F0FA]/50 hover:text-[#F4F0FA] p-0.5"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-[#F4F0FA] font-sans leading-relaxed">
                {mode === "tanglish"
                  ? edition.tanglish?.clue || edition.culturalContext
                  : edition.tamilAkshara?.clue || edition.culturalContext}
              </p>
              {edition.tanglish?.phonetic && (
                <div className="mt-1 text-[11px] font-mono text-[#A6F0CF]/80">
                  Phonetic: <span className="font-sans font-medium text-[#F4F0FA]">{edition.tanglish.phonetic}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Modal Drawer */}
      <AnimatePresence>
        {isStatsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            className="w-full overflow-hidden mb-4"
          >
            <div className="p-4 rounded-2xl bg-[#1C122C] border border-[#A6F0CF]/40 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#A6F0CF] font-bold flex items-center gap-1.5">
                  <Trophy className="size-3.5 text-[#A6F0CF]" />
                  SOLLU PERFORMANCE · புள்ளிவிவரங்கள்
                </span>
                <button
                  onClick={() => setIsStatsOpen(false)}
                  className="text-[#F4F0FA]/60 hover:text-[#F4F0FA] p-0.5"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* 4 Stats Cards Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                <div className="p-2 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.25)]">
                  <div className="text-xl font-bold font-mono text-[#F4F0FA]">{stats.played}</div>
                  <div className="text-[10px] text-[#C4B7D7] font-sans">ஆடியவை</div>
                </div>
                <div className="p-2 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.25)]">
                  <div className="text-xl font-bold font-mono text-[#A6F0CF]">
                    {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                  </div>
                  <div className="text-[10px] text-[#C4B7D7] font-sans">வெற்றி %</div>
                </div>
                <div className="p-2 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.25)]">
                  <div className="text-xl font-bold font-mono text-[#D49B27] flex items-center justify-center gap-1">
                    {stats.currentStreak}
                    <Flame className="size-3.5 text-[#D49B27]" />
                  </div>
                  <div className="text-[10px] text-[#C4B7D7] font-sans">தொடர்</div>
                </div>
                <div className="p-2 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.25)]">
                  <div className="text-xl font-bold font-mono text-[#F4F0FA]">{stats.maxStreak}</div>
                  <div className="text-[10px] text-[#C4B7D7] font-sans">அதிகபட்சம்</div>
                </div>
              </div>

              {/* Guess Distribution Bars */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-[#C4B7D7] mb-1">GUESS DISTRIBUTION · வாய்ப்புகள்</div>
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const count = stats.guessDistribution[num as 1 | 2 | 3 | 4 | 5 | 6] || 0;
                  const maxCount = Math.max(1, ...Object.values(stats.guessDistribution));
                  const pct = Math.max(8, Math.round((count / maxCount) * 100));

                  return (
                    <div key={num} className="flex items-center gap-2 text-xs font-mono">
                      <span className="w-3 text-right text-[#C4B7D7]">{num}</span>
                      <div className="flex-1 bg-[#25173B] rounded-sm overflow-hidden h-4">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full flex items-center justify-end px-1.5 text-[10px] font-bold ${
                            count > 0 ? "bg-[#2D8A68] text-white" : "bg-transparent text-[#C4B7D7]/40"
                          }`}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message Toast */}
      <div className="h-7 mb-2">
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="bg-[#A6F0CF] text-[#140C20] px-3.5 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nx6 Tile Grid (Strictly wordLength columns) */}
      <div className="grid gap-2 mb-6">
        {Array.from({ length: maxGuesses }).map((_, rowIdx) => {
          const isSubmitted = rowIdx < guesses.length;
          const isCurrent = rowIdx === guesses.length;
          const rowWord = isSubmitted ? guesses[rowIdx] : isCurrent ? currentGuess : "";
          const rowTokens = getTokens(rowWord);
          const statuses = isSubmitted ? evaluateGuess(rowWord) : [];

          return (
            <motion.div
              key={rowIdx}
              animate={isCurrent && shakeRow ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex gap-1 sm:gap-2 justify-center"
            >
              {Array.from({ length: wordLength }).map((_, colIdx) => {
                const char = rowTokens[colIdx] || "";
                const status: TileStatus = isSubmitted ? statuses[colIdx] : "empty";

                let bgClass = "bg-[#140C20] border-2 border-[rgba(125,96,166,0.25)] text-[#F4F0FA]";
                if (status === "correct") {
                  bgClass = "bg-[#2D8A68] border-2 border-[#3EAA82] text-white shadow-[0_0_12px_rgba(45,138,104,0.4)]";
                } else if (status === "present") {
                  bgClass = "bg-[#D49B27] border-2 border-[#E8B342] text-white shadow-[0_0_12px_rgba(212,155,39,0.35)]";
                } else if (status === "absent") {
                  bgClass = "bg-[#25173B]/90 border-2 border-[rgba(125,96,166,0.35)] text-[#C4B7D7]/60";
                } else if (char) {
                  bgClass = "bg-[#1C122C] border-2 border-[#A6F0CF]/60 text-[#F4F0FA] scale-[1.04]";
                }

                return (
                  <motion.div
                    key={colIdx}
                    initial={false}
                    animate={
                      isSubmitted
                        ? {
                            rotateX: [0, 90, 0],
                            transition: { delay: colIdx * 0.11, duration: 0.45 },
                          }
                        : char
                        ? { scale: [1, 1.15, 1], transition: { duration: 0.15 } }
                        : {}
                    }
                    className={`${tileSizeClass} rounded-xl flex items-center justify-center font-bold transition-colors select-none ${bgClass}`}
                  >
                    <span
                      lang={mode === "tamil" ? "ta" : undefined}
                      className={mode === "tamil" ? "font-tamil" : "font-sans"}
                    >
                      {char}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      {/* Post-Game Cultural Dossier Card */}
      <AnimatePresence>
        {gameStatus !== "playing" && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="w-full bg-[#1C122B] border-2 border-[#C79347]/50 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden card-pathirikai"
          >
            {/* Celebratory Sparkle Particles Effect */}
            {gameStatus === "won" && (
              <div className="absolute top-0 right-0 p-3 pointer-events-none opacity-40">
                <Sparkles className="size-16 text-[#C79347]" />
              </div>
            )}

            {/* Appraisal Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C79347] font-bold flex items-center gap-1.5">
                {gameStatus === "won" ? (
                  <>
                    <Sparkles className="size-4 text-[#C79347]" />
                    <span>{winAppraisal?.ta} · SOLVED!</span>
                  </>
                ) : (
                  <span>விடை · REVEALED</span>
                )}
              </span>
              <span className="text-xs font-mono text-[#CBBBA8]">
                {edition.monthEn} {edition.year}
              </span>
            </div>

            {/* Bilingual Target Word & Pronunciation Listen Button */}
            <div className="flex flex-wrap items-baseline gap-3 mb-3">
              <h3 className="text-3xl font-serif text-[#FAF5ED] font-bold tracking-tight">
                {edition.tanglishWord}
              </h3>
              <span lang="ta" className="text-2xl font-tamil text-[#2BB5A8] font-semibold">
                {edition.tamilWord}
              </span>

              {/* Audio Pronunciation Button */}
              {isSpeechSupported() && (
                <button
                  onClick={handleListenPronunciation}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
                    isPlayingAudio
                      ? "bg-[#0F766E] text-[#FAF5ED]"
                      : "bg-[#271A3C] hover:bg-[#34224f] text-[#2BB5A8] border border-[#2BB5A8]/30"
                  }`}
                  title="Listen to Tamil pronunciation"
                >
                  <Volume2 className={`size-3.5 ${isPlayingAudio ? "text-[#FAF5ED]" : ""}`} />
                  <span>{isPlayingAudio ? "ஒலிக்கிறது..." : "ஒலி வடிவம் · Listen"}</span>
                </button>
              )}
            </div>

            {/* Cultural Narrative Explanation */}
            <p className="text-sm text-[#F4F0FA]/90 mb-4 leading-relaxed font-sans">
              {mode === "tanglish" && edition.tanglish?.meaningEn
                ? edition.tanglish.meaningEn
                : edition.culturalContext}
            </p>

            {/* Social Share & Action Bar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-[rgba(125,96,166,0.3)]">
              {/* WhatsApp 1-Click Share Button */}
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20BA5A] text-[#0B1E13] px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Share2 className="size-3.5" />
                <span>WhatsApp-ல் பகிர்</span>
              </button>

              {/* Copy Grid Button for GroupMe / Instagram */}
              <button
                onClick={copyShareGrid}
                className="flex items-center gap-1.5 bg-[#A6F0CF] hover:bg-[#85E2B8] text-[#140C20] px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md active:scale-95"
              >
                {copiedShare ? (
                  <>
                    <Check className="size-3.5 text-emerald-900" />
                    <span>Copied Score!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy Grid (GroupMe/IG)</span>
                  </>
                )}
              </button>

              {/* Play Again / Mode Switch */}
              <button
                onClick={() => {
                  setGuesses([]);
                  setCurrentGuess("");
                  setGameStatus("playing");
                  setErrorMessage(null);
                }}
                className="flex items-center gap-1 text-xs font-mono text-[#F4F0FA]/70 hover:text-[#F4F0FA] px-3 py-2 rounded-lg bg-[#25173B] border border-[rgba(125,96,166,0.25)] hover:bg-[#341F50] transition-colors"
              >
                <RotateCcw className="size-3.5" />
                <span>Play Again</span>
              </button>

              <a
                href={SITE_CONFIG.groupMeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono text-[#F4F0FA]/60 hover:text-[#A6F0CF] underline underline-offset-4 px-2 py-1 transition-colors ml-auto"
              >
                OSU TS GroupMe ↗
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Virtual Keyboard (High-Contrast Courtyard Palette) */}
      {mode === "tanglish" ? (
        <div className="w-full flex flex-col gap-1.5 select-none">
          {qwertyRows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5 w-full">
              {row.map((key) => {
                const isAction = key === "ENTER" || key === "⌫";
                const status = keyboardLetterStatuses[key];

                let bgClass =
                  "bg-[#25173B] hover:bg-[#341F50] text-[#F4F0FA] border border-[rgba(125,96,166,0.35)] shadow-xs";
                if (status === "correct") {
                  bgClass =
                    "bg-[#2D8A68] hover:bg-[#359B76] text-white border border-[#3EAA82] font-bold shadow-[0_0_12px_rgba(45,138,104,0.4)]";
                } else if (status === "present") {
                  bgClass =
                    "bg-[#D49B27] hover:bg-[#E2A932] text-white border border-[#E8B342] font-bold shadow-[0_0_12px_rgba(212,155,39,0.35)]";
                } else if (status === "absent") {
                  bgClass = "bg-[#140C20]/80 text-[#C4B7D7]/40 border border-transparent";
                } else if (isAction) {
                  bgClass =
                    "bg-[#382158] hover:bg-[#4D2D7A] text-[#A6F0CF] border border-[#A6F0CF]/30 shadow-xs font-bold";
                }

                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === "ENTER") handleSubmit();
                      else if (key === "⌫") handleBackspace();
                      else handleKey(key);
                    }}
                    className={`h-12 rounded-lg font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                      isAction ? "px-2.5 sm:px-4 text-[11px] sm:text-xs" : "flex-1 max-w-[42px]"
                    } ${bgClass}`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        /* Tamil Akshara On-Screen Keyboard */
        <div className="w-full bg-[#201332] p-4 rounded-2xl border border-[rgba(125,96,166,0.3)] select-none shadow-lg">
          <p className="text-xs font-mono text-[#F4F0FA]/70 text-center mb-3">
            Click syllables to build word · எழுத்துக்களைத் தேர்ந்தெடுக்கவும்:
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {edition.aksharaKeyboard.map((akshara: string) => {
              const status = keyboardLetterStatuses[akshara];
              let bgClass =
                "bg-[#1C122C] hover:bg-[#2D1B47] text-[#F4F0FA] border border-[rgba(125,96,166,0.35)] shadow-xs";
              if (status === "correct") {
                bgClass =
                  "bg-[#2D8A68] text-white border border-[#3EAA82] font-bold shadow-[0_0_12px_rgba(45,138,104,0.4)]";
              } else if (status === "present") {
                bgClass =
                  "bg-[#D49B27] text-white border border-[#E8B342] font-bold shadow-[0_0_12px_rgba(212,155,39,0.35)]";
              } else if (status === "absent") {
                bgClass = "bg-[#140C20]/80 text-[#C4B7D7]/40 border border-transparent";
              }

              return (
                <button
                  key={akshara}
                  onClick={() => handleKey(akshara)}
                  lang="ta"
                  className={`size-11 sm:size-12 rounded-xl font-tamil font-bold text-base sm:text-lg shadow-xs active:scale-95 transition-all ${bgClass}`}
                >
                  {akshara}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleBackspace}
              className="px-5 py-2.5 rounded-xl bg-[#2E1B46] hover:bg-[#3D235D] text-[#C4B7D7] border border-[rgba(125,96,166,0.3)] font-mono text-xs font-bold active:scale-95 transition-colors"
            >
              ⌫ நீக்கு (BACK)
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-[#A6F0CF] hover:bg-[#85E2B8] text-[#140C20] font-mono text-xs font-bold active:scale-95 transition-colors shadow-[0_0_16px_rgba(166,240,207,0.3)]"
            >
              சரிபார் (SUBMIT) ↵
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
