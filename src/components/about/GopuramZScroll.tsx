"use client";

import React, { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { useReducedMotion } from "framer-motion";
import { useTier } from "@/components/providers/TierProvider";
import { HeroScrollStage, useHeroStageVisibility } from "@/components/canvas/HeroScrollStage";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { SceneView as View } from "@/components/canvas/SceneView";
import { registerSystem } from "@/engine/masterTick";
import { SceneRegistrar } from "@/director/wireframe";
import { SangamStudioEnvironment } from "@/components/canvas/SangamStudioEnvironment";
import { useWarmup } from "@/components/gl/useWarmup";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { createCinemaCameraDamper, smootherstep } from "@/lib/cinemaCameraDamper";
import { proceduralPbrMaps } from "@/lib/proceduralPbrMaps";
import { GradeStack } from "@/gl/grade/GradeStack";

interface TierItem {
  id: string;
  talaIndex: number;
  subtitleEn: string;
  subtitleTa: string;
  titleEn: string;
  titleTa: string;
  kuralQuote?: string;
  descEn: string;
  descTa: string;
}

const TIERS: TierItem[] = [
  {
    id: "tier-1",
    talaIndex: 0,
    subtitleEn: "Foundational Sangam Philosophy",
    subtitleTa: "சங்கத்தின் மூலக்கோட்பாடு",
    titleEn: "To Us All Towns Are Home, Everyone Our Kin",
    titleTa: "யாதும் ஊரே யாவரும் கேளீர்",
    kuralQuote: "புறநானூறு 192 (கணியன் பூங்குன்றனார்)",
    descEn:
      "A classical Tamil principle written over two millennia ago that defines our ethos: whoever you are, wherever you come from, you belong here.",
    descTa:
      "இரண்டாயிரம் ஆண்டுகளுக்கு முன்பே முழங்கிய சமத்துவக் குரல் — ஓஹியோ வளாகத்தில் அனைவரையும் அரவணைக்கும் பண்பாட்டுப் பார்வை.",
  },
  {
    id: "tier-2",
    talaIndex: 1,
    subtitleEn: "Pillar of Belonging",
    subtitleTa: "நட்பின் அடையாளம்",
    titleEn: "A Campus Family Open to All Languages",
    titleTa: "மொழி பேதமின்றி அனைவருக்குமான இல்லம்",
    descEn:
      "You don't need to speak Tamil to be part of Tamil Sangam. We celebrate food, friendship, cultural exchange, and Buckeye solidarity.",
    descTa:
      "தமிழ் பேசத் தெரியாவிட்டாலும் பரவாயில்லை — நட்பு, சுவையான உணவு, மற்றும் கலாச்சாரப் பகிர்வில் அனைவரும் இணையலாம்.",
  },
  {
    id: "tier-3",
    talaIndex: 2,
    subtitleEn: "The Rhythm of Joy",
    subtitleTa: "உற்சாகத்தின் நடனம்",
    titleEn: "Aatam, Paatam, Kondatam",
    titleTa: "ஆட்டம் · பாட்டம் · கொண்டாட்டம்",
    descEn:
      "From electric cinematic Kuthu rehearsals to soulful acoustic jams and South Oval picnics, joy is our primary language.",
    descTa:
      "மேடை அதிரும் நடனங்கள், மெல்லிசைப் பாடல்கள், மற்றும் புல்வெளி பிக்னிக்குகளுடன் கூடிய உற்சாக மாலைகள்.",
  },
  {
    id: "tier-4",
    talaIndex: 3,
    subtitleEn: "Collegiate Fellowship",
    subtitleTa: "தோழமை & ஆதரவு",
    titleEn: "Lifelong Buckeye Community in Columbus",
    titleTa: "வளாகத்தில் வாழ்நாள் நட்பு",
    descEn:
      "Mentorship, career guidance, shared rides, home-cooked food nights, and memories that outlast graduation.",
    descTa:
      "வழிகாட்டுதல், உணவு பகிர்வு, கல்வி உதவி, மற்றும் வாழ்நாள் முழுவதும் தொடரும் கல்லூரி நட்பு.",
  },
  {
    id: "tier-5",
    talaIndex: 4,
    subtitleEn: "Living Heritage",
    subtitleTa: "செம்மொழிச் செழுமை",
    titleEn: "Rooted in 2,500 Years of Classical Literature",
    titleTa: "செம்மொழி மரபுடன் நவீன பார்வை",
    descEn:
      "Honoring one of the world's longest-surviving classical languages through contemporary collegiate celebration.",
    descTa:
      "தொன்மைமிகு தமிழ் மொழியின் மாண்பைப் போற்றி, நவீன மாணவர் சமூகத்தில் அதனை உயிர்ப்புடன் நிலைநிறுத்துகிறோம்.",
  },
];

// Parametric 3D Sikku Kolam (Brahma Mudi) Curve with wide, gentle, flowing turns
class KolamKnotCurve extends THREE.Curve<THREE.Vector3> {
  radius: number;
  amplitude: number;
  p: number;
  q: number;
  depth: number;

  constructor(radius = 3.0, amplitude = 0.25, p = 3, q = 8, depth = 0.45) {
    super();
    this.radius = radius;
    this.amplitude = amplitude; // Gentle radial oscillation ensures rounded, flowing bends without sharp hairpins
    this.p = p;
    this.q = q;
    this.depth = depth;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    // Closed knot loops over p * 2 * PI
    const u = t * this.p * Math.PI * 2;
    const quOverP = (this.q / this.p) * u;
    const cs = Math.cos(quOverP);
    
    // Smooth harmonic radial modulation forming 8 lotus-petal loops
    const r = this.radius * (1 + this.amplitude * cs);
    const x = r * Math.cos(u);
    const y = r * Math.sin(u);
    const z = this.depth * Math.sin(quOverP);

    return optionalTarget.set(x, y, z);
  }
}

// Shared memoized geometries and materials for Bronze Kolam rings across all tiers
// 720 tubular segments & 32 radial segments guarantee silky, mathematically continuous curves with 0 faceting
const sharedKolamCurve = new KolamKnotCurve(3.0, 0.25, 3, 8, 0.45);
const sharedKolamGeo = new THREE.TubeGeometry(sharedKolamCurve, 720, 0.07, 32, true);
const sharedTorusGeo = new THREE.TorusGeometry(4.0, 0.12, 32, 200);
const sharedInnerRingGeo = new THREE.TorusGeometry(1.85, 0.04, 24, 120);
const sharedCenterDotGeo = new THREE.SphereGeometry(0.28, 32, 24);

import { createHeroKineticsTracker } from "@/lib/heroKinetics";

const sharedRingMat = new THREE.MeshPhysicalMaterial({
  color: "#D4AF37",
  metalness: 0.92,
  roughness: 0.22,
  clearcoat: 0.6,
  clearcoatRoughness: 0.2,
  emissive: new THREE.Color("#2A1808"),
  emissiveIntensity: 0.15,
});

sharedRingMat.onBeforeCompile = (shader) => {
  shader.vertexShader = `
    varying vec3 vWorldPosition;
    ${shader.vertexShader}
  `.replace(
    `#include <begin_vertex>`,
    `#include <begin_vertex>
     vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    `
  );

  shader.fragmentShader = `
    varying vec3 vWorldPosition;
    ${shader.fragmentShader}
  `.replace(
    `#include <roughnessmap_fragment>`,
    `#include <roughnessmap_fragment>
     // Procedural astrolabe degree ticks on astronomical brass
     float angle = atan(vWorldPosition.y, vWorldPosition.x);
     float tick = step(0.92, sin(angle * 90.0));
     roughnessFactor = mix(roughnessFactor, 0.48, tick * 0.65);
    `
  ).replace(
    `#include <emissivemap_fragment>`,
    `#include <emissivemap_fragment>
     // Warm Fresnel edge sheen on outer ring bevels
     vec3 viewDir = normalize(vViewPosition);
     float fresnel = pow(1.0 - max(0.0, dot(normalize(vNormal), viewDir)), 3.0);
     totalEmissiveRadiance += vec3(0.98, 0.72, 0.28) * (fresnel * 0.35);
    `
  );
};

const sharedKolamMat = new THREE.MeshPhysicalMaterial({
  color: "#CD7F32",
  metalness: 0.88,
  roughness: 0.24,
  clearcoat: 0.85,
});

const sharedCoreMat = new THREE.MeshPhysicalMaterial({
  color: "#F2BE54",
  metalness: 0.94,
  roughness: 0.15,
  clearcoat: 1.0,
  emissive: new THREE.Color("#D4AF37"),
  emissiveIntensity: 0.45,
});

const CURSOR_LIGHT_COLOR = "#FFB366";

const STAGE_RANGES = [
  { start: 0.00, end: 0.16 },
  { start: 0.16, end: 0.32 },
  { start: 0.32, end: 0.48 },
  { start: 0.48, end: 0.64 },
  { start: 0.64, end: 0.80 },
];

// Hook for procedural PBR textures and elevated materials in Cinematic Mode
function useCinematicBronzeMaterials(isCinematic: boolean) {
  const timeUniformRef = useRef<{ uTime: { value: number } }>({ uTime: { value: 0 } });

  useFrame((state) => {
    if (isCinematic) {
      timeUniformRef.current.uTime.value = state.clock.getElapsedTime();
    }
  });

  const textures = useMemo(() => {
    if (!isCinematic) return null;
    const brushedNormal = proceduralPbrMaps.getBrushedMetalNormal("gopuram-brushed-normal", 256, 256);
    const noiseRoughness = proceduralPbrMaps.getNoiseRoughness("gopuram-noise-roughness", 256, 256, 0.12, 0.28);
    const graniteNormal = proceduralPbrMaps.getGraniteNormal("gopuram-granite-normal", 256, 256);
    return { brushedNormal, noiseRoughness, graniteNormal };
  }, [isCinematic]);

  useEffect(() => {
    if (!isCinematic) return;
    return () => {
      proceduralPbrMaps.release("gopuram-brushed-normal");
      proceduralPbrMaps.release("gopuram-noise-roughness");
      proceduralPbrMaps.release("gopuram-granite-normal");
    };
  }, [isCinematic]);

  const materials = useMemo(() => {
    if (!isCinematic || !textures) {
      return {
        ringMat: sharedRingMat,
        kolamMat: sharedKolamMat,
        coreMat: sharedCoreMat,
      };
    }

    const ringMat = new THREE.MeshPhysicalMaterial({
      color: "#D4AF37",
      metalness: 0.94,
      roughness: 0.18,
      roughnessMap: textures.noiseRoughness,
      normalMap: textures.brushedNormal,
      normalScale: new THREE.Vector2(0.3, 0.3),
      clearcoat: 0.85,
      clearcoatRoughness: 0.15,
      emissive: new THREE.Color("#2A1808"),
      emissiveIntensity: 0.18,
    });

    ringMat.onBeforeCompile = (shader) => {
      shader.vertexShader = `
        varying vec3 vWorldPosition;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
         vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        `
      );

      shader.fragmentShader = `
        varying vec3 vWorldPosition;
        ${shader.fragmentShader}
      `.replace(
        `#include <roughnessmap_fragment>`,
        `#include <roughnessmap_fragment>
         // Astrolabe major ticks (every 30 deg) and fine degree ticks
         float angle = atan(vWorldPosition.y, vWorldPosition.x);
         float majorTick = step(0.96, sin(angle * 12.0));
         float minorTick = step(0.92, sin(angle * 90.0));
         float tick = max(majorTick, minorTick * 0.6);
         roughnessFactor = mix(roughnessFactor, 0.52, tick * 0.7);
        `
      ).replace(
        `#include <emissivemap_fragment>`,
        `#include <emissivemap_fragment>
         // Warm Fresnel edge sheen + major tick glint
         vec3 viewDir = normalize(vViewPosition);
         float fresnel = pow(1.0 - max(0.0, dot(normalize(vNormal), viewDir)), 3.0);
         totalEmissiveRadiance += vec3(0.98, 0.72, 0.28) * (fresnel * 0.38);
         float majorAngle = atan(vWorldPosition.y, vWorldPosition.x);
         float majorSparkle = step(0.96, sin(majorAngle * 12.0));
         totalEmissiveRadiance += vec3(1.0, 0.84, 0.42) * (majorSparkle * 0.45);
        `
      );
    };

    const kolamMat = new THREE.MeshPhysicalMaterial({
      color: "#CD7F32",
      metalness: 0.90,
      roughness: 0.20,
      roughnessMap: textures.noiseRoughness,
      normalMap: textures.brushedNormal,
      normalScale: new THREE.Vector2(0.35, 0.35),
      clearcoat: 0.95,
      clearcoatRoughness: 0.12,
    });

    kolamMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = timeUniformRef.current.uTime;
      shader.vertexShader = `
        varying vec3 vWorldPosition;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
         vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        `
      );

      shader.fragmentShader = `
        uniform float uTime;
        varying vec3 vWorldPosition;
        ${shader.fragmentShader}
      `.replace(
        `#include <emissivemap_fragment>`,
        `#include <emissivemap_fragment>
         // Sacred golden thread traveling pulse along Brahmamudi knot
         float threadPhase = fract(vWorldPosition.z * 0.25 - uTime * 0.35);
         float threadPulse = smoothstep(0.0, 0.15, threadPhase) * smoothstep(0.3, 0.15, threadPhase);
         totalEmissiveRadiance += vec3(1.0, 0.82, 0.38) * (threadPulse * 0.45);
        `
      );
    };

    const coreMat = new THREE.MeshPhysicalMaterial({
      color: "#F2BE54",
      metalness: 0.96,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      emissive: new THREE.Color("#D4AF37"),
      emissiveIntensity: 0.55,
    });

    return { ringMat, kolamMat, coreMat };
  }, [isCinematic, textures]);

  useEffect(() => {
    if (!isCinematic) return;
    return () => {
      if (materials.ringMat !== sharedRingMat) materials.ringMat.dispose();
      if (materials.kolamMat !== sharedKolamMat) materials.kolamMat.dispose();
      if (materials.coreMat !== sharedCoreMat) materials.coreMat.dispose();
    };
  }, [isCinematic, materials]);

  return materials;
}

