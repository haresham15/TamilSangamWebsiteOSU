"use client";

import * as THREE from "three";

export interface SilhouetteMaterialOptions {
  sdfA: THREE.Texture;
  sdfB: THREE.Texture;
  fog?: boolean;
  kind?: "woman" | "man";
}

export function createSilhouetteMaterial({ sdfA, sdfB, fog = false, kind = "woman" }: SilhouetteMaterialOptions): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog,
    uniforms: THREE.UniformsUtils.merge([
      fog ? THREE.UniformsLib.fog : {},
      {
        uSdfA: { value: sdfA },
        uSdfB: { value: sdfB },
        uPose: { value: 0.0 },
        uTime: { value: 0.0 },
        uHaloWidth: { value: 0.05 },
        uRimStrength: { value: 0.65 },
        uIsMan: { value: kind === "man" ? 1.0 : 0.0 },
        uInk: { value: new THREE.Color(0.024, 0.038, 0.062) }, // Deep blue-black (#060A10)
        uRim: { value: new THREE.Color(0.65, 0.94, 0.81) }, // Mint (#A6F0CF)
      },
    ]),
    vertexShader: `
      varying vec2 vUv;
      #include <fog_pars_vertex>

      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D uSdfA;
      uniform sampler2D uSdfB;
      uniform float uPose;
      uniform float uTime;
      uniform float uHaloWidth;
      uniform float uRimStrength;
      uniform float uIsMan;
      uniform vec3 uInk;
      uniform vec3 uRim;

      #include <fog_pars_fragment>

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        float d = mix(texture2D(uSdfA, vUv).r, texture2D(uSdfB, vUv).r, uPose);
        float aa = fwidth(d);
        float body = smoothstep(0.5 - aa, 0.5 + aa, d);
        float halo = smoothstep(0.5 - uHaloWidth, 0.5, d) * (1.0 - body);
        float grain = (hash(vUv * 256.0 + fract(uTime * 3.0)) - 0.5) * 0.015;
        vec3 inkCol = clamp(uInk + vec3(grain), 0.0, 1.0);

        vec3 col;
        float alpha;

        if (uIsMan > 0.5) {
          // Screen-space gradient of the SDF field d
          vec2 grad = normalize(vec2(dFdx(d), dFdy(d)) + vec2(1e-5));

          // Right/Front Edge Facing the Window (grad.x < 0.0): Mint (#A6F0CF)
          float frontEdge = smoothstep(-0.25, 0.85, -grad.x);
          // Left/Top Edge Facing Platform Lamps (grad.x > 0.0 || grad.y > 0.0): Cool Blue-Hour Rim (#68A8E8)
          float backEdge = smoothstep(-0.25, 0.85, grad.x + grad.y * 0.45);

          vec3 warmRimCol = vec3(0.65, 0.94, 0.81); // #A6F0CF
          vec3 coolRimCol = vec3(0.41, 0.66, 0.91); // #68A8E8

          float warmHalo = halo * frontEdge * 0.85;
          float coolHalo = halo * backEdge * 0.65;

          col = inkCol * body + warmRimCol * warmHalo + coolRimCol * coolHalo;
          alpha = max(body, (warmHalo + coolHalo));
        } else {
          // Seated Woman inside window: Mint halo (#A6F0CF) along silhouette
          vec3 warmRimCol = vec3(1.0, 0.74, 0.34);
          col = inkCol * body + warmRimCol * halo * uRimStrength;
          alpha = max(body, halo * uRimStrength);
        }

        if (alpha < 0.01) discard;

        gl_FragColor = vec4(col, alpha);
        #include <fog_fragment>
      }
    `,
  });
}
