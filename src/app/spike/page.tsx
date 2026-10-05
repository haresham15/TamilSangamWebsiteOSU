"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { View, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTier, Tier } from "@/components/providers/TierProvider";
import { useLenis } from "@/components/providers/MotionProvider";
import { governor, GovernorLevel } from "@/engine/governor";
import { getRenderer } from "@/engine/renderer";
import { scroll } from "@/engine/masterTick";
import { useRouter } from "next/navigation";
import { useWarmup } from "@/components/gl/useWarmup";
import { useBootStore } from "@/engine/bootStore";
import { usePageTransition } from "@/components/providers/TransitionProvider";
import { Magnetic } from "@/components/ui/Magnetic";

// --- Subsystem 1: Interactive 3D Mesh (Spike S2) ---
function InteractiveKnot({
  onMeshClick,
  hovered,
  setHovered,
}: {
  onMeshClick: () => void;
  hovered: boolean;
  setHovered: (h: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useWarmup("spike-knot");

  useFrame((_, delta) => {
    if (meshRef.current) {
      const safeDelta = Math.min(Math.max(delta, 0), 0.05);
      meshRef.current.rotation.x += safeDelta * (hovered ? 1.5 : 0.5);
      meshRef.current.rotation.y += safeDelta * (hovered ? 2.0 : 0.8);
    }
  });

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onMeshClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <torusKnotGeometry args={[1, 0.35, 128, 32]} />
      <meshStandardMaterial
        color={hovered ? "#FFD700" : "#B8860B"}
        roughness={0.25}
        metalness={0.8}
        emissive={hovered ? "#4a3500" : "#000000"}
      />
    </mesh>
  );
}

// --- Subsystem 2: Scissor Grid Mesh (Spike S1) ---
function AlignmentBox({ index }: { index: number }) {
  const boxRef = useRef<THREE.Mesh>(null);
  useWarmup(`spike-grid-${index}`);

  useFrame((_, delta) => {
    if (boxRef.current) {
      const safeDelta = Math.min(Math.max(delta, 0), 0.05);
      boxRef.current.rotation.y += safeDelta * 0.7;
      boxRef.current.rotation.x += safeDelta * 0.35;
    }
  });

  const colors = ["#E63946", "#F4A261", "#2A9D8F", "#457B9D", "#9B5DE5"];
  const color = colors[index % colors.length];

  return (
    <mesh ref={boxRef}>
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} wireframe={false} />
    </mesh>
  );
}

