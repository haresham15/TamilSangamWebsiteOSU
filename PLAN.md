# Project Aintinai (ஐந்திணை) — Master Architecture & Implementation Plan

This document tracks the phased milestones, architectural specifications, and implementation roadmap for the OSU Tamil Sangam digital platform (`tamil-sangam-website-osu`).

---

## Current Roadmap & Completed Epics

### Epic 1: Thematic Cultural Refinement & De-slopping (Shipped & Verified)
- [x] **Kanchipuram Courtyard & Temple Stone Color System**:
  - Implemented the 4-pillar architectural palette across all 15 routes (`--bg-ivory`, `--bg-sandstone`, `--bg-sangam-deep`, `--bg-peacock-deep`, `--accent-zari`, `--accent-bronze`, `--brand-teal`, `--accent-kumkum`).
- [x] **Anti-Slop Audit & Content De-slopping**:
  - Removed generic card enclosures, repetitive 1px borders, un-tinted pure blacks (`#000000`), generic purple-indigo gradients, and decorative emoji bullets site-wide.
  - Replaced with editorial whitespace, asymmetric typography, and authentic Dravidian motifs.
- [x] **Bilingual Integrity & Tamil Grapheme Precision**:
  - Guaranteed `lang="ta"`, `letterSpacing: 0`, and line-height $\ge 1.6$ across all Tamil script elements.
  - Enforced `Intl.Segmenter` grapheme cluster splitting for kinetic text to prevent Unicode conjunct destruction.

### Epic 2: Photo Vault Tactile Studio Envelopes (`/gallery`) (Shipped & Verified)
- [x] **Studio Envelopes & String-and-Washer Clasps**:
  - Replaced flat photo grids with tactile Kanchipuram silk and parchment paper envelopes.
- [x] **Randomized Polaroid Scatter Previews**:
  - Hover/tap reveals authentic Polaroid prints with date stamps and location stamps.
- [x] **Archival Year Ledger**:
  - Organized memory vaults by academic year (2024-2025, 2025-2026, 2026-2027) with seamless navigation to external Google Photos vaults via `<VaultGateway>`.

### Epic 3: Sangam Arcade 12-Game Daily Suite (`/games`) (Shipped & Verified)
- [x] **Peacock Stone Arcade Frame**:
  - Set the entire arcade experience in rich deep peacock stone (`--bg-peacock-deep`).
- [x] **12 Daily Cultural Games**:
  - Sollu (Tamil Wordle), Thodarbu (Connections), Kolam Path Solver, Thirukkural Memory, and Tamil crossword suites.
  - Complete with state persistence, streak tracking, keyboard accessibility, and bilingual feedback.

### Epic 4: Progress-Driven Kolam Page Loader (`KolamLoader.tsx`) (Shipped & Verified)
- [x] **Brahmamudi Knot Weaving**:
  - Replaced jarring full-screen flash spinners with continuous geometric rice-flour thread weaving using SVG `pathLength: 0 → 1`.
- [x] **Telemetry & Aphorisms**:
  - Live progress counter with stage telemetry (coordinates, node completion percentage) and rotating classical aphorisms.

### Epic 5: Sikku Kolam Dual-Trigger Unraveling Navbar (Shipped & Verified)
- [x] **Hero-Zone Auto-Collapse Bug Elimination**:
  - Removed erratic zero-scroll closing logic; implemented continuous delta scroll evaluation.
- [x] **Dual-Trigger Activation**:
  - Both the collapsed active context pill and the 4-petal Brahmamudi knot toggle open the navigation menu.
- [x] **8 Prioritized Primary Routes**:
  - Streamlined routes by collegiate necessity:
    1. `/` (Home)
    2. `/events` (Events)
    3. `/about` (About)
    4. `/board` (Board)
    5. `/games` (Games — with badge)
    6. `/guide` (Guide)
    7. `/links` (Links — Bio Hub)
    8. `/suggestions` (Suggestions — proposals & feedback)
    *(Dedicated CTA: `/join` Join the Hearth ↗; Secondary routes: `/gallery`, `/events/namma-deepavali-2026`, `/faq`).*
- [x] **Mobile 2-Column Responsive Drawer**:
  - Clean $4 \times 2$ grid with `max-h-[75vh] overflow-y-auto` and smooth spring physics (`stiffness: 260, damping: 26`).
- [x] **Automated Unit Testing & Production Deployment**:
  - 3/3 tests passing in `SikkuKolamToggle.test.ts`. Verified live on Vercel production.

---

## Historical Milestones: Games Page v1.1 & Cinematic Hybrid

- [x] Milestone 1: Validated Games Data, Tamil Grapheme Splitter, Dictionary & Data Gate (`src/lib/tamilGraphemes.ts`, `src/data/solluDictionary.ts`, `src/data/gamesData.ts`, `scripts/verify-games-data.mjs`)
- [x] Milestone 2: Lens-Shifted Projection Math & Parity / Registration Scripts (`src/components/games-hero/camera/projectionMath.ts`, `scripts/verify-frame-parity.mjs`, `scripts/verify-lens-registration.mjs`, `src/components/games-hero/gamesRail.ts`)
- [x] Milestone 3: Calibrated J1 Coastal Compound Scene & Shaders (`src/components/games-hero/BeachCompoundScene.tsx`)
- [x] Milestone 4: 1:1 Foreground Eyeglasses & Sun-Bronzed Hand Rig (`src/components/games-hero/EyeglassHandRig.tsx`)
- [x] Milestone 5: Layered Focus Compositor & Sunblast Grade Profile (`src/components/games-hero/compositor/LayeredFocusCompositor.ts`, `src/components/games-hero/GamesFocusScene.tsx`)
- [x] Milestone 6: Scrubbable Missile Contrails, Blackbody Fireballs & Dual-Rail Portal (`src/components/games-hero/MissilePyroSystem.tsx`)
- [x] Milestone 7: NYT-Style Sangam Arcade Hub, Sollu & Thodarpu (`src/lib/gamesStorage.ts`, `src/components/games/SolluWordle.tsx`, `src/components/games/ThodarpuConnections.tsx`, `src/components/games/GamesHub.tsx`)
- [x] Milestone 8: Route, Navigation, Accessibility, Performance & E2E Verification (`src/app/games/page.tsx`, `src/components/navigation/Navbar.tsx`, `src/app/sitemap.ts`)
