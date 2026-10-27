"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTier } from "@/components/providers/TierProvider";
import { BeachCompoundScene } from "./BeachCompoundScene";
import { EyeglassHandRig } from "./EyeglassHandRig";
import { MissilePyroSystem } from "./MissilePyroSystem";
import { evaluateCameraRail, heroProjection } from "./gamesRail";

import {
  createLayeredFocusTargets,
  disposeLayeredFocusTargets,
} from "./compositor/LayeredFocusCompositor";

interface GamesFocusSceneProps {
  scrollP: number;
  stageRef?: RefObject<HTMLElement | null>;
  onReady?: () => void;
}

export function GamesFocusScene({ scrollP, stageRef, onReady }: GamesFocusSceneProps) {
  const ready = useRef(false);
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const tier = useTier();
  const [stageSize, setStageSize] = useState({ width: size.width, height: size.height });
  const aspect = stageSize.width / Math.max(1, stageSize.height);
  const projection = heroProjection(aspect);

  useEffect(() => {
    const element = stageRef?.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStageSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [stageRef]);

  const resources = useMemo(() => {
    const targets = createLayeredFocusTargets(gl, tier as "A" | "B" | "C");
    const backgroundScene = new THREE.Scene();
    backgroundScene.fog = new THREE.FogExp2("#BFE6EA", 0.007);
    const foregroundScene = new THREE.Scene();
    const backgroundCamera = new THREE.PerspectiveCamera(34, 2.39, 1, 400);
    const foregroundCamera = new THREE.PerspectiveCamera(34, 2.39, 0.01, 2);
    return {
      ...targets,
      backgroundScene,
      foregroundScene,
      backgroundCamera,
      foregroundCamera,
      savedViewport: new THREE.Vector4(),
      savedScissor: new THREE.Vector4(),
      savedClearColor: new THREE.Color(),
    };
  }, [gl, tier]);

  useEffect(() => () => {
    disposeLayeredFocusTargets(resources);
  }, [resources]);

  useFrame(() => {
    const rect = stageRef?.current?.getBoundingClientRect();
    if (rect && (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.width <= 0)) return;
    const width = rect?.width ?? size.width;
    const height = rect?.height ?? size.height;
    if (width <= 0 || height <= 0) return;
    const viewAspect = width / height;
    const rail = evaluateCameraRail(scrollP, 0, viewAspect);
    const foregroundProjection = heroProjection(viewAspect);
    const r = resources;
    r.backgroundCamera.position.copy(rail.position);
    r.backgroundCamera.lookAt(rail.lookAt);
    r.backgroundCamera.fov = rail.fov;
    r.foregroundCamera.position.set(foregroundProjection.cameraX, 1.65, 6);
    r.foregroundCamera.rotation.set(0, 0, 0);
    r.foregroundCamera.fov = foregroundProjection.fov;
    for (const camera of [r.backgroundCamera, r.foregroundCamera]) {
      camera.aspect = viewAspect;
      camera.updateProjectionMatrix();
      camera.projectionMatrix.elements[9] = -rail.lensShift;
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    }

    const maxWidth = tier === "A" ? 1920 : 1280;
    const resolution = Math.min(gl.getPixelRatio(), tier === "A" ? 1.5 : 1, maxWidth / width, 1080 / height);
    const targetWidth = Math.max(1, Math.round(width * resolution));
    const targetHeight = Math.max(1, Math.round(height * resolution));
    const blurScale = tier === "C" ? 0.25 : 0.5;
    const resize = (target: THREE.WebGLRenderTarget, scale = 1) => {
      const w = Math.max(1, Math.round(targetWidth * scale));
      const h = Math.max(1, Math.round(targetHeight * scale));
      if (target.width !== w || target.height !== h) target.setSize(w, h);
    };
    resize(r.background);
    resize(r.foreground, rail.foregroundBlur > 0 ? 0.75 : 1);
    resize(r.mask, 0.25);
    for (const target of [r.backgroundBlur, r.foregroundBlur, r.maskBlur]) resize(target, blurScale);

    const oldTarget = gl.getRenderTarget();
    const oldCubeFace = gl.getActiveCubeFace();
    const oldMipLevel = gl.getActiveMipmapLevel();
    const oldScissorTest = gl.getScissorTest();
    const oldAutoClear = gl.autoClear;
    const oldClearAlpha = gl.getClearAlpha();
    const oldXrEnabled = gl.xr.enabled;
    const oldOverride = r.foregroundScene.overrideMaterial;
    const oldLayers = r.foregroundCamera.layers.mask;
    gl.getViewport(r.savedViewport);
    gl.getScissor(r.savedScissor);
    gl.getClearColor(r.savedClearColor);

    const draw = (target: THREE.WebGLRenderTarget, scene: THREE.Scene, camera: THREE.Camera) => {
      gl.setRenderTarget(target);
      gl.clear(true, true, true);
      gl.render(scene, camera);
    };
    const blur = (source: THREE.WebGLRenderTarget, destination: THREE.WebGLRenderTarget,
      radius: number, background: boolean) => {
      if (radius <= 0) return source.texture;
      const uniforms = r.blurMaterial.uniforms;
      uniforms.uSource.value = source.texture;
      uniforms.uRadius.value.set(radius / 1440, radius * viewAspect / 1440);
      uniforms.uBackground.value = background ? 1 : 0;
      uniforms.uHighlightBoost.value = background && r.hdr ? 1 : 0;
      uniforms.uTaps.value = background ? (tier === "A" ? 32 : tier === "B" ? 20 : 12)
        : (tier === "A" ? 24 : tier === "B" ? 16 : 10);
      draw(destination, r.passScene, r.passCamera);
      return destination.texture;
    };

    try {
      gl.autoClear = false;
      gl.xr.enabled = false;
      gl.setScissorTest(false);
      gl.setClearColor(0x000000, 0);
      draw(r.background, r.backgroundScene, r.backgroundCamera);
      draw(r.foreground, r.foregroundScene, r.foregroundCamera);
      r.foregroundCamera.layers.set(2);
      r.foregroundScene.overrideMaterial = r.maskMaterial;
      draw(r.mask, r.foregroundScene, r.foregroundCamera);
      r.foregroundScene.overrideMaterial = oldOverride;
      r.foregroundCamera.layers.mask = oldLayers;

      const uniforms = r.compositeMaterial.uniforms;
      uniforms.uBackground.value = blur(r.background, r.backgroundBlur, rail.backgroundBokeh, true);
      uniforms.uForeground.value = blur(r.foreground, r.foregroundBlur, rail.foregroundBlur, false);
      uniforms.uLensMask.value = blur(r.mask, r.maskBlur, rail.foregroundBlur, false);
      uniforms.uLensPop.value = THREE.MathUtils.smoothstep(scrollP, 0.52, 0.64);
      uniforms.uTexel.value.set(1 / targetWidth, 1 / targetHeight);
    } finally {
      r.foregroundScene.overrideMaterial = oldOverride;
      r.foregroundCamera.layers.mask = oldLayers;
      gl.setRenderTarget(oldTarget, oldCubeFace, oldMipLevel);
      gl.setViewport(r.savedViewport);
      gl.setScissor(r.savedScissor);
      gl.setScissorTest(oldScissorTest);
      gl.setClearColor(r.savedClearColor, oldClearAlpha);
      gl.autoClear = oldAutoClear;
      gl.xr.enabled = oldXrEnabled;
    }
  }, 1.5);

  return (
    <>
      {createPortal(<>
        <BeachCompoundScene scrollP={scrollP} backgroundBokeh={0} portrait={projection.portrait} />
        <MissilePyroSystem scrollP={scrollP} portrait={projection.portrait} />
      </>, resources.backgroundScene, { camera: resources.backgroundCamera })}
      {createPortal(<>
        <ambientLight intensity={1.5} />
        <directionalLight position={[12, 24, 14]} intensity={3.8} />
        <EyeglassHandRig scrollP={scrollP} foregroundBlur={0} />
      </>, resources.foregroundScene, { camera: resources.foregroundCamera })}
      <mesh geometry={resources.geometry} material={resources.compositeMaterial}
        frustumCulled={false} renderOrder={1000} dispose={null} onAfterRender={() => {
          if (ready.current) return;
          ready.current = true;
          onReady?.();
        }} />
    </>
  );
}
