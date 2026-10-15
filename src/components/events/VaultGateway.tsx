"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

interface VaultGatewayProps {
  googlePhotosUrl?: string;
  totalPhotosCount?: number;
}

/**
 * ReactBits Magnetic Vault Door Gateway (§Phase 3).
 * Full-width naked typography gateway to the 300+ photo archive.
 * Zero cards, zero drop-shadows, pure typography on Warm Ivory (#FAF9F6).
 * Magnetic proximity wrapper attracts the title toward the cursor and shifts color to Terracotta Earth (#B85C38).
 */
export function VaultGateway({
  googlePhotosUrl = "https://photos.app.goo.gl/XUS5MJz4vFRSefJa7",
  totalPhotosCount = 300,
}: VaultGatewayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth magnetic pull
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Underdamped spring physics (k = 150, c = 15) matching DTCG motion spec
  const springConfig = { stiffness: 150, damping: 15, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Disable on touch devices
      if (e.pointerType === "touch") return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      // Proximity threshold: activates within 220px of center
      const threshold = Math.max(rect.width / 2 + 80, 220);

      if (dist < threshold) {
        // Target offset clamped to 24px
        const pull = 0.22;
        const clampedX = Math.max(-28, Math.min(28, dx * pull));
        const clampedY = Math.max(-24, Math.min(24, dy * pull));
        mouseX.set(clampedX);
        mouseY.set(clampedY);
        setIsHovered(true);
      } else {
        mouseX.set(0);
        mouseY.set(0);
        setIsHovered(false);
      }
    };

    const handlePointerLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
      setIsHovered(false);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <footer className="w-full mt-32 mb-28 border-t border-[#2A2825]/10 pt-20 pb-12 text-center select-none">
      <div ref={containerRef} className="max-w-4xl mx-auto px-6 inline-flex flex-col items-center">
        {/* Subtext: Small, Sans-Serif, Tracking-Widest */}
        <p className="text-[11px] sm:text-xs font-sans font-semibold uppercase tracking-[0.28em] text-[#57524C] mb-4">
          EXPLORE THE RAW ARCHIVE ({totalPhotosCount}+ FULL-RESOLUTION PHOTOGRAPHS)
        </p>

        {/* Magnetic Proximity Interactive Anchor */}
        <motion.div
          style={{ x: smoothX, y: smoothY }}
          className="relative inline-block cursor-pointer"
        >
          <a
            href={googlePhotosUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open full event photo album in Google Photos"
            className="group block focus-visible:outline-2 focus-visible:outline-[#B85C38] focus-visible:outline-offset-8"
          >
            <h2
              className={`text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight transition-colors duration-500 ease-out ${
                isHovered ? "text-[#B85C38]" : "text-[#2A2825]"
              }`}
            >
              Open the Google Photos Vault{" "}
              <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2">
                ↗
              </span>
            </h2>
          </a>
        </motion.div>

        {/* Colophon Footnote */}
        <p className="mt-8 text-xs font-mono text-[#57524C]/60 tracking-wider">
          CURATED MUTTRAM ARCHIVE // COLUMBUS, OH
        </p>
      </div>
    </footer>
  );
}

export default VaultGateway;
