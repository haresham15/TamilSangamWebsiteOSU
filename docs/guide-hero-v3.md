# Guide Hero v3: "The Station Sequence" — Technical Architecture & Reference Guide

**Project:** OSU Tamil Sangam Website  
**Stack:** Next.js 16 (App Router), React 19, Three.js (r186), React Three Fiber v9, @react-three/drei, GSAP ScrollTrigger, Lenis, Zustand, Tailwind CSS v4, SQLite (`node:sqlite`)  
**Route:** `/guide` (Cinematic 3D Station Hero and FAQ Departure Console)  
**Status:** Complete (Phases 0–5 delivered and verified)

---

## 1. Executive Summary & Architectural Overview

The **Station Sequence** is an unbroken, cinematic crane sequence for the `/guide` page. It begins at blue hour on a damp platform facing a weathered blue coach window. Backlit by warm compartment light, two figures sit/stand in silhouette separated by horizontal iron window bars. As the visitor scrolls, the camera dollies back, cranes up past the coach roof, reveals the vast iron rafters of Sangam Junction amidst cool atmospheric fog, and brings the monumental split-flap departure board into frame.

At progress $p \ge 0.82$, the departure board cascades to display the **#1 most-asked FAQ**, delivering an emotional, filmic arrival that seamlessly hands off to the accessible FAQ accordion and knowledge base console below.

```
       TOP VIEW (Station Space: +x right, +y up, +z toward camera)

          z = -6.0   [ SPLIT-FLAP BOARD 30×5, centre y = 14 ]
          z = -2.4   [ Compartment Backdrop Warm Emissive Plane ]
          z = -0.7   [ Woman Silhouette (seated inside) ]
          z =  0.0   ══ Coach Window Wall (glass z=+0.02, bars z=+0.04) ══
          z = +0.8   [ Man Silhouette (standing outside on platform) ]
          z = +1.2   [ Platform Light Spill Pool ]
          z = +5.6   [ Camera Position at F1 (p = 0) ]
```

### Architectural Seams & Non-Negotiable Boundaries
1. **Preserved Split-Flap Board Engine:** The physical mechanics (`FlapEngine`, `InstancedMesh`, glyph atlas texture, FSM, and layout engine) remain 100% untouched. The board is mounted via `<BoardRoot position={[0, 14, -6]} fogEnabled={false} />`.
2. **Single Global Canvas:** The station diorama mounts into the site's persistent canvas via `@react-three/drei`'s `View`, adhering to the single-engine master clock without duplicating render loops, Lenis instances, or GSAP tickers.
3. **Native Scroll Ownership:** Scroll progression is driven strictly by native window scrolling smoothed by Lenis (`scrub: 0.8`), writing to an immutable progress reference that is critically damped before camera sampling. Zero direct tweening of `camera.position`.
4. **Original Asset Purity:** Silhouettes are procedural analytic capsule-distance SDF shaders. No film stills, audio samples, actor likenesses, or real-world railway marks are used.

---

## 2. Cinematic Camera Rail System (`guideRail.ts`)

The camera moves along a 3D centripetal Catmull-Rom spline curve with a distinct look-at rail and scalar FOV/effects curves. All values are deterministic functions of normalized scroll progress $p \in [0, 1]$.

### Master Rail Keyframes Table
| $p$ | Shot Stage | Position $(x, y, z)$ | Look-At $(x, y, z)$ | vFOV | Focus Target $(x, y, z)$ | Exp | Bloom | Drizzle | GodRays | Handheld | Departure |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **0.00** | **F1: Window** | `(0.2, 1.55, 5.6)` | `(-0.25, 1.7, 0.0)` | 32° | `(-0.25, 1.7, 0.4)` | 1.00 | 0.90 | 0.35 | 0.20 | 0.012 m | 0.0 m |
| **0.14** | **F2: Push-in** | `(0.1, 1.60, 5.0)` | `(-0.20, 1.7, 0.0)` | 31° | `(0.15, 1.6, -0.7)` | 1.00 | 0.90 | 0.35 | 0.20 | 0.011 m | 0.0 m |
| **0.45** | **F3: Pull-back** | `(4.8, 6.20, 19.5)` | `(0.00, 2.2, -0.8)` | 34° | `(0.00, 2.2, -0.8)` | 1.10 | 0.70 | 0.30 | 0.30 | 0.007 m | 0.0 m |
| **0.65** | **F4: Wide Hall** | `(2.5, 8.40, 20.5)` | `(0.00, 24.0, -5.5)` | 35° | `(0.00, 24.0, -5.5)` | 1.20 | 0.55 | 0.25 | 0.45 | 0.005 m | 0.0 m |
| **0.80** | **F5: Board Enters** | `(0.0, 7.80, 21.0)` | `(0.00, 14.5, -6.0)` | 36° | `(0.00, 14.0, -6.0)` | 1.30 | 0.45 | 0.20 | 0.60 | 0.003 m | 0.0 m |
| **0.90** | **F6: Board Arrival** | `(0.0, 7.00, 18.2)` | `(0.00, 14.0, -6.0)` | 36° | `(0.00, 14.0, -6.0)` | 1.28 | 0.38 | 0.16 | 0.45 | 0.002 m | 5.2 m |
| **1.00** | **Handoff** | `(0.0, 6.80, 17.5)` | `(0.00, 13.8, -6.0)` | 36° | `(0.00, 14.0, -6.0)` | 1.25 | 0.35 | 0.15 | 0.40 | 0.002 m | 8.0 m |

