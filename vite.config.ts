import { resolve } from "node:path";
import { defineConfig } from "vite";
import { challengesPlugin } from "./scripts/vite-plugin-challenges.ts";

export default defineConfig({
  plugins: [challengesPlugin()],
  build: {
    rollupOptions: {
      input: {
        engine: resolve(import.meta.dirname, "dev/engine.html"),
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: [".trycloudflare.com"],
  },
});