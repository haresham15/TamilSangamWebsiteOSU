# PRD — Events Hero: "The Leo Concert Arena Gen 3"

### Theatrical Factory Stadium, 8,000 Dancers at 128 BPM & The God Light

> **Surface:** `/events` (Gatherings River, Campus Traditions & RFC 5545 Calendar)  
> **Status:** Active Production Architectural Specification (v3.0)  
> **Cinematic Anchor:** Lokesh Kanagaraj's *Leo* (2023) / Thalapathy Vijay / Anirudh Ravichander / "Naa Ready" Factory Concert Choreography  
> **Core Subsystems:** `EventsGen3Canvas.tsx`, `LeoFactoryEnvironment.tsx`, `JumpingCrowdSilhouettes.tsx`, `PhoneTorches.tsx`, `CameraChoreography.tsx`  
> **Media Artifacts:**
>
> - Video Capture: [`docs/heroes/media/events_hero_animation.webm`](./media/events_hero_animation.webm)
> - Animated GIF: [`docs/heroes/media/events_hero_animation.gif`](./media/events_hero_animation.gif)
> - Rest Frame: [`docs/heroes/media/events_hero_rest.png`](./media/events_hero_rest.png)
> - Mid-Scroll Arena: [`docs/heroes/media/events_hero_mid.png`](./media/events_hero_mid.png)
> - Blowout Reveal: [`docs/heroes/media/events_hero_reveal.png`](./media/events_hero_reveal.png)

---

## 1. Creative Intent & Thematic Architecture

### 1.1 The Stagnation of Event Calendars

Traditional collegiate event pages resemble static school bulletins:

- Flat lists of event titles, dates, and times.
- Zero theatrical energy, anticipation, or communal adrenaline.
- Fails to capture the electrifying cultural excitement of massive South Asian student gatherings.

### 1.2 The Solution: The Theatrical Arena

In Tamil culture, university events are not formal sit-down lectures—they are roof-shattering celebrations filled with synchronized Kuthu dance performances, booming live percussion, and thousands of students singing in unison.
By modeling the `/events` hero after the iconic industrial factory concert sequence from *Leo*:

1. **Electrifying Scale:** The visitor is immersed in a massive 3D stadium containing an audience of thousands roaring in silhouette.
2. **Kinetic Camera Trajectory:** A dramatic crane descent plunges the viewer from the high rafters down into the pulsating crowd origin.
3. **The God Light:** A single incandescent sodium-vapor backlight carves a sharp, legendary silhouette out of the lone central performer, capturing the mythological mass-cinema energy of Tamil cinema.

---

## 2. Cinematic Homage & Film Easter Eggs

### 2.1 The *Leo* (2023) Factory Sequence

The entire 300vh scroll-pinned stage draws directly from the aesthetic and mechanical design of the "Naa Ready" stadium number from Lokesh Kanagaraj's blockbuster:

| Cinematic Feature | *Leo* Reference | 3D WebGL Implementation |
|---|---|---|
| **The God Light** | Blinding industrial floodlight positioned behind Thalapathy Vijay | 12,000-intensity point light with inverse-square physical decay casting high-contrast grazing rim highlights |
| **128 BPM Crowd Bounce** | Rhythmic collective bounce of thousands of background dancers | 8,000 instanced silhouette figures (`THREE.InstancedMesh`) whose vertex shader pulses at exactly $128\text{ BPM}$ |
| **Phone Torch Matrix** | Sea of swaying smartphone lights held by the crowd in the darkness | 2,500 point sprites with stochastic twinkling and randomized sway vectors |
| **Industrial Cauldron Platform** | Circular elevated wooden staging vat inside the warehouse | Procedural steel I-beam trusses ($N = 12$) enclosing an elevated wooden stage ($r = 1.8\text{m}$) |
| **Bronze Emblem Suspension** | Floating golden emblems and mass iconography | Extruded 3D metallic Tamil Sangam emblem catching bronze specular reflections |
| **Flare Blowout Transition** | Anirudh beat drop with screen flash | High-exposure bloom blowout unmasking the Gatherings River catalog |

---

## 3. Kinematic Architecture & Scroll Progression

```text
[SCROLL PROGRESS: p = 0.0]
  │ Altitude Crane Shot (y = 18m); Looking down through industrial rafters at the distant illuminated cauldron
  ▼
[SCROLL PROGRESS: p = 0.35]
  │ Camera plunges steeply along Catmull-Rom rail; Rafters whip past; Phone torches twinkle across depth layers
  ▼
[SCROLL PROGRESS: p = 0.70]
  │ Low-angle Hero Framing (y = 1.4m); Central performer silhouette catches intense rim light; Crowd bounces at 128 BPM
  ▼
[SCROLL PROGRESS: p = 1.00]
  │ Sodium backlight expands into full-frame blowout, dissolving seamlessly into the Gatherings River catalog
```

### 3.1 128 BPM Harmonic Vertex Shader (`JumpingCrowdSilhouettes.tsx`)

Rather than running expensive CPU animations for 8,000 figures, the crowd is rendered in a single draw call via `InstancedMesh`. Vertical displacement is computed natively on the GPU:
$$y_{\text{offset}}(t) = \left| \sin\left(2\pi \cdot \frac{128}{60} \cdot t + \phi_i\right) \right| \cdot h_i$$
Where:

- $\frac{128}{60} = 2.133\text{ Hz}$ (The exact tempo of Anirudh's "Naa Ready")
- $\phi_i \in [0, 2\pi]$ (Per-instance phase offset preventing robotic synchronization)
- $h_i \in [0.15\text{m}, 0.35\text{m}]$ (Individualized jumping height)

### 3.2 Stochastic Phone Torch Twinkle (`PhoneTorches.tsx`)

Each torch point sprite calculates dynamic intensity modulation:
$$I_i(t) = I_0 \cdot \left[ 0.7 + 0.3 \sin(\omega_i t) \cos(\nu_i t) \right]$$
Simulating the organic sway and wobble of audience members holding up their smartphones in a darkened auditorium.

---

## 4. Content Integration: The Gatherings River

Following the cinematic blowout, the page transitions cleanly into the **Gatherings River**:

1. **The Gatherings River Catalog:** Linear chronological stream of upcoming and historical celebrations on campus:
   - *Pongal Vizha:* Harvest banquet, traditional veshti/saree attire, and live folk music.
   - *Namma Jathara:* Massive collaborative spring carnival with Telugu Tamasha.
   - *Kondatam Annual Gala:* High-energy night of dance showcases, skits, and alumni awards.
2. **Draggable Memory Archive:** Smooth horizontal photo strip showcasing authentic student laughter and candid memories.
3. **One-Click Calendar Integration:** Dynamic RFC 5545 `.ics` file generation and direct Google Calendar export for every event.

---

## 5. Performance Budget & Verification Invariants

- **Single Draw Call for 8,000 Dancers:** Using `THREE.InstancedMesh` with billboard vertex orientation.
- **Draw Calls:** Scene total strictly kept $\le 85$ calls.
- **Tone Mapping:** Integrated into the global AGX post-processing pipeline (`ToneMappingMode.AGX`), preventing color blowout while maintaining radiant backlight highlights.
- **Lite & Reduced Motion Mode:** Replaces 3D crowd simulation with a crisp, static theatrical concert poster with zero performance degradation.
