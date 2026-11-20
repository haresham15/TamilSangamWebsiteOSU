// src/components/games/kolam-path/KolamPathGame.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { GameShell } from "../shared/GameShell";
import { generateKolamPuzzle, type KolamPuzzle } from "@/lib/games/generators/kolamGenerator";
import { getDailyDateString, getPuzzleNumber } from "@/lib/games/seed";
import {
  getDailyGameRecord,
  updateDailyGameRecord,
} from "@/lib/games/storage";
import { generateShareCard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { RotateCcw, Sparkles } from "lucide-react";

export function KolamPathGame() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const dailyDate = useMemo(() => getDailyDateString(), []);
  const puzzleNum = useMemo(() => getPuzzleNumber(dailyDate), [dailyDate]);

  // Determine grid size: 6x6 Mon-Thu, 7x7 Fri-Sun
  const dayOfWeek = useMemo(() => new Date().getDay(), []);
  const gridSize = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6 ? 7 : 6;

  const currentSeed = isPractice ? `practice-${practiceIndex}` : dailyDate;
  const puzzle = useMemo<KolamPuzzle>(() => {
    return generateKolamPuzzle(currentSeed, gridSize);
  }, [currentSeed, gridSize]);

  // Player's current active path of cell coordinates
  const [playerPath, setPlayerPath] = useState<Array<{ row: number; col: number }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Initialize or load saved state
  useEffect(() => {
    if (!isPractice) {
      const rec = getDailyGameRecord("kolam-path", dailyDate);
      if (rec.status === "won") {
        setIsWon(true);
        setPlayerPath(puzzle.solutionPath);
        setTimer(rec.solveTimeSeconds || 42);
        return;
      }
    }
    // Start at checkpoint 1
    const startCp = puzzle.checkpoints.find((c) => c.number === 1) || {
      row: puzzle.solutionPath[0].row,
      col: puzzle.solutionPath[0].col,
    };
    setPlayerPath([{ row: startCp.row, col: startCp.col }]);
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

  // Check if cell is in player path
  const getPathIndex = useCallback(
    (r: number, c: number) => {
      return playerPath.findIndex((p) => p.row === r && p.col === c);
    },
    [playerPath]
  );

  // Checkpoint map
  const checkpointMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const cp of puzzle.checkpoints) {
      map.set(`${cp.row},${cp.col}`, cp.number);
    }
    return map;
  }, [puzzle]);

  // Check if next cell is valid according to checkpoint sequence
  const isValidNextStep = useCallback(
    (nr: number, nc: number) => {
      const last = playerPath[playerPath.length - 1];
      if (!last) return false;

      // Must be adjacent (orthogonal)
      const dr = Math.abs(nr - last.row);
      const dc = Math.abs(nc - last.col);
      if (dr + dc !== 1) return false;

      // Must not already be visited
      if (getPathIndex(nr, nc) !== -1) return false;

      // If it is a checkpoint, verify it is the expected next checkpoint
      const cpNum = checkpointMap.get(`${nr},${nc}`);
      if (cpNum !== undefined) {
        // Find highest checkpoint reached so far
        let lastCpReached = 1;
        for (const p of playerPath) {
          const num = checkpointMap.get(`${p.row},${p.col}`);
          if (num !== undefined && num > lastCpReached) {
            lastCpReached = num;
          }
        }
        if (cpNum !== lastCpReached + 1) {
          return false; // Out of sequence checkpoint!
        }
      }

      return true;
    },
    [playerPath, checkpointMap, getPathIndex]
  );

  // Try move to cell
  const handleCellEnter = useCallback(
    (r: number, c: number) => {
      if (isWon) return;

      const existingIndex = getPathIndex(r, c);
      // If moving to previous cell, undo/snap back
      if (existingIndex !== -1) {
        if (existingIndex === playerPath.length - 2) {
          arcadeAudio.playChalkHum(playerPath.length);
          setPlayerPath((prev) => prev.slice(0, prev.length - 1));
        }
        return;
      }

      if (isValidNextStep(r, c)) {
        const nextPath = [...playerPath, { row: r, col: c }];
        arcadeAudio.playChalkHum(nextPath.length);
        setPlayerPath(nextPath);

        // Check victory: all cells visited!
        if (nextPath.length === puzzle.totalCells) {
          setIsWon(true);
          setTimerActive(false);
          arcadeAudio.playVictoryArpeggio();
          if (!isPractice) {
            updateDailyGameRecord(
              "kolam-path",
              {
                status: "won",
                solveTimeSeconds: timer,
                moves: nextPath.length,
              },
              dailyDate
            );
          }
        }
      }
    },
    [
      isWon,
      getPathIndex,
      playerPath,
      isValidNextStep,
      puzzle.totalCells,
      timer,
      isPractice,
      dailyDate,
    ]
  );

  // Touch and pointer tracking
  const handlePointerDown = (r: number, c: number) => {
    if (isWon) return;
    const existingIndex = getPathIndex(r, c);
    if (existingIndex !== -1) {
      // Snap back to this cell
      setPlayerPath((prev) => prev.slice(0, existingIndex + 1));
      arcadeAudio.playClick(440);
    }
    setIsDragging(true);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isWon || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellWidth = rect.width / puzzle.gridSize;
    const cellHeight = rect.height / puzzle.gridSize;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (row >= 0 && row < puzzle.gridSize && col >= 0 && col < puzzle.gridSize) {
      handleCellEnter(row, col);
    }
  };

  const handleReset = () => {
    const startCp = puzzle.checkpoints.find((c) => c.number === 1) || {
      row: puzzle.solutionPath[0].row,
      col: puzzle.solutionPath[0].col,
    };
    setPlayerPath([{ row: startCp.row, col: startCp.col }]);
    setIsWon(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const shareCard = useMemo(() => {
    return generateShareCard({
      gameSlug: "kolam-path",
      titleEn: "Kolam Path",
      puzzleNumber: puzzleNum,
      timeFormatted: formatTimer(timer),
      movesOrGuesses: `Drawn in 1 unbroken stroke · ${puzzle.gridSize}×${puzzle.gridSize}`,
    });
  }, [puzzleNum, timer, puzzle.gridSize]);

  // Compute SVG polyline coordinates
  const polylinePoints = useMemo(() => {
    if (playerPath.length < 1) return "";
    return playerPath
      .map((p) => {
        const x = (p.col + 0.5) * (100 / puzzle.gridSize);
        const y = (p.row + 0.5) * (100 / puzzle.gridSize);
        return `${x},${y}`;
      })
      .join(" ");
  }, [playerPath, puzzle.gridSize]);

  return (
    <GameShell
      gameSlug="kolam-path"
      titleEn="Kolam Path"
      titleTa="கோலப் பாதை"
      subtitleEn="Pulli Kolam Chalk Grid"
      puzzleNumber={puzzleNum}
      dateStr={dailyDate}
      isPracticeMode={isPractice}
      onTogglePractice={() => {
        setIsPractice((p) => !p);
        setPracticeIndex((i) => i + 1);
      }}
      elapsedSeconds={timer}
      movesOrScore={`${playerPath.length} / ${puzzle.totalCells}`}
      rules={[
        "Trace a single unbroken rice-flour chalk line through the pulli (dot) grid.",
        "Start from checkpoint 1 and visit every single cell on the board exactly once.",
        "Numbered checkpoints must be visited in consecutive order (1 → 2 → 3...).",
        "Drag backward or tap an earlier cell to snap back and fix a turn.",
      ]}
      tips={[
        "Look ahead to the next checkpoint before committing to an edge.",
        "Never trap isolated empty corner cells—plan your outer perimeter loops early.",
      ]}
      culturalNote="Pulli Kolam (புள்ளி கோலம்) is an ancient Tamil mathematical art tradition where continuous loops are woven around a matrix of rice-flour dots to welcome prosperity and dawn into the home."
      isComplete={isWon}
      gameStatus={isWon ? "won" : "in_progress"}
      shareCardText={shareCard}
      culturalTrivia={`You connected all ${puzzle.totalCells} pulli in an unbroken sacred loop! In Tamil households, drawing a Kolam without lifting your hand symbolizes uninterrupted harmony.`}
      onPlayAgainPractice={() => {
        setIsPractice(true);
        setPracticeIndex((i) => i + 1);
      }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Progress pill */}
        <div className="w-full flex items-center justify-between mb-3 text-xs font-mono">
          <span className="text-[#C4B7D7]">
            Progress:{" "}
            <span className="text-[#A6F0CF] font-bold">
              {playerPath.length} / {puzzle.totalCells} dots
            </span>
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[#C4B7D7] hover:text-[#A6F0CF] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {/* Kolam Dot Grid Canvas */}
        <div
          ref={boardRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ touchAction: "none" }}
          className="relative w-full aspect-square bg-[#1B112B] rounded-2xl border-2 border-[rgba(166,240,207,0.35)] shadow-[0_10px_35px_rgba(0,0,0,0.5)] p-2 select-none overflow-hidden cursor-crosshair"
        >
          {/* Subtle Pulli Grid Background */}
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${puzzle.gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${puzzle.gridSize}, 1fr)`,
            }}
          >
            {Array.from({ length: puzzle.totalCells }).map((_, idx) => {
              const r = Math.floor(idx / puzzle.gridSize);
              const c = idx % puzzle.gridSize;
              const isVisited = getPathIndex(r, c) !== -1;
              const cpNum = checkpointMap.get(`${r},${c}`);

              return (
                <div
                  key={idx}
                  onPointerDown={() => handlePointerDown(r, c)}
                  className="relative flex items-center justify-center"
                >
                  {/* Pulli Dot */}
                  <div
                    className={`rounded-full transition-all duration-200 ${
                      isVisited
                        ? "w-3 h-3 bg-[#A6F0CF] shadow-[0_0_8px_#A6F0CF]"
                        : "w-2 h-2 bg-[#C4B7D7]/40"
                    }`}
                  />

                  {/* Checkpoint Badge */}
                  {cpNum !== undefined && (
                    <div
                      className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                        isVisited
                          ? "bg-[#10B981] text-[#0A0612] shadow-[0_0_12px_#34D399]"
                          : "bg-[#25173B] text-[#E5B869] border border-[#E5B869]/60"
                      }`}
                    >
                      {cpNum}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SVG Glow Chalk Polyline */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Outer subtle glow */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#A6F0CF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.25"
            />
            {/* Core chalk spline */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#F4F0FA"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={isWon ? "none" : "none"}
            />
          </svg>
        </div>

        {/* Footer Guidance */}
        <p className="text-[11px] font-mono text-[#C4B7D7] mt-3 text-center">
          Tap or drag across dots from 1 to connect the entire Pulli Kolam.
        </p>
      </div>
    </GameShell>
  );
}
