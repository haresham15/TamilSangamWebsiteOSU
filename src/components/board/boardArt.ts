// Board hero art helpers: brass lamp geometry, the flame billboard, and the fake lamp
// light that lets 14 sconces pool warm light on stone, cloth and floor while only two real
// point lights exist. Everything returns objects the caller owns and must dispose.
import * as THREE from "three";
import { latheProfile, mergeParts, type Part, type Vec3 } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";

/** Per-lamp flicker phase (shared by the flame shader, the fake light and the real lights). */
export const LAMP_PHASE = (lampIndex: number) => Math.floor(lampIndex / 2) * 1.3 + (lampIndex % 2) * 3.14;

// ---------------------------------------------------------------------------
// Wall sconce (corridor). Local frame: +z faces the aisle, the back plate sits on the
// pillar at z ≈ −0.15, the dish is forward of the pillar so it never intersects the shaft.
// ---------------------------------------------------------------------------

/** Flame base in sconce-local space (at the front spout). */
const SCONCE_FLAME: Vec3 = [0, 0.035, 0.2];

/** Yaw that turns a sconce's +z toward the aisle (lamp index: even = left pillar). */
export const sconceYaw = (lampIndex: number) => (lampIndex % 2 === 0 ? Math.PI / 2 : -Math.PI / 2);

/** World position of a sconce's flame base. */
export function sconceFlamePosition(lamp: Vec3, lampIndex: number): Vec3 {
  const s = lampIndex % 2 === 0 ? 1 : -1;
  return [lamp[0] + s * SCONCE_FLAME[2], lamp[1] + SCONCE_FLAME[1], lamp[2]];
}

/** Where the light "comes from": the middle of the flame body, nudged into the aisle. */
export function sconceLightPosition(lamp: Vec3, lampIndex: number): Vec3 {
  const f = sconceFlamePosition(lamp, lampIndex);
  const s = lampIndex % 2 === 0 ? 1 : -1;
  return [f[0] + s * 0.04, f[1] + 0.07, f[2]];
}

function spouts(count: number, radius: number, y: number, z: number, size: Vec3): Part[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return {
      geometry: new THREE.SphereGeometry(1, 12, 6),
      position: [Math.sin(a) * radius, y, z + Math.cos(a) * radius] as Vec3,
      rotation: [0, a, 0] as Vec3,
      scale: size,
    };
  });
}

/** Turned brass kuthuvilakku sconce: oval wall plate with crest, S-arm, knopped stem, dish with five lips. */
export function createSconceGeometry() {
  const plate = latheProfile(
    [[0, 0], [0.1, 0], [0.112, 0.006], [0.108, 0.016], [0.09, 0.024], [0.05, 0.03], [0, 0.034]],
    { radialSegments: 28 }
  );
  plate.rotateX(Math.PI / 2);
  const ring = latheProfile([[0.078, 0], [0.086, 0.004], [0.084, 0.012], [0.075, 0.014]], { radialSegments: 28, capped: false });
  ring.rotateX(Math.PI / 2);
  const crest = latheProfile(
    [[0, 0], [0.026, 0.008], [0.034, 0.03], [0.018, 0.052], [0.024, 0.066], [0.012, 0.09], [0, 0.11]],
    { radialSegments: 16, smooth: true, samples: 18 }
  );
  const arm = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.09, -0.14),
      new THREE.Vector3(0, -0.15, -0.1),
      new THREE.Vector3(0, -0.18, -0.02),
      new THREE.Vector3(0, -0.175, 0.06),
    ]),
    18,
    0.012,
    7
  );
  const scroll = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, -0.135),
      new THREE.Vector3(0, 0.0, -0.08),
      new THREE.Vector3(0, -0.045, -0.04),
      new THREE.Vector3(0, -0.03, 0.0),
    ]),
    14,
    0.007,
    6
  );
  const body = latheProfile(
    [
      [0, -0.2], [0.022, -0.198], [0.032, -0.184], [0.024, -0.168], [0.014, -0.156], [0.013, -0.12],
      [0.026, -0.104], [0.015, -0.088], [0.014, -0.064], [0.032, -0.044], [0.075, -0.024], [0.122, -0.006],
      [0.146, 0.012], [0.152, 0.026], [0.144, 0.031], [0.13, 0.017], [0.085, -0.002], [0.03, -0.01], [0, -0.012],
    ],
    { radialSegments: 28 }
  );
  const geometry = mergeParts([
    { geometry: plate, position: [0, 0, -0.17], scale: [1, 1.75, 1] },
    { geometry: ring, position: [0, 0, -0.152], scale: [1, 1.75, 1] },
    { geometry: crest, position: [0, 0.19, -0.152] },
    { geometry: arm },
    { geometry: scroll },
    { geometry: body, position: [0, 0, 0.06] },
    ...spouts(5, 0.15, 0.024, 0.06, [0.032, 0.011, 0.052]),
  ]);
  return bakeVertexAO(geometry, { cavity: 1.2, edges: 1, smooth: 1 });
}

