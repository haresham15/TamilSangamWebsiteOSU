// Gopuram ascent set for the About hero: five tala gateways on stepped granite terraces,
// a stacked gopuram tower in the haze beyond, and the bronze Brahma Mudi medallion that
// hangs in each doorway. Pure geometry/layout (no React, no GPU uploads): every builder
// returns a BufferGeometry the caller owns, memoises and disposes.
import * as THREE from "three";
import { chamferedBox, roundedBox, latheProfile, mergeParts, seeded, type Part, type Vec3, type Transform } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// ---------------------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------------------
export const TALA_COUNT = 5;
export const TALA_SPACING = 20;
export const TALA_RISE = 2.4;
/** Door opening of a tala gateway (local units, base at the terrace top). */
export const OPENING_HALF = 4.6;
export const OPENING_HEIGHT = 10.6;
const MODULE_HALF = 8.2;
const MODULE_DEPTH = 3.2;
/** Brahma Mudi medallion hangs in the upper doorway, above the processional path. */
export const RING_HEIGHT = 6.9;
export const RING_SCALE = 0.55;
/** Platform i spans z ∈ [zi − PLATFORM_BACK, zi + PLATFORM_FRONT]; stairs fill the gap. */
const PLATFORM_FRONT = 7;
const PLATFORM_BACK = 9;
const STAIR_RUN = TALA_SPACING - PLATFORM_FRONT - PLATFORM_BACK; // 4 m
const STEPS = 8;
/** Distant tower that the gateways lead to. */
export const TOWER_Z = -150;
const TOWER_BASE_SCALE = 1.4;
export const TOWER_TIERS = 7;

export const talaZ = (i: number) => -i * TALA_SPACING;
export const talaY = (i: number) => i * TALA_RISE;
const TOWER_BASE_Y = talaY(TALA_COUNT - 1);

/** Terrace walking height under world z (stairs interpolated linearly). */
export function terraceHeight(z: number) {
  for (let i = 0; i < TALA_COUNT; i++) {
    const zi = talaZ(i);
    if (z >= zi - PLATFORM_BACK) return talaY(i);
    if (i < TALA_COUNT - 1 && z >= zi - PLATFORM_BACK - STAIR_RUN) {
      return THREE.MathUtils.lerp(talaY(i), talaY(i + 1), (zi - PLATFORM_BACK - z) / STAIR_RUN);
    }
  }
  return talaY(TALA_COUNT - 1);
}

const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Card ranges in GopuramZScroll: chapter k is shown for p ∈ [0.16k, 0.16k + 0.16]. */
export const CHAPTER_SPAN = 0.16;

/**
 * Scroll → camera beat. `pos` is the tala the camera is held in front of (fractional while
 * travelling); the camera holds for ±30% of a chapter around each chapter's centre and
 * travels (eased) through the doorway in between. `exit` ramps 0 → 1 over p 0.80 → 1.
 */
export function cameraBeat(p: number) {
  const c = clamp01(p / CHAPTER_SPAN / TALA_COUNT) * TALA_COUNT - 0.5;
  let pos: number;
  if (c <= 0) pos = 0;
  else if (c >= TALA_COUNT - 1) pos = TALA_COUNT - 1;
  else {
    const k = Math.floor(c);
    pos = k + smootherstep(clamp01((c - k - 0.3) / 0.4));
  }
  return { pos, exit: smootherstep(clamp01((p - 0.8) / 0.2)) };
}

/** Gateway transforms: slight taper as the procession climbs; seeded yaw jitter. */
export function portalTransforms(): Transform[] {
  const rand = seeded(11);
  return Array.from({ length: TALA_COUNT }, (_, i) => ({
    position: [0, talaY(i), talaZ(i)] as Vec3,
    rotation: [0, (rand() - 0.5) * 0.012, 0] as Vec3,
    scale: 1 - i * 0.03,
  }));
}

/** Stacked tiers of the distant gopuram (same module, recessed and shrinking). */
export function towerTransforms(tiers = TOWER_TIERS) {
  const out: Transform[] = [];
  let y = TOWER_BASE_Y;
  let z = TOWER_Z;
  let s = TOWER_BASE_SCALE;
  for (let k = 0; k < tiers; k++) {
    out.push({ position: [0, y, z], scale: [s, s * (k === 0 ? 1 : 0.82), s] });
    y += (k === 0 ? 12.95 : 12.95 * 0.82) * s;
    z -= 1.9 * s;
    s *= 0.85;
  }
  return { tiers: out, crown: { position: [0, y, z] as Vec3, scale: s * 1.08 } };
}

