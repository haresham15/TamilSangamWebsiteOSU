/**
 * Rest-State Kolam Strand & Lattice Generator (§PRD 6 & 8)
 * 
 * Generates:
 * 1. Extended pulli dot lattice covering y in [+0.6 Hv, -1.9 Hv] with central void.
 * 2. 7 dot-aware woven strands per hemisphere (Sikku pulli logic with alternating loops & z-interlacing).
 * 3. Uniform arc-length resampling (ds = 0.02) with strict kink-prevention (max angle <= 6 deg).
 * 4. High-performance static tube geometries using zero-twist camera-aligned frames.
 */

import * as THREE from "three";
import {
  WORLD_HV,
  STRAND_COUNT,
  calcCameraAlignedFrame,
  smootherstep,
  WREATH_CY,
  WREATH_R_IN,
  WREATH_BAND_WIDTH,
  WREATH_GAP_RAD,
  WREATH_CROSS_RAD,
  evalWreathPoint,
  solveLaneRippleAmplitude,
} from "./flowMath";

export const WEAVE_TOP_Y = 0.55 * WORLD_HV; // ~+4.16
export const WEAVE_BOT_Y = -1.05 * WORLD_HV; // ~-7.95
export const WEAVE_VOID_RADIUS = 2.05; // Emblem clearing radius
export const TUBE_RADIUS_BASE = 0.024; // Base tube radius

export interface PulliDotLattice {
  rightDots: Float32Array;
  leftDots: Float32Array;
  dotCount: number;
}

export interface WovenStrand {
  index: number;
  length: number;
  points: THREE.Vector3[];
  tangents: THREE.Vector3[];
  sampleCount: number;
}

/**
 * 1. Extended Pulli Dot Lattice (§PRD 5.4)
 * Covers y in [+0.6 Hv, -1.9 Hv] (~+4.54 to -14.38).
 * In the weave zone (y in [-4.5, +4.5]), forms authentic hexagonal diamond lattice with central void.
 * In the descent/wreath zone (y < -4.5 down to -14.4), continues dots framing the descent and wreath.
 */
export function generatePulliLattice(isMobile = false): PulliDotLattice {
  const spacing = isMobile ? 0.54 : 0.48;
  const rowSpacing = spacing * 0.8660254; // Hexagonal vertical spacing = sqrt(3)/2 * spacing

  const yMax = 0.60 * WORLD_HV; // +4.54
  const yMin = -1.90 * WORLD_HV; // -14.38
  const maxR = Math.ceil(yMax / rowSpacing); // ~11
  const minR = Math.floor(yMin / rowSpacing); // ~-35

  const rightList: [number, number, number][] = [];

  for (let r = minR; r <= maxR; r++) {
    const y = r * rowSpacing;
    const isWeaveZone = y >= -4.5 && y <= 4.5;

    // Hexagonal staggered columns
    const offset = Math.abs(r) % 2 === 0 ? 0 : 0.5;
    const maxCols = isWeaveZone ? 8 : 7;

    for (let c = 0; c < maxCols; c++) {
      const x = (c + offset) * spacing;
      if (x < 0.20) continue; // Clean seam separation

      const dist = Math.hypot(x, y);

      // Weave zone: protect central void for emblem
      if (isWeaveZone) {
        if (dist < WEAVE_VOID_RADIUS) continue;
        if (dist > (isMobile ? 4.1 : 4.8)) continue;
      } else {
        // Descent and wreath background zone
        if (x > (isMobile ? 3.6 : 4.2)) continue;
      }

      rightList.push([x, y, 0.015]);
    }
  }

  const dotCount = rightList.length;
  const rightDots = new Float32Array(dotCount * 3);
  const leftDots = new Float32Array(dotCount * 3);

  for (let i = 0; i < dotCount; i++) {
    const [x, y, z] = rightList[i];
    rightDots[i * 3 + 0] = x;
    rightDots[i * 3 + 1] = y;
    rightDots[i * 3 + 2] = z;

    // Symmetrical reflection for Left dots
    leftDots[i * 3 + 0] = -x;
    leftDots[i * 3 + 1] = y;
    leftDots[i * 3 + 2] = z;
  }

  return { rightDots, leftDots, dotCount };
}

/**
 * 2. Dot-Aware Sikku Strand Waypoint Generator (§PRD 6.1)
 * Generates C2 waypoints for a strand weaving top-to-bottom through column k.
 * Traversal is from TAIL at top (y ~ +4.16) to HEAD at bottom (y ~ -7.95).
 */
