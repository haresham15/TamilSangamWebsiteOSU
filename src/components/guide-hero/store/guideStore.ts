"use client";

import { create } from "zustand";
import { FAQS, FaqItem } from "@/data/faq";
import { BoardContentItem } from "../board/layout";
import { POPULAR_FAQ_FALLBACK_ID, popularFaqBoardItem, type RankedFaq } from "@/lib/faq-engagement/contracts";

export type GuideSource = "idle" | "accordion" | "search" | "board" | "station";

export interface GuideStoreState {
  activeId: string | null;
  activeItem: BoardContentItem;
  source: GuideSource;
  seq: number;
  searchQuery: string;
  isPastHero: boolean;

  activeFlapLabel: string;
  popularRanking: RankedFaq[];

  // Actions
  selectFaq: (faq: FaqItem, source?: GuideSource) => void;
  selectFaqById: (id: string, source?: GuideSource) => void;
  setActiveItem: (item: BoardContentItem, id?: string | null, source?: GuideSource) => void;
  setSearchPrompt: () => void;
  setSearchQuery: (query: string) => void;
  setNoMatch: (query: string) => void;
  setIsPastHero: (past: boolean) => void;
  setPopularRanking: (ranked: RankedFaq[]) => void;
  revealMostAsked: () => void;
  advancePopularCarousel: () => void;
  resetToDefault: () => void;
}

const initialPopularRanking: RankedFaq[] = [{ id: POPULAR_FAQ_FALLBACK_ID, rank: 1 }];
const initialPopularFaq = FAQS.find((faq) => faq.id === POPULAR_FAQ_FALLBACK_ID) ?? FAQS[0];

export const DEFAULT_BOARD_ITEM: BoardContentItem = {
  ...popularFaqBoardItem(initialPopularFaq, 1),
};

export const useGuideStore = create<GuideStoreState>((set, get) => ({
  activeId: initialPopularFaq.id,
  activeItem: DEFAULT_BOARD_ITEM,
  activeFlapLabel: "OSU TAMIL SANGAM",
  popularRanking: initialPopularRanking,
  source: "idle",
  seq: 0,
  searchQuery: "",
  isPastHero: false,

  selectFaq: (faq: FaqItem, source: GuideSource = "accordion") => {
    const noMatch = faq.id.match(/\d+/);
    const no = noMatch ? parseInt(noMatch[0], 10) : undefined;

    const item: BoardContentItem = {
      no,
      text: faq.boardText || faq.questionEn,
      catCode: faq.catCode || "GENL",
      statusText: "ANSWERED  READ BELOW V",
    };

    set((state) => ({
      activeId: faq.id,
      activeItem: item,
      activeFlapLabel: faq.flapLabel || "OSU TAMIL SANGAM",
      source,
      seq: state.seq + 1,
    }));
  },

  selectFaqById: (id: string, source: GuideSource = "accordion") => {
    const faq = FAQS.find((f) => f.id === id);
    if (faq) {
      get().selectFaq(faq, source);
    }
  },

  setActiveItem: (item: BoardContentItem, id: string | null = null, source: GuideSource = "board") => {
    set((state) => ({
      activeId: id,
      activeItem: item,
      source,
      seq: state.seq + 1,
    }));
  },

  setSearchPrompt: () => {
    set((state) => ({
      activeId: "search-prompt",
      activeItem: {
        text: "SEARCH QUESTIONS OR TOPICS...",
        catCode: "FIND",
        statusText: "TYPE KEYWORD OR TAMIL TERM",
      },
      activeFlapLabel: "SEARCH FAQ",
      source: "search",
      seq: state.seq + 1,
    }));
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setNoMatch: (_query: string) => {
    set((state) => ({
      activeId: "no-match",
      activeItem: {
        text: "NO MATCH FOUND   ASK NANBA FOR GUIDANCE",
        catCode: "INFO",
        statusText: "CLICK ASK NANBA ->",
      },
      activeFlapLabel: "ASK NANBA",
      source: "search",
      seq: state.seq + 1,
    }));
  },

  setIsPastHero: (past: boolean) => {
    set({ isPastHero: past });
  },

  setPopularRanking: (ranked) => {
    const valid = ranked.filter((entry) => FAQS.some((faq) => faq.id === entry.id));
    if (valid.length) set({ popularRanking: valid });
  },

  revealMostAsked: () => {
    const state = get();
    if (state.source !== "idle") return;
    const ranked = state.popularRanking[0] ?? initialPopularRanking[0];
    const faq = FAQS.find((candidate) => candidate.id === ranked.id) ?? initialPopularFaq;
    set((current) => ({
      activeId: faq.id,
      activeItem: popularFaqBoardItem(faq, ranked.rank),
      activeFlapLabel: faq.flapLabel || "OSU TAMIL SANGAM",
      source: "station",
      seq: current.seq + 1,
    }));
  },

  advancePopularCarousel: () => {
    const state = get();
    if (state.source !== "station") return;
    const ranked = state.popularRanking[1];
    if (!ranked) return;
    const faq = FAQS.find((candidate) => candidate.id === ranked.id);
    if (!faq) return;
    set((current) => ({
      activeId: faq.id,
      activeItem: popularFaqBoardItem(faq, ranked.rank),
      activeFlapLabel: faq.flapLabel || "OSU TAMIL SANGAM",
      source: "station",
      seq: current.seq + 1,
    }));
  },

  resetToDefault: () => {
    set((state) => ({
      activeId: initialPopularFaq.id,
      activeItem: DEFAULT_BOARD_ITEM,
      activeFlapLabel: "OSU TAMIL SANGAM",
      source: "idle",
      seq: state.seq + 1,
      searchQuery: "",
    }));
  },
}));