/** The last gateway carries a crown so the climb ends under a real gopuram top. */
export function crownTransforms(tiers = TOWER_TIERS): Transform[] {
  const last = portalTransforms()[TALA_COUNT - 1];
  const ls = last.scale as number;
  const { crown } = towerTransforms(tiers);
  return [
    { position: [last.position[0], last.position[1] + 12.95 * ls, last.position[2] - 0.6], scale: ls * 0.92 },
    crown,
  ];
}

// ---------------------------------------------------------------------------------------
// Profiles and ornaments
// ---------------------------------------------------------------------------------------

/** Kapota: the heavy rolled Dravidian cornice. Profile in (forward, up), 1 m tall. */
function kapotaShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0, 1.0);
  s.lineTo(0.26, 1.0);
  s.quadraticCurveTo(0.96, 0.98, 0.88, 0.3);
  s.lineTo(0.8, 0.12);
  s.quadraticCurveTo(0.52, 0.02, 0.16, 0.06);
  s.lineTo(0, 0);
  return s;
}

/** Cornice run along x, front face of the profile at z = 0 growing toward +z. */
function kapotaFront(length: number, scale = 1) {
  const g = new THREE.ExtrudeGeometry(kapotaShape(), { depth: length, bevelEnabled: false, curveSegments: 7 });
  g.rotateY(-Math.PI / 2);
  g.translate(length / 2, 0, 0);
  if (scale !== 1) g.scale(1, scale, scale);
  return g;
}

/** Cornice return along a side face (s = ±1 faces ±x), spanning z ∈ [−depth, 0]. */
function kapotaSide(depth: number, side: 1 | -1, scale = 1) {
  const g = new THREE.ExtrudeGeometry(kapotaShape(), { depth, bevelEnabled: false, curveSegments: 7 });
  if (scale !== 1) g.scale(scale, scale, 1);
  if (side === 1) g.translate(0, 0, -depth);
  else g.rotateY(Math.PI);
  return g;
}

/** Kudu: horseshoe arch ornament with a finial, facing +z, centred on its arch. */
function kudu(radius = 0.34, thickness = 0.1) {
  const a = (25 * Math.PI) / 180;
  const ro = radius;
  const ri = radius - thickness;
  const leg = radius * 0.9;
  const xo = ro * Math.cos(a);
  const xi = ri * Math.cos(a);
  const s = new THREE.Shape();
  s.moveTo(xo, -leg);
  s.lineTo(xo, -ro * Math.sin(a));
  s.absarc(0, 0, ro, -a, Math.PI + a, false);
  s.lineTo(-xo, -leg);
  s.lineTo(-xi, -leg);
  s.lineTo(-xi, -ri * Math.sin(a));
  s.absarc(0, 0, ri, Math.PI + a, -a, true);
  s.lineTo(xi, -leg);
  s.closePath();
  const ring = new THREE.ExtrudeGeometry(s, {
    depth: thickness * 0.9,
    bevelEnabled: true,
    bevelThickness: thickness * 0.22,
    bevelSize: thickness * 0.18,
    bevelSegments: 1,
    curveSegments: 9,
  });
  ring.translate(0, 0, -thickness * 0.45);
  // Shikha: the flame finial on the arch crown.
  const finial = latheProfile(
    [[0.0, 0], [0.42, 0.05], [0.36, 0.35], [0.12, 0.7], [0.0, 1.0]].map(([r, y]) => [r * radius * 0.42, y * radius * 0.8]) as [number, number][],
    { radialSegments: 8, smooth: true, samples: 8 }
  );
  return mergeParts([
    { geometry: ring },
    { geometry: finial, position: [0, ro + radius * 0.02, 0] },
  ]);
}

/** Kalasam: the gilt pot finial. Base at y = 0, 1 m tall. */
export function kalasamGeometry(radialSegments = 16) {
  return latheProfile(
    [
      [0.3, 0], [0.34, 0.06], [0.22, 0.13], [0.36, 0.28], [0.42, 0.44], [0.34, 0.6],
      [0.14, 0.68], [0.17, 0.74], [0.08, 0.8], [0.06, 0.92], [0.0, 1.0],
    ],
    { radialSegments, smooth: true, samples: 28 }
  );
}

