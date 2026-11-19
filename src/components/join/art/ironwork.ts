// Wrought-iron geometry for the Join gate: square and twisted bars, collars, spear finials,
// C-scrolls and rings, each leaf merged into ONE geometry (one draw, one shadow caster).
// Pure functions (no React, no DOM) so they can be unit-tested; callers own and dispose
// the returned geometries.
import * as THREE from "three";
import { chamferedBox, latheProfile, mergeParts, type Part } from "@/gl/art/geometry";

export const LEAF_WIDTH = 3.3;
export const LEAF_HEIGHT = 4.4;
/** World y of a leaf's local origin (bottom of the leaf sits just above the threshold). */
export const LEAF_BASE_Y = 0.1;

const RAIL = { bottom: 0.12, dog: 0.5, lock: 1.75, ring: 2.05, top: 3.55 } as const;
const BAY_COUNT = 10;
const HINGE_X = 0.04;
const MEET_X = LEAF_WIDTH - 0.035;
const BAY = (MEET_X - HINGE_X) / BAY_COUNT;

/** Crest rail height: rises toward the meeting stile so the closed pair reads as one arch. */
export function crestY(x: number) {
  return 3.86 + 0.4 * Math.sin((THREE.MathUtils.clamp(x / LEAF_WIDTH, 0, 1) * Math.PI) / 2);
}

/** Square bar with a slow twist over its length (the classic forged "twisted picket"). */
export function twistedBar(size: number, length: number, turns: number, segments = 36) {
  const g = new THREE.BoxGeometry(size, length, size, 1, segments, 1);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const a = (y / length + 0.5) * turns * Math.PI * 2;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setXYZ(i, x * Math.cos(a) - z * Math.sin(a), y, x * Math.sin(a) + z * Math.cos(a));
  }
  g.computeVertexNormals();
  return g;
}

/** Round bar along a polyline/curve. */
function tube(points: THREE.Vector3[], radius: number, segments: number, radial = 6) {
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  return new THREE.TubeGeometry(curve, segments, radius, radial, false);
}

/** Points of a spiral curl about (cx, cy), starting at angle `start` on radius r and winding inward. */
function curl(cx: number, cy: number, r: number, turns: number, dir: 1 | -1, start = Math.PI, samples = 28) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const a = start + dir * t * turns * Math.PI * 2;
    const rr = r * (1 - 0.72 * t);
    pts.push(new THREE.Vector3(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0));
  }
  return pts;
}

/**
 * C-scroll of height `h` whose spine is at x = 0 and whose curls open toward +x
 * (`open` = -1 opens toward -x). Built in the leaf plane (z = 0).
 */
export function cScroll(h: number, open: 1 | -1, barRadius = 0.0105, segments = 60) {
  const r = Math.min(h * 0.26, 0.085);
  const yc = h / 2 - r;
  // Top curl: from the spine top, over and down into its eye (clockwise when opening right).
  const top = curl(r, yc, r, 0.95, -1);
  // Bottom curl: from the spine bottom, under and up (counter-clockwise when opening right).
  const bottom = curl(r, -yc, r, 0.95, 1);
  const pts = [...top.reverse(), ...bottom];
  if (open === -1) pts.forEach((p) => (p.x = -p.x));
  return tube(pts, barRadius, segments, 6);
}

/** Half (or partial) ring arc in the leaf plane. */
function ringArc(cx: number, cy: number, r: number, from: number, to: number, barRadius: number, segments = 40) {
  const pts: THREE.Vector3[] = [];
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0));
  }
  return tube(pts, barRadius, segments, 6);
}

/** Spear-head finial (turned), base at y = 0. */
export function spearFinial(scale = 1) {
  return latheProfile(
    [
      [0.02, 0],
      [0.027, 0.012],
      [0.027, 0.03],
      [0.015, 0.045],
      [0.013, 0.06],
      [0.034, 0.1],
      [0.031, 0.135],
      [0.014, 0.19],
      [0.0, 0.24],
    ].map(([r, y]) => [r * scale, y * scale] as [number, number]),
    { radialSegments: 10, smooth: true, samples: 20 }
  );
}

