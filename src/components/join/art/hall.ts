// The heritage hall at the end of the quad, built for distance: correct massing and the
// shadow-casting features that read at 40 m (window reveals, sills and lintels, string
// course, cornice, hipped roof, portico, clock tower and dome). Everything is grouped by
// material and merged, so the whole building is six draws.
import * as THREE from "three";
import { chamferedBox, flutedShaft, latheProfile, mergeParts, type Part } from "@/gl/art/geometry";

type V3 = [number, number, number];

export interface HallGeometries {
  brick: THREE.BufferGeometry;
  stone: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
  slate: THREE.BufferGeometry;
  copper: THREE.BufferGeometry;
  dark: THREE.BufferGeometry;
  wood: THREE.BufferGeometry;
}

/** Square-based hipped roof: footprint w × d, height h, ridge length w - d. Base at y = 0. */
function hippedRoof(w: number, d: number, h: number) {
  const hw = w / 2;
  const hd = d / 2;
  const ridge = Math.max(0, hw - hd);
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const a = v(-hw, 0, hd), b = v(hw, 0, hd), c = v(hw, 0, -hd), e = v(-hw, 0, -hd);
  const r0 = v(-ridge, h, 0), r1 = v(ridge, h, 0);
  const tris = [
    [a, b, r1], [a, r1, r0], // front
    [c, e, r0], [c, r0, r1], // back
    [b, c, r1], // right hip
    [e, a, r0], // left hip
  ];
  const pos: number[] = [];
  for (const t of tris) for (const p of t) pos.push(p.x, p.y, p.z);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Triangular pediment (extruded), base centred at origin, depth along z. */
function pediment(width: number, height: number, depth: number) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0);
  s.lineTo(width / 2, 0);
  s.lineTo(0, height);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 1 });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** Round-headed opening (for dark belfry / door voids), facing +z. */
function archedOpening(w: number, h: number) {
  const s = new THREE.Shape();
  const r = w / 2;
  s.moveTo(-r, 0);
  s.lineTo(r, 0);
  s.lineTo(r, h - r);
  s.absarc(0, h - r, r, 0, Math.PI, false);
  s.lineTo(-r, 0);
  return new THREE.ShapeGeometry(s, 10);
}

