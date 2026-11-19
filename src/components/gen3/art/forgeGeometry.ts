// Steelwork for the Events "forge arena" art pass: riveted I-beam columns, Warren roof
// trusses, the lighting truss over the stage, the backlight housing and the stage drum.
// Pure functions (no React, no DOM) so they can be unit-tested; callers own and dispose
// the returned geometries. Everything that shares the steel material is merged into one
// geometry (one draw, one shadow caster).
import * as THREE from "three";
import { chamferedBox, latheProfile, mergeParts, seeded, type Part, type Vec3 } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";

/** Stage deck height; the performer stands here. */
export const DECK_Y = 0.92;
export const STAGE_RADIUS = 2.7;
/** Centre of the backlight disc (the "god light" the performer is silhouetted against). */
export const BACKLIGHT: Vec3 = [0, 3.25, -4.6];
export const BACKLIGHT_RADIUS = 1.32;
/** Lamp cans on the lighting truss over the stage (world positions of the lens centres). */
export const TRUSS_Y = 7.4;
export const TRUSS_Z = 0.4;
export const TRUSS_LAMPS: Vec3[] = [-3.6, -1.2, 1.2, 3.6].map((x) => [x, TRUSS_Y - 0.62, TRUSS_Z + 0.35] as Vec3);
/** Lamp cans tip back toward the stage by this much (rotation about X; lens faces local -Y). */
export const LAMP_TILT = 0.15;
/** Side columns and roof trusses share these bay lines. */
export const BAY_Z = [-8.5, -3.5, 1.5, 6.5, 11.5];
export const COLUMN_X = 11;
/** Medallion centre: hung on one cable from the roof truss above the backlight. */
export const EMBLEM_POS: Vec3 = [0, 6.6, -3.5];
export const ROOF_Y = 10.2;

type Quality = 0 | 1 | 2;

/** I-section (h deep, w wide flanges) with small chamfered fillets, extruded `length` along +Z. */
export function iBeamSection(length: number, h = 0.36, w = 0.2, web = 0.024, flange = 0.03) {
  const hw = w / 2;
  const hh = h / 2;
  const tw = web / 2;
  const f = 0.012; // fillet chamfer between web and flange
  const s = new THREE.Shape();
  s.moveTo(-hw, -hh);
  s.lineTo(hw, -hh);
  s.lineTo(hw, -hh + flange);
  s.lineTo(tw + f, -hh + flange);
  s.lineTo(tw, -hh + flange + f);
  s.lineTo(tw, hh - flange - f);
  s.lineTo(tw + f, hh - flange);
  s.lineTo(hw, hh - flange);
  s.lineTo(hw, hh);
  s.lineTo(-hw, hh);
  s.lineTo(-hw, hh - flange);
  s.lineTo(-tw - f, hh - flange);
  s.lineTo(-tw, hh - flange - f);
  s.lineTo(-tw, -hh + flange + f);
  s.lineTo(-tw - f, -hh + flange);
  s.lineTo(-hw, -hh + flange);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: length,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.005,
    bevelSegments: 1,
    curveSegments: 1,
  });
  g.translate(0, 0, -length / 2);
  return g;
}

/** Column along +Y from y=0 to `height` (web in the X/Y plane, flanges facing ±X). */
function iColumn(height: number, h: number, w: number) {
  const g = iBeamSection(height, h, w);
  g.rotateX(-Math.PI / 2); // +Z → +Y
  g.translate(0, height / 2, 0);
  return g;
}

/** Beam spanning X between x0 and x1 at (y, z). */
function iBeamX(x0: number, x1: number, y: number, z: number, h = 0.32, w = 0.18): Part {
  const g = iBeamSection(Math.abs(x1 - x0), h, w);
  g.rotateY(Math.PI / 2); // +Z → +X
  return { geometry: g, position: [(x0 + x1) / 2, y, z] };
}

/** Low domed rivet head facing +Y (lathe), small enough to stay a few dozen triangles. */
function rivetHead(r = 0.018) {
  return latheProfile(
    [
      [r, 0],
      [r * 0.92, r * 0.35],
      [r * 0.6, r * 0.62],
      [0, r * 0.7],
    ],
    { radialSegments: 7, capped: false }
  );
}

