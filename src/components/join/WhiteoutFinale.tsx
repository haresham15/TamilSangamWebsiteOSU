"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface WhiteoutFinaleProps {
  scrollProgressRef: React.RefObject<number>;
  gateProgressRef?: React.RefObject<number>;
}

const FORWARD_OFFSET = new THREE.Vector3(0, 0, -0.6);

const sunBloomShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uGateProgress;
    uniform float uScrollProgress;
    varying vec2 vUv;

    void main() {
      vec2 centeredUv = (vUv - vec2(0.5, 0.42)) * vec2(1.2, 1.0);
      float dist = length(centeredUv);

      // Radial light expansion tied to gate progress
      float radius = 0.15 + uGateProgress * 0.95;
      float bloom = smoothstep(radius, 0.0, dist);

      // Subtle atmospheric shimmer & golden dust motes
      float mote1 = sin(centeredUv.x * 24.0 + uTime * 1.5) * cos(centeredUv.y * 18.0 + uTime * 0.8);
      float mote2 = sin(centeredUv.y * 32.0 - uTime * 1.2) * cos(centeredUv.x * 28.0 + uTime * 1.1);
      float motes = smoothstep(0.75, 1.0, mote1 * mote2) * 0.25;

      // Palette: Warm Amber (#E8A856) -> Warm Morning Ivory (#FFF8EB) -> Warm Parchment (#FAF7F2)
      vec3 amber = vec3(0.91, 0.66, 0.34);
      vec3 ivory = vec3(1.0, 0.97, 0.92);
      vec3 parchment = vec3(0.98, 0.97, 0.95);

      vec3 col = mix(amber, ivory, smoothstep(0.4, 0.0, dist));
      col = mix(col, parchment, smoothstep(0.7, 1.0, uScrollProgress));

      float alpha = bloom * (0.35 + uGateProgress * 0.65) + motes * uGateProgress;
      // Fade out when scroll pasts gate into threshold
      alpha = clamp(alpha, 0.0, 1.0);

      gl_FragColor = vec4(col, alpha);
    }
  `,
};

export function WhiteoutFinale({ scrollProgressRef, gateProgressRef }: WhiteoutFinaleProps) {
  const portalMeshRef = useRef<THREE.Mesh>(null);
  const portalMatRef = useRef<THREE.ShaderMaterial>(null);

  const cameraMeshRef = useRef<THREE.Mesh>(null);
  const cameraMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const forwardVec = useRef(new THREE.Vector3());

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGateProgress: { value: 0 },
      uScrollProgress: { value: 0 },
    }),
    []
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const p = scrollProgressRef.current ?? 0;
    const gateP = gateProgressRef?.current ?? 0;
    const camera = state.camera;

    uniforms.uTime.value = state.clock.getElapsedTime();
    uniforms.uGateProgress.value = gateP;
    uniforms.uScrollProgress.value = p;

    // Camera billboard for the final clean dissolve into Guestbook (p = 0.82 to 0.98)
    if (cameraMeshRef.current) {
      cameraMeshRef.current.position.copy(camera.position);
      forwardVec.current.copy(FORWARD_OFFSET).applyQuaternion(camera.quaternion);
      cameraMeshRef.current.position.add(forwardVec.current);
      cameraMeshRef.current.quaternion.copy(camera.quaternion);
    }

    let opacity = 0;
    if (p > 0.80) {
      opacity = Math.min((p - 0.80) / 0.18, 1.0);
    }

    if (cameraMatRef.current) {
      cameraMatRef.current.opacity = opacity;
    }
  });

  return (
    <>
      {/* 1. Warm Golden Morning Sun-Bloom Shader Plane behind the gates */}
      <mesh ref={portalMeshRef} position={[0, 2.7, -1.2]}>
        <planeGeometry args={[10, 8]} />
        <shaderMaterial
          ref={portalMatRef}
          vertexShader={sunBloomShader.vertexShader}
          fragmentShader={sunBloomShader.fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Soft Parchment Camera Finale Transition */}
      <mesh ref={cameraMeshRef}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial
          ref={cameraMatRef}
          color="#FAF7F2"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
