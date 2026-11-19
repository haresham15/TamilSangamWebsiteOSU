import * as THREE from "three";
import { useEffect, useMemo } from "react";

export interface BacklitRim {
  /** World position of the light behind the subject; the rim forms on edges turned toward it. */
  lightPosition: [number, number, number];
  /** HDR multiplier (the grade blooms values above ~0.75). */
  strength: number;
}

/**
 * Injects a cinematic Fresnel rim light into a standard/physical material.
 * Without `backlit`, the legacy all-round view-angle rim. With it, the rim is masked to
 * the edges that face the light behind the subject, so the body stays in silhouette and
 * only the outline catches fire. Returns a material with lifecycle disposal.
 */
export function useRimShaderMaterial(
  baseColor: THREE.ColorRepresentation = 0x250d38,
  rimColor: THREE.ColorRepresentation = 0xff6b00,
  roughness: number = 0.65,
  metalness: number = 0.1,
  backlit?: BacklitRim
) {
  const lx = backlit?.lightPosition[0];
  const ly = backlit?.lightPosition[1];
  const lz = backlit?.lightPosition[2];
  const strength = backlit?.strength;
  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      roughness,
      metalness,
      side: strength !== undefined ? THREE.DoubleSide : THREE.FrontSide,
    });
    const rimLight = new THREE.Vector3(lx ?? 0, ly ?? 0, lz ?? 0);

    mat.onBeforeCompile = (shader) => {
      // Pass the uniform for the rim color
      shader.uniforms.rimColor = { value: new THREE.Color(rimColor) };
      shader.uniforms.rimLight = { value: rimLight };
      shader.uniforms.rimStrength = { value: strength ?? 2.0 };

      // Inject varying for view vector and normal
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        `
        #include <project_vertex>
        vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vWorldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * objectNormal);
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
        #include <common>
        uniform vec3 rimColor;
        uniform vec3 rimLight;
        uniform float rimStrength;
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        `
      );

      const rim =
        strength !== undefined
          ? `
        vec3 normalRim = normalize(vWorldNormal) * (gl_FrontFacing ? 1.0 : -1.0);
        vec3 viewDirRim = normalize(cameraPosition - vWorldPosition);
        vec3 lightDirRim = normalize(rimLight - vWorldPosition);
        float grazing = pow(1.0 - max(dot(viewDirRim, normalRim), 0.0), 1.6);
        float towardLight = smoothstep(-0.55, 0.45, dot(normalRim, lightDirRim));
        gl_FragColor.rgb += rimColor * grazing * towardLight * rimStrength;
        `
          : `
        vec3 normalRim = normalize(vWorldNormal);
        vec3 viewDirRim = normalize(cameraPosition - vWorldPosition);
        // Standard fresnel approximation
        float f = 1.0 - max(dot(viewDirRim, normalRim), 0.0);
        // Sharpen the rim
        f = smoothstep(0.6, 1.0, f);
        // Add rim contribution to final color
        gl_FragColor.rgb += rimColor * f * rimStrength; // Boost multiplier for cinematic look
        `;

      // We inject before outgoing light is finalized, modifying total diffuse or outgoing light
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        ${rim}
        `
      );
    };
    mat.customProgramCacheKey = () => (strength !== undefined ? "rim-backlit" : "rim-legacy");

    return mat;
  }, [baseColor, rimColor, roughness, metalness, lx, ly, lz, strength]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return material;
}
