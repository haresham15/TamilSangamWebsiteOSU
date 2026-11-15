// Pure instance layout for the Chola corridor (no three.js objects, so it is unit-testable).

export const UNIT_LENGTH = 5.0; // 5 m per modular arch/pillar unit
export const POOL_SIZE = 7; // units along the colonnade (z = 30 → 0)
export const AISLE_WIDTH = 3.8; // stone aisle between pillars
export const PILLAR_HEIGHT = 4.2;

export type Vec3 = [number, number, number];

export type ArchGeometryKey =
  | "floor"
  | "inlay"
  | "groove"
  | "plinth"
  | "shaft"
  | "capital"
  | "bracket"
  | "crossBeam"
  | "ceiling"
  | "joist"
  | "opening";

export type ArchMaterialKey =
  | "floor"
  | "inlay"
  | "darkGroove"
  | "plinth"
  | "shaft"
  | "capital"
  | "corbel"
  | "crossBeam"
  | "ceiling"
  | "joist"
  | "opening";

export interface ArchPart {
  geometry: ArchGeometryKey;
  material: ArchMaterialKey;
  /** Offsets inside one unit (unit origin at x=0, y=0, z=segment z). */
  offsets: Vec3[];
  castShadow?: boolean;
  receiveShadow?: boolean;
}

const H = AISLE_WIDTH / 2;

/** One entry per InstancedMesh: same placements the per-mesh CholaModularSegment used. */
export const ARCH_PARTS: ArchPart[] = [
  { geometry: "floor", material: "floor", offsets: [[0, -0.15, 0]], receiveShadow: true },
  { geometry: "inlay", material: "inlay", offsets: [[0, 0.005, 0]], receiveShadow: true },
  { geometry: "groove", material: "darkGroove", offsets: [-1.8, -0.6, 0.6, 1.8].map((z) => [0, 0.012, z] as Vec3) },
  { geometry: "plinth", material: "plinth", offsets: [[-H, 0.3, 0], [H, 0.3, 0]], castShadow: true, receiveShadow: true },
  { geometry: "shaft", material: "shaft", offsets: [[-H, 2.0, 0], [H, 2.0, 0]], castShadow: true, receiveShadow: true },
  { geometry: "capital", material: "capital", offsets: [[-H, 3.5, 0], [H, 3.5, 0]], castShadow: true },
  { geometry: "bracket", material: "corbel", offsets: [[-H + 0.2, 3.75, 0], [H - 0.2, 3.75, 0]], castShadow: true },
  { geometry: "crossBeam", material: "crossBeam", offsets: [[0, PILLAR_HEIGHT - 0.2, 0]], castShadow: true, receiveShadow: true },
  { geometry: "ceiling", material: "ceiling", offsets: [[0, PILLAR_HEIGHT + 0.3, 0]], receiveShadow: true },
  { geometry: "joist", material: "joist", offsets: [[-H, PILLAR_HEIGHT - 0.1, 0], [H, PILLAR_HEIGHT - 0.1, 0]] },
  { geometry: "opening", material: "opening", offsets: [[-H - 1.2, 2.0, 0], [H + 1.2, 2.0, 0]] },
];

export const segmentZ = (unit: number) => 30 - unit * UNIT_LENGTH;

/** World positions for one part across every unit. */
export function partPositions(part: ArchPart): Vec3[] {
  const out: Vec3[] = [];
  for (let u = 0; u < POOL_SIZE; u++) {
    const z0 = segmentZ(u);
    for (const [x, y, z] of part.offsets) out.push([x, y, z0 + z]);
  }
  return out;
}

/** Lamp origins: left lamp on the inside face of the left pillar, right lamp mirrored. Index = unit*2 (+1 right). */
export function lampPositions(): Vec3[] {
  const out: Vec3[] = [];
  for (let u = 0; u < POOL_SIZE; u++) {
    const z = segmentZ(u);
    out.push([-H + 0.36, 1.9, z], [H - 0.36, 1.9, z]);
  }
  return out;
}

/**
 * The two lamps that get real point lights: nearest to the camera, preferring lamps
 * ahead of it (same weighting as the previous per-lamp assignment).
 */
export function nearestLampPair(camZ: number): [number, number] {
  let best = [-1, -1];
  let bestD = [Infinity, Infinity];
  for (let u = 0; u < POOL_SIZE; u++) {
    const zDiff = segmentZ(u) - camZ;
    const d = zDiff > 1.5 ? Math.abs(zDiff) + 6.0 : Math.abs(zDiff);
    for (const idx of [u * 2, u * 2 + 1]) {
      if (d < bestD[0]) {
        bestD = [d, bestD[0]];
        best = [idx, best[0]];
      } else if (d < bestD[1]) {
        bestD[1] = d;
        best[1] = idx;
      }
    }
  }
  return [best[0], best[1]];
}
