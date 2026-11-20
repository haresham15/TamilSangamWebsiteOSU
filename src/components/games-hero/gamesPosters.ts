/** Static stills of the Games hero (Lite, reduced motion, cold #arcade visits, load failure). */
export const GAMES_POSTERS = [
  { name: "establishing", title: "The standoff", p: 0.1 },
  { name: "closeup", title: "A closer look", p: 0.42 },
  { name: "blast", title: "Beach blast", p: 0.72 },
  { name: "exit", title: "The Sangam Arcade", p: 0.93 },
] as const;

/** Beat index for scroll progress p (matches the poster beats above). */
export const posterBeatAt = (p: number) => p < 0.22 ? 0 : p < 0.52 ? 1 : p < 0.85 ? 2 : 3;

export function posterUrl(index: number, portrait: boolean): string {
  const poster = GAMES_POSTERS[Math.max(0, Math.min(GAMES_POSTERS.length - 1, Math.trunc(index)))];
  return `/games/posters/${portrait ? "portrait-" : ""}${poster.name}.webp`;
}
