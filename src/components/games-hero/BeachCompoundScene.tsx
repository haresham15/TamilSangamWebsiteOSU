// src/components/games-hero/BeachCompoundScene.tsx
"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface BeachCompoundProps {
  scrollP: number;
  backgroundBokeh: number; // 0 (sharp) to 6.5 (macro out-of-focus bokeh)
}

// ---------------------------------------------------------------------------
// 1. PROCEDURAL TROPICAL SKY SHADER DOME
// ---------------------------------------------------------------------------
const skyVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const skyFragmentShader = /* glsl */ `
  uniform vec3 uZenithColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uSunPosition;
  uniform float uBokeh;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float height = clamp(dir.y, 0.0, 1.0);
    
    // Smooth gradient from horizon sea-foam to zenith cyan
    vec3 sky = mix(uHorizonColor, uZenithColor, pow(height, 0.72));

    // Subtle sun flare
    vec3 sunDir = normalize(uSunPosition);
    float sunDot = max(dot(dir, sunDir), 0.0);
    sky += vec3(1.0, 0.95, 0.8) * pow(sunDot, 64.0) * 0.4;
    sky += vec3(0.9, 0.96, 1.0) * pow(sunDot, 12.0) * 0.15;

    // Soft wispy cloud streaks
    float cloudNoise = sin(dir.x * 4.0 + dir.z * 2.0) * cos(dir.y * 6.0);
    float clouds = smoothstep(0.4, 0.8, cloudNoise * 0.5 + 0.5) * (1.0 - height * 0.8);
    sky = mix(sky, vec3(0.96, 0.98, 1.0), clouds * 0.35);

    // Bokeh softness blur simulation
    if (uBokeh > 0.1) {
      sky = mix(sky, vec3(0.72, 0.88, 0.94), min(1.0, uBokeh * 0.04));
    }

    gl_FragColor = vec4(sky, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// 2. WIND-RIPPLED GOLDEN BEACH SAND SHADER
// ---------------------------------------------------------------------------
const sandVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    // Subtle sand dunes on far right
    if (worldPos.x > 8.0) {
      worldPos.y += sin(worldPos.x * 0.25 + worldPos.z * 0.15) * 0.65;
    }
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const sandFragmentShader = /* glsl */ `
  uniform vec3 uSandColorA; // Sunlit sand
  uniform vec3 uSandColorB; // Shadow/ripple sand
  uniform vec3 uSunDirection;
  uniform float uBokeh;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    // Procedural wind ripples
    float ripple = sin(vWorldPosition.x * 2.2 + vWorldPosition.z * 1.4) * 0.5 + 0.5;
    float micro = sin(vWorldPosition.x * 12.0) * cos(vWorldPosition.z * 12.0) * 0.25;
    float ripplePattern = clamp(ripple + micro, 0.0, 1.0);

    vec3 sandCol = mix(uSandColorB, uSandColorA, ripplePattern);

    // Subtle sun lighting
    vec3 lightDir = normalize(uSunDirection);
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 lit = sandCol * (0.55 + diff * 0.7);

    // Micro-mica sun glint
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 halfVec = normalize(lightDir + viewDir);
    float spec = pow(max(dot(vNormal, halfVec), 0.0), 48.0);
    lit += vec3(1.0, 0.96, 0.85) * spec * 0.25;

    // Distant soft haze & bokeh blur
    float dist = length(cameraPosition - vWorldPosition);
    if (uBokeh > 0.2) {
      lit = mix(lit, vec3(0.92, 0.78, 0.54), clamp(uBokeh * 0.08, 0.0, 0.55));
    }

    gl_FragColor = vec4(lit, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// 3. WROUGHT-IRON SPEAR FENCE PANELS & PIERS
// ---------------------------------------------------------------------------
function WroughtIronFence({ _backgroundBokeh }: { _backgroundBokeh?: number }) {
  // Angle along diagonal from [x=-9, z=+4] to [x=-22, z=-34]
  const pierPositions = useMemo(() => {
    const list: [number, number, number][] = [];
    const steps = 9;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const x = THREE.MathUtils.lerp(-9.0, -22.0, t);
      const z = THREE.MathUtils.lerp(4.0, -34.0, t);
      list.push([x, 0, z]);
    }
    return list;
  }, []);

  return (
    <group name="WroughtIronFenceGroup">
      {/* Ocean water strip visible beyond the fence on far left */}
      <mesh position={[-38, -0.15, -15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 80]} />
        <meshStandardMaterial
          color="#289DB0"
          roughness={0.12}
          metalness={0.3}
        />
      </mesh>

      {/* Terracotta masonry curb */}
      {pierPositions.map((p, idx) => {
        if (idx === pierPositions.length - 1) return null;
        const next = pierPositions[idx + 1];
        const midX = (p[0] + next[0]) / 2;
        const midZ = (p[2] + next[2]) / 2;
        const dx = next[0] - p[0];
        const dz = next[2] - p[2];
        const length = Math.sqrt(dx * dx + dz * dz);
        const rotY = Math.atan2(dx, dz);

        return (
          <group key={`bay-${idx}`} position={[midX, 0, midZ]} rotation={[0, rotY, 0]}>
            {/* Low Curb */}
            <mesh position={[0, 0.275, 0]}>
              <boxGeometry args={[0.38, 0.55, length]} />
              <meshStandardMaterial color="#C98A6B" roughness={0.78} />
            </mesh>

            {/* Wrought-Iron Spear Pickets */}
            {Array.from({ length: 8 }).map((_, pickIdx) => {
              const pz = (pickIdx / 7 - 0.5) * (length - 0.5);
              return (
                <group key={`picket-${pickIdx}`} position={[0, 0.55, pz]}>
                  {/* Vertical bar */}
                  <mesh position={[0, 0.65, 0]}>
                    <cylinderGeometry args={[0.016, 0.016, 1.3, 8]} />
                    <meshStandardMaterial color="#111114" roughness={0.35} metalness={0.85} />
                  </mesh>
                  {/* Spear finial */}
                  <mesh position={[0, 1.38, 0]}>
                    <coneGeometry args={[0.038, 0.16, 4]} />
                    <meshStandardMaterial color="#1A1A1E" roughness={0.3} metalness={0.9} />
                  </mesh>
                  {/* S-scroll ring near bottom */}
                  <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.065, 0.012, 6, 12]} />
                    <meshStandardMaterial color="#111114" roughness={0.35} metalness={0.85} />
                  </mesh>
                </group>
              );
            })}

            {/* Top & bottom horizontal iron rails */}
            <mesh position={[0, 0.72, 0]}>
              <boxGeometry args={[0.04, 0.04, length]} />
              <meshStandardMaterial color="#111114" roughness={0.35} metalness={0.85} />
            </mesh>
            <mesh position={[0, 1.75, 0]}>
              <boxGeometry args={[0.04, 0.04, length]} />
              <meshStandardMaterial color="#111114" roughness={0.35} metalness={0.85} />
            </mesh>
          </group>
        );
      })}

      {/* Terracotta-Stone Piers */}
      {pierPositions.map(([px, py, pz], idx) => (
        <group key={`pier-${idx}`} position={[px, py, pz]}>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.55, 2.4, 0.55]} />
            <meshStandardMaterial color="#B87B5E" roughness={0.8} />
          </mesh>
          {/* Pier Cap */}
          <mesh position={[0, 2.45, 0]}>
            <boxGeometry args={[0.68, 0.12, 0.68]} />
            <meshStandardMaterial color="#A56A4F" roughness={0.7} />
          </mesh>
          {/* Decorative stone finial sphere */}
          <mesh position={[0, 2.65, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#D9C7B2" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. DISTANT BREACHED WALL WITH BLAST HOLES & VINES
// ---------------------------------------------------------------------------
function BreachedTerracottaWall() {
  return (
    <group position={[0, 0, -35]} name="BreachedWallGroup">
      {/* Intact Left Segment (x = -24 to -4.8) */}
      <mesh position={[-14, 1.8, 0]}>
        <boxGeometry args={[18.4, 3.6, 0.75]} />
        <meshStandardMaterial color="#B87B5E" roughness={0.82} />
      </mesh>

      {/* Center Segment between Blast Hole 1 & Blast Hole 2 (x = -2.2 to +1.2) */}
      <mesh position={[-0.5, 1.5, 0]}>
        <boxGeometry args={[3.4, 3.0, 0.75]} />
        <meshStandardMaterial color="#A86E53" roughness={0.85} />
      </mesh>

      {/* Intact Right Segment (x = +3.8 to +24) */}
      <mesh position={[14, 1.8, 0]}>
        <boxGeometry args={[20.4, 3.6, 0.75]} />
        <meshStandardMaterial color="#B87B5E" roughness={0.82} />
      </mesh>

      {/* Scorched blast hole edges around x = -3.6 and x = +2.6 */}
      <mesh position={[-3.6, 0.8, 0]}>
        <boxGeometry args={[1.8, 1.6, 0.85]} />
        <meshStandardMaterial color="#3A2820" roughness={0.95} />
      </mesh>
      <mesh position={[2.6, 0.9, 0]}>
        <boxGeometry args={[2.0, 1.8, 0.85]} />
        <meshStandardMaterial color="#33241C" roughness={0.95} />
      </mesh>

      {/* Red Bougainvillea Vines on Upper Wall */}
      <group position={[-8, 3.5, 0.2]}>
        <mesh scale={[1.8, 0.45, 0.35]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#8B1E3F" roughness={0.7} />
        </mesh>
        <mesh position={[0.2, -0.2, 0.05]} scale={[1.4, 0.35, 0.3]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#2E5E3A" roughness={0.75} />
        </mesh>
      </group>
      <group position={[8, 3.5, 0.2]}>
        <mesh scale={[1.9, 0.45, 0.35]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#A32448" roughness={0.7} />
        </mesh>
        <mesh position={[-0.2, -0.2, 0.05]} scale={[1.5, 0.35, 0.3]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#2E5E3A" roughness={0.75} />
        </mesh>
      </group>

      {/* Masonry Rubble on sand below holes */}
      <mesh position={[-3.6, 0.3, 1.2]} rotation={[0.3, 0.5, 0.1]}>
        <boxGeometry args={[0.8, 0.45, 0.6]} />
        <meshStandardMaterial color="#B87B5E" roughness={0.9} />
      </mesh>
      <mesh position={[2.5, 0.25, 1.5]} rotation={[-0.2, 0.4, 0.2]}>
        <boxGeometry args={[0.9, 0.4, 0.7]} />
        <meshStandardMaterial color="#945D44" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 5. THE 3 TACTICAL 4X4 SUVS WITH SILHOUETTES
// ---------------------------------------------------------------------------
interface SUVProps {
  position: [number, number, number];
  rotationY?: number;
}

function TacticalSUV({ position, rotationY = 0 }: SUVProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main Boxy Lower Body */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2.1, 0.85, 4.4]} />
        <meshStandardMaterial color="#2E3330" roughness={0.45} metalness={0.65} />
      </mesh>

      {/* Cabin & Windshield */}
      <mesh position={[0, 1.5, -0.2]}>
        <boxGeometry args={[1.9, 0.8, 2.6]} />
        <meshStandardMaterial color="#222624" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Windshield catching sky reflection */}
      <mesh position={[0, 1.5, 1.15]} rotation={[-0.32, 0, 0]}>
        <planeGeometry args={[1.7, 0.75]} />
        <meshStandardMaterial
          color="#8AC5D8"
          roughness={0.1}
          metalness={0.85}
        />
      </mesh>

      {/* Front Grille & Bullbar */}
      <mesh position={[0, 0.7, 2.22]}>
        <boxGeometry args={[1.6, 0.45, 0.12]} />
        <meshStandardMaterial color="#111213" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.75, 0.75, 2.21]}>
        <boxGeometry args={[0.3, 0.18, 0.05]} />
        <meshStandardMaterial color="#FFF8DC" emissive="#FFF8DC" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.75, 0.75, 2.21]}>
        <boxGeometry args={[0.3, 0.18, 0.05]} />
        <meshStandardMaterial color="#FFF8DC" emissive="#FFF8DC" emissiveIntensity={0.6} />
      </mesh>

      {/* 4 Heavy Off-Road Tires */}
      <mesh position={[-1.08, 0.45, 1.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.35, 16]} />
        <meshStandardMaterial color="#141416" roughness={0.8} />
      </mesh>
      <mesh position={[1.08, 0.45, 1.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.35, 16]} />
        <meshStandardMaterial color="#141416" roughness={0.8} />
      </mesh>
      <mesh position={[-1.08, 0.45, -1.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.35, 16]} />
        <meshStandardMaterial color="#141416" roughness={0.8} />
      </mesh>
      <mesh position={[1.08, 0.45, -1.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.35, 16]} />
        <meshStandardMaterial color="#141416" roughness={0.8} />
      </mesh>

      {/* 2 Dark Villain Silhouettes standing on the roof / flatbed */}
      <group position={[-0.35, 2.65, -0.4]}>
        {/* Torso */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.38, 0.65, 0.22]} />
          <meshStandardMaterial color="#121214" roughness={0.9} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color="#121214" roughness={0.9} />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.1, -0.9, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.75, 6]} />
          <meshStandardMaterial color="#121214" roughness={0.9} />
        </mesh>
        <mesh position={[0.1, -0.9, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.75, 6]} />
          <meshStandardMaterial color="#121214" roughness={0.9} />
        </mesh>
      </group>

      <group position={[0.45, 2.65, 0.2]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.38, 0.65, 0.22]} />
          <meshStandardMaterial color="#151518" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color="#151518" roughness={0.9} />
        </mesh>
        <mesh position={[-0.1, -0.9, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.75, 6]} />
          <meshStandardMaterial color="#151518" roughness={0.9} />
        </mesh>
        <mesh position={[0.1, -0.9, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.75, 6]} />
          <meshStandardMaterial color="#151518" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 6. RIGHT MARBLE FOUNTAIN, UMBRELLA & COCONUT PALMS
