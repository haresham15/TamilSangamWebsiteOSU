"use client";

import React, { useRef, useMemo, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { BlueprintPin, BLUEPRINT_PINS, BlueprintSVG } from "./BlueprintSVG";
import { buildOhioStadiumLines, StadiumGeometryData } from "./OhioStadiumWireframe";

// Client-only dynamic R3F Canvas
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

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

// Procedural high-resolution blueprint ground texture with cyanotype grid, millimeter ticks, and collegiate title stamp
function createBlueprintGroundTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Deep Cyanotype Indigo Gradient
  const grad = ctx.createRadialGradient(1024, 1024, 80, 1024, 1024, 1400);
  grad.addColorStop(0, "#192454");
  grad.addColorStop(0.6, "#11173b");
  grad.addColorStop(1, "#090d20");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 2048);

  // 2. Blueprint Fine Millimeter Grid (32px cells)
  ctx.strokeStyle = "rgba(100, 135, 195, 0.12)";
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

  // 3. Major Grid (128px cells) with Gold/Teal Ticks
  ctx.strokeStyle = "rgba(140, 180, 240, 0.28)";
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

  // 4. Kolam Pulli Dot Matrix & Dimension Crosses
  ctx.fillStyle = "rgba(85, 204, 162, 0.55)";
  for (let x = majorStep; x < 2048; x += majorStep) {
    for (let y = majorStep; y < 2048; y += majorStep) {
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Dimension Cross
      ctx.strokeStyle = "rgba(255, 197, 38, 0.3)";
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
  ctx.strokeStyle = "rgba(248, 246, 240, 0.4)";
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, 1928, 1928);

  ctx.strokeStyle = "rgba(255, 197, 38, 0.65)";
  ctx.lineWidth = 2;
  ctx.strokeRect(76, 76, 1896, 1896);

  // Technical Title Stamp (South-East Corner)
  ctx.fillStyle = "rgba(248, 246, 240, 0.9)";
  ctx.font = "bold 22px monospace";
  ctx.fillText("THE OHIO STATE UNIVERSITY · COMMUNITY BLUEPRINT ENGINE", 100, 130);
  ctx.font = "15px monospace";
  ctx.fillStyle = "rgba(255, 197, 38, 0.85)";
  ctx.fillText("BUILDING OUR SANGAM LINE BY LINE · STUDENT VISION & SUGGESTION PLATFORM", 100, 158);
  ctx.fillStyle = "rgba(85, 204, 162, 0.85)";
  ctx.fillText("OSU TAMIL SANGAM · ARCHITECTURAL COMMUNITY METAPHOR · COLUMBUS, OH", 100, 182);

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
      // Base blueprint line color: crisp ivory/steel blue
      vec3 color = uColorBase;

      // Element-specific architectural coloration
      if (vTag < 0.5) {
        // Football Field: glowing mint/emerald
        color = uColorField;
      } else if (vTag > 3.5 && vTag < 4.5) {
        // North Rotunda: sacred radiant gold
        color = uColorRotunda;
      } else if (vTag > 4.5) {
        // Press Box & Scoreboard: technical cyan
        color = vec3(0.40, 0.78, 0.98);
      } else if (vTag > 1.5 && vTag < 2.5) {
        // Cantilever Steel Trusses: warm bronze/gold
        color = mix(uColorBase, vec3(1.0, 0.82, 0.4), 0.45);
      }

      // Kaththi Hologram Glow Effect: blazing neon gold/cyan along the active construction wave
      if (vScanIntensity > 0.01) {
        vec3 activeGlow = mix(vec3(0.2, 0.9, 1.0), vec3(1.0, 0.85, 0.2), 0.5 + 0.5 * sin(uTime * 8.0));
        color = mix(color, activeGlow, vScanIntensity);
      }

      gl_FragColor = vec4(color, 0.92);
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

  // Custom Shader Material uniforms
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: StadiumLineShader.vertexShader,
      fragmentShader: StadiumLineShader.fragmentShader,
      uniforms: {
        uProgress: { value: 0 },
        uMaxHeight: { value: maxHeight },
        uTime: { value: 0 },
        uColorBase: { value: new THREE.Color("#f8f6f0") }, // Blueprint ivory
        uColorGlow: { value: new THREE.Color("#FFC526") }, // Blazing construction gold
        uColorField: { value: new THREE.Color("#55CCA2") }, // Emerald turf lines
        uColorRotunda: { value: new THREE.Color("#FFD875") }, // Rotunda gold
      },
      transparent: true,
      depthWrite: true,
      blending: THREE.AdditiveBlending,
    });
  }, [maxHeight]);

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
          color="#FFC526"
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

  useFrame((state) => {
    // Subtle, organic breathing parallax to keep the scene alive
    const mouseX = state.mouse.x * 0.35;
    const mouseY = state.mouse.y * 0.20;

    const targetPos = new THREE.Vector3(
      basePos.x + mouseX,
      basePos.y + mouseY,
      basePos.z
    );

    camera.position.lerp(targetPos, 0.05);
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
      ringRef.current.rotation.y += delta * 0.6;
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
                color={isHovered ? "#55CCA2" : "#FFC526"}
                transparent
                opacity={isHovered ? 0.8 : 0.45}
              />
            </mesh>

            {/* Glowing Beacon Head */}
            <mesh position={[0, 1.6, 0]}>
              <sphereGeometry args={[isHovered ? 0.22 : 0.16, 16, 16]} />
              <meshStandardMaterial
                color={isHovered ? "#55CCA2" : "#FFC526"}
                emissive={isHovered ? "#55CCA2" : "#FFC526"}
                emissiveIntensity={isHovered ? 1.4 : 0.9}
                roughness={0.2}
              />
            </mesh>

            {/* Ground Ring Indicator */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[0.25, 0.35, 24]} />
              <meshBasicMaterial
                color={isHovered ? "#55CCA2" : "#FFC526"}
                transparent
                opacity={0.6}
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
    if (altitudeRef.current > 0.05 || Math.abs(velocityRef.current) > 0.05) {
      const gravity = 18;
      const nextVel = velocityRef.current - gravity * delta;
      let nextAlt = altitudeRef.current + nextVel * delta;

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
          color="#FFC526"
          emissive="#FFD875"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#55CCA2"
          emissive="#55CCA2"
          emissiveIntensity={1.3}
        />
      </mesh>

      <pointLight color="#FFC526" intensity={3.0} distance={5} position={[0, 1.2, 0]} />

      {/* Ripple ring on ground */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -6.0 + 0.02, 0]}>
        <ringGeometry args={[0.35, 0.5, 32]} />
        <meshBasicMaterial color="#FFC526" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Ambient Floating Luminescent Particles
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

function FloatingParticles() {
  const count = 100;
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, phases } = useMemo(() => getFloatingParticles(count), [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] = positions[i * 3 + 1] + Math.sin(time * 0.8 + phases[i]) * 0.2;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#FFD875"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const emptySubscribe = () => () => {};

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
          className="max-w-4xl mx-auto shadow-2xl rounded-xl border border-[#415682]"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [16.0, 13.5, 18.5], fov: 32 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        className="w-full h-full"
      >
        {/* Deep Cyanotype Ink Sky Ground */}
        <color attach="background" args={["#0a0e22"]} />
        <fog attach="fog" args={["#0a0e22", 32, 95]} />

        {/* Studio Architectural Lighting */}
        <ambientLight intensity={1.3} color="#c8d6f5" />
        <directionalLight position={[20, 25, 15]} intensity={2.4} color="#fff1d6" />
        <directionalLight position={[-15, 18, -15]} intensity={1.2} color="#55CCA2" />

        {/* 1. Large Cyanotype Blueprint Ground Plane (y = 0) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[56, 56]} />
          <meshStandardMaterial
            map={groundTexture || undefined}
            roughness={0.75}
            metalness={0.1}
          />
        </mesh>

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
      </Canvas>
    </div>
  );
}
