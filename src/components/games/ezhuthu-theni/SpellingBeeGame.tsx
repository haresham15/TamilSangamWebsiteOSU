// src/components/games/ezhuthu-theni/SpellingBeeGame.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GameShell } from "../shared/GameShell";
import {
  getDailyHoneycomb,
  getRankTitle,
  type BeeHoneycomb,
  type BeeWord,
} from "@/data/games/spellingBeeData";
import { getDailyDateString, getPuzzleNumber } from "@/lib/games/seed";
import {
  getDailyGameRecord,
  updateDailyGameRecord,
} from "@/lib/games/storage";
import { generateShareCard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { Shuffle, Delete, CornerDownLeft, AlertCircle, BookOpen } from "lucide-react";

export function SpellingBeeGame() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const dailyDate = useMemo(() => getDailyDateString(), []);
  const puzzleNum = useMemo(() => getPuzzleNumber(dailyDate), [dailyDate]);

  const currentSeed = isPractice ? `practice-${practiceIndex}` : dailyDate;
  const honeycomb: BeeHoneycomb = useMemo(
    () => getDailyHoneycomb(currentSeed),
    [currentSeed]
  );

  const [outerLetters, setOuterLetters] = useState<string[]>(honeycomb.outerLetters);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [foundWords, setFoundWords] = useState<BeeWord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync outer letters on honeycomb change
  useEffect(() => {
    setOuterLetters([...honeycomb.outerLetters]);
    setFoundWords([]);
    setCurrentInput("");
  }, [honeycomb]);

  // Total max score
  const maxScore = useMemo(() => {
    return honeycomb.words.reduce((acc, w) => {
      let pts = w.word.length === 4 ? 1 : w.word.length;
      if (w.isPangram) pts += 7;
      return acc + pts;
    }, 0);
  }, [honeycomb]);

  // Current user score
  const currentScore = useMemo(() => {
    return foundWords.reduce((acc, w) => {
      let pts = w.word.length === 4 ? 1 : w.word.length;
      if (w.isPangram) pts += 7;
      return acc + pts;
    }, 0);
  }, [foundWords]);

  const rank = useMemo(
    () => getRankTitle(currentScore, maxScore),
    [currentScore, maxScore]
  );

  // Load saved state
  useEffect(() => {
    if (!isPractice) {
      const rec = getDailyGameRecord("ezhuthu-theni", dailyDate);
      if (rec.state && Array.isArray(rec.state)) {
        const savedWords = honeycomb.words.filter((w) =>
          (rec.state as string[]).includes(w.word)
        );
        setFoundWords(savedWords);
      }
    }
  }, [honeycomb, isPractice, dailyDate]);

  const handleShuffle = () => {
    arcadeAudio.playClick(400);
    setOuterLetters((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  };

  const handleLetterClick = (letter: string) => {
    arcadeAudio.playClick(500);
    setCurrentInput((prev) => prev + letter);
    setErrorMessage(null);
  };

  const handleDelete = () => {
    arcadeAudio.playClick(320);
    setCurrentInput((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleEnter = () => {
    if (!currentInput) return;

    if (currentInput.length < 4) {
      setErrorMessage("Too short (must be 4+ letters)");
      arcadeAudio.playErrorThud();
      return;
    }

    if (!currentInput.includes(honeycomb.centerLetter)) {
      setErrorMessage(`Must contain center letter '${honeycomb.centerLetter}'`);
      arcadeAudio.playErrorThud();
      return;
    }

    const alreadyFound = foundWords.some((w) => w.word === currentInput);
    if (alreadyFound) {
      setErrorMessage("Already found!");
      arcadeAudio.playErrorThud();
      return;
    }

    const matchedWord = honeycomb.words.find((w) => w.word === currentInput);
    if (matchedWord) {
      arcadeAudio.playSuccessChime();
      const nextFound = [...foundWords, matchedWord];
      setFoundWords(nextFound);
      setCurrentInput("");
      setErrorMessage(null);

      // Save state
      if (!isPractice) {
        updateDailyGameRecord(
          "ezhuthu-theni",
          {
            status: "in_progress",
            score: currentScore + (matchedWord.word.length === 4 ? 1 : matchedWord.word.length),
            state: nextFound.map((w) => w.word),
          },
          dailyDate
        );
      }
    } else {
      setErrorMessage("Not in word list");
      arcadeAudio.playErrorThud();
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "Enter") {
        handleEnter();
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === " ") {
        handleShuffle();
      } else {
        const upper = e.key.toUpperCase();
        if (
          upper === honeycomb.centerLetter ||
          honeycomb.outerLetters.includes(upper)
        ) {
          handleLetterClick(upper);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const isComplete = currentScore >= maxScore * 0.7; // Scholar threshold

  const shareCard = useMemo(() => {
    return generateShareCard({
      gameSlug: "ezhuthu-theni",
      titleEn: "Ezhuthu Theni",
      puzzleNumber: puzzleNum,
      movesOrGuesses: `${foundWords.length} words found`,
      scoreOrMax: `Score: ${currentScore} pts · ${rank}`,
    });
  }, [puzzleNum, foundWords.length, currentScore, rank]);

  return (
    <GameShell
      gameSlug="ezhuthu-theni"
      titleEn="Ezhuthu Theni"
      titleTa="எழுத்து தேனீ"
      subtitleEn="Honeycomb Vocabulary Bee"
      puzzleNumber={puzzleNum}
      dateStr={dailyDate}
      isPracticeMode={isPractice}
      onTogglePractice={() => {
        setIsPractice((p) => !p);
        setPracticeIndex((i) => i + 1);
      }}
      movesOrScore={`${currentScore} pts · ${foundWords.length} words`}
      rules={[
        "Form words using letters from the 7-tile honeycomb.",
        "Words must be at least 4 letters long and MUST contain the center letter.",
        "Letters can be used more than once.",
        "4-letter words = 1 pt. Longer words = 1 pt per letter. Pangrams = +7 bonus pts!",
      ]}
      tips={[
        "Search for recurring Tamil prefixes like 'KA-', 'PA-', or 'A-'.",
        "The Pangram uses all 7 letters at least once—worth huge bonus points!",
      ]}
      culturalNote="Ezhuthu Theni (எழுத்து தேனீ) builds vocabulary through everyday Tamil foods, kinship terms, nature, and Sangam literature with automatic bilingual definitions."
      isComplete={isComplete}
      gameStatus={isComplete ? "won" : "in_progress"}
      shareCardText={shareCard}
      culturalTrivia={`Outstanding! You've reached ${rank} with ${foundWords.length} Tamil & Tanglish words!`}
      onPlayAgainPractice={() => {
        setIsPractice(true);
        setPracticeIndex((i) => i + 1);
      }}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Score & Rank Progress */}
        <div className="w-full mb-4 p-3 rounded-2xl bg-[#1E142E] border border-[rgba(125,96,166,0.35)] flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-[#C4B7D7] block text-[10px] uppercase">
              Current Rank
            </span>
            <span className="text-[#E5B869] font-bold text-sm">{rank}</span>
          </div>

          <div className="text-right">
            <span className="text-[#C4B7D7] block text-[10px] uppercase">
              Points
            </span>
            <span className="text-[#A6F0CF] font-bold text-sm">
              {currentScore} / {maxScore}
            </span>
          </div>
        </div>

        {/* Current Typed Word Display */}
        <div className="h-12 w-full flex items-center justify-center mb-2">
          <span className="text-2xl sm:text-3xl font-mono font-bold tracking-widest text-[#F4F0FA]">
            {currentInput.split("").map((ch, idx) => (
              <span
                key={idx}
                className={ch === honeycomb.centerLetter ? "text-[#E5B869]" : "text-[#F4F0FA]"}
              >
                {ch}
              </span>
            ))}
            <span className="animate-pulse text-[#A6F0CF]">_</span>
          </span>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-3 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono flex items-center gap-1.5 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMessage}
          </div>
        )}

        {/* 7-Tile Honeycomb Layout */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 select-none">
          {/* Center Button (Gold) */}
          <button
            onClick={() => handleLetterClick(honeycomb.centerLetter)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#E5B869] text-[#140C20] font-mono font-black text-2xl sm:text-3xl shadow-[0_0_25px_rgba(229,184,105,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-10"
          >
            {honeycomb.centerLetter}
          </button>

          {/* 6 Outer Buttons (Violet) */}
          {outerLetters.map((letter, idx) => {
            const angle = (idx * 60 - 30) * (Math.PI / 180);
            const radius = 80; // px
            const x = Math.round(radius * Math.cos(angle));
            const y = Math.round(radius * Math.sin(angle));

            return (
              <button
                key={idx}
                onClick={() => handleLetterClick(letter)}
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
                className="absolute top-1/2 left-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#25173B] border border-[rgba(125,96,166,0.5)] text-[#F4F0FA] font-mono font-bold text-xl sm:text-2xl shadow-lg hover:bg-[#342052] hover:border-[#A6F0CF]/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Delete, Shuffle, Enter */}
        <div className="flex gap-2.5 my-4">
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] text-[#C4B7D7] hover:text-[#F4F0FA] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <Delete className="w-4 h-4" /> Delete
          </button>
          <button
            onClick={handleShuffle}
            className="p-2.5 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] text-[#A6F0CF] hover:bg-[#342052] transition-colors"
            title="Shuffle Outer Letters"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={handleEnter}
            className="px-5 py-2.5 rounded-xl bg-[#A6F0CF] text-[#140C20] font-mono font-bold text-xs flex items-center gap-1.5 hover:bg-[#bbf4dc] transition-colors"
          >
            Enter <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Found Words Drawer with Tamil Script + English Meanings */}
        {foundWords.length > 0 && (
          <div className="w-full mt-2 p-4 rounded-2xl bg-[#1B112B] border border-[rgba(125,96,166,0.35)] max-h-48 overflow-y-auto">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6F0CF] font-bold flex items-center gap-1.5 mb-2.5">
              <BookOpen className="w-3.5 h-3.5" />
              FOUND WORDS ({foundWords.length})
            </span>

            <div className="flex flex-wrap gap-2">
              {foundWords.map((w, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#25173B] border border-[rgba(125,96,166,0.3)] text-xs flex items-center gap-1.5"
                >
                  <span className="font-mono font-bold text-[#F4F0FA]">
                    {w.word}
                  </span>
                  <span lang="ta" className="text-[#E5B869]" style={{ letterSpacing: 0 }}>
                    ({w.tamil})
                  </span>
                  <span className="text-[11px] text-[#C4B7D7]/70 hidden sm:inline">
                    · {w.meaning}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
