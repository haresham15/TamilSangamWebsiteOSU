#!/usr/bin/env node
/**
 * Autonomous Director - PreInvocation Hook for Antigravity
 * Injects high-priority cognitive trigger directing the agent to use skills & MCPs
 */
let inputData = '';
process.stdin.on('data', chunk => { inputData += chunk; });
process.stdin.on('end', () => {
  const directive = [
    "[AUTONOMOUS DISPATCH PROTOCOL - ZERO PROMPT ENFORCEMENT]",
    "1. Never provide ungrounded conversational answers or premature code snippets.",
    "2. If external libraries/APIs/frameworks are involved, UNCONDITIONALLY call context7 (resolve-library-id -> query-docs).",
    "3. If designing, refactoring, or starting a feature, load superpowers:brainstorming or mattpocock:grilling first.",
    "4. If investigating bugs/errors, execute systematic-debugging or diagnosing-bugs.",
    "5. If building UI components, audit with slop-checklist and verify layout in browser via chrome-devtools-mcp.",
    "6. Run npx tsc --noEmit and verification-before-completion before reporting work complete."
  ].join(' ');

  const payload = {
    injectSteps: [
      {
        ephemeralMessage: directive
      }
    ]
  };

  process.stdout.write(JSON.stringify(payload) + '\n');
  process.exit(0);
});
