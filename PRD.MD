# (ஐந்திணை) — OSU Tamil Sangam Website
# Comprehensive Product Requirements Document & Technical Architecture Ground Truth
**PRD v3.0 (Active Production Architectural Ground Truth)** · October 2026 · Owner: Haresh  
**Core Engine:** Next.js 16.3.5 (App Router, Turbopack) · React 19.2.8 · Three.js r186 / React Three Fiber v9.7 · @react-three/postprocessing v3.1 · GSAP 3.15 · Lenis 1.3 · Tailwind CSS v4 (@theme OKLCH tokens) · Web Audio API synthesis · ReactBits Kinematics  
**Working Title:** *Aintinai* (ஐந்திணை) — Grounded in the five classical landscapes of classical Sangam poetry (Marutham, Neithal, Mullai, Paalai, Kurinji).  
**Brand Motto:** "Start the Aatam, Paatam, and Kondatam!" — ஆட்டம் · பாட்டம் · கொண்டாட்டம்

---

## 0. Master Subsystem Implementation Matrix

| Subsystem | Primary Implementation Path | Core Architectural Invariants & Mechanics | Status |
|---|---|---|---|
| **Global Master Engine** | `src/engine/masterTick.ts`, `governor.ts`, `spring.ts` | Single unified `requestAnimationFrame` loop; delta clamping ($\le 50\text{ ms}$); dynamic frame governor (Levels 0, 1, 2); persistent `<GlobalCanvas>` with Drei `<View>` scissoring; compositor shutter (`Shutter.tsx`); asset pre-warming (`useWarmup.ts`). | **SHIPPED** |
| **Home Hero: Digital Kolam Woven Conveyor** | `src/components/hero/DigitalKolamHero.tsx`, `flowMath.ts`, `peelConveyorShader.ts` | Physics-driven woven rice-flour particle curves; Lissajous/wreath parameterization; vertex peel conveyor shader unmasking Act II courtyard on scroll; zero card frames. | **SHIPPED** |
| **Events Hero: Leo Concert Arena Gen 3** | `src/components/gen3/EventsGen3Canvas.tsx`, `LeoFactoryEnvironment.tsx`, `JumpingCrowdSilhouettes.tsx` | Theatrical concert stadium inspired by *Leo* (2023); 12,000-intensity sodium-vapor backlight; industrial cauldron platform; 8,000 instanced crowd silhouettes bouncing at 128 BPM; thousands of swaying phone torches; extruded 3D bronze emblem. | **SHIPPED** |
| **Event Dossier: Randomized Magazine & ReactBits** | `src/app/events/[slug]/page.tsx`, `src/lib/event-photos.ts`, `src/components/events/` | Server-Side Randomizer via Fisher-Yates array shuffle on local directory pool (`public/events/${slug}`); fresh 5–8 photo slice per request with `force-dynamic`; ReactBits `SplitText` letterpress cascade; ReactBits `ParallaxScatter` 3-track asymmetric light table (0px radius, zero cards); ReactBits `VaultGateway` magnetic proximity door to Google Photos. | **SHIPPED** |
| **Gallery Hero: Photo Tunnel WebGL** | `src/components/gallery-hero/GalleryHero.tsx`, `PhotoTunnel.tsx`, `CameraRig.tsx`, `timeline.ts` | 79-plane CatmullRom spiral tunnel of archive photos; custom GLSL vertex shader with `uVelocity`-driven wave distortion and `uTime` oscillation; scroll-progress mapped to camera Z-travel; depth-based alpha falloff (smoothstep 0.5→3.0 / 35→75); Tier C / Lite / reducedMotion fallback to static 4-image grid. | **SHIPPED** |
| **Guide Hero: Solari Split-Flap Departure Board** | `src/components/guide-hero/GuideHero.tsx`, `Board.tsx`, `station/FlapGrid.tsx` | Mechanical split-flap departure board; deterministic per-cell state machine ($FALL = 0.7$); bilingual Tamil/English cycling; 8ms coalesced audio impact bus. | **SHIPPED** |
| **Board Hero: Chola Darbar Corridor** | `src/components/board/BoardHeroCanvas.tsx`, `CholaCrown3D.tsx`, `CorridorTreadmill.tsx` | Temple corridor treadmill with carved granite pillars; procedural 3D Chola crown; floating brass oil lamps with particle flames; silk tapestry portraits with vertex wave shader; golden emblem finale. | **SHIPPED** |
| **Suggestions Hero: Ohio Stadium 3D Blueprint** | `src/components/suggestions/BlueprintScene3D.tsx`, `OhioStadiumWireframe.ts` | Procedural 3D wireframe mesh of Ohio Stadium ("The Horseshoe"); orbiting crane camera; architectural dimension callouts; blueprint drafting grid. | **SHIPPED** |
| **Join Hero: Morning Campus Collegiate Gates** | `src/components/join/JoinHeroCanvas.tsx`, `CampusGate.tsx`, `LeafDrift.tsx` | Wrought-iron collegiate gates with procedural hinge physics; limestone cobblestone courtyard; autumn Buckeye leaf drift simulation; morning atmospheric god-rays. | **SHIPPED** |
| **Sensory Layer: Cinematic Color Grading** | `src/gl/grade/GradeStack.tsx`, `gradeConfig.ts` | Single tone-mapper AGX (`ToneMappingMode.AGX`); `<Canvas flat>`; compacted 33³ PNG strip LUT (`heritage-33.png`, 76.8 KB); live vignette and procedural film grain. | **SHIPPED** |
| **Sensory Layer: Diegetic Audio Engine** | `src/audio/AudioController.ts`, `sounds.ts`, `impactBus.ts`, `armUnlock.ts` | Web Audio client singleton; master limiter/compressor chain; passive gesture unlocking; 8ms flap impact coalescing; 7 synthesized voice types (thud, clack, toggle, shutter, whoosh, swish, chime); **4 Awwwards foley stems** (`playHearthAmbience` tambura drone loop, `playPillarHover` mridangam rim tap, `playArchiveShuffle` cardstock burst, `playKuralChime` 432 Hz bronze bell); all synthesis-native, zero file dependencies — drop-in `.mp3` upgrade path via `AudioController.preloadFile()`. | **SHIPPED** |
| **Media Pipeline: AVIF Batch Conversion** | `scripts/convert-to-avif.mjs` | Node.js script using `sharp`; recursively converts all `public/events/`, `public/images/gallery/`, `public/images/officers/`, `public/media/` at AVIF quality 78 / effort 6; incremental (skips up-to-date files); targets <150 ms gallery load time. Run: `npm install -D sharp && node scripts/convert-to-avif.mjs`. | **READY — Awaiting Real Photos** |
| **Director's Diagnostic Viewport HUD** | `src/director/DirectorHUD.tsx`, `wireframe.ts` | Monospace diagnostic overlay triggered by `Shift+D` chord; unlit green wireframe material override; real-time FPS counter, draw call meter, GPU memory tracking. | **SHIPPED** |
| **Muttram Aesthetic & Design System** | `design/tokens.json`, `src/app/globals.css` | Zero-card philosophy; Warm Ivory (`#FAF9F6`), Charcoal (`#2A2825`), Terracotta (`#B85C38`); DTCG 3-tier OKLCH token mapping; Halant / Anek Tamil / Mukta Malar typography. | **SHIPPED** |

