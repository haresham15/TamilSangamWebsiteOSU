import { describe, expect, it, vi } from "vitest";
import { GamesGpuTimer, GamesRenderDiagnostics } from "../games-hero/compositor/GamesRenderDiagnostics";
import { FOCUS_GAUSSIAN_WEIGHTS } from "../games-hero/compositor/LayeredFocusCompositor";

it("focus kernel preserves premultiplied color/alpha energy without overshoot", () => {
  expect(FOCUS_GAUSSIAN_WEIGHTS.every(weight => weight > 0)).toBe(true);
  const energy = FOCUS_GAUSSIAN_WEIGHTS[0] + 2 * FOCUS_GAUSSIAN_WEIGHTS.slice(1).reduce((sum, weight) => sum + weight, 0);
  expect(energy).toBeCloseTo(1, 8);
  const premultiplied = [0.12, 0.06, 0.03, 0.2];
  expect(premultiplied.map(value => value * energy)).toEqual(expect.arrayContaining(premultiplied.map(value => expect.closeTo(value, 8))));
});

it("focus kernel gives the proposed soft edge width at the existing 18px radius", () => {
  const line = (x: number) => FOCUS_GAUSSIAN_WEIGHTS.reduce((sum, weight, i) => {
    const sample = (offset: number) => Math.max(0, Math.min(1, x + offset + 0.5));
    return sum + weight * (i === 0 ? sample(0) : sample(i * 18 / 4) + sample(-i * 18 / 4));
  }, 0);
  const crossing = (threshold: number) => {
    let lo = -20, hi = 20;
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (line(mid) < threshold) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  };
  const width = crossing(0.9) - crossing(0.1);
  expect(width).toBeGreaterThanOrEqual(14);
  expect(width).toBeLessThan(25);
});

describe("visible composite diagnostics", () => {
  it("counts completed composites, separates plate advancement and expires idle FPS", () => {
    const diagnostics = new GamesRenderDiagnostics();
    for (let i = 0; i < 60; i++) diagnostics.complete(i * 1000 / 60, 4, i / 100, 0.1);
    const moving = diagnostics.snapshot(1000);
    expect(moving.completedComposites).toBe(60);
    expect(moving.plateAdvances).toBe(1);
    expect(moving.compositesLastSecond).toBe(59);
    expect(moving.lastDraw).toMatchObject({ index: 4, requested: 0.59, displayed: 0.1 });
    expect(diagnostics.snapshot(2200).compositesLastSecond).toBe(0);
  });

  it("bounds timing history while preserving lifetime totals and independent stages", () => {
    const diagnostics = new GamesRenderDiagnostics();
    for (let i = 0; i < 300; i++) diagnostics.record("foreground", "cpu", i);
    diagnostics.record("composite", "gpu", 2);
    const stages = diagnostics.snapshot(0).stages;
    expect(stages.foreground.cpu).toMatchObject({ count: 300, retained: 180, lastMs: 299, maxMs: 299 });
    expect(stages.foreground.cpu.p95Ms).toBe(290);
    expect(stages.composite.gpu).toMatchObject({ count: 1, lastMs: 2 });
    expect(stages.composite.cpu).toBeUndefined();
  });

  it("bounds completed timestamps without truncating lifetime totals", () => {
    const diagnostics = new GamesRenderDiagnostics();
    for (let i = 0; i < 1000; i++) diagnostics.complete(i / 2, i, 0, 0);
    const state = diagnostics.snapshot(500);
    expect(state.completedComposites).toBe(1000);
    expect(state.plateAdvances).toBe(1000);
    expect(state.compositeTimes).toHaveLength(512);
    expect(state.compositeTimes.at(-1)).toBe(499.5);
    state.compositeTimes.pop();
    expect(diagnostics.snapshot(500).compositeTimes).toHaveLength(512);
  });
});

it("bounds asynchronous GPU queries, respects existing ownership and discards disjoint results", () => {
  const diagnostics = new GamesRenderDiagnostics();
  const gl = {
    QUERY_RESULT_AVAILABLE: 1, QUERY_RESULT: 2, CURRENT_QUERY: 3,
    getExtension: () => ({ TIME_ELAPSED_EXT: 4, GPU_DISJOINT_EXT: 5 }),
    getQuery: vi.fn((): object | null => null), createQuery: () => ({}),
    beginQuery: vi.fn(), endQuery: vi.fn(), deleteQuery: vi.fn(),
    getParameter: vi.fn(() => false), getQueryParameter: vi.fn((_query, kind) => kind === 1 ? true : 2000000),
  };
  const timer = new GamesGpuTimer(gl as unknown as WebGL2RenderingContext, diagnostics);
  for (let i = 0; i < 40; i++) { timer.begin("composite"); timer.end(); }
  expect(gl.beginQuery).toHaveBeenCalledTimes(32);
  timer.poll();
  expect(diagnostics.snapshot(0).stages.composite.gpu).toMatchObject({ count: 32, lastMs: 2 });
  expect(gl.deleteQuery).toHaveBeenCalledTimes(32);
  gl.getQuery.mockReturnValue({});
  timer.begin("foreground"); timer.end();
  expect(gl.endQuery).toHaveBeenCalledTimes(32);
  gl.getQuery.mockReturnValue(null);
  timer.begin("mask"); timer.end();
  gl.getParameter.mockReturnValue(true);
  timer.poll();
  expect(diagnostics.snapshot(0).stages.mask).toBeUndefined();
  expect(diagnostics.snapshot(0).gpu).toBe("disjoint");
  gl.getParameter.mockReturnValue(false);
  timer.begin("foreground");
  timer.dispose();
  expect(gl.endQuery).toHaveBeenCalledTimes(34);
  expect(gl.deleteQuery).toHaveBeenCalledTimes(34);
});

