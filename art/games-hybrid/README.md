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

External source and exact licensing evidence: [source manifest](source-manifest.json), [MakeHuman original CC0 license](licenses/MAKEHUMAN-CC0.md), and [repository rights register](../../assets/RIGHTS.md).

Known unfinished art gates: the anatomical core mesh has a programmatic grip deformation and needs human anatomy/contact review; original generated skin maps are a material candidate, not a scanned skin claim. Fire, smoke and dust use original deterministic procedural **volume shading**, not a baked Mantaflow gas simulation. Thus the PRD's gas-cache and approved close-up/material gates remain unmet. Review three-plume separation, detailed palm silhouettes, ground contact, exit optical depth, and temporal stepping before production acceptance. No deployment or hosting-quota verification is included.
