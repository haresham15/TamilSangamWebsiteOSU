# Games hybrid cinematic implementation evidence

Date: 2026-10-27. Baseline source: `3cad14a5f73835b2bde911a25f6c008a3e9fa0a9`. Branch: `feat/games-hybrid-cinematic`.
Requirements: [production PRD](games-hero-hybrid-cinematic-prd.md). This report distinguishes engineering checks from art and production approval.

## Baseline

- Existing working tree initially contained only the untracked production PRD. No runtime edits were reverted.
- `npm.cmd test -- --reporter=dot`: 12 test files, 71 tests passed.
- `node --experimental-strip-types scripts/verify-frame-parity.mjs`: existing landmark tolerance checks passed.
- `node --experimental-strip-types scripts/verify-lens-registration.mjs`: all seven existing viewport contracts passed.
- `node --experimental-strip-types scripts/verify-games-hero.mjs`: registration, deterministic reverse scrub, focus transfer, locked camera and portal centering passed.
- Node emitted existing experimental type-stripping and typeless-package warnings; no failures in these numeric checks.
- Context-mode batch execution timed out; results above come from subsequent native commands.
- Existing Next development server at `http://localhost:3000` reused. Installed Chromium `1161` is available; current Firefox, actual-device Safari and Apple touch/memory testing are not established.

## Implementation evidence

Integration checks and browser captures pending. Source code alone does not establish anatomical quality, camera-plate alignment, flash safety, physical-device performance or production readiness.

- Initial browser probe used Chromium `134.0.6998.35`, headless SwiftShader, `1912×800`, while implementation files were changing. It is not a pristine baseline capture. Manifest/posters had not yet been generated, so all four debug requests fell back to static, reported displayed progress `0.000`, and the poster was missing. Two Fast Refresh errors (`Cannot read properties of undefined (reading 'image')`) occurred during intermediate edits; final clean-navigation results must replace this provisional observation.
- Provisional captures and metadata: `%TEMP%/games-hybrid-qa/baseline-*.png`, `%TEMP%/games-hybrid-qa/baseline.json`. The filenames are historical; they do not establish source-baseline or art parity.
- Focused browser regression spec added at `tests/games-hybrid.spec.ts`; actual completed runs are recorded below when media is available. Local Chromium requires an external temporary Playwright config pointing at installed Chromium 1161; repository config remains portable.
- First focused browser subset passed: missing-manifest static fallback, keyboard skip focused `#arcade`, the Thodarpu tab exposed its playable shuffle control, and WebGL context-loss fallback preserved skip. Command: `node node_modules/playwright/cli.js test --config %TEMP%/games-hybrid.playwright.config.cjs --grep 'missing manifest|context loss'`. Chromium `134.0.6998.35`, software SwiftShader, `1912×800`. This subset deliberately does not establish media quality or animation readiness.
- Browser spec lint passed using `node node_modules/eslint/bin/eslint.js tests/games-hybrid.spec.ts` before the final additional cases; final lint remains to rerun.
- Stalled-media regression initially failed because explicit skip deferred focus until Lenis completion. Runtime now focuses `#arcade` before scrolling; fresh focused browser rerun passed (1/1, 5.2 s runner duration). The manifest request was deliberately left pending; arcade access did not wait for its deadline.
- A temporary in-memory feasibility manifest combined the actual earlier Blender `preview-0.42.png` with the real 977,736-byte foreground GLB. This diagnostic is not final sequence evidence. It exposed a visually blank output despite `data-media-state=ready`: an opaque stage at z-index 10 hid the shared canvas at z-index 1. Runtime removed that covering background and retained bars outside the canonical rectangle. A subsequent actual capture visibly contained the plate and hand. Browser coverage now checks transparent stage background and nonuniform actual screenshot pixels, in addition to readiness attributes.
- Feasibility capture: `%TEMP%/games-hybrid-qa/pilot-0.42.png`; metadata at the matching `.json`. Intercepted fixture revision `qa-feasibility-only-0e338ef4e77e`, Chromium `134.0.6998.35`, `1912×800`, displayed/requested progress `0.420`, frame/drawn index `2`, decoded cache `4`, pending `0`, no page/console errors. One aborted initial manifest reflected development effect cleanup. The latest screenshot at this filename replaced the initially blank attempt.
- Visual comparison against the improved offline `poster-landscape-1.png` found substantially darker live finger undersides and eyewear with weak readable reflection, plus a differently bent left glasses temple. No cropped forearm boundary was visible at this checkpoint. These observations are not close-up art approval; matched lighting/materials and complete-path inspection remain required.

