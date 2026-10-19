"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vView = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;
const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float edge = pow(abs(dot(normalize(vNormal), normalize(vView))), 1.5);
    float fade = smoothstep(0.0, 0.2, vUv.y) * (1.0 - vUv.y);
    gl_FragColor = vec4(1.0, 0.56, 0.2, edge * fade * 0.075);
  }
`;

export function VolumetricCones() {
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    elapsed.current += dt;
    group.current?.children.forEach((cone, index) => {
      // Counter-rotating volumetric spotlight gimbals sweeping amber rays across the arena
      cone.rotation.x = Math.cos(elapsed.current * 0.52 + index * 0.9) * 0.12;
      cone.rotation.z = Math.sin(elapsed.current * 0.7 + index * 1.3) * 0.18;
    });
  });
  return (
    <group ref={group}>
      {[-4, 4].map(x => (
        <group key={x} position={[x, 11.5, -1]}>
          <mesh position={[0, -5.5, 0]} renderOrder={3}>
            <coneGeometry args={[4, 11, 32, 1, true]} />
            <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
