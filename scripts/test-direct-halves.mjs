import * as THREE from 'three';

class HalfCurve extends THREE.Curve {
  constructor(evaluator) {
    super();
    this.evaluator = evaluator;
  }
  getPoint(u, optionalTarget = new THREE.Vector3()) {
    const pt = this.evaluator(u);
    return optionalTarget.copy(pt);
  }
}

function buildDirectHalves() {
  const curves = [];

  // Spanning curves (u: 0 -> 1)
  // Curve 0: Inner Laurel Ribbon
  curves.push(new HalfCurve((u) => {
    const r = 2.28 + 0.18 * Math.cos(8 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      0.08 * Math.sin(16 * Math.PI * u)
    );
  }));

  // Curve 1: Inner Diamond Ribbon A
  curves.push(new HalfCurve((u) => {
    const r = 2.92 + 0.38 * Math.cos(8 * Math.PI * u) + 0.14 * Math.sin(16 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      0.12 * Math.sin(16 * Math.PI * u)
    );
  }));

  // Curve 2: Inner Diamond Ribbon B (Counter-phase)
  curves.push(new HalfCurve((u) => {
    const r = 2.92 - 0.38 * Math.cos(8 * Math.PI * u) + 0.14 * Math.sin(16 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      -0.12 * Math.sin(16 * Math.PI * u)
    );
  }));

  // Curve 3: 12-Fold Serpentine Ribbon A
  curves.push(new HalfCurve((u) => {
    const r = 3.62 + 0.42 * Math.cos(12 * Math.PI * u) + 0.12 * Math.sin(24 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      0.14 * Math.sin(24 * Math.PI * u)
    );
  }));

  // Curve 4: 12-Fold Serpentine Ribbon B (Counter-phase)
  curves.push(new HalfCurve((u) => {
    const r = 3.62 - 0.42 * Math.cos(12 * Math.PI * u) + 0.12 * Math.sin(24 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      -0.14 * Math.sin(24 * Math.PI * u)
    );
  }));

  // Curve 5: 16-Petal Outer Scallop A
  curves.push(new HalfCurve((u) => {
    const r = 4.35 + 0.45 * Math.cos(16 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      0.10 * Math.sin(16 * Math.PI * u)
    );
  }));

  // Curve 6: 16-Petal Outer Scallop B (Counter-phase)
  curves.push(new HalfCurve((u) => {
    const r = 4.35 - 0.45 * Math.cos(16 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      -0.10 * Math.sin(16 * Math.PI * u)
    );
  }));

  // Curve 7: Lateral Flank Knot at (2.8, 0)
  curves.push(new HalfCurve((u) => {
    const th = 2 * Math.PI * u;
    return new THREE.Vector3(
      2.80 + 0.75 * Math.cos(th) + 0.20 * Math.cos(3 * th),
      0.75 * Math.sin(th) + 0.20 * Math.sin(3 * th),
      0.12 * Math.sin(2 * th)
    );
  }));

  const tubularSegments = 80;
  const radialSegments = 8;
  const tubeRadius = 0.024;

  const posArr = [];
  const normArr = [];
  const arcArr = [];
  const indexArr = [];
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

  const rightGeo = new THREE.BufferGeometry();
  rightGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
  rightGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normArr, 3));
  rightGeo.setAttribute('aArc', new THREE.Float32BufferAttribute(arcArr, 1));
  rightGeo.setIndex(indexArr);

  // Mirrored left geometry
  const leftGeo = rightGeo.clone();
  const pos = leftGeo.attributes.position;
  const norm = leftGeo.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, -pos.getX(i));
    norm.setX(i, -norm.getX(i));
  }
  const idx = leftGeo.index;
  for (let i = 0; i < idx.count; i += 3) {
    const b = idx.getX(i + 1);
    const c = idx.getX(i + 2);
    idx.setX(i + 1, c);
    idx.setX(i + 2, b);
  }

  console.log('Right geo vertices:', rightGeo.attributes.position.count, 'indices:', rightGeo.index.count);
  console.log('Left geo vertices:', leftGeo.attributes.position.count, 'indices:', leftGeo.index.count);
}

buildDirectHalves();
