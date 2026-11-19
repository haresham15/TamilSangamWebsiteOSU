import { describe, it, expect } from "vitest";
import {
  TALA_COUNT,
  buildKnot,
  buildRingFrame,
  buildTalaModule,
  buildCrown,
  buildStoneworks,
  cameraBeat,
  geometryBytes,
  kalasamTransforms,
  crownKalasamOffsets,
  crownTransforms,
  terraceHeight,
  talaY,
  talaZ,
} from "./gopuramArt";

const MB = 1024 * 1024;

describe("gopuram art geometry", () => {
  it("keeps the shared Brahma Mudi ring geometry under the PRD 4 MB budget", () => {
    const frame = buildRingFrame();
    const knotA = buildKnot(720, 32);
    const knotB = buildKnot(360, 16);
    const tierA = geometryBytes(frame) + geometryBytes(knotA);
    expect(tierA / MB).toBeLessThan(4);
    expect(geometryBytes(knotB)).toBeLessThan(geometryBytes(knotA) / 3);
    // Tier B tube: 360 × 16 segments (2 triangles per quad).
    expect(knotB.index!.count / 3).toBe(360 * 16 * 2);
    [frame, knotA, knotB].forEach((g) => g.dispose());
  });

  it("builds stucco, crown and stonework with baked cavity where the material expects it", () => {
    const tala = buildTalaModule();
    const crown = buildCrown();
    const stone = buildStoneworks();
    expect(tala.getAttribute("aCavity")).toBeDefined();
    expect(crown.getAttribute("aCavity")).toBeDefined();
    for (const g of [tala, crown, stone]) {
      const pos = g.getAttribute("position").array as Float32Array;
      expect(pos.every(Number.isFinite)).toBe(true);
      g.dispose();
    }
  });

  it("walks the terraces continuously from tala 0 to tala 4", () => {
    expect(terraceHeight(20)).toBe(0);
    expect(terraceHeight(talaZ(2))).toBe(talaY(2));
    expect(terraceHeight(-500)).toBe(talaY(TALA_COUNT - 1));
    let prev = terraceHeight(30);
    for (let z = 30; z > -120; z -= 0.25) {
      const h = terraceHeight(z);
      expect(h).toBeGreaterThanOrEqual(prev);
      expect(h - prev).toBeLessThan(0.2);
      prev = h;
    }
  });

  it("holds the camera on each tala at its chapter centre and only moves forward", () => {
    for (let k = 0; k < TALA_COUNT; k++) {
      expect(cameraBeat(0.16 * k + 0.08).pos).toBeCloseTo(k, 6);
    }
    let prev = 0;
    for (let p = 0; p <= 1; p += 0.005) {
      const { pos, exit } = cameraBeat(p);
      expect(pos).toBeGreaterThanOrEqual(prev - 1e-9);
      expect(exit).toBeGreaterThanOrEqual(0);
      expect(exit).toBeLessThanOrEqual(1);
      prev = pos;
    }
    expect(cameraBeat(0.79).exit).toBe(0);
    expect(cameraBeat(1).exit).toBeCloseTo(1, 9);
  });

  it("places a kalasam on every crown socket", () => {
    expect(kalasamTransforms().length).toBe(crownTransforms().length * crownKalasamOffsets().length);
  });
});

describe("bake cache and paving", () => {
  it("reuses baked arrays across mounts without rebuilding", async () => {
    const { cachedGeometry, pavingTransforms } = await import("./gopuramArt");
    let builds = 0;
    const build = () => { builds++; return buildCrown(); };
    const a = cachedGeometry("test-crown", build);
    const b = cachedGeometry("test-crown", build);
    expect(builds).toBe(1);
    expect(b.getAttribute("aCavity").array).toBe(a.getAttribute("aCavity").array);
    a.dispose();
    b.dispose();
    expect(pavingTransforms().length).toBeGreaterThan(100);
  });
});
