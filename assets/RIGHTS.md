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

