## 2023-10-11 - [ARIA Labels on Icon-Only Buttons]
**Learning:** Found an icon-only button used to flip the `HolographicCard` 3D component on the board page which lacked an `aria-label`. It's crucial for screen reader users that any interactive elements without text have a descriptive `aria-label` so their purpose is clear.
**Action:** Applied `aria-label="Flip Card"` to the `<button>` to ensure screen readers correctly interpret its function. In the future, always inspect buttons containing only icons (e.g. `<RotateCw />`) for missing accessibility labels.
## 2024-10-21 - [A11y] Aria-Labels in MonthGrid
**Learning:** Icon-style buttons (like the `Close ✕` button) that contain special characters often read out poorly on screen readers. Also, dynamic "View More" popovers (like `+N more`) need context on *what* they are showing more of.
**Action:** Added context-aware `aria-label` attributes to the Close and `+N more` buttons in the calendar `MonthGrid` to improve accessibility without altering the brutalist layout.
