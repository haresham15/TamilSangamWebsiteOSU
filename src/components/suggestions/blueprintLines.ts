// Screen-space, anti-aliased, variable-weight linework for the blueprint hero.
//
// GL_LINES are always 1px and alias. Here every segment is one instance of a quad that the
// vertex shader expands perpendicular to the projected segment, so pen weight is set in CSS
// pixels and stays constant at any distance (like a technical pen), and the fragment shader
// feathers the edge for coverage AA. All linework in the scene is one instanced draw; the
// hidden-line pass reuses the same buffers for its first `hiddenCount` instances.
import * as THREE from "three";

type Vec3 = [number, number, number];

/** How a segment is inked. Order matters to the shader. */
export const LINE_KIND = {
  construction: 0,
  structure: 1,
  silhouette: 2,
  pipe: 3,
  pin: 4,
} as const;
export type LineKind = (typeof LINE_KIND)[keyof typeof LINE_KIND];

/** Pen width in CSS pixels per kind (multiplied by device pixel ratio in the shader). */
export const PEN_WIDTH: Record<LineKind, number> = {
  0: 0.7,
  1: 1.15,
  2: 2.0,
  3: 1.5,
  4: 1.25,
};

/**
 * Draw priority. Tier: 0 = also drawn dashed when hidden, and always drawn; 1 = drawn unless
 * the scene is cut down to its essentials; 2 = construction detail (Tier A only).
 */
export type LinePriority = 0 | 1 | 2;

export interface LineBatch {
  a: Float32Array;
  b: Float32Array;
  /** width px, kind, tone, seed */
  style: Float32Array;
  count: number;
  /** Instances [0, hiddenCount) also render in the dashed hidden-line pass. */
  hiddenCount: number;
  /** Instances [0, essentialCount) are kept when construction detail is dropped. */
  essentialCount: number;
}

interface Item {
  a: Vec3;
  b: Vec3;
  kind: LineKind;
  tone: number;
  priority: LinePriority;
}

export class LineBatchBuilder {
  private items: Item[] = [];

  add(a: Vec3, b: Vec3, kind: LineKind, tone = 0, priority: LinePriority = 1) {
    this.items.push({ a, b, kind, tone, priority });
    return this;
  }

  /** Closed polyline circle in the XZ plane (pipe junctions, survey marks). */
  circle(center: Vec3, radius: number, kind: LineKind, tone = 0, priority: LinePriority = 0, segments = 20) {
    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = ((i + 1) / segments) * Math.PI * 2;
      this.add(
        [center[0] + Math.cos(a0) * radius, center[1], center[2] + Math.sin(a0) * radius],
        [center[0] + Math.cos(a1) * radius, center[1], center[2] + Math.sin(a1) * radius],
        kind,
        tone,
        priority
      );
    }
    return this;
  }

  get size() {
    return this.items.length;
  }

  build(seed = 1): LineBatch {
    // Stable sort by priority so each tier is a prefix of the instance buffer.
    const sorted = this.items.map((item, i) => ({ item, i })).sort((x, y) => x.item.priority - y.item.priority || x.i - y.i);
    const count = sorted.length;
    const a = new Float32Array(count * 3);
    const b = new Float32Array(count * 3);
    const style = new Float32Array(count * 4);
    let s = seed >>> 0;
    const rand = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    let hiddenCount = 0;
    let essentialCount = 0;
    sorted.forEach(({ item }, i) => {
      a.set(item.a, i * 3);
      b.set(item.b, i * 3);
      style.set([PEN_WIDTH[item.kind], item.kind, item.tone, rand()], i * 4);
      if (item.priority === 0) hiddenCount = i + 1;
      if (item.priority <= 1) essentialCount = i + 1;
    });
    return { a, b, style, count, hiddenCount, essentialCount };
  }
}

/**
 * One InstancedBufferGeometry for the visible pass and one for the hidden pass, sharing the
 * same GPU buffers (three uploads an attribute once however many geometries use it).
 */
export function createLineGeometries(batch: LineBatch) {
  const quad = new THREE.BufferAttribute(new Float32Array([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0]), 3);
  const index = new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 0, 3, 2]), 1);
  const aA = new THREE.InstancedBufferAttribute(batch.a, 3);
  const aB = new THREE.InstancedBufferAttribute(batch.b, 3);
  const aStyle = new THREE.InstancedBufferAttribute(batch.style, 4);
  const make = (instanceCount: number) => {
    const g = new THREE.InstancedBufferGeometry();
    g.setIndex(index);
    g.setAttribute("position", quad);
    g.setAttribute("aA", aA);
    g.setAttribute("aB", aB);
    g.setAttribute("aStyle", aStyle);
    g.instanceCount = instanceCount;
    return g;
  };
  return { visible: make(batch.count), hidden: make(batch.hiddenCount) };
}