// Optimized abstract cinematic Bronze Rings with lightweight shared geometry
function BronzeRing({
  position,
  scale = 1,
  rotation = [0, 0, 0] as [number, number, number],
  scrollProgressRef,
  ringMat = sharedRingMat,
  kolamMat = sharedKolamMat,
  coreMat = sharedCoreMat,
  isCinematic = false,
  tier = "A",
}: {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  scrollProgressRef: React.RefObject<number>;
  ringMat?: THREE.Material;
  kolamMat?: THREE.Material;
  coreMat?: THREE.Material;
  isCinematic?: boolean;
  tier?: "A" | "B" | "C";
}) {
  const meshRef = useRef<THREE.Group>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (meshRef.current) {
      const p = scrollProgressRef.current;
      // 5-stage gyroscopic detent curve: accelerates between chapters and settles into alignment
      const chapterPhase = p * 5.0;
      const detentOffset = (Math.sin(chapterPhase * Math.PI * 2.0) / (Math.PI * 10.0)) * 0.55;
      const detentP = p - detentOffset;

      // Mandala coplanar concentric alignment as p -> 1.0
      const alignment = 1 - THREE.MathUtils.smoothstep(detentP, 0.78, 0.98);
      meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, rotation[0] * alignment, 8, dt);
      meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, rotation[1] * alignment, 8, dt);
      meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, rotation[2] * alignment, 8, dt);

      // Specular pulse from core at chapter detent points
      if (coreLightRef.current) {
        const resonance = Math.pow(Math.cos(chapterPhase * Math.PI), 8.0);
        coreLightRef.current.intensity = 6 + resonance * 8;
      }
    }
  });

  return (
    <group position={position} rotation={rotation} ref={meshRef} dispose={null}>
      {/* Outer Thiruvachi Torus with shared geometry and uniform scale */}
      <mesh
        geometry={sharedTorusGeo}
        material={ringMat}
        scale={[scale, scale, scale]}
        castShadow={isCinematic && tier === "A"}
        receiveShadow={isCinematic && tier === "A"}
      />
      {/* Inner Concentric Halo */}
      <mesh
        geometry={sharedInnerRingGeo}
        material={ringMat}
        scale={[scale, scale, scale]}
        castShadow={isCinematic && tier === "A"}
        receiveShadow={isCinematic && tier === "A"}
      />
      {/* Central Sacred Pulli Dot (Radiant Core) */}
      <mesh
        geometry={sharedCenterDotGeo}
        material={coreMat}
        scale={[scale, scale, scale]}
      />
      <pointLight ref={coreLightRef} color="#FFB366" intensity={6} distance={4} decay={2} />
      {/* Flowing 8-Petal Sikku Kolam 3D Knot with silky-smooth bends */}
      <mesh
        geometry={sharedKolamGeo}
        material={kolamMat}
        scale={[scale, scale, scale]}
        castShadow={isCinematic && tier === "A"}
        receiveShadow={isCinematic && tier === "A"}
      />
    </group>
  );
}

