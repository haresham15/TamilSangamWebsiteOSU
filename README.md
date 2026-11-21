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
│   │   ├── gallery/                  # Memory Vault, 35mm archive, Polaroid stacks & Studio Envelopes
│   │   ├── games/                    # Sangam Arcade daily hub (Sollu Wordle, Thodarbu, 12 games)
│   │   ├── guide/                    # Student knowledge base, dining guide & Solari departure hero
│   │   ├── suggestions/              # Ideas Hearth & Ohio Stadium 3D blueprint hero
│   │   ├── join/                     # Membership gateway & Morning Campus gates hero
│   │   ├── links/                    # Ultra-light bio hub (<30 KB, no WebGL) for mobile bio
│   │   └── faq/                      # Searchable categorized FAQs & student life queries
│   │
│   ├── components/                   # UI components partitioned by feature domain
│   │   ├── navigation/               # Sikku Kolam dual-trigger unraveling navbar & route engine
│   │   ├── events/                   # Event list, dossier views, SplitText, ParallaxScatter, VaultGateway
│   │   ├── gallery/                  # Tactile Studio Envelopes, authentic Polaroids & Year Ledger
│   │   ├── games/                    # Sangam Arcade daily game engine, Sollu Wordle & Thodarbu
│   │   ├── gen3/                     # Leo concert stadium 3D arena (trusses, crowd, torches, emblem)
│   │   ├── hero/                     # Digital Kolam conveyor peel hero & Lissajous flow math
│   │   ├── gallery-hero/             # 24-fret 12-TET guitar neck highway & string physics
│   │   ├── guide-hero/               # Solari mechanical split-flap departure board
│   │   ├── board/                    # Chola Darbar corridor treadmill, oil lamps & 3D crown
│   │   ├── suggestions/              # Ohio Stadium 3D wireframe blueprint scene
│   │   ├── join/                     # Morning campus collegiate wrought-iron gates & leaf drift
│   │   ├── gl/                       # Persistent GlobalCanvas, view scissoring & asset pre-warm
│   │   └── ui/                       # Reusable primitives (KolamLoader, DitherVeil, Magnetic, etc.)
│   │
│   ├── engine/                       # Core simulation & rendering coordinator
│   │   ├── masterTick.ts             # Single unified rAF ticker with delta clamping (≤ 50ms)
│   │   ├── governor.ts               # Dynamic frame-rate quality governor (Levels 0, 1, 2)
│   │   └── spring.ts                 # Underdamped physics spring solvers for magnetics
│   │
│   ├── gl/grade/                     # Cinematic color grading (AGX tonemapper, 33³ LUT strip)
│   ├── audio/                        # Web Audio synthesis singleton, impact bus & sound design
│   ├── data/                         # Typed static data (events, gallery, board, constitution, games)
│   ├── lib/                          # Server-side utilities, photo pool randomizer & Tamil graphemes
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
│   ├── content-audit/                # 10 full-page captures + interactive Framer inspection board
│   └── archive/                      # Historical scratch screenshots
│
└── tests/                            # Playwright end-to-end tests & Vitest unit suites
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

- **Kanchipuram Courtyard & Temple Stone Palette:** Warm temple neutrals (Warm Ivory `#FAF6F0`, Sunlit Sandstone `#F0E6D6`), Royal deep anchors (Sangam Deep `#1C122B`, Royal Violet `#25173B`, Peacock Deep `#102830`), and Hero bridging accents (Zari Gold `#C79347`, Temple Bronze `#9A6B3E`/`#D4A36A`, Radiant Bloom `#2BB5A8`, Kumkum Red `#B84A39`). Strictly zero un-tinted black (`#000000`), zero card clutter, and zero decorative emoji bullets.
- **Sikku Kolam Dual-Trigger Navigation:** Dual-trigger unrolling navigation bar (context pill + Brahmamudi knot toggle) orchestrating 8 primary prioritized routes with spring physics and mobile 2-column drawer.
- **Master PRD:** Read [`PRD.MD`](./PRD.MD) for full subsystem specifications, mathematical derivations, and invariants.
- **Design Tokens:** Read [`DESIGN.md`](./DESIGN.md) and [`design/tokens.json`](./design/tokens.json).
- **Tamil Text Safety:** Never split Tamil text by code unit; all kinetic text uses `Intl.Segmenter` with grapheme cluster granularity (`lang="ta"`, `letter-spacing: 0`, line-height $\ge 1.6$).

---

## 📄 License & Student Organization

© 2026 OSU Tamil Sangam. Registered Student Organization at The Ohio State University, Columbus, OH.
