"use client";

// Pre-art-pass look, kept behind ?cinematic_about=0: five bronze rings in a dark void.
// GPU objects are built lazily per mount and disposed on unmount.

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { createHeroKineticsTracker } from "@/lib/heroKinetics";
import { KolamKnotCurve } from "./gopuramArt";

function useLegacyAssets(tubular: number, radial: number) {
  const geometries = useMemo(
    () => ({
      knot: new THREE.TubeGeometry(new KolamKnotCurve(), tubular, 0.07, radial, true),
      torus: new THREE.TorusGeometry(4.0, 0.12, 32, 200),
      inner: new THREE.TorusGeometry(1.85, 0.04, 24, 120),
      dot: new THREE.SphereGeometry(0.28, 32, 24),
    }),
    [tubular, radial]
  );
  const materials = useMemo(
    () => ({
      ring: new THREE.MeshPhysicalMaterial({ color: "#A6F0CF", metalness: 0.92, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.2, emissive: new THREE.Color("#2A1808"), emissiveIntensity: 0.15 }),
      kolam: new THREE.MeshPhysicalMaterial({ color: "#CD7F32", metalness: 0.88, roughness: 0.24, clearcoat: 0.85 }),
      core: new THREE.MeshPhysicalMaterial({ color: "#F2BE54", metalness: 0.94, roughness: 0.15, clearcoat: 1.0, emissive: new THREE.Color("#A6F0CF"), emissiveIntensity: 0.45 }),
    }),
    []
  );
  useDisposeOnUnmount(geometries, materials);
  return { geometries, materials };
}

function LegacyRing({ index, isMobile, scrollProgressRef, assets }: {
  index: number;
  isMobile: boolean;
  scrollProgressRef: React.RefObject<number>;
  assets: ReturnType<typeof useLegacyAssets>;
}) {
  const ref = useRef<THREE.Group>(null);
  const rotation = useMemo(() => [0.2, -0.25, (index * Math.PI) / 4] as const, [index]);
  const scale = 1 + index * 0.08;
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!ref.current) return;
    const p = scrollProgressRef.current ?? 0;
    const detentP = p - (Math.sin(p * 5 * Math.PI * 2) / (Math.PI * 10)) * 0.55;
    const alignment = 1 - THREE.MathUtils.smoothstep(detentP, 0.78, 0.98);
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, rotation[0] * alignment, 8, dt);
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, rotation[1] * alignment, 8, dt);
    ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, rotation[2] * alignment, 8, dt);
  });
  const { geometries: g, materials: m } = assets;
  return (
    <group ref={ref} position={[isMobile ? 0 : 2.4, 0, -index * 20]} rotation={[...rotation]} scale={scale}>
      <mesh geometry={g.torus} material={m.ring} />
      <mesh geometry={g.inner} material={m.ring} />
      <mesh geometry={g.dot} material={m.core} />
      <mesh geometry={g.knot} material={m.kolam} />
    </group>
  );
}

function LegacyCamera({ scrollProgressRef, isMobile }: { scrollProgressRef: React.RefObject<number>; isMobile: boolean }) {
  const kinetics = useRef(createHeroKineticsTracker(7.5, 5.0, 4.0));
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const camera = state.camera;
    const k = kinetics.current.update(scrollProgressRef.current ?? 0, state.pointer, dt);
    const p = k.smoothProgress;
    const detentP = p - (Math.sin(p * 5 * Math.PI * 2) / (Math.PI * 10)) * 0.55;
    const targetZ = THREE.MathUtils.lerp(12, -88, detentP);
    const exitT = Math.max(0, Math.min(1, (p - 0.8) / 0.2));
    const exitPush = exitT * exitT * 8.0;
    const targetX = (isMobile ? 0 : -2) * (1 - exitT) + (isMobile ? 0 : k.smoothPointerX * 0.45);
    const targetY = -k.smoothPointerY * 0.28;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 16, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 16, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ - exitPush, 16, dt);
    camera.lookAt(targetX * 0.5, targetY * 0.5, targetZ - exitPush - 10);
  });
  return null;
}

export function LegacyGopuramScene({ scrollProgressRef, isMobile, tier }: {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
  tier: "A" | "B";
}) {
  const assets = useLegacyAssets(tier === "A" ? 720 : 360, tier === "A" ? 32 : 16);
  return (
    <>
      <color attach="background" args={["#140C20"]} />
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} near={0.05} far={150} />
      <fog attach="fog" args={["#140C20", 10, 95]} />
      <directionalLight position={[10, 20, 10]} intensity={2.2} color="#F4F0FA" />
      <ambientLight intensity={1.2} color="#3A2618" />
      <directionalLight position={[-10, 5, -10]} intensity={0.8} color="#A6F0CF" />
      {Array.from({ length: 5 }, (_, i) => (
        <LegacyRing key={i} index={i} isMobile={isMobile} scrollProgressRef={scrollProgressRef} assets={assets} />
      ))}
      <LegacyCamera scrollProgressRef={scrollProgressRef} isMobile={isMobile} />
    </>
  );
}
