import { afterEach, describe, expect, it, vi } from "vitest";
import { decodePlate, HybridFrameCache, nearestSample, parseHybridManifest, type HybridManifest, type HybridSample } from "../games-hero/hybridMedia";
import { DESIGN_ASPECT, evaluateCameraRail, evaluateForegroundRig } from "../games-hero/gamesRail";

const samples = [0, 0.1, 0.22, 0.42, 0.52, 0.6, 0.64, 0.646, 0.652, 0.72, 0.85, 0.93, 1]
  .map((p, i) => ({ p, url: `landscape/frame-${i}.webp`, bytes: 100 }));
const image = () => ({ width: 1912, height: 800, close: vi.fn() }) as unknown as ImageBitmap;
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
const manifest = (): HybridManifest => ({ schemaVersion: 1, revision: "test", calibration: "locked",
  width: 1912, height: 800, colorSpace: "srgb", samples: samples.map(s => ({ ...s })),
  posters: { landscape: ["a", "b", "c", "d"], portrait: ["e", "f", "g", "h"] },
  foreground: { url: "/models/games/hand-grip.glb", bytes: 100 } });

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("separates transfer/body and bitmap decode timings without changing decoded ownership", async () => {
  const bitmap = image();
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, blob: async () => new Blob([new Uint8Array(100)]) })));
  vi.stubGlobal("createImageBitmap", vi.fn(async () => bitmap));
  vi.spyOn(performance, "now").mockReturnValueOnce(10).mockReturnValueOnce(25).mockReturnValueOnce(45);
  const timing = vi.fn();
  expect(await decodePlate(samples[0], new AbortController().signal, timing)).toBe(bitmap);
  expect(timing).toHaveBeenCalledWith(15, 20);
  expect(bitmap.close).not.toHaveBeenCalled();
});

it("reports requested progress, true reversals and bounded decoded storage", async () => {
  const cache = new HybridFrameCache(samples, vi.fn(), vi.fn(), async () => image());
  cache.request(0.42); await flush();
  cache.request(0.52); await flush();
  cache.request(0.42); await flush();
  expect(cache.stats).toMatchObject({ requestedProgress: 0.42, direction: -1, directionChanges: 1 });
  expect(cache.stats.decodedPixelBytes).toBe(cache.stats.decoded * 1912 * 800 * 4);
  expect(cache.stats.lastLoad?.totalMs).toBeGreaterThanOrEqual(0);
  cache.dispose();
  expect(cache.stats.decodedPixelBytes).toBe(0);
});

describe("fixed cinematic framing", () => {
  it("keeps the camera completely fixed through impacts and the content handoff", () => {
    for (const aspect of [DESIGN_ASPECT, 390 / 844]) {
      const start = evaluateCameraRail(0, 0, aspect);
      for (const p of [0.1, 0.42, 0.64, 0.65, 0.72, 0.85, 0.93, 1]) {
        const state = evaluateCameraRail(p, 30, aspect);
        expect(state.position.toArray()).toEqual(start.position.toArray());
        expect(state.lookAt.toArray()).toEqual(start.lookAt.toArray());
        expect(state.fov).toBe(start.fov);
        expect(state.cameraShake).toBe(0);
      }
    }
  });

  it("settles the hand without a tremor or a final lens zoom", () => {
    let previousRoll = Infinity;
    for (let i = 0; i <= 100; i++) {
      const roll = evaluateForegroundRig(0.5 + i / 1000).rotation.z;
      expect(roll).toBeLessThanOrEqual(previousRoll + 1e-10);
      previousRoll = roll;
    }
    const settled = evaluateForegroundRig(0.72);
    for (const p of [0.85, 0.88, 0.9, 0.93, 1]) {
      const hand = evaluateForegroundRig(p);
      expect(hand.position.toArray()).toEqual(settled.position.toArray());
      expect(hand.rotation.toArray()).toEqual(settled.rotation.toArray());
    }
    expect(evaluateForegroundRig(0.9).opacity).toBeLessThan(evaluateForegroundRig(0.85).opacity);
    expect(evaluateForegroundRig(0.94).opacity).toBe(0);
  });

  it("starts and finishes the entrance with zero velocity", () => {
    for (const [p, direction] of [[0.22, 1], [0.4, -1]]) {
      const endpoint = evaluateForegroundRig(p).position;
      const adjacent = evaluateForegroundRig(p + direction * 0.00001).position;
      expect(endpoint.distanceTo(adjacent)).toBeLessThan(1e-8);
    }
  });
});

