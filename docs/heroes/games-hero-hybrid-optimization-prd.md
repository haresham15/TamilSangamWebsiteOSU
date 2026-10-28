# Games page: hybrid hero optimization PRD

Status: proposed incremental refinement; documentation only. No implementation starts under this request.

Date: 2026-10-27. Route: `/games`. Audience: developer, Blender artist, and visual reviewer.

## 1. Product decision and authority

Improve the hybrid Games experience already built. Preserve its composition, fixed camera, live hand and glasses, rendered beach and explosions, scroll behavior, and existing arcade design. Use the newly supplied v1.1 document to recover useful art direction, optical measurements, effects details, and validation requirements. This is a refinement specification, not a replacement architecture or a request to rebuild the page.

Sources, in precedence order:

1. The latest user instructions: preserve the existing hybrid implementation, keep the camera fixed, scroll normally into content, and stop after this separate PRD.
2. The current working implementation and [recorded verification](games-hero-hybrid-cinematic-evidence.md).
3. The latest-user-revision section of the [hybrid production PRD](games-hero-hybrid-cinematic-prd.md).
4. The newly supplied [Games Page v1.1 PRD](<../../PRD — Games Page v1.1 · The Sangam Arcade & Beach Blast Sequence.md>), selectively adopted below.

The v1.1 file is an October 26 design proposal. Its claimed reference measurements are source-document estimates, not independently remeasured facts. It ends after “Hero 8: Loading and boot”; the complete game rules, storage schema, audio recipes, QA plan, and agent directive mentioned in its introduction are not present. Do not invent those sections or replace existing game behavior to fill them in.

This document adds requirements only where explicitly identified. Existing requirements and passing behavior remain the default elsewhere. Existing work is valuable even where photographic art approval or physical-device measurements remain open.

## 2. Baseline to preserve

The baseline is the current working tree based on commit `6262ff78700944bf6a24235e972987dcc124752a`, including subsequent uncommitted runtime, cache, and media improvements. That commit alone does not contain the complete baseline.

| Item | Current state and evidence |
| --- | --- |
| Media revision | `games-hybrid-f410c08628fed149` |
| Calibration revision | `games-hybrid-8711113f4a97` |
| Background delivery | 149 original 1912 × 800 WebP plates; 7,972,676 bytes, approximately 7.60 MiB |
| Moving imagery | 126 images in checked moving intervals have unique hashes; intentional early holds remain allowed |
| Static delivery | Eight original posters: four landscape and four portrait; 439,530 bytes combined |
| Foreground | Existing anatomical hand GLB, 977,736 bytes, 13,728 triangles, three embedded maps; existing live eyewear geometry |
| Rendering | Offline environment, background focus, fire, smoke, debris and illumination; live foreground and compositing inside the shared `GlobalCanvas` |
| Camera and exit | Fixed projection and pose throughout; no blast fly-through, foreground portal zoom, or camera shake; arcade remains in ordinary document flow |
| Playback | Continuous requested progress for hand motion; completed displayed-media progress for background-dependent focus, light, lens treatment and captions |
| Decoding | At most six cached decoded plates and four pending requests; continuous work finishes, jumps/reversals reprioritize, and directional selection prevents backward image jumps |
| Engineering evidence | 91 unit tests in 13 files and 21 browser cases passed, the browser cases across bounded Iris Xe runs; build, typecheck, affected lint, numeric and asset checks passed |
| Local hardware measurement | First ready 2,055.1 ms; warm animation-callback p95 16.9 ms; longest observed completed moving-sample advance interval 200.2 ms |
| Important limits | Callback timing is not actual WebGL draw FPS. Photoreal art approval, reference-image parity, physical Safari/Firefox coverage and full graphics-memory accounting remain open |

The art pipeline uses the existing Blender/EEVEE script and original deterministic volume shading. It is not a cached Mantaflow gas simulation. Preserve the successful result; a fluid-simulation replacement is outside this optimization release.

At the canonical landscape aspect, retain the level camera at `(0, 1.65, 6)`, looking along −z, vertical FOV 34°, vertical lens shift −0.350 and horizon `v=.675`. Reuse the existing projection helpers, including their portrait policy and resize handling; do not introduce a second hand-coded projection formula.

### Protected behavior

