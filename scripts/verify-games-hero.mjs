import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  DESIGN_ASPECT, LENS_WIDTH, LENS_HEIGHT, LENS_CENTERS, FIREBALLS,
  PORTRAIT_STANDOFF_SCALE, heroProjection, evaluateCameraRail,
  evaluateForegroundRig, evaluateFireball,
} from '../src/components/games-hero/gamesRail.ts';

const viewports = [[1912, 800], [1600, 800], [2400, 800], [1440, 900], [1920, 1080], [390, 844], [768, 1024]];
const failures = [];
for (const [width, height] of viewports) {
  const viewportAspect = width / height;
  const aspect = viewportAspect >= 1.3 && viewportAspect < 2 ? DESIGN_ASPECT : viewportAspect;
  const optics = heroProjection(aspect);
  const camera = new THREE.PerspectiveCamera(optics.fov, aspect, 0.01, 400);
  camera.position.set(optics.cameraX, 1.65, 6);
  camera.projectionMatrix.elements[9] = -optics.lensShift;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  camera.updateMatrixWorld();
  const project = point => {
    const ndc = point.clone().project(camera);
    return { u: (ndc.x + 1) / 2, v: (1 - ndc.y) / 2 };
  };
  const margins = [Infinity, Infinity, Infinity, Infinity];
  for (let step = 66; step <= 85; step++) {
    const p = step / 100;
    const rig = evaluateForegroundRig(p, aspect);
    const matrix = new THREE.Matrix4().compose(rig.position, new THREE.Quaternion().setFromEuler(rig.rotation), new THREE.Vector3(1, 1, 1));
    const inverse = matrix.clone().invert();
    const corners = LENS_CENTERS.map(x => [-1, 1].flatMap(sx => [-1, 1].map(sy => project(new THREE.Vector3(x + sx * LENS_WIDTH / 2, sy * LENS_HEIGHT / 2, 0).applyMatrix4(matrix)))));
    const points = FIREBALLS.map((blast, index) => project(new THREE.Vector3(
      optics.portrait ? 0.43 + (blast.x - 0.43) * PORTRAIT_STANDOFF_SCALE : blast.x,
      evaluateFireball(p, index).height, -31,
    )));
    const offset = 0.004 + 0.0022 * Math.exp(-(p - 0.640) / 0.01);
    const localRayX = (point, shift) => {
      const origin = camera.position.clone().applyMatrix4(inverse);
      const target = new THREE.Vector3((point.u + shift) * 2 - 1, 1 - point.v * 2, 0).unproject(camera).applyMatrix4(inverse);
      const direction = target.sub(origin);
      return origin.x - direction.x * origin.z / direction.z;
    };
    const centreX = [-offset, offset].map(shift => localRayX(points[1], shift) - LENS_CENTERS[0]);
    const rightX = [-offset, offset].map(shift => localRayX(points[2], shift) - LENS_CENTERS[1]);
    const g1 = 0.15 * LENS_WIDTH - Math.max(...centreX.map(Math.abs));
    const g2 = Math.min(...rightX.flatMap(x => [x + LENS_WIDTH / 2, -x]));
    const g3 = Math.min(...corners[0].map(c => c.u)) - points[0].u - offset - 0.03;
    const g4 = step < 70 ? Infinity : Math.min(...[0, 1].flatMap(index => {
      const min = Math.min(...corners[index].map(c => c.v)) - 0.03;
      const max = Math.max(...corners[index].map(c => c.v)) + 0.03;
      return [points[index + 1].v - offset - min, max - points[index + 1].v - offset];
    }));
    [g1, g2, g3, g4].forEach((margin, gate) => {
      margins[gate] = Math.min(margins[gate], margin);
      if (margin < -1e-8) failures.push(`${width}x${height} p=${p} G${gate + 1}: ${margin.toFixed(6)}`);
    });
  }
  console.log(`${width}x${height}: G1 ${margins[0].toFixed(6)}m; G2 ${margins[1].toFixed(6)}m; G3 ${margins[2].toFixed(6)} frame; G4 ${margins[3].toFixed(6)} frame`);
  const start = evaluateCameraRail(0.1, 0, aspect);
  const macro = evaluateCameraRail(0.42, 0, aspect);
  const blast = evaluateCameraRail(0.72, 0, aspect);
  assert.equal(start.backgroundBokeh, 0);
  assert.equal(macro.backgroundBokeh, 24);
  assert.equal(macro.foregroundBlur, 0);
  assert.ok(Math.abs(macro.dofFocusDistance - 0.36) < 1e-10);
  assert.equal(blast.backgroundBokeh, 0);
  assert.equal(blast.foregroundBlur, 18);
  assert.equal(start.fov, blast.fov);
  assert.deepEqual(start.position, blast.position);
  assert.equal(evaluateCameraRail(0.97, 0, aspect).position.z, -22);
  assert.equal(evaluateForegroundRig(0.935, aspect).opacity, 0);
  const portal = evaluateForegroundRig(0.93, aspect);
  const lens = new THREE.Vector3(LENS_CENTERS[0], 0, 0).applyEuler(portal.rotation).add(portal.position);
  const centred = project(lens);
  assert.ok(Math.abs(centred.u - 0.5) < 1e-8 && Math.abs(centred.v - 0.5) < 1e-8);
  const states = [0.1, 0.42, 0.72, 0.95].map(p => JSON.stringify([evaluateForegroundRig(p, aspect), evaluateCameraRail(p, 0, aspect), evaluateFireball(p, 1)]));
  assert.deepEqual([0.95, 0.72, 0.42, 0.1].map(p => JSON.stringify([evaluateForegroundRig(p, aspect), evaluateCameraRail(p, 0, aspect), evaluateFireball(p, 1)])).reverse(), states);
}
assert.equal(failures.length, 0, failures.slice(0, 12).join('\n'));
console.log('PASS: registration, deterministic reverse scrub, focus transfer, locked camera and portal centering.');
