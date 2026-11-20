"use client";

// Cinematic About hero: a dusk ascent through five tala gateways toward a gopuram in the
// haze. Stucco gateways and the distant tower share one instanced module; the five bronze
// Brahma Mudi medallions are two instanced draws (static frame + spinning knot).

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Lightformer } from "@react-three/drei";
import { BakedEnvironment } from "@/gl/BakedEnvironment";
import { useShadowUpdates } from "@/gl/shadows";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { applyInstanceTransforms, type Transform } from "@/gl/art/geometry";
import { createSurfaceMaterial } from "@/gl/art/surface";
import { DustMotes, HazeLayer } from "@/gl/art/Atmosphere";
import { ContactShadows, type ContactSpot } from "@/gl/art/ContactShadow";
import { useWarmup } from "@/components/gl/useWarmup";
import type { RenderMode } from "@/components/providers/useRenderMode";
import { createCinemaCameraDamper } from "@/lib/cinemaCameraDamper";
import { createHeroKineticsTracker } from "@/lib/heroKinetics";
import {
  TALA_COUNT,
  OPENING_HALF,
  buildCrown,
  buildKnot,
  buildRingFrame,
  buildStoneworks,
  buildTalaModule,
  cameraBeat,
  crownTransforms,
  kalasamGeometry,
  kalasamTransforms,
  portalTransforms,
  ringTransforms,
  talaY,
  talaZ,
  terraceHeight,
  towerTransforms,
  cachedGeometry,
  hasCachedGeometry,
  mergeTalaChunks,
  TALA_STEPS,
  pavingTransforms,
  slabGeometry,
} from "./gopuramArt";

/** Low sun from the right, a little in front of the facades: it rakes across every moulding. */
const SUN_DIR = new THREE.Vector3(1, 0.45, 0.32).normalize().toArray() as [number, number, number];
const SKY = { zenith: "#3d3358", mid: "#9a6a84", horizon: "#f0a070", sun: "#ffc890" };
const FOG = "#8a6a72";

interface SceneProps {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
  mode: Exclude<RenderMode, "static">;
  qualityLevel: number;
}

function GopuramWarmup() {
  useWarmup("about-gopuram");
  return null;
}

