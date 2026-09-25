"use client";

import React, { useRef, useEffect, useMemo, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "@/context/LocaleContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { Users, ArrowRight } from "lucide-react";
import { PalagaiButton } from "@/components/ui/PalagaiButton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Client-only R3F Canvas
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

// Authentic Mathematical Tamil Pulli & Sikku Kamalam Kolam Generator
function generateKolamPoints(isMobile: boolean) {
  const points: number[] = [];
  const colors: number[] = [];

  const colorWhite = new THREE.Color("#ffffff");
  const colorMint = new THREE.Color("#55CCA2");
  const colorGold = new THREE.Color("#FFC526");
  const colorRose = new THREE.Color("#fb7185");

  const addPoint = (x: number, y: number, z: number, color: THREE.Color) => {
    points.push(x, y, z);
    colors.push(color.r, color.g, color.b);
  };

  // 1. PULLI (The Foundation Dot Grid) - Authentic 13-to-1 Isometric Sandhu Pulli Diamond
  // In classical Tamil culture, dots are placed first with white rice flour (Arisi Maavu)
  const pulliSpacing = isMobile ? 0.48 : 0.52;
  const maxN = isMobile ? 6 : 8;
  for (let row = -maxN; row <= maxN; row++) {
    const colsInRow = (maxN * 2 + 1) - Math.abs(row) * 2;
    for (let c = 0; c < colsInRow; c++) {
      const col = -(colsInRow - 1) / 2 + c;
      const px = col * pulliSpacing;
      const py = row * (pulliSpacing * 0.866); // 60-degree isometric lattice

      // Tight cluster of particles for each pulli dot to render crisp circular rice flour marks
      const dotDensity = isMobile ? 4 : 6;
      for (let p = 0; p < dotDensity; p++) {
        const angle = (p / dotDensity) * Math.PI * 2;
        const rad = p === 0 ? 0 : 0.042;
        const x = px + Math.cos(angle) * rad;
        const y = py + Math.sin(angle) * rad;
        const z = 0.02;

        const distFromCenter = Math.sqrt(px * px + py * py);
        const dotColor = distFromCenter < 0.8 ? colorGold : colorWhite;
        addPoint(x, y, z, dotColor);
      }
    }
  }

  // 2. INNER KAMALAM (8-Petal Sacred Lotus Weave)
  const innerSteps = isMobile ? 600 : 1200;
  for (let i = 0; i <= innerSteps; i++) {
    const t = (i / innerSteps) * Math.PI * 2;
    // 8-petal modulated rose with sharp lotus petal cusps
    const r = 1.38 * (0.68 + 0.32 * Math.cos(8 * t)) * (1.0 + 0.12 * Math.sin(16 * t));
    const x = r * Math.cos(t);
    const y = r * Math.sin(t);
    const z = Math.sin(t * 8) * 0.06;
    addPoint(x, y, z, colorMint);
  }

  // 3. MID-TIER SIKKU RIBBONS (Continuous Loops Weaving Around the Pulli)
  const sikkuSteps = isMobile ? 800 : 1600;
  for (let i = 0; i <= sikkuSteps; i++) {
    const t = (i / sikkuSteps) * Math.PI * 2;

    // Primary 8-fold ribbon looping between dots
    const r1 = 2.65 * (0.84 + 0.24 * Math.sin(4 * t + Math.PI / 4) + 0.14 * Math.cos(8 * t));
    const x1 = r1 * Math.cos(t);
    const y1 = r1 * Math.sin(t);
    const z1 = Math.cos(t * 4) * 0.08;
    const c1 = new THREE.Color().copy(colorMint).lerp(colorWhite, 0.45);
    addPoint(x1, y1, z1, c1);

    // Complementary cross-weave ribbon (offset by 45 degrees, Brahma Mudi knot)
    const r2 = 2.65 * (0.84 + 0.24 * Math.cos(4 * t) + 0.14 * Math.sin(8 * t));
    const x2 = r2 * Math.cos(t);
    const y2 = r2 * Math.sin(t);
    const z2 = -Math.cos(t * 4) * 0.08;
    const c2 = new THREE.Color().copy(colorGold).lerp(colorWhite, 0.35);
    addPoint(x2, y2, z2, c2);
  }

  // 4. OUTER 16-LOBE THIRAI & ALANKARAM BORDER (Scalloped Framing Garland)
  const outerSteps = isMobile ? 700 : 1500;
  for (let i = 0; i <= outerSteps; i++) {
    const t = (i / outerSteps) * Math.PI * 2;
    const r = 4.25 * (0.91 + 0.15 * Math.sin(16 * t) + 0.07 * Math.cos(8 * t));
    const x = r * Math.cos(t);
    const y = r * Math.sin(t);
    const z = Math.sin(t * 16) * 0.05;

    const colorRatio = (Math.sin(t * 4) + 1) * 0.5;
    const c = new THREE.Color().copy(colorMint).lerp(colorRose, colorRatio * 0.45);
    addPoint(x, y, z, c);
  }

  // 5. FOUR CARDINAL GOPURAM STEP FINIALS (Traditional Temple Altar Points)
  const cardinalAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const finialSteps = isMobile ? 25 : 45;
  cardinalAngles.forEach((baseAngle) => {
    for (let f = 1; f <= 3; f++) {
      const dist = 4.45 + f * 0.4;
      const width = (4 - f) * 0.22;
      for (let s = 0; s <= finialSteps; s++) {
        const u = (s / finialSteps) * 2 - 1;
        const offset = u * width;
        const cosB = Math.cos(baseAngle);
        const sinB = Math.sin(baseAngle);
        const lx = dist;
        const ly = offset;
        const x = lx * cosB - ly * sinB;
        const y = lx * sinB + ly * cosB;
        addPoint(x, y, 0.03, colorGold);
      }
    }
  });

  // 6. AMBIENT RICE FLOUR DUST PARTICLES (Subtle Micro-Sparkles)
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const dustCount = isMobile ? 250 : 600;
  for (let i = 0; i < dustCount; i++) {
    const rad = 0.4 + Math.sqrt(rand()) * 5.4;
    const theta = rand() * Math.PI * 2;
    const x = Math.cos(theta) * rad;
    const y = Math.sin(theta) * rad;
    const z = (rand() - 0.5) * 0.7;
    const c = rand() > 0.6 ? colorMint : (rand() > 0.3 ? colorWhite : colorGold);
    addPoint(x, y, z, c);
  }

  return {
    positions: new Float32Array(points),
    colors: new Float32Array(colors),
  };
}

const kolamPointsCache: Record<string, { positions: Float32Array; colors: Float32Array }> = {};
function getKolamPoints(isMobile: boolean) {
  const key = isMobile ? "mobile" : "desktop";
  if (!kolamPointsCache[key]) {
    kolamPointsCache[key] = generateKolamPoints(isMobile);
  }
  return kolamPointsCache[key];
}

// Custom GPU Vertex Shader (Maintains Kolam Geometry at Rest, Lifts into 3D on Scroll)
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

    // Serene living respiration preserving geometric integrity at rest
    float breath = sin(dist * 2.2 - uTime * 1.4) * 0.07;
    // On scroll: dynamic 3D vortex expansion into the letter portal
    float vortex = uScrollProgress * sin(dist * 2.2 - uTime * 2.6) * 2.8;
    float twist = sin(atan(pos.y, pos.x) * 8.0 + uTime * 0.6) * (0.05 + uScrollProgress * 0.25);

    pos.z += breath + vortex + twist;

    // Smooth GPU Rotation on Scroll
    float angle = uScrollProgress * 1.8;
    float cosA = cos(angle);
    float sinA = sin(angle);
    pos.xy = mat2(cosA, -sinA, sinA, cosA) * pos.xy;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Perspective point attenuation for crisp rice-flour particle clarity
    gl_PointSize = (uPointSize / -mvPosition.z) * (1.0 + uScrollProgress * 0.65);
    vAlpha = smoothstep(22.0, 1.5, -mvPosition.z);
  }