describe("hybrid sample contract", () => {
  it("selects endpoints, exact checkpoints and earlier midpoint for nonuniform keys", () => {
    expect(nearestSample(samples, -2)).toBe(0);
    expect(nearestSample(samples, 2)).toBe(samples.length - 1);
    for (let i = 0; i < samples.length; i++) expect(nearestSample(samples, samples[i].p)).toBe(i);
    for (let i = 1; i < samples.length; i++) {
      expect(nearestSample(samples, (samples[i - 1].p + samples[i].p) / 2)).toBe(i - 1);
    }
    const forward = Array.from({ length: 101 }, (_, i) => nearestSample(samples, i / 100));
    const reverse = Array.from({ length: 101 }, (_, i) => nearestSample(samples, (100 - i) / 100)).reverse();
    expect(forward).toEqual(reverse);
  });

  it("rejects duplicate, incomplete, oversized and unsafe manifests", () => {
    expect(parseHybridManifest(manifest()).revision).toBe("test");
    const invalid = manifest();
    invalid.samples[1].p = 0;
    expect(() => parseHybridManifest(invalid)).toThrow();
    for (const mutate of [
      (m: HybridManifest) => { m.samples.pop(); },
      (m: HybridManifest) => { m.samples[0].bytes = 19 * 1024 * 1024; },
      (m: HybridManifest) => { m.samples[0].url = "../outside.webp"; },
      (m: HybridManifest) => { m.foreground.url = "https://example.com/hand.glb"; },
      (m: HybridManifest) => { m.posters.portrait = []; },
    ]) {
      const data = manifest(); mutate(data);
      expect(() => parseHybridManifest(data)).toThrow();
    }
  });
});

