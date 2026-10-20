"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Fretboard } from "./neck/Fretboard";
import { heroState } from "./state";

// Mother-of-Pearl Iridescent Kolam Rosette Shader
const KolamRosetteShader = {
  uniforms: {
    uTime: { value: 0.0 },
    uReverie: { value: 0.0 },
    uGoldColor: { value: new THREE.Color("#D4AF37") },
    uPearlBase: { value: new THREE.Color("#F5EBE1") },
    uTerracotta: { value: new THREE.Color("#B85C38") },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uReverie;
    uniform vec3 uGoldColor;
    uniform vec3 uPearlBase;
    uniform vec3 uTerracotta;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      // Centered polar coordinates
      vec2 center = vUv - 0.5;
      float r = length(center) * 2.0; // 0 to 1
      float theta = atan(center.y, center.x);

      // Discard outside donut ring [0.55, 0.98]
      if (r < 0.55 || r > 0.98) {
        discard;
      }

      // 8-Fold Sacred Kolam symmetry
      float kolamPetals = abs(sin(theta * 8.0 + uTime * 0.15));
      float innerBand = smoothstep(0.55, 0.62, r) * (1.0 - smoothstep(0.68, 0.74, r));
      float outerBand = smoothstep(0.82, 0.88, r) * (1.0 - smoothstep(0.94, 0.98, r));
      float midKolam = smoothstep(0.68, 0.72, r) * (1.0 - smoothstep(0.80, 0.84, r));

      // Iridescent Mother-of-Pearl Fresnel
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 2.5);
      vec3 pearlColor = mix(uPearlBase, vec3(0.9, 0.95, 1.0), fresnel * 0.7);

      // Blend bands
      vec3 color = pearlColor;
      // Brass inlay rings
      if (innerBand > 0.4 || outerBand > 0.4) {
        color = mix(color, uGoldColor, 0.85);
      }
      // Sacred Kolam middle track
      if (midKolam > 0.3) {
        float pattern = step(0.45, kolamPetals);
        color = mix(color, mix(uTerracotta, uGoldColor, pattern), 0.75);
      }

      // Golden Reverie Bloom on Easter egg unlock
      vec3 bloom = vec3(1.0, 0.85, 0.45) * (0.4 + 0.6 * sin(uTime * 3.0));
      color = mix(color, color + bloom, uReverie);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export function AcousticSoundboard() {
  const rosetteMatRef = useRef<THREE.ShaderMaterial>(null);
  const soundboardMeshRef = useRef<THREE.Mesh>(null);

  // 1. Mother-of-Pearl Kolam Rosette Disc Geometry (Flat ring surrounding soundhole at z = -68)
  const rosetteGeo = useMemo(() => {
    // RingGeometry(innerRadius, outerRadius, thetaSegments)
    const geo = new THREE.RingGeometry(2.4, 4.4, 64);
    geo.rotateX(-Math.PI / 2); // Lay horizontal
    return geo;
  }, []);

  // 2. Sculpted Acoustic Soundboard Body (extends from waist at z = -45 to lower bout at z = -105)
  const soundboardGeo = useMemo(() => {
    const shape = new THREE.Shape();
    // Guitar body half profile (waist to lower bout)
    const zStart = -42.0;
    const zEnd = -108.0;
    const segments = 48;

    // Build curved guitar top contour
    // Starts at neck joint width ~4.0, curves out to upper bout ~7.5, waist ~6.5, lower bout ~9.5
    const pts: [number, number][] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const z = zStart + t * (zEnd - zStart);
      // Width profile
      let halfW = 4.0;
      if (t < 0.25) {
        halfW = THREE.MathUtils.lerp(4.0, 7.2, t / 0.25);
      } else if (t < 0.5) {
        halfW = THREE.MathUtils.lerp(7.2, 6.4, (t - 0.25) / 0.25);
      } else {
        halfW = THREE.MathUtils.lerp(6.4, 9.6, (t - 0.5) / 0.5);
      }
      pts.push([halfW, z]);
    }

    // Connect into closed polygon
    shape.moveTo(-pts[0][0], pts[0][1]);
    for (let i = 0; i < pts.length; i++) {
      shape.lineTo(pts[i][0], pts[i][1]);
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      shape.lineTo(-pts[i][0], pts[i][1]);
    }
    shape.closePath();

    // Cut circular soundhole aperture at (0, -68)
    const holePath = new THREE.Path();
    holePath.absarc(0, -68, 2.3, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const geo = new THREE.ShapeGeometry(shape, 32);
    geo.rotateX(-Math.PI / 2); // Lay horizontal
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 3. Soundhole Interior Depth Well
  const soundholeWellGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(2.35, 2.35, 1.2, 32, 1, true);
    return geo;
  }, []);

  // 4. Rosewood Bridge & 6 Brass Bridge Pins
  const bridgePinsGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 12);
    return geo;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    if (rosetteMatRef.current) {
      rosetteMatRef.current.uniforms.uTime.value = t;
      const targetReverie = heroState.easterEggActive ? 1.0 : 0.0;
      rosetteMatRef.current.uniforms.uReverie.value = THREE.MathUtils.damp(
        rosetteMatRef.current.uniforms.uReverie.value,
        targetReverie,
        4.0,
        dt
      );
    }
  });

  return (
    <group name="acoustic-soundboard-assembly">
      {/* 1. Underlying Tapered Fretboard Neck */}
      <Fretboard />

      {/* 2. Warm Cedar & Rosewood Soundboard Body Top */}
      <mesh
        ref={soundboardMeshRef}
        geometry={soundboardGeo}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#2A160D"
          roughness={0.42}
          metalness={0.12}
          envMapIntensity={1.8}
        />
      </mesh>

      {/* 3. Deep Soundhole Internal Resonance Well */}
      <mesh geometry={soundholeWellGeo} position={[0, -0.65, -68]}>
        <meshBasicMaterial color="#0A0605" side={THREE.BackSide} />
      </mesh>

      {/* 4. Mother-of-Pearl & Brass Kolam Rosette Ring */}
      <mesh geometry={rosetteGeo} position={[0, 0.01, -68]}>
        <shaderMaterial
          ref={rosetteMatRef}
          args={[KolamRosetteShader]}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 5. Sculpted Rosewood Bridge with Brass Bridge Pins at z = -100 */}
      <group position={[0, 0.12, -100.5]}>
        {/* Sculpted Bridge Base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8.8, 0.38, 2.4]} />
          <meshStandardMaterial color="#1A0D08" roughness={0.65} metalness={0.15} />
        </mesh>
        {/* Bone Saddle */}
        <mesh position={[0, 0.22, 0.4]}>
          <boxGeometry args={[7.2, 0.18, 0.2]} />
          <meshStandardMaterial color="#FFF8E7" roughness={0.25} metalness={0.05} />
        </mesh>
        {/* 6 Brass Bridge Pins */}
        {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x, i) => (
          <mesh key={i} geometry={bridgePinsGeo} position={[x * 0.95, 0.2, -0.4]} castShadow>
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
