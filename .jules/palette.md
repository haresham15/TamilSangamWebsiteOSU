## 2023-10-11 - [ARIA Labels on Icon-Only Buttons]
**Learning:** Found an icon-only button used to flip the `HolographicCard` 3D component on the board page which lacked an `aria-label`. It's crucial for screen reader users that any interactive elements without text have a descriptive `aria-label` so their purpose is clear.
**Action:** Applied `aria-label="Flip Card"` to the `<button>` to ensure screen readers correctly interpret its function. In the future, always inspect buttons containing only icons (e.g. `<RotateCw />`) for missing accessibility labels.
