# Games hybrid offline source

Original Blender production candidate, using the current TypeScript camera rail.
**Art status: draft, review required.** This source does not establish approved photorealism or film-frame parity. Reference film screenshots were unavailable.

Required local software: Blender 4.5.3 LTS; installed Node 22 and project dependencies (`sharp` is supplied by the existing installation). No paid services, new npm packages, browser media APIs or runtime external downloads.

From repository root, PowerShell:

```powershell
node --experimental-strip-types scripts/games-hybrid-assets.mjs export
node --experimental-strip-types scripts/games-hybrid-assets.mjs skin
$renderRoot = Join-Path $env:TEMP 'games-hybrid-renders'
& 'C:/path/to/blender.exe' --background --factory-startup --threads 10 --python scripts/render-games-hybrid.py -- --output $renderRoot --engine eevee --samples 64 --keep-hand --preview --points '0.1,0.72' --posters
# Inspect the four original keyframes and hand close-up before approving the full batch.
& 'C:/path/to/blender.exe' --background --factory-startup --threads 10 --python scripts/render-games-hybrid.py -- --output $renderRoot --engine eevee --samples 64 --keep-hand --all
$env:GAMES_RENDER_ROOT = $renderRoot
node --experimental-strip-types scripts/games-hybrid-assets.mjs encode
node --experimental-strip-types scripts/games-hybrid-assets.mjs self-test
node --experimental-strip-types scripts/games-hybrid-assets.mjs verify
```

`--hand-only` exports the fixed anatomical grip GLB without rendering backgrounds. `--posters` renders original hand-and-eyewear stills at the canonical landscape and separate portrait cameras. Background plates exclude the foreground. `posters` can encode just the eight static images before sequence delivery.

`camera-samples.json` records source commit, exact source-file SHA256 values, projection matrices, separate foreground transforms, current shared `FIREBALLS` timing and 149 explicit samples. The camera remains fully fixed through the final frame; no lens portal or forward travel is baked. Samples concentrate on incoming trails and the explosion; hand animation remains independently continuous in the browser. Five landmark reprojections are asserted inside Blender before rendering. Source scene geometry uses Three-to-Blender `[x,y,z] → [x,-z,y]`; camera shift is converted with a vertical sensor fit and verified by projection rather than copied blindly.

Lossless PNGs, the generated `.blend` scene and timing log remain in the chosen output directory. The script saves `games-hybrid.blend`; keep that directory on backed-up local storage. Rendering resumes by skipping existing PNGs. **Use a new output directory after changing scene source** to avoid mixing revisions. The delivered manifest revision hashes every final plate, poster and GLB; calibration has a separate source hash.

Color: AgX, Medium High Contrast, exposure -0.7, gamma 1, opaque display-referred sRGB PNG/WebP. One world sun direction `[12,24,14]`, energy 2.5, Nishita world fill 0.25. Background focus uses actual offline camera depth of field, not a runtime depth-plane approximation. Per-sample benchmark JSONL records actual render seconds, dimensions, sample count, Blender version and render engine.

Delivery uses EEVEE offline rendering at 64 samples on the available Intel Iris Xe GPU. The first shader-compiling benchmark took 360.47 seconds; the next frame took 12.52 seconds. A Cycles 8-sample comparison took 69.24 seconds. Cycles remains available with `--engine cycles --samples 16` for later final-quality art work. EEVEE is an explicit production-method deviation from the original Cycles proposal, selected to make a complete genuine sequence viable locally.

The volume candidate now evaluates continuous four-dimensional noise from progress, three staggered shared impacts, broad hot cores, persistent grounded soot billows, an expanding dust shockwave, ballistic masonry and approaching missile trails. Each frame is rendered from its own progress state. The verification command rejects repeated encoded hashes during approaching missiles and the moving explosion interval, while permitting genuine held establishing frames.

For a targeted effects revision, use `--all --from-progress 0.64` in a new output directory after copying and verifying only the unaffected earlier masters. This renders the impacted interval and blast/exit posters; the hand GLB remains unchanged with `--keep-hand`. Set `GAMES_DELIVERY_ROOT` to a temporary staging directory for encoding and validation before replacing the public delivery.

One normalized-fire preview recorded an anomalous 5,317.34-second wall duration: its sample log advanced from `17:31.96` at sample 1 to `17:39.79` at sample 64, while final output reported `1:28:37.01`. The cause was not established. Preserve this observation separately from ordinary render forecasts; see [the recorded preview measurement](preview-normalized-benchmark.jsonl).

