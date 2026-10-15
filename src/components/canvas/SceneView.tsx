"use client";

import React, { ComponentProps, useEffect, useId, useRef, useState } from "react";
import { View } from "@react-three/drei";
import { SceneRegistrar } from "@/director/wireframe";
import { governor } from "@/engine/governor";
import { setSceneVisible } from "@/engine/renderer";

export function SceneView({ children, index = 2, visible = true, ...props }: ComponentProps<typeof View>) {
  const element = useRef<HTMLElement>(null);
  const [intersecting, setIntersecting] = useState(false);
  const key = useId();
  useEffect(() => {
    if (!element.current) return;
    const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting), { rootMargin: "200px 0px" });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, []);
  const active = visible && intersecting;
  useEffect(() => {
    setSceneVisible(key, active);
    governor.request(key, active ? 2 : 0);
    return () => { governor.request(key, 0); setSceneVisible(key, false); };
  }, [active, key]);
  return (
    <View index={index} {...props} ref={element} visible={active}>
      <SceneRegistrar />
      {children}
    </View>
  );
}
