import * as THREE from "three";

/**
 * Character set for the 10x8 (80-cell) Texture Atlas.
 * Provides complete uppercase Latin alphanumeric glyphs, Tamil cultural markers,
 * navigation arrows, and authentic railway departure punctuation.
 */
export const CHAR_SET = [
  // Row 0: Space, Numbers 0-8
  " ", "0", "1", "2", "3", "4", "5", "6", "7", "8",
  // Row 1: Number 9, Letters A-I
  "9", "A", "B", "C", "D", "E", "F", "G", "H", "I",
  // Row 2: Letters J-S
  "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S",
  // Row 3: Letters T-Z, Symbols
  "T", "U", "V", "W", "X", "Y", "Z", "·", "-", "/",
  // Row 4: Punctuation & Railway Glyphs
  ":", ".", ",", "?", "!", "'", "\"", "(", ")", "+",
  // Row 5: Indicators & Symbols
  "★", "✦", "■", "↓", "→", "←", "%", "&", "=", "_",
  // Row 6: Tamil Key Characters for "வணக்கம்" & Sangam Titles
  "வ", "ண", "க", "்", "ம", "த", "ி", "ழ", "ச", "ங",
  // Row 7: Tamil Supporting Glyphs & Dedicated Composite Glyphs
  "ய", "ா", "ர", "ப", "ல", "க்", "ம்", "ே", "ை", "ழ்",
] as const;

export const ATLAS_COLS = 10;
export const ATLAS_ROWS = 8;

// Fast lookup map from character to atlas [col, row]
const CHAR_MAP: Record<string, [number, number]> = {};
CHAR_SET.forEach((char, index) => {
  const col = index % ATLAS_COLS;
  const row = Math.floor(index / ATLAS_COLS);
  CHAR_MAP[char] = [col, row];
  if (char.length === 1 && char >= "A" && char <= "Z") {
    CHAR_MAP[char.toLowerCase()] = [col, row];
  }
});

// Cultural ligature fallbacks
CHAR_MAP["மி"] = CHAR_MAP["ம"] || [4, 6];
CHAR_MAP["தி"] = CHAR_MAP["த"] || [5, 6];

/**
 * Splits text into grapheme clusters using Intl.Segmenter.
 * Adheres strictly to the tamil-text skill so composite Tamil glyphs
 * (e.g., 'க்', 'ம்', 'ழ்') are treated as atomic units.
 */
export function splitIntoGraphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("ta", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return text.split("");
}

/**
 * Resolves the UV coordinate [col, row] for a given character.
 * Falls back to space ' ' if character is not present in the atlas.
 */
export function getCharUvOffset(char: string): [number, number] {
  if (!char) return CHAR_MAP[" "] || [0, 0];
  if (CHAR_MAP[char]) return CHAR_MAP[char];
  const upper = char.toUpperCase();
  if (CHAR_MAP[upper]) return CHAR_MAP[upper];
  return CHAR_MAP[" "] || [0, 0];
}

/**
 * Generates an off-screen 1024x1024 CanvasTexture atlas.
 * Renders high-contrast, mechanical vintage railway typography (Courier New / Space Mono)
 * with authentic split-flap physical divider aesthetics and high-resolution antialiasing.
 */
