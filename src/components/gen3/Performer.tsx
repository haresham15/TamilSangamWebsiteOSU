"use client";

import React, { useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { getScrollProgress } from "./useScrollCinematic";
import { useRimShaderMaterial } from "./useRimShaderMaterial";
import * as THREE from "three";
import { KTX2Loader } from "three-stdlib";

// Human deliverable required for this to load successfully.
const MODEL_URL = "/models/performer.glb";

// Preload configuration with Draco and KTX2 decoders explicitly pointing to public/decoders
useGLTF.preload(MODEL_URL, true, true, (loader) => {
  const gltfLoader = loader as any;
  
  // Set Draco decoder path
  if (gltfLoader.dracoLoader) {
    gltfLoader.dracoLoader.setDecoderPath("/decoders/draco/");
  }

  // Set KTX2 Transcoder path (requires a WebGL context, so usually configured inside a component or via a factory, 
  // but `@react-three/drei`'s `useGLTF` internal caching mechanism can handle it if we inject it right)
  const ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath("/decoders/basis/");
  // We need the renderer to detect support, but in preload we might not have it yet. 
  // R3F usually handles this internally if we just pass the path, or we configure it in the component.
  // For now, attaching it to the loader:
  gltfLoader.setKTX2Loader(ktx2Loader);
});

export function Performer() {
  const rimMaterial = useRimShaderMaterial();

  // If the file is missing, this will throw, and the CanvasErrorBoundary will catch it and render magenta.
  const { scene, animations } = useGLTF(MODEL_URL, true, true, (loader) => {
    const gltfLoader = loader as any;
    if (gltfLoader.dracoLoader) {
      gltfLoader.dracoLoader.setDecoderPath("/decoders/draco/");
    }
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath("/decoders/basis/");
    gltfLoader.setKTX2Loader(ktx2Loader);
  });

  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    const isDebug = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";
    if (isDebug) {
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
  }, [scene, actions, animations, rimMaterial]);

  useFrame(() => {
    const isDebug = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";
    let progress = getScrollProgress();
    
    let blendFactor = 0.0;
    if (isDebug) {
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

    if (blendFactor > 0.0) {
      // TODO: Actual bone names will be confirmed via debug log. Assuming Mixamo fallback for now.
      const rightForeArm = (scene.getObjectByName("RightForeArm") || scene.getObjectByName("mixamorigRightForeArm")) as THREE.Bone;
      const rightHand = (scene.getObjectByName("RightHand") || scene.getObjectByName("mixamorigRightHand")) as THREE.Bone;

      if (rightForeArm && rightHand) {
        // LOCAL space quaternions relative to bind pose, NOT world space from Object3D proxy
        const proxyForeArmQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.3, 0.0, -1.2));
        const proxyHandQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.0, progress * Math.PI * 2, 0.2));

        rightForeArm.quaternion.slerp(proxyForeArmQuat, blendFactor);
        rightHand.quaternion.slerp(proxyHandQuat, blendFactor);
      }
    }
  });

  return <primitive object={scene} position={[0, 0, 0]} />;
}
