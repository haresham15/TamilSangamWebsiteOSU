"use client";

import React, { useState, useEffect } from "react";
import { useFaqStore } from "@/store/faqStore";
import { Sparkles, ArrowUp, Search } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

interface SplitFlapMiniHeaderProps {
  onSearchFocus?: () => void;
}

export function SplitFlapMiniHeader({ onSearchFocus }: SplitFlapMiniHeaderProps) {
  const activeFlapLabel = useFaqStore((s) => s.activeFlapLabel || "TAMIL SANGAM");
  const activeQuestion = useFaqStore((s) => s.activeQuestion);
  const { playClick, playWoodClick } = useAudio();

  const [displayChars, setDisplayChars] = useState<string[]>([]);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  // Update display characters with split-flap transition effect
  useEffect(() => {
    const target = (activeFlapLabel || "TAMIL SANGAM").padEnd(16, " ").slice(0, 16);
    setIsFlipping(true);
    const chars = target.split("");
    setDisplayChars(chars);

    const timeout = setTimeout(() => {
      setIsFlipping(false);
    }, 450);

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
      className="sticky top-16 z-40 w-full bg-[#0c0907]/95 border-y border-[#2b2017] backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 text-xs font-mono">
        {/* Left: Mechanical Split-Flap Letter Tiles */}
        <div className="flex items-center gap-2.5 shrink-0">

          {/* Mechanical Split-Flap Letter Tiles */}
          <div className="flex items-center gap-0.5 sm:gap-1 p-1 bg-[#070504] border border-[#2b2017] shadow-inner">
            {displayChars.map((char, i) => (
              <div
                key={i}
                className={`relative w-4 h-6 sm:w-5 sm:h-7 bg-[#140f0b] border border-[#261d15] flex flex-col items-center justify-center text-[#fbf7ee] font-mono text-[11px] sm:text-xs font-bold select-none overflow-hidden ${
                  isFlipping ? "animate-pulse" : ""
                }`}
                title={activeQuestion || activeFlapLabel}
              >
                {/* Top Half */}
                <span className="leading-none text-center">
                  {char === " " ? "\u00A0" : char}
                </span>

                {/* Hairline Divider Slit */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#070504] border-t border-[#070504] border-b border-[#2b2017]" />
              </div>
            ))}
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
