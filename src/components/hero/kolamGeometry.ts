/**
 * Top-Severed Peeling Wreath Kolam Geometry (§MASTER DIRECTIVE)
 * Generates two perfectly mated, symmetrical halves (Left and Right) of an authentic
 * Tamil Sikku Kolam (Kambi Kolam) with a hexagonal pulli dot lattice and a protected central void (R >= 2.05).
 * 
 * At scrollProgress = 0:
 * The Left and Right halves mate flush at top (0, y_max, 0) and bottom (0, y_min, 0),
 * appearing as a single, uninterrupted, intricate round Kolam mesh with ZERO seam.
 * 
 * Double-Hinge Rigging:
 * Pivoting from bottom-center base (0, -5, 0) allows the top seam to unlink exclusively at the top,
 * peeling outward and cascading downward into the cradling wreath underneath.
 */

import * as THREE from "three";

export const CENTER_VOID_RADIUS = 2.05;

export interface SymmetricKolamData {
  leftGeometry: THREE.BufferGeometry;
  rightGeometry: THREE.BufferGeometry;
  leftPulliPositions: Float32Array;
  rightPulliPositions: Float32Array;
  leftDotCount: number;
  rightDotCount: number;
  halfWidth: number;
  viewHeight: number;
}

/**
 * Exact Analytical Parametric 3D Curve
 */
class HalfKolamCurve extends THREE.Curve<THREE.Vector3> {
  constructor(private evaluator: (u: number) => THREE.Vector3) {
    super();
  }

  getPoint(u: number, optionalTarget = new THREE.Vector3()): THREE.Vector3 {
    const pt = this.evaluator(u);
    return optionalTarget.copy(pt);
  }
}

/**
 * Procedural curve generator for the Right Hemisphere (x >= 0).
 * All spanning curves start at (0, y_max, 0) at u = 0, and terminate at (0, y_min, 0) at u = 1.
 * Lateral loops sit strictly inside x > 0.
 */
