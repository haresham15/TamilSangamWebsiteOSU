// src/gl/grade/GradePass.tsx
"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HERO_GRADE_PROFILES, type HeroGradeProfileName } from "./gradeConfig";
import { GradeRig, type ViewportRect } from "./gradeTargets";
import { bloomMipsFor, qualityGovernor, renderScaleFor, type QualityLevel } from "@/engine/qualityGovernor";

export type GradeMode = "full" | "overlay";

interface GradePassProps {
  /** The SceneView's tracked DOM element. */
  element: HTMLElement | null;
  active: boolean;
  mode: GradeMode;
  profile: HeroGradeProfileName;
  lut: THREE.Texture | null;
  /** The drei View index; full mode replaces drei's render at the same priority. */
  index: number;
}

const view: ViewportRect = { left: 0, bottom: 0, width: 0, height: 0 };
const tintColor = new THREE.Color();

/**
 * Mounted inside a SceneView portal. In "full" mode drei's own render is disabled
 * (visible=false keeps rect tracking + pointer events) and this pass renders the
 * portal scene through GradeRig. In "overlay" mode drei renders as usual and this
 * draws the vignette on top (Tier B).
 */
export function GradePass({ element, active, mode, profile, lut, index }: GradePassProps) {
  const rig = useMemo(() => new GradeRig(), []);
  useEffect(() => () => rig.dispose(), [rig]);
  const quality = useSyncExternalStore(qualityGovernor.subscribe, qualityGovernor.getLevel, (): QualityLevel => 0);
  const settings = HERO_GRADE_PROFILES[profile];
  const time = useRef(0);
  const scene = useThree((s) => s.scene);

  // Tier B: approximate the LUT with light/fog tints on lights tagged userData.gradeRole.
  useEffect(() => {
    if (mode !== "overlay") return;
    const { keyLightTint, fillLightTint, fogTint, exposureBias } = settings.tierBFallback;
    const restores: (() => void)[] = [];
    scene.traverse((obj) => {
      const light = obj as THREE.Light;
      const role = light.userData?.gradeRole;
      if (!light.isLight || (role !== "key" && role !== "fill")) return;
      const color = light.color.clone();
      const intensity = light.intensity;
      light.color.lerp(tintColor.set(role === "key" ? keyLightTint : fillLightTint), 0.25);
      light.intensity = intensity * exposureBias;
      restores.push(() => {
        light.color.copy(color);
        light.intensity = intensity;
      });
    });
    const fog = scene.fog as THREE.Fog | THREE.FogExp2 | null;
    if (fog) {
      const fogColor = fog.color.clone();
      fog.color.lerp(tintColor.set(fogTint), 0.25);
      restores.push(() => fog.color.copy(fogColor));
    }
    return () => restores.forEach((r) => r());
  }, [mode, scene, settings]);

  useFrame(
    (state, delta) => {
      const dt = Math.min(delta, 0.05);
      time.current += Math.max(0, dt);
      if (!active || !element) return;
      if (mode === "full" && !lut) return;

      const rect = element.getBoundingClientRect();
      const canvasRect = state.gl.domElement.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      if (rect.bottom < canvasRect.top || rect.top > canvasRect.bottom || rect.right < canvasRect.left || rect.left > canvasRect.right) return;
      view.left = rect.left - canvasRect.left;
      view.bottom = canvasRect.bottom - rect.bottom;
      view.width = rect.width;
      view.height = rect.height;

      if (mode === "overlay") {
        rig.renderOverlay(state.gl, view, settings);
        return;
      }
      const dpr = state.gl.getPixelRatio();

      // drei does this in prepareSkissor, which is skipped while visible=false.
      const camera = state.camera as THREE.PerspectiveCamera & THREE.OrthographicCamera & { manual?: boolean };
      if (camera.isOrthographicCamera) {
        if (!camera.manual) {
          const w2 = rect.width / 2;
          const h2 = rect.height / 2;
          if (camera.left !== -w2 || camera.right !== w2 || camera.top !== h2 || camera.bottom !== -h2) {
            Object.assign(camera, { left: -w2, right: w2, top: h2, bottom: -h2 });
            camera.updateProjectionMatrix();
          }
        }
      } else if (camera.aspect !== rect.width / rect.height) {
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
      }

      rig.renderGraded(
        state.gl,
        state.scene,
        camera,
        view,
        dpr * renderScaleFor(quality),
        settings,
        lut!,
        time.current,
        bloomMipsFor(quality)
      );
    },
    mode === "full" ? index : index + 1
  );

  return null;
}
