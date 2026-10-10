<USER_REQUEST>
Edit the hero aniamtion and refine it according to this 

# PRD — Home Hero v3: "The Wreath Split" (3 Acts) + The Monolith

**Project:** OSU Tamil Sangam website · Next.js 16 · React 19 · R3F v9 · drei · GSAP ScrollTrigger · Lenis · Tailwind 4
**Surface:** Home page (`/`): pinned WebGL hero (Acts I–II), the Act III slate, and the Monolith content section
**Status:** Detailed expansion of the "Master Directive: Hero WebGL Wreath Split & 3-Act Redesign"
**Builds on:** the existing global architecture (one persistent `<Canvas frameloop="never">`, master ticker, frame governor, drei `<View>` heroes, tiering). Lessons from the code review (F-01, F-03, F-04, F-08, G-01) are baked in below.
**Audience:** The implementing developer / AI agent. A paste-ready directive is in **Part B**.

---

# PART A: PRODUCT REQUIREMENTS

## 0. How this PRD changes the directive (read first)

The directive's vision is preserved: a full-screen digital kolam, a chrome "அ" that recedes into fog, the kolam splitting and bending into a wreath around a Thirukkural, and a black slate rising over it. The items below are **corrections or sharpenings**, each with the reason. Where a directive line is kept verbatim, it is marked *(kept)*.

| # | Directive says | Revision | Why |
|---|---|---|---|
| 1 | Two rigid meshes translate to `x = ±5` and rotate on Z | **Per-vertex shader bend** with a top-down "zipper" stagger, mirrored halves. Rigid transform kept only as the Tier B fallback. | A rigid rotate/translate is not a *bend*, and cannot "split from the top". Your idea (split from the top, bend the opposite ways, wrap the Kural) needs a deformation field (§7). |
| 2 | `radialSegments={32}` | **12 (Tier A) / 8 (Tier B)** with smooth normals | A 3–6 px-wide tube has no visible benefit past ~12 sides; 32 × thousands of segments is >700k triangles. |
| 3 | `<Environment preset="city">` | **Local Lightformer environment, rendered once (`frames={1}`)**; no CDN HDR | Presets fetch an HDR from a CDN at runtime (network dependency, CSP, jank). A custom warm environment also matches the site palette. |
| 4 | `<Text3D>` with a Tamil serif | **Single-glyph geometry** (subset font or SVG → `ExtrudeGeometry`) | A full Tamil typeface JSON is megabytes; only "அ" (and maybe "௦௧") is needed. |
| 5 | Emblem "does not shrink" yet moves to `z = −30` | **It recedes with perspective (≈ 29% apparent size at z = −30)**, fades into fog. Optional counter-scale is documented. | Perspective makes it smaller; the PRD states the intended look explicitly. |
| 6 | "Material opacity fades to 0" | **`alphaHash` dither + fog**, with opacity only for the last 20% | Fading chrome by plain opacity looks like glass; alphaHash gives a grainy dissolve consistent with film grain and avoids sort issues. |
| 7 | Act III slides in at progress 0.5–1.0 | **Act III at 0.62 → 0.953** (natural 1:1 scroll), with an explicit pin/overlap formula | Gives the Kural a reading dwell; avoids the sticky-vs-trigger distance mismatch that broke the Guide hero (code review F-01). |
| 8 | Hide Navbar / Ask Nanba in Acts I–II | **Visually purged, but reachable** by keyboard focus, top-edge hover, and scroll-up | Fully removing navigation traps keyboard/AT users. |
| 9 | Tier 1 Tamil "slides up" | **Split by line/word/grapheme, never by code unit** | Splitting Tamil by `String.split("")` breaks glyph clusters. |
| 10 | Bloom/glow implied | **Hero must render through the grade stack** (or an in-scene fallback) | Review F-04: the Guide station bypassed bloom; this hero needs it for kolam glow and chrome sparkle. |
| 11 | "Wreath" shape unspecified | **Open at the top, joined at the bottom** (a laurel-style wreath), with a defined inner void for the text | This is what "splits from the top" implies. |

*(Kept)*: `frameloop="never"`, `safeDelta = min(delta, 0.05)`, no `framer-motion`, no `rounded-xl`, no drop shadows, 0 px radius, 1 px `border-white/10`, delete the "AATAM PAATAM KONDATAM" ribbon, 4/8 column Monolith, `#FFB84D` hover.

---

## 1. Experience narrative (storyboard)

**Act I: The Emblem.** Black, near-silent. A kolam draws itself across the entire screen, line by line from the centre outward, pulli dots blinking on in a ripple. Behind a clear central void, a chrome Tamil vowel **"அ"** floats, catching warm light as it drifts. The kolam pulses with slow waves of light. Nothing else is on screen: no nav, no chat button, no labels.

**Act II: The Wreath.** The user scrolls. The "அ" drifts back into the fog and dissolves into the dark. At the same time the kolam **unzips from the top**: the two mirror halves peel away from the centre seam, top first, bend backward, and sweep around until they form a **wreath**: open at the top, tied at the bottom, wrapping the centre. Inside the wreath, a **Thirukkural** appears in three tiers: the Tamil couplet (blurring into focus), the English translation (word by word), and a monospace caption (*Adhigaaram 9*).

**Act III: The Curtain Rise.** After a reading pause, a solid black slate slides up from the bottom and covers the pinned scene.

**The Monolith.** A structured, typographic content section: a 4-column left rail (watermark, hairline border, telemetry) and an 8-column right column (the hook "A hearth on the banks of the Olentangy." and three dossier ribbons).

---

## 2. Goals, non-goals, success criteria

