import * as THREE from "three";
import { useEffect, useMemo } from "react";

/**
 * Injects a cinematic Fresnel rim light into a standard/physical material.
 * Returns a configured material instance with lifecycle disposal.
 */
export function useRimShaderMaterial(
  baseColor: THREE.ColorRepresentation = 0x250d38,
  rimColor: THREE.ColorRepresentation = 0xff6b00,
  roughness: number = 0.65,
  metalness: number = 0.1
) {
  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      roughness,
      metalness,
    });

    mat.onBeforeCompile = (shader) => {
      // Pass the uniform for the rim color
      shader.uniforms.rimColor = { value: new THREE.Color(rimColor) };
      
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
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        `
      );

      // We inject before outgoing light is finalized, modifying total diffuse or outgoing light
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        
        vec3 normalRim = normalize(vWorldNormal);
        vec3 viewDirRim = normalize(cameraPosition - vWorldPosition);
        // Standard fresnel approximation
        float f = 1.0 - max(dot(viewDirRim, normalRim), 0.0);
        // Sharpen the rim
        f = smoothstep(0.6, 1.0, f);
        
        // Add rim contribution to final color
        gl_FragColor.rgb += rimColor * f * 2.0; // Boost multiplier for cinematic look
        `
      );
    };

    return mat;
  }, [baseColor, rimColor, roughness, metalness]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return material;
}
