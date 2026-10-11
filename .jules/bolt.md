## 2024-05-24 - [CommandPalette Re-renders]
**Learning:** Found an opportunity to optimize performance by utilizing React.useMemo() for search indices that rely on large lists.
**Action:** Always memoize arrays and objects that are mapped onto derived states, especially in dynamic searching / filtering components that update on keystrokes.
