"use client";

import React from "react";

import { SplitText, BlurText } from "@/components/ui/react-bits";
import { Eyebrow } from "./Eyebrow";

export interface CourtyardHeaderProps {
  eyebrow?: string;
  title: string;
  tamilTitle?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
  dark?: boolean;
  /** Overrides `dark` when the header sits on the peacock band (lavender eyebrow). */
  tone?: "light" | "dark" | "peacock";
  /** id for the h2, so the parent section can use aria-labelledby. */
  titleId?: string;
}

export const CourtyardHeader: React.FC<CourtyardHeaderProps> = ({
  eyebrow,
  title,
  tamilTitle,
  description,
  align = "left",
  className = "",
  action,
  dark = false,
  tone,
  titleId,
}) => {
  const resolvedTone = tone ?? (dark ? "dark" : "light");
  const onDark = resolvedTone !== "light";
  const isCenter = align === "center";
  const showEyebrow = Boolean(eyebrow);

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
            <Eyebrow tone={resolvedTone}>{eyebrow}</Eyebrow>
          )}

          <div className="space-y-1">
            <h2 id={titleId} className={`text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-[1.12] ${onDark ? "text-ink-alabaster" : "text-ink-earth"}`}>
              <SplitText text={title} splitType="words" effect="rise" mask />
            </h2>

            {tamilTitle && (
              <p
                lang="ta"
                className={`font-tamil text-lg sm:text-2xl font-light leading-[1.6] ${onDark ? "text-ink-sand" : "text-brand-purple"}`}
              >
                <BlurText text={tamilTitle} animateBy="words" />
              </p>
            )}
          </div>

          {description && (
            <p
              className={`font-sans text-base sm:text-lg leading-relaxed max-w-2xl pt-2 ${onDark ? "text-ink-sand" : "text-ink-umber"} ${
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
