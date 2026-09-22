"use client";

import React, { useRef, useEffect, useState, Component, ErrorInfo } from "react";
import dynamic from "next/dynamic";
import { useLiteMode } from "@/context/LiteModeContext";

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

export function GlobalCanvas() {
  const { isLiteMode } = useLiteMode();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLiteMode) return null;

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
          dpr={[1, 2]} // Capped device pixel ratio for Phase 6 mobile optimization
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          eventSource={typeof document !== "undefined" ? (document.body as any) : undefined}
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