/** Floor-standing kuthuvilakku (finale altar): stepped foot, knopped stem, five-lipped dish, bud finial. */
export function createStandingLampGeometry() {
  const body = latheProfile(
    [
      [0, 0], [0.2, 0], [0.212, 0.014], [0.2, 0.03], [0.15, 0.044], [0.162, 0.06], [0.105, 0.09], [0.052, 0.112],
      [0.036, 0.14], [0.052, 0.16], [0.036, 0.18], [0.024, 0.25], [0.021, 0.5], [0.042, 0.52], [0.03, 0.54],
      [0.021, 0.56], [0.02, 0.68], [0.036, 0.7], [0.026, 0.72], [0.042, 0.745], [0.1, 0.775], [0.16, 0.8],
      [0.182, 0.818], [0.172, 0.83], [0.12, 0.808], [0.045, 0.8], [0.03, 0.85], [0.046, 0.88], [0.03, 0.91],
      [0.02, 0.94], [0.042, 0.975], [0.052, 1.0], [0.036, 1.035], [0.012, 1.07], [0, 1.085],
    ],
    { radialSegments: 32 }
  );
  const geometry = mergeParts([{ geometry: body }, ...spouts(5, 0.182, 0.818, 0, [0.04, 0.012, 0.06])]);
  return bakeVertexAO(geometry, { cavity: 1.2, edges: 1, ground: { y: 0, height: 0.06, strength: 0.6 } });
}

/** Flame bases of a standing lamp (local), one per lip. */
export const STANDING_FLAMES: Vec3[] = Array.from({ length: 5 }, (_, i) => {
  const a = (i / 5) * Math.PI * 2;
  return [Math.sin(a) * 0.205, 0.83, Math.cos(a) * 0.205] as Vec3;
});

// ---------------------------------------------------------------------------
// Flame: one cylindrical billboard per flame (always faces the camera about Y), with a
// white-hot core, an orange body, a blue root and a soft halo. One instanced draw.
// ---------------------------------------------------------------------------

const NOISE_GLSL = /* glsl */ `
  float boardHash(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }
  float boardNoise(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(boardHash(i), boardHash(i + 1.0), u) * 2.0 - 1.0;
  }
  float boardPhase(int i) {
    return floor(float(i) / 2.0) * 1.3 + mod(float(i), 2.0) * 3.14;
  }
`;

const FLAME_VERT = /* glsl */ `
  attribute float aPhase;
  uniform float uTime;
  uniform float uFog;
  varying vec2 vP;
  varying vec2 vQuad;
  varying float vFlick;
  varying float vPhase;
  varying float vFade;
  ${NOISE_GLSL}
  void main() {
    vQuad = uv;
    vPhase = aPhase;
    vFlick = 0.85 + 0.35 * boardNoise(uTime * 4.2 + aPhase * 17.3);
    vec4 center = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    float s = length((modelMatrix * instanceMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
    vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    right = normalize(vec3(right.x, 0.0, right.z) + vec3(1e-5, 0.0, 0.0));
    vec3 wp = center.xyz + right * position.x * s + vec3(0.0, position.y * s, 0.0);
    vP = position.xy;
    vec4 mv = viewMatrix * vec4(wp, 1.0);
    vFade = exp(-uFog * max(-mv.z - 1.0, 0.0));
    gl_Position = projectionMatrix * mv;
  }
`;