export function createSplitFlapTextureAtlas(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const cellW = size / ATLAS_COLS; // 102.4px
  const cellH = size / ATLAS_ROWS; // 128px

  // Background: Deep matte charcoal railroad flap finish (#141211)
  ctx.fillStyle = "#141211";
  ctx.fillRect(0, 0, size, size);

  // Render each character in its respective cell
  CHAR_SET.forEach((char, index) => {
    const col = index % ATLAS_COLS;
    const row = Math.floor(index / ATLAS_COLS);
    const x = col * cellW;
    const y = row * cellH;

    // Tile subtle bezel border
    ctx.strokeStyle = "#25211e";
    ctx.lineWidth = 1.0;
    ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);

    // Subtle dark gradient on tile top half
    const gradTop = ctx.createLinearGradient(x, y, x, y + cellH * 0.5);
    gradTop.addColorStop(0, "#1c1816");
    gradTop.addColorStop(1, "#131110");
    ctx.fillStyle = gradTop;
    ctx.fillRect(x + 2, y + 2, cellW - 4, cellH * 0.5 - 2);

    // Subtle dark gradient on tile bottom half
    const gradBottom = ctx.createLinearGradient(x, y + cellH * 0.5, x, y + cellH);
    gradBottom.addColorStop(0, "#110f0e");
    gradBottom.addColorStop(1, "#181514");
    ctx.fillStyle = gradBottom;
    ctx.fillRect(x + 2, y + cellH * 0.5, cellW - 4, cellH * 0.5 - 2);

    // Character rendering: Authentic ivory-cream railroad departure paint (#FFF4DC)
    if (char !== " ") {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const isTamil = /[\u0B80-\u0BFF]/.test(char);
      ctx.font = isTamil
        ? "bold 64px 'Mukta Malar', 'Anek Tamil', sans-serif"
        : "bold 82px 'Courier New', monospace";

      // Shadow for stamped physical plate depth
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fillText(char, x + cellW / 2 + 1.5, y + cellH / 2 + 2);

      // Primary crisp vintage character
      ctx.fillStyle = "#FFF4DC";
      ctx.fillText(char, x + cellW / 2, y + cellH / 2);
      ctx.restore();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  return texture;
}

/**
 * Material for the Static Backing InstancedMesh.
 * Displays the top-half card with `aUvTop` and bottom-half card with `aUvBottom`.
 */
export function createSplitFlapBackingMaterial(atlasTexture: THREE.Texture): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    map: atlasTexture,
    roughness: 0.7,
    metalness: 0.3,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uAtlasCols = { value: ATLAS_COLS };
    shader.uniforms.uAtlasRows = { value: ATLAS_ROWS };

    shader.vertexShader =
      `
      attribute vec2 aUvTop;    // col, row for top half
      attribute vec2 aUvBottom; // col, row for bottom half
      attribute float aIsTopCard; // 1.0 for top half card, 0.0 for bottom half card
      varying vec2 vAtlasUv;
      varying vec2 vLocalUv;
      uniform float uAtlasCols;
      uniform float uAtlasRows;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <uv_vertex>",
      `
      #include <uv_vertex>
      vLocalUv = uv;

      vec2 cellSize = vec2(1.0 / uAtlasCols, 1.0 / uAtlasRows);
      vec2 charCoord = (aIsTopCard > 0.5) ? aUvTop : aUvBottom;

      // uv.x goes from 0 to 1 across card width
      float normU = (charCoord.x + uv.x) * cellSize.x;

      // Top card uses relative Y in [0.5, 1.0]; bottom card uses relative Y in [0.0, 0.5]
      float relY = (aIsTopCard > 0.5) ? (0.5 + 0.5 * uv.y) : (0.5 * uv.y);
      float normV = 1.0 - (charCoord.y + (1.0 - relY)) * cellSize.y;

      vAtlasUv = vec2(normU, normV);
      `
    );

    shader.fragmentShader =
      `
      varying vec2 vAtlasUv;
      varying vec2 vLocalUv;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
      #ifdef USE_MAP
        vec4 sampledDiffuseColor = texture2D(map, vAtlasUv);
        diffuseColor *= sampledDiffuseColor;

        // Vintage station departure board backlit plate luminescence
        float isChar = step(0.35, sampledDiffuseColor.r);
        diffuseColor.rgb += vec3(1.0, 0.95, 0.86) * (isChar * 0.35);
      #endif

      // Edge shadow along the card boundaries
      float edgeVignette = smoothstep(0.0, 0.05, min(vLocalUv.x, 1.0 - vLocalUv.x)) *
                           smoothstep(0.0, 0.05, min(vLocalUv.y, 1.0 - vLocalUv.y));
      diffuseColor.rgb *= (0.78 + 0.22 * edgeVignette);
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      `
      #include <emissivemap_fragment>
      #ifdef USE_MAP
        vec4 sampledForEmissive = texture2D(map, vAtlasUv);
        float isCharGlow = step(0.35, sampledForEmissive.r);
        totalEmissiveRadiance += vec3(1.0, 0.95, 0.85) * (isCharGlow * 0.55);
      #endif
      `
    );
  };

  return mat;
}

/**
 * Material for the Rotating Flap InstancedMesh.
 * Dual-plane geometry rotates around X axis by `aFlipProgress * -PI`.
 * Collapses to vec3(0.0) when at rest (aFlipProgress <= 0.001) to prevent any obstruction.
 */
