# OSU Tamil Sangam — Documentation Index

This directory contains technical specifications, architectural decision records (ADRs), hero scene engineering documents, and design evolution records for the OSU Tamil Sangam digital platform.

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
├── heroes/                           # Deep mathematical & shader specs for 3D hero scenes
│   ├── events-animation-architecture-and-audit.md # Leo concert arena historical audit & Gen 3 design
│   ├── gallery-hero-prd.md           # 24-fret true 12-TET guitar neck highway PRD
│   ├── gallery-hero.md               # Fretboard physics, string harmonics & timeline specification
│   ├── guide-hero-v3-station-sequence-prd.md # Solari split-flap departure board PRD
│   ├── guide-hero-v3.md              # Station schedule state machine & audio bus specs
│   ├── guide-hero-v3/                # Supporting station assets & matrices
│   └── home-hero-peel-and-flow-prd.md# Digital Kolam conveyor peel & Lissajous flow PRD
│
├── redesign/                         # Historical redesign briefs & linguistic reviews
│   ├── REDESIGN-BRIEF.md             # Original visual overhaul brief
│   └── tamil-review.md               # Tamil typography, orthography & transliteration review
│
└── screenshots/                      # Visual regression & historical progression captures
    ├── guide-v3/                     # Solari board state transitions
    └── *.png                         # Desktop & mobile milestone renders
```

---

## 🧭 Key Entry Points

- **Master System PRD:** [`PRD.MD`](../PRD.MD) (Root repository ground truth)
- **Design Tokens & System:** [`DESIGN.md`](../DESIGN.md) & [`design/tokens.json`](../design/tokens.json)
- **Agent Operating Constitution:** [`AGENTS.md`](../AGENTS.md) & [`codex.md`](../codex.md)
- **Live Page Screenshots Audit Board:** [`screenshots/content-audit/index.html`](../screenshots/content-audit/index.html)
