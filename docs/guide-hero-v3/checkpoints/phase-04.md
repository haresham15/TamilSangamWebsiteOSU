# Guide Hero v3 - Phase 4 checkpoint

**Gate result:** NEEDS HUMAN REVIEW

## Delivered

- Local SQLite persistence at the gitignored `data/faq-engagement.sqlite` path, implemented with Node 22's built-in `node:sqlite`; no external service or dependency was added.
- `POST /api/faq/engage` accepts only `{ faqId, kind: 'open' | 'board' | 'search' }` and returns `204` for a valid, duplicate, rate-limited, or bot request without exposing which path occurred.
- `GET /api/faq/popular` returns only `{ ranked: [{ id, rank }], generatedAt, coldStart }`; it never exposes raw engagement counts.
- A pure 28-day ranking adapter uses the specified 7-day half-life. Exact score ties retain editorial FAQ order. Under 15 weighted engagements it pins `faq-02` ("How do I join?") as the cold-start board answer.
- Daily HMAC-derived visitor keys are truncated before local persistence. No raw IP, user-agent, cookie, account, or event-level behaviour is stored. The local store atomically applies a 24-hour FAQ dedupe and 30-per-minute visitor throttle.
- The guide sends engagement only from intentional accordion opens, board broadcasts, and Enter-submitted matching searches. Telemetry is best effort and never blocks the interaction.
- The station board resolves its popularity state offscreen, cascades to `MOST ASKED` only once when damped progress reaches `p >= 0.82`, and shifts to rank #2 after 12 seconds only while the visitor has not overridden it.
- A new `/privacy` page discloses the anonymous aggregate-counter behavior.

## Local database boundary

```text
browser intent -> POST /api/faq/engage -> HMAC daily visitor key
                                      -> SQLite transaction
GET /api/faq/popular -> 5 minute process cache -> ranked ids only
board at p >= 0.82 -> idempotent most-asked cascade
```

The persistence adapter is deliberately isolated under `src/lib/faq-engagement/`; changing to an approved hosted provider later does not alter ranking, API payloads, or board choreography.

## Verification evidence

| Check | Result |
|---|---|
| Ranking decay, cold start, SQLite aggregate/dedupe, mobile board-fit test | PASS |
| Live `POST /api/faq/engage` with synthetic non-personal request | PASS - `204` |
| Live `GET /api/faq/popular` | PASS - `200`, rank-only JSON, cold start pinned to `faq-02` |
| Lint | PASS - `npm run lint` |
| Production build | PASS - `npm run build` |
| Existing board and rail unit contracts | PASS |

The full browser screenshot suite was run against the user-owned development server because its Next lock prevents Playwright from starting an isolated server. The existing static/visual cases then failed to initialize the global R3F board or reset lab query progress; the new non-browser Phase 4 contract passed. This is an existing test-environment isolation issue, not a failed FAQ API assertion, and is intentionally left for the Phase 5 browser/fallback hardening gate.

## Review notes and explicit limitation

- Node 22 labels `node:sqlite` experimental. This local implementation is suitable for the requested repository-local development database, but a deployment target must be confirmed to run Node 22 before production activation.
- The guide route remains an existing client-page architecture, so its static poster cannot receive the request-time ranked FAQ as a server prop without a separate client-page extraction. The board fetches the rank before its S4 reveal in normal navigation and keeps a zero-layout-shift editorial cold-start value. The requested server-prop poster hand-off remains a tracked limitation, not an unsubstantiated claim of SSR completion.
- New Tamil copy was not added.

## Gate request

Approve the privacy disclosure and the local SQLite/Node 22 boundary to proceed to Phase 5. Phase 5 will resolve the remaining browser-isolation, fallback, reduced-motion, mobile, performance, and server-poster hand-off requirements.