// ---------------------------------------------------------------------------
function FountainAndGarden() {
  return (
    <group position={[9.5, 0, -15]} name="GardenFountainGroup">
      {/* Terracotta Octagonal Planter Basin */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[2.4, 2.6, 0.7, 8]} />
        <meshStandardMaterial color="#C87E5E" roughness={0.75} />
      </mesh>
      {/* Interior Water Pool */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 0.05, 16]} />
        <meshStandardMaterial color="#3FA8B8" roughness={0.15} metalness={0.4} />
      </mesh>
      {/* Tiered White Marble Fountain Plinth */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.65, 0.95, 1.1, 12]} />
        <meshStandardMaterial color="#E8E2D8" roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[1.2, 0.7, 0.35, 12]} />
        <meshStandardMaterial color="#E8E2D8" roughness={0.25} />
      </mesh>
      {/* Classical Statue Silhouette */}
      <mesh position={[0, 2.45, 0]}>
        <cylinderGeometry args={[0.2, 0.35, 1.1, 8]} />
        <meshStandardMaterial color="#E4DDD0" roughness={0.3} />
      </mesh>
    </group>
  );
}

function PatioUmbrella() {
  return (
    <group position={[15.5, 0, -26]}>
      {/* Umbrella Pole */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 3.2, 8]} />
        <meshStandardMaterial color="#E2D4C0" roughness={0.4} />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, 2.9, 0]}>
        <coneGeometry args={[2.1, 0.9, 8]} />
        <meshStandardMaterial color="#FAF5EE" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function PalmGrove() {
  // 18 coconut palms behind the breached wall (z = -37 to -46)
  const palmData = useMemo(() => {
    const list: { pos: [number, number, number]; rotY: number; lean: number; height: number }[] = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.lerp(-22, 24, i / (count - 1)) + (Math.sin(i * 3.7) * 2.2);
      const z = -37.0 - (i % 4) * 2.5;
      const rotY = (i * 0.7) % (Math.PI * 2);
      const lean = 0.08 + (Math.sin(i * 1.5) * 0.06);
      const height = 9.0 + (i % 3) * 1.4;
      list.push({ pos: [x, 0, z], rotY, lean, height });
    }
    return list;
  }, []);

  return (
    <group name="PalmGroveGroup">
      {palmData.map((palm, i) => (
        <group key={`palm-${i}`} position={palm.pos} rotation={[0, palm.rotY, palm.lean]}>
          {/* Curved Palm Trunk */}
          <mesh position={[0, palm.height * 0.5, 0]}>
            <cylinderGeometry args={[0.22, 0.38, palm.height, 8]} />
            <meshStandardMaterial color="#5E4C3D" roughness={0.85} />
          </mesh>
          {/* Palm Frond Crown */}
          <group position={[0, palm.height, 0]}>
            {Array.from({ length: 7 }).map((_, frondIdx) => {
              const angle = (frondIdx / 7) * Math.PI * 2;
              return (
                <mesh
                  key={`frond-${frondIdx}`}
                  position={[Math.cos(angle) * 1.2, -0.4, Math.sin(angle) * 1.2]}
                  rotation={[0.45, angle, -0.3]}
                >
                  <coneGeometry args={[0.65, 3.2, 4]} />
                  <meshStandardMaterial color="#2B5738" roughness={0.65} side={THREE.DoubleSide} />
                </mesh>
              );
            })}
          </group>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// MASTER BEACH COMPOUND COMPONENT
// ---------------------------------------------------------------------------
export function BeachCompoundScene({ scrollP: _scrollP, backgroundBokeh }: BeachCompoundProps) {
  const skyUniforms = useMemo(
    () => ({
      uZenithColor: { value: new THREE.Color("#4DB6CE") },
      uHorizonColor: { value: new THREE.Color("#B8E6E8") },
      uSunPosition: { value: new THREE.Vector3(12, 24, 14) },
      uBokeh: { value: 0 },
    }),
    []
  );

  const sandUniforms = useMemo(
    () => ({
      uSandColorA: { value: new THREE.Color("#F3D58D") },
      uSandColorB: { value: new THREE.Color("#E2BC6B") },
      uSunDirection: { value: new THREE.Vector3(12, 24, 14).normalize() },
      uBokeh: { value: 0 },
    }),
    []
  );

  useFrame(() => {
    skyUniforms.uBokeh.value = backgroundBokeh;
    sandUniforms.uBokeh.value = backgroundBokeh;
  });

  return (
    <group name="BeachCompoundMaster">
      {/* Lighting */}
      <directionalLight
        position={[12, 24, 14]}
        intensity={3.8}
        color="#FFF4D6"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <hemisphereLight
        color="#7CE0F4"
        groundColor="#E8C574"
        intensity={0.85}
      />

      {/* 1. Procedural Sky Dome */}
      <mesh position={[0, 0, 0]} scale={[200, 200, 200]} renderOrder={-1000}>
        <sphereGeometry args={[1, 32, 24]} />
        <shaderMaterial
          vertexShader={skyVertexShader}
          fragmentShader={skyFragmentShader}
          uniforms={skyUniforms}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Golden Beach Sand Floor */}
      <mesh
        position={[0, 0, -15]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[120, 90, 48, 48]} />
        <shaderMaterial
          vertexShader={sandVertexShader}
          fragmentShader={sandFragmentShader}
          uniforms={sandUniforms}
        />
      </mesh>

      {/* 3. Left Wrought-Iron Spear Fence on Curb */}
      <WroughtIronFence _backgroundBokeh={backgroundBokeh} />

      {/* 4. Breached Terracotta Wall at z = -35m */}
      <BreachedTerracottaWall />

      {/* 5. The 3 Tactical 4x4 SUVs at z = -31m */}
      <TacticalSUV position={[-6.2, 0, -31]} rotationY={0.06} />
      <TacticalSUV position={[-0.5, 0, -31]} rotationY={0.0} />
      <TacticalSUV position={[5.2, 0, -31]} rotationY={-0.08} />

      {/* 6. Right Marble Fountain & Patio Umbrella */}
      <FountainAndGarden />
      <PatioUmbrella />

      {/* 7. Coconut Palm Grove Canopy */}
      <PalmGrove />
    </group>
  );
}
