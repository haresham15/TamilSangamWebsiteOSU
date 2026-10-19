"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

export function ShadowLatticeDecal() {
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
      roughness: 1.0,
      metalness: 0.04,
      transparent: true,
    });
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
        .replace("#include <dithering_fragment>", "#include <dithering_fragment>\nfloat depthFade = smoothstep(-6.0, -1.0, vWorldPos.z);\ngl_FragColor.a *= depthFade;");
    };
    return mat;
  }, [cobblestoneDiffuse, cobblestoneRoughness]);

  const curbMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: "#E8E4D9",
      roughness: 0.9,
      metalness: 0.02,
      transparent: true,
    });
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
        .replace("#include <dithering_fragment>", "#include <dithering_fragment>\nfloat depthFade = smoothstep(-6.0, -1.0, vWorldPos.z);\ngl_FragColor.a *= depthFade;");
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
      {/* 1. Campus Cobblestone Walkway Slab with Morning Dew Glints */}
      <mesh
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={walkwayMaterial}
        receiveShadow
      >
        <planeGeometry args={[14, 28]} />
      </mesh>

      {/* Stone curb borders flanking the path */}
      <mesh position={[-5.2, 0.08, 0]} material={curbMaterial} receiveShadow>
        <boxGeometry args={[0.4, 0.22, 28]} />
      </mesh>
      <mesh position={[5.2, 0.08, 0]} material={curbMaterial} receiveShadow>
        <boxGeometry args={[0.4, 0.22, 28]} />
      </mesh>
    </group>
  );
}