### Goals
1. A **cinematic first 10 seconds** that is beautiful as a still *and* in motion.
2. A **mathematically clean, reversible** wreath deformation (scrubbing backward undoes it exactly).
3. **Cultural fidelity:** the kolam must read as a real kolam (pulli + continuous interlaced line logic), and the Kural must be accurate.
4. **One scroll model, one clock:** the hero uses the master ticker and a ref-based progress (no per-tick React state).
5. **Accessible and fast:** real DOM text, reduced-motion fallback, navigation reachable.

### Non-goals
- No audio. No `framer-motion` on this page.
- No third-party HDRIs or font JSON downloads at runtime.
- No changes to the global tick/governor/tier logic (this hero only registers with them).

### Success criteria
| Metric | Target |
|---|---|
| Frame rate (Tier A, M1 Air @ 1440p) | median ≥ 55 fps through Acts I–II |
| Triangles (hero) | ≤ 200k (A) / ≤ 90k (B) |
| Draw calls (hero) | ≤ 25 |
| Hero JS | lazy chunk ≤ 350 KB gzip (excluding shared three/R3F) |
| Kolam centreline payload | ≤ 150 KB gzip; tube mesh generated at load in < 60 ms (or in a worker) |
| Seam integrity | At q = 0, left + right halves render with no visible seam or z-fighting; at q = 1, they join at the bottom point within 0.5 px |
| Reversibility | Scrub to 1 and back to 0: max screen-space position error < 1 px |
| Real-scroll test | Progress reaches 1.0 at the end of the pinned range **while pinned** (guards F-01) |
| LCP | < 2.5 s (poster = static wreath-state SVG/AVIF; text is DOM) |

---

## 3. Hard constraints (the safeguards) and how each is implemented

| Constraint | Implementation |
|---|---|
| Global `<Canvas>` keeps `frameloop="never"` | Hero never calls `invalidate()` or sets its own loop; it only registers a `<View>` and per-frame hooks driven by the master tick |
| `const safeDelta = Math.min(delta, 0.05)` in **every** `useFrame` | Lint rule/code review check; shared helper `useSafeFrame(cb)` wraps `useFrame` and passes `safeDelta` |
| No `framer-motion`, 0 px radius, no shadows, `border-white/10` | ESLint `no-restricted-imports` for `framer-motion` in `/src/app/(home)` and `/src/components/home-hero/**`; CSS audit test greps for `rounded-` (except `rounded-none`) and `shadow-` classes in the Monolith |
| Master ticker | GSAP ticker drives Lenis and the engine; ScrollTrigger only writes `progressRef` |
| Purge UI in Acts I–II | `data-hero-purge` attribute on `<body>` toggled from progress; CSS hides nav/chat with `opacity:0; pointer-events:none` (not `display:none`) so they remain focusable (§8.4) |

---

## 4. Master timeline

`p` is **hero scroll progress** over the pinned distance `D = 300dvh` (desktop) / `260dvh` (mobile). `q` is **Act II local progress**.

| Range `p` | Act | What happens | Scroll cost (desktop) |
|---|---|---|---|
| **Load (time)** | I-intro | Boot slate releases → kolam draws (2.6 s), pulli ripple, emblem emerges from fog (1.8 s) | 0 |
| **0.00 – 0.08** | I | Hold: emblem floats, kolam pulses | 24dvh |
| **0.08 – 0.50** | II | `q = (p − 0.08)/0.42`: emblem exits (q 0 → 0.6), kolam unzips top→bottom (q 0 → 1), Kural tiers reveal (q 0.55 / 0.70 / 0.85) | 126dvh |
| **0.50 – 0.62** | II-dwell | Wreath complete, Kural readable, ambient shimmer only | 36dvh |
| **0.62 – 0.953** | III | Slate slides up 1:1 with scroll; WebGL pauses at the end | 100dvh |
| **0.953 – 1.00** | III-settle | Slate fully covers; pin releases; Monolith scrolls normally | 14dvh |

(Directive had Act III at 0.5–1.0; see Revision 7.)

---

## 5. Scroll and layout architecture (get this right once)

### 5.1 Why this section exists
The Guide hero used a `340vh` ScrollTrigger distance against a `340dvh` section containing a `100dvh` sticky stage. The stage is pinned for only 240dvh, so progress reached ≈ 0.71 when it unpinned. **Do not repeat this.** One constant, one formula, one real-scroll test.

### 5.2 DOM structure
```html
<main id="app-root">
  <section id="home-hero" data-home-hero style="--hero-d: 300dvh">
    <!-- height = D + 100dvh -->
    <div class="sticky top-0 h-[100dvh] overflow-hidden">     <!-- the STAGE (pinned for D) -->
      <div data-view-anchor class="absolute inset-0"></div>   <!-- drei <View> tracks this -->
      <div class="absolute inset-0 grid place-items-center">  <!-- Kural DOM, centred -->
        <article data-kural>…</article>
      </div>
    </div>
  </section>
  <section id="monolith" class="relative z-20 bg-[#050201]"
           style="margin-top: calc(var(--hero-d) * -0.38)">    <!-- the SLATE + content -->
    …
  </section>
</main>
```
- **Hero section height** = `calc(var(--hero-d) + 100dvh)` → the stage is pinned while `scrollY ∈ [0, D]`.
- **Monolith overlap:** `margin-top = −(1 − ACT3_START) × D` = **−0.38 × D = −114dvh**. The Monolith's top edge enters the viewport bottom exactly when `p = 0.62` and covers the viewport fully when `scrollY = 0.62D + 100dvh = 286dvh`, i.e. `p ≈ 0.953`. Its motion is the natural 1:1 page scroll (no scrubbed translate needed), so it can never desync.
- `z-20` and `bg-[#050201]` on the Monolith so it hides the stage.

