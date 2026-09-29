"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const SKY_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAGMENT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  // Pseudo-random hash for dithering & noise
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // 2D Value Noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Fractal Brownian Motion for horizontal atmospheric cloud bands
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.3), sin(0.3), -sin(0.3), cos(0.3));
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p = rot * p * 2.05 + vec2(0.12, 0.23);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float y = clamp(vUv.y, 0.0, 1.0);

    // Multi-stop Tamil Sangam "Paalai" Golden Hour Sunset Gradient
    // Zenith #170d2b -> Upper Mid #5c2466 -> Lower Mid #e2553f -> Horizon #ff9a3c
    vec3 cZenith   = vec3(0.090, 0.051, 0.169); // #170d2b Deep dusk violet
    vec3 cUpperMid = vec3(0.361, 0.141, 0.400); // #5c2466 Brand purple to plum
    vec3 cLowerMid = vec3(0.886, 0.333, 0.247); // #e2553f Kumkumam coral
    vec3 cHorizon  = vec3(1.000, 0.604, 0.235); // #ff9a3c Solar gold
    vec3 cGlow     = vec3(1.000, 0.784, 0.420); // #ffc86b Horizon warmth

    vec3 sky;
    if (y < 0.25) {
      float t = y / 0.25;
      sky = mix(cGlow, cHorizon, t);
    } else if (y < 0.55) {
      float t = (y - 0.25) / 0.30;
      sky = mix(cHorizon, cLowerMid, smoothstep(0.0, 1.0, t));
    } else if (y < 0.82) {
      float t = (y - 0.55) / 0.27;
      sky = mix(cLowerMid, cUpperMid, smoothstep(0.0, 1.0, t));
    } else {
      float t = (y - 0.82) / 0.18;
      sky = mix(cUpperMid, cZenith, smoothstep(0.0, 1.0, t));
    }

    // Horizontal wispy cloud bands lit from underneath by setting sun
    vec2 cloudUv = vec2(vUv.x * 2.8 + uTime * 0.003, vUv.y * 10.0);
    float cloudNoise = fbm(cloudUv);
    float cloudMask = smoothstep(0.38, 0.72, cloudNoise) * smoothstep(0.08, 0.45, y) * (1.0 - smoothstep(0.65, 0.95, y));

    vec3 cloudUnderside = vec3(1.0, 0.72, 0.35); // Golden sunlight reflection
    vec3 cloudTop = vec3(0.30, 0.12, 0.32);       // Dark plum shadow
    vec3 cloudColor = mix(cloudUnderside, cloudTop, smoothstep(0.3, 0.7, cloudNoise));

    vec3 finalColor = mix(sky, cloudColor, cloudMask * 0.55);

    // 1/255 dither noise to prevent 8-bit display color banding
    float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
    finalColor += dither;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function Sky() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  const geometry = useMemo(() => new THREE.PlaneGeometry(1400, 600), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SKY_VERTEX,
        fragmentShader: SKY_FRAGMENT,
        uniforms,
        depthWrite: false,
        depthTest: false,
      }),
    [uniforms]
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh
      position={[0, 90, -395]}
      geometry={geometry}
      material={material}
      ref={(m) => {
        if (m) materialRef.current = m.material as THREE.ShaderMaterial;
      }}
    />
  );
}
