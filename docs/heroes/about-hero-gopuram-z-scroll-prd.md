# PRD — About Hero: "The 5-Tala Gopuram Z-Scroll Fly-Through"

### Dravidian Temple Tower Architecture, Brahma Mudi Sikku Kolam & Classical Sangam Ethos

> **Surface:** `/about` (Heritage, Mission & Organic River Timeline)  
> **Status:** Active Production Architectural Specification (v3.0)  
> **Cinematic & Literary Anchor:** Classical Sangam Literature (*Puranaanooru* 192 / Kaniyan Poongundranar) & Selvaraghavan's *Aayirathil Oruvan* (2010)  
> **Core Subsystems:** `GopuramZScroll.tsx`, `KolamKnotCurve`, `BronzeRing`, `CourtyardHeader.tsx`, `FlowingRiverTimeline.tsx`  
> **Media Artifacts:**
>
> - Video Capture: [`docs/heroes/media/about_hero_animation.webm`](./media/about_hero_animation.webm)
> - Animated GIF: [`docs/heroes/media/about_hero_animation.gif`](./media/about_hero_animation.gif)
> - Rest Frame: [`docs/heroes/media/about_hero_rest.png`](./media/about_hero_rest.png)
> - Mid-Scroll Tala: [`docs/heroes/media/about_hero_mid.png`](./media/about_hero_mid.png)
> - Gopuram Reveal: [`docs/heroes/media/about_hero_reveal.png`](./media/about_hero_reveal.png)

---

## 1. Creative Intent & Philosophical Architecture

### 1.1 The Risk of Academic Dryness

"About Us" pages on collegiate club websites often suffer from one of two extremes:

- Dry, bulleted corporate mission statements that students skim and forget.
- Shallow social media slogans that fail to convey the deep cultural gravitas of Tamil heritage.

### 1.2 The Solution: The Gopuram Ascent

The Dravidian temple *gopuram* is one of the crowning achievements of human architectural history—a tapering monumental gateway tower adorned with hundreds of carved tiers (*talas*) pointing toward the infinite sky.
In `/about`, the visitor is propelled on an unbroken **Z-Axis Mission Fly-Through** that travels up through 5 sacred tiers (*talas*), with each tier framed by a monolithic rotating bronze **Brahma Mudi (பிரம்ம முடி) Sikku Kolam**:

1. **Sacred Scale:** Establishes immediately that the Ohio State Tamil Sangam is not a transient student hobby, but part of a 2,500-year continuous civilizational lineage.
2. **Progressive Philosophical Revelation:** Rather than dumping text on a screen, each scroll tier unlocks one foundational pillar of the organization's ethos.
3. **Universality:** Centering the ancient verse *Yaathum Oore Yaavarum Kelir* affirms that all students, regardless of background, race, or mother tongue, are welcome in our courtyard.

---

## 2. Cinematic & Literary Anchors

### 2.1 Classical Sangam Literature (*Puranaanooru* 192)

The conceptual bedrock of the entire hero is the immortal verse of the Sangam poet Kaniyan Poongundranar (கணியன் பூங்குன்றனார்), written over 2,000 years ago during the classical Sangam period (c. 300 BCE – 300 CE):
$$\text{"யாதும் ஊரே யாவரும் கேளிர்"}$$
*(“To us all towns are home, everyone our kin.”)*

This egalitarian philosophy pre-dated Western Enlightenment humanism by two millennia. In the 3D scene, this verse emerges as a massive atmospheric watermark that tracks with camera parallax as the user ascends through the first tier.

### 2.2 The 5 Sacred Talas (Tiers) Sequence

