// src/lib/aazhamNormalizer.test.ts
import { describe, it, expect } from "vitest";
import {
  sanitizeInput,
  collapseTanglishPhonetics,
  damerauLevenshtein,
  isTamilScript,
  matchAazhamGuess,
} from "./aazhamNormalizer";
import { AAZHAM_BIWEEKLY_EDITIONS } from "@/data/aazhamData";

describe("aazhamNormalizer unit tests", () => {
  it("sanitizes input: strips diacritics, articles, punctuation, and excess spaces", () => {
    expect(sanitizeInput("  The Madurai Jigarthanda!  ")).toBe("madurai jigarthanda");
    expect(sanitizeInput("A Medu-Vada...")).toBe("medu vada");
    expect(sanitizeInput("koththu-parotta (spicy)")).toBe("koththu parotta spicy");
  });

  it("collapses Tamil transliteration ambiguities", () => {
    // zh / l / z
    expect(collapseTanglishPhonetics("kuzhambu")).toBe("kulampu");
    expect(collapseTanglishPhonetics("kulambu")).toBe("kulampu");
    expect(collapseTanglishPhonetics("tamizh")).toBe("tamil");
    expect(collapseTanglishPhonetics("tamil")).toBe("tamil");

    // th / d / t
    expect(collapseTanglishPhonetics("thosai")).toBe("tose");
    expect(collapseTanglishPhonetics("dosa")).toBe("tosa");

    // Gemination (double consonants)
    expect(collapseTanglishPhonetics("koththu")).toBe("kotu");
    expect(collapseTanglishPhonetics("kothu")).toBe("kotu");
  });

  it("calculates accurate Damerau-Levenshtein distances", () => {
    expect(damerauLevenshtein("ariyalur", "ariyalur")).toBe(0);
    expect(damerauLevenshtein("ariylur", "ariyalur")).toBe(1); // omission
    expect(damerauLevenshtein("airyalur", "ariyalur")).toBe(1); // transposition
    expect(damerauLevenshtein("idli", "idiyappam")).toBeGreaterThan(3);
  });

  it("detects native Tamil script correctly", () => {
    expect(isTamilScript("இட்லி")).toBe(true);
    expect(isTamilScript("தோசை")).toBe(true);
    expect(isTamilScript("dosa")).toBe(false);
  });

  it("matches player guesses with high accuracy against sample edition prompts", () => {
    const edition = AAZHAM_BIWEEKLY_EDITIONS["2026-10-A"];
    const tiffinPrompt = edition.prompts[0]; // Tiffin prompt

    // Exact matches
    const idliMatch = matchAazhamGuess("idli", tiffinPrompt.answers);
    expect(idliMatch?.id).toBe("idli");
    expect(idliMatch?.tier).toBe(10);

    // Trap match
    const pongalMatch = matchAazhamGuess("pongal", tiffinPrompt.answers);
    expect(pongalMatch?.id).toBe("pongal");
    expect(pongalMatch?.tier).toBe(15);
    expect(pongalMatch?.trapWarning).toBeDefined();

    // Alternate spellings (Tanglish variations)
    const kothuMatch = matchAazhamGuess("koththu parotta", tiffinPrompt.answers);
    expect(kothuMatch?.id).toBe("kothu-parotta");
    expect(kothuMatch?.tier).toBe(60);

    const paniyaramMatch = matchAazhamGuess("paniyaram", tiffinPrompt.answers);
    expect(paniyaramMatch?.id).toBe("paniyaram");
    expect(paniyaramMatch?.tier).toBe(60);

    // Deep cuts
    const koozhMatch = matchAazhamGuess("ragi koozh", tiffinPrompt.answers);
    expect(koozhMatch?.id).toBe("koozh");
    expect(koozhMatch?.tier).toBe(100);

    // Native Tamil script input
    const tamilDosaMatch = matchAazhamGuess("தோசை", tiffinPrompt.answers);
    expect(tamilDosaMatch?.id).toBe("dosa");

    // Typo tolerance (Ariyalur in district prompt)
    const districtPrompt = edition.prompts[1];
    const ariyalurTypo = matchAazhamGuess("ariyalur", districtPrompt.answers);
    expect(ariyalurTypo?.id).toBe("ariyalur");
    expect(ariyalurTypo?.tier).toBe(100);

    // Negative case / false positive check:
    const invalidGuess = matchAazhamGuess("taco bell burrito", tiffinPrompt.answers);
    expect(invalidGuess).toBeNull();

    // False positive guard between short words:
    // "idli" should never match "idiyappam"
    const idliVersusIdiyappam = matchAazhamGuess("idli", [
      { id: "idiyappam", displayEn: "Idiyappam", displayTa: "இடியாப்பம்", aliases: [], tier: 30 },
    ]);
    expect(idliVersusIdiyappam).toBeNull();
  });
});
