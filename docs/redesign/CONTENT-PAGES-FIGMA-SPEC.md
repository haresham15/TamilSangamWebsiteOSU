# Figma Agent Design Specification: Content Pages Renovation & Optimization

### OSU Tamil Sangam Digital Presence · Frontend Redesign Directive

*Target Audience: Autonomous Figma AI Agents, Design Systems Engineers & UI Designers*  
*Project Ground Truth: `docs/redesign/REDESIGN-BRIEF.md` & `design/tokens.json`*

---

## 1. Executive Directive & Scope Boundary

> [!IMPORTANT]
> **IMMUTABLE HERO CANVASES — DO NOT REDESIGN OR ALTER THE HERO SECTIONS.**
> Every major route on this website features a custom-built, hardware-accelerated 3D WebGL / React Three Fiber / GSAP ScrollTrigger hero animation (e.g., the *Digital Kolam Vortex*, *Gopuram Z-Axis Parallax*, *Chola Darbar Colonnade*, *Fretboard Highway*, *Solari Departure Board*, and *Nanban Morning Campus*).
> **These hero animations are frozen, scientifically calibrated, culturally resonant, and already implemented in production.**
>
> **Your Sole Mission as Figma Agents**:
> Redesign, renovate, and optimize the **Post-Hero Content Sections** across all content pages. Ensure the transition seam from the 3D hero into the editorial content is seamless, and that the typography, layout rhythm, component hierarchy, and responsiveness of the content below the fold feel world-class, culturally grounded, and distinctively collegiate.

---

## 2. Global Design Foundations & Token Architecture

All Figma variables, color styles, and components must map 1:1 to the Design Tokens Community Group (DTCG) specification codified in [`design/tokens.json`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/design/tokens.json) and mirrored in [`src/app/globals.css`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/globals.css).

### 2.1 Perceptually Uniform OKLCH Color Palette

| Token Name | OKLCH / Hex Value | Figma Role | Cultural & Functional Purpose |
| :--- | :--- | :--- | :--- |
| `sangam-purple` | `oklch(0.38 0.22 305)` (`#4c2472`) | Primary Brand Anchor | Official emblem ground; regal Dravidian royal violet. |
| `sangam-purple-light` | `oklch(0.48 0.24 300)` (`#6e2dae`) | Active / Hover State | Radiant electric violet for focus rings and active states. |
| `sangam-purple-dark` | `oklch(0.20 0.10 305)` (`#250d38`) | Deep Accent Ink | Deep plum ink for AAA accessible text and deep container fills. |
| `sangam-mint` | `oklch(0.78 0.16 168)` (`#55CCA2`) | Signature Motion Accent | Mint teal from 3D drop shadow; live extrusion accent & badges. |
| `sangam-mint-dark` | `oklch(0.52 0.17 168)` (`#16835f`) | High-Contrast Accent | Deep accessible mint teal for high-contrast borders and text. |
| `sangam-lilac` | `oklch(0.86 0.09 300)` (`#e9d5ff`) | Secondary Surface Tint | Soft lilac from repeating Tamil script watermark and subtle fills. |
| `sangam-cream` | `oklch(0.98 0.015 85)` (`#fffdf9`) | Warm Ivory Canvas | Warm ivory from official lettering; primary light-surface canvas. |
| `sangam-gold` | `oklch(0.82 0.18 85)` (`#f59e0b`) | Festive Accent | Turmeric sun gold; thin "zari" metallic threads & harvest highlights. |
| `sangam-coral` | `oklch(0.62 0.22 25)` (`#f43f5e`) | Cultural Ping | Kumkumam celebration coral for dance highlights & live indicators. |

### 2.2 Content Page Surface Hierarchy (The Atmosphere Tokens)

Content pages transition from the dark hero viewport into designated tactile surfaces. Do not use generic flat white (`#FFFFFF`) or pure dead black (`#000000`).

