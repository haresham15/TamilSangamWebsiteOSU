// src/components/games/en-puthir/EnPuthirGame.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GameShell } from "../shared/GameShell";
import {
  getDailyEquation,
  isValidEquation,
  TAMIL_NUMERALS,
} from "@/lib/games/generators/nerdleGenerator";
import { getDailyDateString, getPuzzleNumber } from "@/lib/games/seed";
import {
  getDailyGameRecord,
  updateDailyGameRecord,
} from "@/lib/games/storage";
import { generateShareCard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { Delete, CornerDownLeft, AlertCircle, Languages } from "lucide-react";

type TileEval = "correct" | "present" | "absent" | "empty";

export function EnPuthirGame() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const dailyDate = useMemo(() => getDailyDateString(), []);
  const puzzleNum = useMemo(() => getPuzzleNumber(dailyDate), [dailyDate]);

  const currentSeed = isPractice ? `practice-${practiceIndex}` : dailyDate;
  const targetEquation = useMemo(
    () => getDailyEquation(currentSeed),
    [currentSeed]
  );

  const [currentGuess, setCurrentGuess] = useState("");
  const [submittedGuesses, setSubmittedGuesses] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [useTamilNumerals, setUseTamilNumerals] = useState(false);

  // Initialize or load record
  useEffect(() => {
    if (!isPractice) {
      const rec = getDailyGameRecord("en-puthir", dailyDate);
      if (rec.status === "won" || rec.status === "lost") {
        if (rec.status === "won") setIsWon(true);
        if (rec.status === "lost") setIsLost(true);
        if (Array.isArray(rec.state)) {
          setSubmittedGuesses(rec.state as string[]);
        }
        return;
      }
    }

    setCurrentGuess("");
    setSubmittedGuesses([]);
    setIsWon(false);
    setIsLost(false);
  }, [targetEquation, isPractice, dailyDate]);

  // Evaluate guess
  const evaluateGuess = useCallback(
    (guess: string): TileEval[] => {
      const result: TileEval[] = Array(8).fill("absent");
      const targetArr = targetEquation.split("");
      const guessArr = guess.split("");

      // First pass: exact matches
      for (let i = 0; i < 8; i++) {
        if (guessArr[i] === targetArr[i]) {
          result[i] = "correct";
          targetArr[i] = "*";
        }
      }

      // Second pass: present in wrong spot
      for (let i = 0; i < 8; i++) {
        if (result[i] !== "correct") {
          const matchIdx = targetArr.indexOf(guessArr[i]);
          if (matchIdx !== -1) {
            result[i] = "present";
            targetArr[matchIdx] = "*";
          }
        }
      }

      return result;
    },
    [targetEquation]
  );

  // Check victory / defeat
  useEffect(() => {
    if (submittedGuesses.length > 0) {
      const lastGuess = submittedGuesses[submittedGuesses.length - 1];
      if (lastGuess === targetEquation && !isWon) {
        setIsWon(true);
        arcadeAudio.playVictoryArpeggio();
        if (!isPractice) {
          updateDailyGameRecord(
            "en-puthir",
            {
              status: "won",
              guessesCount: submittedGuesses.length,
              state: submittedGuesses,
            },
            dailyDate
          );
        }
      } else if (submittedGuesses.length >= 6 && !isWon && !isLost) {
        setIsLost(true);
        arcadeAudio.playErrorThud();
        if (!isPractice) {
          updateDailyGameRecord(
            "en-puthir",
            {
              status: "lost",
              guessesCount: submittedGuesses.length,
              state: submittedGuesses,
            },
            dailyDate
          );
        }
      }
    }
  }, [submittedGuesses, targetEquation, isWon, isLost, isPractice, dailyDate]);

  // Keyboard status
  const keyStatuses = useMemo(() => {
    const statuses: Record<string, "unused" | "absent" | "present" | "correct"> =
      {};
    for (const guess of submittedGuesses) {
      const evals = evaluateGuess(guess);
      for (let i = 0; i < 8; i++) {
        const ch = guess[i];
        const ev = evals[i];
        if (ev === "correct") {
          statuses[ch] = "correct";
        } else if (ev === "present" && statuses[ch] !== "correct") {
          statuses[ch] = "present";
        } else if (ev === "absent" && !statuses[ch]) {
          statuses[ch] = "absent";
        }
      }
    }
    return statuses;
  }, [submittedGuesses, evaluateGuess]);

  const handleChar = (char: string) => {
    if (isWon || isLost) return;
    if (currentGuess.length < 8) {
      setCurrentGuess((prev) => prev + char);
      setErrorMessage(null);
      arcadeAudio.playClick(440);
    }
  };

  const handleDelete = () => {
    if (isWon || isLost) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
    setErrorMessage(null);
    arcadeAudio.playClick(320);
  };

  const handleEnter = () => {
    if (isWon || isLost) return;
    if (currentGuess.length !== 8) {
      setErrorMessage("Must be 8 characters long");
      arcadeAudio.playErrorThud();
      return;
    }

    const val = isValidEquation(currentGuess);
    if (!val.valid) {
      setErrorMessage(val.error || "Does not compute mathematically");
      arcadeAudio.playErrorThud();
      return;
    }

    setSubmittedGuesses((prev) => [...prev, currentGuess]);
    setCurrentGuess("");
    setErrorMessage(null);
    arcadeAudio.playSuccessChime();
  };

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "Enter") {
        handleEnter();
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (/^[0-9+\-*/=]$/.test(e.key)) {
        handleChar(e.key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const getTileBg = (evalStatus: TileEval) => {
    switch (evalStatus) {
      case "correct":
        return "bg-[#10B981] text-[#0A0612] border-[#34D399]";
      case "present":
        return "bg-[#F59E0B] text-[#0A0612] border-[#FBBF24]";
      case "absent":
        return "bg-[#25173B]/50 text-[#C4B7D7]/40 border-transparent";
      default:
        return "bg-[#140C20] text-[#F4F0FA] border-[rgba(125,96,166,0.35)]";
    }
  };

  const displayChar = (char: string) => {
    if (useTamilNumerals && TAMIL_NUMERALS[char]) {
      return TAMIL_NUMERALS[char];
    }
    return char;
  };

  const shareCard = useMemo(() => {
    const used = isWon ? submittedGuesses.length : "X";
    return generateShareCard({
      gameSlug: "en-puthir",
      titleEn: "En Puthir",
      puzzleNumber: puzzleNum,
      movesOrGuesses: `${used}/6 Tries`,
      customLine: useTamilNumerals ? "Tamil Numerals (௦-௯) Mode" : undefined,
    });
  }, [puzzleNum, isWon, submittedGuesses.length, useTamilNumerals]);

  const KEYBOARD_ROWS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["+", "-", "*", "/", "=", "ENTER", "BACKSPACE"],
  ];

  return (
    <GameShell
      gameSlug="en-puthir"
      titleEn="En Puthir"
      titleTa="எண் புதிர்"
      subtitleEn="Tamil Math Equation"
      puzzleNumber={puzzleNum}
      dateStr={dailyDate}
      isPracticeMode={isPractice}
      onTogglePractice={() => {
        setIsPractice((p) => !p);
        setPracticeIndex((i) => i + 1);
      }}
      movesOrScore={`${submittedGuesses.length} / 6`}
      rules={[
        "Find the hidden 8-character mathematical equation in 6 tries.",
        "Equations follow standard BODMAS order of operations (* and / before + and -).",
        "Green = correct position, Amber = in equation but wrong spot, Gray = not in equation.",
        "Toggle 'தமிழ் எண்கள்' to see traditional Tamil numerals (௦, ௧, ௨, ௩, ௪, ௫, ௬, ௭, ௮, ௯).",
      ]}
      tips={[
        "Every equation must compute correctly (e.g. 14+28=42).",
        "The equals sign (=) is always part of the equation—find its position early!",
      ]}
      culturalNote="Ancient Tamil mathematics, pioneered by mathematicians like Kaniyan Poongunranar and recorded in palm-leaf manuscripts (சுவடி), used a decimal base with distinct symbols: ௧ (1), ௨ (2), ௩ (3), ௪ (4), ௫ (5), ௬ (6), ௭ (7), ௮ (8), ௯ (9), ௦ (0)."
      isComplete={isWon || isLost}
      gameStatus={isWon ? "won" : isLost ? "lost" : "in_progress"}
      shareCardText={shareCard}
      culturalTrivia={`Solved! The equation was: ${targetEquation}`}
      onPlayAgainPractice={() => {
        setIsPractice(true);
        setPracticeIndex((i) => i + 1);
      }}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Header Toggle: Tamil Numerals */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <button
            onClick={() => setUseTamilNumerals((t) => !t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 border transition-all ${
              useTamilNumerals
                ? "bg-[#E5B869]/20 text-[#E5B869] border-[#E5B869]/50 shadow-[0_0_12px_rgba(229,184,105,0.2)]"
                : "bg-[#25173B] text-[#C4B7D7] border-[rgba(125,96,166,0.35)] hover:text-[#F4F0FA]"
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>
              {useTamilNumerals ? "தமிழ் எண்கள்: ON (௧ ௨ ௩)" : "தமிழ் எண்கள்: OFF"}
            </span>
          </button>

          {useTamilNumerals && (
            <span
              lang="ta"
              className="text-[11px] font-sans text-[#E5B869] hidden sm:inline"
              style={{ letterSpacing: 0 }}
            >
              ௧=1 ௨=2 ௩=3 ௪=4 ௫=5 ௬=6 ௭=7 ௮=8 ௯=9 ௦=0
            </span>
          )}
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono flex items-center gap-1.5 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMessage}
          </div>
        )}

        {/* 6-Row Guess Grid */}
        <div className="flex flex-col gap-1.5 mb-5 w-full">
          {Array.from({ length: 6 }).map((_, rIdx) => {
            const guess = submittedGuesses[rIdx];
            const isCurrent = rIdx === submittedGuesses.length && !isWon && !isLost;
            const chars = guess
              ? guess.split("")
              : isCurrent
              ? currentGuess.padEnd(8, " ").split("")
              : Array(8).fill("");

            const evals = guess
              ? evaluateGuess(guess)
              : Array(8).fill("empty");

            return (
              <div key={rIdx} className="flex justify-center gap-1.5">
                {chars.map((ch, cIdx) => {
                  const ev = evals[cIdx];
                  const displayed = displayChar(ch.trim());

                  return (
                    <div
                      key={cIdx}
                      className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl flex items-center justify-center font-mono font-bold text-base sm:text-lg border-2 transition-all ${getTileBg(
                        ev
                      )}`}
                    >
                      {displayed}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Calculator-style On-Screen Keyboard */}
        <div className="w-full flex flex-col gap-1.5 select-none">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1.5">
              {row.map((key) => {
                const isWide = key === "ENTER" || key === "BACKSPACE";
                const status = keyStatuses[key];

                let bgClass =
                  "bg-[#25173B] text-[#F4F0FA] border-[rgba(125,96,166,0.35)] hover:bg-[#342052]";
                if (status === "correct") {
                  bgClass = "bg-[#10B981] text-[#0A0612] font-bold border-[#34D399]";
                } else if (status === "present") {
                  bgClass = "bg-[#F59E0B] text-[#0A0612] font-bold border-[#FBBF24]";
                } else if (status === "absent") {
                  bgClass = "bg-[#25173B]/50 text-[#C4B7D7]/40 border-transparent";
                }

                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === "ENTER") handleEnter();
                      else if (key === "BACKSPACE") handleDelete();
                      else handleChar(key);
                    }}
                    disabled={isWon || isLost}
                    className={`h-11 sm:h-12 rounded-lg font-mono font-bold border flex items-center justify-center transition-all ${
                      isWide ? "px-3 sm:px-4 text-xs" : "flex-1 max-w-[44px] text-sm sm:text-base"
                    } ${bgClass}`}
                  >
                    {key === "ENTER" ? (
                      <span className="flex items-center gap-1">
                        ENTER <CornerDownLeft className="w-3.5 h-3.5" />
                      </span>
                    ) : key === "BACKSPACE" ? (
                      <Delete className="w-4 h-4" />
                    ) : (
                      displayChar(key)
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