- Preserve the current 2.39:1 contained landscape composition, including ultrawide viewports. Do not restore the source PRD’s wide-screen crop/fill policy.
- Preserve dedicated portrait stills and static portrait/Lite/reduced-motion/Save-Data paths. Do not turn them into an animated mobile scene.
- Preserve the shared canvas, tier controls, Lenis/master-tick ownership, resource cleanup and renderer-state restoration. Add no canvas or independent animation loop.
- Preserve the smooth hand entrance and zero endpoint velocity/acceleration. Do not reintroduce anticipation tremor, idle tremor, camera sway or shake.
- Preserve current optics calibration and actual camera matrices. Fit assets and effects to that calibration rather than moving the camera to fit new assets.
- Preserve baked background focus and color. Keep the existing single foreground tone-map/output-color path and premultiplied foreground composition.
- Preserve immediate poster and skip access; explicit skip focuses `#arcade`, while ordinary scrolling never steals focus.
- Preserve the current game cards, thumbnails, typography, warm semantic tokens, monthly games, local progress and bilingual behavior.
- Preserve original/licensed assets and rights records. Film footage, audio, logos, traced artwork and reference images must not enter the production bundle.
- Keep the existing npm lockfile and dependencies. Use Blender, existing Node/Sharp tooling and local hardware; require no paid assets, services or render farm.

## 3. What to extract from v1.1

| Source section | Useful detail | Optimization decision |
| --- | --- | --- |
| Defects D-01–D-05; Hero 1 and 7 | Horizon/projection discipline, real-size eyewear, numeric lens registration | Keep current passing calibration; add image-based review beside the math |
| Hero 2 | Coastal colors, restrained clouds, fence depth, hedge, dune trench, architectural and vehicle details | Improve selected offline details without replacing the environment or changing landmark anchors |
| Hero 3 | Pinch grip, nails, hidden wrist boundary, rim profile, sky reflections and anatomy review | Refine existing GLB/materials and eyewear; retain current pose and smooth motion |
| Hero 4 | Premultiplied edges, bokeh quality and measurable focus probes | Review and optimize the current live foreground blur; background DOF stays offline |
| Hero 5 | Three identifiable missile approaches, persistent trails, smoke lighting, ballistic debris, fence dust and ground shockwave | Author into the existing Blender scene, with current staggered hits |
| Hero 6 and J4 rows | Original portal, amber interior, 28 m travel and transformed sheet | Do not adopt. Current fixed-camera fade and normal scroll remain authoritative |
| Hero 7 | Single timeline authority and pixel checks in addition to projection checks | Extend the existing export/verification workflow rather than adding a competing rail/configuration |
| Hero 8 | Real frame-time/memory accounting, boot behavior, LCP/CLS and input responsiveness | Measure the hybrid pipeline itself; remove obsolete procedural-world allocations from budget reasoning |
| Navigation, D-11–D-14 | Edition selection, deep links, monthly completion, Tamil integrity and contrast | Audit small existing gaps; do not redesign or respecify the games |

Explicitly excluded prescriptions: procedural hand reconstruction in a worker, a 250 KB replacement-hand gate, skin roughness `0.18`/clearcoat `0.65`, browser fire raymarching, live background DOF, an additional GradeStack, automatic `1.06×` lens magnification, simultaneous `.640` impacts, animated portrait playback, opt-in intro controls and context-restore machinery without a demonstrated need.

## 4. Experience and timeline contract

Keep the existing desktop 340dvh runway and current narrow-screen/static policies. A static visit remains 100dvh; the existing 260dvh narrow-screen rule does not authorize mobile animation. Use normalized progress `p`; no effect should depend on accumulated simulation time.

| Progress | Preserved experience | Allowed refinement |
| --- | --- | --- |
| `0–.08` | Intro eyebrow and bilingual scroll cue | Check legibility and loading stability; skip remains immediately available |
| `0–.22` | Fixed establishing shot; hand hidden | Improve coastal depth and selected details without increasing visual busyness |
| `.22–.40` | Hand descends from upper right and settles | Improve grip/skin/readable rim highlights, without changing the successful entrance curve |
| `.40–.52` | Close-up hold; canonical J2 at `.42` | Improve anatomy, highlight shape and background bokeh |
| `.52–.60` | Restrained roll/anchor settle and focus return | Preserve current timing; evaluate projected lens angle rather than copying Euler signs |
| `.540/.546/.552` | Candidate missile entrance times from v1.1 | Validate the three approach paths against the existing composition |
| `.640/.657/.674` | Current staggered left/centre/right impacts | Keep stagger; add clearer layered ignition, trails, debris and dust |
| `.66–.85` | Lens-registration review interval; canonical J3 at `.72` | Improve visible fire placement and plume separation without losing impact |
| `.70–.76` | Candidate debris-settling interval from v1.1 | Tune offline trajectory duration; do not introduce a browser physics system |
| Around `.80` | Candidate foreground dust approach | Keep camera fixed and avoid a full-screen dust wipe |
| `.85–1` | Settling smoke; existing hand opacity fades `.86–.93`; normal scroll to arcade | Improve late smoke/ember continuity, keep background scale stable and content accessible |

