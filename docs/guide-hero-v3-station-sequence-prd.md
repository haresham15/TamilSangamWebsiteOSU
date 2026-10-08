# PRD — Guide Hero v3: "The Station Sequence"
### Window → Crane → Departure Board (Alaipayuthey-inspired cinematic expansion)

**Project:** OSU Tamil Sangam website · Next.js 16 · React 19 · R3F v9 · drei · postprocessing · GSAP ScrollTrigger · Lenis · Zustand
**Surface:** `/guide` hero (3D) + its hand-off to the FAQ DOM
**Status:** Expansion of the working split-flap board. **Supersedes** Guide PRD v2 §3.5 (hero frame), §5.1 (environment), §5.3 (camera), §5.7 (timeline). **Keeps** v2 §5.2 (board engine), §5.6 (bridge), §5.8 (idle life), §6–7 (tiers, a11y).
**Package manager:** `npm` only. Do not add `yarn.lock` / `pnpm-lock.yaml`.
**Audience:** The implementing developer / AI agent. A paste-ready agent directive is in **Part B**.

---

# PART A — PRODUCT REQUIREMENTS

## 0. Executive summary

A single continuous shot. You are on a rain-damp platform at blue hour, face-on to a weathered blue coach. Through a barred window, backlit by warm compartment light, a woman sits in silhouette; outside on the platform a man stands in silhouette, looking in. As you scroll, the camera **pulls back and cranes up**: the coach slides into context, the station hall opens into a vast fog-filled space, the rafters appear, and the **split-flap departure board** rises into frame and clatters out the **most-asked FAQ**. The page then hands off to the real, accessible FAQ content.

**Verdict on the submitted directive:** the concept, the billboard-silhouette trick, and the "don't touch the board engine" constraint are all right. Section 2 lists **eleven technical corrections** that would otherwise make the result look wrong (several are physically-based-lighting and fog traps that would reproduce the v1 "black on black" failure).

## 1. Goals, non-goals, success criteria

### Goals
1. **One unbroken, cinematic camera move** that reads like a film crane shot, not a scripted tween.
2. **A silhouette pair that lands emotionally** within 2 seconds of page load: legible shapes, clean edges, warm glow, stillness with life.
3. **Scale and awe in the reveal:** the viewer must feel the station is *massive* relative to the coach.
4. **The board stays the hero of function:** legible, crisp, and showing the real "most asked" question.
5. **60 fps budget** via billboards, instancing, fog-as-set-dressing, and tiers.
6. **Legal and ethical cleanliness:** original silhouette art, no film assets, no actor likenesses (Section 9).

### Non-goals
- No rigged 3D humans, no film footage/stills/music/logos, no real railway branding.
- No scroll-jacking (native scroll stays native).
- No changes to the board's InstancedMesh engine, atlas, or FlapEngine (Section 6.4 defines the integration contract).
- No audio by default.

### Success criteria
| Metric | Target |
|---|---|
| Visual gate | Frames **F1–F6** (Section 5.6) approved by the team before motion work |
| Frame rate | ≥ 55 fps median on M1 Air @ 1440p (High tier); ≥ 30 fps on mid-range Android (Low tier) |
| Silhouette contrast | Probe: median luminance inside silhouette mask < 0.04; adjacent backdrop > 0.45 (Section 8.3) |
| Board legibility at F6 | Cell height ≥ 40 px and glyph contrast ≥ 7:1 at 1440×900 |
| Scene draw calls | ≤ 110; triangles ≤ 350k; textures ≤ 20 MB (target < 8 MB) |
| Hero JS chunk | Lazy, ≤ 500 KB gzip, not in the main bundle |
| Poster LCP | < 2.5 s |
| Popular-FAQ freshness | Server value ≤ 5 min stale; zero layout shift from loading it |

---

## 2. Review of the submitted directive — what stays, what must change

| # | Directive says | Problem | Correction (normative) |
|---|---|---|---|
| 1 | `PointLight #FFB84D, intensity: 5` "blasts" light and casts the silhouettes into contrast | In three r155+ lights are **physically based** (intensity in candela, `decay = 2`). 5 cd is negligible at metres of distance. More importantly, a `MeshBasicMaterial` is **unlit**: a point light does nothing to it. Silhouettes read because of a **bright emissive backdrop behind them**, not because a light "casts" them. | Build a **luminous backdrop** (emissive gradient plane + emissive tube lights + bloom). Keep a `PointLight` (≈ 60–120 cd, `decay 2`, no shadows) only to light interior props (seat edges, curtain, bars). Add a `SpotLight` for the **light spill on the platform**. |
| 2 | `FogExp2('#0A0F14', 0.03)` | At 0.03, three's fog factor `1 − exp(−(ρd)²)` is **55% at 30 m and 84% at 45 m**. The board (≈ 23 m away at F6) would be ~40% washed into a near-black void, the exact failure mode of v1. | Use **ρ ≈ 0.016–0.02**, set `material.fog = false` on the **board** and key set pieces, and add *luminous* haze beyond the board (skylight glow) so a black board silhouettes against light. See the fog table in §5.5. |
| 3 | "Fog acts as our cinematic void" | A black void kills depth and repeats v1's emptiness | The "void" must be a **graded, luminous atmosphere**: blue haze with lit shafts, distant lamps, a glowing station mouth |
| 4 | Silhouettes via `alphaMap` PNG | three samples `alphaMap` from the **green channel**; PNG silhouettes **pixelate and fringe** during a dolly-in; premultiplied-alpha halos | Use a **single-channel SDF texture** with a screen-space-AA shader (crisp at any zoom, soft halation controllable) |
| 5 | Man "outside looking in" + woman inside, both as planes "facing the camera" | Billboards that always face the camera break parallax during the crane (the planes would swivel); two planes at one depth give no layering | **Fixed planes** at distinct depths (man outside the glass, woman inside) plus bars, curtain and glass between. Limit camera yaw while they are in view (§6.2). |
| 6 | Camera "mounted to a GSAP timeline"; animate `targetPosition` and `lookAt` linearly | Linear lerp of position **and** look-at produces a straight-line, robotic move and a swinging aim. `scrub: true` maps wheel notches 1:1 to the camera → **stutter**. | Camera on a **CatmullRom rail** with a **separate look-at rail**, FOV/roll/focus/exposure curves, `scrub: 0.8` plus Lenis, and a critically-damped follow (§6.2) |
| 7 | End position `[0, 8, 15]` and "pan up" | With the board unspecified, a camera at y = 8 looking at a board near y ≈ 10 yields only a **~5° tilt**, not a dramatic reveal | Place the board at **y ≈ 14**, camera final ≈ `(0, 6.8, 17.5)`; tilt-up ≈ 16° (verification table §6.2) |
| 8 | "Low-poly train" | Low poly alone looks like a prototype | Low-poly **geometry** + high-quality **surface**: normal maps, grime decals, rust streaks, rivet instances, stencil numerals, wet speculars, window bars, handrails |
| 9 | Board "types out character by character" | The board is a **split-flap**, not a typewriter | Reuse the existing **cascade ripple**; do not add typing logic |
| 10 | "Retrieve most-clicked FAQ… mock for now" | No spec for counting, abuse, privacy, caching, cold start, or SSR | Full system in §7 |
| 11 | "Show me the scene graph" as the gate | Code can compile and still look wrong | Gate on **approved stills** (F1–F6) + scene-graph dump + automated contrast probes (§8.3) |

**Also corrected by omission:** the directive had no loading/poster strategy, no mobile framing, no reduced-motion/fallback path, no idle life, no IP guidance, and no accessibility behavior. All are specified below.

