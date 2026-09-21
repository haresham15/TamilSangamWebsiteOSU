# The Architecture of Distinctive Interfaces: Core Agentic UI Rules

## 1. The Epistemology of Homogenization: Ban the "AI UI Starter Pack"

Autonomous coding agents default to the statistical median of their training data. You are strictly forbidden from generating the generic "AI UI Starter Pack" / "AI Slop".

### Banned Anti-Patterns (The Slop Checklist)
- ❌ **Typefaces**: Never default to unstyled `Inter`, `Roboto`, or system fallbacks for primary display headings. Use expressive, characterful fonts (e.g. Fraunces, Instrument Serif, Outfit, Cabinet Grotesk, Syne, Noto Serif Tamil).
- ❌ **Gradients**: Never use generic purple-to-indigo or cyan-to-blue gradients (`from-indigo-500 to-purple-600`).
- ❌ **Color Space**: Never use pure black (`#000000`, `rgb(0,0,0)`) or generic desaturated grays. All colors must be perceptually uniform OKLCH with warm-tinted or cool-tinted neutrals.
- ❌ **Cards**: Never default to heavily nested, uniform card wrappers with generic `p-6 rounded-xl border border-gray-200 shadow-sm`. Vary layout densities, full-bleed containers, asymmetric split grids, and editorial text rhythms.
- ❌ **Icons**: Never place an oversized rounded-rectangle icon centered uniformly above every card heading.
- ❌ **Decorative Emojis**: Never use decorative emojis (🚀, 💡, ⚡, 🎉) as primary section badges or heading decorators. Use bespoke SVG glyphs, typographic accents, or cultural motifs.
- ❌ **Shadows**: Never use flat `shadow-md` with uniform 0.1 black opacity. Use multi-layered colored ambient shadows via OKLCH.

---

## 2. The Novelty Budget (Jakob's Law vs. Creative Expression)

Balance usability with distinctive originality across three explicit layers:

| Layer | Scope | Tolerance for Novelty | Agentic Strategy |
| :--- | :--- | :--- | :--- |
| **Safety Layer** | Navigation, search inputs, close buttons, accessibility, error recovery, form inputs | **Minimal** | Strictly adhere to established mental models. Do not reinvent standard input behaviors, form focus states, or keyboard navigation. |
| **Product Layer** | Content layout, workspace hierarchy, data visualization, filtering, tabs | **Moderate** | Innovate layout rhythms (split rails, asymmetric grids, film strips) when it clarifies the content hierarchy. |
| **Expression Layer** | Typography, OKLCH palette, motion choreography, shaders, photography, brand voice | **Maximum** | Push stylistic boundaries boldly. Apply tailored font pairings, rich micro-interactions, atmospheric lighting, and bespoke visual assets. |

---

## 3. The Five-Phase Agentic Workflow

1. **Phase 1: Text-Based Creative Planning**: Decouple ideation from code generation. Negotiate layout rhythms, brand voice, and spatial hierarchy in text before writing markup.
2. **Phase 2: Visual Exploration**: Use reference imagery, cultural motifs, and high-fidelity mental models to anchor the creative vision outside DOM constraints.
3. **Phase 3: Deterministic Token Extraction**: Codify exact color hexes/OKLCH values, modular type scales, and spacing increments into `DESIGN.md` or `@theme` CSS variables before building screens.
4. **Phase 4: Explicit Specification & Negative Prompting**: Enforce the Slop Checklist and explicitly forbid generic defaults.
5. **Phase 5: Intentional Motion Engineering**: Sequence animations with parent variants (`staggerChildren`), use `layoutId` for shared-element morphs, and reserve spring physics for direct user interaction.

---

## 4. The "Impeccable" Steering Command Suite

When iterating on components, you must respond to and execute these steering commands:

- **/bolder**: Ample up contrast, font weights, scale contrasts, and expressive color saturation. Eliminate timidity.
- **/quieter**: Reduce visual noise, dial down borders, simplify background layers, and increase whitespace.
- **/clarify**: Restructure information hierarchy, make primary actions unmistakable, improve typography scannability.
- **/distill**: Strip non-serving decorative boxes, redundant card borders, and gratuitous wrappers down to essential content.
- **/typeset**: Polish typographic scale, letter-spacing tracking, line-height ratios, and font pairings.
- **/delight**: Implement physics-based micro-interactions, audio-reactive feedback, and subtle tactile hover physics.
- **/critique**: Evaluate visual balance, cognitive load, and hierarchy before aesthetic polish.
- **/audit**: Perform automated checks for WCAG contrast ratios, responsive overflow, keyboard focusability, and reduced-motion fallbacks.

---

## 5. Three-Tier W3C Token Architecture & Tailwind v4 OKLCH

All styling must obey a strict three-tier token hierarchy:
1. **Primitive Tier**: Raw values (`--color-amber-500: oklch(0.78 0.17 65)`). Never applied directly in component JSX.
2. **Semantic Tier**: Intent mappings (`--color-action-primary: var(--color-amber-500)`). The primary abstraction layer.
3. **Component Tier**: Micro-properties (`--button-bg-primary: var(--color-action-primary)`).

### OKLCH Palette Structure
- **Primary**: Brand anchor (L ≈ 0.45–0.65, C ≈ 0.15–0.25).
- **Secondary**: 120°–180° hue rotation from Primary.
- **Accent**: 40°–80° hue rotation for deliberate focal highlights.
- **Neutrals**: Tinted neutrals sharing the primary hue at very low chroma (C ≈ 0.01–0.03). Banned from pure neutral gray.
- **Semantics**: Success, Warning, Error, Info with full 50–950 scales.

---

## 6. Motion Engineering Rules

1. **Parent Variants**: Always sequence children via parent `variants` with `staggerChildren` rather than calculating manual delay loops.
2. **Layout Morphs**: Use Framer Motion / Motion `layout` and `layoutId` for seamless cross-component or cross-route transformations.
3. **Physics Rules**:
   - Direct user manipulations (drag, hover, pull, toggle): Use physics-based **springs** (`stiffness`, `damping`).
   - Systemic state transitions (page entrance, tab crossfade, modal open): Use time-based **tweens** with custom cubic beziers.
4. **Accessibility First**:
   - Always wrap motion components around native `<button>`, `<a>`, `<input>` elements. Never turn a `<div>` into an inaccessible interactive button.
   - Respect `prefers-reduced-motion` unconditionally via CSS `@media (prefers-reduced-motion)` or `useReducedMotion()`.
