# Project Aintinai (ஐந்திணை) — OSU Tamil Sangam Website

**PRD v0.2 (Draft for board review)** · September 20, 2026 · Owner: Haresh
**v0.2 change:** merges the strongest ideas from a second, Gemini-generated PRD (cinematic grading, magnetic/cursor UI, liquid-distortion roster, semantic photo search, cross-route image flights, UI sound design, and more). Full disposition of every idea, including what was changed or declined and why, is in **Appendix E**.
**Working title:** *Aintinai* — after the five landscapes of classical Sangam poetry, which become the site's visual and structural system.
**Brand line (from the club's current Linktree):** "Start the Aatam, Paatam, and Kondatam!" — ஆட்டம் · பாட்டம் · கொண்டாட்டம்

> All Tamil copy in this document is **draft** and must be reviewed by a native Tamil reader before it ships.

---

## 0. TL;DR

The club currently lives on a Linktree: two social links, a ticket link, two Google Forms, a GroupMe, and two photo folders. There is no page that says what the club *is*, who runs it, what it has done, or what is coming.

This project replaces that with a single destination that is (a) genuinely useful in two taps, and (b) unlike anything else on a campus club site.

**The concept.** Classical Tamil poetry organizes the world into five landscapes (*aintinai*), each tied to a mood and a time of day. The site *is* that map. Scrolling the home page is a climb up a procedurally generated *gopuram* (temple tower) whose five tiers are the five landscapes; each landscape is a section of the club. The atmosphere of the whole site follows the traditional five divisions of the Tamil day, based on the visitor's local time.

**Seven signature moments** (the "you have to see this" list):

1. **Kolam Boot** — the loader is a kolam drawing itself in rice-flour grain; load progress = kolam completion.
2. **Gopuram Ascent** — the home page is a scroll-driven WebGPU ascent through five tiers.
3. **Yali Particles** — a GPU particle creature that follows the cursor and morphs into Tamil letters (தமிழ்).
4. **Glyph-Mosaic Photos** — every photo resolves out of a mosaic of Tamil characters instead of a blur-up.
5. **Tamil Sky** — the site's lighting and palette shift through *vaigarai → nanpagal → erpaadu → maalai → yaamam* with the visitor's clock.
6. **Cinematic Grade** — real footage from club events, color-graded in DaVinci Resolve and re-graded live in the browser with 3D LUTs, one look per landscape and time of day; events get "Now Showing" posters and short trailers.
7. **Liquid Roster** — hover a board member's name and the club mark liquefies into their portrait; alumni boards are archived as magazine "issues" with oversized editorial type.

**The rule that keeps it usable:** *complex on the inside, obvious on the outside.* Every core task (next event, tickets, join, contact) is reachable in ≤2 taps from anywhere, the whole show can be skipped or downgraded at any time, and a full no-JS HTML baseline exists for everything.

---

## 1. Background and current state

### 1.1 Linktree audit (linktr.ee/osutamilsangam, checked Sep 20, 2026)

| Current link | Problem | Replacement in this PRD |
| --- | --- | --- |
| Instagram, TikTok | Outbound only; no content inside the site | Social section + shareable cards; in-app-browser-friendly bio hub (`/links`) |
| Powerhouse Pongal tickets (Square link) | Seasonal; someone must manually swap it | Event page with ticket CTA that auto-expires; per-event QR + short link |
| Powerhouse Pongal performance interest form (Google Form) | Responses live in a personal Google account | In-site form, admin export, board-owned data |
| Join our GroupMe | Only path to community; no context | Join hub with "what to expect" |
| Mailing list (Google Form) | No confirmation, no segmentation | In-site signup with double opt-in |
| TT/TS Diwali photo folders — Pattas Tappas 2025 (Google Drive + Google Photos, two folders) | Not browsable, no captions, no history, links rot | Real albums with search, lightbox, and archive |

**Missing entirely:** what the club is, mission, initiatives, board/officers, past-events history, calendar, FAQ, contact, sponsors/collabs, alumni.

### 1.2 Inspiration analysis

**recent.design** is a curated gallery, so the takeaway is a *vocabulary of current interaction patterns*, not one layout. Items on its front page at time of review include: holographic card effect, ASCII image loader effect, 3D vinyl player, WebGL particle creature, liquid glass hero, expanding card transitions, infinite FAQ, reveal-to-copy, voice glow, and slingshot OTP input. Borrowed and adapted here:

| Pattern seen | Aintinai adaptation |
| --- | --- |
| ASCII image loader | **Glyph-mosaic loader** using Tamil characters, not Latin ASCII |
| Holographic card | **Board trading cards** (foil shader; Tamil name in script on the front) |
| WebGL particle creature | **Yali / Mayil particle mascot** |
| Expanding card transitions | Event card → event page shared-element transitions (View Transitions API) |
| Liquid glass | Floating nav/utility bar (progressive enhancement, Chromium-first) |
| Voice glow | **Ask Sangam** voice mode |
| Reveal-to-copy | Copy GroupMe / email / short-links |
| Infinite FAQ | FAQ that loops in both English and Tamil |
| 3D vinyl player | **Sangam Sessions** 3D audio player for original club performances |

**landonorris.com** is the complexity benchmark. What it does (from the page as served): an interactive "vertical drive" intro with a lock / "back to scroll" toggle, pinned and horizontal-scroll photo sequences with captions, a signature that is drawn on, a hover-swap "Hall of Fame" grid (each item ships a base and a hover image), a 360° object viewer, and asset names that suggest Rive-powered interactive footer and partner modules. Borrowed and adapted:

| Pattern seen | Aintinai adaptation |
| --- | --- |
| Playable intro with scroll/lock toggle | **Gopuram Ascent** with "Explore ↔ Scroll" toggle; skippable from first paint |
| Helmet Hall of Fame (hover-swap grid) | **Events Hall of Fame** — poster on rest, best photo on hover |
| Signature draw-on | Hand-lettered "தமிழ் சங்கம்" drawn stroke by stroke |
| 360° helmet | Spinnable 3D **pongal paanai** (pot) / *thavil* / *veena* hero objects |
| Rive footer | Interactive kolam/dancer footer that reacts to the cursor |
| Horizontal photo runs with captions | Gallery "film strips" per event |

---

## 2. Goals, non-goals, success metrics

### 2.1 Goals

1. **Replace the Linktree** as the club's primary link (Instagram/TikTok bio, flyers, QR codes).
2. **Explain the club** clearly to a first-time visitor in under 30 seconds.
3. **Preserve institutional memory**: events, photos, boards, and initiatives archived by academic year.
4. **Make officers' jobs easier**: any officer can publish an event or album without touching code.
5. **Be culturally rich and specific**, not "generic South Asian": rooted in Tamil literature, architecture, art forms, calendar, script, and diaspora.
6. **Be the most technically ambitious site the builder has shipped**, without sacrificing usability, accessibility, or performance.

### 2.2 Non-goals

- Not a social network. No public user-generated feeds.
- No account required to browse, RSVP by email, or join the mailing list.
- No autoplaying audio, ever.
- No political content or commentary. The site is cultural and community-focused.
- Not a replacement for GroupMe/Instagram day-to-day chat.

### 2.3 Success metrics (proposed baselines; recalibrate after one semester)

| Area | Metric | Target |
| --- | --- | --- |
| Adoption | Share of Instagram/TikTok bio traffic routed through the new site | 100% by the second week after launch |
| Task success | New users finding "next event" and "how to join" within 10 seconds (5-person hallway test) | ≥ 90% |
| Growth | Mailing-list signups per semester vs. Google Form baseline | +50% |
| Conversion | Event page → RSVP/ticket click-through | Track; improve each event |
| Content ops | Time for an officer to publish an event / upload a 50-photo album | ≤ 5 min / ≤ 10 min |
| Performance | Core Web Vitals at p75, mobile (LCP / INP / CLS) | ≤ 2.5 s / ≤ 200 ms / ≤ 0.1 |
| Accessibility | axe critical + serious violations on key flows | 0 |
| Delight | Culture Lab sessions per unique visitor; shares of generated kolams/names | Track |
| Sustainability | Board can operate the site with the handbook and no builder involvement | Verified by a hand-off drill |

---

## 3. Users and top tasks

| Persona | Who | Top tasks |
| --- | --- | --- |
| **The Curious Newcomer** | First-year or transfer student, Tamil or not, arrives from Instagram/TikTok in an in-app browser | What is this? Is it for me? When is the next thing? How do I join? |
| **The Member** | Attends regularly | Event details, tickets/RSVP, add to calendar, find my photos, GroupMe |
| **The Performer** | Dancer/singer/instrumentalist | Interest forms, rehearsal info, performance videos |
| **The Officer** | Board member, non-developer | Publish events, upload albums, export RSVPs, update roster, post announcements |
| **The Alum / Family / Community** | Past members, parents, Columbus Tamil community | Past boards, albums, event info, ways to help |
| **The Partner** | Other student orgs, sponsors, university staff | Who are you, past collabs, contact, media kit |

**Primary entry context:** a phone, inside the Instagram or TikTok in-app browser, on cellular data. Design for that first (see §8.2).

---

## 4. Creative concept

### 4.1 *Aintinai* — the five landscapes

In classical Sangam poetry (*akam* tradition), the world is organized into five landscapes, each with a mood and a time of day. We use them as **atmosphere and structure**, not as literal romance themes. Every section keeps a plain-language English and Tamil title so nothing is cryptic.

| Tinai | Landscape | Traditional time of day (*sirupozhuthu*) | Site section (design choice) | Visual / sonic signature (design choice) |
| --- | --- | --- | --- | --- |
| **மருதம் Marutham** | Farmland, river plains | *Vaigarai* வைகறை (dawn) | **Events** — நிகழ்வுகள் (Pongal is a harvest festival) | Gold-green fields, rising sun, pongal pot boiling over |
| **நெய்தல் Neithal** | Seashore | *Erpaadu* எற்பாடு (sunset) | **Memories / Gallery** — நினைவுகள் | Coral-to-indigo dusk, waves, glyph-mosaic photo shimmer |
| **முல்லை Mullai** | Forest, pasture | *Maalai* மாலை (evening) | **Board & Alumni** — குழு | Jasmine petals drifting, warm lamp light |
| **பாலை Paalai** | Arid land, the road | *Nanpagal* நண்பகல் (midday) | **Initiatives** — முன்னெடுப்புகள் (journeys, outreach) | Heat shimmer, terracotta, long shadows |
| **குறிஞ்சி Kurinji** | Mountains | *Yaamam* யாமம் (midnight) | **Join / Community** — இணையுங்கள் | Deep indigo-violet, kurinji bloom, stars |

**Time-of-day theming:** the site reads the visitor's local time and biases the global palette, sky shader, and ambient light toward the matching landscape (dawn→Marutham, midday→Paalai, sunset→Neithal, evening→Mullai, midnight→Kurinji). A small header chip shows the current division ("வைகறை · Dawn") and lets the visitor pin any landscape manually.

### 4.2 Design pillars

1. **Culture as system, not decoration.** Kolam geometry drives layout grids and loaders; Tamil script is a first-class visual element; the calendar is the Tamil calendar (with Gregorian dates alongside).
2. **Cinematic but legible.** Big moments, calm rest states. Text never competes with a shader.
3. **Bilingual by default.** English ↔ தமிழ் toggle everywhere; Tamil is never a translation afterthought.
4. **Diverse on purpose.** Represent Tamil life broadly: Tamil Nadu regions, Sri Lankan, Malaysian, Singaporean and wider diaspora Tamils; Carnatic, folk, film, and indie music; Bharatanatyam, *kolattam*, *oyilattam*, *parai*, *karagattam*, *kuthu*; multiple faiths and secular traditions; members who are not Tamil.
5. **Respect the sacred.** Temple architecture is used as a motif; deities and sacred symbols are not used in games, transitions, or decorative effects.
6. **Progressive spectacle.** Everything spectacular is an enhancement over a solid, fast, accessible baseline.

### 4.3 Design system (starting points, to be refined in design exploration)

**Palette (OKLCH tokens in Tailwind `@theme`; hex shown as a rough guide):**

| Token | Name | Guide |
| --- | --- | --- |
| `--manjal` | Turmeric | `#F2B705` |
| `--sevvaanam` | Sunset red | `#D6452F` |
| `--neeli` | Indigo | `#1E2A78` |
| `--mayil` | Peacock teal | `#0B7A75` |
| `--sandhanam` | Sandal cream | `#F3E7D3` |
| `--olai` | Palm-leaf green | `#6B8E4E` |
| `--mann` | Terracotta | `#B5573A` |
| `--irul` | Night ink | `#0C0F1F` |

Light/dark via `light-dark()` and a `[data-tinai]` attribute that swaps the accent set per landscape. All text pairs must meet WCAG 2.2 AA.

**Typography (self-hosted, subset, variable where possible):**

| Role | Candidates |
| --- | --- |
| Tamil display | Anek Tamil (variable weight/width) |
| Tamil editorial | Tiro Tamil or Noto Serif Tamil |
| Tamil UI/body | Noto Sans Tamil, Hind Madurai, or Mukta Malar |
| Latin display | A characterful variable serif (e.g., Fraunces or Instrument Serif) |
| Mono / data | Geist Mono or JetBrains Mono |
| Hand-lettered hero | Custom single-stroke "தமிழ் சங்கம்" lettering (commission from a member illustrator) |

**Tamil typography rules (non-negotiable):**

- Set `lang="ta"` on all Tamil text (correct shaping, fonts, screen readers).
- Body line-height ≥ 1.6; Tamil glyphs are tall and need vertical room.
- No `letter-spacing` tweaks or `text-transform: uppercase` on Tamil.
- Normalize to Unicode NFC.
- **Never split Tamil text by code unit or character for animation.** Use `Intl.Segmenter('ta', { granularity: 'grapheme' })` and verify any text-splitting library (including GSAP SplitText) against consonant–vowel combinations and conjuncts before using it.
- Test on real Windows, Android, iOS, and macOS fallback fonts.

**Motion:** GSAP timelines for choreography; spring physics for UI; durations 150–250 ms for UI, 600–1400 ms for scene moves; a global `motion` context that respects `prefers-reduced-motion`.

**Sound (opt-in only):** a global toggle, off by default, remembered per device. Palette: *yazh* (ancient harp), *veena*, *kuzhal* (flute), *parai*, *thavil*, temple-bell textures, and field recordings from members. All audio original or properly licensed; **no film songs**. UI sound design and audio-reactive visuals are specified in §4.5.

### 4.4 Cinematic layer (Tamil-cinema grammar, without borrowed IP)

Tamil cinema's visual language is part of the culture, so the site borrows its *grammar*, not its content:

| Device | Use on the site |
| --- | --- |
| **Film grade** | Event footage graded in DaVinci Resolve (or any grading tool), exported as `.cube` LUTs, and applied live in the browser canvas; one look per landscape, blended by time of day (§6.16) |
| **"Now Showing" posters** | Every major event gets a poster card in the Events Hall of Fame and a ≤ 15 s muted "trailer" loop on its page |
| **Title cards** | Section entries use large Tamil + Latin title-card lockups; optional letterboxed (2.39:1) transitions in Explore mode |
| **INTERVAL card** | A tongue-in-cheek mid-page pause (a nod to the intermission card in Tamil films) on the home page, right before the Join CTA |
| **Rolling credits** | The footer/credits page rolls contributors like film credits (photographers, illustrators, musicians, translators, developers) |
| **Film grain** | A subtle grain overlay on cinematic sections; off in Lite mode |

**Guardrails:** footage comes only from club events; no third-party film clips, stills, songs, or lookalike branding; no depictions of real film personalities; audio is stripped or replaced on muted loops; everyone identifiable in footage is covered by the photo/video policy (§7.5).

### 4.5 Interaction and sound design layer

**Custom cursor and magnetic UI** (desktop, fine-pointer only):

- A cursor *follower* changes state by context (e.g., "Explore" over event cards, "Watch" over video, "Drag" over film strips, "Play" over audio); Tamil labels available in the Tamil locale (draft: ஆராயுங்கள், பாருங்கள்).
- Magnetic buttons pull toward the pointer within a small radius (≤ ~40 px); hit targets stay ≥ 44 × 44 px and never move out from under the pointer.
- **Guardrails:** enabled only for `(pointer: fine) and (hover: hover)`; the system cursor is never hidden over text, inputs, or links; disabled in Lite mode and under `prefers-reduced-motion`; keyboard focus gets an equivalent visible state; touch devices get tap feedback instead.

**UI sound design (opt-in, off by default):**

- Micro-sounds tied to animation timelines via GSAP callbacks: a rice-flour "draw" sound as kolam lines trace, a soft temple-bell tick on landscape changes, a *parai*/*thavil* accent on major transitions, a gentle wood/metal tap on button press.
- Built from Tamil instruments and club recordings rather than generic swooshes; delivered as a single compressed audio sprite to avoid many small requests.
- **Audio-reactive visuals:** a Web Audio `AnalyserNode` feeds shader uniforms so the kolam field pulses with the ambient bed and with Solkattu Pads (§6.7).
- Muted automatically when the tab is hidden; volume is capped; never plays on first load.

---

## 5. Information architecture

```text
/                       Home — Gopuram Ascent (immersive) with plain-content fallback
/links                  Bio Hub — Linktree replacement, ultra-light, no WebGL
/about                  What is a Sangam? Mission, story, FAQ, values, accessibility & inclusion
/initiatives            Aatam · Paatam · Kondatam + mentorship, community, outreach
  /initiatives/[slug]
/events                 Upcoming · Calendar (Gregorian + Tamil) · Archive timeline · Hall of Fame
  /events/[slug]        Details, RSVP/tickets, schedule, map, gallery, feedback
/gallery                Albums by year/event, search, film strips
  /gallery/[album]
/board                  Current board (trading cards) · Alumni boards by year
/join                   GroupMe · mailing list · membership interest · performer interest · FAQ
/culture-lab            Kolam Studio · Solkattu Pads · Tamil Alphabet · Kural of the Day · Your Name in Tamil · Pongal Boil-Over · Sangam Globe
/resources              Columbus guide · Tamil 101 · Festival explainers · Recipes · Playlists
/partners               Sponsors, collaborators, past collabs, media kit, "partner with us"
/ask                    Ask Sangam (AI concierge; also as a global drawer)
/passport               Optional member area: saved events, digital card, Kolam Passport
/under-the-hood         Engineering write-up: architecture, performance, WebGPU, Tamil text engineering
/go/[slug]              Short links with UTM (replaces Linktree link shortener)
/admin                  Board console
/legal                  Privacy, terms, photo policy, accessibility statement
```

**Global UI:** floating utility bar (Events · Join · Search ⌘K · EN/தமிழ் · Sound · Lite mode). Persistent "Skip the show" control from first paint.

---

## 6. Feature specification

**Priority key:** **P0** = must exist at first public launch · **P1** = the immersive/complete v1 · **P2** = stretch / experimental.

### 6.1 Home — Gopuram Ascent

| ID | Requirement | Pri |
| --- | --- | --- |
| HOME-01 | **Kolam Boot loader:** a kolam draws itself on a dot (*pulli*) grid; progress tied to real asset loading; ≤ 2.5 s on Tier B, instant skip available | P1 |
| HOME-02 | Above-the-fold content is real HTML: headline, one-line explainer, next-event card, Join CTA — visible before any WebGL loads | P0 |
| HOME-03 | **Procedural gopuram** (stylized, line-art/shader aesthetic, not photoreal): tiers scale with scroll; each tier is a landscape with its own sky, particles, and audio bed | P1 |
| HOME-04 | **Explore ↔ Scroll toggle** (inspired by landonorris.com's lock/scroll pattern): free-look camera vs. standard scroll; state persisted | P1 |
| HOME-05 | **Yali/Mayil particle mascot:** GPU particles that follow pointer/touch and morph between creature silhouettes and Tamil text targets | P1 |
| HOME-06 | **Event mode:** within 7 days of a major event, the hero re-prioritizes to countdown + ticket CTA; **Welcome mode** during first weeks of a semester | P1 |
| HOME-07 | Time-of-day theming and manual landscape pin (see §4.1) | P1 |
| HOME-08 | Hand-lettered signature draw-on for "தமிழ் சங்கம்" | P1 |
| HOME-09 | Interactive kolam/dancer footer (Rive or custom) with newsletter signup | P2 |
| HOME-10 | Off-main-thread rendering of the hero scene (OffscreenCanvas in a Worker) where supported | P2 |
| HOME-11 | **Cinematic hero reel:** short graded loops of real club-event footage (e.g., Pattas Tappas, Pongal) rendered as a video texture with a live LUT grade (§6.16); HTML poster frame first | P1 |
| HOME-12 | **INTERVAL card** before the Join CTA (see §4.4) | P1 |
| HOME-13 | **Pointer-reactive glowing kolam field:** a TSL shader ground/background whose dot lattice and strokes respond to cursor/touch; doubles as the cheap Tier B background when the full gopuram scene is too heavy | P1 |

### 6.2 About

| ID | Requirement | Pri |
| --- | --- | --- |
| ABOUT-01 | Mission and "who we welcome" statement (**board to confirm wording and membership rules**) | P0 |
| ABOUT-02 | **What is a Sangam?** Short, beautiful explainer on the classical Tamil academies of poets and why the name fits a community | P0 |
| ABOUT-03 | Club timeline (founding → present) as a horizontal scroll narrative with archive photos | P1 |
| ABOUT-04 | Bilingual FAQ (infinite-scroll loop pattern), searchable | P0 |
| ABOUT-05 | Values, code of conduct, accessibility & inclusion statement | P0 |
| ABOUT-06 | "Voices": short member stories (text/audio/video) showing different regions, backgrounds, and roles, including non-Tamil members | P1 |

### 6.3 Initiatives

| ID | Requirement | Pri |
| --- | --- | --- |
| INIT-01 | Three pillars from the club's tagline as top-level cards: **Aatam** (dance), **Paatam** (song/music), **Kondatam** (celebration/community) | P0 |
| INIT-02 | Each initiative page: what it is, who it's for, how to join, schedule, gallery, contact; extensible to mentorship, service, cultural education | P0 |
| INIT-03 | Performer hub: interest forms (e.g., Pongal performance), rehearsal info, past performance videos | P0 |
| INIT-04 | Art-form explainers (Bharatanatyam, *kolattam*, *oyilattam*, *parai*, *karagattam*, *kuthu*, etc.) with short videos, authored by members | P1 |
| INIT-05 | "Start an initiative" pitch form for members | P2 |

### 6.4 Events

| ID | Requirement | Pri |
| --- | --- | --- |
| EVT-01 | Upcoming list + month calendar; each event: date/time, location + map, description, price, capacity, host(s), dress-code note, accessibility info | P0 |
| EVT-02 | **Add to calendar:** ICS download + Google/Apple/Outlook links; subscribable ICS feed | P0 |
| EVT-03 | RSVP (free) and ticketed events; keep the club's current payment processor at first (link-out), integrate checkout in P1 | P0 / P1 |
| EVT-04 | Tickets with QR codes (signed tokens); **check-in PWA** for officers (camera scan, offline-tolerant) | P1 |
| EVT-05 | **Tamil calendar overlay:** festival days and Tamil month names alongside Gregorian dates (curated dataset; verify month boundaries with a tested library or table) | P1 |
| EVT-06 | **Festival explainers** for events tied to festivals: what it is, what to wear, what to expect, what to say (e.g., the Pongal four days: Bhogi, Thai Pongal, Mattu Pongal, Kaanum Pongal) | P0 |
| EVT-07 | **Archive timeline** by academic year; each past event has recap, gallery, performers, credits | P0 |
| EVT-08 | **Events Hall of Fame:** grid where each event shows its poster at rest and best photo on hover (landonorris-style) with shared-element expansion into the event page | P1 |
| EVT-09 | Post-event feedback form (private to board) and attendance analytics for officer reporting | P1 |
| EVT-10 | Structured data (`Event` schema.org) for search-engine rich results | P0 |
| EVT-11 | Event posters auto-generated as kolam-styled share cards (see risk R6 on OG rendering) | P2 |
| EVT-12 | **Events Reel:** in Explore mode, the events section pins and scrolls **horizontally** from upcoming into past initiatives (e.g., Powerhouse Pongal). The vertical list is the default and the keyboard/Lite/reduced-motion fallback; wheel/touch mapping applies only inside the pinned section, tab order follows the DOM, and each card is a real link | P1 |
| EVT-13 | **Poster + trailer per major event:** "Now Showing" poster card and ≤ 15 s muted trailer loop (see §4.4, §6.16) | P1 |

### 6.5 Gallery

| ID | Requirement | Pri |
| --- | --- | --- |
| GAL-01 | Albums by event and academic year; responsive masonry; keyboard-accessible lightbox with captions and credits | P0 |
| GAL-02 | **Glyph-mosaic loader:** each image resolves from a mosaic of Tamil characters (glyph atlas ordered by ink density; driven by a precomputed low-res luminance grid) | P1 |
| GAL-03 | **Film strips:** horizontal, scroll-pinned, captioned runs for featured albums | P1 |
| GAL-04 | Bulk upload (drag-drop) with automatic variants: AVIF/WebP responsive sizes, ThumbHash placeholder, dominant colors, EXIF stripped (incl. GPS), duplicate detection | P0 |
| GAL-05 | **Legacy import:** script to migrate the existing Google Drive/Photos Diwali (Pattas Tappas 2025) folders | P0 |
| GAL-06 | Draft alt text suggested by a vision model at upload; **human must approve** before publish | P1 |
| GAL-07 | **"Request removal"** button on every photo → private queue for officers; target action within 48 hours | P0 |
| GAL-08 | **Memory Vault semantic search:** natural-language queries ("dance performances at Pattas Tappas," "Pongal celebrations"), in English, Tamil, or Tanglish, ranked by embeddings and combined with lexical filters (event, year, performance type, tags). Pipeline: a vision model captions each photo at upload (same pass as GAL-06) → multilingual text embeddings stored in pgvector; optionally add image–text embeddings (CLIP/SigLIP-class). **Scene-and-activity search only: no face embeddings and no search by a person's identity** (see GAL-09) | P1 |
| GAL-09 | **No facial recognition or face-based tagging.** Tags are event/performance-based only | P0 |
| GAL-10 | Download original (opt-in per album) and share individual photos as cards | P2 |
| GAL-11 | **Infinite-scroll masonry** for the Vault: windowed/virtualized rendering, cursor "Explore" state, image preloading, and scroll/grid-state restoration on back navigation; a paginated fallback exists for Lite mode and crawlers | P1 |
| GAL-12 | **Liquid image hover:** displacement-shader transitions on thumbnails (DOM-synced WebGL image planes, §8.2); real `<img>` elements remain the SEO/a11y baseline and the Tier C experience | P1 |

### 6.5b Board & Alumni

| ID | Requirement | Pri |
| --- | --- | --- |
| BRD-01 | Current board with role, short bio, photo; opt-in details only (email/handle if the member chooses) | P0 |
| BRD-02 | **Holographic trading cards** (foil shader responding to pointer/gyroscope; flip for bio; Tamil name in script on front) | P1 |
| BRD-03 | Alumni boards by academic year (archive of officers, themes, signature events) | P0 |
| BRD-04 | **Year Rollover Wizard** in admin: archives the current board, prompts for the new roster, updates the site | P1 |
| BRD-05 | Contributor credits page (photographers, illustrators, musicians, translators, developers); rolling film-credits presentation in Explore mode (§4.4) | P0 |
| BRD-06 | **Liquid Roster (desktop):** an oversized editorial list of names; hovering a name morphs the club mark (or a kolam) into that person's portrait with a displacement-shader transition; click opens the trading card. Touch/Lite: tap-to-reveal with no WebGL | P1 |
| BRD-07 | **Typography-driven bios:** massive Tamil + Latin display type that scales and overlaps portraits as you scroll (editorial-magazine layout). **Guardrails:** text stays real, selectable DOM text; contrast-safe scrims/blend modes so overlaps never drop below AA; type never covers faces; Tamil display sizes use tuned line-height so vowel signs are never clipped; a non-overlapping layout ships for Lite/reduced-motion | P1 |
| BRD-08 | **Alumni boards as magazine issues** ("Vol. 2026–27"): cover, roster spread, year highlights, credits — generated from the same data as the current board | P1 |

### 6.6 Join hub (Linktree replacement)

| ID | Requirement | Pri |
| --- | --- | --- |
| JOIN-01 | `/links`: ultra-light bio hub (< 30 KB JS target, no WebGL), instantly loads inside in-app browsers; dynamically features the current event | P0 |
| JOIN-02 | Join paths: GroupMe, mailing list, Instagram, TikTok, membership interest, performer interest — each with "what to expect" | P0 |
| JOIN-03 | In-site mailing-list signup with double opt-in, unsubscribe, and Cloudflare Turnstile (or equivalent) spam protection | P0 |
| JOIN-04 | Short links `/go/[slug]` with UTM parameters and click analytics; QR generator per link for flyers | P0 |
| JOIN-05 | Reveal-to-copy interaction for handles/emails | P1 |
| JOIN-06 | **Immersive modal forms** for Performance Interest, Membership Interest, and Partner inquiries: stylized modals that open over the current page (Next.js intercepting + parallel routes) so visitors keep their place, yet each form is a real URL that also works as a full page when opened directly, shared, or in Lite mode. Submissions use Server Actions with progressive enhancement (works without JS), optimistic UI, spam protection, and confirmation email | P0 |
| JOIN-07 | **GroupMe interstitial:** branded "what to expect" panel with copy-invite-link and open-in-app buttons. Joining necessarily completes on GroupMe (it can't be embedded), so the goal is context and a smooth handoff, not keeping the user inside the site | P0 |

### 6.7 Culture Lab (the "unseen" layer)

Each toy is standalone, shareable, and works without an account.

| ID | Feature | What it does | Pri |
| --- | --- | --- | --- |
| LAB-01 | **Kolam Studio** | Choose a dot lattice; draw with mouse/touch/pen; auto-symmetry (mirror/rotate); "complete for me" generator (dot-lattice and looped/interlaced styles); export SVG/PNG/animated video; shareable link encoding the design. Also **seed from your name** for a personal kolam. Kolam has prior academic treatment as mathematical/computational structure (array grammars, knot theory), which is a good reference set. | P1 |
| LAB-02 | **Solkattu Pads** | Rhythm pads for percussion syllables (e.g., *ta-ka-di-mi*, *ta-ki-ta*); loop, tempo, save/share patterns; samples recorded by club percussionists (synthesized fallback). Web Audio + Tone.js. | P1 |
| LAB-03 | **Tamil Alphabet Constellation** | Interactive visualization of the script: 12 vowels (*uyir*), 18 consonants (*mei*), the special *aaytham*, and 216 combined letters (*uyirmei*) = 247. Select a consonant + vowel to see the combination form, hear the sound, and see words that use it. | P1 |
| LAB-04 | **Kural of the Day** | One of the 1,330 couplets of the *Thirukkural* (திருக்குறள்) daily, Tamil + English, shareable card. Tamil source text is ancient; **verify the license of any English translation** (prefer public-domain or club-authored). | P1 |
| LAB-05 | **Your Name in Tamil** | Type in English/Tanglish, get Tamil script (transliteration), render as a poster/wallpaper; downloadable and shareable. Reuse multilingual (English/Tamil/Tanglish) handling from TamilTrove where practical. | P1 |
| LAB-06 | **Pongal Boil-Over** | Micro-game: manage heat so the milk rises and boils over at the perfect moment; celebrate with "Pongalo Pongal!" (பொங்கலோ பொங்கல்!). Optional global counter of boil-overs via realtime. Seasonal spotlight in January. | P2 |
| LAB-07 | **Sangam Globe** | 3D globe of where members come from (Tamil Nadu districts, Sri Lanka, Malaysia, Singapore, diaspora) with arcs to Columbus. **Opt-in, city/region level only, hidden until ≥ 5 entries per region (k-anonymity).** | P2 |
| LAB-08 | **Kolam Passport** | Optional: each event attended adds a dot to *your* personal kolam; complete the pattern over a semester for a digital badge. Private by default; leaderboard opt-in only. | P2 |
| LAB-09 | **Tamil Word of the Week** | Word, script, transliteration, audio (recorded by members), example sentence, tied to upcoming festivals | P1 |

### 6.8 Ask Sangam (AI concierge)

| ID | Requirement | Pri |
| --- | --- | --- |
| AI-01 | Chat drawer answering questions about the club, events, joining, and FAQs in English and Tamil | P1 |
| AI-02 | **Grounded only on published site content** (RAG over CMS content with pgvector); refuses/redirects if unknown; always offers a human handoff (email/GroupMe) | P1 |
| AI-03 | Guardrails: prompt-injection resistance, rate limiting per IP/session, no collection of personal data, no logs with PII, hard monthly spend cap | P1 |
| AI-04 | Voice mode with a "voice glow" visual (Web Speech API where supported; text fallback) | P2 |
| AI-05 | Officer tools (admin only): draft event announcements, Instagram captions, and alt text — **human review required before anything publishes** | P2 |

### 6.9 Search and command palette

| ID | Requirement | Pri |
| --- | --- | --- |
| SRCH-01 | `⌘K` / `Ctrl+K` palette: pages, events, albums, people, FAQs, actions ("Add next event to calendar") | P1 |
| SRCH-02 | Tamil-aware search: English, Tamil script, and Tanglish (transliterated) queries hit the same results; custom tokenizer + transliteration index | P1 |
| SRCH-03 | Fully keyboard- and screen-reader-accessible (ARIA combobox pattern) | P1 |

### 6.10 Resources

| ID | Requirement | Pri |
| --- | --- | --- |
| RES-01 | **Festival explainers** (Puthandu, Pongal, Deepavali, Karthigai Deepam, Navaratri/Golu, Aadi Perukku, Thiruvalluvar Day, and others the board chooses) with "what to wear / eat / say" | P0 |
| RES-02 | **Tamil 101:** greetings, common phrases, pronunciation audio (e.g., வணக்கம், நன்றி, வாங்க) | P1 |
| RES-03 | **Columbus guide** (curated by members: groceries, restaurants, temples/places of worship, cultural centers, community groups). *Content to be sourced and verified by members; not invented.* | P1 |
| RES-04 | **Recipes** ("Amma's kitchen") contributed by members with story + region | P1 |
| RES-05 | **Sangam Sessions:** 3D-vinyl-style player for original club performances (audio/video recorded by the club) plus curated external playlists (embeds only) | P2 |
| RES-06 | Learning resources for Tamil script and literature | P1 |

### 6.11 Partners

| ID | Requirement | Pri |
| --- | --- | --- |
| PART-01 | Sponsors and collaborators page (e.g., the TT/TS Diwali collaboration), with past collabs and logos | P0 |
| PART-02 | "Partner with us" form → officers' inbox + admin queue | P0 |
| PART-03 | Auto-generated **media kit** (PDF) from live data: mission, audience, past events, photos, contact | P2 |

### 6.12 PWA, notifications, wallet

| ID | Requirement | Pri |
| --- | --- | --- |
| PWA-01 | Installable PWA: offline schedule, saved events, cached tickets | P1 |
| PWA-02 | Opt-in web-push event reminders (including installed-PWA push on iOS) | P2 |
| PWA-03 | Add tickets to Apple/Google Wallet | P2 |

### 6.13 Admin console ("Sangam Console")

| ID | Requirement | Pri |
| --- | --- | --- |
| ADM-01 | Roles: Admin, Officer, Editor, Photographer; officer sign-in via Google (allowlist) or magic link; audit log | P0 |
| ADM-02 | Event CRUD with recurrence, ticket tiers, capacity, waitlist; RSVP CSV export | P0 |
| ADM-03 | Bulk album upload with progress, caption editor, reorder, publish/unpublish | P0 |
| ADM-04 | Board roster per academic year; Year Rollover Wizard | P1 |
| ADM-05 | Submissions inbox (contact, partner, performer interest, photo removal requests) with status | P0 |
| ADM-06 | Announcements → website banner, email, and social caption drafts | P1 |
| ADM-07 | Attendance analytics dashboard (per event, per semester) for officer reports | P1 |
| ADM-08 | Content preview and scheduled publishing | P1 |
| ADM-09 | **Hand-off kit:** board handbook (`docs/`), short video walkthroughs, "if the builder is gone" runbook (see R1) | P0 |

### 6.14 Immersion controls and Lite mode

| ID | Requirement | Pri |
| --- | --- | --- |
| IMM-01 | **Lite mode** toggle in the utility bar: disables WebGL scenes, smooth-scroll, particle effects, and heavy transitions; static art replaces shaders; persisted | P0 |
| IMM-02 | Auto-Lite on `prefers-reduced-motion`, `Save-Data`, low-power/low-battery, and low GPU tier; user can override | P0 |
| IMM-03 | Sound toggle (off by default) and a "reduce flashing" guarantee (no more than 3 flashes/second anywhere) | P0 |
| IMM-04 | "Skip the show" visible from first paint | P0 |
| IMM-05 | **In-app browser mode:** detect Instagram/TikTok/Facebook WebViews and start in Tier B/C; show "Open in browser for the full experience" only where a feature truly needs it | P0 |
| IMM-06 | **Stateful custom cursor** (Explore / Watch / Drag / Play) with the guardrails in §4.5 | P1 |
| IMM-07 | **Magnetic buttons and links** with the guardrails in §4.5 | P1 |
| IMM-08 | **UI sound design + audio-reactive visuals** (opt-in, off by default; audio sprite; AnalyserNode → shader uniforms), per §4.5 | P1 |

### 6.15 Under the Hood

A public engineering page (P2): architecture diagrams, performance budgets and RUM results, the Tamil-text engineering write-up, WebGPU/WebGL tiering, and the kolam generator explained. Doubles as a case study for the builder.

### 6.16 Cinematic media pipeline

| ID | Requirement | Pri |
| --- | --- | --- |
| CIN-01 | **Asset sprint (Phase 0):** curate and rank footage and photography from past events, grade it, and lock the typography and palette before building scenes | P0 |
| CIN-02 | **Live LUT grading:** export `.cube` LUTs from the grading tool; load them in the browser and apply as a 3D-LUT post-process (WebGPU path: three's `Lut3DNode` / `lut3D()` TSL addon, which has an intensity input for blending; WebGL path: three's `LUTPass` or the `postprocessing` library's LUT effect). Verify exact loader/API names at implementation time | P1 |
| CIN-03 | **One LUT per landscape,** blended by time of day and by scroll position through the gopuram; a "Pure/Graded" toggle lets viewers see the ungraded footage | P1 |
| CIN-04 | **Video delivery:** hero loops ≤ 6 s and ≤ ~2 MB, muted, `playsinline`, with an HTML poster frame as the LCP element; long-form via HLS (Cloudflare Stream or self-encoded HLS on object storage; check pricing); Tier C shows poster frames only | P1 |
| CIN-05 | **In-app browser handling:** treat autoplay and WebGL video as best-effort inside Instagram/TikTok WebViews; always ship the poster-frame fallback | P0 |
| CIN-06 | **Trailers:** ≤ 15 s per major event, captioned, with no third-party music audible | P1 |
| CIN-07 | **Rights log:** every clip has an owner, consent record for identifiable people, and audio status (silent/replaced/original) | P0 |

### 6.17 Route choreography and transitions

| ID | Requirement | Pri |
| --- | --- | --- |
| TRANS-01 | **No full-page reloads:** persistent layout and canvas; the background scene crossfades between route scenes (§8.2) | P1 |
| TRANS-02 | **Shared-element image flights:** images travel from their position on one route to their position on the next (e.g., Home film strip → Memory Vault grid; event card → event page; Hall of Fame → event). Implement with the View Transitions API (`view-transition-name` per photo/event) and GSAP Flip where needed; degrade to a crossfade | P1 |
| TRANS-03 | Transitions are interruptible and ≤ ~700 ms; back/forward restores scroll and grid state (use React `<Activity>` to preserve hidden route state); Lite mode uses instant or simple fade | P1 |
| TRANS-04 | **Phase 0 spike:** prototype cross-route shared-element transitions before committing. Cross-route `layoutId`-style animation and exit animations have historically been fragile with the App Router, so the primary plan is View Transitions + a persistent canvas, with Motion for in-page choreography | P0 |

---

## 7. Cross-cutting requirements

### 7.1 Experience tiers and performance budgets

| Tier | Detection | Experience |
| --- | --- | --- |
| **A — Full** | `navigator.gpu` present, good GPU tier, no Save-Data | WebGPU + TSL scenes, compute-shader particles, post-processing |
| **B — Reduced** | WebGL2 fallback, mid-tier GPU, or in-app browser | Same scenes, ~10× fewer particles, no post-processing, lower DPR |
| **C — Lite** | Reduced-motion, Save-Data, low battery, low GPU tier, or user choice | Static art and video poster frames, CSS transitions, no scroll-hijack, no canvas, no custom cursor |
| **0 — Baseline** | No JS, crawlers, reader modes | Fully semantic HTML with all content and links |

**Budgets (starting points):** initial route JS ≤ 170 KB gzip (excluding lazy 3D chunks); 3D/GPU code loads only after LCP and only on Tier A/B; hero LCP element is real HTML/image; 60 fps target on Tier A/B mid-range phones with a 30 fps floor and adaptive quality (dynamic resolution + particle count); pause rendering when hidden or off-screen; images ≤ 200 KB above the fold; fonts subset by Unicode range (Tamil block U+0B80–0BFF).

### 7.2 Accessibility (WCAG 2.2 AA)

Full keyboard operability; visible focus; landmarks and skip links; canvas experiences have text equivalents and are never the only path to content; captions/transcripts for all video and audio; alt text on all photos (human-approved); contrast checks per landscape palette and time-of-day state; no scroll-jacking that breaks find-in-page, anchors, or keyboard scroll; test with VoiceOver, NVDA, and TalkBack; publish an accessibility statement.

### 7.3 Internationalization

English + Tamil UI, per-locale routes (`/en`, `/ta`), `hreflang`, locale-aware dates (Gregorian + Tamil month labels where relevant), and content fields in the CMS that are bilingual by design. Consistent transliteration style guide (e.g., "Sangam" vs. "Sangham," "Pongal," "Deepavali/Diwali") agreed by the board.

### 7.4 SEO and sharing

Server-rendered content; `Organization`, `Event`, `ImageGallery` structured data; sitemap; canonical URLs; dynamic OG images per page/event/album/kural/kolam. Event and album pages are individually shareable and look right in Instagram/iMessage/WhatsApp previews.

### 7.5 Privacy and safety

- Cookie-less analytics (Plausible/Umami-class) so no consent banner is needed; no third-party trackers.
- Collect the minimum: email + name for RSVPs; retention policy; deletion on request.
- Photo policy: posted notice at events, removal requests actioned quickly, no facial recognition, EXIF stripped.
- Globe and passport features are opt-in with aggregation thresholds.
- Security basics: CSP headers, rate limiting, bot protection on forms, least-privilege roles, secrets in the platform vault, backups with a tested restore, dependency updates automated (see R3).

### 7.6 Browser and device support

Latest two versions of Chrome, Edge, Safari (macOS/iOS), Firefox, and Samsung Internet. Everything beyond Tier 0 is progressive enhancement. Tier A is expected on recent Chromium and current Safari where WebGPU is available; others fall back automatically.

---

## 8. Technical architecture

### 8.1 Stack

"Verified" = checked against release notes/docs on Sep 20, 2026. Everything else: run `npm view <pkg> version` at scaffold time and pin exact versions in the lockfile.

| Layer | Choice | Notes |
| --- | --- | --- |
| Runtime / tooling | Current Node LTS, pnpm, TypeScript (strict), Biome (or ESLint flat config + Prettier) | Check versions at scaffold |
| Framework | **Next.js 16.3.x**, App Router, Turbopack, Cache Components / PPR | **Verified:** 16.3 shipped Aug 2026 with Instant Navigations; Next.js moved to scheduled monthly security releases in July 2026. **Pin to the latest patch and automate patch updates.** 16.2 is the Active LTS line and the fallback if a dependency (see Payload) lags |
| UI | **React 19.2.x** + React Compiler | **Verified:** 19.2 line current (`<Activity>`, `useEffectEvent`). Use `<Activity>` to keep hidden scenes' state alive between routes |
| Forms and modals | Next.js **Server Actions** + React 19 `useActionState` / `useOptimistic`; intercepting + parallel routes for URL-addressable modals | Progressive enhancement: every form works without JS; Cloudflare Turnstile (or equivalent) on public forms |
| Styling | **Tailwind CSS 4.3.x** (CSS-first `@theme`, OKLCH tokens) + modern CSS (view transitions, scroll-driven animations where supported, container queries, `@starting-style`, anchor positioning, `light-dark()`) | **Verified:** 4.3 current. Headless primitives (Base UI or Radix) for accessible widgets; **no off-the-shelf themed kit** so nothing looks templated |
| Animation | **GSAP** (ScrollTrigger, Flip, SplitText behind a Tamil-safe wrapper, DrawSVG/MorphSVG) + **Lenis** + **Motion** (React) | **Verified:** GSAP and all its plugins are free following Webflow's acquisition. Lenis must be disabled in Tier C and never break native scroll semantics |
| 3D / GPU | **three.js** with `three/webgpu` + **TSL**; auto-fallback to WebGL2; **React Three Fiber 9.x** + drei | **Verified:** `WebGPURenderer` falls back to WebGL2 when WebGPU is unavailable. R3F v10 is alpha (WebGPU/TSL-first) — evaluate, **don't ship an alpha**. **Author shaders in TSL** so one source targets both WGSL and GLSL; reserve hand-written GLSL for WebGL-only paths (the `postprocessing` library is WebGL-based; the WebGPU path uses three's `RenderPipeline` with TSL nodes). **Verified:** `Lut3DNode` exists as a three.js addon for LUT color grading (§6.16) |
| Vector animation | Rive (optional) | Interactive footer and mascots |
| Audio | Web Audio API + Tone.js | Opt-in only |
| i18n | next-intl | Per-locale routes |
| CMS + back office | **Payload 3.x** embedded in the Next app, Postgres (Neon) + pgvector | **Verify Payload's supported Next.js range before choosing 16.3 vs 16.2** — Payload documents specific compatible Next ranges. Alternative: Sanity (hosted studio; less ops after the builder graduates) |
| Media | Cloudflare R2 + presigned uploads; sharp (libvips) variants; ThumbHash; job queue for processing | Zero-egress storage suits photo- and video-heavy pages; check current pricing. **AWS S3 + CloudFront is an equivalent alternative** (use it if you already have credits or experience). What matters is immutable, content-hashed, CDN-served AVIF/WebP/HLS assets. Video: §6.16 |
| Auth | Payload auth for staff; Auth.js or Better Auth for optional member accounts (Google + magic link) | Officer allowlist |
| Payments | Start by linking out to the club's current processor (Square); decide Square Web Payments vs. Stripe Checkout for P1 | Treasurer input needed |
| Email | Resend + React Email | Double opt-in, transactional |
| AI | Vercel AI SDK + Anthropic API (a small, fast model such as Claude Haiku 4.5 for concierge and alt-text drafts) | Grounded RAG, rate limits (Upstash), spend cap. **Optional:** a small Python (FastAPI) service for batch captioning/embedding if you want open-source models (CLIP/SigLIP-class) instead of hosted APIs; it adds hosting and ops, so start with Next.js background jobs and split it out only if needed |
| Realtime | Ably, Pusher, or PartyKit (pick one) | Boil-over counter, live event reactions |
| Search | Orama or Pagefind + pgvector hybrid; custom Tamil/Tanglish normalization | Reuse retrieval ideas from TamilTrove; the same hybrid index powers Memory Vault search (GAL-08) |
| Analytics / RUM | Plausible or Umami + `web-vitals` (or Speed Insights) | Cookie-less |
| Quality | Vitest, Playwright (+ axe, visual regression), Lighthouse CI, Sentry | Budgets enforced in CI |
| Delivery | GitHub Actions, preview deploys, Renovate | Hosting: Vercel or another platform via Next.js's stable Adapter API (verified in 16.2). **Check the host's plan terms** if ticket sales are involved |

**Tamil-safe engineering rules:**

- Grapheme-aware segmentation (`Intl.Segmenter`) for every text animation.
- For WebGL text and particle targets, **do not rely on runtime text engines that skip complex shaping.** Shape at build time with HarfBuzz (WASM), convert outlines to SVG paths, then sample points for particle targets and lettering.
- OG/social image generation: **verify Tamil shaping** in the chosen renderer (some HTML-to-image engines mishandle Indic scripts); fall back to headless-browser rendering if needed.
- Include Tamil strings in visual-regression tests on multiple OS font stacks.

### 8.2 Rendering and scene architecture

- **One persistent WebGL/WebGPU canvas** behind the DOM; routes register scene modules; the canvas survives navigation (Instant Navigations + View Transitions). Scenes are lazy-loaded and disposed properly.
- **Scroll rails:** GSAP ScrollTrigger drives a normalized `progress` uniform; camera and landscapes are functions of progress. Native scroll stays the source of truth.
- **Particles:** WebGPU compute (Tier A), FBO/GPGPU fallback (Tier B); morph targets precomputed (creature meshes and Tamil glyph point clouds).
- **Assets:** glTF with Meshopt/Draco, KTX2 textures, texture atlases, instancing/LOD; no asset > 1.5 MB on the critical path.
- **DOM-synced image planes:** gallery, board, and event images stay real DOM `<img>` elements (SEO, accessibility, Tier C). On Tier A/B, matching WebGL planes mount over them and track their rects during scroll, enabling displacement/liquid hovers and shared-element transitions.
- **Video as texture:** short graded loops play through a `VideoTexture` on Tier A/B, passing through the LUT post-process; one decoded video at a time, paused when off-screen.
- **Adaptive quality:** frame-time monitor lowers DPR/particle count and finally drops to Tier C automatically.
- **In-app browsers:** feature-detect, don't UA-sniff for capability; use UA detection only to choose the *starting* tier and copy.
- **State:** URL as the source of truth for shareable state (kolam designs, patterns, filters); minimal client store (Zustand or Jotai) for UI/session.

### 8.3 Data model (sketch)

`Term` (academic year) · `Person` · `BoardRole` · `Event` · `TicketTier` · `Rsvp/Ticket` · `Album` · `Photo` · `Initiative` · `Announcement` · `FestivalDay` · `Resource` · `Recipe` · `Partner` · `Faq` · `Submission` (contact, partner, performer interest, membership interest) · `PhotoRemovalRequest` · `ShortLink` · `KuralEntry` (static JSON) · `Embedding` (RAG chunks) · `AuditLog`.

### 8.4 Repository layout

```text
/apps/web                 Next.js app (site + Payload admin)
/packages/ui              Design system (tokens, primitives, motion utilities)
/packages/gpu             Scenes, TSL nodes, particle systems, tier detection
/packages/tamil           Segmentation, transliteration, shaping utils, calendar data
/packages/kolam           Kolam engine (lattice, generator, symmetry, export)
/packages/audio           Solkattu engine, UI sound design, audio-reactive hooks, sample loaders
/packages/cinema          LUT loading/blending, video + HLS helpers, grade presets
/packages/content-ai      RAG pipeline, guardrails, evals
/scripts                  Drive/Photos import, font subsetting, glyph-atlas build, point-cloud build
/docs                     Board handbook, runbooks, ADRs, style guide (transliteration)
```

### 8.5 Testing and CI gates

Type-check + lint; unit tests for the kolam engine, transliteration, calendar data, and tier detection; Playwright e2e for join/RSVP/admin flows; axe on every key page; visual regression (light/dark, EN/TA, three tinai palettes); Lighthouse CI budgets; an AI eval set (~50 question/answer pairs) for Ask Sangam with hallucination checks; a labeled relevance set (~100 natural-language queries → expected photos, tracked as Hit@5) for Memory Vault search, including Tamil and Tanglish queries.

### 8.6 Cost target

Aim for a low steady-state cost using free tiers where terms allow (verify current pricing/terms): domain, hosting, Postgres, object storage, email, and a capped AI budget. Payment-processor fees apply to tickets.

---

## 9. Cultural authenticity and review

- **Reviewers:** at least two Tamil-literate reviewers (members, faculty, or community elders) sign off on Tamil copy, transliteration style, festival explainers, and use of architectural/cultural imagery before each launch phase.
- **Representation checklist:** Tamil Nadu regions; Sri Lankan, Malaysian, Singaporean, and other diaspora Tamils; multiple faiths and secular traditions; non-Tamil members; varied art forms and eras (classical, folk, contemporary).
- **Sacred imagery:** no deities or sacred symbols in games, loaders, or gimmicks. Temple architecture is used respectfully and stylized.
- **Political neutrality:** the site stays cultural and community-focused; the board defines a written content policy.
- **Credit and consent:** every photo, video clip, recording, illustration, recipe, and story has a credited contributor and documented permission; event footage never ships with third-party music audible (mute or replace the audio).
- **Creative Crew:** recruit member contributors — photographer/videographer, illustrator (kolam/line art, lettering), musician (samples, ambience), Tamil copy editor, 3D/Blender artist — so the site is a community project, not one person's build.

---

## 10. Roadmap

Each phase is independently shippable. Launch on festival moments where possible.

| Phase | Scope | Suggested milestone |
| --- | --- | --- |
| **0 — Discovery** (≈ 2 wks) | Board interviews; content inventory; brand/asset audit; domain/hosting/payments decisions; design exploration of the five landscapes; **asset sprint** (curate and grade event footage/photos, lock typography and palette, start the rights log); 5 prototypes/spikes (kolam loader, gopuram ascent sketch, glyph mosaic, cross-route shared-element transition, LUT-graded video texture) | Late Sep – early Oct |
| **1 — Foundation + "Lite" launch** (≈ 4 wks) | Design system, i18n, CMS, admin (events/albums/board/submissions), `/links`, Home (HTML baseline), About, Initiatives, Events (archive + calendar + ICS), Gallery (import Diwali 2025), Board, Join, Partners, legal, analytics, short links | **Live before the fall Diwali events (target: early Nov)** |
| **2 — Immersion** (≈ 7 wks) | Kolam Boot, Gopuram Ascent, pointer-reactive kolam field, time-of-day theming, cinematic hero + live LUT grading, glyph-mosaic loader, cross-route shared-element transitions, Events Hall of Fame + Events Reel, Liquid Roster + trading cards + editorial bios, custom cursor/magnetic UI, UI sound design, tiers/Lite mode, in-app-browser mode | **Before Pongal (mid-January)** |
| **3 — Culture Lab** (≈ 4 wks) | Kolam Studio, Solkattu Pads, Alphabet Constellation, Kural of the Day, Your Name in Tamil, Word of the Week, Pongal Boil-Over | Spring semester |
| **4 — Intelligence & Ops** (≈ 3 wks) | Ask Sangam, search/⌘K, Memory Vault semantic photo search, ticketing + QR check-in PWA, attendance analytics, Year Rollover Wizard | Spring semester |
| **5 — Polish & Launch** (≈ 2 wks) | Perf tuning, a11y audit, cultural review, load testing, hand-off drill, Under the Hood page | **Puthandu (mid-April) — Tamil New Year** |
| **Stretch** | Sangam Globe, Kolam Passport, Wallet passes, web push, OffscreenCanvas hero, Rive footer, media kit | Post-launch |

*Timeline assumes a single lead builder plus a few Creative Crew contributors; adjust scope, not quality bars.*

---

## 11. Risks and mitigations

| # | Risk | Mitigation |
| --- | --- | --- |
| R1 | **Builder graduates; site rots** (the classic student-org failure) | Club-owned GitHub org/hosting/domain accounts (not personal); board handbook + videos; CMS-first content; a scheduled hand-off drill; "Lite" baseline requires no dev to keep alive |
| R2 | Complexity hurts usability or performance | Tier system, Lite mode, budgets in CI, hallway tests on real phones in Instagram's in-app browser |
| R3 | Dependency and security churn (Next.js now ships monthly security releases; several packages are moving fast) | Renovate + auto-merge for patch updates; pin exact versions; keep one LTS-line fallback; monitor advisories |
| R4 | CMS/framework incompatibility (e.g., Payload's supported Next.js range lags the latest Next) | Check the compatibility table before pinning; use 16.2.x LTS if needed; keep CMS access behind a thin data layer |
| R5 | Tamil text bugs (broken conjuncts in animations, OG images, WebGL text) | Grapheme segmentation, build-time shaping, cross-OS visual tests, native-reader review |
| R6 | Social-preview image generation mishandles Tamil | Test the renderer early; fall back to headless-browser rendering |
| R7 | WebGPU support and behavior vary across browsers/devices | Feature-detect; automatic WebGL2 fallback; Tier C always available |
| R8 | Cultural missteps (sacred imagery, inaccuracies, exclusion) | Review process (§9); conservative use of religious imagery; content policy |
| R9 | Photo privacy / consent | Removal-request flow, event notices, EXIF stripping, no facial recognition |
| R10 | AI concierge gives wrong or off-brand answers | Grounded RAG, "I don't know" behavior, human handoff, eval set, spend cap, easy kill switch |
| R11 | Scope creep from the "most complex website" goal | Phase gates; each phase ships; "P2" is genuinely optional |
| R12 | Asset supply (illustration, audio, 3D) becomes the bottleneck | Creative Crew recruitment early; procedural/generative assets wherever possible |
| R13 | Video: bandwidth, autoplay limits (especially in in-app browsers), and rights (third-party music in event audio, consent of people on camera) | Short muted loops with poster frames, HLS for long-form, rights log (CIN-07), strip/replace audio, consent notices |
| R14 | Custom cursor, magnetic UI, horizontal scroll takeover, and overlapping brutalist type hurt accessibility or usability | Guardrails in §4.5 and BRD-07; opt-in Explore mode; DOM-first content; hallway tests and screen-reader passes on these components specifically |
| R15 | Semantic photo search surfaces irrelevant or privacy-invasive results | Scene/activity search only (no face embeddings, no identity search); relevance eval set with Hit@5 tracking; removal requests purge embeddings and captions too |
| R16 | Cross-route shared-element transitions prove brittle | Phase 0 spike (TRANS-04); crossfade fallback; keep transitions optional and interruptible |

---

## 12. Open questions (decisions needed)

### For the board

1. Who is the site for — and can non-Tamil students join freely? Approved wording for mission and welcome.
2. Domain: what is available, and who owns the registrar account?
3. Payments: stay on Square, or move to Stripe? Who is the treasurer contact?
4. Membership: are there dues, forms, or an OSU registration requirement to reflect?
5. Photo policy and consent language; who handles removal requests?
6. Roster: current board names, roles, and what each person consents to publish.
7. Collaborations: how should the TT/TS Diwali collaboration be presented?
8. OSU brand/logo rules for student orgs — check with Student Life before using any university marks. No Block O or OSU marks until approved.

### For the builder

1. CMS choice: Payload (self-hosted, more powerful, more ops) vs. Sanity (hosted, lower ops).
2. Hosting platform and plan terms given ticket sales.
3. Creative direction: commission illustrated kolam/line-art and hand-lettering, or generate procedurally first?
4. AI scope: launch Ask Sangam in Phase 4, or hold until after Puthandu?
5. Footage: who owns the raw video from past events (e.g., Pattas Tappas, Pongal), do we have consent from people on camera, and is third-party music audible in the audio?
6. Memory Vault embeddings: hosted API (simplest) or self-hosted open-source model (more control, more ops)?
7. Grading: who is grading the footage, and do we standardize on one base look before creating per-landscape LUTs?

---

## 13. Appendices

### A. Tamil reference

**Script:** 12 vowels (*uyir*, உயிர்) + 18 consonants (*mei*, மெய்) + 1 special letter (*aaytham*, ஆய்தம்) + 216 combined letters (*uyirmei*, உயிர்மெய்) = 247.

**Draft UI vocabulary (needs native review):**

| English | Tamil |
| --- | --- |
| Hello / Welcome | வணக்கம் / வாங்க |
| Thank you | நன்றி |
| Events | நிகழ்வுகள் |
| Memories (Gallery) | நினைவுகள் |
| Initiatives | முன்னெடுப்புகள் |
| Board / Team | குழு |
| Join us | இணையுங்கள் |
| About us | எங்களைப் பற்றி |
| Dance · Song · Celebration | ஆட்டம் · பாட்டம் · கொண்டாட்டம் |
| Kolam · dot | கோலம் · புள்ளி |
| Tamil New Year | தமிழ்ப் புத்தாண்டு |
| Pongal | பொங்கல் |
| Thirukkural | திருக்குறள் |

**Draft 404 concept:** a kolam with one broken line and a gentle "வழி தவறிவிட்டீர்களா?" ("Did you lose your way?") with links home — copy to be reviewed.

### B. Festival calendar seeds (verify each year)

Puthandu (mid-April), Aadi Perukku (Aadi month), Navaratri/Golu (autumn), Deepavali (autumn), Karthigai Deepam (Karthigai month), Pongal (mid-January; four days: Bhogi, Thai Pongal, Mattu Pongal, Kaanum Pongal), Thiruvalluvar Day (January). Exact dates vary annually; use a curated dataset reviewed by the board each year.

### C. Analytics events (privacy-safe, no PII)

`hero_skip`, `lite_mode_on`, `tier_assigned`, `event_view`, `rsvp_click`, `ticket_click`, `calendar_add`, `join_groupme_click`, `mailing_list_submit`, `gallery_open`, `photo_removal_request`, `lab_kolam_export`, `lab_solkattu_play`, `lab_name_generate`, `ask_open`, `ask_handoff`, `vault_query`, `vault_result_click`, `video_play`, `grade_toggle`, `sound_on`, `explore_mode_on`, `shortlink_click`, `lang_toggle`.

### D. Sources consulted (Sep 20, 2026)

- Current Linktree: <https://linktr.ee/osutamilsangam>
- Inspiration: <https://recent.design/> · <https://landonorris.com/>
- Next.js releases and security cadence: <https://nextjs.org/blog>
- React 19.2 release notes (via the React changelog and react.dev)
- Tailwind CSS release table: <https://endoflife.date/tailwind-css>
- GSAP free-plugin status: <https://github.com/greensock/gsap-skills>
- three.js WebGPU/TSL + R3F v9/v10: <https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide> · <https://github.com/pmndrs/react-three-fiber/releases>
- Payload requirements/compatibility: <https://payloadcms.com/docs> (installation guide)
- three.js WebGPU post-processing and LUT node: <https://threejs.org/manual/en/webgpu-postprocessing.html> · <https://threejs.org/docs/pages/Lut3DNode.html>

### E. Merge log: ideas from the Gemini-generated PRD

#### Adopted or adapted

| Gemini idea | Disposition | Where |
| --- | --- | --- |
| Color-graded event footage with `.cube` LUTs applied live in the canvas | **Adopted and extended:** one LUT per landscape, blended by time of day and scroll position | §4.4, §6.16, HOME-11 |
| Pointer-reactive glowing kolam hero (custom shaders) | **Adopted** as HOME-13; rewritten in TSL (see below) and reused as the cheap Tier B background | HOME-13, §8.1 |
| Magnetic UI and a stateful custom cursor ("Watch," "Explore") | **Adopted with guardrails** (fine-pointer only, never hides the system cursor, off in Lite/reduced-motion, keyboard equivalents) | §4.5, IMM-06/07 |
| Horizontal-takeover events section | **Adopted as an opt-in "Events Reel";** vertical list stays the default and the accessible fallback | EVT-12 |
| In-house stylized modal forms | **Adopted** as URL-addressable modals (intercepting/parallel routes) with Server Actions and progressive enhancement | JOIN-06 |
| Infinite-scroll masonry Memory Vault | **Adopted** with virtualization, state restoration, and a paginated fallback | GAL-11 |
| Vector-embedding semantic search over photos | **Adopted:** captions + multilingual embeddings in pgvector, hybrid with filters; Tamil/Tanglish queries; **explicitly no face embeddings or identity search** | GAL-08, R15 |
| Liquid-distortion hover from club logo to portrait on the roster | **Adopted and combined** with the holographic trading cards (hover → liquid portrait → click → card) | BRD-06 |
| Brutalist, overlapping, scroll-scaled typographic bios | **Adopted with accessibility guardrails;** extended into alumni boards as magazine "issues" | BRD-07, BRD-08 |
| Seamless page transitions where images fly to their new positions | **Adopted** via View Transitions + persistent canvas, with a Phase 0 spike because cross-route animation is fragile | §6.17, TRANS-01–04 |
| UI sound design (clicks, swooshes) aligned to animation | **Adopted and localized:** Tamil-instrument micro-sounds, audio sprite, audio-reactive shaders, opt-in only | §4.5, IMM-08 |
| "Kollywood cinematic grandeur" design language | **Adopted as grammar, not content:** posters, trailers, title cards, INTERVAL card, rolling credits, grain; no third-party film IP | §4.4, EVT-13 |
| Phase 1 "asset preparation" | **Adopted** as the Phase 0 asset sprint | CIN-01, §10 |
| Server Actions and React 19 features | **Adopted** (forms, optimistic UI) | §8.1 |
| Optional FastAPI backend | **Kept as an optional service** for batch captioning/embedding with open-source models | §8.1 (AI row) |
| S3 + CloudFront asset delivery | **Kept as an equivalent alternative;** Cloudflare R2 remains the default because zero egress suits photo/video-heavy pages | §8.1 (Media row) |

#### Changed or declined, and why

| Gemini suggestion | Change | Reason |
| --- | --- | --- |
| Hand-written GLSL shaders | **TSL-first;** GLSL only on WebGL-only paths | One TSL source targets both WebGPU (WGSL) and WebGL2 (GLSL), which is what makes automatic tiering possible |
| Framer Motion for page transitions and orchestration | **GSAP + View Transitions + Motion** | Framer Motion is now Motion; cross-route layout animations are fragile in the App Router, and GSAP is stronger for scroll-linked timelines |
| Replace external links so users stay "completely immersed" | **Immersion is optional, never required** | The site must work in Instagram/TikTok in-app browsers, without JS, and on low-end phones; GroupMe joining necessarily happens on GroupMe |
| "Spatial computing" framing | **Dropped;** scope is WebGL/WebGPU, not WebXR | Not needed for the goals; avoids scope creep |
| Single-path hero with no fallbacks | **Kept the tier system, Lite mode, and no-JS baseline** | Performance, accessibility, and reach are requirements, not polish |

**What the Gemini PRD did not cover, and this PRD keeps:** cultural framework (Aintinai, Tamil calendar, festivals), Tamil typography and text-engineering rules, bilingual UX, Culture Lab, Ask Sangam concierge, admin console and hand-off plan, privacy/photo-consent policy, accessibility requirements, measurable success metrics, risks, and open questions.
