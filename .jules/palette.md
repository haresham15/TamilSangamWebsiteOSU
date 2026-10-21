## 2024-05-24 - Accessibility labels overriding localized texts
**Learning:** Adding `aria-label` attributes to interactive elements overrides their visible text content for screen readers. In bilingual or localized interfaces, hardcoding an `aria-label` in a single language breaks the localization experience.
**Action:** When adding `aria-label`s, ensure they are also localized using the current language state, or avoid adding them to elements that already have sufficient, descriptive visible text.