Do not transplant v1.1’s `s = 25 × (p − .640)` conversion globally. Existing authoring uses its own progress/age functions, and the three impacts now differ. Any new ballistic effect must define one explicit per-impact conversion `s_i = k × max(0, p − hit_i)` in the existing authoring configuration and be evaluated from that state alone.

### Timing and sampling authority

`gamesRail.ts` and `camera/projectionMath.ts` remain the calibration authorities. `scripts/games-hybrid-assets.mjs export` and the existing camera-sample artifact carry that contract into Blender. Do not add a second `RAIL` module or a redundant `rail.json` pipeline merely because the source PRD proposed one.

Keep exact `.10`, `.42`, `.72`, `.93` and endpoint samples. Retain all 149 sample positions for the first optimization comparison. A later sampling change needs evidence of a real gap and a complete asset/cache regression; unique filenames alone never prove motion.

## 5. Optimization requirements

### O-1. Measure the actual hybrid cost before changing quality

Priority P0. Current callbacks are responsive, but actual renderer FPS, per-pass GPU time and complete memory use have not been proved.

1. Count completed visible hero composites using the existing render lifecycle. Do not count offscreen passes as separate displayed frames or add a new ticker.
2. Separate main-thread work, fetching, bitmap decoding, texture upload, foreground render, aperture-mask render, blur, final composite and DOM work. The old procedural world/fire/GradeStack cost table is not this pipeline.
3. Repair or replace the misleading debug FPS metric when implementing this work package: `GlobalDebugHUD` currently counts a 100 ms polling interval and therefore reports approximately 10, independent of actual rendering. Reuse existing diagnostics and restrict instrumentation to development/preview.
4. Report requested progress, selected sample, last completed draw, decode/upload duration, queue depth and direction changes in captured diagnostic output. Do not put engineering telemetry in the public product flow.
5. Account separately for compressed transfer, decoded CPU bitmaps, GPU plate textures, foreground textures/geometry, multisampled attachments, render targets and shared resources. Six 1912 × 800 RGBA bitmaps alone imply about 35.0 MiB of raw pixel storage before browser overhead; the 7.60 MiB download is not the memory footprint.
6. Use supported browser GPU measurements when available; record unavailable measurements as unavailable. Preserve the shared renderer’s state and statistics ownership.

Acceptance: three repeatable cold/warm runs with hardware, viewport, DPR, tier, build type, throttling and concurrent workloads recorded. Compare the same scripted scroll against the preserved baseline. No render-quality reduction until the measured expensive stage is identified.

### O-2. Improve playback efficiency without undoing the cache fixes

Priority P0. Investigate the remaining 200.2 ms observed moving-sample gap using O-1 evidence. Improve it through scheduling, decoding/upload work or a measured quality adjustment, not a second rendering architecture.

- Keep six decoded plates/four in-flight requests as hard ceilings for this release. Do not preload the whole sequence or retain an unbounded texture cache.
- Keep nearby continuous decodes alive. Reprioritize real seeks and reversals; do not restore cancellation on every sample-index change.
- Keep directional nearest-completed selection, exact debug captures, earlier tie handling, bounded retries, stale-controller ownership checks and image closing.
- Background-dependent focus, light and lens treatment continue using displayed sample progress. Hand motion continues using continuous requested progress.
- Do not introduce video, WebCodecs, workers, KTX2, compression decoders or predictive-cache abstractions without a separately measured limitation and approval of that scope change.
- Preserve current foreground caps: 1600 px Tier A, 1120 px Tier B, current DPR limits and half-resolution blur. Optimize measured passes before raising resolution or adding sampling.
- Reuse current load deadlines: 12 seconds ordinary/30 seconds exact debug, paused while hidden. These are fallback policies, not loading-performance targets.

Acceptance: existing delayed-decoder and reordered-completion regressions remain green; delayed-response browser scrubbing advances repeatedly before the gesture stops, remains monotonic in its direction and catches the target after stopping. Reverse, hidden/resume, offscreen reentry and cleanup never expose closed bitmaps or disposed foreground assets.

### O-3. Add image-based focus and lens-quality review

Priority P1. Retain current depth anchors, approximately 0.36 m foreground and 37 m background. Keep the live compositor and baked background DOF.

Extract these v1.1 probes as proposed acceptance methods at a 1440 px content width:

