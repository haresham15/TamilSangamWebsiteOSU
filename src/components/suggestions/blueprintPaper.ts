// Paper surfaces for the blueprint hero, as patches on MeshStandardMaterial so the lamp,
// shadows, fog and the grade keep working:
//   sheet  - the drawing sheet: fibre and mottling, an anti-aliased minor/major grid that
//            fades out before it can moiré, a double border rule, and the scan wave, which
//            lights a band of the paper and leaves a glossy trail that catches the lamp.
//   vellum - translucent tracing overlay with its own finer grid.
//   card   - the white-card stadium model: plain mottled board lit by the scan band.
//   table  - the dark drafting table under everything.
import * as THREE from "three";

export type PaperKind = "sheet" | "vellum" | "card" | "table";

export interface PaperUniforms {
  [name: string]: THREE.IUniform;
  uScanZ: THREE.IUniform<number>;
  uScanColor: THREE.IUniform<THREE.Color>;
  uGridColor: THREE.IUniform<THREE.Color>;
  /** Lamp pool on the table (xz centre, radius): grid ink recedes outside it. */
  uPool: THREE.IUniform<THREE.Vector3>;
  /** Lamp tint for the card's edge highlight. */
  uLampColor: THREE.IUniform<THREE.Color>;
}

export function createPaperUniforms(scanColor: THREE.ColorRepresentation, gridColor: THREE.ColorRepresentation): PaperUniforms {
  return {
    uScanZ: { value: -20 },
    uScanColor: { value: new THREE.Color(scanColor) },
    uGridColor: { value: new THREE.Color(gridColor) },
    uPool: { value: new THREE.Vector3(0, 0, 14) },
    uLampColor: { value: new THREE.Color("#ffbd6e") },
  };
}

const VERT_PARS = /* glsl */ `
  varying vec3 vPaperW;
  varying vec3 vPaperN;
  #ifdef PAPER_CARD
    attribute vec2 aCardEdge;
    varying vec2 vCardEdge;
  #endif
`;
const VERT_MAIN = /* glsl */ `
  vPaperW = (modelMatrix * vec4(transformed, 1.0)).xyz;
  vPaperN = normalize(mat3(modelMatrix) * objectNormal);
  #ifdef PAPER_CARD
    vCardEdge = aCardEdge;
  #endif
`;

const FRAG_PARS = /* glsl */ `
  varying vec3 vPaperW;
  varying vec3 vPaperN;
  #ifdef PAPER_CARD
    varying vec2 vCardEdge;
  #endif
  uniform float uScanZ;
  uniform vec3 uPool;
  uniform vec3 uLampColor;
  uniform vec3 uScanColor;
  uniform vec3 uGridColor;
  uniform vec4 uSheet; // centre xz, half size xz (sheet and vellum)
  uniform float uSheetYaw;

  float pHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float pNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(pHash(i), pHash(i + vec2(1.0, 0.0)), f.x), mix(pHash(i + vec2(0.0, 1.0)), pHash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float pFbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { s += a * pNoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return s;
  }
  // Anti-aliased grid: constant pixel width, faded out where cells get too small to resolve.
  float pGrid(vec2 p, float spacing, float widthPx) {
    vec2 c = p / spacing;
    vec2 fw = max(fwidth(c), vec2(1e-5));
    vec2 g = abs(fract(c - 0.5) - 0.5) / fw;
    float l = min(g.x, g.y);
    float line = 1.0 - smoothstep(widthPx * 0.5 - 0.5, widthPx * 0.5 + 0.5, l);
    return line * (1.0 - smoothstep(0.1, 0.32, max(fw.x, fw.y)));
  }
  // Scan wavefront: a circle growing from the north end of the table, so in perspective it
  // reads as a wave crossing the sheet (and climbing the model), not a screen-space band.
  float scanFront(vec3 p) { return distance(p.xz, vec2(0.0, -16.0)) - 16.0 - uScanZ; }
  float pRule(float d, float at, float widthPx) {
    float fw = max(fwidth(d), 1e-5);
    return 1.0 - smoothstep(widthPx * 0.5 - 0.5, widthPx * 0.5 + 0.5, abs(d - at) / fw);
  }
`;

