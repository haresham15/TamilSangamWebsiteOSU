"use client";

// Kaththi war room, art pass: a drafting table under one lamp. The Ohio Stadium is a
// white-card model inked as a hidden-line axonometric (bold outlines, thin construction,
// dashed hidden edges). A scan wave travels north to south with scroll, turning the pencil
// underdrawing into ink and leaving a gloss on the paper. The water-main overlay sits on a
// tracing-vellum sheet; the coin marks the feeder junction (PRD §2.1).

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { SceneView as View } from "@/components/canvas/SceneView";
import { useWarmup } from "@/components/gl/useWarmup";
import { useHeroStageVisibility } from "@/components/canvas/HeroScrollStage";
import type { RenderMode } from "@/components/providers/useRenderMode";
import { createHeroKineticsTracker } from "@/lib/heroKinetics";
import { createCinemaCameraDamper, smootherstep } from "@/lib/cinemaCameraDamper";
import { BakedEnvironment } from "@/gl/BakedEnvironment";
import { useShadowUpdates } from "@/gl/shadows";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { createSurfaceMaterial } from "@/gl/art/surface";
import { ContactShadows, type ContactSpot } from "@/gl/art/ContactShadow";
import { DustMotes, HazeLayer } from "@/gl/art/Atmosphere";
import { latheProfile } from "@/gl/art/geometry";
import { BLUEPRINT_PINS, type BlueprintPin } from "./BlueprintSVG";
import { buildOhioStadiumLines, LINE_WEIGHT } from "./OhioStadiumWireframe";
import { LineBatchBuilder, LINE_KIND, bindViewportResolution, createLineGeometries, createLineMaterial, createLineUniforms, type LineKind } from "./blueprintLines";
import { createPaperMaterial, createPaperUniforms } from "./blueprintPaper";
import { buildProps, propContactSpots, PROP_LAYOUT, type PropMaterialKey } from "./blueprintProps";

type Vec3 = [number, number, number];

export interface EphemeralPin {
  id: string;
  x: number;
  y: number;
}

export interface BlueprintSceneGLProps {
  scrollProgress: React.MutableRefObject<number>;
  newPin?: EphemeralPin | null;
  onSelectPin?: (pin: BlueprintPin) => void;
  className?: string;
  mode: Exclude<RenderMode, "static">;
  qualityLevel: number;
}

// ---------------------------------------------------------------------------
// Palette (sRGB hex; three converts to linear). Ink-blue sheet on a plum-black table so
// the scene sits with the site's espresso/plum pages; cyan ink, mint only for pins,
// brass only for the rotunda accent and the physical brass on the table.
// ---------------------------------------------------------------------------
const PALETTE = {
  table: "#1d1310",
  fog: "#110b0b",
  haze: "#c98a3e",
  sheet: "#2c3554",
  grid: "#7fb8d0",
  vellum: "#b8d4e6",
  card: "#5a5566",
  // Light the card model carries from the room, so faces turned from the lamp stay a tone, not a hole.
  cardGlow: "#17110f",
  ink: "#dff6f4",
  inkSoft: "#8ec9d6",
  pencil: "#6f86a3",
  field: "#a6f0cf",
  brass: "#e2c27a",
  water: "#4fd6e0",
  mint: "#a6f0cf",
  scan: "#bff3f0",
  lamp: "#ffbd6e",
  fill: "#3a3f58",
  rim: "#7fb6c4",
} as const;

const SHEET = { center: [0.5, -0.8] as [number, number], half: [11.5, 11] as [number, number] };
const VELLUM = { center: [3.2, 6.4] as [number, number], half: [5.2, 3.4] as [number, number], yaw: -0.06, y: 0.012 };
const TABLE_Y = -0.03;
/** The drawing lies flat but its edges lift off the table and the corners curl. */
const SHEET_EDGE = 0.022;
function sheetLift(x: number, z: number) {
  const ex = SHEET.half[0] - Math.abs(x);
  const ez = SHEET.half[1] - Math.abs(z);
  const edge = Math.pow(1 - THREE.MathUtils.smoothstep(Math.min(ex, ez), 0, 1.4), 2) * 0.05;
  const corner = (1 - THREE.MathUtils.smoothstep(ex, 0, 2.6)) * (1 - THREE.MathUtils.smoothstep(ez, 0, 2.6));
  return edge + corner * corner * 0.16;
}

