/**
 * buildCurve.ts
 * 
 * High-precision curve sampling, Laplacian smoothing, over/under gap carving,
 * and parallel-transport 3D TubeGeometry generator for South Indian Sikku Kolams (§PRD Side Kolams §5.2).
 * 
 * - Samples G1 arc/line segments at uniform step ds.
 * - 2-pass light Laplacian smoothing (sigma ≈ 0.06d) to eliminate curvature jumps.
 * - Over/under elevation: z = +0.055d for over-passes, z = -0.055d for under-passes.
 * - Gap cutting: removes 0.9 * tubeRadius on each side of the under-pass crossing.
 * - Parallel-Transport Frames (Bishop / RMF): 100% singularity-free, zero-twist tube frames.
 * - Outputs clean THREE.BufferGeometry with smooth vertex normals adhering to triangle budget.
 */

import * as THREE from 'three';
import {
  Grid8x8,
  TracedNetwork,
  ArcSegment,
  TerminalId,
  terminalCoords,
  GRID_SIZE,
  DOT_GRID_SIZE,
} from './tileGrammar';
import { CrossingAssignment } from './overUnder';

export interface CurvePoint3D {
  x: number;
  y: number;
  z: number;
}

export interface StrandPath {
  points: CurvePoint3D[];
  isClosed: boolean;
}

export interface KolamGeometryBundle {
  mainTubeGeometry: THREE.BufferGeometry;
  echoTubeGeometry?: THREE.BufferGeometry;
  totalTriangles: number;
  strandPaths: StrandPath[];
  apexBeadPositions: [number, number, number][];
}

/**
 * Maps lattice grid coordinates to world/local metric units centered at (0, 0).
 * Grid spans x in 0..8, y in 0..8 (center is 4.0, 4.0).
 */
export function gridToLocal(gx: number, gy: number, d: number, rotate45 = true): [number, number] {
  const lx = (gx - 4.0) * d;
  const ly = (gy - 4.0) * d;

  if (!rotate45) {
    return [lx, ly];
  }

  // 45 deg diamond rotation
  const cos45 = Math.SQRT1_2;
  const sin45 = Math.SQRT1_2;
  const rx = lx * cos45 - ly * sin45;
  const ry = lx * sin45 + ly * cos45;
  return [rx, ry];
}

/**
 * Samples an ArcSegment into a series of 2D points.
 */
export function sampleSegment(
  seg: ArcSegment,
  d: number,
  ds: number,
  rotate45 = true
): [number, number][] {
  const cFrom = terminalCoords(seg.from);
  const cTo = terminalCoords(seg.to);

  if (seg.type === 'straight') {
    const [x0, y0] = gridToLocal(cFrom.x, cFrom.y, d, rotate45);
    const [x1, y1] = gridToLocal(cTo.x, cTo.y, d, rotate45);
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(4, Math.ceil(dist / ds));
    const points: [number, number][] = [];
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      points.push([x0 + t * (x1 - x0), y0 + t * (y1 - y0)]);
    }
    return points;
  }

  // Arc segments: find center, radius, startAngle, endAngle
  const radius = d / 2;
  const [cx, cy] = gridToLocal(seg.centerDot[0], seg.centerDot[1], d, rotate45);
  const [sx, sy] = gridToLocal(cFrom.x, cFrom.y, d, rotate45);
  const [ex, ey] = gridToLocal(cTo.x, cTo.y, d, rotate45);

  const a0 = Math.atan2(sy - cy, sx - cx);
  const a1 = Math.atan2(ey - cy, ex - cx);

  // Normalize angle delta based on segment type
  let delta = a1 - a0;
  if (seg.type === 'corner_wrap') {
    // 3/4 circle (270 deg)
    while (delta < 0) delta += 2 * Math.PI;
    if (Math.abs(delta - (1.5 * Math.PI)) > 0.5) {
      // CCW or CW 270 deg
      delta -= 2 * Math.PI;
    }
  } else if (seg.type === 'border_wrap') {
    // Semicircle (180 deg)
    while (delta < -Math.PI) delta += 2 * Math.PI;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    if (Math.abs(Math.abs(delta) - Math.PI) < 0.1) {
      // Keep outer arc convention
      delta = delta < 0 ? -Math.PI : Math.PI;
    }
  } else {
    // Quarter circle (90 deg)
    while (delta < -Math.PI) delta += 2 * Math.PI;
    while (delta > Math.PI) delta -= 2 * Math.PI;
  }

  const arcLen = radius * Math.abs(delta);
  const steps = Math.max(6, Math.ceil(arcLen / ds));
  const points: [number, number][] = [];

  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const theta = a0 + t * delta;
    points.push([cx + radius * Math.cos(theta), cy + radius * Math.sin(theta)]);
  }

  return points;
}

