// src/components/gl/planes/ImageGridView.tsx
"use client";

import React, { useRef, useEffect, useState, useSyncExternalStore } from "react";
import { View, OrthographicCamera } from "@react-three/drei";
import { useTierContext } from "@/components/providers/TierProvider";
import {
  getActivePlanes,
  subscribePlanes,
  registerPlane,
  unregisterPlane,
  updatePlaneRect,
  setPlaneHover,
  PlaneEntry,
} from "./registry";
import { DomPlane } from "./DomPlane";

interface ImageGridViewProps {
  children: React.ReactNode;
  className?: string;
  itemSelector?: string;
  imgSelector?: string;
  radius?: number;
}

function PlanesScene({ viewRef }: { viewRef: React.RefObject<HTMLDivElement | null> }) {
  const planes = useSyncExternalStore(subscribePlanes, getActivePlanes);
  const [viewRect, setViewRect] = useState<DOMRectReadOnly | null>(null);

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      setViewRect(entry.contentRect);
    });
    ro.observe(el);
    setViewRect(el.getBoundingClientRect());

    return () => ro.disconnect();
  }, [viewRef]);

  if (!viewRect || viewRect.width === 0 || viewRect.height === 0) {
    return null;
  }

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 100]}
        left={-viewRect.width / 2}
        right={viewRect.width / 2}
        top={viewRect.height / 2}
        bottom={-viewRect.height / 2}
        near={0.1}
        far={1000}
        manual
      />
      {planes.map((entry) => (
        <DomPlane key={entry.id} entry={entry} viewRect={viewRect} />
      ))}
    </>
  );
}

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function ImageGridView({
  children,
  className = "",
  itemSelector = "[data-plane-item]",
  imgSelector = "img",
  radius = 8,
}: ImageGridViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tier } = useTierContext();
  const isMounted = useIsClient();

  useEffect(() => {
    // Only mount WebGL planes on flagship Tier A devices (§9.1)
    if (tier !== "A" || typeof window === "undefined") return;

    const container = containerRef.current;
    if (!container) return;

    const observedItems = new Map<HTMLElement, () => void>();

    // IntersectionObserver with 200px rootMargin to pre-load approaching planes (§9.1)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const itemEl = entry.target as HTMLElement;
          const imgEl = itemEl.querySelector<HTMLImageElement>(imgSelector);
          const id = itemEl.getAttribute("data-plane-id") || imgEl?.src || "";

          if (!id || !imgEl) return;

          if (entry.isIntersecting) {
            const rect = itemEl.getBoundingClientRect();
            const planeEntry: PlaneEntry = {
              id,
              containerEl: itemEl,
              imgEl,
              rect,
              src: imgEl.currentSrc || imgEl.src,
              radius,
              hover: 0,
              targetHover: 0,
              mouse: [0.5, 0.5],
              targetMouse: [0.5, 0.5],
              textureBytes: 0,
              ready: false,
            };
            registerPlane(planeEntry);
          } else {
            unregisterPlane(id);
          }
        });
      },
      { rootMargin: "200px" }
    );

    // ResizeObserver for accurate rect caching (§9.1)
    const ro = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const itemEl = entry.target as HTMLElement;
        const id = itemEl.getAttribute("data-plane-id");
        if (id) {
          updatePlaneRect(id, entry.contentRect);
        }
      });
    });

    const scanAndObserve = () => {
      const currentItems = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
      currentItems.forEach((item, index) => {
        if (observedItems.has(item)) return;

        const id = item.getAttribute("data-plane-id") || `plane-${index}`;
        item.setAttribute("data-plane-id", id);

        observer.observe(item);
        ro.observe(item);

        const handlePointerMove = (e: PointerEvent) => {
          if (e.pointerType === "touch") return;
          const rect = item.getBoundingClientRect();
          const u = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
          setPlaneHover(id, 1, [u, v]);
        };

        const handlePointerLeave = () => {
          setPlaneHover(id, 0);
        };

        item.addEventListener("pointermove", handlePointerMove, { passive: true });
        item.addEventListener("pointerleave", handlePointerLeave, { passive: true });

        observedItems.set(item, () => {
          observer.unobserve(item);
          ro.unobserve(item);
          item.removeEventListener("pointermove", handlePointerMove);
          item.removeEventListener("pointerleave", handlePointerLeave);
          unregisterPlane(id);
        });
      });
    };

    scanAndObserve();

    const mo = new MutationObserver(scanAndObserve);
    mo.observe(container, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      observer.disconnect();
      ro.disconnect();
      observedItems.forEach((cleanup) => cleanup());
      observedItems.clear();
    };
  }, [tier, itemSelector, imgSelector, radius]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}

      {/* Persistent Drei View overlay mapped to grid container (Tier A only) (§9.1) */}
      {isMounted && tier === "A" && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <View className="w-full h-full pointer-events-auto">
            <PlanesScene viewRef={containerRef} />
          </View>
        </div>
      )}
    </div>
  );
}

export default ImageGridView;
