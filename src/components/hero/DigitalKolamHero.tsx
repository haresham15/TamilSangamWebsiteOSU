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
import { useFrame } from "@react-three/fiber";

// Client-only R3F Canvas
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

// High-Performance Mathematical Tamil Sikku & Pulli Kolam Generator
function generateKolamPoints(isMobile: boolean) {
  const points: number[] = [];
  const colors: number[] = [];
  const baseCount = isMobile ? 1800 : 4800; // Scaled for density

  const colorMint = new THREE.Color("#55CCA2");
  const colorGold = new THREE.Color("#FFC526");
  const colorPurple = new THREE.Color("#a855f7");
  const colorRose = new THREE.Color("#f43f5e");
  const colorWhite = new THREE.Color("#ffffff");

  // 1. Authentic 8-Fold Interlocking Sikku / Brahma Mudi Kolam Lattice
  const rings = isMobile ? 10 : 20;
  const dotsPerRing = isMobile ? 16 : 32;

  for (let r = 1; r <= rings; r++) {
    const radius = (r / rings) * 6.2;
    const numDots = dotsPerRing * (r % 2 === 0 ? 1 : 2);
    for (let d = 0; d < numDots; d++) {
      const theta = (d / numDots) * Math.PI * 2;
      // Traditional Tamil Lotus / Sikku lobe modulation
      const rMod = radius * (1.0 + 0.22 * Math.sin(theta * 8.0) + 0.1 * Math.cos(theta * 16.0));
      const x = Math.cos(theta) * rMod;
      const y = Math.sin(theta) * rMod;
      const z = (Math.sin(r * 1.8) + Math.cos(theta * 4.0)) * 0.3;

      points.push(x, y, z);

      // Kanchipuram silk-inspired chromatic gradation (Gold -> Mint -> Rose -> Royal Purple)
      const ratio = r / rings;
      const c = new THREE.Color();
      if (ratio < 0.25) {
        c.copy(colorGold).lerp(colorMint, ratio / 0.25);
      } else if (ratio < 0.6) {
        c.copy(colorMint).lerp(colorRose, (ratio - 0.25) / 0.35);
      } else if (ratio < 0.85) {
        c.copy(colorRose).lerp(colorPurple, (ratio - 0.6) / 0.25);
      } else {
        c.copy(colorPurple).lerp(colorWhite, (ratio - 0.85) / 0.15);
      }
      colors.push(c.r, c.g, c.b);
    }
  }

  // 2. Interlacing Brahma Mudi Knots (Geometric Crossing Points)
  const knotCount = isMobile ? 300 : 900;
  for (let k = 0; k < knotCount; k++) {
    const t = (k / knotCount) * Math.PI * 4;
    const r = 2.5 * Math.sin(t * 3.0) + 3.0;
    const x = r * Math.cos(t * 2.0);
    const y = r * Math.sin(t * 2.0);
    const z = Math.sin(t * 6.0) * 0.5;

    points.push(x, y, z);
    const c = k % 2 === 0 ? colorMint : colorGold;
    colors.push(c.r, c.g, c.b);
  }

  // 3. Ambient Celestial Cosmic Dust Field
  const remaining = baseCount - points.length / 3;
  for (let i = 0; i < remaining; i++) {
    const r = Math.sqrt(Math.random()) * 9.5;
    const theta = Math.random() * Math.PI * 2;
    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r;
    const z = (Math.random() - 0.5) * 4.0;

    points.push(x, y, z);
    const c = Math.random() > 0.5 ? colorMint : colorGold;
    colors.push(c.r, c.g, c.b);
  }

  return {
    positions: new Float32Array(points),
    colors: new Float32Array(colors),
  };
}

