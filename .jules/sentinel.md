## 2025-02-28 - [JSON-LD Cross-Site Scripting (XSS)]
**Vulnerability:** Found multiple instances where structured data (JSON-LD) was directly serialized using `JSON.stringify(data)` and injected via `dangerouslySetInnerHTML`. An attacker could theoretically inject a `</script>` tag inside user-provided JSON-LD data and execute arbitrary JavaScript.
**Learning:** React's standard `dangerouslySetInnerHTML` for `<script type="application/ld+json">` is vulnerable to XSS if the JSON payload is not escaped, because the HTML parser sees the closing `</script>` string before the JSON parser finishes.
**Prevention:** Always escape the `<` character in JSON payload strings when injecting them into script tags. Using a pattern like `JSON.stringify(data).replace(/</g, '\\u003c')` securely neutralizes the attack vector while preserving valid JSON-LD structure.

## 2025-02-28 - [Email Template HTML Injection]
**Vulnerability:** User inputs (`name`, `interests`, `email`) were being interpolated directly into the HTML strings of generated welcome emails in `src/lib/email.ts` without sanitization. An attacker could register using malicious HTML payloads in their name or interests to spoof email content or inject phishing links.
**Learning:** Even when outputting data to emails (where scripts usually don't run), unsanitized user input in HTML templates can lead to HTML injection. This allows attackers to manipulate the layout, insert misleading text or links, or bypass the application's intended communication format.
**Prevention:** Always sanitize all user-provided data using a robust HTML escaping function (like escaping `<`, `>`, `&`, `"`, `'`) before interpolating it into HTML templates, even for server-side generated emails.
