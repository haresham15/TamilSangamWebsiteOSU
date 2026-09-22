"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLocale } from "@/context/LocaleContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { useAudio } from "@/context/AudioContext";
import { Ticket, Users, ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

// Client-only R3F Canvas
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

// Mathematical Pulli (Dot) Kolam Generator
function generateKolamPoints(isMobile: boolean) {
  const points: number[] = [];
  const colors: number[] = [];
  const baseCount = isMobile ? 1400 : 3800; // 60% reduction on mobile (Phase 6 mandate)

  const colorMint = new THREE.Color("#55CCA2");
  const colorGold = new THREE.Color("#FFC526");
  const colorPurple = new THREE.Color("#a855f7");
  const colorWhite = new THREE.Color("#ffffff");

  // 1. Central 8-fold radial Kolam lattice (Pulli Grid)
  const rings = isMobile ? 8 : 16;
  const dotsPerRing = isMobile ? 16 : 32;

  for (let r = 1; r <= rings; r++) {
    const radius = (r / rings) * 5.8;
    const numDots = dotsPerRing * (r % 2 === 0 ? 1 : 2);
    for (let d = 0; d < numDots; d++) {
      const theta = (d / numDots) * Math.PI * 2;
      // Kolam symmetry modulation (8-fold lotus lobes)
      const rMod = radius * (1 + 0.2 * Math.sin(theta * 8));
      const x = Math.cos(theta) * rMod;
      const y = Math.sin(theta) * rMod;
      const z = (Math.sin(r * 1.5) + Math.cos(theta * 4)) * 0.25;

      points.push(x, y, z);

      // Color gradation
      const ratio = r / rings;
      const c = new THREE.Color();
      if (ratio < 0.28) {
        c.copy(colorGold).lerp(colorMint, ratio / 0.28);
      } else if (ratio < 0.72) {
        c.copy(colorMint).lerp(colorPurple, (ratio - 0.28) / 0.44);
      } else {
        c.copy(colorPurple).lerp(colorWhite, (ratio - 0.72) / 0.28);
      }
      colors.push(c.r, c.g, c.b);
    }
  }

  // 2. Surrounding swirling celestial dust (Topographic terrain points)
  const dustCount = baseCount - points.length / 3;
  for (let i = 0; i < dustCount; i++) {
    const r = Math.sqrt(Math.random()) * 8.5;
    const theta = Math.random() * Math.PI * 2;
    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r;
    const z = (Math.random() - 0.5) * 3.5;

    points.push(x, y, z);
    const c = Math.random() > 0.4 ? colorMint : colorGold;
    colors.push(c.r, c.g, c.b);
  }

  return {
    positions: new Float32Array(points),
    colors: new Float32Array(colors),
  };
}

// 3D Kolam Particle Mesh with turbulence
function KolamParticles({
  scrollProgress,
  isMobile,
}: {
  scrollProgress: number;
  isMobile: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const data = useMemo(() => generateKolamPoints(isMobile), [isMobile]);

  useEffect(() => {
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      const t = clock.getElapsedTime();
      if (pointsRef.current) {
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const count = positions.length / 3;

        // Subtle sine turbulence (breathing Kolam)
        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          const x = positions[idx];
          const y = positions[idx + 1];
          const dist = Math.sqrt(x * x + y * y);

          // Topographic morph as scrollProgress increases
          const vortexLift = scrollProgress * Math.sin(dist * 2.2 - t * 2.5) * 2.8;
          const baseZ = data.positions[idx + 2];
          positions[idx + 2] = baseZ + vortexLift + Math.sin(dist * 1.5 - t * 1.2) * 0.18;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        // Radial rotation
        pointsRef.current.rotation.z = t * 0.08 + scrollProgress * 1.8;
        // Tilt with scroll
        pointsRef.current.rotation.x = scrollProgress * 0.9;
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [data, scrollProgress]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[data.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.05 : 0.036}
        vertexColors
        transparent
        opacity={0.92}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function DigitalKolamHero({ nextEventSlug }: { nextEventSlug: string }) {
  const { locale } = useLocale();
  const { isLiteMode } = useLiteMode();
  const { playClick } = useAudio();

  const sectionRef = useRef<HTMLDivElement>(null);
  const textGroupRef = useRef<SVGGElement>(null);
  const fullRevealRef = useRef<SVGRectElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const mobileCheck = window.innerWidth < 768;
    setIsMobile(mobileCheck);

    if (isLiteMode) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !textGroupRef.current) return;

      // GSAP ScrollTrigger timeline pinning hero section (100dvh)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=1600",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            setScrollProgress(self.progress);
          },
        },
      });

      // 1. Fade out foreground UI elements quickly as scale begins (0 - 0.25)
      if (foregroundRef.current) {
        tl.to(
          foregroundRef.current,
          {
            opacity: 0,
            y: -40,
            duration: 0.22,
            ease: "power2.out",
          },
          0
        );
      }

      // 2. Scale up SVG text mask ~10,000% (scale 60) focusing on the letter 'A' in TAMIL
      const originX = mobileCheck ? "48%" : "29.5%";
      const originY = mobileCheck ? "42%" : "52%";

      tl.to(
        textGroupRef.current,
        {
          scale: 60,
          transformOrigin: `${originX} ${originY}`,
          duration: 0.85,
          ease: "power2.in",
        },
        0
      );

      // 3. Once the letter 'A' negative space swallows viewport, blossom into 100% full screen
      if (fullRevealRef.current) {
        tl.to(
          fullRevealRef.current,
          {
            opacity: 1,
            duration: 0.25,
            ease: "power1.inOut",
          },
          0.7
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isLiteMode]);

  return (
    <div
      ref={sectionRef}
      className="relative w-full h-[100dvh] overflow-hidden bg-[#10061a] text-white flex flex-col justify-between"
      style={{ minHeight: "100dvh" }}
    >
      {/* 1. Full-Screen 3D Particle Canvas under the mask */}
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
        {mounted && !isLiteMode && (
          <Canvas
            dpr={[1, 2]} // Capped device pixel ratio (Phase 6 rule)
            camera={{ position: [0, 0, 7.5], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            className="w-full h-full"
          >
            <ambientLight intensity={0.5} />
            <KolamParticles scrollProgress={scrollProgress} isMobile={isMobile} />
          </Canvas>
        )}
      </div>

      {/* 2. SVG Mask Layer: The Landon Norris Effect (3D Kolam simulation only visible inside text) */}
      <div className="absolute inset-0 z-10 pointer-events-none w-full h-full flex items-center justify-center">
        <svg
          viewBox={isMobile ? "0 0 500 400" : "0 0 1400 350"}
          className="w-full h-full object-contain"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <mask id="kolam-text-window-mask">
              {/* Black background: hides everything by default */}
              <rect width="100%" height="100%" fill="black" />
              {/* White text: punches open the window into the 3D Kolam particle simulation */}
              <g ref={textGroupRef}>
                {isMobile ? (
                  <text
                    x="250"
                    y="180"
                    textAnchor="middle"
                    fill="white"
                    fontFamily="var(--font-display), sans-serif"
                    fontWeight="900"
                    fontSize="88"
                    letterSpacing="-2"
                  >
                    TAMIL
                    <tspan x="250" y="270">
                      SANGAM
                    </tspan>
                  </text>
                ) : (
                  <text
                    x="700"
                    y="220"
                    textAnchor="middle"
                    fill="white"
                    fontFamily="var(--font-display), sans-serif"
                    fontWeight="900"
                    fontSize="155"
                    letterSpacing="-4"
                  >
                    TAMIL SANGAM
                  </text>
                )}
              </g>
              {/* Full reveal rectangle fading in at 75%+ scroll */}
              <rect
                ref={fullRevealRef}
                width="100%"
                height="100%"
                fill="white"
                style={{ opacity: 0 }}
              />
            </mask>
          </defs>

          {/* Deep Navy/Purple Shield with Cutout Text Window */}
          <rect
            width="100%"
            height="100%"
            fill="#12071d"
            mask="url(#kolam-text-window-mask)"
            opacity={0.96}
          />
        </svg>
      </div>

      {/* 3. Subtle Mint Neon Outline of the Text for Sharp Definition */}
      <div className="absolute inset-0 z-10 pointer-events-none w-full h-full flex items-center justify-center opacity-80">
        <svg
          viewBox={isMobile ? "0 0 500 400" : "0 0 1400 350"}
          className="w-full h-full object-contain"
          preserveAspectRatio="xMidYMid slice"
        >
          <g style={{ opacity: Math.max(0, 1 - scrollProgress * 3) }}>
            {isMobile ? (
              <text
                x="250"
                y="180"
                textAnchor="middle"
                fill="none"
                stroke="#55CCA2"
                strokeWidth="1.5"
                fontFamily="var(--font-display), sans-serif"
                fontWeight="900"
                fontSize="88"
                letterSpacing="-2"
              >
                TAMIL
                <tspan x="250" y="270">
                  SANGAM
                </tspan>
              </text>
            ) : (
              <text
                x="700"
                y="220"
                textAnchor="middle"
                fill="none"
                stroke="#55CCA2"
                strokeWidth="2"
                fontFamily="var(--font-display), sans-serif"
                fontWeight="900"
                fontSize="155"
                letterSpacing="-4"
              >
                TAMIL SANGAM
              </text>
            )}
          </g>
        </svg>
      </div>

      {/* 4. Foreground Interactive Content: Fades out as user scrolls into the vortex */}
      <div
        ref={foregroundRef}
        className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-24 sm:pt-32 pb-8 flex flex-col justify-between h-full pointer-events-auto"
      >
        {/* Top Inscription Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#250d38]/90 border border-[#55CCA2] text-[#55CCA2] text-[11px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-[3px_3px_0px_#55CCA2]">
            <span className="w-2 h-2 rounded-full bg-[#55CCA2] animate-pulse" />
            <span>The Ohio State University · Student Cultural Hub</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-purple-200/70">
            <Sparkles className="w-3.5 h-3.5 text-[#FFC526]" />
            <span>Digital Kolam 3D Simulation</span>
          </div>
        </div>

        {/* Center Bilingual Inscription */}
        <div className="my-auto py-4 space-y-3 text-center sm:text-left max-w-2xl">
          <p
            lang="ta"
            style={{ letterSpacing: 0 }}
            className="text-base sm:text-xl font-bold text-[#55CCA2] font-tamil"
          >
            ஆட்டம் · பாட்டம் · கொண்டாட்டம்
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.05]">
            Start the Aatam, Paatam, and Kondatam!
          </h1>
          <p className="text-xs sm:text-base text-purple-100/80 font-body leading-relaxed max-w-xl">
            {locale === "ta"
              ? "ஓஹியோ பல்கலைக்கழகத்தில் தமிழ் மாணவர்கள் மற்றும் அனைத்து நண்பர்களையும் ஒன்றிணைக்கும் கலாச்சாரப் பாலம். மொழி பேதமின்றி அனைவரும் இணையலாம்!"
              : "A welcoming campus hub for Tamil culture, good food, casual hangouts, and collegiate celebration in Columbus. Open to all students, majors, and languages."}
          </p>
        </div>

        {/* Bottom CTA Action Bar */}
        <div className="pt-4 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/events/${nextEventSlug}`}
              onClick={playClick}
              className="min-h-[48px] px-6 py-3 bg-[#55CCA2] text-[#160824] hover:bg-white text-xs font-mono font-extrabold uppercase tracking-wider border-2 border-[#55CCA2] shadow-[4px_4px_0px_#250d38] transition-all flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>{locale === "ta" ? "நுழைவுச்சீட்டு" : "Get Event Tickets"}</span>
            </Link>

            <Link
              href="/join"
              onClick={playClick}
              className="min-h-[48px] px-6 py-3 bg-[#250d38] hover:bg-[#34144e] text-white text-xs font-mono font-bold uppercase tracking-wider border-2 border-[#55CCA2] shadow-[4px_4px_0px_#55CCA2] transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-[#55CCA2]" />
              <span>{locale === "ta" ? "இணையுங்கள்" : "Join The Club"}</span>
            </Link>

            <Link
              href="/board"
              onClick={playClick}
              className="min-h-[48px] px-5 py-3 text-purple-200 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <span>{locale === "ta" ? "நிர்வாகக் குழு" : "Meet The Board"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#55CCA2]" />
            </Link>
          </div>

          {/* Scroll Down Indicator */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-purple-300/60 uppercase tracking-widest">
            <span>Scroll To Plunge Into Vortex</span>
            <span className="w-1.5 h-1.5 bg-[#55CCA2] rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
