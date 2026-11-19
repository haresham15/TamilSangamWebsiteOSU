"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { latheProfile, mergeParts, chamferedBox, type Part, type Vec3 } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";
import { createSurfaceMaterial } from "@/gl/art/surface";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { ContactShadows, type ContactSpot } from "@/gl/art/ContactShadow";

/**
 * Art-pass Chola karanda makuta (PRD §2.2), replacing ~60 primitive meshes.
 *
 * Draws: gold body (diadem, four bell tiers with rising petal crests, kirtimukha crest,
 * makara scrolls, sirascakra) as ONE merged lathe-built geometry; the lotus pedestal as
 * one; faceted rubies/emeralds as one instanced draw with per-gem colour; pearls as one;
 * sparkle glints as one. A rim light from behind rises as the crown is revealed.
 */

// Flat teardrop leaf (petal, flame tongue, crest), standing on +y, face toward ±z.
function leaf(size: number, thickness = 0.32) {
  const g = latheProfile(
    [[0, 0], [0.022, 0.012], [0.03, 0.04], [0.023, 0.07], [0.009, 0.094], [0, 0.106]].map(
      ([r, y]) => [r * size, y * size] as [number, number]
    ),
    { radialSegments: 10, smooth: true, samples: 12 }
  );
  g.scale(1, 1, thickness);
  return g;
}

/** Ring of leaves around the y axis, leaning outward by `lean` radians. */
function leafRing(count: number, radius: number, y: number, size: number, lean: number, offset = 0): Part[] {
  return Array.from({ length: count }, (_, i) => {
    const a = ((i + offset) / count) * Math.PI * 2;
    const g = leaf(size);
    g.rotateX(lean);
    return { geometry: g, position: [Math.sin(a) * radius, y, Math.cos(a) * radius] as Vec3, rotation: [0, a, 0] as Vec3 };
  });
}

/** Bakes a sub-assembly's group transform into its merged geometry. */
function assembly(parts: Part[], position: Vec3, rotation: Vec3) {
  const g = mergeParts(parts);
  g.applyMatrix4(
    new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(1, 1, 1)
    )
  );
  return g;
}

const BODY_PROFILE: [number, number][] = [
  [0, -0.1], [0.5, -0.1], [0.532, -0.096], [0.546, -0.08], [0.534, -0.066], [0.52, -0.062], [0.52, 0.062],
  [0.534, 0.066], [0.546, 0.08], [0.532, 0.096], [0.5, 0.1],
  // Tier 1 bell + moulding
  [0.48, 0.11], [0.495, 0.15], [0.49, 0.2], [0.462, 0.243], [0.432, 0.258], [0.455, 0.266], [0.463, 0.28],
  [0.451, 0.292], [0.41, 0.298],
  // Tier 2
  [0.41, 0.31], [0.415, 0.35], [0.4, 0.39], [0.372, 0.418], [0.35, 0.428], [0.372, 0.436], [0.378, 0.448],
  [0.366, 0.458], [0.33, 0.462],
  // Tier 3
  [0.33, 0.47], [0.332, 0.5], [0.316, 0.534], [0.29, 0.558], [0.27, 0.565], [0.29, 0.572], [0.295, 0.583],
  [0.282, 0.592], [0.25, 0.596],
  // Tier 4
  [0.25, 0.6], [0.248, 0.63], [0.23, 0.655], [0.2, 0.674], [0.18, 0.68],
  // Lotus calyx, kalasam pot, neck, bud finial
  [0.2, 0.69], [0.212, 0.705], [0.18, 0.72], [0.12, 0.735], [0.09, 0.745], [0.11, 0.76], [0.13, 0.795],
  [0.125, 0.83], [0.095, 0.86], [0.05, 0.875], [0.04, 0.885], [0.056, 0.9], [0.04, 0.915], [0.03, 0.93],
  [0.058, 0.97], [0.064, 1.0], [0.05, 1.04], [0.025, 1.08], [0, 1.12],
];

