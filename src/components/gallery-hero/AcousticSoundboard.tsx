"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { heroState } from "./state";

/**
 * LAYER 2: SCULPTED ACOUSTIC GUITAR SOUNDBOARD, SOUNDHOLE & ABALONE KOLAM ROSETTE
 * 
 * - Oblique 3D Perspective Stage: [0.18, -0.28, -0.12] rotation
 * - Honey-Spruce Dreadnought Soundboard with Tobacco-to-Honey Sunburst & Luthier Lacquer
 * - Recessed Rosewood Soundhole Chamber (r = 1.45m, depth = 0.55m) with Sitka Spruce X-Braces
 * - Warm Golden Interior Point Light spilling light out of the soundhole
 * - Iridescent Mother-of-Pearl / Abalone & Brushed Chola Brass Kolam Rosette Ring
 * - Contoured Rosewood Bridge, Ivory Saddle & 6 Brass Bridge Pins
 * - Sleek Ebony Fingerboard with Nickel-Silver Frets (with rounded ends, zero UI overhang)
 */

// 1. Honey-Spruce Sunburst & Wood Grain Shader
const SunburstSoundboardShader = {
  uniforms: {
    uSunburstCenter: { value: new THREE.Vector2(0.0, -2.4) },
    uHoneySpruce: { value: new THREE.Color("#D9823B") },
    uDarkRosewood: { value: new THREE.Color("#3B1A0E") },
    uLacquerRim: { value: new THREE.Color("#180B06") },
    uTime: { value: 0.0 },
    uReverie: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      vNormal = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform vec2 uSunburstCenter;
    uniform vec3 uHoneySpruce;
    uniform vec3 uDarkRosewood;
    uniform vec3 uLacquerRim;
    uniform float uTime;
    uniform float uReverie;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormal;

    void main() {
      // Sunburst radial falloff from soundhole center
      // position.x, position.z in local space
      vec2 localCoord = vUv - vec2(0.5, 0.5);
      float dist = length(localCoord * vec2(1.2, 0.95)) * 2.2;

      // Longitudinal spruce wood-grain fibers
      float grain = sin(vUv.x * 620.0) * 0.04 + sin(vUv.x * 1280.0) * 0.02;
      // Cross-medullary ray flecks
      float fleck = sin(vUv.y * 140.0 + sin(vUv.x * 80.0) * 2.0) * 0.025;

      // Sunburst gradient stops
      vec3 wood;
      if (dist < 0.45) {
        wood = mix(uHoneySpruce, uHoneySpruce * 0.9, dist / 0.45);
      } else if (dist < 0.85) {
        wood = mix(uHoneySpruce * 0.9, uDarkRosewood, (dist - 0.45) / 0.40);
      } else {
        wood = mix(uDarkRosewood, uLacquerRim, smoothstep(0.85, 1.15, dist));
      }

      wood += vec3(grain + fleck);

      // Warm directional light + high-gloss luthier clearcoat
      vec3 N = normalize(vNormal);
      vec3 L = normalize(vec3(-2.5, 4.0, 3.5));
      vec3 V = normalize(cameraPosition - vWorldPos);
      vec3 H = normalize(L + V);

      float NdotL = max(0.0, dot(N, L));
      float spec = pow(max(0.0, dot(N, H)), 48.0) * 0.65;
      float clearcoat = pow(max(0.0, dot(N, H)), 160.0) * 1.2;

      // Reverie bloom warmth
      vec3 reverieWarmth = vec3(1.0, 0.85, 0.45) * uReverie * 0.25;

      vec3 finalCol = wood * (0.35 + 0.65 * NdotL) + vec3(spec + clearcoat) + reverieWarmth;
      gl_FragColor = vec4(finalCol, 1.0);
    }
  `,
};

// 2. Iridescent Mother-of-Pearl & Chola Brass Kolam Rosette Shader
const KolamRosetteAbaloneShader = {
  uniforms: {
    uTime: { value: 0.0 },
    uReverie: { value: 0.0 },
    uBrassGold: { value: new THREE.Color("#D4AF37") },
    uSoundholeCenter: { value: new THREE.Vector2(0, 0) },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      vNormal = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uReverie;
    uniform vec3 uBrassGold;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormal;

    void main() {
      // Polar coords around ring center
      vec2 center = vUv - 0.5;
      float r = length(center) * 2.0; // 0 to 1
      float theta = atan(center.y, center.x);

      // Discard outside rosette ring bounds
      if (r < 0.58 || r > 0.98) {
        discard;
      }

      // 8-Fold Sacred Sikku Kolam / Lotus Petal SDF
      float petals = abs(sin(theta * 8.0 + sin(r * 18.0) * 0.4));
      float innerPinstripe = smoothstep(0.58, 0.62, r) * (1.0 - smoothstep(0.66, 0.70, r));
      float outerPinstripe = smoothstep(0.86, 0.90, r) * (1.0 - smoothstep(0.94, 0.98, r));
      float centerKolamTrack = smoothstep(0.68, 0.72, r) * (1.0 - smoothstep(0.82, 0.86, r));

      // View-angle-dependent iridescent Mother-of-Pearl / Abalone
      vec3 V = normalize(cameraPosition - vWorldPos);
      vec3 N = normalize(vNormal);
      float viewAngle = dot(N, V);
      float pearlPhase = viewAngle * 2.2 + r * 3.5 + sin(theta * 4.0) * 0.25;

      // Optical thin-film interference: Aqua-Teal #64D8CB, Rose-Gold #F4A28C, Warm Ivory #FFF8EB
      vec3 pearl = 0.5 + 0.5 * cos(6.28318 * (pearlPhase + vec3(0.0, 0.33, 0.67)));
      pearl = mix(vec3(0.98, 0.95, 0.90), pearl, 0.45);

      // Brass pinstripes vs Kolam inlay
      vec3 color = pearl;
      if (innerPinstripe > 0.3 || outerPinstripe > 0.3) {
        color = mix(color, uBrassGold, 0.88);
      }
      if (centerKolamTrack > 0.2) {
        float petalPattern = step(0.42, petals);
        vec3 kolamInlay = mix(uBrassGold, vec3(0.12, 0.08, 0.06), petalPattern);
        color = mix(color, kolamInlay, 0.75);
      }

      // Golden Reverie shockwave bloom
      float shockwave = sin(r * 24.0 - uTime * 6.0) * 0.5 + 0.5;
      vec3 bloom = vec3(1.0, 0.88, 0.52) * (uReverie * (0.6 + 0.4 * shockwave));
      color += bloom;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export function AcousticSoundboard() {
  const soundboardMatRef = useRef<THREE.ShaderMaterial>(null);
  const rosetteMatRef = useRef<THREE.ShaderMaterial>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);

  // 1. Dreadnought Soundboard Body Shape with Circular Soundhole Cutout
  const soundboardGeo = useMemo(() => {
    const shape = new THREE.Shape();
    // Contour points along dreadnought body: waist, upper bout, lower bout
    // Centered around z = -2.4 (soundhole)
    // Starts at neck heel (z = -0.9, width ~2.2)
    shape.moveTo(-1.1, -0.9);
    shape.bezierCurveTo(-2.1, -1.4, -2.4, -2.6, -1.8, -3.8); // Upper bout
    shape.bezierCurveTo(-1.5, -4.3, -1.5, -4.7, -1.9, -5.2); // Waist
    shape.bezierCurveTo(-2.6, -5.8, -2.8, -7.2, -1.8, -8.2); // Lower bout
    shape.bezierCurveTo(-1.0, -8.6, 1.0, -8.6, 1.8, -8.2);   // Bottom curve
    shape.bezierCurveTo(2.8, -7.2, 2.6, -5.8, 1.9, -5.2);    // Right lower bout
    shape.bezierCurveTo(1.5, -4.7, 1.5, -4.3, 1.8, -3.8);    // Right waist
    shape.bezierCurveTo(2.4, -2.6, 2.1, -1.4, 1.1, -0.9);    // Right upper bout
    shape.closePath();

    // Soundhole cutout at (0, -2.4) with radius 1.45m
    const hole = new THREE.Path();
    hole.absarc(0, -2.4, 1.45, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.04,
      bevelSegments: 4,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Rotate so body lies flat on the guitar plane (facing +Y)
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 2. Soundhole Resonance Chamber (depth 0.55m, radius 1.44m)
  const chamberGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1.44, 1.44, 0.55, 48, 1, true);
    return geo;
  }, []);

  // 3. Sitka Spruce Internal X-Brace Ribs
  const xBraceGeo = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.12, 0.22, 2.6);
    return geo;
  }, []);

  // 4. Mother-of-Pearl & Brushed Brass Kolam Rosette Ring (inner 1.48, outer 1.82)
  const rosetteGeo = useMemo(() => {
    const geo = new THREE.RingGeometry(1.48, 1.82, 64);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // 5. Reverie Shockwave Ring
  const shockwaveGeo = useMemo(() => {
    const geo = new THREE.RingGeometry(1.50, 1.65, 64);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // 6. Sculpted Rosewood Bridge with Contoured Wings
  const bridgeGeo = useMemo(() => {
    const shape = new THREE.Shape();
    // Belly bridge shape
    shape.moveTo(-1.6, -0.45);
    shape.bezierCurveTo(-1.2, -0.45, -0.8, -0.65, 0.0, -0.65);
    shape.bezierCurveTo(0.8, -0.65, 1.2, -0.45, 1.6, -0.45);
    shape.bezierCurveTo(1.6, 0.25, 0.8, 0.45, 0.0, 0.45);
    shape.bezierCurveTo(-0.8, 0.45, -1.6, 0.25, -1.6, -0.45);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
    });
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 7. Bone Saddle (angled slightly for intonation)
  const saddleGeo = useMemo(() => {
    const geo = new THREE.BoxGeometry(1.35, 0.14, 0.08);
    return geo;
  }, []);

  // 8. 6 Domed Brass Bridge Pins with Mother-of-Pearl Center Dot
  const pinGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.045, 0.035, 0.18, 16);
    return geo;
  }, []);

  // 9. Ebony Fingerboard (tapered from 1.45m at body to 0.95m at nut)
  const fingerboardGeo = useMemo(() => {
    const shape = new THREE.Shape();
    // Nut at z = +4.8 (halfW = 0.48), Body joint at z = -0.9 (halfW = 0.72)
    shape.moveTo(-0.48, 4.8);
    shape.lineTo(0.48, 4.8);
    shape.lineTo(0.72, -0.9);
    shape.lineTo(-0.72, -0.9);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 10. Chamfered Nickel-Silver Frets (21 Frets with Spherical Ends — Zero UI Overhang)
  const fretData = useMemo(() => {
    // 12-TET spacing along speaking length L = 10.2 (Nut at 4.8, Bridge at -5.4)
    const L = 10.2;
    const nutZ = 4.8;
    const frets: { z: number; width: number }[] = [];

    for (let n = 1; n <= 21; n++) {
      const distFromNut = L * (1.0 - Math.pow(2.0, -n / 12.0));
      const z = nutZ - distFromNut;
      if (z > -0.85) {
        // Linearly interpolate fingerboard width at z
        const t = (nutZ - z) / (nutZ - (-0.9));
        const width = THREE.MathUtils.lerp(0.94, 1.40, t) - 0.04;
        frets.push({ z, width });
      }
    }
    return frets;
  }, []);

  const fretMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#DCDCD7",
      metalness: 0.96,
      roughness: 0.16,
      envMapIntensity: 1.8,
    });
  }, []);

  useEffect(() => {
    return () => {
      soundboardGeo.dispose();
      chamberGeo.dispose();
      xBraceGeo.dispose();
      rosetteGeo.dispose();
      shockwaveGeo.dispose();
      bridgeGeo.dispose();
      saddleGeo.dispose();
      pinGeo.dispose();
      fingerboardGeo.dispose();
      fretMaterial.dispose();
    };
  }, [
    soundboardGeo,
    chamberGeo,
    xBraceGeo,
    rosetteGeo,
    shockwaveGeo,
    bridgeGeo,
    saddleGeo,
    pinGeo,
    fingerboardGeo,
    fretMaterial,
  ]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const targetReverie = heroState.easterEggActive ? 1.0 : 0.0;

    if (soundboardMatRef.current) {
      soundboardMatRef.current.uniforms.uTime.value = t;
      soundboardMatRef.current.uniforms.uReverie.value = THREE.MathUtils.damp(
        soundboardMatRef.current.uniforms.uReverie.value,
        targetReverie,
        4.0,
        dt
      );
    }

    if (rosetteMatRef.current) {
      rosetteMatRef.current.uniforms.uTime.value = t;
      rosetteMatRef.current.uniforms.uReverie.value = THREE.MathUtils.damp(
        rosetteMatRef.current.uniforms.uReverie.value,
        targetReverie,
        4.0,
        dt
      );
    }

    // Shockwave ring animation on Easter Egg
    if (shockwaveRef.current) {
      if (heroState.easterEggActive) {
        const elapsed = (Date.now() - heroState.easterEggUnlockedAt) / 1000.0;
        const scale = 1.0 + elapsed * 1.8;
        shockwaveRef.current.visible = elapsed < 2.5;
        shockwaveRef.current.scale.set(scale, scale, 1.0);
      } else {
        shockwaveRef.current.visible = false;
      }
    }
  });

  return (
    // Oblique Perspective Stage: rotated [0.18, -0.28, -0.12]
    <group
      name="sculpted-acoustic-guitar-stage"
      position={[0.15, -0.15, -1.0]}
      rotation={[0.18, -0.28, -0.12]}
    >
      {/* 1. Honey-Spruce Sunburst Dreadnought Soundboard */}
      <mesh geometry={soundboardGeo} position={[0, -0.06, 0]} receiveShadow castShadow>
        <shaderMaterial ref={soundboardMatRef} args={[SunburstSoundboardShader]} />
      </mesh>

      {/* 2. Recessed Rosewood Resonance Chamber beneath Soundhole */}
      <mesh geometry={chamberGeo} position={[0, -0.32, -2.4]}>
        <meshStandardMaterial color="#110907" roughness={0.9} side={THREE.BackSide} />
      </mesh>

      {/* 3. Sitka Spruce Internal X-Bracing catching golden glow */}
      <group position={[0, -0.42, -2.4]}>
        <mesh geometry={xBraceGeo} rotation={[0, Math.PI / 4, 0]}>
          <meshStandardMaterial color="#9E693D" roughness={0.7} />
        </mesh>
        <mesh geometry={xBraceGeo} rotation={[0, -Math.PI / 4, 0]}>
          <meshStandardMaterial color="#9E693D" roughness={0.7} />
        </mesh>
      </group>

      {/* 4. Warm Golden Soundhole Point Light spilling light out of guitar */}
      <pointLight
        color="#FFA834"
        intensity={18}
        distance={6}
        decay={2}
        position={[0, -0.22, -2.4]}
      />

      {/* 5. Iridescent Mother-of-Pearl & Brushed Brass Kolam Rosette */}
      <mesh geometry={rosetteGeo} position={[0, 0.008, -2.4]}>
        <shaderMaterial ref={rosetteMatRef} args={[KolamRosetteAbaloneShader]} transparent />
      </mesh>

      {/* 6. Easter Egg Rosette Shockwave Ring */}
      <mesh ref={shockwaveRef} geometry={shockwaveGeo} position={[0, 0.012, -2.4]}>
        <meshBasicMaterial
          color="#FFD479"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 7. Contoured Rosewood Bridge at z = -5.4 */}
      <group position={[0, 0.02, -5.4]}>
        <mesh geometry={bridgeGeo} castShadow receiveShadow>
          <meshStandardMaterial color="#1E0F0A" roughness={0.25} metalness={0.08} />
        </mesh>

        {/* Bone Saddle with Intonation Angle */}
        <mesh
          geometry={saddleGeo}
          position={[0, 0.16, 0.12]}
          rotation={[0, 0.04, 0]}
          castShadow
        >
          <meshStandardMaterial color="#F5EFE6" roughness={0.15} metalness={0.04} />
        </mesh>

        {/* 6 Domed Brass Bridge Pins with Mother-of-Pearl Dots */}
        {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((idx, i) => {
          const pinX = idx * 0.22;
          return (
            <group key={i} position={[pinX, 0.14, -0.22]}>
              {/* Domed Brass Body */}
              <mesh geometry={pinGeo} castShadow>
                <meshStandardMaterial color="#D4AF37" metalness={0.92} roughness={0.18} />
              </mesh>
              {/* Mother-of-Pearl Center Dot */}
              <mesh position={[0, 0.092, 0]}>
                <sphereGeometry args={[0.025, 12, 12]} />
                <meshStandardMaterial color="#F2EDE4" roughness={0.2} metalness={0.1} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 8. Sleek Ebony Fingerboard */}
      <mesh geometry={fingerboardGeo} position={[0, 0.02, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#141110" roughness={0.35} metalness={0.08} />
      </mesh>

      {/* 9. Chamfered Nickel-Silver Frets (Spherical Ends, strictly inside neck width) */}
      <group position={[0, 0.082, 0]}>
        {fretData.map((fret, i) => (
          <mesh
            key={i}
            position={[0, 0, fret.z]}
            rotation={[0, 0, Math.PI / 2]}
            material={fretMaterial}
            castShadow
          >
            <cylinderGeometry args={[0.024, 0.024, fret.width, 16]} />
          </mesh>
        ))}
      </group>

      {/* 10. Bone Nut at z = +4.8 */}
      <mesh position={[0, 0.09, 4.8]} castShadow>
        <boxGeometry args={[0.98, 0.14, 0.12]} />
        <meshStandardMaterial color="#F5EFE6" roughness={0.22} metalness={0.04} />
      </mesh>
    </group>
  );
}

export default AcousticSoundboard;