/** Kuta: square miniature shrine with an octagonal dome, base at y = 0. */
function kuta(add: (g: THREE.BufferGeometry, p: Vec3, r?: Vec3) => void, x: number, y: number, z: number, w = 1.3) {
  add(chamferedBox(w, 0.95, w, 0.04), [x, y + 0.475, z]);
  add(chamferedBox(w * 0.78, 0.5, w * 0.78, 0.03), [x, y + 1.2, z]);
  add(chamferedBox(w * 1.2, 0.16, w * 1.2, 0.04), [x, y + 1.0, z]);
  add(
    latheProfile([[0.0, 0], [0.62, 0], [0.66, 0.08], [0.6, 0.38], [0.36, 0.66], [0.12, 0.8], [0.0, 0.84]], { radialSegments: 8, smooth: true, samples: 14 })
      .rotateY(Math.PI / 8)
      .scale(w * 0.75, w * 0.7, w * 0.75),
    [x, y + 1.45, z]
  );
}

/** Shala: oblong miniature shrine with a barrel (wagon) roof and a kudu gable facing +z. */
function shala(add: (g: THREE.BufferGeometry, p: Vec3, r?: Vec3) => void, x: number, y: number, z: number, len = 2.4) {
  const d = 1.2;
  add(chamferedBox(len, 0.95, d, 0.04), [x, y + 0.475, z]);
  add(chamferedBox(len * 1.08, 0.16, d * 1.22, 0.04), [x, y + 1.0, z]);
  add(chamferedBox(len * 0.92, 0.18, d * 0.9, 0.03), [x, y + 1.17, z]);
  const r = d * 0.46;
  const roof = new THREE.CylinderGeometry(r, r, len * 0.96, 12, 1, false, 0, Math.PI);
  roof.rotateZ(Math.PI / 2);
  add(roof, [x, y + 1.26, z]);
  add(kudu(r * 0.62, 0.08), [x, y + 1.3, z + r + 0.02]);
}

// ---------------------------------------------------------------------------------------
// Tala gateway module (stucco), base centre at the origin, front face at z = 0.
// ---------------------------------------------------------------------------------------
type AddPart = (geometry: THREE.BufferGeometry, position: Vec3, rotation?: Vec3) => void;
const ZC = -MODULE_DEPTH / 2;
const PIER_W = MODULE_HALF - OPENING_HALF;
const HARA_Y = OPENING_HEIGHT + 2.05;
const TALA_AO = {
  ground: { y: 0, height: 1.6, strength: 0.55 },
  bands: [
    { y: 1.58, width: 0.12, strength: 0.5 },
    { y: OPENING_HEIGHT, width: 0.2, strength: 0.6 },
    { y: OPENING_HEIGHT + 1.05, width: 0.2, strength: 0.65 },
    { y: HARA_Y + 0.28, width: 0.25, strength: 0.6 },
  ],
};

function bakeChunk(fill: (add: AddPart) => void) {
  const parts: Part[] = [];
  fill((geometry, position, rotation) => parts.push({ geometry, position, rotation }));
  // Parts never share vertices, so baking in chunks gives the same AO as one bake.
  return bakeVertexAO(mergeParts(parts), TALA_AO);
}

