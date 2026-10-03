"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { GUITAR_STRINGS } from "./stringMath";
import { StringEnergyModel } from "./energy";
import { createStringMaterial } from "./stringMaterial";
import { getStringSpacing, getStringHeight } from "../neck/fretMath";
import { heroState, registerPluckHandlers } from "../state";
import { triggerStrumSequence } from "../props/strumStateMachine";

// Global energy model instance accessible across components and debug HUD
export const globalStringEnergy = new StringEnergyModel();

export function Strings() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // 1. Material and Uniforms
  const { material, uniforms } = useMemo(() => createStringMaterial(), []);
  const uniformsRef = useRef(uniforms);

  // 2. Base Cylinder Geometry oriented along Z (z = 0 at nut to z = -100 at bridge)
  const geometry = useMemo(() => {
    // 512 length segments along Z, 8 radial segments (§3.3)
    const geo = new THREE.CylinderGeometry(1.0, 1.0, 100.0, 8, 512, true);
    // Rotate so axis is Z and position spans [0, -100]
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, -50);

    // Per-instance attributes
    const count = 6;
    const freqs = new Float32Array(count);
    const energies = new Float32Array(count);
    const pluckTs = new Float32Array(count);
    const pluckAmps = new Float32Array(count);
    const phases = new Float32Array(count);
    const radii = new Float32Array(count);
    const wounds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const s = GUITAR_STRINGS[i];
      freqs[i] = s.fundamentalHz;
      energies[i] = 0.0;
      pluckTs[i] = -1.0;
      pluckAmps[i] = 0.0;
      phases[i] = s.phase;
      radii[i] = s.radius;
      wounds[i] = s.isWound ? 1.0 : 0.0;
    }

    geo.setAttribute("aFreq", new THREE.InstancedBufferAttribute(freqs, 1));
    geo.setAttribute("aEnergy", new THREE.InstancedBufferAttribute(energies, 1));
    geo.setAttribute("aPluckT", new THREE.InstancedBufferAttribute(pluckTs, 1));
    geo.setAttribute("aPluckAmp", new THREE.InstancedBufferAttribute(pluckAmps, 1));
    geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
    geo.setAttribute("aRadius", new THREE.InstancedBufferAttribute(radii, 1));
    geo.setAttribute("aWound", new THREE.InstancedBufferAttribute(wounds, 1));

    return geo;
  }, []);

  // 3. Setup Instance Transforms (Fanning from nut to bridge)
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const defaultDir = new THREE.Vector3(0, 0, -1);

    for (let i = 0; i < 6; i++) {
      // Nut position at s = 0
      const spacingNut = getStringSpacing(0);
      const x0 = (i - 2.5) * spacingNut;
      const y0 = getStringHeight(0);
      const z0 = 0.0;

      // Bridge position at s = 100
      const spacingBridge = getStringSpacing(100);
      const x100 = (i - 2.5) * spacingBridge;
      const y100 = getStringHeight(100);
      const z100 = -100.0;

      // Vector along string
      const dir = new THREE.Vector3(x100 - x0, y100 - y0, z100 - z0);
      const len = dir.length();
      dir.normalize();

      // Rotation quaternion from (0, 0, -1) to dir
      const quat = new THREE.Quaternion().setFromUnitVectors(defaultDir, dir);

      // Scale Z to match length exactly
      dummy.position.set(x0, y0, z0);
      dummy.quaternion.copy(quat);
      dummy.scale.set(1.0, 1.0, len / 100.0);
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  // 4. Per-frame physics simulation and attribute streaming
  useFrame((state, delta) => {
    // Cap delta time to prevent physics explosions on tab suspension
    const dt = Math.min(delta, 0.05);

    // Update global uniforms via ref
    const u = uniformsRef.current;
    u.uTime.value = state.clock.getElapsedTime();
    u.uDamperK.value = globalStringEnergy.damperK;
    u.uDamperPos.value = globalStringEnergy.damperPos;
    u.uLoadK.value = globalStringEnergy.loadK;
    u.uLoadPos.value = globalStringEnergy.loadPos;

    // Decay raw velocity toward 0 when user is not actively scrolling
    if (performance.now() - heroState.lastScrollTime > 60) {
      heroState.rawVelocity *= Math.exp(-dt / 0.05);
      if (Math.abs(heroState.rawVelocity) < 1.0) {
        heroState.rawVelocity = 0.0;
      }
    }

    // Advance energy model using ScrollTrigger raw velocity
    globalStringEnergy.update(dt, heroState.rawVelocity, heroState.stringsDamperK);

    // Stream updated attributes to GPU buffer
    const geo = meshRef.current?.geometry;
    if (geo) {
      const aEnergyAttr = geo.getAttribute("aEnergy") as THREE.InstancedBufferAttribute;
      const aPluckTAttr = geo.getAttribute("aPluckT") as THREE.InstancedBufferAttribute;
      const aPluckAmpAttr = geo.getAttribute("aPluckAmp") as THREE.InstancedBufferAttribute;

      if (aEnergyAttr && aPluckTAttr && aPluckAmpAttr) {
        for (let i = 0; i < 6; i++) {
          aEnergyAttr.setX(i, globalStringEnergy.energy[i]);
          aPluckTAttr.setX(i, globalStringEnergy.pluckT[i]);
          aPluckAmpAttr.setX(i, globalStringEnergy.pluckAmp[i]);

          // Update HUD telemetry mirror
          heroState.stringEnergies[i] = globalStringEnergy.energy[i];
        }

        aEnergyAttr.needsUpdate = true;
        aPluckTAttr.needsUpdate = true;
        aPluckAmpAttr.needsUpdate = true;
      }
    }
  });

  // 5. Register global pluck handlers and cleanup on unmount
  useEffect(() => {
    registerPluckHandlers(
      (idx, amp) => globalStringEnergy.triggerPluck(idx, amp),
      () => triggerStrumSequence()
    );

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, 6]}
      castShadow
      receiveShadow
      name="guitar-strings"
    />
  );
}