// Seamless Floating Titles for Each Passing Bronze Kolam Ring
function RingModalCard({
  tier,
  index,
  totalTiers: _totalTiers,
  scrollProgressRef,
  locale,
}: {
  tier: TierItem;
  index: number;
  totalTiers?: number;
  scrollProgressRef: React.RefObject<number>;
  locale: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => registerSystem({
    order: 51,
    step: () => {
      const element = cardRef.current;
      if (!element) return;
      const range = STAGE_RANGES[index];
      if (!range) {
        element.style.opacity = "0";
        element.style.visibility = "hidden";
        return;
      }
      const p = scrollProgressRef.current;
      if (p < range.start || p > range.end) {
        element.style.opacity = "0";
        element.style.visibility = "hidden";
        element.style.transform = p < range.start ? "translateY(20px)" : "translateY(-20px)";
        return;
      }

      // Smooth enter, hold plateau, and exit interpolation
      const isFirst = index === 0;
      const enterDur = isFirst ? 0 : 0.025;
      const exitDur = 0.025;
      let opacity = 1;
      let yOffset = 0;

      if (!isFirst && p < range.start + enterDur) {
        const norm = (p - range.start) / enterDur;
        opacity = Math.max(0, Math.min(1, norm));
        yOffset = 18 * (1 - norm);
      } else if (p > range.end - exitDur) {
        const norm = (range.end - p) / exitDur;
        opacity = Math.max(0, Math.min(1, norm));
        yOffset = -18 * (1 - norm);
      }

      element.style.opacity = opacity.toFixed(3);
      element.style.visibility = opacity > 0 ? "visible" : "hidden";
      element.style.transform = `translateY(${yOffset.toFixed(1)}px)`;
    },
  }), [index, scrollProgressRef]);

  const Heading = index === 0 ? "h1" : "h2";

  return (
    <div
      ref={cardRef}
      className="absolute inset-y-0 left-0 z-20 flex w-full flex-col justify-center px-6 sm:px-12 lg:px-20 lg:w-7/12 xl:w-6/12 pointer-events-none transition-transform duration-75"
      style={{
        opacity: index === 0 ? 1 : 0,
        visibility: index === 0 ? "visible" : "hidden",
        transform: "translateY(0px)",
      }}
    >
      {/* Floating Organic Titles: Seamlessly Integrated into the 3D Scene */}
      <div className="max-w-xl text-left select-none space-y-3 pointer-events-auto">
        {/* Understated Category Subtitle */}
        <span className="font-mono text-xs uppercase tracking-widest text-[#D4AF37]/75 block drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
          {locale === "ta" ? tier.subtitleTa : tier.subtitleEn}
        </span>

        {/* Primary Title */}
        <Heading
          lang={locale === "ta" ? "ta" : "en"}
          className={`text-3xl sm:text-4xl lg:text-5xl text-[#FAF7F2] font-normal leading-[1.12] tracking-tight drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)] ${
            locale === "ta" ? "font-tamil leading-relaxed" : "font-serif"
          }`}
        >
          {locale === "ta" ? tier.titleTa : tier.titleEn}
        </Heading>

        {/* Tamil Calligraphic Inscription */}
        {locale !== "ta" && (
          <p
            lang="ta"
            style={{ letterSpacing: 0 }}
            className="text-lg sm:text-2xl font-medium text-[#E5A93C] font-tamil leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
          >
            {tier.titleTa}
          </p>
        )}

        {/* Narrative Description */}
        <p
          lang={locale === "ta" ? "ta" : "en"}
          className={`text-sm sm:text-base text-[#FAF7F2]/80 leading-relaxed font-sans max-w-lg pt-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] ${
            locale === "ta" ? "font-tamil" : ""
          }`}
        >
          {locale === "ta" ? tier.descTa : tier.descEn}
        </p>
      </div>
    </div>
  );
}

