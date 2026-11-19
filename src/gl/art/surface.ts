// src/gl/art/surface.ts
// Surface detail layer for MeshStandard/MeshPhysical materials: the difference between a
// flat-coloured primitive and something that looks made of a material.
//
// withSurfaceDetail() patches the lit shader (so lights, shadows, env maps, fog and the
// grade pass all keep working) and adds, with no textures:
//   - albedo breakup      large + fine procedural noise, so no surface is one colour
//   - roughness breakup   so highlights vary across the surface
//   - micro normal        derivative bump from the same noise
//   - cavity / AO         from the `aCavity` attribute baked by vertexAO.ts
//   - edge wear           exposed edges lighten/polish (or chip, for paint)
//   - grime               dirt gathering toward the ground
// Noise is evaluated in world space by default, so instanced copies do not repeat.
import * as THREE from "three";

export interface SurfaceDetailOptions {
  /** Noise frequency in cycles per metre. */
  scale?: number;
  /** Albedo variation, 0–1 (0.12 is already visible). */
  albedoVariation?: number;
  /** Second, warmer/cooler tint mixed in by low-frequency noise. */
  tint?: THREE.ColorRepresentation;
  tintAmount?: number;
  /** Roughness variation (±). */
  roughnessVariation?: number;
  /** Micro normal strength, in metres of apparent relief. 0 disables. */
  bump?: number;
  /** Uses the baked `aCavity` attribute. Only enable for geometry that has it. */
  cavity?: boolean;
  /** How dark creases get (0–1) and their colour. */
  cavityStrength?: number;
  cavityColor?: THREE.ColorRepresentation;
  /** Edge wear: colour revealed on exposed edges, amount, and roughness shift there. */
  wearColor?: THREE.ColorRepresentation;
  wearAmount?: number;
  wearRoughness?: number;
  /** Grime rising from `grimeFrom` (world/local y) and fading out by `grimeTo`. */
  grimeColor?: THREE.ColorRepresentation;
  grimeAmount?: number;
  grimeFrom?: number;
  grimeTo?: number;
  /** "local" keeps the pattern attached to an object that moves; "world" breaks instancing repetition. */
  space?: "world" | "local";
}

type Resolved = Required<SurfaceDetailOptions>;

const DEFAULTS: Resolved = {
  scale: 3,
  albedoVariation: 0.12,
  tint: "#ffffff",
  tintAmount: 0,
  roughnessVariation: 0.12,
  bump: 0.004,
  cavity: false,
  cavityStrength: 0.75,
  cavityColor: "#0b0806",
  wearColor: "#ffffff",
  wearAmount: 0,
  wearRoughness: 0,
  grimeColor: "#0d0a07",
  grimeAmount: 0,
  grimeFrom: 0,
  grimeTo: 1,
  space: "world",
};

const VERT_PARS = /* glsl */ `
  #ifdef ART_CAVITY
    attribute vec2 aCavity;
    varying vec2 vArtCavity;
  #endif
  varying vec3 vArtPos;
`;

const VERT_MAIN = /* glsl */ `
  {
    vec4 artP = vec4(transformed, 1.0);
    #ifndef ART_LOCAL
      #ifdef USE_INSTANCING
        artP = instanceMatrix * artP;
      #endif
      artP = modelMatrix * artP;
    #endif
    vArtPos = artP.xyz;
    #ifdef ART_CAVITY
      vArtCavity = aCavity;
    #endif
  }
`;

const FRAG_PARS = /* glsl */ `
  #ifdef ART_CAVITY
    varying vec2 vArtCavity;
  #endif
  varying vec3 vArtPos;
  uniform vec4 uArtA;        // scale, albedoVariation, roughnessVariation, bump
  uniform vec4 uArtTint;     // rgb, amount
  uniform vec4 uArtCavity;   // rgb, strength
  uniform vec4 uArtWear;     // rgb, amount
  uniform vec4 uArtGrime;    // rgb, amount
  uniform vec3 uArtRange;    // grimeFrom, grimeTo, wearRoughness

  float artHash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float artNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(artHash(i), artHash(i + vec3(1, 0, 0)), f.x), mix(artHash(i + vec3(0, 1, 0)), artHash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(artHash(i + vec3(0, 0, 1)), artHash(i + vec3(1, 0, 1)), f.x), mix(artHash(i + vec3(0, 1, 1)), artHash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float artFbm(vec3 p) {
    float a = 0.5;
    float s = 0.0;
    for (int i = 0; i < 3; i++) {
      s += a * artNoise(p);
      p = p * 2.03 + 11.7;
      a *= 0.5;
    }
    return s / 0.875;
  }
  // Shared between the colour, roughness and normal stages.
  float artLow;
  float artFine;
  float artOcc;
  float artEdge;
`;

