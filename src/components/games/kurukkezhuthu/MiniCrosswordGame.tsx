// src/components/games/kurukkezhuthu/MiniCrosswordGame.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { GameShell } from "../shared/GameShell";
import {
  getDailyMiniCrossword,
  type MiniCrosswordPuzzle,
  type CrosswordClue,
} from "@/data/games/miniCrosswordData";
import { getDailyDateString, getPuzzleNumber } from "@/lib/games/seed";
import {
  getDailyGameRecord,
  updateDailyGameRecord,
} from "@/lib/games/storage";
import { generateShareCard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { Check, Eye, HelpCircle } from "lucide-react";

export function MiniCrosswordGame() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const dailyDate = useMemo(() => getDailyDateString(), []);
  const puzzleNum = useMemo(() => getPuzzleNumber(dailyDate), [dailyDate]);

  const currentSeed = isPractice ? `practice-${practiceIndex}` : dailyDate;
  const puzzle: MiniCrosswordPuzzle = useMemo(
    () => getDailyMiniCrossword(currentSeed),
    [currentSeed]
  );

  // Normalized grid: 5x5 array of chars (letters or '#')
  const solutionGrid = useMemo(() => {
    return puzzle.solution.map((row) => row.replace(/\s+/g, "").split(""));
  }, [puzzle]);

  // Player's entered grid
  const [grid, setGrid] = useState<string[][]>(() =>
    solutionGrid.map((row) => row.map((ch) => (ch === "#" ? "#" : "")))
  );

  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number }>({
    r: 0,
    c: 0,
  });
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [isWon, setIsWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [checkedCells, setCheckedCells] = useState<Set<string>>(new Set());

  // Initialize or load record
  useEffect(() => {
    if (!isPractice) {
      const rec = getDailyGameRecord("kurukkezhuthu", dailyDate);
      if (rec.status === "won") {
        setIsWon(true);
        setGrid(solutionGrid);
        setTimer(rec.solveTimeSeconds || 52);
        return;
      }
    }

    setGrid(solutionGrid.map((row) => row.map((ch) => (ch === "#" ? "#" : ""))));
    setSelectedCell({ r: 0, c: 0 });
    setDirection("across");
    setIsWon(false);
    setTimer(0);
    setTimerActive(true);
  }, [puzzle, solutionGrid, isPractice, dailyDate]);

  // Timer loop
  useEffect(() => {
    if (!timerActive || isWon) return;
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, isWon]);

  // Clue numbers map
  const clueNumbers = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of [...puzzle.across, ...puzzle.down]) {
      map.set(`${c.row},${c.col}`, c.num);
    }
    return map;
  }, [puzzle]);

  // Active clue
  const activeClue = useMemo(() => {
    const list = direction === "across" ? puzzle.across : puzzle.down;
    // Find clue that covers selected cell
    for (const clue of list) {
      if (direction === "across") {
        if (
          clue.row === selectedCell.r &&
          selectedCell.c >= clue.col &&
          selectedCell.c < clue.col + clue.answer.length
        ) {
          return clue;
        }
      } else {
        if (
          clue.col === selectedCell.c &&
          selectedCell.r >= clue.row &&
          selectedCell.r < clue.row + clue.answer.length
        ) {
          return clue;
        }
      }
    }
    return list[0];
  }, [direction, puzzle, selectedCell]);

  // Check victory condition
  const checkWinCondition = useCallback(
    (currentGrid: string[][]) => {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (solutionGrid[r][c] !== "#") {
            if (currentGrid[r][c] !== solutionGrid[r][c]) {
              return false;
            }
          }
        }
      }
      return true;
    },
    [solutionGrid]
  );

  const handleCellClick = (r: number, c: number) => {
    if (solutionGrid[r][c] === "#" || isWon) return;
    arcadeAudio.playClick(440);

    if (selectedCell.r === r && selectedCell.c === c) {
      // Toggle direction
      setDirection((d) => (d === "across" ? "down" : "across"));
    } else {
      setSelectedCell({ r, c });
    }
  };

  const handleKeyInput = (char: string) => {
    if (isWon) return;
    const upper = char.toUpperCase();

    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[selectedCell.r][selectedCell.c] = upper;

      // Auto-advance cursor
      let nextR = selectedCell.r;
      let nextC = selectedCell.c;

      if (direction === "across") {
        nextC += 1;
        while (nextC < 5 && solutionGrid[nextR][nextC] === "#") nextC++;
        if (nextC < 5) setSelectedCell({ r: nextR, c: nextC });
      } else {
        nextR += 1;
        while (nextR < 5 && solutionGrid[nextR][nextC] === "#") nextR++;
        if (nextR < 5) setSelectedCell({ r: nextR, c: nextC });
      }

      if (checkWinCondition(next)) {
        setIsWon(true);
        setTimerActive(false);
        arcadeAudio.playVictoryArpeggio();
        if (!isPractice) {
          updateDailyGameRecord(
            "kurukkezhuthu",
            {
              status: "won",
              solveTimeSeconds: timer,
            },
            dailyDate
          );
        }
      }

      return next;
    });
    arcadeAudio.playClick(520);
  };

  const handleDelete = () => {
    if (isWon) return;
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[selectedCell.r][selectedCell.c] = "";

      // Move backward
      let nextR = selectedCell.r;
      let nextC = selectedCell.c;
      if (direction === "across") {
        nextC -= 1;
        while (nextC >= 0 && solutionGrid[nextR][nextC] === "#") nextC--;
        if (nextC >= 0) setSelectedCell({ r: nextR, c: nextC });
      } else {
        nextR -= 1;
        while (nextR >= 0 && solutionGrid[nextR][nextC] === "#") nextR--;
        if (nextR >= 0) setSelectedCell({ r: nextR, c: nextC });
      }

      return next;
    });
    arcadeAudio.playClick(320);
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        setDirection((d) => (d === "across" ? "down" : "across"));
      } else if (e.key === "ArrowRight") {
        setSelectedCell((cur) => ({ ...cur, c: Math.min(4, cur.c + 1) }));
      } else if (e.key === "ArrowLeft") {
        setSelectedCell((cur) => ({ ...cur, c: Math.max(0, cur.c - 1) }));
      } else if (e.key === "ArrowDown") {
        setSelectedCell((cur) => ({ ...cur, r: Math.min(4, cur.r + 1) }));
      } else if (e.key === "ArrowUp") {
        setSelectedCell((cur) => ({ ...cur, r: Math.max(0, cur.r - 1) }));
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyInput(e.key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleRevealLetter = () => {
    const { r, c } = selectedCell;
    if (solutionGrid[r][c] === "#") return;
    const correctChar = solutionGrid[r][c];
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = correctChar;
      return next;
    });
    setCheckedCells((prev) => new Set(prev).add(`${r},${c}`));
    arcadeAudio.playClick(600);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const shareCard = useMemo(() => {
    return generateShareCard({
      gameSlug: "kurukkezhuthu",
      titleEn: "Kurukkezhuthu",
      puzzleNumber: puzzleNum,
      timeFormatted: formatTimer(timer),
      movesOrGuesses: "5×5 Mini Crossword Solved",
    });
  }, [puzzleNum, timer]);

  return (
    <GameShell
      gameSlug="kurukkezhuthu"
      titleEn="Kurukkezhuthu"
      titleTa="குறுக்கெழுத்து"
      subtitleEn="5×5 Cultural Mini Crossword"
      puzzleNumber={puzzleNum}
      dateStr={dailyDate}
      isPracticeMode={isPractice}
      onTogglePractice={() => {
        setIsPractice((p) => !p);
        setPracticeIndex((i) => i + 1);
      }}
      elapsedSeconds={timer}
      rules={[
        "Fill the 5×5 grid with words matching Across and Down clues.",
        "Click a cell to select it; click again to toggle Across/Down direction.",
        "Type letters to auto-advance to the next cell.",
        "Black squares (#) are dividers and cannot be typed into.",
      ]}
      tips={[
        "Use the active clue banner at the top to guide your entries.",
        "Words are in English/Tanglish with bilingual English & Tamil clues.",
      ]}
      culturalNote="Kurukkezhuthu (குறுக்கெழுத்து) adapts the classic daily newspaper crossword tradition, celebrating Tamil cinema, cuisine, and collegiate campus culture."
      isComplete={isWon}
      gameStatus={isWon ? "won" : "in_progress"}
      shareCardText={shareCard}
      culturalTrivia={`Crossword completed in ${formatTimer(timer)}! Theme: ${puzzle.title}`}
      onPlayAgainPractice={() => {
        setIsPractice(true);
        setPracticeIndex((i) => i + 1);
      }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Active Clue Header Banner */}
        {activeClue && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-[#25173B] border border-[rgba(166,240,207,0.4)] text-center shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6F0CF] font-bold block mb-0.5">
              {direction.toUpperCase()} · CLUE {activeClue.num}
            </span>
            <p className="text-sm font-serif font-medium text-[#F4F0FA]">
              {activeClue.clueEn}
            </p>
            <p
              lang="ta"
              className="text-xs text-[#E5B869] mt-0.5"
              style={{ letterSpacing: 0 }}
            >
              {activeClue.clueTa}
            </p>
          </div>
        )}

        {/* 5x5 Crossword Grid */}
        <div className="w-64 h-64 sm:w-72 sm:h-72 p-2 rounded-2xl bg-[#140C20] border-2 border-[rgba(125,96,166,0.5)] shadow-2xl grid grid-cols-5 grid-rows-5 gap-1.5 select-none mb-4">
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isBlock = solutionGrid[r][c] === "#";
              const isSelected = selectedCell.r === r && selectedCell.c === c;
              const clueNum = clueNumbers.get(`${r},${c}`);

              // Highlight if in active clue word
              let isInActiveClue = false;
              if (activeClue && !isBlock) {
                if (direction === "across") {
                  isInActiveClue =
                    activeClue.row === r &&
                    c >= activeClue.col &&
                    c < activeClue.col + activeClue.answer.length;
                } else {
                  isInActiveClue =
                    activeClue.col === c &&
                    r >= activeClue.row &&
                    r < activeClue.row + activeClue.answer.length;
                }
              }

              if (isBlock) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className="rounded-lg bg-[#0E0817] border border-[rgba(125,96,166,0.15)]"
                  />
                );
              }

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative flex items-center justify-center rounded-lg font-mono font-bold text-lg sm:text-xl cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#A6F0CF] text-[#140C20] shadow-[0_0_12px_rgba(166,240,207,0.5)]"
                      : isInActiveClue
                      ? "bg-[#2D1B47] text-[#F4F0FA] border border-[rgba(166,240,207,0.3)]"
                      : "bg-[#1E142E] text-[#F4F0FA] border border-[rgba(125,96,166,0.3)] hover:bg-[#25173B]"
                  }`}
                >
                  {/* Clue Number In Corner */}
                  {clueNum && (
                    <span
                      className={`absolute top-0.5 left-1 text-[9px] font-mono leading-none ${
                        isSelected ? "text-[#140C20]" : "text-[#C4B7D7]"
                      }`}
                    >
                      {clueNum}
                    </span>
                  )}
                  {cell}
                </div>
              );
            })
          )}
        </div>

        {/* Toolbar: Toggle Direction, Reveal Letter */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() =>
              setDirection((d) => (d === "across" ? "down" : "across"))
            }
            className="px-3.5 py-2 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] text-xs font-mono uppercase text-[#A6F0CF] hover:bg-[#342052] transition-colors"
          >
            Direction: {direction.toUpperCase()}
          </button>
          <button
            onClick={handleRevealLetter}
            className="px-3.5 py-2 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] text-xs font-mono uppercase text-[#C4B7D7] hover:text-[#F4F0FA] hover:bg-[#342052] flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Reveal Letter
          </button>
        </div>

        {/* Clues Summary List */}
        <div className="w-full grid grid-cols-2 gap-3 text-xs">
          {/* Across Clues */}
          <div className="p-3 rounded-xl bg-[#1B112B] border border-[rgba(125,96,166,0.3)]">
            <span className="font-mono uppercase text-[#A6F0CF] font-bold block mb-1.5 text-[10px]">
              ACROSS
            </span>
            <div className="space-y-1.5">
              {puzzle.across.map((c) => (
                <div key={c.num} className="leading-tight">
                  <span className="font-mono text-[#E5B869] mr-1">{c.num}.</span>
                  <span className="text-[#F4F0FA]">{c.clueEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Down Clues */}
          <div className="p-3 rounded-xl bg-[#1B112B] border border-[rgba(125,96,166,0.3)]">
            <span className="font-mono uppercase text-[#A6F0CF] font-bold block mb-1.5 text-[10px]">
              DOWN
            </span>
            <div className="space-y-1.5">
              {puzzle.down.map((c) => (
                <div key={c.num} className="leading-tight">
                  <span className="font-mono text-[#E5B869] mr-1">{c.num}.</span>
                  <span className="text-[#F4F0FA]">{c.clueEn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
