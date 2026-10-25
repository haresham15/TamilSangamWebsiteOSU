"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { guideStationPalette } from "./palette";
import { SdfSilhouette } from "./SdfSilhouette";

function createVignetteBackdropTexture() {
  const width = 256;
  const height = 256;
  const pixels = new Uint8Array(width * height * 4);

  // HDR core [2.8, 1.85, 0.65] (represented in sRGB canvas)
  const core = new THREE.Color("#FFB84D");
  const amber = new THREE.Color("#FF8A2A");
  const edge = new THREE.Color("#3A1608");

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x / (width - 1) - 0.5) * 1.5;
      const dy = (y / (height - 1) - 0.5) * 1.3;
      const dist = Math.min(1.0, Math.hypot(dx, dy) * 1.3);

      const color = core.clone().lerp(amber, dist * 0.6).lerp(edge, Math.max(0, dist - 0.25) * 1.3);
      const index = (y * width + x) * 4;
      pixels[index] = Math.round(color.r * 255);
      pixels[index + 1] = Math.round(color.g * 255);
      pixels[index + 2] = Math.round(color.b * 255);
      pixels[index + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

interface WindowAssemblyProps {
  progress?: number;
  getProgress?: () => number;
}

/**
 * P.C. Sreeram 35mm Station Window Assembly (Alaipayuthey homage).
 * Features:
 * 1. Wide heroic window opening (1.38m × 0.94m) centered at (0, 1.65, 0).
 * 2. Zero-Edge Gaussian & Anamorphic Halation Shader Quad (ZERO polygonal cone decagons!).
 * 3. Atmospheric Blue-Hour Mist Card behind the man at x = -1.1, y = 1.5, z = +0.25.
 * 4. Dual-rim lit anatomical silhouettes: seated woman inside (z = -0.35) and standing man outside (z = +0.62).
 * 5. Wet platform reflection & 6-bar shadow stripe spill pool.
 */
export function WindowAssembly({ progress = 0, getProgress }: WindowAssemblyProps) {
  const readProgress = useMemo(() => getProgress ?? (() => progress), [getProgress, progress]);

  const backdropTexture = useMemo(() => createVignetteBackdropTexture(), []);
  useEffect(() => {
    return () => backdropTexture.dispose();
  }, [backdropTexture]);

  const fanRef = useRef<THREE.Group>(null);
  const curtainMeshRef = useRef<THREE.Mesh>(null);
  const barsMeshRef = useRef<THREE.InstancedMesh>(null);
  const halationMatRef = useRef<THREE.ShaderMaterial>(null);
  const puddleMatRef = useRef<THREE.ShaderMaterial>(null);

  // 6 horizontal iron bars from y = 1.28 to y = 1.98 (pitch 0.14m), z = +0.03
  const barTransforms = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const mat = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const rot = new THREE.Euler(0, 0, Math.PI / 2);
    const quat = new THREE.Quaternion().setFromEuler(rot);
    const scale = new THREE.Vector3(1, 1, 1);

    for (let i = 0; i < 6; i++) {
      const y = 1.28 + i * 0.14;
      pos.set(0, y, 0.03);
      mat.compose(pos, quat, scale);
      matrices.push(mat.clone());
    }
    return matrices;
  }, []);

  useEffect(() => {
    const mesh = barsMeshRef.current;
    if (!mesh) return;
    barTransforms.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  }, [barTransforms]);

  // Halation Shader Material (Zero-Edge Gaussian + Anamorphic Streak)
  const halationMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 vUv;

        void main() {
          vec2 p = (vUv - 0.5) * 2.0; // [-1, 1]
          float r = length(p * vec2(0.85, 1.15));
          float mask = smoothstep(0.95, 0.0, r);
          float core = exp(-r * r * 4.5) * mask;
          float warmHaze = exp(-r * r * 1.8) * mask * 0.35;
          float anamorphic = exp(-abs(p.y) * 18.0) * smoothstep(0.98, 0.0, abs(p.x)) * 0.22;

          vec3 col = mix(vec3(1.0, 0.52, 0.16), vec3(1.0, 0.82, 0.48), core) * (core * 0.55 + warmHaze)
                   + vec3(0.45, 0.82, 0.88) * anamorphic;
          float alpha = clamp((core * 0.45 + warmHaze + anamorphic) * uIntensity, 0.0, 1.0);
          if (alpha < 0.002) discard;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
  }, []);

  // Wet Platform Reflection & Bar-Gobo Spill Shader Material
  const puddleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0.85 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 vUv;

        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float bounds = smoothstep(1.0, 0.78, abs(p.x)) * smoothstep(1.0, 0.72, abs(p.y));

          // Concentric raindrop ripples on the puddle
          vec2 drop1 = vec2(0.12, -0.15);
          vec2 drop2 = vec2(-0.22, 0.25);
          float rip1 = sin(length(p - drop1) * 35.0 - uTime * 6.0) * 0.5 + 0.5;
          float rip2 = sin(length(p - drop2) * 42.0 - uTime * 7.5) * 0.5 + 0.5;
          float ripple = (rip1 * 0.6 + rip2 * 0.4) * 0.15;

          // 6 horizontal iron window bar shadow stripes projecting onto platform
          float barCoord = vUv.y * 6.0;
          float barPattern = sin(barCoord * 3.14159265 * 2.0);
          float barShadow = smoothstep(-0.25, 0.45, barPattern);

          vec3 lightColor = mix(vec3(1.0, 0.62, 0.22), vec3(1.0, 0.82, 0.46), ripple);
          float alpha = bounds * (0.08 + 0.32 * barShadow) * uIntensity;
          if (alpha < 0.004) discard;

          gl_FragColor = vec4(lightColor, alpha);
        }
      `,
    });
  }, []);

  useEffect(() => {
    return () => {
      halationMaterial.dispose();
      puddleMaterial.dispose();
    };
  }, [halationMaterial, puddleMaterial]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const time = clock.elapsedTime;

    if (fanRef.current) {
      fanRef.current.rotation.y += dt * 1.5;
    }

    if (curtainMeshRef.current) {
      const geom = curtainMeshRef.current.geometry as THREE.PlaneGeometry;
      const posAttr = geom.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const u = geom.attributes.uv.getX(i);
        const v = geom.attributes.uv.getY(i);
        const wave = Math.sin(time * 3.0 + v * 5.0) * (1.0 - u) * 0.015;
        posAttr.setZ(i, wave);
      }
      posAttr.needsUpdate = true;
    }

    const p = readProgress();
    const intensity = Math.max(0.15, 1.0 - p * 0.85);

    if (halationMatRef.current) {
      halationMatRef.current.uniforms.uTime.value = time;
      halationMatRef.current.uniforms.uIntensity.value = intensity;
    }

    if (puddleMatRef.current) {
      puddleMatRef.current.uniforms.uTime.value = time;
      puddleMatRef.current.uniforms.uIntensity.value = intensity;
    }
  });

  return (
    <group name="WindowAssembly">
      {/* =========================================================================
          LAYER 1 (z = -1.8): Vignetted warm emissive compartment backdrop plane
          ========================================================================= */}
      <mesh position={[0, 1.65, -1.8]} renderOrder={1}>
        <planeGeometry args={[3.6, 2.4]} />
        <meshBasicMaterial map={backdropTexture} fog={false} toneMapped={false} />
      </mesh>

      {/* Compartment point light spilling warmth through the window */}
      <pointLight
        position={[0.3, 2.2, -1.2]}
        intensity={85}
        distance={8}
        decay={2}
        color={guideStationPalette.windowGlow}
      />

      {/* =========================================================================
          LAYER 2 (z = -1.5): Compartment interior silhouettes
          - Sleeper seat-back profile behind woman
          - Overhead luggage rack
          - Ceiling fan (rotating)
          - Emissive ceiling tube light strip
          ========================================================================= */}
      <group position={[0, 0, -1.5]} name="CompartmentInterior">
        {/* Sleeper seat-back & headrest profile */}
        <mesh position={[0.42, 1.45, 0]} renderOrder={2}>
          <boxGeometry args={[0.55, 0.75, 0.08]} />
          <meshBasicMaterial color="#08090D" fog={false} />
        </mesh>
        {/* Overhead luggage rack */}
        <mesh position={[0, 2.25, 0]} renderOrder={2}>
          <boxGeometry args={[2.8, 0.06, 0.35]} />
          <meshBasicMaterial color="#0C0E14" fog={false} />
        </mesh>
        {/* Slow rotating ceiling fan */}
        <group ref={fanRef} position={[0, 2.22, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
            <meshBasicMaterial color="#08090D" fog={false} />
          </mesh>
          {[-0.35, 0, 0.35].map((_, i) => (
            <mesh key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]} position={[0, -0.01, 0]}>
              <boxGeometry args={[0.45, 0.01, 0.08]} />
              <meshBasicMaterial color="#08090D" fog={false} />
            </mesh>
          ))}
        </group>
        {/* Emissive ceiling fluorescent/tungsten batten */}
        <mesh position={[0.2, 2.26, 0]}>
          <boxGeometry args={[1.1, 0.03, 0.05]} />
          <meshBasicMaterial color="#FFF5DC" fog={false} toneMapped={false} />
        </mesh>
      </group>

      {/* =========================================================================
          LAYER 3 (z = -0.35): Seated Woman SDF plane inside the window
          At x = +0.18, y = 1.63, facing -x (left towards window), scale = 1.02
          ========================================================================= */}
      <SdfSilhouette
        kind="woman"
        position={[0.18, 1.63, -0.35]}
        scale={1.02}
        fog={false}
      />

      {/* =========================================================================
          LAYER 4 (z = -0.15): Softly pleated cloth window curtain
          Gathered on right side of window (x = +0.55), fluttering gently
          ========================================================================= */}
      <mesh
        ref={curtainMeshRef}
        position={[0.55, 1.68, -0.15]}
        renderOrder={3}
      >
        <planeGeometry args={[0.28, 0.90, 8, 12]} />
        <meshStandardMaterial
          color="#9E6038"
          roughness={0.7}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* =========================================================================
          LAYER 5 (z = +0.02): Glass additive reflection quad
          ========================================================================= */}
      <mesh position={[0, 1.65, 0.02]} renderOrder={10}>
        <planeGeometry args={[1.40, 0.96]} />
        <meshBasicMaterial
          color={guideStationPalette.practicalCool}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* =========================================================================
          LAYER 6 (z = +0.03): 6 horizontal iron window bars
          Instanced cylinders, r = 0.008m, length = 1.42m
          ========================================================================= */}
      <instancedMesh
        ref={barsMeshRef}
        args={[undefined, undefined, 6]}
        name="WindowBars"
        renderOrder={15}
      >
        <cylinderGeometry args={[0.008, 0.008, 1.42, 16]} />
        <meshStandardMaterial
          color="#14181D"
          metalness={0.85}
          roughness={0.25}
        />
      </instancedMesh>

      {/* =========================================================================
          LAYER 7 (z = +0.06): Beveled metal window frame, rivets & rain-shutter
          Surrounds the 1.38m × 0.94m opening
          ========================================================================= */}
      <group position={[0, 1.65, 0.06]} name="WindowFrameAssembly">
        {/* Top frame bar */}
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[1.46, 0.06, 0.05]} />
          <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.75} roughness={0.32} />
        </mesh>
        {/* Bottom frame sill */}
        <mesh position={[0, -0.48, 0]}>
          <boxGeometry args={[1.50, 0.07, 0.08]} />
          <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.75} roughness={0.30} />
        </mesh>
        {/* Left frame upright */}
        <mesh position={[-0.70, 0, 0]}>
          <boxGeometry args={[0.06, 0.98, 0.05]} />
          <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.75} roughness={0.32} />
        </mesh>
        {/* Right frame upright */}
        <mesh position={[0.70, 0, 0]}>
          <boxGeometry args={[0.06, 0.98, 0.05]} />
          <meshStandardMaterial color={guideStationPalette.coachEdge} metalness={0.75} roughness={0.32} />
        </mesh>
        {/* Upper louvered rain-shutter overhang */}
        <mesh position={[0, 0.41, -0.015]}>
          <boxGeometry args={[1.36, 0.14, 0.02]} />
          <meshStandardMaterial color="#101720" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* =========================================================================
          LAYER 8 (z = +0.12): Zero-Edge Gaussian & Anamorphic Halation Shader Quad
          (ZERO polygonal edges, mathematically decays to 0.0 before borders)
          ========================================================================= */}
      <mesh
        ref={(el) => {
          if (el) halationMatRef.current = el.material as THREE.ShaderMaterial;
        }}
        position={[0, 1.65, 0.12]}
        material={halationMaterial}
        renderOrder={18}
      >
        <planeGeometry args={[4.2, 3.2]} />
      </mesh>

      {/* =========================================================================
          LAYER 9 (z = +0.25): Atmospheric Blue-Hour Mist Card Behind the Man
          Ensures high contrast for the standing man's silhouette against coach wall
          ========================================================================= */}
      <mesh position={[-1.1, 1.5, 0.25]} renderOrder={19}>
        <planeGeometry args={[2.4, 2.0]} />
        <meshBasicMaterial
          color="#2A5272"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* =========================================================================
          LAYER 10 (z = +0.62): Standing Man SDF plane on the platform
          At x = -0.52, y = 1.52, facing +x toward the woman, scale = 1.05
          ========================================================================= */}
      <SdfSilhouette
        kind="man"
        position={[-0.52, 1.52, 0.62]}
        scale={1.05}
        fog={true}
      />

      {/* =========================================================================
          LAYER 11: Wet Puddle Reflection & 6-Bar Shadow Stripe Spill on Platform
          Directly in front of window (y = 0.005m, z = +2.2m)
          ========================================================================= */}
      <mesh
        ref={(el) => {
          if (el) puddleMatRef.current = el.material as THREE.ShaderMaterial;
        }}
        position={[0, 0.005, 2.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={puddleMaterial}
        renderOrder={5}
      >
        <planeGeometry args={[3.2, 3.0]} />
      </mesh>
    </group>
  );
}

export default WindowAssembly;