const FRAG_COLOR = /* glsl */ `
  {
    vec3 artP = vArtPos * uArtA.x;
    artLow = artFbm(artP * 0.23);
    artFine = artFbm(artP);
    #ifdef ART_CAVITY
      artOcc = clamp(vArtCavity.x, 0.0, 1.0);
      artEdge = clamp(vArtCavity.y, 0.0, 1.0);
    #else
      artOcc = 0.0;
      artEdge = 0.0;
    #endif
    float artVar = (artFine - 0.5) * 1.2 + (artLow - 0.5) * 0.8;
    diffuseColor.rgb *= 1.0 + artVar * uArtA.y;
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * uArtTint.rgb, uArtTint.a * smoothstep(0.35, 0.7, artLow));
    // Creases: dirt colour, weighted by noise so the line is never uniform.
    float artCrease = artOcc * uArtCavity.a * (0.7 + 0.6 * artFine);
    diffuseColor.rgb = mix(diffuseColor.rgb, uArtCavity.rgb, clamp(artCrease, 0.0, 1.0) * 0.85);
    // Exposed edges: worn through, broken up by noise.
    float artWorn = smoothstep(0.25, 0.8, artEdge * (0.55 + 0.9 * artFine)) * uArtWear.a;
    diffuseColor.rgb = mix(diffuseColor.rgb, uArtWear.rgb, artWorn);
    artEdge = artWorn;
    // Grime rising from the ground.
    float artG = 1.0 - smoothstep(uArtRange.x, uArtRange.y, vArtPos.y);
    diffuseColor.rgb = mix(diffuseColor.rgb, uArtGrime.rgb, artG * uArtGrime.a * (0.45 + 0.75 * artLow));
  }
`;

const FRAG_ROUGHNESS = /* glsl */ `
  roughnessFactor = clamp(
    roughnessFactor + (artFine - 0.5) * 2.0 * uArtA.z + artOcc * 0.25 + artEdge * uArtRange.z,
    0.045, 1.0);
`;

const FRAG_NORMAL = /* glsl */ `
  if (uArtA.w > 0.0) {
    float artH = (artFine + 0.5 * artNoise(vArtPos * uArtA.x * 4.1)) * uArtA.w;
    vec3 artDpdx = dFdx(-vViewPosition);
    vec3 artDpdy = dFdy(-vViewPosition);
    float artDhx = dFdx(artH);
    float artDhy = dFdy(artH);
    vec3 artR1 = cross(artDpdy, normal);
    vec3 artR2 = cross(normal, artDpdx);
    float artDet = dot(artDpdx, artR1);
    // Fade the bump out where a pixel covers more than a noise cell (distance shimmer).
    float artFade = 1.0 - smoothstep(0.35, 1.0, length(fwidth(vArtPos)) * uArtA.x * 4.0);
    vec3 artGrad = sign(artDet) * (artDhx * artR1 + artDhy * artR2);
    normal = normalize(abs(artDet) * normal - artGrad * artFade);
  }
`;

const FRAG_AO = /* glsl */ `
  {
    float artAO = 1.0 - artOcc * uArtCavity.a;
    reflectedLight.indirectDiffuse *= artAO;
    reflectedLight.indirectSpecular *= artAO;
    reflectedLight.directDiffuse *= mix(1.0, artAO, 0.45);
    reflectedLight.directSpecular *= mix(1.0, artAO, 0.6);
  }
`;

const vec4From = (color: THREE.ColorRepresentation, w: number) => {
  const c = new THREE.Color(color);
  return new THREE.Vector4(c.r, c.g, c.b, w);
};

/**
 * Adds the detail layer to `material` (in place) and returns it. Safe to call once per
 * material. Materials sharing the same feature flags share one compiled program.
 */
export function withSurfaceDetail<T extends THREE.MeshStandardMaterial>(material: T, options: SurfaceDetailOptions = {}): T {
  const o: Resolved = { ...DEFAULTS, ...options };
  const uniforms = {
    uArtA: { value: new THREE.Vector4(o.scale, o.albedoVariation, o.roughnessVariation, o.bump) },
    uArtTint: { value: vec4From(o.tint, o.tintAmount) },
    uArtCavity: { value: vec4From(o.cavityColor, o.cavity ? o.cavityStrength : 0) },
    uArtWear: { value: vec4From(o.wearColor, o.wearAmount) },
    uArtGrime: { value: vec4From(o.grimeColor, o.grimeAmount) },
    uArtRange: { value: new THREE.Vector3(o.grimeFrom, o.grimeTo, o.wearRoughness) },
  };
  material.defines = { ...(material.defines ?? {}) };
  if (o.cavity) material.defines.ART_CAVITY = "";
  if (o.space === "local") material.defines.ART_LOCAL = "";
  material.userData.artUniforms = uniforms;

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERT_PARS}`)
      .replace("#include <project_vertex>", `#include <project_vertex>\n${VERT_MAIN}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${FRAG_PARS}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n${FRAG_COLOR}`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\n${FRAG_ROUGHNESS}`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\n${FRAG_NORMAL}`)
      .replace("#include <aomap_fragment>", `#include <aomap_fragment>\n${FRAG_AO}`);
  };
  material.customProgramCacheKey = () => "art-surface-v1";
  material.needsUpdate = true;
  return material;
}

