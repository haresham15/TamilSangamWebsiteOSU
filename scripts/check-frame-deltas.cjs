const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
let frames = 0;

function checkSource(file, code) {
    const failures = [];
    const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(source) === "useFrame") {
        frames++;
        const callback = node.arguments[0];
        const location = `${path.relative(root, file)}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;
        const body = callback?.body;
        const first = body && ts.isBlock(body) && body.statements[0];
        if (callback?.parameters?.[1]?.name.getText(source) !== "delta" ||
            !first || first.getText(source).replace(/\s/g, "") !== "constdt=Math.min(delta,0.05);") {
          failures.push(`${location}: missing leading 50ms delta clamp`);
          return;
        }
        // Raw delta must not bypass the bound in an integration or damping call.
        let usesDt = false;
        function checkBounded(child) {
          if (child === first) return;
          if (ts.isIdentifier(child) && child.text === "delta") {
            failures.push(`${location}: raw delta used after clamp`);
          }
          if (ts.isIdentifier(child) && child.text === "dt") usesDt = true;
          ts.forEachChild(child, checkBounded);
        }
        checkBounded(body);
        if (!usesDt) failures.push(`${location}: bounded dt unused; guard nonpositive frames`);
        const bounded = new Function("delta", `${first.getText(source)} return dt;`);
        assert.equal(bounded(30), 0.05, `${location}: resumed frame exceeds 50ms`);
        assert.equal(bounded(1 / 60), 1 / 60, `${location}: normal frame changed`);
        assert.equal(bounded(0), 0, `${location}: zero frame changed`);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    return failures;
}

// Ensure checker catches absent, late, unused, and bypassed clamps before auditing source.
for (const code of [
  "useFrame((state, delta) => { position += delta; });",
  "useFrame((state, delta) => { position += delta; const dt = Math.min(delta, 0.05); });",
  "useFrame((state, delta) => { const dt = Math.min(delta, 0.05); position += delta; });",
  "useFrame((state, delta) => { const dt = Math.min(delta, 0.05); update(); });",
  "useFrame(namedCallback);",
]) assert.ok(checkSource("fixture.tsx", code).length > 0, "Unsafe fixture accepted");
for (const code of [
  "useFrame((state, delta) => { const dt = Math.min(delta, 0.05); position += dt; });",
  "useFrame((state, delta) => { const dt = Math.min(delta, 0.05); if (dt <= 0) return; update(); });",
]) assert.deepEqual(checkSource("fixture.tsx", code), [], "Bounded fixture rejected");
frames = 0;

const failures = [];
function inspect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) inspect(file);
    else if (/\.tsx?$/.test(file)) failures.push(...checkSource(file, fs.readFileSync(file, "utf8")));
  }
}

inspect(path.join(root, "src"));
assert.ok(frames > 0, "No R3F frame callbacks inspected");
assert.deepEqual(failures, [], failures.join("\n"));
console.log(`PASS: ${frames} R3F callbacks clamp resumed frames to 50ms; normal deltas preserved.`);
