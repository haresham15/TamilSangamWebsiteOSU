# Codex workflow for Tamil Sangam OSU

Read [AGENTS.md](AGENTS.md) first for shared rules. This companion adds task routing and Codex-specific workflow; it does not duplicate the design contract.

## Entry and execution

1. Confirm workspace and inspect `git status --short` plus the diff for files you will touch. This repository may contain extensive ongoing work; start from the working tree, not assumptions about HEAD.
2. Read applicable nested instructions, especially [src/components/AGENTS.md](src/components/AGENTS.md). They add protected-component, token, and semantic-control requirements.
3. Trace the relevant route/import path and callers. State material assumptions and, for multi-step work, a short plan with verification criteria.
4. Complete authorized work and checks without repeated confirmation. Ask when the answer changes scope or behavior materially, or when a destructive action requires consent. In Plan mode, inspect and plan without implementing.
5. Review your own diff. Report changes, evidence, and unchecked risks concisely. Do not commit, push, deploy, or send messages unless the task authorizes it.

Codex discovers `AGENTS.md` through its instruction hierarchy. `codex.md` is a companion explicitly reached from the root instructions, not an independently auto-loaded configuration file. Adding it as a fallback filename would not load both files from the same directory. See [official instruction discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md). A fresh session is needed to verify automatic loading after instruction changes.

## Context and tool routing

- **Code relationships:** When `.codegraph/` exists and CodeGraph is available, query it first for the relevant flow, callers, and blast radius. Reuse returned source; only re-read when missing, stale, or changed since inspection.
- **Cross-document context:** Use an existing Graphify graph for relationships between design/architecture documents when the CLI or MCP is available. A graph is navigation, not proof of current runtime behavior. If its launcher fails, report once and fall back to scoped source/document reads; do not turn a product task into tool repair.
- **No usable index:** Use `rg` / `rg --files` and targeted reads. Index creation is optional when it helps a substantial investigation and the current mode permits writes; do not block on tooling.
- **Large outputs:** Prefer context-mode execution/search to derive focused answers from large files or batches. Keep raw logs and source dumps out of conversation. Use normal shell commands for short observations, Git, tests, and installs; use host edit tools for file changes.
- **APIs:** Read the relevant installed Next.js guide under `node_modules/next/dist/docs/`. For other uncertain library APIs, use available Context7 or current official docs.
- **Capabilities:** Discover tools exposed in the current session. Repository MCP configuration, `.agents/hooks.json`, and Antigravity/Cursor workflow files do not prove Codex has loaded or executed those capabilities. Use an available equivalent and disclose verification gaps.
- **Skills:** Load only task-relevant skills. Local entry points: [deep-debug](.agents/skills/deep-debug/SKILL.md) for failures, [autonomous-review](.agents/skills/autonomous-review/SKILL.md) for pre-ship audits, and [ml-experiment](.agents/skills/ml-experiment/SKILL.md) only for actual ML work. Follow explicit user skill requests; do not assume historical skill names are installed.
- **Windows:** Use PowerShell syntax and quote paths. If a shell wrapper fails, inspect command resolution and invoke the installed executable directly; do not change global profiles or unrelated environment settings. Respect sandbox boundaries.
- **Delegation:** Use subagents only when requested or required by applicable instructions; give bounded tasks and review results.

## Where existing behavior lives

