import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { buildCoach } from "./coach";
import {
  buildCanopy,
  buildCanopyColumn,
  buildGableWall,
  buildHallColumn,
  buildHallRoof,
  buildHallTruss,
  buildLampBulbs,
  buildPlatformEdges,
  buildPlatformSlabs,
  buildTactileStrip,
  buildTrackBed,
} from "./architecture";

const tris = (g: THREE.BufferGeometry) => (g.index ? g.index.count : g.attributes.position.count) / 3;

describe("guide station art geometry", () => {
  const builders: [string, () => THREE.BufferGeometry, number][] = [
    // [name, builder, instances drawn]
    ["coach hero body", () => buildCoach({ hero: true, seed: 3 }).body, 1],
    ["coach neighbour body", () => buildCoach({ hero: false, seed: 11 }).body, 2],
    ["canopy", buildCanopy, 1],
    ["canopy column", buildCanopyColumn, 6],
    ["hall truss", buildHallTruss, 4],
    ["hall column", buildHallColumn, 8],
    ["hall roof", buildHallRoof, 1],
    ["gable wall", buildGableWall, 1],
    ["platform slabs", buildPlatformSlabs, 1],
    ["platform edges", buildPlatformEdges, 1],
    ["track bed", buildTrackBed, 1],
    ["tactile strip", buildTactileStrip, 1],
    ["lamp bulbs", buildLampBulbs, 1],
  ];

  it("builds every part quickly and within the triangle budget", () => {
    let total = 0;
    const report: string[] = [];
    for (const [name, build, instances] of builders) {
      const t0 = performance.now();
      const g = build();
      const ms = performance.now() - t0;
      const t = tris(g) * instances;
      total += t;
      report.push(`${name}: ${Math.round(ms)} ms, ${Math.round(t)} tris`);
      expect(g.attributes.position.count).toBeGreaterThan(0);
      expect(Number.isFinite(g.boundingSphere?.radius ?? 0)).toBe(true);
      // Main-thread hitch guard: no single builder may stall the first frame.
      expect(ms, name).toBeLessThan(400);
      g.dispose();
    }
    console.log(report.join("\n"));
    // Set geometry stays well inside the 350k scene budget (the board engine adds its own).
    expect(total).toBeLessThan(220_000);
  });

  it("bakes cavity AO where the material expects it", () => {
    for (const g of [buildCoach({ hero: true, seed: 1 }).body, buildCanopy(), buildCanopyColumn(), buildHallColumn(), buildGableWall(), buildPlatformEdges()]) {
      expect(g.getAttribute("aCavity")).toBeDefined();
      g.dispose();
    }
  });

  it("keeps the hero window open and glazes the neighbours", () => {
    const hero = buildCoach({ hero: true, seed: 3 });
    const neighbour = buildCoach({ hero: false, seed: 3 });
    // Neighbours glaze one more opening (the hero window position).
    expect(tris(neighbour.glass)).toBeGreaterThan(tris(hero.glass));
    for (const g of [hero.body, hero.glass, neighbour.body, neighbour.glass]) g.dispose();
  });
});
