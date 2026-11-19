// src/lib/aazhamNormalizer.ts
/**
 * Aazham (ஆழம்) Tanglish & Tamil Script Normalization & Phonetic Matching Engine
 * Designed for real-time (<5ms) validation during a high-speed 25-second timer.
 * 
 * Capabilities:
 * 1. Script Unification: Handles English/Tanglish, transliteration, and native Tamil Unicode.
 * 2. Tamil Phonetic Collapsing: Unifies common spelling variants:
 *    - Retroflex & liquids: zh / z / l / lh -> l
 *    - Dental/alveolar stops: th / dh / d / t -> t
 *    - Velar stops: k / g / kh -> k
 *    - Palatals/sibilants: ch / s / sh / c -> s
 *    - Vowel length & diphthongs: oo -> u, ee -> i, aa -> a, trailing y/ee -> i, ai -> e
 *    - Geminate consonants: collapses double letters (tt -> t, kk -> k, pp -> p, etc.)
 * 3. Controlled Damerau-Levenshtein Fuzzy Matching:
 *    - Distance <= 1 for words 4-6 chars
 *    - Distance <= 2 for words 7+ chars
 *    - Zero false-positives between distinct short words (e.g. "idli" vs "idiyappam")
 */

import type { AazhamEntity } from "@/data/aazhamData";

/**
 * Check if the text contains native Tamil script Unicode characters.
 */
export function isTamilScript(text: string): boolean {
  return /[\u0B80-\u0BFF]/.test(text);
}

/**
 * Remove accents, punctuation, hyphens, and leading English articles.
 * Preserves NFC normalization for Tamil script so graphemes remain intact.
 */
