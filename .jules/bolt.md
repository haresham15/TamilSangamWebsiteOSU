## 2026-10-07 - Memoization in React Components
**Learning:** React components sometimes re-create reference values (like arrays or objects) during renders. Moving these constants outside the component prevents unnecessary re-evaluations and re-renders.
**Action:** Extract static data outside component scopes or use `useMemo` where applicable.
