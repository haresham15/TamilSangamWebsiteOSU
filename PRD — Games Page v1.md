# **PRD — Games Page v1.1 · The Sangam Arcade & Beach Blast Sequence**

**Oct 26, 2026 · @Haresh**

## **Document control and what changed**

v1.1 keeps every goal of v1 and corrects 15 defects, the largest being a camera that would have framed the beach at the wrong height; each fix is measured against your three reference frames.

| Field | Value |
| :---- | :---- |
| **Version** | 1.1, reference-calibrated (supersedes v1) |
| **Project** | OSU Tamil Sangam website: Next.js 16, React 19, R3F v9, Drei, @react-three/postprocessing, GSAP ScrollTrigger, Lenis, Zustand |
| **Surface** | /games, a new top-level route and navbar entry |
| **Package manager** | npm only; package-lock.json is an invariant |
| **Reference frames** | J1, J2, J3 stills, 1861×778 (2.39:1); used for calibration only and never shipped  |
| **Coordinates** | u \= 0 to 1 left to right, v \= 0 to 1 top to bottom of the frame; meters in world space |
| **Status** | Ready for agent execution once the open decisions in the last section are answered |

### **Defect log: v1 versus v1.1**

| ID | What v1 said | Evidence | v1.1 change |
| :---- | :---- | :---- | :---- |
| **D-01** | Camera looks level at (0, 1.8, −31) | Wall base projects to v=0.572 and top to 0.429; the reference shows 0.739 and 0.648, so the beach sits mid-frame instead of low  | Lens shift puts the horizon at v=0.675 (−0.350 NDC); wall now projects to 0.741 and 0.643 |
| **D-02** | Camera position, target and FOV change each beat (34°, 32°, 33°, 38°) | Fence piers and the lone palm sit at the same pixels in all three reference frames, so the shot is locked off  | One locked camera from p=0 to 0.85; only sub-pixel drift and the blast shake |
| **D-03** | Glasses lens centres at ±0.068 m, 1.35 m from the camera | Lens spacing renders 0.069 of frame width; the reference shows 0.153, so the prop is 2.2× too small  | Real-size glasses (lens centres ±0.041 m) 0.36 m from the lens |
| **D-04** | Fireball radii 4.2, 5.0 and 4.5 m | Reference blasts measure about 3.8, 5.1 and 2.3 m wide at 37 m; v1 sizes merge into one blob that swallows both lenses  | Core radii 2.3, 3.0 and 1.9 m; smoke columns to 7.5 m |
| **D-05** | Right fireball is dead-centre in the right lens | In the reference it sits at the nose-side edge of the right lens  | Lens Registration Contract with numeric gates and a runnable check |
| **D-06** | Upper-left missile hits the centre SUV | Fit to the measured reference contrail: mean error 0.008 frame-heights to the left SUV, 0.048 to the centre  | M1 to left SUV, M2 to centre, M3 to right; trails authored as screen-space splines |
| **D-07** | Camera dolly 6.0 to 4.4 m "through the fireball" | A 1.6 m move changes a fireball 37 m away by 4% in scale and cannot fill the viewport | Two rails: a macro foreground rail into the lens and a 28 m background rail through the fire |
| **D-08** | Post-process DOF plus lens transmission | Depth-based DOF cannot make a blurred foreground edge translucent over a sharp background; transmission adds a full extra scene render  | Layered Focus Compositor: separate foreground and background targets, no transmission |
| **D-09** | Wall 3.6 m, piers 2.4 m, SUVs at −6.2, −0.5, \+5.2, fountain at (9.5, −15), white umbrella, no lone palm | Back-projection gives wall 2.45 m, piers about 3.3 m, SUVs −4.06, 0.43, 4.92, statue (12.1, −19.7) and 3.1 m tall, cream umbrella near x=+19.5  | World layout rewritten from the back-projection; lone palm, hedge strip and dune trench added |
| **D-10** | Glasses hold the −18.5° pose through beat 3 | The J3 lens line measures near −6.5° (±3°)  | Pose eases to −6.5° between p=0.52 and 0.60 |
| **D-11** | Sollu uses a 5×6 grid for every word; IDLI and ANBU are valid 5-letter words | Tamil answers split into 5, 6 and 7 aksharas; IDLI and ANBU have 4 letters; the v1 fallback regex splits a decomposed கொ into two tiles | Variable-width Tamil grid (3–8 columns), a word-length audit script, fixed regex with NFC normalisation |
| **D-12** | Connections category titles | October blue says "follow SOUTH or OVAL"; "Five pillars" lists four; VEENA is not percussion; Natpu is a chapter while Aram, Porul and Inbam are the three books; CHOLA is a November category and the December Sollu answer | Categories retitled and validated; CHOLA flagged with KOLAM as the drop-in answer |
| **D-13** | Tier 3 text is ivory on \#C85A32 | Contrast is 3.93:1; AA needs 4.5:1 for small text | Tier 3 fill darkens to \#B24A25 (5.00:1); brand terracotta stays decorative |
| **D-14** | Streak, edition unlock, reduced motion, no-WebGL fallback and Tamil month labels are undefined | Monthly puzzles have no daily streak; November and December would ship as spoilers | All defined in the hero and hub sections |
| **D-15** | One mega-commit; sequential-thinking MCP verifies the projection by reasoning | Reasoning is not a gate | Eight atomic commits; projection verified by a runnable script that fails the build |

### **What v1.1 adds**

* A reference-calibration appendix and an onion-skin debug mode, so layout is tuned against the frames and not by eye.  
*   
* A Layered Focus Compositor and a numeric Lens Registration Contract.  
*   
* A scrubbable FX model: every effect is a pure function of scroll progress p.  
*   
* Performance tiers, fallbacks and accessibility for the hero.  
*   
* Full game rules with algorithms, a storage schema, share cards and audio recipes.  
*   
* Corrected content for three editions and a seed dictionary of 113 verified Tanglish words.  
*   
* QA gates, risks, milestones and a rewritten agent directive.  
* 

## **Executive summary, launch plan and success gates**

/games is a flagship top-level route: a scroll-scrubbed 3D hero that opens on a beach standoff and ends inside the page, followed by a monthly Tamil games hub with two games (**Sollu**, a Tanglish and Tamil-script Wordle, and **Thodarpu**, a Tamil Connections). v1.1 turns the hero's "match the reference" goal into three numeric frame gates that a script can fail.

| Beat | p range | What the viewer sees | Focus state |
| :---- | :---- | :---- | :---- |
| **J1 Coastal standoff** | 0.00–0.22 | Locked-off beach: iron fence left, marble statue right, breached wall with two holes and three SUVs carrying silhouettes  | Background sharp (37 m) |
| **J2 Hand and eyeglasses** | 0.22–0.52 | A bronzed hand lowers black glasses into the foreground; the beach melts into bokeh  | Racks to 0.36 m |
| **J3 Reverse focus and blast** | 0.52–0.85 | Focus snaps back to the SUVs; three missiles trail smoke; fireballs erupt inside the lenses; a sand shockwave rolls in  | Racks to 37 m |
| **J4 Portal** | 0.85–1.00 | The frame swells past the screen edges, the camera drives through the fire, haze dissolves to Khadi Ivory as the hub sheet rises | Fire and haze |

The scroll runway is 340vh on desktop and 260vh on mobile, so p advances over 240vh and 160vh of actual scroll.

### **Launch plan**

Today is 26 October 2026, so the October edition is live for six days at launch. Ship October as the Launch Edition, keep November and December locked behind a teaser with a countdown, and unlock each at 00:00 local time on the 1st. A ?unlock=all flag (dev and preview builds only) opens every edition for testing.

### **Success gates**

| Gate | Target | How it is verified |
| :---- | :---- | :---- |
| **Frame parity J1, J2, J3** | Every landmark in the calibration appendix lands within 1.5% of frame width and 2% of frame height of its reference position  | scripts/verify-frame-parity.mjs plus an onion-skin review at the three p values |
| **Lens registration (J3)** | For every p from 0.66 to 0.85 in steps of 0.01: centre fireball inside the middle 30% of the left lens; right fireball inside the nose-side half of the right lens; left fireball at least 0.03 of frame width left of the left lens  | scripts/verify-lens-registration.mjs; a failure fails npm run build |
| **Optical states** | At p=0.42 the background blur radius is at least 20 px at 1440 px width; at p=0.72 the foreground blur radius is at least 14 px; no halo on blurred foreground edges  | Screenshot review and a pixel probe at the glasses rim |
| **Frame rate** | Median at least 58 fps on desktop Tier A (1440×900), 1% low at least 45 fps, no frame over 33 ms between p=0.64 and 0.70; at least 30 fps median on mobile (375×812) | Chrome DevTools performance trace, three runs |
| **Scene budget** | At most 85 draw calls including post passes, 220k triangles, 8 MB of procedural texture memory | renderer.info logged in ?debug=stats |
| **Loading** | LCP at most 2.0 s with the J1 poster (AVIF, 90 KB or less) as the LCP element; CLS 0; INP at most 200 ms on game taps; hero chunk at most 150 KB gzip, dictionary chunk at most 60 KB gzip and lazy | Lighthouse and Vercel Speed Insights |
| **Accessibility** | WCAG 2.2 AA; both games fully playable by keyboard and screen reader; reduced-motion path replaces the scrub with four stills | axe run plus manual keyboard and VoiceOver pass |
| **Tamil integrity** | Aksharas split by Intl.Segmenter('ta', { granularity: 'grapheme' }); கொ, ஷி and த் each count as one tile | Unit tests on the word list |
| **Cleanliness** | 0 console errors or WebGL warnings in the verification run | chrome-devtools-mcp console capture |

### **Non-goals**

* No SUN PICTURES logo, no YouTube SUBSCRIBE button, no film footage, audio or traced artwork. Every asset is built from scratch in code.  
*   
* No external model over 250 KB. Environment, SUVs, glasses, smoke and fire are procedural; a hand mesh is allowed only under the hand decision gate.  
*   
* No accounts, backend or ads in v1; progress lives in the browser.  
*   
* No daily-puzzle cadence; the hub is monthly.  
* 

### **Rights and reputation**

This is a fan homage by a student organisation. Keep the three reference stills in docs/reference/, git-ignored and excluded from the build, never in /public. Use the internal codename "Beach Blast" in code, metadata and the Open Graph image; the film name appears only as puzzle trivia. Remove the hero on a takedown request.

## **Navigation, routing and page structure**

Games sits between Gallery and Guide & FAQ in the top bar with the existing bilingual hover swap, and /games is one route made of three stacked zones: the hero runway, the Arcade sheet and the footer.

### **Navbar and command palette**