/** Turned ball finial with collar, base at y = 0. */
export function ballFinial(scale = 1) {
  return latheProfile(
    [
      [0.045, 0],
      [0.05, 0.02],
      [0.03, 0.045],
      [0.028, 0.06],
      [0.048, 0.085],
      [0.058, 0.115],
      [0.05, 0.15],
      [0.025, 0.172],
      [0.0, 0.18],
    ].map(([r, y]) => [r * scale, y * scale] as [number, number]),
    { radialSegments: 14, smooth: true, samples: 20 }
  );
}

const bar = (w: number, h: number, d: number, chamfer = 0.006) => chamferedBox(w, h, d, chamfer);

/** Reverses triangle winding of a non-indexed geometry in place (needed after mirroring). */
export function flipWinding(geometry: THREE.BufferGeometry) {
  if (geometry.index) throw new Error("flipWinding expects non-indexed geometry");
  for (const name of Object.keys(geometry.attributes)) {
    const attr = geometry.attributes[name] as THREE.BufferAttribute;
    const size = attr.itemSize;
    const arr = attr.array as Float32Array;
    for (let t = 0; t < attr.count; t += 3) {
      for (let k = 0; k < size; k++) {
        const a = (t + 1) * size + k;
        const b = (t + 2) * size + k;
        const tmp = arr[a];
        arr[a] = arr[b];
        arr[b] = tmp;
      }
    }
    attr.needsUpdate = true;
  }
  return geometry;
}

/** Mirrors across x = 0 and keeps triangles front-facing. */
export function mirrorX(geometry: THREE.BufferGeometry) {
  geometry.scale(-1, 1, 1);
  return flipWinding(geometry);
}

export interface LeafOptions {
  /** Detail level: 0 full, 1 lighter tessellation (mobile / governor). */
  quality?: number;
  /** Add the lock box and handle (only one leaf carries it). */
  lock?: boolean;
}

/**
 * One gate leaf in hinge-local space: x from 0 (hinge) to LEAF_WIDTH (meeting stile),
 * y from 0 to ~LEAF_HEIGHT + finials, iron centred on z = 0. Mirror for the right leaf.
 */
