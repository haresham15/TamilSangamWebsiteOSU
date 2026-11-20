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
  originalGame: string;
  originalGameSubtitle: string;
  originalGameDescription: string;
  alteredTamilVersion: string;
  alteredTamilTwist: string;
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
    originalGame: "LinkedIn Zip",
    originalGameSubtitle: "Linear Dot Trail",
    originalGameDescription: "Connect numbers 1 to N along a grid in a single non-intersecting linear path.",
    alteredTamilVersion: "Pulli Kolam Path (புள்ளி கோலம்)",
    alteredTamilTwist: "Traces an unbroken sacred rice-flour chalk line through every pulli dot on an obsidian courtyard without crossing lines, powered by a Warnsdorff Hamiltonian generator.",
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
    originalGame: "LinkedIn Queens",
    originalGameSubtitle: "Regional N-Queens",
    originalGameDescription: "Place one queen per row, column, and color region with zero diagonal or adjacent contact.",
    alteredTamilVersion: "Arasigal / Chola Dynastic Crowns (சோழ அரசிகள்)",
    alteredTamilTwist: "Position sacred Chola crowns across dynastic territories of ancient Tamilakam. Strict royal boundaries ensure no two crowns touch—even diagonally.",
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
    originalGame: "LinkedIn Tango",
    originalGameSubtitle: "Binary Constraint Grid",
    originalGameDescription: "Fill a grid balancing two symbols with no more than two identical consecutive items.",
    alteredTamilVersion: "Surya & Chandra Celestial Balance (இரட்டைச் சின்னம்)",
    alteredTamilTwist: "Harmonize Surya (☀ Gold Sun) and Chandra (☾ Silver Crescent) across a 6×6 Tamil astrological mandala governed by '=' (harmony) and '×' (opposition) cosmic seals.",
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
    originalGame: "Nerdle",
    originalGameSubtitle: "Daily Math Equation",
    originalGameDescription: "Guess a hidden 8-character arithmetic equation in 6 tries with color-coded tile feedback.",
    alteredTamilVersion: "En Puthir with Tamil Numerals (எண் புதிர்)",
    alteredTamilTwist: "Solve 8-character BODMAS arithmetic formulas with a live toggle for classical Tamil numeral glyphs (௧–௯, ௦) celebrating ancient Sangam mathematical notation.",
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
    originalGame: "Quordle",
    originalGameSubtitle: "4 Simultaneous Wordles",
    originalGameDescription: "Solve four 5-letter English words simultaneously in 9 guesses using a single shared keyboard.",
    alteredTamilVersion: "Naanku Sorkal (நான்கு சொற்கள்)",
    alteredTamilTwist: "Concurrently deduce four Tamil/Tanglish cultural words in 9 attempts with a 4-quadrant segmented keyboard and grapheme-aware Tamil script segmentation.",
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
    originalGame: "LinkedIn Pinpoint",
    originalGameSubtitle: "Progressive 5-Clue Deductions",
    originalGameDescription: "Guess the hidden common category as 5 increasingly specific clues are uncovered one by one.",
    alteredTamilVersion: "Thodarbu Cultural Clue Ladder (தொடர்பு புதிர்)",
    alteredTamilTwist: "Five progressive clues reveal Tamil cinema lore, Carnatic ragas, temple architecture, and Tamil history, backed by phonetic Tanglish fuzzy matching.",
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
    originalGame: "NYT Spelling Bee",
    originalGameSubtitle: "Honeycomb Vocabulary Bee",
    originalGameDescription: "Create 4+ letter words from a 7-letter honeycomb, always using the mandatory center letter.",
    alteredTamilVersion: "Ezhuthu Theni (எழுத்து தேனீ)",
    alteredTamilTwist: "Authentic Tamil pangram honeycombs accepting both classical Tamil and everyday Tanglish vocabulary. Always requires the center root letter with celebratory Pangram discovery.",
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
    originalGame: "NYT Mini Crossword",
    originalGameSubtitle: "5×5 Daily Speed Crossword",
    originalGameDescription: "A quick daily 5×5 crossword grid designed for snappy 60-second completion.",
    alteredTamilVersion: "Kurukkezhuthu (குறுக்கெழுத்து)",
    alteredTamilTwist: "A 100% rotationally symmetric 5×5 bilingual crossword packed with Kollywood cinema trivia, Tamil food, Chennai slang, and OSU campus culture.",
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
    originalGame: "NYT Strands",
    originalGameSubtitle: "8-Way Drag Word Search & Spangram",
    originalGameDescription: "Find theme words across a letter grid using all letters, including a Spangram spanning two sides.",
    alteredTamilVersion: "Sol Vettai & Golden Spangram (சொல் வேட்டை)",
    alteredTamilTwist: "Drag across 48 letters in 8 directions to discover Tamil cultural theme words. Uncovers a golden cultural Spangram touching opposite borders that cleanly partitions the board.",
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
    originalGame: "Worldle",
    originalGameSubtitle: "Geographic Outline Guessing",
    originalGameDescription: "Identify a country by its outline with distance and compass direction indicators.",
    alteredTamilVersion: "Oor Kandupidi (ஊர் கண்டுபிடி)",
    alteredTamilTwist: "Guess mystery Tamil Nadu districts from exact vector silhouettes. Evaluates spherical Haversine distance in kilometers and 8-point compass bearing with temperature feedback.",
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
    originalGame: "Heardle",
    originalGameSubtitle: "Progressive Song Intro Guesser",
    originalGameDescription: "Listen to 1s, 2s, 4s, 7s, 11s, 16s audio snippets and guess the song.",
    alteredTamilVersion: "Paadal Kandupidi (பாடல் கண்டுபிடி)",
    alteredTamilTwist: "Stream live Kollywood audio snippets (1s to 16s) via Apple Music/iTunes previews featuring legends Ilaiyaraaja, A.R. Rahman, Anirudh, Harris, and Yuvan.",
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
    originalGame: "Framed",
    originalGameSubtitle: "Movie In 6 Frames",
    originalGameDescription: "Guess the movie from 6 sequential movie still screenshots.",
    alteredTamilVersion: "Padam Kandupidi (படம் கண்டுபிடி)",
    alteredTamilTwist: "Deduce blockbuster Tamil cinema across 6 progressive cinematic dossiers: color palette, iconic punch dialogue / lyric, signature prop silhouette, cast & director telemetry, and visual frames.",
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