| Probe | Proposed target | Qualification |
| --- | --- | --- |
| J2 background softness | Fence-region Laplacian variance at `.42` at most 8% of `.10` | Fix identical ROI and exposure; evaluate the encoded plate, not changing foliage/noise regions |
| J2 eyewear sharpness | Selected rim 10–90% edge width at most 2 px | Use a perpendicular, unclipped edge away from highlights |
| J3 foreground softness | Comparable rim edge width at least 14 px at `.72` | Inspect silhouette readability and avoid visible individual blur taps |
| Halo | No bright/dark fringe; source suggests at most `1.1×` adjacent brightness | Define neighbors and luminance floor first; a legitimate specular highlight is not automatically a halo |
| Color continuity | Existing neutral-ramp channel error at most three 8-bit levels | Wait for the current 250 ms poster fade to finish before sampling |

These are proposed gates, not current measured passes. Save baseline ROIs and results before enforcing thresholds. If a literal threshold rewards worse optics, document the discrepancy and review it rather than tuning tests to accept an artifact.

The source’s 24-tap Vogel gather, per-pixel rotation and 3 × 3 tent filtering are candidate treatments for visible sparse-tap streaking or edge artifacts. They are not a requirement to add every pass. Compare a small local candidate against current A/B tier sampling; keep the smallest change that improves the rim without exceeding measured GPU/memory budgets. Avoid introducing temporal shimmer through newly time-varying sampling.

Keep the current unit lens zoom and restrained contrast/coating behavior. Do not apply v1.1’s `1.06×` magnification or 4% warmth by default. Background colors are already graded offline; do not add runtime background blur, bloom/LUT stacks or a second background tone-map. New optics must pass the existing registration and neutral-ramp checks.

### O-4. Refine the existing hand and eyewear, keeping their placement

Priority P1. Preserve the anatomical asset, its texture set, grip alignment and current quintic motion. A new hand generator, model replacement or rig solver is not required.

Carry forward the source’s useful physical details:

- Adult right-hand pinch: thumb pad and index side contact the right temple; remaining fingers curl naturally. Check interpenetration, nail attachment, tendon/knuckle transitions and consistency across the entire entrance.
- Keep the wrist/crop boundary outside the upper-right frame. Source coverage of roughly 14% and its screen bounds are reference-review hints, not authority to reposition the current successful rig.
- Preserve 82 mm lens-centre spacing, 56 × 43 mm apertures, approximately 147 mm overall width and 140 mm temples. These are composition contracts, not arbitrary model-unit scaling.
- Review the source’s heavier upper rim (about 6 mm), 5 mm sides, 3.5 mm lower rim, 12 mm end pieces and approximately 0.8 mm bevel as small local profile/highlight refinements. Preserve aperture geometry and registered centres.
- Use the existing sky/environment reflections for readable acetate edges, metal hinge pins and subtle wear. A candidate 256² scratch map is permitted only if it helps at actual displayed size and fits existing resources.
- Keep skin spatial roughness near the existing matte treatment; do not copy roughness `0.18` and clearcoat `0.65`. White/cream marks belong in texture masks; they must not read as floating geometry or repeated glowing streaks.

The source’s post-grade skin percentiles are retained solely for future comparison with inspectable references:

| Percentile | Source color |
| --- | --- |
| p15 / p35 | `#020000` / `#1C0A07` |
| p50 / p70 | `#2D1D14` / `#4A3626` |
| p85 / p95 / p99 | `#654C39` / `#8E6E53` / `#A1957A` |

Do not assign these pixel values directly as albedo or darken the whole hand to match them. Their masks/exposure have not been independently verified. The source’s median ΔE00 ≤8 and silhouette IoU ≥0.75 become usable only with lawful private references, reproducible masks and a defined color pipeline. Without those inputs, report those checks as unavailable and compare the candidate with our own baseline.

Acceptance: no loss of current lens registration or hand smoothness; a clear contact grip; no clipped arm boundary; no waxy gloss or hard anatomy artifacts. Two independent reviewers should rate the close-up at least 4/5 for believable anatomy/materials and no worse than baseline. Retain the existing hand-size budget; further asset growth requires a measured quality reason.

### O-5. Make the existing offline explosions more legible and detailed

Priority P1. Preserve the approved broader fire, staggered rhythm and visual energy. Do not return to weak wall flares, increase all nominal radii blindly or merge the three origins into an undifferentiated bright cloud.

Current authoritative impact values:

| Impact | World x | Nominal radius | Hit progress |
| --- | --- | --- | --- |
| Left | −5.46 m | 2.3 m | `.640` |
| Centre | +0.43 m | 3.0 m | `.657` |
| Right | +6.32 m | 1.9 m | `.674` |

The source’s different ignition offsets, core heights and projected positions were calibrated with different lens optics. Do not copy them over current passing values. Nominal radius also does not describe the complete current lobe/bloom silhouette; inspect rendered pixels.

#### Three missile approaches

Use the following source centreline points as offline authoring guides in the canonical content rectangle. They are proposed curves to fit, not already verified current trajectories:

