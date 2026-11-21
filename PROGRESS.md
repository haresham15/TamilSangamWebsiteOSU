# Project Aintinai (ஐந்திணை) — Engineering Progress & Milestone Ledger

## Milestone: Kanchipuram Courtyard Refinement, Arcade Suite & Navigation Engine (November 2026)

- [x] **Master Kanchipuram Courtyard & Temple Stone System**:
  - Replaced legacy color schemes with a cohesive 4-pillar architectural palette across all 15 routes:
    - **Sunlit Temple Neutrals**: `--bg-ivory` (`#FAF6F0`), `--bg-sandstone` (`#F0E6D6`), `--surface-card-light` (`#FFFFFF`), `--surface-card-parchment` (`#F7EFE2`).
    - **Royal Deep Anchors**: `--bg-sangam-deep` (`#1C122B`), `--surface-card-dark` (`#271A3C`), `--bg-peacock-deep` (`#102830`), `--surface-card-peacock` (`#173640`).
    - **Hero Bridging & Accents**: `--accent-zari` (`#C79347`), `--accent-bronze` (`#9A6B3E`/`#D4A36A`), `--brand-teal` (`#0F766E`/`#2BB5A8`), `--accent-kumkum` (`#B84A39`).
    - **Ink & Typography**: High-contrast `--color-ink-earth` (`#261A14`) and `--color-ink-alabaster` (`#FAF5ED`).
  - **De-slopping & Anti-Slop Audit**: Stripped generic card clutters, un-tinted pure blacks (`#000000`), decorative emoji bullets, and generic gradient borders site-wide.
  - **Bilingual & Typography Integrity**: Strict enforcement of `lang="ta"`, `letterSpacing: 0`, and `leading-[1.6]` to `leading-[1.72]` on all Tamil typography using `Mukta Malar` with grapheme cluster segmentation via `Intl.Segmenter`.

- [x] **Sangam Arcade 12-Game Daily Suite (`/games`)**:
  - Expanded `/games` into a complete daily cultural games portal framed in deep peacock stone (`--bg-peacock-deep`).
  - Implemented 12 interactive games including Sollu (Tamil Wordle), Thodarbu (Connections), Kolam Path Solver, Thirukkural Memory, and Tamil crossword puzzles.
  - Grounded with full keyboard navigation, touch responsiveness, accessible aria landmarks, and state persistence.

- [x] **Photo Vault Studio Envelopes & Year Ledger (`/gallery`)**:
  - Redesigned `/gallery` with tactile Kanchipuram silk and parchment paper envelopes featuring string-and-washer clasps.
  - Integrated authentic Polaroid scatter previews on hover/tap.
  - Added archival year ledger and direct links to Google Photos external vaults via `<VaultGateway>`.

- [x] **Progress-Driven Kolam Page Loader (`KolamLoader.tsx`)**:
  - Refactored page loader from an abrupt spinner to an unspooling Brahmamudi knot geometric weaving animation.
  - Animated with SVG `pathLength: 0 → 1` and real-time telemetry (stage, coordinates, percentage counter) and cultural aphorisms.

- [x] **Working Sikku Kolam Dual-Trigger Navbar (`Navbar.tsx` & `navRoutes.ts`)**:
  - **Root Cause Fix**: Removed an erroneous `useEffect` in `Navbar.tsx` that auto-closed the menu upon opening while in the hero zone (`scrollY === 0`). Replaced with non-blocking delta scroll evaluation.
  - **Dual-Trigger Activation**: Converted the collapsed active context pill into a clickable `<motion.button>` with hover effects and aria-label so clicking either the context pill OR the Brahmamudi knot toggle opens the menu.
  - **8 Prioritized Primary Routes**: Streamlined navigation routes by collegiate necessity:
    1. `/` (Home)
    2. `/events` (Events)
    3. `/about` (About)
    4. `/board` (Board)
    5. `/games` (Games — with badge)
    6. `/guide` (Guide)
    7. `/links` (Links)
    8. `/suggestions` (Suggestions — community proposals & feedback)
    *(Dedicated CTA: `/join` Join the Hearth ↗; Secondary routes: `/gallery`, `/events/namma-deepavali-2026`, `/faq`).*
  - **Fluid Physics & Mobile Drawer**: Added `borderRadius: isOpen ? 24 : 9999` morphing with spring physics (`stiffness: 260, damping: 26`), unrolling the 4-petal knot into a clean "X" close icon, and implemented a comfortable $4 \times 2$ mobile grid with `max-h-[75vh] overflow-y-auto`.
  - **Automated Unit Testing**: Updated `SikkuKolamToggle.test.ts` to assert 8 primary routes, games badge, and renamed Suggestions route (passed 3/3).
  - **Vercel Production Deployment**: Fully verified live on `https://tamil-sangam-website-osu.vercel.app/`.

