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
