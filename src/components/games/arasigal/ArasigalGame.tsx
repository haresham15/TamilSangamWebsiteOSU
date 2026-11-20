// src/components/games/arasigal/ArasigalGame.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GameShell } from "../shared/GameShell";
import {
  getArasigalPuzzle,
  ARASIGAL_REGION_COLORS,
  type ArasigalPuzzle,
} from "@/data/games/arasigalData";
import { getDailyDateString, getPuzzleNumber } from "@/lib/games/seed";
import {
  getDailyGameRecord,
  updateDailyGameRecord,
} from "@/lib/games/storage";
import { generateShareCard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { Crown, X, RotateCcw } from "lucide-react";

type CellMark = "empty" | "cross" | "crown";

export function ArasigalGame() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const dailyDate = useMemo(() => getDailyDateString(), []);
  const puzzleNum = useMemo(() => getPuzzleNumber(dailyDate), [dailyDate]);

  const currentSeed = isPractice ? `practice-${practiceIndex}` : dailyDate;
  const puzzle: ArasigalPuzzle = useMemo(
    () => getArasigalPuzzle(currentSeed),
    [currentSeed]
  );

  const [board, setBoard] = useState<CellMark[][]>(() =>
    Array.from({ length: puzzle.gridSize }, () =>
      Array(puzzle.gridSize).fill("empty")
    )
  );

  const [isWon, setIsWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<CellMark | null>(null);

  // Initialize or load record
  useEffect(() => {
    if (!isPractice) {
      const rec = getDailyGameRecord("arasigal", dailyDate);
      if (rec.status === "won") {
        setIsWon(true);
        // Fill solution crowns
        const solvedBoard: CellMark[][] = Array.from(
          { length: puzzle.gridSize },
          () => Array(puzzle.gridSize).fill("empty")
        );
        for (const c of puzzle.solution) {
          solvedBoard[c.row][c.col] = "crown";
        }
        setBoard(solvedBoard);
        setTimer(rec.solveTimeSeconds || 65);
        return;
      }
    }

    setBoard(
      Array.from({ length: puzzle.gridSize }, () =>
        Array(puzzle.gridSize).fill("empty")
      )
    );
    setIsWon(false);
    setTimer(0);
    setTimerActive(true);
  }, [puzzle, isPractice, dailyDate]);

  // Timer loop
  useEffect(() => {
    if (!timerActive || isWon) return;
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, isWon]);

  // Find all crown coordinates
  const placedCrowns = useMemo(() => {
    const crowns: Array<{ row: number; col: number; region: number }> = [];
    for (let r = 0; r < puzzle.gridSize; r++) {
      for (let c = 0; c < puzzle.gridSize; c++) {
        if (board[r]?.[c] === "crown") {
          crowns.push({ row: r, col: c, region: puzzle.regions[r][c] });
        }
      }
    }
    return crowns;
  }, [board, puzzle]);

  // Conflict set: coordinates of crowns violating rules
  const conflictCoordinates = useMemo(() => {
    const conflicts = new Set<string>();

    for (let i = 0; i < placedCrowns.length; i++) {
      for (let j = i + 1; j < placedCrowns.length; j++) {
        const c1 = placedCrowns[i];
        const c2 = placedCrowns[j];

        const sameRow = c1.row === c2.row;
        const sameCol = c1.col === c2.col;
        const sameRegion = c1.region === c2.region;
        const adjacent =
          Math.abs(c1.row - c2.row) <= 1 && Math.abs(c1.col - c2.col) <= 1;

        if (sameRow || sameCol || sameRegion || adjacent) {
          conflicts.add(`${c1.row},${c1.col}`);
          conflicts.add(`${c2.row},${c2.col}`);
        }
      }
    }
    return conflicts;
  }, [placedCrowns]);

  // Validate win condition
  const checkWinCondition = useCallback(
    (crowns: Array<{ row: number; col: number; region: number }>) => {
      if (crowns.length !== puzzle.gridSize) return false;
      if (conflictCoordinates.size > 0) return false;

      // Check rows, cols, and regions all have exactly 1 crown
      const rowCounts = new Set(crowns.map((c) => c.row));
      const colCounts = new Set(crowns.map((c) => c.col));
      const regionCounts = new Set(crowns.map((c) => c.region));

      return (
        rowCounts.size === puzzle.gridSize &&
        colCounts.size === puzzle.gridSize &&
        regionCounts.size === puzzle.gridSize
      );
    },
    [puzzle.gridSize, conflictCoordinates]
  );

  // Cell click handler
  const handleCellClick = (r: number, c: number) => {
    if (isWon) return;

    setBoard((prev) => {
      const next = prev.map((row) => [...row]);
      const current = next[r][c];

      if (current === "empty") {
        next[r][c] = "cross";
        arcadeAudio.playClick(440);
      } else if (current === "cross") {
        next[r][c] = "crown";
        arcadeAudio.playSuccessChime();
      } else {
        next[r][c] = "empty";
        arcadeAudio.playClick(320);
      }

      // Check win on next tick
      const nextCrowns: Array<{ row: number; col: number; region: number }> = [];
      for (let rowIdx = 0; rowIdx < puzzle.gridSize; rowIdx++) {
        for (let colIdx = 0; colIdx < puzzle.gridSize; colIdx++) {
          if (next[rowIdx][colIdx] === "crown") {
            nextCrowns.push({
              row: rowIdx,
              col: colIdx,
              region: puzzle.regions[rowIdx][colIdx],
            });
          }
        }
      }

      if (checkWinCondition(nextCrowns)) {
        setIsWon(true);
        setTimerActive(false);
        arcadeAudio.playVictoryArpeggio();
        if (!isPractice) {
          updateDailyGameRecord(
            "arasigal",
            {
              status: "won",
              solveTimeSeconds: timer,
              moves: nextCrowns.length,
            },
            dailyDate
          );
        }
      }

      return next;
    });
  };

  const handlePointerDown = (r: number, c: number) => {
    if (isWon) return;
    setIsDragging(true);
    const curr = board[r][c];
    if (curr === "empty") {
      setDragAction("cross");
      handleCellClick(r, c);
    } else {
      setDragAction(null);
    }
  };

  const handlePointerEnter = (r: number, c: number) => {
    if (!isDragging || isWon || dragAction !== "cross") return;
    if (board[r][c] === "empty") {
      setBoard((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = "cross";
        return next;
      });
      arcadeAudio.playClick(420);
    }
  };

  const handleReset = () => {
    setBoard(
      Array.from({ length: puzzle.gridSize }, () =>
        Array(puzzle.gridSize).fill("empty")
      )
    );
    setIsWon(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const shareCard = useMemo(() => {
    return generateShareCard({
      gameSlug: "arasigal",
      titleEn: "Arasigal",
      puzzleNumber: puzzleNum,
      timeFormatted: formatTimer(timer),
      movesOrGuesses: `${placedCrowns.length}/${puzzle.gridSize} Chola Crowns placed`,
    });
  }, [puzzleNum, timer, placedCrowns.length, puzzle.gridSize]);

  return (
    <GameShell
      gameSlug="arasigal"
      titleEn="Arasigal"
      titleTa="அரசிகள்"
      subtitleEn="Chola Queens Logic Grid"
      puzzleNumber={puzzleNum}
      dateStr={dailyDate}
      isPracticeMode={isPractice}
      onTogglePractice={() => {
        setIsPractice((p) => !p);
        setPracticeIndex((i) => i + 1);
      }}
      elapsedSeconds={timer}
      movesOrScore={`${placedCrowns.length} / ${puzzle.gridSize} 👑`}
      rules={[
        "Place exactly one Chola Crown (👑) in every row, column, and colored region.",
        "No two crowns may touch each other—not even diagonally.",
        "Tap once to place an × (ruled out), tap twice for a Crown (👑), third tap clears.",
        "Drag across empty cells to fast-mark multiple ×s.",
      ]}
      tips={[
        "When you place a crown, immediately mark × on all 8 neighboring diagonal and adjacent cells.",
        "Look for tiny 1-cell or 2-cell regions first—they strictly limit where crowns can live.",
      ]}
      culturalNote="Arasigal (அரசிகள்) pays homage to the legendary Chola and Pandya queens—such as Kundavai Pirattiyar and Sembiyan Mahadevi—who governed territories, endowed vast temple complexes, and guided Tamil civilization."
      isComplete={isWon}
      gameStatus={isWon ? "won" : "in_progress"}
      shareCardText={shareCard}
      culturalTrivia={`All ${puzzle.gridSize} crowns placed in sovereign balance! Queen Kundavai was renowned for her political diplomacy, ensuring peace across the Chola empire.`}
      onPlayAgainPractice={() => {
        setIsPractice(true);
        setPracticeIndex((i) => i + 1);
      }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Status indicator */}
        <div className="w-full flex items-center justify-between mb-3 text-xs font-mono">
          <span className="text-[#C4B7D7]">
            Crowns:{" "}
            <span
              className={`font-bold ${
                placedCrowns.length === puzzle.gridSize
                  ? "text-[#10B981]"
                  : "text-[#E5B869]"
              }`}
            >
              {placedCrowns.length} / {puzzle.gridSize}
            </span>
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[#C4B7D7] hover:text-[#A6F0CF] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Board
          </button>
        </div>

        {/* Arasigal Board */}
        <div
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
          style={{ touchAction: "none" }}
          className="relative w-full aspect-square bg-[#140C20] rounded-2xl border-2 border-[rgba(125,96,166,0.5)] shadow-2xl p-1 select-none overflow-hidden"
        >
          <div
            className="w-full h-full grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${puzzle.gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${puzzle.gridSize}, 1fr)`,
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const regionId = puzzle.regions[r][c];
                const regionColor =
                  ARASIGAL_REGION_COLORS[regionId % ARASIGAL_REGION_COLORS.length];
                const isConflict = conflictCoordinates.has(`${r},${c}`);

                // Check borders with neighbors to show region boundary
                const topSame = r > 0 && puzzle.regions[r - 1][c] === regionId;
                const bottomSame =
                  r < puzzle.gridSize - 1 && puzzle.regions[r + 1][c] === regionId;
                const leftSame = c > 0 && puzzle.regions[r][c - 1] === regionId;
                const rightSame =
                  c < puzzle.gridSize - 1 && puzzle.regions[r][c + 1] === regionId;

                return (
                  <div
                    key={`${r}-${c}`}
                    onPointerDown={() => handlePointerDown(r, c)}
                    onPointerEnter={() => handlePointerEnter(r, c)}
                    style={{
                      backgroundColor: regionColor,
                      borderTop: topSame ? "1px solid rgba(255,255,255,0.06)" : "2px solid rgba(255,255,255,0.45)",
                      borderBottom: bottomSame ? "1px solid rgba(255,255,255,0.06)" : "2px solid rgba(255,255,255,0.45)",
                      borderLeft: leftSame ? "1px solid rgba(255,255,255,0.06)" : "2px solid rgba(255,255,255,0.45)",
                      borderRight: rightSame ? "1px solid rgba(255,255,255,0.06)" : "2px solid rgba(255,255,255,0.45)",
                    }}
                    className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                      isConflict ? "ring-2 ring-red-500 bg-red-950/70" : ""
                    }`}
                  >
                    {cell === "cross" && (
                      <X className="w-4 h-4 text-[#C4B7D7]/60 pointer-events-none" />
                    )}
                    {cell === "crown" && (
                      <div className="p-1 rounded-full bg-[#140C20]/60 shadow-md">
                        <Crown
                          className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform transform scale-110 ${
                            isConflict ? "text-red-400" : "text-[#E5B869]"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer instructions */}
        <p className="text-[11px] font-mono text-[#C4B7D7] mt-3 text-center">
          Tap once: <span className="text-[#C4B7D7]">×</span> · Tap twice:{" "}
          <span className="text-[#E5B869]">👑 Crown</span> · Drag to fast-mark ×
        </p>
      </div>
    </GameShell>
  );
}
