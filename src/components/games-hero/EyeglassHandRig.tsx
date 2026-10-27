"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useFrame } from "@react-three/fiber";
import { evaluateForegroundRig, LENS_CENTERS, LENS_HEIGHT, LENS_WIDTH } from "./gamesRail";

const palette = {
  acetate: "#08080A", silver: "#B9BDC2", skin: "#7A3B22",
  sky: "#F4F6F4", coating: "#7FE3D0", mask: "#FFFFFF",
};

function roundedLens(path: THREE.Path, width: number, height: number, radius: number) {
  const x = width / 2;
  const y = height / 2;
  const bottom = x / 1.04;
  path.moveTo(-bottom + radius, -y);
  path.lineTo(bottom - radius, -y);
  path.quadraticCurveTo(bottom, -y, bottom, -y + radius);
  path.lineTo(x, y - radius);
  path.quadraticCurveTo(x, y, x - radius, y);
  path.lineTo(-x + radius, y);
  path.quadraticCurveTo(-x, y, -x, y - radius);
  path.lineTo(-bottom, -y + radius);
  path.quadraticCurveTo(-bottom, -y, -bottom + radius, -y);
  path.closePath();
}

function mergeParts(parts: THREE.BufferGeometry[]) {
  const triangles = parts.map(part => part.index ? part.toNonIndexed() : part);
  const geometry = mergeGeometries(triangles);
  new Set([...parts, ...triangles]).forEach(part => part.dispose());
  if (!geometry) throw new Error("Beach Blast rig geometry attributes do not match");
  return geometry;
}

function capsuleBetween(a: number[], b: number[], radius: number) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const delta = end.clone().sub(start);
  const geometry = new THREE.CapsuleGeometry(radius, delta.length(), 4, 8);
  geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()));
  geometry.translate(...start.add(end).multiplyScalar(0.5).toArray());
  return geometry;
}

