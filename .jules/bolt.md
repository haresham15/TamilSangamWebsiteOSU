## 2024-05-24 - [Avoid DOM Thrashing on High-Frequency Scroll Listeners]
**Learning:** Frequent DOM writes (`classList.add`/`classList.remove`) in scroll listeners can cause excessive layout thrashing, even if the classes are already present. The `FloatingNav.tsx` component was executing these operations continuously during scroll.
**Action:** Introduced a state-tracking variable (`currentNavState`) in the closure of the `useEffect` hook to evaluate if the navigation visibility state actually needs to change, allowing an early return before touching the DOM when the state remains the same.

## 2025-05-25 - [Avoid Redundant React State Updates on Scroll]
**Learning:** Calling React state setters (like `setState`) inside high-frequency scroll event listeners triggers unnecessary render cycles even if the state evaluates to the same value conceptually, leading to jank and layout thrashing.
**Action:** Implemented a caching mechanism using `useRef` to store the last known state values within the `useEffect` closure. State updates (`setIsPastHero`, `setIsScrolledDown`) are now only dispatched when the computed values differ from the cached reference.