### Damped Dynamics & Reversibility
- **ScrollTrigger Configuration:** Single trigger pinning `/guide` over `340dvh` (desktop) or `280dvh` (mobile), `scrub: 0.8`.
- **Master Tick Damping:** Progress values are passed to `criticallyDamped(targetProgress, currentProgress, lambda = 6, delta)`.
- **Motion Invariance:** Position steps between adjacent 0.5% samples do not exceed $0.7\text{ m}$; angular aim deltas do not exceed $0.12\text{ rad}$. Sampling in reverse yields exact mathematical equivalence.
- **Handheld Drift:** Low-frequency harmonic tremor decaying with elevation:
  $$\text{drift}(t, p) = \sin(1.88 \cdot t) \cdot A(p), \quad A(p) = 0.012 \to 0.002\text{ m}$$
  Under `prefers-reduced-motion: reduce`, drift and roll are clamped to zero.

---

## 3. Lighting Rig & Physical Photometric Units (three.js r186+)

All lights use physically based units in accordance with Three.js r155+ conventions:

| Light Source | Type | Coordinates | Intensity / Decay | Color Token | Purpose |
|---|---|---|---|---|---|
| **Compartment Practical** | `PointLight` | `(0.3, 2.3, -1.5)` | 80 cd, `decay: 2` | `#FFB84D` (`--color-station-window-glow`) | Lights interior seats, curtain, and bars; zero shadows |
| **Window Spill** | `SpotLight` | `(0, 7.0, 2.0)` | 120 cd, angle 0.7, penumbra 0.8 | `#FFB35C` (`--color-station-spill`) | Projects warm illuminated footprint onto platform |
| **Cool Platform Ambience** | `HemisphereLight` | Origin | 0.35 cd | Sky `#6B8CAE`, Ground `#0A0F14` | Blue shadow fill ensuring shadows never drop to `#000000` |
| **Roof / Rim Light** | `DirectionalLight` | `(-8.0, 15.0, 8.0)` | 0.8 cd, unshadowed | `#7AA7D6` (`--color-station-rim`) | Highlights coach roof curvature and platform edges |
| **Station Hall Practicals** | Emissive meshes | Along rafters | HDR `emissiveIntensity: 3.0` | `#FFD9A0` (`--color-station-practical`) | Sodium vapor lamps providing visual depth cues |

### The Silhouette Contrast Engine
Silhouettes are rendered as unlit shader planes (`MeshBasic`-equivalent fragment shader). High visual contrast is achieved **not** by casting light onto the silhouette, but by placing an emissive, vignetted backdrop plane (`#FFB84D` core to `#FF8A2A` edge) directly behind them at $z = -2.4$. The SDF shader calculates screen-space antialiased edges with a warm rim halation bleed (`halo = smoothstep(0.5 - uHaloWidth, 0.5, d)`).

---

## 4. Atmospheric Fog Decisions & Math

### The Density Problem & Resolution
In Three.js, exponential squared fog is defined by:
$$\text{fogFactor} = 1 - \exp(-(\rho \cdot d)^2)$$

| Distance $d$ | Rejected $\rho = 0.030$ | Adopted $\rho = 0.018$ | Visual Outcome |
|---|---|---|---|
| **10 m** (Coach exterior) | 8.6% fog factor | 3.2% fog factor | Coach details stay crisp and punchy |
| **20 m** (Platform depth) | 30.2% fog factor | 12.2% fog factor | Soft misting; depth cues established |
| **23 m** (Board at F6) | **37.9% fog factor** | **15.7% fog factor** | Protected against "black-on-black" washout |
| **45 m** (Far station wall) | 83.8% fog factor | 48.0% fog factor | Graceful background dissolution |

### Fog Rules
1. **Global Fog:** `FogExp2('#0A0F14', 0.018)`.
2. **Selective Exemption:** `material.fog = false` on the split-flap board chassis, flaps, rods, and luminous backdrop cards.
3. **Luminous Haze Card:** A soft emissive plane (`color: #14283A`, opacity 0.62) placed at $z = -17$ provides a glowing backdrop against which the dark board silhouette remains legible.

---

## 5. Split-Flap Board Integration & Wrapper Contract

- **Wrapper:** `<BoardRoot position={[0, 14, -6]} fogEnabled={false}>`.
- **Preserved Engine:** Zero alterations to `useFlapEngine`, `InstancedMesh` matrix updates, audio triggers, or atlas lookup.
- **Responsive Layouts:**
  - Desktop ($\ge 1024\text{px}$): 30 columns $\times$ 5 rows ($21.0 \times 5.2\text{ m}$)
  - Tablet ($640\text{px} - 1023\text{px}$): 24 columns $\times$ 6 rows ($16.8 \times 6.24\text{ m}$)
  - Mobile ($< 640\text{px}$): 14 columns $\times$ 9 rows ($9.8 \times 9.36\text{ m}$)
