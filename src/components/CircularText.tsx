'use client';

import React, { useId } from 'react';
import { motion } from 'framer-motion';

export interface CircularTextProps {
  text: string;
  spinDuration?: number;
  onHover?: 'slowDown' | 'speedUp' | 'pause';
  className?: string;
  letterClassName?: string;
}

export const CircularText: React.FC<CircularTextProps> = ({
  text,
  spinDuration = 24,
  onHover = 'slowDown',
  className = '',
  letterClassName = '',
}) => {
  const rawId = useId();
  const pathId = `circle-path-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none origin-center ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        rotate: {
          repeat: Infinity,
          duration: spinDuration,
          ease: 'linear',
        },
        scale: {
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1],
        },
      }}
      whileHover={
        onHover === 'slowDown'
          ? { scale: 1.04 }
          : onHover === 'speedUp'
            ? { scale: 1.08 }
            : undefined
      }
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <path
            id={pathId}
            d="M 100, 100 m -74, 0 a 74,74 0 1,1 148,0 a 74,74 0 1,1 -148,0"
          />
        </defs>
        <text
          className={`fill-current text-[11px] font-mono uppercase tracking-[0.22em] ${letterClassName}`}
        >
          <textPath
            href={`#${pathId}`}
            startOffset="0%"
            textLength="465"
            lengthAdjust="spacing"
          >
            {text}
          </textPath>
        </text>
      </svg>
    </motion.div>
  );
};

export default CircularText;
