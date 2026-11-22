import { describe, expect, it } from "vitest";
import { stageExit } from "./HeroScrollStage";

describe("stageExit", () => {
  it("is idle before and at the start of the exit ramp", () => {
    for (const p of [0, 0.5, 0.78]) {
      const v = stageExit(p);
      expect(v.scale).toBeCloseTo(1, 10);
      expect(v.y).toBeCloseTo(0, 10);
      expect(v.opacity).toBeCloseTo(1, 10);
    }
  });

  it("reaches the end state at p=1", () => {
    const v = stageExit(1);
    expect(v.scale).toBeCloseTo(0.95, 10);
    expect(v.y).toBeCloseTo(-6, 10);
    expect(v.opacity).toBeCloseTo(0.25, 10);
  });

  it("clamps progress above 1 to the p=1 values", () => {
    const v = stageExit(1.2);
    const end = stageExit(1);
    expect(v.scale).toBeCloseTo(end.scale, 10);
    expect(v.y).toBeCloseTo(end.y, 10);
    expect(v.opacity).toBeCloseTo(end.opacity, 10);
  });

  it("never increases scale or opacity between 0.78 and 1", () => {
    let prev = stageExit(0.78);
    for (let i = 1; i <= 22; i++) {
      const p = Math.min(1, 0.78 + i * 0.01);
      const cur = stageExit(p);
      expect(cur.scale).toBeLessThanOrEqual(prev.scale + 1e-12);
      expect(cur.opacity).toBeLessThanOrEqual(prev.opacity + 1e-12);
      prev = cur;
    }
  });

  it("starts smoothly (opacity stays near 1 just after the ramp begins)", () => {
    expect(stageExit(0.79).opacity).toBeGreaterThan(0.99);
  });
});