/** Sheet surface with lifted edges and curled corners, plus the thin paper edge around it. */
function buildSheetGeometries() {
  const w = SHEET.half[0] * 2;
  const d = SHEET.half[1] * 2;
  const top = new THREE.PlaneGeometry(w, d, 26, 26).rotateX(-Math.PI / 2);
  const p = top.attributes.position as THREE.BufferAttribute;
  const toEdge = (v: number, half: number) => Math.sign(v) * half * (1 - Math.pow(1 - Math.abs(v) / half, 1.8));
  for (let i = 0; i < p.count; i++) {
    const x = toEdge(p.getX(i), SHEET.half[0]);
    const z = toEdge(p.getZ(i), SHEET.half[1]);
    p.setXYZ(i, x, sheetLift(x, z), z);
  }
  top.computeVertexNormals();

  const pos: number[] = [];
  const n = 72;
  const ring: [number, number][] = [];
  const hx = SHEET.half[0], hz = SHEET.half[1];
  for (let i = 0; i < n; i++) ring.push([-hx + (2 * hx * i) / n, -hz]);
  for (let i = 0; i < n; i++) ring.push([hx, -hz + (2 * hz * i) / n]);
  for (let i = 0; i < n; i++) ring.push([hx - (2 * hx * i) / n, hz]);
  for (let i = 0; i < n; i++) ring.push([-hx, hz - (2 * hz * i) / n]);
  for (let i = 0; i < ring.length; i++) {
    const [x0, z0] = ring[i];
    const [x1, z1] = ring[(i + 1) % ring.length];
    const y0 = sheetLift(x0, z0), y1 = sheetLift(x1, z1);
    pos.push(x0, y0, z0, x1, y1, z1, x1, y1 - SHEET_EDGE, z1, x0, y0, z0, x1, y1 - SHEET_EDGE, z1, x0, y0 - SHEET_EDGE, z0);
  }
  const edge = new THREE.BufferGeometry();
  edge.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  edge.computeVertexNormals();
  return { top, edge };
}
const LAMP: Vec3 = [-14, 9.5, -6];

// Survey pins: landmark on the drawing, head above it (PRD: 50-yard line, North Rotunda, press box).
const PIN_ANCHORS: { base: Vec3; head: Vec3 }[] = [
  { base: [0, 0.03, 0], head: [0, 2.6, 0] },
  { base: [0, 4.8, -9.3], head: [0, 6.5, -9.3] },
  { base: [-5.8, 5.2, 0], head: [-5.8, 6.8, 0] },
];

// Scan wave: z of the front. Intro draws the north end once; scroll carries it south.
const SCAN_START = -12.5;
const SCAN_REST = -3.0;
const SCAN_END = 10.5;
const INTRO_SECONDS = 2.6;

/** Water-main overlay (vellum-local x, z): main feeder, South Gate branch, feeders. */
const PIPE_RUNS: [number, number, number, number][] = [
  [-4.9, -0.2, 4.9, -0.2],   // main feeder (passes the coin junction)
  [0.4, -3.1, 0.4, 3.1],     // South Gate branch
  [-4.9, -2.2, -1.6, -2.2],
  [-1.6, -2.2, 0.4, -0.2],   // diagonal feeder into the junction
  [2.6, -0.2, 2.6, 2.8],
  [2.6, 2.8, 4.9, 2.8],
  [-3.2, -0.2, -3.2, 3.1],
];
const PIPE_NODES: [number, number, number][] = [
  [0.4, -0.2, 0.62], // coin junction (double ring)
  [-1.6, -2.2, 0.16],
  [2.6, -0.2, 0.16],
  [-3.2, -0.2, 0.16],
];

function vellumToWorld(x: number, z: number): Vec3 {
  const c = Math.cos(VELLUM.yaw), s = Math.sin(VELLUM.yaw);
  // Rotation about +y by yaw maps (x, z) → (x c + z s, −x s + z c).
  return [VELLUM.center[0] + x * c + z * s, VELLUM.y + 0.004, VELLUM.center[1] - x * s + z * c];
}

