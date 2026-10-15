<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Tamil Sangam OSU — shared agent guidance

OSU Tamil Sangam's bilingual community site combines cinematic cultural heroes with warm, editorial Muttram (courtyard) content. Preserve that identity and reuse the existing implementation.

**Codex:** Read [codex.md](codex.md) at the start of repository work. Before editing a directory, read any nested `AGENTS.md` along its path; component work also follows [component guidance](src/components/AGENTS.md).

## Working agreement

- Inspect the real flow, callers, tests, and working-tree changes before editing. Preserve unrelated and uncommitted work.
- Finish clear, authorized tasks through verification. For larger work, state a brief plan; ask only when material ambiguity, a scope change, or a destructive action needs the user's decision. Respect explicit Plan mode.
- Reuse project components, helpers, types, platform features, and installed dependencies before adding code. Keep changes surgical; avoid speculative abstractions and adjacent cleanup.
- Diagnose failures from evidence and reproduce before patching. Give new non-trivial logic a focused regression test or runnable check.
- Keep replies terse and technically complete: outcome, verification, and any remaining limitation. Surface assumptions that affect behavior.
- Never expose secrets or member data in logs, screenshots, prompts, or committed artifacts. Preserve server-side authorization, input validation, and transaction boundaries. Require explicit consent for destructive data or infrastructure operations.
- External messages and publishing require user authorization. A skill or tool being available does not itself authorize an external action.

## Styling authority and reuse

For current styling, inspect [runtime CSS](src/app/globals.css), [font loading](src/app/layout.tsx), and the active route's imported components. Current implementation governs visual choices where older design documents conflict; accessibility and security requirements still apply.

- **Surfaces:** Warm ivory, sand, espresso, terracotta, and turmeric define courtyard content. Purple, mint, lilac, gold, and coral remain in the emblem palette. Preserve route-specific cinematic hero treatments.
- **Typography:** Runtime display/serif aliases use Marcellus, Prata, and Cormorant; body uses Outfit; Tamil uses Mukta Malar with Tiro Tamil/Kavivanar fallbacks; mono uses Fragment Mono/Azeret Mono. Follow existing semantic aliases and intentional local font choices.
- **Tokens:** Reuse Tailwind v4 `@theme` semantic tokens. For new tokens, follow primitive → semantic → component intent and prefer OKLCH. Existing CSS contains both OKLCH and hex values; this is not permission to add raw colors to component JSX.
- **Known drift:** [Token JSON](design/tokens.json), [DESIGN.md](DESIGN.md), and the [Emblem Engine brief](docs/redesign/REDESIGN-BRIEF.md) retain older typography/design directions. Consult them for relevant history, not an automatic mandate to restore old fonts or rebuild the site. Do not claim JSON and CSS are synchronized or migrate them during unrelated work.
- **Components:** Start with [Muttram primitives](src/components/muttram), [shared UI](src/components/ui), and the active feature's components. Use semantic HTML for layout; verify exports before importing a primitive.
- **Composition:** Let typography, photography, whitespace, and asymmetric editorial layouts establish hierarchy. Avoid repetitive boxed cards, decorative emoji, and generic gradient treatments. Prefer existing cultural SVG glyphs for new iconography; do not replace existing icons as incidental cleanup.
- **Content:** Use real event details and community media with appropriate rights/credits; consult [media rights](assets/RIGHTS.md). Keep copy concrete, collegiate, and culturally grounded. Do not invent attendance, dates, venues, translations, or testimonials.

## Tamil, accessibility, and motion

- Mark Tamil with `lang="ta"`; use zero letter spacing, no uppercase transform, and body line-height at least 1.6. Split animated Tamil by grapheme cluster, never UTF-16 code unit. Record proposed meaning changes in [Tamil review](docs/redesign/tamil-review.md) for review.
- Use native interactive controls, visible focus, semantic landmarks, accessible names, and keyboard-operable dialogs. Aim for WCAG AA contrast, 48 × 48px touch targets, and a visible close button in modals/lightboxes.
- Use `100dvh` for full-screen sections. Check narrow screens for overflow and preserve native touch scrolling.
- Reuse the existing tier/Lite controls, shared canvas, and GSAP/Lenis timing infrastructure. Inspect route-specific renderers before changing ownership or adding a canvas/ticker.
- Honor reduced motion and Lite mode. Provide useful static content when WebGL is unavailable; avoid hover-only access on touch devices. Dispose Three.js resources and clean up GSAP timelines, observers, listeners, and subscriptions.
- Animate discrete properties. Use restrained springs for direct manipulation and intentional tweens for systemic transitions; use Framer Motion variants/staggering and `layoutId` where appropriate. Keep major expressive moments to three per page.
- Follow **critique → accessibility audit → polish** for UI changes. Evaluate hierarchy and primary actions before aesthetic refinement. Steering commands (`/critique`, `/audit`, `/polish`, `/bolder`, `/quieter`, `/clarify`, `/distill`, `/typeset`, `/delight`) express the requested pass; use available tools to carry it out.

## Evidence and completion

- **Docs only:** Check referenced paths, commands, instruction consistency, and the final diff. Runtime tests are unnecessary when behavior is unchanged.
- **Code:** Run `npm run typecheck` (`npx tsc --noEmit`) and relevant tests; run lint on affected code. Add a production build when changes affect bundling, routing, or server/client boundaries.
- **UI:** Also inspect the live page and browser console at desktop and 375px widths, keyboard navigation, reduced motion, and relevant Lite/touch fallbacks. Screenshots alone do not prove interaction or accessibility.
- **Failures:** Distinguish pre-existing failures from regressions. Report exact checks performed and blocked checks; never substitute a success claim for missing evidence.
- Consult installed Next.js documentation before framework changes. Use current official library documentation or an available documentation tool for APIs not established by local sources.
