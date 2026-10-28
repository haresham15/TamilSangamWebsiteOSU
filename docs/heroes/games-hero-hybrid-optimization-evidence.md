# Games hybrid optimization evidence

Final verification: 2026-10-28; preserved baseline captured 2026-10-27. Scope: [optimization PRD](games-hero-hybrid-optimization-prd.md), narrowed by the user's final instruction to hero animation only. Measurements below describe local development runs, not production or physical-device guarantees.

## Final outcome

Final delivery is `games-hybrid-4f58ef6abe6ce549`, calibration `games-hybrid-3b0518ed4bef`: 149 plates, approximately 7.63 MiB, 126 unique moving images, eight posters and the unchanged 977,736-byte hand. The root reviewer approved the incremental Gaussian foreground blur and late-heat refinement at `.42/.72/.93`; this is not photographic or anatomical reference approval.

The final unmodified 22-case hardware browser suite returned **16 passed / 6 failed** in 1.9 minutes. Every failure was the final zero-error assertion encountering the independently reproduced shared `GlobalCanvas` hydration mismatch. Hero assertions preceding those errors passed, including the new constant plate-texture UUID check, rendered detail at exact samples, static no-download visits, reverse/settle behavior, neutral-ramp output, ordinary scrolling, native 375 px touch, resource limits and lifecycle behavior. The failing cases were portrait, Lite, Save-Data, cold hash, exact debug samples and offscreen reentry. No error was silently filtered to claim a clean suite. Raw log and attachments: `%TEMP%/games-hybrid-final-optimization-browser.log` and `%TEMP%/games-hybrid-final-optimization-browser/`.

Fresh 1912 × 800 captures reached ready at `.10/.42/.6605/.72/.85/.93/1`, with every sample and a subsequent cached reload reporting the same final revision. Media failures: zero. The fresh portrait capture had `innerWidth=scrollWidth=375`, zero cinematic requests and the known shared hydration exception. These independent captures are `%TEMP%/games-hybrid-optimization-final-captures/final-{0.10,0.42,0.66,0.72,0.85,0.93,1.00,375}.png`, with `metadata.json`. Their development HUD still shows the old timer-derived FPS and must not be used as the hero frame-rate measurement. An optional Chrome DevTools connection stalled and was aborted without returning a page ID; no additional DevTools inspection is claimed. Playwright DOM, interaction, console and network evidence remains the completed browser evidence.

Root-owned fresh validation passed: 34 hero unit tests across three files, typecheck, affected ESLint with `--no-ignore`, asset self-test, production build and its numeric/149-asset prebuild verification. The full unit run reported 110 passing assertions and 16 passing files, but two unrelated suite-discovery failures in `src/lib/knowledge.test.ts` and `src/lib/faq-engagement/contracts.test.ts`, selected by the user's expanded Vitest configuration without harness suites. Those files were not changed.

The root's production smoke at `http://localhost:3310` returned `heroFunctionalPass: true`, displayed `.420` for requested `.416` and `.716` for requested `.716`, preserved keyboard skip/focus, had zero failed media requests and did not expose development hooks. One minified React #418 hydration error remained, with no other page exceptions. Production evidence: `%TEMP%/games-optimization-production-smoke.{cjs,json,log}`. This is conditional hero-functionality evidence, not a globally clean-console pass.

## Final hardware measurements

Three fresh Chromium 134.0.6998.35 processes used actual Intel Iris Xe / default ANGLE D3D11, Tier A, DPR 1, 1440 × 900, the same local development server, no throttling and no concurrent Blender render, test, lint or build workload. Each retained its initial sequence scrub and a repeated warm scrub, both `.10 → .93 → .10` over 16 seconds. Normal cold first-ready precedes the debug visit; OS/server caches remain warm. Both visits reproduced the known shared hydration mismatch, so first-ready includes that recovery. Every run had two known shared hydration errors and zero other page exceptions. GPU elapsed queries were available throughout; decoded/pending maxima stayed at 6/4.

Completed-composite timestamps come from the hero's render lifecycle, not requestAnimationFrame callbacks or the shared HUD. They measure completed submission-lifecycle composites, not display presentation timestamps. The 1% low below is `1000 / mean(slowest 1% of positive composite intervals)`. The `.64–.70` interval analysis treats forward and reverse segments separately, avoiding an artificial gap between them.

