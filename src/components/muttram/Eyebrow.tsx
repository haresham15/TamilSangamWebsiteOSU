import React from "react";

export interface EyebrowProps {
  children: React.ReactNode;
  /** Optional Tamil pairing shown after a ❖ separator. */
  tamil?: string;
  /** Surface the eyebrow sits on. Light = Royal Purple, dark = zari, peacock = lavender (color rule C3). */
  tone?: "light" | "dark" | "peacock";
  as?: "span" | "p" | "div";
  className?: string;
}

const TONE = {
  light: "text-brand-purple",
  dark: "text-accent-zari",
  peacock: "text-brand-lavender",
} as const;

/**
 * Eyebrow — the single section-label style. Warm editorial small caps, never terminal mono.
 * Tamil text keeps zero tracking and no case transform.
 */
export function Eyebrow({ children, tamil, tone = "light", as: Tag = "span", className = "" }: EyebrowProps) {
  return (
    <Tag className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${TONE[tone]} ${className}`.trim()}>
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em]">{children}</span>
      {tamil && (
        <>
          <span aria-hidden="true" className="text-[10px] opacity-60">
            ❖
          </span>
          <span lang="ta" className="font-tamil text-sm normal-case leading-[1.6] tracking-normal opacity-90">
            {tamil}
          </span>
        </>
      )}
    </Tag>
  );
}