| Trail | Design-space `(u,v)` control points | Proposed enter / preserved hit |
| --- | --- | --- |
| M1 upper left → left SUV | `(.004,.115), (.108,.225), (.204,.344), (.301,.474), (.366,.578), (.425,.655)` | `.540 / .640` |
| M2 low left → centre SUV | `(.004,.415), (.108,.488), (.204,.560), (.300,.628), (.400,.680), (.508,.725)` | `.546 / .657` |
| M3 upper right → right SUV | `(.930,.095), (.839,.230), (.758,.353), (.677,.475), (.620,.560), (.591,.610)` | `.552 / .674` |

Fit endpoints to the current SUV target, distinguish missile contact from art-directed fire-core location, and preserve the registration contract. Reconstruct curves with existing projection helpers; no camera adjustment is permitted. Arc-length acceleration using a candidate `t^1.4` is useful, with `t = (p − enter_i)/(hit_i − enter_i)`, not the source’s shared `.640` denominator.

Add aged trail volume behind the head and let it persist after impact. The source proposes up to 1.6× widening and roughly 35% residual opacity by `.85`; review those values against our sky and current plume density. Retain recognizable upper-left, low-left and upper-right routes. These are Blender changes, not live ribbon reconstruction.

#### Fire, smoke and debris

- Preserve a brief bright ignition per impact with a readable warm core, orange midtones, darker exterior folds and delayed soot. Source palette hints are `#FFF6B0`, `#FF6A00`, `#9E1B00`, `#2A1E17`; use them as graded appearance guides, not fixed emissive outputs.
- Keep the centre event dominant and the three origins identifiable during ignition, even if outer fire overlaps later. Do not reduce perceived impact merely to make the plumes separate.
- Improve turbulent form and sunlit smoke edges. Review `.66`, `.69`, `.72`, `.80`, `.85`, `.93` and `1.0`, including paused frames.
- Investigate detached bright patches in late smoke. Heat/emission should remain connected to burning material and decay into soot rather than leaving unrelated white cells floating through the exit.
- Retain deterministic seeded variation. Do not replace all existing seeds with source seed `0x5A17`, which would change unrelated scenery and imagery.
- Existing ballistic debris remains the starting point. The source’s 80 chunks, weighted centre/left/right as 40/22/18 and including six hull plates, is an optional upper-detail candidate, not a mandatory count. Use a small preview before raising it.
- Keep closed-form trajectories with world gravity around 9.81 m/s²; source launch ranges 8–13 m/s upward and −6–6 m/s laterally are tuning suggestions. Fit visual landing around `.70–.76` to the preserved stagger. Do not run a browser rigid-body simulation.
- If vehicle/silhouette visibility changes are added, hide them under their own ignition flash and retain recognizable spatial anchors. No thrown/injured people, weapons or insignia.

#### Ground interaction

Refine the existing low dust/shockwave with the source’s fence-base dust idea: approximately 12 irregular puffs along x≈−9.5, z≈−34 to −10, starting after the first impact around `.646` and tapering by `.80`. Use warm sand dust against cooler sky; avoid an opaque screen-wide wipe.

The source’s expanding ground annulus, `R(s)=38(1−exp(−s/1.1))` m and peak lift about 1.4 m, is a visual/scale candidate. It depends on its blast-time conversion and must not be transplanted unchanged. Aim for an approaching low wave near `.80` without engulfing the fixed camera or masking the arcade. Bake local warm light into sand, wall and vehicles. Retain the existing restrained live foreground flash response; add no browser world-light system or global exposure pulse by default.

Acceptance: stronger or equal perceived impact versus baseline; discernible ignition origins, believable trail persistence, grounded dust and readable late smoke; exact camera/landmark scale throughout. All authoring is deterministic and reversible through plate selection.

### O-6. Recover selected coastal details without rebuilding the set

Priority P2, after playback and optics. Improve one small offline group at a time. Keep current scanned/PBR materials, original scene organization and calibration.

