# Creative Brief: "Emblem Engine"
### OSU Tamil Sangam — Redesign Ground Truth

*Adopted September 20, 2026*

---

## 1. The Core Idea

The landonorris.com site works because everything is built from the driver's identity objects (the helmets, the signature, the playable "drive" intro), then given weight through scale, pinned scroll sequences, and tactile hover details. The Tamil Sangam version builds everything from **the emblem**: a purple roundel, a lilac Tamil-script watermark, ivory lettering, and a mint 3D extrusion.

**The roundel is the site's engine.** It is the loader, the cursor ring, the scroll-progress dial, the page-transition iris, the hero object, the ticket stub's die-cut, and the favicon. **The mint extrusion is the motion language:** elements have physical depth. They tilt with the pointer, press flat on scroll, and pop when activated.

**"Tamil fashion" means Tamil visual culture, used specifically:**

| Source | Used for |
|---|---|
| **Kolam** (dot-grid line art, drawn in rice flour) | Loader, line-draw reveals, icons, dividers, the interactive centerpiece |
| **Kanchipuram-style woven temple borders and zari** | Scrolling border marquees between sections; a gold "thread" specular sweep on hover |
| **Athangudi-style geometric floor tiles** | Background textures for panels |
| **Palm-leaf (*ola*) manuscripts** | The Events Reel: each event is a long horizontal leaf strip |
| **Gopuram silhouettes** | Skyline and layered parallax, treated respectfully and never gamified |
| **Jasmine strings, banana leaf feast, filter coffee** | Kondatam and Interval visuals: tactile, food-forward, funny |
| **Parai, thavil, nadaswaram, bells** | Sound cues (opt-in) |

---

## 2. Motion Vocabulary

| Pattern | Tamil Sangam Translation |
|---|---|
| Playable intro, lock/scroll toggle | **Kolam Boot**: a kolam draws itself as the loader; skippable from first paint; "Explore ↔ Scroll" toggle later |
| Giant edge-to-edge type | Hero wordmark spans the full viewport width with **live mint extrusion** that shifts with the cursor |
| Pinned, scrubbed sections | **Pillars triptych** and **Five-Landscape journey** pinned and scrubbed |
| Marquee with velocity skew | **Woven-border marquees** carrying "ஆட்டம் · பாட்டம் · கொண்டாட்டம்" and motifs |
| Hover-swap Hall of Fame | Events list: hover reveals the event photo in a roundel mask that follows the cursor |
| Horizontal photo runs | **Ola-leaf event rail** and film-strip galleries |
| 360° object | The emblem as a 3D medallion; optionally a *pongal paanai* (pot) object |
| Signature draw-on | Kolam line draw-on for section headings and dividers |
| Big footer with interactive vector | Giant extruded wordmark + interactive kolam + rolling credits |
| Page transitions | **Roundel iris wipe** from the click point |

---

## 3. Home: The Sequence (Desktop; Mobile keeps the order, simplifies effects)

```text
1  BOOT       kolam draws around the roundel -> roundel "assembles" -> wipe to hero
2  HERO       full-width extruded wordmark; roundel medallion tilts to pointer;
             next-event ticker as a woven border strip (real date, real link)
3  MANIFESTO  pinned; 3-4 lines of copy reveal line by line, words fill mint as you scroll;
             a Tamil phrase interleaved (real content, not decoration)
4  PILLARS    pinned triptych: Aatam / Paatam / Kondatam each take the screen with
             a roundel-mask wipe, real footage, giant Tamil script behind, its own sound cue
5  FLAGSHIP   "Now Showing" poster + ticket stub with perforation that tears on scroll;
             countdown with optional Tamil numerals
6  EVENTS     horizontal ola-leaf rail (upcoming -> past), hover list w/ roundel-mask photo
7  LANDSCAPES pinned journey through the five tinai: sky, flora, sound, and one line of
             "what we do" each; the site's atmosphere hands off to the current landscape
8  VAULT      draggable photo strips; photos resolve from a Tamil-glyph mosaic
9  INTERVAL   filter-coffee steam shader; film-leader countdown; Join CTA
10 FOOTER     giant extruded wordmark, woven border, interactive kolam, rolling credits
```

**Boldness budget:** spend it on **three** things: the medallion + extruded wordmark, the pinned pillars triptych, and the roundel iris transitions. Everything else stays quiet and disciplined so those land.

---

## 4. Type & Color Rules

- **Palette**: Derived from the real pixels of the official emblem. Royal purple (`oklch(0.38 0.22 305)`), mint (`oklch(0.78 0.16 168)`), lilac (`oklch(0.86 0.09 300)`), ivory (`oklch(0.98 0.015 85)`), plus solar gold and coral. Use gold only as "zari" (thin threads, sweeps), never as a wash.
- **Display type**: Heavy geometric lettering for Latin (`Clash Display`). For Tamil display, pair with matching weight (`Mukta Malar` / `Anek Tamil`).
- **Tamil rules**: `lang="ta"` on Tamil text; `letter-spacing: 0`; no uppercase transforms; line-height ≥ 1.6 for Tamil body; subset by Unicode range U+0B80–0BFF; never split Tamil by code unit.
- **No mono eyebrows, no middot chains, no arrows on links** unless they encode information.

---

## 5. Copy Voice & Ban List

- **Tone**: Specific over clever; concrete nouns; plain verbs; sentence case; bilingual pairs where it helps navigation.
- **Strict Ban List**: "high-octane," "camaraderie," "electrify," "vibrant," "authentic," "immersive," "journey" (except literal Paalai landscape), "unlock."
- The club is **Tamil**, so say Tamil. Name real events, real dishes, real instruments.
- Buttons say what happens: "Buy Pongal tickets," "Join the GroupMe," "See every event."
