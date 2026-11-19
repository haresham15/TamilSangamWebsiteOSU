// Tree canopies as camera-facing leaf-cluster cards (one instanced draw for every tree),
// shaded as a volume: each card carries the direction from its canopy centre, so the sun
// side is lit, the far side falls into cool shade, and backlit edges glow through.
// Trunks and limbs are tapered tubes merged into one geometry.
import * as THREE from "three";
import { mergeParts, seeded, type Part } from "@/gl/art/geometry";

/** Leaf-cluster alpha texture: grey-level variation in RGB, leaf silhouettes in alpha. */
export function createLeafClusterTexture(seed = 3): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const rand = seeded(seed);
  ctx.clearRect(0, 0, size, size);
  // Slight blur softens every leaf edge so alpha-to-coverage gives graded, not jagged, edges.
  ctx.filter = "blur(0.7px)";
  for (let i = 0; i < 230; i++) {
    // Denser toward the middle so the card edge breaks into single leaves.
    const r = Math.sqrt(rand()) * size * 0.45;
    const a = rand() * Math.PI * 2;
    const x = size / 2 + Math.cos(a) * r;
    const y = size / 2 + Math.sin(a) * r;
    const len = 10 + rand() * 14;
    const wid = len * (0.38 + rand() * 0.18);
    // Leaves deeper in the clump (toward the bottom of the card) are darker.
    const g = Math.round(130 + rand() * 110 - (y / size) * 50);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand() * Math.PI * 2);
    // Each leaf carries its own light-to-shade split across the midrib.
    const grad = ctx.createLinearGradient(-wid, 0, wid, 0);
    grad.addColorStop(0, `rgb(${g + 15},${g + 15},${g + 15})`);
    grad.addColorStop(0.5, `rgb(${g},${g},${g})`);
    grad.addColorStop(1, `rgb(${g - 35},${g - 35},${g - 35})`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -len / 2);
    ctx.quadraticCurveTo(wid, 0, 0, len / 2);
    ctx.quadraticCurveTo(-wid, 0, 0, -len / 2);
    ctx.fill();
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export interface Canopy {
  center: [number, number, number];
  radius: [number, number, number];
  cards: number;
  /** Card size range in metres. */
  size: [number, number];
  /** 0 green … 1 autumn gold; per canopy mean. */
  warmth: number;
  seed: number;
}

/** Instanced card attributes for a set of canopies. */
export function buildCanopyCards(canopies: Canopy[]) {
  const total = canopies.reduce((n, c) => n + c.cards, 0);
  const offset = new Float32Array(total * 3);
  const params = new Float32Array(total * 4); // size, rotation, depth shade, hue
  const dir = new Float32Array(total * 3);
  let i = 0;
  for (const c of canopies) {
    const rand = seeded(c.seed);
    for (let k = 0; k < c.cards; k++, i++) {
      // Points biased toward the shell of the ellipsoid (where foliage actually is).
      let x = 0;
      let y = 0;
      let z = 0;
      let d = 2;
      while (d > 1) {
        x = rand() * 2 - 1;
        y = rand() * 2 - 1;
        z = rand() * 2 - 1;
        d = x * x + y * y + z * z;
      }
      const shell = 0.55 + 0.45 * Math.cbrt(rand());
      const len = Math.sqrt(d) || 1;
      x = (x / len) * shell;
      y = (y / len) * shell;
      z = (z / len) * shell;
      offset[i * 3] = c.center[0] + x * c.radius[0];
      offset[i * 3 + 1] = c.center[1] + y * c.radius[1];
      offset[i * 3 + 2] = c.center[2] + z * c.radius[2];
      dir[i * 3] = x;
      dir[i * 3 + 1] = y;
      dir[i * 3 + 2] = z;
      params[i * 4] = c.size[0] + rand() * (c.size[1] - c.size[0]);
      params[i * 4 + 1] = rand() * Math.PI * 2;
      params[i * 4 + 2] = shell;
      params[i * 4 + 3] = THREE.MathUtils.clamp(c.warmth + (rand() - 0.5) * 0.5, 0, 1);
    }
  }
  const plane = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = plane.index;
  geometry.setAttribute("position", plane.attributes.position);
  geometry.setAttribute("uv", plane.attributes.uv);
  geometry.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offset, 3));
  geometry.setAttribute("aParams", new THREE.InstancedBufferAttribute(params, 4));
  geometry.setAttribute("aDir", new THREE.InstancedBufferAttribute(dir, 3));
  geometry.instanceCount = total;
  // Bounds for culling: the union of the canopies.
  const box = new THREE.Box3();
  for (const c of canopies) {
    box.expandByPoint(new THREE.Vector3(c.center[0] - c.radius[0] - c.size[1], c.center[1] - c.radius[1] - c.size[1], c.center[2] - c.radius[2] - c.size[1]));
    box.expandByPoint(new THREE.Vector3(c.center[0] + c.radius[0] + c.size[1], c.center[1] + c.radius[1] + c.size[1], c.center[2] + c.radius[2] + c.size[1]));
  }
  geometry.boundingBox = box;
  geometry.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
  return geometry;
}