// ---------------------------------------------------------------------------
// Presets. Each returns a new material the caller owns and must dispose.
// `cavity: true` in the overrides requires geometry baked with bakeVertexAO().
// ---------------------------------------------------------------------------

export type SurfacePreset = "stone" | "agedBrass" | "bronze" | "silk" | "lacquerWood" | "plaster" | "wetAsphalt";

interface PresetDef {
  physical?: boolean;
  params: THREE.MeshPhysicalMaterialParameters;
  detail: SurfaceDetailOptions;
}

const PRESETS: Record<SurfacePreset, PresetDef> = {
  // Carved granite / sandstone: matte, mottled, dirt in the carving, pale worn arrises.
  stone: {
    params: { color: "#6b5a4a", roughness: 0.86, metalness: 0.0 },
    detail: {
      scale: 5, albedoVariation: 0.2, tint: "#c9a887", tintAmount: 0.35, roughnessVariation: 0.14, bump: 0.006,
      cavityStrength: 0.8, cavityColor: "#0c0806", wearColor: "#a8927a", wearAmount: 0.5, wearRoughness: -0.12,
      grimeColor: "#0f0a07", grimeAmount: 0.45, grimeFrom: 0, grimeTo: 1.2,
    },
  },
  // Lamp brass: dark oxidised body, bright rubbed edges, soot in recesses.
  agedBrass: {
    params: { color: "#7a5a2a", roughness: 0.48, metalness: 1.0 },
    detail: {
      scale: 22, albedoVariation: 0.22, tint: "#3d5a44", tintAmount: 0.18, roughnessVariation: 0.2, bump: 0.0012,
      cavityStrength: 0.85, cavityColor: "#0a0705", wearColor: "#e2b565", wearAmount: 0.75, wearRoughness: -0.22,
    },
  },
  // Cast bronze with green-brown patina and polished high points.
  bronze: {
    params: { color: "#5e4326", roughness: 0.52, metalness: 1.0 },
    detail: {
      scale: 14, albedoVariation: 0.18, tint: "#3f6b5c", tintAmount: 0.4, roughnessVariation: 0.22, bump: 0.0018,
      cavityStrength: 0.8, cavityColor: "#0b0d0a", wearColor: "#c9944a", wearAmount: 0.7, wearRoughness: -0.25,
    },
  },
  // Kanchipuram silk: sheen lobe carries the highlight; set `color`/`sheenColor` per cloth.
  silk: {
    physical: true,
    params: { color: "#5a1420", roughness: 0.62, metalness: 0.0, sheen: 1.0, sheenRoughness: 0.32, sheenColor: "#ffb070", side: THREE.DoubleSide },
    detail: { scale: 90, albedoVariation: 0.08, roughnessVariation: 0.08, bump: 0.0004, space: "local" },
  },
  // Oiled dark timber with a thin clear coat.
  lacquerWood: {
    physical: true,
    params: { color: "#3a2416", roughness: 0.55, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.35 },
    detail: {
      scale: 9, albedoVariation: 0.24, tint: "#7a4a26", tintAmount: 0.3, roughnessVariation: 0.15, bump: 0.002,
      cavityStrength: 0.7, wearColor: "#8a6a48", wearAmount: 0.35, wearRoughness: 0.15,
    },
  },
  // Lime plaster / stucco: chalky, stained downward, chipped at edges.
  plaster: {
    params: { color: "#cdbfa8", roughness: 0.93, metalness: 0.0 },
    detail: {
      scale: 4, albedoVariation: 0.14, tint: "#a9906e", tintAmount: 0.35, roughnessVariation: 0.06, bump: 0.003,
      cavityStrength: 0.65, cavityColor: "#2a2118", wearColor: "#8d7a63", wearAmount: 0.4, wearRoughness: 0.05,
      grimeColor: "#3a2f24", grimeAmount: 0.35, grimeFrom: 0, grimeTo: 1.5,
    },
  },
  // Rain-wet ground: low roughness broken into puddles and drier patches.
  wetAsphalt: {
    params: { color: "#15171b", roughness: 0.28, metalness: 0.0 },
    detail: { scale: 1.6, albedoVariation: 0.16, roughnessVariation: 0.26, bump: 0.003 },
  },
};

/**
 * Creates a preset material. `params` override the base PBR parameters (colour above all),
 * `detail` the detail layer.
 */
export function createSurfaceMaterial(
  preset: SurfacePreset,
  params: THREE.MeshPhysicalMaterialParameters = {},
  detail: SurfaceDetailOptions = {}
): THREE.MeshStandardMaterial {
  const def = PRESETS[preset];
  const merged = { ...def.params, ...params };
  const material = def.physical ? new THREE.MeshPhysicalMaterial(merged) : new THREE.MeshStandardMaterial(merged as THREE.MeshStandardMaterialParameters);
  return withSurfaceDetail(material, { ...def.detail, ...detail });
}
