"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CURRENT_BOARD, type BoardMember } from "@/data/board";
import { useBoardHeroStore } from "@/store/boardHeroStore";
import { createHeroKineticsTracker } from "@/lib/heroKinetics";
import { applyInstanceTransforms, latheProfile, mergeParts, type Vec3 } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";
import { createSurfaceMaterial } from "@/gl/art/surface";
import { useDisposeOnUnmount } from "@/gl/dispose";
import { noise1D } from "./noise";
import { AISLE_WIDTH, POOL_SIZE, UNIT_LENGTH, segmentZ } from "./corridorLayout";
import { withLampLight, type LampLightUniforms } from "./boardArt";

/**
 * Art-pass silk banners (pattu thongal). All seven banners are ONE instanced cloth draw
 * (portraits packed into one atlas) plus ONE instanced brass hanger draw, instead of seven
 * cloth meshes and three trim batches.
 *
 * The cloth hangs from two cords: it bellies between them, falls into folds that deepen
 * toward a weighted zari hem, and the hem swings as a unit rather than rippling. Normals
 * are re-derived from the displacement so the sheen follows the folds. The fringe is real
 * geometry silhouette (alpha-tested), not a painted line.
 */

const COLS = 4;
const ROWS = 2;
const SLOT_W = 448;
const SLOT_H = 784; // 1.2 m × 2.1 m cloth
const CLOTH_W = 1.2;
const CLOTH_H = 2.1;
const BANNER_Y = 2.45;
/** Joist underside (PILLAR_HEIGHT − 0.1 − 0.175) relative to the banner centre. */
const HOOK_Y = 4.2 - 0.1 - 0.175 - BANNER_Y;

interface BannerPlacement {
  member: BoardMember;
  position: Vec3;
  rotation: Vec3;
  phase: number;
}

/** Same members, sides and positions as the legacy per-banner TapestryPortrait layout. */
function bannerPlacements(): BannerPlacement[] {
  return Array.from({ length: POOL_SIZE }, (_, unit) => {
    const isLeft = unit % 2 === 0;
    const member = CURRENT_BOARD[(unit * 2 + (isLeft ? 0 : 1)) % CURRENT_BOARD.length];
    // Hung from the joist above the pillar line, high enough that the lamps sit below the hem.
    const x = isLeft ? -AISLE_WIDTH / 2 + 0.15 : AISLE_WIDTH / 2 - 0.15;
    const z = segmentZ(unit) - 1.8;
    return {
      member,
      position: [x, BANNER_Y, z] as Vec3,
      rotation: [0, isLeft ? 0.15 : -0.15, 0] as Vec3,
      phase: (isLeft ? 1.4 : 5.8) + z * 0.2,
    };
  });
}

// ---------------------------------------------------------------------------
// Atlas painting
// ---------------------------------------------------------------------------

interface Fonts {
  display: string;
  caps: string;
  tamil: string;
}

function readFonts(): Fonts {
  const root = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => root.getPropertyValue(name).trim() || fallback;
  return {
    display: v("--font-prata", "Georgia, serif"),
    caps: v("--font-marcellus", "Georgia, serif"),
    tamil: v("--font-mukta-malar", "sans-serif"),
  };
}

const ZARI_DARK = "#7a5418";
const ZARI = "#c99a3e";
const ZARI_LIGHT = "#f0cf86";

function zariBand(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, ZARI_DARK);
  g.addColorStop(0.35, ZARI_LIGHT);
  g.addColorStop(0.6, ZARI);
  g.addColorStop(1, ZARI_DARK);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