const FLAME_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uHalo;
  uniform float uGlow;
  varying vec2 vP;
  varying vec2 vQuad;
  varying float vFlick;
  varying float vPhase;
  varying float vFade;
  void main() {
    vec2 p = vP;
    float h = 0.12 * (0.8 + 0.25 * vFlick);
    float t = clamp(p.y / h, 0.0, 1.0);
    // Tip sways more than the root.
    p.x += sin(uTime * 9.0 + vPhase * 5.0) * 0.006 * t * t + sin(uTime * 23.0 + vPhase) * 0.0015 * t;
    // Teardrop: round at the root, drawn to a point at the tip.
    float w = 0.026 * (1.0 - pow(t, 1.6) * 0.92) * smoothstep(-0.03, 0.02, p.y);
    float across = exp(-pow(p.x / max(w, 0.002), 2.0));
    float along = smoothstep(-0.012, 0.012, p.y) * (1.0 - smoothstep(h * 0.7, h, p.y));
    float body = across * along;
    float core = exp(-(p.x * p.x) / (0.009 * 0.009) - pow((p.y - 0.032) / 0.026, 2.0));
    float root = exp(-(p.x * p.x) / (0.014 * 0.014) - pow((p.y + 0.002) / 0.008, 2.0));
    float halo = exp(-length((p - vec2(0.0, 0.045)) * vec2(1.0, 0.8)) * 15.0);
    vec3 col = vec3(1.0, 0.42, 0.1) * body * 1.6
             + vec3(1.0, 0.86, 0.58) * core * 2.6
             + vec3(0.25, 0.35, 1.0) * root * 0.35 * (1.0 - core)
             + vec3(1.0, 0.5, 0.16) * halo * uHalo
             // Wide, faint glow: the air around the flame lit by it, so it reads as a light source.
             + vec3(1.0, 0.46, 0.14) * exp(-length((p - vec2(0.0, 0.06)) * vec2(1.0, 0.85)) * 6.0) * uGlow;
    // Fade everything to zero inside the quad so its edges never show as a card.
    // Window in quad UV so it reaches zero at the edge whatever the quad's size.
    vec2 qe = min(vQuad, 1.0 - vQuad);
    float win = smoothstep(0.0, 0.28, qe.x) * smoothstep(0.0, 0.2, qe.y);
    col *= vFlick * vFade * win;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Instanced flame material. Set uniforms.uTime each frame. */
export function createFlameMaterial({ halo = 0.45, glow = 0.16, fog = 0.03 } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: FLAME_VERT,
    fragmentShader: FLAME_FRAG,
    uniforms: { uTime: { value: 0 }, uHalo: { value: halo }, uGlow: { value: glow }, uFog: { value: fog } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/** Billboard quad for the flame; origin at the flame root. `phases` is one per instance. */
export function createFlameGeometry(phases: number[], size = 1) {
  // Quad covers the glow (±0.4 m, −0.34…0.56 m); the shader windows to zero inside it.
  const geometry = new THREE.PlaneGeometry(0.8 * size, 0.9 * size);
  geometry.translate(0, 0.11 * size, 0);
  geometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(new Float32Array(phases), 1));
  return geometry;
}

// ---------------------------------------------------------------------------
// Fake lamp light. Patches a lit material so every lamp adds diffuse + specular with
// inverse-square falloff and the flame's flicker, without a real light per lamp.
// Chains onto any onBeforeCompile already set (withSurfaceDetail).
// ---------------------------------------------------------------------------

export interface LampLightUniforms {
  uLampPos: { value: THREE.Vector3[] };
  uLampTime: { value: number };
  /** Lamp indices lit by real point lights (skipped here); −1 for none. */
  uLampSkip: { value: THREE.Vector2 };
  uLampColor: { value: THREE.Color };
  uLampIntensity: { value: number };
  uLampRange: { value: number };
}

export function createLampLightUniforms(positions: Vec3[], { intensity = 1, range = 7, color = "#ff9a48" } = {}): LampLightUniforms {
  return {
    uLampPos: { value: positions.map((p) => new THREE.Vector3(...p)) },
    uLampTime: { value: 0 },
    uLampSkip: { value: new THREE.Vector2(-1, -1) },
    uLampColor: { value: new THREE.Color(color) },
    uLampIntensity: { value: intensity },
    uLampRange: { value: range },
  };
}

const LAMP_VERT_PARS = /* glsl */ `
  varying vec3 vBoardW;
`;
const LAMP_VERT_MAIN = /* glsl */ `
  {
    vec4 bw = vec4(transformed, 1.0);
    #ifdef USE_INSTANCING
      bw = instanceMatrix * bw;
    #endif
    vBoardW = (modelMatrix * bw).xyz;
  }
`;
const LAMP_FRAG_PARS = /* glsl */ `
  varying vec3 vBoardW;
  uniform vec3 uLampPos[BOARD_LAMP_COUNT];
  uniform float uLampTime;
  uniform vec2 uLampSkip;
  uniform vec3 uLampColor;
  uniform float uLampIntensity;
  uniform float uLampRange;
  ${NOISE_GLSL}
`;
const LAMP_FRAG_MAIN = /* glsl */ `
  {
    vec3 bN = (vec4(normal, 0.0) * viewMatrix).xyz;
    float bNl = length(bN);
    bN = bNl > 1e-5 ? bN / bNl : vec3(0.0, 1.0, 0.0);
    vec3 bV = normalize(cameraPosition - vBoardW);
    float bA = max(material.roughness * material.roughness, 0.05);
    float bShin = min(2.0 / (bA * bA) - 2.0, 400.0);
    float bNorm = (bShin + 8.0) / 25.1327;
    vec3 bSpecCol = mix(vec3(0.04), diffuseColor.rgb, metalnessFactor);
    float bDiff = 0.0;
    float bSpec = 0.0;
    #ifdef BOARD_LAMP_GRID
      // Corridor lamps sit two per unit on a regular z grid: only the two units that
      // bracket this fragment can reach it (range < one unit), so 4 lamps, not 14.
      int bU0 = int(floor((BOARD_GRID_Z0 - vBoardW.z) / BOARD_GRID_STEP));
      for (int k = 0; k < 4; k++) {
        int bUnit = bU0 + k / 2;
        if (bUnit < 0 || bUnit * 2 >= BOARD_LAMP_COUNT) continue;
        int i = bUnit * 2 + (k - (k / 2) * 2);
    #else
      for (int i = 0; i < BOARD_LAMP_COUNT; i++) {
    #endif
      if (float(i) == uLampSkip.x || float(i) == uLampSkip.y) continue;
      vec3 L = uLampPos[i] - vBoardW;
      float d2 = dot(L, L);
      float d = sqrt(d2);
      float win = 1.0 - smoothstep(uLampRange * 0.35, uLampRange, d);
      if (win <= 0.0) continue;
      L /= d;
      float flick = 0.85 + 0.35 * boardNoise(uLampTime * 4.2 + boardPhase(i) * 17.3);
      float irr = flick * win / (d2 + 0.06) * max(dot(bN, L), 0.0);
      bDiff += irr;
      vec3 H = L + bV;
      float Hl = length(H);
      if (Hl > 1e-4) {
        float vh = clamp(dot(bV, H / Hl), 0.0, 1.0);
        float fres = 1.0 + 9.0 * pow(1.0 - vh, 5.0); // ×1 head-on → ×10 at grazing (on top of F0)
        bSpec += irr * bNorm * fres * pow(clamp(dot(bN, H / Hl), 1e-4, 1.0), bShin);
      }
    }
    vec3 bLight = uLampColor * uLampIntensity;
    reflectedLight.directDiffuse += bLight * bDiff * BRDF_Lambert(material.diffuseContribution);
    // Clamp: a mirror-angle spike must not overflow the half-float HDR target under the grade.
    reflectedLight.directSpecular += min(bLight * bSpec * bSpecCol, vec3(6.0));
  }
`;

/** Lamps laid out two per unit at z = z0 − unit × step (the corridor); enables the 4-lamp path. */
export interface LampGrid {
  z0: number;
  step: number;
}

export function withLampLight<T extends THREE.MeshStandardMaterial>(material: T, uniforms: LampLightUniforms, grid?: LampGrid): T {
  const count = uniforms.uLampPos.value.length;
  const previous = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey();
  material.defines = { ...(material.defines ?? {}), BOARD_LAMP_COUNT: count };
  if (grid) {
    material.defines.BOARD_LAMP_GRID = "";
    material.defines.BOARD_GRID_Z0 = grid.z0.toFixed(4);
    material.defines.BOARD_GRID_STEP = grid.step.toFixed(4);
  }
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${LAMP_VERT_PARS}`)
      .replace("#include <project_vertex>", `#include <project_vertex>\n${LAMP_VERT_MAIN}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${LAMP_FRAG_PARS}`)
      .replace("#include <lights_fragment_end>", `#include <lights_fragment_end>\n${LAMP_FRAG_MAIN}`);
  };
  material.customProgramCacheKey = () => `${previousKey}|board-lamps-v1`;
  material.needsUpdate = true;
  return material;
}

/** Real-light intensity matching the fake light's 1/(d²+0.06) falloff at working distance. */
export const lampFlicker = (time: number, lampIndex: number, noise: (x: number) => number) =>
  0.85 + 0.35 * noise(time * 4.2 + LAMP_PHASE(lampIndex) * 17.3);

/** Flat teardrop petal standing on +y, face toward ±z (capitals, lotus mouldings). */
export function petalGeometry(size: number, thickness = 0.32) {
  const g = latheProfile(
    [[0, 0], [0.022, 0.012], [0.03, 0.04], [0.023, 0.07], [0.009, 0.094], [0, 0.106]].map(
      ([r, y]) => [r * size, y * size] as [number, number]
    ),
    { radialSegments: 10, smooth: true, samples: 12 }
  );
  g.scale(1, 1, thickness);
  return g;
}

const SLAB_FRAG = /* glsl */ `
  {
    // Staggered granite slabs: per-slab tone, and dark joints a few millimetres wide.
    vec2 sp = vec2(vBoardW.x / BOARD_SLAB_X, vBoardW.z / BOARD_SLAB_Z);
    sp.x += 0.5 * mod(floor(sp.y), 2.0);
    vec2 cell = floor(sp);
    float tone = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
    diffuseColor.rgb *= 0.78 + 0.44 * tone;
    vec2 f = abs(fract(sp) - 0.5) * vec2(BOARD_SLAB_X, BOARD_SLAB_Z);
    vec2 half_ = 0.5 * vec2(BOARD_SLAB_X, BOARD_SLAB_Z);
    vec2 edge = half_ - f;
    float joint = 1.0 - smoothstep(0.004, 0.012, min(edge.x, edge.y));
    diffuseColor.rgb *= 1.0 - 0.75 * joint;
    boardJoint = joint;
  }
`;

/**
 * Slab joints on a floor material already patched with withLampLight (uses its world
 * position varying). Joints also roughen, so reflections break at every seam.
 */
export function withSlabs<T extends THREE.MeshStandardMaterial>(material: T, slabX = 0.95, slabZ = 1.25): T {
  const previous = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey();
  material.defines = { ...(material.defines ?? {}), BOARD_SLAB_X: slabX.toFixed(3), BOARD_SLAB_Z: slabZ.toFixed(3) };
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <color_fragment>", `#include <color_fragment>\nfloat boardJoint = 0.0;\n${SLAB_FRAG}`)
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n  roughnessFactor = mix(roughnessFactor, 0.85, boardJoint);");
  };
  material.customProgramCacheKey = () => `${previousKey}|board-slabs-v1`;
  material.needsUpdate = true;
  return material;
}