export function buildGateLeaf({ quality = 0, lock = false }: LeafOptions = {}) {
  const seg = quality > 0 ? 36 : 60;
  const parts: Part[] = [];
  const add = (geometry: THREE.BufferGeometry, position: [number, number, number], rotation?: [number, number, number]) =>
    parts.push({ geometry, position, rotation });

  // Stiles. The hinge stile is the heaviest bar and carries a ball finial.
  add(bar(0.075, LEAF_HEIGHT, 0.062, 0.008), [HINGE_X, LEAF_HEIGHT / 2, 0]);
  add(ballFinial(1.25), [HINGE_X, LEAF_HEIGHT, 0]);
  const meetTop = crestY(MEET_X) + 0.08;
  add(bar(0.065, meetTop, 0.058, 0.008), [MEET_X, meetTop / 2, 0]);
  add(ballFinial(1.1), [MEET_X, meetTop, 0]);

  // Hinge knuckles (pintles into the pier).
  for (const y of [0.55, 3.75]) {
    add(latheProfile([[0.046, 0], [0.05, 0.02], [0.05, 0.16], [0.046, 0.18]], { radialSegments: 14 }), [HINGE_X - 0.05, y, 0]);
    add(bar(0.09, 0.05, 0.03, 0.006), [HINGE_X - 0.02, y + 0.09, 0]);
  }

  // Flat rails between the stiles.
  const railLen = MEET_X - HINGE_X;
  const railMid = (HINGE_X + MEET_X) / 2;
  add(bar(railLen, 0.075, 0.05), [railMid, RAIL.bottom, 0]);
  add(bar(railLen, 0.05, 0.04), [railMid, RAIL.dog, 0]);
  add(bar(railLen, 0.075, 0.05), [railMid, RAIL.lock, 0]);
  add(bar(railLen, 0.05, 0.04), [railMid, RAIL.ring, 0]);
  add(bar(railLen, 0.065, 0.05), [railMid, RAIL.top, 0]);

  // Arched crest rail.
  const crestPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 16; i++) {
    const x = HINGE_X + (railLen * i) / 16;
    crestPts.push(new THREE.Vector3(x, crestY(x), 0));
  }
  add(tube(crestPts, 0.026, seg, 8), [0, 0, 0]);

  // Pickets: plain below the dog rail, twisted (alternate bars) in the lower panel,
  // plain above, through the crest to spear finials. Collars where the twist starts/ends.
  for (let k = 1; k < BAY_COUNT; k++) {
    const x = HINGE_X + k * BAY;
    const top = crestY(x) + 0.05;
    const twisted = k % 2 === 1;
    if (twisted) {
      add(bar(0.03, RAIL.dog - RAIL.bottom, 0.03, 0.004), [x, (RAIL.dog + RAIL.bottom) / 2, 0]);
      const tl = RAIL.lock - RAIL.dog;
      add(twistedBar(0.03, tl, 3, quality > 0 ? 18 : 30), [x, (RAIL.lock + RAIL.dog) / 2, 0]);
      add(bar(0.03, top - RAIL.lock, 0.03, 0.004), [x, (top + RAIL.lock) / 2, 0]);
      for (const y of [RAIL.dog + 0.06, RAIL.lock - 0.07]) add(bar(0.05, 0.035, 0.05, 0.006), [x, y, 0]);
    } else {
      add(bar(0.03, top - RAIL.bottom, 0.03, 0.004), [x, (top + RAIL.bottom) / 2, 0]);
    }
    add(spearFinial(1), [x, top, 0]);
  }

  // Dog bars: short round bars in each bay of the bottom zone, with a small knob.
  for (let k = 0; k < BAY_COUNT; k++) {
    const x = HINGE_X + (k + 0.5) * BAY;
    const h = RAIL.dog - RAIL.bottom;
    add(new THREE.CylinderGeometry(0.011, 0.011, h, 8, 1, true), [x, RAIL.bottom + h / 2, 0]);
  }

  // Ring band between the lock rail and the ring rail.
  const ringR = (RAIL.ring - RAIL.lock - 0.06) / 2;
  for (let k = 0; k < BAY_COUNT; k++) {
    const x = HINGE_X + (k + 0.5) * BAY;
    add(new THREE.TorusGeometry(ringR, 0.0105, 6, quality > 0 ? 18 : 28), [x, (RAIL.lock + RAIL.ring) / 2, 0]);
  }

  // Crest scrollwork: a back-to-back pair of C-scrolls in every bay, bound by a collar.
  for (let k = 0; k < BAY_COUNT; k++) {
    const xc = HINGE_X + (k + 0.5) * BAY;
    const y0 = RAIL.top + 0.04;
    const y1 = crestY(xc) - 0.03;
    const h = y1 - y0;
    if (h < 0.18) continue;
    const yc = (y0 + y1) / 2;
    add(cScroll(h, 1, 0.0095, seg), [xc + 0.008, yc, 0]);
    add(cScroll(h, -1, 0.0095, seg), [xc - 0.008, yc, 0]);
    add(bar(0.05, 0.04, 0.035, 0.006), [xc, yc, 0]);
  }

  // Half medallion at the meeting stile: closed, the two leaves complete a double ring.
  const medY = (RAIL.ring + RAIL.top) / 2;
  add(ringArc(MEET_X, medY, 0.56, Math.PI / 2, (3 * Math.PI) / 2, 0.018, seg), [0, 0, 0]);
  add(ringArc(MEET_X, medY, 0.36, Math.PI / 2, (3 * Math.PI) / 2, 0.013, seg), [0, 0, 0]);
  // Scroll pair inside the medallion, curling toward the centre.
  add(cScroll(0.62, 1, 0.0095, seg), [MEET_X - 0.22, medY, 0]);
  // Collars where the outer ring meets the pickets it crosses.
  for (let k = 1; k < BAY_COUNT; k++) {
    const x = HINGE_X + k * BAY;
    const dx = MEET_X - x;
    if (dx > 0.56 || dx < 0.05) continue;
    const dy = Math.sqrt(0.56 * 0.56 - dx * dx);
    for (const s of [1, -1]) add(bar(0.05, 0.035, 0.05, 0.006), [x, medY + s * dy, 0]);
  }

  if (lock) {
    add(chamferedBox(0.2, 0.3, 0.075, 0.012), [MEET_X - 0.13, RAIL.lock - 0.02, 0]);
    add(latheProfile([[0.022, 0], [0.026, 0.02], [0.012, 0.035], [0.012, 0.07], [0.03, 0.09], [0.0, 0.11]], { radialSegments: 12, smooth: true, samples: 12 }), [MEET_X - 0.13, RAIL.lock - 0.06, 0.035], [Math.PI / 2, 0, 0]);
    // Drop bolt sliding into the threshold.
    add(new THREE.CylinderGeometry(0.014, 0.014, 0.9, 8), [MEET_X - 0.07, 0.45, 0.04]);
    add(bar(0.06, 0.03, 0.04, 0.005), [MEET_X - 0.07, 0.8, 0.04]);
  }

  return mergeParts(parts);
}