const CARD_VERT = /* glsl */ `
  attribute vec3 aOffset;
  attribute vec4 aParams;
  attribute vec3 aDir;
  varying vec2 vUv;
  varying vec3 vDir;
  varying vec4 vParams;
  varying vec3 vToCam;
  varying vec3 vSide;
  #include <fog_pars_vertex>
  void main() {
    vec4 mvCenter = modelViewMatrix * vec4(aOffset, 1.0);
    float c = cos(aParams.y);
    float s = sin(aParams.y);
    vec2 q = mat2(c, -s, s, c) * position.xy * aParams.x;
    vec4 mvPosition = mvCenter + vec4(q, 0.0, 0.0);
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    vDir = aDir;
    vParams = aParams;
    vToCam = normalize(cameraPosition - (modelMatrix * vec4(aOffset, 1.0)).xyz);
    // Billboard offset in world space, normalised by card size: rounds each card's shading.
    vSide = (vec4(q / max(aParams.x, 1e-3), 0.0, 0.0) * viewMatrix).xyz;
    #include <fog_vertex>
  }
`;

const CARD_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uSunDir;
  uniform vec3 uSun;
  uniform vec3 uSky;
  uniform vec3 uShade;
  uniform vec3 uGreen;
  uniform vec3 uGold;
  uniform float uAlphaCut;
  varying vec2 vUv;
  varying vec3 vDir;
  varying vec4 vParams;
  varying vec3 vToCam;
  varying vec3 vSide;
  #include <common>
  #include <fog_pars_fragment>
  void main() {
    vec4 t = texture2D(uMap, vUv);
    // Soft alpha: with alphaToCoverage on an MSAA target this resolves to graded edges.
    float alpha = smoothstep(0.18, 0.55, t.a);
    if (alpha < 0.04) discard;
    vec3 base = mix(uGreen, uGold, vParams.w) * (0.45 + 0.75 * t.r);
    // Per-pixel normal: canopy direction bent by the position across the card.
    vec3 n = normalize(vDir * 1.1 + vSide * 0.9 + vec3(0.0, 0.2, 0.0));
    float ndl = dot(n, uSunDir);
    float lit = smoothstep(-0.25, 0.75, ndl);
    float inner = smoothstep(0.5, 1.0, vParams.z);
    float sky = 0.55 + 0.45 * n.y;
    vec3 col = base * (uSky * sky * mix(0.5, 1.0, inner) + uSun * lit * mix(0.35, 1.0, inner));
    // Sun through the leaves: thin-leaf translucency, strongest at the canopy rim.
    float rim = 1.0 - abs(dot(n, vToCam));
    float through = pow(clamp(dot(-vToCam, uSunDir), 0.0, 1.0), 4.0) * (0.35 + 0.65 * rim);
    col += base * uSun * vec3(1.0, 0.92, 0.55) * through * 0.85;
    col = mix(col, col * uShade, (1.0 - inner) * (1.0 - lit) * 0.6);
    gl_FragColor = vec4(col, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export function createCanopyMaterial(map: THREE.Texture, sunDir: THREE.Vector3) {
  return new THREE.ShaderMaterial({
    vertexShader: CARD_VERT,
    fragmentShader: CARD_FRAG,
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uMap: { value: map },
      uSunDir: { value: sunDir.clone().normalize() },
      uSun: { value: new THREE.Color("#ffd08a").multiplyScalar(1.2) },
      uSky: { value: new THREE.Color("#b7aed0").multiplyScalar(0.62) },
      uShade: { value: new THREE.Color("#9a8fb8") },
      uGreen: { value: new THREE.Color("#5b7a2c") },
      uGold: { value: new THREE.Color("#cf9a35") },
      uAlphaCut: { value: 0.42 },
    },
    fog: true,
    side: THREE.DoubleSide,
    alphaToCoverage: true,
  });
}

/**
 * Shadow-pass material for the canopy cards: the same billboard, so in the light's view
 * every card faces the sun and the leaf alpha cuts dappled holes in the shadow.
 */
export function createCanopyDepthMaterial(map: THREE.Texture) {
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.4, side: THREE.DoubleSide });
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec3 aOffset;\nattribute vec4 aParams;")
      .replace(
        "#include <project_vertex>",
        `vec4 mvCenter = modelViewMatrix * vec4(aOffset, 1.0);
        float cr = cos(aParams.y);
        float sr = sin(aParams.y);
        vec4 mvPosition = mvCenter + vec4(mat2(cr, -sr, sr, cr) * position.xy * aParams.x * 0.85, 0.0, 0.0);
        gl_Position = projectionMatrix * mvPosition;`
      );
  };
  m.customProgramCacheKey = () => "join-canopy-depth-v1";
  return m;
}

