# Games Page v1.1 Implementation Plan

Spec: PRD — Games Page v1.1 · The Sangam Arcade & Beach Blast Sequence (/games)
Plan details: docs/superpowers/plans/2026-10-26-games-v1-1.md

## Milestones

- [x] Milestone 1: Validated Games Data, Tamil Grapheme Splitter, Dictionary & Data Gate (`src/lib/tamilGraphemes.ts`, `src/data/solluDictionary.ts`, `src/data/gamesData.ts`, `scripts/verify-games-data.mjs`)
- [x] Milestone 2: Lens-Shifted Projection Math & Parity / Registration Scripts (`src/components/games-hero/camera/projectionMath.ts`, `scripts/verify-frame-parity.mjs`, `scripts/verify-lens-registration.mjs`, `src/components/games-hero/gamesRail.ts`)
- [x] Milestone 3: Calibrated J1 Coastal Compound Scene & Shaders (`src/components/games-hero/BeachCompoundScene.tsx`)
- [x] Milestone 4: 1:1 Foreground Eyeglasses & Sun-Bronzed Hand Rig (`src/components/games-hero/EyeglassHandRig.tsx`)
- [x] Milestone 5: Layered Focus Compositor & Sunblast Grade Profile (`src/components/games-hero/compositor/LayeredFocusCompositor.ts`, `src/components/games-hero/GamesFocusScene.tsx`)
- [x] Milestone 6: Scrubbable Missile Contrails, Blackbody Fireballs & Dual-Rail Portal (`src/components/games-hero/MissilePyroSystem.tsx`)
- [x] Milestone 7: NYT-Style Sangam Arcade Hub, Sollu & Thodarpu (`src/lib/gamesStorage.ts`, `src/components/games/SolluWordle.tsx`, `src/components/games/ThodarpuConnections.tsx`, `src/components/games/GamesHub.tsx`)
- [x] Milestone 8: Route, Navigation, Accessibility, Performance & E2E Verification (`src/app/games/page.tsx`, `src/components/global/FloatingNav.tsx`, `src/components/global/CommandPalette.tsx`, `src/app/sitemap.ts`)

## Hybrid cinematic implementation — 2026-10-27

Spec: [hybrid cinematic PRD](docs/heroes/games-hero-hybrid-cinematic-prd.md). Baseline: `3cad14a5f73835b2bde911a25f6c008a3e9fa0a9`.
Prior v1.1 milestones above describe earlier work; they do not approve hybrid art or production release.

1. Preserve baseline and record rights/tool availability → verify numeric contracts, unit tests, existing debug frames.
2. Implement route-local manifest/cache and coherent compositing → verify loader lifecycle, requested/displayed progress, contained framing and static/skip behavior.
3. Produce original calibrated media and foreground → validate files, provenance, budgets and inspect contact sheets; leave unmet art gates explicit.
4. Independently verify integration → typecheck, focused lint, build, desktop/mobile browser interactions, console/network and failure cases.
5. Record measured evidence and outstanding release gates in [implementation evidence](docs/heroes/games-hero-hybrid-cinematic-evidence.md). No deployment authorized.

## Fixed camera and smoother playback — subsequent user steering

This supersedes the original portal exit: keep camera stationary throughout, remove portal zoom, use ordinary document scrolling into the arcade, smooth hand motion, and deliver a genuinely changing explosion sequence.

1. Capture current Gemini-modified baseline and hashes → distinguish repeated stills from real animated frames and measure browser behavior.
2. Update owning runtime/camera paths and focused assertions → fixed camera, continuous foreground progress, ordinary arcade flow; preserve unrelated Gemini UI/Lite edits.
3. Regenerate calibrated original media → multiple unique blast frames, unchanged late background scale, valid dimensions/bytes and rights.
4. Verify final source/media together → desktop and 375px touch/Lite/reduced-motion/keyboard, reverse/skip, held-background foreground motion, console/network, cache bounds and measured rendering limitations.

