// src/director/keys.ts
import { useDirectorStore } from "./directorStore";

/**
 * Checks if the event target is an interactive typing element (§6.1)
 * Prevents shortcuts from firing while filling out join/suggestion/search inputs.
 */
export const isTyping = (t: EventTarget | null): boolean => {
  const el = t as HTMLElement | null;
  return (
    !!el &&
    (el.isContentEditable ||
      /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) ||
      !!el.closest?.('[role="textbox"],[role="searchbox"],[role="combobox"]'))
  );
};

/**
 * Attaches accessible global keyboard listener for Director's Viewport:
 * - Shift+D (no ctrl/meta/alt, not typing): opens / toggles the HUD
 * - When open:
 *   - W: toggles wireframe
 *   - C: toggles raw / graded
 *   - Escape: closes HUD and resets toggles
 * - Ignores repeating, composing, and modified keys.
 */
export function initDirectorKeys(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleKeyDown = (e: KeyboardEvent) => {
    // 1. Shift+D chord (deliberate activation)
    if (
      e.shiftKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      (e.key === "D" || e.key === "d") &&
      !isTyping(e.target)
    ) {
      e.preventDefault();
      useDirectorStore.getState().toggleOpen();
      return;
    }

    // 2. HUD-Scoped shortcuts (WCAG 2.1.4 compliance: active ONLY when HUD is open)
    const state = useDirectorStore.getState();
    if (
      !state.open ||
      e.repeat ||
      e.isComposing ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      isTyping(e.target)
    ) {
      return;
    }

    const k = e.key.toLowerCase();
    if (k === "w") {
      e.preventDefault();
      state.toggleWire();
    } else if (k === "c") {
      e.preventDefault();
      state.toggleGrade();
    } else if (k === "escape") {
      e.preventDefault();
      state.close();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}