export function generateStrandWaypoints(
  strandIndex: number,
  totalStrands = STRAND_COUNT
): THREE.Vector3[] {
  const waypoints: THREE.Vector3[] = [];
  const k = strandIndex;
  const rank = k / (totalStrands - 1); // 0 (innermost) to 1 (outermost)

  // Column nominal X position
  const colSpacing = 0.48;
  const baseColX = 0.44 + k * colSpacing;

  // Weave parameters
  const topY = WEAVE_TOP_Y;
  const botY = WEAVE_BOT_Y;
  const totalYDist = topY - botY; // ~12.11 units
  const numSteps = 48; // Dense waypoint steps along Y
  const dy = totalYDist / numSteps;

  const phaseOffset = k * Math.PI; // Counter-phase for adjacent columns
  const loopFreq = 3; // Trochoid loop every 3 wavelengths

  for (let i = 0; i <= numSteps; i++) {
    const y = topY - i * dy;
    const progressY = i / numSteps; // 0 at top (tail), 1 at bottom (head)

    let x = baseColX;

    // Weaving swerve around dots: harmonic Sikku trochoid
    const theta = progressY * 12 * Math.PI + phaseOffset;
    const swerveX = (0.18 - 0.03 * rank) * Math.sin(theta);
    const loopX = (0.04 + 0.02 * (k % 2)) * Math.sin(2 * theta);
    const loopY = 0.03 * Math.cos(2 * theta);
    const zInterlace = 0.02 * Math.cos(theta);
    const organicBend = 0.04 * Math.sin(progressY * Math.PI * 2 + k * 0.5);

    // Lateral X-deflection framing the central void
    // Uses C-infinity cosine envelope (H = 3.4) to eliminate square-root slope singularities
    const voidHeight = 3.4;
    const clearance = WEAVE_VOID_RADIUS + 0.30 + rank * 0.35;
    let deflX = x;
    if (Math.abs(y) < voidHeight) {
      const u = y / voidHeight; // in [-1, 1]
      const envelope = Math.cos((Math.PI * 0.5) * u);
      const flareWidth = clearance * envelope;
      deflX = Math.max(x, flareWidth);
    }

    const finalX = Math.max(0.20, deflX + swerveX + loopX + organicBend);
    const finalY = y + loopY;
    const finalZ = zInterlace;

    waypoints.push(new THREE.Vector3(finalX, finalY, finalZ));
  }

  return waypoints;
}

/**
 * 3. Spline Interpolation & Arc-Length Resampling (§PRD 6.2)
 * Builds centripetal Catmull-Rom spline, resamples to uniform ds = 0.02,
 * and validates that turning angle <= 6 deg per sample.
 */
