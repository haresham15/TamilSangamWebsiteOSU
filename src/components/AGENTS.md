# Component-Scoped AGENTS.md — Design System Primitives & Cultural Components

This directory houses the foundational visual primitives and cultural engines for Tamil Sangam OSU.

## 1. Protected Primitives

- Do NOT modify or refactor existing cultural components (`DynamicKolamHero.tsx`, `AlphabetConstellation.tsx`, `KuralViewer.tsx`, `GlowingKolamField.tsx`) without invoking `/critique` first.
- Procedural math (Kolam loop mathematics, constellation orbital physics, Tholkappiyam landscape state engine) is scientifically and culturally calibrated. Preserve mathematical invariants.

## 2. Token Discipline

- Never insert raw hex colors, `rgb()`, or `hsl()` in component JSX.
- Every color, shadow, and border must resolve via the semantic Tailwind `@theme` tokens (`bg-sangam-purple`, `text-sangam-cream`, `border-sangam-mint`, etc.).

## 3. Strict Semantic HTML

- All interactive controls must be native `<button>`, `<a>`, or `<input>`.
- Do NOT introduce unstyled generic wrappers (`<div onClick={...}>`).
- Use `layoutId` for morphing between compact and expanded states.