// ---------------------------------------------------------------------------------------

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const SKY_FRAG = /* glsl */ `
  varying vec3 vDir;
  uniform vec3 uZenith, uMid, uHorizon, uSun, uSunDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = mix(uHorizon, uMid, smoothstep(-0.02, 0.2, h));
    col = mix(col, uZenith, smoothstep(0.18, 0.75, h));
    float s = max(dot(d, uSunDir), 0.0);
    col += uSun * (pow(s, 5.0) * 0.32 + pow(s, 48.0) * 0.5) * smoothstep(-0.2, 0.1, h);
    col = mix(col, uHorizon * 0.45, smoothstep(0.0, -0.3, h));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Dusk dome that rides with the camera (one draw, no texture). */
function DuskSky() {
  const ref = useRef<THREE.Mesh>(null);
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.SphereGeometry(240, 32, 16);
    const material = new THREE.ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      uniforms: {
        uZenith: { value: new THREE.Color(SKY.zenith) },
        uMid: { value: new THREE.Color(SKY.mid) },
        uHorizon: { value: new THREE.Color(SKY.horizon) },
        uSun: { value: new THREE.Color(SKY.sun) },
        uSunDir: { value: new THREE.Vector3(...SUN_DIR) },
      },
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    return { geometry, material };
  }, []);
  useDisposeOnUnmount(geometry, material);
  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0 || !ref.current) return;
    ref.current.position.copy(camera.position);
  });
  return <mesh ref={ref} geometry={geometry} material={material} renderOrder={-10} frustumCulled={false} />;
}

/** Reflections for the bronze: warm sun-side glow, indigo sky, dark ground. Baked once. */
function DuskEnvironment() {
  return (
    <BakedEnvironment resolution={128}>
      <Lightformer form="rect" intensity={6} color="#ffc890" scale={[10, 3, 1]} position={[9, 1.5, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.6} color="#b090b8" scale={[16, 16, 1]} position={[0, 9, 0]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.4} color="#e8c0a0" scale={[8, 4, 1]} position={[-8, 3, -4]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.5} color="#7a5238" scale={[16, 6, 1]} position={[0, -7, 0]} target={[0, 0, 0]} />
    </BakedEnvironment>
  );
}

// ---------------------------------------------------------------------------------------

const KEY_OFFSET = new THREE.Vector3(...SUN_DIR).multiplyScalar(70);

function ShadowRefresh({ onReady }: { onReady: (invalidate: () => void) => void }) {
  const invalidate = useShadowUpdates({ mode: "onChange" });
  useEffect(() => onReady(invalidate), [invalidate, onReady]);
  return null;
}

/**
 * Light hierarchy: the sun key (sole shadow caster, its frustum stepping along with the
 * camera), a dim indigo sky fill and a cool mint rim from behind the tower.
 */
function TempleLight({ shadowSize, ready }: { shadowSize: number; ready: boolean }) {
  const key = useRef<THREE.DirectionalLight>(null);
  const lastStep = useRef(Number.NaN);
  const invalidateRef = useRef<() => void>(() => {});
  const onReady = React.useCallback((fn: () => void) => {
    invalidateRef.current = fn;
  }, []);

  useEffect(() => {
    const light = key.current;
    if (!light) return;
    const cam = light.shadow.camera;
    cam.left = -26;
    cam.right = 26;
    cam.top = 26;
    cam.bottom = -26;
    cam.near = 20;
    cam.far = 140;
    cam.updateProjectionMatrix();
  }, []);

  // Re-render the shadow map once the stucco bake lands.
  useEffect(() => {
    if (ready) invalidateRef.current();
  }, [ready]);

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    const light = key.current;
    if (dt <= 0 || !light) return;
    // Centre the shadow frustum ahead of the lens, in 6 m steps so the map does not swim.
    const step = Math.round((camera.position.z - 12) / 6);
    if (step === lastStep.current) return;
    lastStep.current = step;
    const cz = step * 6;
    const cy = terraceHeight(cz) + 6;
    light.target.position.set(0, cy, cz);
    light.position.set(KEY_OFFSET.x, cy + KEY_OFFSET.y, cz + KEY_OFFSET.z);
    light.target.updateMatrixWorld();
    invalidateRef.current();
  });

  return (
    <>
      <directionalLight
        ref={key}
        color="#ffbf7a"
        intensity={8.5}
        castShadow={shadowSize > 0}
        shadow-mapSize={[shadowSize || 1, shadowSize || 1]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        userData={{ gradeRole: "key" }}
      />
      <hemisphereLight args={["#c9a0b0", "#5a4030", 0.85]} userData={{ gradeRole: "fill" }} />
      <directionalLight position={[-30, 30, -60]} color="#f0c0b0" intensity={0.7} userData={{ gradeRole: "rim" }} />
      {shadowSize > 0 && <ShadowRefresh onReady={onReady} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------

function useInstances(ref: React.RefObject<THREE.InstancedMesh | null>, transforms: Transform[], ready: unknown = true) {
  useEffect(() => {
    if (ref.current) applyInstanceTransforms(ref.current, transforms);
  }, [ref, transforms, ready]);
}

const scheduleIdle = (fn: () => void) => {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout: 120 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 0);
  return () => window.clearTimeout(id);
};

/**
 * The stucco module is the one expensive bake (~150 ms). On a page's first mount it is built
 * in four chunks across idle callbacks instead of one long task; later mounts reuse the
 * cached arrays synchronously.
 */
function useTalaModule() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(() =>
    hasCachedGeometry("tala") ? cachedGeometry("tala", buildTalaModule) : null
  );
  useEffect(() => {
    if (geometry) return () => geometry.dispose();
    const chunks: THREE.BufferGeometry[] = [];
    let cancel = () => {};
    let done = false;
    const step = () => {
      if (chunks.length < TALA_STEPS.length) {
        chunks.push(TALA_STEPS[chunks.length]());
        cancel = scheduleIdle(step);
        return;
      }
      done = true;
      const merged = mergeTalaChunks(chunks);
      setGeometry(cachedGeometry("tala", () => merged));
    };
    cancel = scheduleIdle(step);
    return () => {
      cancel();
      if (!done) chunks.forEach((g) => g.dispose());
    };
  }, [geometry]);
  return geometry;
}

/** Gateways, tower tiers, crowns, kalasams and the granite terraces. */
function Architecture({ shadows, lean, onReady }: { shadows: boolean; lean: boolean; onReady: (ready: boolean) => void }) {
  const talaModule = useTalaModule();
  useEffect(() => onReady(Boolean(talaModule)), [talaModule, onReady]);
  const moduleRef = useRef<THREE.InstancedMesh>(null);
  const towerRef = useRef<THREE.InstancedMesh>(null);
  const crownRef = useRef<THREE.InstancedMesh>(null);
  const kalasamRef = useRef<THREE.InstancedMesh>(null);
  const slabRef = useRef<THREE.InstancedMesh>(null);

  const geometries = useMemo(
    () => ({
      crown: cachedGeometry("crown", buildCrown),
      kalasam: kalasamGeometry(),
      stone: cachedGeometry("stone", () => buildStoneworks()),
      slab: slabGeometry(),
    }),
    []
  );
  const materials = useMemo(
    () => ({
      // Weathered lime stucco over sandstone, dirt washed into every moulding.
      // `lean` (Tier B / phones) drops the micro-normal: the bump pass is the costliest part of
      // the detail shader and reads as noise at that pixel density anyway.
      plaster: createSurfaceMaterial("plaster", { color: "#b59d7f" }, { cavity: true, cavityStrength: 0.8, scale: 2.5, albedoVariation: 0.24, tintAmount: 0.5, bump: lean ? 0 : 0.006, grimeAmount: 0.0 }),
      stone: createSurfaceMaterial("stone", { color: "#6b6259" }, { grimeAmount: 0.0, scale: 3, bump: lean ? 0 : 0.006 }),
      // Separate material for the instanced slabs: sharing one material between a Mesh and an
      // InstancedMesh makes three re-resolve its program every frame.
      paving: createSurfaceMaterial("stone", { color: "#6b6259" }, { grimeAmount: 0.0, scale: 3, bump: lean ? 0 : 0.006 }),
      gilt: createSurfaceMaterial("agedBrass", { color: "#a07a36", roughness: 0.4 }, { tintAmount: 0.1 }),
    }),
    [lean]
  );
  useDisposeOnUnmount(geometries, materials);

  const transforms = useMemo(
    () => ({ modules: portalTransforms(), tower: towerTransforms().tiers, crowns: crownTransforms(), kalasams: kalasamTransforms(), slabs: pavingTransforms() }),
    []
  );
  useInstances(moduleRef, transforms.modules, talaModule);
  useInstances(towerRef, transforms.tower, talaModule);
  useInstances(slabRef, transforms.slabs);
  useInstances(crownRef, transforms.crowns);
  useInstances(kalasamRef, transforms.kalasams);

  const spots = useMemo<ContactSpot[]>(() => {
    const out: ContactSpot[] = [];
    for (let i = 0; i < TALA_COUNT; i++) {
      for (const s of [-1, 1]) out.push({ position: [s * (OPENING_HALF + 1.8), talaY(i), talaZ(i) - 1.6], size: [5.2, 4.8], opacity: 0.6 });
      out.push({ position: [0, talaY(i), talaZ(i) - 1.6], size: [10, 4.2], opacity: 0.35 });
    }
    return out;
  }, []);

  return (
    <>
      {talaModule && (
        <>
          <instancedMesh
            ref={moduleRef}
            args={[talaModule, materials.plaster, transforms.modules.length]}
            castShadow={shadows}
            receiveShadow={shadows}
            matrixAutoUpdate={false}
          />
          {/* The tower stands far outside the shadow frustum: kept out of the shadow pass. */}
          <instancedMesh ref={towerRef} args={[talaModule, materials.plaster, transforms.tower.length]} matrixAutoUpdate={false} />
        </>
      )}
      <instancedMesh ref={crownRef} args={[geometries.crown, materials.plaster, transforms.crowns.length]} castShadow={shadows} receiveShadow={shadows} matrixAutoUpdate={false} />
      <instancedMesh ref={kalasamRef} args={[geometries.kalasam, materials.gilt, transforms.kalasams.length]} castShadow={shadows} matrixAutoUpdate={false} />
      <mesh geometry={geometries.stone} material={materials.stone} castShadow={shadows} receiveShadow={shadows} matrixAutoUpdate={false} />
      <instancedMesh ref={slabRef} args={[geometries.slab, materials.paving, transforms.slabs.length]} receiveShadow={shadows} matrixAutoUpdate={false} />
      <ContactShadows spots={spots} color="#0a0608" />
    </>
  );
}

// ---------------------------------------------------------------------------------------

/** Five Brahma Mudi medallions: static prabha frames, knots turning with the scroll. */
function Medallions({ scrollProgressRef, tier, shadows }: { scrollProgressRef: React.RefObject<number>; tier: "A" | "B"; shadows: boolean }) {
  const frameRef = useRef<THREE.InstancedMesh>(null);
  const knotRef = useRef<THREE.InstancedMesh>(null);
  const geometries = useMemo(
    () => ({ frame: cachedGeometry("ring-frame", () => buildRingFrame()), knot: tier === "A" ? buildKnot(720, 32) : buildKnot(360, 16) }),
    [tier]
  );
  const materials = useMemo(
    () => ({
      // Cast bronze: green-brown patina in the recesses, rubbed bright on the beads and flames.
      frame: createSurfaceMaterial("bronze", { color: "#6a4a28" }, { cavity: true, wearAmount: 0.85, tintAmount: 0.4, bump: 0 }),
      // The knot is handled more: smoother, warmer, less patina.
      knot: createSurfaceMaterial("bronze", { color: "#a06a34", roughness: 0.26 }, { tintAmount: 0.18, bump: 0, roughnessVariation: 0.16 }),
    }),
    []
  );
  useDisposeOnUnmount(geometries, materials);

  const rings = useMemo(() => ringTransforms(), []);
  useInstances(frameRef, rings);

  const scratch = useMemo(() => ({ obj: new THREE.Object3D(), tilt: new Float32Array(TALA_COUNT * 2) }), []);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const mesh = knotRef.current;
    if (dt <= 0 || !mesh) return;
    const p = scrollProgressRef.current ?? 0;
    // Knots settle coplanar with their frames as the ascent completes (mandala alignment).
    const align = 1 - THREE.MathUtils.smoothstep(p, 0.7, 0.92);
    const { obj, tilt } = scratch;
    for (let i = 0; i < TALA_COUNT; i++) {
      const t = rings[i];
      tilt[i * 2] = THREE.MathUtils.damp(tilt[i * 2], 0.32 * align * (i % 2 ? -1 : 1), 4, dt);
      tilt[i * 2 + 1] = THREE.MathUtils.damp(tilt[i * 2 + 1], -0.26 * align, 4, dt);
      obj.position.set(...t.position);
      obj.rotation.set(tilt[i * 2], tilt[i * 2 + 1], (i * Math.PI) / 4 + p * Math.PI * 0.9);
      obj.scale.setScalar(t.scale as number);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={frameRef} args={[geometries.frame, materials.frame, TALA_COUNT]} castShadow={shadows} matrixAutoUpdate={false} />
      <instancedMesh ref={knotRef} args={[geometries.knot, materials.knot, TALA_COUNT]} frustumCulled={false} matrixAutoUpdate={false} />
    </>
  );
}

// ---------------------------------------------------------------------------------------

const HOLD_DISTANCE = 14;

/** Processional camera: holds before each gateway, climbs the stairs through it, then cranes up. */
function AscentCamera({ scrollProgressRef, isMobile, fov }: { scrollProgressRef: React.RefObject<number>; isMobile: boolean; fov: number }) {
  const damper = useRef(createCinemaCameraDamper({ lambdaPos: 5.4, lambdaLook: 8.5, breathingAmplitude: 0.004, breathingRoll: 0.0012 }));
  const kinetics = useRef(createHeroKineticsTracker(7.5, 5.0, 4.0));
  const target = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() }), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const k = kinetics.current.update(scrollProgressRef.current ?? 0, state.pointer, dt);
    const p = k.smoothProgress;
    const { pos, exit } = cameraBeat(p);
    const hold = isMobile ? HOLD_DISTANCE + 6 : HOLD_DISTANCE;
    const eye = isMobile ? 2.3 : 2.6;
    const zWalk = talaZ(pos) + hold;
    const z = zWalk - exit * 8;
    const ground = terraceHeight(z);
    const px = isMobile ? 0 : k.smoothPointerX * 0.35;
    const py = -k.smoothPointerY * 0.18;
    const travel = Math.sin(Math.PI * (pos - Math.floor(pos)));
    // While passing under a medallion, ease toward the far jamb so it clears the frame.
    const x = (isMobile ? 0 : -2.6 - travel * 0.7) * (1 - exit) + px;
    const y = ground + eye + exit * 19 + py;
    target.pos.set(x, y, z);
    const lookZ = z - 14 - exit * 50;
    // Pitch down while climbing so the medallion overhead leaves the frame cleanly; on
    // mobile aim lower so the medallion sits in the upper half, clear of the copy.
    const lookUp = (isMobile ? 2.4 : 4.4) - travel * 3.6;
    target.look.set(x * (1 - exit * 0.8), terraceHeight(lookZ) + lookUp + exit * 26, lookZ);
    const out = damper.current.update(target.pos, target.look, p, dt, { additionalRoll: k.velocityBank * 0.25 });
    state.camera.position.copy(out.position);
    state.camera.lookAt(out.lookAt);
    state.camera.rotation.z += out.roll;
  });

  return <PerspectiveCamera makeDefault position={[-2.6, 2.6, HOLD_DISTANCE]} fov={fov} near={0.1} far={420} />;
}

// ---------------------------------------------------------------------------------------

/** Incense haze hanging in each doorway and pooling on each terrace. */
function IncenseAir({ full }: { full: boolean }) {
  return (
    <>
      {Array.from({ length: TALA_COUNT }, (_, i) => (
        <React.Fragment key={i}>
          <HazeLayer position={[0, talaY(i) + 3.6, talaZ(i) - 5]} size={[16, 7.5]} color="#f0c090" intensity={0.13} />
          {full && <HazeLayer position={[0.8, talaY(i) + 1.3, talaZ(i) + 5]} size={[16, 3.4]} color="#e0b090" intensity={0.08} />}
        </React.Fragment>
      ))}
    </>
  );
}

export function GopuramArtScene({ scrollProgressRef, isMobile, mode, qualityLevel }: SceneProps) {
  const tierA = mode === "A";
  const [ready, setReady] = useState(false);
  const shadowSize = tierA ? (qualityLevel === 0 && !isMobile ? 2048 : 1024) : 0;
  return (
    <>
      <GopuramWarmup />
      <AscentCamera scrollProgressRef={scrollProgressRef} isMobile={isMobile} fov={isMobile ? 62 : 48} />
      <color attach="background" args={[SKY.zenith]} />
      <fogExp2 attach="fog" args={[FOG, 0.008]} />
      <DuskSky />
      <DuskEnvironment />
      <TempleLight shadowSize={shadowSize} ready={ready} />
      {/* Held invisible until the stucco bake lands, so the set never appears half-built. */}
      <group visible={ready}>
        <Architecture shadows={shadowSize > 0} lean={!tierA || isMobile} onReady={setReady} />
        <Medallions scrollProgressRef={scrollProgressRef} tier={tierA && !isMobile ? "A" : "B"} shadows={shadowSize > 0} />
        <IncenseAir full={tierA} />
      </group>
      {qualityLevel < 2 && !(isMobile && !tierA) && (
        <DustMotes
          position={[0, 6, -40]}
          size={[12, 10, 110]}
          count={tierA && qualityLevel === 0 && !isMobile ? 700 : 300}
          color="#ffd6a8"
          intensity={0.38}
          pointSize={22}
          drift={[-0.02, 0.05, 0]}
          seed={31}
        />
      )}
    </>
  );
}

export default GopuramArtScene;
