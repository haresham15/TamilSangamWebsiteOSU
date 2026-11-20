// src/components/games/shared/VirtualKeyboard.tsx
"use client";

import React from "react";
import { Delete, CornerDownLeft } from "lucide-react";
import { arcadeAudio } from "@/lib/games/audio";

export type KeyStatus = "unused" | "absent" | "present" | "correct";

interface VirtualKeyboardProps {
  onChar: (char: string) => void;
  onEnter: () => void;
  onDelete: () => void;
  // Standard letter status map (single board)
  letterStatuses?: Record<string, KeyStatus>;
  // Quordle multi-board 4-quadrant statuses
  multiStatuses?: Record<string, KeyStatus[]>; // e.g. 'A': ['correct', 'absent', 'unused', 'present']
  customRows?: string[][];
  disabled?: boolean;
}

const DEFAULT_QWERTY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

export function VirtualKeyboard({
  onChar,
  onEnter,
  onDelete,
  letterStatuses = {},
  multiStatuses,
  customRows = DEFAULT_QWERTY_ROWS,
  disabled = false,
}: VirtualKeyboardProps) {
  const handleKeyClick = (key: string) => {
    if (disabled) return;
    arcadeAudio.playClick(500);

    if (key === "ENTER") {
      onEnter();
    } else if (key === "BACKSPACE" || key === "DELETE") {
      onDelete();
    } else {
      onChar(key);
    }
  };

  const getSingleStatusBg = (status?: KeyStatus) => {
    switch (status) {
      case "correct":
        return "bg-[#10B981] text-[#0A0612] font-bold border-[#34D399]";
      case "present":
        return "bg-[#F59E0B] text-[#0A0612] font-bold border-[#FBBF24]";
      case "absent":
        return "bg-[#25173B]/50 text-[#C4B7D7]/40 border-transparent";
      default:
        return "bg-[#25173B] text-[#F4F0FA] border-[rgba(125,96,166,0.35)] hover:bg-[#342052] hover:border-[#A6F0CF]/50";
    }
  };

  const getQuadrantColor = (status?: KeyStatus) => {
    switch (status) {
      case "correct":
        return "#10B981"; // Emerald
      case "present":
        return "#F59E0B"; // Amber
      case "absent":
        return "#1F142E"; // Deep muted
      default:
        return "#2D1B47"; // Unused background
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-1.5 p-2 select-none">
      {customRows.map((row, rIdx) => (
        <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
          {row.map((key) => {
            const isWide = key === "ENTER" || key === "BACKSPACE" || key === "DELETE";
            const singleStatus = letterStatuses[key.toUpperCase()];
            const quadrants = multiStatuses ? multiStatuses[key.toUpperCase()] : null;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
                className={`relative flex items-center justify-center rounded-lg text-xs sm:text-sm font-mono transition-all border overflow-hidden ${
                  isWide
                    ? "px-2.5 sm:px-4 py-3 sm:py-3.5 bg-[#25173B] text-[#A6F0CF] font-semibold border-[rgba(125,96,166,0.4)]"
                    : "flex-1 max-w-[42px] h-11 sm:h-12"
                } ${!quadrants ? getSingleStatusBg(singleStatus) : "border-[rgba(125,96,166,0.35)] text-[#F4F0FA]"}`}
              >
                {/* 4-Quadrant background for Quordle */}
                {quadrants && quadrants.length === 4 && (
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-85">
                    <div style={{ backgroundColor: getQuadrantColor(quadrants[0]) }} />
                    <div style={{ backgroundColor: getQuadrantColor(quadrants[1]) }} />
                    <div style={{ backgroundColor: getQuadrantColor(quadrants[2]) }} />
                    <div style={{ backgroundColor: getQuadrantColor(quadrants[3]) }} />
                  </div>
                )}

                {/* Key Label */}
                <span className="relative z-10 font-bold drop-shadow-sm">
                  {key === "ENTER" ? (
                    <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                      ENTER <CornerDownLeft className="w-3 h-3" />
                    </span>
                  ) : key === "BACKSPACE" || key === "DELETE" ? (
                    <Delete className="w-4 h-4" />
                  ) : (
                    key
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