| Source detail | Candidate refinement and protected anchor |
| --- | --- |
| Sky and ocean | Gentle cyan depth: source zenith/horizon `#4DB6CE/#B8E6E8`, ocean `#62D0DC`; restrained cirrus/cumulus with no sun disc or busy animated sky |
| Sand and right berm | Source warm sand `#F3D58D/#E2BC6B`, approximately 0.35 m ripple wavelength, sparse footprints and the low right-hand trench; retain believable scanned texture and contact shadows |
| Fence and retaining wall | Pickets, rails, finials, pier depth, 0.9 m retaining wall and narrow hedge; source calls fence calibration low-confidence, so compare rather than blindly relocating |
| Compound wall | Retain approximately z=−35 and 2.45 m height; locally improve coping, chipped plaster, rubble, breach depth and small bougainvillea accents |
| SUVs | Preserve centres x≈−4.06, +0.43, +4.92 at z≈−31; improve tyre contact, grille/windshield variation and weathering within current silhouettes |
| Right garden | Source statue anchor x≈12.1, z≈−19.7 and nominal 3.1 m height; improve the existing fountain/statue group locally, with urn/planter/agave detail if useful |
| Umbrella | Cream rather than paper-white (`#EADFC4` as appearance guidance); refine canopy ribs and nearby furniture without moving the current calibrated landmark |
| Palms | Preserve the lone palm near (−7.3, −38), nominal height 7.9 m; irregular crowns and depth behind the wall matter more than mechanically reaching the source’s 18-palm count |

Keep current sun direction `(12,24,14)` and matched foreground/background lighting. Do not reset current illumination to v1.1’s directional `3.8`/hemisphere `.85`, or add its bloom/LUT recipe globally. Avoid any new wall/object footprint that breaks current landmarks or causes a different crop at ultrawide sizes.

Acceptance: existing frame-parity gates remain green; paired before/after frames improve depth/material detail without overwhelming the negative sky/sand space or changing the page’s identity.

### O-7. Audit small arcade/navigation gaps; preserve the games

Priority P1 for edition correctness, P2 for loading/metadata polish. This package is separate from visual hero work and must not block an independently shippable hero improvement.

Current source inspection identifies hardcoded October defaults/badge checks and an `unlock=all` path that needs production restriction. The current fixed UTC offset also needs a consistent DST policy. Scope:

1. Derive the default edition and unsolved navigation signal from the latest unlocked edition, rather than hardcoded `2026-10` values. Preserve saved progress and selected-game behavior.
2. Proposed calendar decision: use `America/New_York` for OSU monthly unlocks and countdowns, handling DST consistently. This intentionally differs from v1.1’s visitor-local wording; confirm the product decision before that future change. Do not use one fixed UTC−04 offset for every month.
3. Restrict `?unlock=all` to development/preview, matching the source’s intent. Client-side edition gating prevents accidental UI spoilers, not inspection of future answers already shipped to the browser; do not claim secrecy or add accounts/backend to solve it.
4. Audit `/games`, `#arcade`, `edition`, `game` and `mode` deep links, invalid/locked edition fallback, history and command-palette destinations. A direct arcade visit must keep skipping cinematic downloads.
5. Preserve Tamil NFC/grapheme logic, variable 3–8-column Tamil rows, existing dictionary/data audits, four Thodarpu groups of four unique tiles, category contrast and the KOLAM collision correction. Do not import missing rules or a new dictionary from the source’s introductory claims.
6. Keep completion monthly. Review metadata or UI that implies daily streak tracking; use actual existing completion semantics.
7. Measure bundle composition before requiring lazy loading. `GamesHub` imports both games and game data reaches the dictionary; split only if the measured payload warrants it, using installed tools and preserving current cards/SSR poster. A server/client architecture migration is not itself a deliverable.
8. Retain the accessible “new puzzles” signal, not color alone; verify current ring/contrast and `aria-label`. Keep Tamil `lang="ta"`, zero letter spacing and body line-height at least 1.6, overriding the source’s weaker 1.5 value.

No puzzle rewrite, new card layout, teaser redesign, audio recipes, backend, account flow, new game or invented edition content is included.

## 6. Targets and acceptance matrix

The table distinguishes measured baseline from proposed optimization goals. No target is a claimed current pass.