// Baseline Camera Controller with gyroscopic chapter detents and mandala portal push
function AscendingGopuramCamera({
  scrollProgressRef,
  isMobile,
}: {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
}) {
  const kineticsRef = useRef(createHeroKineticsTracker(7.5, 5.0, 4.0));

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const camera = state.camera;
    const rawP = scrollProgressRef.current;
    const kinetics = kineticsRef.current.update(rawP, state.pointer, dt);
    const p = kinetics.smoothProgress;

    // Gyroscopic Chapter Detents: locks into alignment at chapter holds across all 5 tiers
    const chapterPhase = p * 5.0;
    const detentOffset = (Math.sin(chapterPhase * Math.PI * 2.0) / (Math.PI * 10.0)) * 0.55;
    const detentP = p - detentOffset;

    // 5 rings spaced 20 units apart (0, -20, -40, -60, -80). Z travels from 12 to -88.
    const startZ = 12;
    const endZ = -88;
    const targetZ = THREE.MathUtils.lerp(startZ, endZ, detentP);

    // Mandala Alignment & Camera Push Exit (p = 0.80 -> 1.00)
    const exitT = Math.max(0, Math.min(1, (p - 0.80) / 0.20));
    const exitPush = exitT * exitT * 8.0;

    // Pointer parallax
    const px = isMobile ? 0 : kinetics.smoothPointerX * 0.45;
    const py = -kinetics.smoothPointerY * 0.28;

    const targetX = (isMobile ? 0 : -2) * (1 - exitT) + px;
    const targetY = py;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 16.0, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 16.0, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ - exitPush, 16.0, dt);

    // Natural subtle breeze sway + velocity banking
    const swayTime = camera.position.z * 0.08;
    camera.position.x += Math.sin(swayTime) * 0.03 * dt;
    camera.position.y += Math.cos(swayTime * 1.4) * 0.03 * dt;
    camera.rotation.z = THREE.MathUtils.damp(camera.rotation.z, kinetics.velocityBank * 0.5, 8.0, dt);

    camera.lookAt(targetX * 0.5, targetY * 0.5, targetZ - exitPush - 10);
  });

  return null;
}

