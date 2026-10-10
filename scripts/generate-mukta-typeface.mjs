import opentype from "opentype.js";
import fs from "fs";
import path from "path";

async function main() {
  const url = "https://raw.githubusercontent.com/google/fonts/main/ofl/muktamalar/MuktaMalar-Bold.ttf";
  console.log("Fetching MuktaMalar-Bold.ttf...");
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch font: " + res.status);
  const buffer = await res.arrayBuffer();

  const font = opentype.parse(buffer);
  const fontName = font.getEnglishName("fontFamily") || "Mukta Malar";
  console.log("Parsed font:", fontName);

  const glyphsToExport = ["அ", " ", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "T", "S", "M", "I", "L"];
  const glyphsObj = {};

  const scale = 1;
  for (const char of glyphsToExport) {
    const glyph = font.charToGlyph(char);
    if (!glyph) continue;

    const commands = glyph.path.commands;
    const cmdStrings = [];
    for (const cmd of commands) {
      if (cmd.type === "M") {
        cmdStrings.push(`m ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)}`);
      } else if (cmd.type === "L") {
        cmdStrings.push(`l ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)}`);
      } else if (cmd.type === "Q") {
        // Three.js FontLoader:
        // cpx = outline[i++]; cpy = outline[i++];
        // cpx1 = outline[i++]; cpy1 = outline[i++];
        // path.quadraticCurveTo(cpx1, cpy1, cpx, cpy);
        // Therefore: cpx/cpy is end point, cpx1/cpy1 is control point!
        cmdStrings.push(`q ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)} ${Math.round(cmd.x1 * scale)} ${Math.round(cmd.y1 * scale)}`);
      } else if (cmd.type === "C") {
        // Three.js FontLoader:
        // cpx = outline[i++]; cpy = outline[i++];
        // cpx1 = outline[i++]; cpy1 = outline[i++];
        // cpx2 = outline[i++]; cpy2 = outline[i++];
        // path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cpx, cpy);
        // Therefore: cpx/cpy is end point, cpx1/cpy1 is cp1, cpx2/cpy2 is cp2!
        cmdStrings.push(`b ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)} ${Math.round(cmd.x1 * scale)} ${Math.round(cmd.y1 * scale)} ${Math.round(cmd.x2 * scale)} ${Math.round(cmd.y2 * scale)}`);
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
    familyName: "Mukta Malar",
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
      postscript_name: font.names.postScriptName?.en || "MuktaMalar-Bold",
      version_string: font.names.version?.en || "Version 2.538",
    },
  };

  const outDir = path.resolve(process.cwd(), "public/fonts");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, "mukta-malar-tamil.json");
  fs.writeFileSync(outPath, JSON.stringify(typeface));
  console.log("Successfully wrote CORRECTED typeface JSON to:", outPath);
}

main().catch(console.error);
