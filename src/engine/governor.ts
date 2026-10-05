// src/engine/governor.ts
/**
 * Frame Governor (§4.3)
 * Systems declare why they need frames; nothing renders if nobody asks.
 * Level 0 = Idle / Paused (no WebGL render)
 * Level 1 = Ambient (~30 fps, renders every alternating tick)
 * Level 2 = Active (renders every tick, e.g. scroll, active animation, pointer interaction)
 */

export type GovernorLevel = 0 | 1 | 2;

const asks = new Map<string, GovernorLevel>();

export const governor = {
  request(key: string, level: GovernorLevel) {
    if (level > 0) {
      asks.set(key, level);
    } else {
      asks.delete(key);
    }
  },

  level(): GovernorLevel {
    if (typeof document !== "undefined" && document.hidden) {
      return 0;
    }
    let maxLevel: GovernorLevel = 0;
    for (const v of asks.values()) {
      if (v > maxLevel) {
        maxLevel = v;
      }
      if (maxLevel === 2) break;
    }
    return maxLevel;
  },

  getAsks(): Record<string, GovernorLevel> {
    return Object.fromEntries(asks.entries());
  },

  clear() {
    asks.clear();
  },
};

if (typeof window !== "undefined") {
  (window as unknown as { __governor?: typeof governor }).__governor = governor;
}
