import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const HYBRID_MANIFEST_URL = "/media/games-hybrid/v1/manifest.json";
export const HYBRID_POSTERS = ["establishing", "closeup", "blast", "exit"] as const;

export interface HybridSample { p: number; url: string; bytes: number }
export interface HybridManifest {
  schemaVersion: 1;
  revision: string;
  calibration: string;
  width: number;
  height: number;
  colorSpace: "srgb";
  samples: HybridSample[];
  posters: { landscape: string[]; portrait: string[] };
  foreground: { url: string; bytes: number };
}

export function mediaUrl(path: string): string {
  if (!path || path.includes("..") || /[?#\\]/.test(path) || /^(?:[a-z]+:|\/\/)/i.test(path)) {
    throw new Error("Invalid hybrid media path");
  }
  return path.startsWith("/") ? path : `/media/games-hybrid/v1/${path}`;
}

export function parseHybridManifest(value: unknown): HybridManifest {
  const manifest = value as HybridManifest;
  if (!manifest || manifest.schemaVersion !== 1 || !manifest.revision || !manifest.calibration ||
    manifest.width !== 1912 || manifest.height !== 800 || manifest.colorSpace !== "srgb" ||
    !Array.isArray(manifest.samples) || manifest.samples.length < 2 || manifest.samples.length > 180) {
    throw new Error("Incompatible hybrid manifest");
  }
  let previous = -1;
  let bytes = 0;
  for (const sample of manifest.samples) {
    if (!Number.isFinite(sample.p) || sample.p < 0 || sample.p > 1 || sample.p <= previous ||
      !Number.isSafeInteger(sample.bytes) || sample.bytes <= 0) throw new Error("Invalid hybrid sample");
    mediaUrl(sample.url);
    previous = sample.p;
    bytes += sample.bytes;
  }
  if (manifest.samples[0].p !== 0 || previous !== 1 || bytes > 18 * 1024 * 1024 ||
    ![0.1, 0.42, 0.72, 0.93].every(p => manifest.samples.some(s => s.p === p))) {
    throw new Error("Incomplete hybrid sampling");
  }
  for (const orientation of ["landscape", "portrait"] as const) {
    const posters = manifest.posters?.[orientation];
    if (!Array.isArray(posters) || posters.length !== 4) throw new Error("Missing hybrid posters");
    posters.forEach(mediaUrl);
  }
  if (!manifest.foreground || !Number.isSafeInteger(manifest.foreground.bytes) ||
    manifest.foreground.bytes <= 0 || manifest.foreground.bytes > 3 * 1024 * 1024) {
    throw new Error("Invalid hybrid foreground");
  }
  mediaUrl(manifest.foreground.url);
  return manifest;
}

/** Nonuniform samples; an exact tie always chooses the earlier plate. */
export function nearestSample(samples: HybridSample[], progress: number): number {
  const p = Math.max(0, Math.min(1, progress));
  let lo = 0;
  let hi = samples.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (samples[mid].p < p) lo = mid + 1;
    else hi = mid;
  }
  return lo > 0 && p <= (samples[lo - 1].p + samples[lo].p) / 2 ? lo - 1 : lo;
}

export interface DecodedPlate { index: number; sample: HybridSample; image: ImageBitmap }
type Decode = (sample: HybridSample, signal: AbortSignal) => Promise<ImageBitmap>;

export async function decodePlate(sample: HybridSample, signal: AbortSignal): Promise<ImageBitmap> {
  const response = await fetch(mediaUrl(sample.url), { signal });
  if (!response.ok) throw new Error(`Plate HTTP ${response.status}`);
  const blob = await response.blob();
  if (blob.size !== sample.bytes) throw new Error("Plate byte mismatch");
  const image = await createImageBitmap(blob, { imageOrientation: "flipY", premultiplyAlpha: "none", colorSpaceConversion: "none" });
  if (signal.aborted || image.width !== 1912 || image.height !== 800) {
    image.close();
    throw new Error("Plate decode cancelled or incompatible");
  }
  return image;
}

/** Owns decoded images only. HTTP cache and the compositor's single texture have separate lifetimes. */
export class HybridFrameCache {
  private cache = new Map<number, ImageBitmap>();
  private pending = new Map<number, AbortController>();
  private attempts = new Map<number, number>();
  private wanted = -1;
  private displayed = -1;
  private direction = 1;
  private active = true;
  private disposed = false;
  private failed = false;
  private samples: HybridSample[];
  private show: (plate: DecodedPlate) => void;
  private fail: () => void;
  private decode: Decode;

  constructor(samples: HybridSample[], show: (plate: DecodedPlate) => void,
    fail: () => void, decode: Decode = decodePlate) {
    this.samples = samples;
    this.show = show;
    this.fail = fail;
    this.decode = decode;
  }

