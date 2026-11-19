"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mergeParts as mergeArtParts } from "@/gl/art/geometry";
import { withSurfaceDetail } from "@/gl/art/surface";
import { bakeVertexAO } from "@/gl/art/vertexAO";
import { DESIGN_ASPECT, evaluateForegroundRig, LENS_CENTERS, LENS_HEIGHT, LENS_WIDTH } from "./gamesRail";

const palette = {
  acetate: "#050507", // Deep piano-gloss acetate catching continuous sky reflections
  chromeHinge: "#DCE2E6", // 3-barrel polished chrome hinge blocks with screws
  silverPin: "#C9CED3", // Hinge rivets
  arCoating: "#68E8D0", // Emerald-cyan Fresnel AR optical coating glint
  mask: "#FFFFFF",
};

function roundedLens(path: THREE.Path, width: number, height: number, radius: number) {
  const x = width / 2;
  const y = height / 2;
  const bottom = x / 1.04;
  path.moveTo(-bottom + radius, -y);
  path.lineTo(bottom - radius, -y);
  path.quadraticCurveTo(bottom, -y, bottom, -y + radius);
  path.lineTo(x, y - radius);
  path.quadraticCurveTo(x, y, x - radius, y);
  path.lineTo(-x + radius, y);
  path.quadraticCurveTo(-x, y, -x, y - radius);
  path.lineTo(-bottom, -y + radius);
  path.quadraticCurveTo(-bottom, -y, -bottom + radius, -y);
  path.closePath();
}

function mergeParts(parts: THREE.BufferGeometry[]) {
  const triangles = parts.map((part) => (part.index ? part.toNonIndexed() : part));
  const geometry = mergeGeometries(triangles);
  new Set([...parts, ...triangles]).forEach((part) => part.dispose());
  if (!geometry) throw new Error("Beach Blast rig geometry attributes do not match");
  return geometry;
}

/**
 * Sweeps a rounded-rectangle (superellipse) section along a curve, with domed ends, so acetate
 * temples and the bridge read as moulded parts instead of round, open-ended tubes.
 * `width` runs across the curve horizontally, `height` vertically; both may taper with t.
 */
function sweptBar(curve: THREE.Curve<THREE.Vector3>, length: number, width: (t: number) => number, height: (t: number) => number, segments = 28, sides = 18) {
  const dome = Math.min(0.45, Math.max(width(0), height(0)) / 2 / length);
  const ts: number[] = [];
  const domeRings = 5;
  for (let i = 0; i <= domeRings; i++) ts.push(dome * (1 - Math.cos((i / domeRings) * Math.PI / 2)));
  for (let i = 1; i < segments; i++) ts.push(dome + (1 - 2 * dome) * (i / segments));
  for (let i = domeRings; i >= 0; i--) ts.push(1 - dome * (1 - Math.cos((i / domeRings) * Math.PI / 2)));
  const positions: number[] = [];
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const up = new THREE.Vector3();
  const worldUp = new THREE.Vector3(0, 1, 0);
  for (const t of ts) {
    curve.getPointAt(t, point);
    curve.getTangentAt(t, tangent);
    side.crossVectors(tangent, worldUp);
    if (side.lengthSq() < 1e-8) side.set(1, 0, 0);
    side.normalize();
    up.crossVectors(side, tangent).normalize();
    // Domed ends: the section shrinks on a quarter circle over the first/last `dome` of the length.
    const edge = Math.min(t, 1 - t);
    const shrink = edge >= dome ? 1 : Math.sqrt(Math.max(0, 1 - ((dome - edge) / dome) ** 2));
    const w = width(t) / 2 * shrink;
    const h = height(t) / 2 * shrink;
    for (let k = 0; k < sides; k++) {
      const angle = (k / sides) * Math.PI * 2;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const x = Math.sign(c) * Math.abs(c) ** 0.55 * w;
      const y = Math.sign(s) * Math.abs(s) ** 0.55 * h;
      positions.push(point.x + side.x * x + up.x * y, point.y + side.y * x + up.y * y, point.z + side.z * x + up.z * y);
    }
  }
  const index: number[] = [];
  for (let r = 0; r < ts.length - 1; r++) {
    for (let k = 0; k < sides; k++) {
      const a = r * sides + k;
      const b = r * sides + ((k + 1) % sides);
      const c = a + sides;
      const d = b + sides;
      index.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

function createCinematicFrame() {
  // Moulded front: the existing registered rims, with a softer, wider bevel that catches a sky line.
  const shape = new THREE.Shape();
  roundedLens(shape, 0.066, 0.0525, 0.012);
  const aperture = new THREE.Path();
  roundedLens(aperture, LENS_WIDTH, LENS_HEIGHT, 0.009);
  shape.holes.push(aperture);
  const rim = new THREE.ExtrudeGeometry(shape, {
    depth: 0.0046,
    bevelEnabled: true,
    bevelSegments: 6,
    bevelSize: 0.0011,
    bevelThickness: 0.0012,
    steps: 1,
    curveSegments: 18,
  });
  const parts: { geometry: THREE.BufferGeometry; position?: [number, number, number] }[] =
    LENS_CENTERS.map((x) => ({ geometry: rim.clone(), position: [x, 0.00125, 0] }));
  rim.dispose();

  // Keyhole saddle bridge, flattened into the rim depth.
  const bridge = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.0095, 0.0135, 0.0023),
    new THREE.Vector3(0, 0.0196, 0.0026),
    new THREE.Vector3(0.0095, 0.0135, 0.0023),
  ]);
  parts.push({ geometry: sweptBar(bridge, bridge.getLength(), () => 0.0046, () => 0.0034, 16, 16) });

  // Temples: flat acetate arms, taller at the hinge and tapering toward the tip.
  for (const side of [-1, 1]) {
    const temple = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.0725, 0.016, 0.0026),
      new THREE.Vector3(side * 0.0755, 0.0185, 0.050),
      new THREE.Vector3(side * 0.0795, 0.0225, 0.100),
      new THREE.Vector3(side * 0.083, 0.009, 0.140),
    ]);
    parts.push({ geometry: sweptBar(temple, temple.getLength(), () => 0.0034, (t) => THREE.MathUtils.lerp(0.0068, 0.0042, t), 34, 18) });
  }
  return mergeArtParts(parts);
}

