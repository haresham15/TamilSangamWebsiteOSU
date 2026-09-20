"use client";

import React, { useRef, useEffect, useState } from "react";
import { useTinai } from "@/context/TinaiContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { Sparkles } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
}

export const YaliParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { meta } = useTinai();
  const { isLiteMode } = useLiteMode();
  const [isMorphedToTamil, setIsMorphedToTamil] = useState(false);

  useEffect(() => {
    if (isLiteMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.clientWidth);
    let height = (canvas.height = canvas.clientHeight);

    const particleCount = 140;
    const particles: Particle[] = [];

    // Initialize particles in Yali/Mascot creature cloud
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 80;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;

      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        originX: x,
        originY: y,
        targetX: x,
        targetY: y,
        color: Math.random() > 0.4 ? meta.accentColor : "#f3e7d3",
        size: Math.random() * 2.5 + 1.2,
      });
    }

    // Coordinates approximating the Tamil script "தமிழ்"
    const generateTamilGlyphTargets = () => {
      const targets: { x: number; y: number }[] = [];
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) / 360;

      // Character 1: த (Ta)
      for (let x = -80; x <= -20; x += 6) targets.push({ x: cx + x * scale, y: cy - 40 * scale });
      for (let y = -40; y <= 30; y += 6) targets.push({ x: cx - 50 * scale, y: cy + y * scale });
      for (let x = -50; x <= -10; x += 6) targets.push({ x: cx + x * scale, y: cy + 30 * scale });

      // Character 2: மி (Mi)
      for (let y = -40; y <= 30; y += 6) targets.push({ x: cx * scale, y: cy + y * scale });
      for (let x = -10; x <= 20; x += 6) targets.push({ x: cx + x * scale, y: cy - 40 * scale });
      for (let a = 0; a <= Math.PI; a += 0.3) {
        targets.push({ x: cx + (10 + Math.cos(a) * 15) * scale, y: cy + (-40 - Math.sin(a) * 15) * scale });
      }

      // Character 3: ழ் (Zh)
      for (let y = -40; y <= 30; y += 6) targets.push({ x: cx + 45 * scale, y: cy + y * scale });
      for (let x = 45; x <= 85; x += 6) targets.push({ x: cx + x * scale, y: cy + 30 * scale });
      for (let y = 0; y <= 30; y += 6) targets.push({ x: cx + 85 * scale, y: cy + y * scale });
      targets.push({ x: cx + 45 * scale, y: cy - 55 * scale }); // pulli

      return targets;
    };

    const tamilTargets = generateTamilGlyphTargets();

    // Mouse tracking
    const mouse = { x: width / 2, y: height / 2, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, i) => {
        if (isMorphedToTamil) {
          // Morph to Tamil Target
          const target = tamilTargets[i % tamilTargets.length];
          p.x += (target.x - p.x) * 0.08;
          p.y += (target.y - p.y) * 0.08;
        } else {
          // Yali Creature Swarm following cursor
          const targetCenterX = mouse.active ? mouse.x : width / 2;
          const targetCenterY = mouse.active ? mouse.y : height / 2;

          // Organic sway
          p.x += p.vx;
          p.y += p.vy;

          // Pull towards swarm center
          const dx = targetCenterX - p.x;
          const dy = targetCenterY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 80) {
            p.vx += (dx / dist) * 0.06;
            p.vy += (dy / dist) * 0.06;
          }

          // Damping
          p.vx *= 0.96;
          p.vy *= 0.96;
        }

        // Render particle with soft glowing aura
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = meta.accentColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Connect close particles with subtle energy filament lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 32) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(242, 183, 5, ${1 - dist / 32})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isLiteMode, isMorphedToTamil, meta.accentColor]);

  if (isLiteMode) return null;

  return (
    <div className="relative w-full h-44 sm:h-52 flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        onClick={() => setIsMorphedToTamil(!isMorphedToTamil)}
        className="w-full h-full cursor-pointer"
        title="Click to morph particles into 'தமிழ்'"
      />
      <button
        onClick={() => setIsMorphedToTamil(!isMorphedToTamil)}
        className="absolute bottom-2 px-3 py-1 rounded-full text-[11px] font-mono glass-panel border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 shadow-md"
      >
        <Sparkles className="w-3 h-3 text-[var(--accent-tint)]" />
        <span>{isMorphedToTamil ? "Mascot Cloud" : "Morph to தமிழ்"}</span>
      </button>
    </div>
  );
};
