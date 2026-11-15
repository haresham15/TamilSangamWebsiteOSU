import { beforeEach, describe, expect, it } from "vitest";
import { dprCapFor, qualityGovernor, renderScaleFor } from "./qualityGovernor";

/** Feeds `seconds` of active frames at a fixed interval starting at `t0`; returns end time. */
function run(t0: number, intervalMs: number, seconds: number) {
  let t = t0;
  const end = t0 + seconds * 1000;
  while (t < end) {
    qualityGovernor.frame(t, true);
    t += intervalMs;
  }
  return t;
}

describe("qualityGovernor", () => {
  beforeEach(() => {
    qualityGovernor.pin(null);
    qualityGovernor.setBudgetMs(1000 / 60);
    qualityGovernor.reset();
  });

  it("holds level 0 at a steady 60 fps", () => {
    run(1000, 16.7, 10);
    expect(qualityGovernor.getLevel()).toBe(0);
  });

  it("steps down after two slow 2 s windows, one level at a time", () => {
    const t = run(1000, 30, 4.2);
    expect(qualityGovernor.getLevel()).toBe(1);
    run(t, 30, 4.2);
    expect(qualityGovernor.getLevel()).toBe(2);
  });

  it("never goes past level 3", () => {
    run(1000, 40, 30);
    expect(qualityGovernor.getLevel()).toBe(3);
  });

  it("recovers one level after 8 s of fast frames", () => {
    const t = run(1000, 30, 4.2);
    expect(qualityGovernor.getLevel()).toBe(1);
    run(t, 10, 8.5);
    expect(qualityGovernor.getLevel()).toBe(0);
  });

  it("ignores compile/tab-resume spikes and idle frames", () => {
    let t = 1000;
    for (let i = 0; i < 400; i++) {
      qualityGovernor.frame(t, true);
      t += i % 10 === 0 ? 500 : 16.7; // 500 ms hitches are dropped as spikes
    }
    qualityGovernor.frame(t + 50, false);
    expect(qualityGovernor.getLevel()).toBe(0);
  });

  it("does not cut resolution when long tasks show the main thread is the bottleneck", () => {
    let t = 1000;
    const end = t + 8000;
    while (t < end) {
      qualityGovernor.frame(t, true);
      qualityGovernor.recordLongTask(20); // 20 ms of every 40 ms frame is long-task time
      t += 40;
    }
    expect(qualityGovernor.getLevel()).toBe(0);
  });

  it("maps levels to render scale and DPR caps", () => {
    expect(renderScaleFor(0)).toBe(1);
    expect(renderScaleFor(1)).toBe(0.75);
    expect(dprCapFor(1, 1.75)).toBe(1.75);
    expect(dprCapFor(2, 1.75)).toBe(1.25);
    expect(dprCapFor(2, 1.0)).toBe(1.0);
  });
});
