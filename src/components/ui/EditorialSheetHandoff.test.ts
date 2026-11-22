import { describe, expect, it } from "vitest";
import { resolveSeamVariant } from "./EditorialSheetHandoff";

describe("resolveSeamVariant", () => {
  it("defaults to full when overlapping the hero", () => {
    expect(resolveSeamVariant(undefined, true)).toBe("full");
  });
  it("defaults to knot when not overlapping", () => {
    expect(resolveSeamVariant(undefined, false)).toBe("knot");
  });
  it("honors explicit values regardless of overlap", () => {
    for (const overlap of [true, false]) {
      expect(resolveSeamVariant("full", overlap)).toBe("full");
      expect(resolveSeamVariant("knot", overlap)).toBe("knot");
      expect(resolveSeamVariant("none", overlap)).toBe("none");
    }
  });
});
