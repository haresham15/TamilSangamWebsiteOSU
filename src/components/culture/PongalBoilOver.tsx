"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useAudio } from "@/context/AudioContext";
import { useLocale } from "@/context/LocaleContext";
import { Flame, Wind, RotateCcw } from "lucide-react";

export const PongalBoilOver: React.FC = () => {
  const { playThump, playBell, playClick } = useAudio();
  const { locale } = useLocale();

  const [heat, setHeat] = useState<number>(30); // 0 - 100
  const [milkLevel, setMilkLevel] = useState<number>(20); // 0 - 100
  const [gameState, setGameState] = useState<"idle" | "heating" | "boiled" | "scorched">("idle");
  const [celebrationMessage, setCelebrationMessage] = useState<string>("");

  useEffect(() => {
    if (gameState !== "heating") return;

    const interval = setInterval(() => {
      setMilkLevel((prev) => {
        // Milk rises faster as heat increases
        const delta = (heat - 40) * 0.12;
        const next = Math.max(10, prev + delta);

        if (next >= 92 && next <= 100) {
          // PERFECT BOIL-OVER!
          setGameState("boiled");
          setCelebrationMessage(locale === "ta" ? "பொங்கலோ பொங்கல்!" : "Pongalo Pongal! Harvest Prosperity!");
          playBell(880);
          playThump(65);

          // Confetti celebration
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#f2b705", "#d6452f", "#0b7a75", "#ffffff"],
          });
          return 100;
        } else if (next > 105) {
          // Scorched / over-boiled
          setGameState("scorched");
          setCelebrationMessage(locale === "ta" ? "அய்யோ, பால் வழிந்து வீணாகிவிட்டது!" : "Oops! The milk scorched! Try again!");
          return 105;
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, heat, locale, playBell, playThump]);

  const handleStart = () => {
    playClick();
    setHeat(50);
    setMilkLevel(25);
    setGameState("heating");
    setCelebrationMessage("");
  };

  const handleStokeFire = () => {
    playClick();
    setHeat((prev) => Math.min(100, prev + 15));
  };

  const handleFanFlames = () => {
    playClick();
    setHeat((prev) => Math.max(10, prev - 15));
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-[var(--border-strong)] text-left shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {locale === "ta" ? "பொங்கலோ பொங்கல்! விளையாட்டு" : "Pongal Boil-Over Game"}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {locale === "ta"
              ? "நெருப்பின் வெப்பத்தை கட்டுப்படுத்தி பாலை சரியான நேரத்தில் பொங்க வையுங்கள்!"
              : "Control the earthen stove flame so the harvest milk boils over at the perfect climax!"}
          </p>
        </div>

        <button
          onClick={handleStart}
          className="p-2.5 rounded-xl glass-panel border border-white/10 text-slate-300 hover:text-white"
          title="Restart Game"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Clay Pot Visual Representation */}
      <div className="relative w-full h-64 bg-gradient-to-b from-[#090b14] to-[#140e10] rounded-3xl border border-white/10 flex flex-col items-center justify-end pb-8 mb-6 overflow-hidden">
        {/* Steam / Bubbles Visual */}
        {gameState === "heating" && (
          <div className="absolute top-12 flex gap-4 animate-bounce opacity-70">
            <span className="w-3 h-3 rounded-full bg-white/60 blur-xs" />
            <span className="w-4 h-4 rounded-full bg-white/70 blur-xs" />
            <span className="w-2 h-2 rounded-full bg-white/50 blur-xs" />
          </div>
        )}

        {/* Earthen Pongal Pot (Paanai) SVG */}
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
            {/* Clay pot body */}
            <path
              d="M 50 80 Q 20 120 50 170 Q 100 190 150 170 Q 180 120 150 80 Q 130 70 100 70 Q 70 70 50 80 Z"
              fill="#b5573a"
              stroke="#8c3820"
              strokeWidth="4"
            />
            {/* Turmeric neck string (Manjal kothu) */}
            <path d="M 45 80 Q 100 85 155 80" stroke="#f2b705" strokeWidth="6" fill="none" />

            {/* Rising sweet milk fill */}
            <mask id="potMask">
              <path
                d="M 50 80 Q 20 120 50 170 Q 100 190 150 170 Q 180 120 150 80 Q 130 70 100 70 Q 70 70 50 80 Z"
                fill="white"
              />
            </mask>
            <rect
              x="0"
              y={180 - (milkLevel / 100) * 110}
              width="200"
              height="150"
              fill="#fffaf0"
              mask="url(#potMask)"
              className="transition-all duration-150"
            />
          </svg>
        </div>

        {/* Flames beneath the pot */}
        <div className="flex items-center gap-2 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Flame
              key={i}
              className={`w-6 h-6 transition-all duration-200 ${
                heat > 60
                  ? "text-orange-500 scale-125 animate-pulse"
                  : heat > 30
                  ? "text-amber-400 scale-100"
                  : "text-amber-200 opacity-40 scale-75"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Celebration Status Message */}
      {celebrationMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/40 text-center animate-fadeIn">
          <p className="text-xl font-bold font-serif text-white tracking-wide">
            {celebrationMessage}
          </p>
        </div>
      )}

      {/* Controls: Stoke Fire / Fan Flames */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleStokeFire}
          disabled={gameState !== "heating"}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-lg disabled:opacity-40"
        >
          <Flame className="w-4 h-4" />
          <span>Stoke Flame (+ Heat)</span>
        </button>

        <button
          onClick={handleFanFlames}
          disabled={gameState !== "heating"}
          className="p-3.5 rounded-2xl glass-panel border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all shadow-lg disabled:opacity-40"
        >
          <Wind className="w-4 h-4 text-sky-400" />
          <span>Fan Flames (- Heat)</span>
        </button>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-slate-400">
        <div>
          <div className="flex justify-between mb-1">
            <span>Stove Heat</span>
            <span>{Math.round(heat)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${heat}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Milk Level</span>
            <span>{Math.round(milkLevel)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, milkLevel)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
