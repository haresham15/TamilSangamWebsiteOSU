"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const ARCHIVE_PHOTOS = [
  "/events/berry-cute-picnic/picnic-01.jpg",
  "/events/berry-cute-picnic/picnic-02.jpg",
  "/events/berry-cute-picnic/picnic-03.jpg",
  "/events/berry-cute-picnic/picnic-04.jpg",
  "/events/berry-cute-picnic/picnic-05.jpg",
  "/events/berry-cute-picnic/picnic-06.jpg",
];

import { createHeroKineticsTracker } from "@/lib/heroKinetics";
import { heroState } from "./state";

export function ArchivalPlanes() {
  const textures = useTexture(ARCHIVE_PHOTOS, (loaded) => {
    const list = Array.isArray(loaded) ? loaded : [loaded];
    list.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
    });
  });

  const groupRef = useRef<THREE.Group>(null);
  const kineticsRef = useRef(createHeroKineticsTracker(7.5, 5.0, 4.0));
  const borderMatsRef = useRef<THREE.MeshBasicMaterial[]>([]);
  const planeGroupsRef = useRef<(THREE.Group | null)[]>([]);

  const planes = useMemo(() => {
    return [
      { pos: [-3.8, 1.2, -8], rot: [0.05, 0.12, -0.04], scale: [3.4, 2.3, 1] },
      { pos: [3.6, -0.8, -14], rot: [-0.08, -0.15, 0.05], scale: [3.8, 2.6, 1] },
      { pos: [-2.9, -1.4, -22], rot: [0.06, 0.08, -0.06], scale: [4.2, 2.8, 1] },
      { pos: [3.2, 1.6, -28], rot: [-0.05, -0.1, 0.03], scale: [4.5, 3.0, 1] },
      { pos: [-1.8, 2.2, -36], rot: [0.08, 0.05, -0.02], scale: [4.8, 3.2, 1] },
      { pos: [2.1, -1.9, -44], rot: [-0.06, -0.08, 0.04], scale: [5.2, 3.5, 1] },
    ];
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!groupRef.current) return;
    const kinetics = kineticsRef.current.update(0, state.pointer, dt);
    const t = state.clock.getElapsedTime();

    // Gentle cinematic drift
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      Math.sin(t * 0.35) * 0.12,
      3,
      dt
    );
    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      Math.cos(t * 0.28) * 0.08,
      3,
      dt
    );

    // 35mm slide 3D pointer parallax tilt
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      -kinetics.smoothPointerY * 0.12,
      5.0,
      dt
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      kinetics.smoothPointerX * 0.15,
      5.0,
      dt
    );

    // Sympathetic ripple and golden-hour bloom across memory cards
    const easterEggBoost = heroState.easterEggActive ? 1.0 : 0.0;
    planes.forEach((p, idx) => {
      const g = planeGroupsRef.current[idx];
      const mat = borderMatsRef.current[idx];
      const stringEnergy = heroState.stringEnergies[idx % 6] || 0.0;

      if (g) {
        const baseScale = p.scale as [number, number, number];
        const targetScaleMultiplier = 1.0 + stringEnergy * 0.05 + easterEggBoost * 0.08;
        g.scale.x = THREE.MathUtils.damp(g.scale.x, baseScale[0] * targetScaleMultiplier, 6.0, dt);
        g.scale.y = THREE.MathUtils.damp(g.scale.y, baseScale[1] * targetScaleMultiplier, 6.0, dt);
      }

      if (mat) {
        const targetOpacity = 0.35 + stringEnergy * 0.45 + easterEggBoost * 0.55;
        mat.opacity = THREE.MathUtils.damp(mat.opacity, Math.min(0.95, targetOpacity), 6.0, dt);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {planes.map((p, idx) => {
        const tex = Array.isArray(textures) ? textures[idx % textures.length] : textures;
        return (
          <group
            key={idx}
            ref={(el) => {
              planeGroupsRef.current[idx] = el;
            }}
            position={p.pos as [number, number, number]}
            rotation={p.rot as [number, number, number]}
            scale={p.scale as [number, number, number]}
          >
            {/* Delicate warm gold 35mm slide border with sympathetic halation */}
            <mesh position={[0, 0, -0.005]}>
              <planeGeometry args={[1.04, 1.04]} />
              <meshBasicMaterial
                ref={(mat) => {
                  if (mat) borderMatsRef.current[idx] = mat;
                }}
                color="#E8984A"
                transparent={true}
                opacity={0.35}
                depthWrite={false}
              />
            </mesh>
            {/* Archival memory photo plane */}
            <mesh>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial
                map={tex}
                transparent={true}
                opacity={0.65}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