const FRAG_COLOR = /* glsl */ `
  float cy = cos(uSheetYaw), sy = sin(uSheetYaw);
  vec2 sp = mat2(cy, -sy, sy, cy) * (vPaperW.xz - uSheet.xy);
  float fibre = pFbm(sp * vec2(1.2, 6.0));
  float mottle = pFbm(sp * 0.3 + 11.0);
  // Paper tooth: fine height field, applied as a derivative bump below so it catches the lamp.
  float tooth = pNoise(sp * 60.0) * 0.55 + pNoise(sp * 150.0) * 0.3 + fibre * 0.15;
  float pdz = scanFront(vPaperW);
  // Soft leading edge ahead of the front, a longer glow and gloss in its wake.
  float scanWave = pdz > 0.0 ? exp(-pdz * pdz / (2.0 * 0.8 * 0.8)) : exp(pdz / 2.2);
  float scanTrail = pdz < 0.0 ? exp(pdz / 1.6) * smoothstep(0.0, -0.5, pdz) : 0.0;
  float paperMask = 1.0;
  float cardTone = 1.0;
  float cardBevel = 0.0;
  float pool = 1.0 - smoothstep(uPool.z * 0.3, uPool.z, distance(vPaperW.xz, uPool.xy));

  #if defined(PAPER_SHEET)
    diffuseColor.rgb *= 0.78 + 0.32 * mottle + 0.1 * (fibre - 0.5) + 0.18 * (tooth - 0.5);
    vec2 e = uSheet.zw - abs(sp);
    float inside = smoothstep(1.05, 1.25, min(e.x, e.y));
    paperMask = smoothstep(0.0, 0.6, min(e.x, e.y));
    // The paper darkens toward its edge, where it lifts off the table.
    diffuseColor.rgb *= mix(0.45, 1.0, smoothstep(0.0, 0.7, min(e.x, e.y)));
    float minor = pGrid(sp, 0.5, 1.0) * inside;
    float major = pGrid(sp, 2.5, 1.6) * inside;
    float frame = pRule(min(e.x, e.y), 0.7, 2.4) + pRule(min(e.x, e.y), 0.95, 1.0);
    // Ink sits in the tooth: lines break up slightly where the paper is rough.
    float inkTake = 0.75 + 0.25 * smoothstep(0.2, 0.7, tooth);
    // Outside the lamp pool the ruled grid recedes.
    float gridInk = clamp((minor * 0.12 + major * 0.28 + frame * 0.45) * inkTake * mix(0.3, 1.0, pool), 0.0, 1.0);
    diffuseColor.rgb = mix(diffuseColor.rgb, uGridColor, gridInk);
  #elif defined(PAPER_VELLUM)
    float vg = pGrid(sp, 0.25, 1.0) * 0.5 + pGrid(sp, 1.0, 1.2);
    vec2 ve = uSheet.zw - abs(sp);
    float vedge = pRule(min(ve.x, ve.y), 0.0, 1.5);
    diffuseColor.rgb = mix(diffuseColor.rgb * (0.9 + 0.2 * mottle), uGridColor, clamp(vg * 0.25 + vedge * 0.6, 0.0, 1.0));
    diffuseColor.a *= 0.75 + 0.5 * fibre + vg * 0.35 + vedge;
  #elif defined(PAPER_CARD)
    // Folded card: faces take their tone from orientation to the lamp (north-west, above),
    // and darken where they meet the sheet.
    vec3 cn = normalize(vPaperN) * (gl_FrontFacing ? 1.0 : -1.0);
    vec2 toLamp = normalize(vec2(-0.92, -0.4));
    cardTone = clamp(0.42 + 0.3 * max(cn.y, 0.0) + 0.5 * dot(cn.xz, toLamp), 0.18, 1.2);
    cardTone *= mix(0.45, 1.0, smoothstep(0.0, 0.8, vPaperW.y));
    // Card thickness: a cut edge catches the lamp, about two pixels wide at any distance.
    vec2 ce = min(vCardEdge, 1.0 - vCardEdge);
    float edgeD = min(ce.x, ce.y);
    float edgeW = max(fwidth(edgeD), 1e-4);
    cardBevel = 1.0 - smoothstep(edgeW * 0.8, edgeW * 2.6, edgeD);
    diffuseColor.rgb *= cardTone * (0.92 + 0.12 * pFbm(vPaperW.xz * 1.5 + vPaperW.y * 2.0));
  #else
    diffuseColor.rgb *= 0.9 + 0.2 * pFbm(vPaperW.xz * 0.12) + 0.04 * (fibre - 0.5);
  #endif
`;