// Custom GPU Vertex Shader (100% Hardware Accelerated, Zero CPU-to-GPU Re-upload Bottleneck)
const vertexShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uPointSize;

  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec3 pos = position;

    float dist = length(pos.xy);

    // 100% GPU Parallel Turbulence Math (No CPU Loops)
    float breath = sin(dist * 2.0 - uTime * 2.2) * 0.25;
    float vortex = uScrollProgress * sin(dist * 2.8 - uTime * 3.0) * 3.5;
    float twist = sin(atan(pos.y, pos.x) * 8.0 + uTime * 0.8) * 0.18;

    pos.z += breath + vortex + twist;

    // GPU Rotation on Scroll
    float angle = uScrollProgress * 2.2;
    float cosA = cos(angle);
    float sinA = sin(angle);
    pos.xy = mat2(cosA, -sinA, sinA, cosA) * pos.xy;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective-attenuated point size
    gl_PointSize = (uPointSize / -mvPosition.z) * (1.0 + uScrollProgress * 0.75);
    vAlpha = smoothstep(20.0, 2.0, -mvPosition.z);
  }
`;

// Custom Fragment Shader for Soft Glowing Circular Discs
const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float glow = smoothstep(0.5, 0.04, dist);
    gl_FragColor = vec4(vColor, glow * vAlpha * 0.94);
  }
`;

