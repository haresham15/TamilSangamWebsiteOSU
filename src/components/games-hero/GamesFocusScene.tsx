"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTier } from "@/components/providers/TierProvider";
import { EyeglassHandRig } from "./EyeglassHandRig";
import { DESIGN_ASPECT, FIREBALLS, evaluateCameraRail, evaluateFireball, evaluateForegroundRig, heroProjection } from "./gamesRail";
import type { DecodedPlate } from "./hybridMedia";

import {
  createLayeredFocusTargets,
  disposeLayeredFocusTargets,
} from "./compositor/LayeredFocusCompositor";

interface GamesFocusSceneProps {
  scrollP: number;
  plate: DecodedPlate;
  hand: THREE.Group;
  stageRef?: RefObject<HTMLElement | null>;
  onReady?: (index: number) => void;
}

export function GamesFocusScene({ scrollP, plate, hand, stageRef, onReady }: GamesFocusSceneProps) {
  const lastDraw = useRef("");
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const tier = useTier();
  const plateTexture = useMemo(() => {
    const texture = new THREE.Texture(plate.image);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [plate.image]);
  useEffect(() => () => plateTexture.dispose(), [plateTexture]);

  const resources = useMemo(() => {
    const targets = createLayeredFocusTargets(gl, tier as "A" | "B" | "C");
    const foregroundScene = new THREE.Scene();
    // Small daylight reflection probe; matches the offline sun direction without shipping an HDRI.
    const daylight = new THREE.Scene();
    daylight.background = new THREE.Color("#BFE6EA");
    const sand = new THREE.Mesh(new THREE.SphereGeometry(20, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: "#B7A389", side: THREE.BackSide }));
    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFF2DA").multiplyScalar(2.5) }));
    sun.position.set(12, 24, 14).normalize().multiplyScalar(10);
    daylight.add(sand, sun);
    const generator = new THREE.PMREMGenerator(gl);
    const environment = generator.fromScene(daylight, 0, 0.1, 40, { size: 64 });
    generator.dispose();
    for (const mesh of [sand, sun]) { mesh.geometry.dispose(); mesh.material.dispose(); }
    foregroundScene.environment = environment.texture;
    foregroundScene.environmentIntensity = 1;
    const foregroundCamera = new THREE.PerspectiveCamera(34, 2.39, 0.01, 2);
    return {
      ...targets,
      foregroundScene,
      environment,
      skyColor: new THREE.Color("#BFE6EA"),
      groundColor: new THREE.Color("#B7A389"),
      foregroundCamera,
      savedViewport: new THREE.Vector4(),
      savedScissor: new THREE.Vector4(),
      savedClearColor: new THREE.Color(),
    };
  }, [gl, tier]);

  useEffect(() => () => {
    disposeLayeredFocusTargets(resources);
    resources.environment.dispose();
  }, [resources]);
  useEffect(() => { lastDraw.current = ""; }, [resources, plateTexture]);

  useFrame(() => {
    if (document.hidden) return;
    const rect = stageRef?.current?.getBoundingClientRect();
    if (rect && (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.width <= 0)) return;
    const width = rect?.width ?? size.width;
    const height = rect?.height ?? size.height;
    if (width <= 0 || height <= 0) return;
    const drawKey = `${plate.index}:${scrollP.toFixed(5)}:${width}:${height}:${gl.getPixelRatio()}`;
    if (lastDraw.current === drawKey) return;
    const viewAspect = DESIGN_ASPECT;
    const rail = evaluateCameraRail(plate.sample.p, 0, viewAspect);
    const foregroundOpacity = evaluateForegroundRig(scrollP, viewAspect).opacity;
    const foregroundProjection = heroProjection(viewAspect);
    const r = resources;
    r.foregroundCamera.position.set(foregroundProjection.cameraX, 1.65, 6);
    r.foregroundCamera.rotation.set(0, 0, 0);
    r.foregroundCamera.fov = foregroundProjection.fov;
    for (const camera of [r.foregroundCamera]) {
      camera.aspect = viewAspect;
      camera.updateProjectionMatrix();
      camera.projectionMatrix.elements[9] = -rail.lensShift;
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    }

    const maxWidth = tier === "A" ? 1600 : 1120;
    const resolution = Math.min(gl.getPixelRatio(), tier === "A" ? 1.25 : 1, maxWidth / width, 900 / height);
    const targetWidth = Math.max(1, Math.round(width * resolution));
    const targetHeight = Math.max(1, Math.round(height * resolution));
    const blurScale = tier === "C" ? 0.25 : 0.5;
    const resize = (target: THREE.WebGLRenderTarget, scale = 1) => {
      const w = Math.max(1, Math.round(targetWidth * scale));
      const h = Math.max(1, Math.round(targetHeight * scale));
      if (target.width !== w || target.height !== h) target.setSize(w, h);
    };
    if (foregroundOpacity > 0) {
      resize(r.foreground, rail.foregroundBlur > 0 ? 0.75 : 1);
      resize(r.mask, 0.25);
      for (const target of [r.foregroundBlur, r.maskBlur]) resize(target, blurScale);
    }

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
      radius: number) => {
      if (radius <= 0) return source.texture;
      const uniforms = r.blurMaterial.uniforms;
      uniforms.uSource.value = source.texture;
      uniforms.uRadius.value.set(radius / 1440, radius * viewAspect / 1440);
      uniforms.uTaps.value = tier === "A" ? 16 : tier === "B" ? 12 : 8;
      draw(destination, r.passScene, r.passCamera);
      return destination.texture;
    };

    try {
      gl.autoClear = false;
      gl.xr.enabled = false;
      gl.setScissorTest(false);
      gl.setClearColor(0x000000, 0);
      if (foregroundOpacity > 0 || lastDraw.current === "") {
        draw(r.foreground, r.foregroundScene, r.foregroundCamera);
        r.foregroundCamera.layers.set(2);
        r.foregroundScene.overrideMaterial = r.maskMaterial;
        draw(r.mask, r.foregroundScene, r.foregroundCamera);
        r.foregroundScene.overrideMaterial = oldOverride;
        r.foregroundCamera.layers.mask = oldLayers;
      }

      const uniforms = r.compositeMaterial.uniforms;
      // WebGL sRGB texture sampling decodes baked display color; never blur or tone-map the plate again.
      if (uniforms.uBackground) uniforms.uBackground.value = plateTexture;
      if (uniforms.uForeground) uniforms.uForeground.value = foregroundOpacity > 0
        ? blur(r.foreground, r.foregroundBlur, rail.foregroundBlur) : r.foreground.texture;
      if (uniforms.uLensMask) uniforms.uLensMask.value = foregroundOpacity > 0
        ? blur(r.mask, r.maskBlur, rail.foregroundBlur) : r.mask.texture;
      if (uniforms.uForegroundOpacity) uniforms.uForegroundOpacity.value = foregroundOpacity;
      if (uniforms.uLensPop) uniforms.uLensPop.value = THREE.MathUtils.smoothstep(plate.sample.p, 0.52, 0.64);
      if (uniforms.uTexel) uniforms.uTexel.value.set(1 / targetWidth, 1 / targetHeight);
      if (uniforms.toneMappingExposure) uniforms.toneMappingExposure.value = gl.toneMappingExposure;
      lastDraw.current = drawKey;
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
        <hemisphereLight args={[resources.skyColor, resources.groundColor, 1.2]} />
        <directionalLight position={[12, 24, 14]} intensity={2.5} />
        <pointLight position={[0.43, 2.9, 4.5]} color="orange" intensity={Math.max(...FIREBALLS.map((_, index) => evaluateFireball(plate.sample.p, index).flash)) * 0.12} distance={4} />
        <EyeglassHandRig scrollP={scrollP} hand={hand} foregroundBlur={0} />
      </>, resources.foregroundScene, { camera: resources.foregroundCamera })}
      <mesh geometry={resources.geometry} material={resources.compositeMaterial}
        frustumCulled={false} renderOrder={1000} dispose={null} onAfterRender={() => {
          onReady?.(plate.index);
        }} />
    </>
  );
}
