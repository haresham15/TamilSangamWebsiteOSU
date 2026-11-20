import { describe, it, expect } from "vitest";
import {
  BLAST_COUNT,
  BLAST_SEEDS,
  DEBRIS_FLOOR_Y,
  FENCE_DUST_COUNT,
  FIRE_SPRITES_PER_BLAST,
  MISSILE_ENTER,
  MISSILE_TARGET_X,
  SMOKE_LOBES_PER_BLAST,
  TRAIL_SAMPLES,
  createLobeState,
  createShockState,
  debrisLanding,
  debrisState,
  fenceDust,
  fireLobe,
  groundDust,
  missileApproach,
  missilePassP,
  shockwave,
  smokeLobe,
  trailPoint,
  trailRadiusProfile,
  trailResidue,
  trailWidthScale,
} from "@/components/games-hero/beach/missilePath";
import { FIREBALLS } from "@/components/games-hero/gamesRail";

const v = () => ({ x: 0, y: 0, z: 0 });
const finite = (o: object) =>
  Object.values(o).every((value) => typeof value !== "number" || Number.isFinite(value));

describe("missilePath (port of render-games-hybrid.py trail_point)", () => {
  it("lands every missile on its SUV target at t = 1", () => {
    for (let index = 0; index < BLAST_COUNT; index++) {
      const end = trailPoint(index, 1, v());
      expect(end.x).toBeCloseTo(MISSILE_TARGET_X[index], 5);
      expect(end.y).toBeCloseTo(1.2, 5);
      expect(end.z).toBeCloseTo(-31, 5);
    }
  });

  it("produces finite samples that start far out and close in on the compound", () => {
    for (let index = 0; index < BLAST_COUNT; index++) {
      const start = trailPoint(index, 0, v());
      expect(start.z).toBeCloseTo(-58, 6);
      expect(start.y).toBeGreaterThan(8);
      let previousZ = -Infinity;
      for (let j = 0; j < TRAIL_SAMPLES; j++) {
        const point = trailPoint(index, j / (TRAIL_SAMPLES - 1), v());
        expect(finite(point)).toBe(true);
        expect(point.z).toBeGreaterThan(previousZ);
        previousZ = point.z;
      }
    }
  });

  it("approaches monotonically from enter to hit with the ^1.4 ease, and inverts", () => {
    for (let index = 0; index < BLAST_COUNT; index++) {
      const enter = MISSILE_ENTER[index];
      const hit = FIREBALLS[index].hit;
      expect(missileApproach(enter - 0.01, index)).toBe(0);
      expect(missileApproach(hit, index)).toBe(1);
      expect(missileApproach(hit + 0.1, index)).toBe(1);
      expect(missileApproach((enter + hit) / 2, index)).toBeCloseTo(0.5 ** 1.4, 10);
      let previous = -1;
      for (let i = 0; i <= 200; i++) {
        const p = enter + ((hit - enter) * i) / 200;
        const a = missileApproach(p, index);
        expect(a).toBeGreaterThanOrEqual(previous);
        previous = a;
        expect(missileApproach(missilePassP(a, index), index)).toBeCloseTo(a, 9);
      }
    }
  });

  it("keeps the contrail until impact, then decays and widens it", () => {
    expect(trailResidue(0.6, 0)).toBe(1);
    expect(trailResidue(0.84, 0)).toBeCloseTo(Math.exp(-1), 10);
    expect(trailWidthScale(0.6, 1)).toBe(1);
    expect(trailWidthScale(0.85, 1)).toBeCloseTo(1.6, 10);
    expect(trailRadiusProfile(0)).toBeGreaterThan(0.12);
    expect(trailRadiusProfile(47.5)).toBeCloseTo(1, 10);
  });

  it("seeds 9 smoke, 22 fire and 14 debris per blast deterministically", () => {
    for (const seeds of BLAST_SEEDS) {
      expect(seeds.smoke).toHaveLength(SMOKE_LOBES_PER_BLAST);
      expect(seeds.fire).toHaveLength(FIRE_SPRITES_PER_BLAST);
      expect(seeds.debris).toHaveLength(14);
      for (const s of seeds.fire) {
        expect(Math.abs(s.ox)).toBeLessThanOrEqual(0.45);
        expect(s.oy).toBeGreaterThanOrEqual(0.1);
        expect(s.factor).toBeGreaterThanOrEqual(0.25);
      }
      for (const d of seeds.debris) expect(d.velocity.y).toBeGreaterThanOrEqual(4);
    }
    expect(BLAST_SEEDS[0].smoke[3].oy).toBeCloseTo(0.7 + 3 * 0.24, 10);
  });

  it("evaluates lobes, dust, shock and debris as finite pure functions of p", () => {
    const lobe = createLobeState();
    const shock = createShockState();
    const position = v();
    const rotation = v();
    for (let i = 0; i <= 100; i++) {
      const p = i / 100;
      for (let index = 0; index < BLAST_COUNT; index++) {
        const active = p >= FIREBALLS[index].hit;
        for (let j = 0; j < SMOKE_LOBES_PER_BLAST; j++) {
          expect(finite(smokeLobe(p, index, j, lobe))).toBe(true);
          expect(lobe.visible).toBe(active);
        }
        for (let j = 0; j < FIRE_SPRITES_PER_BLAST; j++) expect(finite(fireLobe(p, index, j, lobe))).toBe(true);
        expect(finite(groundDust(p, index, lobe))).toBe(true);
        expect(finite(shockwave(p, index, shock))).toBe(true);
        for (let j = 0; j < 14; j++) {
          const flight = debrisState(p, index, j, position, rotation);
          expect(Number.isFinite(flight) && finite(position) && finite(rotation)).toBe(true);
          expect(position.y).toBeGreaterThanOrEqual(DEBRIS_FLOOR_Y);
        }
      }
      for (let j = 0; j < FENCE_DUST_COUNT; j++) expect(Number.isFinite(fenceDust(p, j, lobe))).toBe(true);
    }
  });

  it("matches the script at reference moments", () => {
    const lobe = createLobeState();
    // Fire at full growth (age .3) sits forward of the SUVs at z -30.
    fireLobe(FIREBALLS[1].hit + 0.06, 1, 0, lobe);
    const s = BLAST_SEEDS[1].fire[0];
    const bloom = 1 + 0.8 * Math.exp(-(((0.3 - 0.35) / 0.3) ** 2));
    expect(lobe.x).toBeCloseTo(0.43 + s.ox * bloom * 1.4 * 3, 6);
    expect(lobe.y).toBeCloseTo(0.4 + 0.15 + 1 + s.oy * 3, 6);
    expect(lobe.ry).toBeCloseTo(2 * 3 * s.factor * (1 - 0.3 * 0.45) * 1.15, 6);
    // Shockwave: 9 m per second, seconds = 8 (p - hit).
    expect(shockwave(FIREBALLS[0].hit + 0.05, 0, createShockState()).radius).toBeCloseTo(3.6, 6);
    // Debris lands on the floor and stays there.
    const position = v();
    const rotation = v();
    const vy = BLAST_SEEDS[2].debris[0].velocity.y;
    const late = FIREBALLS[2].hit + (debrisLanding(vy) + 1) / 18;
    expect(debrisState(late, 2, 0, position, rotation)).toBeCloseTo(debrisLanding(vy), 10);
    expect(position.y).toBeCloseTo(DEBRIS_FLOOR_Y, 6);
    // Fence dust fades out after its 0.154 span.
    expect(fenceDust(0.646 + 0.154, 0, lobe)).toBe(0);
    expect(fenceDust(0.66, 0, lobe)).toBeGreaterThan(0);
    // Missiles are visible between their enter time and impact.
    expect(MISSILE_ENTER).toEqual([0.54, 0.546, 0.552]);
  });
});
