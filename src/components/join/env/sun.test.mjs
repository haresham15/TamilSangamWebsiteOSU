import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  SUN_DIR,
  SUN_POS,
  SUN_DIST,
  SUN_ELEVATION_RAD,
  SUN_AZIMUTH_RAD,
  FOG_COLOR,
  SKY_MID,
  SKY_ZENITH,
  FOG_DENSITY,
} from "./sun.ts";

describe("Join Hero §3.1 — Sun Consistency & Mathematics", () => {
  test("SUN_DIR is normalized and matches 22° elevation, 45° azimuth", () => {
    assert.ok(Math.abs(SUN_DIR.length() - 1.0) < 1e-5, "SUN_DIR must be unit length");

    // Theoretical values:
    const expectedX = Math.cos(SUN_ELEVATION_RAD) * Math.sin(SUN_AZIMUTH_RAD);
    const expectedY = Math.sin(SUN_ELEVATION_RAD);
    const expectedZ = -Math.cos(SUN_ELEVATION_RAD) * Math.cos(SUN_AZIMUTH_RAD);
    const expectedLen = Math.hypot(expectedX, expectedY, expectedZ);

    assert.ok(Math.abs(SUN_DIR.x - expectedX / expectedLen) < 1e-4);
    assert.ok(Math.abs(SUN_DIR.y - expectedY / expectedLen) < 1e-4);
    assert.ok(Math.abs(SUN_DIR.z - expectedZ / expectedLen) < 1e-4);

    // Verify low morning sun (elevation ~ 22 deg => y ~ 0.37)
    assert.ok(SUN_DIR.y > 0.35 && SUN_DIR.y < 0.40, "Elevation must be low morning sun");
    // Verify sun is behind the gates (z < 0 in camera space where camera faces -Z)
    assert.ok(SUN_DIR.z < -0.6, "Sun must be back-right to backlight the gate bars");
  });

  test("SUN_POS is strictly SUN_DIR * SUN_DIST", () => {
    assert.strictEqual(SUN_DIST, 40);
    assert.ok(Math.abs(SUN_POS[0] - SUN_DIR.x * 40) < 1e-4);
    assert.ok(Math.abs(SUN_POS[1] - SUN_DIR.y * 40) < 1e-4);
    assert.ok(Math.abs(SUN_POS[2] - SUN_DIR.z * 40) < 1e-4);
  });

  test("Fog and Horizon Color Palette are strictly synchronized", () => {
    assert.strictEqual(FOG_COLOR, "#F4EEDD", "Horizon and Fog must both be #F4EEDD to prevent banding");
    assert.strictEqual(SKY_MID, "#F7E7C6");
    assert.strictEqual(SKY_ZENITH, "#9CC4E8");
    assert.strictEqual(FOG_DENSITY, 0.015);
  });
});
