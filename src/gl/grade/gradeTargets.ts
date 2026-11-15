// src/gl/grade/gradeTargets.ts
import * as THREE from "three";
import type { HeroGradeProfile } from "./gradeConfig";
import { isPerfProbeEnabled, reportGpuBytes } from "@/engine/perfProbe";
import { COMPOSITE_FRAG, DOWNSAMPLE_FRAG, FULLSCREEN_VERT, OVERLAY_FRAG, UPSAMPLE_FRAG } from "./gradeShaders";

/**
 * GradeRig: per-View grade resources (one per mounted HeroView).
 * Scene → HalfFloat MSAA target sized to the View's physical pixels → bloom chain →
 * composite drawn into the View's scissor on the default framebuffer.
 */

const MAX_BLOOM_MIPS = 5;
const MSAA4_PIXEL_LIMIT = 1_500_000; // above this, 2× MSAA keeps the target ≲100 MB at DPR 1.75
// At ≥1.5 device px per CSS px, edges are already supersampled by density; 2× MSAA is enough.
const DENSE_PIXEL_SCALE = 1.5;

let rigCounter = 0;

export interface ViewportRect {
  left: number;
  bottom: number;
  width: number;
  height: number;
}

export function supportsHdrTargets(gl: THREE.WebGLRenderer): boolean {
  return gl.capabilities.isWebGL2 && gl.extensions.has("EXT_color_buffer_float");
}

function makeTarget(w: number, h: number, samples: number, depth: boolean) {
  const rt = new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    colorSpace: THREE.NoColorSpace,
    depthBuffer: depth,
    stencilBuffer: false,
    samples,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
  });
  rt.texture.wrapS = rt.texture.wrapT = THREE.ClampToEdgeWrapping;
  return rt;
}

export class GradeRig {
  private sceneTarget: THREE.WebGLRenderTarget | null = null;
  private bloom: THREE.WebGLRenderTarget[] = [];
  private width = 0;
  private height = 0;
  private samples = 0;
  private mips = 0;
  private bytes = 0;
  private readonly id = `grade-rig-${++rigCounter}`;

  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad: THREE.Mesh;
  private readonly downMat: THREE.RawShaderMaterial;
  private readonly upMat: THREE.RawShaderMaterial;
  private readonly compositeMat: THREE.RawShaderMaterial;
  private readonly overlayMat: THREE.RawShaderMaterial;
  private readonly clearColor = new THREE.Color();

  constructor() {
    const geo = new THREE.BufferGeometry();
    // One oversized triangle covers the viewport with no diagonal seam.
    geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const base = { vertexShader: FULLSCREEN_VERT, glslVersion: THREE.GLSL3, depthTest: false, depthWrite: false };

    this.downMat = new THREE.RawShaderMaterial({
      ...base,
      fragmentShader: DOWNSAMPLE_FRAG,
      blending: THREE.NoBlending,
      uniforms: {
        tSrc: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uThreshold: { value: 0.8 },
        uKnee: { value: 0.2 },
        uPrefilter: { value: false },
      },
    });
    this.upMat = new THREE.RawShaderMaterial({
      ...base,
      fragmentShader: UPSAMPLE_FRAG,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendEquation: THREE.AddEquation,
      uniforms: { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uRadius: { value: 1 } },
    });
    this.compositeMat = new THREE.RawShaderMaterial({
      ...base,
      fragmentShader: COMPOSITE_FRAG,
      blending: THREE.NoBlending,
      uniforms: {
        tScene: { value: null },
        tBloom: { value: null },
        tLut: { value: null },
        uBloomOn: { value: true },
        uBloomIntensity: { value: 0.5 },
        uExposure: { value: 1.05 },
        uToneMap: { value: 0 },
        uLutSize: { value: 33 },
        uLutOpacity: { value: 0.75 },
        uVigOffset: { value: 0.35 },
        uVigDarkness: { value: 0.4 },
        uGrain: { value: 0.035 },
        uGrainSeed: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
      },
    });
    this.overlayMat = new THREE.RawShaderMaterial({
      ...base,
      fragmentShader: OVERLAY_FRAG,
      transparent: true,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
      uniforms: {
        uVigOffset: { value: 0.35 },
        uVigDarkness: { value: 0.4 },
      },
    });
    this.quad = new THREE.Mesh(geo, this.compositeMat);
    this.quad.frustumCulled = false;
  }

  private ensureTargets(w: number, h: number, mips: number, pixelScale: number) {
    const samples = w * h <= MSAA4_PIXEL_LIMIT && pixelScale < DENSE_PIXEL_SCALE ? 4 : 2;
    if (this.sceneTarget && w === this.width && h === this.height && samples === this.samples && mips === this.mips) return;
    if (isPerfProbeEnabled()) {
      // ?perf: reallocation log (each entry = targets rebuilt; should only follow resizes/quality steps)
      const g = globalThis as unknown as { __gradeAllocs?: string[] };
      (g.__gradeAllocs ??= []).push(`${w}x${h} s${samples} m${mips}`);
    }
    this.disposeTargets();
    this.width = w;
    this.height = h;
    this.samples = samples;
    this.mips = mips;
    this.sceneTarget = makeTarget(w, h, samples, true);
    // color + depth per sample, plus the resolved texture
    this.bytes = w * h * (8 + 4) * samples + w * h * 8;
    let bw = Math.max(1, w >> 1);
    let bh = Math.max(1, h >> 1);
    for (let i = 0; i < mips; i++) {
      this.bloom.push(makeTarget(bw, bh, 0, false));
      this.bytes += bw * bh * 8;
      bw = Math.max(1, bw >> 1);
      bh = Math.max(1, bh >> 1);
    }
    reportGpuBytes(this.id, this.bytes);
  }

