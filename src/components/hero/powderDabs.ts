import * as THREE from "three";
import { WREATH_CY, WREATH_R_IN } from "./flowMath";

/**
 * Pulli dots as pinched dabs of rice powder (home hero, cinematic path): a low irregular
 * mound per dot, one instanced draw. Edges crumble in the fragment shader; each instance is
 * rotated and squashed a little so no two dabs match.
 */

/** Unit dab: radius 1, height 1 (scaled per instance). Centre + two rings. */
export function createDabGeometry(segments = 10): THREE.BufferGeometry {
  const positions: number[] = [0, 0, 1];
  const rings = [
    { r: 0.55, z: 0.72 },
    { r: 1.0, z: -0.15 },
  ];
  for (const ring of rings) {
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      positions.push(Math.cos(a) * ring.r, Math.sin(a) * ring.r, ring.z);
    }
  }
  const index: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = 1 + i;
    const b = 1 + ((i + 1) % segments);
    index.push(0, a, b);
    const c = 1 + segments + i;
    const d = 1 + segments + ((i + 1) % segments);
    index.push(a, c, d, a, d, b);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

export interface DabUniforms {
  uP: { value: number };
  uTime: { value: number };
  uCenter: { value: THREE.Vector2 };
  uTextRadius: { value: number };
}

export function createDabMaterial(depthDim: { value: THREE.Vector3 }): { material: THREE.MeshStandardMaterial; uniforms: DabUniforms } {
  const material = new THREE.MeshStandardMaterial({
    color: "#ece4d4",
    roughness: 0.95,
    metalness: 0,
    envMapIntensity: 0.35,
  });
  const uniforms: DabUniforms = {
    uP: { value: 0 },
    uTime: { value: 0 },
    uCenter: { value: new THREE.Vector2(0, WREATH_CY) },
    uTextRadius: { value: 1.15 * WREATH_R_IN },
  };

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms, { uDepthDim: depthDim });
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec2 vDabLocal;
        varying vec2 vDabPos;`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vDabLocal = position.xy;
        #ifdef USE_INSTANCING
          vDabPos = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xy;
        #else
          vDabPos = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xy;
        #endif`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uP;
        uniform float uTime;
        uniform vec2 uCenter;
        uniform float uTextRadius;
        uniform vec3 uDepthDim;
        varying vec2 vDabLocal;
        varying vec2 vDabPos;
        float dabHash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }
        float dabNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(dabHash(i), dabHash(i + vec2(1.0, 0.0)), f.x), mix(dabHash(i + vec2(0.0, 1.0)), dabHash(i + vec2(1.0, 1.0)), f.x), f.y);
        }`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float dabDim;
        {
          float r = length(vDabLocal);
          vec2 seed = vDabPos * 3.1;
          float ang = atan(vDabLocal.y, vDabLocal.x);
          float ragged = dabNoise(vec2(ang * 2.2, 0.0) + seed) * 0.6 + dabNoise(vDabLocal * 5.0 + seed) * 0.4;
          if (r > 0.62 + 0.38 * ragged) discard;
          float grain = dabNoise(vDabLocal * 7.0 + seed * 1.7) * 0.5 + dabNoise(vDabLocal * 19.0 + seed) * 0.5;
          // Porous rim: grains thin out toward the edge of the pinch.
          if (grain < smoothstep(0.35, 1.0, r) * 0.9) discard;
          diffuseColor.rgb *= 0.74 + 0.4 * grain;
          diffuseColor.rgb *= mix(1.0, 0.7, smoothstep(0.55, 1.0, r));

          // PRD §8.4 uTextMask: dabs fade behind the Kural once the wreath forms.
          float kuralFormT = smoothstep(0.42, 0.60, uP);
          float insideVoid = 1.0 - smoothstep(uTextRadius * 0.70, uTextRadius, length(vDabPos - uCenter));
          dabDim = mix(1.0, 0.18, kuralFormT * insideVoid);
          // Fade toward the stone's tone rather than to dark brown pebbles.
          diffuseColor.rgb = mix(vec3(0.075, 0.072, 0.068), diffuseColor.rgb, dabDim);
        }`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          // Faint warmth travelling down the lattice with the peel front (brightness only).
          float peelFrontY = mix(4.5, -9.08, smoothstep(0.12, 0.60, uP));
          float near = exp(-pow(vDabPos.y - peelFrontY, 2.0) / 1.2);
          float moving = smoothstep(0.03, 0.08, uP) * (1.0 - smoothstep(0.55, 0.62, uP));
          totalEmissiveRadiance += vec3(1.0, 0.64, 0.25) * near * moving * 0.22 * dabDim;
        }`
      )
      .replace("#include <opaque_fragment>", `
        // Depth falloff across the tilted stone (no DoF in the grade): far things sink into the dark.
        outgoingLight *= 1.0 - uDepthDim.z * smoothstep(uDepthDim.x, uDepthDim.y, length(vViewPosition));
        #include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => "home-powder-dab-v1";
  return { material, uniforms };
}