- **`/about` (Courtyard River)**: `content-surface-about` (`#FAF9F6` Warm Ivory, `#F4EFE6` Sunbaked Sand, `#2A2825` Charcoal Espresso).
- **`/board` (Chola Colonnade)**: `content-surface-board` (`#FAF9F6` Warm Ivory ground, `#E5DDD0` Architectural Borders, `#B85C38` Terracotta).
- **`/events` (Festival Stadium)**: `content-surface-events` (`#FAF9F6` Open River Ground, `#160d26` Deep Night, `#55CCA2` Mint Badges).
- **`/gallery` (Physical Archives)**: `content-surface-gallery` (`#FAF9F6` Canvas Ground, `#2A2825` Charcoal Espresso, `#B85C38` Filter Underline).
- **`/guide` (The Open Book / Station)**: `content-surface-guide` (`#FAF9F6` Warm Manuscript Ground, `#E5DDD0` Ruled Lines, `#2A2825` Ink).
- **`/join` (The Courtyard Guestbook)**: `content-surface-join` (`#FAF9F6` Warm Ivory, `#2A2825` Field Text, `#55CCA2` Submit Border).
- **`/initiatives` (Cultural Hubs)**: Deep Night Studio (`#0d0714` Slate ground, `#160d26` Chamfered panels, `#55CCA2` Halogen Mint).
- **`/suggestions` (Axonometric Blueprint)**: Blueprint Archive (`#FAF9F6` Warm Ivory, `#2A2825` Ink, `#FFB84D` Accent amber).

---

### 2.3 Strict Typography Stack & Sizing Scales

| Level | Desktop (1440px) | Mobile (375px) | Primary Font | Tamil Font | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Wordmark** | 96px – 128px | 44px – 56px | **Clash Display** | **Anek Tamil** | 1.05 | -0.04em |
| **Section Title (H1)** | 48px – 64px | 32px – 40px | **Halant / Clash** | **Anek Tamil** | 1.15 | -0.02em |
| **Subheading (H2)** | 32px – 40px | 24px – 28px | **Halant / Serif** | **Anek Tamil** | 1.25 | -0.01em |
| **Feature Title (H3)** | 22px – 26px | 18px – 20px | **Clash / Medium** | **Mukta Malar** | 1.35 | 0.00em |
| **Body (Editorial)** | 16px – 18px | 15px – 16px | **Söhne / Inter** | **Mukta Malar** | 1.65 | 0.00em |
| **Captions / Meta** | 12px – 13px | 11px – 12px | **JetBrains Mono** | **Mukta Malar** | 1.50 | +0.05em |
| **Tamil Script Watermark** | 64px – 120px | 36px – 56px | **Mukta Malar** | **Mukta Malar** | 1.00 | 0.00em |

#### Tamil Typography Commandments

1. **Never uppercase Tamil**: Tamil has no uppercase glyphs; CSS `uppercase` produces broken renders.
2. **Never letter-space Tamil**: `letter-spacing > 0` snaps combining vowel diacritics away from consonants. Always keep `letter-spacing: 0`.
3. **Mandatory Line-Height**: Tamil ascenders and descenders require `line-height >= 1.6` for legible body text.
4. **Bilingual Lockups**: Stack or pair Tamil with English seamlessly (e.g., *நிகழ்வுகள் · Campus Gatherings*). English leads navigation; Tamil provides cultural depth.

---

### 2.4 Banned Anti-Patterns ("Anti-Slop" Checklist for Figma)

- ❌ **No Floating Pill Buttons**: Do not use `rounded-full` capsule buttons for primary CTAs. Use crisp architectural chamfers (`ticket-chamfer-tl-br`), 4px/8px radii, or high-contrast tactile bevels.
- ❌ **No Generic Indigo/Purple Gradients**: Never use default Tailwind `from-indigo-500 to-purple-600`. All purple is rooted in royal Dravidian silk (`oklch(0.38 0.22 305)`).
- ❌ **No Uniform Card Grids**: Do not tile identical `p-6 rounded-2xl shadow-md` cards across the page. Vary card density, utilize asymmetric editorial columns, split rails, and full-bleed border marquees.
- ❌ **No Decorative Emojis**: Never use emojis (🚀, 💡, ⚡, 🎉, 🎟️, 💬, 💃) as section icons or list bullets. Use bespoke SVG glyphs, traditional Tamil numerical markings, or Kolam motifs.
- ❌ **No Stock Photography**: Every image card must feature real collegiate Buckeye events (festivals at Ohio Union, dance practices, Columbus park picnics, brass oil lamps, jasmine strings).

---

## 3. The Hero-to-Content Seam Architecture

All Figma pages must clearly demarcate the transition from the immutable hero into the renovated content:

