---
name: tailwind-oklch-tokens
description: >-
  Configures and builds modern, CSS-first Tailwind v4 design token architectures using the perceptually uniform OKLCH color space.
  Use when defining color systems, theme variables, gradient mathematics, typography scales, or refactoring CSS.
---

# Tailwind v4 & OKLCH 3-Tier Design Token Skill

This skill guides the agent in implementing CSS-first design systems with Tailwind v4, utilizing the W3C Design Tokens Community Group (DTCG) specification and the perceptually uniform OKLCH color space.

---

## 1. The Tailwind v4 CSS-First Paradigm

In Tailwind v4, configuration shifts from JavaScript (`tailwind.config.js`) to native CSS variables defined inside `@theme` blocks:

```css
@import "tailwindcss";

@theme {
  /* Primitive Scale */
  --color-gold-400: oklch(0.85 0.16 85);
  --color-gold-500: oklch(0.78 0.18 80);
  --color-crimson-600: oklch(0.55 0.22 28);
  --color-navy-900: oklch(0.18 0.05 260);

  /* Semantic Mappings */
  --color-action-primary: var(--color-gold-500);
  --color-action-hover: var(--color-gold-400);
  --color-surface-base: var(--color-navy-900);
  --color-accent-highlight: var(--color-crimson-600);

  /* Typography */
  --font-serif: "Noto Serif Tamil", "Tiro Tamil", Georgia, serif;
  --font-display: "Fraunces", "Instrument Serif", serif;
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", monospace;
}
```

---

## 2. Why OKLCH Over HSL/RGB

1. **Perceptual Uniformity**: In HSL, changing hue while keeping lightness constant results in drastic perceived brightness shifts (e.g. pure yellow at L=0.5 feels blindingly bright compared to pure blue at L=0.5). In OKLCH, lightness `L=0.7` has mathematically identical perceived luminance across all hues.
2. **Zero Dead Zones**: Gradients in sRGB often pass through a muddy gray midpoint. OKLCH gradients transition smoothly through natural, vibrant color spectra.
3. **P3 Wide Color Gamut**: OKLCH reaches into the Display P3 gamut natively supported by modern Apple, OLED, and Android screens.

---

## 3. The Three-Tier Token Architecture

1. **Primitive Tier**: Raw values. For internal theme definition only. Never use directly in component class lists:
   - `--color-amber-500: oklch(0.78 0.17 65)`
   - `--space-4: 1rem`
2. **Semantic Tier**: Intent mappings. The primary vocabulary for components:
   - `--color-text-primary: var(--color-slate-50)`
   - `--color-text-muted: var(--color-slate-400)`
   - `--color-surface-elevated: var(--color-navy-800)`
   - `--color-border-subtle: oklch(1 0 0 / 0.1)`
3. **Component Tier**: Micro-properties for complex, multi-state widgets:
   - `--button-primary-bg: var(--color-action-primary)`
   - `--card-border-active: var(--color-accent-highlight)`

---

## 4. OKLCH Palette Construction Formula

To build a harmonious, non-homogenized palette for any brand:

| Role | Formula & Parameters | Purpose |
| :--- | :--- | :--- |
| **Primary (Anchor)** | L: 0.50–0.70, C: 0.15–0.22, Hue: Brand base (e.g. 75 for Warm Gold) | Primary CTA buttons, active tabs, brand headers |
| **Secondary** | Hue rotation: Base + 140° to 180° | Visual counterweight, badges, secondary actions |
| **Accent** | Hue rotation: Base + 45° to 60°, C: High (0.22+) | High-attention alerts, focal highlights, notification pings |
| **Tinted Neutral (Dark)** | L: 0.08–0.18, C: 0.015–0.03, Hue: Identical to Primary | Deep backgrounds with warmth; never use pitch-black `#000000` |
| **Tinted Neutral (Light)** | L: 0.88–0.98, C: 0.010–0.02, Hue: Identical to Primary | Crisp headings and text; never use flat harsh white |