| Area | Baseline | Proposed gate |
| --- | --- | --- |
| Camera | Fixed and numerically checked | Invariant pose/FOV/shift for all progress and time; unchanged image landmarks through `.93` and `1` |
| Playback | Longest observed moving-sample interval 200.2 ms locally | Warm controlled run maximum ≤150 ms; no multi-second hold, backward jump or loss of exact settled target |
| Actual rendered frames | Not independently measured | Tier A at 1440 × 900: median ≥58 FPS, 1% low ≥45, no frame >33 ms in `.64–.70`, across three isolated runs |
| Tier B / portrait | B unmeasured; portrait static | Propose B median ≥45 FPS; portrait/Lite remain static with responsive touch and no cinematic downloads; no animated-mobile FPS claim |
| First ready | 2,055.1 ms in one local Iris Xe visit | ≤2,000 ms under a recorded equivalent local cold-load protocol; separately measure real network conditions |
| Poster LCP / CLS / game INP | Not established by first-ready timing | Source targets: LCP ≤2.0 s, CLS 0, INP ≤200 ms; measure independently |
| Background transfer | 7.60 MiB | Default ceiling 8.0 MiB and unchanged sample count; an exception needs visual and bandwidth review before delivery |
| Hand/posters | Existing hand and eight valid posters | No hand growth by default; J1 poster ≤90 KiB, other posters ≤120 KiB each; keep WebP unless measured AVIF benefit justifies a format change |
| Decode resources | Six cached/four pending | Same hard ceilings, verified during continuous input, reversal, pause and teardown |
| Memory | Full accounting unmeasured | Provisional GPU ceilings 120 MiB A/60 MiB B; CPU bitmaps reported separately; measure attachments/shared allocations, not compressed bytes |
| Runtime geometry/draws | Need complete per-frame accounting | No increase over measured hybrid baseline without review; source’s 85-call/220k-triangle procedural allowances do not authorize rebuilding that workload |
| Incremental JS/dictionary | Not audited | Source targets 150 KiB gzip route-specific hero code, 60 KiB gzip dictionary, measured with shared framework code reported separately |
| Fallbacks/accessibility | Existing static/skip/lifecycle cases pass | Preserve all; keyboard and screen-reader review, no overflow at 375 px, ≥48 px controls, visible focus and no flash in reduced motion |
| Console | Existing verification has no page errors | No new page/media/GL errors or unhandled rejection; record existing library deprecations separately |

For fallback paths, do not regress the current useful still selector into an automatic scrolling strip. Preserve original `.10/.42/.72/.93` stills and do not substitute v1.1’s portal `.95` still. A context loss continues to produce the useful static experience; automatic context rebuilding is not required.

## 7. Calibration, source safety and release method

### Keep mathematical and visual checks distinct

Retain `verify-frame-parity.mjs` and `verify-lens-registration.mjs`, including current seven-viewport checks and current optical parameters. Old v1.1 anchor/ignition numbers, `1.06×` optics and portrait margin tables must not replace the current working contracts.

Add actual-image review at `.66`, `.72` and `.85`: do the visible hot areas occupy the intended left-lens centre/right-lens nose region, with the left event reading outside the left aperture? The source proposes ≥25% hot-pixel occupancy in registered boxes. First define masks, luminance/color rules and baseline results; do not enforce that threshold blindly against ivory cores, defocused aperture edges or smoke. A math pass does not establish a visible-core pass.

When lawful reference images are available, use private offline comparison or a development-only local-file overlay at 50% opacity. Never serve `docs/reference/` through a production route or copy it into `public`. Keep reference-guided review optional when attachments are unavailable; absence must be explicit, not a claim of parity.

### Preserve the existing result during asset work

1. Record current working-tree source hashes, calibration, manifest, final keyframes and rights evidence. Preserve uncommitted work; do not reset to the base commit.
2. Save an immutable baseline delivery and source snapshot before any future edit.
3. Work in a new local render/staging directory. Render one affected preview first, compare against baseline, then approve the affected interval. No full-sequence rerender for a local issue unless dependencies require it.
4. Reuse old masters only when their inputs are demonstrably unchanged, with source hashes and per-file SHA proof, as the existing pipeline supports.
5. Encode to the existing staging override and verify actual files, dimensions, byte declarations, hashes and poster/GLB budgets before touching the active delivery. New imagery must produce a new content revision.
6. Install matching files and manifest as one validated delivery operation, with a rollback snapshot and no concurrent live verification reading a half-installed revision. Check fresh and previously cached navigation behavior.
7. Rerun focused source/media checks, inspect keyframes and perform a clean browser visit. Roll back candidate files and their matching manifest together if any protected behavior fails.

No package installation, cloud upload, publishing, deployment or hosting-plan change is authorized by this PRD. Free local tooling remains the production path; record disk/render time honestly and exclude unexplained wall-time outliers from render-rate promises.

## 8. Future work packages and owning paths

These are future implementation packages, not instructions to start coding now.

