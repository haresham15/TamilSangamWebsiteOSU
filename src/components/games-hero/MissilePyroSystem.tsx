// src/components/games-hero/MissilePyroSystem.tsx
"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { evaluateMissilesAndPyro } from "./gamesRail";

interface MissilePyroSystemProps {
  scrollP: number;
}

// ---------------------------------------------------------------------------
// 1. BILLOWING WHITE SMOKE CONTRAIL SHADER
// ---------------------------------------------------------------------------
const contrailVertexShader = /* glsl */ `
  uniform float uProgress;
  varying vec2 vUv;
  varying float vLife;

  void main() {
    vUv = uv;
    // Along curve parameter
    vLife = uv.x;
    vec3 transformed = position;
    // Subtle curl expansion
    transformed += normal * sin(uv.x * 24.0) * 0.18;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const contrailFragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform vec3 uColorLit;
  uniform vec3 uColorShade;
  varying vec2 vUv;
  varying float vLife;

  void main() {
    // Only render up to current flight progress
    if (vLife > uProgress) discard;

    // Billowing smoke puff noise
    float billow = sin(vUv.x * 32.0 + vUv.y * 8.0) * 0.5 + 0.5;
    vec3 smokeCol = mix(uColorShade, uColorLit, billow);

    // Soft feathered edges
    float edgeAlpha = sin(vUv.y * 3.14159);
    float headAlpha = clamp((uProgress - vLife) / 0.12, 0.0, 1.0);

    float alpha = edgeAlpha * clamp(headAlpha * 0.95, 0.0, 1.0);
    gl_FragColor = vec4(smokeCol, alpha);
  }
`;

// ---------------------------------------------------------------------------
// 2. VOLUMETRIC FBM FIREBALL EXPLOSION SHADER
// ---------------------------------------------------------------------------
const fireballVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    // Radial pulsing turbulent billowing displacement
    vec3 displaced = position + normal * (sin(position.x * 4.0 + uTime * 5.0) * cos(position.y * 4.0) * 0.22);
    vPosition = displaced;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fireballFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uAge;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    float r = length(vPosition);
    // Incandescent color gradient: Core white-yellow -> Orange -> Crimson -> Smoke soot
    vec3 coreColor = vec3(1.0, 0.98, 0.85);   // #FFFAD9 white-hot
    vec3 midColor = vec3(1.0, 0.46, 0.02);    // #FF7505 blazing fiery orange
    vec3 outerColor = vec3(0.85, 0.12, 0.0);  // #D91E00 deep crimson
    vec3 sootColor = vec3(0.18, 0.14, 0.11);  // #2E241C dark soot

    // Color gradient radially from center to edge + cooling into smoke
    float radial = clamp(r / 1.25, 0.0, 1.0);
    float t = clamp(radial * 0.7 + uAge * 0.65, 0.0, 1.0);

    vec3 col = coreColor;
    if (t < 0.32) {
      col = mix(coreColor, midColor, t / 0.32);
    } else if (t < 0.72) {
      col = mix(midColor, outerColor, (t - 0.32) / 0.40);
    } else {
      col = mix(outerColor, sootColor, (t - 0.72) / 0.28);
    }

    // Outer edge alpha falloff: solid core, soft billowing smoke rim
    float edgeFalloff = 1.0 - smoothstep(0.65, 1.35, r);
    float alpha = edgeFalloff * clamp(1.0 - uAge * 0.3, 0.0, 1.0) * uIntensity;
    gl_FragColor = vec4(col, clamp(alpha * 0.98, 0.0, 1.0));
  }