## Work-package status

| PRD package | Evidence achieved | Remaining gate |
| --- | --- | --- |
| 0. Baseline and rights | Source revision and passing baseline unit/numeric checks recorded | Pristine visual baseline was not captured before edits; inspect final provenance register |
| 1. Hybrid feasibility | Route-local loader/compositor and canonical rectangle implemented; skip/failure subset exercised | Inspect calibrated plates, contained framing and color-ramp comparison with media present |
| 2. Hand close-up | Foreground asset loading and failure fallback implemented | Approve anatomical GLB, textured skin, grip, budget and `p=0.42` composite |
| 3. Environment still | Offline production pipeline being authored | Approve original `p=0.10` geometry, materials, contact shadows and landmarks |
| 4. Explosion preview | Progress-derived runtime integration preserves existing impact contracts | Approve cached simulation, three plumes, dust and exit at `p=0.72`/`0.93` |
| 5. Delivery pilot | Bounded decoded-cache implementation and focused tests added | Independently run full focused suite; inspect ten encoded moving samples and stale-load browser behavior |
| 6. Final media | Delivery manifest/validation tooling being authored | Final files, dimensions, byte totals, licenses and all exact samples |
| 7. Integration and QA | Missing-media/context-loss/keyboard-skip subset passed | Full browser matrix, live original media, reverse cycles, performance and physical-device evidence |

## Release gates still requiring evidence

- Approved original keyframes and anatomical textured hand at `p=0.42`.
- Reproducible offline scene, baked gas simulation, final calibrated exit travel, matched foreground lighting and original source rights.
- Neutral-ramp/skin/sky color comparison and clean alpha edges.
- Measured sequence/foreground bytes, decoded cache and graphics-memory accounting, warm scrub frame intervals and visible sample advancement.
- Full browser/failure/accessibility matrix including Firefox and actual-device Safari.
- Hosting capacity and separately authorized deployment of tested source/media revision.

## Subsequent steering: fixed camera and smoother playback

The user's later request supersedes the portal camera/overlay handoff in the original PRD: camera stays fixed, hand motion remains smooth, explosions visibly evolve, and the arcade follows ordinary scrolling. Earlier numeric portal passes above remain historical baseline evidence, not acceptance of this revised behavior.

Reinspection preserved unrelated Gemini edits in `src/components/ui/react-bits/*`, `src/context/LiteModeContext.tsx`, and newly added game thumbnails. QA owns browser coverage and this evidence; camera/runtime and media generation have separate owners.

Current baseline manifest `games-hybrid-2a7aee909b824ace` contains 130 samples and 5,866,044 declared sequence bytes. An independent SHA-256 audit found only one unique image across all 36 blast files with `0.64 ≤ p < 0.85`, and one unique image across all 15 files with `0.85 ≤ p < 0.94`. Distinct filenames/progress values therefore do not establish changing animation. Final media must replace this repeated-still baseline and pass a uniqueness check in the moving interval.

Fresh baseline captures use the real current manifest at `http://127.0.0.1:3000`, Chromium 134/SwiftShader, `1912×800`. Pending captures/metadata reside under `%TEMP%/games-hybrid-fixed-camera-qa`; these are separate from the earlier intercepted feasibility pilot. Actual-device performance, Firefox/Safari and final visual approval remain open.

