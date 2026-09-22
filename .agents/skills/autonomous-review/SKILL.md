---
name: autonomous-review
description: Conducts an automated pre-ship audit covering accessibility, anti-slop visual design, backend security, and pull request documentation.
---

# Autonomous Review Protocol

Use this skill before merging PRs or pushing features to production.

## Execution Order

1. **Accessibility & UI Audit**:
   - Check semantic HTML tags, keyboard accessibility, and WCAG AA contrast.
   - Enforce the Anti-Slop checklist (eliminate pure black, un-tinted grays, and generic purple gradients).
2. **Security & Static Quality Sweep**:
   - Check for exposed API secrets, tokens, or untyped route inputs.
   - Ensure database mutations run inside transactions with Row Level Security.
   - Run type checks (`npx tsc --noEmit`) with 0 errors.
3. **Architectural Summary**:
   - Draft a structured PR description detailing the problem, solution, verification proof, and technical debt risk assessment.
