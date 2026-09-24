"use client";

import React, { useRef, useEffect, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lighting } from "./Lighting";
import { PostFX } from "./PostFX";
import { setScrollProgress } from "@/components/scroll/useScrollProgress";
import { DebugHUD } from "./DebugHUD";
import { debugStore } from "./debugState";
import { ArrowDown, Sparkles } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

const subscribeResize = (callback: () => void) => {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};

const getIsMobileSnapshot = () => {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth <= 768 ||
    window.matchMedia("(hover: none)").matches
  );
};

class WebGLCanvasErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("[EventsSceneCanvas] WebGL context loss or render fallback:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-[#0C0704] flex items-center justify-center text-amber-500/70 font-mono text-xs">
          [WebGL Atmosphere Active]
        </div>
      );
    }
    return this.props.children;
  }
}
import { SilhouetteBillboard } from "./SilhouetteBillboard";
import { CrowdField } from "./CrowdField";
import { VolumetricSunburst } from "./VolumetricSunburst";
import { CameraRig } from "./CameraRig";
import { FinaleFlare } from "./FinaleFlare";

interface SceneContentProps {
  keyLightMeshRef: React.RefObject<THREE.Mesh | null>;
  isMobile: boolean;
  onFlash: (opacity: number) => void;
  onCrossfade: () => void;
  showFinaleFX: boolean;
  onShowFinaleFX: (show: boolean) => void;
}

function SceneContent({
  keyLightMeshRef,
  isMobile,
  onFlash,
  onCrossfade,
  showFinaleFX,
  onShowFinaleFX,
}: SceneContentProps) {
  const keyLightPointLightRef = useRef<THREE.PointLight>(null);

  return (
    <>
      {/* 1. Camera Choreography Rig (Dolly-Zoom & Fog interpolation) */}
      <CameraRig />

      {/* 2. Baseline fog and lighting per §2 & §7 */}
      <color attach="background" args={["#0C0704"]} />
      <fogExp2 attach="fog" args={["#0C0704", 0.018]} />

      {/* 3. Volumetric Radial Rayburst Shader Plane (renderOrder: 0) */}
      <VolumetricSunburst position={[0, 3.4, -2.8]} size={10} />

      {/* 4. Lighting Rig with Layer-1 Bloom Sphere */}
      <Lighting
        keyLightMeshRef={keyLightMeshRef}
        keyLightPointLightRef={keyLightPointLightRef}
      />

      {/* 5. Hero Silhouette Billboard Plane (Photographic alpha-masked, renderOrder: 1) */}
      <SilhouetteBillboard />

      {/* 6. 3-Layer Instanced Crowd Field */}
      <CrowdField isMobile={isMobile} />

      {/* 7. Stylized Finale Flare Energy Burst Sequence (§9) */}
      <FinaleFlare
        onFlash={onFlash}
        onCrossfade={onCrossfade}
        onShowFinaleFX={onShowFinaleFX}
      />

      {/* 8. Post-Processing Stack: Selective Bloom on Layer 1 */}
      <PostFX
        keyLightMeshRef={keyLightMeshRef}
        keyLightPointLightRef={keyLightPointLightRef}
        showFinaleFX={showFinaleFX}
      />
    </>
  );
}

/**
 * EventsSceneCanvas:
 * Master WebGL canvas root for the Events scene overhaul.
 * Restated parameters per §2 of Master PRD:
 * - gl: antialias: false, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05, outputColorSpace: SRGBColorSpace
 * - dpr: [1, 1.5]
 * - fog: FogExp2(0x0c0704, 0.018)
 */
