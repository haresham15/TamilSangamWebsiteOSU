// src/components/games/naanku-sorkal/QuordleGame.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GameShell } from "../shared/GameShell";
import { VirtualKeyboard, type KeyStatus } from "../shared/VirtualKeyboard";
import {
  getDailyQuordleTargets,
  isValidQuordleGuess,
} from "@/data/games/quordleData";
import { getDailyDateString, getPuzzleNumber } from "@/lib/games/seed";
import {
  getDailyGameRecord,
  updateDailyGameRecord,
} from "@/lib/games/storage";
import { generateShareCard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { Check, AlertCircle } from "lucide-react";

type LetterEval = "correct" | "present" | "absent" | "empty";

interface BoardState {
  target: string;
  guesses: string[];
  isSolved: boolean;
  solveGuessCount?: number;
}

export function QuordleGame() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const dailyDate = useMemo(() => getDailyDateString(), []);
  const puzzleNum = useMemo(() => getPuzzleNumber(dailyDate), [dailyDate]);

  const currentSeed = isPractice ? `practice-${practiceIndex}` : dailyDate;
  const targets = useMemo(
    () => getDailyQuordleTargets(currentSeed),
    [currentSeed]
  );

  const [currentGuess, setCurrentGuess] = useState("");
  const [submittedGuesses, setSubmittedGuesses] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0); // Mobile tab index

  // Initialize or load record
  useEffect(() => {
    if (!isPractice) {
      const rec = getDailyGameRecord("naanku-sorkal", dailyDate);
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
  }, [targets, isPractice, dailyDate]);

  // Evaluate a guess against a target word
  const evaluateGuess = useCallback(
    (guess: string, target: string): LetterEval[] => {
      const result: LetterEval[] = Array(5).fill("absent");
      const targetLetters = target.split("");
      const guessLetters = guess.split("");

      // First pass: exact matches
      for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === targetLetters[i]) {
          result[i] = "correct";
          targetLetters[i] = "*"; // Consume letter
        }
      }

      // Second pass: present letters in wrong spot
      for (let i = 0; i < 5; i++) {
        if (result[i] !== "correct") {
          const matchIdx = targetLetters.indexOf(guessLetters[i]);
          if (matchIdx !== -1) {
            result[i] = "present";
            targetLetters[matchIdx] = "*";
          }
        }
      }

      return result;
    },
    []
  );

  // Boards status calculation
  const boardsState: BoardState[] = useMemo(() => {
    return targets.map((target) => {
      const boardGuesses: string[] = [];
      let isSolved = false;
      let solveGuessCount: number | undefined;

      for (let i = 0; i < submittedGuesses.length; i++) {
        const g = submittedGuesses[i];
        if (!isSolved) {
          boardGuesses.push(g);
          if (g === target) {
            isSolved = true;
            solveGuessCount = i + 1;
          }
        }
      }

      return {
        target,
        guesses: boardGuesses,
        isSolved,
        solveGuessCount,
      };
    });
  }, [targets, submittedGuesses]);

  // Check victory / defeat
  useEffect(() => {
    const allSolved = boardsState.every((b) => b.isSolved);
    if (allSolved && !isWon) {
      setIsWon(true);
      arcadeAudio.playVictoryArpeggio();
      if (!isPractice) {
        updateDailyGameRecord(
          "naanku-sorkal",
          {
            status: "won",
            guessesCount: submittedGuesses.length,
            state: submittedGuesses,
          },
          dailyDate
        );
      }
    } else if (submittedGuesses.length >= 9 && !allSolved && !isLost) {
      setIsLost(true);
      arcadeAudio.playErrorThud();
      if (!isPractice) {
        updateDailyGameRecord(
          "naanku-sorkal",
          {
            status: "lost",
            guessesCount: submittedGuesses.length,
            state: submittedGuesses,
          },
          dailyDate
        );
      }
    }
  }, [boardsState, submittedGuesses, isWon, isLost, isPractice, dailyDate]);

  // Keyboard multi-quadrant statuses
  const multiStatuses = useMemo(() => {
    const statuses: Record<string, KeyStatus[]> = {};

    for (let b = 0; b < 4; b++) {
      const board = boardsState[b];
      const target = board.target;

      for (const guess of board.guesses) {
        const evals = evaluateGuess(guess, target);
        for (let i = 0; i < 5; i++) {
          const char = guess[i];
          if (!statuses[char]) {
            statuses[char] = ["unused", "unused", "unused", "unused"];
          }
          const currentStatus = statuses[char][b];
          const newEval = evals[i];

          if (newEval === "correct") {
            statuses[char][b] = "correct";
          } else if (newEval === "present" && currentStatus !== "correct") {
            statuses[char][b] = "present";
          } else if (newEval === "absent" && currentStatus === "unused") {
            statuses[char][b] = "absent";
          }
        }
      }
    }

    return statuses;
  }, [boardsState, evaluateGuess]);

  // Input actions
  const handleChar = (char: string) => {
    if (isWon || isLost) return;
    if (currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + char.toUpperCase());
      setErrorMessage(null);
    }
  };

  const handleDelete = () => {
    if (isWon || isLost) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleEnter = () => {
    if (isWon || isLost) return;
    if (currentGuess.length !== 5) {
      setErrorMessage("Must be 5 letters");
      arcadeAudio.playErrorThud();
      return;
    }

    if (!isValidQuordleGuess(currentGuess)) {
      setErrorMessage("Not in word list");
      arcadeAudio.playErrorThud();
      return;
    }

    setSubmittedGuesses((prev) => [...prev, currentGuess]);
    setCurrentGuess("");
    setErrorMessage(null);
    arcadeAudio.playSuccessChime();
  };

  // Auto-switch mobile tab to next unsolved board
  useEffect(() => {
    if (boardsState[activeTab]?.isSolved) {
      const nextUnsolved = boardsState.findIndex((b) => !b.isSolved);
      if (nextUnsolved !== -1) {
        setActiveTab(nextUnsolved);
      }
    }
  }, [boardsState, activeTab]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "Enter") {
        handleEnter();
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleChar(e.key.toUpperCase());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleEnter, handleDelete, handleChar]);

  const getTileBg = (evalStatus: LetterEval) => {
    switch (evalStatus) {
      case "correct":
        return "bg-[#10B981] text-[#0A0612] border-[#34D399]";
      case "present":
        return "bg-[#F59E0B] text-[#0A0612] border-[#FBBF24]";
      case "absent":
        return "bg-[#25173B]/60 text-[#C4B7D7]/40 border-transparent";
      default:
        return "bg-[#140C20] text-[#F4F0FA] border-[rgba(125,96,166,0.35)]";
    }
  };

  const shareCard = useMemo(() => {
    const guessesUsed = isWon ? submittedGuesses.length : "X";
    const bScores = boardsState.map((b) => (b.isSolved ? b.solveGuessCount : "X"));
    return generateShareCard({
      gameSlug: "naanku-sorkal",
      titleEn: "Naanku Sorkal",
      puzzleNumber: puzzleNum,
      movesOrGuesses: `${guessesUsed}/9 Guesses`,
      scoreOrMax: `B1:${bScores[0]} B2:${bScores[1]} B3:${bScores[2]} B4:${bScores[3]}`,
    });
  }, [puzzleNum, isWon, submittedGuesses.length, boardsState]);

  return (
    <GameShell
      gameSlug="naanku-sorkal"
      titleEn="Naanku Sorkal"
      titleTa="நான்கு சொற்கள்"
      subtitleEn="Quadruple Tamil Wordle"
      puzzleNumber={puzzleNum}
      dateStr={dailyDate}
      isPracticeMode={isPractice}
      onTogglePractice={() => {
        setIsPractice((p) => !p);
        setPracticeIndex((i) => i + 1);
      }}
      movesOrScore={`${submittedGuesses.length} / 9`}
      rules={[
        "Guess all four hidden 5-letter Tamil/Tanglish words in 9 attempts.",
        "Each guess is submitted to all four boards simultaneously.",
        "Green = correct position, Amber = in word but wrong spot, Gray = not in word.",
        "Keyboard keys show 4 quadrants tracking each letter across all 4 boards.",
      ]}
      tips={[
        "Focus on solving one or two boards first to narrow down available letters.",
        "High-vowel words like 'DOSAI', 'KAVIN', or 'ALAYA' test common Tamil consonants early.",
      ]}
      culturalNote="Naanku Sorkal (நான்கு சொற்கள்) tests vocabulary across food, kinship, literature, and campus life using the 4 sacred pillars of Sangam assemblies."
      isComplete={isWon || isLost}
      gameStatus={isWon ? "won" : isLost ? "lost" : "in_progress"}
      shareCardText={shareCard}
      culturalTrivia={`All four words conquered! Solutions: ${targets.join(", ")}`}
      onPlayAgainPractice={() => {
        setIsPractice(true);
        setPracticeIndex((i) => i + 1);
      }}
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        {/* Mobile Board Selector Tabs */}
        <div className="flex sm:hidden w-full gap-1 mb-2">
          {boardsState.map((b, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1 border transition-colors ${
                activeTab === idx
                  ? "bg-[#25173B] text-[#A6F0CF] border-[#A6F0CF]/60"
                  : "bg-[#140C20] text-[#C4B7D7] border-[rgba(125,96,166,0.3)]"
              }`}
            >
              Word {idx + 1}
              {b.isSolved && <Check className="w-3 h-3 text-[#10B981]" />}
            </button>
          ))}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono flex items-center gap-1.5 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMessage}
          </div>
        )}

        {/* 2x2 Grid of Boards (or single active board on mobile) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {boardsState.map((board, bIdx) => {
            const isHiddenOnMobile = activeTab !== bIdx;

            return (
              <div
                key={bIdx}
                className={`p-2.5 rounded-xl bg-[#1B112B] border transition-all ${
                  board.isSolved
                    ? "border-[#10B981]/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "border-[rgba(125,96,166,0.35)]"
                } ${isHiddenOnMobile ? "hidden sm:block" : "block"}`}
              >
                {/* Board Mini Header */}
                <div className="flex items-center justify-between mb-1.5 px-1 text-[11px] font-mono">
                  <span className="text-[#C4B7D7]">Board {bIdx + 1}</span>
                  {board.isSolved ? (
                    <span className="text-[#10B981] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Solved ({board.solveGuessCount}/9)
                    </span>
                  ) : (
                    <span className="text-[#E5B869]">
                      {board.guesses.length}/9
                    </span>
                  )}
                </div>

                {/* 9-Row Guess Grid */}
                <div className="flex flex-col gap-1">
                  {Array.from({ length: 9 }).map((_, rowIdx) => {
                    const guess = board.guesses[rowIdx];
                    const isCurrent =
                      rowIdx === board.guesses.length && !board.isSolved;
                    const letters = guess
                      ? guess.split("")
                      : isCurrent
                      ? currentGuess.padEnd(5, " ").split("")
                      : Array(5).fill("");

                    const evaluations = guess
                      ? evaluateGuess(guess, board.target)
                      : Array(5).fill("empty");

                    return (
                      <div
                        key={rowIdx}
                        className="flex justify-center gap-1"
                      >
                        {letters.map((char, colIdx) => {
                          const evalStatus = evaluations[colIdx];
                          return (
                            <div
                              key={colIdx}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center font-mono font-bold text-xs sm:text-sm border transition-all ${getTileBg(
                                evalStatus
                              )}`}
                            >
                              {char.trim()}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Unified 4-Quadrant Keyboard */}
        <VirtualKeyboard
          onChar={handleChar}
          onDelete={handleDelete}
          onEnter={handleEnter}
          multiStatuses={multiStatuses}
          disabled={isWon || isLost}
        />
      </div>
    </GameShell>
  );
}