| Run at 1440 × 900 | Cold first ready ms | Cold median / 1% low composites/s | Cold max interval ms | Warm median / 1% low composites/s | Warm max interval ms | Warm max `.64–.70` interval ms | Dense blast sample gap ms |
| --- | ---: | --- | ---: | --- | ---: | ---: | ---: |
| 1 | 2308.0 | 60.24 / 14.56 | 153.3 | 60.24 / 28.00 | 42.9 | 42.9 | 66.9 |
| 2 | 1873.1 | 60.24 / 15.61 | 164.0 | 60.24 / 28.81 | 36.9 | 35.5 | 67.0 |
| 3 | 1828.0 | 60.24 / 13.92 | 154.0 | 60.24 / 29.04 | 38.5 | 38.5 | 66.7 |

Warm median ≥58 passes these runs. **Warm 1% low ≥45 and no interval >33 ms during `.64–.70` fail all three runs.** Cold first-ready ≤2000 ms passes two runs and fails one; no consistent ≤2 s claim is made. Warm broad legacy sample-gap values remained 200.3 / 200.2 / 200.2 ms, above the proposed ≤150 ms gate. The narrower dense-blast values in the last column cover completed-sample changes whose two requested-progress endpoints both lie in `.64–.85`; they do not replace the broad metric or erase intentional early holds.

One additional same-size 1912 × 800 comparison measured cold first-ready 2077 ms; warm median 59.88 composites/s, 1% low 32.99, p99 27.3 ms, maximum 37.8 ms, dense-blast gap 50.1 ms and broad legacy gap 200.1 ms. Its upload CPU p95 was 6.0 ms versus 6.6 ms in the initial instrumented baseline. This single comparison and the earlier variable results do **not** establish an upload/FPS speed gain. The final Gaussian focus treatment improves the reviewed appearance while consuming additional blur work.

Final rolling warm stage p95 ranges across the three 1440 × 900 runs:

| Stage | CPU submission p95 ms | GPU elapsed p95 ms |
| --- | --- | --- |
| Plate upload | 5.7–5.8 | 0.636–0.881 |
| Foreground | 0.5–0.6 | 1.859–3.202 |
| Aperture mask | 0.1 | 0.021–0.036 |
| Foreground blur X | 0.1 | 0.200–0.308 |
| Foreground blur Y | 0.1 | 0.807–1.717 |
| Mask blur X | 0–0.1 | 0.097–0.181 |
| Mask blur Y | 0 | 0.039–0.074 |
| Composite | 0.1 | 0.382–0.586 |

These are bounded rolling per-stage summaries, not simultaneously measured per-frame totals; adding their p95 values does not produce a valid frame p95. GPU disjoint status is a sticky historical warning in diagnostics; no disjoint event was reported in these final captures.

At 1440 px, owned GPU storage estimates totaled 66,994,456 bytes (63.89 MiB): geometry 935,864; foreground textures 25,165,824; environment 688,128; plate 6,118,400; target colors 9,773,280; depth 3,473,280; multisample attachments 20,839,680 bytes. At 1912 px the corresponding total was 74,925,816 bytes (71.45 MiB), with target colors/depth/MSAA at 12,046,400 / 4,281,600 / 25,689,600. CPU decoded plates separately reached 36,710,400 bytes (35.01 MiB), and foreground decoded maps added 18,874,368 bytes (18 MiB). These format/dimension estimates exclude driver/browser overhead and unaccounted shared resources; they do not establish a complete GPU-memory ceiling pass.

Raw repeatable data and summaries: `%TEMP%/games-hybrid-fixed-camera-qa/optimization-final-1440-{1,2,3}.json`, `optimization-final-1912-1.json`, `%TEMP%/games-hybrid-optimization-final-summary.jsonl`, and sibling `games-hybrid-optimization-profile.cjs` / `games-hybrid-optimization-summary.cjs` scripts. These are the four final development captures; any subsequent root-owned production timing control is separate evidence.

## Preserved baseline

Before runtime instrumentation and candidate art work, three isolated fresh Chromium processes measured delivery `games-hybrid-f410c08628fed149`. Browser: Chromium 134.0.6998.35, installed Playwright Chromium 1161. Renderer: `ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x0000A7A0) Direct3D11 vs_5_0 ps_5_0, D3D11)`. Default ANGLE selected hardware; SwiftShader was not forced. Viewport 1912 × 800, DPR 1, Tier A, local Next.js development server at `http://localhost:3000`; no network/CPU throttle and no concurrent Blender render or QA browser workload.

