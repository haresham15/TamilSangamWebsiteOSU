import { create } from "zustand";
import { FAQS } from "@/data/faq";

export interface FaqStoreState {
  // Search & Filter
  searchQuery: string;
  activeFaqId: string | null;
  activeQuestion: string;
  activeAnswer: string;
  activeTeaser: string;
  /** Short EN keyword the split-flap board spells (PRD §4.3 / §6). */
  activeFlapLabel: string;

  // Cinematic Split-Flap Engine State
  scrollProgress: number;
  bootState: "pending" | "playing" | "settled";
  idleCountdown: number;
  fps: number;
  debugMode: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setActiveFaq: (id: string, question: string, answer: string, flapLabel?: string) => void;
  /** Board → DOM direction: selects a FAQ by ID, sets flapLabel, triggers accordion expansion. */
  selectFaqFromBoard: (id: string) => void;
  setScrollProgress: (p: number) => void;
  setBootState: (state: "pending" | "playing" | "settled") => void;
  setIdleCountdown: (sec: number) => void;
  setFps: (fps: number) => void;
  setDebugMode: (debug: boolean) => void;
}

/**
 * Truncates text to a maximum length (default 50 chars) without breaking words,
 * and appends a small indicator if truncated.
 */
export function truncateToTeaser(text: string, maxLen = 50): string {
  if (!text) return "";
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (cleaned.length <= maxLen) return cleaned;
  
  // Cut at last space before maxLen
  const truncated = cleaned.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  const base = lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated;
  return `${base}... ↓ READ MORE`;
}

export const useFaqStore = create<FaqStoreState>((set) => ({
  searchQuery: "",
  activeFaqId: "faq-01",
  activeQuestion: "What is OSU Tamil Sangam?",
  activeAnswer: "OSU Tamil Sangam is a casual student-run cultural organization at Ohio State. We are open to all backgrounds!",
  activeTeaser: truncateToTeaser("OSU Tamil Sangam is a casual student-run cultural organization at Ohio State. We are open to all backgrounds!", 50),
  activeFlapLabel: "TAMIL SANGAM",

  scrollProgress: 0,
  bootState: "pending",
  idleCountdown: 8,
  fps: 60,
  debugMode: false,

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setActiveFaq: (id: string, question: string, answer: string, flapLabel?: string) =>
    set({
      activeFaqId: id,
      activeQuestion: question,
      activeAnswer: answer,
      activeTeaser: truncateToTeaser(answer, 50),
      ...(flapLabel ? { activeFlapLabel: flapLabel } : {}),
    }),
  selectFaqFromBoard: (id: string) => {
    const faq = FAQS.find((f) => f.id === id);
    if (!faq) return;
    set({
      activeFaqId: id,
      activeQuestion: faq.questionEn,
      activeAnswer: faq.answerEn,
      activeTeaser: truncateToTeaser(faq.answerEn, 50),
      activeFlapLabel: faq.flapLabel,
    });
  },
  setScrollProgress: (p: number) => set({ scrollProgress: p }),
  setBootState: (bootState) => set({ bootState }),
  setIdleCountdown: (idleCountdown) => set({ idleCountdown }),
  setFps: (fps) => set({ fps }),
  setDebugMode: (debugMode) => set({ debugMode }),
}));

