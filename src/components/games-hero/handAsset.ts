import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/** The only downloaded asset of the real-time Games hero: the hand holding the glasses. */
export const HAND_URL = "/models/games/hand-grip.glb";

/** Releases every geometry, material and texture (and decoded ImageBitmap) under `root`. */
export function disposeForeground(root: THREE.Group) {
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
  });
  materials.forEach(material => {
    Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); });
    material.dispose();
  });
  textures.forEach(texture => {
    texture.dispose();
    const image = texture.image as { close?: () => void } | undefined;
    image?.close?.();
  });
}

export async function loadForeground(signal: AbortSignal, url = HAND_URL): Promise<THREE.Group> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Hand HTTP ${response.status}`);
  const bytes = await response.arrayBuffer();
  const gltf = await new GLTFLoader().parseAsync(bytes, "");
  if (signal.aborted) { disposeForeground(gltf.scene); throw new Error("Hand cancelled"); }
  return gltf.scene;
}
