# Workflow: /autonomous-review
# Production-Ready Pull Request & Feature Verification Trajectory

Run this workflow prior to finalizing pull requests, merging feature branches, or deploying releases to production.

## Step 1: Accessibility & UI Audit
- **Semantic Structure**: Verify all interactive controls utilize native HTML tags (`<button>`, `<a>`, `<input>`) rather than un-semantic `<div>`s.
- **ARIA & Keyboard Navigation**: Verify valid ARIA attributes, skip links, logical tab ordering, and prominent focus indicators (`focus-visible:ring-2`).
- **Color Contrast & Anti-Slop**: Validate WCAG AA contrast (minimum 4.5:1 for body, 3:1 for large text). Ensure no generic AI UI tells (pure `#000000`, purple gradients, uniform low-opacity box shadows).

## Step 2: Security & Static Analysis Sweep
- **Credential Hygiene**: Verify zero exposed API keys, secret tokens, or private endpoints in committed code or git history.
- **Defensive API Gateways**: Ensure all database mutations use server-side authorization (Row Level Security, verified session claims) and input validation (Zod, Pydantic).
- **Static Quality**: Run strict type checks (`npx tsc --noEmit`) and linter checks with zero warnings.

## Step 3: Architectural Summary & PR Documentation
- **Structured Release Notes**: Generate a clean, recruiter-grade Pull Request description:
  - **Problem**: Context and root motivation for the change.
  - **Approach**: Architectural decisions, design patterns, and token usage.
  - **Verification**: Exact commands run, test pass proofs, and browser visual screenshots.
  - **Technical Debt & Risks**: Any follow-up items or migration dependencies.
