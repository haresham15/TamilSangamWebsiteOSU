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
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-slate-300 text-xs font-mono my-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
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