function createCrownBody() {
  const body = latheProfile(BODY_PROFILE, { radialSegments: 56 });

  // Kirtimukha crest on the brow: a tall leaf plate with two flanking smaller leaves.
  const crest: Part[] = [
    { geometry: leaf(3.2, 0.22), position: [0, 0.03, 0.535], rotation: [-0.12, 0, 0] },
    { geometry: leaf(1.9, 0.25), position: [-0.13, 0.03, 0.52], rotation: [-0.1, -0.25, 0.35] },
    { geometry: leaf(1.9, 0.25), position: [0.13, 0.03, 0.52], rotation: [-0.1, 0.25, -0.35] },
  ];

  // Makara scrolls at the temples, with hanging drops.
  const makara: Part[] = [-1, 1].flatMap((dir) => {
    const scroll = new THREE.TorusGeometry(0.13, 0.016, 8, 28, Math.PI * 1.3);
    const drop = latheProfile([[0, 0], [0.02, 0.025], [0.026, 0.05], [0.012, 0.08], [0, 0.09]], { radialSegments: 10, smooth: true, samples: 10 });
    drop.rotateX(Math.PI);
    return [
      { geometry: scroll, position: [dir * 0.56, 0.16, 0] as Vec3, rotation: [0, Math.PI / 2, dir * 0.6] as Vec3 },
      { geometry: drop, position: [dir * 0.6, -0.1, 0.02] as Vec3 },
    ];
  });

  // Sirascakra: lotus halo wheel behind the crown.
  const wheelParts: Part[] = [
    { geometry: new THREE.TorusGeometry(0.32, 0.02, 10, 72) },
    { geometry: new THREE.TorusGeometry(0.2, 0.012, 8, 56) },
    { geometry: latheProfile([[0, 0], [0.09, 0], [0.1, 0.015], [0.07, 0.035], [0, 0.045]], { radialSegments: 24 }), rotation: [Math.PI / 2, 0, 0] },
    ...Array.from({ length: 8 }, (_, i) => ({
      geometry: chamferedBox(0.022, 0.24, 0.016, 0.005),
      rotation: [0, 0, (i / 8) * Math.PI * 2] as Vec3,
    })),
    ...Array.from({ length: 20 }, (_, i) => {
      const a = (i / 20) * Math.PI * 2;
      return {
        geometry: leaf(1.0, 0.4),
        position: [Math.sin(a) * 0.335, Math.cos(a) * 0.335, 0] as Vec3,
        rotation: [0, 0, -a] as Vec3,
      };
    }),
  ];
  const wheel = assembly(wheelParts, [0, 0.42, -0.44], [-0.22, 0, 0]);
  const strut = chamferedBox(0.05, 0.05, 0.16, 0.01);

  const geometry = mergeParts([
    { geometry: body },
    ...leafRing(16, 0.452, 0.258, 1.25, 0.28),
    ...leafRing(14, 0.37, 0.428, 1.05, 0.24, 0.5),
    ...leafRing(12, 0.288, 0.565, 0.9, 0.2),
    ...leafRing(10, 0.196, 0.68, 0.75, 0.18, 0.5),
    ...leafRing(10, 0.15, 0.745, 0.7, -0.5),
    ...crest,
    ...makara,
    { geometry: wheel },
    { geometry: strut, position: [0, 0.4, -0.37] },
  ]);
  return bakeVertexAO(geometry, { cavity: 1.4, edges: 1.2, smooth: 1 });
}

/**
 * Octagonal stepped stone pitha that carries the lotus pedestal down to the floor, so the
 * crown sits on the hall instead of hovering over it. Local units (group scale applies).
 */
function createDais(floorY: number) {
  const top = -0.41;
  const g = latheProfile(
    [
      [0, floorY], [1.0, floorY], [1.0, floorY + 0.07], [0.95, floorY + 0.09], [0.86, floorY + 0.1], [0.86, floorY + 0.17],
      [0.9, floorY + 0.19], [0.9, floorY + 0.23], [0.8, floorY + 0.25], [0.74, top - 0.03], [0.78, top - 0.01], [0.76, top], [0, top],
    ],
    { radialSegments: 8 }
  ).toNonIndexed();
  g.rotateY(Math.PI / 8);
  g.computeVertexNormals();
  return bakeVertexAO(g, { ground: { y: floorY, height: 0.12, strength: 0.7 }, bands: [{ y: top, width: 0.04, strength: 0.8 }] });
}

function createPedestal() {
  const base = latheProfile(
    [[0, -0.05], [0.7, -0.05], [0.745, -0.038], [0.756, -0.015], [0.73, 0.0], [0.67, 0.012], [0.63, 0.034], [0.61, 0.062], [0.628, 0.076], [0.58, 0.088], [0, 0.088]],
    { radialSegments: 56 }
  );
  const geometry = mergeParts([
    { geometry: base },
    ...leafRing(18, 0.6, 0.06, 2.3, 0.72),
    ...leafRing(18, 0.5, 0.075, 1.9, 0.45, 0.5),
  ]);
  return bakeVertexAO(geometry, { cavity: 1.3, edges: 1, ground: { y: -0.05, height: 0.06, strength: 0.5 } });
}

interface Gem {
  position: Vec3;
  /** Direction the table faces (radial for the band, forward for the crest). */
  yaw: number;
  pitch?: number;
  scale: number;
  ruby: boolean;
}

