export const gamesDiagnosticsEnabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

type Stage = "upload" | "foreground" | "mask" | "foregroundBlurX" | "foregroundBlurY" | "maskBlurX" | "maskBlurY" | "composite";
type Clock = "cpu" | "gpu";

export class GamesRenderDiagnostics {
  private frames: number[] = [];
  private completedComposites = 0;
  private plateAdvances = 0;
  private lastDraw: { at: number; index: number; requested: number; displayed: number } | null = null;
  private stages: Partial<Record<Stage, Partial<Record<Clock, { count: number; values: number[] }>>>> = {};
  private summarizedAt = -Infinity;
  private stageSummary: Record<string, Record<string, { count: number; retained: number; lastMs: number | undefined; p95Ms: number; maxMs: number | undefined }>> = {};
  memory: Record<string, number | string> = {};
  gpu: "unavailable" | "available" | "disjoint" = "unavailable";

  complete(at: number, index: number, requested: number, displayed: number) {
    this.completedComposites++;
    if (this.lastDraw?.index !== index) this.plateAdvances++;
    this.lastDraw = { at, index, requested, displayed };
    this.frames.push(at);
    while (this.frames.length && this.frames[0] <= at - 1000) this.frames.shift();
    if (this.frames.length > 512) this.frames.shift();
  }

  record(stage: Stage, clock: Clock, ms: number) {
    const clocks = this.stages[stage] ??= {};
    const samples = clocks[clock] ??= { count: 0, values: [] };
    samples.count++;
    samples.values.push(ms);
    if (samples.values.length > 180) samples.values.shift();
  }

  snapshot(now: number) {
    if (now - this.summarizedAt >= 100) {
      this.summarizedAt = now;
      this.stageSummary = Object.fromEntries(Object.entries(this.stages).map(([stage, clocks]) => [stage,
      Object.fromEntries(Object.entries(clocks).map(([clock, samples]) => {
        const sorted = [...samples.values].sort((a, b) => a - b);
        return [clock, { count: samples.count, retained: sorted.length,
          lastMs: samples.values.at(-1), p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1], maxMs: sorted.at(-1) }];
      })),
      ]));
    }
    return { completedComposites: this.completedComposites, plateAdvances: this.plateAdvances,
      compositesLastSecond: this.frames.filter(at => at > now - 1000).length,
      compositeTimes: [...this.frames], lastDraw: this.lastDraw, stages: this.stageSummary, memory: this.memory, gpu: this.gpu,
      timing: "CPU submission and asynchronous GPU elapsed milliseconds; not presentation timestamps" };
  }
}

interface TimerExtension { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number }

export class GamesGpuTimer {
  private extension: TimerExtension | null;
  private pending: { query: WebGLQuery; stage: Stage }[] = [];
  private active: { query: WebGLQuery; stage: Stage } | null = null;

  constructor(private gl: WebGL2RenderingContext, private diagnostics: GamesRenderDiagnostics) {
    this.extension = gl.getExtension("EXT_disjoint_timer_query_webgl2");
    if (this.extension) diagnostics.gpu = "available";
  }

  poll() {
    if (!this.extension) return;
    const disjoint = this.gl.getParameter(this.extension.GPU_DISJOINT_EXT);
    if (disjoint) this.diagnostics.gpu = "disjoint";
    this.pending = this.pending.filter(({ query, stage }) => {
      if (!disjoint && !this.gl.getQueryParameter(query, this.gl.QUERY_RESULT_AVAILABLE)) return true;
      if (!disjoint) this.diagnostics.record(stage, "gpu", this.gl.getQueryParameter(query, this.gl.QUERY_RESULT) / 1e6);
      this.gl.deleteQuery(query);
      return false;
    });
  }

  begin(stage: Stage) {
    const extension = this.extension;
    if (!extension || this.active || this.pending.length >= 32 || this.gl.getQuery(extension.TIME_ELAPSED_EXT, this.gl.CURRENT_QUERY)) return;
    const query = this.gl.createQuery();
    if (!query) return;
    this.active = { query, stage };
    this.gl.beginQuery(extension.TIME_ELAPSED_EXT, query);
  }

  end() {
    if (!this.active || !this.extension) return;
    this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);
    this.pending.push(this.active);
    this.active = null;
  }

  dispose() {
    this.end();
    for (const { query } of this.pending) this.gl.deleteQuery(query);
    this.pending = [];
  }
}
