"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getTortoiseshellTexture } from "./tortoiseshellTexture";
import { currentStrumState } from "./strumStateMachine";
import { heroState } from "../state";

/**
 * 351 Tortoiseshell Guitar Pick & Motion Blur Echoes (§5.3, Phase 4)
 *
 * Implements:
 * - Extruded beveled teardrop guitar pick geometry
 * - Translucent tortoiseshell celluloid texture (MeshPhysicalMaterial with transmission 0.55)
 * - Motion blur echo copies (ghost1, ghost2) along CatmullRom swoop
 */
export function Pick() {
  const leadMeshRef = useRef<THREE.Mesh>(null);
  const ghost1MeshRef = useRef<THREE.Mesh>(null);
  const ghost2MeshRef = useRef<THREE.Mesh>(null);

  // Material refs attached to JSX elements to comply with React 19 immutability rules
  const leadMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const ghost1MatRef = useRef<THREE.MeshStandardMaterial>(null);
  const ghost2MatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Tortoiseshell texture
  const tex = useMemo(() => getTortoiseshellTexture(), []);

  // Classic 351 shape extruded with smooth bevel
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.68);
    shape.bezierCurveTo(-0.25, -0.45, -0.52, 0.05, -0.52, 0.38);
    shape.bezierCurveTo(-0.52, 0.58, -0.32, 0.68, 0, 0.68);
    shape.bezierCurveTo(0.32, 0.68, 0.52, 0.58, 0.52, 0.38);
    shape.bezierCurveTo(0.52, 0.05, 0.25, -0.45, 0, -0.68);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    geo.scale(0.85, 0.85, 0.85);
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  // Per-frame transform sync from strum state machine
  useFrame(() => {
    const isVisible = currentStrumState.visible;

    // Lead pick
    if (leadMeshRef.current) {
      leadMeshRef.current.visible = isVisible && currentStrumState.lead.opacity > 0.01;
      leadMeshRef.current.position.copy(currentStrumState.lead.position);
      leadMeshRef.current.rotation.copy(currentStrumState.lead.rotation);
    }
    if (leadMatRef.current) {
      leadMatRef.current.opacity = currentStrumState.lead.opacity;
    }

    // Ghost 1 (first motion blur echo)
    if (ghost1MeshRef.current) {
      ghost1MeshRef.current.visible = isVisible && currentStrumState.ghost1.opacity > 0.01;
      ghost1MeshRef.current.position.copy(currentStrumState.ghost1.position);
      ghost1MeshRef.current.rotation.copy(currentStrumState.ghost1.rotation);
    }
    if (ghost1MatRef.current) {
      ghost1MatRef.current.opacity = currentStrumState.ghost1.opacity;
    }

    // Ghost 2 (second motion blur echo)
    if (ghost2MeshRef.current) {
      ghost2MeshRef.current.visible = isVisible && currentStrumState.ghost2.opacity > 0.01;
      ghost2MeshRef.current.position.copy(currentStrumState.ghost2.position);
      ghost2MeshRef.current.rotation.copy(currentStrumState.ghost2.rotation);
    }
    if (ghost2MatRef.current) {
      ghost2MatRef.current.opacity = currentStrumState.ghost2.opacity;
    }
  });

  const isTierA = heroState.tier === "A";

  return (
    <group name="guitar-pick-assembly">
      {/* Ghost 2 (oldest motion blur echo) */}
      <mesh ref={ghost2MeshRef} geometry={geometry}>
        <meshStandardMaterial
          ref={ghost2MatRef}
          map={tex}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Ghost 1 (intermediate motion blur echo) */}
      <mesh ref={ghost1MeshRef} geometry={geometry}>
        <meshStandardMaterial
          ref={ghost1MatRef}
          map={tex}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Lead pick */}
      <mesh ref={leadMeshRef} geometry={geometry} castShadow>
        <meshPhysicalMaterial
          ref={leadMatRef}
          map={tex}
          roughness={0.18}
          metalness={0.08}
          transmission={isTierA ? 0.55 : 0.0}
          thickness={isTierA ? 0.6 : 0.0}
          ior={1.5}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
