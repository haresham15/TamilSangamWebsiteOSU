## 2025-02-28 - [JSON-LD Cross-Site Scripting (XSS)]
**Vulnerability:** Found multiple instances where structured data (JSON-LD) was directly serialized using `JSON.stringify(data)` and injected via `dangerouslySetInnerHTML`. An attacker could theoretically inject a `</script>` tag inside user-provided JSON-LD data and execute arbitrary JavaScript.
**Learning:** React's standard `dangerouslySetInnerHTML` for `<script type="application/ld+json">` is vulnerable to XSS if the JSON payload is not escaped, because the HTML parser sees the closing `</script>` string before the JSON parser finishes.
**Prevention:** Always escape the `<` character in JSON payload strings when injecting them into script tags. Using a pattern like `JSON.stringify(data).replace(/</g, '\\u003c')` securely neutralizes the attack vector while preserving valid JSON-LD structure.

## 2025-02-28 - [HTML Injection in Email Templates]
**Vulnerability:** Found an issue where user-provided inputs (`name`, `email`, and `interests`) were directly interpolated into the HTML payload generated for the Welcome Email (`generateWelcomeEmailHtml`), leading to a potential HTML Injection/Spoofing vulnerability.
**Learning:** String interpolation in email HTML templates is vulnerable to HTML Injection if the user input contains unsanitized special characters like `<`, `>`, `&`, `"`, and `'`. Attackers could inject arbitrary HTML tags, modify the structure of the email, or deceive the recipient (Spoofing).
**Prevention:** Always sanitize all user-provided strings before inserting them into HTML templates. Use a robust `escapeHtml` function that replaces special characters with their corresponding HTML entities.