---

## 1. Executive Vision & Cultural Architecture

### 1.1 The Genesis & The Problem
Before this project, the Ohio State University Tamil Sangam operated via a fragmented Linktree hub:
- External ticketing links with zero context or institutional memory.
- Google Forms stored in ephemeral personal student accounts.
- Unsorted Google Drive / Photos dumps with expiring permissions and zero captions.
- Zero narrative introducing the organization, its executive board, its democratic constitution, or its rich cultural heritage.

### 1.2 The Solution: *Aintinai* (ஐந்திணை)
This platform replaces ephemeral social links with a high-performance, culturally authentic digital broadsheet and 3D sensory environment. Grounded in the classical Sangam literature *akam* tradition, the digital landscape reflects five ecological moods (*tinai*):

1. **மருதம் (Marutham — Plains/Farmland):** Associated with dawn (*Vaigarai*), harvest, and festivity. Expressed in the **Events** subsystem.
2. **நெய்தல் (Neithal — Seashore):** Associated with sunset (*Erpaadu*) and nostalgia. Expressed in the **Gallery / Memory Vault** subsystem.
3. **முல்லை (Mullai — Forest/Pasture):** Associated with evening (*Maalai*) and domestic warmth. Expressed in the **Board & Governance** subsystem.
4. **பாலை (Paalai — Arid Journey):** Associated with midday (*Nanpagal*) and endeavor. Expressed in the **Initiatives & Ideas** subsystem.
5. **குறிஞ்சி (Kurinji — Mountains):** Associated with midnight (*Yaamam*) and communion. Expressed in the **Join & Community** subsystem.

