"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTier } from "@/components/providers/TierProvider";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { EyeglassHandRig } from "./EyeglassHandRig";
import { projectWorldToScreen } from "./camera/projectionMath";
import { DESIGN_ASPECT, FIREBALLS, evaluateCameraRail, evaluateFireball, evaluateForegroundRig, heroProjection } from "./gamesRail";
import type { DecodedPlate } from "./hybridMedia";
import { gamesDiagnosticsEnabled, GamesGpuTimer, GamesRenderDiagnostics } from "./compositor/GamesRenderDiagnostics";

import {
  createLayeredFocusTargets,
  disposeLayeredFocusTargets,
} from "./compositor/LayeredFocusCompositor";

/** Plate view transform: Blender AgX at -0.7 EV ("Medium High Contrast" approximated by a log-space power). */
const LOOK_EXPOSURE = 2 ** -0.7;
const LOOK_POWER = 1.15;
/** Display-referred grain peak shared by plate and live layers (keeps the neutral-ramp gate within 3 levels). */
const LOOK_GRAIN = 2 / 255;
/** The offline sun (scripts/render-games-hybrid.py): position (12, 24, 14), strength 2.5. Blender's strength
 *  renders a facing white diffuse surface at 1.0 per unit; three's Lambert divides by π, hence the factor. */
const SUN_DIRECTION = new THREE.Vector3(12, 24, 14).normalize();
const SUN_INTENSITY = 2.5 * Math.PI;
/** Offline blast lights: colour (1, .22, .025), 24 kW flash + 9 kW glow at (x, 1.5, -30); volumes roughly double it. */
const BLAST_COLOR = new THREE.Color().setRGB(1, 0.22, 0.025);
const BLAST_GAIN = 2 * Math.PI;
const PLATE_OPTICS = heroProjection(DESIGN_ASPECT);
/** Share of the plate's black floor given to the near-camera layer (veiling glare reaches it; haze mostly not). */
const PLATE_BLACK_SHARE = 0.35;
/** The plates' black floor, display-linear: mean of the darkest 3% of a 64×27 thumbnail, measured offline on
 *  the p .10 (in focus) and p .42 (baked defocus) frames. Interpolated by baked focus; no per-plate readback. */
const PLATE_BLACK_SHARP = new THREE.Color().setRGB(0.074, 0.071, 0.064);
const PLATE_BLACK_SOFT = new THREE.Color().setRGB(0.086, 0.082, 0.074);
/** Desktop cover-crop: the poster's CSS object-position (75%) and the compositor share this crop anchor. */
const COVER_ANCHOR = 0.75;

/**
 * Daylight probe built from the plate's own sky, horizon and sand, so acetate reflects the scene it sits in.
 * An equirect data texture: the renderer prefilters it itself inside the foreground pass (a PMREM baked
 * from React render time came out black on the shared canvas).
 */