// Elevated Cinematic Camera with dual-channel exponential damping, smootherstep detents & leading carriage
function CinematicGopuramCamera({
  scrollProgressRef,
  isMobile,
  isReducedMotion,
  isLiteMode,
}: {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
  isReducedMotion: boolean;
  isLiteMode: boolean;
}) {
  const damperRef = useRef(
    createCinemaCameraDamper({
      lambdaPos: 6.2,
      lambdaLook: 10.5,
      breathingAmplitude: 0.003,
      breathingRoll: 0.0015,
      enableBreathing: !isReducedMotion && !isLiteMode,
    })
  );
  const kineticsRef = useRef(createHeroKineticsTracker(7.5, 5.0, 4.0));
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const camera = state.camera;
    const rawP = scrollProgressRef.current;
    const kinetics = kineticsRef.current.update(rawP, state.pointer, dt);
    const p = kinetics.smoothProgress;

    // Gyroscopic Chapter Detents: locks into alignment at chapter holds across all 5 tiers
    const chapterPhase = p * 5.0;
    const detentOffset = (Math.sin(chapterPhase * Math.PI * 2.0) / (Math.PI * 10.0)) * 0.55;
    const detentP = THREE.MathUtils.clamp(p - detentOffset, 0, 1);

    // 5 rings spaced 20 units apart (0, -20, -40, -60, -80). Z travels from 12 to -88.
    const startZ = 12;
    const endZ = -88;
    const targetZ = THREE.MathUtils.lerp(startZ, endZ, detentP);

    // Mandala Alignment & Camera Push Exit (p = 0.80 -> 1.00)
    const exitT = Math.max(0, Math.min(1, (p - 0.80) / 0.20));
    const exitPush = smootherstep(exitT) * 8.0;

    // Pointer parallax
    const px = isMobile ? 0 : kinetics.smoothPointerX * 0.45;
    const py = -kinetics.smoothPointerY * 0.28;

    const targetX = (isMobile ? 0 : -2) * (1 - exitT) + px;
    const targetY = py + (1 - exitT) * 0.15; // subtle majesty elevation

    targetPos.current.set(targetX, targetY, targetZ - exitPush);
    // Look-at leading carriage: leads along -Z by 14 units with slight upward gaze (+0.35m)
    targetLookAt.current.set(targetX * 0.45, targetY * 0.45 + 0.35, targetZ - exitPush - 14.0);

    const rollBank = !isReducedMotion && !isLiteMode ? kinetics.velocityBank * 0.35 : 0;

    const result = damperRef.current.update(
      targetPos.current,
      targetLookAt.current,
      p,
      dt,
      {
        isReducedMotion,
        isLiteMode,
        additionalRoll: rollBank,
      }
    );

    camera.position.copy(result.position);
    camera.lookAt(result.lookAt);
    if (!isReducedMotion && !isLiteMode) {
      camera.rotation.z += result.roll;
    }
  });

  return null;
}

