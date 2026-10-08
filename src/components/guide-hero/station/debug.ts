export interface GuideStationDebug {
  enabled: boolean;
  progress?: number;
  showRail: boolean;
  showSilhouetteBounds: boolean;
  fogDisabled: boolean;
  departureEnabled: boolean;
  drizzleMultiplier?: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseNumber(value: string | null, min: number, max: number) {
  if (value === null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clamp(parsed, min, max) : undefined;
}

/** Parses the documented `?debug=p=0.62,rail` syntax without global state. */
export function parseGuideStationDebug(search: string): GuideStationDebug {
  const query = new URLSearchParams(search);
  const compact = query.get("debug") ?? "";
  const compactParams = new URLSearchParams(compact.replaceAll(",", "&"));
  const hasFlag = (name: string) => compact.split(",").includes(name) || query.has(name);
  const progress = parseNumber(compactParams.get("p") ?? query.get("p"), 0, 1);
  const drizzleMultiplier = parseNumber(compactParams.get("drizzle") ?? query.get("drizzle"), 0, 1);
  const departureValue = compactParams.get("departure") ?? query.get("departure");

  return {
    enabled: compact.length > 0 || query.has("p"),
    progress,
    showRail: hasFlag("rail"),
    showSilhouetteBounds: hasFlag("sil"),
    fogDisabled: hasFlag("fogoff"),
    departureEnabled: departureValue !== "0",
    drizzleMultiplier,
  };
}
