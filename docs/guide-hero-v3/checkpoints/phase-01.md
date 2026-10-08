# Guide Hero v3 — Phase 1 checkpoint

**Gate result:** READY FOR HUMAN REVIEW

## Locked implementation decisions

- The existing 30 × 5 split-flap board remains untouched and is framed as the station board.
- Grade is pre-dawn blue hour. `design/tokens.json` and `src/app/globals.css` now establish the station’s fog, haze, coach, platform, practical, and rim-light tokens in OKLCH.
- The board is retained in the scene graph at `(0, 14, -6)` with `fog:false`; it is only visible from the F5 reveal hold onward.
- The station lab renders through the existing persistent `GlobalCanvas` and its existing master clock. It adds neither a canvas nor a render/timing loop.
- Phase 1 deliberately excludes the window assembly, figures, drizzle, rail damping, scroll choreography, and FAQ/database work.

## Static scene graph

```text
StationScene
├── StaticStationCamera (diagnostic rail sampler only)
├── global fog + hemisphere / rim / practical / spill lights
├── WetPlatform
│   ├── wet concrete plane and puddle cards
│   ├── tactile edge and warm spill decal
│   └── bench
├── HeroCoach
│   ├── closed body shell, curved roof, cream band, shutter panels
│   ├── doors, louvres, underframe, bogies, wheels, and couplers
│   └── cool wet-surface response
├── NeighbourCoach × 2 (fog-tinted depth copies)
├── StationHall
│   ├── pitched steel trusses and columns
│   └── repeated pre-dawn practicals
├── LuminousHaze (overlapped fog cards)
├── FarStation (hall, columns, distant platform glow)
├── BoardHangers
└── BoardRoot (preserved board engine; fog disabled)
```

## Frame evidence

| Frame | Desktop | Mobile | Acceptance observation |
|---|---|---|---|
| F4 / p=0.50 | `phase-1-f4-1440x900.png` | `phase-1-f4-390x844.png` | Board held out; coach, wet platform, trusses, and fog depth establish the pre-dawn hall. |
| F5 / p=0.70 | `phase-1-f5-1440x900.png` | `phase-1-f5-390x844.png` | Rafters and luminous depth frame the shot; the board has only begun to enter from the lower frame. |

The captures live in `docs/screenshots/guide-v3/` and intentionally use `?p=<value>` rather than `?debug=…` so the global developer HUD is absent from visual evidence.

## Scene-budget sample

Captured at Tier A, 1440 × 900, F5 (`p=0.70`) in Chromium with the existing global clock HUD:

| Metric | Sample | Phase target |
|---|---:|---:|
| Draw calls | 49 | ≤ 110 |
| Triangles | 5,966 | bounded; low-poly diorama |
| GPU textures / geometry | 21 / 50 | no texture-heavy station asset added |
| Governor | Level 1 / 30 Hz | existing single-clock policy |

The headless browser’s reported frame rate is intentionally not treated as a product FPS measurement; it is software-WebGL, not a GPU benchmark.

## Verification

| Check | Result |
|---|---|
| TypeScript | PASS — `npx tsc --noEmit` |
| Lint | PASS — `npm run lint` |
| Production build | PASS — `npm run build` |
| Protected board layout + FSM contracts | PASS — Playwright harness |
| F4/F5 desktop + mobile capture | PASS — Playwright, four captures written |
| F6 board mount | PASS — Playwright |

## Gate request

Approve Phase 1 to begin Phase 2 only: the original window assembly, generic SDF silhouette placeholders, lighting/spill, drizzle, and the required contrast probe. Camera choreography, the local SQLite FAQ system, and final accessibility/post work remain deferred to their assigned phases.
