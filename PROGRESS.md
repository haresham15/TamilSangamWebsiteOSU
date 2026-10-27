# Games Page v1.1 Progress

- [x] Milestone 1: Validated Games Data, Tamil Grapheme Splitter, Dictionary & Data Gate.
- [x] Milestone 2: Lens-Shifted Projection Math & Parity / Registration Scripts.
- [x] Milestone 3: Calibrated J1 Coastal Compound Scene & Shaders.
- [x] Milestone 4: 1:1 Foreground Eyeglasses & Sun-Bronzed Hand Rig.
- [x] Milestone 5: Layered Focus Compositor & Sunblast Grade Profile.
- [x] Milestone 6: Scrubbable Missile Contrails, Blackbody Fireballs & Dual-Rail Portal.
- [x] Milestone 7: NYT-Style Sangam Arcade Hub, Sollu & Thodarpu.
- [x] Milestone 8: Route, Navigation, Accessibility, Performance & E2E Verification.
- All 8 Milestones Completed and Verified!

## Hybrid cinematic implementation — 2026-10-27

- Baseline revision: `3cad14a5f73835b2bde911a25f6c008a3e9fa0a9`; feature branch `feat/games-hybrid-cinematic`. Prior v1.1 completion above remains historical.
- Baseline native checks passed: `npm.cmd test -- --reporter=dot` (12 files, 71 tests); `verify-frame-parity.mjs`, `verify-lens-registration.mjs`, `verify-games-hero.mjs` with Node type stripping.
- Context-mode batch execution timed out; native commands provide actual baseline evidence. Existing Next dev server on `http://localhost:3000` reused; second server was refused by Next's development lock.
- Runtime, asset production and independent browser QA in progress. Production art/performance acceptance remains open; see [evidence](docs/heroes/games-hero-hybrid-cinematic-evidence.md).
- First independent Chromium browser subset passed: missing-manifest fallback, keyboard skip focusing `#arcade`, playable Thodarpu tab and context-loss fallback. Full media/static matrix awaits generated original posters/sequence.

## Fixed camera and smoother playback — subsequent user steering

- Reinspected working tree after Gemini changes; unrelated `src/components/ui/react-bits/*`, `src/context/LiteModeContext.tsx`, and new game thumbnails remain outside QA edit scope.
- Current manifest baseline: `games-hybrid-2a7aee909b824ace`, 130 samples, 5,866,044 sequence bytes. SHA-256 audit: 36 files in `[0.64,0.85)` contain only one unique image; 15 files in `[0.85,0.94)` also contain only one unique image. The baseline does not contain the requested changing blast animation.
- Existing `http://127.0.0.1:3000/games` responds; 3100 is absent. Fresh real-media `.42`/`.72`/`.93` captures and browser interval sampling are in progress. Prior intercepted pilot images are separate historical diagnostics.
- Stale server was subsequently verified/restarted with authorization. Fresh task server is `http://127.0.0.1:3100`; real current-media debug captures succeeded and showed the legacy baked zoom that regeneration must replace.
- Revised runtime browser subset: eight functional checks passed, including actual hand movement while a background plate is held. Ordinary-flow ninth case needs rerun after fixing its premature dynamic-hero query. All task Chromium instances closed during final media rendering to free graphics resources; final full matrix waits for asset-ready signal.
- Parent reports revised camera/hand assertions and 82 unit checks passing; source typegen fixed transient generated-route errors, with fresh typecheck/lint passing. Final independent browser evidence remains separate from those reported source checks.
- Runtime now fixes camera/projection throughout; removes portal hand zoom and transformed arcade handoff; uses continuous requested hand progress with displayed-media focus/light/lens/captions. Loaded-state guards prevent disposed-resource reuse on offscreen reentry; hidden startup deadlines pause and resume. New browser cases cover these lifecycles after final media encoding.
- New original 149-frame batch in progress. Final unique blast hashes, fixed-scale late landmarks, byte totals and warm browser measurements pending; no production-art/performance acceptance claimed.
