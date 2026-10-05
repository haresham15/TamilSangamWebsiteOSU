"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGuideStore } from "@/components/guide-hero/store/guideStore";
import { Sparkles, ArrowUp, Search } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

interface SplitFlapMiniHeaderProps {
  onSearchFocus?: () => void;
}

const TOTAL_CELLS = 28;

/**
 * SplitFlapMiniHeader (PRD §8)
 * Sticky CSS mini-ticker attached under navigation.
 * Fades in only when hero is scrolled past 60%, showing active flapLabel as a one-row
 * flap strip (~28 cells flipped with CSS rotateX, same palette, <= 8 flips each).
 * Clicking it scrolls back to the hero.
 */
export function SplitFlapMiniHeader({ onSearchFocus }: SplitFlapMiniHeaderProps) {
  const activeFlapLabel = useGuideStore((s) => s.activeFlapLabel || "OSU TAMIL SANGAM");
  const isPastHero = useGuideStore((s) => s.isPastHero);
  const { playClick, playWoodClick } = useAudio();

  const prevLabelRef = useRef<string>(activeFlapLabel);
  const [displayChars, setDisplayChars] = useState<string[]>(() =>
    (activeFlapLabel || "OSU TAMIL SANGAM").padEnd(TOTAL_CELLS, " ").slice(0, TOTAL_CELLS).split("")
  );
  const [flippingIndices, setFlippingIndices] = useState<Set<number>>(new Set());

  // Cascading flip animation on label change (PRD §8: <= 8 flips each)
  useEffect(() => {
    const prev = prevLabelRef.current.padEnd(TOTAL_CELLS, " ").slice(0, TOTAL_CELLS);
    const next = (activeFlapLabel || "OSU TAMIL SANGAM").padEnd(TOTAL_CELLS, " ").slice(0, TOTAL_CELLS);
    prevLabelRef.current = activeFlapLabel;

    if (prev === next) return;

    // Detect which cells need flipping
    const changed = new Set<number>();
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (prev[i] !== next[i]) {
        changed.add(i);
      }
    }
    setFlippingIndices(changed);

    // After staggered flip sequence, settle target characters
    const timeout = setTimeout(() => {
      setDisplayChars(next.split(""));
      setFlippingIndices(new Set());
    }, 420);

    return () => clearTimeout(timeout);
  }, [activeFlapLabel]);

  const scrollToHero = () => {
    playWoodClick();
    const hero = document.getElementById("alaipayuthey-splitflap-hero");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openNanbaChat = () => {
    playClick();
    const btn = document.querySelector('button[aria-label*="Ask Nanba"]') as HTMLButtonElement | null;
    btn?.click();
  };

  return (
    <aside
      aria-label="Split-Flap Status and Navigation Controls"
      className={`fixed top-16 left-0 right-0 z-40 w-full bg-[#0c0907]/95 border-b border-[#2b2017] backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-300 ${
        isPastHero
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-3 pointer-events-none"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 text-xs font-mono">
        {/* Left: Mechanical Split-Flap Letter Tiles (~28 cells) */}
        <div
          onClick={scrollToHero}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer group"
          title="Scroll back to departure board"
        >
          {/* Status pip */}
          <span className="w-2 h-2 rounded-full bg-[#55CCA2] animate-pulse shrink-0 hidden sm:inline-block" />

          {/* Mechanical Split-Flap Letter Tiles */}
          <div className="flex items-center gap-[2px] sm:gap-[3px] p-1 bg-[#070504] border border-[#2b2017] shadow-inner group-hover:border-[#d4af37]/60 transition-colors">
            {displayChars.map((char, i) => {
              const isCellFlipping = flippingIndices.has(i);
              return (
                <div
                  key={i}
                  className={`relative w-3.5 h-6 sm:w-4 sm:h-7 bg-[#140f0b] border border-[#261d15] flex flex-col items-center justify-center text-[#fbf7ee] font-mono text-[10px] sm:text-xs font-bold select-none overflow-hidden ${
                    i >= 18 ? "hidden md:flex" : ""
                  } ${isCellFlipping ? "animate-pulse border-[#d4af37]/50" : ""}`}
                >
                  {/* Top Half */}
                  <span className="leading-none text-center">
                    {char === " " ? "\u00A0" : char}
                  </span>

                  {/* Hairline Split Slit */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#070504] border-t border-[#070504] border-b border-[#2b2017]" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onSearchFocus && (
            <button
              onClick={() => {
                playClick();
                onSearchFocus();
              }}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#17110c] hover:bg-[#231a12] border border-[#3b2b1d] hover:border-[#d4af37] text-[#ded4c5] hover:text-[#fbf7ee] text-[11px] transition-all"
            >
              <Search className="w-3 h-3 text-[#d4af37]" />
              <span>SEARCH</span>
            </button>
          )}

          <button
            onClick={openNanbaChat}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#091510] hover:bg-[#11271e] border border-[#1b3d2f] hover:border-[#55CCA2] text-[#55CCA2] text-[11px] font-bold tracking-wider uppercase transition-all"
          >
            <Sparkles className="w-3 h-3 text-[#55CCA2]" />
            <span className="hidden sm:inline">ASK</span> NANBA
          </button>

          <button
            onClick={scrollToHero}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1a140f] hover:bg-[#261d15] border border-[#3d2c18] hover:border-[#d4af37] text-[#d4af37] text-[11px] font-bold tracking-wider uppercase transition-all active:scale-[0.98]"
            title="Scroll to 3D Split-Flap Board"
          >
            <ArrowUp className="w-3 h-3 text-[#d4af37]" />
            <span>BOARD</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
export default SplitFlapMiniHeader;
