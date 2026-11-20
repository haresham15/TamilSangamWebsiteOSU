import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { AISLE_FROM_Z, AISLE_HALF_WIDTH, DECK_Y, PLINTH_H, STAGE_RADIUS, buildStageDrum, buildSteelwork, buildWalls, layoutCrowd } from "./forgeGeometry";

function allFinite(g: THREE.BufferGeometry) {
  const a = g.attributes.position.array as Float32Array;
  for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) return false;
  return true;
}

describe("Events forge arena geometry", () => {
  it("merges the hall steel into one finite geometry with baked creases", () => {
    const full = buildSteelwork(0);
    const lean = buildSteelwork(2);
    expect(allFinite(full)).toBe(true);
    expect(full.attributes.aCavity.count).toBe(full.attributes.position.count);
    // Rivets only at higher quality; structure-only stays well under the full build.
    expect(lean.attributes.position.count).toBeLessThan(full.attributes.position.count);
    full.computeBoundingBox();
    expect(full.boundingBox!.min.y).toBeGreaterThanOrEqual(-0.01);
    full.dispose();
    lean.dispose();
  });

  it("builds the stage drum around the origin with the deck at DECK_Y", () => {
    const g = buildStageDrum(0);
    g.computeBoundingBox();
    const box = g.boundingBox!;
    expect(allFinite(g)).toBe(true);
    // The deck plus the coin's plinth.
    expect(box.max.y).toBeCloseTo(DECK_Y + PLINTH_H, 2);
    expect(box.max.x).toBeLessThan(STAGE_RADIUS + 0.5);
    g.dispose();
  });

  it("builds the three walls as one geometry", () => {
    const g = buildWalls();
    expect(g.attributes.position.count).toBe(18);
    g.dispose();
  });

  it("lays out a deterministic crowd that keeps the camera aisle and the stage clear", () => {
    const a = layoutCrowd(1);
    const b = layoutCrowd(1);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(150);
    for (const s of a) {
      if (s.z > AISLE_FROM_Z) expect(Math.abs(s.x)).toBeGreaterThanOrEqual(AISLE_HALF_WIDTH);
      expect(s.kind).toBeGreaterThanOrEqual(0);
      expect(s.kind).toBeLessThan(8);
      expect(Math.hypot(s.x, s.z)).toBeGreaterThan(STAGE_RADIUS + 0.5);
    }
    expect(layoutCrowd(0.7).length).toBeLessThan(a.length);
  });
});
