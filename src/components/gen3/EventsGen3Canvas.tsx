"use client";

// Events hero shell. Static mode (reduced motion, Lite, Tier C) and any failure of the 3D
// scene show a rendered still instead. The live scene is a separate chunk, so the static
// path downloads no three.js scene code, model or textures.
import React, { Component, type ErrorInfo, type ReactNode, useCallback, useEffect, useState } from "react";
import { useRenderMode } from "@/components/providers/useRenderMode";

const EventsHeroView = React.lazy(() => import("./EventsHeroView"));

/** Rendered from the art-pass scene at the hero beat (performer against the backlight). */
function EventsHeroPoster() {
  // English alt only: a Tamil alt needs the Tamil review (docs/redesign/tamil-review.md).
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/events/events-hero-poster.webp"
      alt="A concert in a steel factory hall: a performer in silhouette on a riveted stage against a blazing amber backlight, spark fountains on the deck, and a crowd holding up phone lights"
      className="absolute inset-0 h-full w-full object-cover"
      width={1600}
      height={900}
      decoding="async"
    />
  );
}

/** DOM-side boundary: chunk load failures and anything thrown outside the View tree. */
class ShellErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[EventsHero] hero failed, showing the static poster:", error, info.componentStack);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function EventsGen3Canvas({ progressRef }: { progressRef: React.RefObject<number> }) {
  const { mode } = useRenderMode();
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  const showPoster = mode === "static" || failed;

  // Dev/test hook for deterministic captures (poster render, QA beats).
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || typeof window === "undefined") return;
    const w = window as unknown as { __eventsHero?: { setProgress: (p: number) => void } };
    w.__eventsHero = {
      setProgress: (p: number) => {
        (progressRef as React.MutableRefObject<number>).current = Math.min(Math.max(p, 0), 1);
      },
    };
    return () => {
      delete w.__eventsHero;
    };
  }, [progressRef]);

  return (
    <div className="w-full h-full min-h-[100dvh] absolute top-0 left-0 bg-transparent pointer-events-none">
      {showPoster ? (
        <EventsHeroPoster />
      ) : (
        <ShellErrorBoundary onError={onError}>
          <React.Suspense fallback={null}>
            <EventsHeroView progressRef={progressRef} onError={onError} />
          </React.Suspense>
        </ShellErrorBoundary>
      )}
      {/* Vignette over the scene so the page copy holds at the edges. */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: "radial-gradient(circle at center, transparent 40%, rgba(12,10,8,0.76) 100%)",
        }}
      />
    </div>
  );
}
