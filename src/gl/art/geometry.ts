// src/gl/art/geometry.ts
// Shared geometry helpers for the hero art pass. Everything here returns a plain
// BufferGeometry the caller owns: memoise it and dispose it (useDisposeOnUnmount).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type Vec3 = [number, number, number];

/** Box with rounded edges. `segments` 1 gives a hard chamfer, 3+ a soft bevel. */
export function roundedBox(width: number, height: number, depth: number, radius = 0.03, segments = 3) {
  const r = Math.min(radius, width / 2, height / 2, depth / 2);
  return new RoundedBoxGeometry(width, height, depth, segments, r);
}

/** Single-facet chamfer: reads as cut stone or milled metal rather than a soft toy edge. */
export function chamferedBox(width: number, height: number, depth: number, chamfer = 0.02) {
  return roundedBox(width, height, depth, chamfer, 1);
}

/**
 * Turned profile (columns, lamp bodies, finials, vessels). `points` are [radius, y] pairs
 * from bottom to top. With `smooth`, the outline is resampled along a Catmull-Rom spline so
 * a handful of control points gives a continuous moulding; without it the points are used
 * as hard arrises.
 */
export function latheProfile(
  points: [number, number][],
  { radialSegments = 32, smooth = false, samples = 48, capped = true } = {}
) {
  let outline = points.map(([r, y]) => new THREE.Vector2(Math.max(r, 0), y));
  if (smooth && outline.length > 2) {
    const curve = new THREE.SplineCurve(outline);
    outline = curve.getPoints(samples).map((p) => new THREE.Vector2(Math.max(p.x, 0), p.y));
  }
  if (capped) {
    const first = outline[0];
    const last = outline[outline.length - 1];
    if (first.x > 0) outline.unshift(new THREE.Vector2(0, first.y));
    if (last.x > 0) outline.push(new THREE.Vector2(0, last.y));
  }
  const geometry = new THREE.LatheGeometry(outline, radialSegments);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Column shaft with concave flutes (or convex reeds when `depth` is negative) and optional
 * entasis, the slight swelling that stops a tall shaft looking like a pipe.
 */
export function flutedShaft({
  radiusBottom = 0.28,
  radiusTop = 0.24,
  height = 2.8,
  flutes = 16,
  depth = 0.018,
  entasis = 0.012,
  radialSegments = 96,
  heightSegments = 12,
} = {}) {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, true);
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 1e-6) continue;
    const angle = Math.atan2(z, x);
    const t = y / height + 0.5; // 0 bottom → 1 top
    // Flutes die out near both ends, as carved shafts do.
    const run = THREE.MathUtils.smoothstep(t, 0.04, 0.12) * (1 - THREE.MathUtils.smoothstep(t, 0.88, 0.96));
    const groove = Math.pow(Math.abs(Math.cos((angle * flutes) / 2)), 1.6);
    const swell = Math.sin(Math.PI * t) * entasis;
    const nr = r - depth * (1 - groove) * run + swell;
    pos.setXYZ(i, (x / r) * nr, y, (z / r) * nr);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Regular n-sided prism shaft with chamfer-like arrises (Chola pillars are often 8/16-sided). */
export function polygonalShaft(radius: number, height: number, sides = 8, heightSegments = 6) {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, sides, heightSegments, true).toNonIndexed();
  geometry.computeVertexNormals();
  return geometry;
}

export interface Part {
  geometry: THREE.BufferGeometry;
  position?: Vec3;
  rotation?: Vec3;
  scale?: Vec3 | number;
}

const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const E = new THREE.Euler();
const P = new THREE.Vector3();
const S = new THREE.Vector3();

/**
 * Bakes parts into one geometry (one draw, one material). Source geometries are disposed.
 * All parts are converted to non-indexed position/normal/uv so differing layouts merge.
 */
export function mergeParts(parts: Part[]): THREE.BufferGeometry {
  const baked = parts.map(({ geometry, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
    const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    for (const name of Object.keys(g.attributes)) {
      if (name !== "position" && name !== "normal" && name !== "uv") g.deleteAttribute(name);
    }
    if (!g.attributes.uv) {
      g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    }
    if (!g.attributes.normal) g.computeVertexNormals();
    P.set(...position);
    Q.setFromEuler(E.set(...rotation));
    if (typeof scale === "number") S.setScalar(scale);
    else S.set(...scale);
    g.applyMatrix4(M.compose(P, Q, S));
    geometry.dispose();
    return g;
  });
  const merged = mergeGeometries(baked, false);
  baked.forEach((g) => g.dispose());
  if (!merged) throw new Error("mergeParts: geometries could not be merged");
  return merged;
}

/** Deterministic PRNG (mulberry32) so jitter is identical on server, client and re-mounts. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Transform {
  position: Vec3;
  rotation?: Vec3;
  scale?: Vec3 | number;
}

/**
 * Breaks perfect repetition in an instanced set: small offsets, yaw and scale differences.
 * Amounts are maxima (±). Keep them small for architecture, larger for organic scatter.
 */
export function jitterTransforms<T extends Transform>(
  transforms: T[],
  { seed = 1, position = [0, 0, 0] as Vec3, yaw = 0, tilt = 0, scale = 0 } = {}
): (T & { rotation: Vec3; scale: Vec3 })[] {
  const rand = seeded(seed);
  const r = () => rand() * 2 - 1;
  return transforms.map((t) => {
    const base = t.rotation ?? [0, 0, 0];
    const s = 1 + r() * scale;
    const baseScale: Vec3 = typeof t.scale === "number" ? [t.scale, t.scale, t.scale] : (t.scale ?? [1, 1, 1]);
    return {
      ...t,
      position: [t.position[0] + r() * position[0], t.position[1] + r() * position[1], t.position[2] + r() * position[2]] as Vec3,
      rotation: [base[0] + r() * tilt, base[1] + r() * yaw, base[2] + r() * tilt] as Vec3,
      scale: [baseScale[0] * s, baseScale[1] * s, baseScale[2] * s] as Vec3,
    };
  });
}

const DUMMY = new THREE.Object3D();

/** Writes transforms into an InstancedMesh and refreshes its bounds. */
export function applyInstanceTransforms(mesh: THREE.InstancedMesh, transforms: Transform[]) {
  transforms.forEach(({ position, rotation, scale }, i) => {
    DUMMY.position.set(...position);
    DUMMY.rotation.set(...(rotation ?? [0, 0, 0]));
    if (typeof scale === "number") DUMMY.scale.setScalar(scale);
    else DUMMY.scale.set(...(scale ?? [1, 1, 1]));
    DUMMY.updateMatrix();
    mesh.setMatrixAt(i, DUMMY.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}