export function createSplitFlapFlapMaterial(atlasTexture: THREE.Texture): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    map: atlasTexture,
    roughness: 0.65,
    metalness: 0.35,
    side: THREE.DoubleSide,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uAtlasCols = { value: ATLAS_COLS };
    shader.uniforms.uAtlasRows = { value: ATLAS_ROWS };

    shader.vertexShader =
      `
      attribute vec2 aUvCurrent;
      attribute vec2 aUvNext;
      attribute float aFlipProgress; // 0.0 = resting at top, 1.0 = fully flipped to bottom
      varying vec2 vAtlasUv;
      varying vec2 vLocalFlapUv;
      varying float vFaceIsBack;
      uniform float uAtlasCols;
      uniform float uAtlasRows;
    ` + shader.vertexShader;

    // 1. Physical hinge rotation around X axis at y = 0
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>

      // When at rest, collapse flap vertices so only the clean backing card renders
      if (aFlipProgress <= 0.001 || aFlipProgress >= 0.999) {
        transformed = vec3(0.0);
      } else {
        // Rotate position around local X axis by aFlipProgress * -PI
        float angle = aFlipProgress * -3.141592653589793;
        float cosA = cos(angle);
        float sinA = sin(angle);

        vec3 rotPos = transformed;
        rotPos.y = transformed.y * cosA - transformed.z * sinA;
        rotPos.z = transformed.y * sinA + transformed.z * cosA;
        transformed = rotPos;
      }
      `
    );

    // 2. Rotate normal for accurate PBR lighting
    shader.vertexShader = shader.vertexShader.replace(
      "#include <beginnormal_vertex>",
      `
      #include <beginnormal_vertex>
      if (aFlipProgress > 0.001 && aFlipProgress < 0.999) {
        float angleN = aFlipProgress * -3.141592653589793;
        float cosAN = cos(angleN);
        float sinAN = sin(angleN);

        vec3 rotNormal = objectNormal;
        rotNormal.y = objectNormal.y * cosAN - objectNormal.z * sinAN;
        rotNormal.z = objectNormal.y * sinAN + objectNormal.z * cosAN;
        objectNormal = rotNormal;
      }
      `
    );

    // 3. Compute Atlas UV based on front face vs back face
    shader.vertexShader = shader.vertexShader.replace(
      "#include <uv_vertex>",
      `
      #include <uv_vertex>
      vLocalFlapUv = uv;

      // normal.z in unrotated model space: >0 is front face, <0 is back face
      float isBack = (normal.z < -0.5) ? 1.0 : 0.0;
      vFaceIsBack = isBack;

      vec2 cellSize = vec2(1.0 / uAtlasCols, 1.0 / uAtlasRows);
      vec2 charCoord = (isBack > 0.5) ? aUvNext : aUvCurrent;

      float normU = (charCoord.x + uv.x) * cellSize.x;

      // uv.y ranges from 0.0 (hinge) to 1.0 (tip)
      // Front face: relative Y in [0.5, 1.0] (top half of current char)
      // Back face: relative Y in [0.5, 0.0] (bottom half of next char, reversed so it lands right-side up)
      float relY = (isBack > 0.5) ? (0.5 - 0.5 * uv.y) : (0.5 + 0.5 * uv.y);
      float normV = 1.0 - (charCoord.y + (1.0 - relY)) * cellSize.y;

      vAtlasUv = vec2(normU, normV);
      `
    );

    shader.fragmentShader =
      `
      varying vec2 vAtlasUv;
      varying vec2 vLocalFlapUv;
      varying float vFaceIsBack;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
      #ifdef USE_MAP
        vec4 sampledDiffuseColor = texture2D(map, vAtlasUv);
        diffuseColor *= sampledDiffuseColor;

        // Vintage station departure board backlit plate luminescence
        float isChar = step(0.35, sampledDiffuseColor.r);
        diffuseColor.rgb += vec3(1.0, 0.95, 0.86) * (isChar * 0.35);
      #endif

      // Edge vignette around flap boundary
      float edgeV = smoothstep(0.0, 0.04, min(vLocalFlapUv.x, 1.0 - vLocalFlapUv.x)) *
                    smoothstep(0.0, 0.04, min(vLocalFlapUv.y, 1.0 - vLocalFlapUv.y));
      diffuseColor.rgb *= (0.75 + 0.25 * edgeV);
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      `
      #include <emissivemap_fragment>
      #ifdef USE_MAP
        vec4 sampledForEmissive = texture2D(map, vAtlasUv);
        float isCharGlow = step(0.35, sampledForEmissive.r);
        totalEmissiveRadiance += vec3(1.0, 0.95, 0.85) * (isCharGlow * 0.55);
      #endif
      `
    );
  };

  return mat;
}
