# Guide Hero v3 — Phase 0B checkpoint

**Gate result:** NEEDS HUMAN REVIEW

## Locked decisions

- Grade: pre-dawn blue hour.
- Station: fictional Sangam Junction.
- Departure beat: enabled for Tier A desktop, disabled for reduced motion.
- Artwork: original generic silhouette placeholders until approved art is supplied.
- Engagement storage: local repository-owned SQLite implementation in Phase 4, using Node's built-in `node:sqlite`; its database files remain under the already-ignored `data/` directory.

## Delivered

- `BoardRoot` is the station-safe composition seam. It preserves the chassis, atlas, cells, cell material, geometry, FSM, audio, layout, and Zustand contracts, while allowing world placement and a fog policy.
- The lab route is available at `/guide/lab?debug=p=0.9`; its metadata excludes it from indexing.
- `guideRail.ts` contains the approved pre-dawn rail keyframes and a diagnostic sampler. Phase 3 replaces the sampler with Catmull-Rom rails and damping.
- The lab uses the persistent `GlobalCanvas`, `View`, and governor only. No additional canvas, Lenis instance, GSAP ticker, or requestAnimationFrame loop was added.
- A Tier C poster slot and an initial Playwright harness are in place.

## Verification

| Check | Result |
|---|---|
| Board layout and FSM contracts | PASS — Playwright unit harness |
| Lab F6 debug route and board mount | PASS — Chromium at 1440×900 |
| TypeScript | PASS — `npx tsc --noEmit` |
| Lint | PASS — `npm run lint` |
| Production build | PASS — `npm run build` |
| Visual inspection | PASS for Phase 0B framing; see `docs/screenshots/guide-v3/phase-0b-board-f6-1440x900.png` |

## Important findings

1. `GradeStack` renders after a default-index Drei `View` and obscures that view. The lab's `View index={2}` confirms the board renders when scheduled after the composer. Phase 1 must record the production composition decision before any station-specific post-processing work.
2. The protected board engine currently supports a maximum of 150 cells and layouts for 30×5, 24×6, and 14×9. The v3 PRD requests 22×8 (176 cells). This cannot be satisfied while preserving the current engine unchanged.

## Required decision before Phase 1

Choose one:

1. Preserve the protected 30×5 board grid and adapt the station framing around it.
2. Explicitly amend the protected-board constraint to allow a separately tested capacity/layout extension for 22×8.

## Deferred work

- Static environment, token additions, original silhouette assets, cinematic rails, FAQ APIs and local SQLite schema, accessibility completion, and all final performance measurements remain outside Phase 0B.
