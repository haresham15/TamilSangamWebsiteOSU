// src/components/games/sol-vettai/StrandsGame.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { GameShell } from "../shared/GameShell";
import {
  getDailyStrands,
  type StrandsPuzzle,
  type StrandsWord,
} from "@/data/games/strandsData";
import { getDailyDateString, getPuzzleNumber } from "@/lib/games/seed";
import {
  getDailyGameRecord,
  updateDailyGameRecord,
} from "@/lib/games/storage";
import { generateShareCard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { Sparkles, Lightbulb, Check } from "lucide-react";

export function StrandsGame() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const dailyDate = useMemo(() => getDailyDateString(), []);
  const puzzleNum = useMemo(() => getPuzzleNumber(dailyDate), [dailyDate]);

  const currentSeed = isPractice ? `practice-${practiceIndex}` : dailyDate;
  const puzzle: StrandsPuzzle = useMemo(
    () => getDailyStrands(currentSeed),
    [currentSeed]
  );

  // Found words
  const [foundWords, setFoundWords] = useState<string[]>([]);
  // Currently selected cells in active drag
  const [selectedCells, setSelectedCells] = useState<Array<{ r: number; c: number }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [hintCharge, setHintCharge] = useState(0); // 0 to 3
  const [highlightedHintCells, setHighlightedHintCells] = useState<Array<{ r: number; c: number }>>([]);
  const boardRef = useRef<HTMLDivElement>(null);

  // Initialize or load record
  useEffect(() => {
    if (!isPractice) {
      const rec = getDailyGameRecord("sol-vettai", dailyDate);
      if (rec.status === "won") {
        setIsWon(true);
        setFoundWords(puzzle.words.map((w) => w.word));
        setTimer(rec.solveTimeSeconds || 68);
        return;
      }
    }

    setFoundWords([]);
    setSelectedCells([]);
    setIsWon(false);
    setTimer(0);
    setTimerActive(true);
    setHintCharge(0);
    setHighlightedHintCells([]);
  }, [puzzle, isPractice, dailyDate]);

  // Timer loop
  useEffect(() => {
    if (!timerActive || isWon) return;
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, isWon]);

  // Check if cell is part of already found words
  const cellColorMap = useMemo(() => {
    const map = new Map<string, "theme" | "spangram">();
    for (const w of puzzle.words) {
      if (foundWords.includes(w.word)) {
        for (const cell of w.cells) {
          map.set(`${cell.r},${cell.c}`, w.isSpangram ? "spangram" : "theme");
        }
      }
    }
    return map;
  }, [puzzle, foundWords]);

  // Check if adjacent (8 directions)
  const isAdjacent = (
    c1: { r: number; c: number },
    c2: { r: number; c: number }
  ) => {
    return Math.abs(c1.r - c2.r) <= 1 && Math.abs(c1.c - c2.c) <= 1;
  };

  const handlePointerDown = (r: number, c: number) => {
    if (isWon || cellColorMap.has(`${r},${c}`)) return;
    setIsDragging(true);
    setSelectedCells([{ r, c }]);
    arcadeAudio.playClick(440);
  };

  const handlePointerEnter = (r: number, c: number) => {
    if (!isDragging || isWon || cellColorMap.has(`${r},${c}`)) return;

    const existingIdx = selectedCells.findIndex((p) => p.r === r && p.c === c);
    if (existingIdx !== -1) {
      // Backtracking
      if (existingIdx === selectedCells.length - 2) {
        setSelectedCells((prev) => prev.slice(0, prev.length - 1));
        arcadeAudio.playClick(380);
      }
      return;
    }

    const last = selectedCells[selectedCells.length - 1];
    if (last && isAdjacent(last, { r, c })) {
      setSelectedCells((prev) => [...prev, { r, c }]);
      arcadeAudio.playClick(460 + selectedCells.length * 20);
    }
  };

  const handlePointerUp = useCallback(() => {
    if (!isDragging || isWon) return;
    setIsDragging(false);

    // Form word from selected cells
    const word = selectedCells.map((p) => puzzle.grid[p.r][p.c]).join("");
    const matched = puzzle.words.find(
      (w) => w.word === word && !foundWords.includes(w.word)
    );

    if (matched) {
      arcadeAudio.playSuccessChime();
      const nextFound = [...foundWords, matched.word];
      setFoundWords(nextFound);
      setHighlightedHintCells([]);

      // Check win condition: all words found
      if (nextFound.length === puzzle.words.length) {
        setIsWon(true);
        setTimerActive(false);
        arcadeAudio.playVictoryArpeggio();
        if (!isPractice) {
          updateDailyGameRecord(
            "sol-vettai",
            {
              status: "won",
              solveTimeSeconds: timer,
            },
            dailyDate
          );
        }
      }
    } else {
      if (selectedCells.length >= 4) {
        // Non-theme word charge
        setHintCharge((prev) => Math.min(3, prev + 1));
      }
      arcadeAudio.playErrorThud();
    }

    setSelectedCells([]);
  }, [isDragging, isWon, selectedCells, puzzle, foundWords, timer, isPractice, dailyDate]);

  const handleUseHint = () => {
    if (hintCharge < 3) return;
    // Find first unfound theme word
    const unfound = puzzle.words.find((w) => !foundWords.includes(w.word));
    if (unfound) {
      setHighlightedHintCells(unfound.cells);
      setHintCharge(0);
      arcadeAudio.playClick(580);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const shareCard = useMemo(() => {
    return generateShareCard({
      gameSlug: "sol-vettai",
      titleEn: "Sol Vettai",
      puzzleNumber: puzzleNum,
      timeFormatted: formatTimer(timer),
      movesOrGuesses: `Found all ${puzzle.words.length} theme words & Spangram`,
      customLine: `Theme: ${puzzle.theme}`,
    });
  }, [puzzleNum, timer, puzzle]);

  return (
    <GameShell
      gameSlug="sol-vettai"
      titleEn="Sol Vettai"
      titleTa="சொல் வேட்டை"
      subtitleEn="Theme Word Hunt & Spangram"
      puzzleNumber={puzzleNum}
      dateStr={dailyDate}
      isPracticeMode={isPractice}
      onTogglePractice={() => {
        setIsPractice((p) => !p);
        setPracticeIndex((i) => i + 1);
      }}
      elapsedSeconds={timer}
      movesOrScore={`${foundWords.length} / ${puzzle.words.length} Words`}
      rules={[
        "Drag across adjacent letters in any of the 8 directions to trace words.",
        "Every single letter on the grid belongs to either a theme word or the Spangram.",
        "Theme words highlight in seafoam blue; the golden Spangram names the theme and spans across the board.",
        "Finding non-theme words charges the hint meter (3 words = 1 Hint).",
      ]}
      tips={[
        "Follow the theme clue: words are tightly connected by Tamil cultural tradition.",
        "The golden Spangram touches opposite borders of the board.",
      ]}
      culturalNote="Sol Vettai (சொல் வேட்டை) combines spatial visual acuity with Tamil vocabulary, tracing continuous snake-paths through sacred courtyard themes."
      isComplete={isWon}
      gameStatus={isWon ? "won" : "in_progress"}
      shareCardText={shareCard}
      culturalTrivia={`All words traced! Theme: ${puzzle.theme} (${puzzle.tamilTheme}). Spangram: ${puzzle.spangramWord}`}
      onPlayAgainPractice={() => {
        setIsPractice(true);
        setPracticeIndex((i) => i + 1);
      }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Theme Clue Banner */}
        <div className="w-full mb-3 p-3.5 rounded-2xl bg-[#25173B] border border-[rgba(166,240,207,0.35)] text-center shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6F0CF] font-bold block mb-0.5">
            TODAY&apos;S THEME
          </span>
          <h2 className="text-base font-serif font-medium text-[#F4F0FA]">
            {puzzle.theme}{" "}
            <span lang="ta" className="text-xs text-[#E5B869] font-normal" style={{ letterSpacing: 0 }}>
              ({puzzle.tamilTheme})
            </span>
          </h2>
          <p className="text-xs text-[#C4B7D7] mt-1">{puzzle.themeClue}</p>
        </div>

        {/* Current Traced Word Display */}
        <div className="h-8 flex items-center justify-center mb-2">
          {selectedCells.length > 0 && (
            <span className="text-xl font-mono font-bold tracking-wider text-[#A6F0CF] animate-pulse">
              {selectedCells.map((p) => puzzle.grid[p.r][p.c]).join("")}
            </span>
          )}
        </div>

        {/* 6x8 Board Grid */}
        <div
          ref={boardRef}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ touchAction: "none" }}
          className="w-full aspect-[6/8] p-2 rounded-2xl bg-[#140C20] border-2 border-[rgba(125,96,166,0.5)] shadow-2xl grid grid-cols-6 grid-rows-8 gap-1.5 select-none mb-3"
        >
          {puzzle.grid.map((row, r) =>
            row.map((letter, c) => {
              const key = `${r},${c}`;
              const foundType = cellColorMap.get(key);
              const isSelected = selectedCells.some(
                (p) => p.r === r && p.c === c
              );
              const isHinted = highlightedHintCells.some(
                (p) => p.r === r && p.c === c
              );

              let tileStyle =
                "bg-[#1E142E] text-[#F4F0FA] border-[rgba(125,96,166,0.3)] hover:bg-[#25173B]";

              if (foundType === "spangram") {
                tileStyle =
                  "bg-[#E5B869] text-[#140C20] font-black border-[#FDE047] shadow-[0_0_12px_rgba(229,184,105,0.4)]";
              } else if (foundType === "theme") {
                tileStyle =
                  "bg-[#38BDF8] text-[#0A0612] font-black border-[#7DD3FC] shadow-[0_0_12px_rgba(56,189,248,0.3)]";
              } else if (isSelected) {
                tileStyle =
                  "bg-[#A6F0CF] text-[#140C20] font-bold border-[#34D399] scale-95 shadow-[0_0_10px_#A6F0CF]";
              } else if (isHinted) {
                tileStyle =
                  "bg-[#341F50] text-[#E5B869] border-[#E5B869] animate-pulse";
              }

              return (
                <div
                  key={key}
                  onPointerDown={() => handlePointerDown(r, c)}
                  onPointerEnter={() => handlePointerEnter(r, c)}
                  className={`rounded-xl flex items-center justify-center font-mono font-bold text-sm sm:text-base border transition-all cursor-pointer ${tileStyle}`}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Toolbar: Hint Button & Words Counter */}
        <div className="w-full flex items-center justify-between text-xs font-mono">
          <span className="text-[#C4B7D7]">
            Found:{" "}
            <span className="text-[#A6F0CF] font-bold">
              {foundWords.length} / {puzzle.words.length}
            </span>
          </span>

          <button
            onClick={handleUseHint}
            disabled={hintCharge < 3}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              hintCharge >= 3
                ? "bg-[#E5B869] text-[#140C20] font-bold border-[#FDE047] shadow-[0_0_12px_rgba(229,184,105,0.4)]"
                : "bg-[#25173B] text-[#C4B7D7]/40 border-[rgba(125,96,166,0.2)] opacity-60"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Hint ({hintCharge}/3)
          </button>
        </div>
      </div>
    </GameShell>
  );
}
