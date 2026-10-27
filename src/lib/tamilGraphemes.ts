// src/lib/tamilGraphemes.ts

/**
 * Robust Tamil Grapheme Cluster (Akshara) Splitter
 * Uses Intl.Segmenter with locale 'ta' and NFC normalization so compound ligatures
 * (e.g., கொ, ஷி, த்) count as exactly 1 tile.
 * Falls back to NFC-normalized Unicode property escape if Intl.Segmenter is unavailable.
 */
export function splitTamilAksharas(input: string): string[] {
  const normalized = input.normalize("NFC").trim();
  if (!normalized) return [];

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter("ta", { granularity: "grapheme" });
      return Array.from(segmenter.segment(normalized), (s) => s.segment);
    } catch {
      // Fallback below
    }
  }

  // NFC-normalized Unicode property escape fallback (never splits கொ/கௌ into two tiles)
  return Array.from(
    normalized.match(/\p{sc=Tamil}[\p{Mn}\p{Mc}]*|\S/gu) ?? []
  );
}
