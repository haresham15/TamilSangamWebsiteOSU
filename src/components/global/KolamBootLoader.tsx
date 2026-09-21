"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";

interface KolamBootLoaderProps {
  onComplete?: () => void;
}

function subscribeSession(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSessionSnapshot() {
  try {
    return sessionStorage.getItem("sangam_boot_shown") === "true";
  } catch {
    return false;
  }
}

function getSessionServerSnapshot() {
  return false;
}

export const KolamBootLoader: React.FC<KolamBootLoaderProps> = ({ onComplete }) => {
  const { locale, t } = useLocale();
  const { playFlour, playBell } = useAudio();
  const alreadyShown = useSyncExternalStore(subscribeSession, getSessionSnapshot, getSessionServerSnapshot);
  const [progress, setProgress] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (alreadyShown) {
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 4;
        if (next % 20 === 0) {
          playFlour();
        }
        if (next >= 100) {
          clearInterval(interval);
          playBell(880);
          setTimeout(() => {
            sessionStorage.setItem("sangam_boot_shown", "true");
            setIsDismissed(true);
            if (onComplete) onComplete();
          }, 400);
          return 100;
        }
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [alreadyShown, onComplete, playBell, playFlour]);

  if (alreadyShown || isDismissed) return null;

  const handleSkip = () => {
    sessionStorage.setItem("sangam_boot_shown", "true");
    setIsDismissed(true);
    if (onComplete) onComplete();
  };

  if (isDismissed) return null;

  // 5x5 Pulli Kolam Dot coordinates
  const dots = [
    { x: 100, y: 100 }, { x: 150, y: 100 }, { x: 200, y: 100 }, { x: 250, y: 100 }, { x: 300, y: 100 },
    { x: 100, y: 150 }, { x: 150, y: 150 }, { x: 200, y: 150 }, { x: 250, y: 150 }, { x: 300, y: 150 },
    { x: 100, y: 200 }, { x: 150, y: 200 }, { x: 200, y: 200 }, { x: 250, y: 200 }, { x: 300, y: 200 },
    { x: 100, y: 250 }, { x: 150, y: 250 }, { x: 200, y: 250 }, { x: 250, y: 250 }, { x: 300, y: 250 },
    { x: 100, y: 300 }, { x: 150, y: 300 }, { x: 200, y: 300 }, { x: 250, y: 300 }, { x: 300, y: 300 },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#0c0f1f] flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
      {/* Kolam Drawing SVG Container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 mb-8 flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_25px_rgba(242,183,5,0.4)]">
          {/* Subtle connecting guideline curves */}
          <path
            d="M 100 200 C 150 100, 250 100, 300 200 C 300 250, 250 300, 200 300 C 150 300, 100 250, 100 200 Z"
            fill="none"
            stroke="#f2b705"
            strokeWidth="3.5"
            strokeDasharray="800"
            strokeDashoffset={800 - (progress / 100) * 800}
            strokeLinecap="round"
            className="transition-all duration-75"
          />
          <path
            d="M 200 100 C 300 150, 300 250, 200 300 C 100 250, 100 150, 200 100 Z"
            fill="none"
            stroke="#d6452f"
            strokeWidth="3"
            strokeDasharray="800"
            strokeDashoffset={800 - (progress / 100) * 800}
            strokeLinecap="round"
            className="transition-all duration-75"
          />

          {/* Dots (Pulli) with rice-grain appearance */}
          {dots.map((dot, i) => {
            const isRevealed = (i / dots.length) * 100 <= progress + 15;
            return (
              <circle
                key={i}
                cx={dot.x}
                cy={dot.y}
                r={isRevealed ? 3.5 : 2}
                fill={isRevealed ? "oklch(0.92 0.03 85)" : "oklch(0.92 0.03 85 / 0.25)"}
                className="transition-opacity duration-300"
              />
            );
          })}

          {/* Central Emblazoned Tamil Letter */}
          {progress > 50 && (
            <text
              x="200"
              y="214"
              textAnchor="middle"
              fill="oklch(0.68 0.16 85)"
              fontSize="38"
              fontWeight="bold"
              fontFamily="var(--font-tamil), serif"
              className="animate-pulse"
            >
              ஐ
            </text>
          )}
        </svg>
      </div>

      {/* Typography & Status */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
        {locale === "ta" ? "ஓஹியோ தமிழ் சங்கம்" : "OSU Tamil Sangam"}
      </h2>
      <p className="text-xs sm:text-sm text-[var(--accent-tint)] font-mono tracking-widest uppercase mb-6">
        {locale === "ta" ? "ஐந்திணை நிலங்கள் மலர்கின்றன..." : "Project Aintinai · Booting Kolam..."} {progress}%
      </p>

      {/* Progress Bar */}
      <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-[#f2b705] via-[#d6452f] to-[#0b7a75] transition-all duration-75 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="text-xs text-slate-400 hover:text-white px-4 py-2 rounded-full glass-panel hover:border-[var(--accent-tint)] transition-all font-mono"
      >
        {t("control.skipShow")} (Skip) →
      </button>
    </div>
  );
};