Each process navigated normally to `/games` for cold first-ready timing, then opened `/games?debug=0.10`, scrubbed `.10 → .93 → .10` over 16 seconds to warm, and repeated the same scrub for measurement. Browser HTTP caches were fresh per process; OS filesystem cache and the development server remained warm. This is a local cold-browser protocol, not a cold operating-system or real-network benchmark.

| Run | First ready ms | Warm callback p95 ms | Longest observed moving-sample advance ms | Max decoded / pending | Page errors |
| --- | ---: | ---: | ---: | --- | ---: |
| 1 | 2382.5 | 16.9 | 200.2 | 6 / 4 | 0 |
| 2 | 2028.6 | 49.8 | 233.4 | 6 / 4 | 0 |
| 3 | 2236.6 | 49.9 | 3683.2 | 6 / 4 | 0 |

The third run's longest gap spanned drawn sample `.20` at requested `.154` through drawn `.26` at requested `.536`; it includes an intentional early hold and a delayed transition into moving samples. At the latter observation, cache was six decoded/four pending, wanted index 19 versus completed index 5. This outlier is retained, not removed from the report. Candidate comparisons must also distinguish intervals wholly inside moving sections from intervals crossing an intentional hold.

For an additional comparison restricted to completed-sample changes whose two requested-progress endpoints both lie in the dense blast interval `.64–.85`, maximum gaps were 100.0 / 199.9 / 233.3 ms across runs 1–3 (91 / 54 / 33 changes). The exploratory instrumented run measured 100.2 ms across 91 changes. These values use a narrower definition than the broad legacy metric above and cannot silently replace it.

Callback intervals are **not actual completed-composite FPS**. Baseline HUD showed 10 FPS because its old counter sampled a 100 ms timer. Baseline completed-composite FPS, per-pass CPU/GPU timing, texture upload time and complete graphics memory were unavailable before instrumentation; no equivalent baseline pass-time claim is made.

Raw captures and repeatable baseline script remain local, outside the production bundle:

- `%TEMP%/games-hybrid-optimization-baseline.cjs`
- `%TEMP%/games-hybrid-fixed-camera-qa/optimization-baseline-{1,2,3}.json`
- `%TEMP%/games-hybrid-baseline-{1,2,3}.log`

## Candidate verification

Intermediate runtime candidate, still using f410 media: **22/22 hardware browser cases passed in 1.4 minutes**. The original 21 cases remain, with an added Save-Data no-cinematic-download visit. The delayed 120 ms response case observed 54 distinct completed plates during the first 2.8 seconds of its three-second forward gesture, preserved monotonic displayed progress, caught exact `.845` after stopping, then advanced monotonically in reverse and caught `.640`. The visibility case separately verified positive completed-composite counts, finite bounded CPU stage summaries, positive foreground geometry accounting, no new composites while hidden and resumed composites afterward.

Existing coverage also passed portrait/Lite/reduced-motion/cold-hash no-download paths, keyboard skip, native 375 px touch scrolling, ordinary wheel scrolling through the tall arcade, exact samples/reversals, held-background hand motion, contained framing, missing-media/context-loss fallback, paused startup deadline, offscreen disposal/reentry and exit imagery. Neutral-ramp output differed by at most one 8-bit channel level after poster opacity reached zero. Raw intermediate log: `%TEMP%/games-hybrid-optimization-browser.log`; captures and attachments: `%TEMP%/games-hybrid-optimization-browser/`.

The later final suite and root-owned source/build validation are recorded above. The added stable GPU plate texture identity assertion ran and passed before the exact-debug case reached its known shared hydration-error assertion.

## Instrumented baseline and focus probe

One exploratory run used the same f410 delivery and viewport after development diagnostics were added. GPU elapsed queries were available. Its final rolling stage summaries reported CPU upload submission p95 6.6 ms (max 8.6), GPU upload p95 0.707 ms, GPU foreground p95 2.136 ms, GPU foreground blur p95 0.421 ms, GPU mask blur p95 0.157 ms and GPU composite p95 0.602 ms. CPU submission time is not GPU execution time; rolling per-stage summaries do not describe a single simultaneous frame. Texture upload submission was the largest measured CPU stage and foreground rendering the largest GPU stage. This supports investigating upload/scheduling and avoiding gratuitous blur quality reductions.

