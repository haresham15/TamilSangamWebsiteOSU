"use client";

// The audience as soft layered silhouettes: one instanced draw of upright (cylindrical)
// billboards sampling an eight-pose silhouette atlas (one person per cell). Each instance
// also varies its shoulders and height and may be mirrored, so neighbours never match.
// Near rows are near-black; rows toward the stage pick up lit haze and a backlight rim on
// heads, shoulders and raised hands. 128 BPM bounce on the GPU.
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { seeded } from "@/gl/art/geometry";
import { useDisposeOnUnmount } from "@/gl/dispose";
import type { CrowdSlot } from "./forgeGeometry";

/** Number of pose cells in the atlas (4 × 2 cells of 256 × 512 px). */
export const CROWD_POSES = 8;
const WIDTH = 1.025;
const HEIGHT = 2.05;

/** [upper-arm, forearm] angles in degrees from hanging straight down; >180 crosses inward. */
type Arm = [number, number];
interface Pose {
  left: Arm;
  right: Arm;
  phone?: "left" | "right";
  hair?: "bun" | "cap" | "long";
}
const POSES: Pose[] = [
  { left: [158, 172], right: [162, 168] }, // both arms up, a loose V
  { left: [14, 10], right: [174, 180], hair: "cap" }, // one fist up
  { left: [10, 6], right: [12, 8], hair: "long" }, // standing, watching
  { left: [168, 214], right: [168, 214] }, // clapping above the head
  { left: [18, 34], right: [128, 172], phone: "right", hair: "bun" }, // phone up
  { left: [96, 168], right: [92, 172], hair: "long" }, // hands up by the head
  { left: [148, 158], right: [10, 4], hair: "cap" }, // waving
  { left: [136, 176], right: [70, 150], phone: "left" }, // phone up, other arm bent
];

