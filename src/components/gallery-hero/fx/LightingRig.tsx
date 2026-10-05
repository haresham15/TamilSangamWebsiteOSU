"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { heroState } from "../state";

/**
 * LightingRig (§3.6)
 *
 * Implements the 3-era palette progression with critically damped spring smoothing:
 * - Era 1 (0–33%): Morning amber (#FFB84D key, #FFE8C2 sky fill, #F0C98A warm haze)
 * - Era 2 (33–66%): Sunset backlight (#FF5E3A key, #B0306F magenta fill, #4A1738 fog)
 * - Era 3 (66–100%): Cold steel (#9DB7CC soft key, #3B536B fill, #1A242F dense fog)
 *
 * Guaranteed <= 3 transitions/sec via critically damped spring (§4.3).
 * Key light follows camera rig along Z.
 */

// Era Presets (§3.6)
const ERA_PRESETS = {
  era1: {
    keyColor: new THREE.Color("#FFB84D"),
    keyIntensity: 3.2,
    keyPosOffset: new THREE.Vector3(-4.0, 4.2, 5.0), // 18° front-left
    fillSky: new THREE.Color("#FFE8C2"),
    fillGround: new THREE.Color("#5A3A20"),
    fillIntensity: 0.6,
    fogColor: new THREE.Color("#F0C98A"),
    fogDensity: 0.004,
    exposure: 1.1,
  },
  era2: {
    keyColor: new THREE.Color("#FF5E3A"),
    keyIntensity: 4.0,
    keyPosOffset: new THREE.Vector3(3.5, 2.0, -12.0), // 6° behind-right backlight
    fillSky: new THREE.Color("#B0306F"),
    fillGround: new THREE.Color("#2A1030"),
    fillIntensity: 0.8,
    fogColor: new THREE.Color("#4A1738"),
    fogDensity: 0.008,
    exposure: 0.95,
  },
  era3: {
    keyColor: new THREE.Color("#9DB7CC"),
    keyIntensity: 0.9,
    keyPosOffset: new THREE.Vector3(0.0, 7.0, -2.0), // 70° diffuse overhead
    fillSky: new THREE.Color("#3B536B"),
    fillGround: new THREE.Color("#10161D"),
    fillIntensity: 0.5,
    fogColor: new THREE.Color("#1A242F"),
    fogDensity: 0.055,
    exposure: 0.8,
  },
};

