<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# The Architecture of Distinctive Interfaces: Core Agentic Governance

This project enforces disciplined, agentic design engineering to eradicate AI-generated homogenization ("AI Slop" / "AI UI Starter Pack"). All autonomous coding agents (Antigravity, Cursor, Claude Code, Windsurf) operating in this codebase MUST adhere strictly to the rules, novelty budgets, token architectures, and steering commands outlined below.

---

## 1. The Epistemology of Homogenization: Strict Anti-Slop Constraints

Generative LLMs default to the statistical median of their training data, producing predictable, homogenized interfaces. You are strictly forbidden from outputting the following anti-patterns:

- ❌ **Banned Typography**: Never default to unstyled `Inter`, `Roboto`, `Arial`, or generic system sans-serif. All display headings MUST use **Clash Display** (`var(--font-display)`). All body text, captions, and Tamil typography MUST use **Mukta Malar** (`var(--font-body)` / `var(--font-tamil)`).
- ❌ **Banned Colors**: Never use pure black (`#000000`, `rgb(0,0,0)`), flat `#FFFFFF` backgrounds, un-tinted dead grays, or default purple-to-indigo Tailwind gradients (`from-indigo-500 to-purple-600`). All colors must be perceptually uniform OKLCH rooted in Kanchipuram silk and Dravidian temple architecture.
- ❌ **Banned Components**: Never wrap every element inside identical `p-6 rounded-2xl border border-gray-200 shadow-md` cards with 0.1 opacity black drop shadows. Vary container density, utilize split-rails, full-bleed backgrounds, and asymmetric editorial grids.
- ❌ **Banned Motion**: Never use generic `transition: all 0.3s ease` or `transition-all duration-300`. Animate discrete properties with intentional spring physics or custom cubic-bezier tweens.
- ❌ **Centered Icons**: Never center an oversized rounded-rectangle icon uniformly above section headings. Let typography lead or integrate icons directly into horizontal inline lockups.
- ❌ **Decorative Emojis**: Never use decorative emojis (🚀, 💡, ⚡, 🎉, 🎟️, 💬, 💃) as primary section tags, badge decorators, or list bullets. Use bespoke SVG glyphs, typographic numbering, or authentic cultural motifs.

---

## 2. The Novelty Budget (Reconciling Jakob's Law with Creative Expression)

Do not reinvent standard behavior. Originality must be applied deliberately across three distinct layers:

| Layer | Scope | Tolerance for Novelty | Agentic Prompting Strategy |
| :--- | :--- | :--- | :--- |
| **The Safety Layer** | Navigation, search inputs, modal close buttons, form controls, accessibility focus rings, keyboard tabs | **0% (Minimal)** | Strictly adhere to established mental models. Do not reinvent standard input behaviors, form focus states, or keyboard navigation. |
| **The Product Layer** | Content layout, workspace hierarchy, data visualization, filtering, tabs, timelines | **30% (Moderate)** | Innovate layout rhythms (split rails, asymmetric grids, film strips) only when it clarifies content hierarchy and reduces cognitive load. |
| **The Expression Layer** | Typography, OKLCH palette, motion choreography, shaders, photography, brand voice | **100% (Maximum)** | Push stylistic boundaries boldly. Apply tailored font pairings, rich micro-interactions, atmospheric lighting, and bespoke visual assets. |

---

## 3. The Five-Phase Agentic Workflow

When designing and generating user interfaces:

