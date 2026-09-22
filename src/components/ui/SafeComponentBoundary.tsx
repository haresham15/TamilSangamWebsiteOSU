"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  fallback?: ReactNode;
  name?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * SafeComponentBoundary provides defensive fault isolation for dynamic,
 * 3D, canvas, and generative components, ensuring that individual subcomponent
 * crashes never take down the entire page.
 */
export class SafeComponentBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[SafeComponentBoundary: ${this.props.name || "Anonymous"}] caught an error:`,
      error,
      errorInfo
    );
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 border-2 border-amber-500/30 bg-[#160d26] text-slate-300 text-xs font-mono my-2 shadow-[3px_3px_0px_#f59e0b]">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
              <span className="w-2 h-2 bg-amber-400 animate-pulse border border-amber-300" />
              <span>{this.props.name ? `${this.props.name} Unavailable` : "Component Unavailable"}</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              This component encountered an error and was safely isolated to protect application integrity.
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
