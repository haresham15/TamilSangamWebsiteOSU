import * as THREE from "three";
import { createSurfaceMaterial } from "@/gl/art/surface";
import { WREATH_CY, WREATH_R_IN } from "./flowMath";

/** Darkest value of the home scene: lifted umber (golden hour). Canvas clear, fog and stone fade share it. */
export const HERO_SCENE_BG = "#563a2c";

/**
 * The swept threshold stone the kolam is drawn on (home hero, cinematic path).
 *
 * Built on the kit's `stone` preset (albedo/roughness breakup, micro normal), plus:
 *  - large cast slabs with narrow, slightly bevelled joints
 *  - damp patches: darker, smoother, catching a soft sheen from the raking key
 *  - swept/worn patches: paler and drier
 *  - a dust of rice powder over the whole surface, heavier near the drawing
 *  - a camera-relative falloff into the scene background so the canvas edge has no seam
 *  - a dim pool behind the Kural text once the wreath forms (PRD §8.4 text mask)
 *
 * The plane lies in world XY (the camera looks down -Z at it), facing +Z.
 */
export interface ThresholdStoneUniforms {
  uViewCenter: { value: THREE.Vector2 };
  uViewHalf: { value: THREE.Vector2 };
  uBg: { value: THREE.Color };
  uP: { value: number };
  uTextCenter: { value: THREE.Vector2 };
  uTextRadius: { value: number };
}

const FRAG_PARS = /* glsl */ `
  uniform vec2 uViewCenter;
  uniform vec2 uViewHalf;
  uniform vec3 uBg;
  uniform float uP;
  uniform vec2 uTextCenter;
  uniform float uTextRadius;
  float thJoint;
  float thDamp;
  float thSlab;

  // Distance (in slab units) to the nearest joint of a running-bond slab grid.
  float thJointDist(vec2 p) {
    vec2 slab = vec2(5.2, 3.9);
    float row = floor(p.y / slab.y);
    float x = p.x / slab.x + 0.5 * mod(row, 2.0) + 0.17;
    float fx = abs(fract(x) - 0.5);
    float fy = abs(fract(p.y / slab.y) - 0.5);
    return min((0.5 - fx) * slab.x, (0.5 - fy) * slab.y);
  }

  // Integer id of the slab containing p (same running-bond grid as thJointDist).
  vec2 thSlabId(vec2 p) {
    vec2 slab = vec2(5.2, 3.9);
    float row = floor(p.y / slab.y);
    return vec2(floor(p.x / slab.x + 0.5 * mod(row, 2.0) + 0.17), row);
  }
`;

const FRAG_COLOR = /* glsl */ `
  {
    vec2 wp = vArtPos.xy;
    // Slight wander so joints read as laid by hand, not ruled.
    vec2 jw = wp + vec2(artNoise(vec3(wp * 0.7, 3.0)), artNoise(vec3(wp * 0.7, 9.0))) * 0.06;
    float jd = thJointDist(jw);
    thJoint = 1.0 - smoothstep(0.004, 0.018, jd);
    float lip = (1.0 - smoothstep(0.02, 0.06, jd)) * (1.0 - thJoint);

    float low = artFbm(vec3(wp * 0.22, 1.7));
    float mid = artFbm(vec3(wp * 0.9, 5.3));
    thDamp = smoothstep(0.52, 0.72, low * 0.75 + mid * 0.25);
    float worn = smoothstep(0.58, 0.8, artFbm(vec3(wp * 0.35 + 4.0, 2.2)));

    vec3 c = diffuseColor.rgb;
    // Each slab was cut from a different stone: warm/cool and light/dark shifts per slab.
    vec2 sid = thSlabId(jw);
    thSlab = artHash(vec3(sid, 21.0));
    float slabWarm = artHash(vec3(sid, 37.0));
    c *= 0.82 + 0.36 * thSlab;
    c = mix(c, c * vec3(1.1, 1.0, 0.88), slabWarm);
    c *= mix(1.0, 0.72, thDamp);           // damp darkening
    c = mix(c, c * 1.22 + 0.012, worn);    // swept, paler patches
    c *= 1.0 - 0.4 * thJoint;             // grit in the joints
    c *= 1.0 + 0.10 * lip;                 // worn arris along each joint

    // Rice-powder dust left on the stone: sparse round grains, mostly near the drawing.
    vec2 gp = wp * 110.0;
    vec2 cell = floor(gp);
    float h = artHash(vec3(cell, 4.0));
    vec2 off = vec2(artHash(vec3(cell, 9.0)), artHash(vec3(cell, 13.0))) - 0.5;
    float grain = (1.0 - smoothstep(0.16, 0.3, length(fract(gp) - 0.5 - off * 0.45)));
    float speckAA = 1.0 - smoothstep(0.5, 1.2, length(fwidth(gp)));
    float nearDrawing = 1.0 - smoothstep(4.2, 6.5, abs(wp.x));
    float density = mix(0.985, 0.94, nearDrawing) + 0.03 * thDamp;
    float speck = step(density, h) * grain * speckAA;
    c = mix(c, vec3(0.6, 0.57, 0.52), speck * 0.55);
    diffuseColor.rgb = c;
  }
`;

