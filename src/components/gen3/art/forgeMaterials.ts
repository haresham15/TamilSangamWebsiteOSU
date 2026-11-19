// Materials and procedural textures for the forge arena. Factories only: callers memoise
// and dispose (useDisposeOnUnmount). Nothing here allocates at module scope.
import * as THREE from "three";
import { seeded } from "@/gl/art/geometry";
import { withSurfaceDetail } from "@/gl/art/surface";

/** Blackened structural steel: oily dark body, rust blooming in creases, bright worn arrises. */
export function createSteelMaterial() {
  return withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#2b2622", roughness: 0.48, metalness: 0.7, envMapIntensity: 2.2 }), {
    scale: 4,
    albedoVariation: 0.26,
    tint: "#6b3418",
    tintAmount: 0.3,
    roughnessVariation: 0.16,
    bump: 0,
    cavity: true,
    cavityStrength: 0.85,
    cavityColor: "#120a05",
    wearColor: "#b3a796",
    wearAmount: 0.6,
    wearRoughness: -0.18,
    grimeColor: "#2a170b",
    grimeAmount: 0.5,
    grimeFrom: 0,
    grimeTo: 1.4,
  });
}

/** Poured concrete floor, scuffed and damp in patches so the backlight streaks across it. */
export function createFloorMaterial() {
  // Mostly matte, with large damp patches (low roughness) that pick up the lamp array.
  return withSurfaceDetail(new THREE.MeshStandardMaterial({ color: "#090807", roughness: 0.6, metalness: 0.0 }), {
    scale: 0.55,
    albedoVariation: 0.06,
    tint: "#2a1d12",
    tintAmount: 0.2,
    roughnessVariation: 0.4,
    bump: 0.0008,
  });
}

/**
 * Corrugated sheet-steel wall panel, tiling horizontally (8 m per tile), 15 m tall: ribs,
 * lapped panel seams with rivet lines, rust runs from the seams, soot toward the roof.
 */
export function createWallTexture(size = 1024) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const rand = seeded(41);
  const k = size / 1024;

  ctx.fillStyle = "#3a332d";
  ctx.fillRect(0, 0, size, size);

  // Corrugation: 64 ribs per tile, each shaded like a rounded profile.
  const pitch = size / 64;
  for (let i = 0; i < 64; i++) {
    const x = i * pitch;
    const g = ctx.createLinearGradient(x, 0, x + pitch, 0);
    g.addColorStop(0, "rgba(0,0,0,0.38)");
    g.addColorStop(0.35, "rgba(255,240,220,0.07)");
    g.addColorStop(0.55, "rgba(255,240,220,0.1)");
    g.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, pitch, size);
  }

  // Horizontal laps every 3 m with rivet lines; slight colour shift per panel.
  const laps = 5;
  for (let p = 0; p < laps; p++) {
    const y0 = (p * size) / laps;
    ctx.fillStyle = `rgba(${40 + rand() * 30},${28 + rand() * 18},${18 + rand() * 10},${0.15 + rand() * 0.15})`;
    ctx.fillRect(0, y0, size, size / laps);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, y0, size, 3 * k);
    ctx.fillStyle = "rgba(255,230,200,0.08)";
    ctx.fillRect(0, y0 + 3 * k, size, 2 * k);
    for (let x = pitch * 0.5; x < size; x += pitch * 2) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      ctx.arc(x, y0 + 10 * k, 3.2 * k, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,225,190,0.14)";
      ctx.beginPath();
      ctx.arc(x - 0.8 * k, y0 + 9 * k, 1.6 * k, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Rust runs from the laps and rivets.
  for (let i = 0; i < 140; i++) {
    const x = rand() * size;
    const y0 = Math.floor(rand() * laps) * (size / laps) + 6 * k;
    const len = (30 + rand() * 180) * k;
    const g = ctx.createLinearGradient(x, y0, x, y0 + len);
    g.addColorStop(0, `rgba(${120 + rand() * 50},${48 + rand() * 20},${14},${0.25 + rand() * 0.3})`);
    g.addColorStop(1, "rgba(80,30,10,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y0, (2 + rand() * 6) * k, len);
  }

  // Soot toward the roof, splash grime at the base.
  const soot = ctx.createLinearGradient(0, 0, 0, size * 0.55);
  soot.addColorStop(0, "rgba(6,4,3,0.85)");
  soot.addColorStop(1, "rgba(6,4,3,0)");
  ctx.fillStyle = soot;
  ctx.fillRect(0, 0, size, size * 0.55);
  const base = ctx.createLinearGradient(0, size, 0, size * 0.82);
  base.addColorStop(0, "rgba(10,7,5,0.8)");
  base.addColorStop(1, "rgba(10,7,5,0)");
  ctx.fillStyle = base;
  ctx.fillRect(0, size * 0.82, size, size * 0.18);

  // Blotchy weathering.
  for (let i = 0; i < 60; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = (20 + rand() * 90) * k;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${0.12 + rand() * 0.2})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createWallMaterial(map: THREE.Texture | null, anisotropy: number) {
  if (map) map.anisotropy = anisotropy;
  return withSurfaceDetail(
    new THREE.MeshStandardMaterial({ color: "#8a7f74", map, roughness: 0.78, metalness: 0.35 }),
    { scale: 1.2, albedoVariation: 0.2, roughnessVariation: 0.12, bump: 0 }
  );
}

/**
 * Hot metal in the stage's step slot: white-yellow where it is hottest, cooling through
 * orange to dull red, the heat crawling slowly round the ring. HDR output for the grade.
 */
export function createHotSeamMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uHeat: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uHeat;
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      float noise(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash(i), hash(i + 1.0), f); }
      void main() {
        float a = vUv.x * 96.0;
        float n = noise(a * 0.35 + uTime * 0.25) * 0.65 + noise(a * 1.7 - uTime * 0.6) * 0.35;
        float heat = clamp(n * 1.25 - 0.1, 0.0, 1.0) * uHeat;
        vec3 dull = vec3(0.35, 0.05, 0.01);
        vec3 orange = vec3(1.6, 0.45, 0.06);
        vec3 white = vec3(3.2, 2.1, 0.9);
        vec3 c = mix(dull, orange, smoothstep(0.1, 0.6, heat));
        c = mix(c, white, smoothstep(0.7, 1.0, heat));
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });
}

/** Lens of a stage lamp: hot filament glow inside a dark reflector, HDR. */
export function createLensMaterial() {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.62, 0.3).multiplyScalar(2.6), toneMapped: false });
  return m;
}
