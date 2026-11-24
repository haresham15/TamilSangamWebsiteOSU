// src/components/games/aazham/SonarInput.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CornerDownLeft } from "lucide-react";

interface SonarInputProps {
  roundNum: number; // 1 to 7
  disabled: boolean;
  timeLeft: number; // in seconds (e.g. 25.0)
  maxTime?: number; // default 25
  onGuessSubmit: (guess: string) => boolean; // returns true if accepted, false if rejected
  onKeystroke?: () => void;
  accentColor?: string;
}

export function SonarInput({
  roundNum,
  disabled,
  timeLeft,
  maxTime = 25,
  onGuessSubmit,
  onKeystroke,
  accentColor = "#5EEAD4",
}: SonarInputProps) {
  const [inputVal, setInputVal] = useState("");
  const [shake, setShake] = useState(false);
  const [rejectedMessage, setRejectedMessage] = useState<string | null>(null);
  const [reticlePulse, setReticlePulse] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Time ratio (0.0 to 1.0)
  const timeRatio = Math.max(0, Math.min(1, timeLeft / maxTime));

  // Auto-focus input when enabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, roundNum]);

  // Color state based on remaining time
  const timerState = React.useMemo(() => {
    if (timeLeft <= 5) {
      return {
        barColor: "#FB7185", // Urgent coral-crimson
        glow: "rgba(251, 113, 133, 0.5)",
        textColor: "text-[#FB7185]",
        isUrgent: true,
      };
    }
    if (timeLeft <= 10) {
      return {
        barColor: "#F59E0B", // Warning amber
        glow: "rgba(245, 158, 11, 0.4)",
        textColor: "text-[#F59E0B]",
        isUrgent: false,
      };
    }
    return {
      barColor: accentColor,
      glow: `${accentColor}55`,
      textColor: "text-[#5EEAD4]",
      isUrgent: false,
    };
  }, [timeLeft, accentColor]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (disabled) return;

      const trimmed = inputVal.trim();
      if (!trimmed) return;

      const accepted = onGuessSubmit(trimmed);
      if (accepted) {
        setInputVal("");
        setRejectedMessage(null);
      } else {
        // Damped spring shake
        setShake(true);
        setRejectedMessage("Uncharted answer — try another spelling or deeper cut");
        setTimeout(() => setShake(false), 300);
      }
    },
    [disabled, inputVal, onGuessSubmit]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else {
      onKeystroke?.();
      // Reticle micro-ring expansion on keystroke
      setReticlePulse(true);
      setTimeout(() => setReticlePulse(false), 120);
    }
  };

  const hasContent = inputVal.trim().length >= 2;

  return (
    <div className="w-full flex flex-col select-none">
      {/* 1. TIMER READOUT ABOVE THE CONSOLE (RIGHT-ALIGNED) */}
      <div className="w-full flex items-center justify-between pb-1.5 px-1 font-mono text-xs">
        <span className="text-[10px] text-white/40 uppercase tracking-widest hidden sm:inline">
          SONAR INPUT CONSOLE
        </span>

        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">
            REMAINING:
          </span>
          <span
            className={`font-bold tabular-nums tracking-wider text-sm ${timerState.textColor}`}
            style={{
              textShadow: `0 0 8px ${timerState.glow}`,
            }}
          >
            {timeLeft.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* 2. TRANSLUCENT OBSIDIAN GLASS TROUGH */}
      <motion.div
        animate={shake ? { x: [0, -8, 7, -5, 3, 0] } : {}}
        transition={{ duration: 0.3 }}
        className="relative w-full rounded-t-xl bg-[#020B10]/55 backdrop-blur-md border-t border-x border-white/[0.08] shadow-2xl overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="relative flex items-center w-full px-4 py-4 sm:py-5">
          {/* Pulsing Sonar Reticle Dot */}
          <div className="relative mr-3.5 flex items-center justify-center shrink-0">
            <div
              className="size-2 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: timerState.barColor,
                boxShadow: `0 0 8px ${timerState.barColor}`,
              }}
            />
            {reticlePulse && (
              <motion.div
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute size-2 rounded-full border border-white"
              />
            )}
          </div>

          {/* Clean Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              if (rejectedMessage) setRejectedMessage(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type your rarest answer (Tanglish, English, or தமிழ்)..."
            aria-label="Type your rarest answer in Tanglish, English, or Tamil"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className="w-full bg-transparent text-[#F4F7F5] placeholder:text-white/30 text-lg sm:text-xl md:text-2xl font-normal tracking-tight focus:outline-none focus:ring-0 border-none p-0 pr-24"
          />

          {/* Tactile RETURN ↵ Keycap */}
          <div className="absolute right-4 flex items-center">
            <button
              type="submit"
              disabled={disabled || !hasContent}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-xs uppercase tracking-wider transition-all duration-200 ${
                hasContent
                  ? "bg-[#DFB968]/20 border-[#DFB968]/70 text-[#DFB968] shadow-[0_0_12px_rgba(223,185,104,0.3)] cursor-pointer"
                  : "bg-white/[0.04] border-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              <span className="hidden sm:inline font-semibold">ENTER</span>
              <CornerDownLeft className="size-3.5" />
            </button>
          </div>
        </form>

        {/* 3. INTEGRATED 60FPS HORIZON PRESSURE COUNTDOWN BAR */}
        <div className="w-full h-[2.5px] bg-white/[0.08] relative overflow-hidden">
          <div
            className="h-full origin-left transition-transform duration-75 ease-linear"
            style={{
              transform: `scaleX(${timeRatio})`,
              backgroundColor: timerState.barColor,
              boxShadow: `0 0 10px ${timerState.glow}`,
            }}
          />
        </div>
      </motion.div>

      {/* 4. FIXED-HEIGHT INLINE MICRO-FEEDBACK SLOT (Zero Layout Shift) */}
      <div className="h-7 w-full flex items-center px-2 pt-1 font-mono text-xs">
        {rejectedMessage ? (
          <motion.span
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-400 flex items-center gap-1 text-[11px]"
            role="alert"
            aria-live="polite"
          >
            <span>◆ {rejectedMessage}</span>
          </motion.span>
        ) : roundNum === 1 ? (
          <span className="text-white/35 text-[10.5px]">
            First accepted valid answer locks your round.
          </span>
        ) : null}
      </div>
    </div>
  );
}
