"use client";

import React, { useRef, useMemo, useState, useEffect, useSyncExternalStore } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, View, PerspectiveCamera } from "@react-three/drei";
import { useWarmup } from "@/components/gl/useWarmup";
import { governor } from "@/engine/governor";
import { SceneRegistrar } from "@/director/wireframe";
import { BlueprintPin, BLUEPRINT_PINS, BlueprintSVG } from "./BlueprintSVG";
import { buildOhioStadiumLines, StadiumGeometryData } from "./OhioStadiumWireframe";

interface EphemeralPin {
  id: string;
  x: number;
  y: number;
}

interface BlueprintScene3DProps {
  scrollProgress: number; // 0 to 1
  isLiteMode?: boolean;
  newPin?: EphemeralPin | null;
  onSelectPin?: (pin: BlueprintPin) => void;
  className?: string;
}

// Procedural high-resolution blueprint ground texture with Kaththi War Room palette, copper grid, and technical stamps
function createBlueprintGroundTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Deep Bruised Plum/Purple Radial Void Gradient (#241021 -> #150914 -> #0F050A)
  const grad = ctx.createRadialGradient(1024, 1024, 80, 1024, 1024, 1400);
  grad.addColorStop(0, "#241021");
  grad.addColorStop(0.55, "#150914");
  grad.addColorStop(1, "#0F050A");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 2048);

  // 2. Blueprint Fine Millimeter Grid (32px cells) — Muted warm copper/brown (#8B5A2B with low opacity)
  ctx.strokeStyle = "rgba(139, 90, 43, 0.16)";
  ctx.lineWidth = 1;
  const step = 32;
  ctx.beginPath();
  for (let x = 0; x <= 2048; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 2048);
  }
  for (let y = 0; y <= 2048; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
  }
  ctx.stroke();

  // 3. Major Grid (128px cells) with Warm Copper/Bronze lines
  ctx.strokeStyle = "rgba(175, 110, 50, 0.30)";
  ctx.lineWidth = 2;
  const majorStep = 128;
  ctx.beginPath();
  for (let x = 0; x <= 2048; x += majorStep) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 2048);
  }
  for (let y = 0; y <= 2048; y += majorStep) {
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
  }
  ctx.stroke();

  // 4. Kolam Pulli Dot Matrix & Dimension Crosses in Blazing Amber/Gold (#FFB84D)
  ctx.fillStyle = "rgba(255, 184, 77, 0.65)";
  for (let x = majorStep; x < 2048; x += majorStep) {
    for (let y = majorStep; y < 2048; y += majorStep) {
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Dimension Cross
      ctx.strokeStyle = "rgba(255, 184, 77, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x + 8, y);
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x, y + 8);
      ctx.stroke();
    }
  }

  // 5. Technical Border Frame and Engineering Title Block
  ctx.strokeStyle = "rgba(248, 246, 240, 0.28)";
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, 1928, 1928);

  ctx.strokeStyle = "rgba(255, 184, 77, 0.50)";
  ctx.lineWidth = 2;
  ctx.strokeRect(76, 76, 1896, 1896);

  // Technical Title Stamp (South-East Corner)
  ctx.fillStyle = "rgba(255, 240, 212, 0.9)";
  ctx.font = "bold 22px monospace";
  ctx.fillText("THE OHIO STATE UNIVERSITY · KATHTHI WAR ROOM ARCHIVE", 100, 130);
  ctx.font = "15px monospace";
  ctx.fillStyle = "rgba(255, 184, 77, 0.85)";
  ctx.fillText("BUILDING OUR SANGAM LINE BY LINE · STUDENT VISION & SUGGESTION PLATFORM", 100, 158);
  ctx.fillStyle = "rgba(229, 152, 56, 0.85)";
  ctx.fillText("OSU TAMIL SANGAM · CINEMATIC DRAFTING TABLE · COLUMBUS, OH", 100, 182);

  // 6. Seamless Void Falloff Vignette: Fades grid lines and border smoothly into #0F050A at the outer boundary
  const vignette = ctx.createRadialGradient(1024, 1024, 620, 1024, 1024, 980);
  vignette.addColorStop(0, "rgba(15, 5, 10, 0)");
  vignette.addColorStop(0.55, "rgba(15, 5, 10, 0.55)");
  vignette.addColorStop(1, "rgba(15, 5, 10, 1.0)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 2048, 2048);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  return texture;
}

