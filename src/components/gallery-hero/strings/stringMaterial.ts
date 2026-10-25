import * as THREE from "three";

/**
 * LAYER 3: KAJIYA-KAY ANISOTROPIC PHOSPHOR-BRONZE STRING SHADER
 * 
 * Implements:
 * 1. Multi-Harmonic Standing-Wave Pluck Displacement pinned at both ends (bridge uv.y=0.0, nut uv.y=1.0)
 * 2. Micro-Helical Winding with fwidth() Anti-Aliasing (completely eradicating low-frequency sawtooth aliasing)
 * 3. Kajiya-Kay Anisotropic Specular along string tangent T:
 *    - sinTH^28 broad warm phosphor bronze sheen
 *    - sinTH^180 razor-sharp golden glint
 * 4. Twilight sky Fresnel rim + vibrating string golden halation glow
 */

export const StringVertexShader = `
  uniform float uTime;
  uniform float uPluckAmp;      // Decaying pluck amplitude [0..1]
  uniform float uPluckFreq;     // String visual natural frequency
  uniform float uScrollVel;     // Sympathetic scroll velocity
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vTangent;
  varying float vStringEnergy;

  void main() {
    vUv = uv;

    // Pin string at both ends: bridge uv.y = 0.0, nut uv.y = 1.0
    float env1 = sin(uv.y * 3.14159265);
    float env2 = sin(uv.y * 6.28318530) * 0.35;
    float env3 = sin(uv.y * 9.42477796) * 0.12;

    float wave = (env1 * sin(uTime * uPluckFreq)
                + env2 * cos(uTime * uPluckFreq * 1.98)
                + env3 * sin(uTime * uPluckFreq * 2.95)) * uPluckAmp;

    // Subtle sympathetic scroll-velocity bow
    float bow = env1 * uScrollVel * 0.06;

    vec3 pos = position;
    // Displace perpendicular to string length
    pos.x += (wave + bow) * 0.18;
    pos.z += (wave * 0.4) * 0.10;

    vStringEnergy = clamp(abs(uPluckAmp) * 1.4 + abs(uScrollVel) * 0.4, 0.0, 1.0);
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPosition.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    // String length tangent points along local Y (from bridge to nut)
    vTangent = normalize(mat3(modelMatrix) * vec3(0.0, 1.0, 0.0));
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const StringFragmentShader = `
  uniform float uIsWound;       // 1.0 for Phosphor Bronze (0..3), 0.0 for Plain Steel/Gold (4..5)
  uniform vec3 uCameraPos;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vTangent;
  varying float vStringEnergy;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 T = normalize(vTangent);
    vec3 V = normalize(uCameraPos - vWorldPos);
    vec3 L = normalize(vec3(-2.5, 4.0, 3.5)); // Warm golden-hour key light
    vec3 H = normalize(L + V);

    // Micro-helical winding with fwidth() anti-aliasing (NO sawtooth aliasing!)
    float windingCoord = vUv.y * 480.0 + vUv.x * 2.0;
    float fw = fwidth(windingCoord);
    float fadeOut = 1.0 - smoothstep(0.20, 0.85, fw); // Smooths gracefully with distance
    float groove = sin(windingCoord * 6.283185) * 0.5 + 0.5;
    float microGroove = mix(0.88, 0.55 + 0.45 * groove, uIsWound * fadeOut);

    // Base metal alloy:
    // Wound: Warm Phosphor-Bronze (vec3(0.82, 0.48, 0.22))
    // Plain: High-Carbon Polished Gold-Steel (vec3(0.95, 0.90, 0.82))
    vec3 baseMetal = mix(vec3(0.95, 0.90, 0.82), vec3(0.82, 0.48, 0.22), uIsWound);

    // Kajiya-Kay Anisotropic Specular along string tangent T
    float TdotH = dot(T, H);
    float sinTH = sqrt(max(0.0, 1.0 - TdotH * TdotH));
    float dirAtten = smoothstep(-0.8, 0.1, dot(N, L));

    // Broad warm sheen (power 28) + razor-sharp golden sun glint (power 180)
    float anisoSpec1 = pow(sinTH, 28.0) * dirAtten * 1.35;
    float anisoSpec2 = pow(sinTH, 180.0) * dirAtten * 2.4;

    // Twilight sky Fresnel rim
    float fresnel = pow(1.0 - max(0.0, dot(N, V)), 3.0);
    vec3 skyRim = vec3(0.35, 0.58, 0.72) * fresnel * 0.45;

    // Vibrating string golden halation glow
    vec3 energyGlow = vec3(1.0, 0.74, 0.32) * vStringEnergy * 0.85;

    vec3 color = baseMetal * microGroove * (0.35 + 0.65 * max(0.0, dot(N, L)))
               + baseMetal * anisoSpec1 * microGroove
               + vec3(1.0, 0.94, 0.80) * anisoSpec2
               + skyRim
               + energyGlow;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface SingleStringUniforms {
  uTime: { value: number };
  uPluckAmp: { value: number };
  uPluckFreq: { value: number };
  uScrollVel: { value: number };
  uIsWound: { value: number };
  uCameraPos: { value: THREE.Vector3 };
}

export function createKajiyaKayStringMaterial(isWound: boolean, naturalHz: number) {
  const uniforms: SingleStringUniforms = {
    uTime: { value: 0.0 },
    uPluckAmp: { value: 0.0 },
    uPluckFreq: { value: Math.min(36.0, naturalHz * 0.15) }, // Normalized visual wave frequency
    uScrollVel: { value: 0.0 },
    uIsWound: { value: isWound ? 1.0 : 0.0 },
    uCameraPos: { value: new THREE.Vector3(0, 2, 5) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: StringVertexShader,
    fragmentShader: StringFragmentShader,
    uniforms: uniforms as unknown as { [uniform: string]: THREE.IUniform },
  });

  return { material, uniforms };
}

// Anamorphic Lens Streak Billboard Shader (Golden-Teal horizontal flash on pluck)
export const AnamorphicStreakShader = {
  uniforms: {
    uOpacity: { value: 0.0 },
    uColorGold: { value: new THREE.Color("#FFB84D") },
    uColorTeal: { value: new THREE.Color("#55B8B0") },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uOpacity;
    uniform vec3 uColorGold;
    uniform vec3 uColorTeal;
    varying vec2 vUv;

    void main() {
      // Horizontal flare: sharp vertically (y), elongated horizontally (x)
      float xDist = abs(vUv.x - 0.5) * 2.0;
      float yDist = abs(vUv.y - 0.5) * 2.0;

      float xFalloff = exp(-xDist * 2.2);
      float yFalloff = exp(-yDist * 16.0);
      float alpha = xFalloff * yFalloff * uOpacity;

      // Golden center with subtle cyan-teal wings
      vec3 col = mix(uColorGold, uColorTeal, xDist * 0.45);
      gl_FragColor = vec4(col, alpha);
    }
  `,
};
