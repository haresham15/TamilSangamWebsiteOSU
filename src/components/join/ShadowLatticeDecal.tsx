import React, { useMemo, useEffect } from "react";
import * as THREE from "three";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { proceduralPbrMaps } from "@/lib/proceduralPbrMaps";

export function ShadowLatticeDecal() {
  const isCinematic = isHeroCinematicEnabled("join");

  const walkwayNormal = useMemo(() => {
    if (!isCinematic) return null;
    return proceduralPbrMaps.getGraniteNormal("join-walkway-granite-normal", 256, 256);
  }, [isCinematic]);

  useEffect(() => {
    return () => {
      if (isCinematic) {
        proceduralPbrMaps.release("join-walkway-granite-normal");
      }
    };
  }, [isCinematic]);

  // Load Cobblestone PBR textures with morning dew glints via TextureLoader in useMemo
  const cobblestoneDiffuse = useMemo(() => {
    const tex = new THREE.TextureLoader().load("/textures/join/cobblestone_diffuse.png?v=3");
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 12);
    tex.anisotropy = 8;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const cobblestoneRoughness = useMemo(() => {
    const tex = new THREE.TextureLoader().load("/textures/join/cobblestone_roughness.png?v=3");
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 12);
    tex.anisotropy = 8;
    return tex;
  }, []);

  const walkwayMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: "#D1CCC0",
      map: cobblestoneDiffuse,
      roughnessMap: cobblestoneRoughness,
      normalMap: walkwayNormal || undefined,
      normalScale: isCinematic ? new THREE.Vector2(0.5, 0.5) : undefined,
      roughness: 0.95,
      metalness: 0.04,
      transparent: true,
    });
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
        .replace(
          "#include <dithering_fragment>",
          `#include <dithering_fragment>
float depthFade = smoothstep(-48.0, -42.0, vWorldPos.z);
gl_FragColor.a *= depthFade;
${
  isCinematic
    ? `
// Micro-detail 3: Morning dewdrop specular shimmer on cobblestone
float dew = smoothstep(0.92, 1.0, sin(vWorldPos.x * 14.0 + vWorldPos.z * 16.0)) * 0.14;
gl_FragColor.rgb += vec3(1.0, 0.95, 0.85) * dew;
`
    : ""
}`
        );
    };
    return mat;
  }, [cobblestoneDiffuse, cobblestoneRoughness, walkwayNormal, isCinematic]);

  const curbMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: "#E8E4D9",
      roughness: 0.85,
      metalness: 0.02,
      transparent: true,
    });
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
        .replace("#include <dithering_fragment>", "#include <dithering_fragment>\nfloat depthFade = smoothstep(-48.0, -42.0, vWorldPos.z);\ngl_FragColor.a *= depthFade;");
    };
    return mat;
  }, []);

  React.useEffect(() => {
    return () => {
      walkwayMaterial.dispose();
      curbMaterial.dispose();
    };
  }, [walkwayMaterial, curbMaterial]);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Extended Campus Cobblestone Promenade stretching through the Quad (z = +14m to -46m) */}
      <mesh
        position={[0, -0.05, -16]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={walkwayMaterial}
        receiveShadow
      >
        <planeGeometry args={[7.2, 60]} />
      </mesh>

      {/* Raised limestone curb borders flanking the promenade */}
      <mesh position={[-3.6, 0.08, -16]} material={curbMaterial} receiveShadow>
        <boxGeometry args={[0.35, 0.22, 60]} />
      </mesh>
      <mesh position={[3.6, 0.08, -16]} material={curbMaterial} receiveShadow>
        <boxGeometry args={[0.35, 0.22, 60]} />
      </mesh>
    </group>
  );
}