describe("bounded decoded frame controller", () => {
  it("holds last complete pair; obsolete completion cannot replace newest requested pair", async () => {
    const jobs: { p: number; signal: AbortSignal; resolve: (image: ImageBitmap) => void }[] = [];
    const shown: number[] = [];
    const cache = new HybridFrameCache(samples, p => shown.push(p.sample.p), vi.fn(),
      (sample, signal) => new Promise(resolve => jobs.push({ p: sample.p, signal, resolve })));
    cache.request(0.1);
    expect(cache.stats.pending).toBe(4);
    jobs.find(j => j.p === 0.1)!.resolve(image()); await flush();
    expect(shown).toEqual([0.1]);
    cache.request(0.93);
    expect(shown).toEqual([0.1]);
    expect(cache.stats.pending).toBeLessThanOrEqual(4);
    const stale = image();
    jobs.find(j => j.p === 0.22)!.resolve(stale); await flush();
    expect(stale.close).toHaveBeenCalledOnce();
    expect(shown).toEqual([0.1]);
    jobs.find(j => j.p === 0.93)!.resolve(image()); await flush();
    expect(shown).toEqual([0.1, 0.93]);
    cache.dispose();
  });

  it("bounds cache at six, closes evictions and releases everything on unmount", async () => {
    const images: ImageBitmap[] = [];
    const cache = new HybridFrameCache(samples, vi.fn(), vi.fn(), async () => {
      const bitmap = image(); images.push(bitmap); return bitmap;
    });
    for (const sample of samples) {
      cache.request(sample.p); await flush();
      expect(cache.stats.decoded).toBeLessThanOrEqual(6);
      expect(cache.stats.pending).toBeLessThanOrEqual(4);
    }
    expect(images.some(i => vi.mocked(i.close).mock.calls.length > 0)).toBe(true);
    cache.dispose();
    expect(cache.stats.decoded).toBe(0);
    images.forEach(i => expect(i.close).toHaveBeenCalledOnce());
  });

  it("retries only once after decode failure and then falls back", async () => {
    const failure = vi.fn();
    const decode = vi.fn(async (_sample: HybridSample) => { throw new Error("decode"); });
    const cache = new HybridFrameCache(samples, vi.fn(), failure, decode);
    cache.request(0.42); await flush();
    expect(decode.mock.calls.filter(([s]) => s.p === 0.42)).toHaveLength(2);
    expect(failure).toHaveBeenCalledOnce();
    cache.dispose();
  });

  it("enforces request deadlines and ignores late decoded images", async () => {
    vi.useFakeTimers();
    const failure = vi.fn();
    const jobs: ((image: ImageBitmap) => void)[] = [];
    const cache = new HybridFrameCache(samples, vi.fn(), failure,
      () => new Promise(resolve => jobs.push(resolve)));
    cache.request(0.42);
    await vi.advanceTimersByTimeAsync(6000);
    expect(failure).toHaveBeenCalledOnce();
    const late = image(); jobs[0](late); await flush();
    expect(late.close).toHaveBeenCalledOnce();
    cache.dispose();
  });

  it("falls back when a previously failed speculative frame becomes requested", async () => {
    const failure = vi.fn();
    const cache = new HybridFrameCache(samples, vi.fn(), failure, async sample => {
      if (sample.p === 0.42) throw new Error("unavailable adjacent frame");
      return image();
    });
    cache.request(0.22); await flush();
    expect(failure).not.toHaveBeenCalled();
    cache.request(0.42); await flush();
    expect(failure).toHaveBeenCalledOnce();
    cache.request(0.42); await flush();
    expect(failure).toHaveBeenCalledOnce();
    cache.dispose();
  });

  it("stops requests while hidden and resets aborted attempts on resume", async () => {
    const jobs: { signal: AbortSignal; resolve: (image: ImageBitmap) => void }[] = [];
    const shown = vi.fn();
    const cache = new HybridFrameCache(samples, shown, vi.fn(),
      (_sample, signal) => new Promise(resolve => jobs.push({ signal, resolve })));
    cache.request(0.42);
    cache.setActive(false);
    expect(jobs.every(j => j.signal.aborted)).toBe(true);
    expect(cache.stats.pending).toBe(0);
    cache.request(0.72);
    expect(jobs).toHaveLength(4);
    cache.setActive(true); await flush();
    expect(jobs.length).toBeGreaterThan(4);
    const stale = image(); jobs[0].resolve(stale); await flush();
    expect(shown).not.toHaveBeenCalled();
    expect(stale.close).toHaveBeenCalledOnce();
    cache.dispose();
  });

  it("starts the newest wanted frame when nearby obsolete requests fill every slot", async () => {
    const dense = Array.from({ length: 30 }, (_, index) => ({ p: index / 29, url: `frame-${index}`, bytes: 1 }));
    const jobs: { p: number; signal: AbortSignal }[] = [];
    const cache = new HybridFrameCache(dense, vi.fn(), vi.fn(), (sample, signal) => {
      jobs.push({ p: sample.p, signal });
      return new Promise(() => {});
    });
    try {
      cache.request(dense[15].p);
      cache.request(dense[11].p);
      cache.request(dense[12].p);
      expect(jobs.some(job => job.p === dense[12].p && !job.signal.aborted)).toBe(true);
      expect(cache.stats.pending).toBe(4);
      expect(jobs.filter(job => !job.signal.aborted)).toHaveLength(4);
    } finally { cache.dispose(); }
  });

  it.each(["visibility", "jump"])("keeps the replacement request's retry budget after an old %s abort", async mode => {
    const jobs: { p: number; signal: AbortSignal; reject: (error: Error) => void }[] = [];
    const fallback = vi.fn();
    const cache = new HybridFrameCache(samples, vi.fn(), fallback, (sample, signal) =>
      new Promise((_, reject) => jobs.push({ p: sample.p, signal, reject })));
    try {
      cache.request(0.42);
      if (mode === "visibility") { cache.setActive(false); cache.setActive(true); }
      else { cache.request(0.93); cache.request(0.42); }
      await flush();
      for (let attempt = 0; attempt < 2; attempt++) {
        jobs.filter(job => job.p === 0.42 && !job.signal.aborted).at(-1)!.reject(new Error("decode failed"));
        await flush();
      }
      expect(jobs.filter(job => job.p === 0.42)).toHaveLength(3);
      expect(fallback).toHaveBeenCalledOnce();
    } finally { cache.dispose(); }
  });

  it("closes a decoded image aborted before the load continuation accepts it", async () => {
    const jobs: ((bitmap: ImageBitmap) => void)[] = [];
    const shown = vi.fn();
    const cache = new HybridFrameCache(samples, shown, vi.fn(), () => new Promise(resolve => jobs.push(resolve)));
    const bitmap = image();
    try {
      cache.request(0.42);
      jobs[0](bitmap);
      await Promise.resolve();
      cache.setActive(false);
      cache.setActive(true);
      await flush();
      expect(bitmap.close).toHaveBeenCalledOnce();
      expect(shown).not.toHaveBeenCalled();
    } finally { cache.dispose(); }
  });

  it.each([1, 4])("advances completed plates during continuous requests of %i samples faster than decoding", async stride => {
    vi.useFakeTimers();
    const dense = Array.from({ length: 180 }, (_, index) => ({ p: index / 179, url: `frame-${index}`, bytes: 1 }));
    const shown: number[] = [];
    let aborts = 0;
    const cache = new HybridFrameCache(dense, plate => shown.push(plate.index), vi.fn(), (_sample, signal) => {
      signal.addEventListener("abort", () => aborts++, { once: true });
      return new Promise(resolve => setTimeout(() => resolve(image()), 90));
    });
    try {
      for (let step = 0; step < 40; step++) {
        cache.request(dense[10 + step * stride].p);
        await vi.advanceTimersByTimeAsync(25);
        expect(cache.stats.pending).toBeLessThanOrEqual(4);
        expect(cache.stats.decoded).toBeLessThanOrEqual(6);
      }
      expect(shown.length).toBeGreaterThanOrEqual(5);
      expect(shown.at(-1)).toBeGreaterThanOrEqual(10 + 30 * stride);
      expect(aborts).toBe(0);
      await vi.advanceTimersByTimeAsync(100);
      expect(shown.at(-1)).toBe(10 + 39 * stride);
    } finally { cache.dispose(); await vi.advanceTimersByTimeAsync(100); }
  });

  it("keeps exact captures on the requested sample while nearby plates complete", async () => {
    const jobs: { p: number; resolve: (bitmap: ImageBitmap) => void }[] = [];
    const shown: number[] = [];
    const cache = new HybridFrameCache(samples, plate => shown.push(plate.sample.p), vi.fn(), sample =>
      new Promise(resolve => jobs.push({ p: sample.p, resolve })));
    try {
      cache.request(0.42, true);
      jobs.find(job => job.p === 0.52)!.resolve(image()); await flush();
      expect(shown).toEqual([]);
      jobs.find(job => job.p === 0.42)!.resolve(image()); await flush();
      expect(shown).toEqual([0.42]);
    } finally { cache.dispose(); }
  });

  it.each(["forward", "reverse"])("keeps reordered %s completions behind the wanted frame and catches up", async direction => {
    const jobs: { p: number; signal: AbortSignal; resolve: (bitmap: ImageBitmap) => void }[] = [];
    const shown: number[] = [];
    const cache = new HybridFrameCache(samples, plate => shown.push(plate.sample.p), vi.fn(), (sample, signal) =>
      new Promise(resolve => jobs.push({ p: sample.p, signal, resolve })));
    const complete = async (p: number) => {
      jobs.find(job => job.p === p && !job.signal.aborted)!.resolve(image());
      await flush();
    };
    try {
      if (direction === "reverse") cache.request(0.93);
      cache.request(0.5);
      await complete(direction === "forward" ? 0.6 : 0.42);
      expect(shown).toEqual([]);
      cache.request(direction === "forward" ? 0.501 : 0.499);
      await complete(direction === "forward" ? 0.42 : 0.6);
      expect(shown).toEqual([direction === "forward" ? 0.42 : 0.6]);
      await complete(0.52);
      expect(shown).toEqual(direction === "forward" ? [0.42, 0.52] : [0.6, 0.52]);
      cache.request(direction === "forward" ? 0.4 : 0.6);
      expect(shown.at(-1)).toBe(direction === "forward" ? 0.42 : 0.6);
    } finally { cache.dispose(); }
  });
});