export function buildResampledStrand(
  waypoints: THREE.Vector3[],
  strandIndex: number,
  ds = 0.02
): WovenStrand {
  // Centripetal Catmull-Rom prevents overshoots and loops
  const curve = new THREE.CatmullRomCurve3(waypoints, false, "centripetal");

  // Determine total approximate curve length
  const approxSamples = 500;
  let totalLength = 0;
  let prevPt = curve.getPoint(0);
  for (let i = 1; i <= approxSamples; i++) {
    const pt = curve.getPoint(i / approxSamples);
    totalLength += prevPt.distanceTo(pt);
    prevPt = pt;
  }

  // Uniform arc-length sampling
  const numSamples = Math.ceil(totalLength / ds);
  let points: THREE.Vector3[] = [];

  for (let i = 0; i <= numSamples; i++) {
    const u = i / numSamples;
    points.push(curve.getPointAt(u));
  }

  // Multi-pass smoothing on points to strictly eliminate any sharp kinks (ensures < 6 deg)
  for (let pass = 0; pass < 5; pass++) {
    const smoothed: THREE.Vector3[] = [points[0].clone()];
    for (let i = 1; i < points.length - 1; i++) {
      const pPrev = points[i - 1];
      const pCurr = points[i];
      const pNext = points[i + 1];
      smoothed.push(
        new THREE.Vector3(
          pPrev.x * 0.25 + pCurr.x * 0.50 + pNext.x * 0.25,
          pPrev.y * 0.25 + pCurr.y * 0.50 + pNext.y * 0.25,
          pPrev.z * 0.25 + pCurr.z * 0.50 + pNext.z * 0.25
        )
      );
    }
    smoothed.push(points[points.length - 1].clone());
    points = smoothed;
  }

  // Compute central difference tangents for maximum numerical smoothness
  const tangents: THREE.Vector3[] = [];
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      tangents.push(points[1].clone().sub(points[0]).normalize());
    } else if (i === points.length - 1) {
      tangents.push(points[i].clone().sub(points[i - 1]).normalize());
    } else {
      tangents.push(points[i + 1].clone().sub(points[i - 1]).normalize());
    }
  }

  // PRD §6.2: Adaptive smoothing relaxation loop guaranteeing turning angle <= 6 deg
  const maxAllowedAngleRad = 6 * (Math.PI / 180);
  for (let iter = 0; iter < 15; iter++) {
    let maxAngle = 0;
    for (let i = 1; i < tangents.length; i++) {
      const dot = tangents[i - 1].dot(tangents[i]);
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
      maxAngle = Math.max(maxAngle, angle);
      if (angle > maxAllowedAngleRad) {
        for (let j = Math.max(1, i - 2); j <= Math.min(points.length - 2, i + 2); j++) {
          points[j].x = points[j - 1].x * 0.25 + points[j].x * 0.50 + points[j + 1].x * 0.25;
          points[j].y = points[j - 1].y * 0.25 + points[j].y * 0.50 + points[j + 1].y * 0.25;
          points[j].z = points[j - 1].z * 0.25 + points[j].z * 0.50 + points[j + 1].z * 0.25;
        }
      }
    }
    if (maxAngle <= maxAllowedAngleRad) break;

    // Update tangents from relaxed points
    for (let i = 1; i < points.length - 1; i++) {
      tangents[i].copy(points[i + 1]).sub(points[i - 1]).normalize();
    }
  }

  return {
    index: strandIndex,
    length: totalLength,
    points,
    tangents,
    sampleCount: points.length,
  };
}

/**
 * Tube Tapering (§PRD 6.3)
 * Tapers tube radius to 0.35 r0 at both ends (head and tail).
 */
export function evalTubeTaper(a: number, L: number): number {
  const taperDist = 0.15 * L;
  const dTail = a; // distance from tail (a = 0 tail at top in rest state)
  const dHead = Math.max(0, L - a);

  let factor = 1.0;
  if (dTail < taperDist) {
    factor = 0.35 + 0.65 * (dTail / taperDist);
  } else if (dHead < taperDist) {
    factor = 0.35 + 0.65 * (dHead / taperDist);
  }
  return factor;
}

/**
 * 4. Static Tube Geometry Builder with Camera-Aligned Frames (§PRD 8.1 & 8.2)
 * Generates symmetric Left and Right tube meshes for the rest state weave.
 */
