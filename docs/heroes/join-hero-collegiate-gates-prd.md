# PRD — Join Hero: "The Morning Campus Courtyard Gates & Leaf Drift"

### Wrought-Iron Hinge Kinematics, Buckeye & Madurai Jasmine Petal Confluence

> **Surface:** `/join` (Membership Onboarding & Community Gateway)  
> **Status:** Active Production Architectural Specification (v3.0)  
> **Cinematic & Cultural Anchor:** Cheran's *Autograph* (2004) / Gautham Vasudev Menon's *Minnale* (2001) / Collegiate Autumn Nostalgia & Diasporic Union  
> **Core Subsystems:** `JoinHeroCanvas.tsx`, `CampusGate.tsx`, `GateLettering.tsx`, `LeafDrift.tsx`, `MorningVolumetrics.tsx`, `JoinMaterialsManager.tsx`  
> **Media Artifacts:**
>
> - Video Capture: [`docs/heroes/media/join_hero_animation.webm`](./media/join_hero_animation.webm)
> - Animated GIF: [`docs/heroes/media/join_hero_animation.gif`](./media/join_hero_animation.gif)
> - Rest Frame: [`docs/heroes/media/join_hero_rest.png`](./media/join_hero_rest.png)
> - Mid-Scroll Gates: [`docs/heroes/media/join_hero_mid.png`](./media/join_hero_mid.png)
> - Sunlight Reveal: [`docs/heroes/media/join_hero_reveal.png`](./media/join_hero_reveal.png)

---

## 1. Creative Intent & Emotional Architecture

### 1.1 The Anxiety of Arriving on Campus

Joining a collegiate student organization can feel intimidating for incoming undergraduates, international graduate scholars, and students with varying degrees of Tamil fluency:

- Fear of linguistic elitism or not knowing the language "well enough."
- Feeling disconnected from home culture while navigating a massive Midwestern university with 66,000 students.
- Clinical Google Forms and Linktree links that lack human warmth.

### 1.2 The Solution: The Open Morning Gates

The `/join` hero is designed as an architectural embrace (*Varuga, Varuga* — வருக வருக):

1. **The Threshold of Belonging:** Rather than a digital form, the visitor encounters the monumental wrought-iron gates of a collegiate courtyard standing closed at dawn.
2. **The Act of Welcoming:** As the user scrolls, the heavy wrought-iron gates physically swing outward toward the viewer on realistic mechanical hinges, revealing a sunlit courtyard bathed in warm volumetric morning rays.
3. **The Confluence of Two Worlds:** The air is filled with drifting leaves—not just any leaves, but a poetic blend of **Ohio Buckeye foliage** and **Madurai Jasmine petals (*malli poo*)**, celebrating the student who lives in both worlds.

---

## 2. Cultural Metaphor & Cinematic Homage

### 2.1 The Buckeye & Madurai Jasmine Confluence (`LeafDrift.tsx`)

The most significant cultural detail in the entire 3D scene is the procedural leaf simulation running on the GPU:

- **90% Ohio Buckeye Leaves (*Aesculus glabra*):** Rendered in a spectrum of Midwest late-summer and autumn hues—vibrant buckeye green (`#5E9B3A`), meadow green (`#77A842`), golden-green edges (`#8DBF4A`), and rich bronze-amber (`#B87A38`). This anchors the experience firmly on the Ohio State University campus.
- **10% Madurai Jasmine Petals (*Jasminum sambac* / மதுரை மல்லி):** Scattered among the autumn leaves are delicate, cream-white jasmine petals (`#FAF6ED`, `#F5EEDB`, `#FFF8E7`). In Tamil culture, *malli poo* is the universal emblem of celebration, bridal blessings, maternal warmth, and homecoming.
- **The Meaning:** As the Buckeye leaves and Jasmine petals swirl together in the Ohio wind, they create an unmistakable emotional statement: *You do not have to leave your heritage behind to thrive as a Buckeye.*

### 2.2 Collegiate Cinematic Nostalgia

The lighting and atmosphere draw inspiration from the college arrival and memory sequences of celebrated Tamil cinema (*Autograph*, *Minnale*, *Nanban*):

- **Morning Blue Hour into Golden Dawn:** The scene transitions from the cool stillness of early morning into a radiant golden haze as sunlight filters through the gate bars.
- **Cast Bronze Arch Plaque:** A sweeping arch crowning the stone pillars displays hand-set polished bronze lettering spelling `"TAMIL SANGAM"`, anchored beneath by an authentic plaque inscribed:
  $$\text{"ஓஹியோ தமிழ் சங்கம் · EST. 2024"}$$

---

## 3. Physical & Shader Engineering

```text
[SCROLL PROGRESS: p = 0.0]
  │ Gates closed; Bronze lettering glints in dawn fog; Buckeye and Jasmine petals drift across camera
  ▼
[SCROLL PROGRESS: p = 0.40]
  │ Hinge physics activate; Left gate swings to θ = -75°, Right gate swings to θ = +75°
  ▼
[SCROLL PROGRESS: p = 0.75]
  │ Camera cranes forward through the gateway; Sun light shafts illuminate limestone cobblestones
  ▼
[SCROLL PROGRESS: p = 1.00]
  │ Atmospheric whiteout transition seamlessly unmasks the conversational guestbook form
```

### 3.1 Procedural Hinge Kinematics (`CampusGate.tsx`)

Each wrought-iron gate leaf ($W = 3.3\text{ m}, H = 4.4\text{ m}$) pivots on an offset hinge origin $(x = \pm 3.3\text{ m})$:
$$\theta_{\text{left}}(p) = -\theta_{\max} \cdot \text{smoothstep}(0.15, 0.85, p)$$
$$\theta_{\text{right}}(p) = +\theta_{\max} \cdot \text{smoothstep}(0.15, 0.85, p)$$
Where $\theta_{\max} = 1.35\text{ rad} \approx 77.3^\circ$. An asymmetric spring damper ensures the gates decelerate with physical weight without unnatural digital snapping.

### 3.2 Dual-Texture Atlas Leaf Shader (`LeafDrift.tsx`)

Leaves are rendered in a single instanced draw call using a partitioned UV atlas:

- Buckeye leaf UV mapped to $U \in [0.0, 0.5]$.
- Madurai Jasmine petal UV mapped to $U \in [0.5, 1.0]$.
- Vertex shader calculates 3-axis rotational tumbling and ground boundary collisions:
  $$y(t) = y_{\text{init}} - v_y \cdot t + A_{\text{drift}} \sin(\omega_x x + \nu_t t)$$

---

## 4. Content Integration: The Welcoming Hearth

Stepping through the collegiate gates leads the student directly to the **Welcoming Hearth**:

1. **Conversational Guestbook Form:** Friendly, welcoming prompts with minimal required fields.
2. **Inclusive Language Support:** Explicitly welcoming students of all backgrounds: fluent Tamil speakers, heritage learners, and non-Tamil friends who love the food, cinema, and cultural energy.
3. **Instant Community Links:** Frictionless onboarding into the official student GroupMe and community announcement channels.

---

## 5. Performance Invariants

- **Single Instanced Draw Call for Leaves:** Over 400 simultaneous drifting particles rendered in 1 draw call.
- **Texture Memory:** All brick, stone bump, and iron maps are procedurally generated in memory (`textureUtils.ts`), eliminating 12 MB of image downloads.
- **Graceful Fallback:** In Tier C and reduced-motion modes, provides a static morning courtyard view with crisp CSS styling.
