import * as THREE from "three";

export interface StringUniforms {
  uTime: { value: number };
  uL: { value: number };
  uMaxAmp: { value: number };
  uPluckX: { value: number };
  uDamperPos: { value: number };
  uDamperK: { value: number };
  uLoadPos: { value: number };
  uLoadK: { value: number };
  uLoadDepth: { value: number };
}

/**
 * Creates a PBR MeshStandardMaterial patched with the exact 12-TET
 * multi-harmonic string vibration displacement shader (§3.3).
 */
export function createStringMaterial(): {
  material: THREE.MeshStandardMaterial;
  uniforms: StringUniforms;
} {
  const uniforms: StringUniforms = {
    uTime: { value: 0.0 },
    uL: { value: 100.0 },
    uMaxAmp: { value: 0.55 },
    uPluckX: { value: 0.15 },
    uDamperPos: { value: 70.625 },
    uDamperK: { value: 0.0 },
    uLoadPos: { value: 70.625 },
    uLoadK: { value: 0.0 },
    uLoadDepth: { value: 0.35 },
  };

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#B87333"),
    metalness: 0.95,
    roughness: 0.32,
  });

  material.onBeforeCompile = (shader) => {
    // Bind shared uniforms
    Object.assign(shader.uniforms, uniforms);

    // Inject attributes and uniforms into vertex shader
    shader.vertexShader = `
      attribute float aFreq;
      attribute float aEnergy;
      attribute float aPluckT;
      attribute float aPluckAmp;
      attribute float aPhase;
      attribute float aRadius;
      attribute float aWound;

      uniform float uTime;
      uniform float uL;
      uniform float uMaxAmp;
      uniform float uPluckX;
      uniform float uDamperPos;
      uniform float uDamperK;
      uniform float uLoadPos;
      uniform float uLoadK;
      uniform float uLoadDepth;

      varying vec2 vStringUV;
      varying float vWound;
    ` + shader.vertexShader;

    // Inject displacement logic right after <begin_vertex>
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>

      vStringUV = uv;
      vWound = aWound;

      vec3 pos = position;
      // Scale tube cross-section to string gauge radius
      pos.xy *= aRadius;

      // Distance along neck (base geometry runs from z = 0 to z = -100)
      float s = -pos.z;
      float u = clamp(s / uL, 0.0, 1.0);
      float yDisp = 0.0;

      // 1) Driven standing wave (scroll energy) - 3 harmonics
      if (aEnergy > 0.0001) {
        for (int n = 1; n <= 3; n++) {
          float fn = float(n);
          float wn = n == 1 ? 1.0 : (n == 2 ? 0.35 : 0.15);
          yDisp += wn * sin(3.14159265 * fn * u) * sin(6.2831853 * aFreq * fn * uTime + aPhase * fn);
        }
        yDisp *= aEnergy;
      }

      // 2) Plucked component: decaying modes
      if (aPluckT >= 0.0) {
        for (int n = 1; n <= 3; n++) {
          float fn = float(n);
          float a = sin(3.14159265 * fn * uPluckX) / (fn * fn);
          float w = 6.2831853 * aFreq * fn;
          float decay = exp(-aPluckT * (1.6 + 0.9 * (fn - 1.0)));
          yDisp += aPluckAmp * a * sin(3.14159265 * fn * u) * sin(w * aPluckT) * decay;
        }
      }

      // 3) Damper: tags pin the string where they touch it
      if (uDamperPos >= 0.0 && uDamperK > 0.0) {
        float dd = abs(s - uDamperPos);
        float ss = smoothstep(0.0, 14.0, dd);
        yDisp *= mix(1.0, ss, uDamperK);
      }

      // 4) Static load: the string sags under the tags
      if (uLoadK > 0.0) {
        float dist = (s - uLoadPos) / 2.2;
        yDisp -= uLoadDepth * uLoadK * exp(-dist * dist);
      }

      pos.y += yDisp * uMaxAmp;
      transformed = pos;
      `
    );

    // Inject fragment shader varying declarations
    shader.fragmentShader = `
      varying vec2 vStringUV;
      varying float vWound;
    ` + shader.fragmentShader;

    // Inject helical normal ridges for wound strings and distinct bronze vs plain steel colors
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <normal_fragment_begin>",
      `
      #include <normal_fragment_begin>

      if (vWound > 0.5) {
        // Helical winding texture on bronze strings (0, 1, 2)
        float bump = sin(vStringUV.y * 3600.0) * 0.28;
        normal = normalize(normal + vec3(0.0, bump, 0.0));
      }
      `
    );

    // Modulate base color: Bronze for wound, lustrous steel for plain
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `
      #include <color_fragment>

      // Bronze: #C57D3A (wound) vs Polished Steel: #D6D6D6 (plain)
      vec3 bronzeCol = vec3(0.77, 0.49, 0.23);
      vec3 steelCol  = vec3(0.84, 0.84, 0.84);
      diffuseColor.rgb = mix(steelCol, bronzeCol, vWound);
      `
    );
  };

  return { material, uniforms };
}