/** Kanchipuram "temple border": a row of gopuram triangles in zari on the silk ground. */
function templeBorder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, up: boolean) {
  const step = h * 0.9;
  ctx.fillStyle = ZARI;
  for (let tx = x; tx < x + w - 1; tx += step) {
    ctx.beginPath();
    if (up) {
      ctx.moveTo(tx, y + h);
      ctx.lineTo(tx + step / 2, y);
      ctx.lineTo(tx + step, y + h);
    } else {
      ctx.moveTo(tx, y);
      ctx.lineTo(tx + step / 2, y + h);
      ctx.lineTo(tx + step, y);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "rgba(90, 14, 24, 0.9)";
  for (let tx = x; tx < x + w - 1; tx += step) {
    const cy = up ? y + h * 0.62 : y + h * 0.38;
    ctx.beginPath();
    ctx.arc(tx + step / 2, cy, h * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
}

function lotusRosette(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 12; i++) {
    ctx.rotate((Math.PI * 2) / 12);
    ctx.beginPath();
    ctx.moveTo(0, r * 0.32);
    ctx.quadraticCurveTo(r * 0.2, r * 0.66, 0, r);
    ctx.quadraticCurveTo(-r * 0.2, r * 0.66, 0, r * 0.32);
    ctx.fill();
  }
  ctx.restore();
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: string, size: number, family: string, maxW: number, min: number) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxW && s > min) {
    s -= 1;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

function paintBanner(ctx: CanvasRenderingContext2D, ox: number, oy: number, m: BoardMember, f: Fonts) {
  const W = SLOT_W;
  const H = SLOT_H;
  const fringe = 46; // transparent tassel zone at the bottom
  const clothH = H - fringe;
  ctx.save();
  ctx.translate(ox, oy);
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();

  // Silk ground: deep kumkum red, shot with a darker weft toward the edges.
  const ground = ctx.createLinearGradient(0, 0, W, 0);
  ground.addColorStop(0, "#4c0a15");
  ground.addColorStop(0.5, "#7a1624");
  ground.addColorStop(1, "#4c0a15");
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, W, clothH);
  const fall = ctx.createLinearGradient(0, 0, 0, clothH);
  fall.addColorStop(0, "rgba(20, 2, 6, 0.35)");
  fall.addColorStop(0.25, "rgba(20, 2, 6, 0)");
  fall.addColorStop(1, "rgba(20, 2, 6, 0.25)");
  ctx.fillStyle = fall;
  ctx.fillRect(0, 0, W, clothH);

  // Weave: warp and weft at thread scale.
  ctx.fillStyle = "rgba(255, 210, 190, 0.035)";
  for (let x = 0; x < W; x += 2) ctx.fillRect(x, 0, 1, clothH);
  ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
  for (let y = 0; y < clothH; y += 2) ctx.fillRect(0, y, W, 1);

  // Zari side borders with a small butta repeat.
  const side = 26;
  zariBand(ctx, 10, 0, side, clothH);
  zariBand(ctx, W - 10 - side, 0, side, clothH);
  ctx.fillStyle = "rgba(90, 14, 24, 0.85)";
  for (let y = 14; y < clothH - 70; y += 22) {
    for (const x of [10 + side / 2, W - 10 - side / 2]) {
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x + 5, y);
      ctx.lineTo(x, y + 6);
      ctx.lineTo(x - 5, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Top: zari band and a downward temple border.
  zariBand(ctx, 0, 0, W, 16);
  templeBorder(ctx, 36, 16, W - 72, 22, false);

  // Header (existing copy): Tamil assembly name, English committee label, term.
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = ZARI_LIGHT;
  ctx.font = `600 22px ${f.tamil}`;
  ctx.fillText("சோழர் அவை", W / 2, 80);
  ctx.fillStyle = "rgba(246, 222, 160, 0.97)";
  ctx.font = `400 14px ${f.caps}`;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "3px";
  ctx.fillText("EXECUTIVE COMMITTEE", W / 2, 102);
  ctx.font = `400 12px ${f.caps}`;
  ctx.fillStyle = "rgba(246, 222, 160, 0.9)";
  ctx.fillText(`OHIO STATE · ${m.term}`, W / 2, 120);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";

  // Medallion: beaded zari ring, lotus rosette, the member's initial.
  const cx = W / 2;
  const cy = 236;
  const r = 90;
  const med = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy, r);
  med.addColorStop(0, "#5a0f1a");
  med.addColorStop(1, "#2a0409");
  ctx.fillStyle = med;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = ZARI;
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = ZARI_LIGHT;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = ZARI_LIGHT;
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * (r + 9), cy + Math.sin(a) * (r + 9), 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(201, 154, 62, 0.28)";
  lotusRosette(ctx, cx, cy, r - 14);
  ctx.fillStyle = ZARI_LIGHT;
  ctx.textBaseline = "middle";
  ctx.font = `400 80px ${f.display}`;
  ctx.fillText(m.nameEn.charAt(0), cx, cy + 6);
  ctx.textBaseline = "alphabetic";

  // Names and role (member data as given; Tamil never letter-spaced or case-transformed).
  ctx.fillStyle = "#fff3dc";
  fitFont(ctx, m.nameEn, "400", 42, f.display, W - 84, 24);
  ctx.fillText(m.nameEn, W / 2, 396);
  ctx.fillStyle = ZARI_LIGHT;
  fitFont(ctx, m.nameTa, "700", 34, f.tamil, W - 84, 20);
  ctx.fillText(m.nameTa, W / 2, 446);

  ctx.strokeStyle = "rgba(240, 207, 134, 0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 70, 472);
  ctx.lineTo(W / 2 + 70, 472);
  ctx.stroke();

  ctx.fillStyle = "#f6e2b6";
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "2px";
  fitFont(ctx, m.roleEn.toUpperCase(), "400", 19, f.caps, W - 96, 12);
  ctx.fillText(m.roleEn.toUpperCase(), W / 2, 504);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  ctx.fillStyle = "#f8e6bc";
  fitFont(ctx, m.roleTa, "600", 23, f.tamil, W - 96, 14);
  ctx.fillText(m.roleTa, W / 2, 540);

  ctx.fillStyle = "rgba(252, 240, 214, 0.95)";
  ctx.font = `400 17px ${f.caps}`;
  const words = m.committeeEn.split(" ");
  if (words.length > 3) {
    ctx.fillText(words.slice(0, 3).join(" "), W / 2, 580);
    ctx.fillText(words.slice(3).join(" "), W / 2, 602);
  } else {
    ctx.fillText(m.committeeEn, W / 2, 590);
  }

  // Weighted hem: a broad zari pallu band with an upward temple border.
  templeBorder(ctx, 36, clothH - 92, W - 72, 22, true);
  zariBand(ctx, 0, clothH - 70, W, 58);
  ctx.fillStyle = "rgba(90, 14, 24, 0.8)";
  for (let x = 18; x < W; x += 28) {
    ctx.beginPath();
    ctx.arc(x, clothH - 41, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = ZARI_LIGHT;
  ctx.fillRect(0, clothH - 52, W, 2);
  ctx.fillRect(0, clothH - 31, W, 2);
  ctx.fillStyle = "#3a0910";
  ctx.fillRect(0, clothH - 12, W, 12);

  // Tassel fringe below the hem (alpha-tested in the material).
  for (let x = 8; x < W - 4; x += 16) {
    const len = fringe - 10 - ((x * 7) % 9);
    const g = ctx.createLinearGradient(0, clothH, 0, clothH + len);
    g.addColorStop(0, ZARI);
    g.addColorStop(1, ZARI_DARK);
    ctx.fillStyle = g;
    ctx.fillRect(x - 2.5, clothH, 5, len);
    ctx.beginPath();
    ctx.arc(x, clothH + len, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = ZARI_LIGHT;
    ctx.fill();
  }
  ctx.restore();
}

function paintAtlas(canvas: HTMLCanvasElement, placements: BannerPlacement[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const fonts = readFonts();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  placements.forEach((b, i) => paintBanner(ctx, (i % COLS) * SLOT_W, Math.floor(i / COLS) * SLOT_H, b.member, fonts));
}

// ---------------------------------------------------------------------------
// Cloth shader patch (vertex drape + derived normals + atlas lookup)
// ---------------------------------------------------------------------------

const CLOTH_VERT_PARS = /* glsl */ `
  attribute vec2 aSlot;
  attribute float aPhase;
  uniform vec2 uSlotScale;
  uniform float uClothTime;
  uniform float uGust;
  uniform float uScrollVel;
  vec3 boardCloth(vec2 p) {
    float v = clamp((${(CLOTH_H / 2).toFixed(3)} - p.y) / ${CLOTH_H.toFixed(3)}, 0.0, 1.0); // 0 top → 1 hem
    float x = p.x / ${(CLOTH_W / 2).toFixed(3)};
    float pin = pow(v, 1.35);
    float hem = smoothstep(0.82, 1.0, v);
    // Static drape: belly between the two cords, folds that open toward the hem.
    float folds = sin(x * 7.2 + 0.7) * 0.016 * smoothstep(0.0, 0.55, v) + sin(x * 15.0 + 2.1) * 0.004 * v;
    float belly = (1.0 - x * x) * 0.035 * v;
    // Breeze ripple (PRD §3.1 wave), damped near the weighted hem, which swings as a unit.
    float ripple = sin(v * 4.5 - uClothTime * 2.1 + aPhase) * 0.045 + cos(x * 1.8 + uClothTime * 1.4) * 0.012;
    float swing = sin(uClothTime * 1.1 + aPhase) * 0.03 + uScrollVel * 0.06;
    float dz = folds + belly + (ripple * (1.0 - 0.6 * hem) + swing * hem) * pin * uGust;
    float dx = sin(uClothTime * 1.2 + aPhase) * 0.02 * pin;
    return vec3(dx, 0.0, dz);
  }
`;

function withClothPatch(material: THREE.MeshStandardMaterial, uniforms: Record<string, { value: unknown }>) {
  const previous = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${CLOTH_VERT_PARS}`)
      .replace(
        "#include <uv_vertex>",
        `#include <uv_vertex>\n#ifdef USE_MAP\n  vMapUv = vMapUv * uSlotScale + aSlot;\n#endif`
      )
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
        {
          float e = 0.012;
          float zx = boardCloth(position.xy + vec2(e, 0.0)).z - boardCloth(position.xy - vec2(e, 0.0)).z;
          float zy = boardCloth(position.xy + vec2(0.0, e)).z - boardCloth(position.xy - vec2(0.0, e)).z;
          objectNormal = normalize(vec3(-zx / (2.0 * e), -zy / (2.0 * e), 1.0));
        }`
      )
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n  transformed += boardCloth(position.xy);`);
  };
  material.customProgramCacheKey = () => `${previousKey}|board-cloth-v1`;
  material.needsUpdate = true;
  return material;
}

// ---------------------------------------------------------------------------

export function TapestryBanners({ lampLight }: { lampLight: LampLightUniforms }) {
  const placements = useMemo(() => bannerPlacements(), []);
  const clothRef = useRef<THREE.InstancedMesh>(null);
  const hangerRef = useRef<THREE.InstancedMesh>(null);
  const kinetics = useRef(createHeroKineticsTracker(7.5, 5.0, 4.0));

  const atlas = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = COLS * SLOT_W;
    canvas.height = ROWS * SLOT_H;
    paintAtlas(canvas, placements);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    return { canvas, texture };
  }, [placements]);

  // Repaint once the page fonts are ready so names render in Prata / Mukta Malar, not a fallback.
  useEffect(() => {
    let alive = true;
    const f = readFonts();
    Promise.all([
      document.fonts.load(`400 30px ${f.display}`),
      document.fonts.load(`700 25px ${f.tamil}`, "அ"),
      document.fonts.load(`400 15px ${f.caps}`),
    ])
      .then(() => {
        if (!alive) return;
        paintAtlas(atlas.canvas, placements);
        atlas.texture.needsUpdate = true;
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [atlas, placements]);

  const clothUniforms = useMemo(
    () => ({
      uSlotScale: { value: new THREE.Vector2(1 / COLS, 1 / ROWS) },
      uClothTime: { value: 0 },
      uGust: { value: 0.3 },
      uScrollVel: { value: 0 },
    }),
    []
  );

  const cloth = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(CLOTH_W, CLOTH_H, 24, 42);
    const slots = new Float32Array(placements.length * 2);
    placements.forEach((_, i) => {
      slots[i * 2] = (i % COLS) / COLS;
      slots[i * 2 + 1] = 1 - (Math.floor(i / COLS) + 1) / ROWS; // canvas rows run top-down; uv v runs bottom-up
    });
    geometry.setAttribute("aSlot", new THREE.InstancedBufferAttribute(slots, 2));
    geometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(new Float32Array(placements.map((p) => p.phase)), 1));
    const material = createSurfaceMaterial(
      "silk",
      { map: atlas.texture, color: "#ffffff", roughness: 0.5, sheen: 1, sheenRoughness: 0.38, sheenColor: "#ffbf80", alphaTest: 0.5 },
      { space: "local", scale: 70, albedoVariation: 0.06, roughnessVariation: 0.1, bump: 0.0003 }
    );
    withClothPatch(material, clothUniforms);
    withLampLight(material, lampLight, { z0: segmentZ(0), step: UNIT_LENGTH });
    return { geometry, material };
  }, [placements, atlas, clothUniforms, lampLight]);

  const hanger = useMemo(() => {
    // Turned brass rod with bud finials, and two cords up to the corbel.
    const rod = latheProfile(
      [
        [0, -0.78], [0.02, -0.772], [0.034, -0.75], [0.024, -0.728], [0.03, -0.712], [0.018, -0.69], [0.016, 0.69],
        [0.03, 0.712], [0.024, 0.728], [0.034, 0.75], [0.02, 0.772], [0, 0.78],
      ],
      { radialSegments: 12 }
    );
    rod.rotateZ(Math.PI / 2);
    const cord = (x: number) =>
      new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(x, 1.08, 0), new THREE.Vector3(0, HOOK_Y - 0.05, 0)), 1, 0.007, 6);
    const hook = latheProfile([[0, 0], [0.03, 0], [0.034, 0.012], [0.02, 0.03], [0.012, 0.06], [0, 0.06]], { radialSegments: 12 });
    const geometry = bakeVertexAO(
      mergeParts([
        { geometry: rod, position: [0, 1.08, 0] },
        { geometry: cord(-0.5) },
        { geometry: cord(0.5) },
        { geometry: hook, position: [0, HOOK_Y - 0.06, 0] },
      ]),
      { cavity: 1, edges: 1 }
    );
    const material = createSurfaceMaterial("agedBrass", {}, { cavity: true, space: "local" });
    return { geometry, material };
  }, []);
  useDisposeOnUnmount(atlas.texture, cloth.geometry, cloth.material, hanger.geometry, hanger.material);

  useEffect(() => {
    if (clothRef.current) applyInstanceTransforms(clothRef.current, placements);
    if (hangerRef.current) applyInstanceTransforms(hangerRef.current, placements);
  }, [placements, cloth, hanger]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0) return;
    const time = clock.elapsedTime;
    const k = kinetics.current.update(useBoardHeroStore.getState().scrollProgress, undefined, dt);
    clothUniforms.uClothTime.value = time;
    clothUniforms.uScrollVel.value = k.smoothVelocity;
    clothUniforms.uGust.value = Math.max(0.1, 0.32 + 0.25 * noise1D(time * 0.15 + 1.4));
  });

  return (
    <group>
      <instancedMesh
        ref={clothRef}
        args={[cloth.geometry, cloth.material, placements.length]}
        receiveShadow
        frustumCulled={false}
      />
      <instancedMesh ref={hangerRef} args={[hanger.geometry, hanger.material, placements.length]} />
    </group>
  );
}
