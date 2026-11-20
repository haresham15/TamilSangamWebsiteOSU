// src/lib/gamesStorage.ts

export interface ArcadeStorageSchemaV1 {
  version: 1;
  lastActiveEdition: string; // e.g. "2026-10-A", "2026-11-B"
  lastActiveGame: "sollu" | "thodarpu";
  preferences: {
    solluMode: "tanglish" | "tamil";
    highContrastTiles: boolean;
    culturalHintsEnabled: boolean;
  };
  solluStats?: SolluStats;
  sollu: Record<
    string, // key = `${editionId}:${mode}` e.g. "2026-10-A:tanglish"
    {
      guesses: string[][]; // Array of guessed grapheme/letter arrays
      status: "in_progress" | "won" | "lost";
      completedAt?: string;
    }
  >;
  thodarpu: Record<
    string, // key = editionId e.g. "2026-10-A"
    {
      solvedTierIds: Array<1 | 2 | 3 | 4>;
      guessHistory: number[][]; // Tier numbers (1..4) of each 4-tile submission for emoji grid
      mistakesRemaining: number; // Starts at 4
      status: "in_progress" | "won" | "lost";
      completedAt?: string;
    }
  >;
}

const STORAGE_KEY = "osu_ts_arcade_v1";

export const BIWEEKLY_EDITIONS_LIST: readonly string[] = [
  "2026-10-A",
  "2026-10-B",
  "2026-11-A",
  "2026-11-B",
  "2026-12-A",
  "2026-12-B",
  "2027-01-A",
  "2027-01-B",
];

/** Canonical mapping for legacy monthly keys to biweekly keys */
export function normalizeEditionId(editionId: string): string {
  if (editionId === "2026-10") return "2026-10-A";
  if (editionId === "2026-11") return "2026-11-A";
  if (editionId === "2026-12") return "2026-12-A";
  return editionId;
}

/** Calculate exact unlock timestamp in America/New_York (Columbus, OH) time */
export function getEditionUnlockDate(editionId: string): Date {
  const norm = normalizeEditionId(editionId);
  const parts = norm.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const half = parts[2]?.toUpperCase();
  const day = half === "B" ? 15 : 1;

  if (isNaN(year) || isNaN(month)) return new Date(0);

  // November through March: EST (UTC-5 -> 05:00 UTC)
  // April through October: EDT (UTC-4 -> 04:00 UTC)
  const isEst = month >= 11 || month <= 3;
  const utcHour = isEst ? 5 : 4;
  return new Date(Date.UTC(year, month - 1, day, utcHour, 0, 0));
}

/** Check if edition is unlocked based on America/New_York (Columbus, OH) time or ?unlock=all query flag */
export function isEditionUnlocked(editionId: string): boolean {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("unlock") === "all") return true;
  }

  const unlockDate = getEditionUnlockDate(editionId);
  return Date.now() >= unlockDate.getTime();
}

/** Calculate countdown in days and hours until edition unlocks */
export function getUnlockCountdown(editionId: string): { days: number; hours: number; isUnlocked: boolean } {
  if (isEditionUnlocked(editionId)) {
    return { days: 0, hours: 0, isUnlocked: true };
  }

  const targetUtc = getEditionUnlockDate(editionId);
  const diffMs = targetUtc.getTime() - Date.now();
  if (diffMs <= 0) {
    return { days: 0, hours: 0, isUnlocked: true };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours, isUnlocked: false };
}

/** Determine the currently active biweekly edition based on current date */
export function getCurrentBiweeklyEditionId(nowDate = new Date()): string {
  const nowMs = nowDate.getTime();
  let latest = BIWEEKLY_EDITIONS_LIST[0];

  for (const ed of BIWEEKLY_EDITIONS_LIST) {
    if (nowMs >= getEditionUnlockDate(ed).getTime()) {
      latest = ed;
    }
  }

  return latest;
}

/** Get next upcoming biweekly unlock information if any edition is still locked */
export function getNextBiweeklyUnlock(nowDate = new Date()): {
  editionId: string;
  unlockDate: Date;
  days: number;
  hours: number;
} | null {
  const nowMs = nowDate.getTime();
  for (const ed of BIWEEKLY_EDITIONS_LIST) {
    const unlockDate = getEditionUnlockDate(ed);
    const diffMs = unlockDate.getTime() - nowMs;
    if (diffMs > 0) {
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return { editionId: ed, unlockDate, days, hours };
    }
  }
  return null;
}

