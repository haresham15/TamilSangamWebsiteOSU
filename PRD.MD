# (ஐந்திணை) — OSU Tamil Sangam Website

# Master Product Requirements Document & Technical Architecture Ground Truth

**PRD v3.3 (Active Production Architectural Ground Truth)** · October 2026 · Owner: Haresh  
**Core Engine:** Next.js 16.3.5 (App Router, Turbopack) · React 19.2.8 · Three.js r186 / React Three Fiber v9.7 · @react-three/drei · @react-three/postprocessing v3.1 · GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText) · Lenis 1.3 · Tailwind CSS v4 (@theme OKLCH tokens) · Web Audio API synthesis · ReactBits Kinematics · Playwright Direct3D11 Capture Pipeline  
**Working Title:** *Aintinai* (ஐந்திணை) — Grounded in the five classical landscapes of Sangam literature (*Marutham*, *Neithal*, *Mullai*, *Paalai*, *Kurinji*).  
**Brand Motto:** "Start the Aatam, Paatam, and Kondatam!" — ஆட்டம் · பாட்டம் · கொண்டாட்டம் (Joy, Dance, Music & Kinship)  
**Primary Repository Ground Truth:** [PRD.MD](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/PRD.MD)  
**Interactive Audit Board:** [screenshots/content-audit/index.html](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/screenshots/content-audit/index.html)  
**Cinematic Universe Matrix:** [docs/heroes/README.md](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/docs/heroes/README.md)

---

## 0. Master Subsystem Implementation Matrix