---

## 3. Creative direction

### 3.1 Pitch
*Blue hour on a South Indian platform. A coach window glows like a lantern. Two silhouettes, a barred window between them, a drizzle you can only see in the light. Then the world opens: the camera lifts out of the moment and the station's iron rafters wheel overhead, and a board the size of a building starts to flip.*

### 3.2 Mood and grade
Teal–orange: **cool, damp, blue shadows (`#0A0F14` → `#14283a`) against a single warm source (`#FFB84D`)**. Heavy atmosphere, soft halation, anamorphic streaks, light grain. Intimate first, monumental second.

### 3.3 Palette
| Role | Value | Notes |
|---|---|---|
| Fog / deep shadow | `#0A0F14` | Distant colour, never pure black |
| Haze mid | `#14283a` → `#2a4a63` | Lit fog, platform lamp glow |
| Coach body | `#1A242F` weathered, edge highlights `#4d6b85` | Keep the directive's base colour; add wear |
| Coach band | Cream `#d9cfb4` (faded) | Livery stripe; fictional stencil text |
| Window glow | `#FFB84D` core → `#ff8a2a` falloff | HDR values for bloom |
| Silhouette | `#030303` | Near-black, never `#000` flat: slight film noise |
| Rim / halation | `#ffb870` | Backlight bleed around silhouette edges |
| Platform (wet) | `#1b2229` base; reflections of window light | Roughness 0.25 in puddle zones |
| Station practicals | Sodium/tube `#ffd9a0`; far lamps `#9fd6ff` mix | Gives depth cues in fog |
| Anamorphic streak | Cool teal/blue `#55CCA2` → `#6bb6ff` | Brand mint ties it to the site |
| Board | As v2: housing `#0c0c0e`, glyph ivory `#f1e9d2`, amber `#ffb000`, accent = theme token |

### 3.4 Lens and camera language
- **Start:** 32° vertical FOV (≈ 40 mm-equivalent look), eye height ≈ 1.55 m, face-on to the coach side. Static, slightly handheld.
- **Move:** dolly back + jib up + tilt up; FOV widens 32° → 36° (gentle, not a dolly-zoom).
- **Rack focus:** shallow DOF at start (window sharp, foreground man slightly soft) → focus pulls to the woman → to the coach wall during the pull-back → to the board at arrival.
- **Handheld decay:** micro-shake amplitude drops with height (jib stabilises).
- **Frame:** consider 2.39:1 letterbox only if it does not crush the board; default off.

### 3.5 Staging (the shot, spatially)
Origin `(0,0,0)` = platform surface at the coach's window axis. **+x right, +y up, +z toward camera.** Units = metres. All values below are **starting values to be tuned by eye.**

```
 TOP VIEW (y down the page = +z toward camera)            

      z=-6   [ BOARD 14×7 m, centre y=14 ]  (far, in the hall)
      z=-2.4 [ compartment backdrop glow plane ]
      z=-0.7   woman (inside, seated, faces −x)
      z= 0.0 ══ coach side wall / window plane (bars z=+0.04, glass z=+0.02) ══
      z=+0.8   man (outside, on platform, profile, faces +x)
      z=+1.2   rail-side spill pool on platform begins
      z=+5.6   camera (F1)
```
- **Window:** centre `(0, 1.7)`, opening ≈ 1.0 × 0.75 m (approximate; tune by eye), 7 horizontal iron bars (r = 0.009 m, pitch ≈ 0.1 m), shutter partially raised.
- **Man:** height 1.75 m, head centre y ≈ 1.65, x ≈ −0.95, three-quarter profile facing the window.
- **Woman:** seated; head centre y ≈ 1.6, x ≈ +0.15, profile facing −x (toward him). **Their sightline crosses the bars.** This crossing is the composition's emotional centre.
- **Board:** 14 × 7 m (cells ≈ 0.64 × 0.88 m), centre `(0, 14, −6)`, hung from rafters at y ≈ 21 by four rods.

---

## 4. Shot list and master timeline (hero scroll span: 340vh desktop / 280vh mobile)

| Range `p` | Shot | Camera | Story | Key events |
|---|---|---|---|---|
| **Load (time)** | **S0 Fade-in** | Hold at F1 | Black → the window glows on (a fluorescent flicker, 1.2 s) | Interior light stutters on; drizzle fades in; silhouette idle begins |
| **0.00–0.14** | **S1 The Window** | Subtle push-in 5.6 → 5.0 m | The two figures, stillness with life | Rack focus man → woman at ~0.10; scroll cue visible |
| **0.14–0.45** | **S2 The Pull-back** | Dolly back, jib up 1.55 → 3.6 m; slight yaw +8° | The window shrinks into the coach; train extends both ways; wet platform reflects the glow | Fog thickens with distance; far lamps appear; ambient crowd silhouettes |
| **0.35–0.85** | **(Optional) Departure** | — | Coach slides left (parallax) as the train pulls away, **leaving the man alone on the platform** | Scroll-reversible; flag `departure` (default on) |
| **0.45–0.80** | **S3 The Rise** | Crane up to 6.5 m + tilt up to ~16°; FOV 34° → 36° | Rafters, fans, lamp strings and shafts sweep overhead; the board enters from the top | God-ray cards brighten; exposure +0.3 |
| **0.80–0.92** | **S4 Arrival** | Settle (damped) | Board sharp, silhouettes tiny below | **Board ripple triggers at p ≥ 0.82** (idempotent, §7.6); rack focus to the board |
| **0.92–1.00** | **S5 Hand-off** | Hold | Board becomes the sticky "title card"; gradient mask; DOM content rises | Docked ticker armed; content stagger-in |

Single GSAP ScrollTrigger (`scrub: 0.8`) writes `progressRef`. Every curve in §6.2 is keyed to `p` in one config file, `guideRail.ts`.

---

## 5. Environment specification

### 5.1 Layered diorama strategy
Real geometry only where parallax sells it (coach, window assembly, platform, rafters/trusses, pillars). Everything else is **layered cards in fog**: far hall, station mouth, secondary trains, shaft cards, crowd silhouettes. Total draw-call budget in §10.

### 5.2 The coach (hero + two neighbours)
**Geometry (low-poly, high-detail surface):**
- Body profile as a curved-roof `ExtrudeGeometry` along the coach length; the hero coach's side wall built from **panels around the window opening** (or an extruded `Shape` with a window hole) so the cutout is real, not a see-through plane.
- Roof curvature, rain gutter, door with handrails and vestibule step, window shutters, ventilator louvres, number/stencil panels (fictional), underframe and bogies (dark, partially fog-hidden), couplers and buffers at the ends.
- Neighbour coaches are **instanced** copies with different grime seeds; train length vanishes into fog both ways.

**Materials (`MeshStandardMaterial`):**
- Body: `#1A242F`, roughness 0.7, metalness 0.35, **normal map** (panel seams, rivets), **grime/AO map** (vertical rain streaks, rust at seams and window frames), **decal layer** for cream band and stencil text.
- Wet look: roughness lowered by a mask in rain-streak areas (0.7 → 0.35) so window light slides along the metal.
- Edge highlights come from the cool rim light, not bevel geometry.

