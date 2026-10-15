# Guide Hero v3 — Phase 2 checkpoint

**Gate result:** READY FOR HUMAN REVIEW

## Delivered

- A z-ordered, warm compartment window vignette on the hero coach: generated gradient backdrop, seat backs, ceiling fan, curtain, glass reflection, seven foreground bars, opaque frame, and a wet-platform spill.
- Two original analytic SDF silhouette placeholders generated at runtime—no stock photography, actor likeness, image asset, or external railway/film material. The figures sit at distinct depths and have a slow pose blend that freezes at the neutral pose under `prefers-reduced-motion`.
- Cone-confined, instanced drizzle plus a small instanced bokeh layer; both use the existing R3F render loop only and introduce no clock, canvas, or scroll owner.
- The original board is still hidden through F1–F4 and its protected engine contracts are unchanged.

## Window scene graph

```text
WindowAssembly (hero coach, x=-0.3 / y=2.25 / z=0.5)
├── emissive-style generated compartment gradient
├── seat-back / fan interior props
├── woman SDF plane (interior depth)
├── asymmetric curtain
├── cool glass reflection plane
├── seven metal bars
├── man SDF plane (exterior depth)
├── opaque window frame
└── progress-held warm spill decal on the wet platform

RainStreaks
├── WindowConeDrizzle — 96 instanced streaks
└── WindowRainBokeh — 16 instanced droplets
```

## Frame evidence

| Frame | Desktop | What it proves |
|---|---|---|
| F1 / p=0.00 | `phase-2-f1-1440x900.png` | Warm window is the brightest element; both crisp original figures are separated by the foreground bars. |
| F2 / p=0.14 | `phase-2-f2-1440x900.png` | Closer diagnostic framing retains the curtain, fan, rain, and silhouette readability. |
| F3 / p=0.30 | `phase-2-f3-1440x900.png` | The window reads as a warm jewel within the cool coach; wet spill/reflection is visible below. |
| F3 mobile | `phase-2-f3-390x844.png` | Portrait crop preserves the window, figures, bars, and spill without a plane-edge fringe. |

All captures live in `docs/screenshots/guide-v3/`.

## Automated luminance probe

The Playwright harness captures the F1 station view, decodes the generated PNG in a browser canvas, and checks the window and both figure samples:

| Sample | Relative luminance | Contract |
|---|---:|---|
| Compartment backdrop | 0.7105 | > 0.60 |
| Woman silhouette | 0.0846 | < 0.12 |
| Man silhouette | 0.0129 | < 0.12 |
| Backdrop-to-woman ratio | 5.19:1 | > 4.5:1 |
| Backdrop-to-man ratio | 10.06:1 | > 4.5:1 |

This is a visual regression guard, not a claim of final WCAG text contrast.

## Tier-A scene-budget sample

Captured at F1, 1440 × 900, through the existing global clock HUD:

| Metric | Sample | Phase target |
|---|---:|---:|
| Draw calls | 104 | ≤ 110 |
| Triangles | 5,746 | low-poly / bounded |
| GPU textures / geometry | 24 / 104 | generated textures only; no external image assets |
| Governor | Level 1 / 30 Hz | existing single-clock policy |

The headless Chromium frame-rate readout is not a product-GPU benchmark and is not used as an acceptance measure.

## Review notes

- No new Tamil strings were introduced, so there is no new Tamil-review ledger entry for this phase.
- `THREE_CJS_DEPRECATED` appears from the existing Playwright/CommonJS Three import path; the application build and all regression checks remain green.
- Camera rails, scroll ownership, departure animation, FAQ storage, and the local SQLite implementation remain intentionally deferred.

## Verification

| Check | Result |
|---|---|
| TypeScript | PASS — `npx tsc --noEmit` |
| Lint | PASS — `npm run lint` |
| Production build | PASS — `npm run build` |
| Board layout + FSM contracts | PASS — Playwright |
| F1–F3 desktop and F3 mobile captures | PASS — Playwright |
| Automated F1 silhouette luminance probe | PASS — Playwright |

## Gate request

Approve Phase 2 to proceed to Phase 3 only: replace the diagnostic rail sampler with damped camera rails fed by the existing master tick and ScrollTrigger/Lenis integration, then validate forward/reverse continuity. No data system changes will occur in Phase 3.