This exploratory capture sampled diagnostics on every animation callback before summary caching was introduced. Observed unique completed timestamps had median interval 16.6 ms, p99 39.5 ms and max 49.1 ms. Those observations are not a controlled three-run acceptance result. Cold first-ready was 2875.5 ms; warm callback p95 16.9 ms and moving-sample gap 200.2 ms. The first instrumented memory report incorrectly showed zero foreground geometry/textures; that defect was reported for correction before final accounting. Raw evidence: `%TEMP%/games-hybrid-fixed-camera-qa/optimization-instrumented-1.json`.

The original encoded plates were independently resized to 1440 px content width. A fixed fence-only ROI `(x=40, y=365, width=360, height=60)` used grayscale pixels and the four-neighbor discrete Laplacian, excluding the outer one-pixel boundary. Laplacian variance was 2692.9838 at `.10`, versus 3.01163 at `.42`: ratio 0.0011183 (0.112%), below the proposed 8% background-softness threshold. ROI captures are `%TEMP%/games-hybrid-fixed-camera-qa/fence-baseline-{0.1,0.42}.png`. This checks one chosen background region; it does not prove foreground rim sharpness, halo quality or reference parity.

A separate J2 baseline probe resized the existing live `.42` screenshot to 1440 px content width. On the upper outer rim of the right lens, center `(890,226)`, perpendicular unit normal `(1/√10, 3/√10)`, bilinear grayscale samples used local outside/inside means over offsets `[-8,-5]` and `[5,8]`. Interpolated 90% and 10% crossings were −0.7502 and +0.8345 px: edge width **1.5847 px**, below the proposed 2 px threshold for this selected edge. This uses encoded grayscale, not a linear-light edge transfer function. Reproduction and raw profile: `%TEMP%/games-hybrid-rim-probe.cjs` and `%TEMP%/games-hybrid-fixed-camera-qa/rim-baseline-0.42.json`. J3 rim softness ≥14 px and the proposed 1.1× halo rule remain unmeasured until a reliable comparable edge/neighborhood is defined.

An intermediate stable-texture/24-tap grain candidate, subsequently rejected visually for stationary grain, was captured at 1912 × 800. Run 1 overlapped runtime CPU checks and is exploratory only. Run 2 had no concurrent QA browser or Blender render; a short parent calendar unit check was reported during this period, so this is not the final isolated acceptance protocol. Run 2 upload CPU p95 was 7.0 ms (max 7.9), versus 6.6 ms (max 8.6) in the first instrumented baseline; GPU upload p95 was 0.909 versus 0.707 ms. **An upload speed improvement is not established.** Stable texture identity will be regression-checked independently of speed.

Run 2 completed-composite intervals had median 16.6 ms (60.24 composites/s), mean of the slowest 1% 46.32 ms (21.59 composites/s), p99 41.8 ms and maximum 53.6 ms. The dense `.64–.85` sample-advance maximum was 116.6 ms. These are submission-lifecycle composite timestamps, not presentation timestamps; the unapproved variant and 1912 px viewport do not establish the proposed 1440 × 900 acceptance gates. Raw capture: `%TEMP%/games-hybrid-fixed-camera-qa/optimization-runtime-candidate-1912-2.json`.

Its corrected peak owned graphics-storage estimates totaled 74,925,816 bytes (71.45 MiB): foreground geometry 935,864; foreground textures 25,165,824; environment 688,128; plate texture 6,118,400; target colors 12,046,400; depth attachment 4,281,600; multisample attachments 25,689,600 bytes. CPU decoded bitmaps separately peaked at 36,710,400 bytes (35.01 MiB). These are format/dimension estimates, excluding driver/browser overhead and unaccounted shared resources; they do not prove a complete 120 MiB GPU ceiling pass. Final adopted-variant accounting is recorded above.

## v1.1 measurement mapping within hero scope

The source document's numbers are author estimates, not newly established photographic parity. The adopted hero retains its calibration and uses those measurements selectively:

| Source measurement | Adopted contract / evidence |
| --- | --- |
| Design 1912 × 800, aspect 2.39, vFOV 34° | Existing contained landscape composition and projection helpers retained; browser framing checks cover canonical and ultrawide viewports. |
| Camera `(0,1.65,6)`, vertical shift −0.350, horizon `v=.675` | Fixed throughout progress and time, with zero shake. No portal, dolly, zoom or drift; those source effects are overridden by the user's fixed-camera/natural-scroll instructions. |
| Wall base/top approximately `.741/.643` | Existing numeric frame-parity verifier checks projected landmarks against its established tolerances; this does not compare fresh private reference pixels. |
| J2 anchor `(.563,.565)` at `.36 m` | Preserved in the existing smooth rig; body dimensions and `.36 m` foreground / `37 m` background depth anchors retained. |
| Source J3 anchor `(.5875,.575)` | Existing calibrated `(.580,.575)` retained. Horizontal difference `.0075` lies within the established ±.01 tolerance; registration remains authoritative over copying a different optical calibration. |
| J2 background blur at least 20 px; J3 foreground blur at least 14 px | Rail values at the exact beats are 24 px at `.42` and 18 px at `.72`, respectively, in CSS px at 1440 px content width. These are configured blur radii, not measured image edge widths. The separate fence/rim probes above make that distinction explicit. |
| Staggered impact origins/radii | Current x/radius/hit triplets `−5.46/2.3/.640`, `+.43/3.0/.657`, `+6.32/1.9/.674` retained. No simultaneous `.640` transplant or camera motion. |
| Optical registration | `verify-lens-registration.mjs` independently exited 0 across seven viewports and `.66–.85`; `verify-frame-parity.mjs` independently exited 0 for its landmark gates. Numeric projection success does not establish hot-pixel occupancy or anatomy approval. |

The final Gaussian candidate uses nine normalized taps per axis (18 samples total), reusing existing render targets for foreground/mask X and Y passes. Sharp focus bypass remains. Final hardware pass costs and the root's incremental image approval are recorded above; a new final-image rim/halo measurement was not performed after the existing baseline probes.

## Unverified review

Physical Safari and Firefox are unavailable in this environment. Private lawful reference images and two independent human art scores are unavailable; no photographic parity, anatomy score, silhouette IoU or reference ΔE pass is claimed. Hardware measurements cover the local Iris Xe machine and Tier A only. Physical screen-reader usage, Tier B timing, real-network LCP/CLS/INP and complete browser/driver graphics-memory accounting require separate evidence. Final J3 edge width and halo brightness were not independently quantified; the baseline J2/fence probes and reviewed Gaussian appearance do not substitute for those gates.

The user's final scope is hero animation only. Calendar, game UI, navigation, metadata and the shared debug HUD are outside that scope; no O-7 browser assertions were added. The temporary shared-HUD correction was reverted by its owner. Ignore its legacy timer-derived FPS readout; hero development diagnostics provide the completed-composite timestamps used here.

## Shared hydration blocker

On 2026-10-28, a software-rendered correctness probe used fresh contexts to isolate a shared hydration problem from hero animation. With Lite plus reduced motion, all nine visits (three `/games#arcade`, three `/games?debug=0.42#arcade`, three `/suggestions`) had zero page exceptions and zero cinematic requests. Each still logged a React attribute mismatch in the shared dock's `StarBorder`; `/suggestions` additionally showed a `KolamSectionRule` transform mismatch. These warnings were retained.

With Lite but no reduced-motion preference, all nine matching visits failed hydration with the same explicit diff: client `<div id="gl-root">` versus server `<script id="_R_">`. Both Games static variants and the independent `/suggestions` control reproduced it, without any manifest, sequence or foreground download. The current unrelated working-tree change in `GlobalCanvas.tsx` initializes `source` synchronously from `document` on the client while SSR initializes it to null; Lite initially remains false until its effect. Thus the first client render includes `#gl-root` while SSR omits it. Reduced motion initializes Tier C and avoids that branch. This source/route evidence identifies a shared cause outside hero ownership; it does not attribute the issue to the hero media or optics candidate.

Raw full errors/stacks, route states and request evidence remain in `%TEMP%/games-hybrid-hydration-probe.json` and `%TEMP%/games-hybrid-hydration-lite-only-probe.json`, with runnable sibling `.cjs` scripts. These probes forced SwiftShader with hardware GPU disabled during art rendering; they are correctness controls, not performance measurements. No shared source was edited. Final hero checks must retain this external blocker explicitly and cannot claim a globally clean console.

## Production native-scroll control and remaining pacing limit

One additional production control used the successful build at `localhost:3310`, the same Iris Xe/D3D11 renderer, 1440 × 900 at DPR 1, and native document scroll instead of the development progress setter. An initialization script identified only the hero composite shader by its three sampler uniforms and recorded completed `drawElements`/`drawArrays` submissions. It changed no application source and enabled no development hook or GPU elapsed queries. After one 16-second warm scrub, another 16-second `.10 → .93 → .10` scrub measured the actual smoothed route progress. This is a separate protocol, not a directly comparable baseline or a three-run production acceptance result.