**Window assembly (z-ordered, back to front):**
1. Compartment backdrop: emissive gradient plane (warm centre → amber → deep red edge), **vignetted**, z = −2.4
2. Interior set: seat-back silhouettes, luggage rack, ceiling tube light (emissive HDR), fan blades (slow)
3. **Woman** silhouette plane (z = −0.7)
4. **Curtain** (vertex-wave cloth, 8×12 segments), partly drawn, warm rim; breeze-driven
5. **Glass** (z = +0.02): additive reflection card (platform lamp streaks, faint rain beads); *no* transmission material
6. **Bars** (z = +0.04): 7 instanced cylinders, dark, bright specular where they cross the glow
7. Window frame/shutter (opaque)
8. **Man** silhouette plane (z = +0.8, outside)

### 5.3 The silhouettes (billboard rig)

**Asset requirements**
- Two figures, **original artwork** (commissioned or club-made vector illustration; see §9). Era-neutral, generic clothing; shapes must read instantly in pure black.
- Each figure has **two idle poses** (A/B) differing slightly (head tilt, weight shift, hand position).
- Delivered as SVG → baked to **single-channel SDF PNGs** (≈ 512 px on the long edge, `NoColorSpace`/linear, mipmaps). Optional vector fallback via `SVGLoader → ShapeGeometry`.

**Material (custom unlit shader; sketch)**
```glsl
// fragment — unlit, SDF-based, crisp at any zoom, with backlight halation
float d    = mix(texture2D(uSdfA, vUv).r, texture2D(uSdfB, vUv).r, uPose); // pose crossfade
float aa   = fwidth(d);
float body = smoothstep(0.5 - aa, 0.5 + aa, d);                  // silhouette mask
float halo = smoothstep(0.5 - uHaloWidth, 0.5, d) * (1.0 - body); // bleed outside the edge
vec3  col  = uInk * body + uRim * halo * uRimStrength;           // near-black ink + warm wrap
gl_FragColor = vec4(col, max(body, halo * uRimStrength));
```
- `transparent: true`, `depthWrite: false`, explicit `renderOrder`; `fog: false` for the woman (interior), `fog: true` for the man (outside, mist should soften him slightly).
- Add 1–2 px of animated film noise to the ink so it is not a dead-flat vector.

**Life at rest (all subtle, none loops visibly):**
- Woman: pose crossfade A↔B every 6–9 s over 0.5 s (a glance down, a glance up).
- Man: ±0.5° sway about the feet, 2 px breathing bob, one slow weight shift every ~10 s.
- Parallax: planes at distinct depths move relative to each other as the camera shifts.

### 5.4 Lighting rig (physically based units)

| Light | Type / settings | Purpose |
|---|---|---|
| **Compartment practical** | Emissive tube strips (HDR 6–10) + `PointLight #FFB84D`, **≈ 80 cd, `decay 2`, no shadows**, at `(0.3, 2.3, −1.5)` | Backdrop glow; lights seat edges, curtain, bars |
| **Window spill** | `SpotLight #FFB35C`, ≈ 120 cd, angle 0.7, penumbra 0.8, from `(0, 1.8, −1.2)` toward +z/down. **High tier:** `castShadow` with `.map` = bars gobo (NB: three disables `.map` unless `castShadow` is true; use a 1024 shadow map). **Medium/Low:** additive decal quad with the same stripe pattern. | Striped warm pool on the wet platform, a hallmark shot |
| **Cool ambient** | `HemisphereLight` sky `#6b8cae`, ground `#0a0f14`, 0.35 | Blue shadow fill |
| **Moon/sky rim** | `DirectionalLight #7aa7d6`, 0.8, from upper-back-left, no shadows | Coach roof and edge highlights |
| **Station practicals** | Emissive lamp bulbs + additive cone cards along rafters and platform | Depth cues; shafts |
| **Board lights** | Two warm up-lights + one cool rim (all `fog:false` scene-wide for board) and glyph `emissiveIntensity ≈ 0.15` | Guarantees legibility at distance |
| **Environment** | drei `<Environment>` with custom `<Lightformer>`s: blue sky dome, warm window panel, floor bounce | PBR reflections on metal and wet ground |

**Volumetric effect (cheap):** additive, gradient-faded **cone meshes** with noise-scrolled alpha out of the window and rafters; plus post **GodRays** (high tier) keyed to the window and the station mouth.

**Drizzle:** ~500 instanced thin line streaks falling at ≈ 6 m/s, **visible only inside light cones** (alpha multiplied by a cone mask). Density 0.35 default; 0 on reduced-motion/Low.

### 5.5 Station hall and atmosphere
- **Shell:** Egmore-*inspired* (non-literal): riveted steel trusses (arched and pitched), cast-iron columns with ornamental brackets, a few brick arches in the far wall, clerestory gaps. Fictional signage: "SANGAM JUNCTION" (Tamil sign text requires native review). No real railway logos.
- **Rafters (S3 hero):** repeated trusses (instanced) every 6 m, hanging fans (blades with radial blur), tube-light rows, dust in shafts.
- **Platform:** concrete with a **wet mask** (rain-damp, puddles), tactile edge strip, yellow safety line, a bench, a luggage trolley, a chai stall glow far away.
- **Far field:** 2–3 fog-tinted cards (platform continuation, second train with lit windows, station mouth glow), **ambient crowd**: 8–12 tiny instanced walking silhouettes (scale cues for "massive").
- **Fog math** (three: `factor = 1 − exp(−(ρ·d)²)`):

| Distance | ρ = 0.030 (directive) | ρ = 0.020 | ρ = 0.016 |
|---|---|---|---|
| 10 m | 8% | 4% | 3% |
| 20 m | 30% | 15% | 10% |
| 23 m (board @F6) | 38% | 20% | 13% |
| 30 m | 56% | 31% | 21% |
| 45 m | 84% | 55% | 40% |

  **Decision:** global `FogExp2('#0A0F14', 0.018)`, plus: board `fog:false`; **height fog** (denser near the floor via a shader chunk or low fog cards); **luminous haze** behind the board (large soft emissive gradient plane through the roof opening) so the dark board silhouettes against light; **fog-colour grading** (teal in distance).
- **Wet platform reflections:** High tier uses drei `MeshReflectorMaterial` limited to the platform strip (resolution 512, blur ~[300,100], mix ~0.6). Medium: mirrored emissive decals of window/lamps with a blur gradient. Low: none.

### 5.6 Approval frames (must pass before any motion work)
| Frame | `p` | What it must show |
|---|---|---|
| **F1** | 0.00 | Window glowing, both silhouettes crisp, bars crossing their sightline, bokeh'd rain, bloom on the glow, no board in frame |
| **F2** | 0.14 | Slight push-in, focus on the woman, curtain flutter mid-frame, wet spill beginning to show |
| **F3** | 0.30 | Coach wall filling the lower frame, window as a warm jewel, platform reflection visible |
| **F4** | 0.50 | Wide: coach(es) + platform + fog depth, secondary train, crowd silhouettes, **no board yet** |
| **F5** | 0.70 | Rafters and fans overhead, shafts, **bottom edge of the board entering** |
| **F6** | 0.90 | Board centred (slightly high), sharp and legible, silhouettes tiny below, luminous haze behind |

---

## 6. Camera system, board placement, integration