// ---------------------------------------------------------------------------
// Floor light pools: one soft additive decal per lamp on the granite, flickering with the
// flame. The fake lamp light lights the floor physically; on dark polished stone that is
// almost invisible, so the pool carries the "lamp light on the floor" read. One draw.
// ---------------------------------------------------------------------------

const POOL_VERT = /* glsl */ `
  attribute float aPhase;
  uniform float uTime;
  varying vec2 vUv;
  varying float vFlick;
  ${NOISE_GLSL}
  void main() {
    vUv = uv;
    vFlick = 0.85 + 0.35 * boardNoise(uTime * 4.2 + aPhase * 17.3);
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;
const POOL_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  varying float vFlick;
  void main() {
    vec2 c = (vUv - 0.5) * 2.0;
    float r = length(c);
    float a = exp(-r * r * 3.2) * (1.0 - smoothstep(0.75, 1.0, r));
    gl_FragColor = vec4(uColor * a * uIntensity * vFlick, 1.0);
  }
`;

export function createFloorPoolMaterial({ intensity = 0.12, color = "#ff9a4a" } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: POOL_VERT,
    fragmentShader: POOL_FRAG,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
}

export function createFloorPoolGeometry(phases: number[]) {
  const geometry = new THREE.PlaneGeometry(1, 1);
  geometry.rotateX(-Math.PI / 2);
  geometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(new Float32Array(phases), 1));
  return geometry;
}

