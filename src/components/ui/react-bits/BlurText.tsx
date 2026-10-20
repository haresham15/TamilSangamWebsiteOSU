"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface BlurTextProps {
  text: string;
  className?: string;
  lang?: string;
  stagger?: number;
  delay?: number;
  as?: React.ElementType;
  animateBy?: "words" | "letters";
}

/**
 * BlurText Primitive (Inspired by reactbits.dev/text-animations/blur-text)
 * Tamil-safe whole-word blur-to-focus pull animation.
 * Enforces zero character-level splitting to strictly preserve Unicode vowel ligatures.
 */
export function BlurText({
  text,
  className = "",
  lang,
  stagger = 0.05,
  delay = 0.05,
  as: Component = "span",
}: BlurTextProps) {
  const shouldReduceMotion = useReducedMotion();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = Component as any;
  // Strictly split by whitespace only — NEVER by character codepoints!
  const words = text.split(/\s+/).filter(Boolean);

  if (shouldReduceMotion) {
    return (
      <Tag lang={lang} className={className} style={{ letterSpacing: lang === "ta" ? 0 : undefined }}>
        {text}
      </Tag>
    );
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      filter: "blur(8px)",
      opacity: 0,
      y: 10,
    },
    visible: {
      filter: "blur(0px)",
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <Tag lang={lang} className={className} style={{ letterSpacing: lang === "ta" ? 0 : undefined }}>
      <motion.span
        className="inline-block"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={wordVariants}
            className="inline-block mr-[0.3em] last:mr-0 will-change-[filter,opacity,transform]"
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