/** Hinge barrels, screws and domed rivets for both sides, baked into one chrome draw. */
function createHardware() {
  const parts: { geometry: THREE.BufferGeometry; position: [number, number, number]; rotation?: [number, number, number] }[] = [];
  for (const side of [-1, 1]) {
    for (let b = 0; b < 3; b++) {
      parts.push({ geometry: new THREE.CylinderGeometry(0.0016, 0.0016, 0.0035, 14), position: [side * 0.0705, 0.015 + (b - 1) * 0.004, 0.0068] });
    }
    parts.push({ geometry: new THREE.CylinderGeometry(0.0008, 0.0008, 0.0012, 10), position: [side * 0.0705, 0.0215, 0.0068] });
    // Rivet heads face the camera (+z).
    for (const y of [0.011, 0.015, 0.019]) {
      parts.push({ geometry: new THREE.SphereGeometry(0.00075, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), position: [side * 0.0655, y, 0.0058], rotation: [Math.PI / 2, 0, 0] });
    }
  }
  return mergeArtParts(parts);
}

const DIFFUSE_LINE = "reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );";

/**
 * Subsurface-like warmth for skin: light wraps past the terminator and the wrapped part comes back
 * red-shifted, as light scattered through flesh does. Composes with the look kit's onBeforeCompile.
 */
function withSkinWrap(material: THREE.MeshPhysicalMaterial) {
  const previous = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    const chunk = THREE.ShaderChunk.lights_physical_pars_fragment;
    if (!chunk.includes(DIFFUSE_LINE)) return;
    shader.fragmentShader = shader.fragmentShader.replace("#include <lights_physical_pars_fragment>", chunk.replace(DIFFUSE_LINE, `
      float skinNL = dot( geometryNormal, directLight.direction );
      float skinWrap = saturate( ( skinNL + 0.55 ) / 1.55 );
      vec3 skinScatter = directLight.color * max( skinWrap - saturate( skinNL ), 0.0 ) * vec3( 0.9, 0.34, 0.2 );
      reflectedLight.directDiffuse += ( irradiance * ( 1.0 - F ) + skinScatter ) * BRDF_Lambert( material.diffuseContribution );`));
  };
  material.customProgramCacheKey = () => "art-surface-v1-skin-wrap";
  material.needsUpdate = true;
  return material;
}

interface HandMaterialSwap { mesh: THREE.Mesh; original: THREE.Material | THREE.Material[]; replacement: THREE.Material }

