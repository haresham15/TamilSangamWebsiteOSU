"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { heroProjection } from "@/components/games-hero/gamesRail";
import { BeachWorld, type BeachQuality } from "@/components/games-hero/beach/BeachWorld";

/**
 * The plates' view transform (LayeredFocusCompositor.gamesAgX: Blender AgX, log-space power 1.15
 * for "Medium High Contrast"), installed as three's CustomToneMapping for this lab only, so the
 * scene-linear world can be judged against the Blender posters without the compositor.
 */
const GAMES_LOOK = /* glsl */ `vec3 CustomToneMapping( vec3 color ) {
  const mat3 inset = mat3(
    vec3(0.856627153315983, 0.137318972929847, 0.11189821299995),
    vec3(0.0951212405381588, 0.761241990602591, 0.0767994186031903),
    vec3(0.0482516061458583, 0.101439036467562, 0.811302368396859));
  const mat3 outset = mat3(
    vec3(1.1271005818144368, -0.1413297634984383, -0.14132976349843826),
    vec3(-0.11060664309660323, 1.157823702216272, -0.11060664309660294),
    vec3(-0.016493938717834573, -0.016493938717834257, 1.2519364065950405));
  color *= toneMappingExposure;
  color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
  color = inset * color;
  color = clamp((log2(max(color, 1e-10)) + 12.47393) / 16.499999, 0.0, 1.0);
  color = agxDefaultContrastApprox(color);
  color = pow(max(color, 0.0), vec3(1.15));
  color = outset * color;
  color = pow(max(vec3(0.0), color), vec3(2.2));
  color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
  return clamp(color, 0.0, 1.0);
}`;
const CUSTOM_STUB = "vec3 CustomToneMapping( vec3 color ) { return color; }";
const LOOK_EXPOSURE = 2 ** -0.7;

interface LabStats {
  calls: number;
  triangles: number;
  frames: number;
  /** Debug handle for lab scripts (toggle fog, inspect meshes). */
  scene?: THREE.Scene;
}

declare global {
  interface Window {
    __beachLab?: LabStats;
  }
}

function readParams() {
  const params = new URLSearchParams(window.location.search);
  const q = Number(params.get("q") ?? 0);
  return {
    quality: (q === 1 || q === 2 ? q : 0) as BeachQuality,
    frozen: params.get("frozen") === "1" || params.has("debug"),
  };
}

/** Locked hero camera: same optics as gamesRail (portrait below 1.3:1), lens shift via elements[9]. */
function LabRig({ stats, hud }: { stats: LabStats; hud: React.RefObject<HTMLPreElement | null> }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useEffect(() => {
    stats.scene = scene;
    return () => {
      stats.scene = undefined;
    };
  }, [scene, stats]);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const optics = useMemo(() => heroProjection(width / height), [width, height]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt < 0) return;
    gl.toneMapping = THREE.CustomToneMapping;
    gl.toneMappingExposure = LOOK_EXPOSURE;
    camera.position.set(optics.cameraX, 1.65, 6);
    camera.rotation.set(0, 0, 0);
    camera.fov = optics.fovDeg;
    camera.aspect = width / height;
    camera.near = 0.1;
    camera.far = 600;
    camera.updateProjectionMatrix();
    camera.projectionMatrix.elements[9] = -optics.lensShift;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    // Previous frame's totals (info resets at the start of each render).
    stats.calls = gl.info.render.calls;
    stats.triangles = gl.info.render.triangles;
    stats.frames++;
    if (hud.current && stats.frames % 30 === 0) {
      hud.current.textContent = `calls ${stats.calls} · tris ${stats.triangles} · ${optics.portrait ? "portrait" : "landscape"} fov ${optics.fovDeg.toFixed(1)}`;
    }
  }, -1);
  return null;
}

export function BeachLabCanvas() {
  const [{ quality, frozen }] = useState(readParams);
  const hud = useRef<HTMLPreElement>(null);
  const stats = useMemo<LabStats>(() => ({ calls: 0, triangles: 0, frames: 0 }), []);

  useEffect(() => {
    window.__beachLab = stats;
    return () => {
      THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(GAMES_LOOK, CUSTOM_STUB);
      if (window.__beachLab === stats) delete window.__beachLab;
    };
  }, [stats]);

  return (
    <main className="fixed inset-0 z-[9999] h-[100dvh] w-full bg-surface-base" data-testid="games-beach-lab">
      <h1 className="sr-only">Games beach world lab</h1>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
        camera={{ near: 0.1, far: 600, position: [0, 1.65, 6] }}
        onCreated={() => {
          // Programs compile on the first render, after this.
          if (!THREE.ShaderChunk.tonemapping_pars_fragment.includes("inset * color")) {
            THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(CUSTOM_STUB, GAMES_LOOK);
          }
        }}
      >
        <LabRig stats={stats} hud={hud} />
        <BeachWorld quality={quality} frozen={frozen} />
      </Canvas>
      <pre ref={hud} className="pointer-events-none absolute bottom-2 left-2 m-0 font-mono text-xs text-white/80" aria-live="off" />
    </main>
  );
}