```text
[TIER 1 · TALA 0: Foundational Sangam Philosophy]
  "To Us All Towns Are Home, Everyone Our Kin" (யாதும் ஊரே யாவரும் கேளீர்)
  → Puranaanooru 192: Radical inclusion and universal belonging under Ohio skies.
       │
       ▼
[TIER 2 · TALA 1: Pillar of Belonging]
  "A Campus Family Open to All Languages" (மொழி பேதமின்றி அனைவருக்குமான இல்லம்)
  → Dismantling linguistic gatekeeping: welcoming Tamil speakers, learners, and friends.
       │
       ▼
[TIER 3 · TALA 2: The Rhythm of Joy]
  "Aatam, Paatam, Kondatam" (ஆட்டம் · பாட்டம் · கொண்டாட்டம்)
  → Dance, Carnatic and film music, festive banquets, and South Oval lawn picnics.
       │
       ▼
[TIER 4 · TALA 3: Collegiate Fellowship]
  "Lifelong Buckeye Community in Columbus" (வளாகத்தில் வாழ்நாள் நட்பு)
  → Mentorship, shared rides, home-cooked food nights, and alumni brotherhood.
       │
       ▼
[TIER 5 · TALA 4: Living Heritage]
  "Rooted in 2,500 Years of Classical Literature" (செம்மொழி மரபுடன் நவீன பார்வை)
  → Celebrating one of the world's longest-surviving classical languages with modern collegiate vitality.
```

---

## 3. Mathematical Kolam Engineering (`KolamKnotCurve`)

### 3.1 The Brahma Mudi Parametric Knot

The concentric bronze rings that frame each tier are mathematically constructed as authentic **Brahma Mudi (பிரம்ம முடி — Brahma's Knot)** continuous closed curves without self-intersection or polygon faceting:
$$u = 2\pi p \cdot t$$
$$r(t) = R_0 \cdot \left[1 + A \cos\left(\frac{q}{p} u\right)\right]$$
$$x(t) = r(t) \cos(u), \quad y(t) = r(t) \sin(u), \quad z(t) = \delta \sin\left(\frac{q}{p} u\right)$$

Where:

- $R_0 = 3.0\text{ m}$ (Base radius)
- $A = 0.25$ (Gentle harmonic radial modulation forming 8 lotus petal loops)
- $p = 3, q = 8$ (Harmonic winding factors ensuring topological closure)
- $\delta = 0.45\text{ m}$ (Z-axis weaving depth)

### 3.2 High-Fidelity Geometry Specifications

- **720 Tubular Segments:** Ensures silky, mathematically continuous curvature.
- **32 Radial Segments:** Produces rounded cylindrical wire volume that catches dynamic camera light.
- **PBR Bronze Materials:** Shared metallic bronze (`#b87333`, `metalness: 0.9`, `roughness: 0.18`) and warm temple gold (`#e6a147`).

---

## 4. Editorial Content Bridging: The Organic River Timeline

Upon emerging from the 5th tala of the gopuram, the camera dissolves seamlessly into the **Organic Journey**:

1. **The Hero Quote Monument:** Giant Cormorant/Halant serif quote of *Yaathum Oore Yaavarum Kelir* resting directly on the Warm Ivory (`#FAF9F6`) field.
2. **Center-Snaking SVG River Timeline:** An organic river graphic navigating chronologically through the club's milestones:
   - *2021:* Informal student cohort founded on the banks of the Olentangy.
   - *2023:* Annual cultural celebrations at the Ohio Union.
   - *2024:* Official OSU Student Organization registration and constitution ratification.
   - *2026:* Five Pillars expansion, conversational Tamil workshops (*Katral*), and community food drives.
3. **Campus Alliances & All-Volunteer Governance:** Direct verification of affiliations with Telugu Tamasha, Council on Student Affairs (CSA), and local Columbus kitchens.

---

## 5. Technical Safeguards & A11y

- **Prefers-Reduced-Motion:** Instantly bypasses 3D camera travel and presents the 5 core principles as an elegant, high-contrast typography spread.
- **GPU Budget:** Reuses a single shared memoized geometry pool for all bronze kolam rings, consuming $< 4\text{ MB}$ GPU VRAM.
