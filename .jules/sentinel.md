## 2025-02-28 - [JSON-LD Cross-Site Scripting (XSS)]
**Vulnerability:** Found multiple instances where structured data (JSON-LD) was directly serialized using `JSON.stringify(data)` and injected via `dangerouslySetInnerHTML`. An attacker could theoretically inject a `</script>` tag inside user-provided JSON-LD data and execute arbitrary JavaScript.
**Learning:** React's standard `dangerouslySetInnerHTML` for `<script type="application/ld+json">` is vulnerable to XSS if the JSON payload is not escaped, because the HTML parser sees the closing `</script>` string before the JSON parser finishes.
**Prevention:** Always escape the `<` character in JSON payload strings when injecting them into script tags. Using a pattern like `JSON.stringify(data).replace(/</g, '\\u003c')` securely neutralizes the attack vector while preserving valid JSON-LD structure.
## 2025-03-01 - [Email Template HTML Injection]
**Vulnerability:** Email templates in `src/lib/email.ts` directly interpolated user inputs (name, email, interests) into raw HTML strings, making it vulnerable to HTML injection.
**Learning:** Found a specific vulnerability where `generateWelcomeEmailHtml` failed to sanitize inputs before inserting them into an HTML response. This codebase dynamically generates email templates in the backend without using a safer abstraction (like a template engine that auto-escapes by default).
**Prevention:** Implement a robust `escapeHtml` helper in string-concatenation templates. Wrap any user-provided string before inserting it into raw HTML bodies.
