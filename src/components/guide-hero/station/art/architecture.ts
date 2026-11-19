// Station architecture for the art pass: wet platforms with coping and tactile strip, the
// track bed, an umbrella canopy on cast-iron columns with spandrel brackets and a punched
// timber valance, sodium lamps, and the hall (lattice arch trusses, roof, gable wall with the
// station mouth). Geometry only; materials live in StationSet.tsx.
import * as THREE from "three";
import { chamferedBox, flutedShaft, latheProfile, mergeParts, type Part } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";
import { mergeColoredParts, type ColoredPart } from "./coach";
import { CANOPY, HALL, PLATFORM, SODIUM_LAMPS, SODIUM_LAMP_Y, SODIUM_LAMP_Z } from "./layout";

export const ARCH_COLORS = {
  iron: "#24302c",
  ironLight: "#34403a",
  valance: "#8c8062",
  sheet: "#23272b",
  bench: "#3a2618",
  coping: "#6f6a62",
  tactile: "#a8862c",
  paint: "#b59a3a",
  rail: "#4a4c50",
  ballast: "#16171a",
} as const;

function plane(w: number, d: number, x: number, z: number, y = 0): Part {
  const g = new THREE.PlaneGeometry(w, d);
  g.rotateX(-Math.PI / 2);
  return { geometry: g, position: [x, y, z] };
}

/** Walkable wet slabs of both platforms (one material, one draw). */
export function buildPlatformSlabs() {
  const near0 = PLATFORM.edgeZ + PLATFORM.copingDepth;
  const L = PLATFORM.halfLength * 2;
  const far1 = PLATFORM.farEdgeZ - PLATFORM.copingDepth;
  return mergeParts([
    plane(L, PLATFORM.farZ - near0, 0, (near0 + PLATFORM.farZ) / 2),
    plane(L, far1 - PLATFORM.farBackZ, 0, (far1 + PLATFORM.farBackZ) / 2),
  ]);
}

/** Coping stones, platform faces, tactile strip, painted edge line, track bed and rails. */
export function buildPlatformEdges() {
  const C = ARCH_COLORS;
  const L = PLATFORM.halfLength * 2;
  const parts: ColoredPart[] = [];
  const faceH = -PLATFORM.trackY;
  for (const [edge, dir] of [
    [PLATFORM.edgeZ, 1],
    [PLATFORM.farEdgeZ, -1],
  ] as const) {
    const mid = edge + dir * (PLATFORM.copingDepth / 2);
    parts.push({ geometry: chamferedBox(L, 0.16, PLATFORM.copingDepth + 0.04, 0.025), position: [0, -0.075, mid - dir * 0.02], color: C.coping });
    parts.push({ geometry: new THREE.BoxGeometry(L, faceH, 0.3), position: [0, PLATFORM.trackY / 2 - 0.08, edge + dir * 0.15], color: "#1c1d20" });
    parts.push({ ...plane(L, 0.07, 0, edge + dir * 0.12, 0.006), color: C.paint });
  }
  // Rails: two broad-gauge tracks, wet steel catching the lamps.
  for (const z of [-0.51, -2.19]) {
    parts.push({ geometry: chamferedBox(L, 0.15, 0.075, 0.015), position: [0, PLATFORM.trackY + 0.11, z], color: C.rail });
  }
  const geometry = mergeColoredParts(parts);
  bakeVertexAO(geometry, { cavity: 0.6, edges: 0.8 });
  return geometry;
}

export function buildTrackBed() {
  const w = PLATFORM.edgeZ - PLATFORM.farEdgeZ;
  return mergeParts([plane(PLATFORM.halfLength * 2, w, 0, (PLATFORM.edgeZ + PLATFORM.farEdgeZ) / 2, PLATFORM.trackY)]);
}

export function buildTactileStrip() {
  const [z0, z1] = PLATFORM.tactileZ;
  return mergeParts([plane(PLATFORM.halfLength * 2, z1 - z0, 0, (z0 + z1) / 2, 0.004)]);
}