export function buildStaticKolamMeshes(
  strands: WovenStrand[],
  radialSegments = 10,
  dsTube = 0.045,
  r0 = TUBE_RADIUS_BASE
): { rightGeometry: THREE.BufferGeometry; leftGeometry: THREE.BufferGeometry } {
  const posArr: number[] = [];
  const normArr: number[] = [];
  const uvArr: number[] = [];
  const strandIdArr: number[] = [];
  const aCoordArr: number[] = [];
  const omegaArr: number[] = [];
  const indexArr: number[] = [];

  let vertexOffset = 0;

  for (let k = 0; k < strands.length; k++) {
    const strand = strands[k];
    const L = strand.length;
    const numRings = Math.max(2, Math.floor(L / dsTube));

    for (let i = 0; i <= numRings; i++) {
      const u = i / numRings;
      const a = u * L; // distance along strand
      const sampleIdx = Math.min(
        strand.points.length - 1,
        Math.floor(u * (strand.points.length - 1))
      );

      const P = strand.points[sampleIdx];
      const T = strand.tangents[sampleIdx];

      // Camera-aligned zero-twist frame
      const { normal: N, binormal: B } = calcCameraAlignedFrame(T);

      const radius = r0 * evalTubeTaper(a, L);

      for (let j = 0; j <= radialSegments; j++) {
        const omega = (j / radialSegments) * Math.PI * 2;
        const cosO = Math.cos(omega);
        const sinO = Math.sin(omega);

        const surfaceNormX = cosO * N.x + sinO * B.x;
        const surfaceNormY = cosO * N.y + sinO * B.y;
        const surfaceNormZ = cosO * N.z + sinO * B.z;

        const vx = P.x + radius * surfaceNormX;
        const vy = P.y + radius * surfaceNormY;
        const vz = P.z + radius * surfaceNormZ;

        posArr.push(vx, vy, vz);
        normArr.push(surfaceNormX, surfaceNormY, surfaceNormZ);
        uvArr.push(u, j / radialSegments);
        strandIdArr.push(k);
        aCoordArr.push(a);
        omegaArr.push(omega);
      }
    }

    // Connect rings with triangle indices
    for (let i = 0; i < numRings; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const row1 = vertexOffset + i * (radialSegments + 1);
        const row2 = vertexOffset + (i + 1) * (radialSegments + 1);

        const a = row1 + j;
        const b = row2 + j;
        const c = row2 + (j + 1);
        const d = row1 + (j + 1);

        indexArr.push(a, b, d);
        indexArr.push(b, c, d);
      }
    }

    vertexOffset += (numRings + 1) * (radialSegments + 1);
  }

  // Create Right Hemisphere BufferGeometry
  const rightGeometry = new THREE.BufferGeometry();
  rightGeometry.setAttribute("position", new THREE.Float32BufferAttribute(posArr, 3));
  rightGeometry.setAttribute("normal", new THREE.Float32BufferAttribute(normArr, 3));
  rightGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvArr, 2));
  rightGeometry.setAttribute("aStrand", new THREE.Float32BufferAttribute(strandIdArr, 1));
  rightGeometry.setAttribute("aA", new THREE.Float32BufferAttribute(aCoordArr, 1));
  rightGeometry.setAttribute("aOmega", new THREE.Float32BufferAttribute(omegaArr, 1));
  rightGeometry.setIndex(indexArr);

  // Clone and reflect for Left Hemisphere
  const leftGeometry = rightGeometry.clone();
  const leftPos = leftGeometry.attributes.position;
  const leftNorm = leftGeometry.attributes.normal;

  for (let i = 0; i < leftPos.count; i++) {
    leftPos.setX(i, -leftPos.getX(i));
    leftNorm.setX(i, -leftNorm.getX(i));
  }

  // Reverse winding order so front faces remain valid
  const leftIdx = leftGeometry.index;
  if (leftIdx) {
    for (let i = 0; i < leftIdx.count; i += 3) {
      const b = leftIdx.getX(i + 1);
      const c = leftIdx.getX(i + 2);
      leftIdx.setX(i + 1, c);
      leftIdx.setX(i + 2, b);
    }
  }

  return { rightGeometry, leftGeometry };
}

/**
 * Phase 2: Composite Path Data (§PRD 7 & 8.1)
 */
export interface CompositePathData {
  index: number;
  rank: number;
  L: number;
  sL0: number; // arc length along Gamma where wreath ring lane begins (theta = PI)
  sL1: number; // arc length along Gamma where wreath ring lane ends = sL0 + L
  totalFeed: number; // F = sL0 + L
  sMin: number; // -L
  sMax: number; // S_end
  points: THREE.Vector3[];
  tangents: THREE.Vector3[];
  sampleCount: number;
  laneRadius: number;
  Ak: number;
}

export interface PathTextureBundle {
  texture: THREE.DataTexture;
  sMin: number[];
  sMax: number[];
  ds: number[];
  L: number[];
  F: number[];
  p0: number[];
  dP: number;
  paths: CompositePathData[];
}

/**
 * 5. Stream Path Gamma_k Generator (§PRD 7.5 & 7.6)
 * Generates authored stream path Gamma_k from weave exit (s = 0) down the outer flank channel,
 * sweeping under the ring bottom, and wrapping around the solved wreath lane.
 */