// Micro-Detail 3: Floating Golden Temple Sanctum Dust Motes along the Z-corridor
function TempleSanctumMotes({ count = 64 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [geo, mat] = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    let seed = 424242;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (rand() - 0.5) * 16;
      positions[i * 3 + 1] = (rand() - 0.5) * 14;
      positions[i * 3 + 2] = 15 - rand() * 110;
      speeds[i] = 0.2 + rand() * 0.4;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color("#FFD27D"),
      size: 0.18,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return [geometry, material];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const dt = Math.min(delta, 0.05);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const array = pos.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      array[idx + 1] += Math.sin(time * 0.5 + i) * 0.08 * dt;
      array[idx + 0] += Math.cos(time * 0.4 + i) * 0.06 * dt;
    }
    pos.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}

function GopuramWarmup() {
  useWarmup("about-gopuram");
  return null;
}

function CursorLight() {
  const light = useRef<THREE.PointLight>(null);
  const finePointer = useSyncExternalStore(
    callback => {
      const query = window.matchMedia("(hover: hover) and (pointer: fine)");
      query.addEventListener("change", callback);
      return () => query.removeEventListener("change", callback);
    },
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    () => false,
  );
  useFrame(({ camera, pointer }, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!light.current) return;
    light.current.position.x = THREE.MathUtils.damp(light.current.position.x, camera.position.x + pointer.x * 7, 8, dt);
    light.current.position.y = THREE.MathUtils.damp(light.current.position.y, pointer.y * 5, 8, dt);
    light.current.position.z = camera.position.z - 4;
  });
  return finePointer ? <pointLight ref={light} color={CURSOR_LIGHT_COLOR} intensity={30} distance={22} decay={2} /> : null;
}