// Kaththi-style holographic line construction shader
const StadiumLineShader = {
  vertexShader: `
    attribute float aOrigY;
    attribute float aTag;
    uniform float uProgress;
    uniform float uMaxHeight;
    uniform float uTime;
    varying float vOrigY;
    varying float vCurY;
    varying float vTag;
    varying float vScanIntensity;

    void main() {
      vOrigY = aOrigY;
      vTag = aTag;
      
      // Calculate current construction height threshold
      float h = uProgress * (uMaxHeight + 0.2);
      
      // Real-time vertical line construction: vertices rise from ground (y=0.02) to full height
      float curY = clamp(aOrigY, 0.02, max(0.02, h));
      vCurY = curY;

      // Glow intensity for vertices currently being constructed at the rising horizon
      float distToHorizon = abs(aOrigY - h);
      float isNearHorizon = (distToHorizon < 0.45 && h > 0.08 && h < uMaxHeight + 0.1) ? 1.0 : 0.0;
      vScanIntensity = isNearHorizon * max(0.0, 1.0 - (distToHorizon / 0.45));

      vec3 transformed = vec3(position.x, curY, position.z);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColorBase;
    uniform vec3 uColorGlow;
    uniform vec3 uColorField;
    uniform vec3 uColorRotunda;
    uniform float uTime;
    varying float vOrigY;
    varying float vCurY;
    varying float vTag;
    varying float vScanIntensity;

    void main() {
      // Base blueprint line color: blazing cinematic amber/gold (#FFB84D)
      vec3 color = uColorBase;

      // Element-specific architectural coloration
      if (vTag < 0.5) {
        // Football Field: warm amber/copper turf lines
        color = uColorField;
      } else if (vTag > 3.5 && vTag < 4.5) {
        // North Rotunda: sacred radiant gold
        color = uColorRotunda;
      } else if (vTag > 4.5) {
        // Press Box & Scoreboard: warm burnished bronze/gold
        color = vec3(1.0, 0.72, 0.30);
      } else if (vTag > 1.5 && vTag < 2.5) {
        // Cantilever Steel Trusses: warm bronze/gold
        color = mix(uColorBase, vec3(1.0, 0.82, 0.4), 0.45);
      }

      // Kaththi Hologram Glow Effect: blazing neon amber/gold along the active construction wave
      if (vScanIntensity > 0.01) {
        vec3 activeGlow = mix(vec3(1.0, 0.65, 0.22), vec3(1.0, 0.90, 0.45), 0.5 + 0.5 * sin(uTime * 8.0));
        color = mix(color, activeGlow, vScanIntensity);
      }

      gl_FragColor = vec4(color, 0.94);
    }
  `,
};

// 3D Ohio Stadium Real-Time Wireframe Component
function OhioStadiumWireframeMesh({ scrollProgress }: { scrollProgress: number }) {
  const lineMeshRef = useRef<THREE.LineSegments>(null);

  // Generate the complete Ohio Stadium wireframe geometry once
  const { geometry, maxHeight } = useMemo(() => {
    const data: StadiumGeometryData = buildOhioStadiumLines();
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    geom.setAttribute("aOrigY", new THREE.BufferAttribute(data.originalY, 1));
    geom.setAttribute("aTag", new THREE.BufferAttribute(data.typeTags, 1));
    return { geometry: geom, maxHeight: data.maxHeight };
  }, []);

  // Custom Shader Material uniforms: Blazing cinematic amber/gold palette (§Phase 1 Overhaul)
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: StadiumLineShader.vertexShader,
      fragmentShader: StadiumLineShader.fragmentShader,
      uniforms: {
        uProgress: { value: 0 },
        uMaxHeight: { value: maxHeight },
        uTime: { value: 0 },
        uColorBase: { value: new THREE.Color("#FFB84D") }, // Blazing cinematic amber/gold (#FFB84D)
        uColorGlow: { value: new THREE.Color("#FFA01C") }, // Deep amber construction glow
        uColorField: { value: new THREE.Color("#E59838") }, // Warm copper/amber turf lines
        uColorRotunda: { value: new THREE.Color("#FFD066") }, // Radiating Rotunda gold
      },
      transparent: true,
      depthWrite: true,
      blending: THREE.AdditiveBlending,
    });
  }, [maxHeight]);

  // Unmount cleanup for stadium wireframe geometry & shader material
  useEffect(() => {
    return () => {
      geometry.dispose();
      shaderMaterial.dispose();
    };
  }, [geometry, shaderMaterial]);

  // Laser elevation ring at the active construction height
  const laserRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = lineMeshRef.current;
    if (!mesh) return;
    const mat = mesh.material as THREE.ShaderMaterial;
    if (!mat?.uniforms) return;

    const time = state.clock.getElapsedTime();
    mat.uniforms.uTime.value = time;
    
    // Progress smoothly interpolates from 0 to 1 as user scrolls
    const p = Math.min(1, Math.max(0, scrollProgress));
    mat.uniforms.uProgress.value = p;

    // Move the laser construction scan plane to current elevation
    if (laserRingRef.current) {
      const curH = p * (maxHeight + 0.2);
      laserRingRef.current.position.y = curH;
      // Laser ring only visible when actively constructing
      const isConstructing = p > 0.02 && p < 0.98;
      laserRingRef.current.visible = isConstructing;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Ohio Stadium Wireframe Model */}
      <lineSegments ref={lineMeshRef} geometry={geometry} material={shaderMaterial} />

      {/* 2. Kaththi Holographic Laser Construction Scan Plane */}
      <mesh ref={laserRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, -1.2]}>
        <ringGeometry args={[5.2, 5.8, 48]} />
        <meshBasicMaterial
          color="#FFB84D"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Steady Axonometric / Isometric Architectural Camera Controller
