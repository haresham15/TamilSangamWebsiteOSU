// src/lib/gamesStorage.ts

export interface ArcadeStorageSchemaV1 {
  version: 1;
  lastActiveEdition: string; // e.g. "2026-10"
  lastActiveGame: "sollu" | "thodarpu";
  preferences: {
    solluMode: "tanglish" | "tamil";
    highContrastTiles: boolean;
    culturalHintsEnabled: boolean;
  };
  sollu: Record<
    string, // key = `${editionId}:${mode}` e.g. "2026-10:tanglish"
    {
      guesses: string[][]; // Array of guessed grapheme/letter arrays
      status: "in_progress" | "won" | "lost";
      completedAt?: string;
    }
  >;
  thodarpu: Record<
    string, // key = editionId e.g. "2026-10"
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

const DEFAULT_STORAGE: ArcadeStorageSchemaV1 = {
  version: 1,
  lastActiveEdition: "2026-10",
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

/** Check if edition is unlocked based on America/New_York (Columbus, OH) time or ?unlock=all query flag */
export function isEditionUnlocked(editionId: string): boolean {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("unlock") === "all") return true;
  }

  // Parse YYYY-MM
  const [yearStr, monthStr] = editionId.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month)) return true;

  // Unlock timestamp: Year, Month (1-indexed), Day 1 at 00:00:00 EDT/EST
  // Target format: "2026-11-01T00:00:00-04:00" / America/New_York
  const targetUtc = new Date(Date.UTC(year, month - 1, 1, 4, 0, 0)); // 04:00 UTC = 00:00 EDT

  // Format current time into America/New_York
  const now = new Date();
  return now.getTime() >= targetUtc.getTime();
}

/** Calculate countdown in days and hours until edition unlocks */
export function getUnlockCountdown(editionId: string): { days: number; hours: number; isUnlocked: boolean } {
  if (isEditionUnlocked(editionId)) {
    return { days: 0, hours: 0, isUnlocked: true };
  }

  const [yearStr, monthStr] = editionId.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const targetUtc = new Date(Date.UTC(year, month - 1, 1, 4, 0, 0));
  const diffMs = targetUtc.getTime() - Date.now();
  if (diffMs <= 0) {
    return { days: 0, hours: 0, isUnlocked: true };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours, isUnlocked: false };
}

/** Check whether both games in an edition are solved */
export function isEditionComplete(editionId: string): boolean {
  const store = getArcadeStorage();
  const solluDone =
    store.sollu[`${editionId}:tanglish`]?.status === "won" ||
    store.sollu[`${editionId}:tamil`]?.status === "won";
  const thodarpuDone = store.thodarpu[editionId]?.status === "won";
  return Boolean(solluDone && thodarpuDone);
}

/** Count solved games in a specific edition (0, 1, or 2) */
export function getEditionSolvedCount(editionId: string): number {
  const store = getArcadeStorage();
  let count = 0;
  if (
    store.sollu[`${editionId}:tanglish`]?.status === "won" ||
    store.sollu[`${editionId}:tamil`]?.status === "won"
  ) {
    count++;
  }
  if (store.thodarpu[editionId]?.status === "won") {
    count++;
  }
  return count;
}

/** Count all editions where both games were solved */
export function getAllTimeEditionsCompleted(): number {
  const store = getArcadeStorage();
  const editions = ["2026-10", "2026-11", "2026-12"];
  return editions.filter((ed) => {
    const solluDone =
      store.sollu[`${ed}:tanglish`]?.status === "won" ||
      store.sollu[`${ed}:tamil`]?.status === "won";
    const thodarpuDone = store.thodarpu[ed]?.status === "won";
    return solluDone && thodarpuDone;
  }).length;
}
