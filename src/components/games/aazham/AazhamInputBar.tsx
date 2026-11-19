// src/components/games/aazham/AazhamInputBar.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CornerDownLeft, Sparkles, AlertCircle } from "lucide-react";
import { soundEngine } from "@/lib/soundEngine";

interface AazhamInputBarProps {
  onGuessSubmit: (guess: string) => boolean; // returns true if accepted, false if rejected
  disabled: boolean;
  placeholder?: string;
}

export function AazhamInputBar({
  onGuessSubmit,
  disabled,
  placeholder = "Type your answer in Tanglish or Tamil (e.g. 'Kuzhi Paniyaram')...",
}: AazhamInputBarProps) {
  const [inputVal, setInputVal] = useState("");
  const [shake, setShake] = useState(false);
  const [rejectedMessage, setRejectedMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when enabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

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
        // Trigger non-blocking shake animation
        setShake(true);
        setRejectedMessage("Not recognized in this dive's archive — try another spelling or item!");
        setTimeout(() => setShake(false), 450);
      }
    },
    [disabled, inputVal, onGuessSubmit]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else {
      // Gentle key sound
      soundEngine.playFlapFlutter(0, 1.2);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`relative flex items-center rounded-xl bg-[#140C20] border-2 transition-all duration-200 shadow-inner ${
            shake
              ? "border-red-400/80 shadow-[0_0_15px_rgba(248,113,113,0.3)]"
              : "border-[rgba(125,96,166,0.4)] focus-within:border-[#A6F0CF] focus-within:shadow-[0_0_20px_rgba(166,240,207,0.15)]"
          }`}
        >
          {/* Leading Icon */}
          <div className="pl-4 pr-2 text-[#A6F0CF]/60 pointer-events-none">
            <Sparkles className="size-4" />
          </div>

          {/* Text Input Field */}
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
            placeholder={placeholder}
            aria-label="Your answer in Tanglish or Tamil"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className="w-full py-4 pr-16 bg-transparent text-[#F4F0FA] placeholder:text-[#F4F0FA]/40 font-sans text-base sm:text-lg focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Submit Action Button */}
          <div className="absolute right-2.5 flex items-center">
            <button
              type="submit"
              disabled={disabled || !inputVal.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25173B] hover:bg-[#341F52] border border-[rgba(125,96,166,0.4)] text-[#A6F0CF] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-bold transition-all shadow-xs"
            >
              <span className="hidden sm:inline">Submit</span>
              <CornerDownLeft className="size-3.5" />
            </button>
          </div>
        </motion.div>
      </form>

      {/* Non-blocking feedback notice */}
      {rejectedMessage && (
        <motion.div
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 mt-2.5 text-xs font-mono text-amber-300"
        >
          <AlertCircle className="size-3.5 shrink-0 text-amber-400" />
          <span>{rejectedMessage}</span>
        </motion.div>
      )}
    </div>
  );
}