function paintFigure(ctx: CanvasRenderingContext2D, ox: number, oy: number, pose: Pose, rand: () => number) {
  const cx = ox + 128;
  const base = oy + 512;
  const height = 405 + rand() * 30;
  const headR = 21 + rand() * 4;
  const headY = base - height + headR;
  const shoulderY = headY + headR * 2.0;
  const sw = 44 + rand() * 12;
  const hip = 32 + rand() * 8;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // Head (slightly tall ellipse), neck, hair.
  ctx.beginPath();
  ctx.ellipse(cx, headY, headR * 0.86, headR, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - headR * 0.38, headY + headR * 0.6, headR * 0.76, headR * 0.9);
  if (pose.hair === "bun") {
    ctx.beginPath();
    ctx.arc(cx + headR * 0.2, headY - headR * 1.0, headR * 0.45, 0, Math.PI * 2);
    ctx.fill();
  } else if (pose.hair === "cap") {
    ctx.beginPath();
    ctx.ellipse(cx + headR * 0.55, headY - headR * 0.45, headR * 0.75, headR * 0.18, 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (pose.hair === "long") {
    ctx.beginPath();
    ctx.ellipse(cx, headY + headR * 0.7, headR * 0.95, headR * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Torso: sloped shoulders into a softly tapered body.
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.4, shoulderY - 6);
  ctx.quadraticCurveTo(cx - sw * 0.8, shoulderY - 6, cx - sw, shoulderY + 14);
  ctx.quadraticCurveTo(cx - sw * 1.02, shoulderY + 110, cx - hip, shoulderY + 190);
  ctx.lineTo(cx - hip * 0.9, base);
  ctx.lineTo(cx + hip * 0.9, base);
  ctx.lineTo(cx + hip, shoulderY + 190);
  ctx.quadraticCurveTo(cx + sw * 1.02, shoulderY + 110, cx + sw, shoulderY + 14);
  ctx.quadraticCurveTo(cx + sw * 0.8, shoulderY - 6, cx + headR * 0.4, shoulderY - 6);
  ctx.closePath();
  ctx.fill();
  // Arms as tapered strokes from the shoulder joint.
  const arm = (side: -1 | 1, [ua, fa]: Arm, phone: boolean) => {
    const sx = cx + side * (sw - 8);
    const sy = shoulderY + 12;
    const toDir = (deg: number) => {
      const r = (deg * Math.PI) / 180;
      return [side * Math.sin(r), Math.cos(r)];
    };
    const [ux, uy] = toDir(ua);
    const ex = sx + ux * 72;
    const ey = sy + uy * 72;
    const [fx, fy] = toDir(fa);
    const hx = ex + fx * 66;
    const hy = ey + fy * 66;
    ctx.lineWidth = 19;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(hx + fx * 6, hy + fy * 6, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    if (phone) ctx.fillRect(hx + fx * 10 - 6, hy + fy * 10 - 12, 12, 22);
  };
  arm(-1, pose.left, pose.phone === "left");
  arm(1, pose.right, pose.phone === "right");
}

function featherCell(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  // Clip first: destination-in would otherwise clear every other cell of the atlas.
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalCompositeOperation = "destination-in";
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.8, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** 1024² atlas: eight single figures, 256 × 512 px each. */
function createCrowdAtlas() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const rand = seeded(77);
  POSES.forEach((pose, i) => {
    const ox = (i % 4) * 256;
    const oy = Math.floor(i / 4) * 512;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, 256, 512);
    ctx.clip();
    paintFigure(ctx, ox, oy, pose, rand);
    ctx.restore();
    featherCell(ctx, ox, oy, 256, 512);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createCrowdMaterial(map: THREE.Texture | null, uniforms: Record<string, THREE.IUniform>) {
  const mat = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    map,
    // Soft edges: blended, but still writing depth so haze behind a figure stays behind it.
    // Instances are laid out stage-first, i.e. back to front for the camera.
    transparent: true,
    depthWrite: true,
    alphaTest: 0.02,
    side: THREE.DoubleSide,
    fog: true,
  });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = /* glsl */ `
      attribute vec4 aCrowd; // kind, phase, speed, jump
      attribute vec2 aShape; // width (negative = mirrored), height
      uniform float uTime;
      uniform float uFocus;
      varying float vBlur;
      varying vec2 vCrowdUv;
      varying float vStage;
      varying float vSeed;
    ` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <uv_vertex>",
        /* glsl */ `
        #include <uv_vertex>
        float kind = floor(aCrowd.x + 0.5);
        vec2 cellOrigin = vec2(mod(kind, 4.0) * 0.25, kind < 3.5 ? 0.5 : 0.0);
        vCrowdUv = uv;
        #ifdef USE_MAP
          vMapUv = cellOrigin + uv * vec2(0.25, 0.5);
        #endif
        `
      )
      .replace(
        "#include <project_vertex>",
        /* glsl */ `
        vec3 iPos = (modelMatrix * vec4(instanceMatrix[3].xyz, 1.0)).xyz;
        float s = length(instanceMatrix[1].xyz);
        // 128 BPM: one bounce per beat (|sin| at half the beat frequency), not everyone jumps.
        float hop = abs(sin(uTime * 6.702 * aCrowd.z + aCrowd.y)) * aCrowd.w;
        float sway = sin(uTime * 2.1 + aCrowd.y * 3.0) * 0.03;
        vec3 right = normalize(vec3(viewMatrix[0][0], 0.0, viewMatrix[2][0]));
        vec3 wp = iPos + right * (transformed.x * ${WIDTH.toFixed(3)} * aShape.x + sway) * s + vec3(0.0, (transformed.y * ${HEIGHT.toFixed(2)} * aShape.y + hop) * s, 0.0);
        vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        // 1 at the stage edge, 0 a dozen metres back.
        vStage = exp(-max(length(iPos.xz) - 3.0, 0.0) / 5.5);
        vSeed = fract(aCrowd.y * 7.31);
        // Defocus (mip bias) away from the performer: near rows go soft, like a long lens.
        float depthC = max(-mvPosition.z, 0.5);
        vBlur = clamp(abs(depthC - uFocus) / depthC * 4.0, 0.0, 2.5);
        `
      );
    shader.fragmentShader = /* glsl */ `
      uniform vec3 uRimColor;
      uniform vec3 uHazeColor;
      uniform float uRim;
      varying vec2 vCrowdUv;
      varying float vStage;
      varying float vSeed;
      varying float vBlur;
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      /* glsl */ `
      diffuseColor *= texture2D(map, vMapUv, vBlur);
      diffuseColor.a = smoothstep(0.05, 0.45, diffuseColor.a) * smoothstep(0.0, 0.1, vCrowdUv.y);
      vec2 texel = 2.5 / vec2(textureSize(map, 0));
      float l = texture2D(map, vMapUv - vec2(texel.x, 0.0)).a;
      float r = texture2D(map, vMapUv + vec2(texel.x, 0.0)).a;
      float d = texture2D(map, vMapUv - vec2(0.0, texel.y)).a;
      float u = texture2D(map, vMapUv + vec2(0.0, texel.y)).a;
      vec2 grad = vec2(l - r, d - u);
      // Only upward-facing edges (heads, shoulders, raised hands) catch the backlight.
      float rim = clamp(grad.y * 1.4, 0.0, 1.0) * smoothstep(0.1, 0.6, length(grad));
      vec3 body = vec3(0.004, 0.003, 0.002) * (0.8 + 0.4 * vSeed);
      // Rows near the stage are seen through lit haze: lifted and warmed.
      body += uHazeColor * vStage * vStage * (0.4 + 0.6 * vCrowdUv.y);
      diffuseColor.rgb = body + uRimColor * rim * uRim * vStage * vStage * (1.0 - clamp(vBlur * 0.3, 0.0, 0.8));
      `
    );
  };
  mat.customProgramCacheKey = () => "forge-crowd-v3";
  return mat;
}

export function ArenaCrowd({ slots, rimStrength = 1 }: { slots: CrowdSlot[]; rimStrength?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRimColor: { value: new THREE.Color(1.3, 0.52, 0.16) },
      uHazeColor: { value: new THREE.Color(0.06, 0.024, 0.008) },
      uFocus: { value: 12 },
      uRim: { value: rimStrength },
    }),
    [rimStrength]
  );

  const { atlas, geometry, material } = useMemo(() => {
    const atlas = createCrowdAtlas();
    const geometry = new THREE.PlaneGeometry(1, 1);
    geometry.translate(0, 0.5, 0);
    const data = new Float32Array(slots.length * 4);
    const shape = new Float32Array(slots.length * 2);
    const rand = seeded(311);
    slots.forEach((s, i) => {
      const jumps = rand() < 0.45;
      data.set([s.kind % CROWD_POSES, s.phase, s.speed, jumps ? 0.06 + rand() * 0.12 : 0.012], i * 4);
      shape.set([(0.86 + rand() * 0.3) * (rand() < 0.5 ? -1 : 1), 0.9 + rand() * 0.18], i * 2);
    });
    geometry.setAttribute("aCrowd", new THREE.InstancedBufferAttribute(data, 4));
    geometry.setAttribute("aShape", new THREE.InstancedBufferAttribute(shape, 2));
    const material = createCrowdMaterial(atlas, uniforms);
    return { atlas, geometry, material };
  }, [slots, uniforms]);
  useDisposeOnUnmount(atlas, geometry, material);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    slots.forEach((s, i) => {
      m.makeScale(s.scale, s.scale, s.scale).setPosition(s.x, 0, s.z);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [slots]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += dt;
    uniforms.uFocus.value = state.camera.position.length();
  });

  return <instancedMesh ref={ref} args={[geometry, material, slots.length]} frustumCulled={false} renderOrder={2} />;
}
