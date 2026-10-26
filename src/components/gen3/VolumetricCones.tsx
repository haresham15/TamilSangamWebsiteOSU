"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";

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
  uniform float uCinematic;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float NdotV = abs(dot(normalize(vNormal), normalize(vView)));
    float edge = mix(pow(NdotV, 1.5), pow(1.0 - NdotV, 1.8) * 0.85 + NdotV * 0.15, uCinematic);
    float fade = smoothstep(0.0, 0.25, vUv.y) * pow(1.0 - vUv.y, 1.25);
    vec3 beamColor = mix(vec3(1.0, 0.56, 0.2), vec3(1.0, 0.65, 0.28), uCinematic);
    float intensity = mix(0.075, 0.095, uCinematic);
    gl_FragColor = vec4(beamColor, edge * fade * intensity);
  }
`;

export function VolumetricCones() {
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const cinematic = isHeroCinematicEnabled("events");

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
            <shaderMaterial
              vertexShader={vertexShader}
              fragmentShader={fragmentShader}
              uniforms={{
                uCinematic: { value: cinematic ? 1.0 : 0.0 },
              }}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
