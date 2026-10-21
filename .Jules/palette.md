## 2026-10-08 - [A11y Div Conversion]
**Learning:** Found interactive elements disguised as `<div onClick={...}>` instead of native buttons. This violates accessibility practices by disabling keyboard navigability (no tab focus, no enter/space trigger).
**Action:** Replaced these `div` elements with native `<button type="button">` elements, added appropriate `aria-label` attributes, and utilized CSS reset classes (`appearance-none bg-transparent border-none p-0 text-left`) to maintain the exact same design and layout without sacrificing a11y.