### 6.1 Camera rig architecture
`<CinematicCameraRig>` reads `progressRef` and evaluates **rails** each frame:
```ts
// guideRail.ts — all curves keyed to p ∈ [0,1]
position:  CatmullRomCurve3(points, /*closed*/ false, 'centripetal')
lookAt:    CatmullRomCurve3(targets)
fov:       keyframes(p → deg)       roll: keyframes(p → deg)
focusTarget: CatmullRomCurve3 (world point for DOF)
exposure / bloom / drizzle / fogDensity: keyframes
```
Following is **critically damped** (`maath` `damp3`, λ ≈ 6) so camera never snaps to scroll notches; `scrub: 0.8` and Lenis add smoothing at the input. `gsap.ticker.lagSmoothing(0)`; wire Lenis → ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add(t => lenis.raf(t*1000))`). R3F keeps its own render loop; the rig only *reads* progress refs. No GSAP tweening of `camera.position` directly.

Handheld: low-frequency simplex noise (≈ 0.3 Hz drift, 3 Hz tremor) with amplitude `A(p) = 0.012 → 0.002 m` and roll ±0.25° falling to ±0.05°.

### 6.2 Starting rail values (verify visually; table doubles as a geometry check)
| p | Position | Look-at | vFOV | Focus point | Tilt (up) | Board visible? |
|---|---|---|---|---|---|---|
| 0.00 | (0.2, 1.55, 5.6) | (−0.25, 1.7, 0) | 32° | man↔window mid (z 0.4) | ~1.5° | No (bottom edge ≈ 37.6° above axis; frame top ≈ 16°) |
| 0.14 | (0.1, 1.6, 5.0) | (−0.2, 1.7, 0) | 31° | woman (z −0.7) | ~1.1° | No |
| 0.45 | (3.0, 3.6, 12.5) | (0, 3.2, 0) | 34° | coach wall (z 0) | ~−2° | No (bottom edge ≈ 20.5° vs frame top ≈ 15°) |
| 0.65 | (1.5, 5.2, 15.0) | (0, 8.5, −3) | 35° | rafters mid | ~10° | Entering |
| 0.80 | (0, 6.5, 17.0) | (0, 12.0, −6) | 36° | board (z −6) | ~13.5° | Yes |
| 0.90–1.00 | (0, 6.8, 17.5) | (0, 13.0, −6) | 36° | board | ~14.3° | Centred slightly high |

Framing solver (**aspect-aware**, used at `p = 0`): `d = (W / f / 2) / (tan(vFOV/2) · aspect)`, with key-subject width `W = 3.2 m` and target fill `f = 0.62`. Desktop (aspect 1.6, 32°) ⇒ ≈ 5.6 m. **Mobile portrait** (aspect ≈ 0.46): stage the man closer (x = −0.7, `W ≈ 2.1`), vFOV 40° ⇒ `d ≈ 9.5 m`; reduce side scenery; shorten hero to 280vh.

Yaw limit while the window is in view: ±12° so the flat planes never reveal their thinness.

### 6.3 Exposure and effect curves (starting)
| p | Exposure | Bloom intensity | Drizzle | GodRays | Notes |
|---|---|---|---|---|---|
| 0 | 1.00 | 0.9 | 0.35 | 0.2 | Window blooms; keep silhouettes crisp |
| 0.45 | 1.10 | 0.7 | 0.30 | 0.3 | Wider shot, lamps bloom |
| 0.80 | 1.30 | 0.45 | 0.20 | 0.6 | Lift board, shafts strong |
| 1.00 | 1.25 | 0.35 | 0.15 | 0.4 | Legibility first |

### 6.4 Board integration contract (do not break the engine)
- Wrap the existing board in `<group name="BoardRoot" position={[0,14,-6]} scale={…}>`. **Only the wrapper transform changes.** No edits to InstancedMesh creation, glyph atlas, FlapEngine, or layout engine.
- Scale the root so **cell height ≈ 0.88 m, 22 × 8 grid ⇒ 14 × 7 m**. Verify hinge-gap AA still holds at the new on-screen size; adjust only *render-side* parameters (gap width uniform) if the lab page shows shimmer.
- Set `fog = false` on all board materials (including housing and rods).
- Re-verify raycast row-click after the move (`InstancedMesh.raycast` uses `matrixWorld`; world-space hit tests must still resolve rows).
- Add a **hanging structure**: four rods to the rafters, cross-bracing, small enamel plate, sway ±0.3°.
- Regression test: the existing `/guide/lab` page (or equivalent) must pass unchanged; flap-timing unit tests untouched.

### 6.5 Interaction with v2 features
| v2 feature | v3 behaviour |
|---|---|
| Bridge (accordion ⇄ board ⇄ search ⇄ hash) | **Unchanged.** If the hero is not at S4/S5 when a selection happens, the board updates **silently in place** (cells swap without a visible cascade) and cascades when it enters frame; never auto-scrolls the camera. |
| Docked ticker | Unchanged (appears at p ≥ 0.92 and whenever the hero is off-screen) |
| Idle life (clock, churn, carousel) | Active only from S4 onward (board off-frame earlier) |
| "Passing under" beat (v2 §5.7) | **Removed**; replaced by S3–S5 |

---

## 7. Dynamic "Most Asked" board system

### 7.1 Behaviour
At F6/S4 the board cascades into the **#1 most-asked FAQ**, in **detail state**: status cell `MOST ASKED`, headline (≤ 3 rows), summary (≤ 3 rows), footer `CATEGORY · PF 0x`. After 12 s idle it moves to the v2 carousel (starting at #2) or the departure list sorted by popularity (#1 marked `BOARDING`). User actions override immediately.

### 7.2 What counts as an engagement
Counted: accordion opened by user; board row selected by user; search result selected with Enter/click. **Not counted:** `hash` deep-link opens, carousel, programmatic opens, repeat opens by the same visitor within 24 h.

### 7.3 Data and API (use the project's existing datastore if any; otherwise Upstash Redis / Vercel KV or Supabase)
- `POST /api/faq/engage` `{ faqId, kind: 'open' | 'board' | 'search' }` → `204`. Fire with `navigator.sendBeacon` / `fetch keepalive`.
- `GET /api/faq/popular` → `{ ranked: [{ id, rank }], generatedAt }` (no public raw counts).
- Storage: per-day hash `faq:clicks:{YYYY-MM-DD}` → `HINCRBY faqId 1`, TTL 35 days.
- **Ranking:** `score(faq) = Σ_d count_d × 0.5^((today − d)/7)` over the last 28 days. Ties break by editorial order.
- **Cold start:** if total weighted engagement < 15, use the **pinned editorial FAQ** (`featured: true`), defaulting to "How do I join?". Never show an empty or error state.
- **Caching:** compute in a server function; cache ≈ 5 min with the project's Next 16 caching mechanism (check current docs: `'use cache'`/`cacheLife` or segment `revalidate`). The page server component passes `popularFaqId` and the ranked list to the hero as props, so the **poster and first frame already contain the right text** (no loading flash).

### 7.4 Abuse and privacy
- Dedupe key: `dedupe:{day}:{visitorHash}:{faqId}` (TTL 24 h) with `visitorHash = truncate(HMAC(dailySalt, ip + userAgent))`. **No raw IP stored, no cookies, no third-party analytics.**
- Rate limit: 30 engagements/min per visitorHash; drop obvious bots (UA list, missing `Accept-Language`).
- Admin tools: pin override via env var / config; protected reset endpoint (secret header).
- State on the site's privacy page: anonymous aggregate counters.

### 7.5 Content requirements
Each FAQ needs `boardHeadlineEn/Ta` (≤ 40 chars) and `boardSummaryEn/Ta` (≤ 120 chars) as in v2 §4.5. Build fails if the top-N FAQs cannot fit 14 × 10 (mobile). **Never display the raw question string**; always the board-fit headline. All Tamil strings flagged for native review.

### 7.6 Trigger logic (robust to deep links, refresh, and scroll-back)
Drive from **state, not events**: `if (progress ≥ 0.82 && !revealed) → reveal()`. `reveal()` is idempotent, runs the cascade once, and sets `revealed = true`. Landing mid-page (scroll restoration, hash link) sets `revealed` immediately after the first frame at that `p` and plays the cascade once if the board is in view. Scrolling back up never "un-flips" the board.

---

## 8. Performance, fallbacks, QA tooling

### 8.1 Budgets and tiers
| Tier | Settings |
|---|---|
| **High** | DPR ≤ 1.75; DOF; GodRays; reflector platform; spot gobo with shadow; 500 drizzle; 3 coaches; 12 crowd; full bloom/anamorphic |
| **Medium** | DPR ≤ 1.5; no DOF; no reflector (mirrored decals); additive stripe decal instead of spot-gobo; 250 drizzle; 3 coaches; 8 crowd |
| **Low** | DPR 1.0; bloom-only; no reflections; baked spill decal; drizzle 0; 1 coach + fog cards; 4 crowd |
| **Fallback** | No WebGL2 / reduced-motion / very low power: **static poster** of F1 with CSS parallax layers (backdrop, silhouettes, window frame, drizzle overlay), then the CSS split-flap board (v2 fallback) showing the popular FAQ; no crane |

- Draw calls ≤ 110, triangles ≤ 350k, textures ≤ 20 MB (SDFs, one metal-wear atlas, one grime atlas, one concrete, KTX2 where possible). Instancing for coaches, bars, rivets, trusses, fans, crowd, rain.
- Lazy-load via `next/dynamic({ ssr:false })`; preload on nav-hover; pause rendering when hidden/offscreen; dispose on unmount; guard Strict Mode double-mount.
- **Load order:** poster → window-assembly assets (priority) → rest of station (can pop in behind fog as the camera pulls back) → board atlas.

### 8.2 Debug toggles (`?debug=…`)
`fps`, `tier=…`, `p=0.62` (freeze at a progress), `rail` (draw rails + frustum), `sil` (show silhouette planes' bounds), `fogoff`, `unlit`, `info` (renderer.info + shader errors), `slowmo`, `departure=0|1`, `drizzle=0..1`, `lights` (helpers). A **scrub slider** in the lab page makes `p` manual.

### 8.3 Automated checks (Playwright + pixel probes)
- Screenshots F1–F6 at 1440×900 and 390×844, per tier.
- **Silhouette contrast probe (F1):** sample the pixels inside each silhouette mask vs a 12 px ring outside it; assert inner median luminance < 0.04 and ring median > 0.45.
- **Board legibility probe (F6):** measure a row's cell height in pixels (≥ 40) and glyph-to-flap contrast (≥ 7:1).
- **Fog probe:** the board's average colour must be within 15% of its un-fogged render (proves `fog:false` works).
- **Camera continuity test:** sample `p` at 200 steps, assert positional speed and look-at angular speed are continuous (no discontinuity > threshold).
- **Frame-time test** across the scrub with the board cascading at p = 0.82 (≥ 55 fps High).

---

## 9. Accessibility, legal, and content guidance

### 9.1 Accessibility
- Canvas is `aria-hidden`; the real content is the FAQ DOM. A visually hidden `aria-live="polite"` region announces "Most asked: …" once.
- **Skip intro** button (keyboard-focusable, visible on focus, also visible after 2 s of dwell) jumps to p ≈ 0.92 via `lenis.scrollTo`. Do not trap scroll.
- `prefers-reduced-motion`: Fallback tier (no crane, no drizzle, no cascades, instant board text swap).
- No flashing > 3 Hz. The S0 flicker is ≤ 2 flashes over ≥ 1 s at low contrast delta; provide a **no-flicker** mode when reduced motion is on.
- Overlay text contrast ≥ 4.5:1; safe zones for nav and "Ask Nanba."

### 9.2 Asset and IP guidance (not legal advice)
- The silhouettes must be **original, generic artwork**. Do **not** trace, rotoscope, or reference stills/frames from the film; do **not** use film audio, music, stills, titles, or logos; do **not** make the figures recognisable as specific actors.
- Keep file names, alt text, component names, and metadata **generic** (`silhouette-man`, `silhouette-woman`), not actor or character names.
- The scene should work for any viewer as "a man at a train window and a woman inside"; viewers who know the film will bring the association themselves.
- Station signage and livery are fictional; no Indian Railways or zone logos.
- Record artwork authorship and license in `docs/assets-licenses.md`. If the club plans wide promotion, consider a quick review by campus counsel.

### 9.3 Tamil
All Tamil copy (board, sign text, labels) is flagged `// TODO: native review`. Cells use grapheme-cluster handling per v2 §5.2.4.

