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

## 7. Universal Development & AI Engineering Constitution

### 1. Agent Persona & Execution Logic

- **Decouple Ideation from Execution**: The agent must never modify file logic immediately upon receiving a vague prompt. It must first generate a structured implementation plan and wait for human architectural approval before writing code.
- **Explicit over Implicit**: Ban "magic" one-liners and undocumented abstractions. Strive for DRY (Don't Repeat Yourself) code and adhere strictly to SOLID principles, keeping components small, decoupled, and focused.
- **Low-Cardinality Logging**: Mandate that all error handling includes robust, low-cardinality logging with stable message strings (e.g., `logger.error({ err: error }, "Failed to process transaction")`) rather than interpolated strings, ensuring optimal aggregation and debugging in APM tools.

### 2. AI & Machine Learning Engineering Standards

- **Deterministic Execution**: For all Python and AI model scripts, automatically set deterministic random seeds (`torch.manual_seed(42)`, `np.random.seed(42)`, `random.seed(42)`) to ensure model training, dataset partitioning, and vector embeddings are 100% reproducible.
- **Defensive Tensor Operations**: Forbid assuming array or tensor shapes. Write explicit assertions (`assert x.shape == (batch_size, channels, H, W)`) before passing data through computer vision pipelines or neural network layers.
- **Resource Validation**: Include device-agnostic execution checks (`torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")`) and implement memory-clearing garbage collection (`import gc; gc.collect(); torch.cuda.empty_cache()`) within iterative loops to prevent out-of-memory crashes.

### 3. Full-Stack & Frontend Guardrails

- **The "Anti-Slop" UI Protocol**: When scaffolding Next.js or React user interfaces, strictly forbid the AI Starter Pack aesthetics (pure black `#000000` backgrounds, generic indigo gradients `from-indigo-500 to-purple-600`, and oversized nested cards). Require CSS variables or Tailwind CSS `@theme` directives mapped to perceptually uniform OKLCH color spaces.
- **Stateful Backend Security**: When generating database operations for platforms like Supabase, AWS, or PostgreSQL, wrap all multi-step mutations in atomic transactions (`BEGIN ... COMMIT`) and prioritize server-side protections (Row Level Security, Prisma middleware, verified JWT claims) over client-side filtering.

### 4. Global Workflow Trajectories

- **`/deep-debug`**:
  - *Step 1 (Ingest & Analyze)*: Read terminal logs, console errors, and stack traces to isolate root cause before modifying code.
  - *Step 2 (Systematic Reproduction)*: Formulate testable hypothesis and inject temporary logging statements to verify the exact failure point.
  - *Step 3 (Verified Patching)*: Implement targeted, self-healing patch and execute local test suites/compilation checks before declaring fixed.
- **`/ml-experiment`**:
  - *Step 1 (Environment Integrity)*: Pin dependency versions in `requirements.txt` or `environment.yml` to prevent library drift.
  - *Step 2 (Dummy Data Verification)*: Pass synthetic dummy batches through architecture to verify tensor shape compatibility and forward passes.
  - *Step 3 (Metrics Dashboard)*: Stand up lightweight metrics visualization (Streamlit, Weights & Biases, or TensorBoard) to monitor losses and metrics.
- **`/autonomous-review`**:
  - *Step 1 (Accessibility & UI Audit)*: Audit ARIA labels, semantic HTML tags, keyboard focus rings, and contrast compliance.
  - *Step 2 (Security Sweep)*: Scan for leaked secrets/API keys, missing authorization middleware, and un-sanitized database inputs.
  - *Step 3 (Architectural Summary)*: Generate structured PR summary highlighting problem, approach, verification evidence, and debt assessment.