/**
 * Fixed overthrow above the opening (world space): transom, the main arch carrying the
 * cast letters, a lower arch, the frieze of rings between them, and spindles with collars.
 */
export const ARCH = { centerY: 1.4, outer: 5.2, inner: 4.72, transomY: 5.15 } as const;
/** Bronze plaque on the transom (world space). */
export const PLAQUE = { y: 5.15, width: 4.8, height: 0.56 } as const;

export function buildOverthrow({ quality = 0 } = {}) {
  const seg = quality > 0 ? 48 : 80;
  const parts: Part[] = [];
  const add = (geometry: THREE.BufferGeometry, position: [number, number, number] = [0, 0, 0], rotation?: [number, number, number]) =>
    parts.push({ geometry, position, rotation });

  add(chamferedBox(7.0, 0.11, 0.09, 0.012), [0, ARCH.transomY, 0]);
  add(chamferedBox(6.8, 0.045, 0.05, 0.006), [0, ARCH.transomY + 0.12, 0]);

  const arc = (r: number, barRadius: number) => {
    const maxA = Math.acos((ARCH.transomY - 0.05 - ARCH.centerY) / r);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const a = -maxA + (2 * maxA * i) / 40;
      pts.push(new THREE.Vector3(Math.sin(a) * r, ARCH.centerY + Math.cos(a) * r, 0));
    }
    add(tube(pts, barRadius, seg, 8));
    return maxA;
  };
  arc(ARCH.outer, 0.05);
  const innerMax = arc(ARCH.inner, 0.03);

  // Ring frieze between the two arches.
  const mid = (ARCH.outer + ARCH.inner) / 2;
  const ringR = (ARCH.outer - ARCH.inner) / 2 - 0.045;
  const steps = 15;
  for (let i = 0; i < steps; i++) {
    const a = -innerMax * 0.92 + ((innerMax * 0.92 * 2) * (i + 0.5)) / steps;
    add(new THREE.TorusGeometry(ringR, 0.011, 6, quality > 0 ? 16 : 24), [Math.sin(a) * mid, ARCH.centerY + Math.cos(a) * mid, 0]);
  }

  // Spindles up to the lower arch (from the plaque top near the centre, from the transom
  // outside it), each with a collar at mid height.
  for (const x of [-2.5, -2.05, -1.45, -1.0, 1.0, 1.45, 2.05, 2.5]) {
    const top = ARCH.centerY + Math.sqrt(ARCH.inner * ARCH.inner - x * x);
    const bottom = Math.abs(x) < PLAQUE.width / 2 ? PLAQUE.y + PLAQUE.height / 2 : ARCH.transomY + 0.08;
    const h = top - bottom;
    if (h < 0.1) continue;
    add(new THREE.CylinderGeometry(0.013, 0.013, h, 8, 1, true), [x, bottom + h / 2, 0]);
    add(chamferedBox(0.045, 0.035, 0.045, 0.006), [x, bottom + h / 2, 0]);
  }
  // Lyre of back-to-back C-scrolls above the plaque.
  const lyreBottom = PLAQUE.y + PLAQUE.height / 2 + 0.02;
  const lyreTop = ARCH.centerY + ARCH.inner - 0.03;
  const lyreH = lyreTop - lyreBottom;
  add(cScroll(lyreH, 1, 0.012, seg), [0.012, (lyreTop + lyreBottom) / 2, 0]);
  add(cScroll(lyreH, -1, 0.012, seg), [-0.012, (lyreTop + lyreBottom) / 2, 0]);
  add(chamferedBox(0.06, 0.05, 0.045, 0.006), [0, (lyreTop + lyreBottom) / 2, 0]);

  return mergeParts(parts);
}