### 1.3 The "Muttram" Aesthetic Safeguards
Across all editorial and narrative layouts, the site enforces the **Muttram (முற்றம் — Open Courtyard)** design philosophy:
- **Zero Cards:** Strictly forbids generic boxed UI components (`p-6 rounded-2xl border shadow-md`). Content lives directly on a Warm Ivory (`#FAF9F6`) field.
- **Negative Space & Typographic Hierarchy:** Information is structured through expansive whitespace (`gap-16`, `gap-24`, `mt-32`), crisp broadsheet divider rules (`border-b border-[#2A2825]/15`), and authentic typography.
- **Color Discipline:** 
  - Primary Field: Warm Ivory (`#FAF9F6` / `oklch(0.98 0.015 85)`).
  - Ink Typography: Charcoal Ink (`#2A2825` / `oklch(0.24 0.02 55)`).
  - Focal Accents: Terracotta Earth (`#B85C38` / `oklch(0.55 0.16 45)`).
  - Sun Accents: Turmeric Harvest Gold (`#E5A93C` / `oklch(0.78 0.18 80)`).
- **No Decorative Emojis:** Prohibits emoji stand-ins (🚀, 💡, ⚡, 🎉). Replaced with bespoke SVG kolam glyphs and authentic Tamil iconography.

---

## 2. Exhaustive Route Architecture & Page Blueprints

### 2.1 `/` — The Home Courtyard
- **Act I: Digital Kolam Woven Conveyor Hero (`DigitalKolamHero.tsx`):**
  - Continuous 3D WebGL woven particle ribbon simulating rice-flour (*arisi maavu*) drawing.
  - Driven by Lissajous parametric curves and scroll-progress peeling math (`peelConveyorShader.ts`).
  - Seamlessly peels upward on vertical scroll to reveal the editorial courtyard without layout jump.
- **Act II: Muttram Courtyard Broadsheet:**
  - Next Flagship Event hero announcement with live Gregorian & Tamil calendar lockup.
  - The Five Pillars of Sangam: Dance (ஆட்டம்), Music (பாட்டம்), Celebration (கொண்டாட்டம்), Service (தொண்டு), and Literature (தமிழ்).
  - Moments on the Olentangy: Interlocking non-boxed photographic narrative from campus events.
  - Cultural Glossary Interactive Drawer: Explanations of core Tamil cultural concepts (*Vanakkam*, *Kolam*, *Sangam*, *Tinai*).

### 2.2 `/events` — The Gatherings River
- **Act I: Concert Stadium Hero (`EventsGen3Canvas.tsx`):**
  - 300vh scroll-pinned Leo factory stadium sequence.
  - Descending crane trajectory (`CameraChoreography.tsx`) plunging from altitude down into a roaring stadium of 8,000 bouncing dancers.
  - Sodium-vapor incandescent backlight with volumetric dust particle haze.
  - Swapping phone torch matrix pulsating to a 128 BPM concert rhythm.
  - Cinematic blowout transition unmasking the events register.
- **Act II: The Gatherings River Catalog:**
  - Linear chronological stream of upcoming and historical collegiate gatherings.
  - Draggable Memory Archive: Tactile horizontal photo carousel of past celebrations.
  - Calendar integration: Instant RFC 5545 `.ics` file generation and Google Calendar export.

