"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface SplitTextProps {
  text: string;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: React.ElementType;
  splitType?: string;
  effect?: string;
  mask?: boolean;
}

/**
 * SplitText Primitive (Inspired by reactbits.dev/text-animations/split-text)
 * Masked baseline rise entrance for English display headlines.
 */
export function SplitText({
  text,
  className = "",
  stagger = 0.04,
  delay = 0,
  as: Component = "span",
}: SplitTextProps) {
  const shouldReduceMotion = useReducedMotion();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = Component as any;
  const words = text.split(" ");

  if (shouldReduceMotion) {
    return <Tag className={className}>{text}</Tag>;
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
      y: "115%",
      opacity: 0,
    },
    visible: {
      y: "0%",
      opacity: 1,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <Tag className={className}>
      <motion.span
        className="inline-block"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden mr-[0.25em] last:mr-0 align-top leading-tight">
            <motion.span variants={wordVariants} className="inline-block">
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
