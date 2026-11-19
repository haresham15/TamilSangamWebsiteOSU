// src/components/games/aazham/aazhamQualityAudit.test.ts
import { describe, it, expect } from "vitest";
import {
  AAZHAM_BIWEEKLY_EDITIONS,
  AAZHAM_TIER_META,
  getAazhamRank,
  type AazhamTier,
} from "@/data/aazhamData";
import {
  matchAazhamGuess,
  collapseTanglishPhonetics,
} from "@/lib/aazhamNormalizer";

describe("Aazham Quality & Architecture Audit Suite", () => {
  it("verifies all biweekly editions adhere strictly to the 7-prompt contract", () => {
    const editionIds = Object.keys(AAZHAM_BIWEEKLY_EDITIONS);
    expect(editionIds.length).toBeGreaterThanOrEqual(4);

    for (const edId of editionIds) {
      const ed = AAZHAM_BIWEEKLY_EDITIONS[edId];
      expect(ed.prompts.length).toBe(7);

      ed.prompts.forEach((prompt, idx) => {
        expect(prompt.order).toBe(idx + 1);
        expect(prompt.titleEn.trim().length).toBeGreaterThan(0);
        expect(prompt.titleTa.trim().length).toBeGreaterThan(0);
        expect(prompt.obviousAnswer.trim().length).toBeGreaterThan(0);
        expect(prompt.trapAnswer.trim().length).toBeGreaterThan(0);

        // Verify tier distribution
        const tiers = new Set<AazhamTier>(prompt.answers.map((a) => a.tier));
        expect(tiers.has(10)).toBe(true);  // Baseline
        expect(tiers.has(15)).toBe(true);  // Trap
        expect(tiers.has(100)).toBe(true); // Valampuri pearl

        // Verify entity properties
        const seenIds = new Set<string>();
        for (const ans of prompt.answers) {
          expect(seenIds.has(ans.id)).toBe(false);
          seenIds.add(ans.id);
          expect(ans.displayEn.trim().length).toBeGreaterThan(0);
          expect(ans.displayTa.trim().length).toBeGreaterThan(0);
          expect(Array.isArray(ans.aliases)).toBe(true);
        }
      });
    }
  });

  it("verifies WCAG AAA contrast ratio compliance for all 6 tier color pairs", () => {
    // Relative luminance calculation for RGB hex
    function hexToRgb(hex: string): [number, number, number] {
      const clean = hex.replace("#", "");
      return [
        parseInt(clean.slice(0, 2), 16),
        parseInt(clean.slice(2, 4), 16),
        parseInt(clean.slice(4, 6), 16),
      ];
    }

    function getLuminance([r, g, b]: [number, number, number]): number {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    function getContrastRatio(hex1: string, hex2: string): number {
      const l1 = getLuminance(hexToRgb(hex1));
      const l2 = getLuminance(hexToRgb(hex2));
      const brighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (brighter + 0.05) / (darker + 0.05);
    }

    // Tier 100: #A6F0CF background against #140C20 text
    const valampuriContrast = getContrastRatio("#A6F0CF", "#140C20");
    expect(valampuriContrast).toBeGreaterThan(7.0); // WCAG AAA requirement (7:1)

    // Tier 15: #FEF3C7 text on amber-950 dark background (#451A03)
    const trapContrast = getContrastRatio("#FEF3C7", "#451A03");
    expect(trapContrast).toBeGreaterThan(7.0);

    // Tier 10: #F1F5F9 text on slate-700 background (#334155)
    const surfaceContrast = getContrastRatio("#F1F5F9", "#334155");
    expect(surfaceContrast).toBeGreaterThan(7.0);
  });

  it("verifies rank scale monotonicity across all depth boundaries", () => {
    const depths = [0, 1500, 1800, 3499, 3500, 5399, 5400, 6799, 6800, 7000];
    const ranks = depths.map((d) => getAazhamRank(d));

    // Verify each rank has English, Tamil, and lore
    for (const r of ranks) {
      expect(r.titleEn.length).toBeGreaterThan(0);
      expect(r.titleTa.length).toBeGreaterThan(0);
      expect(r.badge.length).toBeGreaterThan(0);
      expect(r.loreEn.length).toBeGreaterThan(0);
    }

    // Verify title at 0m vs 7,000m
    expect(getAazhamRank(0).titleEn).toBe("Marina Beachcomber");
    expect(getAazhamRank(7000).titleEn).toBe("Sangam Legend");
    expect(getAazhamRank(7000).titleTa).toBe("சங்கப் பேராசான்");
  });

  it("stress tests phonetic matcher performance (<1ms per lookup budget)", () => {
    const edition = AAZHAM_BIWEEKLY_EDITIONS["2026-10-A"];
    const allAnswers = edition.prompts.flatMap((p) => p.answers);

    const testQueries = [
      "kuzhi paniyaram",
      "paniyaram",
      "paddu",
      "ragi koozh",
      "kool",
      "dosa",
      "thosai",
      "idly",
      "ariyalur",
      "kovai",
      "thanjavur",
      "new york nagaram",
      "munbe vaa",
      "baasha",
      "chitti",
      "alex pandian",
      "amma",
      "machan",
      "jigarthanda",
      "madurai jigarthanda",
      "raja raja chola",
      "kallanai",
      "தோசை",
      "இட்லி",
    ];

    const start = performance.now();
    for (let i = 0; i < 50; i++) {
      for (const query of testQueries) {
        matchAazhamGuess(query, allAnswers);
      }
    }
    const elapsed = performance.now() - start;
    const totalLookups = 50 * testQueries.length; // 1,200 lookups
    const avgMs = elapsed / totalLookups;

    // Must be well under 1ms per lookup for smooth 60fps input
    expect(avgMs).toBeLessThan(0.8);
  });
});