function SteadyIsometricCamera() {
  const { camera } = useThree();

  // Fixed, steady cinematic isometric architectural perspective (South-East 3/4 axonometric view):
  // Positioned elevated and further out (X: 16.0, Y: 13.5, Z: 18.5) looking at stadium center (0.0, 1.4, -1.2).
  // Delivers the classic 30° axonometric blueprint projection with monumental scale and spatial depth,
  // revealing the entire horseshoe, outer Roman arches, tiered bowl, and North Rotunda in one steady frame.
  const basePos = useMemo(() => new THREE.Vector3(16.0, 13.5, 18.5), []);
  const lookTarget = useMemo(() => new THREE.Vector3(0.0, 1.4, -1.2), []);
  const targetPos = useRef(new THREE.Vector3(16.0, 13.5, 18.5));

  useFrame((state) => {
    // Subtle, organic breathing parallax to keep the scene alive
    const mouseX = state.mouse.x * 0.35;
    const mouseY = state.mouse.y * 0.20;

    targetPos.current.set(
      basePos.x + mouseX,
      basePos.y + mouseY,
      basePos.z
    );

    camera.position.lerp(targetPos.current, 0.05);
    camera.lookAt(lookTarget);
  });

  return null;
}

// Landmark Callout Pins at Ohio Stadium
function StadiumCalloutPins({
  onSelectPin,
  hoveredPinId,
  setHoveredPinId,
  scrollProgress,
}: {
  onSelectPin?: (pin: BlueprintPin) => void;
  hoveredPinId: string | null;
  setHoveredPinId: (id: string | null) => void;
  scrollProgress: number;
}) {
  // Pins positioned at authentic landmarks:
  // Pin 1: 50-Yard Line (The Turf & Events)
  // Pin 2: North Rotunda (Heritage & Architecture)
  // Pin 3: West Press Box (Initiatives & Executive Tower)
  const pinWorldCoords = useMemo(
    () => [
      { pin: BLUEPRINT_PINS[0], pos: [0, 0.2, 0] as const }, // 50-Yard Line
      { pin: BLUEPRINT_PINS[1], pos: [0, 1.8, -7.5] as const }, // North Rotunda
      { pin: BLUEPRINT_PINS[2], pos: [-5.8, 3.8, 0] as const }, // West Press Tower
    ],
    []
  );

  const ringRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      const safeDelta = Math.min(Math.max(delta, 0), 0.05);
      ringRef.current.rotation.y += safeDelta * 0.6;
    }
  });

  // Pins reveal as the stadium constructs
  const visible = scrollProgress > 0.15;
  if (!visible) return null;

  return (
    <group ref={ringRef}>
      {pinWorldCoords.map(({ pin, pos }) => {
        const isHovered = hoveredPinId === pin.id;

        return (
          <group
            key={pin.id}
            position={pos}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPin?.(pin);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredPinId(pin.id);
              if (typeof document !== "undefined") document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHoveredPinId(null);
              if (typeof document !== "undefined") document.body.style.cursor = "auto";
            }}
          >
            {/* Vertical Light Beacon Beam */}
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.02, 0.06, 1.6, 12]} />
              <meshBasicMaterial
                color={isHovered ? "#FFE5B4" : "#FFB84D"}
                transparent
                opacity={isHovered ? 0.85 : 0.45}
              />
            </mesh>

            {/* Glowing Beacon Head */}
            <mesh position={[0, 1.6, 0]}>
              <sphereGeometry args={[isHovered ? 0.22 : 0.16, 16, 16]} />
              <meshStandardMaterial
                color={isHovered ? "#FFE5B4" : "#FFB84D"}
                emissive={isHovered ? "#FFB84D" : "#FFA01C"}
                emissiveIntensity={isHovered ? 1.6 : 0.9}
                roughness={0.2}
              />
            </mesh>

            {/* Ground Ring Indicator */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[0.25, 0.35, 24]} />
              <meshBasicMaterial
                color={isHovered ? "#FFE5B4" : "#FFB84D"}
                transparent
                opacity={0.65}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Newly Dropped Suggestion Pin with Spring Bounce
function NewlyDroppedPin({ pin }: { pin: EphemeralPin }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const altitudeRef = useRef(6.0);
  const velocityRef = useRef(0);

  // Normalize coords onto the Ohio Stadium field
  const posX = (pin.x / 6) * 1.6;
  const posZ = (pin.y / 4) * 3.5;

  useFrame((_, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0), 0.05);
    if (altitudeRef.current > 0.05 || Math.abs(velocityRef.current) > 0.05) {
      const gravity = 18;
      const nextVel = velocityRef.current - gravity * safeDelta;
      let nextAlt = altitudeRef.current + nextVel * safeDelta;

      if (nextAlt <= 0) {
        nextAlt = 0;
        velocityRef.current = -nextVel * 0.42;
      } else {
        velocityRef.current = nextVel;
      }
      altitudeRef.current = nextAlt;

      if (groupRef.current) {
        groupRef.current.position.y = nextAlt;
      }
      if (ringRef.current) {
        ringRef.current.position.y = -nextAlt + 0.02;
      }
    }
  });

  return (
    <group ref={groupRef} position={[posX, 6.0, posZ]}>
      {/* Golden Pin Head */}
      <mesh position={[0, 1.0, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.18, 0.5, 16]} />
        <meshStandardMaterial
          color="#FFB84D"
          emissive="#FFA01C"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#FFE5B4"
          emissive="#FFB84D"
          emissiveIntensity={1.3}
        />
      </mesh>

      <pointLight color="#FFB84D" intensity={3.0} distance={5} position={[0, 1.2, 0]} />

      {/* Ripple ring on ground */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -6.0 + 0.02, 0]}>
        <ringGeometry args={[0.35, 0.5, 32]} />
        <meshBasicMaterial color="#FFB84D" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Ambient Floating Luminescent Particles (GPU Shader)
