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

function testFull() {
  const curves = [];

  // 1. Loop 0: Inner Laurel Ribbon
  curves.push(new HalfCurve((u) => {
    const r = 2.28 + 0.18 * Math.cos(8 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      0.08 * Math.sin(16 * Math.PI * u)
    );
  }));

  // 2. Loop 1: Inner Diamond Ribbon A
  curves.push(new HalfCurve((u) => {
    const r = 2.92 + 0.38 * Math.cos(8 * Math.PI * u) + 0.14 * Math.sin(16 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      0.12 * Math.sin(16 * Math.PI * u)
    );
  }));

  // 3. Loop 2: Inner Diamond Ribbon B (Counter-phase)
  curves.push(new HalfCurve((u) => {
    const r = 2.92 - 0.38 * Math.cos(8 * Math.PI * u) + 0.14 * Math.sin(16 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      -0.12 * Math.sin(16 * Math.PI * u)
    );
  }));

  // 4. Loop 3: 12-Fold Serpentine Ribbon A
  curves.push(new HalfCurve((u) => {
    const r = 3.62 + 0.42 * Math.cos(12 * Math.PI * u) + 0.12 * Math.sin(24 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      0.14 * Math.sin(24 * Math.PI * u)
    );
  }));

  // 5. Loop 4: 12-Fold Serpentine Ribbon B (Counter-phase)
  curves.push(new HalfCurve((u) => {
    const r = 3.62 - 0.42 * Math.cos(12 * Math.PI * u) + 0.12 * Math.sin(24 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      -0.14 * Math.sin(24 * Math.PI * u)
    );
  }));

  // 6. Loop 5: 16-Petal Outer Scallop A
  curves.push(new HalfCurve((u) => {
    const r = 4.35 + 0.45 * Math.cos(16 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      0.10 * Math.sin(16 * Math.PI * u)
    );
  }));

  // 7. Loop 6: 16-Petal Outer Scallop B (Counter-phase)
  curves.push(new HalfCurve((u) => {
    const r = 4.35 - 0.45 * Math.cos(16 * Math.PI * u);
    return new THREE.Vector3(
      r * Math.sin(Math.PI * u),
      r * Math.cos(Math.PI * u),
      -0.10 * Math.sin(16 * Math.PI * u)
    );
  }));

  // 8. Lateral Flank Knot at (2.8, 0)
  curves.push(new HalfCurve((u) => {
    const th = 2 * Math.PI * u;
    return new THREE.Vector3(
      2.80 + 0.75 * Math.cos(th) + 0.20 * Math.cos(3 * th),
      0.75 * Math.sin(th) + 0.20 * Math.sin(3 * th),
      0.12 * Math.sin(2 * th)
    );
  }));

  const geos = [];
  for (const c of curves) {
    const geo = new THREE.TubeGeometry(c, 80, 0.026, 8, false);
    geos.push(geo);
  }

  const rightGeometry = BufferGeometryUtils.mergeGeometries(geos, false);
  console.log('Right vertices:', rightGeometry.attributes.position.count);

  const leftGeometry = rightGeometry.clone();
  const pos = leftGeometry.attributes.position;
  const norm = leftGeometry.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, -pos.getX(i));
    norm.setX(i, -norm.getX(i));
  }
  const idx = leftGeometry.index;
  for (let i = 0; i < idx.count; i += 3) {
    const b = idx.getX(i + 1);
    const c = idx.getX(i + 2);
    idx.setX(i + 1, c);
    idx.setX(i + 2, b);
  }

  console.log('Left vertices:', leftGeometry.attributes.position.count);
  console.log('All tests passed cleanly!');
}

testFull();
