// ICF-style coach shell for the art pass: a real side wall with window and door openings
// (extruded, bevelled reveals), an elliptical roof with gutters and torpedo ventilators,
// riveted ribs, faded cream bands, underframe and bogies. Everything that shares the body
// material is merged into one geometry with per-part vertex colours, so a whole coach is
// two draws (body + lit glass) and the neighbour coaches are one instanced draw each.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { chamferedBox, latheProfile, mergeParts, seeded, type Part } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";
import { COACH } from "./layout";

export interface ColoredPart extends Part {
  color: THREE.ColorRepresentation;
  /** Multiplier on the colour (HDR for emissive glass). */
  gain?: number;
}

/** mergeParts, but keeps one flat vertex colour per part (linear) so one material serves many finishes. */
export function mergeColoredParts(parts: ColoredPart[]): THREE.BufferGeometry {
  const color = new THREE.Color();
  const baked = parts.map((part) => {
    const g = mergeParts([part]);
    color.set(part.color).multiplyScalar(part.gain ?? 1);
    const count = g.attributes.position.count;
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      data[i * 3] = color.r;
      data[i * 3 + 1] = color.g;
      data[i * 3 + 2] = color.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(data, 3));
    return g;
  });
  const merged = mergeGeometries(baked, false);
  baked.forEach((g) => g.dispose());
  if (!merged) throw new Error("mergeColoredParts: geometries could not be merged");
  return merged;
}

export const COACH_COLORS = {
  paint: "#26435e",
  paintDoor: "#213a52",
  cream: "#b9ab88",
  roof: "#353b42",
  dark: "#0d1014",
  steel: "#2a3038",
} as const;

const HALF = COACH.length / 2;

function rectHole(cx: number, cy: number, w: number, h: number) {
  const p = new THREE.Path();
  p.moveTo(cx - w / 2, cy - h / 2);
  p.lineTo(cx + w / 2, cy - h / 2);
  p.lineTo(cx + w / 2, cy + h / 2);
  p.lineTo(cx - w / 2, cy + h / 2);
  p.closePath();
  return p;
}

const DOOR = { w: 0.82, bottom: 0.95, top: 2.45 } as const;

/** Side wall with real openings: hero window (optional), four compartment windows, two doors. */
function sideWall(withHeroOpening: boolean) {
  const shape = new THREE.Shape();
  shape.moveTo(-HALF, COACH.wallBottomY);
  shape.lineTo(HALF, COACH.wallBottomY);
  shape.lineTo(HALF, COACH.wallTopY);
  shape.lineTo(-HALF, COACH.wallTopY);
  shape.closePath();
  const { heroWindow: hw, sideWindow: sw } = COACH;
  if (withHeroOpening) shape.holes.push(rectHole(hw.x, hw.y, hw.w, hw.h));
  else shape.holes.push(rectHole(hw.x, sw.y, sw.w, sw.h));
  for (const x of COACH.sideWindowX) shape.holes.push(rectHole(x, sw.y, sw.w, sw.h));
  for (const x of COACH.doorX) shape.holes.push(rectHole(x, (DOOR.bottom + DOOR.top) / 2, DOOR.w, DOOR.top - DOOR.bottom));
  const depth = 0.24;
  const bevel = 0.012;
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    curveSegments: 4,
  });
  g.translate(0, 0, COACH.wallFrontZ - depth - bevel);
  return g;
}

/** Elliptical roof section extruded along the coach, with drip gutters at both eaves. */
function roofShell() {
  const front = COACH.wallFrontZ;
  const back = COACH.backZ;
  const base = COACH.wallTopY;
  const rise = 0.52;
  const pts: [number, number][] = [
    [front + 0.07, base - 0.03],
    [front + 0.07, base + 0.07],
    [front, base + 0.1],
  ];
  const n = 26;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const z = front + (back - front) * t;
    const e = Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
    pts.push([z, base + 0.1 + rise * Math.pow(e, 0.75)]);
  }
  pts.push([back, base + 0.1], [back - 0.07, base + 0.07], [back - 0.07, base - 0.03]);
  // Shape X = -z (see rotation below), Y = y.
  const shape = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(-z, y)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: COACH.length + 0.1, bevelEnabled: false, curveSegments: 1 });
  g.rotateY(Math.PI / 2);
  g.translate(-(COACH.length + 0.1) / 2, 0, 0);
  return g;
}