function pier(add: AddPart, s: 1 | -1) {
  const zc = ZC;
  const pierW = PIER_W;
  {
    const cx = s * (OPENING_HALF + pierW / 2);
    // Adhisthana: upana, jagati, rounded kumuda, recessed kantha, pattika.
    add(chamferedBox(pierW + 0.3, 0.34, MODULE_DEPTH + 0.3, 0.04), [cx, 0.17, zc]);
    add(chamferedBox(pierW + 0.18, 0.4, MODULE_DEPTH + 0.18, 0.04), [cx, 0.54, zc]);
    add(roundedBox(pierW + 0.12, 0.42, MODULE_DEPTH + 0.12, 0.19, 3), [cx, 0.95, zc]);
    add(chamferedBox(pierW - 0.12, 0.18, MODULE_DEPTH - 0.12, 0.02), [cx, 1.25, zc]);
    add(chamferedBox(pierW + 0.16, 0.24, MODULE_DEPTH + 0.16, 0.04), [cx, 1.46, zc]);
    // Wall (bhitti).
    const wallH = OPENING_HEIGHT - 1.58;
    add(chamferedBox(pierW - 0.1, wallH, MODULE_DEPTH - 0.1, 0.04), [cx, 1.58 + wallH / 2, zc]);
    // Corner pilasters with bracket capitals.
    for (const px of [cx - s * (pierW / 2 - 0.32), cx + s * (pierW / 2 - 0.32)]) {
      add(chamferedBox(0.46, wallH - 0.5, 0.26, 0.03), [px, 1.58 + (wallH - 0.5) / 2, 0.08]);
      add(chamferedBox(0.62, 0.16, 0.42, 0.03), [px, OPENING_HEIGHT - 0.42, 0.06]);
      add(chamferedBox(0.86, 0.22, 0.5, 0.04), [px, OPENING_HEIGHT - 0.22, 0.04]);
    }
    // String courses dividing the wall into registers.
    for (const by of [4.1, 8.55]) add(chamferedBox(pierW - 0.02, 0.14, MODULE_DEPTH - 0.02, 0.03), [cx, by, zc]);
    // Slim inner pilasters flanking the niche, each with a small kudu over its capital.
    for (const nx of [-0.95, 0.95]) {
      add(chamferedBox(0.22, wallH - 0.9, 0.16, 0.02), [cx + nx, 1.58 + (wallH - 0.9) / 2 + 0.2, 0.02]);
      add(kudu(0.16, 0.06), [cx + nx, OPENING_HEIGHT - 0.85, 0.12]);
    }
    // Devakoshta niche: framing pilasters, lintel, and a kudu above.
    for (const nx of [-0.5, 0.5]) add(chamferedBox(0.16, 4.2, 0.2, 0.02), [cx + nx, 4.9, 0.03]);
    add(chamferedBox(1.42, 0.18, 0.36, 0.03), [cx, 7.1, 0.08]);
    add(chamferedBox(1.0, 0.12, 0.12, 0.02), [cx, 2.86, 0.0]);
    add(kudu(0.36, 0.1), [cx, 7.55, 0.16]);
    // Door jamb (dvara-shakha): stepped frame on the opening.
    add(chamferedBox(0.42, OPENING_HEIGHT, 0.36, 0.03), [s * (OPENING_HALF + 0.21), OPENING_HEIGHT / 2, 0.1]);
    add(chamferedBox(0.22, OPENING_HEIGHT, 0.2, 0.02), [s * (OPENING_HALF + 0.56), OPENING_HEIGHT / 2, 0.16]);
    // Cornice returns on the outer side faces.
    add(kapotaSide(MODULE_DEPTH + 0.1, s), [s * (MODULE_HALF + 0.05), OPENING_HEIGHT + 1.05, 0.05]);
  }
}

function entablature(add: AddPart) {
  const zc = ZC;
  // Entablature: beam (uttira), frieze (valabhi) with a bhuta-block row, kapota.
  const W = MODULE_HALF * 2;
  add(chamferedBox(W + 0.1, 0.6, MODULE_DEPTH + 0.1, 0.04), [0, OPENING_HEIGHT + 0.3, zc]);
  add(chamferedBox(W - 0.3, 0.45, MODULE_DEPTH - 0.2, 0.03), [0, OPENING_HEIGHT + 0.82, zc]);
  const blocks = 26;
  for (let b = 0; b < blocks; b++) {
    const x = -W / 2 + 0.5 + (b * (W - 1)) / (blocks - 1);
    add(chamferedBox(0.34, 0.24, 0.14, 0.03), [x, OPENING_HEIGHT + 0.82, 0.0]);
  }
  add(kapotaFront(W + 0.2), [0, OPENING_HEIGHT + 1.05, 0.05]);
  // Kudu row on the roll of the kapota.
  const kudus = 9;
  for (let k = 0; k < kudus; k++) {
    const x = -W / 2 + 1.1 + (k * (W - 2.2)) / (kudus - 1);
    add(kudu(0.3, 0.09), [x, OPENING_HEIGHT + 1.55, 0.86], [-0.32, 0, 0]);
  }
}