// ---------------------------------------------------------------------------
// Floor reflections: polished granite mirrors each flame (and the finale ring) as a soft
// streak. Each instance is a light source; the vertex shader puts the streak where that
// source's mirror image meets the floor for the current camera, stretched away from the
// viewer the more grazing the angle. Roughness noise breaks it up. One draw, no extra pass.
// ---------------------------------------------------------------------------

const REFLECT_VERT = /* glsl */ `
  attribute vec4 aSource;   // xyz world position of the source, w streak width (m)
  attribute vec4 aTint;     // rgb colour, a strength
  attribute float aPhase;   // flicker phase; < 0 = steady
  uniform float uTime;
  uniform float uFloorY;
  varying vec2 vQ;
  varying vec3 vW;
  varying vec4 vTint;
  varying float vFlick;
  varying float vFade;
  ${NOISE_GLSL}
  void main() {
    vec3 C = cameraPosition;
    vec3 L = aSource.xyz;
    float hc = max(C.y - uFloorY, 0.05);
    float hl = max(L.y - uFloorY, 0.05);
    vec3 P = C + (vec3(L.x, 2.0 * uFloorY - L.y, L.z) - C) * (hc / (hc + hl));
    vec2 toP = P.xz - C.xz;
    float dist = length(toP);
    vec2 dir = dist > 1e-3 ? toP / dist : vec2(0.0, -1.0);
    vec2 side = vec2(-dir.y, dir.x);
    float grazing = clamp(dist / (hc + 0.001), 0.0, 12.0);
    float wid = aSource.w;
    float len = aSource.w * (3.0 + 0.9 * grazing);
    vec2 xz = P.xz + side * position.x * wid + dir * position.y * len;
    vW = vec3(xz.x, uFloorY + 0.012, xz.y);
    vQ = vec2(position.x, position.y);
    vTint = aTint;
    vFlick = aPhase < 0.0 ? 1.0 : 0.85 + 0.35 * boardNoise(uTime * 4.2 + aPhase * 17.3);
    vec4 mv = viewMatrix * vec4(vW, 1.0);
    vFade = exp(-0.035 * max(-mv.z - 2.0, 0.0));
    gl_Position = projectionMatrix * mv;
  }
`;