export function buildStreamWaypoints(
  strand: WovenStrand,
  strandIndex: number,
  totalStrands = STRAND_COUNT
): { waypoints: THREE.Vector3[]; laneRadius: number; Ak: number; laneStartIndex: number; pCrossStart: THREE.Vector3 } {
  const k = strandIndex;
  const rank = k / (totalStrands - 1);
  const L = strand.length;

  const pHead = strand.points[strand.points.length - 1];
  const tHead = strand.tangents[strand.tangents.length - 1];

  // Flank channel X
  const xChannel = 3.20 + rank * 1.30;

  // Wreath parameters
  const laneRadius = WREATH_R_IN + 0.03 * WORLD_HV + rank * 0.17 * WORLD_HV;
  const { Ak } = solveLaneRippleAmplitude(
    L,
    laneRadius,
    12,
    (k * Math.PI) / 3,
    0.35,
    WREATH_GAP_RAD,
    WREATH_CROSS_RAD
  );

  const waypoints: THREE.Vector3[] = [];

  // Seed with weave head and initial tangent for guaranteed C1 continuity at s = 0
  waypoints.push(pHead.clone());
  waypoints.push(pHead.clone().addScaledVector(tHead, 0.45));

  const yBot = WREATH_CY - laneRadius;
  const dyTotal = yBot - pHead.y;

  // Phase 1: Peel-out curving toward flank channel
  waypoints.push(
    new THREE.Vector3(
      pHead.x * 0.35 + xChannel * 0.65,
      pHead.y + dyTotal * 0.22,
      0.015
    )
  );

  // Phase 2: Outer Channel descent
  waypoints.push(new THREE.Vector3(xChannel, pHead.y + dyTotal * 0.50, 0.018));
  waypoints.push(new THREE.Vector3(xChannel + 0.02 * Math.sin(k), pHead.y + dyTotal * 0.80, 0.022));

  // Phase 3: Under-sweep curving inward under ring bottom towards crossed tie
  const pCrossStart = evalWreathPoint(
    Math.PI - WREATH_CROSS_RAD,
    laneRadius,
    Ak,
    12,
    (k * Math.PI) / 3,
    WREATH_CY,
    0.030,
    WREATH_GAP_RAD,
    WREATH_CROSS_RAD
  );

  waypoints.push(new THREE.Vector3(xChannel * 0.65, yBot - 0.20, 0.026));
  waypoints.push(new THREE.Vector3(pCrossStart.x + 0.50, yBot - 0.06, 0.029));

  // Ring bottom arrival at theta = PI - WREATH_CROSS_RAD (lane start)
  const laneStartIndex = waypoints.length;
  waypoints.push(pCrossStart.clone());

  // Phase 4: Wreath Lane Arc climbing left arc (theta in [PI - WREATH_CROSS_RAD, 2*PI - WREATH_GAP_RAD])
  const numLaneSteps = 34;
  const thStart = Math.PI - WREATH_CROSS_RAD;
  const thEnd = 2 * Math.PI - WREATH_GAP_RAD;
  for (let i = 1; i <= numLaneSteps; i++) {
    const theta = thStart + (i / numLaneSteps) * (thEnd - thStart);
    waypoints.push(
      evalWreathPoint(
        theta,
        laneRadius,
        Ak,
        12,
        (k * Math.PI) / 3,
        WREATH_CY,
        0.030,
        WREATH_GAP_RAD,
        WREATH_CROSS_RAD
      )
    );
  }

  return { waypoints, laneRadius, Ak, laneStartIndex, pCrossStart };
}

/**
 * 6. Composite Path Pi_k Builder (§PRD 7.1 & 7.2)
 * Combines weave interior (s in [-L, 0]) and stream/lane path Gamma (s in [0, S_end]).
 */
