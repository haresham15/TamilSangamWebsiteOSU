// src/components/ui/PronounceableQuote.tsx
"use client";

import React, { KeyboardEvent, useMemo } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useTamilSpeech, extractTamilText } from "@/lib/tamilSpeech";

export interface ThirukkuralAudioButtonProps {
  tamilText: string;
  label?: string;
  tone?: "gold" | "light" | "dark" | "sandstone" | "bronze";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

/**
 * ThirukkuralAudioButton — A subtle, clean, accessible sound trigger button
 * placed next to Tamil couplets, inscriptions, and verses.
 */
export function ThirukkuralAudioButton({
  tamilText,
  label = "குறள் ஒலி வடிவம்",
  tone = "gold",
  size = "sm",
  showLabel = false,
  className = "",
}: ThirukkuralAudioButtonProps) {
  const { isSpeaking, toggleSpeak } = useTamilSpeech();
  const speaking = isSpeaking(tamilText);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSpeak(tamilText);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      toggleSpeak(tamilText);
    }
  };

  // Subtle, curated OKLCH/Courtyard-aligned tone variants
  const toneClasses = {
    gold: speaking
      ? "bg-[#C79347]/25 text-[#C79347] border-[#C79347]/50 shadow-[0_0_12px_rgba(199,147,71,0.35)] ring-1 ring-[#C79347]/50"
      : "bg-[#C79347]/10 text-[#C79347] border-[#C79347]/35 hover:bg-[#C79347]/20 hover:border-[#C79347]/50 shadow-sm",
    light: speaking
      ? "bg-[#0F766E]/20 text-[#0F766E] border-[#0F766E]/40 shadow-[0_0_10px_rgba(15,118,110,0.25)] ring-1 ring-[#0F766E]/50"
      : "bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/30 hover:bg-[#0F766E]/20 hover:border-[#0F766E]/50 shadow-sm",
    sandstone: speaking
      ? "bg-[#9A6B3E]/20 text-[#9A6B3E] border-[#9A6B3E]/40 shadow-[0_0_10px_rgba(154,107,62,0.25)] ring-1 ring-[#9A6B3E]/50"
      : "bg-[#9A6B3E]/10 text-[#9A6B3E] border-[#9A6B3E]/30 hover:bg-[#9A6B3E]/20 hover:border-[#9A6B3E]/50 shadow-sm",
    bronze: speaking
      ? "bg-[#D4A36A]/25 text-[#D4A36A] border-[#D4A36A]/50 shadow-[0_0_12px_rgba(212,163,106,0.35)] ring-1 ring-[#D4A36A]/50"
      : "bg-[#D4A36A]/10 text-[#D4A36A] border-[#D4A36A]/35 hover:bg-[#D4A36A]/20 hover:border-[#D4A36A]/50 shadow-sm",
    dark: speaking
      ? "bg-[#C79347]/25 text-[#FAF5ED] border-[#C79347]/70 shadow-[0_0_12px_rgba(199,147,71,0.35)] ring-1 ring-[#C79347]/50"
      : "bg-white/[0.08] text-[#CBBBA8] border-white/20 hover:bg-white/[0.16] hover:border-white/40 hover:text-[#FAF5ED] shadow-sm",
  }[tone];

  // Sizing: compact circular buttons by default, pill if label requested
  const sizeClasses = showLabel
    ? {
        sm: "h-7 px-2.5 text-[10px] gap-1.5 rounded-full",
        md: "h-8 px-3 text-xs gap-2 rounded-full",
        lg: "h-9 px-3.5 text-xs sm:text-sm gap-2.5 rounded-full",
      }[size]
    : {
        sm: "w-7 h-7 rounded-full",
        md: "w-8 h-8 rounded-full",
        lg: "w-9 h-9 rounded-full",
      }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-4.5 h-4.5",
  }[size];

  return (
    <button
      type="button"
      role="button"
      tabIndex={0}
      aria-label={`${label}: ${tamilText}. ${
        speaking ? "Currently playing, click to stop." : "Click to hear authentic Tamil pronunciation."
      }`}
      aria-pressed={speaking}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={
        speaking
          ? "ஒலி வடிவத்தை நிறுத்தவும் · Click to stop pronunciation"
          : "குறள் ஒலி கேட்க · Click to hear pronunciation"
      }
      className={`group/kural-btn shrink-0 inline-flex items-center justify-center border font-mono font-medium transition-all duration-200 cursor-pointer select-none active:scale-95 hover:scale-105 focus:outline-none focus-visible:ring-1.5 focus-visible:ring-offset-1 focus-visible:ring-current ${toneClasses} ${sizeClasses} ${className}`}
    >
      {speaking ? (
        <>
          <VolumeX className={`${iconSizes} text-current shrink-0`} aria-hidden="true" />
          {showLabel && (
            <span className="shrink-0 font-medium tracking-wide">
              நிறுத்து <span className="opacity-75">· Stop</span>
            </span>
          )}
        </>
      ) : (
        <>
          <Volume2
            className={`${iconSizes} text-current shrink-0 transition-transform duration-200 group-hover/kural-btn:scale-110`}
            aria-hidden="true"
          />
          {showLabel && (
            <span className="shrink-0 font-medium tracking-wide">
              கேள் <span className="opacity-75">· Listen</span>
            </span>
          )}
        </>
      )}
    </button>
  );
}


/**
 * KaraokeTamilText — Real-time word-by-word illuminating captions synchronized with voice.
 */
