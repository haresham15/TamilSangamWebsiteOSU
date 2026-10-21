"use client";

import React, { useRef, useEffect } from "react";
import { useReducedMotion } from "framer-motion";

export interface ClickSparkProps {
  children?: React.ReactNode;
  sparkColor?: string;
  sparkCount?: number;
  sparkRadius?: number;
  duration?: number;
  className?: string;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

/**
 * ClickSpark Primitive (Inspired by reactbits.dev/animations/click-spark)
 * Emits a subtle, geometric 8-point Kolam gold spark burst at the exact pointer click coordinates.
 */
export function ClickSpark({
  children,
  sparkColor = "#D4AF37",
  sparkCount = 8,
  sparkRadius = 18,
  duration = 420,
  className = "",
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleClick = (e: MouseEvent) => {
      // Trigger spark on clicks
      const now = performance.now();
      for (let i = 0; i < sparkCount; i++) {
        const angle = (i * 2 * Math.PI) / sparkCount;
        sparksRef.current.push({
          x: e.clientX,
          y: e.clientY,
          angle,
          startTime: now,
        });
      }
    };

    window.addEventListener("click", handleClick, { passive: true });

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const remaining: Spark[] = [];

      for (const spark of sparksRef.current) {
        const elapsed = time - spark.startTime;
        if (elapsed < duration) {
          remaining.push(spark);
          const progress = elapsed / duration;
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const distance = easeOut * sparkRadius;
          const opacity = 1 - progress;

          const currentX = spark.x + Math.cos(spark.angle) * distance;
          const currentY = spark.y + Math.sin(spark.angle) * distance;

          ctx.save();
          ctx.beginPath();
          ctx.arc(currentX, currentY, 1.2 * (1 - progress * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = sparkColor;
          ctx.globalAlpha = opacity;
          ctx.shadowColor = sparkColor;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.restore();
        }
      }

      sparksRef.current = remaining;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", handleClick);
    };
  }, [shouldReduceMotion, sparkColor, sparkCount, sparkRadius, duration]);

  return (
    <>
      {children ? <div className={className}>{children}</div> : null}
      {!shouldReduceMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[100] w-full h-full select-none"
        />
      )}
    </>
  );
}
