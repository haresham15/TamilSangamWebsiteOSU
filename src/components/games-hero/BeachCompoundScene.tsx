// src/components/games-hero/BeachCompoundScene.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { PORTRAIT_STANDOFF_SCALE } from "./gamesRail";

const WORLD_COLORS = {
  iron: new THREE.Color("#111114"),
  wall: new THREE.Color("#C98A6B"),
  compound: new THREE.Color("#B87B5E"),
  hedge: new THREE.Color("#416B36"),
  ocean: new THREE.Color("#62D0DC"),
  trunk: new THREE.Color("#5E4C3D"),
  palm: new THREE.Color("#2B5738"),
  cream: new THREE.Color("#EADFC4"),
  suv: new THREE.Color("#3A3D34"),
  char: new THREE.Color("#171811"),
};

function mergeStaticGeometry(parts: THREE.BufferGeometry[]) {
  const merged = mergeGeometries(parts)!;
  parts.forEach((part) => part.dispose());
  return merged;
}

interface BeachCompoundProps {
  scrollP: number;
  backgroundBokeh: number; // 0 (sharp) to 6.5 (macro out-of-focus bokeh)
  portrait?: boolean;
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
    
    // Smooth gradient from horizon sea-foam #B8E6E8 to zenith cyan #4DB6CE
    vec3 sky = mix(uHorizonColor, uZenithColor, pow(height, 0.72));

    // Cirrus streaks left (u 0.15-0.35, v 0.35-0.45)
    float cirrusLeft = smoothstep(0.35, 0.75, sin(dir.x * 5.0 + dir.y * 2.5)) 
      * smoothstep(0.08, 0.25, height) * (1.0 - smoothstep(0.35, 0.65, height))
      * step(-0.85, dir.x) * (1.0 - step(-0.1, dir.x));

    // Cumulus behind right palms (u 0.66-0.72 and 0.80-0.88, v 0.40-0.55)
    float cumulusRight = smoothstep(0.4, 0.85, sin(dir.x * 4.0 - 1.5) * cos(dir.z * 3.0)) 
      * smoothstep(0.05, 0.30, height) * (1.0 - smoothstep(0.45, 0.75, height))
      * step(0.15, dir.x);

    sky = mix(sky, vec3(0.96, 0.98, 1.0), cirrusLeft * 0.35 + cumulusRight * 0.4);

    // Bokeh softness blur simulation
    if (uBokeh > 0.1) {
      sky = mix(sky, vec3(0.72, 0.88, 0.94), min(1.0, uBokeh * 0.04));
    }

