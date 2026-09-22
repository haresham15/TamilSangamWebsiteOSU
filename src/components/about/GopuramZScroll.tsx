"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "@/context/LocaleContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { Sparkles, Eye, Compass, Flame } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

// Client-only R3F dynamic import
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

interface TierItem {
  id: string;
  zPos: number;
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
    zPos: 0,
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
    zPos: -15,
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
    zPos: -30,
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
    zPos: -45,
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
    zPos: -60,
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

// Architectural materials for Dravidian Temple PBR Rendering
function useTempleMaterials() {
  return useMemo(() => {
    // Dark weathered Dravidian temple granite (கருங்கல்)
    const granite = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1e1424"),
      roughness: 0.88,
      metalness: 0.18,
    });

    // Antique cast bronze (வெண்கலம்)
    const bronze = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#6e3c1a"),
      roughness: 0.32,
      metalness: 0.85,
    });

    // Weathered sacred copper (செப்பு)
    const copper = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#9b5123"),
      roughness: 0.28,
      metalness: 0.88,
    });

    // Gleaming polished gold leaf for Kalasams & Kudu crests (தங்கக் கலசம்)
    const goldLeaf = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#FFC526"),
      roughness: 0.18,
      metalness: 0.95,
      emissive: new THREE.Color("#553300"),
      emissiveIntensity: 0.2,
    });

    // Warm luminous diya oil flame
    const diyaGlow = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ffaa33"),
    });

    return { granite, bronze, copper, goldLeaf, diyaGlow };
  }, []);
}

