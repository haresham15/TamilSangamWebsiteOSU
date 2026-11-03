import fs from 'node:fs';
import path from 'node:path';

const BROWN_HEXES = [
  'FAF9F6', 'FAF6F0', 'FAF7F2', 'F5F2EB', 'F4EFE6', 'F4EFEA', 'F2EAE0', 'E8DEC8', 'EFE6DA', 'EFECE6', 'E5DDD0', 'F5ECE1', 'FAF8F5', 'FDFBF7', 'F5EBE1',
  '161210', '1A1614', '120D0B', '14110F', '2A2825', '241D1A', '1E1916', '221C18', '2D241E', '322822',
  '57524C', '6B655D', '8C827A', '7A7067',
  'B85C38', 'C85A32', 'A04A27', 'D35400',
  'E5A93C', 'D6972B', 'D99B26', 'D4AF37', 'FFB84D', 'FFE8A3', 'FFB366', 'FFF0BD', 'FFE6B8', 'FFF8EB', 'FFD074', 'FFE8C2'
].map(h => h.toUpperCase());

const regex = new RegExp('#(' + BROWN_HEXES.join('|') + ')', 'gi');

function scanDir(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(entry.name)) {
        scanDir(fullPath, results);
      }
    } else if (/\.(tsx?|jsx?|css|json)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const matches = line.match(regex);
        if (matches) {
          results.push({ file: fullPath, line: idx + 1, text: line.trim(), matches });
        }
      });
    }
  }
  return results;
}

const hits = scanDir('src');
console.log(`Found ${hits.length} brown/tan occurrences across src/:`);
const fileGroups = {};
for (const hit of hits) {
  const rel = path.relative(process.cwd(), hit.file);
  fileGroups[rel] = (fileGroups[rel] || 0) + hit.matches.length;
}

console.log('Files with counts:');
for (const [file, count] of Object.entries(fileGroups)) {
  console.log(`  ${file}: ${count}`);
}