const REFLECT_FRAG = /* glsl */ `
  uniform float uIntensity;
  varying vec2 vQ;
  varying vec3 vW;
  varying vec4 vTint;
  varying float vFlick;
  varying float vFade;
  float rHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float rNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(rHash(i), rHash(i + vec2(1, 0)), f.x), mix(rHash(i + vec2(0, 1)), rHash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    // Soft streak: gaussian across, long falloff along, hot near the mirror point.
    // Elliptical, reaching zero well inside the quad so no edge ever shows.
    float r = length(vQ * 2.0);
    float across = exp(-pow(vQ.x * 5.0, 2.0));
    float along = exp(-pow(vQ.y * 2.6, 2.0)) * 0.6 + exp(-pow(vQ.y * 7.0, 2.0)) * 0.7;
    float edge = 1.0 - smoothstep(0.55, 0.95, r);
    // Polish varies: worn, duller patches and fine sparkle break the mirror up.
    float polish = 0.55 + 0.45 * rNoise(vW.xz * 1.7) ;
    polish *= 0.8 + 0.2 * rNoise(vW.xz * 11.0);
    float a = across * along * edge * polish * vTint.a * vFlick * vFade * uIntensity;
    gl_FragColor = vec4(vTint.rgb * a, 1.0);
  }
`;

export interface ReflectionSource {
  position: Vec3;
  width: number;
  color: THREE.ColorRepresentation;
  strength: number;
  /** Flicker phase (LAMP_PHASE); omit for a steady source. */
  phase?: number;
}

export function createFloorReflection(sources: ReflectionSource[], { intensity = 1, floorY = 0 } = {}) {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const src = new Float32Array(sources.length * 4);
  const tint = new Float32Array(sources.length * 4);
  const phase = new Float32Array(sources.length);
  const c = new THREE.Color();
  sources.forEach((s, i) => {
    src.set([...s.position, s.width], i * 4);
    c.set(s.color);
    tint.set([c.r, c.g, c.b, s.strength], i * 4);
    phase[i] = s.phase ?? -1;
  });
  geometry.setAttribute("aSource", new THREE.InstancedBufferAttribute(src, 4));
  geometry.setAttribute("aTint", new THREE.InstancedBufferAttribute(tint, 4));
  geometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phase, 1));
  const material = new THREE.ShaderMaterial({
    vertexShader: REFLECT_VERT,
    fragmentShader: REFLECT_FRAG,
    uniforms: { uTime: { value: 0 }, uFloorY: { value: floorY }, uIntensity: { value: intensity } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  });
  return { geometry, material, count: sources.length };
}