/** Tube whose radius tapers linearly from r0 to r1 along the curve. */
export function taperedTube(points: THREE.Vector3[], r0: number, r1: number, segments = 16, radial = 8) {
  const curve = new THREE.CatmullRomCurve3(points);
  const g = new THREE.TubeGeometry(curve, segments, 1, radial, false);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const centre = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    curve.getPointAt(t, centre);
    const r = r0 + (r1 - r0) * t;
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      pos.setXYZ(k, centre.x + (pos.getX(k) - centre.x) * r, centre.y + (pos.getY(k) - centre.y) * r, centre.z + (pos.getZ(k) - centre.z) * r);
    }
  }
  g.computeVertexNormals();
  return g;
}

export interface TreeSpec {
  position: [number, number, number];
  height: number;
  lean: number;
  seed: number;
}

/** Trunk plus three or four main limbs reaching into the canopy, in world space. */
export function treeParts({ position: [x, y, z], height, lean, seed }: TreeSpec): Part[] {
  const rand = seeded(seed);
  const top = new THREE.Vector3(x + lean, y + height, z);
  const trunk = taperedTube(
    [new THREE.Vector3(x, y - 0.1, z), new THREE.Vector3(x + lean * 0.2, y + height * 0.4, z + 0.05), new THREE.Vector3(x + lean * 0.6, y + height * 0.75, z - 0.05), top],
    0.34,
    0.16,
    10,
    14
  );
  const parts: Part[] = [{ geometry: trunk }];
  // Root flare.
  parts.push({ geometry: taperedTube([new THREE.Vector3(x, y - 0.05, z), new THREE.Vector3(x, y + 0.5, z)], 0.52, 0.32, 3, 10) });
  const limbs = 3 + Math.floor(rand() * 2);
  for (let l = 0; l < limbs; l++) {
    const a = (l / limbs) * Math.PI * 2 + rand();
    const reach = 1.3 + rand() * 1.0;
    const start = new THREE.Vector3(x + lean * 0.55, y + height * (0.62 + rand() * 0.15), z);
    const mid = start.clone().add(new THREE.Vector3(Math.cos(a) * reach * 0.5, 0.7 + rand() * 0.4, Math.sin(a) * reach * 0.5));
    const end = start.clone().add(new THREE.Vector3(Math.cos(a) * reach, 1.5 + rand() * 0.8, Math.sin(a) * reach));
    parts.push({ geometry: taperedTube([start, mid, end], 0.13, 0.03, 8, 6) });
  }
  return parts;
}

export function buildTrunks(trees: TreeSpec[], extra: Part[] = []) {
  return mergeParts([...trees.flatMap(treeParts), ...extra]);
}
