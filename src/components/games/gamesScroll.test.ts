import { describe, expect, it } from "vitest";
import { getGamesCaptionWeights, getGamesExitOpacity, mapGamesScrollProgress } from "../games-hero/gamesScroll";

describe("Games slow-motion scroll pacing", () => {
  it.each([[0, 0], [0.12, 0.22], [0.38, 0.52], [0.54, 0.64], [0.86, 0.85], [1, 1]])(
    "maps scroll %s to the existing shot progress %s", (scroll, scene) => {
      expect(mapGamesScrollProgress(scroll)).toBeCloseTo(scene, 8);
    },
  );

  it("stays reversible and monotone without overshooting the shot", () => {
    let previous = -1;
    for (let index = 0; index <= 1000; index++) {
      const progress = mapGamesScrollProgress(index / 1000);
      expect(progress).toBeGreaterThan(previous);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
      previous = progress;
    }
    expect(mapGamesScrollProgress(-1)).toBe(0);
    expect(mapGamesScrollProgress(2)).toBe(1);
    const forward = [0.1, 0.3, 0.6, 0.8].map(mapGamesScrollProgress);
    expect([0.8, 0.6, 0.3, 0.1].map(mapGamesScrollProgress)).toEqual([...forward].reverse());
  });

  it("joins phases at matching, positive speed instead of stopping or snapping", () => {
    const epsilon = 0.00001;
    for (const boundary of [0.12, 0.38, 0.54, 0.86]) {
      const center = mapGamesScrollProgress(boundary);
      const before = (center - mapGamesScrollProgress(boundary - epsilon)) / epsilon;
      const after = (mapGamesScrollProgress(boundary + epsilon) - center) / epsilon;
      expect(before).toBeGreaterThan(0.1);
      expect(after).toBeGreaterThan(0.1);
      expect(Math.abs(before - after)).toBeLessThan(0.001);
    }
  });

  it("gives the blast a slower scroll rate than the establishing shot", () => {
    const rate = (scroll: number) => (mapGamesScrollProgress(scroll + 0.001) - mapGamesScrollProgress(scroll - 0.001)) / 0.002;
    expect(rate(0.7)).toBeLessThan(rate(0.06) / 2);
  });
});

describe("Games caption transitions", () => {
  it.each([[0.1, 0], [0.42, 1], [0.72, 2], [0.93, 3]])("holds one caption at shot %s", (progress, index) => {
    expect(getGamesCaptionWeights(progress)).toEqual([0, 1, 2, 3].map(beat => beat === index ? 1 : 0));
  });

  it.each([[0.22, 0], [0.52, 1], [0.85, 2]])("crossfades adjacent captions at %s", (progress, index) => {
    const weights = getGamesCaptionWeights(progress);
    expect(weights[index]).toBeCloseTo(0.5, 8);
    expect(weights[index + 1]).toBeCloseTo(0.5, 8);
  });

  it("keeps total caption opacity constant through every transition", () => {
    for (let index = 0; index <= 1000; index++) {
      const weights = getGamesCaptionWeights(index / 1000);
      expect(weights.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 8);
      expect(weights.every(value => value >= 0 && value <= 1)).toBe(true);
    }
  });
});

it("blends the settled exit into arcade paper after the last reference frame", () => {
  expect(getGamesExitOpacity(0.93)).toBe(0);
  expect(getGamesExitOpacity(0.94)).toBe(0);
  expect(getGamesExitOpacity(0.97)).toBeCloseTo(0.5, 8);
  expect(getGamesExitOpacity(1)).toBe(1);
});
