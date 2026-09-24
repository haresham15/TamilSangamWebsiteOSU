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

- ❌ **Banned Typography**: Never default to unstyled `Inter`, `Roboto`, `Arial`, or generic system sans-serif, and never use cold futuristic/brutalist fonts. All display headings MUST use **Anek Tamil** / **Halant** (`var(--font-display)` / `var(--font-serif)`). All body text, captions, and Tamil typography MUST use **Mukta Malar** (`var(--font-body)` / `var(--font-tamil)`).
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
- **Display Typography**: **Anek Tamil** / **Halant** (`var(--font-display)` / `var(--font-serif)`).
- **Body & Script Typography**: **Mukta Malar** (`var(--font-body)` / `var(--font-tamil)`).
- **Metadata / Monospace**: **JetBrains Mono** (`var(--font-mono)`).
- **Ground Truth Design Tokens**: Codified in [`design/tokens.json`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/design/tokens.json) and mirrored in [`src/app/globals.css`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/globals.css) via `@theme`.

---

## 11. Redesign Rules (Emblem Engine)

- **Source of Truth**: [`docs/redesign/REDESIGN-BRIEF.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/docs/redesign/REDESIGN-BRIEF.md). Read it before any UI work.
- **Next.js 16 APIs**: Read `node_modules/next/dist/docs` before assuming APIs.
- **Iconography**: Never use emoji or a generic stock icon set as UI. All icons are custom SVG in the kolam line style.
- **Typography & Clean UI**: No eyebrow labels, middot chains, or arrow suffixes unless they encode real information.
- **Tamil Typography**: Follow the `tamil-text` skill (`lang="ta"`, `letter-spacing: 0`, no uppercase transforms, grapheme-cluster splitting). Never alter Tamil meaning; log for review.
- **Motion Restraint**: Every animation needs a Lite fallback and must respect `prefers-reduced-motion`. Maximum 3 "wow" moments per page.
- **Disposal**: Dispose everything created in Three.js and GSAP on component unmount.
- **Media**: No stock photography. Real collegiate event media only, with consensual crediting.
- **Verification**: Run `npx tsc --noEmit` and browser visual inspection after visual updates.

---

## 12. Enterprise Context Engineering, Deliberation & Subagent Governance

- **Active RAM Discipline**: Treat the context window as constrained working memory. Apply recursive summarization and retain only the 3–5 most recent tool observations verbatim to eliminate noise and prevent context rot / premature termination.
- **Sequential Thinking MCP**: Enforce structured, stateful deliberation loops via `sequentialthinking` for complex data flows, multi-file refactors, and performance audits. Hypotheses must be systematically formulated and invalidated.
- **Enterprise Semantic Grounding**: Ground cloud architectures in Google Cloud Knowledge Catalog (`LookupContext`) and Vertex AI Search (`groundingChunks` / `groundingSupports`). Map transport layers appropriately (`stdio` for local tools, `Streamable HTTP` for managed cloud services).
- **Defensive Safeguards**: The `accidental-data-loss-prevention` skill strictly gates all destructive SQL (`DROP`, `TRUNCATE`, unbounded `DELETE`) and cloud infrastructure annihilation commands (`gcloud projects delete`, `gsutil rm`). Require explicit human consent.
- **Autonomous Subagent Roster**:
  - `enterprise-data-architect`: Manages BigQuery, dbt, Dataform, and Dataflow pipelines.
  - `enterprise-security-auditor`: Executes pre-ship security reviews, cost efficiency audits, and GCS posture assessments.
  - `design-architect` & `ui-engineer`: Drives the 5-phase design workflow with DTCG token fidelity.
  - `motion-engineer`: Orchestrates hardware-accelerated Framer Motion variants and GSAP timelines.
  - `critique-agent` & `a11y-auditor`: Enforces strict WCAG AA/AAA compliance and anti-slop verification.

---

## 13. Cinematic Sangam Architecture: 3D WebGL, GSAP Scroll-Jacking & Mobile Degradation

All agents operating in this codebase MUST adhere strictly to the following 3D abstraction, motion choreography, and graceful degradation directives:

### The Three Core Concepts

1. **The "Digital Kolam" Particle Vortex & Mask Reveal (Hero)**:
   - **Visual Language**: Traditional pulli (dot) Kolam rendered as a 3D, physics-driven particle simulation via React Three Fiber.
   - **The Text Mask Scale**: Loaded behind a massive, bold inline SVG clip-path reading `TAMIL SANGAM`. As the user scrolls, GSAP ScrollTrigger scales the text mask aggressively (~10,000% / scale: 50+) with `transformOrigin` pinned so the negative space of a specific letter (such as 'A') swallows the viewport.
   - **The Vortex Plunge**: Once the text scale passes the camera, the user plunges into the full-screen 3D particle vortex, which morphs from a 2D Kolam into a 3D topographic terrain before dissipating to reveal subsequent content.

2. **The "Kanchipuram Silk" Fluid Hover Reveals (Pillars)**:
   - **Visual Language**: Iridescent, metallic Kanchipuram silk ripples in dark space using WebGL fluid math.
   - **Kinetic Typography & Cursor Unmasking**: Large bilingual kinetic typography (`DANCE` / `நடனம்`, `MUSIC` / `இசை`, `COMMUNITY` / `சமூகம்`). On cursor hover, high-octane color-graded video clips dynamically unmask via expanding circular clip-paths (`clip-path: circle(...)`) tracking the cursor with GSAP `quickTo` and 3D velocity perspective tilt (`perspective(1000px) rotateX(...) rotateY(...)`).

3. **The "Gopuram" Z-Axis Parallax (About / Mission)**:
   - **Visual Language**: Abstract, tiered fractal geometry inspired by Dravidian temple architecture.
   - **Z-Axis Camera Push**: Vertical scrolling drives camera position along the Z-axis through 5–7 floating dark brushed bronze geometric rings (`metalness: 0.8`, `roughness: 0.2`).
   - **Depth-of-Field DOM Text**: Drei `<Html>` components suspend mission statements between tiers. As the camera flies past each tier, text fades out with depth-of-field blur (`filter: blur(10px)`, `opacity: 0`).

---

### Implementation Architecture (Phases 1–5)

- **Phase 1: Core Engine & Physics Setup**:
  - Smooth scroll orchestration via Lenis (`lerp: 0.05`, `smoothWheel: true`).
  - Single persistent background `<Canvas>` with Drei `View` rendering or coordinate-synced overlay passes. Avoid multiple independent canvases.
- **Phase 2: Digital Kolam Hero**:
  - 100dvh pinned section with SVG clip-path mask.
  - Three.js / R3F `Points` mesh with custom vertex turbulence shader (breathing sine-wave offset).
  - GSAP ScrollTrigger timeline pinning the hero section with scrubbed scale.
- **Phase 3: Silk Hover Reveals**:
  - Bilingual kinetic typography container.
  - CSS/SVG expanding circular mask following cursor coordinates with GSAP `quickTo` and velocity tilt.
  - Fallback to InstancedMesh if custom shader fails compilation.
- **Phase 4: Z-Axis Gopuram Scroll**:
  - Drei `useScroll` or ScrollTrigger camera Z mapping (`THREE.MathUtils.lerp`).
  - Tiered bronze rings spaced along negative Z.
  - Drei `<Html>` depth blur on scroll pass.
- **Phase 5: Anti-Slop Safeguards**:
  - **No Flat CSS**: Strictly forbid generic `transform: translateY` for scroll animations; bind all scroll kinematics to Lenis/GSAP ScrollTrigger or R3F `useFrame`.
  - **Asset Optimization**: Video loops must be heavily compressed `.webm` files with zero audio tracks.
  - **Shader Fallback**: If custom vertex shaders encounter WebGL context loss or compile failures, gracefully degrade to `THREE.InstancedMesh` with procedural math.

---

### Phase 6: Mobile Responsiveness & Graceful Degradation (Strict Mandate)

All complex animations MUST include conditional logic for `@media (max-width: 768px)` and `window.matchMedia("(hover: none)")`:

1. **Viewport & Scroll Normalization**:
   - **The `100dvh` Mandate**: Strictly forbidden from using `100vh` for full-screen sections. Exclusively use `100dvh` (Dynamic Viewport Height) to prevent mobile browser toolbar layout thrashing.
   - **Lenis Touch Management**: Set `smoothTouch: false` on touch devices to prevent fighting native iOS/Android momentum scrolling, while keeping GSAP ScrollTrigger synchronized with native scroll.

2. **Hover-to-Touch Conversion (Silk Video Reveals)**:
   - Check `window.matchMedia("(hover: none)")`. On touch devices, disable cursor tracking.
   - Use an `IntersectionObserver` to automatically fade in the background video as each pillar scrolls into the viewport center, adjusting text opacity to preserve high contrast and legibility.

3. **WebGL Performance Scaling (Kolam & Gopuram)**:
   - **Pixel Ratio Throttling**: Cap device pixel ratio to a maximum of 2 (`dpr={[1, 2]}`).
   - **Particle Reduction**: When `isMobile` is detected, reduce particle count by 60% and simplify vertex shader turbulence math.
   - **Visibility Culling**: Implement aggressive frustum culling and pause rendering loops when the canvas is off-screen or the browser tab is hidden (`document.hidden`).

4. **Hero Mask Re-Calculation**:
   - On portrait mobile viewports, provide an adapted SVG clip-path (stacked lockup or emblem) with recalculated `transformOrigin` centered on the largest negative space so the fly-through clears the viewport without clipping edges.

5. **Tap-Friendly UI (Safety Layer)**:
   - **Hitboxes**: Interactive elements (navigation triggers, links, photo albums) must maintain a minimum touch target size of 48px × 48px.
   - **Un-closable Modals**: Any modal or photo lightbox must feature a prominent, fixed top-right Close button (`<button aria-label="Close">`) rather than relying solely on backdrop taps.

---

## 14. Universal Development & AI Engineering Standards

### 1. Agent Persona & Execution Logic

- **Decouple Ideation from Execution**: Never modify code immediately upon receiving an ambiguous or high-level prompt. Always formulate a rigorous, multi-file implementation plan and wait for human architectural approval before modifying source files.
- **Explicit over Implicit**: Strictly ban undocumented abstractions and clever "magic" one-liners. Write self-documenting code, practice strict DRY (Don't Repeat Yourself), and adhere to SOLID principles with small, single-responsibility components.
- **Low-Cardinality Logging**: Structure all error logs using low-cardinality, indexed message templates with dedicated metadata objects (e.g., `logger.error({ err: error, context }, "Order transaction failed")`) rather than unbounded string interpolation.

### 2. AI & Machine Learning Engineering Standards

- **Deterministic Execution**: In all Python, PyTorch, NumPy, and Scikit-Learn pipelines, explicitly set random seeds (`torch.manual_seed(42)`, `np.random.seed(42)`, `random.seed(42)`) to ensure experiments, splits, and embedding vectors are fully reproducible.
- **Defensive Tensor Operations**: Never assume tensor dimensions or batch shapes. Insert explicit assertions (e.g., `assert x.shape == (batch_size, channels, H, W)`) prior to feeding inputs into neural network layers or computer vision transforms.
- **Resource Validation**: Implement device-agnostic execution checks (`torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")`) and call explicit garbage collection (`import gc; gc.collect(); torch.cuda.empty_cache()`) within intensive training or inference loops.

### 3. Full-Stack & Frontend Guardrails

- **The "Anti-Slop" UI Protocol**: Strictly eradicate AI UI Starter Pack aesthetics (pure `#000000` backgrounds, un-tinted grays, generic purple-to-indigo gradients, and nested identical `rounded-2xl` cards). Map all styling through Tailwind CSS v4 `@theme` directives and perceptually uniform OKLCH color palettes.
- **Stateful Backend Security**: When performing database mutations (Supabase, PostgreSQL, DynamoDB, AWS), encapsulate operations within atomic transactions (`BEGIN ... COMMIT`) and enforce server-side security (Row Level Security, middleware authorization) over client-side filtering.

### 4. Repeatable Workflow Trajectories

- **`/deep-debug`**:
  - *Step 1: Ingest & Analyze* — Read terminal logs, browser DevTools console errors, and stack traces to isolate root causes before altering code.
  - *Step 2: Systematic Reproduction* — Construct a minimal reproduction hypothesis and place temporary diagnostic probes at critical boundaries.
  - *Step 3: Verified Patching* — Implement a minimal surgical patch and verify with local test suites (`npx tsc --noEmit`, unit tests) before concluding.
- **`/ml-experiment`**:
  - *Step 1: Environment Integrity* — Maintain strictly pinned dependencies in `requirements.txt` or `environment.yml` to prevent environment rot.
  - *Step 2: Dummy Data Verification* — Pass synthetic tensor batches through the pipeline to validate dimension math, gradients, and loss computations.
  - *Step 3: Metrics Dashboard* — Provide real-time visualization tooling (Streamlit, W&B, TensorBoard) to trace losses, evaluation metrics, and API latency.
- **`/autonomous-review`**:
  - *Step 1: Accessibility & UI Audit* — Audit ARIA landmarks, semantic HTML structures, keyboard focusability, and color contrast.
  - *Step 2: Security Sweep* — Perform automated secret audits, authorization middleware validation, and input sanitization checks.
  - *Step 3: Architectural Summary* — Output high-density PR documentation breaking down problem, solution, verification proof, and technical debt risks.