The old development server later became unresponsive (HTTP timeout and a 90-second hero-mount timeout). With explicit restart authorization, its listening PID `89860` and absolute repository `next/dist/server/lib/start-server.js` command were verified before stopping that single server. Fresh task server `http://127.0.0.1:3100` started in 2.6 s; logs are `%TEMP%/games-hybrid-fixed-camera-dev.log`. Three lingering test Chromium processes were closed only when their executable path exactly matched installed Playwright Chromium 1161; user Chrome was unaffected.

Fresh real-media captures then succeeded: `%TEMP%/games-hybrid-fixed-camera-qa/gemini-baseline-0.42.png`, `gemini-baseline-0.72.png`, `gemini-baseline-0.93.png`, and `gemini-baseline.json`. These pair revised fixed-camera runtime with the still-legacy `games-hybrid-2a7aee909b824ace` media, so they establish the media defect that needs regeneration. All three debug states reported exact readiness; each cache held four decoded images and zero pending requests. No page errors occurred. Aborted manifest/API requests accompanied development effect cleanup and navigation, rather than missing final assets.

Visual inspection confirmed that legacy `p=0.93` vehicles and palms are substantially larger than `p=0.72`, so the old baked exit camera still violates the fixed-camera request. The old `p=0.72` blast consists of narrow weak orange/smoke streaks; repeated identical files cannot establish impactful moving explosions. The new render batch must replace both defects.

A three-second desktop animation-frame probe on this software SwiftShader browser under concurrent Blender load recorded 20 callbacks over 3,063 ms, with p95 interval 388.1 ms. This is a measured limitation of the test environment, not a 60 FPS pass or a hardware performance forecast. Final measured source/media behavior and a supported hardware-browser performance run remain required.

Focused revised-runtime browser run passed eight checks: portrait/Lite/reduced-motion/cold-hash visits downloaded no sequence or foreground; missing manifest preserved playable arcade access; context loss preserved fallback/skip; stalled media did not block keyboard skip; and the hand visibly advanced between requested values while its nearest plate index remained unchanged. The ninth ordinary-flow case failed in the test harness because it queried the dynamic hero before mounting; an explicit hero wait was added, with final rerun pending. This was not evidence of a layout failure. No further browser/GPU work runs during the active final render batch; task dev server stays available.

Final browser coverage also adds native 375px touch swipes/taps, screenshot detail checks, canonical viewport bounds, five reverse cycles and a ten-second settled pause, actual blast-image hash uniqueness, ordinary document-flow arcade layout, and a lossless neutral-ramp fixture that checks the displayed sRGB values. These newly added checks are pending execution against the regenerated source/media pair. Temporary test fixtures are intercepted in-memory and never written into production media paths.

The latest [PRD revision](games-hero-hybrid-cinematic-prd.md#latest-user-revision-fixed-camera-and-smoother-playback) explicitly supersedes all earlier portal travel/hand zoom/transformed-sheet requirements. Camera position/orientation/FOV stay fixed. Hand transform follows continuous requested progress; focus, blast lighting, lens treatment and image-dependent captions follow displayed-media progress. This separation is intentional under the latest user request and replaces the earlier sampled-transform rule.

Parent source verification reports 82 unit checks, fresh lint and typecheck passing after `next typegen` repaired transient generated-route declarations. The additional runtime changes use loaded-state guards to avoid disposed images/GLBs during offscreen reentry, retain bounded resources through visibility changes, and pause the startup deadline while hidden before the first draw. Independent browser cases now include a gated foreground download with a 12.5-second hidden interval and actual scroll-driven offscreen unmount/reentry; they remain pending until rendering finishes.

The pending 149-frame render batch must be evaluated as new media: verify final manifest revision/calibration, actual frame count and unique hashes through ignition/plume growth; inspect `p=0.85`/`0.93` landmarks for scale/travel changes; rerun static/skip/touch/keyboard and reverse/cache checks; and measure a warm scrub after Blender stops. Neither repeated-still baseline hashes nor the under-load rAF probe above can establish this new batch's acceptance.
