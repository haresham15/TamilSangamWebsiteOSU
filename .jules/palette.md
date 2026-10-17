## 2024-11-20 - [GuestbookField form a11y]
**Learning:** React form inputs without native `<fieldset>` groupings or proper `aria-describedby` silently fail for screen reader users when contextual sublabels or dynamic validation errors appear. Even if visually adjacent, sublabels and errors are disconnected from the input element's tab-focus node.
**Action:** Always map sublabels and error nodes to an explicit DOM `id`, and inject those ids into the input's `aria-describedby` string while toggling `aria-invalid`. Add `role="alert"` for the error node.
