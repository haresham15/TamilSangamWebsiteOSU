# PRD — Gallery Hero: "Vaaranam Aayiram" Cinematic Journey (v2 Rebuild)

**Project:** OSU Tamil Sangam website (Next.js 16 · React 19 · Tailwind 4 · three 0.186 · GSAP · Framer Motion)  
**Surface:** `/gallery` — hero section only (the masonry grid below it is out of scope except for the hand-off)  
**Status:** Rebuild. The v1 hero is to be discarded, not patched.  
**Audience:** The developer/AI coding agent implementing it. Read Section 11 before starting.

> **Note on sources:** This PRD is based on a screenshot of the v1 hero, `package.json`, `DESIGN.md`, and the original concept brief. The `src/` tree could not be read when this was written, so **Phase 0 is a mandatory audit** of the existing gallery code before anything is deleted.

---

## 1. Problem statement

### 1.1 What v1 looks like

A pure black canvas containing a flat, visibly faceted dark-red circle with a flat cream disc inside it, six thin horizontal grey bars running edge to edge, and one hard-edged tan rectangle across the middle. No sky, no sea, no road, no haze, no photos. The HUD text ("VELOCITY PLUCK: STRINGS AT REST", "SCROLL SPEED PLUCKS STRINGS", "DOLBY GOLDEN HOUR") reads like debug output.

### 1.2 Root causes

| # | Observed | Root cause | Consequence |
| :--- | :--- | :--- | :--- |
| 1 | Circle has ~24 visible facets | Sun is a low-segment geometry with a flat unlit material | Reads as clip-art, not a sun. Needs a shader-based radial falloff + bloom, never geometry edges. |
| 2 | Black void behind everything | No sky gradient, sea, horizon, road, or silhouettes were built | The "coastal highway at golden hour" is entirely missing. |
| 3 | Grey bars | Strings are flat-shaded cylinders with no environment reflection, no thickness variation, no perspective, no depth of field | They read as UI dividers. Metal needs something to reflect. |
| 4 | Tan rectangle at mid-height | Unexplained hard-edged glow plane (probably a "pluck glow" quad) | Stray artifact. Glow must be emissive + bloom, not a rectangle. |
| 5 | No Polaroids | Spawning is gated on scroll velocity, so **the resting state is an empty scene** | First impression, with no scrolling yet, is dead. The hero must be beautiful at rest. |
| 6 | No post-processing | `three` only; no bloom, god rays, DOF, grain, vignette, flare | Without these, WebGL never looks "cinematic". Most of the film look comes from post. |
| 7 | Text HUD dominates | Interface stands in for the experience | Diegetic feedback (strings glowing, photos flowing) should replace labels. |
| 8 | Whole thing built in one pass | No art direction, no reference frames, no visual checkpoints | The agent couldn't see its output and had no target to match. |

### 1.3 Core creative diagnosis

The v1 brief described *behaviour* (velocity → vibration → spawn) but never described the *frame*, i.e. what a still from this sequence looks like. A cinematic hero is judged by its stills first and its motion second. This PRD therefore specifies the **hero frame** in detail before any interaction logic.

---

## 2. Goals, non-goals, success criteria

### Goals

1. **Screenshot-worthy at every scroll position.** Any frame captured at 0, 20, 45, 70, 90% could be a film still.
2. **Alive at rest.** Never a static frame: camera drift, sea glitter, haze, dust, ambient string sway, and Polaroids already drifting on load.
3. **Scroll is physical.** Scroll velocity plucks strings, strings spawn memories, and the response feels weighted and musical.
4. **Legible memories.** Photos are recognisable and clickable, never just flying blurs.
5. **A seamless dissolve** into the masonry grid via a blinding sunset flash.
6. **Brand-coherent.** Sunset palette blends into the existing Sangam purple/mint/gold system and the "Paalai" theme.

### Non-goals

- No audio in the default experience (optional opt-in P2 in 5.10).
- No use of film footage, stills, music, logos, or title art. This is an **original homage in mood only**; all assets are procedural or the Sangam's own photos.
- No scroll-jacking (native scroll stays native).
- No full 3D-modelled highway. Scenery is layered 2.5D (Section 4.2).

### Success criteria

| Metric | Target |
| :--- | :--- |
| Visual gate | All 6 checkpoint screenshots (Section 8) pass the "film still" checklist |
| Frame rate | ≥ 55 fps median on M1 MacBook Air @ 1440p; ≥ 30 fps on a mid-range Android |
| Hero JS chunk | Lazy-loaded, ≤ 500 KB gzip, not in the main bundle |
| Poster LCP | < 2.5 s (server-rendered poster shows before WebGL boots) |
| Time to first pluck-ready | < 3 s after poster on broadband |
| Reduced motion | Fully usable, no plucks/flash, direct route to grid |

