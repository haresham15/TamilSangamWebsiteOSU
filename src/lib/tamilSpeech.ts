// src/lib/tamilSpeech.ts
"use client";

import { useState, useCallback } from "react";
import { soundEngine } from "@/lib/soundEngine";

/**
 * Extracts only the Tamil characters and relevant punctuation from a string.
 * Strips out English annotations, transliterations, and parenthetical explanations
 * (e.g. "யாதும் ஊரே யாவரும் கேளீர் (To us all towns are home, everyone our kin)." -> "யாதும் ஊரே யாவரும் கேளீர்").
 */
export function extractTamilText(text: string): string {
  if (!text) return "";

  // 1. Strip parentheticals and bracketed notes
  const withoutParens = text
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\{[^}]*\}/g, " ");

  // 2. Identify words containing Tamil unicode characters (\u0B80-\u0BFF)
  const tokens = withoutParens.split(/\s+/);
  const tamilTokens = tokens.filter((token) => /[\u0B80-\u0BFF]/.test(token));

  if (tamilTokens.length > 0) {
    // Preserve Tamil text and clean up dangling punctuation
    return tamilTokens
      .join(" ")
      .replace(/["“”'‘’]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Fallback to stripped text if no Tamil block found
  return withoutParens.replace(/["“”'‘’]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Checks if SpeechSynthesis is supported in the current environment.
 */
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Finds the most suitable Tamil TTS voice from available browser voices.
 */
export function getTamilVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;

  try {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === "ta-IN" || v.lang === "ta_IN") ||
      voices.find((v) => v.lang.toLowerCase().startsWith("ta")) ||
      voices.find((v) => v.name.toLowerCase().includes("tamil")) ||
      null
    );
  } catch {
    return null;
  }
}

export interface SpeakTamilOptions {
  rate?: number; // 0.82-0.88 is optimal for classical couplets and student comprehension
  pitch?: number;
  volume?: number;
  playChime?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: unknown) => void;
}

// Active utterance tracker
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function getActiveUtterance(): SpeechSynthesisUtterance | null {
  return currentUtterance;
}

/**
 * Speaks Tamil text using the Web Speech API with classical cadence and optional temple chime.
 */
export function speakTamil(rawText: string, options: SpeakTamilOptions = {}): boolean {
  if (!isSpeechSupported()) {
    options.onError?.(new Error("SpeechSynthesis is not supported in this environment"));
    return false;
  }

  const textToSpeak = extractTamilText(rawText);
  if (!textToSpeak) {
    options.onError?.(new Error("No valid text found to pronounce"));
    return false;
  }

  try {
    // Cancel any active speech
    window.speechSynthesis.cancel();
    currentUtterance = null;

    // Optional sacred temple chime resonance
    if (options.playChime !== false) {
      try {
        soundEngine.playTempleChime();
      } catch {
        // Audio context may be locked or muted
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "ta-IN";
    utterance.rate = options.rate ?? 0.85; // deliberate, rhythmic cadence for teaching
    utterance.pitch = options.pitch ?? 1.0;
    if (options.volume !== undefined) utterance.volume = options.volume;

    const voice = getTamilVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (event) => {
      currentUtterance = null;
      // 'canceled' or 'interrupted' occurs when user triggers new speech or stops
      options.onError?.(event);
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (error) {
    currentUtterance = null;
    options.onError?.(error);
    return false;
  }
}

/**
 * Cancels any currently playing speech.
 */
export function stopTamilSpeech(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    } catch {
      // ignore
    }
  }
}

/**
 * React hook for managing pronunciation state for quotes and couplets.
 */
export function useTamilSpeech() {
  const [activeText, setActiveText] = useState<string | null>(null);

  const toggleSpeak = useCallback(
    (text: string, options?: Omit<SpeakTamilOptions, "onStart" | "onEnd" | "onError">) => {
      if (activeText === text) {
        stopTamilSpeech();
        setActiveText(null);
        return;
      }

      const success = speakTamil(text, {
        ...options,
        onStart: () => setActiveText(text),
        onEnd: () => setActiveText(null),
        onError: () => setActiveText(null),
      });

      if (!success) {
        setActiveText(null);
      }
    },
    [activeText]
  );

  const stop = useCallback(() => {
    stopTamilSpeech();
    setActiveText(null);
  }, []);

  return {
    activeText,
    isSpeaking: (text: string) => activeText === text,
    toggleSpeak,
    stop,
  };
}