/** Real aperture holes; focus is applied to premultiplied foreground colour by the compositor. */
export function EyeglassHandRig({ scrollP }: { scrollP: number; foregroundBlur?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const resources = useMemo(() => {
    const shape = new THREE.Shape();
    roundedLens(shape, 0.071, 0.054, 0.012);
    const aperture = new THREE.Path();
    roundedLens(aperture, LENS_WIDTH, LENS_HEIGHT, 0.009);
    shape.holes.push(aperture);
    const rim = new THREE.ExtrudeGeometry(shape, { depth: 0.006, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.0008, bevelThickness: 0.0008, steps: 1, curveSegments: 10 });
    const frameParts: THREE.BufferGeometry[] = LENS_CENTERS.map(x => rim.clone().translate(x, 0, 0));
    rim.dispose();
    const bridge = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.012, 0.016, 0), new THREE.Vector3(0, 0.021, 0), new THREE.Vector3(0.012, 0.016, 0),
    ]);
    frameParts.push(new THREE.TubeGeometry(bridge, 12, 0.0028, 6, false));
    for (const side of [-1, 1]) {
      const temple = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.073, 0.016, 0),
        new THREE.Vector3(side * 0.074, 0.019, 0.055),
        new THREE.Vector3(side * 0.071, 0.024, 0.115),
        new THREE.Vector3(side * 0.067, 0.009, 0.144),
      ]);
      frameParts.push(new THREE.TubeGeometry(temple, 16, 0.0035, 6, false));
    }
    const frame = mergeParts(frameParts);
    const lensShape = new THREE.Shape();
    roundedLens(lensShape, LENS_WIDTH, LENS_HEIGHT, 0.009);
    const lens = new THREE.ShapeGeometry(lensShape, 12);

    // Static connected grip: rounded palm, articulated capsule phalanges and tapered forearm.
    const palm = new THREE.SphereGeometry(1, 16, 12);
    palm.scale(0.0425, 0.0475, 0.015);
    palm.rotateZ(-0.45);
    palm.translate(0.135, 0.067, 0.034);
    const handParts: THREE.BufferGeometry[] = [palm];
    const fingers = [
      [[0.107, 0.086, 0.038], [0.091, 0.059, 0.050], [0.083, 0.032, 0.044], [0.077, 0.013, 0.020]],
      [[0.127, 0.078, 0.036], [0.113, 0.043, 0.054], [0.105, 0.020, 0.043], [0.093, 0.014, 0.024]],
      [[0.146, 0.072, 0.031], [0.134, 0.037, 0.046], [0.126, 0.015, 0.034], [0.115, 0.019, 0.019]],
      [[0.161, 0.065, 0.026], [0.154, 0.036, 0.039], [0.145, 0.019, 0.028], [0.135, 0.022, 0.015]],
      [[0.110, 0.049, 0.035], [0.083, 0.029, 0.049], [0.072, 0.012, 0.037]],
    ];
    fingers.forEach((finger, index) => {
      for (let segment = 0; segment < finger.length - 1; segment++) {
        handParts.push(capsuleBetween(finger[segment], finger[segment + 1], (index === 4 ? 0.012 : 0.010 - index * 0.001) * (1 - segment * 0.12)));
      }
    });
    const forearm = new THREE.CylinderGeometry(0.033, 0.025, 0.28, 14);
    forearm.rotateZ(-0.70);
    forearm.translate(0.235, 0.181, 0.026);
    handParts.push(forearm);
    const hand = mergeParts(handParts);

    const pixels = new Uint8Array(512 * 512 * 4);
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const i = (y * 512 + x) * 4;
        const pore = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        pixels[i] = 128 + 20 * (pore - Math.floor(pore) - 0.5);
        pixels[i + 1] = 128 + 12 * Math.sin(y * 0.7 + Math.sin(x * 0.06));
        pixels[i + 2] = 253;
        pixels[i + 3] = 255;
      }
    }
    const skinNormal = new THREE.DataTexture(pixels, 512, 512);
    skinNormal.wrapS = skinNormal.wrapT = THREE.RepeatWrapping;
    skinNormal.needsUpdate = true;
    const acetate = new THREE.MeshPhysicalMaterial({ color: palette.acetate, roughness: 0.12, metalness: 0.04, clearcoat: 1, clearcoatRoughness: 0.06 });
    const skin = new THREE.MeshPhysicalMaterial({ color: palette.skin, roughness: 0.18, clearcoat: 0.65, clearcoatRoughness: 0.09, normalMap: skinNormal, normalScale: new THREE.Vector2(0.35, 0.35) });
    const silver = new THREE.MeshStandardMaterial({ color: palette.silver, metalness: 1, roughness: 0.15 });
    const mask = new THREE.MeshBasicMaterial({ color: palette.mask, side: THREE.DoubleSide });
    const glint = new THREE.MeshBasicMaterial({ color: palette.coating, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
    const sheen = new THREE.MeshBasicMaterial({ color: palette.sky, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending });
    const pin = new THREE.CylinderGeometry(0.00175, 0.00175, 0.008, 8);
    const highlight = new THREE.PlaneGeometry(0.012, 0.006);
    return { frame, lens, hand, skinNormal, acetate, skin, silver, mask, glint, sheen, pin, highlight };
  }, []);

  useEffect(() => () => Object.values(resources).forEach(resource => resource.dispose()), [resources]);

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    const rig = evaluateForegroundRig(scrollP, (camera as THREE.PerspectiveCamera).aspect);
    groupRef.current.position.copy(rig.position);
    groupRef.current.rotation.copy(rig.rotation);
    groupRef.current.visible = rig.opacity > 0;
  });

  return (
    <group ref={groupRef} name="EyeglassHandRigGroup" dispose={null}>
      <mesh geometry={resources.frame} material={resources.acetate} name="GlassesFrameAssembly" />
      <mesh geometry={resources.hand} material={resources.skin} name="HandAndArmRig" />
      {LENS_CENTERS.map((x, index) => (
        <group key={x}>
          <mesh name={index === 0 ? "LeftLensMask" : "RightLensMask"} position={[x, 0, 0]} geometry={resources.lens} material={resources.mask} layers={2} />
          <mesh position={[x - 0.011, 0.011, 0.004]} rotation={[0, 0, -0.55]} geometry={resources.highlight} material={resources.sheen} />
          <mesh position={[Math.sign(x) * 0.073, 0.015, 0.004]} geometry={resources.pin} material={resources.silver} />
        </group>
      ))}
      <mesh position={[0.057, -0.012, 0.004]} rotation={[0, 0, -0.35]} geometry={resources.highlight} material={resources.glint} />
    </group>
  );
}
