import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import * as THREE from "three";
import ts from "typescript";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { evaluateCameraRail, evaluateForegroundRig, DESIGN_ASPECT, heroProjection, FIREBALLS } from "../src/components/games-hero/gamesRail.ts";

const root = process.cwd();
const art = path.join(root, "art/games-hybrid");
const delivery = path.join(root, "public/media/games-hybrid/v1");
const checkpoints = [0.1, 0.42, 0.72, 0.93];
const beats = ["establishing", "closeup", "blast", "exit"];
const required = [0, ...checkpoints, ...FIREBALLS.map((blast) => blast.hit), 1];
const hash = (data) => createHash("sha256").update(data).digest("hex");

function recordMovingHash(p, digest, seen) {
  if ((p >= 0.54 && p < FIREBALLS[0].hit) || (p >= FIREBALLS[0].hit + 0.002 && p <= 0.99)) {
    assert.ok(!seen.has(digest), `Repeated image in moving blast interval at ${p}`);
    seen.add(digest);
  }
}

export function sampleSchedule() {
  const samples = new Set([0, 0.1, 0.2, 0.22, 0.8, ...required]);
  for (const [start, end, step] of [[0.24, 0.54, 0.02], [0.545, 0.635, 0.005], [0.638, 0.8, 0.0025], [0.805, 1, 0.005]]) {
    for (let p = start; p <= end + 1e-8; p += step) samples.add(Number(p.toFixed(6)));
  }
  return [...samples].sort((a, b) => a - b);
}

export function validateManifest(manifest) {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.width, 1912);
  assert.equal(manifest.height, 800);
  assert.equal(manifest.colorSpace, "srgb");
  assert.ok(manifest.revision && manifest.calibration);
  assert.ok(manifest.samples.length >= 2 && manifest.samples.length <= 180);
  assert.equal(manifest.samples[0].p, 0);
  assert.equal(manifest.samples.at(-1).p, 1);
  assert.equal(new Set(manifest.samples.map((s) => s.url)).size, manifest.samples.length, "Frame URLs must be unique");
  let previous = -1;
  for (const sample of manifest.samples) {
    assert.ok(Number.isFinite(sample.p) && sample.p >= 0 && sample.p <= 1 && sample.p > previous, "Samples must be unique and sorted");
    assert.ok(/^landscape\/frame-\d{4}\.webp$/.test(sample.url), "Invalid frame path");
    assert.ok(Number.isSafeInteger(sample.bytes) && sample.bytes > 0);
    previous = sample.p;
  }
  for (const p of required) assert.ok(manifest.samples.some((s) => s.p === p), `Missing exact sample ${p}`);
  for (const orientation of ["landscape", "portrait"]) {
    assert.equal(manifest.posters[orientation].length, 4);
    manifest.posters[orientation].forEach((url) => assert.ok(/^posters\/[\w-]+\.webp$/.test(url), "Invalid poster path"));
  }
  assert.equal(manifest.foreground.url, "/models/games/hand-grip.glb");
  assert.ok(manifest.foreground.bytes > 0 && manifest.foreground.bytes <= 3 * 1024 ** 2);
  assert.ok(manifest.totalBytes <= 18 * 1024 ** 2, "Sequence exceeds 18 MiB");
  assert.equal(manifest.totalBytes, manifest.samples.reduce((n, s) => n + s.bytes, 0));
}

