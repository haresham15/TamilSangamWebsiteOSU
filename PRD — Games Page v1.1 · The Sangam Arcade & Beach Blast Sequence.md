# PRD — Games Page v1.1 · The Sangam Arcade & Beach Blast Sequence

Oct 26, 2026 · @Haresh

## Document control and what changed

v1.1 keeps every goal of v1 and corrects 15 defects, the largest being a camera that would have framed the beach at the wrong height; each fix is measured against your three reference frames.

| Field | Value |
| --- | --- |
| Version | 1.1, reference-calibrated (supersedes v1) |
| Project | OSU Tamil Sangam website: Next.js 16, React 19, R3F v9, Drei, @react-three/postprocessing, GSAP ScrollTrigger, Lenis, Zustand |
| Surface | /games, a new top-level route and navbar entry |
| Package manager | npm only; package-lock.json is an invariant |
| Reference frames | J1, J2, J3 stills, 1861×778 (2.39:1); used for calibration only and never shipped |
| Coordinates | u = 0 to 1 left to right, v = 0 to 1 top to bottom of the frame; meters in world space |
| Status | Ready for agent execution once the open decisions in the last section are answered |

### Defect log: v1 versus v1.1

| ID | What v1 said | Evidence | v1.1 change |
| --- | --- | --- | --- |
| D-01 | Camera looks level at (0, 1.8, −31) | Wall base projects to v=0.572 and top to 0.429; the reference shows 0.739 and 0.648, so the beach sits mid-frame instead of low | Lens shift puts the horizon at v=0.675 (−0.350 NDC); wall now projects to 0.741 and 0.643 |
| D-02 | Camera position, target and FOV change each beat (34°, 32°, 33°, 38°) | Fence piers and the lone palm sit at the same pixels in all three reference frames, so the shot is locked off | One locked camera from p=0 to 0.85; only sub-pixel drift and the blast shake |
| D-03 | Glasses lens centres at ±0.068 m, 1.35 m from the camera | Lens spacing renders 0.069 of frame width; the reference shows 0.153, so the prop is 2.2× too small | Real-size glasses (lens centres ±0.041 m) 0.36 m from the lens |
| D-04 | Fireball radii 4.2, 5.0 and 4.5 m | Reference blasts measure about 3.8, 5.1 and 2.3 m wide at 37 m; v1 sizes merge into one blob that swallows both lenses | Core radii 2.3, 3.0 and 1.9 m; smoke columns to 7.5 m |
| D-05 | Right fireball is dead-centre in the right lens | In the reference it sits at the nose-side edge of the right lens | Lens Registration Contract with numeric gates and a runnable check |
| D-06 | Upper-left missile hits the centre SUV | Fit to the measured reference contrail: mean error 0.008 frame-heights to the left SUV, 0.048 to the centre | M1 to left SUV, M2 to centre, M3 to right; trails authored as screen-space splines |
| D-07 | Camera dolly 6.0 to 4.4 m "through the fireball" | A 1.6 m move changes a fireball 37 m away by 4% in scale and cannot fill the viewport | Two rails: a macro foreground rail into the lens and a 28 m background rail through the fire |
| D-08 | Post-process DOF plus lens transmission | Depth-based DOF cannot make a blurred foreground edge translucent over a sharp background; transmission adds a full extra scene render | Layered Focus Compositor: separate foreground and background targets, no transmission |
| D-09 | Wall 3.6 m, piers 2.4 m, SUVs at −6.2, −0.5, +5.2, fountain at (9.5, −15), white umbrella, no lone palm | Back-projection gives wall 2.45 m, piers about 3.3 m, SUVs −4.06, 0.43, 4.92, statue (12.1, −19.7) and 3.1 m tall, cream umbrella near x=+19.5 | World layout rewritten from the back-projection; lone palm, hedge strip and dune trench added |
| D-10 | Glasses hold the −18.5° pose through beat 3 | The J3 lens line measures near −6.5° (±3°) | Pose eases to −6.5° between p=0.52 and 0.60 |
| D-11 | Sollu uses a 5×6 grid for every word; IDLI and ANBU are valid 5-letter words | Tamil answers split into 5, 6 and 7 aksharas; IDLI and ANBU have 4 letters; the v1 fallback regex splits a decomposed கொ into two tiles | Variable-width Tamil grid (3–8 columns), a word-length audit script, fixed regex with NFC normalisation |
| D-12 | Connections category titles | October blue says "follow SOUTH or OVAL"; "Five pillars" lists four; VEENA is not percussion; Natpu is a chapter while Aram, Porul and Inbam are the three books; CHOLA is a November category and the December Sollu answer | Categories retitled and validated; CHOLA flagged with KOLAM as the drop-in answer |
| D-13 | Tier 3 text is ivory on #C85A32 | Contrast is 3.93:1; AA needs 4.5:1 for small text | Tier 3 fill darkens to #B24A25 (5.00:1); brand terracotta stays decorative |
| D-14 | Streak, edition unlock, reduced motion, no-WebGL fallback and Tamil month labels are undefined | Monthly puzzles have no daily streak; November and December would ship as spoilers | All defined in the hero and hub sections |
| D-15 | One mega-commit; sequential-thinking MCP verifies the projection by reasoning | Reasoning is not a gate | Eight atomic commits; projection verified by a runnable script that fails the build |

### What v1.1 adds

- A reference-calibration appendix and an onion-skin debug mode, so layout is tuned against the frames and not by eye.
- A Layered Focus Compositor and a numeric Lens Registration Contract.
- A scrubbable FX model: every effect is a pure function of scroll progress p.
- Performance tiers, fallbacks and accessibility for the hero.
- Full game rules with algorithms, a storage schema, share cards and audio recipes.
- Corrected content for three editions and a seed dictionary of 113 verified Tanglish words.
- QA gates, risks, milestones and a rewritten agent directive.

## Executive summary, launch plan and success gates

/games is a flagship top-level route: a scroll-scrubbed 3D hero that opens on a beach standoff and ends inside the page, followed by a monthly Tamil games hub with two games (Sollu, a Tanglish and Tamil-script Wordle, and Thodarpu, a Tamil Connections). v1.1 turns the hero's "match the reference" goal into three numeric frame gates that a script can fail.

| Beat | p range | What the viewer sees | Focus state |
| --- | --- | --- | --- |
| J1 Coastal standoff | 0.00–0.22 | Locked-off beach: iron fence left, marble statue right, breached wall with two holes and three SUVs carrying silhouettes | Background sharp (37 m) |
| J2 Hand and eyeglasses | 0.22–0.52 | A bronzed hand lowers black glasses into the foreground; the beach melts into bokeh | Racks to 0.36 m |
| J3 Reverse focus and blast | 0.52–0.85 | Focus snaps back to the SUVs; three missiles trail smoke; fireballs erupt inside the lenses; a sand shockwave rolls in | Racks to 37 m |
| J4 Portal | 0.85–1.00 | The frame swells past the screen edges, the camera drives through the fire, haze dissolves to Khadi Ivory as the hub sheet rises | Fire and haze |

The scroll runway is 340vh on desktop and 260vh on mobile, so p advances over 240vh and 160vh of actual scroll.

### Launch plan

Today is 26 October 2026, so the October edition is live for six days at launch. Ship October as the Launch Edition, keep November and December locked behind a teaser with a countdown, and unlock each at 00:00 local time on the 1st. A `?unlock=all` flag (dev and preview builds only) opens every edition for testing.

### Success gates

