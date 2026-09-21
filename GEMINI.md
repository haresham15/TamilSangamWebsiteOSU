# GEMINI.md — Antigravity Project Directives

This file sets project-specific runtime behavior for the Antigravity agent in `TamilSangamWebsiteOSU`.

## 1. Autonomous Verification Loop (Non-Negotiable)

- **Zero Hallucinated Renders**: After modifying or creating visual components, never assume the code works based on syntax alone.
- **Verification Stack**:
  1. Compile Check: Run `npx tsc --noEmit` to verify type integrity.
  2. Live DOM/Visual Inspection: Use `chrome-devtools-mcp` or Antigravity's browser tools to inspect computed styles, check console logs for React errors, and verify layout rendering.
  3. Responsive Auditing: Check both desktop (1440px) and mobile viewport (375px) renders.

## 2. Design Engineering Ground Truth

- **Design Tokens**: Read and follow [`design/tokens.json`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/design/tokens.json) and [`DESIGN.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/DESIGN.md).
- **Never Inline Magic Numbers**: Never hardcode hex codes or arbitrary pixel margins (`px-[37px]`). All colors must map to the semantic OKLCH palette defined in `globals.css` `@theme`.
- **Anti-Slop Enforcement**: Invoke the `slop-checklist` skill before declaring any UI screen complete. Failures must be corrected immediately.

## 3. Subagent Orchestration

- Follow the orchestration pipeline defined in [`.agents/AGENTS.md`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/.agents/AGENTS.md):
  - Phase 1–3: `design-architect`
  - Phase 4: `ui-engineer`
  - Phase 5: `motion-engineer`
  - Review: `critique-agent` -> `a11y-auditor`
- Never let an execution agent critique its own design homework.