function createRightHemisphereCurves(): HalfKolamCurve[] {
  const curves: HalfKolamCurve[] = [];

  // 1. Spanning Curve 0: Inner Laurel Ribbon (Circumference of Central Void, R >= 2.15)
  // Flush seam at u = 0 (top: 0, 2.46, 0) and u = 1 (bottom: 0, -2.46, 0)
  curves.push(
    new HalfKolamCurve((u: number) => {
      const r = 2.28 + 0.18 * Math.cos(8 * Math.PI * u);
      return new THREE.Vector3(
        r * Math.sin(Math.PI * u),
        r * Math.cos(Math.PI * u),
        0.08 * Math.sin(16 * Math.PI * u)
      );
    })
  );

  // 2. Spanning Curve 1: 8-Fold Diamond Sikku Ribbon A
  // Inner-mid interlocking knot weaving through dot lattice (top: 0, 3.30, 0 / bot: 0, -3.30, 0)
  curves.push(
    new HalfKolamCurve((u: number) => {
      const r = 2.92 + 0.38 * Math.cos(8 * Math.PI * u) + 0.14 * Math.sin(16 * Math.PI * u);
      return new THREE.Vector3(
        r * Math.sin(Math.PI * u),
        r * Math.cos(Math.PI * u),
        0.12 * Math.sin(16 * Math.PI * u)
      );
    })
  );

  // 3. Spanning Curve 2: 8-Fold Diamond Sikku Ribbon B (Counter-Phase 3D Crossings)
  // Weaves over and under Ribbon A (top: 0, 2.54, 0 / bot: 0, -2.54, 0)
  curves.push(
    new HalfKolamCurve((u: number) => {
      const r = 2.92 - 0.38 * Math.cos(8 * Math.PI * u) + 0.14 * Math.sin(16 * Math.PI * u);
      return new THREE.Vector3(
        r * Math.sin(Math.PI * u),
        r * Math.cos(Math.PI * u),
        -0.12 * Math.sin(16 * Math.PI * u)
      );
    })
  );

  // 4. Spanning Curve 3: 12-Fold Star Serpentine Ribbon A
  // Harmonic middle band across zodiac radial rays (top: 0, 4.04, 0 / bot: 0, -4.04, 0)
  curves.push(
    new HalfKolamCurve((u: number) => {
      const r = 3.62 + 0.42 * Math.cos(12 * Math.PI * u) + 0.12 * Math.sin(24 * Math.PI * u);
      return new THREE.Vector3(
        r * Math.sin(Math.PI * u),
        r * Math.cos(Math.PI * u),
        0.14 * Math.sin(24 * Math.PI * u)
      );
    })
  );

  // 5. Spanning Curve 4: 12-Fold Star Serpentine Ribbon B (Counter-Phase Crossings)
  // (top: 0, 3.20, 0 / bot: 0, -3.20, 0)
  curves.push(
    new HalfKolamCurve((u: number) => {
      const r = 3.62 - 0.42 * Math.cos(12 * Math.PI * u) + 0.12 * Math.sin(24 * Math.PI * u);
      return new THREE.Vector3(
        r * Math.sin(Math.PI * u),
        r * Math.cos(Math.PI * u),
        -0.14 * Math.sin(24 * Math.PI * u)
      );
    })
  );

  // 6. Spanning Curve 5: 16-Petal Outer Scallop Border A
  // Sacred perimeter lotus framing (top: 0, 4.80, 0 / bot: 0, -4.80, 0)
  curves.push(
    new HalfKolamCurve((u: number) => {
      const r = 4.35 + 0.45 * Math.cos(16 * Math.PI * u);
      return new THREE.Vector3(
        r * Math.sin(Math.PI * u),
        r * Math.cos(Math.PI * u),
        0.10 * Math.sin(16 * Math.PI * u)
      );
    })
  );

  // 7. Spanning Curve 6: 16-Petal Outer Scallop Border B (Counter-Phase Crossings)
  // (top: 0, 3.90, 0 / bot: 0, -3.90, 0)
  curves.push(
    new HalfKolamCurve((u: number) => {
      const r = 4.35 - 0.45 * Math.cos(16 * Math.PI * u);
      return new THREE.Vector3(
        r * Math.sin(Math.PI * u),
        r * Math.cos(Math.PI * u),
        -0.10 * Math.sin(16 * Math.PI * u)
      );
    })
  );

  // 8. Lateral Closed Knot 7: Equator Flank Flower at (2.80, 0)
  curves.push(
    new HalfKolamCurve((u: number) => {
      const th = 2 * Math.PI * u;
      return new THREE.Vector3(
        2.80 + 0.75 * Math.cos(th) + 0.20 * Math.cos(3 * th),
        0.75 * Math.sin(th) + 0.20 * Math.sin(3 * th),
        0.12 * Math.sin(2 * th)
      );
    })
  );

  // 9. Lateral Closed Knot 8: Upper Quadrant Knot at (2.35, 2.35)
  curves.push(
    new HalfKolamCurve((u: number) => {
      const th = 2 * Math.PI * u;
      return new THREE.Vector3(
        2.35 + 0.55 * Math.cos(th),
        2.35 + 0.55 * Math.sin(th),
        0.09 * Math.sin(3 * th)
      );
    })
  );

  // 10. Lateral Closed Knot 9: Lower Quadrant Knot at (2.35, -2.35)
  curves.push(
    new HalfKolamCurve((u: number) => {
      const th = 2 * Math.PI * u;
      return new THREE.Vector3(
        2.35 + 0.55 * Math.cos(th),
        -2.35 + 0.55 * Math.sin(th),
        -0.09 * Math.sin(3 * th)
      );
    })
  );

  return curves;
}

/**
 * Procedurally builds perfectly mated Left and Right Kolam halves.
 */
