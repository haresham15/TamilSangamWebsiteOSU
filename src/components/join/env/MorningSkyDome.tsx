"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { SUN_DIR, FOG_COLOR, SKY_MID, SKY_ZENITH } from "./sun";

const skyVertexShader = /* glsl */ `
varying vec3 vDir;

void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const skyFragmentShader = /* glsl */ `
varying vec3 vDir;
uniform vec3 uHorizon;  // = FOG_COLOR (#F4EEDD)
uniform vec3 uMid;      // #F7E7C6
uniform vec3 uZenith;   // #9CC4E8
uniform vec3 uSunDir;

void main() {
  vec3 d = normalize(vDir);
  float h = clamp(d.y, 0.0, 1.0);
  vec3 c = mix(uHorizon, uMid, smoothstep(0.00, 0.18, h));
  c = mix(c, uZenith, smoothstep(0.12, 0.85, h));
  float s = max(dot(d, uSunDir), 0.0);
  c += vec3(1.0, 0.86, 0.62) * (pow(s, 64.0) * 0.8 + pow(s, 6.0) * 0.18); // disc + halo
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function MorningSkyDome() {
  const uniforms = useMemo(
    () => ({
      uHorizon: { value: new THREE.Color(FOG_COLOR) },
      uMid: { value: new THREE.Color(SKY_MID) },
      uZenith: { value: new THREE.Color(SKY_ZENITH) },
      uSunDir: { value: SUN_DIR.clone() },
    }),
    []
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertexShader,
        fragmentShader: skyFragmentShader,
        uniforms,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    [uniforms]
  );

  React.useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <mesh renderOrder={-1} material={material}>
      <sphereGeometry args={[140, 32, 24]} />
    </mesh>
  );
}