function generateFloatingParticles(count: number) {
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const pos = new Float32Array(count * 3);
  const ph = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rand() - 0.5) * 14;
    pos[i * 3 + 1] = rand() * 5 + 0.2;
    pos[i * 3 + 2] = (rand() - 0.5) * 16 - 2;
    ph[i] = rand() * Math.PI * 2;
  }
  return { positions: pos, phases: ph };
}

let cachedFloatingParticles: ReturnType<typeof generateFloatingParticles> | null = null;
function getFloatingParticles(count: number) {
  if (!cachedFloatingParticles) {
    cachedFloatingParticles = generateFloatingParticles(count);
  }
  return cachedFloatingParticles;
}

const particleVertexShader = `
  uniform float uTime;
  attribute float aPhase;
  void main() {
    vec3 pos = position;
    pos.y += sin(uTime * 0.8 + aPhase) * 0.2;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (40.0 / -mvPosition.z);
  }
`;

const particleFragmentShader = `
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, dist) * 0.65;
    gl_FragColor = vec4(1.0, 0.847, 0.459, alpha);
  }
`;

function FloatingParticles() {
  const count = 100;
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, phases } = useMemo(() => getFloatingParticles(count), [count]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      if (mat?.uniforms?.uTime) {
        mat.uniforms.uTime.value = state.clock.getElapsedTime();
      }
    }
  });

  useEffect(() => {
    const currentPoints = pointsRef.current;
    return () => {
      if (currentPoints) {
        currentPoints.geometry.dispose();
        if (Array.isArray(currentPoints.material)) {
          currentPoints.material.forEach((m) => m.dispose());
        } else {
          currentPoints.material.dispose();
        }
      }
    };
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// 1. THE ARCHITECTURAL HERITAGE COIN (Collegiate Landmark Relic)
// ---------------------------------------------------------------------------
// A 3D cylindrical coin (CylinderGeometry) resting on one of the grid intersections
// near the stadium entrance. Highly reflective silver/steel (MeshPhysicalMaterial)
// catching the overhead spotlight.
function ArchitecturalHeritageCoin() {
  const coinPos: [number, number, number] = [3.6, 0.035, 4.4];

  return (
    <group position={coinPos} rotation={[0, 0.42, 0]}>
      {/* Outer Coin Body: Cylindrical Silver/Steel Coin with high clearcoat */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.07, 64]} />
        <meshPhysicalMaterial
          color="#E8EEF5"
          metalness={1.0}
          roughness={0.15}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
          reflectivity={0.95}
        />
      </mesh>

      {/* Raised Outer Rim Ring */}
      <mesh castShadow position={[0, 0.036, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.46, 0.54, 48]} />
        <meshPhysicalMaterial
          color="#D4DFEE"
          metalness={1.0}
          roughness={0.18}
          clearcoat={1.0}
        />
      </mesh>

      {/* Minted Inner Seal Center */}
      <mesh castShadow position={[0, 0.0365, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.23, 32]} />
        <meshPhysicalMaterial
          color="#CCD9E8"
          metalness={1.0}
          roughness={0.2}
          clearcoat={0.9}
        />
      </mesh>
      <mesh castShadow position={[0, 0.037, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.006, 24]} />
        <meshPhysicalMaterial
          color="#F2F6FA"
          metalness={1.0}
          roughness={0.12}
          clearcoat={1.0}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 2. THE BRASS DRAFTING COMPASS (The Architect — Kaththi Memorabilia)
// ---------------------------------------------------------------------------
// An authentic 3D drafting compass/caliper resting flat on the grid floor.
// Material: Aged brass/bronze (metalness: 0.8, roughness: 0.4, color: #B5A642).
function BrassDraftingCompass() {
  const compassPos: [number, number, number] = [-3.8, 0.04, 3.6];
  const legLength = 2.6;
  const spreadAngle = 0.26; // ~15 degrees each side

  return (
    <group position={compassPos} rotation={[0, -0.38, 0]}>
      {/* 1. Hinge Pivot Head Assembly */}
      <group position={[0, 0, -legLength / 2]}>
        {/* Central Cylindrical Brass Hinge Disc */}
        <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 24]} />
          <meshStandardMaterial color="#B5A642" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Steel Hinge Screw Core */}
        <mesh castShadow position={[0, 0.075, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
          <meshStandardMaterial color="#555860" metalness={0.9} roughness={0.25} />
        </mesh>
        {/* Knurled Brass Thumb Handle pointing backwards */}
        <mesh castShadow position={[0, 0.03, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.45, 16]} />
          <meshStandardMaterial color="#B5A642" metalness={0.8} roughness={0.45} />
        </mesh>
      </group>

      {/* 2. Left Leg (Tapered Brass Arm with Steel Needle Point) */}
      <group position={[0, 0, -legLength / 2]} rotation={[0, spreadAngle, 0]}>
        {/* Main Brass Arm */}
        <mesh castShadow receiveShadow position={[-0.03, 0.03, legLength * 0.4]}>
          <boxGeometry args={[0.09, 0.06, legLength * 0.8]} />
          <meshStandardMaterial color="#B5A642" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Needle Holder Collar */}
        <mesh castShadow position={[-0.03, 0.03, legLength * 0.82]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.12, 12]} />
          <meshStandardMaterial color="#8C7F32" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* Fine Steel Needle Point extending to the blueprint grid */}
        <mesh castShadow position={[-0.03, 0.02, legLength * 0.96]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.005, 0.24, 8]} />
          <meshStandardMaterial color="#4A4E57" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>

      {/* 3. Right Leg (Tapered Brass Arm with Drafting Lead Tip) */}
      <group position={[0, 0, -legLength / 2]} rotation={[0, -spreadAngle, 0]}>
        {/* Main Brass Arm */}
        <mesh castShadow receiveShadow position={[0.03, 0.03, legLength * 0.4]}>
          <boxGeometry args={[0.09, 0.06, legLength * 0.8]} />
          <meshStandardMaterial color="#B5A642" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Lead Clamp Collar & Thumb Screw */}
        <mesh castShadow position={[0.03, 0.03, legLength * 0.82]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.14, 12]} />
          <meshStandardMaterial color="#8C7F32" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* Graphite / Drafting Lead Tip */}
        <mesh castShadow position={[0.03, 0.02, legLength * 0.95]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.006, 0.22, 8]} />
          <meshStandardMaterial color="#2B2D31" metalness={0.2} roughness={0.85} />
        </mesh>
      </group>

      {/* 4. Horizontal Spindle & Knurled Adjustment Wheel */}
      <group position={[0, 0.03, -legLength * 0.08]}>
        {/* Threaded Brass Spindle Bar */}
        <mesh castShadow position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 1.1, 12]} />
          <meshStandardMaterial color="#B5A642" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* Center Knurled Adjustment Wheel */}
        <mesh castShadow position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.08, 24]} />
          <meshStandardMaterial color="#9C8D35" metalness={0.8} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. THE HYDROLOGY PIPE NODES (The Mission — Kaththi Memorabilia)
