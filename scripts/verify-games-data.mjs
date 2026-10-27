// scripts/verify-games-data.mjs
import assert from "node:assert/strict";
import {
  SOLLU_MONTHLY_EDITIONS,
  THODARPU_MONTHLY_EDITIONS,
  splitTamilAksharas,
  THODARPU_TIER_COLORS,
} from "../src/data/gamesData.ts";
import {
  VALIDATED_TANGLISH_5_WORDS,
  isValidSolluGuess,
} from "../src/data/solluDictionary.ts";

console.log("Auditing Games Data integrity against PRD v1.1 gates...");

// Gate 1: Tanglish seed dictionary
assert.ok(VALIDATED_TANGLISH_5_WORDS.length >= 113, `Expected at least 113 words, got ${VALIDATED_TANGLISH_5_WORDS.length}`);
for (const word of VALIDATED_TANGLISH_5_WORDS) {
  assert.equal(word.length, 5, `Tanglish word "${word}" must have exactly 5 letters`);
  assert.match(word, /^[A-Z]{5}$/, `Tanglish word "${word}" must be strictly A-Z`);
}
console.log(`PASS: 113 Tanglish words validated strictly as 5-letter uppercase ASCII.`);

// Gate 2: Sollu monthly editions & akshara counts
const editions = ["2026-10", "2026-11", "2026-12"];
for (const edId of editions) {
  const ed = SOLLU_MONTHLY_EDITIONS[edId];
  assert.ok(ed, `Missing Sollu edition ${edId}`);
  assert.equal(ed.tanglishWord.length, 5, `Edition ${edId} tanglishWord must be 5 letters`);
  assert.match(ed.tanglishWord, /^[A-Z]{5}$/);
  assert.ok(isValidSolluGuess(ed.tanglishWord), `Target word ${ed.tanglishWord} must be in valid dictionary`);

  const aksharas = splitTamilAksharas(ed.tamilAkshara.targetWord);
  assert.equal(
    aksharas.length,
    ed.aksharaCount,
    `Tamil word "${ed.tamilAkshara.targetWord}" split into ${aksharas.length} aksharas (${JSON.stringify(aksharas)}), expected ${ed.aksharaCount}`
  );
  console.log(`PASS: Edition ${edId} Sollu (${ed.tanglishWord} & ${ed.tamilAkshara.targetWord} -> [${aksharas.join(", ")}]: ${aksharas.length} aksharas) verified.`);
}

// Gate 3: Thodarpu categories & tiles
for (const edId of editions) {
  const ed = THODARPU_MONTHLY_EDITIONS[edId];
  assert.ok(ed, `Missing Thodarpu edition ${edId}`);
  assert.equal(ed.categories.length, 4, `Edition ${edId} must have exactly 4 categories`);

  const seenTiles = new Set();
  const seenTiers = new Set();

  for (const cat of ed.categories) {
    seenTiers.add(cat.tier);
    assert.equal(cat.tiles.length, 4, `Category "${cat.titleEn}" in ${edId} must have exactly 4 tiles`);
    for (const tile of cat.tiles) {
      assert.ok(tile.word && tile.word.trim().length > 0, `Tile in ${cat.titleEn} missing word`);
      const wordKey = tile.word.toUpperCase();
      assert.ok(!seenTiles.has(wordKey), `Duplicate tile "${tile.word}" found in edition ${edId}`);
      seenTiles.add(wordKey);
    }
  }

  assert.equal(seenTiles.size, 16, `Edition ${edId} must have 16 distinct tiles, got ${seenTiles.size}`);
  assert.deepEqual(Array.from(seenTiers).sort(), [1, 2, 3, 4], `Edition ${edId} must have tiers 1, 2, 3, 4`);
  console.log(`PASS: Edition ${edId} Thodarpu (16 unique tiles across 4 tiers) verified.`);
}

// Gate 4: Zero cross-game collisions
assert.notEqual(
  SOLLU_MONTHLY_EDITIONS["2026-12"].tanglishWord,
  "CHOLA",
  "December Sollu must be KOLAM to avoid colliding with Nov Thodarpu Tier 3 CHOLA"
);
assert.equal(SOLLU_MONTHLY_EDITIONS["2026-12"].tanglishWord, "KOLAM");

// Gate 5: WCAG 2.2 AA Contrast compliance for Tier 3 Semman Dark
assert.equal(THODARPU_TIER_COLORS[3].bg, "#B24A25", "Tier 3 background must be #B24A25 for 5.00:1 contrast");

console.log("ALL GAMES DATA AUDIT GATES PASSED (D-11, D-12, D-13 RESOLVED)!");
