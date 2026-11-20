"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTier } from "@/components/providers/TierProvider";
import { isHeroCinematicEnabled } from "@/config/heroCinematicFlags";
import { qualityGovernor, renderScaleFor } from "@/engine/qualityGovernor";
import { EyeglassHandRig } from "./EyeglassHandRig";
import { BeachWorld, type BeachQuality } from "./beach/BeachWorld";
import { BlastFX } from "./beach/BlastFX";
import { DESIGN_ASPECT, FIREBALLS, blastEnergy, evaluateCameraRail, evaluateFireball, evaluateForegroundRig, heroProjection } from "./gamesRail";
import { gamesDiagnosticsEnabled, GamesGpuTimer, GamesRenderDiagnostics, type GamesStage } from "./compositor/GamesRenderDiagnostics";

import {
  createLayeredFocusTargets,
  disposeLayeredFocusTargets,
} from "./compositor/LayeredFocusCompositor";

/** View transform: Blender AgX at -0.7 EV ("Medium High Contrast" approximated by a log-space power). */
const LOOK_EXPOSURE = 2 ** -0.7;
const LOOK_POWER = 1.15;
/** Display-referred grain peak shared by both layers. */
const LOOK_GRAIN = 2 / 255;
/** The offline sun (scripts/render-games-hybrid.py): position (12, 24, 14), strength 2.5. Blender's strength
 *  renders a facing white diffuse surface at 1.0 per unit; three's Lambert divides by π, hence the factor.
 *  BeachWorld's sun uses the same direction and intensity. */
const SUN_DIRECTION = new THREE.Vector3(12, 24, 14).normalize();
const SUN_INTENSITY = 2.5 * Math.PI;
/** Offline blast lights: colour (1, .22, .025); the hand receives their full (unscaled) energy. */
const BLAST_COLOR = new THREE.Color().setRGB(1, 0.22, 0.025);
/** Desktop cover-crop: the poster's CSS object-position (75%) and both cameras share this crop anchor. */
const COVER_ANCHOR = 0.75;
/**
 * Per quality (0 best): background resolution scale and MSAA. Every level keeps 2× MSAA: 4× on the HalfFloat
 * target pushed an integrated GPU (Iris Xe) past the 20 ms p95 budget, and the composite's FXAA fallback
 * re-evaluates the whole composite nine times per pixel, which cost far more than 2× MSAA on phones (tiled
 * GPUs resolve MSAA on chip) and stalled software renderers for seconds per frame.
 */
const BACKGROUND_SCALE = [0.85, 0.75, 0.55] as const;
const BACKGROUND_SAMPLES = [2, 2, 2] as const;
/** Background re-renders forced after mount so BeachWorld's held sun shadow is drawn (it warms up 3 frames). */
const SHADOW_WARMUP_FRAMES = 4;

/**
 * Daylight probe for the hand and acetate: the beach's sky, horizon and sand as an equirect data texture
 * (the renderer prefilters it itself inside the foreground pass; a PMREM baked from React render time came
 * out black on the shared canvas).
 */
function createDaylightProbe() {
  const width = 128;
  const height = 64;
  const data = new Float32Array(width * height * 4);
  // Scene-linear radiance in the offline sun's units (pre -0.7 EV), matched to the beach's sky/horizon/sand.
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

/**
 * Beach quality from the render mode, fixed by the caller at mount (as the Events hero does): rebuilding the
 * beach mid-scroll would itself cause a hitch. 0 desktop Tier A · 1 Tier B · 2 mobile.
 */
export function gamesBeachQuality(mode: "static" | "B" | "A", qualityLevel: number): BeachQuality {
  const mobile = typeof window !== "undefined" && window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
  if (mobile) return 2;
  if (mode === "B") return Math.max(1, Math.min(qualityLevel, 2)) as BeachQuality;
  return Math.min(qualityLevel, 2) as BeachQuality;
}

/** CPU rasterisers (SwiftShader, llvmpipe, WARP) cannot fill a full-resolution HDR beach; they get quality 2. */
function isSoftwareRenderer(gl: THREE.WebGLRenderer) {
  const context = gl.getContext();
  const info = context.getExtension("WEBGL_debug_renderer_info");
  const name = String(context.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : context.RENDERER) ?? "");
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
}

