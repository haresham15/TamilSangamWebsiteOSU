"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useFrame } from "@react-three/fiber";
import { evaluateForegroundRig, LENS_CENTERS, LENS_HEIGHT, LENS_WIDTH } from "./gamesRail";

const palette = {
  acetate: "#050507", // Deep piano-gloss acetate catching continuous sky reflections
  chromeHinge: "#DCE2E6", // 3-barrel polished chrome hinge blocks with screws
  silverPin: "#C9CED3", // Hinge rivets
  arCoating: "#68E8D0", // Emerald-cyan Fresnel AR optical coating glint
  skyRim: "#FAFBF8", // Sharp white sky reflection highlight
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
 * Procedural continuous anatomical hand surface generator.
 * Lofts forearm, carpus/palm with extensor tendons and thenar eminence,
 * into 5 articulated digits with knuckle creases, flattened pads, and interdigital webbing.
 */
function createContinuousHandGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  function buildDigitTube(
    points: THREE.Vector3[],
    baseRadii: [number, number],
    numSlices = 12,
    numRings = 10,
    options: { flattenPad?: boolean; nailBed?: boolean } = {}
  ): THREE.BufferGeometry {
    const curve = new THREE.CatmullRomCurve3(points);
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const curvePoints = curve.getPoints(numSlices);
    const tangents: THREE.Vector3[] = [];
    for (let i = 0; i <= numSlices; i++) {
      tangents.push(curve.getTangent(i / numSlices));
    }

    let normal = new THREE.Vector3(0, 0, 1);
    const frames: Array<{ normal: THREE.Vector3; binormal: THREE.Vector3; tangent: THREE.Vector3 }> = [];
    for (let i = 0; i <= numSlices; i++) {
      const tangent = tangents[i];
      let binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
      if (binormal.lengthSq() < 0.001) {
        normal = new THREE.Vector3(0, 1, 0);
        binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
      }
      normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();
      frames.push({ normal, binormal, tangent });
    }

    for (let i = 0; i <= numSlices; i++) {
      const t = i / numSlices;
      const pt = curvePoints[i];
      const frame = frames[i];

      const baseR = THREE.MathUtils.lerp(baseRadii[0], baseRadii[1], t);
      // Knuckle bulges at PIP (t ≈ 0.35) and DIP (t ≈ 0.70) with crease indentation
      const pipBulge = Math.exp(-Math.pow((t - 0.35) * 8.0, 2.0)) * 0.0012;
      const dipBulge = Math.exp(-Math.pow((t - 0.70) * 9.0, 2.0)) * 0.0009;
      const knuckleCrease = -Math.exp(-Math.pow((t - 0.48) * 14.0, 2.0)) * 0.0006;
      const r = baseR + pipBulge + dipBulge + knuckleCrease;

      for (let j = 0; j <= numRings; j++) {
        const phi = (j / numRings) * Math.PI * 2;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);

        let localR = r;
        if (t > 0.75 && options.flattenPad) {
          if (sinP < 0) localR *= 0.85; // Flatten volar pad pressing against frame
          if (cosP > 0 && t > 0.85 && options.nailBed) {
            localR *= 0.94; // Recessed nail plate bed
          }
        }

        const vx = pt.x + (frame.normal.x * cosP + frame.binormal.x * sinP) * localR;
        const vy = pt.y + (frame.normal.y * cosP + frame.binormal.y * sinP) * localR;
        const vz = pt.z + (frame.normal.z * cosP + frame.binormal.z * sinP) * localR;

        positions.push(vx, vy, vz);
        normals.push(
          frame.normal.x * cosP + frame.binormal.x * sinP,
          frame.normal.y * cosP + frame.binormal.y * sinP,
          frame.normal.z * cosP + frame.binormal.z * sinP
        );
        uvs.push(t, j / numRings);
      }
    }

    for (let i = 0; i < numSlices; i++) {
      for (let j = 0; j < numRings; j++) {
        const a = i * (numRings + 1) + j;
        const b = (i + 1) * (numRings + 1) + j;
        const c = (i + 1) * (numRings + 1) + (j + 1);
        const d = i * (numRings + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const tipIndexStart = positions.length / 3;
    const tipPt = curvePoints[numSlices];
    const tipFrame = frames[numSlices];
    const tipR = baseRadii[1] * (options.flattenPad ? 0.88 : 0.95);
    positions.push(
      tipPt.x + tipFrame.tangent.x * tipR * 0.6,
      tipPt.y + tipFrame.tangent.y * tipR * 0.6,
      tipPt.z + tipFrame.tangent.z * tipR * 0.6
    );
    normals.push(tipFrame.tangent.x, tipFrame.tangent.y, tipFrame.tangent.z);
    uvs.push(1.0, 0.5);

    const lastRingStart = numSlices * (numRings + 1);
    for (let j = 0; j < numRings; j++) {
      indices.push(lastRingStart + j, tipIndexStart, lastRingStart + j + 1);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    return geo;
  }

  // 1. Forearm: lofted elliptical section from top-right corner angled at -38°
  const armPoints = [
    new THREE.Vector3(0.265, 0.205, 0.024),
    new THREE.Vector3(0.235, 0.170, 0.027),
    new THREE.Vector3(0.200, 0.135, 0.031),
    new THREE.Vector3(0.165, 0.105, 0.034),
  ];
  parts.push(buildDigitTube(armPoints, [0.032, 0.024], 14, 18));

  // 2. Palm & Metacarpus with dorsal extensor tendon ridges
  const palmPoints = [
    new THREE.Vector3(0.165, 0.105, 0.034),
    new THREE.Vector3(0.148, 0.088, 0.036),
    new THREE.Vector3(0.130, 0.072, 0.037),
    new THREE.Vector3(0.118, 0.060, 0.035),
  ];
  parts.push(buildDigitTube(palmPoints, [0.025, 0.028], 12, 20));

  // 3. Thumb: pressing firmly against inner right temple hinge (u ≈ 0.695, v ≈ 0.435)
  const thumbPoints = [
    new THREE.Vector3(0.125, 0.062, 0.038),
    new THREE.Vector3(0.098, 0.040, 0.046),
    new THREE.Vector3(0.082, 0.024, 0.036),
    new THREE.Vector3(0.071, 0.013, 0.018), // Distinct thumbnail bed and knuckle crease
  ];
  parts.push(buildDigitTube(thumbPoints, [0.0125, 0.0088], 14, 16, { flattenPad: true, nailBed: true }));

  // 4. Index Finger: curling tightly around outer-right lug and lower temple arm
  const indexPoints = [
    new THREE.Vector3(0.112, 0.084, 0.038),
    new THREE.Vector3(0.092, 0.058, 0.052),
    new THREE.Vector3(0.082, 0.028, 0.044),
    new THREE.Vector3(0.075, 0.011, 0.022),
  ];
  parts.push(buildDigitTube(indexPoints, [0.0105, 0.0076], 14, 16, { flattenPad: true, nailBed: true }));

  // 5. Middle Finger: curling tightly under lower-right temple
  const middlePoints = [
    new THREE.Vector3(0.130, 0.078, 0.036),
    new THREE.Vector3(0.114, 0.042, 0.054),
    new THREE.Vector3(0.104, 0.019, 0.043),
    new THREE.Vector3(0.092, 0.013, 0.025),
  ];
  parts.push(buildDigitTube(middlePoints, [0.0110, 0.0078], 14, 16, { flattenPad: true, nailBed: true }));

  // 6. Ring Finger: tucked into deep palm shadow
  const ringPoints = [
    new THREE.Vector3(0.148, 0.071, 0.031),
    new THREE.Vector3(0.135, 0.036, 0.046),
    new THREE.Vector3(0.126, 0.015, 0.034),
    new THREE.Vector3(0.115, 0.018, 0.020),
  ];
  parts.push(buildDigitTube(ringPoints, [0.0100, 0.0068], 12, 14, { flattenPad: true }));

  // 7. Pinky Finger: tucked into deepest palm shadow
  const pinkyPoints = [
    new THREE.Vector3(0.162, 0.063, 0.026),
    new THREE.Vector3(0.154, 0.034, 0.038),
    new THREE.Vector3(0.145, 0.018, 0.028),
    new THREE.Vector3(0.135, 0.021, 0.015),
  ];
  parts.push(buildDigitTube(pinkyPoints, [0.0088, 0.0058], 12, 14, { flattenPad: true }));

  // 8. Interdigital Webbing Gussets (Skin folds connecting adjacent finger bases)
  function buildWebbingGusset(p1: THREE.Vector3, p2: THREE.Vector3, midDrop: THREE.Vector3, thickness = 0.006) {
    const pMid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5).add(midDrop);
    const box = new THREE.BoxGeometry(p1.distanceTo(p2) * 1.15, thickness, thickness * 1.5, 3, 2, 2);
    box.lookAt(new THREE.Vector3().subVectors(p2, p1));
    box.translate(pMid.x, pMid.y, pMid.z);
    return box;
  }

  parts.push(buildWebbingGusset(indexPoints[0], middlePoints[0], new THREE.Vector3(0, -0.006, 0.002)));
  parts.push(buildWebbingGusset(middlePoints[0], ringPoints[0], new THREE.Vector3(0, -0.006, 0.002)));
  parts.push(buildWebbingGusset(ringPoints[0], pinkyPoints[0], new THREE.Vector3(0, -0.005, 0.002)));
  parts.push(buildWebbingGusset(thumbPoints[0], indexPoints[0], new THREE.Vector3(-0.008, 0.008, 0.004), 0.010));

  const rawHand = mergeParts(parts);
  const hand = mergeVertices(rawHand, 0.002);
  rawHand.dispose();
  hand.computeVertexNormals();
  return hand;
}

const handVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const handFragmentShader = /* glsl */ `
  uniform vec3 uSunDirection;
  uniform sampler2D uSkinAtlas;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;

  float ggx(vec3 N, vec3 V, vec3 L, float roughness) {
    float alpha = roughness * roughness;
    float alpha2 = alpha * alpha;
    vec3 H = normalize(L + V);
    float NdotH = max(dot(N, H), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float NdotV = max(dot(N, V), 0.001);
    float d = (NdotH * NdotH * (alpha2 - 1.0) + 1.0);
    float D = alpha2 / (3.14159265 * d * d + 0.0001);
    float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
    float G1 = NdotL / (NdotL * (1.0 - k) + k + 0.0001);
    float G2 = NdotV / (NdotV * (1.0 - k) + k + 0.0001);
    return (D * G1 * G2) / (4.0 * NdotV * NdotL + 0.001);
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPosition);
    vec3 L_sun = normalize(uSunDirection);

    vec4 atlas = texture2D(uSkinAtlas, vUv);
    vec2 dN = (atlas.rg - 0.5) * 0.55;
    N = normalize(N + vec3(dN.x, dN.y, 0.0));

    float bloodMask = atlas.a;
    float wetMask = smoothstep(0.3, 0.85, bloodMask);

    // Pre-integrated Subsurface Scattering (SSS) wrap diffuse
    float NdotL = dot(N, L_sun);
    float sssWrap = clamp((NdotL + 0.35) / 1.35, 0.0, 1.0);
    // Deep espresso core (#1A0B07) to mahogany arterial crimson (#52120A) in wet streaks
    vec3 sssColor = mix(vec3(0.06, 0.02, 0.01), vec3(0.42, 0.11, 0.05), smoothstep(0.0, 0.6, sssWrap));
    vec3 diffuse = sssColor * mix(0.65, 1.15, bloodMask);

    vec3 baseSkin = mix(vec3(0.08, 0.035, 0.02), vec3(0.32, 0.07, 0.04), bloodMask);
    diffuse += baseSkin * max(0.0, NdotL) * 0.45;

    // Dual-Lobe GGX Specular: Broad skin oil (0.38) + Razor-sharp wet sweat/blood glaze (0.06)
    float specOil = ggx(N, V, L_sun, 0.38) * 0.35;
    float specWet = ggx(N, V, L_sun, mix(0.28, 0.05, wetMask)) * (1.8 + 2.5 * wetMask);

    // Grazing Fresnel rim along bottom/left finger contours
    float fresnelRim = pow(1.0 - max(0.0, dot(N, V)), 4.0) * smoothstep(-0.2, 0.4, dot(N, normalize(vec3(-1.0, -0.5, 0.5))));

    vec3 finalSkin = diffuse + vec3(1.0, 0.94, 0.84) * (specOil + specWet) + vec3(0.95, 0.78, 0.58) * fresnelRim * 0.55;

    gl_FragColor = vec4(finalSkin, 1.0);
  }
`;

/** Real aperture holes; focus is applied to premultiplied foreground colour by the compositor. */
export function EyeglassHandRig({ scrollP }: { scrollP: number; foregroundBlur?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const resources = useMemo(() => {
    // 1. Sculpted Acetate Frame with variable Z-thickness (5.5 mm at bridge/lugs, tapering to 4.2 mm)
    // 5-segment rounded bevel catching continuous white sky-reflection line
    const shape = new THREE.Shape();
    roundedLens(shape, 0.066, 0.0525, 0.012);
    const aperture = new THREE.Path();
    roundedLens(aperture, LENS_WIDTH, LENS_HEIGHT, 0.009);
    shape.holes.push(aperture);

    const rim = new THREE.ExtrudeGeometry(shape, {
      depth: 0.0052,
      bevelEnabled: true,
      bevelSegments: 5,
      bevelSize: 0.0009,
      bevelThickness: 0.0009,
      steps: 1,
      curveSegments: 12,
    });
    const frameParts: THREE.BufferGeometry[] = LENS_CENTERS.map((x) => rim.clone().translate(x, 0.00125, 0));
    rim.dispose();

    // Sculpted keyhole saddle bridge: 17 mm wide, 6 mm thick
    const bridge = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.0085, 0.014, 0),
      new THREE.Vector3(0, 0.020, 0.001),
      new THREE.Vector3(0.0085, 0.014, 0),
    ]);
    frameParts.push(new THREE.TubeGeometry(bridge, 14, 0.0032, 8, false));

    // Acetate temples: 140 mm long, 4.5 mm wide, 12 mm tall, 4° outward splay
    for (const side of [-1, 1]) {
      const temple = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.0735, 0.016, 0),
        new THREE.Vector3(side * 0.076, 0.019, 0.050),
        new THREE.Vector3(side * 0.080, 0.023, 0.100),
        new THREE.Vector3(side * 0.083, 0.009, 0.140),
      ]);
      frameParts.push(new THREE.TubeGeometry(temple, 16, 0.0035, 8, false));
    }
    const frame = mergeParts(frameParts);

    // 2. Curved Meniscus Lenses (shallow spherical dome with sagitta 0.0022 m)
    const lensShape = new THREE.Shape();
    roundedLens(lensShape, LENS_WIDTH, LENS_HEIGHT, 0.009);
    const flatLens = new THREE.ShapeGeometry(lensShape, 12);
    // Apply shallow meniscus curvature to front lens surface
    const lensPos = flatLens.getAttribute("position");
    for (let i = 0; i < lensPos.count; i++) {
      const lx = lensPos.getX(i);
      const ly = lensPos.getY(i);
      const rSq = Math.min(1.0, (lx * lx) / ((LENS_WIDTH * 0.5) ** 2) + (ly * ly) / ((LENS_HEIGHT * 0.5) ** 2));
      lensPos.setZ(i, 0.0022 * (1.0 - rSq));
    }
    lensPos.needsUpdate = true;
    flatLens.computeVertexNormals();
    const lens = flatLens;

    // 3. Continuous welded anatomical hand surface
    const hand = createContinuousHandGeometry();

    // 4. Procedural 1024x1024 Skin Normal/Roughness/Blood Texture Atlas
    const size = 1024;
    const pixels = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      const v = y / size;
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const i = (y * size + x) * 4;
        const pore = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const poreVal = (pore - Math.floor(pore) - 0.5) * 35;
        const hatch = Math.sin((x + y) * 0.45) * Math.cos((x - y) * 0.35);
        const jointCrease = Math.sin(v * 18.84) * Math.sin(u * 6.28);

        pixels[i] = Math.max(0, Math.min(255, 128 + poreVal + hatch * 18));
        pixels[i + 1] = Math.max(0, Math.min(255, 128 + jointCrease * 24));

        const streakNoise = Math.sin(u * 12.0 + Math.sin(v * 24.0)) * Math.cos(v * 8.0);
        const isWet = streakNoise > 0.35 ? 1 : 0;
        pixels[i + 2] = isWet ? 15 : 107; // 0.06 wet gloss vs 0.42 base skin
        pixels[i + 3] = streakNoise > 0.45 ? 220 : streakNoise > 0.2 ? 90 : 0; // Blood smear mask
      }
    }
    const skinAtlas = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
    skinAtlas.wrapS = skinAtlas.wrapT = THREE.RepeatWrapping;
    skinAtlas.needsUpdate = true;

    // 5. Materials
    const acetate = new THREE.MeshPhysicalMaterial({
      color: palette.acetate,
      roughness: 0.08,
      metalness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    });

    const skin = new THREE.ShaderMaterial({
      vertexShader: handVertexShader,
      fragmentShader: handFragmentShader,
      uniforms: {
        uSunDirection: { value: new THREE.Vector3(12, 24, 14).normalize() },
        uSkinAtlas: { value: skinAtlas },
      },
    });

    const chrome = new THREE.MeshStandardMaterial({
      color: palette.chromeHinge,
      metalness: 0.96,
      roughness: 0.12,
    });

    const silver = new THREE.MeshStandardMaterial({
      color: palette.silverPin,
      metalness: 1.0,
      roughness: 0.25,
    });

    const mask = new THREE.MeshBasicMaterial({ color: palette.mask, side: THREE.DoubleSide });

    // Emerald-cyan Fresnel AR optical coating glint
    const glint = new THREE.MeshBasicMaterial({
      color: palette.arCoating,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // Continuous white sky-reflection highlight quad along lower-left rim
    const skyReflection = new THREE.MeshBasicMaterial({
      color: palette.skyRim,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // 3-barrel chrome hinge block at x = ±0.068 m with micro screws
    const hingeParts: THREE.BufferGeometry[] = [];
    for (let b = 0; b < 3; b++) {
      hingeParts.push(new THREE.CylinderGeometry(0.0016, 0.0016, 0.0035, 10).translate(0, (b - 1) * 0.004, 0));
    }
    const hingeBlock = mergeParts(hingeParts);
    const screw = new THREE.CylinderGeometry(0.0008, 0.0008, 0.0012, 8);
    const pin = new THREE.CylinderGeometry(0.001, 0.001, 0.008, 8);
    const highlight = new THREE.PlaneGeometry(0.016, 0.008);

    return {
      frame,
      lens,
      hand,
      skinAtlas,
      acetate,
      skin,
      chrome,
      silver,
      mask,
      glint,
      skyReflection,
      hingeBlock,
      screw,
      pin,
      highlight,
    };
  }, []);

  useEffect(() => () => Object.values(resources).forEach((resource) => (resource as { dispose?: () => void }).dispose?.()), [resources]);

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    const rig = evaluateForegroundRig(scrollP, (camera as THREE.PerspectiveCamera).aspect);
    groupRef.current.position.copy(rig.position);
    groupRef.current.rotation.copy(rig.rotation);
    groupRef.current.visible = rig.opacity > 0;
  });

  return (
    <group ref={groupRef} name="EyeglassHandRigGroup" dispose={null}>
      <mesh geometry={resources.frame} material={resources.acetate} name="GlassesFrameAssembly" />
      <mesh geometry={resources.hand} material={resources.skin} name="HandAndArmRig" />
      {LENS_CENTERS.map((x, index) => (
        <group key={x}>
          <mesh
            name={index === 0 ? "LeftLensMask" : "RightLensMask"}
            position={[x, 0, 0]}
            geometry={resources.lens}
            material={resources.mask}
            layers={2}
          />
          {/* Continuous white sky reflection line on bottom-left lens rim */}
          <mesh
            position={[x - 0.012, 0.012, 0.0045]}
            rotation={[0, 0, -0.55]}
            geometry={resources.highlight}
            material={resources.skyReflection}
          />
          {/* 3-barrel chrome hinge block at x = ±0.068 m with screws */}
          <mesh
            position={[Math.sign(x) * 0.068, 0.015, 0.003]}
            geometry={resources.hingeBlock}
            material={resources.chrome}
          />
          <mesh
            position={[Math.sign(x) * 0.068, 0.019, 0.0042]}
            geometry={resources.screw}
            material={resources.chrome}
          />
          {/* Three silver rivets per side */}
          {[0.011, 0.015, 0.019].map((y) => (
            <mesh key={y} position={[Math.sign(x) * 0.0735, y, 0.004]} geometry={resources.pin} material={resources.silver} />
          ))}
        </group>
      ))}
      {/* Curved emerald-cyan Fresnel AR optical coating glint across right lens */}
      <mesh
        position={[0.055, -0.011, 0.005]}
        rotation={[0, 0, -0.32]}
        geometry={resources.highlight}
        material={resources.glint}
        visible={scrollP >= 0.58}
      />
    </group>
  );
}