---

## Historical Ledger: Games Page v1.1 & Cinematic Hybrid (October 2026)

- [x] Milestone 1: Validated Games Data, Tamil Grapheme Splitter, Dictionary & Data Gate.
- [x] Milestone 2: Lens-Shifted Projection Math & Parity / Registration Scripts.
- [x] Milestone 3: Calibrated J1 Coastal Compound Scene & Shaders.
- [x] Milestone 4: 1:1 Foreground Eyeglasses & Sun-Bronzed Hand Rig.
- [x] Milestone 5: Layered Focus Compositor & Sunblast Grade Profile.
- [x] Milestone 6: Scrubbable Missile Contrails, Blackbody Fireballs & Dual-Rail Portal.
- [x] Milestone 7: NYT-Style Sangam Arcade Hub, Sollu & Thodarpu.
- [x] Milestone 8: Route, Navigation, Accessibility, Performance & E2E Verification.
- All 8 Milestones Completed and Verified!

### Hybrid cinematic implementation — 2026-10-27

- Baseline revision: `3cad14a5f73835b2bde911a25f6c008a3e9fa0a9`; feature branch `feat/games-hybrid-cinematic`. Prior v1.1 completion above remains historical.
- Baseline native checks passed: `npm.cmd test -- --reporter=dot` (12 files, 71 tests); `verify-frame-parity.mjs`, `verify-lens-registration.mjs`, `verify-games-hero.mjs` with Node type stripping.
- Context-mode batch execution timed out; native commands provide actual baseline evidence. Existing Next dev server on `http://localhost:3000` reused; second server was refused by Next's development lock.
- Runtime, asset production and independent browser QA in progress. Production art/performance acceptance remains open; see [evidence](docs/heroes/games-hero-hybrid-cinematic-evidence.md).
- First independent Chromium browser subset passed: missing-manifest fallback, keyboard skip focusing `#arcade`, playable Thodarpu tab and context-loss fallback. Full media/static matrix awaits generated original posters/sequence.

### Approved hybrid optimization — October 27, 2026

- Preserved source/media baseline in TEMP; user’s October Thodarpu CHAI content change remains untouched. Specialists own hero runtime, original offline media and independent browser evidence; parent owns hero integration and review.
- Measured repeated plate texture allocation; final candidate reuses one GPU texture. Hero-local completed-composite/upload/pass diagnostics provide actual measurements; shared legacy timer-based HUD is unchanged. Intermediate hardware browser matrix passed 22 cases before unrelated shared-canvas changes; no texture-upload speed gain has been established.
- Installed verified `games-hybrid-4f58ef6abe6ce549`: 149 frames, 7,999,474 bytes (7.63 MiB), 126 unique moving hashes and eight posters. Faint persistent volumetric trails, cooler late soot, grounded dust/debris and selected existing-set details preserve early fire, camera and the unchanged hand/model/maps. Fresh Gaussian blur removes disc-sampling ghosts/grain; foreground focus now follows the v1.1 soft-entry/sharp-J2/soft-J3 schedule.
- Latest user steering restricts all work to Games hero animation and v1.1 shot measurements, explicitly excluding every other hero. Reverted every parent calendar/game UI/navigation/metadata change and removed the parent calendar test; preserved user work. Shared HUD/renderer changes were fully reverted. No other hero animation was edited by this optimization.
- Final unmodified browser matrix reports 16 passes/six failures; each failure is the existing shared GlobalCanvas hydration mismatch, reproduced on an independent route and on static visits with zero cinematic requests. Hero functional assertions and neutral-ramp/stable-texture checks passed before those error assertions. Shared source remains untouched under the user's scope restriction.
- Fresh parent checks passed: 34 hero unit tests, typecheck, affected-file ESLint, asset self-check, production build including numeric/149-frame verification, scoped whitespace checks and 14 local documentation links. Full `npm test` passed 110 assertions/16 files but failed discovery for two unrelated non-Vitest suite files; no runner changes made. Production smoke verified loaded revision, native close-up/blast progression, no failed media, no development hook and skip focus; retained one shared React #418 error.
- Three isolated development runs measured 60.24 median composites/s with 28–29 1% lows; strict 45-low and 33 ms ignition gates remain unmet. A separate native-scroll production control measured 59.88 median and 5.79 1% low including three large pauses; no speedup or complete performance acceptance claimed. Exploratory tracing points to native-scroll style/layout work without proving a full cause. Detailed protocols/limits are in the optimization evidence; no other hero/shared infrastructure edits were made.
- Independent runtime review found no blocking regression. Art/reference-anatomy approval, physical Safari/Firefox, Tier B performance and final measured J3 halo/edge gates remain open. All task render/browser/production-smoke jobs stopped; no commit or deployment.
