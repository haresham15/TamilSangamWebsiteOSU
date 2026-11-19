// Material layers for the station art pass, chained onto the kit's withSurfaceDetail patch
// (same pattern as join/art/ground.ts). Inserted after the kit's own colour / roughness
// stages so they can use artFbm / artNoise / vArtPos.
import * as THREE from "three";
import { createSurfaceMaterial, withSurfaceDetail } from "@/gl/art/surface";

function chain(material: THREE.MeshStandardMaterial, key: string, patch: (shader: THREE.WebGLProgramParametersWithUniforms) => void) {
  const base = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    base.call(material, shader, renderer);
    patch(shader);
  };
  material.customProgramCacheKey = () => key;
  material.needsUpdate = true;
  return material;
}

const WET_COLOR = /* glsl */ `
  {
    vec2 q = vArtPos.xz;
    // Slab joints (1.2 m x 1.8 m), faded where a joint is thinner than a pixel.
    vec2 cell = vec2(1.2, 1.8);
    vec2 f = abs(fract(q / cell) - 0.5) * cell;
    float jEdge = min(cell.x * 0.5 - f.x, cell.y * 0.5 - f.y);
    float aa = max(fwidth(q.x), fwidth(q.y));
    stJoint = (1.0 - smoothstep(0.006, 0.006 + aa * 1.5, jEdge)) * (1.0 - smoothstep(0.02, 0.06, aa));
    // Puddles pool in low spots: low-frequency field, sharpened, more near the coping.
    float field = artFbm(vec3(q.x * 0.42, 3.1, q.y * 0.6));
    float nearEdge = 1.0 - smoothstep(0.9, 3.5, abs(q.y - 0.95));
    stPuddle = smoothstep(0.5 - 0.06 * nearEdge, 0.58, field + 0.05 * nearEdge);
    stPuddle *= 1.0 - stJoint;
    diffuseColor.rgb *= mix(1.0, 0.45, stPuddle);
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.45, stJoint);
  }
`;

const WET_ROUGHNESS = /* glsl */ `
  roughnessFactor = mix(roughnessFactor, uWet.y, stPuddle);
  roughnessFactor = mix(roughnessFactor, 0.85, stJoint * 0.7);
`;

/** Rain-wet concrete: slab joints, puddles with near-mirror roughness, damp elsewhere. */
export function createWetPlatformMaterial() {
  const material = createSurfaceMaterial(
    "wetAsphalt",
    { color: "#2a2c2e", roughness: 0.34, metalness: 0.0, envMapIntensity: 1.0 },
    { scale: 2.2, albedoVariation: 0.22, roughnessVariation: 0.2, bump: 0.0012, tint: "#3a3530", tintAmount: 0.3 }
  );
  const uniforms = { uWet: { value: new THREE.Vector2(1, 0.045) } };
  return chain(material, "guide-wet-platform-v1", (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nfloat stPuddle;\nfloat stJoint;\nuniform vec2 uWet;")
      .replace("#include <alphamap_fragment>", `${WET_COLOR}\n#include <alphamap_fragment>`)
      .replace("#include <normal_fragment_begin>", `${WET_ROUGHNESS}\n#include <normal_fragment_begin>`);
  });
}

const STREAK_COLOR = /* glsl */ `
  {
    // Vertical rain runs below sills and seams: high x frequency, stretched in y.
    float s = artNoise(vec3(vArtPos.x * 11.0, vArtPos.y * 0.7, vArtPos.z * 11.0));
    float run = smoothstep(0.55, 0.85, s) * smoothstep(3.2, 1.0, vArtPos.y);
    stStreak = run;
    diffuseColor.rgb *= 1.0 - run * 0.35;
  }
`;

/** Painted coach steel: vertex-coloured finishes, edge wear, grime, wet rain runs. */
export function createCoachMaterial() {
  const material = withSurfaceDetail(
    new THREE.MeshStandardMaterial({ color: "#ffffff", vertexColors: true, roughness: 0.46, metalness: 0.12, envMapIntensity: 1.0 }),
    {
      scale: 6,
      albedoVariation: 0.14,
      roughnessVariation: 0.14,
      bump: 0,
      cavity: true,
      cavityStrength: 0.7,
      wearColor: "#5d6d7a",
      wearAmount: 0.22,
      wearRoughness: -0.15,
      grimeColor: "#0d0b09",
      grimeAmount: 0.55,
      grimeFrom: -0.3,
      grimeTo: 1.4,
      space: "local",
    }
  );
  return chain(material, "guide-coach-v1", (shader) => {
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nfloat stStreak;")
      .replace("#include <alphamap_fragment>", `${STREAK_COLOR}\n#include <alphamap_fragment>`)
      .replace("#include <normal_fragment_begin>", "roughnessFactor = mix(roughnessFactor, 0.2, stStreak);\n#include <normal_fragment_begin>");
  });
}

const TACTILE_COLOR = /* glsl */ `
  {
    // Truncated-dome tactile paving on a 60 mm grid.
    vec2 g = fract(vArtPos.xz / 0.06) - 0.5;
    float r = length(g) * 0.06;
    float aa = fwidth(vArtPos.x) * 1.5;
    float far = 1.0 - smoothstep(0.004, 0.012, aa);
    stDome = (1.0 - smoothstep(0.011 - aa, 0.013 + aa, r)) * far;
    diffuseColor.rgb *= 0.85 + 0.3 * stDome;
  }
`;

const TACTILE_NORMAL = /* glsl */ `
  {
    vec3 pdx = dFdx(-vViewPosition);
    vec3 pdy = dFdy(-vViewPosition);
    float h = stDome * 0.004;
    vec3 r1 = cross(pdy, normal);
    vec3 r2 = cross(normal, pdx);
    float det = dot(pdx, r1);
    normal = normalize(abs(det) * normal - sign(det) * (dFdx(h) * r1 + dFdy(h) * r2));
  }
`;

