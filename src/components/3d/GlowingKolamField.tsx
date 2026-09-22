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

    let width = (canvas.width = canvas.clientWidth);
    let height = (canvas.height = canvas.clientHeight);

    let isVisible = true;
    let isTabActive = !document.hidden;
    const mouse = { x: -1000, y: -1000, radius: 140, active: false };

    // Pause rendering when canvas is outside viewport
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
      },
      { rootMargin: "100px" }
    );
    observer.observe(canvas);

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
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = lastClientX - rect.left;
            mouse.y = lastClientY - rect.top;
            mouse.active = true;
          }
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
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    const spacing = 48;
    let animationFrameId: number;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      // Only draw when element is visible in the viewport and tab is active
      if (!isVisible || !isTabActive) return;

      ctx.clearRect(0, 0, width, height);

      const time = Date.now() * 0.001;

      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let r = 1.6;
          let alpha = 0.15;
          let glow = 0;

          if (dist < mouse.radius) {
            const factor = 1 - dist / mouse.radius;
            r = 1.6 + factor * 3.5;
            alpha = 0.2 + factor * 0.8;
            glow = factor * 10;

            // Connect lines to nearby dots in active radius (drawing kolam lines)
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(242, 183, 5, ${factor * 0.25})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          } else {
            // Ambient gentle shimmer
            alpha = 0.12 + Math.sin(time + x * 0.05 + y * 0.05) * 0.05;
          }

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = dist < mouse.radius ? meta.accentColor : `rgba(243, 231, 211, ${alpha})`;
          if (glow > 0) {
            ctx.shadowBlur = glow;
            ctx.shadowColor = meta.accentColor;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
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
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60"
    />
  );
};