const FRAG_ROUGHNESS = /* glsl */ `
  // Per-slab polish so the key leaves a soft sheen on some slabs and not others.
  roughnessFactor = clamp(roughnessFactor - 0.38 * thDamp + 0.08 * thJoint + (thSlab - 0.5) * 0.26, 0.3, 1.0);
`;

const FRAG_NORMAL = /* glsl */ `
  {
    // Joint groove: a shallow bevel the raking light catches on one side.
    vec2 wp = vArtPos.xy;
    float e = 0.012;
    float h0 = smoothstep(0.004, 0.055, thJointDist(wp));
    float hx = smoothstep(0.004, 0.055, thJointDist(wp + vec2(e, 0.0)));
    float hy = smoothstep(0.004, 0.055, thJointDist(wp + vec2(0.0, e)));
    vec3 jn = normalize(vec3(-(hx - h0) / e * 0.035, -(hy - h0) / e * 0.035, 1.0));
    normal = normalize(normal + (viewMatrix * vec4(jn - vec3(0.0, 0.0, 1.0), 0.0)).xyz);
  }
`;

const FRAG_FINAL = /* glsl */ `
  {
    // Light pool around the view, falling into the background at the canvas edges.
    vec2 q = (vArtPos.xy - uViewCenter) / uViewHalf;
    float fall = 1.0 - smoothstep(0.45, 1.08, length(q * vec2(0.92, 1.0)));
    // The tilted camera looks across the stone: let the far side (top of frame) sink into
    // darkness, a stand-in for depth of field. Deeper during the intro, under the page title.
    float introT = 1.0 - smoothstep(0.06, 0.14, uP);
    outgoingLight *= 1.0 - (0.45 + 0.25 * introT) * smoothstep(-0.1, 0.85, q.y);
    // Warm turmeric pool where the morning light lands, around the aim point.
    float pool = 1.0 - smoothstep(0.0, 0.85, length(q * vec2(0.9, 1.25)));
    outgoingLight *= mix(vec3(1.0), vec3(1.22, 1.08, 0.9), pool);
    // Quiet the stone behind the Kural once the wreath has formed.
    float textT = smoothstep(0.5, 0.66, uP);
    float textPool = 1.0 - smoothstep(uTextRadius * 0.55, uTextRadius * 1.25, length(vArtPos.xy - uTextCenter));
    outgoingLight *= 1.0 - 0.35 * textT * textPool;
    outgoingLight = mix(uBg, outgoingLight, fall);
  }
`;

export function createThresholdStoneMaterial(): { material: THREE.MeshStandardMaterial; uniforms: ThresholdStoneUniforms } {
  const material = createSurfaceMaterial(
    "stone",
    { color: "#59544c", roughness: 0.78, envMapIntensity: 0.3 },
    {
      scale: 7,
      albedoVariation: 0.16,
      tint: "#958670",
      tintAmount: 0.25,
      roughnessVariation: 0.1,
      bump: 0.0035,
      grimeAmount: 0,
      wearAmount: 0,
    }
  );

  const uniforms: ThresholdStoneUniforms = {
    uViewCenter: { value: new THREE.Vector2(0, 0) },
    uViewHalf: { value: new THREE.Vector2(6, 3.8) },
    uBg: { value: new THREE.Color(HERO_SCENE_BG) },
    uP: { value: 0 },
    uTextCenter: { value: new THREE.Vector2(0, WREATH_CY) },
    uTextRadius: { value: 1.15 * WREATH_R_IN },
  };

  const kitCompile = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    kitCompile.call(material, shader, renderer);
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${FRAG_PARS}`)
      // Kit detail runs right after these includes; ours is appended after the kit's code.
      .replace("#include <alphamap_fragment>", `${FRAG_COLOR}\n#include <alphamap_fragment>`)
      .replace("#include <metalnessmap_fragment>", `${FRAG_ROUGHNESS}\n#include <metalnessmap_fragment>`)
      .replace("#include <clearcoat_normal_fragment_begin>", `${FRAG_NORMAL}\n#include <clearcoat_normal_fragment_begin>`)
      .replace("#include <opaque_fragment>", `${FRAG_FINAL}\n#include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => "home-threshold-stone-v1";
  material.needsUpdate = true;

  return { material, uniforms };
}