export function createTactileMaterial() {
  const material = withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#a88a32", roughness: 0.42, metalness: 0 }), {
    scale: 4,
    albedoVariation: 0.25,
    roughnessVariation: 0.15,
    bump: 0,
    grimeColor: "#1a1510",
    grimeAmount: 0.0,
  });
  return chain(material, "guide-tactile-v1", (shader) => {
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nfloat stDome;")
      .replace("#include <alphamap_fragment>", `${TACTILE_COLOR}\n#include <alphamap_fragment>`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\n${TACTILE_NORMAL}`);
  });
}

const BRICK_COLOR = /* glsl */ `
  {
    vec2 b = vec2(vArtPos.x, vArtPos.y) / vec2(0.24, 0.085);
    float row = floor(b.y);
    b.x += mod(row, 2.0) * 0.5;
    vec2 f = fract(b);
    vec2 aa = fwidth(b);
    float mortar = max(1.0 - smoothstep(0.0, aa.x * 1.5 + 0.03, min(f.x, 1.0 - f.x)), 1.0 - smoothstep(0.0, aa.y * 1.5 + 0.08, min(f.y, 1.0 - f.y)));
    mortar *= 1.0 - smoothstep(0.25, 0.6, max(aa.x, aa.y));
    float tone = fract(sin(dot(floor(b), vec2(12.9898, 78.233))) * 43758.5453);
    diffuseColor.rgb *= 0.82 + 0.36 * tone;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.06, 0.055, 0.05), mortar * 0.75);
  }
`;

/** Laid brick (stretcher bond) over the stone preset, fading out where courses go sub-pixel. */
export function withBrick(material: THREE.MeshStandardMaterial) {
  return chain(material, "guide-brick-v1", (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace("#include <alphamap_fragment>", `${BRICK_COLOR}
#include <alphamap_fragment>`);
  });
}

/** Painted ironwork, timber and sheeting (vertex coloured). */
export function createIronworkMaterial() {
  return withSurfaceDetail(
    new THREE.MeshStandardMaterial({ color: "#ffffff", vertexColors: true, roughness: 0.58, metalness: 0.25, side: THREE.DoubleSide, envMapIntensity: 0.7 }),
    {
      scale: 7,
      albedoVariation: 0.16,
      roughnessVariation: 0.16,
      bump: 0,
      cavity: true,
      cavityStrength: 0.75,
      wearColor: "#5d625a",
      wearAmount: 0.35,
      wearRoughness: -0.12,
      grimeColor: "#0c0a08",
      grimeAmount: 0.35,
      grimeFrom: 0,
      grimeTo: 1.0,
    }
  );
}

/** Blue-hour sky seen through the station mouth: deep blue zenith, luminous horizon. */
export function createSkyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uZenith: { value: new THREE.Color("#09131f") },
      uMid: { value: new THREE.Color("#1a3047") },
      uHorizon: { value: new THREE.Color("#46657f") },
      uGlow: { value: new THREE.Color("#8a6656") },
      uGain: { value: 0.85 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vWorld;
      uniform vec3 uZenith;
      uniform vec3 uMid;
      uniform vec3 uHorizon;
      uniform vec3 uGlow;
      uniform float uGain;
      float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        float y = vWorld.y;
        vec3 c = mix(uHorizon, uMid, smoothstep(0.0, 14.0, y));
        c = mix(c, uZenith, smoothstep(12.0, 40.0, y));
        // Sodium city glow low on the horizon, strongest toward the centre.
        float glow = exp(-max(y + 2.0, 0.0) * 0.22) * (0.6 + 0.4 * exp(-abs(vWorld.x) * 0.02));
        c = mix(c, uGlow, glow * 0.55);
        // Low rain-cloud banding.
        c *= 0.92 + 0.08 * sin(y * 0.35 + sin(vWorld.x * 0.05) * 1.5);
        // Distant skyline: tree crowns and low buildings, a few lit windows.
        float x = vWorld.x;
        // Tree crowns: two octaves of value noise along x.
        float n1 = mix(h(vec2(floor(x * 0.35), 1.0)), h(vec2(floor(x * 0.35) + 1.0, 1.0)), smoothstep(0.0, 1.0, fract(x * 0.35)));
        float n2 = mix(h(vec2(floor(x * 1.4), 2.0)), h(vec2(floor(x * 1.4) + 1.0, 2.0)), smoothstep(0.0, 1.0, fract(x * 1.4)));
        float trees = 1.4 + 1.6 * n1 + 0.45 * n2;
        // Occasional flat-roofed buildings, one height per block.
        float blk = floor(x / 7.0);
        float bh = step(0.72, h(vec2(blk, 5.0))) * (3.2 + 3.5 * h(vec2(blk, 9.0)));
        bh *= step(0.12, fract(x / 7.0)) * step(fract(x / 7.0), 0.78);
        float sky = max(trees, bh);
        float edge = fwidth(y) * 1.5;
        float land = 1.0 - smoothstep(sky - edge, sky + edge, y);
        vec2 win = floor(vec2(x / 0.8, y / 0.75));
        float lit = step(0.9, h(win)) * step(0.65, fract(x / 0.8)) * step(0.55, fract(y / 0.75)) * step(y, bh - 0.5) * step(0.5, bh);
        c = mix(c, vec3(0.012, 0.016, 0.024) + vec3(0.9, 0.55, 0.25) * lit * 0.5, land);
        c += (h(gl_FragCoord.xy) - 0.5) / 255.0;
        gl_FragColor = vec4(c * uGain, 1.0);
      }
    `,
    depthWrite: false,
    fog: false,
  });
}