The control recorded 873 composites: median 59.88/s; 1% low **5.79/s**, using the same reciprocal mean of the slowest 1% definition as the development table; p99 interval 37.9 ms; maximum ignition-window interval 55.7 ms. Three broad-interval pauses measured 493.8, 441.3 and 356.9 ms. One known shared React #418 error occurred and no other page exceptions. The earlier raw console output used reciprocal p99 as its label; the retained JSON and summary script correct that definition without discarding any timestamps. These data confirm that strict pacing is still unmet in production; the development table's 28–29 lows must not be presented as a universal native-scroll result.

A separate, heavily instrumented Chrome trace examined native scroll. On the measured renderer thread, `UpdateLayoutTree` events accounted for approximately 6.74 seconds of nested event duration; long stacks included Lenis `onNativeScroll` / `get actualScroll`. GC event time was much smaller. Trace instrumentation substantially changed cadence, so its FPS is not an acceptance result. This points to style/layout work during native scrolling, but does not isolate a complete cause or establish a hero-upload-only bottleneck. Shared scrolling, canvas infrastructure and every other hero remain unchanged under the user's scope restriction.

Reproduction/raw artifacts: `%TEMP%/games-optimization-production-pacing.cjs`, `games-optimization-production-pacing-summary.cjs`, `games-optimization-production-pacing.json`, `games-optimization-production-trace.json` and `games-optimization-production-traced-pacing.json`. Task-owned production servers and browser processes were stopped after verification. No commit, deployment or external publication occurred.

Independent read-only runtime review found no blocking regression. Its minor diagnostic note is retained: `gpu: "disjoint"` is a sticky session warning after a transient disjoint, even if subsequent valid samples resume; it must not be interpreted as a fresh valid GPU sample. All final measured hardware runs reported queries available.

## Slow-motion scroll and stage transitions follow-up

The subsequent user request changes Games pacing and transitions only. The existing camera, model alignment, 149 rendered samples and staggered impact times remain unchanged. Other heroes and shared scrolling/canvas infrastructure were not edited.

`gamesScroll.ts` maps normalized document scroll to the existing scene timeline with a monotone cubic curve and matching positive slopes at its joins. Authored scroll/scene pairs are `(0,0)`, `(.12,.22)`, `(.38,.52)`, `(.54,.64)`, `(.86,.85)` and `(1,1)`. Desktop runway is now 640dvh, with 540dvh of actual scrolling; narrow landscape uses 480dvh. Static visits retain 100dvh. The `.64` to `.85` blast interval receives 172.8dvh of desktop scroll instead of 50.4dvh, approximately 3.43 times the previous distance. Debug previews and the development progress setter still address calibrated scene progress directly.

Existing captions crossfade across a .05 scene-progress window at `.22`, `.52` and `.85`, using displayed-media progress and small CSS easing. Only the active caption is exposed to assistive technology. After the final `.93` reference frame, a `.94` to `1` fade blends the settled scene into the arcade paper color; the camera remains stationary and content follows ordinary document scrolling. Static previews and explicit Skip retain their imagery. A separate reproduced Skip-return bug was fixed locally: upward scrolling back into the runway resumes playback instead of leaving progress paused at 1.

Fresh validation passed 52 focused unit tests and six hardware Chromium browser cases: native-wheel forward/reverse playback, Skip-return, all three caption crossfades plus the final fade, ordinary arcade flow, reduced-motion static downloads and 375px native touch scrolling. The final-fade screenshot was inspected at 1912 by 800. Typecheck and affected-file ESLint also passed. Raw logs are `%TEMP%/games-slowmo-unit.log`, `games-slowmo-browser-final.log`, `games-slowmo-typecheck.log` and `games-slowmo-lint.log`; browser output includes `test-results/games-hybrid-captions-cros-ad6be--changing-debug-calibration/outro-transition.png`.

Production build and scoped whitespace checks also passed. Build includes the existing numeric frame-parity, seven-viewport lens-registration and 149-frame asset checks; raw build output is `%TEMP%/games-slowmo-build.log`. No commit or deployment occurred.

The hardware timing figures above precede this retiming. This follow-up changes the amount and distribution of scroll, not the number of source frames, and does not establish a new FPS improvement or clear the existing shared hydration and frame-pacing limits.