/** One cast-iron column with plinth, fluted shaft, collar, capital and four spandrel brackets. */
export function buildCanopyColumn() {
  const top = CANOPY.ridgeY - 0.24;
  const base = latheProfile(
    [
      [0.22, 0],
      [0.22, 0.1],
      [0.19, 0.14],
      [0.17, 0.26],
      [0.13, 0.32],
      [0.115, 0.42],
    ],
    { radialSegments: 24 }
  );
  const shaftH = top - 0.42 - 0.42;
  const shaft = flutedShaft({ radiusBottom: 0.11, radiusTop: 0.095, height: shaftH, flutes: 8, depth: 0.012, entasis: 0.006, radialSegments: 48, heightSegments: 8 });
  const capital = latheProfile(
    [
      [0.095, 0],
      [0.125, 0.04],
      [0.125, 0.09],
      [0.1, 0.12],
      [0.12, 0.22],
      [0.19, 0.36],
      [0.2, 0.42],
    ],
    { radialSegments: 24 }
  );
  const parts: Part[] = [
    { geometry: base },
    { geometry: shaft, position: [0, 0.42 + shaftH / 2, 0] },
    { geometry: capital, position: [0, 0.42 + shaftH, 0] },
  ];
  // Spandrel bracket: a quarter plate with a concave edge and a punched roundel.
  const r = 0.95;
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(r, 0);
  s.lineTo(r, -0.07);
  s.absarc(r, -r, r - 0.07, Math.PI / 2, Math.PI, false);
  s.lineTo(0, -r);
  s.closePath();
  const hole = new THREE.Path();
  hole.absarc(0.2, -0.2, 0.09, 0, Math.PI * 2, true);
  s.holes.push(hole);
  for (let i = 0; i < 4; i++) {
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1, curveSegments: 10 });
    g.translate(0.08, 0, -0.0175);
    parts.push({ geometry: g, position: [0, top, 0], rotation: [0, (i * Math.PI) / 2, 0] });
  }
  const geometry = mergeParts(parts);
  bakeVertexAO(geometry, { cavity: 0.9, edges: 0.6, ground: { y: 0, height: 0.6, strength: 0.6 }, bands: [{ y: 0.42, width: 0.08, strength: 0.4 }] });
  return geometry;
}

function corrugatedSheet(width: number, depth: number, pitch = 0.11, amp = 0.022) {
  const seg = Math.round(width / (pitch / 4));
  const g = new THREE.PlaneGeometry(width, depth, seg, 1);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin((pos.getX(i) / pitch) * Math.PI * 2) * amp);
  g.computeVertexNormals();
  g.rotateX(-Math.PI / 2);
  return g;
}

function valanceStrip(length: number) {
  const p = 0.3;
  const half = length / 2;
  const s = new THREE.Shape();
  s.moveTo(-half, 0);
  const n = Math.floor(length / p);
  for (let i = 0; i < n; i++) {
    const x0 = -half + i * p;
    s.lineTo(x0, -0.24);
    s.quadraticCurveTo(x0 + 0.03, -0.44, x0 + p / 2, -0.46);
    s.quadraticCurveTo(x0 + p - 0.03, -0.44, x0 + p, -0.24);
    const h = new THREE.Path();
    h.absarc(x0 + p / 2, -0.3, 0.045, 0, Math.PI * 2, true);
    s.holes.push(h);
  }
  s.lineTo(half, 0);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.022, bevelEnabled: false, curveSegments: 3 });
}