function createPlateProbe() {
  const width = 128;
  const height = 64;
  const data = new Float32Array(width * height * 4);
  // Scene-linear radiance in the offline sun's units (pre -0.7 EV), matched to plate sky/horizon/sand values.
  const zenith = new THREE.Color("#b4c4da").multiplyScalar(1.9);
  const horizon = new THREE.Color("#ece5da").multiplyScalar(2.2);
  const shore = new THREE.Color("#c8baa6").multiplyScalar(0.9);
  const sand = new THREE.Color("#b3a490").multiplyScalar(0.75);
  const color = new THREE.Color();
  for (let row = 0; row < height; row++) {
    // Row 0 is the bottom of the sphere (flipY false): elevation runs -90° .. +90°.
    const y = Math.sin(((row + 0.5) / height - 0.5) * Math.PI);
    if (y >= 0) color.copy(horizon).lerp(zenith, Math.pow(y, 0.42));
    else color.copy(shore).lerp(sand, THREE.MathUtils.smoothstep(-y, 0, 0.2));
    for (let column = 0; column < width; column++) data.set([color.r, color.g, color.b, 1], (row * width + column) * 4);
  }
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

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
  const cinematic = useMemo(() => isHeroCinematicEnabled("games"), []);
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
    let environment: THREE.WebGLRenderTarget | null = null;
    let probe: THREE.DataTexture | null = null;
    if (cinematic) {
      probe = createPlateProbe();
    } else {
      // Small daylight reflection probe; matches the offline sun direction without shipping an HDRI.
      const generator = new THREE.PMREMGenerator(gl);
      const daylight = new THREE.Scene();
      daylight.background = new THREE.Color("#BFE6EA");
      const sand = new THREE.Mesh(new THREE.SphereGeometry(20, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: "#B7A389", side: THREE.BackSide }));
      const sun = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8),
        new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFF2DA").multiplyScalar(2.5) }));
      sun.position.set(12, 24, 14).normalize().multiplyScalar(10);
      daylight.add(sand, sun);
      environment = generator.fromScene(daylight, 0, 0.1, 40, { size: 64 });
      generator.dispose();
      for (const mesh of [sand, sun]) { mesh.geometry.dispose(); mesh.material.dispose(); }
    }
    foregroundScene.environment = probe ?? environment!.texture;
    foregroundScene.environmentIntensity = 1;
    // One shadow caster: the offline sun, framed tightly on the rig so fingers shade the temple they pinch.
    const key = new THREE.DirectionalLight(new THREE.Color("#fff3e6"), SUN_INTENSITY);
    const fire = new THREE.DirectionalLight(BLAST_COLOR, 0);
    if (cinematic) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.bias = -0.0002;
      key.shadow.normalBias = 0.0003;
      Object.assign(key.shadow.camera, { left: -0.15, right: 0.15, top: 0.15, bottom: -0.15, near: 0.05, far: 1.4 });
      key.shadow.camera.updateProjectionMatrix();
      foregroundScene.add(key, key.target, fire, fire.target);
    }
    targets.compositeMaterial.uniforms.uSkyReflection.value.set("#c9d3de");
    const foregroundCamera = new THREE.PerspectiveCamera(34, 2.39, 0.01, 2);
    return {
      ...targets,
      foregroundScene,
      environment,
      probe,
      key,
      fire,
      fireDirection: new THREE.Vector3(),
      fireStep: new THREE.Vector3(),
      skyColor: new THREE.Color("#BFE6EA"),
      groundColor: new THREE.Color("#B7A389"),
      foregroundCamera,
      savedViewport: new THREE.Vector4(),
      savedScissor: new THREE.Vector4(),
      savedClearColor: new THREE.Color(),
    };
  }, [gl, tier, cinematic]);

  useEffect(() => () => {
    disposeLayeredFocusTargets(resources);
    resources.environment?.dispose();
    resources.probe?.dispose();
    resources.key.shadow.dispose();
    resources.key.dispose();
    resources.fire.dispose();
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
      environmentTextureBytes: Math.round(imageBytes(resources.environment?.texture ?? resources.probe!) * (resources.probe ? 4 : 1)) };
  };

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    // Every pass below is a pure function of progress and the displayed plate; dt only rejects a non-finite clock.
    if (!Number.isFinite(dt)) return;
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
    const viewAspect = height > 0 ? width / height : DESIGN_ASPECT;
    const isPortrait = viewAspect < 1.3;
    const optics = heroProjection(viewAspect);
    const rig = evaluateForegroundRig(scrollP, viewAspect);
    // A held pose reuses its foreground/mask/blur passes until its plate or optics change.
    const drawKey = `${resources.foreground.texture.uuid}:${plate.index}:${rig.position.toArray()}:${rig.rotation.toArray()}:${rig.opacity}:${scrollP >= 0.58}:${width}:${height}:${gl.getPixelRatio()}`;
    if (lastDraw.current === drawKey) return;
    // Fixed-size plates reuse Three's texture storage; only the pixels change.
    if (plateTexture.image !== plate.image) {
      plateTexture.image = plate.image;
      plateTexture.needsUpdate = true;
    }

    const rail = evaluateCameraRail(plate.sample.p, 0, viewAspect);
    const foregroundOpacity = rig.opacity;
    const cropHalf = 0.5 * Math.min(1, viewAspect / DESIGN_ASPECT);
    const cropCenter = cinematic && !isPortrait ? COVER_ANCHOR + 2 * cropHalf * (0.5 - COVER_ANCHOR) : 0.5;

    const r = resources;
    r.foregroundCamera.position.set(optics.cameraX, 1.65, 6);
    r.foregroundCamera.rotation.set(0, 0, 0);
    r.foregroundCamera.fov = optics.fovDeg;
    for (const camera of [r.foregroundCamera]) {
      camera.aspect = viewAspect;
      camera.updateProjectionMatrix();
      camera.projectionMatrix.elements[9] = -rail.lensShift;
      // Desktop cover-crop (1.3 ≤ aspect < 2.39): the plate keeps its vertical FOV and is cropped sideways
      // around cropCenter; shift the live camera's frustum by the same amount so registration holds.
      if (cinematic && !isPortrait && viewAspect < DESIGN_ASPECT) camera.projectionMatrix.elements[8] = (cropCenter - 0.5) / cropHalf;
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    }

    if (cinematic) {
      // Key follows the rig so its tight shadow frustum stays on the glasses; direction is the offline sun's.
      r.key.target.position.copy(rig.position);
      r.key.position.copy(rig.position).addScaledVector(SUN_DIRECTION, 0.7);
      r.key.target.updateMatrixWorld();
      // Blast light from the displayed plate's fireballs, using the offline light energy and colour.
      const direction = r.fireDirection.set(0, 0, 0);
      let irradiance = 0;
      for (let index = 0; index < FIREBALLS.length; index++) {
        const blast = FIREBALLS[index];
        if (plate.sample.p < blast.hit) continue;
        const age = (plate.sample.p - blast.hit) / 0.2;
        const watts = 24000 * Math.exp(-age / 0.035) + 9000 * Math.exp(-age * 2.8);
        const step = r.fireStep.set(blast.x, 1.5, -30).sub(rig.position);
        const energy = BLAST_GAIN * watts / (4 * Math.PI * step.lengthSq());
        direction.addScaledVector(step.normalize(), energy);
        irradiance += energy;
      }
      r.fire.intensity = irradiance;
      r.fire.visible = irradiance > 0.002;
      if (irradiance > 0) {
        r.fire.target.position.copy(rig.position);
        r.fire.position.copy(rig.position).add(direction.normalize());
        r.fire.target.updateMatrixWorld();
      }
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
      // Tier A defocuses from a full-resolution layer (not 3/4) so the out-of-focus hand keeps a clean edge.
      resize(r.foreground, rail.foregroundBlur > 0 && !(cinematic && tier === "A") ? 0.75 : 1);
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
    const oldShadowAuto = gl.shadowMap.autoUpdate;
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
      // Highlight clamp only on the colour layer's first pass (scene-linear units; the mask is 0-1).
      uniforms.uClamp.value = cinematic && destination === r.foregroundBlur ? 1.6 : 0;
      uniforms.uRadius.value.set(radius / 1440, 0);
      draw(destination, r.passScene, r.passCamera, destination === r.foregroundBlur ? "foregroundBlurX" : "maskBlurX");
      // Reuse the original target after its pixels have been consumed; next frame redraws it.
      uniforms.uSource.value = destination.texture;
      uniforms.uClamp.value = 0;
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
        // The rig's shadow map renders once, with the colour pass; never again for the mask pass.
        const shadowPending = gl.shadowMap.needsUpdate;
        gl.shadowMap.autoUpdate = false;
        gl.shadowMap.needsUpdate = cinematic;
        draw(r.foreground, r.foregroundScene, r.foregroundCamera, "foreground");
        gl.shadowMap.needsUpdate = false;
        r.foregroundCamera.layers.set(2);
        r.foregroundScene.overrideMaterial = r.maskMaterial;
        draw(r.mask, r.foregroundScene, r.foregroundCamera, "mask");
        gl.shadowMap.needsUpdate = shadowPending;
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
      if (uniforms.uAspect) uniforms.uAspect.value = viewAspect;
      if (uniforms.uTextureAspect) uniforms.uTextureAspect.value = DESIGN_ASPECT;
      if (uniforms.uBgCenterX) uniforms.uBgCenterX.value = isPortrait ? 0.70 : cropCenter;
      uniforms.uLook.value = cinematic ? 1 : 0;
      if (cinematic) {
        uniforms.toneMappingExposure.value = LOOK_EXPOSURE;
        uniforms.uLookPower.value = LOOK_POWER;
        uniforms.uGrain.value = LOOK_GRAIN;
        uniforms.uGrainSeed.value = plate.index;
        uniforms.uPlateBlack.value.copy(PLATE_BLACK_SHARP).lerp(PLATE_BLACK_SOFT, rail.backgroundBokeh / 24).multiplyScalar(PLATE_BLACK_SHARE);
        uniforms.uFgSoft.value = rail.foregroundBlur > 0 ? 0 : 0.55;
        uniforms.uHeatPhase.value = plate.sample.p * 60;
        const heat = uniforms.uHeat.value as THREE.Vector4[];
        for (let index = 0; index < FIREBALLS.length; index++) {
          const blast = FIREBALLS[index];
          const state = evaluateFireball(plate.sample.p, index);
          if (plate.sample.p < blast.hit) { heat[index].set(0, 0, 1, 0); continue; }
          // Plate UV (y up) of the fire body; haze rises from there over the trees and sky.
          const base = projectWorldToScreen({ x: blast.x, y: state.height + state.radius * 0.35, z: -30 }, PLATE_OPTICS);
          const halfWidth = Math.max(0.01, state.radius / (base.d * PLATE_OPTICS.tanH));
          heat[index].set(base.u, 1 - base.v, halfWidth, THREE.MathUtils.smoothstep(state.age, 0, 0.05) * (0.35 + 0.65 * Math.exp(-1.4 * state.age)));
        }
      }
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
      gl.shadowMap.autoUpdate = oldShadowAuto;
    }
  }, 1.5);

  return (
    <>
      {createPortal(<>
        {!cinematic && <>
          <hemisphereLight args={[resources.skyColor, resources.groundColor, 1.2]} />
          <directionalLight position={[12, 24, 14]} intensity={2.5} />
          <pointLight position={[0.43, 2.9, 4.5]} color="orange" intensity={Math.max(...FIREBALLS.map((_, index) => evaluateFireball(plate.sample.p, index).flash)) * 0.12} distance={4} />
        </>}
        <EyeglassHandRig progressRef={progressRef} hand={hand} cinematic={cinematic} />
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