  request(progress: number) {
    if (this.disposed || this.failed) return;
    const index = nearestSample(this.samples, progress);
    if (index !== this.wanted) {
      this.direction = index < this.wanted ? -1 : 1;
      this.wanted = index;
      this.attempts.delete(index);
      // Obsolete callbacks cannot occupy the priority slots during a fast jump.
      for (const [key, request] of this.pending) {
        if (Math.abs(key - index) > 3) {
          this.pending.delete(key);
          this.attempts.delete(key);
          request.abort();
        }
      }
    }
    this.publish();
    this.pump();
  }

  setActive(active: boolean) {
    this.active = active;
    if (!active) {
      this.pending.forEach((request, index) => { this.attempts.delete(index); request.abort(); });
      this.pending.clear();
    } else this.pump();
  }

  private publish() {
    const image = this.cache.get(this.wanted);
    if (!this.active || !image || this.displayed === this.wanted || this.disposed) return;
    this.displayed = this.wanted;
    this.show({ index: this.wanted, sample: this.samples[this.wanted], image });
  }

  private pump() {
    if (!this.active || this.disposed || this.failed || this.wanted < 0) return;
    if (!this.cache.has(this.wanted) && !this.pending.has(this.wanted) && (this.attempts.get(this.wanted) ?? 0) >= 2) {
      this.failed = true;
      this.fail();
      return;
    }
    const queue = [this.wanted, this.wanted + this.direction, this.wanted + 2 * this.direction, this.wanted - this.direction];
    if (!this.cache.has(this.wanted) && !this.pending.has(this.wanted) && this.pending.size >= 4) {
      const victim = [...this.pending.keys()].sort((a, b) => Math.abs(b - this.wanted) - Math.abs(a - this.wanted))[0];
      const obsolete = this.pending.get(victim)!;
      this.pending.delete(victim);
      this.attempts.delete(victim);
      obsolete.abort();
    }
    for (const index of queue) {
      if (this.pending.size >= 4) break;
      if (index < 0 || index >= this.samples.length || this.cache.has(index) || this.pending.has(index) ||
        (this.attempts.get(index) ?? 0) >= 2) continue;
      this.load(index);
    }
  }

  private async load(index: number) {
    const controller = new AbortController();
    this.pending.set(index, controller);
    this.attempts.set(index, (this.attempts.get(index) ?? 0) + 1);
    let deadline: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;
    let decoded: ImageBitmap | undefined;
    try {
      const image = await Promise.race([
        this.decode(this.samples[index], controller.signal).then(image => {
          if (controller.signal.aborted) { image.close(); throw new Error("Obsolete plate"); }
          decoded = image;
          return image;
        }),
        new Promise<never>((_, reject) => {
          deadline = setTimeout(() => { timedOut = true; controller.abort(); reject(new Error("Plate deadline")); }, 3000);
          controller.signal.addEventListener("abort", () => reject(new Error("Plate aborted")), { once: true });
        }),
      ]);
      if (this.disposed || !this.active || controller.signal.aborted || this.pending.get(index) !== controller) return;
      this.attempts.delete(index);
      this.cache.set(index, image);
      decoded = undefined;
      this.publish();
      while (this.cache.size > 6) {
        const victim = [...this.cache.keys()].filter(key => key !== this.displayed && key !== this.wanted)
          .sort((a, b) => Math.abs(b - this.wanted) - Math.abs(a - this.wanted))[0];
        this.cache.get(victim)?.close();
        this.cache.delete(victim);
      }
    } catch {
      if (this.pending.get(index) !== controller) return;
      if (controller.signal.aborted && !timedOut) {
        this.attempts.delete(index);
      } else if (index === this.wanted && (this.attempts.get(index) ?? 0) >= 2) {
        this.failed = true;
        this.fail();
      }
    } finally {
      decoded?.close();
      clearTimeout(deadline);
      if (this.pending.get(index) === controller) this.pending.delete(index);
      if (!this.disposed) this.pump();
    }
  }

  dispose() {
    this.disposed = true;
    this.pending.forEach(request => request.abort());
    this.pending.clear();
    this.cache.forEach(image => image.close());
    this.cache.clear();
  }

  get stats() { return { decoded: this.cache.size, pending: this.pending.size, displayed: this.displayed, wanted: this.wanted }; }
}

export function disposeForeground(root: THREE.Group) {
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
  });
  materials.forEach(material => {
    Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); });
    material.dispose();
  });
  textures.forEach(texture => {
    texture.dispose();
    const image = texture.image as { close?: () => void } | undefined;
    image?.close?.();
  });
}

export async function loadForeground(asset: HybridManifest["foreground"], signal: AbortSignal): Promise<THREE.Group> {
  const response = await fetch(mediaUrl(asset.url), { signal });
  if (!response.ok) throw new Error(`Hand HTTP ${response.status}`);
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength !== asset.bytes) throw new Error("Hand byte mismatch");
  const gltf = await new GLTFLoader().parseAsync(bytes, "");
  if (signal.aborted) { disposeForeground(gltf.scene); throw new Error("Hand cancelled"); }
  return gltf.scene;
}