/** Same lens for every layer: locked position, FOV, horizon lens shift (elements[9]) and cover-crop shift (elements[8]). */
function poseCamera(camera: THREE.PerspectiveCamera, cameraX: number, fovDeg: number, aspect: number, lensShift: number, cropShift: number) {
  camera.position.set(cameraX, 1.65, 6);
  camera.rotation.set(0, 0, 0);
  camera.fov = fovDeg;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  camera.projectionMatrix.elements[9] = -lensShift;
  if (cropShift !== 0) camera.projectionMatrix.elements[8] = cropShift;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  camera.updateMatrixWorld();
}

interface GamesFocusSceneProps {
  progressRef: RefObject<number>;
  hand: THREE.Group;
  /** Fixed for the life of the scene (see gamesBeachQuality). */
  quality: BeachQuality;
  /** Holds ambient motion (sea, palms, grain) so a fixed progress renders identical frames (?debug). */
  frozen?: boolean;
  stageRef?: RefObject<HTMLElement | null>;
  /** Called after each visible composite with the progress it drew. */
  onReady?: (progress: number) => void;
  /** Called once if this GPU cannot render the HDR background (no renderable float colour buffers). */
  onUnsupported?: () => void;
  diagnosticsRef?: RefObject<GamesRenderDiagnostics | null>;
}

