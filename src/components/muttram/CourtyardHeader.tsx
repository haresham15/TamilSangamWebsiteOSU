"use client";

import React from "react";

import { SplitText, BlurText } from "@/components/ui/react-bits";

export interface CourtyardHeaderProps {
  eyebrow?: string;
  title: string;
  tamilTitle?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
}

export const CourtyardHeader: React.FC<CourtyardHeaderProps> = ({
  eyebrow,
  title,
  tamilTitle,
  description,
  align = "left",
  className = "",
  action,
}) => {
  const isCenter = align === "center";
  // Enforce strict 2-Element Header Rule: suppress eyebrow if Tamil subtitle exists
  const showEyebrow = Boolean(eyebrow && !tamilTitle);

  return (
    <div
      className={`relative z-10 w-full mb-12 sm:mb-16 ${
        isCenter ? "text-center max-w-3xl mx-auto" : "text-left"
      } ${className}`}
    >
      <div
        className={`flex flex-col ${
          isCenter
            ? "items-center"
            : "sm:flex-row sm:items-end sm:justify-between gap-6"
        }`}
      >
        <div className="space-y-3">
          {showEyebrow && (
            <span className="font-sans text-xs tracking-widest uppercase font-semibold text-[#B85C38] block">
              {eyebrow}
            </span>
          )}

          <div className="space-y-1">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#2A2825] tracking-tight leading-[1.12]">
              <SplitText text={title} splitType="words" effect="rise" mask />
            </h2>

            {tamilTitle && (
              <p
                lang="ta"
                className="font-tamil text-lg sm:text-2xl text-[#2A2825]/60 font-light"
              >
                <BlurText text={tamilTitle} animateBy="words" />
              </p>
            )}
          </div>

          {description && (
            <p
              className={`font-sans text-base sm:text-lg text-[#57524C] leading-relaxed max-w-2xl pt-2 ${
                isCenter ? "mx-auto" : ""
              }`}
            >
              {description}
            </p>
          )}
        </div>

        {action && <div className="shrink-0 mt-6 sm:mt-0">{action}</div>}
      </div>
    </div>
  );
};
