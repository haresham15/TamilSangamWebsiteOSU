# Workflow: /deep-debug
# Systematic Root-Cause Debugging Trajectory

Execute this workflow when Vercel deployments fail, scripts crash, or runtime regressions occur. Strictly ban blind guesswork or speculative code alterations.

## Step 1: Ingest & Analyze
- **Read Raw Diagnostics**: Ingest terminal logs, build failure outputs, browser DevTools console messages, and uncaught exception stack traces verbatim.
- **Trace Fault Boundaries**: Map the exact file, line number, and component lifecycle where the anomaly originated.
- **Categorize Defect**: Classify the issue (e.g., stale closure, race condition, missing env var, CSS syntax collision, dynamic import SSR mismatch, type mismatch).

## Step 2: Systematic Reproduction
- **Formulate Null Hypothesis**: Clearly state why the defect occurs based on observed facts rather than intuition.
- **Isolate Minimal Test Case**: Place temporary high-contrast diagnostic probes or unit assertions at the inputs and outputs of the failing boundary.
- **Verify Failure Mode**: Confirm the error reproduces reliably under the identified conditions before touching production logic.

## Step 3: Verified Patching
- **Implement Minimal Diff**: Write a targeted, defensive patch addressing the root cause without introducing extraneous refactors.
- **Execute Local Verification Suite**:
  - Run type checks (`npx tsc --noEmit` or language compiler).
  - Run test suites (`npm test` / `pytest`).
  - Verify live runtime in browser or CLI.
- **Clean Diagnostic Artifacts**: Remove all temporary diagnostic logs and probes prior to committing.