`;

// Custom Fragment Shader for Soft Emissive Rice Flour Particles
const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Soft radial falloff for natural rice flour glow
    float strength = pow(1.0 - (dist * 2.0), 1.5);
    gl_FragColor = vec4(vColor, strength * vAlpha);
  }
`;

// GPU-Driven Shader Mesh Component
function GPUKolamParticles({
  scrollProgressRef,
  isMobile,
}: {
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const data = useMemo(() => getKolamPoints(isMobile), [isMobile]);

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
      mat.uniforms.uScrollProgress.value = scrollProgressRef.current;
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

  const sectionRef = useRef<HTMLDivElement>(null);
  const textGroupRef = useRef<SVGGElement>(null);
  const contourGroupRef = useRef<SVGGElement>(null);
  const fullRevealRef = useRef<SVGRectElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
  const contourRef = useRef<HTMLDivElement>(null);

  const scrollProgressRef = useRef<number>(0);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isMobile = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => window.innerWidth < 768,
    () => false
  );

  useEffect(() => {
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
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            scrollProgressRef.current = self.progress;
          },
        },
      });

      // Desktop: 'ம்' counter is centered at approx x=460, y=210 (in 1400x350 viewBox) -> ~33% 60%
      // Mobile: 'ழ்' counter is centered at approx x=250, y=160 -> 50% 40%
      const originX = isMobile ? "50%" : "33%";
      const originY = isMobile ? "40%" : "60%";

      // 0. Synchronize teal contour scaling in exact parity with text cutout mask
      // Keeps the outer teal shading hugging the letter boundaries throughout the zoom
      if (contourGroupRef.current) {
        tl.to(
          contourGroupRef.current,
          {
            scale: 65,
            transformOrigin: `${originX} ${originY}`,
            duration: 0.85,
            ease: "power2.in",
          },
          0
        );
      }

      // 1. Keep teal outer shading visible throughout the zoom, fading only when the letter opening swallows the viewport (0.65 - 0.85)
      if (contourRef.current) {
        tl.to(
          contourRef.current,
          {
            opacity: 0,
            duration: 0.2,
            ease: "power1.inOut",
          },
          0.65
        );
      }

      // 2. Fade out foreground UI elements quickly as scale begins (0 - 0.22)
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

      // 3. Scale up authentic Tamil text mask ~10,000% (scale 65)
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

      // 4. Once the letter counter swallows viewport, blossom into 100% full screen
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

      // Refresh ScrollTrigger and resize Lenis for the newly added pin spacer
      ScrollTrigger.refresh();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    }, sectionRef);

    return () => {
      ctx.revert();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.resize();
      }
    };
  }, [isLiteMode, isMobile]);

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
            <GPUKolamParticles scrollProgressRef={scrollProgressRef} isMobile={isMobile} />
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

      {/* 3. Soft Ambient Architectural Contour of the Tamil Script with Radiant Outer Teal Shading */}
      <div
        ref={contourRef}
        className="absolute inset-0 z-10 pointer-events-none w-full h-full flex items-center justify-center opacity-90"
      >
        <svg
          viewBox={isMobile ? "0 0 500 400" : "0 0 1400 350"}
          className="w-full h-full object-contain overflow-visible"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="teal-title-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#55CCA2" floodOpacity="0.85" />
              <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="#55CCA2" floodOpacity="0.45" />
            </filter>
          </defs>
          <g ref={contourGroupRef} filter="url(#teal-title-glow)">
            {isMobile ? (
              <text
                lang="ta"
                x="250"
                y="170"
                textAnchor="middle"
                fill="none"
                stroke="#55CCA2"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
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
                strokeWidth="3.2"
                strokeLinejoin="round"
                strokeLinecap="round"
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
        className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-24 sm:pt-32 pb-8 flex flex-col justify-end h-full pointer-events-auto"
      >

        {/* Center Bilingual Inscription: Protective Glass Scrim for Crisp Readability */}
        <div className="my-auto py-4 sm:py-8 px-4 sm:px-8 space-y-2.5 sm:space-y-3.5 text-center sm:text-left max-w-2xl bg-[#10061a]/85 backdrop-blur-md border border-purple-500/25 shadow-[4px_4px_0px_#250d38] sm:shadow-[6px_6px_0px_#250d38]">
          <p
            lang="ta"
            style={{ letterSpacing: 0 }}
            className="text-sm sm:text-xl font-bold text-[#FFC526] font-tamil"
          >
            ஆட்டம் · பாட்டம் · கொண்டாட்டம்
          </p>
          <h1 className="text-2xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.1] sm:leading-[1.06] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] [text-shadow:0_0_24px_rgba(85,204,162,0.4)]">
            Start the Aatam, Paatam, and Kondatam!
          </h1>
          <p className="text-xs sm:text-base text-purple-100/90 font-body leading-relaxed max-w-xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {locale === "ta"
              ? "ஓஹியோ பல்கலைக்கழகத்தில் தமிழ் மாணவர்கள் மற்றும் அனைத்து நண்பர்களையும் ஒன்றிணைக்கும் கலாச்சாரப் பாலம். மொழி பேதமின்றி அனைவரும் அன்போடு வரவேற்கப்படுகிறீர்கள்!"
              : "A welcoming campus hub for Tamil culture, good food, casual hangouts, and collegiate celebration in Columbus. Open to all students, majors, and languages."}
          </p>
        </div>

        {/* Bottom CTA Action Bar */}
        <div className="pt-3 sm:pt-4 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <PalagaiButton
              href="/join"
              variant="mint"
              size="md"
              primaryText={locale === "ta" ? "இணையுங்கள்" : "Join The Club"}
              secondaryText={locale === "ta" ? "Join The Club" : "இணையுங்கள்"}
              icon={<Users className="w-4 h-4 text-[#250d38]" />}
              iconPosition="left"
              className="w-full sm:w-auto justify-center"
            />

            <PalagaiButton
              href="/board"
              variant="white"
              size="md"
              primaryText={locale === "ta" ? "நிர்வாகக் குழு" : "Meet The Board"}
              secondaryText={locale === "ta" ? "Meet The Board" : "நிர்வாகக் குழு"}
              icon={<ArrowRight className="w-3.5 h-3.5 text-[#250d38]" />}
              iconPosition="right"
              className="w-full sm:w-auto justify-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