function gemLayout(): Gem[] {
  const gems: Gem[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
    gems.push({ position: [Math.sin(a) * 0.522, 0, Math.cos(a) * 0.522], yaw: a, scale: 1, ruby: i % 2 === 0 });
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    gems.push({ position: [Math.sin(a) * 0.495, 0.18, Math.cos(a) * 0.495], yaw: a, pitch: -0.1, scale: 0.8, ruby: i % 2 === 1 });
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    gems.push({ position: [Math.sin(a) * 0.41, 0.36, Math.cos(a) * 0.41], yaw: a, pitch: -0.15, scale: 0.7, ruby: i % 2 === 0 });
  }
  gems.push({ position: [0, 0.2, 0.565], yaw: 0, pitch: -0.12, scale: 1.9, ruby: true }); // crest
  gems.push({ position: [0, 0.81, 0.13], yaw: 0, scale: 0.8, ruby: false }); // kalasam
  gems.push({ position: [0, 0.42, -0.5], yaw: Math.PI, pitch: 0.22, scale: 1.1, ruby: true }); // sirascakra hub
  return gems;
}

function pearlLayout(): Vec3[] {
  const out: Vec3[] = [];
  for (const y of [-0.08, 0.08]) {
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2;
      out.push([Math.sin(a) * 0.55, y, Math.cos(a) * 0.55]);
    }
  }
  // Swags under the crest.
  for (const dir of [-1, 1]) {
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const x = dir * (0.06 + t * 0.26);
      const z = Math.sqrt(Math.max(0.3025 - x * x, 0)) + 0.035;
      out.push([x, -0.11 - Math.sin(t * Math.PI) * 0.07, z]);
    }
  }
  return out;
}

const DUMMY = new THREE.Object3D();
const GLINT_IDX = [24, 26, 0, 4, 8, 25];