Current ruling: camera never travels or shakes; hand follows requested continuous progress; image-dependent focus/light/lens/captions follow displayed sample progress. Final 149-frame render/encode and hash audit completed: `games-hybrid-f410c08628fed149`, 126 unique moving hashes, 7.60 MiB. Visibility preserves bounded resources and pauses startup deadline; offscreen reentry waits for fresh loaded state.

Verification completed on final source/media: 21 browser cases passed across bounded Iris Xe runs; isolated warm scrub measured p95 animation callback interval 16.9 ms and maximum observed moving-sample advance gap 200.2 ms. Actual WebGL draw FPS, physical Safari/Firefox, photoreal art approval and production hosting remain unverified. See implementation evidence for commands, artifacts and limits. No deployment performed.

## Approved hybrid optimization — October 27, 2026

Implement the hero-animation portions of [optimization PRD](docs/heroes/games-hero-hybrid-optimization-prd.md), using the v1.1 shot measurements while preserving existing hybrid architecture and fixed camera. Latest user steering explicitly excludes calendar, navigation, metadata and game UI.

1. Measure real composites, uploads, decode and pass costs; optimize measured texture churn → focused tests and hardware before/after evidence.
2. Refine existing foreground blur/reflections and original offline trails, dust, late heat and grounded debris → inspect exact progress previews, then verify all 149 samples, eight posters, calibration and byte budgets.
3. Verify motion, framing, focus and blast progression against the measured v1.1 composition, adapted to the established fixed-camera calibration.
4. Verify final source/media together → unit tests, typecheck, affected lint, production build, hardware browser lifecycle/static/deep-link/keyboard checks, measured limitations in separate evidence document.

Interfaces: foreground follows continuous requested progress; plate-dependent effects follow displayed progress. Reuse one texture and existing bounded cache; no extra canvas, ticker, background 3D or dependencies. All parent calendar/navigation/metadata changes and their new test were reverted on scope correction; preserve user work elsewhere. No commit, push or deployment authorized.

Implemented hero-scoped work and recorded final verification in [optimization evidence](docs/heroes/games-hero-hybrid-optimization-evidence.md). Other hero animations and shared infrastructure remain untouched. Strict frame-pacing and photographic/human-review gates remain unmet; implementation must not be described as fully performance-approved or reference-photorealistic.

## Games slow-motion pacing follow-up

User confirmed localhost playback, then requested seamless four-stage transitions and slow-motion scroll pacing. Games hero only.

1. Resume after returning from Skip → native-wheel forward/reverse and Skip-return browser regression; preserve static/debug behavior.
2. Retime existing calibrated shots with a monotone C1 curve → 640dvh desktop / 480dvh narrow landscape, with extra scroll distance for approach and blast; keep all camera/model/media calibration intact.
3. Crossfade existing captions and blend the final settled scene into arcade paper after progress .94 → pure pacing/weight tests and live browser review; reduced-motion/static/keyboard paths retained.
4. Verify Games source/tests/CSS, production build and affected browser paths. No other heroes or shared scrolling infrastructure changes.

Completed: 52 focused tests, six hardware Chromium browser checks, typecheck, affected lint, production build and scoped whitespace checks passed. Existing shared hydration and prior frame-pacing limits remain; no new FPS claim or deployment.

## Games hydration and frame-pacing fixes

User explicitly authorized the previously reported shared hydration and frame-pacing fixes. Preserve every other hero's animation behavior and the existing Games camera, media, calibration and scroll pacing.

1. Reproduce shared hydration differences and offscreen scroll work with regression cases against the completed baseline build.
2. Make initial canvas/reduced-motion markup deterministic; stop offscreen editorial-background updates that invalidate style during Games playback.
3. Compare isolated native-scroll composite timing on the same Iris Xe machine and protocol; investigate remaining hero-local bottlenecks from evidence.
4. Verify focused tests, shared/static/reduced/mobile/browser navigation, typecheck, affected lint and production build. Keep measured limitations explicit; no commit or deployment.

sort the pages out evently and sort the photos out in a better way.

incorporate the link tree.
