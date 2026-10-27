# PRD — Suggestions Hero: "The Kaththi War Room & Ohio Stadium Blueprint"

### Axonometric Architectural Mesh, Coin Drop Intersection & Tactical Pipeline Schematics

> **Surface:** `/suggestions` (Ideas, Proposals & Community Ledger)  
> **Status:** Active Production Architectural Specification (v3.0)  
> **Cinematic Anchor:** *Kaththi* (2014) (A.R. Murugadoss / Thalapathy Vijay / Anirudh Ravichander / Kathiresan's Chennai Water Pipeline Blueprint)  
> **Core Subsystems:** `BlueprintScene3D.tsx`, `OhioStadiumWireframe.ts`, `BlueprintSVG.tsx`, `SuggestionForm.tsx`  
> **Media Artifacts:**
>
> - Video Capture: [`docs/heroes/media/suggestions_hero_animation.webm`](./media/suggestions_hero_animation.webm)
> - Animated GIF: [`docs/heroes/media/suggestions_hero_animation.gif`](./media/suggestions_hero_animation.gif)
> - Rest Frame: [`docs/heroes/media/suggestions_hero_rest.png`](./media/suggestions_hero_rest.png)
> - Mid-Scroll War Room: [`docs/heroes/media/suggestions_hero_mid.png`](./media/suggestions_hero_mid.png)
> - Architectural Reveal: [`docs/heroes/media/suggestions_hero_reveal.png`](./media/suggestions_hero_reveal.png)

---

## 1. Creative Intent & Thematic Architecture

### 1.1 Beyond Passive Suggestion Boxes

Most collegiate clubs bury their feedback in an unmonitored Google Form or an abandoned suggestions box:

- Feedback feels futile, passive, and bureaucratic.
- Students feel like their ideas disappear into a void without accountability.
- Zero intellectual excitement or sense of collective movement.

### 1.2 The Solution: The Tactical War Room

In *Kaththi*, Kathiresan transforms technical civil engineering blueprints into an instrument of nonviolent rebellion, bringing a metropolitan city to a standstill to amplify the plight of suffering farmers.
By translating the suggestions page into the **Kaththi War Room Archive**:

1. **Student Agency as Engineering:** Every idea proposed by a student—whether it is a new cultural initiative, a festival concept, or a campus reform—is treated as an architectural blueprint for community transformation.
2. **Iconic Ohio State Landmark:** Rather than a fictional building, the 3D wireframe reconstructs **Ohio Stadium ("The Horseshoe")**, the hallowed ground of Ohio State pride, connecting Buckeye campus geography with Tamil tactical cinematic lore.
3. **Transparent Public Ledger:** Submissions are not lost in an inbox; they route into a live, transparent public tracking ledger showing proposal statuses from intake to execution.

---

## 2. Cinematic Homage & Memorabilia Easter Eggs

### 2.1 The *Kaththi* Planning Headquarters Aesthetic

The 3D environment reproduces the visual grading, lighting, and tactile props of the famous war room sequence in *Kaththi*:

| Cinematic Element | *Kaththi* (2014) Film Reference | 3D WebGL Implementation |
|---|---|---|
| **Bruised Plum Void** | The dimly lit, midnight tactical room where blueprints are rolled across the concrete floor | High-resolution $2048\times 2048$ procedural canvas radial gradient: `#241021` $\to$ `#150914` $\to$ `#0F050A` |
| **Laser Construction Scan** | Kathiresan analyzing the pipeline schematic with backlighting and tracing lines with his fingertips | Golden laser sweep plane traveling along the Z-axis, illuminating wireframe segments with neon amber glow |
| **The Coin Drop** | The iconic five-rupee coin tossed by Vijay onto the blueprint to mark the exact pressure junction | Procedural 3D brass coin resting at the critical intersection of the main feeder line and South Gate branch (`[3.6, 0.05, 4.4]`) |
| **Hydrology Pipe Network** | The underground water pipelines of Chennai mapped in glowing cyan and amber | Sub-surface 3D glowing tube network running beneath the stadium turf with pulsing fluid particles |
| **The Brass Drafting Compass** | Heavy mechanical architect's drafting compass used to measure pipeline radiuses | 3D brass compass anchored into the millimeter drafting grid at `[-3.8, 0.25, -2.1]` |
| **Rolled Master Scrolls** | Rolled city planning scrolls stacked against tables | High-poly rolled parchment models flanking the North Rotunda |
| **Technical Title Block** | Government municipal engineering stamp | Inscribed: `"THE OHIO STATE UNIVERSITY · KATHTHI WAR ROOM ARCHIVE · SCALE: 1:500 · DWG NO. OSU-TS-2024"` |

---

## 3. Mathematical & Geometric Wireframe Engineering

### 3.1 Ohio Stadium Procedural Geometry (`OhioStadiumWireframe.ts`)

The Horseshoe is constructed parametrically without importing heavy external `.gltf` CAD files:

- **The U-Bend Horseshoe Curve:** Modeled via semicircular polar equations:
  $$x(\theta) = R \cos(\theta), \quad z(\theta) = R \sin(\theta), \quad \theta \in [0, \pi]$$
  Coupled with straight sideline bleacher extrusions extending toward the South Scoreboard.
- **Stepped Tier Seating Rings:** 4 concentric seating decks (A-Deck, B-Deck, C-Deck, D-Deck) rising in elevation:
  $$y_k = y_0 + k \cdot \Delta h, \quad R_k = R_0 + k \cdot \Delta w$$
- **The Historic North Rotunda:** 8 towering semicircular arches crowned by stained-glass cornices, reconstructed with glowing copper line vectors.

### 3.2 Holographic Line Construction Shader (`BlueprintScene3D.tsx`)

As the visitor scrolls, a holographic scan wave sweeps from North to South. Lines entering the wave front ignite with high-emissivity bloom before settling into architectural bronze:
$$I_{\text{line}}(z, t) = I_{\text{base}} + I_{\text{peak}} \cdot \exp\left(-\frac{(z - z_{\text{scan}}(t))^2}{2\sigma^2}\right)$$
Where $\sigma = 1.2\text{ m}$ governs the width of the active construction wave.

---

## 4. Content Integration: The Ideas Hearth

Once the visitor completes the architectural tour of the stadium, the camera settles onto the **Ideas Hearth**:

1. **Conversational Proposal Form:** A distraction-free, elegant form allowing students to submit ideas across four categories:
   - *Event Concepts:* Novel cultural celebrations, movie nights, or culinary banquets.
   - *Guest Speakers & Artists:* Collaborations with Tamil filmmakers, Carnatic musicians, or tech leaders.
   - *Campus Alliances:* Joint events with Telugu Tamasha, Indian American Association, or Midwest student bodies.
   - *Community Service:* Food drives, language workshops, and local Columbus initiatives.
2. **Proven Track Record Public Ledger:** Real-time visibility into student ideas that have been formally adopted and funded by the executive board.

---

## 5. Sensory & Accessibility Safeguards

- **Tone-Mapping Preservation:** Operates in `ToneMappingMode.AGX` with zero luminance blowouts on the glowing amber wireframe lines.
- **Audio Feedback:** Submitting a proposal triggers the synthesized mechanical *thud* and *whoosh* from `AudioController.ts`.
- **Lite & Reduced Motion Modes:** In Tier C / reduced-motion environments, replaces the heavy 3D WebGL scene with an ultra-lightweight, crisp SVG blueprint drawing (`BlueprintSVG.tsx`) that retains 100% of the *Kaththi* tactical atmosphere.
