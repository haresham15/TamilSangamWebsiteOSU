// src/lib/games/storage.ts
"use client";

/**
 * Unified Arcade State Engine for The Sangam Arcade.
 * Persists user gameplay, daily statuses, streaks, solve times,
 * and calculates the "Daily Gauntlet" completion ring (X / 12 Solved Today).
 */

import { getDailyDateString } from "./seed";

export type GameStatus = "unplayed" | "in_progress" | "won" | "lost";

export interface GameDailyRecord {
  status: GameStatus;
  date: string; // YYYY-MM-DD
  solveTimeSeconds?: number;
  moves?: number;
  score?: number;
  guessesCount?: number;
  completedAt?: string;
  state?: unknown; // Arbitrary serializable game-specific state (e.g. partial board)
}

export interface GameStreakRecord {
  currentStreak: number;
  maxStreak: number;
  totalPlayed: number;
  totalWon: number;
  lastPlayedDate?: string;
}

export interface ArcadeStorageSchema {
  version: 2;
  dailyRecords: Record<string, Record<string, GameDailyRecord>>; // [gameSlug][dateStr]
  streaks: Record<string, GameStreakRecord>; // [gameSlug]
  lastActiveGame?: string;
}

export const ARCADE_GAME_SLUGS = [
  "kolam-path",
  "arasigal",
  "irattaichinnam",
  "naanku-sorkal",
  "en-puthir",
  "thodarbu",
  "oor-kandupidi",
  "ezhuthu-theni",
  "kurukkezhuthu",
  "sol-vettai",
  "paadal-kandupidi",
  "padam-kandupidi",
] as const;

export type ArcadeGameSlug = typeof ARCADE_GAME_SLUGS[number];

export interface ArcadeGameMeta {
  slug: ArcadeGameSlug;
  titleEn: string;
  titleTa: string;
  subtitleEn: string;
  category: "logic" | "words" | "kollywood";
  tagEn: string;
  tagTa: string;
  estimatedMinutes: number;
  accentColor: string;
  description: string;
}

