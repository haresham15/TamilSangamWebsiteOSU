// src/gl/art/ContactShadow.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useDisposeOnUnmount } from "@/gl/dispose";

type Vec3 = [number, number, number];

export interface ContactSpot {
  /** Centre on the ground (the decal is lifted slightly to avoid z-fighting). */
  position: Vec3;
  /** Footprint in metres: [x, z]. */
  size: [number, number];
  /** Yaw in radians. */
  rotation?: number;
  /** 0–1 darkness of this spot. */
  opacity?: number;
}

const VERT = /* glsl */ `
  attribute float aOpacity;
  varying vec2 vUv;
  varying float vOpacity;
  void main() {
    vUv = uv;
    vOpacity = aOpacity;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying vec2 vUv;
  varying float vOpacity;
  uniform vec3 uColor;
  uniform float uSoftness;
  void main() {
    // Rounded-rectangle falloff: dark core under the object, soft penumbra outside it.
    vec2 d = abs(vUv - 0.5) * 2.0;
    float edge = max(d.x, d.y);
    float round = length(max(d - 0.55, 0.0)) / 0.45;
    float a = (1.0 - smoothstep(1.0 - uSoftness, 1.0, max(edge * 0.85, round)));
    a = a * a * vOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

const DUMMY = new THREE.Object3D();

/**
 * Baked contact shadows: one instanced draw of soft dark decals under everything that
 * touches the ground. This is what stops props looking like they float. Size each spot
 * about 1.6× the object's footprint. Static: transforms are written once.
 */
export function ContactShadows({
  spots,
  color = "#000000",
  softness = 0.75,
  lift = 0.012,
}: {
  spots: ContactSpot[];
  color?: THREE.ColorRepresentation;
  softness?: number;
  lift?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(1, 1);
    geometry.rotateX(-Math.PI / 2);
    geometry.setAttribute(
      "aOpacity",
      new THREE.InstancedBufferAttribute(new Float32Array(spots.map((s) => s.opacity ?? 0.7)), 1)
    );
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { uColor: { value: new THREE.Color(color) }, uSoftness: { value: softness } },
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
      toneMapped: false,
    });
    return { geometry, material };
  }, [spots, color, softness]);
  useDisposeOnUnmount(geometry, material);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    spots.forEach((spot, i) => {
      DUMMY.position.set(spot.position[0], spot.position[1] + lift, spot.position[2]);
      DUMMY.rotation.set(0, spot.rotation ?? 0, 0);
      DUMMY.scale.set(spot.size[0], 1, spot.size[1]);
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [spots, lift]);

  if (spots.length === 0) return null;
  return <instancedMesh ref={ref} args={[geometry, material, spots.length]} renderOrder={1} />;
}