/** Skin: physical sheen for the soft grazing scatter of skin, plus crease occlusion baked into the GLB mesh. */
function upgradeHand(hand: THREE.Group): HandMaterialSwap[] {
  const swaps: HandMaterialSwap[] = [];
  hand.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material) || !(object.material instanceof THREE.MeshStandardMaterial)) return;
    const source = object.material;
    if (!object.geometry.getAttribute("aCavity")) bakeVertexAO(object.geometry, { cavity: 1.4, edges: 0.6, smooth: 2 });
    const skin = withSkinWrap(withSurfaceDetail(new THREE.MeshPhysicalMaterial({
      map: source.map,
      normalMap: source.normalMap,
      normalScale: source.normalScale.clone(),
      roughnessMap: source.roughnessMap,
      roughness: Math.max(0.55, source.roughness),
      metalness: 0,
      side: source.side,
      sheen: 0.5,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color("#c4644a"),
      specularIntensity: 0.6,
      envMapIntensity: 0.8,
    }), {
      scale: 260,
      albedoVariation: 0.03,
      roughnessVariation: 0.08,
      bump: 0,
      cavity: true,
      cavityStrength: 0.55,
      cavityColor: "#2b130b",
      space: "local",
    }));
    object.castShadow = true;
    object.receiveShadow = true;
    swaps.push({ mesh: object, original: source, replacement: skin });
    object.material = skin;
  });
  return swaps;
}