// ---------------------------------------------------------------------------
// Below the primary grid, a faint, secondary glowing layer of interconnected
// lines resembling underground water pipes with 4 glowing cyan PointLight nodes.
// Rendered with additive blending and depthTest={false} to create the iconic
// "hidden water blueprint" x-ray effect from Kaththi.
function HydrologyPipeNodes() {
  const pipeGeometry = useMemo(() => {
    // Interconnected underground municipal pipeline network (Jeeva's Chennai water map reference)
    const lines: number[] = [
      // Primary West-East arterial conduit through south precinct
      -16, -0.05, 1.2,   16, -0.05, 1.2,
      // Secondary South-North pipeline 1 (West campus supply)
      -2.6, -0.05, -9.0,  -2.6, -0.05, 8.5,
      // Secondary South-North pipeline 2 (East campus supply)
      2.4, -0.05, -9.0,   2.4, -0.05, 8.5,
      // North Rotunda sub-surface ring conduit
      -7.0, -0.05, -5.5,   7.0, -0.05, -5.5,
      // Southern reservoir arterial line near entrance
      -9.0, -0.05, 4.4,    9.0, -0.05, 4.4,
      // Field subterranean cross-conduits
      -2.6, -0.05, -2.0,   2.4, -0.05, -2.0,
      -2.6, -0.05, -5.5,   2.4, -0.05, -5.5,
      // Perimeter distribution feeds
      -6.8, -0.05, -5.5,  -6.8, -0.05, 4.4,
      6.8, -0.05, -5.5,   6.8, -0.05, 4.4,
      // Diagonal feeder branch connecting to Kaththi coin intersection
      -2.6, -0.05, 1.2,    3.6, -0.05, 4.4,
      // Western aquifer branch past the drafting compass
      -3.8, -0.05, 3.6,   -2.6, -0.05, 1.2,
    ];

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
    return geom;
  }, []);

  useEffect(() => {
    return () => {
      pipeGeometry.dispose();
    };
  }, [pipeGeometry]);

  // 4 glowing municipal pipe intersection nodes (Jeeva's discovered water nodes)
  const nodes: [number, number, number][] = [
    [-2.6, 0.05, 1.2],   // Node 1: Main West Junction
    [2.4, 0.05, 1.2],    // Node 2: Main East Junction
    [-2.6, 0.05, -5.5],  // Node 3: North Rotunda Underpass
    [3.6, 0.05, 4.4],    // Node 4: South Gate Reservoir Feed (at Kaththi coin)
  ];

  return (
    <group renderOrder={2}>
      {/* Underground Water Pipe Lines rendered as faint luminous x-ray tracks */}
      <lineSegments geometry={pipeGeometry}>
        <lineBasicMaterial
          color="#06B6D4"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthTest={false}
          depthWrite={false}
        />
      </lineSegments>

      {/* 4 Glowing Blue/Cyan PointLight Nodes */}
      {nodes.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Subtle cyan PointLight providing dramatic thematic contrast */}
          <pointLight
            color="#00E5FF"
            intensity={0.65}
            distance={2.5}
            decay={2}
          />

          {/* Glowing Junction Marker Sphere */}
          <mesh>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshStandardMaterial
              color="#22D3EE"
              emissive="#00E5FF"
              emissiveIntensity={2.5}
              roughness={0.1}
            />
          </mesh>

          {/* Water Valve Pulse Ring on ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <ringGeometry args={[0.12, 0.18, 24]} />
            <meshBasicMaterial
              color="#00E5FF"
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. ROLLED BLUEPRINT SCROLLS (The Master City Plans — Kaththi Memorabilia)
// ---------------------------------------------------------------------------
// A bundle of rolled architectural blueprints tied with copper ribbons on the outer East corner
function RolledBlueprintScrolls() {
  const scrollGroupPos: [number, number, number] = [7.8, 0.0, -3.0];

  return (
    <group position={scrollGroupPos} rotation={[0, 0.65, 0]}>
      {/* Scroll 1: Base bottom scroll */}
      <group position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.22, 4.2, 24]} />
          <meshStandardMaterial color="#D8C8AA" roughness={0.85} metalness={0.05} />
        </mesh>
        {/* Dark spiral paper roll core (Left) */}
        <mesh position={[0, -2.11, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.02, 24]} />
          <meshBasicMaterial color="#3D3020" />
        </mesh>
        {/* Dark spiral paper roll core (Right) */}
        <mesh position={[0, 2.11, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.02, 24]} />
          <meshBasicMaterial color="#3D3020" />
        </mesh>
        {/* Brass tie ribbons */}
        {[-1.2, 1.2].map((y, i) => (
          <mesh key={i} castShadow position={[0, y, 0]}>
            <cylinderGeometry args={[0.226, 0.226, 0.08, 24]} />
            <meshStandardMaterial color="#B5A642" metalness={0.8} roughness={0.35} />
          </mesh>
        ))}
      </group>

      {/* Scroll 2: Companion bottom scroll */}
      <group position={[0.32, 0.18, 0.35]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.18, 3.8, 24]} />
          <meshStandardMaterial color="#CCBA98" roughness={0.85} metalness={0.05} />
        </mesh>
        {/* Brass tie ribbons */}
        {[-0.9, 0.9].map((y, i) => (
          <mesh key={i} castShadow position={[0, y, 0]}>
            <cylinderGeometry args={[0.186, 0.186, 0.06, 24]} />
            <meshStandardMaterial color="#B5A642" metalness={0.8} roughness={0.35} />
          </mesh>
        ))}
      </group>

      {/* Scroll 3: Top nested scroll */}
      <group position={[0.15, 0.38, 0.18]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.16, 3.6, 24]} />
          <meshStandardMaterial color="#E0D2B8" roughness={0.8} metalness={0.05} />
        </mesh>
        {/* Cyan drafting seal tape (Jeeva's water plan seal) */}
        <mesh castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.166, 0.166, 0.14, 24]} />
          <meshStandardMaterial color="#06B6D4" roughness={0.5} metalness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 5. TRIANGULAR ARCHITECT SCALE RULER (The Scale Tool)
