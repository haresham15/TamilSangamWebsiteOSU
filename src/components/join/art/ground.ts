// Ground surfaces for the Join approach: a flagstone path (running bond, worn arrises,
// dark joints with a little moss, per-slab tone) and a grass verge. Both are shader layers
// chained onto the kit's withSurfaceDetail patch; no textures.
import * as THREE from "three";

const PAVE_PARS = /* glsl */ `
  uniform vec4 uPave;      // slab length (x), row depth (z), joint width, tone jitter
  uniform vec3 uJoint;
  uniform vec3 uMoss;
  uniform vec2 uPathHalf;  // path half-width, edge-weathering width
  float jnPaveHeight;
  float jnPaveJoint;
  float jnPaveHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
`;

const PAVE_COLOR = /* glsl */ `
  {
    vec2 p = vArtPos.xz;
    float row = floor(p.y / uPave.y);
    float rowShift = jnPaveHash(vec2(row, 7.0));
    float u = p.x / uPave.x + rowShift;
    vec2 cell = vec2(floor(u), row);
    vec2 f = vec2(fract(u) * uPave.x, fract(p.y / uPave.y) * uPave.y);
    float edge = min(min(f.x, uPave.x - f.x), min(f.y, uPave.y - f.y));
    float aa = max(fwidth(p.x), fwidth(p.y));
    float jw = uPave.z * 0.5;
    float joint = 1.0 - smoothstep(jw - aa, jw + aa, edge);
    // Fade fine structure out in the distance instead of letting it alias.
    float far = 1.0 - smoothstep(0.015, 0.05, aa);
    joint *= far;
    float h = jnPaveHash(cell);
    float h2 = jnPaveHash(cell + 3.1);
    diffuseColor.rgb *= 1.0 + (h - 0.5) * uPave.w;
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.05, 0.98, 0.9), step(0.7, h2) * 0.6);
    // Worn arrises: a pale band just inside every slab edge.
    float arris = (1.0 - smoothstep(jw, jw + 0.035, edge)) * (1.0 - joint) * far;
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.12, arris * 0.6);
    // Joints: dark grit, with moss toward the damp path edges.
    float side = smoothstep(uPathHalf.x - uPathHalf.y, uPathHalf.x, abs(p.x));
    vec3 jointCol = mix(uJoint, uMoss, 0.35 + 0.5 * side);
    diffuseColor.rgb = mix(diffuseColor.rgb, jointCol, joint * 0.9);
    // Weathering where the path meets the verge.
    diffuseColor.rgb *= 1.0 - side * 0.22;
    jnPaveJoint = joint;
    jnPaveHeight = (-0.006 * joint - 0.0025 * (1.0 - smoothstep(jw, jw + 0.03, edge))) * far + (h - 0.5) * 0.0015;
  }
`;

const PAVE_NORMAL = /* glsl */ `
  {
    vec3 pdx = dFdx(-vViewPosition);
    vec3 pdy = dFdy(-vViewPosition);
    float hx = dFdx(jnPaveHeight);
    float hy = dFdy(jnPaveHeight);
    vec3 r1 = cross(pdy, normal);
    vec3 r2 = cross(normal, pdx);
    float det = dot(pdx, r1);
    normal = normalize(abs(det) * normal - sign(det) * (hx * r1 + hy * r2));
  }
`;

/** Flagstone path pattern over a withSurfaceDetail material (in place). */
export function withFlagstones<T extends THREE.MeshStandardMaterial>(
  material: T,
  { slab = 0.92, row = 0.58, joint = 0.014, jitter = 0.22, jointColor = "#4a4136", mossColor = "#4c5a2c", pathHalf = 3.6, edgeWidth = 0.9 } = {}
) {
  const base = material.onBeforeCompile;
  const uniforms = {
    uPave: { value: new THREE.Vector4(slab, row, joint, jitter) },
    uJoint: { value: new THREE.Color(jointColor) },
    uMoss: { value: new THREE.Color(mossColor) },
    uPathHalf: { value: new THREE.Vector2(pathHalf, edgeWidth) },
  };
  material.onBeforeCompile = (shader, renderer) => {
    base.call(material, shader, renderer);
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${PAVE_PARS}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n${PAVE_COLOR}`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 1.0, jnPaveJoint * 0.5);`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\n${PAVE_NORMAL}`);
  };
  material.customProgramCacheKey = () => "join-flagstone-v1";
  material.needsUpdate = true;
  return material;
}

const GRASS_COLOR = /* glsl */ `
  {
    // Mown bands and patchy wear along the path edge.
    float band = 0.5 + 0.5 * sin(vArtPos.x * 0.9);
    diffuseColor.rgb *= 0.92 + 0.12 * band;
    float edgeWear = 1.0 - smoothstep(3.7, 4.6, abs(vArtPos.x));
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.32, 0.29, 0.17), edgeWear * 0.35);
  }
`;

/** Grass verge layer over a withSurfaceDetail material (in place). */
export function withGrass<T extends THREE.MeshStandardMaterial>(material: T) {
  const base = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    base.call(material, shader, renderer);
    shader.fragmentShader = shader.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>\n${GRASS_COLOR}`);
  };
  material.customProgramCacheKey = () => "join-grass-v1";
  material.needsUpdate = true;
  return material;
}