function buildLineBatch() {
  const data = buildOhioStadiumLines();
  const builder = new LineBatchBuilder();
  const segs = data.positions.length / 6;
  for (let i = 0; i < segs; i++) {
    const p = data.positions;
    const w = data.weights[i];
    const tag = data.typeTags[i * 2];
    const kind: LineKind = w === LINE_WEIGHT.silhouette ? LINE_KIND.silhouette : w === LINE_WEIGHT.structure ? LINE_KIND.structure : LINE_KIND.construction;
    const priority = kind === LINE_KIND.silhouette || tag === 0 ? 0 : kind === LINE_KIND.structure ? 1 : 2;
    builder.add([p[i * 6], p[i * 6 + 1], p[i * 6 + 2]], [p[i * 6 + 3], p[i * 6 + 4], p[i * 6 + 5]], kind, tag, priority);
  }
  for (const [x0, z0, x1, z1] of PIPE_RUNS) builder.add(vellumToWorld(x0, z0), vellumToWorld(x1, z1), LINE_KIND.pipe, 0, 0);
  for (const [x, z, r] of PIPE_NODES) {
    const c = vellumToWorld(x, z);
    builder.circle(c, r, LINE_KIND.pipe, 0, 0, 24);
    if (r > 0.3) builder.circle(c, r * 0.8, LINE_KIND.pipe, 0, 0, 24);
  }
  PIN_ANCHORS.forEach(({ base, head }, i) => {
    builder.add(base, [head[0], head[1] - 0.32, head[2]], LINE_KIND.pin, i, 0);
    builder.circle(base, 0.32, LINE_KIND.pin, i, 0, 16);
  });
  return builder.build(7);
}

// ---------------------------------------------------------------------------
// Survey-mark pin heads: camera-facing target glyph, drawn over the model.
// ---------------------------------------------------------------------------
const PIN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const PIN_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uReveal;
  uniform float uHover;
  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    float aa = fwidth(r) * 1.2;
    float ring = 1.0 - smoothstep(0.06 - aa, 0.06 + aa, abs(r - 0.62 - uHover * 0.08));
    float dot = 1.0 - smoothstep(0.16 - aa, 0.16 + aa, r);
    float tick = (1.0 - smoothstep(0.035 - aa, 0.035 + aa, min(abs(p.x), abs(p.y)))) * step(0.78, r) * step(r, 0.98);
    float disc = (1.0 - smoothstep(0.62, 0.66, r)) * 0.55;
    float ink = max(max(ring, dot), tick);
    vec3 col = mix(vec3(0.03, 0.04, 0.08), uColor * (1.0 + uHover * 0.6), ink);
    float a = max(ink, disc) * uReveal;
    if (a < 0.01) discard;
    gl_FragColor = vec4(col, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function SurveyPins({ uniforms, onSelectPin }: { uniforms: ReturnType<typeof createLineUniforms>; onSelectPin?: (pin: BlueprintPin) => void }) {
  const camera = useThree((s) => s.camera);
  const heads = useRef<(THREE.Mesh | null)[]>([]);
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.62, 0.62), []);
  const materials = useMemo(
    () =>
      PIN_ANCHORS.map(
        () =>
          new THREE.ShaderMaterial({
            vertexShader: PIN_VERT,
            fragmentShader: PIN_FRAG,
            uniforms: { uColor: { value: new THREE.Color(PALETTE.mint) }, uReveal: { value: 0 }, uHover: { value: 0 } },
            transparent: true,
            depthTest: false,
            depthWrite: false,
          })
      ),
    []
  );
  useDisposeOnUnmount(geometry, materials);
  const hovered = useRef(-1);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const reveal = uniforms.uPinReveal.value;
    const hover = uniforms.uPinHover.value;
    heads.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.quaternion.copy(camera.quaternion);
      const target = hovered.current === i ? 1 : 0;
      const h = THREE.MathUtils.damp(hover.getComponent(i), target, 10, dt);
      hover.setComponent(i, h);
      const m = materials[i];
      m.uniforms.uReveal.value = reveal.getComponent(i);
      m.uniforms.uHover.value = h;
      mesh.visible = reveal.getComponent(i) > 0.01;
    });
  });

  useEffect(() => () => {
    if (typeof document !== "undefined") document.body.style.cursor = "auto";
  }, []);

  const setHover = (i: number) => {
    hovered.current = i;
    if (typeof document !== "undefined") document.body.style.cursor = i >= 0 ? "pointer" : "auto";
  };

  return (
    <>
      {PIN_ANCHORS.map(({ head }, i) => (
        <mesh
          key={BLUEPRINT_PINS[i].id}
          ref={(m) => {
            heads.current[i] = m;
          }}
          geometry={geometry}
          material={materials[i]}
          position={head}
          renderOrder={10}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            if (uniforms.uPinReveal.value.getComponent(i) > 0.5) onSelectPin?.(BLUEPRINT_PINS[i]);
          }}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            if (uniforms.uPinReveal.value.getComponent(i) > 0.5) setHover(i);
          }}
          onPointerOut={() => setHover(-1)}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// A submitted suggestion drops a drafting pin onto the field.
