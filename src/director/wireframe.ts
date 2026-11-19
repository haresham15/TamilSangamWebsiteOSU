// src/director/wireframe.ts
import * as THREE from "three";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

// Defensive proxy so any component calling (m.material as ShaderMaterial).uniforms.foo.value never crashes
const safeUniformsProxy = new Proxy({} as Record<string, { value: number }>, {
  get: () => ({ value: 0 }),
});

interface DiagnosticMaterials {
  wire: THREE.MeshBasicMaterial;
  points: THREE.PointsMaterial;
  line: THREE.LineBasicMaterial;
}
let diagnostics: DiagnosticMaterials | null = null;

/**
 * Diagnostic wire materials: unlit matrix green (#00FF41) without tone mapping (§6.3).
 * Created on first use so pages that never toggle wire mode allocate nothing.
 */
function getDiagnosticMaterials(): DiagnosticMaterials {
  if (!diagnostics) {
    diagnostics = {
      wire: new THREE.MeshBasicMaterial({ color: 0x00ff41, wireframe: true, toneMapped: false }),
      points: new THREE.PointsMaterial({
        color: 0x00ff41,
        size: 2.5,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.85,
        toneMapped: false,
      }),
      line: new THREE.LineBasicMaterial({ color: 0x00ff41, toneMapped: false }),
    };
    for (const m of Object.values(diagnostics)) {
      (m as unknown as { uniforms: unknown }).uniforms = safeUniformsProxy;
    }
  }
  return diagnostics;
}

export const getDiagnosticWireMaterial = () => getDiagnosticMaterials().wire;

type RenderableObject = THREE.Mesh | THREE.Points | THREE.Line;

const originals = new WeakMap<RenderableObject, THREE.Material | THREE.Material[]>();
const scenes = new Set<THREE.Scene>();
if (typeof window !== "undefined") {
  (window as unknown as { __registeredScenes?: Set<THREE.Scene> }).__registeredScenes = scenes;
}
let isWireActive = false;

function applyWireToObject(o: RenderableObject, on: boolean) {
  if (o.userData?.noWire) return;

  if (on) {
    if (!originals.has(o)) {
      originals.set(o, o.material);
    }
    // Vertex-patched meshes (flap cells, strings, leaves) can supply their own wire variant
    if (o.userData?.wireMaterial) {
      o.material = o.userData.wireMaterial;
    } else if ((o as THREE.Mesh).isMesh) {
      o.material = getDiagnosticMaterials().wire;
    } else if ((o as THREE.Points).isPoints) {
      o.material = getDiagnosticMaterials().points;
    } else if ((o as THREE.Line).isLine) {
      o.material = getDiagnosticMaterials().line;
    }
  } else if (originals.has(o)) {
    o.material = originals.get(o)!;
    originals.delete(o);
  }
}

function applyWireToScene(scene: THREE.Scene, on: boolean) {
  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh || (o as THREE.Points).isPoints || (o as THREE.Line).isLine) {
      applyWireToObject(o as RenderableObject, on);
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
    if (isWireActive) {
      applyWireToScene(scene, false);
    }
    scenes.delete(scene);
  };
}

/**
 * React hook to register any Drei <View> or R3F scene
 */
export function useRegisterScene(scene: THREE.Scene | null) {
  useEffect(() => {
    if (scene) {
      return registerScene(scene);
    }
  }, [scene]);
}

/**
 * Headless R3F Scene Registrar Component.
 * Mount inside any Drei <View> or root <Canvas> to wire it into the Director Viewport.
 */
export function SceneRegistrar() {
  const scene = useThree((s) => s.scene);
  useRegisterScene(scene);
  return null;
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

if (typeof window !== "undefined") {
  (window as unknown as { __wireframe: unknown }).__wireframe = {
    getScenes: () => Array.from(scenes),
    isWireActive: () => isWireActive,
    setWire,
  };
}
