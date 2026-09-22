"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react";

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
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 sm:px-6 pt-32 pb-20 text-left font-body">
      <div className="w-full max-w-2xl">
        {/* Decorative Alert Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border-2 border-red-400 text-red-300 font-mono text-xs uppercase font-bold tracking-wider mb-6 shadow-[2px_2px_0px_#ef4444]">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Application State Alert</span>
        </div>

        {/* Card */}
        <div className="p-8 sm:p-12 bg-white border-2 border-[#250d38] shadow-[8px_8px_0px_#250d38] relative overflow-hidden">
          <div className="space-y-4 max-w-lg">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#250d38] font-display tracking-tight">
              Something unexpected occurred
            </h1>
            <p className="text-sm text-purple-950/80 leading-relaxed font-body">
              An unexpected render or network glitch occurred while loading this view. You can reload this component, return to the main dashboard, or alert the executive board if the issue persists.
            </p>
            {error.digest && (
              <div className="p-2.5 bg-[#faf8f5] border border-purple-200 text-[11px] font-mono text-purple-800">
                Diagnostic ID: <span className="font-bold">{error.digest}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t-2 border-purple-100 flex flex-wrap items-center gap-3">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-[#250d38] text-white border-2 border-[#55CCA2] shadow-[3px_3px_0px_#55CCA2] hover:shadow-[4px_4px_0px_#55CCA2] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#55CCA2]" />
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="px-5 py-2.5 border-2 border-[#250d38] bg-[#faf8f5] text-[#250d38] hover:bg-emerald-50 hover:border-[#55CCA2] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-[#250d38]" />
              <span>Return Home</span>
            </Link>

            <a
              href="mailto:osutamilsangam@gmail.com?subject=Website%20Issue%20Report"
              className="px-4 py-2.5 text-xs font-mono text-purple-900/70 hover:text-[#250d38] flex items-center gap-1.5 transition-colors"
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
