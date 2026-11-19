// src/gl/art/vertexAO.ts
// Build-time per-vertex occlusion for hand-built props. No rays and no per-frame cost:
// the result is a vec2 attribute `aCavity` read by withSurfaceDetail (surface.ts).
//   x = occlusion (0 open → 1 fully occluded): creases, junctions, ground contact
//   y = convexity (0 flat → 1 exposed edge): where wear and highlights collect
// A geometry without the attribute reads (0, 0), i.e. "no effect".
import * as THREE from "three";

export interface VertexAOOptions {
  /** Concave creases, from mesh curvature. 0 disables. */
  cavity?: number;
  /** Exposed edges, from mesh curvature. 0 disables. */
  edges?: number;
  /** Darkening that fades upward from a ground plane (local-space y). */
  ground?: { y: number; height: number; strength?: number };
  /** Darkening around horizontal junctions (local y), e.g. where a shaft meets its base. */
  bands?: { y: number; width: number; strength?: number }[];
  /** Curvature smoothing passes (wider, softer creases). */
  smooth?: number;
}

const key = (x: number, y: number, z: number) =>
  `${Math.round(x * 2000)},${Math.round(y * 2000)},${Math.round(z * 2000)}`;

/**
 * Adds `aCavity` to `geometry` (in place) and returns it.
 *
 * Curvature is measured on positions welded across split vertices, so hard-edged meshes
 * (boxes, merged parts) still report their edges. Needs some tessellation to show a
 * gradient: bevelled boxes and lathe profiles work well, a 12-triangle box does not.
 */
export function bakeVertexAO(geometry: THREE.BufferGeometry, options: VertexAOOptions = {}) {
  const { cavity = 1, edges = 1, ground, bands = [], smooth = 1 } = options;
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  if (!geometry.attributes.normal) geometry.computeVertexNormals();
  const nor = geometry.attributes.normal as THREE.BufferAttribute;
  const count = pos.count;

  // Weld by position.
  const weldOf = new Int32Array(count);
  const weldIndex = new Map<string, number>();
  const wPos: number[] = [];
  const wNor: number[] = [];
  for (let i = 0; i < count; i++) {
    const k = key(pos.getX(i), pos.getY(i), pos.getZ(i));
    let w = weldIndex.get(k);
    if (w === undefined) {
      w = wPos.length / 3;
      weldIndex.set(k, w);
      wPos.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      wNor.push(0, 0, 0);
    }
    wNor[w * 3] += nor.getX(i);
    wNor[w * 3 + 1] += nor.getY(i);
    wNor[w * 3 + 2] += nor.getZ(i);
    weldOf[i] = w;
  }
  const welds = wPos.length / 3;
  for (let w = 0; w < welds; w++) {
    const l = Math.hypot(wNor[w * 3], wNor[w * 3 + 1], wNor[w * 3 + 2]) || 1;
    wNor[w * 3] /= l;
    wNor[w * 3 + 1] /= l;
    wNor[w * 3 + 2] /= l;
  }

  // Neighbours through triangles.
  const neighbours: Set<number>[] = Array.from({ length: welds }, () => new Set<number>());
  const link = (a: number, b: number) => {
    if (a === b) return;
    neighbours[a].add(b);
    neighbours[b].add(a);
  };
  const index = geometry.index;
  const triCount = (index ? index.count : count) / 3;
  for (let t = 0; t < triCount; t++) {
    const a = weldOf[index ? index.getX(t * 3) : t * 3];
    const b = weldOf[index ? index.getX(t * 3 + 1) : t * 3 + 1];
    const c = weldOf[index ? index.getX(t * 3 + 2) : t * 3 + 2];
    link(a, b);
    link(b, c);
    link(a, c);
  }

  // Signed curvature: mean of (neighbour − vertex) projected on the normal, normalised by
  // edge length. Positive = neighbours rise above the tangent plane = concave crease.
  let curvature = new Float32Array(welds);
  for (let w = 0; w < welds; w++) {
    const ns = neighbours[w];
    if (ns.size === 0) continue;
    let sum = 0;
    for (const n of ns) {
      const dx = wPos[n * 3] - wPos[w * 3];
      const dy = wPos[n * 3 + 1] - wPos[w * 3 + 1];
      const dz = wPos[n * 3 + 2] - wPos[w * 3 + 2];
      const len = Math.hypot(dx, dy, dz) || 1;
      sum += (dx * wNor[w * 3] + dy * wNor[w * 3 + 1] + dz * wNor[w * 3 + 2]) / len;
    }
    curvature[w] = sum / ns.size;
  }
  for (let pass = 0; pass < smooth; pass++) {
    const next = new Float32Array(welds);
    for (let w = 0; w < welds; w++) {
      let sum = curvature[w] * 2;
      let weight = 2;
      for (const n of neighbours[w]) {
        sum += curvature[n];
        weight += 1;
      }
      next[w] = sum / weight;
    }
    curvature = next;
  }

  const out = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const c = curvature[weldOf[i]];
    const y = pos.getY(i);
    let occlusion = THREE.MathUtils.clamp(c * 2.2, 0, 1) * cavity;
    if (ground) {
      const t = THREE.MathUtils.clamp(1 - (y - ground.y) / ground.height, 0, 1);
      occlusion += t * t * (ground.strength ?? 0.7);
    }
    for (const band of bands) {
      const d = Math.abs(y - band.y) / band.width;
      if (d < 1) occlusion += (1 - d) * (1 - d) * (band.strength ?? 0.6);
    }
    out[i * 2] = THREE.MathUtils.clamp(occlusion, 0, 1);
    out[i * 2 + 1] = THREE.MathUtils.clamp(-c * 2.2, 0, 1) * edges;
  }
  geometry.setAttribute("aCavity", new THREE.BufferAttribute(out, 2));
  return geometry;
}
