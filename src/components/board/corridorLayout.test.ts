import { describe, expect, it } from "vitest";
import { ARCH_PARTS, POOL_SIZE, lampPositions, nearestLampPair, partPositions, segmentZ } from "./corridorLayout";

describe("corridor instance layout", () => {
  it("keeps the 20 per-unit architecture meshes as 11 instanced parts", () => {
    const perUnit = ARCH_PARTS.reduce((n, p) => n + p.offsets.length, 0);
    expect(perUnit).toBe(20);
    expect(ARCH_PARTS).toHaveLength(11);
  });

  it("places every part once per unit at the unit's z", () => {
    const shafts = partPositions(ARCH_PARTS.find((p) => p.geometry === "shaft")!);
    expect(shafts).toHaveLength(POOL_SIZE * 2);
    expect(shafts[0]).toEqual([-1.9, 2.0, 30]);
    expect(shafts[shafts.length - 1]).toEqual([1.9, 2.0, segmentZ(POOL_SIZE - 1)]);
  });

  it("puts two lamps per unit on the inner pillar faces", () => {
    const lamps = lampPositions();
    expect(lamps).toHaveLength(POOL_SIZE * 2);
    expect(lamps[0][0]).toBeCloseTo(-1.54);
    expect(lamps[1][0]).toBeCloseTo(1.54);
  });

  it("assigns the two real lights to the pair at the camera's unit", () => {
    expect(nearestLampPair(30).sort()).toEqual([0, 1]);
    expect(nearestLampPair(15.2).sort()).toEqual([6, 7]);
  });

  it("prefers lamps ahead of the camera over ones it has passed", () => {
    // Camera travels toward −z. At z=17.4, unit 2 (z=20) is 2.6 m behind (passed, penalised +6)
    // and unit 3 (z=15) is 2.4 m ahead, so unit 3's pair wins.
    expect(nearestLampPair(17.4).sort()).toEqual([6, 7]);
  });
});
