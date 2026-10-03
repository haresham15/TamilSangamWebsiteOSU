"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getTicketTexture } from "./ticketTexture";
import { patchDissolveMaterial, type DissolveUniforms } from "./dissolveShader";
import { getSharedHeroRefs } from "./types";
import { heroState } from "../state";

/**
 * Creates Ticket material and uniforms factory outside React render (§6).
 */
export function createTicketMaterial(): {
  material: THREE.MeshStandardMaterial;
  uniforms: DissolveUniforms;
} {
  const uniforms: DissolveUniforms = {
    uDissolve: { value: 1.0 },
    uEdgeColor: { value: new THREE.Color("#FFB84D") },
    uEdgeWidth: { value: 0.09 },
    uNoiseScale: { value: 1.8 },
  };

  const tex = getTicketTexture();
  const material = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.75,
    metalness: 0.05,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1.0,
  });

  patchDissolveMaterial(material, uniforms);
  return { material, uniforms };
}

/**
 * Procedural Vintage Train Ticket (§6, Phase 4)
 *
 * Implements:
 * - Subdivided curved plane (32x16 segments) with perforated scalloped edge
 * - Procedural aged parchment CanvasTexture with invented Sangam Junction branding
 * - Dynamic wind flutter reacting to scroll velocity
 * - Procedural 3D noise dissolve with amber edge burn (#FFB84D)
 */
export function Ticket() {
  const heroRefs = getSharedHeroRefs();
  const meshRef = useRef<THREE.Mesh>(null);

  // Material and uniforms created via stable factory
  const { material, uniforms } = useMemo(() => createTicketMaterial(), []);
  const uniformsRef = useRef(uniforms);

  // Curved and perforated ticket geometry
  const geometry = useMemo(() => {
    const w = 2.4;
    const h = 1.2;
    const segX = 32;
    const segY = 16;
    const geo = new THREE.PlaneGeometry(w, h, segX, segY);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // 1. Subtle cylindrical curl along long axis
      const normX = x / (w * 0.5);
      const curlZ = -0.06 * (normX * normX);

      // 2. Scalloped serrated tear notches on the leftmost column
      let scallopedX = x;
      if (normX < -0.96) {
        // Jagged perforation teeth
        const notch = Math.sin(y * 45.0) * 0.025;
        scallopedX += notch;
      }

      pos.setXYZ(i, scallopedX, y, curlZ);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Per-frame dissolve sync and dynamic wind flutter
  useFrame((state) => {
    const dVal = heroRefs.ticket.uDissolve.value;
    uniformsRef.current.uDissolve.value = dVal;

    // Visibility cull when fully dissolved
    if (meshRef.current) {
      meshRef.current.visible = dVal < 0.999;
    }

    // Dynamic wind flutter based on scroll velocity
    if (meshRef.current && dVal < 0.999) {
      const t = state.clock.getElapsedTime();
      const vel = Math.abs(heroState.rawVelocity);
      const flutterFactor = Math.min(1.0, vel / 800.0);
      const flutter = Math.sin(t * 14.0) * (0.015 + 0.045 * flutterFactor);
      meshRef.current.rotation.z = flutter;
    }
  });

  return (
    <primitive object={heroRefs.ticket.group} name="prop-ticket">
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
      />
    </primitive>
  );
}