export function KaraokeTamilText({
  text,
  activeCharIndex,
  isSpeaking,
  className = "",
  highlightClass = "text-[#C79347] font-bold drop-shadow-[0_0_12px_rgba(199,147,71,0.85)] scale-105",
}: {
  text: string;
  activeCharIndex: number | null;
  isSpeaking: boolean;
  className?: string;
  highlightClass?: string;
}) {
  const words = useMemo(() => {
    const list: { word: string; start: number; end: number }[] = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      list.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    return list;
  }, [text]);

  let activeWordIdx = -1;
  if (isSpeaking && activeCharIndex !== null) {
    activeWordIdx = words.findIndex(
      (w) => activeCharIndex >= w.start && activeCharIndex <= w.end + 1
    );
    if (activeWordIdx === -1 && words.length > 0) {
      for (let i = words.length - 1; i >= 0; i--) {
        if (activeCharIndex >= words[i].start) {
          activeWordIdx = i;
          break;
        }
      }
    }
  }

  return (
    <span lang="ta" style={{ letterSpacing: 0 }} className={className}>
      {words.map((w, idx) => {
        const isActive = isSpeaking && idx === activeWordIdx;
        return (
          <React.Fragment key={idx}>
            <span
              className={`inline-block transition-all duration-200 ${
                isActive ? highlightClass : "opacity-90"
              }`}
            >
              {w.word}
            </span>
            {idx < words.length - 1 ? " " : ""}
          </React.Fragment>
        );
      })}
    </span>
  );
}

export interface PronounceableQuoteProps {
  tamilText: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
  showWaveBadge?: boolean;
  badgePosition?: "top" | "bottom" | "inline" | "beside" | "corner";
  tone?: "dark" | "light" | "gold" | "sandstone" | "bronze";
  as?: "div" | "blockquote" | "span";
}

/**
 * PronounceableQuote makes any Tamil quote, Thirukkural, or classical inscription
 * directly interactive. Clicking either the quote itself or the subtle audio button
 * plays authentic Tamil pronunciation while keeping the quote strictly centered.
 */
export function PronounceableQuote({
  tamilText,
  label,
  children,
  className = "",
  showWaveBadge = true,
  badgePosition = "beside",
  tone = "gold",
  as: Component = "div",
}: PronounceableQuoteProps) {
  const { isSpeaking, toggleSpeak } = useTamilSpeech();
  const speaking = isSpeaking(tamilText);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSpeak(tamilText);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      toggleSpeak(tamilText);
    }
  };

  const speakingRingClasses = speaking
    ? tone === "dark"
      ? "ring-1.5 ring-amber-400/60 shadow-[0_0_18px_rgba(245,158,11,0.2)]"
      : "ring-1.5 ring-[#F26BB5]/60 shadow-[0_0_16px_rgba(242,107,181,0.25)]"
    : "hover:ring-1 hover:ring-current/15";

  return (
    <Component
      role="region"
      aria-label={label || `Tamil pronunciation available for: ${tamilText}`}
      className={`group relative select-none rounded-xl transition-[box-shadow,ring-color] duration-200 ${speakingRingClasses} ${className}`}
    >
      {/* Top Badge */}
      {showWaveBadge && badgePosition === "top" && (
        <div className="flex items-center justify-center mb-2.5">
          <ThirukkuralAudioButton
            tamilText={tamilText}
            label={label}
            tone={tone}
            size="sm"
          />
        </div>
      )}

      {/* Beside Layout (Keeps quote strictly centered; button floats subtly to right on desktop, below on mobile) */}
      {badgePosition === "beside" ? (
        <div className="relative inline-flex flex-col items-center justify-center max-w-full">
          <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            title={
              speaking
                ? "ஒலி வடிவத்தை நிறுத்தவும் · Click to stop pronunciation"
                : "குறள் ஒலி கேட்கவும் · Click to hear pronunciation"
            }
            className={`cursor-pointer transition-transform duration-200 ${
              speaking ? "scale-[1.008]" : "group-hover:scale-[1.003]"
            }`}
          >
            {children}
          </div>
          {showWaveBadge && (
            <div className="sm:absolute sm:left-full sm:top-1/2 sm:-translate-y-1/2 sm:ml-3.5 mt-2.5 sm:mt-0 flex items-center justify-center">
              <ThirukkuralAudioButton
                tamilText={tamilText}
                label={label}
                tone={tone}
                size="sm"
                className="opacity-75 hover:opacity-100 transition-opacity"
              />
            </div>
          )}
        </div>
      ) : (
        /* Regular Layout (Inline / Top / Bottom / Corner) */
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          title={
            speaking
              ? "ஒலி வடிவத்தை நிறுத்தவும் · Click to stop pronunciation"
              : "குறள் ஒலி கேட்கவும் · Click to hear pronunciation"
          }
          className={`cursor-pointer transition-transform duration-200 ${
            speaking ? "scale-[1.008]" : "group-hover:scale-[1.003]"
          }`}
        >
          {children}
        </div>
      )}

      {/* Bottom Badge */}
      {showWaveBadge && badgePosition === "bottom" && (
        <div className="flex items-center justify-center mt-3">
          <ThirukkuralAudioButton
            tamilText={tamilText}
            label={label}
            tone={tone}
            size="sm"
          />
        </div>
      )}

      {/* Corner / Inline Badge (Floating top-right inside quote) */}
      {showWaveBadge && (badgePosition === "inline" || badgePosition === "corner") && (
        <div className="absolute top-2 right-2">
          <ThirukkuralAudioButton
            tamilText={tamilText}
            label={label}
            tone={tone}
            size="sm"
            className="opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      )}
    </Component>
  );
}