| Gate | Target | How it is verified |
| --- | --- | --- |
| Frame parity J1, J2, J3 | Every landmark in the calibration appendix lands within 1.5% of frame width and 2% of frame height of its reference position | `scripts/verify-frame-parity.mjs` plus an onion-skin review at the three p values |
| Lens registration (J3) | For every p from 0.66 to 0.85 in steps of 0.01: centre fireball inside the middle 30% of the left lens; right fireball inside the nose-side half of the right lens; left fireball at least 0.03 of frame width left of the left lens | `scripts/verify-lens-registration.mjs`; a failure fails `npm run build` |
| Optical states | At p=0.42 the background blur radius is at least 20 px at 1440 px width; at p=0.72 the foreground blur radius is at least 14 px; no halo on blurred foreground edges | Screenshot review and a pixel probe at the glasses rim |
| Frame rate | Median at least 58 fps on desktop Tier A (1440×900), 1% low at least 45 fps, no frame over 33 ms between p=0.64 and 0.70; at least 30 fps median on mobile (375×812) | Chrome DevTools performance trace, three runs |
| Scene budget | At most 85 draw calls including post passes, 220k triangles, 8 MB of procedural texture memory | `renderer.info` logged in `?debug=stats` |
| Loading | LCP at most 2.0 s with the J1 poster (AVIF, 90 KB or less) as the LCP element; CLS 0; INP at most 200 ms on game taps; hero chunk at most 150 KB gzip, dictionary chunk at most 60 KB gzip and lazy | Lighthouse and Vercel Speed Insights |
| Accessibility | WCAG 2.2 AA; both games fully playable by keyboard and screen reader; reduced-motion path replaces the scrub with four stills | axe run plus manual keyboard and VoiceOver pass |
| Tamil integrity | Aksharas split by `Intl.Segmenter('ta', { granularity: 'grapheme' })`; கொ, ஷி and த் each count as one tile | Unit tests on the word list |
| Cleanliness | 0 console errors or WebGL warnings in the verification run | `chrome-devtools-mcp` console capture |

### Non-goals

- No SUN PICTURES logo, no YouTube SUBSCRIBE button, no film footage, audio or traced artwork. Every asset is built from scratch in code.
- No external model over 250 KB. Environment, SUVs, glasses, smoke and fire are procedural; a hand mesh is allowed only under the hand decision gate.
- No accounts, backend or ads in v1; progress lives in the browser.
- No daily-puzzle cadence; the hub is monthly.

### Rights and reputation

This is a fan homage by a student organisation. Keep the three reference stills in `docs/reference/`, git-ignored and excluded from the build, never in `/public`. Use the internal codename "Beach Blast" in code, metadata and the Open Graph image; the film name appears only as puzzle trivia. Remove the hero on a takedown request.

## Navigation, routing and page structure

Games sits between Gallery and Guide & FAQ in the top bar with the existing bilingual hover swap, and /games is one route made of three stacked zones: the hero runway, the Arcade sheet and the footer.

### Navbar and command palette

