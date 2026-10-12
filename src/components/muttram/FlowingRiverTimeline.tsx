"use client";

import React from "react";
import { motion } from "framer-motion";

export interface TimelineMilestone {
  year: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
}

export interface FlowingRiverTimelineProps {
  milestones: TimelineMilestone[];
  locale?: string;
}

export const FlowingRiverTimeline: React.FC<FlowingRiverTimelineProps> = ({
  milestones,
  locale = "en",
}) => {
  return (
    <div className="relative w-full max-w-5xl mx-auto py-12 select-none">
      {/* Central River Spine (Curving SVG River) */}
      <div
        aria-hidden="true"
        className="absolute left-6 md:left-1/2 top-0 bottom-0 -translate-x-1/2 w-8 pointer-events-none overflow-hidden"
      >
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 32 1000"
          fill="none"
        >
          {/* River Water Gradient Line */}
          <path
            d="M16,0 Q24,150 16,300 T16,600 T16,900 T16,1000"
            stroke="url(#river-gradient)"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="opacity-70"
          />
          <path
            d="M16,0 Q8,150 16,300 T16,600 T16,900 T16,1000"
            stroke="url(#river-gradient)"
            strokeWidth="1.5"
            className="opacity-40"
          />
          <defs>
            <linearGradient id="river-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E5A93C" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#B85C38" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E5A93C" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Milestones Flowing Loosely Along the River */}
      <div className="space-y-20 md:space-y-32">
        {milestones.map((item, idx) => {
          const isLeft = idx % 2 === 0;

          return (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col md:flex-row items-start ${
                isLeft ? "md:flex-row" : "md:flex-row-reverse"
              } gap-8 md:gap-16`}
            >
              {/* Stepping Stone River Node (Center on md+, left on mobile) */}
              <div className="absolute left-6 md:left-1/2 top-4 -translate-x-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-[#FAF9F6] border-2 border-[#B85C38] shadow-md shadow-stone-900/10 z-10">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93C]" />
              </div>

              {/* Content Block (Unbound by boxes) */}
              <div
                className={`w-full md:w-[calc(50%-3rem)] pl-16 md:pl-0 ${
                  isLeft ? "md:text-right md:pr-4" : "md:text-left md:pl-4"
                }`}
              >
                {/* Year Typography */}
                <div className="mb-2">
                  <span className="text-5xl sm:text-7xl font-serif font-light text-[#B85C38] tracking-tight block">
                    {item.year}
                  </span>
                  <span
                    lang="ta"
                    className="font-tamil text-sm text-[#E5A93C] font-medium tracking-wide block"
                  >
                    {item.titleTa}
                  </span>
                </div>

                {/* Milestone Title */}
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#2A2825] leading-snug mb-3">
                  {item.titleEn}
                </h3>

                {/* Story Description */}
                <p className="font-sans text-base sm:text-lg text-[#57524C] leading-relaxed">
                  {locale === "ta" ? item.descriptionTa : item.descriptionEn}
                </p>
              </div>

              {/* Spacer for Alternate Side on Desktop */}
              <div className="hidden md:block md:w-[calc(50%-3rem)]" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
