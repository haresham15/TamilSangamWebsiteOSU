const pacing = [[0, 0], [0.12, 0.22], [0.38, 0.52], [0.54, 0.64], [0.86, 0.85], [1, 1]] as const;
const speeds = pacing.slice(1).map(([scroll, scene], index) =>
  (scene - pacing[index][1]) / (scroll - pacing[index][0]));
const tangents = pacing.map((_, index) => index === 0 ? speeds[0] : index === pacing.length - 1
  ? speeds[index - 1] : 2 * speeds[index - 1] * speeds[index] / (speeds[index - 1] + speeds[index]));
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const t = clamp(value);
  return clamp(t * t * t * (t * (t * 6 - 15) + 10));
};

/** Retime document scrolling without changing the calibrated shot or stopping at beat boundaries. */
export function mapGamesScrollProgress(progress: number): number {
  const scroll = clamp(progress);
  let index = 0;
  while (scroll > pacing[index + 1][0]) index++;
  const [start, sceneStart] = pacing[index];
  const [end, sceneEnd] = pacing[index + 1];
  const width = end - start;
  const t = (scroll - start) / width;
  const t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * sceneStart + (t3 - 2 * t2 + t) * width * tangents[index]
    + (-2 * t3 + 3 * t2) * sceneEnd + (t3 - t2) * width * tangents[index + 1];
}

export function getGamesCaptionWeights(progress: number): number[] {
  const transitions = [0.22, 0.52, 0.85].map(boundary => ease((progress - boundary + 0.025) / 0.05));
  return [1 - transitions[0], transitions[0] - transitions[1], transitions[1] - transitions[2], transitions[2]];
}

export function getGamesExitOpacity(progress: number): number {
  return ease((progress - 0.94) / 0.06);
}
