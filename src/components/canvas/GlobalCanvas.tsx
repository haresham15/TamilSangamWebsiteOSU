"use client";

import React, { useRef, useSyncExternalStore, Component, ErrorInfo } from "react";
import { useLiteMode } from "@/context/LiteModeContext";
import { usePathname } from "next/navigation";

// Defensive WebGL Error Boundary to prevent crashes on unsupported devices
class CanvasErrorBoundary extends Component<
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("[GlobalCanvas] WebGL context loss or render failure:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Client-side canvas content
import { Canvas } from "@react-three/fiber";
import { View, Preload } from "@react-three/drei";

const emptySubscribe = () => () => {};

export function GlobalCanvas() {
  const { isLiteMode } = useLiteMode();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Prevent mounting redundant WebGL contexts on pages that feature their own dedicated 3D canvas
  if (
    !mounted ||
    isLiteMode ||
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/suggestions" ||
    pathname === "/events" ||
    pathname === "/guide" ||
    pathname === "/board" ||
    pathname === "/gallery"
  ) {
    return null;
  }

  return (
    <CanvasErrorBoundary>
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-[100dvh]"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100dvh",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        <Canvas
          frameloop="demand"
          dpr={[1, 2]} // Capped device pixel ratio for Phase 6 mobile optimization
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          eventSource={typeof document !== "undefined" ? (document.body as HTMLElement) : undefined}
          className="w-full h-full pointer-events-none"
          style={{ pointerEvents: "none" }}
        >
          <View.Port />
          <Preload all />
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
