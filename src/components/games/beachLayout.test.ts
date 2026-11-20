// Guards the real-time beach layout against drift from the offline Blender scene.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BREACH_XS,
  FENCE,
  FENCE_DUST,
  FOUNTAIN,
  GROUND_TOP,
  OCEAN,
  PALETTE,
  PALMS,
  PARASOL,
  RETAINING_WALL,
  SUN_POSITION,
  SUN_STRENGTH,
  SUV_XS,
  SUV_Z,
  WALL,
  fenceDustOnset,
  fencePicketXs,
} from "../games-hero/beach/beachLayout";

const python = readFileSync(path.resolve(import.meta.dirname, "../../../scripts/render-games-hybrid.py"), "utf8");

/** Every number in the first line of the Blender script that matches `pattern`. */
function numbersOn(pattern: RegExp): number[] {
  const line = python.split("\n").find((l) => pattern.test(l));
  if (!line) throw new Error(`no line matches ${pattern}`);
  return (line.match(/-?\d*\.?\d+/g) ?? []).map(Number);
}

describe("beachLayout matches render-games-hybrid.py", () => {
  it("wall segments leave 1.6 m breaches centred on the offline breach xs", () => {
    expect(numbersOn(/for x, width in \[/)).toEqual(WALL.segments.flatMap((s) => [s.x, s.width]));
    expect(numbersOn(/for x in \[-2\.28/)).toEqual([...BREACH_XS]);
    expect(numbersOn(/Thick weathered compound wall/)).toEqual([1.225, -35, 2.45, 0.75, 0.06]);
    const edges = WALL.segments.map((s) => [s.x - s.width / 2, s.x + s.width / 2]);
    BREACH_XS.forEach((x, i) => {
      const gap = [edges[i][1], edges[i + 1][0]];
      expect((gap[0] + gap[1]) / 2).toBeCloseTo(x, 6);
      expect(gap[1] - gap[0]).toBeCloseTo(1.6, 6);
    });
  });

  it("retaining wall, fence and piers", () => {
    expect(numbersOn(/"Left retaining wall"/)).toEqual([...RETAINING_WALL.center, ...RETAINING_WALL.size, RETAINING_WALL.bevel]);
    expect(numbersOn(/for x in range\(-40, -8\)/)).toEqual([FENCE.picketFrom, FENCE.picketTo]);
    expect(fencePicketXs()).toHaveLength(32);
    expect(numbersOn(/"Iron picket"/)).toEqual([1.1, -35, 3.1, -35, FENCE.picketRadius]);
    expect(numbersOn(/for y in \[1\.4, 2\.7\]/)).toEqual([...FENCE.rails.ys]);
    expect(numbersOn(/for x in \[-38, -31/)).toEqual([...FENCE.piers.xs]);
    expect(numbersOn(/"Fence masonry pier"/)).toEqual([FENCE.piers.y, -35, ...FENCE.piers.size, FENCE.piers.bevel]);
  });

  it("SUVs, palms, fountain and parasol", () => {
    expect(numbersOn(/for x in \[-4\.06/)).toEqual([...SUV_XS]);
    expect(numbersOn(/suv\(x, -31\)/)).toEqual([SUV_Z]);
    expect(numbersOn(/for values in \[\(-7\.3/)).toEqual(PALMS.flatMap((p) => [p.x, p.z, p.height, p.seed]));
    expect(numbersOn(/"Fountain limestone plinth"/)).toEqual([FOUNTAIN.x, FOUNTAIN.plinth.y, FOUNTAIN.z, ...FOUNTAIN.plinth.size, FOUNTAIN.plinth.bevel]);
    expect(numbersOn(/for y,r in \[/)).toEqual(FOUNTAIN.stones.flatMap((s) => [s.y, s.r]));
    expect(numbersOn(/"Garden parasol pole"/)).toEqual([PARASOL.x, 0, PARASOL.z, PARASOL.x, PARASOL.poleHeight, PARASOL.z, PARASOL.poleRadius]);
  });

  it("ground, ocean, sun and palette", () => {
    expect(GROUND_TOP).toBeCloseTo(-0.005, 6);
    expect(numbersOn(/"Ocean horizon"/)).toEqual([...OCEAN.center, ...OCEAN.size]);
    expect(numbersOn(/type="SUN"/)).toEqual([...SUN_POSITION]);
    expect(numbersOn(/sun\.data\.energy/)[0]).toBe(SUN_STRENGTH);
    expect(numbersOn(/"Weathered olive bodywork"/)).toEqual([...PALETTE.olive.color, PALETTE.olive.roughness, PALETTE.olive.metalness]);
    expect(numbersOn(/"Dark smoked vehicle glass"/)).toEqual([...PALETTE.glass.color, PALETTE.glass.roughness, PALETTE.glass.metalness]);
    expect(numbersOn(/"Warm limestone"/)).toEqual([...PALETTE.limestone.color, PALETTE.limestone.roughness]);
  });

  it("fence dust onsets", () => {
    expect(numbersOn(/fence_dust\.append/)).toContain(FENCE_DUST.onset0);
    expect(fenceDustOnset(11)).toBeCloseTo(0.668, 9);
  });
});
