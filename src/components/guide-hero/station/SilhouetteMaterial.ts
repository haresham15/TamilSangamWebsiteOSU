"use client";

import * as THREE from "three";

export interface SilhouetteMaterialOptions {
  sdfA: THREE.Texture;
  sdfB: THREE.Texture;
  fog?: boolean;
}

export function createSilhouetteMaterial({ sdfA, sdfB, fog = false }: SilhouetteMaterialOptions): THREE.ShaderMaterial {
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
        uHaloWidth: { value: 0.065 },
        uRimStrength: { value: 0.55 },
        uInk: { value: new THREE.Color(0.012, 0.012, 0.014) }, // Near-black ink (#030303)
        uRim: { value: new THREE.Color(1.0, 0.72, 0.44) }, // Warm halation (#ffb870)
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
        float grain = (hash(vUv * 256.0 + fract(uTime * 3.0)) - 0.5) * 0.018;
        vec3 inkCol = clamp(uInk + vec3(grain), 0.0, 1.0);
        vec3 col = inkCol * body + uRim * halo * uRimStrength;
        float alpha = max(body, halo * uRimStrength);
        if (alpha < 0.01) discard;

        gl_FragColor = vec4(col, alpha);
        #include <fog_fragment>
      }
    `,
  });
}
