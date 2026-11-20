/**
 * Real-time missile strike: three missiles with contrails, fireballs, soot, dust, shockwave, debris and one
 * blast light. Every update is a pure function of scroll progress p (exact on reverse scroll); the noise
 * phase also derives from p, as the offline volumes' W = p · 15. No allocation in `update`.
 */
import * as THREE from "three";
import { chamferedBox } from "@/gl/art/geometry";
import {
  BLAST_LIGHT_GAIN,
  BLAST_LIGHT_RGB,
  BLAST_LIGHT_Y,
  BLAST_LIGHT_Z,
  FIREBALLS,
  blastWatts,
  fireballThermal,
  type FireballThermal,
} from "../gamesRail";
import {
  BLAST_COUNT,
  BLAST_SEEDS,
  FENCE_DUST_COUNT,
  FIRE_SPRITES_PER_BLAST,
  SMOKE_LOBES_PER_BLAST,
  TRAIL_RADIUS,
  TRAIL_SAMPLES,
  blastAge,
  blastHit,
  createLobeState,
  createShockState,
  debrisState,
  fenceDust,
  fireLobe,
  groundDust,
  missileApproach,
  missilePassP,
  missileVisible,
  shockwave,
  smokeLobe,
  trailPoint,
  trailRadiusProfile,
  trailResidue,
  trailVisible,
  trailWidthScale,
} from "./missilePath";
import { SUN_POSITION, SUN_STRENGTH } from "./beachLayout";
import { SUN_COLOR } from "./beachWorldBuild";
import {
  puffFragment,
  puffVertex,
  ribbonFragment,
  ribbonVertex,
  shockFragment,
  shockVertex,
  spriteFragment,
  spriteVertex,
} from "./fxShaders";

export type BlastQuality = 0 | 1 | 2;

/** Per-blast counts by quality level (0 best). Puffs are per missile. */
export const BLAST_FX_COUNTS = {
  fire: [22, 14, 10],
  smoke: [9, 6, 5],
  debris: [14, 8, 6],
  puffs: [140, 70, 0],
} as const;

/** BeachWorld's sun (the offline SUN at (12, 24, 14), strength 2.5): same direction, colour and radiance on white. */
export const FX_SUN_DIRECTION = new THREE.Vector3(...SUN_POSITION).normalize();
const sunLinear = new THREE.Color(SUN_COLOR);
export const FX_SUN_RADIANCE: readonly [number, number, number] = [sunLinear.r * SUN_STRENGTH, sunLinear.g * SUN_STRENGTH, sunLinear.b * SUN_STRENGTH];
/** Sky fill reaching the volumes (linear radiance on white). */
export const FX_SKY_AMBIENT: readonly [number, number, number] = [0.62, 0.7, 0.82];

/** Smoke optical depth per metre of lobe radius (py density 5); fire 8; dust .9. */
const SMOKE_DENSITY = 5;
const FIRE_DENSITY = 8;
const DUST_DENSITY = 0.9;
const NOISE_PHASE = 15;
/**
 * Share of the offline blast light that reaches the set. The Blender lamp sat inside opaque fire and behind
 * shadowing SUVs; the real-time light has no shadow and no volume to escape, so it is scaled down.
 */
export const BLAST_FX_LIGHT_SCALE = 0.035;

const premultiplied = {
  transparent: true,
  depthWrite: false,
  depthTest: true,
  fog: true,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneMinusSrcAlphaFactor,
  blendSrcAlpha: THREE.OneFactor,
  blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
} as const;

function sharedUniforms() {
  return {
    ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
    uPhase: { value: 0 },
    uSunRadiance: { value: new THREE.Vector3(...FX_SUN_RADIANCE) },
    uAmbient: { value: new THREE.Vector3(...FX_SKY_AMBIENT) },
  };
}

function instancedQuad(count: number) {
  const base = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = base.index;
  geometry.setAttribute("position", base.getAttribute("position"));
  geometry.instanceCount = 0;
  return { geometry, base, count };
}

function dynamicInstanced(geometry: THREE.InstancedBufferGeometry, name: string, count: number, size: number) {
  const attribute = new THREE.InstancedBufferAttribute(new Float32Array(count * size), size);
  attribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute(name, attribute);
  return attribute;
}

