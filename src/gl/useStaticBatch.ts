// src/gl/useStaticBatch.ts
"use client";

import { useLayoutEffect, type RefObject } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Static batching for hand-built props made of many small meshes (crown jewels, trims).
 *
 * After mount, every visible Mesh under `root` (stopping at `exclude` subtrees, which may
 * animate relative to root) is baked into root space and merged with the others that
 * share its material and attribute layout. One draw per material replaces one per mesh;
 * the originals are hidden, not removed, so React keeps ownership and unmount restores
 * them. Root itself may move freely: merged meshes are its children.
 *
 * Returns nothing; the batch is rebuilt when `deps` change.
 */
export function useStaticBatch(
  root: RefObject<THREE.Object3D | null>,
  exclude: RefObject<THREE.Object3D | null>[] = [],
  enabled = true
) {
  useLayoutEffect(() => {
    const rootObj = root.current;
    if (!enabled || !rootObj) return;

    const excluded = new Set(exclude.map((r) => r.current).filter(Boolean) as THREE.Object3D[]);
    rootObj.updateWorldMatrix(true, true);
    const toRoot = new THREE.Matrix4().copy(rootObj.matrixWorld).invert();

    const buckets = new Map<string, { material: THREE.Material; meshes: THREE.Mesh[] }>();
    const visit = (obj: THREE.Object3D) => {
      if (excluded.has(obj) || !obj.visible) return;
      const mesh = obj as THREE.Mesh;
      if (
        mesh.isMesh &&
        !(mesh as unknown as THREE.InstancedMesh).isInstancedMesh &&
        !(mesh as unknown as THREE.SkinnedMesh).isSkinnedMesh &&
        !Array.isArray(mesh.material) &&
        Object.keys(mesh.geometry.morphAttributes).length === 0
      ) {
        const attrs = Object.keys(mesh.geometry.attributes).sort().join(",");
        const key = `${mesh.material.uuid}|${attrs}|${mesh.geometry.index ? "i" : "n"}|${mesh.castShadow}|${mesh.receiveShadow}`;
        let bucket = buckets.get(key);
        if (!bucket) buckets.set(key, (bucket = { material: mesh.material, meshes: [] }));
        bucket.meshes.push(mesh);
      }
      for (const child of obj.children) visit(child);
    };
    for (const child of rootObj.children) visit(child);

    const merged: THREE.Mesh[] = [];
    const hidden: THREE.Mesh[] = [];
    const m = new THREE.Matrix4();
    for (const { material, meshes } of buckets.values()) {
      if (meshes.length < 2) continue;
      const geometries = meshes.map((mesh) => {
        m.multiplyMatrices(toRoot, mesh.matrixWorld);
        return mesh.geometry.clone().applyMatrix4(m);
      });
      const geometry = mergeGeometries(geometries, false);
      geometries.forEach((g) => g.dispose());
      if (!geometry) continue;
      const batch = new THREE.Mesh(geometry, material);
      batch.name = "static-batch";
      batch.castShadow = meshes[0].castShadow;
      batch.receiveShadow = meshes[0].receiveShadow;
      batch.userData.staticBatch = true;
      rootObj.add(batch);
      merged.push(batch);
      for (const mesh of meshes) {
        mesh.visible = false;
        hidden.push(mesh);
      }
    }

    return () => {
      for (const batch of merged) {
        rootObj.remove(batch);
        batch.geometry.dispose();
      }
      for (const mesh of hidden) mesh.visible = true;
    };
    // root/exclude are refs; rebuild only when toggled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
