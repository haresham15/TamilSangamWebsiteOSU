import fs from "fs";
import path from "path";

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".next") results = results.concat(walk(full));
    } else if (/\.(tsx|ts|css)$/.test(file)) {
      results.push(full);
    }
  }
  return results;
}

const patterns = [
  /FAF4EC/i,
  /EDE2D4/i,
  /F7F3EE/i,
  /FFFDF9/i,
  /2A2825/i,
  /161210/i,
  /140F0D/i,
  /rgba?\(\s*22\s*,\s*18\s*,\s*16/i,
  /rgba?\(\s*42\s*,\s*40\s*,\s*37/i,
  /rgba?\(\s*168\s*,\s*72\s*,\s*36/i,
  /rgba?\(\s*200\s*,\s*90\s*,\s*50/i,
  /rgba?\(\s*184\s*,\s*92\s*,\s*56/i,
  /rgba?\(\s*35\s*,\s*21\s*,\s*12/i,
  /rgba?\(\s*33\s*,\s*22\s*,\s*14/i,
  /rgba?\(\s*37\s*,\s*24\s*,\s*18/i,
  /rgba?\(\s*42\s*,\s*26\s*,\s*18/i,
  /rgba?\(\s*20\s*,\s*15\s*,\s*13/i
];

const files = walk("src");
const hits = [];
for (const f of files) {
  // Check if it's one of the 4 exempted 3D props
  const isExempted = /CholaCrown3D|CameraBody|Compass|TinTrunk/.test(f);
  const content = fs.readFileSync(f, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    for (const p of patterns) {
      if (p.test(line)) {
        hits.push({ file: f, line: i + 1, text: line.trim(), isExempted });
        break;
      }
    }
  });
}

console.log(`Found ${hits.length} total hits (${hits.filter(h => !h.isExempted).length} unexempted):`);
for (const h of hits) {
  if (!h.isExempted) {
    console.log(`${h.file}:${h.line} -> ${h.text}`);
  }
}

