// src/director/director.test.ts
import assert from "node:assert/strict";
import * as THREE from "three";
import { useDirectorStore } from "./directorStore";
import { isTyping } from "./keys";
import { registerScene, setWire, diagnosticWireMaterial } from "./wireframe";

console.log("=== Running Phase 4 Director Viewport Unit Tests (§6, §8) ===");

// 1. isTyping Guard Tests (WCAG 2.1.4 & Safety Layer)
const mockInput = { tagName: "INPUT", isContentEditable: false, closest: () => null } as unknown as HTMLElement;
const mockTextarea = { tagName: "TEXTAREA", isContentEditable: false, closest: () => null } as unknown as HTMLElement;
const mockSelect = { tagName: "SELECT", isContentEditable: false, closest: () => null } as unknown as HTMLElement;
const mockEditable = { tagName: "DIV", isContentEditable: true, closest: () => null } as unknown as HTMLElement;
const mockRoleTextbox = {
  tagName: "DIV",
  isContentEditable: false,
  closest: (sel: string) => sel.includes("textbox") ? {} : null,
} as unknown as HTMLElement;
const mockRegularDiv = {
  tagName: "DIV",
  isContentEditable: false,
  closest: () => null,
} as unknown as HTMLElement;
const mockButton = {
  tagName: "BUTTON",
  isContentEditable: false,
  closest: () => null,
} as unknown as HTMLElement;

assert.equal(isTyping(mockInput), true, "INPUT must be classified as typing");
assert.equal(isTyping(mockTextarea), true, "TEXTAREA must be classified as typing");
assert.equal(isTyping(mockSelect), true, "SELECT must be classified as typing");
assert.equal(isTyping(mockEditable), true, "contentEditable must be classified as typing");
assert.equal(isTyping(mockRoleTextbox), true, "role=textbox must be classified as typing");
assert.equal(isTyping(mockRegularDiv), false, "Standard DIV must NOT be classified as typing");
assert.equal(isTyping(mockButton), false, "BUTTON must NOT be classified as typing");
console.log("1. isTyping Guards: PASS (input elements strictly protected from accidental shortcuts)");

// 2. Initial State Test
const store = useDirectorStore.getState();
assert.equal(store.open, false, "Director HUD must be closed initially");
assert.equal(store.gradeOn, true, "Color Grade must default to true (film look)");
assert.equal(store.wire, false, "Wireframe must default to false (solid materials)");
console.log("2. Initial State: PASS (closed, gradeOn=true, wire=false)");

// 3. Activation & Toggles
store.toggleOpen();
assert.equal(useDirectorStore.getState().open, true, "toggleOpen must open HUD");

store.toggleGrade();
assert.equal(useDirectorStore.getState().gradeOn, false, "toggleGrade must switch gradeOn to false (RAW)");

store.toggleWire();
assert.equal(useDirectorStore.getState().wire, true, "toggleWire must switch wire to true");
assert.equal(useDirectorStore.getState().scanlineActive, true, "toggleWire must trigger scanlineActive wipe");

// 4. Reset on Close (§6.1)
store.close();
const closedState = useDirectorStore.getState();
assert.equal(closedState.open, false, "HUD must be closed");
assert.equal(closedState.gradeOn, true, "Closing HUD must reset gradeOn to true");
assert.equal(closedState.wire, false, "Closing HUD must reset wire to false");
console.log("3. Store Toggles & Reset on Close: PASS (closing HUD resets all toggles cleanly)");

// 5. Wireframe Material Registry & Restoration Test (§6.3)
const testScene = new THREE.Scene();
const originalMat1 = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const originalMat2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const customWireMat = new THREE.ShaderMaterial({ wireframe: true });

const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(), originalMat1);
const mesh2 = new THREE.Mesh(new THREE.SphereGeometry(), originalMat2);
mesh2.userData.wireMaterial = customWireMat; // Mesh with vertex-patch wire variant

const meshNoWire = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial());
meshNoWire.userData.noWire = true; // Decorative mesh flagged noWire

testScene.add(mesh1, mesh2, mockButton as unknown as THREE.Object3D, meshNoWire);

const unregister = registerScene(testScene);

// Enable Wireframe
setWire(true);
assert.equal(mesh1.material, diagnosticWireMaterial, "Mesh 1 must swap to unlit green wireMat (#00FF41)");
assert.equal(mesh2.material, customWireMat, "Mesh 2 must preserve its vertex-patch custom wireMaterial");
assert.notEqual(meshNoWire.material, diagnosticWireMaterial, "noWire mesh must NOT be converted to wireframe");

// Disable Wireframe
setWire(false);
assert.equal(mesh1.material, originalMat1, "Mesh 1 must be restored to its exact original material");
assert.equal(mesh2.material, originalMat2, "Mesh 2 must be restored to its exact original material");

unregister();
console.log("4. Wireframe Registry & Material Restoration: PASS (exact original materials restored)");

console.log("=== All Phase 4 Director Viewport Tests Passed Cleanly ===");
