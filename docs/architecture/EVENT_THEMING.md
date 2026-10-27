# Flagship Event Theming Engine & Seasonal Swap Protocol

The OSU Tamil Sangam homepage features an editorial, interactive art installation inspired by the open, sunlit **Muttram (முற்றம்)** courtyard philosophy. The flagship gathering spotlight is powered by the WebGL/Canvas **DitherVeil** shader component from ReactBits and a strongly-typed decoupled configuration layer at `config/upcomingEvent.ts` (and `src/config/upcomingEvent.ts`).

---

## Architecture Overview

1. **Decoupled Configuration (`config/upcomingEvent.ts`)**:
   - Holds all event metadata, telemetry, and shader aesthetic parameters (`FlagshipEventConfig`).
   - Serves as the single source of truth across all breakpoints.

2. **DitherVeil Shader Component (`src/components/ui/DitherVeil.tsx`)**:
   - Implements Bayer 8x8 matrix ordered dithering with time-based turbulence and interactive cursor proximity unmasking.
   - Operates with zero card bounding boxes, zero box-shadows, and zero border radius directly on the page background (`#FAF9F6` / `#F4EFE6`).
   - Automatically pauses rendering when out of viewport via `IntersectionObserver` and throttles device pixel ratio to max 2.

3. **Asymmetric Editorial Layout (`src/components/home/NextFlagshipGathering.tsx`)**:
   - **Cols 1–5 (Left)**: The Dithered Installation canvas with pinned monospace metadata (`THEME_ID // ARCHIVE_2026.10`).
   - **Cols 6–12 (Right)**: Editorial Dossier including seasonal teaser quote, massive serif title (`text-5xl lg:text-7xl`), low-opacity Tamil script subheader, narrative essay, 1px grounding line telemetry ledger, and magnetic call-to-action link.

---

## The Effortless Seasonal Swap Protocol

To update the flagship gathering for a new season or event (e.g., transitioning from Halloween's *Kollywood Kollai* to January's *Thai Pongal Thiruvizha*):

### Step 1: Add High-Contrast Silhouette Asset

Place a transparent PNG or SVG silhouette of the seasonal motif into the `public/images/themes/` directory:

```bash
public/images/themes/pongal-pot.png
```

*Tip: High-contrast silhouettes with clear negative space produce the most striking Bayer dithering patterns.*

### Step 2: Update `config/upcomingEvent.ts`

Modify the `activeUpcomingEvent` export with the new event parameters:

```typescript
export const activeUpcomingEvent: FlagshipEventConfig = {
  id: "thai-pongal-2027",
  seasonKey: "pongal",
  title: "Thai Pongal Thiruvizha",
  tamilTitle: "தை பொங்கல் திருவிழா",
  teaserQuote: "Clay pots simmer with sweet jaggery as the winter sun turns north. Celebrate the harvest and kinship on the Olentangy.",
  description: "A community harvest festival featuring sugarcane pressing, traditional kolam competitions, live parai drumming, and piping hot sakkarai pongal shared among students and alumni.",
  telemetry: {
    date: "JANUARY 16, 2027",
    time: "11:00 AM – 3:00 PM EST",
    location: "OHIO UNION // ARCHIE GRIFFIN BALLROOM",
    doorsOpen: "10:30 AM",
    admission: "FREE FOR ALL BUCKEYES // ZERO DUES"
  },
  visual: {
    silhouetteSrc: "/images/themes/pongal-pot.png",
    altText: "Overflowing earthen Pongal pot silhouette",
    aspectRatio: "portrait",
    dither: {
      veilColor: "#E5A93C",      // Turmeric Gold
      shadowColor: "#1A1715",    // Deep Espresso
      matrixSize: 8,
      grainScale: 2.5,
      noiseIntensity: 0.4,
      interactive: true
    }
  },
  action: {
    label: "Step Into the Courtyard",
    tamilLabel: "விழாவில் இணையுங்கள்",
    href: "/events/thai-pongal-2027",
    external: false
  }
};
```

### Step 3: Verify & Deploy

Save the file. Hot module reloading updates the entire homepage instantly across desktop and mobile breakpoints with zero UI regressions, zero manual CSS edits, and zero layout adjustments.

---

## Seasonal Color Palettes Reference

| Season / Event | Season Key | Veil Color | Shadow Color | Mood / Motif |
| :--- | :--- | :--- | :--- | :--- |
| **Halloween** | `halloween` | `#B85C38` (Terracotta) | `#1A1715` (Deep Espresso) | Jack-o'-lantern, cinematic noir |
| **Pongal** | `pongal` | `#E5A93C` (Turmeric Gold) | `#1A1715` (Deep Espresso) | Earthen pot, harvest golden hour |
| **Diwali / Karthigai** | `diwali` | `#E06D28` (Warm Flame) | `#12100E` (Charcoal Smoke) | Agal vilakku clay lamp |
| **Winter Gala** | `custom` | `#2F5233` (Deep Leaf / Pine)| `#151B16` (Forest Night) | Winter solstice evergreen |
| **Spring Vizha / Chithirai** | `spring` | `#D9534F` (Kumkum Red) | `#2A1B1D` (Rosewood Shadow) | Mango leaves, jasmine blossoms |