---

## 3. Creative direction

### 3.1 One-line pitch

*Driving the East Coast Road at golden hour, looking through the strings of a guitar as they ring with every scroll, while old Sangam memories drift out of the haze toward you.*

### 3.2 Mood

Warm, nostalgic, a little melancholy, unhurried. Think 35 mm anamorphic film: soft halation, lifted blacks, warm-orange highlights, teal-tinted flares, visible grain. **Not** neon, not sci-fi, not glossy CGI.

### 3.3 Palette (tie into DESIGN.md tokens)

| Role | Value | Notes |
| :--- | :--- | :--- |
| Sky zenith | `#170d2b` | Deep dusk violet, echoing brand Royal Purple `#4c2472` |
| Sky upper-mid | `#4c2472` → `#8a2f5b` | Brand purple bleeding to plum |
| Sky lower-mid | `#e2553f` (coral) | Kumkumam coral family |
| Horizon band | `#ff9a3c` → `#ffc86b` | Solar gold family (`#f59e0b`) |
| Sun core | `#fff4d6` | Over-exposed; bloom does the rest |
| Sea | `#2a1a3a` base, glitter `#ffd08a` | Reflects sky, never flat blue |
| Silhouettes | `#0d0709` with a 6% warm rim | Palms, poles, hills |
| Anamorphic flare | **Brand mint `#55CCA2`** | Teal streaks against orange are the classic film look and reuse the brand accent |
| Paper (Polaroid) | `#f6efe0` | Warm ivory, never pure white |

### 3.4 Camera language

- First-person, eye height ≈ 1.4 m, slow forward dolly along the road.
- Anamorphic feel: FOV 36–42°, subtle horizontal-only lens-streak on highlights, gentle barrel/vignette, optional 2.39:1 letterbox bars that fade out on the final flash.
- Handheld micro-sway: ±0.4° roll, ±0.02 m positional noise (low-frequency simplex).
- Shallow DOF: strings (very near) are soft when at rest and snap to focus on pluck. Scenery is sharp. Polaroids are in focus in mid-range and soft when very near/far.

### 3.5 The "hero frame" (what every reviewer should see at ~20% scroll)

Horizon at ≈ 40% up from the bottom. A large low sun sits just above it, slightly right of centre, with a wide golden halo, god rays fanning through thin cloud bands. The road leads to the sun in perspective, with worn white dashes. On the left, tall casuarina/palm silhouettes and roadside poles slide past. On the right, sea with a shimmering glitter path. Layered blue-purple headlands sit in the far distance, each layer hazier. Six polished strings cross the near foreground, catching orange highlights, with two or three softly out of focus. Three to five Polaroids drift at varying depths, some still hazy in the distance, one large and crisp in mid-ground with a warm rim light. Fine dust motes glow in the sun shafts. Film grain and a soft vignette sit over everything.

---

## 4. Technical architecture

### 4.1 Stack decisions

| Concern | Decision | Rationale |
| :--- | :--- | :--- |
| 3D renderer | `three` (already installed) via **`@react-three/fiber` v9** + **`@react-three/drei`** | R3F v9 targets React 19. Declarative scene, `useFrame` loop, easy disposal. (Compatible with three 0.186). |
| Post-processing | **`@react-three/postprocessing`** (uses `postprocessing`) | Bloom, GodRays, DepthOfField, Vignette, Noise/Grain, ChromaticAberration, custom effects. |
| Smooth scroll + velocity | **`lenis`** | Provides smoothed `velocity` for plucks without hijacking native scroll. |
| Scroll timeline | **GSAP ScrollTrigger** (already installed) | Master timeline + pinning + `scrub`. |
| DOM overlays / lightbox | Framer Motion (already installed) | `layoutId` morph from Polaroid to lightbox per DESIGN.md. |
| Debug tuning | **`leva`** (dev only, behind `?debug`) | Live tuning of constants in Section 12. |
| Screenshot QA | **Chrome DevTools MCP / Browser Subagent** | Automated frame captures at key scroll positions. |

### 4.2 Scenery approach: 2.5D diorama, not a full 3D world

Sky, sun, sea, hills, and cloud bands are **fullscreen or large shader planes at fixed depths**. The road is a perspective plane with a procedural shader (asphalt noise, scrolling dashes, edge lines). Palms and poles are **alpha silhouette cards or low-poly instanced meshes** spaced along the roadside, recycled as they pass. Only **strings** and **Polaroids** are true 3D objects. This is cheaper, far more controllable, and gives painterly parallax.