Validated delivery, 2026-10-27: 149 landscape frames total 7,972,676 bytes (7.60 MiB); 126 frames in the checked moving intervals have unique image hashes. Eight posters are below 68 KiB each. The preserved hand is 977,736 bytes with 13,728 triangles and three embedded maps. Asset revision: `games-hybrid-f410c08628fed149`; final locked-camera calibration: `games-hybrid-8711113f4a97`. The approved fire uses optical density 8, a 1600–5500 K noise-remapped blackbody color and separately normalized emission with concentrated hot pockets. The 40 unaffected pre-impact frames and four early posters were reused after SHA256 verification; see [the reuse record](reused-unaffected-masters.json). All 109 affected frames and four blast/exit posters were rendered again.

Recorded wall times for the 149 delivered source frames total 8,283.38 seconds, with a 5.18-second median and a 7,147.93-second maximum. The large outlier is an observed timing anomaly with an unverified cause, not a sustained render-rate forecast; see [render measurements](render-benchmark.jsonl). The packed portable scene is available locally at `art/games-hybrid/games-hybrid.blend` (4,187,390 bytes, intentionally excluded from Git).

External source and exact licensing evidence: [source manifest](source-manifest.json), [MakeHuman original CC0 license](licenses/MAKEHUMAN-CC0.md), and [repository rights register](../../assets/RIGHTS.md).

Known unfinished art gates: the anatomical core mesh has a programmatic grip deformation and needs human anatomy/contact review; original generated skin maps are a material candidate, not a scanned skin claim. Fire, smoke and dust use original deterministic procedural **volume shading**, not a baked Mantaflow gas simulation. Thus the PRD's gas-cache and approved close-up/material gates remain unmet. Review three-plume separation, detailed palm silhouettes, ground contact, exit optical depth, and temporal stepping before production acceptance. No deployment or hosting-quota verification is included.

## Incremental optimization candidate — 2026-10-27

Baseline preserved before edits at `%TEMP%/games-hybrid-optimization-art-baseline`: 179 files including full `f410c08628fed149` delivery, original hand, art inputs and source scripts, with `sha256.json`. Rendered camera geometry from calibration `8711113f4a97`, 149 sample positions, landmark positions, hand GLB/maps and sunlight remain unchanged; the later live-only source-fingerprint update is documented below.

Candidate source fits the three PRD approach curves to existing SUV contact points, retains accelerated heads and aged trails after impact, adds 12 low fence-base dust puffs, and cools each existing broad fire core into soot instead of retaining white cells late. Small static candidates add fence masonry/coping depth and cream parasol canvas. These static changes require all source frames to be rendered if accepted. No new licensed inputs, geometry pipeline or browser particle system is introduced.

Corrected calibrated previews at `.60`, `.6905` (existing sample nearest `.69`) and `.93` in `%TEMP%/games-hybrid-optimization-preview-final` passed root visual review before bulk rendering. Early fire retains the baseline power-8 heat mask, 5500 K maximum and `p*15` noise phase; cooling begins only after age `.48`. Trails use tapered noisy volumes. Existing 42 ballistic fragments now settle and remain on the ground. All 149 masters and eight posters are complete in `%TEMP%/games-hybrid-optimization-final`; three exact approved preview masters were reused with [per-file SHA proof](optimization-reused-previews.json).

Installed after staging and independent verification, 2026-10-28: `games-hybrid-4f58ef6abe6ce549`, 149 frames totaling 7,999,474 bytes (7.63 MiB), 126 unique moving hashes, eight posters at most 67,878 bytes, unchanged 977,736-byte hand. Encoder requires every actual frame master, recomputes the content revision during verification, enforces 8 MiB sequence and 90/120 KiB poster ceilings, and retains the staging override. The empty-master probe correctly fails on `frame-0000.png`; no still substitution is accepted. The complete matching directory was swapped while Games browser readers were closed, then public verification passed. Both the immutable baseline and `%TEMP%/games-hybrid-installed-rollback-f410` remain available.

The authorized live foreground-blur correction changes the calibration source fingerprint to `games-hybrid-3b0518ed4bef`. Blender does not consume `foregroundBlur`. Re-exported metadata passed exact comparison for camera/background focus/bokeh, hand transforms/opacity, sample positions, impacts, color and dimensions; exported eyewear positions/indices are also identical. Original rendered metadata is preserved beside the masters. No existing rendered image became stale from that live-only correction.

The 149 delivered source frames account for 611.63 measured render seconds including the three reused previews; median 3.77 seconds, maximum 36.04 seconds. Eight posters add 27.48 seconds. These are offline wall-duration records, not browser FPS or promised render rates; rejected/exploratory previews are excluded. See [render measurements](optimization-render-benchmark.jsonl), [158-file delivery SHA inventory](optimization-delivery-sha256.json) and [optimization proof](optimization-art-proof.json) for source hashes, provenance, rollback and the limited peak-area comparison. Local packed Blender scene was updated; original licensed inputs and hand maps remain unchanged. Final browser/performance acceptance belongs to the integrated QA evidence; photographic/reference and human hand-anatomy gates remain open.
