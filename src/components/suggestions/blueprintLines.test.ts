import { describe, it, expect } from "vitest";
import { buildOhioStadiumLines, LINE_WEIGHT } from "./OhioStadiumWireframe";
import { LineBatchBuilder, LINE_KIND, PEN_WIDTH, createLineGeometries } from "./blueprintLines";

describe("Ohio Stadium hidden-line data", () => {
  const data = buildOhioStadiumLines();
  const segments = data.positions.length / 6;

  it("assigns one pen weight per segment and uses all three weights", () => {
    expect(data.weights.length).toBe(segments);
    const used = new Set(Array.from(data.weights));
    expect(used).toEqual(new Set([LINE_WEIGHT.construction, LINE_WEIGHT.structure, LINE_WEIGHT.silhouette]));
    // Silhouettes are the minority: a drawing with mostly bold lines has no hierarchy.
    const bold = Array.from(data.weights).filter((w) => w === LINE_WEIGHT.silhouette).length;
    expect(bold / segments).toBeLessThan(0.25);
  });

  it("builds finite occluder triangles inside the stadium footprint", () => {
    expect(data.occluder.length % 9).toBe(0);
    expect(data.occluderEdges.length).toBe((data.occluder.length / 3) * 2);
    expect(data.occluder.length / 9).toBeGreaterThan(100);
    for (let i = 0; i < data.occluder.length; i += 3) {
      const [x, y, z] = [data.occluder[i], data.occluder[i + 1], data.occluder[i + 2]];
      expect(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)).toBe(true);
      // The west press box overhangs the facade (x to -6.2).
      expect(Math.abs(x)).toBeLessThanOrEqual(6.2);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(data.maxHeight);
    }
  });

  it("keeps the facade wall inside the facade lines so far-side arches can be hidden", () => {
    let maxWallX = 0;
    // Away from the press-box tower (|z| > 2.3) the outermost solid is the facade band.
    for (let i = 0; i < data.occluder.length; i += 3) {
      if (data.occluder[i + 1] < 3.79 && Math.abs(data.occluder[i + 2]) > 2.3) maxWallX = Math.max(maxWallX, Math.abs(data.occluder[i]));
    }
    expect(maxWallX).toBeLessThan(5.6);
    expect(maxWallX).toBeGreaterThan(5.5);
  });
});

describe("LineBatchBuilder", () => {
  it("orders instances by priority so each tier is a prefix", () => {
    const b = new LineBatchBuilder()
      .add([0, 0, 0], [1, 0, 0], LINE_KIND.construction, 0, 2)
      .add([0, 0, 0], [0, 1, 0], LINE_KIND.silhouette, 1, 0)
      .add([0, 0, 0], [0, 0, 1], LINE_KIND.structure, 2, 1)
      .add([0, 0, 0], [2, 0, 0], LINE_KIND.pipe, 0, 0);
    const batch = b.build();
    expect(batch.count).toBe(4);
    expect(batch.hiddenCount).toBe(2);
    expect(batch.essentialCount).toBe(3);
    const kinds = [0, 1, 2, 3].map((i) => batch.style[i * 4 + 1]);
    expect(kinds).toEqual([LINE_KIND.silhouette, LINE_KIND.pipe, LINE_KIND.structure, LINE_KIND.construction]);
    expect(batch.style[0]).toBe(PEN_WIDTH[LINE_KIND.silhouette]);
  });

  it("is deterministic and keeps seeds in [0, 1)", () => {
    const make = () => new LineBatchBuilder().circle([0, 0, 0], 1, LINE_KIND.pipe).build(3);
    const a = make();
    const b = make();
    expect(Array.from(a.style)).toEqual(Array.from(b.style));
    for (let i = 0; i < a.count; i++) {
      expect(a.style[i * 4 + 3]).toBeGreaterThanOrEqual(0);
      expect(a.style[i * 4 + 3]).toBeLessThan(1);
    }
  });

  it("shares instance buffers between the visible and hidden passes", () => {
    const batch = new LineBatchBuilder()
      .add([0, 0, 0], [1, 0, 0], LINE_KIND.silhouette, 0, 0)
      .add([0, 0, 0], [1, 1, 0], LINE_KIND.construction, 0, 2)
      .build();
    const { visible, hidden } = createLineGeometries(batch);
    expect(visible.instanceCount).toBe(2);
    expect(hidden.instanceCount).toBe(1);
    expect(visible.getAttribute("aA")).toBe(hidden.getAttribute("aA"));
    expect(visible.getAttribute("aStyle")).toBe(hidden.getAttribute("aStyle"));
    visible.dispose();
    hidden.dispose();
  });
});