export function CholaCrownArt({ position = [0, 0.65, 23.5] as Vec3, scale = 0.88 }: { position?: Vec3; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const gemsRef = useRef<THREE.InstancedMesh>(null);
  const pearlsRef = useRef<THREE.InstancedMesh>(null);
  const glintRef = useRef<THREE.InstancedMesh>(null);
  const rimRef = useRef<THREE.SpotLight>(null);
  const startRef = useRef(-1);

  const gems = useMemo(() => gemLayout(), []);
  // Soft dark ring where the dais meets the floor.
  const contact = useMemo<ContactSpot[]>(
    () => [{ position: [position[0], 0.012, position[2]], size: [2.3 * scale, 2.3 * scale], opacity: 0.85 }],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const pearls = useMemo(() => pearlLayout(), []);

  const assets = useMemo(() => {
    const body = createCrownBody();
    const pedestal = createPedestal();
    const gemGeo = latheProfile([[0, -0.034], [0.034, 0], [0.025, 0.012], [0, 0.015]], { radialSegments: 8 }).toNonIndexed();
    gemGeo.rotateX(Math.PI / 2);
    gemGeo.computeVertexNormals();
    const pearlGeo = new THREE.SphereGeometry(0.017, 10, 8);
    const glintGeo = mergeParts([
      { geometry: new THREE.PlaneGeometry(0.1, 0.012) },
      { geometry: new THREE.PlaneGeometry(0.012, 0.1) },
    ]);

    const gold = createSurfaceMaterial(
      "bronze",
      { color: "#d9a245", roughness: 0.27, metalness: 1, envMapIntensity: 1.9 },
      { cavity: true, space: "local", scale: 18, tint: "#6b4a1e", tintAmount: 0.25, wearColor: "#f6d488", wearAmount: 0.85, wearRoughness: -0.16, cavityStrength: 0.9 }
    );
    const bronze = createSurfaceMaterial(
      "bronze",
      { color: "#9a6c38", roughness: 0.38, envMapIntensity: 1.7 },
      { cavity: true, space: "local", scale: 10, tintAmount: 0.2, wearColor: "#e2b56a", wearAmount: 0.8, cavityStrength: 0.55 }
    );
    // Lamp-warm bounce in the petal recesses so they read as bronze, not holes.
    bronze.emissive = new THREE.Color("#4a2a10");
    bronze.emissiveIntensity = 0.35;
    const gem = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.04,
      metalness: 0,
      ior: 1.76,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.4,
      flatShading: true,
    });
    // Gems hold some colour in the dark: a little self-light from the instance colour.
    gem.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\n  totalEmissiveRadiance += diffuseColor.rgb * 0.22;"
      );
    };
    gem.customProgramCacheKey = () => "board-gem-v1";
    const pearl = new THREE.MeshPhysicalMaterial({ color: "#f4ead8", roughness: 0.28, metalness: 0, iridescence: 0.5, iridescenceIOR: 1.6, envMapIntensity: 1.3 });
    const glint = new THREE.MeshBasicMaterial({
      color: "#fff1cc",
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const dais = createDais(-position[1] / scale);
    const stone = createSurfaceMaterial("stone", { color: "#5e4433" }, { cavity: true, grimeTo: 0.6 });
    return { body, pedestal, dais, gemGeo, pearlGeo, glintGeo, gold, bronze, stone, gem, pearl, glint };
    // Built once for the mount position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useDisposeOnUnmount(assets);

  useEffect(() => {
    const g = gemsRef.current;
    if (g) {
      const ruby = new THREE.Color("#b3122c");
      const emerald = new THREE.Color("#0f7a52");
      gems.forEach((gem, i) => {
        DUMMY.position.set(...gem.position);
        DUMMY.rotation.set(gem.pitch ?? 0, gem.yaw, 0, "YXZ");
        DUMMY.scale.setScalar(gem.scale);
        DUMMY.updateMatrix();
        g.setMatrixAt(i, DUMMY.matrix);
        g.setColorAt(i, gem.ruby ? ruby : emerald);
      });
      g.instanceMatrix.needsUpdate = true;
      if (g.instanceColor) g.instanceColor.needsUpdate = true;
      g.computeBoundingSphere();
    }
    const p = pearlsRef.current;
    if (p) {
      DUMMY.rotation.set(0, 0, 0);
      DUMMY.scale.setScalar(1);
      pearls.forEach((pos, i) => {
        DUMMY.position.set(...pos);
        DUMMY.updateMatrix();
        p.setMatrixAt(i, DUMMY.matrix);
      });
      p.instanceMatrix.needsUpdate = true;
      p.computeBoundingSphere();
    }
    rimRef.current?.target.position.set(position[0], position[1] + 0.3, position[2]);
    rimRef.current?.target.updateMatrixWorld();
  }, [gems, pearls, assets, position]);

  useFrame(({ clock, camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const t = clock.elapsedTime;
    if (startRef.current < 0) startRef.current = t;
    const spin = spinRef.current;
    if (spin) {
      spin.rotation.y = t * 0.22;
      spin.position.y = Math.sin(t * 1.3) * 0.03;
      spin.rotation.z = Math.sin(t * 0.7) * 0.015;
    }
    // Rim light rises over the first seconds: the reveal.
    if (rimRef.current) {
      const k = Math.min(1, (t - startRef.current) / 2.6);
      rimRef.current.intensity = 70 * k * k * (3 - 2 * k);
    }
    // Sparkles: brief, sharp, only on a few stones.
    const gl = glintRef.current;
    if (gl) {
      GLINT_IDX.forEach((gi, idx) => {
        const gem = gems[gi];
        const s = Math.pow(Math.max(0, Math.sin(t * 1.7 + idx * 2.1)), 12);
        DUMMY.position.set(gem.position[0] * 1.03, gem.position[1], gem.position[2] * 1.03);
        DUMMY.rotation.set(0, gem.yaw, t * 0.6 + idx);
        DUMMY.scale.setScalar(s * gem.scale * 0.9 + 1e-4);
        DUMMY.updateMatrix();
        gl.setMatrixAt(idx, DUMMY.matrix);
      });
      gl.instanceMatrix.needsUpdate = true;
    }
    // Sink as the crane passes overhead so the camera never clips it.
    const group = groupRef.current;
    if (group) {
      const zDiff = camera.position.z - position[2];
      group.position.y = zDiff < 4 && zDiff > -4 ? position[1] - Math.max(0, (2.5 - zDiff) * 0.28) : position[1];
    }
  });

  return (
    <>
      <group ref={groupRef} position={position} scale={scale}>
        <mesh geometry={assets.dais} material={assets.stone} receiveShadow />
        <mesh geometry={assets.pedestal} material={assets.bronze} position={[0, -0.36, 0]} castShadow receiveShadow />
        <group ref={spinRef}>
          <mesh geometry={assets.body} material={assets.gold} castShadow receiveShadow />
          <instancedMesh ref={gemsRef} args={[assets.gemGeo, assets.gem, gems.length]} />
          <instancedMesh ref={pearlsRef} args={[assets.pearlGeo, assets.pearl, pearls.length]} />
          <instancedMesh ref={glintRef} args={[assets.glintGeo, assets.glint, GLINT_IDX.length]} frustumCulled={false} />
        </group>
      </group>
      <ContactShadows spots={contact} softness={0.7} />
      {/* Rim from the far end of the hall (the sanctum glow), separating the crown from the dark.
          A narrow spot, not a directional: a directional glared across the whole polished floor.
          It comes from behind-left so its mirror image in the floor falls outside its own cone;
          aimed straight back at the camera it printed a hot blob in front of the crown. */}
      <spotLight
        ref={rimRef}
        color="#ffc98a"
        intensity={0}
        angle={0.17}
        penumbra={0.6}
        decay={2}
        position={[position[0] - 3, position[1] + 3.3, position[2] - 4]}
      />
    </>
  );
}
