// scripts/verify-games-data.mjs
import assert from "node:assert/strict";
import {
  SOLLU_BIWEEKLY_EDITIONS,
  SOLLU_MONTHLY_EDITIONS,
  THODARPU_BIWEEKLY_EDITIONS,
  THODARPU_MONTHLY_EDITIONS,
  splitTamilAksharas,
  THODARPU_TIER_COLORS,
  BIWEEKLY_EDITION_IDS,
} from "../src/data/gamesData.ts";
import {
  VALIDATED_TANGLISH_WORDS,
  VALIDATED_TANGLISH_5_WORDS,
  isValidSolluGuess,
} from "../src/data/solluDictionary.ts";

console.log("Auditing Biweekly Games Data integrity against PRD v1.1 gates...");

// Gate 1: Multi-length expansive Tanglish dictionary
assert.ok(VALIDATED_TANGLISH_WORDS.length >= 300, `Expected at least 300 words, got ${VALIDATED_TANGLISH_WORDS.length}`);
for (const word of VALIDATED_TANGLISH_WORDS) {
  assert.ok(word.length >= 3 && word.length <= 7, `Tanglish word "${word}" length must be 3-7 letters`);
  assert.match(word, /^[A-Z]{3,7}$/, `Tanglish word "${word}" must be strictly A-Z`);
}
assert.ok(VALIDATED_TANGLISH_5_WORDS.length >= 113, `Expected at least 113 5-letter words, got ${VALIDATED_TANGLISH_5_WORDS.length}`);
console.log(`PASS: ${VALIDATED_TANGLISH_WORDS.length} Tanglish words (3-6+ letters) and ${VALIDATED_TANGLISH_5_WORDS.length} 5-letter seed words validated strictly as uppercase ASCII.`);

// Gate 2: Sollu biweekly editions & akshara counts
const tanglishLengthsSeen = new Set();
for (const edId of BIWEEKLY_EDITION_IDS) {
  const ed = SOLLU_BIWEEKLY_EDITIONS[edId];
  assert.ok(ed, `Missing Sollu biweekly edition ${edId}`);
  assert.ok(
    ed.tanglishWord.length >= 3 && ed.tanglishWord.length <= 6,
    `Edition ${edId} tanglishWord "${ed.tanglishWord}" must be between 3 and 6 letters`
  );
  assert.match(ed.tanglishWord, /^[A-Z]{3,6}$/);
  assert.ok(isValidSolluGuess(ed.tanglishWord), `Target word ${ed.tanglishWord} must be in valid dictionary`);
  tanglishLengthsSeen.add(ed.tanglishWord.length);

  const aksharas = splitTamilAksharas(ed.tamilAkshara.targetWord);
  assert.equal(
    aksharas.length,
    ed.aksharaCount,
    `Tamil word "${ed.tamilAkshara.targetWord}" split into ${aksharas.length} aksharas (${JSON.stringify(aksharas)}), expected ${ed.aksharaCount}`
  );

  // Verify all target letters are in keyboard
  for (const letter of aksharas) {
    assert.ok(
      ed.tamilAkshara.keyboardLetters.includes(letter),
      `Edition ${edId} keyboard missing target letter "${letter}"`
    );
  }

  console.log(`PASS: Edition ${edId} Sollu (${ed.tanglishWord} & ${ed.tamilAkshara.targetWord} -> [${aksharas.join(", ")}]: ${aksharas.length} aksharas) verified.`);
}
assert.deepEqual(
  Array.from(tanglishLengthsSeen).sort(),
  [3, 4, 5, 6],
  `Expected biweekly editions to span lengths 3, 4, 5, 6, got ${Array.from(tanglishLengthsSeen).sort()}`
);
console.log(`PASS: Biweekly Sollu editions span full range of 3, 4, 5, and 6 letters!`);

// Gate 3: Thodarpu categories & tiles
for (const edId of BIWEEKLY_EDITION_IDS) {
  const ed = THODARPU_BIWEEKLY_EDITIONS[edId];
  assert.ok(ed, `Missing Thodarpu biweekly edition ${edId}`);
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

// Gate 5: Tier 3 Semman Dark / Logo Chromatic Pink
assert.equal(THODARPU_TIER_COLORS[3].bg, "#D6459B", "Tier 3 background must be #D6459B");

// Gate 6: Backward Compatibility with legacy monthly keys
const legacyKeys = ["2026-10", "2026-11", "2026-12"];
for (const lk of legacyKeys) {
  assert.ok(SOLLU_MONTHLY_EDITIONS[lk], `Legacy Sollu key ${lk} must exist`);
  assert.ok(THODARPU_MONTHLY_EDITIONS[lk], `Legacy Thodarpu key ${lk} must exist`);
}
console.log("PASS: Legacy monthly edition aliases verified.");

// Gate 7: Aazham (ஆழம்) Rarest-Answer Trivia Editions Integrity
import("../src/data/aazhamData.ts").then(({ AAZHAM_BIWEEKLY_EDITIONS }) => {
  for (const [edId, edition] of Object.entries(AAZHAM_BIWEEKLY_EDITIONS)) {
    assert.ok(edition, `Missing Aazham edition ${edId}`);
    assert.equal(edition.prompts.length, 7, `Edition ${edId} must have exactly 7 prompts`);
    
    for (let i = 0; i < 7; i++) {
      const p = edition.prompts[i];
      assert.equal(p.order, i + 1, `Prompt ${p.id} must have order ${i + 1}`);
      assert.ok(p.titleEn && p.titleEn.trim().length > 0, `Prompt ${p.id} missing titleEn`);
      assert.ok(p.titleTa && p.titleTa.trim().length > 0, `Prompt ${p.id} missing titleTa`);
      assert.ok(p.obviousAnswer, `Prompt ${p.id} missing obviousAnswer`);
      assert.ok(p.trapAnswer, `Prompt ${p.id} missing trapAnswer`);
      assert.ok(p.answers.length >= 6, `Prompt ${p.id} must have at least 6 answers, got ${p.answers.length}`);

      const seenEntityIds = new Set();
      const tiersSeen = new Set();
      for (const ans of p.answers) {
        assert.ok(!seenEntityIds.has(ans.id), `Duplicate entity id "${ans.id}" in prompt ${p.id}`);
        seenEntityIds.add(ans.id);
        tiersSeen.add(ans.tier);
        assert.ok(ans.displayEn, `Entity ${ans.id} missing displayEn`);
        assert.ok(ans.displayTa, `Entity ${ans.id} missing displayTa`);
        assert.ok(Array.isArray(ans.aliases), `Entity ${ans.id} aliases must be array`);
      }
      assert.ok(tiersSeen.has(10), `Prompt ${p.id} missing Tier 10`);
      assert.ok(tiersSeen.has(15), `Prompt ${p.id} missing Tier 15 (Trap)`);
      assert.ok(tiersSeen.has(100), `Prompt ${p.id} missing Tier 100 (Valampuri)`);
    }
    console.log(`PASS: Edition ${edId} Aazham (7 prompts, verified tiers & entities) verified.`);
  }
  console.log("ALL BIWEEKLY GAMES DATA AUDIT GATES PASSED (D-11, D-12, D-13, AAZHAM RESOLVED)!");
});