function hara(add: AddPart) {
  const zc = ZC;
  const W = MODULE_HALF * 2;
  // Hara: parapet band of miniature shrines on the roof of the tier.
  const haraY = HARA_Y;
  add(chamferedBox(W - 0.4, 0.28, MODULE_DEPTH - 0.3, 0.04), [0, haraY + 0.14, zc]);
  add(chamferedBox(W - 1.2, 0.5, MODULE_DEPTH - 1.2, 0.04), [0, haraY + 0.53, zc - 0.2]);
  const hz = -0.85;
  kuta(add, -(MODULE_HALF - 0.85), haraY + 0.28, hz);
  kuta(add, MODULE_HALF - 0.85, haraY + 0.28, hz);
  shala(add, -3.9, haraY + 0.28, hz, 2.4);
  shala(add, 3.9, haraY + 0.28, hz, 2.4);
  shala(add, 0, haraY + 0.28, hz, 3.2);
  // Panjara nasikas between the shrines.
  for (const x of [-5.85, -1.95, 1.95, 5.85]) add(kudu(0.24, 0.08), [x, haraY + 0.75, hz + 0.4]);
}

/**
 * The tala module as four bake steps (each ~30–50 ms) so a caller can spread the work over
 * idle frames; `mergeTalaChunks` joins the results into one geometry.
 */
export const TALA_STEPS: (() => THREE.BufferGeometry)[] = [
  () => bakeChunk((add) => pier(add, -1)),
  () => bakeChunk((add) => pier(add, 1)),
  () => bakeChunk(entablature),
  () => bakeChunk(hara),
];

export function mergeTalaChunks(chunks: THREE.BufferGeometry[]) {
  const merged = mergeGeometries(chunks, false);
  chunks.forEach((g) => g.dispose());
  if (!merged) throw new Error("mergeTalaChunks: chunks could not be merged");
  return merged;
}

export function buildTalaModule() {
  return mergeTalaChunks(TALA_STEPS.map((step) => step()));
}

/** Gopuram crown: griva band, barrel-vault shala roof with kudu gables, ridge sockets. */
export const CROWN_KALASAMS = 7;
const CROWN_LEN = 12.4;
const CROWN_R = 2.3;
const CROWN_RIDGE_Y = 1.6 + CROWN_R;

export function buildCrown() {
  const parts: Part[] = [];
  const add = (geometry: THREE.BufferGeometry, position: Vec3, rotation?: Vec3) => parts.push({ geometry, position, rotation });
  add(chamferedBox(CROWN_LEN + 1.2, 0.5, 4.6, 0.05), [0, 0.25, 0]);
  add(chamferedBox(CROWN_LEN + 0.4, 0.7, 3.8, 0.05), [0, 0.85, 0]);
  add(kapotaFront(CROWN_LEN + 1.0, 0.7), [0, 1.2, 1.9]);
  const roof = new THREE.CylinderGeometry(CROWN_R, CROWN_R, CROWN_LEN, 22, 1, false, 0, Math.PI);
  roof.rotateZ(Math.PI / 2);
  add(roof, [0, 1.6, 0]);
  // Ridge cap.
  add(chamferedBox(CROWN_LEN + 0.2, 0.22, 0.5, 0.05), [0, CROWN_RIDGE_Y + 0.05, 0]);
  // Gable kudus at both ends, and a large front nasika window.
  for (const s of [-1, 1]) add(kudu(CROWN_R * 0.95, 0.32), [s * (CROWN_LEN / 2 + 0.1), 1.95, 0], [0, (s * Math.PI) / 2, 0]);
  add(kudu(1.15, 0.22), [0, 2.2, CROWN_R - 0.2], [-0.25, 0, 0]);
  for (const x of [-3.6, 3.6]) add(kudu(0.62, 0.14), [x, 2.0, CROWN_R - 0.45], [-0.35, 0, 0]);
  return bakeVertexAO(mergeParts(parts), { bands: [{ y: 1.6, width: 0.3, strength: 0.6 }, { y: 0.5, width: 0.15, strength: 0.5 }] });
}

/** Kalasam placements in crown space (local units, base on the ridge). */
export function crownKalasamOffsets(): Vec3[] {
  return Array.from({ length: CROWN_KALASAMS }, (_, i) => [
    -CROWN_LEN / 2 + 0.9 + (i * (CROWN_LEN - 1.8)) / (CROWN_KALASAMS - 1),
    CROWN_RIDGE_Y + 0.16,
    0,
  ] as Vec3);
}