### 5.3 ScrollTrigger (no magic numbers)
```ts
ScrollTrigger.create({
  trigger: "#home-hero",
  start: "top top",
  end: "bottom bottom",        // == D by construction
  scrub: 0.6,                  // plus Lenis smoothing
  onUpdate: (self) => { homeHeroProgress.current = self.progress; }  // ref only
});
```
Constants live in `homeHero.constants.ts`: `HERO_D_VH = {desktop:300, mobile:260}`, `ACT3_START = 0.62`, and the CSS margin is derived from them (via a CSS variable set at mount, not duplicated literals).

### 5.4 Tests that must exist
1. **Pin geometry:** scroll to `section.bottom − innerHeight`; assert `progress ≥ 0.999` and the stage is still `position: sticky`-pinned.
2. **Slate timing:** at `p = 0.62`, the Monolith's top equals the viewport bottom (±2 px); at `p = 0.953`, it covers the viewport.
3. **Breakpoint parity:** CSS and JS "mobile" definitions come from one source (`matchMedia("(max-width: 767.98px)")` in both), tested at 767/768/769 px.

### 5.5 Rendering control
- The hero registers `governor.request("home-hero", 2)` while visible and `p < 0.62` (smooth 60 fps for the first impression); drops to `1` during dwell; `0` and `view.visible = false` at `p ≥ 0.953`.
- Never toggle `group.visible` on a threshold while it is in frame (Guide board pop-in lesson); fade instead.

---

## 6. Act I: Kolam and Emblem

### 6.1 The kolam: design, authoring, geometry

**Design brief (cultural fidelity).** A **pulli kolam** (dot-lattice) with **sikku-style interlaced lines** that flows as continuous loops around the dots, symmetrical about the vertical axis, edge-to-edge across the screen with a **clear central void** (radius ≈ 0.18 × viewport height) for the emblem. Have a member or advisor who practices kolam review the pattern for authenticity before build. Provide **two authored layouts**: *landscape* and *portrait*.

**Authoring pipeline.**
1. Author `kolam-half-{landscape,portrait}.svg`: the **right half only** (x ≥ 0), one `<path>` per stroke, plus a `<g id="pulli">` of dot circles. Lines that cross the seam must do so **perpendicularly** (mirror symmetry) at a small, listed set of seam points (≤ 12).
2. `scripts/build-kolam.mjs` samples each path at uniform arc length (≈ 0.05 world units), computes cumulative arc `aArc`, normalised pattern coordinates `(s, t)` for every sample, flags **seam ends** (`aSeam`), and writes a compact Float32 **centreline** file (≈ 8–10k points; gzip ≤ 150 KB).
3. At load (or in a worker), build the **tube mesh** from the centreline: `radialSegments 12`, smooth normals, `Uint32` indices.

**Per-vertex attributes (the contract with the shader):**
| Attribute | Meaning |
|---|---|
| `position` | tube surface vertex (flat layout, right-half local space) |
| `aCenter` | the centreline point this vertex belongs to (flat layout) |
| `aST` | pattern coordinates: `s ∈ [0,1]` distance from the seam, `t ∈ [0,1]` top → bottom |
| `aArc` | cumulative arc length (normalised) for draw-on and pulses |
| `aCap` | 1.0 for seam end-cap vertices (small bead), else 0 |

**Two meshes, one geometry.** `<group name="Kolam">` contains `RightHalf` and `LeftHalf` that **share the same `BufferGeometry` and material**. `LeftHalf.scale.x = −1` (three flips winding automatically for negative determinants). This guarantees perfect symmetry and halves memory. *(Satisfies the "two perfectly symmetrical meshes meeting at the centre" requirement.)*

**Seam hygiene.** Tubes end *exactly* at x = 0 with **no flat end caps**. Instead, small spherical **bead caps** (`aCap = 1`) are scaled by `smoothstep(0, 0.2, e)` in the shader, so they are invisible while closed (no overlap/z-fight) and appear as buds when the halves open.

**Pulli dots.** One `InstancedMesh` (≈ 120–200 spheres, 16×12 segments) per half (again sharing geometry, mirrored by scale). They run the same deformation (as points: `aCenter = position`, tiny cross-section).

**Material (digital kolam).** `MeshStandardMaterial` patched via `onBeforeCompile` (keeps PBR, fog, and tone mapping):
- base `#F1E9D2`, emissive `#F1E9D2` at 0.55, roughness 0.35, metalness 0
- **Draw-on:** discard/shrink radius where `aArc > uDraw` (intro, §6.4)
- **Pulse:** `emissive *= 1 + 0.9 * smoothstep(0.92, 1.0, sin(aArc*TAU*3.0 - uTime*0.9)*0.5+0.5)`: slow light waves travelling along lines; warm tint `#FFB84D` at the crest
- `fog: true`

**Optional depth layer (P1).** A second, fainter "ghost kolam" at `z = −3` (scale 1.18, hairline, 25% emissive) drifting with pointer parallax to add depth.

### 6.2 The emblem: chrome "அ"

**Geometry.** Convert "அ" from an **OFL-licensed Tamil serif** (e.g., Noto Serif Tamil) to a single-glyph asset: either (a) a **facetype.js/typeface JSON subset containing only that glyph** for `<Text3D>`, or (b) outline → SVG → `ExtrudeGeometry`. Use (b) if the glyph appears mirrored/inverted (see below). Record the font licence in `docs/assets-licenses.md`.
- Settings: `curveSegments 24–32`, `bevelEnabled`, `bevelSize 0.015`, `bevelThickness 0.03`, `bevelSegments 6`, depth ≈ 0.18. (`curveSegments={64}` from the directive is allowed on Tier A only if triangle budget holds; bevel segments matter more.)
- **Orientation fix:** diagnose first. If the glyph reads mirrored from the front, the clean fix is to flip the geometry on X (or use the typeface `reverse` option at conversion), not a `rotation={[0, π, 0]}` that exposes the back face and its inverted bevel lighting. If the directive's rotation is used, verify that normals/bevels light correctly.
- Size: glyph height ≈ **0.30 × viewport height**, centred in the kolam's central void.