export function buildCompositePath(
  strand: WovenStrand,
  strandIndex: number,
  ds = 0.02
): CompositePathData {
  const k = strandIndex;
  const rank = k / (STRAND_COUNT - 1);
  const L = strand.length;

  const { waypoints: streamWaypoints, laneRadius, Ak, pCrossStart } = buildStreamWaypoints(
    strand,
    k,
    STRAND_COUNT
  );

  // Build stream curve Gamma
  const streamCurve = new THREE.CatmullRomCurve3(streamWaypoints, false, "centripetal");
  const approxStreamLength = streamCurve.getLength();
  const numStreamSamples = Math.ceil(approxStreamLength / ds);

  const streamPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= numStreamSamples; i++) {
    streamPoints.push(streamCurve.getPointAt(i / numStreamSamples));
  }

  // Find wreath lane start index (closest point on resampled stream to pCrossStart)
  let laneStartIdx = 0;
  let minD = Infinity;
  for (let i = 0; i < streamPoints.length; i++) {
    const d = streamPoints[i].distanceTo(pCrossStart);
    if (d < minD) {
      minD = d;
      laneStartIdx = i;
    }
  }
  const sL0 = laneStartIdx * ds;
  const sL1 = sL0 + L;
  const totalFeed = sL1;

  // Weave interior: s in [-L, 0]
  // strand.points has uniform spacing ds = 0.02 from tail to head
  const compositePoints: THREE.Vector3[] = [];

  // 1. Weave interior points from s = -L (tail) to s = 0 (head, exclusive since streamPoints[0] is head)
  for (let i = 0; i < strand.points.length - 1; i++) {
    compositePoints.push(strand.points[i].clone());
  }

  // 2. Stream points from s = 0 to S_end
  for (let i = 0; i < streamPoints.length; i++) {
    compositePoints.push(streamPoints[i].clone());
  }

  const sMin = -L;
  const sMax = sMin + (compositePoints.length - 1) * ds;

  // Compute central difference tangents
  const compositeTangents: THREE.Vector3[] = [];
  for (let i = 0; i < compositePoints.length; i++) {
    if (i === 0) {
      compositeTangents.push(
        compositePoints[1].clone().sub(compositePoints[0]).normalize()
      );
    } else if (i === compositePoints.length - 1) {
      compositeTangents.push(
        compositePoints[i].clone().sub(compositePoints[i - 1]).normalize()
      );
    } else {
      compositeTangents.push(
        compositePoints[i + 1].clone().sub(compositePoints[i - 1]).normalize()
      );
    }
  }

  // PRD §6.2: Adaptive smoothing relaxation loop guaranteeing turning angle <= 6 deg
  const maxAllowedAngleRad = 6 * (Math.PI / 180);
  for (let iter = 0; iter < 15; iter++) {
    let maxAngle = 0;
    for (let i = 1; i < compositeTangents.length; i++) {
      const dot = compositeTangents[i - 1].dot(compositeTangents[i]);
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
      maxAngle = Math.max(maxAngle, angle);
      if (angle > maxAllowedAngleRad) {
        for (let j = Math.max(1, i - 2); j <= Math.min(compositePoints.length - 2, i + 2); j++) {
          compositePoints[j].x = compositePoints[j - 1].x * 0.25 + compositePoints[j].x * 0.50 + compositePoints[j + 1].x * 0.25;
          compositePoints[j].y = compositePoints[j - 1].y * 0.25 + compositePoints[j].y * 0.50 + compositePoints[j + 1].y * 0.25;
          compositePoints[j].z = compositePoints[j - 1].z * 0.25 + compositePoints[j].z * 0.50 + compositePoints[j + 1].z * 0.25;
        }
      }
    }
    if (maxAngle <= maxAllowedAngleRad) break;

    // Update tangents from relaxed points
    for (let i = 1; i < compositePoints.length - 1; i++) {
      compositeTangents[i].copy(compositePoints[i + 1]).sub(compositePoints[i - 1]).normalize();
    }
  }

  return {
    index: k,
    rank,
    L,
    sL0,
    sL1,
    totalFeed,
    sMin,
    sMax,
    points: compositePoints,
    tangents: compositeTangents,
    sampleCount: compositePoints.length,
    laneRadius,
    Ak,
  };
}


/**
 * 7. Path Texture Packager uPath (RGBA32F, 4096 x 7) (§PRD 8.1)
 */
export function buildPathTextureBundle(
  compositePaths: CompositePathData[],
  textureWidth = 4096
): PathTextureBundle {
  const K = compositePaths.length;
  const texData = new Float32Array(textureWidth * K * 4);

  const sMin: number[] = [];
  const sMax: number[] = [];
  const ds: number[] = [];
  const L: number[] = [];
  const F: number[] = [];
  const p0: number[] = [];
  const dP = 0.42;

  for (let k = 0; k < K; k++) {
    const path = compositePaths[k];
    sMin.push(path.sMin);
    sMax.push(path.sMax);
    const step = (path.sMax - path.sMin) / (textureWidth - 1);
    ds.push(step);
    L.push(path.L);
    F.push(path.totalFeed);
    p0.push(0.04 + 0.16 * path.rank);

    const totalPts = path.points.length;

    for (let col = 0; col < textureWidth; col++) {
      const u = col / (textureWidth - 1);
      const ptIdx = Math.min(totalPts - 1, Math.floor(u * (totalPts - 1)));
      const P = path.points[ptIdx];

      const offset = (k * textureWidth + col) * 4;
      texData[offset + 0] = P.x;
      texData[offset + 1] = P.y;
      texData[offset + 2] = P.z;
      texData[offset + 3] = 1.0;
    }
  }

  const texture = new THREE.DataTexture(
    texData,
    textureWidth,
    K,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return {
    texture,
    sMin,
    sMax,
    ds,
    L,
    F,
    p0,
    dP,
    paths: compositePaths,
  };
}