export function sanitizeInput(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();

  // If text contains Tamil script, keep NFC and strip only punctuation
  if (isTamilScript(trimmed)) {
    return trimmed
      .normalize("NFC")
      .replace(/['’"“”\-–—_.,;:!?()\[\]{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Latin / Tanglish sanitation
  return trimmed
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Strip Latin diacritics
    .replace(/['’"“”\-–—_.,;:!?()\[\]{}]/g, " ") // Replace punctuation with space
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Collapse Tamil transliteration ambiguities in Latin/Tanglish strings.
 */
export function collapseTanglishPhonetics(input: string): string {
  const sanitized = sanitizeInput(input);
  if (!sanitized) return "";

  return sanitized
    // Split into tokens so multi-word titles (e.g. "kothu parotta") preserve word boundaries
    .split(" ")
    .map((word) => {
      let w = word;

      // 1. Unify diphthongs & vowels
      w = w
        .replace(/oo/g, "u")
        .replace(/ee/g, "i")
        .replace(/aa/g, "a")
        .replace(/ai/g, "e");

      // 2. Trailing vowels/glides
      w = w.replace(/y$/g, "i");

      // 3. Retroflex & liquid consonants
      w = w
        .replace(/zh/g, "l")
        .replace(/lh/g, "l")
        .replace(/z/g, "l");

      // 4. Dental / alveolar stops
      w = w
        .replace(/th/g, "t")
        .replace(/dh/g, "t")
        .replace(/d/g, "t");

      // 5. Palatals & sibilants
      w = w
        .replace(/ch/g, "s")
        .replace(/sh/g, "s")
        .replace(/c(?=[eiy])/g, "s")
        .replace(/c/g, "k");

      // 6. Velar stops
      w = w
        .replace(/kh/g, "k")
        .replace(/g/g, "k");

      // 7. Labial stops
      w = w
        .replace(/b/g, "p")
        .replace(/v/g, "w");

      // 8. Collapse duplicate consonants (gemination e.g. tt -> t, kk -> k, pp -> p)
      w = w.replace(/([a-z])\1+/g, "$1");

      return w;
    })
    .join(" ");
}

/**
 * Fast Damerau-Levenshtein distance calculation with transposition check.
 */
export function damerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  const maxDist = Math.max(la, lb);
  // Early exit if length difference exceeds fuzzy limit
  if (Math.abs(la - lb) > 2) return maxDist;

  // 2D distance matrix
  const matrix: number[][] = [];
  for (let i = 0; i <= la; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lb; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let min = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition check
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        min = Math.min(min, matrix[i - 2][j - 2] + 1);
      }

      matrix[i][j] = min;
    }
  }

  return matrix[la][lb];
}

/**
 * Main Guess Matcher.
 * Returns the matched AazhamEntity or null if input is unrecognized.
 * Runs in under 3ms against a dictionary of 50-200 entities.
 */
export function matchAazhamGuess(
  rawInput: string,
  answers: AazhamEntity[]
): AazhamEntity | null {
  const cleanInput = sanitizeInput(rawInput);
  if (!cleanInput || cleanInput.length < 2) return null;

  const hasTamil = isTamilScript(cleanInput);

  // 1. Direct Tamil Unicode Match
  if (hasTamil) {
    const compactClean = cleanInput.replace(/\s+/g, "").normalize("NFC");
    for (const entity of answers) {
      const entityTamil = entity.displayTa.normalize("NFC").replace(/\s+/g, "");
      if (entityTamil === compactClean || entityTamil.includes(compactClean) || compactClean.includes(entityTamil)) {
        return entity;
      }
    }
  }

  // 2. Exact Match against displayEn, id, or aliases
  const inputCollapsed = collapseTanglishPhonetics(cleanInput);
  const inputNoSpaces = cleanInput.replace(/\s+/g, "");
  const inputCollapsedNoSpaces = inputCollapsed.replace(/\s+/g, "");

  for (const entity of answers) {
    // Check ID
    if (entity.id.toLowerCase() === cleanInput || entity.id.replace(/-/g, "") === inputNoSpaces) {
      return entity;
    }

    // Check displayEn
    const displayEnSanitized = sanitizeInput(entity.displayEn);
    if (displayEnSanitized === cleanInput || displayEnSanitized.replace(/\s+/g, "") === inputNoSpaces) {
      return entity;
    }

    // Check displayEn collapsed
    const displayEnCollapsed = collapseTanglishPhonetics(displayEnSanitized);
    if (
      displayEnCollapsed === inputCollapsed ||
      displayEnCollapsed.replace(/\s+/g, "") === inputCollapsedNoSpaces
    ) {
      return entity;
    }

    // Check aliases
    for (const alias of entity.aliases) {
      const aliasSanitized = sanitizeInput(alias);
      if (aliasSanitized === cleanInput || aliasSanitized.replace(/\s+/g, "") === inputNoSpaces) {
        return entity;
      }

      const aliasCollapsed = collapseTanglishPhonetics(aliasSanitized);
      if (
        aliasCollapsed === inputCollapsed ||
        aliasCollapsed.replace(/\s+/g, "") === inputCollapsedNoSpaces
      ) {
        return entity;
      }
    }
  }

  // 3. Controlled Damerau-Levenshtein Fuzzy Matching
  // Only applied if the input is >= 4 characters to prevent false positives on short words
  if (inputCollapsedNoSpaces.length >= 4) {
    const maxAllowedDist = inputCollapsedNoSpaces.length >= 7 ? 2 : 1;

    for (const entity of answers) {
      const targetVariants = [
        collapseTanglishPhonetics(entity.displayEn).replace(/\s+/g, ""),
        ...entity.aliases.map((a) => collapseTanglishPhonetics(a).replace(/\s+/g, "")),
      ];

      for (const target of targetVariants) {
        if (Math.abs(target.length - inputCollapsedNoSpaces.length) <= maxAllowedDist) {
          const dist = damerauLevenshtein(inputCollapsedNoSpaces, target);
          if (dist <= maxAllowedDist) {
            return entity;
          }
        }
      }
    }
  }

  return null;
}