`;

export function MissilePyroSystem({ scrollP }: MissilePyroSystemProps) {
  const pyroState = useMemo(() => evaluateMissilesAndPyro(scrollP), [scrollP]);

  // Contrail Curves for the 3 incoming missiles
  const { curve1, curve2, curve3, contrailGeom1, contrailGeom2, contrailGeom3 } = useMemo(() => {
    // 1. Upper-Left High -> Center SUV (-0.5, 1.6, -31)
    const c1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-26, 16.5, 2),
      new THREE.Vector3(-14, 10.5, -12),
      new THREE.Vector3(-0.5, 1.6, -31),
    ]);
    // 2. Mid-Left Low -> Left SUV (-6.2, 1.4, -31)
    const c2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-26, 7.2, 0),
      new THREE.Vector3(-16, 5.0, -14),
      new THREE.Vector3(-6.2, 1.4, -31),
    ]);
    // 3. Upper-Right -> Right SUV (+5.2, 1.6, -31)
    const c3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(22, 13.5, 2),
      new THREE.Vector3(14, 8.5, -13),
      new THREE.Vector3(5.2, 1.6, -31),
    ]);

    const geom1 = new THREE.TubeGeometry(c1, 64, 0.55, 8, false);
    const geom2 = new THREE.TubeGeometry(c2, 64, 0.48, 8, false);
    const geom3 = new THREE.TubeGeometry(c3, 64, 0.52, 8, false);

    return {
      curve1: c1,
      curve2: c2,
      curve3: c3,
      contrailGeom1: geom1,
      contrailGeom2: geom2,
      contrailGeom3: geom3,
    };
  }, []);

  const contrailUniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uColorLit: { value: new THREE.Color("#F4F6F4") },
      uColorShade: { value: new THREE.Color("#9EA6A8") },
    }),
    []
  );

  const fireballUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAge: { value: 0 },
      uScale: { value: 0 },
      uIntensity: { value: 1.0 },
    }),
    []
  );

  // Instanced Debris Chunks (80 particles)
  const debrisCount = 80;
  const debrisData = useMemo(() => {
    const list: {
      origin: THREE.Vector3;
      velocity: THREE.Vector3;
      rotationSpeed: THREE.Vector3;
      scale: number;
    }[] = [];

    for (let i = 0; i < debrisCount; i++) {
      // Pick one of the 3 explosion epicenters
      const epicenter =
        i % 3 === 0
          ? new THREE.Vector3(-0.5, 1.6, -31) // Center SUV
          : i % 3 === 1
          ? new THREE.Vector3(5.2, 1.6, -31)  // Right SUV
          : new THREE.Vector3(-6.2, 1.4, -31); // Left SUV

      // Deterministic pseudo-random seed per debris index
      const seed1 = Math.sin(i * 12.9898) * 43758.5453;
      const r1 = seed1 - Math.floor(seed1);
      const seed2 = Math.sin((i + 31) * 78.233) * 43758.5453;
      const r2 = seed2 - Math.floor(seed2);
      const seed3 = Math.sin((i + 71) * 45.164) * 43758.5453;
      const r3 = seed3 - Math.floor(seed3);

      const angle = r1 * Math.PI * 2;
      const speed = 6.0 + r2 * 14.0;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed * 0.6,
        12.0 + r3 * 18.0,
        Math.sin(angle) * speed * 0.6
      );
      const rotationSpeed = new THREE.Vector3(
        (r1 - 0.5) * 8.0,
        (r2 - 0.5) * 8.0,
        (r3 - 0.5) * 8.0
      );
      const scale = 0.15 + r1 * 0.45;
      list.push({ origin: epicenter, velocity, rotationSpeed, scale });
    }
    return list;
  }, []);

  const debrisInstancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPosition = useMemo(() => new THREE.Vector3(), []);
  const tempEuler = useMemo(() => new THREE.Euler(), []);
  const tempQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    fireballUniforms.uTime.value = time;

    const data = evaluateMissilesAndPyro(scrollP);
    contrailUniforms.uProgress.value = data.missileProgress;
    fireballUniforms.uAge.value = data.detonationProgress;
    fireballUniforms.uScale.value = data.fireballScale;
    fireballUniforms.uIntensity.value = Math.max(0, 1.0 - data.detonationProgress * 0.4);

    // Update Debris Particles along parabolic arc: y(t) = y0 + v0y*t - 0.5*g*t^2
    if (debrisInstancedMeshRef.current) {
      const g = 19.6; // Gravitational acceleration
      const t = data.detonated ? data.detonationProgress * 1.6 : 0;

      for (let i = 0; i < debrisCount; i++) {
        if (!data.detonated || t <= 0) {
          tempMatrix.makeScale(0, 0, 0);
          debrisInstancedMeshRef.current.setMatrixAt(i, tempMatrix);
          continue;
        }

        const item = debrisData[i];
        tempPosition.x = item.origin.x + item.velocity.x * t;
        tempPosition.y = Math.max(0.2, item.origin.y + item.velocity.y * t - 0.5 * g * t * t);
        tempPosition.z = item.origin.z + item.velocity.z * t;

        tempEuler.set(
          item.rotationSpeed.x * t,
          item.rotationSpeed.y * t,
          item.rotationSpeed.z * t
        );
        tempQuaternion.setFromEuler(tempEuler);

        // Fade scale slightly as they descend
        const s = item.scale * Math.max(0.2, 1.0 - data.detonationProgress * 0.35);
        tempScale.set(s, s, s);

        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        debrisInstancedMeshRef.current.setMatrixAt(i, tempMatrix);
      }
      debrisInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group name="MissilePyroSystemGroup">
      {/* ------------------------------------------------------------------ */}
      {/* 1. THREE MISSILE SMOKE CONTRAIL TUBES                              */}
      {/* ------------------------------------------------------------------ */}
      {scrollP >= 0.52 && (
        <group name="ContrailTubes">
          <mesh geometry={contrailGeom1}>
            <shaderMaterial
              vertexShader={contrailVertexShader}
              fragmentShader={contrailFragmentShader}
              uniforms={contrailUniforms}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh geometry={contrailGeom2}>
            <shaderMaterial
              vertexShader={contrailVertexShader}
              fragmentShader={contrailFragmentShader}
              uniforms={contrailUniforms}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh geometry={contrailGeom3}>
            <shaderMaterial
              vertexShader={contrailVertexShader}
              fragmentShader={contrailFragmentShader}
              uniforms={contrailUniforms}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Active Missile Warhead Flares during incoming flight (p = 0.54 -> 0.65) */}
          {pyroState.missilesActive && (
            <group name="MissileWarheads">
              <mesh position={curve1.getPoint(pyroState.missileProgress)}>
                <sphereGeometry args={[0.38, 12, 12]} />
                <meshBasicMaterial color="#FFF8D6" />
              </mesh>
              <mesh position={curve2.getPoint(pyroState.missileProgress)}>
                <sphereGeometry args={[0.34, 12, 12]} />
                <meshBasicMaterial color="#FFF8D6" />
              </mesh>
              <mesh position={curve3.getPoint(pyroState.missileProgress)}>
                <sphereGeometry args={[0.36, 12, 12]} />
                <meshBasicMaterial color="#FFF8D6" />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. THREE TOWERING FIREBALL DETONATIONS                             */}
      {/* ------------------------------------------------------------------ */}
      {pyroState.detonated && (
        <group name="FireballsGroup">
          {/* Fireball A (Left SUV at x = -6.2, z = -31, just outside left temple arm) */}
          <group position={[-6.2, 2.6, -31]}>
            <mesh
              scale={[
                4.2 * pyroState.fireballScale,
                6.5 * pyroState.fireballScale,
                4.2 * pyroState.fireballScale,
              ]}
            >
              <sphereGeometry args={[1, 20, 20]} />
              <shaderMaterial
                vertexShader={fireballVertexShader}
                fragmentShader={fireballFragmentShader}
                uniforms={fireballUniforms}
                transparent
                depthWrite={false}
                blending={THREE.NormalBlending}
              />
            </mesh>
          </group>

          {/* Fireball B (Center SUV at x = -0.5, z = -31, FRAMED IN LEFT LENS!) */}
          <group position={[-0.5, 3.2, -31]}>
            <mesh
              scale={[
                5.0 * pyroState.fireballScale,
                8.2 * pyroState.fireballScale,
                5.0 * pyroState.fireballScale,
              ]}
            >
              <sphereGeometry args={[1, 24, 24]} />
              <shaderMaterial
                vertexShader={fireballVertexShader}
                fragmentShader={fireballFragmentShader}
                uniforms={fireballUniforms}
                transparent
                depthWrite={false}
                blending={THREE.NormalBlending}
              />
            </mesh>
          </group>

          {/* Fireball C (Right SUV at x = +5.2, z = -31, FRAMED IN RIGHT LENS!) */}
          <group position={[5.2, 2.8, -31]}>
            <mesh
              scale={[
                4.5 * pyroState.fireballScale,
                7.0 * pyroState.fireballScale,
                4.5 * pyroState.fireballScale,
              ]}
            >
              <sphereGeometry args={[1, 22, 22]} />
              <shaderMaterial
                vertexShader={fireballVertexShader}
                fragmentShader={fireballFragmentShader}
                uniforms={fireballUniforms}
                transparent
                depthWrite={false}
                blending={THREE.NormalBlending}
              />
            </mesh>
          </group>

          {/* Golden Sand Shockwave Ring surging forward across the beach floor */}
          {pyroState.shockwaveRadius > 0.5 && (
            <mesh
              position={[0, 0.08, -31 + pyroState.shockwaveRadius * 0.45]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry
                args={[
                  Math.max(0.1, pyroState.shockwaveRadius - 2.5),
                  pyroState.shockwaveRadius,
                  32,
                ]}
              />
              <meshBasicMaterial
                color="#E5C478"
                transparent
                opacity={pyroState.shockwaveOpacity}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. INSTANCED DEBRIS PARTICLES TUMBLING ON GRAVITY ARCS             */}
      {/* ------------------------------------------------------------------ */}
      <instancedMesh
        ref={debrisInstancedMeshRef}
        args={[undefined, undefined, debrisCount]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#241B16" roughness={0.9} metalness={0.2} />
      </instancedMesh>
    </group>
  );
}