export const ARCADE_GAMES_CATALOG: readonly ArcadeGameMeta[] = [
  // 1. Logic & Geometry
  {
    slug: "kolam-path",
    titleEn: "Kolam Path",
    titleTa: "கோலப் பாதை",
    subtitleEn: "Pulli Kolam Chalk Grid",
    category: "logic",
    tagEn: "Hamiltonian Path",
    tagTa: "புள்ளி கோலம்",
    estimatedMinutes: 2,
    accentColor: "#A6F0CF",
    description: "Trace an unbroken rice-flour chalk line through every single dot without crossing your path.",
  },
  {
    slug: "arasigal",
    titleEn: "Arasigal",
    titleTa: "அரசிகள்",
    subtitleEn: "Chola Queens Logic Grid",
    category: "logic",
    tagEn: "Logic Grid",
    tagTa: "அரசி புதிர்கள்",
    estimatedMinutes: 3,
    accentColor: "#E5B869",
    description: "Place one Chola crown in every row, column, and colored region such that no two touch.",
  },
  {
    slug: "irattaichinnam",
    titleEn: "Irattaichinnam",
    titleTa: "இரட்டைச் சின்னம்",
    subtitleEn: "Surya & Chandra Balance",
    category: "logic",
    tagEn: "Binary Logic",
    tagTa: "சூரியன் சந்திரன்",
    estimatedMinutes: 3,
    accentColor: "#F49D79",
    description: "Balance Sun and Moon symbols on a 6×6 grid following strict harmony constraints.",
  },
  {
    slug: "en-puthir",
    titleEn: "En Puthir",
    titleTa: "எண் புதிர்",
    subtitleEn: "Tamil Math Equation",
    category: "logic",
    tagEn: "Daily Equation",
    tagTa: "கணித புதிர்",
    estimatedMinutes: 2,
    accentColor: "#9BB1FF",
    description: "Unravel a hidden 8-character math equation in 6 tries with optional Tamil numerals (௦–௯).",
  },

  // 2. Words & Culture
  {
    slug: "naanku-sorkal",
    titleEn: "Naanku Sorkal",
    titleTa: "நான்கு சொற்கள்",
    subtitleEn: "Quadruple Tamil Wordle",
    category: "words",
    tagEn: "4x Wordle",
    tagTa: "4 சொற்கள்",
    estimatedMinutes: 4,
    accentColor: "#A6F0CF",
    description: "Solve four Tamil/Tanglish Wordle boards simultaneously in 9 guesses with a unified keyboard.",
  },
  {
    slug: "thodarbu",
    titleEn: "Thodarbu",
    titleTa: "தொடர்பு",
    subtitleEn: "Cultural Pinpoint Clues",
    category: "words",
    tagEn: "Cultural Trivia",
    tagTa: "தொடர்பு புதிர்",
    estimatedMinutes: 2,
    accentColor: "#E5B869",
    description: "Five progressive clues reveal one by one. Identify the hidden Tamil cultural connection.",
  },
  {
    slug: "ezhuthu-theni",
    titleEn: "Ezhuthu Theni",
    titleTa: "எழுத்து தேனீ",
    subtitleEn: "Honeycomb Vocabulary Bee",
    category: "words",
    tagEn: "Spelling Bee",
    tagTa: "எழுத்து தேனீ",
    estimatedMinutes: 4,
    accentColor: "#F49D79",
    description: "Create everyday Tamil & Tanglish words from a 7-tile honeycomb with one mandatory center letter.",
  },
  {
    slug: "kurukkezhuthu",
    titleEn: "Kurukkezhuthu",
    titleTa: "குறுக்கெழுத்து",
    subtitleEn: "5×5 Cultural Mini Crossword",
    category: "words",
    tagEn: "Mini Crossword",
    tagTa: "குறுக்கெழுத்து",
    estimatedMinutes: 2,
    accentColor: "#C4B7D7",
    description: "A snappy 60-second 5×5 crossword themed around Kollywood, Tamil food, and OSU life.",
  },
  {
    slug: "sol-vettai",
    titleEn: "Sol Vettai",
    titleTa: "சொல் வேட்டை",
    subtitleEn: "Theme Word Hunt & Spangram",
    category: "words",
    tagEn: "Strands",
    tagTa: "சொல் வேட்டை",
    estimatedMinutes: 3,
    accentColor: "#7DD3FC",
    description: "Trace themed words in 8 directions across a letter grid to uncover the golden cultural Spangram.",
  },

  // 3. Kollywood & Geography
  {
    slug: "oor-kandupidi",
    titleEn: "Oor Kandupidi",
    titleTa: "ஊர் கண்டுபிடி",
    subtitleEn: "Tamil Nadu District Guess",
    category: "kollywood",
    tagEn: "Geo Worldle",
    tagTa: "தமிழக மாவட்டங்கள்",
    estimatedMinutes: 2,
    accentColor: "#A6F0CF",
    description: "Identify the mystery Tamil Nadu district from its vector silhouette with compass & km clues.",
  },
  {
    slug: "paadal-kandupidi",
    titleEn: "Paadal Kandupidi",
    titleTa: "பாடல் கண்டுபிடி",
    subtitleEn: "Progressive Song Intro Guess",
    category: "kollywood",
    tagEn: "Heardle",
    tagTa: "பாடல் புதிர்",
    estimatedMinutes: 2,
    accentColor: "#E5B869",
    description: "Listen to 1s, 2s, 4s, 7s, 11s, 16s audio snippets and guess the iconic Kollywood song.",
  },
  {
    slug: "padam-kandupidi",
    titleEn: "Padam Kandupidi",
    titleTa: "படம் கண்டுபிடி",
    subtitleEn: "Kollywood Movie In 6 Frames",
    category: "kollywood",
    tagEn: "Framed",
    tagTa: "திரைப்படம்",
    estimatedMinutes: 2,
    accentColor: "#F49D79",
    description: "Guess the blockbuster Tamil movie across 6 progressive visual, dialogue, and composer clues.",
  },
];

const STORAGE_KEY = "osu_ts_arcade_v2";

function getEmptyState(): ArcadeStorageSchema {
  return {
    version: 2,
    dailyRecords: {},
    streaks: {},
  };
}

export function loadArcadeState(): ArcadeStorageSchema {
  if (typeof window === "undefined") return getEmptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmptyState();
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 2) return parsed;
    return getEmptyState();
  } catch {
    return getEmptyState();
  }
}