/** Canopy ironwork, sheeting, fascia and valances (one draw, vertex coloured). */
export function buildCanopy() {
  const C = ARCH_COLORS;
  const L = CANOPY.halfLength * 2;
  const parts: ColoredPart[] = [];
  const cz = CANOPY.columnZ;
  const drop = CANOPY.ridgeY - CANOPY.eaveY;
  for (const [edgeZ, dir] of [
    [CANOPY.nearZ, -1],
    [CANOPY.farZ, 1],
  ] as const) {
    const run = Math.abs(edgeZ - cz);
    const slope = Math.atan2(drop, run);
    const midZ = (edgeZ + cz) / 2;
    const midY = (CANOPY.eaveY + CANOPY.ridgeY) / 2;
    const tilt = dir * slope; // rotation about x: rafters fall away from the ridge
    // Rafters at every column and midway.
    const xs: number[] = [];
    for (let i = 0; i < CANOPY.columnX.length; i++) {
      xs.push(CANOPY.columnX[i]);
      if (i < CANOPY.columnX.length - 1) xs.push((CANOPY.columnX[i] + CANOPY.columnX[i + 1]) / 2);
    }
    for (const x of xs) {
      parts.push({ geometry: chamferedBox(0.09, 0.2, run + 0.1, 0.012), position: [x, midY - 0.16, midZ], rotation: [tilt, 0, 0], color: C.iron });
    }
    // Purlins.
    for (const t of [0.15, 0.5, 0.85]) {
      const z = cz + (edgeZ - cz) * t;
      const y = CANOPY.ridgeY - drop * t - 0.07;
      parts.push({ geometry: chamferedBox(L, 0.09, 0.07, 0.01), position: [0, y, z], color: C.iron });
    }
    // Sheeting, fascia and valance.
    parts.push({ geometry: corrugatedSheet(L, Math.hypot(run, drop) + 0.2), position: [0, midY + 0.02, midZ + dir * 0.1], rotation: [tilt, 0, 0], color: C.sheet });
    parts.push({ geometry: chamferedBox(L, 0.2, 0.05, 0.01), position: [0, CANOPY.eaveY - 0.06, edgeZ + dir * 0.12], color: C.valance });
    const v = valanceStrip(L);
    parts.push({ geometry: v, position: [0, CANOPY.eaveY - 0.14, edgeZ + dir * 0.12 - 0.011], color: C.valance });
  }
  // Ridge girder along the column line.
  parts.push({ geometry: chamferedBox(L, 0.26, 0.14, 0.015), position: [0, CANOPY.ridgeY - 0.2, cz], color: C.iron });

  // Sodium lamp fittings: drop rod, enamel dish shade, gallery ring.
  for (const lamp of SODIUM_LAMPS) {
    const rodTop = CANOPY.eaveY + ((CANOPY.ridgeY - CANOPY.eaveY) * (SODIUM_LAMP_Z - CANOPY.nearZ)) / (cz - CANOPY.nearZ) - 0.12;
    const rodLen = rodTop - (SODIUM_LAMP_Y + 0.2);
    parts.push({ geometry: new THREE.CylinderGeometry(0.012, 0.012, rodLen, 8), position: [lamp.x, SODIUM_LAMP_Y + 0.2 + rodLen / 2, SODIUM_LAMP_Z], color: C.iron });
    const shade = latheProfile(
      [
        [0.03, 0.2],
        [0.07, 0.17],
        [0.16, 0.08],
        [0.27, 0.0],
        [0.28, -0.02],
      ],
      { radialSegments: 24, smooth: true, samples: 12, capped: false }
    );
    parts.push({ geometry: shade, position: [lamp.x, SODIUM_LAMP_Y, SODIUM_LAMP_Z], color: "#1e2a26" });
  }

  // Cast-iron benches: two ends and four timber slats each.
  for (const [bx, bz] of [
    [-10, 4.7],
    [8.2, 6.6],
  ] as const) {
    for (const e of [-1.2, 1.2]) {
      parts.push({ geometry: chamferedBox(0.06, 0.45, 0.5, 0.012), position: [bx + e, 0.225, bz], color: C.iron });
      parts.push({ geometry: chamferedBox(0.06, 0.42, 0.06, 0.012), position: [bx + e, 0.62, bz - 0.25], rotation: [-0.18, 0, 0], color: C.iron });
    }
    for (let i = 0; i < 3; i++) parts.push({ geometry: chamferedBox(2.7, 0.035, 0.11, 0.01), position: [bx, 0.46, bz - 0.15 + i * 0.13], color: C.bench });
    for (let i = 0; i < 2; i++) parts.push({ geometry: chamferedBox(2.7, 0.1, 0.03, 0.01), position: [bx, 0.62 + i * 0.16, bz - 0.27 - i * 0.03], rotation: [-0.18, 0, 0], color: C.bench });
  }

  const geometry = mergeColoredParts(parts);
  bakeVertexAO(geometry, { cavity: 0.8, edges: 0.5 });
  return geometry;
}

