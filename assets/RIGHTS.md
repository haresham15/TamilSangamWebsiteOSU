# Asset Rights and Attributions

## 1. Join Hero — "The Morning Campus" (`/join`)

### Procedural PBR Textures (`public/textures/join/`)

- **Files**:
  - `limestone_diffuse.png`
  - `limestone_normal.png`
  - `limestone_roughness.png`
  - `cobblestone_diffuse.png`
  - `cobblestone_roughness.png`
- **Origin / Source**: Synthesized procedurally offline using mathematical noise functions (multi-scale value and gradient noise) via `scripts/generate-join-textures.mjs`.
- **License**: **CC0 1.0 Universal (Public Domain Dedication)**.
- **Attribution**: Created specifically for OSU Tamil Sangam. Dedicated to the public domain. Free for commercial, personal, educational, and creative reuse with zero royalties or restrictions.
- **Network Footprint**: 100% self-hosted, offline, zero third-party CDN dependencies.

### Ironwork Lattice Materials

- **Variant A**: High-specular wrought iron (`#1A1A1A`, metalness 0.9, roughness 0.25). Procedural PBR shader.
- **Variant B (Recommended)**: Matte painted collegiate architectural iron (`#141414`, metalness 0.35, roughness 0.42, clearcoat 0.3, clearcoatRoughness 0.4). Procedural PBR shader.
- **Brass Fixtures**: Architectural brushed brass (`#D4AF37`, metalness 1.0, roughness 0.3).

### Cultural Motifs & Typography

- **Tamil Typography**: Mukta Malar (`var(--font-tamil)`), Anek Tamil (`var(--font-display)`), rendered in accordance with classical orthographic rules (no uppercase, no split glyph clusters).

## 2. Sensory Layer — Color Grading & Audio Synthesis

### Color Grade LUT (`public/luts/heritage-33.png`, `public/luts/identity-33.cube`)

- **Origin / Source**: In-house mathematical generation and DaVinci Resolve target curve (sRGB/Rec.709 display-referred warm heritage tone). Compacted from `.cube` to 1089x33 PNG strip via `scripts/cube-to-strip.mjs`.
- **License**: **CC0 1.0 Universal (Public Domain Dedication)**.
- **Attribution**: Authored specifically for OSU Tamil Sangam. Dedicated to the public domain. Neutral identity fallback synthesized procedurally via `scripts/make-identity-lut.mjs`.

### Acoustic Audio Synthesis (`src/audio/`)

- **Origin / Source**: 100% synthesized in Web Audio API code (`AudioController.ts`). Zero external audio samples, ripped files, or third-party audio assets.
- **Attribution**: Custom procedural synthesis (mechanical relay thud, Solari flap clacks, Karplus-Strong strings, shutter swells).

## 3. Games Hybrid Offline Candidate (`/games`)

Production source and exact downloaded-file hashes live in [the source manifest](../art/games-hybrid/source-manifest.json); reproduction and unfinished art gates are in [the production README](../art/games-hybrid/README.md). Download date: 2026-10-27. All delivered files are self-hosted; source maps are used offline only.

- **Anatomical hand**: MakeHuman core `base.obj`, credited in its own header to Data Collection AB, Joel Palmius and Jonas Hauquier. Source: [official core mesh](https://github.com/makehumancommunity/makehuman/blob/master/makehuman/data/3dobjs/base.obj). License: CC0 1.0, verified from that header and [official asset license](https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.ASSETS.md); [unmodified local license text](../art/games-hybrid/licenses/MAKEHUMAN-CC0.md). Changes: cropped right hand/forearm, fixed grip deformation, subdivision, repacked UVs, original skin candidate maps. Output: `public/models/games/hand-grip.glb` and original still renders. No attribution is required by CC0; source credit is retained here.
- **Sand**: [Coast Sand 02](https://polyhaven.com/a/coast_sand_02), Rob Tuytel / Poly Haven, 1K diffuse and OpenGL normal maps. **Wall plaster**: [Rough Plaster 03](https://polyhaven.com/a/rough_plaster_03), Rob Tuytel / Poly Haven, 1K diffuse map. License: CC0 1.0 under [Poly Haven's asset license](https://polyhaven.com/license). Changes: original Blender material scaling, geometry, lighting and rendering; no website example renders used. Outputs: `public/media/games-hybrid/v1/landscape/*.webp` and `posters/*.webp`. No attribution is required by CC0; creator credits are retained here.
- **Original scene and maps**: repository-authored unbranded vehicles, wall/fountain, palm geometry, glasses poster geometry, generated skin maps and deterministic volumetric fire/smoke/dust. Source: `scripts/render-games-hybrid.py` and `scripts/games-hybrid-assets.mjs`. These are original repository contributions; no new CC0 dedication or external license claim is asserted. Blender's GPL does not impose GPL on rendered artwork; see [Blender licensing](https://www.blender.org/about/license/).
- **Posters**: original Blender renders from the same calibrated scene, including foreground where visible. Portrait images use the separate calibrated portrait camera. Legacy `j1`–`j4` images originate from repository `scripts/generate-games-stills.mjs` SVG authoring; new runtime paths replace them with these original renders.

No film frames, film posters, extracted footage, actor likenesses, copied logos or film audio were downloaded or used. Procedural skin and volume shading are explicitly art candidates; the records establish provenance, not photoreal quality or approval of the PRD's gas-simulation gate.
