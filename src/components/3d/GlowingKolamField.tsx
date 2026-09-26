"use client";

import React, { useRef, useEffect } from "react";
import { useTinai } from "@/context/TinaiContext";
import { useLiteMode } from "@/context/LiteModeContext";

export const GlowingKolamField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { meta } = useTinai();
  const { isLiteMode } = useLiteMode();

  useEffect(() => {
    if (isLiteMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let isTabActive = !document.hidden;
    const mouse = { x: -1000, y: -1000, radius: 130, active: false };

    // Pause rendering when tab is hidden
    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let mouseMovePending = false;
    let lastClientX = -1000;
    let lastClientY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      if (!mouseMovePending) {
        mouseMovePending = true;
        requestAnimationFrame(() => {
          mouse.x = lastClientX;
          mouse.y = lastClientY;
          mouse.active = true;
          mouseMovePending = false;
        });
      }
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    const spacing = 52;
    let animationFrameId: number;
    let lastFrameTime = 0;

    const render = (timeMs: number) => {
      animationFrameId = requestAnimationFrame(render);

      // Throttle to 60fps max to save GPU battery/overhead on 120-144Hz monitors
      if (timeMs - lastFrameTime < 16.5) return;
      lastFrameTime = timeMs;

      // Only draw when tab is active
      if (!isTabActive) return;

      ctx.clearRect(0, 0, width, height);

      const time = timeMs * 0.001;

      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = mouse.radius * mouse.radius;

          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const factor = 1 - dist / mouse.radius;
            const r = 1.6 + factor * 3.2;

            // Connect lines to nearby dots in active radius (drawing kolam lines)
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(242, 183, 5, ${factor * 0.22})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Hardware-accelerated soft outer glow ring (eliminates slow CPU shadowBlur)
            ctx.beginPath();
            ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(85, 204, 162, ${factor * 0.28})`;
            ctx.fill();

            // Inner crisp accent dot
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = meta.accentColor;
            ctx.fill();
          } else {
            // Ambient gentle shimmer with lightweight sine math
            const alpha = 0.11 + Math.sin(time + x * 0.04 + y * 0.04) * 0.04;
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(243, 231, 211, ${alpha})`;
            ctx.fill();
          }
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isLiteMode, meta.accentColor]);

  if (isLiteMode) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-[100dvh] pointer-events-none z-0 opacity-60"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100dvh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};
