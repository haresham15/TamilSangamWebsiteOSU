import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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

function test() {
  const curves = [];
  
  // Spanning curve 0
  curves.push(new HalfCurve((u) => {
    const r = 2.25 + 0.18 * Math.cos(8 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      0.08 * Math.sin(16 * Math.PI * u)
    );
  }));

  const geos = [];
  for (const c of curves) {
    const geo = new THREE.TubeGeometry(c, 64, 0.026, 8, false);
    geos.push(geo);
  }

  const merged = BufferGeometryUtils.mergeGeometries(geos, false);
  merged.computeBoundingBox();
  console.log('Right half BBox:', merged.boundingBox);

  // Left half reflection
  const leftGeo = merged.clone();
  const pos = leftGeo.attributes.position;
  const norm = leftGeo.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, -pos.getX(i));
    norm.setX(i, -norm.getX(i));
  }
  // Reverse indices
  const idx = leftGeo.index;
  for (let i = 0; i < idx.count; i += 3) {
    const b = idx.getX(i + 1);
    const c = idx.getX(i + 2);
    idx.setX(i + 1, c);
    idx.setX(i + 2, b);
  }
  leftGeo.computeBoundingBox();
  console.log('Left half BBox:', leftGeo.boundingBox);
  console.log('Test passed successfully!');
}

test();