export function buildSymmetricKolamHalves(
  isMobile: boolean,
  radialSegments = 8,
  tubeRadius = 0.024
): SymmetricKolamData {
  const halfWidth = isMobile ? 4.4 : 5.8;
  const viewHeight = isMobile ? 7.0 : 8.0;

  // 1. Generate Hexagonal Pulli Lattice (Dot Grid)
  const spacing = isMobile ? 0.54 : 0.48;
  const maxN = isMobile ? 7 : 9;
  const rightDots: [number, number, number][] = [];

  for (let r = -maxN; r <= maxN; r++) {
    const cols = maxN * 2 + 1 - Math.abs(r) * 2;
    for (let c = 0; c < cols; c++) {
      const col = -(cols - 1) / 2 + c;
      const x = col * spacing;
      const y = r * (spacing * 0.866);
      const dist = Math.sqrt(x * x + y * y);

      // Dots in right hemisphere: strictly x >= 0.18 to ensure zero overlap at the top/bottom seam
      if (x >= 0.18 && dist >= CENTER_VOID_RADIUS && dist <= (isMobile ? 4.1 : 4.8)) {
        rightDots.push([x, y, 0.02]);
      }
    }
  }

  const rightDotCount = rightDots.length;
  const leftDotCount = rightDotCount;

  const rightPulliPositions = new Float32Array(rightDotCount * 3);
  const leftPulliPositions = new Float32Array(leftDotCount * 3);

  for (let i = 0; i < rightDotCount; i++) {
    const [x, y, z] = rightDots[i];
    rightPulliPositions[i * 3] = x;
    rightPulliPositions[i * 3 + 1] = y;
    rightPulliPositions[i * 3 + 2] = z;

    // Symmetrical reflection for Left dots
    leftPulliPositions[i * 3] = -x;
    leftPulliPositions[i * 3 + 1] = y;
    leftPulliPositions[i * 3 + 2] = z;
  }

  // 2. Direct Tube Geometry Generation for Right Hemisphere
  const curves = createRightHemisphereCurves();
  const tubularSegments = isMobile ? 64 : 80;

  const posArr: number[] = [];
  const normArr: number[] = [];
  const arcArr: number[] = [];
  const indexArr: number[] = [];
  let vertexOffset = 0;

  for (let cIdx = 0; cIdx < curves.length; cIdx++) {
    const curve = curves[cIdx];
    const frames = curve.computeFrenetFrames(tubularSegments, false);

    for (let i = 0; i <= tubularSegments; i++) {
      const u = i / tubularSegments;
      const centerPt = curve.getPointAt(u);
      const N = frames.normals[i];
      const B = frames.binormals[i];
      const arc = (cIdx / curves.length) * 0.25 + u * 0.70;

      for (let j = 0; j <= radialSegments; j++) {
        const v = (j / radialSegments) * Math.PI * 2;
        const cx = -tubeRadius * Math.cos(v);
        const cy = tubeRadius * Math.sin(v);

        const vx = centerPt.x + cx * N.x + cy * B.x;
        const vy = centerPt.y + cx * N.y + cy * B.y;
        const vz = centerPt.z + cx * N.z + cy * B.z;

        const nx = cx * N.x + cy * B.x;
        const ny = cx * N.y + cy * B.y;
        const nz = cx * N.z + cy * B.z;
        const nLen = Math.hypot(nx, ny, nz) || 1;

        posArr.push(vx, vy, vz);
        normArr.push(nx / nLen, ny / nLen, nz / nLen);
        arcArr.push(arc);
      }
    }

    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = vertexOffset + i * (radialSegments + 1) + j;
        const b = vertexOffset + (i + 1) * (radialSegments + 1) + j;
        const c = vertexOffset + (i + 1) * (radialSegments + 1) + (j + 1);
        const d = vertexOffset + i * (radialSegments + 1) + (j + 1);

        indexArr.push(a, b, d);
        indexArr.push(b, c, d);
      }
    }

    vertexOffset += (tubularSegments + 1) * (radialSegments + 1);
  }

  const rightGeometry = new THREE.BufferGeometry();
  rightGeometry.setAttribute("position", new THREE.Float32BufferAttribute(posArr, 3));
  rightGeometry.setAttribute("normal", new THREE.Float32BufferAttribute(normArr, 3));
  rightGeometry.setAttribute("aArc", new THREE.Float32BufferAttribute(arcArr, 1));
  rightGeometry.setIndex(indexArr);

  // 3. Perfect Mathematical Reflection for Left Hemisphere
  const leftGeometry = rightGeometry.clone();
  const pos = leftGeometry.attributes.position;
  const norm = leftGeometry.attributes.normal;

  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, -pos.getX(i));
    norm.setX(i, -norm.getX(i));
  }

  // Reverse triangle winding order so front faces point outward
  const idx = leftGeometry.index;
  if (idx) {
    for (let i = 0; i < idx.count; i += 3) {
      const b = idx.getX(i + 1);
      const c = idx.getX(i + 2);
      idx.setX(i + 1, c);
      idx.setX(i + 2, b);
    }
  }

  return {
    leftGeometry,
    rightGeometry,
    leftPulliPositions,
    rightPulliPositions,
    leftDotCount,
    rightDotCount,
    halfWidth,
    viewHeight,
  };
}
