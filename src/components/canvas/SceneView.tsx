"use client";

import React, { ComponentProps, useEffect, useId, useState, useSyncExternalStore } from "react";
import { View } from "@react-three/drei";
import { SceneRegistrar } from "@/director/wireframe";
import { governor } from "@/engine/governor";
import { getRenderer, setSceneVisible, subscribeRenderer } from "@/engine/renderer";
import { isHeroCinematicEnabled, type HeroCinematicKey } from "@/config/heroCinematicFlags";
import { useRenderMode } from "@/components/providers/useRenderMode";
import { HERO_GRADE_PROFILES, type HeroGradeProfileName } from "@/gl/grade/gradeConfig";
import { GradePass, type GradeMode } from "@/gl/grade/GradePass";
import { supportsHdrTargets } from "@/gl/grade/gradeTargets";
import { useGradeLut } from "@/gl/grade/useGradeLut";

export interface SceneGrade {
  hero: HeroCinematicKey;
  profile: HeroGradeProfileName;
}

type SceneViewProps = ComponentProps<typeof View> & {
  /** Cinematic grade (LUT, bloom, vignette, grain). Off with ?grade=0 or ?cinematic_<hero>=0. */
  grade?: SceneGrade;
};

function gradeDisabledByUrl(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return new URLSearchParams(window.location.search).get("grade") === "0";
  } catch {
    return false;
  }
}

const hdrSnapshot = () => {
  const gl = getRenderer();
  return gl ? supportsHdrTargets(gl) : false;
};
const hdrServer = () => false;

export function SceneView({ children, index = 2, visible = true, grade, ...props }: SceneViewProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [intersecting, setIntersecting] = useState(true);
  const key = useId();
  const { mode: renderMode } = useRenderMode();
  const hdr = useSyncExternalStore(subscribeRenderer, hdrSnapshot, hdrServer);
  const gradeWanted = Boolean(grade) && renderMode !== "static" && isHeroCinematicEnabled(grade!.hero) && !gradeDisabledByUrl();
  const profile = grade ? HERO_GRADE_PROFILES[grade.profile] : null;
  const lut = useGradeLut(profile?.lutPath ?? "", profile?.lutSize ?? 33, gradeWanted && renderMode === "A");
  const gradeMode: GradeMode | null = !gradeWanted ? null : renderMode === "A" && hdr && lut ? "full" : "overlay";

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
      // In full grade mode GradePass renders the portal scene; drei keeps rect + events.
      visible={active && gradeMode !== "full"}
    >
      <SceneRegistrar />
      {children}
      {grade && gradeMode && (
        <GradePass element={element} active={active} mode={gradeMode} profile={grade.profile} lut={lut} index={index} />
      )}
    </View>
  );
}
