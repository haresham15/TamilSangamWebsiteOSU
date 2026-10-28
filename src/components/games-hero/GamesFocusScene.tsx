"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTier } from "@/components/providers/TierProvider";
import { EyeglassHandRig } from "./EyeglassHandRig";
import { DESIGN_ASPECT, FIREBALLS, evaluateCameraRail, evaluateFireball, evaluateForegroundRig, heroProjection } from "./gamesRail";
import type { DecodedPlate } from "./hybridMedia";
import { gamesDiagnosticsEnabled, GamesGpuTimer, GamesRenderDiagnostics } from "./compositor/GamesRenderDiagnostics";

import {
  createLayeredFocusTargets,
  disposeLayeredFocusTargets,
} from "./compositor/LayeredFocusCompositor";

interface GamesFocusSceneProps {
  progressRef: RefObject<number>;
  plate: DecodedPlate;
  hand: THREE.Group;
  stageRef?: RefObject<HTMLElement | null>;
  onReady?: (index: number) => void;
  diagnosticsRef?: RefObject<GamesRenderDiagnostics | null>;
}

export function GamesFocusScene({ progressRef, plate, hand, stageRef, onReady, diagnosticsRef }: GamesFocusSceneProps) {
  const lastDraw = useRef("");
  const visibleDraw = useRef(false);
  const compositeStart = useRef(0);
  const uploadedVersion = useRef(-1);
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const tier = useTier();
  const diagnostics = useMemo(() => gamesDiagnosticsEnabled ? new GamesRenderDiagnostics() : null, []);
  const gpuTimer = useMemo(() => {
    if (!diagnostics) return null;
    const context = gl.getContext();
    return context instanceof WebGL2RenderingContext ? new GamesGpuTimer(context, diagnostics) : null;
  }, [gl, diagnostics]);
  useEffect(() => {
    if (diagnosticsRef) diagnosticsRef.current = diagnostics;
    return () => {
      gpuTimer?.dispose();
      if (diagnosticsRef?.current === diagnostics) diagnosticsRef.current = null;
    };
  }, [diagnostics, diagnosticsRef, gpuTimer]);
  const plateTexture = useMemo(() => {
    const texture = new THREE.Texture();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }, []);
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
  const measureForegroundMemory = () => {
    if (!diagnostics) return;
    const arrays = new Set<ArrayBufferView>();
    const textures = new Set<THREE.Texture>();
    resources.foregroundScene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const geometry: THREE.BufferGeometry = object.geometry;
      for (const attribute of Object.values(geometry.attributes)) arrays.add(attribute instanceof THREE.InterleavedBufferAttribute ? attribute.data.array : attribute.array);
      if (geometry.index) arrays.add(geometry.index.array);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
      }
    });
    const imageBytes = (texture: THREE.Texture) => {
      const image = texture.image as { width?: number; height?: number } | undefined;
      return (image?.width ?? 0) * (image?.height ?? 0) * (texture.type === THREE.HalfFloatType ? 8 : 4) * (texture.generateMipmaps ? 4 / 3 : 1);
    };
    const images = new Set([...textures].map(texture => texture.image as { width?: number; height?: number } | undefined));
    diagnostics.memory = { ...diagnostics.memory,
      foregroundGeometryBufferBytes: [...arrays].reduce((sum, array) => sum + array.byteLength, 0),
      foregroundDecodedPixelBytes: [...images].reduce((sum, image) => sum + (image?.width ?? 0) * (image?.height ?? 0) * 4, 0),
      foregroundTextureBytes: Math.round([...textures].reduce((sum, texture) => sum + imageBytes(texture), 0)),
      environmentTextureBytes: Math.round(imageBytes(resources.environment.texture)) };
  };

  useFrame(() => {
    const scrollP = progressRef.current;
    visibleDraw.current = false;
    if (document.hidden) return;
    const rect = stageRef?.current?.getBoundingClientRect();
    if (rect && (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.width <= 0)) return;
    const width = rect?.width ?? size.width;
    const height = rect?.height ?? size.height;
    if (width <= 0 || height <= 0) return;
    visibleDraw.current = true;
    gpuTimer?.poll();
    const rig = evaluateForegroundRig(scrollP, DESIGN_ASPECT);
    // A held pose reuses its foreground/mask/blur passes until its plate or optics change.
    const drawKey = `${plate.index}:${rig.position.toArray()}:${rig.rotation.toArray()}:${rig.opacity}:${scrollP >= 0.58}:${width}:${height}:${gl.getPixelRatio()}`;
    if (lastDraw.current === drawKey) return;
    // Fixed-size plates reuse Three's texture storage; only the pixels change.
    if (plateTexture.image !== plate.image) {
      plateTexture.image = plate.image;
      plateTexture.needsUpdate = true;
    }
    const viewAspect = DESIGN_ASPECT;
    const rail = evaluateCameraRail(plate.sample.p, 0, viewAspect);
    const foregroundOpacity = rig.opacity;
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

    const draw = (target: THREE.WebGLRenderTarget, scene: THREE.Scene, camera: THREE.Camera,
      pass: "foreground" | "mask" | "foregroundBlurX" | "foregroundBlurY" | "maskBlurX" | "maskBlurY") => {
      const start = diagnostics ? performance.now() : 0;
      gpuTimer?.begin(pass);
      try {
        gl.setRenderTarget(target);
        gl.clear(true, true, true);
        gl.render(scene, camera);
      } finally {
        gpuTimer?.end();
        diagnostics?.record(pass, "cpu", performance.now() - start);
      }
    };
    const blur = (source: THREE.WebGLRenderTarget, destination: THREE.WebGLRenderTarget,
      radius: number) => {
      if (radius <= 0) return source.texture;
      const uniforms = r.blurMaterial.uniforms;
      uniforms.uSource.value = source.texture;
      uniforms.uRadius.value.set(radius / 1440, 0);
      draw(destination, r.passScene, r.passCamera, destination === r.foregroundBlur ? "foregroundBlurX" : "maskBlurX");
      // Reuse the original target after its pixels have been consumed; next frame redraws it.
      uniforms.uSource.value = destination.texture;
      uniforms.uRadius.value.set(0, radius * viewAspect / 1440);
      draw(source, r.passScene, r.passCamera, destination === r.foregroundBlur ? "foregroundBlurY" : "maskBlurY");
      return source.texture;
    };

    try {
      gl.autoClear = false;
      gl.xr.enabled = false;
      gl.setScissorTest(false);
      gl.setClearColor(0x000000, 0);
      if (uploadedVersion.current !== plateTexture.version) {
        const start = diagnostics ? performance.now() : 0;
        gpuTimer?.begin("upload");
        try { gl.initTexture(plateTexture); }
        finally { gpuTimer?.end(); diagnostics?.record("upload", "cpu", performance.now() - start); }
        uploadedVersion.current = plateTexture.version;
      }
      if (foregroundOpacity > 0 || lastDraw.current === "") {
        draw(r.foreground, r.foregroundScene, r.foregroundCamera, "foreground");
        r.foregroundCamera.layers.set(2);
        r.foregroundScene.overrideMaterial = r.maskMaterial;
        draw(r.mask, r.foregroundScene, r.foregroundCamera, "mask");
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
      if (diagnostics) {
        if (!diagnostics.memory.foregroundGeometryBufferBytes) measureForegroundMemory();
        const targets = [r.foreground, r.mask, r.foregroundBlur, r.maskBlur];
        diagnostics.memory = { ...diagnostics.memory, plateTextureId: plateTexture.uuid,
          plateTextureBytes: plate.image.width * plate.image.height * 4,
          targetColorBytes: targets.reduce((sum, target) => sum + target.width * target.height * (target.texture.type === THREE.HalfFloatType ? 8 : 4), 0),
          depthAttachmentBytes: r.foreground.width * r.foreground.height * 4,
          multisampleAttachmentBytes: r.foreground.width * r.foreground.height * r.foreground.samples * ((r.hdr ? 8 : 4) + 4),
          sharedRendererTextures: gl.info.memory.textures, sharedRendererGeometries: gl.info.memory.geometries,
          qualification: "RGBA storage estimates exclude driver/browser overhead and shared resources; renderer counts are not byte totals" };
      }
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
        <EyeglassHandRig progressRef={progressRef} hand={hand} />
      </>, resources.foregroundScene, { camera: resources.foregroundCamera })}
      <mesh geometry={resources.geometry} material={resources.compositeMaterial}
        frustumCulled={false} renderOrder={1000} dispose={null} onBeforeRender={() => {
          if (!visibleDraw.current || !diagnostics) return;
          compositeStart.current = performance.now();
          gpuTimer?.begin("composite");
        }} onAfterRender={() => {
          if (!visibleDraw.current || document.hidden) return;
          gpuTimer?.end();
          diagnostics?.record("composite", "cpu", performance.now() - compositeStart.current);
          diagnostics?.complete(performance.now(), plate.index, progressRef.current, plate.sample.p);
          onReady?.(plate.index);
        }} />
    </>
  );
}
