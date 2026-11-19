// src/lib/aazhamStorage.ts
/**
 * Aazham (ஆழம்) Local Persistence & Telemetry Store
 * Tracks personal best depths, streak count, completed dive dossiers, and Valampuri pearls.
 * Zero-backend client-side persistence in localStorage.
 */

import { type AazhamTier, getAazhamRank } from "@/data/aazhamData";

export interface AazhamRoundResult {
  promptId: string;
  userGuess: string;
  matchedEntityId?: string;
  matchedDisplayNameEn?: string;
  matchedDisplayNameTa?: string;
  tier: AazhamTier | 0; // 0 for timeout / missed
  depthMeters: number;
  trapTriggered?: boolean;
  culturalBlurb?: string;
}

export interface AazhamDiveCompletion {
  editionId: string;
  finalDepthMeters: number;
  rankTitleEn: string;
  rankTitleTa: string;
  roundResults: AazhamRoundResult[];
  completedAt: string; // ISO date string
}

export interface AazhamStorageSchema {
  version: 1;
  bestDepthMeters: number;
  divesPlayed: number;
  currentStreak: number;
  maxStreak: number;
  valampuriCount: number;
  completedDives: Record<string, AazhamDiveCompletion>;
}

const AAZHAM_STORAGE_KEY = "osu_ts_aazham_v1";

const DEFAULT_AAZHAM_STORAGE: AazhamStorageSchema = {
  version: 1,
  bestDepthMeters: 0,
  divesPlayed: 0,
  currentStreak: 0,
  maxStreak: 0,
  valampuriCount: 0,
  completedDives: {},
};

export function getAazhamStorage(): AazhamStorageSchema {
  if (typeof window === "undefined") return DEFAULT_AAZHAM_STORAGE;
  try {
    const raw = localStorage.getItem(AAZHAM_STORAGE_KEY);
    if (!raw) return DEFAULT_AAZHAM_STORAGE;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1) {
      return {
        ...DEFAULT_AAZHAM_STORAGE,
        ...parsed,
        completedDives: { ...parsed.completedDives },
      };
    }
  } catch {
    // Fall back to default on error
  }
  return DEFAULT_AAZHAM_STORAGE;
}

export function saveAazhamDiveCompletion(
  editionId: string,
  roundResults: AazhamRoundResult[]
): AazhamDiveCompletion {
  const store = getAazhamStorage();

  const totalDepth = roundResults.reduce((acc, r) => acc + r.depthMeters, 0);
  const rank = getAazhamRank(totalDepth);

  const completion: AazhamDiveCompletion = {
    editionId,
    finalDepthMeters: totalDepth,
    rankTitleEn: rank.titleEn,
    rankTitleTa: rank.titleTa,
    roundResults,
    completedAt: new Date().toISOString(),
  };

  const isNewDive = !store.completedDives[editionId];
  const newDivesPlayed = isNewDive ? store.divesPlayed + 1 : store.divesPlayed;
  const newBestDepth = Math.max(store.bestDepthMeters, totalDepth);

  // Count Valampuri 100-pt answers
  const roundValampuris = roundResults.filter((r) => r.tier === 100).length;
  const newValampuriCount = store.valampuriCount + roundValampuris;

  // Streak update
  const newStreak = isNewDive ? store.currentStreak + 1 : store.currentStreak;
  const newMaxStreak = Math.max(store.maxStreak, newStreak);

  const updatedStore: AazhamStorageSchema = {
    ...store,
    divesPlayed: newDivesPlayed,
    bestDepthMeters: newBestDepth,
    currentStreak: newStreak,
    maxStreak: newMaxStreak,
    valampuriCount: newValampuriCount,
    completedDives: {
      ...store.completedDives,
      [editionId]: completion,
    },
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(AAZHAM_STORAGE_KEY, JSON.stringify(updatedStore));
    } catch {
      // Storage quota or private browsing limitation
    }
  }

  return completion;
}

export function hasPlayedAazhamDive(editionId: string): boolean {
  const store = getAazhamStorage();
  return Boolean(store.completedDives[editionId]);
}

export function getAazhamDiveResult(
  editionId: string
): AazhamDiveCompletion | null {
  const store = getAazhamStorage();
  return store.completedDives[editionId] || null;
}
