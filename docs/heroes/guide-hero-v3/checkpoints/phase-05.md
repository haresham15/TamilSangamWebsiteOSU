# Guide Hero v3 - Phase 5 checkpoint

**Gate result:** NEEDS HUMAN REVIEW

## Delivered

- Tier C, user Lite mode, and reduced-motion now take a true no-WebGL path: the global canvas unmounts, the long 280/340dvh rail collapses to one 100dvh station poster, and no camera crane or flap cascade is requested.
- The fallback is original CSS artwork rather than stock imagery: pre-dawn haze, coach face, barred warm window, two generic silhouettes, and a CSS split-flap surface containing the current popular FAQ copy.
- Added a keyboard-visible `Skip station sequence` button. It becomes visible after two seconds, remains visible on keyboard focus, has a 48px minimum target, and uses the existing Lenis owner to reach the S4/S5 hand-off point without a scroll trap.
- Reduced-motion changes are observed after load. The fallback has no transition choreography, drizzle, handheld drift, or extended pinned journey.
- Lab query progress now uses the documented App Router query hook behind a Suspense boundary, eliminating stale captures between deterministic progress URLs.
- Camera diagnostics are owned by the one ScrollTrigger source as well as the render frame, so reverse scroll validation remains reliable when headless R3F frames are throttled.
- Replaced the remaining guide-scoped film-title DOM identifier with `guide-station-hero`; the guide source/test scope has no prohibited real railway or film-name matches.

## Accessibility and lifecycle audit

| Area | Evidence |
|---|---|
| Canvas alternative | Tier C browser test confirms CSS station poster is visible while `#gl-root canvas` is absent. |
| Semantics | Global canvas and decorative poster remain `aria-hidden`; the hero provides a semantic section and a polite live announcement. |
| Motion | `prefers-reduced-motion`, Lite mode, and Tier C remove WebGL progression and motion-heavy effects. |
| Touch/keyboard | Skip control has `min-h-12` and `focus-visible` ring; ordinary FAQ controls remain semantic buttons. |
| Off-screen/hidden work | Existing intersection observer withdraws station governor requests off-screen; the global governor returns Level 0 while `document.hidden`. |
| Cleanup | ScrollTrigger, master-tick registration, IntersectionObserver, timers, media listeners, Lenis, and R3F resource owners all have cleanup paths. |

## Verification

| Check | Result |
|---|---|
| `npm run lint` | PASS |
| `npm run build` | PASS |
| Full production Playwright guide suite | PASS - 9/9 in 2.5 minutes |
| Tier C no-WebGL browser contract | PASS |
| Tier C visual capture | PASS - `phase-5-tier-c-1440x900.png` |
| TypeScript | PASS through production build |
| Source IP sweep for guide scope | PASS - no guide-scoped film/real-railway identifiers remain |
| FAQ API privacy boundary | PASS from Phase 4: typed input, HMAC-only daily visitor key, transaction, dedupe/rate limit, rank-only response |

## Measured/known limits

- The full visual suite runs in Chromium. Safari, Firefox, Android device, Lighthouse, and representative M1/Android frame-time measurements require their respective external browsers/devices and are not claimed by this checkpoint.
- Local SQLite uses Node 22's currently experimental `node:sqlite` module. Its deployment runtime must remain Node 22 compatible or receive an approved storage adapter before public deployment.

## Gate request

Review the Tier C fallback capture and accept the documented device-browser/performance waivers, if appropriate. Phase 6 enhancements are explicitly optional; the required v3 phases are complete.