const FRAG_ROUGHNESS = /* glsl */ `
  roughnessFactor = clamp(roughnessFactor + (fibre - 0.5) * 0.18 + (tooth - 0.5) * 0.12, 0.12, 1.0);
  #if defined(PAPER_SHEET)
    // The scan leaves a moving gloss behind it that catches the lamp.
    roughnessFactor = mix(roughnessFactor, 0.34, scanTrail * 0.75 * paperMask);
  #endif
`;

const FRAG_NORMAL = /* glsl */ `
  #if defined(PAPER_SHEET) || defined(PAPER_TABLE)
  {
    // Derivative bump (Mikkelsen) from the tooth height field; no texture needed.
    vec3 pdx = dFdx(-vViewPosition);
    vec3 pdy = dFdy(-vViewPosition);
    float hx = dFdx(tooth);
    float hy = dFdy(tooth);
    vec3 r1 = cross(pdy, normal);
    vec3 r2 = cross(normal, pdx);
    float det = dot(pdx, r1);
    vec3 grad = sign(det) * (hx * r1 + hy * r2);
    normal = normalize(abs(det) * normal - grad * 0.0035);
  }
  #endif
`;

const FRAG_EMISSIVE = /* glsl */ `
  #if defined(PAPER_SHEET)
    float sparkle = smoothstep(0.55, 0.95, tooth);
    totalEmissiveRadiance += uScanColor * paperMask * (scanWave * (0.06 + gridInk * 0.9) + scanTrail * sparkle * 0.08);
  #elif defined(PAPER_CARD)
    totalEmissiveRadiance *= cardTone;
    totalEmissiveRadiance += uScanColor * scanWave * 0.035 * cardTone;
    totalEmissiveRadiance += uLampColor * cardBevel * (0.05 + 0.2 * pool) * clamp(cardTone, 0.3, 1.0);
  #endif
`;

export interface PaperOptions {
  color: THREE.ColorRepresentation;
  roughness?: number;
  opacity?: number;
  /** Sheet/vellum centre (x, z), half extents and yaw. */
  sheet?: { center: [number, number]; half: [number, number]; yaw?: number };
  /** Constant self-light (card model). */
  emissive?: THREE.ColorRepresentation;
}

export function createPaperMaterial(kind: PaperKind, uniforms: PaperUniforms, opts: PaperOptions) {
  const transparent = kind === "vellum";
  const material = new THREE.MeshStandardMaterial({
    color: opts.color,
    roughness: opts.roughness ?? 0.85,
    metalness: 0,
    transparent,
    opacity: opts.opacity ?? 1,
    depthWrite: !transparent,
    side: kind === "card" ? THREE.DoubleSide : THREE.FrontSide,
    emissive: opts.emissive ?? "#000000",
  });
  if (kind === "card") {
    // Lines lying on the card must win the depth test.
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1;
    material.polygonOffsetUnits = 2;
  }
  const own = {
    uSheet: { value: new THREE.Vector4(opts.sheet?.center[0] ?? 0, opts.sheet?.center[1] ?? 0, opts.sheet?.half[0] ?? 1, opts.sheet?.half[1] ?? 1) },
    uSheetYaw: { value: opts.sheet?.yaw ?? 0 },
  };
  material.defines = { [`PAPER_${kind.toUpperCase()}`]: "" };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms, own);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERT_PARS}`)
      .replace("#include <project_vertex>", `#include <project_vertex>\n${VERT_MAIN}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${FRAG_PARS}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n${FRAG_COLOR}`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\n${FRAG_ROUGHNESS}`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\n${FRAG_NORMAL}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n${FRAG_EMISSIVE}`);
  };
  material.customProgramCacheKey = () => `blueprint-paper-v3-${kind}`;
  return material;
}
