import { describe, expect, it } from "vitest";
import { nextTrapTarget } from "./focusTrap";

describe("nextTrapTarget", () => {
  const items = ["close", "link", "submit"];

  it("wraps forward from the last element to the first", () => {
    expect(nextTrapTarget(items, "submit", false)).toBe("close");
  });

  it("wraps backward from the first element to the last", () => {
    expect(nextTrapTarget(items, "close", true)).toBe("submit");
  });

  it("leaves focus to the browser between the ends", () => {
    expect(nextTrapTarget(items, "link", false)).toBeNull();
    expect(nextTrapTarget(items, "link", true)).toBeNull();
  });

  it("pulls focus back in when it escaped the region", () => {
    expect(nextTrapTarget(items, "outside", false)).toBe("close");
    expect(nextTrapTarget(items, null, true)).toBe("submit");
  });

  it("does nothing for an empty region", () => {
    expect(nextTrapTarget([], null, false)).toBeNull();
  });
});