---

## 10. Scene budget summary
| Group | Approx. draw calls | Notes |
|---|---|---|
| Coach hero + body details | 10–14 | Panels, roof, bogies, door, handrails |
| Window assembly | 8–10 | Backdrop, seats, 2 silhouettes, curtain, glass, bars (instanced), frame |
| Neighbour coaches | 2–4 | Instanced |
| Platform + wet strip + props | 6–8 | |
| Hall shell + trusses + fans + lamps | 14–20 | Instanced repeats |
| Far field cards + crowd | 6–8 | |
| Volumetric cones + drizzle + dust | 6–8 | |
| Board (existing) | 4–6 | Unchanged |
| Post-processing passes | 6–10 | Tier-dependent |
| **Total** | **≈ 70–100** | Target ≤ 110 |

---

## 11. Delivery plan and gates

| Phase | Deliverable | **Gate (approval artifact)** |
|---|---|---|
| **0. Preflight** | Verify board engine unchanged on `/guide/lab`; install/pin deps (`npm i` only); create `guideRail.ts` skeleton, `BoardRoot` wrapper (board moved to `(0,14,-6)`, `fog:false`), debug toggles, poster plumbing | Board regression green; `?debug=p=0.9` shows the board centred |
| **1. Environment** | Coach (shell, materials, decals), platform (wet), hall shell/rafters, fog + luminous haze, far field, post stack | **Stills F4 and F5** pass; scene-graph dump attached |
| **2. Window & silhouettes** | Window assembly stack, curtain, bars, SDF silhouettes + pose crossfade, compartment lighting, window spill, drizzle, cones | **Stills F1, F2, F3** pass; **silhouette contrast probe green**; scene graph for window/silhouettes/lights shown |
| **3. Camera rails** | Rail curves, damping, Lenis+ScrollTrigger, framing solver, focus/exposure curves, departure beat, handheld decay | **Scrubbed capture video** at 4 speeds shows no stutter; camera continuity test green; **F6** passes |
| **4. Popular-FAQ system** | Endpoints, storage, ranking, caching, SSR prop, board reveal logic, cold-start | Integration tests green; privacy review; board shows server value in poster and F6 |
| **5. Life, perf, a11y, mobile** | Idle animations, tiers, fallback tier, reduced motion, skip control, mobile framing | All metrics met; Lighthouse a11y ≥ 95; Playwright suite green on Chrome/Safari/Firefox + Android |
| **6. Optional** | Opt-in audio (muted default), Ask Nanba answers on board, share-card export | Review |