/** Straight bar (square tube) between two points. */
function strut(a: THREE.Vector3, b: THREE.Vector3, size: number): Part {
  const len = a.distanceTo(b);
  const g = chamferedBox(size, len, size, size * 0.18);
  const dir = b.clone().sub(a).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const e = new THREE.Euler().setFromQuaternion(q);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  return { geometry: g, position: [mid.x, mid.y, mid.z], rotation: [e.x, e.y, e.z] };
}

/** Round tube between two points (truss chords and lacing). */
function pipe(a: THREE.Vector3, b: THREE.Vector3, r: number, radial = 6): Part {
  const len = a.distanceTo(b);
  const g = new THREE.CylinderGeometry(r, r, len, radial, 1, true);
  const dir = b.clone().sub(a).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const e = new THREE.Euler().setFromQuaternion(q);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  return { geometry: g, position: [mid.x, mid.y, mid.z], rotation: [e.x, e.y, e.z] };
}

/** Row of rivets on a plane facing `normal` ('+x' | '-x' | '+z' | '-z' | '+y'). */
function rivetRow(from: Vec3, to: Vec3, count: number, normal: "+x" | "-x" | "+z" | "-z" | "+y", r?: number): Part[] {
  const rot: Record<typeof normal, Vec3> = {
    "+y": [0, 0, 0],
    "+x": [0, 0, -Math.PI / 2],
    "-x": [0, 0, Math.PI / 2],
    "+z": [Math.PI / 2, 0, 0],
    "-z": [-Math.PI / 2, 0, 0],
  };
  const parts: Part[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    parts.push({
      geometry: rivetHead(r),
      position: [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t],
      rotation: rot[normal],
    });
  }
  return parts;
}

/** One side column: riveted I-section, base plate, haunch bracket under the roof truss. */
function sideColumn(x: number, z: number, quality: Quality): Part[] {
  const side = Math.sign(x);
  const parts: Part[] = [
    { geometry: iColumn(ROOF_Y, 0.42, 0.26), position: [x, 0, z] },
    { geometry: chamferedBox(0.62, 0.05, 0.5, 0.012), position: [x, 0.025, z] },
    // Haunch knee brace up to the truss bottom chord.
    strut(new THREE.Vector3(x - side * 0.12, ROOF_Y - 2.0, z), new THREE.Vector3(x - side * 1.5, ROOF_Y - 0.05, z), 0.1),
    // Splice plates with rivets at a third and two thirds of the height.
    { geometry: chamferedBox(0.3, 0.55, 0.012, 0.004), position: [x, 3.4, z + 0.016] },
    { geometry: chamferedBox(0.3, 0.55, 0.012, 0.004), position: [x, 6.8, z + 0.016] },
  ];
  if (quality < 2) {
    for (const y of [3.4, 6.8]) {
      parts.push(...rivetRow([x - 0.09, y - 0.2, z + 0.024], [x - 0.09, y + 0.2, z + 0.024], 4, "+z"));
      parts.push(...rivetRow([x + 0.09, y - 0.2, z + 0.024], [x + 0.09, y + 0.2, z + 0.024], 4, "+z"));
    }
  }
  return parts;
}

/** Warren roof truss across the hall at bay line `z`: two I-chords, angle lacing, gussets. */
function roofTruss(z: number, quality: Quality): Part[] {
  const span = COLUMN_X * 2;
  const depth = 1.5;
  const yBot = ROOF_Y;
  const yTop = ROOF_Y + depth;
  const parts: Part[] = [iBeamX(-span / 2, span / 2, yBot, z, 0.3, 0.16), iBeamX(-span / 2, span / 2, yTop, z, 0.3, 0.16)];
  const panels = 10;
  const step = span / panels;
  for (let i = 0; i < panels; i++) {
    const x0 = -span / 2 + i * step;
    const up = i % 2 === 0;
    const a = new THREE.Vector3(x0, up ? yBot + 0.14 : yTop - 0.14, z);
    const b = new THREE.Vector3(x0 + step, up ? yTop - 0.14 : yBot + 0.14, z);
    parts.push(strut(a, b, 0.085));
    // Gusset plate at each node, bolted.
    parts.push({ geometry: chamferedBox(0.42, 0.34, 0.014, 0.005), position: [x0, i % 2 === 0 ? yBot + 0.22 : yTop - 0.22, z + 0.05] });
    if (quality === 0) {
      const gy = i % 2 === 0 ? yBot + 0.24 : yTop - 0.24;
      parts.push(...rivetRow([x0 - 0.12, gy, z + 0.06], [x0 + 0.12, gy, z + 0.06], 3, "+z", 0.016));
    }
  }
  // Verticals at the ends.
  parts.push(strut(new THREE.Vector3(-span / 2 + 0.1, yBot, z), new THREE.Vector3(-span / 2 + 0.1, yTop, z), 0.12));
  parts.push(strut(new THREE.Vector3(span / 2 - 0.1, yBot, z), new THREE.Vector3(span / 2 - 0.1, yTop, z), 0.12));
  return parts;
}

