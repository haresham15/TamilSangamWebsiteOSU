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
        <div className="relative p-8 sm:p-12 rounded-2xl bg-[#271A3C]/95 backdrop-blur-md border border-[rgba(212,163,106,0.3)] shadow-2xl overflow-hidden">
          {/* Subtle Courtyard Radial Bloom */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(ellipse_at_top_right,rgba(199,147,71,0.08),transparent_70%)] pointer-events-none" />

          <div className="space-y-4 max-w-lg">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C79347] block font-semibold">
              DIAGNOSTIC NOTICE
            </span>
            <h1 className="text-2xl sm:text-3xl font-normal text-[#FAF5ED] font-serif tracking-tight">
              Something unexpected occurred
            </h1>
            <p className="text-sm text-[#CBBBA8] leading-relaxed font-body">
              An unexpected render or network glitch occurred while loading this view. You can reload this component, return to the main courtyard, or alert the executive board if the issue persists.
            </p>
            {error.digest && (
              <div className="p-3 rounded-xl bg-[#1C122B] border border-[rgba(212,163,106,0.25)] text-[11px] font-mono text-[#CBBBA8]">
                Diagnostic ID: <span className="font-bold text-[#C79347]">{error.digest}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-[rgba(212,163,106,0.25)] flex flex-wrap items-center gap-3">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-[#0F766E] text-[#FAF5ED] hover:bg-[#0B5C56] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-[rgba(212,163,106,0.35)] bg-[#1C122B] text-[#FAF5ED] hover:bg-[#25173B] hover:border-[#C79347]/50 text-xs font-mono font-medium uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-[#2BB5A8]" />
              <span>Return Home</span>
            </Link>

            <a
              href="mailto:osutamilsangam@gmail.com?subject=Website%20Issue%20Report"
              className="px-4 py-2.5 rounded-xl text-xs font-mono text-[#CBBBA8] hover:text-[#C79347] flex items-center gap-1.5 transition-colors"
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
