// src/components/games-hero/EyeglassHandRig.tsx
"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { evaluateForegroundRig } from "./gamesRail";

interface EyeglassHandRigProps {
  scrollP: number;
  foregroundBlur: number; // 0 (tack sharp) to 5.0 (soft defocus blur)
}

/**
 * Procedural Glass Lens Shader with Optical Refraction Zoom & Contrast Boost
 */
const lensVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const lensFragmentShader = /* glsl */ `
  uniform float uRefractionZoom;
  uniform float uContrastBoost;
  uniform vec3 uTint;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel reflectance rim
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

    // Subtle anti-reflective coating sheen (cyan-green tint on glancing angle)
    vec3 arSheen = vec3(0.35, 0.95, 0.85) * fresnel * 0.45;

    // Center lens clear transmission with warm golden tint from explosions
    vec3 baseGlass = uTint;
    if (uContrastBoost > 0.01) {
      baseGlass = mix(baseGlass, vec3(1.05, 0.92, 0.75), uContrastBoost * 0.5);
    }

    vec3 finalColor = baseGlass + arSheen;
    float alpha = clamp(0.12 + fresnel * 0.4 + uContrastBoost * 0.15, 0.0, 1.0) * uOpacity;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function EyeglassHandRig({ scrollP, foregroundBlur }: EyeglassHandRigProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Compute glasses frame geometry using ExtrudeGeometry with 2 rectangular lens cutouts
  const frameGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Outer frame bounds: width 0.28m, height 0.098m
    const w = 0.145;
    const h = 0.049;
    const r = 0.012; // corner radius

    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);

    // Left Lens Cutout (centered at x = -0.068, y = 0)
    const leftHole = new THREE.Path();
    const lw = 0.057;
    const lh = 0.038;
    const lr = 0.008;
    const lx = -0.068;
    leftHole.moveTo(lx - lw + lr, -lh);
    leftHole.lineTo(lx + lw - lr, -lh);
    leftHole.quadraticCurveTo(lx + lw, -lh, lx + lw, -lh + lr);
    leftHole.lineTo(lx + lw, lh - lr);
    leftHole.quadraticCurveTo(lx + lw, lh, lx + lw - lr, lh);
    leftHole.lineTo(lx - lw + lr, lh);
    leftHole.quadraticCurveTo(lx - lw, lh, lx - lw, lh - lr);
    leftHole.lineTo(lx - lw, -lh + lr);
    leftHole.quadraticCurveTo(lx - lw, -lh, lx - lw + lr, -lh);
    shape.holes.push(leftHole);

    // Right Lens Cutout (centered at x = +0.068, y = 0)
    const rightHole = new THREE.Path();
    const rx = 0.068;
    rightHole.moveTo(rx - lw + lr, -lh);
    rightHole.lineTo(rx + lw - lr, -lh);
    rightHole.quadraticCurveTo(rx + lw, -lh, rx + lw, -lh + lr);
    rightHole.lineTo(rx + lw, lh - lr);
    rightHole.quadraticCurveTo(rx + lw, lh, rx + lw - lr, lh);
    rightHole.lineTo(rx - lw + lr, lh);
    rightHole.quadraticCurveTo(rx - lw, lh, rx - lw, lh - lr);
    rightHole.lineTo(rx - lw, -lh + lr);
    rightHole.quadraticCurveTo(rx - lw, -lh, rx - lw + lr, -lh);
    shape.holes.push(rightHole);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.014,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.0035,
      bevelThickness: 0.0035,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Material: Glossy Jet-Black Acetate
  const acetateMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#08080A"),
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.9,
    });
  }, []);

  // Silver Hinge Pin Material
  const silverMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#D8DCDE"),
      roughness: 0.22,
      metalness: 0.95,
    });
  }, []);

  // Sun-Bronzed Skin Material with Wet Specular Highlights
  const skinMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#7A3B22"), // Mid mahogany
      roughness: 0.22, // Wet sheen
      metalness: 0.04,
      clearcoat: 0.75, // Sweat/oil sheen
      clearcoatRoughness: 0.12,
      reflectivity: 0.6,
    });
  }, []);

  // Glass Lens Shader Uniforms
  const lensUniforms = useMemo(
    () => ({
      uRefractionZoom: { value: 1.0 },
      uContrastBoost: { value: 0.0 },
      uTint: { value: new THREE.Color("#E8F4F8") },
      uOpacity: { value: 1.0 },
    }),
    []
  );

  useFrame(() => {
    if (!groupRef.current) return;
    const rig = evaluateForegroundRig(scrollP);

    groupRef.current.position.copy(rig.position);
    groupRef.current.rotation.copy(rig.rotation);
    groupRef.current.visible = rig.opacity > 0.01;

    // Lens optical response in Beat 3
    if (scrollP >= 0.52) {
      const snap = Math.min(1.0, (scrollP - 0.52) / 0.12);
      lensUniforms.uRefractionZoom.value = 1.0 + snap * 0.08;
      lensUniforms.uContrastBoost.value = snap * 0.18;
    } else {
      lensUniforms.uRefractionZoom.value = 1.0;
      lensUniforms.uContrastBoost.value = 0.0;
    }
    lensUniforms.uOpacity.value = rig.opacity;

    // Apply foreground blur defocus to materials when snapping to distant SUVs in Beat 3
    if (foregroundBlur > 0.05) {
      acetateMaterial.roughness = Math.min(0.85, 0.12 + foregroundBlur * 0.12);
      skinMaterial.roughness = Math.min(0.88, 0.22 + foregroundBlur * 0.14);
      acetateMaterial.clearcoat = Math.max(0.1, 1.0 - foregroundBlur * 0.18);
      skinMaterial.clearcoat = Math.max(0.1, 0.75 - foregroundBlur * 0.14);
    } else {
      acetateMaterial.roughness = 0.12;
      skinMaterial.roughness = 0.22;
      acetateMaterial.clearcoat = 1.0;
      skinMaterial.clearcoat = 0.75;
    }
  });

  return (
    <group ref={groupRef} name="EyeglassHandRigGroup">
      {/* ------------------------------------------------------------------ */}
      {/* 1. JET-BLACK RECTANGULAR ACETATE EYEGLASSES                        */}
      {/* ------------------------------------------------------------------ */}
      <group name="GlassesFrameAssembly">
        {/* Main Extruded Frame with 2 Lens Apertures */}
        <mesh geometry={frameGeometry} material={acetateMaterial} castShadow />

        {/* Left Temple Arm (hinged backward at x = -0.142) */}
        <mesh position={[-0.142, 0.018, -0.09]} rotation={[0, -0.12, 0]}>
          <boxGeometry args={[0.009, 0.022, 0.18]} />
          <primitive object={acetateMaterial} attach="material" />
        </mesh>
        {/* Left Silver Hinge Pin */}
        <mesh position={[-0.138, 0.024, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.0022, 0.0022, 0.006, 8]} />
          <primitive object={silverMaterial} attach="material" />
        </mesh>

        {/* Right Temple Arm (hinged backward at x = +0.142, gripped by hand) */}
        <mesh position={[0.142, 0.018, -0.09]} rotation={[0, 0.12, 0]}>
          <boxGeometry args={[0.009, 0.022, 0.18]} />
          <primitive object={acetateMaterial} attach="material" />
        </mesh>
        {/* Right Silver Hinge Pin */}
        <mesh position={[0.138, 0.024, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.0022, 0.0022, 0.006, 8]} />
          <primitive object={silverMaterial} attach="material" />
        </mesh>

        {/* Left Glass Lens */}
        <mesh position={[-0.068, 0, 0.006]}>
          <boxGeometry args={[0.114, 0.076, 0.003]} />
          <shaderMaterial
            vertexShader={lensVertexShader}
            fragmentShader={lensFragmentShader}
            uniforms={lensUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>

        {/* Right Glass Lens */}
        <mesh position={[0.068, 0, 0.006]}>
          <boxGeometry args={[0.114, 0.076, 0.003]} />
          <shaderMaterial
            vertexShader={lensVertexShader}
            fragmentShader={lensFragmentShader}
            uniforms={lensUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 2. SCULPTED SUN-BRONZED RIGHT HAND GRIPPING THE FRAME              */}
      {/* ------------------------------------------------------------------ */}
      <group position={[0.18, 0.045, -0.02]} name="HandAndArmRig">
        {/* Thumb: pressing the inner/upper right corner of the frame */}
        <mesh position={[-0.032, -0.012, 0.025]} rotation={[-0.35, 0.45, 0.2]}>
          <capsuleGeometry args={[0.013, 0.045, 8, 8]} />
          <primitive object={skinMaterial} attach="material" />
        </mesh>

        {/* Index Finger: curled over the top-right frame corner */}
        <mesh position={[-0.018, 0.028, -0.012]} rotation={[0.4, 0.15, -0.5]}>
          <capsuleGeometry args={[0.011, 0.048, 8, 8]} />
          <primitive object={skinMaterial} attach="material" />
        </mesh>

        {/* Middle Finger: curled along the right temple arm */}
        <mesh position={[-0.006, 0.012, -0.042]} rotation={[0.2, 0.1, -0.3]}>
          <capsuleGeometry args={[0.011, 0.052, 8, 8]} />
          <primitive object={skinMaterial} attach="material" />
        </mesh>

        {/* Ring Finger: tucked behind */}
        <mesh position={[0.012, -0.008, -0.065]} rotation={[0.1, 0.05, -0.2]}>
          <capsuleGeometry args={[0.01, 0.048, 8, 8]} />
          <primitive object={skinMaterial} attach="material" />
        </mesh>

        {/* Pinky Finger: tucked behind ring finger */}
        <mesh position={[0.026, -0.025, -0.082]} rotation={[0.05, 0.0, -0.1]}>
          <capsuleGeometry args={[0.009, 0.042, 8, 8]} />
          <primitive object={skinMaterial} attach="material" />
        </mesh>

        {/* Palm & Knuckles */}
        <mesh position={[0.025, 0.015, -0.045]} rotation={[0.1, 0.2, -0.25]}>
          <boxGeometry args={[0.045, 0.065, 0.075]} />
          <primitive object={skinMaterial} attach="material" />
        </mesh>

        {/* Muscular Wrist & Forearm angling up-right toward upper-right frame edge */}
        <mesh position={[0.095, 0.075, -0.095]} rotation={[-0.45, 0.4, -0.75]}>
          <cylinderGeometry args={[0.034, 0.042, 0.22, 12]} />
          <primitive object={skinMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  );
}
