"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

// Deterministic procedural crowd placement outside render function
function generateCrowdSimulationData(count: number) {
  let seed = 1337;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const RinSq = 2.2 * 2.2;
  const RoutSq = 12.0 * 12.0;
  const deltaRsq = RoutSq - RinSq;

  const matrices = new Float32Array(count * 16);
  const speeds = new Float32Array(count);
  const phases = new Float32Array(count);

  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    // Square-root uniform distribution across the annulus
    const u = rand();
    const v = rand();
    const r = Math.sqrt(u * deltaRsq + RinSq);
    const theta = v * Math.PI * 2;

    let x = r * Math.cos(theta);
    const z = r * Math.sin(theta);

    // Camera clearance corridor: Clear a 1.4m bubble around camera at (0, 4.2)
    const distToCamera = Math.hypot(x, z - 4.2);
    if (distToCamera < 1.4) {
      const signX = x >= 0 ? 1 : -1;
      x = signX * (1.35 + rand() * 0.8);
    }
    // Part the crowd slightly in front of the platform
    if (Math.abs(x) < 0.75 && z > 2.0 && z < 3.8) {
      const signX = x >= 0 ? 1 : -1;
      x = signX * (0.8 + rand() * 0.5);
    }

    // Instance faces toward center with organic jitter
    const angleToCenter = Math.atan2(-x, -z) + (rand() - 0.5) * 0.8;
    const heightScale = 0.85 + rand() * 0.3;
    const widthScale = 0.9 + rand() * 0.2;

    dummy.position.set(x, 0, z);
    dummy.rotation.set(0, angleToCenter, 0);
    dummy.scale.set(widthScale, heightScale, widthScale);
    dummy.updateMatrix();

    dummy.matrix.toArray(matrices, i * 16);

    speeds[i] = 0.92 + rand() * 0.16;
    phases[i] = rand() * Math.PI * 2;
  }

  return {
    instanceMatrices: matrices,
    speedArray: speeds,
    phaseArray: phases,
  };
}

const crowdCache: Record<number, ReturnType<typeof generateCrowdSimulationData>> = {};
function getCrowdSimulationData(count: number) {
  if (!crowdCache[count]) {
    crowdCache[count] = generateCrowdSimulationData(count);
  }
  return crowdCache[count];
}

interface CrowdInstancedSimulationProps {
  isMobile?: boolean;
}

export function CrowdInstancedSimulation({
  isMobile = false,
}: CrowdInstancedSimulationProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = isMobile ? 3000 : 8000;

  // Single shared uniform for the animation timeline stored in a ref
  const uniformsRef = useRef({
    uTime: { value: 0 },
  });

  // 1. Annulus Distribution (Deterministic Pure Cache)
  const { instanceMatrices, speedArray, phaseArray } = useMemo(
    () => getCrowdSimulationData(count),
    [count]
  );

  // 2. Procedural Crowd Silhouette Geometry with Instanced Attributes
  const crowdGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.8, 1.6);
    geom.translate(0, 0.8, 0);
    geom.setAttribute(
      "aSpeed",
      new THREE.InstancedBufferAttribute(speedArray, 1)
    );
    geom.setAttribute(
      "aPhase",
      new THREE.InstancedBufferAttribute(phaseArray, 1)
    );
    return geom;
  }, [speedArray, phaseArray]);

  const crowdTexture = useTexture("/media/crowd_alpha.png");

  // 3. MeshBasicMaterial with Alpha Billboarding
  const crowdMaterial = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#020100"),
      transparent: true,
      alphaMap: crowdTexture,
      alphaTest: 0.5,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniformsRef.current.uTime;

      shader.vertexShader = `
        attribute float aSpeed;
        attribute float aPhase;
        uniform float uTime;
      ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>
        // 128 BPM = ~13.4 rad/sec percussive Kuthu bounce
        float bpmFrequency = 13.4;
        float jumpNoise = sin(uTime * bpmFrequency * aSpeed + aPhase);
        float jump = smoothstep(-0.2, 1.0, jumpNoise) * 0.16;

        float swayX = sin(uTime * 4.0 + aPhase) * 0.08;
        float swayZ = cos(uTime * 4.0 + aPhase) * 0.08;

        if (transformed.y > 0.05) {
          transformed.y += jump;
          transformed.x += swayX;
          transformed.z += swayZ;
        }
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        "#include <project_vertex>",
        `
        // Spherical Billboarding for InstancedMesh
        // Extract scale from instanceMatrix
        float scaleX = length(vec3(instanceMatrix[0][0], instanceMatrix[1][0], instanceMatrix[2][0]));
        float scaleY = length(vec3(instanceMatrix[0][1], instanceMatrix[1][1], instanceMatrix[2][1]));

        // Get instance position (translation part)
        vec3 instancePos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);

        // Transform instance position to view space
        vec4 mvPosition = modelViewMatrix * vec4(instancePos, 1.0);

        // Add locally transformed position scaled by instance scale (billboard facing camera)
        mvPosition.xy += transformed.xy * vec2(scaleX, scaleY);

        gl_Position = projectionMatrix * mvPosition;
        `
      );
    };

    return mat;
  }, [crowdTexture]);

  // 4. Per-frame time update
  useFrame(({ clock }) => {
    uniformsRef.current.uTime.value = clock.getElapsedTime();
  });

  // Apply instance matrices when ref mounts
  React.useEffect(() => {
    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [instanceMatrices]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[crowdGeometry, crowdMaterial, count]}
      frustumCulled={false}
      castShadow={false}
      receiveShadow={false}
    >
      <instancedBufferAttribute
        attach="instanceMatrix"
        args={[instanceMatrices, 16]}
      />
    </instancedMesh>
  );
}