/** Box truss over the stage carrying the lamp cans and the emblem's hanging cables. */
function lightingTruss(): Part[] {
  const half = 5.2;
  const s = 0.32; // truss half-section
  const y = TRUSS_Y;
  const z = TRUSS_Z;
  const chords: Vec3[] = [
    [0, y + s, z - s],
    [0, y + s, z + s],
    [0, y - s, z - s],
    [0, y - s, z + s],
  ];
  const parts: Part[] = chords.map(([, cy, cz]) => pipe(new THREE.Vector3(-half, cy, cz), new THREE.Vector3(half, cy, cz), 0.032, 8));
  const bays = 16;
  for (let i = 0; i < bays; i++) {
    const x0 = -half + (i * 2 * half) / bays;
    const x1 = -half + ((i + 1) * 2 * half) / bays;
    // Zig-zag lacing on the front and bottom faces.
    parts.push(pipe(new THREE.Vector3(x0, y - s, z + s), new THREE.Vector3(x1, y + s, z + s), 0.012, 5));
    parts.push(pipe(new THREE.Vector3(x0, y - s, z - s), new THREE.Vector3(x1, y - s, z + s), 0.012, 5));
    parts.push(pipe(new THREE.Vector3(x0, y + s, z - s), new THREE.Vector3(x1, y - s, z - s), 0.012, 5));
  }
  // Drop chains/pipes to the roof truss above.
  for (const x of [-4.2, 4.2]) parts.push(pipe(new THREE.Vector3(x, y + s, z), new THREE.Vector3(x, ROOF_Y, z), 0.014, 5));
  // Lamp cans: turned bodies with a yoke, lens at the local origin facing -Y, aimed at the stage.
  for (const [lx, ly, lz] of TRUSS_LAMPS) {
    const can = latheProfile(
      [
        [0.2, 0],
        [0.215, 0.04],
        [0.2, 0.36],
        [0.15, 0.48],
        [0.06, 0.54],
      ],
      { radialSegments: 20, capped: true }
    );
    parts.push({ geometry: can, position: [lx, ly, lz], rotation: [LAMP_TILT, 0, 0] });
    parts.push(strut(new THREE.Vector3(lx - 0.24, ly + 0.3, lz), new THREE.Vector3(lx - 0.24, y - s, z), 0.03));
    parts.push(strut(new THREE.Vector3(lx + 0.24, ly + 0.3, lz), new THREE.Vector3(lx + 0.24, y - s, z), 0.03));
    parts.push(strut(new THREE.Vector3(lx - 0.24, ly + 0.3, lz), new THREE.Vector3(lx + 0.24, ly + 0.3, lz), 0.03));
  }
  return parts;
}

/** Ring housing of the backlight and the gantry that holds it behind the stage. */
function backlightGantry(): Part[] {
  const [bx, by, bz] = BACKLIGHT;
  const r = BACKLIGHT_RADIUS;
  // Lathe profile in (radius, depth) turned about the light's axis (+Z after rotation).
  const ring = latheProfile(
    [
      [r * 0.4, -0.56],
      [r + 0.18, -0.5],
      [r + 0.28, -0.42],
      [r + 0.3, -0.02],
      [r + 0.24, 0.06],
      [r + 0.05, 0.1],
      [r - 0.02, 0.06],
    ],
    { radialSegments: 48, capped: false }
  );
  const parts: Part[] = [{ geometry: ring, position: [bx, by, bz], rotation: [Math.PI / 2, 0, 0] }];
  // Twin posts and a header beam: the light hangs in a heavy portal frame.
  for (const sx of [-1, 1]) {
    parts.push({ geometry: iColumn(by + 2.4, 0.36, 0.22), position: [bx + sx * (r + 0.75), 0, bz - 0.2] });
    parts.push({ geometry: chamferedBox(0.56, 0.05, 0.46, 0.012), position: [bx + sx * (r + 0.75), 0.025, bz - 0.2] });
    // Trunnion arms from the posts to the ring.
    parts.push(strut(new THREE.Vector3(bx + sx * (r + 0.62), by, bz - 0.2), new THREE.Vector3(bx + sx * (r + 0.22), by, bz - 0.2), 0.12));
  }
  parts.push(iBeamX(bx - r - 1.0, bx + r + 1.0, by + 2.4, bz - 0.2, 0.4, 0.22));
  return parts;
}

