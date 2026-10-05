"use client";

import * as THREE from "three";

/**
 * Creates the patched MeshStandardMaterial for Instanced Flap Cells (PRD §4.4).
 * Handles vertex-shader hinge rotation, atlas UV mapping, analytic seam shadows,
 * and flap dynamic occlusion while keeping PBR env lighting.
 */
export function createCellMaterial(atlasTexture: THREE.Texture): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    roughness: 0.55,
    metalness: 0.0,
    side: THREE.FrontSide,
  });

  const uniforms = {
    uAtlas: { value: atlasTexture },
  };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uAtlas = uniforms.uAtlas;

    // --- Vertex Shader Hooks ---
    shader.vertexShader = `
      attribute float aPart;
      attribute float aCur;
      attribute float aNxt;
      attribute float aAngle;
      attribute float aSeed;
      varying float vPart;
      varying float vGlyph;
      varying float vHalf;
      varying vec2 vLocal;
      varying float vAngle;
      varying float vSeed;
      ${shader.vertexShader}
    `;

    // 1. Rotate normal for moving flap parts (Part 2 & 3)
    shader.vertexShader = shader.vertexShader.replace(
      "#include <beginnormal_vertex>",
      `
      #include <beginnormal_vertex>
      if (aPart > 1.5 && aPart < 3.5) {
        float c = cos(aAngle), s = sin(aAngle);
        objectNormal = vec3(objectNormal.x, objectNormal.y * c - objectNormal.z * s, objectNormal.y * s + objectNormal.z * c);
      }
      `
    );

    // 2. Rotate position for moving flap parts (Part 2 & 3) & pass varyings
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      vec3 transformed = vec3(position);
      if (aPart > 1.5 && aPart < 3.5) {
        float c = cos(aAngle), s = sin(aAngle);
        transformed = vec3(transformed.x, transformed.y * c - transformed.z * s, transformed.y * s + transformed.z * c);
      }
      vPart = aPart;
      vAngle = aAngle;
      vSeed = aSeed;
      vLocal = uv;
      // Parts 0 and 3 show nxt glyph; parts 1 and 2 show cur glyph (PRD §4.3)
      vGlyph = (aPart < 0.5 || (aPart > 2.5 && aPart < 3.5)) ? aNxt : aCur;
      // Parts 0 and 2 are top halves (1.0); parts 1 and 3 are bottom halves (0.0)
      vHalf = (aPart < 0.5 || (aPart > 1.5 && aPart < 2.5)) ? 1.0 : 0.0;
      `
    );

    // --- Fragment Shader Hooks ---
    shader.fragmentShader = `
      uniform sampler2D uAtlas;
      varying float vPart;
      varying float vGlyph;
      varying float vHalf;
      varying vec2 vLocal;
      varying float vAngle;
      varying float vSeed;
      ${shader.fragmentShader}
    `;

    // 3. Texture Atlas Sampling & Physical Flap Micro-Shadows (PRD §4.4)
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `
      #include <color_fragment>
      const float GRID = 8.0;
      const float PAD = 0.08;
      float g = floor(vGlyph + 0.5);
      vec2 cellXY = vec2(mod(g, GRID), floor(g / GRID));
      // Top half = upper 0.5..1.0 of the cell; bottom half = 0.0..0.5
      vec2 inCell = vec2(vLocal.x, vHalf * 0.5 + vLocal.y * 0.5);
      inCell = vec2(PAD) + (1.0 - 2.0 * PAD) * inCell;
      vec2 auv = (vec2(cellXY.x, GRID - 1.0 - cellXY.y) + inCell) / GRID;
      float cov = texture2D(uAtlas, auv).r;

      // Base color: #1A1A1A background to #FAFAFA painted glyph (PRD §4.4)
      vec3 base = mix(vec3(0.102), vec3(0.980), cov);
      // Subtle physical wear variance per cell
      base *= 0.94 + 0.06 * fract(sin(vSeed * 91.7) * 437.5);

      // Analytic split seam gap between halves
      float seam = smoothstep(0.0, 0.04, 1.0 - vLocal.y);
      base *= mix(0.30, 1.0, seam);

      // Static halves darken dynamically as moving flap passes over them
      if (vPart < 1.5) {
        base *= 1.0 - 0.38 * sin(clamp(vAngle, 0.0, 3.14159));
      }
      // Cell housing frame and hinge pins
      if (vPart > 3.5) {
        base = vec3(0.04);
      }
      // Highlight on flap free edge
      if (vPart > 1.5 && vPart < 3.5 && vLocal.y > 0.96) {
        base += vec3(0.08);
      }

      diffuseColor.rgb = base;
      `
    );
  };

  // Ensure Three.js tracks custom uniforms across re-compiles
  (material as unknown as { customUniforms: typeof uniforms }).customUniforms = uniforms;

  return material;
}
