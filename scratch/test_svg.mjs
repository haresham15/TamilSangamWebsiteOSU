import * as THREE from 'three';
import { SVGLoader } from 'three-stdlib';

const VIJAY_BODY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
  <path d="M 76,230 L 68,230 C 66,220 66,200 68,175 C 69,155 70,140 73,125 C 64,122 58,118 55,108 C 52,95 56,80 62,68 C 56,60 48,50 38,38 C 30,28 24,18 20,10 C 23,8 27,10 30,15 C 35,22 43,32 50,42 C 57,51 64,60 70,68 C 74,62 76,56 77,50 C 78,42 77,36 78,28 C 80,20 84,15 89,12 C 94,10 99,10 104,12 C 110,14 114,19 116,25 C 118,32 117,40 118,48 C 119,55 122,60 125,65 C 127,67 128,70 128,74 C 128,78 126,82 124,85 C 126,92 128,102 127,110 C 125,120 120,123 113,125 C 116,140 117,155 118,175 C 120,200 120,220 118,230 L 110,230 C 109,215 108,190 107,170 C 106,155 105,142 101,135 C 97,142 96,155 95,170 C 94,190 93,215 92,230 L 84,230 C 85,215 86,190 87,170 C 88,155 89,142 93,135 L 93,134 C 89,134 87,140 85,150 C 83,165 80,195 76,230 Z" />
</svg>`;

const loader = new SVGLoader();
try {
  const data = loader.parse(VIJAY_BODY_SVG);
  console.log('Parsed paths:', data.paths.length);
  const shapes = [];
  data.paths.forEach(p => {
    shapes.push(...SVGLoader.createShapes(p));
  });
  console.log('Created shapes:', shapes.length);
  if (shapes.length > 0) {
    const geom = new THREE.ExtrudeGeometry(shapes[0], { depth: 0.08, bevelEnabled: false });
    console.log('Geometry vertices count:', geom.attributes.position.count);
  }
} catch (e) {
  console.error('Error:', e);
}
