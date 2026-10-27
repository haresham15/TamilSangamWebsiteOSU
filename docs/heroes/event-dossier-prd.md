# PRD — Event Dossier: "The Sunlit Randomized Dossier & ReactBits Kinematics"

### Server-Side Fisher-Yates Randomizer, SplitText Typography & Magnetic Vault Door

> **Surface:** `/events/[slug]` (e.g. `/events/berry-cute-picnic`)  
> **Status:** Active Production Architectural Specification (v3.0)  
> **Design Philosophy:** Awwwards High-Fashion Editorial Broadsheet & Analog Light-Table Photo Scatter  
> **Core Subsystems:** `src/app/events/[slug]/page.tsx`, `EventDossierView.tsx`, `SplitText.tsx`, `ParallaxScatter.tsx`, `VaultGateway.tsx`  
> **Media Artifacts:**
>
> - Video Capture: [`docs/heroes/media/event-dossier_hero_animation.webm`](./media/event-dossier_hero_animation.webm)
> - Animated GIF: [`docs/heroes/media/event-dossier_hero_animation.gif`](./media/event-dossier_hero_animation.gif)
> - Rest Frame: [`docs/heroes/media/event-dossier_hero_rest.png`](./media/event-dossier_hero_rest.png)
> - Mid-Scroll Light Table: [`docs/heroes/media/event-dossier_hero_mid.png`](./media/event-dossier_hero_mid.png)
> - Vault Door Reveal: [`docs/heroes/media/event-dossier_hero_reveal.png`](./media/event-dossier_hero_reveal.png)

---

## 1. Creative Intent & Editorial Architecture

### 1.1 The Curse of the Monolithic Photo Grid

Standard collegiate event recap pages are static, predictable, and cluttered:

- Giant identical 3-column photo grids where every image has the same 16:9 aspect ratio and rounded card border.
- The same hero image seen on every page visit, making repeat visits feel stale.
- Cumbersome pagination or slow external Google Drive links.

### 1.2 The Solution: The Curated Sunlit Dossier

Every celebration hosted by OSU Tamil Sangam yields hundreds of high-resolution memories. The Event Dossier treats the event page as an **editorial art magazine / analog light table**:

1. **Never the Same Spread Twice:** Every page load serves a fresh, randomized slice of 5 to 8 candid photos computed server-side via the Fisher-Yates shuffle algorithm.
2. **Zero-Card Philosophy:** Photos are scattered across asymmetric vertical parallax tracks with sharp 0px corners, zero dropshadows, and zero card borders—floating naturally on a Warm Ivory (`#FAF9F6`) field.
3. **Cinematic Typographic Cascade:** The event title emerges through a letterpress cascade splitting both Latin and Tamil script into true grapheme clusters.
4. **The Magnetic Vault Door:** Rather than hiding full photo albums, a massive magnetic proximity door invites the visitor directly into the full 300+ photo Google Photos Vault.

---

## 2. Server-Side Randomizer Architecture

```text
[HTTP REQUEST: GET /events/berry-cute-picnic]
  │ Next.js Server Component (export const dynamic = "force-dynamic")
  ▼
[DIRECTORY SCAN: public/events/${slug}]
  │ Scans local file pool; filters [.jpg, .jpeg, .png, .webp, .avif]
  ▼
[FISHER-YATES SHUFFLE ALGORITHM]
  │ Shuffles photo array in O(n) server-side execution
  ▼
[SLICE SELECTION: 5 to 8 Photos]
  │ Slices curated subset and embeds directly into Server Component HTML payload
  ▼
[CLIENT HYDRATION: Zero CLS, Zero API Latency, Instant First Paint]
```

### 2.1 The Fisher-Yates Server Engine

Executed exclusively on the server before transmitting HTML:

```typescript
function getShuffledSlice(photos: string[], min = 5, max = 8): string[] {
  const pool = [...photos];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const count = Math.min(pool.length, Math.floor(Math.random() * (max - min + 1)) + min);
  return pool.slice(0, count);
}
```

---

## 3. ReactBits Kinematics Engineering

### 3.1 SplitText Letterpress Emergence (`SplitText.tsx`)

- **Grapheme Cluster Segmentation:** Uses `Intl.Segmenter` to prevent splitting Tamil consonant-vowel combinations (*uyirmei*) or pulli diacritics:

  ```typescript
  const segmenter = new Intl.Segmenter(locale === "ta" ? "ta" : "en", { granularity: "grapheme" });
  const clusters = Array.from(segmenter.segment(titleText)).map((s) => s.segment);
  ```

- **Kinematic Stagger:** Letters cascade into position:
  $$y: 40\text{px} \to 0\text{px}, \quad \text{rotateX}: -45^\circ \to 0^\circ, \quad \text{opacity}: 0 \to 1$$
  Staggered by $0.035\text{s}$ per cluster with custom cubic-bezier easing `ease: [0.16, 1, 0.3, 1]`.

### 3.2 ParallaxScatter Light Table (`ParallaxScatter.tsx`)

Photos are distributed across 3 asymmetric tracks with independent vertical scroll velocities:

- Track A (Left): Velocity $-140\text{px}$ offset.
- Track B (Center): Velocity $-260\text{px}$ offset (hero elevation).
- Track C (Right): Velocity $-180\text{px}$ offset.
- **Muttram Safeguards:** `rounded-none`, `shadow-none`, `border-none`, separated by spacious `gap-16 lg:gap-24`.

### 3.3 Magnetic Vault Door Gateway (`VaultGateway.tsx`)

- **Proximity Sensor:** Continuously monitors pointer distance $d = \sqrt{(x - x_{\text{btn}})^2 + (y - y_{\text{btn}})^2}$.
- **Underdamped Magnetic Spring ($k = 150, c = 15$):** When $d \le 220\text{px}$, the text physically pulls up to $24\text{px}$ toward the cursor.
- **Color Transition:** Dynamically shifts from Charcoal Ink (`#2A2825`) to Terracotta Earth (`#B85C38`).

---

## 4. Performance & Accessibility Guarantees

- **Cumulative Layout Shift (CLS):** Strictly $\text{CLS} = 0.000$ achieved by setting explicit aspect ratios on all randomized image containers.
- **Accessible External Anchor:** The Vault Door gateway is implemented as a semantic `<a target="_blank" rel="noopener noreferrer">` with descriptive `aria-label`.
