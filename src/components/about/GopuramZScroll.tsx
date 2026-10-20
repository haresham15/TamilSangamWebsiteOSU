"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
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

// Optimized abstract cinematic Bronze Rings with lightweight shared geometry
function BronzeRing({
  position,
  scale = 1,
  rotation = [0, 0, 0] as [number, number, number],
  scrollProgressRef,
}: {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  scrollProgressRef: React.RefObject<number>;
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
        material={sharedRingMat}
        scale={[scale, scale, scale]}
      />
      {/* Inner Concentric Halo */}
      <mesh
        geometry={sharedInnerRingGeo}
        material={sharedRingMat}
        scale={[scale, scale, scale]}
      />
      {/* Central Sacred Pulli Dot (Radiant Core) */}
      <mesh
        geometry={sharedCenterDotGeo}
        material={sharedCoreMat}
        scale={[scale, scale, scale]}
      />
      <pointLight ref={coreLightRef} color="#FFB366" intensity={6} distance={4} decay={2} />
      {/* Flowing 8-Petal Sikku Kolam 3D Knot with silky-smooth bends */}
      <mesh
        geometry={sharedKolamGeo}
        material={sharedKolamMat}
        scale={[scale, scale, scale]}
      />
    </group>
  );
}

// Floating Glassmorphic Text Modals for Each Passing Bronze Ring
function RingModalCard({
  tier,
  index,
  totalTiers,
  scrollProgressRef,
  locale,
}: {
  tier: TierItem;
  index: number;
  totalTiers: number;
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
        element.style.transform = p < range.start ? "translateY(28px) scale(0.96)" : "translateY(-28px) scale(0.96)";
        return;
      }

      // Smooth enter, hold plateau, and exit interpolation
      const isFirst = index === 0;
      const enterDur = isFirst ? 0 : 0.025;
      const exitDur = 0.025;
      let opacity = 1;
      let yOffset = 0;
      let scale = 1.0;

      if (!isFirst && p < range.start + enterDur) {
        const norm = (p - range.start) / enterDur;
        opacity = Math.max(0, Math.min(1, norm));
        yOffset = 24 * (1 - norm);
        scale = 0.96 + 0.04 * norm;
      } else if (p > range.end - exitDur) {
        const norm = (range.end - p) / exitDur;
        opacity = Math.max(0, Math.min(1, norm));
        yOffset = -24 * (1 - norm);
        scale = 0.96 + 0.04 * norm;
      }

      element.style.opacity = opacity.toFixed(3);
      element.style.visibility = opacity > 0 ? "visible" : "hidden";
      element.style.transform = `translateY(${yOffset.toFixed(1)}px) scale(${scale.toFixed(3)})`;
    },
  }), [index, scrollProgressRef]);

  const Heading = index === 0 ? "h1" : "h2";

  return (
    <div
      ref={cardRef}
      className="absolute inset-y-0 left-0 z-20 flex w-full flex-col justify-center px-4 sm:px-8 lg:px-14 lg:w-6/12 xl:w-5/12 pointer-events-none transition-transform duration-75"
      style={{
        opacity: index === 0 ? 1 : 0,
        visibility: index === 0 ? "visible" : "hidden",
        transform: "translateY(0px) scale(1)",
      }}
    >
      {/* Floating Glassmorphic Editorial Modal Card Box */}
      <div className="relative p-6 sm:p-8 bg-[#14100E]/90 backdrop-blur-xl border border-[#D4AF37]/35 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85)] overflow-hidden pointer-events-auto">
        {/* Top ambient gold accent glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent" />

        {/* Top Badges: Chapter Indicator + Ring Progress Meter */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#E5A93C] text-[11px] font-mono font-bold uppercase tracking-widest rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] animate-pulse" />
            <span>{`// CHAPTER 0${index + 1}`}</span>
            <span aria-hidden="true" className="opacity-50">·</span>
            <span>{locale === "ta" ? tier.subtitleTa : tier.subtitleEn}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37]/90 font-medium">
            <span>Ring {index + 1} of {totalTiers}</span>
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden border border-[#D4AF37]/20">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] rounded-full transition-all duration-300"
                style={{ width: `${((index + 1) / totalTiers) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Primary Chapter Title */}
        <Heading
          lang={locale === "ta" ? "ta" : "en"}
          className={`text-2xl sm:text-3xl lg:text-4xl text-[#FAF9F6] font-extrabold mb-2 leading-[1.15] tracking-tight ${
            locale === "ta" ? "font-tamil leading-relaxed" : "font-serif"
          }`}
        >
          {locale === "ta" ? tier.titleTa : tier.titleEn}
        </Heading>

        {/* Tamil Calligraphic Inscription */}
        <p
          lang="ta"
          style={{ letterSpacing: 0 }}
          className="text-base sm:text-xl font-bold text-[#E5A93C] font-tamil mb-3 leading-relaxed"
        >
          {tier.titleTa}
        </p>

        {/* Classical Verse Citation (Purananuru / Thirukkural) */}
        {tier.kuralQuote && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2A1808]/90 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-semibold tracking-wider rounded-md mb-4">
            <span className="opacity-75">📜</span>
            <span>{tier.kuralQuote}</span>
          </div>
        )}

        {/* Narrative Description For Each Ring */}
        <p
          lang={locale === "ta" ? "ta" : "en"}
          className={`text-sm sm:text-base text-[#FAF9F6]/90 leading-relaxed font-normal ${
            locale === "ta" ? "font-tamil tracking-normal" : "font-body"
          }`}
        >
          {locale === "ta" ? tier.descTa : tier.descEn}
        </p>
      </div>
    </div>
  );
}

// Cinematic Camera Controller with gyroscopic chapter detents and mandala portal push
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
        <GopuramScene scrollProgressRef={scrollProgressRef} isMobile={isMobile} locale={locale} />
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

function GopuramScene({ scrollProgressRef, isMobile, locale }: {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
  locale: string;
}) {
  const visible = useHeroStageVisibility();
  return (
    <>
      <View className="absolute inset-0 w-full h-full pointer-events-none" index={2} visible={visible}>
        <SceneRegistrar />
        <GopuramWarmup />
        <color attach="background" args={["#14110F"]} />
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} near={0.05} far={150} />
        <fog attach="fog" args={["#14110F", 10, 95]} />

        <SangamStudioEnvironment />
        <directionalLight position={[10, 20, 10]} intensity={2.2} color="#FFF8EB" />
        <ambientLight intensity={1.2} color="#3A2618" />
        <directionalLight position={[-10, 5, -10]} intensity={0.8} color="#D4AF37" />
        <CursorLight />

        {/* Z-Axis Rings mapping: Aligned along flythrough path to eliminate offset ghost rings */}
        {TIERS.map((tier, idx) => (
          <BronzeRing
            key={tier.id}
            position={[isMobile ? 0 : 2.4, 0, -idx * 20]}
            scale={1 + idx * 0.08}
            rotation={[0.2, -0.25, (idx * Math.PI) / 4]}
            scrollProgressRef={scrollProgressRef}
          />
        ))}

        <AscendingGopuramCamera scrollProgressRef={scrollProgressRef} isMobile={isMobile} />
      </View>

      {/* Top Heritage Badge */}
      <div className="absolute top-24 left-4 sm:left-8 lg:left-14 z-20 pointer-events-none hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-[#14100E]/85 backdrop-blur-md border border-[#D4AF37]/30 text-[#E5A93C] text-[10px] font-mono uppercase tracking-widest rounded-full shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] animate-pulse" />
        <span>Our Ethos & Heritage · பண்பாட்டு நோக்கு</span>
      </div>

      {/* 5 Sacred Ring Floating Text Modals */}
      {TIERS.map((tier, index) => (
        <RingModalCard
          key={tier.id}
          tier={tier}
          index={index}
          totalTiers={TIERS.length}
          scrollProgressRef={scrollProgressRef}
          locale={locale}
        />
      ))}

      {/* Bottom Flythrough Guidance Indicator */}
      <div className="absolute bottom-6 left-4 sm:left-8 lg:left-14 right-4 sm:right-8 lg:right-14 z-20 pointer-events-none flex items-center justify-between text-[11px] font-mono text-[#D4AF37]/80 uppercase tracking-widest border-t border-[#D4AF37]/20 pt-3">
        <span className="hidden sm:inline">The Ohio State University Tamil Sangam</span>
        <div className="flex items-center gap-2">
          <span>Scroll to Fly Through Sacred Rings</span>
          <span className="w-1.5 h-1.5 bg-[#E5A93C] rounded-full animate-bounce" />
        </div>
      </div>
    </>
  );
}
