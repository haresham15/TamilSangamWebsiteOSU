# Architectural Decision Record (ADR 001)
## Resolution of Creative Direction & 3D Canvas Architecture

**Date**: September 26, 2026  
**Status**: Adopted & Authoritative  
**Decision Maker**: Lead Solutions Architect & Project Owner

---

### Context & Problem Statement
During initial phases of development, multiple divergent documents existed in the repository:
1. `PRD.MD` (Sep 20, 2026): Aintinai five-landscape system with strict ban on borrowed pop-culture IP.
2. `AGENTS.md` §13: Digital Kolam + Kanchipuram Silk + Gopuram Z-Scroll with a single persistent background canvas across all routes.
3. `docs/redesign/REDESIGN-BRIEF.md`: The "Emblem Engine" centered exclusively on the purple/mint roundel logo medallion.
4. Active Codebase: High-fidelity, bespoke per-page heroes (Join = Nanban Gate, Board = Chola Darbar, Events = Stadium Rock Arena, Gallery = Acoustic Strings, Guide = Split-Flap Board).

### Authoritative Decisions (Phase 0)

#### 1. Creative Direction: Option A (Live Per-Page Hero System)
The live codebase's per-page thematic concepts are **authoritative and ratified**:
- **Home (`/`)**: Digital Kolam Particle Vortex & Mask Reveal
- **Join (`/join`)**: Nanban Collegiate Campus Arch & Gates of Belonging
- **Board (`/board`)**: Chola Darbar Imperial Senate Corridor Treadmill
- **Events (`/events`)**: Stadium Rock Arena & Concert Rig Lighting
- **Gallery (`/gallery`)**: Acoustic Strings (Vaaranam Aayiram tribute)
- **Guide / FAQ (`/guide`)**: Solari Split-Flap Campus Transit Board
- **About (`/about`)**: Gopuram Z-Axis Parallax Push

#### 2. 3D Canvas Architecture: Option A (Per-Page Independent Canvases)
- The site operates on **independent, route-scoped `<Canvas>` instances** mounted only when their route is active.
- Each 3D component is responsible for disposing Three.js geometries, materials, render targets, and textures upon component unmount.
- The dormant `GlobalCanvas.tsx` has been decommissioned.

#### 3. Color Token System (DTCG 3-Tier OKLCH)
- All background fills, text colors, and hero-to-content gradient transitions MUST trace back to the three-tier token architecture in `design/tokens.json` and `src/app/globals.css`.
- Ad-hoc hex literals (`#050201`, `#FFF3DC`, `#FFFBF3`, etc.) are banned in favor of semantic OKLCH tokens (`var(--color-surface-hero-...)`).
- All gradient transitions interpolate natively in OKLCH (`linear-gradient(in oklch, ...)`).

#### 4. Anti-Roblox 3D Lighting & Materials Mandate
- No stock Drei `<Environment preset="..." />` skyboxes. All scenes use custom-authored, palette-matched procedural environment maps.
- All metallic elements (`metalness > 0.3`) rely on specular environment reflection.
- PBR materials MUST include micro-surface bump maps (brick mortar, limestone grain, hammered metal).
- ACESFilmicToneMapping is calibrated on all canvas instances.
- Camera crane movements use dampened spring inertia (`THREE.MathUtils.damp`).
