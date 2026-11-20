// src/lib/games/seed.ts
/**
 * Deterministic Daily Engine for The Sangam Arcade.
 * Uses Mulberry32 PRNG locked to America/New_York (EST/EDT).
 * Guarantees every student on campus sees the exact same daily puzzle,
 * with zero server-side state or database requirements.
 */

import { seededRandom } from "../prng";

/**
 * Returns the current date formatted as YYYY-MM-DD in America/New_York timezone.
 */
export function getDailyDateString(date: Date = new Date()): string {
  // Format specifically in America/New_York timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date); // outputs YYYY-MM-DD
}

/**
 * Returns human-readable date in English and Tamil for headers.
 */
export function getDailyFormattedDate(dateStr: string): { en: string; ta: string } {
  const [year, month, day] = dateStr.split("-").map((s) => parseInt(s, 10));
  const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  const en = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const TAMIL_MONTHS = [
    "தை", "மாசி", "பங்குனி", "சித்திரை", "வைகாசி", "ஆனி",
    "ஆடி", "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை", "மார்கழி"
  ];
  // Approximate Tamil solar month index (Gregorian month offset)
  const taMonth = TAMIL_MONTHS[(month + 8) % 12];
  const ta = `${taMonth} ${day}, ${year}`;

  return { en, ta };
}

/**
 * Hash string to 32-bit unsigned integer using FNV-1a.
 */
export function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
}

/**
 * Returns puzzle sequence number relative to launch epoch (Oct 1, 2026).
 */
export function getPuzzleNumber(dateStr: string): number {
  const launchEpoch = new Date("2026-10-01T00:00:00-04:00").getTime();
  const currentEpoch = new Date(`${dateStr}T00:00:00-04:00`).getTime();
  const diffDays = Math.max(1, Math.floor((currentEpoch - launchEpoch) / (1000 * 60 * 60 * 24)) + 1);
  return diffDays;
}

/**
 * Seeded PRNG instance generator.
 * @param gameSlug - e.g. "kolam-path", "arasigal", "thodarbu"
 * @param dateStr - YYYY-MM-DD or custom practice mode seed string
 */
export function getGamePrng(gameSlug: string, dateStr: string = getDailyDateString()) {
  let state = hashString(`${gameSlug}-${dateStr}`);

  return {
    seed: state,
    /** Returns float in [0, 1) */
    next(): number {
      state = (state + 1) >>> 0;
      return seededRandom(state);
    },
    /** Returns integer in [min, max] inclusive */
    nextInt(min: number, max: number): number {
      const r = this.next();
      return Math.floor(r * (max - min + 1)) + min;
    },
    /** Shuffles an array deterministically */
    shuffle<T>(array: T[]): T[] {
      const copy = [...array];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(this.next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    /** Picks random element */
    pick<T>(array: readonly T[] | T[]): T {
      const idx = Math.floor(this.next() * array.length);
      return array[idx];
    },
  };
}

/**
 * Returns practice mode seed string given index.
 */
export function getPracticeSeed(gameSlug: string, index: number): string {
  return `practice-${index}`;
}