const DEFAULT_STORAGE: ArcadeStorageSchemaV1 = {
  version: 1,
  lastActiveEdition: "2026-10-A",
  lastActiveGame: "sollu",
  preferences: {
    solluMode: "tanglish",
    highContrastTiles: false,
    culturalHintsEnabled: false,
  },
  sollu: {},
  thodarpu: {},
};

export function getArcadeStorage(): ArcadeStorageSchemaV1 {
  if (typeof window === "undefined") return DEFAULT_STORAGE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STORAGE;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1) {
      return {
        ...DEFAULT_STORAGE,
        ...parsed,
        preferences: { ...DEFAULT_STORAGE.preferences, ...parsed.preferences },
        sollu: { ...parsed.sollu },
        thodarpu: { ...parsed.thodarpu },
      };
    }
  } catch {
    // Fall back to default on parse failure
  }
  return DEFAULT_STORAGE;
}

export function saveArcadeStorage(state: ArcadeStorageSchemaV1): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota or private browsing limitation
  }
}

/** Check whether both games in an edition are solved */
export function isEditionComplete(editionId: string): boolean {
  const store = getArcadeStorage();
  const norm = normalizeEditionId(editionId);
  const solluDone =
    store.sollu[`${norm}:tanglish`]?.status === "won" ||
    store.sollu[`${norm}:tamil`]?.status === "won" ||
    store.sollu[`${editionId}:tanglish`]?.status === "won" ||
    store.sollu[`${editionId}:tamil`]?.status === "won";
  const thodarpuDone =
    store.thodarpu[norm]?.status === "won" || store.thodarpu[editionId]?.status === "won";
  return Boolean(solluDone && thodarpuDone);
}

/** Count solved games in a specific edition (0, 1, or 2) */
export function getEditionSolvedCount(editionId: string): number {
  const store = getArcadeStorage();
  const norm = normalizeEditionId(editionId);
  let count = 0;
  if (
    store.sollu[`${norm}:tanglish`]?.status === "won" ||
    store.sollu[`${norm}:tamil`]?.status === "won" ||
    store.sollu[`${editionId}:tanglish`]?.status === "won" ||
    store.sollu[`${editionId}:tamil`]?.status === "won"
  ) {
    count++;
  }
  if (store.thodarpu[norm]?.status === "won" || store.thodarpu[editionId]?.status === "won") {
    count++;
  }
  return count;
}

/** Count all editions where both games were solved */
export function getAllTimeEditionsCompleted(): number {
  return BIWEEKLY_EDITIONS_LIST.filter((ed) => isEditionComplete(ed)).length;
}

export interface SolluStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<1 | 2 | 3 | 4 | 5 | 6, number>;
}

export function getSolluStats(): SolluStats {
  const store = getArcadeStorage();
  if (store.solluStats) return store.solluStats;

  // Derive stats from existing sollu history if available
  let played = 0;
  let won = 0;
  const dist: Record<1 | 2 | 3 | 4 | 5 | 6, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  for (const entry of Object.values(store.sollu)) {
    if (entry.status === "won" || entry.status === "lost") {
      played++;
      if (entry.status === "won") {
        won++;
        const gCount = Math.min(6, Math.max(1, entry.guesses.length)) as 1 | 2 | 3 | 4 | 5 | 6;
        dist[gCount] = (dist[gCount] || 0) + 1;
      }
    }
  }

  return {
    played,
    won,
    currentStreak: won > 0 ? 1 : 0,
    maxStreak: won > 0 ? 1 : 0,
    guessDistribution: dist,
  };
}

export function recordSolluGameResult(isWon: boolean, numGuesses: number): SolluStats {
  const store = getArcadeStorage();
  const stats = getSolluStats();

  stats.played += 1;
  if (isWon) {
    stats.won += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
    const bucket = Math.min(6, Math.max(1, numGuesses)) as 1 | 2 | 3 | 4 | 5 | 6;
    stats.guessDistribution[bucket] = (stats.guessDistribution[bucket] || 0) + 1;
  } else {
    stats.currentStreak = 0;
  }

  store.solluStats = stats;
  saveArcadeStorage(store);
  return stats;
}