- Add `{ label: "Games", tamilLabel: "விளையாட்டு", href: "/games" }` to `FloatingNav` between Gallery and Guide & FAQ; keep the single-line rest state and set the Tamil label with `lang="ta"` and zero positive letter-spacing.
- Brass dot (5 px, #D4AF37) marks an unsolved puzzle in the current edition and disappears when both are solved. Brass on ivory is only 1.95:1, so the dot gets a 1 px Deep Espresso ring and the link carries `aria-label="Games, new puzzles available"`; colour is never the only signal.
- Register Games, Sollu and Thodarpu in `CommandPalette` (⌘K) and `sitemap.ts`, each with its deep link.

### URL contract

| URL | Behaviour |
| --- | --- |
| `/games` | Hero, then the Arcade on the latest unlocked edition and the first unsolved game |
| `/games#arcade` | Skips the hero; target of the Skip to Arcade pill |
| `/games?edition=2026-10&game=sollu&mode=tanglish` | Deep link to an edition, game and mode (`game=thodarpu`, `mode=tamil` also valid); a locked edition falls back to the latest unlocked one |
| `?debug=p=0.42` | Freezes the hero at p (dev and preview builds only) |
| `?debug=onion=j1` | Overlays the local reference still for j1, j2 or j3 at 50% opacity (dev only; the still is read from `docs/reference/`, never deployed) |
| `?debug=stats` | Prints `renderer.info`, tier and frame times |
| `?unlock=all` | Opens every edition for testing (dev and preview builds only) |

### Page zones

1. **Hero runway.** A sticky `100vw × 100dvh` stage inside a 340vh (260vh mobile) section. DOM overlays sit above the canvas: an eyebrow "OSU TAMIL SANGAM PRESENTS" and a bilingual scroll cue ("Scroll · கீழே செல்") from p=0 to 0.08, and a "Skip to Arcade ↓" pill that appears after 1 s and is the first focusable element on the page.
2. **Arcade sheet** (`id="arcade"`). Khadi Ivory #FAF6F0 on Chola Sandstone #F2EAE0; the sheet glides up over the stage from p=0.90 and becomes the page.
3. **Footer.** The existing site footer, unchanged.

### Metadata and loading

- Title "The Sangam Arcade · OSU Tamil Sangam"; the Open Graph image is a static composite of our own J3 render, with no film logo and no film title.
- The poster (J1 still, AVIF) is server-rendered and is the LCP element; the canvas view hydrates after first paint and cross-fades the poster out once the first frame is drawn.
- The Arcade shell is server-rendered; game logic hydrates on the client. Dictionaries load lazily on first focus of Sollu.
- Load Tamil type with `next/font` using the `tamil` subset, with `font-display: swap` and a line height of at least 1.5 for Tamil text.

## Hero 1: reference calibration and camera model

All three reference frames come from one locked-off camera at eye height with the horizon at v=0.675, so the hero camera is level, fixed and lens-shifted; it is not pitched and it does not move until the portal.

### Measured landmarks and what they imply

Measured by eye on the 1861×778 stills (±6 px, about ±0.3% of width). Treat every value as a starting point; the onion-skin overlay is the arbiter.

| Landmark | Reference (u, v) | Derived world value |
| --- | --- | --- |
| Wall base at the left corner | (0.352, 0.739) | Wall on z=−35; consistent with horizon v=0.675 and eye height 1.65 m |
| Wall top | v≈0.648 | Wall height 2.45 m |
| SUV centres | u = 0.425, 0.508, 0.591 | x = −4.06, +0.43, +4.92 at z=−31 |
| SUV wheel line to roof | v 0.739 to 0.668 | Cab height 1.61 m |
| Breach holes | u = 0.462 and 0.554 | x = −2.28 and +3.24; each about 1.6 m wide and 1.7 m tall |
| Lone coconut palm behind the wall | u=0.386, crown top v=0.443 | x ≈ −7.3 at z=−38, height ≈ 7.9 m |
| Marble statue | base (0.822, 0.780), top v=0.580 | x ≈ +12.1, z ≈ −19.7, 3.1 m tall |
| Cream umbrella canopy | u=0.883, v≈0.64 | x ≈ +20, z ≈ −30; cream, not white |
| Iron fence | Top line converges toward u≈0.45 | Straight run parallel to z at x≈−9.5, not the v1 diagonal; base reads 0.8 to 1.1 m above the sand, so it stands on a retaining wall |
| Fence height and piers | Top v 0.518, 0.578, 0.621 at the left edge, first pier, second pier | Fence about 2.8 m, piers about 3.0 m above the sand |

The fence is the lowest-confidence row; tune it with `?debug=onion=j1` before touching anything else.

### Projection model

With camera-space offsets (x\_c, y\_c), distance d along the view axis, vertical half-FOV tangent T\_v, aspect A, horizontal tangent T\_h = A·T\_v and lens shift s:

```latex
u = \tfrac{1}{2}\left(1 + \frac{x_c}{d\,T_h}\right), \qquad v = \tfrac{1}{2}\left(1 - s - \frac{y_c}{d\,T_v}\right)
```

A point at infinity on the view axis lands at v = (1 − s)/2, so s = −0.350 puts the horizon at v = 0.675.

### Locked camera (J1 to J3)

| Parameter | Value | Reason |
| --- | --- | --- |
| Position | (0, 1.65, 6.0) | Eye height, as the reference |
| Orientation | Level, looking along −z, pitch 0° | Verticals stay parallel; the reference pickets are vertical |
| vFOV at design aspect 2.39 | 34° (hFOV 72.3°) | Matches J1 |
| Lens shift s | −0.350 NDC vertical | Moves the horizon from v=0.5 to 0.675 |
| Background near and far | 1.0 and 400 | Depth precision for the beach |
| Foreground near and far | 0.01 and 2.0 | The glasses sit 0.36 m away |
| Drift | At most 0.4% of frame on each axis, 0.15 Hz noise | Alive but locked off |
| Lens breathing | None | v1 changed FOV per beat; the reference does not |

Apply the shift by writing `camera.projectionMatrix.elements[9] = −s` (that is, +0.350), then `camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()`. R3F recomputes the projection on resize, so wrap `updateProjectionMatrix` on both hero cameras and reapply the shift after each call. Do not pitch the camera: a 6° pitch keystones every vertical.

### Aspect policy

| Viewport aspect | Policy | Result |
| --- | --- | --- |
| 2.0 or wider | Fill the viewport, vFOV 34°, shift −0.350 | Exact J1 composition; wider screens see more at the sides |
| 1.3 to 2.0 (laptops, 16:10, 16:9) | Cinema frame: stage is 2.39:1, full width, centred; Deep Espresso bars fill the rest | Exact composition at every desktop size; about a third fewer pixels to shade; the bars hold DOM captions |
| Below 1.3 (phones, portrait tablets) | Portrait recomposition: stage fills the viewport, hFOV locked at 44°, horizon at v=0.56, glasses sized to 78% of width by the rig solver | Central standoff stays readable; statue and far fence crop out |

At 1440×900 the cinema stage is 1440×603 with 148 px bars. Bar captions (Tamil and English) change per beat, for example "The standoff · நேருக்கு நேர்", and are `aria-live="off"` so scrolling never chatters at a screen reader.

Verify frame parity at the design aspect with a 1912×800 viewport; at other aspects the u landmarks must still hold, and v offsets from the horizon scale by A/2.39.

### Screen-anchored rig solver

Place the foreground rig in camera space from a target screen anchor (u, v) and distance d, so it lands in the same place at every aspect:

```latex
x_c = (2u - 1)\,d\,T_h, \qquad y_c = (1 - 2v - s)\,d\,T_v
```

At the design aspect the J2 anchor (0.563, 0.565) with d = 0.36 m gives the rig at world (0.033, 1.674, 5.64); the J3 anchor (0.5875, 0.575) gives (0.046, 1.672, 5.64). Recompute on every resize.

## Hero 2: world layout

The beach is eleven groups of procedural geometry placed from the back-projection, costing 30 draw calls including the shadow pass. Origin is the centre of the courtyard floor; +x right, +y up, +z toward the camera; units are meters.

| Group | Placement and size | Look | Draw calls |
| --- | --- | --- | --- |
| Sky dome | Radius 300, inside-out; 6 instanced cloud billboards | Zenith #4DB6CE to horizon #B8E6E8; cirrus streaks left (u 0.15–0.35, v 0.35–0.45); cumulus behind the right palms (u 0.66–0.72 and 0.80–0.88, v 0.40–0.55); no sun disc | 2 |
| Sand floor | 120 × 90 m, y=0, centred at z=−14 | Albedo #F3D58D to #E2BC6B in ripples and footprints; wind-ripple normals (0.35 m wavelength); micro-mica sparkle; footprints baked into one 1024² mask | 1 |
| Dune berm | Strip from x=+10 to +40, rising 0.9 m, with a shaded trench | Matches the right-hand dune and dark rut in J1 (u 0.84–1.0, v 0.78–0.82) | 1 |
| Ocean | Plane at y=−0.6, x from −120 to −11, z from +10 to −200 | Turquoise #62D0DC with scrolling ripple normals, fading to haze at the horizon; seen between fence pickets | 1 |
| Retaining wall and hedge | Wall at x=−9.5 from z=−7 to −35.5, top 0.9 m, #C98A6B; boxwood hedge 0.45 m tall at x=−8.4 with 5 fan palms and shrubs | Peach terracotta; bright green hedge strip as in J1 | 2 |
| Iron fence | On the wall, x=−9.5, 1.9 m tall; piers 3.0 m above sand at z=−16.6, −27.3 and −35.0 (the corner pier meets the compound wall) | Instanced black pickets with spear finials (pitch 0.12 m), two rails, S-scroll rings; piers #C98A6B | 4 |
| Compound wall | z=−35, x from −9.5 to +45, 2.45 m tall, #B87B5E, 0.12 m coping | Two jagged breaches at x=−2.28 (sky shows through) and x=+3.24 (dark scorched rubble boulder), each 1.6 × 1.7 m; red bougainvillea 0.8 m tall at x≈−8.0 and x≈+5.0; rubble chunks instanced on the sand | 3 |
| SUVs and silhouettes | Three at z=−31, x = −4.06, +0.43, +4.92; 2.15 m wide, 4.4 m long, cab roof 1.61 m; facing +z | Charcoal-olive #3A3D34 with grille, bullbar, windshield reflecting sky, rubble at the tyres; one instanced body, one glass, one wheel set, one merged silhouette mesh | 4 |
| Marble statue group | Statue and plinth at (+12.1, −19.7), 3.1 m tall; planter 4.0 × 2.2 m; two urns at x=+10.2 and +11.0; cycad and agave cluster at x=+10.4, 2.2 m tall | White marble #ECE8E0 on a tiered pedestal in a terracotta planter | 4 |
| Umbrella set | Cream (#EADFC4) 8-rib canopy, 2.6 m across, at (+20, −30); table and two chairs | Matches the cream umbrella in J1 | 2 |
| Palm grove | 18 coconut palms behind the wall (z −37 to −45, x +5 to +40) plus the lone palm at (−7.3, −38), 7.9 m tall | Ringed lathe trunks (instanced); 22 alpha-tested frond cards per crown (instanced); vertex-shader sway | 2 |
| Shadow pass | Casters: SUVs and statue group; the rig has its own map (Hero 3) | One 2048² map over a 60 × 40 m box | 4 |
| **Total** |  |  | **30** |

### Lighting, fog and atmosphere

- Sun: directional at (12, 24, 14), #FFF4D6, intensity 3.8; shadow bias −0.0004, normal bias 0.02.
- Hemisphere: sky #7CE0F4, ground #E8C574, intensity 0.85.
- Exponential-squared fog on the background pass only: colour #BFE6EA, density 0.007, so the compound wall carries about 8% haze.
- Grade profile `jailer-sunblast` in `gradeConfig.ts`: lutOpacity 0.74, bloomThreshold 0.72, bloomIntensity 0.65, vignetteDarkness 0.38, grainOpacity 0.035.
- Ambient motion: palm crowns sway 0.6° at 0.2 Hz, bougainvillea 0.3°, sand mica twinkles, ocean normals scroll. Nothing in J1 else moves.

### Silhouettes

Each SUV carries 2 to 3 flat-black figures (#0E0D0C with a #3A3D34 rim) about 1.1 m tall, sized to read 30 to 36 px tall at 1861×778. They hold no weapons and wear no insignia. At detonation they are covered by the first fire frame and replaced by debris chunks; no figure is shown thrown or injured.

### Texture memory

All textures are procedural or generated at load: footprint mask 1024² R8 (1.3 MB with mips), a shared 64³ RGBA8 noise volume for fire and smoke (1 MB), hand skin normal 512² RGBA8 (1.3 MB), glasses micro-scratch 256² (0.3 MB). Total about 4 MB against the 8 MB budget.

## Hero 3: foreground rig, glasses and hand

The rig is real-size black glasses held by a bronzed right hand 0.36 m from the lens, placed by screen anchors, rolled from −18.5° to −6.5° and built entirely in code. Everything below was measured on J2 and J3; J3 is defocused, so its landmarks carry about ±15 px.

### What the stills measure

Millimeters are at the 0.36 m rig plane, where the frame is 526 mm wide and 220 mm tall. Angles in this document are image angles with y down, so −18.5° means the right lens is higher.

| Landmark | J2 | J3 | What it implies |
| --- | --- | --- | --- |
| Left lens centre (u, v) | (0.487, 0.632) | (0.496, 0.600) | Anchor model below lands within 0.014 of frame width and 0.011 of frame height of both |
| Right lens centre (u, v) | (0.634, 0.517) | (0.655, 0.563) | Right lens sits higher in J2 and nearly level in J3 |
| Lens-line angle | −18.2° | about −6° (±3°) | Matches D-10; roll changes by 12° between p=0.52 and 0.60 |
| Lens-centre spacing | 0.155 of width | 0.157 of width | Same distance in both frames: 0.36 m |
| Aperture, principal axes | 56 × 43 mm and 55 × 42 mm | not measurable | Standard 55 × 42 mm lens, so the glasses are real size |
| Rim thickness | 3.0, 4.5, 6.2 mm at p10, p50, p90; end pieces to 13.6 mm | not measurable | Thick acetate with a heavier top rim |
| Left temple | 4.5 mm wide, 64 mm long as projected | long rod near the frame edge | 140 mm real length, foreshortened to 0.46 |
| Thumbnail width | about 12 mm | blurred | Adult hand at the glasses' depth |
| Hand coverage | about 14% of the frame, u 0.66 to 1.0, v 0.02 to 0.62 | u 0.72 to 1.0 | Enters at the upper-right corner and never shows the wrist crease |

The anchors in Hero 1 stand. J2 anchor (0.563, 0.565) models lens centres at (0.489, 0.624) and (0.637, 0.506); J3 anchor (0.5875, 0.575) models (0.510, 0.596) and (0.665, 0.554). The lens registration contract in Hero 7 is evaluated on the modelled centres, not on the measurements.

### Glasses

| Part | Specification |
| --- | --- |
| Scale | Lens centres at ±41 mm, overall width 147 mm, temples 140 mm. Never scale the glasses to fit a viewport; the solver moves them in depth instead. |
| Front | Two rounded-trapezoid apertures, 56 × 43 mm, corner radius 9 mm, extruded 5 mm with a 0.8 mm bevel in 3 segments. Rims: top 6.0 mm, sides 5.0 mm, bottom 3.5 mm, which reproduces the measured 3.0 to 6.2 spread. End pieces 12 mm. |
| Bridge | Keyhole saddle, 17 mm wide and 6 mm thick (typical values, not measured). |
| Temples | 140 mm long, 4.5 mm wide and 12 mm tall, open at 90° with a 4° outward splay. The pose is static, so the temples merge into the front geometry and cost no extra draw. |
| Hinges | Three silver pins per side (#C9CED3, metalness 1, roughness 0.25, radius 1 mm), instanced. |
| Lenses | No glass is rendered (D-08). Each aperture is open in the foreground layer, and an optional 5% cyan-green glint quad draws additively from p=0.60. |
| Markings | None. The reference shows engraved text near the left end piece; do not reproduce it, and add no brand or logo. |

### Pose over scroll

The controlled quantity is the on-screen lens-line angle θ, not an Euler roll. v1's `rotation.z = −0.32 rad` tilts the right lens down in three.js, the opposite of the reference; the solver now finds `rotation.z` so the projected lens centres make angle θ (three Newton steps, seed `−θ + 3°`).

| p | Anchor (u, v) | θ | Behaviour |
| --- | --- | --- | --- |
| 0 to 0.22 | hidden | none | `rig.visible = false`: no draw calls and no shadow work |
| 0.22 to 0.40 | (0.80, −0.30) to (0.563, 0.565) | −34.5° to −18.5° | Damped descent from above the upper-right edge; first pixels at p≈0.235 |
| 0.40 to 0.52 | (0.563, 0.565) | −18.5° | J2 hold, tremor only |
| 0.50 to 0.54 | unchanged | ±2° | Anticipation tremor, peak at 0.52 |
| 0.52 to 0.60 | to (0.5875, 0.575) | to −6.5° | Smoothstep; the optics reverse in the same window (Hero 4) |
| 0.60 to 0.85 | (0.5875, 0.575) | −6.5° | J3 hold; the lens registration window |
| 0.85 to 1.00 | portal rail | none | Hero 6 |

The descent is a critically damped response, normalised so it ends exactly at p=0.40, with a pendulum swing on θ that decays to zero at the end of the window.

```latex
f(\tau) = 1 - \frac{g(\tau) - g(1)}{1 - g(1)}, \quad g(\tau) = (1 + \lambda\tau)\,e^{-\lambda\tau}, \quad \tau = \frac{p - 0.22}{0.18}, \quad \lambda = 6

\theta(\tau) = -18.5^{\circ} - 16^{\circ}\,(1 - \tau)\,e^{-4\tau}\cos(2\pi \cdot 0.9\,\tau)
```

With λ=6, f is 0.45 at τ=0.25, 0.815 at τ=0.5 and 0.956 at τ=0.75, and exactly 1 at τ=1. Pitch and yaw hold a seed of +30° (top rim toward the camera, temples rising away) and +5°, from a five-landmark fit to J2 with a 25 px residual. Treat both as starting values for the onion-skin review.

On portrait viewports the solver sets the distance so the glasses span 78% of the frame width: d = 0.147 / (0.78 × 2 × tan 22°) = 0.233 m.

### Hand and the hand decision gate

The hand is a real adult right hand in a pinch grip: thumb pad and the side of the index finger clamp the right temple, the other fingers curl under, and the arm leaves through the upper-right corner. Only fingers, the back of the hand and the forearm are visible.

- **Construction.** Capsule and ellipsoid signed-distance primitives, smooth-unioned with k = 6 mm, polygonised by marching cubes in a worker at load: 1.2 mm voxels over a 220 × 140 × 120 mm box, about 18k triangles, normals from the field gradient, skin mapped triplanar. Fingernails are separate rounded plates, instanced.
- **Skin.** `MeshPhysicalMaterial`, roughness 0.18, clearcoat 0.65, wrap lighting from the sun and a cool sky rim. One 512² RGBA8 texture packs the tangent normal (pores and knuckle creases, normalScale 0.35), a streak mask for the wet white-cream smears on the knuckles and thumb, and crease occlusion.
- **Colour targets.** Values below are post-grade pixels from J2 (n≈208k, a mask that includes a little shadowed background), so tune albedo until a pixel probe at each percentile is within ΔE00 of 8.

| Percentile | Target | Where it shows |
| --- | --- | --- |
| p15 | #020000 | Deepest shadow between fingers |
| p35 | #1C0A07 | Core shadow |
| p50 | #2D1D14 | Mid shadow |
| p70 | #4A3626 | Lit skin |
| p85 | #654C39 | Brighter skin |
| p95 | #8E6E53 | Knuckle highlights |
| p99 | #A1957A | Wet cream streaks |

v1's mid stop #7A3B22 is 24% brighter than p70, and its top stop #D98A5C is a saturated orange where the reference's brightest 1% is a desaturated cream, so v1's ramp is replaced by the targets above.

**Hand decision gate.** The Non-goals allow an authored hand mesh only if the procedural hand fails this gate at milestone M3 (see QA plan).

| Check | Pass | How |
| --- | --- | --- |
| Silhouette overlap | IoU of at least 0.75 against the J2 hand region | `scripts/measure-hand-iou.mjs` on a render at p=0.42; measured, never traced, never shipped |
| Colour | Median ΔE00 of 8 or less over the seven probes | Pixel probe on the same render |
| Reads as real | Two viewers who have not seen the reference rate it 4 of 5 or higher at 1440×900 after 10 s | Review |
| Cost | 25k triangles or fewer, one draw call, 3 ms GPU or less on Tier A | `?debug=stats` |

If any check fails, the fallback is a mesh we make ourselves: a volunteer's own hand, photographed with written consent, decimated to 20k triangles and 250 KB or less (meshopt), loaded lazily after the J1 poster. Skin textures stay procedural, and no asset is ever derived from the film.

### Frame material, light, tremor and shadow

- **Acetate.** `#08080A`, roughness 0.12, clearcoat 1.0, clearcoatRoughness 0.06, reflecting a 128² environment generated once from the sky dome; a 256² micro-scratch map adds fine wear. The white rim highlights in J2 come from that sky reflection.
- **Tremor.** Time-based, 0.12% of frame width (1.7 px at 1440) at 1.3 Hz in 3 octaves of noise, cut to 40% while scrolling. The registration check assumes ±0.15% of width and ±0.2% of height.
- **Rig shadow.** A separate 512² orthographic map over a 0.6 m box (1.2 mm texels); casters are the hand and glasses, receivers the same two. The world shadow map no longer lists them: their sun shadow lands 1.3 m ahead of the camera on the sand, at v≈2.7, far below the frame.

| Rig budget | Draw calls | Triangles |
| --- | --- | --- |
| Frame and temples, merged | 1 | 7.5k |
| Hinge pins, instanced | 1 | 0.6k |
| Hand | 1 | 18k |
| Nails, instanced | 1 | 0.6k |
| Lens glints | 1 | 4 |
| Rig shadow pass | 2 | same meshes |
| Total | 7 | about 27k |

## Hero 4: Layered Focus Compositor

Optics are two render targets, not one depth buffer: the world and the rig are drawn and blurred separately, then composed through a lens mask, so a blurred glasses frame stays translucent over a sharp beach. This replaces v1's depth-of-field plus lens transmission (D-08), which cannot do that and costs a second full scene render.

### Pass graph

| # | Pass | Reads | Writes | Notes |
| --- | --- | --- | --- | --- |
| 1 | Background | world scene, background camera (near 1, far 400) | RT\_BG, RGBA16F | Fog applies here only |
| 2 | Foreground | rig scene, foreground camera (near 0.01, far 2) | RT\_FG, RGBA16F premultiplied, cleared to transparent; RT\_MASK, R8 | Two attachments from one draw; the mask is 1 inside the two lens apertures |
| 3 | Background blur | RT\_BG | half-resolution ping-pong pair | Skipped when the background defocus is under 0.01 |
| 4 | Foreground blur | RT\_FG | half-resolution ping-pong pair | Skipped when the foreground defocus is under 0.01 or the rig is hidden |
| 5 | Lens optics | blurred or sharp background, RT\_MASK | lens-corrected background | Zoom and contrast inside the apertures only |
| 6 | Composite | passes 4 and 5 | full-screen quad in the view | Output feeds the existing `GradeStack` (`jailer-sunblast`) |

Both cameras share one pose and one lens shift (Hero 1), so a point at infinity lands on the same pixel in both targets. The two scenes live in separate `createPortal` roots so the Drei `View` never draws them directly. Do the sub-renders in the composite quad's `onBeforeRender`, saving and restoring the render target, viewport and scissor. The hero must stay inside the persistent `GlobalCanvas`, with no second canvas and no second ticker.

### Focus schedule

Only two depths matter, 0.36 m and 37 m, so focus is one scalar Φ (0 focused far, 1 focused near) and each layer's blur is its distance from the focus state.

```latex
\Phi(p) = \begin{cases} 0 & p < 0.25 \\ \operatorname{smoothstep}(0.25,\,0.40,\,p) & 0.25 \le p \le 0.52 \\ 1 - \operatorname{smootherstep}(0.52,\,0.60,\,p) & p > 0.52 \end{cases}

R_{bg} = 0.0181\,W\,\Phi, \qquad R_{fg} = 0.0125\,W\,(1 - \Phi)

C = F_{\mathrm{blur}} + (1 - \alpha_{\mathrm{blur}})\,B', \qquad B' = \begin{cases} G\big(B(c + (uv - c)/z)\big) & \text{inside the lens mask} \\ B & \text{elsewhere} \end{cases}
```

W is the stage width in pixels. At 1440 px that gives a maximum background radius of 26 px and a maximum foreground radius of 18 px, which clear the 20 px and 14 px gates with margin. The rig enters at p=0.22 while Φ is still 0, so the glasses arrive defocused and sharpen as focus racks near.

| p | Φ | Background | Rig | What the viewer sees |
| --- | --- | --- | --- | --- |
| 0.10 (J1) | 0 | sharp | hidden | The standoff in full focus |
| 0.30 | 0.26 | 7 px | 13 px | Hand arrives soft, beach starts to melt |
| 0.42 (J2) | 1 | 26 px | sharp | Hand and glasses crisp, beach in cream |
| 0.56 | 0.5 | 13 px | 9 px | Mid-pull; both layers soft |
| 0.72 (J3) | 0 | sharp | 18 px | Blast sharp, hand and frame soft |

### Lens optics

Inside each aperture the viewer sees the background through glass. Between p=0.52 and 0.62 a zoom z rises from 1.00 to 1.06 about each lens centre c, and a contrast gain rises from 1.00 to 1.15 about mid-grey (0.18 linear) with a 4% warm lift. G is that grade. The lens centres in uv come from the rig solver every frame, so the effect follows the tremor. The registration check in Hero 7 measures positions after this zoom.

### Edge quality

- **No halo.** Foreground colour is premultiplied before blur and composed with `F + (1 − α)B`, so a bright background never bleeds a fringe into the dark frame.
- **Bokeh.** 24-tap Vogel-disc gather with per-pixel rotation from interleaved gradient noise, a 3×3 tent post-filter, and a ×3 weight on samples above 0.85 luminance so the white SUV glass and cream umbrella form soft discs.
- **Lens mask.** The two apertures are drawn as geometry into RT\_MASK, then blurred by 1.5 px so the zoom boundary is not aliased. Clamp the zoomed sample to the target edge.
- **Transitions.** Both blurs run together only inside p=0.25 to 0.40 and 0.52 to 0.60; at the J2 and J3 holds one of them is skipped.

### Cost and gates

| Item | Budget |
| --- | --- |
| Render-target memory | 29 MB at the 1440×603 cinema stage, 51 MB at 1912×800; cap 64 MB on Tier A and 24 MB on Tier B and C. Targets are separate from the 8 MB procedural texture budget. |
| GPU time | 2.5 ms or less for passes 3 to 6 at 1440×900 on Tier A (a target, to be measured) |
| Internal resolution | Hero targets render at device pixel ratio 1 on Tier A even on retina screens |

| Gate | Pass | Probe |
| --- | --- | --- |
| Background blur at J2 | Radius of at least 20 px at 1440 px | Laplacian variance of the fence region at p=0.42 is at most 8% of its p=0.10 value |
| Foreground blur at J3 | Radius of at least 14 px | 10 to 90% edge width across the right lens's top rim at p=0.72 is at least 14 px; at p=0.42 it is at most 2 px |
| Halo | None | No pixel on the blurred rim brighter than 1.1× its neighbours at p=0.72 |
| Lens optics | Zoom 1.06 and gain 1.15 reached by p=0.62 | Uniform dump in `?debug=stats` |

If the integration spike (milestone M1) shows the sub-renders cannot share the `View` safely, fall back to a hero-owned frame buffer drawn by the same quad, still inside `GlobalCanvas`; do not add a canvas.

## Hero 5: missiles, contrails, fireballs and shockwave

Three missiles enter on screen-space splines from p=0.540, all three detonate together at p=0.640, and every effect is a pure function of p, so scrolling back un-explodes the beach. Paths, sizes and ignition points are fitted to J3; the lens registration contract in Hero 7 depends on them.

### Scrubbable FX model

- No particle state and no frame delta. Each effect reads p and nothing else; randomness comes from a hash of the instance id and the seed `0x5A17`.
- Physics runs in blast seconds, a unit conversion only: s = 25 × (p − 0.640). The detonation is s=0, the registration window opens at s=0.5 and the portal starts at s=5.25.
- Ambient motion (palms, ocean, tremor) is the only time-based motion in the hero, and it never touches the effects.

### Missiles and contrails

Control points are (u, v) read from J3 by sampling the smoke centreline every 60 px, accurate to about ±0.02. M1 extrapolates to within 0.01 of the left SUV's cab, which fixes the D-06 assignment: the upper-left trail hits the left SUV, the low-left trail the centre SUV, the upper-right trail the right SUV.

| Missile | Target | Spline control points | Enters | Impact |
| --- | --- | --- | --- | --- |
| M1 upper left | Left SUV | (0.004, 0.115), (0.108, 0.225), (0.204, 0.344), (0.301, 0.474), (0.366, 0.578), (0.425, 0.655) | p=0.540 | p=0.640 |
| M2 low left, over the fence | Centre SUV | (0.004, 0.415), (0.108, 0.488), (0.204, 0.560), (0.300, 0.628), (0.400, 0.680), (0.508, 0.725) | p=0.546 | p=0.640 |
| M3 upper right, behind the hand | Right SUV | (0.930, 0.095), (0.839, 0.230), (0.758, 0.353), (0.677, 0.475), (0.620, 0.560), (0.591, 0.610) | p=0.552 | p=0.640 |

The head position is the fraction t^1.4 of spline length, with t = (p − enter) / (0.640 − enter), so each missile accelerates and all three arrive together. The head is a camera-facing quad (white-hot core, 4 px glow), one instanced draw for three.

- **Ribbon.** 96 segments from the head back to the spawn point, one draw per trail. Width grows with age from 0.028 to 0.07 of frame height, matching the 45 to 60 px tubes measured at the old end of the J3 trails.
- **Shading.** Curl-noise displacement (amplitude 0.012 of frame height, growing with age) and cotton density from the shared 64³ noise volume, puffs about 0.06 of frame height across. Lit top #F4F6F4, shaded underside #9EA6A8.
- **After impact.** Trails persist, widening to 1.6× and fading to 35% opacity by p=0.85. They live in the background layer, so they sharpen with the beach as focus snaps back (Hero 4).

### Fireballs

Ignition points are art-directed offsets from the SUVs (left −0.48 m, centre +0.44 m, right +2.0 m) so the incandescent cores land where J3 shows them. J3's cores sit near u=0.414, 0.516 and 0.615; the nominal points below are 0.416, 0.516 and 0.628. The right one is 0.013 of width past the reference so the registration contract passes against the modelled lens.

| Fireball | SUV x (m) | Ignition x (m) | Core radius | Core centre y at p=0.66 | Smoke column | Screen (u, v) at p=0.72 |
| --- | --- | --- | --- | --- | --- | --- |
| Left | −4.06 | −4.54 | 2.3 m | 2.6 m | 6.0 m | (0.416, 0.621) |
| Centre | +0.43 | +0.87 | 3.0 m | 3.2 m | 7.5 m | (0.516, 0.595) |
| Right | +4.92 | +6.92 | 1.9 m | 2.9 m | 5.5 m | (0.628, 0.608) |

The core centre rises only 0.5 m between p=0.66 and 0.85, while the smoke column climbs to its full height; the registered point must stay inside the lens.

- **Growth and fade.** Core radius is r · min(1, (s / 0.8)^0.5), so full size at p=0.672. Emission is 0.35 + 0.65 · e^(−s/2.4), so it dims to 43% by the portal and never goes dark.
- **Fire shader.** One raymarched FBM sphere per fireball on a screen-aligned quad 2.6 r wide: 32 steps on Tier A, 20 on Tier B, 12 on Tier C. Density is a sphere of radius r displaced by 35% FBM. A 256×1 colour lookup maps temperature to #FFF6B0 core, #FF6A00 mid, #9E1B00 outer and #2A1E17 soot.
- **Blending.** One draw with premultiplied output: flame is emissive with zero alpha (adds), soot carries alpha (covers). This replaces v1's two blend modes and doubles nothing.
- **First flash.** A white additive quad at 1.5 r for p=0.640 to 0.642, hiding the SUV swap. One flash only; no strobing (Hero 8).
- **Smoke column.** 14 camera-facing puffs per fireball, instanced (42 in one draw), rising with ease-out to the column height; dark #2A1E17 at the base to grey #6B6560 on the sunlit side.
- **Debris.** 80 instanced chunks (centre 40, left 22, right 18), 0.15 to 0.5 m, six of them SUV hull plates. Closed form, no bounce:

```latex
y(s) = \max\!\left(0,\; y_0 + v_y s - \tfrac{1}{2} g s^2\right), \quad g = 9.81, \quad v_y \in [8, 13]\ \text{m/s}, \quad x(s) = x_0 + v_x s, \quad v_x \in [-6, 6]\ \text{m/s}
```

Chunks land between p=0.70 and 0.76. The silhouettes vanish under the first flash and no figure is shown (Hero 2).

### Sand shockwave, dust and light

- **Shockwave.** A ground-hugging annulus of radius R(s) = 38 (1 − e^(−s/1.1)) m from the centre ignition, clipped to z > −34. The front reaches the lens plane at p≈0.80. Vertex shader lifts it to 1.4 m with FBM; fragment colour #E5C478 at 0.65 peak opacity with a steep front and a long tail. One draw.
- **Fence dust.** 12 instanced puffs along the base of the left fence, x=−9.5, z from −34 to −10, from p=0.646 to 0.80; #E8E2D6 at 0.5 opacity. One draw.
- **Light.** No real-time point lights, so no shader recompile. Three additive warm decals on the sand and wall (radius 3 × core, opacity follows emission), plus bloom from the grade pass. An exposure bump of at most +0.2 EV at detonation, decaying by p=0.67.
- **Blast shake.** Camera rotation only, applied to both cameras: yaw and pitch peak 0.10°, a(p) = 0.10° · e^(−(p−0.640)/0.012) · sin(2π (p−0.640) / 0.006). v1's 0.018 m translation moves the beach 0.03% of frame width but the glasses 0.36 m away by 3.4%, which would tear the lenses off the fire. A rotation moves both layers equally and leaves the registration untouched.

| Effect | Draw calls | Cost note |
| --- | --- | --- |
| Missile heads | 1 | 3 instances |
| Contrails | 3 | 96 segments each |
| Fireballs | 3 | About 345k pixels at 1440×603, so 11M samples at 32 steps; target 1.2 ms or less |
| Smoke puffs | 1 | 42 instances |
| Debris | 1 | 80 instances |
| Shockwave | 1 | 24 × 128 annulus |
| Fence dust | 1 | 12 instances |
| Light decals | 1 | 3 instances |
| Total | 12 | Warm the fire and smoke shaders during the boot sequence, so no frame exceeds 33 ms at p=0.64 to 0.70 |

## Hero 6: portal push-through and handoff

From p=0.85 two rails run at once: a macro rail drives the foreground camera into the left lens and a 28 m rail drives the world camera toward the fire, so the glasses swell past the frame edges, the view fills with amber, and a Khadi Ivory dissolve and the rising Arcade sheet land together at p=1.00. This is the D-07 fix: one 1.6 m dolly changes a fireball 37 m away by only 4%, so it can never fill the screen.

### The two rails

| Rail | Moves | From → to | Easing | What it does |
| --- | --- | --- | --- | --- |
| Macro (foreground camera) | Distance d to the rig; left lens centre anchored toward the screen centre | d 0.36 → 0.030 m; anchor (0.510, 0.596) → (0.50, 0.50); θ −6.5° → 0° | Geometric: d = 0.36 · 12^(−E(t)), E = smoothstep, t = (p − 0.85) / 0.15 | Magnifies 12×; the frame leaves, the aperture fills the screen |
| Background (world camera) | z | +6.0 → −22.0 m (28 m) | t³ | Fireballs go from 37 m to 9 m: 4.1× larger, so the centre fireball spans 46% of the frame width |

With the 55 × 42 mm aperture, the glasses leave the frame in a fixed order, computed from the frame size at distance d (half-height 0.306 d, half-width 0.731 d):

| Event | Distance d | p |
| --- | --- | --- |
| Top and bottom rims leave the frame | 0.090 m | 0.935 |
| Left end piece leaves | 0.055 m | 0.955 |
| Aperture fills the width; only the view through the lens remains | 0.038 m | 0.970 |
| Rail ends | 0.030 m | 1.000 |

The hand sits 0.1 m or more to the right of the lens axis at the same depth, so it leaves the frame by p=0.93. The foreground near plane is 0.01 m, so nothing clips before the rail ends. The background rail never reaches the wall (z=−35) or the SUV plane (z=−31).

### Fire, haze and the dissolve

- **Fire interior.** A full-screen amber FBM quad (#FFB347 to #F2A03D, scale 0.3 of frame height, drifting with p) with opacity smoothstep(0.88, 0.97, p) × 0.9. It is drawn in the composite quad, so the lens zoom applies to it.
- **Raymarch cost.** The three fireball quads grow to about 1.2M pixels clipped to the stage at p=1. Tier A drops from 32 to 24 steps as the camera approaches (about 29M samples, target 2 ms); Tiers B and C use the sprite fallback.
- **Ivory dissolve.** A DOM overlay, `background: #FAF6F0`, with opacity smoothstep(0.95, 0.985, p), above the canvas. A DOM layer guarantees an exact colour match with the sheet; a GL pass would be shifted by the grade and dither.
- **Canvas shutdown.** At p≥0.995 the stage gets `inert` and `visibility: hidden` and the hero view stops rendering; it wakes again below p=0.99 so there is no flicker at the threshold.

### Arcade sheet handoff

The sheet is the real Arcade section, not a copy. The Arcade has `margin-top: -100vh`, sits above the stage, and is pushed below the fold by a transform that the master ticker writes as a CSS variable, so no layout runs and no seam can appear.

```latex
g(p) = \operatorname{smoothstep}(0.90,\,1.00,\,p), \qquad \text{transform} = \text{translate3d}\big(0,\; (1 - g)\cdot 100\text{vh},\; 0\big)
```

- At S=240vh of scroll (p=1) g is 1, the stage unpins, and the Arcade scrolls on at normal speed with nothing swapped.
- Plain scrolling cannot do this: a 24vh scroll window (p=0.90 to 1.00) would move a sheet only 24vh, so the transform has to run 4.2× faster than scroll.
- Progressive enhancement: the CSS default is `--sheet: 1`, so no-JS, reduced-motion and no-WebGL visitors see the Arcade at the top. The script sets 0 only once the hero has drawn its first frame.
- The top edge is a 2 px brass hairline (#D4AF37) over a 48 px soft shadow, `0 -24px 48px rgba(22,18,16,.25)`. On the 1.3 to 2.0 aspect band the sheet covers the cinema bars too.
- Keyboard and anchors: the Skip pill and the `#arcade` hash call `lenis.scrollTo(runwayEnd, { immediate: true })`, set p=1 with no fly-through, and focus the Arcade heading. Scroll restoration inside the Arcade does the same and skips hero warm-up.

### Timeline and J4 gate

| p | Event |
| --- | --- |
| 0.85 | Both rails start; the blast shake ended near p=0.70 |
| 0.88 to 0.97 | Amber interior fades in |
| 0.90 | Sheet starts to rise; g leaves 0 |
| 0.935 to 0.97 | Glasses leave the frame (table above) |
| 0.95 to 0.985 | Ivory dissolve |
| 0.995 | Canvas stops rendering |
| 1.00 | Sheet fully up; stage unpins |

Verify the handoff still at `?debug=p=0.95`. Expect: no hand pixels, at least 40% of pixels amber (R > G > B, luminance 0.45 to 0.8), the sheet's top edge 45 to 55% of the viewport height from the top (g=0.5 puts it at 50%), and zero console errors.

## Hero 7: master timeline and lens registration contract

One table fixes when every effect starts and ends, and one script proves the three fireballs sit where the lenses are at every p from 0.66 to 0.85 and at every supported aspect, or the build fails. This closes D-05: v1 asked for "dead-centre in the right lens" and had no way to test it.

### Master timeline

| p | Event | Spec |
| --- | --- | --- |
| 0.00 to 0.08 | Eyebrow and bilingual scroll cue visible | Navigation |
| 0.00 to 0.22 | J1 standoff; rig hidden; focus far (Φ=0) | Hero 1, 2 |
| 0.22 to 0.40 | Rig descends from the upper right; θ −34.5° to −18.5°; first pixels at p≈0.235 | Hero 3 |
| 0.25 to 0.40 | Focus racks near (Φ 0 to 1) | Hero 4 |
| 0.40 to 0.52 | J2 hold; the J2 still is p=0.42 | Hero 3 |
| 0.50 to 0.54 | Anticipation tremor ±2°, peak at 0.52 | Hero 3 |
| 0.52 to 0.60 | Roll to −6.5° and anchor to J3; focus snaps far (Φ 1 to 0) | Hero 3, 4 |
| 0.52 to 0.62 | Lens zoom 1.00 to 1.06; lens contrast 1.00 to 1.15 | Hero 4 |
| 0.540, 0.546, 0.552 | M1, M2, M3 enter | Hero 5 |
| 0.640 | All three impacts; flash 0.640 to 0.642; shake and exposure bump begin | Hero 5 |
| 0.646 | Fence dust starts | Hero 5 |
| 0.660 | Registration window opens | This section |
| 0.672 | Cores at full size | Hero 5 |
| 0.70 to 0.76 | Debris lands | Hero 5 |
| 0.72 | The J3 still | Executive summary |
| 0.80 | Shockwave reaches the lens plane; fence dust ends | Hero 5 |
| 0.85 | Registration window closes; both rails start | Hero 6 |
| 0.88 to 0.97 | Amber interior | Hero 6 |
| 0.90 | Sheet starts to rise | Hero 6 |
| 0.95 | The J4 still; ivory dissolve runs 0.95 to 0.985 | Hero 6 |
| 0.995 | Canvas stops rendering | Hero 6 |

Every number above lives in one typed module, `gamesRail.ts`, which exports `RAIL`. A `prebuild` step writes it to `rail.json` for the scripts, so the runtime, the checks and this document cannot drift apart.

### The contract

The core centre is the incandescent core's centre point (Hero 5 table), projected to the screen. Positions are measured after the 1.06 lens zoom and with the rig displaced by its worst-case tremor, ±0.15% of width and ±0.2% of height. The check samples p=0.66 to 0.85 in steps of 0.01, 20 samples, four tremor corners each.

| Gate | Rule | Applies to |
| --- | --- | --- |
| G1 | Centre fireball's core centre is inside the middle 30% of the left aperture (±15% on each axis) | Aspects 2.0 and wider |
| G2 | Right fireball's core centre is inside the right aperture, in its nose-side half | Aspects 2.0 and wider |
| G3 | Left fireball's core centre is at least 0.03 × (2.39 / A) of frame width left of the left lens's leftmost edge | Aspects 2.0 and wider |
| P1 | Left and right fireballs are at least 6 mm inside their own apertures | Portrait, anchor (0.5, 0.54), d=0.233 m |
| P2 | Centre fireball is within 0.07 of frame width of the point midway between the lenses | Portrait |

On the 1.3 to 2.0 band the stage is 2.39:1, so G1 to G3 run at A=2.39. In portrait the same ignition points give a different but equally clean read: left fire in the left lens, right fire in the right lens, centre fire in the bridge.

Reference run of the script below on the nominal values (margins in millimeters on the rig plane, where 1 mm is 2.7 px at 1440 px width):

| Aspect | G1 centre | G2 right | G3 left |
| --- | --- | --- | --- |
| 2.0 | 3.1 mm | 5.0 mm | 2.8 mm |
| 2.39 (design) | 3.1 mm, 8.5 px | 4.9 mm, 13.4 px | 2.6 mm, 7.1 px |
| 3.0 | 3.1 mm | 4.7 mm | 2.4 mm |
| 3.56 | 3.1 mm | 4.5 mm | 2.3 mm |
| Portrait 375×812 | P2: 7.4 mm | P1 right: 9.1 mm | P1 left: 8.2 mm |

The margins are thin because J3's own geometry is thin: its right core sits at the lens's nose edge. Each 0.1 m of ignition shift moves a core by about 1.0 mm on this plane, which is the tuning knob if review wants more slack.

Two defects the check exposed, both now fixed in this document:

- With the right fireball left at the SUV's position (x=+4.92) G2 fails by 15.6 mm at every aspect. That is why Hero 5 offsets it by 2.0 m.
- With a fixed J3 anchor u=0.5875, the check passes at 2.39 but fails at 2.0 (centre −3.9 mm), 3.0 and 3.56, because the fireballs spread with 1/A and the anchor does not. Add this rule to the screen-anchored rig solver in Hero 1: **convert design-aspect anchors with u = 0.5 + (u\_2.39 − 0.5) × 2.39 / A for A of 2.0 and wider.**

```js
// scripts/verify-lens-registration.mjs (Node 20+, no dependencies). Exits 1 on any miss; wired into `prebuild`.
const TV = Math.tan((34 / 2) * Math.PI / 180), DESIGN_A = 2.39;
const RIG = { d: 0.36, thDeg: -6.5, lensX: 0.041, aperW: 0.056, aperH: 0.043, zoom: 1.06, tremor: [0.0015, 0.002] };
// ignition points (world m) and core-centre height: y(p) = y66 + rise * ease((p - 0.66) / 0.19)
const FIRE = { L: { x: -4.54, y66: 2.6 }, C: { x: 0.87, y66: 3.2 }, R: { x: 6.92, y66: 2.9 } }, RISE = 0.5, Z = -31;
const ease = (t) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 2;
const MODES = [
  ...[2.0, 2.39, 3.0, 3.56].map((A) => ({ name: `aspect ${A}`, TH: A * TV, TV, S: -0.35, d: RIG.d, A,
    anchor: [0.5 + 0.0875 * DESIGN_A / A, 0.575] })),                    // anchors scale with 2.39/A
  { name: 'portrait 375x812', TH: Math.tan(22 * Math.PI / 180), TV: Math.tan(22 * Math.PI / 180) * 812 / 375, S: 1 - 2 * 0.56,
    d: 0.2332, A: 375 / 812, anchor: [0.5, 0.54], portrait: true },
];
let failed = false;
for (const m of MODES) {
  const FW = 2 * m.d * m.TH, FH = 2 * m.d * m.TV, th = (RIG.thDeg * Math.PI) / 180, hw = RIG.aperW / 2, hh = RIG.aperH / 2;
  const scr = (x, y) => [0.5 * (1 + x / ((6 - Z) * m.TH)), 0.5 * (1 - m.S - (y - 1.65) / ((6 - Z) * m.TV))];
  const lens = (k) => [m.anchor[0] + k * RIG.lensX * Math.cos(th) / FW, m.anchor[1] + k * RIG.lensX * Math.sin(th) / FH];
  const loc = (pt, c, o) => { const dx = (pt[0] - c[0] + o[0]) * FW * RIG.zoom, dy = -(pt[1] - c[1] + o[1]) * FH * RIG.zoom;
    return [dx * Math.cos(th) - dy * Math.sin(th), dx * Math.sin(th) + dy * Math.cos(th)]; };
  const worst = { C: 9, R: 9, L: 9 };
  for (let i = 0; i <= 19; i++) {
    const p = 0.66 + i * 0.01, pt = {};
    for (const k in FIRE) pt[k] = scr(FIRE[k].x, FIRE[k].y66 + RISE * ease((p - 0.66) / 0.19));
    for (const sa of [-1, 1]) for (const sb of [-1, 1]) {
      const o = [sa * RIG.tremor[0], sb * RIG.tremor[1]], cl = lens(-1), cr = lens(1);
      let g;
      if (m.portrait) {   // L and R inside their own lens by 6 mm; C within 0.07 W of the bridge
        const l = loc(pt.L, cl, o), r = loc(pt.R, cr, o);
        g = { L: Math.min(hw - 0.006 - Math.abs(l[0]), hh - 0.006 - Math.abs(l[1])),
              R: Math.min(hw - 0.006 - Math.abs(r[0]), hh - 0.006 - Math.abs(r[1])),
              C: (0.07 - Math.abs(pt.C[0] + o[0] - (cl[0] + cr[0]) / 2)) * FW };
      } else {            // C middle 30% of left lens; R nose-side half of right lens; L >= 0.03 W (x 2.39/A) left of it
        const c = loc(pt.C, cl, o), r = loc(pt.R, cr, o);
        const edge = cl[0] - (Math.abs(Math.cos(th)) * hw + Math.abs(Math.sin(th)) * hh) / FW;
        g = { C: Math.min(0.15 * RIG.aperW - Math.abs(c[0]), 0.15 * RIG.aperH - Math.abs(c[1])),
              R: Math.min(r[0] + hw, -r[0], hh - Math.abs(r[1])),
              L: (edge - 0.03 * DESIGN_A / m.A - pt.L[0] - o[0]) * FW };
      }
      for (const k in g) worst[k] = Math.min(worst[k], g[k]);
    }
  }
  const ok = Object.values(worst).every((v) => v >= 0); failed ||= !ok;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${m.name.padEnd(17)} margins (mm on the rig plane)  C ${(worst.C * 1e3).toFixed(1)}  R ${(worst.R * 1e3).toFixed(1)}  L ${(worst.L * 1e3).toFixed(1)}`);
}
process.exit(failed ? 1 : 0);
```

The script checks the maths, not the pixels. Add a screenshot probe at p=0.66, 0.72 and 0.85: each registered box (left-lens middle 30%, right-lens nose half) must contain fire colours (R > G > B, luminance above 0.5) in at least 25% of its pixels. Calibrate that threshold on the first render.

## Hero 8: performance budget, fallbacks and accessibility

The hero fits the 85 draw-call budget with 17 to spare, runs on three quality tiers that only ever step down, and degrades to four stills instead of failing, so no visitor meets a blank or a broken page. Every figure below that is not a measurement is a target for milestones M2 and M4 to confirm.

### Budgets

| Budget | Limit | Allocation |
| --- | --- | --- |
| Draw calls, including post | 85 | World 30, rig 7, FX 12, compositor 6 (Hero 4), fire interior 1, GradeStack 12 (an estimate: log the real value in M1) = 68 |
| Triangles | 220k | World 150k, rig 27k, FX 10k = 187k |
| Procedural texture memory | 8 MB | Hero 2's 4 MB, plus a 128² environment cube at about 1 MB, plus lookups under 0.1 MB = about 5.1 MB |
| Total GPU memory | 120 MB Tier A, 60 MB Tiers B and C | Render targets (Hero 4) 51 MB at 1912×800, world shadow map 17 MB, textures and geometry the rest |
| Hero JavaScript | 150 KB gzip, loaded with `next/dynamic` and `ssr: false` | The shared three.js and R3F code already ships with `GlobalCanvas` |

### Frame-time plan

Targets at 1440×900 on Tier A against a 16.6 ms frame:

| Stage | Normal | Peak, p=0.64 to 0.70 |
| --- | --- | --- |
| Master tick: p functions, rig solver, DOM writes | 1.5 ms | 1.5 ms |
| World pass, including shadow | 3.5 ms | 3.5 ms |
| Rig pass | 0.8 ms | 0.8 ms |
| FX | 1.2 ms | 2.5 ms |
| Compositor (Hero 4) | 2.5 ms | 2.5 ms |
| GradeStack | 1.5 ms | 1.5 ms |
| DOM compositing | 0.5 ms | 0.5 ms |
| Total | 11.5 ms | 12.8 ms |

The 3.8 ms of peak headroom pays for the rare long frame; the gate stays "no frame over 33 ms between p=0.64 and 0.70".

### Quality tiers

| Setting | Tier A | Tier B | Tier C |
| --- | --- | --- | --- |
| Chosen when the boot probe's median frame time (24 frames) is | 8 ms or less | 14 ms or less | 14 to 24 ms; above 24 ms uses stills |
| Hero render scale | 1.0 | 0.85 | 0.70 |
| Fire raymarch steps | 32, 24 near the portal | 20 | 12 |
| Bokeh taps | 24 | 16 | 8 |
| World shadow map | 2048² | 1024² | None; baked contact shadows under SUVs and statue |
| Palms and frond cards | 18 and 22 | 12 and 16 | 8 and 10 |
| Cloud billboards | 6 | 4 | 3 |
| Bloom | Full | Half | Half |
| Median frame-rate target | 58 fps or more | 45 fps or more | 30 fps or more (the mobile gate) |

A performance governor steps down one tier when the median frame time exceeds 22 ms over 90 consecutive frames, at most once every 4 s, and never steps up during a visit; this prevents flip-flopping. Tier changes are logged by `?debug=stats`, and `?debug=tier=B` forces a tier.

### Fallbacks

| Condition | Experience |
| --- | --- |
| No WebGL2, or context creation fails | J1 poster with the bar captions; the runway collapses to 100vh; the Arcade sits at the top (`--sheet: 1`) with a one-line note that the intro needs WebGL |
| `prefers-reduced-motion: reduce` | Four stills of our own renders at p=0.10, 0.42, 0.72 and 0.95, as a captioned vertical strip with no scroll scrubbing and no flash |
| Save-Data on, or probe above 24 ms | The same four stills, with an opt-in "Play intro" button |
| Context lost | Show the poster, prevent default, rebuild targets on restore and resume at the current p; after two losses in 60 s switch to the stills |
| JavaScript off | The server-rendered poster and the Arcade shell |
| Tab hidden, or stage off-screen | Rendering paused through the visibility and intersection state |
| Resize or rotation | Debounced 150 ms; recompute the aspect policy, rig solver and targets; no reload |

The four stills are generated by the build, `scripts/render-stills.mjs`, from our own scene at 1912×800 and 750×1624 as AVIF. The J1 still is also the LCP poster at 90 KB or less; the others are 120 KB or less each and load only on the fallback path.

### Loading and boot

- **LCP.** The server-rendered J1 poster is an `<img>` with `fetchpriority="high"` and a fixed aspect-ratio box, so CLS stays 0. The canvas fades the poster out only after its first complete frame.
- **Shader warm-up.** Compile every hero program with `renderer.compileAsync` (parallel shader compile) while the site's boot shutter is up, with a 3 s cap. This is what keeps the 33 ms gate at the detonation.
- **Idle work.** The 64³ noise volume, the environment cube and the hand polygonisation (a worker) run during idle time and finish by p=0.18. If they are not ready at p=0.22 the rig holds invisible until they are.
- **Mobile browser chrome.** Size the canvas with `100svh` and the stage with `100dvh`, so the collapsing toolbar never resizes the render targets.
- **Dictionary.** The Sollu word list loads lazily after the hero is idle (Games hub).

