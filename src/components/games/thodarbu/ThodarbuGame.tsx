// src/components/games/thodarbu/ThodarbuGame.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GameShell } from "../shared/GameShell";
import {
  getThodarbuPuzzle,
  type ThodarbuPuzzle,
} from "@/data/games/thodarbuData";
import { matchesTanglishFuzzy } from "@/lib/games/tanglish";
import { getDailyDateString, getPuzzleNumber } from "@/lib/games/seed";
import {
  getDailyGameRecord,
  updateDailyGameRecord,
} from "@/lib/games/storage";
import { generateShareCard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { Eye, Check, AlertCircle, Sparkles, Send } from "lucide-react";

export function ThodarbuGame() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const dailyDate = useMemo(() => getDailyDateString(), []);
  const puzzleNum = useMemo(() => getPuzzleNumber(dailyDate), [dailyDate]);

  const currentSeed = isPractice ? `practice-${practiceIndex}` : dailyDate;
  const puzzle: ThodarbuPuzzle = useMemo(
    () => getThodarbuPuzzle(currentSeed),
    [currentSeed]
  );

  const [revealedCount, setRevealedCount] = useState<number>(1);
  const [guessInput, setGuessInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Initialize or load record
  useEffect(() => {
    if (!isPractice) {
      const rec = getDailyGameRecord("thodarbu", dailyDate);
      if (rec.status === "won" || rec.status === "lost") {
        if (rec.status === "won") setIsWon(true);
        if (rec.status === "lost") setIsLost(true);
        setRevealedCount(5);
        setTimer(rec.solveTimeSeconds || 35);
        return;
      }
    }

    setRevealedCount(1);
    setGuessInput("");
    setErrorMessage(null);
    setIsWon(false);
    setIsLost(false);
    setTimer(0);
    setTimerActive(true);
  }, [puzzle, isPractice, dailyDate]);

  // Timer loop
  useEffect(() => {
    if (!timerActive || isWon || isLost) return;
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, isWon, isLost]);

  const handleRevealNext = () => {
    if (isWon || isLost) return;
    if (revealedCount < 5) {
      arcadeAudio.playClick(440);
      setRevealedCount((c) => c + 1);
      setErrorMessage(null);
    } else {
      // Gave up after all 5 clues
      setIsLost(true);
      setTimerActive(false);
      arcadeAudio.playErrorThud();
      if (!isPractice) {
        updateDailyGameRecord(
          "thodarbu",
          {
            status: "lost",
            solveTimeSeconds: timer,
            score: 0,
          },
          dailyDate
        );
      }
    }
  };

  const handleGuessSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isWon || isLost || !guessInput.trim()) return;

    const trimmed = guessInput.trim();
    const match = matchesTanglishFuzzy(
      trimmed,
      puzzle.answer,
      puzzle.aliases
    );

    if (match.matched) {
      setIsWon(true);
      setTimerActive(false);
      setRevealedCount(5); // Show all clues upon victory
      arcadeAudio.playVictoryArpeggio();
      const score = Math.max(1, 6 - revealedCount);
      if (!isPractice) {
        updateDailyGameRecord(
          "thodarbu",
          {
            status: "won",
            solveTimeSeconds: timer,
            score,
            moves: revealedCount,
          },
          dailyDate
        );
      }
    } else {
      arcadeAudio.playErrorThud();
      setErrorMessage("Not quite! Try another connection or reveal the next clue.");
      // If not yet at 5 clues, reveal next clue on wrong guess
      if (revealedCount < 5) {
        setRevealedCount((c) => c + 1);
      } else {
        setIsLost(true);
        setTimerActive(false);
        if (!isPractice) {
          updateDailyGameRecord(
            "thodarbu",
            {
              status: "lost",
              solveTimeSeconds: timer,
              score: 0,
            },
            dailyDate
          );
        }
      }
    }
    setGuessInput("");
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const scoreDisplay = isWon
    ? `${Math.max(1, 6 - revealedCount)}/5 Clues`
    : `${revealedCount}/5 Revealed`;

  const shareCard = useMemo(() => {
    const score = isWon ? `${Math.max(1, 6 - revealedCount)}/5` : "0/5";
    return generateShareCard({
      gameSlug: "thodarbu",
      titleEn: "Thodarbu",
      puzzleNumber: puzzleNum,
      timeFormatted: formatTimer(timer),
      scoreOrMax: `Connection Score: ${score}`,
      customLine: isWon ? `Solved in ${revealedCount} clue${revealedCount > 1 ? "s" : ""}` : undefined,
    });
  }, [puzzleNum, timer, isWon, revealedCount]);

  return (
    <GameShell
      gameSlug="thodarbu"
      titleEn="Thodarbu"
      titleTa="தொடர்பு"
      subtitleEn="Cultural Pinpoint Clues"
      puzzleNumber={puzzleNum}
      dateStr={dailyDate}
      isPracticeMode={isPractice}
      onTogglePractice={() => {
        setIsPractice((p) => !p);
        setPracticeIndex((i) => i + 1);
      }}
      elapsedSeconds={timer}
      movesOrScore={scoreDisplay}
      rules={[
        "Five progressive cultural clues reveal one by one.",
        "Identify the unifying Tamil cultural connection in as few clues as possible.",
        "Guessing on Clue 1 awards 5/5 Genius, Clue 2 awards 4/5, down to 1/5.",
        "Answers accept English, Tanglish phonetics, and native Tamil Unicode.",
      ]}
      tips={[
        "Think broadly about Tamil history, festivals, cuisine, music, and landmarks.",
        "If unsure, reveal the next clue before guessing blindly to preserve your score.",
      ]}
      culturalNote="Thodarbu (தொடர்பு - Connection) celebrates the shared motifs, metaphors, and cultural threads that bind Tamil literature, performing arts, and daily community life."
      isComplete={isWon || isLost}
      gameStatus={isWon ? "won" : isLost ? "lost" : "in_progress"}
      shareCardText={shareCard}
      culturalTrivia={puzzle.funFact}
      onPlayAgainPractice={() => {
        setIsPractice(true);
        setPracticeIndex((i) => i + 1);
      }}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Progressive Clues Stack */}
        <div className="w-full space-y-2.5 mb-5">
          {puzzle.clues.map((clue, idx) => {
            const isRevealed = idx < revealedCount;
            const isLatest = idx === revealedCount - 1 && !isWon && !isLost;

            return (
              <div
                key={idx}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  isRevealed
                    ? isLatest
                      ? "bg-[#25173B] border-[#A6F0CF]/60 shadow-[0_0_15px_rgba(166,240,207,0.1)]"
                      : "bg-[#1E142E] border-[rgba(125,96,166,0.35)] text-[#F4F0FA]"
                    : "bg-[#140C20]/50 border-dashed border-[rgba(125,96,166,0.2)] text-[#C4B7D7]/30"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                      isRevealed
                        ? "bg-[#A6F0CF] text-[#140C20]"
                        : "bg-[#25173B] text-[#C4B7D7]/40"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <p className="text-sm sm:text-base font-serif font-medium truncate">
                    {isRevealed ? clue : "Locked Clue"}
                  </p>
                </div>

                {isRevealed && (
                  <span className="text-[10px] font-mono uppercase text-[#A6F0CF] shrink-0 ml-2">
                    {idx === 0 ? "5 Pts" : `${5 - idx} Pts`}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Revealed Solution Banner on End */}
        {(isWon || isLost) && (
          <div className="w-full mb-4 p-4 rounded-2xl bg-[#25173B] border border-[rgba(166,240,207,0.4)] text-center">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A6F0CF] block mb-1">
              THE HIDDEN CONNECTION
            </span>
            <h3 className="text-xl font-serif font-medium text-[#F4F0FA]">
              {puzzle.answer}{" "}
              <span lang="ta" className="text-base text-[#E5B869] font-normal" style={{ letterSpacing: 0 }}>
                ({puzzle.tamilAnswer})
              </span>
            </h3>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-3 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono flex items-center gap-1.5 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMessage}
          </div>
        )}

        {/* Input Form & Clue Reveal Action */}
        {!isWon && !isLost && (
          <form
            onSubmit={handleGuessSubmit}
            className="w-full flex flex-col gap-2.5"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="What connects them? (e.g. flowers, malar)"
                className="flex-1 px-4 py-3 rounded-xl bg-[#1A1228] border border-[rgba(125,96,166,0.4)] text-[#F4F0FA] placeholder-[#C4B7D7]/40 text-sm focus:outline-none focus:border-[#A6F0CF] transition-colors"
                autoFocus
              />
              <button
                type="submit"
                disabled={!guessInput.trim()}
                className="px-5 py-3 rounded-xl bg-[#A6F0CF] text-[#140C20] font-medium text-sm flex items-center gap-1.5 hover:bg-[#bbf4dc] disabled:opacity-40 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Guess</span>
              </button>
            </div>

            {revealedCount < 5 && (
              <button
                type="button"
                onClick={handleRevealNext}
                className="w-full py-2.5 px-4 rounded-xl bg-[#25173B]/70 border border-[rgba(125,96,166,0.3)] text-[#C4B7D7] hover:text-[#A6F0CF] hover:border-[#A6F0CF]/40 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Reveal Clue {revealedCount + 1} of 5 ({5 - revealedCount} Pts)
              </button>
            )}
          </form>
        )}
      </div>
    </GameShell>
  );
}
