// src/components/games-hero/BeachCompoundScene.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { PORTRAIT_STANDOFF_SCALE } from "./gamesRail";

const WORLD_COLORS = {
  iron: new THREE.Color("#1A1B1D"),
  wall: new THREE.Color("#B87B5E"),
  compound: new THREE.Color("#B87B5E"),
  mortar: new THREE.Color("#DCC2A6"),
  brick: new THREE.Color("#8A3B28"),
  hedge: new THREE.Color("#416B36"),
  ocean: new THREE.Color("#56CBD8"),
  trunk: new THREE.Color("#5C4D42"),
  palm: new THREE.Color("#2A5935"),
  cream: new THREE.Color("#EADFC4"),
  suv: new THREE.Color("#353830"),
  char: new THREE.Color("#181512"),
};

function mergeStaticGeometry(parts: THREE.BufferGeometry[]) {
  const triangles = parts.map((part) => (part.index ? part.toNonIndexed() : part));
  const merged = mergeGeometries(triangles)!;
  new Set([...parts, ...triangles]).forEach((part) => part.dispose());
  return merged;
}

interface BeachCompoundProps {
  scrollP: number;
  backgroundBokeh: number;
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

    if (uBokeh > 0.1) {
      sky = mix(sky, vec3(0.72, 0.88, 0.94), min(1.0, uBokeh * 0.04));
    }