---

## 8. Delivery plan and screenshot gates

| Phase | Deliverable | Gate (must pass) |
| :--- | :--- | :--- |
| **0. Audit & scaffold** | Read the current gallery code; remove v1 hero; scaffold the component tree, `progressRef`, debug panel; poster placeholder | App builds; empty canvas mounts once; no leaks in dev Strict Mode |
| **1. The beauty frame (static)** | Sky, sun (shader), sea + glitter, hills, road, roadside silhouettes, haze, dust, Bloom, GodRays, grain, vignette, tone mapping. No strings or photos yet. | **Screenshot at p=0 reads as a golden-hour photograph.** No visible facets, rectangles, or banding. |
| **2. Strings** | Six materials, environment lighting, modal shader, energy model, pluck bus, pointer plucking, DOF focus pull, emissive bloom | Screenshots at rest and mid-pluck: metal reflects orange; vibrating strings blur/glow convincingly; settle in 2–3 s |
| **3. Polaroids** | Pool, frames, photo pipeline, spawn logic, wind shader, hero cards, hover/click, lightbox | 4+ legible photos in frame at p=0.25; flutter looks like paper; emergence from haze is smooth |
| **4. Choreography & finale** | Lenis + ScrollTrigger master timeline, camera moves, approach, blinding flash, mint anamorphic streak, wash, canvas teardown, seamless grid reveal, reverse scroll | Screenshots at p = 0, 0.2, 0.45, 0.7, 0.9, 1.0 all pass; no visible seam at hand-off |
| **5. Polish, perf, a11y** | Adaptive tiers, fallbacks, reduced motion, skip link, mobile tuning, overlay copy, safe zones | Meets all metrics in Section 2; Lighthouse a11y ≥ 95 on the page |

---

## 9. Cinematic Intent, Movie Connections & Easter Eggs

### 9.1 The *Vaaranam Aayiram* (2008) Homage

The `/gallery` hero is a deeply personal love letter to Gautham Vasudev Menon’s coming-of-age classic *Vaaranam Aayiram*, starring Suriya, with music by Harris Jayaraj:

- **The 24-Fret 12-TET Acoustic Highway:** Modeled after Suriya’s acoustic guitar from "Mundhinam Paarthéney" and "Nenjukkul Peidhidum". The fretboard is not merely a metaphor—it is a physical 3D highway representing the musical journey of college life, from open mic jams on the South Oval to late-night dorm room acoustic sessions.
- **The Single Red Rose Contact Brake ($p = 0.52$):** At 52% scroll progress, a single red rose lands softly on the vibrating guitar strings—referencing the iconic train journey and Berkeley street romance where Suriya pursues Meghna with a single red rose. The impact dampens the high-frequency vibration and triggers a golden dust explosion.
- **The Military Dog Tags ($p = 0.755$):** At 75.5% scroll progress, silver military dog tags drop onto the frets with a metallic clink, symbolizing the loss, resilience, maturity, and brotherhood that college students experience as they grow into adults.
- **Sunset Flare Dissolve:** The blinding golden-hour sunset flare washes the entire screen, mirroring the cinematography of R. Rathnavelu, before dissolving seamlessly into the 35mm archival memories of the student gallery.

### 9.2 Tying Together the Content: From Fretboard to Physical Memories

The transition from the 3D acoustic fretboard highway into the **Canvas (35mm Archival Masonry)** below is intentional and narrative-driven:

1. **Musical Vibrations Spawn Memories:** In the 3D scene, plucking strings ejects floating Polaroid film frames into the coastal air.
2. **The Archival Masonry Below:** When the camera reaches the end of the fretboard, the floating memories settle onto an expansive Warm Ivory (`#FAF9F6`) field—an interlocking masonry grid with wide gaps, tag filtering, and authentic student consent controls.

### 9.3 Hero Media Artifacts

- **Video Capture:** [`docs/heroes/media/gallery_hero_animation.webm`](./media/gallery_hero_animation.webm)
- **Animated GIF:** [`docs/heroes/media/gallery_hero_animation.gif`](./media/gallery_hero_animation.gif)
- **Rest Frame (p=0):** [`docs/heroes/media/gallery_hero_rest.png`](./media/gallery_hero_rest.png)
- **Mid-Scroll (Strings Vibrating & Rose Landing):** [`docs/heroes/media/gallery_hero_mid.png`](./media/gallery_hero_mid.png)
- **Sunset Handoff Reveal:** [`docs/heroes/media/gallery_hero_reveal.png`](./media/gallery_hero_reveal.png)
