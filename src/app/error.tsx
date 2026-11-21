"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, Mail } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected errors for diagnostic purposes
    console.error("[Sangam ErrorBoundary Caught]:", error);
  }, [error]);

  return (
    <div className="relative w-full min-h-[80vh] flex items-center justify-center px-4 sm:px-6 pt-32 pb-20 text-left font-body overflow-hidden">
      <div className="relative z-10 w-full max-w-2xl">
        {/* Card */}
        <div className="relative p-8 sm:p-12 rounded-2xl bg-surface-card-dark/95 backdrop-blur-md border border-accent-bronze-dark/30 shadow-2xl overflow-hidden">
          {/* Subtle Courtyard Radial Bloom */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(ellipse_at_top_right,rgba(199,147,71,0.08),transparent_70%)] pointer-events-none" />

          <div className="space-y-4 max-w-lg">
            <span className="text-xs font-sans uppercase tracking-[0.14em] text-accent-zari block font-semibold">
              DIAGNOSTIC NOTICE
            </span>
            <h1 className="text-2xl sm:text-3xl font-normal text-ink-alabaster font-serif tracking-tight">
              Something unexpected occurred
            </h1>
            <p className="text-sm text-ink-sand leading-relaxed font-body">
              An unexpected render or network glitch occurred while loading this view. You can reload this component, return to the main courtyard, or alert the executive board if the issue persists.
            </p>
            {error.digest && (
              <div className="p-3 rounded-xl bg-bg-sangam-deep border border-border-zari-muted text-[11px] font-mono text-ink-sand">
                Diagnostic ID: <span className="font-bold text-accent-zari">{error.digest}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-border-zari-muted flex flex-wrap items-center gap-3">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-brand-teal text-ink-alabaster hover:bg-brand-teal-hover font-sans text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-accent-bronze-dark/35 bg-bg-sangam-deep text-ink-alabaster hover:bg-surface-card-dark hover:border-accent-zari/50 text-xs font-sans font-medium uppercase tracking-[0.14em] flex items-center gap-2 transition-colors font-semibold"
            >
              <Home className="w-3.5 h-3.5 text-brand-teal-dark" />
              <span>Return Home</span>
            </Link>

            <a
              href="mailto:osutamilsangam@gmail.com?subject=Website%20Issue%20Report"
              className="px-4 py-2.5 rounded-xl text-xs font-sans text-ink-sand hover:text-accent-zari flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Report to Board</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
