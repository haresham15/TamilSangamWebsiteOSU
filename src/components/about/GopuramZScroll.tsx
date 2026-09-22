"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "@/context/LocaleContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { Sparkles, Eye } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

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

// Bronze Tiered Gopuram Rings (Abstract Dravidian Architecture)
function GopuramRings({
  cameraZ,
  isMobile,
}: {
  cameraZ: number;
  isMobile: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Bronze & Copper Material
  const bronzeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#4a2c16"),
        metalness: 0.85,
        roughness: 0.22,
        wireframe: false,
      }),
    []
  );

  const glowEdgeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#b87333"), // Copper
        metalness: 0.9,
        roughness: 0.15,
      }),
    []
  );

  // 6 Tiered Fractal Rectangular Rings
  const ringConfigs = [
    { z: 0, w: 9.0, h: 6.8, t: 0.35 },
    { z: -15, w: 7.6, h: 5.8, t: 0.35 },
    { z: -30, w: 6.2, h: 4.8, t: 0.35 },
    { z: -45, w: 4.8, h: 3.8, t: 0.35 },
    { z: -60, w: 3.4, h: 2.8, t: 0.35 },
    { z: -75, w: 2.0, h: 1.8, t: 0.35 }, // Kalasam pinnacle
  ];

  return (
    <group ref={groupRef}>
      {ringConfigs.map((ring, idx) => (
        <group key={idx} position={[0, 0, ring.z]}>
          {/* Top Beam */}
          <mesh
            position={[0, ring.h / 2, 0]}
            material={idx % 2 === 0 ? bronzeMaterial : glowEdgeMaterial}
          >
            <boxGeometry args={[ring.w + ring.t, ring.t, ring.t * 2]} />
          </mesh>
          {/* Bottom Beam */}
          <mesh
            position={[0, -ring.h / 2, 0]}
            material={idx % 2 === 0 ? bronzeMaterial : glowEdgeMaterial}
          >
            <boxGeometry args={[ring.w + ring.t, ring.t, ring.t * 2]} />
          </mesh>
          {/* Left Pillar */}
          <mesh
            position={[-ring.w / 2, 0, 0]}
            material={idx % 2 === 0 ? glowEdgeMaterial : bronzeMaterial}
          >
            <boxGeometry args={[ring.t, ring.h, ring.t * 2]} />
          </mesh>
          {/* Right Pillar */}
          <mesh
            position={[ring.w / 2, 0, 0]}
            material={idx % 2 === 0 ? glowEdgeMaterial : bronzeMaterial}
          >
            <boxGeometry args={[ring.t, ring.h, ring.t * 2]} />
          </mesh>

          {/* Stepped Corner Ornaments (Dravidian Stepped Dentils) */}
          {!isMobile && (
            <>
              <mesh position={[-ring.w / 2, ring.h / 2, ring.t]} material={glowEdgeMaterial}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
              </mesh>
              <mesh position={[ring.w / 2, ring.h / 2, ring.t]} material={glowEdgeMaterial}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* Floating Bronze Particle Embers */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              useMemo(() => {
                const pts = [];
                for (let i = 0; i < (isMobile ? 180 : 500); i++) {
                  pts.push(
                    (Math.random() - 0.5) * 16,
                    (Math.random() - 0.5) * 12,
                    (Math.random() - 0.5) * 90 - 35
                  );
                }
                return new Float32Array(pts);
              }, [isMobile]),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 0.04 : 0.03}
          color="#FFC526"
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// Camera Flight Controller
function CameraFlightRig({ cameraZ }: { cameraZ: number }) {
  useEffect(() => {
    // Camera is driven by parent props
  }, [cameraZ]);
  return null;
}

export function GopuramZScroll() {
  const { locale } = useLocale();
  const { isLiteMode } = useLiteMode();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Map progress to camera Z (-80 at 1, +10 at 0)
  const cameraZ = 10 - scrollProgress * 90;

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
      className="relative w-full h-[100dvh] overflow-hidden bg-[#12071d] text-white flex flex-col justify-between select-none"
      style={{ minHeight: "100dvh" }}
    >
      {/* 1. 3D Gopuram Z-Axis Fly-Through Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
        {mounted && !isLiteMode && (
          <Canvas
            dpr={[1, 2]} // Capped DPR
            camera={{ position: [0, 0, cameraZ], fov: 60 }}
            gl={{ antialias: true, alpha: true }}
            className="w-full h-full"
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 15]} intensity={1.2} color="#ffe8d1" />
            <pointLight position={[0, 0, cameraZ - 5]} intensity={1.8} color="#FFC526" distance={25} />
            <GopuramRings cameraZ={cameraZ} isMobile={isMobile} />
            <CameraFlightRig cameraZ={cameraZ} />
          </Canvas>
        )}
      </div>

      {/* 2. Top Architectural Header */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-24 sm:pt-28 flex items-center justify-between pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#250d38]/90 border border-[#b87333] text-[#FFC526] text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-[3px_3px_0px_#b87333]">
          <Sparkles className="w-3.5 h-3.5 text-[#FFC526]" />
          <span>Gopuram Z-Axis Parallax</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-purple-200/70">
          <span>Tier {activeTierIndex + 1} of 5</span>
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/20">
            <div
              className="h-full bg-[#FFC526] transition-all duration-300"
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
              <div className="inline-block px-3 py-1 bg-[#b87333]/20 border border-[#b87333] text-[#FFC526] text-[11px] font-mono font-bold uppercase tracking-widest mb-4">
                {locale === "ta" ? tier.subtitleTa : tier.subtitleEn}
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

              <p className="max-w-2xl mx-auto text-sm sm:text-lg text-purple-100/85 font-body leading-relaxed">
                {locale === "ta" ? tier.descTa : tier.descEn}
              </p>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Flight Telemetry Bar */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 pb-8 flex items-center justify-between text-[11px] font-mono text-purple-300/60 uppercase tracking-widest border-t border-purple-500/20 pt-4 pointer-events-auto">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-[#55CCA2]" />
          <span>Camera Depth Z: {cameraZ.toFixed(1)}m</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Scroll To Push Camera Through Gopuram Tiers</span>
          <span className="w-1.5 h-1.5 bg-[#FFC526] rounded-full animate-ping" />
        </div>
      </div>
    </div>
  );
}
