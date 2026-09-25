"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface AcousticStringsProps {
  amplitudeRef?: React.RefObject<number> | React.MutableRefObject<number>;
  amplitude?: number;
}

const STRING_CONFIGS = [
  { note: "E2", y: -0.45, radius: 0.016, freq: 6.2 },
  { note: "A2", y: -0.27, radius: 0.014, freq: 6.8 },
  { note: "D3", y: -0.09, radius: 0.012, freq: 7.4 },
  { note: "G3", y: 0.09, radius: 0.011, freq: 8.0 },
  { note: "B3", y: 0.27, radius: 0.009, freq: 8.6 },
  { note: "E4", y: 0.45, radius: 0.008, freq: 9.2 },
];

const vertexShader = `
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
varying vec3 vNormal;
varying vec2 vUv;
varying float vShape;

void main() {
  vUv = uv;
  vNormal = normalMatrix * normal;
  vec3 pos = position;

  // §7: CORRECTED fundamental mode shape
  // Pinned at x = -5.0 and x = +5.0, single peak at center (x = 0.0)
  // shape(x): 0 at -5, 1.0 at 0, 0 at +5
  float shape = sin(3.141592653589793 * (pos.x + 5.0) / 10.0);
  vShape = shape;

  float yDisplacement = shape * cos(uTime * uFrequency) * uAmplitude;
  pos.y += yDisplacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform vec3 uBaseColor;
uniform float uAmplitude;
varying vec3 vNormal;
varying vec2 vUv;
varying float vShape;

void main() {
  // Warm steel string shading with sunlit specular rim
  vec3 lightDir = normalize(vec3(0.0, 0.8, 1.0));
  float diffuse = max(dot(vNormal, lightDir), 0.25);
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);

  vec3 col = uBaseColor * diffuse + vec3(1.0, 0.9, 0.75) * spec * 0.8;

  // Golden glow intensification during hard plucks
  float pluckGlow = smoothstep(0.06, 0.22, uAmplitude) * vShape;
  col += vec3(1.0, 0.75, 0.35) * pluckGlow * 1.8;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function AcousticStrings({ amplitude, amplitudeRef }: AcousticStringsProps) {
  // Create 6 string geometries with baked 90° rotation along Z (§7)
  const stringsData = useMemo(() => {
    return STRING_CONFIGS.map((cfg) => {
      // 1. Bake rotation once at creation: local position.x is now the 10m length axis
      const geo = new THREE.CylinderGeometry(cfg.radius, cfg.radius, 10, 12, 64);
      geo.rotateZ(Math.PI / 2);

      const mat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: 0 },
          uFrequency: { value: cfg.freq },
          uBaseColor: { value: new THREE.Color("#E8D9C0") }, // --string-metal
        },
        toneMapped: false,
      });

      return { cfg, geo, mat };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const amp = amplitudeRef?.current ?? amplitude ?? 0;

    stringsData.forEach(({ mat }) => {
      mat.uniforms.uTime.value = t;
      mat.uniforms.uAmplitude.value = amp;
    });
  });

  return (
    <group position={[0, 1.6, 2.0]}>
      {stringsData.map(({ cfg, geo, mat }) => (
        <mesh
          key={cfg.note}
          geometry={geo}
          material={mat}
          position={[0, cfg.y, 0]}
          onUpdate={(self) => {
            // Enable layer 1 so hard plucks can selectively trigger bloom
            self.layers.enable(1);
          }}
        />
      ))}

      {/* Decorative guitar fretboard / bridge anchoring nodes at ends */}
      <mesh position={[-5.05, 0, 0]}>
        <boxGeometry args={[0.1, 1.1, 0.08]} />
        <meshStandardMaterial color="#3b1d11" roughness={0.8} />
      </mesh>
      <mesh position={[5.05, 0, 0]}>
        <boxGeometry args={[0.1, 1.1, 0.08]} />
        <meshStandardMaterial color="#3b1d11" roughness={0.8} />
      </mesh>
    </group>
  );
}
