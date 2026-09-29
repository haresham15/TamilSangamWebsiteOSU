"use client";

import React, { useMemo, useEffect } from "react";
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

  // Multi-harmonic standing wave displacement across acoustic span L = 10.0
  float L = 10.0;
  float normX = (pos.x + 5.0) / L; // 0.0 to 1.0 pinned at ends
  
  float mode1 = sin(3.14159265 * normX) * cos(uTime * uFrequency);
  float mode2 = sin(2.0 * 3.14159265 * normX) * cos(uTime * uFrequency * 2.0) * 0.28;
  float mode3 = sin(3.0 * 3.14159265 * normX) * cos(uTime * uFrequency * 3.0) * 0.12;
  
  float displacement = (mode1 + mode2 + mode3) * uAmplitude;
  pos.y += displacement;
  vShape = abs(mode1 + mode2 + mode3);

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
  // Shared memoized fretboard anchors
  const anchorGeo = useMemo(() => new THREE.BoxGeometry(0.1, 1.1, 0.08), []);
  const anchorMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#3b1d11", roughness: 0.8 }),
    []
  );

  // Create 6 string geometries with baked 90° rotation along Z
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

  // Complete unmount lifecycle disposal to prevent GPU memory accumulation
  useEffect(() => {
    return () => {
      stringsData.forEach(({ geo, mat }) => {
        geo.dispose();
        mat.dispose();
      });
      anchorGeo.dispose();
      anchorMat.dispose();
    };
  }, [stringsData, anchorGeo, anchorMat]);

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
      <mesh position={[-5.05, 0, 0]} geometry={anchorGeo} material={anchorMat} />
      <mesh position={[5.05, 0, 0]} geometry={anchorGeo} material={anchorMat} />
    </group>
  );
}