function ventilator() {
  return latheProfile(
    [
      [0.11, 0],
      [0.11, 0.03],
      [0.1, 0.07],
      [0.065, 0.1],
      [0.02, 0.115],
    ],
    { radialSegments: 14, smooth: true, samples: 10 }
  );
}

function cylinderX(radius: number, length: number, segments = 12) {
  const g = new THREE.CylinderGeometry(radius, radius, length, segments);
  g.rotateZ(Math.PI / 2);
  return g;
}

function cylinderZ(radius: number, length: number, segments = 18) {
  const g = new THREE.CylinderGeometry(radius, radius, length, segments);
  g.rotateX(Math.PI / 2);
  return g;
}

export interface CoachGeometries {
  body: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
}

/**
 * Builds one coach. `hero` keeps the window opening at x = 0 open for the WindowAssembly;
 * neighbour coaches glaze it like the other compartments.
 */
export function buildCoach({ hero, seed }: { hero: boolean; seed: number }): CoachGeometries {
  const rand = seeded(seed);
  const C = COACH_COLORS;
  const zf = COACH.wallFrontZ;
  const parts: ColoredPart[] = [];
  const glassParts: ColoredPart[] = [];

  parts.push({ geometry: sideWall(hero), color: C.paint });
  // Skirt and lower body panel.
  parts.push({ geometry: chamferedBox(COACH.length, 0.52, 0.3, 0.02), position: [0, 0.6, zf - 0.15], color: C.paint });
  // End bulkheads close the shell when a coach is seen end-on in the fog.
  for (const s of [-1, 1]) {
    parts.push({ geometry: chamferedBox(0.12, 2.5, zf - COACH.backZ, 0.02), position: [s * (HALF - 0.06), 1.6, (zf + COACH.backZ) / 2], color: C.paint });
  }
  // Corrugation ribs below and above the window band.
  for (const y of [0.95, 2.27]) {
    parts.push({ geometry: chamferedBox(COACH.length - 0.1, 0.03, 0.026, 0.008), position: [0, y, zf + 0.012], color: C.paint });
  }
  // Faded cream livery bands.
  for (const y of [1.08, 2.46]) {
    parts.push({ geometry: chamferedBox(COACH.length - 0.08, 0.028, 0.02, 0.006), position: [0, y, zf + 0.01], color: C.cream });
  }
  // Roof, eave gutters and ventilators along the crown.
  parts.push({ geometry: roofShell(), color: C.roof });
  const crownZ = (zf + COACH.backZ) / 2;
  const crownY = COACH.wallTopY + 0.1 + 0.52;
  for (let x = -HALF + 1.4; x <= HALF - 1.3; x += 1.6) {
    parts.push({ geometry: ventilator(), position: [x, crownY - 0.03, crownZ], color: C.roof });
  }

  // Windows: dark frames, shutters, safety bars, drip mouldings, lit glass.
  const windows: { x: number; w: number; h: number; y: number; glazed: boolean }[] = COACH.sideWindowX.map((x) => ({
    x,
    w: COACH.sideWindow.w,
    h: COACH.sideWindow.h,
    y: COACH.sideWindow.y,
    glazed: true,
  }));
  if (!hero) windows.push({ x: 0, w: COACH.sideWindow.w, h: COACH.sideWindow.h, y: COACH.sideWindow.y, glazed: true });
  for (const win of windows) {
    const t = 0.04;
    const fz = zf - 0.03;
    parts.push({ geometry: chamferedBox(win.w + 0.02, t, 0.05, 0.008), position: [win.x, win.y + win.h / 2 - t / 2, fz], color: C.steel });
    parts.push({ geometry: chamferedBox(win.w + 0.02, t, 0.06, 0.008), position: [win.x, win.y - win.h / 2 + t / 2, fz + 0.01], color: C.steel });
    for (const s of [-1, 1]) {
      parts.push({ geometry: chamferedBox(t, win.h, 0.05, 0.008), position: [win.x + s * (win.w / 2 - t / 2), win.y, fz], color: C.steel });
    }
    // Drip moulding over the opening.
    parts.push({ geometry: chamferedBox(win.w + 0.16, 0.026, 0.05, 0.008), position: [win.x, win.y + win.h / 2 + 0.07, zf + 0.02], color: C.paint });
    // Half-lowered shutter and bars.
    const shutter = 0.12 + rand() * 0.22;
    parts.push({ geometry: chamferedBox(win.w - 0.06, shutter, 0.014, 0.004), position: [win.x, win.y + win.h / 2 - shutter / 2 - 0.04, zf - 0.08], color: C.dark });
    for (let b = 0; b < 4; b++) {
      parts.push({ geometry: cylinderX(0.008, win.w - 0.04, 8), position: [win.x, win.y - win.h / 2 + 0.12 + b * 0.15, zf - 0.04], color: C.dark });
    }
    const lit = rand();
    const warm = lit > 0.22;
    glassParts.push({
      geometry: new THREE.PlaneGeometry(win.w - 0.04, win.h - 0.04),
      position: [win.x, win.y, zf - 0.1],
      color: warm ? (rand() > 0.7 ? "#ffcf8a" : "#ff9c48") : "#2a2018",
      gain: warm ? 0.9 + rand() * 1.1 : 1,
    });
  }

  // Doors: recessed leaf, small lit pane, grab rails, step.
  for (const x of COACH.doorX) {
    const h = DOOR.top - DOOR.bottom;
    parts.push({ geometry: chamferedBox(DOOR.w - 0.02, h - 0.02, 0.05, 0.01), position: [x, (DOOR.bottom + DOOR.top) / 2, zf - 0.12], color: C.paintDoor });
    glassParts.push({ geometry: new THREE.PlaneGeometry(0.34, 0.4), position: [x, DOOR.top - 0.36, zf - 0.09], color: "#ffb766", gain: 0.6 + rand() * 0.5 });
    for (const s of [-1, 1]) {
      parts.push({ geometry: new THREE.CylinderGeometry(0.016, 0.016, 1.25, 10), position: [x + s * (DOOR.w / 2 + 0.07), 1.65, zf + 0.06], color: C.steel });
    }
    parts.push({ geometry: chamferedBox(DOOR.w + 0.1, 0.05, 0.24, 0.01), position: [x, 0.42, zf + 0.06], color: C.dark });
  }

  // Underframe, equipment boxes, bogies, buffers: mostly below the coping, seen from the crane.
  parts.push({ geometry: chamferedBox(COACH.length - 1.2, 0.8, 2.4, 0.03), position: [0, -0.1, crownZ], color: C.dark });
  for (let i = 0; i < 4; i++) {
    parts.push({ geometry: chamferedBox(0.9 + rand() * 0.8, 0.45, 0.7, 0.02), position: [-4.5 + i * 3 + rand(), -0.32, zf - 0.55], color: C.steel });
  }
  for (const bx of [-7.4, 7.4]) {
    parts.push({ geometry: chamferedBox(2.7, 0.28, 0.14, 0.02), position: [bx, -0.62, zf - 0.32], color: C.dark });
    for (const w of [-0.95, 0.95]) {
      parts.push({ geometry: cylinderZ(0.46, 0.1), position: [bx + w, -0.7, zf - 0.42], color: C.dark });
    }
  }
  for (const s of [-1, 1]) {
    for (const bz of [zf - 0.7, COACH.backZ + 0.7]) {
      parts.push({ geometry: cylinderX(0.13, 0.36, 12), position: [s * (HALF + 0.12), 0.25, bz], color: C.steel });
    }
  }

  const body = mergeColoredParts(parts);
  bakeVertexAO(body, { cavity: 0.9, edges: 0.7, ground: { y: -0.2, height: 1.1, strength: 0.55 } });
  const glass = mergeColoredParts(glassParts);
  return { body, glass };
}
