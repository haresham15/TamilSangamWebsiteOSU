# PRD — Board Hero: "Chola Darbar Corridor" (Imperial Assembly)
### The Ponniyin Selvan Dynastic Throne Room & Silk Tapestry Treadmill

> **Surface:** `/board` (Executive Board & Governance)  
> **Status:** Active Production Architectural Specification (v3.0)  
> **Cinematic Anchor:** *Ponniyin Selvan: I & II* (Mani Ratnam / Kalki Krishnamurthy / A.R. Rahman / Thanjavur Brihadisvara Dynasty)  
> **Core Subsystems:** `BoardHeroCanvas.tsx`, `CorridorTreadmill.tsx`, `CholaCrown3D.tsx`, `TapestryPortrait.tsx`, `OilLamp.tsx`, `EmblemFinale.tsx`  
> **Media Artifacts:**
> - Video Capture: [`docs/heroes/media/board_hero_animation.webm`](./media/board_hero_animation.webm)
> - Animated GIF: [`docs/heroes/media/board_hero_animation.gif`](./media/board_hero_animation.gif)
> - Rest Frame: [`docs/heroes/media/board_hero_rest.png`](./media/board_hero_rest.png)
> - Mid-Scroll Corridor: [`docs/heroes/media/board_hero_mid.png`](./media/board_hero_mid.png)
> - Imperial Reveal: [`docs/heroes/media/board_hero_reveal.png`](./media/board_hero_reveal.png)

---

## 1. Creative Intent & Philosophical Genesis

### 1.1 The Problem with Conventional Board Directories
Standard student organization leadership pages are almost universally uninspired:
- Uniform grids of round LinkedIn headshots with corporate job titles.
- Zero institutional dignity, cultural weight, or mythic resonance.
- Leadership framed as temporary resumes rather than custodians of an ancient language and collegiate brotherhood.

### 1.2 The Solution: The Chola Darbar
In classical Tamil civilization, the Chola Dynasty represents the zenith of architectural monumentality, maritime influence, and cultural governance. By framing the executive board within an **Imperial Chola Darbar (அரசவை மண்டபம்)**:
1. **Sacred Stewardship:** Student officers are cast not as generic corporate executives, but as *Amaichargal* (அமைச்சர்கள் — Ministers), royal architects, and cultural guardians preserving Tamil identity thousands of miles from the homeland on the banks of the Olentangy.
2. **Infinite Continuity:** The infinite granite temple corridor treadmill symbolizes the lineage of students who built the foundation before us and the future generations of Buckeyes who will inherit it.
3. **Warm Temple Hospitality:** Instead of sterile glass and steel, the scene is illuminated by floating brass oil lamps (*agal vilakku*) with authentic particle flames, casting flickering golden amber light across hand-carved Dravidian stone.

---

## 2. Cinematic Connections & Literary Homage

### 2.1 The *Ponniyin Selvan* Homage
The hero sequence is an explicit visual and thematic homage to Mani Ratnam's magnum opus *Ponniyin Selvan* (adapted from Kalki's monumental 1954 epic):
- **The Corridor Architecture:** Directly echoes the majestic pillars of the Kadambur Sambuvarayar palace and the sanctum corridors of the Thanjavur Brihadisvara temple (*Peruvudaiyar Kovil*). Monolithic granite pillars with stepped Yali bases and corbel capitals repeat into the vanishing point.
- **The Night Ambience:** Modeled after the stealthy nighttime council scenes where Vandiyathevan (Karthi), Aditha Karikalan (Chiyaan Vikram), and Arulmozhivarman (Jayam Ravi) navigate stone corridors illuminated only by tallow torches and earthen oil lamps.
- **Silk Tapestries (*Pattu Thongal*):** Suspended from carved teak corbels, woven damask silk banners wave gently in an indoor draft, displaying the photographic portraits of the executive officers painted in warm royal tones.

