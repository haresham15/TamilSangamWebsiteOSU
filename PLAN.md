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

Current ruling: camera never travels or shakes; hand follows requested continuous progress; image-dependent focus/light/lens/captions follow displayed sample progress. New 149-frame render/encode and hash audit remain pending. Visibility preserves bounded resources and pauses startup deadline; offscreen reentry must wait for fresh loaded state.