// ---------------------------------------------------------------------------
// Classic 3-sided architectural scale ruler in matte ivory with amber center groove
function ArchitectScaleRuler() {
  const rulerPos: [number, number, number] = [6.8, 0.08, 1.2];

  return (
    <group position={rulerPos} rotation={[0, -0.15, 0]}>
      {/* 3-sided triangular prism ruler body */}
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 4.0, 3]} />
        <meshStandardMaterial color="#EAE4D5" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Color-coded center measurement groove stripe (Amber/Gold) */}
      <mesh castShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[0.025, 0.015, 3.9]} />
        <meshBasicMaterial color="#FFB84D" />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 6. DRAFTING GRAPHITE PENCIL (The Drafting Instrument)
// ---------------------------------------------------------------------------
// Hexagonal amber drafting pencil with sharpened cedar cone and graphite lead
function DraftingPencil() {
  const pencilPos: [number, number, number] = [7.2, 0.04, 2.6];

  return (
    <group position={pencilPos} rotation={[0, 0.25, 0]}>
      {/* Hexagonal wooden barrel (6 facets) */}
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 2.4, 6]} />
        <meshStandardMaterial color="#E08E20" roughness={0.4} metalness={0.15} />
      </mesh>
      {/* Sharpened conical cedar wood cone */}
      <mesh castShadow position={[0, 0, -1.29]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.045, 0.18, 12]} />
        <meshStandardMaterial color="#E5CCA2" roughness={0.9} />
      </mesh>
      {/* Sharp graphite lead tip */}
      <mesh castShadow position={[0, 0, -1.41]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.015, 0.08, 8]} />
        <meshStandardMaterial color="#2B2D30" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Brass ferrule collar at eraser end */}
      <mesh castShadow position={[0, 0, 1.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.047, 0.047, 0.12, 12]} />
        <meshStandardMaterial color="#C2A649" metalness={0.85} roughness={0.35} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 7. ARCHITECT PRECISION UTILITY BLADE (The Precision Modeling Tool)
