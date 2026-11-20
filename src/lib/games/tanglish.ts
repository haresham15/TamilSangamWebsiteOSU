// src/lib/games/tanglish.ts
/**
 * Shared Tanglish and Tamil Phonetic Normalizer & Bounded Levenshtein Engine.
 * Collapses Tamil transliteration ambiguity (zh/l/z, th/dh/t/d, k/g, ch/s, oo/u, ee/i, aa/a),
 * strips articles/punctuation, and runs bounded Damerau-Levenshtein matching.
 */

import {
  isTamilScript,
  sanitizeInput,
  collapseTanglishPhonetics,
  damerauLevenshtein,
} from "../aazhamNormalizer";

export {
  isTamilScript,
  sanitizeInput,
  collapseTanglishPhonetics,
  damerauLevenshtein,
};

/**
 * Checks if a user's guess matches any target or alias within bounded phonetic tolerance.
 * @param guess - User typed string (Tanglish, English, or Tamil Unicode)
 * @param target - Primary canonical target
 * @param aliases - Optional array of acceptable aliases
 */
export function matchesTanglishFuzzy(
  guess: string,
  target: string,
  aliases: string[] = []
): { matched: boolean; distance: number; matchedString?: string } {
  if (!guess || !target) return { matched: false, distance: 99 };

  const sanitizedGuess = sanitizeInput(guess);
  const collapsedGuess = collapseTanglishPhonetics(sanitizedGuess);

  const targetsToCheck = [target, ...aliases];

  for (const t of targetsToCheck) {
    if (!t) continue;
    const sanitizedTarget = sanitizeInput(t);
    const collapsedTarget = collapseTanglishPhonetics(sanitizedTarget);

    // Exact raw or sanitized match
    if (sanitizedGuess === sanitizedTarget || collapsedGuess === collapsedTarget) {
      return { matched: true, distance: 0, matchedString: t };
    }

    // Levenshtein on collapsed tokens
    const dist = damerauLevenshtein(collapsedGuess, collapsedTarget);
    const len = Math.max(collapsedGuess.length, collapsedTarget.length);

    // Thresholds:
    // length < 4: exact only
    // length 4..6: distance <= 1
    // length >= 7: distance <= 2
    if (len >= 4 && len <= 6 && dist <= 1) {
      return { matched: true, distance: dist, matchedString: t };
    }
    if (len >= 7 && dist <= 2) {
      return { matched: true, distance: dist, matchedString: t };
    }
  }

  return { matched: false, distance: 99 };
}

/**
 * Normalizes input for quick search filter in autocomplete dropdowns.
 */
export function normalizeSearchToken(str: string): string {
  return sanitizeInput(str).toLowerCase().replace(/\s+/g, "");
}
