"use client";

import React, { useRef, useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "@/context/LocaleContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { Compass } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

// Client-only R3F dynamic import
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

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

// Optimized abstract cinematic Bronze Rings with lightweight geometry
function BronzeRing({
  position,
  scale = 1,
  rotation = [0, 0, 0] as [number, number, number],
}: {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.08 * (scale % 2 === 0 ? 1 : -1);
    }
  });

  return (
    <group position={position} rotation={rotation} ref={meshRef}>
      {/* Outer Torus with optimized radial/tubular segments */}
      <mesh>
        <torusGeometry args={[scale * 4, scale * 0.15, 20, 64]} />
        <meshStandardMaterial color="#b87333" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Inner Decorative Knot */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusKnotGeometry args={[scale * 3.5, scale * 0.05, 96, 12, 3, 8]} />
        <meshStandardMaterial color="#8b5a2b" metalness={0.85} roughness={0.15} />
      </mesh>
    </group>
  );
}

// Suspended Mission Statement Text with Distance-Culling for zero DOM thrashing
function TierText({
  tier,
  position,
  isMobile,
  locale,
}: {
  tier: TierItem;
  position: [number, number, number];
  isMobile: boolean;
  locale: string;
}) {
  const textRef = useRef<HTMLDivElement>(null);

  useFrame((state) => {
    if (!textRef.current) return;
    const dist = state.camera.position.z - position[2];

    // Distance culling: hide tiers outside active range to eliminate DOM updates
    if (dist < -6 || dist > 24) {
      if (textRef.current.style.display !== "none") {
        textRef.current.style.display = "none";
      }
      return;
    }

    if (textRef.current.style.display !== "block") {
      textRef.current.style.display = "block";
    }

    let opacity = 0;
    let scale = 0.8;

    if (dist > 0 && dist < 18) {
      // Approaching
      const factor = 1 - Math.pow(dist / 18, 2);
      opacity = factor;
      scale = 0.8 + factor * 0.2;
    } else if (dist <= 0 && dist > -5) {
      // Passed through
      const factor = Math.max(0, 1 - Math.abs(dist / 5));
      opacity = factor;
      scale = 1.0 + (1 - factor) * 0.15;
    }

    textRef.current.style.opacity = opacity.toString();
    const yOffset = dist * 0.4;
    const yCenter = isMobile ? "-28%" : "-50%";
    textRef.current.style.transform = `translate3d(0, calc(${yCenter} + ${yOffset}px), 0) scale(${scale})`;
  });

  return (
    <Html position={position} center zIndexRange={[100, 0]} transform={false}>
      <div
        ref={textRef}
        className="w-[88vw] sm:w-[85vw] max-w-2xl flex flex-col items-start pointer-events-none"
        style={{ marginLeft: isMobile ? 0 : "10vw", willChange: "transform, opacity" }}
      >
        <div className="p-4 sm:p-8 bg-[#221036]/85 backdrop-blur-md border border-purple-300/35 shadow-[4px_4px_0px_#180826] sm:shadow-[6px_6px_0px_#180826]">
          <h2 className="text-xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white mb-2 leading-[1.15] sm:leading-[1.1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            {locale === "ta" ? tier.titleTa : tier.titleEn}
          </h2>

          <p
            lang="ta"
            style={{ letterSpacing: 0 }}
            className="text-lg sm:text-2xl font-bold text-[#55CCA2] font-tamil mb-3"
          >
            {tier.titleTa}
          </p>

          {tier.kuralQuote && (
            <div className="text-xs font-mono text-[#FFC526] font-bold tracking-wider mb-3">
              {tier.kuralQuote}
            </div>
          )}

          <p className="text-sm sm:text-base text-purple-100/90 font-body leading-relaxed">
            {locale === "ta" ? tier.descTa : tier.descEn}
          </p>
        </div>
      </div>
    </Html>
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
    const { camera } = state;
    // 5 rings spaced 15 units apart. Z goes from 12 to -68.
    const startZ = 12;
    const endZ = -68;
    const targetZ = THREE.MathUtils.lerp(startZ, endZ, scrollProgressRef.current);

    const targetX = isMobile ? 0 : -2;
    const targetY = 0;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 16.0, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 16.0, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 16.0, delta);

    // Natural subtle breeze sway
    const swayTime = camera.position.z * 0.08;
    camera.position.x += Math.sin(swayTime) * 0.03;
    camera.position.y += Math.cos(swayTime * 1.4) * 0.03;

    camera.lookAt(targetX, targetY, targetZ - 10);
  });

  return null;
}

