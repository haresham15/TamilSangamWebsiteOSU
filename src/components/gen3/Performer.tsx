"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { getScrollProgress } from "./useScrollCinematic";
import { useRimShaderMaterial, type BacklitRim } from "./useRimShaderMaterial";
import * as THREE from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";

// Procedural placeholder (scripts/generate-performer-glb.mjs); a rigged model is still owed.
const MODEL_URL = "/models/performer.glb";

// Bone names as written by scripts/generate-performer-glb.mjs, with Mixamo names as a
// fallback for a future rigged model.
const FOREARM_BONES = ["RightForeArm", "mixamorigRightForeArm"];
const HAND_BONES = ["RightHand", "mixamorigRightHand"];

interface GLTFLoaderWithExtensions {
  dracoLoader?: { setDecoderPath: (path: string) => void };
  setKTX2Loader: (loader: KTX2Loader) => void;
}

function extendLoader(loader: unknown) {
  const gltfLoader = loader as GLTFLoaderWithExtensions;
  if (gltfLoader.dracoLoader) {
    gltfLoader.dracoLoader.setDecoderPath("/decoders/draco/");
  }
  const ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath("/decoders/basis/");
  gltfLoader.setKTX2Loader(ktx2Loader);
}

// Preload with Draco and KTX2 decoders pointing to public/decoders. This module is only
// imported by the live (non-static) hero, so static mode never fetches the model.
useGLTF.preload(MODEL_URL, true, true, extendLoader);

function findBone(scene: THREE.Object3D, names: string[]) {
  for (const name of names) {
    const found = scene.getObjectByName(name);
    if (found) return found as THREE.Bone;
  }
  return null;
}

interface PerformerProps {
  position?: [number, number, number];
  scale?: number;
  /** Art pass: dark body with a rim only on edges facing the light behind the performer. */
  backlit?: BacklitRim & { color: THREE.ColorRepresentation };
}

export function Performer({ position = [0, 0, 0], scale = 1, backlit }: PerformerProps = {}) {
  const rimMaterial = useRimShaderMaterial(
    backlit ? 0x0a0807 : 0x250d38,
    backlit ? backlit.color : 0xff6b00,
    backlit ? 0.7 : 0.65,
    backlit ? 0.0 : 0.1,
    backlit ? { lightPosition: backlit.lightPosition, strength: backlit.strength } : undefined
  );

  // A missing or invalid model throws here; the hero's error boundary shows the static poster.
  const { scene, animations } = useGLTF(MODEL_URL, true, true, extendLoader);

  const { actions } = useAnimations(animations, scene);

  // Resolved once per loaded scene, not per frame.
  const debug = useMemo(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1",
    []
  );
  const bones = useMemo(() => ({ foreArm: findBone(scene, FOREARM_BONES), hand: findBone(scene, HAND_BONES) }), [scene]);

  const proxyForeArmEuler = useRef(new THREE.Euler(-0.3, 0.0, -1.2));
  const proxyHandEuler = useRef(new THREE.Euler(0.0, 0.0, 0.2));
  const proxyForeArmQuat = useRef(new THREE.Quaternion());
  const proxyHandQuat = useRef(new THREE.Quaternion());

  useEffect(() => {
    if (debug) {
      const boneNames: string[] = [];
      scene.traverse((child) => {
        if ((child as THREE.Bone).isBone) {
          boneNames.push(child.name);
        }
      });
      console.log("[Performer Debug] Found Bones:", boneNames);
      console.log("[Performer Debug] Found Animations:", animations.map(a => a.name));
    }

    if (actions && actions["dance_loop"]) {
      actions["dance_loop"].play();
    } else if (actions && Object.keys(actions).length > 0) {
      // Fallback: play the first available animation if "dance_loop" isn't found
      const firstAction = Object.values(actions)[0];
      if (firstAction) firstAction.play();
    }

    // Traverse and ensure materials are standard physical materials
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Apply the cinematic rim material
        mesh.material = rimMaterial;
      }
    });
  }, [scene, actions, animations, rimMaterial, debug]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const progress = getScrollProgress();

    let blendFactor = 0.0;
    if (debug) {
      blendFactor = 1.0;
    } else {
      if (progress < 0.65) {
        blendFactor = 0.0;
      } else if (progress >= 0.65 && progress <= 0.85) {
        blendFactor = THREE.MathUtils.smoothstep(progress, 0.65, 0.85);
      } else {
        blendFactor = 1.0;
      }
    }

    const { foreArm, hand } = bones;
    if (blendFactor > 0.0 && foreArm && hand) {
      proxyForeArmQuat.current.setFromEuler(proxyForeArmEuler.current);
      proxyHandEuler.current.set(0.0, progress * Math.PI * 2, 0.2);
      proxyHandQuat.current.setFromEuler(proxyHandEuler.current);

      const slerpStep = Math.min(1.0, blendFactor * (dt / 0.016));
      foreArm.quaternion.slerp(proxyForeArmQuat.current, slerpStep);
      hand.quaternion.slerp(proxyHandQuat.current, slerpStep);
    }
  });

  return <primitive object={scene} position={position} scale={scale} />;
}