/** World transforms for every kalasam (crowns × ridge sockets). */
export function kalasamTransforms(tiers = TOWER_TIERS): Transform[] {
  const out: Transform[] = [];
  for (const crown of crownTransforms(tiers)) {
    const cs = crown.scale as number;
    crownKalasamOffsets().forEach(([x, y, z], i) => {
      const h = i === (CROWN_KALASAMS - 1) / 2 ? 1.25 : 1.0;
      out.push({ position: [crown.position[0] + x * cs, crown.position[1] + y * cs, crown.position[2] + z * cs], scale: [cs * 0.9, cs * 1.35 * h, cs * 0.9] });
    });
  }
  return out;
}

// ---------------------------------------------------------------------------------------
// Granite terraces, stairs, prakara walls and the tower's plinth/core (one draw).
// ---------------------------------------------------------------------------------------
export function buildStoneworks(tiers = TOWER_TIERS) {
  const parts: Part[] = [];
  const add = (geometry: THREE.BufferGeometry, position: Vec3, rotation?: Vec3) => parts.push({ geometry, position, rotation });
  const BASE = -8;
  const HALF = 36;

  for (let i = 0; i < TALA_COUNT; i++) {
    const zi = talaZ(i);
    const yi = talaY(i);
    const front = i === 0 ? 60 : zi + PLATFORM_FRONT;
    const back = i === TALA_COUNT - 1 ? zi - 50 : zi - PLATFORM_BACK;
    const depth = front - back;
    // Platform mass (top surface left as a margin around the paved path).
    add(chamferedBox(HALF * 2, yi - BASE, depth, 0.06), [0, (yi + BASE) / 2 - 0.02, (front + back) / 2]);
    if (i > 0) {
      // Moulded riser either side of the stair: coping lip and a mid band.
      for (const s of [-1, 1]) {
        const cx = s * (5.6 + (HALF - 5.6) / 2);
        add(chamferedBox(HALF - 5.6, 0.22, 0.5, 0.04), [cx, yi - 0.11, front + 0.12]);
        add(roundedBox(HALF - 5.6, 0.36, 0.34, 0.15, 2), [cx, yi - 1.2, front + 0.08]);
      }
    }
    // Prakara (enclosure) walls running out from the gateway.
    const wallZ = zi - MODULE_DEPTH / 2;
    for (const s of [-1, 1]) {
      const len = HALF - MODULE_HALF;
      const cx = s * (MODULE_HALF + len / 2);
      add(chamferedBox(len, 0.6, 2.4, 0.05), [cx, yi + 0.3, wallZ]);
      add(chamferedBox(len, 6.0, 1.9, 0.05), [cx, yi + 3.6, wallZ]);
      add(roundedBox(len, 0.4, 2.3, 0.16, 2), [cx, yi + 6.75, wallZ]);
      add(chamferedBox(len, 0.3, 2.0, 0.04), [cx, yi + 7.1, wallZ]);
      // Pilaster rhythm on the wall face.
      for (let x = MODULE_HALF + 2.4; x < HALF - 1; x += 3.6) {
        add(chamferedBox(0.4, 5.8, 0.22, 0.03), [s * x, yi + 3.6, wallZ + 1.0]);
      }
    }
    // Stair up to the next terrace, with sloped parapets.
    if (i < TALA_COUNT - 1) {
      const z0 = back;
      const tread = STAIR_RUN / STEPS;
      const rise = TALA_RISE / STEPS;
      for (let k = 0; k < STEPS; k++) {
        const top = yi + rise * (k + 1);
        add(chamferedBox(10.2, top - yi + 0.2, tread + 0.04, 0.02), [0, (top + yi - 0.2) / 2, z0 - tread * (k + 0.5)]);
      }
      const slope = Math.atan2(TALA_RISE, STAIR_RUN);
      const run = Math.hypot(TALA_RISE, STAIR_RUN);
      for (const s of [-1, 1]) {
        add(roundedBox(0.7, 0.9, run + 0.6, 0.12, 2), [s * 5.45, yi + TALA_RISE / 2 + 0.55, z0 - STAIR_RUN / 2], [slope, 0, 0]);
        add(chamferedBox(0.9, 1.6, 0.9, 0.04), [s * 5.45, yi + 0.8, z0 + 0.25]);
      }
    }
  }

  // Tower plinth and the dark core that fills the stacked tiers.
  const { tiers: t } = towerTransforms(tiers);
  add(chamferedBox(40, 3.0, 20, 0.08), [0, TOWER_BASE_Y + 1.5 - 3.0, TOWER_Z - 3.0]);
  const top = t[t.length - 1];
  const topY = top.position[1] + 10;
  const h = topY - TOWER_BASE_Y;
  const core = new THREE.CylinderGeometry(4.6, 15.5, h, 4, 1, false, Math.PI / 4);
  core.scale(1, 1, 0.45);
  add(core, [0, TOWER_BASE_Y + h / 2, TOWER_Z - 7.5]);

  return mergeParts(parts);
}

