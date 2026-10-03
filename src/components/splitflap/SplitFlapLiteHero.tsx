"use client";

import React, { useState, useEffect } from "react";
import { useFaqStore } from "@/store/faqStore";
import { Train, Clock } from "lucide-react";

interface SplitFlapLiteHeroProps {
  onSearchFocus?: () => void;
}

export function SplitFlapLiteHero({ onSearchFocus }: SplitFlapLiteHeroProps) {
  const activeFlapLabel = useFaqStore((s) => s.activeFlapLabel || "TAMIL SANGAM");
  const activeQuestion = useFaqStore((s) => s.activeQuestion);
  const [timeStr, setTimeStr] = useState<string>("18:45:00 EST");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " EST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const row1 = "வணக்கம்  ·  GUIDE & FAQ";
  const row2 = activeFlapLabel || "ASK ANYTHING. WE'RE LISTENING.";
  const row3 = "SOUTHERN RAILWAY · OSU TAMIL SANGAM";
  const row4 = `LOCAL TIME · ${timeStr}`;

  const renderRow = (text: string, cols = 36, isHighlighted = false) => {
    const chars = text.padEnd(cols, " ").slice(0, cols).split("");
    return (
      <div className="flex items-center justify-center gap-[2px] sm:gap-[3px]">
        {chars.map((ch, idx) => (
          <div
            key={idx}
            className={`relative w-4 h-6 sm:w-6 sm:h-9 bg-[#110d0a] border border-[#261d15] flex flex-col items-center justify-center font-mono text-[10px] sm:text-sm font-bold select-none overflow-hidden shadow-inner ${
              isHighlighted ? "text-[#f59e0b]" : "text-[#fbf7ee]"
            }`}
          >
            <span>{ch === " " ? "\u00A0" : ch}</span>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#070504] border-t border-[#070504] border-b border-[#2b2017]" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      role="region"
      aria-label="Mechanical Split-Flap Departure Board (Lite Mode)"
      className="relative w-full py-16 px-4 bg-[#070504] border-b border-[#261d15] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Ambient Tungsten Glow */}
      <div className="pointer-events-none absolute -top-12 inset-x-0 h-48 bg-gradient-to-b from-[#f59e0b]/15 via-[#f59e0b]/5 to-transparent blur-2xl" />

      {/* Hanging Lamp Props (SVG stylized) */}
      <div className="flex items-center justify-center gap-24 sm:gap-48 mb-4">
        {[-1, 1].map((dir, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-[2px] h-12 bg-[#261d15]" />
            <div className="w-10 h-5 bg-[#17110c] border border-[#3b2b1d] rounded-t-full relative shadow-[0_4px_16px_#f59e0b40]">
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#ffe082] rounded-full shadow-[0_0_12px_#ffb300]" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Board Casing */}
      <div className="relative max-w-4xl w-full p-4 sm:p-6 bg-[#0e0a08] border-2 border-[#3d2c18] shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(0,0,0,0.9)]">
        {/* Top Header Plate with Brass Trim */}
        <div className="mb-4 pb-3 border-b border-[#261d15] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase font-bold tracking-wider">
            <Train className="w-4 h-4" />
            <span>SOUTHERN RAILWAY · தெற்கு இரயில்வே</span>
            <span className="hidden sm:inline text-[#6e5d4d]">· PLATFORM 04</span>
          </div>

          {/* LED Indicators */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#22c55e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <span className="text-[10px] font-mono text-[#a89985] uppercase hidden sm:inline">
              LITE MODE ENGINE
            </span>
          </div>
        </div>

        {/* 4 Rows of Split-Flap Matrix */}
        <div className="space-y-2 sm:space-y-3 py-2 bg-[#080605] p-3 sm:p-4 border border-[#211812]">
          {renderRow(row1, 32)}
          {renderRow(row2, 32, true)}
          {renderRow(row3, 32)}
          {renderRow(row4, 32)}
        </div>

        {/* Bottom Station Status Bar */}
        <div className="mt-4 pt-3 border-t border-[#261d15] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#8f755a]">
          <div className="flex items-center gap-2">
            <span className="text-[#a89985]">TOPIC:</span>
            <span className="text-[#fbf7ee] font-bold truncate max-w-xs sm:max-w-md">
              {activeQuestion || "Overview & General Policies"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#f59e0b]">
              <Clock className="w-3 h-3" />
              {timeStr}
            </span>
            {onSearchFocus && (
              <button
                onClick={onSearchFocus}
                className="text-xs text-[#d4af37] hover:underline uppercase tracking-wider"
              >
                [ SEARCH FAQ ]
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