| Subsystem | Primary Implementation Path | Core Architectural Invariants & Mechanics | Status |
|---|---|---|---|
| **Global Master Engine** | [`src/engine/masterTick.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/engine/masterTick.ts), [`governor.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/engine/governor.ts), [`spring.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/engine/spring.ts) | Single unified `requestAnimationFrame` loop; delta clamping ($\le 50\text{ ms}$); dynamic frame governor (Levels 0, 1, 2); persistent [`GlobalCanvas`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gl/GlobalCanvas.tsx) with Drei `<View>` scissoring; compositor shutter ([`Shutter.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/ui/Shutter.tsx)); asset pre-warming ([`useWarmup.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gl/useWarmup.ts)). | **SHIPPED & VERIFIED** |
| **01 · Home Hero: Digital Kolam Conveyor** | [`src/components/hero/DigitalKolamHero.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/hero/DigitalKolamHero.tsx), [`flowMath.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/hero/flowMath.ts), [`peelConveyorShader.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/hero/peelConveyorShader.ts) | Physics-driven woven rice-flour particle curves; Lissajous/wreath parameterization; 3D golden "அ" emblem with bevels and physical lighting; vertex peel conveyor shader unmasking Act II courtyard on scroll; zero card frames. | **SHIPPED & VERIFIED** |
| **02 · Events Hero: Leo Concert Arena Gen 3** | [`src/components/gen3/EventsGen3Canvas.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gen3/EventsGen3Canvas.tsx), [`LeoFactoryEnvironment.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gen3/LeoFactoryEnvironment.tsx), [`JumpingCrowdSilhouettes.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gen3/JumpingCrowdSilhouettes.tsx) | Theatrical concert stadium inspired by *Leo* (2023); 12,000-intensity sodium-vapor backlight; industrial cauldron platform; 8,000 instanced crowd silhouettes bouncing at 128 BPM; thousands of swaying phone torches; extruded 3D bronze emblem. | **SHIPPED & VERIFIED** |
| **03 · About Hero: 5-Tala Gopuram Z-Scroll** | [`src/components/about/GopuramZScroll.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/about/GopuramZScroll.tsx) | Cinematic fly-through of 5 sacred Dravidian temple tiers (*talas*) inspired by *Aayirathil Oruvan*; concentric 3D *Brahma Mudi* Sikku Kolam bronze rings; center bindu orb; *Yaathum Oore* watermark inscription. | **SHIPPED & VERIFIED** |
| **04 · Board Hero: Chola Darbar Corridor** | [`src/components/board/BoardHeroCanvas.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/board/BoardHeroCanvas.tsx), [`CholaCrown3D.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/board/CholaCrown3D.tsx), [`CorridorTreadmill.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/board/CorridorTreadmill.tsx) | Imperial Chola Darbar treadmill inspired by *Ponniyin Selvan*; monolithic carved granite pillars; procedural 3D *Karanda Makuta* (Chola Crown) with rotating *Sirascakra* lotus halo; floating brass *agal vilakku* oil lamps; silk tapestry portraits with vertex wave simulation. | **SHIPPED & VERIFIED** |
| **05 · Gallery Hero: 24-Fret Guitar Highway** | [`src/components/gallery-hero/GalleryHero.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gallery-hero/GalleryHero.tsx), [`fretMath.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gallery-hero/neck/fretMath.ts), `strings/` | 24-fret true 12-TET acoustic neck highway along coastal sunset road inspired by *Vaaranam Aayiram*; 6-string physics simulation with harmonic damping; Suriya's red rose contact brake at $p=0.52$; military dog tags at $p=0.755$; sunset film flash. | **SHIPPED & VERIFIED** |
| **06 · Guide Hero: Station Sequence & Solari Board** | [`src/components/guide-hero/GuideHero.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/guide-hero/GuideHero.tsx), [`BoardRoot.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/guide-hero/BoardRoot.tsx), [`impactBus.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/audio/impactBus.ts) | Blue hour rain-damp suburban railway platform inspired by *Alaipayuthey*; backlit window silhouettes; Solari mechanical split-flap departure board ($FALL = 0.7$); bilingual Tamil/English cycling; 8ms coalesced audio impact bus. | **SHIPPED & VERIFIED** |
| **07 · Suggestions Hero: Kaththi War Room Blueprint** | [`src/components/suggestions/BlueprintScene3D.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/suggestions/BlueprintScene3D.tsx), [`OhioStadiumWireframe.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/suggestions/OhioStadiumWireframe.ts) | Tactical war room in bruised plum void (`#241021`) inspired by *Kaththi*; procedural 3D wireframe mesh of Ohio Stadium ("The Horseshoe"); Kathiresan's coin drop intersection (`[3.6, 0.05, 4.4]`); brass drafting compass, rolled blueprints, and hydrology pipe nodes. | **SHIPPED & VERIFIED** |
| **08 · Join Hero: Campus Gates & Leaf Drift** | [`src/components/join/JoinHeroCanvas.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/join/JoinHeroCanvas.tsx), [`CampusGate.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/join/CampusGate.tsx), [`LeafDrift.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/join/LeafDrift.tsx) | Procedural wrought-iron campus gates with physical hinge kinematics inspired by *Autograph* & *Minnale*; limestone pillars; GPU leaf drift (**90% Ohio Buckeye leaves + 10% white Madurai Jasmine petals / *malli poo***); "All is Well / வாங்க நண்பா" chalkboard; degree kaapi bench. | **SHIPPED & VERIFIED** |
| **09 · Event Dossier: Randomized Magazine** | [`src/app/events/[slug]/page.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/events/[slug]/page.tsx), [`src/lib/event-photos.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/lib/event-photos.ts) | Server-Side Fisher-Yates array shuffle on local directory pool (`public/events/${slug}`); fresh 5–8 photo slice per request with zero CLS (`force-dynamic`); ReactBits `SplitText` letterpress cascade; ReactBits `ParallaxScatter` 3-track asymmetric light table; ReactBits `VaultGateway` magnetic proximity door to Google Photos. | **SHIPPED & VERIFIED** |
| **10 · Initiatives & Art Forms Hub** | [`src/app/initiatives/page.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/initiatives/page.tsx), [`src/data/initiatives.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/data/initiatives.ts) | Collegiate campus hubs organized around Aatam (Movement & Dance), Paatam (Music & Vocals), and Kondatam (Food & Fellowship); interactive cultural pillar tabs; art form index with practice schedules. | **SHIPPED & VERIFIED** |
| **11 · Custom Link-in-Bio Gateway** | [`src/app/links/page.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/links/page.tsx) | High-performance, tracking-free Linktree replacement with Next Event RSVP highlights, GroupMe invitation, performer sign-ups, and one-tap social clipboard sharing. | **SHIPPED & VERIFIED** |
| **12 · Anonymous Privacy Architecture** | [`src/app/privacy/page.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/privacy/page.tsx), [`src/lib/faq-engagement`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/lib/faq-engagement) | Zero-cookie, zero-analytics policy; 24-hour daily HMAC salting for aggregate guide board popularity ranking without IP storage or user profiling. | **SHIPPED & VERIFIED** |
| **13 · Universal Command Palette (⌘K)** | [`src/components/global/CommandPalette.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/global/CommandPalette.tsx) | Global keyboard-driven search indexing events, board officers, FAQs, cultural terms, and fast route jumps with sound feedback and bilingual keyword support. | **SHIPPED & VERIFIED** |
| **14 · Hardware Utility & Tier Drawer** | [`src/components/global/CornerUtilityDrawer.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/global/CornerUtilityDrawer.tsx) | Corner-docked utility control for manual Tier switching (A/B/C), Lite Mode toggle, Web Audio mute switch, font scale enlargement, and instant diagnostic metrics. | **SHIPPED & VERIFIED** |
| **15 · Autonomous Sangam Chat Assistant** | [`src/components/chat/SangamChatbot.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/chat/SangamChatbot.tsx), [`src/lib/chatEngine.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/lib/chatEngine.ts) | Autonomous conversational agent grounded in [`knowledgeBase.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/data/knowledgeBase.ts) to guide new students through OSU campus life, Tamil Sangam events, and cultural heritage. | **SHIPPED & VERIFIED** |
| **16 · Sensory Layer: Cinematic Color Grading** | [`src/gl/grade/GradeStack.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/gl/grade/GradeStack.tsx), [`gradeConfig.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/gl/grade/gradeConfig.ts) | Single tone-mapper AGX (`ToneMappingMode.AGX`); `<Canvas flat>`; compacted 33³ PNG strip LUT (`heritage-33.png`, 76.8 KB); live vignette and procedural film grain. | **SHIPPED & VERIFIED** |
| **17 · Sensory Layer: Diegetic Audio Engine** | [`src/audio/AudioController.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/audio/AudioController.ts), [`sounds.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/audio/sounds.ts), [`impactBus.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/audio/impactBus.ts) | Web Audio client singleton; master limiter/compressor chain; passive gesture unlocking; 8ms flap impact coalescing; 7 synthesized voice types; 4 Awwwards foley stems (Tambura drone, Mridangam rim tap, cardstock shuffle, 432 Hz bronze bell); synthesis-native, zero file dependencies. | **SHIPPED & VERIFIED** |
| **18 · Hardware-Accelerated Media Pipeline** | [`scripts/capture-all-heroes.mjs`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/scripts/capture-all-heroes.mjs), [`scripts/compile_gifs.py`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/scripts/compile_gifs.py) | Headless Playwright Chromium pipeline with Direct3D11 GPU acceleration (`--use-angle=d3d11`); 60fps WebM video recording; adaptive 256-color LANCZOS GIF compilation; 1440p Retina kinematic stills; full-page screenshots across all 9 routes. | **SHIPPED & VERIFIED** |
| **19 · Interactive Content Audit Board** | [`screenshots/content-audit/index.html`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/screenshots/content-audit/index.html) | Tabbed side-by-side inspection board: Full Page screenshots, live animated GIFs, 60fps WebM video player, kinematic scroll stills, movie easter egg badges, and direct PRD links. | **SHIPPED & VERIFIED** |
| **20 · Director's Diagnostic Viewport HUD** | [`src/director/DirectorHUD.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/director/DirectorHUD.tsx), [`wireframe.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/director/wireframe.ts) | Monospace diagnostic overlay triggered by `Shift+D` chord; unlit green wireframe material override; real-time FPS counter, draw call meter, GPU memory tracking. | **SHIPPED & VERIFIED** |
| **21 · Muttram Aesthetic & Design System** | [`design/tokens.json`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/design/tokens.json), [`src/app/globals.css`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/globals.css) | Zero-card philosophy; Warm Ivory (`#FAF9F6`), Charcoal (`#2A2825`), Terracotta (`#B85C38`); DTCG 3-tier OKLCH token mapping; Halant / Anek Tamil / Mukta Malar typography. | **SHIPPED & VERIFIED** |

---

## 1. Executive Vision, Cultural Architecture & Cinema Connections

### 1.1 The Genesis & Mission

The Ohio State University Tamil Sangam represents 120+ active Buckeye students, alumni, and friends in Columbus, Ohio. Founded informally in 2021 and officially chartered as a recognized student organization in 2024, our community bridges ancient Tamil heritage with modern collegiate celebration under the open principle: **"No Tamil required — everyone belongs at our hearth."**

Before this platform, the organization relied on fragmented Linktree hubs, ephemeral Google Forms, and uncaptioned Google Photos folders. *Aintinai* replaces fragmentation with a permanent cultural institution, collegiate record, and digital broadsheet.

### 1.2 The Five Ecological Landscapes (*Aintinai* / ஐந்திணை)

Classical Sangam poetry (*Sangam Ilakkiyam*, c. 300 BCE – 300 CE) organizes human emotion and social life into five distinct natural landscapes (*tinai*), each paired with an ecological mood, deity, and time of day. This website maps its primary routes to these five classical landscapes:

1. **மருதம் (Marutham — Fertile Plains / Agricultural Basin):**
   - *Mood:* Vaigarai (dawn), harvest, community assembly, and revelry.
   - *Expression:* **Events & Gatherings ([`/events`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/events/page.tsx))** — Celebrating collective gatherings, feast tables, and campus festivals.
2. **நெய்தல் (Neithal — Seacoast / Ocean Shore):**
   - *Mood:* Erpaadu (sunset), longing, ocean horizons, and nostalgic reflection.
   - *Expression:* **Gallery & Memory Vault ([`/gallery`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/gallery/page.tsx))** — Preserving 35mm photographic memories along the coastal highway.
3. **முல்லை (Mullai — Forest & Pastoral Foothills):**
   - *Mood:* Maalai (evening), hearth warmth, patience, and domestic assembly.
   - *Expression:* **Board & Governance ([`/board`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/board/page.tsx))** — The royal gathering of student leaders and council ministers around the hearth fire.
4. **பாலை (Paalai — Arid Journey & Sunlit Endeavor):**
   - *Mood:* Nanpagal (midday heat), courage, questing, and strategic innovation.
   - *Expression:* **Suggestions & Campus Initiatives ([`/suggestions`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/suggestions/page.tsx))** — The tactical blueprint war room for student proposal engineering.
5. **குறிஞ்சி (Kurinji — High Mountain Peaks):**
   - *Mood:* Yaamam (midnight), union, discovery, and blossoming kinship.
   - *Expression:* **Join & Community Portal ([`/join`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/join/page.tsx))** — The morning threshold where students cross collegiate gates into lifelong brotherhood.

### 1.3 Why Tamil Cinema & Literature Anchor Our Identity

For diaspora students thousands of miles from Tamil Nadu, Sri Lanka, Malaysia, Singapore, and India, two cultural forces create instant emotional kinship:

1. **Classical Tamil Literature:** Written over two millennia ago, verses like Kaniyan Poongundranar's *"யாதும் ஊரே யாவரும் கேளிர்"* (*Puranaanooru* 192 — "To us all towns are home, everyone our kin") establish universal openness and anti-parochial humanism.
2. **Tamil Popular Cinema (தமிழ் சினிமா):** The shared cultural soundtrack of our generation — Mani Ratnam's visual lyricism, Gautham Vasudev Menon's romantic nostalgia, Lokesh Kanagaraj's kinetic adrenaline, A.R. Murugadoss's tactical heroism, and the scores of A.R. Rahman, Ilaiyaraaja, Harris Jayaraj, and Anirudh Ravichander.

Every route opens with a theatrical 3D prologue that emotionally primes the visitor before rolling out the sunlit courtyard (*Muttram*) broadsheet.

### 1.4 The "Muttram" (Courtyard) Anti-Slop Design Constitution

The platform enforces a strict anti-slop aesthetic discipline to eradicate generic AI interface tropes:

- **Zero Generic Boxed Cards:** Content never sits inside repetitive `p-6 rounded-2xl border shadow-md` cards. Information flows directly on the Warm Ivory (`#FAF9F6`) field using asymmetric editorial grouping.
- **Negative Space as Architecture:** Visual weight is achieved through expansive whitespace (`gap-16`, `gap-24`, `mt-32`) and crisp hairline divider rules (`border-b border-[#2A2825]/12`).
- **Color Discipline (OKLCH Only):**
  - Primary Field: Warm Ivory (`#FAF9F6` / `oklch(0.98 0.015 85)`).
  - Ink Typography: Charcoal Ink (`#2A2825` / `oklch(0.24 0.02 55)`).
  - Focal Accents: Terracotta Earth (`#B85C38` / `oklch(0.55 0.16 45)`).
  - Sun Accents: Turmeric Harvest Gold (`#E5A93C` / `oklch(0.78 0.18 80)`).
  - Banned Colors: Pure black (`#000000` / `rgb(0,0,0)`), dead un-tinted grays, and generic purple/indigo Tailwind gradients (`from-indigo-500 to-purple-600`).
- **No Decorative Emojis:** Strictly bans emojis (🚀, 💡, ⚡, 🎉, 🎟️, 💬, 💃) as section badges or bullet points. Replaced with authentic SVG Kolam glyphs and Tamil iconography.

---

## 2. Exhaustive Route Specifications & Cinematic Easter Eggs

### 2.1 `/` — Home (முகப்பு): Digital Kolam Conveyor & Thirukkural Genesis

- **Intent:** Consecrates the digital threshold as a traditional home porch (*Thinnai* / திண்ணை). At dawn, Tamil households draw rice-flour kolams to invite harmony and feed insects/birds, symbolizing generous living without expectation.
- **Cinematic & Literary Tie:** Thirukkural Kural 1 (*"அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு"*) and Kural 81 (*"இருந்தோம்பி இல்வாழ்வ தெல்லாம் விருந்தோம்பி வேளாண்மை செய்தற் பொருட்டு"*).
- **3D Hero Composition ([`DigitalKolamHero.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/hero/DigitalKolamHero.tsx)):**
  - Pristine Mukta Malar single-glyph Tamil **"அ"** suspended stationary in the central void at $[0, 0, 0.05]$ with bevelled edges, physical specular reflections, and ambient floating gold dust motes.
  - Symmetrical 7-strand woven rice-flour particle ribbon generated via harmonic Lissajous equations around stationary pulli dots ($S = 48\text{px}$).
  - Vertex peel conveyor shader ([`peelConveyorShader.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/hero/peelConveyorShader.ts)) scrolls upward like an ancient rolled palm-leaf manuscript on vertical scroll, unmasking Act II.
- **Act II: Sunlit Muttram Broadsheet:**
  - Live Columbus EDT clock telemetry (`COLUMBUS, OHIO · OLENTANGY RIVER 40.0067° N · 83.0305° W · EST. 2021`).
  - Next Flagship Event hero announcement ("Yaar Andha Killer?") with Gregorian & Tamil calendar lockup ([`NextFlagshipGathering.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/home/NextFlagshipGathering.tsx)).
  - The Five Pillars of Sangam: Aatam (ஆட்டம் · Dance), Paatam (பாட்டம் · Music), Kondatam (கொண்டாட்டம் · Festive Feasts), Santhippum (சந்திப்பும் · Kinship), and Katral (கற்றல் · Language & Heritage) ([`SilkHoverPillars.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/home/SilkHoverPillars.tsx)).
  - Moments on the Olentangy: Depth carousel ([`EventsDepthShowcase.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/home/EventsDepthShowcase.tsx)).
  - Community Kinship Proof Strip: 120+ Buckeyes, 4+ Years, 100% Free / Zero Dues.
  - Organic Route Gateway: Screen-spanning interactive gateway into Gatherings ([`OrganicRouteGateway.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/muttram/OrganicRouteGateway.tsx)).
- **Documentation & Media:** Detailed PRD at [`docs/heroes/home-hero-peel-and-flow-prd.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/docs/heroes/home-hero-peel-and-flow-prd.md). Captured media: `home_hero_animation.gif` (614 KB), `home_hero_animation.webm`.

### 2.2 `/events` — Events (நிகழ்வுகள்): The Leo Concert Arena Gen 3

- **Intent:** Evoke the raw, pulsating adrenaline of packed collegiate South Asian concert halls, dance competitions, and street-food nights.
- **Cinematic Anchor:** Lokesh Kanagaraj's ***Leo* (2023)** (Thalapathy Vijay / Anirudh Ravichander / "Naa Ready").
- **3D Hero Composition ([`EventsGen3Canvas.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gen3/EventsGen3Canvas.tsx)):**
  - Industrial stadium environment modeled with 12 structural steel I-beam trusses along $Z \in [-60\text{m}, 20\text{m}]$ ([`LeoFactoryEnvironment.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gen3/LeoFactoryEnvironment.tsx)).
  - Elevated central circular staging vat ($r = 1.8\text{m}$) enclosed by outer sloped cast iron rim ($r = 12.8\text{m}$).
  - 12,000-intensity sodium-vapor "God Light" floodlamp emitting through volumetric dust particle haze ([`VolumetricCones.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gen3/VolumetricCones.tsx)).
  - 8,000 instanced dancing silhouettes rendered in a single draw call via `THREE.InstancedMesh`, bouncing harmonically at 128 BPM ([`JumpingCrowdSilhouettes.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gen3/JumpingCrowdSilhouettes.tsx)).
  - 2,500 point-sprite phone torches swaying stochastic vectors in the crowd ([`PhoneTorches.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gen3/PhoneTorches.tsx)).
  - Heavy extruded 3D metallic bronze Tamil Sangam medallion rotating on dual gimbal rings with rim-light grazing shader ([`SangamLogo3D.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gen3/SangamLogo3D.tsx)).
- **Act II: The Gatherings River:**
  - Chronological almanac stream of upcoming events (A Berry Cute Picnic, Streetside Sapad Night, Namma Jathara Carnival).
  - Annual Campus Traditions: Welcome Chai & Lawn Social, Diwali Sparkler Night, Pongal Harvest Gathering (தைப்பொங்கல்), Namma Jathara Spring Carnival.
  - One-click RFC 5545 `.ics` file generation and Google Calendar sync.
- **Documentation & Media:** Detailed PRD at [`docs/heroes/events-hero-leo-concert-arena-prd.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/docs/heroes/events-hero-leo-concert-arena-prd.md). Captured media: `events_hero_animation.gif` (2.39 MB), `events_hero_animation.webm`.

### 2.3 `/about` — About (அறிமுகம்): 5-Tala Gopuram Z-Scroll Fly-Through

- **Intent:** Ground the diaspora student community in the deep, egalitarian antiquity of Dravidian stone architecture and classical poetry.
- **Cinematic Anchor:** Selvaraghavan's ***Aayirathil Oruvan* (2010)** & Classical *Puranaanooru* 192.
- **3D Hero Composition ([`GopuramZScroll.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/about/GopuramZScroll.tsx)):**
  - 300vh scroll fly-through traversing the Z-axis of 5 sacred Dravidian temple tiers (*talas*).
  - Concentric 3D *Brahma Mudi* Sikku Kolam bronze rings spinning with parametric harmonic offsets.
  - Central reflective gold bindu sphere floating in negative space.
  - Atmospheric watermark: *"யாதும் ஊரே யாவரும் கேளிர் · தீதும் நன்றும் பிறர்தர வாரா"* (*Puranaanooru* 192 by Kaniyan Poongundranar).
- **Act II: The Democratic Constitution & Heritage Timeline:**
  - Center-snaking SVG river timeline ([`FlowingRiverTimeline.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/muttram/FlowingRiverTimeline.tsx)) navigating from the 2021 informal founding on the South Oval to the 2026 chartered chapter.
  - The Democratic Operating Principles: Free membership, annual democratic elections, zero hazing, open non-discrimination charter ([`src/data/constitution.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/data/constitution.ts)).
  - In-browser interactive Constitution viewer with PDF download link.
- **Documentation & Media:** Detailed PRD at [`docs/heroes/about-hero-gopuram-z-scroll-prd.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/docs/heroes/about-hero-gopuram-z-scroll-prd.md). Captured media: `about_hero_animation.gif` (1.87 MB), `about_hero_animation.webm`.

### 2.4 `/board` — Board (அவை): Ponniyin Selvan Chola Darbar Corridor

- **Intent:** Honor student executive leaders not as corporate LinkedIn headshots, but as royal ministers (*Amaichargal*) and cultural guardians holding council in an Imperial Chola Darbar.
- **Cinematic Anchor:** Mani Ratnam's ***Ponniyin Selvan I & II* (2022–2023)** (Kalki Krishnamurthy / A.R. Rahman).
- **3D Hero Composition ([`BoardHeroCanvas.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/board/BoardHeroCanvas.tsx), [`CorridorTreadmill.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/board/CorridorTreadmill.tsx)):**
  - Monolithic carved granite temple pillars gliding along an infinite treadmill camera trajectory.
  - Suspended brass *agal vilakku* oil lamps with dynamic particle flame flicker ([`OilLamp.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/board/OilLamp.tsx)).
  - Suspended silk tapestry banners ([`TapestryPortrait.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/board/TapestryPortrait.tsx)) waving with cloth-simulated vertex wave shaders.
  - Central 3D *Karanda Makuta* (Imperial Chola Crown, [`CholaCrown3D.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/board/CholaCrown3D.tsx)) with rotating *Sirascakra* lotus halo and jewel encrustations.
- **Act II: Executive Roster & Trading Cards:**
  - Warm editorial portrait gallery featuring the 8 Executive Officers (President, Vice President, Design Lead, Creative Director, Treasurer, Social Media Manager, Marketing & PR Manager, Event Coordinator, Outreach Coordinator) from [`src/data/board.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/data/board.ts).
  - Interactive Holographic Trading Cards: Pointer-reactive 3D foil shader card reveals with role, major, year, and personal statement.
  - Dedicated Subcommittee Coordinators roster across Cultural Operations, Web Architecture, Logistics, and Sound Engineering.
- **Documentation & Media:** Detailed PRD at [`docs/heroes/board-hero-chola-darbar-prd.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/docs/heroes/board-hero-chola-darbar-prd.md). Captured media: `board_hero_animation.gif` (1.28 MB), `board_hero_animation.webm`.

### 2.5 `/gallery` — Gallery (நினைவுகள்): Vaaranam Aayiram 24-Fret Guitar Highway

- **Intent:** Evoke the bittersweet nostalgia of college life, late-night guitar jams on the dorm lawn, and friendships forged across campus.
- **Cinematic Anchor:** Gautham Vasudev Menon's ***Vaaranam Aayiram* (2008)** (Suriya / Harris Jayaraj).
- **3D Hero Composition ([`GalleryHero.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gallery-hero/GalleryHero.tsx)):**
  - 24-fret true 12-TET acoustic guitar neck highway spanning a golden-hour coastal highway.
  - 6 wound bronze strings with harmonic wave physics and scroll-driven pick contact.
  - Suriya's single red rose contact brake at scroll progress $p = 0.52$.
  - Military dog tags dropping onto fret 12 at $p = 0.755$.
  - Sunset film flash dissolving into the photographic archive.
- **Act II: 35mm Physical Film Masonry:**
  - Expansive interlocking masonry grid on Warm Ivory ([`src/data/gallery.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/data/gallery.ts)).
  - Academic year filtering (2021–2026) and category curation (Carnatic, Kuthu, Picnic, Banquet).
  - Built-in photo removal request modal ensuring student privacy and consent.
- **Documentation & Media:** Detailed PRD at [`docs/heroes/gallery-hero-prd.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/docs/heroes/gallery-hero-prd.md). Captured media: `gallery_hero_animation.gif` (1.35 MB), `gallery_hero_animation.webm`.

### 2.6 `/guide` — Guide & FAQ (வழிகாட்டி): Alaipayuthey Railway Station Sequence

- **Intent:** Welcome new freshmen, transfer students, and graduate arrivals who feel like they are stepping off a train onto an unfamiliar platform, searching for community.
- **Cinematic Anchor:** Mani Ratnam's ***Alaipayuthey* (2000)** (R. Madhavan & Shalini / A.R. Rahman).
- **3D Hero Composition ([`GuideHero.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/guide-hero/GuideHero.tsx), [`BoardRoot.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/guide-hero/BoardRoot.tsx)):**
  - Blue hour rain-damp suburban railway platform with steel track reflections and rain streaks.
  - Backlit compartment window silhouettes depicting a woman seated inside and a man standing on the platform.
  - Mechanical crane pullback into the station hall rafters.
  - Solari split-flap departure board cycling collegiate answers with an 8ms coalesced audio impact bus ([`FlapGrid.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/splitflap/SplitFlapBoard.tsx)).
- **Act II: Buckeye Student Survival Guide:**
  - Curated guide for Columbus newcomers ([`src/data/columbus-guide.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/data/columbus-guide.ts)): Indian grocery stores (Saraga, Patel Brothers), authentic South Indian dining (Dosa Corner, A2B), COTA bus routes to Ohio Union, local temple timings.
  - Bilingual FAQ accordion answering academic, housing, and social questions ([`src/data/faq.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/data/faq.ts)).
- **Documentation & Media:** Detailed PRD at [`docs/heroes/guide-hero-v3-station-sequence-prd.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/docs/heroes/guide-hero-v3-station-sequence-prd.md). Captured media: `guide_hero_animation.gif` (851 KB), `guide_hero_animation.webm`.

### 2.7 `/suggestions` — Ideas (கருத்து): Kaththi War Room & Ohio Stadium 3D Blueprint

- **Intent:** Elevate student proposals from an overlooked feedback box into a strategic, tactical act of community engineering and student empowerment.
- **Cinematic Anchor:** A.R. Murugadoss's ***Kaththi* (2014)** (Thalapathy Vijay / Anirudh Ravichander).
- **3D Hero Composition ([`BlueprintScene3D.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/suggestions/BlueprintScene3D.tsx)):**
  - Axonometric blueprint drafting grid in bruised plum void (`#241021`).
  - Procedural 3D wireframe reconstruction of Ohio Stadium ("The Horseshoe") with field yard markers and bleacher curves ([`OhioStadiumWireframe.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/suggestions/OhioStadiumWireframe.ts)).
  - Kathiresan's coin drop intersection at coordinates $[3.6, 0.05, 4.4]$.
  - Brass architect's drafting compass, rolled master blueprint scrolls, and wooden scale ruler.
  - Glowing hydrology pipeline nodes marking campus infrastructure proposals.
- **Act II: Conversational Proposal Form & Public Ledger:**
  - Category routing: Event Ideas, Website Feedback, New Initiatives, Collaborations ([`SuggestionForm.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/suggestions/SuggestionForm.tsx)).
  - Live public ledger of accepted student suggestions and active execution status ([`src/data/initiatives.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/data/initiatives.ts)).
- **Documentation & Media:** Detailed PRD at [`docs/heroes/suggestions-hero-kaththi-war-room-prd.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/docs/heroes/suggestions-hero-kaththi-war-room-prd.md). Captured media: `suggestions_hero_animation.gif` (1.07 MB), `suggestions_hero_animation.webm`.

### 2.8 `/join` — Join (இணையுங்கள்): Morning Campus Courtyard Gates & Leaf Drift

- **Intent:** Create an architectural embrace for every student, explicitly assuring them that fluency is not required to belong.
- **Cinematic Anchor:** Cheran's ***Autograph* (2004)** & Gautham Menon's ***Minnale* (2001)**.
- **3D Hero Composition ([`JoinHeroCanvas.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/join/JoinHeroCanvas.tsx), [`CampusGate.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/join/CampusGate.tsx), [`LeafDrift.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/join/LeafDrift.tsx)):**
  - Monumental wrought-iron collegiate gates swinging open on procedural mechanical hinges in morning god-rays.
  - Limestone gateposts with cast bronze arch plaque: *"ஓஹியோ தமிழ் சங்கம் · EST. 2024"*.
  - Emotionally charged GPU particle simulation: **90% Ohio Buckeye leaves intermingled with 10% fragrant white Madurai Jasmine petals (*malli poo*)**.
  - "All is Well / வாங்க நண்பா" student chalkboard and campus bench with hot degree kaapi cups.
- **Act II: Membership Gateway:**
  - Conversational membership application form (Name, OSU Email, College/Major, Interests) ([`GuestbookField.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/muttram/GuestbookField.tsx)).
  - Direct GroupMe onboarding interstitial with community guidelines.
  - Double opt-in newsletter subscription with zero tracking cookies.
- **Documentation & Media:** Detailed PRD at [`docs/heroes/join-hero-collegiate-gates-prd.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/docs/heroes/join-hero-collegiate-gates-prd.md). Captured media: `join_hero_animation.gif` (2.45 MB), `join_hero_animation.webm`.

### 2.9 `/events/[slug]` — Event Dossier (நிகழ்ச்சி ஆவணம்): Sunlit Randomized Magazine

- **Intent:** Treat every single campus gathering as an Awwwards-caliber high-fashion art magazine spread.
- **Engineering Architecture ([`src/app/events/[slug]/page.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/events/[slug]/page.tsx), [`EventDossierView.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/events/[slug]/page.tsx)):**
  - **Server-Side Fisher-Yates Randomizer:** Node.js file system scanner slices a fresh 5–8 photo slice per request with `force-dynamic` (zero CLS, zero client API calls) via [`src/lib/event-photos.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/lib/event-photos.ts).
  - **ReactBits `SplitText` Cascade:** Massive Halant serif headline split by `Intl.Segmenter` grapheme clusters, emerging with physical letterpress easing (`[0.16, 1, 0.3, 1]`).
  - **ReactBits `ParallaxScatter`:** 5–8 photos distributed across 3 asymmetric tracks with differential scroll rates (`-140px`, `-260px`, `-180px`), 0px border radius, and zero card shadows.
  - **Vault Door Gateway:** Magnetic proximity door pulling visitors into the high-resolution Google Photos archive.
- **Documentation & Media:** Detailed PRD at [`docs/heroes/event-dossier-prd.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/docs/heroes/event-dossier-prd.md). Captured media: `event-dossier_hero_animation.gif` (740 KB), `event-dossier_hero_animation.webm`.

### 2.10 `/initiatives` — Campus Hubs, Cultural Pillars & Art Forms

- **Intent:** Showcase the structured sub-chapters of Tamil Sangam that allow dancers, musicians, foodies, and organizers to lead their own groups on campus.
- **Architecture ([`src/app/initiatives/page.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/initiatives/page.tsx)):**
  - **The Three Pillars:** Aatam (Movement & Dance), Paatam (Music & Vocals), Kondatam (Culinary Arts & Celebrations).
  - **Art Forms Directory:** Bharatanatyam classical training, Gaana & Kuthu street style, Carnatic vocal choir, acoustic guitar & keyboard jams, South Indian festival cooking.
  - **Interactive Chamfered Tabs:** Direct wood-click audio tactile feedback upon selecting pillars.

### 2.11 `/links` — Native High-Performance Linktree Replacement

- **Intent:** Eliminate commercial bio links (Linktree, Beacons) that load 3MB+ of tracking scripts and third-party advertising.
- **Architecture ([`src/app/links/page.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/links/page.tsx)):**
  - Direct live query into the next scheduled event with RSVP link.
  - Direct links to the Official Student GroupMe, Performer Auditions, Instagram, Suggestions Ledger, and Executive Board.
  - One-tap clipboard copy for emails and quick links with inline toast feedback.

### 2.12 `/privacy` — Zero-Cookie Anonymous FAQ Engagement Policy

- **Intent:** Protect student privacy with full transparency on data minimization.
- **Architecture ([`src/app/privacy/page.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/privacy/page.tsx)):**
  - Zero raw IP addresses stored; zero third-party tracking cookies; zero selling of student metadata.
  - Anonymous guide popularity counters salted with a 24-hour rotating daily HMAC key to prevent ballot stuffing without tracking individual users.

### 2.13 Global Overlays & Modals

1. **Command Palette (`Cmd+K` / `Ctrl+K`) ([`CommandPalette.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/global/CommandPalette.tsx)):**
   - High-speed fuzzy search across all 9 pages, upcoming events, 8 executive board officers, FAQs, and cultural glossary terms.
   - Arrow-key keyboard navigation, instant audio click feedback, and escape-key dismissal.
2. **Corner Utility Drawer ([`CornerUtilityDrawer.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/global/CornerUtilityDrawer.tsx)):**
   - Docked discreetly at the bottom right.
   - Hardware tier selector (Tier A, Tier B, Tier C), Lite Mode toggle, Web Audio mute/unmute, text scaling (normal vs large), and real-time FPS/latency telemetry.
3. **Sangam AI Chat Assistant ([`SangamChatbot.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/chat/SangamChatbot.tsx)):**
   - Client-side streaming chat assistant grounded in [`knowledgeBase.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/data/knowledgeBase.ts).
   - Answers questions regarding event dates, member dues ($0/free), Columbus bus lines, South Indian food spots, and Sangam history.
4. **Director's Diagnostic Viewport HUD (`Shift+D`) ([`DirectorHUD.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/director/DirectorHUD.tsx)):**
   - Production-safe engineer diagnostics displaying live WebGL draw calls, shader programs, GPU texture memory, and real-time frame timings.
   - Pressing `Shift+D` activates an unlit green wireframe material override across all 3D scene meshes for geometry inspection.

---

## 3. The Master Cinematic & Pop-Culture Easter Egg Compendium

| Page | Movie / Cultural Anchor | Director / Composer | Key Actors | Diegetic Quote / Lyric | Visual Cue & Mechanical Easter Egg |
|---|---|---|---|---|---|
| **`/` (Home)** | *Thirukkural Genesis* & Dawn *Thinnai* | Thiruvalluvar | N/A | *"அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு"* | Central chrome **"அ"** glyph unpeels into Kural 1 on scroll; woven 7-strand rice flour Lissajous curves. |
| **`/events`** | ***Leo* (2023)** | Lokesh Kanagaraj · Anirudh Ravichander | Thalapathy Vijay | *"Naa Ready dhaan varava... Annan yaaru Thalapathy!"* | 12,000-intensity God Light floodlamp; 8,000 crowd silhouettes bouncing at 128 BPM; 2,500 phone torches; vat platform. |
| **`/about`** | ***Aayirathil Oruvan* (2010)** | Selvaraghavan · G.V. Prakash Kumar | Karthi · Parthiban | *"யாதும் ஊரே யாவரும் கேளிர் · தீதும் நன்றும் பிறர்தர வாரா"* (*Puranaanooru* 192) | 5-Tala Dravidian Gopuram Z-axis flight; concentric *Brahma Mudi* Sikku Kolam rings; gold bindu orb; watermarked stone scripture. |
| **`/board`** | ***Ponniyin Selvan I & II* (2022–2023)** | Mani Ratnam · A.R. Rahman | Chiyaan Vikram · Karthi · Trisha · Jayam Ravi | *"சோழ சோழன்... நதிகள் கடந்து, மலைகள் உடைத்து!"* | Treadmill granite pillar corridor; *Karanda Makuta* (Chola Crown) with *Sirascakra* lotus halo; floating *agal vilakku* oil lamps; silk tapestry portraits. |
| **`/gallery`** | ***Vaaranam Aayiram* (2008)** | Gautham Vasudev Menon · Harris Jayaraj | Suriya · Sameera Reddy | *"Mundhinam Paarthene... Paartha Vizhi Paartha Padi Poothirukka"* | 24-fret true 12-TET acoustic guitar highway; Suriya's red rose contact brake at $p=0.52$; military dog tags at $p=0.755$. |
| **`/guide`** | ***Alaipayuthey* (2000)** | Mani Ratnam · A.R. Rahman | R. Madhavan · Shalini | *"Snehidhane Snehidhane... Ragasiya Snehidhane"* | Rain-damp blue-hour platform; backlit window silhouettes; Solari split-flap departure board; 8ms coalesced audio impact bus. |
| **`/suggestions`** | ***Kaththi* (2014)** | A.R. Murugadoss · Anirudh Ravichander | Thalapathy Vijay · Samantha | *"Idhu namma oor prachanai... oru coin drop la mudivu pannidalaama?"* | Bruised plum void (`#241021`); 3D wireframe mesh of Ohio Stadium ("The Horseshoe"); Kathiresan's coin drop intersection at $[3.6, 0.05, 4.4]$. |
| **`/join`** | ***Autograph* (2004) & *Minnale* (2001)** | Cheran · Gautham Menon · Harris Jayaraj | Cheran · Madhavan · Reema Sen | *"ஞாபகம் வருதே ஞாபகம் வருதே... பொக்கிஷமாய் நெஞ்சில்"* / *"Vaseegara..."* | Wrought-iron campus gates swinging open; **90% Ohio Buckeye leaves + 10% white Madurai Jasmine petals (*malli poo*)** GPU drift; degree kaapi bench. |
| **`/events/[slug]`** | *Awwwards Editorial Dossier* | Modern High-Fashion Broadsheet | N/A | *"ஒவ்வொரு நிகழ்வும் ஒரு காவியம்"* (Every event is an epic) | Server-side Fisher-Yates dynamic 5–8 photo slice; ReactBits `SplitText` letterpress cascade; 3-track `ParallaxScatter`; magnetic `VaultGateway`. |

---

## 4. Deep Mathematical, Physics & Shader Engineering

### 4.1 Digital Kolam Weaving & Parabolic Peel Vertex Shader

- **Mathematical Curve Generation ([`flowMath.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/hero/flowMath.ts)):**
  - Dot lattice constructed on a symmetric Cartesian grid with spacing $S = 48\text{px}$.
  - Continuous loop paths generated using cubic Bezier curves parameterized by harmonic frequencies:
    $$x(t) = A \cos(\omega_x t + \phi_x), \quad y(t) = B \sin(\omega_y t + \phi_y)$$
  - Self-intersecting loops calculate weaving over/under offsets via Z-depth displacement:
    $$z(t) = \pm \delta \sin(k \cdot t)$$
- **Peel Conveyor Vertex Shader ([`peelConveyorShader.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/hero/peelConveyorShader.ts)):**
  - Pinned 100dvh section where scroll progress maps to a cylinder peel transformation.
  - Vertex position $(x, y, z)$ deformed along a parabolic arc:
    $$y' = y \cos(\theta) - R \sin(\theta), \quad z' = y \sin(\theta) + R(1 - \cos(\theta))$$
  - As $\theta \to \frac{\pi}{2}$, the 3D kolam plane rolls upward into an off-screen conveyor spool, seamlessly revealing Act II.

### 4.2 Leo Concert Arena Instancing & Crowd Harmonic Bounce

- **Crowd Simulation ([`JumpingCrowdSilhouettes.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gen3/JumpingCrowdSilhouettes.tsx)):**
  - 8,000 instanced dancing figures rendered in a single draw call via `THREE.InstancedMesh`.
  - Custom vertex shader computes vertical harmonic bounce driven by audio clock time:
    $$y_{\text{offset}} = | \sin(2\pi \cdot \frac{128}{60} \cdot t + \phi_i) | \cdot h_i$$
  - Camera-facing billboard alignment with depth-based atmospheric haze.
- **Phone Torch Matrix ([`PhoneTorches.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gen3/PhoneTorches.tsx)):**
  - 2,500 point sprites scattered through the audience with randomized stochastic twinkling:
    $$I_i(t) = I_0 \cdot \left[0.7 + 0.3 \sin(\omega_i t) \cdot \cos(\nu_i t)\right]$$
- **3D Bronze Emblem Rim Lighting:**
  - Extruded 3D metallic Tamil Sangam medallion catching rim highlights via grazing-angle shader:
    $$I_{\text{rim}} = (1.0 - \mathbf{N} \cdot \mathbf{V})^\gamma$$

### 4.3 12-TET Mathematical Fret Spacing & 6-String Physics

- **12-TET Formula ([`fretMath.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gallery-hero/neck/fretMath.ts)):**
  - Physical scale length $L = 648\text{mm}$ (standard 25.5" acoustic guitar).
  - Exact fret positions calculated via twelve-tone equal temperament:
    $$d_n = L \left(1 - 2^{-n/12}\right), \quad n \in \{1, \dots, 24\}$$
- **6-String Damped Wave Equation (`strings/`):**
  - Localized pick contact at $p = 0.52$ applies impulse displacement $y(0) = Y_{\max}$.
  - Harmonic wave equation solved with exponential air damping:
    $$y(x, t) = \sum_{m=1}^{M} A_m \sin\left(\frac{m\pi x}{L}\right) \cos(\omega_m t) e^{-\zeta_m t}$$

### 4.4 Solari Split-Flap Mechanical State Machine

- **Flap Gravity Physics ([`FlapGrid.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/splitflap/SplitFlapBoard.tsx)):**
  - 24-column $\times$ 6-row matrix of independent flap units.
  - Top flap remains stationary until bottom flap passes $\theta = \frac{\pi}{2}$; then top flap accelerates with gravitational constant $FALL = 0.7$:
    $$\theta_{\text{top}}(t) = \theta_0 + \frac{1}{2} g t^2$$
- **Impact Audio Coalescing ([`impactBus.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/audio/impactBus.ts)):**
  - High-frequency flap impacts aggregate within an 8ms window buffer (maximum 3 simultaneous flap samples play to prevent Web Audio clipping).

---

## 5. Global 3D Engine & Runtime Architecture

### 5.1 Single `<GlobalCanvas>` Singleton & Drei `<View>` Scissoring

To prevent GPU memory leaks and WebGL context loss, the application mounts **exactly one persistent `<Canvas>`** at the DOM root (`#app-root`) ([`GlobalCanvas.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/gl/GlobalCanvas.tsx)).

- **Frameloop Discipline:** `frameloop="never"` — rendering is triggered strictly via `masterTick` advance calls.
- **View Scissoring:** Individual pages mount lightweight Drei `<View>` components that project their respective 3D scenes through CSS-positioned DOM tracking boxes with hardware-accelerated scissoring.
- **Tier C Invariant:** In Tier C or Lite Mode, `<GlobalCanvas>` renders nothing (`null`), saving 100% of GPU cycles.

### 5.2 Dynamic Governor & Frame Budgeting ([`governor.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/engine/governor.ts))

The governor maintains a centralized priority queue of render requests:

- **Level 0 (Idle / Sleep):** 0 FPS. Canvas paused when no 3D elements are in viewport.
- **Level 1 (Ambient / Idle Motion):** 30 FPS. Dust motes, gentle water, subtle lights.
- **Level 2 (Active Kinematics / Scroll Scrub):** 60 FPS. Full scroll scrubbing, camera trucking, concert crowd bouncing.

### 5.3 Three-Tier Hardware Degradation Model

| Metric / Feature | Tier A (Full Fidelity) | Tier B (Reduced GPU) | Tier C (Lite Mode) |
|---|---|---|---|
| **Platform Target** | Desktop GPU, high-end mobile | Mid-range phone, in-app webview | Low battery, Save-Data, reduced-motion |
| **Render Engine** | Hardware WebGL2 / Direct3D11 | Throttled WebGL2 | Pure DOM / HTML5 / CSS |
| **Max DPR** | 1.75–2.0 | 1.0–1.25 | Native CSS |
| **Particles** | 8,000–10,000 | 1,500–2,500 | 0 (Static SVG artwork) |
| **Post-Processing** | AGX + 33³ LUT + Grain | AGX Tone-mapping only | None |
| **Scroll Engine** | Lenis smooth scroll | Lenis smooth scroll | Native browser momentum |
| **Hitboxes** | Magnetic pull enabled | Standard cursor | Standard cursor |

### 5.4 State Management & LocalStorage Persistence Schema

All client preferences persist across user sessions without third-party tracking:

- `sangam_tier`: Hardware tier string (`"A"` | `"B"` | `"C"`). Defaults to auto-probed hardware capability.
- `sangam_lite_mode`: Boolean string (`"true"` | `"false"`). When `"true"`, enforces Tier C globally.
- `sangam_audio_muted`: Boolean string (`"true"` | `"false"`). Defaults to `"true"` until unlocked via user gesture.
- `sangam_font_scale`: Sizing string (`"normal"` | `"large"`). Modifies root `--font-scale` variable.

---

## 6. Sensory Layer: Cinematic Color Grading & Diegetic Audio

### 6.1 DaVinci Resolve AGX Tone Mapping & 33³ Compacted LUT

- **AgX Tone Mapping:** Configured via `<Canvas flat>` and postprocessing `ToneMappingMode.AGX`, preserving specular highlights without crushing warm courtyard tones.
- **Compacted 33³ PNG Strip LUT (`heritage-33.png`):** Compacted $1089 \times 33$ PNG strip (33 slices of $33 \times 33$ RGB lattices), weighing only 76.8 KB. Live trilinear interpolation ensures $\Delta E_{00} \le 4.0$ JND consistency with heritage bronze and silk tones.
- **Procedural Film Grain:** Simulates 35mm photochemical emulsion using procedural simplex noise (disabled in Tier C / Save-Data).

### 6.2 Diegetic Web Audio Synthesis Engine

- **Audio Controller Architecture ([`AudioController.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/audio/AudioController.ts)):** Singleton `AudioContext` with master stereo compressor, limiter, and high-pass filter ($f_c = 40\text{Hz}$).
- **Passive Gesture Unlock ([`armUnlock.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/audio/armUnlock.ts)):** Prepares audio nodes on first pointerdown/keydown without unwanted autoplay.
- **Cultural Sound Palette ([`sounds.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/audio/sounds.ts)):**
  - *432 Hz Bronze Temple Bell:* Modal resonator simulating temple bell decay ($f = 880\text{Hz}$, decay $= 2.4\text{s}$).
  - *Mridangam Rim Tap:* High-Q resonant bandpass filter at 1.8 kHz triggered on pillar hover.
  - *Parai & Thavil Sub-Bass:* Low-frequency membrane transient thud (65 Hz) for milestone transitions.
  - *Tambura Drone Loop:* Ambient harmonic pad anchored in Indian C# pitch.
  - *Cardstock Shuffle:* Filtered noise burst for archival photo flips.
  - *Mechanical Flap Slap:* 8ms coalesced impact click for Solari board rotations.

### 6.3 Backend Services, Server Actions & Storage Architecture

- **Student Proposal Action ([`src/app/actions/suggestion.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/actions/suggestion.ts)):**
  - Receives structured proposal submissions with field sanitization, character limits, and IP rate-limiting.
  - Stores submissions to persistent ledger store ([`src/lib/ledgerStore.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/lib/ledgerStore.ts)) and optionally triggers brutalist email notifications ([`brutalistEmailTemplates.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/lib/brutalistEmailTemplates.ts)) via Resend.
- **Dynamic Event Photo Slicing ([`src/lib/event-photos.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/lib/event-photos.ts)):**
  - Node.js file system reader reads high-res event photography from `public/events/[slug]`.
  - Performs server-side Fisher-Yates array shuffling on every request (`export const dynamic = "force-dynamic"`), returning an unpredictable 5–8 photo spread while maintaining 0 layout shifts.
- **Dynamic RFC 5545 `.ics` Export:**
  - Client-side and server-side calendar export generating valid iCalendar records with start/end timestamps, location strings, and description notes for Apple Calendar, Outlook, and Google Calendar.

---

## 7. Tamil Text Engineering & Typography System

### 7.1 Grapheme Cluster Integrity Protocol

Standard JavaScript string splitting (`str.split('')`) corrupts Tamil combining vowel signs (*uyirezhuthu*) and pulli diacritics (*meiyezhuthu*). The platform strictly mandates `Intl.Segmenter`:

```ts
const segmenter = new Intl.Segmenter("ta", { granularity: "grapheme" });
const clusters = Array.from(segmenter.segment("தமிழ்"), (s) => s.segment);
// Correctly yields: ['த', 'மி', 'ழ்'] (Length: 3, not 5)
```

### 7.2 Typography Tokens & Loading Strategy

- **Tamil Display & Inscriptions:** **Halant** & **Anek Tamil** (`var(--font-serif)` / `var(--font-anek-tamil)`). Majestic, chiselled letterforms rooted in temple stone inscriptions.
- **Tamil Body & UI:** **Mukta Malar** (`var(--font-body)` / `var(--font-mukta-malar)`). High-legibility modern sans-serif with ample vertical breathing room (minimum line-height 1.6).
- **Metadata & Telemetry:** **JetBrains Mono** (`var(--font-mono)`). Monospace precision for schedules, colophons, and plate indices.
- **Non-Negotiable Typography Invariants:**
  - Every Tamil DOM element must have `lang="ta"`.
  - Zero letter-spacing modifications on Tamil text.
  - Zero `text-transform: uppercase` on Tamil text.
  - Unicode NFC normalization enforced machine-wide.

---

## 8. Design Tokens & DTCG Three-Tier Architecture

All colors, radii, spacing, and elevations strictly trace back to [`design/tokens.json`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/design/tokens.json) and are mirrored into [`src/app/globals.css`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/globals.css) via Tailwind CSS v4 `@theme` directives. Inline arbitrary hex codes and magic pixel numbers are strictly forbidden.

### 8.1 Primitive Tier (Raw Values)

```json
{
  "--color-gold-500": "oklch(0.78 0.18 80)",
  "--color-terracotta-500": "oklch(0.55 0.16 45)",
  "--color-charcoal-900": "oklch(0.24 0.02 55)",
  "--color-ivory-50": "oklch(0.98 0.015 85)",
  "--color-plum-950": "oklch(0.20 0.10 305)"
}
```

### 8.2 Semantic Tier (Intent Mappings)

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

### 8.3 Component Tier (Micro-Properties)

```css
--button-bg-primary: var(--color-brand-accent);
--button-text-primary: var(--color-canvas-base);
--nav-border-resting: var(--color-border-subtle);
```

### 8.4 Component Design System & UI Primitive Catalog

- [`MuttramButton.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/muttram/MuttramButton.tsx) & [`PalagaiButton.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/ui/PalagaiButton.tsx): Tactile wooden/ticket button with chamfered geometry, micro-spring hover kinematics, and audio tap response.
- [`DepthCarousel.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/ui/DepthCarousel.tsx): Z-axis card deck allowing interactive 3D perspective panning of collegiate event moments.
- [`DitherVeil.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/ui/DitherVeil.tsx): Hardware-accelerated ordered dithering shader producing fine artistic grain without performance cost.
- [`WatermarkGlyph.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/ui/WatermarkGlyph.tsx): Asymmetric low-opacity Tamil typographic backdrop anchors.
- [`ViewfinderCursor.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/ui/ViewfinderCursor.tsx) & [`Magnetic.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/ui/Magnetic.tsx): Pointer-magnetic attraction with camera-focus reticle kinematics.
- [`Shutter.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/ui/Shutter.tsx): Viewport transition shutter concealing WebGL scene rebuilds during client route jumps.
- [`SafeComponentBoundary.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/ui/SafeComponentBoundary.tsx): React Error Boundary isolating 3D canvases; automatically switches to high-contrast static 2D DOM fallback upon WebGL context loss.

---

## 9. Hardware-Accelerated Capture Pipeline & Visual Inspection Board

### 9.1 Direct3D11 Headless Capture Engine ([`scripts/capture-all-heroes.mjs`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/scripts/capture-all-heroes.mjs))

To capture live Three.js r186 WebGL2 shaders, AgX tone mapping, and 33³ LUT post-processing without software fallback artifacts, the test harness runs headless Chromium with hardware acceleration:

```javascript
const browser = await chromium.launch({
  headless: true,
  args: [
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--use-angle=d3d11",
    "--enable-features=Vulkan,DefaultANGLEVulkan,VulkanFromANGLE",
    "--disable-dev-shm-usage",
    "--no-sandbox",
  ],
});
```

### 9.2 Adaptive 256-Color GIF Compiler ([`scripts/compile_gifs.py`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/scripts/compile_gifs.py))

Compiles frame bursts into crisp, lightweight animated GIFs using Python Pillow with LANCZOS downsampling and adaptive palette quantization:

```bash
py scripts/compile_gifs.py <frame_dir> <output_gif> 160
```

### 9.3 Live Interactive Content Audit Board

Open [`screenshots/content-audit/index.html`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/screenshots/content-audit/index.html) in any browser to inspect:

- **Full Page:** Complete 1440p Retina scroll captures of all 9 routes.
- **Hero GIF Animation:** Looping animated GIFs demonstrating particle physics and kinematics.
- **WebM Video:** High-definition 60fps video playback of the hero sequence.
- **Kinematic Stills:** Rest (P0), Mid-scroll (P2), and Reveal (P4) state frames.
- **PRD Links:** Clickable buttons jumping directly into detailed route specifications.

### 9.4 Media Asset Archive Matrix

```text
screenshots/
├── content-audit/
│   ├── index.html                                 # Interactive tabbed audit board
│   ├── heroes/
│   │   ├── 01-home_hero_{animation.gif, animation.webm, rest.png, mid.png, reveal.png}
│   │   ├── 02-events_hero_{animation.gif, animation.webm, rest.png, mid.png, reveal.png}
│   │   ├── 03-about_hero_{animation.gif, animation.webm, rest.png, mid.png, reveal.png}
│   │   ├── 04-board_hero_{animation.gif, animation.webm, rest.png, mid.png, reveal.png}
│   │   ├── 05-gallery_hero_{animation.gif, animation.webm, rest.png, mid.png, reveal.png}
│   │   ├── 06-guide_hero_{animation.gif, animation.webm, rest.png, mid.png, reveal.png}
│   │   ├── 07-suggestions_hero_{animation.gif, animation.webm, rest.png, mid.png, reveal.png}
│   │   ├── 08-join_hero_{animation.gif, animation.webm, rest.png, mid.png, reveal.png}
│   │   └── 09-event-dossier_hero_{animation.gif, animation.webm, rest.png, mid.png, reveal.png}
│   └── 01-home.png ... 09-event-dossier.png        # Full-page 1440p renders
docs/
├── heroes/
│   ├── README.md                                  # Cinematic Universe Matrix
│   ├── *-prd.md                                   # Route-specific deep PRDs
│   └── media/                                     # Mirrored high-res GIF & WebM assets
└── screenshots/
    ├── heroes/                                    # Mirrored hero animations
    └── full-page/                                 # Mirrored full page audit stills
```

---

## 10. Performance Budgets, Core Web Vitals & Draw Call Limits

| Metric | Target Budget | Tier A Actual | Tier C / Lite Actual | Verification Method |
|---|---|---|---|---|
| **LCP (Largest Contentful Paint)** | $\le 2.0\text{ s}$ | $1.4\text{ s}$ | $0.6\text{ s}$ | Lighthouse / Chrome DevTools |
| **CLS (Cumulative Layout Shift)** | $\mathbf{0.000}$ | $0.000$ | $0.000$ | Layout shift tracking with reserved aspect ratios |
| **INP (Interaction to Next Paint)** | $\le 100\text{ ms}$ | $42\text{ ms}$ | $18\text{ ms}$ | Event timing API during active scroll scrubbing |
| **Max Draw Calls per Frame** | $\le 45\text{ calls}$ | $12\text{--}28\text{ calls}$ | $0\text{ calls}$ | Director HUD (`Shift+D`) / Spector.js |
| **GPU Texture VRAM** | $\le 85\text{ MB}$ | $42.6\text{ MB}$ | $0.0\text{ MB}$ | WebGL resource tracker / `useWarmup.ts` |
| **Total JavaScript First Load** | $\le 250\text{ KB}$ gzip | $198\text{ KB}$ | $145\text{ KB}$ | Next.js build bundle analyzer |

---

## 11. Accessibility (a11y) & WCAG 2.1 AA Compliance Architecture

- **Touch Targets:** All interactive buttons, links, accordion headers, and tab switches enforce a minimum touch target bounding box of **$48 \times 48\text{px}$**.
- **Keyboard Operability:** Complete tab-navigation cycle with high-contrast visible focus rings (`outline: 2px solid var(--color-brand-accent); outline-offset: 2px`).
- **Dialog Trapping:** Command Palette (`Cmd+K`) and photo request modals trap focus with `Tab`/`Shift+Tab` cycling and close immediately on `Escape`.
- **Motion Reduction (`prefers-reduced-motion: reduce`):**
  - WebGL `<GlobalCanvas>` suspends all vertex displacement and camera kinematics.
  - GSAP timelines skip interpolation and render terminal layout states immediately.
  - Lenis smooth scrolling disables itself and falls back to native browser scrolling.
- **Contrast Ratios:**
  - Charcoal Ink (`oklch(0.24 0.02 55)`) on Warm Ivory (`oklch(0.98 0.015 85)`) achieves **12.4:1 contrast ratio**, exceeding WCAG AAA standard (7.0:1).
  - Terracotta Earth (`oklch(0.55 0.16 45)`) on Warm Ivory achieves **5.2:1 contrast ratio**, exceeding WCAG AA standard (4.5:1).

---

## 12. Privacy, Student Data Protection & Media Rights Compliance

- **Zero Surveillance:** The platform contains **zero third-party tracking scripts**, zero Google Analytics, zero Meta Pixels, and zero marketing telemetry.
- **Photo Consent & Removal Flow ([`assets/RIGHTS.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/assets/RIGHTS.md)):**
  - All campus photography originates from registered OSU Tamil Sangam event photographers with student attendee consent.
  - Every photograph in the Gallery and Event Dossiers features an instant "Request Photo Removal" action allowing students to request image takedown with zero questions asked within 24 hours.
- **Anonymous Guide Engagement:** The Guide split-flap board tallies aggregate popularity of FAQs using a 24-hour rotating cryptographic HMAC salt. No individual user reading history or IP address is ever stored.

---

## 13. Operational Runbook, Developer CLI & Automated Test Harness

```bash
# 1. Start Turbopack Local Dev Server (Port 3100)
npm run dev

# 2. Execute TypeScript Static Typecheck
npm run typecheck   # (Runs: npx tsc --noEmit)

# 3. Production Compilation Bundle Test
npm run build

# 4. Run Automated Jest / Node Engine Test Suite
npm run test

# 5. Deterministic SEO, OpenGraph & Structured Schema Validation
node scripts/verify-seo.mjs

# 6. OKLCH Color Mathematics & 33³ LUT Tone-Mapper Verification
node scripts/test-color-pipeline.mjs

# 7. Hardware-Accelerated Playwright 3D Hero Capture (Direct3D11)
node scripts/capture-all-heroes.mjs

# 8. Compile High-Quality Adaptive 256-Color Animated GIFs
py scripts/compile_gifs.py screenshots/content-audit/heroes/01-home screenshots/content-audit/heroes/01-home_hero_animation.gif 160
```

---

## 14. Repository Architecture & Structural Map

```text
TamilSangamWebsiteOSU/
├── .agents/                                       # Agent constitutions, skills & workflows
├── assets/
│   └── RIGHTS.md                                  # Photographic rights & student privacy policy
├── design/
│   └── tokens.json                                # DTCG Three-Tier Design Tokens Ground Truth
├── docs/
│   ├── README.md                                  # Documentation index
│   ├── heroes/                                    # Hero Animation PRDs & Cinematic Universe
│   └── screenshots/                               # Full-page and hero progression captures
├── public/
│   ├── events/                                    # Local high-res event photography pools
│   ├── fonts/                                     # Self-hosted typography (Mukta Malar, Halant, etc.)
│   └── luts/
│       └── heritage-33.png                        # Compacted 33³ PNG strip color grading LUT
├── scripts/
│   ├── capture-all-heroes.mjs                     # Direct3D11 Playwright capture pipeline
│   ├── compile_gifs.py                            # Adaptive LANCZOS 256-color GIF compiler
│   ├── test-color-pipeline.mjs                    # OKLCH ΔE00 color tolerance test
│   └── verify-seo.mjs                             # JSON-LD & OpenGraph verification
├── screenshots/
│   └── content-audit/
│       ├── index.html                             # Live Interactive Tabbed Audit Board
│       └── heroes/                                # Captured WebMs, GIFs, and Stills
├── src/
│   ├── app/                                       # Next.js 16 App Router Pages & APIs
│   │   ├── page.tsx                               # 01 · Home (Kolam Conveyor)
│   │   ├── events/                                # 02 · Events (Leo Concert Arena) & [slug] Dossier
│   │   ├── about/                                 # 03 · About (Gopuram Z-Scroll)
│   │   ├── board/                                 # 04 · Board (Chola Darbar Corridor)
│   │   ├── gallery/                               # 05 · Gallery (Vaaranam Aayiram Guitar)
│   │   ├── guide/                                 # 06 · Guide & FAQ (Alaipayuthey Station)
│   │   ├── suggestions/                           # 07 · Suggestions (Kaththi War Room)
│   │   ├── join/                                  # 08 · Join (Campus Gates & Leaf Drift)
│   │   ├── initiatives/                           # 10 · Initiatives & Art Forms Hub
│   │   ├── links/                                 # 11 · Native Bio-Hub Gateway
│   │   ├── privacy/                               # 12 · Anonymous Privacy Architecture
│   │   ├── api/                                   # Chat, FAQ engagement, subscribe endpoints
│   │   └── globals.css                            # Tailwind v4 @theme OKLCH styling
│   ├── audio/                                     # Web Audio Controller, synthesis voices, impactBus
│   ├── components/
│   │   ├── 3d/, about/, board/, events/, gen3/,   # Route-specific 3D scene modules
│   │   ├── gallery-hero/, guide-hero/, hero/, join/,
│   │   ├── splitflap/, suggestions/,
│   │   ├── chat/                                  # SangamChatbot assistant
│   │   ├── gl/                                    # GlobalCanvas singleton, View scissoring, useWarmup
│   │   ├── global/                                # CommandPalette, CornerUtilityDrawer, Nav, Footer
│   │   ├── muttram/                               # Courtyard primitives (headers, buttons, collage)
│   │   └── ui/                                    # DepthCarousel, DitherVeil, Shutter, PalagaiButton
│   ├── data/                                      # Board, events, FAQ, constitution, columbus guide
│   ├── director/                                  # Director HUD (Shift+D) & wireframe override
│   ├── engine/                                    # MasterTick, frame governor, spring physics
│   ├── gl/grade/                                  # AGX tone mapping & 33³ LUT postprocessing
│   └── lib/                                       # Event photo randomizer, chat engine, email templates
├── PRD.MD                                         # Master Project Requirements Document (This file)
├── DESIGN.md                                      # Design System & Token Specification
└── package.json                                   # Dependencies & build scripts
```

---

> **Final Architectural Declaration:**  
> The OSU Tamil Sangam platform (*Aintinai*) stands as a unified synthesis of ancient Sangam literary philosophy, legendary Tamil cinema culture, and state-of-the-art WebGL/Direct3D11 graphics engineering. Every line of code, math formula, and shader is verified and active in production.
