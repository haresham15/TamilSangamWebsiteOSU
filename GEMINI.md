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
  - Enterprise Data & Cloud: `enterprise-data-architect`
  - Enterprise Security & Verification: `enterprise-security-auditor` -> `autonomous-verifier`
- Never let an execution agent critique its own design homework.

## 4. Context Engineering & Anti-Rot Protocols

- **Working Memory as RAM**: Treat the context window as active working RAM, never a dumping ground for raw logs or entire files.
- **Recursive Compaction**: Condense trajectories into high-density state summaries upon milestone completion.
- **Latest 3–5 Verbatim**: Retain only the 3–5 most recent tool responses verbatim; compress earlier outputs.
- **Selective Line Slicing**: Always inspect targeted line slices (`StartLine`/`EndLine` ≤ 100 lines) rather than dumping large files.
- **Subagent Offloading**: Delegate noisy compilation or test-loop execution to isolated sidecar subagents.

## 5. Structured Sequential Deliberation & Cost Auditing

- **ReAct Interleaving**: Interleave cognitive reasoning traces with concrete actions; ground next steps in observed tool feedback.
- **Sequential Thinking MCP**: For multi-step architectures, refactoring, or algorithmic design, use the `sequential-thinking` server (`sequentialthinking` tool) to track stateful reasoning trees and revise invalidated assumptions.
- **Cost-Efficiency Auditing**: Invoke `cost-efficiency-audit` to eliminate N+1 queries, un-cached API calls, unbounded LLM token usage, and serverless cold starts.

## 6. Defensive Architecture & Enterprise Standards

- **Data Loss Prevention**: The global `accidental-data-loss-prevention` skill strictly halts all un-scoped `DROP`, `TRUNCATE`, `DELETE`, or cloud `rm` commands, requiring affirmative human consent.
- **Resource Attribution**: Mandatory Google Cloud metadata labeling via `enforcing-resource-attribution`.
- **Python Isolation**: Virtual environment confinement via `managing-python-dependencies`.
- **Pairwise LLM-as-a-Judge**: Pre-ship reviews must calibrate for verbosity, position, and comparison bias under the Bradley-Terry model.
- **Columbus Enterprise Alignment**: Adhere to Fortune 500 zero-trust security postures and recruiter-ready case study documentation (`portfolio-documentation`).