export function EyeglassHandRig({ progressRef, hand, cinematic = false }: { progressRef: RefObject<number>; hand: THREE.Group; cinematic?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const coating = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    // The rig is a pure function of scroll progress; dt only rejects a non-finite clock.
    if (!Number.isFinite(dt) || !group.current) return;
    const progress = progressRef.current;
    const aspect = state.size.height > 0 ? state.size.width / state.size.height : DESIGN_ASPECT;
    const rig = evaluateForegroundRig(progress, aspect);
    group.current.position.copy(rig.position);
    group.current.rotation.copy(rig.rotation);
    group.current.visible = rig.opacity > 0;
    if (coating.current) coating.current.visible = progress >= 0.58;
  });
  const resources = useMemo(() => {
    const lensShape = new THREE.Shape();
    roundedLens(lensShape, LENS_WIDTH, LENS_HEIGHT, 0.009);
    const flatLens = new THREE.ShapeGeometry(lensShape, 12);
    // Shallow meniscus curvature on the mask surface (sagitta 0.0022 m).
    const lensPos = flatLens.getAttribute("position");
    for (let i = 0; i < lensPos.count; i++) {
      const lx = lensPos.getX(i);
      const ly = lensPos.getY(i);
      const rSq = Math.min(1.0, (lx * lx) / ((LENS_WIDTH * 0.5) ** 2) + (ly * ly) / ((LENS_HEIGHT * 0.5) ** 2));
      lensPos.setZ(i, 0.0022 * (1.0 - rSq));
    }
    lensPos.needsUpdate = true;
    flatLens.computeVertexNormals();
    const mask = new THREE.MeshBasicMaterial({ color: palette.mask, side: THREE.DoubleSide });

    if (cinematic) {
      const hardware = createHardware();
      // Polished acetate: no micro normal (it glitters on gloss); fingerprint-scale roughness breakup instead.
      const acetate = withSurfaceDetail(new THREE.MeshPhysicalMaterial({
        // Offline eyewear: albedo (.006, .007, .008), roughness .16. A thin clearcoat adds the polished sky line;
        // reflections are calibrated down so the front reads near-black like the baked close-up.
        color: "#0b0b0d",
        roughness: 0.2,
        metalness: 0,
        clearcoat: 0.45,
        clearcoatRoughness: 0.04,
        envMapIntensity: 0.5,
      }), { scale: 90, albedoVariation: 0.2, roughnessVariation: 0.12, bump: 0, space: "local" });
      const chrome = withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#c9ced2", metalness: 1, roughness: 0.22, envMapIntensity: 1 }),
        { scale: 400, albedoVariation: 0.05, roughnessVariation: 0.08, bump: 0, space: "local" });
      return { frame: createCinematicFrame(), lens: flatLens, acetate, chrome, hardware, mask };
    }

    // Legacy look (?cinematic_games=0).
    const shape = new THREE.Shape();
    roundedLens(shape, 0.066, 0.0525, 0.012);
    const aperture = new THREE.Path();
    roundedLens(aperture, LENS_WIDTH, LENS_HEIGHT, 0.009);
    shape.holes.push(aperture);
    const rim = new THREE.ExtrudeGeometry(shape, { depth: 0.0052, bevelEnabled: true, bevelSegments: 5, bevelSize: 0.0009, bevelThickness: 0.0009, steps: 1, curveSegments: 12 });
    const frameParts: THREE.BufferGeometry[] = LENS_CENTERS.map((x) => rim.clone().translate(x, 0.00125, 0));
    rim.dispose();
    const bridge = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.0085, 0.014, 0),
      new THREE.Vector3(0, 0.020, 0.001),
      new THREE.Vector3(0.0085, 0.014, 0),
    ]);
    frameParts.push(new THREE.TubeGeometry(bridge, 14, 0.0032, 8, false));
    for (const side of [-1, 1]) {
      const temple = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.0735, 0.016, 0),
        new THREE.Vector3(side * 0.076, 0.019, 0.050),
        new THREE.Vector3(side * 0.080, 0.023, 0.100),
        new THREE.Vector3(side * 0.083, 0.009, 0.140),
      ]);
      frameParts.push(new THREE.TubeGeometry(temple, 16, 0.0035, 8, false));
    }
    const hingeParts: THREE.BufferGeometry[] = [];
    for (let b = 0; b < 3; b++) {
      hingeParts.push(new THREE.CylinderGeometry(0.0016, 0.0016, 0.0035, 10).translate(0, (b - 1) * 0.004, 0));
    }
    return {
      frame: mergeParts(frameParts),
      lens: flatLens,
      acetate: new THREE.MeshPhysicalMaterial({ color: palette.acetate, roughness: 0.08, metalness: 0.04, clearcoat: 1.0, clearcoatRoughness: 0.04 }),
      chrome: new THREE.MeshStandardMaterial({ color: palette.chromeHinge, metalness: 0.96, roughness: 0.12 }),
      silver: new THREE.MeshStandardMaterial({ color: palette.silverPin, metalness: 1.0, roughness: 0.25 }),
      mask,
      glint: new THREE.MeshBasicMaterial({ color: palette.arCoating, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }),
      hingeBlock: mergeParts(hingeParts),
      screw: new THREE.CylinderGeometry(0.0008, 0.0008, 0.0012, 8),
      pin: new THREE.CylinderGeometry(0.001, 0.001, 0.008, 8),
      highlight: new THREE.PlaneGeometry(0.016, 0.008),
    };
  }, [cinematic]);

  useEffect(() => () => Object.values(resources).forEach((resource) => (resource as { dispose?: () => void }).dispose?.()), [resources]);

  // The hand belongs to the media loader; swap its material while mounted and restore it for disposeForeground.
  useEffect(() => {
    if (!cinematic) return;
    const swaps = upgradeHand(hand);
    return () => {
      for (const swap of swaps) {
        swap.mesh.material = swap.original;
        swap.replacement.dispose();
      }
    };
  }, [hand, cinematic]);

  if ("hardware" in resources) {
    return (
      <group ref={group} visible={false} name="EyeglassHandRigGroup" dispose={null}>
        <mesh geometry={resources.frame} material={resources.acetate} name="GlassesFrameAssembly" castShadow receiveShadow />
        <mesh geometry={resources.hardware} material={resources.chrome} name="HingeHardware" castShadow />
        <primitive object={hand} name="HandAndArmRig" dispose={null} />
        {LENS_CENTERS.map((x, index) => (
          <mesh key={x} name={index === 0 ? "LeftLensMask" : "RightLensMask"} position={[x, 0, 0]} geometry={resources.lens} material={resources.mask} layers={2} />
        ))}
      </group>
    );
  }

  return (
    <group ref={group} visible={false} name="EyeglassHandRigGroup" dispose={null}>
      <mesh geometry={resources.frame} material={resources.acetate} name="GlassesFrameAssembly" />
      <primitive object={hand} name="HandAndArmRig" dispose={null} />
      {LENS_CENTERS.map((x, index) => (
        <group key={x}>
          <mesh
            name={index === 0 ? "LeftLensMask" : "RightLensMask"}
            position={[x, 0, 0]}
            geometry={resources.lens}
            material={resources.mask}
            layers={2}
          />
          {/* 3-barrel chrome hinge block at x = ±0.068 m with screws */}
          <mesh position={[Math.sign(x) * 0.068, 0.015, 0.003]} geometry={resources.hingeBlock} material={resources.chrome} />
          <mesh position={[Math.sign(x) * 0.068, 0.019, 0.0042]} geometry={resources.screw} material={resources.chrome} />
          {/* Three silver rivets per side */}
          {[0.011, 0.015, 0.019].map((y) => (
            <mesh key={y} position={[Math.sign(x) * 0.0735, y, 0.004]} geometry={resources.pin} material={resources.silver} />
          ))}
        </group>
      ))}
      {/* Curved emerald-cyan Fresnel AR optical coating glint across right lens */}
      <mesh
        ref={coating}
        position={[0.055, -0.011, 0.005]}
        rotation={[0, 0, -0.32]}
        geometry={resources.highlight}
        material={resources.glint}
        visible={false}
      />
    </group>
  );
}