/** Bulbs of the sodium lamps (emissive, one draw). */
export function buildLampBulbs() {
  return mergeParts(
    SODIUM_LAMPS.map((lamp) => ({
      geometry: new THREE.SphereGeometry(0.075, 14, 10),
      position: [lamp.x, SODIUM_LAMP_Y + 0.02, SODIUM_LAMP_Z] as [number, number, number],
      scale: [1, 0.75, 1] as [number, number, number],
    }))
  );
}

// ------------------------------------------------------------------------------------
// Hall
// ------------------------------------------------------------------------------------

function archPoint(halfSpan: number, rise: number, t: number) {
  // t: 0 → left springing, 1 → right springing; elliptical arch.
  const a = Math.PI * (1 - t);
  return new THREE.Vector3(Math.cos(a) * halfSpan, HALL.springY + Math.sin(a) * rise, 0);
}

const UP = new THREE.Vector3(0, 1, 0);
const Q = new THREE.Quaternion();
const DIR = new THREE.Vector3();

function strut(a: THREE.Vector3, b: THREE.Vector3, radius: number, sides = 6) {
  DIR.subVectors(b, a);
  const len = DIR.length();
  const g = new THREE.CylinderGeometry(radius, radius, len, sides, 1, true);
  Q.setFromUnitVectors(UP, DIR.normalize());
  g.applyQuaternion(Q);
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
}

/** Lattice arch truss: outer and inner chords with a zig-zag web (instanced per bay). */
export function buildHallTruss() {
  const rise = HALL.apexY - HALL.springY;
  const depth = 0.85;
  const n = 30;
  const parts: Part[] = [];
  const outer: THREE.Vector3[] = [];
  const inner: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    outer.push(archPoint(HALL.halfSpan, rise, i / n));
    inner.push(archPoint(HALL.halfSpan - depth, rise - depth, i / n));
  }
  parts.push({ geometry: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outer), 72, 0.12, 6) });
  parts.push({ geometry: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(inner), 72, 0.09, 6) });
  for (let i = 0; i < n; i++) {
    parts.push({ geometry: strut(inner[i], outer[i + 1], 0.035) });
    parts.push({ geometry: strut(inner[i], outer[i], 0.03) });
  }
  return mergeParts(parts);
}

/** Cast-iron hall column (instanced under each truss end). */
export function buildHallColumn() {
  const h = HALL.springY;
  const g = latheProfile(
    [
      [0.5, 0],
      [0.5, 0.25],
      [0.42, 0.32],
      [0.36, 0.6],
      [0.28, 0.75],
      [0.26, 0.9],
      [0.22, h - 1.1],
      [0.3, h - 0.95],
      [0.3, h - 0.82],
      [0.24, h - 0.74],
      [0.42, h - 0.3],
      [0.46, h],
    ],
    { radialSegments: 20 }
  );
  bakeVertexAO(g, { cavity: 0.8, edges: 0.5, ground: { y: 0, height: 1.2, strength: 0.6 } });
  return g;
}

/** Roof sheeting over the arches, purlins, and the hanger girder that carries the board. */
export function buildHallRoof() {
  const rise = HALL.apexY - HALL.springY;
  const z0 = HALL.gableZ;
  const z1 = HALL.trussZ[HALL.trussZ.length - 1] + 3;
  const parts: Part[] = [];
  const shape = new THREE.Shape();
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const p = archPoint(HALL.halfSpan + 0.35, rise + 0.35, i / n);
    if (i === 0) shape.moveTo(p.x, p.y);
    else shape.lineTo(p.x, p.y);
  }
  for (let i = n; i >= 0; i--) {
    const p = archPoint(HALL.halfSpan + 0.2, rise + 0.2, i / n);
    shape.lineTo(p.x, p.y);
  }
  const roof = new THREE.ExtrudeGeometry(shape, { depth: z1 - z0, bevelEnabled: false, curveSegments: 1 });
  roof.translate(0, 0, z0);
  parts.push({ geometry: roof });
  for (let i = 1; i < 10; i++) {
    const p = archPoint(HALL.halfSpan + 0.05, rise + 0.05, i / 10);
    parts.push({ geometry: new THREE.BoxGeometry(0.16, 0.16, z1 - z0), position: [p.x, p.y, (z0 + z1) / 2] });
  }
  // Hanger girder at the board's rods (rods end at y ≈ 21.8, x = ±5.5, ±2.0).
  parts.push({ geometry: chamferedBox(16, 0.36, 0.22, 0.02), position: [0, 21.98, -6] });
  for (const x of [-7.4, 7.4]) {
    const a = new THREE.Vector3(x, 22.1, -6);
    const a2 = HALL.halfSpan - 0.85;
    const yTop = HALL.springY + (rise - 0.85) * Math.sqrt(1 - (x / a2) ** 2);
    parts.push({ geometry: strut(a, new THREE.Vector3(x, yTop, -6.4), 0.05) });
  }
  return mergeParts(parts);
}