- **Lifecycle & Activation:**
  - Board mesh is hidden (`visible = false`) for $p < 0.62$.
  - At $p \ge 0.82$, `revealMostAsked()` is triggered idempotently once.
  - After 12 seconds of idle time without user interaction, `advancePopularCarousel()` rotates to the #2 ranked FAQ.

---

## 6. Bilingual Content Authoring Rules & Typography

1. **Cell Script Invariance:** Tamil characters are strictly forbidden from split-flap flap cells due to grapheme-cluster mechanical splitting risks. Tamil appears exclusively in static DOM chrome, bilingual tooltips, and accordion descriptions.
2. **Character Set Whitelist:** Physical flap cells only accept uppercase English ASCII, digits 0–9, and punctuation (` `, `.`, `,`, `?`, `!`, `'`, `-`, `&`, `/`, `:`, `+`, `(`, `)`, `$`).
3. **14×9 Mobile Geometry Enforcement:** Every candidate board copy string must pass `assertFaqBoardContentFits(FAQS)` in CI. Max line count is 7; max line width is 14 characters.
4. **Editorial Integrity:** Raw FAQ questions are never rendered directly on the board. The board displays the hand-authored, space-optimized `boardText` and `flapLabel`.
5. **Tamil Review Flag:** All Tamil copy is tracked with `// TODO: native review`.

---

## 7. Analytics & Privacy-First Engagement Engine

### Architecture
```text
Browser Interaction (Accordion / Board / Search)
        │
        ▼ (Beacon / Fetch Keepalive)
POST /api/faq/engage  ──►  HMAC-SHA256(Salt : Day, IP + UA)
                                  │
                                  ▼ (Truncated 32-char visitor hash)
                        SQLite: faq_dedupe (24h) & faq_rate_limit (30/min)
                                  │
                                  ▼ (Atomic increment)
                        SQLite: faq_daily_counts
                                  │
GET /api/faq/popular   ◄──  28-day 7-day half-life score
(5-min Server Cache)        Pin fallback if total < 15
        │
        ▼ (SSR Prop delivery)
/guide page.tsx  ──►  GuideClient  ──►  GuideHero (No client loading flash)
```

### Privacy & Governance Standards
- **Zero PII:** No raw IP addresses, cookies, or user agent strings are stored.
- **Ephemerality:** The daily visitor hash rotates automatically every 24 hours via daily salting.
- **Ranking Half-Life Equation:**
  $$\text{Score}(\text{FAQ}) = \sum_{d=0}^{27} \text{Count}_d \times 0.5^{\frac{\text{today} - d}{7}}$$
- **Cold Start Protection:** If total engagement is $< 15$, the editorial favorite (`faq-02`, "Do I have to speak Tamil?") is pinned at rank #1.

---

## 8. Performance Tiers & Accessibility (a11y)

| Feature | Tier A (High) | Tier B (Medium) | Tier C / Lite Mode / Reduced Motion |
|---|---|---|---|
| **Render Target** | WebGL 2 (DPR $\le 1.75$) | WebGL 2 (DPR $\le 1.5$) | Pure CSS Station Poster (No WebGL) |
| **Scroll Span** | 340dvh desktop / 280dvh mob | 340dvh desktop / 280dvh mob | 100dvh static hero |
| **Station Diaroma** | Full geometry, rafters, rain | Rafters, reduced rain | CSS silhouettes, window, & board |
| **Skip Button** | Present (`min-h-12`, focus ring) | Present (`min-h-12`, focus ring) | Hidden (Hero is already static) |

- **Screen Reader Semantics:** Both 3D canvas and poster are `aria-hidden="true"`. A hidden `<p aria-live="polite">` announces `Most asked: ...`.
- **Keyboard Navigation:** The `Skip station sequence` button appears after 2 seconds or on keyboard Tab focus, jumping directly to the FAQ console at $p = 0.92$.

---

## 9. Verification & Gate Checkpoints

All Phase 0–5 gates pass verification against automated Playwright contracts in `tests/guide-hero-board.spec.ts`:
1. `layout and flap kinematics remain green` (PASS)
2. `Phase 4 FAQ ranking, cold start, local SQLite aggregate, and board copy contracts remain green` (PASS)
3. `Phase 5 Tier C keeps a readable CSS station fallback without a WebGL canvas` (PASS)
4. `Phase 3 Catmull-Rom rail is continuous and exactly reversible` (PASS)
5. `Phase 3 production scroll writes reversible station progress` (PASS)
6. `lab accepts the documented F6 progress` (PASS)
7. `Phase 1 holds the pre-dawn environment at F4 and F5 across desktop and mobile` (PASS)
8. `Phase 2 exposes the window assembly at F1 through F3` (PASS)
9. `Phase 2 keeps the window brighter than both original silhouette placeholders` (PASS)