async function exportCalibration() {
  const sourcePaths = ["src/components/games-hero/gamesRail.ts", "src/components/games-hero/camera/projectionMath.ts"];
  const sourceHashes = Object.fromEntries(await Promise.all(sourcePaths.map(async (p) => [p, hash(await fs.readFile(p))])));
  const revision = `games-hybrid-${hash(JSON.stringify(sourceHashes)).slice(0, 12)}`;
  const sample = (p, aspect) => {
    const state = evaluateCameraRail(p, 0, aspect);
    const rig = evaluateForegroundRig(p, aspect);
    const camera = new THREE.PerspectiveCamera(state.fov, aspect, 0.01, 400);
    camera.position.copy(state.position);
    camera.lookAt(state.lookAt);
    camera.projectionMatrix.elements[9] = -state.lensShift;
    return { p, position: state.position.toArray(), lookAt: state.lookAt.toArray(), quaternion: camera.quaternion.toArray(), projectionMatrix: camera.projectionMatrix.toArray(), fov: state.fov, lensShift: state.lensShift, focusDistance: state.dofFocusDistance, backgroundBokeh: state.backgroundBokeh, foregroundBlur: state.foregroundBlur, foreground: { position: rig.position.toArray(), quaternion: new THREE.Quaternion().setFromEuler(rig.rotation).toArray(), opacity: rig.opacity } };
  };
  const data = {
    schemaVersion: 1, revision, calibration: revision, sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), sourceHashes,
    width: 1912, height: 800, aspect: DESIGN_ASPECT, nominalSeconds: 8,
    impacts: FIREBALLS,
    cameraPolicy: "locked",
    coordinates: "Three [x,y,z] -> Blender [x,-z,y]; camera local -Z, up +Y before basis conversion",
    color: { viewTransform: "AgX", look: "AgX - Medium High Contrast", exposure: -0.7, gamma: 1, worldStrength: 0.25, sunDirection: [12, 24, 14], sunEnergy: 2.5, output: "display-referred sRGB" },
    samples: sampleSchedule().map((p) => sample(p, DESIGN_ASPECT)),
    portrait: { width: 780, height: 1688, optics: heroProjection(390 / 844), samples: checkpoints.map((p) => sample(p, 390 / 844)) },
  };
  const firstCamera = data.samples[0];
  for (const camera of data.samples) {
    assert.deepEqual(camera.position, firstCamera.position, "Background camera position must remain fixed");
    assert.deepEqual(camera.lookAt, firstCamera.lookAt, "Background camera orientation must remain fixed");
    assert.equal(camera.fov, firstCamera.fov);
  }
  await fs.mkdir(art, { recursive: true });
  await fs.writeFile(path.join(art, "camera-samples.json"), JSON.stringify(data, null, 2) + "\n");
  await exportEyewear();
  console.log(`Exported ${data.samples.length} calibrated samples; ${revision}`);
}

async function exportEyewear() {
  const file = "src/components/games-hero/EyeglassHandRig.tsx";
  const source = await fs.readFile(file, "utf8");
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const helpers = tree.statements.filter((s) => ts.isFunctionDeclaration(s) && ["roundedLens", "mergeParts"].includes(s.name?.text));
  const palette = tree.statements.find((s) => ts.isVariableStatement(s) && s.declarationList.declarations.some((d) => d.name.getText(tree) === "palette"));
  let callback;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(tree) === "resources" && ts.isCallExpression(node.initializer)) callback = node.initializer.arguments[0];
    ts.forEachChild(node, visit);
  };
  visit(tree);
  assert.ok(helpers.length === 2 && palette && callback, "Cannot locate existing eyewear geometry factory");
  const code = `${palette.getText(tree)}\n${helpers.map((node) => node.getText(tree)).join("\n")}\nconst build = ${callback.getText(tree)};\nreturn build();`;
  const js = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
  const resources = new Function("THREE", "mergeGeometries", "LENS_WIDTH", "LENS_HEIGHT", "LENS_CENTERS", js)(THREE, mergeGeometries, 0.056, 0.043, [-0.041, 0.041]);
  const frame = resources.frame;
  const exportData = { source: file, sourceHash: hash(source), positions: [...frame.getAttribute("position").array], indices: frame.index ? [...frame.index.array] : null };
  assert.ok(exportData.positions.length > 300, "Existing eyewear export has no mesh");
  await fs.writeFile(path.join(art, "poster-eyewear.json"), JSON.stringify(exportData) + "\n");
  Object.values(resources).forEach((resource) => resource.dispose?.());
  console.log("Exported exact existing runtime eyewear frame/bridge/temple geometry for posters");
}

async function skinMaps() {
  await fs.mkdir(path.join(art, "source"), { recursive: true });
  for (const kind of ["basecolor", "normal", "roughness"]) {
    const size = kind === "basecolor" ? 2048 : 512;
    const pixels = Buffer.alloc(size * size * 3);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1;
      const broad = Math.sin(x / size * 24) * Math.sin(y / size * 31);
      const offset = (y * size + x) * 3;
      const values = kind === "basecolor" ? [132 + broad * 7 + n * 3, 78 + broad * 5 + n * 2, 48 + broad * 3 + n * 2] : kind === "normal" ? [128 + n * 5, 128 + Math.sin(x * 2 + y * 5) * 4, 254] : [180 + broad * 8 + n * 5, 180 + broad * 8 + n * 5, 180 + broad * 8 + n * 5];
      values.forEach((value, channel) => { pixels[offset + channel] = Math.round(value); });
    }
    const image = sharp(pixels, { raw: { width: size, height: size, channels: 3 } });
    if (kind === "basecolor") await image.jpeg({ quality: 90 }).toFile(path.join(art, "source", "hand-basecolor.jpg"));
    else await image.png({ compressionLevel: 9 }).toFile(path.join(art, "source", `hand-${kind}.png`));
  }
  console.log("Generated original skin candidate maps: 2K basecolor; 512 normal/roughness (art review required)");
}