// ---------------------------------------------------------------------------------------
// Brahma Mudi medallion (bronze): prabha ring with flame tongues + the Sikku Kolam knot.
// ---------------------------------------------------------------------------------------

/** PRD §3.1 parametric Brahma Mudi knot (R0 3.0, A 0.25, p 3, q 8, δ 0.45). */
export class KolamKnotCurve extends THREE.Curve<THREE.Vector3> {
  constructor(public radius = 3.0, public amplitude = 0.25, public p = 3, public q = 8, public depth = 0.45) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const u = t * this.p * Math.PI * 2;
    const qu = (this.q / this.p) * u;
    const r = this.radius * (1 + this.amplitude * Math.cos(qu));
    return target.set(r * Math.cos(u), r * Math.sin(u), this.depth * Math.sin(qu));
  }
}

/** Knot tube: PRD 720×32 on Tier A, 360×16 on Tier B. */
export function buildKnot(tubular = 720, radial = 32) {
  return new THREE.TubeGeometry(new KolamKnotCurve(), tubular, 0.075, radial, true);
}

function flameTongue() {
  // Three-lobed jwala tongue, base on y = 0, tip curling to the right.
  const s = new THREE.Shape();
  s.moveTo(-0.17, 0);
  s.quadraticCurveTo(-0.24, 0.3, -0.06, 0.46);
  s.quadraticCurveTo(-0.02, 0.6, 0.06, 0.78);
  s.quadraticCurveTo(0.1, 0.56, 0.12, 0.44);
  s.quadraticCurveTo(0.26, 0.26, 0.17, 0);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.022, bevelSegments: 1, curveSegments: 6 });
}

/** Static frame of the medallion in the XY plane (faces +z), with its hanging rod. */
export function buildRingFrame({ flames = 20, radial = 128 } = {}) {
  const parts: Part[] = [];
  const toXY = (g: THREE.BufferGeometry) => g.rotateX(Math.PI / 2);
  // Prabha band: flat lathe band between two beads.
  parts.push({ geometry: toXY(latheProfile([[3.74, -0.06], [4.06, -0.06], [4.06, 0.06], [3.74, 0.06], [3.74, -0.06]], { radialSegments: radial, capped: false })) });
  parts.push({ geometry: new THREE.TorusGeometry(4.1, 0.1, 10, radial) });
  parts.push({ geometry: new THREE.TorusGeometry(3.72, 0.075, 8, radial) });
  // Flame tongues around the rim (Chola prabha), pointing outward.
  for (let f = 0; f < flames; f++) {
    const a = (f / flames) * Math.PI * 2 + Math.PI / flames;
    const s = 0.66 + 0.14 * Math.abs(Math.cos(a * 2));
    parts.push({ geometry: flameTongue(), position: [Math.cos(a) * 4.14, Math.sin(a) * 4.14, -0.04], rotation: [0, 0, a - Math.PI / 2], scale: s });
  }
  // Inner halo and the lotus boss (pulli) at the centre.
  parts.push({ geometry: new THREE.TorusGeometry(1.85, 0.06, 8, 72) });
  parts.push({ geometry: toXY(latheProfile([[0, -0.16], [0.52, -0.14], [0.58, 0], [0.42, 0.14], [0.2, 0.3], [0.08, 0.36], [0, 0.38]], { radialSegments: 24, smooth: true, samples: 14 })) });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    parts.push({ geometry: new THREE.SphereGeometry(0.11, 10, 8), position: [Math.cos(a) * 0.82, Math.sin(a) * 0.82, 0.02] });
  }
  // Four spokes tie the halo to the prabha, and a rod hangs the medallion from the lintel.
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const mid = (1.85 + 3.72) / 2;
    parts.push({ geometry: new THREE.CylinderGeometry(0.045, 0.045, 3.72 - 1.85, 8), position: [Math.cos(a) * mid, Math.sin(a) * mid, -0.25], rotation: [0, 0, a - Math.PI / 2] });
  }
  parts.push({ geometry: new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), position: [0, 4.95 + 1.2, 0] });
  parts.push({ geometry: latheProfile([[0.0, 0], [0.16, 0.05], [0.2, 0.18], [0.1, 0.3], [0, 0.34]], { radialSegments: 12, smooth: true, samples: 8 }), position: [0, 4.82, 0] });
  return bakeVertexAO(mergeParts(parts), { cavity: 1.2, edges: 1.2 });
}