export interface LineUniforms {
  [name: string]: THREE.IUniform;
  uRes: THREE.IUniform<THREE.Vector2>;
  uPixelRatio: THREE.IUniform<number>;
  uScanZ: THREE.IUniform<number>;
  uTime: THREE.IUniform<number>;
  /** Camera-to-subject distance: depth fade is measured from here. */
  uFocus: THREE.IUniform<number>;
  /** Lamp pool on the table: xz centre, radius. */
  uLamp: THREE.IUniform<THREE.Vector3>;
  uPinReveal: THREE.IUniform<THREE.Vector3>;
  uPinHover: THREE.IUniform<THREE.Vector3>;
  uInk: THREE.IUniform<THREE.Color>;
  uInkSoft: THREE.IUniform<THREE.Color>;
  uPencil: THREE.IUniform<THREE.Color>;
  uField: THREE.IUniform<THREE.Color>;
  uBrass: THREE.IUniform<THREE.Color>;
  uWater: THREE.IUniform<THREE.Color>;
  uMint: THREE.IUniform<THREE.Color>;
  uHot: THREE.IUniform<THREE.Color>;
}

export interface LinePalette {
  ink: THREE.ColorRepresentation;
  inkSoft: THREE.ColorRepresentation;
  pencil: THREE.ColorRepresentation;
  field: THREE.ColorRepresentation;
  brass: THREE.ColorRepresentation;
  water: THREE.ColorRepresentation;
  mint: THREE.ColorRepresentation;
  /** Scan-front ignition colour; values above 1 bloom under the grade. */
  hot: THREE.ColorRepresentation;
  hotIntensity: number;
}

export function createLineUniforms(p: LinePalette): LineUniforms {
  return {
    uRes: { value: new THREE.Vector2(1, 1) },
    uPixelRatio: { value: 1 },
    uScanZ: { value: -20 },
    uTime: { value: 0 },
    uFocus: { value: 25 },
    uLamp: { value: new THREE.Vector3(0, 0, 14) },
    uPinReveal: { value: new THREE.Vector3() },
    uPinHover: { value: new THREE.Vector3() },
    uInk: { value: new THREE.Color(p.ink) },
    uInkSoft: { value: new THREE.Color(p.inkSoft) },
    uPencil: { value: new THREE.Color(p.pencil) },
    uField: { value: new THREE.Color(p.field) },
    uBrass: { value: new THREE.Color(p.brass) },
    uWater: { value: new THREE.Color(p.water) },
    uMint: { value: new THREE.Color(p.mint) },
    uHot: { value: new THREE.Color(p.hot).multiplyScalar(p.hotIntensity) },
  };
}

const LINE_VERT = /* glsl */ `
  attribute vec3 aA;
  attribute vec3 aB;
  attribute vec4 aStyle; // width px, kind, tone, seed
  uniform vec2 uRes;
  uniform float uPixelRatio;
  varying float vSide;
  varying float vAlong;
  varying vec3 vWorld;
  varying float vDepth;
  varying vec4 vStyle;

  void main() {
    vec4 wa = modelMatrix * vec4(aA, 1.0);
    vec4 wb = modelMatrix * vec4(aB, 1.0);
    vec4 ca = projectionMatrix * viewMatrix * wa;
    vec4 cb = projectionMatrix * viewMatrix * wb;
    vec2 halfRes = uRes * 0.5;
    vec2 sa = ca.xy / max(ca.w, 1e-4) * halfRes;
    vec2 sb = cb.xy / max(cb.w, 1e-4) * halfRes;
    vec2 d = sb - sa;
    float len = length(d);
    vec2 dir = len > 1e-4 ? d / len : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);

    float t = position.y;
    float side = position.x;
    // Widest the fragment shader may ask for, plus 1px of feather each side.
    float drawHalf = max(aStyle.x * uPixelRatio, 1.0) * 0.5 + 1.0;
    vec4 c = t < 0.5 ? ca : cb;
    vec2 offPx = nrm * side * drawHalf + dir * (t * 2.0 - 1.0);
    c.xy += offPx / halfRes * c.w;
    gl_Position = c;

    vSide = side * drawHalf;
    vAlong = t * length(wb.xyz - wa.xyz);
    // Locals only: reading back a varying written in this shader breaks the draw on ANGLE/D3D.
    vec3 world = t < 0.5 ? wa.xyz : wb.xyz;
    vWorld = world;
    vDepth = -(viewMatrix * vec4(world, 1.0)).z;
    vStyle = aStyle;
  }
`;