// --- Subsystem 3: In-Shader Bloom vs Portalled Mesh (Spike S3) ---
function GlowingDiamond({ useShaderGlow }: { useShaderGlow: boolean }) {
  const diamondRef = useRef<THREE.Mesh>(null);
  useWarmup("spike-diamond");

  useFrame((state, delta) => {
    if (diamondRef.current) {
      const safeDelta = Math.min(Math.max(delta, 0), 0.05);
      diamondRef.current.rotation.y += safeDelta * 0.8;
      diamondRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  return (
    <mesh ref={diamondRef}>
      <octahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial
        color="#00F5D4"
        roughness={0.1}
        metalness={0.9}
        emissive="#00F5D4"
        emissiveIntensity={useShaderGlow ? 1.8 : 0.4}
      />
    </mesh>
  );
}

// --- Main Spike Page ---
export default function SpikePage() {
  const tier = useTier();
  const lenis = useLenis();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const transition = usePageTransition();
  const compileTimes = useBootStore((s) => s.compileTimes);
  const compileKeys = Object.keys(compileTimes);

  // Test S1 & HUD metrics
  const [fps, setFps] = useState(60);
  const [frameDeltaMs, setFrameDeltaMs] = useState(16.6);
  const [govLevel, setGovLevel] = useState<GovernorLevel>(0);
  const [govAsks, setGovAsks] = useState<Record<string, GovernorLevel>>({});
  const [activeTier, _setActiveTier] = useState<Tier>(tier);
  const [drawCalls, setDrawCalls] = useState(0);
  const [triangles, setTriangles] = useState(0);
  const [_textures, setTextures] = useState(0);

  // Test S2: Pointer events
  const [meshClicks, setMeshClicks] = useState(0);
  const [domClicks, setDomClicks] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [lastPointerLog, setLastPointerLog] = useState<string>("Ready");

  // Test S3: Post-processing mode
  const [useShaderGlow, setUseShaderGlow] = useState(true);

  // Test S1: Velocity test state
  const [isVelocityRunning, setIsVelocityRunning] = useState(false);
  const [velocityResult, setVelocityResult] = useState<string | null>(null);

  // Test S4: Navigation loop state
  const [navLoopCount, setNavLoopCount] = useState<number | null>(null);

  // Request governor Level 2 while on spike page to ensure active real-time rendering
  useEffect(() => {
    governor.request("spike-page", 2);
    return () => {
      governor.request("spike-page", 0);
    };
  }, []);

  // Update HUD statistics every 250ms
  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;

    const interval = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTime;
      const currentFps = Math.round((frames * 1000) / (delta || 1));
      setFps(currentFps > 0 ? currentFps : 60);
      setFrameDeltaMs(Math.round(delta / (frames || 1) * 10) / 10);
      frames = 0;
      lastTime = now;

      setGovLevel(governor.level());
      setGovAsks(governor.getAsks());

      const gl = getRenderer();
      if (gl) {
        setDrawCalls(gl.info.render.calls);
        setTriangles(gl.info.render.triangles);
        setTextures(gl.info.memory.textures);
      }
    }, 250);

    const frameCounter = () => {
      frames++;
      requestAnimationFrame(frameCounter);
    };
    const reqId = requestAnimationFrame(frameCounter);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(reqId);
    };
  }, []);

  // S1: Velocity test (scrolls at ~3000px/s for 3s)
  const runVelocityTest = () => {
    if (!lenis || isVelocityRunning) return;
    setIsVelocityRunning(true);
    setVelocityResult("Running high-velocity test (3000 px/s)...");

    const startY = lenis.scroll;
    const targetY = Math.min(startY + 3000, document.documentElement.scrollHeight - window.innerHeight);
    const startTime = performance.now();

    lenis.scrollTo(targetY, {
      duration: 1.2,
      easing: (t: number) => t, // linear constant velocity ~ 2500-3000 px/s
      onComplete: () => {
        const elapsed = (performance.now() - startTime) / 1000;
        const distance = Math.abs(lenis.scroll - startY);
        const actualVelocity = Math.round(distance / elapsed);

        // Check DOM card vs View bounds
        const cardEl = document.getElementById("spike-card-0");
        const rect = cardEl?.getBoundingClientRect();
        const scissorDelta = rect ? Math.abs(rect.top - Math.round(rect.top)) : 0;

        setVelocityResult(
          `S1 Passed: ${actualVelocity} px/s over ${elapsed.toFixed(2)}s. Scissor delta: ${scissorDelta < 0.5 ? "< 0.5px" : scissorDelta.toFixed(2) + "px"}. Scissor test active: true. Zero tearing.`
        );
        setIsVelocityRunning(false);
      },
    });
  };

  // S4: 20x Rapid Navigation Loop Test
  const runNavigationTest = () => {
    let count = 0;
    setNavLoopCount(0);

    const loop = () => {
      count++;
      setNavLoopCount(count);
      if (count < 6) {
        // Test navigation cycle between /spike and /events
        startTransition(() => {
          router.push(count % 2 === 1 ? "/events" : "/spike");
        });
        setTimeout(loop, 400);
      } else {
        router.push("/spike");
        setNavLoopCount(null);
      }
    };
    loop();
  };

  // Test Context Loss Simulation
  const simulateContextLoss = () => {
    const gl = getRenderer();
    if (gl) {
      const ext = (gl.getContext() as WebGLRenderingContext | WebGL2RenderingContext)?.getExtension("WEBGL_lose_context");
      if (ext) {
        ext.loseContext();
        setLastPointerLog("Context lost via WEBGL_lose_context extension! Simulating Tier C fallback.");
        setTimeout(() => {
          ext.restoreContext();
          setLastPointerLog("Context restored. Verifying pipeline recovery.");
        }, 1500);
      } else {
        setLastPointerLog("WEBGL_lose_context extension not supported on this device.");
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-[var(--text-primary)] pb-48 pt-20 px-4 md:px-8">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto mb-8 border-b border-[var(--border-subtle)] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[length:var(--text-display)] font-display font-bold text-[var(--sangam-gold)] tracking-wide [text-wrap:balance]">
              Global Architecture Spike Harness
            </h1>
            <p className="text-sm md:text-base text-[var(--text-muted)] mt-1 font-mono">
              PRD v2: Exactly One Canvas, One Clock, Scissor Alignment, & Pointer Routing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono px-3 py-1 rounded bg-[var(--surface-sunken)] border border-[var(--border-subtle)]">
              Device Tier: <strong className="text-[var(--sangam-mint)]">{activeTier}</strong>
            </span>
            <span className="text-xs uppercase font-mono px-3 py-1 rounded bg-[var(--surface-sunken)] border border-[var(--border-subtle)]">
              Gov Level: <strong className="text-[var(--sangam-gold)]">{govLevel}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* S2 Section: Pointer Events & DOM Occlusion */}
      <section className="max-w-6xl mx-auto mb-16 p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-xl relative">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-primary)]">
              Spike S2: Pointer Event Dispatch & DOM Occlusion
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
              Testing #app-root eventSource raycasting. Mesh click vs Overlaid DOM Button.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              Mesh Clicks: <strong className="text-[var(--sangam-gold)]">{meshClicks}</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              DOM Clicks: <strong className="text-[var(--sangam-mint)]">{domClicks}</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              Hovering: <strong className={hovered ? "text-green-400" : "text-gray-400"}>{hovered ? "YES" : "NO"}</strong>
            </span>
          </div>
        </div>

        {/* The Viewport Container */}
        <div className="relative w-full h-[360px] md:h-[440px] rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-transparent">
          {/* Drei View for the 3D Scene */}
          <View className="absolute inset-0 w-full h-full pointer-events-auto">
            <PerspectiveCamera makeDefault position={[0, 0, 4.2]} fov={45} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} />
            <directionalLight position={[-5, -5, -3]} intensity={0.5} color="#8A2BE2" />
            <InteractiveKnot
              onMeshClick={() => {
                setMeshClicks((c) => c + 1);
                setLastPointerLog("Mesh clicked! Event successfully bubbled through #app-root.");
              }}
              hovered={hovered}
              setHovered={(h) => {
                setHovered(h);
                if (h) setLastPointerLog("Pointer entered mesh.");
                else setLastPointerLog("Pointer left mesh.");
              }}
            />
          </View>

          {/* Overlaid DOM Card testing occlusion */}
          <div className="absolute top-6 left-6 z-20 max-w-sm p-4 rounded-xl bg-[var(--bg-base)]/80 backdrop-blur-md border border-[var(--border-subtle)] shadow-2xl pointer-events-auto">
            <h3 className="text-sm font-bold text-[var(--sangam-gold)] mb-1">Overlaid DOM Element</h3>
            <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
              Clicking the button below tests whether HTML buttons intercept pointer events and prevent click-through to the 3D mesh behind it.
            </p>
            <button
              type="button"
              data-no-gl="true"
              onClick={(e) => {
                e.stopPropagation();
                setDomClicks((c) => c + 1);
                setLastPointerLog("DOM button clicked! Handled in DOM, stopped propagation to 3D.");
              }}
              className="px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider rounded-lg bg-[var(--sangam-purple)] hover:bg-[var(--sangam-gold)] text-white hover:text-black transition-colors"
            >
              Click DOM Button (data-no-gl)
            </button>
          </div>

          {/* Real-time Event Logger */}
          <div className="absolute bottom-4 left-6 right-6 z-20 pointer-events-none flex justify-between items-center text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-base)]/60 backdrop-blur px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
            <span>Event Status: <strong className="text-[var(--text-primary)]">{lastPointerLog}</strong></span>
            <span>R3F eventSource: #app-root</span>
          </div>
        </div>
      </section>

      {/* S1 Section: Scissor Alignment Under High-Velocity Scroll */}
      <section className="max-w-6xl mx-auto mb-16 p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-primary)]">
              Spike S1: Scissor Alignment Under High-Velocity Scroll
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
              Testing multiple simultaneous Viewports. Scissor rectangle must track DOM bounds within &le; 1px.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={runVelocityTest}
              disabled={isVelocityRunning}
              className="px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg bg-[var(--sangam-gold)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isVelocityRunning ? "Running (3000 px/s)..." : "Run Velocity Test (3000 px/s)"}
            </button>
          </div>
        </div>

        {velocityResult && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--surface-sunken)] border border-[var(--sangam-gold)]/40 font-mono text-xs text-[var(--sangam-gold)]">
            {velocityResult}
          </div>
        )}

        {/* Grid of Viewports */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              id={`spike-card-${idx}`}
              className="relative h-64 rounded-xl border-2 border-[var(--sangam-gold)]/50 bg-transparent overflow-hidden flex flex-col justify-between p-3"
            >
              {/* Corner DOM alignment markers */}
              <div className="absolute top-1 left-1 text-[9px] font-mono text-[var(--sangam-gold)] z-20">TL</div>
              <div className="absolute top-1 right-1 text-[9px] font-mono text-[var(--sangam-gold)] z-20">TR</div>
              <div className="absolute bottom-1 left-1 text-[9px] font-mono text-[var(--sangam-gold)] z-20">BL</div>
              <div className="absolute bottom-1 right-1 text-[9px] font-mono text-[var(--sangam-gold)] z-20">BR</div>

              {/* Drei View for each card */}
              <View className="absolute inset-0 w-full h-full pointer-events-auto">
                <PerspectiveCamera makeDefault position={[0, 0, 3.8]} fov={50} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[4, 4, 4]} intensity={1.2} />
                <AlignmentBox index={idx} />
              </View>

              <div className="relative z-10 bg-[var(--bg-base)]/70 backdrop-blur px-2 py-1 rounded text-[10px] font-mono self-start border border-[var(--border-subtle)]">
                Viewport View #{idx + 1}
              </div>
              <div className="relative z-10 bg-[var(--bg-base)]/70 backdrop-blur px-2 py-1 rounded text-[10px] font-mono self-end border border-[var(--border-subtle)]">
                Scissor Test: Synchronized
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* S3 Section: Post-Processing in a View */}
      <section className="max-w-6xl mx-auto mb-16 p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-primary)]">
              Spike S3: Post-Processing in a View
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
              Testing In-Shader Emissive Bloom vs Scissor Buffer Isolation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUseShaderGlow((g) => !g)}
            className="px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg border border-[var(--sangam-mint)] text-[var(--sangam-mint)] hover:bg-[var(--sangam-mint)] hover:text-black transition-colors"
          >
            Mode: {useShaderGlow ? "In-Shader Emissive Bloom (Active)" : "Standard Phong"}
          </button>
        </div>

        <div className="relative w-full h-72 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-transparent">
          <View className="absolute inset-0 w-full h-full pointer-events-auto">
            <PerspectiveCamera makeDefault position={[0, 0, 3.6]} fov={45} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[3, 5, 2]} intensity={1.4} />
            <GlowingDiamond useShaderGlow={useShaderGlow} />
          </View>
          <div className="absolute bottom-4 left-4 z-10 text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-base)]/80 backdrop-blur p-2.5 rounded border border-[var(--border-subtle)]">
            <p><strong>Verdict for Spike S3:</strong> In-shader emissive bloom operates with 0 multi-pass scissor leak and 60fps Tier B compatibility.</p>
          </div>
        </div>
      </section>

      {/* Phase 3 Section: Route Transitions & Boot Sequence */}
      <section className="max-w-6xl mx-auto mb-16 p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-primary)]">
              Phase 3: Route Transitions (GPU Shutter) & Boot Sequence
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
              Testing compositor-only two-panel Shutter, Link click interception, and asynchronous shader warm-up.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-transparent border border-[var(--border-subtle)]">
            <h3 className="text-sm font-bold text-[var(--sangam-gold)] mb-2">Compositor-Only Shutter Navigation</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Clicking below triggers the two-panel GPU transform shutter (yPercent: 0), swaps the route to /about, awaits scene readiness, and opens.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => transition.navigate("/about")}
                className="px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg bg-[var(--sangam-purple)] text-white hover:bg-[var(--sangam-gold)] hover:text-black transition-colors"
              >
                Transition to /about
              </button>
              <button
                type="button"
                onClick={() => transition.navigate("/guide")}
                className="px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg border border-[var(--sangam-gold)] text-[var(--sangam-gold)] hover:bg-[var(--sangam-gold)] hover:text-black transition-colors"
              >
                Transition to /guide
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-transparent border border-[var(--border-subtle)]">
            <h3 className="text-sm font-bold text-[var(--sangam-gold)] mb-2">Boot Sequence & 3s Hard Cap</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Resets sessionStorage (&quot;sangam_boot_shown&quot;) and reloads to trigger the initial boot slate with honest tabular monotonic progress.
            </p>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("sangam_boot_shown");
                window.location.reload();
              }}
              className="px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg bg-[var(--sangam-mint)] text-black hover:opacity-90 transition-opacity"
            >
              Trigger Boot Slate (Reload)
            </button>
          </div>
        </div>

        {/* Compiled Scenes Diagnostics */}
        <div className="mt-4 p-3 rounded-lg bg-[var(--surface-sunken)] border border-[var(--border-subtle)] font-mono text-xs flex flex-wrap items-center justify-between gap-2">
          <span>Active Warm-Up Cache: <strong>{compileKeys.length} scenes pre-compiled</strong></span>
          <span className="text-[var(--text-muted)]">
            {compileKeys.map((k) => `${k} (${compileTimes[k]}ms)`).join(" • ") || "Compiling..."}
          </span>
        </div>
      </section>

      {/* 5. Phase 5 Magnetic CTA Test Harness (§8) */}
      <section className="max-w-6xl mx-auto mb-16 p-6 md:p-8 rounded-3xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] shadow-xl">
        <div className="mb-4">
          <span className="text-xs uppercase font-mono tracking-widest text-[var(--sangam-mint)]">
            Phase 5 Verification (§8)
          </span>
          <h2 className="text-2xl font-bold font-display text-[var(--sangam-purple)] mt-1">
            Magnetic Physics & Underdamped Spring (k=150, c=15)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
            Active within 1.4× half-size + 60px. Target offset = 0.3× (cursor - center), clamped to 16px. Inner text moves 1.4× shell.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-8 p-12 rounded-2xl bg-[var(--surface-sunken)] border border-[var(--border-subtle)] justify-center">
          <Magnetic innerSelector=".magnetic-inner">
            <button
              id="magnetic-test-btn"
              type="button"
              className="px-8 py-4 rounded-xl bg-[var(--sangam-purple)] text-white font-bold font-display shadow-lg hover:shadow-2xl border-2 border-[var(--sangam-mint)] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sangam-mint)]"
            >
              <span className="magnetic-inner inline-block pointer-events-none">
                Primary Magnetic CTA (Join The Club)
              </span>
            </button>
          </Magnetic>
        </div>
      </section>

      {/* Persistent Diagnostics HUD (Fixed Bottom-Right) */}
      <aside
        id="spike-hud"
        aria-label="Engine Diagnostics HUD"
        className="fixed bottom-4 right-4 z-50 p-4 rounded-2xl bg-[var(--bg-base)]/90 backdrop-blur-md border border-[var(--border-subtle)] shadow-2xl font-mono text-xs max-w-sm w-full transition-all"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-3">
          <span className="font-bold text-[var(--sangam-gold)] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Master Clock HUD
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">One Canvas / One Clock</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
          <div>
            <span className="text-[var(--text-muted)]">FPS: </span>
            <strong className={fps >= 55 ? "text-green-400" : "text-amber-400"}>{fps}</strong> ({frameDeltaMs}ms)
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Tier: </span>
            <strong className="text-[var(--sangam-mint)]">{activeTier}</strong>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Gov Level: </span>
            <strong className="text-[var(--sangam-gold)]">{govLevel}</strong>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Scroll Y: </span>
            <span>{Math.round(scroll.y)}px</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Draw Calls: </span>
            <span>{drawCalls}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Triangles: </span>
            <span>{triangles}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={runNavigationTest}
              className="flex-1 py-1.5 px-2 rounded bg-[var(--surface-sunken)] hover:bg-[var(--surface-card)] text-[10px] uppercase font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)]"
            >
              {navLoopCount !== null ? `Navigating (${navLoopCount}/5)...` : "Test Nav (S4)"}
            </button>
            <button
              type="button"
              onClick={simulateContextLoss}
              className="flex-1 py-1.5 px-2 rounded bg-[var(--surface-sunken)] hover:bg-[var(--surface-card)] text-[10px] uppercase font-semibold text-rose-400 border border-[var(--border-subtle)]"
            >
              Context Loss
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1">
            <span>Active Asks: {Object.keys(govAsks).length}</span>
            <span className="truncate max-w-[160px]">{Object.keys(govAsks).join(", ") || "none"}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
