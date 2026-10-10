"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface TraditionalSideKolamsProps {
  isMobile: boolean;
  tier?: string;
}

/**
 * Builds the closed 3D curves and pulli dots for a traditional
 * 8-petal Brahma Mudi / Lotus Sikku Kolam.
 * Features true 3D interlaced over-and-under crossings (Z alternation)
 * and central sacred pulli grid dots.
 */
function buildTraditionalKolamGeometry(tier = "A") {
  const curves: THREE.CatmullRomCurve3[] = [];

  // 1. Outer 8-Petal Brahma Mudi Loop
  const outerPoints: THREE.Vector3[] = [];
  const N_OUTER = 192;
  const R_BASE = 1.15;
  const R_PETAL = 0.62;
  const R_HARMONIC = 0.16;
  const Z_LIFT = 0.065;

  for (let i = 0; i < N_OUTER; i++) {
    const t = (i / N_OUTER) * Math.PI * 2;
    const r = R_BASE + R_PETAL * Math.cos(8 * t) + R_HARMONIC * Math.cos(16 * t);
    const x = r * Math.cos(t);
    const y = r * Math.sin(t);
    const z = Z_LIFT * Math.sin(8 * t);
    outerPoints.push(new THREE.Vector3(x, y, z));
  }
  curves.push(new THREE.CatmullRomCurve3(outerPoints, true, "centripetal"));

  // 2. Inner Heart Interlace Loop (Rotated by PI / 8, opposite over-and-under phase)
  const innerPoints: THREE.Vector3[] = [];
  const N_INNER = 160;
  const R_IN_BASE = 0.72;
  const R_IN_PETAL = 0.32;

  for (let i = 0; i < N_INNER; i++) {
    const t = (i / N_INNER) * Math.PI * 2;
    const r = R_IN_BASE + R_IN_PETAL * Math.cos(8 * t + Math.PI) + 0.08 * Math.cos(16 * t);
    const angle = t + Math.PI / 8;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    const z = -Z_LIFT * Math.sin(8 * t);
    innerPoints.push(new THREE.Vector3(x, y, z));
  }
  curves.push(new THREE.CatmullRomCurve3(innerPoints, true, "centripetal"));

  // 3. Eight Cardinal Sikku Loop Knots (circling outer pulli dots)
  for (let k = 0; k < 8; k++) {
    const baseAngle = k * ((Math.PI * 2) / 8);
    const knotPoints: THREE.Vector3[] = [];
    const N_KNOT = 48;
    const knotCenterR = 1.82;
    const cx = knotCenterR * Math.cos(baseAngle);
    const cy = knotCenterR * Math.sin(baseAngle);
    const knotR = 0.24;

    for (let j = 0; j < N_KNOT; j++) {
      const phi = (j / N_KNOT) * Math.PI * 2;
      const x = cx + knotR * Math.cos(phi);
      const y = cy + knotR * Math.sin(phi);
      const z = (Z_LIFT * 0.7) * Math.cos(phi);
      knotPoints.push(new THREE.Vector3(x, y, z));
    }
    curves.push(new THREE.CatmullRomCurve3(knotPoints, true, "centripetal"));
  }

  // Build TubeGeometries
  const tubularSegs = tier === "A" ? 128 : 96;
  const radialSegs = tier === "A" ? 8 : 6;
  const tubeRadius = 0.022;

  const geometries = curves.map((curve) => {
    return new THREE.TubeGeometry(curve, tubularSegs, tubeRadius, radialSegs, true);
  });

  // Pulli dots: 1 center + 8 inner + 8 mid + 8 outer = 25 dots
  const pulliPositions: [number, number, number][] = [];
  pulliPositions.push([0, 0, 0]); // Center bindu

  for (let k = 0; k < 8; k++) {
    const angleInner = ((2 * k + 1) * Math.PI) / 8;
    pulliPositions.push([0.55 * Math.cos(angleInner), 0.55 * Math.sin(angleInner), 0]);

    const angleMid = (2 * k * Math.PI) / 8;
    pulliPositions.push([1.12 * Math.cos(angleMid), 1.12 * Math.sin(angleMid), 0]);

    const angleOuter = (2 * k * Math.PI) / 8;
    pulliPositions.push([1.82 * Math.cos(angleOuter), 1.82 * Math.sin(angleOuter), 0]);
  }

  return { geometries, pulliPositions };
}

/**
 * Creates the official Tamil Sangam Royal Purple PBR material with
 * metallic sheen and subtle travelling light pulse.
 */