// ---------------------------------------------------------------------------
function DroppedPin({ pin }: { pin: EphemeralPin }) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const state = useRef({ y: 6, v: 0, t: 0 });
  const { geometry, material, ringGeometry, ringMaterial } = useMemo(
    () => ({
      geometry: latheProfile(
        [[0, 0], [0.012, 0.02], [0.012, 0.32], [0.09, 0.34], [0.11, 0.4], [0.07, 0.46], [0.06, 0.56], [0.13, 0.62], [0.12, 0.68], [0, 0.7]],
        { radialSegments: 20 }
      ),
      material: new THREE.MeshStandardMaterial({ color: PALETTE.mint, roughness: 0.35, metalness: 0.1 }),
      ringGeometry: new THREE.RingGeometry(0.3, 0.36, 40),
      ringMaterial: new THREE.MeshBasicMaterial({ color: PALETTE.mint, transparent: true, opacity: 0, depthWrite: false }),
    }),
    []
  );
  useDisposeOnUnmount(geometry, material, ringGeometry, ringMaterial);
  const x = (pin.x / 6) * 1.6;
  const z = (pin.y / 4) * 3.5;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = state.current;
    if (s.y > 0 || Math.abs(s.v) > 0.05) {
      s.v -= 18 * dt;
      s.y += s.v * dt;
      if (s.y <= 0) {
        s.y = 0;
        s.v = -s.v * 0.35;
        if (Math.abs(s.v) < 0.4) s.v = 0;
      }
    } else {
      s.t += dt;
    }
    if (group.current) group.current.position.y = s.y;
    if (ring.current) {
      const k = Math.min(s.t / 1.2, 1);
      ring.current.scale.setScalar(1 + k * 2.2);
      ringMaterial.opacity = s.t > 0 ? (1 - k) * 0.8 : 0;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <group ref={group} position={[0, 6, 0]}>
        <mesh geometry={geometry} material={material} castShadow />
      </group>
      <mesh ref={ring} geometry={ringGeometry} material={ringMaterial} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Camera: steady axonometric vantage, eased drift with scroll, slight pointer parallax.
// Narrow screens pull back so the horseshoe fits; wide screens shift the frame right so the
// page copy keeps the empty left third.
// ---------------------------------------------------------------------------
function ArchitectCamera({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const kinetics = useRef(createHeroKineticsTracker(7.5, 5.0, 4.0));
  const damper = useRef(
    createCinemaCameraDamper({
      lambdaPos: 4.5,
      lambdaLook: 7.0,
      enableBreathing: true,
      breathingAmplitude: 0.002,
      breathingRoll: 0.0008,
      breathFreqPrimary: 0.12,
    })
  );
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const lastAspect = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const k = kinetics.current.update(0, state.pointer, dt);
    const raw = Math.min(1, Math.max(0, scrollProgress.current));
    const p = smootherstep(raw);
    const handoff = THREE.MathUtils.smoothstep(raw, 0.6, 1.0);
    const aspect = camera.aspect || 1;
    const pull = 1.14 * THREE.MathUtils.clamp(1 + (1.15 - aspect) * 1.15, 1, 1.85);

    const portraitLift = aspect < 1 ? 1.7 : 0;
    look.set(THREE.MathUtils.lerp(-1.6, -1.3, p), THREE.MathUtils.lerp(2.2, 3.0, p) + handoff * 8.0 - portraitLift, THREE.MathUtils.lerp(-1.8, -1.2, p));
    pos.set(
      THREE.MathUtils.lerp(17.0, 15.0, p) + k.smoothPointerX * 1.4,
      THREE.MathUtils.lerp(19.0, 21.5, p) + k.smoothPointerY * 0.8,
      THREE.MathUtils.lerp(21.5, 21.5, p) - k.smoothPointerX * 0.6
    );
    pos.multiplyScalar(pull).add(look);

    const result = damper.current.update(pos, look, p, dt, { isReducedMotion: false, additionalRoll: k.velocityBank * 0.15 });
    camera.position.copy(result.position);
    camera.lookAt(result.lookAt);
    camera.rotation.z = result.roll;

    if (Math.abs(aspect - lastAspect.current) > 1e-3) {
      lastAspect.current = aspect;
      camera.filmOffset = aspect > 1.2 ? -6.5 : 0;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
function WarRoom({
  scrollProgress,
  newPin,
  onSelectPin,
  mode,
  qualityLevel,
}: Omit<BlueprintSceneGLProps, "className">) {
  useWarmup("ideas-blueprint");
  const full = mode === "A";
  const shadows = full && qualityLevel < 2;

  const lineUniforms = useMemo(
    () =>
      createLineUniforms({
        ink: PALETTE.ink,
        inkSoft: PALETTE.inkSoft,
        pencil: PALETTE.pencil,
        field: PALETTE.field,
        brass: PALETTE.brass,
        water: PALETTE.water,
        mint: PALETTE.mint,
        hot: PALETTE.scan,
        hotIntensity: 1.25,
      }),
    []
  );
  const paperUniforms = useMemo(() => createPaperUniforms(PALETTE.scan, PALETTE.grid), []);
  useEffect(() => {
    lineUniforms.uLamp.value.set(-2.5, -2.0, 15);
    paperUniforms.uPool.value.set(-3.0, -2.0, 12.5);
    paperUniforms.uLampColor.value.set(PALETTE.lamp);
  }, [lineUniforms, paperUniforms]);

  const lines = useMemo(() => {
    const batch = buildLineBatch();
    const geometries = createLineGeometries(batch);
    return { batch, ...geometries };
  }, []);
  const lineMaterials = useMemo(
    () => ({ visible: createLineMaterial(lineUniforms, false), hidden: createLineMaterial(lineUniforms, true) }),
    [lineUniforms]
  );
  useDisposeOnUnmount(lines.visible, lines.hidden, lineMaterials);
  // Tier B / governor: drop construction linework (it is the tail of the instance buffer).
  const lineCount = full && qualityLevel < 2 ? lines.batch.count : lines.batch.essentialCount;
  useEffect(() => {
    lines.visible.instanceCount = lineCount;
  }, [lines, lineCount]);

  const occluder = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const data = buildOhioStadiumLines();
    g.setAttribute("position", new THREE.BufferAttribute(data.occluder, 3));
    g.setAttribute("aCardEdge", new THREE.BufferAttribute(data.occluderEdges, 2));
    g.computeVertexNormals();
    return g;
  }, []);

  const surfaces = useMemo(
    () => ({
      table: createPaperMaterial("table", paperUniforms, { color: PALETTE.table, roughness: 0.7 }),
      sheet: createPaperMaterial("sheet", paperUniforms, { color: PALETTE.sheet, roughness: 0.86, sheet: { center: SHEET.center, half: SHEET.half } }),
      vellum: createPaperMaterial("vellum", paperUniforms, {
        color: PALETTE.vellum,
        roughness: 0.55,
        opacity: 0.07,
        sheet: { center: VELLUM.center, half: VELLUM.half, yaw: VELLUM.yaw },
      }),
      card: createPaperMaterial("card", paperUniforms, { color: PALETTE.card, roughness: 0.9, emissive: PALETTE.cardGlow }),
    }),
    [paperUniforms]
  );
  const planes = useMemo(
    () => ({
      table: new THREE.PlaneGeometry(160, 160).rotateX(-Math.PI / 2),
      ...(() => {
        const g = buildSheetGeometries();
        return { sheet: g.top, sheetEdge: g.edge };
      })(),
      vellum: new THREE.PlaneGeometry(VELLUM.half[0] * 2, VELLUM.half[1] * 2).rotateX(-Math.PI / 2),
    }),
    []
  );

  const props = useMemo(() => buildProps(PROP_LAYOUT, full ? 0 : 1), [full]);
  const propMaterials = useMemo<Record<PropMaterialKey | "sheetEdge", THREE.Material>>(
    () => ({
      brass: createSurfaceMaterial("agedBrass", { color: "#a47c3a", roughness: 0.26 }, { cavity: true, bump: 0, roughnessVariation: 0.1 }),
      steel: createSurfaceMaterial("bronze", { color: "#6f7480", roughness: 0.32 }, { cavity: true, bump: 0, tintAmount: 0, wearColor: "#c9d2dc" }),
      paper: createSurfaceMaterial("plaster", { color: "#e8dcc4", roughness: 0.88, side: THREE.DoubleSide }, { cavity: true, scale: 9, grimeAmount: 0.15 }),
      lacquer: createSurfaceMaterial("lacquerWood", { color: "#d39a2c", roughness: 0.42 }, { cavity: true, tint: "#d9a441", tintAmount: 0.2, bump: 0 }),
      core: new THREE.MeshStandardMaterial({ color: "#1d1712", roughness: 0.8, side: THREE.DoubleSide }),
      sheetEdge: new THREE.MeshStandardMaterial({ color: "#8e9cb6", roughness: 0.9, side: THREE.DoubleSide }),
    }),
    []
  );
  useDisposeOnUnmount(occluder, surfaces, planes, props, propMaterials);

  const contactSpots = useMemo<ContactSpot[]>(
    () => [
      ...propContactSpots().map((spot) => ({ ...spot, opacity: Math.min(0.92, (spot.opacity ?? 0.7) * 1.3) })),
      // Card model footprint: arms, north curve, rotunda, south stands.
      { position: [-3.9, 0, 1.3], size: [4.6, 8.6], opacity: 0.6 },
      { position: [3.9, 0, 1.3], size: [4.6, 8.6], opacity: 0.6 },
      { position: [0, 0, -5.4], size: [12.6, 5.2], opacity: 0.6 },
      { position: [0, 0, -8.7], size: [4.4, 2.8], opacity: 0.6 },
      { position: [0, 0, 5.4], size: [5.4, 1.6], opacity: 0.5 },
      { position: [-5.9, 0, 0], size: [1.6, 5.4], opacity: 0.85 },
      { position: [-1.55, 0, 5.9], size: [1.1, 0.9], opacity: 0.8 },
      { position: [1.55, 0, 5.9], size: [1.1, 0.9], opacity: 0.8 },
      { position: [0, 0, 5.9], size: [4.4, 1.2], opacity: 0.45 },
      { position: [-1.45, 0, -10.8], size: [1.2, 1.2], opacity: 0.85 },
      { position: [1.45, 0, -10.8], size: [1.2, 1.2], opacity: 0.85 },
      // The sheet's lift off the table: a wide soft halo, no hard seam.
      { position: [SHEET.center[0], TABLE_Y, SHEET.center[1]], size: [SHEET.half[0] * 2 + 2.4, SHEET.half[1] * 2 + 2.4], opacity: 0.6 },
    ],
    []
  );

  useShadowUpdates({ mode: "static" });

  // One driver for the scan wave, viewport and focus uniforms.
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const intro = useRef(0);
  const smoothP = useRef(0);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    intro.current += dt;
    smoothP.current = THREE.MathUtils.damp(smoothP.current, Math.min(1, Math.max(0, scrollProgress.current)), 5, dt);
    const introT = Math.min(intro.current / INTRO_SECONDS, 1);
    const introZ = THREE.MathUtils.lerp(SCAN_START, SCAN_REST, 1 - Math.pow(1 - introT, 3));
    const scrollZ = THREE.MathUtils.lerp(SCAN_REST, SCAN_END, THREE.MathUtils.smoothstep(smoothP.current, 0.02, 0.66));
    const scanZ = Math.max(introZ, scrollZ);

    lineUniforms.uScanZ.value = scanZ;
    paperUniforms.uScanZ.value = scanZ;
    lineUniforms.uTime.value += dt;
    const focus = camera.position.length();
    lineUniforms.uFocus.value = focus;
    PIN_ANCHORS.forEach(({ base }, i) => {
      const front = Math.hypot(base[0], base[2] + 16) - 16;
      lineUniforms.uPinReveal.value.setComponent(i, THREE.MathUtils.smoothstep(scanZ, front + 0.2, front + 1.6));
    });
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fog.near = focus + 6;
      fog.far = focus + 42;
    }
  });

  const showDust = full && qualityLevel === 0;

  return (
    <>
      <color attach="background" args={[PALETTE.fog]} />
      <fog attach="fog" args={[PALETTE.fog, 32, 70]} />
      <PerspectiveCamera makeDefault position={[14.5, 17.5, 17]} fov={30} near={0.5} far={160} />

      <BakedEnvironment resolution={128}>
        <mesh position={[LAMP[0], LAMP[1], LAMP[2]]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7, 7]} />
          <meshBasicMaterial color={[3.6, 2.5, 1.3]} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 3, -30]}>
          <planeGeometry args={[60, 4]} />
          <meshBasicMaterial color={[0.05, 0.08, 0.09]} side={THREE.DoubleSide} />
        </mesh>
      </BakedEnvironment>

      {/* Key: the war-room lamp over the north-west of the table. The only shadow caster. */}
      <spotLight
        position={LAMP}
        color={PALETTE.lamp}
        intensity={2700}
        angle={0.74}
        penumbra={0.85}
        decay={2}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-radius={4}
        shadow-camera-near={4}
        shadow-camera-far={45}
        userData={{ gradeRole: "key" }}
      />
      <hemisphereLight args={[PALETTE.fill, PALETTE.table, 0.26]} userData={{ gradeRole: "fill" }} />
      <directionalLight position={[10, 7, -16]} color={PALETTE.rim} intensity={0.35} userData={{ gradeRole: "rim" }} />

      <mesh geometry={planes.table} material={surfaces.table} position={[0, TABLE_Y, 0]} receiveShadow />
      <mesh geometry={planes.sheet} material={surfaces.sheet} position={[SHEET.center[0], 0, SHEET.center[1]]} receiveShadow />
      <mesh geometry={planes.sheetEdge} material={propMaterials.sheetEdge} position={[SHEET.center[0], 0, SHEET.center[1]]} />
      <mesh
        geometry={planes.vellum}
        material={surfaces.vellum}
        position={[VELLUM.center[0], VELLUM.y, VELLUM.center[1]]}
        rotation={[0, VELLUM.yaw, 0]}
        renderOrder={1}
      />
      <ContactShadows spots={contactSpots} color="#05030a" softness={0.8} />

      <mesh geometry={occluder} material={surfaces.card} castShadow={shadows} receiveShadow />
      <mesh ref={(m) => bindViewportResolution(m, lineUniforms)} geometry={lines.hidden} material={lineMaterials.hidden} frustumCulled={false} renderOrder={2} />
      <mesh ref={(m) => bindViewportResolution(m, lineUniforms)} geometry={lines.visible} material={lineMaterials.visible} frustumCulled={false} renderOrder={3} />

      {(Object.keys(props) as PropMaterialKey[]).map((key) => (
        <mesh key={key} geometry={props[key]} material={propMaterials[key]} castShadow={shadows && key !== "core"} receiveShadow />
      ))}

      <SurveyPins uniforms={lineUniforms} onSelectPin={onSelectPin} />
      {newPin && <DroppedPin key={newPin.id} pin={newPin} />}
      <HazeLayer position={[-2, 2.6, -15]} rotation={[0, 0.65, 0]} size={[30, 7]} color={PALETTE.haze} intensity={0.05} />
      {full && <HazeLayer position={[6, 1.6, -11]} rotation={[0, 0.65, 0]} size={[20, 4]} color={PALETTE.haze} intensity={0.035} />}
      {showDust && <DustMotes position={[-2, 4, -2]} size={[14, 7, 12]} count={160} color={PALETTE.lamp} intensity={0.16} pointSize={18} />}

      <ArchitectCamera scrollProgress={scrollProgress} />
    </>
  );
}

export function BlueprintSceneGL({ className = "", ...props }: BlueprintSceneGLProps) {
  const visible = useHeroStageVisibility();
  return (
    <div className={`relative w-full h-full bg-transparent ${className}`}>
      <View
        className="w-full h-full pointer-events-auto"
        index={2}
        visible={visible}
        grade={{ hero: "suggestions", profile: "kaththi-blueprint" }}
      >
        <WarRoom {...props} />
      </View>
    </div>
  );
}