**Material (premium chrome).** `meshPhysicalMaterial`: `color #fff`, `metalness 1`, `roughness 0.10–0.18`, `clearcoat 0.3`, `envMapIntensity 2`. (`roughness 0.05` + `clearcoat 1` on a metal mostly doubles specular cost; keep the glyph slightly softer so highlights bloom instead of aliasing.)
- Set `transparent = true` from the start and enable `alphaHash` so the exit dissolve never triggers material changes.

**Environment (no CDN).** `<Environment frames={1} resolution={256}>` containing `<Lightformer>`s: a large warm softbox upper-left (`#FFD9A0`, intensity 4), a narrow cool strip right (`#9FD6FF`, 1.5), a bright warm kicker low (`#FFB84D`, 2), and a faint dark floor. The kolam is **not** in the reflection; the site's warm palette is. Tune until the glyph shows crisp bright edges against a dark body. `background={false}`.

**Idle motion.** In one `useSafeFrame`: `y = A·sin(2π·t/6)` with `A = 0.08`; `rotation.y = ±4°` slow wobble (so highlights slide); pointer parallax ±1.2°; all amplitudes scaled by `(1 − emblemExit)`; disabled when reduced motion.

### 6.3 Scene setup
- Camera: perspective, FOV 35°, position `(0, 0, 12)`, looking at the origin. Viewport height at z = 0: `Hv = 2·12·tan(17.5°) ≈ 7.57`; `Wv = Hv·aspect`.
- Kolam placement: half-width `X = 0.5·Wv·1.12`, height `Y = Hv·1.12` (12% bleed), centred at the origin.
- Fog: `FogExp2("#050201", 0.03)`. Check at z = −30 (distance 42): `1 − exp(−(0.03·42)²) ≈ 80%` fogged ✓ ("swallowed by fog"); kolam at distance 12: ≈ 12% ✓. Chrome and kolam materials have `fog: true`.
- Background `#050201`.
- **Grade:** the hero must be affected by the global grade (bloom threshold ≈ 0.85, LUT, vignette, grain). **Phase 0 spike:** prove the `<View>` is graded, or implement the in-scene fallback (additive glow sprites on pulli dots, a CSS vignette/grain overlay). *Do not* ship a hero with no bloom.

### 6.4 Intro and idle ("alive at rest")
- **Draw-on:** `uDraw: 0 → 1` over 2.6 s (ease `power2.out`), ordered by **distance from the centre** (precompute `aArc` ordering by radial distance), pulli dots pop with a 40 ms stagger per ring.
- **Emblem:** emerges from `z = −8` (fogged) to `z = 0`, alpha-hash 0 → 1 over 1.8 s, starting at 0.6 s.
- **Idle:** kolam pulse waves every ~6 s; very slow rotation of the ghost layer (±0.4°); dust motes (≤ 120 points) drifting; emblem float.
- **Boot interplay:** the intro starts on `bootReleased`; if the user is already scrolled (restoration), skip to the state implied by `p`.

---

## 7. Act II: The Wreath Bend (the mathematical approach)

*This section answers the directive's "detail the mathematical approach" requirement.*

### 7.1 Coordinates and parameters
- Work in **right-half local space** `(x ≥ 0)`; the left half is the same mesh mirrored by `scale.x = −1`.
- Pattern coordinates per vertex: `s ∈ [0,1]` (distance from seam, 0 at the seam, 1 at the screen edge), `t ∈ [0,1]` (top → bottom).
- Flat position: `F(s,t) = (s·X, Y·(0.5 − t), 0)`: this is simply `aCenter`.
- **Act II progress** `q ∈ [0,1]`.

### 7.2 The zipper stagger (split from the top)
Per-vertex openness:
```
g(t, q) = clamp( (q − δ·t) / (1 − δ), 0, 1 )      δ = 0.5
e(t, q) = smootherstep(g)  = g³(g(6g − 15) + 10)
```
- At `t = 0` (top) `g` reaches 1 at `q = 0.5`; at `t = 1` (bottom) it starts at `q = 0.5` and ends at `q = 1`. The "zip" travels top→bottom across the whole of Act II.
- The seam stays joined at the bottom until the very end, then the join is the wreath's tie.