| Package | Work | Existing owner paths | Exit condition |
| --- | --- | --- | --- |
| 0. Baseline | Snapshot current source/media and measurement protocol | `art/games-hybrid/`, current manifest, evidence | Baseline recoverable; protected behavior and old measurements clearly recorded |
| 1. Measure and optimize playback | O-1/O-2; correct diagnostics, identify actual cost, smallest proven optimization | `GamesHeroCanvas.tsx`, `GamesFocusScene.tsx`, `hybridMedia.ts`, existing HUD/renderer diagnostics | Actual timing/memory report and no scheduling/lifecycle regressions |
| 2. Optical/foreground polish | O-3/O-4; one ROI/material/blur candidate at a time | `EyeglassHandRig.tsx`, `compositor/LayeredFocusCompositor.ts`, existing hand asset/source | Before/after image evidence, registration, color and performance gates |
| 3. Offline effects refinement | O-5; approach curves, trails, plume/heat/dust continuity | `scripts/render-games-hybrid.py`, `scripts/games-hybrid-assets.mjs`, `art/games-hybrid/` | Preview approved, targeted masters rendered, staged delivery verified |
| 4. Coastal set detail | O-6; optional local look-development pass | Existing Blender authoring/source | Better detail without a composition/transfer regression |
| 5. Arcade correctness audit | O-7; edition/default/badge/preview gating, then measured loading fixes | `src/components/games/`, `src/lib/gamesStorage.ts`, `src/data/gamesData.ts`, `FloatingNav.tsx`, `CommandPalette.tsx`, route metadata | Monthly/deep-link/Tamil behavior preserved; explicit timezone decision tested |
| 6. Final acceptance | Integrated source/media/browser/art review | Existing scripts, focused unit/browser tests and evidence | Defined gates passed or explicitly recorded as unmet; no inferred FPS or photographic approval |

The hero component paths above are under `src/components/games-hero/`; the source metadata/routing paths remain under their existing directories. Reuse helpers, exports and tests before adding new modules. Implement one package at a time so any visual/performance change has an identifiable cause.

## 9. Verification plan for future implementation

Keep existing checks. Add only focused regressions for newly changed behavior.

- Unit checks: fixed camera/hand endpoints, exact/nonuniform sample selection, delayed continuous decode, reordered completions, real reversal, deadlines, retry ownership and closing resources. For O-7, add month-boundary/DST/deep-link/production-preview cases without modifying real puzzle content.
- Existing numeric checks: `node --experimental-strip-types scripts/verify-frame-parity.mjs`, `scripts/verify-lens-registration.mjs` and `scripts/verify-games-hero.mjs`.
- Asset checks: `node --experimental-strip-types scripts/games-hybrid-assets.mjs self-test` and `verify`; keep `npm run prebuild` gates. Unique moving hashes are necessary but not sufficient art evidence.
- Source checks: `npm test`, `npm run typecheck`, affected-file ESLint; a production build for rendering/bundling or server/client changes. Use installed Next.js docs before any framework-boundary change.
- Browser checks: reuse `tests/games-hybrid.spec.ts`. Preserve current 21-case coverage, including real pixels, neutral color, no-cinematic-download modes, native 375 px touch, immediate skip, ordinary scrolling, delayed motion, hidden startup and offscreen reentry.
- Cross-browser/device acceptance: verify supported Firefox and actual Apple-device Safari, including decoding/color, touch, resize/orientation, visibility recovery and memory pressure. If those devices/browsers are unavailable, record the gates as deferred with a release decision; Chromium emulation does not establish an Apple-device pass.
- Visual captures: 1912 × 800 at `.10/.42/.66/.69/.72/.80/.85/.93/1`, plus current viewport matrix and 375 × 812 portrait stills. Wait for poster fade completion. Review stationary landmarks, grip, lens rims, fire origins, trails, ground contact, late heat and text/focus visibility.
- Performance: three isolated hardware runs after rendering/build/test jobs stop, with cold and warm conditions distinguished. Record actual renderer frames, callback cadence, completed media advancement, CPU/GPU stages and memory independently. Never infer one from another.
- Accessibility/art: manual keyboard and screen-reader pass; reduced-motion and Lite checks; paired art review. Preserve Tamil meaning, mark any proposed translation changes for the existing Tamil review process, and use current semantic tokens/fonts.

Do not require a single huge browser run when bounded runs give the same final source/media coverage, but record exact commands, revisions, failures, harness fixes and results. Do not loosen assertions silently to pass an environment limit.

## 10. Decisions and stop condition

Decisions proposed for review before their respective future work package:

| Decision | Proposed default |
| --- | --- |
| Month boundary | OSU `America/New_York`, consistently across unlock, badge and countdown; confirm before changing current behavior |
| References | Use private lawful references if supplied; otherwise baseline-relative review and explicit “parity unverified” |
| Bokeh refinement | Retain current pass graph; add taps/filtering only for a demonstrated artifact within measured cost |
| Art scope | Preserve existing hand, scenery and stronger explosions; local materials/trails/dust/late-smoke improvements first |
| New technology | None required; any worker/video/compression/physics or fluid-simulation replacement needs separate scope approval |
| Publishing | Separate authorization after a concrete validated candidate; no deployment in this task |

This task is complete when this separate PRD has been checked for source fidelity, valid local references, explicit conflict resolution and preservation of the current hybrid behavior. Stop here. Do not modify runtime code, regenerate media, install tools, run application builds/browser sessions, or begin any implementation package under the documentation request.