/** Purlins along the hall, tying the roof trusses (the "rafters" the crane shot passes). */
function purlins(): Part[] {
  const parts: Part[] = [];
  const z0 = BAY_Z[0];
  const z1 = BAY_Z[BAY_Z.length - 1];
  for (const x of [-8.8, -4.4, 0, 4.4, 8.8]) {
    const g = iBeamSection(z1 - z0, 0.2, 0.1);
    parts.push({ geometry: g, position: [x, ROOF_Y + 1.6, (z0 + z1) / 2] });
  }
  return parts;
}

/**
 * All static steel in the hall merged into one geometry with baked creases and edges.
 * quality 0 = full rivet detail, 2 = structure only.
 */
export function buildSteelwork(quality: Quality = 0) {
  const parts: Part[] = [];
  for (const z of BAY_Z) {
    parts.push(...sideColumn(-COLUMN_X, z, quality), ...sideColumn(COLUMN_X, z, quality));
    parts.push(...roofTruss(z, quality));
  }
  parts.push(...purlins(), ...lightingTruss(), ...backlightGantry());
  // The emblem's cable.
  parts.push(pipe(new THREE.Vector3(EMBLEM_POS[0], EMBLEM_POS[1] + 0.74, EMBLEM_POS[2]), new THREE.Vector3(EMBLEM_POS[0], ROOF_Y, EMBLEM_POS[2]), 0.012, 5));
  const g = mergeParts(parts);
  return bakeVertexAO(g, { cavity: 1, edges: 1, ground: { y: 0, height: 1.2, strength: 0.6 }, smooth: 0 });
}

/**
 * The stage: a riveted steel drum with a chamfered deck, stiffener ribs and a recessed
 * slot at the step (where the hot seam glows). One geometry; the seam is separate.
 */
export function buildStageDrum(quality: Quality = 0) {
  const R = STAGE_RADIUS;
  const drum = latheProfile(
    [
      [R + 0.36, 0],
      [R + 0.36, 0.06],
      [R + 0.3, 0.1],
      [R + 0.28, 0.5],
      [R + 0.22, 0.56],
      [R + 0.06, 0.58],
      [R + 0.04, 0.64],
      [R + 0.08, 0.66],
      [R + 0.08, DECK_Y - 0.04],
      [R + 0.04, DECK_Y],
      [0, DECK_Y],
    ],
    { radialSegments: 72, capped: false }
  );
  const parts: Part[] = [{ geometry: drum }];
  const ribs = 24;
  for (let i = 0; i < ribs; i++) {
    const a = (i / ribs) * Math.PI * 2;
    const rr = R + 0.33;
    parts.push({
      geometry: chamferedBox(0.05, 0.4, 0.1, 0.012),
      position: [Math.cos(a) * rr, 0.3, Math.sin(a) * rr],
      rotation: [0, -a, 0],
    });
  }
  if (quality < 2) {
    // Rivet ring around the deck edge.
    const n = quality === 0 ? 96 : 48;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = R - 0.1;
      parts.push({ geometry: rivetHead(0.016), position: [Math.cos(a) * rr, DECK_Y, Math.sin(a) * rr] });
    }
    // Deck plate seams: a cross of flat bars.
    for (const yaw of [0, Math.PI / 2]) {
      parts.push({ geometry: chamferedBox(R * 1.9, 0.012, 0.06, 0.004), position: [0, DECK_Y + 0.004, 0], rotation: [0, yaw, 0] });
    }
  }
  const g = mergeParts(parts);
  return bakeVertexAO(g, { cavity: 1, edges: 1, ground: { y: 0, height: 0.35, strength: 0.55 }, bands: [{ y: 0.6, width: 0.08, strength: 0.6 }], smooth: 1 });
}