// ---------------------------------------------------------------------------
// Surgical stainless-steel folding knife resting half-open on the blueprint floor,
// modeled as an architect's precision scale modeling instrument.
function ArchitectPrecisionUtilityBlade() {
  const bladePos: [number, number, number] = [-7.2, 0.05, -0.6];

  return (
    <group position={bladePos} rotation={[0, 0.45, 0]}>
      {/* Contoured titanium/carbon-steel handle */}
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <boxGeometry args={[0.22, 0.08, 1.8]} />
        <meshStandardMaterial color="#22262E" metalness={0.85} roughness={0.35} />
      </mesh>
      {/* Brass pivot rivet hinge */}
      <mesh castShadow position={[0, 0.085, -0.7]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.02, 16]} />
        <meshStandardMaterial color="#B5A642" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Razor-sharp stainless steel blade angled out at ~35 degrees */}
      <group position={[0, 0.04, -0.7]} rotation={[0, 0.6, 0]}>
        <mesh castShadow position={[0, 0, -0.75]}>
          <boxGeometry args={[0.03, 0.09, 1.5]} />
          <meshPhysicalMaterial
            color="#F0F5FA"
            metalness={1.0}
            roughness={0.12}
            clearcoat={1.0}
            clearcoatRoughness={0.06}
          />
        </mesh>
        {/* Polished blade bevel cutting edge */}
        <mesh castShadow position={[0.015, -0.025, -0.75]}>
          <boxGeometry args={[0.008, 0.03, 1.48]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            metalness={1.0}
            roughness={0.08}
            clearcoat={1.0}
          />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 8. THANJAVUR SOIL SPECIMEN VIAL (The Village Earth — The Emotional Core)
// ---------------------------------------------------------------------------
// A laboratory specimen glass jar holding Thanjavur alluvial soil with a threaded brass cap,
// resting near the North Rotunda to anchor the emotional stakes of Kaththi.
function ThanjavurSoilVial() {
  const jarPos: [number, number, number] = [-4.5, 0.28, -7.8];

  return (
    <group position={jarPos}>
      {/* Translucent cylindrical glass jar body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.58, 24]} />
        <meshStandardMaterial
          color="#D8EEF8"
          transparent
          opacity={0.35}
          roughness={0.08}
          metalness={0.1}
        />
      </mesh>
      {/* Rich dark alluvial soil inside the jar */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.44, 20]} />
        <meshStandardMaterial color="#24160E" roughness={0.96} metalness={0.02} />
      </mesh>
      {/* Threaded antique brass cap */}
      <mesh castShadow position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 24]} />
        <meshStandardMaterial color="#B5A642" metalness={0.85} roughness={0.35} />
      </mesh>
      {/* Archival paper specimen label */}
      <mesh castShadow position={[0, 0, 0.265]}>
        <boxGeometry args={[0.28, 0.22, 0.005]} />
        <meshStandardMaterial color="#FAF6EE" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 9. SOLID BRASS BLUEPRINT PAPERWEIGHT (The Drafting Desk Anchor)
// ---------------------------------------------------------------------------
// Solid chamfered brass anchor weight holding down the outer blueprint paper corner
function BrassPaperweight() {
  const weightPos: [number, number, number] = [-7.5, 0.06, 4.5];

  return (
    <group position={weightPos}>
      {/* Main chamfered brass disc */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.48, 0.12, 32]} />
        <meshStandardMaterial color="#C2A649" metalness={0.85} roughness={0.32} />
      </mesh>
      {/* Center recessed ergonomic finger grip ring */}
      <mesh castShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.24, 0.20, 0.03, 24]} />
        <meshStandardMaterial color="#8A7326" metalness={0.9} roughness={0.4} />
      </mesh>
    </group>
  );
}