    gl_FragColor = vec4(sky, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// 2. WIND-RIPPLED GOLDEN BEACH SAND SHADER WITH DUNE BERM
// ---------------------------------------------------------------------------
const sandVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    
    // Dune berm: strip from x = +10 to +40, rising 0.9 m, with a shaded trench
    if (worldPos.x >= 10.0 && worldPos.x <= 40.0) {
      float span = (worldPos.x - 10.0) / 30.0;
      float bermHeight = sin(span * 3.14159) * 0.9;
      // Shaded rut / trench near base
      float rut = -0.15 * smoothstep(0.1, 0.25, span) * (1.0 - smoothstep(0.25, 0.45, span));
      worldPos.y += bermHeight + rut;
    }

    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const sandFragmentShader = /* glsl */ `
  uniform vec3 uSandColorA; // #F3D58D Sunlit sand
  uniform vec3 uSandColorB; // #E2BC6B Shadow/ripple sand
  uniform vec3 uSunDirection;
  uniform float uBokeh;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    // Procedural wind ripples: 0.35 m wavelength (frequency ~17.95 rad/m)
    float ripple = sin(vWorldPosition.x * 17.95 + vWorldPosition.z * 12.0) * 0.5 + 0.5;
    float micro = sin(vWorldPosition.x * 35.0) * cos(vWorldPosition.z * 35.0) * 0.2;
    float ripplePattern = clamp(ripple + micro, 0.0, 1.0);

    vec3 sandCol = mix(uSandColorB, uSandColorA, ripplePattern);

    // Sun directional lighting
    vec3 lightDir = normalize(uSunDirection);
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 lit = sandCol * (0.55 + diff * 0.7);

    // Micro-mica sparkle
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
function WroughtIronFence() {
  const { iron, masonry } = useMemo(() => {
    const ironParts: THREE.BufferGeometry[] = [];
    const stoneParts: THREE.BufferGeometry[] = [new THREE.BoxGeometry(0.38, 0.9, 28.5).translate(-9.5, 0.45, -21.25)];
    for (let z = -7; z >= -35; z -= 0.12) {
      ironParts.push(new THREE.CylinderGeometry(0.016, 0.016, 1.7, 5).translate(-9.5, 1.75, z));
      ironParts.push(new THREE.ConeGeometry(0.042, 0.2, 4).translate(-9.5, 2.7, z));
      ironParts.push(new THREE.TorusGeometry(0.055, 0.009, 4, 8).rotateY(Math.PI / 2).translate(-9.5, 1.2, z));
    }
    for (const y of [1.1, 2.5]) ironParts.push(new THREE.BoxGeometry(0.04, 0.04, 28.5).translate(-9.5, y, -21.25));
    for (const z of [-16.6, -27.3, -35]) {
      stoneParts.push(new THREE.BoxGeometry(0.55, 2.7, 0.55).translate(-9.5, 1.35, z));
      stoneParts.push(new THREE.BoxGeometry(0.68, 0.12, 0.68).translate(-9.5, 2.75, z));
      stoneParts.push(new THREE.SphereGeometry(0.14, 8, 6).translate(-9.5, 2.86, z));
    }
    return { iron: mergeStaticGeometry(ironParts), masonry: mergeStaticGeometry(stoneParts) };
  }, []);
  useEffect(() => () => { iron.dispose(); masonry.dispose(); }, [iron, masonry]);
  return <group name="WroughtIronFenceGroup">
    <mesh position={[-65.5, -0.6, -95]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[109, 210]} />
      <meshStandardMaterial color={WORLD_COLORS.ocean} roughness={0.18} metalness={0.25} />
    </mesh>
    <mesh geometry={masonry}><meshStandardMaterial color={WORLD_COLORS.wall} roughness={0.78} /></mesh>
    <mesh geometry={iron}><meshStandardMaterial color={WORLD_COLORS.iron} roughness={0.35} metalness={0.85} /></mesh>
    <mesh position={[-8.4, 0.23, -22]}>
      <boxGeometry args={[0.65, 0.45, 25]} />
      <meshStandardMaterial color={WORLD_COLORS.hedge} roughness={0.9} />
    </mesh>
  </group>;
}

// ---------------------------------------------------------------------------
// 4. DISTANT BREACHED WALL WITH BLAST HOLES & VINES
// ---------------------------------------------------------------------------
function BreachedTerracottaWall() {
  return (
    <group position={[0, 0, -35]} name="BreachedWallGroup">
      {/* The two openings keep the measured 1.6 m clear width. */}
      <mesh position={[-6.29, 1.225, 0]}>
        <boxGeometry args={[6.42, 2.45, 0.75]} />
        <meshStandardMaterial color="#B87B5E" roughness={0.82} />
      </mesh>

      <mesh position={[0.48, 1.225, 0]}>
        <boxGeometry args={[3.92, 2.45, 0.75]} />
        <meshStandardMaterial color="#A86E53" roughness={0.85} />
      </mesh>

      <mesh position={[24.52, 1.225, 0]}>
        <boxGeometry args={[40.96, 2.45, 0.75]} />
        <meshStandardMaterial color="#B87B5E" roughness={0.82} />
      </mesh>

      {[-2.28, 3.24].map((x) => (
        <mesh key={x} position={[x, 2.075, 0]}>
          <boxGeometry args={[1.6, 0.75, 0.75]} />
          <meshStandardMaterial color={WORLD_COLORS.compound} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[3.24, 0.55, 0]} rotation={[0.2, 0.3, 0.15]}>
        <dodecahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color="#33241C" roughness={0.95} />
      </mesh>

      {/* Red Bougainvillea Vines on Upper Wall */}
      <group position={[-8, 2.5, 0.2]}>
        <mesh scale={[1.8, 0.45, 0.35]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#8B1E3F" roughness={0.7} />
        </mesh>
        <mesh position={[0.2, -0.2, 0.05]} scale={[1.4, 0.35, 0.3]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#2E5E3A" roughness={0.75} />
        </mesh>
      </group>
      <group position={[5, 2.5, 0.2]}>
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
      <mesh position={[-2.28, 0.3, 1.2]} rotation={[0.3, 0.5, 0.1]}>
        <boxGeometry args={[0.8, 0.45, 0.6]} />
        <meshStandardMaterial color="#B87B5E" roughness={0.9} />
      </mesh>
      <mesh position={[3.24, 0.25, 1.5]} rotation={[-0.2, 0.4, 0.2]}>
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
  hit: boolean;
}

function TacticalSUV({ position, rotationY = 0, hit }: SUVProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[1, 1.61 / 1.9, 1]}>
      {/* Main Boxy Lower Body: 2.15 m wide, 4.4 m long, cab roof 1.61 m */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2.15, 0.85, 4.4]} />
        <meshStandardMaterial color={hit ? WORLD_COLORS.char : WORLD_COLORS.suv} roughness={hit ? 0.9 : 0.45} metalness={0.65} />
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

      {/* 2 to 3 flat-black silhouettes (#0E0D0C with #3A3D34 rim), 1.1 m tall, no weapons/insignia */}
      <group position={[-0.35, 2.45, -0.4]} scale={[0.66, 0.66, 0.66]} visible={!hit}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.38, 0.65, 0.22]} />
          <meshStandardMaterial color="#0E0D0C" roughness={0.9} emissive="#3A3D34" emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color="#0E0D0C" roughness={0.9} emissive="#3A3D34" emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[-0.1, -0.9, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.75, 6]} />
          <meshStandardMaterial color="#0E0D0C" roughness={0.9} />
        </mesh>
        <mesh position={[0.1, -0.9, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.75, 6]} />
          <meshStandardMaterial color="#0E0D0C" roughness={0.9} />
        </mesh>
      </group>

      <group position={[0.45, 2.45, 0.2]} scale={[0.66, 0.66, 0.66]} visible={!hit}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.38, 0.65, 0.22]} />
          <meshStandardMaterial color="#0E0D0C" roughness={0.9} emissive="#3A3D34" emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color="#0E0D0C" roughness={0.9} emissive="#3A3D34" emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[-0.1, -0.9, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.75, 6]} />
          <meshStandardMaterial color="#0E0D0C" roughness={0.9} />
        </mesh>
        <mesh position={[0.1, -0.9, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.75, 6]} />
          <meshStandardMaterial color="#0E0D0C" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 6. RIGHT MARBLE FOUNTAIN, STATUE GROUP & UMBRELLA SET
// ---------------------------------------------------------------------------
function FountainAndGarden() {
  return (
    <group position={[12.1, 0, -19.7]} name="GardenFountainGroup">
      {/* Terracotta Planter Basin: 4.0 x 2.2 m */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[4.0, 0.7, 2.2]} />
        <meshStandardMaterial color="#C87E5E" roughness={0.75} />
      </mesh>
      {/* Tiered White Marble Fountain Plinth & Statue: 3.1 m tall, #ECE8E0 */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.65, 0.95, 0.6, 12]} />
        <meshStandardMaterial color="#ECE8E0" roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[1.1, 0.6, 0.4, 12]} />
        <meshStandardMaterial color="#ECE8E0" roughness={0.25} />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <cylinderGeometry args={[0.22, 0.35, 1.3, 8]} />
        <meshStandardMaterial color="#ECE8E0" roughness={0.28} />
      </mesh>

      {/* Two Urns at x = +10.2 and +11.0 (relative: -1.9 and -1.1) */}
      <mesh position={[-1.9, 0.7, 0]}>
        <cylinderGeometry args={[0.22, 0.15, 0.55, 8]} />
        <meshStandardMaterial color="#C87E5E" roughness={0.7} />
      </mesh>
      <mesh position={[-1.1, 0.7, 0]}>
        <cylinderGeometry args={[0.22, 0.15, 0.55, 8]} />
        <meshStandardMaterial color="#C87E5E" roughness={0.7} />
      </mesh>

      {/* Cycad & Agave cluster at x = +10.4 (relative: -1.7), 2.2 m tall */}
      <mesh position={[-1.7, 1.1, 0.6]}>
        <coneGeometry args={[0.65, 2.2, 7]} />
        <meshStandardMaterial color="#2A5C38" roughness={0.8} />
      </mesh>
    </group>
  );
}

function PatioUmbrella() {
  return (
    <group position={[20, 0, -30]} name="PatioUmbrellaSet">
      {/* Umbrella Pole */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 3.2, 8]} />
        <meshStandardMaterial color="#E2D4C0" roughness={0.4} />
      </mesh>
      {/* Cream #EADFC4 8-rib canopy, 2.6 m across (1.3 m radius) */}
      <mesh position={[0, 2.9, 0]}>
        <coneGeometry args={[1.3, 0.6, 8]} />
        <meshStandardMaterial color={WORLD_COLORS.cream} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Table and two chairs */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.04, 12]} />
        <meshStandardMaterial color="#EADFC4" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#4A453E" roughness={0.6} />
      </mesh>
      <mesh position={[-0.7, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.45, 0.4]} />
        <meshStandardMaterial color="#C8BAA0" roughness={0.7} />
      </mesh>
      <mesh position={[0.7, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.45, 0.4]} />
        <meshStandardMaterial color="#C8BAA0" roughness={0.7} />
      </mesh>
    </group>
  );
}

function PalmGrove() {
  const { trunks, crowns } = useMemo(() => {
    const trunkParts: THREE.BufferGeometry[] = [], leafParts: THREE.BufferGeometry[] = [];
    const leaf = new THREE.PlaneGeometry(1, 1, 1, 16);
    const vertices = leaf.getAttribute("position");
    for (let i = 0; i < vertices.count; i++) {
      const t = vertices.getY(i) + 0.5;
      const width = Math.sin(t * Math.PI) * (i % 4 < 2 ? 0.50 : 0.34);
      vertices.setXYZ(i, vertices.getX(i) * width, Math.sin(t * Math.PI) * 0.7 - t * t * 1.4, t * 3.3);
    }
    leaf.computeVertexNormals();
    for (let i = 0; i < 19; i++) {
      const lone = i === 18;
      const x = lone ? -7.3 : THREE.MathUtils.lerp(5, 40, i / 17) + Math.sin(i * 3.7) * 2.2;
      const z = lone ? -38 : -37 - (i % 4) * 2.5;
      const height = lone ? 7.9 : 8.0 + (i % 3) * 1.2;
      const lean = lone ? 0.025 : 0.08 + Math.sin(i * 1.5) * 0.06;
      const trunk = new THREE.CylinderGeometry(0.16, 0.28, height, 7, 20).translate(0, height / 2, 0).rotateZ(lean).translate(x, 0, z);
      trunkParts.push(trunk);
      for (let j = 0; j < 22; j++) {
        const angle = j / 22 * Math.PI * 2 + i * 0.7;
        leafParts.push(leaf.clone().rotateX((j % 3) * 0.16 - 0.08).rotateY(angle).translate(x - Math.sin(lean) * height, height, z));
      }
    }
    leaf.dispose();
    return { trunks: mergeStaticGeometry(trunkParts), crowns: mergeStaticGeometry(leafParts) };
  }, []);
  useEffect(() => () => { trunks.dispose(); crowns.dispose(); }, [trunks, crowns]);
  return <group name="PalmGroveGroup">
    <mesh geometry={trunks}><meshStandardMaterial color={WORLD_COLORS.trunk} roughness={0.85} /></mesh>
    <mesh geometry={crowns}><meshStandardMaterial color={WORLD_COLORS.palm} roughness={0.65} side={THREE.DoubleSide} /></mesh>
  </group>;
}

// ---------------------------------------------------------------------------
// MASTER BEACH COMPOUND COMPONENT
// ---------------------------------------------------------------------------
export function BeachCompoundScene({ scrollP, backgroundBokeh, portrait = false }: BeachCompoundProps) {
  const standoffScale = portrait ? PORTRAIT_STANDOFF_SCALE : 1;
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
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight
        color="#7CE0F4"
        groundColor="#E8C574"
        intensity={0.85}
      />

      {/* 1. Procedural Sky Dome */}
      <mesh position={[0, 0, 0]} scale={[300, 300, 300]} renderOrder={-1000}>
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
        position={[0, 0, -14]}
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
      <WroughtIronFence />

      {/* 4. Breached Terracotta Wall at z = -35m */}
      <group position={[0.43 * (1 - standoffScale), 0, 0]} scale={[standoffScale, 1, 1]}>
        <BreachedTerracottaWall />

      {/* 5. The 3 Tactical 4x4 SUVs at z = -31m */}
        <TacticalSUV position={[-4.06, 0, -31]} hit={scrollP >= 0.640} />
        <TacticalSUV position={[0.43, 0, -31]} hit={scrollP >= 0.646} />
        <TacticalSUV position={[4.92, 0, -31]} hit={scrollP >= 0.652} />
      </group>

      {/* 6. Right Marble Fountain & Patio Umbrella */}
      <FountainAndGarden />
      <PatioUmbrella />

      {/* 7. Coconut Palm Grove Canopy */}
      <PalmGrove />
    </group>
  );
}