// GPU-Driven Shader Mesh Component
function GPUKolamParticles({
  scrollProgress,
  isMobile,
}: {
  scrollProgress: number;
  isMobile: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const data = useMemo(() => generateKolamPoints(isMobile), [isMobile]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uPointSize: { value: isMobile ? 36.0 : 44.0 },
    }),
    [isMobile]
  );

  // Buttery 60-120 FPS GPU uniform update via R3F useFrame (0 CPU buffer writes)
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = clock.getElapsedTime();
      mat.uniforms.uScrollProgress.value = scrollProgress;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[data.colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
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

      // 1. Fade out foreground UI elements quickly as scale begins (0 - 0.22)
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

      // 2. Scale up authentic Tamil text mask ~10,000% (scale 65)
      // Focuses directly into the counter-space loop of the letter ம் in தமிழ்
      // Desktop: 'ம்' counter is centered at approx x=460, y=210 (in 1400x350 viewBox) -> ~33% 60%
      // Mobile: 'ழ்' counter is centered at approx x=250, y=160 -> 50% 40%
      const originX = mobileCheck ? "50%" : "33%";
      const originY = mobileCheck ? "40%" : "60%";

      tl.to(
        textGroupRef.current,
        {
          scale: 65,
          transformOrigin: `${originX} ${originY}`,
          duration: 0.85,
          ease: "power2.in",
        },
        0
      );

      // 3. Once the letter counter swallows viewport, blossom into 100% full screen
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
      {/* 1. Full-Screen 3D Particle Canvas with Pure GPU Shader Turbulence */}
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
        {mounted && !isLiteMode && (
          <Canvas
            dpr={[1, 2]} // Capped device pixel ratio (Phase 6 rule)
            camera={{ position: [0, 0, 7.5], fov: 50 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
            className="w-full h-full"
          >
            <ambientLight intensity={0.4} />
            <GPUKolamParticles scrollProgress={scrollProgress} isMobile={isMobile} />
          </Canvas>
        )}
      </div>

      {/* 2. SVG Mask Layer: Authentic Tamil Typography Window (தமிழ் சங்கம்) */}
      <div className="absolute inset-0 z-10 pointer-events-none w-full h-full flex items-center justify-center">
        <svg
          viewBox={isMobile ? "0 0 500 400" : "0 0 1400 350"}
          className="w-full h-full object-contain"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <mask id="kolam-tamil-window-mask">
              {/* Black background: hides everything by default */}
              <rect width="100%" height="100%" fill="black" />

              {/* White text: punches open the window into the 3D Kolam simulation in AUTHENTIC TAMIL SCRIPT */}
              <g ref={textGroupRef}>
                {isMobile ? (
                  // Mobile stacked layout adhering to tamil-text skill
                  <text
                    lang="ta"
                    x="250"
                    y="170"
                    textAnchor="middle"
                    fill="white"
                    fontFamily="var(--font-mukta-malar), var(--font-tamil), sans-serif"
                    fontWeight="900"
                    fontSize="94"
                    letterSpacing="0"
                    style={{ letterSpacing: 0 }}
                  >
                    தமிழ்
                    <tspan x="250" y="275">
                      சங்கம்
                    </tspan>
                  </text>
                ) : (
                  // Desktop single wide lockup adhering to tamil-text skill
                  <text
                    lang="ta"
                    x="700"
                    y="235"
                    textAnchor="middle"
                    fill="white"
                    fontFamily="var(--font-mukta-malar), var(--font-tamil), sans-serif"
                    fontWeight="900"
                    fontSize="155"
                    letterSpacing="0"
                    style={{ letterSpacing: 0 }}
                  >
                    தமிழ் சங்கம்
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

          {/* Deep Navy/Purple Shield with Cutout Tamil Text Window */}
          <rect
            width="100%"
            height="100%"
            fill="#12071d"
            mask="url(#kolam-tamil-window-mask)"
            opacity={0.96}
          />
        </svg>
      </div>

      {/* 3. Soft Ambient Architectural Contour of the Tamil Script */}
      <div className="absolute inset-0 z-10 pointer-events-none w-full h-full flex items-center justify-center opacity-30">
        <svg
          viewBox={isMobile ? "0 0 500 400" : "0 0 1400 350"}
          className="w-full h-full object-contain"
          preserveAspectRatio="xMidYMid slice"
        >
          <g style={{ opacity: Math.max(0, 1 - scrollProgress * 14) }}>
            {isMobile ? (
              <text
                lang="ta"
                x="250"
                y="170"
                textAnchor="middle"
                fill="none"
                stroke="#55CCA2"
                strokeWidth="1.2"
                fontFamily="var(--font-mukta-malar), var(--font-tamil), sans-serif"
                fontWeight="900"
                fontSize="94"
                letterSpacing="0"
                style={{ letterSpacing: 0 }}
              >
                தமிழ்
                <tspan x="250" y="275">
                  சங்கம்
                </tspan>
              </text>
            ) : (
              <text
                lang="ta"
                x="700"
                y="235"
                textAnchor="middle"
                fill="none"
                stroke="#55CCA2"
                strokeWidth="1.5"
                fontFamily="var(--font-mukta-malar), var(--font-tamil), sans-serif"
                fontWeight="900"
                fontSize="155"
                letterSpacing="0"
                style={{ letterSpacing: 0 }}
              >
                தமிழ் சங்கம்
              </text>
            )}
          </g>
        </svg>
      </div>

      {/* 4. Foreground Interactive Content: Fades out as user scrolls */}
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
            <span>Columbus, OH · Est. 2026</span>
          </div>
        </div>

        {/* Center Bilingual Inscription: Protective Glass Scrim for Crisp Readability */}
        <div className="my-auto py-6 sm:py-8 px-6 sm:px-8 space-y-3.5 text-center sm:text-left max-w-2xl bg-[#10061a]/85 backdrop-blur-md border border-purple-500/25 shadow-[6px_6px_0px_#250d38]">
          <p
            lang="ta"
            style={{ letterSpacing: 0 }}
            className="text-base sm:text-xl font-bold text-[#FFC526] font-tamil"
          >
            ஆட்டம் · பாட்டம் · கொண்டாட்டம்
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.06] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Start the Aatam, Paatam, and Kondatam!
          </h1>
          <p className="text-xs sm:text-base text-purple-100/90 font-body leading-relaxed max-w-xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {locale === "ta"
              ? "ஓஹியோ பல்கலைக்கழகத்தில் தமிழ் மாணவர்கள் மற்றும் அனைத்து நண்பர்களையும் ஒன்றிணைக்கும் கலாச்சாரப் பாலம். மொழி பேதமின்றி அனைவரும் அன்போடு வரவேற்கப்படுகிறீர்கள்!"
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

          {/* Scroll Indicator */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-purple-300/60 uppercase tracking-widest">
            <span>Scroll Down</span>
            <span className="w-1.5 h-1.5 bg-[#55CCA2] rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
