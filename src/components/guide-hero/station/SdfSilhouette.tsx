"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getSilhouetteSdfTexture, SilhouetteKind } from "./silhouetteSdf";
import { createSilhouetteMaterial } from "./SilhouetteMaterial";

export interface SdfSilhouetteProps {
  kind: SilhouetteKind;
  position?: THREE.Vector3Tuple;
  scale?: number | THREE.Vector3Tuple;
  fog?: boolean;
}

export function SdfSilhouette({
  kind,
  position = [0, 0, 0],
  scale = 1,
  fog = kind === "man",
}: SdfSilhouetteProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const resources = useMemo(() => {
    const sdfA = getSilhouetteSdfTexture(kind, "A");
    const sdfB = getSilhouetteSdfTexture(kind, "B");
    if (!sdfA || !sdfB) return null;

    const material = createSilhouetteMaterial({ sdfA, sdfB, fog, kind });
    return { material, sdfA, sdfB };
  }, [kind, fog]);

  useEffect(() => {
    return () => {
      resources?.material.dispose();
    };
  }, [resources]);

  // Idle animation state
  const idleTimer = useRef(0);
  const poseState = useRef({ current: 0, target: 0, transitionSpeed: 2.0 });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0 || !resources) return;

    const mat = resources.material;
    mat.uniforms.uTime.value += dt;

    if (reduceMotion) {
      mat.uniforms.uPose.value = 0.0;
      return;
    }

    idleTimer.current += dt;

    if (kind === "woman") {
      // Crossfade pose A <-> B every 7 seconds over 0.5s
      const cycle = idleTimer.current % 7.0;
      if (cycle < 0.5) {
        poseState.current.target = 1.0;
      } else if (cycle > 3.5 && cycle < 4.0) {
        poseState.current.target = 0.0;
      }
      poseState.current.current +=
        (poseState.current.target - poseState.current.current) * Math.min(1.0, dt * 4.0);
      mat.uniforms.uPose.value = poseState.current.current;
    } else {
      // Man: Breathing bob and subtle sway around feet
      const mesh = meshRef.current;
      if (mesh) {
        const sway = Math.sin(idleTimer.current * 0.8) * 0.009; // ±0.5°
        const bob = Math.sin(idleTimer.current * 1.6) * 0.004; // 2px breathing
        mesh.rotation.z = sway;
        mesh.position.y = position[1] + bob;
      }

      // Subtle weight shift every 10 seconds
      const cycle = idleTimer.current % 10.0;
      if (cycle < 0.8) {
        poseState.current.target = 1.0;
      } else if (cycle > 5.0 && cycle < 5.8) {
        poseState.current.target = 0.0;
      }
      poseState.current.current +=
        (poseState.current.target - poseState.current.current) * Math.min(1.0, dt * 2.5);
      mat.uniforms.uPose.value = poseState.current.current;
    }
  });

  if (!resources) {
    return null;
  }

  // Woman is 1.1x1.1m seated quad, Man is 0.9x1.75m standing quad
  const geometryArgs: [number, number] = kind === "woman" ? [1.1, 1.1] : [0.9, 1.75];
  const renderOrder = kind === "woman" ? 2 : 5;

  return (
    <mesh
      ref={meshRef}
      name={`Silhouette-${kind}`}
      position={position}
      scale={scale}
      renderOrder={renderOrder}
    >
      <planeGeometry args={geometryArgs} />
      <primitive object={resources.material} attach="material" />
    </mesh>
  );
}

export default SdfSilhouette;