export function buildHall(): HallGeometries {
  const brick: Part[] = [];
  const stone: Part[] = [];
  const glass: Part[] = [];
  const slate: Part[] = [];
  const copper: Part[] = [];
  const dark: Part[] = [];
  const wood: Part[] = [];
  const B = (g: THREE.BufferGeometry, p: V3, r?: V3) => brick.push({ geometry: g, position: p, rotation: r });
  const S = (g: THREE.BufferGeometry, p: V3, r?: V3) => stone.push({ geometry: g, position: p, rotation: r });

  const W = 44;
  const D = 9;
  const H = 8;
  const front = D / 2;

  // Body, base skirt, string course, cornice, parapet.
  B(chamferedBox(W, H, D, 0.04), [0, H / 2, 0]);
  S(chamferedBox(W + 0.4, 1.1, D + 0.4, 0.04), [0, 0.55, 0]);
  S(chamferedBox(W + 0.2, 0.2, D + 0.2, 0.03), [0, 4.15, 0]);
  S(chamferedBox(W + 0.3, 0.22, D + 0.3, 0.03), [0, H + 0.03, 0]);
  S(chamferedBox(W + 0.7, 0.2, D + 0.7, 0.04), [0, H + 0.24, 0]);
  S(chamferedBox(W + 0.2, 0.55, D + 0.2, 0.03), [0, H + 0.6, 0]);
  slate.push({ geometry: hippedRoof(W - 0.2, D - 0.2, 3.0), position: [0, H + 0.88, 0] });

  // Windows: dark glass set back in a reveal, sill, lintel with keystone, white sash bars.
  for (let x = -20; x <= 20.01; x += 2.5) {
    if (Math.abs(x) < 5.6) continue;
    for (const [cy, h] of [[2.55, 2.2], [6.0, 2.0]] as const) {
      // The body is one solid, so the reveal is built outward: glass on the face, dark
      // jambs and head projecting around it, then the stone dressings in front.
      const z = front;
      glass.push({ geometry: new THREE.PlaneGeometry(1.25, h), position: [x, cy, z + 0.012] });
      dark.push({ geometry: chamferedBox(0.06, h + 0.06, 0.2, 0.005), position: [x - 0.655, cy, z + 0.1] });
      dark.push({ geometry: chamferedBox(0.06, h + 0.06, 0.2, 0.005), position: [x + 0.655, cy, z + 0.1] });
      dark.push({ geometry: chamferedBox(1.37, 0.06, 0.2, 0.005), position: [x, cy + h / 2 + 0.03, z + 0.1] });
      S(chamferedBox(1.7, 0.12, 0.34, 0.02), [x, cy - h / 2 - 0.06, z + 0.17]);
      S(chamferedBox(1.75, 0.26, 0.26, 0.02), [x, cy + h / 2 + 0.19, z + 0.13]);
      S(chamferedBox(0.28, 0.34, 0.3, 0.02), [x, cy + h / 2 + 0.21, z + 0.16]);
      S(chamferedBox(0.16, h + 0.1, 0.24, 0.015), [x - 0.765, cy, z + 0.12]);
      S(chamferedBox(0.16, h + 0.1, 0.24, 0.015), [x + 0.765, cy, z + 0.12]);
      S(chamferedBox(0.05, h, 0.05, 0.005), [x, cy, z + 0.04]);
      S(chamferedBox(1.25, 0.05, 0.05, 0.005), [x, cy + h * 0.12, z + 0.04]);
    }
    // Pilaster strip between bays for vertical rhythm.
    S(chamferedBox(0.34, H - 1.1, 0.12, 0.02), [x + 1.25, 1.1 + (H - 1.1) / 2, front + 0.05]);
  }

  // Portico: steps, four fluted columns, entablature, pediment, dark doorway.
  const pz = front + 1.4;
  for (let s = 0; s < 3; s++) S(chamferedBox(10.4 - s * 0.5, 0.18, 2.6 - s * 0.35, 0.02), [0, 0.09 + s * 0.18, pz - 0.2 - s * 0.17]);
  for (const cx of [-3.3, -1.1, 1.1, 3.3]) {
    S(flutedShaft({ radiusBottom: 0.34, radiusTop: 0.29, height: 5.6, flutes: 16, depth: 0.025, radialSegments: 32, heightSegments: 4 }), [cx, 0.54 + 2.8 + 0.25, pz]);
    S(latheProfile([[0.44, 0], [0.44, 0.1], [0.38, 0.16], [0.36, 0.25]], { radialSegments: 24 }), [cx, 0.54, pz]);
    S(latheProfile([[0.3, 0], [0.38, 0.12], [0.44, 0.22]], { radialSegments: 24 }), [cx, 0.54 + 5.85, pz]);
    S(chamferedBox(0.95, 0.12, 0.95, 0.015), [cx, 0.54 + 6.13, pz]);
  }
  S(chamferedBox(9.8, 0.9, 1.9, 0.03), [0, 7.1, pz - 0.1]);
  S(chamferedBox(10.1, 0.18, 2.1, 0.03), [0, 7.64, pz - 0.1]);
  S(pediment(10.1, 2.0, 1.9), [0, 7.73, pz - 0.1]);
  S(chamferedBox(8.8, 7.0, 0.6, 0.03), [0, 3.5, front + 0.3]);
  dark.push({ geometry: archedOpening(2.4, 4.0), position: [0, 0.54, front + 0.61] });
  // Panelled double doors under a glazed fanlight, in a moulded stone surround.
  const doorZ = front + 0.64;
  for (const sx of [-1, 1]) {
    wood.push({ geometry: chamferedBox(1.12, 2.74, 0.06, 0.01), position: [sx * 0.585, 0.54 + 1.37, doorZ] });
    for (const py of [0.85, 2.0]) wood.push({ geometry: chamferedBox(0.8, 0.9, 0.03, 0.012), position: [sx * 0.585, 0.54 + py, doorZ + 0.04] });
    S(chamferedBox(0.26, 2.8, 0.22, 0.02), [sx * 1.33, 0.54 + 1.4, front + 0.7]);
  }
  S(chamferedBox(2.5, 0.1, 0.12, 0.01), [0, 0.54 + 2.79, doorZ]);
  glass.push({ geometry: new THREE.CircleGeometry(1.16, 24, 0, Math.PI), position: [0, 0.54 + 2.8, doorZ - 0.01] });
  S(new THREE.TorusGeometry(1.33, 0.12, 6, 28, Math.PI), [0, 0.54 + 2.8, front + 0.7]);
  S(chamferedBox(0.3, 0.4, 0.26, 0.02), [0, 0.54 + 2.8 + 1.33, front + 0.72]);

  // Clock tower and dome on the centre line, set back from the front.
  const tz = -0.5;
  B(chamferedBox(7.2, 6.0, 7.2, 0.04), [0, H + 3.0, tz]);
  S(chamferedBox(7.6, 0.35, 7.6, 0.03), [0, H + 6.15, tz]);
  B(chamferedBox(6.2, 4.0, 6.2, 0.04), [0, H + 8.3, tz]);
  S(chamferedBox(6.6, 0.3, 6.6, 0.03), [0, H + 10.45, tz]);
  for (const [dx, dz, ry] of [[0, 3.11, 0], [3.11, 0, Math.PI / 2], [-3.11, 0, -Math.PI / 2]] as const) {
    S(new THREE.TorusGeometry(1.25, 0.09, 6, 36), [dx, H + 8.3, tz + dz], [0, ry, 0]);
    // Clock hands (ten past ten), dark iron.
    const hx = dx === 0 ? 0 : Math.sign(dx) * 0.02;
    const hz = dz === 0 ? 0 : 0.02;
    dark.push({ geometry: chamferedBox(0.07, 0.8, 0.03, 0.005), position: [dx + hx, H + 8.3 + 0.3, tz + dz + hz], rotation: [0, ry, 0.55] });
    dark.push({ geometry: chamferedBox(0.08, 0.6, 0.03, 0.005), position: [dx + hx, H + 8.3 + 0.2, tz + dz + hz], rotation: [0, ry, -0.95] });
    // Ivory dial with hour marks.
    S(new THREE.CircleGeometry(1.18, 32), [dx, H + 8.3, tz + dz], [0, ry, 0]);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const lx = Math.sin(a) * 1.0;
      const ly = Math.cos(a) * 1.0;
      const px = dx === 0 ? lx : Math.sign(dx) * 0.015;
      const pz = dz === 0 ? -lx * Math.sign(dx) : 0.015;
      dark.push({ geometry: chamferedBox(0.05, k % 3 === 0 ? 0.2 : 0.12, 0.02, 0.004), position: [dx + px, H + 8.3 + ly, tz + dz + pz], rotation: [0, ry, -a] });
    }
  }
  // Belfry with arched openings on each face.
  S(chamferedBox(5.4, 2.6, 5.4, 0.03), [0, H + 11.9, tz]);
  for (const [dx, dz, ry] of [[0, 2.71, 0], [2.71, 0, Math.PI / 2], [-2.71, 0, -Math.PI / 2], [0, -2.71, Math.PI]] as const) {
    for (const o of [-1.2, 0, 1.2]) {
      const ox = Math.cos(ry) * o;
      const oz = -Math.sin(ry) * o;
      dark.push({ geometry: archedOpening(0.8, 1.9), position: [dx + ox, H + 10.85, tz + dz + oz], rotation: [0, ry, 0] });
    }
  }
  S(chamferedBox(5.9, 0.3, 5.9, 0.03), [0, H + 13.35, tz]);
  copper.push({
    geometry: latheProfile(
      [[2.55, 0], [2.6, 0.25], [2.45, 0.9], [2.1, 1.7], [1.5, 2.4], [0.75, 2.85], [0.32, 3.0]],
      { radialSegments: 32, smooth: true, samples: 24 }
    ),
    position: [0, H + 13.5, tz],
  });
  S(latheProfile([[0.4, 0], [0.42, 0.2], [0.3, 0.3], [0.3, 0.9], [0.42, 1.0], [0.1, 1.3], [0.04, 2.2]], { radialSegments: 16 }), [0, H + 16.45, tz]);

  return {
    brick: mergeParts(brick),
    stone: mergeParts(stone),
    glass: mergeParts(glass),
    slate: mergeParts(slate),
    copper: mergeParts(copper),
    dark: mergeParts(dark),
    wood: mergeParts(wood),
  };
}