export class BlastFxSystem {
  readonly root = new THREE.Group();
  readonly light: THREE.PointLight;
  readonly counts: { fire: number; smoke: number; debris: number; puffs: number };

  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];

  // Volumetric sprites (fire, smoke, ground + fence dust): one sorted draw.
  private readonly sprites: THREE.Mesh;
  private readonly spriteGeometry: THREE.InstancedBufferGeometry;
  private readonly spriteMaterial: THREE.ShaderMaterial;
  private readonly spriteCapacity: number;
  private readonly stage: Float32Array; // 12 floats per logical sprite
  private readonly depth: Float32Array;
  private readonly order: Uint16Array;
  private readonly aCenter: THREE.InstancedBufferAttribute;
  private readonly aShape: THREE.InstancedBufferAttribute;
  private readonly aHeat: THREE.InstancedBufferAttribute;

  // Contrails.
  private readonly ribbon: THREE.Mesh;
  private readonly ribbonGeometry: THREE.BufferGeometry;
  private readonly ribbonMaterial: THREE.ShaderMaterial;
  private readonly ribbonPosition: THREE.BufferAttribute;
  private readonly ribbonAlong: THREE.BufferAttribute;
  private readonly ribbonDensity: THREE.BufferAttribute;
  private readonly trailCentres: Float32Array; // per trail, per sample xyz
  private readonly puffs: THREE.Mesh | null;
  private readonly puffGeometry: THREE.InstancedBufferGeometry | null;
  private readonly puffMaterial: THREE.ShaderMaterial | null;
  private readonly aPuff: THREE.InstancedBufferAttribute | null;
  private readonly aPuffMeta: THREE.InstancedBufferAttribute | null;

  // Missiles, debris, shockwave.
  private readonly missiles: THREE.InstancedMesh;
  private readonly debris: THREE.InstancedMesh;
  private readonly shock: THREE.Mesh;
  private readonly shockGeometry: THREE.InstancedBufferGeometry;
  private readonly shockMaterial: THREE.ShaderMaterial;
  private readonly aShock: THREE.InstancedBufferAttribute;
  private readonly aShockMeta: THREE.InstancedBufferAttribute;

  // Scratch.
  private readonly lobe = createLobeState();
  private readonly shockState = createShockState();
  private readonly thermal: FireballThermal = { cooling: 0, temperature: 0, heatGain: 0 };
  private readonly v0 = new THREE.Vector3();
  private readonly v1 = new THREE.Vector3();
  private readonly v2 = new THREE.Vector3();
  private readonly cameraPosition = new THREE.Vector3();
  private readonly viewRow = new THREE.Vector3();
  private readonly euler = new THREE.Euler();
  private readonly quaternion = new THREE.Quaternion();
  private readonly scale = new THREE.Vector3();
  private readonly matrix = new THREE.Matrix4();
  private readonly up = new THREE.Vector3(0, 1, 0);

  constructor(quality: BlastQuality) {
    this.root.name = "BlastFX";
    this.counts = {
      fire: BLAST_FX_COUNTS.fire[quality],
      smoke: BLAST_FX_COUNTS.smoke[quality],
      debris: BLAST_FX_COUNTS.debris[quality],
      puffs: BLAST_FX_COUNTS.puffs[quality],
    };

    // --- Sprites ---
    this.spriteCapacity = BLAST_COUNT * (this.counts.fire + this.counts.smoke + 1) + FENCE_DUST_COUNT;
    const quad = instancedQuad(this.spriteCapacity);
    this.spriteGeometry = quad.geometry;
    this.geometries.push(quad.base, quad.geometry);
    this.aCenter = dynamicInstanced(this.spriteGeometry, "aCenter", this.spriteCapacity, 4);
    this.aShape = dynamicInstanced(this.spriteGeometry, "aShape", this.spriteCapacity, 4);
    this.aHeat = dynamicInstanced(this.spriteGeometry, "aHeat", this.spriteCapacity, 4);
    this.stage = new Float32Array(this.spriteCapacity * 12);
    this.depth = new Float32Array(this.spriteCapacity);
    this.order = new Uint16Array(this.spriteCapacity);
    this.spriteMaterial = new THREE.ShaderMaterial({
      ...premultiplied,
      vertexShader: spriteVertex,
      fragmentShader: spriteFragment,
      uniforms: { ...sharedUniforms(), uSunView: { value: new THREE.Vector3() } },
    });
    this.materials.push(this.spriteMaterial);
    this.sprites = new THREE.Mesh(this.spriteGeometry, this.spriteMaterial);
    this.sprites.name = "BlastFX.volumes";
    this.sprites.frustumCulled = false;
    this.sprites.renderOrder = 3;

    // --- Contrail ribbons: 3 trails × TRAIL_SAMPLES × 2 vertices ---
    const vertices = BLAST_COUNT * TRAIL_SAMPLES * 2;
    this.ribbonGeometry = new THREE.BufferGeometry();
    this.ribbonPosition = new THREE.BufferAttribute(new Float32Array(vertices * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.ribbonAlong = new THREE.BufferAttribute(new Float32Array(vertices), 1).setUsage(THREE.DynamicDrawUsage);
    this.ribbonDensity = new THREE.BufferAttribute(new Float32Array(vertices), 1).setUsage(THREE.DynamicDrawUsage);
    const side = new Float32Array(vertices);
    const index: number[] = [];
    for (let trail = 0; trail < BLAST_COUNT; trail++) {
      for (let j = 0; j < TRAIL_SAMPLES; j++) {
        const v = (trail * TRAIL_SAMPLES + j) * 2;
        side[v] = -1;
        side[v + 1] = 1;
        if (j < TRAIL_SAMPLES - 1) index.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
      }
    }
    this.ribbonGeometry.setAttribute("position", this.ribbonPosition);
    this.ribbonGeometry.setAttribute("aAlong", this.ribbonAlong);
    this.ribbonGeometry.setAttribute("aDensity", this.ribbonDensity);
    this.ribbonGeometry.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
    this.ribbonGeometry.setIndex(index);
    this.geometries.push(this.ribbonGeometry);
    this.trailCentres = new Float32Array(BLAST_COUNT * TRAIL_SAMPLES * 3);
    this.ribbonMaterial = new THREE.ShaderMaterial({
      ...premultiplied,
      side: THREE.DoubleSide,
      vertexShader: ribbonVertex,
      fragmentShader: ribbonFragment,
      uniforms: sharedUniforms(),
    });
    this.materials.push(this.ribbonMaterial);
    this.ribbon = new THREE.Mesh(this.ribbonGeometry, this.ribbonMaterial);
    this.ribbon.name = "BlastFX.contrails";
    this.ribbon.frustumCulled = false;
    this.ribbon.renderOrder = 2;

    // --- Contrail puffs ---
    if (this.counts.puffs > 0) {
      const puffCapacity = BLAST_COUNT * this.counts.puffs;
      const puffQuad = instancedQuad(puffCapacity);
      this.puffGeometry = puffQuad.geometry;
      this.geometries.push(puffQuad.base, puffQuad.geometry);
      this.aPuff = dynamicInstanced(this.puffGeometry, "aPuff", puffCapacity, 4);
      this.aPuffMeta = dynamicInstanced(this.puffGeometry, "aPuffMeta", puffCapacity, 2);
      this.puffMaterial = new THREE.ShaderMaterial({
        ...premultiplied,
        vertexShader: puffVertex,
        fragmentShader: puffFragment,
        uniforms: sharedUniforms(),
      });
      this.materials.push(this.puffMaterial);
      this.puffs = new THREE.Mesh(this.puffGeometry, this.puffMaterial);
      this.puffs.name = "BlastFX.puffs";
      this.puffs.frustumCulled = false;
      this.puffs.renderOrder = 2;
    } else {
      this.puffs = null;
      this.puffGeometry = null;
      this.puffMaterial = null;
      this.aPuff = null;
      this.aPuffMeta = null;
    }

    // --- Missiles: slim dark bodies along their velocity ---
    const missileGeometry = new THREE.CapsuleGeometry(0.08, 0.55, 3, 8);
    const missileMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.018, 0.023, 0.02), roughness: 0.55, metalness: 0.3 });
    this.geometries.push(missileGeometry);
    this.materials.push(missileMaterial);
    this.missiles = new THREE.InstancedMesh(missileGeometry, missileMaterial, BLAST_COUNT);
    this.missiles.name = "BlastFX.missiles";
    this.missiles.frustumCulled = false;
    this.missiles.count = 0;
    this.missiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // --- Debris: chamfered masonry, some charred ---
    const debrisGeometry = chamferedBox(1, 1, 1, 0.12);
    const debrisMaterial = new THREE.MeshStandardMaterial({ roughness: 0.85 });
    this.geometries.push(debrisGeometry);
    this.materials.push(debrisMaterial);
    const debrisCapacity = BLAST_COUNT * this.counts.debris;
    this.debris = new THREE.InstancedMesh(debrisGeometry, debrisMaterial, debrisCapacity);
    this.debris.name = "BlastFX.debris";
    this.debris.frustumCulled = false;
    this.debris.count = 0;
    this.debris.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const stone = new THREE.Color(0.6, 0.56, 0.43);
    const charred = new THREE.Color(0.09, 0.075, 0.06);
    const tint = new THREE.Color();
    for (let i = 0; i < debrisCapacity; i++) {
      this.debris.setColorAt(i, tint.copy(stone).lerp(charred, (i * 0.618) % 1 < 0.2 ? 0.8 : 0.05));
    }

    // --- Shockwave bands ---
    const band = new THREE.CylinderGeometry(1, 1, 1, 64, 1, true).translate(0, 0.5, 0);
    this.shockGeometry = new THREE.InstancedBufferGeometry();
    this.shockGeometry.index = band.index;
    this.shockGeometry.setAttribute("position", band.getAttribute("position"));
    this.shockGeometry.setAttribute("uv", band.getAttribute("uv"));
    this.shockGeometry.instanceCount = 0;
    this.geometries.push(band, this.shockGeometry);
    this.aShock = dynamicInstanced(this.shockGeometry, "aShock", BLAST_COUNT, 4);
    this.aShockMeta = dynamicInstanced(this.shockGeometry, "aShockMeta", BLAST_COUNT, 2);
    this.shockMaterial = new THREE.ShaderMaterial({
      ...premultiplied,
      side: THREE.DoubleSide,
      vertexShader: shockVertex,
      fragmentShader: shockFragment,
      uniforms: { ...sharedUniforms(), uSunWorld: { value: FX_SUN_DIRECTION.clone() } },
    });
    this.materials.push(this.shockMaterial);
    this.shock = new THREE.Mesh(this.shockGeometry, this.shockMaterial);
    this.shock.name = "BlastFX.shockwave";
    this.shock.frustumCulled = false;
    this.shock.renderOrder = 1;

    // --- One blast light; always present so the light count (and every shader) never changes. ---
    this.light = new THREE.PointLight(new THREE.Color().setRGB(...BLAST_LIGHT_RGB), 0, 0, 2);
    this.light.name = "BlastFX.light";
    this.light.position.set(FIREBALLS[1].x, BLAST_LIGHT_Y, BLAST_LIGHT_Z);

    this.root.add(this.shock, this.ribbon, this.sprites, this.missiles, this.debris, this.light);
    if (this.puffs) this.root.add(this.puffs);
  }

  update(p: number, camera: THREE.Camera) {
    camera.updateMatrixWorld();
    this.cameraPosition.setFromMatrixPosition(camera.matrixWorld);
    const phase = p * NOISE_PHASE;
    this.spriteMaterial.uniforms.uPhase.value = phase;
    this.ribbonMaterial.uniforms.uPhase.value = phase;
    this.shockMaterial.uniforms.uPhase.value = phase;
    (this.spriteMaterial.uniforms.uSunView.value as THREE.Vector3)
      .copy(FX_SUN_DIRECTION)
      .transformDirection(camera.matrixWorldInverse);

    this.updateContrails(p);
    this.updateMissiles(p);
    this.updateSprites(p, camera);
    this.updateShock(p);
    this.updateDebris(p);
    this.updateLight(p);
  }

  private updateContrails(p: number) {
    const pos = this.ribbonPosition.array as Float32Array;
    const along = this.ribbonAlong.array as Float32Array;
    const density = this.ribbonDensity.array as Float32Array;
    const centre = this.v0;
    const next = this.v1;
    const sideways = this.v2;
    for (let trail = 0; trail < BLAST_COUNT; trail++) {
      const visible = trailVisible(p, trail);
      const approach = missileApproach(p, trail);
      const residue = trailResidue(p, trail);
      const width = TRAIL_RADIUS * trailWidthScale(p, trail);
      for (let j = 0; j < TRAIL_SAMPLES; j++) {
        const t = (approach * j) / (TRAIL_SAMPLES - 1);
        trailPoint(trail, t, centre);
        const c = (trail * TRAIL_SAMPLES + j) * 3;
        this.trailCentres[c] = centre.x;
        this.trailCentres[c + 1] = centre.y;
        this.trailCentres[c + 2] = centre.z;
      }
      for (let j = 0; j < TRAIL_SAMPLES; j++) {
        const c = (trail * TRAIL_SAMPLES + j) * 3;
        centre.fromArray(this.trailCentres, c);
        const a = Math.max(0, j - 1);
        const b = Math.min(TRAIL_SAMPLES - 1, j + 1);
        next.fromArray(this.trailCentres, (trail * TRAIL_SAMPLES + b) * 3);
        sideways.fromArray(this.trailCentres, (trail * TRAIL_SAMPLES + a) * 3);
        next.sub(sideways); // tangent
        sideways.subVectors(centre, this.cameraPosition).cross(next);
        const length = sideways.length();
        const radius = visible ? width * trailRadiusProfile(j) : 0;
        // Never thinner than ~1.2 px at 800 px tall (keeps the far end from aliasing into dashes).
        const distance = centre.distanceTo(this.cameraPosition);
        const halfWidth = visible ? Math.max(radius, distance * 0.0011) : 0;
        if (length > 1e-6) sideways.multiplyScalar(halfWidth / length);
        else sideways.set(0, 0, 0);
        const v = (trail * TRAIL_SAMPLES + j) * 2;
        pos[v * 3] = centre.x - sideways.x;
        pos[v * 3 + 1] = centre.y - sideways.y;
        pos[v * 3 + 2] = centre.z - sideways.z;
        pos[v * 3 + 3] = centre.x + sideways.x;
        pos[v * 3 + 4] = centre.y + sideways.y;
        pos[v * 3 + 5] = centre.z + sideways.z;
        // Curve parameter in metres-ish, anchored to the world so the noise does not swim.
        const s = ((approach * j) / (TRAIL_SAMPLES - 1)) * 60;
        along[v] = s;
        along[v + 1] = s;
        // py: density 4.5 × residue through a 2r chord; a strip widened to the pixel floor thins to match.
        const optical = halfWidth > 0 ? 4.5 * residue * 2 * radius * (radius / halfWidth) * 1.6 : 0;
        density[v] = optical;
        density[v + 1] = optical;
      }
    }
    this.ribbonPosition.needsUpdate = true;
    this.ribbonAlong.needsUpdate = true;
    this.ribbonDensity.needsUpdate = true;

    if (!this.puffGeometry || !this.aPuff || !this.aPuffMeta) return;
    const puff = this.aPuff.array as Float32Array;
    const meta = this.aPuffMeta.array as Float32Array;
    const perTrail = this.counts.puffs;
    let n = 0;
    for (let trail = 0; trail < BLAST_COUNT; trail++) {
      if (!trailVisible(p, trail)) continue;
      const approach = missileApproach(p, trail);
      const residue = trailResidue(p, trail);
      for (let i = 0; i < perTrail; i++) {
        const seed = (i * 0.754877 + trail * 0.56984) % 1;
        const t = (i + seed) / perTrail;
        if (t > approach) continue;
        const age = Math.max(0, p - missilePassP(t, trail));
        trailPoint(trail, t, centre);
        const spread = Math.min(1, age / 0.08);
        // Vapour sags and drifts slightly downwind as it ages; density thins as it spreads.
        const angle = seed * 6.2831 + i * 2.39996;
        const offset = 0.05 + 0.3 * spread;
        const radius = (0.18 + 0.32 * spread) * (0.7 + 0.6 * ((seed * 7.31) % 1));
        puff[n * 4] = centre.x + Math.cos(angle) * offset + age * 2.0;
        puff[n * 4 + 1] = centre.y + Math.sin(angle) * offset - age * 1.5;
        puff[n * 4 + 2] = centre.z;
        puff[n * 4 + 3] = radius;
        meta[n * 2] = (0.3 * residue * 0.12) / radius;
        meta[n * 2 + 1] = seed;
        n++;
      }
    }
    this.puffGeometry.instanceCount = n;
    this.aPuff.needsUpdate = true;
    this.aPuffMeta.needsUpdate = true;
  }

  private updateMissiles(p: number) {
    let n = 0;
    const head = this.v0;
    const ahead = this.v1;
    for (let index = 0; index < BLAST_COUNT; index++) {
      if (!missileVisible(p, index)) continue;
      const approach = missileApproach(p, index);
      trailPoint(index, approach, head);
      trailPoint(index, Math.min(1, approach + 0.01), ahead);
      ahead.sub(head);
      if (ahead.lengthSq() < 1e-10) ahead.set(0, -1, 1);
      this.quaternion.setFromUnitVectors(this.up, ahead.normalize());
      this.matrix.compose(head, this.quaternion, this.scale.set(1, 1, 1));
      this.missiles.setMatrixAt(n++, this.matrix);
    }
    this.missiles.count = n;
    this.missiles.instanceMatrix.needsUpdate = true;
  }

  private pushSprite(n: number, kind: number, seed: number, opticalPerMetre: number, sizeScale: number, heatGain: number, kelvin: number, glow: number, age: number) {
    const lobe = this.lobe;
    const s = this.stage;
    const o = n * 12;
    const rx = lobe.rx * sizeScale;
    const ry = lobe.ry * sizeScale;
    s[o] = lobe.x;
    s[o + 1] = lobe.y;
    s[o + 2] = lobe.z;
    s[o + 3] = seed;
    s[o + 4] = rx;
    s[o + 5] = ry;
    // Path length through the ellipsoid centre ≈ its depth diameter.
    s[o + 6] = opticalPerMetre * 2 * lobe.rz;
    s[o + 7] = kind;
    s[o + 8] = heatGain;
    s[o + 9] = kelvin;
    s[o + 10] = glow;
    s[o + 11] = age;
  }

  private updateSprites(p: number, camera: THREE.Camera) {
    const lobe = this.lobe;
    const fireScale = 1.08 * (FIRE_SPRITES_PER_BLAST / this.counts.fire) ** 0.3;
    const smokeScale = 1.1 * (SMOKE_LOBES_PER_BLAST / this.counts.smoke) ** 0.3;
    let n = 0;
    for (let index = 0; index < BLAST_COUNT; index++) {
      if (p < blastHit(index)) continue;
      const age = blastAge(p, index);
      const thermal = fireballThermal(age, this.thermal);
      // The flash: the first instants are white-hot and swollen with emission.
      const flash = Math.exp(-age / 0.05);
      const glow = 0.9 * thermal.cooling + 2.5 * flash;
      // py: smoke density 5 · min(1, max(0, (age - .08) / .5)).
      const smokeGain = SMOKE_DENSITY * Math.min(1, Math.max(0, (age - 0.08) / 0.5));
      if (smokeGain > 0) {
        for (let j = 0; j < this.counts.smoke; j++) {
          smokeLobe(p, index, j, lobe);
          this.pushSprite(n++, 0, (index * 9 + j) * 0.137 + 0.11, smokeGain, smokeScale, 0, 0, glow * (1 - j / 9), age);
        }
      }
      for (let j = 0; j < this.counts.fire; j++) {
        fireLobe(p, index, j, lobe);
        const heat = thermal.heatGain / 7.5 + flash * 1.5;
        this.pushSprite(n++, 1, (index * 22 + j) * 0.0731 + 0.37, FIRE_DENSITY, fireScale, heat, thermal.temperature + flash * 1500, 0, age);
      }
      groundDust(p, index, lobe);
      // Fades as it spreads thin (the offline dust volume kept a constant .9 gain).
      const dustFade = Math.exp(-age * 1.6) * Math.min(1, age / 0.15);
      if (dustFade > 0.01) this.pushSprite(n++, 2, 0.71 + index * 0.21, DUST_DENSITY * 2.2 * dustFade, 1.0, 0, 0, glow * 0.6, age);
    }
    for (let j = 0; j < FENCE_DUST_COUNT; j++) {
      const density = fenceDust(p, j, lobe);
      if (density > 0.002) this.pushSprite(n++, 2, 0.3 + j * 0.173, density * 1.8, 1.25, 0, 0, 0, 0);
    }

    // Back-to-front by view depth (insertion sort; n ≤ ~110).
    const e = camera.matrixWorldInverse.elements;
    this.viewRow.set(e[2], e[6], e[10]);
    for (let i = 0; i < n; i++) {
      const o = i * 12;
      this.depth[i] = this.viewRow.x * this.stage[o] + this.viewRow.y * this.stage[o + 1] + this.viewRow.z * this.stage[o + 2] + e[14];
      let k = i;
      while (k > 0 && this.depth[this.order[k - 1]] > this.depth[i]) {
        this.order[k] = this.order[k - 1];
        k--;
      }
      this.order[k] = i;
    }
    const center = this.aCenter.array as Float32Array;
    const shape = this.aShape.array as Float32Array;
    const heat = this.aHeat.array as Float32Array;
    for (let i = 0; i < n; i++) {
      const o = this.order[i] * 12;
      for (let k = 0; k < 4; k++) {
        center[i * 4 + k] = this.stage[o + k];
        shape[i * 4 + k] = this.stage[o + 4 + k];
        heat[i * 4 + k] = this.stage[o + 8 + k];
      }
    }
    this.spriteGeometry.instanceCount = n;
    this.aCenter.needsUpdate = true;
    this.aShape.needsUpdate = true;
    this.aHeat.needsUpdate = true;
  }

  private updateShock(p: number) {
    const shock = this.aShock.array as Float32Array;
    const meta = this.aShockMeta.array as Float32Array;
    let n = 0;
    for (let index = 0; index < BLAST_COUNT; index++) {
      const state = shockwave(p, index, this.shockState);
      if (!state.visible) continue;
      // The offline torus keeps .9 density; as a thin band it must fade as it spreads.
      const fade = Math.exp(-state.seconds * 2.6) * Math.min(1, state.seconds / 0.04);
      if (fade < 0.01) continue;
      shock[n * 4] = FIREBALLS[index].x;
      shock[n * 4 + 1] = -31;
      shock[n * 4 + 2] = state.radius;
      // Torus half-height × 2, with a floor so the band reads at grazing angles.
      shock[n * 4 + 3] = Math.max(0.3, Math.min(0.5 * state.radius, 2 * state.halfHeight + 1.2 / (1 + state.seconds * 2)));
      meta[n * 2] = DUST_DENSITY * 1.6 * fade;
      meta[n * 2 + 1] = index * 0.37 + 0.2;
      n++;
    }
    this.shockGeometry.instanceCount = n;
    this.aShock.needsUpdate = true;
    this.aShockMeta.needsUpdate = true;
  }

  private updateDebris(p: number) {
    let n = 0;
    const position = this.v0;
    const per = this.counts.debris;
    for (let index = 0; index < BLAST_COUNT; index++) {
      if (p < blastHit(index)) continue;
      const seeds = BLAST_SEEDS[index].debris;
      for (let j = 0; j < per; j++) {
        debrisState(p, index, j, position, this.euler);
        this.quaternion.setFromEuler(this.euler);
        const size = seeds[j].size;
        this.matrix.compose(position, this.quaternion, this.scale.set(size.x, size.y, size.z));
        this.debris.setMatrixAt(n++, this.matrix);
      }
    }
    this.debris.count = n;
    this.debris.instanceMatrix.needsUpdate = true;
  }

  private updateLight(p: number) {
    let watts = 0;
    let x = 0;
    for (let index = 0; index < BLAST_COUNT; index++) {
      const w = blastWatts(p, index);
      watts += w;
      x += FIREBALLS[index].x * w;
    }
    // Candela for decay-2 falloff: I / d² is blastEnergy's irradiance × BLAST_FX_LIGHT_SCALE.
    this.light.intensity = (BLAST_FX_LIGHT_SCALE * BLAST_LIGHT_GAIN * watts) / (4 * Math.PI);
    if (watts > 0) this.light.position.set(x / watts, BLAST_LIGHT_Y, BLAST_LIGHT_Z);
  }

  dispose() {
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.missiles.dispose();
    this.debris.dispose();
    this.light.dispose();
    // Children stay attached: GPU resources re-upload if a StrictMode remount reuses the system.
  }
}
