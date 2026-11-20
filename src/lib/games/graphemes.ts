// src/lib/games/graphemes.ts
/**
 * Safe Tamil Grapheme Cluster (Akshara) Splitter
 * Ensures compound Tamil characters (uyirmei like கா, கு, ழ், த்) count as exactly 1 tile
 * rather than splitting into broken UTF-16 code units or isolated diacritics.
 */

import { splitTamilAksharas } from "../tamilGraphemes";

export { splitTamilAksharas };

/**
 * Split any string into grapheme clusters safely.
 * If language is Tamil or contains Tamil script, uses Intl.Segmenter with 'ta'.
 * Otherwise uses standard grapheme cluster segmentation.
 */
export function getGraphemes(text: string): string[] {
  if (!text) return [];
  return splitTamilAksharas(text);
}

/**
 * Returns grapheme length of a string (e.g. "வணக்கம்" -> 4 graphemes: வ, ண, க், க, ம் -> wait, வ, ண, க், க, ம் is 5).
 */
export function getGraphemeCount(text: string): number {
  return splitTamilAksharas(text).length;
}