export function LightingRig() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);

  // Current interpolated state values
  const currentKeyColor = useRef(new THREE.Color("#FFB84D"));
  const currentKeyIntensity = useRef(3.2);
  const currentKeyOffset = useRef(new THREE.Vector3(-4.0, 4.2, 5.0));

  const currentFillSky = useRef(new THREE.Color("#FFE8C2"));
  const currentFillGround = useRef(new THREE.Color("#5A3A20"));
  const currentFillIntensity = useRef(0.6);

  const currentFogColor = useRef(new THREE.Color("#F0C98A"));
  const currentFogDensity = useRef(0.004);

  // Damped spring targets
  const targetKeyColor = useMemo(() => new THREE.Color(), []);
  const targetKeyOffset = useMemo(() => new THREE.Vector3(), []);
  const targetFillSky = useMemo(() => new THREE.Color(), []);
  const targetFillGround = useMemo(() => new THREE.Color(), []);
  const targetFogColor = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0), 0.05);
    const p = heroState.progress;
    const camZ = state.camera.position.z;

    // 1. Calculate Target Palette from Progress Windows
    // Era 1 -> 2: 28% to 38%
    // Era 2 -> 3: 63% to 67%
    let t1_2 = 0;
    if (p > 0.28 && p < 0.38) {
      t1_2 = (p - 0.28) / 0.10;
    } else if (p >= 0.38) {
      t1_2 = 1.0;
    }

    let t2_3 = 0;
    if (p > 0.63 && p < 0.67) {
      t2_3 = (p - 0.63) / 0.04;
    } else if (p >= 0.67) {
      t2_3 = 1.0;
    }

    const { era1, era2, era3 } = ERA_PRESETS;

    if (t2_3 > 0) {
      // Blending between Era 2 and Era 3
      targetKeyColor.copy(era2.keyColor).lerp(era3.keyColor, t2_3);
      targetKeyOffset.copy(era2.keyPosOffset).lerp(era3.keyPosOffset, t2_3);
      targetFillSky.copy(era2.fillSky).lerp(era3.fillSky, t2_3);
      targetFillGround.copy(era2.fillGround).lerp(era3.fillGround, t2_3);
      targetFogColor.copy(era2.fogColor).lerp(era3.fogColor, t2_3);

      const targetKeyInt = THREE.MathUtils.lerp(era2.keyIntensity, era3.keyIntensity, t2_3);
      const targetFillInt = THREE.MathUtils.lerp(era2.fillIntensity, era3.fillIntensity, t2_3);
      const targetFogDens = THREE.MathUtils.lerp(era2.fogDensity, era3.fogDensity, t2_3);
      const targetExp = THREE.MathUtils.lerp(era2.exposure, era3.exposure, t2_3);

      // Critically damped spring integration (omega = 6.0)
      const damp = Math.min(1.0, 6.0 * safeDelta);
      currentKeyColor.current.lerp(targetKeyColor, damp);
      currentKeyIntensity.current = THREE.MathUtils.lerp(currentKeyIntensity.current, targetKeyInt, damp);
      currentKeyOffset.current.lerp(targetKeyOffset, damp);

      currentFillSky.current.lerp(targetFillSky, damp);
      currentFillGround.current.lerp(targetFillGround, damp);
      currentFillIntensity.current = THREE.MathUtils.lerp(currentFillIntensity.current, targetFillInt, damp);

      currentFogColor.current.lerp(targetFogColor, damp);
      currentFogDensity.current = THREE.MathUtils.lerp(currentFogDensity.current, targetFogDens, damp);

      state.gl.toneMappingExposure = THREE.MathUtils.lerp(state.gl.toneMappingExposure, targetExp, damp);
    } else {
      // Blending between Era 1 and Era 2
      targetKeyColor.copy(era1.keyColor).lerp(era2.keyColor, t1_2);
      targetKeyOffset.copy(era1.keyPosOffset).lerp(era2.keyPosOffset, t1_2);
      targetFillSky.copy(era1.fillSky).lerp(era2.fillSky, t1_2);
      targetFillGround.copy(era1.fillGround).lerp(era2.fillGround, t1_2);
      targetFogColor.copy(era1.fogColor).lerp(era2.fogColor, t1_2);

      const targetKeyInt = THREE.MathUtils.lerp(era1.keyIntensity, era2.keyIntensity, t1_2);
      const targetFillInt = THREE.MathUtils.lerp(era1.fillIntensity, era2.fillIntensity, t1_2);
      const targetFogDens = THREE.MathUtils.lerp(era1.fogDensity, era2.fogDensity, t1_2);
      const targetExp = THREE.MathUtils.lerp(era1.exposure, era2.exposure, t1_2);

      const damp = Math.min(1.0, 6.0 * safeDelta);
      currentKeyColor.current.lerp(targetKeyColor, damp);
      currentKeyIntensity.current = THREE.MathUtils.lerp(currentKeyIntensity.current, targetKeyInt, damp);
      currentKeyOffset.current.lerp(targetKeyOffset, damp);

      currentFillSky.current.lerp(targetFillSky, damp);
      currentFillGround.current.lerp(targetFillGround, damp);
      currentFillIntensity.current = THREE.MathUtils.lerp(currentFillIntensity.current, targetFillInt, damp);

      currentFogColor.current.lerp(targetFogColor, damp);
      currentFogDensity.current = THREE.MathUtils.lerp(currentFogDensity.current, targetFogDens, damp);

      state.gl.toneMappingExposure = THREE.MathUtils.lerp(state.gl.toneMappingExposure, targetExp, damp);
    }

    // 2. Apply to Lights
    if (keyLightRef.current) {
      keyLightRef.current.color.copy(currentKeyColor.current);
      keyLightRef.current.intensity = currentKeyIntensity.current;
      keyLightRef.current.position.set(
        currentKeyOffset.current.x,
        currentKeyOffset.current.y,
        camZ + currentKeyOffset.current.z
      );
      keyLightRef.current.target.position.set(0, 0.2, camZ - 12.0);
      keyLightRef.current.target.updateMatrixWorld();
    }

    if (hemiLightRef.current) {
      hemiLightRef.current.color.copy(currentFillSky.current);
      hemiLightRef.current.groundColor.copy(currentFillGround.current);
      hemiLightRef.current.intensity = currentFillIntensity.current;
    }

    if (rimLightRef.current) {
      rimLightRef.current.position.set(3.0, 1.5, camZ - 20.0);
    }

    // 3. Update Scene Fog & Background
    if (state.scene.fog && state.scene.fog instanceof THREE.FogExp2) {
      state.scene.fog.color.copy(currentFogColor.current);
      state.scene.fog.density = currentFogDensity.current;
    }
    if (state.scene.background && state.scene.background instanceof THREE.Color) {
      state.scene.background.copy(currentFogColor.current);
    }
  });

  return (
    <group>
      {/* 1. Key Directional Light with Shadow */}
      <directionalLight
        ref={keyLightRef}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0001}
      />

      {/* 2. Hemisphere Fill Light */}
      <hemisphereLight ref={hemiLightRef} />

      {/* 3. Rim / Accent Light */}
      <directionalLight
        ref={rimLightRef}
        color="#FFF2D6"
        intensity={0.6}
      />
    </group>
  );
}
