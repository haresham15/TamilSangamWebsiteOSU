// src/engine/perfProbe.ts
import * as THREE from "three";

/**
 * Hero perf probe (?perf or ?debug only).
 *
 * Wraps the single R3F advance() in masterTick so one sample = one rendered canvas
 * frame across every drei <View>. renderer.info is reset once per frame (autoReset
 * off while probing) so draw calls and triangles are the frame total, not the last
 * View's. Texture memory is an estimate from scenes actually rendered this second.
 */

export interface PerfSample {
  /** ms since the previous rendered frame */
  interval: number;
  /** ms of CPU time spent inside advance() (useFrames + gl.render calls) */
  cpuMs: number;
  /** GPU ms from EXT_disjoint_timer_query_webgl2, null when unavailable/pending */
  gpuMs: number | null;
  calls: number;
  triangles: number;
}

export interface PerfSummary {
  frames: number;
  fps: number;
  intervalP50: number;
  intervalP95: number;
  cpuP50: number;
  cpuP95: number;
  gpuP50: number | null;
  gpuP95: number | null;
  callsAvg: number;
  callsPeak: number;
  trianglesAvg: number;
  trianglesPeak: number;
  /** Estimated: unique textures + render targets reachable from rendered scenes */
  textureMbEstimate: number;
  geometries: number;
  textures: number;
  programs: number;
}

const CAPACITY = 1200; // ~20 s at 60 fps
const samples: PerfSample[] = [];
let enabled: boolean | null = null;
let lastFrameStart = 0;
let frameStart = 0;
let gl: THREE.WebGLRenderer | null = null;
let restoreRender: (() => void) | null = null;
const renderedScenes = new Set<THREE.Object3D>();
let textureMb = 0;
let lastTextureScan = 0;

// Render targets owned outside scene graphs (e.g. GradeRig) report their own estimate.
const reportedBytes = new Map<string, number>();
export function reportGpuBytes(key: string, bytes: number) {
  if (bytes > 0) reportedBytes.set(key, bytes);
  else reportedBytes.delete(key);
}

// GPU timer queries (WebGL2 only)
type TimerExt = { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number };
let timerExt: TimerExt | null = null;
const pendingQueries: { query: WebGLQuery; sample: PerfSample }[] = [];

export function isPerfProbeEnabled(): boolean {
  if (enabled !== null) return enabled;
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    enabled = params.has("perf") || params.has("debug");
  } catch {
    enabled = false;
  }
  return enabled;
}

function attach(renderer: THREE.WebGLRenderer) {
  if (gl === renderer) return;
  detach();
  gl = renderer;
  renderer.info.autoReset = false;
  const ctx = renderer.getContext();
  timerExt =
    typeof WebGL2RenderingContext !== "undefined" && ctx instanceof WebGL2RenderingContext
      ? (ctx.getExtension("EXT_disjoint_timer_query_webgl2") as TimerExt | null)
      : null;

  // Record which scenes are rendered so texture memory can be estimated per frame set.
  const originalRender = renderer.render.bind(renderer);
  renderer.render = (scene, camera) => {
    renderedScenes.add(scene);
    originalRender(scene, camera);
  };
  restoreRender = () => {
    renderer.render = originalRender;
    renderer.info.autoReset = true;
  };
}

function detach() {
  restoreRender?.();
  restoreRender = null;
  gl = null;
  timerExt = null;
  pendingQueries.length = 0;
}

function pollQueries(ctx: WebGL2RenderingContext) {
  if (!timerExt) return;
  const disjoint = ctx.getParameter(timerExt.GPU_DISJOINT_EXT) as boolean;
  for (let i = pendingQueries.length - 1; i >= 0; i--) {
    const { query, sample } = pendingQueries[i];
    if (!ctx.getQueryParameter(query, ctx.QUERY_RESULT_AVAILABLE)) continue;
    if (!disjoint) sample.gpuMs = (ctx.getQueryParameter(query, ctx.QUERY_RESULT) as number) / 1e6;
    ctx.deleteQuery(query);
    pendingQueries.splice(i, 1);
  }
}

/** Wraps one advance(). Returns true if the frame was probed. */
export function probeFrame(renderer: THREE.WebGLRenderer | null, run: () => void) {
  if (!renderer || !isPerfProbeEnabled()) {
    run();
    return;
  }
  attach(renderer);
  const ctx = renderer.getContext() as WebGL2RenderingContext;
  renderer.info.reset();

  frameStart = performance.now();
  let query: WebGLQuery | null = null;
  if (timerExt && pendingQueries.length < 8) {
    query = ctx.createQuery();
    if (query) ctx.beginQuery(timerExt.TIME_ELAPSED_EXT, query);
  }

  run();

  if (query && timerExt) ctx.endQuery(timerExt.TIME_ELAPSED_EXT);
  const end = performance.now();

  const sample: PerfSample = {
    interval: lastFrameStart === 0 ? 0 : frameStart - lastFrameStart,
    cpuMs: end - frameStart,
    gpuMs: null,
    calls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
  };
  lastFrameStart = frameStart;
  if (query) pendingQueries.push({ query, sample });
  pollQueries(ctx);

  samples.push(sample);
  if (samples.length > CAPACITY) samples.shift();

  if (end - lastTextureScan > 1000) {
    lastTextureScan = end;
    textureMb = estimateTextureMb(renderedScenes);
    renderedScenes.clear();
  }
}