/** Gable wall with the arched station mouth and two side arches, in brick-red masonry. */
export function buildGableWall() {
  const rise = HALL.apexY - HALL.springY;
  const shape = new THREE.Shape();
  const W = HALL.halfSpan + 2;
  shape.moveTo(-W, PLATFORM.trackY);
  shape.lineTo(W, PLATFORM.trackY);
  shape.lineTo(W, HALL.springY);
  const n = 32;
  for (let i = n; i >= 0; i--) {
    const p = archPoint(HALL.halfSpan + 0.4, rise + 0.4, i / n);
    shape.lineTo(p.x, p.y);
  }
  shape.lineTo(-W, HALL.springY);
  shape.closePath();
  const arched = (cx: number, halfW: number, y0: number, springY: number) => {
    const h = new THREE.Path();
    h.moveTo(cx - halfW, y0);
    h.lineTo(cx + halfW, y0);
    h.lineTo(cx + halfW, springY);
    h.absarc(cx, springY, halfW, 0, Math.PI, false);
    h.lineTo(cx - halfW, y0);
    return h;
  };
  shape.holes.push(arched(0, HALL.mouthHalfWidth, PLATFORM.trackY + 0.3, HALL.mouthSpringY));
  for (const s of [-1, 1]) shape.holes.push(arched(s * 18.2, 1.6, 2.4, 9.5));
  const g = new THREE.ExtrudeGeometry(shape, { depth: 1.0, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1, curveSegments: 24 });
  g.translate(0, 0, HALL.gableZ - 1.0);
  // Archivolt: a raised ring around the mouth.
  const ring = new THREE.Shape();
  ring.absarc(0, HALL.mouthSpringY, HALL.mouthHalfWidth + 0.7, 0, Math.PI, false);
  ring.lineTo(-HALL.mouthHalfWidth, HALL.mouthSpringY);
  ring.absarc(0, HALL.mouthSpringY, HALL.mouthHalfWidth, Math.PI, 0, true);
  ring.closePath();
  const ringGeo = new THREE.ExtrudeGeometry(ring, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1, curveSegments: 32 });
  ringGeo.translate(0, 0, HALL.gableZ + 0.02);
  const parts: Part[] = [{ geometry: g }, { geometry: ringGeo }];
  // String courses either side of the mouth and pilasters, so the wall has relief and rhythm.
  const outer = HALL.mouthHalfWidth + 0.75;
  const sideLen = W - outer;
  for (const y of [HALL.mouthSpringY - 0.2, HALL.springY - 0.4]) {
    for (const s of [-1, 1]) {
      parts.push({ geometry: chamferedBox(sideLen, 0.32, 0.3, 0.04), position: [s * (outer + sideLen / 2), y, HALL.gableZ + 0.12] });
    }
  }
  for (const x of [-21.6, -15.4, 15.4, 21.6]) {
    const h = HALL.springY - 0.4 - PLATFORM.trackY;
    parts.push({ geometry: chamferedBox(0.9, h, 0.36, 0.04), position: [x, PLATFORM.trackY + h / 2, HALL.gableZ + 0.15] });
  }
  const merged = mergeParts(parts);
  bakeVertexAO(merged, { cavity: 0.7, edges: 0.6 });
  return merged;
}
