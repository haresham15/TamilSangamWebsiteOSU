// src/components/games/irattaichinnam/TangoGame.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GameShell } from "../shared/GameShell";
import {
  getTangoPuzzle,
  type TangoPuzzle,
  type SymbolType,
} from "@/data/games/tangoData";
import { getDailyDateString, getPuzzleNumber } from "@/lib/games/seed";
import {
  getDailyGameRecord,
  updateDailyGameRecord,
} from "@/lib/games/storage";
import { generateShareCard } from "@/lib/games/share";
import { arcadeAudio } from "@/lib/games/audio";
import { Sun, Moon, RotateCcw } from "lucide-react";

type CellVal = SymbolType | null;

export function TangoGame() {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const dailyDate = useMemo(() => getDailyDateString(), []);
  const puzzleNum = useMemo(() => getPuzzleNumber(dailyDate), [dailyDate]);

  const currentSeed = isPractice ? `practice-${practiceIndex}` : dailyDate;
  const puzzle: TangoPuzzle = useMemo(
    () => getTangoPuzzle(currentSeed),
    [currentSeed]
  );

  const [board, setBoard] = useState<CellVal[][]>(() =>
    Array.from({ length: 6 }, () => Array(6).fill(null))
  );

  const [isWon, setIsWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Set of given cells (immutable)
  const givenKeys = useMemo(() => {
    const set = new Set<string>();
    for (const g of puzzle.givens) {
      set.add(`${g.r},${g.c}`);
    }
    return set;
  }, [puzzle]);

  // Initialize board with givens or load saved record
  useEffect(() => {
    if (!isPractice) {
      const rec = getDailyGameRecord("irattaichinnam", dailyDate);
      if (rec.status === "won") {
        setIsWon(true);
        setBoard(puzzle.solution);
        setTimer(rec.solveTimeSeconds || 72);
        return;
      }
    }

    const initialBoard: CellVal[][] = Array.from({ length: 6 }, () =>
      Array(6).fill(null)
    );
    for (const g of puzzle.givens) {
      initialBoard[g.r][g.c] = g.val;
    }
    setBoard(initialBoard);
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

  // Row and Column counts
  const counts = useMemo(() => {
    const rowCounts = Array.from({ length: 6 }, () => ({ s: 0, m: 0 }));
    const colCounts = Array.from({ length: 6 }, () => ({ s: 0, m: 0 }));

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const val = board[r][c];
        if (val === "S") {
          rowCounts[r].s += 1;
          colCounts[c].s += 1;
        } else if (val === "M") {
          rowCounts[r].m += 1;
          colCounts[c].m += 1;
        }
      }
    }
    return { rowCounts, colCounts };
  }, [board]);

  // Detect 3 consecutive identical symbols in rows or columns
  const threeInARowViolations = useMemo(() => {
    const violations = new Set<string>();

    // Horizontal check
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const v1 = board[r][c];
        const v2 = board[r][c + 1];
        const v3 = board[r][c + 2];
        if (v1 && v1 === v2 && v2 === v3) {
          violations.add(`${r},${c}`);
          violations.add(`${r},${c + 1}`);
          violations.add(`${r},${c + 2}`);
        }
      }
    }

    // Vertical check
    for (let c = 0; c < 6; c++) {
      for (let r = 0; r < 4; r++) {
        const v1 = board[r][c];
        const v2 = board[r + 1][c];
        const v3 = board[r + 2][c];
        if (v1 && v1 === v2 && v2 === v3) {
          violations.add(`${r},${c}`);
          violations.add(`${r + 1},${c}`);
          violations.add(`${r + 2},${c}`);
        }
      }
    }

    return violations;
  }, [board]);

  // Check constraint violations
  const constraintViolations = useMemo(() => {
    const violations = new Set<string>();

    for (const hc of puzzle.horizontalConstraints) {
      const v1 = board[hc.r][hc.c];
      const v2 = board[hc.r][hc.c + 1];
      if (v1 && v2) {
        if (hc.type === "=" && v1 !== v2) {
          violations.add(`h-${hc.r}-${hc.c}`);
        }
        if (hc.type === "x" && v1 === v2) {
          violations.add(`h-${hc.r}-${hc.c}`);
        }
      }
    }

    for (const vc of puzzle.verticalConstraints) {
      const v1 = board[vc.r][vc.c];
      const v2 = board[vc.r + 1][vc.c];
      if (v1 && v2) {
        if (vc.type === "=" && v1 !== v2) {
          violations.add(`v-${vc.r}-${vc.c}`);
        }
        if (vc.type === "x" && v1 === v2) {
          violations.add(`v-${vc.r}-${vc.c}`);
        }
      }
    }

    return violations;
  }, [board, puzzle]);

  // Check win condition directly on candidate board
  const checkWin = useCallback(
    (currentBoard: CellVal[][]) => {
      // 1. Must be completely filled
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (!currentBoard[r][c]) return false;
        }
      }

      // 2. No 3 in a row horizontally
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
          const v1 = currentBoard[r][c];
          const v2 = currentBoard[r][c + 1];
          const v3 = currentBoard[r][c + 2];
          if (v1 && v1 === v2 && v2 === v3) return false;
        }
      }

      // 3. No 3 in a row vertically
      for (let c = 0; c < 6; c++) {
        for (let r = 0; r < 4; r++) {
          const v1 = currentBoard[r][c];
          const v2 = currentBoard[r + 1][c];
          const v3 = currentBoard[r + 2][c];
          if (v1 && v1 === v2 && v2 === v3) return false;
        }
      }

      // 4. Equal 3S and 3M in every row and col
      for (let i = 0; i < 6; i++) {
        let rS = 0;
        let rM = 0;
        let cS = 0;
        let cM = 0;
        for (let j = 0; j < 6; j++) {
          if (currentBoard[i][j] === "S") rS++;
          if (currentBoard[i][j] === "M") rM++;
          if (currentBoard[j][i] === "S") cS++;
          if (currentBoard[j][i] === "M") cM++;
        }
        if (rS !== 3 || rM !== 3 || cS !== 3 || cM !== 3) return false;
      }

      // 5. Constraints
      for (const hc of puzzle.horizontalConstraints) {
        const v1 = currentBoard[hc.r][hc.c];
        const v2 = currentBoard[hc.r][hc.c + 1];
        if (v1 && v2) {
          if (hc.type === "=" && v1 !== v2) return false;
          if (hc.type === "x" && v1 === v2) return false;
        }
      }

      for (const vc of puzzle.verticalConstraints) {
        const v1 = currentBoard[vc.r][vc.c];
        const v2 = currentBoard[vc.r + 1][vc.c];
        if (v1 && v2) {
          if (vc.type === "=" && v1 !== v2) return false;
          if (vc.type === "x" && v1 === v2) return false;
        }
      }

      return true;
    },
    [puzzle]
  );

  const handleCellClick = (r: number, c: number) => {
    if (isWon || givenKeys.has(`${r},${c}`)) return;

    setBoard((prev) => {
      const next = prev.map((row) => [...row]);
      const curr = next[r][c];

      if (!curr) {
        next[r][c] = "S";
        arcadeAudio.playClick(520);
      } else if (curr === "S") {
        next[r][c] = "M";
        arcadeAudio.playClick(400);
      } else {
        next[r][c] = null;
        arcadeAudio.playClick(300);
      }

      if (checkWin(next)) {
        setIsWon(true);
        setTimerActive(false);
        arcadeAudio.playVictoryArpeggio();
        if (!isPractice) {
          updateDailyGameRecord(
            "irattaichinnam",
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
  };

  const handleReset = () => {
    const initialBoard: CellVal[][] = Array.from({ length: 6 }, () =>
      Array(6).fill(null)
    );
    for (const g of puzzle.givens) {
      initialBoard[g.r][g.c] = g.val;
    }
    setBoard(initialBoard);
    setIsWon(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const shareCard = useMemo(() => {
    return generateShareCard({
      gameSlug: "irattaichinnam",
      titleEn: "Irattaichinnam",
      puzzleNumber: puzzleNum,
      timeFormatted: formatTimer(timer),
      movesOrGuesses: "Surya & Chandra Harmony · 6×6",
    });
  }, [puzzleNum, timer]);

  return (
    <GameShell
      gameSlug="irattaichinnam"
      titleEn="Irattaichinnam"
      titleTa="இரட்டைச் சின்னம்"
      subtitleEn="Surya & Chandra Balance"
      puzzleNumber={puzzleNum}
      dateStr={dailyDate}
      isPracticeMode={isPractice}
      onTogglePractice={() => {
        setIsPractice((p) => !p);
        setPracticeIndex((i) => i + 1);
      }}
      elapsedSeconds={timer}
      rules={[
        "Fill every cell with either Surya (☀ Sun) or Chandra (☾ Moon).",
        "Every row and column must have exactly 3 Suns and 3 Moons.",
        "Never place more than 2 identical symbols consecutively (no 3-in-a-row).",
        "Cells separated by '=' must match; cells separated by '×' must be opposite.",
      ]}
      tips={[
        "If a row already has 3 Suns, all remaining empty cells in that row must be Moons!",
        "Whenever two identical symbols are adjacent (e.g. ☀ ☀), the cells on both ends must be opposite (☾ ☀ ☀ ☾).",
      ]}
      culturalNote="Surya (சூரியன்) and Chandra (சந்திரன்) embody the cosmic balance of warmth and coolness in Tamil philosophy, depicted together in temple sanctums and heritage kolam emblems."
      isComplete={isWon}
      gameStatus={isWon ? "won" : "in_progress"}
      shareCardText={shareCard}
      culturalTrivia="Perfect harmony restored! Surya represents energy and intellect, while Chandra represents tranquility and grace."
      onPlayAgainPractice={() => {
        setIsPractice(true);
        setPracticeIndex((i) => i + 1);
      }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Controls */}
        <div className="w-full flex items-center justify-between mb-3 text-xs font-mono">
          <span className="text-[#C4B7D7]">
            Symbols: <span className="text-[#E5B869]">☀ 3</span> /{" "}
            <span className="text-[#7DD3FC]">☾ 3</span> per row & col
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[#C4B7D7] hover:text-[#A6F0CF] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {/* 6x6 Grid Container */}
        <div className="relative w-full aspect-square bg-[#1A1228] rounded-2xl border-2 border-[rgba(125,96,166,0.5)] shadow-2xl p-2 select-none">
          <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-1.5">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isGiven = givenKeys.has(`${r},${c}`);
                const isViolated = threeInARowViolations.has(`${r},${c}`);

                // Check constraints touching this cell
                const hRight = puzzle.horizontalConstraints.find(
                  (hc) => hc.r === r && hc.c === c
                );
                const vBottom = puzzle.verticalConstraints.find(
                  (vc) => vc.r === r && vc.c === c
                );

                const hViolated = hRight && constraintViolations.has(`h-${r}-${c}`);
                const vViolated = vBottom && constraintViolations.has(`v-${r}-${c}`);

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`relative flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      isGiven
                        ? "bg-[#25173B] border border-[rgba(125,96,166,0.3)] cursor-default"
                        : "bg-[#201533] border border-[rgba(125,96,166,0.4)] hover:border-[#A6F0CF]/50"
                    } ${isViolated ? "ring-2 ring-red-500 bg-red-950/40" : ""}`}
                  >
                    {cell === "S" && (
                      <Sun className="w-6 h-6 sm:w-7 sm:h-7 text-[#E5B869] drop-shadow-[0_0_8px_rgba(229,184,105,0.6)]" />
                    )}
                    {cell === "M" && (
                      <Moon className="w-6 h-6 sm:w-7 sm:h-7 text-[#7DD3FC] drop-shadow-[0_0_8px_rgba(125,211,252,0.6)]" />
                    )}

                    {/* Horizontal constraint badge on right edge */}
                    {hRight && (
                      <div
                        className={`absolute right-[-10px] top-1/2 -translate-y-1/2 z-20 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border ${
                          hViolated
                            ? "bg-red-600 text-white border-red-400"
                            : "bg-[#140C20] text-[#A6F0CF] border-[rgba(166,240,207,0.4)]"
                        }`}
                      >
                        {hRight.type}
                      </div>
                    )}

                    {/* Vertical constraint badge on bottom edge */}
                    {vBottom && (
                      <div
                        className={`absolute bottom-[-10px] left-1/2 -translate-x-1/2 z-20 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border ${
                          vViolated
                            ? "bg-red-600 text-white border-red-400"
                            : "bg-[#140C20] text-[#A6F0CF] border-[rgba(166,240,207,0.4)]"
                        }`}
                      >
                        {vBottom.type}
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
          Tap: <span className="text-[#E5B869]">☀ Surya</span> →{" "}
          <span className="text-[#7DD3FC]">☾ Chandra</span> → Clear · Constraint{" "}
          <span className="text-[#A6F0CF] font-bold">=</span> match,{" "}
          <span className="text-[#A6F0CF] font-bold">×</span> opposite
        </p>
      </div>
    </GameShell>
  );
}
