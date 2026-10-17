import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 120_000,
    pool: "forks",
    // Each test file runs its own emulated machine; more than two at once
    // starves them of CPU on laptops and CI runners and causes timeouts.
    maxWorkers: 2,
  },
});