export function GamesFocusScene({ progressRef, hand, quality: requestedQuality, frozen = false, stageRef, onReady, onUnsupported, diagnosticsRef }: GamesFocusSceneProps) {
  const visibleDraw = useRef(false);
  const drawnProgress = useRef(0);
  const compositeStart = useRef(0);
  const warmup = useRef(SHADOW_WARMUP_FRAMES);
  const gl = useThree((state) => state.gl);
  const quality = useMemo<BeachQuality>(() => isSoftwareRenderer(gl) ? 2 : requestedQuality, [gl, requestedQuality]);
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

  const resources = useMemo(() => {
    const targets = createLayeredFocusTargets(gl, tier as "A" | "B" | "C", BACKGROUND_SAMPLES[quality]);
    const foregroundScene = new THREE.Scene();
    // BeachWorld sets this scene's fog and environment while mounted; the sky dome covers the clear colour.
    const backgroundScene = new THREE.Scene();
    let environment: THREE.WebGLRenderTarget | null = null;
    let probe: THREE.DataTexture | null = null;
    if (cinematic) {
      probe = createDaylightProbe();
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
    // One shadow caster per layer: here the sun, framed tightly on the rig so fingers shade the temple they pinch.
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
    // The beach runs ~370 m out and its sky dome sits at the far plane.
    const backgroundCamera = new THREE.PerspectiveCamera(34, 2.39, 0.3, 600);
    return {
      ...targets,
      foregroundScene,
      backgroundScene,
      environment,
      probe,
      key,
      fire,
      fireDirection: new THREE.Vector3(),
      heatPoint: new THREE.Vector3(),
      skyColor: new THREE.Color("#BFE6EA"),
      groundColor: new THREE.Color("#B7A389"),
      foregroundCamera,
      backgroundCamera,
      savedViewport: new THREE.Vector4(),
      savedScissor: new THREE.Vector4(),
      savedClearColor: new THREE.Color(),
    };
  }, [gl, tier, cinematic, quality]);

  useEffect(() => () => {
    disposeLayeredFocusTargets(resources);
    resources.environment?.dispose();
    resources.probe?.dispose();
    resources.key.shadow.dispose();
    resources.key.dispose();
    resources.fire.dispose();
  }, [resources]);
  // Per-frame state lives in these preallocated objects (no allocation in the frame loop).
  const pose = useMemo(() => ({ visible: false, width: 1, height: 1, viewAspect: DESIGN_ASPECT }), []);
  const frame = useMemo(() => ({ targetWidth: 1, targetHeight: 1, viewAspect: DESIGN_ASPECT }), []);
  const cache = useMemo(() => ({
    background: { texture: null as THREE.Texture | null, p: NaN, width: 0, height: 0, scale: 0, pixelRatio: 0 },
    foreground: { valid: false, px: 0, py: 0, pz: 0, rx: 0, ry: 0, rz: 0, opacity: 0, blur: 0, fire: 0, width: 0, height: 0, pixelRatio: 0 },
  }), []);
  const passes = useMemo(() => {
    const draw = (target: THREE.WebGLRenderTarget, scene: THREE.Scene, camera: THREE.Camera, pass: GamesStage) => {
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
    return {
      draw,
      resize(target: THREE.WebGLRenderTarget, scale: number) {
        const w = Math.max(1, Math.round(frame.targetWidth * scale));
        const h = Math.max(1, Math.round(frame.targetHeight * scale));
        if (target.width !== w || target.height !== h) target.setSize(w, h);
      },
      /** Separable blur: X into `scratch`, Y back into `source` (its pixels are consumed; the next stale frame redraws it). */
      blur(source: THREE.WebGLRenderTarget, scratch: THREE.WebGLRenderTarget, radius: number, clamp: number, passX: GamesStage, passY: GamesStage) {
        if (radius <= 0) return source.texture;
        const uniforms = resources.blurMaterial.uniforms;
        uniforms.uSource.value = source.texture;
        // Highlight clamp only on the first pass (scene-linear units).
        uniforms.uClamp.value = clamp;
        uniforms.uRadius.value.set(radius / 1440, 0);
        draw(scratch, resources.passScene, resources.passCamera, passX);
        uniforms.uSource.value = scratch.texture;
        uniforms.uClamp.value = 0;
        uniforms.uRadius.value.set(0, radius * frame.viewAspect / 1440);
        draw(source, resources.passScene, resources.passCamera, passY);
        return source.texture;
      },
    };
  }, [gl, resources, diagnostics, gpuTimer, frame]);
  useEffect(() => {
    cache.foreground.valid = false;
    cache.background.texture = null;
    warmup.current = SHADOW_WARMUP_FRAMES;
  }, [resources, cache]);
  // Without renderable float colour buffers the beach would clip at 1.0 before gamesAgX (grey, banded sky):
  // hand over to the poster stills instead.
  useEffect(() => {
    if (!resources.hdr) onUnsupported?.();
  }, [resources, onUnsupported]);
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

  // Lens pose runs before BeachWorld/BlastFX (priority 0), so their billboards and sorting see this frame's camera.
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!Number.isFinite(dt)) return;
    pose.visible = false;
    if (document.hidden || !resources.hdr) return;
    const rect = stageRef?.current?.getBoundingClientRect();
    if (rect && (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.width <= 0)) return;
    const width = rect?.width ?? size.width;
    const height = rect?.height ?? size.height;
    if (width <= 0 || height <= 0) return;
    const viewAspect = width / height;
    const isPortrait = viewAspect < 1.3;
    const optics = heroProjection(viewAspect);
    const cropHalf = 0.5 * Math.min(1, viewAspect / DESIGN_ASPECT);
    const cropCenter = cinematic && !isPortrait ? COVER_ANCHOR + 2 * cropHalf * (0.5 - COVER_ANCHOR) : 0.5;
    // Desktop cover-crop (1.3 ≤ aspect < 2.39): keep the vertical FOV and crop sideways around cropCenter.
    const cropShift = cinematic && !isPortrait && viewAspect < DESIGN_ASPECT ? (cropCenter - 0.5) / cropHalf : 0;
    // One lens for both layers: same position, FOV, horizon shift and cover-crop shift.
    poseCamera(resources.foregroundCamera, optics.cameraX, optics.fovDeg, viewAspect, optics.lensShift, cropShift);
    poseCamera(resources.backgroundCamera, optics.cameraX, optics.fovDeg, viewAspect, optics.lensShift, cropShift);
    pose.visible = true;
    pose.width = width;
    pose.height = height;
    pose.viewAspect = viewAspect;
  }, -1);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    // Every pass below is a pure function of progress (plus BeachWorld's own sea/palm clock, held when frozen).
    if (!Number.isFinite(dt)) return;
    const scrollP = progressRef.current;
    visibleDraw.current = false;
    if (!pose.visible || document.hidden) return;
    const { width, height, viewAspect } = pose;
    visibleDraw.current = true;
    drawnProgress.current = scrollP;
    gpuTimer?.poll();
    const rig = evaluateForegroundRig(scrollP, viewAspect);
    const rail = evaluateCameraRail(scrollP, 0, viewAspect);
    const foregroundOpacity = rig.opacity;
    const r = resources;

    let fireIntensity = 0;
    if (cinematic) {
      // Key follows the rig so its tight shadow frustum stays on the glasses; direction is the offline sun's.
      r.key.target.position.copy(rig.position);
      r.key.position.copy(rig.position).addScaledVector(SUN_DIRECTION, 0.7);
      r.key.target.updateMatrixWorld();
      // The blasts light the hand with their full offline energy (the beach's point light is scaled separately).
      fireIntensity = blastEnergy(scrollP, rig.position, r.fireDirection);
      r.fire.intensity = fireIntensity;
      r.fire.visible = fireIntensity > 0.002;
      if (fireIntensity > 0) {
        r.fire.target.position.copy(rig.position);
        r.fire.position.copy(rig.position).add(r.fireDirection);
        r.fire.target.updateMatrixWorld();
      }
    }

    const maxWidth = tier === "A" ? 1600 : 1120;
    const pixelRatio = gl.getPixelRatio();
    const resolution = Math.min(pixelRatio, tier === "A" ? 1.25 : 1, maxWidth / width, 900 / height);
    frame.targetWidth = Math.max(1, Math.round(width * resolution));
    frame.targetHeight = Math.max(1, Math.round(height * resolution));
    frame.viewAspect = viewAspect;
    // The adaptive governor's measured step lowers the live background's resolution without a rebuild (held under ?debug).
    const backgroundScale = BACKGROUND_SCALE[quality] * (frozen ? 1 : renderScaleFor(qualityGovernor.getLevel()));
    passes.resize(r.background, backgroundScale);
    // Bokeh resolution follows the radius: wide blur runs at quarter size so bilinear taps overlap (no ghost copies).
    const bokehScale = rail.backgroundBokeh > 8 ? 0.25 : 0.5;
    passes.resize(r.backgroundBlur, bokehScale);
    passes.resize(r.backgroundBlurScratch, bokehScale);
    // The beach only moves on its own at q0 (sea, palms); otherwise a held progress reuses the graded-in background.
    const bg = cache.background;
    const backgroundStale = (quality === 0 && !frozen) || warmup.current > 0 || bg.texture === null || bg.p !== scrollP
      || bg.width !== width || bg.height !== height || bg.scale !== backgroundScale || bg.pixelRatio !== pixelRatio;
    // A held pose reuses its foreground/mask/blur passes until the rig, its light, focus or optics change.
    const fg = cache.foreground;
    const foregroundStale = !fg.valid || fg.px !== rig.position.x || fg.py !== rig.position.y || fg.pz !== rig.position.z
      || fg.rx !== rig.rotation.x || fg.ry !== rig.rotation.y || fg.rz !== rig.rotation.z || fg.opacity !== rig.opacity
      || fg.blur !== rail.foregroundBlur || Math.abs(fg.fire - fireIntensity) > 1e-4 * Math.max(Math.abs(fireIntensity), 1e-6)
      || fg.width !== width || fg.height !== height || fg.pixelRatio !== pixelRatio;
    if (foregroundStale && foregroundOpacity > 0) {
      // Tier A defocuses from a full-resolution layer (not 3/4) so the out-of-focus hand keeps a clean edge.
      passes.resize(r.foreground, rail.foregroundBlur > 0 && !(cinematic && tier === "A") ? 0.75 : 1);
      passes.resize(r.mask, 0.25);
      const blurScale = tier === "C" ? 0.25 : 0.5;
      passes.resize(r.foregroundBlur, blurScale);
      passes.resize(r.maskBlur, blurScale);
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
    const oldShadowNeedsUpdate = gl.shadowMap.needsUpdate;
    const oldLayers = r.foregroundCamera.layers.mask;
    gl.getViewport(r.savedViewport);
    gl.getScissor(r.savedScissor);
    gl.getClearColor(r.savedClearColor);

    try {
      gl.autoClear = false;
      gl.xr.enabled = false;
      gl.setScissorTest(false);
      gl.setClearColor(0x000000, 0);
      gl.shadowMap.autoUpdate = false;

      if (backgroundStale) {
        // Live beach. Its sun shadow is held per light; let the renderer's shadow pass run for the first frames
        // so BeachWorld's warm-up draws it.
        gl.shadowMap.needsUpdate = warmup.current > 0;
        if (warmup.current > 0) warmup.current--;
        passes.draw(r.background, r.backgroundScene, r.backgroundCamera, "background");
        gl.shadowMap.needsUpdate = false;
        // Uniform bokeh: the beach sits 25–64 m out while focus pulls to 0.36 m, so blur varies <3% across it.
        // Two separable iterations (radius, then 0.8 × radius) give a smooth, wide kernel from the 9-tap pass.
        let source = r.background.texture;
        if (rail.backgroundBokeh > 0) {
          const uniforms = r.blurMaterial.uniforms;
          uniforms.uClamp.value = 0;
          for (let iteration = 0; iteration < 2; iteration++) {
            const radius = rail.backgroundBokeh * (iteration === 0 ? 1 : 0.8);
            uniforms.uSource.value = source;
            uniforms.uRadius.value.set(radius / 1440, 0);
            passes.draw(r.backgroundBlurScratch, r.passScene, r.passCamera, "backgroundBlurX");
            uniforms.uSource.value = r.backgroundBlurScratch.texture;
            uniforms.uRadius.value.set(0, radius * viewAspect / 1440);
            passes.draw(r.backgroundBlur, r.passScene, r.passCamera, "backgroundBlurY");
            source = r.backgroundBlur.texture;
          }
        }
        bg.texture = source;
        bg.p = scrollP;
        bg.width = width;
        bg.height = height;
        bg.scale = backgroundScale;
        bg.pixelRatio = pixelRatio;
      }

      if (foregroundStale && (foregroundOpacity > 0 || !fg.valid)) {
        // The rig's shadow map renders once, with the colour pass; never again for the mask pass.
        gl.shadowMap.needsUpdate = cinematic;
        passes.draw(r.foreground, r.foregroundScene, r.foregroundCamera, "foreground");
        gl.shadowMap.needsUpdate = false;
        r.foregroundCamera.layers.set(2);
        r.foregroundScene.overrideMaterial = r.maskMaterial;
        passes.draw(r.mask, r.foregroundScene, r.foregroundCamera, "mask");
        r.foregroundScene.overrideMaterial = oldOverride;
        r.foregroundCamera.layers.mask = oldLayers;
      }

      const uniforms = r.compositeMaterial.uniforms;
      uniforms.uBackground.value = bg.texture;
      uniforms.uBackgroundLinear.value = 1;
      if (foregroundStale) {
        uniforms.uForeground.value = foregroundOpacity > 0
          ? passes.blur(r.foreground, r.foregroundBlur, rail.foregroundBlur, cinematic ? 1.6 : 0, "foregroundBlurX", "foregroundBlurY") : r.foreground.texture;
        uniforms.uLensMask.value = foregroundOpacity > 0
          ? passes.blur(r.mask, r.maskBlur, rail.foregroundBlur, 0, "maskBlurX", "maskBlurY") : r.mask.texture;
        fg.valid = true;
        fg.px = rig.position.x; fg.py = rig.position.y; fg.pz = rig.position.z;
        fg.rx = rig.rotation.x; fg.ry = rig.rotation.y; fg.rz = rig.rotation.z;
        fg.opacity = rig.opacity;
        fg.blur = rail.foregroundBlur;
        fg.fire = fireIntensity;
        fg.width = width;
        fg.height = height;
        fg.pixelRatio = pixelRatio;
      }
      uniforms.uForegroundOpacity.value = foregroundOpacity;
      uniforms.uLensPop.value = THREE.MathUtils.smoothstep(scrollP, 0.52, 0.64);
      uniforms.uTexel.value.set(1 / frame.targetWidth, 1 / frame.targetHeight);
      uniforms.toneMappingExposure.value = cinematic ? LOOK_EXPOSURE : gl.toneMappingExposure;
      uniforms.uAspect.value = viewAspect;
      // The background is rendered through the same lens as the view: no texture crop.
      uniforms.uTextureAspect.value = 0;
      uniforms.uBgCenterX.value = 0.5;
      uniforms.uLook.value = cinematic ? 1 : 0;
      uniforms.uLookPower.value = cinematic ? LOOK_POWER : 1;
      if (cinematic) {
        uniforms.uGrain.value = LOOK_GRAIN;
        uniforms.uGrainSeed.value = Math.round(scrollP * 400);
        uniforms.uFgSoft.value = rail.foregroundBlur > 0 ? 0 : 0.55;
        uniforms.uHeatPhase.value = scrollP * 60;
        const heat = uniforms.uHeat.value as THREE.Vector4[];
        for (let index = 0; index < FIREBALLS.length; index++) {
          const blast = FIREBALLS[index];
          if (scrollP < blast.hit) { heat[index].set(0, 0, 1, 0); continue; }
          const state = evaluateFireball(scrollP, index);
          // Screen UV (y up) of the fire body through the live lens; haze rises from there over the trees and sky.
          const base = r.heatPoint.set(blast.x, state.height + state.radius * 0.35, -30).project(r.backgroundCamera);
          const u = 0.5 * (base.x + 1);
          const v = 0.5 * (base.y + 1);
          const edge = r.heatPoint.set(blast.x + state.radius, state.height + state.radius * 0.35, -30).project(r.backgroundCamera);
          const halfWidth = Math.max(0.01, Math.abs(edge.x + 1 - 2 * u));
          heat[index].set(u, v, halfWidth, THREE.MathUtils.smoothstep(state.age, 0, 0.05) * (0.35 + 0.65 * Math.exp(-1.4 * state.age)));
        }
      }
      if (diagnostics) {
        if (!diagnostics.memory.foregroundGeometryBufferBytes) measureForegroundMemory();
        const targets = [r.background, r.backgroundBlur, r.backgroundBlurScratch, r.foreground, r.mask, r.foregroundBlur, r.maskBlur];
        diagnostics.memory = { ...diagnostics.memory,
          backgroundTargetBytes: r.background.width * r.background.height * (r.hdr ? 8 : 4),
          backgroundQuality: quality,
          targetColorBytes: targets.reduce((sum, target) => sum + target.width * target.height * (target.texture.type === THREE.HalfFloatType ? 8 : 4), 0),
          depthAttachmentBytes: (r.foreground.width * r.foreground.height + r.background.width * r.background.height) * 4,
          multisampleAttachmentBytes: r.foreground.width * r.foreground.height * r.foreground.samples * ((r.hdr ? 8 : 4) + 4)
            + r.background.width * r.background.height * r.background.samples * ((r.hdr ? 8 : 4) + 4),
          sharedRendererTextures: gl.info.memory.textures, sharedRendererGeometries: gl.info.memory.geometries,
          qualification: "RGBA storage estimates exclude driver/browser overhead and shared resources; renderer counts are not byte totals" };
      }
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
      gl.shadowMap.needsUpdate = oldShadowNeedsUpdate;
    }
  }, 1.5);

  return (
    <>
      {createPortal(<>
        <BeachWorld quality={quality} frozen={frozen} />
        <BlastFX progressRef={progressRef} quality={quality} />
      </>, resources.backgroundScene, { camera: resources.backgroundCamera })}
      {createPortal(<>
        {!cinematic && <>
          <hemisphereLight args={[resources.skyColor, resources.groundColor, 1.2]} />
          <directionalLight position={[12, 24, 14]} intensity={2.5} />
          <LegacyBlastLight progressRef={progressRef} />
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
          const drawn = drawnProgress.current;
          gpuTimer?.end();
          diagnostics?.record("composite", "cpu", performance.now() - compositeStart.current);
          diagnostics?.complete(performance.now(), Math.round(drawn * 1000), progressRef.current, drawn);
          onReady?.(drawn);
        }} />
    </>
  );
}

/** Legacy (?cinematic_games=0) orange fill on the hand, driven by the brightest blast flash. */
function LegacyBlastLight({ progressRef }: { progressRef: RefObject<number> }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!light.current || dt < 0) return;
    let flash = 0;
    for (let index = 0; index < FIREBALLS.length; index++) flash = Math.max(flash, evaluateFireball(progressRef.current, index).flash);
    light.current.intensity = flash * 0.12;
  });
  return <pointLight ref={light} position={[0.43, 2.9, 4.5]} color="orange" intensity={0} distance={4} />;
}
