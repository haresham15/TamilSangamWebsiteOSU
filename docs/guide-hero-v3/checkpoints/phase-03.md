# Guide Hero v3 - Phase 3 checkpoint

**Gate result:** NEEDS HUMAN REVIEW

## Delivered

- A single data-owned rail in `guideRail.ts`: centripetal Catmull-Rom position, look-at, and focus curves plus scalar FOV, roll, exposure, bloom, drizzle, god-ray, handheld-amplitude, and departure-offset curves, all keyed to `p` in `[0, 1]`.
- One production `ScrollTrigger` with `scrub: 0.8` writes only a target progress value. The existing global Lenis integration publishes scroll updates; no additional Lenis instance, GSAP ticker, `requestAnimationFrame`, canvas, or GSAP camera tween was added.
- A master-tick system at order 45 critically damps target progress (`lambda = 6`). The R3F camera reads the damped progress during the existing render frame, applies rail position/FOV/aim/roll, and disables handheld drift under reduced motion.
- The board remains behind the protected `BoardRoot` adapter and appears only when the damped camera sequence reaches the board reveal beat. No flap-engine, atlas, instancing, or board-state behavior was changed.

## Choreography contract

```text
native scroll -> existing Lenis -> ScrollTrigger target p
                           -> masterTick damping -> StationCamera useFrame
                                                   -> rail sample -> R3F camera
```

This route intentionally has one scroll owner and one rendering path. Scrolling backward samples the same immutable rail at lower `p`; it does not replay a one-way GSAP camera animation.

## Automated rail evidence

The added Playwright rail contract samples 201 values across the full rail and verifies:

| Check | Requirement | Result |
|---|---|---|
| Positional continuity | max adjacent sample step < 0.70 world units | PASS |
| Look-at continuity | max adjacent angular change < 0.12 rad | PASS |
| Exact reverse | reverse samples equal their forward counterparts | PASS |
| Production scroll source | forward target reaches > 0.84; reverse returns to 0.08-0.20 | PASS in targeted Chromium run |

The targeted production assertion completed in 10.1 seconds before the local Playwright process failed to terminate cleanly. Re-running browser captures is currently blocked by the workstation's existing Chrome process pool: the Playwright runner launches but never receives a fresh browser context. The production server itself remains healthy (`GET /guide` returned HTTP 200), and TypeScript/lint/build are green.

## F6 evidence

The existing deterministic lab F6 image is retained at `docs/screenshots/guide-v3/phase-0b-board-f6-1440x900.png`. The lab test now also emits a focused Phase 3 rail artifact at `docs/screenshots/guide-v3/phase-3-f6-rail-1440x900.png` when the local browser runner is available.

Visual review notes for F6: the board is high-centred against the blue station hall and remains plainly separated from the luminous haze. The station presentation is intentionally restrained at this gate; FAQ content/reveal sequencing is deferred to Phase 4.

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| Targeted rail continuity test | PASS |
| Targeted production forward/reverse target-progress test | PASS (runner teardown issue after assertion) |
| Full Playwright screenshot suite | BLOCKED by local Chrome process-pool launch/teardown issue |

## Gate request

Please review the F6 composition and the rail behavior in `/guide`. The camera/scroll architecture and deterministic continuity checks are ready for approval. A fresh Chrome/Playwright session is still required to record the requested four-speed scrub capture and regenerate the focused F6 artifact; that limitation is recorded rather than waived.

No Phase 4 FAQ storage, APIs, schema, or local database work has started.
