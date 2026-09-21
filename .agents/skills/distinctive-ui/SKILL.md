---
name: distinctive-ui
description: >-
  Designs and builds non-generic, culturally grounded, and distinctively unique user interfaces.
  Applies the five-phase agentic design workflow, enforces the anti-homogenization Slop Checklist,
  and executes Impeccable steering commands (/bolder, /quieter, /clarify, /distill, /typeset, /delight, /critique, /audit).
  Use whenever creating or redesigning components, pages, design systems, or evaluating visual hierarchy.
---

# Distinctive UI Architecture & Impeccable Design Skill

This skill guides the agent in breaking out of the default "AI UI Starter Pack" (Inter, purple gradients, generic nested cards, pure black, low contrast) and building interfaces with high visual distinction, cultural grounding, and rigorous usability.

---

## 1. The Slop Checklist (Negative Constraints)

Before writing any UI code, review your proposed markup against this checklist. If any pattern matches, refactor immediately:

1. **Font Choice**: Are display headings using Inter, Roboto, or standard system fonts?
   - *Fix*: Select an expressive, characterful typeface matching the product voice (e.g. Fraunces, Outfit, Cabinet Grotesk, Instrument Serif, or Noto Serif Tamil).
2. **Gradients**: Are you using `from-indigo-500 to-purple-600` or generic blue-purple fades?
   - *Fix*: Use curated, perceptually uniform OKLCH color pairs with meaningful temperature and contrast (e.g. amber-to-crimson, deep navy-to-emerald).
3. **Card Fatigue**: Is every piece of content wrapped in an identical `rounded-2xl border p-6 shadow-md` box?
   - *Fix*: Introduce asymmetric layouts, full-bleed backgrounds, split-column rails, editorial typographic lists, and varying spatial densities.
4. **Neutrals**: Is text or background using pure black (`#000000`) or flat neutral gray?
   - *Fix*: Use tinted neutrals biased with a hint of warm gold or cool navy.
5. **Decorative Emojis**: Are emojis used as section headers or list item bullets?
   - *Fix*: Replace with bespoke SVG icons, micro-badges, or typographic numbering.
6. **Icons Over Headings**: Is an oversized rounded square icon centered uniformly above every title?
   - *Fix*: Integrate icons inline with title lockups, use subtle badges, or let typography lead.

---

## 2. The Novelty Budget Execution

Always categorize UI elements before deciding their degree of originality:

- **Safety Layer (0% Novelty)**:
  - Navigation menus, search fields, close buttons, modal dismissals, form inputs, accessibility focus rings.
  - *Rule*: Never force the user to guess how basic inputs or navigation works. Adhere strictly to Jakob's Law.
- **Product Layer (30% Novelty)**:
  - Layout structure, content filtering, multi-pane workspaces, timeline sequences, film strips.
  - *Rule*: Innovate layout only when it clarifies content hierarchy and reduces cognitive load.
- **Expression Layer (100% Novelty)**:
  - Typography scale, OKLCH color relationships, custom cursor feedback, ambient lighting shaders, motion choreography, photography treatment.
  - *Rule*: Maximize personality, brand voice, and emotional resonance.

---

## 3. Impeccable Steering Commands

When the user gives a steering command, execute the specific design adjustments:

### `/bolder`
- Increase scale contrast between headings and body (e.g., from `text-2xl` to `text-5xl sm:text-6xl`).
- Deepen color saturation on primary focal points; boost OKLCH chroma.
- Add confident border accents or high-contrast backdrops.
- Remove timid, washed-out intermediate gray text.

### `/quieter`
- Reduce visual clutter: drop unnecessary borders, badges, or outer card strokes.
- Increase padding and whitespace around elements (`p-6` -> `p-10`).
- Convert high-contrast secondary items into subtle, low-chroma tinted neutrals.
- Simplify background layers down to a single clean backdrop.

### `/clarify`
- Critique visual hierarchy: identify the single most important action on the screen and ensure nothing competes with it.
- Re-order elements so user eye flow follows a natural F-pattern or Z-pattern.
- Add clear typographic labels to ambiguous icon-only buttons.
- Group related fields with distinct visual chunks.

### `/distill`
- Eliminate redundant wrapper boxes: replace card-in-card nesting with flat rule dividers (`border-b border-white/10`).
- Strip unnecessary decorative illustrations or background blobs that do not convey information.
- Condense verbose UI copy into crisp, active verbs.

### `/typeset`
- Establish a strict modular scale (e.g., 1.25 Major Third or 1.333 Perfect Fourth).
- Enforce optical kerning and tracking: tighten uppercase tracking on labels (`tracking-widest`), loosen display headings.
- Set proper line heights: `leading-tight` (1.1–1.2) on display headings, `leading-relaxed` (1.6–1.8) on body text (especially for Indic/Tamil scripts).

### `/delight`
- Add physics-based micro-interactions: magnetic hover pulls on primary CTA buttons.
- Implement audio-reactive or cursor-reactive ambient feedback.
- Introduce delicate hover state transitions using spring physics.

### `/critique`
- Provide a structured critique analyzing:
  1. Primary visual focal point (What draws the eye first?).
  2. Typographic hierarchy (Is the scale distinct?).
  3. Accessibility contrast (Are all text elements WCAG AA compliant?).
  4. Slop indicators (Any generic AI patterns present?).

### `/audit`
- Test keyboard navigation (Tab order, focus-visible outlines).
- Verify dark/light mode contrast across all color states.
- Ensure all interactive elements use native semantic tags (`<button>`, `<a>`, `<input>`).
- Confirm `prefers-reduced-motion` fallbacks exist for all animated scenes.