const emptySubscribe = () => () => {};

export function GopuramZScroll() {
  const { locale } = useLocale();
  const { isLiteMode } = useLiteMode();
  const tier = useTier();
  const reducedMotion = useReducedMotion();
  const isStatic = isLiteMode || tier === "C" || !!reducedMotion;
  const scrollProgressRef = useRef(0);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isMobile = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => window.innerWidth < 1024,
    () => false
  );

  return (
    <HeroScrollStage
      id="gopuram-hero-wrapper"
      runway={360}
      progressRef={scrollProgressRef}
      static={isStatic}
      className="text-sangam-cream"
    >
      {mounted && !isStatic ? (
        <GopuramScene
          scrollProgressRef={scrollProgressRef}
          isMobile={isMobile}
          locale={locale}
          tier={tier}
          isReducedMotion={!!reducedMotion}
          isLiteMode={isLiteMode}
        />
      ) : (
        <div className="relative z-10 flex min-h-dvh flex-col justify-center gap-8 px-6 py-32 sm:px-16 max-w-4xl">
          {TIERS.map((tierItem, idx) => (
            <div key={tierItem.id} className="space-y-2 border-b border-paper/10 pb-6 last:border-b-0">
              <span className="font-mono text-xs uppercase tracking-widest text-antique-gold block">
                {`// CHAPTER 0${idx + 1} · ${locale === "ta" ? tierItem.subtitleTa : tierItem.subtitleEn}`}
              </span>
              <h2 lang={locale === "ta" ? "ta" : "en"} className={`text-2xl sm:text-4xl text-paper ${locale === "ta" ? "font-tamil leading-relaxed" : "font-display"}`}>
                {locale === "ta" ? tierItem.titleTa : tierItem.titleEn}
              </h2>
              <p lang="ta" className="font-tamil text-lg leading-relaxed text-turmeric-gold">{tierItem.titleTa}</p>
              <p lang={locale === "ta" ? "ta" : "en"} className="text-base text-paper/80 leading-relaxed">{locale === "ta" ? tierItem.descTa : tierItem.descEn}</p>
            </div>
          ))}
        </div>
      )}
    </HeroScrollStage>
  );
}