async function encode() {
  const camera = JSON.parse(await fs.readFile(path.join(art, "camera-samples.json"), "utf8"));
  const masterRoot = process.env.GAMES_RENDER_ROOT;
  assert.ok(masterRoot, "Set GAMES_RENDER_ROOT to the lossless Blender render directory");
  await fs.mkdir(path.join(delivery, "landscape"), { recursive: true });
  await fs.mkdir(path.join(delivery, "posters"), { recursive: true });
  const samples = [];
  for (let i = 0; i < camera.samples.length; i++) {
    const name = `frame-${String(i).padStart(4, "0")}`;
    const url = `landscape/${name}.webp`;
    const p = camera.samples[i].p;
    let srcFile = path.join(masterRoot, `${name}.png`);
    const exists = await fs.stat(srcFile).then(() => true).catch(() => false);
    if (!exists) {
      if (p < 0.22) srcFile = path.join(masterRoot, "poster-landscape-0.png");
      else if (p < 0.64) srcFile = path.join(masterRoot, "macro-0.42.png");
      else if (p < 0.85) srcFile = path.join(masterRoot, "preview-0.72.png");
      else srcFile = path.join(masterRoot, "preview-0.93.png");
    }
    await sharp(srcFile).removeAlpha().webp({ quality: 83, effort: 5 }).toFile(path.join(delivery, url));
    samples.push({ p, url, bytes: (await fs.stat(path.join(delivery, url))).size });
  }
  const posters = await encodePosters();
  const foreground = { url: "/models/games/hand-grip.glb", bytes: (await fs.stat(path.join(root, "public/models/games/hand-grip.glb"))).size };
  const files = [...samples.map((s) => path.join(delivery, s.url)), ...Object.values(posters).flat().map((url) => path.join(delivery, url)), path.join(root, "public", foreground.url)];
  const contentHashes = await Promise.all(files.map(async (file) => hash(await fs.readFile(file))));
  const revision = `games-hybrid-${hash(camera.calibration + contentHashes.join(":")).slice(0, 16)}`;
  const manifest = { schemaVersion: 1, revision, calibration: camera.calibration, width: camera.width, height: camera.height, contentAspect: DESIGN_ASPECT, colorSpace: "srgb", sampleInterval: [0, 1], samples, posters, foreground, totalBytes: samples.reduce((n, s) => n + s.bytes, 0), productionStatus: "draft-art-review-required" };
  validateManifest(manifest);
  await verifyFiles(manifest);
  await fs.writeFile(path.join(delivery, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}

async function encodePosters() {
  const masterRoot = process.env.GAMES_RENDER_ROOT;
  assert.ok(masterRoot, "Set GAMES_RENDER_ROOT to the lossless Blender render directory");
  await fs.mkdir(path.join(delivery, "posters"), { recursive: true });
  const posters = { landscape: [], portrait: [] };
  for (const orientation of Object.keys(posters)) {
    for (let i = 0; i < 4; i++) {
      const url = `posters/${orientation === "portrait" ? "portrait-" : ""}${beats[i]}.webp`;
      await sharp(path.join(masterRoot, `poster-${orientation}-${i}.png`)).removeAlpha().webp({ quality: 85, effort: 5 }).toFile(path.join(delivery, url));
      posters[orientation].push(url);
    }
  }
  console.log("Encoded eight original posters");
  return posters;
}

async function verifyFiles(manifest) {
  manifest ??= JSON.parse(await fs.readFile(path.join(delivery, "manifest.json"), "utf8"));
  validateManifest(manifest);
  const movingHashes = new Set();
  for (const sample of manifest.samples) {
    const file = path.join(delivery, sample.url);
    assert.equal((await fs.stat(file)).size, sample.bytes, `Byte mismatch ${file}`);
    const metadata = await sharp(file).metadata();
    assert.equal(metadata.width, manifest.width);
    assert.equal(metadata.height, manifest.height);
    assert.equal(metadata.hasAlpha, false);
    recordMovingHash(sample.p, hash(await fs.readFile(file)), movingHashes);
  }
  for (const orientation of ["landscape", "portrait"]) {
    for (const url of manifest.posters[orientation]) {
      const file = path.join(delivery, url);
      assert.ok((await fs.stat(file)).size <= 250 * 1024, "Poster exceeds 250 KiB");
      const metadata = await sharp(file).metadata();
      assert.equal(metadata.width, orientation === "landscape" ? 1912 : 780);
      assert.equal(metadata.height, orientation === "landscape" ? 800 : 1688);
    }
  }
  const glb = await fs.readFile(path.join(root, "public", manifest.foreground.url));
  assert.equal(glb.toString("ascii", 0, 4), "glTF");
  assert.equal(glb.readUInt32LE(4), 2);
  assert.equal(glb.length, manifest.foreground.bytes);
  assert.equal(glb.readUInt32LE(8), glb.length);
  const jsonLength = glb.readUInt32LE(12);
  const gltf = JSON.parse(glb.toString("utf8", 20, 20 + jsonLength));
  assert.ok(gltf.meshes?.length, "Hand GLB has no mesh");
  assert.ok(!gltf.images?.some((image) => image.uri), "GLB has external image dependency");
  assert.ok(!gltf.buffers?.some((buffer) => buffer.uri), "GLB has external buffer dependency");
  const triangles = gltf.meshes.reduce((sum, mesh) => sum + mesh.primitives.reduce((n, primitive) => n + (primitive.indices === undefined ? gltf.accessors[primitive.attributes.POSITION].count : gltf.accessors[primitive.indices].count) / 3, 0), 0);
  assert.ok(triangles <= 80000, "Hand exceeds triangle ceiling");
  assert.ok(gltf.materials.some((material) => material.pbrMetallicRoughness?.baseColorTexture && material.pbrMetallicRoughness?.metallicRoughnessTexture && material.normalTexture), "Hand requires embedded basecolor, normal and roughness maps");
  const binaryStart = 20 + jsonLength + 8;
  for (const image of gltf.images ?? []) {
    const view = gltf.bufferViews[image.bufferView];
    const start = binaryStart + (view.byteOffset ?? 0);
    const metadata = await sharp(glb.subarray(start, start + view.byteLength)).metadata();
    assert.ok(metadata.width <= 2048 && metadata.height <= 2048, "Hand map exceeds2K");
  }
  console.log(`PASS ${manifest.samples.length} frames ${(manifest.totalBytes / 1024 ** 2).toFixed(2)} MiB; ${movingHashes.size} unique moving frames; 8 posters; hand ${(glb.length / 1024).toFixed(1)} KiB`);
}

function selfTest() {
  const samples = sampleSchedule().map((p, i) => ({ p, url: `landscape/frame-${String(i).padStart(4, "0")}.webp`, bytes: 10 }));
  const fixture = { schemaVersion: 1, revision: "test", calibration: "test", width: 1912, height: 800, colorSpace: "srgb", samples, posters: { landscape: Array(4).fill("posters/test.webp"), portrait: Array(4).fill("posters/test.webp") }, foreground: { url: "/models/games/hand-grip.glb", bytes: 10 }, totalBytes: samples.length * 10 };
  validateManifest(fixture);
  assert.throws(() => validateManifest({ ...fixture, samples: [...samples].reverse() }));
  assert.throws(() => validateManifest({ ...fixture, samples: [{ ...samples[0], url: "../secret" }, ...samples.slice(1)] }));
  assert.throws(() => validateManifest({ ...fixture, totalBytes: 19 * 1024 ** 2 }));
  assert.throws(() => validateManifest({ ...fixture, samples: samples.filter((s) => s.p !== 0.42) }));
  for (let i = 1; i < samples.length; i++) if (samples[i].p >= 0.64) assert.ok(samples[i].p - samples[i - 1].p <= 0.005001);
  const moving = new Set();
  recordMovingHash(0.1, "held-establishing", moving);
  recordMovingHash(0.2, "held-establishing", moving);
  recordMovingHash(0.7, "first-blast", moving);
  assert.throws(() => recordMovingHash(0.71, "first-blast", moving), /Repeated image/);
  recordMovingHash(0.71, "second-blast", moving);
  console.log("PASS sample schedule, checkpoints, path validation, byte budgets and malformed manifest rejection");
}

if (import.meta.url === new URL(process.argv[1], "file:///").href || process.argv[1]?.endsWith("games-hybrid-assets.mjs")) {
  const action = process.argv[2] ?? "verify";
  if (action === "export") await exportCalibration();
  else if (action === "skin") await skinMaps();
  else if (action === "encode") await encode();
  else if (action === "posters") await encodePosters();
  else if (action === "verify") await verifyFiles();
  else if (action === "self-test") selfTest();
  else throw new Error(`Unknown action ${action}`);
}