  private disposeTargets() {
    this.sceneTarget?.dispose();
    this.sceneTarget = null;
    for (const rt of this.bloom) rt.dispose();
    this.bloom = [];
    this.bytes = 0;
    reportGpuBytes(this.id, 0);
  }

  private blit(gl: THREE.WebGLRenderer, material: THREE.Material, target: THREE.WebGLRenderTarget | null) {
    this.quad.material = material;
    gl.setRenderTarget(target);
    gl.render(this.quad, this.camera);
  }

  /**
   * Full grade. Caller has already updated the camera aspect.
   * `pixelScale` = devicePixelRatio × renderScale.
   */
  renderGraded(
    gl: THREE.WebGLRenderer,
    scene: THREE.Object3D,
    camera: THREE.Camera,
    view: ViewportRect,
    pixelScale: number,
    profile: HeroGradeProfile,
    lut: THREE.Texture,
    timeSec: number,
    bloomMips = MAX_BLOOM_MIPS
  ) {
    const w = Math.max(1, Math.round(view.width * pixelScale));
    const h = Math.max(1, Math.round(view.height * pixelScale));
    const mips = Math.min(MAX_BLOOM_MIPS, Math.max(0, bloomMips));
    this.ensureTargets(w, h, mips, pixelScale);
    const sceneTarget = this.sceneTarget!;

    const prevTarget = gl.getRenderTarget();
    const prevAutoClear = gl.autoClear;
    const prevClearAlpha = gl.getClearAlpha();
    gl.getClearColor(this.clearColor);

    // 1. Scene → linear HDR target (three skips tone mapping + OETF for non-XR targets).
    gl.setScissorTest(false);
    gl.setClearColor(0x000000, 0);
    gl.autoClear = true;
    gl.setRenderTarget(sceneTarget);
    gl.render(scene, camera);
    gl.autoClear = false;

    // 2. Bloom: threshold + Karis prefilter into mip 0, 13-tap down chain, tent up-chain.
    const bloomOn = mips > 0 && profile.bloom.intensity > 0;
    if (bloomOn) {
      const down = this.downMat.uniforms;
      let src: THREE.Texture = sceneTarget.texture;
      let srcW = w;
      let srcH = h;
      for (let i = 0; i < this.bloom.length; i++) {
        down.tSrc.value = src;
        down.uTexel.value.set(1 / srcW, 1 / srcH);
        down.uPrefilter.value = i === 0;
        down.uThreshold.value = profile.bloom.luminanceThreshold;
        down.uKnee.value = profile.bloom.luminanceThreshold * 0.5;
        this.blit(gl, this.downMat, this.bloom[i]);
        src = this.bloom[i].texture;
        srcW = this.bloom[i].width;
        srcH = this.bloom[i].height;
      }
      const up = this.upMat.uniforms;
      for (let i = this.bloom.length - 1; i > 0; i--) {
        up.tSrc.value = this.bloom[i].texture;
        up.uTexel.value.set(1 / this.bloom[i].width, 1 / this.bloom[i].height);
        this.blit(gl, this.upMat, this.bloom[i - 1]);
      }
    }

    // 3. Composite into the View's rectangle on the canvas.
    const u = this.compositeMat.uniforms;
    u.tScene.value = sceneTarget.texture;
    u.tBloom.value = bloomOn ? this.bloom[0].texture : sceneTarget.texture;
    u.tLut.value = lut;
    u.uBloomOn.value = bloomOn;
    // Mips are summed by the up-chain; normalise so intensity reads like postprocessing's mipmapBlur.
    u.uBloomIntensity.value = bloomOn ? profile.bloom.intensity / Math.max(1, this.bloom.length * 0.5) : 0;
    u.uExposure.value = profile.exposure;
    u.uToneMap.value = profile.toneMapping === "agx" ? 1 : 0;
    u.uLutSize.value = profile.lutSize;
    u.uLutOpacity.value = profile.lutOpacity;
    u.uVigOffset.value = profile.vignette.offset;
    u.uVigDarkness.value = profile.vignette.darkness;
    u.uGrain.value = profile.grain.opacity;
    u.uGrainSeed.value = Math.floor(timeSec * 24) % 997; // 24 Hz film cadence
    u.uResolution.value.set(w, h);

    this.quad.material = this.compositeMat;
    gl.setRenderTarget(null);
    gl.setViewport(view.left, view.bottom, view.width, view.height);
    gl.setScissor(view.left, view.bottom, view.width, view.height);
    gl.setScissorTest(true);
    gl.render(this.quad, this.camera);
    gl.setScissorTest(false);

    gl.setRenderTarget(prevTarget);
    gl.setClearColor(this.clearColor, prevClearAlpha);
    gl.autoClear = prevAutoClear;
  }

  /** Tier B: vignette drawn over drei's own render of the View. */
  renderOverlay(gl: THREE.WebGLRenderer, view: ViewportRect, profile: HeroGradeProfile) {
    const u = this.overlayMat.uniforms;
    u.uVigOffset.value = profile.vignette.offset;
    u.uVigDarkness.value = profile.vignette.darkness;
    const prevAutoClear = gl.autoClear;
    gl.autoClear = false;
    this.quad.material = this.overlayMat;
    gl.setRenderTarget(null);
    gl.setViewport(view.left, view.bottom, view.width, view.height);
    gl.setScissor(view.left, view.bottom, view.width, view.height);
    gl.setScissorTest(true);
    gl.render(this.quad, this.camera);
    gl.setScissorTest(false);
    gl.autoClear = prevAutoClear;
  }

  dispose() {
    this.disposeTargets();
    this.quad.geometry.dispose();
    this.downMat.dispose();
    this.upMat.dispose();
    this.compositeMat.dispose();
    this.overlayMat.dispose();
  }
}
