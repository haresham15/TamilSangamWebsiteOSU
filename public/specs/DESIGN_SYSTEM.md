# DESIGN_SYSTEM.md — The "Muttram" (Courtyard / முற்றம்) Design System
**Target Engine:** Next.js 16, React Three Fiber (R3F v9), Tailwind CSS v4, GSAP  
**Architectural Archetype:** The Sunlit South Indian Courtyard (திண்ணை / முற்றம்)  
**Standard Compliance:** W3C DTCG Three-Tier Tokens, OKLCH Perceptually Uniform Palette, WCAG 2.1 AAA Contrast  

---

## 1. System Foundation & Philosophy: The Open Courtyard

The **Muttram (முற்றம்)** is the traditional central, open-sky, sunlit courtyard of a South Indian ancestral home. Surrounded by wooden pillars and stone thinnai verandas, it is a space of congregation, natural daylight, soft breezes, shared filter coffee, and celebration.

### Fundamental Laws of the Muttram Architecture
1. **Light & Air Over Enclosure**: Abolish pitch-black matrices (`#050201`), hostile cyberpunk terminals, and heavy grids. Surfaces are washed with Warm Ivory (`#FAF9F6`) and Sunbaked Sand (`#F4EFE6`).
2. **Negative Space as Structure**: Eliminate strict 1px dividing lines (`divide-y`, `border-b border-white/10`). Sections are separated by generous, organic negative space (`py-24`, `py-32`).
3. **Conversational Warmth**: Interfaces speak like a welcoming elder or student host inviting a guest to sit on the thinnai, not a Unix shell (`TERMINAL PROTOCOL` eradicated; replaced with human warmth: *"Hi there, what is your name?"*).
4. **Organic Flow**: Information flows like the Olentangy river—central snaking timelines, loosely arranged photo collages resting on a sunlit table, and breathable typographic pacing.

---

## 2. DTCG Three-Tier Token Architecture

### Tier 1: Primitive Tokens (Raw OKLCH Values)

```json
{
  "primitive": {
    "color": {
      "warm-ivory": "oklch(0.985 0.005 85)",
      "sunbaked-sand": "oklch(0.955 0.015 75)",
      "charcoal-espresso": "oklch(0.24 0.012 55)",
      "espresso-muted": "oklch(0.45 0.02 55)",
      "turmeric-gold": "oklch(0.76 0.17 78)",
      "turmeric-gold-hover": "oklch(0.70 0.18 75)",
      "terracotta-earth": "oklch(0.54 0.16 38)",
      "terracotta-earth-hover": "oklch(0.48 0.17 38)",
      "jasmine-white": "oklch(0.995 0.002 90)",
      "stone-shadow": "oklch(0.20 0.01 55 / 0.06)"
    }
  }
}
```

### Tier 2: Semantic Tokens (Intent Mappings)

```json
{
  "semantic": {
    "color": {
      "surface-canvas": "{primitive.color.warm-ivory}",
      "surface-card": "{primitive.color.jasmine-white}",
      "surface-sand": "{primitive.color.sunbaked-sand}",
      "text-primary": "{primitive.color.charcoal-espresso}",
      "text-muted": "{primitive.color.espresso-muted}",
      "action-primary": "{primitive.color.turmeric-gold}",
      "action-secondary": "{primitive.color.terracotta-earth}",
      "action-hover": "{primitive.color.turmeric-gold-hover}",
      "border-whisper": "oklch(0.24 0.012 55 / 0.08)",
      "border-focus": "{primitive.color.terracotta-earth}"
    }
  }
}
```

### Tier 3: Component Tokens (Property Mapping)

```json
{
  "component": {
    "button": {
      "primary": {
        "bg": "var(--color-turmeric-gold)",
        "text": "var(--color-charcoal-espresso)",
        "hover-bg": "var(--color-turmeric-gold-hover)"
      },
      "secondary": {
        "bg": "var(--color-terracotta-earth)",
        "text": "var(--color-warm-ivory)",
        "hover-bg": "var(--color-terracotta-earth-hover)"
      }
    },
    "guestbook": {
      "underline": "var(--color-terracotta-earth)",
      "text": "var(--color-charcoal-espresso)",
      "prompt": "var(--color-terracotta-earth)"
    },
    "timeline": {
      "river-stroke": "var(--color-turmeric-gold)",
      "stone-node": "var(--color-terracotta-earth)"
    }
  }
}
```

---

## 3. Typography Hierarchy: Elegant Serifs & Airy Modern Sans

| Role | Font Family | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Display Headings** | Halant / Marcellus / Prata / Anek Tamil | `font-serif` | Massive section titles, quotes, event names. Colored in deep Charcoal/Espresso (`#2A2825`). |
| **Tamil Display & Script** | Mukta Malar / Noto Serif Tamil | `font-tamil` | Classical Tamil stanzas, bilingual titles, cultural vocabulary. |
| **Body & UI Elements** | Outfit / Inter / Modern Sans | `font-sans` | Explanations, Q&A answers, form inputs, metadata. Styled with `leading-relaxed` or `leading-loose`. |
| **Eyebrows & Dates** | Modern Sans (Small Caps / Soft Tracking) | `font-sans tracking-widest text-xs uppercase` | Dates, categories, subtle metadata. **Never aggressive terminal monospace.** |

---

## 4. Elevation, Shadow & Softness

- **Soft Organic Radius**: Cards and images utilize `rounded-2xl` or `rounded-3xl` for a soft, tactile feel.
- **Ambient Sunlit Shadows**:
  - `shadow-sm`: `0 2px 8px -1px oklch(0.24 0.012 55 / 0.04)`
  - `shadow-md`: `0 8px 24px -4px oklch(0.24 0.012 55 / 0.07)`
  - `shadow-xl`: `0 20px 40px -8px oklch(0.24 0.012 55 / 0.08)`
- **Whisper Borders**: When separation is needed, use whisper opacity borders (`border-stone-900/10` or `border-stone-800/5`), never stark 1px solid black or white lines.

---

## 5. Motion & Kinetic Architecture

- **Spring Micro-Interactions**: Direct touch/hover uses physics springs (`stiffness: 300, damping: 25`).
- **Smooth Page Transitions**: GSAP ScrollTrigger and Framer Motion easing (`ease: [0.16, 1, 0.3, 1]`, duration: 0.4s).
- **Reduced Motion**: All animations automatically collapse to immediate fades when `prefers-reduced-motion` is detected.

---

## 6. Anti-Slop Enforcement & Banned Anti-Patterns

1. ❌ **No Pitch Black**: `#000000` and `#050201` are banned on content surfaces.
2. ❌ **No Harsh Neon Greens**: Terminal green (`#00ff66`, `#55CCA2` as button fills) is replaced with Turmeric Gold and Terracotta Earth.
3. ❌ **No Hostile Command-Line Syntax**: Banned strings: `TERMINAL PROTOCOL`, `INTAKE CORE`, `[ PRESS ENTER ↵ ]`, `01 // WHAT IS YOUR NAME`.
4. ❌ **No Rigid 1px Border Boxes**: Banned: enclosing every event and milestone in tight rectangular cages.
5. ❌ **No Aggressive Monospace Body**: Monospace is reserved exclusively for developer tooling if any, never for community members reading festival descriptions.