// Single Dravidian Tala (Architectural Story / Tier)
function DravidianTala({
  tierIndex,
  zPos,
  width,
  height,
  thickness,
  isMobile,
  materials,
}: {
  tierIndex: number;
  zPos: number;
  width: number;
  height: number;
  thickness: number;
  isMobile: boolean;
  materials: ReturnType<typeof useTempleMaterials>;
}) {
  const diyaLightRef = useRef<THREE.PointLight>(null);

  // Gentle procedural flame flicker
  useFrame(({ clock }) => {
    if (diyaLightRef.current) {
      const t = clock.getElapsedTime() * 6.0 + tierIndex * 1.5;
      diyaLightRef.current.intensity = 1.6 + 0.35 * Math.sin(t) + 0.2 * Math.cos(t * 2.3);
    }
  });

  const halfW = width / 2;
  const halfH = height / 2;
  const colThickness = thickness * 1.1;

  return (
    <group position={[0, 0, zPos]}>
      {/* 1. ADHISTHANA (Plinth / Molded Base Beam) */}
      <mesh position={[0, -halfH, 0]} material={materials.granite}>
        <boxGeometry args={[width + thickness * 2.4, thickness * 1.4, thickness * 2.8]} />
      </mesh>
      {/* Stepped Base Cornice Molding */}
      <mesh position={[0, -halfH + thickness * 0.9, 0]} material={materials.copper}>
        <boxGeometry args={[width + thickness * 1.8, thickness * 0.5, thickness * 3.2]} />
      </mesh>

      {/* 2. PRASTARA & KAPOTA (Overhanging Curved Eave Cornice at Top) */}
      <mesh position={[0, halfH, 0]} material={materials.bronze}>
        <boxGeometry args={[width + thickness * 3.2, thickness * 1.2, thickness * 3.4]} />
      </mesh>
      {/* Projecting Drip Eave (Kapota overhang) */}
      <mesh position={[0, halfH - thickness * 0.7, 0]} material={materials.copper}>
        <boxGeometry args={[width + thickness * 2.6, thickness * 0.4, thickness * 3.8]} />
      </mesh>

      {/* 3. STAMBHAS (Pilasters / Fluted Gateway Columns) */}
      {/* Outer Left Pillar */}
      <mesh position={[-halfW, 0, 0]} material={materials.granite}>
        <boxGeometry args={[colThickness, height, thickness * 2.2]} />
      </mesh>
      {/* Outer Right Pillar */}
      <mesh position={[halfW, 0, 0]} material={materials.granite}>
        <boxGeometry args={[colThickness, height, thickness * 2.2]} />
      </mesh>

      {/* Inner Portal Pilasters with Bodikai Corbel Capitals */}
      {!isMobile && (
        <>
          {/* Inner Left Pilaster */}
          <mesh position={[-halfW * 0.5, 0, 0]} material={materials.bronze}>
            <boxGeometry args={[colThickness * 0.7, height, thickness * 1.8]} />
          </mesh>
          {/* Inner Right Pilaster */}
          <mesh position={[halfW * 0.5, 0, 0]} material={materials.bronze}>
            <boxGeometry args={[colThickness * 0.7, height, thickness * 1.8]} />
          </mesh>

          {/* Bodikai Capital Brackets (Cantilever lotus corbels supporting eave) */}
          <mesh position={[-halfW, halfH - thickness * 0.8, thickness * 0.9]} material={materials.copper}>
            <boxGeometry args={[colThickness * 1.4, thickness * 0.8, thickness * 1.2]} />
          </mesh>
          <mesh position={[halfW, halfH - thickness * 0.8, thickness * 0.9]} material={materials.copper}>
            <boxGeometry args={[colThickness * 1.4, thickness * 0.8, thickness * 1.2]} />
          </mesh>
        </>
      )}

      {/* 4. KUDU / NASIKA (Horseshoe Chaitya Dormer Arches along Cornice) */}
      {!isMobile && (
        <group position={[0, halfH + thickness * 0.8, thickness * 1.1]}>
          {[-halfW * 0.65, -halfW * 0.22, halfW * 0.22, halfW * 0.65].map((kX, kIdx) => (
            <group key={kIdx} position={[kX, 0, 0]}>
              {/* Horseshoe Arch Frame */}
              <mesh material={materials.copper}>
                <cylinderGeometry args={[0.32, 0.32, 0.22, 16, 1, false, 0, Math.PI]} />
              </mesh>
              {/* Gold Finial Crest on Arch */}
              <mesh position={[0, 0.42, 0]} material={materials.goldLeaf}>
                <coneGeometry args={[0.12, 0.35, 12]} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* 5. KUTA (Corner Miniature Shrines on Eave) */}
      <group position={[-halfW - thickness * 0.8, halfH + thickness * 0.9, 0]}>
        <mesh material={materials.granite}>
          <boxGeometry args={[thickness * 1.6, thickness * 1.6, thickness * 1.6]} />
        </mesh>
        <mesh position={[0, thickness * 1.2, 0]} material={materials.goldLeaf}>
          <coneGeometry args={[thickness * 0.8, thickness * 1.2, 8]} />
        </mesh>
      </group>
      <group position={[halfW + thickness * 0.8, halfH + thickness * 0.9, 0]}>
        <mesh material={materials.granite}>
          <boxGeometry args={[thickness * 1.6, thickness * 1.6, thickness * 1.6]} />
        </mesh>
        <mesh position={[0, thickness * 1.2, 0]} material={materials.goldLeaf}>
          <coneGeometry args={[thickness * 0.8, thickness * 1.2, 8]} />
        </mesh>
      </group>

      {/* 6. TEMPLE DIYA TORCH & FLICKERING LIGHT */}
      <group position={[-halfW - 0.4, 0, thickness + 0.3]}>
        {/* Diya Bowl */}
        <mesh material={materials.bronze}>
          <cylinderGeometry args={[0.22, 0.12, 0.18, 12]} />
        </mesh>
        {/* Flame Glow Mesh */}
        <mesh position={[0, 0.14, 0]} material={materials.diyaGlow}>
          <sphereGeometry args={[0.08, 10, 10]} />
        </mesh>
        {/* Flickering Light source */}
        <pointLight
          ref={diyaLightRef}
          color="#FF9933"
          intensity={1.8}
          distance={14}
          decay={2}
          position={[0, 0.2, 0]}
        />
      </group>
    </group>
  );
}

// Topmost Pinnacle Tala: Barrel-Vaulted Shikhara with 5 Brass Kalasam Spire Urns
function ShikharaApex({
  zPos,
  width,
  height,
  materials,
}: {
  zPos: number;
  width: number;
  height: number;
  materials: ReturnType<typeof useTempleMaterials>;
}) {
  const kalasamPositions = useMemo(() => {
    const count = 5;
    const spacing = (width * 0.8) / (count - 1);
    const startX = -((width * 0.8) / 2);
    return Array.from({ length: count }, (_, i) => startX + i * spacing);
  }, [width]);

  return (
    <group position={[0, 0, zPos]}>
      {/* Barrel-Vaulted Sala Shikhara Roof Ridge */}
      <mesh position={[0, height / 2 + 0.6, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.bronze}>
        <cylinderGeometry args={[1.1, 1.1, width * 0.95, 24, 1, false, 0, Math.PI]} />
      </mesh>

      {/* Gilded Ridge Bar */}
      <mesh position={[0, height / 2 + 1.72, 0]} material={materials.copper}>
        <boxGeometry args={[width * 0.9, 0.22, 0.6]} />
      </mesh>

      {/* Five Sacred Golden Kalasams (தங்கக் கலசங்கள்) */}
      {kalasamPositions.map((kX, idx) => (
        <group key={idx} position={[kX, height / 2 + 1.85, 0]}>
          {/* Kalasa Peetam (Lotus base) */}
          <mesh material={materials.goldLeaf}>
            <cylinderGeometry args={[0.26, 0.32, 0.18, 16]} />
          </mesh>
          {/* Kumbha (Sacred Golden Pot / Urn) */}
          <mesh position={[0, 0.26, 0]} material={materials.goldLeaf}>
            <sphereGeometry args={[0.24, 16, 16]} />
          </mesh>
          {/* Griva (Urn Neck) */}
          <mesh position={[0, 0.48, 0]} material={materials.goldLeaf}>
            <cylinderGeometry args={[0.12, 0.16, 0.2, 14]} />
          </mesh>
          {/* Shikha (Sharp Needle Finial Spire reaching heavenward) */}
          <mesh position={[0, 0.82, 0]} material={materials.goldLeaf}>
            <coneGeometry args={[0.16, 0.65, 16]} />
          </mesh>
          {/* Pinnacle Tip Point */}
          <mesh position={[0, 1.2, 0]} material={materials.goldLeaf}>
            <sphereGeometry args={[0.04, 8, 8]} />
          </mesh>
        </group>
      ))}

      {/* Apex Celestial Spotlight */}
      <pointLight color="#FFE8A3" intensity={2.8} distance={20} position={[0, height / 2 + 3, 2]} />
    </group>
  );
}

// Complete 3D Dravidian Gopuram Fractal Hierarchy
function DravidianGopuramScene({
  isMobile,
}: {
  isMobile: boolean;
}) {
  const materials = useTempleMaterials();

  // 6 Tiered Fractal Proportions adhering to classical Dravidian Agamic proportions
  const talaConfigs = [
    { z: 0, w: 9.6, h: 7.2, t: 0.42 },   // Tier 1: Gateway Torana
    { z: -15, w: 8.2, h: 6.2, t: 0.38 }, // Tier 2
    { z: -30, w: 6.8, h: 5.2, t: 0.34 }, // Tier 3
    { z: -45, w: 5.4, h: 4.2, t: 0.30 }, // Tier 4
    { z: -60, w: 4.0, h: 3.2, t: 0.26 }, // Tier 5
    { z: -75, w: 2.8, h: 2.2, t: 0.22 }, // Tier 6: Shikhara Base
  ];

  return (
    <group>
      {talaConfigs.map((cfg, idx) => (
        <DravidianTala
          key={idx}
          tierIndex={idx}
          zPos={cfg.z}
          width={cfg.w}
          height={cfg.h}
          thickness={cfg.t}
          isMobile={isMobile}
          materials={materials}
        />
      ))}

      {/* Apex Tala Crown with 5 Brass Kalasams */}
      <ShikharaApex
        zPos={talaConfigs[5].z}
        width={talaConfigs[5].w}
        height={talaConfigs[5].h}
        materials={materials}
      />

      {/* Floating Sacred Golden Embers Field */}
      <TempleEmbers isMobile={isMobile} />
    </group>
  );
}

// Floating Sacred Golden Embers in Temple Depth
function TempleEmbers({ isMobile }: { isMobile: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = isMobile ? 220 : 650;

  const positions = useMemo(() => {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pts[i * 3] = (Math.random() - 0.5) * 18;
      pts[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pts[i * 3 + 2] = (Math.random() - 0.5) * 95 - 35;
    }
    return pts;
  }, [count]);

  // Subtle floating ember drift
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime() * 0.15;
      pointsRef.current.rotation.z = Math.sin(t) * 0.05;
      pointsRef.current.rotation.y = Math.cos(t * 0.7) * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.045 : 0.035}
        color="#FFC526"
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Active Camera Flight Rig with smooth interpolation and natural breathing sway
function CameraFlightRig({ targetZ }: { targetZ: number }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    // Smooth camera Z lerp (damped across frame delta to eliminate all frame judder)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 4.5, delta);

    // Subtle natural temple flight sway
    const currentZ = camera.position.z;
    camera.position.x = Math.sin(currentZ * 0.06) * 0.22;
    camera.position.y = Math.cos(currentZ * 0.06) * 0.14;

    // Look straight down the temple corridor towards apex
    camera.lookAt(0, 0, currentZ - 18);
  });

  return null;
}

export function GopuramZScroll() {
  const { locale } = useLocale();
  const { isLiteMode } = useLiteMode();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Map scroll progress to camera Z (-80 at 1, +10 at 0)
  const targetCameraZ = 10 - scrollProgress * 90;

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);

    if (isLiteMode) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=2400",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLiteMode]);

  // Find active tier index based on camera Z depth
  const activeTierIndex = Math.min(
    TIERS.length - 1,
    Math.max(0, Math.floor(scrollProgress * TIERS.length))
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] overflow-hidden bg-[#10071a] text-white flex flex-col justify-between select-none"
      style={{ minHeight: "100dvh" }}
    >
      {/* 1. 3D Dravidian Temple Gopuram Z-Axis Fly-Through Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
        {mounted && !isLiteMode && (
          <Canvas
            dpr={[1, 2]} // Capped DPR for mobile efficiency
            camera={{ position: [0, 0, 10], fov: 58 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
            className="w-full h-full"
          >
            {/* Atmospheric Lighting */}
            <ambientLight intensity={0.45} color="#d8c5e8" />
            <directionalLight position={[8, 14, 12]} intensity={1.4} color="#ffe5c4" />
            <directionalLight position={[-6, -4, -10]} intensity={0.6} color="#8a5da8" />

            {/* Dravidian Temple Gopuram Architecture */}
            <DravidianGopuramScene isMobile={isMobile} />

            {/* Smooth Camera Flight Controller */}
            <CameraFlightRig targetZ={targetCameraZ} />
          </Canvas>
        )}
      </div>

      {/* 2. Top Architectural Telemetry Header */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-24 sm:pt-28 flex items-center justify-between pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#250d38]/90 border border-[#b87333] text-[#FFC526] text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-[3px_3px_0px_#b87333]">
          <Sparkles className="w-3.5 h-3.5 text-[#FFC526]" />
          <span>Dravidian Gopuram Parallax · ராஜகோபுரம்</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-purple-200/80 bg-[#160a24]/80 px-3 py-1.5 border border-purple-500/30 backdrop-blur-md">
          <span className="flex items-center gap-1.5 text-[#55CCA2]">
            <Compass className="w-3.5 h-3.5" />
            <span>Tala {activeTierIndex + 1} of 5</span>
          </span>
          <div className="w-20 sm:w-28 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-[#55CCA2] to-[#FFC526] transition-all duration-300"
              style={{ width: `${(scrollProgress * 100).toFixed(0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Suspended 3D Depth-of-Field DOM Text Statements */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 sm:px-12 my-auto text-center pointer-events-auto">
        {TIERS.map((tier, idx) => {
          // Calculate distance from camera to tier
          const tierProgress = idx / (TIERS.length - 1);
          const diff = Math.abs(scrollProgress - tierProgress);
          const isCurrent = diff < 0.22;
          const blurAmount = Math.min(16, diff * 32);
          const opacity = Math.max(0, 1 - diff * 4.2);

          return (
            <div
              key={tier.id}
              className="transition-all duration-300 transform"
              style={{
                display: isCurrent ? "block" : "none",
                filter: `blur(${blurAmount}px)`,
                opacity: opacity,
              }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#b87333]/25 border border-[#b87333] text-[#FFC526] text-[11px] font-mono font-bold uppercase tracking-widest mb-4">
                <Flame className="w-3 h-3 text-[#FFC526]" />
                <span>{locale === "ta" ? tier.subtitleTa : tier.subtitleEn}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight text-white mb-3 leading-[1.08]">
                {locale === "ta" ? tier.titleTa : tier.titleEn}
              </h2>

              <p
                lang="ta"
                style={{ letterSpacing: 0 }}
                className="text-xl sm:text-3xl font-bold text-[#55CCA2] font-tamil mb-4"
              >
                {tier.titleTa}
              </p>

              {tier.kuralQuote && (
                <div className="text-xs font-mono text-[#FFC526] font-bold tracking-wider mb-4">
                  {tier.kuralQuote}
                </div>
              )}

              <p className="max-w-2xl mx-auto text-sm sm:text-lg text-purple-100/90 font-body leading-relaxed">
                {locale === "ta" ? tier.descTa : tier.descEn}
              </p>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Flight Telemetry Bar */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 pb-8 flex items-center justify-between text-[11px] font-mono text-purple-300/70 uppercase tracking-widest border-t border-purple-500/20 pt-4 pointer-events-auto">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-[#55CCA2]" />
          <span>Camera Depth Z: {targetCameraZ.toFixed(1)}m</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Scroll To Push Camera Through Gopuram Tiers</span>
          <span className="w-2 h-2 bg-[#FFC526] rounded-full animate-ping" />
        </div>
      </div>
    </div>
  );
}
