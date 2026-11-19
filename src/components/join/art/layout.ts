// Shared placements for the art-pass campus (ground shadows and backdrop agree on them).
import type { Canopy, TreeSpec } from "./foliage";

/** Brick piers along the flanking walls (both sides). */
export const PERIMETER_PIERS = [-17.4, -14.0, -10.6, -7.2, 7.2, 10.6, 14.0, 17.4];

/** Dwarf-wall runs between piers: [x0, x1]. */
export const WALL_SEGMENTS: [number, number][] = [
  [4.42, 6.81],
  [7.59, 10.21],
  [10.99, 13.61],
  [14.39, 17.01],
  [17.79, 26],
].flatMap(([a, b]) => [
  [a, b],
  [-b, -a],
] as [number, number][]);

/** The avenue: two rows of trees behind the wall, plus a pair outside it. */
export const TREES: TreeSpec[] = [
  { position: [-6.5, 0, -6.8], height: 4.6, lean: 0.25, seed: 11 },
  { position: [6.4, 0, -7.3], height: 4.9, lean: -0.3, seed: 12 },
  { position: [-6.2, 0, -15.2], height: 5.0, lean: 0.2, seed: 13 },
  { position: [6.6, 0, -14.6], height: 4.7, lean: -0.15, seed: 14 },
  { position: [-6.6, 0, -23.1], height: 4.8, lean: 0.3, seed: 15 },
  { position: [6.3, 0, -22.8], height: 5.1, lean: -0.25, seed: 16 },
  { position: [-6.4, 0, -30.8], height: 4.6, lean: 0.1, seed: 17 },
  { position: [6.5, 0, -31.2], height: 4.8, lean: -0.2, seed: 18 },
  { position: [-12.5, 0, -2.6], height: 5.6, lean: 0.4, seed: 19 },
  { position: [13.2, 0, -3.4], height: 5.4, lean: -0.35, seed: 20 },
];

export function canopiesFor(trees: TreeSpec[], cards: number): Canopy[] {
  return trees.map((t, i) => ({
    center: [t.position[0] + t.lean, t.position[1] + t.height + 1.1, t.position[2]],
    radius: [2.6, 2.1, 2.5],
    cards,
    size: [0.85, 1.5],
    warmth: [0.2, 0.45, 0.3, 0.6, 0.35, 0.25, 0.5, 0.4, 0.15, 0.55][i % 10],
    seed: t.seed * 7 + 3,
  }));
}

/** Foreground branch reaching into the top-left of the opening frame. */
export const FOREGROUND_BRANCH: [number, number, number][] = [
  [-8.8, 7.6, 10.2],
  [-6.6, 6.2, 9.7],
  [-4.4, 5.0, 9.3],
  [-2.5, 4.25, 9.0],
];

export function foregroundCanopies(cards: number): Canopy[] {
  return [
    { center: [-5.6, 5.55, 9.5], radius: [1.0, 0.55, 0.6], cards, size: [0.55, 0.95], warmth: 0.45, seed: 91 },
    { center: [-3.6, 4.55, 9.2], radius: [0.9, 0.5, 0.5], cards, size: [0.5, 0.85], warmth: 0.55, seed: 92 },
    { center: [-2.4, 4.0, 9.0], radius: [0.6, 0.4, 0.4], cards: Math.round(cards * 0.6), size: [0.4, 0.7], warmth: 0.6, seed: 93 },
  ];
}