### 7.3 The wreath target `W(s,t)` (open at top, tied at bottom)
```
φ(t) = φ_gap + t·(π − φ_gap)                    // angle from 12 o'clock, clockwise
r(s) = R_in + s^γ·(R_out − R_in)                // γ = 0.85
W(s,t) = ( C.x + r·sin φ,  C.y + ε·r·cos φ,  w_z(t) )
w_z(t) = z_tip·(1 − t)² − z_belly·sin(π t)      // tips curl toward camera, belly bows back
```
- `C` = wreath centre (slightly above screen centre, matching the Kural block's centre).
- `φ_gap ≈ 14°` (opening at the top); at `t = 1`, `φ = π` and `W(0,1) = (0, C.y − ε·R_in)`, **the same point for both halves**, so the halves tie at the bottom ✓.
- `ε` = ellipse factor (1.0 landscape; ≈ 1.4–1.5 portrait) so the wreath fits tall screens.

### 7.4 The bend pose (why it "bends the opposite way")
A straight blend `mix(F, W, e)` can collapse through the middle. Use a **quadratic Bézier** with a mid-pose `M` that pushes each half outward and *back* in depth:
```
M = F + ( a_x·X·s^1.2·√(1 − t),  0,  −a_z·Hv·sin(π·min(1, 1.2t))·(0.4 + 0.6 s) )
P = (1 − e)²·F + 2(1 − e)e·M + e²·W
```
Because the left mesh is mirrored, the same formula yields **opposite-direction** bends for the two halves.

### 7.5 Keeping tubes round: the rigid cross-section approximation
Deform the **centreline**, not the tube surface:
```
offset = position − aCenter                   // cross-section vector
β      = smootherstep(e) · (π/2 − φ(t))       // local frame rotation from flat to wreath tangent
offset.xy = Rz(β) · offset.xy
k      = mix(1, k_w, e) · (1 − e·f_out·smoothstep(0.55, 1.0, s))   // thinner & outer lines fade
k     *= mix(1, smoothstep(0, 0.2, e), aCap)                        // seam bead caps appear when open
worldPos = P + k·offset
normal   = Rz(β)·normal
```
- `k_w ≈ 0.55` compensates for the pattern compressing into the ring; `f_out ≈ 0.7` thins/fades the outermost columns so the wreath does not clutter (see density, §7.7).
- `Rz(β)` in GLSL: `mat2(c, s, −s, c)`.

### 7.6 GLSL (patched into `MeshStandardMaterial` at `#include <begin_vertex>`)
```glsl
uniform float uQ, uDelta, uRin, uRout, uPhiGap, uEps, uTubeScale, uFadeOut;
uniform vec2  uHalf;      // (X, Y)
uniform vec2  uCenter;    // C
uniform vec3  uMid;       // (a_x, a_z, unused) in world units
attribute vec3 aCenter;  attribute vec2 aST;  attribute float aCap;

float sm5(float x){ return x*x*x*(x*(x*6.0-15.0)+10.0); }

vec3 F = aCenter;
float s = aST.x, t = aST.y;
float g = clamp((uQ - uDelta*t) / (1.0 - uDelta), 0.0, 1.0);
float e = sm5(g);

vec3 M = F + vec3(uMid.x*uHalf.x*pow(s,1.2)*sqrt(1.0-t), 0.0,
                  -uMid.y*sin(PI*min(1.0,1.2*t))*(0.4+0.6*s));
float phi = uPhiGap + t*(PI - uPhiGap);
float r   = uRin + pow(s,0.85)*(uRout - uRin);
vec3  W   = vec3(uCenter.x + r*sin(phi), uCenter.y + uEps*r*cos(phi), tipZ(t));

float u = 1.0 - e;
vec3  P = u*u*F + 2.0*u*e*M + e*e*W;

float beta = sm5(e)*(0.5*PI - phi);
mat2  R    = mat2(cos(beta), sin(beta), -sin(beta), cos(beta));
vec3  off  = position - aCenter;  off.xy = R*off.xy;
float k    = mix(1.0, uTubeScale, e) * (1.0 - e*uFadeOut*smoothstep(0.55,1.0,s));
k *= mix(1.0, smoothstep(0.0,0.2,e), aCap);
vec3 transformed = P + k*off;
vNormalObj = vec3(R * normal.xy, normal.z);   // feed into the standard normal chain
```

### 7.7 Density and starting parameters
The flat half-page area (~1.1 H²) maps into an annular sector (~0.3 H²), a ≈ 3.8× area compression. Mitigate with: `k_w = 0.55`, outer-column fade (`f_out`), and radii that extend slightly beyond the screen edge so the ring is cropped rather than cramped.

| Parameter | Landscape | Portrait |
|---|---|---|
| `R_in` | 0.30 · Hv | 0.52 · Wv |
| `R_out` | 0.56 · Hv | 0.98 · Wv |
| `ε` | 1.0 | 1.45 |
| `φ_gap` | 14° | 14° |
| `δ` (zip spread) | 0.5 | 0.5 |
| `a_x`, `a_z` | 0.22, 0.35 | 0.16, 0.30 |
| `z_tip`, `z_belly` | 0.4, 0.5 | 0.3, 0.4 |
| `k_w`, `f_out` | 0.55, 0.7 | 0.5, 0.75 |

All of these are tunable live in the `/home/lab` page (§12).

### 7.8 Reversibility and numerical care
- The deformation is a **pure function of `(s, t, q)`**; no integration, no state, so scrubbing is exactly reversible.
- Clamp `q` to [0,1]; precompute `aST` on the CPU in float32; avoid `pow(0, γ)` NaNs with `max(s, 1e-5)`.
- Provide the same math as a **CPU reference** (`wreathMath.ts`) used for: unit tests, the static fallback SVG generation script, and the `?debug=ref` overlay (draws CPU-computed centreline samples over the GPU result to prove they agree).

### 7.9 Emblem exit
```
g_e   = clamp(q / 0.60, 0, 1)
z     = lerp(0, −30, easeInOutCubic(g_e))
alpha = 1 − smoothstep(0.35, 1.0, g_e)           // via alphaHash + opacity in the last 20%
scale = 1 (optional counter-scale c = (12 − z)/12 for the first 40% of g_e to hold apparent size)
```
Apparent size at `z = −30`: `12 / 42 ≈ 29%`. Fog handles the rest. The float animation is multiplied by `(1 − g_e)`.

### 7.10 The Kural reveal (DOM, in the centre of the wreath)
Positioned by CSS in the stage's centre; the **wreath's inner void** is sized (`R_in`) so the block fits: block width ≤ `1.5·R_in` in screen px (an inscribed 1.6:1 rectangle), centred at `C`.

| Tier | Content | Trigger (`q`) | Animation |
|---|---|---|---|
| 1 | Tamil couplet, high-contrast serif | 0.55 → 0.70 | Slides up 24 px, `filter: blur(10px) → 0`, opacity 0 → 1 |
| 2 | English translation | 0.70 → 0.85 | Cascades **word by word** (30 ms stagger) |
| 3 | Mono caption "Adhigaaram 9" | 0.85 → 1.0 | Fades in at the bottom of the block |

Implementation notes:
- Driven by GSAP **scrubbed tweens on the same master timeline** (reversible), writing CSS variables / transforms directly; **no React state per tick**.
- `filter: blur()` on a large block is costly; limit to Tier 1, give it `will-change: filter, transform`, and release `will-change` when done.
- **Tamil splitting:** split by **line** or **word**; if per-glyph animation is desired, use `Intl.Segmenter("ta", {granularity:"grapheme"})`. Never `split("")`.
- Text lives in the DOM from first paint (server-rendered), initially `opacity:0` (not `display:none`), so assistive technology and SEO see it. `h1` = Tamil couplet (`lang="ta"`), English `p lang="en"`, caption `p`.
- **Content:** Chapter 9 of the Kural (*Virundhombal*, hospitality) per the directive; the opening couplet of the chapter is the natural candidate. **Take the Tamil text from a trusted edition and have it reviewed**; use a public-domain or self-authored translation (e.g., a 19th-century public-domain translation) rather than a modern copyrighted one.

### 7.11 UI purge (Acts I–II)
- Toggle `document.body.dataset.heroPurge = "true"` while `p < 0.62`.
- CSS: `[data-hero-purge="true"] :is(.site-nav, .ask-nanba) { opacity:0; pointer-events:none; transition: opacity .4s }`.
- **Reveal paths:** `:focus-within` on the nav (keyboard Tab shows it), pointer within the top 72 px, any scroll-up intent (wheel/touch up for > 40 px), and `p ≥ 0.62`.
- Remove all debug text ("ACT 1: THE EMBLEM") from production; keep it behind `?debug=1`.
- Add a **Skip** control (visible on focus) that smooth-scrolls to `#monolith` via `lenis.scrollTo`.

---

## 8. Act III: The Curtain Rise

### 8.1 Behaviour
The slate is the Monolith section itself, entering via natural scroll (§5.2). While it rises, the pinned scene keeps rendering until the slate covers more than ~90% of the viewport, then `governor.request("home-hero", 0)`. Optional polish: as the slate rises, scale the Kural block to 0.97 and dim its opacity (parallax "recede") using the same progress.

### 8.2 Edge handling
- Scroll restoration / hash links to `#monolith`: set `p` immediately; do not replay Act II.
- Back navigation from another route returns to the *earned* state (store a lightweight `homeHeroSeen` flag in memory/`sessionStorage` guarded by try/catch) and skips the intro draw-on.
- `inert`/focus: while the slate fully covers the stage, set `inert` on the stage's DOM (the Kural text) so focus cannot land under the slate; remove it when scrolling back.

---

## 9. The Monolith (content)

### 9.1 Layout
`grid grid-cols-12`, min-height `100dvh`, background `#050201`, **no rounding, no shadows**.

**Left column (`col-span-4`)**
- Watermark `௦௧` (Tamil digits 0 and 1), **3% opacity**, enormous (`clamp(14rem, 32vw, 36rem)`), `aria-hidden`, positioned bottom-left, clipped.
- **Right border:** `border-r border-white/10`, full column height.
- **Telemetry (monospace, bottom-aligned, `text-[11px] tracking-[0.18em]`):**
  - `COLUMBUS, OHIO` · local time (`America/New_York`), updated by a tiny island that sets `textContent` once per second (no React state, no re-render of the section)
  - `OLENTANGY RIVER`
  - `MEMBERS · <n>` and `EST. <year>` from site data (placeholders until supplied)
- Uses existing CSS variable for mono (`--font-azeret-mono`).

**Right column (`col-span-8`)**
- **Hook:** "A hearth on the banks of the Olentangy." Serif, `font-size: clamp(2.75rem, 6.2vw, 7rem)`, `leading-[0.95]`, `tracking-[-0.02em]`, left-aligned, generous top padding.
- **Dossier ribbons**, three full-width strips separated by `border-b border-white/10`:

| Ribbon | Index | One-line descriptor (draft) | Link (proposed) |
|---|---|---|---|
| CULTURAL MEMORY | 01 | Language, festivals, and the stories we carry | `/gallery` |
| THE BANQUET TABLE | 02 | Shared meals, potlucks, and the food that tells us who we are | `/events` |
| KINSHIP | 03 | Friends who become family, far from home | `/about` or `/join` |

  Each ribbon: mono index (left), large serif title, descriptor in muted white (`text-white/50`), trailing `→`. **Hover/focus-visible:** `translate-x-3` and text colour `#FFB84D`; `transition-[transform,color] duration-300 ease-out`; `motion-reduce:transition-none`. Entire strip is one focusable link. On touch, the arrow and gold index are always visible (no hover dependency).
- **Delete** the "AATAM PAATAM KONDATAM" ribbon and its CSS/JS; add a test that the string no longer appears in the built home page.

### 9.2 Responsive
- `< md`: stack columns; left column becomes a compact top strip (watermark behind, telemetry in a 2-column mono grid); ribbons remain full width; hook scales down via `clamp`.
- Maintain 1 px borders and 0 radius at all sizes.

### 9.3 Content to confirm
Ribbon descriptors, destinations, member count, founding year. All Tamil text flagged for native review.

---

## 10. Performance, tiers, fallbacks

| Tier | Settings |
|---|---|
| **A** | DPR ≤ 1.75; kolam `radialSegments 12`; ghost layer on; dust 120; chrome `curveSegments 32`; bloom on; env resolution 256 |
| **B** | DPR ≤ 1.5; `radialSegments 8`; no ghost layer; dust 60; `curveSegments 20`; bloom on, reduced samples |
| **C / reduced-motion / no WebGL** | **No canvas, no pin.** Show the **static wreath-state composition** (SVG generated by the same math script) with the Kural visible and the Monolith below. Optional gentle CSS opacity pulse on the SVG (off when reduced motion) |

**Rigid-bend fallback (Tier B option or emergency).** If the shader deformation cannot be completed in time, ship the directive's simpler version: each half rotates about a bottom pivot by `±55°` and translates outward (`x: ±5`), with per-half Z-bow. It reads as a "V/book opening" rather than a wreath but needs no custom shader.

**Budgets and hygiene:** zero steady-state allocations in `useFrame`; uniforms updated from refs; one kolam geometry shared by both halves; no per-tick React state; dispose geometry/textures on unmount; Strict Mode safe; pause when the tab is hidden.

**Load plan:** poster (static wreath SVG/AVIF) first → centreline file + glyph asset (preload) → build tube mesh → release boot slate → start intro.

---

## 11. Accessibility, i18n, content integrity
- Canvas is decorative (`aria-hidden`). The Kural block is real text; reading order = Tamil, English, caption.
- Navigation remains reachable (§7.11); the skip control jumps to `#monolith`.
- `prefers-reduced-motion` → Tier C composition; no blur animation; no flashing.
- Contrast: Kural text on `#050201` ≥ 7:1; `#FFB84D` hover ≥ 7:1.
- **Tamil:** correct Unicode, `lang="ta"`, no code-unit splitting; font with proper shaping (Noto Serif Tamil or the site's Tamil serif); line-height ≥ 1.6 for the couplet.
- **Kolam/Kural authenticity:** native-speaker and kolam-practitioner review sign-off recorded in `docs/redesign/tamil-review.md`.
- **Assets and licences:** font (OFL), kolam artwork authorship, and Kural translation source recorded in `docs/assets-licenses.md`.

---

## 12. Testing and QA tooling

### 12.1 Lab page
`/home/lab?p=0.0..1.0&debug=1` (noindex, not linked, blocked in production unless `?lab=1` + env flag). Controls: `p` slider, `q`, tier switch, parameter sliders for §7.7, "ref overlay" (CPU vs GPU), wireframe, freeze time, FPS/`renderer.info`.

### 12.2 Automated tests
- **Math unit tests (`wreathMath.test`)**: seam join at bottom (`W(0,1)` equal for both halves), mirror symmetry, monotonic zip (`e` non-decreasing in `q`; non-increasing in `t` at fixed `q`), endpoints (`q=0 → F`, `q=1 → W`), reversibility, no NaNs on `s=0`.
- **Pin geometry tests** (§5.4).
- **Static greps:** no `framer-motion`, no `rounded-` (except `rounded-none`), no `shadow-` in hero/Monolith; no "AATAM PAATAM KONDATAM".
- **Playwright stills** (1440×900 and 390×844, per tier): `p = 0, 0.04, 0.12, 0.20, 0.29, 0.38, 0.50, 0.62, 0.80, 0.953`.
- **Pixel probes:** Act I central void is dark enough for the chrome to read (inner ring luminance); kolam stroke width in px at `p=0` is within 2–6 px; wreath inner-void radius matches `R_in` ± 2%.
- **Reduced-motion/Tier C** snapshot equals the SVG composition.
- **Frame-time capture** through a scripted scroll (≥ 55 fps median on Tier A hardware).

### 12.3 Approval frames
| Frame | `p` | Must show |
|---|---|---|
| **A1** | 0.0 | Full-screen kolam, bright chrome "அ" with crisp bevels and warm reflections, dark central void, bloom on lines |
| **A2** | 0.06 | Same, with a light pulse travelling along lines; emblem mid-float |
| **B1** | 0.14 | Emblem receding and ~30–40% faded; first split opening at the top |
| **B2** | 0.24 | Top third peeled outward, middle bending, bottom still joined |
| **B3** | 0.34 | Wreath mostly formed; tips curling toward camera |
| **B4** | 0.46 | Wreath complete, Kural Tier 1 resolving, Tier 2 cascading |
| **B5** | 0.56 | Full Kural readable, wreath shimmering |
| **C1** | 0.80 | Slate covering ~55% of the viewport, Kural still visible above |
| **C2** | 0.953 | Slate covers all; Monolith top state |

---

## 13. Delivery plan and gates

| Phase | Deliverable | **Gate** |
|---|---|---|
| **0. Preflight** | `homeHero.constants.ts`; pin/overlap layout (§5) with stub content; `/home/lab`; `wreathMath.ts` + tests; UI-purge plumbing; **grade-routing spike**; **single-glyph font spike** | Pin-geometry tests green; spike notes: View graded? glyph orientation correct? |
| **1. Act I** | Kolam authoring + tube generation + shared-geometry halves; pulli instances; chrome "அ"; custom environment; fog; intro draw-on; idle motion | **Stills A1, A2** approved; seam test at `q=0` clean; budgets met |
| **2. Act II** | Shader bend (§7), emblem exit, Kural tiers, UI purge with reveal paths | **Stills B1–B5** + scrub video (forward and reverse); reversibility test green |
| **3. Act III** | Slate overlap, render pause, inert/focus, scroll restoration | **Stills C1, C2**; real-scroll tests green |
| **4. Monolith** | Left rail, hook, ribbons, telemetry island; delete the old ribbon | Desktop + mobile screenshots; a11y audit; greps green |
| **5. Polish** | Tiers, Tier C SVG fallback, perf pass, device matrix | All Section 2 metrics met; reduced-motion verified |

**Rule:** do not begin Phase 2 until A1/A2 are approved by a human; do not begin Phase 3 until B-frames and the reverse scrub are approved.

---

## 14. Risks and mitigations
| Risk | Mitigation |
|---|---|
| Wreath mid-states look like a tangle | Bézier mid-pose, `δ` zip stagger, outer-column fade, lab sliders; rigid fallback available |
| Pattern density too high in the ring | `k_w`, `f_out`, larger `R_out` (cropped), optional pattern LOD that drops outer columns |
| Kolam looks like generic decoration | Authored by/for kolam practitioners; continuous-line logic; community review |
| Chrome looks black/flat | Custom lightformer environment, `frames={1}`; tune highlights against the dark body |
| No bloom on the hero | Grade-routing spike in Phase 0; in-scene glow fallback |
| Sticky/trigger mismatch (repeat of F-01) | §5 formula + real-scroll tests |
| Tamil text broken by splitting/shaping | Word/line splitting only; `Intl.Segmenter`; native review |
| Nav hidden harms accessibility | Reveal paths + skip control |
| Mobile aspect ruins the wreath | Portrait pattern + elliptical wreath (`ε`), separate radii table |
| Triangle/memory overshoot | 12/8 radial segments, shared geometry, centreline-only payload |

## 15. Open questions
1. Who authors the kolam (or which existing pattern do we adapt), and who signs off authenticity?
2. Which Kural (confirm chapter 9, couplet number) and which translation?
3. Tamil serif: Noto Serif Tamil, or the site's existing Tamil face?
4. Ribbon destinations and descriptors; member count and founding year for telemetry.
5. Is a fully hidden nav (with the reveal paths in §7.11) acceptable to the team?
6. Should the wreath have leaf/tip ornaments at the open top?
7. Should the "ghost kolam" depth layer ship in v1?

---

# PART B: PASTE-READY AGENT DIRECTIVE (replaces the original)

```
# MISSION: HOME HERO v3: "THE WREATH SPLIT" (3 ACTS) + MONOLITH
Stack: Next.js 16, React 19, R3F v9, drei, GSAP ScrollTrigger, Lenis, Tailwind 4. Package manager: npm ONLY.
Spec: docs/home-hero-wreath-split-prd.md is authoritative. Read Part A fully before coding.

HARD CONSTRAINTS
1. Global <Canvas> keeps frameloop="never". The hero only registers a <View>; never invalidate() or own a loop.
2. EVERY useFrame uses `const safeDelta = Math.min(delta, 0.05)` (use the shared useSafeFrame helper).
3. No framer-motion, no rounded-* (except rounded-none), no shadow-* classes, 1px borders `border-white/10`.
4. Progress lives in a ref written by ScrollTrigger (start "top top", end "bottom bottom"). NO per-tick React state.
5. Hero section height = D + 100dvh; Monolith overlaps with margin-top = -(1 - 0.62) * D. Build the real-scroll pin test FIRST.
6. Kolam: two halves share ONE BufferGeometry + material; left = scale.x = -1. Deform the centreline (aCenter) in the vertex
   shader; keep tube cross-sections round via the rigid-frame rotation. radialSegments 12 (A) / 8 (B). No end caps at the seam.
7. Chrome "அ": single-glyph geometry only. Custom Lightformer environment (frames=1). NO CDN HDR/preset. alphaHash fade + fog.
8. Never split Tamil by code unit. Split by line/word or Intl.Segmenter grapheme.
9. Hero must be affected by bloom/grade. Prove it in Phase 0 or implement the in-scene fallback. No bloom-less hero.
10. UI purge is visual only: nav/chat remain focusable (focus-within, top-edge hover, scroll-up reveal). Debug text only under ?debug=1.
11. Do not add dependencies beyond those already installed without asking.

MATH FIRST (REQUIRED BEFORE ANY SHADER CODE)
Reply with your plan for the wreath deformation, in your own words, covering: zipper stagger g(t,q)=clamp((q-δt)/(1-δ));
wreath target W(s,t) (φ, r(s), ε, tips/belly depth); Bézier mid-pose M for the opposite-direction bend; centreline-driven
tube deformation with cross-section rotation β and radius scaling k; seam bead caps; reversibility and NaN guards; the CPU
reference module (wreathMath.ts) and the unit tests you will write. Wait for approval.

PHASES (STOP AT EACH GATE; HUMAN APPROVAL REQUIRED)
0 Preflight: constants, pin/overlap layout + tests, /home/lab, wreathMath.ts + tests, purge plumbing, grade spike, glyph spike.
1 Act I: kolam authoring + tube build, shared halves, pulli, chrome emblem, environment, fog, draw-on, idle. Stills A1, A2.
2 Act II: shader bend, emblem exit, Kural tiers, purge reveal paths. Stills B1-B5 + forward/reverse scrub video.
3 Act III: slate overlap, render pause, inert/focus, scroll restoration. Stills C1, C2 + real-scroll tests.
4 Monolith: 4/8 column layout, watermark, border, telemetry island, hook, 3 ribbons, delete the AATAM PAATAM KONDATAM ribbon.
5 Polish: tiers, Tier C static SVG (generated by the same math), perf, device matrix.

EVERY PHASE MUST: run the app; capture Playwright screenshots; critique them against PRD §12.3; commit; report what looks wrong
before asking to proceed.

FIRST REPLY: acknowledge constraints, list unanswered items from PRD §15, then deliver the MATH FIRST plan only.
```
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-09T14:29:00-04:00.

The user's current state is as follows:
Active Document: c:\Users\hares\OneDrive\Desktop\CS_Projects\TamilSangamWebsiteOSU\src\director\wireframe.ts (LANGUAGE_TYPESCRIPT)
Cursor is on line: 1
Other open documents:
- c:\Users\hares\OneDrive\Desktop\CS_Projects\TamilSangamWebsiteOSU\src\director\wireframe.ts (LANGUAGE_TYPESCRIPT)
Browser State:
  Page 1033A8E3F4B533E595FAC3974D52DDC8 (OSU Tamil Sangam · The Ohio State University) - http://localhost:3000/ [ACTIVE]
    Viewport: 1707x898, Page Height: 6654
</ADDITIONAL_METADATA>