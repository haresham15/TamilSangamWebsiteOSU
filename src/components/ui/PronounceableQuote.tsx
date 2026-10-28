// src/components/ui/PronounceableQuote.tsx
"use client";

import React, { KeyboardEvent } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useTamilSpeech } from "@/lib/tamilSpeech";

export interface ThirukkuralAudioButtonProps {
  tamilText: string;
  label?: string;
  tone?: "gold" | "light" | "dark";
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

  // Subtle, curated OKLCH-aligned tone variants
  const toneClasses = {
    gold: speaking
      ? "bg-[#E5A93C]/25 text-[#FFD166] border-[#E5A93C]/80 shadow-[0_0_12px_rgba(229,169,60,0.35)] ring-1 ring-[#E5A93C]/50"
      : "bg-[#E5A93C]/10 text-[#E5A93C]/85 border-[#E5A93C]/25 hover:bg-[#E5A93C]/20 hover:border-[#E5A93C]/50 hover:text-[#FFD166] shadow-sm",
    light: speaking
      ? "bg-[#B85C38]/25 text-[#B85C38] border-[#B85C38]/80 shadow-[0_0_10px_rgba(184,92,56,0.3)] ring-1 ring-[#B85C38]/50"
      : "bg-[#B85C38]/10 text-[#B85C38]/85 border-[#B85C38]/25 hover:bg-[#B85C38]/20 hover:border-[#B85C38]/45 hover:text-[#944426] shadow-sm",
    dark: speaking
      ? "bg-amber-400/25 text-amber-300 border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/50"
      : "bg-white/[0.08] text-stone-200 border-white/20 hover:bg-white/[0.16] hover:border-white/40 hover:text-white shadow-sm",
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
          <VolumeX className={`${iconSizes} text-current shrink-0 animate-pulse`} aria-hidden="true" />
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

export interface PronounceableQuoteProps {
  tamilText: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
  showWaveBadge?: boolean;
  badgePosition?: "top" | "bottom" | "inline" | "beside" | "corner";
  tone?: "dark" | "light" | "gold";
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
      : "ring-1.5 ring-[#B85C38]/60 shadow-[0_0_16px_rgba(184,92,56,0.18)]"
    : "hover:ring-1 hover:ring-current/15";

  return (
    <Component
      role="region"
      aria-label={label || `Tamil pronunciation available for: ${tamilText}`}
      className={`group relative select-none rounded-xl transition-all duration-300 ${speakingRingClasses} ${className}`}
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