export function EventsSceneCanvas() {
  const { locale } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const keyLightMeshRef = useRef<THREE.Mesh>(null);
  const isMobile = useSyncExternalStore(
    subscribeResize,
    getIsMobileSnapshot,
    () => false
  );

  const [isNearGround, setIsNearGround] = useState(false);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [canvasOpacity, setCanvasOpacity] = useState(1);
  const [canvasHidden, setCanvasHidden] = useState(false);
  const [showFinaleFX, setShowFinaleFX] = useState(false);

  const handleCrossfade = React.useCallback(() => {
    gsap.to({ val: 1 }, {
      val: 0,
      duration: 0.35,
      ease: "power2.out",
      onUpdate: function() {
        setCanvasOpacity(this.targets()[0].val);
      },
      onComplete: () => {
        setTimeout(() => {
          setCanvasHidden(true);
        }, 250);
      },
    });

    const el = document.getElementById("events-catalogue");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // 300vh ScrollTrigger pinning and progress feeding
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=2200px",
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
        debugStore.setProgress(self.progress);
        const reached = self.progress >= 0.85;
        setIsNearGround((prev) => (prev !== reached ? reached : prev));
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  const scrollToGround = () => {
    const scrollTarget = 2100;
    if (typeof window !== "undefined" && window.__lenis) {
      window.__lenis.scrollTo(scrollTarget, { duration: 1.2 });
    } else {
      window.scrollTo({
        top: scrollTarget,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300vh] bg-[#0C0704] select-none text-left"
    >
      {/* Dev-only Diagnostic HUD (?debug=1) */}
      <DebugHUD />

      {/* 1. Fullscreen Pinned Three.js Canvas (100dvh mandate) */}
      <div
        className="sticky top-0 w-full h-[100dvh] overflow-hidden transition-opacity duration-300"
        style={{
          opacity: canvasOpacity,
          display: canvasHidden ? "none" : "block",
        }}
      >
        <WebGLCanvasErrorBoundary>
          <Canvas
            dpr={[1, isMobile ? 1.25 : 1.5]}
            gl={{
              antialias: false,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.05,
              outputColorSpace: THREE.SRGBColorSpace,
            }}
            camera={{
              position: [0, 14, 22],
              fov: 32,
              near: 0.1,
              far: 100,
            }}
          >
            <React.Suspense fallback={null}>
              <SceneContent
                keyLightMeshRef={keyLightMeshRef}
                isMobile={isMobile}
                onFlash={setFlashOpacity}
                onCrossfade={handleCrossfade}
                showFinaleFX={showFinaleFX}
                onShowFinaleFX={setShowFinaleFX}
              />
            </React.Suspense>
          </Canvas>
        </WebGLCanvasErrorBoundary>
      </div>

      {/* 2. Fullscreen Amber/White Flash Overlay (§9) */}
      <div
        className="fixed inset-0 z-50 pointer-events-none transition-opacity duration-150"
        style={{
          opacity: flashOpacity,
          background:
            "radial-gradient(circle at 50% 50%, #FFFDF0 0%, #FFD37A 40%, #B8460E 75%, #0C0704 100%)",
          mixBlendMode: "screen",
        }}
      />

      {/* 2. Bottom HUD Status & Navigation Controls */}
      <div className="absolute bottom-6 sm:bottom-8 left-4 right-4 sm:left-8 sm:right-8 z-20 flex items-center justify-between pointer-events-auto max-w-6xl mx-auto">
        <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#0C0704]/90 border border-[#B8460E]/60 text-[11px] font-mono text-[#FFD37A] backdrop-blur-md shadow-[4px_4px_0px_#050302]">
          <span className="w-2 h-2 rounded-full bg-[#FF9A3C] animate-ping" />
          <span>
            {locale === "ta"
              ? "கீழே உருட்டி மேடையைக் காண்க"
              : "Scroll down to descend to stage level"}
          </span>
        </div>

        <button
          type="button"
          onClick={scrollToGround}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-[#140a04]/90 hover:bg-[#2a1206] border border-[#FF9A3C] text-[#FFD37A] text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md transition-all shadow-[4px_4px_0px_#B8460E] cursor-pointer"
        >
          <span>
            {isNearGround
              ? locale === "ta"
                ? "நிகழ்வுகள் பட்டியல்"
                : "Explore Events"
              : locale === "ta"
              ? "மேடைக்குச் செல்லவும்"
              : "Descend to Platform"}
          </span>
          {isNearGround ? (
            <Sparkles className="w-3.5 h-3.5 text-[#FFD37A]" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          )}
        </button>
      </div>
    </div>
  );
}
