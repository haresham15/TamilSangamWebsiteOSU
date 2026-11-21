"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export interface PathirikaiFormFrameProps {
  titleEn: string;
  titleTa?: string;
  formUrl: string;
  embedSrc: string;
  minHeight?: string;
  className?: string;
}

/**
 * PathirikaiFormFrame Primitive (PRD §6.3)
 * Culturally grounded frame for embedded Google Forms:
 * - A white card that sits on warm ivory/sandstone bands.
 * - A sangam-deep header bar with a zari title and an "Open in new tab" link.
 * - A warm sandstone shimmer skeleton (form-field silhouettes) until the iframe loads,
 *   so the embed never shows as an empty dark box.
 */
export function PathirikaiFormFrame({
  titleEn,
  titleTa,
  formUrl,
  embedSrc,
  minHeight = "680px",
  className = "",
}: PathirikaiFormFrameProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      data-pathirikai-form-frame="true"
      className={`w-full overflow-hidden rounded-2xl border border-border-warm bg-surface-card-light shadow-[0_16px_48px_rgba(91,44,134,0.09)] ${className}`.trim()}
    >
      {/* Header bar: sangam-deep with zari title */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-accent-zari/30 bg-bg-sangam-deep px-5 py-3 sm:px-6">
        <h3 className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 py-1 font-serif text-sm font-normal text-accent-zari sm:text-base">
          <span>{titleEn}</span>
          {titleTa && (
            <span lang="ta" className="font-tamil text-sm leading-[1.6] tracking-normal text-ink-sand">
              {titleTa}
            </span>
          )}
        </h3>

        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-full px-2 font-sans text-sm font-semibold text-brand-teal-dark underline-offset-4 transition-colors hover:text-brand-teal-hover-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-dark"
        >
          <span>Open in new tab</span>
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>

      {/* Frame container with sandstone shimmer skeleton */}
      <div className="relative w-full overflow-hidden bg-bg-ivory" style={{ minHeight }}>
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col gap-6 p-6 sm:p-10" role="status" aria-live="polite">
            <span className="sr-only">Loading the registration form…</span>
            <div aria-hidden="true" className="space-y-3">
              <div className="shimmer-sandstone h-7 w-2/3 rounded-md" />
              <div className="shimmer-sandstone h-3.5 w-11/12 rounded" />
              <div className="shimmer-sandstone h-3.5 w-4/5 rounded" />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} aria-hidden="true" className="space-y-3 border-t border-border-warm pt-6">
                <div className="shimmer-sandstone h-4 w-2/5 rounded" />
                <div className="shimmer-sandstone h-10 w-full rounded-lg" />
              </div>
            ))}
            <p aria-hidden="true" className="font-sans text-xs text-ink-umber">
              Loading the Google Form…
            </p>
          </div>
        )}

        <iframe
          src={embedSrc}
          title={titleEn}
          className="h-full w-full border-0 transition-opacity duration-300"
          style={{ minHeight, opacity: isLoaded ? 1 : 0 }}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        >
          Loading registration form...
        </iframe>
      </div>
    </div>
  );
}
