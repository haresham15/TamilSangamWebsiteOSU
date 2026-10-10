// scripts/generate-tamil-typeface.mjs
import fs from "fs";
import path from "path";
import opentype from "opentype.js";

async function main() {
  const fontUrl = "https://fonts.gstatic.com/s/notoseriftamil/v31/LYjndHr-klIgTfc40komjQ5OObazYp-6H94dBF-RX6nNRJfi-Gf55IgAecatU9iR8A.ttf";
  console.log("Fetching Noto Serif Tamil Bold TTF...");
  const res = await fetch(fontUrl);
  if (!res.ok) throw new Error("Failed to fetch font: " + res.status);
  const buffer = await res.arrayBuffer();

  const font = opentype.parse(buffer);
  const fontName = font.getEnglishName("fontFamily") || "Noto Serif Tamil";
  console.log("Parsed font:", fontName);

  const glyphsToExport = ["அ", " ", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "T"];
  const glyphsObj = {};

  const scale = 1;
  for (const char of glyphsToExport) {
    const glyph = font.charToGlyph(char);
    if (!glyph) continue;

    // Use raw glyph.path.commands so TrueType Y-up orientation is preserved for Three.js FontLoader
    const commands = glyph.path.commands;

    // Convert opentype commands to Three.js typeface commands string
    const cmdStrings = [];
    for (const cmd of commands) {
      if (cmd.type === "M") {
        cmdStrings.push(`m ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)}`);
      } else if (cmd.type === "L") {
        cmdStrings.push(`l ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)}`);
      } else if (cmd.type === "Q") {
        cmdStrings.push(`q ${Math.round(cmd.x1 * scale)} ${Math.round(cmd.y1 * scale)} ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)}`);
      } else if (cmd.type === "C") {
        cmdStrings.push(`b ${Math.round(cmd.x1 * scale)} ${Math.round(cmd.y1 * scale)} ${Math.round(cmd.x2 * scale)} ${Math.round(cmd.y2 * scale)} ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)}`);
      } else if (cmd.type === "Z") {
        // Z is implicit in three.js or handled by next M
      }
    }

    const bbox = glyph.getBoundingBox();
    glyphsObj[char] = {
      ha: Math.round(glyph.advanceWidth * scale),
      x_min: Math.round(bbox.x1 * scale),
      x_max: Math.round(bbox.x2 * scale),
      o: cmdStrings.join(" "),
    };
  }

  const typeface = {
    glyphs: glyphsObj,
    familyName: "Noto Serif Tamil",
    ascender: Math.round(font.ascender * scale),
    descender: Math.round(font.descender * scale),
    underlinePosition: -100,
    underlineThickness: 50,
    boundingBox: {
      yMin: Math.round(font.tables.head.yMin * scale),
      xMin: Math.round(font.tables.head.xMin * scale),
      yMax: Math.round(font.tables.head.yMax * scale),
      xMax: Math.round(font.tables.head.xMax * scale),
    },
    resolution: font.unitsPerEm,
    original_font_information: {
      format: "truetype",
      postscript_name: font.names.postScriptName?.en || "NotoSerifTamil-Bold",
      version_string: font.names.version?.en || "Version 3.001",
    },
  };

  const outDir = path.resolve(process.cwd(), "public/fonts");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, "noto-serif-tamil.json");
  fs.writeFileSync(outPath, JSON.stringify(typeface));
  console.log("Successfully wrote typeface JSON to:", outPath);
}

main().catch(console.error);