1. **Phase 1: Text-Based Creative Planning**: Establish layout rhythms, brand voice, and spatial hierarchy in natural language before touching markup.
2. **Phase 2: Visual Exploration**: Anchor visual directions using moodboards, cultural motifs, or diffusion models rather than defaulting to standard CSS frameworks.
3. **Phase 3: Deterministic Token Extraction**: Codify exact OKLCH values, typography pairings, and spacing scales into [`DESIGN.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/DESIGN.md) and Tailwind CSS `@theme` variables before writing UI components.
4. **Phase 4: Explicit Specification & Negative Constraints**: Enforce the Slop Checklist; explicitly forbid generic defaults in every generation turn.
5. **Phase 5: Intentional Motion Engineering**: Sequence animations with parent variants (`staggerChildren`), use `layoutId` for shared-element morphs, and reserve spring physics for direct user interaction.

---

## 4. The "Impeccable" Steering Command Suite

All agents must recognize and execute these chained steering commands during iterative refinement:

- **/bolder**: Amplify visual weight, scale contrasts, and expressive color saturation. Eliminate timidity.
- **/quieter**: Dial down visual noise, strip unnecessary borders/shadows, increase whitespace, and soften contrast on secondary elements.
- **/clarify**: Restructure information hierarchy, make primary actions unmistakable, improve typography scannability.
- **/distill**: Strip non-serving decorative boxes, redundant card borders, and gratuitous wrappers down to essential content.
- **/typeset**: Polish typographic scale, letter-spacing tracking, line-height ratios, and font pairings.
- **/delight**: Implement physics-based micro-interactions, tactile hover feedback, and subtle fluid animations.
- **/critique**: Evaluate visual balance, cognitive load, and hierarchy before aesthetic polish.
- **/audit**: Perform automated checks for WCAG contrast ratios, responsive overflow, keyboard focusability, and reduced-motion fallbacks.

---

## 5. Machine-Readable Governance: Three-Tier W3C Token Architecture & Tailwind v4

All styling in this project is anchored by Tailwind v4 CSS-first `@theme` and the W3C Design Tokens Community Group (DTCG) specification:

1. **Primitive Tier**: Raw values (`--color-gold-500: oklch(0.78 0.18 80)`). Never applied directly in component JSX.
2. **Semantic Tier**: Intent mappings (`--color-action-primary: var(--color-gold-500)`). The primary vocabulary for components.
3. **Component Tier**: Micro-properties (`--button-bg-primary: var(--color-action-primary)`).

### Perceptually Uniform OKLCH Palette

- **Primary**: Brand anchor (L ≈ 0.45–0.65, C ≈ 0.15–0.25).
- **Secondary**: 120°–180° hue rotation from Primary.
- **Accent**: 40°–80° hue rotation for deliberate focal highlights.
- **Neutrals**: Tinted neutrals sharing the primary hue at very low chroma (C ≈ 0.01–0.03).
- **Semantics**: Success, Warning, Error, Info with full 50–950 scales.

---

## 6. Motion Engineering Rules

- **Variants & Staggering**: Always sequence children via parent `variants` with `staggerChildren`. Never calculate manual delay loops.
- **Layout Animations**: Use Framer Motion `layout` and `layoutId` for shared-element morphs and fluid state transitions.
- **Physics Laws**:
  - Direct user manipulation (hover, drag, pull, toggle): Use physics-based **springs** (`stiffness: 300–400, damping: 25–30`).
  - Systemic state transitions (page load, modal mount, tab crossfade): Use time-based **tweens** with custom cubic beziers (`ease: [0.16, 1, 0.3, 1]`).
- **Accessibility**:
  - Always wrap motion components around native semantic elements (`<button>`, `<a>`, `<input>`). Never use interactive un-semantic `<div>`s.
  - Respect `prefers-reduced-motion` unconditionally via `@media (prefers-reduced-motion)` or `useReducedMotion()`.

---

## 7. Autonomous Verification & Defensive Architecture

- **Defensive Components**: Protect runtime stability with React Error Boundaries around experimental or dynamic components.
- **Exhaustive Type Safety**: Use strict TypeScript unions and exhaustive `switch` / `satisfies` checks to prevent silent rendering failures.
- **Verification Loop**: Always run `npx tsc --noEmit` and verify live page renders in the browser before marking tasks complete.

---

## 8. Process Gates (In Order — Do Not Skip Ahead)

1. **/critique**: Structural hierarchy, eye flow, and whether the primary user action is unmistakable.
2. **/audit**: Contrast ratios (WCAG AA/AAA), keyboard focusability, screen-reader semantics, and `prefers-reduced-motion`.
3. **/polish**: Visual refinement, OKLCH chroma balance, and physics micro-interactions.

> **Hard Rule**: A beautiful screen with a broken hierarchy or accessibility failing is a failed screen. `/critique` and `/audit` strictly block `/polish`.

---

## 9. Component Library Whitelist & Hallucination Guardrails

- **Legitimate Project Primitives**:
  - Semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) with Tailwind utilities.
  - Cultural components: `DynamicKolamHero`, `AlphabetConstellation`, `KuralViewer`, `GlowingKolamField`, `TinaiLandscapeSelector`.
  - UI primitives: Semantic buttons (`<button>`), links (`<a>` / Next.js `<Link>`), and form controls.
- ❌ **Forbidden Hallucinated Primitives**: `<Container>`, `<Stack>`, `<Box>`, `<Flex>`, `<GridCard>` — these components do not exist in this codebase.
- **Imports & Boundaries**: Never make relative parent imports (`../../`) into private internal directories from example/demo files.

---

## 10. Project-Specific Identity & Ground Truth

- **Brand Voice**: Reverent, energetic, collegiate, and culturally grounded in classical Tamil civilization (Sangam literature, Dravidian architecture, festive Kanchipuram silk).
- **Display Typography**: **Clash Display** (`var(--font-display)`).
- **Body & Script Typography**: **Mukta Malar** (`var(--font-body)` / `var(--font-tamil)`).
- **Metadata / Monospace**: **JetBrains Mono** (`var(--font-mono)`).
- **Ground Truth Design Tokens**: Codified in [`design/tokens.json`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/design/tokens.json) and mirrored in [`src/app/globals.css`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/globals.css) via `@theme`.