function GopuramCanvasContent({
  scrollProgressRef,
  isMobile,
  tier,
  isReducedMotion,
  isLiteMode,
  isCinematic,
}: {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
  tier: "A" | "B" | "C";
  isReducedMotion: boolean;
  isLiteMode: boolean;
  isCinematic: boolean;
}) {
  const materials = useCinematicBronzeMaterials(isCinematic);

  return (
    <>
      <SceneRegistrar />
      <GopuramWarmup />
      <color attach="background" args={["#14110F"]} />
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} near={0.05} far={150} />
      <fog attach="fog" args={["#14110F", 10, 95]} />

      <SangamStudioEnvironment />

      {isCinematic ? (
        <>
          {/* Sunset Grazing Directional Key with Soft PCF Shadows */}
          <directionalLight
            position={[12, 18, 14]}
            intensity={2.6}
            color="#FFAE42"
            castShadow={tier === "A"}
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
            shadow-camera-near={0.5}
            shadow-camera-far={120}
            shadow-camera-left={-12}
            shadow-camera-right={12}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
          />
          {/* Deep Cool Twilight Sky Fill */}
          <directionalLight position={[-14, 8, -12]} intensity={1.1} color="#4A6572" />
          {/* Warm Under-Mandapa Bounce Fill */}
          <directionalLight position={[0, -12, 0]} intensity={0.65} color="#D47B37" />
          {/* Sanctum Accent Rim Light */}
          <pointLight position={[0, 0, -50]} intensity={12} distance={80} decay={2} color="#E5A93C" />
        </>
      ) : (
        <>
          <directionalLight position={[10, 20, 10]} intensity={2.2} color="#FFF8EB" />
          <ambientLight intensity={1.2} color="#3A2618" />
          <directionalLight position={[-10, 5, -10]} intensity={0.8} color="#D4AF37" />
        </>
      )}

      <CursorLight />

      {/* Detail 3: Drifting Temple Sanctum Motes */}
      {isCinematic && !isReducedMotion && !isLiteMode && tier === "A" && (
        <TempleSanctumMotes count={64} />
      )}

      {/* Z-Axis Rings mapping: Aligned along flythrough path */}
      {TIERS.map((tierItem, idx) => (
        <BronzeRing
          key={tierItem.id}
          position={[isMobile ? 0 : 2.4, 0, -idx * 20]}
          scale={1 + idx * 0.08}
          rotation={[0.2, -0.25, (idx * Math.PI) / 4]}
          scrollProgressRef={scrollProgressRef}
          ringMat={materials.ringMat}
          kolamMat={materials.kolamMat}
          coreMat={materials.coreMat}
          isCinematic={isCinematic}
          tier={tier}
        />
      ))}

      {isCinematic ? (
        <CinematicGopuramCamera
          scrollProgressRef={scrollProgressRef}
          isMobile={isMobile}
          isReducedMotion={isReducedMotion}
          isLiteMode={isLiteMode}
        />
      ) : (
        <AscendingGopuramCamera scrollProgressRef={scrollProgressRef} isMobile={isMobile} />
      )}

      {/* Color Grading Pipeline */}
      {isCinematic && <GradeStack tier={tier} profile="chola-gopuram" />}
    </>
  );
}

function GopuramScene({
  scrollProgressRef,
  isMobile,
  locale,
  tier,
  isReducedMotion,
  isLiteMode,
}: {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
  locale: string;
  tier: "A" | "B" | "C";
  isReducedMotion: boolean;
  isLiteMode: boolean;
}) {
  const visible = useHeroStageVisibility();
  const isCinematic = isHeroCinematicEnabled("about");

  return (
    <>
      <View className="absolute inset-0 w-full h-full pointer-events-none" index={2} visible={visible}>
        <GopuramCanvasContent
          scrollProgressRef={scrollProgressRef}
          isMobile={isMobile}
          tier={tier}
          isReducedMotion={isReducedMotion}
          isLiteMode={isLiteMode}
          isCinematic={isCinematic}
        />
      </View>

      {/* 5 Sacred Ring Floating Titles */}
      {TIERS.map((tierItem, index) => (
        <RingModalCard
          key={tierItem.id}
          tier={tierItem}
          index={index}
          totalTiers={TIERS.length}
          scrollProgressRef={scrollProgressRef}
          locale={locale}
        />
      ))}
    </>
  );
}
