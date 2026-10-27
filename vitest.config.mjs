import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: [
      "src/lib/calendar/**/*.test.ts",
      "src/lib/soundEngine.test.ts",
      "src/lib/cinemaCameraDamper.test.ts",
      "src/components/gen3/**/*.test.ts",
      "src/components/about/**/*.test.ts",
      "src/components/board/**/*.test.ts",
      "src/components/gallery-hero/**/*.test.ts",
      "src/components/guide-hero/station/**/*.test.ts",
      "src/components/suggestions/**/*.test.ts",
      "src/components/join/**/*.test.ts",
      "src/components/games/**/*.test.ts",
    ],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