| Task | Start here |
| --- | --- |
| App composition and navigation | [Root layout](src/app/layout.tsx), [Providers](src/components/providers/Providers.tsx), [AppShell](src/components/global/AppShell.tsx). Providers coordinate tier, Lite, motion, transitions, locale, landscape, and audio. |
| Styling and reusable content | [Runtime tokens](src/app/globals.css), [Muttram components](src/components/muttram), [UI components](src/components/ui). Reuse CourtyardHeader, MuttramButton, GuestbookField, and OrganicRouteGateway where their existing interfaces fit. |
| Homepage | [Home route](src/app/page.tsx), [DigitalKolamHero](src/components/hero/DigitalKolamHero.tsx), [home components](src/components/home). Includes SilkHoverPillars, EventsDepthShowcase, and NextFlagshipGathering. |
| Feature heroes | Follow active imports from [about](src/app/about/page.tsx), [board](src/app/board/page.tsx), [events](src/app/events/page.tsx), [gallery](src/app/gallery/page.tsx), [guide](src/app/guide/page.tsx), and [join](src/app/join/page.tsx). Similar folders may contain alternate implementations; do not select by name alone. |
| Shared rendering and scrolling | [GlobalCanvas](src/components/gl/GlobalCanvas.tsx), [MotionProvider](src/components/providers/MotionProvider.tsx), [TierProvider](src/components/providers/TierProvider.tsx), [masterTick](src/engine/masterTick.ts), and [LiteModeContext](src/context/LiteModeContext.tsx). Preserve shared ownership and inspect feature-specific exceptions. |
| Locale and sound | [LocaleContext](src/context/LocaleContext.tsx), [AudioContext](src/context/AudioContext.tsx), [audio modules](src/audio), and [audioLayer](src/utils/audioLayer.ts). Trace existing consent/mute behavior before adding sound. |
| Events, board, gallery, site facts | [Data modules](src/data). Homepage seasonal spotlight uses [src/config/upcomingEvent.ts](src/config/upcomingEvent.ts); [root config](config/upcomingEvent.ts) only re-exports it. |
| Server behavior | [API routes](src/app/api), [server actions](src/app/actions), and [shared server utilities](src/lib). Inspect chatEngine, knowledge, email, adminAuth, and ledgerStore as relevant. ledgerStore uses Node SQLite; do not assume a hosted database. |
| Existing browser coverage | [Playwright config](playwright.config.ts), [guide/board tests](tests/guide-hero-board.spec.ts), and [review regression tests](tests/review-fixes.spec.ts). Inspect assertions before deciding which test covers a change. |

For event styling, consult [event theming](docs/EVENT_THEMING.md), then verify the active config and component imports. For content layouts, consult [content-page design notes](docs/redesign/CONTENT-PAGES-FIGMA-SPEC.md). For motion changes, use the relevant route PRD from [docs](docs) as background and verify current code. Historical plans are not proof that a feature shipped.

The current CSS font aliases differ from both the older token JSON and Emblem Engine brief. Follow the styling authority in AGENTS.md; an unrelated task must not become a typography/token migration. Existing implementation also contains local styling exceptions; preserve them unless the requested work addresses them.

## Checks by task

Scripts and dependencies are defined in [package.json](package.json); re-check it before inventing commands.

| Change | Completion evidence |
| --- | --- |
| Documentation | Resolve relative links, check instruction consistency and command names, review the diff, run `git diff --check` for tracked edits, and check newly created files too. |
| TypeScript/React logic | `npm run typecheck`, affected-file ESLint via `npx eslint <files>`, and a targeted regression test or runnable check for non-trivial behavior. |
| Guide/board behavior | `npm run test:guide-board` when its assertions cover the change; add/update focused assertions when needed. |
| Other browser behavior | `npx playwright test tests/review-fixes.spec.ts` when relevant, or a focused Playwright case. Inspect UI and console, including mobile and fallback states. |
| Build/runtime boundaries | `npm run build` plus a relevant route smoke check; distinguish environment failures from code regressions. |

Playwright defaults to Chromium at `http://127.0.0.1:3100` and starts the dev server. Set `PLAYWRIGHT_BASE_URL` to use an existing server; configuration then skips startup. Prefer browser tools available in-session or the installed Playwright setup. Do not claim a live inspection from source review alone.

There is no generic `npm test` script. Source-adjacent tests are not automatically covered by the Playwright test directory; inspect their runner requirements before citing coverage.

## Common task paths

- **Styling change:** Read nested component rules → inspect current tokens and active component → reuse local primitives → critique hierarchy → audit keyboard/contrast/mobile/reduced motion → polish → typecheck and browser evidence.
- **Event update:** Identify whether the task changes the event catalogue or seasonal spotlight → inspect data/config consumers → update the owning data once → verify links and affected views. Root config is a re-export, not a second record.
- **Runtime bug:** Reproduce and capture focused diagnostics → trace callers/shared cause → add a regression check → patch narrowly → run typecheck and the relevant runtime check.
- **Docs-only edit:** Verify claims against current source and scripts → check links and instruction precedence → review changed documents. Skip unrelated builds and browser sessions.

Finish with what changed and what passed, followed by any skipped check or remaining risk. Missing tools, unavailable services, and pre-existing failures must remain explicit.
