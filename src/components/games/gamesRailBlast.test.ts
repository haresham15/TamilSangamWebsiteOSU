import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { FIREBALLS, blastEnergy, blastWatts, fireballThermal } from "@/components/games-hero/gamesRail";

/** The GamesFocusScene loop (pre-extraction) that blastEnergy must reproduce. */
function reference(p: number, at: THREE.Vector3) {
  const direction = new THREE.Vector3();
  let irradiance = 0;
  for (const blast of FIREBALLS) {
    if (p < blast.hit) continue;
    const age = (p - blast.hit) / 0.2;
    const watts = 24000 * Math.exp(-age / 0.035) + 9000 * Math.exp(-age * 2.8);
    const step = new THREE.Vector3(blast.x, 1.5, -30).sub(at);
    const energy = (2 * Math.PI * watts) / (4 * Math.PI * step.lengthSq());
    direction.addScaledVector(step.normalize(), energy);
    irradiance += energy;
  }
  return { irradiance, direction: irradiance > 0 ? direction.normalize() : direction };
}

describe("gamesRail blast light", () => {
  it("is dark before the first impact", () => {
    expect(blastWatts(0.639, 0)).toBe(0);
    expect(blastEnergy(0.5, { x: 0, y: 1.65, z: 6 })).toBe(0);
  });

  it("matches the focus scene's irradiance and direction", () => {
    const at = new THREE.Vector3(0.3, 1.7, 5.6);
    const out = new THREE.Vector3();
    for (const p of [0.64, 0.645, 0.657, 0.66, 0.674, 0.7, 0.8, 1]) {
      const expected = reference(p, at);
      const irradiance = blastEnergy(p, at, out);
      expect(irradiance).toBeCloseTo(expected.irradiance, 9);
      expect(out.distanceTo(expected.direction)).toBeLessThan(1e-9);
    }
  });

  it("flashes at impact and decays", () => {
    expect(blastWatts(0.64, 0)).toBeCloseTo(33000, 6);
    expect(blastWatts(0.7, 0)).toBeLessThan(blastWatts(0.65, 0));
  });
});

describe("fireballThermal (py:571-573)", () => {
  it("stays fully hot until age .48, then cools toward 2200 K", () => {
    expect(fireballThermal(0)).toEqual({ cooling: 1, temperature: 5500, heatGain: 7.5 });
    expect(fireballThermal(0.48).temperature).toBe(5500);
    const late = fireballThermal(1);
    expect(late.cooling).toBeCloseTo(Math.exp(-0.52 * 4.8), 12);
    expect(late.temperature).toBeCloseTo(2200 + 3300 * late.cooling, 9);
    expect(late.heatGain).toBeCloseTo(7.5 * late.cooling, 12);
    expect(fireballThermal(5).temperature).toBeGreaterThan(2200);
  });

  it("reuses the out object", () => {
    const out = { cooling: 0, temperature: 0, heatGain: 0 };
    expect(fireballThermal(0.7, out)).toBe(out);
  });
});