/** Thin ring in the drum's step slot: carries the hot-metal emissive shader (uv.x = angle). */
export function buildHotSeam() {
  const g = new THREE.TorusGeometry(STAGE_RADIUS + 0.06, 0.02, 6, 96);
  g.rotateX(Math.PI / 2);
  g.translate(0, 0.61, 0);
  return g;
}

/** Walls of the hall (back + two sides) as one geometry; UVs in metres / 8 for a tiling map. */
export function buildWalls() {
  const back = new THREE.PlaneGeometry(26, 15);
  const left = new THREE.PlaneGeometry(26, 15);
  const right = new THREE.PlaneGeometry(26, 15);
  const scaleUv = (g: THREE.BufferGeometry, w: number, h: number) => {
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / 8, (uv.getY(i) * h) / 15);
  };
  scaleUv(back, 26, 15);
  scaleUv(left, 26, 15);
  scaleUv(right, 26, 15);
  return mergeParts([
    { geometry: back, position: [0, 7.5, -10.5] },
    { geometry: left, position: [-12.4, 7.5, 2.5], rotation: [0, Math.PI / 2, 0] },
    { geometry: right, position: [12.4, 7.5, 2.5], rotation: [0, -Math.PI / 2, 0] },
  ]);
}

export interface CrowdSlot {
  x: number;
  z: number;
  scale: number;
  phase: number;
  speed: number;
  /** Pose cell in the crowd atlas (0-7). */
  kind: number;
}

/** Keep-out lane along the camera's approach so no billboard fills the lens. */
export const AISLE_HALF_WIDTH = 1.0;
/** The lane only opens near the camera; closer to the stage the floor is filled. */
export const AISLE_FROM_Z = 8.6;

/**
 * Standing crowd on the hall floor: dense in front of the stage, thinning toward the wings,
 * with a centre aisle for the camera. Rows are staggered and jittered so no two lines align.
 */
export function layoutCrowd(density = 1, seed = 108): CrowdSlot[] {
  const rand = seeded(seed);
  const slots: CrowdSlot[] = [];
  // One person per slot (single-figure atlas cells).
  const rowStep = 0.62 / Math.sqrt(density);
  const colStep = 0.58 / Math.sqrt(density);
  let row = 0;
  for (let z = STAGE_RADIUS + 0.9; z <= 13.5; z += rowStep, row++) {
    const offset = (row % 2) * colStep * 0.5;
    const halfWidth = Math.min(10.2, 4.2 + (z - STAGE_RADIUS) * 0.65);
    for (let x = -halfWidth + offset; x <= halfWidth; x += colStep) {
      const jx = x + (rand() - 0.5) * colStep * 0.6;
      const jz = z + (rand() - 0.5) * rowStep * 0.6;
      if (jz > AISLE_FROM_Z && Math.abs(jx) < AISLE_HALF_WIDTH) continue;
      if (rand() < 0.06) continue; // gaps
      slots.push({ x: jx, z: jz, scale: 0.94 + rand() * 0.14, phase: rand() * Math.PI * 2, speed: 0.92 + rand() * 0.16, kind: Math.floor(rand() * 8) });
    }
  }
  // Wings beside the stage.
  for (let z = -4.5; z < STAGE_RADIUS + 0.9; z += rowStep, row++) {
    const offset = (row % 2) * colStep * 0.5;
    for (const side of [-1, 1]) {
      for (let x = STAGE_RADIUS + 1.3 + offset; x <= 10.2; x += colStep) {
        const jx = side * (x + (rand() - 0.5) * colStep * 0.5);
        const jz = z + (rand() - 0.5) * rowStep * 0.6;
        if (Math.hypot(jx, jz) < STAGE_RADIUS + 1.1) continue;
        if (rand() < 0.1) continue;
        slots.push({ x: jx, z: jz, scale: 0.94 + rand() * 0.14, phase: rand() * Math.PI * 2, speed: 0.92 + rand() * 0.16, kind: Math.floor(rand() * 8) });
      }
    }
  }
  return slots;
}