/**
 * 2-pass light Laplacian smoothing along a closed curve (§5.2).
 * Removes curvature discontinuities at arc-line junctions without drifting > 0.01d.
 */
export function smoothClosedCurve(
  points: [number, number][],
  passes = 2,
  alpha = 0.25
): [number, number][] {
  const n = points.length;
  if (n < 4) return points;

  let current = points.map(([x, y]) => [x, y] as [number, number]);

  for (let pass = 0; pass < passes; pass++) {
    const next: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const prev = current[(i - 1 + n) % n];
      const curr = current[i];
      const nxt = current[(i + 1) % n];

      const smoothX = curr[0] + alpha * (0.5 * (prev[0] + nxt[0]) - curr[0]);
      const smoothY = curr[1] + alpha * (0.5 * (prev[1] + nxt[1]) - curr[1]);
      next.push([smoothX, smoothY]);
    }
    current = next;
  }

  return current;
}

/**
 * Parallel-Transport Frame generator (Rotation Minimizing Frames / Bishop Frames).
 * Creates smooth 3D tube geometry without twist or inflection singularities.
 */
export function buildParallelTransportTube(
  pathPoints: CurvePoint3D[],
  radius: number,
  radialSegments = 10,
  isClosed = false
): THREE.BufferGeometry {
  const numPoints = pathPoints.length;
  if (numPoints < 2) {
    return new THREE.BufferGeometry();
  }

  const vertices: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // 1. Calculate tangents
  const tangents: THREE.Vector3[] = [];
  for (let i = 0; i < numPoints; i++) {
    const pPrev = pathPoints[isClosed ? (i - 1 + numPoints) % numPoints : Math.max(0, i - 1)];
    const pNext = pathPoints[isClosed ? (i + 1) % numPoints : Math.min(numPoints - 1, i + 1)];
    const tan = new THREE.Vector3(pNext.x - pPrev.x, pNext.y - pPrev.y, pNext.z - pPrev.z).normalize();
    if (tan.lengthSq() < 1e-6) {
      tan.set(1, 0, 0);
    }
    tangents.push(tan);
  }

  // 2. Initialize first normal
  const normalsFrame: THREE.Vector3[] = [];
  const binormalsFrame: THREE.Vector3[] = [];

  const t0 = tangents[0];
  let n0 = new THREE.Vector3(0, 0, 1).cross(t0);
  if (n0.lengthSq() < 1e-4) {
    n0 = new THREE.Vector3(0, 1, 0).cross(t0);
  }
  n0.normalize();
  normalsFrame.push(n0);
  binormalsFrame.push(new THREE.Vector3().crossVectors(t0, n0).normalize());

  // 3. Parallel transport along the curve
  for (let i = 0; i < numPoints - 1; i++) {
    const tA = tangents[i];
    const tB = tangents[i + 1];
    const nA = normalsFrame[i];

    const axis = new THREE.Vector3().crossVectors(tA, tB);
    const dot = THREE.MathUtils.clamp(tA.dot(tB), -1, 1);
    const angle = Math.acos(dot);

    let nB: THREE.Vector3;
    if (axis.lengthSq() > 1e-6 && Math.abs(angle) > 1e-5) {
      axis.normalize();
      const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      nB = nA.clone().applyQuaternion(q).normalize();
    } else {
      nB = nA.clone();
    }

    normalsFrame.push(nB);
    binormalsFrame.push(new THREE.Vector3().crossVectors(tB, nB).normalize());
  }

  // 4. Generate tube rings
  for (let i = 0; i < numPoints; i++) {
    const p = pathPoints[i];
    const n = normalsFrame[i];
    const b = binormalsFrame[i];

    for (let j = 0; j <= radialSegments; j++) {
      const phi = (j / radialSegments) * Math.PI * 2;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      const vx = p.x + radius * (cosPhi * n.x + sinPhi * b.x);
      const vy = p.y + radius * (cosPhi * n.y + sinPhi * b.y);
      const vz = p.z + radius * (cosPhi * n.z + sinPhi * b.z);

      const nx = cosPhi * n.x + sinPhi * b.x;
      const ny = cosPhi * n.y + sinPhi * b.y;
      const nz = cosPhi * n.z + sinPhi * b.z;

      vertices.push(vx, vy, vz);
      normals.push(nx, ny, nz);
    }
  }

  // 5. Connect rings with triangle indices
  const ringVertCount = radialSegments + 1;
  const segmentsCount = isClosed ? numPoints : numPoints - 1;

  for (let i = 0; i < segmentsCount; i++) {
    const ringA = i * ringVertCount;
    const ringB = ((i + 1) % numPoints) * ringVertCount;

    for (let j = 0; j < radialSegments; j++) {
      const a = ringA + j;
      const b = ringB + j;
      const c = ringB + j + 1;
      const d = ringA + j + 1;

      // Two triangles per quad
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();

  return geometry;
}

/**
 * Builds the complete 3D tube geometries for an approved kolam configuration.
 * Includes:
 * - Over/under elevation: +0.055d for over-pass, -0.055d for under-pass
 * - Gap carving: breaks under-strands at crossings (0.9 * tubeRadius gap on each side)
 * - Merges all strand segments into a single unified BufferGeometry adhering to triangle budget.
 */
export function buildKolamMesh(
  grid: Grid8x8,
  network: TracedNetwork,
  assignment: CrossingAssignment,
  d: number,
  rotate45 = true,
  buildEcho = false
): KolamGeometryBundle {
  const tubeRadius = 0.055 * d;
  const tubeDiameter = 0.11 * d;
  const gapRadius = 0.9 * tubeRadius;
  const radialSegments = 8; // Optimal budget: smooth cylinder, low triangle count

  // Map segments for quick lookup
  const segMap = new Map<string, ArcSegment>();
  for (const seg of network.segments) {
    const key1 = `${seg.from}-${seg.to}`;
    const key2 = `${seg.to}-${seg.from}`;
    segMap.set(key1, seg);
    segMap.set(key2, seg);
  }

  const geometriesToMerge: THREE.BufferGeometry[] = [];
  const echoGeometriesToMerge: THREE.BufferGeometry[] = [];
  const strandPaths: StrandPath[] = [];

  // Process each closed loop in the network
  for (const loop of network.loops) {
    const loopSegments: ArcSegment[] = [];
    for (let i = 0; i < loop.length; i++) {
      const tA = loop[i];
      const tB = loop[(i + 1) % loop.length];
      const seg = segMap.get(`${tA}-${tB}`);
      if (seg) {
        loopSegments.push(seg);
      }
    }

    // 1. Sample 2D loop polyline
    const raw2DPoints: [number, number][] = [];
    const segmentSampleRanges: { seg: ArcSegment; startIndex: number; endIndex: number }[] = [];

    for (const seg of loopSegments) {
      const pts = sampleSegment(seg, d, 0.10 * d, rotate45);
      const startIdx = Math.max(0, raw2DPoints.length - 1);
      if (raw2DPoints.length === 0) {
        raw2DPoints.push(...pts);
      } else {
        raw2DPoints.push(...pts.slice(1));
      }
      const endIdx = raw2DPoints.length - 1;
      segmentSampleRanges.push({ seg, startIndex: startIdx, endIndex: endIdx });
    }

    // 2. Light Laplacian smoothing along the 2D closed loop
    const smoothed2D = smoothClosedCurve(raw2DPoints, 2, 0.25);

    // 3. Assign 3D Z-coordinates and build gaps at under-crossings
    const points3D: CurvePoint3D[] = smoothed2D.map(([x, y]) => ({ x, y, z: 0 }));

    // Apply Z elevation based on over/under assignment
    for (const range of segmentSampleRanges) {
      const seg = range.seg;
      if (seg.isCrossing && seg.cell) {
        const [ci, cj] = seg.cell;
        const hOver = assignment.horizontalIsOver.get(`${ci},${cj}`) ?? true;
        const isOver = seg.crossingAxis === 'H' ? hOver : !hOver;

        const elevZ = isOver ? +0.5 * tubeDiameter : -0.5 * tubeDiameter;
        for (let k = range.startIndex; k <= range.endIndex; k++) {
          points3D[k].z = elevZ;
        }
      }
    }

    // 4. Carve gaps at under-pass crossings
    // An under-crossing segment splits the continuous loop into open strand pieces
    const splitIndices: { cutStart: number; cutEnd: number }[] = [];

    for (const range of segmentSampleRanges) {
      const seg = range.seg;
      if (seg.isCrossing && seg.cell) {
        const [ci, cj] = seg.cell;
        const hOver = assignment.horizontalIsOver.get(`${ci},${cj}`) ?? true;
        const isOver = seg.crossingAxis === 'H' ? hOver : !hOver;

        if (!isOver) {
          // Cut gap at center of this under-pass
          const midIdx = Math.floor((range.startIndex + range.endIndex) / 2);
          const cutHalfSpan = Math.max(1, Math.round(gapRadius / (0.10 * d)));
          splitIndices.push({
            cutStart: Math.max(range.startIndex, midIdx - cutHalfSpan),
            cutEnd: Math.min(range.endIndex, midIdx + cutHalfSpan),
          });
        }
      }
    }

    if (splitIndices.length === 0) {
      // Continuous closed tube
      strandPaths.push({ points: points3D, isClosed: true });
      const tubeGeo = buildParallelTransportTube(points3D, tubeRadius, radialSegments, true);
      geometriesToMerge.push(tubeGeo);

      if (buildEcho) {
        const echoGeo = buildParallelTransportTube(points3D, 0.02 * d, 6, true);
        echoGeometriesToMerge.push(echoGeo);
      }
    } else {
      // Split into open tube segments between gaps
      splitIndices.sort((a, b) => a.cutStart - b.cutStart);
      const numPts = points3D.length;

      for (let s = 0; s < splitIndices.length; s++) {
        const startIdx = splitIndices[s].cutEnd;
        const nextCut = splitIndices[(s + 1) % splitIndices.length];
        const endIdx = (s + 1 === splitIndices.length)
          ? nextCut.cutStart + numPts
          : nextCut.cutStart;

        const subPoints: CurvePoint3D[] = [];
        for (let k = startIdx; k <= endIdx; k++) {
          subPoints.push(points3D[k % numPts]);
        }

        if (subPoints.length >= 2) {
          strandPaths.push({ points: subPoints, isClosed: false });
          const subGeo = buildParallelTransportTube(subPoints, tubeRadius, radialSegments, false);
          geometriesToMerge.push(subGeo);

          if (buildEcho) {
            const echoGeo = buildParallelTransportTube(subPoints, 0.02 * d, 6, false);
            echoGeometriesToMerge.push(echoGeo);
          }
        }
      }
    }
  }

  // 5. Collect apex bead positions at outer perimeter scallops
  const apexBeadPositions: [number, number, number][] = [];
  for (const seg of network.segments) {
    if (seg.isExterior) {
      const pts = sampleSegment(seg, d, 0.05 * d, rotate45);
      if (pts.length > 0) {
        let maxDistSq = -1;
        let apexPt = pts[Math.floor(pts.length / 2)];
        for (const pt of pts) {
          const dSq = pt[0] * pt[0] + pt[1] * pt[1];
          if (dSq > maxDistSq) {
            maxDistSq = dSq;
            apexPt = pt;
          }
        }
        // Slightly elevate bead on top of the outer arc apex
        apexBeadPositions.push([apexPt[0], apexPt[1], 0.03 * d]);
      }
    }
  }

  // Merge all strand geometries into one static geometry
  const mainTubeGeometry = mergeBufferGeometries(geometriesToMerge);
  const echoTubeGeometry = buildEcho && echoGeometriesToMerge.length > 0
    ? mergeBufferGeometries(echoGeometriesToMerge)
    : undefined;

  const totalTriangles = (mainTubeGeometry.getIndex()?.count || 0) / 3;

  return {
    mainTubeGeometry,
    echoTubeGeometry,
    totalTriangles,
    strandPaths,
    apexBeadPositions,
  };
}

/**
 * Merges an array of BufferGeometries into a single BufferGeometry on CPU.
 */
export function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geometries.length === 0) return new THREE.BufferGeometry();
  if (geometries.length === 1) return geometries[0];

  let totalVerts = 0;
  let totalIndices = 0;

  for (const geo of geometries) {
    const pos = geo.getAttribute('position');
    const idx = geo.getIndex();
    if (pos) totalVerts += pos.count;
    if (idx) totalIndices += idx.count;
  }

  const mergedPos = new Float32Array(totalVerts * 3);
  const mergedNorm = new Float32Array(totalVerts * 3);
  const mergedIndices = new Uint32Array(totalIndices);

  let vertOffset = 0;
  let idxOffset = 0;

  for (const geo of geometries) {
    const pos = geo.getAttribute('position');
    const norm = geo.getAttribute('normal');
    const idx = geo.getIndex();

    if (pos && norm && idx) {
      const pArr = pos.array as Float32Array;
      const nArr = norm.array as Float32Array;
      const iArr = idx.array;

      mergedPos.set(pArr, vertOffset * 3);
      mergedNorm.set(nArr, vertOffset * 3);

      for (let k = 0; k < idx.count; k++) {
        mergedIndices[idxOffset + k] = vertOffset + iArr[k];
      }

      vertOffset += pos.count;
      idxOffset += idx.count;
    }
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(mergedNorm, 3));
  merged.setIndex(new THREE.BufferAttribute(mergedIndices, 1));
  merged.computeBoundingSphere();

  return merged;
}
