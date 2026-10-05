// src/director/wireframe.ts
import * as THREE from "three";

/**
 * Diagnostic wireframe material: unlit matrix green (#00FF41) without tone mapping (§6.3)
 */
export const diagnosticWireMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff41,
  wireframe: true,
  toneMapped: false,
});

const originals = new WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>();
const scenes = new Set<THREE.Scene>();
let isWireActive = false;

function applyWireToMesh(m: THREE.Mesh, on: boolean) {
  if (!m.isMesh || m.userData?.noWire) return;

  if (on) {
    if (!originals.has(m)) {
      originals.set(m, m.material);
    }
    // Vertex-patched meshes (flap cells, strings, leaves) can supply their own wire variant
    m.material = m.userData?.wireMaterial ?? diagnosticWireMaterial;
  } else if (originals.has(m)) {
    m.material = originals.get(m)!;
    originals.delete(m);
  }
}

function applyWireToScene(scene: THREE.Scene, on: boolean) {
  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      applyWireToMesh(o as THREE.Mesh, on);
    }
  });
}

/**
 * Registers an active scene root so wireframe toggles affect it (§6.3).
 * If wireframe is already active, applies it immediately upon registration.
 */
export function registerScene(scene: THREE.Scene): () => void {
  scenes.add(scene);
  if (isWireActive) {
    applyWireToScene(scene, true);
  }
  return () => {
    scenes.delete(scene);
  };
}

/**
 * Global wireframe toggle dispatcher
 */
export function setWire(on: boolean) {
  isWireActive = on;
  scenes.forEach((scene) => {
    applyWireToScene(scene, on);
  });
}

/**
 * Returns whether wireframe mode is currently active
 */
export function getWireState(): boolean {
  return isWireActive;
}
