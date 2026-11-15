import { describe, expect, it } from "vitest";
import { createIdentityLut, stripToVolume } from "./useGradeLut";

/** Builds a strip in scripts/make-heritage-lut.mjs layout: x = b·size + r, y = g. */
function identityStrip(size: number) {
  const width = size * size;
  const strip = new Uint8Array(width * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      strip[i] = Math.round(((x % size) / (size - 1)) * 255);
      strip[i + 1] = Math.round((y / (size - 1)) * 255);
      strip[i + 2] = Math.round((Math.floor(x / size) / (size - 1)) * 255);
      strip[i + 3] = 255;
    }
  return strip;
}

describe("stripToVolume", () => {
  it("reorders an identity strip into the identity volume (r fastest, then g, then b)", () => {
    const size = 5;
    const volume = stripToVolume(identityStrip(size), size);
    const identity = createIdentityLut(size).image.data as Uint8Array;
    expect(Array.from(volume)).toEqual(Array.from(identity));
  });

  it("maps a known texel: strip (x = b·size + r, y = g) → volume r + g·size + b·size²", () => {
    const size = 3;
    const strip = new Uint8Array(size * size * size * 4);
    const r = 2, g = 1, b = 2;
    const src = (g * size * size + b * size + r) * 4;
    strip.set([10, 20, 30, 255], src);
    const volume = stripToVolume(strip, size);
    const dst = (r + g * size + b * size * size) * 4;
    expect(Array.from(volume.slice(dst, dst + 4))).toEqual([10, 20, 30, 255]);
  });
});