    gl_FragColor = vec4(sky, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// 2. MULTI-SCALE PARALLAX BEACH SAND WITH DUNE BERM, FOOTPRINTS & MICA GLINT
// ---------------------------------------------------------------------------
const sandVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    
    // Macro Dune Berm: strip from x = +10 to +40, rising 0.9 m, with shaded wheel-rut trench
    if (worldPos.x >= 10.0 && worldPos.x <= 40.0) {
      float span = (worldPos.x - 10.0) / 30.0;
      float bermHeight = sin(span * 3.14159) * 0.9;
      float rut = -0.15 * smoothstep(0.1, 0.25, span) * (1.0 - smoothstep(0.25, 0.45, span));
      worldPos.y += bermHeight + rut;
    }

    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const sandFragmentShader = /* glsl */ `
  uniform vec3 uSandColorA; // Sunlit golden sand #F3D58D
  uniform vec3 uSandColorB; // Shaded ripple sand #E2BC6B
  uniform vec3 uSunDirection;
  uniform float uBokeh;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    // 1. Mid-Scale Wind Ripples (0.35 m wavelength angled at 15 deg)
    float ripple = sin(vWorldPosition.x * 17.95 + vWorldPosition.z * 12.0) * 0.5 + 0.5;
    float micro = sin(vWorldPosition.x * 35.0) * cos(vWorldPosition.z * 35.0) * 0.2;
    float ripplePattern = clamp(ripple + micro, 0.0, 1.0);

    // 2. Footprint depressions & subtle tire-track ruts
    float footprintHash = hash2(floor(vWorldPosition.xz * 2.2));
    float footDepth = smoothstep(0.85, 0.98, footprintHash) * 0.18;
    vec3 baseSand = mix(uSandColorB, uSandColorA, ripplePattern);
    baseSand = mix(baseSand, vec3(0.79, 0.62, 0.32), footDepth); // Self-shadowed footprint cavity #C99E52

    // 3. Sun Directional Lighting
    vec3 lightDir = normalize(uSunDirection);
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 lit = baseSand * (0.55 + diff * 0.68);

    // 4. Micro-Scale Sparkling Quartz/Mica Glint BRDF
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 halfVec = normalize(lightDir + viewDir);
    float spec = pow(max(dot(vNormal, halfVec), 0.0), 64.0);
    float mica = hash2(floor(vWorldPosition.xz * 180.0));
    float glint = step(0.92, mica) * spec * 2.2;
    lit += vec3(1.0, 0.96, 0.84) * glint;

    // Distant soft haze & heat-shimmer blend
    float dist = length(cameraPosition - vWorldPosition);
    if (dist > 35.0) {
      lit = mix(lit, vec3(0.92, 0.82, 0.64), clamp((dist - 35.0) / 45.0, 0.0, 0.35));
    }
    if (uBokeh > 0.2) {
      lit = mix(lit, vec3(0.92, 0.78, 0.54), clamp(uBokeh * 0.08, 0.0, 0.55));
    }

    gl_FragColor = vec4(lit, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// 3. WROUGHT-IRON SPEAR FENCE PANELS & RECESSED STUCCO PIERS
// ---------------------------------------------------------------------------
function WroughtIronFence() {
  const { iron, masonry } = useMemo(() => {
    const ironParts: THREE.BufferGeometry[] = [];
    const stoneParts: THREE.BufferGeometry[] = [
      new THREE.BoxGeometry(0.38, 0.9, 28.5).translate(-9.5, 0.45, -21.25),
    ];
    // Pickets with forged spearhead finials
    for (let z = -7; z >= -35; z -= 0.12) {
      ironParts.push(new THREE.CylinderGeometry(0.016, 0.016, 1.7, 5).translate(-9.5, 1.75, z));
      ironParts.push(new THREE.ConeGeometry(0.042, 0.2, 4).translate(-9.5, 2.7, z));
      ironParts.push(new THREE.TorusGeometry(0.055, 0.009, 4, 8).rotateY(Math.PI / 2).translate(-9.5, 1.2, z));
    }
    for (const y of [1.1, 2.5]) {
      ironParts.push(new THREE.BoxGeometry(0.04, 0.04, 28.5).translate(-9.5, y, -21.25));
    }
    // 3 Piers at z = -16.6, -27.3, -35 with 0.12 m overhanging moulded stone caps
    for (const z of [-16.6, -27.3, -35]) {
      stoneParts.push(new THREE.BoxGeometry(0.55, 2.7, 0.55).translate(-9.5, 1.35, z));
      stoneParts.push(new THREE.BoxGeometry(0.68, 0.12, 0.68).translate(-9.5, 2.75, z));
      stoneParts.push(new THREE.SphereGeometry(0.14, 8, 6).translate(-9.5, 2.86, z));
    }
    return { iron: mergeStaticGeometry(ironParts), masonry: mergeStaticGeometry(stoneParts) };
  }, []);

  useEffect(() => () => {
    iron.dispose();
    masonry.dispose();
  }, [iron, masonry]);

  return (
    <group name="WroughtIronFenceGroup">
      <mesh position={[-65.5, -0.6, -95]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[109, 210]} />
        <meshStandardMaterial color={WORLD_COLORS.ocean} roughness={0.18} metalness={0.25} />
      </mesh>
      <mesh geometry={masonry}>
        <meshStandardMaterial color={WORLD_COLORS.wall} roughness={0.78} />
      </mesh>
      <mesh geometry={iron}>
        <meshStandardMaterial color={WORLD_COLORS.iron} roughness={0.34} metalness={0.82} />
      </mesh>
      <mesh position={[-8.4, 0.23, -22]}>
        <boxGeometry args={[0.65, 0.45, 25]} />
        <meshStandardMaterial color={WORLD_COLORS.hedge} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. VORONOÏ-FRACTURED TERRACOTTA WALL WITH JAGGED BRICK TEETH & SCATTERED RUBBLE
// ---------------------------------------------------------------------------
function BreachedTerracottaWall() {
  const { wallMesh, rubbleMesh } = useMemo(() => {
    const wallParts: THREE.BufferGeometry[] = [];
    // Main solid wall sections maintaining measured 1.6m clear openings
    wallParts.push(new THREE.BoxGeometry(6.42, 2.45, 0.75).translate(-6.29, 1.225, 0));
    wallParts.push(new THREE.BoxGeometry(3.92, 2.45, 0.75).translate(0.48, 1.225, 0));
    wallParts.push(new THREE.BoxGeometry(40.96, 2.45, 0.75).translate(24.52, 1.225, 0));

    // Lintel spans over breaches
    for (const x of [-2.28, 3.24]) {
      wallParts.push(new THREE.BoxGeometry(1.6, 0.75, 0.75).translate(x, 2.075, 0));
    }

    // Stepped jagged brick teeth along breach openings
    const brickParts: THREE.BufferGeometry[] = [];
    const breachCenters = [-2.28, 3.24];
    breachCenters.forEach((bx, bIdx) => {
      for (let step = 0; step < 7; step++) {
        const y = 0.35 + step * 0.22;
        const leftTooth = new THREE.BoxGeometry(0.24, 0.14, 0.78).translate(bx - 0.78 + (step % 2) * 0.08, y, 0);
        const rightTooth = new THREE.BoxGeometry(0.24, 0.14, 0.78).translate(bx + 0.78 - ((step + 1) % 2) * 0.08, y, 0);
        brickParts.push(leftTooth, rightTooth);
      }
      if (bIdx === 1) {
        // Scorched base at right breach (x = +3.24)
        brickParts.push(new THREE.DodecahedronGeometry(0.85, 0).translate(bx, 0.55, 0));
      }
    });

    // 60 instanced angular masonry chunks and broken terracotta coping stones
    const rubbleParts: THREE.BufferGeometry[] = [];
    for (let r = 0; r < 60; r++) {
      const bx = r < 30 ? -2.28 : 3.24;
      const angle = (r * 0.6) % (Math.PI * 2);
      const dist = 0.8 + ((r % 15) / 15) * 4.2;
      const rx = bx + Math.cos(angle) * dist * 0.7;
      const rz = 0.5 + Math.sin(angle) * dist * 0.6;
      const sx = 0.18 + (r % 4) * 0.08;
      const sy = 0.12 + (r % 3) * 0.06;
      const sz = 0.22 + (r % 5) * 0.09;
      rubbleParts.push(
        new THREE.BoxGeometry(sx, sy, sz)
          .rotateY((r * 45 * Math.PI) / 180)
          .rotateZ((r * 15 * Math.PI) / 180)
          .translate(rx, sy * 0.5, rz)
      );
    }

    return {
      wallMesh: mergeStaticGeometry([...wallParts, ...brickParts]),
      rubbleMesh: mergeStaticGeometry(rubbleParts),
    };
  }, []);

  useEffect(() => () => {
    wallMesh.dispose();
    rubbleMesh.dispose();
  }, [wallMesh, rubbleMesh]);

  return (
    <group position={[0, 0, -35]} name="BreachedWallGroup">
      <mesh geometry={wallMesh}>
        <meshStandardMaterial color={WORLD_COLORS.compound} roughness={0.82} />
      </mesh>
      <mesh geometry={rubbleMesh}>
        <meshStandardMaterial color={WORLD_COLORS.brick} roughness={0.92} />
      </mesh>

      {/* Bougainvillea Vines on Upper Wall */}
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
    </group>
  );
}

// ---------------------------------------------------------------------------
// 5. CONTOURED 12-PART MERGED 4X4 SUV MESH WITH CONTACT SHADOW DECALS
// ---------------------------------------------------------------------------
interface SUVProps {
  position: [number, number, number];
  rotationY?: number;
  hit: boolean;
}

function TacticalSUV({ position, rotationY = 0, hit }: SUVProps) {
  const { body, glass, bumper, wheels, contactDecal } = useMemo(() => {
    // 1. Contoured Lower Body (Chamfered hood with center bulge, flared fenders, running boards)
    const bodyParts: THREE.BufferGeometry[] = [
      new THREE.BoxGeometry(2.15, 0.85, 4.4).translate(0, 0.75, 0),
      // Raised power bulge on hood
      new THREE.BoxGeometry(1.15, 0.12, 1.6).translate(0, 1.20, 0.8),
      // Flared trapezoidal fenders over wheel wells
      new THREE.BoxGeometry(2.28, 0.45, 0.95).translate(0, 0.65, 1.3),
      new THREE.BoxGeometry(2.28, 0.45, 0.95).translate(0, 0.65, -1.3),
      // Side running boards
      new THREE.BoxGeometry(2.35, 0.08, 2.2).translate(0, 0.35, 0),
      // Upper cab roof
      new THREE.BoxGeometry(1.9, 0.8, 2.6).translate(0, 1.5, -0.2),
    ];

    // 2. Front Grille, Bullbar & Reflector Housings
    const bumperParts: THREE.BufferGeometry[] = [
      new THREE.BoxGeometry(1.6, 0.45, 0.12).translate(0, 0.7, 2.22),
      // Tubular steel bullbar
      new THREE.CylinderGeometry(0.038, 0.038, 1.8, 8).rotateZ(Math.PI / 2).translate(0, 0.55, 2.32),
      new THREE.CylinderGeometry(0.038, 0.038, 0.75, 8).translate(-0.65, 0.75, 2.32),
      new THREE.CylinderGeometry(0.038, 0.038, 0.75, 8).translate(0.65, 0.75, 2.32),
    ];

    // 3. Molded Rubber Off-Road Tires with tread bevels
    const wheelParts: THREE.BufferGeometry[] = [];
    for (const wx of [-1.08, 1.08]) {
      for (const wz of [-1.3, 1.3]) {
        wheelParts.push(
          new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16)
            .rotateZ(Math.PI / 2)
            .translate(wx, 0.45, wz)
        );
      }
    }

    // 4. Contact Shadow & Sand-Rut Decal Quad (2.8m x 5.0m)
    const contactDecal = new THREE.PlaneGeometry(2.8, 5.0).rotateX(-Math.PI / 2);

    return {
      body: mergeStaticGeometry(bodyParts),
      glass: new THREE.PlaneGeometry(1.7, 0.75).rotateX(-0.32).translate(0, 1.5, 1.15),
      bumper: mergeStaticGeometry(bumperParts),
      wheels: mergeStaticGeometry(wheelParts),
      contactDecal,
    };
  }, []);

  useEffect(() => () => {
    body.dispose();
    glass.dispose();
    bumper.dispose();
    wheels.dispose();
    contactDecal.dispose();
  }, [body, glass, bumper, wheels, contactDecal]);

  // Damage state switch at p >= 0.64: tilt chassis by 8 deg and scorch albedo
  const tiltAngle = hit ? 0.14 : 0;

  return (
    <group position={position} rotation={[tiltAngle, rotationY, tiltAngle * 0.5]} scale={[1, 1.61 / 1.9, 1]}>
      {/* Contact Shadow & Sand-Rut Decal Quad */}
      <mesh geometry={contactDecal} position={[0, 0.015, 0]}>
        <meshBasicMaterial color="#1A150E" transparent opacity={0.65} depthWrite={false} />
      </mesh>

      {/* Contoured SUV Body */}
      <mesh geometry={body}>
        <meshStandardMaterial
          color={hit ? WORLD_COLORS.char : WORLD_COLORS.suv}
          roughness={hit ? 0.92 : 0.45}
          metalness={0.65}
        />
      </mesh>

      {/* Front Windshield reflecting turquoise sky dome */}
      <mesh geometry={glass}>
        <meshPhysicalMaterial
          color="#18262C"
          metalness={0.1}
          roughness={0.08}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Bullbar and bumper */}
      <mesh geometry={bumper}>
        <meshStandardMaterial color="#111213" roughness={0.3} metalness={0.88} />
      </mesh>

      {/* Headlamp reflector housings */}
      <mesh position={[-0.75, 0.75, 2.22]}>
        <sphereGeometry args={[0.12, 12, 8]} />
        <meshStandardMaterial color="#FFF8DC" emissive="#FFF8DC" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.75, 0.75, 2.22]}>
        <sphereGeometry args={[0.12, 12, 8]} />
        <meshStandardMaterial color="#FFF8DC" emissive="#FFF8DC" emissiveIntensity={0.8} />
      </mesh>

      {/* Heavy off-road tires */}
      <mesh geometry={wheels}>
        <meshStandardMaterial color="#141416" roughness={0.85} />
      </mesh>

      {/* Silhouettes (scaled to 1.1 m, flat black #0E0D0C) */}
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
// 6. RIGHT CLASSICAL CARRARA MARBLE STATUE & FOUNTAIN (x = +12.1, z = -19.7)
// ---------------------------------------------------------------------------
function FountainAndGarden() {
  const statueGeometry = useMemo(() => {
    // Classical contrapposto silhouette with draped robe folds and raised arm
    const parts: THREE.BufferGeometry[] = [
      new THREE.CylinderGeometry(0.65, 0.95, 0.6, 12).translate(0, 1.0, 0),
      new THREE.CylinderGeometry(1.1, 0.6, 0.4, 12).translate(0, 1.5, 0),
      new THREE.CylinderGeometry(0.24, 0.36, 1.3, 10).translate(0, 2.35, 0),
      // Head and raised arm
      new THREE.SphereGeometry(0.18, 10, 8).translate(0, 3.1, 0),
      new THREE.CylinderGeometry(0.08, 0.09, 0.75, 8).rotateZ(0.65).translate(0.35, 2.85, 0),
    ];
    return mergeStaticGeometry(parts);
  }, []);

  useEffect(() => () => statueGeometry.dispose(), [statueGeometry]);

  return (
    <group position={[12.1, 0, -19.7]} name="GardenFountainGroup">
      {/* Terracotta Planter Basin: 4.0 x 2.2 m */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[4.0, 0.7, 2.2]} />
        <meshStandardMaterial color="#C87E5E" roughness={0.75} />
      </mesh>

      {/* Carrara Marble Statue plinth & contrapposto figure: #ECE8E0 with cool sky wrap */}
      <mesh geometry={statueGeometry}>
        <meshStandardMaterial color="#ECE8E0" roughness={0.32} metalness={0.06} />
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
      {/* Cream #EADFC4 8-rib canopy, 2.6 m across */}
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

// ---------------------------------------------------------------------------
// 7. BACKLIT COCONUT PALM GROVE WITH LEAF-SCAR RINGS & COCONUTS
// ---------------------------------------------------------------------------
function PalmGrove() {
  const { trunks, crowns, coconuts } = useMemo(() => {
    const trunkParts: THREE.BufferGeometry[] = [];
    const leafParts: THREE.BufferGeometry[] = [];
    const coconutParts: THREE.BufferGeometry[] = [];

    const leaf = new THREE.PlaneGeometry(1, 1, 1, 16);
    const vertices = leaf.getAttribute("position");
    for (let i = 0; i < vertices.count; i++) {
      const t = vertices.getY(i) + 0.5;
      const width = Math.sin(t * Math.PI) * (i % 4 < 2 ? 0.5 : 0.34);
      vertices.setXYZ(i, vertices.getX(i) * width, Math.sin(t * Math.PI) * 0.7 - t * t * 1.4, t * 3.3);
    }
    leaf.computeVertexNormals();

    for (let i = 0; i < 19; i++) {
      const lone = i === 18;
      const x = lone ? -7.3 : THREE.MathUtils.lerp(5, 40, i / 17) + Math.sin(i * 3.7) * 2.2;
      const z = lone ? -38 : -37 - (i % 4) * 2.5;
      const height = lone ? 7.9 : 8.0 + (i % 3) * 1.2;
      const lean = lone ? 0.025 : 0.08 + Math.sin(i * 1.5) * 0.06;

      // Curved trunk with horizontal leaf-scar rings
      const trunk = new THREE.CylinderGeometry(0.16, 0.28, height, 7, 20)
        .translate(0, height / 2, 0)
        .rotateZ(lean)
        .translate(x, 0, z);
      trunkParts.push(trunk);

      // Coconuts cluster at crown base
      const crownX = x - Math.sin(lean) * height;
      for (let c = 0; c < 3; c++) {
        const cAngle = (c * 120 * Math.PI) / 180;
        coconutParts.push(
          new THREE.SphereGeometry(0.14, 6, 6).translate(
            crownX + Math.cos(cAngle) * 0.25,
            height - 0.25,
            z + Math.sin(cAngle) * 0.25
          )
        );
      }

      // Drooping pinnate fronds with two-sided backlighting
      for (let j = 0; j < 22; j++) {
        const angle = (j / 22) * Math.PI * 2 + i * 0.7;
        leafParts.push(
          leaf
            .clone()
            .rotateX((j % 3) * 0.16 - 0.08)
            .rotateY(angle)
            .translate(crownX, height, z)
        );
      }
    }
    leaf.dispose();
    return {
      trunks: mergeStaticGeometry(trunkParts),
      crowns: mergeStaticGeometry(leafParts),
      coconuts: mergeStaticGeometry(coconutParts),
    };
  }, []);

  useEffect(() => () => {
    trunks.dispose();
    crowns.dispose();
    coconuts.dispose();
  }, [trunks, crowns, coconuts]);

  return (
    <group name="PalmGroveGroup">
      <mesh geometry={trunks}>
        <meshStandardMaterial color={WORLD_COLORS.trunk} roughness={0.85} />
      </mesh>
      <mesh geometry={coconuts}>
        <meshStandardMaterial color="#4A402A" roughness={0.75} />
      </mesh>
      {/* Translucent fronds with two-sided backlighting */}
      <mesh geometry={crowns}>
        <meshStandardMaterial
          color={WORLD_COLORS.palm}
          roughness={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
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
      <hemisphereLight color="#7CE0F4" groundColor="#E8C574" intensity={0.85} />

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

      {/* 2. Golden Beach Sand Floor with Multi-Scale Relief & Mica Glint */}
      <mesh position={[0, 0, -14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
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

        {/* 5. The 3 Tactical 4x4 SUVs at z = -31m with Contact Decals & Damage Tilt */}
        <TacticalSUV position={[-4.06, 0, -31]} hit={scrollP >= 0.64} />
        <TacticalSUV position={[0.43, 0, -31]} hit={scrollP >= 0.646} />
        <TacticalSUV position={[4.92, 0, -31]} hit={scrollP >= 0.652} />
      </group>

      {/* 6. Right Marble Fountain & Patio Umbrella */}
      <FountainAndGarden />
      <PatioUmbrella />

      {/* 7. Coconut Palm Grove Canopy with Coconuts and Translucent Fronds */}
      <PalmGrove />
    </group>
  );
}