const BYTES_PER_TYPE: Partial<Record<THREE.TextureDataType, number>> = {
  [THREE.UnsignedByteType]: 1,
  [THREE.HalfFloatType]: 2,
  [THREE.FloatType]: 4,
};

function textureBytes(tex: THREE.Texture): number {
  const img = tex.image as { width?: number; height?: number; depth?: number } | undefined;
  const w = img?.width ?? 0;
  const h = img?.height ?? 0;
  const d = img?.depth ?? 1;
  if (!w || !h) return 0;
  const channels = tex.format === THREE.RedFormat ? 1 : tex.format === THREE.RGFormat ? 2 : 4;
  const bpc = BYTES_PER_TYPE[tex.type] ?? 1;
  const mips = tex.generateMipmaps && tex.minFilter !== THREE.LinearFilter && tex.minFilter !== THREE.NearestFilter ? 4 / 3 : 1;
  const faces = (tex as THREE.CubeTexture).isCubeTexture ? 6 : 1;
  return w * h * d * channels * bpc * mips * faces;
}

function collectTextures(value: unknown, out: Set<THREE.Texture>) {
  if (!value) return;
  if ((value as THREE.Texture).isTexture) {
    out.add(value as THREE.Texture);
  } else if (Array.isArray(value)) {
    for (const v of value) collectTextures(v, out);
  }
}

function estimateTextureMb(scenes: Set<THREE.Object3D>): number {
  const textures = new Set<THREE.Texture>();
  const targets = new Set<THREE.RenderTarget>();
  for (const scene of scenes) {
    const s = scene as THREE.Scene;
    collectTextures(s.background, textures);
    collectTextures(s.environment, textures);
    scene.traverse((obj) => {
      const light = obj as THREE.Light & { shadow?: THREE.LightShadow };
      if (light.isLight && light.castShadow && light.shadow?.map) targets.add(light.shadow.map);
      const mesh = obj as THREE.Mesh;
      const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
      for (const mat of mats) {
        for (const key in mat) collectTextures((mat as unknown as Record<string, unknown>)[key], textures);
        const uniforms = (mat as THREE.ShaderMaterial).uniforms;
        if (uniforms) for (const key in uniforms) collectTextures(uniforms[key]?.value, textures);
      }
    });
  }
  let bytes = 0;
  for (const tex of textures) bytes += textureBytes(tex);
  for (const rt of targets) {
    // Depth-based shadow map: color + depth ≈ 8 B/px
    bytes += rt.width * rt.height * 8;
  }
  return bytes / (1024 * 1024);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
  return sorted[idx];
}

const round = (n: number) => Math.round(n * 100) / 100;

export function summarizePerf(windowFrames = samples.length): PerfSummary {
  const win = samples.slice(-windowFrames);
  const intervals = win.map((s) => s.interval).filter((v) => v > 0).sort((a, b) => a - b);
  const cpu = win.map((s) => s.cpuMs).sort((a, b) => a - b);
  const gpu = win.map((s) => s.gpuMs).filter((v): v is number => v !== null).sort((a, b) => a - b);
  const calls = win.map((s) => s.calls);
  const tris = win.map((s) => s.triangles);
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const meanInterval = intervals.length ? sum(intervals) / intervals.length : 0;
  return {
    frames: win.length,
    fps: meanInterval ? round(1000 / meanInterval) : 0,
    intervalP50: round(percentile(intervals, 0.5)),
    intervalP95: round(percentile(intervals, 0.95)),
    cpuP50: round(percentile(cpu, 0.5)),
    cpuP95: round(percentile(cpu, 0.95)),
    gpuP50: gpu.length ? round(percentile(gpu, 0.5)) : null,
    gpuP95: gpu.length ? round(percentile(gpu, 0.95)) : null,
    callsAvg: calls.length ? Math.round(sum(calls) / calls.length) : 0,
    callsPeak: calls.length ? Math.max(...calls) : 0,
    trianglesAvg: tris.length ? Math.round(sum(tris) / tris.length) : 0,
    trianglesPeak: tris.length ? Math.max(...tris) : 0,
    textureMbEstimate: round(textureMb + [...reportedBytes.values()].reduce((a, b) => a + b, 0) / (1024 * 1024)),
    geometries: gl?.info.memory.geometries ?? 0,
    textures: gl?.info.memory.textures ?? 0,
    programs: gl?.info.programs?.length ?? 0,
  };
}

export function resetPerf() {
  samples.length = 0;
  lastFrameStart = 0;
}

if (typeof window !== "undefined") {
  (window as unknown as { __heroPerf?: unknown }).__heroPerf = {
    summary: summarizePerf,
    reset: resetPerf,
    samples: () => samples.slice(),
    enabled: isPerfProbeEnabled,
  };
}