```text
┌────────────────────────────────────────────────────────┐
│  ZONE 0: IMMUTABLE 3D HERO CANVAS                      │
│  - Height: 100dvh (Pinned Scroll / 3D Canvas)          │
│  - z-index: 10                                         │
│  - Status: FROZEN (Do not modify in Figma)            │
└────────────────────────────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  SEAM: HeroGradientTransition                          │
│  - Height: 128px (-mt-32 relative overlap)             │
│  - z-index: 20                                         │
│  - Gradient: Hero Ambient Deep -> Warm Ivory / Sand    │
└────────────────────────────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  ZONE 1..N: RENOVATED CONTENT SECTIONS                │
│  - Background: Warm Ivory (#FAF9F6) / Tactile Paper    │
│  - z-index: 20                                         │
│  - Layout: Max-width 1280px / 1440px Responsive Grid   │
└────────────────────────────────────────────────────────┘
```

---

## 4. Page-by-Page Content Renovation Wireframe Specs

---

### Page 1: About & Mission (`/about`)

*Thematic Concept: The Central River Timeline & Cultural Foundation*

#### Frozen Hero Context

- **Component**: `GopuramZScroll`
- **Visual**: 3D camera push through 5–7 floating dark brushed bronze tiered fractal rings with depth-of-field blur.

#### Renovated Post-Hero Content Specifications

##### Zone 1: Section Header (`CourtyardHeader`)

- **Figma Frame**: Auto-layout vertical, centered, width: `100%`, max-width: `896px` (4xl), padding: `0px 24px`.
- **Eyebrow**: `"Our Heritage & Buckeye Story"` (JetBrains Mono 12px, uppercase, tracking: +0.1em, color: `#B85C38` Terracotta).
- **Title Lockup**: `"The Flowing River"` / `"வரலாறு & பண்பாட்டுத் தடம்"` (Halant Serif 48px, line-height: 1.15, color: `#2A2825`).
- **Description**: Concise 2-sentence narrative on student foundation on the banks of the Olentangy River.

##### Zone 2: Central River Timeline (`FlowingRiverTimeline`)

- **Figma Frame**: Auto-layout vertical, width: `100%`, max-width: `1024px`, padding: `48px 0px`.
- **Visual Spine**: Vertical 2px organic path in `#B85C38`/20 terracotta with pulsing node rings.
- **Milestones Layout (Alternating Left/Right on Desktop, Stacked on Mobile)**:
  1. **2021 — Informal Student Cohort Founded** (`மாணவர் தோழமை தொடக்கம்`): First meetups on campus.
  2. **2023 — Annual Cultural Galas at Ohio Union** (`ஆண்டு கலாச்சார பெருவிழாக்கள்`): Student musical jams & South Indian feasts.
  3. **2024 — Official OSU Student Org Charter** (`பல்கலைக்கழக உத்தியோகபூர்வ அங்கீகாரம்`): Chartered as RSO under Council on Student Affairs (CSA).
  4. **2026 — The Five Pillars & Language Workshops** (`ஐந்து தூண்கள் & மொழிப் பயிற்சி விரிவு`): Bi-weekly Katral workshops & community outreach.
- **Card Specs**: Warm tactile paper surface (`#FFFFFF` on `#FAF9F6`), 1px border `#E5DDD0`, 12px radius, padding: `24px 28px`.

##### Zone 3: Campus Collaborators & Partners Grid

- **Figma Frame**: 4-column grid (desktop), 2-column (tablet), 1-column (mobile).
- **Cards**:
  1. *Telugu Tamasha at OSU* — Student Org Collaborator (Co-hosting Namma Jathara carnival).
  2. *The Ohio Union & Student Activities* — University Affiliation (CSA registered).
  3. *Central Ohio Tamil Community* — Regional Network (Columbus family festival ties).
  4. *Columbus South Indian Kitchens* — Authentic Catering (Dosas, Pongal & filter coffee).
- **Styling**: Minimalist borderless cards with top border divider `#E5DDD0`, 18px titles, 14px secondary descriptions.

##### Zone 4: Inter-Page Route Gateway (`OrganicRouteGateway`)

- **Figma Frame**: 3-card horizontal banner linking to `/board`, `/events`, and `/join`.

---

