"use client";

import React, { useMemo } from "react";
import { motion, type Variants } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
}

/**
 * ReactBits SplitText kinematic component.
 * Mimics physical letterpress printing of a magazine header.
 * Uses Intl.Segmenter to preserve Tamil grapheme clusters and diacritics.
 */
export function SplitText({
  text,
  className = "",
  delay = 0.05,
  duration = 0.55,
  stagger = 0.025,
}: SplitTextProps) {
  // Split text into grapheme clusters safely (preserving Tamil vowel signs & pulli)
  const letters = useMemo(() => {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      return Array.from(segmenter.segment(text), (s) => s.segment);
    }
    return Array.from(text);
  }, [text]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 40,
      rotateX: -45,
      filter: "blur(2px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1], // Custom magazine mechanical settling ease
      },
    },
  };

  return (
    <motion.span
      className={`inline-block overflow-hidden ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ perspective: 1000 }}
    >
      {letters.map((char, index) => {
        // Render whitespace without breaking word boundaries
        if (char === " ") {
          return (
            <span key={index} className="inline-block">
              &nbsp;
            </span>
          );
        }

        return (
          <motion.span
            key={index}
            variants={letterVariants}
            className="inline-block transform-gpu will-change-transform"
            style={{ transformOrigin: "bottom center" }}
          >
            {char}
          </motion.span>
        );
      })}
    </motion.span>
  );
}

export default SplitText;