### 2.3 `/events/[slug]` — The Randomized Dossier & ReactBits Kinematics
- **Phase 1: Server-Side Randomizer Architecture:**
  - Server Component execution in `src/app/events/[slug]/page.tsx` with `export const dynamic = "force-dynamic"`.
  - Node `fs.promises.readdir` scans local event pool (`public/events/${slug}`), filters valid image formats (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`).
  - Fisher-Yates shuffle algorithm executes server-side before response transmission.
  - Slices a random selection of 5 to 8 photos, passing array directly down to client props.
  - Zero client-side API requests, zero scraping, zero Cumulative Layout Shift (CLS).
- **Phase 2: ReactBits Kinematics & Editorial Spread (`EventDossierView.tsx`):**
  - **SplitText Entrance (`SplitText.tsx`):** Massive Event Title in Charcoal (`#2A2825`) Halant serif. Letters split into grapheme clusters via `Intl.Segmenter` (preserving Tamil vowel signs and pulli diacritics). Staggered letterpress emergence (`y: 40 -> 0`, `rotateX: -45 -> 0`, `ease: [0.16, 1, 0.3, 1]`).
  - **ParallaxScatter Spread (`ParallaxScatter.tsx`):** 5–8 randomly chosen photos distributed across 3 asymmetric tracks. Driven by Framer Motion `useScroll` with differential vertical rates (`-140px`, `-260px`, `-180px`). Sharp corners (`rounded-none`, `0px` radius), zero drop shadows (`shadow-none`), zero borders, separated by `gap-16 lg:gap-24`.
- **Phase 3: The Vault Door Gateway (`VaultGateway.tsx`):**
  - Full-width footer section separated by a massive `mt-32` gap.
  - Monospace subtext: `"EXPLORE THE RAW ARCHIVE (300+ FULL-RESOLUTION PHOTOGRAPHS)"`.
  - Primary anchor: `"Open the Google Photos Vault ↗"` in massive Halant serif.
  - Proximity magnetics: underdamped spring (`k = 150, c = 15`), dynamically pulls text up to 24px toward cursor when within 220px radius, shifting color from Charcoal (`#2A2825`) to Terracotta Earth (`#B85C38`).
  - Accessible `<a>` tag with full `aria-label`, `target="_blank"`, and `rel="noopener noreferrer"`.

### 2.4 `/about` — The Organic Journey
- **Act I: Sacred River & Gopuram Ascent Hero:**
  - Center-snaking SVG river timeline navigating from the club's 2021 founding to the 2026 academic year.
  - 3D procedural temple gopuram fractal geometry floating in negative space.
- **Act II: The Democratic Constitution:**
  - Mission statement, non-discrimination charter, and democratic operating principles.
  - Verifiable campus alliances (South Asian student organizations, university bodies).
  - In-browser interactive Constitution viewer with PDF download.

### 2.5 `/board` — The Warm Portraits
- **Act I: Chola Darbar Corridor Hero (`BoardHeroCanvas.tsx`):**
  - Infinite treadmill camera glide down a carved granite temple corridor.
  - Floating brass oil lamps (*agal vilakku*) with dynamic particle flame flicker.
  - Procedural 3D Chola Crown (`CholaCrown3D.tsx`) rotating with specular bronze highlights.
  - Suspended silk tapestry banners (`TapestryPortrait.tsx`) with cloth vertex wave simulation.
  - Golden emblem finale with depth-of-field transition.
- **Act II: Executive Roster & Trading Cards:**
  - Naked portrait grid featuring leadership team in warm editorial framing.
  - Holographic Trading Cards: Pointer-reactive 3D foil shader card reveals with role, major, and personal bio.
  - Archived alumni volumes cataloged as editorial magazine issues.

### 2.6 `/gallery` — The Memory Vault
- **Act I: Fretboard Highway Hero (`GalleryHero.tsx`):**
  - 24-fret true 12-TET guitar neck highway (`neck/`).
  - 6-string physics simulation with instanced meshes and harmonic damping.
  - Scroll-driven camera velocity solver ($P = 1.7202$) synchronizing guitar pick strumming to viewport progress.
  - Rose contact brake at $p = 0.52$ initiating photographic memory unmasking.
- **Act II: 35mm Archival Masonry:**
  - Expansive interlocking masonry grid with wide Warm Ivory gaps.
  - Academic year filters and tag-based curation (Carnatic, dance, social, picnic).
  - Built-in photo removal request modal ensuring student privacy.

### 2.7 `/guide` — The Platform Board
- **Act I: Solari Split-Flap Departure Hero (`GuideHero.tsx`):**
  - Mechanical split-flap board simulating railway station schedules.
  - Deterministic per-cell flap state machine ($FALL = 0.7$).
  - Bilingual flipping between English and Tamil collegiate schedules.
  - Synchronized mechanical flap audio clicks routed through coalesced 8ms impact bus.
- **Act II: Student Knowledge Base:**
  - Curated guide for incoming students: Columbus Indian groceries, local dining, bus routes, temple timings.
  - Bilingual FAQ accordion answering academic, housing, and social questions.

### 2.8 `/suggestions` — The Ideas Hearth
- **Act I: Ohio Stadium 3D Blueprint Hero (`BlueprintScene3D.tsx`):**
  - Procedural 3D wireframe reconstruction of The Ohio Stadium ("The Horseshoe").
  - Orbiting crane camera gliding along architectural bleacher rings and field yard markers.
  - Real-time blueprint drafting grid with technical dimensional callouts.
- **Act II: Campus Proposal Form (`SuggestionForm.tsx`):**
  - Conversational proposal submission system.
  - Category routing: Event concepts, guest speakers, cultural initiatives, collaborations.
  - Live public ledger of past accepted ideas and implementation tracking.

### 2.9 `/join` — The Morning Campus
- **Act I: Collegiate Courtyard Gates Hero (`JoinHeroCanvas.tsx`):**
  - Procedural limestone courtyard bathed in soft morning sunlight.
  - Wrought-iron campus gates (`CampusGate.tsx`) with cast Tamil & Latin lettering on the arch.
  - Real-time autumn Buckeye leaf drift simulation (`LeafDrift.tsx`) with ground turbulence.
  - Atmospheric god-rays and volumetric fog (`MorningVolumetrics.tsx`).
- **Act II: Membership Gateway:**
  - Conversational membership application form.
  - Direct GroupMe onboarding interstitial with expectations and etiquette guidelines.
  - Double opt-in newsletter subscription with zero tracking cookies.

### 2.10 `/links` — The Bio Hub
- Ultra-lightweight Linktree replacement designed for in-app mobile browsers (Instagram, TikTok).
- Target bundle size: $< 30\text{ KB}$ JS, zero WebGL, pure semantic HTML and inline CSS.
- Automatically spotlights upcoming flagship event, ticket links, and GroupMe invite.

---

## 3. Deep Hero Animation & Physics Engineering

### 3.1 Home Hero: Digital Kolam Woven Conveyor Peel
- **Mathematical Curve Generation (`flowMath.ts`, `kolamGeometry.ts`):**
  - Dot lattice constructed on a symmetric Cartesian grid with spacing $S = 48\text{px}$.
  - Continuous loop paths generated using cubic Bezier curves parameterized by harmonic frequencies:
    $$x(t) = A \cos(\omega_x t + \phi_x), \quad y(t) = B \sin(\omega_y t + \phi_y)$$
  - Self-intersecting loops calculate weaving over/under offsets via Z-depth displacement:
    $$z(t) = \pm \delta \sin(k \cdot t)$$
- **Peel Conveyor Vertex Shader (`peelConveyorShader.ts`):**
  - Pinned 100dvh section where scroll progress maps to a cylinder peel transformation.
  - Vertex position $(x, y, z)$ deformed along a parabolic arc:
    $$y' = y \cos(\theta) - R \sin(\theta), \quad z' = y \sin(\theta) + R(1 - \cos(\theta))$$
  - As $\theta \to \frac{\pi}{2}$, the 3D kolam plane rolls upward into an off-screen conveyor spool, unmasking Act II.

### 3.2 Events Hero: Leo Factory Stadium Concert (Gen 3)
- **Architectural Environment (`LeoFactoryEnvironment.tsx`):**
  - Industrial stadium modeled with procedural steel I-beam trusses ($N = 12$) spaced along $Z \in [-60\text{m}, 20\text{m}]$.
  - Central elevated wooden staging table ($r = 1.8\text{m}$) enclosed by an outer sloped cast iron vat ($r = 12.8\text{m}$).
  - Incandescent sodium-vapor backlights emitting 12,000 intensity units with inverse-square physical falloff.
- **Crowd Silhouette Simulation (`JumpingCrowdSilhouettes.tsx`):**
  - 8,000 instanced dancing figures rendered in a single draw call via `THREE.InstancedMesh`.
  - Custom vertex shader computes vertical harmonic bounce driven by audio clock time:
    $$y_{\text{offset}} = | \sin(2\pi \cdot \frac{128}{60} \cdot t + \phi_i) | \cdot h_i$$
  - Camera-facing billboard alignment with depth-based atmospheric haze.
- **Phone Torch Matrix (`PhoneTorches.tsx`):**
  - 2,500 point sprites scattered through the audience.
  - Per-torch randomized swaying vectors and stochastic twinkling:
    $$I_i(t) = I_0 \cdot \left[0.7 + 0.3 \sin(\omega_i t) \cdot \cos(\nu_i t)\right]$$
- **Performer & 3D Bronze Emblem:**
  - Sharp silhouette performer positioned at the focal origin catching rim highlights via custom grazing-angle shader:
    $$I_{\text{rim}} = (1.0 - \mathbf{N} \cdot \mathbf{V})^\gamma$$
  - Extruded 3D metallic Tamil Sangam emblem suspended in mid-air with brushed bronze PBR properties (`roughness: 0.2`, `metalness: 0.85`).

### 3.3 Gallery Hero: 24-Fret Fretboard Highway
- **12-TET Mathematical Fret Spacing (`fretMath.ts`):**
  - Physical scale length $L = 648\text{mm}$ (standard 25.5" electric guitar).
  - Exact fret positions calculated via twelve-tone equal temperament formula:
    $$d_n = L \left(1 - 2^{-n/12}\right), \quad n \in \{1, \dots, 24\}$$
- **6-String Physics Engine (`strings/`):**
  - 6 independent strings rendered as instanced wire meshes with gauge-appropriate radii.
  - Scroll-driven guitar pick contact at $p = 0.52$ applies localized impulse displacement $y(0) = Y_{\max}$.
  - Harmonic wave equation solved with exponential air damping:
    $$y(x, t) = \sum_{m=1}^{M} A_m \sin\left(\frac{m\pi x}{L}\right) \cos(\omega_m t) e^{-\zeta_m t}$$
- **Kinematic Velocity Solver (`ramp.ts`):**
  - Camera trajectory maps scroll progress $p \in [0, 1]$ through an asymmetric critically damped spring solver ($P = 1.7202$) ensuring exact fret 5 and fret 12 alignments before deceleration.

### 3.4 Guide Hero: Solari Mechanical Split-Flap Board
- **Mechanical State Machine (`station/FlapGrid.tsx`):**
  - 24-column $\times$ 6-row matrix of independent mechanical flap units.
  - Character transition sequence cycles through alphanumeric and Tamil glyph registers.
  - Top flap remains stationary until bottom flap passes angle $\theta = \frac{\pi}{2}$; then top flap accelerates with gravitational constant $FALL = 0.7$:
    $$\theta_{\text{top}}(t) = \theta_0 + \frac{1}{2} g t^2$$
- **Impact Audio Coalescing (`impactBus.ts`):**
  - High-frequency flap impacts aggregate within an 8ms window buffer.
  - Maximum 3 simultaneous flap samples play to prevent Web Audio clipping and browser thread starvation.

---

## 4. Sensory Layer: Color Grading, Shaders & Diegetic Audio

### 4.1 DaVinci Resolve AGX Tone Mapping & 33³ LUT Pipeline
- **Tone Mapping Enforcement:**
  - Three.js WebGL renderer configured with `<Canvas flat>` to bypass native clamping.
  - Tone-mapping applied exclusively in post-processing via AgX tonemapper (`ToneMappingMode.AGX`), preserving specular highlights without oversaturating brand colors.
- **33³ PNG Strip Compacted LUT (`heritage-33.png`):**
  - Master color grade authored in DaVinci Resolve based on Dravidian temple granite, Kanchipuram silk, and warm sodium night lighting.
  - Exported as a $1089 \times 33$ PNG strip (33 slices of $33 \times 33$ RGB lattices), weighing only 76.8 KB.
  - Live trilinear texture interpolation in post-processing shader:
    $$\mathbf{C}_{\text{graded}} = \text{LUT3D}(\mathbf{C}_{\text{input}})$$
  - $\Delta E_{00}$ mathematical validation ensures brand colors deviate by $\le 4.0$ JND units.
- **Film Grain & Vignette Pass:**
  - Simulates 35mm photochemical film emulsion using procedural simplex noise.
  - Automatically disabled in Lite Mode (Tier C) and on battery-saving profiles.

### 4.2 Web Audio Synthesis & Diegetic Sound Engine
- **Audio Controller Architecture (`AudioController.ts`):**
  - Singleton `AudioContext` with master stereo compressor, limiter, and high-pass filter ($f_c = 40\text{Hz}$).
  - Strictly opt-in: Audio remains muted until explicit user interaction via floating nav toggle.
  - Passive gesture unlock (`armUnlock.ts`): Prepares audio nodes on first pointerdown/keydown without audio playback.
- **Cultural Audio Palette:**
  - Temple Bell: Synthesized modal resonator simulating bronze bell decay ($f = 880\text{Hz}$, decay $= 2.4\text{s}$).
  - *Parai* & *Thavil* Accents: Low-frequency membrane transient thuds for major milestone transitions.
  - Flap Slap: Micro-recorded mechanical click for Solari board character rotations.
  - Tactile CTA Thud: 80Hz underdamped tactile click for primary button hover/down events.

### 4.3 Director's Diagnostic Viewport HUD
- **Telemetry Overlay (`DirectorHUD.tsx`):**
  - Monospace diagnostic head-up display toggled via `Shift+D` keyboard chord or footer trigger.
  - Real-time telemetry: FPS, delta frame time, GPU draw call count, memory usage, active Tier (A/B/C), and master tick status.
- **Unlit Green Wireframe Material Registry (`wireframe.ts`):**
  - Single-key toggle (`W`) injects unlit emerald wireframe shaders (`#00FF66`) across all active scene meshes.
  - Preserves underlying vertex animation patches while stripping lighting calculations for topological inspection.

---

## 5. Tamil Text Engineering & Typography System

### 5.1 Grapheme Cluster Integrity Protocol
Standard JavaScript string manipulation (`str.split('')`, `slice()`) splits Tamil combining vowel signs (*uyirezhuthu*) and pulli diacritics (*meiyezhuthu*) from their consonant bases, causing severe typographic corruption:
- ❌ **Forbidden:** `"தமிழ்".split('')` $\to$ `['த', 'ம', 'ி', 'ழ', '்']` (broken diacritics).
- ✅ **Mandatory:** `Intl.Segmenter` with grapheme granularity:
  ```ts
  const segmenter = new Intl.Segmenter("ta", { granularity: "grapheme" });
  const clusters = Array.from(segmenter.segment("தமிழ்"), (s) => s.segment);
  // Yields: ['த', 'மி', 'ழ்']
  ```
All kinematic text components (ReactBits `SplitText`, Solari board, letterpress reveals) strictly utilize this protocol.

### 5.2 Typography Tokens & Loading Strategy
- **Tamil Display & Headers:** **Halant** & **Anek Tamil** (`var(--font-serif)` / `var(--font-anek-tamil)`). Majestic, chiselled letterforms rooted in temple stone inscriptions.
- **Tamil Body & UI:** **Mukta Malar** (`var(--font-body)` / `var(--font-mukta-malar)`). High-legibility modern sans-serif with ample vertical breathing room (minimum line-height 1.6).
- **Metadata & Telemetry:** **JetBrains Mono** (`var(--font-mono)`). Monospace precision for schedules, colophons, and plate indices.
- **Non-Negotiable Typography Invariants:**
  - Every Tamil DOM element must have `lang="ta"`.
  - Zero letter-spacing modifications on Tamil text.
  - Zero `text-transform: uppercase` on Tamil text.
  - Unicode NFC normalization enforced at the build and API boundary.

---

## 6. Design Tokens & DTCG Three-Tier Architecture

All colors, radii, spacing, and elevations strictly trace back to `design/tokens.json` and are mirrored into `globals.css` via Tailwind CSS v4 `@theme` directives. Inline arbitrary hex codes and magic pixel numbers are strictly forbidden.

### 6.1 Primitive Tier (Raw Values)
```json
{
  "--color-gold-500": "oklch(0.78 0.18 80)",
  "--color-terracotta-500": "oklch(0.55 0.16 45)",
  "--color-charcoal-900": "oklch(0.24 0.02 55)",
  "--color-ivory-50": "oklch(0.98 0.015 85)",
  "--color-plum-950": "oklch(0.20 0.10 305)"
}
```

### 6.2 Semantic Tier (Intent Mappings)
```css
@theme {
  --color-canvas-base: var(--color-ivory-50);
  --color-text-primary: var(--color-charcoal-900);
  --color-text-muted: oklch(0.45 0.03 55);
  --color-brand-accent: var(--color-terracotta-500);
  --color-brand-sun: var(--color-gold-500);
  --color-border-subtle: oklch(0.24 0.02 55 / 0.12);
}
```

### 6.3 Component Tier (Micro-Properties)
```css
--button-bg-primary: var(--color-brand-accent);
--button-text-primary: var(--color-canvas-base);
--nav-border-resting: var(--color-border-subtle);
```

---

## 7. Performance Budgets, Hardware Tiers & Accessibility

### 7.1 Three-Tier Hardware Degradation Model
The platform dynamically classifies client hardware into three distinct tiers:

| Metric / Feature | Tier A (Full Fidelity) | Tier B (Reduced GPU) | Tier C (Lite Mode) |
|---|---|---|---|
| **Platform Target** | Desktop GPU, high-end mobile | Mid-range phone, in-app webview | Low battery, Save-Data, reduced-motion |
| **Render Engine** | WebGPU / Full WebGL2 | Throttled WebGL2 | Pure DOM / HTML5 / CSS |
| **Max DPR** | 2.0 | 1.0–1.25 | Native CSS |
| **Particles** | 8,000–10,000 | 1,500–2,500 | 0 (Static artwork) |
| **Post-Processing** | AGX + 33³ LUT + Grain | AGX Tone-mapping only | None |
| **Scroll Engine** | Lenis smooth scroll | Lenis smooth scroll | Native browser momentum |
| **Hitboxes** | Magnetic pull enabled | Standard cursor | Standard cursor |

### 7.2 The 100dvh Viewport Mandate
Full-screen hero and catalog sections are strictly forbidden from using `100vh`. The dynamic viewport height unit (`100dvh`) is enforced machine-wide to eliminate toolbar resize jumping in iOS Safari and Chrome Android.

### 7.3 WCAG 2.2 AA Compliance Checklist
- **Contrast:** All text pairs on Warm Ivory (`#FAF9F6`) achieve $\ge 4.5:1$ contrast (Charcoal `#2A2825` achieves $13.2:1$).
- **Keyboard Navigation:** Every interactive element features a 2px offset visible focus ring (`focus-visible:outline-[#B85C38]`).
- **Reduced Motion:** Conditioned on `window.matchMedia("(prefers-reduced-motion: reduce)")`. When active, all GSAP and R3F animations collapse to instantaneous transitions.
- **Touch Targets:** Minimum touch target bounding box of $48\text{px} \times 48\text{px}$ across all navigation and form controls.

---

## 8. Verification & Deployment Pipeline

Every proposed change or release must successfully pass the four-stage verification gate before being merged:

1. **Compilation & Type Check:**
   ```bash
   npx tsc --noEmit
   ```
   Zero TypeScript compiler errors allowed.
2. **Deterministic SEO & Metadata Validation:**
   ```bash
   node scripts/verify-seo.mjs
   ```
   Validates canonical URLs, OpenGraph image tags, and JSON-LD structured schemas (`Organization`, `Event`).
3. **Full-Page Visual Audit:**
   ```bash
   node scripts/capture-content-audit.mjs
   ```
   Captures 1.5× Retina full-page screenshots of all 9 routes into `screenshots/content-audit/` and generates the interactive Framer inspection board (`index.html`).
4. **Responsive DOM Overflow Audit:**
   Chrome DevTools MCP / Playwright headless verification at both $1440\text{px}$ desktop and $375\text{px}$ mobile viewports confirming `overflow: false`.