/** Ring placements in world space (frame is static; the knot spins inside it). */
export function ringTransforms(): Transform[] {
  return portalTransforms().map((t) => {
    const s = t.scale as number;
    return { position: [t.position[0], t.position[1] + RING_HEIGHT * s, t.position[2] - 0.2] as Vec3, scale: RING_SCALE * s };
  });
}

/** GPU bytes held by a geometry's attributes and index. */
export function geometryBytes(g: THREE.BufferGeometry) {
  let bytes = g.index ? g.index.array.byteLength : 0;
  for (const name of Object.keys(g.attributes)) bytes += (g.attributes[name].array as ArrayBufferView).byteLength;
  return bytes;
}

// ---------------------------------------------------------------------------------------
// Paving (instanced) and the bake cache
// ---------------------------------------------------------------------------------------

const SLAB_H = 0.08;
/** One dressed paving slab; instanced along the processional path. */
export function slabGeometry() {
  return chamferedBox(1.94, SLAB_H, 1.94, 0.025);
}

/** Slabs on each terrace's paved path, slightly uneven in height and placement. */
export function pavingTransforms(): Transform[] {
  const rand = seeded(5);
  const out: Transform[] = [];
  for (let i = 0; i < TALA_COUNT; i++) {
    const zi = talaZ(i);
    const yi = talaY(i);
    const front = i === 0 ? 30 : zi + PLATFORM_FRONT;
    const back = Math.max(zi - PLATFORM_BACK, zi - 14);
    for (let z = front - 1; z > back + 0.5; z -= 2) {
      for (let x = -5; x <= 5; x += 2) {
        const h = 0.06 + rand() * 0.025;
        out.push({ position: [x + (rand() - 0.5) * 0.02, yi + h / 2, z], rotation: [0, (rand() - 0.5) * 0.01, 0], scale: [1, h / SLAB_H, 1] });
      }
    }
  }
  return out;
}

interface GeometrySnapshot {
  index: Uint16Array | Uint32Array | null;
  attributes: { name: string; array: Float32Array; itemSize: number }[];
}
// Plain typed arrays (not GPU objects): the expensive merge + AO bake runs once per page
// load; later mounts (route round trips) wrap the same arrays in fresh geometries.
const bakeCache = new Map<string, GeometrySnapshot>();

export const hasCachedGeometry = (key: string) => bakeCache.has(key);

export function cachedGeometry(key: string, build: () => THREE.BufferGeometry) {
  let snap = bakeCache.get(key);
  if (!snap) {
    const built = build();
    snap = {
      index: built.index ? (built.index.array as Uint16Array | Uint32Array) : null,
      attributes: Object.keys(built.attributes).map((name) => {
        const a = built.attributes[name] as THREE.BufferAttribute;
        return { name, array: a.array as Float32Array, itemSize: a.itemSize };
      }),
    };
    bakeCache.set(key, snap);
    built.dispose();
  }
  const g = new THREE.BufferGeometry();
  for (const a of snap.attributes) g.setAttribute(a.name, new THREE.BufferAttribute(a.array, a.itemSize));
  if (snap.index) g.setIndex(new THREE.BufferAttribute(snap.index, 1));
  g.computeBoundingSphere();
  return g;
}