### 2.2 The Imperial Chola Royal Crown (*Karanda Makuta* — கரண்ட மகுடம்)
Suspended at the climax of the corridor glide is the procedural 3D Chola Crown (`CholaCrown3D.tsx`), mathematically modeled after authentic 10th-century Chola bronzes from the Thanjavur royal collection:
1. **The Base Diadem (Patta / நெற்றிப் பட்டம்):** Inlaid with cabochon rubies, Colombian emeralds, and freshwater pearls.
2. **The Kirtimukha Crest (கீர்த்திமுகம் — Face of Glory):** The protective guardian deity crest adorning the forehead, cascading with pearl swags.
3. **Four Stepped Karanda Tiers:** Tapering cylindrical tiers reflecting the architectural vimana of Dravidian temples.
4. **Sacred Stupi Kalasam Finial:** The double-lotus calyx culminating in a pointed golden bud catching specular highlights.
5. **The Signature Sirascakra (சிரஸ்சக்ரம்):** The iconic Chola lotus halo wheel mounted at the rear of the crown, rotating slowly with specular bronze sheen.
6. **Padma Pitha (பத்ம பீடம்):** The hand-carved lotus petal pedestal floating beneath the crown.

---

## 3. Kinematic Architecture & Scroll Choreography

```text
[SCROLL PROGRESS: p = 0.0]
  │ Camera enters stone portal; Agal Vilakku lamps flicker; Silk tapestries hang in perspective
  ▼
[SCROLL PROGRESS: p = 0.35]
  │ Treadmill glides forward along Z-axis; Tapestry vertex waves ripple as camera glides past
  ▼
[SCROLL PROGRESS: p = 0.70]
  │ Imperial Chola Crown descends into focus; Sirascakra wheel catches specular rim light
  ▼
[SCROLL PROGRESS: p = 1.00]
  │ Blinding golden blowout unmasks the editorial courtyard roster (Warm Ivory #FAF9F6)
```

### 3.1 Procedural Cloth Wave Shader (`TapestryPortrait.tsx`)
Each executive portrait is rendered onto a segmented 3D plane deformed by a custom vertex wave shader simulating silk in an ambient palace breeze:
$$z(y, t) = A \sin(\omega_y \cdot y + \nu_t \cdot t) \cdot \cos(\kappa_x \cdot x)$$
Where:
- $A = 0.045\text{ m}$ (Gentle silk displacement amplitude)
- $\omega_y = 4.2\text{ rad/m}$ (Vertical fold frequency)
- $\nu_t = 2.4\text{ rad/s}$ (Wind oscillation phase velocity)

### 3.2 Floating Agal Vilakku Flame Physics (`OilLamp.tsx`)
Oil lamps float symmetrically at $X = \pm 2.4\text{ m}$. Flame wicks emit stochastic yellow-orange point sprites with Perlin noise turbulence, driving dynamic ambient occlusion across adjacent granite pillar facets.

---

## 4. Tying into Editorial Content: The Muttram Handoff

As the golden emblem finale dissolves, the 3D scene smoothly unmasks the editorial **Warm Portraits Roster**:
1. **The Executive Roster:** Officers presented in warm editorial typography without card frames—featuring their Tamil titles, majors, and hometown roots.
2. **Holographic Trading Cards:** Interactive 3D foil cards reacting to pointer hover with anisotropic metallic sheen.
3. **Constitutional Governance:** Direct links to the organization's democratic constitution, election bylaws, and alumni issue archives.

---

## 5. Technical Specifications & Performance Bounds

| Invariant | Production Budget | Verification Standard |
|---|---|---|
| **Draw Calls** | $\le 65$ calls | Instanced granite pillars (`InstancedMesh`) + shared PBR materials |
| **GPU Memory** | $\le 18\text{ MB}$ textures | Procedural canvas noise + compressed AVIF officer portraits |
| **Frame Rate** | $\ge 58\text{ fps}$ (Desktop), $\ge 30\text{ fps}$ (Mobile) | Dynamic governor downscales to Tier B/C on low battery |
| **Reduced Motion** | Static throne room snapshot | Camera fixed at crown reveal; zero scroll pinning |