### Page 2: Executive Board & Governance (`/board`)

*Thematic Concept: Democratic Colonnade & Student Leadership*

#### Frozen Hero Context

- **Component**: `BoardHeroCanvas`
- **Visual**: 3D Chola Darbar colonnade rendered in warm amber & Chola bronze-granite.

#### Renovated Post-Hero Content Specifications

##### Zone 1: Architectural Governance Metrics Bar

- **Figma Frame**: 4-column horizontal ticker, bordered top and bottom with `#E5DDD0`, padding: `32px 0px`.
- **Metrics**:
  - `120+` Buckeye Members (CountUp, font-serif 48px, color `#2A2825`, terracotta `+`).
  - `8` Executive Officers (Elected democratically every spring).
  - `14` Campus Galas & Workshops (Annual cultural programming).
  - `100%` Student-Run & Free to Join (Zero financial barriers).

##### Zone 2: Executive Officers Portrait Grid

- **Figma Frame**: 2-column asymmetric grid (desktop), 1-column (mobile), gap: `32px`.
- **Officer Card Component Spec**:
  - **Container**: Fill `#FAF9F6`, border: 1px `#E5DDD0`, border-radius: 16px, padding: `24px`, auto-layout horizontal on desktop, vertical on mobile.
  - **Portrait Frame**: 160px × 200px (desktop), 100% width (mobile), aspect-ratio: 4:5, border-radius: 12px, border: 1px `#E5DDD0`, grayscale-to-color hover transition.
  - **Content Lockup**:
    - Role Eyebrow: e.g., `"President · தலைவர்"` (JetBrains Mono 11px uppercase, color `#B85C38`).
    - Full Name: e.g., `"Kavitha Rajagopal"` (Halant Serif 24px, color `#2A2825`).
    - Academic Standing: Major & Class year (e.g., *Computer Science & Engineering '27*).
    - Bio & Focus: 2 sentences explaining their portfolio and favorite Sangam initiative.
    - Contact Action: Minimalist email icon link (`buckeye.id@osu.edu`) with tactile hover ping.

##### Zone 3: Sub-committees & Student Volunteers Rail

- **Figma Frame**: 3 horizontal cards: *Cultural & Dance Leads*, *Media & Design Collective*, *Logistics & Food Committee*.
- **Styling**: Clean list format with member names, majors, and role descriptions.

##### Zone 4: Democratic Constitution & Election Rules

- **Figma Frame**: Architectural notice frame with warm cream background, linking to the constitution PDF, spring election timeline, and voting eligibility.

---

### Page 3: Campus Gatherings & Events (`/events` & `/events/[slug]`)

*Thematic Concept: The Flowing River Reel & Ola-Leaf Ticket Archive*

#### Frozen Hero Context

- **Component**: `EventsGen3Canvas`
- **Visual**: 3D Sodium-vapor amber stadium festival hero scene.

#### Renovated Post-Hero Content Specifications

##### Zone 1: Year & Category Filter Strip

- **Figma Frame**: Auto-layout horizontal, centered, gap: `24px`, padding-bottom: `32px`.
- **Filters**: `All Gatherings`, `2026–2027`, `2025–2026`, `Performances`, `Language Workshops`.
- **Selected State**: Underlined with 2px `#B85C38` terracotta bar, color `#2A2825` bold. No pill badges!

##### Zone 2: Flowing River Gatherings List

- **Figma Frame**: Vertical stack of wide horizontal rows, border-bottom: 1px `#E5DDD0`, padding: `28px 0px`.
- **Row Component Specs**:
  - **Date Column**: Monospace stacked block (e.g., `JAN 17 / 2027`), width: `120px`.
  - **Title & Bilingual Lockup**: e.g., `Pongal Thiruvizha 2027` / `பொங்கல் திருவிழா பெருவிருந்து` (Halant Serif 28px, color `#2A2825`).
  - **Venue & Time Tag**: e.g., `Ohio Union Archie Griffin Ballroom · 6:00 PM EST`.
  - **Status Badge**: `Upcoming` (halogen mint border & text) or `Past Gathering` (subtle muted ink).
  - **Primary Action**: Tactile button (`RSVP on GroupMe` / `Get Tickets` / `View 35mm Album`).
  - **Cursor Hover Reveal**: When hovering a row on desktop, a floating 180px × 240px candid event photo follows the cursor coordinates with soft spring physics (`xTo`, `yTo`).

##### Zone 3: Single Event Detail Template (`/events/[slug]`)

- **Hero Lockup**: Event title in 64px Clash Display, Tamil title in 36px Anek Tamil, full-bleed 16:9 event poster.
- **Key Information Matrix**: Date, Time, Room Location with clickable Ohio State Campus Map pin, Dress Code (e.g., *Traditional silk, festive veshti, or casual collegiate*), Food Menu highlights (e.g., *Medhu Vadai, Sakkarai Pongal, Filter Coffee*).
- **Ticket Stub Component**: Die-cut scalloped notch edges with perforated dashed line, barcode placeholder, and RSVP button.

---

### Page 4: Visual Archives & Gallery (`/gallery` & `/gallery/[album]`)

*Thematic Concept: 35mm Physical Memories Canvas*

#### Frozen Hero Context

- **Component**: `GalleryHero`
- **Visual**: 3D Fretboard Highway Hero with interactive strings.

#### Renovated Post-Hero Content Specifications

##### Zone 1: Courtyard Search & Topic Underlines

- **Figma Frame**: Centered input box with bottom-border-only design (`border-b-2 #2A2825/15`, focus `#B85C38`).
- **Topic Underlines**: `all`, `picnic`, `food`, `jathara`, `carnival`, `dance`, `games`, `tradition`, `friends`.
- **Style**: Minimalist typography links with underline on active state.

##### Zone 2: Sunlit Expansive Masonry Grid

- **Figma Frame**: 3-column masonry grid (desktop 1440px), 2-column (tablet 834px), 1-column (mobile 375px), gap: `24px`.
- **Photo Card Spec**:
  - **Image Frame**: Varied aspect ratios (4:5 vertical portraits, 3:2 landscape banquet shots, 1:1 candid snaps).
  - **Card Aesthetic**: 35mm analog photo frame with subtle warm paper border (`padding: 12px 12px 20px 12px`, background: `#FFFFFF`, border: 1px `#E5DDD0`, subtle shadow).
  - **Caption Lockup**: Small handwritten/monospace metadata caption: Event name, semester tag (e.g., *Autumn '26 Oval Lawn*), and photographer credit.

##### Zone 3: Photo Lightbox Modal (High-Fidelity)

- **Figma Frame**: Fullscreen overlay with 85% opacity `#120A06` backdrop blur.
- **Close Action**: Fixed top-right **48px × 48px** touch target `<button aria-label="Close">` with high-contrast icon.
- **Image Container**: Centered high-resolution image with EXIF metadata (lens, date, event title) suspended underneath.

---

### Page 5: Student Guide & FAQ (`/guide`)

*Thematic Concept: The Open Book & Ola-chuvadi Manuscript*

#### Frozen Hero Context

- **Component**: `GuideHero`
- **Visual**: 3D Split-Flap Solari departure board station scene.

#### Renovated Post-Hero Content Specifications

##### Zone 1: Real-time Search & Filter Links

- **Figma Frame**: Centered search input (`border-b #E5DDD0`), plus category links: `All`, `General`, `Membership`, `Events`, `Performances`, `Governance`.

##### Zone 2: Open Book / Ola-chuvadi Q&A Accordion

- **Figma Frame**: Max-width: `896px` (4xl), vertical auto-layout stack.
- **Accordion Item Spec**:
  - **Collapsed State**: Row with 20px Halant question, category tag, and subtle expanding plus `+` indicator. Border-bottom: 1px `#E5DDD0`, padding: `24px 0px`.
  - **Expanded State**: Question bolded in `#B85C38` terracotta; smooth accordion reveal of 2–3 paragraph plain-language answer in `#2A2825` body text. Includes links to relevant campus resources.
  - **Interactive 3D Sync**: Clicking an accordion item dispatches a mechanical clack audio cue and updates the Solari departure board in the hero above.

##### Zone 3: "Still Got Questions?" Help Hub

- **Figma Frame**: Warm sand card (`#F4EFE6`) with dark espresso borders, housing direct invite links to the executive board email, official GroupMe, and bi-weekly campus office hours.

---

### Page 6: Join & Student Onboarding (`/join`)

*Thematic Concept: The Courtyard Guestbook*

#### Frozen Hero Context

- **Component**: `JoinHeroCanvas`
- **Visual**: 3D R3F Nanban campus morning sunrise scene.

#### Renovated Post-Hero Content Specifications

##### Zone 1: The Courtyard Guestbook Form

- **Figma Frame**: Max-width: `672px` (2xl), centered, background: `#FFFFFF`, border: 1px `#E5DDD0`, border-radius: 20px, padding: `40px 48px`.
- **Form Fields (Clean Architectural Line Inputs)**:
  1. **Full Name** (`பெயர்`): Text input, bottom-border underline, floating label.
  2. **Ohio State Email** (`மின்னஞ்சல்`): Text input, placeholder: `name.num@osu.edu`.
  3. **Major & Graduation Year** (`படிப்பு`): Text input (e.g., *Biomedical Science '28*).
  4. **Engagement Track Selector (Radio Cards)**:
     - *General Member*: Attend cultural festivals, feasts, and student outings.
     - *Performer & Artist*: Join dance teams (Aatam), musical jam bands (Paatam), or street theatre.
     - *Committee & Volunteer*: Help run event logistics, stage lighting, social media, or catering.
  5. **Notes or Questions**: Multiline text area.
- **Submission Button**: Tactile button (`MuttramButton`) with mint drop-shadow, reading `"Sign the Guestbook & Join"`.

##### Zone 2: Direct Social Circles Grid

- **Figma Frame**: 3-column auto-layout cards:
  - *GroupMe Community Chat* (Real-time student announcements).
  - *Discord Server* (Gaming, study rooms, music sharing).
  - *Instagram @osutamilsangam* (Photo recaps, reels & event flyers).

---

### Page 7: Initiatives & Campus Hubs (`/initiatives`)

*Thematic Concept: Deep Night Cultural Workshop Studio*

#### Visual Atmosphere

- Deep indigo studio canvas (`#0d0714`), architectural Tamil script watermarks (`முன்னெடுப்பு`, `கலை`).

#### Renovated Content Specifications

##### Zone 1: The Three Cultural Pillars Selector Tabs

- **Figma Frame**: 3-column grid (desktop), 1-column (mobile).
- **Tabs**:
  1. **Aatam (Dance)** (`ஆட்டம் · நடனம்`): Western fusion, Bharatanatyam, Kuthu, Folk.
  2. **Paatam (Music)** (`பாட்டம் · இசை`): Carnatic, acoustic jams, film choral music, Parai drumming.
  3. **Kondatam (Fellowship)** (`கொண்டாட்டம் · சமூக நிகழ்வுகள்`): Banquets, game nights, Buckeye tailgates.
- **Selected Tab State**: Chamfered ticket corners (`ticket-chamfer-tl-br`), border: 2px `#55CCA2` Halogen Mint, background: `#250d38`, drop shadow: `6px 6px 0px #55CCA2`.

##### Zone 2: Active Pillar Deep-Dive Showcase

- **Figma Frame**: Split 2-column layout (7 cols details / 5 cols imagery).
- **Details**: Full rehearsal schedule, location (e.g., *RPAC Dance Studios / Ohio Union basement*), eligibility (*Open to all skill levels with zero audition fees*), and contact handles of student dance/music directors.

---

### Page 8: Campus Blueprints & Suggestions (`/suggestions`)

*Thematic Concept: Axonometric Student Feedback Matrix*

#### Frozen Hero Context

- **Component**: `BlueprintScene3D`
- **Visual**: 3D Axonometric Blueprint Matrix.

#### Renovated Post-Hero Content Specifications

##### Zone 1: Anonymous Feedback Engine

- **Figma Frame**: Architectural drafting board styling (`#FAF9F6`), grid-ruled lines, monospaced field tags.
- **Category Tags**: `Festival Food Ideas`, `Language Class Topics`, `Inter-Org Collaborations`, `Website & Tech Feedback`.
- **Message Input**: Monospace drafting text area with word counter and anonymous submit toggle.

##### Zone 2: Community Suggestion Radar

- **Figma Frame**: Visual cards showcasing student ideas currently under board review or implemented for the upcoming semester (e.g., *"Added Filter Coffee Station to Pongal Gala — Completed"*).

---

## 5. Shared UI Component Primitives (Figma Component Library)

Figma agents must construct and utilize these shared, reusable presentational components rather than generating ad-hoc frames:

### 5.1 `CourtyardHeader` (Master Component)

- **Variants**: `align: center | left`
- **Layers**:
  - `Eyebrow`: Monospace 12px, uppercase, tracking: +0.1em, color: `#B85C38`.
  - `Title`: Halant Serif 48px, line-height: 1.15, color: `#2A2825`.
  - `TamilTitle` (Optional): Anek Tamil 24px, color: `#8C827A`.
  - `Description`: Söhne/Inter 16px, line-height: 1.6, max-width: 640px, color: `#57524C`.

### 5.2 `MuttramButton` (Tactile Button Component)

- **Variants**: `variant: primary | secondary | outline`, `size: sm | md | lg`, `state: default | hover | pressed | disabled`
- **Primary Styling**:
  - Fill: `#250d38` (Sangam Deep Plum) or `#FAF9F6` (Warm Ivory).
  - Border: 2px `#55CCA2` (Halogen Mint) or `#2A2825` (Espresso).
  - Radius: 8px (or chamfered ticket notches).
  - Shadow: Hard offset drop shadow `4px 4px 0px #55CCA2` (no blurred shadows!).
  - Pressed State: Shift `+2px X, +2px Y` with shadow collapsed to `2px 2px 0px`.

### 5.3 `OrganicRouteGateway` (Footer Cross-Navigation)

- **Structure**: 3 cards pinned above the footer directing students to related routes with bilingual titles, description, and hover arrow transitions.

---

## 6. Responsive Auto-Layout Rules & Breakpoints

| Breakpoint | Figma Artboard Width | Column Grid | Margins / Padding | Gutter |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop** | **1440px** | 12 columns (Fluid max-width 1280px) | 80px | 24px |
| **Tablet** | **834px** | 8 columns | 40px | 20px |
| **Mobile** | **375px** | 4 columns (Zero horizontal scroll!) | 20px | 16px |

### Mobile Quality Gates

1. **The 48px Hitbox Mandate**: Every button, navigation trigger, tab, and accordion row must provide a minimum touch target of 48px × 48px.
2. **Zero Horizontal Overflow**: All tables, code blocks, or wide content must wrap or scroll within bounded horizontal containers without triggering page-level horizontal scroll.
3. **No Cursor-Dependent UX**: Hover reveals (like the cursor-following photo card on `/events`) must gracefully degrade on touchscreens to static inline thumbnail images or tap-to-expand modals.

---

## 7. Content Tone of Voice & Copywriting Directives

- **Voice**: Warm, reverent, collegiate, hospitable, and culturally grounded.
- **Strict Banned Word List**:
  - ❌ *"high-octane"*
  - ❌ *"camaraderie"*
  - ❌ *"electrify"*
  - ❌ *"vibrant"*
  - ❌ *"authentic"*
  - ❌ *"immersive"*
  - ❌ *"journey"* (except when discussing the literal *Paalai* desert landscape in Sangam literature)
  - ❌ *"unlock"*
- **Actionable CTAs**: Buttons should always say concrete actions:
  - `"Sign the Guestbook"` (not `"Submit"`)
  - `"RSVP on GroupMe"` (not `"Learn More"`)
  - `"Explore 35mm Archives"` (not `"View Gallery"`)
  - `"Read the Constitution"` (not `"Click Here"`)

---

## 8. Figma Agent Deliverables Checklist

When executing this redesign in Figma, deliver:

- [ ] **1. Master Typography & Color Styles**: Codified in Figma Local Styles / Variables matching `tokens.json`.
- [ ] **2. Shared Primitives Frame**: `CourtyardHeader`, `MuttramButton`, `GuestbookField`, `OlaLeafRow`, `PhotoCard35mm`.
- [ ] **3. Desktop Wireframes (1440px)**: Complete post-hero layouts for `/about`, `/board`, `/events`, `/gallery`, `/guide`, `/join`, `/initiatives`, `/suggestions`.
- [ ] **4. Mobile Wireframes (375px)**: Stacked single-column layouts with 48px touch targets for all 8 pages.
- [ ] **5. Seam Transition Annotations**: Clearly labeled gradient overlap frames (`HeroGradientTransition`) beneath each frozen hero container.