**Rule:** do not start Phase 3 until Phase 2 stills are approved by a human. (The directive's original instruction to withhold the GSAP sweep until lighting is approved is kept, but the approval artifact is the **stills**, not the scene graph.)

---

## 12. QA checklist

**Per approval frame:**
- [ ] Silhouettes read instantly as a man and a woman, with clean edges and a subtle warm halo; no pixelation, fringing, or white halos.
- [ ] Bars cross their sightline; bars catch window light.
- [ ] The window is the brightest thing in F1–F3; everything else supports it.
- [ ] Teal–orange separation is clear; shadows are blue, not black.
- [ ] ≥ 4 depth layers with atmospheric fade; the station feels vast at F4–F5.
- [ ] Wet reflections show the window glow; spill has bar stripes.
- [ ] Board never looks washed by fog; it silhouettes against luminous haze.
- [ ] No hard-edged planes, visible card borders, or low-poly faceting on curved surfaces (coach roof, fans).

**Motion:**
- [ ] No stutter on notched wheels or trackpad flicks; reverse scroll is exact.
- [ ] Rack focus is smooth and purposeful (man → woman → wall → board).
- [ ] Silhouette planes never show their thinness (yaw limit works).
- [ ] The departure beat is scroll-reversible and never desyncs from the camera.

**Function:**
- [ ] Board shows the server-ranked #1 headline on first reveal, in EN and TA.
- [ ] Deep link, refresh mid-scroll, and back-forward restore all produce the right state.
- [ ] Selecting an FAQ before the board is in frame updates silently, then cascades on arrival.
- [ ] Engagement counting dedupes, rate-limits, and ignores carousel/hash.
- [ ] Reduced-motion and no-WebGL paths are complete and usable.

**Definition of done:** All gates pass; metrics met; QA green; `docs/guide-hero-v3.md` documents rails, light units, fog decisions, content authoring rules, and the analytics design.

---

## 13. Risks and mitigations
| Risk | Mitigation |
|---|---|
| Silhouettes look like cut-out stickers | SDF edges + halation, depth layering with bars/curtain/glass, film noise, pose crossfade, bloom |
| Board lost in fog/darkness again | `fog:false`, luminous haze, glyph emissive, legibility probe |
| Camera feels robotic | Rails + damping + handheld decay + rack focus |
| Scroll feels long | Skip control; 340vh with a strong first 14% hold; autoplay not required |
| GPU cost with reflections/DOF | Tiers; instancing; reflector limited to a strip |
| Layered cards show seams during the crane | Overlap and feather; keep camera within validated rail; test at F4–F5 |
| Popular FAQ gaming or privacy concerns | Dedupe + rate limit + hashed visitor ids + no cookies; editorial pin override |
| Legal/IP | §9.2 |
| Artwork delay | Placeholder generic silhouettes (public-domain shapes) ship first, swap by file replacement only |
| Agent drifts | Phase gates with human-approved stills; Part B protocol |

## 14. Open questions
1. "Front view" is interpreted as **face-on to the coach side window** (not head-on to the locomotive). Confirm.
2. Is a pre-dawn blue-hour mood final, or should it be dusk? (Grade/exposure curves change; staging doesn't.)
3. Who creates the original silhouette art, and by when? (Placeholders until then.)
4. What datastore does the repo already use (for §7.3)?
5. Keep the optional **Departure** beat (train pulls away leaving the man alone)? Default: on.
6. Fictional station name approved ("Sangam Junction")?
7. Who reviews Tamil text?

---

# PART B — PASTE-READY AGENT DIRECTIVE (replaces the original)

```
# MISSION: GUIDE HERO v3 — "THE STATION SEQUENCE"
Stack: Next.js 16, React 19, R3F v9, drei, @react-three/postprocessing, GSAP ScrollTrigger, Lenis, Zustand.
Package manager: npm ONLY. No yarn/pnpm files. Pin versions compatible with three@0.186.
Spec: docs/guide-hero-v3-station-sequence-prd.md (authoritative). Read Part A fully before coding.

HARD CONSTRAINTS
1. Do NOT modify the split-flap board's InstancedMesh code, glyph atlas, FlapEngine, or layout engine.
   You may only wrap it in <BoardRoot position={[0,14,-6]}> and set material.fog=false.
2. No film footage/stills/audio/logos; no actor or character names anywhere in code, filenames, alt text.
   Silhouette art is original and generic. Use placeholder generic shapes until final art is supplied.
3. Native scroll only (no scroll-jacking). Camera is driven by progressRef, never by tweening camera.position directly.
4. Lights use physically based units (three r155+). Silhouettes are UNLIT SDF shader planes; the "silhouette" effect
   comes from a bright emissive backdrop, not from the PointLight.
5. Do NOT use FogExp2 density 0.03. Use ~0.018, board fog=false, luminous haze behind the board.

WORK IN PHASES. STOP AT EACH GATE AND WAIT FOR HUMAN APPROVAL.
Phase 0  Preflight: board regression on /guide/lab, deps, guideRail.ts skeleton, BoardRoot, ?debug toggles.
Phase 1  Environment: coach, wet platform, hall/rafters, fog+haze, far field, post. DELIVER stills F4 + F5 + scene-graph dump.
Phase 2  Window & silhouettes: window assembly stack, SDF silhouette planes (+pose crossfade), compartment lighting,
         window spill, drizzle, cones. DELIVER stills F1 + F2 + F3, the R3F scene graph for window/silhouettes/lights,
         and the silhouette-contrast probe result. DO NOT WRITE THE CAMERA SWEEP YET.
Phase 3  Camera rails (CatmullRom position + look-at + FOV/focus/exposure curves), damping, Lenis+ScrollTrigger (scrub 0.8),
         framing solver, departure beat. DELIVER still F6 + scrub capture + continuity test.
Phase 4  Most-asked FAQ system (API, storage, ranking, caching, SSR prop, idempotent reveal at p>=0.82).
Phase 5  Idle life, tiers, fallback, reduced-motion, mobile framing, a11y, Playwright suite.

EVERY PHASE MUST: (a) run the app, (b) capture Playwright screenshots, (c) critique them against PRD §12,
(d) commit, (e) report what you saw, including what looks wrong, before asking to proceed.

FIRST REPLY: acknowledge constraints, list questions from PRD §14 you cannot answer from the repo, and propose
the Phase 0 plan. Then execute Phase 0 only.
```

---

# PART C — TERRA EXECUTION PLAN FOR THIS REPOSITORY

## 15. Purpose and authority

This section is the operating plan for a Terra implementation pass. It does not replace Part A. Use this authority order whenever instructions appear to conflict:

1. `AGENTS.md` and `src/components/AGENTS.md`.
2. `docs/redesign/REDESIGN-BRIEF.md`, `DESIGN.md`, `design/tokens.json`, and `src/app/globals.css`.
3. Part A of this PRD.
4. The current repository architecture and tested public contracts.
5. The current phase packet.
6. Part B only where it remains consistent with items 1–5.

Terra must surface a conflict rather than silently choosing one side. The goal is a staged, evidence-backed implementation, not a one-shot generation.

## 16. Repository reconciliation snapshot (2026-10-05)

Terra must verify this snapshot in Phase 0 because it can drift.

| Area | Current repository fact | Consequence for v3 |
|---|---|---|
| Rendering | `GlobalCanvas` is a single persistent R3F canvas using Drei `View.Port` and `frameloop="never"`. | Add the station as a `View`. Never mount a second `Canvas`. |
| Clock | `MotionProvider` drives Lenis, ScrollTrigger, the master ticker, and R3F `advance()`. | Register station/camera systems with the master tick. No independent RAF and no second Lenis instance. |
| Guide scene | `GuideHero` lazy-loads `BoardView`; `BoardView` already mounts inside a Drei `View`. | Evolve this boundary. Preserve lazy loading and the DOM fallback/poster path. |
| Board composition | Current `Board.tsx` includes `GuideEnvironment`, `CameraFitter`, and its own scroll-recede behavior. | Do not mount it wholesale inside the station scene. Extract or add a thin `BoardRoot` composition that reuses the existing chassis and flap cells while the station owns environment and camera. |
| Board engine | Atlas, layout, FSM, material, geometry, audio, chassis, cells, and Zustand integration already exist under `src/components/guide-hero/board`. | Preserve behavior and tests. No rewrite of the InstancedMesh, glyph atlas, flap kinematics, layout, or store contract. |
| Global grading | `GradeStack` is mounted at the persistent canvas level. | Spike view-scoped post effects before adding an EffectComposer. Do not create a competing global composer by assumption. |
| Quality tiers | `TierProvider` already supplies A/B/C and disables WebGL for C; `LiteModeProvider` also exists. | Reconcile these existing controls; do not create a third tier system. Tier C is the no-WebGL fallback. |
| Dependencies | Next 16.3.5, React 19.2.8, R3F 9.7.0, drei 10.7.8, Three 0.186.0, GSAP 3.15.0, Lenis 1.3.26, Zustand 5.0.15. `npm ls three` currently resolves one deduped Three version. | Core runtime packages are already present. Do not upgrade them during hero work without a separate approved change. |
| Tests | Board unit tests exist, but no Playwright config/specs were found. | Phase 0 must propose the smallest Playwright setup required by this PRD and record the dependency change before installing it. |
| Lab route | No `/guide/lab` route was found. | Phase 0 may add a deliberately isolated lab only after the audit and file plan are approved. |
| Data | FAQ content and board selection exist, but no approved engagement datastore is named by this PRD or package manifest. | Do not pick a vendor silently. Phase 4 is blocked on a human datastore/privacy decision; ranking logic can still be built and tested as a pure adapter. |
| Design tokens | The project requires W3C-style primitive, semantic, and component tiers using OKLCH. The PRD palette is written as art-direction hex values. | Translate approved palette values into tokens before component use. Do not scatter PRD hex literals through JSX. |
| Tamil review | `docs/redesign/tamil-review.md` is the cultural review ledger. | Any new Tamil wording must use `lang="ta"`, zero letter spacing, and be logged for native review without changing meaning. |

Two missing references require care:

- No Guide Hero v2 PRD is currently present in `docs`. Treat the existing implementation and tests as the recoverable v2 contract; do not invent missing requirements.
- The active global architecture document is `docs/global-architecture-prd-v2.md`, not a guessed path under `docs/redesign`.

## 17. Decisions that must be locked

Do not let every open decision block Phase 0. Lock each one before the phase that consumes it.

| Decision | Recommended default | Must be resolved before |
|---|---|---|
| Opening angle | Face-on to the coach side window | Phase 1 |
| Time of day | Blue-hour dusk with cool exterior and warm compartment practical | Phase 1 |
| Silhouette artwork | Original generic placeholder vectors first; approved final art swapped by file replacement | Phase 2 final gate |
| Departure beat | Enabled on Tier A desktop; disabled for reduced motion and available as a feature flag | Phase 3 |
| Station identity | Fictional “Sangam Junction”; no real railway marks | Phase 1 |
| Tamil reviewer | Named club/native reviewer; unreviewed strings visibly marked in the review ledger, not in production UI | Phase 2 |
| Analytics datastore | Use an existing approved project service if discovered; otherwise present Upstash/Vercel KV and Supabase trade-offs to the human | Phase 4 |
| Audio | Remain out of scope until optional Phase 6 | Phase 6 |

## 18. Terra operating protocol

### 18.1 One phase per context

Use a fresh Terra context for every implementation phase. Paste only:

1. the standing controller prompt in §20;
2. the phase packet;
3. the previous phase’s short checkpoint report;
4. any human approvals or decisions.

Do not paste raw terminal history or all prior conversations. The PRD and repository are the source of truth.

### 18.2 Inspect, propose, execute, prove

Every phase has four passes:

1. **Inspect:** read the named files and current Next.js documentation. No edits.
2. **Propose:** list exact files to add/change, contracts preserved, risks, and verification commands.
3. **Execute:** edit only the approved phase scope.
4. **Prove:** run checks, capture fixed frames, perform `/critique` then `/audit`, and write a checkpoint report.

Terra must stop after “Propose” when a phase introduces a new dependency, datastore, public API, destructive migration, or design decision not already approved.

### 18.3 Evidence, not confidence language

A phase report must contain:

- changed files and why;
- commands run with pass/fail status;
- screenshot paths and exact viewport/progress;
- measured draw calls, triangles, texture memory, and FPS where applicable;
- accessibility checks;
- disposal/unmount evidence;
- known defects and deferred work;
- an explicit gate result: `PASS`, `FAIL`, or `NEEDS HUMAN REVIEW`.

“Looks good,” “should work,” or compilation alone is not a gate.

### 18.4 Checkpoint artifacts

Use these locations:

~~~text
docs/guide-hero-v3/checkpoints/phase-00.md
docs/guide-hero-v3/checkpoints/phase-01.md
...
docs/screenshots/guide-v3/f1-1440x900.png
docs/screenshots/guide-v3/f1-390x844.png
...
~~~

Do not overwrite approved frames. Append a revision suffix such as `-r2`.

## 19. Phased execution map

### Phase 0 — Read-only audit and integration design

**Goal:** prove the plan fits the repository before changing runtime code.

Read completely:

- `AGENTS.md` and `src/components/AGENTS.md`;
- this PRD;
- `docs/redesign/REDESIGN-BRIEF.md`, `DESIGN.md`, `design/tokens.json`, `src/app/globals.css`;
- `docs/global-architecture-prd-v2.md`;
- `src/components/guide-hero/**`, `src/store/faqStore.ts`, `src/data/faq.ts`;
- `GlobalCanvas`, `MotionProvider`, `masterTick`, `governor`, tier and Lite providers;
- the relevant local Next 16 docs:
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`;
  - `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`;
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`;
  - `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` and `09-revalidating.md` before Phase 4.

Required output:

- current scene graph and ownership map;
- board contract map identifying protected and adaptable files;
- render-loop/scroll ownership map;
- proposed file tree;
- token additions in primitive → semantic → component order;
- risk register;
- baseline results for `npm ls three`, board unit tests, `npx tsc --noEmit`, lint, and production build;
- a Playwright setup proposal;
- the questions from §17 that cannot be discovered locally.

**Gate:** human approves the architecture and file plan. No runtime edits in the audit turn.

### Phase 0B — Regression harness and skeleton

Create only the approved lab/harness, rail configuration types, debug query parsing, poster slot, and board adapter skeleton. The adapter may reorganize composition but must leave flap engine behavior unchanged.

Key tests:

- existing board snapshots/kinematics remain green;
- `BoardRoot` can be positioned at `[0, 14, -6]`;
- board materials are excluded from scene fog without rewriting the flap shader;
- no second canvas, Lenis instance, GSAP ticker, or RAF loop appears;
- lab is excluded from indexing and production navigation.

**Gate:** baseline F6 board framing and board regression approved.

### Phase 1 — Token lock and static environment

First add approved OKLCH tokens. Then build only the static station beauty frames: coach shell, wet platform, hall, trusses, luminous haze, far cards, board backdrop, and restrained grading.

Use real geometry only where the crane shot needs parallax. Make the station scale readable with repeated structure and human-scale silhouettes. Avoid literal film recreation and real railway branding.

**Gate:** F4 and F5 at desktop and mobile; scene graph; calls/triangles/textures within the phase budget. No camera sweep yet.

### Phase 2 — Window, silhouettes, and lighting

Build the complete z-ordered window assembly. Generate or source only original generic silhouettes. Validate SDF edges under the closest camera distance before adding idle crossfades.

The silhouette is created by the emissive backdrop and controlled halation. The point light illuminates physical props only. Ensure bars cross the sightline and the man/woman remain at distinct depths.

**Gate:** F1–F3, automated luminance probe, mobile crop, no fringe/plane-edge artifacts, and native Tamil review entries for any new script.

### Phase 3 — Camera rail and reversible choreography

Implement `guideRail.ts` as data: position rail, look-at rail, FOV, roll, focus, exposure, departure offset, and handheld amplitude. Feed it from the existing master tick and one ScrollTrigger progress source. The render step reads damped targets; GSAP does not mutate camera position directly.

Test forward and reverse scrolling, notched wheel input, trackpad input, refresh at mid-scroll, back/forward navigation, resize, orientation change, and document visibility.

**Gate:** F1–F6 continuity, F6 board legibility, 4-speed scrub capture, no independent loop, and exact reverse behavior.

### Phase 4 — Popular FAQ contract and data adapter

Separate this into:

1. pure engagement event schema, dedupe/rate-limit policy, ranking function, and tests;
2. a storage interface;
3. one approved storage implementation;
4. server retrieval/caching and initial board payload;
5. idempotent reveal integration.

No client-generated popularity truth. No raw IP storage or invasive fingerprinting. Do not mutate production data during tests.

**Gate:** privacy approval, cold-start behavior, stale/failure fallback, zero layout shift, and integration tests.

### Phase 5 — Fallbacks, performance, accessibility, and hand-off

Implement:

- Tier A/B/C behavior using existing providers;
- poster and no-WebGL path;
- reduced-motion direct hand-off with no drizzle, shake, rack-focus animation, or long pin;
- mobile portrait framing and `100dvh`;
- 48×48 px controls and keyboard-visible skip;
- canvas `aria-hidden` plus semantic DOM title/FAQ content;
- paused rendering when off-screen/hidden;
- complete Three/GSAP/observer disposal.

Run `/critique`, then `/audit`, and only then `/polish`.

**Gate:** all Part A success criteria and §12 checklist items pass or are explicitly waived by the human.

### Phase 6 — Optional enhancements

Audio, “Ask Nanba” board answers, and share-card export remain separate proposals. They cannot delay the core definition of done.

## 20. Standing Terra controller prompt

Paste this at the beginning of each fresh Terra phase:

~~~text
You are implementing one approved phase of Guide Hero v3 in the OSU Tamil Sangam repository.

Authority:
1. Read AGENTS.md and src/components/AGENTS.md completely.
2. Read docs/guide-hero-v3-station-sequence-prd.md completely, especially Part C.
3. Read docs/redesign/REDESIGN-BRIEF.md, DESIGN.md, design/tokens.json, src/app/globals.css, and docs/global-architecture-prd-v2.md.
4. Before using a Next.js API, read the matching local documentation under node_modules/next/dist/docs.

Repository invariants:
- npm only.
- One persistent GlobalCanvas, one master tick, one Lenis instance, one ScrollTrigger integration.
- Use a Drei View for the guide scene; never add another Canvas.
- Preserve the split-flap InstancedMesh, atlas, geometry, kinematics/FSM, layout, store contract, and existing tests.
- The station owns camera and environment. Integrate the protected board engine through a thin BoardRoot adapter.
- Use existing TierProvider/LiteModeProvider. Do not create parallel tier systems.
- Translate approved colors through the repository’s OKLCH token architecture; no scattered art-direction hex values in JSX.
- No film assets, actor likenesses, real railway branding, stock imagery, generic icon packs, decorative emoji, or unreviewed Tamil.
- Native scroll remains native. All motion has reduced-motion and Lite behavior.
- Dispose Three.js resources, GSAP contexts/ScrollTriggers, observers, and subscriptions.
- Do not add dependencies, services, public APIs, or unrelated refactors without proposing them and stopping for approval.

Workflow:
A. Inspect the phase’s named files and report current facts.
B. Before edits, propose exact file changes, protected contracts, risks, and verification.
C. If the phase packet says audit-only or a decision is unresolved, stop.
D. Otherwise implement only the approved phase.
E. Run the required checks and capture named screenshots.
F. Critique hierarchy first, audit accessibility/performance second, polish last.
G. Write the phase checkpoint with evidence and stop at the gate.

Never claim success without command results, browser evidence, and measured metrics.
~~~

## 21. First Terra phase packet

Use this immediately after the standing prompt:

~~~text
PHASE: 0 — READ-ONLY AUDIT AND INTEGRATION DESIGN

Do not edit files, install packages, start a datastore, or commit.

Verify the repository reconciliation snapshot in Part C §16. Pay special attention to:
- the persistent GlobalCanvas/View.Port and masterTick ownership;
- every Canvas, View, useFrame, requestAnimationFrame, GSAP ticker, ScrollTrigger, and Lenis instance that could affect /guide;
- Board.tsx bundling GuideEnvironment, CameraFitter, and scroll recede;
- the protected split-flap engine’s public contracts and current tests;
- GradeStack/postprocessing compatibility with a View;
- TierProvider versus LiteModeProvider responsibilities;
- the absence or presence of /guide/lab, Playwright, a datastore, and a previous Guide v2 spec;
- design-token and Tamil-review requirements.

Run read-only baselines:
- git status --short
- npm ls three
- npx tsc --noEmit
- npm run lint
- npm run build
- the existing guide board/layout/FSM tests using their current runner

Return:
1. a concise architecture map;
2. exact protected files and allowed seams;
3. proposed v3 file tree;
4. token plan;
5. dependency/test-harness proposal;
6. risks ranked by severity;
7. unresolved decisions mapped to the phase they block;
8. baseline command results;
9. a Phase 0B implementation plan.

Stop and wait for human approval.
~~~

## 22. Phase packet template

For Phases 0B–6, give Terra a narrow packet using this format:

~~~text
PHASE:
APPROVED DECISIONS:
INPUT CHECKPOINT:
FILES TO READ:
FILES ALLOWED TO CHANGE:
FILES PROTECTED:
DELIVERABLES:
FIXED SCREENSHOTS:
AUTOMATED CHECKS:
PERFORMANCE BUDGET:
ACCESSIBILITY CHECKS:
STOP CONDITION:
~~~

Never tell Terra merely to “implement the PRD.” Narrow phase packets and hard stop conditions are what keep visual quality, architecture, and context fidelity intact.

## 23. Final acceptance sequence

Before calling v3 complete:

1. Re-run all board unit/regression tests.
2. Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
3. Run browser tests at 390×844, 768×1024, and 1440×900 in normal, reduced-motion, Tier B, Tier C/no-WebGL, and forced context-loss paths.
4. Capture F1–F6 at deterministic progress values.
5. Measure median FPS, p95 frame time, calls, triangles, textures, hero chunk, LCP, CLS, and FAQ freshness.
6. Test keyboard-only use, 200% zoom, screen-reader reading order/live announcements, skip control, and focus after hand-off.
7. Navigate away/back 20 times and confirm renderer memory returns to baseline.
8. Search shipped source/assets for prohibited film names, actor names, real railway marks, and unapproved media.
9. Obtain native review for every new Tamil string.
10. Perform the ordered gates: `/critique` → `/audit` → `/polish`.
11. Record any human waivers in the final checkpoint.
12. Commit only the approved phase scope with its evidence artifacts.

