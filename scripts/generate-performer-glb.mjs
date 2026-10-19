import * as THREE from "three";
import fs from "fs";
import path from "path";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      });
    }
  };
}

const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");

// Build a stylized rigged silhouette performer mesh
const root = new THREE.Group();
root.name = "PerformerScene";

// Create SkinnedMesh with bones
// Height ~ 1.8m
const bones = [];

const hips = new THREE.Bone();
hips.name = "Hips";
hips.position.set(0, 0.95, 0);
bones.push(hips);

const spine = new THREE.Bone();
spine.name = "Spine";
spine.position.set(0, 0.25, 0);
hips.add(spine);
bones.push(spine);

const chest = new THREE.Bone();
chest.name = "Chest";
chest.position.set(0, 0.25, 0);
spine.add(chest);
bones.push(chest);

const neck = new THREE.Bone();
neck.name = "Neck";
neck.position.set(0, 0.15, 0);
chest.add(neck);
bones.push(neck);

const head = new THREE.Bone();
head.name = "Head";
head.position.set(0, 0.15, 0);
neck.add(head);
bones.push(head);

// Left Arm
const leftShoulder = new THREE.Bone();
leftShoulder.name = "LeftShoulder";
leftShoulder.position.set(-0.18, 0.12, 0);
chest.add(leftShoulder);
bones.push(leftShoulder);

const leftArm = new THREE.Bone();
leftArm.name = "LeftArm";
leftArm.position.set(-0.15, -0.05, 0);
leftShoulder.add(leftArm);
bones.push(leftArm);

const leftForeArm = new THREE.Bone();
leftForeArm.name = "LeftForeArm";
leftForeArm.position.set(-0.25, 0, 0);
leftArm.add(leftForeArm);
bones.push(leftForeArm);

const leftHand = new THREE.Bone();
leftHand.name = "LeftHand";
leftHand.position.set(-0.2, 0, 0);
leftForeArm.add(leftHand);
bones.push(leftHand);

// Right Arm
const rightShoulder = new THREE.Bone();
rightShoulder.name = "RightShoulder";
rightShoulder.position.set(0.18, 0.12, 0);
chest.add(rightShoulder);
bones.push(rightShoulder);

const rightArm = new THREE.Bone();
rightArm.name = "RightArm";
rightArm.position.set(0.15, -0.05, 0);
rightShoulder.add(rightArm);
bones.push(rightArm);

const rightForeArm = new THREE.Bone();
rightForeArm.name = "RightForeArm";
rightForeArm.position.set(0.25, 0, 0);
rightArm.add(rightForeArm);
bones.push(rightForeArm);

const rightHand = new THREE.Bone();
rightHand.name = "RightHand";
rightHand.position.set(0.2, 0, 0);
rightForeArm.add(rightHand);
bones.push(rightHand);

// Left Leg
const leftUpLeg = new THREE.Bone();
leftUpLeg.name = "LeftUpLeg";
leftUpLeg.position.set(-0.12, -0.05, 0);
hips.add(leftUpLeg);
bones.push(leftUpLeg);

const leftLeg = new THREE.Bone();
leftLeg.name = "LeftLeg";
leftLeg.position.set(0, -0.45, 0);
leftUpLeg.add(leftLeg);
bones.push(leftLeg);

const leftFoot = new THREE.Bone();
leftFoot.name = "LeftFoot";
leftFoot.position.set(0, -0.45, 0.1);
leftLeg.add(leftFoot);
bones.push(leftFoot);

// Right Leg
const rightUpLeg = new THREE.Bone();
rightUpLeg.name = "RightUpLeg";
rightUpLeg.position.set(0.12, -0.05, 0);
hips.add(rightUpLeg);
bones.push(rightUpLeg);

const rightLeg = new THREE.Bone();
rightLeg.name = "RightLeg";
rightLeg.position.set(0, -0.45, 0);
rightUpLeg.add(rightLeg);
bones.push(rightLeg);

const rightFoot = new THREE.Bone();
rightFoot.name = "RightFoot";
rightFoot.position.set(0, -0.45, 0.1);
rightLeg.add(rightFoot);
bones.push(rightFoot);

root.add(hips);

const skeleton = new THREE.Skeleton(bones);

// Create cylinder geometry with skinning attributes
const geometry = new THREE.CylinderGeometry(0.22, 0.18, 1.8, 16, 24, true);
geometry.translate(0, 0.9, 0);

// Skin indices and weights
const position = geometry.attributes.position;
const skinIndices = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
  const y = position.getY(i);
  if (y < 0.45) {
    // Legs
    skinIndices.push(14, 15, 0, 0);
    skinWeights.push(0.6, 0.4, 0, 0);
  } else if (y < 0.95) {
    // Hips
    skinIndices.push(0, 1, 0, 0);
    skinWeights.push(0.7, 0.3, 0, 0);
  } else if (y < 1.45) {
    // Spine & Chest
    skinIndices.push(1, 2, 0, 0);
    skinWeights.push(0.5, 0.5, 0, 0);
  } else {
    // Neck & Head
    skinIndices.push(3, 4, 0, 0);
    skinWeights.push(0.4, 0.6, 0, 0);
  }
}

geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndices, 4));
geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));

const material = new THREE.MeshStandardMaterial({
  color: 0x141210,
  roughness: 0.35,
  metalness: 0.85,
});

const skinnedMesh = new THREE.SkinnedMesh(geometry, material);
skinnedMesh.name = "PerformerMesh";
skinnedMesh.add(bones[0]);
skinnedMesh.bind(skeleton);
root.add(skinnedMesh);

// Create dance_loop animation track
const times = [0, 0.5, 1.0, 1.5, 2.0];
const hipsYValues = [0.95, 0.91, 0.95, 0.91, 0.95];
const trackHipsY = new THREE.VectorKeyframeTrack("Hips.position", times, [
  0, 0.95, 0,
  0, 0.91, 0,
  0, 0.95, 0,
  0, 0.91, 0,
  0, 0.95, 0
]);

const clip = new THREE.AnimationClip("dance_loop", 2.0, [trackHipsY]);

// Export as GLB
const exporter = new GLTFExporter();
await new Promise((resolve, reject) => {
  exporter.parse(
    root,
    (gltf) => {
      const outputPath = path.resolve("./public/models/performer.glb");
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, Buffer.from(gltf));
      console.log("Successfully generated:", outputPath, gltf.byteLength, "bytes");
      resolve(gltf);
    },
    (error) => {
      console.error("Export error:", error);
      reject(error);
    },
    { binary: true, animations: [clip] }
  );
});