export function saveArcadeState(state: ArcadeStorageSchema): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded fallback
  }
}

/**
 * Get daily record for a specific game and date.
 */
export function getDailyGameRecord(
  gameSlug: string,
  dateStr: string = getDailyDateString()
): GameDailyRecord {
  const state = loadArcadeState();
  return state.dailyRecords[gameSlug]?.[dateStr] || { status: "unplayed", date: dateStr };
}

/**
 * Update daily game record and recalculate streaks.
 */
export function updateDailyGameRecord(
  gameSlug: string,
  record: Partial<GameDailyRecord>,
  dateStr: string = getDailyDateString()
): void {
  const state = loadArcadeState();
  if (!state.dailyRecords[gameSlug]) {
    state.dailyRecords[gameSlug] = {};
  }

  const existing = state.dailyRecords[gameSlug][dateStr] || {
    status: "unplayed",
    date: dateStr,
  };

  const updated: GameDailyRecord = {
    ...existing,
    ...record,
    date: dateStr,
  };

  // If status transitioned to won, update streaks
  if (existing.status !== "won" && updated.status === "won") {
    if (!state.streaks[gameSlug]) {
      state.streaks[gameSlug] = {
        currentStreak: 0,
        maxStreak: 0,
        totalPlayed: 0,
        totalWon: 0,
      };
    }
    const streak = state.streaks[gameSlug];
    streak.totalPlayed += 1;
    streak.totalWon += 1;
    streak.currentStreak += 1;
    if (streak.currentStreak > streak.maxStreak) {
      streak.maxStreak = streak.currentStreak;
    }
    streak.lastPlayedDate = dateStr;
  } else if (existing.status !== "lost" && updated.status === "lost") {
    if (!state.streaks[gameSlug]) {
      state.streaks[gameSlug] = {
        currentStreak: 0,
        maxStreak: 0,
        totalPlayed: 0,
        totalWon: 0,
      };
    }
    state.streaks[gameSlug].totalPlayed += 1;
    state.streaks[gameSlug].currentStreak = 0;
    state.streaks[gameSlug].lastPlayedDate = dateStr;
  }

  state.dailyRecords[gameSlug][dateStr] = updated;
  saveArcadeState(state);
}

/**
 * Calculates today's Daily Gauntlet summary (e.g. 5 / 12 solved).
 */
export function getDailyGauntletSummary(dateStr: string = getDailyDateString()): {
  totalGames: number;
  solvedCount: number;
  inProgressCount: number;
  isGauntletComplete: boolean;
  gameStatuses: Record<ArcadeGameSlug, GameStatus>;
  nextUnplayedSlug: ArcadeGameSlug | null;
} {
  const state = loadArcadeState();
  let solvedCount = 0;
  let inProgressCount = 0;
  const gameStatuses: Partial<Record<ArcadeGameSlug, GameStatus>> = {};
  let nextUnplayedSlug: ArcadeGameSlug | null = null;

  for (const slug of ARCADE_GAME_SLUGS) {
    const record = state.dailyRecords[slug]?.[dateStr];
    const status = record?.status || "unplayed";
    gameStatuses[slug] = status;

    if (status === "won") {
      solvedCount += 1;
    } else if (status === "in_progress") {
      inProgressCount += 1;
      if (!nextUnplayedSlug) nextUnplayedSlug = slug;
    } else if (status === "unplayed") {
      if (!nextUnplayedSlug) nextUnplayedSlug = slug;
    }
  }

  return {
    totalGames: ARCADE_GAME_SLUGS.length,
    solvedCount,
    inProgressCount,
    isGauntletComplete: solvedCount === ARCADE_GAME_SLUGS.length,
    gameStatuses: gameStatuses as Record<ArcadeGameSlug, GameStatus>,
    nextUnplayedSlug,
  };
}

/**
 * Returns streak record for a specific game.
 */
export function getGameStreak(gameSlug: string): GameStreakRecord {
  const state = loadArcadeState();
  return (
    state.streaks[gameSlug] || {
      currentStreak: 0,
      maxStreak: 0,
      totalPlayed: 0,
      totalWon: 0,
    }
  );
}
