// src/gl/dispose.ts
"use client";

import { useEffect } from "react";
import type * as THREE from "three";

interface Disposable {
  dispose: () => void;
}

const isDisposable = (v: unknown): v is Disposable =>
  typeof v === "object" && v !== null && typeof (v as Disposable).dispose === "function";

/** Disposes every geometry, material and material texture under `root`. */
export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    mesh.geometry?.dispose();
    const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
    for (const mat of mats) disposeMaterial(mat);
  });
}

export function disposeMaterial(mat: THREE.Material) {
  for (const key in mat) {
    const value = (mat as unknown as Record<string, unknown>)[key];
    if (value && (value as THREE.Texture).isTexture) (value as THREE.Texture).dispose();
  }
  const uniforms = (mat as THREE.ShaderMaterial).uniforms;
  if (uniforms) {
    for (const key in uniforms) {
      const value = uniforms[key]?.value as THREE.Texture | undefined;
      if (value?.isTexture) value.dispose();
    }
  }
  mat.dispose();
}

/**
 * Disposes hand-built GPU resources (useMemo'd geometries, materials, textures — which R3F
 * never disposes) when they are replaced or the component unmounts. Pass the memoised
 * values; plain objects/arrays are disposed member by member. three re-uploads a disposed
 * resource if it is drawn again, so a Strict Mode effect replay is safe.
 */
export function useDisposeOnUnmount(...values: unknown[]) {
  useEffect(() => {
    return () => {
      for (const value of values) disposeValue(value);
    };
    // Each value is a stable memo result; re-run only when one is rebuilt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, values);
}

function disposeValue(value: unknown) {
  if (isDisposable(value)) {
    value.dispose();
  } else if (Array.isArray(value)) {
    for (const v of value) if (isDisposable(v)) v.dispose();
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) if (isDisposable(v)) v.dispose();
  }
}
