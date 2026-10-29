// src/components/games/SolluWordle.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, RotateCcw } from "lucide-react";
import { soundEngine } from "@/lib/soundEngine";
import {
  SOLLU_MONTHLY_EDITIONS,
  TANG_ENGLISH_VALID_DICTIONARY,
  splitTamilAksharas,
  type SolluEdition,
} from "@/data/gamesData";
import { getArcadeStorage, saveArcadeStorage } from "@/lib/gamesStorage";

interface SolluWordleProps {
  editionKey: string; // "2026-10" | "2026-11" | "2026-12"
  onSolved?: () => void;
}

type TileStatus = "correct" | "present" | "absent" | "empty";

export function SolluWordle({ editionKey, onSolved }: SolluWordleProps) {
  const edition: SolluEdition = useMemo(() => {
    return SOLLU_MONTHLY_EDITIONS[editionKey] || SOLLU_MONTHLY_EDITIONS["2026-10"];
  }, [editionKey]);

  // Mode: "tanglish" (5-letter English letters) vs "tamil" (Tamil script Aksharas)
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
      setErrorMessage(
        mode === "tanglish"
          ? `Word must have ${wordLength} letters`
          : `${wordLength} எழுத்துக்கள் தேவை`
      );
      setTimeout(() => setShakeRow(false), 500);
      return;
    }

    // Tanglish dictionary check
    if (mode === "tanglish") {
      const upper = currentGuess.toUpperCase();
      if (!TANG_ENGLISH_VALID_DICTIONARY.has(upper) && upper !== targetWord) {
        setShakeRow(true);
        setErrorMessage("Not in Tamil/English word list");
        setTimeout(() => setShakeRow(false), 600);
        return;
      }
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
      setTimeout(() => {
        soundEngine.playBellChime();
        onSolved?.();
      }, wordLength * 110 + 200);
      return;
    }

    // Loss condition
    if (isLost) {
      setGameStatus("lost");
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
        // In Tamil mode, handle Enter and Backspace
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

  // Copy GroupMe spoiler-free share grid
  const copyShareGrid = () => {
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
    const editionNum = editionKey.replace("2026-", "");
    const modeLabel = mode === "tanglish" ? "Tanglish" : "தமிழ்";
    const text = `OSU Tamil Sangam · Sollu #${editionNum} (${edition.monthEn} · ${modeLabel}) 🕶️💥\nScore: ${score}\n\n${rows.join(
      "\n"
    )}\n\nPlay: https://tamil-sangam-website-osu.vercel.app/games`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2400);
      });
    }
  };

  // English QWERTY keyboard layout
  const qwertyRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
  ];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Mode Switcher Segmented Control */}
      <div className="flex items-center gap-1.5 mb-6 p-1 bg-[#F2EAE0] rounded-xl border border-[#161210]/15">
        <button
          onClick={() => handleModeChange("tanglish")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            mode === "tanglish"
              ? "bg-[#161210] text-[#FAF6F0] shadow-xs"
              : "text-[#161210]/70 hover:text-[#161210]"
          }`}
        >
          Tanglish & Cultural (5 Letters)
        </button>
        <button
          onClick={() => handleModeChange("tamil")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            mode === "tamil"
              ? "bg-[#161210] text-[#FAF6F0] shadow-xs"
              : "text-[#161210]/70 hover:text-[#161210]"
          }`}
        >
          <span lang="ta" className="font-tamil">
            தமிழ் எழுத்து
          </span>{" "}
          (Akshara Mode)
        </button>
      </div>

      {/* Error Message Toast */}
      <div className="h-7 mb-2">
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-[#C85A32] text-[#FAF6F0] px-3 py-1 rounded-md text-xs font-medium shadow-md"
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5x6 or Nx6 Tile Grid */}
      <div className="grid gap-2 mb-8">
        {Array.from({ length: maxGuesses }).map((_, rowIdx) => {
          const isSubmitted = rowIdx < guesses.length;
          const isCurrent = rowIdx === guesses.length;
          const rowWord = isSubmitted
            ? guesses[rowIdx]
            : isCurrent
            ? currentGuess
            : "";
          const rowTokens = getTokens(rowWord);
          const statuses = isSubmitted ? evaluateGuess(rowWord) : [];

          return (
            <motion.div
              key={rowIdx}
              animate={isCurrent && shakeRow ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex gap-2"
            >
              {Array.from({ length: wordLength }).map((_, colIdx) => {
                const char = rowTokens[colIdx] || "";
                const status: TileStatus = isSubmitted ? statuses[colIdx] : "empty";

                let bgClass = "bg-[#FAF6F0] border-2 border-[#161210]/20 text-[#161210]";
                if (status === "correct") {
                  bgClass = "bg-[#2E6F4E] border-2 border-[#2E6F4E] text-[#FAF6F0]";
                } else if (status === "present") {
                  bgClass = "bg-[#D49B27] border-2 border-[#D49B27] text-[#161210]";
                } else if (status === "absent") {
                  bgClass = "bg-[#3A332E] border-2 border-[#3A332E] text-[#FAF6F0]/80";
                } else if (char) {
                  bgClass = "bg-[#FAF6F0] border-2 border-[#161210]/70 text-[#161210] scale-[1.04]";
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
                        ? { scale: [1, 1.12, 1], transition: { duration: 0.15 } }
                        : {}
                    }
                    className={`size-13 sm:size-15 rounded-lg flex items-center justify-center font-bold text-xl sm:text-2xl transition-colors select-none ${bgClass}`}
                  >
                    <span lang={mode === "tamil" ? "ta" : undefined} className={mode === "tamil" ? "font-tamil" : "font-sans"}>
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="w-full bg-[#F2EAE0] border-2 border-[#D4AF37]/50 rounded-2xl p-6 mb-8 shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold">
                {gameStatus === "won" ? "SOLVED · அருமை!" : "REVEALED · விடை"}
              </span>
              <span className="text-xs font-mono text-[#161210]/60">
                {edition.monthEn} {edition.year}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <h3 className="text-2xl font-serif text-[#161210] font-bold">
                {edition.tanglishWord}
              </h3>
              <span lang="ta" className="text-2xl font-tamil text-[#C85A32] font-semibold">
                {edition.tamilWord}
              </span>
            </div>

            <p className="text-sm text-[#161210]/85 mb-4 leading-relaxed font-sans">
              {edition.culturalContext}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#161210]/15">
              <button
                onClick={copyShareGrid}
                className="flex items-center gap-2 bg-[#161210] hover:bg-[#C85A32] text-[#FAF6F0] px-4 py-2.5 rounded-full text-xs font-semibold transition-colors shadow-md"
              >
                {copiedShare ? (
                  <>
                    <Check className="size-4 text-emerald-400" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    <span>Copy Score for GroupMe/IG 📋</span>
                  </>
                )}
              </button>

              <a
                href="https://web.groupme.com/join_group/83424812/BeBIRg7f"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#161210]/80 hover:text-[#C85A32] underline underline-offset-4 px-2 py-1 transition-colors"
              >
                Post in OSU TS GroupMe ↗
              </a>

              <button
                onClick={() => {
                  setGuesses([]);
                  setCurrentGuess("");
                  setGameStatus("playing");
                }}
                className="flex items-center gap-1.5 text-xs font-mono text-[#161210]/70 hover:text-[#161210] px-3 py-2"
              >
                <RotateCcw className="size-3.5" />
                <span>Play Again</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Virtual Keyboard */}
      {mode === "tanglish" ? (
        <div className="w-full flex flex-col gap-1.5 select-none">
          {qwertyRows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1.5 w-full">
              {row.map((key) => {
                const isAction = key === "ENTER" || key === "⌫";
                const status = keyboardLetterStatuses[key];

                let bgClass = "bg-[#E6DCCE] hover:bg-[#DDD2C2] text-[#161210]";
                if (status === "correct") {
                  bgClass = "bg-[#2E6F4E] text-[#FAF6F0]";
                } else if (status === "present") {
                  bgClass = "bg-[#D49B27] text-[#161210]";
                } else if (status === "absent") {
                  bgClass = "bg-[#3A332E]/70 text-[#FAF6F0]/60";
                }

                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === "ENTER") handleSubmit();
                      else if (key === "⌫") handleBackspace();
                      else handleKey(key);
                    }}
                    className={`h-12 rounded-md font-bold text-xs sm:text-sm transition-colors active:scale-95 ${
                      isAction ? "px-3 sm:px-4 bg-[#D9CEC0]" : "flex-1 max-w-[42px]"
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
        <div className="w-full bg-[#F2EAE0] p-4 rounded-xl border border-[#161210]/15 select-none">
          <p className="text-xs font-mono text-[#161210]/60 text-center mb-3">
            Click syllables to build word · எழுத்துக்களைத் தேர்ந்தெடுக்கவும்:
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {edition.aksharaKeyboard.map((akshara: string) => {
              const status = keyboardLetterStatuses[akshara];
              let bgClass = "bg-[#FAF6F0] hover:bg-[#EBE2D5] text-[#161210] border border-[#161210]/20";
              if (status === "correct") bgClass = "bg-[#2E6F4E] text-[#FAF6F0]";
              else if (status === "present") bgClass = "bg-[#D49B27] text-[#161210]";
              else if (status === "absent") bgClass = "bg-[#3A332E]/70 text-[#FAF6F0]/60";

              return (
                <button
                  key={akshara}
                  onClick={() => handleKey(akshara)}
                  lang="ta"
                  className={`size-11 sm:size-12 rounded-lg font-tamil font-bold text-base sm:text-lg shadow-xs active:scale-95 transition-all ${bgClass}`}
                >
                  {akshara}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleBackspace}
              className="px-5 py-2.5 rounded-lg bg-[#E6DCCE] hover:bg-[#DDD2C2] text-[#161210] font-mono text-xs font-bold active:scale-95"
            >
              ⌫ நீக்கு (BACK)
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-lg bg-[#161210] hover:bg-[#C85A32] text-[#FAF6F0] font-mono text-xs font-bold active:scale-95 shadow-sm"
            >
              சரிபார் (SUBMIT) ↵
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