const LINE_FRAG = /* glsl */ `
  uniform float uPixelRatio;
  uniform float uScanZ;
  uniform float uTime;
  uniform float uFocus;
  uniform vec3 uLamp;
  uniform vec3 uPinReveal;
  uniform vec3 uPinHover;
  uniform vec3 uInk;
  uniform vec3 uInkSoft;
  uniform vec3 uPencil;
  uniform vec3 uField;
  uniform vec3 uBrass;
  uniform vec3 uWater;
  uniform vec3 uMint;
  uniform vec3 uHot;
  varying float vSide;
  varying float vAlong;
  varying vec3 vWorld;
  varying float vDepth;
  varying vec4 vStyle;

  float pick(vec3 v, float i) { return i < 0.5 ? v.x : (i < 1.5 ? v.y : v.z); }

  void main() {
    float kind = vStyle.y;
    float tone = vStyle.z;
    float seed = vStyle.w;

    // Scan wave travels north to south. Behind it the drawing is inked;
    // ahead of it only the pencil underdrawing exists.
    // Same wavefront as the paper: a circle growing from the north end of the table.
    float dz = distance(vWorld.xz, vec2(0.0, -16.0)) - 16.0 - uScanZ;
    float inked = 1.0 - smoothstep(-0.1, 0.3, dz);
    float front = exp(-dz * dz / (2.0 * 1.2 * 1.2));
    float edge = exp(-dz * dz / (2.0 * 0.16 * 0.16));

    vec3 ink;
    float inkA;
    if (kind < 0.5) { ink = uInkSoft; inkA = 0.4; }
    else if (kind < 1.5) { ink = mix(uInkSoft, uInk, 0.5); inkA = 0.7; }
    else if (kind < 2.5) { ink = uInk; inkA = 0.95; }
    else if (kind < 3.5) { ink = uWater; inkA = 0.8; inked = 1.0; }
    else { ink = uMint; inkA = 0.95; inked = 1.0; }
    if (kind < 2.5) {
      if (tone < 0.5) ink = mix(ink, uField, 0.6);
      else if (abs(tone - 4.0) < 0.5) ink = mix(ink, uBrass, 0.55);
    }

    // Pen weight: the pencil underdrawing is thinner than the ink.
    float widthPx = vStyle.x * uPixelRatio * mix(0.6, 1.0, inked);
    float hw = max(widthPx, 1.0) * 0.5;
    float cover = (1.0 - smoothstep(hw - 0.5, hw + 0.5, abs(vSide))) * min(widthPx, 1.0);

    vec3 col = mix(uPencil, ink, inked);
    float alpha = mix(0.2, inkA, inked) * (0.86 + 0.14 * seed);

    #ifndef HIDDEN
      if (kind < 2.5) {
        col += uHot * (front * 0.25 + edge);
        alpha = max(alpha, edge * 0.95);
      }
    #endif

    if (kind > 2.5 && kind < 3.5) {
      // Pipe centreline convention (long dash, dot), flowing slowly.
      float u = fract((vAlong - uTime * 0.3) / 0.9);
      alpha *= step(u, 0.58) + step(0.7, u) * step(u, 0.76);
    }
    if (kind > 3.5) {
      alpha *= pick(uPinReveal, tone);
      col = mix(col, vec3(1.0), pick(uPinHover, tone) * 0.45);
    }

    // Light falls off away from the lamp; far lines recede into the paper.
    float pool = 1.0 - smoothstep(uLamp.z * 0.25, uLamp.z, distance(vWorld.xz, uLamp.xy));
    col *= mix(0.38, 1.05, pool);
    alpha *= mix(0.55, 1.0, pool);
    alpha *= 1.0 - 0.6 * smoothstep(uFocus - 4.0, uFocus + 16.0, vDepth);

    #ifdef HIDDEN
      // Hidden edges: short dashes, faint, as on a drawing.
      alpha *= step(fract(vAlong / 0.3), 0.5) * 0.3;
      col = mix(uPencil, col, 0.6);
    #endif

    gl_FragColor = vec4(col, cover * alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Visible pass (depth-tested against the card model) or hidden pass (only where occluded). */
export function createLineMaterial(uniforms: LineUniforms, hidden: boolean) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: LINE_VERT,
    fragmentShader: LINE_FRAG,
    defines: hidden ? { HIDDEN: "" } : {},
    transparent: true,
    depthWrite: false,
    depthTest: true,
    depthFunc: hidden ? THREE.GreaterDepth : THREE.LessEqualDepth,
  });
}

const VIEWPORT = new THREE.Vector4();

/**
 * Pen widths are in pixels, so the shader needs the size of the viewport it is drawn into.
 * That is only known at draw time: drei's View scissors a region of the shared canvas and
 * the grade pass may render into a scaled target. Reads it just before the draw call.
 */
export function bindViewportResolution(mesh: THREE.Mesh | null, uniforms: LineUniforms) {
  if (!mesh) return;
  mesh.onBeforeRender = (renderer) => {
    renderer.getCurrentViewport(VIEWPORT);
    if (VIEWPORT.z > 0 && VIEWPORT.w > 0) uniforms.uRes.value.set(VIEWPORT.z, VIEWPORT.w);
    uniforms.uPixelRatio.value = renderer.getPixelRatio();
  };
}
