# OSU Tamil Sangam — Documentation Index

This directory contains technical specifications, architectural decision records (ADRs), hero scene engineering documents, PRD specifications, and visual progression records for the OSU Tamil Sangam digital platform.

---

## 📂 Documentation Directory Map

```text
docs/
├── architecture/                     # System-wide design & engine specifications
│   ├── global-architecture-prd-v2.md # Master ticker, frame governor & sensory pipeline PRD
│   ├── architecture-decision-record.md# Key engineering decisions (Next.js 16, Three.js, Web Audio)
│   ├── EVENT_THEMING.md              # Cinematic lighting, palettes & landscape mappings
│   └── kolam-candidates.svg          # Vector curves & dot-lattice mathematical studies
│
├── heroes/                           # Hero Animation PRDs & Cinematic Universe Documentation
│   ├── README.md                     # Master Hero Matrix & Cinematic Universe Guide
│   ├── home-hero-peel-and-flow-prd.md# Digital Kolam conveyor peel & Thirukkural Genesis PRD
│   ├── events-hero-leo-concert-arena-prd.md # Leo concert arena Gen 3 PRD (128 BPM & God Light)
│   ├── events-animation-architecture-and-audit.md # Leo concert arena historical technical audit
│   ├── about-hero-gopuram-z-scroll-prd.md # 5-Tala Gopuram Z-Scroll & Sangam Ethos PRD
│   ├── board-hero-chola-darbar-prd.md# Ponniyin Selvan Chola Darbar Corridor PRD
│   ├── gallery-hero-prd.md           # Vaaranam Aayiram 24-Fret Acoustic Guitar Highway PRD
│   ├── gallery-hero.md               # Fretboard physics, string harmonics & timeline spec
│   ├── guide-hero-v3-station-sequence-prd.md # Alaipayuthey Blue Hour Station & Solari Board PRD
│   ├── guide-hero-v3.md              # Station schedule state machine & audio bus specs
│   ├── suggestions-hero-kaththi-war-room-prd.md # Kaththi War Room & Ohio Stadium 3D Blueprint PRD
│   ├── join-hero-collegiate-gates-prd.md # Morning Campus Gates & Buckeye/Jasmine Drift PRD
│   ├── event-dossier-prd.md          # Sunlit Randomized Dossier & ReactBits Kinematics PRD
│   │
│   └── media/                        # High-resolution Hero Media Captures
│       ├── *_hero_animation.gif      # Animated GIFs for every hero animation
│       ├── *_hero_animation.webm     # 60fps WebM video captures for every hero
│       └── *_hero_{rest,mid,reveal}.png # Multi-phase kinematic stills
│
├── redesign/                         # Historical redesign briefs & linguistic reviews
│   ├── REDESIGN-BRIEF.md             # Original visual overhaul brief
│   └── tamil-review.md               # Tamil typography, orthography & transliteration review
│
└── screenshots/                      # Visual regression & historical progression captures
    ├── heroes/                       # Mirrored hero animations (GIFs, WebMs, Stills)
    ├── full-page/                    # Full-page desktop renders (1440px)
    ├── guide-v3/                     # Solari board state transitions
    └── *.png                         # Milestone renders
```

---

## 🧭 Key Entry Points

- **Master Hero & Movie Connections Guide:** [`docs/heroes/README.md`](./heroes/README.md)
- **Interactive Framer & Audit Board:** [`screenshots/content-audit/index.html`](../screenshots/content-audit/index.html)
- **Master System PRD:** [`PRD.MD`](../PRD.MD) (Root repository ground truth)
- **Design Tokens & System:** [`DESIGN.md`](../DESIGN.md) & [`design/tokens.json`](../design/tokens.json)
- **Agent Operating Constitution:** [`AGENTS.md`](../AGENTS.md) & [`codex.md`](../codex.md)
