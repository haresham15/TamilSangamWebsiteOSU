---
name: tamil-text
description: Rules for rendering, animating, and rasterizing Tamil text on the web. Use whenever Tamil script appears in UI, animation, canvas, WebGL, or OG images.
---

# Tamil Typography & Text Engineering Skill

## Core Directives

1. **HTML & CSS Requirements**:
   - Set `lang="ta"` on all Tamil text spans and blocks.
   - Use `letter-spacing: 0` unconditionally on Tamil script. Never add positive tracking on Tamil text, as it breaks grapheme conjuncts and vowel sign connections (e.g. "த மி ழ்").
   - Never apply `text-transform: uppercase` or `lowercase` on Tamil text.
   - Maintain body `line-height` of at least 1.6 to prevent vowel signs (கொம்பு, சுழி, புள்ளி) from clipping.

2. **Font Subsetting & Selection**:
   - Verify the chosen display and body fonts have native Tamil glyphs at every used font weight.
   - Subset fonts strictly by Unicode range `U+0B80-0BFF`.
   - Self-host fonts via `next/font` for zero layout shifts and instant preloading.

3. **Motion & Split-Text Engineering**:
   - Never split Tamil text by raw character index or string code units (`str.split("")`).
   - Always segment with `new Intl.Segmenter("ta", { granularity: "grapheme" })` to ensure complex conjuncts (க்ஷ, ஸ்ரீ) and multi-part vowels (கொ, கௌ) remain intact as single atomic visual units.

4. **Canvas & WebGL Textures**:
   - Draw all Tamil textures using Canvas 2D only after `await document.fonts.ready` resolves, allowing the browser's native text shaper to correctly render Indic glyph ligature forms.
   - For extruded 3D Tamil geometry: shape at build time with HarfBuzz (WASM) into SVG paths before creating Three.js `ExtrudeGeometry`. Never use `TextGeometry` or `typeface.json` for Indic scripts.

5. **Linguistic Integrity**:
   - Never modify the semantic meaning of Tamil copy during technical edits.
   - Log any ambiguous Tamil dates, festival names, or transliterations into `docs/redesign/tamil-review.md` for native speaker review.
