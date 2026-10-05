// src/components/gl/useWarmup.ts
"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type * as THREE from "three";
import { useBootStore } from "@/engine/bootStore";

/**
 * useWarmup (§6.3)
 * Non-blocking asynchronous shader compilation & texture pre-warming inside a View.
 * - Compiles shaders against production lights, fog, and tone mapping
 * - Uploads textures into WebGL via gl.initTexture to eliminate first-render stutter
 * - Records compilation duration in bootStore for debug HUD monitoring
 * - Marks the scene as ready for route transitions and the boot slate
 */
export function useWarmup(sceneId: string) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    let live = true;

    (async () => {
      const startTime = performance.now();

      // Wait for all web fonts so typography/textures dependent on fonts don't shift
      if (typeof document !== "undefined" && document.fonts) {
        try {
          await document.fonts.ready;
        } catch {
          // Ignore font error
        }
      }

      if (!live) return;

      try {
        // Asynchronous compilation walks visible scene objects (§6.3)
        if (typeof gl.compileAsync === "function") {
          await gl.compileAsync(scene, camera);
        } else {
          gl.compile(scene, camera);
        }

        // Initialize textures into GPU memory to prevent runtime hitches (§6.3)
        scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.isMesh && mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const mat of materials) {
              const stdMat = mat as THREE.MeshStandardMaterial;
              if (stdMat.map && typeof gl.initTexture === "function") {
                gl.initTexture(stdMat.map);
              }
              if (stdMat.normalMap && typeof gl.initTexture === "function") {
                gl.initTexture(stdMat.normalMap);
              }
              if (stdMat.roughnessMap && typeof gl.initTexture === "function") {
                gl.initTexture(stdMat.roughnessMap);
              }
              if (stdMat.metalnessMap && typeof gl.initTexture === "function") {
                gl.initTexture(stdMat.metalnessMap);
              }
            }
          }
        });

        const durationMs = Math.round(performance.now() - startTime);

        if (live) {
          useBootStore.getState().markReady(sceneId, durationMs);
        }
      } catch (err) {
        console.warn(`[useWarmup] Error during warm-up of scene "${sceneId}":`, err);
        // Guarantee markReady is called even on failure so the transition is never hung
        if (live) {
          useBootStore.getState().markReady(sceneId, 0);
        }
      }
    })();

    return () => {
      live = false;
    };
  }, [gl, scene, camera, sceneId]);
}