function createSangamPurpleKolamMaterial() {
  const mat = new THREE.MeshStandardMaterial({
    color: "#7C3AED", // Official Tamil Sangam Royal Purple
    metalness: 0.58,
    roughness: 0.22,
    emissive: "#4C2472", // Deep Amethyst Plum ambient emissive
    emissiveIntensity: 0.38,
  });
  mat.defines = { USE_UV: "" };

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.fragmentShader = `
      uniform float uTime;
      ${shader.fragmentShader}
    `.replace(
      `#include <emissivemap_fragment>`,
      `#include <emissivemap_fragment>
       // Subtle travelling light pulse along the sacred purple threads
       float pulse = sin(vUv.x * 28.0 - uTime * 2.2);
       float glow = smoothstep(0.60, 1.0, pulse) * 0.40;
       totalEmissiveRadiance += vec3(0.65, 0.32, 0.95) * glow;
      `
    );
    mat.userData.shader = shader;
  };

  return mat;
}

/**
 * Traditional Side Kolams Component
 * Two authentic, stationary 8-petal Brahma Mudi Sikku Kolams flanking the
 * central hero gold weave.
 * Fully stationary in 3D world coordinates.
 */
export function TraditionalSideKolams({
  isMobile,
  tier = "A",
}: TraditionalSideKolamsProps) {
  const purpleMaterial = useMemo(() => createSangamPurpleKolamMaterial(), []);

  const pearlMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#DDD6FE", // Lilac pearl
      emissive: "#A78BFA", // Glowing lavender
      emissiveIntensity: 0.45,
      roughness: 0.20,
      metalness: 0.70,
    });
  }, []);

  const { geometries, pulliPositions } = useMemo(
    () => buildTraditionalKolamGeometry(tier),
    [tier]
  );

  const dotGeo = useMemo(() => new THREE.SphereGeometry(0.024, 10, 8), []);

  const leftDotsRef = useRef<THREE.InstancedMesh>(null);
  const rightDotsRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Populate pulli dots instanced meshes
  useEffect(() => {
    const updateDots = (ref: React.RefObject<THREE.InstancedMesh | null>) => {
      if (!ref.current) return;
      pulliPositions.forEach((pos, idx) => {
        dummy.position.set(pos[0], pos[1], pos[2]);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        ref.current?.setMatrixAt(idx, dummy.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    };

    updateDots(leftDotsRef);
    updateDots(rightDotsRef);
  }, [pulliPositions, dummy]);

  // Clean disposal of geometries and materials on unmount
  useEffect(() => {
    return () => {
      geometries.forEach((geo) => geo.dispose());
      dotGeo.dispose();
      purpleMaterial.dispose();
      pearlMaterial.dispose();
    };
  }, [geometries, dotGeo, purpleMaterial, pearlMaterial]);

  // Animate the travelling light pulse uniform
  useFrame((state) => {
    if (purpleMaterial.userData.shader) {
      purpleMaterial.userData.shader.uniforms.uTime.value =
        state.clock.elapsedTime;
    }
  });

  // On very narrow viewports, gracefully hide or reduce scale so central emblem is never crowded
  if (isMobile) {
    return null;
  }

  // Scale and stationary world coordinates
  const kolamScale = 0.72;
  const leftX = -5.4;
  const rightX = 5.4;
  const posY = 0.20;
  const posZ = -0.15;

  return (
    <group name="TraditionalSideKolamsContainer">
      {/* Left Traditional Purple Kolam */}
      <group
        name="LeftTraditionalKolam"
        position={[leftX, posY, posZ]}
        scale={[kolamScale, kolamScale, kolamScale]}
      >
        {geometries.map((geo, idx) => (
          <mesh
            key={`left-tube-${idx}`}
            geometry={geo}
            material={purpleMaterial}
            castShadow
            receiveShadow
          />
        ))}
        <instancedMesh
          ref={leftDotsRef}
          args={[dotGeo, pearlMaterial, pulliPositions.length]}
        />
      </group>

      {/* Right Traditional Purple Kolam */}
      <group
        name="RightTraditionalKolam"
        position={[rightX, posY, posZ]}
        scale={[kolamScale, kolamScale, kolamScale]}
      >
        {geometries.map((geo, idx) => (
          <mesh
            key={`right-tube-${idx}`}
            geometry={geo}
            material={purpleMaterial}
            castShadow
            receiveShadow
          />
        ))}
        <instancedMesh
          ref={rightDotsRef}
          args={[dotGeo, pearlMaterial, pulliPositions.length]}
        />
      </group>
    </group>
  );
}
