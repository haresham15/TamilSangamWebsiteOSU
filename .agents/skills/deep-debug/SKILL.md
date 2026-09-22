---
name: deep-debug
description: Executes systematic, evidence-driven root-cause debugging across deployment failures, runtime crashes, and regressions.
---

# Deep Debug Protocol

Use this skill when diagnosing broken builds, test failures, or uncaught exceptions. Ban all speculative coding and guesswork.

## Execution Order

1. **Ingest & Analyze**:
   - Collect and parse stack traces, console errors, and build output.
   - Trace exact execution paths and identify failing preconditions.
2. **Systematic Reproduction**:
   - Formulate a falsifiable hypothesis.
   - Insert temporary diagnostic logging or minimal reproduction assertions.
3. **Verified Patching**:
   - Write a minimal, self-healing patch.
   - Run type checking and automated tests to verify the regression is eliminated.
   - Remove temporary diagnostic code before shipping.
