"use client";

import React, { ComponentProps, useEffect, useId, useRef, useState } from "react";
import { View } from "@react-three/drei";
import { SceneRegistrar } from "@/director/wireframe";
import { governor } from "@/engine/governor";
import { setSceneVisible } from "@/engine/renderer";

export function SceneView({ children, index = 2, visible = true, ...props }: ComponentProps<typeof View>) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [intersecting, setIntersecting] = useState(true);
  const key = useId();
  useEffect(() => {
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.rootBounds && entry.target.isConnected) {
        const r = entry.target.getBoundingClientRect();
        const isIn = r.width > 0 && r.height > 0 && r.bottom > -200 && r.top < window.innerHeight + 200;
        setIntersecting(isIn);
        return;
      }
      if (!entry.isIntersecting && entry.target.isConnected) {
        const r = entry.target.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.bottom > -200 && r.top < window.innerHeight + 200) {
          setIntersecting(true);
          return;
        }
      }
      setIntersecting(entry.isIntersecting);
    }, { rootMargin: "200px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, visible]);
  const active = visible && intersecting;
  useEffect(() => {
    setSceneVisible(key, active);
    governor.request(key, active ? 2 : 0);
    return () => { governor.request(key, 0); setSceneVisible(key, false); };
  }, [active, key]);
  return (
    <View
      index={index}
      {...props}
      ref={(node) => {
        if (typeof HTMLElement !== "undefined" && node instanceof HTMLElement) {
          setElement(node);
        } else if (!node) {
          setElement(null);
        }
      }}
      visible={active}
    >
      <SceneRegistrar />
      {children}
    </View>
  );
}