const emptySubscribe = () => () => {};

export function GopuramZScroll() {
  const { locale } = useLocale();
  const { isLiteMode } = useLiteMode();

  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const [activeTierIndex, setActiveTierIndex] = useState(0);
  const [isSectionVisible, setIsSectionVisible] = useState(true);

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

  // Culling observer to suspend rendering when scrolled off-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.02 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isLiteMode) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=2200", // Snappy, punchy flight duration without dragging
        pin: true,
        scrub: 0.5, // 0.5s smooth inertia prevents jerky stepping
        anticipatePin: 1,
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
          const newTier = Math.min(
            TIERS.length - 1,
            Math.max(0, Math.floor(self.progress * TIERS.length))
          );
          setActiveTierIndex((prev) => (prev !== newTier ? newTier : prev));
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${(self.progress * 100).toFixed(1)}%`;
          }
        },
      });

      // Refresh ScrollTrigger and update Lenis limit for pin spacer
      ScrollTrigger.refresh();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    }, containerRef);

    return () => {
      ctx.revert();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    };
  }, [isLiteMode]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] overflow-hidden bg-gradient-to-b from-[#120a1f] via-[#1a0f2e] to-[#251542] text-white flex flex-col justify-between select-none"
      style={{ minHeight: "100dvh" }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
        {mounted && !isLiteMode && (
          <Canvas
            dpr={[1, 1.5]}
            frameloop={isSectionVisible ? "always" : "demand"}
            camera={{ position: [0, 0, 12], fov: 50 }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
            className="w-full h-full"
          >
            <color attach="background" args={["#120a1f"]} />
            <fog attach="fog" args={["#120a1f", 10, 45]} />

            <directionalLight position={[10, 20, 10]} intensity={2.5} color="#ffe5b4" />
            <ambientLight intensity={1.5} color="#dcbef8" />
            <directionalLight position={[-10, 5, -10]} intensity={1.0} color="#ba93e3" />

            {/* Z-Axis Rings mapping */}
            {TIERS.map((tier, idx) => (
              <React.Fragment key={tier.id}>
                <BronzeRing
                  position={[0, 0, -idx * 15]}
                  scale={1 + idx * 0.1}
                  rotation={[0, 0, (idx * Math.PI) / 4]}
                />
                <TierText
                  tier={tier}
                  position={[0, isMobile ? -0.85 : 0, -idx * 15 + 2]}
                  isMobile={isMobile}
                  locale={locale}
                />
              </React.Fragment>
            ))}

            <AscendingGopuramCamera scrollProgressRef={scrollProgressRef} isMobile={isMobile} />
          </Canvas>
        )}
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-16 sm:pt-28 flex items-center justify-end pointer-events-auto">
        <div className="flex items-center gap-3 text-xs font-mono text-purple-100/95 bg-[#26133b]/90 px-3 py-1.5 border border-purple-300/40 backdrop-blur-md shadow-sm">
          <span className="flex items-center gap-1.5 text-[#55CCA2]">
            <Compass className="w-3.5 h-3.5" />
            <span>Pillar {activeTierIndex + 1} of 5</span>
          </span>
          <div className="w-20 sm:w-28 h-1.5 bg-white/15 rounded-full overflow-hidden border border-white/25">
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-[#55CCA2] to-[#FFC526]"
              style={{ width: "0%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
