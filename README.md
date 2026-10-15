# (ஐந்திணை) — OSU Tamil Sangam Website

> **Start the Aatam, Paatam, and Kondatam!** — ஆட்டம் · பாட்டம் · கொண்டாட்டம்  
> The official bilingual digital platform of the Ohio State University Tamil Sangam.

Built with **Next.js 16.3 (App Router)**, **React 19**, **Tailwind CSS v4** (`@theme` OKLCH), **Three.js (r186) / React Three Fiber**, **GSAP**, and **Web Audio API**.

---

## 🧭 Repository Structure

```text
TamilSangamWebsiteOSU/
├── src/                              # Core application source code
│   ├── app/                          # Next.js 16 App Router routes, layouts, and API
│   │   ├── (home) page.tsx           # Home Courtyard & Digital Kolam conveyor hero
│   │   ├── events/                   # The Gatherings River & Leo factory stadium hero
│   │   │   └── [slug]/               # Randomized Editorial Dossier & ReactBits kinematics
│   │   ├── about/                    # Mission, timeline, alliances & democratic constitution
│   │   ├── board/                    # Executive leadership, trading cards & Chola Darbar hero
│   │   ├── gallery/                  # Memory Vault, 35mm archive & Fretboard Highway hero
│   │   ├── guide/                    # Student knowledge base & Solari split-flap departure hero
│   │   ├── suggestions/              # Ideas Hearth & Ohio Stadium 3D blueprint hero
│   │   ├── join/                     # Membership gateway & Morning Campus gates hero
│   │   └── links/                    # Ultra-light bio hub (<30 KB, no WebGL) for mobile bio
│   │
│   ├── components/                   # UI components partitioned by feature domain
│   │   ├── events/                   # Event list, dossier views, SplitText, ParallaxScatter, VaultGateway
│   │   ├── gen3/                     # Leo concert stadium 3D arena (trusses, crowd, torches, emblem)
│   │   ├── hero/                     # Digital Kolam conveyor peel hero & Lissajous flow math
│   │   ├── gallery-hero/             # 24-fret 12-TET guitar neck highway & string physics
│   │   ├── guide-hero/               # Solari mechanical split-flap departure board
│   │   ├── board/                    # Chola Darbar corridor treadmill, oil lamps & 3D crown
│   │   ├── suggestions/              # Ohio Stadium 3D wireframe blueprint scene
│   │   ├── join/                     # Morning campus collegiate wrought-iron gates & leaf drift
│   │   ├── gl/                       # Persistent GlobalCanvas, view scissoring & asset pre-warm
│   │   └── ui/                       # Reusable primitives (Magnetic, WatermarkGlyph, DitherVeil, etc.)
│   │
│   ├── engine/                       # Core simulation & rendering coordinator
│   │   ├── masterTick.ts             # Single unified rAF ticker with delta clamping (≤ 50ms)
│   │   ├── governor.ts               # Dynamic frame-rate quality governor (Levels 0, 1, 2)
│   │   └── spring.ts                 # Underdamped physics spring solvers for magnetics
│   │
│   ├── gl/grade/                     # Cinematic color grading (AGX tonemapper, 33³ LUT strip)
│   ├── audio/                        # Web Audio synthesis singleton, impact bus & sound design
│   ├── data/                         # Typed static data (events, gallery, board, constitution, FAQ)
│   ├── lib/                          # Server-side utilities & photo pool randomizer (event-photos.ts)
│   └── context/                      # React contexts (LocaleContext, AudioContext)
│
├── public/                           # Static assets, 3D models, fonts, and local event photo pools
│   ├── events/                       # Seeded local web-optimized photos per event slug
│   └── textures/                     # LUT strips, normal maps, and procedural noise
│
├── design/                           # Design tokens
│   └── tokens.json                   # W3C DTCG 3-tier OKLCH token ground truth
│
├── docs/                             # Engineering specifications, PRDs, and architecture records
│   ├── architecture/                 # System architecture, ADRs, and theming guides
│   ├── heroes/                       # Mathematical & shader specs for all 3D hero scenes
│   ├── redesign/                     # Historical briefs and Tamil linguistic review
│   └── screenshots/                  # Progression renders and state matrices
│
├── screenshots/                      # Full-page visual regression artifacts
│   ├── content-audit/                # 9 full-page captures + interactive Framer inspection board
│   └── archive/                      # Historical scratch screenshots
│
└── tests/                            # Playwright end-to-end tests
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js $\ge 20.0.0$
- npm or pnpm

### Installation
```bash
npm install
```

### Development Server
Starts the Next.js Turbopack development server on `http://localhost:3000`:
```bash
npm run dev
```

### Verification & Testing
```bash
# Type integrity check (0 errors required)
npm run typecheck

# Full production build
npm run build

# Playwright automated test suite
npm run test:guide-board

# Capture full-page content audit screenshots for all 9 routes
node scripts/capture-content-audit.mjs
```

---

## 🎨 Design Engineering Ground Truth

- **Muttram Philosophy:** Naked layouts on Warm Ivory (`#FAF9F6`), Charcoal (`#2A2825`), and Terracotta (`#B85C38`). Strictly zero card wrappers or decorative emojis.
- **Master PRD:** Read [`PRD.MD`](./PRD.MD) for full subsystem specifications, mathematical derivations, and invariants.
- **Design Tokens:** Read [`DESIGN.md`](./DESIGN.md) and [`design/tokens.json`](./design/tokens.json).
- **Tamil Text Safety:** Never split Tamil text by code unit; all kinetic text uses `Intl.Segmenter` with grapheme cluster granularity.

---

## 📄 License & Student Organization
© 2026 OSU Tamil Sangam. Registered Student Organization at The Ohio State University, Columbus, OH.
