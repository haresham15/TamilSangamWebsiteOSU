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

const sharedRingMat = new THREE.MeshPhysicalMaterial({
  color: "#D4AF37",
  metalness: 0.92,
  roughness: 0.22,
  clearcoat: 0.6,
  clearcoatRoughness: 0.2,
  emissive: new THREE.Color("#2A1808"),
  emissiveIntensity: 0.15,
});

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
  { start: 0.00, end: 0.20 },
  { start: 0.24, end: 0.44 },
  { start: 0.48, end: 0.68 },
  { start: 0.72, end: 0.86 },
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

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (meshRef.current) {
      const alignment = 1 - THREE.MathUtils.smoothstep(scrollProgressRef.current, 0.76, 0.96);
      meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, rotation[0] * alignment, 8, dt);
      meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, rotation[1] * alignment, 8, dt);
      meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, rotation[2] * alignment, 8, dt);
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
      <pointLight color="#FFB366" intensity={6} distance={4} decay={2} />
      {/* Flowing 8-Petal Sikku Kolam 3D Knot with silky-smooth bends */}
      <mesh
        geometry={sharedKolamGeo}
        material={sharedKolamMat}
        scale={[scale, scale, scale]}
      />
    </group>
  );
}

// Keep editorial copy in the stage's DOM layer, independent of the ring perspective.
function TierText({
  tier,
  index,
  scrollProgressRef,
  locale,
}: {
  tier: TierItem;
  index: number;
  scrollProgressRef: React.RefObject<number>;
  locale: string;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  useEffect(() => registerSystem({
    order: 51,
    step: () => {
      const element = textRef.current;
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
        element.style.transform = p < range.start ? "translateY(24px)" : "translateY(-24px)";
        return;
      }
      const enterDur = 0.04;
      const exitDur = 0.04;
      let opacity = 1;
      let yOffset = 0;
      if (p < range.start + enterDur) {
        const norm = (p - range.start) / enterDur;
        opacity = norm;
        yOffset = 24 * (1 - norm);
      } else if (p > range.end - exitDur) {
        const norm = (range.end - p) / exitDur;
        opacity = norm;
        yOffset = -24 * (1 - norm);
      }
      element.style.opacity = String(opacity);
      element.style.visibility = opacity > 0 ? "visible" : "hidden";
      element.style.transform = `translateY(${yOffset.toFixed(1)}px)`;
    },
  }), [index, scrollProgressRef]);
  const Heading = index === 0 ? "h1" : "h2";

  return (
      <div
        ref={textRef}
        className="absolute inset-y-0 left-0 z-10 flex w-full flex-col justify-center px-6 py-24 pointer-events-none sm:px-12 lg:w-7/12 lg:pl-[7vw] lg:pr-12 bg-[radial-gradient(ellipse_at_35%_50%,var(--color-hero-indigo)_0%,transparent_74%)] transition-transform duration-75"
        style={{ opacity: index === 0 ? 1 : 0, visibility: index === 0 ? "visible" : "hidden" }}
      >
          <Heading lang={locale === "ta" ? "ta" : "en"} className={`text-3xl sm:text-5xl xl:text-6xl text-paper mb-5 ${locale === "ta" ? "font-tamil leading-relaxed tracking-normal" : "font-display leading-[1.12] tracking-tight"}`}>
            {locale === "ta" ? tier.titleTa : tier.titleEn}
          </Heading>

          <p
            lang="ta"
            style={{ letterSpacing: 0 }}
            className="text-lg sm:text-2xl text-warm-amber font-tamil leading-relaxed mb-5"
          >
            {tier.titleTa}
          </p>

          {tier.kuralQuote && (
            <div className="text-xs font-mono text-antique-gold tracking-wider mb-5">
              {tier.kuralQuote}
            </div>
          )}

          <p lang={locale === "ta" ? "ta" : "en"} className={`max-w-xl text-base sm:text-lg text-paper/90 leading-relaxed ${locale === "ta" ? "font-tamil tracking-normal" : "font-body"}`}>
            {locale === "ta" ? tier.descTa : tier.descEn}
          </p>
      </div>
  );
}

// Cinematic Camera Controller with smooth damping
function AscendingGopuramCamera({
  scrollProgressRef,
  isMobile,
}: {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
}) {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const camera = state.camera;
    // 5 rings spaced 20 units apart. Z goes from 12 to -52.
    const startZ = 12;
    const endZ = -52;
    const targetZ = THREE.MathUtils.lerp(startZ, endZ, scrollProgressRef.current);

    const targetX = isMobile ? 0 : -2;
    const targetY = 0;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 16.0, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 16.0, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 16.0, dt);

    // Natural subtle breeze sway
    const swayTime = camera.position.z * 0.08;
    camera.position.x += Math.sin(swayTime) * 0.03 * dt;
    camera.position.y += Math.cos(swayTime * 1.4) * 0.03 * dt;

    camera.lookAt(targetX, targetY, targetZ - 10);
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
      progressRef={scrollProgressRef}
      static={isStatic}
      className="text-sangam-cream"
    >
      {mounted && !isStatic ? (
        <GopuramScene scrollProgressRef={scrollProgressRef} isMobile={isMobile} locale={locale} />
      ) : (
        <div className="relative z-10 flex min-h-dvh flex-col justify-center gap-6 px-6 py-32 sm:px-16 max-w-4xl">
          <h1 lang={locale === "ta" ? "ta" : "en"} className={`text-4xl sm:text-6xl ${locale === "ta" ? "font-tamil leading-relaxed" : "font-display"}`}>
            {locale === "ta" ? TIERS[0].titleTa : TIERS[0].titleEn}
          </h1>
          <p lang="ta" className="font-tamil text-xl leading-relaxed text-sangam-mint">{TIERS[0].titleTa}</p>
          <p lang={locale === "ta" ? "ta" : "en"} className="text-lg leading-relaxed">{locale === "ta" ? TIERS[0].descTa : TIERS[0].descEn}</p>
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
          {TIERS.map((tier, index) => <TierText key={tier.id} tier={tier} index={index} scrollProgressRef={scrollProgressRef} locale={locale} />)}
    </>
  );
}
