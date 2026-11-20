"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { BlastFX } from "@/components/games-hero/beach/BlastFX";
import type { BlastQuality } from "@/components/games-hero/beach/blastFxSystem";
import { DESIGN_LENS_SHIFT } from "@/components/games-hero/camera/projectionMath";

const SKY_HORIZON = new THREE.Color(0.78, 0.8, 0.82);
const SUV_X = [-4.06, 0.43, 4.92];
const WALLS: [number, number][] = [[-6.29, 6.42], [0.48, 3.92], [24.52, 40.96]];

function readQuery() {
  const params = new URLSearchParams(window.location.search);
  const p = Number(params.get("p"));
  const q = Number(params.get("q"));
  return {
    p: params.has("p") && Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 0.66,
    quality: (q === 1 || q === 2 ? q : 0) as BlastQuality,
  };
}

/** Pale gradient dome: zenith blue to warm horizon, like the offline Nishita sky. */
function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uHorizon: { value: SKY_HORIZON.clone() }, uZenith: { value: new THREE.Color(0.32, 0.45, 0.68) } },
        vertexShader: /* glsl */ `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `uniform vec3 uHorizon; uniform vec3 uZenith; varying vec3 vDir;
          void main() { float h = clamp(vDir.y, 0.0, 1.0); gl_FragColor = vec4(mix(uHorizon, uZenith, pow(h, 0.55)) * 1.6, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          }`,
      }),
    []
  );
  const geometry = useMemo(() => new THREE.SphereGeometry(450, 32, 16), []);
  useEffect(() => () => { material.dispose(); geometry.dispose(); }, [material, geometry]);
  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={-1} />;
}

function Stage() {
  const parts = useMemo(() => {
    const sand = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.42, 0.36, 0.29), roughness: 1 });
    const plaster = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.5, 0.42, 0.36), roughness: 0.9 });
    const body = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.058, 0.071, 0.052), roughness: 0.4, metalness: 0.4 });
    const ground = new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2);
    const box = new THREE.BoxGeometry(1, 1, 1);
    return { sand, plaster, body, ground, box };
  }, []);
  useEffect(
    () => () => {
      for (const value of Object.values(parts)) value.dispose();
    },
    [parts]
  );
  return (
    <group>
      <mesh geometry={parts.ground} material={parts.sand} />
      {WALLS.map(([x, width]) => (
        <mesh key={x} geometry={parts.box} material={parts.plaster} position={[x, 1.225, -35]} scale={[width, 2.45, 0.75]} />
      ))}
      {SUV_X.map((x) => (
        <group key={x} position={[x, 0, -31]}>
          <mesh geometry={parts.box} material={parts.body} position={[0, 0.93, 0]} scale={[2.18, 0.78, 4.3]} />
          <mesh geometry={parts.box} material={parts.body} position={[0, 1.71, -0.3]} scale={[1.88, 0.85, 2.4]} />
        </group>
      ))}
    </group>
  );
}

/** Locked hero camera: (0, 1.65, 6) looking down -z, vFOV 34°, horizon lens shift. */
function HeroLens({ statsRef }: { statsRef: React.RefObject<HTMLDivElement | null> }) {
  const { camera, gl, scene } = useThree();
  useEffect(() => {
    scene.fog = new THREE.Fog(SKY_HORIZON.clone().multiplyScalar(1.1), 70, 520);
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt < 0) return;
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.updateProjectionMatrix();
    perspective.projectionMatrix.elements[9] = -DESIGN_LENS_SHIFT;
    perspective.projectionMatrixInverse.copy(perspective.projectionMatrix).invert();
    // gl.info resets at the start of each render, so this is the previous frame's count.
    const node = statsRef.current;
    if (node) {
      node.dataset.calls = String(gl.info.render.calls);
      node.dataset.triangles = String(gl.info.render.triangles);
      node.textContent = `${gl.info.render.calls} draws · ${gl.info.render.triangles} tris`;
    }
  });
  return null;
}

export default function BlastLab() {
  const [initial] = useState(readQuery);
  const progressRef = useRef(initial.p);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [p, setP] = useState(initial.p);

  useEffect(() => {
    const api = {
      setP: (value: number) => {
        progressRef.current = value;
        setP(value);
      },
    };
    (window as unknown as { __blastLab?: typeof api }).__blastLab = api;
    return () => {
      delete (window as unknown as { __blastLab?: typeof api }).__blastLab;
    };
  }, []);

  return (
    <main className="min-h-[100dvh] bg-surface-hero-events px-4 py-24 text-sangam-cream">
      <section className="mx-auto grid w-full max-w-6xl gap-6">
        <div>
          <h1 className="font-display text-title">Games blast lab</h1>
          <p className="mt-2 max-w-2xl text-sm text-sangam-lilac">
            Real-time missiles, fireballs, smoke, dust and debris over a stand-in beach. Query: ?p=0.66&amp;q=0|1|2.
          </p>
        </div>
        <div data-testid="blast-lab-view" className="relative w-full overflow-hidden" style={{ aspectRatio: "2.39 / 1" }}>
          <Canvas
            dpr={1}
            camera={{ position: [0, 1.65, 6], fov: 34, near: 0.05, far: 900 }}
            gl={{ antialias: true, toneMapping: THREE.AgXToneMapping, toneMappingExposure: 2 ** -0.7 }}
            onCreated={({ camera }) => camera.lookAt(0, 1.65, -31)}
          >
            <SkyDome />
            <directionalLight position={[12, 24, 14]} intensity={2.5 * Math.PI} color="#fff4e6" />
            <hemisphereLight args={["#9fb4d0", "#6b5844", 1.1]} />
            <Stage />
            <BlastFX progressRef={progressRef} quality={initial.quality} />
            <HeroLens statsRef={statsRef} />
          </Canvas>
          <div
            ref={statsRef}
            data-testid="blast-lab-stats"
            className="absolute right-2 top-2 bg-black/50 px-2 py-1 font-mono text-xs text-sangam-cream"
          />
        </div>
        <label className="grid max-w-md gap-2 font-body text-sm" htmlFor="blast-lab-progress">
          Scroll progress p: {p.toFixed(3)}
          <input
            id="blast-lab-progress"
            className="h-12 accent-sangam-mint"
            type="range"
            min="0.5"
            max="1"
            step="0.001"
            value={String(p)}
            onChange={(event) => {
              const value = Number(event.currentTarget.value);
              progressRef.current = value;
              setP(value);
            }}
          />
        </label>
      </section>
    </main>
  );
}