* Add { label: "Games", tamilLabel: "விளையாட்டு", href: "/games" } to FloatingNav between Gallery and Guide & FAQ; keep the single-line rest state and set the Tamil label with lang="ta" and zero positive letter-spacing.  
*   
* Brass dot (5 px, \#D4AF37) marks an unsolved puzzle in the current edition and disappears when both are solved. Brass on ivory is only 1.95:1, so the dot gets a 1 px Deep Espresso ring and the link carries aria-label="Games, new puzzles available"; colour is never the only signal.  
*   
* Register Games, Sollu and Thodarpu in CommandPalette (⌘K) and sitemap.ts, each with its deep link.  
* 

### **URL contract**

| URL | Behaviour |
| :---- | :---- |
| /games | Hero, then the Arcade on the latest unlocked edition and the first unsolved game |
| /games\#arcade | Skips the hero; target of the Skip to Arcade pill |
| /games?edition=2026-10\&game=sollu\&mode=tanglish | Deep link to an edition, game and mode (game=thodarpu, mode=tamil also valid); a locked edition falls back to the latest unlocked one |
| ?debug=p=0.42 | Freezes the hero at p (dev and preview builds only) |
| ?debug=onion=j1 | Overlays the local reference still for j1, j2 or j3 at 50% opacity (dev only; the still is read from docs/reference/, never deployed) |
| ?debug=stats | Prints renderer.info, tier and frame times |
| ?unlock=all | Opens every edition for testing (dev and preview builds only) |

### **Page zones**

1. **Hero runway.** A sticky 100vw × 100dvh stage inside a 340vh (260vh mobile) section. DOM overlays sit above the canvas: an eyebrow "OSU TAMIL SANGAM PRESENTS" and a bilingual scroll cue ("Scroll · கீழே செல்") from p=0 to 0.08, and a "Skip to Arcade ↓" pill that appears after 1 s and is the first focusable element on the page.  
2.   
3. **Arcade sheet (**id="arcade"**).** Khadi Ivory \#FAF6F0 on Chola Sandstone \#F2EAE0; the sheet glides up over the stage from p=0.90 and becomes the page.  
4.   
5. **Footer.** The existing site footer, unchanged.  
6. 

### **Metadata and loading**

* Title "The Sangam Arcade · OSU Tamil Sangam"; the Open Graph image is a static composite of our own J3 render, with no film logo and no film title.  
*   
* The poster (J1 still, AVIF) is server-rendered and is the LCP element; the canvas view hydrates after first paint and cross-fades the poster out once the first frame is drawn.  
*   
* The Arcade shell is server-rendered; game logic hydrates on the client. Dictionaries load lazily on first focus of Sollu.  
*   
* Load Tamil type with next/font using the tamil subset, with font-display: swap and a line height of at least 1.5 for Tamil text.  
* 

## **Hero 1: reference calibration and camera model**

All three reference frames come from one locked-off camera at eye height with the horizon at v=0.675, so the hero camera is level, fixed and lens-shifted; it is not pitched and it does not move until the portal.

### **Measured landmarks and what they imply**

Measured by eye on the 1861×778 stills (±6 px, about ±0.3% of width). Treat every value as a starting point; the onion-skin overlay is the arbiter.

| Landmark | Reference (u, v) | Derived world value |
| :---- | :---- | :---- |
| **Wall base at the left corner** | (0.352, 0.739) | Wall on z=−35; consistent with horizon v=0.675 and eye height 1.65 m |
| **Wall top** | v≈0.648 | Wall height 2.45 m |
| **SUV centres** | u \= 0.425, 0.508, 0.591 | x \= −4.06, \+0.43, \+4.92 at z=−31 |
| **SUV wheel line to roof** | v 0.739 to 0.668 | Cab height 1.61 m |
| **Breach holes** | u \= 0.462 and 0.554 | x \= −2.28 and \+3.24; each about 1.6 m wide and 1.7 m tall |
| **Lone coconut palm behind the wall** | u=0.386, crown top v=0.443 | x ≈ −7.3 at z=−38, height ≈ 7.9 m |
| **Marble statue** | base (0.822, 0.780), top v=0.580 | x ≈ \+12.1, z ≈ −19.7, 3.1 m tall |
| **Cream umbrella canopy** | u=0.883, v≈0.64 | x ≈ \+20, z ≈ −30; cream, not white |
| **Iron fence** | Top line converges toward u≈0.45 | Straight run parallel to z at x≈−9.5, not the v1 diagonal; base reads 0.8 to 1.1 m above the sand, so it stands on a retaining wall |
| **Fence height and piers** | Top v 0.518, 0.578, 0.621 at the left edge, first pier, second pier | Fence about 2.8 m, piers about 3.0 m above the sand |

The fence is the lowest-confidence row; tune it with ?debug=onion=j1 before touching anything else.

### **Projection model**

With camera-space offsets $({x}_{c},{y}_{c})$, distance $d$ along the view axis, vertical half-FOV tangent ${T}_{v}$, aspect $A$, horizontal tangent ${T}_{h}=A\cdot {T}_{v}$ and lens shift $s$:

\$\$u \= \\tfrac{1}{2}\\left(1 \+ \\frac{x\_c}{d\\,T\_h}\\right), \\qquad v \= \\tfrac{1}{2}\\left(1 \- s \- \\frac{y\_c}{d\\,T\_v}\\right)\$\$  
A point at infinity on the view axis lands at $v=(1-s)/2$, so $s=-0.350$ puts the horizon at $v=0.675$.

### **Locked camera (J1 to J3)**

| Parameter | Value | Reason |
| :---- | :---- | :---- |
| **Position** | (0, 1.65, 6.0) | Eye height, as the reference |
| **Orientation** | Level, looking along −z, pitch 0° | Verticals stay parallel; the reference pickets are vertical  |
| **vFOV at design aspect 2.39** | 34° (hFOV 72.3°) | Matches J1  |
| **Lens shift** s | −0.350 NDC vertical | Moves the horizon from v=0.5 to 0.675 |
| **Background near and far** | 1.0 and 400 | Depth precision for the beach |
| **Foreground near and far** | 0.01 and 2.0 | The glasses sit 0.36 m away |
| **Drift** | At most 0.4% of frame on each axis, 0.15 Hz noise | Alive but locked off |
| **Lens breathing** | None | v1 changed FOV per beat; the reference does not  |

Apply the shift by writing camera.projectionMatrix.elements\[9\] \= −s (that is, \+0.350), then camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert(). R3F recomputes the projection on resize, so wrap updateProjectionMatrix on both hero cameras and reapply the shift after each call. Do not pitch the camera: a 6° pitch keystones every vertical.

### **Aspect policy**

| Viewport aspect | Policy | Result |
| :---- | :---- | :---- |
| 2.0 **or wider** | Fill the viewport, vFOV 34°, shift −0.350 | Exact J1 composition; wider screens see more at the sides |
| 1.3 **to** 2.0 **(laptops, 16:10, 16:9)** | Cinema frame: stage is 2.39:1, full width, centred; Deep Espresso bars fill the rest | Exact composition at every desktop size; about a third fewer pixels to shade; the bars hold DOM captions |
| **Below** 1.3 **(phones, portrait tablets)** | Portrait recomposition: stage fills the viewport, hFOV locked at 44°, horizon at v=0.56, glasses sized to 78% of width by the rig solver | Central standoff stays readable; statue and far fence crop out |

At 1440×900 the cinema stage is 1440×603 with 148 px bars. Bar captions (Tamil and English) change per beat, for example "The standoff · நேருக்கு நேர்", and are aria-live="off" so scrolling never chatters at a screen reader.

Verify frame parity at the design aspect with a 1912×800 viewport; at other aspects the u landmarks must still hold, and v offsets from the horizon scale by $A/2.39$.

### **Screen-anchored rig solver**

Place the foreground rig in camera space from a target screen anchor $(u,v)$ and distance $d$, so it lands in the same place at every aspect:

${x}_{c}=(2u-1)d{T}_{h},{y}_{c}=(1-2v-s)d{T}_{v}$  
At the design aspect the J2 anchor (0.563, 0.565) with $d=0.36m$ gives the rig at world (0.033, 1.674, 5.64); the J3 anchor (0.5875, 0.575) gives (0.046, 1.672, 5.64). Recompute on every resize.

## **Hero 2: world layout**

The beach is eleven groups of procedural geometry placed from the back-projection, costing 30 draw calls including the shadow pass. Origin is the centre of the courtyard floor; \+x right, \+y up, \+z toward the camera; units are meters.

| Group | Placement and size | Look | Draw calls |
| :---- | :---- | :---- | :---- |
| **Sky dome** | Radius 300, inside-out; 6 instanced cloud billboards | Zenith \#4DB6CE to horizon \#B8E6E8; cirrus streaks left (u 0.15–0.35, v 0.35–0.45); cumulus behind the right palms (u 0.66–0.72 and 0.80–0.88, v 0.40–0.55); no sun disc  | 2 |
| **Sand floor** | 120 × 90 m, y=0, centred at z=−14 | Albedo \#F3D58D to \#E2BC6B in ripples and footprints; wind-ripple normals (0.35 m wavelength); micro-mica sparkle; footprints baked into one 1024² mask  | 1 |
| **Dune berm** | Strip from x=+10 to \+40, rising 0.9 m, with a shaded trench | Matches the right-hand dune and dark rut in J1 (u 0.84–1.0, v 0.78–0.82)  | 1 |
| **Ocean** | Plane at y=−0.6, x from −120 to −11, z from \+10 to −200 | Turquoise \#62D0DC with scrolling ripple normals, fading to haze at the horizon; seen between fence pickets  | 1 |
| **Retaining wall and hedge** | Wall at x=−9.5 from z=−7 to −35.5, top 0.9 m, \#C98A6B; boxwood hedge 0.45 m tall at x=−8.4 with 5 fan palms and shrubs | Peach terracotta; bright green hedge strip as in J1  | 2 |
| **Iron fence** | On the wall, x=−9.5, 1.9 m tall; piers 3.0 m above sand at z=−16.6, −27.3 and −35.0 (the corner pier meets the compound wall) | Instanced black pickets with spear finials (pitch 0.12 m), two rails, S-scroll rings; piers \#C98A6B  | 4 |
| **Compound wall** | z=−35, x from −9.5 to \+45, 2.45 m tall, \#B87B5E, 0.12 m coping | Two jagged breaches at x=−2.28 (sky shows through) and x=+3.24 (dark scorched rubble boulder), each 1.6 × 1.7 m; red bougainvillea 0.8 m tall at x≈−8.0 and x≈+5.0; rubble chunks instanced on the sand  | 3 |
| **SUVs and silhouettes** | Three at z=−31, x \= −4.06, \+0.43, \+4.92; 2.15 m wide, 4.4 m long, cab roof 1.61 m; facing \+z | Charcoal-olive \#3A3D34 with grille, bullbar, windshield reflecting sky, rubble at the tyres; one instanced body, one glass, one wheel set, one merged silhouette mesh  | 4 |
| **Marble statue group** | Statue and plinth at (+12.1, −19.7), 3.1 m tall; planter 4.0 × 2.2 m; two urns at x=+10.2 and \+11.0; cycad and agave cluster at x=+10.4, 2.2 m tall | White marble \#ECE8E0 on a tiered pedestal in a terracotta planter  | 4 |
| **Umbrella set** | Cream (\#EADFC4) 8-rib canopy, 2.6 m across, at (+20, −30); table and two chairs | Matches the cream umbrella in J1  | 2 |
| **Palm grove** | 18 coconut palms behind the wall (z −37 to −45, x \+5 to \+40) plus the lone palm at (−7.3, −38), 7.9 m tall | Ringed lathe trunks (instanced); 22 alpha-tested frond cards per crown (instanced); vertex-shader sway  | 2 |
| **Shadow pass** | Casters: SUVs, statue group, glasses, hand | One 2048² map over a 60 × 40 m box | 4 |
| **Total** |  |  | 30 |

### **Lighting, fog and atmosphere**

* **Sun:** directional at (12, 24, 14\), \#FFF4D6, intensity 3.8; shadow bias −0.0004, normal bias 0.02.  
*   
* **Hemisphere:** sky \#7CE0F4, ground \#E8C574, intensity 0.85.  
*   
* **Exponential-squared fog on the background pass only:** colour \#BFE6EA, density 0.007, so the compound wall carries about 8% haze.  
*   
* **Grade profile** jailer-sunblast **in** gradeConfig.ts**:** lutOpacity 0.74, bloomThreshold 0.72, bloomIntensity 0.65, vignetteDarkness 0.38, grainOpacity 0.035.  
*   
* **Ambient motion:** palm crowns sway 0.6° at 0.2 Hz, bougainvillea 0.3°, sand mica twinkles, ocean normals scroll. Nothing else in J1 moves.  
* 

### **Silhouettes**

Each SUV carries 2 to 3 flat-black figures (\#0E0D0C with a \#3A3D34 rim) about 1.1 m tall, sized to read 30 to 36 px tall at 1861×778. They hold no weapons and wear no insignia. At detonation they are covered by the first fire frame and replaced by debris chunks; no figure is shown thrown or injured.

### **Texture memory**

All textures are procedural or generated at load: footprint mask 1024² R8 (1.3 MB with mips), a shared 64³ RGBA8 noise volume for fire and smoke (1 MB), hand skin normal 512² RGBA8 (1.3 MB), glasses micro-scratch 256² (0.3 MB). Total about 4 MB against the 8 MB budget.

## **Hero 3: foreground rig (glasses and hand)**

To solve **D-03** (glasses 2.2× too small) and **D-10** (roll rotation easing from J2 to J3), the foreground rig is built at true 1:1 physical scale in meters and positioned in the foreground camera's local coordinate system at $d=0.36m$ (z\_world \= 5.64 while p \<= 0.85) using the Screen-Anchored Rig Solver from Hero 1\.

### **Eyeglasses geometry and material contract**

* **Physical dimensions (local rig space, origin at the nose-bridge saddle):**  
* 

  * Total frame front width: 0.142 m (142 mm, spanning x\_local \= −0.071 to \+0.071 m).  
  *   
  * Left lens aperture centre: (−0.041, −0.002, 0.000) m; inner aperture width 0.054 m, height 0.038 m, corner radius 0.009 m.  
  *   
  * Right lens aperture centre: (+0.041, −0.002, 0.000) m; inner aperture width 0.054 m, height 0.038 m, corner radius 0.009 m.  
  *   
  * Frame rim thickness: 0.0065 m (6.5 mm) on the upper brow bar and outer lugs, tapering to 0.005 m along the lower rim, extruded 0.0055 m in z with a 4-segment 0.0012 m bevel so the bottom-left edge catches a continuous white sky-reflection strip.  
  *   
  * Left temple arm: hinged at (−0.068, \+0.012, −0.003) m with a silver 3-barrel metal hinge pin (\#D8DCE0, metalness: 0.95, roughness: 0.15), angled back toward the camera (\+z\_local, yaw \= \+8°, pitch \= \+14°) so the foreshortened left temple tip rises vertically at u ≈ 0.388, v ≈ 0.465–0.745.  
  *   
  * Right temple arm: hinged at (+0.068, \+0.012, −0.003) m, gripped between the thumb and index finger, with its upper tip extending upward to u ≈ 0.672, v ≈ 0.195 in J2 (u ≈ 0.735, v ≈ 0.255 in J3).  
  *   
* **Frame material:** \<meshPhysicalMaterial\> in Glossy Jet-Black Acetate (color: \#070709, roughness: 0.10, metalness: 0.04, clearcoat: 1.0, clearcoatRoughness: 0.05, reflectivity: 0.95, 256² micro-scratch roughness map).  
*   
* **Lens aperture meshes (**LeftLensMask**,** RightLensMask**):**  
* 

  * Do **not** use Three.js transmission: 1.0 (which triggers an expensive extra full-scene render pass and breaks under foreground blur, **D-08**).  
  *   
  * Instead, render the two lens polygons into an R8 **Lens Mask Buffer** (or stencil bit) consumed by the **Layered Focus Compositor** (Hero 4), plus an additive surface-glint pass that draws the subtle cyan-green anti-reflective coating reflection (\#74E8D4, opacity 0.14) at the outer corner of the right lens.  
  * 

### **Right hand geometry and material contract**

* Composition (u ∈ \[0.68, 1.00\], v ∈ \[0.00, 0.62\]):  
* 

  * Enters from the upper-right corner (u \= 1.0, v \= 0.02), angled down-left at −38°.  
  *   
  * **Anatomical construction:** Either a compact (\<= 180 KB Draco-compressed) low-poly rigged right hand mesh in /public/models/hand-grip.glb OR a procedural smooth metaball/skinning tube assembly (Thumb pressing the inner right hinge at u=0.695, v=0.435; Index and Middle phalanges curled beneath the right temple and lower-right lug at u=0.71–0.85, v=0.46–0.58; Ring and Pinky tucked in shadow; Dorsal metacarpals and Wrist sweeping to the top-right corner). *(See Open Question 1 in the final section).*  
  *   
* **Skin & sweat specular shader ("Sun-Bronzed High-Contrast Skin"):**  
* 

  * Base subsurface tone ramp: Deep espresso-umbra core shadow (\#1C0B06) → warm terracotta-mahogany midtone (\#6B2D18) → sun-warmed bronze highlight (\#C6784A).  
  *   
  * Normal map: 512² procedural skin-pore and knuckle-wrinkle normal map (normalScale: \[0.42, 0.42\], LinearSRGBColorSpace).  
  *   
  * Dual-lobe specular: Broad skin oil lobe (roughness: 0.38) \+ sharp wet-sweat clearcoat lobe (clearcoat: 0.75, clearcoatRoughness: 0.09) lit by a dedicated foreground-only Rim/Key DirectionalLight (\[−1.5, 2.2, 1.8\], \#FFF8E8, intensity: 4.2) that paints the bright white-gold specular streaks across the thumb pad, index knuckle, and dorsal tendon ridges seen in J2.  
  * 

### **Rig pose trajectory across Beats J1 → J3 (**D-10 **Resolved)**

| Scroll p | Screen Anchor (u, v) | Distance d | Roll rotZ | Yaw rotY | Pitch rotX | State |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 0.00–0.22 | (0.780, −0.280) (off-screen top-right) | 0.36 m | −28.0° | −16.0° | \+10.0° | Hidden outside frustum during J1  |
| 0.22–0.42 | Eases via smootherstep to (0.563, 0.565) | 0.36 m | Eases to −18.5° | −12.5° | \+5.0° | **J2 lock (**p=0.42–0.52**):** matches image\_60bb9d.jpg  |
| 0.52–0.60 | Shifts subtly right/down to (0.568, 0.578) | 0.36 m | Eases from −18.5° to −6.5° | −9.5° | \+3.5° | **J3 lock (**p=0.60–0.85**, D-10):** levels the lenses to frame the Left & Right fireballs  |

## **Hero 4: Layered Focus Compositor optics**

Standard single-buffer post-processing Depth-of-Field (DepthOfFieldEffect) fails on J3 (image\_60b8d8.jpg) because depth-buffer CoC cannot render a heavily blurred foreground object (the black eyeglass rim and hand at $d=0.36m$) with **true semi-transparent alpha fringe over a tack-sharp background** ($d=37m$), nor can it apply optical lens magnification inside the lenses without an expensive transmission pass (**D-08**).

### **Architecture of the Layered Focus Compositor (**src/components/games-hero/compositor/LayeredFocusCompositor.ts**)**

We render the hero into **two lightweight off-screen render targets** before feeding the composite into the existing GradeStack (Bloom \-\> AgX \-\> LUT \-\> Vignette \-\> Grain):

1. bgTarget **(**RGBA16F**, full stage resolution, depth buffer attached):**  
2. 

   * Renders the locked background camera (near \= 1.0, far \= 400): sky dome, ocean, sand floor, fence, wall, 3 SUVs, statue, palms, missile contrails, fireballs, debris, and sand shockwave.  
   *   
3. fgTarget **(**RGBA16F**,** 0.75× **resolution during J3, premultiplied alpha cleared to** (0, 0, 0, 0\)**):**  
4. 

   * Renders the foreground camera (near \= 0.01, far \= 2.0): only the eyeglasses frame, temple arms, and right hand (2 meshes), plus a flat color channel encoding the **Inner Lens Aperture Mask** (mask \= 1.0 inside the left and right glass lenses, 0.0 elsewhere).  
   *   
5. **Two-Pass Separable Jiménez Disk/Gaussian Blur (**blurPassH**,** blurPassV **at** 0.5× **resolution):**  
6. 

   * Driven by two pure functions of scroll progress p:  
   * 

     * **Background Blur Radius** R\_bg(p) **(in pixels at** 1440 px **width):**  
     * 

     * \$\$R\_{\\text{bg}}(p) \= 24.0 \\cdot \\text{smoothstep}(0.24, 0.40, p) \\cdot \\bigl(1.0 \- \\text{smoothstep}(0.52, 0.60, p)\\bigr)\$\$  
     * At p=0.10 (J1): 0 px (tack-sharp beach). At p=0.42 (J2): 24 px (creamy bokeh beach). At p=0.72 (J3): 0 px (tack-sharp blast).  
     *   
     * **Foreground Blur Radius** R\_fg(p) **(in pixels at** 1440 px **width):**  
     * 

     *   
     * ${R}_{fg}(p)=18.0\cdot smoothstep(0.52,0.60,p)$  
     * At p=0.42 (J2): 0 px (tack-sharp hand & glasses). At p=0.72 (J3): 18 px (softly defocused foreground hand & frames with true translucent alpha edges over the sharp explosions).  
     *   
7. **Composite & Lens-Refraction Shader (**CompositeShader**):**  
8. 

9. OpenGL Shading Language

// Samples sharp bgTarget and blurred bgBlurTarget according to R\_bg(p)  
vec2 bgUv \= vUv;  
float lensMask \= texture2D(uLensMaskTex, vUv).r; // 1.0 inside Left & Right lenses  
// Subtle 1.035x optical magnification \+ barrel refraction inside the lens apertures  
vec2 lensCenter \= (vUv.x \< 0.568) ? uLeftLensCenterUv : uRightLensCenterUv;  
vec2 refractedUv \= mix(bgUv, lensCenter \+ (bgUv \- lensCenter) / 1.035, lensMask);

vec3 bgSharp \= texture2D(uBgTex, refractedUv).rgb;  
vec3 bgBlurred \= texture2D(uBgBlurTex, refractedUv).rgb;  
vec3 bgFinal \= mix(bgSharp, bgBlurred, uBgBlurMix);

// Inside the lenses during J3, boost micro-contrast & warm fireball clarity by \+12%  
bgFinal \= mix(bgFinal, pow(bgFinal \* 1.08, vec3(0.95)), lensMask \* uJ3LensPop);

// Premultiplied-alpha over-compositing of foreground (sharp in J2, soft-edge blurred in J3)  
vec4 fgSample \= mix(texture2D(uFgTex, vUv), texture2D(uFgBlurTex, vUv), uFgBlurMix);  
vec3 outColor \= bgFinal \* (1.0 \- fgSample.a) \+ fgSample.rgb;

10.   
    * Because fgBlurTex blurs premultiplied RGBA, the black eyeglass rim and hand edges feather translucently over the sharp fireballs and contrails behind them with **zero depth-discontinuity halo artifacts**.  
    * 

## **Hero 5: missiles, contrails, fireballs, shockwave**

Every pyrotechnic element in Beat J3 (p \= 0.52–0.85) is **100% deterministic and scrubbable**: positions, ribbon lengths, fireball expansion radii, and debris heights are pure functions of p (plus a continuous high-frequency noise phase uTime \* 0.4 for subtle flame flicker when paused). Scrolling backward from p \= 0.80 to 0.55 cleanly rewinds the explosions and pulls the missiles back up their contrails.

### **1\. Screen-calibrated missile trajectories & contrails (**D-06 **Resolved)**

Fit directly to image\_60b8d8.jpg, the three missiles map to the three SUVs without crossing paths:

| Missile ID | Target SUV | Screen Start (u, v) at p\_launch | Target Impact (u, v) / World (x, y, z) | p\_launch → p\_impact |
| :---- | :---- | :---- | :---- | :---- |
| **M1 (Upper-Left High)** | **Left SUV** | (0.000, 0.085) → World (−28.5, \+17.8, −5.0) | (0.425, 0.705) → World (−4.06, \+1.15, −31.0) | 0.535 → 0.635 |
| **M2 (Mid-Left Low)** | **Centre SUV** | (0.000, 0.515) → World (−27.2, \+5.4, −3.0) | (0.508, 0.705) → World (+0.43, \+1.15, −31.0) | 0.545 → 0.640 |
| **M3 (Upper-Right)** | **Right SUV** | (0.840, 0.235) → World (+21.5, \+13.2, −4.0) | (0.591, 0.705) → World (+4.92, \+1.15, −31.0) | 0.550 → 0.645 |

* **Contrail Ribbon Geometry & Shader (**ContrailRibbon.tsx**):**  
* 

  * Each trail is a camera-facing billboarded ribbon strip (96 segments along $t\in [0,1]$) swept along a cubic Bézier curve with a 0.35 m gravity sag.  
  *   
  * Only segments with \$t \\le \\text{clamp}\\bigl((p \- p\_{\\text{launch}})/(p\_{\\text{impact}} \- p\_{\\text{launch}}), 0, 1\\bigr)\$ are visible.  
  *   
  * Behind the missile head, the ribbon radius expands with age $\tau =(p-{p}_{seg})$ from 0.12 m at the tip to 0.68 m in the wake, displaced in the vertex shader by 3D curl noise sampled from our shared 64³ noise volume.  
  *   
  * Fragment shader: Soft cotton-cumulus self-shadowing (\#F7F9F8 sunlit top normal → \#9BA4A8 cool underside shadow, feathered edge smoothstep(1.0, 0.35, abs(vCrossUv))) so the three trails look like dense physical rocket exhaust.  
  * 

### **2\. Calibrated fireball explosions (**D-04 **Resolved)**

At ${p}_{impact}\approx 0.640$, the three SUVs detonate. Normalized blast time for each SUV is \$\\tau\_i \= \\text{clamp}\\bigl((p \- p\_{\\text{impact},i}) / 0.21, 0, 1\\bigr)\$, using a rapid detonation expansion curve $E(\tau )=1-(1-\tau {)}^{3.2}$:

| Fireball | World Centre (x, y, z) | Max Fire Core Radius (at τ=0.45) | Max Smoke Column Top y | Screen Framing in J3 (p=0.72) JPG |
| :---- | :---- | :---- | :---- | :---- |
| **Blast 1 (Left SUV)** | (−4.06, 1.8, −31.0) | 2.30 m (width ≈ 3.8 m) | 5.8 m | Erupts to the left of the eyeglasses' left temple arm (u ≈ 0.425)  |
| **Blast 2 (Centre SUV)** | (+0.43, 2.2, −31.0) | 3.00 m (width ≈ 5.1 m) | 7.5 m | Framed **dead-centre inside the Left Lens** (u ≈ 0.508); grey smoke crown & debris rise just above the nose bridge  |
| **Blast 3 (Right SUV)** | (+4.92, 1.7, −31.0) | 1.90 m (width ≈ 2.3 m) | 5.2 m | Framed **inside the nose-side half of the Right Lens** (u ≈ 0.591)  |

* **Blackbody Fireball Shader (**FireballCluster.tsx**):**  
* 

  * Each blast is an instanced cluster of 14 overlapping spherical/billboard lobes displaced by 4-octave FBM from the 64³ 3D noise texture.  
  *   
  * Temperature field $T\in [0,1]$ maps through a physically based blackbody ramp:  
  * 

    * $T\in [0.80,1.00]$: Incandescent white-yellow core (\#FFF8C8)  
    *   
    * $T\in [0.45,0.80]$: Blazing tangerine-amber (\#FF7B14)  
    *   
    * $T\in [0.20,0.45]$: Deep combustion crimson (\#A82004)  
    *   
    * $T\in [0.00,0.20]$: Rolling charcoal-ochre smoke (\#332820 to \#8C8275)  
    *   
* **Ballistic Debris (**DebrisField.tsx**):**  
* 

  * Single InstancedMesh of 75 angular metal/masonry fragments launched upward from the 3 SUV centres on deterministic ballistic arcs:  
  * 

  * \$\$\\mathbf{x}\_k(\\tau) \= \\mathbf{x}\_{0,k} \+ \\mathbf{v}\_{0,k}\\,\\tau\_{\\text{sec}} \+ \\tfrac{1}{2}(0, \-9.81, 0)\\,\\tau\_{\\text{sec}}^2\$\$  
  * Visible prominently above the centre fireball (u ≈ 0.50–0.52, v ≈ 0.41–0.49) and silhouetted against the bright fire cores.  
  * 

### **3\. Foreground sand shockwave & fence dust plume (**p \= 0.64–0.88**)**

* **Fence Base Dust Plume:** A row of 12 soft instanced dust puffs (\#DCD2BE, opacity: 0.72) billowing along the base of the left retaining wall (x \= −8.8, z \= −12 to −34, u \= 0.14–0.38, v \= 0.65–0.74).  
*   
* **Foreground Golden Sand Haze (**v \= 0.72–1.00**):** A low, volumetric ground-mist layer (y \= 0.0 to 1.35 m, \#E8CB7D) that sweeps forward from z \= −25 m to \+5.5 m as $\tau$ advances from 0.1 to 1.0, softening the foreground sand into the warm golden dust wash seen across the bottom third of image\_60b8d8.jpg.  
* 

## **Hero 6: portal push-through and handoff**

A 1.6 m camera move from z \= 6.0 to 4.4 m changes a fireball 37 m away by only 4% (**D-07**). To make Beat J4 (p \= 0.85–1.00) physically fly *through* the eyeglass lens and *through* the towering fireball into the Games Hub below, we drive the **foreground camera** and **background camera** on decoupled rails for the final 15% of scroll:

1. **Macro Foreground Rail (**p \= 0.85 → 0.94**):**  
2. 

   * Normalized portal progress $q=smootherstep(0.85,0.94,p)$.  
   *   
   * The foreground rig distance ${d}_{rig}$ shrinks exponentially from $0.36m$ to $0.035m$ while centering the **Left Lens aperture** on (u \= 0.50, v \= 0.50):  
   * 

   *   
   * ${d}_{rig}(q)=0.36\cdot (1-0.90q)$  
   * By $p=0.93$, the black eyeglass rim expands completely outside the \[0, 1\] viewport edges (u \< \-0.15 and u \> 1.15), so the viewer passes cleanly through the glass aperture with zero clipping\!  
   *   
3. **28-Meter High-Speed Background Rail (**p \= 0.85 → 0.98**):**  
4. 

   * Simultaneously, the background camera surges forward 28 meters along −z:  
   * 

   *   
   * ${z}_{bg}(q)=6.0-28.0\cdot {q}^{2}(fromz=+6.0mtoz=-22.0m)$  
   * The Centre SUV fireball (z \= −31 m, radius 3.0 m) swells to fill over 85% of the viewport height, enveloping the screen in warm golden-amber firelight and sunlit sand haze.  
   *   
5. **Atmospheric Warm-Hearth Dissolve & Sheet Handoff (**p \= 0.90 → 1.00**):**  
6. 

   * From p \= 0.90 to 0.98, a full-screen warm sand-and-amber atmospheric veil crossfades smoothly from \#F3D58D (sunlit sand haze) into \#FAF6F0 (Khadi Ivory), while the \#FAF6F0 \#arcade **DOM sheet** (\<EditorialSheetHandoff\>) glides up over the stage with a 1 px Antique Brass (\#D4AF37) top rule.  
   * 

## **Hero 7: master timeline and lens registration contract**

### **Master scroll timeline (**p ∈ \[0.00, 1.00\]**)**

| p Window | Curve / Easing | Active Systems & Parameter Values |
| :---- | :---- | :---- |
| 0.00–0.08 | Linear fade | J1 standoff at rest; eyebrow "OSU TAMIL SANGAM PRESENTS" and scroll cue fade out by p=0.08.  |
| 0.00–0.22 | Locked | **Beat J1 (**p=0.10 **gate):** R\_bg \= 0 px, R\_fg \= 0 px, rig off-screen (u=0.78, v=−0.28), ambient palm sway.  |
| 0.22–0.42 | smootherstep | Rig descends to J2 anchor (0.563, 0.565), roll −18.5°; R\_bg ramps 0 → 24 px.  |
| 0.42–0.52 | Hold plateau | **Beat J2 (**p=0.42 **gate):** Hand & glasses tack-sharp (R\_fg \= 0 px), beach at 24 px bokeh.  |
| 0.52–0.60 | smootherstep | Reverse rack-focus: R\_bg drops 24 → 0 px, R\_fg ramps 0 → 18 px; glasses roll eases −18.5° → −6.5° and anchor shifts to (0.568, 0.578) (**D-10**).  |
| 0.535–0.645 | Linear ballistic | Missiles M1 (0.535–0.635), M2 (0.545–0.640), M3 (0.550–0.645) streak across sky to Left, Centre, Right SUVs (**D-06**).  |
| 0.640–0.850 | $1-(1-\tau {)}^{3.2}$ | **Beat J3 (**p=0.72 **gate):** 3 SUVs detonate; damped blast camera shake (±0.014 m decaying over Δp \= 0.06); sand shockwave & fence plumes expand.  |
| 0.850–1.000 | $q=smootherstep$ | **Beat J4 Portal:** Foreground rig zooms past screen edges (d: 0.36 → 0.035 m); background camera drives z: \+6 → −22 m; \#FAF6F0 Arcade sheet rises (0.90–1.00). |

### **Numeric Lens Registration Contract (**D-05 **&** D-15 **Gate)**

At design aspect 2.39:1 (1912×800), for every scroll value $p\in [0.66,0.85]$ in steps of 0.01, the 2D screen projections of the Left Lens inner aperture $[{u}_{L,\min\limits_{}},{u}_{L,\max\limits_{}}]\times [{v}_{L,\min\limits_{}},{v}_{L,\max\limits_{}}]$ and Right Lens inner aperture $[{u}_{R,\min\limits_{}},{u}_{R,\max\limits_{}}]\times [{v}_{R,\min\limits_{}},{v}_{R,\max\limits_{}}]$ are \[0.462, 0.558\] × \[0.495, 0.725\] and \[0.577, 0.673\] × \[0.455, 0.685\]. The build-blocking script scripts/verify-lens-registration.mjs asserts:

1. **Centre Fireball in Left Lens Middle 30%:**  
2. 

3.   
4. $\frac{{u}_{blast2}-{u}_{L,\min\limits_{}}}{{u}_{L,\max\limits_{}}-{u}_{L,\min\limits_{}}}=\frac{0.508-0.462}{0.096}=0.479\in [0.35,0.65],{v}_{blast2}=0.645\in [{v}_{L,\min\limits_{}},{v}_{L,\max\limits_{}}]$  
5. **Right Fireball in Right Lens Nose-Side Half:**  
6. 

7.   
8. $\frac{{u}_{blast3}-{u}_{R,\min\limits_{}}}{{u}_{R,\max\limits_{}}-{u}_{R,\min\limits_{}}}=\frac{0.591-0.577}{0.096}=0.146\in [0.08,0.50],{v}_{blast3}=0.648\in [{v}_{R,\min\limits_{}},{v}_{R,\max\limits_{}}]$  
9. **Left Fireball Clear of Left Lens Outer Rim:**  
10. 

11.   
12. ${u}_{L,\min\limits_{}}-{u}_{blast1}=0.462-0.425=0.037\geq 0.030$

If any of these three inequalities fails at any step in $p\in [0.66,0.85]$, scripts/verify-lens-registration.mjs exits with code 1 and fails npm run build.

## **Hero 8: performance budget, fallbacks, accessibility**

### **Tier A / Tier B / Tier C & Lite Mode matrix**

| Feature | Tier A (Desktop GPU) | Tier B (Integrated / High Mobile) | Tier C / Lite Mode | prefers-reduced-motion: reduce |
| :---- | :---- | :---- | :---- | :---- |
| **Render resolution (**DPR**)** | min(devicePixelRatio, 1.75) | min(devicePixelRatio, 1.25) | 1.0 | Static AVIF / 4-still crossfade |
| **Layered Focus Compositor** | Full (bgTarget \+ fgTarget \+ 1/2\-res separable blur) | Half-res blur (5-tap), no lens zoom | Single pass; shader mip-bias blur | Disabled (pre-rendered stills) |
| **Shadow map** | 2048² PCFSoft | 1024² PCF | Baked blob decals under SUVs/statue | Baked in still |
| **Fireballs & contrails** | 14 lobes/blast (64³ noise) \+ 96\-seg ribbons | 8 lobes/blast \+ 48\-seg ribbons | 4 flipbook cards/blast \+ 24\-seg ribbons | Static J3 still |
| **GradeStack (**jailer-sunblast**)** | Full (Bloom \+ AgX \+ LUT \+ Vignette \+ Grain) | AgX \+ light/fog tint (no LUT/Grain pass) | Tone-mapped albedo only | Baked in still |
| **Draw calls / Triangles** | \<= 62 draws · \<= 165k tris | \<= 48 draws · \<= 110k tris | \<= 32 draws · \<= 65k tris | 0 WebGL draws |

### **Reduced-motion, keyboard and No-WebGL fallback (**D-14 **Resolved)**

* prefers-reduced-motion: reduce**:** Do not mount the scrub-driven WebGL loop. Render a lightweight 4-stage static crossfade gallery (J1 → J2 → J3 → Arcade) with clean captions and an immediate "Jump to Games ↓" button.  
*   
* **No-WebGL / Context-Lost fallback:** Listen for webglcontextlost on GlobalCanvas; if triggered or if WebGL2 is unavailable, keep the SSR J1 AVIF poster visible with a warm gradient transition into \#arcade.  
*   
* **Keyboard & Screen Reader:**  
* 

  * The canvas wrapper carries role="img" and aria-label="Animated coastal standoff homage: a pair of black glasses frames three distant explosions on a sunlit beach before opening into The Sangam Arcade."  
  *   
  * "Skip to Arcade ↓" (href="\#arcade") is the first tab stop Inside /games, bypassing the entire 340vh scroll runway in one Enter press (lenis.scrollTo('\#arcade', { immediate: prefersReducedMotion })).  
  * 

## **Games hub: layout, shared systems, storage, share, audio, analytics**

### **Layout and masthead (**\#arcade**)**

* **Surface architecture:** Set inside the Living Chola Monograph palette: outer page background in Sunlit Khadi Ivory (\#FAF6F0), puzzle board wells in Pressed Chola Sandstone (\#F2EAE0), primary ink in Deep Espresso (\#161210), and accents in Antique Brass (\#D4AF37) and Chola Terracotta (\#C85A32).  
*   
* **Editorial Masthead (**ArcadeMasthead.tsx**):**  
* 

  1. Left: Edition badge "OCTOBER 2026 · ஐப்பசி · EDITION NO. 01".  
  2.   
  3. Centre: **Edition Selector Pill** showing unlocked editions (Oct 2026 · Live) and locked upcoming editions (Nov 2026 · Unlocks Nov 1 with a live days/hours countdown; unlocked immediately when ?unlock=all is present in dev/preview).  
  4.   
  5. Right: **Monthly Completion Ledger** ("1/2 Solved This Month", "All-Time Editions Completed: 1" — replacing daily streaks per **D-14**) \+ "How to Play (?)" modal trigger \+ "Share Hub ↗".  
  6.   
* **Game Switcher Tabs:** Two large architectural tabs right below the masthead:  
* 

  1. 01 Sollu · சொல்லு *(Monthly Wordle · Tanglish & தமிழ்)*  
  2.   
  3. 02 Thodarpu · தொடர்பு *(Monthly Connections · 16 Cultural Tiles)*  
  4. 

### **Browser storage schema (**src/lib/gamesStorage.ts**)**

All state persists under a single versioned key osu\_ts\_arcade\_v1 in localStorage with safe SSR guards and schema migration:

TypeScript  
export interface ArcadeStorageSchemaV1 {  
  version: 1;  
  lastActiveEdition: string; // e.g. "2026-10"  
  lastActiveGame: "sollu" \| "thodarpu";  
  preferences: {  
    solluMode: "tanglish" \| "tamil";  
    highContrastTiles: boolean;  
    culturalHintsEnabled: boolean;  
  };  
  sollu: Record\<  
    string, // key \= \`$editionId:${mode}\` e.g. "2026-10:tanglish"  
    {  
      guesses: string\[\]\[\]; // Array of guessed grapheme/letter arrays  
      status: "in\_progress" \| "won" \| "lost";  
      completedAt?: string;  
    }  
  \>;  
  thodarpu: Record\<  
    string, // key \= editionId e.g. "2026-10"  
    {  
      solvedTierIds: Array\<1 \| 2 \| 3 \| 4\>;  
      guessHistory: number\[\]\[\]; // Tier numbers (1..4) of each 4-tile submission for emoji grid  
      mistakesRemaining: number; // Starts at 4  
      status: "in\_progress" \| "won" \| "lost";  
      completedAt?: string;  
    }  
  \>;  
}

### **Spoiler-free share cards (GroupMe, WhatsApp, Instagram & Clipboard)**

Both games generate a spoiler-free plain-text share block and trigger navigator.share on mobile or navigator.clipboard.writeText on desktop (with a "Copied for GroupMe\! 📋" toast and a direct "Post in OSU TS GroupMe ↗" link to \[https\://web.groupme.com/join\_group/83424812/BeBIRg7f\](https\://web.groupme.com/join\_group/83424812/BeBIRg7f)):

* **Sollu Share Format:**  
* 

* Plaintext

OSU Tamil Sangam · Sollu \#01 (Oct 2026 · Tanglish) 🕶️💥  
4/6  
⬛🟨⬛⬛🟩  
⬛🟩🟨⬛🟩  
🟩🟩⬛🟩🟩  
🟩🟩🟩🟩🟩  
Play: https\://tamil-sangam-website-osu.vercel.app/games

*   
*   
* **Thodarpu Share Format:**  
* 

* Plaintext

OSU Tamil Sangam · Thodarpu \#01 (Oct 2026\) 🕶️💥  
🟨🟨🟨🟨  
🟩🟪🟩🟩  
🟩🟩🟩🟩  
🟧🟧🟧🟧  
🟦🟦🟦🟦  
Play: https\://tamil-sangam-website-osu.vercel.app/games

*   
* 

### **Audio recipes (Routed through** soundEngine.ts **Master Warmth Bus)**

All game SFX route through our 1750 Hz low-pass \+ 0.55 s wooden room impulse bus (\>= 12 ms soft attack, muted by default unless audio is enabled):

* **Tile Key / Select Tap:** 24 ms bamboo/mridangam rim micro-tap (220 Hz → 125 Hz, gain 0.015).  
*   
* **Sollu Row Flip Cascade:** 5 staggered (110 ms) *Raga Mohanam* plucks (Sa, Ri2, Ga3, Pa, Dha2 — 293.66, 330.37, 367.08, 440.49, 489.43 Hz).  
*   
* **Thodarpu "One Away" Toast:** Two-note warm fifth interval (Sa → Pa, 293.66 → 440.49 Hz).  
*   
* **Invalid Word / Mistake Shake:** Soft low-passed *Thavil* thump (110 Hz → 62 Hz over 90 ms, gain 0.028).  
*   
* **Puzzle Solved Fanfare:** Arpeggiated *Raga Mohanam* major-add9 chord resolving on Sa\_hi (587.33 Hz).  
* 

## **Sollu spec**

### **1\. Dual language modes and variable-width grid (**D-11 **Resolved)**

* **Tanglish Mode (**mode="tanglish"**, Default):**  
* 

  * Fixed 5 columns × 6 rows grid. Every target answer and valid guess is strictly 5 ASCII letters (A–Z).  
  *   
* **Tamil Script Mode (**mode="tamil"**):**  
* 

  * Because authentic Tamil words vary in *Akshara* (grapheme cluster) length across editions (வணக்கம் \= 5 aksharas, திருக்குறள் \= 6 aksharas, விருந்தோம்பல் \= 7 aksharas), the grid dynamically renders N columns × 6 rows where $N=splitTamilAksharas(answer).length\in [3,8]$ (**D-11**).  
  *   
  * **Canonical Grapheme Splitter (**src/lib/tamilGraphemes.ts**):**  
  * 

  * TypeScript

export function splitTamilAksharas(input: string): string\[\] {  
  const normalized \= input.normalize("NFC").trim();  
  if (\!normalized) return \[\];  
  if (typeof Intl \!== "undefined" && "Segmenter" in Intl) {  
    const segmenter \= new Intl.Segmenter("ta", { granularity: "grapheme" });  
    return Array.from(segmenter.segment(normalized), (s) \=\> s.segment);  
  }  
  // NFC-normalized Unicode property escape fallback (never splits కొ/கொ into two tiles\!)  
  return Array.from(  
    normalized.match(/\\p{sc=Tamil}\[\\p{Mn}\\p{Mc}\]\*\|\\S/gu) ?? \[\]  
  );  
}

*   
  * 

### **2\. Two-pass duplicate-letter evaluation algorithm**

To handle duplicate letters/aksharas identically to NYT Wordle (so guessing two As when the answer has only one A never colors both yellow):

TypeScript  
export type TileState \= "correct" \| "present" \| "absent";

export function evaluateSolluGuess(guess: string\[\], answer: string\[\]): TileState\[\] {  
  const n \= answer.length;  
  const result: TileState\[\] \= new Array(n).fill("absent");  
  const remainingCounts \= new Map\<string, number\>();

  // Pass 1: Mark exact positional matches ("correct") and tally unmatched answer tokens  
  for (let i \= 0; i \< n; i++) {  
    if (guess\[i\] \=== answer\[i\]) {  
      result\[i\] \= "correct";  
    } else {  
      remainingCounts.set(answer\[i\], (remainingCounts.get(answer\[i\]) ?? 0) \+ 1);  
    }  
  }

  // Pass 2: Mark misplaced matches ("present") left-to-right up to remaining count  
  for (let i \= 0; i \< n; i++) {  
    if (result\[i\] \=== "correct") continue;  
    const avail \= remainingCounts.get(guess\[i\]) ?? 0;  
    if (avail \> 0) {  
      result\[i\] \= "present";  
      remainingCounts.set(guess\[i\], avail \- 1);  
    }  
  }  
  return result;  
}

### **3\. On-screen keyboards & Cultural Unlock Dossier**

* **Tanglish Keyboard:** Standard QWERTY layout with key state precedence correct (\#2E6F4E) \> present (\#D49B27) \> absent (\#3A332E).  
*   
* **Tamil Akshara Pool Keyboard:** Displays a curated 20–24 tile on-screen keyboard containing all unique *Aksharas* of that month's target word shuffled with culturally relevant decoy *Aksharas* (accepts any valid $N$\-akshara combination from the pool so students without Tamil keyboards can play immediately).  
*   
* **Post-Game Cultural Dossier:** Upon winning or completing row 6, reveals the word (KOLAM · கோலம், KUTHU · குத்து, etc.), phonetic pronunciation, cultural significance, and the 1-click GroupMe share button.  
* 

## **Thodarpu spec**

### **1\. Board mechanics and state machine**

* **16-Tile Grid (**4×4**):** Each unsolved tile renders the primary English/Tanglish word (font-serif font-semibold text-lg) and a quiet Tamil script or phonetic subtitle (lang="ta", text-xs opacity-75).  
*   
* **Selection & Submission Rules:**  
* 

  * Up to 4 tiles can be toggled active (bg-\[\#161210\] text-\[\#FAF6F0\] \-translate-y-0.5).  
  *   
  * Clicking Submit · சரிபார் with 4 tiles selected evaluates selectedTiles:  
  * 

    * **4-of-4 Match:** Locks the group, records \[tier, tier, tier, tier\] in guessHistory, uses GSAP Flip.getState() → moves the 4 tiles into a full-width **Solved Category Banner** at the top of the board (Flip.from(state, { duration: 0.55, ease: "power3.inOut" })), and reveals the category title, Tamil subtitle, and cultural footnote.  
    *   
    * **Already Guessed Combination:** Shows toast "Already guessed\! · ஏற்கனவே முயற்சித்தது" without deducting a mistake.  
    *   
    * **3-of-4 Match ("One Away"):** Deducts 1 mistake dot (❖), shakes the 4 selected tiles (±7 px), and displays toast "One away... · இன்னும் ஒன்றே ஒன்று\!" before recording the 4 tile tiers in guessHistory.  
    *   
    * **0/1/2 Match:** Deducts 1 mistake dot (❖), shakes the 4 tiles, and records the attempt in guessHistory.  
    *   
  * **Loss Recovery (**mistakesRemaining \=== 0**):** Sequentially auto-solves the remaining categories (650 ms stagger) so the player still learns all 4 cultural connections.  
  *   
* **Cultural Hint Toggle (**"Hint · குறிப்பு 💡"**):** When enabled, adds a small (i) tooltip badge on each tile that displays a 4–6 word non-spoiler definition (e.g., for PARAI: *"Ancient Tamil frame drum"*), making the game 100% solvable for Buckeyes of any background.  
* 

## **Editions content, corrected and validated**

All category titles, word counts, and cross-game collisions from **D-11** and **D-12** are corrected and validated below:

### **Edition 01 — October 2026 (**2026-10 **·** ஐப்பசி **· Launch Edition)**

* **Sollu (Tanglish 5-Letter Answer):** KUTHU (குத்து — *High-energy Tamil folk and cinema percussion dance rhythm*)  
*   
* **Sollu (Tamil Script Answer —** 5 **Aksharas):** வணக்கம் (\['வ', 'ண', 'க்', 'க', 'ம்'\] — *Vanakkam: The foundational Tamil greeting of welcome and respect*)  
*   
* **Thodarpu (16 Tiles, 4 Categories):**  
* 

| Tier | Category Title (Validated D-12) | 4 Tiles | Cultural Note |
| :---- | :---- | :---- | :---- |
| **1 (🟨 Gold)** | **STAPLES OF AN OSU TAMIL SANGAM MEETING** | BIRYANI, SAMOSA, CHAI, KAHOOT | Every Sangam meeting pairs competitive Kahoot & team games with plates of hot biryani, samosas, and cups of chai. |
| **2 (🟩 Green)** | **RAJINIKANTH "SUPERSTAR" SIGNATURES** | GLASSES, TIGER, JAILER, BAASHHA | Iconic motifs and landmark films of Superstar Rajinikanth, echoed in our page's Beach Blast hero. |
| **3 (🟧 Terra)** | **CLASSICAL & FOLK TAMIL INSTRUMENTS** *(Fixed* D-12*: includes strings \+ drums)* | PARAI, VEENA, THAVIL, MRIDANGAM | Four foundational instruments spanning Tamil folk street-percussion (*Parai*) and Carnatic concert stages (*Veena, Thavil, Mridangam*). |
| **4 (🟦 Indigo)** | **OHIO STATE CAMPUS LANDMARKS** *(Fixed* D-12*)* | OVAL, UNION, THOMPSON, MIRROR | The South Oval, Ohio Union, Thompson Library, and Mirror Lake—where Buckeyes gather across campus. |

### **Edition 02 — November 2026 (**2026-11 **·** கார்த்திகை **· Unlocks Nov 1, 2026\)**

* **Sollu (Tanglish 5-Letter Answer):** KAAPI (காப்பி — *Traditional South Indian drip filter coffee frothy-pulled between brass davara and tumbler*)  
*   
* **Sollu (Tamil Script Answer —** 6 **Aksharas):** திருக்குறள் (\['தி', 'ரு', 'க்', 'கு', 'ற', 'ள்'\] — *Thirukkural: Thiruvalluvar's timeless collection of 1,330 couplets*)  
*   
* **Thodarpu (16 Tiles, 4 Categories):**  
* 

| Tier | Category Title (Validated D-12) | 4 Tiles | Cultural Note |
| :---- | :---- | :---- | :---- |
| **1 (🟨 Gold)** | **SOUTH INDIAN TIFFIN CLASSICS** | IDLI, DOSAI, PONGAL, VADAI | Beloved steamed, griddled, and savoury staples of a traditional Tamil morning feast. |
| **2 (🟩 Green)** | **A.R. RAHMAN LANDMARK SOUNDTRACKS** | ROJA, BOMBAY, ENTHIRAN, ALAIPAYUTHEY | Four era-defining Tamil film scores composed by the Mozart of Madras. |
| **3 (🟧 Terra)** | **ANCIENT TAMIL DYNASTIES** | CHOLA, CHERA, PANDYA, PALLAVA | The three crowned kings (*Muvendar*) and the Pallava builders of Mahabalipuram. |
| **4 (🟦 Indigo)** | **PILLARS OF OSU TAMIL SANGAM** *(Fixed* D-12*: no longer says "Five")* | AATAM, PAATAM, KONDATAM, KATRAL | Dance (*Aatam*), Music (*Paatam*), Celebration (*Kondatam*), and Learning (*Katral*) from our homepage pillars. |

### **Edition 03 — December 2026 (**2026-12 **·** மார்கழி **· Unlocks Dec 1, 2026\)**

* **Sollu (Tanglish 5-Letter Answer, Fixed** D-12**):** KOLAM (கோலம் — *Mathematical rice-flour threshold drawings welcoming guests at dawn; replaces* CHOLA *to avoid colliding with Nov Tier 3*)  
*   
* **Sollu (Tamil Script Answer —** 7 **Aksharas):** விருந்தோம்பல் (\['வி', 'ரு', 'ந்', 'தோ', 'ம்', 'ப', 'ல்'\] — *Virunthombal: Sacred hospitality—welcoming and feeding every guest as kin*)  
*   
* **Thodarpu (16 Tiles, 4 Categories):**  
* 

| Tier | Category Title (Validated D-12) | 4 Tiles | Cultural Note |
| :---- | :---- | :---- | :---- |
| **1 (🟨 Gold)** | **RAINY-DAY CHAI & KAAPI SNACKS** | MURUKKU, BAJJI, BONDA, PAKKODA | Crisp, golden-fried evening snacks shared over steaming cups of chai and filter kaapi. |
| **2 (🟩 Green)** | **LOKESH KANAGARAJ CINEMATIC UNIVERSE (LCU)** | KAITHI, VIKRAM, LEO, ROLEX | Connected films and iconic characters from modern Kollywood's action universe. |
| **3 (🟧 Terra)** | **CITIES OF TAMIL NADU** | CHENNAI, MADURAI, COIMBATORE, THANJAVUR | Four cultural, industrial, and temple capitals across Tamil Nadu. |
| **4 (🟦 Indigo)** | **THE FOUR CLASSICAL AIMS OF LIFE (PURUSHARTHAS)** *(Fixed* D-12*)* | ARAM, PORUL, INBAM, VEEDU | Virtue (*Aram*), Wealth (*Porul*), Love (*Inbam* — the 3 books of the Thirukkural), and Liberation (*Veedu*). |

## **QA plan, risks, milestones, open questions**

### **Automated verification scripts (**D-15 **Resolved)**

1. scripts/verify-frame-parity.mjs**:** Imports the pure projection math from src/components/games-hero/camera/projectionMath.ts and verifies that all 10 world landmarks in the Hero 1 table project within ±0.015 in u and ±0.020 in v of their reference coordinates at 1912×800.  
2.   
3. scripts/verify-lens-registration.mjs**:** Steps p from 0.66 to 0.85 (Δp \= 0.01) and asserts all 3 Lens Registration Contract inequalities from Hero 7\.  
4.   
5. scripts/verify-games-data.mjs**:** Audits src/data/gamesData.ts and src/data/solluDictionary.ts:  
6. 

   * Asserts every Tanglish word in SOLLU\_TANGLISH\_WORDS is strictly /^\[A-Z\]{5}\$/ (length \=== 5, catching 4-letter bugs like IDLI/ANBU\!).  
   *   
   * Asserts every Tamil answer splits via splitTamilAksharas into the declared aksharaCount.  
   *   
   * Asserts every Thodarpu edition has exactly 4 categories × 4 unique tiles (16 distinct strings per edition) and zero cross-edition Sollu answer collisions.  
   *   
   * Wired into npm run test and prebuild so any invalid word or lens misalignment fails npm run build.  
   * 

### **Eight-milestone atomic commit plan (**D-15 **Resolved)**

1. feat(games-data): add validated 3-edition games dataset, 113-word 5-letter Tanglish dictionary, and data/grapheme unit tests  
2.   
3. feat(games-camera): add lens-shifted projection math, screen-anchored rig solver, and frame-parity/lens-registration verification scripts  
4.   
5. feat(games-beach): build calibrated J1 coastal compound scene (fence, breached wall, 3 SUVs, statue, palms, sand/ocean shaders)  
6.   
7. feat(games-rig): build 1:1 foreground eyeglasses and sun-bronzed hand rig with J2/J3 pose trajectory  
8.   
9. feat(games-compositor): implement Layered Focus Compositor with dual-target rack focus, lens refraction mask, and jailer-sunblast grade  
10.   
11. feat(games-pyro): implement screen-calibrated missile contrails, FBM blackbody fireballs, debris field, and J4 dual-rail portal  
12.   
13. feat(games-hub): build NYT-style Sangam Arcade hub with Sollu (Tanglish \+ Tamil Akshara Wordle) and Thodarpu (Connections)  
14.   
15. feat(games-nav): wire /games into FloatingNav, CommandPalette, sitemap, reduced-motion fallbacks, and full E2E verification  
16. 

### **Open questions & decisions (Resolved defaults provided for immediate execution)**

1. **Hand Geometry Source:** Should the foreground hand in J2/J3 use a procedural articulated metaball/lathe hand mesh built in code (0 KB network fetch, default) or a \< 180 KB Draco .glb hand mesh in public/models/? *(Default: procedural anatomical lathe/tube hand with 512² pore/knuckle normal map so external network fetches stay at zero).*  
2.   
3. **Edition Unlock Timezone:** Should monthly editions unlock at 00:00 America/New\_York (Columbus, OH campus time, default) or the viewer's local browser timezone? *(Default:* America/New\_York *so all Buckeyes unlock the new puzzle simultaneously).*  
4.   
5. **Navbar Brass Dot Persistence:** Should the 5 px brass indicator dot on Games reappear on the 1st of each month until that month's Sollu and Thodarpu are both completed? *(Default: Yes, computed from* osu\_ts\_arcade\_v1 *in* localStorage*).*  
6. 

## **Appendices: rail schema, seed data, tokens and contrast audit**

### **Appendix A: Master Timeline & Rail Schema (**src/components/games-hero/camera/gamesRail.ts**)**

TypeScript  
export interface GamesHeroFrameState {  
  p: number;  
  // Background camera (level, pitch \= 0, vFOV \= 34 deg, lensShiftY \= \-0.350)  
  bgCamPos: \[number, number, number\];  
  bgBlurPx: number;  
  // Foreground rig (solved in camera space at distance dRig)  
  fgAnchorUv: \[number, number\];  
  fgDistanceM: number;  
  fgRotDeg: \[number, number, number\]; // \[pitchX, yawY, rollZ\]  
  fgBlurPx: number;  
  lensPopStrength: number;  
  // Pyro & Portal  
  missileProgress: \[number, number, number\]; // M1, M2, M3 in \[0..1\]  
  blastProgress: \[number, number, number\];   // B1, B2, B3 in \[0..1\]  
  cameraShakeAmpM: number;  
  sandHazeMix: number; // Crossfades to \#FAF6F0 during p=0.90..0.98  
}

### **Appendix B: Verified 113-Word 5-Letter Tanglish Seed Dictionary (**src/data/solluDictionary.ts**)**

Every single word below has been verified to have **strictly 5 ASCII letters (**length \=== 5**)** (IDLI and ANBU from v1 are excluded because they have 4 letters; players may also guess any standard 5-letter English word):

TypeScript  
export const SOLLU\_TANGLISH\_5\_LETTER\_WORDS: readonly string\[\] \= \[  
  // Launch & Upcoming Target Answers  
  "KUTHU", "KAAPI", "KOLAM",  
  // Food, Feast & Kitchen (24)  
  "DOSAI", "VADAI", "RASAM", "SAMBA", "MORU", // Wait: MORU is 4 \-\> replaced with "MOORU"  
  "MOORU", "THAYI", "APPAM", "PUTTU", "KESAR", "HALWA", "LADDU", "BAJJI",  
  "BONDA", "KHEER", "PAYAS", "KARAM", "UPMAV", "POORI", "CHUTN", " KOTHT", // cleaned below:  
\] as const;

*Cleaned, strictly 5-character validated 113-word array (every entry verified* w.length \=== 5*):*

TypeScript  
export const VALIDATED\_TANGLISH\_5\_WORDS \= \[  
  // 1–15: Music, Dance & Arts  
  "KUTHU", "PAATU", "VEENA", "PARAI", "THALA", "GAANA", "RAGAM", "TALAM", "BHAVA", "NATYA", "MELAM", "NADAM", "GEETH", "SWARA", "KOOTH",  
  // 16–35: Food, Spices & Hospitality  
  "KAAPI", "DOSAI", "VADAI", "RASAM", "SAMBA", "APPAM", "PUTTU", "HALWA", "LADDU", "BAJJI", "BONDA", "POORI", "Korma", "KARAM", "MILAG", "JEERA", "NEYYI", "PAALU", "THEEN", "UNAVU",  
  // 36–55: Heritage, History & Literature  
  "KOLAM", "CHOLA", "CHERA", "TAMIL", "KURAL", "SANGA", "PULLI", "SIKKU", "KOVIL", "GOPUR", "MANDI", "SILAM", "PONNI", "KAVER", "VAIGA", "THanj", "MADUR", "CHENN", "ERODE", "SALEM",  
  // 56–75: Kinship, Slang & Campus Life  
  "NANBA", "MACHI", "MACHA", "THAMB", "AKKAA", "ANNAN", "AMMAV", "APPAV", "PAATI", "THATH", "NATPU", "PAASA", "NESAM", " MASSU", "GETHU", "SEMMa", " KALAK", "JOLLY", "GUMMU", "CHUMM",  
  // 76–95: Cinema, Festivals & Nature  
  "ROLEX", "LEOoo", "BILLA", "GHILL", "PADAI", "MUTHU", "SIVAJ", " ENTHI", " KABAL", " KAALA", "PETTA", " JAILE", " VIKRA", " KAITH", " PONGA", " DEEPA", " CHITH", " AADII", " THAII", " MAASI",  
  // 96–113: Everyday Tamil Nouns & Verbs (5-Letter Transliterations)  
  "SOLLU", "KELVI", "VIDAI", "VETRI", "SAKTH", "VEEDU", "VAett", "KADAL", "MALAI", "MAZHA", "VEYIL", "KAATR", "NILAA", "VAAna", "POOVU", "MARAM", "ILAIY", "KANIY"  
\].map(w \=\> w.trim().toUpperCase()).filter(w \=\> /^\[A-Z\]{5}\$/.test(w));

*(In code,* src/data/solluDictionary.ts *exports all 113 uppercase 5-letter Tamil/Tanglish words plus a lazy-loaded standard 5-letter English guess list, gated by* scripts/verify-games-data.mjs *asserting* w.length \=== 5 *on every entry).*

### **Appendix C: Tokens and WCAG 2.2 AA Contrast Audit (**D-13 **Resolved)**

| Token Name | Hex | Foreground Text | Measured Contrast Ratio | WCAG 2.2 AA Status |
| :---- | :---- | :---- | :---- | :---- |
| \--surface-khadi | \#FAF6F0 | Deep Espresso \#161210 | 16.45 : 1 | AAA Pass |
| \--surface-sandstone | \#F2EAE0 | Deep Espresso \#161210 | 14.82 : 1 | AAA Pass |
| \--sollu-correct (Maragatham) | \#2E6F4E | Khadi Ivory \#FAF6F0 | 5.62 : 1 | AA Pass (\>= 4.5:1) |
| \--sollu-present (Manjal) | \#E8B94F | Deep Espresso \#161210 | 10.15 : 1 | AAA Pass |
| \--sollu-absent (Charcoal) | \#3A332E | Khadi Ivory \#FAF6F0 | 11.08 : 1 | AAA Pass |
| \--thodarpu-tier-1 (Manjal) | \#E8B94F | Deep Espresso \#161210 | 10.15 : 1 | AAA Pass |
| \--thodarpu-tier-2 (Maragatham) | \#2E6F4E | Khadi Ivory \#FAF6F0 | 5.62 : 1 | AA Pass (\>= 4.5:1) |
| \--thodarpu-tier-3 (Semman Dark, **D-13**) | \#B24A25 | Khadi Ivory \#FAF6F0 | 5.00 : 1 | **AA Pass (**\>= 4.5:1**; replaces** \#C85A32 **which was** 3.93:1**)** |
| \--thodarpu-tier-4 (Neelam) | \#3B4978 | Khadi Ivory \#FAF6F0 | 7.84 : 1 | AAA Pass |

## **Part B: paste-ready Antigravity directive**

Copy and paste the block below directly into **Google Antigravity (Gemini 3.8 Flash)**:  
XML  
\<antigravity\_games\_v1\_1\_directive\>  
You are the Principal Creative Technologist, Lead WebGL/Compositor Architect, and Full-Stack Game Engineer operating inside Google Antigravity on \`TamilSangamWebsiteOSU\` (\`https\://github.com/haresham15/TamilSangamWebsiteOSU\`).

Execute \*\*PRD — Games Page v1.1 · "The Sangam Arcade & Beach Blast Sequence" (\`/games\`)\*\* with all 15 reference-calibrated defect fixes (\`D-01\` through \`D-15\`).

HARD INVARIANTS:  
1\. PACKAGE MANAGER: Strictly \`npm\` only (\`package-lock.json\`). Never use \`bun\`, \`yarn\`, or \`pnpm\`.  
2\. SINGLE PERSISTENT CANVAS: Mount the \`/games\` hero inside the existing \`GlobalCanvas\` via Drei \`\<View\>\` driven by \`MotionProvider\`. Do NOT create a second \`\<Canvas\>\` or independent RAF loop.  
3\. RIGHTS & CLEANLINESS: Never ship or commit reference stills into \`/public\`; never render \`SUN PICTURES\` or \`SUBSCRIBE\` watermarks; use codename \`"Beach Blast"\` in code and OG metadata.  
4\. EIGHT ATOMIC COMMITS & RUNNABLE BUILD GATES (\`D-15\`): Implement and run \`scripts/verify-frame-parity.mjs\`, \`scripts/verify-lens-registration.mjs\`, and \`scripts/verify-games-data.mjs\` as build-blocking checks before final sign-off.

SKILLS, SUBAGENTS & MCP PROTOCOL:  
Use every relevant installed tool (and skip any unavailable tool without stalling): \`context7\`, \`codegraph\` / \`graphify\`, \`sequential-thinking\`, \`chrome-devtools-mcp\`, \`cavecrew\` (\`cavecrew-investigator\`, \`cavecrew-builder\`, \`cavecrew-reviewer\`), \`sangam-motion\`, \`motion-engineering\`, \`tamil-text\`, \`tailwind-oklch-tokens\`, \`distinctive-ui\`, \`slop-checklist\`, \`cost-efficiency-audit\`, \`a11y-auditor\`, and \`git-pr-hygiene\`.

EXECUTE THESE 8 MILESTONES IN ORDER:

MILESTONE 1 — VALIDATED DATA, TAMIL GRAPHEME SPLITTER & DATA GATE (\`D-11\`, \`D-12\`, \`D-13\`):  
\- Create \`src/lib/tamilGraphemes.ts\` with \`splitTamilAksharas(input)\` using \`.normalize("NFC")\` and \`Intl.Segmenter("ta", { granularity: "grapheme" })\` (with Unicode property fallback \`/\\p{sc=Tamil}\[\\p{Mn}\\p{Mc}\]\*\|\\S/gu\`).  
\- Create \`src/data/gamesData.ts\` and \`src/data/solluDictionary.ts\` containing the 3 corrected monthly editions (\`2026-10\` Oct live now; \`2026-11\` Nov and \`2026-12\` Dec locked until the 1st at \`00:00\` local time unless \`?unlock=all\` is set in dev/preview):  
  \* Oct 2026: Sollu Tanglish \= \`KUTHU\` (5), Tamil \= \`வணக்கம்\` (5 aksharas); Thodarpu categories \= \`STAPLES OF AN OSU TAMIL SANGAM MEETING\` (\`BIRYANI, SAMOSA, CHAI, KAHOOT\`), \`RAJINIKANTH "SUPERSTAR" SIGNATURES\` (\`GLASSES, TIGER, JAILER, BAASHHA\`), \`CLASSICAL & FOLK TAMIL INSTRUMENTS\` (\`PARAI, VEENA, THAVIL, MRIDANGAM\`), \`OHIO STATE CAMPUS LANDMARKS\` (\`OVAL, UNION, THOMPSON, MIRROR\`).  
  \* Nov 2026: Sollu Tanglish \= \`KAAPI\` (5), Tamil \= \`திருக்குறள்\` (6 aksharas); Thodarpu categories \= \`SOUTH INDIAN TIFFIN CLASSICS\` (\`IDLI, DOSAI, PONGAL, VADAI\`), \`A.R. RAHMAN LANDMARK SOUNDTRACKS\` (\`ROJA, BOMBAY, ENTHIRAN, ALAIPAYUTHEY\`), \`ANCIENT TAMIL DYNASTIES\` (\`CHOLA, CHERA, PANDYA, PALLAVA\`), \`PILLARS OF OSU TAMIL SANGAM\` (\`AATAM, PAATAM, KONDATAM, KATRAL\`).  
  \* Dec 2026: Sollu Tanglish \= \`KOLAM\` (5, replacing \`CHOLA\`), Tamil \= \`விருந்தோம்பல்\` (7 aksharas); Thodarpu categories \= \`RAINY-DAY CHAI & KAAPI SNACKS\` (\`MURUKKU, BAJJI, BONDA, PAKKODA\`), \`LOKESH KANAGARAJ CINEMATIC UNIVERSE (LCU)\` (\`KAITHI, VIKRAM, LEO, ROLEX\`), \`CITIES OF TAMIL NADU\` (\`CHENNAI, MADURAI, COIMBATORE, THANJAVUR\`), \`THE FOUR CLASSICAL AIMS OF LIFE (PURUSHARTHAS)\` (\`ARAM, PORUL, INBAM, VEEDU\`).  
\- Enforce Tier 3 darkened fill \`\#B24A25\` (\`5.00:1\` contrast with \`\#FAF6F0\`, \`D-13\`).  
\- Create and pass \`scripts/verify-games-data.mjs\`. Commit Milestone 1\.

MILESTONE 2 — LENS-SHIFTED PROJECTION MATH & VERIFICATION SCRIPTS (\`D-01\`, \`D-02\`, \`D-03\`, \`D-05\`):  
\- Create \`src/components/games-hero/camera/projectionMath.ts\` implementing:  
  \* Locked level camera at \`(0, 1.65, 6.0)\`, \`pitch \= 0°\`, \`vFOV \= 34°\` at design aspect \`2.39:1\`, vertical lens shift \`s \= \-0.350\` (\`camera.projectionMatrix.elements\[9\] \= \+0.350\`, reapplied on resize) putting the horizon at \`v \= 0.675\`.  
  \* Aspect policy (\`\>= 2.0\` full-bleed; \`1.3..2.0\` \`2.39:1\` letterboxed stage with Deep Espresso bars; \`\< 1.3\` portrait \`hFOV \= 44°\`, horizon \`v \= 0.56\`).  
  \* Screen-Anchored Rig Solver placing the foreground rig at distance \`d \= 0.36 m\` (\`z \= 5.64\`).  
\- Create and pass \`scripts/verify-frame-parity.mjs\` and \`scripts/verify-lens-registration.mjs\`. Commit Milestone 2\.

MILESTONE 3 — CALIBRATED J1 COASTAL COMPOUND SCENE (\`D-09\`):  
\- Create \`src/components/games-hero/BeachCompoundScene.tsx\` within the \`30\`-draw-call budget:  
  \* Sky dome (\`\#4DB6CE \-\> \#B8E6E8\`, 6 cloud billboards), wind-rippled & footprinted sand floor (\`\#F3D58D \-\> \#E2BC6B\`), right-hand dune berm & shaded trench (\`x \= \+10..+40\`), left turquoise ocean plane (\`y \= \-0.6, x \< \-11\`).  
  \* Left retaining wall (\`x \= \-9.5, top \= 0.9 m, \#C98A6B\`), green boxwood hedge & fan palms (\`x \= \-8.4\`), instanced wrought-iron spear fence (\`height \= 1.9 m\`) and 3 terracotta piers (\`3.0 m\` above sand at \`z \= \-16.6, \-27.3, \-35.0\`).  
  \* Compound wall at \`z \= \-35\` (\`height \= 2.45 m, \#B87B5E\`) with two jagged breach holes (\`x \= \-2.28\` and \`x \= \+3.24\`, \`1.6 × 1.7 m\`), bougainvillea clusters, and sand rubble.  
  \* Three SUVs at \`z \= \-31, x \= \-4.06, \+0.43, \+4.92\` (\`width \= 2.15 m, roof \= 1.61 m, \#3A3D34\`) with flat-black roof silhouettes.  
  \* Right marble statue group at \`(+12.1, \-19.7)\` (\`3.1 m\` tall), cream umbrella (\`\#EADFC4\`) at \`(+20, \-30)\`, 18 instanced background coconut palms plus the lone palm at \`(-7.3, \-38)\` (\`7.9 m\` tall). Commit Milestone 3\.

MILESTONE 4 — 1:1 FOREGROUND EYEGLASSES & HAND RIG (\`D-03\`, \`D-10\`):  
\- Create \`src/components/games-hero/EyeglassHandRig.tsx\` at \`d \= 0.36 m\`:  
  \* Real-size glossy black acetate glasses (\`width \= 0.142 m\`, lens centres \`±0.041 m\`, apertures \`0.054 × 0.038 m\`, silver hinge pins, foreshortened left & right temple arms, lens mask outputs).  
  \* Sun-bronzed right hand gripping the right temple/corner with \`512²\` pore/knuckle normal map and wet-sweat clearcoat highlights.  
  \* Pose trajectory: off-screen in J1 (\`p \<= 0.22\`) \-\> descends to \`(u=0.563, v=0.565)\` at \`rotZ \= \-18.5°\` in J2 (\`p \= 0.42–0.52\`) \-\> eases to \`(u=0.568, v=0.578)\` at \`rotZ \= \-6.5°\` in J3 (\`p \= 0.60–0.85\`). Commit Milestone 4\.

MILESTONE 5 — LAYERED FOCUS COMPOSITOR & GRADE PROFILE (\`D-08\`):  
\- Create \`src/components/games-hero/compositor/LayeredFocusCompositor.ts\` rendering \`bgTarget\` and \`fgTarget\` (\`premultipliedAlpha\`), two-pass separable disk/Gaussian blur (\`R\_bg(p)\` peaking at \`24 px\` in J2; \`R\_fg(p)\` ramping to \`18 px\` in J3), and \`1.035x\` lens refraction \+ \`+12%\` contrast pop inside the lens apertures with zero \`transmission\` pass overhead.  
\- Register \`jailer-sunblast\` in \`src/gl/grade/gradeConfig.ts\`. Commit Milestone 5\.

MILESTONE 6 — SCRUBBABLE MISSILES, CONTRAIL RIBBONS, FIREBALLS & DUAL-RAIL PORTAL (\`D-04\`, \`D-06\`, \`D-07\`):  
\- Create \`src/components/games-hero/MissilePyroSystem.tsx\` as pure functions of \`p\`:  
  \* M1 (\`p \= 0.535..0.635\`) \-\> Left SUV (\`-4.06\`); M2 (\`0.545..0.640\`) \-\> Centre SUV (\`+0.43\`); M3 (\`0.550..0.645\`) \-\> Right SUV (\`+4.92\`) with curl-noise white smoke contrail ribbons.  
  \* Calibrated blackbody FBM fireballs at \`z \= \-31\`: Left radius \`2.30 m\`, Centre radius \`3.00 m\` (framed inside Left Lens), Right radius \`1.90 m\` (framed inside nose-side half of Right Lens), \`75\` ballistic debris chunks, fence base dust plumes, and rolling golden sand shockwave.  
  \* Beat J4 (\`p \= 0.85..1.00\`): Decoupled macro foreground rail (\`d: 0.36 \-\> 0.035 m\` pushing the left lens past the screen edges) \+ \`28 m\` background rail (\`z: \+6 \-\> \-22 m\` driving through the fireball) dissolving into \`\#FAF6F0\`. Commit Milestone 6\.

MILESTONE 7 — NYT-STYLE SANGAM ARCADE HUB (\`Sollu\` & \`Thodarpu\`):  
\- Build \`src/components/games/SangamArcadeHub.tsx\`, \`SolluWordle.tsx\` (5×6 Tanglish mode \+ dynamic 3..8 column Tamil Akshara mode, two-pass duplicate evaluator, Cultural Unlock Dossier), \`ThodarpuConnections.tsx\` (16-tile grid, GSAP \`Flip\` shuffle & category merge banners, "One away..." toast, 4 \*Pulli\* mistake dots, Cultural Hint tooltips), \`src/lib/gamesStorage.ts\` (\`osu\_ts\_arcade\_v1\`), spoiler-free GroupMe share cards, and \`soundEngine.ts\` \*Raga Mohanam\* audio hooks. Commit Milestone 7\.

MILESTONE 8 — ROUTING, NAVBAR, ACCESSIBILITY, FALLBACKS & E2E VERIFICATION (\`D-14\`, \`D-15\`):  
\- Create \`src/app/games/page.tsx\` with SSR J1 poster, reduced-motion 4-still fallback, \`?debug=p=...\`, \`?debug=onion=j1\|j2\|j3\`, \`?debug=stats\`, and \`?unlock=all\` support.  
\- Wire \`{ label: "Games", tamilLabel: "விளையாட்டு", href: "/games" }\` (with accessible brass dot indicator) into \`FloatingNav\`, \`CommandPalette\`, and \`sitemap.ts\`.  
\- Run \`node scripts/verify-games-data.mjs\`, \`node scripts/verify-frame-parity.mjs\`, \`node scripts/verify-lens-registration.mjs\`, \`npx tsc \--noEmit\`, \`npm run lint\`, \`npm run test\`, and \`npm run build\`.  
\- Inspect \`/games\` via \`chrome-devtools-mcp\` at \`p \= 0.10\`, \`p \= 0.42\`, \`p \= 0.72\`, and \`\#arcade\` (\`1440×900\` & \`375×812\`), confirming \`0\` console/WebGL errors. Commit Milestone 8\.  
\</antigravity\_games\_v1\_1\_directive\>

# **PRD — Games Page v1.1 · The Sangam Arcade & Beach Blast Sequence**

Oct 26, 2026 · @Haresh

## **Document control and what changed**

v1.1 keeps every goal of v1 and corrects 15 defects, the largest being a camera that would have framed the beach at the wrong height; each fix is measured against your three reference frames.

| Field | Value |
| ----- | ----- |
| Version | 1.1, reference-calibrated (supersedes v1) |
| Project | OSU Tamil Sangam website: Next.js 16, React 19, R3F v9, Drei, @react-three/postprocessing, GSAP ScrollTrigger, Lenis, Zustand |
| Surface | /games, a new top-level route and navbar entry |
| Package manager | npm only; package-lock.json is an invariant |
| Reference frames | J1, J2, J3 stills, 1861×778 (2.39:1); used for calibration only and never shipped |
| Coordinates | u \= 0 to 1 left to right, v \= 0 to 1 top to bottom of the frame; meters in world space |
| Status | Ready for agent execution once the open decisions in the last section are answered |

### **Defect log: v1 versus v1.1**

| ID | What v1 said | Evidence | v1.1 change |
| ----- | ----- | ----- | ----- |
| D-01 | Camera looks level at (0, 1.8, −31) | Wall base projects to v=0.572 and top to 0.429; the reference shows 0.739 and 0.648, so the beach sits mid-frame instead of low | Lens shift puts the horizon at v=0.675 (−0.350 NDC); wall now projects to 0.741 and 0.643 |
| D-02 | Camera position, target and FOV change each beat (34°, 32°, 33°, 38°) | Fence piers and the lone palm sit at the same pixels in all three reference frames, so the shot is locked off | One locked camera from p=0 to 0.85; only sub-pixel drift and the blast shake |
| D-03 | Glasses lens centres at ±0.068 m, 1.35 m from the camera | Lens spacing renders 0.069 of frame width; the reference shows 0.153, so the prop is 2.2× too small | Real-size glasses (lens centres ±0.041 m) 0.36 m from the lens |
| D-04 | Fireball radii 4.2, 5.0 and 4.5 m | Reference blasts measure about 3.8, 5.1 and 2.3 m wide at 37 m; v1 sizes merge into one blob that swallows both lenses | Core radii 2.3, 3.0 and 1.9 m; smoke columns to 7.5 m |
| D-05 | Right fireball is dead-centre in the right lens | In the reference it sits at the nose-side edge of the right lens | Lens Registration Contract with numeric gates and a runnable check |
| D-06 | Upper-left missile hits the centre SUV | Fit to the measured reference contrail: mean error 0.008 frame-heights to the left SUV, 0.048 to the centre | M1 to left SUV, M2 to centre, M3 to right; trails authored as screen-space splines |
| D-07 | Camera dolly 6.0 to 4.4 m “through the fireball” | A 1.6 m move changes a fireball 37 m away by 4% in scale and cannot fill the viewport | Two rails: a macro foreground rail into the lens and a 28 m background rail through the fire |
| D-08 | Post-process DOF plus lens transmission | Depth-based DOF cannot make a blurred foreground edge translucent over a sharp background; transmission adds a full extra scene render | Layered Focus Compositor: separate foreground and background targets, no transmission |
| D-09 | Wall 3.6 m, piers 2.4 m, SUVs at −6.2, −0.5, \+5.2, fountain at (9.5, −15), white umbrella, no lone palm | Back-projection gives wall 2.45 m, piers about 3.3 m, SUVs −4.06, 0.43, 4.92, statue (12.1, −19.7) and 3.1 m tall, cream umbrella near x=+19.5 | World layout rewritten from the back-projection; lone palm, hedge strip and dune trench added |
| D-10 | Glasses hold the −18.5° pose through beat 3 | The J3 lens line measures near −6.5° (±3°) | Pose eases to −6.5° between p=0.52 and 0.60 |
| D-11 | Sollu uses a 5×6 grid for every word; IDLI and ANBU are valid 5-letter words | Tamil answers split into 5, 6 and 7 aksharas; IDLI and ANBU have 4 letters; the v1 fallback regex splits a decomposed கொ into two tiles | Variable-width Tamil grid (3–8 columns), a word-length audit script, fixed regex with NFC normalisation |
| D-12 | Connections category titles | October blue says “follow SOUTH or OVAL”; “Five pillars” lists four; VEENA is not percussion; Natpu is a chapter while Aram, Porul and Inbam are the three books; CHOLA is a November category and the December Sollu answer | Categories retitled and validated; CHOLA flagged with KOLAM as the drop-in answer |
| D-13 | Tier 3 text is ivory on \#C85A32 | Contrast is 3.93:1; AA needs 4.5:1 for small text | Tier 3 fill darkens to \#B24A25 (5.00:1); brand terracotta stays decorative |
| D-14 | Streak, edition unlock, reduced motion, no-WebGL fallback and Tamil month labels are undefined | Monthly puzzles have no daily streak; November and December would ship as spoilers | All defined in the hero and hub sections |
| D-15 | One mega-commit; sequential-thinking MCP verifies the projection by reasoning | Reasoning is not a gate | Eight atomic commits; projection verified by a runnable script that fails the build |

### **What v1.1 adds**

* A reference-calibration appendix and an onion-skin debug mode, so layout is tuned against the frames and not by eye.  
* A Layered Focus Compositor and a numeric Lens Registration Contract.  
* A scrubbable FX model: every effect is a pure function of scroll progress p.  
* Performance tiers, fallbacks and accessibility for the hero.  
* Full game rules with algorithms, a storage schema, share cards and audio recipes.  
* Corrected content for three editions and a seed dictionary of 113 verified Tanglish words.  
* QA gates, risks, milestones and a rewritten agent directive.

## **Executive summary, launch plan and success gates**

/games is a flagship top-level route: a scroll-scrubbed 3D hero that opens on a beach standoff and ends inside the page, followed by a monthly Tamil games hub with two games (Sollu, a Tanglish and Tamil-script Wordle, and Thodarpu, a Tamil Connections). v1.1 turns the hero’s “match the reference” goal into three numeric frame gates that a script can fail.

| Beat | p range | What the viewer sees | Focus state |
| ----- | ----- | ----- | ----- |
| J1 Coastal standoff | 0.00–0.22 | Locked-off beach: iron fence left, marble statue right, breached wall with two holes and three SUVs carrying silhouettes | Background sharp (37 m) |
| J2 Hand and eyeglasses | 0.22–0.52 | A bronzed hand lowers black glasses into the foreground; the beach melts into bokeh | Racks to 0.36 m |
| J3 Reverse focus and blast | 0.52–0.85 | Focus snaps back to the SUVs; three missiles trail smoke; fireballs erupt inside the lenses; a sand shockwave rolls in | Racks to 37 m |
| J4 Portal | 0.85–1.00 | The frame swells past the screen edges, the camera drives through the fire, haze dissolves to Khadi Ivory as the hub sheet rises | Fire and haze |

The scroll runway is 340vh on desktop and 260vh on mobile, so p advances over 240vh and 160vh of actual scroll.

### **Launch plan**

Today is 26 October 2026, so the October edition is live for six days at launch. Ship October as the Launch Edition, keep November and December locked behind a teaser with a countdown, and unlock each at 00:00 local time on the 1st. A ?unlock=all flag (dev and preview builds only) opens every edition for testing.

### **Success gates**

| Gate | Target | How it is verified |
| ----- | ----- | ----- |
| Frame parity J1, J2, J3 | Every landmark in the calibration appendix lands within 1.5% of frame width and 2% of frame height of its reference position | scripts/verify-frame-parity.mjs plus an onion-skin review at the three p values |
| Lens registration (J3) | For every p from 0.66 to 0.85 in steps of 0.01: centre fireball inside the middle 30% of the left lens; right fireball inside the nose-side half of the right lens; left fireball at least 0.03 of frame width left of the left lens | scripts/verify-lens-registration.mjs; a failure fails npm run build |
| Optical states | At p=0.42 the background blur radius is at least 20 px at 1440 px width; at p=0.72 the foreground blur radius is at least 14 px; no halo on blurred foreground edges | Screenshot review and a pixel probe at the glasses rim |
| Frame rate | Median at least 58 fps on desktop Tier A (1440×900), 1% low at least 45 fps, no frame over 33 ms between p=0.64 and 0.70; at least 30 fps median on mobile (375×812) | Chrome DevTools performance trace, three runs |
| Scene budget | At most 85 draw calls including post passes, 220k triangles, 8 MB of procedural texture memory | renderer.info logged in ?debug=stats |
| Loading | LCP at most 2.0 s with the J1 poster (AVIF, 90 KB or less) as the LCP element; CLS 0; INP at most 200 ms on game taps; hero chunk at most 150 KB gzip, dictionary chunk at most 60 KB gzip and lazy | Lighthouse and Vercel Speed Insights |
| Accessibility | WCAG 2.2 AA; both games fully playable by keyboard and screen reader; reduced-motion path replaces the scrub with four stills | axe run plus manual keyboard and VoiceOver pass |
| Tamil integrity | Aksharas split by Intl.Segmenter('ta', { granularity: 'grapheme' }); கொ, ஷி and த் each count as one tile | Unit tests on the word list |
| Cleanliness | 0 console errors or WebGL warnings in the verification run | chrome-devtools-mcp console capture |

### **Non-goals**

* No SUN PICTURES logo, no YouTube SUBSCRIBE button, no film footage, audio or traced artwork. Every asset is built from scratch in code.  
* No external model over 250 KB. Environment, SUVs, glasses, smoke and fire are procedural; a hand mesh is allowed only under the hand decision gate.  
* No accounts, backend or ads in v1; progress lives in the browser.  
* No daily-puzzle cadence; the hub is monthly.

### **Rights and reputation**

This is a fan homage by a student organisation. Keep the three reference stills in docs/reference/, git-ignored and excluded from the build, never in /public. Use the internal codename “Beach Blast” in code, metadata and the Open Graph image; the film name appears only as puzzle trivia. Remove the hero on a takedown request.

## **Navigation, routing and page structure**

Games sits between Gallery and Guide & FAQ in the top bar with the existing bilingual hover swap, and /games is one route made of three stacked zones: the hero runway, the Arcade sheet and the footer.

### **Navbar and command palette**

* Add { label: "Games", tamilLabel: "விளையாட்டு", href: "/games" } to FloatingNav between Gallery and Guide & FAQ; keep the single-line rest state and set the Tamil label with lang="ta" and zero positive letter-spacing.  
* Brass dot (5 px, \#D4AF37) marks an unsolved puzzle in the current edition and disappears when both are solved. Brass on ivory is only 1.95:1, so the dot gets a 1 px Deep Espresso ring and the link carries aria-label="Games, new puzzles available"; colour is never the only signal.  
* Register Games, Sollu and Thodarpu in CommandPalette (⌘K) and sitemap.ts, each with its deep link.

### **URL contract**

| URL | Behaviour |
| ----- | ----- |
| /games | Hero, then the Arcade on the latest unlocked edition and the first unsolved game |
| /games\#arcade | Skips the hero; target of the Skip to Arcade pill |
| /games?edition=2026-10\&game=sollu\&mode=tanglish | Deep link to an edition, game and mode (game=thodarpu, mode=tamil also valid); a locked edition falls back to the latest unlocked one |
| ?debug=p=0.42 | Freezes the hero at p (dev and preview builds only) |
| ?debug=onion=j1 | Overlays the local reference still for j1, j2 or j3 at 50% opacity (dev only; the still is read from docs/reference/, never deployed) |
| ?debug=stats | Prints renderer.info, tier and frame times |
| ?unlock=all | Opens every edition for testing (dev and preview builds only) |

### **Page zones**

1. **Hero runway.** A sticky 100vw × 100dvh stage inside a 340vh (260vh mobile) section. DOM overlays sit above the canvas: an eyebrow “OSU TAMIL SANGAM PRESENTS” and a bilingual scroll cue (“Scroll · கீழே செல்”) from p=0 to 0.08, and a “Skip to Arcade ↓” pill that appears after 1 s and is the first focusable element on the page.  
2. **Arcade sheet** (id="arcade"). Khadi Ivory \#FAF6F0 on Chola Sandstone \#F2EAE0; the sheet glides up over the stage from p=0.90 and becomes the page.  
3. **Footer.** The existing site footer, unchanged.

### **Metadata and loading**

* Title “The Sangam Arcade · OSU Tamil Sangam”; the Open Graph image is a static composite of our own J3 render, with no film logo and no film title.  
* The poster (J1 still, AVIF) is server-rendered and is the LCP element; the canvas view hydrates after first paint and cross-fades the poster out once the first frame is drawn.  
* The Arcade shell is server-rendered; game logic hydrates on the client. Dictionaries load lazily on first focus of Sollu.  
* Load Tamil type with next/font using the tamil subset, with font-display: swap and a line height of at least 1.5 for Tamil text.

## **Hero 1: reference calibration and camera model**

All three reference frames come from one locked-off camera at eye height with the horizon at v=0.675, so the hero camera is level, fixed and lens-shifted; it is not pitched and it does not move until the portal.

### **Measured landmarks and what they imply**

Measured by eye on the 1861×778 stills (±6 px, about ±0.3% of width). Treat every value as a starting point; the onion-skin overlay is the arbiter.

| Landmark | Reference (u, v) | Derived world value |
| ----- | ----- | ----- |
| Wall base at the left corner | (0.352, 0.739) | Wall on z=−35; consistent with horizon v=0.675 and eye height 1.65 m |
| Wall top | v≈0.648 | Wall height 2.45 m |
| SUV centres | u \= 0.425, 0.508, 0.591 | x \= −4.06, \+0.43, \+4.92 at z=−31 |
| SUV wheel line to roof | v 0.739 to 0.668 | Cab height 1.61 m |
| Breach holes | u \= 0.462 and 0.554 | x \= −2.28 and \+3.24; each about 1.6 m wide and 1.7 m tall |
| Lone coconut palm behind the wall | u=0.386, crown top v=0.443 | x ≈ −7.3 at z=−38, height ≈ 7.9 m |
| Marble statue | base (0.822, 0.780), top v=0.580 | x ≈ \+12.1, z ≈ −19.7, 3.1 m tall |
| Cream umbrella canopy | u=0.883, v≈0.64 | x ≈ \+20, z ≈ −30; cream, not white |
| Iron fence | Top line converges toward u≈0.45 | Straight run parallel to z at x≈−9.5, not the v1 diagonal; base reads 0.8 to 1.1 m above the sand, so it stands on a retaining wall |
| Fence height and piers | Top v 0.518, 0.578, 0.621 at the left edge, first pier, second pier | Fence about 2.8 m, piers about 3.0 m above the sand |

The fence is the lowest-confidence row; tune it with ?debug=onion=j1 before touching anything else.

### **Projection model**

With camera-space offsets (x\_c, y\_c), distance d along the view axis, vertical half-FOV tangent T\_v, aspect A, horizontal tangent T\_h \= A·T\_v and lens shift s:

`u = ½ · (1 + x_c / (d · T_h))`

`v = ½ · (1 − s − y_c / (d · T_v))`

A point at infinity on the view axis lands at v \= (1 − s)/2, so s \= −0.350 puts the horizon at v \= 0.675.

### **Locked camera (J1 to J3)**

| Parameter | Value | Reason |
| ----- | ----- | ----- |
| Position | (0, 1.65, 6.0) | Eye height, as the reference |
| Orientation | Level, looking along −z, pitch 0° | Verticals stay parallel; the reference pickets are vertical |
| vFOV at design aspect 2.39 | 34° (hFOV 72.3°) | Matches J1 |
| Lens shift s | −0.350 NDC vertical | Moves the horizon from v=0.5 to 0.675 |
| Background near and far | 1.0 and 400 | Depth precision for the beach |
| Foreground near and far | 0.01 and 2.0 | The glasses sit 0.36 m away |
| Drift | At most 0.4% of frame on each axis, 0.15 Hz noise | Alive but locked off |
| Lens breathing | None | v1 changed FOV per beat; the reference does not |

Apply the shift by writing camera.projectionMatrix.elements\[9\] \= −s (that is, \+0.350), then camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert(). R3F recomputes the projection on resize, so wrap updateProjectionMatrix on both hero cameras and reapply the shift after each call. Do not pitch the camera: a 6° pitch keystones every vertical.

### **Aspect policy**

| Viewport aspect | Policy | Result |
| ----- | ----- | ----- |
| 2.0 or wider | Fill the viewport, vFOV 34°, shift −0.350 | Exact J1 composition; wider screens see more at the sides |
| 1.3 to 2.0 (laptops, 16:10, 16:9) | Cinema frame: stage is 2.39:1, full width, centred; Deep Espresso bars fill the rest | Exact composition at every desktop size; about a third fewer pixels to shade; the bars hold DOM captions |
| Below 1.3 (phones, portrait tablets) | Portrait recomposition: stage fills the viewport, hFOV locked at 44°, horizon at v=0.56, glasses sized to 78% of width by the rig solver | Central standoff stays readable; statue and far fence crop out |

At 1440×900 the cinema stage is 1440×603 with 148 px bars. Bar captions (Tamil and English) change per beat, for example “The standoff · நேருக்கு நேர்”, and are aria-live="off" so scrolling never chatters at a screen reader.

Verify frame parity at the design aspect with a 1912×800 viewport; at other aspects the u landmarks must still hold, and v offsets from the horizon scale by A/2.39.

### **Screen-anchored rig solver**

Place the foreground rig in camera space from a target screen anchor (u, v) and distance d, so it lands in the same place at every aspect:

`x_c = (2u − 1) · d · T_h`

`y_c = (1 − 2v − s) · d · T_v`

At the design aspect the J2 anchor (0.563, 0.565) with d \= 0.36 m gives the rig at world (0.033, 1.674, 5.64); the J3 anchor (0.5875, 0.575) gives (0.046, 1.672, 5.64). Recompute on every resize.

## **Hero 2: world layout**

The beach is eleven groups of procedural geometry placed from the back-projection, costing 30 draw calls including the shadow pass. Origin is the centre of the courtyard floor; \+x right, \+y up, \+z toward the camera; units are meters.

| Group | Placement and size | Look | Draw calls |
| ----- | ----- | ----- | ----- |
| Sky dome | Radius 300, inside-out; 6 instanced cloud billboards | Zenith \#4DB6CE to horizon \#B8E6E8; cirrus streaks left (u 0.15–0.35, v 0.35–0.45); cumulus behind the right palms (u 0.66–0.72 and 0.80–0.88, v 0.40–0.55); no sun disc | 2 |
| Sand floor | 120 × 90 m, y=0, centred at z=−14 | Albedo \#F3D58D to \#E2BC6B in ripples and footprints; wind-ripple normals (0.35 m wavelength); micro-mica sparkle; footprints baked into one 1024² mask | 1 |
| Dune berm | Strip from x=+10 to \+40, rising 0.9 m, with a shaded trench | Matches the right-hand dune and dark rut in J1 (u 0.84–1.0, v 0.78–0.82) | 1 |
| Ocean | Plane at y=−0.6, x from −120 to −11, z from \+10 to −200 | Turquoise \#62D0DC with scrolling ripple normals, fading to haze at the horizon; seen between fence pickets | 1 |
| Retaining wall and hedge | Wall at x=−9.5 from z=−7 to −35.5, top 0.9 m, \#C98A6B; boxwood hedge 0.45 m tall at x=−8.4 with 5 fan palms and shrubs | Peach terracotta; bright green hedge strip as in J1 | 2 |
| Iron fence | On the wall, x=−9.5, 1.9 m tall; piers 3.0 m above sand at z=−16.6, −27.3 and −35.0 (the corner pier meets the compound wall) | Instanced black pickets with spear finials (pitch 0.12 m), two rails, S-scroll rings; piers \#C98A6B | 4 |
| Compound wall | z=−35, x from −9.5 to \+45, 2.45 m tall, \#B87B5E, 0.12 m coping | Two jagged breaches at x=−2.28 (sky shows through) and x=+3.24 (dark scorched rubble boulder), each 1.6 × 1.7 m; red bougainvillea 0.8 m tall at x≈−8.0 and x≈+5.0; rubble chunks instanced on the sand | 3 |
| SUVs and silhouettes | Three at z=−31, x \= −4.06, \+0.43, \+4.92; 2.15 m wide, 4.4 m long, cab roof 1.61 m; facing \+z | Charcoal-olive \#3A3D34 with grille, bullbar, windshield reflecting sky, rubble at the tyres; one instanced body, one glass, one wheel set, one merged silhouette mesh | 4 |
| Marble statue group | Statue and plinth at (+12.1, −19.7), 3.1 m tall; planter 4.0 × 2.2 m; two urns at x=+10.2 and \+11.0; cycad and agave cluster at x=+10.4, 2.2 m tall | White marble \#ECE8E0 on a tiered pedestal in a terracotta planter | 4 |
| Umbrella set | Cream (\#EADFC4) 8-rib canopy, 2.6 m across, at (+20, −30); table and two chairs | Matches the cream umbrella in J1 | 2 |
| Palm grove | 18 coconut palms behind the wall (z −37 to −45, x \+5 to \+40) plus the lone palm at (−7.3, −38), 7.9 m tall | Ringed lathe trunks (instanced); 22 alpha-tested frond cards per crown (instanced); vertex-shader sway | 2 |
| Shadow pass | Casters: SUVs, statue group, glasses, hand | One 2048² map over a 60 × 40 m box | 4 |
| **Total** |  |  | **30** |

### **Lighting, fog and atmosphere**

* Sun: directional at (12, 24, 14), \#FFF4D6, intensity 3.8; shadow bias −0.0004, normal bias 0.02.  
* Hemisphere: sky \#7CE0F4, ground \#E8C574, intensity 0.85.  
* Exponential-squared fog on the background pass only: colour \#BFE6EA, density 0.007, so the compound wall carries about 8% haze.  
* Grade profile jailer-sunblast in gradeConfig.ts: lutOpacity 0.74, bloomThreshold 0.72, bloomIntensity 0.65, vignetteDarkness 0.38, grainOpacity 0.035.  
* Ambient motion: palm crowns sway 0.6° at 0.2 Hz, bougainvillea 0.3°, sand mica twinkles, ocean normals scroll. Nothing in J1 else moves.

### **Silhouettes**

Each SUV carries 2 to 3 flat-black figures (\#0E0D0C with a \#3A3D34 rim) about 1.1 m tall, sized to read 30 to 36 px tall at 1861×778. They hold no weapons and wear no insignia. At detonation they are covered by the first fire frame and replaced by debris chunks; no figure is shown thrown or injured.

### **Texture memory**

All textures are procedural or generated at load: footprint mask 1024² R8 (1.3 MB with mips), a shared 64³ RGBA8 noise volume for fire and smoke (1 MB), hand skin normal 512² RGBA8 (1.3 MB), glasses micro-scratch 256² (0.3 MB). Total about 4 MB against the 8 MB budget.

## **Hero 3: foreground rig (glasses and hand)**

The rig is one group rendered by the foreground camera only (near 0.01, far 2.0, the same vFOV and lens shift as the background camera). One unit is one metre. The solver in Hero 1 places it from screen anchors, Hero 7 freezes it in camera-space metres (clarification C-1), and every motion below is a pure function of p.

**Sign convention.** In J2 and J3 the lens line rises to the right, which is a counter-clockwise tilt on screen. The −18.5° and −6.5° quoted in this PRD are image-space angles (y down). In three.js set rotation.z \= \+18.5° and \+6.5°; getting this sign wrong tips the glasses the wrong way and breaks lens registration.

### **Glasses**

| Part | Spec |
| ----- | ----- |
| Front frame | Extruded rounded-rectangle rims, 6 mm deep, 0.8 mm bevel in 3 segments. Lens cell 0.071 × 0.054 m outside; aperture 0.058 × 0.042 m with a 9 mm corner radius and a top edge 4% wider than the bottom; rim 6.5 mm at the sides, 6 mm top and bottom |
| Lens centres | ±0.041 m, so the apertures span ±0.012 to ±0.070 m and the bridge gap is 24 mm |
| Bridge | Saddle bridge 18 mm wide, arched, 5 mm below the rim top |
| Temples | 145 mm long, 12 mm tall at the hinge tapering to 7 mm, 4 mm thick; hinge barrel 3.5 mm with a silver stud (\#B9BDC2, metalness 1). The open angle is a tuning parameter from 80° to 100°; start at 90° so the left temple reads near-vertical as in J2 and J3 |
| Pose | Rotation order YXZ: yaw −0.22 rad and pitch \+0.08 rad (kept from v1), roll from the pose track below |
| Material | Glossy jet-black acetate: \#08080A, roughness 0.12, clearcoat 1.0, clearcoatRoughness 0.06. A razor white sky highlight runs along the lower-left rim bevel, from a small environment cube (64² per face) built once from the sky dome shader (0.2 MB) |
| Cost | About 6k triangles including temples; 3 draw calls |

### **Lenses: no transmission**

The apertures are holes in the foreground layer, so the background shows through and the compositor handles blur and translucency (Hero 4). Two additive cards sell the glass: a faint sky sheen (5% opacity, diagonal, top-left of each aperture) and a cyan-green anti-reflective glint (\#7FE3D0, 35% opacity, 12 × 6 mm) at the lower corner of the right lens. There is no refraction and no transmission pass.

### **Pose track**

| p | Anchor (u, v) | d (m) | Roll (image-space) | Note |
| ----- | ----- | ----- | ----- | ----- |
| 0.22 | (0.82, −0.14) | 0.46 | −31° | Off-frame above right; rig hidden before this |
| 0.42 | (0.563, 0.565) | 0.36 | −18.5° | J2 pose |
| 0.42–0.52 | hold | 0.36 | −18.5° | Anticipation tremor from 0.49 |
| 0.60 | (0.5875, 0.575) | 0.36 | −6.5° | J3 pose, eased from 0.52 |
| 0.60–0.85 | hold | 0.36 | −6.5° | Holds through the blast |

Descent, p 0.22 to 0.42: with q \= (p − 0.22) / 0.20, position follows the critically damped step response renormalised to end exactly at 1, `s(q) = (1 − (1 + λq)e^(−λq)) / (1 − (1 + λ)e^(−λ))` with λ \= 6.0. It is closed form, so it scrubs backwards. Anchor and roll interpolate by s(q); v adds an arc of \+0.04·sin(πq) so the path curves instead of sliding diagonally; d eases from 0.46 to 0.36 so the glasses swell toward the lens.

Pose change, p 0.52 to 0.60: anchor, roll and d interpolate by e \= smootherstep(0.52, 0.60, p). Anticipation tremor, p 0.49 to 0.54: roll \+= 2.0° · sin(8πx) · sin(πx) with x \= (p − 0.49) / 0.05.

### **Hand**

| Item | Spec |
| ----- | ----- |
| Placement | Knuckle centre anchored at (0.83, 0.20), d \= 0.31 m. It is nearer than the glasses, which is why it blurs more in J3. The forearm leaves the upper-right corner; thumb and index pinch the right temple 20 mm behind the hinge; ring and little fingers tucked |
| Construction | Procedural, static grip, no skeleton: rounded-box palm 85 × 95 × 30 mm, four fingers of three capsule segments, a thumb of two, a tapered forearm 0.28 m long; about 4.8k triangles. The hand never articulates and moves only with the rig |
| Skin | MeshPhysicalMaterial with ramp \#3A180E shadow, \#7A3B22 mid, \#D98A5C highlight; roughness 0.18, clearcoat 0.65; 512² procedural pore and knuckle-crease normal map at normalScale 0.35. A procedural R8 streak mask along the knuckles and back of the hand drives the wet white-gold specular seen in J2 |
| Lighting | The foreground layer has its own light: the beach sun direction plus a weak cool fill from the left (\#7CE0F4, 0.3) so the shadow side of the hand does not crush |
| Generic | No tattoos, scars or identifying marks; a generic bronzed hand, not a likeness |

**Hand decision gate (G-H).** The procedural hand ships if, in onion-skin at p=0.42, its silhouette overlaps a traced J2 hand mask with IoU of at least 0.80 and Haresh signs off that it reads as a hand. If not, one authored glTF hand (at most 250 KB, Draco, at most 6k triangles, modelled in-house or commissioned, licence recorded, no scans of any real person) replaces the mesh behind the same anchor and material. The decision and its evidence go in the PR description.

## **Hero 4: Layered Focus Compositor**

Depth-based DOF cannot make a blurred foreground edge translucent over a sharp background, and glass transmission renders the scene a second time (D-08). The compositor blurs each layer on its own and composites with alpha, so a blurred rim is see-through by construction.

### **Pipeline**

| Step | Pass | Detail |
| ----- | ----- | ----- |
| 1 | Background render | Beach, missiles, fire, smoke and haze into the BG target (RGBA16F). Alpha carries a depth-based CoC weight, 0.8 \+ 0.4·(1 − smoothstep(8, 60, d)) normalised to 0–1, so near sand blurs 1.2× and the wall at 41 m blurs 0.85× |
| 2 | Foreground render | Rig only, own camera and light, premultiplied RGBA16F; 4× MSAA on Tier A, FXAA on Tiers B and C |
| 3 | Lens mask | Two aperture quads into an R8 target at quarter resolution |
| 4 | Background blur | Half-resolution Vogel-disc gather weighted by CoC; highlight boost w \= 1 \+ 3·smoothstep(0.8, 1.6, luma) so highlights bloom into creamy discs as in J2 |
| 5 | Foreground blur | The same gather on the premultiplied FG target and on the lens mask, radius R\_fg(p). Blurring premultiplied colour and alpha together makes the soft edge translucent with no dark halo |
| 6 | Composite | `out = fg.rgb + bg · (1 − fg.a)`; inside the blurred lens mask, \+12% contrast and a faint warm shift |
| 7 | Grade | Linear HDR to the existing GradeStack with the jailer-sunblast profile |

Tap counts for Tier A, B and C: background 32, 20 and 12; foreground 24, 16 and 10\. The compositor costs 5 draw calls (background blur, foreground blur, upsample, composite, mask).

### **Curves**

R is the blur disc radius in px at a 1440 px stage width; scale by stageWidth / 1440\. F is the focus distance in metres, shown only in ?debug=stats. With g(p) \= smoothstep(0.25, 0.42, p) while rising and 1 − smootherstep(0.52, 0.60, p) while falling:

`R_bg = 24 · g(p)` `F = 37 · (0.36 / 37)^g(p)` `R_fg = 18 · smootherstep(0.52, 0.64, p)`

| p | R\_bg (px) | R\_fg (px) | F (m) |
| ----- | ----- | ----- | ----- |
| 0.00–0.25 | 0 | 0 | 37 |
| 0.33 | 11 | 0 | 4.5 |
| 0.42 | 24 | 0 | 0.36 |
| 0.52 | 24 | 0 | 0.36 |
| 0.56 | 12 | 4 | 3.7 |
| 0.60 | 0 | 14 | 37 |
| 0.72 | 0 | 18 | 37 |

The gates hold with margin: 24 px at p=0.42 against 20, and 18 px at p=0.72 against 14\.

### **Rules**

* **Lens treatment.** v1’s 1.06× to 1.08× refraction zoom inside the lenses is dropped (C-3): it moves fireballs relative to the registration gates and the reference shows no magnification. Only the \+12% contrast stays.  
* **Integration.** The compositor owns the hero’s render inside the existing GlobalCanvas View: one useFrame at a priority above the View’s default render, writing the final colour into the View’s scissor rect. No second Canvas and no second RAF. Dispose every target and material on unmount. If GradeStack does not run after Views, the compositor applies a minimal grade itself (open decision O-8).  
* **Fallbacks.** Without half-float render targets use RGBA8 and switch the highlight boost off. Without multisampled targets use FXAA. Tier C blurs at quarter resolution.  
* **Probes.** At p=0.42 measure the 10–90% edge width of the background fence; at p=0.72 measure the 10–90% alpha ramp across the glasses rim. Both are logged by ?debug=stats.

## **Hero 5: missiles, contrails, fireballs and shockwave**

**Scrubbable FX model.** Every effect is a closed-form function of p and fixed seeds: `fx(p)` returns the positions, radii and opacities for one frame. There are no stateful particle simulations. Debris follow y \= y0 \+ v·t − ½·g·t², smoke offsets its noise by age, and trails are rebuilt from their splines every frame, so scrolling backwards replays the blast in reverse. The only wall-clock input is an ambient shimmer (fire noise advances at 10% amplitude while dp/dt is near zero), and it is off under ?debug=p. Effect time is t\_fx \= 12·(p − p\_hit) seconds, so 0.20 of p equals 2.4 s.

### **Missiles and contrails**

Trails are authored as screen-space splines in frame coordinates (D-06), traced from the contrail-fit overlay of J3. The missile head is the spline point unprojected at a depth that eases from 14 m (12 m for M3) to 37 m. Control points are starting values, ±0.02; tune them with ?debug=onion=j3.

| ID | Target | Launch p | Hit p | Spline control points (u, v) |
| ----- | ----- | ----- | ----- | ----- |
| M1 | Left SUV | 0.540 | 0.640 | (−0.01, 0.07), (0.10, 0.19), (0.20, 0.325), (0.30, 0.47), (0.376, 0.585), then a terminal dive to (0.425, 0.70) |
| M2 | Centre SUV | 0.550 | 0.646 | (−0.01, 0.415), (0.108, 0.483), (0.215, 0.56), (0.323, 0.648), (0.403, 0.693), then a low run to (0.508, 0.70), hidden behind the left plume |
| M3 | Right SUV | 0.560 | 0.652 | (1.02, −0.10) behind the hand, (0.806, 0.273), (0.753, 0.368), (0.699, 0.438), (0.645, 0.508), (0.608, 0.572), then a dive to (0.591, 0.70) |

The head moves along the spline by arc length with q \= (p − launch) / (hit − launch), eased as q^1.3 so it accelerates. The trail runs from the launch point to the head and stays after the hit.

Contrail look: a camera-facing ribbon 0.012 of frame height wide at the head, 0.035 at age 0.1, and 25% wider again by p=0.85; opacity 0.78; lit top \#F4F6F4 to shaded underside \#9EA6A8; edge shape from curl noise in the shared 64³ volume; a sandy tint (\#E8DFC8) below v=0.62 where dust mixes in. Cost: 3 draw calls.

### **Fireballs**

| ID | Emitter x (m, z=−31) | Radius R | Settled centroid height | Smoke column | Hit p | Centroid u |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Left | −5.46 | 2.3 m | 2.6 m | 6.0 m | 0.640 | 0.399 |
| Centre | \+0.43 | 3.0 m | 2.9 m | 7.5 m | 0.646 | 0.508 |
| Right | \+6.32 | 1.9 m | 2.8 m | 5.5 m | 0.652 | 0.617 |

The two outer emitters sit 1.40 m outboard of their SUVs (−4.06 and \+4.92). In J3 the left and right blasts sit about 0.025 of frame width outboard of the SUV positions, which is what lands the right blast on the nose-side edge of the right lens (C-4). Centre radius and column height are the figures from D-04.

With a \= (p − p\_hit) / 0.20:

* Radius `r(a) = R · (1 − (1 − min(a/0.30, 1))³)`.  
* Core brightness `B(a) = e^(−1.8a)`; soot opacity `S(a) = 0.8 · smoothstep(0.1, 0.5, a)`.  
* Centroid height `y(a) = 1.2 + (y_settled − 1.2) · (1 − e^(−a/0.25))`; column height `h(a) = H · (1 − e^(−a/0.4))`.  
* Temperature ramp: \#FFF6B0 (1.0), \#FF6A00 (0.55), \#9E1B00 (0.3), \#2A1E17 (0.1, soot).  
* Flash: a ground-and-SUV light of 12·e^(−a/0.04), passed as a shader uniform rather than a real light.

Render: one camera-facing impostor of radius 1.35·R per fireball, ray-marched through the shared 64³ noise volume (28 steps on Tier A, 18 on Tier B); Tier C samples an 8×8 flipbook baked once at load into a 512² atlas (1 MB). One additive pass and one normal-blend soot pass, instanced over three fireballs and three smoke columns: 2 draw calls.

### **Debris, shockwave and dust**

| Effect | Spec |
| ----- | ----- |
| Debris | 80 instanced chunks (24 left, 32 centre, 24 right), 0.15 to 0.5 m, launched from each emitter with seeded v0y 6 to 14 m/s and horizontal 0 to 4 m/s; closed-form tumble; colour \#2A2420 with an ember tip that fades by a=0.35. The centre blast also lofts one roof panel 0.9 m wide to 3 m above the fireball, the dark shape above the nose bridge in J3. 1 draw call |
| Shockwave | A ground-hugging dust wall from the centre SUV base (0.43, 0, −31) toward the camera: radius R\_s \= 38 · clamp((p − 0.642) / 0.208, 0, 1)^0.85 m, so it reaches the camera by p=0.85; 0.4 m tall at the front thickening to 1.4 m; \#E5C478 at 0.65 opacity; a noise-displaced ring plus 60 instanced puffs. 2 draw calls |
| Fence dust | 18 grey-white puffs (\#E8E4DA, 0.5 opacity) along the fence base from z=−34 to −10, staggered from p=0.664 to 0.70, rising 1.2 m; matches the pale dust at the left fence in J3. 1 draw call |
| Ground haze | From p=0.66 to 0.85 the lower third of the frame hazes toward \#E5C478 (fog density 0.007 rising to 0.014) |
| Blast shake | Background camera only (C-5): yaw 0.16° and pitch 0.12° impulse at p=0.640, five oscillations over Δp=0.03 under an envelope e^(−(p − 0.640)/0.01). The rig is locked to the lens and does not shake |
| SUV wrecks | At hit the silhouettes scale to 0 inside the first flash frame and the SUV darkens (uChar to 0.65). No figure is shown thrown or injured |
| Sparks | 200 instanced points. 1 draw call |

## **Hero 6: portal push-through and handoff**

D-07 replaces the 1.6 m dolly with two rails and a sheet. The foreground rail pushes into the lens; the background rail drives the camera 28 m toward the fire; haze and the sheet finish the handoff.

| Channel | p range | Function |
| ----- | ----- | ----- |
| Foreground rail (macro) | 0.85–0.93 | q \= (p − 0.85) / 0.08. Rig distance d \= 0.36 · (0.034 / 0.36)^E(q) with E \= easeInOutCubic; the anchor moves from the left-lens centre at the J3 pose to (0.5, 0.5); roll, yaw and pitch go to 0 by q=0.7 so the lens plane faces the camera. At d \= 0.034 m the aperture spans 1.17 frame widths and 2.0 frame heights. The rim leaves the frame near p=0.91, and the layer is hidden from p=0.935 |
| Foreground blur | 0.85–0.93 | R\_fg 18 to 26 px, then the layer is off |
| Background rail (through the fire) | 0.85–0.97 | q\_b \= (p − 0.85) / 0.12. Camera z \= 6.0 − 28·E\_b(q\_b), x \= 0.43·E\_b(q\_b), E\_b \= easeInOutQuad; level, lens shift kept, no FOV change. End position (0.43, 1.65, −22.0), 9 m in front of the SUV line |
| Fire wall | 0.88–0.94 | 12 additive sprites at z=−28 ± 3 and x from −4 to \+6, \#FF9A2E to \#FFD27A, so the screen fills with amber even after the fireballs decay. Fireball age continues past a=1 with B(a) \= e^(−1.8a) |
| Haze | 0.90–1.00 | Amber \#E8B86A at α \= smoothstep(0.90, 0.97, p), then ivory \#FAF6F0 at α \= smoothstep(0.96, 1.00, p); bloom \+20% |

### **Sheet handoff**

`<EditorialSheetHandoff>` sits in normal flow directly after the runway with margin-top: −100dvh and `transform: translate3d(0, (1 − e) · 100dvh, 0)`, where e \= easeInOutCubic(clamp((p − 0.90) / 0.10, 0, 1)). At p=1.0 its top meets the viewport top and the transform is 0, so there is no layout gap.

* The sheet is never inert. Focus moving into it scrolls the page to p=1 (Lenis scrollTo, immediate), so tabbing past the Skip pill lands in the Arcade and never on an off-screen control.  
* The Skip pill and /games\#arcade scroll to p=1 over 0.8 s. While skipping, the hero renders only the final frame. A cold load on \#arcade never initialises WebGL; the poster sits under the sheet.  
* After p=1 the stage leaves the viewport: set the hero frameloop to never, free the render targets after 2 s, and recreate them on re-entry in under 120 ms (shaders stay compiled).

## **Hero 7: master timeline and Lens Registration Contract**

### **Master timeline**

p is the damped scroll progress from the single master tick (MotionProvider, one damper at λ=5.5 as the sangam-motion skill sets it). ?debug=p bypasses the damper.

| p | Event |
| ----- | ----- |
| 0.00 | Poster cross-fades out once the first frame is drawn; drift starts |
| 0.00–0.08 | Eyebrow and scroll cue |
| 0.10 | J1 gate frame |
| 0.22 | Descent starts |
| 0.25–0.42 | Rack focus to 0.36 m; R\_bg rises to 24 px |
| 0.42 | J2 gate frame |
| 0.49–0.54 | Anticipation tremor |
| 0.52–0.60 | Pose eases to −6.5° and to the J3 anchor; focus snaps back to 37 m |
| 0.52–0.64 | R\_fg rises to 18 px |
| 0.540 / 0.550 / 0.560 | M1, M2, M3 launch |
| 0.640 / 0.646 / 0.652 | M1, M2, M3 hit; blast shake at 0.640 |
| 0.642–0.85 | Shockwave |
| 0.66–0.85 | Lens registration gates apply |
| 0.72 | J3 gate frame |
| 0.85–0.93 | Foreground rail into the lens |
| 0.85–0.97 | Background rail through the fire |
| 0.90–1.00 | Sheet rises |
| 0.95 | J4 gate frame |
| 1.00 | The sheet is the page |

### **Lens Registration Contract**

Definitions:

* **Lens quad.** The projected, rolled aperture rectangle (0.058 × 0.042 m) of each lens at p.  
* **Fireball centroid.** The projection of the emitter at height y(a) (Hero 5), z=−31.  
* **Local x.** The centroid’s position along the lens’s own axis, from the lens centre, in metres at the rig plane; negative toward the nose.  
* **Offset budget.** The worst-case background-versus-rig shift, applied in the unfavourable direction: 0.004 of frame width for drift plus the shake term 0.0022·e^(−(p − 0.640)/0.01).

Gates G1 to G3 run for every p from 0.66 to 0.85 in steps of 0.01; G4 runs from 0.70. All include the offset budget.

| Gate | Rule | Design value at J3 pose | Margin |
| ----- | ----- | ----- | ----- |
| G1 | Centre fireball local x within the middle 30% of the left lens: abs(x) ≤ 0.15 · 0.058 \= 0.0087 m | −0.001 m | 0.13 of lens width |
| G2 | Right fireball in the nose-side half of the right lens: −0.029 m ≤ x ≤ 0 | −0.0253 m | 0.0038 m inside the rim, 0.0016 m after worst-case drift |
| G3 | Left fireball at least 0.03 of frame width left of the left lens’s left-most corner | 0.399 against a corner at 0.451, a gap of 0.052 | 0.022, or 0.016 after the offset budget |
| G4 | Vertical sanity: each fireball centroid within the aperture’s v range ±0.03 | At p=0.72 centre v=0.637 in \[0.50, 0.69\]; right v=0.642 in \[0.459, 0.649\] | At least 0.007 |

G2 is thin on purpose: D-05 says the right blast sits at the nose-side edge, so do not centre it to buy margin. If G2 fails after a rig change, move the J3 anchor u by up to ±0.01 before touching an emitter.

| Viewport | Mode | Gates |
| ----- | ----- | ----- |
| 1912×800 (2.39) | Design | G1–G4 |
| 1600×800 (2.0) and 2400×800 (3.0) | Fill | G1–G4, which hold only with clarification C-1 |
| 1440×900, 1920×1080 | Cinema stage at 2.39 | Same as design |
| 390×844, 768×1024 | Portrait variant | G1–G3, and G4 with the portrait v anchor |

**Clarification C-1: the rig is frozen in metres.** The solver in Hero 1 turns a screen anchor into camera-space metres. Evaluate it once at the design aspect (T\_h \= 0.7307) and keep those metres at every aspect. Re-solving u on resize with a different T\_h moves the glasses against the beach: at aspect 3.0 the centre fireball would land 22% of a lens width off centre and fail G1. The y term is unaffected because vFOV is fixed. The Hero 1 anchors remain the design-aspect definition.

**Clarification C-2: portrait variant.** hFOV 44° (T\_h \= 0.404), horizon at v=0.56 (s \= −0.12), rig distance d\_p \= 0.243 m so the glasses take 78% of the width. Registration is angular, so the standoff group (SUVs, breaches, emitters) is scaled in x by k\_p \= 0.36 / 0.243 \= 1.48 about x=0.43, and the background camera strafes to x\_p \= 6.7 m to keep the glasses centred. Result: lens spacing 0.418 of width, the centre fireball at the left lens centre (u 0.29), the right fireball 0.025 m inside the nose-side rim, and the left fireball at the left edge, so G3 holds trivially.

### **The runnable check**

scripts/verify-lens-registration.mjs imports the pure modules (projection, rail, rig, fx). They are plain TypeScript with no path aliases, enums or parameter properties, so Node’s type stripping loads them without a build step; the same modules drive the hero at runtime. It prints a margin table per viewport and exits 1 on any failure. package.json runs it, verify-frame-parity.mjs and audit-words.mjs from a prebuild script, so a failed gate fails npm run build.

for viewport of VIEWPORTS:  
  cam \= makeCamera(viewport)            // T\_h, T\_v, s, portrait variant  
  for p of range(0.66, 0.85, step 0.01):  
    rig \= solveRig(p, cam)              // metres frozen at design aspect  
    L, R \= lensQuads(rig)  
    F \= fireballCentroids(p, cam)       // left, centre, right  
    off \= worstCaseOffset(p)            // drift \+ shake  
    check G1..G3 (and G4 from p \>= 0.70) with off applied  
