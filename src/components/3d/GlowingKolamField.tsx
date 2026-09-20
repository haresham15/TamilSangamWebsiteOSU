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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.clientWidth);
    let height = (canvas.height = canvas.clientHeight);

    const mouse = { x: -1000, y: -1000, radius: 140 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    const spacing = 48;
    let animationFrameId: number;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
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
            const factor = (1 - dist / mouse.radius);
            r = 1.6 + factor * 3.5;
            alpha = 0.2 + factor * 0.8;
            glow = factor * 12;

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
