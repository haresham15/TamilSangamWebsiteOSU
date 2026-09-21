"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Point {
  x: number;
  y: number;
}

export const DynamicKolamHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - rect.width / 2) / (rect.width / 2),
      y: (e.clientY - rect.top - rect.height / 2) / (rect.height / 2),
    });
  };

  if (!isClient) return null;

  // 7x7 Sacred Pulli Kolam Dot Matrix
  const gridSize = 7;
  const spacing = 48;
  const dots: Point[] = [];
  const offset = ((gridSize - 1) * spacing) / 2;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      dots.push({
        x: c * spacing - offset,
        y: r * spacing - offset,
      });
    }
  }

  // Sikku Kolam continuous looping curves around points
  const pathD = `
    M 0 -144
    C 48 -144 96 -96 96 -48
    C 96 0 144 48 144 96
    C 144 144 96 144 48 144
    C 0 144 -48 96 -96 96
    C -144 96 -144 48 -144 0
    C -144 -48 -96 -96 -48 -96
    C 0 -96 48 -48 48 0
    C 48 48 0 48 -48 48
    C -96 48 -96 0 -96 -48
    C -96 -96 -48 -144 0 -144
    Z
  `;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden pointer-events-auto flex items-center justify-center select-none"
    >
      <div className="relative w-[700px] h-[700px] flex items-center justify-center">
        {/* Ambient Gradient Glows in Official Logo Royal Purple & Mint Teal */}
        <div
          className="absolute inset-0 rounded-full blur-[100px] opacity-35 pointer-events-none transition-transform duration-700 ease-out"
          style={{
            background: "radial-gradient(circle, #55CCA2 0%, #4c2472 50%, transparent 75%)",
            transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px) scale(1.1)`,
          }}
        />

        {/* Concentric Decorative Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute inset-8 rounded-full border border-purple-300/40 border-dashed opacity-50 pointer-events-none"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
          className="absolute inset-24 rounded-full border border-[#55CCA2]/30 opacity-40 pointer-events-none"
        />

        <svg
          viewBox="-240 -240 480 480"
          className="w-full h-full relative z-10 drop-shadow-2xl"
          style={{
            transform: `perspective(1000px) rotateX(${mousePos.y * -8}deg) rotateY(${mousePos.x * 8}deg)`,
            transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <defs>
            <linearGradient id="kolamGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#55CCA2" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#e9d5ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#4c2472" stopOpacity="0.9" />
            </linearGradient>

            <filter id="kolamGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Continuous Loop Curves 1 (Primary) */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#kolamGoldGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#kolamGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{
              pathLength: { duration: 3.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
              opacity: { duration: 1 },
            }}
          />

          {/* Symmetrical Mirrored Curves 2 (Rotated 90deg) */}
          <motion.g transform="rotate(90)">
            <motion.path
              d={pathD}
              fill="none"
              stroke="url(#kolamGoldGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#kolamGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                pathLength: { duration: 3.5, ease: "easeInOut", delay: 0.5, repeat: Infinity, repeatType: "reverse" },
              }}
            />
          </motion.g>

          {/* Symmetrical Mirrored Curves 3 (Rotated 45deg) */}
          <motion.g transform="rotate(45)" opacity="0.45">
            <motion.path
              d={pathD}
              fill="none"
              stroke="oklch(0.68 0.16 85)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                pathLength: { duration: 4.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
              }}
            />
          </motion.g>

          {/* 7x7 Dot Matrix (Pulli) */}
          {dots.map((dot, idx) => (
            <g key={idx}>
              <circle
                cx={dot.x}
                cy={dot.y}
                r="3.5"
                fill="oklch(0.92 0.03 85)"
                opacity="0.8"
              />
              <circle
                cx={dot.x}
                cy={dot.y}
                r="7"
                fill="none"
                stroke="oklch(0.68 0.16 85 / 0.4)"
                strokeWidth="1"
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