const emptySubscribe = () => () => {};

function BlueprintSceneContent({
  groundTexture,
  scrollProgress,
  onSelectPin,
  hoveredPinId,
  setHoveredPinId,
  newPin,
}: {
  groundTexture: THREE.CanvasTexture | null;
  scrollProgress: number;
  onSelectPin?: (pin: BlueprintPin) => void;
  hoveredPinId: string | null;
  setHoveredPinId: (id: string | null) => void;
  newPin?: EphemeralPin | null;
}) {
  useWarmup("ideas-blueprint");

  return (
    <>
      <color attach="background" args={["#0F050A"]} />
      <PerspectiveCamera makeDefault position={[16.0, 13.5, 18.5]} fov={32} near={0.1} far={120} />
      <fog attach="fog" args={["#0F050A", 28, 90]} />

      {/* Cinematic War Room Lighting */}
      <ambientLight intensity={0.8} color="#381D2C" />
      <directionalLight position={[20, 25, 15]} intensity={1.8} color="#FFE6B8" />
      <directionalLight position={[-15, 18, -15]} intensity={0.9} color="#8B5A2B" />

      {/* Soft overhead SpotLight creating a dramatic vignette pool of light on the blueprint floor */}
      <spotLight
        position={[0, 22, -1.2]}
        color="#FFF0D4"
        intensity={1.5}
        angle={Math.PI / 4.2}
        penumbra={0.85}
        distance={45}
        decay={2}
        castShadow
      />

      {/* 1. Large Blueprint Ground Plane (y = 0) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[56, 56]} />
        <meshStandardMaterial
          map={groundTexture || undefined}
          roughness={0.75}
          metalness={0.1}
        />
      </mesh>

      {/* Soft Contact Shadows */}
      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.82}
        scale={34}
        blur={1.8}
        far={4.0}
        resolution={512}
        color="#070308"
      />

      {/* Diegetic 3D Architectural Props */}
      <ArchitecturalHeritageCoin />
      <BrassDraftingCompass />
      <HydrologyPipeNodes />
      <RolledBlueprintScrolls />
      <ArchitectScaleRuler />
      <DraftingPencil />
      <ArchitectPrecisionUtilityBlade />
      <ThanjavurSoilVial />
      <BrassPaperweight />

      {/* 2. Ohio Stadium ("The Shoe") 3D Wireframe Real-Time Construction */}
      <OhioStadiumWireframeMesh scrollProgress={scrollProgress} />

      {/* 3. Authentic Landmark Pins (50-Yard Line, North Rotunda, West Tower) */}
      <StadiumCalloutPins
        onSelectPin={onSelectPin}
        hoveredPinId={hoveredPinId}
        setHoveredPinId={setHoveredPinId}
        scrollProgress={scrollProgress}
      />

      {/* 4. Newly Dropped Ephemeral Pin */}
      {newPin && <NewlyDroppedPin key={newPin.id} pin={newPin} />}

      {/* 5. Floating Luminescent Particles */}
      <FloatingParticles />

      {/* 6. Steady Axonometric / Isometric Architectural Camera */}
      <SteadyIsometricCamera />
    </>
  );
}

export function BlueprintScene3D({
  scrollProgress,
  isLiteMode = false,
  newPin = null,
  onSelectPin,
  className = "",
}: BlueprintScene3DProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  const groundTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createBlueprintGroundTexture();
  }, []);

  // Dispose 2048x2048 ground texture on unmount
  useEffect(() => {
    return () => {
      groundTexture?.dispose();
    };
  }, [groundTexture]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    governor.request("ideas-blueprint", inView ? 1 : 0);
    return () => {
      governor.request("ideas-blueprint", 0);
    };
  }, [inView]);

  // Lite Mode or Pre-mount fallback: Static 2D Blueprint SVG
  if (isLiteMode || !mounted) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <BlueprintSVG
          progress={1}
          onSelectCategory={(cat) => {
            const found = BLUEPRINT_PINS.find((p) => p.category === cat);
            if (found && onSelectPin) onSelectPin(found);
          }}
          className="max-w-4xl mx-auto shadow-[6px_6px_0px_#090d20] rounded-none border border-[#415682]"
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-transparent ${className}`}>
      <View className="w-full h-full pointer-events-auto" index={2}>
        <SceneRegistrar />
        <BlueprintSceneContent
          groundTexture={groundTexture}
          scrollProgress={scrollProgress}
          onSelectPin={onSelectPin}
          hoveredPinId={hoveredPinId}
          setHoveredPinId={setHoveredPinId}
          newPin={newPin}
        />
      </View>
    </div>
  );
}
